import { useEffect, useRef } from 'react'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'

/* Lewy panel onboardingu — „film” z cząsteczek, w miejscu wideo ze wzoru.
   Leci bez przerwy i niezależnie od tego, co użytkownik klika: nic się tu
   samo nie zaznacza, to tło jak klip. Temat: człowiek łączy się z AI.

   Jedna warstwa canvas, która NIE jest montowana od nowa między krokami —
   zmiana kroku to kolejny rozdział filmu: te same cząsteczki przelatują
   z poprzedniej formacji w nową. Stałe elementy:
   - teren z pyłu (falujące pagórki z kropek) i migoczące gwiazdy,
   - wiatr, który odrywa pojedyncze cząsteczki od figur i niesie je w bok,
   - człowiek z drobnych kropek (halftone), AI z siatki w kolorze akcentu.
   Kolory z tokenów motywu, czytane na żywo z CSS. */

export type IdSceny = 'przestrzen' | 'cele' | 'poziom' | 'moduly' | 'funkcje' | 'zrodla' | 'problem'

const KOLEJNOSC: IdSceny[] = ['przestrzen', 'cele', 'poziom', 'moduly', 'funkcje', 'zrodla', 'problem']
const W = 400
const H = 560
const N = 2700

export function StyleScen() {
  return (
    <style>{`
      @keyframes nbFilmEtykieta { from { opacity: 0; transform: translateY(4px) } }
      .nb-film-etykieta { animation: nbFilmEtykieta 500ms cubic-bezier(.2,.9,.25,1) both }
      @media (prefers-reduced-motion: reduce) { .nb-film-etykieta { animation: none } }
    `}</style>
  )
}

/* ══ Formacje (rozdziały filmu) ═══════════════════════════════════════ */

type Cel = { x: number; y: number; ak: boolean }
type Proc = (i: number, t: number) => [number, number, boolean, number]
interface Rozdzial {
  kod: string
  podkod: string
  /** punkt skupienia — tam celuje HUD */
  ognisko: [number, number]
  cele?: Cel[]
  proc?: Proc
  ile: number
  /** pierścienie rozchodzące się z ogniska (moment dotyku) */
  pierscienie?: boolean
  /** tło rozdziału — każde inne, przenikają się przy zmianie kroku */
  tlo: Tlo
  /** sposób, w jaki cząsteczki wchodzą w nową formację */
  wejscie: Wejscie
}

export type Tlo = 'wydmy' | 'deszcz' | 'podloga' | 'radar' | 'warp' | 'orbity' | 'przeplyw' | 'skan'

/** Deterministyczny „los” dla indeksu cząsteczki (0–1). */
const los = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/* Krok 5: funkcje jako jeden łańcuch pracy — węzły (obraz, upscale, wideo,
   dźwięk, notatki, research) połączone strumieniami, które płyną od jednej
   funkcji do kolejnej. */
const WEZLY_FUNKCJI: [number, number][] = [[86, 150], [232, 118], [322, 232], [192, 292], [88, 404], [272, 436]]
const LINKI_FUNKCJI: [number, number, boolean][] = [[0, 1, true], [1, 2, true], [2, 3, true], [3, 4, true], [4, 5, true], [0, 3, false], [2, 5, false]]
const procPolaczone: Proc = (i, t) => {
  if (i < 900) {
    // węzeł: gęsty dysk z obracającym się pierścieniem akcentu
    const k = i % 6, j = Math.floor(i / 6)
    const [nx, ny] = WEZLY_FUNKCJI[k]
    if (j > 115) {
      const a = (j / 35) * Math.PI * 2 + t * (k % 2 ? 0.8 : -0.8)
      return [nx + Math.cos(a) * 25, ny + Math.sin(a) * 25, true, 0.9]
    }
    const r = 17 * Math.sqrt(j / 115)
    const a = j * 2.39996
    return [nx + Math.cos(a) * r, ny + Math.sin(a) * r, false, 1]
  }
  // strumienie między węzłami
  const [a, b, glowny] = LINKI_FUNKCJI[i % LINKI_FUNKCJI.length]
  const [ax, ay] = WEZLY_FUNKCJI[a], [bx, by] = WEZLY_FUNKCJI[b]
  const f = (t * 0.38 + i * 0.6180339) % 1
  const mx = (ax + bx) / 2 - (by - ay) * 0.18, my = (ay + by) / 2 + (bx - ax) * 0.18
  const x = (1 - f) * (1 - f) * ax + 2 * (1 - f) * f * mx + f * f * bx
  const y = (1 - f) * (1 - f) * ay + 2 * (1 - f) * f * my + f * f * by
  return [x, y, glowny, 0.35 + 0.65 * Math.sin(Math.PI * f)]
}

