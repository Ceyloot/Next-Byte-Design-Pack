/**
 * Dopasowanie ziarna po generacji.
 *
 * Z generacji, w której obiekt wyszedł dobrze, ale gładszy od reszty zdjęcia:
 * prompt prosił o to samo ziarno trzy razy (brick 08, test mierzalny, FINAL
 * CHECK), a model i tak oddał obiekt czystszy niż otoczenie. Modele obrazu
 * traktują ziarno jak wskazówkę, nie jak wymóg — więc to, co da się zmierzyć,
 * poprawiamy deterministycznie.
 *
 * Działanie:
 *   1. Znajdź obszar zmiany: komórki 8×8, w których średnia jasność wyniku
 *      różni się od oryginału (uśrednianie usuwa różnicę samego ziarna).
 *   2. Zmierz ziarno tła wyniku poza obszarem (mediana odchyleń filtru
 *      górnoprzepustowego w blokach 8×8 — odporna na krawędzie i teksturę).
 *   3. W każdym bloku obszaru dosyp szum o tyle, o ile blokowi brakuje do
 *      poziomu tła. Blok, który ma już tyle ziarna co tło, nie dostaje nic.
 *
 * Nic poza obszarem zmiany się nie zmienia. Gdy obszaru nie da się pewnie
 * wyznaczyć albo obiekt ma już dość ziarna, funkcja niczego nie robi.
 */

export interface Piksele {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface WynikZiarna {
  /** poziom ziarna tła (odchylenie filtru górnoprzepustowego) */
  ziarnoTla: number
  /** mediana poziomu ziarna w obszarze zmiany przed korektą */
  ziarnoObiektuPrzed: number
  /** mediana poziomu ziarna w obszarze zmiany po korekcie */
  ziarnoObiektuPo: number
  /** jaka część kadru została uznana za obszar zmiany */
  udzialObszaru: number
}

const BLOK = 8
/** Filtr L − średnia 4 sąsiadów: dla białego szumu wariancja rośnie 1,25 raza. */
const WSPOLCZYNNIK_FILTRA = Math.sqrt(1.25)
const MAKS_PIKSELI = 16_000_000
const MIN_BLOKOW_TLA = 12
const MIN_BLOKOW_OBIEKTU = 4
/** Ile bloków tła maksymalnie mierzymy — więcej nie zmienia mediany. */
const MAKS_PROBEK_TLA = 600

function jasnosc(p: Piksele): Float32Array {
  const n = p.width * p.height
  const l = new Float32Array(n)
  const d = p.data
  for (let i = 0, j = 0; i < n; i++, j += 4) l[i] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]
  return l
}

function mediana(v: number[]): number {
  if (v.length === 0) return 0
  const s = [...v].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Odchylenie filtru górnoprzepustowego w bloku (bez brzegów kadru). */
function ziarnoBloku(l: Float32Array, w: number, h: number, bx: number, by: number): number | null {
  const x0 = Math.max(1, bx * BLOK)
  const y0 = Math.max(1, by * BLOK)
  const x1 = Math.min(w - 1, (bx + 1) * BLOK)
  const y1 = Math.min(h - 1, (by + 1) * BLOK)
  if (x1 - x0 < 4 || y1 - y0 < 4) return null
  let suma = 0
  let suma2 = 0
  let n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * w + x
      const hp = l[i] - 0.25 * (l[i - 1] + l[i + 1] + l[i - w] + l[i + w])
      suma += hp
      suma2 += hp * hp
      n++
    }
  }
  const sr = suma / n
  return Math.sqrt(Math.max(0, suma2 / n - sr * sr)) / WSPOLCZYNNIK_FILTRA
}

