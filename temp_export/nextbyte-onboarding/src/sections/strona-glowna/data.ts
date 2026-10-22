import {
  Brain, Camera, NotebookPen, Workflow, Cpu, Zap, Users, MessageSquare,
  Shield, Sparkles, Layers, Clock, Building2, Lock, Gauge, GitBranch,
  Rocket, BadgeCheck, Headphones, KeyRound, ServerCog, FileStack,
  Calendar, Mic, Bot, Repeat, CheckCircle2, Radar, ImagePlus, FileSearch,
  MessagesSquare, ZoomIn, LayoutGrid, Database, HardDrive,
  Coins, ShoppingCart, GraduationCap, Globe, Search, Upload, Wand2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AKCENT } from '@/sections/wspolne/shared'

/* ══════════════ MODUŁY PLATFORMY (AUTENTYCZNE I PRZEKONYWUJĄCE) ══════════════ */
export const MODULY = [
  {
    id: 'chat',
    icon: Brain,
    color: AKCENT.chat,
    tag: 'Chat AI & Pamięć',
    title: 'Chat AI z wszystkimi modelami i pamięcią',
    lead: 'GPT, Claude, Gemini i Grok w jednym oknie z pamięcią długoterminową, która zna Twoją firmę i projekty.',
    models: ['GPT', 'Claude', 'Gemini', 'Grok'],
    bullets: [
      'Zmieniasz model, kontekst zostaje: koniec z przeklejaniem promptów',
      'Pamięć AI: system pamięta Twój styl, produkty i wcześniejsze ustalenia',
      'Analiza plików: dokumenty PDF, arkusze Excel, kod i obrazy w jednym oknie',
      'Prywatny tryb lokalny (Ollama / LM Studio) — dane w 100% na Twoim dysku',
    ],
    metryki: [
      { label: 'Dostępne modele', value: 'Wszystkie topowe silniki' },
      { label: 'Pamięć', value: 'Długoterminowa AI' },
      { label: 'Prywatność', value: 'Opcja offline' },
    ],
  },
  {
    id: 'studio',
    icon: Camera,
    color: AKCENT.studio,
    tag: 'Zdjęcia & Wideo AI',
    title: 'Najlepsze zdjęcia i wideo AI',
    lead: 'Fotorealistyczne grafiki produktowe 4K, retusz oraz automatyczna zamiana kadrów i promptów w płynne klipy wideo.',
    models: ['Nano Banana', 'Kling HD', 'PixVerse', 'MiniMax'],
    bullets: [
      'Dostęp do topowych silników obrazu i wideo bez płacenia osobnych abonamentów',
      'Generowanie packshotów 4K, podmiana obiektów, Upscale i spójność postaci',
      'Tworzenie wideo z tekstu i obrazu do social media oraz reklam',
      'Eksport w formatach WebP, PNG i MP4 z pełnymi prawami komercyjnymi',
    ],
    metryki: [
      { label: 'Silniki', value: 'Nano Banana · Kling · PixVerse' },
      { label: 'Jakość', value: '4K Hiperrealizm' },
      { label: 'Prawa autorskie', value: '100% komercyjne' },
    ],
  },
  {
    id: 'assistant',
    icon: Bot,
    color: AKCENT.auto,
    tag: 'Asystent AI',
    title: 'Jeden asystent do całej Twojej pracy',
    lead: 'Ten sam asystent w czacie, notatkach, kalendarzu i tablicach. Działa tam, gdzie akurat pracujesz.',
    models: ['Claude Thinking', 'GPT-5.4 Auto', 'Agentic Loop'],
    bullets: [
      'Obecny w każdym module platformy, bez przełączania okien',
      'Tworzy notatki i dokumenty z Twoich ustaleń',
      "Sam wpisuje spotkania i deadline'y do kalendarza",
      'Rozumie kontekst Twojej pracy',
    ],
    metryki: [
      { label: 'Tryb pracy', value: 'W całej platformie' },
      { label: 'Zadania', value: 'Auto-dyspozycja' },
      { label: 'Kalendarz', value: 'Dwukierunkowy sync' },
    ],
  },
  {
    id: 'research',
    icon: Radar,
    color: AKCENT.chat,
    tag: 'Deep Research',
    title: 'Research w parę minut',
    lead: 'Przeszukuje cały internet i dziesiątki źródeł naraz, weryfikuje fakty i składa gotowy raport w parę minut.',
    models: ['Deep Search', 'Live Web', 'Cross-Validation'],
    bullets: [
      'Przeszukuje cały internet i dziesiątki źródeł naraz',
      'Każdy fakt sprawdzony w kilku źródłach',
      'Wnioski i tabele zamiast ściany linków',
      'Eksport raportów do PDF, Word i Markdown',
    ],
    metryki: [
      { label: 'Zasięg', value: 'Cały internet' },
      { label: 'Weryfikacja', value: 'Cross-model validation' },
      { label: 'Czas', value: 'Parę minut' },
    ],
  },
  {
    id: 'creator',
    icon: Rocket,
    color: AKCENT.chat,
    tag: 'Akademia & Twórcy',
    title: 'Akademia AI i Panel Twórcy',
    lead: 'Ucz się praktycznej wiedzy z gotowych kursów od twórców albo publikuj własne materiały i na nich zarabiaj.',
    models: ['Kursy AI', 'Szablony', 'Marketplace'],
    bullets: [
      'Zero teorii, kursy skupione na efektywności',
      'Gotowe szablony i prompty zamiast suchej teorii',
      'Zarabiasz na tym, co już umiesz: sprzedaż w Panelu Twórcy',
      'Wypłata zysków w PLN z pełną fakturą VAT 23%',
    ],
    metryki: [
      { label: 'Zarabianie', value: 'Monetyzacja wiedzy' },
      { label: 'Edukacja', value: 'Akademia krok po kroku' },
      { label: 'Rozliczenia', value: 'PLN & Faktura VAT' },
    ],
  },
  {
    id: 'workspace',
    icon: Layers,
    color: AKCENT.notes,
    tag: 'Workspace',
    title: 'Zintegrowany Workspace',
    lead: 'Tablice wizualne, notatki, kalendarz i zadania w jednym panelu. Wynik z jednego narzędzia działa w kolejnym.',
    models: ['Tablice', 'Notatki AI', 'Kalendarz', 'Kanban'],
    bullets: [
      'Tablice: nieskończone płótno do storyboardów, map myśli i szkiców',
      'Notatki AI: dokumenty, które rozmawiają z czatem i bazą wiedzy',
      'Kalendarz & Kanban: synchronizacja projektów sterowana asystentem',
      'Wspólny kontekst danych zasilający każdy element systemu',
    ],
    metryki: [
      { label: 'Narzędzia', value: 'Tablice · Notatki · Kalendarz' },
      { label: 'Synchronizacja', value: 'W czasie rzeczywistym' },
      { label: 'Kontekst', value: '100% zintegrowany' },
    ],
  },
] as const

