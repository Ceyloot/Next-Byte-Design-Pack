/**
 * Dopasowanie ziarna i medium po generacji.
 *
 * Zasada: wygenerowany obiekt ma TO SAMO ziarno co zdjęcie — bez „naklejki”
 * i bez dwóch rodzajów ziarna w jednym obrazie. Prompt prosi o to kilka razy,
 * ale modele obrazu traktują ziarno jak wskazówkę, więc to, co da się zmierzyć,
 * poprawiamy deterministycznie.
 *
 * Działanie:
 *   1. Obszar zmiany: komórki 8×8, w których średnia jasność wyniku różni się
 *      od oryginału (uśrednianie usuwa różnicę samego ziarna).
 *   2. Ziarno tła: moc reszty (piksel minus rozmycie) w blokach poza obszarem
 *      oraz jej korelacja przestrzenna (lag 1 i 2) — to odróżnia ziarno drobne
 *      od grubego, „klejkowatego”.
 *   3. Ziarno obiektu: w każdym bloku obszaru dosypujemy szum o TAKIEJ SAMEJ
 *      korelacji przestrzennej co tło, w ilości, której blokowi brakuje do
 *      poziomu tła. Szum drobny dosypany na zdjęcie z grubym ziarnem byłby
 *      właśnie drugim rodzajem ziarna.
 *   4. Medium: gdy oryginał jest czarno-biały, obszar zmiany też jest bez koloru.
 *
 * Nic poza obszarem zmiany się nie zmienia. Gdy obszaru nie da się pewnie
 * wyznaczyć albo nie ma czego poprawiać, funkcja niczego nie robi.
 */

