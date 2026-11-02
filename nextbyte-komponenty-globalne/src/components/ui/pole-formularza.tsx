import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POLE FORMULARZA — jedno „okno do wypełnienia” dla całego Panelu Klienta
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (17.09.2026, zrzut formularza transzy): „potrzebujemy ujednolicenia
 * tych okien do wypełnienia i zapisać to w zasadach”. Reguła: docs/STANDARD-WYGLADU.md §8a.
 *
 * Etykieta nad polem (11 px, t2, bez ikony), kontrolka 32 px na warstwie W3
 * z promieniem 8 px, błąd jednym zdaniem pod polem. Kontrolkę podaje się jako
 * dziecko — `Input`, `Textarea`, `Select` z biblioteki — a wygląd nadaje klasa
 * `.pole-formularza` w `firma-klienta/systemWygladu.css`, żeby żadne pole nie musiało
 * powtarzać `h-8 text-tresc rounded-pole …` (i żeby panel wyglądu zmienił to raz).
 */

export interface PoleFormularzaProps {
  etykieta: React.ReactNode;
  /** id kontrolki — spina etykietę z polem (dostępność, klik w etykietę ustawia fokus) */
  htmlFor?: string;
  /** jedno zdanie, gdy wartość jest zła — pole dostaje czerwoną ramkę */
  blad?: React.ReactNode;
  /** jedno zdanie pod polem, tylko gdy coś wyjaśnia */
  podpowiedz?: React.ReactNode;
  /**
   * SKĄD TA DANA — ścieżka w zapisie katalogu: `tabela.kolumna[.klucz JSON]`, `[]` dla list,
   * np. `firma-klienta_client_panel.metadata.order_data.tranches[].planned_amount`. MUSI być literałem.
   *
   * ⚠️ PO CO (28.09.2026). Ekran opisuje się SAM: `scripts/katalog-adresow.mjs` zbiera z kodu każde
   * pole z tym propem i dokłada mu adres (ekran → zakładka) oraz dowód `plik:linia`. Z tego
   * listy pól (Dokumenty → Ustawienia, kreator szablonu) i AI wiedzą, GDZIE dana stoi — bez
   * ręcznego inwentarza, który mylił się przy każdej zmianie (zaliczka stała w Kalkulatorze,
   * choć ustawia się ją tu, w Płatnościach Panelu Klienta).
   */
  zrodlo?: string;
  /**
   * Pole, które NIE zapisuje danej do bazy (szukanie, polecenie dla AI, adres do importu) — powód
   * jednym zdaniem. Jawne „nie ma źródła" zamiast milczenia: zapadka liczy pola bez `zrodlo`
   * i bez `bezZrodla`, a lista pól nie udaje, że to dana.
   */
  bezZrodla?: string;
  /** Jednostka W POLU, po prawej (zł, %, kg, mm) — zamiast dopisku w etykiecie albo osobnego pola (§20). */
  jednostka?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * UKŁAD PÓL — „siatka” (etykieta nad polem, kolumny) albo „wiersze” (etykieta w stałej kolumnie po lewej, pole na
 * resztę szerokości), jak karta „Klient” w CRM (`Wizytowka`). Kajetan (06.10.2026, okno pozycji Kalkulatora):
 * „ten układ jest chaotyczny (…) wszystkie okna muszą mówić tym samym językiem” — w siatce etykiety się zawijały,
 * nazwy ucinały, a pola w rzędzie stały na różnych wysokościach. Okna dodawania i edycji: `uklad="wiersze"` (§20).
 */
export type UkladPol = 'siatka' | 'wiersze';
const UkladPolCtx = React.createContext<UkladPol>('siatka');

/** Kolumna etykiet w wierszach — ta sama szerokość, co w karcie CRM (`Wizytowka`: 150 px), żeby okna i karty stały na jednej osi. */
const KOLUMNA_ETYKIET = 'grid-cols-[150px_minmax(0,1fr)]';

export const PoleFormularza: React.FC<PoleFormularzaProps> = ({ etykieta, htmlFor, blad, podpowiedz, zrodlo, bezZrodla: _bezZrodla, jednostka, className, children }) => {
  const uklad = React.useContext(UkladPolCtx);
  /* Jednostka w polu: kontrolka w opakowaniu z dopiskiem po prawej; wygląd pola nadaje dalej `.pole-formularza` (CSS). */
  const kontrolka = jednostka == null ? children
    : <div className="pole-z-jednostka">{children}<span className="pole-jednostka" aria-hidden="true">{jednostka}</span></div>;
  const pod = blad ? <p className={cn('mt-1 text-meta text-destructive', uklad === 'wiersze' && 'col-start-2')}>{blad}</p>
    : podpowiedz ? <p className={cn('mt-1 text-meta text-t3', uklad === 'wiersze' && 'col-start-2')}>{podpowiedz}</p> : null;
  if (uklad === 'wiersze') return (
    /* Etykieta i kontrolka to DWOJE dzieci siatki — kontrolka zostaje bezpośrednim dzieckiem `.pole-formularza`,
       więc reguły wyglądu pola (`.pole-formularza > button`) działają tak samo jak w siatce. Etykieta w jednej
       linii (ucięta z pełnym tekstem w dymku przeglądarki), wyśrodkowana na wysokości pola. */
    <div className={cn('pole-formularza pole-formularza--wiersz grid min-w-0 items-center gap-x-3', KOLUMNA_ETYKIET, blad && 'pole-formularza--blad', className)} data-zrodlo={zrodlo}>
      <label htmlFor={htmlFor} className="truncate text-meta text-t2" title={typeof etykieta === 'string' ? etykieta : undefined}>{etykieta}</label>
      {kontrolka}
      {pod}
    </div>
  );
  return (
    <div className={cn('pole-formularza min-w-0', blad && 'pole-formularza--blad', className)} data-zrodlo={zrodlo}>
      <label htmlFor={htmlFor} className="mb-1 block text-meta text-t2">{etykieta}</label>
      {kontrolka}
      {pod}
    </div>
  );
};

const KOLUMNY = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' } as const;

export interface SiatkaFormularzaProps {
  kolumny?: keyof typeof KOLUMNY;
  /** `wiersze` — pola jedno pod drugim, etykieta po lewej (okna dodawania i edycji, §20); `kolumny` wtedy nie działa. */
  uklad?: UkladPol;
  className?: string;
  children: React.ReactNode;
}

/** Rząd pól: 12 px odstępu w obu kierunkach, kolumny równe, na wąskim ekranie jedna; przyciski w rzędzie stoją na linii pól. */
export const SiatkaFormularza: React.FC<SiatkaFormularzaProps> = ({ kolumny = 2, uklad = 'siatka', className, children }) => (
  <UkladPolCtx.Provider value={uklad}>
    <div className={cn(uklad === 'wiersze' ? 'grid grid-cols-1 gap-2' : cn('grid grid-cols-1 items-end gap-3', KOLUMNY[kolumny]), className)}>{children}</div>
  </UkladPolCtx.Provider>
);

export default PoleFormularza;
