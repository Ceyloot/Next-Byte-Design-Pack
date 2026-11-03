## 0. Jak rozumiem zadanie
- Intencja: polecenie (działaj). Typ pracy: wygląd.
- Cel: przeprojektować istniejący panel główny NextByte według załączonych inspiracji w spokojny, przyjemny interfejs z niebieskimi akcentami, nastawiony na pracę, produktywność i wygodną współpracę z AI.
- [ ] Zachować dotychczasowe pozycje i dane panelu bocznego, dopasowując jego wygląd do nowego projektu.
- [ ] Połączyć „Twoje Byte” i „Akywność” w jeden górny moduł inspirowany szerokim paskiem salda, wykresu i mapy aktywności z referencji.
- [ ] Umieścić czat AI w centralnej części panelu.
- [ ] Zachować dolną sekcję „Twoja aktywność” i pozostałe istniejące moduły, komponując je z nowym układem.
- [ ] Dodać wizualny kafel folderu inspirowany referencją bazy wiedzy, jako przejście do notatek.
- [ ] Zastosować spójne, ciekawe rozwiązania wizualne ułatwiające orientację i zachęcające do pracy, czerpiąc z prostoty i przyjaznego charakteru platformy Kadr, lecz z naciskiem na efektywność zamiast ekspresji kreatywnej.
- Nie kopiujemy pomarańczowej kolorystyki ani funkcji Kadr, nie zastępujemy zawartości panelu bocznego pozycjami z referencji, nie dodajemy niezleconych funkcji biznesowych ani nie przebudowujemy mechanizmów AI.

## 1. Cel i zakres
- Wcześniejsze ustalenie wskazywało „Dashboard 2.0 kopia”, której nadal nie znaleziono. Nie wolno po cichu zmieniać oryginału ani uznawać istniejącego „Dashboard 2.0” za kopię. Wykonawca ma najpierw potwierdzić istniejącą kopię w kodzie i interfejsie; jeżeli jej nie ma, wstrzymać zmiany aplikacji i zgłosić konkretną blokadę. Nie tworzyć samowolnie nowej kopii ani nie kierować projektu do statycznego prototypu.
- Materiały są już dostępne w `docs/reference/`: pierwszy obraz pokazuje ogólną kompozycję, drugi górny moduł, trzeci folder, czwarty przyjazną prostotę. Szczegóły wizualne są w `docs/STYLE.md`.
- Warstwy do wykonania: tło — głęboki spokojny granat bez agresywnego blasku; układ i kontenery — szeroki pasek, centralny kreator, moduły kontekstowe i dolna aktywność; kafelki — folder notatek z czytelną akcją; karty i panele — dyskretne obramowania, miękkie powierzchnie i czytelna hierarchia; nagłówek i nawigacja — dotychczasowe elementy i dane w nowym lokalnym wyglądzie; przyciski i pola — wyraźne stany, jasne etykiety i spokojne akcenty; tabele i listy — zachować dane, działania i czytelne odstępy; typografia — spokojna, kontrastowa, wyraźne liczby i nagłówki.
- Nie zmieniać globalnych tokenów, wspólnego wyglądu i widoków poza zakresem. Style i nowe zmienne ograniczyć do korzenia potwierdzonej kopii, z prefiksem `--dashboard-kopia-*`; współdzielony sidebar stylować tylko w tym kontekście.

## 2. Środowisko i wykrywanie
- Sonda `http://localhost:5190/` zwróciła HTTP 200 i stronę Vite. `http://localhost:8093/panel-glowny` oraz `http://127.0.0.1:8093/` zwróciły `fetch failed`; przyczyna nieznana. W konfiguracji panelu jest port 8093 oraz proxy `/nb-funkcje`. W Preview istniejąca ramka wskazuje `http://localhost:8093/panel-glowny?nav=lewo` i po opóźnieniu wyświetla wskazówkę uruchomienia, o ile nie uzna ramki za załadowaną.
- Sprzęt: 31,73 GB RAM, NVIDIA GeForce RTX 5050 Laptop GPU; wykryto także lokalne modele i silniki. Wizualna przebudowa nie wymaga potwierdzonego lokalnego modelu ani GPU; nie pobierać ich i nie instalować. Nie wiadomo, ile jest pamięci GPU ani czy wystarcza do konkretnych modeli.
- Istniejący panel ma bramkę logowania i własne źródła Supabase; brak potwierdzenia dostępu do danych. Nie wpisywać haseł ani obchodzić bramki. Przy braku danych zachować istniejące stany ładowania i błędów; nie wymyślać danych. Nowe wykrywanie modeli, instalatory i przycisk ponowienia nie należą do zmiany wyglądu.
- Przed podglądem ponowić sondę; jeśli port jest wolny, uruchomić istniejący `npm run dev --prefix nextbyte-panel-glowny` bez zmiany konfiguracji. Gdy aplikacja lub zależności nie działają, podać rzeczywisty komunikat i nie instalować nic w ciemno.

