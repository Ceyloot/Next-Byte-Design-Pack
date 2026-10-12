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

## 8. Telefon (szerokość < 768 px)
- [ ] Pusty Canvas: płaskie tło bez kropek, jedna linia podpowiedzi; dolny dok + pasek „Opisz zmianę…".
- [ ] Wgranie zdjęcia: widok sam obejmuje zdjęcie; „Dopasuj widok" w doku.
- [ ] Jeden palec na tle przesuwa widok, dwa palce przybliżają (pinch); pinezka nadal wbija się dotknięciem w trybie pinezki.
- [ ] Pasek czatu → arkusz od dołu (66% wysokości); strzałka w dół zamyka; wysyłanie, załączniki, wybór modelu.
- [ ] Okna (Quick edit, Inpaint, Outpaint, Edit text, karta pinezki) siedzą u dołu nad paskiem czatu, nie wychodzą poza ekran.
- [ ] Górny pasek platformy przewija się poziomo i pokazuje aktywną zakładkę; motyw i ustawienia dostępne.
- [ ] Skrót C na komputerze: rozwija czat i ustawia kursor w polu.

## 9. Ołówek i szkice (nowe)
- [ ] D = ołówek: rysowanie myszą i palcem, kolory, trzy grubości, Ctrl+Z cofa ostatnie pociągnięcie, kosz czyści.
- [ ] Narzędzie wyboru: klik w szkic lub ramka zaznacza (Shift dokłada); Delete usuwa; prawy przycisk w ramce → „Zamień w obraz" / „Usuń szkic".
- [ ] „Zamień w obraz": szkic idzie na białym tle w formacie modelu; opis z czatu dopisuje się do polecenia; zaznaczone zdjęcie (np. osoba) idzie jako referencja tożsamości.
- [ ] Szkic z kilku kolorów (kolor = podpowiedź, co jest czym); szkic wokół zdjęcia na płótnie.

## 10. Adnotacje → edycja (nowe)
- [ ] Zaznacz zdjęcie → pasek nad nim: Quick edit, Adnotacje, Upscale, Remove BG, Edit text, „…" (Inpaint, Outpaint, Eraser, Enhance) i Pobierz.
- [ ] „Adnotacje" wchodzi w tryb skupienia: widok przybliża się do zdjęcia, znikają pasek szybkich akcji i dolny dok, zostaje jeden panel (na wierzchu, nic na nim nie nachodzi). Esc lub ✕ wraca do poprzedniego widoku.
- [ ] W trybie adnotacji czat jest schowany; zdjęcie leży w całości nad panelem, wyśrodkowane. Rysować można tylko po tym zdjęciu: start poza nim nic nie robi, kreska przeciągnięta poza krawędź zatrzymuje się na krawędzi.
- [ ] Pinezki opisów mają numery zadań (1, 2, …) — te same, które dostaje model; zaznaczone miejsce bez opisu ma pośrodku przerywany znacznik z numerem; pasek pokazuje „N zadań" / „Dopisz, co zmienić" / „Zaznacz miejsce"; pole „Dodatkowy opis" zastępuje czat.
- [ ] Panel: Przesuń / Linia / Zakres / Napis, kolory, grubości (stałe na ekranie niezależnie od przybliżenia), cofnij, wyczyść; „Wykonaj · N ⟠" aktywne dopiero, gdy jest zaznaczenie i jakikolwiek napis albo tekst z czatu.
- [ ] Po narysowaniu zakresu / linii obok zaznaczenia pojawia się karta „Co tu zmienić?" (jak karta pinezki): kursor od razu w polu, Enter / Gotowe zatwierdza, kosz usuwa zaznaczenie razem z opisem, klik poza kartą zatwierdza. Opis ląduje jako pinezka z numerem zadania pośrodku zaznaczonego miejsca (sam tekst w podpowiedzi po najechaniu i na karcie). Klik w pinezkę otwiera kartę do zmiany opisu, przeciągnięcie ją przesuwa; napis można też dodać osobno (Napis → klik).
- [ ] Do modelu idą dwa obrazy: czyste zdjęcie i mapa układu (czarne tło, kolorowe numerowane obszary — bez zdjęcia i bez tekstu, więc kresek ani napisów nie ma jak przepisać na wynik); polecenie ma ponumerowaną listę zadań (obszar w % kadru + napis), wszystkie obowiązkowe; tekst z czatu dopisuje się.
- [ ] Po „Wykonaj" tryb się zamyka, widok obejmuje oryginał i wynik; adnotacje zostają na oryginale. Wynik ma rozmiar zdjęcia, bez śladów kresek.
- [ ] Zwykły ołówek (D) bez trybu adnotacji: tylko cienka linia, kolory, grubości; prawy przycisk na zaznaczonych kreskach → „Wykonaj adnotacje" / „Zamień w obraz" / „Usuń szkic".
- [ ] Jasny i ciemny motyw oraz telefon: panel czytelny, przewija się poziomo, nic na siebie nie nachodzi.
- [ ] Zwykły ołówek (D): pasek stoi nad dolnym dokiem, nic na siebie nie nachodzi. Kreska narysowana na zdjęciu od razu wchodzi w tryb adnotacji (bez przybliżania), kolor zostaje taki, jaki wybrałeś (biały też; nic nie zmienia go na czerwony), a obok pojawia się karta „Co tu zmienić?". Kreski poza zdjęciami (szkice do „Zamień w obraz") zostają zwykłymi szkicami.

