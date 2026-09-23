/**
 * Budowanie poleceń dla modelu — jedno miejsce na całą wiedzę o tym, jak
 * rozmawiać z modelem edycyjnym.
 *
 * Jeden prompt nie obsłuży wszystkiego: „usuń altanę” i „zmień to na
 * akwarelę” to inne zadania i inne pułapki. Usuwanie wymaga rekonstrukcji
 * tła, zamiana — przejęcia skali i cieni poprzednika, styl — zachowania
 * kompozycji. Dlatego jest wspólny szkielet i osobne reguły na tryb.
 */
import { etykietaPineski, opiszPolozenie, type Pineska, type Warstwa } from './typy'

import { TRYBY, type Intencja } from './tryby-edycji'

export { INTENCJE, type Intencja } from './tryby-edycji'

/**
 * Rozpoznanie trybu z samego zdania — bez pytania użytkownika o tryb.
 *
 * Kolejność testów ma znaczenie: „zamień to na akwarelę” jest zmianą stylu,
 * mimo że pada słowo „zamień”, więc styl sprawdzamy pierwszy. Wynik da się
 * nadpisać ręcznie, bo heurystyka na czasownikach zawsze kiedyś się pomyli.
 */
export function wykryjIntencje(tekst: string): Intencja {
  const t = tekst.toLowerCase()

  const styl =
    /\bstyl|w stylu|akwarel|olejn|szkic|rysunek|anime|komiks|pixel|retro|vintage|czarno-?bia|sepia|malarsk|kreskówk/.test(
      t,
    )
  if (styl) return 'styl'

  if (/\busu[ńn]|wyma[żz]|skasuj|pozb[ąa]d[źz]|zniknij|znikn[ąa][ćc]|bez\s+\w+\s*$|wytnij/.test(t)) return 'usun'

  // Przeniesienie sprawdzamy przed podmianą: „przenieś to tutaj, niech
  // będzie w skałach zamiast tam” zawiera „zamiast” i wpadało w tryb
  // Zamień. Skutek był taki, że model zostawiał obiekt w starym miejscu
  // i dorysowywał kopię w nowym.
  if (/\bprzenie[śs]|przesu[ńn]|przestaw|przeni[eo]s|daj\s+(to|go|j[ąa])\s+(tu|tutaj|w)|ma by[ćc] (tu|tutaj)/.test(t))
    return 'przenies'

  // „w miejsce ganku wstaw altanę” to podmiana, mimo że pada „wstaw” —
  // dlatego wyrażenia o zastępowaniu sprawdzamy przed dodawaniem.
  if (/\bzamie[ńn]|podmie[ńn]|zast[ąa]p|zamiast|w miejsc[euau]|na miejsc[euae]|przer[óo]b\s+\w+\s+na/.test(t))
    return 'zamien'

  // „niech się TU POJAWI altana” — między „niech” a czasownikiem potrafi
  // stać kilka słów, więc nie zakładamy, że sąsiadują.
  if (/\bdodaj|wstaw|umie[śs][ćc]|postaw|dorysuj|do[łl][óo][żz]|niech[^.!?]{0,24}\b(pojawi|stanie|b[ęe]dzie|stoi)|pojawi si[ęe]/.test(t))
    return 'wstaw'

  return 'popraw'
}

/* ── Fragmenty wspólne ───────────────────────────────────────────── */

/**
 * Skala — sekcja, która powstała z konkretnej porażki: wstawiona kanapa
 * wyszła wielkości garażu i weszła w inne obiekty.
 *
 * Model nie ma pojęcia, ile metrów ma miejsce na zdjęciu, dopóki mu tego
 * nie każemy ustalić. Dlatego zamiast prosić „dopasuj skalę” (ogólnik, który
 * nic nie znaczy) dajemy procedurę i punkty odniesienia o znanych
 * wymiarach — Google zaleca dokładnie to: konkretne miary zamiast przymiotników.
 *
 * Kolejność kroków jest celowa: najpierw ustalenie skali sceny, potem
 * pomiar miejsca docelowego, a dopiero na końcu rysowanie.
 */
