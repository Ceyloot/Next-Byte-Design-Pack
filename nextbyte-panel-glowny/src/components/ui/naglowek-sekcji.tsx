import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * NAGŁÓWEK SEKCJI — pigułka z etykietą + kreska dobiegająca do prawej krawędzi.
 *
 * Po co to istnieje (zmierzone 05.08.2026): ten sam nagłówek stał przepisany
 * słowo w słowo w SZEŚCIU plikach — kolumna rozmów, Pętle AI, szuflada
 * załączników, Pakiety Wiedzy, kolumna notatek (3×) i kolumna Prompt EX (2×).
 * Dziewięć kopii tej samej konstrukcji: `rounded-full border-primary/20
 * bg-primary/[0.07] px-2.5 py-1` + `text-[10px] uppercase tracking-[0.12em]`
 * + kreska `from-primary/20 via-border/30 to-transparent`.
 *
 * Dziewięć kopii to dziewięć okazji do rozjazdu — i już się rozjeżdżały:
 * w kolumnie notatek pigułka miała `group-hover:bg-primary/[0.1]`, a w Pętlach
 * nie; wyściółka wiersza była raz `px-1 pt-1 pb-0.5`, raz `px-0.5`, raz
 * `px-1 py-1`. Nikt tego nie zaprojektował — to osad po kopiowaniu.
 *
 * Zmiana wyglądu nagłówka sekcji ma być JEDNĄ zmianą, tutaj.
 *
 * Wyściółka wiersza ZOSTAJE po stronie wywołania (`className`) — nagłówek nie
 * wie, w jak szerokiej kolumnie stoi, a to ona wyznacza wcięcie.
 */

/* ── MATERIAŁ NAGŁÓWKA — jedno miejsce na wszystkie dziewięć wywołań ────── */
/*
  METRYKA PIGUŁKI PRZEZ ZMIENNE — WARTOŚCI ZAPASOWE TO KONTRAKT PLATFORMY.

  17.09.2026 Panel Klienta Vidomontu ścisnął pigułkę na sztywno (`gap-1.5`→`gap-1`,
  `px-2.5`→`px-2`). Problem w tym, że ten komponent rysuje pasek sekcji w CZTERNASTU
  miejscach POZA Vidomontem — pasek boczny Notatek, Chat AI (Projekty · Przypięte ·
  Konwersacje), PromptEx, Pętle, szuflada artefaktów, panel filtrów — czyli u
  wszystkich użytkowników B2C, którzy o Vidomoncie nigdy nie słyszeli.

  Tak samo jak przy skali kafelków (15.09): ciaśniejsza metryka jest PROŚBĄ jednego
  ekranu, nie nową wartością domyślną. Zapas w `var()` trzyma wartości platformy,
  a skóra Panelu podaje swoje przez `--pigulka-*` (patrz `lib/vidomont/skoraPanelu.ts`).

  ⚠️ KLASY `plakietka-sekcji*` NICZEGO TU NIE ZMIENIAJĄ — są uchwytem dla skóry panelu
  firmowego (`vidomont/systemWygladu.css`), żeby pigułka słuchała tych samych pokręteł,
  co ikony i przyciski. Kajetan (18.09.2026): „te przyciski nie chodzą do zakresu
  przycisków i ikon, którymi da się zarządzać”. Poza `.vqc-panel` wygląd bez zmian.
  Scalone 22.09.2026: zmienne z zapasami ORAZ uchwyty skóry — obie rzeczy są potrzebne
  i żadna nie unieważnia drugiej.
*/
const PIGULKA =
  'plakietka-sekcji inline-flex items-center gap-[var(--pigulka-odstep,0.375rem)] rounded-full border border-primary/20 ' +
  'bg-primary/[0.07] px-[var(--pigulka-x,0.625rem)] py-1';
