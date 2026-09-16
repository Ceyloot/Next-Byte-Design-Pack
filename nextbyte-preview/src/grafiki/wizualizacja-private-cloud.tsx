/* ═══════════════════════════════════════════════════════════════════════
   PRIVATE CLOUD — PÓŁ PLANETY SKŁADANEJ Z OPADAJĄCYCH KROPEK

   Ten sam chwyt co przy kłódce AES-256, tylko zamiast znaków szyfrogramu
   spadają kropki: lecą z góry, wytracają prędkość i zastygają w kształt
   kontynentów. Kolejność układania idzie od świecącego punktu danych na
   zewnątrz — mapa „rozlewa się" z Twoich danych.

   Rysunek jest czystą funkcją postępu przewijania `p` — nic nie kręci się
   samo. Składanie startuje późno, gdy czasza jest już dobrze w kadrze,
   żeby nie odbywało się poza zasięgiem wzroku.

   Kropki idą kilkoma ścieżkami (w locie / ułożone, wybrzeże / wnętrze),
   więc nawet kilka tysięcy punktów to kilka elementów DOM, a nie tysiące.
   Pozycje, kolejność i rozmiary liczymy RAZ przy starcie modułu.

   Kolory wprost z `hsl(var(--primary))` / `hsl(var(--foreground))`,
   opisy `// 01 …` tą samą typografią co asystent.

   Kadr 900 × 620 — ten sam co pozostałe moduły.
   ═══════════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { type V3 } from '@/grafiki/podstawy'
import { rasterLadow, rasterOceanu, type Zakres } from '@/grafiki/kontynenty'

/* ── Scena ────────────────────────────────────────────────────────────── */
/* Promień dobrany tak, żeby cięciwa czaszy na dolnej krawędzi kadru była
   węższa niż kadr. Przy większej planecie koło wychodziło za boki i SVG
   ucinało je pionową krawędzią razem z kropkami lądów. */
const R = 430
const OX = 450, OY = 732       // środek pod kadrem → horyzont na y ≈ 302
const D2R = Math.PI / 180
const AKCENT = 'hsl(var(--primary))'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const wejscie = (p: number, od: number, dl: number) => {
  const t = clamp01((p - od) / dl)
  return t * t * (3 - 2 * t)
}

/** Punkt na kuli. Długość przesunięta o -21°, żeby Polska stała na osi
    kadru — przy 52° szerokości wypada wtedy ~38° od szczytu czaszy. */
function kula(lat: number, lon: number): V3 {
  const a = lat * D2R, b = (lon - 21) * D2R
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]
}

/** Rzut ortogonalny prosto z przodu: y w górę, z do widza. */
const rzut = (v: V3, wys = 1) => ({ x: OX + v[0] * R * wys, y: OY - v[1] * R * wys })

const katMiedzy = (a: V3, b: V3) =>
  Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) / D2R

const WEZEL = kula(52.2, 21)
const WEZEL_S = rzut(WEZEL, 1.002)

/** Deterministyczny szum — `Math.random` migotałby przy każdym przerysowaniu. */
const szum = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Kropka jako okrąg w jednej ścieżce — tysiące `<circle>` zapchałyby DOM. */
const kolko = (x: number, y: number, r: number) =>
  `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0`
  + `a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`

/** Tylko to, co może trafić na czaszę wokół węzła — reszty nie liczymy. */
const ZAKRES: Zakres = { lon: [-75, 105], lat: [-42, 82] }

/** Najdalszy kąt od węzła, który jeszcze widać na czaszy. */
const KAT_MAX = 78

/* Kropki lądów — pozycja, kolejność układania i rozmiar liczone RAZ. */
const KROPKI = rasterLadow(1.2, ZAKRES).flatMap((k, i) => {
  const v = kula(k.lat, k.lon)
  if (v[2] <= 0.05) return []                          // tylna półkula
  const s = rzut(v)
  if (s.y > 640 || s.x < -10 || s.x > 910) return []   // poza kadrem
  const glebia = Math.min(1, v[2] / 0.7)
  const kat = katMiedzy(v, WEZEL)
  return [{
    x: s.x,
    y: s.y,
    // Przy horyzoncie kropki maleją — czasza ma objętość bez cieniowania;
    // lekki szum rozmiaru daje fakturę zamiast mechanicznej kratki.
    r: (0.8 + 1.4 * glebia) * (0.85 + szum(i) * 0.3) * (k.brzeg ? 1.15 : 1),
    brzeg: k.brzeg,
    // Mapa składa się od punktu danych na zewnątrz.
    d: (Math.min(kat, KAT_MAX) / KAT_MAX) * 0.55 + szum(i * 31) * 0.05,
  }]
})

