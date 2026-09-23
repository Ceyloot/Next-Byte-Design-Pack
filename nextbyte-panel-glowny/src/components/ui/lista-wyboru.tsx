import React from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SZKLO } from '@/components/ui/tile';
import { useDefinicjeSzkla } from '@/components/ui/szklo-plynne';
import { Plakietka } from '@/components/ui/plakietka';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  LISTA WYBORU — jedno rozwijane menu na całą platformę
 * ════════════════════════════════════════════════════════════════════════
 *
 * DLACZEGO TEN PLIK ISTNIEJE
 * Zmierzone 31.07.2026: `<SelectTrigger>` ma 364 użycia i 121 RÓŻNYCH
 * wyglądów, z czego 76 istnieje w dokładnie jednym miejscu. Do tego platforma
 * prowadzi CZTERY równoległe mechanizmy rozwijania: `select` (188 plików),
 * `dropdown-menu` (45), `popover` (68) i `command` (3).
 *
 * DLACZEGO NADBUDOWA NAD RADIKSEM, A NIE PIĄTY MECHANIZM
 * Tak samo jak `Okno`: zachowanie, dostępność, pułapka fokusu, obsługa
 * klawiatury i zamykanie na Escape zostają te, które już działają. Zmienia
 * się wyłącznie warstwa wyglądu.
 *
 * ── PRZEBUDOWA (czytelność) ─────────────────────────────────────────────
 * W pierwszej wersji cena stała TUŻ ZA NAZWĄ. Efekt: ceny lądowały na różnych
 * odległościach od lewej (bo nazwy mają różną długość), więc nie dało się ich
 * porównać wzrokiem — a przy wyborze modelu cena jest drugą najważniejszą
 * informacją po nazwie. Teraz cena jest WYRÓWNANA DO PRAWEJ, w osobnej
 * kolumnie: liczby stoją jedna pod drugą i porównują się same.
 *
 * ── SZKŁO ───────────────────────────────────────────────────────────────
 * Nakładka okien rozmywa stronę (`backdrop-blur-md` w `dialog.tsx`), ale menu
 * rozwijane nie ma nakładki — rozmywa więc TREŚĆ STRONY POD SOBĄ. Powierzchnia
 * jest półprzezroczysta, żeby to rozmycie było widać; bez tego „szkło" jest
 * tylko nazwą dla zwykłego ciemnego prostokąta.
 * Zapasowe krycie dla przeglądarek bez `backdrop-filter` jest PEŁNE — inaczej
 * tekst listy czytałby się na treści strony.
 */

/* ── SZCZEGÓŁY POZYCJI: wspólny stan panelu bocznego ───────────────────── */

type Podglad = { id: string; tresc: React.ReactNode; klucz?: string } | null;

/**
 * Jeden kanał podglądu:
 *   • `ustaw`         — chwilowy podgląd spod kursora / fokusu (mysz, klawiatura).
 *
 * Kanału „domyślny" (szczegóły wybranej pozycji pokazywane bez najechania) tu
 * NIE MA — i to jest świadome cofnięcie. Dodałem go, żeby panel miał co pokazać
 * na dotyku, ale telefon dostał tymczasem własne rozwiązanie: harmonijkę wewnątrz
 * listy (`rozwinietyId`). Kanał karmił więc już wyłącznie panel BOCZNY, czyli
 * desktop — a tam otwierał kartę szczegółów od razu po rozwinięciu listy, zanim
 * ktokolwiek czegokolwiek dotknął. Na dużym ekranie panel ma się pojawiać
 * WYŁĄCZNIE pod kursorem albo fokusem.
 */
type KanalyPodgladu = {
  ustaw: (p: Podglad) => void;
  /**
   * ROZWINIĘCIE JEST STANEM LISTY, NIE WIERSZA — i to jest sedno poprawki.
   *
   * Wcześniej każdy wiersz trzymał własne `rozwiniete`. Wynikały z tego DWA
   * osobne objawy, oba zgłoszone przez Michała, oba z tej samej przyczyny:
   *   • żaden wiersz nie wiedział o innych, więc dawało się otworzyć kilka
   *     kart szczegółów naraz i lista robiła się nieczytelna,
   *   • wiersz WYBRANY miał szczegóły otwarte na sztywno (`rozwiniete || wybrana`),
   *     więc jego strzałka nic nie robiła — nie dało się go zwinąć.
   *
   * Jeden identyfikator na całą listę załatwia oba naraz: otwarcie jednego
   * zamyka poprzedni (harmonijka), a `null` znaczy „wszystko zwinięte" —
   * także wtedy, gdy zwinięto pozycję wybraną. Tak zachowują się listy
   * rozwijane w systemach Apple i to jest zachowanie, którego ludzie oczekują.
   */
  rozwinietyId: string | null;
  przelacz: (id: string) => void;
  /** wiersz wybrany zgłasza się, żeby na starcie to on był rozwinięty */
  zglosWybrana: (id: string) => void;
  /*
    ── PANEL MUSI ODŚWIEŻYĆ SIĘ, GDY TREŚĆ WIERSZA SIĘ ZMIENI (09.09.2026) ──
    Zmierzone na żywo przy scalaniu Sonneta i Opusa w jeden wiersz „Claude 5":
    przełącznik wariantu w panelu zmieniał model (przycisk paska pokazywał już
    „Claude · OPUS"), a karta obok DALEJ opisywała Sonneta — z jego metrykami
    i jego zaznaczeniem w przełączniku.

    Przyczyna leży w tym, jak działa ten kanał: `ustaw` zapisuje GOTOWY węzeł
    Reacta w momencie najechania. Węzeł niesie propsy sprzed zmiany i nic nie
    każe mu się przerysować, bo `key` panelu to identyfikator wiersza, a wiersz
    jest wciąż ten sam. Klasyczna pułapka trzymania elementu w stanie zamiast
    renderowania go w miejscu.

    Stąd te dwa pola: wiersz podaje KLUCZ swojej treści, a kanał mówi, który
    klucz jest właśnie pokazywany. Gdy się rozjadą, wiersz publikuje świeży
    węzeł. Porównanie idzie po łańcuchu, nie po tożsamości elementu — inaczej
    (nowy JSX przy każdym renderze) efekt zapętliłby się na wieczność.
  */
  pokazywanyId: string | null;
  pokazywanyKlucz: string | null;
};

