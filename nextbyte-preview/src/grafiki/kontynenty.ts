/* ═══════════════════════════════════════════════════════════════════════
   KONTYNENTY — OBRYSY I RASTER KROPEK NA KULI

   Planetę rysujemy kropkami, nie bitmapą: siatka punktów co ok. stopień,
   przycięta do lądów. Ląd czyta się jak matryca pikseli, a rysunek zostaje
   wektorowy i sterowany kolorem motywu.

   Szczegółowość jest nierówna CELOWO. Europa, Afryka i Bliski Wschód —
   czyli to, co widać na czaszy wokół węzła w UE — mają wybrzeża z dokładnością
   do ok. stopnia, a morza śródlądowe (Czarne, Kaspijskie) są wycięte jako
   woda. Reszta świata jest zgrubna, bo i tak leży za horyzontem.
   To nie jest materiał kartograficzny, tylko tło dla jednej tezy.
   ═══════════════════════════════════════════════════════════════════════ */

/** Obrys jako pary [długość, szerokość] geograficzna. */
type Obrys = [number, number][]

/* ── Lądy widoczne na czaszy — dokładniej ─────────────────────────────── */

/** Eurazja: szczegółowa na zachodzie, zgrubna na wschodzie. Pierścień
    idzie od Gibraltaru na wschód wzdłuż Morza Śródziemnego, przez Arabię
    i Azję, wraca Arktyką i schodzi wybrzeżem Norwegii, Bałtyku i Atlantyku. */
