# Canvas

Kanwa generatywna: zdjęcia są **wejściem dla modelu**, a pineski opisują, co ma zostać zrobione.
Cała logika promptów jest w jednym miejscu — `prompts/` — i składa się z trzech sekcji:

1. **Prompty Gemini** (`prompts/gemini/`) — analiza: które zdjęcie jest docelowe + skala (kotwice i rzeczywiste wymiary).
2. **Operacje** (`prompts/operacje/`) — jeden prompt na sytuację: object swap, character swap, object transfer, removal, addition…
3. **Bricks** (`prompts/bricks/`) — cegiełki-zasady (light rule, position rule, character identity rule…), bez których generacja nie może przejść.

Nic poza `prompts/` nie zawiera treści promptów. Reszta kodu tylko je wysyła i składa.

> **Gdzie to działa.** Ten folder (`canvas/`) jest samodzielną paczką z pełnym pipeline'em (dwa prompty Gemini → bricki → generacja) i **nie jest podpięty do żadnej aplikacji**.
> W `nextbyte-preview` działa ta sama logika **bricków i operacji** — kopia przestrzeni promptów w `nextbyte-preview/src/sections/canvas/prompty/`.
> Źródłem prawdy jest `canvas/prompts/`. Po każdej zmianie bricków, operacji lub składarki uruchom `skrypty/sync-prompty-canvas.sh`, żeby odświeżyć kopię (nie edytuj `prompty/` ręcznie).
> Po generacji preview dodatkowo dopasowuje ziarno obiektu (`dopasuj-ziarno.ts`): mierzy ziarno tła i dosypuje brakujące wyłącznie w obszarze zmiany, gdy obiekt jest mierzalnie gładszy od otoczenia.
> Preview ma własnego reżysera (`rezyser.ts`), który w jednym wywołaniu robi to, co tu robią dwa prompty Gemini: wybiera zdjęcie docelowe i operację oraz opisuje scenę. Analiza pineski (nazwa, wymiary) jest robiona zaraz po jej postawieniu.

---

## Struktura

```
canvas/
  Canvas.tsx                 widok kanwy: warstwy, pineski, narzędzia, panel generowania
  store/canvasStore.ts       stan (zustand): warstwy, pineski, narzędzie
  lib/
    pipeline.ts              CAŁY PRZEPŁYW: pineski → Gemini → prompt (patrz niżej)
    geminiClient.ts          transport do Gemini (2 analizy); bez żadnych promptów
    googleGenAI.ts           klient modelu obrazu (Nano-Banana)
    maskUtils.ts             maski, miniatury, magentowe kropki na kopiach dla Gemini
  prompts/
    types.ts                 typy, zamknięty słownik operacji i bricków
    gemini/
      01-zdjecie-docelowe.ts prompt 1: zdjęcie docelowe + operacja + role pinesek
      02-opis-sceny.ts       prompt 2: tylko skala (kotwice, wymiary pinesek)
      wspolne.ts             model, konfiguracja, parser JSON
    operacje/                15 plików: jedna operacja = jeden plik
    bricks/                  30 plików: jeden brick = jeden plik (numerowane)
    pozytyw.ts               blok pozytywny na samym dole promptu
    skladaj.ts               SKŁADARKA: bricks + operacja + opis + polecenie → prompt
  PRZYKLAD_PROMPTOW.md       pełne, złożone prompty (object swap, object transfer)
```

---

## Kolejność działania (krok po kroku)

Za całość odpowiada `lib/pipeline.ts` → `przygotujGeneracje()`. Po nim `Canvas.tsx` wywołuje `generateGoogleImage()`.

### Krok 0 — użytkownik stawia pineski
- Każda pineska dostaje numer (1, 2, …) i współrzędne znormalizowane `X, Y` (0–1) względem swojego zdjęcia. Współrzędne żyją tylko w kodzie (kropki, maski) i nie trafiają do promptu.
- Zaraz po postawieniu robi się miniatura i szybkie nazwanie obiektu pod pineską (**prompt Gemini nr 2** wywołany dla jednej pineski).
- Pineski mogą leżeć na różnych zdjęciach (np. pineska 1 na wazonie ze zdjęcia B, pineska 2 na lampie ze zdjęcia A).

### Krok 1 — kolejność zdjęć i kopie z markerami
- Zdjęcia są wysyłane do Gemini **w kolejności pierwszej pineski**, którą na nich postawiono. Zaznaczone zdjęcie bez pinesek dołącza na końcu.
- Dla każdego zdjęcia powstaje **kopia z ponumerowanymi magentowymi kropkami** (`#FF00FF` + celownik + numer).
- **Dlaczego kopia:** kropka jest po to, żeby Gemini widział dokładnie, o który punkt chodzi. Do generatora trafia osobna kopia z małą kropką bez numeru (`drawGenerationDots`).

