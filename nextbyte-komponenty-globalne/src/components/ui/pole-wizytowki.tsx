import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { useTylkoDoOdczytu } from './tylko-do-odczytu';
import { cn } from '@/lib/utils';
import { Dymek } from './naglowek-sekcji';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POLE WIZYTÓWKI — tekst do czytania, formularz dopiero po kliknięciu
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan, 10.09.2026, o zakładce Dane w CRM: „chcę czegoś mocniejszego".
 * Propozycja przyjęta: „karta czytana, nie formularz". Dziewięć na dziesięć
 * wejść w kartę to odczyt, a ramki pól wejściowych są największym źródłem
 * szumu na ekranie, który ma tylko odpowiedzieć „jaki ma telefon".
 *
 * Pole ma dwa stany:
 *   ODCZYT  — etykieta po lewej, wartość jako tekst po prawej; najechanie
 *             podświetla, klik przełącza w edycję. Pusta wartość = szary
 *             kursywny podpis „dodaj…", żeby było widać, że tu czegoś brak.
 *   EDYCJA  — ta sama komórka, w niej kontrolka: domyślnie `Input`
 *             z biblioteki; Enter zapisuje, Esc cofa, blur zapisuje.
 *             Rozwijki, daty i liczby podaje się przez `kontrolka` —
 *             wtedy pole tylko przełącza stan, a zapis robi sama kontrolka.
 *
 * To komponent BIBLIOTEKI (`src/components/ui`), bo ten sam układ ma wejść
 * do Panelu Klienta: Kajetan buduje tam Dane „na podstawie" CRM. Jedno
 * źródło = obie karty mówią tym samym językiem wizualnym.
 */

/**
 * JEDNO POLE W EDYCJI NARAZ. Kajetan (10.09.2026) zobaczył trzy otwarte
 * kontrolki jednocześnie — data, rozwijka i tekst, każda w innej ramce:
 * „każde z tych okien ma inną strukturę wyglądu". Siatka trzyma id otwartego
 * pola; otwarcie kolejnego zamyka poprzednie.
 */
const WizytowkaCtx = createContext<{ otwarty: string | null; ustaw: (id: string | null) => void } | null>(null);

export interface PoleWizytowkiProps {
  etykieta: React.ReactNode;
  /** Wartość do pokazania w odczycie; `null`/`''` = pusta. */
  wartosc: string | null | undefined;
  /** Zapis z domyślnego `Input` (tekst). Pomijane, gdy podano `kontrolka`. */
  onZapisz?: (wartosc: string | null) => void;
  /**
   * Własna kontrolka edycji (rozwijka, kalendarz, liczba). Dostaje `zamknij`,
   * żeby po wyborze wrócić do odczytu. Gdy podana, klik w wartość ją pokazuje.
   */
  kontrolka?: (zamknij: () => void) => React.ReactNode;
  /** Co pokazać zamiast pustej wartości. */
  pusty?: string;
  /** `duzy` — nazwisko/nazwa; `liczba` — cyfry tabelaryczne. */
  wariant?: 'zwykly' | 'duzy' | 'liczba';
  /**
   * Klucz pola — celownik dla podświetlenia z powiadomienia (§3C-1, 19.09.2026: „po kliknięciu
   * w komórkę system ma zaprowadzić użytkownika do miejsca, w którym można to zmienić, ma podświetlić
   * komórkę w tym kolorze powiadomienia”). Ląduje jako `data-pole`, żeby ekran mógł znaleźć komórkę
   * bez szukania po tekście etykiety.
   */
  pole?: string;
  /**
   * SKĄD TA DANA — ścieżka `tabela.kolumna[.klucz JSON]` (literał). Ten sam kontrakt co
   * `PoleFormularza.zrodlo`: generator `katalog-adresow.mjs` zbiera pola z kodu i daje im adres
   * z dowodem `plik:linia`. W komponencie współdzielonym przez CRM i Panel: `{tabela}.kolumna`,
   * a tabelę podaje miejsce użycia propem `tabela`.
   */
  zrodlo?: string;
  /** Pole bez danej w bazie (liczone, podgląd) — powód jednym zdaniem. */
  bezZrodla?: string;
  /** Podpis po prawej stronie wartości (np. „· sprzed 12 dni"). */
  dopisek?: React.ReactNode;
  /** Zewnętrzne podświetlenie (deep-link „Termin" z listy). */
  className?: string;
  /** Odczyt tylko — bez edycji (np. pole liczone). */
  tylkoOdczyt?: boolean;
  /** Gdy edycja ma być otwarta od razu (jedno pole naraz — rodzic pilnuje). */
  otwarte?: boolean;
  onOtwarte?: (otwarte: boolean) => void;
}

