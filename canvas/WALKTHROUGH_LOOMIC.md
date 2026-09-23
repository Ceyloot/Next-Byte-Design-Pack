# Podsumowanie Wdrożenia: Canvas oparty o Loomic

## 1. Rozwiązanie Problemu Duplikacji Obiektów („Dwa domki”)
W starszej wersji Canvasu (`nextbyteart` oraz wczesny prototyp w `nextbyte-preview`) operacja „przenieś” (`przenies`) skutkowała dorysowaniem drugiego egzemplarza obiektu w nowym miejscu, pozostawiając stary obiekt nietkniętym na wzgórzu.

### Dlaczego tak się działo?
1. Modele dyfuzyjne i generatywne (w tym rodzina Google Gemini Nano-Banana) przy podaniu całego obrazu wejściowego i zwykłego polecenia tekstowego (nawet z celownikiem) **działają addytywnie** — dodają nowe piksele tam, gdzie wskazuje prompt, nie mając mechanicznego wymuszenia usunięcia obiektu źródłowego.
2. Brakowało **Maski Podwójnej (Dual-Mask)**: strefa źródłowa nie była wycinana/nadpisywana maską inpaintingu.

### Jak to naprawiliśmy na wzór Loomic:
- Utworzono moduł [maskUtils.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/maskUtils.ts) z funkcją `createDualTransferMask`:
  - **Maska Strefy 1 (Źródło)**: Oznacza obszar wokół Pin 1 do **całkowitej eliminacji i rekonstrukcji tła** (Clean Plate).
  - **Maska Strefy 2 (Cel)**: Oznacza obszar pod Pin 2 do **syntezy i wtapiania obiektu**.
- Utworzono [jsonPromptEngine.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/jsonPromptEngine.ts), który zamiast wolnego tekstu generuje ścisły kontrakt JSON:
  - `1_SOURCE_CLEAN_PLATE`: Bezwzględna rekonstrukcja tła pod Pin 1.
  - `2_DESTINATION_INJECTION`: Generacja przeniesionego obiektu pod Pin 2.
  - `3_SINGULARITY_ENFORCEMENT`: Wymuszenie dokładnie jednej instancji obiektu w całym kadrze.

---

## 2. Moduły Silnika Canvas (Loomic Engine)

| Plik | Rola |
|---|---|
| [Canvas.tsx](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/Canvas.tsx) | Główny komponent studia: płótno React-Konva, pasek narzędzi, pinezki, boczny dock AI i warstw |
| [canvasStore.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/store/canvasStore.ts) | Stan Zustand + IndexedDB: warstwy, pinezki, modele Nano-Banana, statusy generacji, pozycjonowanie warstw |
| [googleGenAI.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/googleGenAI.ts) | Bezpośredni klient przeglądarkowy dla Google GenAI (Nano-Banana 2, Nano-Banana, Nano-Banana Pro) |
| [jsonPromptEngine.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/jsonPromptEngine.ts) | Kompilator promptów ustrukturyzowanych Loomic (transfer, dodawanie, usuwanie, modyfikacja) |
| [maskUtils.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/maskUtils.ts) | Dual-Mask transfer, inpainting blob mask, wycinanie miniatury zoom (cropImageAtPoint) |
| [canvasAI.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/canvasAI.ts) | Autonomiczna analiza obiektów pod pinezkami przy użyciu Gemini Vision |
| [canvasPrompts.ts](file:///c:/Users/Artur/Desktop/Next-Byte-Design-Pack/canvas/lib/canvasPrompts.ts) | Zestaw szablonów chirurgicznych transferów i podmian tożsamości |

---

## 3. Przetestowane Aspekty
- [x] Usunięcie wszelkich uszkodzonych aliasów importów (`@/components/ui/button`, `@/components/ui/TechGrid`, `@/lib/master-prompts`, `../../../lib/gemini`).
- [x] Pełna kompatybilność z przeglądarką bez konieczności stawiania zewnętrznego proxy (klucz API Gemini zapisywany lokalnie w `localStorage`).
- [x] Poprawne generowanie masek dwustrefowych dla operacji przenoszenia.