const KontekstPodgladu = React.createContext<KanalyPodgladu | null>(null);

/* ── PRZYCISK ROZWIJAJĄCY ──────────────────────────────────────────────── */

/* ── STYL POZYCJI JAKO EKSPORT ──────────────────────────────────────────
   Michał: „przerabiamy GRUNTOWNIE platformę … edytując 1 rzecz wizualnie
   wszędzie się zmienia ona".

   `ListaPozycja` to komponent Radiksa i nie da się go użyć wszędzie —
   główny wybór modeli w czacie ma własny popover z limitami dziennymi,
   nawigacją do ustawień i stanem „niedostępny", więc przełożenie go na
   Radiksa znaczyłoby przepisanie logiki, nie wyglądu.

   Dlatego SAM WYGLĄD wychodzi tutaj osobno. Kto nie może użyć komponentu,
   używa tych klas — i dostaje dokładnie to samo podświetlenie, ten sam
   promień i te same stany. Jedno źródło, dwie drogi dostępu. */
export const KLASY_POZYCJI_LISTY =
  'group relative flex cursor-pointer select-none items-center gap-3 overflow-hidden '
  + 'rounded-xl px-2.5 py-2 outline-none transition-colors duration-200 '
  + 'text-card-foreground hover:bg-foreground/[0.05] '
  + 'disabled:pointer-events-none disabled:opacity-40';

/** Podświetlenie wybranej pozycji — gradient gasnący w prawo, jak w `ListaPozycja`. */
export const TLO_POZYCJI_WYBRANEJ =
  'linear-gradient(90deg, hsl(var(--primary) / 0.16) 0%, hsl(var(--primary) / 0.05) 45%, transparent 85%)';

export const ListaWyboru = Menu.Root;

export interface ListaPrzyciskProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ikona?: LucideIcon;
  /** tylko ikona, bez strzałki — przycisk „…” w wierszu listy (zmierzone 14.09: ze strzałką wyglądał jak lista rozwijana, nie jak menu akcji) */
  samaIkona?: boolean;
  /**
   * Monogram wybranej pozycji — ten sam znak, który niesie wiersz na liście.
   * Przycisk MUSI pokazywać to samo, co pozycja: inaczej wybierasz model
   * oznaczony „A", a w zwiniętym przycisku widzisz obcą ikonę z biblioteki
   * i znak przestaje cokolwiek znaczyć.
   */
  monogram?: string;
  /**
   * ZNAK GRAFICZNY zamiast monogramu — logo dostawcy, herb, dowolny mały SVG.
   *
   * Monogram („A" dla Anthropic) powstał, bo ikony z biblioteki nic nie mówią
   * o modelu. Znak jest następnym krokiem tej samej myśli: dwie litery to
   * skrót, po którym trzeba się domyślać, a logo dostawcy rozpoznaje się
   * bez czytania. Kafelek jest TEN SAM — to samo 8×8, to samo zaokrąglenie,
   * ta sama reakcja na wybór — więc lista złożona ze znaków i monogramów
   * naraz dalej stoi w jednym rytmie.
   *
   * Pierwszeństwo: `znak` > `monogram` > `ikona`.
   *
   * Znak MUSI rysować się `currentColor`. Kafelek zmienia barwę przy wyborze
   * i podświetleniu, a wbita barwa marki rozjechałaby się z tym w połowie
   * z dziewięciu motywów platformy.
   */
  znak?: React.ReactNode;
  /** treść drugoplanowa po prawej — cena, skrót, licznik */
  poPrawej?: React.ReactNode;
  /** zwężenie do 36 px dopiero od `sm`; na telefonie zawsze 44 px (próg dotyku) */
  zwarty?: boolean;
}

