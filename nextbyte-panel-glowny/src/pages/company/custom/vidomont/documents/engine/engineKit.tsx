import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Status } from '@/components/ui/status';
import { relativeLuminance } from '@/utils/vidomont/engine/colorMath';

// ─────────────────────────────────────────────────────────────────────────────
// JĘZYK WIZUALNY — odwzorowanie Studia Zdjęć.
//
// Studio ma DWA języki powierzchni na jednym ekranie. Oba zmierzone 12.08.2026:
//
//   zakładka „Studio"          karta: ramka rgba(51,51,51,.3) · tło rgba(23,23,23,.3) · BEZ gradientu
//   zakładka „Character Swap"  karta: ramka rgba(akcent,.2)   · tło linear-gradient(135deg, akcent 8% → 2%)
//
// Pierwotna wersja tego pliku zmierzyła zakładkę „Studio" i opisała ją poprawnie
// („powierzchnie przezroczyste, kolor tylko na stanie aktywnym"). Błędem było uogólnienie:
// zasada z jednej zakładki stała się zasadą całego kitu, przez co ekrany zbudowane na kicie
// wychodzą SZARE obok kolorowego Character Swapa. Kit bierze teraz język bogatszy —
// ten z podbarwionymi powierzchniami — bo to on wygrywa porównanie na oko.
//
// Reszta zmierzona na Character Swapie:
//   atmosfera    DWIE kule 384×384 (w-96 h-96) blur(64px) w pełnym akcencie:
//                  -top-24 -right-24  oraz  top-1/2 -left-24
//                + siatka 50×50 px z linii 1px w kolorze akcentu, opacity .04, inset-0
//   nagłówek sekcji  rgb(245,245,245) · 14px · 700 · letter-spacing .7px   (NIE szary 10px)
//   etykieta kroku   pełny akcent · 12px · 700
//   kafel ikony  48×48 · radius 12px · gradient akcent 20% → 5%
//   tytuł strony 24px / 700
//   pigułka aktywna  tło przezroczyste · 1px solid #333 · radius 16px · BEZ poświaty · 14px
//
// Promień kart: 16px w OBU zakładkach. Kompozytor ma 28px — to wyjątek dla paska, nie karty.
// ─────────────────────────────────────────────────────────────────────────────

/* ═══════════════════════════════════════════════════════════════════════════
   POWIERZCHNIE I PIGUŁKI — KANON GENERATORA.

   ⚠️ PO CO. Zmierzone 28.08.2026 w 32 plikach generatora: powierzchnia karty istniała
   w TRZYNASTU wariantach, pigułka w SZEŚCIU. Różnice to 0,005 krycia tła albo jeden
   stopień zaokrąglenia — pojedynczo niewidoczne, razem dające wrażenie, że każdy ekran
   robił kto inny. Właściciel: „całkowicie styl oderwany od strony… zrównaj wszystko".

   ⚠️ TO NIE JEST NOWY SYSTEM, tylko spisanie tego, który już wygrał liczebnie: kanonem
   został wariant najczęstszy (19 wystąpień), a nie wymyślony od nowa. Dzięki temu zmiana
   niczego nie przemalowała — wyrównała.

   Używaj ich w nowym kodzie zamiast wpisywać klasy z palca. Powierzchnia zagnieżdżona
   (POW_LEKKA) idzie WEWNĄTRZ głównej; drobna (POW_MALA) to pola i wiersze list.
   ═══════════════════════════════════════════════════════════════════════════ */
export const POW = 'rounded-2xl border border-white/[0.07] bg-white/[0.025]';
export const POW_LEKKA = 'rounded-xl border border-white/[0.07] bg-white/[0.02]';
export const POW_MALA = 'rounded-lg border border-white/[0.08] bg-white/[0.03]';

export const PIGULKA = 'rounded-full border border-white/[0.12] px-3.5 py-1.5 text-[12px] font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06]';
export const PIGULKA_MALA = 'rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition-colors hover:bg-white/[0.05]';
export const PIGULKA_IKONA = 'rounded-full border border-white/[0.10] p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.05]';

export const ACCENT = '#ab30e8';   // akcent Studia (hsl(280 80% 55%)) — zmierzony

