import {
  Brain, Camera, NotebookPen, Workflow, Cpu, Zap, Users, MessageSquare,
  Shield, Sparkles, Layers, Clock, Building2, Lock, Gauge, GitBranch,
  Rocket, BadgeCheck, Headphones, KeyRound, ServerCog, FileStack,
  Calendar, Mic, Bot, Repeat, CheckCircle2, Radar,
} from 'lucide-react'
import { AKCENT } from './shared'

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
      'Wspólny kontekst dla wszystkich dostawców — koniec z przeklejaniem promptów',
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
    tag: 'Asystent NextByte',
    title: 'Asystent NextByte w ekosystemie',
    lead: 'Autonomiczny agent wykonawczy: porusza się po ekosystemie, tworzy notatki, generuje dokumenty, odpala research i planuje zadania.',
    models: ['Claude Thinking', 'GPT-5.4 Auto', 'Agentic Loop'],
    bullets: [
      'Samodzielnie tworzy notatki i generuje dokumenty bez ręcznego przepisywania',
      'Uruchamia research i natychmiast wyciąga kluczowe wnioski',
      'Wpisuje terminy do kalendarza i pilnuje realizacji zadań',
      'Pracuje na pełnym kontekście firmy, a nie ogólnikach z sieci',
    ],
    metryki: [
      { label: 'Tryb pracy', value: 'Autonomiczny agent' },
      { label: 'Zadania', value: 'Auto-dyspozycja' },
      { label: 'Kalendarz', value: 'Dwukierunkowy sync' },
    ],
  },
  {
    id: 'research',
    icon: Radar,
    color: AKCENT.chat,
    tag: 'Deep Research',
    title: 'Autonomiczny Deep Research',
    lead: 'Wielowątkowe przeszukiwanie do 40 źródeł, weryfikacja faktów i synteza wyczerpującego raportu w 30 sekund.',
    models: ['Deep Search', 'Live Web', 'Cross-Validation'],
    bullets: [
      'Równoległa eksploracja do 40 źródeł w czasie rzeczywistym',
      'Krzyżowa weryfikacja faktów eliminująca halucynacje',
      'Gotowy raport executive z tabelami i cytowaniami',
      'Eksport raportów do PDF, Word i Markdown',
    ],
    metryki: [
      { label: 'Eksploracja', value: 'Do 40 źródeł równolegle' },
      { label: 'Weryfikacja', value: 'Cross-model validation' },
      { label: 'Czas', value: '~30 sekund' },
    ],
  },
  {
    id: 'creator',
    icon: Rocket,
    color: AKCENT.chat,
    tag: 'Akademia & Twórcy',
    title: 'Akademia AI i Panel Twórcy',
    lead: 'Ucz się z certyfikowanych kursów AI lub publikuj własne materiały i zarabiaj na sprzedaży wiedzy i automatyzacji.',
    models: ['Kursy AI', 'Szablony', 'Marketplace'],
    bullets: [
      'Panel Twórcy: twórz, wyceniaj i monetyzuj własne kursy i szablony',
      'Sklep & Marketplace: kupuj sprawdzone workflow i prompty biznesowe',
      'Akademia AI: praktyczne ścieżki wdrożeniowe krok po kroku po polsku',
      'Wypłata zysków bezpośrednio w PLN z pełną fakturą VAT 23%',
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
    lead: 'Tablice wizualne, semantyczne notatki, kalendarz i zadania połączone w jeden płynny organizm.',
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
  { value: '0 zł',    label: 'Modele lokalne', sub: 'Ollama i LM Studio bez opłat',        icon: Sparkles },
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
    { f: 'Chat z wieloma modelami (GPT-5.4, Claude, Gemini, Grok)', v: [true, 'Tylko GPT-5.4', false, 'Tylko OpenAI'] },
    { f: 'Generowanie grafik 4K (Nano Banana, GPT Image 2.0)',     v: [true, 'DALL-E (limit)', true, false] },
    { f: 'Generowanie wideo AI (Runware, Kling)',                  v: [true, false, false, false] },
    { f: 'Głos AI i transkrypcja spotkań',                        v: [true, 'podstawowy', false, 'Meeting Notes'] },
    { f: 'Notatki AI i semantyczna baza wiedzy',                  v: [true, false, false, true] },
    { f: 'Kanban, zadania i Kalendarz AI',                        v: [true, false, false, true] },
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
      'Kalendarz, Zadania i Notatki bez żadnych limitów',
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

/* ══════════════ AUTENTYCZNE OPINIE UŻYTKOWNIKÓW ══════════════ */
export const OPINIE = [
  {
    id: '01',
    kategoria: 'Studio Kreatywne & Agencja',
    rola: 'Agencja marketingowa · Zespół 6 os.',
    tekst: 'Zamiast utrzymywać 4 osobne subskrypcje na ChatGPT, Claude i Midjourney — cały zespół pracuje w jednym panelu. Zadania i notatki z rozmów trafiają od razu na Kanban, a faktura VAT w PLN upraszcza księgowość.',
    metryka: '2h oszczędności dziennie',
  },
  {
    id: '02',
    kategoria: 'Praca z Danymi Poufnymi',
    rola: 'Konsulting & Audyt IT',
    tekst: 'Prywatny tryb lokalny z modelami Llama i DeepSeek przez Ollama to dla nas kluczowy standard przy wrażliwych dokumentach. Żadne dane nie opuszczają stacji roboczej, a platforma działa bez zarzutu.',
    metryka: '100% poufności offline',
  },
  {
    id: '03',
    kategoria: 'Freelance & Produkcja Treści',
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
    a: 'Możesz podłączyć darmowe programy takie jak Ollama czy LM Studio i uruchamiać modele (np. Llama, Mistral, Gemma) bezpośrednio na swoim komputerze. Żadne dane nie wychodzą do sieci, pracujesz nawet offline, a za lokalne generacje nie zużywasz ani jednego Byte.',
  },
  {
    q: 'Czym są jednostki Byte i jak działają?',
    a: 'Byte to elastyczna waluta platformy. Płacisz tylko za to, co faktycznie wygenerujesz (widzisz dokładny koszt przed wysłaniem zapytania). W planach abonamentowych niewykorzystane Byte przechodzą na kolejny miesiąc — nic nie przepada.',
  },
  {
    q: 'Czy muszę podawać kartę płatniczą przy rejestracji?',
    a: 'Nie. Możesz założyć konto za 0 zł i od razu korzystać z interfejsu, notatek, kalendarza oraz modeli lokalnych offline bez podawania jakichkolwiek danych płatniczych.',
  },
  {
    q: 'Czy mogę zrezygnować w dowolnym momencie?',
    a: 'Tak, w każdym momencie jednym kliknięciem w ustawieniach konta. Bez okresów wypowiedzenia, bez ukrytych opłat i bez zbędnych formalności.',
  },
  {
    q: 'Jak dbacie o bezpieczeństwo moich danych i prywatność?',
    a: 'Nasza infrastruktura oparta jest na serwerach w Unii Europejskiej z pełną zgodnością z RODO i szyfrowaniem E2EE. Żadne Twoje rozmowy ani dokumenty nie są wykorzystywane do trenowania publicznych modeli AI.',
  },
] as const

export const LOGOTYPY = TECH_PARTNERZY

/* Orientacyjny koszt pojedynczej operacji w jednostkach Byte. */
const KOSZT_BYTE = {
  wiadomosc:    1,
  grafika4k:    6,
  minutaAudio:  2,
} as const

/**
 * Zamienia pulę Byte na orientacyjną liczbę operacji ("To wystarczy na...").
 * Używane na karcie planu w cenniku — zwraca wiersze gotowe do wyrenderowania.
 */
export function przelicznikByte(byte: number) {
  return [
    { icon: MessageSquare, label: 'wiadomości w Chat AI', value: Math.round(byte / KOSZT_BYTE.wiadomosc) },
    { icon: Camera,        label: 'grafik 4K w Studio',   value: Math.round(byte / KOSZT_BYTE.grafika4k) },
    { icon: Mic,           label: 'minut transkrypcji',   value: Math.round(byte / KOSZT_BYTE.minutaAudio) },
  ]
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
    tytul: 'Kalendarz AI, Studio Wideo i Głos AI',
    opis: 'Pełny zestaw twórcy: generowanie klipów, transkrypcje spotkań i kalendarz spięty z tablicami Kanban.',
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