export const ListaPrzycisk = React.forwardRef<HTMLButtonElement, ListaPrzyciskProps>(
  function ListaPrzycisk({ ikona: Ikona, monogram, znak, poPrawej, zwarty, samaIkona, className, children, ...rest }, ref) {
    return (
      <Menu.Trigger asChild>
        <button
          ref={ref}
          type="button"
          className={cn(
            'group inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3',
            zwarty ? 'h-11 text-[14px] sm:h-9 sm:text-[14px]' : 'h-11 text-[14px]',
            'text-card-foreground transition-[border-color,box-shadow] duration-200',
            'hover:border-primary/40',
            'focus-visible:outline-none focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]',
            'data-[state=open]:border-primary/50 data-[state=open]:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...rest}
        >
          {znak || monogram ? (
            <span
              aria-hidden="true"
              className={cn(
                // `rounded-lg` — TEN SAM promień co monogram w wierszu listy.
                // Wcześniej było `rounded-md` i ten sam element miał dwa
                // zaokrąglenia zależnie od tego, gdzie stoi.
                'flex shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 font-semibold tracking-tight text-primary',
                zwarty ? 'h-5 w-5 text-[11px]' : 'h-6 w-6 text-[11px]',
                // Znak dostaje własny rozmiar wewnątrz kafelka: monogram to
                // tekst i skaluje się z `text-*`, SVG nie — bez tego logo
                // wypełniłoby kafelek po brzegi i straciło margines, który
                // ma każda litera.
                znak && '[&>svg]:h-[70%] [&>svg]:w-[70%]',
              )}
            >
              {znak ?? monogram}
            </span>
          ) : Ikona ? (
            <Ikona className="h-4 w-4 shrink-0 text-primary" />
          ) : null}
          {/*
            IKONA W TREŚCI NIE MOŻE ŁAMAĆ WIERSZA (03.09.2026).

            Michał o przycisku „Narzędzia" w podglądzie obrazu: „jest pod sobą
            jakby" — ikona stała NAD napisem, choć sąsiednie przyciski mają ją
            obok.

            Powód: `truncate` to `display: block` + `nowrap`, a Tailwind
            w warstwie bazowej ustawia `svg { display: block }`. Element
            blokowy zaczyna nowy wiersz niezależnie od `nowrap`, więc każdy
            przycisk, który podaje ikonę jako DZIECKO (a nie przez `ikona=`),
            rozjeżdżał się na dwa wiersze. Dotyczy 18 użyć w Studiach Zdjęć
            i Wideo, nie tylko tego jednego.

            `inline-block` przywraca ikonę do wiersza, `align-middle` stawia
            ją na wysokości tekstu, a odstęp dokładamy tylko wtedy, gdy obok
            ikony faktycznie coś stoi — przycisk z samą ikoną (np. „Więcej
            akcji") zostaje wyśrodkowany jak dotąd.
          */}
          {/* sama ikona: bez rozpychania i wyrównania do lewej — ikona siedzi w środku przycisku */}
          <span className={samaIkona ? 'flex items-center justify-center' : 'min-w-0 flex-1 truncate text-left [&>svg]:inline-block [&>svg]:align-middle [&>svg:not(:only-child)]:mr-1.5'}>{children}</span>
          {poPrawej && <span className="shrink-0 tabular-nums text-muted-foreground">{poPrawej}</span>}
          {!samaIkona && (
            <ChevronDown
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          )}
        </button>
      </Menu.Trigger>
    );
  },
);

/* ── PANEL ─────────────────────────────────────────────────────────────── */

export interface ListaTrescProps extends React.ComponentPropsWithoutRef<typeof Menu.Content> {
  /** ogranicza wysokość i włącza przewijanie — dla długich list modeli */
  maksWysokosc?: string;
  /** otwiera listę przewiniętą na górę, zamiast tam, gdzie fokus zawędrował do zaznaczonej pozycji */
  odGory?: boolean;
}

export const ListaTresc = React.forwardRef<
  React.ElementRef<typeof Menu.Content>,
  ListaTrescProps
>(function ListaTresc({ className, children, maksWysokosc = '22rem', sideOffset = 8, odGory, ...rest }, ref) {
  useDefinicjeSzkla();

  /*
    `odGory`: zgłoszone przy selektorze modeli (18.08) — wybrany model siedział
    nisko na liście, fokus go przewijał do widoku i menu otwierało się „od dołu",
    chowając pierwszych dostawców. Drugi zapis w rAF, bo fokus Radiksa potrafi
    przewinąć kontener już PO zamontowaniu treści.
  */
  const listaRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (!odGory) return;
    const el = listaRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const raf = requestAnimationFrame(() => { el.scrollTop = 0; });
    return () => cancelAnimationFrame(raf);
  }, [odGory]);
  const [podglad, ustawPodglad] = React.useState<Podglad>(null);

  /*
    ════════════════════════════════════════════════════════════════════════
     CHWILA ZWŁOKI PRZED SCHOWANIEM PANELU
    ════════════════════════════════════════════════════════════════════════

    Michał: „jak mam najechane na np. Opus, nie mogę przejść myszką do
    statystyk i wybrać reasoning effort, bo znika".

    Panel dało się już najechać (mostek `before:` łatał 8 px odstępu), ale
    mostek ratuje TYLKO ruch idealnie poziomy. Droga z „Claude Opus" na dole
    listy do przełącznika „Niski / Średni / Wysoki" u góry karty biegnie po
    skosie — kursor wychodzi górą wiersza, mija mostek i przez moment nie jest
    nad niczym, co należy do menu. Wtedy leci `pointerleave` i podgląd znika
    w połowie drogi.

    Zamiast poszerzać mostek (co przy każdym kącie ruchu wymagałoby innej
    szerokości), dajemy chwilę zwłoki: po wyjściu kursora panel czeka ~180 ms,
    zanim zniknie. Powrót nad menu albo nad sam panel kasuje odliczanie.
    To ta sama mechanika, której używają menu systemowe — kursor ma prawo
    na moment „wypaść" z obszaru, jeśli zaraz wraca.
  */
  const zegarSchowania = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const anulujSchowanie = React.useCallback(() => {
    if (zegarSchowania.current) {
      clearTimeout(zegarSchowania.current);
      zegarSchowania.current = null;
    }
  }, []);
  const zaplanujSchowanie = React.useCallback(() => {
    anulujSchowanie();
    zegarSchowania.current = setTimeout(() => ustawPodglad(null), 180);
  }, [anulujSchowanie]);
  /* Bez sprzątania zegar dożyłby odmontowania listy i próbował ustawić stan
     na komponencie, którego już nie ma. */
  React.useEffect(() => anulujSchowanie, [anulujSchowanie]);
  const [rozwinietyId, setRozwinietyId] = React.useState<string | null>(null);
  // Odróżnia „jeszcze nie ustawiono" od „użytkownik świadomie zwinął wszystko".
  // Bez tego zwinięcie wybranej pozycji natychmiast otwierałoby ją z powrotem.
  const zainicjowane = React.useRef(false);

  const przelacz = React.useCallback((id: string) => {
    zainicjowane.current = true;
    setRozwinietyId((biezacy) => (biezacy === id ? null : id));
  }, []);

  const zglosWybrana = React.useCallback((id: string) => {
    if (zainicjowane.current) return;
    zainicjowane.current = true;
    setRozwinietyId(id);
  }, []);
  // Panel boczny pokazuje WYŁĄCZNIE to, co jest pod kursorem albo fokusem.
  const doPokazania = podglad;
  const kanaly = React.useMemo(
    () => ({
      ustaw: ustawPodglad,
      rozwinietyId,
      przelacz,
      zglosWybrana,
      pokazywanyId: podglad?.id ?? null,
      pokazywanyKlucz: podglad?.klucz ?? null,
    }),
    [rozwinietyId, przelacz, zglosWybrana, podglad],
  );

  /*
    STRONA PANELU SZCZEGÓŁÓW — mierzona, nie założona.

    Panel wisi na `left-full`, czyli zawsze po prawej stronie listy. Radix
    pilnuje, żeby SAMA LISTA nie wyszła poza ekran, ale o panelu nic nie wie —
    to nie jest element pozycjonowany przez Radiksa, tylko zwykłe dziecko.
    Zmierzone przy oknie 1047 px: lista otwarta przy prawej krawędzi wypchnęłaby
    panel 256 PX POZA EKRAN. Użytkownik zobaczyłby ucięty kikut karty.

    Dlatego przed pokazaniem panelu liczymy, czy mieści się z prawej; jeśli nie,
    odbijamy go na lewo. Pomiar w `useLayoutEffect`, czyli PRZED malowaniem —
    inaczej panel mrugnąłby raz po złej stronie.
  */
  const kotwica = React.useRef<HTMLDivElement>(null);
  const [naLewo, setNaLewo] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!doPokazania || !kotwica.current) return;
    const SZEROKOSC_PANELU = 288; /* w-72 */
    const ODSTEP = 8;             /* ml-2 / mr-2 */
    const r = kotwica.current.getBoundingClientRect();
    setNaLewo(r.right + ODSTEP + SZEROKOSC_PANELU > window.innerWidth);
  }, [doPokazania]);

  return (
    <Menu.Portal>
      <Menu.Content
        ref={ref}
        sideOffset={sideOffset}
        /* ODSTĘP OD KRAWĘDZI EKRANU — zmierzone na telefonie 375 px: panel
           stał na 24–375, czyli dotykał prawej krawędzi bez marginesu.
           Nie wychodził poza ekran (Radix tego pilnuje), ale przyklejony
           do bezela wygląda na ucięty. 8 px to ten sam odstęp, co między
           listą a panelem szczegółów. */
        collisionPadding={8}
        onPointerEnter={anulujSchowanie}
        onPointerLeave={zaplanujSchowanie}
        /* Zamknięcie listy chowa panel NATYCHMIAST — tu zwłoka nie ma sensu,
           bo nie ma dokąd wracać. */
        onCloseAutoFocus={() => { anulujSchowanie(); ustawPodglad(null); }}
        className={cn(
          /*
            SAM `Content` NIE MA ANI TŁA, ANI ROZMYCIA — i to jest istotne,
            a nie kosmetyczne. `backdrop-filter` zakłada NOWY KONTEKST: element
            z rozmyciem rozmywa to, co jest pod NIM, ale jego dzieci rozmywają
            już tylko jego zawartość. Gdy szkło siedziało tutaj, panel szczegółów
            (dziecko) nie miał czego rozmywać i robił się przezroczysty —
            treść strony przebijała przez niego razem z tekstem.
            Dlatego szkło zeszło poziom niżej, na DWOJE RODZEŃSTWA: listę
            i panel. Każde z nich rozmywa stronę samodzielnie.
          */
          /*
            ŻADNEJ ANIMACJI KRYCIA NA TYM POZIOMIE — to nie jest kosmetyka.
            Zmierzone: `Menu.Content` z klasą `fade-in-0` ma w trakcie animacji
            `opacity: 0.887`, a przodek z kryciem poniżej 1 tworzy IZOLOWANĄ
            GRUPĘ KOMPOZYCJI. Wtedy `backdrop-filter` dziecka nie ma czego
            próbkować i przestaje działać — zostaje samo półprzezroczyste tło
            nad OSTRYM tekstem strony. Wygląda to jak zepsuty, prześwitujący
            panel i dokładnie tak wyglądało.
            Dlatego tutaj jest wyłącznie pozycjonowanie, a ruch przenieśliśmy
            na same powierzchnie szkła (patrz `group-data-[state=...]` niżej).
          */
          /*
            SUFIT SZEROKOŚCI — Radix pozycjonuje panel, ale NIE ogranicza jego
            szerokości. Zmierzone na ekranie 371 px: po dołożeniu rozwijanych
            szczegółów panel urósł do 409 px i wystawał 34 px poza ekran,
            z 29 elementami poza krawędzią. `min-w` bez `max-w` to zawsze
            zaproszenie do takiego rozjazdu.
          */
          'group relative z-[250] min-w-[17rem] max-w-[calc(100vw-1.5rem)] bg-transparent p-0',
          className,
        )}
        {...rest}
      >
        <div
          ref={kotwica}
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border p-1.5',
            /* SZKŁO ZESZŁO STĄD NA WŁASNĄ WARSTWĘ (patrz `<span>` niżej).
               Michał: „podczas przewijania tej listy coś dziwnego z tłem za
               nią się dzieje". Zmierzone: po przewinięciu listy jasna smuga
               ZNIKA, choć za panelem nic się nie ruszyło — czyli nie było to
               poprawne odbicie strony, tylko nieodświeżony zrzut tła.
               Przyczyna: przewijana lista była DZIECKIEM elementu z
               `backdrop-filter`. Każde przemalowanie przy przewijaniu
               unieważnia zawartość, ale zrzut tła zostaje stary — i widać
               go jako prostokątną smugę do następnego pełnego przemalowania. */
            'shadow-[0_24px_60px_-12px_hsl(var(--background)/0.85),0_0_0_1px_hsl(var(--primary)/0.14)]',
            /*
              WEJŚCIE BEZ PRZENIKANIA — samo przybliżenie. Gdyby było `fade-in`,
              szkło przez chwilę miałoby krycie poniżej 1 i rozmycie nie
              zdążyłoby zadziałać (ten sam mechanizm, co opisany wyżej).
              Przy ZAMYKANIU przenikanie jest w porządku: rozmycie i tak
              przestaje mieć znaczenie.
            */
            'group-data-[state=open]:animate-in group-data-[state=open]:zoom-in-95',
            'group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=closed]:zoom-out-95',
          )}
        >
          {/*
            POŁYSK — i to jest powód, dla którego menu wyglądało „sucho".
            Samo `nb-szklo` nie robi szkła: nad ciemnym, jednolitym tłem
            nie ma czego rozmywać, więc powierzchnia zostaje płaskim prostokątem.
            Szkło czyta się dopiero, gdy ma WŁASNE ŚWIATŁO — jasne u góry po
            lewej, gasnące ku dołowi. Liczone od `--foreground`, więc na jasnych
            motywach nie zamienia się w białą plamę.
          */}
          {/*
            TAFLA — pusta warstwa, która NIGDY się nie przewija.
            To jedyne miejsce z `backdrop-filter` w tym panelu. Nie ma dzieci,
            nie ma treści, nie zmienia rozmiaru przy przewijaniu listy — więc
            zrzut tła nie ma się od czego zestarzeć. Lista leży NAD nią jako
            zwykłe, przezroczyste pudełko.
          */}
          <span aria-hidden="true" className={cn('pointer-events-none absolute inset-0 rounded-2xl', SZKLO, 'nb-szklo-tafla')} />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(150deg, hsl(var(--foreground) / 0.07) 0%, transparent 42%, transparent 100%)',
            }}
          />

          {/* świetlna krawędź u góry — ten sam gest co karty i okna */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-50"
            style={{ background: 'linear-gradient(90deg,transparent,hsl(var(--primary)),transparent)' }}
          />

          <KontekstPodgladu.Provider value={kanaly}>
            <div
              ref={listaRef}
              className="nb-pasek relative overflow-y-auto overflow-x-hidden"
              /*
                ── WYSOKOŚĆ Z MIEJSCA, KTÓRE FAKTYCZNIE ZOSTAŁO ──────────────
                Zgłoszenie zespołu: „wybór trybu i modelu w chat ai nie
                dopasowuje się wysokością i rozmiarem, aby nic nie ucinało".

                Stało tu samo `maksWysokosc`, czyli 22rem = 352 px wpisane
                na sztywno. Na telefonie menu otwiera się NAD przyciskiem
                stojącym nisko przy klawiaturze — a nad nim bywa mniej niż
                352 px. Lista trzymała swoją wysokość, wychodziła poza górną
                krawędź i ucinało pierwsze pozycje: „Zbalansowany" u góry,
                „Lokalny" przy modelach.

                Radix liczy tę wolną przestrzeń i podaje ją w
                `--radix-popper-available-height` — trzeba było ją tylko
                przeczytać. `min()` zostawia 22rem jako sufit tam, gdzie
                miejsca jest dużo, a 2rem zapasu idzie na to, co w liście
                stoi poza przewijanym obszarem (pasek u góry, wyściółka).
              */
              style={{
                maxHeight: `min(${maksWysokosc}, calc(var(--radix-popper-available-height, 100vh) - 2rem))`,
              }}
            >
              {children}
            </div>
          </KontekstPodgladu.Provider>
        </div>

        {/*
          PANEL SZCZEGÓŁÓW — tylko na szerokich ekranach.
          Poniżej `lg` po prostu go nie ma: doklejony z boku wyszedłby poza
          ekran telefonu albo przykrył samą listę, czyli utrudnił wybór
          zamiast go ułatwić. Opis pozycji zostaje w wierszu, więc nic nie ginie.
        */}
        {doPokazania && (
          <div
            /*
              `key` NA IDENTYFIKATORZE POZYCJI — bez tego animacji nie widać.

              Panel ma `animate-in fade-in-0 zoom-in-95`, ale animacja wejścia
              odpala się TYLKO przy montowaniu elementu. Przy przechodzeniu
              kursorem z modelu na model React widzi ten sam `<div>` i po prostu
              podmienia w nim treść — element się nie montuje, więc animacja
              nigdy nie leci drugi raz. Efekt: pierwszy pokaz animowany, każdy
              kolejny to skokowa podmiana zawartości.

              Klucz zależny od pozycji sprawia, że React traktuje to jako NOWY
              element: stary odmontowuje, nowy montuje — i animacja gra przy
              każdej zmianie, tak jak powinna.
            */
            /* Klucz niesie też WARIANT treści — bez tego przełączenie
               Sonnet↔Opus podmieniłoby zawartość w tym samym elemencie
               i karta zmieniłaby się skokowo, bez animacji, jak przy
               przechodzeniu między wierszami sprzed tej poprawki. */
            key={`${doPokazania.id}:${doPokazania.klucz ?? ''}`}
            /* Kursor NAD panelem kasuje odliczanie — inaczej panel zniknąłby
               spod ręki w trakcie wybierania poziomu rozumowania. */
            onPointerEnter={anulujSchowanie}
            onPointerLeave={zaplanujSchowanie}
            className={cn(
              /*
                `hidden lg:block`, a NIE `max-lg:hidden` — zmierzone 02.08.2026.
                Wariant `max-lg:hidden` był na elemencie, a `getComputedStyle`
                pokazywał `display: block`: panel renderował się na telefonie
                POZA EKRANEM (lewa krawędź −296 px), razem z animacją wejścia,
                rozmyciem tła i cieniem. Niewidoczny, a kosztujący układ i malowanie.
                Zapis „domyślnie ukryty, pokazany od `lg`" nie zależy od kolejności
                wariantów w arkuszu i jest odporny na to, co tam zaszło.
              */
              /*
                PANEL DA SIĘ NAJECHAĆ — Michał: „jak chcę najechać myszką na
                panel ze szczegółami modelu to znika mi on, napraw to".

                Dwie przyczyny naraz, obie tutaj:

                • `pointer-events-none` sprawiało, że kursor NIGDY nie był nad
                  panelem — przechodził przez niego na treść pod spodem. Przy
                  okazji oznaczało to, że przełącznik poziomu rozumowania
                  w tym panelu był na desktopie NIEKLIKALNY: widoczny, ładny
                  i martwy.
                • między listą a panelem stoi 8 px odstępu (`ml-2`). Kursor
                  wędrujący z wiersza na panel przez chwilę nie jest nad
                  żadnym potomkiem `Menu.Content`, więc leci `pointerleave`
                  i podgląd się czyści — panel znika dokładnie w połowie drogi.

                Stąd `pointer-events-auto` oraz MOSTEK: przezroczysty pasek
                `before:` szerokości odstępu, przyklejony do krawędzi panelu
                od strony listy. Jest potomkiem panelu, więc kursor nad nim
                nadal liczy się jako „w środku" i podgląd zostaje.
              */
              'pointer-events-auto absolute top-0 hidden w-72 rounded-2xl border border-border p-4 lg:block',
              /* Mostek szerszy niż sam odstęp (8 px) i wychodzący ponad panel:
                 droga z dolnego wiersza listy do góry karty biegnie po skosie,
                 więc kursor wchodzi w tę przestrzeń WYŻEJ niż wiersz, z którego
                 wyszedł. `-inset-y-3` daje na to zapas w pionie. */
              "before:absolute before:-inset-y-3 before:w-4 before:content-['']",
              /*
                PANEL BOCZNY ISTNIEJE WYŁĄCZNIE OD `lg`.

                Próbowałem pokazywać go na telefonie jako blok „pod listą" —
                i to był błąd, który widać było dopiero na ekranie, nie w pomiarach.
                Menu potrafi otworzyć się W GÓRĘ (unik przy krawędzi okna), a wtedy
                „pod listą" znaczy MIĘDZY LISTĄ A PRZYCISKIEM, który ją otworzył.
                Kolejność czytania wychodziła bez sensu: lista, wielka karta
                szczegółów, dopiero na końcu przycisk.
                Na telefonie szczegóły wchodzą teraz DO WNĘTRZA listy, pod wybrany
                wiersz — patrz `ListaPozycja`. Tam kolejność jest poprawna
                niezależnie od kierunku otwarcia.
              */
              naLewo ? 'right-full mr-2 before:-right-4' : 'left-full ml-2 before:-left-4',
              SZKLO,
              /* panel szczegółów też unosi się nad stroną — to tafla, więc bierze
                 wspólne wypełnienie i wspólną, widoczną krawędź */
              'nb-szklo-tafla',
              'shadow-[0_24px_60px_-12px_hsl(var(--background)/0.85),0_0_0_1px_hsl(var(--primary)/0.14)]',
              'animate-in fade-in-0 zoom-in-95 duration-200',
            )}
          >
            {doPokazania.tresc}
          </div>
        )}
      </Menu.Content>
    </Menu.Portal>
  );
});

