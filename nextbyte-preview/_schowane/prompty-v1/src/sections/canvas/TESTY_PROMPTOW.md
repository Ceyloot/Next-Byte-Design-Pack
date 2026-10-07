# Canvas — lista testów promptów

Jak testować: wgraj zdjęcie(a), wbij pinezki (Ctrl+klik), wpisz zdanie w czacie, kliknij Wyślij. Przy każdym teście zaznacz wynik i dopisz uwagę.
Stan: ✅ działa · ❌ nie działa · ➖ nie testowano.

Panel „Prompt” w czacie pokazuje, jaki prompt poszedł do modelu (przydatne, gdy wynik jest zły).

---

## A. NOWE — do przetestowania w pierwszej kolejności

### A1. Zmiana perspektywy (`perspective_change`)
Prompt: `prompty/operacje/perspective-change.ts`. Rozpoznanie: czasownik + słowo o kamerze.

| # | Zdjęcia / pinezki | Zdanie | Oczekiwany wynik | Wynik |
|---|---|---|---|---|
| A1.1 | domek z lotu ptaka, 1 pinezka „podjazd” | `wstaw tutaj cadillaca escalade V i zrób perspektywę z podjazdu z widokiem na cały domek` | nowe ujęcie z poziomu podjazdu, cały domek w kadrze, Cadillac na podjeździe | ➖ |
| A1.2 | to samo, bez pinezek | `zrób ujęcie z poziomu oczu, od frontu domku` | ten sam domek i otoczenie z innej strony, bez blokady „brak pineski” | ➖ |
| A1.3 | wnętrze / pokój | `pokaż ten pokój z lotu ptaka` | ten sam pokój z góry, meble w tych samych miejscach | ➖ |
| A1.4 | dowolne, 1 pinezka na obiekcie | `ustaw kamerę niżej i zrób ujęcie od tyłu` | kamera zmieniona, obiekt rozpoznawalny | ➖ |

Kontrola fałszywych trafień (NIE mają włączać perspektywy, mają działać jak dotąd):

| # | Zdanie | Oczekiwany tryb | Wynik |
|---|---|---|---|
| A1.5 | `ustaw auto w kadrze po prawej` (2 pinezki) | przeniesienie | ➖ |
| A1.6 | `obróć samochód pod innym kątem` | zwykła edycja obiektu | ➖ |
| A1.7 | `zostaw ten sam kadr i dodaj psa` | wstawienie | ➖ |
| A1.8 | `wstaw auto zgodnie z perspektywą sceny` | wstawienie | ➖ |

### A2. Zmiany postaci — prompty Studia Zdjęć 1:1 z PDF
Prompty: `prompty/postac-pdf.ts` + `prompty/operacje/character-swap-studio.ts` (poz. 19–25, 28–32, 35, 49 z PDF), negatywy i temperatury ze Studia. Rozmycie sceny wyłączone.

| # | Zdjęcia / pinezki | Zdanie | Oczekiwany wynik | Wynik |
|---|---|---|---|---|
| A2.1 | scena z osobą (pinezka na niej) + zdjęcie osoby (pinezka) | `zamień youtubera na tego mężczyznę` | ta twarz, ubiór i budowa z referencji, poza i miejsce ze sceny, tło OSTRE (bez blura) | ➖ |
| A2.2 | j.w. + trzecie zdjęcie z tłem (pinezka) | `zamień youtubera na tego mężczyznę - w tle dodaj to tło a banany na pierwszym planie zamień na pliki banknotów` | osoba zamieniona, tło i banknoty wg instrukcji, całość ostra; trzecie zdjęcie NIE jest traktowane jak ujęcie osoby | ➖ |
| A2.3 | scena + zdjęcie z twarzą | `zamień twarz tej osoby na tę` | tylko twarz, reszta bez zmian | ➖ |
| A2.4 | zdjęcie 1: scena (pinezka na chodniku); zdjęcie 2: osoba | `wstaw tego mężczyznę na chodnik` | osoba wstawiona (Studio + bloki tożsamości i realizmu z PDF) | ➖ |
| A2.5 | obie pinezki na JEDNYM zdjęciu | `przenieś tego człowieka tam` | zablokowany „MOVE — do not copy” | ➖ |

---|---|---|---|---|
| A2.1 | zdjęcie 1: scena (pinezka na chodniku); zdjęcie 2: osoba (pinezka na niej) | `wstaw tego mężczyznę na chodnik` | ta sama twarz, ubiór i budowa, stopy w punkcie, cień kontaktowy, skala jak otoczenie | ➖ |
| A2.2 | j.w., osoba widoczna tylko do pasa | `postaw tę kobietę tutaj` | osoba cała (dorysowane nogi), stoi na ziemi sceny | ➖ |
| A2.3 | j.w. + obiekt przy pinezce (ława) | `posadź tę osobę na ławce` | osoba siedzi na ławce, ławka bez zmian | ➖ |
| A2.4 | obie pinezki na JEDNYM zdjęciu | `przenieś tego człowieka tam` | idzie zablokowanym „MOVE”, wynik jak dotąd | ➖ |

### A3. Quick edit i rozpoznawanie pinezki

