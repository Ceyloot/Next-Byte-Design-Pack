import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  CO SIĘ TERAZ DZIEJE — ZADANIA W TOKU Z CAŁEJ PLATFORMY
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „jak ktoś generuje wideo, zdjęcia, chat AI odpowiada, asystent robi
 * coś w tle (…) idąc do innej zakładki może tam podejrzeć, jak sytuacja
 * wygląda, a po kliknięciu przenosi dokładnie w to miejsce".
 *
 * ── DLACZEGO SCALANIE, A NIE NOWA TABELA ────────────────────────────────
 * Każde z tych zadań JUŻ gdzieś siedzi, tylko każde osobno:
 *   `background_tasks`         — zadania czatu w tle (jedyne z paskiem postępu)
 *   `photo_studio_jobs`        — generowanie obrazów (1088 zakończonych)
 *   `studio_video_generations` — generowanie wideo
 * Dokładanie czwartej tabeli i przepisywanie trzech funkcji brzegowych to
 * osobna, duża robota. Tu scalamy to, co jest — a gdy kiedyś wszystko zacznie
 * pisać do `background_tasks`, ten hak skurczy się do jednego zapytania.
 *
 * ── MAPOWANIE STATUSÓW JEST ODPORNE, NIE ZGADYWANE ──────────────────────
 * Trzy źródła mówią trzema słownikami: `completed`/`success`, `failed`/`error`.
 * Wypisujemy WYŁĄCZNIE wartości końcowe, a wszystko inne traktujemy jako
 * „w toku". Dzięki temu status, którego jeszcze nie widzieliśmy (bo akurat nic
 * się nie generowało w chwili sprawdzania), pokaże się jako trwający zamiast
 * zniknąć z listy.
 */

export type StanZadania = 'trwa' | 'gotowe' | 'blad' | 'anulowane';
export type ZrodloZadania = 'czat' | 'zdjecia' | 'wideo';

export interface ZadanieWToku {
  id: string;
  zrodlo: ZrodloZadania;
  tytul: string;
  stan: StanZadania;
  /** 0–100. `null` gdy źródło nie raportuje postępu — wtedy rysujemy puls, nie pasek. */
  postep: number | null;
  opisPostepu: string | null;
  blad: string | null;
  /** Dokąd przenieść po kliknięciu. */
  dokad: string;
  kiedy: string;
}

/** Zakończone znikają same po tym czasie — tak jak w `useBackgroundTasks`. */
const OKNO_ZAKONCZONYCH_MS = 6 * 60 * 60 * 1000;

const KLUCZ_ODRZUCONYCH = 'nb-zadania-odrzucone';

const KONCOWE_UDANE = new Set(['completed', 'success', 'done', 'finished']);
const KONCOWE_BLEDNE = new Set(['failed', 'error']);
const KONCOWE_ANULOWANE = new Set(['cancelled', 'canceled']);
const W_TOKU = new Set(['pending', 'generating', 'queued', 'running', 'processing', 'in_progress', 'started']);

/** Po tym czasie zadanie o NIEZNANYM statusie przestaje uchodzić za trwające. */
const SUFIT_TRWANIA_MS = 30 * 60 * 1000;

/**
 * Status → stan, z zabezpieczeniem przed wiecznym kręciołkiem.
 *
 * Pierwsza wersja miała regułę „cokolwiek nieznanego = trwa" i to był błąd
 * klasy, nie literówka: wiersz z nietypowym albo pustym statusem kręciłby się
 * w nieskończoność, a użytkownik czekałby na coś, co dawno się skończyło.
 * Zobaczyłem to na własnym podglądzie — pozycja pokazała się jako trwająca
 * mimo statusu końcowego w bazie.
 *
 * Teraz obie strony są WYPISANE, a nieznany status rozstrzyga WIEK: świeży
 * (do 30 minut) może jeszcze pracować, stary na pewno już nie. Dzięki temu
 * nowy status, którego jeszcze nie znamy, przez pół godziny zachowa się
 * sensownie, a potem sam przestanie udawać pracę.
 */
function naStan(status: string | null | undefined, kiedy?: string | null): StanZadania {
  const s = (status || '').toLowerCase().trim();
  if (KONCOWE_UDANE.has(s)) return 'gotowe';
  if (KONCOWE_BLEDNE.has(s)) return 'blad';
  if (KONCOWE_ANULOWANE.has(s)) return 'anulowane';
  if (W_TOKU.has(s)) return 'trwa';

  const wiek = kiedy ? Date.now() - new Date(kiedy).getTime() : Number.POSITIVE_INFINITY;
  return wiek < SUFIT_TRWANIA_MS ? 'trwa' : 'gotowe';
}

