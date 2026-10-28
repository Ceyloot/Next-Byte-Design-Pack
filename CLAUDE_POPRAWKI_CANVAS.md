# CLAUDE — poprawki Canvas po eksporcie (Studio Pro)

Instrukcja dla agenta AI / programisty, który poprawia moduł **Canvas** po przeniesieniu
go z repozytorium wzorcowego (`Next-Byte-Design-Pack/nextbyte-preview/src/sections/canvas`
+ `CanvasSection.tsx`) do aplikacji docelowej.

Cel: **Canvas w aplikacji ma wyglądać i działać tak jak we wzorcu.** To nie jest
przeprojektowanie — każda wartość poniżej została zmierzona w działającym wzorcu
(Chrome, 1440×900, motyw `dark-theme` i `future-theme`, 28.10.2026). Jeśli w aplikacji
coś wygląda inaczej niż tu opisano, to jest błąd eksportu.

> **Najważniejsze zasady**
> 1. Zmieniamy wyłącznie warstwę wyglądu i komunikatów. **Logika promptów, modeli,
>    temperatur, bricków i reżysera jest zamrożona** (zob. sekcję 6 w `CLAUDE.md`
>    wzorca: character swap, ruch w kadrze, object transfer, object swap, zmiana części,
>    zmiana scenerii, agent z recepturami, inpainting). Ukrycie promptu w czacie NIE może
>    zmienić tego, co idzie do modelu.
> 2. Kolory tylko z tokenów motywu (`--background`, `--card`, `--foreground`,
>    `--muted-foreground`, `--primary`, `--destructive`). Zero `bg-black` / `text-white`.
> 3. Nie wymyślaj nowych kształtów. Prostokąty z zaokrągleniem `16px`, w środku przyciski
>    `10px` — współśrodkowo (`R_wewn = R_zewn − padding`: 16 − 6 = 10).

Lista poprawek (kolejność = priorytet):

| # | Problem w eksporcie | Waga |
|---|---|---|
| 1 | Lewy panel boczny ucina zdjęcia (twarda kolumna + przerwa) | wysoka |
| 2 | Pasek akcji nad zdjęciem ma kształt pigułki zamiast prostokąta 16px | wysoka |
| 3 | Dolny pasek narzędzi i kafelek zoomu — pigułki, mniejsze niż we wzorcu | wysoka |
| 4 | W czacie widać „PROMPT WYSŁANY DO MODELU” i plan zamiast statusu | wysoka |
| 5 | Pinezka nie rozpoznaje obiektu sama — jest przycisk „Rozpoznaj · 1 ⟠” | do decyzji |

---

## 0. Wspólne szkło Canvasa (wszystkie pływające elementy)

Pasek akcji, dolny pasek narzędzi, kafelek zoomu, panel czatu, lista modeli i dok
prawy to **jedno i to samo szkło** (`.nb-cozy-plyta` / `.p2-szklo` we wzorcu,
plik `canvas/przytulny.css`). Wartości policzone przez przeglądarkę:

| Właściwość | `dark-theme` | `future-theme` (jasny) |
|---|---|---|
| tło | `hsl(var(--background) / 0.72)` → `rgba(8,8,8,0.72)` | `color-mix(in srgb, hsl(var(--card)) 52%, transparent)` → biel 52% |
| rozmycie | `backdrop-filter: blur(16px) saturate(140%)` | `backdrop-filter: blur(26px) saturate(150%)` |
| rant | `1px solid hsl(var(--foreground) / 0.12)` | `1px solid hsl(var(--foreground) / 0.12)` |
| cień | `inset 0 1px 0 0 hsl(0 0% 100% / 0.06), 0 10px 30px -12px rgba(0,0,0,0.7)` | `0 10px 28px -14px hsl(var(--cozy-cien) / 0.28)` |
| zaokrąglenie | **16px** (`rounded-2xl`) | **16px** |

Wyjątki od 16px: kafelek zoomu **12px** (`rounded-xl`), panel czatu **22px**.

Wszystkie elementy Canvasa siedzą w korzeniu z klasą `.nb-cozy` — reguły szkła
działają tylko pod nim. Jeśli w aplikacji docelowej korzeń ma inną klasę albo
`przytulny.css` nie jest zaimportowany, elementy dostaną domyślny wygląd biblioteki
(stąd m.in. „pigułki”). **Najpierw sprawdź, czy `przytulny.css` jest załadowany
i czy korzeń Canvasa ma `nb-cozy`.**

Korzeń Canvasa: `absolute inset-0 w-full h-full min-h-0 max-h-full overflow-clip`
— **`overflow-clip`, nie `overflow-hidden`** (przy `hidden` przeglądarka potrafi
przewinąć korzeń w bok przy fokusie na polu przy krawędzi i cały widok odjeżdża;
naprawione we wzorcu w commicie `dad1a8d`). Każde `focus()` w Canvasie ma
`{ preventScroll: true }`.

