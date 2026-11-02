import React, { useState } from 'react';
import {
  ListChecks, TrendingUp, BarChart3, GraduationCap, Sliders, Webhook, Package, Settings2,
  Cpu, Sparkles, Crown, Zap, Server, Gauge, Search, Bell, Users,
  CreditCard, Coins, LifeBuoy, Boxes, ShieldAlert, Trash2,
  Rocket, FileText, Globe, Phone, Wand2, Image as ImageIcon,
} from 'lucide-react';
import { SZKLO_PRZEJRZYSTE, Tile, TileHeader } from '@/components/ui/tile';
import { Plakietka, Licznik, Awatar } from '@/components/ui/plakietka';
import { Pole, Obszar, Szukajka, PoleLiczbowe, PoleWyboru } from '@/components/ui/pola';
import {
  ListaWyboru, ListaPrzycisk, ListaTresc, ListaGrupa, ListaPozycja, ListaRozdzielacz, ListaCecha,
} from '@/components/ui/lista-wyboru';
import { Zakladki, PanelZakladki } from '@/components/ui/zakladki';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import { Postep } from '@/components/ui/wskazniki';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Szkielet, PustyStan } from '@/components/ui/stany';
import { PasekZaznaczenia } from '@/components/ui/pasek-zaznaczenia';
import { Heart, EyeOff, Download, FolderInput } from 'lucide-react';
import {
  Wiadomosc, AkcjaWiadomosci, WejscieCzatu,
  PastylkaTrybu, PastylkaModelu, PastylkaTokenow, PrzyciskNarzedzia, PrzyciskWyslij,
  MENU_NAD_WEJSCIEM,
} from '@/components/ui/rozmowa';
import { useDefinicjeSzkla, KLASA_SZKLA } from '@/components/ui/szklo-plynne';
import LiquidGlass from '@/components/ui/szklo-apple';
import { SterowanieSzklem } from './SterowanieSzklem';
import { CalendarDays, Copy, RefreshCw, Volume2, Paperclip, Mic } from 'lucide-react';

/**
 * BIBLIOTEKA KOMPONENTÓW NextByte — jedyne źródło prawdy o wyglądzie.
 *
 * Renderuje PRODUKCYJNE komponenty z `components/ui`, a nie ich kopie — więc
 * to, co tu widać, jest dokładnie tym, co dostaje użytkownik. Zmiana w `.nb-szklo`
 * albo w `tile.tsx` pokazuje się tutaj i na platformie w tej samej chwili,
 * bo to ten sam plik.
 *
 * Mieszka w `management/biblioteka`, a nie w `dev`, bo jedzie na produkcję jako
 * zakładka „Biblioteka komponentów NextByte" w Panelu Zarządu.
 *
 * Zawiera KAŻDY stan każdego komponentu naraz, bo tylko wtedy widać, czy styl
 * trzyma się kupy: pole z błędem obok pola zwykłego, plakietka krytyczna obok
 * neutralnej, lista rozwinięta obok zamkniętej. Przełącznik motywów na stronie
 * nadrzędnej przepuszcza to wszystko przez 9 motywów.
 *
 * Kolejność sekcji wynika z pomiaru rozjazdu w `src` (31.07.2026):
 *   plakietka  982 użycia / 516 wyglądów   ← najgorzej
 *   lista      364 użycia / 121 wyglądów
 *   zakładki    91 plików / 4 implementacje
 *   pola      1173 użycia /  34 wyglądy    ← najlepiej, ale bez celu dotykowego
 */

const MODELE = [
  { id: 'opus',   nazwa: 'Claude Opus',   opis: 'Anthropic — najwyższy model, 1M kontekstu', cena: 23, monogram: 'A',
    dostawca: 'Anthropic', kontekstOpis: '1 000 000 tokenów',
    cechy: { inteligencja: 8, szybkosc: 4, kontekst: 8, koszt: 7 } },
  { id: 'sonnet', nazwa: 'Claude Sonnet', opis: 'Anthropic — produkcyjny coding i reasoning', cena: 3,  monogram: 'A',
    dostawca: 'Anthropic', kontekstOpis: '350 000 tokenów',
    cechy: { inteligencja: 6, szybkosc: 6, kontekst: 6, koszt: 3 } },
  { id: 'gpt',    nazwa: 'GPT-5.4',       opis: 'OpenAI — flagowy model reasoning',           cena: 4,  monogram: 'O',
    dostawca: 'OpenAI', kontekstOpis: '400 000 tokenów',
    cechy: { inteligencja: 7, szybkosc: 5, kontekst: 6, koszt: 4 } },
  { id: 'grok',   nazwa: 'Grok 4.3',      opis: 'xAI — agentic reasoning, 1M kontekstu',      cena: 2,  monogram: 'x',
    dostawca: 'xAI', kontekstOpis: '1 000 000 tokenów',
    cechy: { inteligencja: 6, szybkosc: 7, kontekst: 8, koszt: 2 } },
];

/**
 * Karta szczegółów modelu — pokazywana z boku listy po najechaniu.
 * Zbudowana z tych samych elementów, co reszta: plakietka, cechy segmentowe,
 * wersalikowe etykiety. Żadnego własnego stylu „tylko na tę kartę".
 */
const SzczegolyModelu: React.FC<{ m: (typeof MODELE)[number] }> = ({ m }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{m.nazwa}</p>
        <p className="text-xs text-muted-foreground">{m.dostawca}</p>
      </div>
      <Plakietka intencja="akcent" rozmiar="srednia">⟠ {m.cena}</Plakietka>
    </div>

    <p className="text-xs leading-relaxed text-muted-foreground">{m.opis}</p>

    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
      <ListaCecha nazwa="Inteligencja" wartosc={m.cechy.inteligencja} />
      <ListaCecha nazwa="Szybkość"     wartosc={m.cechy.szybkosc} />
      <ListaCecha nazwa="Kontekst"     wartosc={m.cechy.kontekst} />
      <ListaCecha nazwa="Koszt"        wartosc={m.cechy.koszt} />
    </div>

    <div className="flex items-center justify-between border-t border-border/70 pt-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Okno kontekstu
      </span>
      <span className="text-xs tabular-nums text-foreground">{m.kontekstOpis}</span>
    </div>
  </div>
);

/**
 * Pary „zaszyte kolory ↔ tokeny". Łańcuchy klas są WYPISANE W PEŁNEJ FORMIE,
 * bo Tailwind skanuje źródło — sklejone w locie nigdy nie trafiłyby do arkusza,
 * a wtedy tabela pułapek pokazywałaby dwa identyczne, puste prostokąty.
 */