/** Generator liczb pseudolosowych — stały ziarnem, żeby wynik był powtarzalny. */
function losowy(ziarno: number): () => number {
  let a = ziarno >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Komórki, w których wynik różni się od oryginału. Porównujemy ŚREDNIE
 * jasności komórek, nie piksele: ziarno tła jest w obu obrazach inne, ale
 * uśrednione po 64 pikselach znika, a obiekt zostaje.
 */
function wykryjObszar(lo: Float32Array, lr: Float32Array, w: number, h: number, gw: number, gh: number) {
  const roznica = new Float32Array(gw * gh)
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      let so = 0
      let sr = 0
      let n = 0
      for (let y = cy * BLOK; y < Math.min(h, (cy + 1) * BLOK); y++) {
        for (let x = cx * BLOK; x < Math.min(w, (cx + 1) * BLOK); x++) {
          const i = y * w + x
          so += lo[i]
          sr += lr[i]
          n++
        }
      }
      roznica[cy * gw + cx] = Math.abs(sr - so) / Math.max(1, n)
    }
  }
  const prog = Math.max(14, mediana(Array.from(roznica)) * 4 + 8)
  const surowa = roznica.map(v => (v > prog ? 1 : 0))

  // otwarcie: komórka zostaje, gdy ma co najmniej dwóch sąsiadów w obszarze
  const sasiedzi = (m: Float32Array, cx: number, cy: number) => {
    let s = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && y >= 0 && x < gw && y < gh) s += m[y * gw + x]
      }
    }
    return s
  }
  const otwarta = new Float32Array(gw * gh)
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      if (surowa[cy * gw + cx] && sasiedzi(surowa, cx, cy) >= 2) otwarta[cy * gw + cx] = 1
    }
  }

  // składowe spójne; zostają największa i te, które mają ≥ 25% jej pola
  const etykieta = new Int32Array(gw * gh).fill(-1)
  const rozmiary: number[] = []
  for (let start = 0; start < gw * gh; start++) {
    if (!otwarta[start] || etykieta[start] >= 0) continue
    const id = rozmiary.length
    let n = 0
    const stos = [start]
    etykieta[start] = id
    while (stos.length) {
      const k = stos.pop() as number
      n++
      const cx = k % gw
      const cy = (k / gw) | 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = cx + dx
          const y = cy + dy
          if (x < 0 || y < 0 || x >= gw || y >= gh) continue
          const j = y * gw + x
          if (otwarta[j] && etykieta[j] < 0) {
            etykieta[j] = id
            stos.push(j)
          }
        }
      }
    }
    rozmiary.push(n)
  }
  if (rozmiary.length === 0) return null
  const najwiekszy = Math.max(...rozmiary)
  const obszar = new Float32Array(gw * gh)
  for (let k = 0; k < gw * gh; k++) {
    if (etykieta[k] >= 0 && rozmiary[etykieta[k]] >= najwiekszy * 0.25) obszar[k] = 1
  }
  return obszar
}

/**
 * Dosypuje brakujące ziarno w obszarze zmiany. Zmienia `wynik` w miejscu.
 * Zwraca statystyki, gdy coś zmieniono, albo `null`, gdy korekta nie była
 * potrzebna lub obszaru nie dało się pewnie wyznaczyć.
 */
export function dopasujZiarnoNaPikselach(oryginal: Piksele, wynik: Piksele): WynikZiarna | null {
  const { width: w, height: h } = wynik
  if (oryginal.width !== w || oryginal.height !== h) return null
  if (w * h > MAKS_PIKSELI || w < 4 * BLOK || h < 4 * BLOK) return null

  const gw = Math.ceil(w / BLOK)
  const gh = Math.ceil(h / BLOK)
  const lo = jasnosc(oryginal)
  const lr = jasnosc(wynik)

  const obszar = wykryjObszar(lo, lr, w, h, gw, gh)
  if (!obszar) return null
  let komorek = 0
  for (const v of obszar) komorek += v
  const udzial = komorek / (gw * gh)
  if (udzial < 0.002 || udzial > 0.45) return null

  // wnętrze obszaru (wszyscy sąsiedzi też w obszarze) i tło (daleko od obszaru)
  const wObszarze = (cx: number, cy: number, promien: number) => {
    for (let dy = -promien; dy <= promien; dy++) {
      for (let dx = -promien; dx <= promien; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && y >= 0 && x < gw && y < gh && obszar[y * gw + x]) return true
      }
    }
    return false
  }

  const tlo: number[] = []
  const wnetrze: number[] = []
  const krokTla = Math.max(1, Math.floor((gw * gh) / MAKS_PROBEK_TLA))
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      const k = cy * gw + cx
      if (obszar[k]) {
        const wewnatrz =
          cx > 0 && cy > 0 && cx < gw - 1 && cy < gh - 1 && obszar[k - 1] && obszar[k + 1] && obszar[k - gw] && obszar[k + gw]
        if (wewnatrz) {
          const z = ziarnoBloku(lr, w, h, cx, cy)
          if (z !== null) wnetrze.push(z)
        }
      } else if (k % krokTla === 0 && !wObszarze(cx, cy, 2)) {
        const z = ziarnoBloku(lr, w, h, cx, cy)
        if (z !== null) tlo.push(z)
      }
    }
  }
  if (tlo.length < MIN_BLOKOW_TLA || wnetrze.length < MIN_BLOKOW_OBIEKTU) return null

  const ziarnoTla = mediana(tlo)
  const przed = mediana(wnetrze)
  if (przed >= ziarnoTla * 0.85) return null // obiekt ma już podobne ziarno

  // ile szumu białego dosypać w każdej komórce obszaru (w skali filtru → w skali pikseli)
  const dosypka = new Float32Array(gw * gh)
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      const k = cy * gw + cx
      if (!obszar[k]) continue
      const z = ziarnoBloku(lr, w, h, cx, cy)
      if (z === null) continue
      const brak = Math.sqrt(Math.max(0, ziarnoTla * ziarnoTla - z * z))
      dosypka[k] = Math.min(25, brak / WSPOLCZYNNIK_FILTRA)
    }
  }

  // wygładzenie siatki dosypki (3×3) tylko między komórkami, które dostają szum:
  // komórki krawędziowe (dosypka 0) nie ściągają wartości wnętrza w dół
  const gladka = new Float32Array(gw * gh)
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      if (dosypka[cy * gw + cx] <= 0) continue
      let s = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = cx + dx
          const y = cy + dy
          if (x >= 0 && y >= 0 && x < gw && y < gh && dosypka[y * gw + x] > 0) {
            s += dosypka[y * gw + x]
            n++
          }
        }
      }
      gladka[cy * gw + cx] = s / n
    }
  }

  // interpolacja dwuliniowa między środkami komórek → siła szumu w każdym pikselu
  const los = losowy(0x51ed270b)
  const gauss = () => {
    const u = Math.max(1e-9, los())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * los())
  }
  const d = wynik.data
  for (let y = 0; y < h; y++) {
    const fy = Math.min(gh - 1, Math.max(0, (y + 0.5) / BLOK - 0.5))
    const y0 = Math.floor(fy)
    const y1 = Math.min(gh - 1, y0 + 1)
    const ty = fy - y0
    for (let x = 0; x < w; x++) {
      const fx = Math.min(gw - 1, Math.max(0, (x + 0.5) / BLOK - 0.5))
      const x0 = Math.floor(fx)
      const x1 = Math.min(gw - 1, x0 + 1)
      const tx = fx - x0
      const sila =
        (gladka[y0 * gw + x0] * (1 - tx) + gladka[y0 * gw + x1] * tx) * (1 - ty) +
        (gladka[y1 * gw + x0] * (1 - tx) + gladka[y1 * gw + x1] * tx) * ty
      if (sila < 0.05) continue
      const szum = gauss() * sila
      const j = (y * w + x) * 4
      d[j] = Math.min(255, Math.max(0, d[j] + szum))
      d[j + 1] = Math.min(255, Math.max(0, d[j + 1] + szum))
      d[j + 2] = Math.min(255, Math.max(0, d[j + 2] + szum))
    }
  }

  // ponowny pomiar tych samych bloków po korekcie
  const lpo = jasnosc(wynik)
  const po: number[] = []
  for (let cy = 1; cy < gh - 1; cy++) {
    for (let cx = 1; cx < gw - 1; cx++) {
      const k = cy * gw + cx
      if (obszar[k] && obszar[k - 1] && obszar[k + 1] && obszar[k - gw] && obszar[k + gw]) {
        const z = ziarnoBloku(lpo, w, h, cx, cy)
        if (z !== null) po.push(z)
      }
    }
  }
  return { ziarnoTla, ziarnoObiektuPrzed: przed, ziarnoObiektuPo: mediana(po), udzialObszaru: udzial }
}