function sekcjaSkali(): string {
  return [
    'SKALA — USTAL JĄ, ZANIM ZACZNIESZ RYSOWAĆ:',
    '1. Znajdź w kadrze obiekt o znanej wielkości i po nim ustal, ile metrów ma scena.',
    '   Punkty odniesienia: dorosły człowiek ~1,75 m · drzwi ~2,0 m · brama garażowa ~2,4 m szerokości ·',
    '   samochód osobowy ~4,5 × 1,8 m · kondygnacja domu ~3 m · kanapa ~2,0 × 0,9 m · krzesło ~0,45 m siedziska ·',
    '   stół ~0,75 m wysokości · ławka ogrodowa ~1,5 m · drzwi garażowe i okna są najpewniejszą miarą na elewacji.',
    '2. Oszacuj w metrach szerokość i głębokość miejsca, w którym ma stanąć obiekt.',
    '3. Dobierz wielkość obiektu do tego miejsca i do jego rzeczywistych wymiarów — nie do wielkości kadru',
    '   ani do tego, jak dużo miejsca zajmował na zdjęciu źródłowym.',
    '4. Sprawdź wynik jednym pytaniem: czy człowiek o wzroście 1,75 m stojący obok tego obiektu byłby',
    '   we właściwej proporcji? Jeśli nie — popraw wielkość obiektu, nie otoczenia.',
    '5. Obiekty bliżej kamery są większe. Utrzymaj tę samą zbieżność linii i tę samą wysokość horyzontu.',
    '6. Obiekt zajmuje własne miejsce i graniczy z sąsiadami — jego bryła nie przenika ścian, roślin,',
    '   nawierzchni ani innych obiektów.',
    '7. Miejsce jest wskazane celownikiem na MAPIE MIEJSC, jeśli została dołączona — trzymaj się go',
    '   dokładnie. Celownik wskazuje punkt, w którym obiekt dotyka podłoża.',
  ].join('\n')
}


/**
 * Znaczniki z mapy potrafią trafić do wyniku.
 *
 * Nie jest to teoria: pierwsza generacja z mapą postawiła ławkę dokładnie
 * tam, gdzie wskazywał celownik, i narysowała na niej ten celownik. Sama
 * uwaga „nie rysuj oznaczeń” w innej sekcji nie wystarczyła, bo tonęła
 * wśród kilkunastu innych zdań.
 *
 * Dlatego znaczniki dostają własną sekcję tuż przed końcem promptu i są
 * opisane przez stan docelowy: co ma być widoczne w tym miejscu zamiast
 * nich. Ten sam chwyt stosuje specyfikacja Lovart dla swojej magenty.
 */
function sekcjaZnacznikow(mapa: string): string {
  if (!mapa) return ''
  return [
    'ZNACZNIKI — ISTNIEJĄ WYŁĄCZNIE NA MAPIE:',
    'Różowe (magenta) celowniki i numery zostały narysowane na mapie już po zrobieniu zdjęcia.',
    'W prawdziwej scenie ich nie ma i w wyniku ich nie ma.',
    'W miejscu każdego celownika widać to, co pod nim leży: podłoże sceny wraz ze zmianą z zadania.',
    'Każdy piksel w kolorze magenta zastępujesz treścią sceny. Wynik to czysta fotografia.',
  ].join('\n')
}

/**
 * Kadr to najczęstsza porażka edycji: model przerysowuje scenę z innej
 * odległości i wynik przestaje pasować do oryginału, choć „zrobił, o co
 * prosiłeś”. Dlatego kadr dostaje własną sekcję zaraz po zadaniu, a nie
 * jedną kreskę wśród zakazów na końcu.
 */
function sekcjaKadru(): string {
  return [
    'KADR — WARUNEK NADRZĘDNY:',
    'Wynik to Zdjęcie 1 ze zmianą z zadania — to samo ujęcie, wykonane z tego samego miejsca.',
    '- Kamera stoi tam, gdzie stała: ta sama odległość, to samo pole widzenia, ten sam kąt.',
    '- Każdy element, którego zadanie nie dotyczy, zostaje w tym samym miejscu i w tej samej wielkości co na Zdjęciu 1.',
    '- Granice kadru pozostają dokładnie tam, gdzie są: widać ten sam wycinek terenu, co na Zdjęciu 1.',
    '- Pracujesz na tym ujęciu jak retuszer na gotowym zdjęciu — scena jest już zbudowana.',
  ].join('\n')
}

/**
 * Zakres władzy każdego zdjęcia.
 *
 * Nie wystarczy powiedzieć, czym zdjęcie jest — trzeba powiedzieć, o czym
 * NIE decyduje. Przy trzech obrazach na wejściu (płótno, materiał, mapa)
 * model sam rozstrzyga, skąd wziąć kadr i światło, i regularnie bierze je
 * z niewłaściwego. Dlatego każdy obraz dostaje trzy pola: co kontroluje,
 * czego nie kontroluje i jaki ma priorytet przy sprzeczności.
 *
 * Wzorzec podebrany z `higgsfield-prompt-template` (REFERENCE AUTHORITY:
 * controls / does_not_control / priority / override).
 */