/* ══════════════ TECHNOLOGIA I INFRASTRUKTURA (NAPĘDZAJĄ NAS) ══════════════ */
export const TECH_PARTNERZY = [
  'GOOGLE', 'OPENAI', 'ANTHROPIC', 'XAI', 'MISTRAL', 'ELEVENLABS',
  'RUNWARE', 'SUPABASE', 'STRIPE', 'VERCEL', 'CLOUDFLARE', 'TIPTAP',
] as const

/* ══════════════ TRZY FILARY WARTOŚCI DLA BIZNESU ══════════════ */
export const WARTOSCI_FILARY = [
  {
    tag: '// SELEKCJA',
    title: 'Tylko najlepsze modele',
    desc: 'Odrzucamy marketingowy szum i testujemy dziesiątki modeli miesięcznie. Dostajesz dostęp wyłącznie do modeli przynoszących wymierną wartość',
    accent: '#70BEFA',
  },
  {
    tag: '// GOTOWE WZORCE',
    title: 'Praktyczne schematy zamiast teorii',
    desc: 'Przetestowane procedury pod marketing, sprzedaż, finanse i audyty. Wprowadzasz kontekst swojej firmy i od razu odbierasz dopracowany raport lub kreację.',
    accent: '#C084FC',
  },
  {
    tag: '// CAŁE PRZEPŁYWY',
    title: 'Zintegrowane procesy zamiast chaosu narzędzi',
    desc: 'Łączymy generowanie tekstu, grafikę 4K, notatki i automatyzacje w jeden ciągły proces, który Twój zespół wdroży w kilkanaście minut.',
    accent: '#34D399',
  },
] as const

/* ══════════════ TELEMETRIA / KLUCZOWE WSKAŹNIKI ══════════════ */
export const STATY = [
  { value: '10+', label: 'Modeli AI w 1 panelu', sub: 'Gemini · GPT · Claude · Grok · Mistral', icon: Brain },
  { value: '1', label: 'Subskrypcja', sub: 'Zamiast pięciu osobnych', icon: Layers },
  { value: '100%', label: 'Po polsku', sub: 'Interfejs, prompty, wsparcie', icon: Shield },
  { value: '0 zł', label: 'Modele lokalne', sub: 'Ollama i LM Studio bez opłat', icon: Sparkles },
] as const

export const KROKI = [
  {
    krok: '01',
    title: 'Zakładasz konto za 0 zł',
    desc: 'Rejestracja w 30 sekund bez karty kredytowej. Narzędzia do organizacji pracy bez opłat.',
  },
  {
    krok: '02',
    title: 'Wybierasz zadanie i model AI',
    desc: 'Chat, Studio grafik 4K, Notatki lub automatyzacja. Dobierasz model dopasowany do bieżącego zadania.',
  },
  {
    krok: '03',
    title: 'Płacisz tylko za realne zużycie',
    desc: 'Jasny koszt w Byte, a niewykorzystana pula przechodzi na kolejny miesiąc.',
  },
] as const

/* ══════════════ PORÓWNANIE Z KONKURENCJĄ ══════════════ */
export const POROWNANIE = {
  kolumny: ['NextByte', 'ChatGPT Plus', 'Midjourney Std', 'Notion AI'],
  wiersze: [
    { f: 'Chat z wieloma modelami (GPT-5.4, Claude, Gemini, Grok)', v: [true, 'Tylko GPT-5.4', false, 'Tylko OpenAI'] },
    { f: 'Generowanie grafik 4K (Nano Banana, GPT Image 2.0)', v: [true, 'DALL-E (limit)', true, false] },
    { f: 'Generowanie wideo AI (Runware, Kling)', v: [true, false, false, false] },
    { f: 'Głos AI i transkrypcja spotkań', v: [true, 'podstawowy', false, 'Meeting Notes'] },
    { f: 'Notatki AI i semantyczna baza wiedzy', v: [true, false, false, true] },
    { f: 'Kanban, zadania i Kalendarz AI', v: [true, false, false, true] },
    { f: 'Lokalny AI offline — zero transferu (Ollama / LM Studio)', v: [true, false, false, false] },
    { f: 'Serwery w UE · pełna zgodność z RODO', v: [true, false, false, false] },
    { f: 'Płatność w PLN · polska faktura VAT 23%', v: [true, false, false, false] },
    { f: 'Cena miesięczna', v: ['od 0 zł', '~80 zł ($20)', '~120 zł ($30)', '~95 zł ($24/os.)'] },
  ],
} as const

/* ══════════════ CENNIK I PLANY — treść i ceny 1:1 z cennika produkcyjnego ══════════════ */

/** Ton plakietki przy cesze planu. Kolory idą za produkcją: niebieski = pojemność/limit,
 *  zielony = przywilej techniczny, różowy = limit ekskluzywny, fiolet = tryb AI. */
export type TonPlakietki = 'blue' | 'green' | 'pink' | 'violet' | 'ghost'

export type Cecha = {
  t: string
  icon: LucideIcon
  badge?: { t: string; ton: TonPlakietki }
  /** Wartość zależna od wybranego progu — `{v}` w `t` zastępuje animowana liczba. */
  dyn?: 'pula' | 'tokeny' | 'obrazy' | 'glos'
  /** Funkcja odblokowana dopiero w tym planie — wyróżniona na karcie. */
  nowa?: boolean
}

/* Każdy plan pokazuje TYLKO to, co dokłada względem niższego (nagłówek
   "Wszystko z X, plus:"). Bez bezwzględnych ilości (Byte, GB, tokeny) — te są
   w panelu zużycia, a tutaj nie da się ich zsumować z niższym planem.
   Przewagi ilościowe opisane względnie (3×, 4× więcej), więc widać wzrost. */
/* Funkcje przeniesione z nextbyte.space/cennik (bez Pętli AI i wsparcia,
   limity plików/kontekstu/GB są w panelu zużycia). */
const CECHY_BEZPLATNY: Cecha[] = [
  { t: '**Płacisz** tylko za zużycie', icon: Coins },
  { t: '**Chat AI**', icon: Sparkles },
  { t: '**Tryb Ultra** AI', icon: Cpu },
  { t: '**Studio Zdjęć**', icon: ImagePlus },
  { t: '**Personalny Asystent**', icon: Bot },
  { t: '**PromptEx**', icon: Wand2 },
  { t: '**Kalendarz**, Zadania, Notatki', icon: Calendar },
  { t: '**Listy** zakupowe', icon: ShoppingCart },
  { t: '**Szyfrowanie** danych', icon: Lock },
]
const CECHY_LITE: Cecha[] = [
  { t: '**Wszystkie modele** AI', icon: Globe },
  { t: '**Pamięć** AI', icon: Brain },
  { t: '**Lokalny AI** offline', icon: Database },
  { t: '**Kalendarz AI** i Zadania', icon: Calendar },
  { t: '**Studio Zdjęć AI**', icon: ImagePlus },
  { t: '**Akademia** Premium', icon: GraduationCap },
  { t: '**Miesięczne** odnowienie puli', icon: Repeat },
]
const CECHY_PREMIUM: Cecha[] = [
  { t: '**Deep Research** — raporty AI', icon: Search },
  { t: '**Wybór progu** puli Byte', icon: Gauge },
  { t: '**Taniej** za Byte na wyższych progach', icon: Coins },
  { t: '**3×** równoległe generacje', icon: Layers },
  { t: '**Więcej miejsca** w Private Cloud', icon: HardDrive },
]
const CECHY_ULTIMATE: Cecha[] = [
  { t: '**Priorytetowa** kolejka zapytań', icon: Clock },
  { t: '**5×** równoległe generacje', icon: Layers },
  { t: '**Wczesny dostęp** do nowości', icon: Rocket },
  { t: '**Ekskluzywne** modele AI', icon: Sparkles },
  { t: '**Enhancer** zdjęć 2× bez limitu', icon: ZoomIn },
  { t: '**Najtańszy** Byte ze wszystkich planów', icon: Coins },
  { t: '**Największy** kontekst i pliki', icon: Upload },
]

