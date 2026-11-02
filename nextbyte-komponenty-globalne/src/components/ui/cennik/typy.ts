import type { ComponentType, CSSProperties } from 'react';

/*
  ════════════════════════════════════════════════════════════════════════
   CENNIK — JEDEN KOMPONENT, DANE Z ZEWNĄTRZ
  ════════════════════════════════════════════════════════════════════════

  Michał (25.09.2026): „na podstronie /cennik jest nowy wygląd cennika
  Artura — zastosuj go globalnie, na stronie premium też, żeby to był JEDEN
  komponent cenników na platformie".

  Do tego dnia karta planu żyła w TRZECH kopiach: `PricingCard` (strona
  premium), `CompanyPlanCard` (cennik firmowy) i `PlanCard` w `CennikPage`
  Artura. Trzy fizyki powierzchni, trzy listy cech, trzy sposoby liczenia
  rabatu rocznego. Ten katalog zastępuje wszystkie trzy.

  KOMPONENT NIE ZNA ŻADNEJ KWOTY. Ceny, pule Byte, nazwy planów i listy cech
  przychodzą w `PlanCennika` — adapter przy stronie (`planyB2C.ts`,
  `planyB2B.ts`) przepisuje je z jednego źródła (`PLAN_TIERS`,
  `COMPANY_PLAN_CONFIG`). Test `cennik.test.tsx` pilnuje regexem, żeby żadna
  kwota nie wróciła do tych plików jako literał.
*/

export type OkresRozliczenia = 'miesiecznie' | 'rocznie';

/** Ikona wiersza — lucide albo własny SVG o tym samym kontrakcie. */
export type IkonaCennika = ComponentType<{ className?: string; style?: CSSProperties }>;

/**
 * Próg puli Byte. Każda kwota jest PRZEPISANA ze źródła, nic nie jest liczone
 * wzorem — rata roczna (`rocznie`) to ta sama liczba, którą klient zobaczy
 * w koszyku, a `fakturaRoczna` to kwota, którą pobierze Stripe.
 */
export interface ProgCennika {
  /** Pula w Byte na miesiąc; `null` = plan bez puli (Bezpłatny). */
  byte: number | null;
  /** Rata przy rozliczeniu miesięcznym. */
  miesiecznie: number;
  /** Rata miesięczna przy rozliczeniu rocznym (faktura / 12, przepisana). */
  rocznie: number;
  /** Kwota z faktury rocznej. */
  fakturaRoczna: number;
  /** Plakietka progu przy puli, np. „LEPSZY KURS". */
  plakietka?: string;
}

export type TonPlakietkiCennika = 'akcent' | 'cichy';

/** Pozycja listy cech — `**pogrubienie**` w tekście, ikona i opcjonalna plakietka. */
export interface CechaCennika {
  tekst: string;
  ikona: IkonaCennika;
  plakietka?: { tekst: string; ton?: TonPlakietkiCennika };
}

/**
 * Wiersz panelu zużycia („Każdego miesiąca aż: ~3,5 mln tokenów AI").
 * Liczba jest animowana licznikiem, tekst pokazywany tak, jak przyszedł.
 */
export interface WierszZuzycia {
  klucz: string;
  wartosc: number | string;
  /** Prefiks i sufiks przy liczbie, np. „~" i „ mln". */
  przed?: string;
  po?: string;
  /** Miejsca po przecinku animowanej liczby. */
  miejsca?: number;
  etykieta: string;
  ikona: IkonaCennika;
}

/** Stan karty przekazywany do etykiet i warunków przycisku. */
export interface StanKarty {
  okres: OkresRozliczenia;
  /** Indeks wybranego progu. */
  prog: number;
  /** Czy wybrany próg różni się od bieżącego progu użytkownika. */
  zmianaProgu: 'brak' | 'wyzej' | 'nizej';
  /** Ilość wybrana suwakiem dodatku; zero, gdy plan dodatku nie ma. */
  ilosc: number;
}

/** Dodatek niedostępny w tym planie — etykieta, to, co stoi w miejscu ilości, i podpis pod paskiem. */
export interface DodatekZablokowany {
  etykieta: string;
  /** Tekst w miejscu ilości, np. „brak". */
  wartosc: string;
  /** Podpis pod paskiem, np. „od planu One". */
  podpis?: string;
}

