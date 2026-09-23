import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PLAKIETKA — jeden wygląd wszystkich znaczników stanu
 * ════════════════════════════════════════════════════════════════════════
 *
 * DLACZEGO TO JEST NAJPILNIEJSZY KOMPONENT W PLATFORMIE
 * Zmierzone 31.07.2026 na całym `src`:
 *
 *     <Badge>          982 użycia,  516 różnych wyglądów,  390 użytych RAZ
 *     <SelectTrigger>  364 użycia,  121 różnych wyglądów,   76 użytych RAZ
 *     <Input>         1173 użycia,   34 różne wyglądy,      19 użytych RAZ
 *
 * Czyli: pole tekstowe jest w praktyce spójne (1091 z 1173 użyć nie nadpisuje
 * niczego), a PLAKIETKA jest najbardziej rozjechanym elementem platformy —
 * ponad pięćset wariantów jednej rzeczy, z czego prawie czterysta istnieje
 * w dokładnie jednym miejscu. Stąd ten plik powstał pierwszy, przed polami.
 *
 * TRZY KOLORY, NIE PIĘĆ
 * Ustalone przy wskaźnikach: kolor motywu + czerwień dla limitów. Zieleń
 * i żółć wypadły świadomie — przy trzech kolorach naraz plakietka przestaje
 * cokolwiek znaczyć, a na motywie Smoczym (pomarańcz) żółć zlewa się z akcentem.
 * `uwaga` istnieje więc jako SENS, ale niesie kolor motywu, nie własny.
 *
 * ZERO WYPEŁNIENIA KOLOREM
 * Ten sam język, co przyciski i kafelki: obwódka + kilka procent wypełnienia.
 * Akcent niesie tekst i obwódka, nigdy pełne tło. Dzięki temu plakietka nie
 * konkuruje z danymi, przy których stoi.
 */

const INTENCJA = {
  neutralna: 'border-border bg-muted/50 text-muted-foreground',
  akcent:    'border-primary/30 bg-primary/10 text-primary',
  /** ten sam kolor co `akcent` — patrz nagłówek pliku */
  uwaga:     'border-primary/30 bg-primary/10 text-primary',
  krytyczna: 'border-destructive/40 bg-destructive/10 text-destructive',
} as const;

/** Kropka stanu dziedziczy kolor tekstu plakietki — jedno źródło koloru. */
const ROZMIAR = {
  mala:    'h-5 gap-1 px-1.5 text-[11px]',
  srednia: 'h-6 gap-1.5 px-2 text-[11px]',
} as const;

export type IntencjaPlakietki = keyof typeof INTENCJA;
export type RozmiarPlakietki = keyof typeof ROZMIAR;

export interface PlakietkaProps extends React.HTMLAttributes<HTMLSpanElement> {
  intencja?: IntencjaPlakietki;
  rozmiar?: RozmiarPlakietki;
  ikona?: LucideIcon;
  /** kropka stanu z lewej — dla rzeczy żywych: „online", „trwa", „nowe" */
  kropka?: boolean;
  /** kropka pulsuje; wyłączane przez `prefers-reduced-motion` w index.css */
  zywa?: boolean;
}