function sekcjaZdjec(obrazy: Warstwa[], mapa: string): string {
  if (obrazy.length === 0) return ''

  const wpis = (naglowek: string, kontroluje: string, nieKontroluje: string, priorytet: string) =>
    [naglowek, `  decyduje o: ${kontroluje}`, `  nie decyduje o: ${nieKontroluje}`, `  priorytet: ${priorytet}`].join(
      '\n',
    )

  const opisy = obrazy.map((w, i) =>
    i === 0
      ? wpis(
          `Zdjęcie 1 („${w.name}”) — PŁÓTNO`,
          'kadrze, perspektywie, punkcie widzenia, świetle, porze dnia, kolorystyce i całej scenie poza zmianą z zadania',
          'wyglądzie tego jednego fragmentu, którego dotyczy zadanie — tylko tam wolno odstąpić od tego zdjęcia',
          'najwyższy — przy sprzeczności z innymi zdjęciami wygrywa Zdjęcie 1',
        )
      : wpis(
          `Zdjęcie ${i + 1} („${w.name}”) — MATERIAŁ`,
          'bryle, kształcie, materiale, barwie własnej i detalu przenoszonego obiektu',
          'kadrze, tle, otoczeniu, świetle, porze dnia i kolorystyce wyniku',
          'obowiązuje wyłącznie dla wskazanego obiektu, nigdy dla sceny',
        ),
  )

  // Mapa leci jako ostatni obraz, bo jest instrukcją, a nie materiałem.
  if (mapa) {
    opisy.push(
      wpis(
        `Zdjęcie ${obrazy.length + 1} — MAPA MIEJSC (Zdjęcie 1 z różowymi celownikami: ${mapa})`,
        'samym położeniu — celownik wskazuje punkt, w którym obiekt dotyka podłoża',
        'wyglądzie, barwach, treści i jakości — to rysunek pomocniczy, nie materiał',
        'rozstrzyga wszelkie wątpliwości co do miejsca; wynik powstaje na czystym Zdjęciu 1',
      ),
    )
  }

  return `ZDJĘCIA — ZAKRES WŁADZY KAŻDEGO:\n${opisy.join('\n')}`
}

/**
 * Nazwy uchwytów muszą być rozróżnialne.
 *
 * Rozpoznawanie obrazu potrafi nazwać dwie pineski tak samo („ogród”
 * i „ogród”). W poleceniu robi się wtedy dwuznaczność, której model nie ma
 * jak rozstrzygnąć — więc powtórki dostają dopisek ze zdjęciem, na którym
 * leżą. To nie zmienia tego, co użytkownik widzi na chipie.
 */
function rozroznialneNazwy(pineski: Pineska[], obrazy: Warstwa[]): Map<string, string> {
  const wynik = new Map<string, string>()
  const ile = new Map<string, number>()

  for (const [i, p] of pineski.entries()) {
    const bazowa = etykietaPineski(p, i + 1)
    ile.set(bazowa, (ile.get(bazowa) ?? 0) + 1)
  }

  const licznik = new Map<string, number>()
  for (const [i, p] of pineski.entries()) {
    const bazowa = etykietaPineski(p, i + 1)
    if ((ile.get(bazowa) ?? 0) < 2) {
      wynik.set(p.id, bazowa)
      continue
    }

    // Numer zdjęcia zwykle wystarczy do rozróżnienia („ogród ze Zdjęcia 2”).
    // Kolejny numer dokładamy tylko wtedy, gdy powtórki siedzą na tym samym
    // zdjęciu i sam jego numer niczego nie rozstrzyga.
    const numerObrazu = obrazy.findIndex(w => w.id === p.layerId) + 1
    const naTymSamym = pineski.filter(
      x => x.layerId === p.layerId && etykietaPineski(x, pineski.indexOf(x) + 1) === bazowa,
    ).length

    if (naTymSamym < 2) {
      wynik.set(p.id, `${bazowa} ze Zdjęcia ${numerObrazu}`)
      continue
    }

    const kolejny = (licznik.get(bazowa) ?? 0) + 1
    licznik.set(bazowa, kolejny)
    wynik.set(p.id, `${bazowa} ze Zdjęcia ${numerObrazu}, nr ${kolejny}`)
  }
  return wynik
}