/** Skraca prompt do etykiety — w kolumnie 240 px i tak zmieści się jedno zdanie. */
function naTytul(tekst: string | null | undefined, zapasowy: string): string {
  const t = (tekst || '').trim().replace(/\s+/g, ' ');
  if (!t) return zapasowy;
  return t.length > 80 ? `${t.slice(0, 79)}…` : t;
}

/* ── ODRZUCANIE PO STRONIE PRZEGLĄDARKI ──────────────────────────────────
   „X" nie może kasować wiersza w `photo_studio_jobs` ani
   `studio_video_generations` — to historia generowań użytkownika, widoczna
   w galeriach studiów. Zamknięcie ma chować pozycję Z TEJ LISTY, nie usuwać
   dorobku. Dlatego odrzucone trzymamy lokalnie i czyścimy po dobie, żeby
   klucz nie puchł w nieskończoność. */
function wczytajOdrzucone(): Record<string, number> {
  try {
    const surowe = JSON.parse(localStorage.getItem(KLUCZ_ODRZUCONYCH) || '{}');
    const granica = Date.now() - 24 * 60 * 60 * 1000;
    const zywe: Record<string, number> = {};
    for (const [id, czas] of Object.entries(surowe)) {
      if (typeof czas === 'number' && czas > granica) zywe[id] = czas;
    }
    return zywe;
  } catch {
    return {};
  }
}