// ─────────────────────────────────────────────────────────────────────────────
// AKCENT JAKO PARAMETR MODUŁU, nie stała kitu.
//
// Kit to GRAMATYKA (powierzchnie przezroczyste, granice włosowe, kolor tylko na stanie
// aktywnym). Kolor to SŁOWO — należy do modułu, nie do gramatyki. Baza Danych od dawna
// nadaje każdemu kafelkowi własną barwę tożsamości (DatabaseHub.tsx:~130-150); moduł
// otwarty z pomarańczowego kafelka ma być w środku pomarańczowy, inaczej klik gubi ciągłość.
//
// Trójka, nie jeden kolor: kit zaszywał TRZY fiolety — bazowy #ab30e8, jasny #d9a6f5 na
// ikonach i głęboki #7d1fb0 w gradiencie przycisku. Podmiana samego bazowego dałaby
// pomarańczowy przycisk z fioletową ikoną. Dlatego moduł deklaruje komplet.
//
// Wartości podawane wprost, bez liczenia w locie: odcień pochodny wyliczony raz i zapisany
// jest przewidywalny, a `color-mix` na gradiencie i tak nie zadziała w każdym silniku.
// ─────────────────────────────────────────────────────────────────────────────

export type KitAccent = {
  base: string;    // stan aktywny, ring, poświata
  light: string;   // ikony na ciemnym tle — musi być czytelny, nie sam odcień
  deep: string;    // drugi przystanek gradientu przycisku głównego
  /**
   * Mnożnik mocy tła (kule, siatka, podbarwienie kart). 1 = wartości zmierzone w Studiu.
   *
   * ⚠️ NIE jest to gałka „na oko". Krycie i jasność to dwie różne rzeczy: ta sama wartość
   * `opacity` daje inny efekt dla jasnej i ciemnej barwy. Zmierzone luminancje względne:
   * fiolet #ab30e8 = 0,166 · bursztyn #f19d27 = 0,430 — bursztyn jest 2,6× jaśniejszy.
   * Przy 1:1 kule bursztynu zalewały ekran, choć liczby zgadzały się ze Studiem.
   * Mnożnik = luminancja_Studia / luminancja_własna, czyli dla bursztynu 0,166/0,430 ≈ 0,4.
   *
   * Ten sam mechanizm co przy kontraście tekstu (documentEngine.css) — jasna barwa
   * wymaga innych liczb, żeby wyglądać tak samo mocno.
   *
   * OPCJONALNE świadomie: `KitAccent` jest typem współdzielonym (importuje go m.in.
   * `src/modules/nextcloud/kit.ts`), a pole wymagane zepsułoby każdego istniejącego
   * konsumenta w chwili dodania. Brak wartości = 1, czyli zachowanie sprzed tej zmiany.
   * Wyliczyć go warto zawsze, gdy akcent NIE jest fioletem Studia — patrz `mocAkcentu()`.
   */
  glow?: number;
};

/**
 * Podpowiedź mnożnika dla nowej barwy: `glow` ≈ luminancja fioletu Studia / luminancja własna.
 * Do policzenia RAZ przy dodawaniu akcentu i wpisania wprost — nie do wołania w renderze.
 *
 *   mocAkcentu('#f19d27')  → 0.39   (bursztyn Galerii)
 *   mocAkcentu('#18c5dc')  → 0.37   (cyjan)
 */
export const mocAkcentu = (hex: string): number => {
  // ⚠️ Luminancja z `colorMath` — jedna formuła na cały silnik. Trzy kopie tego szablonu dawały
  // różne odpowiedzi na szarościach (jedna pomijała linearyzację gamma).
  const luminancja = (h: string) => relativeLuminance(h) ?? 0;
  return Math.round((luminancja(ACCENT_STUDIO.base) / luminancja(hex)) * 100) / 100;
};

/** Krycie przeskalowane mocą akcentu, zwrócone jako dwucyfrowa alfa hex do doklejenia. */
const alfa = (a: KitAccent, krycie: number) =>
  Math.round(Math.min(1, Math.max(0, krycie * (a.glow ?? 1))) * 255).toString(16).padStart(2, '0');

