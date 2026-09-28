import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { Tile, TileAction } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { AktywnoscWykres } from '@/components/dashboard/AktywnoscWykres';
import { AreaChart, Area, ChartTooltip, ZMIENNE_WYKRESU } from '@/components/ui/area-chart';
import { useWallet } from '@/hooks/useWallet';
import { useByteBurn, OKNA_DNI, type OknoDni } from '@/hooks/useByteBurn';

/**
 * Pasek stanu Byte — pierwsza rzecz na Panelu Głównym.
 *
 * Po co: Byte to waluta platformy, wszystko za nią chodzi, a Panel Główny
 * dotąd nie pokazywał ani salda, ani tempa wypalania. Jedyne wzmianki o Byte
 * w `Dashboard.tsx` to okno płatności i toast po doładowaniu.
 *
 * Zasady, których ten komponent się trzyma:
 *  • Wyłącznie tokeny motywu (karta, obwódka, primary, destructive, muted).
 *    Zero `bg-black`, `text-white`, `border-white` i `glass-effect`, czyli zero
 *    zależności od warstwy łatek `!important` dla jasnych motywów w index.css.
 *  • Prognoza pokazuje się TYLKO gdy da się ją policzyć. Brak zużycia = brak
 *    prognozy, nie „∞ dni". Patrz `useByteBurn` — tam jest opisane, dlaczego
 *    liczymy po znaku kwoty i co wykluczamy.
 *  • Wykres rysuje prawdziwy przebieg salda z 7 dni, nie ozdobną falę.
 */

interface ByteStatusBarProps {
  userId: string | undefined;
  userName: string;
  avatarUrl?: string | null;
  platformVersion?: string | null;
  onPokazWersje?: () => void;
}

/** Poniżej tylu dni pasek przechodzi w stan ostrzegawczy. */
const PROG_OSTRZEZENIA_DNI = 5;

/**
 * Cele przycisków. Wcześniej „Doładuj" prowadziło na `/sklep` — a tam są
 * Pakiety Wiedzy, Dekoracje, Tła, Wzory i Motywy. Byte tam NIE MA w ogóle,
 * więc przycisk odsyłał po pieniądze do sklepu z ramkami.
 * Paczki Byte i historia konsumpcji siedzą na `/plan` (zakładki `bytes`
 * i `portfel` z `pages/Plan.tsx`).
 */
const DOLADUJ = '/plan?tab=bytes';
const WYDATKI = '/plan?tab=portfel';