export function useZadaniaWToku() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const userId = user?.id;
  const [odrzucone, setOdrzucone] = useState<Record<string, number>>(() => wczytajOdrzucone());

  const odKiedy = useMemo(
    () => new Date(Date.now() - OKNO_ZAKONCZONYCH_MS).toISOString(),
    // Przeliczamy raz na montaż — granica przesuwałaby się co render i psuła cache.
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const zapytanie = useQuery({
    queryKey: ['zadania-w-toku', userId],
    enabled: !!userId,
    staleTime: 10_000,
    queryFn: async (): Promise<ZadanieWToku[]> => {
      const [tlo, zdjecia, wideo] = await Promise.all([
        supabase
          .from('background_tasks')
          .select('id, kind, status, conversation_id, progress, progress_label, error, result, created_at')
          .eq('user_id', userId!)
          .or(`status.in.(queued,running),created_at.gte.${odKiedy}`)
          .order('created_at', { ascending: false })
          .limit(20),
        (supabase as any)
          .from('photo_studio_jobs')
          .select('id, status, prompt, created_at')
          .eq('user_id', userId!)
          .or(`status.in.(pending,generating),created_at.gte.${odKiedy}`)
          .order('created_at', { ascending: false })
          .limit(20),
        (supabase as any)
          .from('studio_video_generations')
          .select('id, status, prompt, error_message, created_at')
          .eq('user_id', userId!)
          .gte('created_at', odKiedy)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const zebrane: ZadanieWToku[] = [];

      for (const t of (tlo.data ?? [])) {
        /* `result` jest w typach `Json`, więc TypeScript nie wie, że siedzi tam
           `title`. Zawężamy jawnie zamiast `as any` — pole bywa też stringiem
           albo tablicą i wtedy tytułu po prostu nie ma. */
        const wynik = (t.result && typeof t.result === 'object' && !Array.isArray(t.result))
          ? (t.result as { title?: string | null })
          : null;
        zebrane.push({
          id: `tlo:${t.id}`,
          zrodlo: 'czat',
          tytul: naTytul(wynik?.title ?? t.progress_label, 'Zadanie w tle'),
          stan: naStan(t.status, t.created_at),
          postep: typeof t.progress === 'number' ? t.progress : null,
          opisPostepu: t.progress_label ?? null,
          blad: t.error ?? null,
          dokad: t.conversation_id ? `/chat-ai?conversation=${t.conversation_id}` : '/chat-ai',
          kiedy: t.created_at,
        });
      }

      for (const j of ((zdjecia as any).data ?? [])) {
        zebrane.push({
          id: `foto:${j.id}`,
          zrodlo: 'zdjecia',
          tytul: naTytul(j.prompt, 'Generowanie obrazu'),
          stan: naStan(j.status, j.created_at),
          postep: null,
          opisPostepu: null,
          blad: null,
          dokad: '/studio-zdjec',
          kiedy: j.created_at,
        });
      }

      for (const w of ((wideo as any).data ?? [])) {
        zebrane.push({
          id: `wideo:${w.id}`,
          zrodlo: 'wideo',
          tytul: naTytul(w.prompt, 'Generowanie wideo'),
          stan: naStan(w.status, w.created_at),
          postep: null,
          opisPostepu: null,
          blad: w.error_message ?? null,
          dokad: '/studio-video',
          kiedy: w.created_at,
        });
      }

      return zebrane.sort((a, b) => +new Date(b.kiedy) - +new Date(a.kiedy));
    },
  });

  const wszystkie = zapytanie.data ?? [];
  const widoczne = wszystkie.filter((z) => !odrzucone[z.id]);
  const aktywne = widoczne.filter((z) => z.stan === 'trwa');
  const zakonczone = widoczne.filter((z) => z.stan !== 'trwa');

  /* Nazwa kanału UNIKALNA DLA INSTANCJI — i to jest naprawa błędu, nie ozdoba.
     Wcześniej nazwa brzmiała `zadania-w-toku-${userId}`, a hak bywał wołany
     dwa razy naraz (pasek dla odznaki + otwarta karta dla listy). Dwa
     wywołania tworzyły kanał o TYM SAMYM temacie na jednym gnieździe, więc
     zamknięcie panelu wysyłało „leave" dla tematu i wyłączało nasłuch także
     tej drugiej instancji. Objaw, który zgłosił Michał: „animacja włącza się
     dopiero po wejściu w to zamiast realtime od razu" — bo dopiero ponowne
     zamontowanie karty odświeżało dane.
     Instancji jest teraz jedna (patrz `PasekKart`), ale losowy przyrostek
     zostaje jako zabezpieczenie: gdyby ktoś kiedyś zawołał hak drugi raz,
     kanały się nie pobiją. */
  const idKanalu = useRef(Math.random().toString(36).slice(2, 10));

  /* Odświeżanie z realtime. Bez tego pasek postępu stałby w miejscu do czasu
     ręcznego wejścia w kartę — a cała wartość tej zakładki polega na tym, że
     widać zmianę BEZ patrzenia. */
  useEffect(() => {
    if (!userId) return;
    const odswiez = () => qc.invalidateQueries({ queryKey: ['zadania-w-toku', userId] });
    const kanal = supabase
      .channel(`zadania-w-toku-${userId}-${idKanalu.current}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'background_tasks', filter: `user_id=eq.${userId}` }, odswiez)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_studio_jobs', filter: `user_id=eq.${userId}` }, odswiez)
      /* UWAGA: `studio_video_generations` NIE JEST w publikacji `supabase_realtime`
         — sprawdzone w bazie 19.08. Ta subskrypcja jest więc dziś MARTWA i nic
         nie dostarcza; zostaje, bo zacznie działać w sekundzie, w której tabela
         trafi do publikacji (jedna linia SQL, przekazana Michałowi). Do tego
         czasu wideo pojawia się na liście przy najbliższym odświeżeniu. */
      .on('postgres_changes', { event: '*', schema: 'public', table: 'studio_video_generations', filter: `user_id=eq.${userId}` }, odswiez)
      .subscribe();
    return () => { supabase.removeChannel(kanal); };
  }, [userId, qc]);

  /* Siatka bezpieczeństwa na zerwane realtime — odpytujemy TYLKO gdy coś
     faktycznie trwa, żeby nie robić zapytania co 5 s u każdego zalogowanego. */
  useEffect(() => {
    if (aktywne.length === 0) return;
    const t = setInterval(() => qc.invalidateQueries({ queryKey: ['zadania-w-toku', userId] }), 8000);
    return () => clearInterval(t);
  }, [aktywne.length, qc, userId]);

  const zapisz = useCallback((nowe: Record<string, number>) => {
    setOdrzucone(nowe);
    try { localStorage.setItem(KLUCZ_ODRZUCONYCH, JSON.stringify(nowe)); } catch {}
  }, []);

  const odrzuc = useCallback((id: string) => {
    zapisz({ ...odrzucone, [id]: Date.now() });
  }, [odrzucone, zapisz]);

  const odrzucZakonczone = useCallback(() => {
    const teraz = Date.now();
    const nowe = { ...odrzucone };
    for (const z of zakonczone) nowe[z.id] = teraz;
    zapisz(nowe);
  }, [odrzucone, zakonczone, zapisz]);

  return {
    zadania: widoczne,
    aktywne,
    zakonczone,
    odrzuc,
    odrzucZakonczone,
    ladowanie: zapytanie.isLoading,
  };
}