/** Akcent Studia — domyślny dla Silnika Dokumentów i wszystkiego, co nie deklaruje własnego. */
export const ACCENT_STUDIO: KitAccent = { base: '#ab30e8', light: '#d9a6f5', deep: '#7d1fb0', glow: 1 };

/**
 * Szafir — Galeria Realizacji. Te same wartości, co gradient kafelka w Bazie Danych.
 *
 * Dobór po LUMINANCJI, nie po odcieniu. Wcześniej był tu bursztyn hsl(35 88% 55%) i GUBIŁ SIĘ:
 * luminancja 0,430 przy 0,166 fioletu Studia, czyli 2,6× jaśniejszy. Żeby nie zalewał ekranu,
 * musiał chodzić na `glow` 0,39 — a ściszony kolor to kolor, którego nie widać.
 *
 * Jasna barwa przy 8% krycia na czerni nie daje łuny, tylko brudną mgłę. Łuna bierze się
 * z barwy CIEMNEJ i nasyconej, która może leżeć pełną siłą — dlatego fiolet Studia świeci.
 * Szafir hsl(207 100% 40%) ma luminancję 0,159, czyli `glow` 1,04 — moc Studia.
 *
 * Odcień 207°, nie 215°, z powodu ROZRÓŻNIALNOŚCI KAFELKÓW, nie estetyki. Przy 215° różnica
 * postrzegana (CIE76 dE) wobec kafelka „Podmioty" (hsl 220 75% 50%) wynosiła 5,8 — poniżej
 * progu 10, czyli dwa kafelki obok siebie czytały się jak ten sam kolor. Przy 207° dE rośnie
 * do 24,6. Sama odległość odcienia w stopniach tego nie pokazuje (5° vs 13°) — trzeba mierzyć
 * w przestrzeni percepcyjnej, bo oko nie widzi HSL. Instytucje (210°) i Bazę Grafik (188°)
 * ratuje odsycenie: dE odpowiednio 49,6 i 78,1 już przy poprzedniej wartości.
 *
 * Odcień wybrany przez właściciela (12.08.2026) spośród trzech kandydatów z tego samego
 * pasma jasności — miedź hsl(18 92% 42%) i rubin hsl(352 85% 45%) odrzucone.
 * Odrzucone NIE z powodu liczb (obie przechodziły), tylko charakteru: rubin niesie
 * semantykę alertu, miedź kolidowała z ciepłymi kafelkami Podmiotów i Bazy Montaży.
 */
export const ACCENT_SZAFIR: KitAccent = { base: '#0070cc', light: '#85ccff', deep: '#033b77', glow: 1.04 };

/** @deprecated Bursztyn gubił się na ciemnym tle (glow 0,39 — patrz wyżej). */
export const ACCENT_BURSZTYN: KitAccent = { base: '#f19d27', light: '#f9cb8b', deep: '#dc5a18', glow: 0.4 };

const KitAccentContext = React.createContext<KitAccent>(ACCENT_STUDIO);

/** Ustawia akcent dla poddrzewa. Bez niego wszystko zostaje przy fiolecie Studia. */
export const KitAccentProvider: React.FC<{ value: KitAccent; children: React.ReactNode }> = ({ value, children }) => (
  <KitAccentContext.Provider value={value}>{children}</KitAccentContext.Provider>
);

/** Akcent obowiązujący w tym miejscu drzewa. Używać zamiast importowania stałej ACCENT. */
export const useKitAccent = (): KitAccent => React.useContext(KitAccentContext);

/** Kafel ikony w nagłówku — jak w Studiu: zaokrąglony kwadrat z gradientem akcentu. */
export const HeaderTile: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => {
  const a = useKitAccent();
  return (
    <div className="grid h-12 w-12 flex-none place-items-center rounded-xl border"
      style={{
        background: `linear-gradient(135deg, ${a.base}33, ${a.base}0d)`,   // 20% -> 5%, jak w Studiu
        borderColor: `${a.base}${alfa(a, 0.20)}`,
      }}>
      <Icon className="h-5 w-5" style={{ color: a.light }} />
    </div>
  );
};

