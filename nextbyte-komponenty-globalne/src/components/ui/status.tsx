import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  STATUS — jeden komponent do wyświetlania stanu, cztery barwy
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (17.09.2026): „potrzebujemy jednego komponentu wizualnego do wyświetlania statusu; może mieć różny
 * kolor na zasadzie zielony, czerwony, żółty lub biały/szary — ograniczona ilość kolorów”.
 *
 * Znaczenie barw (docs/STANDARD-WYGLADU.md §1):
 *   dobrze    — zielony  — jest, zrobione, zgodne, rozliczone
 *   problem   — czerwony — brak, po terminie, strata, błąd
 *   uwaga     — żółty    — w toku, czeka, do sprawdzenia
 *   neutralny — szary    — informacja bez oceny (liczba, data, etap)
 *
 * Barwy z tokenów motywu (`--success`, `--destructive`, `--warning`, `--muted`) — panel zarządzania wyglądem
 * zmieni je w jednym miejscu. Innych kolorów statusu nie ma: krem to akcja (przycisk), nie stan.
 */

export type TonStatusu = 'dobrze' | 'problem' | 'uwaga' | 'neutralny' | 'akcent';

export const TONY_STATUSU: Record<TonStatusu, string> = {
  dobrze: 'border-success/30 bg-success/10 text-success',
  problem: 'border-destructive/35 bg-destructive/10 text-destructive',
  uwaga: 'border-warning/35 bg-warning/10 text-warning',
  neutralny: 'border-border bg-muted/40 text-muted-foreground',
  /* „Trwa" w barwie marki (26.09.2026, karta akcji asystenta): czynność, która
     się właśnie dzieje, nie jest ani ostrzeżeniem (żółty), ani oceną — to
     platforma pracuje. Barwa z `--primary`, więc idzie za motywem użytkownika. */
  akcent: 'border-primary/30 bg-primary/10 text-primary',
};

