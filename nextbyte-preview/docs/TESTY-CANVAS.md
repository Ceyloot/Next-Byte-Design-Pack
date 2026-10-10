# Canvas — lista testów (ręcznych)

Zaznaczaj po każdym teście: wynik, model, ewentualny dziwny prompt (podgląd promptu w czacie).
Zalecane modele do skali i położenia: **GPT Image 2** i **Nano Banana Pro** (Lite słabo radzi sobie ze skalą).

## 0. Bez pinesek (nowe)
- [ ] Jedno zdjęcie, bez pinesek: „zrób z tego zimę ze śniegiem" — ma się wygenerować (słowo „tego" nie blokuje).
- [ ] Jedno zdjęcie, bez pinesek: „zmień kolor nieba na zachód słońca", „usuń napisy", „dodaj lekkie ziarno filmowe".
- [ ] Brak zdjęcia, sam tekst + Enter: „kot w kapeluszu" → kwadrat; „plakat koncertu pionowy" → 3:4; „baner na YouTube 16:9" → 16:9; „portret kobiety" → 3:4; „krajobraz gór" → 3:2.
- [ ] Brak zdjęcia + załączone zdjęcie jako referencja: „narysuj to samo w stylu akwareli" → proporcje z referencji.
- [ ] Brak zdjęcia + plik .txt z instrukcją (np. opis stylu) + krótkie polecenie.
- [ ] Załącznik-zdjęcie + zdjęcie na płótnie: „połącz styl z referencji z moim zdjęciem" (referencja NIE ląduje na płótnie).
- [ ] Usunięcie załącznika (×) przed wysłaniem — nie idzie do generacji.
- [ ] „Wstaw na płótno" z menu spinacza — zdjęcie ląduje na płótnie jak dawniej.

## 1. Pinezki — jedno zdjęcie
- [ ] 1 pinezka: usuń obiekt („usuń to auto").
- [ ] 1 pinezka: zmień kolor / materiał obiektu.
- [ ] 2 pinezki: przenieś obiekt A do miejsca B (to samo zdjęcie = przeniesienie, nie kopia).
- [ ] 2 pinezki: zamień obiekt A na B w obrębie jednego zdjęcia (np. dwie osoby między sobą).
- [ ] 3+ pinezek: usuń kilka obiektów jednym poleceniem.
- [ ] Pinezka na krawędzi kadru (obiekt ucięty) — wstawienie i przeniesienie.
- [ ] Pinezka na małym obiekcie obok dużego (np. szklarnia przy garażu) — nazwa wygrywa z pozycją.
- [ ] Widok z lotu ptaka: wstawienie auta / drzewa — skala od poziomych kotwic.

## 2. Pinezki — dwa zdjęcia
- [ ] Obiekt ze zdjęcia 2 → miejsce na zdjęciu 1 (wstawienie z referencji), skala i perspektywa.
- [ ] Zamiana obiektu na zdjęciu 1 obiektem ze zdjęcia 2 (np. auto → inne auto).
- [ ] Zamiana osoby: twarz + ubiór z referencji; zamiana samej twarzy („zamień twarz").
- [ ] Zamiana osoby, gdy referencja jest z innej strony (profil vs. en face) — orientacja zgodna z referencją.
- [ ] Zmiana tła / scenerii na tło ze zdjęcia 2.
- [ ] Odwrócona kolejność pinesek (najpierw pinezka na zdjęciu 2) — baza ma się wybrać po poleceniu, nie po kolejności.

## 3. Pinezki — wiele zdjęć (3–4)
- [ ] 3 zdjęcia, po 1 pinezce: „złóż scenę: obiekt z 2 i obiekt z 3 na zdjęciu 1".
- [ ] 4 zdjęcia, pinezki na różnych: sprawdź, czy agent dopytuje, gdy nie wie, które jest bazą.
- [ ] Dwie pinezki o tej samej nazwie na różnych zdjęciach (np. dwa „biały SUV").
- [ ] Zaznaczone 2+ zdjęcia bez pinesek: generacja z referencjami.
- [ ] Odpowiedź na pytanie agenta („2") — pinezki zostają, generacja rusza.

## 4. Edycja tekstu na obrazie
- [ ] Wykryj teksty → zmień jeden → zatwierdź; zachowaj oryginalną czcionkę; wybór innej czcionki.
- [ ] Obraz bez tekstu — czytelny komunikat.

## 5. Interfejs
- [ ] Jasny i ciemny motyw: pasek akcji, dolny pasek, zoom, panel czatu, kompozytor, lista modeli — szkło widać nad zdjęciem.
- [ ] Lista modeli: przycisk ≤ połowa kompozytora, najdłuższa nazwa bez luki, karta szczegółów po najechaniu.
- [ ] Zwinięcie panelu czatu i rozwinięcie; licznik pinesek na ikonie.
- [ ] Wiele generacji z rzędu (jedna generacja na klik, brak podwójnych zapytań).
- [ ] Zmiana modelu w trakcie rozmowy z agentem.

## 6. Przypadki brzegowe
- [ ] Bardzo długie polecenie (>800 znaków) + duży plik .txt (jest przycinany do 6000 znaków).
- [ ] Plik o nieobsługiwanym typie w „Załącz" — pomijany bez błędu.
- [ ] Brak sieci / brak klucza — czytelny komunikat zamiast zawieszenia.

## 7. Outpaint / zmiana wymiarów (nowe)
- [ ] Pasek nad zdjęciem → Outpaint → 16:9, „Wokół": oryginał na środku, nowe boki dopasowane; środek bez utraty ostrości.
- [ ] Outpaint → tylko „W prawo" / „W górę"; szew niewidoczny.
- [ ] Czat: „zmień wymiary na 9:16", „rozszerz w lewo do 21:9", „zmień rozmiar na 1920x1080", „rozszerz dookoła".
- [ ] Zdjęcie, które już ma wybrane proporcje — komunikat zamiast zbędnej generacji.
- [ ] Zamiana obiektu (np. półprzezroczysta żaba → foka): nowa rzecz ma ten sam rozmiar/masę w kadrze i ten sam stopień półprzezroczystości.