/**
 * Dodatek ilościowy planu — suwak od zera do `max`, np. miejsca Premium dla
 * pracowników. Jego cena dolicza się do ceny karty na żywo, a wybraną ilość
 * dostaje akcja przycisku.
 */
export interface DodatekCennika {
  /** Etykieta wiersza, np. „Premium dla zespołu:". */
  etykieta: string;
  max: number;
  /** Cena jednej sztuki: rata miesięczna, rata przy rozliczeniu rocznym i faktura roczna. */
  miesiecznie: number;
  rocznie: number;
  fakturaRoczna: number;
  /** Odmiana jednostki: jedna „osoba", dwie „osoby", pięć „osób". */
  jednostka: [string, string, string];
  /** Dopełniacz jednostki do podpisu ceny: „99 zł za osobę". */
  zaJednostke: string;
  /** Ilość startowa; domyślnie zero. */
  poczatkowa?: number;
}

/**
 * Przycisk planu: etykieta i akcja przychodzą z zewnątrz, więc karta nie wie,
 * czy prowadzi do koszyka, rejestracji czy zmiany planu — i o to chodzi.
 */
export interface PrzyciskPlanu {
  etykieta: string | ((stan: StanKarty) => string);
  akcja: (okres: OkresRozliczenia, prog: number, ilosc: number) => void;
  /** Główne wezwanie (styl 1 — szkło) zamiast obwódki; domyślnie plan polecany. */
  wyrozniony?: boolean | ((stan: StanKarty) => boolean);
  wylaczony?: boolean | ((stan: StanKarty) => boolean);
  /** Trwa akcja — kręciołek i blokada. */
  ladowanie?: boolean;
}

export interface PlanCennika {
  id: string;
  nazwa: string;
  opis: string;
  /** Barwa akcentu planu (dowolny kolor CSS); domyślnie akcent motywu. */
  kolor?: string;
  /** Plan bezpłatny — cena „Free", bez puli i bez rabatu. */
  darmowy?: boolean;
  /** Progi puli; jeden próg = bez suwaka. */
  progi: ProgCennika[];
  /** Plan polecany — rant, poświata i główny przycisk. */
  polecany?: boolean;
  /** Plan, który użytkownik ma teraz. */
  biezacy?: boolean;
  /** Indeks progu, który użytkownik ma teraz (tylko dla planu bieżącego). */
  biezacyProg?: number;
  /** Podświetlenie z kreatora doboru (rekomendacja). */
  podswietlony?: boolean;
  przycisk: PrzyciskPlanu;
  /** Etykieta wiersza puli; domyślnie „Byte miesięcznie:". */
  etykietaPuli?: string;
  /**
   * Sam wiersz „Byte miesięcznie: N ⟠", bez zablokowanego paska pod spodem.
   * Dla cennika, w którym żaden plan nie ma wyboru progu — pasek z kłódką
   * sugeruje tam suwak, którego nie ma.
   */
  pulaBezPaska?: boolean;
  /** Suwak ilości pod pulą — patrz `DodatekCennika`. */
  dodatek?: DodatekCennika;
  /**
   * Plan, w którym dodatku nie ma: zamiast suwaka stoi ten sam zablokowany pasek
   * z kłódką co przy puli bez wyboru progu. Trzyma też wysokość — lista
   * „W pakiecie" zaczyna się na tej samej linii co w kartach z suwakiem.
   */
  dodatekZablokowany?: DodatekZablokowany;
  /** Dwa podpisy pod ceną planu bezpłatnego. */
  podpisDarmowy?: [string, string];
  /** Jednostka przy cenie; domyślnie „zł/m". */
  jednostkaCeny?: string;
  /**
   * Kwoty planu zawierają VAT. Pod ceną miesięczną stoi wtedy samo „cena brutto"
   * (bez dwóch podpisów o rozliczeniu i anulowaniu), a przy rozliczeniu rocznym
   * krótkie „Rocznie N zł brutto" zamiast „Rozliczane rocznie — faktura N PLN".
   */
  brutto?: boolean;
  /** Nagłówek panelu zużycia, np. „Każdego miesiąca aż:". */
  naglowekZuzycia?: string;
  /** Wiersze zużycia dla wybranego progu; brak = bez panelu. */
  zuzycie?: (prog: ProgCennika) => WierszZuzycia[];
  /** Nagłówek listy cech, np. „Wszystko z Lite, plus:"; domyślnie „W pakiecie:". */
  naglowekCech?: string;
  cechy: CechaCennika[];
}