const EURAZJA: Obrys = [
  [-5.6, 36.0], [-2.0, 36.7], [0.0, 38.7], [-0.3, 39.5], [0.9, 41.0], [3.2, 41.9],
  [3.1, 43.1], [4.8, 43.4], [6.6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9],
  [11.1, 42.4], [12.5, 41.7], [14.0, 40.8], [15.6, 40.0], [15.7, 38.0], [17.1, 39.0],
  [16.5, 39.8], [18.5, 40.1], [18.0, 40.6], [16.0, 41.4], [14.0, 42.6], [13.6, 43.6],
  [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [14.5, 45.3], [15.9, 43.6], [17.5, 43.0],
  [19.4, 41.9], [19.4, 40.4], [20.2, 39.6], [21.1, 38.3], [22.0, 36.8], [22.9, 36.5],
  [23.2, 38.0], [24.0, 38.2], [22.8, 39.5], [22.6, 40.5], [24.0, 40.8], [26.0, 40.8],
  [26.3, 40.0], [26.2, 39.3], [27.0, 38.4], [27.4, 37.0], [28.3, 36.7], [30.6, 36.8],
  [32.8, 36.1], [34.6, 36.8], [36.2, 36.6], [35.9, 35.3], [35.1, 33.1], [34.3, 31.3],
  [34.9, 29.5], [36.5, 26.0], [39.2, 21.5], [42.6, 15.5], [43.5, 12.7], [45.0, 12.8],
  [52.2, 15.6], [55.5, 17.9], [59.8, 22.4], [56.4, 26.4], [54.0, 24.2], [51.6, 24.3],
  [50.1, 26.2], [48.0, 29.9], [50.1, 30.2], [54.0, 26.6], [57.3, 25.8], [61.6, 25.2],
  [66.6, 25.4], [68.8, 23.2], [72.6, 21.3], [72.8, 19.0], [74.4, 14.8], [76.6, 8.9],
  [77.5, 8.1], [80.2, 13.1], [80.3, 15.9], [86.9, 20.4], [91.6, 22.5], [92.3, 20.7],
  [94.4, 16.0], [97.6, 16.5], [98.5, 9.0], [100.3, 6.4], [103.4, 1.3], [104.1, 1.4],
  [103.3, 5.0], [101.0, 12.7], [102.3, 12.3], [105.0, 8.6], [109.2, 11.6], [108.7, 15.4],
  [106.7, 20.0], [108.5, 21.5], [113.8, 22.2], [117.5, 24.1], [121.0, 28.2], [122.0, 31.0],
  [120.3, 34.3], [122.6, 37.4], [118.9, 37.4], [118.5, 39.1], [121.6, 40.9], [124.3, 39.9],
  [126.6, 37.7], [126.3, 34.6], [129.3, 35.3], [129.6, 36.8], [128.3, 38.6], [129.8, 40.9],
  [131.0, 42.6], [135.6, 43.9], [140.3, 48.3], [141.4, 53.0], [137.0, 54.0], [141.0, 59.0],
  [152.0, 59.5], [156.0, 61.5], [163.0, 62.0], [172.0, 60.5], [180.0, 65.0], [180.0, 69.0],
  [170.0, 70.0], [160.0, 69.6], [150.0, 71.5], [140.0, 72.5], [128.0, 73.0], [113.0, 73.7],
  [105.0, 77.5], [98.0, 76.0], [88.0, 75.3], [80.0, 72.5], [72.8, 72.8], [68.5, 68.5],
  [66.0, 69.5], [60.5, 69.8], [55.0, 68.4], [53.7, 68.9], [43.8, 68.4], [44.2, 66.3],
  [41.0, 66.6], [35.0, 66.2], [33.2, 69.4], [31.0, 69.9], [28.0, 71.1], [23.5, 70.8],
  [18.5, 70.0], [14.5, 68.2], [12.5, 65.9], [10.5, 64.0], [8.5, 63.2], [5.1, 62.2],
  [5.0, 60.0], [5.6, 58.9], [7.0, 58.0], [8.5, 58.2], [10.5, 59.2], [11.2, 58.4],
  [12.3, 56.6], [12.9, 55.4], [14.3, 55.6], [16.4, 56.6], [16.7, 58.0], [18.3, 59.4],
  [17.3, 60.6], [17.3, 62.3], [21.4, 64.6], [22.3, 65.8], [25.2, 65.1], [25.3, 64.1],
  [21.3, 62.8], [21.4, 60.8], [22.9, 59.8], [26.0, 60.4], [29.0, 60.2], [28.0, 59.5],
  [24.0, 59.3], [23.4, 58.6], [24.3, 57.3], [21.2, 57.0], [21.0, 56.1], [21.2, 55.2],
  [19.9, 54.4], [18.6, 54.4], [16.6, 54.6], [14.2, 53.9], [12.0, 54.2], [10.9, 54.0],
  [10.0, 54.9], [9.9, 55.8], [10.6, 57.7], [8.2, 56.8], [8.1, 55.5], [8.6, 53.9],
  [7.0, 53.4], [4.8, 52.9], [3.6, 51.4], [1.7, 50.9], [1.6, 50.2], [0.2, 49.7],
  [-1.3, 49.7], [-1.9, 48.7], [-4.7, 48.4], [-4.3, 47.8], [-2.2, 47.2], [-1.2, 46.0],
  [-1.4, 44.0], [-1.8, 43.4], [-4.5, 43.4], [-8.0, 43.7], [-9.3, 43.0], [-8.8, 41.2],
  [-9.5, 38.8], [-8.9, 37.9], [-9.0, 37.0], [-7.4, 37.2], [-6.4, 36.8],
]

const AFRYKA: Obrys = [
  [-17.1, 14.7], [-16.5, 19.4], [-17.0, 21.0], [-15.0, 24.5], [-13.2, 27.6], [-9.8, 29.9],
  [-9.8, 32.0], [-6.8, 34.0], [-5.9, 35.8], [-2.2, 35.1], [1.0, 36.5], [3.5, 36.8],
  [8.6, 36.9], [10.3, 37.2], [11.1, 36.8], [10.2, 35.2], [11.1, 33.3], [15.2, 32.3],
  [19.2, 30.3], [20.1, 32.1], [23.0, 32.6], [25.2, 31.6], [29.6, 31.2], [32.2, 31.3],
  [32.6, 29.9], [33.9, 27.6], [35.7, 23.9], [37.3, 21.0], [38.4, 18.0], [39.3, 15.9],
  [41.2, 14.5], [43.3, 12.4], [44.5, 10.4], [51.1, 11.9], [51.0, 10.4], [49.4, 6.8],
  [47.7, 4.2], [43.0, -0.5], [40.1, -3.3], [39.2, -6.5], [39.5, -10.0], [40.6, -15.5],
  [36.8, -18.9], [35.2, -22.1], [32.9, -26.2], [32.4, -28.6], [30.1, -31.1], [27.5, -33.2],
  [25.7, -34.0], [22.6, -33.9], [19.6, -34.8], [18.2, -33.4], [18.3, -31.8], [16.3, -28.6],
  [15.2, -26.9], [14.4, -22.6], [13.2, -20.0], [11.8, -17.3], [12.2, -14.4], [13.6, -12.0],
  [13.1, -8.6], [12.3, -6.1], [9.4, -2.0], [9.6, 1.0], [9.8, 3.1], [8.5, 4.5],
  [6.0, 4.3], [4.3, 6.3], [1.9, 6.1], [-2.0, 4.7], [-7.5, 4.3], [-9.0, 5.0],
  [-12.9, 7.8], [-13.2, 9.5], [-15.0, 10.9], [-16.7, 12.4],
]

const BRYTANIA: Obrys = [
  [-5.7, 50.0], [-3.0, 50.6], [1.4, 51.2], [1.7, 52.7], [0.3, 53.4], [-0.2, 54.5],
  [-1.6, 55.6], [-2.1, 57.7], [-3.0, 58.6], [-5.0, 58.6], [-6.2, 56.8], [-5.6, 55.3],
  [-4.8, 54.8], [-3.0, 53.9], [-4.6, 53.3], [-4.2, 52.3], [-5.3, 51.7], [-3.2, 51.4],
  [-4.2, 51.2],
]

const IRLANDIA: Obrys = [
  [-6.0, 52.2], [-6.2, 53.9], [-5.6, 54.6], [-6.8, 55.2], [-8.3, 55.2], [-10.0, 54.2],
  [-9.9, 53.4], [-9.9, 52.1], [-10.3, 51.8], [-8.4, 51.6],
]

const ISLANDIA: Obrys = [
  [-22.5, 63.9], [-24.0, 65.5], [-22.2, 66.4], [-16.5, 66.5], [-14.5, 65.8],
  [-13.6, 65.1], [-15.0, 64.3], [-18.7, 63.4],
]

const SARDYNIA: Obrys = [[8.4, 39.0], [9.6, 39.2], [9.7, 40.9], [8.4, 40.9]]
const KORSYKA: Obrys = [[8.6, 41.4], [9.4, 41.4], [9.5, 43.0], [8.7, 42.6]]
const SYCYLIA: Obrys = [[12.4, 37.8], [15.6, 38.3], [15.1, 36.7], [12.7, 37.5]]

const MADAGASKAR: Obrys = [
  [49.3, -12.0], [50.5, -15.2], [49.9, -17.1], [47.1, -24.9], [45.4, -25.6],
  [43.9, -24.9], [43.3, -22.1], [44.4, -19.9], [44.0, -17.4], [46.3, -15.8], [48.0, -13.9],
]

/* ── Reszta świata — zgrubnie, bo leży za horyzontem ──────────────────── */

const AMERYKA_PN: Obrys = [
  [-168, 66], [-150, 70], [-130, 70], [-110, 69], [-95, 71], [-80, 70],
  [-65, 62], [-55, 52], [-62, 46], [-70, 44], [-72, 40], [-76, 35],
  [-80, 26], [-83, 23], [-88, 21], [-90, 18], [-84, 10], [-78, 8],
  [-88, 16], [-95, 18], [-98, 16], [-105, 22], [-112, 29], [-118, 33],
  [-124, 40], [-124, 48], [-135, 57], [-150, 59], [-165, 62],
]

const GRENLANDIA: Obrys = [
  [-45, 60], [-52, 66], [-55, 71], [-48, 76], [-35, 80], [-22, 78],
  [-19, 72], [-30, 66],
]

const AMERYKA_PD: Obrys = [
  [-78, 8], [-72, 11], [-62, 10], [-52, 5], [-50, 0], [-44, -2],
  [-35, -6], [-38, -13], [-40, -20], [-48, -25], [-54, -34], [-58, -39],
  [-62, -41], [-65, -45], [-68, -52], [-72, -54], [-73, -45], [-72, -35],
  [-71, -25], [-70, -18], [-75, -14], [-81, -6], [-80, 0],
]

const AUSTRALIA: Obrys = [
  [113, -22], [114, -27], [118, -34], [125, -32], [132, -31], [137, -35],
  [141, -38], [146, -39], [150, -37], [153, -28], [153, -25], [146, -19],
  [142, -11], [136, -12], [130, -11], [126, -14], [122, -17],
]

/* ── Woda wewnątrz lądów ──────────────────────────────────────────────── */

const MORZE_CZARNE: Obrys = [
  [27.8, 42.0], [28.6, 43.4], [29.6, 45.3], [30.8, 46.5], [33.5, 46.0], [32.5, 45.4],
  [33.6, 44.4], [35.4, 45.0], [36.6, 45.3], [38.3, 46.9], [39.2, 47.1], [37.8, 44.7],
  [39.7, 43.4], [41.6, 41.6], [40.0, 40.9], [36.0, 41.7], [33.3, 42.0], [29.5, 41.2],
  [28.9, 41.2],
]

const MORZE_KASPIJSKIE: Obrys = [
  [49.0, 46.4], [47.5, 45.6], [47.6, 43.6], [48.6, 41.8], [50.0, 40.4], [49.3, 38.2],
  [51.0, 36.8], [53.9, 37.1], [53.9, 39.5], [53.0, 40.6], [54.7, 41.0], [53.0, 42.1],
  [51.3, 43.2], [51.0, 44.8], [53.1, 45.3], [53.0, 46.8], [51.2, 47.1],
]

/** Punkty zbyt małe na obrys, a rozpoznawalne. */
const WYSPY: [number, number][] = [
  [24.0, 35.3], [25.2, 35.2], [33.0, 35.0], [34.0, 35.2],   // Kreta, Cypr
  [14.4, 35.9], [3.0, 39.6], [-16.5, 28.3], [-15.6, 28.0],  // Malta, Majorka, Kanary
  [-25.5, 37.8], [-16.9, 32.7], [-23.6, 15.1],             // Azory, Madera, Zielony Przylądek
  [140, 37], [138, 35], [134, 34], [142, 43],               // Japonia
  [-157, 21], [172, -41],                                   // Hawaje, NZ
]

/* Każdy wielokąt dostaje prostokąt obejmujący — test przynależności
   odpalamy dopiero, gdy punkt w nim leży. Przy gęstym rastrze to
   różnica między ułamkiem sekundy a zauważalnym przestojem na starcie. */
const zRamka = (o: Obrys) => ({
  o,
  lon0: Math.min(...o.map((q) => q[0])), lon1: Math.max(...o.map((q) => q[0])),
  lat0: Math.min(...o.map((q) => q[1])), lat1: Math.max(...o.map((q) => q[1])),
})

const LADY = [
  EURAZJA, AFRYKA, BRYTANIA, IRLANDIA, ISLANDIA, SARDYNIA, KORSYKA, SYCYLIA,
  MADAGASKAR, AMERYKA_PN, GRENLANDIA, AMERYKA_PD, AUSTRALIA,
].map(zRamka)

const WODY = [MORZE_CZARNE, MORZE_KASPIJSKIE].map(zRamka)

/** Test przynależności punktu do wielokąta — zwykłe rzucanie promienia. */
function wWielokacie(lon: number, lat: number, obrys: Obrys): boolean {
  let w = false
  for (let i = 0, j = obrys.length - 1; i < obrys.length; j = i++) {
    const [xi, yi] = obrys[i]!
    const [xj, yj] = obrys[j]!
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) w = !w
  }
  return w
}

