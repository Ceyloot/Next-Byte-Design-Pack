/* ═══════════════════════════════════════════════════════════════════════
   WIZUALIZACJE MODUŁÓW
   ═══════════════════════════════════════════════════════════════════════
   Rysunki przy sekcjach modułów: orbita asystenta, sieć badawcza, karty
   lekcji, pamięć i płytka warsztatu. Każdy rozkłada się przy przewijaniu
   i stoi na wspólnych `podstawach`. Przeniesione 1:1 wraz ze stałymi —
   tablice węzłów i kart są częścią rysunku, nie treścią strony.
   ═══════════════════════════════════════════════════════════════════════ */
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../lib/utils'
import { ton, tonAkc, D2R, ASSIST_CAM, getNavbarOffset, makeScene, useScrollProgress, circleToEllipse, type V3 } from './podstawy'

export /** Deterministyczny szum — bez Math.random, żeby układ był zawsze ten sam
    i dało się go zestroić raz na zawsze. */
const noise = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export type NeuroNode = { x: number; y: number; z: number; lvl: number; kind: number; tag?: string }

/** Przykładowe źródła — pokazują, że research faktycznie czegoś szuka. */
const NEURO_TAGS = [
  'arxiv.org', 'benchmarki LLM', 'raport rynku AI',
  'dokumentacja API', 'analiza konkurencji', 'studium przypadku',
]


export type PcbMod = {
  t: string
  axis: 'h' | 'v'
  dir: -1 | 1        // h: -1 w lewo, 1 w prawo | v: -1 w górę, 1 w dół
  pin: number        // przesunięcie nóżki wzdłuż krawędzi rdzenia
  elbow: number      // współrzędna kolanka (x dla 'h', y dla 'v')
  padX: number; padY: number; w: number
  at: number
}


/** Kierunek światła sceny (przestrzeń modelu) — wspólny dla wszystkich płaszczyzn. */
export const ASSIST_LIGHT = (() => {
  const v: V3 = [-0.38, 0.5, 0.78]
  const L = Math.hypot(v[0], v[1], v[2])
  return [v[0] / L, v[1] / L, v[2] / L] as V3
})()

/** Karty krążące wokół postaci. `at` to próg scrolla, przy którym karta
    wychodzi zza popiersia; `lab` oznacza te, które dostają opis CAD. */
export const ASSIST_CARDS = [
  { id: 'c1', at: 0.00, ang: -38, rEnd: 112, yEnd: 22, glyph: 'note', lab: '01' },
  { id: 'c2', at: 0.13, ang: 138, rEnd: 120, yEnd: 60, glyph: 'cal', lab: '02' },
  { id: 'c3', at: 0.27, ang: 186, rEnd: 128, yEnd: 130, glyph: 'search', lab: '03' },
  { id: 'c4', at: 0.41, ang: 24, rEnd: 134, yEnd: 168, glyph: 'task', lab: '04' },
  { id: 'c5', at: 0.55, ang: 154, rEnd: 150, yEnd: 176, glyph: 'pen', lab: null },
  { id: 'c6', at: 0.69, ang: -102, rEnd: 138, yEnd: 186, glyph: 'dot', lab: null },
]