### Krok 2 — Gemini nr 1: zdjęcie docelowe, operacja, role
Prompt: `prompts/gemini/01-zdjecie-docelowe.ts`. Gemini widzi wszystkie zdjęcia z kropkami, listę pinesek i polecenie użytkownika, po czym zwraca JSON:
- `targetImage` — **które zdjęcie jest docelowe** (tam powstaje wynik), reszta to dawcy,
- `operation` — **jedna operacja z zamkniętej listy 15** (nie wymyśla własnych),
- `pins[].role` — rola każdej pineski: `source` (co przenosimy / bierzemy) albo `target` (miejsce docelowe / co zastępujemy).

**Dlaczego tak:** typ operacji musi być znany **przed** składaniem, bo od niego zależy, które bricki wejdą do promptu. Zamknięta lista sprawia, że Gemini nie użyje `object_swap`, gdy sytuacją jest np. przeniesienie domku.
Gdy Gemini nie odpowie albo zwróci uszkodzony JSON, działa analiza domyślna (`domyslnaAnalizaDocelowego`): zdjęcie z ostatnią pineską = docelowe, jedna pineska = `target`, dwie = `source` + `target`.

### Krok 3 — przestawienie: Image 1 = zdjęcie docelowe
- Zdjęcia dostają nowe numery: **Image 1 = docelowe**, dalej dawcy (Image 2, 3…). Pineski są przenumerowane na nowe numery zdjęć.
- **Dlaczego tak:** model obrazu ma jedną stałą zasadę — wynik to Image 1 z jedną zmianą. Format, proporcje, kadr, rozdzielczość i ziarno bierze **wyłącznie z Image 1**, nigdy z dawcy. Dzięki temu zawsze wiadomo, z którego zdjęcia „przyjmujemy format”.

### Krok 4 — Gemini nr 2: tylko skala
Prompt: `prompts/gemini/02-opis-sceny.ts`. Dostaje zdjęcia **już w nowej kolejności** i raportuje wyłącznie rzeczywiste rozmiary (żadnego opisu wyglądu, światła ani nastroju):
- `anchors` — obiekty o znanym rozmiarze widoczne w Image 1 (drzwi, człowiek, kostka brukowa),
- dla każdej pineski: `name` (cały obiekt, nie tylko punkt pod celownikiem) i `size` (wymiary rzeczywiste z porównaniem do kotwicy).

**Dlaczego tak:** model ma dostać tylko to, czego sam nie zgadnie — realistyczną skalę. Wygląd, światło i ziarno bierze ze zdjęcia i z bricków. Miejsce pineski opisuje słowami reżyser (w podglądzie) — model nie widzi znaczników.

### Krok 5 — składanie promptu (bricks + operacja)
`prompts/skladaj.ts` → `skladajPrompt()`. Z wybranej operacji bierze listę bricków, sortuje je po numerze i składa w **stałej kolejności**:

| # | Sekcja | Zawartość |
|---|---|---|
| 1 | `IMAGES` | który obraz jest czym, kolejność wysyłki, format wyniku (rozmiar Image 1), maska |
| 2 | `RULES` | bricki operacji, rosnąco po numerze (zwięzłe, ≤ ~2000 tokenów) |
| 3 | `OPERATION` | misja + kroki wybranej operacji |
| 4 | `PIN MAP` | pineski: rola, obraz, nazwa, współrzędne kropki (x/y w %), miejsce opisane słowami, wymiary |
| 5 | `SCALE` | rzeczywisty rozmiar obiektu i kotwice skali |
| 6 | `COMMAND` | słowa użytkownika, bez zmian |
| 7 | `FINAL CHECK` | trzy sprawdzenia tuż przed końcem: pozycja (dokładnie w opisanym miejscu pineski), ziarno (to samo co otoczenie), czysty wynik (bez cyfr i znaczników); pozycja tylko gdy operacja włączyła brick pozycji |
| 8 | `FINAL QUALITY` | blok pozytywny (`pozytyw.ts`) |

**Dlaczego tak:** zasady stałe idą na górę (najsilniej wiążą), potem konkretna operacja, potem fakty o tej scenie, na końcu polecenie. `FINAL CHECK` powtarza krótko to, co w praktyce zawodzi najczęściej (pozycja, ziarno obiektu, znaczniki w wyniku), bo model najmocniej trzyma początek i koniec promptu.

