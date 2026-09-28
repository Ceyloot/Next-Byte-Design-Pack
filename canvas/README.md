# Canvas

Moduł kanwy generatywnej przeniesiony z biblioteki **NextByteArt**
(`src/pages/CanvasPage.tsx` + `src/features/canvas/`). To osobny projekt niż
edytor designerski w `nextbyte-preview/src/sections/edytor/` — tutaj zdjęcia są
**wejściem dla modelu**, a pineski opisują, co ma zostać wygenerowane.

Baza pod dalszą pracę. Nie jest jeszcze wpięty w żadną aplikację, bo
`nextbyte-preview` nie ma wymaganych zależności i wpięcie go teraz
wywróciłoby build.

## Co jest w środku

| Plik | Zawartość |
|---|---|
| `Canvas.tsx` | widok kanwy: warstwy obrazów, pineski, narzędzia, panel generowania |
| `store/canvasStore.ts` | stan kanwy (zustand): warstwy, pineski, aktywne narzędzie |
| `lib/canvasAI.ts` | Gemini: analiza obiektu pod pinezką + klasyfikacja operacji |
| `lib/googleGenAI.ts` | klient Google GenAI (Nano-Banana) |
| `lib/maskUtils.ts` | maski inpaintingu, dual-mask, crop |
| `lib/jsonPromptEngine.ts` | Json Prompts Engine — adapter nad silnikiem sklejania |
| `lib/canvasPrompts.ts` | fasada re-eksportująca przestrzeń `prompts/` |
| `prompts/` | **przestrzeń promptów** — patrz niżej |

## Przestrzeń promptów (`prompts/`)

Żaden prompt nie jest już zaszyty w logice. Prompty to oddzielne, ponumerowane
moduły, sklejane w stałej strukturze:

```
[ STAŁE MODYFIKATORY ]  światło, ziarno, środowisko, tożsamość, pozycja, skala  (na górze)
[ PROMPT SYTUACYJNY  ]  wybierany DYNAMICZNIE przez Gemini (object_swap, transfer, removal…)
[ OPIS GENERACJI     ]  {{SUBJECT}} — co ma powstać (od Gemini)
[ PROMPT POZYTYWNY   ]  ogólne wytyczne jakości  (na dole)
```

| Plik | Rola |
|---|---|
| `prompts/types.ts` | typy, tokeny referencyjne `{{...}}`, zamknięty słownik `OperationId` |
| `prompts/composer.ts` | silnik sklejania (stałe → operacja → opis → pozytyw) |
| `prompts/registry.ts` | centralny rejestr modułów (Gemini + Runware) |
| `prompts/gemini/{constants,operations,positive}.ts` | prompty Gemini |
| `prompts/runware/{constants,operations,positive}.ts` | prompty Runware (FLUX/SDXL, + negatyw) |

Tokeny `{{IMAGE_1}}`, `{{IMAGE_2}}`, `{{LIGHT_REF}}`, `{{IDENTITY_REF}}`,
`{{POSITION_REF}}` itd. podmienia silnik. Gemini decyduje o operacji, więc
prompt z `object_swap` nie zostanie użyty, gdy sytuacja nim nie jest.

## Czego brakuje do uruchomienia

Zależności, których `nextbyte-preview` nie ma:

```
konva react-konva use-image zustand @google/genai
```

Dwa importy zostały na aliasach z projektu źródłowego i trzeba je podmienić
albo przenieść:

- `Canvas.tsx` — `@/components/ui/button`, `@/components/ui/TechGrid`
- `lib/canvasPrompts.ts` — `@/lib/master-prompts`

Ścieżki do `store/` i `lib/` są już względne, więc po dołożeniu zależności
moduł da się wpiąć bez grzebania w środku.