## 11. Gumka w inpaintingu / eraserze (nowe)
- [ ] W oknie Inpaint i Eraser obok suwaka jest przełącznik Pędzel / Gumka; gumka ściera zamalowane miejsce (kolejność pociągnięć ma znaczenie), suwak zmienia jej rozmiar.
- [ ] Zamalowanie nakładających się kresek nie ciemnieje podwójnie; po starciu całej maski przycisk wysyłania pozostaje zablokowany.
- [ ] Do modelu idzie maska już po wytarciu (obrys wycinka liczony z zamalowanych pociągnięć).
- [ ] Outpaint: animacja „Generuję…" od razu ma wybrany format (np. 9:16 stoi pionowo od pierwszej klatki), oryginał zachowuje swój rozmiar, a wynik wypełnia ducha bez skoku rozmiaru — z panelu i z polecenia na czacie.
- [ ] Pinezki opisów adnotacji wyglądają tak samo jak zwykłe pinezki (biała kropla z numerem zadania, ten sam rozmiar i zachowanie).
- [ ] Adnotacje są przypięte do zdjęcia: przesunięcie lub skalowanie zdjęcia przesuwa i skaluje kreski oraz pinezki razem z nim; usunięcie zdjęcia usuwa jego adnotacje.
- [ ] Po udanym „Wykonaj” adnotacje na zdjęciu znikają (przy błędzie zostają, można spróbować jeszcze raz).

## 12. Wstawianie zdjęć (Ctrl+V, wgrywanie, przeciąganie)
- [ ] Ctrl+V i wgranie z „Dodaj zdjęcie" kładą zdjęcie na środku aktualnego widoku (po przesunięciu płótna też tam, gdzie patrzysz), a nie na prawo od wszystkich; nie nachodzą na istniejące zdjęcia.
- [ ] Przeciągnięcie plików z komputera na Canvas — także nad kartą czatu i paskami — kładzie zdjęcie dokładnie pod kursorem; kilka plików naraz leży obok siebie.
- [ ] Przeciągnięcie obrazu ze strony www, z innej karty albo z czatu (adres lub data:) też działa; gdy serwer zdjęcia nie pozwala na pobranie, obraz ładuje się wprost z adresu.
- [ ] Po „Wykonaj” w trybie adnotacji widok obejmuje oryginał i miejsce na wynik (zoom do 100%), a nie wszystkie zdjęcia na płótnie — rozrzucone zdjęcia nie oddalają widoku do kilkunastu procent.
- [ ] Inpainting: do modelu idzie fragment z dużym kontekstem (min. połowa krótszego boku, ×3 wokół maski; przy większym — całe zdjęcie), tak by model widział scenę, a nie samą teksturę; wynik wraca tylko w maskę. Mała maska w trawie / liściach / tle nie kończy się „pustym” wynikiem bez obiektu.
- [ ] Inpainting (wszystkie modele, także GPT Image 2): do `referenceImages` idą dwa obrazy — wycinek z magentą (Image 1) i maska czarno-biała (Image 2); `inputs.maskImage` nie jest używane (w GPT Image 2 nie działało).
- [ ] Przy wybranym GPT Image 2 inpainting i eraser idą przez Nano Banana 2 (GPT nie przyjmuje maski jako obrazu referencyjnego); placeholder w oknie inpaintingu to zaznacza. Lite / NB 2 / Pro używają wybranego modelu.