### Krok 6 — maska obszaru pracy
- Tylko na obrazie docelowym, tylko gdy operacja działa lokalnie (bez `background_change`, `season_change`, `time_of_day_change`, `style_change`).
- Przeniesienie w obrębie jednego zdjęcia → maska dwustrefowa (stare + nowe miejsce). Pozostałe → plama wokół pineski docelowej.
- Gdy maska jest, składarka dopisuje do `IMAGES`, że ostatni obraz to maska (przewodnik, nie referencja).

### Krok 7 — generacja
- `generateGoogleImage()` dostaje: prompt, zdjęcia z małymi kropkami pinesek (docelowe pierwsze, potem dawcy), maskę i proporcje najbliższe Image 1.
- Wynik ląduje na płótnie jako nowa warstwa o wymiarach zdjęcia docelowego.

---

## Jak wskazywane jest miejsce (kropka + współrzędne)

Miejsce wskazują dwie rzeczy naraz:

| Gdzie | Jak jest wskazany punkt |
|---|---|
| Do Gemini (kroki 2 i 4) | numerowana magentowa kropka z celownikiem na kopii zdjęcia |
| Do generatora (krok 7) | **mała magentowa kropka** (bez numeru) na kopii zdjęcia w miejscu pineski + w `PIN MAP` jej współrzędne: `dot at x=48%, y=62%` (procent od lewej / od góry tego obrazu) oraz krótki opis słowny miejsca |

Kropka jest tylko wskazówką: brick `output-contract-rule` i `FINAL CHECK` każą ją usunąć z wyniku (piksele pod nią mają wyglądać jak naturalna powierzchnia). Pineski chronione nie dostają kropki. Przy generacji na wycinku (podgląd) współrzędne dotyczą wycinka, który model widzi jako Image 1.

Tokeny w treści bricków i operacji (podmienia je składarka):

| Token | Znaczy |
|---|---|
| `{{IMAGE_TARGET}}` | zawsze `Image 1` |
| `{{IMAGE_DONOR}}` | obraz dawcy (albo „the reference described in the COMMAND”) |
| `{{PIN_TARGET}}` | pineska docelowa: numer, obraz, nazwa, X/Y |
| `{{PIN_SOURCE}}` | pineska źródłowa |
| `{{PIN_CLEAR}}` | miejsce do wyczyszczenia (clean plate): przy zamianie i usunięciu pineska docelowa, przy przeniesieniu stare miejsce |

Gdy nie ma czego czyścić na zdjęciu docelowym (np. przenoszony obiekt leży na zdjęciu-dawcy), brick `clean-plate-rule` jest automatycznie pomijany.

---

## Sekcja 2 — Operacje

Każda operacja (`prompts/operacje/*.ts`) ma: `id`, `kiedyUzyc` (to czyta Gemini), listę bricków, wymaganie dawcy, flagę clean plate, `misja` i `kroki`. Nie zawiera reguł ogólnych — te są w brickach.

| Operacja (`id`) | Kiedy | Bricki (numery) | Dawca | Clean plate |
|---|---|---|---|---|
| `addition` | dodanie nowego obiektu, nic nie znika | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 13, 14, 15, 16, 17 | opcjonalny | nie |
| `background_change` | nowe otoczenie, pierwszy plan zostaje | 05, 08, 10, 11, 15, 17, 24 | opcjonalny | nie |
| `character_swap` | cała osoba zastępuje inną (tożsamość + ciało + ubiór) | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23 | wymagany | tak |
| `character_transfer` | TA SAMA osoba w inne miejsce / na inne zdjęcie | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 23 | opcjonalny | tak |
| `clothing_change` | nowy strój, twarz i poza zostają | 01, 08, 09, 10, 11, 13, 15, 16, 17, 20, 21, 22, 23 | opcjonalny | nie |
| `effect_add` | cień, odbicie, poświata, cząsteczki | 01, 05, 07, 08, 09, 10, 11, 29 | brak | nie |
| `face_swap` | sama twarz / tożsamość, reszta osoby zostaje | 01, 08, 09, 10, 11, 13, 15, 16, 17, 18, 19, 20, 22 | wymagany | nie |
| `general_fix` | każda inna drobna zmiana lokalna | 01, 04, 08, 09, 10, 11, 17, 30 | opcjonalny | nie |
| `object_swap` | jeden obiekt zastępuje inny (zamień / podmień) | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17 | opcjonalny | tak |
| `object_transfer` | TEN SAM obiekt zmienia miejsce (przenieś / przybliż) | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17 | opcjonalny | tak |
| `removal` | usunięcie obiektu i odbudowa tła | 01, 04, 07, 08, 09, 10, 11, 12, 17 | brak | tak |
| `season_change` | zmiana pory roku | 08, 10, 11, 26 | brak | nie |
| `style_change` | styl artystyczny całego kadru | 10, 11, 27 | opcjonalny | nie |
| `texture_change` | nowy materiał / faktura, kształt zostaje | 01, 04, 07, 08, 09, 10, 11, 17, 28 | opcjonalny | nie |
| `time_of_day_change` | zmiana pory dnia | 07, 08, 10, 11, 25 | brak | nie |

