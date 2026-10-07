# System promptowania Canvasa — jeden diagram

```mermaid
flowchart TD
  IN["WEJŚCIE<br/>zdanie · pinezki · zdjęcia · wybór modelu"]

  subgraph KOD1["① KOD — bez AI"]
    ROLE["Role pinesek<br/>role-z-polecenia.ts<br/>jawne → gramatyka → semantyka → pytanie"]
    INT["Intencja ze słów<br/>wykryjIntencje"]
  end

  subgraph GEM["② REŻYSER = Gemini 2.5 Flash, temp. 0"]
    ZB["dostaje: zdjęcia z pinezkami<br/>+ ZBLIŻENIE wokół każdej pinezki"]
    JSON["zwraca JSON<br/>intencja · osoba · opis obiektów<br/>skala: kotwice + horyzont + wymiary<br/>widok · ułożenie · światło<br/>DYREKTYWA (brief dla modelu)"]
    ZB --> JSON
  end

  OP["③ OPERACJA<br/>addition · object_transfer · object_swap<br/>character_swap · face_swap · removal…<br/>wstaw + 1 zdjęcie → przesuń"]

  ROUTER{"④ ROUTER skladaj.ts<br/>studio zawsze włączone"}

  subgraph TA["TRASA A — zamiana postaci"]
    A1["baza z PDF poz.20/21"] --> A2["IMAGE ROLES<br/>+ scena = ROZMYTY SZKIC<br/>+ zbliżenie twarzy dawcy"]
    A2 --> A3["Additional instruction<br/>poz.22"] --> A4["NAMED CHARACTER<br/>+ IDENTITY MAP"]
    A4 --> A5["CAŁE ZDJĘCIE OD ZERA<br/>+ FINAL CHECK"]
  end

  subgraph TB["TRASA B — przesunięcie w kadrze"]
    B1["MOVE one object — do not copy<br/>miejsce A → B"] --> B2["zdanie ‘przesuń’"]
    B2 --> B3["usuń stare · miejsce<br/>jedno zdjęcie · SCALE"]
  end

  subgraph TC["TRASA C — wstawianie z drugiego zdjęcia"]
    C1["DYREKTYWA Gemini<br/>co · gdzie · co usunąć · jak · rozmiar"] --> C2["SCALE → CAŁE ZDJĘCIE<br/>→ KOMPLETNY OBIEKT → MECHANIKA"]
    C2 --> C3["ONE photograph · FINAL CHECK<br/>MATCH FILM · REFERENCE ROLES"]
  end

  MODEL["⑤ MODEL OBRAZU Runware<br/>lite · nb2 · pro · system + temperatura<br/>obrazy: scena + referencje"]

  subgraph POST["⑥ PO GENERACJI"]
    FMT["dopasowanie formatu"] --> POM["POMIAR rozmiaru i miejsca<br/>vs cel z kotwic"]
    POM --> KON["Kontroler Gemini"]
    KON --> OUT["KARTA WYNIKU<br/>pomiar wygrywa z opisem"]
  end

  BRICKI[("BRICKI<br/>z PDF Studia: ONE photograph, ROLES, swap, NAMED CHARACTER<br/>własne: CAŁE ZDJĘCIE, KOMPLETNY OBIEKT, MECHANIKA, SCALE")]

  IN --> ROLE --> INT --> ZB
  JSON --> OP
  INT -.-> OP
  OP --> ROUTER
  ROUTER -->|"character_swap<br/>2 zdjęcia"| A1
  ROUTER -->|"obiekt i miejsce<br/>na tym samym zdjęciu"| B1
  ROUTER -->|"wszystko inne"| C1
  BRICKI -.-> A4
  BRICKI -.-> B3
  BRICKI -.-> C2
  JSON -.->|"opis osób"| A2
  JSON -.->|"dyrektywa"| C1
  A5 --> MODEL
  B3 --> MODEL
  C3 --> MODEL
  MODEL --> FMT

  classDef kod fill:#1f2937,stroke:#94a3b8,color:#e5e7eb
  classDef gem fill:#3b2f6b,stroke:#a78bfa,color:#f5f3ff
  classDef trasa fill:#0f3b3a,stroke:#2dd4bf,color:#ecfeff
  classDef model fill:#4a2c0a,stroke:#fb923c,color:#fff7ed
  class ROLE,INT,OP,ROUTER kod
  class ZB,JSON gem
  class A1,A2,A3,A4,A5,B1,B2,B3,C1,C2,C3 trasa
  class MODEL model
```

**Jak czytać:** idź z góry na dół. Fioletowy blok to jedyne miejsce, gdzie pisze Gemini. Niebieskozielone trasy A/B/C to składanie promptu, a pomarańczowy to model obrazu. Linia przerywana to dane, które są dołączane z boku. Trasa wybierana jest tylko w routerze.
