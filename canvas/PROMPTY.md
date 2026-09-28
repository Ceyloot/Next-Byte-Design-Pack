# DOKUMENTACJA I SPECYFIKACJA PROMPTÓW SYSTEMU CANVAS (NEXTBYTE LOOMIC ENGINE)

Niniejszy dokument stanowi pełny rejestr, analizę przypadków brzegowych oraz specyfikację docelową wszystkich promptów wykorzystywanych w silniku generatywnym **Canvas**.

---

## 1. Architektura Potoku Promptów (Pipeline 4-Etapowy)

Potok przetwarzania poleceń w Canvas jest rozdzielony na cztery wyspecjalizowane warstwy, aby uniknąć halucynacji i zapewnić fotorealistyczną precyzję:

```
[Zdjęcia wejściowe + Pineski]
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. WIZUALNA ANALIZA PINESEK (Gemini Vision)                │
│    - SYSTEM_ANALIZY_PINESKI: wymiary w cm, kalibracja,       │
│      interakcja ludzka, orientacja 3D, stan brudu/patyny,   │
│      plan głębi (bokeh) i wektory promieni światła          │
│    - SYSTEM_KLASYFIKACJI: obiekt vs wolna przestrzeń        │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AGENT REŻYSERSKI (Gemini 2.5 Flash / Loomic Planner)     │
│    - SYSTEM_REZYSERA: wybór intencji z 13 trybów             │
│    - Ochrona ludzi wchodzących w kontakt fizyczny           │
│    - Zachowanie patyny i zabrudzeń z referencji             │
│    - Wyznaczenie bounding boxów inpaintingu [ymin, xmin, ...]│
│    - Generowanie instrukcji wykonawczej EN + planu PL       │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RUSZTOWANIE DLA MODELU OBRAZU (Nano-Banana / Flux / Qwen)│
│    - zbudujPolecenie(): sekcje kadru, światła, skali        │
│    - 13 trybów z afirmacją stanu docelowego (Zero zakazów)  │
│    - Wpasowanie optyczne: bokeh w tle vs ostry 1. plan      │
│    - Spójność wektorów światła (słońce, neony, cienie)      │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. KONTROLA JAKOŚCI I ZGODNOŚCI (Quality Gate)              │
│    - SYSTEM_SPRAWDZENIA: weryfikacja wykonania zadania      │
│    - Kontrola pikseli na wyciek maski magentowej            │
│    - Test różnicowy na brak zmian                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Anatomia Błędów Produkcyjnych i Wymiary Obiektów

Dwa kluczowe incydenty z testów produkcyjnych obnażyły luki poprzedniego podejścia:

### Przypadek 1: Człowiek przy laptopie + Żaba w tle („Zamień poduszkę na żabę”)
* **Błąd modelu:** Usunięcie mężczyzny siedzącego przy biurku, wymazanie laptopa i wygenerowanie gigantycznej (1.5 m), sztucznie ostrej figurki żaby na środku kadru.
* **Dlaczego tak się stało:**
  1. *Brak warstwowości głębi (Depth Slicing):* Model nie wiedział, że biurko, laptop i człowiek to nienaruszalny pierwszy plan (Foreground), a edycja dotyczy wyłącznie głębokiego tła (Background).
  2. *Ignorowanie optyki obiektywu (BOKEH):* Tło pokoju miało płytką głębię ostrości i miękkie rozmycie soczewkowe (bokeh) z pionowymi niebieskimi tubami LED. Wstawiona żaba powinna być **optycznie rozmyta** na tej samej płaszczyźnie co fotel w tle, a nie mieć ostrości zdjęcia makro.
  3. *Utrata skali fizycznej:* Figurka żaby w referencji ma ~15 cm. Wstawiona w tło za biurkiem powinna być małym akcentem wielkości kubka, a nie wielkości człowieka.
* **Reguła wdrożona:** `DEPTH PLANE & OPTICAL BOKEH` — elementy w tle dziedziczą rozmycie soczewkowe (bokeh) i oświetlenie sceny, a pierwszy plan jest zablokowany jako nienaruszalna maska okluzji.

### Przypadek 2: Zakurzony Ford GT40 w stodole + Lamborghini Urus z opierającym się człowiekiem
* **Błąd modelu:** Ucięcie człowieka w połowie, utrata jego pozy i fizycznego oparcia o drzwi, odwrócenie płótna (wybranie stodoły zamiast podjazdu willi) oraz wyczyszczenie samochodu lub zignorowanie kąta padania światła zachodzącego słońca.
* **Dlaczego tak się stało:**
  1. *Ignorowanie kontaktu fizycznego („Co lub kto robi z tym”):* Model widział tylko etykietę „samochód” i nie uwzględnił, że **mężczyzna w białym stroju opiera się nogą o próg i trzyma dłoń na otwartych drzwiach**. Zmiana auta bez nakazu zachowania pozycji człowieka i otwarcia drzwi nowego auta ucięła postać w połowie!
  2. *Samowolne czyszczenie obiektu (Patina & Dirt Fidelity):* Ford GT40 w stodole był pokryty grubą warstwą wieloletniego kurzu i brudu. Jeśli użytkownik nie wpisał „umyj / wyczyść”, nowy Ford na podjeździe **MUSI pozostać zakurzony i brudny**, zachowując matowy charakter lakieru.
  3. *Wektory światła i cienia:* Na podjeździe willi było niskie, ciepłe słońce o złotej godzinie (z prawej strony pod kątem ~15°). Nowy samochód musiał rzucać długi cień w lewo, a jego zakurzony lakier musiał reagować miękkim, rozproszonym blaskiem na zachodzące słońce, zamiast lustrzanego połysku.
* **Reguła wdrożona:** `PHYSICAL CONTACT PRESERVATION` (ludzie wchodzący w kontakt zostają w 100% zachowani) + `SURFACE DIRT FIDELITY` (brud zostaje brudem) + `LIGHT VECTOR HARMONY`.

---

## 3. Kompletna Karta Wielowymiarowego Opisu Obiektu

W promptach analitycznych (`SYSTEM_ANALIZY_PINESKI`) oraz reżyserskich (`SYSTEM_REZYSERA`) każdy obiekt jest obligatoryjnie charakteryzowany w 7 wymiarach:

```json
{
  "wymiary_fizyczne": "wysokosc_cm, dlugosc_cm, proporcje wzgl. otoczenia",
  "interakcja_ludzka": "KTO wchodzi w kontakt? (np. człowiek oparty o drzwi, dłonie na laptopie)",
  "pozycja_i_kat_3d": "Orientacja wzgl. kamery (np. 3/4 przód lewo, drzwi otwarte pod kątem 40°)",
  "stan_powierzchni": "Patyna: kurz, brud, zacieki, mat, zadrapania, rdza vs czysty połysk",
  "plan_glebi": "Foreground / Midground / Background — ostrość w ognisku vs bokeh tła",
  "wektory_swiatla": "Kąt słońca, długość cieni, neony/rim-lighty, diffuse vs specular",
  "granica_buforowa": "Clearance buffer — zakaz przenikania brył (zero mesh clipping)"
}
```

---

## 4. Rejestr Wszystkich Promptów w Systemie

### 4.1. Analiza Wizualna (`SYSTEM_ANALIZY_PINESKI`)
Analizuje obiekt natychmiast po wbiciu pineski, wymuszając analizę fizycznego kontaktu ludzi, kąta 3D, stanu zabrudzenia, głębi ostrości i wektorów światła.

### 4.2. Reżyser Edycji (`SYSTEM_REZYSERA` w `rezyser.ts`)
* **Kluczowe dyrektywy:**
  * **Ochrona ludzi w interakcji:** Zakaz ucinania lub usuwania ludzi dotykających/opierających się o obiekt.
  * **Zachowanie brudu i patyny:** Obiekt z referencji zachowuje kurz i brud; zakaz automatycznego polerowania.
  * **Głębia optyczna:** Obiekty w tle otrzymują rozmycie soczewkowe (bokeh) i skalę zgodną z perspektywą.
  * **Wektory fotometryczne:** Precyzyjne odwzorowanie kierunku promieni słonecznych i neonowych rim-lightów.

### 4.3. Rusztowanie dla Modeli Obrazu (`tryby-edycji.ts` + `polecenia.ts`)
13 trybów generatywnych ze zaktualizowanymi regułami:
1. **wstaw (Addition):** Ochrona pierwszego planu, bokeh w tle, autentyczna skala miniatury.
2. **przenies (Relocation):** Zasada pojedynczości (dokładnie 1 instancja w kadrze), Clean Plate na źródle, adaptacja ostrości między planami.
3. **zamien (Replacement):** 100% ochrona ludzi w interakcji (dopasowanie geometrii drzwi do człowieka), własny rozmiar, zachowanie patyny/kurzu.
4. **postac (Character Identity):** Przeniesienie twarzy i włosów, ciało, poza i ubiór z płótna.
5. **ubranie (Clothing):** Organiczne fałdy w stawach, anatomia i twarz nienaruszone.
6. **usun (Removal):** Odtworzenie tła i wzorów podłoża bez śladu po usuniętym obiekcie.
7. **tekstura (Texture):** Zamiana faktury bez deformacji geometrii 3D.
8. **pora_roku (Season):** Zmiana roślinności i pokrywy gruntu, budynki nienaruszone.
9. **pora_dnia (Time of Day):** Zmiana kąta słońca, włączenie świateł sztucznych nocą.
10. **efekt (Effects):** Cienie z ambient occlusion, odbicia w kałużach, poświata wolumetryczna.
11. **tlo (Background):** Pierwszy plan zamrożony, rim-lighting z nowego tła.
12. **styl (Style):** Spójna technika malarska od krawędzi do krawędzi.
13. **popraw (Fix):** Chirurgiczna mikro-zmiana.

---

## 5. Analiza Trzech Krytycznych Awarii Produkcyjnych (Post-Mortem)

### 5.1. Przypadek 1: Żaba i Mężczyzna przy Laptopie (Głębia Optyczna i Skala)
* **Błąd:** Zamiast małej, rozmytej figurki żaby w tle (bokeh) za postacią, system wyciął mężczyznę z pierwszego planu i wygenerował ostrego, 1.5-metrowego potwora pośrodku pokoju.
* **Przyczyna:** Brak segmentacji planów głębi, brak zasady pieczętowania pierwszego planu (`sealed foreground`), brak reguły dziedziczenia rozmycia soczewkowego (`bokeh inheritance`).
* **Rozwiązanie:** Wdrożenie reguły ochrony pierwszego planu w trybach `wstaw` i `zamien` oraz wymuszenie rozmycia optycznego obiektów lokowanych w planie tła.

### 5.2. Przypadek 2: Lamborghini Urus vs Zakurzony Ford GT40 w Stodole (Człowiek w Interakcji i Brud)
* **Błąd:** System uciął człowieka w połowie, zmienił pozycję i kąt światła, oraz "umył" samochód na wysoki połysk, ignorując grubą warstwę kurzu ze stodoły.
* **Przyczyna:** Brak opisu relacji fizycznej (`interakcja`), brak rejestracji patyny powierzchni (`stanPowierzchni`), ignorowanie wektorów światła.
* **Rozwiązanie:** Wprowadzenie dyrektywy nienaruszalności człowieka w kontakcie fizycznym (nowy obiekt musi dopasować otwarte drzwi do opierającego się człowieka) oraz zasady "DIRT STAYS DIRTY" (zakaz czyszczenia brudu bez wyraźnego polecenia).

### 5.3. Przypadek 3: Ford GT40 na Podjeździe Posiadłości Górskiej (Dysproporcja i Przesunięcie na Taras)
* **Błąd:** Pineska nr 2 została wbita na podjeździe tuż przed bramą garażową. Wynik wygenerował gigantyczny samochód wielkości całego piętra domu, usytuowany na dolnym kamiennym tarasie widokowym z parasolem, niszcząc architekturę i ignorując podjazd.
* **Przyczyna:**
  1. **Halucynacja współrzędnych obszaru:** Reżyser Gemini Vision nie kotwiczył ramki do współrzędnych pineski, lecz sugerował współrzędne z szablonu lub wybierał "otwarty plac" na tarasie (`y = 60–80%`).
  2. **Toksyczna reguła wypełnienia 50–70%:** W promptach znajdowało się polecenie `"the object should occupy 50–70% of the available workspace"`, co zmuszało model dyfuzyjny do sztucznego rozdmuchiwania niskiego auta (102 cm) do monstrualnych rozmiarów.
* **Rozwiązanie:**
  1. **Deterministyczne kotwiczenie pineski (`skalibrujObszarPineski`):** Ramka inpaintingu jest w 100% zablokowana na horyzontalnym (`px`) i wertykalnym (`py`) punkcie wbicia pineski.
  2. **Hierarchia skali architektonicznej:** Samochód musi mieścić się w bramie garażowej (~2.1 m x 2.4 m), na jednym pasie podjazdu i stanowić zaledwie ~3–6% szerokości kadru w ujęciach krajobrazowych.
  3. **Usunięcie reguły 50–70%:** Zakaz rozpychania obiektów w ramkach inpaintingu.

### 5.4. Przypadek 4: Mercedes W124 na Podjeździe Rezydencji (Orientacja w Poprzek Drogi i Odbicia ze Studia)
* **Błąd:** Pineska nr 2 została wbita po lewej stronie brukowanego podjazdu. Model wygenerował Mercedesa obróconego po przekątnej w poprzek obu pasów ruchu (blokada drogi jak po poślizgu/wypadku), a na szybach i karoserii pojawiły się odbicia studyjnych banerów ("autar...") ze zdjęcia dawcy zamiast pochmurnego nieba i ogrodu.
* **Przyczyna:**
  1. **Zbyt szerokie proporcje ramki (np. 2.2:1):** Wymuszały na modelu dyfuzyjnym wpasowanie długiego boku auta (4.7 m) w szeroki prostokąt, uniemożliwiając naturalne ustawienie auta przodem do kamery lub w stronę domu (gdzie proporcje wynoszą ok. 1.1:1 – 1.35:1).
  2. **Kopiowanie kąta obrotu i odbić ze zdjęcia referencyjnego:** Brak zakazu kopiowania kąta 3D (yaw) z fotografii komisowej oraz brak wymogu przeliczenia odbić na otoczenie płótna.
  3. **Brak reguły orientacji wzdłuż osi drogi:** Model nie wiedział, że na jezdniach/podjazdach pojazdy muszą poruszać się lub parkować wzdłuż krawężnika.
* **Rozwiązanie:**
  1. **Reguła osi jezdni (`VEHICLE ROAD ALIGNMENT`):** Pojazd na drodze/podjeździe MUSI być zorientowany wzdłuż osi podłużnej (zgodnie z kierunkiem jazdy: przodem do kamery lub w stronę garażu, równolegle do krawężnika). Całkowity zakaz stawiania aut w poprzek jezdni.
  2. **Adaptacja proporcji ramki do perspektywy czołowej:** Wymiary ramki dla pojazdu w osi podłużnej zostały skorygowane do naturalnych proporcji 1.1:1 – 1.35:1 (`w ≈ 0.065–0.115 * wspGlebi`, `h ≈ 0.05–0.085 * wspGlebi`).
  3. **Integracja odbić (`REFLECTIONS & AMBIENT INTEGRATION`):** Lakier i szyby muszą odbijać niebo, trawnik, dom i kostkę brukową z płótna, eliminując studyjne neony i banery ze zdjęcia dawcy.
  4. **Zachowanie wolnego pasa ruchu:** Pineska wbita przy lewej krawędzi wymusza parkowanie przy lewym krawężniku, z zachowaniem wolnego przejazdu po prawej stronie.

---

## 6. Status Zgodności Kodu

Wszystkie powyższe reguły zostały bezpośrednio wdrożone w plikach źródłowych:
- `nextbyte-preview/src/sections/canvas/typy.ts` (`AnalizaPineski`, wymiary, patyna, wektory)
- `nextbyte-preview/src/sections/canvas/dostawca.ts` (`opisAnalizy`, serializacja wymiarów)
- `nextbyte-preview/src/sections/canvas/agent-proxy.ts` (`SYSTEM_ANALIZY_PINESKI`, ekstrakcja 7 wymiarów)
- `nextbyte-preview/src/sections/canvas/rezyser.ts` (`SYSTEM_REZYSERA`, kotwiczenie ramki do pineski, orientacja osi drogi)
- `nextbyte-preview/src/sections/canvas/tryby-edycji.ts` (`MATERIAL_OBIEKTU`, usunięcie reguły 50–70%, skala architektoniczna, orientacja wzdłuż drogi)
- `nextbyte-preview/src/sections/canvas/polecenia.ts` (`sekcjaSkali`, proporcje do bramy garażowej, jezdni i zakaz blokowania drogi)
- `nextbyte-preview/src/sections/CanvasSection.tsx` (`skalibrujObszarPineski` z inspekcją pineski źródłowej, proporcjami osi jezdni 1.1–1.35:1)
- `canvas/lib/canvasPrompts.ts` (`MASTER_PROMPT_ENGINEER`, `CANVAS_TEMPLATES`)
- `canvas/lib/jsonPromptEngine.ts` (Loomic JSON Contracts)

---

## 7. KATALOG OPERACJI A–Z — LOGIKA I MODUŁY

Każda operacja to **komenda z chipów** + zestaw **doklejanych modułów-zasad**. Prompt nie jest jednym blokiem — składa się z nazwanych placeholderów, a każda operacja ma własną logikę: kto jest **celem**, kto **dawcą**, co **znika**, a co **zostaje**.

### 7.0. Słownik modułów (placeholdery)

| Placeholder | Znaczenie |
|---|---|
| `{COMMAND}` | Dosłowna komenda użytkownika złożona z chipów — CO zrobić i JAK. |
| `{FRAMING}` | Blokada ujęcia: ta sama pozycja, ogniskowa, kąt i krawędzie kadru. |
| `{IMAGES}` | Władza zdjęć: które jest PŁÓTNEM (kadr wyniku), które REFERENCJĄ (dawcą). |
| `{ANCHORS}` | Pineski jako kotwice przestrzenne + obszary chronione (PROTECTED). |
| `{IDENTITY}` | ① Co pozostaje prawdą o obiekcie/postaci; co NIE przechodzi z kadru dawcy. |
| `{POSITION}` | ② Gdzie stoi: styk z gruntem, kolejność głębi, odstęp do sąsiadów, perspektywa. |
| `{SCALE}` | ③ Realne wymiary (z analizy pineski) + kotwice skali sceny; zero gigantów. |
| `{APPEARANCE}` | ④ Medium i kolor (mono/B&W/sepia), ziarno filmu, ostrość, wektory światła. |
| `{FIDELITY}` | ⑤ Zero enhancera: ta sama rozdzielczość/perspektywa/światło, oryginalna jakość poza zmianą. |
| `{CLEAN_OUTPUT}` | Jedno bezszwowe zdjęcie — nie maska, nie kolaż, nie wklejka. |
| `{UNCHANGED}` | Jawna lista tego, co zostaje bez zmian. |
| `{REMOVE_OLD}` | Usunięcie starego obiektu wraz z cieniem/odbiciem + odbudowa tła (Clean Plate). |
| `{CONTACT}` | Ochrona osób/rzeczy w kontakcie (poza, kończyny, dopasowanie geometrii nowego obiektu). |
| `{KEEP_COUNT}` | Nie usuwaj i nie redukuj liczby istniejących obiektów w scenie. |

**Kolejność bazowa** (wspólna dla wszystkich): `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → **[moduły operacji]** → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED}`.

---

### 7.1. OBJECT SWAP — zamień obiekt (`zamien`)
**Logika:** obiekt pod pineską na PŁÓTNIE = **cel (znika)**; obiekt pod pineską referencyjną lub opisany słowem = **dawca (wchodzi)**. Stary obiekt usunięty z cieniem i odbiciem, tło odbudowane. Nowy wchodzi w SWOICH realnych wymiarach (nie w obrysie starego). Jeśli ktoś dotykał starego — nowy dostaje WŁASNĄ odpowiednią część (nie przenosimy części usuwanego). Reszta kadru bez zmian.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{REMOVE_OLD}` → `{IDENTITY(dawca)}` → `{CONTACT}` → `{POSITION(miejsce starego)}` → `{SCALE}` → `{APPEARANCE}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED}`
**Krytyczne:** `{REMOVE_OLD}`, `{IDENTITY(dawca)}` (własne detale nowego), `{SCALE}`.