Operacje zmieniające światło lub wygląd całego kadru (`background_change`, `season_change`, `time_of_day_change`, `style_change`) świadomie **nie** włączają `light-rule` i `fidelity-rule` — byłyby sprzeczne z celem operacji.

## Sekcja 3 — Bricks

Każdy brick to osobny plik `prompts/bricks/NN-nazwa.ts` z jedną nienegocjowalną zasadą. Numer decyduje o kolejności w prompcie.

| # | Brick (`id`) | Nazwa | Używa operacji |
|---|---|---|---|
| 01 | `light-rule` | Światło | 11 / 15 |
| 02 | `position-rule` | Pozycja | 5 / 15 |
| 03 | `scale-rule` | Skala | 5 / 15 |
| 04 | `perspective-rule` | Perspektywa | 8 / 15 |
| 05 | `depth-occlusion-rule` | Głębia i przesłanianie | 7 / 15 |
| 06 | `contact-rule` | Kontakt fizyczny | 5 / 15 |
| 07 | `reflection-rule` | Odbicia | 9 / 15 |
| 08 | `grain-medium-rule` | Medium i ziarno | 14 / 15 |
| 09 | `fidelity-rule` | Wierność (zero enhancera) | 11 / 15 |
| 10 | `framing-rule` | Kadr | 15 / 15 |
| 11 | `output-contract-rule` | Kontrakt wyniku | 15 / 15 |
| 12 | `clean-plate-rule` | Clean plate | 5 / 15 |
| 13 | `singularity-rule` | Jedna instancja | 7 / 15 |
| 14 | `object-identity-rule` | Tożsamość obiektu | 3 / 15 |
| 15 | `donor-isolation-rule` | Izolacja dawcy | 8 / 15 |
| 16 | `no-copy-paste-rule` | Zakaz kopiuj-wklej | 7 / 15 |
| 17 | `edge-blend-rule` | Krawędzie i wtopienie | 11 / 15 |
| 18 | `character-identity-rule` | Tożsamość postaci | 3 / 15 |
| 19 | `hair-rule` | Włosy | 3 / 15 |
| 20 | `skin-body-rule` | Skóra i ciało | 4 / 15 |
| 21 | `clothing-rule` | Ubranie | 3 / 15 |
| 22 | `pose-expression-rule` | Poza i mimika | 3 / 15 |
| 23 | `hands-limbs-rule` | Dłonie i kończyny | 3 / 15 |
| 24 | `background-rule` | Tło | 1 / 15 |
| 25 | `time-of-day-rule` | Pora dnia | 1 / 15 |
| 26 | `season-rule` | Pora roku | 1 / 15 |
| 27 | `style-rule` | Styl | 1 / 15 |
| 28 | `texture-rule` | Tekstura i materiał | 1 / 15 |
| 29 | `effect-rule` | Efekt | 1 / 15 |
| 30 | `minimal-change-rule` | Minimalna zmiana | 1 / 15 |

Bricki 18–23 dotyczą postaci (`character-identity-rule` rozpisuje twarz, oczy, brwi, nos, usta, uszy, skórę, znaki szczególne, zarost, wiek i budowę), 24–30 sceny i efektów.

---

## Jak rozbudować

**Nowy brick:** dodaj `prompts/bricks/NN-nazwa-rule.ts` (wzoruj się na istniejącym), dopisz `id` do `BrickId` w `types.ts`, zarejestruj w `bricks/index.ts`, dopisz do `bricks` wybranych operacji.

**Nowa operacja:** dodaj `prompts/operacje/nazwa.ts`, dopisz `id` do `OperationId` w `types.ts` i zarejestruj w `operacje/index.ts`. Gemini zobaczy ją automatycznie, bo lista operacji w prompcie 1 jest generowana z rejestru — wystarczy dobrze wypełnić `kiedyUzyc`.

## Sprawdzenie typów

```
cd canvas
tsc --noEmit --skipLibCheck --strict --moduleResolution bundler --module esnext --target es2020 --lib es2020,dom prompts/index.ts lib/pipeline.ts lib/geminiClient.ts lib/maskUtils.ts lib/googleGenAI.ts
```

## Czego brakuje do uruchomienia

Zależności, których `nextbyte-preview` nie ma: `konva react-konva use-image zustand sonner` (oraz `react` i `lucide-react`). Klucz Gemini jest trzymany w `localStorage` (`gemini_api_key`).