export type Plan = {
  id: string
  nazwa: string
  opis: string
  kolor: string
  polecany: boolean
  /** Stała cena miesięczna — tylko Bezpłatny (0) i Lite (27,90) jej używają. */
  cena: number | null
  /** Progi puli Byte — tylko Premium i Ultimate mają suwak wyboru progu. */
  progi: { byte: number; miesiecznie: number }[] | null
  /** Stała pula Byte dla planu bez progów (Lite = 140). */
  stalaPula: number | null
  notkaTytul: string | null
  notka: string | null
  /** Podpis pod ceną — tylko plan bezpłatny ma własny (reszta liczy się z okresu). */
  podCena: string | null
  unlimited: { label: string; icon: LucideIcon }[]
  /** Prywatna przestrzeń dyskowa (Private Cloud) — osobny wiersz w panelu
   *  zużycia, w tym samym stylu co tokeny/grafiki (wartość + etykieta + ikona). */
  cloudStorage: string
  /** Mnożnik równoległych generacji obrazów — null gdy plan tego nie ma (Free). */
  rownolegleGeneracje: string | null
  /** Kontekst plików w czacie AI — wiersz w panelu zużycia. */
  kontekst: string
  /** Limit rozmiaru przesyłanego pliku. */
  pliki: string
  /** Nazwa planu niżej w hierarchii — Premium/Ultimate pokazują wtedy
   *  "Wszystko z {dziedziczyZ}, plus:" zamiast pełnej listy od zera, a
   *  `cechy` niżej zawiera WYŁĄCZNIE nowe pozycje względem tego planu. */
  dziedziczyZ?: string
  cechyNaglowek: string
  cechy: Cecha[]
  cta: string
}

