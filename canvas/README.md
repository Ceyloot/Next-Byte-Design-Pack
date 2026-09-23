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
| `lib/canvasAI.ts` | wołanie Gemini — analiza wskazanego obiektu na zdjęciu |
| `lib/canvasPrompts.ts` | budowanie promptów |

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