export function AssistantOrbitVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setP(1); return }

    let rafId = 0
    let last = -1
    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const start = vh * 0.82
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const end = (vh + getNavbarOffset()) / 2 - rect.height / 2
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 400) / 400
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '260px 0px' })
    io.observe(el)
    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  const C = ASSIST_CAM
  const S = 1.42
  const OX = 450
  const OY = 448

  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * C.ux + y * C.vx + z * C.wx) * S,
    y: OY + (x * C.uy + y * C.vy + z * C.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * C.ud + y * C.vd + z * C.wd

  /* Elipsa poziomego przekroju o półosiach rx (wzdłuż X) i rz (wzdłuż Z). */
  const contourEllipse = (rx: number, rz: number) =>
    circleToEllipse(rx * C.ux * S, rx * C.uy * S, rz * C.wx * S, rz * C.wy * S)


  /** Układ lokalny leżący NA płaszczyźnie karty — pozwala rysować grafikę
      karty w jej własnych milimetrach, a rzut sam nadaje pochylenie. */
  const cardPlane = (cx: number, cy: number, cz: number, ux: number, uz: number) => {
    const c = P3(cx, cy, cz)
    const rx = (ux * C.ux + uz * C.wx) * S
    const ry = (ux * C.uy + uz * C.wy) * S
    const dx = -C.vx * S
    const dy = -C.vy * S
    return `matrix(${rx.toFixed(4)} ${ry.toFixed(4)} ${dx.toFixed(4)} ${dy.toFixed(4)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`
  }

  const CW = 36   // półszerokość karty
  const CH = 25   // półwysokość karty

  /* ── Karty: pozycja, oświetlenie, głębia ─────────────────────────── */
  const cards = ASSIST_CARDS.map((card, i) => {
    const span = Math.max(0.18, 0.9 - card.at)
    const q = Math.max(0, Math.min(1, (p - card.at) / span))
    const ease = q * q * (3 - 2 * q)

    const theta = card.ang * D2R
    const r = 30 + ease * (card.rEnd - 30)
    const y = 52 + ease * (card.yEnd - 52)

    const cx = Math.cos(theta) * r
    const cz = Math.sin(theta) * r
    // Kierunek patrzenia rzutowany na płaszczyznę poziomą.
    const vlen = Math.hypot(C.ud, C.wd)
    const vx = C.ud / vlen
    const vz = C.wd / vlen
    // Normalna = mieszanka promienia i kierunku widza (0.34 / 0.66), dzięki
    // czemu karta nigdy nie ustawia się krawędzią i ikona zostaje czytelna.
    const bx = Math.cos(theta) * 0.34 + vx * 0.66
    const bz = Math.sin(theta) * 0.34 + vz * 0.66
    const blen = Math.hypot(bx, bz) || 1
    const nx = bx / blen
    const nz = bz / blen
    const ux = -nz
    const uz = nx
    const lit = Math.max(0, nx * ASSIST_LIGHT[0] + nz * ASSIST_LIGHT[2])

    return {
      ...card, i, cx, cy: y, cz, ux, uz, lit,
      o: Math.min(1, ease * 3.2),
      d: dep(cx, y, cz),
    }
  })

  /* ── Kotwice opisów: prawy górny róg karty ───────────────────────── */
  /** Narożnik karty od strony opisu — linia dobija do najbliższego rogu,
      zamiast przecinać własną kartę w drodze do przeciwległego. */
  const anchorOf = (c: typeof cards[number], side?: string, top?: boolean) => {
    const sx = side === 'r' ? 1 : -1
    const sy = top === false ? -1 : 1
    return P3(c.cx + sx * c.ux * CW, c.cy + sy * CH, c.cz + sx * c.uz * CW)
  }

  const CORNERS = [
    { cls: 'left-[2%] top-[4%]', side: 'l', ax: 222, ay: 64 },
    { cls: 'left-[2%] top-[76%]', side: 'l', ax: 222, ay: 500 },
    { cls: 'right-[1.5%] top-[4%]', side: 'r', ax: 678, ay: 64 },
    { cls: 'right-[1.5%] top-[76%]', side: 'r', ax: 678, ay: 500 },
  ]
  const labelled = cards.filter((c) => c.lab)
  // Dopasowanie karta ↔ róg po KĄCIE wokół środka sceny, nie po odległości.
  // Obie listy sortujemy tym samym kątem i łączymy po kolei — zachowanie
  // porządku cyklicznego matematycznie wyklucza przecięcia linii.
  const HUB = { x: 450, y: 400 }
  const ang = (x: number, y: number) => {
    const a = Math.atan2(y - HUB.y, x - HUB.x)
    return a < 0 ? a + Math.PI * 2 : a
  }
  const centers = labelled.map((c) => P3(c.cx, c.cy, c.cz))
  const byAngle = centers
    .map((a, j) => ({ j, t: ang(a.x, a.y) }))
    .sort((a, b) => a.t - b.t)
  const cornersByAngle = CORNERS
    .map((k, j) => ({ j, t: ang(k.ax, k.ay) }))
    .sort((a, b) => a.t - b.t)

  // Sam porządek kątowy nie wystarcza — trzeba jeszcze trafić w przesunięcie
  // cyklu. Sprawdzamy wszystkie rotacje i bierzemy tę o najkrótszych liniach:
  // porządek gwarantuje brak przecięć, rotacja — że linie są krótkie.
  const N = cornersByAngle.length
  let bestRot = 0
  let bestCost = Infinity
  for (let r = 0; r < N; r++) {
    let cost = 0
    byAngle.forEach((c, i) => {
      const k = CORNERS[cornersByAngle[(i + r) % N]!.j]!
      const a = centers[c.j]!
      cost += Math.hypot(k.ax - a.x, k.ay - a.y)
    })
    if (cost < bestCost) { bestCost = cost; bestRot = r }
  }
  const cornerFor: (typeof CORNERS[number] | undefined)[] = []
  byAngle.forEach((c, i) => { cornerFor[c.j] = CORNERS[cornersByAngle[(i + bestRot) % N]!.j] })
  const LABELS = [
    { k: 'a1', num: '01', head: 'NOTATKI', sub: 'Tworzy i organizuje notatki z ustaleń.' },
    { k: 'a2', num: '02', head: 'DOKUMENTY', sub: 'Generuje pliki i pisze umowy w locie.' },
    { k: 'a3', num: '03', head: 'RESEARCH', sub: 'Samodzielnie sprawdza sieć i źródła.' },
    { k: 'a4', num: '04', head: 'ZADANIA', sub: 'Rozbija projekty na kroki i planuje terminy.' },
  ].map((L, i) => ({ ...L, card: labelled[i], ...(cornerFor[i] ?? CORNERS[i]) }))

  /* ── Grafika na licu karty — jeden hairline'owy znak, nic więcej ── */
  const glyphOf = (kind: string) => {
    const st = { stroke: 'hsl(var(--foreground))', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
    const thin = { ...st, strokeWidth: 1.45 }
    switch (kind) {
      case 'note': // kartka z zagiętym rogiem i tekstem
        return (
          <>
            <path d="M -9 -12 L 4 -12 L 10 -6 L 10 12 L -9 12 Z" {...st} />
            <path d="M 4 -12 L 4 -6 L 10 -6" {...st} />
            <line x1={-5} y1={-2} x2={6} y2={-2} {...thin} />
            <line x1={-5} y1={3} x2={6} y2={3} {...thin} />
            <line x1={-5} y1={8} x2={1} y2={8} {...thin} />
          </>
        )
      case 'cal': // kalendarz: oczka, belka nagłówka, siatka dni
        return (
          <>
            <line x1={-6} y1={-14} x2={-6} y2={-9} {...st} />
            <line x1={6} y1={-14} x2={6} y2={-9} {...st} />
            <rect x={-12} y={-11} width={24} height={22} rx={2.5} {...st} />
            <line x1={-12} y1={-4} x2={12} y2={-4} {...st} />
            {[-6, 0, 6].map((x) => [1, 6].map((y) => (
              <circle key={`${x}_${y}`} cx={x} cy={y} r={1.4} fill="hsl(var(--primary))" />
            )))}
          </>
        )
      case 'search': // lupa nad dokumentem — research, nie zwykłe szukanie
        return (
          <>
            <circle cx={-2} cy={-3} r={9.5} {...st} />
            <line x1={5} y1={4} x2={11.5} y2={10.5} strokeWidth={2.8} stroke="hsl(var(--foreground))" strokeLinecap="round" />
          </>
        )
      case 'task': // lista zadań z odhaczonymi polami
        return (
          <>
            {[-8, 0, 8].map((y, i) => (
              <g key={y}>
                <rect x={5} y={y - 3.5} width={7} height={7} rx={1.5} {...thin} />
                {i < 2 && <path d={`M 6.5 ${y} L 8 ${y + 1.8} L 10.5 ${y - 2.2}`} {...thin} />}
                <line x1={-11} y1={y} x2={1} y2={y} {...thin} />
              </g>
            ))}
          </>
        )
      case 'pen':
        return (
          <>
            <path d="M -9 9 L 6 -6 L 9 -3 L -6 12 Z" {...thin} />
            <path d="M -9 9 L -10 12 L -6 12" {...thin} />
          </>
        )
      default:
        return <circle cx={0} cy={0} r={2.4} fill="hsl(var(--primary))" />
    }
  }

  /* ── Scena posortowana realną głębią ─────────────────────────────── */
  const scene: { d: number; node: ReactNode }[] = [
    // popiersie jako jeden obiekt na głębi swojej osi
    {
      d: dep(0, 55, 3),
      node: (
        <g key="bust">
          {(() => {
            // Bryła obrotowa zawsze czyta się jak przedmiot toczony, bo popiersie
            // nie jest obrotowe — ramiona to płaska płyta, nie stożek. Dlatego
            // sylwetka to realny obrys głowa+ramiona, a warstwice kładziemy
            // NA niej jako linie skanu (przycięte maską do konturu).
            const base = P3(0, 0, 0)
            const k = S
            const d = [
              'M -68 0',
              'C -62 -18 -40 -28 -17 -38',   // linia ramienia w górę do szyi
              'L -14 -50',                   // szyja
              'C -25 -54 -27 -64 -27 -75',   // policzek — owal głowy
              'C -27 -93 -16 -106 0 -106',   // czubek
              'C 16 -106 27 -93 27 -75',
              'C 27 -64 25 -54 14 -50',
              'L 17 -38',
              'C 40 -28 62 -18 68 0',
              'Z',
            ].join(' ')
            const tr = `translate(${base.x.toFixed(1)} ${base.y.toFixed(1)}) scale(${k.toFixed(3)})`
            return (
              <g transform={tr}>
                <clipPath id="nbAsClip"><path d={d} /></clipPath>
                <path d={d} fill="url(#nbAsBody)" stroke="hsl(var(--primary)/0.35)" strokeWidth={1.1 / k} strokeLinejoin="round" />
                {/* Linie skanu — subtelna faktura w barwie motywu */}
                <g clipPath="url(#nbAsClip)" stroke="hsl(var(--primary))" strokeWidth={0.85 / k}>
                  {Array.from({ length: 22 }, (_, i) => {
                    const y = -104 + i * 4.8
                    return <line key={i} x1={-70} y1={y} x2={70} y2={y} opacity={0.08 + (i / 22) * 0.18} />
                  })}
                </g>
                {/* Światło po prawej krawędzi — zsynchronizowane z akcentem */}
                <path
                  d="M 0 -106 C 16 -106 27 -93 27 -75 C 27 -64 25 -54 14 -50 L 17 -38 C 40 -28 62 -18 68 0"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth={2 / k} strokeLinecap="round" opacity={0.55}
                />
              </g>
            )
          })()}

          {/* Rdzeń obecności w barwie motywu */}
          {(() => {
            const c = P3(0, 74, 0)
            return (
              <>
                <circle cx={c.x} cy={c.y} r={4} fill="hsl(var(--primary))" opacity={0.9} />
                <circle cx={c.x} cy={c.y} r={9} fill="none" stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.32} />
              </>
            )
          })()}
        </g>
      ),
    },
    ...cards.map((c) => {
      // Płynna jasność neutralna zamiast zimnego błękitu — na rampie motywu,
      // więc karta jaśnieje od tła w każdym motywie, nie tylko w ciemnym.
      const face = ton(6 + c.lit * 10)
      return {
        d: c.d,
        node: (
          <g key={c.id} opacity={c.o}>
            <polygon
              points={[
                P3(c.cx - c.ux * CW, c.cy + CH, c.cz - c.uz * CW),
                P3(c.cx + c.ux * CW, c.cy + CH, c.cz + c.uz * CW),
                P3(c.cx + c.ux * CW, c.cy - CH, c.cz + c.uz * CW),
                P3(c.cx - c.ux * CW, c.cy - CH, c.cz - c.uz * CW),
              ].map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')}
              fill={face}
              stroke={c.lit > 0.55 ? 'hsl(var(--primary)/0.65)' : 'hsl(var(--primary)/0.25)'}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <g transform={cardPlane(c.cx, c.cy, c.cz, c.ux, c.uz)} opacity={0.6 + c.lit * 0.4}>
              {glyphOf(c.glyph)}
            </g>
          </g>
        ),
      }
    }),
  ].sort((a, b) => a.d - b.d)

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.5 + p * 0.4 }}
      />

      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbAsBody" x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor={ton(7)} />
            <stop offset="55%" stopColor={tonAkc(11, 6)} />
            <stop offset="100%" stopColor="hsl(var(--primary)/0.16)" />
          </linearGradient>
          <radialGradient id="nbAsFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tonAkc(6, 8)} stopOpacity="0.75" />
            <stop offset="100%" stopColor={tonAkc(6, 8)} stopOpacity="0" />
          </radialGradient>
        </defs>


        {/* Cień kontaktowy — sadza scenę na podłożu */}
        {(() => {
          const e = contourEllipse(150, 150)
          const c = P3(0, -6, 0)
          return (
            <ellipse
              cx={0} cy={0} rx={e.rx} ry={e.ry}
              transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${e.rot.toFixed(2)})`}
              fill="url(#nbAsFloor)"
            />
          )
        })()}

        {scene.map((sc, i) => <g key={`sc${i}`}>{sc.node}</g>)}

        {/* Linie wskaźnikowe do opisów */}
        <g className="hidden sm:block">
          {LABELS.map((L) => {
            if (!L.card) return null
            const o = Math.min(1, Math.max(0, (p - L.card.at - 0.14) / 0.18)) * L.card.o
            if (o <= 0.01) return null
            const a = anchorOf(L.card, L.side, L.ay < 300)
            return (
              <g key={L.k} opacity={o}>
                <line x1={L.ax} y1={L.ay} x2={a.x} y2={a.y} stroke="hsl(var(--primary))" strokeWidth={1.1} strokeDasharray="4 4" opacity={0.7} />
                <circle cx={a.x} cy={a.y} r={3} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.3} />
                <circle cx={L.ax} cy={L.ay} r={2.6} fill="hsl(var(--primary))" />
              </g>
            )
          })}
        </g>
      </svg>

      {/* OPISY — ta sama typografia co w module 02 */}
      {LABELS.map((L) => {
        if (!L.card) return null
        const o = Math.min(1, Math.max(0, (p - L.card.at - 0.14) / 0.18)) * L.card.o
        return (
          <div
            key={L.k}
            className={cn(
              'absolute w-[200px] hidden sm:block pointer-events-none transition-opacity duration-300',
              L.cls, L.side === 'r' ? 'text-right' : 'text-left',
            )}
            style={{ opacity: o, transform: `translateX(${(1 - p) * (L.side === 'r' ? 14 : -14)}px)` }}
          >
            <p className="text-[12.5px] font-bold uppercase tracking-wide text-primary font-sans leading-none">
              {`// ${L.num} ${L.head}`}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-foreground/80 font-sans">{L.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   WSPÓLNE NARZĘDZIA SCEN 3D (moduły 04–07)
   Ta sama kamera co przy asystencie, więc wszystkie sceny na stronie
   ogląda się z jednego, spójnego ustawienia.
   ═══════════════════════════════════════════════════════════════════════ */

export const NEURO = (() => {
  const layers = [
    { n: 7, y: 84, spread: 208, dz: 54 },
    { n: 10, y: 168, spread: 286, dz: 70 },
    { n: 8, y: 250, spread: 244, dz: 60 },
  ]
  const nodes: NeuroNode[] = []
  const index: number[][] = []
  let tagI = 0
  layers.forEach((L, li) => {
    const ids: number[] = []
    for (let i = 0; i < L.n; i++) {
      const u = L.n === 1 ? 0.5 : i / (L.n - 1)
      const seed = li * 50 + i
      // Podpisy tylko na skrajnych węzłach — w środku zrobiłby się tłok.
      const edgeish = i === 0 || i === L.n - 1
      const tag = edgeish && tagI < NEURO_TAGS.length ? NEURO_TAGS[tagI++] : undefined
      nodes.push({
        x: (u - 0.5) * 2 * L.spread + (noise(seed) - 0.5) * 24,
        y: L.y + (noise(seed + 7) - 0.5) * 22,
        z: (noise(seed + 13) - 0.5) * 2 * L.dz,
        lvl: li + 1,
        kind: (i + li) % 4,
        tag,
      })
      ids.push(nodes.length - 1)
    }
    index.push(ids)
  })

  const edges: { a: number; b: number; at: number }[] = []
  for (let li = 0; li < index.length - 1; li++) {
    index[li]!.forEach((ai) => {
      const cand = index[li + 1]!
        .map((bi) => ({ bi, d: Math.abs(nodes[bi]!.x - nodes[ai]!.x) }))
        .sort((p1, p2) => p1.d - p2.d)
      const k = 2 + (noise(ai * 3 + li) > 0.55 ? 1 : 0)
      cand.slice(0, k).forEach((c, j) => {
        edges.push({ a: ai, b: c.bi, at: 0.2 + li * 0.2 + j * 0.02 + noise(ai + j) * 0.05 })
      })
    })
  }
  index[0]!.forEach((ai, i) => edges.push({ a: -1, b: ai, at: 0.05 + i * 0.02 }))
  index[index.length - 1]!.forEach((ai, i) => edges.push({ a: ai, b: -2, at: 0.72 + i * 0.015 }))
  return { nodes, edges }
})()

export const NEURO_APEX: V3 = [0, 40, -28]

export const NEURO_OUT: V3 = [0, 330, -4]

export function DeepResearchVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.66)
  const { P3, poly, plane } = makeScene(1.30, 450, 590)

  const pos = (i: number): V3 =>
    i === -1 ? NEURO_APEX : i === -2 ? NEURO_OUT : [NEURO.nodes[i]!.x, NEURO.nodes[i]!.y, NEURO.nodes[i]!.z]

  const nodeT = (i: number) => {
    const at = 0.08 + (NEURO.nodes[i]!.lvl - 1) * 0.2
    const q = Math.max(0, Math.min(1, (p - at) / 0.18))
    return q * q * (3 - 2 * q)
  }

  const edgePts = (a: V3, b: V3, t: number, bow: number) => {
    const pts: string[] = []
    const N = 12
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * t
      const q = P3(
        a[0] + (b[0] - a[0]) * u,
        a[1] + (b[1] - a[1]) * u + 4 * u * (1 - u) * bow,
        a[2] + (b[2] - a[2]) * u,
      )
      pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`)
    }
    return pts.join(' ')
  }

  const glyph = (kind: number, x: number, y: number, k: number) => {
    const st = { stroke: 'hsl(var(--primary))', strokeWidth: 1.2, fill: tonAkc(10, 9) }
    const r = 5 * k
    if (kind === 0) return <circle cx={x} cy={y} r={r} {...st} />
    if (kind === 1) return <rect x={x - r * 0.9} y={y - r * 1.15} width={r * 1.8} height={r * 2.3} rx={1} {...st} />
    if (kind === 2) return (
      <>
        <rect x={x - r * 1.1} y={y - r * 0.85} width={r * 2.2} height={r * 1.7} rx={1} {...st} />
        <line x1={x - r * 1.1} y1={y} x2={x + r * 1.1} y2={y} stroke="hsl(var(--primary))" strokeWidth={0.7} />
      </>
    )
    return <polygon points={`${x},${y - r * 1.25} ${x + r},${y} ${x},${y + r * 1.25} ${x - r},${y}`} {...st} />
  }

  const shown = NEURO.nodes.filter((_, i) => nodeT(i) > 0.02).length
  const outT = Math.max(0, Math.min(1, (p - 0.78) / 0.18))

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbRsBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(67, 12)} /><stop offset="100%" stopColor={tonAkc(28, 12)} />
          </linearGradient>
          <linearGradient id="nbRsLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(48, 14)} /><stop offset="100%" stopColor={tonAkc(22, 9)} />
          </linearGradient>
          <radialGradient id="nbRsFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tonAkc(6, 8)} stopOpacity="0.72" />
            <stop offset="100%" stopColor={tonAkc(6, 8)} stopOpacity="0" />
          </radialGradient>
          <filter id="nbRsGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── KRAWĘDZIE SIECI ── */}
        <g>
          {NEURO.edges.map((e, i) => {
            const q = Math.max(0, Math.min(1, (p - e.at) / 0.2))
            const t = q * q * (3 - 2 * q)
            if (t <= 0.01) return null
            const out = e.b === -2
            return (
              <polyline
                key={`e${i}`} points={edgePts(pos(e.a), pos(e.b), t, out ? -18 : 12)}
                fill="none" stroke="hsl(var(--primary))" strokeWidth={out ? 0.9 : 1}
                strokeDasharray={out ? '3 5' : undefined}
                opacity={(out ? 0.4 : 0.3) * t} strokeLinecap="round"
              />
            )
          })}
        </g>

        {/* ── LAPTOP ── */}
        <g>
          {(() => { const e = P3(0, -3, 0); return <ellipse cx={e.x} cy={e.y} rx={128} ry={30} fill="url(#nbRsFloor)" /> })()}

          {/* klapa z ekranem */}
          <polygon points={poly([[-58, 0, -40], [58, 0, -40], [52, 58, -56], [-52, 58, -56]])} fill="url(#nbRsLid)" stroke={tonAkc(84, 10)} strokeWidth={1.3} strokeLinejoin="round" />
          <polygon points={poly([[-49, 6, -43], [49, 6, -43], [44, 52, -55], [-44, 52, -55]])} fill={tonAkc(9, 8)} stroke="hsl(var(--primary))" strokeWidth={0.9} strokeOpacity={0.5} />
          {/* zawartość ekranu: pasek wyszukiwania i wyniki */}
          <g transform={plane(0, 29, -49, [1, 0, 0], [0, -1, 0])} opacity={0.92}>
            <rect x={-38} y={-19} width={76} height={10} rx={5} fill="hsl(var(--primary)/0.12)" stroke="hsl(var(--primary))" strokeWidth={0.9} />
            <circle cx={-31} cy={-14} r={3} fill="none" stroke="hsl(var(--primary))" strokeWidth={0.9} />
            <line x1={-29} y1={-12} x2={-26.6} y2={-9.6} stroke="hsl(var(--primary))" strokeWidth={0.9} />
            <line x1={-22} y1={-14} x2={18} y2={-14} stroke="hsl(var(--primary))" strokeWidth={1.2} opacity={0.55} />
            {[-3, 4, 11].map((y, i) => (
              <g key={y}>
                <rect x={-38} y={y} width={4.4} height={4.4} rx={0.8} fill="hsl(var(--primary))" opacity={0.6} />
                <line x1={-30} y1={y + 2.2} x2={38 - i * 12} y2={y + 2.2} stroke={tonAkc(47, 23)} strokeWidth={1.1} />
              </g>
            ))}
          </g>

          {/* podstawa z klawiaturą i gładzikiem */}
          <polygon points={poly([[-61, 0, 38], [61, 0, 38], [52, 0, -40], [-52, 0, -40]])} fill="url(#nbRsBase)" stroke={tonAkc(86, 8)} strokeWidth={1.3} strokeLinejoin="round" />
          <polygon points={poly([[-61, 0, 38], [61, 0, 38], [61, -5, 38], [-61, -5, 38]])} fill={tonAkc(21, 9)} stroke={tonAkc(55, 15)} strokeWidth={1} />
          <g transform={plane(0, 0.4, 0, [1, 0, 0], [0, 0, 1])} opacity={0.75}>
            {Array.from({ length: 4 }, (_, r) => (
              <g key={r}>
                {Array.from({ length: 13 }, (_, c) => (
                  <rect key={c} x={-45 + c * 7.1} y={-26 + r * 7.4} width={5.8} height={5.6} rx={1} fill={tonAkc(16, 8)} opacity={0.9} />
                ))}
              </g>
            ))}
            <rect x={-16} y={9} width={32} height={19} rx={2.2} fill="none" stroke={tonAkc(50, 16)} strokeWidth={1} />
          </g>
        </g>

        {/* ── WĘZŁY ── */}
        <g>
          {NEURO.nodes.map((n, i) => {
            const t = nodeT(i)
            if (t <= 0.02) return null
            const q = P3(n.x, n.y, n.z)
            return (
              <g key={`n${i}`} opacity={t}>
                <circle cx={q.x} cy={q.y} r={10} fill="hsl(var(--primary))" opacity={0.1} />
                {glyph(n.kind, q.x, q.y, n.lvl === 2 ? 1.05 : 0.92)}
                {n.tag && (
                  <text
                    x={q.x + (n.x < 0 ? -15 : 15)} y={q.y + 4.2}
                    textAnchor={n.x < 0 ? 'end' : 'start'}
                    fill={tonAkc(77, 21)} fontSize={15} fontFamily="monospace" letterSpacing="0.3"
                  >
                    {n.tag}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* ── RAPORT ── */}
        {outT > 0.01 && (() => {
          const c = P3(NEURO_OUT[0], NEURO_OUT[1], NEURO_OUT[2])
          const w = 64, h = 40
          return (
            <g opacity={outT}>
              <g filter="url(#nbRsGlow)">
                <rect x={c.x - w} y={c.y - h} width={w * 2} height={h * 2} rx={4} fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth={1.6} />
                {[-18, -7, 4, 15].map((dy, i) => (
                  <line key={dy} x1={c.x - w + 16} y1={c.y + dy} x2={c.x + w - (i === 3 ? 40 : 16)} y2={c.y + dy} stroke="hsl(var(--primary)/0.65)" strokeWidth={1.5} opacity={0.72} />
                ))}
              </g>
              <text x={c.x} y={c.y + h + 20} fill="hsl(var(--primary))" fontSize={12} fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">RAPORT</text>
            </g>
          )
        })()}

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill={tonAkc(45, 15)} fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`PRZESZUKANO ${String(shown * 9).padStart(3, '0')} ŹRÓDEŁ`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 05: AKADEMIA I PANEL TWÓRCY
   Wizualizacja: OTWIERAJĄCA SIĘ KSIĄŻKA, Z KTÓREJ WYFRUWAJĄ LEKCJE

   Książka to natychmiast czytelna „akademia". Przy scrollu otwiera się,
   a z jej wnętrza kolejno wyfruwają karty lekcji układające się w łuk.
   Ostatnia karta zamienia się w ofertę z ceną — to moment, w którym
   przestajesz się uczyć, a zaczynasz sprzedawać własne materiały.
   Ruch: otwarcie i wachlarz — gest, którego nie ma w żadnym innym module.
   ═══════════════════════════════════════════════════════════════════════ */

export const LESSON_CARDS = ['PODSTAWY', 'PROMPTY', 'OBRAZ', 'ASYSTENT', 'AUTOMATY']

export function AcademyVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)
  const { P3, poly, plane, Disc, discE } = makeScene(1.02, 356, 404)

  const BW = 176   // półszerokość okładki
  const BD = 124   // półgłębokość (grzbiet → brzeg)
  const openT = Math.max(0, Math.min(1, p / 0.32))
  const open = openT * openT * (3 - 2 * openT)
  const lift = 26 * open           // kąt rozwarcia oddany uniesieniem brzegów

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[470px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.13)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbAcCover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(25, 11)} /><stop offset="100%" stopColor={tonAkc(13, 7)} />
          </linearGradient>
          <linearGradient id="nbAcPage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(85, 9)} /><stop offset="100%" stopColor={tonAkc(55, 13)} />
          </linearGradient>
          <linearGradient id="nbAcLesson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(20, 12)} /><stop offset="100%" stopColor={tonAkc(12, 7)} />
          </linearGradient>
          <radialGradient id="nbAcFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tonAkc(6, 8)} stopOpacity="0.7" />
            <stop offset="100%" stopColor={tonAkc(6, 8)} stopOpacity="0" />
          </radialGradient>
        </defs>

        {(() => { const e = P3(0, -3, 0); return <ellipse cx={e.x} cy={e.y} rx={224} ry={44} fill="url(#nbAcFloor)" /> })()}

        {/* ── KSIĄŻKA: dwie połówki rozchylone wokół grzbietu ── */}
        <g>
          {/* lewa okładka + kartki */}
          <polygon points={poly([[-BW, 0, -BD], [0, 0, -BD], [0, 0, BD], [-BW, 0, BD]])} fill="url(#nbAcCover)" stroke={tonAkc(55, 15)} strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points={poly([[-BW + 8, lift * 0.35, -BD + 8], [-4, 0, -BD + 8], [-4, 0, BD - 8], [-BW + 8, lift * 0.35, BD - 8]])} fill="url(#nbAcPage)" stroke={tonAkc(92, 6)} strokeWidth={0.9} strokeLinejoin="round" opacity={0.9} />
          {/* prawa okładka + kartki */}
          <polygon points={poly([[0, 0, -BD], [BW, 0, -BD], [BW, 0, BD], [0, 0, BD]])} fill="url(#nbAcCover)" stroke={tonAkc(55, 15)} strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points={poly([[4, 0, -BD + 8], [BW - 8, lift * 0.35, -BD + 8], [BW - 8, lift * 0.35, BD - 8], [4, 0, BD - 8]])} fill="url(#nbAcPage)" stroke={tonAkc(92, 6)} strokeWidth={0.9} strokeLinejoin="round" opacity={0.9} />
          {/* grzbiet */}
          <polygon points={poly([[-5, 0, -BD], [5, 0, -BD], [5, 5, BD], [-5, 5, BD]])} fill={tonAkc(11, 7)} stroke={tonAkc(44, 15)} strokeWidth={1} />
          {/* linie tekstu na kartkach */}
          <g transform={plane(-BW / 2 - 4, lift * 0.18, 0, [1, 0, 0], [0, 0, -1])} opacity={0.45 * open}>
            {[-22, -14, -6, 2, 10, 18].map((y, i) => (
              <line key={y} x1={-32} y1={y} x2={i % 3 === 2 ? 8 : 30} y2={y} stroke={tonAkc(35, 14)} strokeWidth={1.4} />
            ))}
          </g>
          <g transform={plane(BW / 2 + 4, lift * 0.18, 0, [1, 0, 0], [0, 0, -1])} opacity={0.45 * open}>
            {[-22, -14, -6, 2, 10, 18].map((y, i) => (
              <line key={y} x1={-30} y1={y} x2={i % 3 === 1 ? 6 : 32} y2={y} stroke={tonAkc(35, 14)} strokeWidth={1.4} />
            ))}
          </g>
        </g>

        {/* ── LEKCJE WYFRUWAJĄCE Z KSIĄŻKI W ŁUK ── */}
        {LESSON_CARDS.map((t, i) => {
          const at = 0.16 + i * 0.12
          const q = Math.max(0, Math.min(1, (p - at) / 0.26))
          const e = q * q * (3 - 2 * q)
          if (e <= 0.01) return null
          // Łuk: od grzbietu w górę i na boki, każda kolejna wyżej i dalej.
          const a = (-84 + (i / (LESSON_CARDS.length - 1)) * 116) * D2R
          const r = 186 + i * 29
          const cx = Math.sin(a) * r * e
          const cy = 40 + e * (108 + Math.cos(a) * 66)
          const cz = -Math.cos(a) * 30 * e
          const w = 74, h = 46
          const sell = i === LESSON_CARDS.length - 1 ? Math.max(0, Math.min(1, (p - 0.7) / 0.24)) : 0
          return (
            <g key={t} opacity={Math.min(1, e * 1.8)}>
              <polygon
                points={poly([[cx - w, cy + h, cz], [cx + w, cy + h, cz], [cx + w, cy - h, cz], [cx - w, cy - h, cz]])}
                fill="url(#nbAcLesson)" stroke={sell > 0.4 ? tonAkc(78, 47) : tonAkc(44, 17)} strokeWidth={sell > 0.4 ? 1.5 : 1.1} strokeLinejoin="round"
              />
              <g transform={plane(cx, cy, cz, [1, 0, 0], [0, -1, 0])}>
                <text x={0} y={-8} fill={tonAkc(78, 47)} fontSize={16} fontFamily="monospace" fontWeight="bold" textAnchor="middle">{`0${i + 1}`}</text>
                <text x={0} y={14} fill={sell > 0.4 ? tonAkc(94, 11) : tonAkc(78, 13)} fontSize={14} fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">{t}</text>
              </g>
            </g>
          )
        })}

        {/* ── ZARABIANIE: duży wykres u góry, banknoty i kupki monet ── */}
        {(() => {
          const eT = Math.max(0, Math.min(1, (p - 0.56) / 0.4))
          const e = eT * eT * (3 - 2 * eT)
          if (e <= 0.01) return null
          const EX = 408, EY = 352, EZ = -62
          const bars = [0.3, 0.46, 0.6, 0.8, 1]
          return (
            <g opacity={Math.min(1, e * 1.6)}>
              {/* Panel z wykresem — u samej góry kadru, w pełnej czytelności */}
              <g transform={plane(EX, EY, EZ, [1, 0, 0], [0, -1, 0])}>
                <rect x={-118} y={-92} width={236} height={184} rx={8} fill={tonAkc(10, 8)} stroke={tonAkc(41, 20)} strokeWidth={1.8} />
                <text x={-100} y={-62} fill={tonAkc(74, 22)} fontSize={17} fontFamily="monospace" letterSpacing="1.6">PRZYCHÓD</text>
                {bars.map((v, i) => {
                  const bq = Math.max(0, Math.min(1, (e - i * 0.1) / 0.4))
                  const bt = bq * bq * (3 - 2 * bq)
                  const h = 104 * v * bt
                  return (
                    <rect key={i} x={-96 + i * 40} y={60 - h} width={27} height={h} rx={2.6}
                      fill={i === bars.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.25)'} stroke="hsl(var(--primary)/0.5)" strokeWidth={1.1} />
                  )
                })}
                <line x1={-104} y1={62} x2={104} y2={62} stroke={tonAkc(37, 17)} strokeWidth={1.6} />
                <path d="M -92 30 L -34 -2 L 12 14 L 84 -56" fill="none" stroke="hsl(var(--primary))" strokeWidth={3.4}
                  strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0, (e - 0.3) / 0.5)} />
                <path d="M 60 -56 L 88 -56 L 88 -28" fill="none" stroke="hsl(var(--primary))" strokeWidth={3.4}
                  strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0, (e - 0.45) / 0.4)} />
              </g>

              {/* Banknoty — plik leżący pod monetami */}
              {[0, 1, 2].map((i) => {
                const nq = Math.max(0, Math.min(1, (e - 0.24 - i * 0.07) / 0.34))
                const nt = nq * nq * (3 - 2 * nq)
                if (nt <= 0.01) return null
                const bx = 372, bz = 24, by = 3 + i * 5
                return (
                  <g key={`note${i}`} opacity={nt}>
                    <polygon
                      points={poly([[bx - 62, by, bz - 34], [bx + 62, by, bz - 34], [bx + 62, by, bz + 34], [bx - 62, by, bz + 34]])}
                      fill={tonAkc(19, 16)} stroke={tonAkc(78, 47)} strokeWidth={1.3} strokeLinejoin="round"
                    />
                    {i === 2 && (
                      <g transform={plane(bx, by + 0.6, bz, [1, 0, 0], [0, 0, -1])}>
                        <circle cx={0} cy={0} r={13} fill="none" stroke={tonAkc(80, 31)} strokeWidth={1.4} />
                        <text x={0} y={5} fill={tonAkc(91, 14)} fontSize={14} fontFamily="monospace" fontWeight="bold" textAnchor="middle">zł</text>
                        <line x1={-46} y1={-18} x2={-22} y2={-18} stroke={tonAkc(55, 35)} strokeWidth={1.4} />
                        <line x1={22} y1={18} x2={46} y2={18} stroke={tonAkc(55, 35)} strokeWidth={1.4} />
                      </g>
                    )}
                  </g>
                )
              })}

              {/* Moneta = walec: dolna czasza, pas boczny i górne lico.
                  Sam krążek czytał się płasko jak żeton. */}
              {[{ x: 296, z: 100, n: 5 }, { x: 372, z: 122, n: 7 }, { x: 444, z: 92, n: 4 }].map((st, k) => (
                <g key={`pile${k}`}>
                  {Array.from({ length: st.n }, (_, i) => {
                    const cq = Math.max(0, Math.min(1, (e - 0.3 - k * 0.06 - i * 0.05) / 0.32))
                    const ct = cq * cq * (3 - 2 * cq)
                    if (ct <= 0.01) return null
                    const TH = 7.5
                    const y = 4 + i * (TH + 0.6) * ct
                    const R = 27
                    const bot = P3(st.x, y, st.z)
                    const top = P3(st.x, y + TH, st.z)
                    const rot = discE.rot * D2R
                    const hw = Math.hypot(R * discE.rx * Math.cos(rot), R * discE.ry * Math.sin(rot))
                    return (
                      <g key={i} opacity={ct}>
                        {Disc(st.x, y, st.z, R, { fill: tonAkc(15, 13), stroke: tonAkc(47, 30), strokeWidth: 1 })}
                        <path
                          d={`M ${(bot.x - hw).toFixed(1)} ${bot.y.toFixed(1)} L ${(bot.x + hw).toFixed(1)} ${bot.y.toFixed(1)} L ${(top.x + hw).toFixed(1)} ${top.y.toFixed(1)} L ${(top.x - hw).toFixed(1)} ${top.y.toFixed(1)} Z`}
                          fill={tonAkc(20, 18)} stroke={tonAkc(55, 35)} strokeWidth={1}
                        />
                        {Disc(st.x, y + TH, st.z, R, { fill: tonAkc(27, 23), stroke: tonAkc(84, 30), strokeWidth: 1.5 })}
                        {Disc(st.x, y + TH + 0.4, st.z, R * 0.62, { fill: 'none', stroke: tonAkc(62, 33), strokeWidth: 1 })}
                      </g>
                    )
                  })}
                </g>
              ))}
            </g>
          )
        })()}

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill={tonAkc(45, 15)} fontSize={12} fontFamily="monospace" letterSpacing="1">
            {p > 0.74 ? 'UCZ SIĘ · WYSTAW · ZARABIAJ' : `LEKCJE ${Math.min(LESSON_CARDS.length, Math.max(0, Math.round((p - 0.16) / 0.12) + 1))} / ${LESSON_CARDS.length}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 06: PAMIĘĆ AI
   Wizualizacja: SZUFLADA, KTÓRA REALNIE SIĘ WYSUWA

   Cała skrzynka jedzie do przodu po prowadnicy — widać lewą i prawą
   ściankę oraz dno, więc czyta się jako szuflada, a nie jako otwarte
   pudełko. W środku karty z tym, co platforma o Tobie pamięta. Jedna
   jest wyjęta i podświetlona z krzyżykiem: masz wgląd i możesz skasować.
   ═══════════════════════════════════════════════════════════════════════ */

export const MEMORY_CARDS = [
  'Profil firmy',
  'Ton komunikacji',
  'Nazwy produktów',
  'Stali klienci',
  'Ulubione formaty',
  'Ustalenia projektów',
]

export function MemoryVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)
  const { P3, poly, plane } = makeScene(1.16, 430, 452)

  const TX = 168, TZ = 108, TY = 48, WT = 10  // szuflada + grubość ścianek
  const CW = 148, CH = 108                     // karta
  const N = MEMORY_CARDS.length

  // Wysuw szuflady — teraz naprawdę wyjeżdża, a nie drga w miejscu.
  const slideT = Math.max(0, Math.min(1, p / 0.3))
  const slide = (slideT * slideT * (3 - 2 * slideT)) * 170
  const pullT = Math.max(0, Math.min(1, (p - 0.66) / 0.3))
  const pull = pullT * pullT * (3 - 2 * pullT)
  const Z = (z: number) => z + slide

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.13)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbMmFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(55, 14)} /><stop offset="100%" stopColor={tonAkc(19, 9)} />
          </linearGradient>
          <linearGradient id="nbMmInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(18, 10)} /><stop offset="100%" stopColor={tonAkc(10, 6)} />
          </linearGradient>
          <linearGradient id="nbMmCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(22, 13)} /><stop offset="100%" stopColor={tonAkc(13, 8)} />
          </linearGradient>
          <radialGradient id="nbMmFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tonAkc(6, 8)} stopOpacity="0.7" />
            <stop offset="100%" stopColor={tonAkc(6, 8)} stopOpacity="0" />
          </radialGradient>
        </defs>

        {(() => { const e = P3(0, -8, 50); return <ellipse cx={e.x} cy={e.y} rx={256} ry={50} fill="url(#nbMmFloor)" /> })()}

        {/* ── SZAFKA, Z KTÓREJ SZUFLADA WYJEŻDŻA ── */}
        <polygon points={poly([[-TX - 12, -6, -TZ - 10], [TX + 12, -6, -TZ - 10], [TX + 12, TY + 22, -TZ - 10], [-TX - 12, TY + 22, -TZ - 10]])} fill={ton(7)} stroke={tonAkc(23, 12)} strokeWidth={1.1} />
        <polygon points={poly([[TX + 12, -6, -TZ - 10], [TX + 12, -6, -TZ + 52], [TX + 12, TY + 22, -TZ + 52], [TX + 12, TY + 22, -TZ - 10]])} fill={tonAkc(10, 7)} stroke={tonAkc(27, 15)} strokeWidth={1} />
        <polygon points={poly([[-TX - 12, TY + 22, -TZ - 10], [TX + 12, TY + 22, -TZ - 10], [TX + 12, TY + 22, -TZ + 52], [-TX - 12, TY + 22, -TZ + 52]])} fill={tonAkc(12, 8)} stroke={tonAkc(31, 15)} strokeWidth={1} />

        {/* ── DNO ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [TX, 0, Z(-TZ)], [TX, 0, Z(TZ)], [-TX, 0, Z(TZ)]])} fill={tonAkc(10, 7)} stroke={tonAkc(34, 16)} strokeWidth={1.1} strokeLinejoin="round" />

        {/* ── TYLNA ŚCIANKA (wnętrze) ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [TX, 0, Z(-TZ)], [TX, TY, Z(-TZ)], [-TX, TY, Z(-TZ)]])} fill="url(#nbMmInner)" stroke={tonAkc(34, 15)} strokeWidth={1.1} />

        {/* ── LEWA ŚCIANKA. Jej ściana ZEWNĘTRZNA jest przy tej kamerze tyłem,
               dlatego wcześniej wyglądało, jakby szuflada nie miała lewego boku.
               Rysujemy powierzchnię wewnętrzną plus grubość na górnej krawędzi. ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [-TX, 0, Z(TZ)], [-TX, TY, Z(TZ)], [-TX, TY, Z(-TZ)]])} fill="url(#nbMmInner)" stroke={tonAkc(49, 17)} strokeWidth={1.2} strokeLinejoin="round" />
        <polygon points={poly([[-TX, TY, Z(-TZ)], [-TX, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)], [-TX - WT, TY, Z(-TZ)]])} fill={tonAkc(58, 15)} stroke={tonAkc(81, 11)} strokeWidth={1.1} strokeLinejoin="round" />
        <polygon points={poly([[-TX - WT, 0, Z(TZ)], [-TX, 0, Z(TZ)], [-TX, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)]])} fill={tonAkc(36, 13)} stroke={tonAkc(63, 15)} strokeWidth={1} />

        {/* ── KARTY ── */}
        {MEMORY_CARDS.map((m, i) => {
          const q = Math.max(0, Math.min(1, (p - 0.16 - i * 0.075) / 0.22))
          const t = q * q * (3 - 2 * q)
          if (t <= 0.01) return null
          const isPulled = i === 2
          const z = Z(-TZ + 22 + i * 30)
          const lifted = isPulled ? pull * 80 : 0
          const y0 = 5 + lifted, y1 = 5 + CH + lifted
          const hot = isPulled && pull > 0.4
          return (
            <g key={m} opacity={Math.min(1, t * 2)}>
              <polygon
                points={poly([[-CW / 2, y0, z], [CW / 2, y0, z], [CW / 2, y1, z], [-CW / 2, y1, z]])}
                fill="url(#nbMmCard)" stroke={hot ? tonAkc(78, 47) : tonAkc(43, 17)} strokeWidth={hot ? 1.6 : 1.1} strokeLinejoin="round"
              />
              <g transform={plane(0, (y0 + y1) / 2, z, [1, 0, 0], [0, -1, 0])}>
                <text x={-56} y={-30} fill={hot ? tonAkc(94, 11) : tonAkc(78, 14)} fontSize={12} fontFamily="monospace" letterSpacing="0.2">{m}</text>
                <line x1={-50} y1={-19} x2={22} y2={-19} stroke={tonAkc(32, 16)} strokeWidth={1.1} />
                <line x1={-50} y1={-10} x2={0} y2={-10} stroke={tonAkc(32, 16)} strokeWidth={1.1} />
                {hot && (
                  <g>
                    <circle cx={48} cy={-32} r={9} fill={tonAkc(12, 11)} stroke={tonAkc(78, 47)} strokeWidth={1.3} />
                    <path d="M 44 -36 L 52 -28 M 52 -36 L 44 -28" stroke={tonAkc(91, 15)} strokeWidth={1.6} strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          )
        })}

        {/* ── PRAWA ŚCIANKA I FRONT (karty siedzą za nimi) ── */}
        <polygon points={poly([[TX, 0, Z(-TZ)], [TX, 0, Z(TZ)], [TX, TY, Z(TZ)], [TX, TY, Z(-TZ)]])} fill={tonAkc(16, 9)} stroke={tonAkc(55, 15)} strokeWidth={1.2} strokeLinejoin="round" />
        <polygon points={poly([[TX, TY, Z(-TZ)], [TX, TY, Z(TZ)], [TX + WT, TY, Z(TZ)], [TX + WT, TY, Z(-TZ)]])} fill={tonAkc(58, 15)} stroke={tonAkc(81, 11)} strokeWidth={1.1} strokeLinejoin="round" />
        <polygon points={poly([[-TX - WT, 0, Z(TZ)], [TX + WT, 0, Z(TZ)], [TX + WT, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)]])} fill="url(#nbMmFront)" stroke={tonAkc(81, 11)} strokeWidth={1.4} strokeLinejoin="round" />

        {/* uchwyt i podpis frontu */}
        <g transform={plane(0, TY / 2, Z(TZ), [1, 0, 0], [0, -1, 0])}>
          <rect x={-46} y={-11} width={92} height={22} rx={4} fill={tonAkc(11, 7)} stroke={tonAkc(68, 14)} strokeWidth={1.1} />
          <text x={0} y={5} fill={tonAkc(88, 11)} fontSize={13} fontFamily="monospace" textAnchor="middle" letterSpacing="2.2">PAMIĘĆ</text>
        </g>

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill={tonAkc(45, 15)} fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`ZAPAMIĘTANE WPISY ${Math.min(N, Math.max(0, Math.round((p - 0.16) / 0.075) + 1))} / ${N}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 07: ZINTEGROWANY WORKSPACE
   Wizualizacja: PŁASKA PŁYTKA DRUKOWANA — RDZEŃ NEXTBYTE I ŚCIEŻKI

   Jedyna scena bez rzutu aksonometrycznego: płytkę oglądamy PROSTOPADLE,
   jak schemat PCB. W rdzeniu siedzi prawdziwy znak NextByte, a ścieżki
   wychodzą wszystkimi czterema bokami — nie tylko na prawo i lewo.
   Układy stoją w nierównych odległościach i zapalają się w rozjechanych
   momentach, więc płytka wygląda na projektowaną, a nie na siatkę.
   ═══════════════════════════════════════════════════════════════════════ */

export const PCB_CX = 450, PCB_CY = 306, PCB_R = 78

export const PAD_H = 44

/** Nierówne odległości i rozjechane progi — celowo, żeby uniknąć siatki. */
export const PCB_MODS: PcbMod[] = [
  { t: 'CZAT AI', axis: 'h', dir: -1, pin: -34, elbow: 300, padX: 236, padY: 156, w: 158, at: 0.04 },
  { t: 'STUDIO WIDEO', axis: 'h', dir: -1, pin: 4, elbow: 250, padX: 178, padY: 306, w: 180, at: 0.20 },
  { t: 'DEEP RESEARCH', axis: 'h', dir: -1, pin: 40, elbow: 308, padX: 222, padY: 458, w: 190, at: 0.42 },
  { t: 'PAMIĘĆ AI', axis: 'h', dir: 1, pin: -34, elbow: 600, padX: 664, padY: 166, w: 152, at: 0.11 },
  { t: 'KALENDARZ', axis: 'h', dir: 1, pin: 4, elbow: 648, padX: 716, padY: 306, w: 154, at: 0.26 },
  { t: 'AKADEMIA I SKLEP', axis: 'h', dir: 1, pin: 40, elbow: 596, padX: 660, padY: 458, w: 200, at: 0.48 },
  { t: 'STUDIO ZDJĘĆ', axis: 'v', dir: -1, pin: -40, elbow: 118, padX: 300, padY: 74, w: 168, at: 0.15 },
  { t: 'NOTATKI', axis: 'v', dir: -1, pin: 34, elbow: 160, padX: 610, padY: 74, w: 132, at: 0.32 },
  { t: 'ASYSTENT AI', axis: 'v', dir: 1, pin: -40, elbow: 494, padX: 322, padY: 552, w: 158, at: 0.36 },
  { t: 'ZADANIA I TABLICE', axis: 'v', dir: 1, pin: 34, elbow: 528, padX: 616, padY: 552, w: 196, at: 0.54 },
]

export function WorkspaceVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)

  /** Trasa ścieżki: nóżka → kolanko → przesunięcie → pole lutownicze.
      Rysowana częściowo, więc realnie „narasta". */
  const route = (m: PcbMod): [number, number][] => {
    if (m.axis === 'h') {
      const x0 = PCB_CX + m.dir * PCB_R
      const y0 = PCB_CY + m.pin
      return [[x0, y0], [m.elbow, y0], [m.elbow, m.padY], [m.padX, m.padY]]
    }
    const x0 = PCB_CX + m.pin
    const y0 = PCB_CY + m.dir * PCB_R
    return [[x0, y0], [x0, m.elbow], [m.padX, m.elbow], [m.padX, m.padY]]
  }

  const partial = (pts: [number, number][], t: number) => {
    const segs: number[] = []
    let total = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i + 1]![0] - pts[i]![0], pts[i + 1]![1] - pts[i]![1])
      segs.push(d); total += d
    }
    let want = total * t
    const out = [`${pts[0]![0]},${pts[0]![1]}`]
    for (let i = 0; i < segs.length; i++) {
      const d = segs[i]!
      const fr = d === 0 ? 1 : Math.min(1, want / d)
      const A = pts[i]!, B = pts[i + 1]!
      out.push(`${(A[0] + (B[0] - A[0]) * fr).toFixed(1)},${(A[1] + (B[1] - A[1]) * fr).toFixed(1)}`)
      want -= d
      if (want <= 0) break
    }
    return out.join(' ')
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.17)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.4 + p * 0.5 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbPcbCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tonAkc(26, 22)} /><stop offset="55%" stopColor={tonAkc(16, 13)} /><stop offset="100%" stopColor={tonAkc(10, 8)} />
          </linearGradient>
          <linearGradient id="nbPcbPad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tonAkc(15, 9)} /><stop offset="100%" stopColor={tonAkc(11, 7)} />
          </linearGradient>
          <filter id="nbPcbGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── ŚCIEŻKI OZDOBNE: krótkie odnogi bez układu, jak na realnym PCB ── */}
        <g opacity={Math.min(1, p * 2) * 0.4}>
          {[[-62, -1], [-14, -1], [62, -1], [-62, 1], [14, 1], [62, 1]].map((v, i) => {
            const [off, dir] = v as [number, number]
            const y0 = PCB_CY + dir * PCB_R
            const len = 30 + ((i * 29) % 4) * 22
            const t = Math.max(0, Math.min(1, (p - 0.03 - i * 0.025) / 0.3))
            if (t <= 0.01) return null
            return (
              <g key={`stub${i}`}>
                <line x1={PCB_CX + off} y1={y0} x2={PCB_CX + off} y2={y0 + dir * len * t} stroke="hsl(var(--primary))" strokeWidth={2.2} opacity={0.55} />
                <circle cx={PCB_CX + off} cy={y0 + dir * len * t} r={3.6} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.4} opacity={t} />
              </g>
            )
          })}
        </g>

        {/* ── ŚCIEŻKI DO UKŁADÓW ── */}
        <g>
          {PCB_MODS.map((m, i) => {
            const q = Math.max(0, Math.min(1, (p - m.at) / 0.26))
            const t = q * q * (3 - 2 * q)
            if (t <= 0.01) return null
            const pts = partial(route(m), t)
            const r0 = route(m)
            return (
              <g key={`tr${i}`}>
                <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth={6} opacity={0.13} strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} opacity={0.88} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={r0[1]![0]} cy={r0[1]![1]} r={3.4} fill={tonAkc(10, 9)} stroke="hsl(var(--primary))" strokeWidth={1.4} opacity={t} />
              </g>
            )
          })}
        </g>

        {/* ── UKŁADY ── */}
        {PCB_MODS.map((m) => {
          const q = Math.max(0, Math.min(1, (p - m.at - 0.13) / 0.22))
          const t = q * q * (3 - 2 * q)
          if (t <= 0.01) return null
          const x = m.axis === 'h' ? (m.dir === -1 ? m.padX - m.w : m.padX) : m.padX - m.w / 2
          const y = m.padY - PAD_H / 2
          return (
            <g key={m.t} opacity={t}>
              <rect x={x} y={y} width={m.w} height={PAD_H} rx={6} fill="url(#nbPcbPad)" stroke="hsl(var(--primary))" strokeWidth={1.7} />
              {[-0.3, 0, 0.3].map((u) => (
                m.axis === 'h' ? (
                  <line key={u} x1={m.padX} y1={m.padY + u * PAD_H} x2={m.padX + m.dir * 10} y2={m.padY + u * PAD_H} stroke={tonAkc(70, 17)} strokeWidth={2.2} opacity={0.8} />
                ) : (
                  <line key={u} x1={m.padX + u * m.w} y1={m.padY - m.dir * PAD_H / 2} x2={m.padX + u * m.w} y2={m.padY - m.dir * (PAD_H / 2 + 10)} stroke={tonAkc(70, 17)} strokeWidth={2.2} opacity={0.8} />
                )
              ))}
              <text x={x + m.w / 2} y={m.padY + 6} fill={tonAkc(93, 12)} fontSize={16} fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                {m.t}
              </text>
            </g>
          )
        })}

        {/* ── RDZEŃ ── */}
        <g filter="url(#nbPcbGlow)">
          <rect x={PCB_CX - PCB_R} y={PCB_CY - PCB_R} width={PCB_R * 2} height={PCB_R * 2} rx={14}
            fill="url(#nbPcbCore)" stroke="hsl(var(--primary))" strokeWidth={2.4} />
          <rect x={PCB_CX - PCB_R + 10} y={PCB_CY - PCB_R + 10} width={PCB_R * 2 - 20} height={PCB_R * 2 - 20} rx={8}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={1.1} strokeOpacity={0.4} />
        </g>
        <g opacity={0.85}>
          {[-52, -34, -16, 4, 22, 40, 58].map((d) => (
            <g key={`pin${d}`}>
              <line x1={PCB_CX - PCB_R} y1={PCB_CY + d} x2={PCB_CX - PCB_R - 11} y2={PCB_CY + d} stroke={tonAkc(70, 17)} strokeWidth={2.6} />
              <line x1={PCB_CX + PCB_R} y1={PCB_CY + d} x2={PCB_CX + PCB_R + 11} y2={PCB_CY + d} stroke={tonAkc(70, 17)} strokeWidth={2.6} />
              <line x1={PCB_CX + d} y1={PCB_CY - PCB_R} x2={PCB_CX + d} y2={PCB_CY - PCB_R - 11} stroke={tonAkc(70, 17)} strokeWidth={2.6} />
              <line x1={PCB_CX + d} y1={PCB_CY + PCB_R} x2={PCB_CX + d} y2={PCB_CY + PCB_R + 11} stroke={tonAkc(70, 17)} strokeWidth={2.6} />
            </g>
          ))}
        </g>

        {/* Prawdziwy znak NextByte na rdzeniu (viewBox ikony 278.5 45.5 642 775) */}
        <g transform={`translate(${PCB_CX} ${PCB_CY}) scale(0.104) translate(-599.5 -433)`} fill={tonAkc(95, 9)}>
          <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" />
          <path d="M784,68 L900,68 L900,460 L784,460 Z" />
          <path d="M299,264 L416,377 L415,797 L298,797 Z" />
          <path d="M900,489 L784.5,490 L900,600.5 Z" />
        </g>

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={604} fill={tonAkc(45, 15)} fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`PODŁĄCZONE MODUŁY ${PCB_MODS.filter((m) => p > m.at + 0.13).length} / ${PCB_MODS.length}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SZKIELET MODUŁÓW 03–06 (ASYSTENT, DEEP RESEARCH, AKADEMIA, WORKSPACE)
   ═══════════════════════════════════════════════════════════════════════ */
