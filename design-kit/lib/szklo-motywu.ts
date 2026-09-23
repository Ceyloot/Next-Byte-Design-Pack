/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZKŁO A MOTYW — jedno wyprowadzenie na całą platformę
 * ════════════════════════════════════════════════════════════════════════
 *
 * Materiał szklany (`.nb-szklo` w `index.css`) potrzebuje trzech wartości,
 * których CSS nie umie sam wyliczyć, bo zależą od tego, czy motyw jest jasny
 * czy ciemny — a motywy jadą zmiennymi wstrzykiwanymi INLINE, więc nie ma
 * `data-theme` ani klasy `.dark`, o które dałoby się zaczepić selektor.
 * (`@media prefers-color-scheme` też nie: mówi o ustawieniu SYSTEMU, a nie
 * o motywie kupionym w sklepie.)
 *
 * DLACZEGO OSOBNY PLIK, A NIE POWTÓRZENIE W TRZECH MIEJSCACH
 * Wyprowadzenie było już zduplikowane w `useGlobalTheme` i w podglądzie
 * deweloperskim. Doszłoby trzecie w `ThemeScope` (podgląd w Bibliotece) —
 * a wtedy Biblioteka, czyli narzędzie do OCENIANIA wyglądu, pokazywałaby
 * inne szkło niż platforma. Dokładnie ten rozjazd, który ten projekt likwiduje.
 *
 * Funkcja jest czysta i nie dotyka DOM: kto ją woła, ten decyduje, gdzie
 * zapisze wynik — na `<html>` (platforma) czy na kontenerze (podgląd).
 */

/** Nazwy zmiennych, które ustawia to wyprowadzenie. Do czyszczenia i testów. */
export const ZMIENNE_SZKLA = [
  '--nb-szklo-jasnosc',
  '--nb-szklo-krycie',
  '--nb-szklo-mute',
  '--nb-tafla-wypelnienie',
] as const;

interface WejscieMotywu {
  /** `--card` w formacie „H S% L%" — decyduje, czy motyw jest jasny */
  card?: string;
  /** `--muted-foreground` w tym samym formacie */
  mutedForeground?: string;
}

/**
 * Zwraca zmienne szkła dla motywu. Pusty obiekt, gdy nie da się odczytać
 * jasności karty — lepiej zostawić wartości zapasowe z CSS niż zgadywać.
 */
export function zmienneSzklaDlaMotywu({ card, mutedForeground }: WejscieMotywu): Record<string, string> {
  const jasnoscKarty = parseFloat((card ?? '').trim().split(/\s+/)[2] ?? '');
  if (!Number.isFinite(jasnoscKarty)) return {};

  const jasny = jasnoscKarty > 50;
  const wynik: Record<string, string> = {
    /*
      DECYZJA MICHAŁA (04.08.2026): materiał z `liquid-glass-react`,
      z ustawieniami dobranymi w panelu «Zarządzanie szkłem» — czyli BEZ
      przyciemniania i BEZ własnego wypełnienia tafli. Tamta biblioteka
      obsługuje jasne podłoże OSOBNYM trybem (`overLight`), nie kryciem —
      i dokładnie tak jest tutaj: motywy ciemne dostają czyste szkło,
      jasne zachowują zmierzony odpowiednik `overLight` poniżej.

      MNOŻNIK JASNOŚCI: 1 wszędzie. Poprzednie 0.45 na ciemnych (podnosiło
      kontrast nad zdjęciami z 2.54 na 3.6+) było częścią starego materiału;
      przypadek „szkło nad fotografią" ma teraz własny wariant
      `nb-szklo-foto` z własnym przyciemnieniem i tam ta ochrona zostaje.
    */
    '--nb-szklo-jasnosc': '1',
    /*
      KRYCIE. Ciemne motywy — 0, jak w zaakceptowanym podglądzie: tafla nie
      ma własnego koloru, cały materiał robią rozmycie, nasycenie i ranty.
      Jasne motywy — 0.72 zostaje ŚWIADOMIE (odpowiednik `overLight`):
      tekst na jasnych jest CIEMNY i musi stać na powierzchni konsekwentnie
      jasnej. Policzone niżej przy `--nb-szklo-mute`: przy kryciu 0.72
      drugoplanowy tekst trzyma AA (L=29%); przy 0 nie trzyma go ŻADEN.
    */
    '--nb-szklo-krycie': jasny ? '0.72' : '0',
    /*
      TAFLA TO CEL, A NIE DOKŁADKA — INACZEJ JASNY MOTYW NIE MA OKIEN ZE SZKŁA.

      `.nb-szklo-tafla` liczy wypełnienie jako `krycie + wypełnienie tafli`.
      Przy jednej stałej 0.60 wychodziło:
        ciemny   0    + 0.60 = 0.60  ✔ dokładnie próg AA, po który była liczona
        jasny    0.72 + 0.60 = 1.32  → CSS przycina do 1.00

      Czyli na jasnym motywie KAŻDE okno, arkusz, szuflada i panel listy
      wyboru były jedynymi w pełni kryjącymi powierzchniami na platformie —
      karta obok miała 0.72 i przepuszczała, okno nad nią nie przepuszczało
      nic. Rozmycie i refrakcja liczyły się tam do kosza.

      0.13 daje na jasnym sumę 0.85. Policzone w przeglądarce na motywie
      Jasnym, przy NAJGORSZYM możliwym tle (czerń tuż pod szybą):
        krycie 1.00 → tekst główny 17.9 : 1, drugoplanowy 9.27 : 1
        krycie 0.85 → tekst główny 15.3 : 1, drugoplanowy 7.94 : 1
        krycie 0.80 → tekst główny 14.5 : 1, drugoplanowy 7.50 : 1
      AA wymaga 4.5, więc zapas jest ponad trzykrotny, a 15% przepuszczonego
      tła wystarcza, żeby przy 8.8 px rozmycia było widać, że to szyba.
    */
    '--nb-tafla-wypelnienie': jasny ? '0.13' : '0.60',
  };

  /*
    TEKST DRUGOPLANOWY — CIEMNIEJSZY, ALE TYLKO NA MOTYWACH JASNYCH.

    Na ciemnym motywie szkło przyciemnia tło, więc jasny tekst zyskuje. Na jasnym
    odwrotnie się nie da (patrz wyżej), więc kontrast musi wnieść sam tekst.

    Policzony kompromis (motyw Jasny, tło = dowolny piksel):
      krycie 0.55 → tekst musiałby mieć L=15%, przy `--foreground` 11%, czyli
                    drugoplanowy przestaje być drugoplanowy
      krycie 0.72 → L=29%  ← wybrane: AA spełnione, hierarchia zostaje

    `Math.min`, a nie stała: gdyby w sklepie pojawił się motyw jasny z już
    ciemnym tekstem drugoplanowym, nie wolno go ROZJAŚNIĆ.
  */
  if (jasny && mutedForeground) {
    const [h, s, l] = mutedForeground.trim().split(/\s+/);
    if (h && s) {
      wynik['--nb-szklo-mute'] = `${h} ${s} ${Math.min(parseFloat(l) || 44, 29)}%`;
    }
  }

  return wynik;
}