/* Krok 6: telefon z przewijanym feedem; z boków wpadają strumienie
   z różnych kanałów (TikTok, YouTube, Google…), a feed jedzie w górę. */
const TEL = { cx: 200, cy: 262, w: 150, h: 300 }
const procTelefon: Proc = (i, t) => {
  const gora = TEL.cy - TEL.h / 2, dol = TEL.cy + TEL.h / 2
  if (i < 560) {
    // obudowa: superelipsa ≈ prostokąt o zaokrąglonych rogach
    const q = (i / 560) * Math.PI * 2
    const c = Math.cos(q), s = Math.sin(q)
    return [TEL.cx + Math.sign(c) * Math.pow(Math.abs(c), 0.16) * TEL.w / 2, TEL.cy + Math.sign(s) * Math.pow(Math.abs(s), 0.16) * TEL.h / 2, false, 1]
  }
  if (i < 600) return [TEL.cx - 18 + ((i - 560) / 40) * 36, gora + 14, false, 0.9]
  if (i < 1560) {
    // feed: 4 karty jadące w górę w pętli
    const j = i - 600
    const karta = j % 4, n = Math.floor(j / 4)
    const yK = ((karta * 86 - t * 24) % 344 + 344) % 344 + gora + 30
    const lx = TEL.cx - 59, ly = yK
    const r = los(i)
    let x: number, y: number, akc = false
    if (n < 90) {
      // obrys karty
      const p = n / 90
      const obw = 2 * (118 + 70)
      const d = p * obw
      if (d < 118) { x = lx + d; y = ly } else if (d < 188) { x = lx + 118; y = ly + d - 118 } else if (d < 306) { x = lx + 118 - (d - 188); y = ly + 70 } else { x = lx; y = ly + 70 - (d - 306) }
    } else if (n < 120) {
      // awatar kanału + linia tekstu
      const a = (n / 30) * Math.PI * 2
      x = lx + 12 + Math.cos(a) * 6; y = ly + 12 + Math.sin(a) * 6; akc = karta % 2 === 0
    } else if (n < 140) {
      x = lx + 24 + ((n - 120) / 20) * 60; y = ly + 12
    } else {
      // kadr posta — gęsto wypełniony prostokąt
      x = lx + 8 + r * 102; y = ly + 26 + los(i * 3) * 38
    }
    const widoczny = y > gora + 26 && y < dol - 22
    return [x, y, akc, widoczny ? 0.9 : -1]
  }
  // strumienie z kanałów wpadające z boków do telefonu
  const z = i % 6
  const lewa = z < 3
  const sy = 140 + (z % 3) * 125
  const sx = lewa ? 8 : 392
  const ex = TEL.cx + (lewa ? -TEL.w / 2 : TEL.w / 2), ey = TEL.cy - 40 + (z % 3) * 40
  const f = (t * 0.45 + i * 0.6180339) % 1
  const mx = (sx + ex) / 2, my = sy - 30
  const x = (1 - f) * (1 - f) * sx + 2 * (1 - f) * f * mx + f * f * ex
  const y = (1 - f) * (1 - f) * sy + 2 * (1 - f) * f * my + f * f * ey
  return [x, y, z % 2 === 0, 0.25 + 0.75 * f]
}
type Wejscie = 'wznies' | 'implozja' | 'zamiec' | 'wybuch' | 'wir' | 'orbita'

/* Krok 2: prompt spływa wiązką do pryzmatu i rozchodzi się na 6 promieni.
   Cząsteczki płyną po torach bez przerwy — formacja żyje sama z siebie. */
