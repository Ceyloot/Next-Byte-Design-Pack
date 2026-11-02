/**
 * ════════════════════════════════════════════════════════════════════════
 *  PANEL FILTRÓW — wspólne klocki dla KAŻDEGO ekranu z filtrowaniem
 * ════════════════════════════════════════════════════════════════════════
 *
 * Powód istnienia tego pliku: cała konstrukcja panelu filtrów — kratki
 * wielokrotnego wyboru, nagłówek grupy z licznikiem, zakres dat na dwóch
 * kalendarzach, przycisk „Filtry" z plakietką i powłoka panelu na pełną
 * szerokość — powstała w `CRMFilterBar` i tam została ZAMUROWANA. Drugi ekran,
 * który potrzebował filtrów (Baza Danych → Podmioty), musiałby ją przepisać
 * słowo w słowo. Dokładnie tak powstaje dług, który ta platforma już raz
 * spłacała: dziewięć kopii nagłówka sekcji, 325 ręcznych cieni, sześć języków
 * przycisku naraz.
 *
 * Dlatego klocki mieszkają TUTAJ, a `CRMFilterBar` i `PartnersFilterBar` są
 * tylko listą grup — każdy wie, CO filtruje, żaden nie wie, JAK to narysować.
 *
 * ── CZEGO NIE ROBIĆ ─────────────────────────────────────────────────────
 * • Nie dokładać tu wiedzy o konkretnym ekranie (etapy pipeline, role
 *   partnerów). Panel przyjmuje opcje, nie zna ich znaczenia.
 * • Nie zaszywać kolorów z palety Tailwinda — tylko tokeny motywu.
 * • Nie zamieniać powłoki na `Popover`. Popover przykleja się do przycisku
 *   i pilnuje, żeby nie wyjść poza ekran, więc powyżej ~800 px zaczyna uciekać
 *   w bok albo rosnąć w górę. Kajetan (CRM): „filtry nie wyświetlają się na
 *   całej szerokości ekranu tylko koncentrują się na małej szerokości a dużej
 *   wysokości". Panel w linii bierze CAŁĄ szerokość paska i tak ma zostać.
 */
import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, Filter, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { NaglowekSekcji } from '@/components/ui/naglowek-sekcji';
import { klasyKafelka } from '@/components/ui/tile';

/** Dołóż albo zabierz wartość z listy wyborów. Wspólne dla wszystkich kratek. */
export const przelaczWybor = <T,>(lista: T[], v: T): T[] =>
  lista.includes(v) ? lista.filter(x => x !== v) : [...lista, v];

export interface OpcjaFiltru<T extends string = string> {
  key: T;
  label: string;
}

/**
 * KRATKI WIELOKROTNEGO WYBORU — podstawowa forma filtru na tej platformie.
 *
 * Wielokrotny wybór, a nie lista rozwijana z jedną wartością: „pokaż dostawców
 * ORAZ podwykonawców" to normalne pytanie, a pojedynczy wybór każe zadać je
 * dwa razy i sklejać wynik w głowie.
 */
export const WieloKratka = <T extends string>({
  opcje, wartosc, onZmiana,
}: {
  opcje: readonly OpcjaFiltru<T>[];
  wartosc: T[];
  onZmiana: (v: T[]) => void;
}) => (
  <div className="space-y-1.5">
    {opcje.map(o => (
      <label
        key={o.key}
        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
      >
        <Checkbox
          checked={wartosc.includes(o.key)}
          onCheckedChange={() => onZmiana(przelaczWybor(wartosc, o.key))}
        />
        <span className="flex-1">{o.label}</span>
      </label>
    ))}
  </div>
);

export interface GrupaOpcji<T extends string = string> {
  key: string;
  label: string;
  /** Pozycje do zaznaczenia bezpośrednio w tej grupie. */
  opcje?: OpcjaFiltru<T>[];
  /** Zagnieżdżone grupy — struktura może mieć dowolną głębokość. */
  podgrupy?: GrupaOpcji<T>[];
}

/**
 * Wszystkie pozycje w grupie i pod nią — do liczników, zwijania i słowników
 * nazw w miejscu użycia.
 *
 * Wystawione na zewnątrz celowo: konsument, który spłaszczy grupy „na piechotę"
 * jednym poziomem, przy strukturze zagnieżdżonej dostanie `undefined` zamiast
 * listy. Tak właśnie wysypał się pasek filtrów Podmiotów, gdy kategorie
 * przestały mieć własne `opcje`, a zyskały `podgrupy`.
 */
