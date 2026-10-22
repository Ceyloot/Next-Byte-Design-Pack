import { Headphones, Presentation, ClipboardList, Layers, CircleHelp, BarChart, Table2, BookOpen, HelpCircle, LineChart } from 'lucide-react';

export const STUDIO_TOOLS = [
  {
    id: 'audio',
    label: 'Podcast audio',
    icon: Headphones,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Podcast z 2 głosami',
    prompt: `Na podstawie moich źródeł wygeneruj skrypt rozmowy audio z dwoma osobami (PREZENTER 1 i PREZENTER 2).

ZASADY BRZMIENIA — tekst trafi do syntezatora mowy:
- Wstęp naturalny jak między znajomymi: nie "cześć wszystkim, dzisiaj omówimy" — zamiast tego coś jak "Słuchaj, mam do ciebie pytanie o..." albo "Wiesz co, właśnie mi coś nie daje spokoju..."
- Mów jak ludzie gadają, nie jak lektor. Potoczna polszczyzna.
- Zdania krótkie, myśli często dokańczane przez drugą osobę
- Naturalne wejścia i reakcje: "o kurczę...", "właśnie!", "serio?", "no tak ale..."
- Reaguj emocjonalnie — zaskoczenie, entuzjazm, wątpliwości
- Koniec naturalny — rozmowa stopniowo się urywa. ZAWSZE kończ pełnymi zdaniami.
- ZERO oznaczeń źródeł, tytułów materiałów, nawiasów z cytatami

PREZENTER 1 zna temat głębiej i tłumaczy. PREZENTER 2 jest szczerze ciekawy, czasem się myli i koryguje w trakcie.
Format: "PREZENTER 1: tekst" i "PREZENTER 2: tekst" (każda kwestia od nowej linii)
DŁUGOŚĆ: 15-25 wymian. Każda kwestia MAKSYMALNIE 60 słów. Łączna liczba słów: około 1200.`,
  },
  {
    id: 'slides',
    label: 'Prezentacja',
    icon: Presentation,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Prezentacja slajdów',
    prompt: `Stwórz prezentację slajdową z moich źródeł.

Format KAŻDEGO slajdu:

## Slajd N: Tytuł Slajdu

- Punkt 1 (krótko, max 10 słów)
- Punkt 2
- Punkt 3

*Notatki prelegenta: Tutaj rozwinięcie — 2-3 zdania.*

Wymagania:
- Slajd 1: Tytułowy (tytuł prezentacji + krótki podtytuł)
- Slajdy 2-9: Treść merytoryczna (max 4 punkty na slajd)
- Slajd ostatni: Podsumowanie — 3 kluczowe wnioski
- Max 10 slajdów. Notatki prelegenta pod KAŻDYM slajdem w kursywie`,
  },
  {
    id: 'report',
    label: 'Raport',
    icon: ClipboardList,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Profesjonalny raport',
    prompt: `Wygeneruj profesjonalny raport na podstawie moich źródeł.

## Streszczenie
Krótkie podsumowanie (3-4 zdania).

## Źródła i metodologia
Lista analizowanych źródeł.

## Kluczowe odkrycia
Główne wnioski pogrupowane tematycznie. Każdy wniosek poparty cytatem.

## Analiza szczegółowa
Głębsza analiza najważniejszych tematów.

## Rekomendacje
Konkretne wskazówki wynikające z analizy.

Pisz formalnym, ale przystępnym językiem.`,
  },
  {
    id: 'flashcards',
    label: 'Fiszki',
    icon: Layers,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Karty do nauki',
    prompt: `Wygeneruj 10-15 fiszek do nauki na podstawie moich źródeł.

Format KAŻDEJ fiszki (puste linie MIĘDZY każdą sekcją):

### Fiszka N

PYTANIE: [pytanie testujące zrozumienie]

ODPOWIEDŹ: [zwięzła odpowiedź, 1-3 zdania]

Pytania muszą testować ZROZUMIENIE, nie zapamiętywanie. Mieszaj typy: "dlaczego?", "jaka jest różnica?", "kiedy stosować?". Rosnąca trudność.`,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: CircleHelp,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Test wiedzy',
    prompt: `Stwórz quiz z 10 pytań testowych na podstawie moich źródeł.

Format KAŻDEGO pytania (puste linie MIĘDZY sekcjami):

### Pytanie N

[treść pytania]

- A) opcja pierwsza
- B) opcja druga
- C) opcja trzecia
- D) opcja czwarta

Poprawna odpowiedź: [litera]) [pełna treść odpowiedzi]. Wyjaśnienie: [dlaczego ta odpowiedź jest poprawna]

Wymagania: 4 opcje (A-D) jako lista, mix trudności: 4 łatwe, 4 średnie, 2 trudne. Na końcu ## Wyniki z progami.`,
  },
  {
    id: 'infographic',
    label: 'Infografika',
    icon: BarChart,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Wizualna infografika',
    prompt: `Stwórz tekstową infografikę podsumowującą moje źródła.

- Nagłówki sekcji z emoji (np. ## 🎯 Cel główny)
- Kluczowe liczby i statystyki (jeśli są w źródłach)
- Krótkie fakty w bullet points (max 8 słów każdy)
- Porównania i kontrasty
- Na końcu: cytat podsumowujący lub kluczowy wniosek

Format: zwięzły (max 200 słów), skanowany wzrokiem, atrakcyjny wizualnie.`,
  },
  {
    id: 'chart',
    label: 'Wykres',
    icon: LineChart,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Wykresy z danych',
    prompt: `Przeanalizuj moje źródła i wygeneruj wykresy dla wszystkich danych liczbowych, statystyk, porównań i trendów.

Dla KAŻDEGO zbioru danych zwróć blok:

\`\`\`chart
{"type":"bar","title":"Tytuł","labels":["et1","et2"],"datasets":[{"label":"Seria","data":[val1,val2]}]}
\`\`\`

Zasady: "bar" — porównania, "line" — trendy, "pie" — udziały % (max 6 kategorii). Przed każdym blokiem jedno zdanie opisu. Jeśli brak danych liczbowych — napisz o tym wprost.`,
  },
  {
    id: 'table',
    label: 'Tabela danych',
    icon: Table2,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Tabele danych',
    prompt: `Wyodrębnij najważniejsze informacje z moich źródeł i przedstaw je w tabelach Markdown.

- Dobierz kolumny do treści
- Osobna tabela dla każdego tematu z nagłówkiem ## przed
- Dane konkretne i precyzyjne
- Max 15 wierszy na tabelę
- Min 3 kolumny na tabelę
- Jeśli tabela zawiera dane LICZBOWE, dodaj po niej blok wykresu:
\`\`\`chart
{"type":"bar","title":"Tytuł","labels":[...],"datasets":[{"label":"Seria","data":[...]}]}
\`\`\``,
  },
  {
    id: 'glossary',
    label: 'Słownik pojęć',
    icon: BookOpen,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Pojęcia i definicje',
    prompt: `Stwórz słownik pojęć na podstawie moich źródeł.

## [Litera alfabetu, np. A]

- **Termin**: Definicja (1-3 zdania). Kontekst lub przykład użycia jeśli dotyczy.

Wyodrębnij tylko kluczowe pojęcia, definicje, terminy techniczne, akronimy. Posortuj alfabetycznie. Pisz zrozumiałym językiem.`,
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    color: 'text-foreground/55',
    bg: 'bg-foreground/[0.06]',
    description: 'Pytania i odpowiedzi',
    prompt: `Wygeneruj listę FAQ na podstawie moich źródeł.

## Pytanie N: [treść pytania]

**Odpowiedź:** [wyczerpująca odpowiedź, 2-4 zdania]

8-10 pytań które zadałby czytelnik lub mogą pojawić się na egzaminie. Unikaj oczywistych pytań — skup się na kluczowych zagadnieniach i często mylonych pojęciach.`,
  },
];
