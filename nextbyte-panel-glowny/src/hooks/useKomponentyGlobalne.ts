import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * WSTRZYKIWANIE TOKENÓW KOMPONENTÓW GLOBALNYCH (wersja `live`).
 *
 * Administrator kręci wartościami w Zarządzie → Biblioteka komponentów, publikuje, i cała
 * platforma korzysta. Ten hook jest drugą połową tej drogi.
 *
 * Wzorowany na `useGlobalTheme`, bo problem jest ten sam: zmienne muszą stanąć
 * PRZED pierwszym rysowaniem, inaczej użytkownik widzi mignięcie starego
 * wyglądu. Dlatego cache z localStorage nakłada się synchronicznie, a baza
 * dopiero potem go odświeża.
 *
 * DLACZEGO TO JEST BEZPIECZNE, GDY WSZYSTKO PADNIE
 * Każdy token ma w `index.css` wartość zapasową w `var(--nb-…, X)` równą tej,
 * która była tam wpisana na sztywno. Pusta tabela, brak sieci, błąd RLS,
 * wyłączony JavaScript — wygląd wraca do dzisiejszego. Ten hook niczego nie
 * musi „naprawiać", bo brak danych to poprawny stan.
 *
 * DLACZEGO SPRAWDZAM NAZWY I WARTOŚCI PO STRONIE KLIENTA
 * W bazie stoi `CHECK (token ~ '^--nb-[a-z0-9-]+$')`, więc wiersz nie może
 * nazwać się `--foreground` i przemalować całego motywu. Powtarzam to tutaj,
 * bo `setProperty` wykonuje się na `documentElement` i jest to jedyne miejsce,
 * w którym dane z bazy stają się stylem — pojedyncze zabezpieczenie na takiej
 * granicy to za mało. Wartość też jest sprawdzana: CSS przy błędnej wartości
 * NIE zgłasza błędu, tylko cicho pomija regułę, więc literówka w bazie
 * objawiłaby się jako „wygląd nagle inny", bez śladu w konsoli.
 */

/* Wersja w kluczu, bo cache z 13.08.2026 trzyma tokeny BEZ jednostek —
   wczytany po naprawie nadal zdejmowałby szkło do czasu odświeżenia z bazy. */
const KLUCZ = 'nextbyte_tokeny_komponentow_v2';
const KLUCZ_WAZNOSC = 'nextbyte_tokeny_komponentow_v2_waznosc';
const WAZNOSC_MS = 5 * 60 * 1000;

interface Token {
  token: string;
  wartosc: string;
  /** Jednostka trzymana OSOBNO — patrz `zJednostka` niżej. */
  jednostka?: string | null;
}

/**
 * Skleja wartość z jednostką, jeśli w bazie leżą osobno.
 *
 * ZMIERZONA REGRESJA (13.08.2026): tokeny materiału szkła wjechały do bazy
 * z wartością `8.8` i jednostką `px` w osobnej kolumnie. Ten hook brał samą
 * wartość, więc na `documentElement` lądowało `--nb-szklo-rozmycie: 8.8`,
 * a CSS ma `blur(var(--nb-szklo-rozmycie, 8.8px))`. `blur(8.8)` jest
 * NIEPRAWIDŁOWE, a przy nieprawidłowej wartości przeglądarka odrzuca CAŁĄ
 * deklarację `backdrop-filter` — nie „słabsze szkło", tylko żadne.
 * Zmierzone: 12 szyb na stronie, 0 z działającym filtrem.
 *
 * Wartości zapisane z suwaka mają jednostkę już w środku (`zJednostka`
 * w panelu), więc doklejamy tylko wtedy, gdy jej brakuje — inaczej powstałoby
 * `8.8pxpx`.
 */
function zJednostka(t: Token): string {
  const w = (t.wartosc ?? '').trim();
  const j = (t.jednostka ?? '').trim();
  if (!j || w.endsWith(j)) return w;
  return `${w}${j}`;
}

/** Tylko `--nb-*`. Nic innego nie ma prawa dotknąć `documentElement`. */
const NAZWA_OK = /^--nb-[a-z0-9-]+$/;

/**
 * Liczba, ewentualnie z jednostką px/rem/s/ms. Świadomie NIE dopuszczam
 * dowolnego tekstu: wartość typu `red; background: url(...)` nie zadziała
 * przez setProperty, ale wpuszczanie czegokolwiek do stylu bez potrzeby
 * to zbędne ryzyko, a kręcimy tu wyłącznie liczbami.
 */
const WARTOSC_OK = /^-?\d+(\.\d+)?(px|rem|s|ms|%)?$/;

function nalozTokeny(tokeny: Token[]) {
  const root = document.documentElement;
  for (const t of tokeny) {
    const token = t.token;
    const wartosc = zJednostka(t);
    if (!NAZWA_OK.test(token) || !WARTOSC_OK.test(wartosc)) {
      console.warn('[Komponenty] Pominięto token o nieprawidłowym kształcie', { token, wartosc });
      continue;
    }
    root.style.setProperty(token, wartosc);
  }
}

function zCache(): Token[] | null {
  try {
    const waznosc = localStorage.getItem(KLUCZ_WAZNOSC);
    if (!waznosc || Date.now() >= Number(waznosc)) return null;
    const dane = localStorage.getItem(KLUCZ);
    return dane ? (JSON.parse(dane) as Token[]) : null;
  } catch {
    return null;
  }
}

function doCache(tokeny: Token[]) {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(tokeny));
    localStorage.setItem(KLUCZ_WAZNOSC, String(Date.now() + WAZNOSC_MS));
  } catch {
    // Brak miejsca albo tryb prywatny — cache jest wygodą, nie warunkiem.
  }
}

/** Czyści cache, żeby następne wejście wzięło świeże wartości z bazy. */
export function wyczyscCacheTokenow() {
  try {
    localStorage.removeItem(KLUCZ);
    localStorage.removeItem(KLUCZ_WAZNOSC);
  } catch {
    /* nieistotne */
  }
}

export const useKomponentyGlobalne = () => {
  useEffect(() => {
    // 1) Cache synchronicznie — zanim cokolwiek pójdzie do sieci.
    const cache = zCache();
    if (cache) nalozTokeny(cache);

    let anulowane = false;

    const wczytaj = async () => {
      const { data, error } = await supabase
        .from('component_tokens' as any)
        .select('token, wartosc, jednostka')
        .eq('wersja', 'live');

      if (anulowane) return;

      if (error) {
        // Świadomie NIE czyszczę tego, co nałożył cache: stare opublikowane
        // wartości są bliższe prawdy niż nagły powrót do wartości zapasowych
        // w środku sesji użytkownika.
        console.warn('[Komponenty] Nie udało się wczytać tokenów live', error.message);
        return;
      }

      const tokeny = (data ?? []) as unknown as Token[];
      if (tokeny.length === 0) return; // pusta tabela = wartości zapasowe, poprawny stan
      nalozTokeny(tokeny);
      doCache(tokeny);
    };

    wczytaj();

    // Publikacja z Zarządu woła to zdarzenie, żeby administrator zobaczył
    // skutek bez przeładowania strony.
    const naPublikacje = () => {
      wyczyscCacheTokenow();
      wczytaj();
    };
    window.addEventListener('komponentyOpublikowane', naPublikacje);

    return () => {
      anulowane = true;
      window.removeEventListener('komponentyOpublikowane', naPublikacje);
    };
  }, []);
};