### 7.2. OBJECT TRANSFER — przenieś obiekt (`przenies`)
**Logika:** TEN SAM obiekt zmienia miejsce. W wyniku występuje **dokładnie raz**. Jeśli źródło i cel są na JEDNYM zdjęciu → Clean Plate na starym miejscu (całkowite zakrycie śladu) + obiekt na nowym. Jeśli obiekt z innego zdjęcia → przynosimy tylko obiekt do miejsca docelowego. Tożsamość i stan powierzchni (kurz/patyna) zachowane.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(ten sam obiekt)}` → `{REMOVE_OLD(stare miejsce, tylko gdy jedno zdjęcie)}` → `{POSITION(cel)}` → `{SCALE}` → `{APPEARANCE}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED}`
**Krytyczne:** zasada pojedynczości (1 instancja), Clean Plate, `{SCALE}` przy zmianie planu głębi.

### 7.3. CHARACTER SWAP — zamień postać (pełna)
**Logika:** postać pod pineską na PŁÓTNIE = **cel (znika)**; postać wskazana (referencja) = **dawca**. Wchodzi CAŁA postać dawcy (tożsamość, twarz, sylwetka, ubiór), ale **wpasowana w scenę płótna**: ta sama pozycja w kadrze, ten sam kierunek/kadrowanie, skala i światło sceny. To NIE jest sam face swap — wymieniamy człowieka, nie tylko twarz. Reszta sceny (inne osoby, tło) bez zmian.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{REMOVE_OLD(stara postać)}` → `{IDENTITY(cała postać dawcy)}` → `{CONTACT}` → `{POSITION(miejsce starej postaci, ta sama poza kadrowa)}` → `{SCALE}` → `{APPEARANCE}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(inne osoby)}`
**Krytyczne:** dawca daje tożsamość+ciało+ubiór; scena (kadr, skala, światło) z płótna; inne osoby nietknięte.

