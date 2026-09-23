import React from 'react';
import { cn } from '@/lib/utils';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PlynnyKursor, scalRefy, useDotyk } from './plynny-kursor';
import { Klawisz } from './klawisz';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POLA — jeden wygląd wszystkiego, w co się pisze
 * ════════════════════════════════════════════════════════════════════════
 *
 * CO POKAZAŁ POMIAR (31.07.2026, całe `src`)
 *     <Input>     1173 użycia,  34 różne wyglądy,  1091 użyć BEZ nadpisania
 *     <Textarea>   245 użyć,    10 różnych wyglądów
 *
 * Wniosek jest inny niż przy plakietce: pole tekstowe jest już w praktyce
 * spójne, bo prawie nikt nie dopisuje mu klas. Problem nie polega więc na
 * rozjeździe, tylko na tym, CZEGO WSPÓLNA BAZA NIE MA:
 *
 *   ① WYSOKOŚĆ. Dzisiejsze `h-10` to 40 px, a spotykane `h-8` to 32 px —
 *     poniżej progu celu dotykowego (44 px), co wypunktowałem w audycie
 *     platformy. Tu bazą jest `h-11`, czyli 44 px, a `h-9` zostaje wyłącznie
 *     dla pól w gęstych tabelach, gdzie palec i tak nie sięga.
 *   ② ETYKIETA, PODPOWIEDŹ I BŁĄD. Dziś każdy formularz skleja je sam,
 *     w innych odstępach i rozmiarach. Tu idą z komponentu, więc formularz
 *     w Ustawieniach wygląda tak samo jak w Zarządzie.
 *   ③ POWIĄZANIE Z DOSTĘPNOŚCIĄ. `id`, `aria-describedby` i `aria-invalid`
 *     wiążą się same. Przy ręcznym sklejaniu prawie nigdy nie były ustawione,
 *     więc czytnik ekranu nie mówił, co jest nie tak z polem.
 *
 * OBWÓDKA, NIE PUDEŁKO
 * WYPUKŁE vs WGŁĘBIONE — reguła obowiązująca w całej platformie.
 *
 * Michał (03.08.2026) porównał zakładkę Przegląd z resztą Zarządu: „zobacz
 * zakładkę przegląd a inne jak tam jasne jest to wszystko". Przegląd był
 * ciemny, bo nie ma w nim ANI JEDNEGO wypełnionego bloku wewnętrznego — same
 * kafelki, karty metryk i wskaźniki. Pozostałe zakładki wypełniały każdy blok
 * `bg-foreground/[0.03–0.06]`, co na motywie ciemnym składa się na 5,8–8,6%
 * jasności przy karcie 3% — czyli ponad DWA RAZY jaśniej. Zmierzone; dokładnie
 * ten sam poziom co stare `bg-muted` (7%), które wcześniej wyrzuciliśmy.
 *
 * REGUŁA: kontener treści, blok kodu i miejsce na obraz są WGŁĘBIENIEM —
 * idą ku tłu strony (`bg-background/40` → 2,6%), nie ku tekstowi. Jaśniejsze
 * zostaje wyłącznie to, co naprawdę jest uniesione: aktywna zakładka,
 * najechanie, wyróżniony wiersz. Plakietki i komórki mapy cieplnej kodują
 * wartość, nie wysokość — ich to nie dotyczy.
 *
 * Pole jest ciemniejsze od karty (`bg-background/40`), a nie jaśniejsze —
 * wgłębienie czyta się jako „tu się wpisuje". Fokus dokłada obwódkę w akcencie
 * i minimalną poświatę, ten sam gest co uniesienie kafelka pod kursorem.
 */

/* ── WSPÓLNY CHROM ────────────────────────────────────────────────────────
   Trzymany jako łańcuch klas, a nie komponent, bo `Pole`, `Obszar` i `Szukajka`
   renderują trzy różne elementy HTML. Gdyby każdy pisał to u siebie, wróciłby
   dokładnie ten rozjazd, który likwidujemy.                                  */