function sekcjaUchwytow(pineski: Pineska[], obrazy: Warstwa[]): string {
  if (pineski.length === 0) return ''
  const nazwy = rozroznialneNazwy(pineski, obrazy)

  const wskazane = pineski.filter(p => !p.chroniona)
  const chronione = pineski.filter(p => p.chroniona)
  const czesci: string[] = []

  const opisz = (p: Pineska, i: number) => {
    const numerObrazu = obrazy.findIndex(w => w.id === p.layerId) + 1
    return `${i + 1}. „${nazwy.get(p.id)}” — Zdjęcie ${numerObrazu}, ${opiszPolozenie(p.normalizedX, p.normalizedY)}`
  }

  if (wskazane.length > 0) {
    czesci.push(
      `UCHWYTY (nazwy, którymi posługuje się zadanie):\n${wskazane
        .map((p, i) => opisz(p, pineski.indexOf(p) >= 0 ? pineski.indexOf(p) : i))
        .join('\n')}`,
    )
  }

  if (chronione.length > 0) {
    czesci.push(
      `OBSZARY CHRONIONE — NAJWYŻSZY PRIORYTET:\n${chronione
        .map(p => `- „${nazwy.get(p.id)}” — Zdjęcie ${obrazy.findIndex(w => w.id === p.layerId) + 1}, ${opiszPolozenie(p.normalizedX, p.normalizedY)}`)
        .join('\n')}\n` +
        // Nie żądamy zgodności pikselowej: model przerysowuje cały kadr,
        // więc taka obietnica jest z góry niewykonalna. Prosimy o wygląd
        // nieodróżnialny od oryginału i o omijanie tych miejsc.
        'Te fragmenty mają wyjść z edycji nieodróżnialne od oryginału: ten sam kształt, ' +
        'kolor, ostrość i położenie. Przy sprzeczności z zadaniem wygrywa ochrona — ' +
        'zmniejsz zmianę, przesuń ją albo poprowadź dookoła tych miejsc.',
    )
  }

  czesci.push(
    'Numery i położenia to informacja dla Ciebie. Wynik jest czystą fotografią sceny — ' +
      'samo zdjęcie, bez naniesionych oznaczeń.',
  )

  return czesci.join('\n\n')
}

/** Reguły spójności fotograficznej — wspólne dla każdej operacji na zdjęciu. */
function sekcjaSpojnosci(obrazy: Warstwa[], zeStylem: boolean): string {
  const reguly = [
    'Zachowaj perspektywę, linię horyzontu i punkt widzenia Zdjęcia 1.',
    'Dopasuj kierunek, barwę i twardość światła do Zdjęcia 1; cienie muszą padać tak jak pozostałe w scenie.',
    'Dopasuj ziarno, ostrość i głębię ostrości do Zdjęcia 1, także na krawędziach zmienionego fragmentu.',
  ]
  if (!zeStylem) {
    reguly.push('Wynik ma wyglądać na jedno zdjęcie z jednego aparatu, a nie na fotomontaż.')
  }
  if (obrazy.length > 1) {
    reguly.push(
      'Obiekt ze Zdjęcia 2 przerysuj w świetle i jakości Zdjęcia 1 — ma to być ten obiekt w tamtej scenie, nie wklejony wycinek.',
    )
  }
  return `SPÓJNOŚĆ:\n${reguly.map(r => `- ${r}`).join('\n')}`
}

/* ── Złożenie ────────────────────────────────────────────────────── */

/**
 * Pełne polecenie dla modelu.
 *
 * Układ jest stały niezależnie od trybu: zadanie → kadr → skala → zdjęcia →
 * uchwyty → misja → reguły trybu → spójność → to, co zostaje bez zmian.
 * Model najmocniej trzyma się początku, więc zadanie idzie pierwsze,
 * a dwa warunki, które psuły najwięcej wyników — kadr i skala — zaraz po nim.
 */
export function zbudujPolecenie(
  tekst: string,
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja = wykryjIntencje(tekst),
  /** legenda mapy miejsc, np. „1 = „trawnik”, 2 = „ganek”” — puste, gdy mapy nie ma */
  mapa = '',
): string {
  const zadanie = tekst.trim()
  if (!zadanie) return ''

  const tryb = TRYBY[intencja]
  const zostajeWspolne = [
    'proporcje i kadr Zdjęcia 1',
    'czysta fotografia bez napisów, znaków wodnych, podpisów i ramek',
  ]

  const sekcje = [
    `ZADANIE: ${zadanie}`,
    sekcjaKadru(),
    sekcjaSkali(),
    sekcjaZdjec(obrazy, mapa),
    sekcjaUchwytow(pineski, obrazy),
    `MISJA: ${tryb.misja(zadanie)}`,
    `REGUŁY:\n${tryb.reguly.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    sekcjaSpojnosci(obrazy, intencja === 'styl'),
    sekcjaZnacznikow(mapa),
    `BEZ ZMIAN ZOSTAJE:\n${[...tryb.zostaje, ...zostajeWspolne].map(z => `- ${z}`).join('\n')}`,
  ]

  return sekcje.filter(Boolean).join('\n\n')
}