---

## 1. Lewy panel boczny ucina zdjęcia

**Co jest źle:** płótno kończy się przy lewym panelu nawigacji platformy. Panel jest
nieprzezroczystą kolumną, a między nim a płótnem jest przerwa — zdjęcie leżące przy
lewej krawędzi (np. manekin z rozłożonymi rękami) jest ucinane twardą krawędzią.

**Jak jest we wzorcu:**
- Płótno zajmuje **cały ekran**, także pod nawigacją. Nawigacja platformy to **pływająca
  szklana tafla** nad płótnem, a zdjęcia mogą pod nią wjechać i są pod nią widoczne
  (rozmyte), nigdy ucięte.
- Tafla nawigacji (wzorzec: `components/nawigacja-boczna.css`, `.nbb-tafla`):
  - tło `hsl(var(--card) / 0.348)` (zmienna `--nb-kafelek-wypelnienie`, domyślnie 0.348),
  - `backdrop-filter: saturate(130%) blur(8.8px)`,
  - rant `1px solid hsl(var(--foreground) / 0.14)`, zaokrąglenie `1rem` (16px),
  - cień `inset 0 1px 0 0 hsl(0 0% 100% / 0.16), inset 1px 0 0 0 hsl(0 0% 100% / 0.06), inset -1px 0 0 0 hsl(0 0% 100% / 0.06), inset 0 -1px 0 0 hsl(0 0% 0% / 0.22)`,
  - `overflow: clip`, `isolation: isolate`, tafla odsunięta od krawędzi ekranu (pływa), bez sąsiadującej kolumny tła.
- Elementy interfejsu Canvasa (zoom, pasek narzędzi, czat, karty) omijają nawigację
  przez zmienne CSS ustawione na kontenerze Canvasa (wzorzec: `PreviewSection.tsx`):

  ```ts
  '--nb-nav-lewo':  nawigacjaPoLewej ? (zwinieta ? '92px' : '288px') : '0px',
  '--nb-nav-prawo': nawigacjaPoPrawej ? (zwinieta ? '92px' : '288px') : '0px',
  '--nb-nav-gora':  nawigacjaUGory ? '68px' : '0px',
  '--nb-nav-dol':   nawigacjaNaDole ? '64px' : '0px',
  '--nb-canvas-gora': nawigacjaUGory ? '84px' : '16px',
  '--nb-canvas-dol':  nawigacjaNaDole ? '80px' : '16px',
  ```
  Wartości `288px / 92px` = szerokość tafli + jej margines. Dopasuj je do realnej
  szerokości nawigacji w aplikacji, ale **nie zmniejszaj obszaru płótna** — zmienne
  przesuwają tylko kontrolki, nie zdjęcia.

**Jak naprawić:**
1. Kontener Canvasa: `absolute inset-0` względem całego okna aplikacji (nie obok paska).
2. Usuń kolumnę/odstęp rezerwujący miejsce na pasek (np. `ml-[…]`, `pl-[…]`, `grid-cols-[sidebar_1fr]`) dla widoku Canvas.
3. Nawigację w widoku Canvas renderuj jako pływającą taflę szkła (wartości wyżej), z `z-index` nad płótnem.
4. Ustaw zmienne `--nb-nav-*` na kontenerze Canvasa.

**Sprawdzenie:** przeciągnij zdjęcie pod lewą nawigację — jest widoczne przez szkło
(rozmyte), nie ma twardej krawędzi ani pionowej przerwy. Kafelek zoomu stoi
`16px` od prawej krawędzi nawigacji (`left: calc(var(--nb-nav-lewo) + 16px)`).

---

## 2. Pasek akcji nad zaznaczonym zdjęciem (Szybka edycja · Adnotacje · Powiększ 2× · Usuń tło · Napisy · ⋯ · ⬇)

**Co jest źle:** kontener ma kształt pigułki (pełne zaokrąglenie), inne proporcje.

**Wzorzec** (`canvas/PasekAkcji.tsx`):

| Element | Wartość |
|---|---|
| kontener | `nb-cozy-plyta flex h-12 items-center gap-0.5 rounded-2xl border p-1.5` → **wys. 48px, radius 16px, padding 6px, odstęp 2px**, szkło z sekcji 0 |
| przycisk z etykietą | `flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium` → **36px wys., radius 10px, padding 12px, tekst 13px/500**, kolor `foreground / 0.8` |
| przycisk tylko-ikona (⋯, ⬇) | `h-9 w-9 rounded-[10px]` → **36×36, radius 10px** |
| ikony | 16×16 (`h-4 w-4`) |
| skrót klawisza („Tab”) | 12px, `text-muted-foreground`, ukryty na telefonie |
| hover | `bg-foreground/[0.06]`, tekst `foreground`, `active:scale-95` |
| akcja w toku | `bg-primary/15 text-primary` + spinner zamiast ikony |
| separator | `mx-1 h-5 w-px bg-foreground/[0.1]` → **1×20px**, przed grupą końcową (⬇) |
| menu „⋯” | `nb-cozy-plyta w-[190px] rounded-2xl border p-1.5`, pozycje `h-9 rounded-[10px] px-2.5 text-[13px]` |
| położenie | wyśrodkowany nad zdjęciem, **8px nad górną krawędzią** zdjęcia |
| telefon (< md) | etykiety chowane (`max-md:sr-only`), przyciski 36×36 |

