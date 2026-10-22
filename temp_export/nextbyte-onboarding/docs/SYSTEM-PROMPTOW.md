# System promptowania Canvasa — mapa na jednej stronie

Stan na 07.10.2026. Wszystkie diagramy to Mermaid (GitHub renderuje je sam; lokalnie: VS Code „Markdown Preview Mermaid”).

## 0. Najważniejszy wniosek

W aplikacji `studio` jest zawsze włączone, więc **prompt idzie jedną z trzech tras** (reszta kodu — krótkie prompty „dodaj / twarz / ubranie…”, zamrożone tryby scenerii itd. — jest w trybie Studio martwa):

| Trasa | Kiedy | Model | System / temp. |
|---|---|---|---|
| **A. Zamiana postaci z PDF** | `character_swap`, 2 zdjęcia | Pro / wybrany | VFX-kompozytor, 0.3 (szkic sceny) |
| **B. Przesunięcie w kadrze** | obiekt i miejsce na tym samym zdjęciu | wybrany | bez systemu, 0.72 |
| **C. Studio ogólne** (+ dyrektywa) | wszystko inne, w tym wstawianie / zamiana obiektu z drugiego zdjęcia | wybrany | kompozytor, 0.35 (transfer) albo 0.72 |

## 1. Cały przepływ (od kliknięcia „Wyślij” do karty wyniku)

```mermaid
flowchart TD
  U["Użytkownik: zdanie + pinezki + zdjęcia"] --> R1
  subgraph DET["① Deterministycznie (kod, bez AI)"]
    R1["role-z-polecenia.ts<br/>kto jest źródłem / celem / dawcą<br/>4 poziomy: jawne → gramatyka → semantyka → pytanie do użytkownika"]
    R2["polecenia.ts → wykryjIntencje<br/>wstaw / przenieś / zamień / postać / usuń…"]
    R1 --> R2
  end
  R2 --> D
  subgraph AI["② Reżyser = Gemini 2.5 Flash (rezyser.ts, temp. 0)"]
    D["dostaje: zdjęcia z pinezkami<br/>+ ZBLIŻENIA wokół każdej pinezki<br/>+ listę pinesek i zdanie"]
    D --> DJ["zwraca JSON:<br/>intencja · osoba · obiekty/opis · skala+kotwice+horyzont<br/>widok · ułożenie · światło · dyrektywa · umiejscowienie"]
  end
  DJ --> O["③ Wybór operacji<br/>operacjaZIntencji: addition / object_transfer / object_swap<br/>character_swap / face_swap / removal …<br/>(+ przepisanie „wstaw” → „przesuń” w jednym zdjęciu)"]
  O --> RT{"④ ROUTER w skladaj.ts<br/>(patrz sekcja 2)"}
  RT --> A["Trasa A<br/>zamiana postaci z PDF"]
  RT --> B["Trasa B<br/>przesunięcie w kadrze"]
  RT --> C["Trasa C<br/>Studio ogólne / dyrektywa"]
  A --> M
  B --> M
  C --> M
  M["⑤ Model obrazu (Runware)<br/>lite · nb2 · pro + system + temperatura<br/>obrazy: scena, referencje (+ zbliżenie twarzy)"]
  M --> P
  subgraph POST["⑥ Po generacji"]
    P["dopasowanie formatu do Image 1"] --> PM["POMIAR: rozmiar i miejsce wyniku<br/>vs cel z kotwic reżysera"]
    PM --> V["Kontroler (Gemini): czy wykonano zadanie?"]
    V --> K["Karta wyniku: ‘Zadanie wykonane’ / ‘Do poprawy’<br/>pomiar wygrywa z opisem kontrolera"]
  end
```

## 2. Router — którą trasą idzie prompt (`skladaj.ts`)

```mermaid
flowchart TD
  S{"op = character_swap<br/>i 2 zdjęcia i studio?"} -->|tak| A["TRASA A<br/>zamiana postaci z PDF"]
  S -->|nie| Q{"obiekt i miejsce<br/>na tym samym zdjęciu<br/>i op = object_transfer?"}
  Q -->|tak| B["TRASA B<br/>MOVE — do not copy"]
  Q -->|nie| Y{"obiekt z innego zdjęcia<br/>(addition / transfer / swap)<br/>i reżyser dał dyrektywę?"}
  Y -->|tak| C1["TRASA C1<br/>dyrektywa Gemini + bricki"]
  Y -->|nie| C2["TRASA C2<br/>Studio ogólne: polecenie + pozycje<br/>+ rozmiar/ułożenie/światło + bricki"]
```