const CELE_PROMIENI = [60, 116, 172, 228, 284, 340]
const procPryzmat: Proc = (i, t) => {
  // pierwsze 260 cząsteczek: kontur pryzmatu (romb) — stoi w miejscu
  if (i < 260) {
    const b = (i / 260) * 4
    const k = Math.floor(b), f = b - k
    const R: [number, number][] = [[200, 176], [236, 226], [200, 276], [164, 226]]
    const [ax, ay] = R[k % 4], [bx, by] = R[(k + 1) % 4]
    return [ax + (bx - ax) * f, ay + (by - ay) * f, false, 1]
  }
  // kolejne 360: małe pierścienie celów na dole
  if (i < 620) {
    const j = i - 260
    const k = j % 6
    const a = (j / 360) * Math.PI * 2 * 6
    return [CELE_PROMIENI[k] + Math.cos(a) * 12, 452 + Math.sin(a) * 12, true, 0.9]
  }
  // reszta: strumień — wiązka z góry do pryzmatu, potem promień do celu
  const k = i % 6
  const f = (t * 0.32 + i * 0.6180339) % 1
  if (f < 0.38) {
    const g = f / 0.38
    return [200 + Math.sin(i) * 3, 70 + g * 150, false, 0.5 + g * 0.5]
  }
  const g = (f - 0.38) / 0.62
  const tx = CELE_PROMIENI[k]
  const cx = 200, cy = 330
  const x = (1 - g) * (1 - g) * 200 + 2 * (1 - g) * g * cx + g * g * tx
  const y = (1 - g) * (1 - g) * 226 + 2 * (1 - g) * g * cy + g * g * 440
  return [x, y, true, 1 - g * 0.3]
}

/** Losuje punkty z maski: im jaśniejszy piksel, tym gęściej (efekt halftone). */
function probkuj(rysuj: (ctx: CanvasRenderingContext2D) => void, ile: number): Cel[] {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  rysuj(ctx)
  const d = ctx.getImageData(0, 0, W, H).data
  const kand: Cel[] = []
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4
      const a = d[i + 3] / 255
      if (a > 0.04 && Math.random() < a) kand.push({ x: x + Math.random() * 2, y: y + Math.random() * 2, ak: d[i] > 200 && d[i + 1] < 90 })
    }
  }
  for (let i = kand.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[kand[i], kand[j]] = [kand[j], kand[i]]
  }
  return kand.slice(0, ile)
}

/** Sylwetka idąca w prawo z wyciągniętą ręką; (x0, y0) = stopy. */
function sylwetka(ctx: CanvasRenderingContext2D, x0: number, y0: number, s: number, lustro: boolean) {
  ctx.save()
  ctx.translate(x0, y0)
  ctx.scale(lustro ? -s : s, s)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.arc(0, -168, 15, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-21, -146); ctx.lineTo(21, -146); ctx.lineTo(17, -76); ctx.lineTo(-15, -76); ctx.closePath(); ctx.fill()
  ctx.lineWidth = 13
  ctx.beginPath(); ctx.moveTo(-9, -80); ctx.lineTo(-20, -2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(8, -80); ctx.lineTo(20, -2); ctx.stroke()
  ctx.lineWidth = 9
  ctx.beginPath(); ctx.moveTo(-19, -140); ctx.lineTo(-25, -86); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(19, -140); ctx.lineTo(52, -122); ctx.lineTo(80, -122); ctx.stroke()
  ctx.restore()
}

/** Człowiek: pełna sylwetka z cieniowaniem (gęstość = światło). */
function czlowiek(ctx: CanvasRenderingContext2D, x0: number, y0: number, s: number) {
  const g = ctx.createLinearGradient(x0 - 40, 0, x0 + 80, 0)
  g.addColorStop(0, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,1)')
  ctx.fillStyle = g
  ctx.strokeStyle = g
  sylwetka(ctx, x0, y0, s, false)
}

/** AI: ta sama sylwetka w lustrze, ale tylko na liniach siatki — wireframe. */
function ai(ctx: CanvasRenderingContext2D, x0: number, y0: number, s: number) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const k = c.getContext('2d')
  if (!k) return
  k.fillStyle = 'rgb(255,0,0)'
  k.strokeStyle = 'rgb(255,0,0)'
  sylwetka(k, x0, y0, s, true)
  k.globalCompositeOperation = 'destination-in'
  k.strokeStyle = '#000'
  k.lineWidth = 1.6
  k.beginPath()
  for (let y = 0; y < H; y += 7) { k.moveTo(0, y); k.lineTo(W, y + 3) }
  for (let x = 0; x < W; x += 7) { k.moveTo(x, 0); k.lineTo(x - 4, H) }
  k.stroke()
  ctx.drawImage(c, 0, 0)
}

const S = 1.25
const STOPY = 432

