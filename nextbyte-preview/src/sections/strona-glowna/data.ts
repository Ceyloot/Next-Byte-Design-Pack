import {
  Brain, Camera, NotebookPen, Workflow, Cpu, Zap, Users, MessageSquare,
  Shield, Sparkles, Layers, Clock, Building2, Lock, Gauge, GitBranch,
  Rocket, BadgeCheck, Headphones, KeyRound, ServerCog, FileStack,
  Calendar, Mic, Bot, Repeat, CheckCircle2, Radar, ImagePlus, FileSearch,
  MessagesSquare, ZoomIn, LayoutGrid, Database,
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
export type TonPlakietki = 'blue' | 'green' | 'pink' | 'violet'

export type Cecha = {
  t: string
  icon: LucideIcon
  badge?: { t: string; ton: TonPlakietki }
}

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
      { label: 'Kalendarz, Zadania, Notatki', icon: LayoutGrid },
      { label: 'Baza Danych', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cechyNaglowek: 'W planie Bezpłatnym:',
    cechy: [
      { t: 'Płacisz tylko za zużycie', icon: Coins },
      { t: 'Chat AI', icon: Sparkles },
      { t: 'Studio Zdjęć', icon: ImagePlus },
      { t: 'Personalny Asystent', icon: Bot },
      { t: 'PromptEx', icon: Wand2 },
      { t: 'Kalendarz', icon: Calendar, badge: { t: 'Unlimited', ton: 'blue' } },
      { t: 'Zadania', icon: CheckCircle2, badge: { t: 'Unlimited', ton: 'blue' } },
      { t: 'Notatki', icon: NotebookPen, badge: { t: 'Unlimited', ton: 'blue' } },
      { t: 'Baza Danych', icon: Database, badge: { t: 'Unlimited', ton: 'blue' } },
      { t: 'Szyfrowanie', icon: Lock, badge: { t: 'Unlimited', ton: 'blue' } },
      { t: 'Listy Zakupowe', icon: ShoppingCart },
      { t: 'Pętle AI', icon: Repeat, badge: { t: '1 pętla', ton: 'pink' } },
      { t: 'Przesyłanie plików do 20 MB', icon: Upload },
      { t: 'Kontekst plików projektu w AI Chat', icon: Brain, badge: { t: '50k tok', ton: 'green' } },
    ],
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
      { label: 'Kalendarz, Zadania, Notatki', icon: LayoutGrid },
      { label: 'Baza Danych', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cechyNaglowek: 'W planie Lite:',
    cechy: [
      { t: '140 Byte co miesiąc', icon: Coins, badge: { t: '140 ⟠', ton: 'blue' } },
      { t: 'Wszystkie funkcje Premium', icon: Sparkles },
      { t: 'Wszystkie modele AI', icon: Gauge },
      { t: 'Miesięczne odnowienie', icon: Repeat },
      { t: 'Doładowania paczkami', icon: ShoppingCart },
      { t: 'Akademia Premium', icon: GraduationCap },
      { t: 'Pamięć AI', icon: Brain },
      { t: 'Mniejsza pula niż w Premium', icon: Layers },
    ],
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
      { label: 'Kalendarz, Zadania, Notatki', icon: LayoutGrid },
      { label: 'Baza Danych', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
    ],
    cechyNaglowek: 'W planie Premium:',
    cechy: [
      { t: 'Pełny dostęp do Chat AI', icon: Sparkles },
      { t: 'Personalny Asystent', icon: Bot },
      { t: 'Lokalny AI', icon: Database, badge: { t: 'Private', ton: 'green' } },
      { t: 'Kalendarz AI i Zadania', icon: Calendar },
      { t: 'Akademia Premium', icon: GraduationCap },
      { t: 'Studio Zdjęć AI', icon: ImagePlus },
      { t: 'Pamięć AI', icon: Brain },
      { t: 'Miesięczne odnowienie do limitu', icon: Repeat },
      { t: 'Wsparcie Email', icon: Headphones },
      { t: 'Tryb Ultra AI', icon: Globe, badge: { t: 'Ultra', ton: 'violet' } },
      { t: 'Deep Research', icon: Search, badge: { t: 'Pro', ton: 'blue' } },
      { t: 'Równoległe generacje', icon: Layers, badge: { t: '3x', ton: 'green' } },
      { t: 'Pętle AI', icon: Repeat, badge: { t: '3 pętle', ton: 'pink' } },
      { t: 'Przesyłanie plików do 47 MB', icon: Upload },
      { t: 'Kontekst plików projektu w AI Chat', icon: Brain, badge: { t: '100k tok', ton: 'green' } },
    ],
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
      { label: 'Kalendarz, Zadania, Notatki', icon: LayoutGrid },
      { label: 'Baza Danych', icon: Database },
      { label: 'Szyfrowanie', icon: Lock },
      { label: 'Enhancer 2x', icon: ZoomIn },
    ],
    cechyNaglowek: 'Wszystko z Premium, plus:',
    cechy: [
      { t: 'Priorytetowa kolejka', icon: Clock, badge: { t: 'Fast', ton: 'green' } },
      { t: 'Równoległe generacje', icon: Layers, badge: { t: '5x', ton: 'green' } },
      { t: 'Wczesny dostęp', icon: Rocket, badge: { t: 'Wczesny dostęp', ton: 'blue' } },
      { t: 'Ekskluzywne modele AI', icon: Globe, badge: { t: 'Ekskluzywne', ton: 'pink' } },
      { t: 'Priorytetowe wsparcie', icon: Zap, badge: { t: 'Priorytet', ton: 'pink' } },
      { t: 'Pętle AI — MAX', icon: Repeat, badge: { t: '5 pętli', ton: 'pink' } },
      { t: 'Przesyłanie plików do 100 MB', icon: Upload, badge: { t: '100 MB', ton: 'blue' } },
      { t: 'Kontekst plików projektu w AI Chat — MAX', icon: Brain, badge: { t: '200k tok', ton: 'green' } },
    ],
    cta: 'Wybierz Ultimate',
  },
]

