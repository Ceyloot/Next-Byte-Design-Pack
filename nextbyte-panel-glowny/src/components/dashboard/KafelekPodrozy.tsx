import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';
import { ShortcutIcon } from './ShortcutIcon';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KAFELEK SZYBKIEJ PODRÓŻY — grafika, nie ikonka z podpisem
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „kafelki szybkiej podróży bym przebudował, bo jest ikona i tekst…
 * no dramat" — i zaraz potem, o referencji z ikoną nawigacji Apple:
 * „np. takie grafiki w środku z napisem na środku co to, w stylu nextbyte".
 *
 * ── CO BYŁO ──────────────────────────────────────────────────────────────
 * Kwadracik 36 px z ikoną w kolorze akcentu i tytuł pod spodem. Sześć takich
 * obok siebie różniło się WYŁĄCZNIE kształtem ikony — ten sam błękit, to samo
 * tło, ta sama waga. Oko nie miało czego złapać, więc trzeba było CZYTAĆ
 * podpisy, żeby trafić w moduł. Skrót, który wymaga czytania, przestaje być
 * skrótem.
 *
 * ── CO ROBI TERAZ ────────────────────────────────────────────────────────
 * Każdy moduł dostaje własną BARWĘ i własną scenę:
 *
 *   · poświata bijąca OD DOŁU w barwie modułu — to samo, co robi ikona
 *     nawigacji z referencji: światło u podstawy, ciemność u góry,
 *   · siatka techniczna zanikająca ku górze — nasz własny motyw, ten sam,
 *     który stoi w tle platformy i na ekranie startowym,
 *   · ikona duża i podświetlona barwą modułu, nie akcentem platformy,
 *   · nazwa na dole, na ciemniejszej części kafelka, gdzie zawsze jest
 *     czytelna niezależnie od siły poświaty.
 *
 * Dzięki barwie kafelek rozpoznaje się PERYFERYJNIE — „ten fioletowy" zamiast
 * „trzeci od lewej, sprawdzę podpis". O to chodzi w szybkiej podróży.
 *
 * ── DLACZEGO BARWA JEST MAPOWANA PO ADRESIE ──────────────────────────────
 * Skróty przychodzą z ustawień użytkownika i niosą tylko tytuł, adres
 * i nazwę ikony — koloru w danych nie ma. Mapa po adresie daje stały kolor
 * modułu bez zmiany schematu bazy; skrót spoza listy (własna strona firmowa)
 * dostaje kolor akcentu platformy i nadal wygląda jak reszta.
 */

/* Barwy modułów w HSL — dobierane tak, żeby sześć sąsiadujących kafelków
   dało się rozróżnić kątem oka, a żaden nie wypadł z palety platformy.
   Nasycenie trzymane wysoko, jasność w wąskim paśmie: inaczej jeden kafelek
   świeciłby mocniej od pozostałych i wyglądał na wybrany. */
const BARWY_MODULOW: { wzorzec: RegExp; hsl: string }[] = [
  { wzorzec: /personalny-asystent|asystent/, hsl: '265 85% 62%' },
  { wzorzec: /chat-ai|\/chat/,               hsl: '205 90% 60%' },
  { wzorzec: /prompt-ex|promptex/,           hsl: '190 85% 55%' },
  { wzorzec: /pamiec|pamiec-ai/,             hsl: '280 75% 62%' },
  { wzorzec: /petle|petla/,                  hsl: '245 80% 65%' },
  { wzorzec: /studio-zdjec|zdjec|photo/,     hsl: '330 80% 62%' },
  { wzorzec: /studio-video|video/,           hsl: '150 70% 48%' },
  { wzorzec: /notatki|notes/,                hsl: '45 90% 58%' },
  { wzorzec: /zadania|tasks/,                hsl: '25 90% 58%' },
  { wzorzec: /kalendarz|calendar/,           hsl: '15 85% 60%' },
  { wzorzec: /tablice|board/,                hsl: '175 70% 50%' },
  { wzorzec: /akademia|kurs/,                hsl: '95 60% 52%' },
  { wzorzec: /sklep|shop/,                   hsl: '340 75% 60%' },
  { wzorzec: /firma|company|faktur/,         hsl: '215 60% 58%' },
];

/** Barwa modułu po adresie — używa jej też okno edycji, żeby slot w edytorze
 *  wyglądał dokładnie tak, jak kafelek, który z niego powstanie. */
export const barwaDla = (url: string): string => {
  const a = (url || '').toLowerCase();
  return BARWY_MODULOW.find((b) => b.wzorzec.test(a))?.hsl ?? 'var(--primary)';
};

interface Props {
  tytul: string;
  ikona?: string | null;
  url: string;
  /** Nazwa firmy — pokazywana tylko przy skrótach firmowych. */
  podpis?: string | null;
  indeks: number;
  onClick: () => void;
}

