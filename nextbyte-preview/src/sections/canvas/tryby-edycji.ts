/**
 * Reguły dla poszczególnych trybów edycji.
 *
 * Wszystko jest sformułowane TWIERDZĄCO, także tam, gdzie chodzi o brak
 * czegoś. To nie jest stylistyka: Google w wytycznych do Nano Banana pisze
 * wprost, żeby opisywać stan docelowy zamiast zakazów („empty, deserted
 * street” zamiast „no cars”), bo wymienienie rzeczy w prompcie kieruje na
 * nią uwagę modelu — również wtedy, gdy stoi przy niej „nie”.
 *
 * Dlatego zamiast listy „NIEDOPUSZCZALNE” każdy tryb ma `zostaje`: opis
 * tego, co ma wyjść z edycji nietknięte.
 */

export interface Tryb {
  misja: (tekst: string) => string
  /** kroki do wykonania — tryb rozkazujący, konkret zamiast ogólników */
  reguly: string[]
  /** stan docelowy tego, czego zadanie nie dotyczy */
  zostaje: string[]
}

export type Intencja = 'wstaw' | 'przenies' | 'zamien' | 'usun' | 'styl' | 'popraw'

export const INTENCJE: { id: Intencja; nazwa: string; opis: string }[] = [
  { id: 'wstaw', nazwa: 'Dodaj', opis: 'Wstaw nowy obiekt w scenę' },
  { id: 'przenies', nazwa: 'Przenieś', opis: 'Ten sam obiekt w innym miejscu' },
  { id: 'zamien', nazwa: 'Zamień', opis: 'Podmień jedną rzecz na drugą' },
  { id: 'usun', nazwa: 'Usuń', opis: 'Skasuj obiekt i odtwórz tło' },
  { id: 'styl', nazwa: 'Styl', opis: 'Zmień styl, zachowaj kompozycję' },
  { id: 'popraw', nazwa: 'Popraw', opis: 'Inna zmiana w kadrze' },
]

