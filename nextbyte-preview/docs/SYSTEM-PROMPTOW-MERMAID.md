# System promptowania Canvasa — wszystkie warstwy w jednym diagramie

Wklej blok poniżej do https://mermaid.live albo otwórz ten plik na GitHubie (renderuje się sam). Diagram jest szeroki: każda **warstwa** to jeden poziomy pas, idziesz z góry na dół.

```mermaid
flowchart TB
  subgraph L1["WARSTWA 1 · WEJŚCIE (użytkownik)"]
    direction LR
    I1["zdanie<br/>np. ‘wstaw tu jacuzzi’"]
    I2["pinezki + ich nazwy<br/>(Ctrl+klik)"]
    I3["zdjęcia na płótnie<br/>scena + referencje"]
    I4["model: lite · nb2 · pro"]
    I1 ~~~ I2 ~~~ I3 ~~~ I4
  end

  subgraph L2["WARSTWA 2 · KOD — deterministycznie, bez AI"]
    direction LR
    K1["ROLE pinesek<br/>kto jest źródłem / celem / dawcą<br/>jawne → gramatyka → semantyka → pytanie"]
    K2["INTENCJA ze słów<br/>wstaw · przenieś · zamień · postać · usuń"]
    K3["OPERACJA<br/>addition · object_transfer · object_swap<br/>character_swap · face_swap · removal<br/>‘wstaw’ na 1 zdjęciu → ‘przesuń’"]
    K1 --> K2 --> K3
  end

  subgraph L3["WARSTWA 3 · REŻYSER = Gemini 2.5 Flash (temp. 0) — jedyny tekst pisany przez AI"]
    direction LR
    G0["dostaje: zdjęcia z pinezkami<br/>+ ZBLIŻENIE wokół każdej pinezki<br/>+ zdanie i listę pinesek"]
    G1["zwraca JSON<br/>opis obiektów pod pinezkami"]
    G2["SKALA<br/>kotwice znanych rozmiarów<br/>+ horyzont + prawdziwe wymiary"]
    G3["widok · ułożenie · światło<br/>kamery sceny"]
    G4["DYREKTYWA<br/>co · gdzie · co usunąć<br/>jak stoi · rozmiar (1 porównanie)"]
    G0 --> G1 ~~~ G2 ~~~ G3 ~~~ G4
  end

  subgraph L4["WARSTWA 4 · ROUTER i TRASY — składanie promptu (skladaj.ts)"]
    RT{"ROUTER<br/>studio zawsze włączone<br/>→ 3 trasy"}
    subgraph TA["TRASA A · zamiana postaci"]
      A1["baza z PDF poz.20/21<br/>REPLACE the person…"]
      A2["IMAGE ROLES<br/>scena = ROZMYTY SZKIC<br/>+ zbliżenie twarzy dawcy"]
      A3["Additional instruction<br/>(poz.22)"]
      A4["NAMED CHARACTER<br/>+ IDENTITY MAP"]
      A5["CAŁE ZDJĘCIE OD ZERA<br/>+ FINAL CHECK"]
      A1 --> A2 --> A3 --> A4 --> A5
    end
    subgraph TB2["TRASA B · przesunięcie w kadrze"]
      B1["MOVE one object<br/>do not copy<br/>miejsce A → B"]
      B2["zdanie<br/>‘przesuń…’"]
      B3["usuń stare · miejsce<br/>jedno zdjęcie · SCALE<br/>(bez analizy reżysera)"]
      B1 --> B2 --> B3
    end
    subgraph TC["TRASA C · wstawianie z drugiego zdjęcia"]
      C1["DYREKTYWA Gemini<br/>(zastępuje współrzędne)"]
      C2["SCALE → CAŁE ZDJĘCIE<br/>→ KOMPLETNY OBIEKT<br/>→ MECHANIKA"]
      C3["ONE photograph · FINAL CHECK<br/>MATCH FILM"]
      C4["REFERENCE ROLES<br/>(PDF poz.7)"]
      C1 --> C2 --> C3 --> C4
    end
    BR[("BRICKI<br/>PDF Studia: ONE photograph · ROLES<br/>baza swapu · NAMED CHARACTER<br/>własne: CAŁE ZDJĘCIE · KOMPLETNY OBIEKT<br/>MECHANIKA · SCALE · MATCH FILM")]
    RT -->|"character_swap, 2 zdjęcia"| A1
    RT -->|"obiekt i miejsce na 1 zdjęciu"| B1
    RT -->|"wszystko inne"| C1
    BR -.-> A4
    BR -.-> B3
    BR -.-> C2
  end

  subgraph L5["WARSTWA 5 · MODEL OBRAZU (Runware)"]
    direction LR
    M1["prompt z trasy<br/>+ system (kompozytor VFX)<br/>+ temperatura 0.3–0.72"]
    M2["obrazy: scena<br/>(rozmyta w trasie A) + referencje<br/>+ zbliżenie twarzy"]
    M3["lite · nb2 · pro<br/>jedna generacja"]
    M1 --> M3
    M2 --> M3
  end

  subgraph L6["WARSTWA 6 · PO GENERACJI"]
    direction LR
    P1["dopasowanie formatu<br/>do Image 1"]
    P2["POMIAR wyniku<br/>rozmiar i miejsce<br/>vs cel z kotwic"]
    P3["KONTROLER (Gemini)<br/>czy wykonano zadanie"]
    P4["KARTA WYNIKU<br/>pomiar wygrywa z opisem"]
    P1 --> P2 --> P3 --> P4
  end

  subgraph L7["PRZEŁĄCZNIKI (flagi, stan domyślny)"]
    direction LR
    F1["DYREKTYWA_OD_REZYSERA = ON"]
    F2["SZKIC_SCENY_SWAP = ON"]
    F3["UMIEJSCOWIENIE_RELACYJNE = off"]
    F4["TRANSFER_Z_RAMKA = off"]
    F5["DRUGI_PRZEBIEG = off"]
    F1 ~~~ F2 ~~~ F3 ~~~ F4 ~~~ F5
  end

  L1 --> L2
  L2 --> L3
  L3 --> RT
  L2 -.->|"operacja"| RT
  L3 -.->|"dyrektywa"| C1
  L3 -.->|"opis osób"| A2
  TA --> L5
  TB2 --> L5
  TC --> L5
  L5 --> L6
  L6 ~~~ L7

  classDef wejscie fill:#334155,stroke:#94a3b8,color:#f1f5f9
  classDef kod fill:#1f2937,stroke:#94a3b8,color:#e5e7eb
  classDef gem fill:#3b2f6b,stroke:#a78bfa,color:#f5f3ff
  classDef trasa fill:#0f3b3a,stroke:#2dd4bf,color:#ecfeff
  classDef model fill:#4a2c0a,stroke:#fb923c,color:#fff7ed
  classDef post fill:#3f3a1a,stroke:#facc15,color:#fefce8
  classDef flaga fill:#1e293b,stroke:#64748b,color:#cbd5e1
  class I1,I2,I3,I4 wejscie
  class K1,K2,K3,RT kod
  class G0,G1,G2,G3,G4 gem
  class A1,A2,A3,A4,A5,B1,B2,B3,C1,C2,C3,C4 trasa
  class M1,M2,M3 model
  class P1,P2,P3,P4 post
  class F1,F2,F3,F4,F5 flaga
```

**Kolory warstw:** szary = wejście i kod bez AI · fiolet = Gemini (jedyny tekst od AI) · turkus = trasy składania promptu · pomarańcz = model obrazu · żółty = kontrola po generacji.
**Linia przerywana:** dane doklejane z boku (operacja i dyrektywa z reżysera trafiają do konkretnej trasy; bricki do konkretnego bloku).