export const RDZEN_POLA = cn(
  'w-full min-w-0 rounded-xl border border-border bg-background/40 text-card-foreground',
  /*
    `nb-pole` — cień spoczynku i fokusu mieszka w `index.css`, NIE w klasie
    z wartością dowolną. Powód zmierzony 02.08.2026: wielowarstwowy cień
    zapisany jako `focus-within:shadow-[...]` przechodził przez przetwarzanie
    wartości dowolnych i część warstw rozwiązywała się do PRZEZROCZYSTYCH —
    klasa była na elemencie, element pasował do `:focus-within`, reguła istniała
    w arkuszu, a mimo to podświetlenia nie było widać. Zwykły `box-shadow`
    w prawdziwej regule nie ma czego popsuć.
  */
  'nb-pole',
  'placeholder:text-muted-foreground',
  'transition-[border-color,box-shadow,background-color] duration-200',
  'focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

/** Fokus na OPRAWIE, nie na samym `<input>` — inaczej ikona i przycisk obok
 *  zostają poza podświetleniem i pole rozpada się na trzy osobne kawałki. */
/*
  FOKUS JAKO ŚWIATŁO, NIE JAKO OBWÓDKA.

  Pierwsza wersja robiła to, co robi większość interfejsów: przemalowywała
  obwódkę na akcent i dokładała jednolitą mgiełkę `0 0 0 3px`. Efekt jest
  płaski — wygląda jak naklejona ramka, nie jak reakcja materiału na dotknięcie.
  Obok Łuków i Pasków zasobu, które mają gradient i kierunek, wypadało to tanio.

  Teraz są CZTERY warstwy, każda z innym zadaniem:
    ① rant w akcencie tuż przy krawędzi — ostry, niesie kształt,
    ② refleks na górnej krawędzi wzmocniony — światło pada z góry,
    ③ wąska poświata blisko pola — „ciepło" wokół krawędzi,
    ④ szeroka, słaba poświata rzucona w DÓŁ — pole unosi się nad tłem.
  Do tego powierzchnia lekko jaśnieje, więc reaguje całość, a nie sam kontur.
*/
/* Cała reakcja na fokus siedzi w `.nb-pole:focus-within` (index.css).
   Tutaj zostaje wyłącznie delikatne rozjaśnienie powierzchni. */
const OPRAWA_FOKUS = 'focus-within:bg-background/55';

/** Błąd — ten sam układ warstw w `index.css`, tylko w kolorze ostrzeżenia. */
const OPRAWA_BLAD = 'nb-pole-blad';

/*
  WARIANT ZWARTY JEST ZWARTY DOPIERO OD `sm` W GÓRĘ.

  Pierwsza wersja dawała mu `h-9` (36 px) zawsze, z uzasadnieniem w komentarzu:
  „dla gęstych tabel, gdzie palec i tak nie sięga". Zmierzone w ramce 375 px:
  to uzasadnienie jest FAŁSZYWE — na telefonie palcem dosięga się wszystkiego,
  więc wariant zwarty łamał tam próg dotyku, którego cały ten plik miał pilnować.
  Teraz: na telefonie pełne 44 px, zwężenie do 36 px dopiero na szerokim ekranie,
  gdzie faktycznie steruje się myszą.
*/
const WYSOKOSC = {
  /** gęste tabele i paski narzędzi — dopiero od `sm`, patrz komentarz wyżej */
  zwarte: 'h-11 text-[14px] sm:h-9 sm:text-[14px]',
  /** domyślne: 44 px, czyli próg celu dotykowego */
  zwykle: 'h-11 text-[14px]',
} as const;

export type RozmiarPola = keyof typeof WYSOKOSC;

/* ── OPIS POLA: etykieta + podpowiedź + błąd ───────────────────────────── */

export interface OpisPolaProps {
  etykieta?: React.ReactNode;
  /** wyjaśnienie pod polem; znika, gdy jest błąd */
  podpowiedz?: React.ReactNode;
  blad?: React.ReactNode;
  wymagane?: boolean;
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Oprawa opisowa. Wydzielona, żeby `Pole` i `Obszar` nie powtarzały tego
 * samego układu — i żeby zmiana odstępu etykiety przechodziła przez całą
 * platformę jedną zmianą.
 */
export const OpisPola: React.FC<OpisPolaProps> = ({
  etykieta, podpowiedz, blad, wymagane, id, children, className,
}) => (
  /*
    `min-w-0` NIE JEST OZDOBNIKIEM — bez niego pola rozpychają układ.

    Zmierzone w ramce 375 px: oprawy pól miały 442 PX SZEROKOŚCI, czyli
    wychodziły poza kartę o 67 px. Przyczyna jest nieoczywista: element siatki
    (i element flex) ma domyślnie `min-width: auto`, więc NIE KURCZY SIĘ poniżej
    szerokości własnej treści. Wystarczyło jedno pole z długą, nierozrywalną
    zawartością — placeholder wyszukiwarki, licznik znaków — i cała kolumna
    rozpychała kartę, ciągnąc za sobą wszystkie pozostałe pola.

    Poprawka siedzi TUTAJ, a nie w podglądzie, bo dotyczy każdego formularza,
    który kiedykolwiek użyje tych pól — także w układach, których jeszcze nie ma.
  */
  <div className={cn('min-w-0 space-y-1.5', className)}>
    {etykieta && (
      <label
        htmlFor={id}
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        {etykieta}
        {wymagane && <span className="text-destructive" aria-hidden="true">*</span>}
      </label>
    )}

    {children}

    {/* Błąd wypiera podpowiedź — dwa komunikaty naraz pod jednym polem
        zmuszają do czytania obu, żeby ustalić, który jest ważny. */}
    {blad ? (
      <p id={`${id}-opis`} role="alert" className="text-[14px] leading-snug text-destructive">
        {blad}
      </p>
    ) : podpowiedz ? (
      <p id={`${id}-opis`} className="text-[14px] leading-snug text-muted-foreground">
        {podpowiedz}
      </p>
    ) : null}
  </div>
);

/* ── POLE — jednolinijkowe ─────────────────────────────────────────────── */

export interface PoleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  etykieta?: React.ReactNode;
  podpowiedz?: React.ReactNode;
  blad?: React.ReactNode;
  rozmiar?: RozmiarPola;
  ikona?: LucideIcon;
  /** przycisk, jednostka albo skrót klawiszowy po prawej stronie pola */
  poPrawej?: React.ReactNode;
  /**
   * Karetka dojeżdża sprężyną zamiast przeskakiwać. Domyślnie WŁĄCZONE —
   * to ma być odczucie całej platformy, nie ozdoba jednego formularza.
   * Wyłącz tam, gdzie pole udaje coś innego niż pole (maski, edytory kodu).
   */
  plynnyKursor?: boolean;
}

/* Typy, które renderuje sam system: mają własne kontrolki (kalendarz, strzałki,
   próbnik koloru) i albo nie mają karetki, albo stoi ona gdzie indziej niż
   szerokość tekstu. Rysowanie jej tam dawałoby kreskę w losowym miejscu. */
const TYPY_BEZ_KARETKI = new Set([
  'number', 'date', 'datetime-local', 'month', 'week', 'time',
  'color', 'range', 'file', 'checkbox', 'radio', 'submit', 'button', 'image', 'reset', 'hidden',
]);

export const Pole = React.forwardRef<HTMLInputElement, PoleProps>(function Pole(
  { etykieta, podpowiedz, blad, rozmiar = 'zwykle', ikona: Ikona, poPrawej,
    plynnyKursor = true, className, id, required, style, ...rest },
  ref,
) {
  const wewnetrzneId = React.useId();
  const idPola = id ?? wewnetrzneId;
  const wewnRef = React.useRef<HTMLInputElement>(null);

  const dotyk = useDotyk();
  const plynny =
    !dotyk &&
    plynnyKursor &&
    !rest.disabled &&
    !rest.readOnly &&
    !TYPY_BEZ_KARETKI.has(rest.type ?? 'text');

  return (
    <OpisPola etykieta={etykieta} podpowiedz={podpowiedz} blad={blad} wymagane={required} id={idPola}>
      <div
        className={cn(
          RDZEN_POLA, WYSOKOSC[rozmiar],
          'flex items-center gap-2 px-3',
          blad ? OPRAWA_BLAD : OPRAWA_FOKUS,
          className,
        )}
      >
        {Ikona && <Ikona aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />}
        {/* Oprawa dla karetki: własny kontekst pozycjonowania, liczony od lewej
            krawędzi SAMEGO pola — inaczej ikona przesuwałaby kreskę o swoją
            szerokość. */}
        <span className="relative flex min-w-0 flex-1 items-center">
          <input
            ref={scalRefy<HTMLInputElement>(ref, wewnRef)}
            id={idPola}
            required={required}
            aria-invalid={blad ? true : undefined}
            aria-describedby={blad || podpowiedz ? `${idPola}-opis` : undefined}
            // Tło i obwódkę niesie OPRAWA — samo `<input>` musi być przezroczyste,
            // inaczej rysuje drugi prostokąt wewnątrz pierwszego.
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            // Prawdziwa karetka znika, naszą rysuje nakładka. Zapis przez `style`,
            // bo `caret-transparent` w Tailwindzie przegrywa z regułami motywu.
            data-plynny-kursor={plynny ? 'wlasny' : undefined}
          style={plynny ? { caretColor: 'transparent', ...style } : style}
            {...rest}
          />
          {plynny && <PlynnyKursor polaRef={wewnRef} wartosc={rest.value ?? rest.defaultValue} />}
        </span>
        {poPrawej && <span className="shrink-0 text-muted-foreground">{poPrawej}</span>}
      </div>
    </OpisPola>
  );
});

/* ── OBSZAR — wielolinijkowy ───────────────────────────────────────────── */

export interface ObszarProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  etykieta?: React.ReactNode;
  podpowiedz?: React.ReactNode;
  blad?: React.ReactNode;
  /** licznik znaków po prawej pod polem — pokazywany, gdy podano `maxLength` */
  zLicznikiem?: boolean;
  /**
   * patrz `PoleProps.plynnyKursor` — domyślnie włączone.
   * W polu wielolinijkowym karetka wędruje też między wierszami, więc pozycję
   * liczy LUSTRO pola (kopia z tym samym łamaniem wyrazów), nie sama szerokość
   * tekstu — szczegóły w `plynny-kursor.tsx`.
   */
  plynnyKursor?: boolean;
}