export const Plakietka = React.forwardRef<HTMLSpanElement, PlakietkaProps>(function Plakietka(
  { intencja = 'neutralna', rozmiar = 'mala', ikona: Ikona, kropka, zywa, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-semibold uppercase tracking-wide',
        INTENCJA[intencja],
        ROZMIAR[rozmiar],
        className,
      )}
      {...rest}
    >
      {kropka && (
        <span aria-hidden="true" className="relative flex h-1.5 w-1.5 shrink-0">
          {zywa && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
          )}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {Ikona && <Ikona aria-hidden="true" className={cn('shrink-0', rozmiar === 'mala' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />}
      {children}
    </span>
  );
});

/**
 * LICZNIK — plakietka z samą liczbą. Osobno, bo ma inne wymagania:
 * musi być kołem przy jednej cyfrze i pigułką przy trzech, a liczby chodzą
 * w `tabular-nums`, żeby nie skakały przy odliczaniu w górę.
 */
export const Licznik: React.FC<{
  wartosc: number;
  intencja?: IntencjaPlakietki;
  /** powyżej tej wartości pokazuje „99+" zamiast rozpychać pasek */
  maks?: number;
  className?: string;
}> = ({ wartosc, intencja = 'akcent', maks = 99, className }) => (
  <span
    className={cn(
      'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border px-1 text-[11px] font-semibold tabular-nums',
      INTENCJA[intencja],
      className,
    )}
  >
    {wartosc > maks ? `${maks}+` : wartosc}
  </span>
);

export const TOKENY_PLAKIETKI = { INTENCJA, ROZMIAR } as const;

/* ══════════════════════════════════════════════════════════════════════════
   AWATAR — znak tożsamości: człowieka albo dostawcy modelu.
   ══════════════════════════════════════════════════════════════════════════

   Jeden komponent na dwa zastosowania, które dziś są dwoma osobnymi kawałkami
   kodu: awatar użytkownika (Kalendarz, komentarze) i monogram dostawcy modelu
   („A" dla Anthropic, „O" dla OpenAI) w liście wyboru. To jest ta sama rzecz —
   kwadratowy znak z inicjałem, ewentualnie zastąpiony obrazkiem.

   INICJAŁY LICZONE, NIE PODANE. Wpisywanie ich ręcznie przy każdym użyciu
   kończy się tak, że jedno miejsce pokazuje „MP", drugie „M", a trzecie pełne
   imię. Tutaj zasada jest jedna: pierwsze litery pierwszych dwóch słów.
*/
export type RozmiarAwatara = 'maly' | 'sredni' | 'duzy';

const ROZMIAR_AWATARA: Record<RozmiarAwatara, string> = {
  maly:   'h-6 w-6 text-[11px]',
  sredni: 'h-9 w-9 text-[14px]',
  duzy:   'h-11 w-11 text-[16px]',
};

export interface AwatarProps {
  /** pełna nazwa — inicjały liczone są z niej, nie podawane osobno */
  nazwa: string;
  /** zdjęcie; gdy go nie ma albo nie wczyta się, zostają inicjały */
  obraz?: string | null;
  rozmiar?: RozmiarAwatara;
  /** akcent zamiast neutralnego — dla dostawcy wybranego modelu */
  wyrozniony?: boolean;
  className?: string;
}

export const Awatar: React.FC<AwatarProps> = ({
  nazwa, obraz, rozmiar = 'sredni', wyrozniony, className,
}) => {
  const [padl, setPadl] = React.useState(false);

  const inicjaly = React.useMemo(
    () => nazwa.trim().split(/\s+/).slice(0, 2).map((s) => s[0] ?? '').join('').toUpperCase(),
    [nazwa],
  );

  return (
    <span
      // Nazwa jest OBOK w treści, więc czytnik nie musi jej słyszeć dwa razy.
      aria-hidden="true"
      title={nazwa}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-lg border font-semibold tracking-tight',
        ROZMIAR_AWATARA[rozmiar],
        /*
          POWIERZCHNIA Z WŁASNYM ŚWIATŁEM, nie płaska plama.
          Gradient jaśniejszy u góry i gasnący w dół — ten sam gest, którym
          kafelek odcina się od tła. Bez niego awatar obok Łuków i Pasków zasobu
          wyglądał jak szary kwadrat wklejony z innego interfejsu.
          Do tego wewnętrzny refleks przy górnej krawędzi: 1 px liczony od
          `--foreground`, więc odwraca się razem z motywem.
        */
        'shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.10)]',
        wyrozniony
          ? 'border-primary/40 bg-gradient-to-b from-[hsl(var(--primary)/0.28)] to-[hsl(var(--primary)/0.10)] text-primary'
          : 'border-border bg-gradient-to-b from-[hsl(var(--foreground)/0.10)] to-[hsl(var(--foreground)/0.03)] text-muted-foreground',
        className,
      )}
    >
      {obraz && !padl ? (
        <img
          src={obraz}
          alt=""
          onError={() => setPadl(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        inicjaly
      )}
    </span>
  );
};