### 7.4. CHARACTER TRANSFER — przenieś postać (`przenies` dla osoby)
**Logika:** TA SAMA osoba trafia w nowe miejsce lub na inne zdjęcie, zachowując tożsamość, ubiór i sylwetkę. Poza może się dostosować do nowego podłoża (stanie/siad), ale to ta sama osoba. Jedno zdjęcie → Clean Plate na starym miejscu. Występuje raz.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(ta sama osoba)}` → `{REMOVE_OLD(stare miejsce, gdy jedno zdjęcie)}` → `{POSITION(cel, styk z gruntem)}` → `{SCALE(wzrost ~realny)}` → `{APPEARANCE}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED}`
**Krytyczne:** zachowanie tożsamości i ubioru, realny wzrost względem sceny, 1 instancja.

### 7.5. FACE SWAP — zamień twarz / tożsamość (`postac`)
**Logika:** postać na PŁÓTNIE zostaje (poza, ciało, ubiór, kadr), zmienia się **tylko tożsamość**: twarz, struktura, karnacja, włosy — z referencji. Twarz przerysowana pod kątem i spojrzeniem głowy z płótna, w świetle płótna. Inne osoby ze swoimi twarzami.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(tylko twarz/włosy dawcy)}` → `{POSITION(twarz w tym samym miejscu i rozmiarze)}` → `{APPEARANCE(światło i ziarno twarzy = płótno)}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(poza, ciało, ubiór, tło)}`
**Krytyczne:** kąt i spojrzenie z płótna, ciągłość szyi/karnacji, brak zmiany pozy.

