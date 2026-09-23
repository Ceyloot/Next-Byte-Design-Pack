import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ZakladkiRozwijane } from './zakladki-rozwijane';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Liczba przy etykiecie — np. zgłoszenia w kolejce. Zero jest ukrywane:
   *  „0" obok nazwy czyta się jak usterka, a nie jak informacja. */
  licznik?: number;
  /** Nazwa grupy. Gdy poda ją choć jedna zakładka, pasek dzieli się na sekcje
   *  z małym podpisem przed pierwszą pozycją każdej grupy. */
  grupa?: string;
  /**
   * Zakładka WYGASZONA — widoczna, ale nieklikalna.
   *
   * Kajetan (22.09.2026, o ustawieniach Panelu): „niech będzie wygaszone to, czego nie ma,
   * i za każdym razem, kiedy będziemy pracować na innych zakładkach w ustawieniach, to
   * odwzorowujemy, ale blokujemy to, czego nie ma, wygaszeniem”.
   *
   * ⚠️ WYGASZONA, A NIE UKRYTA — i to jest sedno. Usunięcie pozycji z paska zmieniłoby UKŁAD:
   * ekran przestałby być odwzorowaniem tego, którym steruje, i trzeba by się uczyć drugiej
   * nawigacji. Wygaszona pigułka mówi jednocześnie „to miejsce istnieje” i „tu jeszcze nic nie
   * ma” — bez klikania i bez zgadywania. `powod` idzie do dymka i do `title`, żeby odpowiedź
   * „dlaczego nie mogę” była pod kursorem.
   */
  wygaszona?: boolean;
  /** Jedno zdanie: czemu ta zakładka jest wygaszona. */
  powod?: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  layoutId?: string;
  mobileColumns?: 2 | 3 | 4;
  /** Custom accent color (raw CSS color, e.g. 'hsl(var(--nb-studio-zdjec))') — overrides --primary */
  accentColor?: string;
  /** On mobile, show a single selected tab with a dropdown instead of a grid */
  mobileDropdown?: boolean;
  /** Pasek nie zawija się do drugiego rzędu — przy nadmiarze przewija się w poziomie.
   *  Kajetan (10.09.2026): „Dokumenty" spadało pod resztę zakładek karty klienta. */
  jednaLinia?: boolean;
}

const MOBILE_GRID_COLUMNS_CLASS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const;

/**
 * Aktywna pigułka: wirujący rant w akcencie motywu + szklane wnętrze.
 *
 * Eksportowana, bo dokładnie ten sam komponent istniał w trzech kopiach
 * (`filter-pills.tsx`, `subscription/PricingSwitch.tsx`) i wszystkie trzy miały
 * to samo NIEPRZEZROCZYSTE wnętrze. Materiał siedzi teraz w `index.css`
 * (`.nb-pigulka-rant` + `.nb-pigulka-szklo`), więc zmiana wyglądu to jedno
 * miejsce, a nie polowanie po plikach.
 *
 * `accentColor` służy paskom, które mają własny kolor (np. filtry sklepu);
 * bez niego rant bierze `--primary`, czyli akcent bieżącego motywu.
 */
export const AnimatedBorderPill = ({ accentColor }: { accentColor?: string }) => {
  let full: string, mid: string, low: string;
  if (accentColor) {
    const m = accentColor.match(/hsl\(([^)]+)\)/);
    const vals = m ? m[1] : '0,0%,50%';
    full = accentColor;
    mid = `hsla(${vals}, 0.3)`;
    low = `hsla(${vals}, 0.1)`;
  } else {
    full = 'hsl(var(--primary))';
    mid = 'hsl(var(--primary) / 0.3)';
    low = 'hsl(var(--primary) / 0.1)';
  }
  return (
    <>
      {/* Rant: pełne koło gradientu, z którego maska zostawia sam jednopikselowy
          obrys. Bez maski trzeba było zasłaniać środek nieprzezroczystą łatą —
          i to ta łata była „czarnym wypełnieniem". */}
      <span
        className="absolute inset-0 rounded-full nb-pigulka-rant nb-tab-pill-spin"
        style={{
          background: `conic-gradient(from var(--gradient-angle, 0deg), ${full}, ${mid}, ${low}, ${mid}, ${full})`,
        }}
      />
      <span className="absolute inset-[1px] rounded-full nb-pigulka-szklo" />

      <style>{`
        @property --gradient-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          from { --gradient-angle: 0deg; }
          to { --gradient-angle: 360deg; }
        }
        /* Animacja tylko dla użytkowników, którzy nie poprosili o mniej ruchu.
           Bez preferencji zachowanie jest identyczne jak dotąd. */
        @media (prefers-reduced-motion: no-preference) {
          .nb-tab-pill-spin { animation: border-spin 3s linear infinite; }
        }
      `}</style>
    </>
  );
};