/* ── NAGŁÓWEK GRUPY ────────────────────────────────────────────────────── */

/**
 * Nazwa sekcji w liście — „INNE MODELE", „NEXTBYTE". Ten sam rejestr, co
 * nagłówek kafelka: wersaliki z rozstrzeleniem, czyli sygnał „to jest nazwa
 * zbioru", a nie pozycja do kliknięcia.
 */
export const ListaGrupa: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className,
}) => (
  <Menu.Label
    className={cn(
      'px-2.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground',
      className,
    )}
  >
    {children}
  </Menu.Label>
);

export const ListaRozdzielacz: React.FC<{ className?: string }> = ({ className }) => (
  <Menu.Separator className={cn('my-1.5 h-px bg-border', className)} />
);

/* ── POZYCJA ───────────────────────────────────────────────────────────── */

export interface ListaPozycjaProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Menu.Item>, 'onSelect'> {
  ikona?: LucideIcon;
  /**
   * MONOGRAM zamiast ikony — 1–2 znaki w kafelku, np. „A" dla Anthropic.
   *
   * Powstał, bo ikony z biblioteki przy modelach AI wyglądają na gotowce:
   * korona, błyskawica i iskierka nie mówią NIC o modelu, a każdą z nich
   * widziało się w setce innych aplikacji. Monogram dostawcy niesie realną
   * informację (czyj to model) i czyta się jak znak produktu, nie jak clipart.
   * Gdy podano oba, wygrywa monogram.
   */
  monogram?: string;
  /**
   * ZNAK GRAFICZNY zamiast monogramu — logo dostawcy, herb, dowolny mały SVG.
   *
   * Monogram („A" dla Anthropic) powstał, bo ikony z biblioteki nic nie mówią
   * o modelu. Znak jest następnym krokiem tej samej myśli: dwie litery to
   * skrót, po którym trzeba się domyślać, a logo dostawcy rozpoznaje się
   * bez czytania. Kafelek jest TEN SAM — to samo 8×8, to samo zaokrąglenie,
   * ta sama reakcja na wybór — więc lista złożona ze znaków i monogramów
   * naraz dalej stoi w jednym rytmie.
   *
   * Pierwszeństwo: `znak` > `monogram` > `ikona`.
   *
   * Znak MUSI rysować się `currentColor`. Kafelek zmienia barwę przy wyborze
   * i podświetleniu, a wbita barwa marki rozjechałaby się z tym w połowie
   * z dziewięciu motywów platformy.
   */
  znak?: React.ReactNode;
  nazwa: React.ReactNode;
  opis?: React.ReactNode;
  /** cena albo skrót — wyrównane do PRAWEJ, żeby liczby dały się porównać */
  meta?: React.ReactNode;
  /** plakietka przy nazwie — „BŁĄD", „NOWOŚĆ" */
  znacznik?: React.ReactNode;
  wybrana?: boolean;
  /** karta szczegółów pokazywana z boku po najechaniu (od `lg` wzwyż) */
  szczegoly?: React.ReactNode;
  /**
   * Klucz treści `szczegoly` — podaj, gdy ta sama pozycja potrafi pokazywać
   * RÓŻNE szczegóły (np. wiersz „Claude 5" opisuje raz Sonneta, raz Opusa).
   * Zmiana klucza odświeża panel boczny; bez niego panel pokaże to, co było
   * w chwili najechania. Szczegóły przy `pokazywanyKlucz` w `KanalyPodgladu`.
   */
  kluczSzczegolow?: string;
  /** akcja niszcząca — jedyny przypadek, w którym pozycja zmienia kolor */
  niszczaca?: boolean;
  onWybor?: () => void;
}