## 3. Co dokładnie składa się w każdej trasie (kolejność bloków = kolejność w prompcie)

```mermaid
flowchart LR
  subgraph TA["TRASA A — zamiana postaci"]
    A1["① baza z PDF poz.20/21<br/>(REPLACE the person… take ONLY identity)"] --> A2["② IMAGE ROLES<br/>scena vs referencja + opis osób od reżysera<br/>+ ‘scena to ROZMYTY SZKIC’"]
    A2 --> A3["③ Additional instruction<br/>(zdanie użytkownika, poz.22)"]
    A3 --> A4["④ NAMED CHARACTER + IDENTITY MAP<br/>(PDF poz.6 + brick Człowiek)"]
    A4 --> A5["⑤ GENERATE WHOLE IMAGE FROM SCRATCH<br/>cały człowiek od zera, strój z referencji"]
    A5 --> A6["⑥ FINAL CHECK poz.20 + ‘swap is mandatory’"]
  end
  subgraph TB["TRASA B — przesunięcie w kadrze"]
    B1["① MOVE one object — do not copy<br/>miejsce A → miejsce B (słowami + x/y)"] --> B2["② [USER] zdanie (‘wstaw’ → ‘przesuń’)"]
    B2 --> B3["③ [RULES]: usuń stare · miejsce · jedno zdjęcie · SCALE<br/>(bez analizy reżysera)"]
  end
  subgraph TC["TRASA C1 — wstawianie z drugiego zdjęcia"]
    C1["① DYREKTYWA Gemini<br/>co · gdzie względem landmarków · co usunąć<br/>jak stoi · rozmiar (1 porównanie)"] --> C2["② SCALE (ogólny)"]
    C2 --> C3["③ CAŁE ZDJĘCIE OD ZERA"]
    C3 --> C4["④ KOMPLETNY OBIEKT<br/>(fragment → całość)"]
    C4 --> C5["⑤ MECHANIKA<br/>(zawiasy, drzwi)"]
    C5 --> C6["⑥ ONE photograph + FINAL CHECK + MATCH FILM"]
    C6 --> C7["⑦ REFERENCE ROLES (PDF poz.7)"]
  end
```

## 4. Kto co pisze (źródło każdego fragmentu)

```mermaid
flowchart LR
  subgraph KOD["Kod (stałe teksty)"]
    K1["bricki z PDF Studia:<br/>ONE photograph (poz.4)<br/>REFERENCE ROLES (poz.7)<br/>baza swapu (poz.20/21), NAMED CHARACTER (poz.6)"]
    K2["własne bricki:<br/>CAŁE ZDJĘCIE · KOMPLETNY OBIEKT<br/>MECHANIKA · SCALE · MATCH FILM"]
  end
  subgraph GEM["Gemini-reżyser (zmienny tekst)"]
    G1["dyrektywa / umiejscowienie"]
    G2["skala: kotwice + horyzont + wymiary obiektu"]
    G3["światło · widok · ułożenie · opisy obiektów"]
    G4["opis osoby (IMAGE ROLES)"]
  end
  subgraph USR["Użytkownik"]
    U1["zdanie · nazwy pinesek · wybór modelu"]
  end
  KOD --> ASM["skladajPrompt<br/>(składacz)"]
  GEM --> ASM
  USR --> ASM
  ASM --> PR["prompt + system + temperatura"]
```

## 5. Co robi reżyser (ściąga pól)

| Pole | Treść | Gdzie trafia |
|---|---|---|
| `intencja`, `osoba` | operacja; czy chodzi o człowieka | router, `operacjaZIntencji` |
| `obiekty[].opis / miejsce / szczegoly` | identyfikacja tego pod pinezką (na bazie zbliżenia) | karta pinezki, opis w rolach |
| `skala`, `kotwice[]`, `horyzont`, `obiekt` | prawdziwe wymiary + znane rozmiary + linia horyzontu | liczy kod (`skalaWRzedzie`) → % szerokości kadru → pomiar po generacji |
| `widok`, `ulozenie`, `swiatlo` | kamera, powierzchnia, światło sceny | linie w trasie C2 |
| `dyrektywa` | **jedno** zdanie-brief dla modelu obrazu | trasa C1 (zastępuje pozycje, rozmiar, ułożenie) |
| `umiejscowienie` | relacyjne miejsce (eksperyment, wyłączony) | flaga `UMIEJSCOWIENIE_RELACYJNE` |

