/**
 * Przyciąganie do krawędzi i środków innych obiektów.
 *
 * Bez tego precyzyjne układanie sprowadza się do wpisywania liczb w
 * inspektorze, więc to jest funkcja, nie ozdoba. Zasada działania:
 * z przesuwanej ramki bierzemy trzy linie na osi (lewa, środek, prawa),
 * z każdego celu też trzy, i szukamy najmniejszej różnicy poniżej
 * tolerancji. Wygrywa jedna korekta na oś — dwie naraz szarpałyby
 * obiektem między dwoma celami.
 */

export interface Ramka {
  x: number
  y: number
  w: number
  h: number
}

/** Linia pomocnicza do narysowania na kanwie, w układzie sceny. */
export interface Linia {
  kierunek: 'pion' | 'poziom'
  /** x dla pionowej, y dla poziomej */
  pozycja: number
  /** rozciągłość linii — od/do na drugiej osi, żeby nie ciąć całej kanwy */
  od: number
  do: number
}

export interface WynikPrzyciagania {
  dx: number
  dy: number
  linie: Linia[]
}

const BRAK: WynikPrzyciagania = { dx: 0, dy: 0, linie: [] }

interface Kandydat {
  /** różnica, którą trzeba dodać do ramki */
  delta: number
  /** pozycja linii po przyciągnięciu */
  pozycja: number
  /** zasięg linii na drugiej osi */
  od: number
  do: number
}

/** Trzy charakterystyczne linie ramki na jednej osi. */
function linieOsi(r: Ramka, os: 'x' | 'y'): number[] {
  return os === 'x' ? [r.x, r.x + r.w / 2, r.x + r.w] : [r.y, r.y + r.h / 2, r.y + r.h]
}

function najlepszy(kandydaci: Kandydat[]): Kandydat | undefined {
  if (kandydaci.length === 0) return undefined
  return kandydaci.reduce((a, b) => (Math.abs(b.delta) < Math.abs(a.delta) ? b : a))
}

function kandydaciOsi(ramka: Ramka, cele: Ramka[], tolerancja: number, os: 'x' | 'y'): Kandydat[] {
  const mojeLinie = linieOsi(ramka, os)
  const wynik: Kandydat[] = []

  for (const cel of cele) {
    const celLinie = linieOsi(cel, os)
    for (const moja of mojeLinie) {
      for (const obca of celLinie) {
        const delta = obca - moja
        if (Math.abs(delta) > tolerancja) continue
        // Zasięg linii: obejmuje obie ramki, żeby było widać, z czym się
        // wyrównało — sama kreska przez cały ekran nic nie mówi.
        const drugaOs = os === 'x' ? 'y' : 'x'
        const rozmiar = drugaOs === 'y' ? 'h' : 'w'
        const od = Math.min(ramka[drugaOs], cel[drugaOs])
        const doKonca = Math.max(ramka[drugaOs] + ramka[rozmiar], cel[drugaOs] + cel[rozmiar])
        wynik.push({ delta, pozycja: obca, od, do: doKonca })
      }
    }
  }
  return wynik
}

/**
 * Korekta pozycji przesuwanej ramki. `tolerancja` jest w jednostkach
 * sceny — wołający dzieli piksele przez zoom, żeby przy oddaleniu
 * przyciąganie nie łapało z pół ekranu.
 */
export function przyciagnijRamke(ramka: Ramka, cele: Ramka[], tolerancja: number): WynikPrzyciagania {
  if (cele.length === 0 || tolerancja <= 0) return BRAK

  const wX = najlepszy(kandydaciOsi(ramka, cele, tolerancja, 'x'))
  const wY = najlepszy(kandydaciOsi(ramka, cele, tolerancja, 'y'))

  const linie: Linia[] = []
  if (wX) linie.push({ kierunek: 'pion', pozycja: wX.pozycja, od: wX.od, do: wX.do })
  if (wY) linie.push({ kierunek: 'poziom', pozycja: wY.pozycja, od: wY.od, do: wY.do })

  return { dx: wX?.delta ?? 0, dy: wY?.delta ?? 0, linie }
}

/**
 * Przyciąganie jednej krawędzi — używane przy skalowaniu, gdzie rusza się
 * tylko ciągnięty bok i nie wolno przesuwać całej ramki.
 */
export function przyciagnijKrawedz(
  wartosc: number,
  cele: Ramka[],
  tolerancja: number,
  os: 'x' | 'y',
  zasiegOd: number,
  zasiegDo: number,
): { wartosc: number; linia?: Linia } {
  if (cele.length === 0 || tolerancja <= 0) return { wartosc }

  const kandydaci: Kandydat[] = []
  for (const cel of cele) {
    for (const obca of linieOsi(cel, os)) {
      const delta = obca - wartosc
      if (Math.abs(delta) > tolerancja) continue
      const drugaOs = os === 'x' ? 'y' : 'x'
      const rozmiar = drugaOs === 'y' ? 'h' : 'w'
      kandydaci.push({
        delta,
        pozycja: obca,
        od: Math.min(zasiegOd, cel[drugaOs]),
        do: Math.max(zasiegDo, cel[drugaOs] + cel[rozmiar]),
      })
    }
  }

  const w = najlepszy(kandydaci)
  if (!w) return { wartosc }
  return {
    wartosc: w.pozycja,
    linia: { kierunek: os === 'x' ? 'pion' : 'poziom', pozycja: w.pozycja, od: w.od, do: w.do },
  }
}