export const pozycjeGrupy = <T extends string>(g: GrupaOpcji<T>): OpcjaFiltru<T>[] => [
  ...(g.opcje ?? []),
  ...(g.podgrupy ?? []).flatMap(pozycjeGrupy),
];

/** To samo dla całej listy grup. */
export const pozycjeGrup = <T extends string>(grupy: readonly GrupaOpcji<T>[]): OpcjaFiltru<T>[] =>
  grupy.flatMap(pozycjeGrupy);

const Galaz = <T extends string>({
  grupa, wartosc, onZmiana, zaznaczone, poziom,
}: {
  grupa: GrupaOpcji<T>;
  wartosc: T[];
  onZmiana: (v: T[]) => void;
  zaznaczone: Set<string>;
  poziom: number;
}) => {
  const pozycje = useMemo(() => pozycjeGrupy(grupa), [grupa]);
  const ile = pozycje.filter(o => zaznaczone.has(o.key)).length;
  const [otwarta, setOtwarta] = useState(false);
  /* Grupa z zaznaczeniem otwiera się SAMA — inaczej aktywny filtr dałoby się
     przeoczyć, a lista wyglądałaby na zawężoną bez powodu. */
  const rozwinieta = otwarta || ile > 0;
  const Strzalka = rozwinieta ? ChevronDown : ChevronRight;

  return (
    <div>
      <button data-w-odczycie=""
        type="button"
        onClick={() => setOtwarta(v => !v)}
        aria-expanded={rozwinieta}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-1 py-1 text-xs transition-colors hover:bg-muted/50 hover:text-foreground',
          // Poziom 0 to KATEGORIA — mocniejsza, bo nadaje ramy całej liście.
          poziom === 0 ? 'font-semibold uppercase tracking-wide text-foreground/80' : 'text-muted-foreground',
        )}
      >
        <Strzalka className="h-3 w-3 shrink-0" />
        <span className="flex-1 text-left truncate">{grupa.label}</span>
        {ile > 0 && <span className="tabular-nums text-primary">{ile}</span>}
        <span className="tabular-nums opacity-50">{pozycje.length}</span>
      </button>

      {rozwinieta && (
        <div className="pl-3">
          {pozycje.length === 0 ? (
            /* Pusta grupa mówi „tu jeszcze nic nie ma", zamiast rozwijać się
               w nicość i wyglądać na zepsutą. */
            <p className="px-2 py-1 text-xs text-muted-foreground">Brak pozycji w tej kategorii.</p>
          ) : (
            <>
              {(grupa.podgrupy ?? []).map(pod => (
                <Galaz
                  key={pod.key}
                  grupa={pod}
                  wartosc={wartosc}
                  onZmiana={onZmiana}
                  zaznaczone={zaznaczone}
                  poziom={poziom + 1}
                />
              ))}
              {(grupa.opcje ?? []).length > 0 && (
                <WieloKratka opcje={grupa.opcje!} wartosc={wartosc} onZmiana={onZmiana} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * KRATKI W ZWIJANYCH GRUPACH — dla list, które rosną, i dla struktur, które
 * mają własną hierarchię.
 *
 * Płaska `WieloKratka` przestaje działać, gdy pozycji robi się kilkadziesiąt:
 * panel wydłuża się w nieskończoność, a żeby znaleźć jeden wpis, trzeba
 * przeczytać wszystkie. Kajetan o filtrze typów produktu: „tutaj rozwijane
 * listy zgodnie z typami kanonicznymi bo ta lista bardzo mocno urośnie".
 *
 * Grupy mogą się ZAGNIEŻDŻAĆ dowolnie głęboko (`podgrupy`), bo filtr ma
 * odwzorowywać strukturę źródła, a nie własne uproszczenie. Nagłówek każdego
 * poziomu niesie licznik zaznaczeń i liczbę pozycji pod spodem, więc po
 * zwinięciu dalej widać, gdzie coś ustawiono.
 *
 * ── STAŁA WYSOKOŚĆ I WŁASNE PRZEWIJANIE ─────────────────────────────────
 * Kajetan: „rozwinięcie rozpiernicza całą strukturę wewnątrz".
 *
 * Panel stoi na KOLUMNACH CSS, a te przy każdej zmianie wysokości treści
 * przeliczają rozkład OD NOWA — rozwinięcie jednej grupy przerzucało „Status
 * współpracy" do sąsiedniej kolumny i cały panel skakał pod kursorem.
 * Zmierzone: to zachowanie `column-count`, nie usterka układu.
 *
 * Dlatego lista ma WYSOKOŚĆ STAŁĄ, nie maksymalną: przy `max-height` panel
 * dalej rósłby od zwiniętego do rozwiniętego stanu i rebalans wracał.
 * Rozwijanie przewija się teraz WEWNĄTRZ ramki, a geometria panelu nie drgnie.
 */
export const WieloKratkaGrupowana = <T extends string>({
  grupy, wartosc, onZmiana, wysokosc = 224,
}: {
  grupy: readonly GrupaOpcji<T>[];
  wartosc: T[];
  onZmiana: (v: T[]) => void;
  /** Wysokość ramki w pikselach. Stała — patrz komentarz wyżej. */
  wysokosc?: number;
}) => {
  const zaznaczone = useMemo(() => new Set<string>(wartosc), [wartosc]);

  return (
    <div className="space-y-1 overflow-y-auto pr-1" style={{ height: wysokosc }}>
      {grupy.map(g => (
        <Galaz
          key={g.key}
          grupa={g}
          wartosc={wartosc}
          onZmiana={onZmiana}
          zaznaczone={zaznaczone}
          poziom={0}
        />
      ))}
    </div>
  );
};

/**
 * GRUPA FILTRÓW w panelu. Nagłówek bierzemy z biblioteki (`NaglowekSekcji`),
 * a nie z własnego `<Label>` — to ten sam komponent, który rozdziela sekcje
 * w pasku bocznym, notatkach i Prompt EX, więc panel czyta się tym samym
 * językiem co reszta platformy.
 *
 * Licznik pokazuje, ile wyborów jest w tej grupie aktywnych. Zero się nie
 * pokazuje — to zachowanie `NaglowekSekcji`, nie nasze: „0" obok nazwy czyta
 * się jak błąd, a pustkę komunikuje i tak zawartość pod spodem.
 */
export const SekcjaFiltru: React.FC<{
  ikona: LucideIcon;
  etykieta: string;
  licznik: number;
  children: React.ReactNode;
}> = ({ ikona, etykieta, licznik, children }) => (
  // `break-inside-avoid` — sekcja nie może się rozpaść między kolumnami CSS.
  <div className="break-inside-avoid mb-5 space-y-2">
    <NaglowekSekcji ikona={ikona} etykieta={etykieta} licznik={licznik} wariant="cichy" />
    <div className="space-y-2.5">{children}</div>
  </div>
);

/** Zakres dat na dwóch kalendarzach — „od" i „do", obie strony opcjonalne. */
export const ZakresDat: React.FC<{
  od: string | null;
  do_: string | null;
  onOd: (v: string | null) => void;
  onDo: (v: string | null) => void;
  etykieta: string;
}> = ({ od, do_, onOd, onDo, etykieta }) => {
  const fmt = (iso: string | null) => iso ? format(new Date(iso), 'd MMM yy', { locale: pl }) : '—';
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{etykieta}</Label>
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs justify-start flex-1">
              <CalendarIcon className="h-3 w-3 mr-1.5" />{fmt(od)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={od ? new Date(od) : undefined}
              onSelect={d => onOd(d ? d.toISOString().slice(0, 10) : null)}
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>
        <span className="text-xs text-muted-foreground">→</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs justify-start flex-1">
              <CalendarIcon className="h-3 w-3 mr-1.5" />{fmt(do_)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={do_ ? new Date(do_) : undefined}
              onSelect={d => onDo(d ? d.toISOString().slice(0, 10) : null)}
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

/**
 * PRZYCISK „FILTRY" — PRZEŁĄCZA panel w linii, nie otwiera popovera
 * (powód w nagłówku pliku). Plakietka niesie liczbę aktywnych grup, żeby po
 * zwinięciu panelu było widać, że lista jest zawężona — bez tego łatwo uznać
 * pustą listę za brak danych zamiast za skutek filtra.
 */
export const PrzyciskFiltrow: React.FC<{
  otwarty: boolean;
  onPrzelacz: () => void;
  aktywne: number;
  podswietlony?: boolean;
}> = ({ otwarty, onPrzelacz, aktywne, podswietlony }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onPrzelacz}
    aria-expanded={otwarty}
    className={cn('h-8 text-xs gap-1.5', (podswietlony || otwarty) && 'border-primary/50 text-primary')}
  >
    <Filter className="h-3 w-3" /> Filtry
    {aktywne > 0 && <Badge variant="secondary" className="h-4 px-1 text-[9px]">{aktywne}</Badge>}
    <ChevronDown className={cn('h-3 w-3 transition-transform', otwarty && 'rotate-180')} />
  </Button>
);

/**
 * POWŁOKA PANELU — pełna szerokość, KOLUMNY CSS, nie siatka.
 *
 * Siatka wymaga ręcznego przypisania sekcji do kolumn, a sekcje mają bardzo
 * różne wysokości (13 etapów pipeline vs 2 typy klienta) — przy każdym podziale
 * jedna połowa panelu zostawała pusta, a druga sięgała dołu. Kolumny CSS
 * bilansują wysokość SAME; `break-inside-avoid` na `SekcjaFiltru` pilnuje
 * tylko, żeby żadna nie rozpadła się na pół.
 *
 * Materiał z `klasyKafelka` — panel nie jest popoverem, więc powierzchnię
 * trzeba podać z biblioteki, a nie pisać własnej.
 */
export const PanelFiltrow: React.FC<{
  children: React.ReactNode;
  /** Podsumowanie w stopce, np. „12 z 48 pasuje”. Stopka pokazuje się tylko z filtrem. */
  podsumowanie?: React.ReactNode;
  aktywne?: boolean;
  onWyczysc?: () => void;
  /**
   * Własne szerokości kolumn (`grid-template-columns`) zamiast kolumn CSS.
   *
   * Kolumny CSS dzielą panel NA RÓWNO i tyle ich jest, ile zadeklarowano —
   * przy trzech blokach w układzie czterokolumnowym jeden pas zostaje pusty,
   * a grupa z długimi nazwami (typy z taksonomii) dusi się w 25% szerokości
   * i zawija tekst. Kajetan: „przesuń w prawo tak żeby miejsce na kategorie
   * z taksonomii miało więcej przestrzeni żeby nie musiało zawijać tekstu".
   *
   * Podanie tej wartości włącza SIATKĘ, w której szerokości ustala konsument.
   * Bez niej zostają kolumny CSS z auto-bilansowaniem — tak działa panel CRM
   * i tak ma zostać: tam sekcje mają bardzo różne wysokości i to one, a nie
   * długość nazw, decydują o układzie.
   */
  siatka?: string;
}> = ({ children, podsumowanie, aktywne, onWyczysc, siatka }) => (
  <div className={cn(klasyKafelka({ elewacja: 'uniesiona' }), 'w-full p-4')}>
    {siatka ? (
      <div
        className="grid grid-cols-1 gap-x-6 md:[grid-template-columns:var(--kolumny-panelu)] items-start"
        style={{ ['--kolumny-panelu' as any]: siatka }}
      >
        {children}
      </div>
    ) : (
      <div className="columns-1 md:columns-2 xl:columns-4 gap-x-6">{children}</div>
    )}

    {aktywne && onWyczysc && (
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground tabular-nums">{podsumowanie}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={onWyczysc}
        >
          <X className="h-3 w-3" /> Wyczyść wszystko
        </Button>
      </div>
    )}
  </div>
);

/**
 * KOLUMNA PANELU. `display: contents` sprawia, że wrapper znika z układu,
 * a jego dzieci trafiają wprost do strumienia kolumn CSS — dzięki temu można
 * grupować sekcje logicznie w kodzie, nie wpływając na bilansowanie wysokości.
 */
export const KolumnaFiltrow: React.FC<{
  children: React.ReactNode;
  /**
   * W SIATCE kolumna musi być zwykłym blokiem — `display: contents` znika
   * z układu i wtedy to POJEDYNCZE SEKCJE stają się komórkami siatki, więc
   * przypisanie ich do kolumn przestaje działać.
   */
  blok?: boolean;
}> = ({ children, blok }) => (
  <div className={blok ? undefined : 'contents'}>{children}</div>
);

/** Plakietka aktywnego filtru z krzyżykiem — pasek pod paskiem narzędzi. */
export const PlakietkaFiltru: React.FC<{
  etykieta: string;
  onUsun: () => void;
}> = ({ etykieta, onUsun }) => (
  <Badge variant="outline" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 border-primary/30 text-primary">
    {etykieta}
    <button data-w-odczycie="" onClick={onUsun} className="hover:bg-primary/10 rounded">
      <X className="h-2.5 w-2.5" />
    </button>
  </Badge>
);