### 7.6. INSERT OBJECT — wstaw obiekt (`wstaw`)
**Logika:** DODAJEMY nowy obiekt w miejscu pineski, **nic nie usuwając**. Wszystkie istniejące obiekty/osoby/zwierzęta zostają (ta sama liczba i pozycje). Nowy stoi obok/przy — „obok" = tuż przy grupie, wspólna linia gruntu.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{KEEP_COUNT}` → `{IDENTITY(nowy obiekt)}` → `{POSITION(przy kotwicy)}` → `{SCALE}` → `{APPEARANCE}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(cała reszta sceny)}`
**Krytyczne:** `{KEEP_COUNT}` (nic nie znika), `{SCALE}`, `{APPEARANCE}` (medium sceny).

### 7.7. CLOTHING SWAP — zmień ubranie (`ubranie`)
**Logika:** wymieniamy strój wskazanej postaci; twarz, poza, sylwetka, dłonie, tło nietknięte. Nowe ubranie dopasowane do anatomii z organicznymi fałdami, w świetle sceny.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(nowy strój; ciało i twarz z płótna)}` → `{POSITION(na ciele postaci)}` → `{APPEARANCE(światło stroju = scena)}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(twarz, poza, dłonie, tło)}`
**Krytyczne:** anatomia i twarz nienaruszone, przejścia przy szyi/nadgarstkach/kostkach.

### 7.8. REMOVE — usuń obiekt (`usun`)
**Logika:** usuwamy wskazany obiekt wraz z cieniem/odbiciem/śladami i odbudowujemy to, co logicznie jest za/pod nim (kontynuacja wzorów, perspektywy). Reszta bez zmian.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{REMOVE_OLD}` → `{APPEARANCE(odbudowa = otoczenie)}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED}`
**Krytyczne:** pełny Clean Plate, kontynuacja wzorów/światła, sąsiedzi nietknięci.

