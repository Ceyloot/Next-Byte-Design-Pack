import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  GNIAZDO PANELU W PASKU BOCZNYM
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: pasek ma iść w stronę „Motion Slide Menu" — po wejściu w narzędzie
 * z własną nawigacją pasek WSUWA SIĘ w jego menu, zamiast otwierać drugą
 * kolumnę obok. Nagłówek (logo, szukajka) i pasek kart na dole zostają
 * nieruchome — wsuwa się wyłącznie środek.
 *
 * ── DLACZEGO PORTAL, A NIE PRZENIESIENIE KOMPONENTU ─────────────────────
 * Panel rozmów Chat AI to 566 linii ze stanem: foldery, pętle, przypięte,
 * przeciąganie rozmów między folderami, zapisane widoki. Przeniesienie go
 * fizycznie do paska oznaczałoby przeciągnięcie całego tego stanu przez
 * kontekst albo przez propsy w górę — czyli przepisanie działającej rzeczy
 * po to, żeby zmienić jej MIEJSCE NA EKRANIE.
 *
 * Portal rozdziela te dwie sprawy: drzewo React zostaje przy stronie (stan,
 * hooki i przeciąganie nietknięte), a DOM ląduje w pasku. Strona mówi tylko
 * „mam panel i tak się nazywa" — pasek decyduje, kiedy i jak go pokazać.
 *
 * ── DLACZEGO WĘZEŁ DOM, A NIE `ReactNode` W KONTEKŚCIE ──────────────────
 * Trzymanie gotowego elementu w kontekście wygląda prościej, ale każda zmiana
 * stanu strony tworzyłaby nowy element i przerenderowywała CAŁY pasek razem
 * z nim. Przy liście 156 rozmów i przeciąganiu to jest różnica, którą widać.
 */

/**
 * Szerokość paska, gdy stoi w nim panel narzędzia.
 *
 * Menu główne mieści się w 240 px, ale panele narzędzi są różne: lista rozmów
 * to płaskie tytuły, a Notatki mają foldery zagnieżdżone, liczniki, awatary
 * współdzielenia i pakiety wiedzy — przy 240 px robi się z tego drabina
 * wielokropków. Dlatego szerokość deklaruje NARZĘDZIE, a pasek się dostosowuje.
 *
 * Sufit 340 px jest świadomy: szerszy pasek zabiera miejsce treści, a to ona
 * jest powodem, dla którego ktoś w ogóle wszedł w narzędzie.
 */
/* 264 px, nie 240 (19.08, Michał: „za wąski jest ten pasek boczny imo").
   Przy 240 px etykiety menu i tytuły w panelach narzędzi ucinały się częściej,
   niż wynikało to z ich długości — a pasek i tak zajmuje ułamek szerokości
   ekranu. Dwadzieścia kilka pikseli to tutaj kilka znaków na każdym wierszu. */
export const SZEROKOSC_KORZENIA = 264;
const SZEROKOSC_MAKS = 340;

interface WartoscPanelu {
  /** Węzeł DOM w pasku, do którego strona portalem wstawia swój panel. */
  gniazdo: HTMLDivElement | null;
  /** Nazwa narzędzia pokazywana w wierszu powrotu. `null` = pasek jest w korzeniu. */
  tytul: string | null;
  /** Szerokość paska w pikselach — narzędzia albo korzenia. */
  szerokosc: number;
  /** Czy użytkownik ręcznie wrócił do menu, choć narzędzie jest otwarte. */
  wymuszonyKorzen: boolean;
  /** Powrót do menu bez opuszczania narzędzia. */
  wrocDoMenu: () => void;
  /** Ponowne wejście w panel otwartego narzędzia. */
  wrocDoNarzedzia: () => void;
  /** Pasek wywołuje to, żeby oddać swoje gniazdo. */
  ustawGniazdo: (el: HTMLDivElement | null) => void;
  /** Strona zgłasza, że ma panel; zwraca funkcję wyrejestrowującą. */
  zglosPanel: (tytul: string, szerokosc?: number) => () => void;
}

const Kontekst = createContext<WartoscPanelu | null>(null);