export const ListaPozycja = React.forwardRef<
  React.ElementRef<typeof Menu.Item>,
  ListaPozycjaProps
>(function ListaPozycja(
  { ikona: Ikona, monogram, znak, nazwa, opis, meta, znacznik, wybrana, szczegoly, kluczSzczegolow, niszczaca, onWybor, className, ...rest },
  ref,
) {
  const kanaly = React.useContext(KontekstPodgladu);
  const id = React.useId();

  /*
    ROZWIJANIE SZCZEGÓŁÓW BEZ WYBIERANIA — na telefonie to nie jest wygoda,
    tylko warunek działania. Dotknięcie wiersza WYBIERA model i zamyka menu,
    więc jedyną drogą do informacji było podjęcie decyzji, a potem otwarcie
    listy po raz drugi, żeby zobaczyć, co się właściwie wybrało.
    Osobny przycisk rozdziela „pokaż mi to" od „biorę to".
  */
  const rozwiniete = kanaly?.rozwinietyId === id;

  const pokaz = () => { if (szczegoly && kanaly) kanaly.ustaw({ id, tresc: szczegoly, klucz: kluczSzczegolow }); };

  /* Patrz `pokazywanyKlucz` w `KanalyPodgladu`: gdy pokazywany jest TEN wiersz,
     a jego treść zmieniła się pod spodem, publikujemy ją ponownie. Warunek na
     kluczu jest tu bezpiecznikiem przed pętlą — `szczegoly` to świeży JSX przy
     każdym renderze, więc bez niego efekt wywoływałby sam siebie. */
  React.useEffect(() => {
    if (!szczegoly || !kanaly) return;
    if (kanaly.pokazywanyId !== id) return;
    if (kanaly.pokazywanyKlucz === (kluczSzczegolow ?? null)) return;
    kanaly.ustaw({ id, tresc: szczegoly, klucz: kluczSzczegolow });
  }, [kluczSzczegolow, kanaly, id, szczegoly]);

  // Pozycja WYBRANA zgłasza się tylko po to, żeby na telefonie to ona była
  // rozwinięta na starcie. Panelu bocznego (desktop) to NIE dotyczy — tam
  // szczegóły pokazuje wyłącznie najechanie.
  React.useEffect(() => {
    if (!wybrana || !szczegoly || !kanaly) return;
    kanaly.zglosWybrana(id);
  }, [wybrana, szczegoly, kanaly, id]);

  return (
    <>
    <Menu.Item
      ref={ref}
      onSelect={onWybor}
      // Podgląd otwiera się i myszą, i klawiaturą: Radix nadaje fokus pozycji
      // podświetlonej strzałkami, więc `onFocus` obsługuje ten drugi przypadek.
      onPointerEnter={pokaz}
      onFocus={pokaz}
      className={cn(
        'group relative flex cursor-pointer select-none items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 outline-none',
        'transition-colors duration-200',
        // Radix nie używa `:hover` — podświetla klawiaturowo i myszą przez
        // `data-highlighted`. Dzięki temu strzałki i kursor dają ten sam efekt.
        niszczaca
          ? 'text-destructive data-[highlighted]:bg-destructive/10'
          : 'text-card-foreground data-[highlighted]:bg-foreground/[0.05]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className,
      )}
      {...rest}
    >
      {/*
        PODŚWIETLENIE WYBRANEJ POZYCJI — gradient, nie płaska plama.
        Poprzednio wybrany wiersz dostawał jednolite `bg-primary/8` na całą
        szerokość i wyglądał jak zaznaczenie w arkuszu. Teraz światło jest
        NAJMOCNIEJSZE PRZY SZTABCE i gaśnie w prawo — dzięki temu prowadzi wzrok
        od znacznika w stronę treści, zamiast równomiernie podbarwiać prostokąt.
      */}
      {wybrana && !niszczaca && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--primary) / 0.16) 0%, hsl(var(--primary) / 0.05) 45%, transparent 85%)',
          }}
        />
      )}

      {/* Sztabka aktywnego wyboru. Razem z podświetleniem i kolorem nazwy daje
          TRZY sygnały wyboru — dlatego ptaszek po prawej został usunięty:
          czwarty znacznik tej samej rzeczy tylko zaśmiecał wiersz. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 left-0 w-[3px] rounded-r-full transition-opacity duration-200',
          wybrana && !niszczaca ? 'bg-primary opacity-100' : 'opacity-0',
        )}
      />

      {/* ZNAK POZYCJI: znak > monogram > ikona — patrz komentarze przy propsach. */}
      {znak || monogram ? (
        <span
          aria-hidden="true"
          className={cn(
            'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold tracking-tight',
            'transition-colors duration-200',
            wybrana && !niszczaca
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-border bg-foreground/[0.04] text-muted-foreground group-data-[highlighted]:border-primary/25 group-data-[highlighted]:text-foreground',
            // Patrz komentarz przy tym samym miejscu w `ListaPrzycisk`:
            // SVG nie skaluje się z `text-*`, więc margines w kafelku trzeba
            // mu dać wprost.
            znak && '[&>svg]:h-[19px] [&>svg]:w-[19px]',
          )}
        >
          {znak ?? monogram}
        </span>
      ) : Ikona ? (
        <Ikona
          className={cn(
            'relative h-4 w-4 shrink-0',
            niszczaca ? 'text-destructive' : wybrana ? 'text-primary' : 'text-muted-foreground',
          )}
        />
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* Nazwa mocniejsza, opis wyraźnie słabszy — bez tego oba wiersze
              miały ten sam ciężar i cała lista czytała się jako jedna płaszczyzna. */}
          <span className={cn('truncate text-[14px] font-semibold', wybrana && !niszczaca && 'text-primary')}>
            {nazwa}
          </span>
          {znacznik && <span className="shrink-0">{znacznik}</span>}
        </div>
        {opis && (
          // `truncate`, bo opisy modeli bywają zdaniami — przy zawijaniu wiersze
          // przestają mieć równą wysokość i lista „skacze" pod kursorem.
          //
          // PEŁNE `text-muted-foreground`, BEZ `/80`. Krótko miałem tu `/80`,
          // wyłącznie po to, żeby opis był słabszy od nazwy. Policzone na
          // wszystkich 9 motywach: to krycie zbijało kontrast opisu poniżej
          // progu 4.5:1 na PIĘCIU z nich — Jasny 3.49, NextByte v2 3.82,
          // Luxury 4.17, Limonka 4.18, Fioletowy 4.35. Czyli kupowałem
          // hierarchię za czytelność. A hierarchię niosą już rozmiar
          // (11 px wobec 14) i grubość (zwykła wobec półgrubej), więc krycia
          // tu nie ma i nie ma go po co przywracać.
          <span className="mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground">
            {opis}
          </span>
        )}
      </div>

      {/* CENA wyrównana do prawej — liczby stoją w kolumnie i porównują się same.
          To jest PLAKIETKA, nie jej podróbka. Pierwsza wersja rysowała tu własny
          chip z `rounded-md` — jedynym takim promieniem w całym zestawie, przy
          czterech ustalonych poziomach zaokrągleń. Klasyczny sposób, w jaki
          rodzi się rozjazd: element wygląda „prawie jak" plakietka i za pół roku
          jest ich pięćset. */}
      {meta && (
        <Plakietka
          intencja={wybrana && !niszczaca ? 'akcent' : 'neutralna'}
          className="relative tabular-nums normal-case tracking-normal"
        >
          {meta}
        </Plakietka>
      )}

      {/*
        PRZYCISK ROZWIJANIA — tylko na telefonie i tylko gdy są szczegóły.
        `stopPropagation` + `preventDefault` na WSZYSTKICH zdarzeniach wskaźnika:
        Radix wybiera pozycję na `pointerup`/`click`, więc bez tego dotknięcie
        strzałki wybrałoby model i zamknęło menu — czyli dokładnie to, co ten
        przycisk ma omijać.
      */}
      {szczegoly && (
        <button
          type="button"
          tabIndex={-1}
          aria-expanded={rozwiniete}
          aria-label={rozwiniete ? 'Zwiń szczegóły' : 'Pokaż szczegóły'}
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            kanaly?.przelacz(id);
          }}
          className={cn(
            'relative -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg lg:hidden',
            'text-muted-foreground transition-colors duration-200',
            'hover:bg-foreground/[0.07] hover:text-foreground',
            rozwiniete && 'bg-foreground/[0.07] text-foreground',
          )}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', rozwiniete && 'rotate-180')}
          />
        </button>
      )}
    </Menu.Item>

      {/*
        SZCZEGÓŁY NA TELEFONIE — WEWNĄTRZ LISTY, POD WYBRANYM WIERSZEM.

        Na wąskim ekranie nie ma miejsca na panel z boku, a doklejanie go „pod
        listą" nie działa: menu potrafi otworzyć się w górę i karta ląduje wtedy
        między listą a przyciskiem. Tutaj szczegóły są zwykłym blokiem tuż pod
        swoim wierszem, więc kolejność czytania jest poprawna zawsze.

        `role="group"` zamiast pozycji menu: to jest opis wyboru, a nie kolejna
        rzecz do kliknięcia — nie powinien łapać nawigacji strzałkami.
      */}
      {rozwiniete && szczegoly && (
        <div
          role="group"
          aria-label="Szczegóły wybranej pozycji"
          className="mx-1 mb-1 mt-0.5 min-w-0 overflow-hidden rounded-xl border border-primary/25 bg-primary/[0.05] p-3 lg:hidden"
        >
          {szczegoly}
        </div>
      )}
    </>
  );
});