export const Obszar = React.forwardRef<HTMLTextAreaElement, ObszarProps>(function Obszar(
  { etykieta, podpowiedz, blad, zLicznikiem, plynnyKursor = true, className, id, required, maxLength, value, ...rest },
  ref,
) {
  const wewnetrzneId = React.useId();
  const idPola = id ?? wewnetrzneId;
  const wewnRef = React.useRef<HTMLTextAreaElement>(null);
  const dotyk = useDotyk();
  const plynny = !dotyk && plynnyKursor && !rest.disabled && !rest.readOnly;

  /*
    LICZNIK ZNAKÓW MUSI POKAZYWAĆ PRAWDĘ TAKŻE BEZ `value`.
    Pierwsza wersja liczyła `typeof value === 'string' ? value.length : 0`.
    Przy polu niesterowanym (`defaultValue` albo nic) `value` jest `undefined`,
    więc licznik pokazywał „0 / 160" przez cały czas pisania — czyli podawał
    użytkownikowi liczbę, która jest nieprawdziwa. Lepiej nie pokazywać nic,
    niż pokazywać zmyśloną wartość; tutaj po prostu liczymy sami.
  */
  const [dlugoscWlasna, setDlugoscWlasna] = React.useState(
    typeof rest.defaultValue === 'string' ? rest.defaultValue.length : 0,
  );
  const sterowane = typeof value === 'string';
  const dlugosc = sterowane ? (value as string).length : dlugoscWlasna;

  return (
    <OpisPola etykieta={etykieta} podpowiedz={podpowiedz} blad={blad} wymagane={required} id={idPola}>
      <div className={cn(RDZEN_POLA, 'p-0', blad ? OPRAWA_BLAD : OPRAWA_FOKUS, className)}>
        {/* `relative` dla karetki — liczy pozycję od lewego górnego rogu pola. */}
        <div className="relative">
        <textarea
          ref={scalRefy<HTMLTextAreaElement>(ref, wewnRef)}
          id={idPola}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={blad ? true : undefined}
          aria-describedby={blad || podpowiedz ? `${idPola}-opis` : undefined}
          data-plynny-kursor={plynny ? 'wlasny' : undefined}
          style={plynny ? { caretColor: 'transparent' } : undefined}
          className="min-h-[6rem] w-full resize-y bg-transparent px-3 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...rest}
          onChange={(e) => {
            if (!sterowane) setDlugoscWlasna(e.target.value.length);
            rest.onChange?.(e);
          }}
        />
        {plynny && <PlynnyKursor polaRef={wewnRef} wartosc={value ?? rest.defaultValue} />}
        </div>
        {zLicznikiem && maxLength && (
          <div className="flex justify-end border-t border-border/60 px-3 py-1.5">
            <span
              className={cn(
                'text-[11px] tabular-nums',
                // Ostrzeżenie dopiero przy 90% — wcześniej licznik tylko rozprasza.
                dlugosc >= maxLength * 0.9 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {dlugosc} / {maxLength}
            </span>
          </div>
        )}
      </div>
    </OpisPola>
  );
});

/* ── SZUKAJKA ──────────────────────────────────────────────────────────── */

export interface SzukajkaProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  wartosc: string;
  onZmiana: (v: string) => void;
  rozmiar?: RozmiarPola;
  /** podpowiedź skrótu po prawej, np. „⌘K" — chowana, gdy pole ma treść */
  skrot?: string;
  /** patrz `PoleProps.plynnyKursor` — domyślnie włączone */
  plynnyKursor?: boolean;
}

/**
 * Wyszukiwarka. Osobny komponent, a nie `Pole` z ikoną lupy, bo ma własne
 * zachowanie: krzyżyk czyszczący, Escape czyszczący i podpowiedź skrótu.
 * W platformie te trzy rzeczy były dotąd dopisywane ręcznie przy każdej
 * wyszukiwarce z osobna — albo pomijane.
 */
export const Szukajka = React.forwardRef<HTMLInputElement, SzukajkaProps>(function Szukajka(
  { wartosc, onZmiana, rozmiar = 'zwykle', skrot, plynnyKursor = true, className, placeholder = 'Szukaj…', ...rest },
  ref,
) {
  const wewnRef = React.useRef<HTMLInputElement>(null);
  const dotyk = useDotyk();
  const plynny = !dotyk && plynnyKursor && !rest.disabled && !rest.readOnly;

  return (
    <div
      className={cn(
        RDZEN_POLA, WYSOKOSC[rozmiar], OPRAWA_FOKUS,
        'flex items-center gap-2 px-3',
        className,
      )}
    >
      <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="relative flex min-w-0 flex-1 items-center">
        <input
          ref={scalRefy<HTMLInputElement>(ref, wewnRef)}
          type="search"
          role="searchbox"
          value={wartosc}
          placeholder={placeholder}
          onChange={(e) => onZmiana(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape' && wartosc) { e.preventDefault(); onZmiana(''); } }}
          data-plynny-kursor={plynny ? 'wlasny' : undefined}
          style={plynny ? { caretColor: 'transparent' } : undefined}
          className={cn(
            'w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground',
            // Natywny krzyżyk WebKit rysuje drugi przycisk czyszczenia obok naszego.
            '[&::-webkit-search-cancel-button]:appearance-none',
          )}
          {...rest}
        />
        {plynny && <PlynnyKursor polaRef={wewnRef} wartosc={wartosc} />}
      </span>

      {wartosc ? (
        <button
          type="button"
          onClick={() => onZmiana('')}
          aria-label="Wyczyść wyszukiwanie"
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : skrot ? (
        <Klawisz className="hidden sm:inline-block">{skrot}</Klawisz>
      ) : null}
    </div>
  );
});

/* ── POLE LICZBOWE ─────────────────────────────────────────────────────── */

export interface PoleLiczboweProps {
  /**
   * `null` znaczy PUSTE — dopuszczalne tylko przy `pozwalajPuste`.
   * Bez tego flagi zachowanie jest jak dawniej: pole zawsze ma liczbę.
   */
  wartosc: number | null;
  onZmiana: (v: number | null) => void;
  /**
   * Pozwala zostawić pole PUSTE zamiast wymuszać liczbę.
   *
   * Powstało dla filtrów zakresu („kwota od–do"), gdzie brak górnej granicy to
   * NIE to samo co „maksimum 0". Domyślnie wyłączone, więc szesnaście
   * istniejących użyć w Zarządzie zachowuje się bez zmian: puste pole wraca
   * przy opuszczeniu do ostatniej poprawnej wartości.
   */
  pozwalajPuste?: boolean;
  etykieta?: React.ReactNode;
  podpowiedz?: React.ReactNode;
  blad?: React.ReactNode;
  min?: number;
  max?: number;
  krok?: number;
  ikona?: LucideIcon;
  /** jednostka pokazywana za liczbą — „⟠", „zł", „s" */
  jednostka?: React.ReactNode;
  rozmiar?: RozmiarPola;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * POLE LICZBOWE z własnymi strzałkami.
 *
 * PO CO WŁASNE, SKORO `<input type="number">` MA SWOJE
 * Bo tamte rysuje PRZEGLĄDARKA, nie my. Wynikają z tego trzy rzeczy, których
 * nie da się obejść stylowaniem:
 *   • ignorują motyw — na ciemnym tle zostają jasnym, systemowym prostokątem
 *     (dokładnie to widać na zrzucie z pola „Cena w Byte"),
 *   • mają ok. 10 px wysokości na strzałkę, czyli ~4× poniżej progu dotyku,
 *   • na telefonie zwykle nie ma ich wcale.
 *
 * PRZYSPIESZANIE PRZY TRZYMANIU
 * Pierwszy krok idzie natychmiast, potem jest 400 ms przerwy — dzięki temu
 * pojedyncze kliknięcie zmienia wartość o DOKŁADNIE jeden krok i nie ucieka.
 * Dalej odstęp maleje do 30 ms, a po 30 krokach krok rośnie dziesięciokrotnie.
 * Bez tego drugiego dojechanie od zera do 5000 zajmowałoby ponad dwie minuty.
 */
export const PoleLiczbowe: React.FC<PoleLiczboweProps> = ({
  wartosc, onZmiana, etykieta, podpowiedz, blad, pozwalajPuste,
  min = 0, max = Number.MAX_SAFE_INTEGER, krok = 1,
  ikona: Ikona, jednostka, rozmiar = 'zwykle', id, disabled, className,
}) => {
  const wewnetrzneId = React.useId();
  const idPola = id ?? wewnetrzneId;

  const zegar = React.useRef<number | null>(null);
  // Wartość trzymana też w referencji: domknięcie w `setTimeout` widziałoby
  // wartość z chwili wciśnięcia i każdy tik liczyłby od tej samej liczby.
  // Przy pustym polu strzałki startują od `min` — inaczej nie byłoby od czego
  // liczyć pierwszego kroku.
  const biezaca = React.useRef(wartosc ?? min);
  React.useEffect(() => { biezaca.current = wartosc ?? min; }, [wartosc, min]);

  /*
    TEKST WPISYWANY trzymany osobno od LICZBY — i to nie jest komplikacja
    dla samej komplikacji, tylko naprawa zmierzonego błędu.

    Pierwsza wersja zamieniała pustą zawartość na `min` natychmiast przy
    każdym naciśnięciu klawisza. Zmierzone w przeglądarce: po wyczyszczeniu
    pola jego wartość wynosiła „0", a nie „". Skutek dla użytkownika: nie da
    się zaznaczyć ceny i wpisać nowej, bo pole w trakcie pisania podstawia
    sobie własną liczbę. Przy `min` większym od zera było jeszcze gorzej —
    nie dało się wpisać niczego mniejszego niż minimum, nawet przejściowo.

    Teraz pole może być CHWILOWO puste albo niedokończone („-", „1e"),
    a liczba trafia na zewnątrz dopiero, gdy da się ją odczytać. Porządki
    (puste → ostatnia poprawna wartość, poza zakresem → przycięcie) robimy
    przy opuszczeniu pola, a nie w trakcie pisania.
  */
  const jakoTekst = (v: number | null) => (v === null || v === undefined ? '' : String(v));
  const [tekst, setTekst] = React.useState<string>(jakoTekst(wartosc));
  const wPisaniu = React.useRef(false);
  React.useEffect(() => {
    if (!wPisaniu.current) setTekst(jakoTekst(wartosc));
  }, [wartosc]);

  const ogranicz = React.useCallback(
    (v: number) => Math.min(max, Math.max(min, v)),
    [min, max],
  );

  const stop = React.useCallback(() => {
    if (zegar.current !== null) { window.clearTimeout(zegar.current); zegar.current = null; }
  }, []);

  const start = React.useCallback((kierunek: 1 | -1) => {
    stop();
    let krokow = 0;

    const tik = () => {
      krokow += 1;
      // Krok rośnie dopiero po dłuższym trzymaniu — patrz komentarz wyżej.
      const mnoznik = krokow > 30 ? 10 : 1;
      const nowa = ogranicz(biezaca.current + kierunek * krok * mnoznik);

      if (nowa !== biezaca.current) {
        biezaca.current = nowa;
        onZmiana(nowa);
      } else {
        stop();           // dojechaliśmy do granicy — nie ma po co tykać dalej
        return;
      }

      const opoznienie = krokow === 1 ? 400 : Math.max(30, 260 - krokow * 14);
      zegar.current = window.setTimeout(tik, opoznienie);
    };

    tik();
  }, [krok, ogranicz, onZmiana, stop]);

  // Sprzątanie przy odmontowaniu — bez tego zegar tyka po zniknięciu pola.
  React.useEffect(() => stop, [stop]);

  const przyGranicy = (kierunek: 1 | -1) => {
    if (wartosc === null || wartosc === undefined) return false;  // puste — obie strzałki czynne
    return kierunek === 1 ? wartosc >= max : wartosc <= min;
  };

  const Strzalka: React.FC<{ kierunek: 1 | -1; Znak: LucideIcon; etykietaA11y: string }> = ({
    kierunek, Znak, etykietaA11y,
  }) => (
    <button
      type="button"
      aria-label={etykietaA11y}
      /*
        POZA KOLEJNOŚCIĄ TABULATORA — i to jest naprawa pułapki, nie skrót.
        Strzałki działają na `onPointerDown`, więc użytkownik klawiatury, który
        zatrzymałby się na nich Tabem, wcisnąłby Enter i NIC by się nie stało:
        przycisk wygląda na działający, a nie działa. Klasyczna pułapka fokusu.
        Natywne strzałki `<input type="number">` też nie są fokusowalne, a samo
        pole obsługuje strzałki góra/dół — czyli klawiatura ma pełną obsługę
        wartości bez tych przycisków. One są afordancją dla myszy i dotyku.
      */
      tabIndex={-1}
      disabled={disabled || przyGranicy(kierunek)}
      onPointerDown={(e) => { e.preventDefault(); start(kierunek); }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onBlur={stop}
      className={cn(
        'flex flex-1 items-center justify-center px-2 text-muted-foreground',
        'transition-colors duration-200',
        'hover:bg-foreground/[0.07] hover:text-foreground active:bg-primary/15 active:text-primary',
        'disabled:pointer-events-none disabled:opacity-30',
      )}
    >
      <Znak className="h-3 w-3" />
    </button>
  );

  return (
    <OpisPola etykieta={etykieta} podpowiedz={podpowiedz} blad={blad} id={idPola}>
      <div
        className={cn(
          RDZEN_POLA, WYSOKOSC[rozmiar],
          'flex items-center gap-2 overflow-hidden pl-3',
          blad ? OPRAWA_BLAD : OPRAWA_FOKUS,
          disabled && 'opacity-50',
          className,
        )}
      >
        {Ikona && <Ikona aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />}

        <input
          id={idPola}
          type="number"
          inputMode="numeric"
          value={tekst}
          min={min}
          max={max}
          step={krok}
          disabled={disabled}
          aria-invalid={blad ? true : undefined}
          aria-describedby={blad || podpowiedz ? `${idPola}-opis` : undefined}
          onChange={(e) => {
            const surowy = e.target.value;
            wPisaniu.current = true;
            setTekst(surowy);
            // Na zewnątrz idzie tylko liczba, którą DA SIĘ odczytać. Pusty
            // ciąg i stany przejściowe zostają w polu i nie ruszają wartości.
            const v = Number(surowy);
            if (surowy !== '' && !Number.isNaN(v)) onZmiana(ogranicz(v));
          }}
          onBlur={() => {
            // Porządki po skończonym pisaniu: pusto albo bzdura -> wracamy do
            // ostatniej poprawnej wartości; poza zakresem -> przycinamy.
            wPisaniu.current = false;
            const v = Number(tekst);
            if (pozwalajPuste && tekst.trim() === '') {
              // Puste znaczy „brak granicy", a nie „wróć do poprzedniej liczby".
              if (wartosc !== null && wartosc !== undefined) onZmiana(null);
              setTekst('');
              return;
            }
            const koncowa = tekst === '' || Number.isNaN(v) ? wartosc : ogranicz(v);
            setTekst(jakoTekst(koncowa));
            if (koncowa !== wartosc) onZmiana(koncowa);
          }}
          className={cn(
            'min-w-0 flex-1 bg-transparent tabular-nums outline-none',
            // Natywne strzałki wyłączone — zastępujemy je własnymi.
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          )}
        />

        {jednostka && (
          <span className="shrink-0 text-[14px] text-muted-foreground">{jednostka}</span>
        )}

        {/*
          UKŁAD STRZAŁEK ZALEŻY OD TEGO, CZYM SIĘ STERUJE.

          Kolumna dwóch strzałek dzieli 44 px wysokości pola na pół — zmierzone
          w ramce 375 px: 21 px na strzałkę, czyli DWA RAZY PONIŻEJ progu dotyku.
          Na myszy to bez znaczenia (kursor trafia w piksel), na telefonie to
          jest niesprawne sterowanie.

          Dlatego poniżej `sm` strzałki stoją OBOK SIEBIE: każda na pełną
          wysokość pola (44 px) i 36 px szerokości. Od `sm` w górę wracają do
          kolumny, bo tam liczy się oszczędność miejsca, nie wielkość celu.
          `flex-1` działa tak samo w wierszu i w kolumnie, więc jedna klasa
          obsługuje oba układy.
        */}
        <div className="flex h-full w-[4.5rem] shrink-0 flex-row-reverse border-l border-border sm:w-9 sm:flex-col">
          <Strzalka kierunek={1} Znak={ChevronUp} etykietaA11y="Zwiększ" />
          <span aria-hidden="true" className="h-full w-px bg-border sm:h-px sm:w-full" />
          <Strzalka kierunek={-1} Znak={ChevronDown} etykietaA11y="Zmniejsz" />
        </div>
      </div>
    </OpisPola>
  );
};

export const TOKENY_POL = { RDZEN_POLA, OPRAWA_FOKUS, OPRAWA_BLAD, WYSOKOSC } as const;

/* ══════════════════════════════════════════════════════════════════════════
   POLE WYBORU — zaznaczanie, nie przełączanie.
   ══════════════════════════════════════════════════════════════════════════

   Zbudowane na `<input type="checkbox">`, a nie na `<div>` z `role="checkbox"`.
   Powód nie jest ideologiczny: natywne pole wchodzi w formularz, ma stan
   nieokreślony, obsługuje spację, jest widziane przez autouzupełnianie i przez
   każdy czytnik ekranu bez jednej linii dodatkowego kodu. Wersje malowane od
   zera zawsze któregoś z tych zachowań nie mają — i zwykle brakuje właśnie tego,
   którego akurat ktoś potrzebuje.

   Samo pole jest PRZEZROCZYSTE i nałożone na własny znacznik (`peer`), bo
   natywnego pudełka nie da się ostylować spójnie między przeglądarkami.
   Kliknięcie, fokus i klawiatura zostają natywne; zmienia się wyłącznie wygląd.
*/
export interface PoleWyboruProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  etykieta?: React.ReactNode;
  /** wyjaśnienie pod etykietą — mniejszy rejestr, nie drugi tytuł */
  podpowiedz?: React.ReactNode;
}

export const PoleWyboru = React.forwardRef<HTMLInputElement, PoleWyboruProps>(function PoleWyboru(
  { etykieta, podpowiedz, className, id, disabled, ...rest },
  ref,
) {
  const wewnetrzneId = React.useId();
  const idPola = id ?? wewnetrzneId;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      {/* Cel dotyku to CAŁA etykieta, nie sam kwadracik 18 px — dlatego
          `<label>` obejmuje tekst, a wysokość wiersza daje 44 px na telefonie. */}
      <span className="relative flex h-11 w-5 shrink-0 items-center sm:h-6">
        <input
          ref={ref}
          id={idPola}
          type="checkbox"
          disabled={disabled}
          className="peer absolute h-5 w-5 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border bg-background/40',
            /*
              STAN WYŁĄCZONY MUSI BYĆ WIDOCZNY — zgłoszone przez Michała.
              Wcześniej całość dostawała `opacity-50`, a puste pole na ciemnym
              tle po przygaszeniu po prostu ZNIKAŁO: użytkownik widział etykietę
              bez kwadracika i nie wiedział, czy to pole wyboru, czy zwykły tekst.
              Teraz wyłączone ma MOCNIEJSZĄ obwódkę i kreskę w środku — czyta się
              jako „to jest pole, ale go nie ruszysz", a nie jako brak elementu.
            */
            'transition-[background-color,border-color,box-shadow,transform] duration-200',
            'peer-hover:border-primary/50',
            'peer-focus-visible:border-primary/60 peer-focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]',
            'border-border peer-disabled:border-foreground/25',
            /*
              WYPEŁNIENIE JAK W PASKU ZASOBU — gradient pionowy mocniejszy przy
              krawędziach, prawie przezroczysty w osi, plus rant i słaba poświata.
              Płaski `bg-primary` wyglądał obok Łuków jak element z innego produktu.
            */
            'peer-checked:border-transparent',
            'peer-checked:[background-image:linear-gradient(180deg,hsl(var(--primary))_0%,color-mix(in_srgb,hsl(var(--primary))_72%,transparent)_50%,hsl(var(--primary))_100%)]',
            'peer-checked:shadow-[inset_0_0_0_1px_hsl(var(--primary)),0_0_9px_-2px_hsl(var(--primary))]',
            // Krótkie „dociśnięcie" w chwili zaznaczenia — reakcja fizyczna,
            // po której wiadomo, że kliknięcie doszło. Bez tego pole zmienia
            // kolor bezgłośnie i przy szybkim klikaniu nie ma pewności, czy
            // zadziałało.
            'peer-active:scale-90',
            /*
              ZNAK WYBORU RYSUJE SIĘ, a nie pojawia.
              `stroke-dasharray` równa długości ścieżki i `stroke-dashoffset`
              przesunięty o tyle samo dają kreskę schowaną poza widokiem;
              zejście offsetu do zera „przeciąga" ptaszka od lewej do prawej.
              To ten sam ruch, który wykonuje ręka — dlatego czyta się jako
              odhaczenie, a nie jako zapalenie ikony.
            */
            /*
              DWA SIEGNIECIA DO DZIECI, oba z tego samego powodu.
              `peer-*` generuje selektor RODZENSTWA (`.peer:checked ~ …`), a
              zarowno poswiata, jak i ptaszek sa DZIECMI tego spana, nie bracmi
              inputa. Musimy wiec siegnac do nich stad: `[&>span]` i `[&>svg]`.
              Postawienie `peer-checked:` bezposrednio na nich nie zadziala nigdy.
            */
            /*
              CELUJEMY W KONKRETNE DZIECI, nie w „jakikolwiek span".
              Poprzednia wersja miała `[&>span]`, a dzieci są dwoje: poświata
              i kreska stanu wyłączonego. Zaznaczenie przygaszałoby więc także
              kreskę. Znaczniki `data-*` nie zależą od tego, ile dzieci przybędzie.
            */
            'peer-checked:[&>[data-poswiata]]:opacity-40',
            'peer-checked:[&>svg]:[stroke-dashoffset:0]',
            /*
              KRESKA STANU WYŁĄCZONEGO — sterowana STĄD, nie z siebie samej.
              To był ten sam błąd co wyżej, popełniony trzeci raz: `peer-disabled:`
              postawione bezpośrednio na kresce nie mogło zadziałać, bo kreska jest
              WNUKIEM `input`, a `peer-*` sięga tylko do rodzeństwa. Efekt: stan
              wyłączony nadal nie miałby żadnego znaku w środku pola.
            */
            'peer-disabled:[&>[data-kreska]]:opacity-100',
          )}
        >
          {/* Poświata pod spodem — pojawia się tylko po zaznaczeniu i zostaje
              w granicach pola (`overflow-hidden`), więc nie rozlewa się na tekst. */}
          <span
            data-poswiata=""
            className="absolute inset-0 rounded-md bg-primary opacity-0 blur-[6px] transition-opacity duration-300"
            aria-hidden="true"
          />
          {/* Kreska stanu wyłączonego — widoczna TYLKO wtedy, bo to jedyny
              stan, w którym pole nie ma ani ptaszka, ani sensu klikania. */}
          <span
            aria-hidden="true"
            data-kreska=""
            className="absolute h-px w-2 rounded-full bg-foreground/30 opacity-0 transition-opacity duration-200"
          />
          <svg
            viewBox="0 0 16 16"
            className="relative h-3.5 w-3.5 text-primary-foreground transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none [stroke-dasharray:16] [stroke-dashoffset:16]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5 L6.5 12 L13 4.5" />
          </svg>
        </span>

      </span>

      {(etykieta || podpowiedz) && (
        <label
          htmlFor={idPola}
          className={cn(
            'min-w-0 flex-1 select-none py-3 sm:py-0',
            disabled ? 'opacity-55' : 'cursor-pointer',
          )}
        >
          {etykieta && <span className="block text-[14px] text-card-foreground">{etykieta}</span>}
          {podpowiedz && (
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{podpowiedz}</span>
          )}
        </label>
      )}
    </div>
  );
});