export const PoleWizytowki: React.FC<PoleWizytowkiProps> = ({
  etykieta, wartosc, onZapisz, kontrolka, pusty = 'dodaj…', wariant = 'zwykly',
  dopisek, className, tylkoOdczyt: tylkoOdczytProp, otwarte, onOtwarte, pole, zrodlo,}) => {
  /* Zakładka w trybie „tylko do odczytu” (uprawnienia) blokuje też pola edytowane kliknięciem w tekst. */
  const odczytZKontekstu = useTylkoDoOdczytu();
  const tylkoOdczyt = tylkoOdczytProp || odczytZKontekstu;
  const id = useId();
  const ctx = useContext(WizytowkaCtx);
  const [lokalnieOtwarte, setLokalnieOtwarte] = useState(false);
  const edycja = otwarte ?? (ctx ? ctx.otwarty === id : lokalnieOtwarte);
  const ustawEdycje = (v: boolean) => {
    if (ctx) ctx.ustaw(v ? id : (ctx.otwarty === id ? null : ctx.otwarty));
    else setLokalnieOtwarte(v);
    onOtwarte?.(v);
  };
  const [szkic, setSzkic] = useState(wartosc ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (edycja) { setSzkic(wartosc ?? ''); inputRef.current?.focus(); inputRef.current?.select(); } }, [edycja, wartosc]);

  const zamknij = () => ustawEdycje(false);
  const zapisz = () => { onZapisz?.(szkic.trim() || null); zamknij(); };
  const pustaWartosc = wartosc === null || wartosc === undefined || wartosc === '';

  return (
    <div className={cn('contents', className)}>
      {/* Oba stany mają TĘ SAMĄ wysokość (h-8 = 32 px, jak pola w bibliotece) — kliknięcie
          w komórkę nie może niczego przesunąć. W edycji KAŻDE pole wygląda tak samo:
          jedna ramka od komórki, a kontrolka w środku (tekst, data, rozwijka) jest
          pozbawiona własnej ramki i tła. Trzy różne obwódki w jednej karcie = trzy
          różne języki wizualne. */}
      <div className="wizytowka-etykieta text-[12px] text-muted-foreground h-8 flex items-center my-0.5">
        {etykieta}
      </div>
      <div
        data-pole={pole}
        data-zrodlo={zrodlo}
        className={cn(
          'min-w-0 h-8 my-0.5 flex items-center rounded-md -mx-2 px-2',
          !edycja && !tylkoOdczyt && 'cursor-text hover:bg-muted/30 transition-colors',
          edycja && 'bg-card ring-1 ring-primary/40',
        )}
        onClick={() => { if (!edycja && !tylkoOdczyt) ustawEdycje(true); }}
      >
        {edycja ? (
          kontrolka ? (
            /* Kontrolka zamyka się sama, gdy fokus wyjdzie poza nią — inaczej po
               otwarciu i porzuceniu rozwijki zostawała ramka wśród wierszy tekstu
               („rzeczy, które nie pasują do siebie", 10.09.2026). Zawartość rozwijek
               Radix żyje w portalu poza komórką, więc sprawdzamy ją osobno. */
            <div
              /* Wymuszone `!` — przycisk kalendarza ma własne `border rounded-xl` z wariantu;
                 bez tego widać było dwie obwódki („bubel wizualny", 10.09.2026). */
              className="w-full [&_button]:!h-8 [&_input]:!h-8 [&_[role=combobox]]:!h-8 [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!shadow-none [&_button]:!px-0 [&_button]:!rounded-none [&_input]:!border-0 [&_input]:!bg-transparent [&_input]:!shadow-none [&_input]:!px-0 [&_[role=combobox]]:!border-0 [&_[role=combobox]]:!bg-transparent [&_[role=combobox]]:!shadow-none [&_[role=combobox]]:!px-0 [&_[role=combobox]]:!rounded-none [&_button]:focus-visible:!ring-0 [&_input]:focus-visible:!ring-0 [&_[role=combobox]]:focus-visible:!ring-0 [&_*]:!ring-offset-0"
              onKeyDown={e => { if (e.key === 'Escape') zamknij(); }}
              onBlur={e => {
                const kom = e.currentTarget;
                setTimeout(() => {
                  const a = document.activeElement;
                  if (a && (kom.contains(a) || a.closest('[data-radix-popper-content-wrapper]'))) return;
                  zamknij();
                }, 0);
              }}
            >{kontrolka(zamknij)}</div>
          ) : (
            <input
              ref={inputRef}
              value={szkic}
              onChange={e => setSzkic(e.target.value)}
              onBlur={zapisz}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); zapisz(); }
                if (e.key === 'Escape') { e.preventDefault(); zamknij(); }
              }}
              className="w-full bg-transparent outline-none text-sm text-foreground"
            />
          )
        ) : (
          /* Ta sama czcionka i waga, co tekst w polach biblioteki (`text-sm`) — Kajetan:
             „używasz innej czcionki niż była jako wypełnienie danych". Tylko nazwa
             jest półgruba. */
          (() => {
            const tresc = (
              <span className={cn(
                'wizytowka-wartosc block truncate text-sm',
                wariant === 'duzy' && 'font-semibold',
                wariant === 'liczba' && 'tabular-nums',
                pustaWartosc && 'text-muted-foreground/60 italic',
              )}>
                {pustaWartosc ? pusty : wartosc}
                {dopisek && !pustaWartosc && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground/70">{dopisek}</span>}
              </span>
            );
            /* pełna wartość w dymku platformy, nie w dymku przeglądarki (`title`) — ucięty adres czy przedmiot umowy
               da się przeczytać; opóźnienie jak w wierszu listy, żeby dymek nie migał przy przesuwaniu myszy */
            return pustaWartosc || typeof wartosc === 'object' ? tresc : <Dymek tytul={String(wartosc)} bezOtoczki opoznienie={1000}>{tresc}</Dymek>;
          })()
        )}
      </div>
    </div>
  );
};

/**
 * Siatka na pola wizytówki: etykiety w pierwszej kolumnie na szerokość
 * najdłuższej, wartości w drugiej. Wszystkie pola jednej karty w jednym
 * `<Wizytowka>`, żeby etykiety były wyrównane między wierszami.
 */
export const Wizytowka: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const [otwarty, ustaw] = useState<string | null>(null);
  return (
    <WizytowkaCtx.Provider value={{ otwarty, ustaw }}>
      {/* Kolumna etykiet ma STAŁĄ szerokość, nie „najdłuższa etykieta": dwie karty obok
          siebie muszą zaczynać wartości na tej samej wysokości i w tym samym miejscu
          (Kajetan, 10.09.2026: „kolumny danych powinny być tej samej szerokości"). */}
      <div className={cn('grid grid-cols-[150px_minmax(0,1fr)] gap-x-4', className)}>{children}</div>
    </WizytowkaCtx.Provider>
  );
};

export default PoleWizytowki;