/** Pasek narzędzi — pigułki w przezroczystym kontenerze (szabloniec Studia). */
export const ToolBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-3xl border border-white/[0.07] bg-white/[0.015] p-2">
    {children}
  </div>
);

// `focus-visible:ring-*` zamiast `outline-none` bez zamiennika: wcześniej klasa gasiła obrys i nie
// dawała nic w zamian, więc nawigacja klawiaturą po zakładkach była niewidoczna (audyt, potwierdzone).
export const ToolPill: React.FC<{
  active?: boolean; onClick?: () => void; icon?: React.ElementType; children: React.ReactNode;
}> = ({ active, onClick, icon: Icon, children }) => {
  const a = useKitAccent();
  return (
    <button onClick={onClick} aria-pressed={!!active}
      className={`inline-flex items-center gap-2 text-[13.5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        active
          ? 'rounded-2xl border px-4 py-2.5 text-zinc-100'
          : 'rounded-full px-5 py-1.5 text-zinc-100/70 hover:text-zinc-100 hover:bg-white/[0.04]'}`}
      style={{
        // Studio: ramka #333, BEZ poświaty. Poprzednia wersja doklejała podwójny boxShadow
        // w kolorze akcentu — na ekranie wyglądało to jak podświetlony guzik, nie jak zakładka.
        ...(active ? { borderColor: '#333' } : {}),
        ['--tw-ring-color' as string]: a.base,
      }}>
      {Icon && <Icon className="h-4 w-4" style={active ? { color: a.light } : undefined} />}
      {children}
    </button>
  );
};

/**
 * Kompozytor przyklejony do dołu — miejsce, w którym ZAWSZE są twarde ustawienia i akcja główna.
 *
 * ⚠️ `ComposerSpacer` jest OBOWIĄZKOWY nad treścią przewijaną pod kompozytorem. Bez niego pasek
 * (jest półprzezroczysty) zasłania ostatnie ~100 px dokumentu — zmierzone: treść kończyła się na
 * 666 px, a pasek zaczynał na 269 px, czyli przykrywał wynik, nad którym użytkownik pracuje.
 */
export const Composer: React.FC<{ children: React.ReactNode; actions?: React.ReactNode }> = ({ children, actions }) => (
  // pr-[72px]: globalny przycisk asystenta (48 px + margines) siedzi w prawym dolnym rogu na
  // position:fixed i NACHODZIŁ na akcję główną o 23 px (zmierzone). Pasek kończy się przed nim.
  <div className="sticky bottom-4 z-20">
    <div className="mx-auto flex items-center gap-2 border border-white/[0.10] px-3 py-2"
      style={{ borderRadius: 28, background: 'rgba(23,23,23,.72)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 20px 60px -20px rgba(0,0,0,.85)' }}>
      {/* Ustawienia: przewijają się w poziomie, gdy jest ciasno… */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
      {/* …ale AKCJA GŁÓWNA nigdy nie wyjeżdża poza ekran. Złapane na wąskim oknie: „Wystaw dokument"
          znikał za prawą krawędzią, czyli jedyny przycisk, po który użytkownik tu przyszedł. */}
      {actions && <div className="flex flex-none items-center gap-2 pl-1">{actions}</div>}
    </div>
  </div>
);

/** Odstęp pod treścią, żeby kompozytor niczego nie przykrywał. Wysokość paska + zapas. */
export const ComposerSpacer: React.FC = () => <div aria-hidden className="h-24" />;

/**
 * Chip ustawienia w kompozytorze — zwarty, jeden rząd, jak „Auto"/„Pro" w Studiu.
 * Etykieta w kolorze zinc-400 (nie 500): na szkle pasek jest jaśniejszy niż tło strony, więc
 * ciemniejszy odcień gubił czytelność — złapane przy pierwszym przejściu przez ekran.
 */
export const ComposerChip: React.FC<{
  label: string; children: React.ReactNode; tone?: 'normal' | 'accent';
}> = ({ label, children, tone = 'normal' }) => {
  const a = useKitAccent();
  return (
    <div className={`inline-flex flex-none items-center gap-2 rounded-full border px-3 py-1.5 ${
      tone === 'accent' ? 'border-white/[0.16]' : 'border-white/[0.08]'}`}
      style={tone === 'accent' ? { boxShadow: `0 0 0 1px ${a.base}44` } : undefined}>
      <span className="text-[10px] font-bold uppercase tracking-[.1em] text-zinc-400">{label}</span>
      {children}
    </div>
  );
};

/** Select bez ramki — ramkę niesie chip, żeby nie było dwóch obwódek jedna w drugiej. */
export const BareSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
  const a = useKitAccent();
  return (
    <select {...props}
      className={`max-w-[200px] cursor-pointer rounded border-0 bg-transparent p-0 text-[12.5px] font-semibold text-zinc-100 focus:outline-none focus-visible:ring-2 ${props.className || ''}`}
      style={{ ['--tw-ring-color' as string]: a.base, ...(props.style || {}) }} />
  );
};

