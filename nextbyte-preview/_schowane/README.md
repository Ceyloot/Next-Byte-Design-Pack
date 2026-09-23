# Schowane

Kod odpięty z aplikacji, ale zachowany. Leży poza `src/`, więc Vite i
TypeScript go nie widzą — nic nie kompiluje się na próżno i nic nie zaśmieca
interfejsu.

## edytor/ + EdytorSection.tsx

Edytor designerski: kanwa wektorowa, parametryczne wypełnienia i cienie,
przyciąganie, grupy, oś czasu z klatkami kluczowymi, graf stanów, eksport do
SVG/React/CSS.

Odpięty na prośbę Artura — okazał się za mało intuicyjny w obsłudze, a
priorytetem został Canvas. Kod działa i przechodzi kontrolę typów; żeby go
wrócić wystarczy:

1. przenieść `edytor/` do `src/sections/edytor/` i `EdytorSection.tsx` do
   `src/sections/`,
2. w `src/App.tsx` i `src/sections/PreviewSection.tsx` dopisać zakładkę
   `edytor` obok istniejącej `canvas` (import, wpis w liście zakładek,
   `case` w przełączniku sekcji i warunek pełnej wysokości w `<main>`).

Nic poza tymi dwoma plikami nie odwołuje się do edytora.