export interface Piksele {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface WynikZiarna {
  /** moc reszty (ziarno + drobna faktura) tła */
  ziarnoTla: number
  /** mediana mocy reszty w obszarze zmiany przed korektą */
  ziarnoObiektuPrzed: number
  /** mediana mocy reszty w obszarze zmiany po korekcie */
  ziarnoObiektuPo: number
  /** jaka część kadru została uznana za obszar zmiany */
  udzialObszaru: number
  /** promień rozmycia użytego do syntezy ziarna (0 = szum drobny, większy = grubsze ziarno) */
  rozmycieZiarna: number
  /** czy oryginał jest czarno-biały i obszar zmiany został odbarwiony */
  odbarwiono: boolean
  /** czy dosypano ziarna */
  dosypanoZiarno: boolean
}

const BLOK = 8
const PROMIEN_RESZTY = 3
const MAKS_PIKSELI = 12_000_000
const MIN_BLOKOW_TLA = 12
const MIN_BLOKOW_OBIEKTU = 4
const MAKS_PROBEK_TLA = 600
/** Kandydaci na rozmycie szumu — od drobnego po gruboziarniste. */
const KANDYDACI_ROZMYCIA = [0, 0.5, 0.7, 0.9, 1.2, 1.6, 2.0, 2.6, 3.4]

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

/** Rozmycie pudełkowe (poziomo i pionowo) z brzegami przyciętymi do obrazu. */
function rozmyciePudelkowe(l: Float32Array, w: number, h: number, r: number): Float32Array {
  const poziomo = new Float32Array(w * h)
  const sumy = new Float64Array(Math.max(w, h) + 1)
  for (let y = 0; y < h; y++) {
    const o = y * w
    sumy[0] = 0
    for (let x = 0; x < w; x++) sumy[x + 1] = sumy[x] + l[o + x]
    for (let x = 0; x < w; x++) {
      const lo = Math.max(0, x - r)
      const hi = Math.min(w - 1, x + r)
      poziomo[o + x] = (sumy[hi + 1] - sumy[lo]) / (hi - lo + 1)
    }
  }
  const wynik = new Float32Array(w * h)
  for (let x = 0; x < w; x++) {
    sumy[0] = 0
    for (let y = 0; y < h; y++) sumy[y + 1] = sumy[y] + poziomo[y * w + x]
    for (let y = 0; y < h; y++) {
      const lo = Math.max(0, y - r)
      const hi = Math.min(h - 1, y + r)
      wynik[y * w + x] = (sumy[hi + 1] - sumy[lo]) / (hi - lo + 1)
    }
  }
  return wynik
}

/** Reszta: jasność minus jej rozmycie — zostaje ziarno i drobna faktura. */
function reszta(l: Float32Array, w: number, h: number): Float32Array {
  const rozmyta = rozmyciePudelkowe(l, w, h, PROMIEN_RESZTY)
  const r = new Float32Array(w * h)
  for (let i = 0; i < r.length; i++) r[i] = l[i] - rozmyta[i]
  return r
}

/** Moc (RMS) reszty w pełnym bloku 8×8. */
function mocBloku(r: Float32Array, w: number, h: number, bx: number, by: number): number | null {
  const x0 = bx * BLOK
  const y0 = by * BLOK
  if (x0 + BLOK > w || y0 + BLOK > h) return null
  let s2 = 0
  for (let y = y0; y < y0 + BLOK; y++) {
    for (let x = x0; x < x0 + BLOK; x++) s2 += r[y * w + x] * r[y * w + x]
  }
  return Math.sqrt(s2 / (BLOK * BLOK))
}

/** Sumy do korelacji przestrzennej reszty w bloku: moc, lag 1 i lag 2 (poziomo + pionowo). */
function sumyKorelacji(r: Float32Array, w: number, bx: number, by: number) {
  let s0 = 0
  let s1 = 0
  let s2 = 0
  const x0 = bx * BLOK
  const y0 = by * BLOK
  for (let y = y0; y < y0 + BLOK; y++) {
    for (let x = x0; x < x0 + BLOK; x++) {
      const v = r[y * w + x]
      s0 += v * v
      if (x + 1 < x0 + BLOK) s1 += v * r[y * w + x + 1]
      if (x + 2 < x0 + BLOK) s2 += v * r[y * w + x + 2]
      if (y + 1 < y0 + BLOK) s1 += v * r[(y + 1) * w + x]
      if (y + 2 < y0 + BLOK) s2 += v * r[(y + 2) * w + x]
    }
  }
  return { s0, s1, s2 }
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
 * Szum gaussowski o jednostkowym odchyleniu, wygładzony rozmyciem gaussowskim
 * o zadanym sigma (0 = biały). Im większe sigma, tym grubsze „ziarno”.
 */
function szumSkorelowany(w: number, h: number, sigma: number, los: () => number): Float32Array {
  const biały = new Float32Array(w * h)
  for (let i = 0; i < biały.length; i++) {
    const u = Math.max(1e-9, los())
    biały[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * los())
  }
  if (sigma < 0.05) return biały

  const promien = Math.max(1, Math.ceil(3 * sigma))
  const jadro = new Float32Array(2 * promien + 1)
  let suma = 0
  for (let k = -promien; k <= promien; k++) {
    jadro[k + promien] = Math.exp(-(k * k) / (2 * sigma * sigma))
    suma += jadro[k + promien]
  }
  let energia = 0
  for (let k = 0; k < jadro.length; k++) {
    jadro[k] /= suma
    energia += jadro[k] * jadro[k]
  }

  const poziomo = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let k = -promien; k <= promien; k++) {
        const xx = Math.min(w - 1, Math.max(0, x + k))
        s += biały[y * w + xx] * jadro[k + promien]
      }
      poziomo[y * w + x] = s
    }
  }
  // odchylenie białego szumu po dwóch przejściach to sqrt(energia)²
  const norma = 1 / energia
  const wynik = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let k = -promien; k <= promien; k++) {
        const yy = Math.min(h - 1, Math.max(0, y + k))
        s += poziomo[yy * w + x] * jadro[k + promien]
      }
      wynik[y * w + x] = s * norma
    }
  }
  return wynik
}

/**
 * Które rozmycie szumu daje w reszcie taką samą korelację przestrzenną (lag 1 i 2)
 * jak zmierzona na tle — i jaki jest przy tym stosunek mocy reszty do amplitudy szumu.
 * Kalibrujemy na małej próbce: nie zakładamy wzoru, mierzymy tym samym filtrem.
 */