function zbudujRozdzialy(): Rozdzial[] {
  const rece = STOPY - 122 * S
  return [
    {
      kod: 'SEQ_01 · HUMAN_INPUT', podkod: 'SIGNAL_01', ognisko: [150 + 80 * S, rece], ile: 1500,
      tlo: 'wydmy', wejscie: 'wznies',
      cele: probkuj(ctx => czlowiek(ctx, 150, STOPY, S), 1500),
    },
    {
      kod: 'SEQ_02 · PROMPT_SPLIT', podkod: 'OUT_x6', ognisko: [200, 226], ile: 2400,
      tlo: 'deszcz', wejscie: 'implozja', proc: procPryzmat,
    },
    {
      kod: 'SEQ_03 · LINK_ESTABLISHED', podkod: 'TRUST_001', ognisko: [220, rece], ile: 2300, pierscienie: true,
      tlo: 'podloga', wejscie: 'zamiec',
      cele: probkuj(ctx => { czlowiek(ctx, 106, STOPY, S); ai(ctx, 334, STOPY, S) }, 2300),
    },
    {
      kod: 'SEQ_04 · NEURAL_MESH', podkod: 'NODES_14', ognisko: [200, 250], ile: 1800,
      tlo: 'radar', wejscie: 'wybuch',
      cele: probkuj(ctx => {
        const w: [number, number][] = [
          [200, 250], [120, 180], [280, 170], [90, 280], [310, 290], [160, 340], [250, 350],
          [200, 140], [60, 200], [345, 215], [130, 410], [280, 420], [200, 420], [230, 210],
        ]
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth = 2.4
        ctx.beginPath()
        w.forEach(([x, y], i) => { const [a, b] = w[(i * 5 + 3) % w.length]; ctx.moveTo(x, y); ctx.lineTo(a, b); const [c2, d2] = w[0]; ctx.moveTo(x, y); ctx.lineTo(c2, d2) })
        ctx.stroke()
        w.forEach(([x, y], i) => {
          ctx.fillStyle = i % 3 === 0 ? 'rgb(255,0,0)' : 'rgba(255,255,255,1)'
          ctx.beginPath(); ctx.arc(x, y, i === 0 ? 22 : 11, 0, Math.PI * 2); ctx.fill()
        })
      }, 1800),
    },
    {
      kod: 'SEQ_05 · FEATURE_CHAIN', podkod: 'LINKED_x6', ognisko: [190, 290], ile: 2100,
      tlo: 'warp', wejscie: 'wir', proc: procPolaczone,
    },
    {
      kod: 'SEQ_06 · SOURCE_FEED', podkod: 'FEED_LIVE', ognisko: [275, 150], ile: 2100,
      tlo: 'skan', wejscie: 'zamiec', proc: procTelefon,
    },
    {
      kod: 'SEQ_07 · NEXTBYTE', podkod: 'READY', ognisko: [200, 250], ile: 2100,
      tlo: 'przeplyw', wejscie: 'implozja',
      cele: probkuj(ctx => {
        ctx.save()
        ctx.translate(200, 252)
        ctx.scale(0.3, 0.3)
        ctx.translate(-599.5, -433)
        ctx.fillStyle = 'rgb(255,0,0)'
        for (const d of ['M299,65.5 L298,225 L900,800.5 L900,641 Z', 'M784,68 L900,68 L900,460 L784,460 Z', 'M299,264 L416,377 L415,797 L298,797 Z', 'M900,489 L784.5,490 L900,600.5 Z']) ctx.fill(new Path2D(d))
        ctx.restore()
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(200, 252, 150, 0, Math.PI * 2); ctx.stroke()
      }, 2100),
    },
  ]
}

/* ══ Teren z pyłu ══════════════════════════════════════════════════════ */
export function teren(u: number, v: number, t: number): [number, number, number] {
  const x = u * 1.25
  const z = 0.75 + v * 5.2
  const y = 0.32 * Math.sin(u * 3.1 + t * 0.55 + v * 3.6) + 0.18 * Math.sin(v * 7 - t * 0.7) + 0.1 * Math.sin(u * 9 + v * 2)
  return [200 + (x / z) * 330, 300 + ((1.25 - y * 0.75) / z) * 170, 1 - v * 0.75]
}