### 7.9. BACKGROUND SWAP — zmień tło (`tlo`)
**Logika:** pierwszy plan (postacie/obiekty) zamrożony w tej samej pozycji, skali i kadrze; zmienia się TYLKO otoczenie. Postacie doświetlone pod nowe tło (rim-light, refleksy), horyzont na tej samej wysokości.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(pierwszy plan bez zmian)}` → `{POSITION(pierwszy plan zamrożony)}` → `{APPEARANCE(relight z nowego tła)}` → `{FIDELITY(rozdzielczość, kadr)}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(tożsamość, poza, kadr)}`
**Krytyczne:** zapieczętowany pierwszy plan, spójne doświetlenie, wysokość horyzontu.

### 7.10. TEXTURE — zmień fakturę (`tekstura`)
**Logika:** nakładamy nowy materiał na tę samą geometrię 3D — kształt, krzywizny, perspektywa zachowane; zmienia się tylko powierzchnia i jej reakcja na światło.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{IDENTITY(geometria bez zmian; tylko materiał)}` → `{APPEARANCE(reflektancja nowego materiału w świetle sceny)}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(kształt, okucia, sąsiedzi)}`
**Krytyczne:** zero deformacji geometrii, skala wzoru realistyczna.

### 7.11. TIME OF DAY / SEASON / EFFECT / STYLE (`pora_dnia` / `pora_roku` / `efekt` / `styl`)
**Logika:** globalne przekształcenia sceny bez zmiany geometrii i układu obiektów. `pora_dnia` = kąt słońca + sztuczne światła nocą; `pora_roku` = roślinność/pokrywa gruntu; `efekt` = cienie/odbicia/poświata/cząsteczki; `styl` = technika artystyczna od krawędzi do krawędzi.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → **[reguły trybu]** → `{APPEARANCE(nowe światło/paleta)}` → `{FIDELITY(rozdzielczość, kadr, geometria)}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(architektura, układ, kadr)}`
**Uwaga:** tu `{SCALE}` i `{POSITION}` są nieaktywne (nic nie wstawiamy/przenosimy). Dla `styl`/`tlo`/`pora_*` `{APPEARANCE}` NIE narzuca medium płótna, bo to właśnie ono się zmienia.