**Jak naprawić:** usuń `rounded-full` / `rounded-[999px]` z kontenera i przycisków;
ustaw klasy jak wyżej; upewnij się, że kontener ma `nb-cozy-plyta` (szkło), a nie
domyślny styl przycisku/paska z biblioteki UI.

**Sprawdzenie:** rogi kontenera i przycisków to łuki o wspólnym środku (16 / 10px),
kontener ma 48px wysokości.

---

## 3. Dolny pasek narzędzi i kafelek zoomu

**Co jest źle:** oba są pigułkami i są mniejsze niż we wzorcu.

### 3a. Dolny pasek narzędzi (wyśrodkowany na dole)

| Element | Wartość |
|---|---|
| kontener | `nb-cozy-plyta pointer-events-auto relative flex h-12 flex-row items-center gap-1 rounded-2xl border p-1.5` → **wys. 48px, radius 16px, padding 6px, odstęp 4px** |
| przycisk | `relative flex h-9 w-9 items-center justify-center rounded-[10px]` → **36×36, radius 10px** |
| ikona | **20×20** |
| narzędzie aktywne | `border border-primary/40 bg-primary/20 text-primary` |
| kolejność | Wybór (V) · Pinezka (P) · Ręka (H) · Ołówek (D) · **separator** · Dodaj zdjęcie · Nowe zdjęcie z opisu · Zdjęcia na płótnie |
| separator | 1×20px, `bg-foreground/[0.1]` |
| odznaka licznika (na „Zdjęcia na płótnie”) | kółko **18px**, `bg-primary`, tekst 10px |
| położenie | **16px od dołu** (`bottom: calc(var(--nb-nav-dol,0px) + 16px)` na desktopie), środek liczony bez czatu: `left: calc(50% + (var(--nb-nav-lewo) - var(--nb-nav-prawo) - var(--nb-czat-szer)) / 2)` |

### 3b. Kafelek zoomu (lewy dolny róg)

| Element | Wartość |
|---|---|
| kontener | `p2-szklo pointer-events-auto flex h-9 items-center gap-0 !rounded-xl px-1` → **wys. 36px, radius 12px, padding 0 4px**, szkło z sekcji 0 |
| przyciski (−, +, pełny ekran) | `grid h-7 w-7 place-items-center rounded-lg` → **28×28, radius 8px**, kolor `foreground / 0.6`, hover `bg-foreground/[0.08]` |
| ikony | 14×14 |
| procent („72%”) | szer. 36px, 10px/400, `foreground / 0.7` |
| położenie | `bottom: calc(var(--nb-nav-dol,0px) + 16px); left: calc(var(--nb-nav-lewo,0px) + 16px)`, ukryty na telefonie |

**Jak naprawić:** jak w sekcji 2 — usuń pełne zaokrąglenia, przywróć wysokości
48 / 36px i rozmiary przycisków 36 / 28px.

---

## 4. Czat: bez promptu do modelu, zamiast planu — krótki status

**Co jest źle:**
- Pod odpowiedzią widać rozwijany blok **„PROMPT WYSŁANY DO MODELU”** z angielskim
  promptem. Użytkownik nie może go widzieć.
- W trakcie generowania nagłówkiem karty statusu jest pełne zdanie planu agenta
  („Zmienię pozę mężczyzny na obrazie 2 tak, aby…”) zamiast krótkiego statusu.

**Jak ma być:**
1. **Blok „PROMPT WYSŁANY DO MODELU” usunąć z interfejsu całkowicie** — także zwinięty,
   także po kliknięciu, także w trybie podglądu. Nie renderować go wcale (nie `hidden`
   przez CSS). Prompt dalej powstaje i idzie do modelu bez zmian; jeśli potrzebny do
   diagnostyki — tylko w `console.debug` w trybie deweloperskim, nigdy w DOM.