const OPAD = 170          // dystans opadania kropki
const LOT = 0.34          // ile postępu zajmuje lot jednej kropki

/** Chwila (w skali `zlozenie`), w której dany kąt jest już ułożony. */
const ulozone = (kat: number) => (Math.min(kat, KAT_MAX) / KAT_MAX) * 0.55 + 0.03 + LOT

/* Ocean — rzadka, ledwie widoczna siatka; stała, więc to jedna gotowa ścieżka. */
const OCEAN = rasterOceanu(2.4, ZAKRES)
  .flatMap(([lon, lat]) => {
    const v = kula(lat, lon)
    if (v[2] <= 0.05) return []
    const s = rzut(v)
    if (s.y > 640 || s.x < -10 || s.x > 910) return []
    return [kolko(s.x, s.y, 0.5 + 0.6 * Math.min(1, v[2] / 0.7))]
  })
  .join('')

/* Miasta, do których dociera zasięg — tylko te, które widać na czaszy. */
const MIASTA = ([
  ['lon', 51.5, -0.1], ['mad', 40.4, -3.7], ['sto', 59.3, 18.1], ['ist', 41.0, 28.9],
  ['kai', 30.0, 31.2], ['dxb', 25.2, 55.3], ['mow', 55.8, 37.6], ['lag', 6.5, 3.4],
  ['nyc', 40.7, -74.0], ['bom', 19.1, 72.9], ['nbo', -1.3, 36.8], ['rkv', 64.1, -21.9],
] as const).flatMap(([id, lat, lon]) => {
  const v = kula(lat, lon)
  if (v[2] <= 0.12) return []
  const s = rzut(v, 1.002)
  if (s.y > 600 || s.x < 20 || s.x > 880) return []
  return [{ id, ...s, kat: katMiedzy(v, WEZEL) }]
})

/* ── Opisy — ta sama typografia i te same linie co przy asystencie ─────── */
const OPISY = [
  // → świecący punkt: Twoje dane. Bez wskazywania, GDZIE leżą — liczy się,
  //   że są Twoje i bezpieczne.
  {
    k: 'dane', num: '01', head: 'Wszystkie Twoje dane', sub: 'Pliki, rozmowy i projekty — zawsze bezpieczne.',
    side: 'l' as const, x: 36, y: 214, at: 0.25, cel: 'wezel',
  },
  // → odległe miasto, które zapala się, gdy dociera do niego zasięg —
  //   przykład tego, że dostęp jest wszędzie, a bezpieczeństwo idzie za nim.
  {
    k: 'swiat', num: '02', head: 'Z każdego miejsca', sub: 'Na każdym urządzeniu, zawsze aktualne i zaszyfrowane.',
    side: 'r' as const, x: 864, y: 262, at: 0.62, cel: 'dxb',
  },
]

/** Postęp przewijania na DŁUGIM odcinku: od chwili, gdy czasza wchodzi
    w kadr (góra sceny na 78% wysokości okna), do chwili, gdy scena stoi
    wysoko (góra na 10%). Wspólny `useScrollProgress` kończy przy
    wycentrowaniu — tu dawało to ok. 200 px na całe składanie mapy,
    więc przelatywało, zanim ktokolwiek zdążył je zobaczyć. */