### 7.12. FIX — popraw (`popraw`)
**Logika:** chirurgiczna mikro-zmiana wyłącznie w zaznaczonym miejscu, najmniejszą możliwą ingerencją; reszta = materiał referencyjny.
**Moduły:** `{COMMAND}` → `{FRAMING}` → `{IMAGES}` → `{ANCHORS}` → `{POSITION(tylko obszar)}` → `{APPEARANCE(zgodne z otoczeniem)}` → `{FIDELITY}` → `{CLEAN_OUTPUT}` → `{UNCHANGED(cała reszta)}`

---

### 7.13. Mapa nazwa → intencja w kodzie

| Nazwa operacji | `Intencja` w `tryby-edycji.ts` | Status |
|---|---|---|
| Object swap | `zamien` | jest |
| Object transfer | `przenies` (obiekt) | jest |
| Character transfer | `przenies` (osoba) | jest (wspólny tryb) |
| Face swap | `postac` | jest |
| **Character swap (pełna postać)** | — | **DO DODANIA** (dziś `postac` robi tylko twarz) |
| Insert object | `wstaw` | jest |
| Clothing swap | `ubranie` | jest |
| Remove | `usun` | jest |
| Background swap | `tlo` | jest |
| Texture | `tekstura` | jest |
| Time / Season / Effect / Style | `pora_dnia` / `pora_roku` / `efekt` / `styl` | jest |
| Fix | `popraw` | jest |

