import React from 'react';
import { cn } from '@/lib/utils';
import { Awatar } from '@/components/ui/plakietka';
import { SZKLO } from '@/components/ui/tile';
import { Send, Layers } from 'lucide-react';
import { ListaPrzycisk } from '@/components/ui/lista-wyboru';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ROZMOWA — jedna powierzchnia dialogu na całą platformę
 * ════════════════════════════════════════════════════════════════════════
 *
 * CO POKAZAŁ POMIAR (02.08.2026, całe `src`)
 *     własny dymek wiadomości  →  15 plików
 *     własne wejście czatu     →  12+ plików
 *
 * Piętnaście miejsc, w których ktoś napisał „jeśli to użytkownik, wyrównaj
 * w prawo, jeśli AI — w lewo". Wśród nich Kalendarz, Analityka, faktury firmowe,
 * arkusze, kreator e-booków i zgłoszenia — czyli dokładnie te ekrany, do których
 * ma trafić mini-czat asystenta. Bez tego pliku byłby on szesnastą implementacją.
 *
 * ── CZEGO TEN PLIK NIE ROBI ─────────────────────────────────────────────
 * NIE zastępuje `chat/MessageBubble.tsx` (981 linii). Tamten renderuje tabele,
 * wyniki badań, załączniki i eksport do PDF — to jest logika produktu, nie wygląd.
 * Tutaj jest wyłącznie POWŁOKA: kto mówi, po której stronie, w czym, z jaką
 * ramką i jakimi akcjami pod spodem. Bogata treść wchodzi jako `children`.
 *
 * Dzięki temu mini-czat w Studiu Zdjęć może użyć powłoki bez ciągnięcia za sobą
 * eksportu PDF, a Chat AI może zostać przy swoim renderowaniu treści.
 */

/* ── DYMEK ────────────────────────────────────────────────────────────── */

export type Nadawca = 'uzytkownik' | 'ai' | 'system';

export interface WiadomoscProps {
  nadawca: Nadawca;
  /** treść — dowolna, także własny renderer znaczników */
  children: React.ReactNode;
  /** nazwa do awatara; przy `ai` bierz nazwę modelu, nie „Asystent" */
  nazwa?: string;
  awatar?: string | null;
  /** godzina — pokazywana dopiero po najechaniu, żeby nie zaśmiecać rozmowy */
  czas?: string;
  /** akcje pod wiadomością: kopiuj, powtórz, odczytaj */
  akcje?: React.ReactNode;
  /** koszt w Byte — TYLKO dla odpowiedzi AI i tylko gdy naprawdę pobrano */
  koszt?: React.ReactNode;
  /** trwa pisanie — dymek dostaje wtedy migający kursor zamiast akcji */
  pisze?: boolean;
  className?: string;
}