export const PLAN_MACIERZ: { kategoria?: string; f: string; v: (boolean | string)[] }[] = [
  // ── Rozliczenia i pula Byte ──
  {
    kategoria: 'Rozliczenia i pula Byte',
    f: 'Comiesięczna pula Byte',
    v: ['Z paczek', '140 Byte', '495 - 1500 Byte', '2450 - 6070 Byte'],
  },
  {
    f: 'Dostosowanie puli suwakiem',
    v: [false, 'Stała pula', '3 progi do wyboru', '3 progi do wyboru'],
  },
  {
    f: 'Ważność dokupionych paczek Byte',
    v: ['12 miesięcy', '12 miesięcy', '12 miesięcy', '12 miesięcy'],
  },
  {
    f: 'Faktura VAT 23% dla firm',
    v: [true, true, true, true],
  },

  // ── Modele AI i generowanie ──
  {
    kategoria: 'Modele AI i generowanie',
    f: 'Chat AI (GPT-5.4, Claude, Gemini, Grok)',
    v: ['Z paczek Byte', true, true, true],
  },
  {
    f: 'Lokalny AI offline (Ollama / LM Studio)',
    v: [false, true, true, true],
  },
  {
    f: 'Personalny Asystent AI',
    v: [false, true, true, true],
  },
  {
    f: 'Studio Zdjęć i Grafik 4K',
    v: ['Z paczek Byte', true, true, true],
  },
  {
    f: 'Deep Research i Tryb Ultra',
    v: [false, true, true, true],
  },
  {
    f: 'Równoległe generacje obrazów',
    v: [false, '1x', '3x', '5x'],
  },

  // ── Narzędzia i organizacja pracy ──
  {
    kategoria: 'Narzędzia i organizacja pracy',
    f: 'Notatki, Zadania, Tablice i Kalendarz',
    v: [true, true, true, true],
  },
  {
    f: 'Pamięć długoterminowa AI',
    v: [false, true, true, true],
  },
  {
    f: 'Akademia wiedzy AI',
    v: [false, true, true, true],
  },
  {
    f: 'Maksymalny rozmiar pliku',
    v: ['20 MB', '47 MB', '47 MB', '100 MB'],
  },
  {
    f: 'Pamięć kontekstu w AI Chat',
    v: ['50k tok', '100k tok', '100k tok', '200k tok'],
  },

  // ── Korzyści planu Ultimate ──
  {
    kategoria: 'Korzyści planu Ultimate',
    f: 'Priorytetowa kolejka zapytań',
    v: [false, false, false, true],
  },
  {
    f: 'Ekskluzywne modele AI',
    v: [false, false, false, true],
  },
  {
    f: 'Wczesny dostęp do nowości beta',
    v: [false, false, false, true],
  },
  {
    f: 'Dedykowane wsparcie priorytetowe',
    v: [false, false, false, true],
  },
]

/** Sekcja "Jedna waluta. Pełna kontrola." — cztery kafle z narożnikami. */
export const BYTE_KARTY = [
  {
    tag: '// 01 / EKOSYSTEM',
    t: 'Jeden portfel AI',
    d: 'GPT, Claude, Gemini i grafiki 4K rozliczają się z jednego konta, bez osobnych limitów na modele.',
  },
  {
    tag: '// 02 / CYKL ROZLICZENIOWY',
    t: 'Świeża pula co miesiąc',
    d: 'Miesięczna pula Byte odnawia się z każdym nowym okresem rozliczeniowym.',
  },
  {
    tag: '// 03 / WAŻNOŚĆ PACZEK',
    t: 'Pakiety nie wygasają',
    d: 'Dokupione dodatkowo paczki Byte zachowują ważność przez 12 miesięcy.',
  },
  {
    tag: '// 04 / DOŁADOWANIA',
    t: 'Pakiety od ręki',
    d: 'Większy projekt? Dokupujesz Byte w każdej chwili, bez zmiany planu.',
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
  {
    q: 'Czy są dostępne plany dla zespołów i firm?',
    a: 'Tak. NextByte oferuje dedykowaną platformę B2B ze wspólną pulą Byte dla całego zespołu, współdzielonym workspace, zarządzaniem rolami i granularnymi uprawnieniami. Sprawdź zakładkę Dla firm w górnym przełączniku cennika.',
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
  obraz: 4,
  zadanieAsystenta: 5,
  mocnyModel: 11,
} as const

/**
 * Zamienia pulę Byte na orientacyjną liczbę operacji ("To wystarczy na...").
 * Używane na karcie planu w cenniku — zwraca wiersze gotowe do wyrenderowania.
 */
export function przelicznikByte(byte: number) {
  return [
    { icon: MessageSquare, label: 'rozmów z AI', value: Math.floor(byte / KOSZT_BYTE.rozmowa) },
    { icon: ImagePlus, label: 'obrazów w Studiu Zdjęć', value: Math.floor(byte / KOSZT_BYTE.obraz) },
    { icon: Sparkles, label: 'zadań Asystenta', value: Math.floor(byte / KOSZT_BYTE.zadanieAsystenta) },
    { icon: FileSearch, label: 'rozmów na mocnym modelu', value: Math.floor(byte / KOSZT_BYTE.mocnyModel) },
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
    linki: ['Dla firm', 'Cennik', 'Wspólna pula Byte', 'RODO & Bezpieczeństwo'],
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