/** Przycisk główny — jeden na ekranie, zawsze po prawej stronie kompozytora. */
export const PrimaryAction: React.FC<{
  onClick?: () => void; disabled?: boolean; icon?: React.ElementType; children: React.ReactNode;
  /**
   * Dymek — zwłaszcza gdy przycisk jest WYŁĄCZONY.
   *
   * ⚠️ Test prostoty: „jedyna akcja na ekranie jest martwa i nic nie mówi dlaczego". Wyłączony
   * przycisk bez wyjaśnienia wygląda jak awaria programu, a nie jak brakujący warunek.
   */
  title?: string;
}> = ({ onClick, disabled, icon: Icon, children, title }) => {
  const a = useKitAccent();
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold text-white transition-[filter,transform] hover:brightness-110 active:scale-[.98] disabled:opacity-40 disabled:hover:brightness-100"
      style={{ background: `linear-gradient(145deg, ${a.base}, ${a.deep})`, boxShadow: `0 8px 28px -10px ${a.base}` }}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
};

/** Sekcja treści — przezroczysta, włosowa ramka. Nigdy wypełniona karta. */
/**
 * Sekcja treści.
 *
 * `opis` to ROLA sekcji, nie ozdobnik — odpowiada na „po co to tu jest", nie „jak się nazywa".
 * Wzorzec z Ustawień Generatora: „Tożsamość · nagłówek i komparycja umowy",
 * „Kontakt · stopka dokumentu", „Rozliczenia · faktura i pro-forma". Sam tytuł nazywa
 * zawartość; dopiero rola mówi pracownikowi, na co ma wpływ to, co tu wpisze.
 */
