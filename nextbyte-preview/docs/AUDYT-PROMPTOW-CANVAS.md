# Audyt promptów Canvas — stan, blokady, krytyczne braki

Metoda: dla każdej operacji (15) × 4 konfiguracje (1 zdjęcie/1 pinezka, 1 zdjęcie/2 pinezki, 2 zdjęcia/2 pinezki, 2 zdjęcia/1 pinezka) złożono prompt prawdziwym `skladajPrompt` i przeczytano tekst. To audyt TEKSTU promptów i kodu rozpoznawania — nie wyników generacji. „Działa” oznacza tylko to, co zatwierdziłeś po testach w przeglądarce.

## 1. Mapa trybów

| Tryb (intencja → operacja) | 1 zdjęcie | 2 zdjęcia | Status |
|---|---|---|---|
| Ruch obiektu (przenieś / zamień, 2 pinezki na Image 1) | `ruch-w-kadrze.ts` | — | **ZABLOKOWANY**, działa (test hobbit) |
| Przeniesienie z drugiego zdjęcia (`object_transfer`) | — | `transfer-z-drugiego-zdjecia.ts` | **ZABLOKOWANY**, działa |
| Zamiana obiektu (`object_swap`, cały obiekt) | `object-swap-2-zdjecia.ts` (też 1 pinezka + opis) | to samo | **ZABLOKOWANY**, działa (GT40→Mercedes) |
| Zamiana postaci (`character_swap`) | — (wymaga 2 zdjęć) | `character-swap.ts` | **ZABLOKOWANY**, działa |
| Zmiana części obiektu (`czesc`) | `zmiana-czesci.ts` | `zmiana-czesci.ts` | ZABLOKOWANY „póki co” |
| Zmiana scenerii (`background_change`) | `zmiana-scenerii.ts` | to samo | ZABLOKOWANY „póki co” |
| Przeniesienie postaci (`character_transfer`) | (idzie w ruch-w-kadrze) | wspólna ścieżka | niezablokowany; test Świdnik „dobry” |
| Dodaj (`addition`) | wspólna | wspólna | niezablokowany, ~4,5–5,7 tys. znaków |
| Usuń (`removal`) | wspólna | wspólna | niezablokowany, nietestowany |
| Zamiana twarzy (`face_swap`) | — | wspólna | niezablokowany, nietestowany |
| Ubranie (`clothing_change`) | wspólna | wspólna | niezablokowany, nietestowany |
| Zmiana atrybutu (`cecha`) | wspólna | — | niezablokowany, nietestowany |
| Tekstura / Efekt / Popraw | wspólna | wspólna | niezablokowane, nietestowane |
| Pora roku / Pora dnia / Styl | wspólna | wspólna | niezablokowane — **błędy krytyczne niżej** |

## 2. Błędy krytyczne (widać je w samym prompcie)

**K1. Pora dnia, pora roku i styl dostają linię „THE LIGHT OF IMAGE 1 (measured — the subject must be lit exactly like this)”.**
`skladaj.ts` dodaje linię światła do każdej operacji poza scenerią. Przy `time_of_day_change` zadanie mówi „przebuduj niebo, słońce, cienie, temperaturę barwową”, a reguła obok każe zachować dokładnie zmierzone światło zdjęcia. Sprzeczność w jednym prompcie — model wybierze jedno z dwóch. Ten sam błąd w `season_change` (pogoda/atmosfera) i `style_change`.
Naprawa: pominąć linię światła dla tych trzech operacji (jak dla scenerii).

**K2. Pora roku: zadanie kontra klocek „scena”.**
Zadanie: „zmień roślinność, pokrywę, niebo”. Klocek: „every object and prop … unchanged … reproduced EXACTLY”. Roślinność to obiekty; reguła ją zamraża.
Naprawa: dla pory roku/dnia/stylu zastąpić klocek „scena” zwężonym („zostaje układ, kamera, kadr, napisy; zmienia się tylko to, co opisuje zadanie”).

**K3. Przeniesienie postaci na jednym zdjęciu idzie przez prosty prompt ruchu obiektu.**
`ruch-w-kadrze` obejmuje też `character_transfer`, ale nie ma klocka „Człowiek” (twarz, anatomia, ziarno skóry) ani opisu tożsamości. Ruch osoby może zmienić twarz lub pozę.
Naprawa: dla osoby (flaga `osoba`) dołożyć klocek „Człowiek” do `ruch-w-kadrze` (wymaga Twojej zgody — to tryb zablokowany) albo zostawić ten przypadek dla wspólnej ścieżki.

**K4. Zamiana postaci (character swap) z jednym zdjęciem nie ma blokady.**
Reguła `postac-bez-dawcy` działa tylko dla intencji „Postać” (twarz). Gdy reżyser uzna `zamien` + osoba, a zdjęcie jest jedno, prompt odwołuje się do nieistniejącego „Image 2”.
Naprawa: dodać blokadę dla `zamien` / `przenies` z osobą bez drugiego zdjęcia.

## 3. Błędy ważne (nie zawsze psują wynik)

**W1. „Dodaj” zawsze mówi „ADD, never replace”.** Przy „wstaw w miejsce drzewa” model nie usunie drzewa (widzieliśmy to). Powinno być rozpoznanie „w miejsce X” jako zamiany albo osobna linia o tym, co stoi pod pinezką.
**W2. Pinezki w operacjach globalnych (pora roku, pora dnia, styl).** Prompt wypisuje „Pin 1 … N1”, choć operacja dotyczy całej sceny; model może potraktować to jako lokalny obszar.
**W3. Usuń z dwoma zdjęciami dostaje „Image 2 = reference”.** Szum bez znaczenia dla usunięcia.
**W4. Niespójne ustawienia modelu.** Operacje na obiektach mają rolę kompozytora i temperaturę 0,35; ubranie, tekstura, efekt, pora, styl, popraw i usuń nie mają ani systemu, ani temperatury (domyślne ustawienia modelu).
**W5. Długość.** „Dodaj” 4,5–5,7 tys. znaków, character transfer do 7,6 tys. Wcześniejszy cel to ok. 3 tys.; tylko ruch w kadrze się mieści (~3,8 tys. z pomiarami).

## 4. Niepotwierdzone w praktyce (do testu)

Usuń, zamiana twarzy, ubranie, tekstura, efekt, popraw, zmiana atrybutu, pora roku, pora dnia, styl, dodaj z drugiego zdjęcia. Dla zablokowanych „póki co” (część, sceneria) brak ostatecznego potwierdzenia po zmianach reżysera.

## 5. Proponowana kolejność prac

1. K1 + K2 (pora dnia/roku/styl): niezablokowane, mała zmiana, duży efekt.
2. K4 (blokada) — czysto walidacyjna.
3. W1 (dodaj vs „w miejsce”) — rozpoznanie intencji.
4. K3 — wymaga decyzji o zablokowanym ruchu w kadrze.
5. Test porównawczy: `skrypty/test-ruchu-obiektu.mjs` dla ruchu oraz po jednym teście dla każdego niepotwierdzonego trybu z listy w pkt 4.
6. Po zatwierdzeniu — zamrożenie kolejnych trybów wzorcem `prompty/zablokowane/*` z dowodem regresji.
