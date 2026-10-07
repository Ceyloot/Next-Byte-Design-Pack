# NextByte Canvas Studio — samodzielny pakiet

Kompletny edytor zdjęć AI z pinezkami (Canvas) wyjęty z platformy NextByte: kod, prompty, serwery pośredniczące, style Liquid Glass, konfiguracja i lista zależności w jednym folderze. Uruchamia się samodzielnie i da się go przenieść do platformy 1:1.

## Uwaga: nowy system promptowania jest domyślny

Generacja ze zdjęcia idzie teraz przez **agenta** (jedno wywołanie Gemini: dopytuje po ludzku albo pisze krótki prompt, podaje ramki i skalę) i przygotowanie zdjęć w kodzie — opis w `src/sections/canvas/nowy/README.md`. Poniższy opis przepływu dotyczy starego systemu (archiwum: tag git `prompty-v1`, folder `_schowane/prompty-v1` w repozytorium platformy).

## Szybki start

```bash
npm install
cp .env.example .env.local      # wpisz RUNWARE_API_KEY i GEMINI_API_KEY
npm run dev                     # http://localhost:5190
```

Sprawdzenie: `npm run typecheck` (typy) i `npm run build` (bundle produkcyjny).
Bez kluczy interfejs działa (wgrywanie, pinezki, płótno), ale generacja i analiza zwrócą błąd „Brak klucza”.

## Klucze (nigdy w repozytorium)

| Zmienna | Do czego | Gdzie wziąć |
|---|---|---|
| `RUNWARE_API_KEY` | generacja obrazu: Nano Banana Lite / 2 / Pro (Google) i GPT Image 2 (OpenAI) przez Runware | runware.ai |
| `GEMINI_API_KEY` | reżyser (analiza zdjęć i pinesek), rozpoznawanie obiektów i osób, opis pozy, kontrola wyniku | aistudio.google.com/apikey |

Klucze czyta wyłącznie serwer Vite (`loadEnv` bez prefiksu `VITE_`), przeglądarka rozmawia tylko z `/api/canvas/*`. `.env.local` jest w `.gitignore` i **nie jest częścią tego folderu**.

## Co jest w środku

```
src/
  App.tsx, main.tsx             powłoka: Liquid Glass włączony, filtry refrakcji, Canvas na cały ekran
  index.css                     style platformy: tokeny motywów (dark-theme, future-theme…), .nb-szklo, .nb-cta, Tailwind
  sections/
    CanvasSection.tsx           główny ekran: płótno, dok narzędzi, czat, generacja, Quick edit, kontrola wyniku
    canvas/                     cała logika Canvasa (patrz niżej)
    panel2/fundament/           powierzchnie szkła (.p2-szklo, .p2-karta…) i kolejka motywów
  components/glass/GlassModelSearch.tsx   wybór modelu z podpisami (jakość, szybkość, koszt)
  grafiki/                      znaki marek, filtry refrakcji szkła (SVG)
  lib/                          glass-context, utils (cn)
vite.config.ts                  wtyczki: runwareProxy, agentProxy, endpoint wersji
tailwind.config.ts, postcss.config.js, tsconfig*.json
CLAUDE.md                       zasady architektury Liquid Glass + lista trybów ZABLOKOWANYCH (ścieżki z prefiksem nextbyte-preview/ = tu src/…)
```

### `src/sections/canvas/`

| Plik / folder | Rola |
|---|---|
| `Plotno.tsx`, `ZnacznikPineski.tsx`, `KartaPineski.tsx` | płótno, pinezki, karta „co to jest” |
| `CzatCanvas.tsx`, `PasekPolecenia.tsx` | czat z poleceniem, chipy pinesek, wybór modelu, przełącznik promptu postaci |
| `PasekAkcji.tsx`, `Prompter.tsx`, `MenuGeneratora.tsx` | pasek nad zdjęciem (Quick edit, Inpaint, Eraser, Edit text…), pole opisu, generator z pustej ramki |
| `EkranStartowy.tsx`, `przytulny.css`, `motyw-canvasa.ts` | ekran startowy, styl „cozy”, motyw (domyślnie jasny, przełącznik na ciemny) |
| `polecenia.ts`, `tryby-edycji.ts`, `role-z-polecenia.ts`, `kontrola-polecenia.ts` | rozpoznanie intencji ze zdania, role pinesek, walidacja przed wysyłką |
| `rezyser.ts`, `agent-proxy.ts` | reżyser (Gemini): plan, opisy pinesek, skala, światło; kontrola wyniku; naprawa uciętego JSON |
| `runware-proxy.ts`, `generowanie.ts`, `dostawca.ts` | generacja przez Runware, rozpoznawanie pod pinezką, klient API |
| `prompty/` | `skladaj.ts` (składarka promptu), `operacje/` (jeden prompt na sytuację), `bricks/` (reguły), `zablokowane/` (zamrożone tryby), `postac-pdf.ts` (zmiany postaci wg PDF Studia) |
| `typy.ts`, `pamiec.ts` | typy, narzędzia obrazu (bezstratne dopasowanie formatu), zapis projektu w IndexedDB |
| `TESTY_PROMPTOW.md` | lista testów trybów (co sprawdzać po zmianach) |