const IKONA = 'plakietka-sekcji-znak h-3 w-3 shrink-0 text-primary/70';
const ETYKIETA = 'plakietka-sekcji-znak text-etykieta uppercase text-primary/80';
/* `LICZNIK` zniknął razem z samym licznikiem w pasku (21.09.2026) — patrz prop `licznik`.
   Przy scaleniu ze `staging` 22.09.2026 wrócił w konflikcie; usunięty ponownie, bo nic go
   nie używa ani tutaj, ani w całym `src`. */
/** Kreska GAŚNIE w prawo — sekcja ma się otwierać, a nie być zamknięta ramką. */
const KRESKA = 'h-px flex-1 bg-gradient-to-r from-primary/20 via-border/30 to-transparent';

/* ── WARIANT CICHY — do wnętrza paska bocznego ──────────────────────────
   Pigułka z akcentową ramką powstała dla OSOBNEJ KOLUMNY, gdzie sama nadawała
   jej strukturę. Po wsunięciu panelu do paska stanęła obok etykiet menu
   głównego („AI", „PRACA", „SPOŁECZNOŚĆ"), które są zwykłym, cichym tekstem —
   i wtedy krzyczy. Michał: „nienaturalnie wygląda ten pasek z tymi kolorami".

   Wariant cichy mówi tym samym językiem co menu: bez ramki, bez wypełnienia,
   bez kreski. Sam tekst i licznik. Domyślnym wariantem zostaje pigułka, więc
   pozostałe sześć miejsc (notatki, Pętle, Prompt EX, pakiety wiedzy…) nie
   zmienia się ani o piksel. */
const CICHY_ETYKIETA = 'text-etykieta uppercase text-muted-foreground/70';

export interface NaglowekSekcjiProps {
  ikona?: LucideIcon;
  etykieta: React.ReactNode;
  /**
   * Licznik pozycji. ZERO SIĘ NIE POKAZUJE — „0" obok nazwy czyta się jak błąd,
   * a pustkę i tak komunikuje stan pusty pod spodem. Tak było w czterech z
   * dziewięciu kopii; ujednolicone w tę stronę.
   */
  /**
   * ⚠️ NIE RYSUJE SIĘ OD 21.09.2026. Kajetan, wskazując pigułkę „PANEL KLIENTA 13”: „zdejmij
   * liczniki z tych etykiet — ani jedna nie może [ich mieć]”. To drugie takie polecenie; pierwsze
   * padło 20.09 o zakładkach („nie stosuj liczników w tych etykietach”) i wtedy poprawiłem tylko
   * zakładki, zostawiając pigułki nagłówków.
   *
   * Powód jest ten sam w obu miejscach: pigułka nazywa EKRAN, a liczba mówi o jego ZAWARTOŚCI —
   * i zmienia się przy każdym filtrze. Nazwa, która migocze, przestaje być nazwą; a liczbę i tak
   * podaje licznik „N z M” po prawej stronie paska filtrów, gdzie stoi obok mianownika.
   *
   * Prop zostaje w API (28 wywołań w module), ale jest ignorowany — usuwanie go z każdego ekranu
   * niczego by nie zmieniło na ekranie, a rozlałoby tę zmianę na 28 plików.
   */
  licznik?: number;
  /**
   * Obecność tego pola (nawet `false`) PRZEŁĄCZA nagłówek w tryb zwijany:
   * całość staje się `<button>` ze strzałką. Brak pola = nagłówek statyczny.
   */
  rozwiniete?: boolean;
  onToggle?: () => void;
  /** Akcja po prawej stronie kreski — np. „Utwórz projekt". */
  poPrawej?: React.ReactNode;
  /**
   * Jedna linijka POD nagłówkiem: po co jest ta sekcja. Powstało dla segmentów
   * zakładki Zamówienie w Panelu Klienta (Kajetan, 10.09.2026: „nawalone wszystkiego
   * na kupę — zacznijmy to segmentować"): cztery segmenty, każdy z tym samym
   * nagłówkiem i jednym zdaniem, co w nim jest. Opis w komponencie, nie obok niego,
   * żeby cztery sekcje nie miały czterech różnych podpisów.
   */
  opis?: React.ReactNode;
  /**
   * `pigulka` (domyślnie) — akcentowana, do osobnych kolumn.
   * `cichy` — do wnętrza paska bocznego, w języku menu głównego.
   */
  wariant?: 'pigulka' | 'cichy';
  className?: string;
}