| # | Co | Zdanie / akcja | Oczekiwany wynik | Wynik |
|---|---|---|---|---|
| A3.1 | Quick edit (Tab albo przycisk na pasku) | zaznacz zdjęcie → `zmień niebo na pochmurne` | otwiera się pole opisu, BEZ pędzla; wynik = całe zdjęcie z tą zmianą, reszta bez zmian | ➖ |
| A3.2 | Inpaint (osobny przycisk) | zamaluj fragment + opis | jak dotąd (pędzel) | ➖ |
| A3.3 | Rozpoznawanie pinezki | wbij pinezkę na koniu, na trawie, na wodzie, na dachu | jedna trafna nazwa pod punktem (nie największa rzecz w kadrze), jeden chip | ➖ |
| A3.4 | Zamiana postaci (nowa logika) | `zamień youtubera na tego mężczyznę` | referencja = wycinek z samą osobą; prompt ma linie SIZE AND PLACE + POSE TO KEEP; kontrola oceni twarz, rozmiar i pozę | ➖ |

---

## B. DO ZROBIENIA — ludzie (poprawki)

| # | Tryb | Zdjęcia / pinezki | Zdanie | Co sprawdzić | Wynik |
|---|---|---|---|---|---|
| B1 | zamiana postaci (character swap) | scena + referencja osoby | `zamień rycerza na tę osobę` | twarz, włosy, budowa i ubiór z referencji; pozycja i miejsce ze sceny | ➖ |
| B2 | zamiana twarzy | scena + zdjęcie z twarzą | `zamień twarz tej osoby na tę` | zmienia się tylko twarz; ciało, ubiór, poza bez zmian | ➖ |
| B3 | zmiana ubrania z referencji | osoba + zdjęcie ubioru | `ubierz tę osobę w ten strój` | ubiór z referencji, twarz i tło nietknięte | ➖ |
| B4 | zmiana ubrania z opisu | osoba, 1 pinezka | `załóż mu czarny garnitur` | tylko ubiór | ➖ |
| B5 | zamiana dwóch osób na jednym zdjęciu | 2 pinezki na osobach | `zamień te dwie osoby twarzami` | wymiana twarzy i włosów, ciała na miejscu | ➖ |

---

## C. NIEZNANY STAN — do Twojego testu

| # | Tryb | Zdanie testowe | Co sprawdzić | Wynik |
|---|---|---|---|---|
| C1 | pora roku | `zrób z tego zimę` | zmienia się pora roku, kompozycja zostaje | ➖ |
| C2 | pora dnia | `zmień na zachód słońca` | światło i kolory, obiekty na miejscu | ➖ |
| C3 | tekstura / materiał | `zrób ten stół z marmuru` (pinezka na stole) | tylko materiał pod pinezką | ➖ |
| C4 | efekt | `dodaj deszcz i odbicia w kałużach` | efekt jest, scena nietknięta | ➖ |
| C5 | styl | `w stylu akwareli` | styl, kompozycja zostaje | ➖ |
| C6 | „popraw” | `otwórz drzwi` (pinezka na drzwiach) | drobna zmiana lokalna | ➖ |
| C7 | usuwanie | `usuń to` (pinezka) | obiekt znika, tło odtworzone | ➖ |
| C8 | wstawianie (jedno zdjęcie) | `wstaw tutaj samochód` (pinezka) | auto w punkcie, właściwa skala | ➖ |
| C9 | zmiana cechy | `zrób go starszym` (pinezka na osobie) | tylko ta cecha | ➖ |
| C10 | pasek: Quick edit / Eraser | zamaluj + opis | zmiana w zamalowanym | ➖ |
| C11 | pasek: Edit text | `„SALE” → „-50%”` | tylko napis | ➖ |
| C12 | pasek: Upscale / Enhance / Remove BG | kliknięcie | treść bez zmian | ➖ |
| C13 | generator zdjęcia (pusta ramka) | `latarnia morska o zachodzie słońca` | nowe zdjęcie w wybranych proporcjach | ➖ |

---

## D. ZABLOKOWANE — szybka kontrola, że nic się nie zepsuło

Zablokowane pliki: `prompty/zablokowane/`. Wystarczy jedno zdanie na tryb.

| # | Tryb | Zdanie | Wynik |
|---|---|---|---|
| D1 | ruch obiektu w jednym zdjęciu | `przesuń ten domek w miejsce ogrodu` (2 pinezki, jedno zdjęcie) | ➖ |
| D2 | transfer obiektu z drugiego zdjęcia | `wstaw to auto tutaj` (obiekt na zdjęciu 2, miejsce na 1) | ➖ |
| D3 | zamiana obiektu na obiekt z drugiego zdjęcia | `zamień to auto na tamto` | ➖ |
| D4 | zmiana części obiektu | `zmień koła na te z drugiego zdjęcia` | ➖ |
| D5 | zmiana scenerii | `zmień tło na plażę` | ➖ |
| D6 | character swap (backup) | `zamień go na tę osobę` | ➖ |

---

## Znane uwagi

- `const studio = true` w `CanvasSection.tsx` jest wpisane na stałe: krótkie prompty twarzy, ubrania, zamiany postaci i „dodaj” w `skladaj.ts` są dziś omijane, a wszystko poza zablokowanymi trybami idzie ogólnym promptem Studio (`sekcjaStudio`). Wyjątki: perspektywa i transfer osoby (A1, A2).
- Transfer obiektu z drugiego zdjęcia ma otwartą poprawkę skali (CLAUDE.md §6).
