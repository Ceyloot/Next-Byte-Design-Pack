import {
  Brain, Camera, NotebookPen, Workflow, Cpu, Zap, Users, MessageSquare,
  Shield, Sparkles, Layers, Clock, Building2, Lock, Gauge, GitBranch,
  Rocket, BadgeCheck, Headphones, KeyRound, ServerCog, FileStack,
  Calendar, Mic, Bot, Repeat, CheckCircle2,
} from 'lucide-react'
import { AKCENT } from './shared'

/* ══════════════ MODUŁY PLATFORMY (AUTENTYCZNE I PRZEKONYWUJĄCE) ══════════════ */
export const MODULY = [
  {
    id: 'chat',
    icon: Brain,
    color: AKCENT.chat,
    tag: '01 // CHAT AI',
    title: 'Chat AI z wszystkimi topowymi modelami',
    lead: 'Gemini 3.5, GPT-5, Claude, Grok — wszystkie w jednym oknie, bez utraty kontekstu.',
    models: ['Gemini', 'GPT', 'Claude', 'Grok'],
    bullets: [
      'Wspólny kontekst dla wszystkich dostawców — koniec z przeklejaniem promptów',
      'Tryb porównawczy: dwie odpowiedzi obok siebie, aby natychmiast wybrać najlepszą',
      'Analiza plików: dokumenty PDF, arkusze Excel, kod i obrazy w jednym oknie',
      'Prywatny tryb lokalny (Ollama / LM Studio) — dane w 100% na Twoim dysku',
    ],
    metryki: [
      { label: 'Dostępne modele', value: '10+ modeli AI' },
      { label: 'Czas reakcji', value: 'Odpowiedź < 1s' },
      { label: 'Okno kontekstu', value: 'do 1M tokenów' },
    ],
  },
  {
    id: 'studio',
    icon: Camera,
    color: AKCENT.studio,
    tag: '02 // KREACJA GRAFICZNA',
    title: 'Studio Zdjęć i generowanie materiałów 4K',
    lead: 'Imagen 3 Pro, GPT Image, Grok Image — generacja i edycja obrazów w jednym miejscu, do 4K.',
    models: ['Imagen 3', 'GPT Image', 'Grok'],
    bullets: [
      'Dostęp do topowych silników obrazu bez płacenia osobnego abonamentu Midjourney',
      'Gotowe narzędzia biznesowe: Face Swap, Upscale 4K, Usuwanie tła, Mockupy B2B',
      'Równoległe generowanie: do 3 grafik jednocześnie w planie Premium, do 5 w Ultimate',
      'Eksport w formatach WebP, PNG i wektorowych z pełnymi prawami komercyjnymi',
    ],
    metryki: [
      { label: 'Silniki', value: '3 silniki obrazu' },
      { label: 'Maks. jakość', value: '4K Ultra HD' },
      { label: 'Prawa autorskie', value: '100% komercyjne' },
    ],
  },
  {
    id: 'notes',
    icon: NotebookPen,
    color: AKCENT.notes,
    tag: '03 // BAZA WIEDZY',
    title: 'Notatki AI i inteligentna baza wiedzy',
    lead: 'Zaawansowany edytor z AI, folder-sync jako źródło wiedzy dla czatu, autoanalizy per token.',
    models: ['Claude', 'Gemini', 'Embeddings'],
    bullets: [
      'Wyszukiwanie semantyczne — AI rozumie intencję i sens, nie tylko słowa kluczowe',
      'Głęboka integracja z Chat AI — zadajesz pytania bezpośrednio do swoich notatek',
      'Automatyczne podsumowania, ekstrakcja wniosków i synteza długich raportów',
      'Bezpieczny eksport do Markdown, PDF oraz synchronizacja w czasie rzeczywistym',
    ],
    metryki: [
      { label: 'Indeksacja', value: 'Indeksacja na bieżąco' },
      { label: 'Formaty', value: 'MD, PDF, DOCX' },
      { label: 'Pojemność', value: 'UNLIMITED' },
    ],
  },
  {
    id: 'calendar',
    icon: Calendar,
    color: AKCENT.notes,
    tag: '04 // ORGANIZACJA',
    title: 'Kalendarz AI i asystent zadań',
    lead: 'Wydarzenia, RRULE, snap 15 min, sync ze spotkaniami i zadaniami zespołu.',
    models: ['Claude', 'GPT', 'Gemini'],
    bullets: [
      'Automatyczne przekształcanie wniosków z czatu w konkretne terminy i zadania',
      'Dwukierunkowy sync z Kalendarzem Google i przypomnienia w czasie rzeczywistym',
      'Połączenie kart Kanban z osią czasu — pełna widoczność postępów projektowych',
      'Poranne briefy i podsumowania dnia generowane automatycznie przez AI',
    ],
    metryki: [
      { label: 'Widok', value: 'Dzień / Tydzień' },
      { label: 'Sync spotkań', value: 'Szybki sync' },
      { label: 'Limit zadań', value: 'UNLIMITED' },
    ],
  },
  {
    id: 'video',
    icon: Rocket,
    color: AKCENT.auto,
    tag: '05 // STUDIO WIDEO',
    title: 'Studio Wideo — generowanie klipów AI',
    lead: 'Wiodące silniki wideo AI — generuj klipy z tekstu lub obrazu w kilkadziesiąt sekund, bez montażu i bez studia.',
    models: ['Runway', 'Kling', 'Hailuo'],
    bullets: [
      'Generowanie wideo z tekstu i obrazu: Runway, Kling, Hailuo w jednym miejscu',
      'Automatyczne napisy, dubbing AI i eksport w formacie MP4 / WebM',
      'Tworzenie reklam produktowych, reelsów i filmów explainer bez studia',
      'Integracja z Studio Zdjęć — użyj własnej grafiki 4K jako klatki startowej',
    ],
    metryki: [
      { label: 'Długość klipu', value: 'do 2 min' },
      { label: 'Rozdzielczość', value: '4K / 1080p' },
      { label: 'Silniki', value: 'Wiodące modele AI' },
    ],
  },
  {
    id: 'voice',
    icon: Mic,
    color: AKCENT.auto,
    tag: '06 // INTERAKCJA GŁOSOWA',
    title: 'Głos AI i automatyczna transkrypcja',
    lead: 'ElevenLabs WebSocket, polski głos, rozmowy w czasie rzeczywistym — opóźnienie poniżej 300 ms.',
    models: ['ElevenLabs', 'Whisper', 'WebSocket'],
    bullets: [
      'Naturalnie brzmiące polskie głosy zasilane technologią ElevenLabs WebSocket',
      'Transkrypcja audio i wideo z automatycznym podziałem na role i listą ustaleń',
      'Możliwość prowadzenia burzy mózgów głosowo podczas jazdy samochodem czy spaceru',
      'Notatki z rozmów automatycznie synchronizowane z projektami w platformie',
    ],
    metryki: [
      { label: 'Opóźnienie mowy', value: '< 300ms' },
      { label: 'Jakość transkrypcji', value: '99,2% precyzji' },
      { label: 'Silnik', value: 'ElevenLabs' },
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
    tag: '// SYGNAŁ ZAMIAST SZUMU',
    title: 'Codziennie wychodzi 50 „przełomowych" narzędzi AI. Znaczenie mają 2.',
    desc: 'NextByte testuje je za Ciebie i pokazuje tylko to, co realnie przyspiesza pracę — z instrukcją krok po kroku, po polsku.',
    accent: '#70BEFA',
  },
  {
    tag: '// PROMPTY, KTÓRE DZIAŁAJĄ',
    title: 'Zero „magicznych promptów" z TikToka.',
    desc: 'Dostajesz sprawdzone szablony pod konkretne zadania: research, treści, automatyzacje, kod. Każdy prompt z kontekstem: kiedy użyć, co zmienić pod siebie, czego się spodziewać.',
    accent: '#C084FC',
  },
  {
    tag: '// GOTOWE PRZEPŁYWY',
    title: 'Nie pojedyncze triki, tylko całe systemy.',
    desc: 'Od pomysłu do wyniku — z rozpisanymi narzędziami i kolejnością kroków. Kopiujesz, podmieniasz dane, działa. Tego samego dnia.',
    accent: '#34D399',
  },
] as const

/* ══════════════ TELEMETRIA / KLUCZOWE WSKAŹNIKI ══════════════ */
export const STATY = [
  { value: '10+',     label: 'Modeli AI w 1 panelu', sub: 'Gemini · GPT · Claude · Grok · Mistral', icon: Brain },
  { value: '1',       label: 'Subskrypcja', sub: 'Zamiast pięciu osobnych', icon: Layers },
  { value: '100%',    label: 'Po polsku', sub: 'Interfejs, prompty, wsparcie', icon: Shield },
  { value: '24/7',    label: 'Autonomiczne agenty', sub: 'Zautomatyzowane procesy w tle',        icon: Sparkles },
] as const

export const KROKI = [
  {
    krok: '01',
    title: 'Zakładasz konto za 0 zł',
    desc: 'Rejestracja w 30 sekund bez karty kredytowej. Modele lokalne i podstawowe narzędzia bez opłat.',
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
    { f: 'Chat z wieloma modelami (GPT-5, Claude, Gemini, Grok)', v: [true, 'Tylko GPT-5', false, 'Tylko OpenAI'] },
    { f: 'Generowanie grafik 4K (Flux Pro, Grok Image)',          v: [true, 'DALL-E (limit)', true, false] },
    { f: 'Generowanie wideo AI (Runway, Kling)',                  v: [true, false, false, false] },
    { f: 'Głos AI i transkrypcja spotkań',                        v: [true, 'podstawowy', false, 'Meeting Notes'] },
    { f: 'Notatki AI i semantyczna baza wiedzy',                  v: [true, false, false, true] },
    { f: 'Kanban, zadania i Kalendarz AI',                        v: [true, false, false, true] },
    { f: 'Autonomiczne agenty AI działające 24/7',                v: [true, false, false, false] },
    { f: 'Lokalny AI offline — zero transferu (Ollama / LM Studio)', v: [true, false, false, false] },
    { f: 'Serwery w UE · pełna zgodność z RODO',                 v: [true, false, false, false] },
    { f: 'Płatność w PLN · polska faktura VAT 23%',              v: [true, false, false, false] },
    { f: 'Cena miesięczna',                                       v: ['od 0 zł', '~80 zł ($20)', '~120 zł ($30)', '~95 zł ($24/os.)'] },
  ],
} as const

/* ══════════════ CENNIK I PLANY ══════════════ */
export type Plan = {
  id: string
  nazwa: string
  opis: string
  kolor: string
  polecany: boolean
  odznaka: string | null
  progi: { byte: number; miesiecznie: number; rocznie: number; kurs: string }[] | null
  cechy: string[]
  cta: string
}

export const PLANY: Plan[] = [
  {
    id: 'free',
    nazwa: 'Bezpłatny',
    opis: 'Sprawdź platformę bez żadnego ryzyka',
    kolor: AKCENT.neutral,
    polecany: false,
    odznaka: null,
    progi: null,
    cechy: [
      'Dostęp do wszystkich modułów (Chat, Studio, Notatki, Zadania)',
      'Wszystkie modele komercyjne — płatne elastycznie z paczek Byte',
      'Płacisz wyłącznie za realne zużycie — bez stałej opłaty miesięcznej',
      'Modele lokalne (Ollama / LM Studio) całkowicie za darmo i offline',
      'Kalendarz, Zadania i Notatki bez ograniczeń (UNLIMITED)',
      'Bezpieczne szyfrowanie danych End-to-End (E2EE)',
    ],
    cta: 'Zacznij za darmo',
  },
  {
    id: 'premium',
    nazwa: 'Premium',
    opis: 'Dla profesjonalistów i twórców',
    kolor: AKCENT.chat,
    polecany: false,
    odznaka: null,
    progi: [
      { byte: 495,  miesiecznie: 99,  rocznie: 82,  kurs: '5,00 ⟠ / zł' },
      { byte: 950,  miesiecznie: 179, rocznie: 149, kurs: '5,30 ⟠ / zł' },
      { byte: 1500, miesiecznie: 269, rocznie: 225, kurs: '5,58 ⟠ / zł' },
    ],
    cechy: [
      'Miesięczna pula Byte z możliwością przenoszenia niewykorzystanych jednostek',
      'Pełny dostęp do Chat AI, Studia Zdjęć i Personalnego Asystenta',
      'Lokalny AI z gwarancją 100% prywatności pod poufne dane',
      'Tryb Ultra AI & Deep Research do wieloetapowych analiz biznesowych',
      'Do 3 równoległych generacji obrazów jednocześnie',
      'Do 3 autonomicznych pętli AI monitorujących dane 24/7',
      'Priorytetowe wsparcie mailowe z czasem odpowiedzi do 24h',
    ],
    cta: 'Wybierz Premium',
  },
  {
    id: 'ultimate',
    nazwa: 'Ultimate',
    opis: 'Dla wymagających firm i agencji',
    kolor: AKCENT.chat,
    polecany: true,
    odznaka: 'Najlepsza oferta',
    progi: [
      { byte: 2450, miesiecznie: 349, rocznie: 290, kurs: '7,02 ⟠ / zł' },
      { byte: 4150, miesiecznie: 589, rocznie: 490, kurs: '7,05 ⟠ / zł' },
      { byte: 6070, miesiecznie: 849, rocznie: 710, kurs: '7,15 ⟠ / zł' },
    ],
    cechy: [
      'Najkorzystniejszy przelicznik: aż do 7,15 Byte za każdą złotówkę',
      'Priorytetowa kolejka wykonywania operacji (FAST queue)',
      'Do 5 równoległych generacji grafik i materiałów wideo',
      'Ekskluzywny, wczesny dostęp do premierowych modeli AI',
      'Do 5 autonomicznych agentów AI pracujących bez przerwy 24/7',
      'Przesyłanie dużych plików do 100 MB i kontekst do 200k tokenów',
      'Bezpośrednie wsparcie na dedykowanym kanale w czasie rzeczywistym',
    ],
    cta: 'Wybierz Ultimate',
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

/* ══════════════ AUTENTYCZNE OPINIE Z RYNKU ══════════════ */
export const OPINIE = [
  {
    id: 'T-001',
    imie: 'Michał K.',
    rola: 'Freelancer · Marketing',
    firma: 'Warszawa',
    tekst: 'W końcu jedno miejsce zamiast pięciu subskrypcji. Chat AI z modelami premium, notatki i kalendarz w jednym.',
    metryka: '5 subskrypcji → 1',
  },
  {
    id: 'T-002',
    imie: 'Anna S.',
    rola: 'COO · Agencja',
    firma: 'Kraków',
    tekst: 'Panel firmowy z uprawnieniami i zadaniami zastąpił nam Notion i Trello. Zespół 12 osób, jedna platforma.',
    metryka: 'Zespół 12 osób · 1 panel',
  },
  {
    id: 'T-003',
    imie: 'Krzysztof P.',
    rola: 'Product Owner',
    firma: 'Wrocław',
    tekst: 'Agenty AI odpalone raz działają w tle. Cotygodniowe raporty same się generują z naszych źródeł.',
    metryka: 'Raporty bez ręcznej pracy',
  },
] as const

/* ══════════════ FAQ — ROZWIĄZYWANIE REALNYCH OBAW KLIENTA ══════════════ */
export const FAQ = [
  {
    q: 'Czym NextByte różni się od ChatGPT lub Perplexity?',
    a: 'NextByte to nie kolejny czat. To platforma: chat z 10+ modelami, notatki AI, kalendarz, panel firmowy, obrazy, wideo, głos i agenty — pod jednym logowaniem, po polsku, z jedną fakturą.',
  },
  {
    q: 'Które modele AI dostaję w subskrypcji?',
    a: 'Gemini 3 Pro, GPT-5, Claude Opus/Sonnet, Grok, Mistral, ElevenLabs, Runware. Przełączasz je w locie w tym samym oknie czatu.',
  },
  {
    q: 'Co to są Byte i jak je liczycie?',
    a: '1 Byte = jednostka rozliczeniowa AI (koszt tokenów + operacje). Każda wiadomość pokazuje koszt przed wysłaniem, koszt zaokrąglamy w górę do całych Byte i pobieramy z Twojej puli.',
  },
  {
    q: 'Czy mogę wyjść w każdej chwili?',
    a: 'Tak. Rezygnacja jednym kliknięciem w panelu. Bez umów, bez okresu wypowiedzenia, bez rozmów z konsultantem.',
  },
  {
    q: 'Czy jest wersja dla firm i zespołów?',
    a: 'Tak — panel firmowy z uprawnieniami granularnymi, plany JDG, One, Pro i Infinite. Wspólna pula Byte, wspólne projekty, faktura VAT.',
  },
  {
    q: 'Co z prywatnością i RODO?',
    a: 'Serwery w UE (Supabase, Vercel), RLS na każdym obiekcie, izolacja per firma i per użytkownik, opcja lokalnych modeli AI (LM Studio, Ollama) dla wrażliwych danych.',
  },
] as const

export const LOGOTYPY = TECH_PARTNERZY

export function przelicznikByte(kwotaPln: number, progi = PLANY.find(p => p.id === 'ultimate')?.progi) {
  if (!progi || progi.length === 0) return 0
  const prog = [...progi].reverse().find(p => kwotaPln >= p.miesiecznie) || progi[0]
  return prog.byte
}

export const B2B_LICZBY = [
  { value: '43%', label: 'Średnia oszczędność na subskrypcjach AI', sub: 'Względem osobnych kont w USD' },
  { value: '< 1 dzień', label: 'Średni czas wdrożenia zespołu', sub: 'Pełny onboarding i szkolenie' },
  { value: '100%', label: 'Zgodność z europejskim RODO', sub: 'Centra danych na terenie UE' },
  { value: '0 zł', label: 'Koszt modeli lokalnych offline', sub: 'Bezpieczna praca bez chmury' },
] as const

export const HISTORIA = [
  {
    rok: '2024 Q1',
    tytul: 'Początek: Chaos subskrypcji AI',
    opis: 'Przełączanie między 6 różnymi aplikacjami, 5 faktur w USD z przewalutowaniami i ciągłe gubienie kontekstu rozmów zmotywowało nas do stworzenia zintegrowanej platformy.',
  },
  {
    rok: '2024 Q3',
    tytul: 'Ekosystem NextByte v1.0',
    opis: 'Wypuszczenie wspólnego interfejsu dla Gemini, Claude, GPT-4o oraz Studia Zdjęć na jednej puli Byte z polską fakturą VAT.',
  },
  {
    rok: '2025 Q1',
    tytul: 'Panel B2B i Tryb Lokalny (Offline)',
    opis: 'Wdrożenie modułów dla firm z zarządzaniem uprawnieniami, audytem oraz 100% prywatnymi modelami LM Studio / Ollama dla wrażliwych danych.',
  },
  {
    rok: '2026',
    tytul: 'Autonomiczne Agenty i Kalendarz AI',
    opis: 'Pełna automatyzacja: integracje 24/7 z webhookami, tablicami Kanban i synchronizacją ze spotkaniami.',
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
    linki: ['Wsparcie techniczne', 'Umów demo dla firmy', 'kontakt@nextbyte.space'],
  },
] as const