## 3. Integracja i opcje połączenia
- Opcja A: zachować oryginalną integrację potwierdzonego widoku, w tym jego router, konteksty, zapytania Supabase i istniejące proxy. Opcja B: skopiować interfejs do Preview i zastąpić źródła danymi prototypowymi lub nowym połączeniem.
- Wybrać A: zapewnia zgodność nawigacji, danych, Byte i AI oraz nie tworzy fikcyjnej kopii. Jeżeli potwierdzona kopia okaże się osadzonym panelem, zachować ramkę, a bezpośredni adres wykorzystać do diagnostyki. Samo istnienie ramki nie potwierdza, że to kopia.
- `ByteStatusBar` już łączy saldo, rzeczywisty wykres i `AktywnoscWykres`; zmienić jego kompozycję, nie dublować danych. `SzybkiKreator` deleguje czat i inne tryby do istniejących modułów; zachować wybór modeli i koszty z ich istniejących źródeł. Nie dopisywać na sztywno modeli, salda, aktywności ani procentów z obrazów.

## 4. Przeszkody i ryzyka
- Nieustalona kopia: zbadać trasy i faktyczny ekran; bez jednoznacznego dowodu zatrzymać pracę i zgłosić blokadę.
- Niedostępny serwer: sprawdzić port i istniejący skrypt; nie zakładać przyczyny i nie zmieniać konfiguracji bez dowodów.
- Brak modelu: nie jest wymogiem zmiany wyglądu; zachować istniejący komunikat funkcji AI, nic nie pobierać.
- Za mało pamięci GPU: nie wymagamy lokalnego wnioskowania; konkretny błąd istniejącej funkcji zgłosić bez zmieniania środowiska.
- CORS: sprawdzić błąd i istniejące proxy `/nb-funkcje`; nie osłabiać polityki ani nie wprowadzać nowego proxy bez diagnozy.
- Timeouty i anulowanie: zachować istniejące mechanizmy; podczas testu wyglądu nie uruchamiać płatnych ani długich zadań i zgłosić zaobserwowane błędy.
- Walidacja i dostęp: zachować dotychczasowe komunikaty, nie obchodzić logowania; niedostępny stan zgłosić.
- Zajęty port: sprawdzić, co odpowiada i komunikat serwera; nie zatrzymywać cudzych procesów ani nie zmieniać portu ramki w ciemno.
- Niezgodność API: zachować dotychczasową integrację i zanotować dokładny błąd; nie aktualizować zależności bez diagnozy.
- Przeciek stylów lub ucięta treść: ograniczyć selektory do kopii i sprawdzić sąsiednie widoki oraz przewijanie. Brak prawdziwych danych mapy oznaczyć istniejącym stanem pustym, nie generować aktywności.

## 5. Dane i stan
- Zachować rzeczywiste saldo, historię, wybór przedziału, mapę i dzienną aktywność, nawigację, sesję, wybór modelu, pola i pozostałe moduły. Źródła to istniejące hooki i dane platformy; nie zmieniać formatów, zapisu ani odczytu.
- W kandydacie `useWallet`, `useByteBurn` i `useAktywnoscDzienna` dostarczają dane paska, a `useOptimizedDashboard` pobiera dane dashboardu z Supabase. Dostępność tych danych nie została potwierdzona. Kafel folderu ma prowadzić do istniejącej trasy `/notatki`, bez tworzenia nowej funkcji notatek.