> **Luka do wdrożenia:** „Character swap" (pełna wymiana postaci) nie ma jeszcze osobnego trybu — dziś `postac` wymienia tylko twarz/tożsamość. Do dodania jako nowy `Intencja` (np. `postac_pelna`) z modułami z pkt 7.3.

---

## 8. WIZJA DOCELOWA — RUSZTOWANIE UNIWERSALNE (ZERO TREŚCI POD JEDEN TYP)

### 8.0. Zasada naczelna: podział pracy
- **Rusztowanie (kod, `polecenia.ts`/`tryby-edycji.ts`) mówi TYLKO uniwersalnie.** Nigdy nie nazywa typu obiektu ani domeny: żadnych „car", „garage door", „driveway", „Ford GT40", „showroom banners". Operuje pojęciami ogólnymi: *the object, its supporting surface, the nearest visible anchor of known size, the scene's lines, the canvas medium.*
- **Specyfika przypadku pochodzi od REŻYSERA** (Gemini Vision, widzi zdjęcia) — to on, patrząc na konkretne auto/roślinę/mebel, pisze w `OPERATION` i `SCENE DETAILS` konkret: „ustaw auto wzdłuż drogi, przodem do kamery; lakier odbija niebo i drzewa". Kod tego nie zna z góry.
- **Dlaczego:** dziś dla „poduszki na żabę" prompt zawierał kilkanaście akapitów o garażach i jezdniach — czysty szum, który mylił model. Uniwersalne rusztowanie + konkret od reżysera = ten sam prompt działa dla poduszki, żaby, auta, człowieka, drzewa.

### 8.1. Reguła zamiany treści szczególnej na uniwersalną