// ─────────────────────────────────────────────────────────────────────────────
// 🔑 REGUŁA DOMU: WYBÓR NIE PRZESUWA EKRANU.
//
// Zgłoszenie właściciela 25.08.2026: „przy przełączaniu np. motywu lub wyborze jakiejkolwiek
// opcji nie możesz przesuwać ekranu — wgrajcie tę regułę dla całego narzędzia".
//
// CO TO ZNACZY DOKŁADNIE — bo bez rozróżnienia reguła jest niewykonalna:
//
//  ✗ ZABRONIONE — ARTEFAKT ZAZNACZENIA. Element zmienia rozmiar dlatego, że został wybrany,
//    a nie dlatego, że zmieniła się treść. Zmierzony przypadek (WyborSzablonu, 25.08.2026):
//    zaznaczony kafel dostawał ptaszek → ptaszek zabierał szerokość → nazwa łamała się na drugą
//    linię (15 → 30 px) → rósł kafel, rząd i karta → WSZYSTKO PONIŻEJ ZJEŻDŻAŁO O 15 px.
//    Klik w wybór przesuwał podgląd, na który człowiek właśnie patrzył.
//
//  ✓ DOZWOLONE — REALNA ZMIANA TREŚCI. Zmiana typu dokumentu pokazuje inne szablony, więc karta
//    MUSI zmienić wysokość (zmierzone: +44 px). Tego nie da się i nie należy blokować. Warunek
//    jest inny: kontrolka, w którą człowiek kliknął, ma ZOSTAĆ NA MIEJSCU, a zmiana ma dziać się
//    POD nią (zmierzone: select „Typ dokumentu" po zmianie stoi na tym samym Y — 198 px).
//
// JAK TO SIĘ TRZYMA W PRAKTYCE — trzy nawyki:
//  1. Miejsce na wskaźnik zaznaczenia (ptaszek, kropka) jest REZERWOWANE ZAWSZE, także gdy
//     element nie jest wybrany — `<span className="h-3 w-3 flex-none">` z warunkową ikoną w środku,
//     nigdy `{aktywny && <Ikona/>}` jako rodzeństwo tekstu.
//  2. Napis, który może się zawinąć, dostaje STAŁĄ liczbę linii (`line-clamp-2` + `min-h-[…]`),
//     a pełną treść w `title`. Nic nie ginie, a wysokość jest niezmienna.
//  3. Zaznaczenie maluje się WEWNĄTRZ obrysu (`box-shadow: inset`, tło, kolor ramki już obecnej),
//     nigdy przez dołożenie ramki, której wcześniej nie było — ta ostatnia zmienia układ o 1 px
//     na każdym elemencie i sumuje się w rzędzie.
//
// SPRAWDZENIE (jedno polecenie w konsoli): zapamiętaj `getBoundingClientRect().top` dowolnego
// napisu PONIŻEJ kontrolki, kliknij wybór, odczytaj ponownie. Różnica ma wynosić 0.
// Zmierzone po naprawie: kafle szablonów 0 px · kafle motywu (wystawianie) 0 px ·
// kafle motywu („Firma → Barwy") 0 px.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * KARTA DECYZJI — jedna sekcja ekranu „Wystaw dokument".
 *
 * ⚠️ PO CO POWSTAŁA (25.08.2026, audyt wizualny). Karta sekcji NIE ISTNIAŁA jako komponent:
 * ten sam łańcuch klas był przepisany ręcznie w ośmiu miejscach modułu, a każda kopia
 * rozjeżdżała się osobno. Zmierzone na żywym ekranie skutki:
 *   · etykieta sekcji siedziała 24 / 17 / 34 px od góry karty — TRZY różne wysokości,
 *   · pierwsza kontrolka zaczynała się na 195 / 42 / 161 px — brak wspólnej krawędzi.
 *
 * ⚠️ PRZYCZYNA BYŁA JEDNA, nie trzy. Etykieta stała w TYM SAMYM rzędzie flex co kontrolki,
 * z `items-center`, więc jej pozycję ustalało najwyższe rodzeństwo, a nie karta:
 *     17 = 1 + 16                (etykieta na krawędzi treści — tak robi karta „Szablon")
 *     24 = 17 + (33 − 19) / 2    (najwyższe rodzeństwo: ComposerChip)
 *     34 = 17 + (53 − 19) / 2    (najwyższe rodzeństwo: kafel motywu)
 * Kontrola: 34 − 24 = 10 = (53 − 33) / 2. Trzy liczby to jedna decyzja strukturalna odbita
 * przez trzy wysokości kontrolek — więc lekarstwem jest WYJĘCIE etykiety z rzędu kontrolek,
 * a nie korygowanie odstępów w każdej karcie z osobna.
 *
 * ⚠️ ZERO NOWEJ ESTETYKI. Chrom odtworzony co do znaku z dzisiejszych kart, a układ wnętrza
 * przeniesiony z karty „Szablon", która jako jedyna miała już nagłówek w osobnym wierszu.
 * To NIE jest `Panel` niżej — tamten niesie ramkę i gradient w kolorze akcentu oraz nagłówek
 * wersalikami, czyli byłby inną estetyką.
 */
export const KartaDecyzji: React.FC<{
  /** Nazwa sekcji — 13 px/600, ta sama we wszystkich kartach. */
  tytul: React.ReactNode;
  /** Dopisek obok tytułu, w linii nagłówka (np. „dokument bierze X"). */
  dopisek?: React.ReactNode;
  /** Element dosunięty do prawej krawędzi nagłówka. */
  obok?: React.ReactNode;
  /** Zdanie pod treścią — wspólna „stopka" karty. */
  stopka?: React.ReactNode;
  children: React.ReactNode;
}> = ({ tytul, dopisek, obok, stopka, children }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
    {/* ⚠️ `items-baseline`, nie `items-center` — nagłówek ma trzymać linię pisma z dopiskiem,
         a nie centrować się względem czegokolwiek, co akurat obok stanie. */}
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="text-[13px] font-semibold text-zinc-100">{tytul}</span>
      {dopisek}
      {obok ? <span className="ml-auto">{obok}</span> : null}
    </div>
    {/* Treść zawsze 12 px pod nagłówkiem — niezależnie od tego, co w niej stoi. */}
    <div className="mt-3 flex flex-wrap items-center gap-2.5">{children}</div>
    {stopka ? <div className="mt-3">{stopka}</div> : null}
  </div>
);

export const Panel: React.FC<{
  title?: string; opis?: string; right?: React.ReactNode; children: React.ReactNode;
}> = ({ title, opis, right, children }) => {
  const a = useKitAccent();
  return (
    // Powierzchnia PODBARWIONA akcentem — język zakładki „Character Swap" (zmierzone:
    // ramka rgba(akcent,.2), tło linear-gradient(135deg, akcent 8% → 2%), radius 16px).
    // Wcześniej `border-white/[0.07] bg-white/[0.015]` — poprawny odczyt zakładki „Studio",
    // ale bezbarwny: ekran wychodził szary mimo akcentu na paru drobiazgach.
    <div className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: `${a.base}${alfa(a, 0.20)}`,
        backgroundImage: `linear-gradient(135deg, ${a.base}${alfa(a, 0.08)} 0%, ${a.base}${alfa(a, 0.02)} 100%)`,
      }}>
      {(title || right) && (
        <div className="flex flex-wrap items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: `1px solid ${a.base}${alfa(a, 0.12)}` }}>
          {/* Studio: rgb(245,245,245) · 14px · 700 · ls .7px — NIE przygaszony zinc-500 na 10px.
              Nagłówek sekcji ma prowadzić wzrok, a nie chować się w tle. */}
          {title && <span className="text-[14px] font-bold uppercase tracking-[.06em] text-zinc-100">{title}</span>}
          {opis && <span className="text-[12px] font-normal normal-case tracking-normal text-zinc-500">{opis}</span>}
          {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Znacznik pustego pola. Wzorzec z Ustawień Generatora („KRS ⚠ puste", „Funkcja ⚠ puste").
 *
 * ⚠️ To NIE jest ozdobnik — to reguła z CLAUDE.md przeniesiona na ekran: gdy wszystkie
 * ścieżki odczytu są puste, właściwą wartością jest PUSTA LUKA DO POKAZANIA, nigdy
 * prawdopodobnie sensowny tekst. Puste pole renderowane jako nic wygląda identycznie jak
 * pole, którego nikt jeszcze nie zauważył — i dokładnie tak powstało „5,71 szt."
 * uszczelnienia pianą na ofercie u klienta.
 */
export const Luka: React.FC<{ children?: React.ReactNode }> = ({ children = 'puste' }) => (
  <Status ton="uwaga" ikona={AlertTriangle}>{children}</Status>
);

/** Poświata tła — ambient jak w Studiu (róg u góry). Statyczna, nie rozprasza. */
export const Atmosphere: React.FC = () => {
  const a = useKitAccent();
  return (
    // Tło Studia zmierzone na `/studio-zdjec`: DWIE kule 384×384 z blur(64px) w pełnym
    // akcencie + siatka 50×50 px z linii 1px, opacity .04. Poprzednia wersja miała jeden
    // ledwo widoczny radial — stąd wrażenie płaskiego, czarnego ekranu obok Studia.
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full"
        style={{ background: a.base, filter: 'blur(64px)', opacity: 0.20 * (a.glow ?? 1) }} />
      <div className="absolute top-1/2 -left-24 h-96 w-96 rounded-full"
        style={{ background: a.base, filter: 'blur(64px)', opacity: 0.10 * (a.glow ?? 1) }} />
      <div className="absolute inset-0"
        style={{
          opacity: 0.04 * (a.glow ?? 1),
          backgroundImage:
            `linear-gradient(${a.base} 1px, transparent 1px), linear-gradient(90deg, ${a.base} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
    </div>
  );
};