## 6. Struktura plików
- `nextbyte-preview/src/sections/PreviewSection.tsx` i `panel2/PanelGlownyOsadzony.tsx` — identyfikacja pozycji i osadzenia; nie zmieniać w ciemno.
- `nextbyte-panel-glowny/src/pages/Dashboard.tsx` — kandydat na układ główny; zmieniać wyłącznie po potwierdzeniu, że jest właściwą kopią.
- `nextbyte-panel-glowny/src/components/dashboard/ByteStatusBar.tsx`, `AktywnoscWykres.tsx`, `SzybkiKreator.tsx` — istniejące komponenty kandydata do zachowania i lokalnego ułożenia.
- `nextbyte-panel-glowny/src/components/AppShell.tsx`, `AppSidebar.tsx`, `sidebar/menuData.ts` — wspólna powłoka i dane menu; zachować funkcje i zawartość, bez globalnych zmian.
- `nextbyte-panel-glowny/src/styles/` — miejsce ewentualnego nowego arkusza ograniczonego do korzenia kopii; nie edytować zmiennych globalnych.
- `docs/STYLE.md` — specyfikacja wizualna tylko dla zamówionego widoku.

## 7. Kolejność budowy i zależności
- [ ] Potwierdzić tożsamość kopii w kodzie i działającym interfejsie; przy braku dowodu wstrzymać wykonanie zamiast zmieniać oryginał.
- [ ] Sprawdzić usługę i dostęp do istniejących danych; obejrzeć widok i spisać faktycznie obecne moduły oraz stan ich działania.
- [ ] Wprowadzić lokalne tokeny `--dashboard-kopia-*`, następnie kolejno zrealizować wszystkie warstwy z sekcji 1; nie ruszać globalnych tokenów.
- [ ] Zachować sidebar, ułożyć istniejący pasek Byte i aktywności w jeden szeroki moduł zgodny z referencją; zachować wykres i przełączniki z prawdziwymi danymi.
- [ ] Umieścić istniejący kreator z czatem w centrum, zachować pozostałe tryby i mechanizmy, następnie ułożyć istniejące moduły i dolną aktywność bez usuwania funkcji.
- [ ] Dodać do notatek dostępny z klawiatury kafel-folder prowadzący do istniejącej trasy, bez nowej logiki biznesowej.
- [ ] Uruchomić istniejące `typecheck` i `build` właściwej paczki. Sprawdzić komputer przez check i przeglądarkę lokalną, klikając wejście do kopii, zakresy wykresu, nawigację i folder notatek; nie wysyłać płatnego zadania. Gdy check lub dostęp za logowaniem są niedostępne, jasno to zgłosić.
- [ ] Przejść po każdej warstwie względem obrazów i werdyktu, poprawić wady w zakresie i powtórzyć kontrolę, maksymalnie sześć rund. Telefon nie był wskazany jako wymagana kontrola; zachować istniejącą responsywność i przewijanie.

## 8. Kryteria akceptacji
- Tożsamość kopii potwierdzona; oryginał i inne widoki bez niezamierzonych zmian. Istniejące elementy i dane sidebara zachowane.
- Na górze jeden szeroki moduł zawiera rzeczywiste saldo, wykres i rzeczywistą mapę aktywności, a jego przyciski oraz wybór zakresu działają. Dane nie są skopiowane ze zrzutu.
- Centralny kreator zachowuje obsługę czatu i pozostałych trybów; niżej dostępna jest aktywność i wszystkie wcześniej istniejące moduły. Folder otwiera istniejące notatki.
- Widok jest spokojny, niebieski i czytelny, a wszystkie warstwy odpowiadają `docs/STYLE.md`; klawiatura i stany skupienia działają, nic nie jest ucięte. Weryfikacja w przeglądarce oraz wynik builda i typecheck są podane uczciwie.

## 9. Krytyczne pliki
- `nextbyte-preview/src/sections/PreviewSection.tsx` — identyfikacja celu.
- `nextbyte-preview/src/sections/panel2/PanelGlownyOsadzony.tsx` — diagnostyka osadzenia.
- `nextbyte-panel-glowny/src/pages/Dashboard.tsx` — kandydat na główny układ.
- `nextbyte-panel-glowny/src/components/dashboard/ByteStatusBar.tsx` — pasek Byte i aktywności.
- `nextbyte-panel-glowny/src/components/dashboard/AktywnoscWykres.tsx` — istniejąca aktywność.
- `nextbyte-panel-glowny/src/components/dashboard/SzybkiKreator.tsx` — centralny kreator.
- `nextbyte-panel-glowny/src/components/AppSidebar.tsx` — istniejący sidebar, bez globalnych zmian.
- `docs/STYLE.md` — wizualna specyfikacja widoku.