/* ── CECHA — pasek segmentowy do karty szczegółów ──────────────────────── */

/**
 * Ocena cechy w skali 1–8 (inteligencja, szybkość, kontekst, koszt).
 *
 * Segmenty, a nie ciągły pasek: ocena modelu jest z natury zgrubna, a ciągły
 * pasek sugeruje pomiar z dokładnością, której nie mamy. Kolor jest JEDEN —
 * kolor motywu; wypełnione segmenty niosą wartość, puste są tłem.
 */
export const ListaCecha: React.FC<{
  nazwa: string;
  wartosc: number;
  zIlu?: number;
  className?: string;
}> = ({ nazwa, wartosc, zIlu = 8, className }) => {
  // Przycięcie do zakresu: ocena spoza skali (np. 12 z 8 albo wartość ujemna)
  // narysowałaby pasek, który kłamie o sobie samym — wszystkie segmenty pełne
  // przy „12" wyglądają identycznie jak przy „8", więc liczba przestaje coś
  // znaczyć. Lepiej przyciąć jawnie tutaj niż udawać, że dane są poprawne.
  const pelnych = Math.max(0, Math.min(zIlu, Math.round(wartosc)));

  return (
    <div className={cn('space-y-1', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {nazwa}
      </span>
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={`${nazwa}: ${pelnych} z ${zIlu}`}
      >
        {Array.from({ length: zIlu }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'h-1.5 flex-1 rounded-[1px]',
              i < pelnych ? 'bg-primary' : 'bg-foreground/[0.09]',
            )}
          />
        ))}
      </div>
    </div>
  );
};