/*
  Wariant rozwijany zamieszkał w `ui/zakladki-rozwijane.tsx` (06.08.2026).
  Michał: „a jak nie ma, to stwórz globalny komponent takiego rozwijanego tab
  w stylu 1:1 liquid glass". Siedział tu prywatnie i nie dało się go użyć
  nigdzie indziej, choć każdy wąski ekran z wieloma zakładkami potrzebuje
  dokładnie tego samego. `AnimatedTabs` tylko go teraz wywołuje.
*/
const MobileDropdownTabs = ZakladkiRozwijane;

const AnimatedTabs: React.FC<AnimatedTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className,
  layoutId = 'animated-tab-pill',
  mobileColumns,
  accentColor,
  mobileDropdown,
  jednaLinia,
}) => {
  const mobileGridClass = mobileColumns ? MOBILE_GRID_COLUMNS_CLASS[mobileColumns] : null;

  return (
    <div className={cn("flex w-full items-center justify-center", jednaLinia && "overflow-x-auto", className)}>
      {/* Mobile dropdown */}
      {mobileDropdown && (
        <div className="w-full sm:hidden">
          <MobileDropdownTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} accentColor={accentColor} />
        </div>
      )}

      {/* Desktop (or mobile grid fallback) */}
      {/*
        SZEROKOŚĆ DO TREŚCI, NIE DO EKRANU (od `sm`).
        Michał na pasku Ogólne/Firmy: „pasek na cały ekran i 2 kafelki tylko
        do wyboru?" — sztywne `w-full` przy dwóch pigułkach zostawiało pusty
        wagon. Segmentowany przełącznik ma obejmować swoje segmenty; rodzic
        i tak centruje. Poniżej `sm` zostaje pełna szerokość, bo tam pasek
        bywa siatką albo listą rozwijaną.
        MATERIAŁ: `nb-szklo nb-szklo-plynne` (06.08.2026).

        Było samo `nb-szklo`, czyli wypełnienie i rant BEZ załamania — a
        załamanie wchodzi wyłącznie na tej parze i to ono robi krawędź, po
        której oko rozpoznaje szybę. Dopóki pastylka stała wewnątrz szklanego
        pasa na całą szerokość, i tak nie miałaby czego rozmywać (szyba
        w szybie). Pas zniknął (patrz `PhotoStudio.tsx`), więc pastylka jest
        teraz dzieckiem zwykłego kontenera i rozmywa dokładnie to, co pod nią
        przejeżdża — o to prosił Michał: „przy scrollowaniu tylko za nią się
        rozmywał liquid glass".
      */}
      <div className={cn(
        "relative w-full sm:w-fit max-w-full rounded-[1.75rem] border p-1 gap-0.5 nb-szklo nb-szklo-plynne",
        mobileDropdown ? 'hidden sm:flex sm:flex-wrap sm:justify-center' :
        mobileGridClass ? `grid ${mobileGridClass} sm:flex sm:flex-wrap sm:justify-center` : 'flex flex-wrap justify-center',
        jednaLinia && 'sm:flex-nowrap shrink-0'
      )}
        /* Styl inline, nie tylko klasa: `flex-wrap` stoi wcześniej w tej samej liście
           i w zależności od kolejności w buildzie potrafił wygrać z `sm:flex-nowrap`
           — Kajetan dwa razy widział „Dokumenty" w drugim rzędzie. */
        style={jednaLinia ? { flexWrap: 'nowrap' } : undefined}>
        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.value;
          /* Wygaszona nigdy nie jest aktywna — gdyby ktoś podał ją jako `activeTab`, pigułka
             wyglądałaby na wybraną i jednocześnie martwą. */
          const wygaszona = !!tab.wygaszona && !isActive;
          /* Podpis grupy pojawia się przed PIERWSZĄ pozycją każdej grupy —
             porównanie z poprzednią zakładką, a nie osobna pętla po grupach,
             bo kolejność w `tabs` jest jedynym źródłem prawdy o układzie. */
          const naglowekGrupy =
            tab.grupa && tab.grupa !== tabs[i - 1]?.grupa ? tab.grupa : null;

          return (
            /* `div.contents` zamiast `React.Fragment` — poprawione 03.08.2026.
               Fragment przyjmuje wyłącznie `key` i `children`, a tagger Lovable
               dopina w trybie deweloperskim `data-lov-id` do każdego elementu.
               Efekt: ostrzeżenie „Invalid prop supplied to React.Fragment"
               powtarzane przy KAŻDEJ zakładce — konsola Zarządu tonęła w nim
               tak, że prawdziwe błędy trzeba było w niej wyławiać.
               `display: contents` znika z układu dokładnie tak samo jak
               Fragment, a jest zwykłym elementem, więc atrybut ma gdzie usiąść. */
            <div className="contents" key={tab.value}>
              {naglowekGrupy && (
                <span
                  aria-hidden="true"
                  className="hidden select-none items-center px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex"
                >
                  {naglowekGrupy}
                </span>
              )}
              <button
                // Ta sama pluskwa co w FilterPills: w <form> przycisk bez typu
                // jest submitem — zakładki mają przełączać, nie wysyłać.
                type="button"
                onClick={() => { if (!wygaszona) onTabChange(tab.value); }}
                disabled={wygaszona}
                aria-disabled={wygaszona || undefined}
                title={wygaszona ? tab.powod : undefined}
                className={cn(
                  "relative flex h-9 sm:h-10 flex-initial min-w-0 items-center justify-center rounded-full px-3 sm:px-5 py-1.5 font-medium transition-colors text-xs sm:text-sm whitespace-nowrap",
                  /* Jedna linia = pigułka nie ma prawa się skurczyć; nadmiar przewija pasek,
                     nie obcina słów („Obiek", „Dokument" — 10.09.2026). */
                  jednaLinia && "shrink-0 min-w-fit sm:px-3.5",
                  /* Wygaszona: to samo przyciemnienie, co wiersz wstrzymanego klienta na liście —
                     platforma ma jeden sposób mówienia „to jest, ale nieczynne”. Kursor `not-allowed`
                     odpowiada na kliknięcie, zanim ktoś zdąży się zastanowić, czemu nic się nie dzieje. */
                  wygaszona
                    ? "cursor-not-allowed text-foreground/35"
                    : "cursor-pointer",
                  !wygaszona && (isActive
                    ? "text-foreground"
                    : "text-foreground/75 hover:text-foreground hover:bg-foreground/5")
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-full overflow-hidden"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  >
                    <AnimatedBorderPill accentColor={accentColor} />
                  </motion.span>
                )}
                <span className={cn("relative z-20 flex min-w-0 items-center justify-center gap-1.5", jednaLinia ? "shrink-0" : "truncate")}>
                  {tab.icon}
                  {tab.label}
                  {/* Zero ukryte celowo — „0" obok nazwy czyta się jak usterka. */}
                  {!!tab.licznik && (
                    <span
                      className={cn(
                        "ml-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                        wygaszona ? "bg-foreground/5 text-foreground/35"
                          : isActive ? "bg-primary/20 text-primary"
                          : "bg-foreground/10 text-muted-foreground"
                      )}
                    >
                      {tab.licznik}
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedTabs;