/* ══ Wejścia — skąd cząsteczki przylatują do nowej formacji ════════════ */
function wejdz(rodzaj: Wejscie, px: Float32Array, py: Float32Array, vx: Float32Array, vy: Float32Array) {
  for (let i = 0; i < N; i++) {
    const los = Math.random()
    const kat = Math.random() * Math.PI * 2
    switch (rodzaj) {
      case 'wznies': // z ziemi, od dołu kadru
        px[i] = Math.random() * W; py[i] = H + Math.random() * 60; vx[i] = 0; vy[i] = -los * 2
        break
      case 'implozja': // z okręgu daleko poza kadrem do środka
        px[i] = 200 + Math.cos(kat) * (300 + los * 80); py[i] = 260 + Math.sin(kat) * (300 + los * 80); vx[i] = 0; vy[i] = 0
        break
      case 'zamiec': // wjeżdżają z lewej, jak przeciągnięte
        px[i] = -20 - los * 280; vx[i] = 4 + los * 3; vy[i] = 0
        break
      case 'wybuch': // ze środka na zewnątrz
        px[i] = 200 + (Math.random() - 0.5) * 8; py[i] = 250 + (Math.random() - 0.5) * 8
        vx[i] = Math.cos(kat) * (4 + los * 10); vy[i] = Math.sin(kat) * (4 + los * 10)
        break
      case 'wir': // obecne pozycje dostają ruch obrotowy wokół środka
        vx[i] += -(py[i] - 250) * 0.07; vy[i] += (px[i] - 200) * 0.07
        break
      case 'orbita': // z szerokiej, spłaszczonej orbity
        px[i] = 200 + Math.cos(kat) * 260; py[i] = 250 + Math.sin(kat) * 110; vx[i] = -Math.sin(kat) * 5; vy[i] = Math.cos(kat) * 2
        break
    }
  }
}

/* ══ Tła rozdziałów ════════════════════════════════════════════════════ */
export interface StanTla {
  gwiazdy: [number, number, number][]
  warp: { x: number; y: number; z: number }[]
  przeplyw: { x: number; y: number }[]
  krople: { x: number; y: number; v: number; ak: boolean }[]
}

export function nowyStanTla(): StanTla {
  return {
    gwiazdy: Array.from({ length: 90 }, () => [Math.random() * W, Math.random() * 300, Math.random() * 6.28]),
    warp: Array.from({ length: 170 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() })),
    przeplyw: Array.from({ length: 420 }, () => ({ x: Math.random() * W, y: Math.random() * H })),
    krople: Array.from({ length: 46 }, (_, i) => ({ x: (i + 0.5) * (W / 46), y: Math.random() * H, v: 40 + Math.random() * 90, ak: i % 7 === 0 })),
  }
}

