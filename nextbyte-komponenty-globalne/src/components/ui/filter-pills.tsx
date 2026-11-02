import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AnimatedBorderPill } from '@/components/ui/AnimatedTabs';
import { bezSkoku } from '@/lib/stalePrzewiniecie';
import { SZKLO } from '@/components/ui/tile';
import type { LucideIcon } from 'lucide-react';

export interface FilterPillOption<T extends string = string> {
  key: T;
  label: string;
  /** Optional badge text shown next to the label */
  badge?: string;
  /**
   * Ikona przed etykietą (26.09.2026). Przełącznik „Udostępnij / Publikuj"
   * w notatkach wstawiał do `label` EMOJI (👥 🌐), bo pigułka nie przyjmowała
   * ikony — emoji rysuje się inaczej w każdym systemie i nie idzie za motywem.
   */
  ikona?: LucideIcon;
  /**
   * Pigułka, która stoi w układzie, ale jest nieczynna (10.10.2026) — ekran ustawień Kalkulatora odwzorowuje jego kroki
   * i sekcje 1:1, a te bez ustawień wygasza. Ten sam język, co `wygaszona` w `AnimatedTabs`: przyciemnienie, kursor
   * `not-allowed`, `powod` w podpowiedzi.
   */
  wygaszona?: boolean;
  /** Jedno zdanie: czemu ta pigułka jest wygaszona. */
  powod?: string;
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Unique layoutId prefix for framer-motion (defaults to 'filter-pills') */
  layoutId?: string;
  /**
   * `lg` — dla przełącznika stojącego samodzielnie na stronie (wybór okresu
   * rozliczenia, logowanie/rejestracja). Dodane 05.08.2026: bez tego rozmiaru
   * `PricingSwitch` i przełącznik w `Auth` były PRZEPISANE od zera, każdy
   * z własnym `bg-card` w środku — czyli nieprzezroczystą płytą zamiast tafli.
   * Brakujący rozmiar był jedynym powodem tych dwóch kopii.
   */
  size?: 'xs' | 'sm' | 'lg';
  className?: string;
}

/* Pigułka przyjechała z `AnimatedTabs` — była tu kopia z wnętrzem `bg-card`,
   czyli nieprzezroczystą kartą bez rozmycia. Jedno źródło, jeden materiał. */

const ROZMIAR = {
  /* `xs` (25.09.2026) — do WĄSKIEJ kolumny: panel Aktywności w stopce paska
     bocznego ma ~216 px na treść, a „Wszystkie · Nieprzeczytane" w `sm`
     zajmowało 214 px z obudową. Litera zostaje 11 px (poniżej siada
     czytelność), oszczędność idzie z odstępów. */
  xs: 'px-2.5 py-1 text-[11px]',
  sm: 'px-4 py-2 text-xs',
  lg: 'h-10 sm:h-12 px-4 sm:px-6 py-2 text-sm sm:text-base',
} as const;

export function FilterPills<T extends string = string>({
  options,
  value,
  onChange,
  layoutId = 'filter-pills',
  size = 'sm',
  className,
}: FilterPillsProps<T>) {
  /*
    MATERIAŁ Z BIBLIOTEKI, NIE `bg-muted/30` (05.08.2026).

    Było tu zwykłe wypełnienie — na `/cennik` czytało się jako ciemna kapsuła
    nad tłem, a nie jako szkło. Michał wskazał to wprost razem z kartami planów.

    `SZKLO` jest bezpieczne we WSZYSTKICH czterech użyciach, także tam, gdzie
    pigułki stoją na karcie: reguła zagnieżdżenia w `index.css` zdejmuje wtedy
    `backdrop-filter` i zostawia wypełnienie z rantem, czyli dokładnie
    wgłębienie. Nie trzeba tego przełączać ręcznie.
  */
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border/50 p-1',
        SZKLO,
        className,
      )}
    >
      {options.map((option) => {
        const isActive = value === option.key;
        const wygaszona = !!option.wygaszona && !isActive;
        return (
          <button data-w-odczycie=""
            key={option.key}
            // Bez jawnego typu przycisk w <form> jest submitem: przełączenie
            // zakładek Logowanie/Rejestracja WYSYŁAŁO formularz i wyskakiwał
            // toast „Wypełnij wszystkie pola" (zgłoszone przez Michała 17.08).
            type="button"
            /* Przełączenie bez skoku ekranu (`lib/stalePrzewiniecie`, Kajetan 06.10.2026): pigułka zostaje w tym samym
               miejscu, a krótsza treść pod nią nie przewija strony na górę ani na dół. */
            onClick={e => bezSkoku(e.currentTarget, () => onChange(option.key))}
            aria-pressed={isActive}
            /* Wygaszona = `disabled`: przeglądarka nie wywoła kliknięcia, więc przełącznik zostaje jeden dla wszystkich. */
            disabled={wygaszona}
            aria-disabled={wygaszona || undefined}
            title={wygaszona ? option.powod : undefined}
            className={cn(
              'relative shrink-0 rounded-full font-medium transition-colors',
              wygaszona ? 'cursor-not-allowed' : 'cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              ROZMIAR[size],
              /* `foreground/65`, nie `muted-foreground` (26.09.2026): napis ma
                 11–12 px, a `--muted-foreground` motywu Jasnego daje przy tym
                 rozmiarze 4,1 : 1 na tle i 4,3 : 1 na szybie (pomiar z Panelu
                 Głównego). Domieszka pisma: jasny 5,3 : 1, ciemny 7,5 : 1 —
                 i wygląda tak samo cicho. */
              wygaszona
                ? 'text-foreground/35'
                : isActive
                  ? 'text-foreground'
                  : 'text-foreground/65 hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full overflow-hidden"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              >
                <AnimatedBorderPill />
              </motion.span>
            )}
            <span className="relative z-20 flex items-center gap-1.5">
              {option.ikona && <option.ikona className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {option.label}
              {option.badge && (
                <span className="licznik-pigulki inline-flex items-center rounded-full bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