2. **Karta statusu w trakcie pracy** (wzorzec: `canvas/CzatCanvas.tsx`, blok
   `role="status"`): spinner + krótki status w 1. linii + jedno zdanie pomocnicze w 2.
   linii + pasek postępu `.nb-pasek-pracy`. Wygląd: `rounded-2xl bg-primary/[0.07] p-3.5`,
   1. linia `11.5px font-semibold`, 2. linia `10.5px text-muted-foreground`.
   Statusy według fazy (krótko, w 1. osobie):

   | faza (`stanGeneracji.faza`) | 1. linia |
   |---|---|
   | `planuje` | **Analizuję zdjęcia…** |
   | `trwa` | **Generuję…** (z referencjami: **Tworzę z referencji…**, inpainting: **Maluję zaznaczony obszar…**) |
   | `sprawdza` | **Sprawdzam wynik…** |
   | `poprawia` | **Dopracowuję światło i szczegóły…** |
   | `koryguje` | **Poprawiam rozmiar i miejsce…** |

   **Nie wstawiać** do 1. linii `stanGeneracji.plan` ani żadnego tekstu z modelu/agenta.
   2. linia: stałe zdanie, np. „Nie ruszam nieoznaczonych elementów sceny.” albo
   „Wynik pojawi się obok zdjęcia.”
3. Pod gotowym wynikiem może zostać jedno krótkie zdanie po polsku, co zostało zrobione
   (jak dziś „Zmienię pozę…”), ale **bez** bloku promptu.

**Sprawdzenie:** wygeneruj dowolną zmianę — w DOM czatu nie ma tekstu „PROMPT
WYSŁANY”, w trakcie generowania widać wyłącznie statusy z tabeli. Wynik generacji
identyczny jak przed zmianą (ten sam prompt w zapytaniu do API — porównaj w zakładce
Network).

---

## 5. Pinezka: rozpoznawanie automatyczne (do decyzji)

**Co jest w eksporcie:** po wbiciu pinezki karta pokazuje pusty opis i przycisk
**„Rozpoznaj · 1 ⟠”** (płatne, ręczne).

**Jak jest we wzorcu** (`CanvasSection.tsx` → `wbijPineske`, `canvas/KartaPineski.tsx`):
- Rozpoznanie startuje **od razu po wbiciu**: wycinek okolicy punktu → `rozpoznajObiekt`
  → pole opisu dostaje pierwszą nazwę, pod nim do **4 propozycji** (chipy). W trakcie
  pole ma placeholder „Rozpoznaję…”.
- Równolegle liczy się ramka obiektu (`ramkaRzeczyPodPinem`) — tylko do podglądu.
- Przesunięcie pinezki rozpoznaje ponownie (`rozpoznajPineskePonownie`).
- Ręczna zmiana nazwy po 800 ms szuka ramki **tej** rzeczy.
- Karta: `w-[316px] rounded-2xl border bg-card p-3.5`, wycinek **60×60** (`rounded-[10px]`),
  pole opisu `rounded-[10px] px-3 py-1.5 text-[13px]`, kosz obok, chipy propozycji
  `rounded-xl px-2.5 py-1 text-[11.5px]`, wybrany chip `border-primary/30 bg-primary/10 text-primary`.
  Kursor od razu w polu opisu (`focus({ preventScroll: true })` + zaznaczenie tekstu).

**Decyzja właściciela produktu:** zostawić płatny przycisk „Rozpoznaj” czy wrócić do
automatu. Jeśli automat — przywrócić zachowanie jak wyżej i usunąć przycisk. Jeśli
przycisk zostaje — nazwa „Rozpoznaj · 1 ⟠” zostaje, ale pole opisu musi przyjmować
wpisanie nazwy ręcznie bez klikania „Rozpoznaj”.

---

## 6. Zauważone przy okazji (sprawdzić)

- W prawym dolnym rogu czatu okrągła ikona (awatar/bąbelek) **nachodzi na przycisk
  wysyłania** („↑ 5”). Przycisk wysyłania musi być w pełni widoczny i klikalny —
  pływający element przesunąć nad kompozytor albo poza panel czatu.

---

## Lista kontrolna przed oddaniem

- [ ] `przytulny.css` załadowany, korzeń Canvasa ma `nb-cozy` i `overflow-clip`.
- [ ] Zdjęcie wjeżdża pod lewą nawigację i jest widoczne przez szkło; brak przerwy.
- [ ] Pasek akcji: 48px, radius 16px, przyciski 36px / radius 10px, 8px nad zdjęciem.
- [ ] Dolny pasek: 48px, radius 16px, przyciski 36×36, ikony 20px, separator po Ołówku.
- [ ] Zoom: 36px, radius 12px, przyciski 28×28.
- [ ] Brak „PROMPT WYSŁANY DO MODELU” w DOM; statusy z tabeli w sekcji 4.
- [ ] Zapytania do modeli bez zmian (porównanie w Network przed/po).
- [ ] Decyzja w sekcji 5 podjęta i wdrożona.
- [ ] Sprawdzone w `dark-theme` i `future-theme`, desktop i telefon (375px).