export const PLANY: Plan[] = [
  {
    id: 'free',
    nazwa: 'Bezpłatny',
    opis: 'Start z platformą NextByte',
    kolor: AKCENT.neutral,
    polecany: false,
    cena: 0,
    progi: null,
    stalaPula: null,
    notkaTytul: 'Bez miesięcznej puli',
    notka: 'Operacje AI opłacasz z doładowanych paczek Byte — płacisz tylko za to, co zużyjesz.',
    podCena: 'Płacisz tylko za zużyte Byte z paczek',
    unlimited: [
      { label: 'Chat AI', icon: MessagesSquare },
      { label: 'Kalendarz', icon: Calendar },
      { label: 'Zadania', icon: CheckCircle2 },
      { label: 'Notatki', icon: NotebookPen },
      { label: 'System Cloud', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cloudStorage: '1 GB',
    rownolegleGeneracje: '1×',
    kontekst: '50k',
    pliki: '20 MB',
    cechyNaglowek: 'W planie Bezpłatnym:',
    cechy: CECHY_BEZPLATNY,
    cta: 'Zacznij za darmo',
  },
  {
    id: 'lite',
    nazwa: 'Lite',
    opis: 'Wejście w płatny plan',
    kolor: AKCENT.chat,
    polecany: false,
    cena: 27.9,
    progi: null,
    stalaPula: 140,
    notkaTytul: null,
    notka: 'Stała pula — bez progów do wyboru.',
    podCena: null,
    unlimited: [
      { label: 'Chat AI', icon: MessagesSquare },
      { label: 'Kalendarz', icon: Calendar },
      { label: 'Zadania', icon: CheckCircle2 },
      { label: 'Notatki', icon: NotebookPen },
      { label: 'System Cloud', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cloudStorage: '5 GB',
    rownolegleGeneracje: '1×',
    kontekst: '100k',
    pliki: '47 MB',
    dziedziczyZ: 'Bezpłatnego',
    cechyNaglowek: 'W planie Lite:',
    cechy: CECHY_LITE,
    cta: 'Wybierz Lite',
  },
  {
    id: 'premium',
    nazwa: 'Premium',
    opis: 'Pełny dostęp do funkcji AI',
    kolor: AKCENT.chat,
    polecany: false,
    cena: null,
    progi: [
      { byte: 495, miesiecznie: 99 },
      { byte: 950, miesiecznie: 179 },
      { byte: 1500, miesiecznie: 269 },
    ],
    stalaPula: null,
    notkaTytul: null,
    notka: null,
    podCena: null,
    unlimited: [
      { label: 'Chat AI', icon: MessagesSquare },
      { label: 'Kalendarz', icon: Calendar },
      { label: 'Zadania', icon: CheckCircle2 },
      { label: 'Notatki', icon: NotebookPen },
      { label: 'System Cloud', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cloudStorage: '20 GB',
    rownolegleGeneracje: '3×',
    kontekst: '100k',
    pliki: '47 MB',
    dziedziczyZ: 'Lite',
    cechyNaglowek: 'W planie Premium:',
    cechy: CECHY_PREMIUM,
    cta: 'Wybierz Premium',
  },
  {
    id: 'ultimate',
    nazwa: 'Ultimate',
    opis: 'Maksymalne możliwości AI',
    kolor: AKCENT.chat,
    polecany: true,
    cena: null,
    progi: [
      { byte: 2450, miesiecznie: 349 },
      { byte: 4150, miesiecznie: 589 },
      { byte: 6070, miesiecznie: 849 },
    ],
    stalaPula: null,
    notkaTytul: null,
    notka: null,
    podCena: null,
    unlimited: [
      { label: 'Chat AI', icon: MessagesSquare },
      { label: 'Kalendarz', icon: Calendar },
      { label: 'Zadania', icon: CheckCircle2 },
      { label: 'Notatki', icon: NotebookPen },
      { label: 'System Cloud', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
      { label: 'Enhancer 2x', icon: ZoomIn },
    ],
    cloudStorage: '50 GB',
    rownolegleGeneracje: '5×',
    kontekst: '200k',
    pliki: '100 MB',
    dziedziczyZ: 'Premium',
    cechyNaglowek: 'W planie Ultimate:',
    cechy: CECHY_ULTIMATE,
    cta: 'Wybierz Ultimate',
  },
]

export const PLAN_MACIERZ: { kategoria?: string; f: string; v: (boolean | string)[] }[] = [
  // ── Rozliczenia i pula Byte ──
  {
    kategoria: 'Rozliczenia i pula Byte',
    f: 'Comiesięczna pula Byte',
    v: ['Z paczek', '140 Byte', '495 – 1500 Byte', '2450 – 6070 Byte'],
  },
  {
    f: 'Dostosowanie puli suwakiem',
    v: [false, 'Stała pula', '3 progi do wyboru', '3 progi do wyboru'],
  },
  {
    f: 'Miesięczne odnowienie puli',
    v: [false, true, true, true],
  },
  {
    f: 'Taniej za Byte na wyższych progach',
    v: [false, false, true, 'Najtaniej'],
  },
  {
    f: 'Równoległe generacje',
    v: ['1×', '1×', '3×', '5×'],
  },
  {
    f: 'Dokupienie paczek Byte w dowolnym momencie',
    v: [true, true, true, true],
  },
  {
    f: 'Ważność dokupionych paczek',
    v: ['12 miesięcy', '12 miesięcy', '12 miesięcy', '12 miesięcy'],
  },
  {
    f: 'Faktura VAT 23% dla firm',
    v: [true, true, true, true],
  },

  // ── Tokeny AI — per model, wg jego ceny input. Liczone jako
  //    pula Byte × ZL_ZA_BYTE / cena_1M — z PULI, nie z ceny planu, więc
  //    wyższe progi (tańszy Byte) dają proporcjonalnie więcej tokenów.
  //    Dla DOMYŚLNEGO (najniższego) progu, tak jak startują suwaki na
  //    kartach planów: Lite 140 ⟠, Premium 495 ⟠, Ultimate 2450 ⟠ ──
  {
    kategoria: 'Tokeny AI',
    f: 'Claude Sonnet 5',
    v: ['Z paczek', '~3,5 mln', '~12,4 mln', '~61,3 mln'],
  },
  {
    f: 'Claude Opus 5',
    v: ['Z paczek', '~1,4 mln', '~5 mln', '~24,5 mln'],
  },
  {
    f: 'GPT-5.6 Sol',
    v: ['Z paczek', '~1,7 mln', '~6 mln', '~29,8 mln'],
  },
  {
    f: 'GPT-5.6 Terra',
    v: ['Z paczek', '~3,5 mln', '~12,4 mln', '~61,3 mln'],
  },
  {
    f: 'GPT-5.6 Luna',
    v: ['Z paczek', '~35 mln', '~123,8 mln', '~612,5 mln'],
  },
  {
    f: 'Grok 4.3 (≤200k tok)',
    v: ['Z paczek', '~5,6 mln', '~19,8 mln', '~98 mln'],
  },
  {
    f: 'Grok 4.3 (>200k tok)',
    v: ['Z paczek', '~2,8 mln', '~9,9 mln', '~49 mln'],
  },
  {
    f: 'Gemini 3.1 Flash-Lite',
    v: ['Z paczek', '~28 mln', '~99 mln', '~490 mln'],
  },
  {
    f: 'Gemini 3.1 Flash Live',
    v: ['Z paczek', '~9,3 mln', '~33 mln', '~163,3 mln'],
  },
  {
    f: 'Gemini 3.1 Pro (≤200k tok)',
    v: ['Z paczek', '~3,5 mln', '~12,4 mln', '~61,3 mln'],
  },
  {
    f: 'Gemini 3.1 Pro (>200k tok)',
    v: ['Z paczek', '~1,8 mln', '~6,2 mln', '~30,6 mln'],
  },

  // ── Grafiki AI — liczba sztuk = pula Byte / koszt modelu, dla domyślnego
  //    (najniższego) progu: Lite 140 ⟠, Premium 495 ⟠, Ultimate 2450 ⟠ ──
  {
    kategoria: 'Grafiki AI',
    f: 'Z-Image Turbo · 1 ⟠',
    v: ['Z paczek', '~140', '~495', '~2450'],
  },
  {
    f: 'FLUX.2 Klein 9B · 1 ⟠',
    v: ['Z paczek', '~140', '~495', '~2450'],
  },
  {
    f: 'FLUX.2 Pro · 2 ⟠',
    v: ['Z paczek', '~70', '~247', '~1225'],
  },
  {
    f: 'Qwen Image 3.0 Pro · 2 ⟠',
    v: ['Z paczek', '~70', '~247', '~1225'],
  },
  {
    f: 'Kling Image O3 · 2 ⟠',
    v: ['Z paczek', '~70', '~247', '~1225'],
  },
  {
    f: 'Nano Banana 2 · 3 ⟠',
    v: ['Z paczek', '~46', '~165', '~816'],
  },
  {
    f: 'Seedream 5.0 Pro · 3 ⟠',
    v: ['Z paczek', '~46', '~165', '~816'],
  },
  {
    f: 'Ideogram 4.0 · 3 ⟠',
    v: ['Z paczek', '~46', '~165', '~816'],
  },
  {
    f: 'Nano Banana Pro · 4 ⟠',
    v: ['Z paczek', '~35', '~123', '~612'],
  },
  {
    f: 'Grok Imagine · 6 ⟠',
    v: ['Z paczek', '~23', '~82', '~408'],
  },
  {
    f: 'GPT Image 2 · 8 ⟠',
    v: ['Z paczek', '~17', '~61', '~306'],
  },

  // ── Funkcje — zgodne z listami na kartach planów (CECHY_*) ──
  {
    kategoria: 'Chat AI i asystent',
    f: 'Chat AI',
    v: ['Z paczek', true, true, true],
  },
  {
    f: 'Wszystkie modele AI',
    v: [false, true, true, true],
  },
  {
    f: 'Tryb Ultra AI',
    v: [true, true, true, true],
  },
  {
    f: 'Ekskluzywne modele AI',
    v: [false, false, false, true],
  },
  {
    f: 'Pamięć AI',
    v: [false, true, true, true],
  },
  {
    f: 'Personalny Asystent',
    v: [true, true, true, true],
  },
  {
    f: 'Deep Research — raporty AI',
    v: [false, false, true, true],
  },
  {
    f: 'PromptEx',
    v: [true, true, true, true],
  },
  {
    f: 'Kontekst plików w czacie',
    v: ['50k tok', '100k tok', '100k tok', '200k tok'],
  },

  {
    kategoria: 'Studio Zdjęć',
    f: 'Studio Zdjęć',
    v: ['Z paczek', true, true, true],
  },
  {
    f: 'Studio Zdjęć AI',
    v: [false, true, true, true],
  },
  {
    f: 'Enhancer zdjęć 2× bez limitu',
    v: [false, false, false, true],
  },
  {
    f: 'Priorytetowa kolejka zapytań',
    v: [false, false, false, true],
  },

  {
    kategoria: 'Organizacja pracy',
    f: 'Kalendarz, Zadania, Notatki',
    v: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
  },
  {
    f: 'Kalendarz AI i Zadania',
    v: [false, true, true, true],
  },
  {
    f: 'Listy zakupowe',
    v: [true, true, true, true],
  },
  {
    f: 'Akademia Premium',
    v: [false, true, true, true],
  },
  {
    f: 'Wczesny dostęp do nowości',
    v: [false, false, false, true],
  },

  {
    kategoria: 'Dane i prywatność',
    f: 'Private Cloud',
    v: ['1 GB', '5 GB', '20 GB', '50 GB'],
  },
  {
    f: 'System Cloud',
    v: ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
  },
  {
    f: 'Przesyłanie plików',
    v: ['20 MB', '47 MB', '47 MB', '100 MB'],
  },
  {
    f: 'Szyfrowanie danych',
    v: [true, true, true, true],
  },
  {
    f: 'Lokalny AI offline',
    v: [false, true, true, true],
  },
]

/** Sekcja "Jedna waluta. Pełna kontrola." — cztery kafle z narożnikami. */
export const BYTE_KARTY = [
  {
    tag: '// 01 / EKOSYSTEM',
    t: 'Wszystkie modele, jedna pula',
    d: 'Chat, obrazy i research z tych samych Byte.',
  },
  {
    tag: '// 02 / CYKL ROZLICZENIOWY',
    t: 'Pełna pula co miesiąc',
    d: 'Każdy okres rozliczeniowy zaczynasz od pełnej puli.',
  },
  {
    tag: '// 03 / DOŁADOWANIA',
    t: 'Doładowanie w każdej chwili',
    d: 'Bez zmiany planu, ważne 12 miesięcy.',
  },
  {
    tag: '// 04 / KOLEJNOŚĆ',
    t: 'Pełna kontrola',
    d: 'Stan Byte widzisz na bieżąco w panelu.',
  },
] as const

/* ══════════════ CENNIK B2B — PLANY DLA FIRM ══════════════ */
export type PlanB2B = {
  id: string
  nazwa: string
  opis: string
  rabat: string | null
  ekspert: boolean
  byte: number | null
  bytePerSeat: number | null
  seatMin: number
  seatMax: number
  seatDefault: number
  miesiecznie: number | null
  rocznie: number | null
  cechy: { grupa: string; pozycje: string[] }[]
  cta: string
}

export const PLANY_B2B: PlanB2B[] = [
  {
    id: 'zespol',
    nazwa: 'Zespół',
    opis: 'Dla agencji i małych zespołów tworzących szybciej',
    rabat: '18% taniej',
    ekspert: false,
    byte: 5000,
    bytePerSeat: 1000,
    seatMin: 2,
    seatMax: 9,
    seatDefault: 5,
    miesiecznie: 79,
    rocznie: 65,
    cechy: [
      {
        grupa: 'Workspace i współpraca',
        pozycje: [
          '2 do 9 osób we wspólnym workspace',
          'Dostęp do wszystkich funkcji i modeli',
          'Wspólna pula Byte dla całego zespołu',
          'Współdzielony workspace projektowy',
          'Wczesny dostęp do nowych funkcji AI',
        ],
      },
    ],
    cta: 'Wybierz Zespół Rocznie',
  },
  {
    id: 'skala',
    nazwa: 'Skala',
    opis: 'Zaprojektowany dla rosnących zespołów kreatywnych',
    rabat: '30% taniej',
    ekspert: false,
    byte: 12500,
    bytePerSeat: 2500,
    seatMin: 5,
    seatMax: 15,
    seatDefault: 5,
    miesiecznie: 245,
    rocznie: 150,
    cechy: [
      {
        grupa: 'Workspace i współpraca',
        pozycje: [
          '5 do 15 osób we wspólnym workspace',
          'Dostęp do wszystkich funkcji i modeli',
          'Wspólna pula Byte dla całego zespołu',
          'Współdzielony workspace projektowy',
          'Wczesny dostęp do nowych funkcji AI',
          'Priorytetowa kolejka wykonywania operacji',
        ],
      },
    ],
    cta: 'Wybierz Skalę Rocznie',
  },
  {
    id: 'enterprise',
    nazwa: 'Enterprise',
    opis: 'Dla organizacji potrzebujących personalizacji i bezpieczeństwa',
    rabat: null,
    ekspert: true,
    byte: null,
    bytePerSeat: null,
    seatMin: 1,
    seatMax: 1,
    seatDefault: 1,
    miesiecznie: null,
    rocznie: null,
    cechy: [
      {
        grupa: 'Bezpieczeństwo i SLA',
        pozycje: [
          'Indywidualna pula Byte dopasowana do skali firmy',
          'Dedykowane środowisko i separacja danych',
          'Dedykowany opiekun konta i priorytetowe SLA',
          'Wdrożenie on-premise lub dedykowana chmura prywatna',
          'Niestandardowe integracje API i logowanie SSO / SAML',
        ],
      },
    ],
    cta: 'Skontaktuj się z nami',
  },
]

/* ══════════════ KORZYŚCI DLA FIRM (B2B) ══════════════ */
export const B2B_KORZYSCI = [
  {
    icon: Users, color: AKCENT.chat,
    title: 'Wspólny budżet i kontrola kosztów',
    desc: 'Jedna pula Byte dla całej firmy. Przydzielasz indywidualne limity pracownikom i dokładnie wiesz, na które projekty pracują narzędzia AI.',
  },
  {
    icon: Lock, color: AKCENT.notes,
    title: '100% RODO i serwery w UE',
    desc: 'Dane przetwarzane są w europejskich centrach danych. Twoje pliki, umowy i zapytania nigdy nie są wykorzystywane do trenowania publicznych modeli.',
  },
  {
    icon: ServerCog, color: AKCENT.studio,
    title: 'Prywatny tryb lokalny dla wrażliwych danych',
    desc: 'Możliwość podpięcia lokalnych modeli (Ollama / LM Studio) dla dokumentacji prawnej, finansowej i medycznej — zero transferu do internetu.',
  },
  {
    icon: BadgeCheck, color: AKCENT.auto,
    title: 'Polska faktura VAT 23% i płatność w PLN',
    desc: 'Jedna comiesięczna faktura VAT w złotówkach zamiast rozliczania kilkunastu mikropłatności kartami w USD z kosztami przewalutowania.',
  },
  {
    icon: Headphones, color: AKCENT.local,
    title: 'Dedykowany opiekun i warsztat wdrożeniowy',
    desc: 'Pomagamy wdrożyć gotowe scenariusze AI pod konkretne procesy w Waszej firmie oraz szkolimy pracowników z efektywnej pracy.',
  },
  {
    icon: Gauge, color: AKCENT.chat,
    title: 'Pełny audyt i raporty efektywności',
    desc: 'Szczegółowy podgląd wykorzystania zasobów per dział i projekt. Łatwa kalkulacja zwrotu z inwestycji (ROI) w automatyzację.',
  },
] as const

/* ══════════════ AUTENTYCZNE OPINIE UŻYTKOWNIKÓW ══════════════ */
export const OPINIE = [
  {
    autor: 'Tomasz Krawczyk',
    inicjaly: 'TK',
    rola: 'Architekt Systemów & Lead Dev',
    tekst: 'Dla mnie kluczowa była lokalna baza wiedzy i obsługa modeli offline. Mogę pracować z poufnym kodem bez obawy, że cokolwiek wyjdzie na zewnątrz. Reszta zespołu korzysta z chmury, a wszystko spina jeden interfejs.',
    metryka: 'Zero wycieków danych',
  },
  {
    autor: 'Aleksandra Nowak',
    inicjaly: 'AN',
    rola: 'Head of Content & Copywriting',
    tekst: 'Wcześniej płaciliśmy za 4 osobne narzędzia, z których połowa leżała odłogiem przez pół miesiąca. W NextByte mamy jedną pulę Byte dla całego zespołu i płacimy tylko za to, co faktycznie wygenerujemy.',
    metryka: '-65% kosztów narzędzi',
  },
  {
    autor: 'Michał Wiśniewski',
    inicjaly: 'MW',
    rola: 'Twórca cyfrowy & Konsultant AI',
    tekst: 'Przełączanie między Claude a GPT w tym samym wątku z zachowaniem kontekstu to ogromna przewaga. Do tego generowanie grafik 4K bez limitów kolejek. Prawdziwe centrum dowodzenia AI.',
    metryka: '10+ modeli w 1 panelu',
  },
] as const

/* ══════════════ FAQ — ROZWIĄZYWANIE REALNYCH OBAW KLIENTA ══════════════ */
export const FAQ = [
  {
    q: 'Czym NextByte różni się od płacenia za ChatGPT, Claude czy Midjourney osobno?',
    a: 'Zamiast płacić 5 osobnych abonamentów po $20-$30 każdy (ponad 450 zł/mc) i ciągle kopiować prompty między kartami, w NextByte masz dostęp do wszystkich topowych modeli (GPT-5, Claude, Gemini, Grok, Nano Banana, wideo, głos) w jednym panelu, z jedną elastyczną pulą Byte i po polsku.',
  },
  {
    q: 'Jak działa tryb prywatny i modele lokalne (Llama / Ollama)?',
    a: 'To dwie różne rzeczy. W trybie prywatnym rozmowa jest ulotna, a jej treść nie zapisuje się na serwerze. Modele lokalne idą o krok dalej: podłączasz darmowe Ollama albo LM Studio, a model liczy bezpośrednio na Twoim komputerze, więc dane w ogóle z niego nie wychodzą. Działa nawet bez internetu, a takie generacje nie zużywają ani jednego Byte.',
  },
  {
    q: 'Czym są jednostki Byte i jak działają?',
    a: 'Byte to elastyczna waluta platformy. Płacisz tylko za to, co faktycznie wygenerujesz, widząc dokładny koszt przed wysłaniem zapytania. Miesięczny przydział Byte odnawia się z każdym cyklem rozliczeniowym, a w razie potrzeby możesz w każdej chwili dokupić dodatkowy pakiet.',
  },
  {
    q: 'Czy muszę podawać kartę płatniczą przy rejestracji?',
    a: 'Nie. Możesz założyć konto za 0 zł i od razu korzystać z interfejsu, notatek, zadań, tablic oraz kalendarza bez podawania jakichkolwiek danych płatniczych.',
  },
  {
    q: 'Czy mogę zrezygnować w dowolnym momencie?',
    a: 'Tak, w każdym momencie jednym kliknięciem w ustawieniach konta. Bez okresów wypowiedzenia, bez ukrytych opłat i bez zbędnych formalności.',
  },
  {
    q: 'Jak dbacie o bezpieczeństwo moich danych i prywatność?',
    a: 'Nie stawiamy na jedno zabezpieczenie, tylko na kilka niezależnych warstw. Połączenie z platformą jest zawsze szyfrowane, a ruch bez szyfrowania po prostu nie istnieje w naszej architekturze. Dyski z danymi są zaszyfrowane w całości, a serwery stoją w Unii Europejskiej i dane ich nie opuszczają. O tym, co widzisz, decyduje sama baza danych, a nie kod aplikacji: bez pasującej reguły nie odda ani jednego wiersza, nawet gdyby ktoś ominął interfejs. Twoje rozmowy i dokumenty nie trafiają do trenowania publicznych modeli AI.',
  },
  {
    q: 'Czy ktoś z Waszego zespołu może odczytać moje dane?',
    a: 'Nie, i nie jest to kwestia obietnicy, tylko tego, jak działa samo szyfrowanie. Klucz do Twoich danych powstaje z Twojego hasła, w Twojej przeglądarce, i nigdy do nas nie trafia. Na naszych serwerach leży wyłącznie zaszyfrowana treść, której bez tego hasła nie da się otworzyć, również nam. Sam klucz znika z pamięci w chwili zamknięcia karty, a jego wyliczanie jest celowo powolne, żeby zgadywanie hasła siłą było nieopłacalne.',
  },
  {
    q: 'Jak chronione jest moje konto przed przejęciem?',
    a: 'Twoje hasło nie trafia do naszych tabel ani do logów, przechowywany jest wyłącznie jego nieodwracalny skrót, więc nie ma czego z nas wykraść. Nad hasłem możesz postawić drugi składnik logowania: kod z aplikacji, kod wysłany e-mailem albo klucz dostępu potwierdzany odciskiem palca lub skanem twarzy. Ten ostatni jest odporny na phishing: nawet jeśli ktoś podstawi Ci łudząco podobną stronę, nie ma czego przechwycić, bo klucz nigdy nie opuszcza Twojego urządzenia.',
  },
  {
    q: 'Co dzieje się z danymi mojej karty płatniczej?',
    a: 'Nic, bo nigdy ich nie dostajemy. Całą płatność obsługuje Stripe i to on przyjmuje dane karty, więc na naszych serwerach nie pojawiają się na żadnym etapie. Gdyby cokolwiek zawiodło po naszej stronie, transakcja zwyczajnie się nie powiedzie: nie ma takiej ścieżki, w której błąd po cichu otwiera dostęp bez opłaty.',
  },
] as const


/* ══════════════ FAQ CENNIKA — zaktualizowane i zgodne z logiką platformy ══════════════ */
export const CENNIK_FAQ = [
  {
    q: 'Czym różnią się plany i czy mogę dostosować pulę Byte?',
    a: 'W planie Lite masz już normalnie pełen dostęp do narzędzi i modeli AI ze stałą pulą 140 Byte za 27,90 zł. W planach Premium oraz Ultimate zyskujesz dodatkowo pełną elastyczność: suwakiem samodzielnie ustalasz wielkość comiesięcznej puli Byte i dopasowujesz cenę do własnych potrzeb. Wyższe plany oferują także znacznie większe pule, wyższą równoległość zadań, Deep Research, Tryb Ultra, a w Ultimate priorytetową kolejkę zapytań oraz ekskluzywne modele AI.',
  },
  {
    q: 'Jak długo ważne są jednostki Byte i co jeśli ich zabraknie?',
    a: 'Miesięczna pula Byte z abonamentu jest przypisana do bieżącego cyklu rozliczeniowego i należy ją wykorzystać do końca opłaconego okresu. Wraz z odnowieniem subskrypcji Twoje konto zasila świeża, pełna pula Byte na kolejny miesiąc. Jeśli pracujesz intensywniej i zużyjesz limit wcześniej, w każdej chwili możesz dokupić dodatkową paczkę Byte w panelu, bez konieczności zmiany całego planu na wyższy. Dokupione pakiety zachowują ważność przez 12 miesięcy.',
  },
  {
    q: 'Co dokładnie oferuje plan darmowy za 0 zł?',
    a: 'W planie darmowym zyskujesz bezterminowy dostęp do narzędzi organizacji pracy: Notatek, Zadań, Tablic oraz Kalendarza bez opłat i bez podawania karty. Zawsze możesz też dokupić pojedynczą paczkę Byte, aby przetestować modele w chmurze bez konieczności wchodzenia w abonament.',
  },
  {
    q: 'Czy otrzymam fakturę VAT na firmę?',
    a: 'Tak. Pełna faktura VAT 23% na firmę jest dostępna przy każdym zakupie. Przy finalizacji zamówienia wystarczy podać numer NIP oraz dane działalności. Faktura w formacie PDF generuje się automatycznie po każdej płatności i jest gotowa do pobrania w panelu konta w zakładce Subskrypcja.',
  },
  {
    q: 'Czy moje dane lub pliki trenują zewnętrzne modele AI?',
    a: 'Nigdy. Twoje dane, zapytania, notatki i przesyłane pliki nie wychodzą poza infrastrukturę NextByte i w żadnym wypadku nie są wykorzystywane do trenowania jakichkolwiek modeli AI. Korzystamy wyłącznie z dedykowanych interfejsów biznesowych z gwarancją poufności oraz zerowej retencji danych.',
  },
  {
    q: 'Co się dzieje po anulowaniu subskrypcji?',
    a: 'Subskrypcję możesz anulować w każdej chwili jednym kliknięciem w panelu konta, bez okresów wypowiedzenia i bez ukrytych opłat. Po anulowaniu zachowujesz pełen dostęp do platformy oraz wszystkich swoich Byte do końca opłaconego okresu rozliczeniowego. Kolejne opłaty z Twojej karty nie zostaną pobrane.',
  },
] as const

export const LOGOTYPY = TECH_PARTNERZY

/**
 * Koszt pojedynczej operacji w jednostkach Byte — stawki zmierzone na produkcji.
 * Te same liczby zasilają kartę planu ("To wystarczy na...") i kreator doboru,
 * więc szacunek w kreatorze zgadza się co do jednego z tym, co pokazuje karta.
 */
export const KOSZT_BYTE = {
  rozmowa: 5,
  obraz: 4, // referencyjny model do przelicznika grafik: Nano Banana Pro
  zadanieAsystenta: 5,
  mocnyModel: 11,
  rozmowaGlosowaMin: 2, // 1 minuta rozmowy głosowej z AI
  // 1 mln tokenów input przy stałym kursie ZL_ZA_BYTE:
  tokeny1mlnTerra: 40, // GPT-5.6 Terra — 8 zł / 1M
  tokeny1mlnOpus: 100, // Claude Opus 5 — 20 zł / 1M
} as const

/**
 * Stały kurs jednostki Byte. Jeden Byte kupuje tyle samo mocy modelu
 * niezależnie od planu, w którym został nabyty — plan decyduje wyłącznie
 * o tym, ile złotówek płacisz za jeden Byte. Dlatego wszystkie przeliczniki
 * tokenów idą z PULI Byte przez tę stałą, a nigdy z ceny miesięcznej planu:
 * liczenie z ceny skraca pulę ze wzoru i sprawia, że wyższe progi — te
 * z najtanszym Byte — wypadają w tabeli najgorzej.
 */
export const ZL_ZA_BYTE = 0.2

// GPT Terra input: $2/1M tokenów = 8 zł/1M (kurs 4 zł/USD)
const GPT_TERRA_INPUT_ZL_PER_1M = 8

/**
 * Modele aktualnie dostępne na platformie i ich referencyjna cena input
 * (kurs 4 zł/USD) — zasila przelicznik "ile tokenów na danym planie"
 * w tabeli porównania (patrz PLAN_MACIERZ, kategoria "Tokeny AI").
 */
export const MODELE_TOKENOWE = [
  { nazwa: 'Claude Sonnet 5',            zlPer1M: 8 },   // $2 / 1M in
  { nazwa: 'Claude Opus 5',              zlPer1M: 20 },  // $5 / 1M in
  // Sol ma jawną stawkę tok/Byte zamiast wyliczanej z ceny. Z ceny listowej
  // $4/1M (16 zł) wyszłoby 12 500 tok/Byte i ~30,6 mln na Ultimate; rewizja
  // cennika potwierdziła 12 143 tok/Byte, czyli wiersz 1,7 / 6,0 / 29,8 mln.
  // Do pogodzenia z byteCost.ts — Sol liczy +1 Byte za reasoning 'high'.
  { nazwa: 'GPT-5.6 Sol',                zlPer1M: 16, tokPerByte: 12143 },  // $4 / 1M in — flagship
  { nazwa: 'GPT-5.6 Terra',              zlPer1M: 8 },   // $2 / 1M in — balanced
  { nazwa: 'GPT-5.6 Luna',               zlPer1M: 0.8 }, // $0,2 / 1M in — cost
  { nazwa: 'Grok 4.3 (≤200k tok)',       zlPer1M: 5 },   // $1,25 / 1M in
  { nazwa: 'Grok 4.3 (>200k tok)',       zlPer1M: 10 },  // $2,5 / 1M in
  { nazwa: 'Gemini 3.1 Flash-Lite',      zlPer1M: 1 },   // $0,25 / 1M in — szybki w NextByte
  { nazwa: 'Gemini 3.1 Flash Live',      zlPer1M: 3 },   // $0,75 / 1M in
  { nazwa: 'Gemini 3.1 Pro (≤200k tok)', zlPer1M: 8 },   // $2 / 1M in — pro w NextByte
  { nazwa: 'Gemini 3.1 Pro (>200k tok)', zlPer1M: 16 },  // $4 / 1M in
] as const

/**
 * Modele graficzne dostępne w generatorze i ich koszt w Byte za sztukę
 * (cena bazowej jakości — 1K, jeśli model ją ma; wyższe jakości kosztują
 * więcej). Zasila kategorię "Grafiki AI" w tabeli porównania: liczba sztuk
 * = pula Byte / koszt modelu.
 */
export const MODELE_GRAFICZNE = [
  { nazwa: 'Z-Image Turbo',      byte: 1 },
  { nazwa: 'FLUX.2 Klein 9B',    byte: 1 },
  { nazwa: 'FLUX.2 Pro',         byte: 2 },
  { nazwa: 'Qwen Image 3.0 Pro', byte: 2 },
  { nazwa: 'Kling Image O3',     byte: 2 },
  { nazwa: 'Nano Banana 2',      byte: 3 },
  { nazwa: 'Seedream 5.0 Pro',   byte: 3 },
  { nazwa: 'Ideogram 4.0',       byte: 3 },
  { nazwa: 'Nano Banana Pro',    byte: 4 },
  { nazwa: 'Grok Imagine',       byte: 6 },
  { nazwa: 'GPT Image 2',        byte: 8 },
] as const

/** Formatuje liczbę tokenów jak w karcie planu: ~3,5 mln / ~465 tys. */
function fmtTokeny(n: number): string {
  if (n >= 1_000_000_000) return `~${(n / 1_000_000_000).toFixed(1).replace('.', ',')} mld`
  if (n >= 1_000_000)     return `~${(n / 1_000_000).toFixed(1).replace('.', ',')} mln`
  if (n >= 1_000)         return `~${Math.round(n / 1_000)} tys.`
  return `~${n}`
}

/**
 * Ile tokenów danego modelu daje pula Byte. Domyślnie kurs wychodzi z ceny
 * input przez stałą ZL_ZA_BYTE; model może jednak podać własne tokPerByte,
 * jeśli jego realna stawka rozjechała się z ceną listową (patrz GPT-5.6 Sol).
 */
export function tokenyDlaModelu(byte: number, zlPer1M: number, tokPerByte?: number): string {
  const kurs = tokPerByte ?? ZL_ZA_BYTE * 1_000_000 / zlPer1M
  return fmtTokeny(Math.floor(byte * kurs))
}

/**
 * Zamienia pulę Byte na orientacyjną liczbę operacji ("To wystarczy na...").
 * Gdy ustawisz pokazTokeny, pierwszy wiersz pokazuje tokeny wg referencyjnej
 * ceny GPT Terra input zamiast liczby rozmów — liczone z puli przez stały
 * kurs ZL_ZA_BYTE, tak samo jak kategoria "Tokeny AI" w tabeli porównania.
 */
export function przelicznikByte(byte: number, pokazTokeny?: boolean) {
  const pierwszyWiersz = pokazTokeny
    ? { icon: Zap, label: 'tokenów', value: Math.floor(byte * ZL_ZA_BYTE * 1_000_000 / GPT_TERRA_INPUT_ZL_PER_1M), isTokens: true, isImages: false }
    : { icon: MessageSquare, label: 'rozmów z AI', value: Math.floor(byte / KOSZT_BYTE.rozmowa), isTokens: false, isImages: false }

  return [
    pierwszyWiersz,
    { icon: ImagePlus, label: 'Graphic AI', value: Math.floor(byte / KOSZT_BYTE.obraz), isTokens: false, isImages: true },
    { icon: Mic, label: 'rozmowy głosowej z AI', value: Math.floor(byte / KOSZT_BYTE.rozmowaGlosowaMin), isTokens: false, isImages: false, isVoice: true },
  ]
}

export const B2B_LICZBY = [
  { value: '43%', label: 'Średnia oszczędność na subskrypcjach AI', sub: 'Względem osobnych kont w USD' },
  { value: '< 1 dzień', label: 'Średni czas wdrożenia zespołu', sub: 'Pełny onboarding i szkolenie' },
  { value: '100%', label: 'Zgodność z europejskim RODO', sub: 'Centra danych na terenie UE' },
  { value: '0 zł', label: 'Koszt modeli lokalnych offline', sub: 'Bezpieczna praca bez chmury' },
] as const

/* Wpisy historii wydań. Kształt musi zgadzać się z `HistoriaPage`, która
   czyta `wersja`, `data`, `typ`, `color` i `punkty` — brak tych pól wywalał
   stronę na `w.punkty.map` (TypeError: undefined). Punkty są rozpisane
   z istniejących opisów, nie dopisane od siebie. */
export const HISTORIA = [
  {
    rok: '2024 Q1',
    wersja: 'v0.1',
    data: 'Styczeń 2024',
    typ: 'major',
    color: AKCENT.neutral,
    icon: Layers,
    tytul: 'Początek: Chaos subskrypcji AI',
    opis: 'Przełączanie między 6 różnymi aplikacjami, 5 faktur w USD z przewalutowaniami i ciągłe gubienie kontekstu rozmów zmotywowało nas do stworzenia zintegrowanej platformy.',
    punkty: [
      'Sześć osobnych aplikacji zamiast jednego miejsca pracy',
      'Pięć faktur w dolarach, każda z własnym przewalutowaniem',
      'Kontekst rozmowy ginął przy każdej zmianie narzędzia',
    ],
  },
  {
    rok: '2024 Q3',
    wersja: 'v1.0',
    data: 'Wrzesień 2024',
    typ: 'major',
    color: AKCENT.chat,
    icon: Sparkles,
    tytul: 'Ekosystem NextByte v1.0',
    opis: 'Wypuszczenie wspólnego interfejsu dla Gemini, Claude, GPT-4o oraz Studia Zdjęć na jednej puli Byte z polską fakturą VAT.',
    punkty: [
      'Jeden interfejs dla Gemini, Claude i GPT-4o',
      'Studio Zdjęć na tej samej puli Byte co czat',
      'Polska faktura VAT zamiast pięciu rozliczeń w USD',
    ],
  },
  {
    rok: '2025 Q1',
    wersja: 'v2.0',
    data: 'Marzec 2025',
    typ: 'major',
    color: AKCENT.studio,
    icon: Shield,
    tytul: 'Panel B2B i Tryb Lokalny (Offline)',
    opis: 'Wdrożenie modułów dla firm z zarządzaniem uprawnieniami, audytem oraz 100% prywatnymi modelami LM Studio / Ollama dla wrażliwych danych.',
    punkty: [
      'Zarządzanie uprawnieniami i audyt dla zespołów',
      'Modele lokalne LM Studio i Ollama — dane nie opuszczają maszyny',
      'Tryb offline dla materiałów wrażliwych',
    ],
  },
  {
    rok: '2026',
    wersja: 'v3.0',
    data: 'Luty 2026',
    typ: 'feature',
    color: AKCENT.notes,
    icon: Calendar,
    tytul: 'Kalendarz AI, Studio Wideo i Głos AI',
    opis: 'Pełny zestaw twórcy: generowanie klipów, transkrypcje spotkań i kalendarz spięty z tablicami Kanban.',
    punkty: [
      'Generowanie klipów wideo w Studiu',
      'Transkrypcje spotkań z rozpoznaniem mówców',
      'Kalendarz spięty z tablicami Kanban',
    ],
  },
] as const

export const STOPKA = [
  {
    tytul: 'Platforma',
    linki: ['Chat AI', 'Studio Zdjęć', 'Notatki z AI', 'Kalendarz AI', 'Modele lokalne'],
  },
  {
    tytul: 'Dla Biznesu',
    linki: ['Cennik', 'Wspólna pula Byte', 'RODO & Bezpieczeństwo'],
  },
  {
    tytul: 'Zasoby',
    linki: ['Biblioteka promptów', 'Integracje API', 'Status systemu', 'Aktualizacje'],
  },
  {
    tytul: 'Kontakt',
    linki: ['Wsparcie techniczne', 'Porozmawiaj z nami', 'kontakt@nextbyte.space'],
  },
] as const