export const DostawcaPanelPaska: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gniazdo, setGniazdo] = useState<HTMLDivElement | null>(null);
  const [tytul, setTytul] = useState<string | null>(null);
  const [szerokoscNarzedzia, setSzerokoscNarzedzia] = useState<number | null>(null);

  /*
    POWROT DO MENU MIESZKA TUTAJ, NIE W KOMPONENCIE.

    Trzymalem go lokalnie w `MenuWsuwane` i to byl blad zgloszony przez Michala:
    po cofnieciu z Notatek do menu pasek zostawal na 320 px. Po powrocie `tytul`
    DALEJ brzmi „Notatki" (strona sie nie zmienila), wiec kontekst liczyl
    szerokosc narzedzia, mimo ze na ekranie stalo menu, ktoremu wystarcza 264.

    Szerokosc i poziom to jedna decyzja, wiec maja miec jedno zrodlo.
  */
  const [wymuszonyKorzen, setWymuszonyKorzen] = useState(false);

  const ustawGniazdo = useCallback((el: HTMLDivElement | null) => setGniazdo(el), []);

  /* Zgłoszenie jest PARĄ: zajmij / zwolnij. Bez zwalniania pasek zostałby
     wsunięty w narzędzie, z którego użytkownik już wyszedł — a wiersz powrotu
     prowadziłby donikąd. */
  const zglosPanel = useCallback((nazwa: string, szerokosc?: number) => {
    setTytul(nazwa);
    /* Wejscie w narzedzie kasuje reczny powrot — inaczej pasek zostalby
       zwiniety do menu takze po przejsciu do innego narzedzia. */
    setWymuszonyKorzen(false);
    if (szerokosc) setSzerokoscNarzedzia(Math.min(Math.max(szerokosc, SZEROKOSC_KORZENIA), SZEROKOSC_MAKS));
    return () => setTytul((biezacy) => {
      if (biezacy !== nazwa) return biezacy;
      setSzerokoscNarzedzia(null);
      return null;
    });
  }, []);

  const wartosc = useMemo(
    () => ({
      gniazdo,
      tytul,
      szerokosc: tytul && !wymuszonyKorzen && szerokoscNarzedzia
        ? szerokoscNarzedzia
        : SZEROKOSC_KORZENIA,
      wymuszonyKorzen,
      wrocDoMenu: () => setWymuszonyKorzen(true),
      wrocDoNarzedzia: () => setWymuszonyKorzen(false),
      ustawGniazdo,
      zglosPanel,
    }),
    [gniazdo, tytul, szerokoscNarzedzia, wymuszonyKorzen, ustawGniazdo, zglosPanel]
  );

  return <Kontekst.Provider value={wartosc}>{children}</Kontekst.Provider>;
};

/** Dla paska bocznego — pełny dostęp do gniazda i tytułu. */
export function usePanelPaska(): WartoscPanelu {
  const k = useContext(Kontekst);
  if (!k) {
    throw new Error('usePanelPaska wymaga DostawcaPanelPaska w drzewie.');
  }
  return k;
}

/**
 * Dla STRONY: zgłasza własny panel i oddaje gniazdo do portalu.
 *
 * ── DWIE RÓŻNE ODPOWIEDZI, BO TO DWA RÓŻNE PYTANIA ──────────────────────
 * `gniazdo` — „czy JEST TERAZ gdzie wstawić panel". Na telefonie szuflada
 *   paska jest zamknięta i Radix nie trzyma jej treści w DOM, więc gniazdo
 *   bywa `null` mimo działającego paska.
 * `obsluguje` — „czy pasek W OGÓLE hostuje panele" (czy dostawca jest
 *   w drzewie). To pytanie o architekturę, nie o bieżącą chwilę.
 *
 * Mieszanie ich dało błąd, który zgłosił Michał: „w chat ai są 2 paski".
 * Strona pytała o gniazdo, na telefonie dostawała `null` i rysowała WŁASNĄ
 * szufladę z własnym hamburgerem — obok hamburgera paska. Trigger ma zależeć
 * od `obsluguje`, a portal od `gniazdo`.
 */
export function useGniazdoPanelu(
  /**
   * Nazwa narzędzia — albo `null`, gdy strona AKURAT TERAZ panelu nie ma.
   *
   * `null` jest potrzebne, bo hooka nie da się wywołać warunkowo, a są strony,
   * na których panel istnieje tylko w części stanów: Kurs ma listę lekcji
   * dopiero w widoku lekcji, a na ekranie samego kursu nie ma czego wsuwać.
   * Bez tego pasek wjeżdżałby w pustą warstwę narzędzia.
   */
  tytul: string | null,
  szerokosc?: number,
): { gniazdo: HTMLDivElement | null; obsluguje: boolean } {
  const k = useContext(Kontekst);
  const zglos = k?.zglosPanel;

  /*
    ZALEŻNOŚĆ OD `zglosPanel`, NIE OD CAŁEGO KONTEKSTU — i to jest naprawa błędu.

    Pierwsza wersja miała w zależnościach `k`. Obiekt kontekstu zmienia się przy
    KAŻDEJ zmianie stanu w dostawcy (gniazdo, tytuł, szerokość), więc efekt
    wyrejestrowywał i rejestrował panel w kółko. Skutek był widoczny: Notatki
    deklarowały 320 px, a pasek zostawał na 264 — bo tuż po ustawieniu
    szerokości sprzątanie zerowało ją z powrotem.

    `zglosPanel` jest stabilne (`useCallback` z pustą listą), więc efekt
    wykonuje się raz na wejście w narzędzie.
  */
  useEffect(() => {
    if (!zglos || !tytul) return;
    return zglos(tytul, szerokosc);
  }, [zglos, tytul, szerokosc]);

  return { gniazdo: k?.gniazdo ?? null, obsluguje: !!k };
}