export const ByteStatusBar: React.FC<ByteStatusBarProps> = ({
  userId, platformVersion, onPokazWersje,
}) => {
  const navigate = useNavigate();
  const { balance, loading } = useWallet();
  /* Okno wykresu wybiera użytkownik (Michał: „fajnie, aby pokazywało ostatnie
     7/30/90 dni z przyciskiem zmiany"). Stan siedzi TUTAJ, a nie w haku, bo
     to decyzja widoku — hak ma tylko policzyć to, o co go poproszono. */
  const [okno, setOkno] = useState<OknoDni>(7);
  const { burn, seria } = useByteBurn(userId, balance, okno);

  const alarm = burn.maPrognoze && burn.dniDoKonca !== null && burn.dniDoKonca <= PROG_OSTRZEZENIA_DNI;

  /* WYKRES NA KOMPONENCIE BIBLIOTEKI (07.09.2026). Michał: „po najechaniu
     nie ma animacji jak w panelu Zarządu". Zarząd rysuje `AreaChart`
     z `ChartTooltip` (krzyżyk, kropka, dymek z datą i wartością), a tu stał
     ręczny SVG z samym pogrubieniem linii na hover. Teraz TEN SAM komponent
     i ten sam dymek — oś X to prawdziwe daty (dziś na końcu), więc nagłówek
     dymka mówi „4 wrz”, a wiersz „Saldo · 1 942 ⟠”. */
  const daneWykresu = useMemo(() => {
    if (!seria || seria.length < 2) return null;
    const dzis = new Date(); dzis.setHours(12, 0, 0, 0);
    return seria.map((saldo, i) => ({
      x: new Date(dzis.getTime() - (seria.length - 1 - i) * 86_400_000),
      saldo,
    }));
  }, [seria]);
  const kolorLinii = alarm ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';

  /* Prognoza jednym zdaniem, nie trzema skrótami. Wcześniej stało tu
     „−19 ⟠/dzień · na ~110 dni (z 3 dni)" w foncie maszynowym 9,5 px —
     trzy liczby sklejone kropkami, do rozszyfrowania, nie do przeczytania. */
  const prognoza = burn.maPrognoze
    ? `Wystarczy na ~${burn.dniDoKonca} ${odmienDni(burn.dniDoKonca!)}`
      + ` przy ${burn.naDzien} ⟠ dziennie`
      + (burn.dniDanych < 3 ? ` (z ${burn.dniDanych} ${odmienDni(burn.dniDanych)} danych)` : '')
    : `Brak zużycia w ostatnich ${okno} dniach`;

  return (
    /* PASEK, NIE KARTA Z NAGŁÓWKIEM.
       Pierwsza wersja tej przebudowy dostała `TileHeader` jak każdy inny
       kafelek — i to był formalizm. Zmierzone: nagłówek podniósł pasek ze 114
       na 196 px, a po ścięciu marginesów wciąż na 164. Przy 1280×800 (próg
       trybu jednego ekranu) kolumny spadały wtedy do 356 px i skrzynka spraw
       pokazywała JEDNĄ pozycję z trzech.

       Spójność z platformą nie polega na tym, że wszystko ma nagłówek —
       tylko na typografii, plakietkach, przyciskach i materiale. Te zostają,
       a pasek zostaje paskiem: wszystko w jednym rzędzie. */
    <Tile intencja={alarm ? 'krytyczna' : 'akcent'} elewacja="wyzej" zwarty>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">

        {/* AKTYWNOŚĆ — wchodzi na miejsce dawnego powitania (Michał: „zamiast
            «Witaj, Michał» i «Wystarczy na…» daj tu wykres aktywności").
            Wariant „pasek" NIE niesie własnej szyby — `ByteStatusBar` już nią
            jest, a szyba w szybie gasi refrakcję (strażnik zagnieżdżenia).
            Powitanie zniknęło świadomie: imię stoi w menu konta u dołu paska
            bocznego, a wersję przejął przycisk przy akcjach. */}
        <div className="min-w-0 flex-1 md:max-w-[500px]">
          <AktywnoscWykres wariant="pasek" />
        </div>

        <span className="hidden w-px self-stretch bg-border md:block" aria-hidden />

        {/* SALDO — jedyna liczba, która ma tu prawo być duża. */}
        {/* TELEFON ZWARTY (26.09.2026, Artur: „można pomniejszyć, nie ma sensu,
            by to było aż tak duże"). Na telefonie liczba, wersja i przełącznik
            okna stoją w JEDNYM wierszu — wcześniej trzy osobne wiersze plus
            pusty pas wykresu. Od `sm` układ jak był. */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:block">
          {/* Bez etykiety „Saldo Byte" (Michał 08.09: „zapychacze wywal") —
              duża liczba ze znakiem ⟠ mówi to sama. */}
          <p
            className={`mt-0.5 text-[2rem] font-semibold leading-none tabular-nums ${
              alarm ? 'text-destructive' : 'text-card-foreground'
            }`}
          >
            {loading ? '—' : balance.toLocaleString('pl-PL')}
            <span className={`ml-1.5 text-[1.25rem] ${alarm ? '' : 'text-primary'}`}>⟠</span>
          </p>
          {/* WERSJA pod saldem (Michał, strzałką: „daj tu pod to"). Zeszła
              z powitania; kliknięcie otwiera informacje o wydaniu. */}
          {platformVersion && (
            <button
              type="button"
              onClick={onPokazWersje}
              aria-label={`Wersja platformy ${platformVersion} — pokaż informacje o wydaniu`}
              className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-2"
            >
              <Plakietka intencja="akcent">{platformVersion}</Plakietka>
            </button>
          )}
          {daneWykresu && (
            <span className="ml-auto sm:hidden">
              <PrzelacznikOkna wartosc={okno} naZmiane={setOkno} />
            </span>
          )}
        </div>

        {/* WYKRES — przebieg salda, nie ozdoba. */}
        <div className="min-w-0 flex-1">
          {daneWykresu ? (
            <>
              {/* `preserveAspectRatio="none"` rozciąga viewBox niejednorodnie, więc
                  bez `vectorEffect` grubość linii zmieniałaby się z szerokością
                  ekranu — na telefonie kreska byłaby wizualnie cieńsza niż na
                  desktopie. `non-scaling-stroke` trzyma 2 px wszędzie. */}
              {/* WYKRES REAGUJE NA KURSOR (Michał: „nie ma animacji wykresu
                  po najechaniu"). Wszystko idzie przez `group-hover` i przejścia
                  CSS, bez stanu Reacta — dzięki temu nie ma ani jednego
                  przerenderowania na ruch myszy.
                  `preserveAspectRatio="none"` rozciąga viewBox niejednorodnie,
                  więc bez `vectorEffect` grubość linii zmieniałaby się z
                  szerokością ekranu. `non-scaling-stroke` trzyma ją wszędzie. */}
              {/* TELEFON: przełącznik NAD wykresem, przy prawej — wiąże się
                  wizualnie z wykresem, którym steruje, zamiast wisieć 12 px nad
                  przyciskiem Wydatki (zgłoszenie Michała: przełącznik latał nad
                  przyciskami). Od `sm` zostaje w rzędzie osi — pomiar z 30.07
                  pilnuje tam wysokości paska (114 px w trybie jednego ekranu). */}
              <div
                className="h-7 w-full cursor-crosshair sm:h-11"
                style={{ ...ZMIENNE_WYKRESU, '--chart-line-primary': kolorLinii } as React.CSSProperties}
              >
                <AreaChart
                  data={daneWykresu}
                  xDataKey="x"
                  aspectRatio="10 / 1"
                  margin={{ top: 4, right: 4, bottom: 2, left: 4 }}
                  formatDateLabel={(d) => {
                    const dzis = new Date();
                    return d.toDateString() === dzis.toDateString()
                      ? 'dziś'
                      : d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
                  }}
                  className="h-full w-full"
                >
                  <Area dataKey="saldo" fillOpacity={0.28} gradientToOpacity={0} />
                  <ChartTooltip
                    rows={(punkt) => [{
                      color: kolorLinii,
                      label: 'Saldo',
                      value: `${((punkt.saldo as number) ?? 0).toLocaleString('pl-PL')} ⟠`,
                    }]}
                  />
                </AreaChart>
              </div>
              {/* Oś czasu liczona z OKNA, nie z zaszytych „6" i „3" — inaczej
                  po przełączeniu na 90 dni wykres pokazywałby kwartał, a podpis
                  pod nim dalej twierdził, że to ostatni tydzień. */}
              {/* Daty ROZPROWADZONE na szerokość wykresu, nie sklejone przy
                  lewej krawędzi: dziś ma stać pod prawym końcem linii, którą
                  opisuje (zgłoszenie Michała: osie nie zgadzały się z geometrią). */}
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="flex flex-1 items-center justify-between tabular-nums">
                  <span>{etykietaDnia(okno - 1)}</span>
                  <span className="hidden sm:inline">{etykietaDnia(Math.floor((okno - 1) / 2))}</span>
                  <span>dziś</span>
                </span>
                <span className="hidden sm:flex">
                  <PrzelacznikOkna wartosc={okno} naZmiane={setOkno} />
                </span>
              </div>
              {/* PROGNOZA POD WYKRESEM (Michał: „tekst na ile Byte wystarczy pod
                  wykres"). Stała wcześniej przy powitaniu; tu opisuje dokładnie
                  tę linię, nad którą siedzi — ile jeszcze przy obecnym tempie. */}
              <p className={`mt-1 line-clamp-2 text-[12px] leading-snug ${alarm ? 'text-destructive' : 'text-muted-foreground'}`}>
                {prognoza}
              </p>
            </>
          ) : (
            <div className="flex h-7 items-center text-[13px] text-muted-foreground sm:h-11">
              Za mało danych na wykres
            </div>
          )}
        </div>

        {/* AKCJE — jeden wariant, nie dwa. Wcześniej „Doładuj" nosił wariant
            szklany, a „Wydatki" obwódkowy: dwa różne materiały obok siebie
            w odległości 8 px. Teraz oba są `TileAction`, a pierwszeństwo niesie
            intencja („główna" vs „wtórna"), czyli to samo, czym platforma
            odróżnia akcje wszędzie indziej. */}
        {/* Michał: „te przyciski daj jeden pod drugim, to da więcej miejsca
            na wykres". Na telefonie zostają obok siebie (pełna szerokość
            dzielona na pół czyta się tam lepiej niż dwa pasy jeden na drugim),
            od `sm` schodzą w kolumnę i oddają wykresowi ~150 px. */}
        {/* SIATKA, NIE FLEX (06.08.2026) — dwie osobne przyczyny rozjazdu,
            obie zmierzone na 375 px.

            ① SZEROKOŚĆ: mimo `flex-1` i `min-w-0` na obu przyciski wychodziły
               138 px (Doładuj) vs 164 px (Wydatki). `grid-cols-2` równa kolumny
               z definicji, bez zależności od treści.

            ② WYSOKOŚĆ: Wydatki to `<button>`, więc łapie globalną regułę
               dostępności z index.css — przy wskaźniku zgrubnym każdy przycisk
               dostaje `min-height: 44px`. Doładuj to szklany `<div>` i tej
               reguły NIE łapał, stąd 44 px obok 36 px. Wrapper dostaje `h-11`,
               czyli ten sam próg dotykowy; od `sm` oba wracają do 36 px. */}
        {/* ══════════════════════════════════════════════════════════════════
             KONIEC WYJĄTKU `LiquidGlass` (06.08.2026)
            ══════════════════════════════════════════════════════════════════

            Michał, ze zrzutem z telefonu: „czemu ten przycisk jest turbodziwny?".

            Zmierzone: opakowanie `<span>` miało 151×44, a szklana pastylka
            w środku 144×29 i wisiała 7 px od góry. Czyli mały czarny guzik
            pływający w większym, niewidocznym pudełku — obok „Wydatki", które
            swoje 44 px wypełniało w całości. To była ta „ramka".

            Przyczyna: `LiquidGlass` dostawał `width: 100%`, ale NIGDY wysokości
            — jego wysokość brała się z `padding="8px 16px"` plus tekst 13 px,
            czyli ~29 px. Wrapper miał `h-11` (44 px), bo tyle wynosi próg
            dotykowy. Dwie liczby, które nigdy się nie spotkały.

            Nie podpieram tego trzeci raz. Komponent stał tu z powodu, który sam
            komentarz nazywał: „żeby dało się porównać 1:1 z naszym TileAction
            stojącym obok". Porównanie się odbyło i widać jego wynik na zrzucie.
            `LiquidGlass` jest pomyślany do NAKŁADANIA NA TŁO (sam ustawia sobie
            `translate(-50%,-50%)`), a nie do stania w układzie — każda kolejna
            łatka była walką z tym założeniem.

            `TileAction rodzaj="glowna"` TO JEST szkło — `AKCJA.glowna` mapuje
            się na `RDZEN_STYL_1`, czyli STYL 1 platformy. Do tego jest to
            `<button>`, więc łapie globalną regułę dostępności z index.css
            (`min-height: 44px` przy wskaźniku zgrubnym) dokładnie tak samo jak
            „Wydatki" — i wysokości przestają się rozjeżdżać z definicji,
            a nie przez dobieranie klas.

            Przy alarmie zostaje `usun`: „kończą Ci się środki" ma być czerwone
            i twarde, a nie ładne.
        */}
        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col">
          <TileAction
            rodzaj={alarm ? 'usun' : 'glowna'}
            ikona={Plus}
            onClick={() => navigate(DOLADUJ)}
            className="h-11 w-full justify-center sm:h-9 sm:w-[128px]"
          >
            Doładuj
          </TileAction>
          {/* `flex-1` zeszło: w `grid-cols-2` nie robi nic (to własność flexa),
              a `h-9` przegrywało na telefonie z regułą 44 px i dawało trzecią
              wartość wysokości. Oba przyciski mają teraz ten sam zapis. */}
          <TileAction
            rodzaj="wtorna"
            ikona={Receipt}
            onClick={() => navigate(WYDATKI)}
            className="h-11 w-full justify-center sm:h-9 sm:w-[128px]"
          >
            Wydatki
          </TileAction>
        </div>
      </div>
    </Tile>
  );
};

/** „dzień / dni" — bez tego prognoza mówiłaby „na około 1 dni". */
function odmienDni(ile: number): string {
  return ile === 1 ? 'dzień' : 'dni';
}

/**
 * Wybór okna: 7 / 30 / 90 dni.
 *
 * Trzy przyciski zamiast listy rozwijanej, bo opcje są trzy i mieszczą się
 * w jednej linii — rozwijana lista kosztowałaby kliknięcie na to samo, a przy
 * okazji ukryłaby przed użytkownikiem, że taki wybór w ogóle istnieje.
 */
const PrzelacznikOkna: React.FC<{ wartosc: OknoDni; naZmiane: (v: OknoDni) => void }> = ({
  wartosc, naZmiane,
}) => (
  <span className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Zakres wykresu">
    {OKNA_DNI.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => naZmiane(o)}
        aria-pressed={wartosc === o}
        /* Bez reguły 44 px — trzy przyciski po 44 px rozpychały wiersz na telefonie. */
        data-tap-target="off"
        className={`rounded-md px-2 py-1 text-[10px] tabular-nums transition-colors ${
          wartosc === o
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:text-card-foreground'
        }`}
      >
        {o}d
      </button>
    ))}
  </span>
);

/** Etykieta dnia sprzed `ile` dni, w formacie dd.MM. */
function etykietaDnia(ile: number): string {
  const d = new Date(Date.now() - ile * 86_400_000);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

export default ByteStatusBar;