export interface StatusProps {
  ton?: TonStatusu;
  /** ikona przed tekstem (lucide), rysowana w rozmiarze 12 px */
  ikona?: React.ElementType;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * ════════════════════════════════════════════════════════════════════════
 *  NAJGORSZY SYGNAŁ WYGRYWA — kolor rekordu liczy komponent, nie ekran
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (06.10.2026, STANDARD-WYGLADU §19): „tu nie chodzi o pojedynczą moją zachciankę, tylko globalne zarządzanie
 * wyglądem”. ZMIERZONE: każdy ekran sam wyliczał ton rekordu (137 wyrażeń w 51 plikach [firma klienta]) — stąd czerwone
 * „bez kategorii” w zielonym zleceniu i zgodne z umową rozliczenie w szarym. Teraz ekran mówi, CO jest (pigułka,
 * czerwony napis), a rekord zbiera tony ze swojego nagłówka i bierze najgorszy.
 *
 * Kolejność: problem > uwaga > akcent > dobrze > neutralny. Akcent (wyróżnienie, np. transza łączona) przykrywa
 * „dobrze”, ale nie brak ani czekanie.
 */
const RANGA_TONU: Record<TonStatusu, number> = { neutralny: 0, dobrze: 1, akcent: 2, uwaga: 3, problem: 4 };
export type SygnalTonu = TonStatusu | null | undefined | false;
export const najgorszyTon = (...tony: readonly SygnalTonu[]): TonStatusu | undefined =>
  tony.reduce<TonStatusu | undefined>((w, t) => (t && (!w || RANGA_TONU[t] > RANGA_TONU[w]) ? t : w), undefined);

type ZglosTon = (id: string, ton: TonStatusu | null) => void;
const RejestrTonow = React.createContext<ZglosTon | null>(null);
/** Zasięg zbierania tonów — rekord obejmuje nim NAGŁÓWEK; treść po rozwinięciu dostaje `null` (nie zgłasza w górę). */
export const ZasiegTonow = RejestrTonow.Provider;

/** Element ze stanem zgłasza swój ton najbliższemu rekordowi (jeśli jest w jego nagłówku). */
export const useZglosTon = (ton: SygnalTonu) => {
  const zglos = React.useContext(RejestrTonow);
  const id = React.useId();
  React.useLayoutEffect(() => {
    if (!zglos) return undefined;
    zglos(id, ton || null);
    return () => zglos(id, null);
  }, [zglos, id, ton]);
};

/** Rekord: zbiera tony zgłoszone w nagłówku. `zglos` idzie do `ZasiegTonow`, `tony` do `najgorszyTon`. */
export const useRejestrTonow = () => {
  const [mapa, setMapa] = React.useState<Readonly<Record<string, TonStatusu>>>({});
  const zglos = React.useCallback<ZglosTon>((id, ton) => setMapa(m => {
    if ((m[id] ?? null) === ton) return m;
    const n = { ...m };
    if (ton) n[id] = ton; else delete n[id];
    return n;
  }), []);
  return { zglos, tony: Object.values(mapa) };
};

/**
 * REJESTR WIERSZY SEKCJI (Kajetan 08.10.2026, makieta „Panel językiem Kalkulatora”): sekcja jest zawsze neutralna, a jej stan
 * mówi pigułka w nagłówku — „N z M wymaga działania” albo „wszystko …”. Wiersze (rekordy) zgłaszają tu swój ton, także
 * neutralny, żeby sekcja znała M. Treść rozwiniętego rekordu dostaje `null` — pozycje w środku nie liczą się do sekcji.
 */
const RejestrWierszy = React.createContext<ZglosTon | null>(null);
export const ZasiegWierszy = RejestrWierszy.Provider;
export const useZglosWiersz = (ton: TonStatusu) => {
  const zglos = React.useContext(RejestrWierszy);
  const id = React.useId();
  React.useLayoutEffect(() => {
    if (!zglos) return undefined;
    zglos(id, ton);
    return () => zglos(id, null);
  }, [zglos, id, ton]);
};

export const Status: React.FC<StatusProps> = ({ ton = 'neutralny', ikona: Ikona, title, className, children }) => {
  useZglosTon(ton);
  return (
    <span title={title} className={cn(
      'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-meta font-semibold leading-none',
      TONY_STATUSU[ton], className,
    )}>
      {Ikona && <Ikona className="h-3 w-3" />}
      {children}
    </span>
  );
};

const TEKST_TONU: Record<TonStatusu, string> = {
  dobrze: 'text-success', problem: 'text-destructive', uwaga: 'text-warning', neutralny: 'text-muted-foreground', akcent: 'text-primary',
};

/**
 * Napis w barwie stanu, bez pigułki — np. „bez kategorii” w miejscu nazwy zlecenia. Zgłasza ton tak jak `Status`,
 * więc czerwony napis barwi cały rekord na czerwono (dotąd: czerwona nazwa w zielonej ramce, Zakupy 045.26).
 */
export const TekstStanu: React.FC<{ ton: TonStatusu; children: React.ReactNode }> = ({ ton, children }) => {
  useZglosTon(ton);
  return <span className={TEKST_TONU[ton]}>{children}</span>;
};

/**
 * Ton jako ZMIENNA CSS — dla kafelków i obwódek, które barwią się `--ton` (§16z-6), a nie klasami.
 *
 * ⚠️ JEDNA MAPA NA CAŁĄ PLATFORMĘ. Zapis `ton === 'dobrze' ? 'var(--success)' : …` zdążył się pojawić
 * w dwóch plikach [firma klienta], zanim ktokolwiek go nazwał — trzeci byłby miejscem, w którym któraś kopia
 * zapomni o nowym tonie. Neutralny celowo wraca do barwy marki: kafelek bez stanu ma wyglądać jak
 * kafelek, nie jak stan „nijaki”.
 */
export const zmiennaTonu = (ton: TonStatusu | 'akcent'): string =>
  `var(--${ton === 'dobrze' ? 'success' : ton === 'problem' ? 'destructive' : ton === 'uwaga' ? 'warning' : 'primary'})`;

/** Przejście ze starych intencji pigułki (TilePill) — żeby istniejące funkcje stanu nie musiały zmieniać typów. */
export const tonZIntencji = (i: 'pozytywna' | 'krytyczna' | 'neutralna' | 'akcent' | 'uwaga' | TonStatusu): TonStatusu =>
  i === 'pozytywna' || i === 'dobrze' ? 'dobrze'
    : i === 'krytyczna' || i === 'problem' ? 'problem'
    : i === 'uwaga' ? 'uwaga'
    : 'neutralny';

export default Status;