const trafia = (lon: number, lat: number, r: ReturnType<typeof zRamka>) =>
  lon >= r.lon0 && lon <= r.lon1 && lat >= r.lat0 && lat <= r.lat1 && wWielokacie(lon, lat, r.o)

/** Czy w danym punkcie jest ląd (z odliczeniem mórz śródlądowych). */
export function jestLad(lon: number, lat: number): boolean {
  if (!LADY.some((r) => trafia(lon, lat, r))) return false
  return !WODY.some((r) => trafia(lon, lat, r))
}

export type Zakres = { lon: [number, number]; lat: [number, number] }

export type KropkaLadu = { lon: number; lat: number; brzeg: boolean }

/** Raster lądów o zadanym kroku, ograniczony do zakresu. Każda kropka wie,
    czy leży na wybrzeżu — sąsiad o krok dalej jest wodą — dzięki czemu
    linię brzegową da się podkreślić i kształty czytają się ostro.
    Wołaj RAZ przy starcie modułu, nie w pętli animacji. */
export function rasterLadow(krokSt: number, zakres: Zakres): KropkaLadu[] {
  const punkty: KropkaLadu[] = WYSPY
    .filter(([lon, lat]) => lon >= zakres.lon[0] && lon <= zakres.lon[1] && lat >= zakres.lat[0] && lat <= zakres.lat[1])
    .map(([lon, lat]) => ({ lon, lat, brzeg: true }))
  for (let lat = zakres.lat[0]; lat <= zakres.lat[1]; lat += krokSt) {
    // Krok długości rośnie przy biegunach, inaczej kropki zlewałyby się
    // w gęste pasy tam, gdzie południki się schodzą.
    const krok = krokSt / Math.max(0.28, Math.cos((lat * Math.PI) / 180))
    for (let lon = zakres.lon[0]; lon <= zakres.lon[1]; lon += krok) {
      if (!jestLad(lon, lat)) continue
      const brzeg = !jestLad(lon + krok, lat) || !jestLad(lon - krok, lat)
        || !jestLad(lon, lat + krokSt) || !jestLad(lon, lat - krokSt)
      punkty.push({ lon, lat, brzeg })
    }
  }
  return punkty
}

/** Rzadki raster oceanu — tło, dzięki któremu cała czasza czyta się jak kula. */
export function rasterOceanu(krokSt: number, zakres: Zakres): [number, number][] {
  const punkty: [number, number][] = []
  for (let lat = zakres.lat[0]; lat <= zakres.lat[1]; lat += krokSt) {
    const krok = krokSt / Math.max(0.28, Math.cos((lat * Math.PI) / 180))
    for (let lon = zakres.lon[0]; lon <= zakres.lon[1]; lon += krok) {
      if (!jestLad(lon, lat)) punkty.push([lon, lat])
    }
  }
  return punkty
}
