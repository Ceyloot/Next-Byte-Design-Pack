/** Cennik — przełącznik okresu i siatka kart planów; jeden blok dla /cennik, strony premium i cennika firmowego. */
import React, { useState } from 'react';
import { ChevronDown, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterPills } from '@/components/ui/filter-pills';
import { Button } from '@/components/ui/button';
import { KartaPlanu } from './KartaPlanu';
import type { OkresRozliczenia, PlanCennika } from './typy';

/*
  ════════════════════════════════════════════════════════════════════════
   CENNIK — przełącznik okresu + siatka kart planów
  ════════════════════════════════════════════════════════════════════════

  Jeden blok dla trzech miejsc: `/cennik` (strona publiczna Artura), strona
  premium w aplikacji (`PricingSection`) i cennik firmowy
  (`CompanyPricingSection`). Różnią się WYŁĄCZNIE danymi (`plany`) i tym,
  co wstawią w gniazda: obok przełącznika (przycisk kreatora), między
  przełącznikiem a kartami (rozwinięty kreator) i pod kartami (przypis).

  Okres może być sterowany z zewnątrz (`okres` + `onOkresChange`), bo
  kreator doboru i tabela porównania na `/cennik` liczą z tego samego
  okresu co karty. Bez tych propsów blok trzyma okres sam.
*/

const ETYKIETY_OKRESU: { key: OkresRozliczenia; label: string }[] = [
  { key: 'miesiecznie', label: 'Miesięcznie' },
  { key: 'rocznie', label: 'Rocznie' },
];

export interface PrzelacznikOkresuProps {
  okres: OkresRozliczenia;
  onChange: (okres: OkresRozliczenia) => void;
  /** Plakietka przy „Rocznie", np. „do −17%"; pusta = bez plakietki. */
  plakietkaRabatu?: string;
  /** Własny `layoutId` pigułki, gdy na stronie stoją dwa przełączniki. */
  layoutId?: string;
  className?: string;
}

/**
 * Przełącznik Miesięcznie / Rocznie — `FilterPills` z biblioteki w rozmiarze
 * `lg`, czyli ten sam materiał i ta sama pigułka co w logowaniu i filtrach.
 * Zastępuje `PricingSwitch` i przepisany od zera `OkresToggle` Artura.
 */
export function PrzelacznikOkresu({
  okres, onChange, plakietkaRabatu = 'do −17%', layoutId = 'cennik-okres', className,
}: PrzelacznikOkresuProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {/* Bez jawnego `<FilterPills<T>>`: wtyczka znaczników Lovable (dev)
          nie parsuje argumentów typu w JSX i wywala moduł z 500. `T` wychodzi
          z `value`/`options`. */}
      <FilterPills
        size="lg"
        layoutId={layoutId}
        value={okres}
        onChange={onChange}
        options={ETYKIETY_OKRESU.map((o) =>
          o.key === 'rocznie' && plakietkaRabatu ? { ...o, badge: plakietkaRabatu } : o,
        )}
      />
    </div>
  );
}

export interface PrzyciskKreatoraProps {
  otwarty: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * „Nie wiesz który plan?" — przycisk rozwijający kreator doboru obok
 * przełącznika okresu; otwarty przechodzi na wariant `akcent`.
 */
export function PrzyciskKreatora({ otwarty, onClick, children, className }: PrzyciskKreatoraProps) {
  return (
    <Button
      type="button"
      variant={otwarty ? 'akcent' : 'obwodka'}
      onClick={onClick}
      aria-expanded={otwarty}
      className={cn('h-10 rounded-full px-5 text-sm sm:h-12', className)}
    >
      <Wand2 className="text-primary" />
      {children ?? 'Nie wiesz który plan?'}
      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', otwarty && 'rotate-180')} />
    </Button>
  );
}

export interface CennikProps {
  plany: PlanCennika[];
  /** Okres sterowany z zewnątrz; bez niego blok trzyma własny stan. */
  okres?: OkresRozliczenia;
  onOkresChange?: (okres: OkresRozliczenia) => void;
  /** Okres startowy w trybie niesterowanym. */
  domyslnyOkres?: OkresRozliczenia;
  /** Czy pokazać wiersz z przełącznikiem okresu. */
  przelacznik?: boolean;
  plakietkaRabatu?: string;
  /** Gniazdo w wierszu przełącznika — np. przycisk kreatora. */
  obokPrzelacznika?: React.ReactNode;
  /** Gniazdo między przełącznikiem a kartami — np. rozwinięty kreator. */
  miedzy?: React.ReactNode;
  /** Gniazdo pod kartami — przypis o cenach. */
  stopka?: React.ReactNode;
  /** Ciaśniejsze karty do wnętrza aplikacji. */
  kompaktowy?: boolean;
  /** Własne klasy siatki (kolumny, szerokość); domyślnie z liczby planów. */
  klasaSiatki?: string;
  /** Odwołanie do siatki kart — do przewijania po rekomendacji kreatora. */
  siatkaRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

/** Kolumny siatki z liczby planów: cztery karty łamią się 1 → 2 → 4, trzy 1 → 3. */
const klasyKolumn = (ile: number, kompaktowy: boolean) => {
  if (kompaktowy) return 'grid-cols-1 sm:grid-cols-3 max-w-4xl';
  if (ile >= 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
  if (ile === 3) return 'grid-cols-1 md:grid-cols-3 max-w-6xl';
  return 'grid-cols-1 md:grid-cols-2 max-w-4xl';
};

/** Cennik — przełącznik okresu i siatka kart planów sterowana danymi. */
export function Cennik({
  plany,
  okres: okresZewn,
  onOkresChange,
  domyslnyOkres = 'miesiecznie',
  przelacznik = true,
  plakietkaRabatu,
  obokPrzelacznika,
  miedzy,
  stopka,
  kompaktowy = false,
  klasaSiatki,
  siatkaRef,
  className,
}: CennikProps) {
  const [okresWewn, setOkresWewn] = useState<OkresRozliczenia>(domyslnyOkres);
  const okres = okresZewn ?? okresWewn;
  const zmienOkres = (o: OkresRozliczenia) => {
    onOkresChange?.(o);
    if (okresZewn === undefined) setOkresWewn(o);
  };

  return (
    <div className={cn('w-full', className)} data-cennik="">
      {przelacznik && (
        <div className="mb-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-5">
          <PrzelacznikOkresu okres={okres} onChange={zmienOkres} plakietkaRabatu={plakietkaRabatu} />
          {obokPrzelacznika}
        </div>
      )}

      {miedzy}

      <div
        ref={siatkaRef}
        className={cn('mx-auto grid items-stretch gap-6', klasaSiatki ?? klasyKolumn(plany.length, kompaktowy))}
      >
        {plany.map((plan) => (
          <KartaPlanu key={plan.id} plan={plan} okres={okres} kompaktowy={kompaktowy} />
        ))}
      </div>

      {stopka}
    </div>
  );
}