export const Wiadomosc: React.FC<WiadomoscProps> = ({
  nadawca, children, nazwa, awatar, czas, akcje, koszt, pisze, className,
}) => {
  const odUzytkownika = nadawca === 'uzytkownik';
  const systemowa = nadawca === 'system';

  /*
    WIADOMOŚĆ SYSTEMOWA NIE JEST DYMKIEM.
    „Zmieniono model", „kontekst podsumowany", „zwrócono 7 Byte" — to nie są
    wypowiedzi w rozmowie, tylko adnotacje o niej. Dymek sugerowałby, że ktoś
    to powiedział. Dlatego jest to wyśrodkowana linijka, wizualnie słabsza od
    obu stron dialogu.
  */
  if (systemowa) {
    return (
      <div className={cn('flex justify-center py-1', className)} role="status">
        <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] text-muted-foreground">
          {children}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex w-full gap-2.5',
        odUzytkownika ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
    >
      {/* Awatar tylko przy AI. Przy wiadomości użytkownika strona ekranu
          i tak mówi, kto to napisał — drugi awatar byłby powtórzeniem, a zabiera
          40 px szerokości, których na telefonie po prostu nie ma. */}
      {!odUzytkownika && (
        <Awatar nazwa={nazwa || 'AI'} obraz={awatar} rozmiar="maly" wyrozniony className="mt-0.5" />
      )}

      <div className={cn('flex min-w-0 max-w-[85%] flex-col gap-1', odUzytkownika && 'items-end')}>
        {/* Nazwa modelu nad odpowiedzią — przy trzech modelach w jednej rozmowie
            bez tego nie wiadomo, który co powiedział. */}
        {!odUzytkownika && nazwa && (
          <span className="px-1 text-[11px] font-semibold text-muted-foreground">{nazwa}</span>
        )}

        <div
          className={cn(
            'w-fit min-w-0 rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed',
            /*
              DWIE STRONY, DWA MATERIAŁY — i to nie jest ozdoba.
              Wiadomość użytkownika jest DECYZJĄ: pełna powierzchnia w akcencie,
              nieprzezroczysta, zamknięta. Odpowiedź AI jest MATERIAŁEM, przez
              który widać stronę — szkło, bo to treść generowana, którą się czyta
              i ocenia, a nie coś, co zostało postanowione.
              Dzięki temu obie strony rozróżnia się kątem oka, bez czytania.
            */
            odUzytkownika
              ? 'rounded-br-md border border-primary/35 bg-primary/[0.14] text-card-foreground'
              : cn('rounded-bl-md border border-border text-card-foreground', SZKLO),
          )}
        >
          {children}

          {/* Kursor pisania — w tej samej linii co ostatnie słowo, nie pod nim.
              Trzy skaczące kropki pod tekstem czytają się jak osobny element;
              kursor przy tekście czyta się jak ciąg dalszy zdania. */}
          {pisze && (
            <span
              aria-label="Trwa pisanie"
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-baseline motion-reduce:animate-none"
            />
          )}
        </div>

        {/* Stopka: akcje, koszt, godzina. Ukryta do czasu najechania — w rozmowie
            liczy się treść, a nie obwoluta. Na dotyku pokazuje się zawsze, bo
            tam najechania nie ma i inaczej byłaby nieosiągalna. */}
        {(akcje || koszt || czas) && !pisze && (
          <div
            className={cn(
              'flex items-center gap-2 px-1 text-[11px] text-muted-foreground',
              'lg:opacity-0 lg:transition-opacity lg:duration-200 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100',
              odUzytkownika && 'flex-row-reverse',
            )}
          >
            {akcje}
            {koszt && <span className="tabular-nums">{koszt}</span>}
            {czas && <span className="tabular-nums">{czas}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/** Pojedyncza akcja pod wiadomością — kopiuj, powtórz, odczytaj. */
export const AkcjaWiadomosci: React.FC<{
  ikona: LucideIcon;
  etykieta: string;
  onClick?: () => void;
}> = ({ ikona: Ikona, etykieta, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={etykieta}
    title={etykieta}
    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Ikona className="h-3.5 w-3.5" />
  </button>
);

/* ── CZĘŚCI WEJŚCIA ───────────────────────────────────────────────────── */

/**
 * PASTYLKA TRYBU — Dokumenty, Obrazy, WEB, Canvas, Research.
 *
 * CO ZMIERZYŁEM W `chat/ChatInput.tsx` PRZED PRZENIESIENIEM (02.08.2026):
 *   • 5× ten sam, przepisany ręcznie blob klas — jedna zmiana wyglądu to pięć
 *     miejsc do poprawienia i pięć okazji, żeby jedno przeoczyć,
 *   • 33 użycia trzech kolorów WPISANYCH NA SZTYWNO: `hsl(24,95%,53%)`
 *     (pomarańcz), `hsl(var(--nb-studio-zdjec))` (fiolet), `hsl(195,80%,49%)` (cyjan).
 *     Nie ma ich w żadnym motywie, więc na Smoczym czy Jasnym siedzą obok
 *     akcentu jak wlepki z innego zestawu,
 *   • 14× `h-7`, czyli 28 px celu dotykowego — palec ma ok. 44 px.
 *
 * Tutaj: jeden komponent, kolor z motywu, cel dotykowy 36 px na telefonie.
 *
 * SZKŁO JEST ZAWSZE, NIE TYLKO PRZY WŁĄCZONYM.
 * W platformie `backdrop-blur-2xl` siedzi wyłącznie w gałęzi „aktywne", więc
 * materiał pastylki POJAWIA SIĘ przy kliknięciu i znika przy wyłączeniu.
 * Materiał nie jest stanem — stanem jest kolor. Szyba zostaje, zmienia się to,
 * co przez nią prześwituje.
 */
export const PastylkaTrybu: React.FC<{
  ikona: LucideIcon;
  children?: React.ReactNode;
  wlaczony?: boolean;
  zablokowany?: boolean;
  /** dlaczego zablokowany — bez tego użytkownik widzi tylko wyszarzenie */
  tytul?: string;
  onClick?: () => void;
}> = ({ ikona: Ikona, children, wlaczony, zablokowany, tytul, onClick }) => (
  <button
    type="button"
    onClick={zablokowany ? undefined : onClick}
    disabled={zablokowany}
    title={tytul}
    aria-pressed={wlaczony}
    className={cn(
      'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold sm:h-7 sm:px-2.5',
      'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      SZKLO,
      wlaczony
        ? 'border-primary/40 text-primary'
        : 'border-border text-muted-foreground hover:text-foreground',
      zablokowany && 'cursor-not-allowed opacity-40',
    )}
  >
    <Ikona className="h-3.5 w-3.5 shrink-0" />
    {children && <span className="whitespace-nowrap">{children}</span>}
  </button>
);

/**
 * USTAWIENIE MENU OTWIERANEGO Z WEJŚCIA CZATU.
 *
 * Wejście czatu z definicji stoi NA DOLE — pod nim jest już tylko krawędź
 * ekranu. Menu rozwijane w dół ląduje więc częściowo poza widokiem albo
 * przykrywa pasek narzędzi, z którego zostało otwarte.
 *
 * Dlaczego samo się nie odwraca: Radix odwraca stronę dopiero wtedy, gdy panel
 * nie mieści się w OKNIE. W bibliotece pastylka stała w połowie ekranu, więc
 * miejsce w dół było — i menu poszło w dół, mimo że logicznie należy do dołu
 * strony. Na produkcji, przy czacie na pełną wysokość, zachowałoby się dobrze
 * i błąd wyszedłby dopiero u użytkownika z niższym oknem.
 *
 * Dlatego kierunek jest tu ZADEKLAROWANY, a nie zostawiony wykrywaniu kolizji:
 * wynika z układu, a nie z tego, ile akurat zostało miejsca.
 *
 * Użycie: <ListaTresc {...MENU_NAD_WEJSCIEM}> …pozycje… </ListaTresc>
 */
export const MENU_NAD_WEJSCIEM = {
  side: 'top',
  align: 'start',
  sideOffset: 10,
} as const;

/**
 * WYZWALACZ WYBORU MODELU — nazwa, koszt, strzałka.
 *
 * TO JEST `ListaPrzycisk`, A NIE WŁASNY GUZIK.
 *
 * Pierwsza wersja była zwykłym `<button>` z `onClick` i wyglądała identycznie —
 * ale się nie rozwijała, bo nie miała czego rozwinąć. Michał wyłapał to od razu:
 * „ten przycisk z modelami się nie rozwija jak nasz komponent co tworzyliśmy
 * pod modele".
 *
 * Gdyby zostało po staremu, każde miejsce z mini-czatem musiałoby dorobić własne
 * rozwijanie — czyli dokładnie ten rozjazd, który ten plik likwiduje. Tutaj
 * pastylka JEST wyzwalaczem globalnej listy, więc lista modeli w czacie, w Studiu
 * Zdjęć i w Studiu Wideo to z definicji ten sam komponent, z tymi samymi
 * szczegółami modelu po najechaniu.
 *
 * Użycie:
 *   <ListaWyboru>
 *     <PastylkaModelu ikona={Rocket} nazwa="Grok 4.3" koszt="⟠ 2" />
 *     <ListaTresc> …pozycje… </ListaTresc>
 *   </ListaWyboru>
 */
export const PastylkaModelu: React.FC<{
  ikona?: LucideIcon;
  nazwa: string;
  koszt?: React.ReactNode;
}> = ({ ikona: Ikona, nazwa, koszt }) => (
  /*
    IKONA I KOSZT IDĄ PROPSAMI, NIE JAKO `children` — i to nie jest kwestia gustu.

    Pierwsza wersja wpychała ikonę, nazwę, koszt i strzałkę razem jako `children`.
    `ListaPrzycisk` renderuje jednak WŁASNĄ ikonę, własne `poPrawej` i własną
    strzałkę, a `children` wkłada do `<span class="min-w-0 flex-1 truncate">`.
    Wszystko wpadło więc do jednego, obcinanego pola — rakieta wyszła nad
    pastylkę, a strzałka pod nią, i dodatkowo strzałki były dwie.

    Nauka: kiedy komponent ma własne gniazda, trzeba ich użyć. Podanie tego
    samego przez `children` nie zastępuje gniazda, tylko dokłada się do niego.
  */
  <ListaPrzycisk
    ikona={Ikona}
    poPrawej={koszt}
    className={cn(
      // Pigułka zamiast prostokąta i własne szkło — poza tym to ten sam przycisk
      // co przy każdej innej liście w platformie, z tym samym zachowaniem.
      'h-9 w-auto gap-1.5 rounded-full border-0 bg-transparent px-3 text-[12px] font-semibold sm:h-8',
      SZKLO,
    )}
  >
    {nazwa}
  </ListaPrzycisk>
);

/**
 * PODGLĄD ZUŻYCIA KONTEKSTU — „0 TOK".
 *
 * Też `ListaWyboru`, z tego samego powodu co wyżej: to jest panel z danymi
 * otwierany z pastylki, czyli dokładnie to, co ten komponent robi. Własne
 * okienko byłoby drugą implementacją tego samego.
 *
 * Po co to w ogóle: liczba tokenów bez rozbicia nic nie mówi. Człowiek chce
 * wiedzieć, CO zjadło kontekst — historia, załączniki czy instrukcja systemowa —
 * bo tylko to pozwala mu coś z tym zrobić.
 */
export const PastylkaTokenow: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <ListaPrzycisk
    ikona={Layers}
    className={cn(
      'h-9 w-auto gap-1.5 rounded-full border-0 bg-transparent px-3 text-[11px] font-semibold tabular-nums sm:h-8',
      SZKLO,
    )}
  >
    {children}
  </ListaPrzycisk>
);

/**
 * OKRĄGŁY PRZYCISK NARZĘDZIA — spinacz, mikrofon, rozmowa.
 *
 * 40 px na telefonie zamiast platformowych 28. Te ikony leżą tuż nad krawędzią
 * ekranu, gdzie kciuk jest najmniej dokładny — to najgorsze możliwe miejsce
 * na najmniejszy cel w całym interfejsie.
 */
export const PrzyciskNarzedzia: React.FC<{
  ikona: LucideIcon;
  etykieta: string;
  wlaczony?: boolean;
  onClick?: () => void;
}> = ({ ikona: Ikona, etykieta, wlaczony, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={etykieta}
    aria-pressed={wlaczony}
    title={etykieta}
    className={cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:h-9 sm:w-9',
      'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      SZKLO,
      wlaczony
        ? 'border-primary/40 text-primary'
        : 'border-border text-muted-foreground hover:text-foreground',
    )}
  >
    <Ikona className="h-4 w-4" />
  </button>
);

/**
 * WYŚLIJ — jedyny przycisk w tym rzędzie z pełną powierzchnią.
 *
 * Cena stoi NA przycisku, a nie obok. Człowiek ma zobaczyć, ile go to kosztuje,
 * w tym samym miejscu, w które celuje — a nie dowiedzieć się po fakcie z historii.
 *
 * 28.09.2026: wygląd 1:1 z przyciskiem Chat AI (`ChatSendButton`: pigułka,
 * ikona w akcencie, „· od 3 ⟠" na przycisku) i kontrakt dla studiów — Michał:
 * „przyciski wysyłania … trzymaj w stylu chat ai i byte koszt też na nim
 * pokazuj". Etykieta i ikona są parametrem („Generuj film", „Ożyw postać"),
 * `pracuje` daje kręciołek, `przedrostekKosztu` mówi, że cena nie jest pewna.
 */
export const PrzyciskWyslij: React.FC<{
  /** Liczba Byte — przycisk sam dopisze „·" i „⟠". */
  koszt?: number | null;
  /** „od" / „do" / „ok." — gdy cena przed wysłaniem nie jest ostateczna. */
  przedrostekKosztu?: string;
  zablokowany?: boolean;
  onClick?: () => void;
  etykieta?: string;
  ikona?: LucideIcon;
  pracuje?: boolean;
  tekstPracy?: string;
  title?: string;
}> = ({
  koszt, przedrostekKosztu, zablokowany, onClick, etykieta = 'Wyślij', ikona: Ikona = Send,
  pracuje = false, tekstPracy = 'Wysyłam…', title,
}) => {
  const zKosztem = typeof koszt === 'number' && koszt > 0 && !pracuje;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={zablokowany || pracuje}
      title={title}
      aria-label={zKosztem ? `${etykieta} · ${przedrostekKosztu ? `${przedrostekKosztu} ` : ''}${koszt} ⟠` : etykieta}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm sm:h-9',
        'border-primary/30 bg-primary/10 text-foreground transition-colors duration-200 hover:bg-primary/15',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        SZKLO,
      )}
    >
      {pracuje
        ? <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-hidden />
        : <Ikona className="h-4 w-4 shrink-0 text-primary" />}
      <span className="font-medium">{pracuje ? tekstPracy : etykieta}</span>
      {zKosztem && (
        <span className="flex items-center gap-0.5 text-xs font-semibold tabular-nums text-primary">
          <span>·</span>
          {przedrostekKosztu && <span className="font-normal opacity-70">{przedrostekKosztu}</span>}
          <span>{koszt}</span>
          <span>⟠</span>
        </span>
      )}
    </button>
  );
};

/* ── WEJŚCIE CZATU ────────────────────────────────────────────────────── */

export interface WejscieCzatuProps {
  wartosc: string;
  onZmiana: (v: string) => void;
  onWyslij: () => void;
  placeholder?: string;
  /** narzędzia po lewej pod polem: załącznik, mikrofon, tryb */
  narzedzia?: React.ReactNode;
  /** po prawej pod polem: koszt, przycisk wyślij */
  akcje?: React.ReactNode;
  /** nad polem: załączone pliki, cytowana wiadomość */
  nadPolem?: React.ReactNode;
  /** górny rząd: wybór modelu po lewej, przełączniki trybów po prawej */
  naglowek?: React.ReactNode;
  /** przełączniki trybów — idą do prawej strony górnego rzędu */
  tryby?: React.ReactNode;
  zablokowane?: boolean;
  className?: string;
}

/**
 * PASTYLKA WEJŚCIA — pole rośnie z treścią, narzędzia siedzą pod spodem.
 *
 * Układ jest podyktowany jedną rzeczą: pisanie ma być najważniejsze. Narzędzia
 * pod polem, a nie obok niego, dają tekstowi pełną szerokość i nie zmuszają
 * do celowania w ikony wielkości znaczka pocztowego na telefonie.
 *
 * Wysokość rośnie do sześciu wierszy, potem pole zaczyna się przewijać.
 * Bez ograniczenia długi prompt wypycha rozmowę poza ekran i człowiek traci
 * z oczu to, na co odpowiada.
 */
export const WejscieCzatu: React.FC<WejscieCzatuProps> = ({
  wartosc, onZmiana, onWyslij, placeholder = 'Napisz wiadomość…',
  narzedzia, akcje, nadPolem, naglowek, tryby, zablokowane, className,
}) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Wysokość liczona z rzeczywistej zawartości, nie z liczby znaków —
  // zawijanie zależy od szerokości pola i czcionki, więc każde liczenie
  // „na oko" rozjeżdża się przy pierwszym dłuższym słowie.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [wartosc]);

  const naKlawisz = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter wysyła, Shift+Enter łamie wiersz — odwrotnie niż w formularzu,
    // bo w rozmowie wysyłanie jest czynnością częstszą niż akapit.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (wartosc.trim() && !zablokowane) onWyslij();
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-2',
        SZKLO,
        /*
          BEZ `nb-pole` — CELOWO.

          Było tu, bo pastylka wygląda jak pole. Ale `nb-pole` rysuje krawędź
          fokusu, a fokus w tej pastylce dostaje TEXTAREA W ŚRODKU. Efekt:
          kliknięcie w tekst podświetlało obwódkę całej pastylki razem z rzędem
          narzędzi i wyborem modelu — czyli sygnał „tu piszesz" obejmował
          elementy, w których się nie pisze.

          Pastylka jest POWIERZCHNIĄ, nie kontrolką. Kursor w polu tekstowym
          wystarczy za informację, gdzie trafi klawiatura.
        */
        zablokowane && 'opacity-60',
        className,
      )}
    >
      {nadPolem && <div className="mb-2 px-1">{nadPolem}</div>}

      {/*
        GÓRNY RZĄD: model po lewej, tryby po prawej.
        Podział jest celowy — po lewej stoi to, CZYM piszemy (jeden wybór,
        rzadko zmieniany), po prawej to, JAK ma odpowiedzieć (kilka
        przełączników, zmienianych z wiadomości na wiadomość).
        `flex-wrap` bez ukrywania czegokolwiek: platforma chowa etykiety
        pastylek na telefonie i zostają trzy nierozróżnialne ikonki.
        Tutaj rząd się zawija i etykiety zostają.
      */}
      {(naglowek || tryby) && (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 px-1">
          {naglowek}
          {tryby && <div className="ml-auto flex flex-wrap items-center gap-1.5">{tryby}</div>}
        </div>
      )}

      <textarea
        ref={ref}
        value={wartosc}
        onChange={(e) => onZmiana(e.target.value)}
        onKeyDown={naKlawisz}
        placeholder={placeholder}
        disabled={zablokowane}
        rows={1}
        className="block max-h-[168px] w-full resize-none bg-transparent px-2 py-1.5 text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />

      {(narzedzia || akcje) && (
        <div
          className={cn(
            'mt-1.5 flex flex-wrap items-center gap-1.5 px-1 pt-2',
            // Kreska rozdzielająca pisanie od sterowania. Ledwie widoczna —
            // ma OGRANICZAĆ pole tekstu, a nie dzielić pastylkę na dwie części.
            'border-t border-border/50',
          )}
        >
          {narzedzia}
          {akcje && <div className="ml-auto flex items-center gap-1.5">{akcje}</div>}
        </div>
      )}
    </div>
  );
};