function usePostepSceny(ref: React.RefObject<HTMLDivElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let raf = 0
    let ost = -1
    const czytaj = () => {
      const vh = window.innerHeight || 800
      const gora = el.getBoundingClientRect().top
      const t = clamp01((vh * 0.78 - gora) / (vh * 0.68))
      const q = Math.round(t * 400) / 400
      if (q !== ost) { ost = q; setP(q) }
    }
    const petla = () => { czytaj(); raf = requestAnimationFrame(petla) }
    const io = new IntersectionObserver(([e]) => {
      const widac = e?.isIntersecting ?? true
      if (widac && !raf) raf = requestAnimationFrame(petla)
      if (!widac && raf) { cancelAnimationFrame(raf); raf = 0 }
    }, { rootMargin: '200px 0px' })
    io.observe(el)
    czytaj()
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [ref])
  return p
}

export function PrivateCloudVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const p = usePostepSceny(ref)

  const pPlaneta = wejscie(p, 0, 0.35)
  const wschod = (1 - pPlaneta) * 60                   // czasza wschodzi od dołu
  // Składanie trwa przez cały odcinek, na którym czasza jest w kadrze;
  // ostatnie kropki lądują tuż przed końcem.
  const zlozenie = clamp01(p * 1.05)

  /* Kropki w czterech grupach: dwie w locie, dwie ułożone. */
  const lotSlaby: string[] = []
  const lotMocny: string[] = []
  const stojWnetrze: string[] = []
  const stojBrzeg: string[] = []
  for (const k of KROPKI) {
    const t = clamp01((zlozenie - k.d) / LOT)
    if (t <= 0) continue
    if (t >= 1) {
      (k.brzeg ? stojBrzeg : stojWnetrze).push(kolko(k.x, k.y, k.r))
      continue
    }
    const opor = 1 - Math.pow(1 - t, 3)               // wytracanie prędkości przy lądowaniu
    const d = kolko(k.x, k.y - (1 - opor) * OPAD, k.r * 1.25)
    ;(t < 0.3 ? lotSlaby : lotMocny).push(d)
  }

  /* Punkty zaczepienia opisów. */
  const kotwicaOpisu = (cel: string) =>
    cel === 'wezel' ? WEZEL_S : MIASTA.find((m) => m.id === cel) ?? WEZEL_S

  return (
    <div ref={ref} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[52%] h-[360px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.16)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.4 + p * 0.5 }}
      />

      <svg
        viewBox="0 0 900 620"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Połowa planety, której kontynenty układają się z opadających kropek, rozchodząc się od punktu Twoich danych do kolejnych miast"
      >
        <defs>
          <radialGradient id="nbPcCzasza" cx="50%" cy="0%" r="75%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.16)" />
            <stop offset="45%" stopColor="hsl(var(--background) / 0.9)" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </radialGradient>
          {/* Czasza gaśnie ku dołowi — planeta „wychodzi" z kadru, nie ucina się. */}
          <linearGradient id="nbPcZanik" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.6" stopColor="#fff" />
            <stop offset="0.98" stopColor="#000" />
          </linearGradient>
          <radialGradient id="nbPcZanikBok" cx="450" cy="330" r="470" gradientUnits="userSpaceOnUse">
            <stop offset="0.72" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="nbPcMaskaBok" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="620">
            <rect x="0" y="0" width="900" height="620" fill="url(#nbPcZanikBok)" />
          </mask>
          <mask id="nbPcMaska" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="620">
            <rect x="0" y="0" width="900" height="620" fill="url(#nbPcZanik)" mask="url(#nbPcMaskaBok)" />
          </mask>
          <filter id="nbPcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="nbPcAtmo" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <g mask="url(#nbPcMaska)" transform={`translate(0 ${wschod.toFixed(1)})`} opacity={pPlaneta}>
          {/* ── CZASZA I ATMOSFERA ── */}
          <circle cx={OX} cy={OY} r={R} fill="url(#nbPcCzasza)" />
          <circle cx={OX} cy={OY} r={R + 3} stroke={AKCENT} strokeOpacity={0.55} strokeWidth={10} filter="url(#nbPcAtmo)" />
          <circle cx={OX} cy={OY} r={R} stroke={AKCENT} strokeOpacity={0.8} strokeWidth={1.4} />

          {/* ── LĄDY ── */}
          <path d={OCEAN} fill="hsl(var(--primary) / 0.13)" />
          {/* ── LĄDY Z OPADAJĄCYCH KROPEK ── */}
          <path d={stojWnetrze.join('')} fill="hsl(var(--primary) / 0.6)" />
          <path d={stojBrzeg.join('')} fill="hsl(var(--primary))" />
          <g filter="url(#nbPcGlow)">
            <path d={lotSlaby.join('')} fill="hsl(var(--foreground) / 0.35)" />
            <path d={lotMocny.join('')} fill="hsl(var(--foreground) / 0.9)" />
          </g>

          {/* ── MIASTA: zapalają się, gdy dotrze do nich zasięg ── */}
          {MIASTA.map((m, i) => {
            const zap = clamp01((zlozenie - ulozone(m.kat)) / 0.05)
            return (
              <g key={i}>
                {zap > 0.5 && (
                  <circle cx={m.x} cy={m.y} r={4} stroke="hsl(var(--foreground))" strokeWidth={1.2}>
                    <animate attributeName="r" values="4;16" dur="2.4s" begin={`${(i * 0.37) % 2.4}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin={`${(i * 0.37) % 2.4}s`} repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={m.x} cy={m.y} r={3 + zap * 0.8}
                  fill={zap > 0.5 ? 'hsl(var(--foreground))' : 'hsl(var(--background))'}
                  stroke={zap > 0.5 ? 'hsl(var(--foreground))' : 'hsl(var(--foreground) / 0.35)'}
                  strokeWidth={1.3}
                />
              </g>
            )
          })}

          {/* ── WĘZEŁ: JEDYNE MIEJSCE, GDZIE LEŻĄ DANE ── */}
          <g>
            <circle cx={WEZEL_S.x} cy={WEZEL_S.y} r={9} stroke={AKCENT} strokeWidth={1.6}>
              <animate attributeName="r" values="9;30" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx={WEZEL_S.x} cy={WEZEL_S.y} r={18} fill="hsl(var(--primary) / 0.2)" />
            <circle cx={WEZEL_S.x} cy={WEZEL_S.y} r={7} fill={AKCENT} filter="url(#nbPcGlow)" />
            <circle cx={WEZEL_S.x} cy={WEZEL_S.y} r={2.6} fill="hsl(var(--background))" />
          </g>
        </g>

        {/* ── LINIE WSKAŹNIKOWE DO OPISÓW (jak przy asystencie) ── */}
        <g className="hidden sm:block" transform={`translate(0 ${wschod.toFixed(1)})`}>
          {OPISY.map((o) => {
            const widz = wejscie(p, o.at, 0.16)
            if (widz <= 0.01) return null
            const a = kotwicaOpisu(o.cel)
            const koniecX = o.side === 'l' ? o.x + 150 : o.x - 150
            return (
              <g key={o.k} opacity={widz}>
                <line x1={koniecX} y1={o.y} x2={a.x} y2={a.y} stroke={AKCENT} strokeWidth={1.1} strokeDasharray="4 4" opacity={0.7} />
                <circle cx={a.x} cy={a.y} r={3} fill="none" stroke={AKCENT} strokeWidth={1.3} />
                <circle cx={koniecX} cy={o.y} r={2.6} fill={AKCENT} />
              </g>
            )
          })}
        </g>
      </svg>

      {/* ── OPISY — ta sama typografia co przy asystencie ── */}
      {OPISY.map((o) => {
        const widz = wejscie(p, o.at, 0.16)
        return (
          <div
            key={o.k}
            className={cn(
              'pointer-events-none absolute hidden w-[30%] sm:block transition-opacity duration-300',
              o.side === 'r' ? 'text-right' : 'text-left',
            )}
            style={{
              left: o.side === 'l' ? `${(o.x / 900) * 100}%` : undefined,
              right: o.side === 'r' ? `${(1 - o.x / 900) * 100}%` : undefined,
              top: `${((o.y + wschod) / 620) * 100}%`,
              opacity: widz,
              transform: `translate(${(1 - widz) * (o.side === 'r' ? 14 : -14)}px, calc(-100% - 8px))`,
            }}
          >
            <p className="font-sans text-[12.5px] font-bold uppercase leading-none tracking-wide text-primary">
              {`// ${o.num} ${o.head}`}
            </p>
            <p className="mt-1.5 font-sans text-[12.5px] leading-snug text-foreground/80">{o.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