export function rysujTlo(ctx: CanvasRenderingContext2D, tlo: Tlo, t: number, a: number, fg: string, pr: string, stan: StanTla) {
  if (a <= 0) return
  ctx.fillStyle = fg
  ctx.strokeStyle = fg
  switch (tlo) {
    case 'wydmy': {
      for (const [x, y, f] of stan.gwiazdy) {
        ctx.globalAlpha = a * (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + f * 3)))
        ctx.fillRect(x, y, 1.1, 1.1)
      }
      for (let j = 0; j < 34; j++) {
        const v = j / 33
        for (let k = 0; k < 74; k++) {
          const [x, y, al] = teren(k / 73 * 2 - 1, v, t)
          if (x < -5 || x > W + 5) continue
          ctx.globalAlpha = a * al * 0.38
          const sz = 0.7 + (1 - v) * 0.9
          ctx.fillRect(x, y, sz, sz)
        }
      }
      break
    }
    case 'deszcz': {
      // deszcz danych: kolumny kropel spadających z różną prędkością
      for (const k of stan.krople) {
        const y0 = ((k.y + t * k.v) % (H + 80)) - 40
        ctx.fillStyle = k.ak ? pr : fg
        for (let n = 0; n < 9; n++) {
          ctx.globalAlpha = a * (k.ak ? 0.5 : 0.22) * (1 - n / 9)
          ctx.fillRect(k.x, y0 - n * 7, 1.4, 3)
        }
      }
      break
    }
    case 'podloga': {
      // perspektywiczna podłoga: linie zbiegają się w punkcie zbiegu, poprzeczne jadą do widza
      const hor = 330
      ctx.lineWidth = 0.8
      for (let k = -12; k <= 12; k++) {
        ctx.globalAlpha = a * 0.13
        ctx.beginPath(); ctx.moveTo(200 + k * 6, hor); ctx.lineTo(200 + k * 60, H); ctx.stroke()
      }
      for (let n = 0; n < 12; n++) {
        const z = ((n / 12 + t * 0.12) % 1)
        const y = hor + Math.pow(z, 2.2) * (H - hor)
        ctx.globalAlpha = a * 0.22 * z
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      ctx.globalAlpha = a * 0.25
      ctx.beginPath(); ctx.moveTo(0, hor); ctx.lineTo(W, hor); ctx.stroke()
      break
    }
    case 'radar': {
      // koncentryczne okręgi z kropek i wiązka radaru z zanikającym ogonem
      for (let r = 60; r <= 240; r += 45) {
        for (let k = 0; k < r * 0.9; k++) {
          const q = (k / (r * 0.9)) * Math.PI * 2
          ctx.globalAlpha = a * 0.18
          ctx.fillRect(200 + Math.cos(q) * r, 250 + Math.sin(q) * r, 1.1, 1.1)
        }
      }
      const kat = t * 1.2
      ctx.lineWidth = 1
      for (let n = 0; n < 24; n++) {
        const q = kat - n * 0.035
        ctx.globalAlpha = a * 0.35 * (1 - n / 24)
        ctx.strokeStyle = pr
        ctx.beginPath(); ctx.moveTo(200, 250); ctx.lineTo(200 + Math.cos(q) * 240, 250 + Math.sin(q) * 240); ctx.stroke()
      }
      break
    }
    case 'warp': {
      // przelot przez gwiazdy: punkty uciekają od środka, zostawiając smugi
      ctx.lineWidth = 1
      for (const g of stan.warp) {
        g.z -= 0.006
        if (g.z <= 0.02) { g.z = 1; g.x = Math.random() * 2 - 1; g.y = Math.random() * 2 - 1 }
        const sx = 200 + (g.x / g.z) * 90, sy = 250 + (g.y / g.z) * 90
        const sx2 = 200 + (g.x / (g.z + 0.04)) * 90, sy2 = 250 + (g.y / (g.z + 0.04)) * 90
        ctx.globalAlpha = a * Math.min(0.6, (1 - g.z) * 0.8)
        ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(sx, sy); ctx.stroke()
      }
      break
    }
    case 'skan': {
      // linie skanu jak w transmisji: cienkie poziome pasy jadą w dół, jeden jaśniejszy
      for (let n = 0; n < 28; n++) {
        const y = ((n / 28) * H + t * 18) % H
        ctx.globalAlpha = a * 0.07
        ctx.fillRect(0, y, W, 1)
      }
      const yS = (t * 70) % (H + 60) - 30
      for (let n = 0; n < 14; n++) {
        ctx.globalAlpha = a * 0.16 * (1 - n / 14)
        ctx.fillStyle = pr
        ctx.fillRect(0, yS - n * 2, W, 1)
      }
      break
    }
    case 'orbity': {
      // trzy nachylone orbity z satelitami
      const orb = [[190, 60, -0.35], [210, 74, 0.25], [170, 46, 0.9]] as const
      orb.forEach(([rx, ry, rot], i) => {
        ctx.save()
        ctx.translate(200, 245)
        ctx.rotate(rot)
        ctx.globalAlpha = a * 0.16
        ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke()
        for (let s = 0; s < 3; s++) {
          const q = t * (0.6 + i * 0.25) + s * 2.1
          ctx.globalAlpha = a * 0.9
          ctx.fillStyle = s === 0 ? pr : fg
          ctx.fillRect(Math.cos(q) * rx - 1.5, Math.sin(q) * ry - 1.5, 3, 3)
        }
        ctx.restore()
      })
      break
    }
    case 'przeplyw': {
      // pole przepływu: krótkie kreski płynące po polu wektorowym
      for (const p of stan.przeplyw) {
        const kat = Math.sin(p.x * 0.012 + t * 0.4) + Math.cos(p.y * 0.014 - t * 0.3)
        p.x += Math.cos(kat * 2) * 0.9
        p.y += Math.sin(kat * 2) * 0.9
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.x = Math.random() * W; p.y = Math.random() * H }
        ctx.globalAlpha = a * 0.22
        ctx.fillRect(p.x, p.y, 1.2, 1.2)
      }
      break
    }
  }
  ctx.globalAlpha = 1
}