const PULAPKI = [
  { co: 'Tło płaszczyzny',    zle: 'bg-foreground/10',   zleKlasy: 'border-foreground/20 bg-foreground/10 text-white',
    dobre: 'bg-foreground/[0.06]', dobreKlasy: 'border-border bg-foreground/[0.06] text-card-foreground' },
  { co: 'Obwódka',            zle: 'border-foreground/20', zleKlasy: 'border-foreground/20 text-white',
    dobre: 'border-border',        dobreKlasy: 'border-border text-card-foreground' },
  { co: 'Tekst główny',       zle: 'text-white',    zleKlasy: 'border-foreground/20 text-white',
    dobre: 'text-card-foreground', dobreKlasy: 'border-border text-card-foreground' },
  { co: 'Tekst drugoplanowy', zle: 'text-foreground/60', zleKlasy: 'border-foreground/20 text-foreground/60',
    dobre: 'text-muted-foreground', dobreKlasy: 'border-border text-muted-foreground' },
  { co: 'Wgłębienie pola',    zle: 'bg-black/20',   zleKlasy: 'border-foreground/20 bg-black/20 text-white',
    dobre: 'bg-background/40',     dobreKlasy: 'border-border bg-background/40 text-card-foreground' },
] as const;

/**
 * Osiemnaście pozycji — tyle, ile ma naprawdę Panel Zarządu. Krótsza lista
 * ukryłaby wadę, dla której ta sekcja powstała: brak wysokości maksymalnej
 * widać dopiero wtedy, gdy lista nie mieści się na ekranie.
 */