| BYŁO (pod jeden typ) | MA BYĆ (uniwersalnie) |
|---|---|
| „smaller than the garage door (2.1 m), fits one driveway lane" | „smaller than the nearest visible anchor of known size; occupies only its true footprint" |
| „VEHICLES ON ROADS must align along the road axis" | „an object resting on a path/surface follows that surface's natural lines and flow" |
| „reflect sky/trees, NOT showroom banners" | „reflective surfaces reflect the CANVAS environment, never the donor's surroundings" |
| „Ford GT40 is 102 cm, roofline halfway up garage door" | (usunięte z kodu — takie liczby podaje reżyser z analizy pineski dla konkretnego obiektu) |
| „bare asphalt: lane 3 m, kerb 15 cm" | „when no anchor of known size is near, place at a plausible everyday distance and err SMALLER" |

### 8.2. Uniwersalne teksty modułów (wizja)

**② POSITION — ON ITS SURFACE, ALIGNED TO THE SCENE**
- It rests on the surface beneath its pin (ground, floor, table, shelf, water, bedding) with stable, natural contact and a soft contact shadow.
- It aligns to the natural lines and flow of that surface and the scene — an object on a path follows the path, an object on a shelf sits square to it. Never floating, tilted, or crossing other objects unnaturally.
- Depth order: nearer things overlap it; it overlaps farther things; the foreground stays sharp and seals it out.
- It keeps clear spacing from its neighbours — beside them, never clipping into them.

**③ SCALE — REAL SIZE FROM THE SCENE'S OWN ANCHORS**
- The object appears at its true real-world size, taken from the pin analysis as ground truth.
- Judge that size against whatever reference is ACTUALLY visible near the spot — any object of familiar size (a hand, a person, a doorway, a plate, a chair, a tile, a bottle, a vehicle lane). Compare explicitly with a number: "the object is about X; the nearby [visible anchor] is about Y; so it reaches about Z of it."
- The marked area is a boundary, NOT a quota — never enlarge or stretch the object to fill it.
- If nothing of known size is near, place it at a plausible everyday distance and err on the SMALLER side, set deeper into the scene, rather than large.
- Keep perspective: the object's edges converge to the same vanishing points as the surrounding surfaces.

**① OBJECT IDENTITY** — universal: keep the object's own identity/shape/proportions/surface state; do NOT carry over the donor's framing, camera angle, 3D rotation, reflections, background or lighting — it is redrawn from the canvas camera angle and in the canvas light.

**STEPS (zamien) — universal core** (zero słownictwa domenowego):
1. Remove the old element completely with its shadow and reflection; rebuild what was behind it.
2. If a person/animal is in contact with the old element, keep them 100%; give the NEW element its own equivalent contacting part — never graft the old element's part.
3. Preserve the incoming object's surface condition (dust, wear, patina) unless the task asks to clean it.
4. Respect depth planes: a background object inherits that plane's blur/bokeh; the foreground stays sharp.
5. Stand the new element on the same spot at ITS OWN real size, turned to the canvas camera angle.
6. Reflective/glossy surfaces reflect the CANVAS environment, never the donor's surroundings.
7. Keep spacing to neighbours; show the object complete — set it deeper rather than shrink it below real size.

**④ APPEARANCE / ⑤ FIDELITY / CLEAN OUTPUT / UNCHANGED** — już uniwersalne (medium sceny, ziarno, blokada rozdzielczości/perspektywy/światła, jedno bezszwowe zdjęcie).

### 8.3. Gdzie ląduje konkret (przykłady od reżysera, nie z kodu)
- Auto: reżyser pisze w `OPERATION` — „align the car along the road, front toward the camera; its paint reflects the sky and trees, not the donor's indoor lights; a mid-size car ~1.8 m wide, about a third of the visible road width here."
- Roślina: „the potted plant stands on the windowsill; ~30 cm tall, about half the window's height; its leaves catch the same cool window light."
- Poduszka→żaba: „the ~12 cm frog figurine sits where the pillow was on the duvet, about a quarter of the pillow's width, in the room's soft blue light."

Kod dostarcza uniwersalne ramy, reżyser — te zdania. **Nic w kodzie nie jest skierowane pod jeden typ.**

### 8.4. Konsekwencja dla wdrożenia
- Z `tryby-edycji.ts` (`MATERIAL_OBIEKTU`, `zamien.reguly`, `wstaw.reguly` itd.) i z `sekcjaSkali()` w `polecenia.ts` **usuwamy całe słownictwo o pojazdach/garażach/jezdniach** i zastępujemy wersją uniwersalną (8.2).
- Reżyser (`SYSTEM_REZYSERA`) dostaje jawny nakaz: to TY podajesz specyfikę typu obiektu (orientacja, odbicia, konkretne liczby skali) — rusztowanie jej nie zna.
- Efekt: jeden zestaw modułów obsługuje każdy przypadek; prompt jest krótki i celny zamiast zapchany treścią o autach.