/* ══ Film ══════════════════════════════════════════════════════════════ */
function Film({ rozdzial }: { rozdzial: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const rozdzialRef = useRef(rozdzial)
  rozdzialRef.current = rozdzial

  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const rozdzialy = zbudujRozdzialy()
    const bezRuchu = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Stan cząsteczek — tablice typowane, bo to kilka tysięcy punktów na klatkę
    const px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N)
    const tx = new Float32Array(N), ty = new Float32Array(N), alfa = new Float32Array(N)
    const ak = new Uint8Array(N), su = new Float32Array(N), sv = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      su[i] = Math.random() * 2 - 1
      sv[i] = Math.random()
      px[i] = Math.random() * W
      py[i] = H + Math.random() * 40
    }
    const stan = nowyStanTla()

    let aktywny = -1
    let poprzednieTlo: Tlo | null = null
    let zmiana = 0
    let raf = 0
    const t0 = performance.now()
    let kolory = { fg: '0 0% 96%', pr: '204 91% 70%' }
    let ostatnieKolory = -1

    const klatka = (teraz: number) => {
      if (!bezRuchu) raf = requestAnimationFrame(klatka)
      const t = (teraz - t0) / 1000
      if (t - ostatnieKolory > 0.5) {
        const st = getComputedStyle(c)
        kolory = { fg: st.getPropertyValue('--foreground').trim() || kolory.fg, pr: st.getPropertyValue('--primary').trim() || kolory.pr }
        ostatnieKolory = t
      }
      const rz = rozdzialy[Math.min(rozdzialRef.current, rozdzialy.length - 1)]
      if (rozdzialRef.current !== aktywny) {
        poprzednieTlo = aktywny >= 0 ? rozdzialy[Math.min(aktywny, rozdzialy.length - 1)].tlo : null
        aktywny = rozdzialRef.current
        zmiana = t
        wejdz(rz.wejscie, px, py, vx, vy)
      }

      // rozmiar
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.max(1, Math.round(r.height * dpr))
      if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch }
      const s = Math.min(r.width / W, r.height / H)
      const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr)

      // tło rozdziału — przenika się z poprzednim przez ~1 s
      const przejscie = bezRuchu ? 1 : Math.min(1, (t - zmiana) / 1.1)
      const fg = `hsl(${kolory.fg})`, pr = `hsl(${kolory.pr})`
      if (poprzednieTlo && poprzednieTlo !== rz.tlo && przejscie < 1) rysujTlo(ctx, poprzednieTlo, t, 1 - przejscie, fg, pr, stan)
      rysujTlo(ctx, rz.tlo, t, przejscie, fg, pr, stan)

      // cele cząsteczek
      for (let i = 0; i < N; i++) {
        let celX: number, celY: number, a = 1
        let akc = false
        if (i < rz.ile && rz.proc) {
          const [x, y, aa, al] = rz.proc(i, t)
          celX = x; celY = y; akc = aa; a = al
        } else if (i < rz.ile && rz.cele && i < rz.cele.length) {
          const cel = rz.cele[i]
          celX = cel.x + Math.sin(t * 1.3 + i) * 0.6
          celY = cel.y + Math.cos(t * 1.1 + i * 0.7) * 0.6
          akc = cel.ak
        } else if (rz.tlo === 'wydmy') {
          // nadmiarowe cząsteczki leżą jako pył na wydmach
          const [x, y, aa] = teren(su[i], sv[i], t)
          celX = x; celY = y - 1; a = aa * 0.6
        } else {
          // w innych rozdziałach nadmiar gaśnie tam, gdzie jest
          celX = px[i]; celY = py[i]; a = -1
        }
        tx[i] = celX; ty[i] = celY; alfa[i] = a; ak[i] = akc ? 1 : 0
      }

      // fizyka: sprężyna do celu + tłumienie; świeża zmiana = luźniejsza sprężyna
      const k = Math.min(0.06, 0.012 + (t - zmiana) * 0.02)
      for (let i = 0; i < N; i++) {
        vx[i] = (vx[i] + (tx[i] - px[i]) * k) * 0.86
        vy[i] = (vy[i] + (ty[i] - py[i]) * k) * 0.86
        px[i] += vx[i]; py[i] += vy[i]
        if (bezRuchu) { px[i] = tx[i]; py[i] = ty[i] }
      }

      // rysowanie: najpierw zwykłe, potem akcent
      for (const akcentowe of [0, 1]) {
        ctx.fillStyle = `hsl(${akcentowe ? kolory.pr : kolory.fg})`
        for (let i = 0; i < N; i++) {
          if (ak[i] !== akcentowe || alfa[i] < 0) continue
          const ruch = Math.min(1, Math.hypot(vx[i], vy[i]) / 4)
          ctx.globalAlpha = Math.min(1, alfa[i] * (0.55 + 0.45 * Math.sin(t * 3 + i)) + 0.25 + ruch * 0.3)
          const sz = akcentowe ? 1.5 : 1.35
          ctx.fillRect(px[i], py[i], sz, sz)
        }
      }

      // pierścienie w momencie dotyku
      if (rz.pierscienie) {
        const [fx, fy] = rz.ognisko
        ctx.strokeStyle = `hsl(${kolory.pr})`
        ctx.lineWidth = 1
        for (let n = 0; n < 3; n++) {
          const p = ((t * 0.5 + n / 3) % 1)
          ctx.globalAlpha = (1 - p) * 0.55
          ctx.beginPath(); ctx.arc(fx, fy, 6 + p * 120, 0, Math.PI * 2); ctx.stroke()
        }
        // błysk w punkcie styku
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6)
        ctx.fillStyle = `hsl(${kolory.pr})`
        ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(klatka)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />
}