const PASEK_DEMO = [
  { value: 'przeglad', label: 'Przegląd', icon: <Gauge className="w-3.5 h-3.5" /> },
  { value: 'tokeny', label: 'Tokeny AI', icon: <Coins className="w-3.5 h-3.5" /> },
  { value: 'subskrypcje', label: 'Subskrypcje', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { value: 'zadania', label: 'Zadania', icon: <ListChecks className="w-3.5 h-3.5" /> },
  { value: 'finanse', label: 'Finanse', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'analityka', label: 'Analityka', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { value: 'rejestracje', label: 'Rejestracje', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'tickety', label: 'Tickety', icon: <LifeBuoy className="w-3.5 h-3.5" /> },
  { value: 'akademia', label: 'Akademia', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { value: 'moduly', label: 'Moduły AI', icon: <Boxes className="w-3.5 h-3.5" /> },
  { value: 'modele', label: 'Konfiguracja modeli', icon: <Sliders className="w-3.5 h-3.5" /> },
  { value: 'katalog', label: 'Katalog API', icon: <Globe className="w-3.5 h-3.5" /> },
  { value: 'szablony', label: 'Szablony', icon: <FileText className="w-3.5 h-3.5" /> },
  { value: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-3.5 h-3.5" /> },
  { value: 'prompty', label: 'Prompty AI', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'promptex', label: 'PromptEx', icon: <Zap className="w-3.5 h-3.5" /> },
  { value: 'pakiety', label: 'Pakiety Wiedzy', icon: <Package className="w-3.5 h-3.5" /> },
  { value: 'zarzadzanie', label: 'Zarządzanie', icon: <Settings2 className="w-3.5 h-3.5" /> },
];

const ZAKLADKI_ZARZADU = [
  { id: 'przeglad', etykieta: 'Przegląd',    ikona: Gauge,      grupa: 'Firma' },
  { id: 'ludzie',   etykieta: 'Użytkownicy', ikona: Users,      grupa: 'Firma', licznik: 68 },
  { id: 'kasa',     etykieta: 'Finanse',     ikona: CreditCard, grupa: 'Firma' },
  { id: 'modele',   etykieta: 'Modele AI',   ikona: Boxes,      grupa: 'Produkt' },
  { id: 'zgloszen', etykieta: 'Zgłoszenia',  ikona: LifeBuoy,   grupa: 'Produkt', licznik: 3 },
];

export const BibliotekaKomponentow: React.FC = () => {
  const [model, setModel] = useState('opus');
  const [szukane, setSzukane] = useState('');
  const [zakladka, setZakladka] = useState('przeglad');
  const [pasekDemo, setPasekDemo] = useState('przeglad');
  const [opis, setOpis] = useState('Krótki opis pakietu widoczny w sklepie.');
  const [cena, setCena] = useState(250);
  const [prompt, setPrompt] = useState('');
  // Domyślnie WEB — żeby od razu było widać stan włączony OBOK wyłączonych
  // i zablokowanego. Trzy stany naraz to jedyny sposób, żeby ocenić, czy się
  // od siebie odróżniają.
  const [tryb, setTryb] = useState<string | null>('web');
  const [demoReasoning, setDemoReasoning] = useState(true);
  const [demoFast, setDemoFast] = useState(false);
  const [demoInteligencja, setDemoInteligencja] = useState(10);
  const [demoKoszt, setDemoKoszt] = useState(6);
  const wybrany = MODELE.find((m) => m.id === model) ?? MODELE[0];

  /* Płytki pokazowe używają klas szkła bez pośrednictwa `Okno`/`ListaWyboru`,
     więc same muszą zadbać o filtry. Ten sam licznik co tam — nie zdublują się. */
  useDefinicjeSzkla();

  return (
    <div className="space-y-6">
      {/* ══ PASEK ZAZNACZENIA — jedna listwa „N zaznaczono · akcje · ✕" (02.09.2026) ══ */}
      <Tile>
        <TileHeader
          tytul="Pasek zaznaczenia"
          podtytul="zaznaczenie wielu w galerii — barwę bierze z --primary miejsca użycia; wejście bez skali, żeby szkło nie gasło"
          poPrawej={<Plakietka intencja="akcent">nowy</Plakietka>}
        />
        <div className="py-2">
          <PasekZaznaczenia
            wPrzeplywie
            liczba={3}
            formy={['film', 'filmy', 'filmów']}
            akcje={[
              { id: 'ulubione', etykieta: 'Ulubione', ikona: Heart, onClick: () => {} },
              { id: 'ukryj', etykieta: 'Ukryj', ikona: EyeOff, onClick: () => {} },
              { id: 'przenies', etykieta: 'Przenieś do sesji', ikona: FolderInput, onClick: () => {} },
              { id: 'pobierz', etykieta: 'Pobierz', ikona: Download, onClick: () => {} },
              { id: 'usun', etykieta: 'Usuń', ikona: Trash2, intencja: 'krytyczna', onClick: () => {} },
            ]}
            onZaznaczWszystko={() => {}}
            onWyczysc={() => {}}
          />
        </div>
      </Tile>

      {/* ══ 0. SZKŁO PŁYNNE — porównanie trzech poziomów ══ */}
      <Tile>
        <TileHeader
          tytul="Szkło"
          podtytul="cztery odmiany materiału — najedź na płytki, pod spodem jedzie wzór"
          poPrawej={<Plakietka intencja="akcent">Liquid Glass</Plakietka>}
        />

        <div className="relative overflow-hidden rounded-xl p-6">
          {/*
            TŁO POD SZKŁEM — SIATKA PLATFORMY, nie wymyślony gradient.

            Dwa powody, oba praktyczne:
            ① SIATKA JEST NAJLEPSZYM TESTEM ZAŁAMANIA. Proste, równoległe linie
               wyginają się na krawędzi szyby w sposób, którego nie da się
               podrobić ani przeoczyć. Na rozmytej plamie koloru refrakcji
               NIE WIDAĆ — można ją mieć albo nie mieć i wygląda tak samo.
            ② To jest tło, które użytkownik NAPRAWDĘ ma pod spodem: techgrid
               domyślnie, a w sklepie kupuje własne wzory. Ocena szkła nad
               wymyśloną teksturą nie mówi nic o tym, jak zachowa się w platformie.

            Plamy koloru zostają POD siatką — aberracja chromatyczna pokazuje się
            tylko tam, gdzie w ogóle jest kolor do rozszczepienia.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 28%, hsl(var(--primary)/0.75), transparent 45%),'
                + 'radial-gradient(circle at 80% 70%, hsl(var(--destructive)/0.60), transparent 46%)',
            }}
          />
          {/*
            Siatka rysowana gradientami, a NIE platformowym `BackgroundGrid` —
            i to nie jest kaprys. Tamten wkleja kolor do WNĘTRZA `data:` URI,
            gdzie `currentColor` nie ma żadnego kontekstu i rozwiązuje się na
            czerń; przyjmuje więc wyłącznie kolory dosłowne, przez co jest ślepy
            na motyw. Do tego domyślnie wygasza wzór przy krawędziach — czyli
            dokładnie tam, gdzie sprawdzamy załamanie.
            (Do poprawienia w samym komponencie; tutaj potrzebna jest siatka,
            która idzie za motywem i nie znika na brzegach.)
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 text-foreground/45"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 26px),'
                + 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 26px)',
            }}
          />

          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { kl: 'nb-szklo', tytul: 'Rozmycie', opis: 'to, co mieliśmy: mgła bez krawędzi' },
              { kl: KLASA_SZKLA.delikatne, tytul: 'Załamanie', opis: 'okna, panele, menu' },
              { kl: KLASA_SZKLA.wyrazne, tytul: 'Załamanie mocne', opis: 'asystent, duża karta' },
              /* 26.10.2026, Michał: „zapisać styl tej szyby na platformie i z niego
                 korzystać, a nie tylko z tej czarnej”. `SZKLO_PRZEJRZYSTE` z `tile.tsx`. */
              { kl: SZKLO_PRZEJRZYSTE, tytul: 'Szyba nad sceną', opis: 'karta nad konstelacją, wykresem, zdjęciem' },
            ].map((w) => (
              <div key={w.tytul} className={`rounded-2xl border border-border p-4 ${w.kl}`}>
                <p className="text-[14px] font-semibold text-foreground">{w.tytul}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{w.opis}</p>
                <p className="mt-3 text-[11px] tabular-nums text-foreground/80">1 234,56 ⟠</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Załamanie działa w Chromium. Safari i Firefox go nie obsługują — tam wszystkie trzy płytki
          wyglądają jak pierwsza. Dlatego pierwsza warstwa musi być dobra sama z siebie, a nie być
          „wersją gorszą".
        </p>
      </Tile>

      {/* ══════════════════════════════════════════════════════════════════
          HORYZONT — styl kafelka NextByte
          ══════════════════════════════════════════════════════════════════
          Michał, 27.08.2026: „nazwijmy ten styl kafelków jakoś i daj go do
          stylów globalnych, do biblioteki komponentów".

          Sekcja pokazuje CO NIESIE BARWA, bo to jest sedno tego stylu —
          nie gradient sam w sobie, tylko to, że sześć kafelków obok siebie
          da się rozróżnić kątem oka zamiast czytać ich podpisy. */}
      <Tile className="mt-6">
        <TileHeader
          ikona={Sparkles}
          tytul="Horyzont"
          podtytul="Światło u podstawy, siatka uciekająca w głąb — styl kafelka modułu"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { nazwa: 'Asystent', barwa: '265 85% 62%' },
            { nazwa: 'Chat AI', barwa: '205 90% 60%' },
            { nazwa: 'Notatki', barwa: '45 90% 58%' },
            { nazwa: 'Studio Zdjęć', barwa: '330 80% 62%' },
          ].map((w) => (
            <div
              key={w.nazwa}
              className="nb-horyzont flex h-[104px] flex-col justify-end rounded-2xl border border-border/60 bg-card/40 p-3"
              style={{ ['--nb-barwa' as string]: w.barwa }}
            >
              <span
                aria-hidden="true"
                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{
                  borderColor: `hsl(${w.barwa}/0.35)`,
                  background: `hsl(${w.barwa}/0.14)`,
                  color: `hsl(${w.barwa})`,
                  boxShadow: `0 4px 16px hsl(${w.barwa}/0.22)`,
                }}
              >
                <Sparkles className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-foreground">{w.nazwa}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            <span className="font-mono text-foreground/80">.nb-horyzont</span> daje dwie warstwy:
            światło bijące od dolnej krawędzi i siatkę gasnącą, zanim dojdzie do tekstu. Barwę
            podaje się przez <span className="font-mono text-foreground/80">--nb-barwa</span> —
            trzy liczby HSL bez <span className="font-mono text-foreground/80">hsl()</span>, tak samo
            jak wszystkie tokeny motywu. Bez niej klasa spada na akcent platformy.
          </p>
          <p>
            Klasa niesie WYŁĄCZNIE oświetlenie — zaokrąglenie, obramowanie i tło zostają po stronie
            kafelka. Dzięki temu horyzont da się nałożyć na powierzchnię o dowolnym kształcie,
            także na szkło.
          </p>
          <p>
            Od 26.09.2026 Szybka Podróż nie używa horyzontu ani barw modułów — kafelek stoi na
            szkle platformy, w kolorze motywu, z ikoną narzędzia zatopioną w rogu karty. Klasa
            zostaje w bibliotece dla powierzchni, które potrzebują własnej barwy.
          </p>
        </div>
      </Tile>

      {/* ══ 0b. SZKŁO APPLE — kopia z `rdev/liquid-glass-react` obok naszego ══ */}
      <Tile>
        <TileHeader
          tytul="Szkło Apple — kopia z repozytorium"
          podtytul="ten sam kod co w liquid-glass-react, u nas w bibliotece; obok nasz materiał na tym samym tle"
          poPrawej={<Plakietka intencja="akcent">szklo-apple</Plakietka>}
        />

        <div className="relative overflow-hidden rounded-xl p-6">
          {/* TO SAMO TŁO co przy naszym szkle wyżej — inaczej porównanie nic nie
              mówi. Plamy koloru pod siatką, bo aberracja chromatyczna pokazuje
              się tylko tam, gdzie w ogóle jest kolor do rozszczepienia. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 28%, hsl(var(--primary)/0.75), transparent 45%),'
                + 'radial-gradient(circle at 80% 70%, hsl(var(--destructive)/0.60), transparent 46%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 text-foreground/45"
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px),'
                + 'linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
            {/* NASZ MATERIAŁ */}
            <div className={`rounded-2xl border border-border p-4 ${KLASA_SZKLA.delikatne}`}>
              <p className="text-[14px] font-semibold text-foreground">Nasze szkło</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                `nb-szklo-plynne` — mapa z dwóch gradientów, refrakcja na całej powierzchni
              </p>
              <p className="mt-3 text-[11px] tabular-nums text-foreground/80">1 234,56 ⟠</p>
            </div>

            {/* KOPIA Z REPOZYTORIUM.
                Własne pudełko o znanych wymiarach i `absolute top/left 50%`
                w środku — bo `LiquidGlass` ustawia sobie
                `transform: translate(-50%, -50%)`. Jest pomyślany do NAKŁADANIA
                na tło, nie do stania w przepływie; bez tego pudełka rozpycha
                rodzica (zmierzone na pasku hero: 96 → 340 px). */}
            <div className="relative min-h-[116px]">
              <LiquidGlass
                displacementScale={64}
                blurAmount={0.06}
                saturation={130}
                aberrationIntensity={2}
                elasticity={0.35}
                cornerRadius={16}
                padding="16px"
                style={{ position: 'absolute', top: '50%', left: '50%', width: '100%' }}
              >
                <span className="block">
                  <span className="block text-[14px] font-semibold text-foreground">Szkło Apple</span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    mapa z `roundedRectSDF`, aberracja tylko przy krawędzi
                  </span>
                  <span className="mt-3 block text-[11px] tabular-nums text-foreground/80">1 234,56 ⟠</span>
                </span>
              </LiquidGlass>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Kod skopiowany 1:1 z <code>rdev/liquid-glass-react</code> (MIT, Copyright 2025 MAX ROVENSKY),
          rozbity na pliki tylko po to, żeby żaden nie przekroczył 500 linii. Leży
          w <code>src/components/ui/szklo-apple/</code> — nie jako zależność z npm, bo tamta
          deklaruje <code>peer react &gt;=19</code>, a platforma stoi na 18.3, i nie da się jej dostroić
          od środka. Różnica, którą widać: u nas refrakcja idzie po całej powierzchni, u nich
          maska zostawia środek tafli nietknięty, a zniekształca tylko brzeg.
        </p>
      </Tile>

      {/* ══ 0c. ZARZĄDZANIE SZKŁEM — suwaki jak w demie repozytorium ══ */}
      <SterowanieSzklem />

      {/* ══ 1. PLAKIETKI ══ */}
      <Tile>
        <TileHeader
          tytul="Plakietki"
          podtytul="982 użycia i 516 różnych wyglądów w platformie — tu jeden"
          poPrawej={<Plakietka intencja="krytyczna">najgorszy rozjazd</Plakietka>}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Plakietka>neutralna</Plakietka>
            <Plakietka intencja="akcent">akcent</Plakietka>
            <Plakietka intencja="uwaga">uwaga</Plakietka>
            <Plakietka intencja="krytyczna">błąd</Plakietka>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Plakietka intencja="akcent" rozmiar="srednia" ikona={Sparkles}>nowość</Plakietka>
            <Plakietka intencja="akcent" rozmiar="srednia" kropka zywa>na żywo</Plakietka>
            <Plakietka intencja="krytyczna" rozmiar="srednia" kropka>przeterminowane</Plakietka>
            <Plakietka intencja="neutralna" rozmiar="srednia">premium</Plakietka>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Liczniki:</span>
            <Licznik wartosc={1} />
            <Licznik wartosc={12} />
            <Licznik wartosc={170} />
            <Licznik wartosc={4} intencja="krytyczna" />
            <Licznik wartosc={8} intencja="neutralna" />
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Zieleni i żółci nie ma świadomie — przy trzech kolorach naraz plakietka przestaje cokolwiek
            znaczyć, a na Smoczym żółć zlewa się z pomarańczowym akcentem. Dlatego <em>uwaga</em> jest
            osobnym <strong>sensem</strong>, ale niesie kolor motywu.
          </p>
        </div>
      </Tile>

      {/* ══ 2. LISTA WYBORU ══ */}
      <Tile>
        <TileHeader
          tytul="Lista wyboru"
          podtytul="wybór modelu i każde inne rozwijane menu to jeden komponent"
          poPrawej={<Plakietka intencja="uwaga">364 użycia / 121 wyglądów</Plakietka>}
        />
        <div className="flex flex-wrap items-start gap-3">
          <ListaWyboru>
            <ListaPrzycisk
              monogram={wybrany.monogram}
              poPrawej={<span className="tabular-nums">⟠ {wybrany.cena}</span>}
              className="min-w-[15rem]"
            >
              {wybrany.nazwa}
            </ListaPrzycisk>
            <ListaTresc className="min-w-[22rem]">
              <ListaGrupa>Inne modele</ListaGrupa>
              {MODELE.map((m) => (
                <ListaPozycja
                  key={m.id}
                  monogram={m.monogram}
                  nazwa={m.nazwa}
                  opis={m.opis}
                  meta={`⟠ ${m.cena}`}
                  wybrana={m.id === model}
                  onWybor={() => setModel(m.id)}
                  szczegoly={<SzczegolyModelu m={m} />}
                />
              ))}
              <ListaRozdzielacz />
              <ListaGrupa>NextByte</ListaGrupa>
              {/*
                MODELE NEXTBYTE TEŻ MAJĄ KARTĘ SZCZEGÓŁÓW.
                Wcześniej jej nie miały i wychodziła z tego niespójność, którą
                użytkownik odczuwa jako usterkę: najeżdżasz na Claude i dostajesz
                kartę, najeżdżasz na Lokalny i nie dzieje się nic. Element
                zachowuje się różnie bez widocznego powodu — a to jest gorsze niż
                brak karty w ogóle.

                „Lokalny" jest przy tym przypadkiem ciekawym: jego parametrów
                NIE DA SIĘ podać, bo zależą od modelu wgranego przez użytkownika
                na własny serwer. Zamiast rysować wymyślone paski, karta mówi to
                wprost — ta sama zasada, co „niemierzalne" przy paskach zasobu.
              */}
              <ListaPozycja
                monogram="NB"
                nazwa="Lokalny"
                opis="Twój serwer AI — bez naliczania Byte"
                znacznik={<Plakietka intencja="krytyczna">błąd</Plakietka>}
                meta="⟠ 0"
                szczegoly={
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-foreground">Lokalny</p>
                        <p className="text-[11px] text-muted-foreground">NextByte · Twój sprzęt</p>
                      </div>
                      <Plakietka intencja="krytyczna" rozmiar="srednia">błąd</Plakietka>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Połączenie nieudane — sprawdź, czy serwer lokalny działa.
                    </p>
                    <div className="rounded-xl border border-border bg-background/40 p-2.5">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Parametrów nie pokazujemy, bo zależą od modelu, który wgrałeś
                        na własny serwer. Zmyślona ocena byłaby gorsza niż jej brak.
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Koszt
                      </span>
                      <span className="text-[11px] tabular-nums text-foreground">0 Byte — zawsze</span>
                    </div>
                  </div>
                }
              />
              <ListaPozycja
                monogram="NB"
                nazwa="Szybki"
                opis="Błyskawiczne odpowiedzi do prostych zadań"
                meta="⟠ 1"
                szczegoly={
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-foreground">Szybki</p>
                        <p className="text-[11px] text-muted-foreground">NextByte</p>
                      </div>
                      <Plakietka intencja="akcent" rozmiar="srednia">⟠ 1</Plakietka>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">Błyskawiczne odpowiedzi do prostych zadań</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                      <ListaCecha nazwa="Inteligencja" wartosc={3} />
                      <ListaCecha nazwa="Szybkość"     wartosc={8} />
                      <ListaCecha nazwa="Kontekst"     wartosc={3} />
                      <ListaCecha nazwa="Koszt"        wartosc={1} />
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Okno kontekstu
                      </span>
                      <span className="text-[11px] tabular-nums text-foreground">32 000 tokenów</span>
                    </div>
                  </div>
                }
              />
              <ListaPozycja
                monogram="NB"
                nazwa="Pro"
                opis="Zaawansowane rozumowanie i analiza"
                meta="⟠ 2"
                szczegoly={
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-foreground">Pro</p>
                        <p className="text-[11px] text-muted-foreground">NextByte</p>
                      </div>
                      <Plakietka intencja="akcent" rozmiar="srednia">⟠ 2</Plakietka>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">Zaawansowane rozumowanie i analiza</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                      <ListaCecha nazwa="Inteligencja" wartosc={6} />
                      <ListaCecha nazwa="Szybkość"     wartosc={5} />
                      <ListaCecha nazwa="Kontekst"     wartosc={6} />
                      <ListaCecha nazwa="Koszt"        wartosc={2} />
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Okno kontekstu
                      </span>
                      <span className="text-[11px] tabular-nums text-foreground">150 000 tokenów</span>
                    </div>
                  </div>
                }
              />
              <ListaPozycja
                monogram="NB"
                nazwa="Ultra"
                opis="Najwyższa jakość — szybkość i inteligencja"
                meta="⟠ 2"
                szczegoly={
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-foreground">Ultra</p>
                        <p className="text-[11px] text-muted-foreground">NextByte</p>
                      </div>
                      <Plakietka intencja="akcent" rozmiar="srednia">⟠ 2</Plakietka>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">Najwyższa jakość — szybkość i inteligencja</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                      <ListaCecha nazwa="Inteligencja" wartosc={8} />
                      <ListaCecha nazwa="Szybkość"     wartosc={6} />
                      <ListaCecha nazwa="Kontekst"     wartosc={8} />
                      <ListaCecha nazwa="Koszt"        wartosc={2} />
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Okno kontekstu
                      </span>
                      <span className="text-[11px] tabular-nums text-foreground">350 000 tokenów</span>
                    </div>
                  </div>
                }
              />
              <ListaRozdzielacz />
              <ListaPozycja ikona={Trash2} nazwa="Wyczyść wybór" niszczaca />
            </ListaTresc>
          </ListaWyboru>

          {/* wariant zwarty — do pasków narzędzi */}
          <ListaWyboru>
            <ListaPrzycisk zwarty className="min-w-[10rem]">Sortuj: najnowsze</ListaPrzycisk>
            <ListaTresc>
              <ListaPozycja nazwa="Najnowsze" wybrana />
              <ListaPozycja nazwa="Najstarsze" />
              <ListaPozycja nazwa="Nazwa A–Z" />
            </ListaTresc>
          </ListaWyboru>
        </div>
      </Tile>

      {/* ══ 3. ZAKŁADKI ══ */}
      <Tile>
        <TileHeader
          tytul="Zakładki"
          podtytul="grupy i liczniki — od 03.08.2026 ten sam komponent, co pasek niżej"
        />
        <div className="space-y-3">
          <Zakladki
            zakladki={ZAKLADKI_ZARZADU}
            aktywna={zakladka}
            onZmiana={setZakladka}
            aria-label="Sekcje Panelu Zarządu"
          />
          {ZAKLADKI_ZARZADU.map((z) => (
            <PanelZakladki key={z.id} id={z.id} aktywna={zakladka}>
              <div className="rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                Treść zakładki <strong className="text-foreground">{z.etykieta}</strong>. Ten pasek i ten
                niżej to od 03.08.2026 <strong className="text-foreground">ten sam komponent</strong> —
                Michał zobaczył je tu obok siebie i zapytał, czemu platforma ma dwa style. Miała trzy:
                <code className="mx-1 text-[11px]">AnimatedTabs</code> w 88 plikach,
                <code className="mx-1 text-[11px]">Zakladki</code> w 8 i shadcn <code className="text-[11px]">tabs</code> w 1.
                Został ten z 88. <code className="mx-1 text-[11px]">Zakladki</code> jest teraz przejściówką,
                więc osiem wywołań nie musiało być przepisywanych — a grupy i liczniki, których tamten
                nie miał, doszły do wspólnego komponentu. Powyżej widać jedno i drugie.
              </div>
            </PanelZakladki>
          ))}
        </div>
      </Tile>

      {/* ══ 3b. PASEK ZAKŁADEK PLATFORMY (AnimatedTabs) ══ */}
      <Tile>
        <TileHeader
          tytul="Pasek zakładek platformy"
          podtytul="AnimatedTabs — 87 plików; poniżej sm zwija się w listę"
          poPrawej={<Plakietka intencja="uwaga">87 plików</Plakietka>}
        />
        <div className="space-y-3">
          <AnimatedTabs
            tabs={PASEK_DEMO}
            activeTab={pasekDemo}
            onTabChange={setPasekDemo}
            layoutId="biblioteka-pasek-demo"
            mobileDropdown
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Ten komponent renderuje <strong className="text-foreground">87 plików platformy</strong> —
            najwięcej ze wszystkich interaktywnych — a mimo to nie było go tu do 03.08.2026. Dlatego
            dwie jego wady przeżyły tak długo: pasek rozciągał się na całą szerokość przy dwóch
            pigułkach, a lista rozwijana <strong className="text-foreground">nie miała wysokości
            maksymalnej</strong> i przy 18 zakładkach Zarządu schodziła poza ekran telefonu bez
            możliwości przewinięcia. Osiemnaście pozycji poniżej to nie ozdoba — to odtworzenie
            dokładnie tego przypadku. Zwęź okno poniżej 640 px, żeby zobaczyć listę.
          </p>
        </div>
      </Tile>

      {/* ══ 3b. PRZEŁĄCZNIKI I SUWAKI ══ */}
      <Tile>
        <TileHeader
          tytul="Przełączniki i suwaki"
          podtytul="jeden materiał z paskami zasobu — bez neonu i bez koloru spoza palety"
          poPrawej={<Plakietka intencja="uwaga">98 + 13 plików</Plakietka>}
        />
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-[14px]">Reasoning effort</span>
              <Switch checked={demoReasoning} onCheckedChange={setDemoReasoning} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-[14px]">Fast mode</span>
              <Switch checked={demoFast} onCheckedChange={setDemoFast} />
            </label>
          </div>

          <div className="space-y-3">
            {([['Inteligencja', demoInteligencja, setDemoInteligencja],
               ['Efektywność kosztu', demoKoszt, setDemoKoszt]] as const).map(([etykieta, wartosc, ustaw]) => (
              <div key={etykieta}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[14px] text-foreground">{etykieta}</span>
                  <span className="text-[14px] tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">{wartosc}</span>/10
                  </span>
                </div>
                <Slider value={[wartosc]} min={0} max={10} step={1}
                  onValueChange={([v]) => ustaw(v)} />
              </div>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Przełącznik siedzi w <strong className="text-foreground">98 plikach</strong>, suwak
            w 13 — dlatego oba są przerobione u źródła (`ui/switch.tsx`, `ui/slider.tsx`),
            a nie jako kolejny wariant obok starego. Suwak miał wcześniej wpisane na sztywno
            `via-blue-400` i trzy neonowe poświaty, więc świecił tym samym błękitem
            we wszystkich dziewięciu motywach. Tor wyłączonego przełącznika bierze
            <strong className="text-foreground"> `--input`</strong>, bo tylko ten token jest ciemny
            na ciemnym motywie i średnio szary na jasnym — biały uchwyt ma wtedy kontrast w obie
            strony. Przytrzymaj przełącznik: uchwyt ściska się w bok, tak jak w iOS.
          </p>
        </div>
      </Tile>

      {/* ══ 4. POLA ══ */}
      <Tile>
        <TileHeader
          tytul="Pola tekstu"
          podtytul="44 px wysokości — dotychczasowe 32 px były poniżej progu dotyku"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Pole etykieta="Nazwa pakietu" placeholder="np. Startowy" defaultValue="Pakiet Premium" required />
          <PoleLiczbowe
            etykieta="Cena w Byte"
            wartosc={cena}
            onZmiana={setCena}
            min={0}
            max={100000}
            ikona={Coins}
            jednostka="⟠"
            podpowiedz="Przytrzymaj strzałkę — im dłużej, tym szybciej."
          />
          <Pole etykieta="Adres e-mail" defaultValue="michal@" blad="To nie jest poprawny adres e-mail." />
          <Pole etykieta="Identyfikator" defaultValue="pkg_premium_2026" disabled podpowiedz="Nadawany automatycznie." />

          <div className="md:col-span-2">
            <Szukajka wartosc={szukane} onZmiana={setSzukane} skrot="⌘K"
                      placeholder="Szukaj w notatkach, zadaniach, kalendarzu…" />
          </div>

          <div className="md:col-span-2">
            <Obszar etykieta="Opis" value={opis} onChange={(e) => setOpis(e.target.value)}
                    maxLength={160} zLicznikiem podpowiedz="Widoczny na karcie produktu w sklepie." />
          </div>

          <div className="flex items-end gap-2 md:col-span-2">
            <Pole rozmiar="zwarte" ikona={Search} placeholder="Wariant zwarty — 36 px, do tabel" className="flex-1" />
            <Plakietka intencja="neutralna" rozmiar="srednia">tylko tam, gdzie palec nie sięga</Plakietka>
          </div>
        </div>
      </Tile>

      {/* ══ 4b. PUŁAPKI JASNEGO MOTYWU ══
          Zabezpieczenie, nie ozdoba. Każdy wzorzec, który psuje jasny motyw,
          stoi tu OBOK swojego poprawnego odpowiednika. Po przełączeniu na Jasny
          albo Śnieżny lewa kolumna znika, prawa zostaje — i to jest jedyny
          dowód, jakiego potrzeba, żeby nie wpisać `text-white` po raz 1741. */}
      <Tile intencja="krytyczna">
        <TileHeader
          intencja="krytyczna"
          tytul="Pułapki jasnego motywu"
          podtytul="lewa kolumna znika na jasnym — prawa działa na wszystkich 9"
          poPrawej={<Plakietka intencja="krytyczna">4 900+ użyć</Plakietka>}
        />

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Zmierzone 01.08.2026 w całym <span className="font-mono">src</span>:{' '}
          <strong className="text-foreground">text-white 1740</strong> użyć w 105 plikach,{' '}
          <strong className="text-foreground">border-white 812</strong>,{' '}
          <strong className="text-foreground">bg-white 685</strong>,{' '}
          <strong className="text-foreground">bg-black 438</strong>. Do tego{' '}
          <strong className="text-foreground">378</strong> łatek{' '}
          <span className="font-mono">!important</span> dla{' '}
          <span className="font-mono">nextbyte-light</span> w{' '}
          <span className="font-mono">index.css</span> — jasny motyw stoi dziś na obejściach,
          nie na tokenach. <strong className="text-foreground">Przełącz motyw na Jasny</strong>{' '}
          i porównaj kolumny.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PULAPKI.map((p) => (
            <React.Fragment key={p.co}>
              <div className="rounded-xl border border-destructive/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-destructive">
                  ✕ {p.co} — zaszyte
                </p>
                <div className={`flex h-12 items-center justify-center rounded-lg border ${p.zleKlasy}`}>
                  <span className="font-mono text-[11px]">{p.zle}</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                  ✓ {p.co} — z tokenów
                </p>
                <div className={`flex h-12 items-center justify-center rounded-lg border ${p.dobreKlasy}`}>
                  <span className="font-mono text-[11px]">{p.dobre}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Tile>

      {/* ══ 5. PASEK PRZEWIJANIA ══ */}
      <Tile>
        <TileHeader
          tytul="Pasek przewijania"
          podtytul="dzisiejszy jest zaszytą bielą — na jasnych motywach znika"
          poPrawej={<Plakietka intencja="krytyczna">błąd motywu</Plakietka>}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Dziś — <span className="text-destructive">4 px, biel na sztywno</span>
            </p>
            <div className="custom-scrollbar h-44 overflow-y-auto rounded-xl border border-border bg-background/40 p-3">
              {Array.from({ length: 14 }, (_, i) => (
                <p key={i} className="border-b border-border/40 py-2 text-xs text-muted-foreground last:border-0">
                  Wiersz treści numer {i + 1}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              <code className="font-mono text-[10px]">rgba(255,255,255,0.12)</code> — przełącz motyw
              na Jasny albo Śnieżny i pasek przestaje być widoczny.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Propozycja — <span className="text-primary">z tokenów, szeroki chwyt</span>
            </p>
            <div className="nb-pasek h-44 overflow-y-auto rounded-xl border border-border bg-background/40 p-3">
              {Array.from({ length: 14 }, (_, i) => (
                <p key={i} className="border-b border-border/40 py-2 text-xs text-muted-foreground last:border-0">
                  Wiersz treści numer {i + 1}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              Ścieżka 12 px (łatwo trafić), uchwyt wygląda na 6 px. Kolor liczony
              od <code className="font-mono text-[10px]">--foreground</code>, więc odwraca się z motywem.
              Pod kursorem jaśnieje, przy przeciąganiu wchodzi w kolor motywu.
            </p>
          </div>
        </div>
      </Tile>

      {/* ══ 6. TYPOGRAFIA ══ */}
      <Tile>
        <TileHeader
          tytul="Skala tekstu"
          podtytul="rytm już istniał w praktyce — tu jest nazwany"
        />
        <div className="space-y-3">
          {([
            ['Nagłówek sekcji', 'font-heading text-[28px] font-semibold tracking-tight text-foreground', 'strona, okno, duży kafelek'],
            ['Tytuł karty', 'font-heading text-[16px] font-semibold tracking-tight text-foreground', 'nazwa sekcji, karty, okna'],
            ['Treść', 'text-[14px] text-card-foreground', 'zdania do przeczytania'],
            ['Treść drugoplanowa', 'text-[14px] text-muted-foreground', 'opis, podpowiedź, tło'],
            ['Etykieta', 'text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground', 'nazwa danych, plakietka, licznik'],
            ['Liczba', 'text-[28px] font-semibold tabular-nums text-foreground', 'zawsze tabular-nums — inaczej skacze'],
          ] as const).map(([nazwa, klasy, kiedy]) => (
            <div key={nazwa} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 pb-3 last:border-0">
              <span className={`${klasy} min-w-[14rem]`}>{nazwa}</span>
              <span className="text-[10px] text-muted-foreground/70">{kiedy}</span>
              <code className="ml-auto font-mono text-[10px] text-muted-foreground/60">{klasy}</code>
            </div>
          ))}
        </div>
      </Tile>


      {/* ══ 6. STANY I ELEMENTY DOROBIONE POD PANEL GŁÓWNY I KALENDARZ ══ */}
      <Tile>
        <TileHeader
          tytul="Postęp, wybór, ładowanie, awatar"
          podtytul="dorobione po inwentaryzacji Panelu Głównego i Kalendarza — bez nich nie da się ich przepisać"
          poPrawej={<Plakietka intencja="akcent">4 braki</Plakietka>}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Postęp — ile zrobione
            </p>
            <Postep krokow={5} zrobione={1} etykieta="Onboarding" opis="1 z 5 kroków" />
            <Postep krokow={8} zrobione={5} etykieta="Zadania eventu" opis="5 z 8" />
            <Postep krokow={8} zrobione={8} etykieta="Ukończone" opis="8 z 8" />
            <Postep procent={41} etykieta="Wgrywanie pliku" opis="41%" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Kroki policzalne dostają <strong className="text-foreground">tyle segmentów, ile jest kroków</strong> —
              „1 z 5" widać bez czytania liczby. Ostatni pasek jest ciągły, bo wgrywanie pliku ma procenty,
              ale nie ma „kroku trzeciego z pięciu".
              To <strong className="text-foreground">nie</strong> jest Pasek zasobu: tam im więcej, tym gorzej
              (limit), tutaj im więcej, tym lepiej.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Pole wyboru
            </p>
            <PoleWyboru etykieta="Przypomnij o wydarzeniu" podpowiedz="15 minut przed rozpoczęciem" defaultChecked />
            <PoleWyboru etykieta="Powtarzaj co tydzień" />
            <PoleWyboru etykieta="Zablokowane ustawienie" podpowiedz="wymaga uprawnień zarządu" disabled />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Szkielet ładowania
            </p>
            <Szkielet wierszy={3} />
            <div className="flex items-center gap-3">
              <Szkielet wierszy={1} ksztalt="kolo" />
              <div className="flex-1"><Szkielet wierszy={2} /></div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Awatar
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Awatar nazwa="Michał Pętala" rozmiar="duzy" />
              <Awatar nazwa="Michał Pętala" />
              <Awatar nazwa="Anthropic" rozmiar="maly" wyrozniony />
              <Awatar nazwa="OpenAI" rozmiar="maly" />
              <Awatar nazwa="xAI" rozmiar="maly" />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Ten sam komponent dla użytkownika i dla dostawcy modelu — inicjały liczone z nazwy,
              nie podawane ręcznie, żeby jedno miejsce nie pokazywało „MP", a drugie „M".
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border">
          <PustyStan
            ikona={CalendarDays}
            tytul="Brak wydarzeń w tym tygodniu"
            opis="Wydarzenia z Kalendarza i terminy zadań pojawią się tutaj automatycznie."
            akcja={<Plakietka intencja="akcent" rozmiar="srednia">tu stanie przycisk</Plakietka>}
          />
        </div>
      </Tile>

      {/* ══ 7. ROZMOWA — powłoka dialogu ══ */}
      <Tile>
        <TileHeader
          tytul="Rozmowa"
          podtytul="dymek i wejście czatu — 15 miejsc pisze dziś własny dymek, 12 własne wejście"
          poPrawej={<Plakietka intencja="krytyczna">27 implementacji</Plakietka>}
        />

        <div className="space-y-3">
          <Wiadomosc nadawca="system">Model zmieniony na Claude Opus</Wiadomosc>

          <Wiadomosc nadawca="uzytkownik" czas="12:04">
            Zrób mi zestawienie kosztów AI za ostatnie 30 dni i powiedz, co rośnie najszybciej.
          </Wiadomosc>

          <Wiadomosc
            nadawca="ai"
            nazwa="Claude Opus"
            czas="12:04"
            koszt="⟠ 23"
            akcje={
              <>
                <AkcjaWiadomosci ikona={Copy} etykieta="Kopiuj" />
                <AkcjaWiadomosci ikona={RefreshCw} etykieta="Powtórz odpowiedź" />
                <AkcjaWiadomosci ikona={Volume2} etykieta="Odczytaj na głos" />
              </>
            }
          >
            Koszt AI za 30 dni to <strong className="text-foreground">$24,51</strong> — o 31% więcej
            niż w poprzednim okresie. Najszybciej rośnie generowanie wideo.
          </Wiadomosc>

          <Wiadomosc nadawca="ai" nazwa="Claude Opus" pisze>
            Sprawdzam jeszcze rozbicie na modele
          </Wiadomosc>

          <WejscieCzatu
            wartosc={prompt}
            onZmiana={setPrompt}
            onWyslij={() => setPrompt('')}
            placeholder="Napisz wiadomość… (Enter wysyła, Shift+Enter łamie wiersz)"
            naglowek={
              <ListaWyboru>
                <PastylkaModelu ikona={Rocket} nazwa={wybrany.nazwa} koszt={`⟠ ${wybrany.cena}`} />
                <ListaTresc {...MENU_NAD_WEJSCIEM} className="min-w-[20rem]">
                  <ListaGrupa>Modele</ListaGrupa>
                  {MODELE.map((m) => (
                    <ListaPozycja
                      key={m.id}
                      monogram={m.monogram}
                      nazwa={m.nazwa}
                      opis={m.opis}
                      meta={`⟠ ${m.cena}`}
                      wybrana={m.id === model}
                      onWybor={() => setModel(m.id)}
                      szczegoly={<SzczegolyModelu m={m} />}
                    />
                  ))}
                </ListaTresc>
              </ListaWyboru>
            }
            tryby={
              <>
                <PastylkaTrybu ikona={FileText} wlaczony={tryb === 'dokumenty'}
                  onClick={() => setTryb(tryb === 'dokumenty' ? null : 'dokumenty')}>
                  Dokumenty
                </PastylkaTrybu>
                <PastylkaTrybu ikona={ImageIcon} wlaczony={tryb === 'obrazy'}
                  onClick={() => setTryb(tryb === 'obrazy' ? null : 'obrazy')}>
                  Obrazy
                </PastylkaTrybu>
                <PastylkaTrybu ikona={Globe} wlaczony={tryb === 'web'}
                  onClick={() => setTryb(tryb === 'web' ? null : 'web')}>
                  WEB
                </PastylkaTrybu>
                <PastylkaTrybu ikona={Sparkles} zablokowany
                  tytul="Research niedostępny dla tego modelu">
                  Research
                </PastylkaTrybu>
              </>
            }
            narzedzia={
              <>
                <PrzyciskNarzedzia ikona={Paperclip} etykieta="Załącz plik" />
                <PrzyciskNarzedzia ikona={Mic} etykieta="Nagraj wiadomość" />
                <PrzyciskNarzedzia ikona={Phone} etykieta="Rozmowa głosowa" />
                <PrzyciskNarzedzia ikona={Wand2} etykieta="Ulepsz prompt" />
              </>
            }
            akcje={
              <>
                <ListaWyboru>
                  <PastylkaTokenow>12 480 TOK</PastylkaTokenow>
                  <ListaTresc {...MENU_NAD_WEJSCIEM} align="end" className="min-w-[18rem]">
                    <ListaGrupa>Co zajmuje kontekst</ListaGrupa>
                    <ListaPozycja nazwa="Historia rozmowy" opis="38 wiadomości" meta="8 210" />
                    <ListaPozycja nazwa="Załączone pliki"  opis="2 dokumenty"   meta="3 480" />
                    <ListaPozycja nazwa="Instrukcja systemowa" opis="stała"     meta="790" />
                    <ListaRozdzielacz />
                    <ListaPozycja nazwa="Limit modelu" opis="Grok 4.3 — 1 000 000" meta="1,2%" />
                  </ListaTresc>
                </ListaWyboru>
                <PrzyciskWyslij koszt={5} zablokowany={!prompt.trim()} onClick={() => setPrompt('')} />
              </>
            }
          />

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Dwie strony rozmowy mają <strong className="text-foreground">dwa różne materiały</strong>: wiadomość
            użytkownika to decyzja — pełna, nieprzezroczysta powierzchnia w akcencie; odpowiedź AI to szkło,
            bo jest treścią generowaną, którą się czyta i ocenia. Różnicę widać kątem oka, bez czytania.
            Wiadomość systemowa nie jest dymkiem, tylko adnotacją — nikt jej nie „powiedział".
          </p>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Wejście przeniesione z <code className="text-foreground">chat/ChatInput.tsx</code> —
            układ 1:1, ale bez trzech rzeczy, które tam zmierzyłem:{' '}
            <strong className="text-foreground">5×</strong> przepisany ręcznie ten sam blob klas
            pastylki, <strong className="text-foreground">33</strong> użycia kolorów spoza motywu
            (pomarańcz, fiolet, cyjan — nie ma ich w żadnym z 14 motywów) i{' '}
            <strong className="text-foreground">14× cel dotykowy 28 px</strong> w rzędzie leżącym tuż
            nad krawędzią ekranu, gdzie kciuk jest najmniej dokładny. Tutaj: jeden komponent, kolor
            z motywu, 36–40 px na telefonie. Szkło jest też <em>zawsze</em>, a nie tylko przy
            włączonym trybie — materiał nie jest stanem, stanem jest kolor.
          </p>
        </div>
      </Tile>

    </div>
  );
};