## Przepływ jednej generacji

1. Użytkownik wgrywa zdjęcia, wbija pinezki (Ctrl+klik), pisze zdanie → `wykryjIntencje` (regex) wybiera tryb.
2. Rozpoznanie pod pinezką (Gemini Flash-Lite): jedna nazwa rzeczy dokładnie pod punktem.
3. Reżyser (Gemini Flash, `/api/canvas/planuj`): co jest czym, który obraz jest docelowy, światło, skala, opis miejsc. Wynik czytelny nawet po ucięciu odpowiedzi.
4. Składarka (`skladaj.ts`) buduje prompt: tryby zablokowane → ich zamrożone prompty; postacie → prompty ze Studia Zdjęć (krótki lub pełny, przełącznik w czacie); perspektywa → osobny prompt bez zakazu zmiany kamery.
5. Runware generuje obraz (PNG), wynik wraca bez rekompresji i bez sztucznego powiększania.
6. Kontrola wyniku (Gemini): czy zadanie wykonane; przy osobach też tożsamość, rozmiar i poza względem referencji.

## Modele i tryby

- Modele w czacie: Nano Banana 2 / 2 Lite / Pro (Google, `google:4@3`, `google:nano-banana@2-lite`, `google:4@2`) i GPT Image 2 (`openai:gpt-image@2.5-sunburst`).
- Tryby zablokowane (nie zmieniać bez decyzji właściciela): ruch obiektu w kadrze, transfer i swap obiektu z drugiego zdjęcia, zmiana części, zmiana scenerii, character swap — szczegóły w `CLAUDE.md` §6.
- Flagi w kodzie: `DRUGI_PRZEBIEG` (ponowna generacja po błędzie — wyłączona), `SZKIC_SCENY_SWAP` (rozmycie sceny — wyłączone), `KLUCZ_PROMPTU_POSTACI` w `localStorage` (`krotki` / `pdf`).

## Przeniesienie do platformy NextByte 1:1

1. Skopiuj do projektu docelowego: `src/sections/canvas/`, `src/sections/CanvasSection.tsx`, `src/sections/panel2/fundament/{kolejka-motywow.ts,powierzchnie.css}`, `src/components/glass/GlassModelSearch.tsx`, `src/grafiki/{znaki-marek.tsx,filtry-szkla.tsx,mapa-*.ts}`, `src/lib/{glass-context.tsx,utils.ts}`.
2. W `vite.config.ts` dodaj `runwareProxy()`, `agentProxy()` i wtyczkę `nb-wersja` oraz `define` dla `__CANVAS_WERSJA__` i `__SERWER_START__` (jak w tym pliku).
3. Zależności: `react`, `react-dom`, `clsx`, `tailwind-merge`, `lucide-react` (+ `tailwindcss@3`, `postcss`, `autoprefixer`, `vite`, `@vitejs/plugin-react`, `typescript`).
4. Style: tokeny motywów i klasy `.nb-szklo`, `.nb-cta` żyją w `src/index.css` — w platformie już są. Alias `@` → `./src`, `tailwind.config.ts` z kolorami `hsl(var(--…))`.
5. Zamontuj `<CanvasSection onWyjdz={…} />` w kontenerze `position: relative` o pełnej wysokości (korzeń Canvasa to `absolute inset-0`) z zmiennymi `--nb-canvas-gora` / `--nb-canvas-dol` (np. `16px`) i filtrami `<NbGlassFilters />` w drzewie.
6. Klucze w `.env.local` platformy.

## Produkcja

Serwery pośredniczące (`runware-proxy.ts`, `agent-proxy.ts`) to wtyczki Vite — działają w `npm run dev` i `npm run preview`. W produkcji przenieś je 1:1 do funkcji serwerowych (ten sam kontrakt: `POST /api/canvas/{generuj,planuj,rozpoznaj,sprawdz,klasyfikuj,analizuj,zmierz,tozsamosc}`); klient (`dostawca.ts`) nie wymaga zmian. Nigdy nie umieszczaj kluczy w zmiennych `VITE_*`.

## Znane ograniczenia

- Rozdzielczość wyniku zależy od modelu (ok. 1 Mpx); pakiet nie powiększa obrazu sztucznie.
- Koszt w interfejsie (⟠) jest stały dla wszystkich modeli; realny koszt GPT Image u dostawcy może być inny.
- Analiza reżysera zatrzymuje generację przy ostatecznym błędzie (bez planu wynik bywał zdjęciem bez zmian za pełną cenę).