export const TRYBY: Record<Intencja, Tryb> = {
  wstaw: {
    misja: t => `Dodaj do sceny to, o co prosi zadanie: ${t}`,
    reguly: [
      'Zanim zaczniesz rysować, ustal skalę sceny według sekcji SKALA — od niej zależy wielkość wstawianego obiektu.',
      'Wstaw obiekt w całości: wszystkie jego części mieszczą się w kadrze. Gdy brakuje miejsca, pokaż go mniejszego albo dalej.',
      'Postaw obiekt na podłożu: styk z gruntem widoczny, pod nim cień kontaktowy, ciężar rozłożony naturalnie.',
      'Zachowaj kolejność planów: to, co jest bliżej kamery, zasłania obiekt; obiekt zasłania to, co za nim.',
      'Zostaw wokół obiektu tyle wolnej przestrzeni, ile ma sąsiedztwo — obiekt stoi obok innych rzeczy, nie na nich.',
      'Na powierzchniach odbijających dodaj odbicie zgodne z resztą sceny.',
    ],
    zostaje: [
      'wszystkie pozostałe obiekty w dokładnie tych samych miejscach i wielkościach',
      'tło, niebo, roślinność, nawierzchnie i kolorystyka sceny',
      'układ i kompozycja kadru sprzed zmiany',
    ],
  },

  przenies: {
    misja: t => `Przenieś wskazany obiekt w nowe miejsce: ${t}`,
    reguly: [
      'To jest przeniesienie, nie kopiowanie: ten sam obiekt zmienia położenie w tej samej scenie.',
      'W wyniku ten obiekt występuje DOKŁADNIE RAZ — w nowym miejscu wskazanym celownikiem.',
      'Stare miejsce po nim wygląda jak reszta otoczenia: odtwórz tam grunt, roślinność i wzory tak, ' +
        'jakby obiekt nigdy tam nie stał. Zabierz też jego dawny cień i odbicie.',
      'Zachowaj tożsamość obiektu: ta sama bryła, ten sam materiał, ten sam kolor i te same detale.',
      'Dostosuj go do nowego miejsca: perspektywa, skala i światło pochodzą z nowego położenia, nie ze starego.',
      'Osadź go w nowym podłożu i narysuj nowy cień zgodny z kierunkiem światła w scenie.',
      'Zachowaj odstępy od sąsiadów — obiekt staje obok innych rzeczy, nie na nich i nie w nich.',
    ],
    zostaje: [
      'sam obiekt — to ta sama rzecz, tylko w innym miejscu',
      'cała reszta sceny: pozostałe budynki, roślinność, nawierzchnie i niebo',
      'światło, pora dnia i kolorystyka kadru',
    ],
  },

  zamien: {
    misja: t => `Podmień wskazany element zgodnie z zadaniem: ${t}`,
    reguly: [
      'Ustal, ile miejsca zajmował stary element — jego szerokość, wysokość i obrys na ziemi. To jest miara dla nowego.',
      'Uprzątnij miejsce po starym elemencie razem z jego cieniem i odbiciem, a pod spodem odtwórz podłoże.',
      'Postaw nowy element dokładnie tam, gdzie stał stary, na tej samej płaszczyźnie i w tej samej skali względem otoczenia.',
      'Gdy nowy element jest z natury większy, dopasuj go do dostępnego miejsca — miejsce jest ważniejsze niż jego typowa wielkość.',
      'Przejmij po starym elemencie oświetlenie: te same źródła światła, ta sama strona cienia, ta sama pora dnia.',
      'Narysuj nowe cienie i odbicia wynikające z nowego kształtu.',
      'Zachowaj odstępy od sąsiadów — nowy element stoi obok tego, co było wokół starego, i niczego nie przenika.',
    ],
    zostaje: [
      // Nie „piksel w piksel”: model generatywny przerysowuje cały kadr i nie
      // potrafi zachować pikseli. Żądanie niewykonalne obniża wiarygodność
      // reszty promptu, więc prosimy o to, co osiągalne — zgodność wyglądu.
      'reszta kadru wygląda tak samo jak przed zmianą: te same obiekty, w tych samych miejscach i wielkościach',
      'tło, niebo, nawierzchnie, roślinność i pozostałe budynki',
      'cienie i odbicia rzucane przez inne obiekty',
    ],
  },

  usun: {
    misja: t => `Usuń ze sceny to, o co prosi zadanie, i odtwórz tło: ${t}`,
    reguly: [
      'Uprzątnij obiekt razem ze wszystkimi jego śladami: cieniem, odbiciem, wgnieceniem, śladem styku z podłożem.',
      'Odtwórz to, co logicznie znajduje się za nim i pod nim, na podstawie sąsiedztwa.',
      'Kontynuuj wzory i struktury (bruk, deski, kafle, rzędy roślin, linie murów) z zachowaniem kierunku, skali i rytmu.',
      'Poprowadź linie perspektywy podłoża i ścian przez odtworzony fragment tak, jakby nic ich nie przerywało.',
      'Cień innego obiektu przechodzący przez to miejsce narysuj dalej, bez przerwy.',
      'Dopasuj jasność, barwę i ziarno do sąsiedztwa tak, żeby granica odtworzonego fragmentu była niewidoczna.',
      'W zwolnionym miejscu ma być samo tło — dalszy ciąg sceny, nic nowego.',
    ],
    zostaje: [
      'cała reszta kadru bez zmian',
      'obiekty sąsiadujące z usuwanym, w tych samych miejscach i wielkościach',
      'światło, pora dnia i kolorystyka sceny',
    ],
  },

  styl: {
    misja: t => `Zmień sposób narysowania sceny zgodnie z zadaniem: ${t}`,
    reguly: [
      'Zachowaj kompozycję: te same obiekty, te same kształty, te same proporcje, to samo rozmieszczenie.',
      'Zmieniaj wyłącznie sposób rysowania: kreskę, fakturę, paletę, cieniowanie.',
      'Nałóż styl równomiernie na cały kadr, z tą samą intensywnością od krawędzi do krawędzi.',
      'Utrzymaj rozpoznawalność: po zmianie widać te same miejsca i te same obiekty co przed nią.',
    ],
    zostaje: [
      'liczba i rozmieszczenie obiektów',
      'kadr, perspektywa i układ sceny',
      'czytelność tego, co przedstawia obraz',
    ],
  },

  popraw: {
    misja: t => `Wykonaj na scenie dokładnie tę zmianę: ${t}`,
    reguly: [
      'Wykonaj wyłącznie zmianę z zadania, najmniejszym możliwym nakładem.',
      'Potraktuj wskazany fragment jak jedyne miejsce pracy — reszta kadru jest materiałem odniesienia, nie polem do poprawek.',
      'Przy niejednoznacznym zadaniu wybierz odczytanie najbliższe temu, co już jest w kadrze.',
    ],
    zostaje: [
      'kolorystyka, pogoda, pora dnia i kadr',
      'wszystkie obiekty, których zadanie nie wymienia',
    ],
  },
}