function dobierzRozmycie(r1Tla: number, r2Tla: number): { sigma: number; wzmocnienie: number } {
  const bok = 96
  const margines = 8
  let najlepszy = { sigma: 0, wzmocnienie: 1, blad: Infinity }
  for (const sigma of KANDYDACI_ROZMYCIA) {
    const los = losowy(0x1f123bb5 + Math.round(sigma * 100))
    const szum = szumSkorelowany(bok, bok, sigma, los)
    const rp = reszta(szum, bok, bok)
    let s0 = 0
    let s1 = 0
    let s2 = 0
    for (let y = margines; y < bok - margines; y++) {
      for (let x = margines; x < bok - margines; x++) {
        const v = rp[y * bok + x]
        s0 += v * v
        s1 += v * rp[y * bok + x + 1] + v * rp[(y + 1) * bok + x]
        s2 += v * rp[y * bok + x + 2] + v * rp[(y + 2) * bok + x]
      }
    }
    // s1 i s2 zbierają dwa kierunki, więc normalizujemy przez 2·s0
    const r1 = s1 / (2 * s0)
    const r2 = s2 / (2 * s0)
    const blad = (r1 - r1Tla) ** 2 + (r2 - r2Tla) ** 2
    const n = (bok - 2 * margines) ** 2
    if (blad < najlepszy.blad) najlepszy = { sigma, wzmocnienie: Math.sqrt(s0 / n), blad }
  }
  return { sigma: najlepszy.sigma, wzmocnienie: Math.max(0.05, najlepszy.wzmocnienie) }
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

/** Czy oryginał jest praktycznie bez koloru (czarno-biały skan, fotografia mono). */
function czyMonochromatyczny(p: Piksele): boolean {
  const d = p.data
  let suma = 0
  let n = 0
  for (let i = 0; i < d.length; i += 4 * 11) {
    suma += Math.abs(d[i] - d[i + 1]) + Math.abs(d[i + 1] - d[i + 2])
    n++
  }
  return n > 0 && suma / n <= 3
}

/** Interpolacja dwuliniowa wartości z siatki komórek 8×8 do piksela (x, y). */
function zSiatki(siatka: Float32Array, gw: number, gh: number, x: number, y: number): number {
  const fy = Math.min(gh - 1, Math.max(0, (y + 0.5) / BLOK - 0.5))
  const y0 = Math.floor(fy)
  const y1 = Math.min(gh - 1, y0 + 1)
  const ty = fy - y0
  const fx = Math.min(gw - 1, Math.max(0, (x + 0.5) / BLOK - 0.5))
  const x0 = Math.floor(fx)
  const x1 = Math.min(gw - 1, x0 + 1)
  const tx = fx - x0
  return (
    (siatka[y0 * gw + x0] * (1 - tx) + siatka[y0 * gw + x1] * tx) * (1 - ty) +
    (siatka[y1 * gw + x0] * (1 - tx) + siatka[y1 * gw + x1] * tx) * ty
  )
}

/**
 * Poprawia ziarno i medium w obszarze zmiany. Zmienia `wynik` w miejscu.
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

  const rr = reszta(lr, w, h)

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

  const tlo: { moc: number; bx: number; by: number }[] = []
  const wnetrze: number[] = []
  const krokTla = Math.max(1, Math.floor((gw * gh) / MAKS_PROBEK_TLA))
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      const k = cy * gw + cx
      if (obszar[k]) {
        const wewnatrz =
          cx > 0 && cy > 0 && cx < gw - 1 && cy < gh - 1 && obszar[k - 1] && obszar[k + 1] && obszar[k - gw] && obszar[k + gw]
        if (wewnatrz) {
          const m = mocBloku(rr, w, h, cx, cy)
          if (m !== null) wnetrze.push(m)
        }
      } else if (k % krokTla === 0 && !wObszarze(cx, cy, 2)) {
        const m = mocBloku(rr, w, h, cx, cy)
        if (m !== null) tlo.push({ moc: m, bx: cx, by: cy })
      }
    }
  }
  if (tlo.length < MIN_BLOKOW_TLA || wnetrze.length < MIN_BLOKOW_OBIEKTU) return null

  const ziarnoTla = mediana(tlo.map(b => b.moc))
  const przed = mediana(wnetrze)
  const mono = czyMonochromatyczny(oryginal)
  const d = wynik.data

  // ── ziarno ────────────────────────────────────────────────────────
  let dosypanoZiarno = false
  let rozmycie = 0
  let po = przed
  if (przed < ziarnoTla * 0.85) {
    // korelacja przestrzenna ziarna tła — tylko z bloków płaskich (bez krawędzi)
    let s0 = 0
    let s1 = 0
    let s2 = 0
    for (const b of tlo) {
      if (b.moc < ziarnoTla * 0.6 || b.moc > ziarnoTla * 1.3) continue
      const s = sumyKorelacji(rr, w, b.bx, b.by)
      s0 += s.s0
      s1 += s.s1
      s2 += s.s2
    }
    // każda para pikseli liczona w dwóch kierunkach: normalizujemy przez 2·s0;
    // w bloku 8×8 jest 7/8 par dla lag 1 i 6/8 dla lag 2 — korygujemy, bo kalibracja
    // na próbce liczy prawie wszystkie pary
    const r1 = s0 > 0 ? Math.max(-0.5, Math.min(0.95, (s1 / (2 * s0)) * (BLOK / (BLOK - 1)))) : 0
    const r2 = s0 > 0 ? Math.max(-0.5, Math.min(0.95, (s2 / (2 * s0)) * (BLOK / (BLOK - 2)))) : 0
    const dobrane = dobierzRozmycie(r1, r2)
    rozmycie = dobrane.sigma

    // amplituda szumu w każdej komórce obszaru (w skali pikseli)
    const dosypka = new Float32Array(gw * gh)
    for (let cy = 0; cy < gh; cy++) {
      for (let cx = 0; cx < gw; cx++) {
        const k = cy * gw + cx
        if (!obszar[k]) continue
        const m = mocBloku(rr, w, h, cx, cy)
        if (m === null) continue
        const brak = Math.sqrt(Math.max(0, ziarnoTla * ziarnoTla - m * m))
        dosypka[k] = Math.min(40, brak / dobrane.wzmocnienie)
      }
    }
    // wygładzenie siatki tylko między komórkami, które dostają szum
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

    // ramka obszaru z marginesem — szum generujemy tylko tam
    let minX = w
    let minY = h
    let maxX = 0
    let maxY = 0
    for (let cy = 0; cy < gh; cy++) {
      for (let cx = 0; cx < gw; cx++) {
        if (gladka[cy * gw + cx] > 0) {
          minX = Math.min(minX, cx * BLOK)
          minY = Math.min(minY, cy * BLOK)
          maxX = Math.max(maxX, Math.min(w, (cx + 1) * BLOK))
          maxY = Math.max(maxY, Math.min(h, (cy + 1) * BLOK))
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      const bw = maxX - minX
      const bh = maxY - minY
      const szum = szumSkorelowany(bw, bh, rozmycie, losowy(0x51ed270b))
      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          const sila = zSiatki(gladka, gw, gh, x, y)
          if (sila < 0.05) continue
          const dodatek = szum[(y - minY) * bw + (x - minX)] * sila
          const j = (y * w + x) * 4
          d[j] = Math.min(255, Math.max(0, d[j] + dodatek))
          d[j + 1] = Math.min(255, Math.max(0, d[j + 1] + dodatek))
          d[j + 2] = Math.min(255, Math.max(0, d[j + 2] + dodatek))
        }
      }
      dosypanoZiarno = true

      // ponowny pomiar tych samych bloków po korekcie
      const rp = reszta(jasnosc(wynik), w, h)
      const mocePo: number[] = []
      for (let cy = 1; cy < gh - 1; cy++) {
        for (let cx = 1; cx < gw - 1; cx++) {
          const k = cy * gw + cx
          if (obszar[k] && obszar[k - 1] && obszar[k + 1] && obszar[k - gw] && obszar[k + gw]) {
            const m = mocBloku(rp, w, h, cx, cy)
            if (m !== null) mocePo.push(m)
          }
        }
      }
      po = mediana(mocePo)
    }
  }

  // ── medium: czarno-biały oryginał → obszar zmiany bez koloru ─────────
  let odbarwiono = false
  if (mono) {
    const alfa = new Float32Array(gw * gh)
    for (let cy = 0; cy < gh; cy++) {
      for (let cx = 0; cx < gw; cx++) {
        let s = 0
        let n = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const x = cx + dx
            const y = cy + dy
            if (x >= 0 && y >= 0 && x < gw && y < gh) {
              s += obszar[y * gw + x]
              n++
            }
          }
        }
        alfa[cy * gw + cx] = s / n
      }
    }
    let zmiany = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = zSiatki(alfa, gw, gh, x, y)
        if (a < 0.02) continue
        const j = (y * w + x) * 4
        const szary = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]
        const dr = (szary - d[j]) * a
        const dg = (szary - d[j + 1]) * a
        const db = (szary - d[j + 2]) * a
        if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) > 1.5) zmiany++
        d[j] += dr
        d[j + 1] += dg
        d[j + 2] += db
      }
    }
    odbarwiono = zmiany > 0
  }

  if (!dosypanoZiarno && !odbarwiono) return null
  return {
    ziarnoTla,
    ziarnoObiektuPrzed: przed,
    ziarnoObiektuPo: po,
    udzialObszaru: udzial,
    rozmycieZiarna: rozmycie,
    odbarwiono,
    dosypanoZiarno,
  }
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
    if (!statystyki) {
      console.info('[canvas] ziarno: bez korekty (obszar zmiany niepewny albo obiekt ma już ziarno tła)')
      return wynikSrc
    }

    gw.putImageData(daneWyniku, 0, 0)
    console.info('[canvas] dopasowano ziarno i medium obiektu', statystyki)
    return plotnoWyniku.toDataURL('image/jpeg', 0.95)
  } catch {
    return wynikSrc
  }
}