/* ══ HUD — cienkie linie i kody jak na technicznym rysunku ══════════════ */
const OGNISKA: [number, number][] = [
  [250, 279], [200, 226], [220, 279], [200, 250], [192, 292], [275, 150], [200, 252],
]
const KODY = [
  ['SEQ_01 · HUMAN_INPUT', 'SIGNAL_01'],
  ['SEQ_02 · PROMPT_SPLIT', 'OUT_x6'],
  ['SEQ_03 · LINK_ESTABLISHED', 'TRUST_001'],
  ['SEQ_04 · NEURAL_MESH', 'NODES_14'],
  ['SEQ_05 · FEATURE_CHAIN', 'LINKED_x6'],
  ['SEQ_06 · SOURCE_FEED', 'FEED_LIVE'],
  ['SEQ_07 · NEXTBYTE', 'READY'],
]

function Hud({ rozdzial }: { rozdzial: number }) {
  const [fx, fy] = OGNISKA[rozdzial]
  const [kod, podkod] = KODY[rozdzial]
  const fa = (a: number) => `hsl(var(--foreground) / ${a})`
  const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden>
      <line x1={0} y1={34} x2={W} y2={34} stroke={fa(0.14)} />
      <circle cx={30} cy={34} r={18} stroke={fa(0.16)} />
      <text key={kod} x={58} y={26} fill={fa(0.55)} fontSize={8.5} fontFamily={mono} letterSpacing={1.2} className="nb-film-etykieta">{kod}</text>
      {/* duże cienkie okręgi wokół ogniska */}
      <g style={{ transform: `translate(${fx}px, ${fy}px)`, transition: 'transform 1.2s cubic-bezier(.4,0,.2,1)' }}>
        {[70, 120, 170].map(r => <circle key={r} cx={0} cy={0} r={r} stroke={fa(0.07)} />)}
        <circle cx={0} cy={0} r={5} stroke="hsl(var(--primary))" />
        <line x1={5} y1={-5} x2={60} y2={-60} stroke={fa(0.3)} />
        <line x1={60} y1={-60} x2={110} y2={-60} stroke={fa(0.3)} />
        <text key={podkod} x={62} y={-65} fill="hsl(var(--primary))" fontSize={8} fontFamily={mono} letterSpacing={1.2} className="nb-film-etykieta">{podkod}</text>
      </g>
      <rect x={W - 70} y={70} width={46} height={1} fill={fa(0.25)} />
      <rect x={W - 70} y={75} width={46} height={1} fill={fa(0.25)} />
      <rect x={W - 70} y={80} width={46} height={1} fill={fa(0.25)} />
    </svg>
  )
}

/** Lewy panel: film + HUD + podpis. Film nie jest montowany od nowa między
 *  krokami — dostaje tylko numer rozdziału. */
export function PanelSceny({
  scena, podpis,
}: {
  scena: IdSceny
  wybrane: string[]
  podpis: string
  kanaly: { id: string; nazwa: string }[]
}) {
  const rozdzial = Math.max(0, KOLEJNOSC.indexOf(scena))
  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)]">
      <div className="relative min-h-0 flex-1">
        <Film rozdzial={rozdzial} />
        <Hud rozdzial={rozdzial} />
      </div>
      <div className="flex items-center gap-2 px-5 pb-5">
        <NextByteMarkIcon className="h-3.5 w-3.5 text-foreground/60" />
        <p key={podpis} className="nb-krok-wchodzi text-[11.5px] text-muted-foreground">{podpis}</p>
        <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-foreground/35">{String(rozdzial + 1).padStart(2, '0')} / 07</span>
      </div>
    </div>
  )
}