export const KafelekPodrozy: React.FC<Props> = ({ tytul, ikona, url, podpis, indeks, onClick }) => {
  const barwa = barwaDla(url);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.04 * indeks }}
      /* Uniesienie, nie skalowanie: `scale` na powierzchni ze szkłem
         unieważnia rozmycie rodzica, a kafelki stoją w szklanej kolumnie. */
      whileHover={{ y: -3 }}
      whileTap={{ y: -1 }}
      className={cn(
        'nb-horyzont group flex h-[112px] flex-col justify-end rounded-2xl',
        'border border-border/60 bg-card/40 p-3 text-left',
        'transition-colors duration-200 hover:border-[hsl(var(--nb-barwa)/0.45)]',
      )}
      style={{ ['--nb-barwa' as string]: barwa }}
      title={tytul}
    >
      {/* Światło i siatka pochodzą z klasy `.nb-horyzont` (index.css) —
          patrz komentarz przy niej. Tu zostaje tylko barwa. */}

      {/* ── Ikona ──
          Wysoko i po lewej, w barwie modułu. Poświata pod nią odrywa ją od
          tła — bez tego przy mocnej poświacie dolnej ikona gubi kontrast. */}
      <span
        aria-hidden="true"
        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{
          borderColor: 'hsl(var(--nb-barwa)/0.35)',
          background: 'hsl(var(--nb-barwa)/0.14)',
          color: 'hsl(var(--nb-barwa))',
          boxShadow: '0 4px 16px hsl(var(--nb-barwa)/0.22)',
        }}
      >
        <ShortcutIcon name={ikona} className="h-[18px] w-[18px]" />
      </span>

      {/* ── Nazwa ──
          DWA WIERSZE, NIE UCINANIE. `truncate` robiło z „Personalny Asystent"
          napis „Personalny As…", czyli kafelek przestawał mówić, do czego
          prowadzi — a to jedyne jego zadanie. Nazwy modułów są krótkie
          i w dwóch wierszach mieszczą się w całości; ucięcie zostaje dopiero
          dla nazw naprawdę długich (własne strony firmowe).

          `leading-[1.15]` zamiast `leading-tight`: dwa wiersze przy 13 px
          potrzebują ciaśniejszej interlinii, żeby zmieściły się nad podpisem
          bez podnoszenia całego kafelka. */}
      <span className="min-w-0">
        <span className="line-clamp-2 text-[13px] font-semibold leading-[1.15] text-foreground">
          {tytul}
        </span>
        {podpis && (
          <span className="mt-1 block truncate text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            {podpis}
          </span>
        )}
      </span>
    </motion.button>
  );
};

/**
 * ── WARIANT IKONOWY (10.09.2026) ─────────────────────────────────────────
 *
 * Michał: „po prawej daj 6 ikon szybkich akcji". Ta sama szybka podróż, ale
 * w jednej trzeciej szerokości — na kafelek 112 px z opisem nie ma tam
 * miejsca, a ściśnięty kafelek to podpis ucięty w połowie słowa.
 *
 * Zostaje więc to, co w tej szerokości działa: duża ikona w barwie modułu
 * i krótka nazwa pod nią. Barwa jest ta sama, co w wariancie kafelkowym,
 * bo to ona niesie rozpoznanie — „ten fioletowy" działa i przy 60 px.
 */
export const IkonaPodrozy: React.FC<Props> = ({ tytul, ikona, url, indeks, onClick }) => {
  const barwa = barwaDla(url);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.03 * indeks }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      className={cn(
        /*
          ── TA SAMA SZYBA, CO RESZTA PANELU (10.09.2026) ────────────────────
          Michał: „te elementy trzeba będzie dostosować pod kątem kafelków
          wyglądowo do całości panelu głównego".

          ZMIERZONE: kafelki chmur, skrzynka, kalendarz i pasek boczny stoją na
          `rgba(8,8,8,0.35)` z refrakcją platformy, a ikony szybkiej podróży
          miały własne `bg-card/40` z samym obrysem — czyli jedyną w tym rzędzie
          powierzchnię, która NIE była szkłem. Materiał bierzemy więc z
          `klasyKafelka`, a tutaj zostaje wyłącznie kształt i rozmiar.
        */
        klasyKafelka({ interaktywny: true }),
        /* `h-full` zamiast sztywnych 74 px: ikona wypełnia rząd siatki, dzięki
           czemu dno panelu równa się z dnem kafelków chmur obok. Minimum zostaje,
           bo w wąskiej kolumnie bez rozciągania rząd zapadłby się do ikony. */
        'group h-full min-h-[74px] items-center justify-center gap-1.5 rounded-xl px-1.5 py-2',
        'hover:border-[hsl(var(--nb-barwa)/0.45)]',
      )}
      style={{ ['--nb-barwa' as string]: barwa }}
      title={tytul}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{
          borderColor: 'hsl(var(--nb-barwa)/0.35)',
          background: 'hsl(var(--nb-barwa)/0.14)',
          color: 'hsl(var(--nb-barwa))',
          boxShadow: '0 4px 14px hsl(var(--nb-barwa)/0.20)',
        }}
      >
        <ShortcutIcon name={ikona} className="h-4 w-4" />
      </span>

      {/* Jeden wiersz z ucięciem: przy 60 px nazwa modułu i tak nie wejdzie
          w całości, a dwa wiersze podniosłyby rząd ikon o kolejne 14 px. */}
      <span className="w-full truncate text-center text-[9.5px] font-medium leading-none text-muted-foreground group-hover:text-foreground">
        {tytul}
      </span>
    </motion.button>
  );
};