function wczytaj(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const obraz = new Image()
    obraz.crossOrigin = 'anonymous'
    obraz.onload = () => resolve(obraz)
    obraz.onerror = () => reject(new Error('Nie udało się wczytać obrazu'))
    obraz.src = src
  })
}

/**
 * Wersja dla przeglądarki: wczytuje wynik i oryginał, poprawia ziarno
 * i zwraca nowy obraz. Przy jakimkolwiek problemie oddaje wynik bez zmian —
 * korekta nigdy nie może zepsuć wyniku, który model już wygenerował.
 */
export async function dopasujZiarno(wynikSrc: string, oryginalSrc: string): Promise<string> {
  try {
    const [wynik, oryginal] = await Promise.all([wczytaj(wynikSrc), wczytaj(oryginalSrc)])
    const w = wynik.naturalWidth
    const h = wynik.naturalHeight
    if (w * h > MAKS_PIKSELI) return wynikSrc

    const plotnoWyniku = document.createElement('canvas')
    plotnoWyniku.width = w
    plotnoWyniku.height = h
    const gw = plotnoWyniku.getContext('2d', { willReadFrequently: true })
    const plotnoOryginalu = document.createElement('canvas')
    plotnoOryginalu.width = w
    plotnoOryginalu.height = h
    const go = plotnoOryginalu.getContext('2d', { willReadFrequently: true })
    if (!gw || !go) return wynikSrc

    gw.drawImage(wynik, 0, 0)
    go.drawImage(oryginal, 0, 0, w, h)
    const daneWyniku = gw.getImageData(0, 0, w, h)
    const daneOryginalu = go.getImageData(0, 0, w, h)

    const statystyki = dopasujZiarnoNaPikselach(daneOryginalu, daneWyniku)
    if (!statystyki) return wynikSrc

    gw.putImageData(daneWyniku, 0, 0)
    console.info('[canvas] dopasowano ziarno obiektu', statystyki)
    return plotnoWyniku.toDataURL('image/jpeg', 0.95)
  } catch {
    return wynikSrc
  }
}
