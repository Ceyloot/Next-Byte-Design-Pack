/**
 * Ultra-Simplified AI Canvas Protocols (v3.0 - RED DOT PROTOCOL)
 * Strictly enforces scenery preservation and surgical object transfer.
 */
import { MASTER_PROMPT_ENGINEER } from '@/lib/master-prompts';

export const CANVAS_TEMPLATES = {

    // A. OBJECT TRANSFER (SURGICAL)
    OBJECT_TRANSFER: (sourceDesc: string, targetDesc: string) => `
[DIRECTOR'S PROTOCOL - OBJECT TRANSFER]
1. SITUATIONAL ANALYSIS: Oceń różnicę skali między "${sourceDesc}" a "${targetDesc}". Jeśli obiekt źródłowy jest mniejszy niż docelowy, musisz KATEGORYCZNIE usunąć całą objętość "${targetDesc}" i odbudować tło (inpainting) w pustym miejscu.
2. ZADANIE: Przenieś obiekt "${sourceDesc}" z lokalizacji na zdjęciu 1 oznaczonego magentową kropką #FF00FF, do lokalizacji oznaczonej magentową kropką #FF00FF na zdjęciu 2. 
3. INTEGRACJA DŁONI: Jeśli dłoń trzymała stary obiekt, przerysuj ją tak, aby naturalnie zaciskała się na nowym obiekcie "${sourceDesc}".
4. SCENERIA: Zachowaj 100% oryginalnego tła ze zdjęcia 2.
5. ORIENTACJA: Nowy obiekt "${sourceDesc}" musi przyjąć DOKŁADNIE taką samą pozę, kąt obrotu, orientację przestrzenną i perspektywę 3D jak obiekt, który zastępuje na zdjęciu 2.
6. SKALA: Skala musi być logiczna i realnie dopasowana do świata scenerii.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // B. CHARACTER_TRANSFER
    CHARACTER_TRANSFER: (features: string[], pose: string = "naturalna") => `
[DIRECTOR'S PROTOCOL - CHARACTER IDENTITY & OUTFIT TRANSFER]
1. ŹRÓDŁO WYGLĄDU (Zdjęcie 1): Przejmij STĄD: Twarz, Włosy i DOKŁADNY UBIÓR (kolory, fason, detale).
2. ŹRÓDŁO POZY I SCENERII (Zdjęcie 2): To jest Twoja ABSOLUTNA BAZA. Przejmij STĄD: Scenerię, Oświetlenie oraz DOKŁADNĄ POZĘ I GESTY osoby.
3. ZADANIE: Umieść postać ze zdjęcia 1 w DOKŁADNEJ pozie i lokalizacji osoby ze zdjęcia 2.
4. ZASADA POZY: Nowa postać MUSI siedzieć, stać lub leżeć identycznie jak osoba na zdjęciu 2. ZAKAZ używania pozy ze zdjęcia 1.
5. ZASADA UBIORU: Całkowicie zignoruj i usuń ubrania widoczne na zdjęciu 2. Zastąp je ubiorem ze zdjęcia 1.
6. INTEGRACJA: 100% zachowania tła ze zdjęcia 2. Dopasuj światło i ziarno do scenerii docelowej.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // C. ADDITION
    ADDITION: (object: string) => `
[DIRECTOR'S PROTOCOL - ADDITION]
1. ZADANIE: Wygeneruj wysokiej jakości "${object}" w lokalizacji oznaczonej MAGENTOWĄ KROPKĄ (#FF00FF).
2. LOGICZNA SKALA: Obiekt musi być realistycznie proporcjonalny do otoczenia.
3. STYL: Przejmij wszystkie tekstury i oświetlenie z otoczenia.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // D. REPLACE / SWAP (Identity Swap)
    REPLACE: (oldObject: string, newObject: string, features: string[]) => `
[DIRECTOR'S PROTOCOL - REPLACEMENT]
1. CEL: Zidentyfikuj "${oldObject}" oznaczony MAGENTOWĄ KROPKĄ (#FF00FF) na zdjęciu 2.
2. USUNIĘCIE: Całkowicie USUŃ "${oldObject}". Każdy piksel starego obiektu MUSI zniknąć.
3. INIEKCJA: Zastąp go przez "${newObject}" (cechy: ${features.join(', ')}) z lokalizacji oznaczonej MAGENTOWĄ KROPKĄ (#FF00FF) na zdjęciu 1.
4. LOGICZNA SKALA I POZA: Nowy obiekt musi przejąć DOKŁADNĄ orientację 3D, pozę, kąt obrotu i realistyczną skalę świata scenerii, identyczną jak "${oldObject}".
5. WTAPIANIE: Bezproblemowo zintegruj nowy obiekt z istniejącym oświetleniem i głębią.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // E. REMOVE (Surgical Eraser)
    REMOVE: (object: string = "obiekt") => `
[DIRECTOR'S PROTOCOL - TOTALITARIAN REMOVAL]
1. ZADANIE: Całkowicie USUŃ ${object} znajdujący się pod MAGENTOWĄ MASKĄ (#FF00FF).
2. DESTRUKCJA: Każdy piksel wskazanego elementu musi zniknąć.
3. REKONSTRUKCJA: Wypełnij puste miejsce pasującymi teksturami tła, zachowując 100% spójności ze scenerią.
4. INTEGRACJA: Dopasuj oświetlenie, cienie i ziarno obrazu tak, aby po obiekcie nie został żaden ślad.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // F. GENERAL EDIT
    GENERAL_EDIT: (modification: string) => `
[DIRECTOR'S PROTOCOL - LOCAL EDIT]
1. ZADANIE: Zastosuj "${modification}" konkretnie w lokalizacji MAGENTOWEJ KROPKI (#FF00FF).
2. LOGICZNA SKALA: Upewnij się, że wszelkie dodane elementy pasują do realistycznej skali świata.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // G. HIGH-FIDELITY OBJECT SWAP (TOTALITARIAN DETAIL)
    OBJECT_SWAP: (sourceDesc: string, targetDesc: string, objectName: string) => `
[DIRECTOR'S PROTOCOL - OBJECT SWAP]
1. SITUATIONAL ANALYSIS: Przeanalizuj rozmiar "${sourceDesc}" i "${targetDesc}". Jeśli nowy obiekt jest mniejszy, stary obiekt "${targetDesc}" musi zostać CAŁKOWICIE USUNIĘTY, a tło pod nim odbudowane (inpainting). ZAKAZ kładzenia jednego na drugim.
2. OPERACJA: Przenieś "${sourceDesc}" z foto 1 na pozycję "${targetDesc}" na foto 2.
3. INTEGRACJA DŁONI: Jeśli obiekt jest trzymany, dłoń musi zostać przerysowana tak, aby stabilnie i realistycznie trzymała nowy przedmiot "${sourceDesc}".
4. ORIENTACJA I POZA: Nowy obiekt "${sourceDesc}" musi przyjąć DOKŁADNIE taką samą pozę, kąt obrotu, orientację przestrzenną i perspektywę 3D jak oryginalny przedmiot "${targetDesc}".
5. SKALA: Zachowaj realistyczną skalę świata scenerii. 
6. INTEGRACJA: Dopasuj światło, ostrość i grading scenerii.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // H. CHARACTER SWAP (POSE RETENTION + IDENTITY TRANSFER)
    CHARACTER_SWAP: (features: string[]) => `
[DIRECTOR'S PROTOCOL - CHARACTER SWAP]
1. ŹRÓDŁO WYGLĄDU (Zdjęcie 1): Przejmij twarz, włosy i DOKŁADNY OUTFIT.
2. ŹRÓDŁO POZY I SCENERII (Zdjęcie 2): To jest Twoja baza. Przejmij DOKŁADNĄ POZĘ I GESTY oraz całe tło.
3. ZADANIE: Zastąp osobę na zdjęciu 2 osobą ze zdjęcia 1, zachowując POZĘ ze zdjęcia 2.
4. ZASADY TOTALITARNE: ZAKAZ używania ubrań ze zdjęcia 2. Nowa postać musi mieć ubrania ze zdjęcia 1, ale w ułożeniu (pozie) ze zdjęcia 2.
5. JAKOŚĆ: Perfekcyjna integracja oświetlenia i 100% zachowania scenerii zdjęcia 2.

${MASTER_PROMPT_ENGINEER}
    `.trim(),

    // I. POINT EDIT (Single Pin - Surgical)
    POINT_EDIT: (objectName: string, modification: string) => `
[DIRECTOR'S PROTOCOL - POINT EDIT]
1. OBIEKT: Zidentyfikuj obiekt "${objectName}" w lokalizacji oznaczonej magentową kropką (#FF00FF).
2. ZADANIE: Zamień ten konkretny obiekt na: "${modification}".
3. SKALA I POZA: Nowy element musi zachować logiczną skalę świata i DOKŁADNĄ orientację/pozę/kąt obrotu/perspektywę obiektu, który zastępuje.
4. INTEGRACJA: Dopasuj oświetlenie, cienie, ostrość i teksturę do reszty zdjęcia scenerii.

${MASTER_PROMPT_ENGINEER}
    `.trim(),
};