## 6. Przełączniki (flagi) — stan domyślny

| Flaga | Plik | Wartość | Efekt |
|---|---|---|---|
| `DYREKTYWA_OD_REZYSERA` | `prompty/skladaj.ts` | **true** | trasa C1 zamiast C2 |
| `SZKIC_SCENY_SWAP` | `canvas/szkic-sceny.ts` | **true** | scena w trasie A rozmyta (nie da się skopiować pikseli) |
| `UMIEJSCOWIENIE_RELACYJNE` | `prompty/skladaj.ts` | false | eksperyment relacyjny |
| `TRANSFER_Z_RAMKA` / `_WKLEJKA` | `CanvasSection.tsx` | false / (nieaktywne) | ramka lub wklejka z rozmiarem |
| `DRUGI_PRZEBIEG` | `CanvasSection.tsx` | false | druga generacja (korekta po pomiarze) |
| `GENERUJ_NA_WYCINKU`, `POSTPROCES_ZIARNA`, `KROPKI_NA_ZDJECIACH` | `CanvasSection.tsx` | false | wyłączone |
| `ZBLIZENIA_W_POBLIZU_PINEZKI`, `REFERENCJA_WOKOL_RZECZY`, `SKALA_OD_MODELU` | `CanvasSection.tsx` | true | pomocnicze zbliżenia i pomiar skali |

## 7. Mapa błędów: objaw → przyczyna → gdzie poprawić

| Objaw | Najczęstsza przyczyna | Miejsce |
|---|---|---|
| Obiekt za duży / za mały | pomiar reżysera (kotwice, horyzont, wymiary kategorii) albo model ignoruje liczby | `rezyser.ts` (STEP 4), pomiar po generacji |
| Obiekt w złym miejscu | reżyser źle odczytał pinezkę (mały obiekt obok większego) | zbliżenia pinesek, reguła CROSSHAIR FIRST |
| „Przyklejony” obiekt / twarz | model kopiuje piksele referencji lub sceny | brick CAŁE ZDJĘCIE, szkic sceny (trasa A) |
| Ucięty fragment zamiast całości | referencja to portret / zbliżenie | brick KOMPLETNY OBIEKT + dyrektywa |
| Kopia zamiast przesunięcia | „wstaw” przy obiekcie i miejscu na jednym zdjęciu | przepisanie na „przesuń”, trasa B |
| Zła osoba zamieniana | role z grammatyki zdania | `role-z-polecenia.ts` |
| Błąd „Agent nie zwrócił planu” | ucięty/niepoprawny JSON reżysera | 3 próby, limit 8192 w `agent-proxy.ts` |
| Kontroler pisze „zgodnie z poleceniem” przy złym wyniku | opis z planu zamiast pikseli | pomiar wygrywa w `CanvasSection.tsx` |

## 8. Proponowane rozbicie na moduły (do dalszej przebudowy)

```mermaid
flowchart LR
  subgraph M1["1 · intent/ (deterministyczne)"]
    i1["role.ts"] --- i2["intencja.ts"] --- i3["operacja.ts"]
  end
  subgraph M2["2 · director/ (Gemini)"]
    d1["prompt-rezysera.ts<br/>(1 plik na krok: 0–4f)"] --- d2["parser-planu.ts"] --- d3["pomiar-skali.ts<br/>(kotwice, horyzont)"]
  end
  subgraph M3["3 · bricks/ (teksty)"]
    b1["pdf-studio.ts (1:1 z PDF)"] --- b2["wlasne.ts"] --- b3["zamrozone/"]
  end
  subgraph M4["4 · routes/ (jedna trasa = jeden plik)"]
    r1["swap-postaci.ts"] --- r2["ruch-w-kadrze.ts"] --- r3["transfer-dyrektywa.ts"]
  end
  subgraph M5["5 · post/"]
    p1["format.ts"] --- p2["pomiar-wyniku.ts"] --- p3["kontroler.ts"]
  end
  M1 --> M2 --> M4
  M3 --> M4 --> M5
```

Dziś `skladaj.ts` robi 2–4 naraz (~800 linii z mnóstwem martwych gałęzi). Rozbicie wg diagramu: trasy A/B/C jako osobne funkcje przyjmujące ten sam wejściowy obiekt `W`, bricki w jednym katalogu, usunięcie martwych gałęzi (tryby bez Studio).