export const NaglowekSekcji: React.FC<NaglowekSekcjiProps> = ({
  ikona: Ikona,
  etykieta,
  licznik,
  rozwiniete,
  onToggle,
  poPrawej,
  opis,
  wariant = 'pigulka',
  className,
}) => {
  const zwijany = typeof rozwiniete === 'boolean';
  const Strzalka = rozwiniete ? ChevronDown : ChevronRight;
  const cichy = wariant === 'cichy';

  const pigulka = cichy ? (
    <span className="inline-flex min-w-0 items-center gap-[var(--pigulka-odstep,0.375rem)]">
      {zwijany && <Strzalka className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
      {Ikona && <Ikona className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
      <span className={CICHY_ETYKIETA}>{etykieta}</span>
    </span>
  ) : (
    <span className={cn(PIGULKA, zwijany && 'transition-colors group-hover:bg-primary/[0.1]')}>
      {zwijany && <Strzalka className={IKONA} />}
      {Ikona && <Ikona className={IKONA} />}
      <span className={ETYKIETA}>{etykieta}</span>
    </span>
  );

  /* W wariancie cichym kreski nie ma — w wąskiej kolumnie dokłada linii,
     których menu główne nie ma, a to właśnie one budują wrażenie „obcego". */
  const kreska = cichy ? null : <span aria-hidden="true" className={KRESKA} />;

  /*
    AKCJA STOI POZA PRZYCISKIEM ZWIJANIA.

    Przycisk w przycisku jest nieprawidłowym HTML-em — przeglądarka rozbija
    takie zagnieżdżenie i klik trafia w losowy element. Dlatego w trybie
    zwijanym `<button>` obejmuje wyłącznie pigułkę i kreskę, a `poPrawej`
    zostaje jego rodzeństwem.
  */
  const wiersz = zwijany ? (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={rozwiniete}
        className="group flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        {pigulka}
        {kreska}
      </button>
      {poPrawej && <div className="flex shrink-0 items-center gap-2">{poPrawej}</div>}
    </>
  ) : (
    <>
      {pigulka}
      {kreska}
      {/* Akcje na jednej linii z pigułką (Kajetan, 17.09.2026: „idealnie na linii”). */}
      {poPrawej && <div className="flex shrink-0 items-center gap-2">{poPrawej}</div>}
    </>
  );

  if (!opis) return <div className={cn('flex items-center gap-2', className)}>{wiersz}</div>;

  return (
    /* `data-pasek-naglowka`: znacznik do mierzenia wyrównania ekranów (Kajetan 17.09.2026: „nadal przesunięcia”) —
       pozwala porównać lewą krawędź paska w Panelu i w CRM bez zgadywania po tekście. */
    <div data-pasek-naglowka className={className}>
      {/* Wiersz z opisem ma stałą wysokość przycisku akcji (h-8), a pigułka stoi w jego środku — dzięki temu odstęp
          pigułka → opis jest taki sam z przyciskiem i bez niego: 4 px (Kajetan, 17.09.2026: „delikatnie mniejszy”,
          ten sam odstęp ekran daje pod opisem). */}
      <div className="flex min-h-8 items-center gap-2">{wiersz}</div>
      {/* mt-0.5: opis 2 px niżej (Kajetan, 17.09.2026) — pigułka → opis 6 px. */}
      <p className="mt-1 text-meta text-muted-foreground">{opis}</p>
    </div>
  );
};

/**
 * AKCJA NAGŁÓWKA — jedyny przycisk w pasku nagłówka sekcji (Kajetan, 17.09.2026): w całym panelu ten sam wygląd
 * i ta sama wysokość co „Połącz z innymi klientami” (outline, sm, tekst xs), bez podpisów pod spodem.
 * Co robi przycisk, mówi DYMEK po najechaniu — krój dymka z paska etapów w karcie klienta CRM
 * (ramka, tło popover, tytuł + zdanie „co się stanie po kliknięciu”).
 */
export interface AkcjaNaglowkaProps extends Omit<ButtonProps, 'variant' | 'size'> {
  dymek?: { tytul: string; opis: string };
}

/**
 * DYMEK — opis przycisku po najechaniu (Kajetan, 17.09.2026: „każdy przycisk funkcyjny ma mieć opis jak przyciski
 * z paska”). Owija dowolny przycisk (także sam z ikoną): tytuł + jedno zdanie „co się stanie po kliknięciu”.
 * Krój z paska etapów w karcie klienta CRM. `span` wokół — wyłączony przycisk nie łapie najechania.
 */
export const Dymek: React.FC<{
  tytul: string; opis?: string; strona?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Bez otoczki `span.inline-flex` — dziecko samo jest wyzwalaczem.
   *
   * Otoczka istnieje po to, żeby WYŁĄCZONY przycisk łapał najechanie (nie łapie go sam). Ale przy
   * dziecku pozycjonowanym absolutnie robi odwrotną szkodę: `inline-flex` ma wtedy zerową wysokość
   * i nie ma na czym najechać — zmierzone 19.09.2026 na pasku stanu wiersza (§3C-1), dymek nie
   * pokazywał się w ogóle. Wtedy dziecko przejmuje rolę wyzwalacza wprost.
   */
  bezOtoczki?: boolean;
  /** Ile czekać przed pokazaniem (ms). Standard 400; wiersz listy 1000 — dymek ma nie migać przy przesuwaniu myszy. */
  opoznienie?: number;
  children: React.ReactElement;
}> = ({ tytul, opis, strona = 'bottom', bezOtoczki, opoznienie = 400, children }) => (
  <TooltipProvider delayDuration={opoznienie}>
    <Tooltip>
      <TooltipTrigger asChild>{bezOtoczki ? children : <span className="inline-flex">{children}</span>}</TooltipTrigger>
      <TooltipContent side={strona} className="max-w-xs rounded-pole border border-border bg-popover/95 px-3 py-2 shadow-okno backdrop-blur">
        <div className="text-tresc font-semibold">{tytul}</div>
        {opis && <div className="mt-1 text-meta text-muted-foreground">{opis}</div>}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/* forwardRef: przycisk bywa wyzwalaczem popovera (Dodaj obiekt) — Radix potrzebuje ref do pozycjonowania. */
export const AkcjaNaglowka = React.forwardRef<HTMLButtonElement, AkcjaNaglowkaProps>(({ dymek, className, ...przycisk }, ref) => {
  /* Kremowy w motywie (Kajetan, 17.09.2026) — wariant `akcent` biblioteki przycisków, z tokenu `primary`. */
  const b = <Button ref={ref} variant="akcent" size="akcja" className={className} {...przycisk} />;
  if (!dymek) return b;
  return <Dymek tytul={dymek.tytul} opis={dymek.opis}>{b}</Dymek>;
});
AkcjaNaglowka.displayName = 'AkcjaNaglowka';

/** Przycisk funkcyjny w treści (przy rekordzie, w oknie) — ten sam wygląd i dymek co w pasku nagłówka. */
export const PrzyciskFunkcyjny = AkcjaNaglowka;

/* `LICZNIK` zniknął z tokenów razem z samym licznikiem (21.09.2026) — patrz prop `licznik`. */
export const TOKENY_NAGLOWKA_SEKCJI = { PIGULKA, IKONA, ETYKIETA, KRESKA } as const;
