import React from 'react'
import { ArrowUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

// ── 48. QrCode ─────────────────────────────────────────────────────

/* Generator QR bez zależności. Implementuje tryb bajtowy, poziom korekcji
   L i automatyczny dobór wersji 1–10 — wystarcza na URL-e do ~270 znaków,
   a to pokrywa realne zastosowania w UI (link, token, adres płatności). */

const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]
})()

function gfMul(a: number, b: number) {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function rsGenerator(deg: number) {
  let poly = [1]
  for (let i = 0; i < deg; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1)
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i])
    }
    poly = next
  }
  return poly
}

function rsEncode(data: number[], ecLen: number) {
  const gen = rsGenerator(ecLen)
  const res = new Array(ecLen).fill(0)
  for (const byte of data) {
    const factor = byte ^ res[0]
    res.shift()
    res.push(0)
    for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1], factor)
  }
  return res
}

// [wersja]: [całkowita liczba bajtów danych, liczba bajtów EC na blok] dla poziomu L, 1 blok
const VERSION_L: Record<number, { data: number; ec: number }> = {
  1: { data: 19, ec: 7 },   2: { data: 34, ec: 10 },  3: { data: 55, ec: 15 },
  4: { data: 80, ec: 20 },  5: { data: 108, ec: 26 }, 6: { data: 136, ec: 18 },
}

const ALIGN_POS: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
}

function buildQR(text: string): boolean[][] | null {
  const bytes = Array.from(new TextEncoder().encode(text))

  let version = 0
  for (const v of [1, 2, 3, 4, 5, 6]) {
    // 4 bity trybu + 8 bitów długości + dane, zaokrąglone w górę do bajtu
    if (bytes.length + 2 <= VERSION_L[v].data) { version = v; break }
  }
  if (!version) return null

  const { data: dataCap, ec: ecLen } = VERSION_L[version]
  const size = 17 + version * 4

  // ── Strumień bitów ──
  const bits: number[] = []
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1)
  }
  push(0b0100, 4)          // tryb bajtowy
  push(bytes.length, 8)    // długość (wersje 1–9)
  for (const b of bytes) push(b, 8)
  push(0, Math.min(4, dataCap * 8 - bits.length))
  while (bits.length % 8) bits.push(0)

  const codewords: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0))
  }
  // Wypełniacze naprzemienne wg specyfikacji
  const PAD = [0xec, 0x11]
  let p = 0
  while (codewords.length < dataCap) codewords.push(PAD[p++ % 2])

  const all = [...codewords, ...rsEncode(codewords, ecLen)]

  // ── Macierz ──
  const m: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null))

  const setFinder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const rr = r + i, cc = c + j
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue
        const inRing = i >= 0 && i <= 6 && j >= 0 && j <= 6
        const on = inRing && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))
        m[rr][cc] = on
      }
    }
  }
  setFinder(0, 0); setFinder(0, size - 7); setFinder(size - 7, 0)

  for (let i = 8; i < size - 8; i++) {
    const on = i % 2 === 0
    if (m[6][i] === null) m[6][i] = on
    if (m[i][6] === null) m[i][6] = on
  }

  for (const ar of ALIGN_POS[version]) {
    for (const ac of ALIGN_POS[version]) {
      if (m[ar][ac] !== null) continue
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          m[ar + i][ac + j] = Math.max(Math.abs(i), Math.abs(j)) !== 1
        }
      }
    }
  }

  m[size - 8][8] = true // ciemny moduł

  // Rezerwacja pól informacji o formacie
  const reserved = new Set<string>()
  for (let i = 0; i < 9; i++) {
    reserved.add(`8,${i}`); reserved.add(`${i},8`)
  }
  for (let i = 0; i < 8; i++) {
    reserved.add(`8,${size - 1 - i}`); reserved.add(`${size - 1 - i},8`)
  }

  // ── Układanie danych zygzakiem od prawego dolnego rogu ──
  let bitIdx = 0
  const dataBits: number[] = []
  for (const cw of all) for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1)

  let upward = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--
    for (let n = 0; n < size; n++) {
      const row = upward ? size - 1 - n : n
      for (const c of [col, col - 1]) {
        if (m[row][c] !== null || reserved.has(`${row},${c}`)) continue
        let bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0
        // Maska 0: (row + col) % 2 === 0
        if ((row + c) % 2 === 0) bit ^= 1
        m[row][c] = bit === 1
      }
    }
    upward = !upward
  }

  // ── Informacja o formacie (poziom L, maska 0) ──
  const FORMAT_L0 = 0b111011111000100
  const fmtBit = (i: number) => ((FORMAT_L0 >> i) & 1) === 1
  for (let i = 0; i <= 5; i++) m[8][i] = fmtBit(i)
  m[8][7] = fmtBit(6); m[8][8] = fmtBit(7); m[7][8] = fmtBit(8)
  for (let i = 9; i <= 14; i++) m[14 - i][8] = fmtBit(i)
  for (let i = 0; i <= 7; i++) m[size - 1 - i][8] = fmtBit(i)
  for (let i = 8; i <= 14; i++) m[8][size - 15 + i] = fmtBit(i)

  return m.map((row) => row.map((c) => c === true))
}

export function GlassQrCode({
  value,
  size = 148,
  quiet = 2,
  label,
  className,
}: {
  value: string
  size?: number
  /** Margines w modułach — norma wymaga 4, w UI 2 zwykle wystarcza. */
  quiet?: number
  label?: string
  className?: string
}) {
  const { isGlass } = useGlass()
  const matrix = React.useMemo(() => buildQR(value), [value])

  if (!matrix) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 text-[11px] text-destructive', className)}
           style={{ width: size, height: size }}>
        Tekst za długi
      </div>
    )
  }

  const n = matrix.length
  const total = n + quiet * 2

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className={cn('rounded-2xl p-2.5', isGlass ? 'nb-szklo' : 'border border-border bg-card')}>
        <svg
          width={size} height={size} viewBox={`0 0 ${total} ${total}`}
          shapeRendering="crispEdges" role="img" aria-label={label ?? `Kod QR: ${value}`}
        >
          <rect width={total} height={total} fill="white" rx={1} />
          {matrix.map((row, r) =>
            row.map((on, c) => on
              ? <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1} height={1} fill="black" />
              : null),
          )}
        </svg>
      </div>
      {label && <p className="max-w-[180px] truncate text-center text-[10px] text-foreground/45">{label}</p>}
    </div>
  )
}

// ── 49. Countdown + RelativeTime ───────────────────────────────────

export function GlassCountdown({
  to,
  onDone,
  compact = false,
  className,
}: {
  to: Date
  onDone?: () => void
  compact?: boolean
  className?: string
}) {
  const { isGlass } = useGlass()
  const [left, setLeft] = React.useState(() => Math.max(0, to.getTime() - Date.now()))

  React.useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, to.getTime() - Date.now())
      setLeft(ms)
      if (ms === 0) { clearInterval(id); onDone?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [to, onDone])

  const s = Math.floor(left / 1000)
  const parts = [
    { v: Math.floor(s / 86400),      label: 'dni' },
    { v: Math.floor((s % 86400) / 3600), label: 'godz' },
    { v: Math.floor((s % 3600) / 60),    label: 'min' },
    { v: s % 60,                      label: 'sek' },
  ]

  if (compact) {
    return (
      <span className={cn('font-mono text-sm font-bold tabular-nums text-primary', className)}>
        {parts.map((p) => String(p.v).padStart(2, '0')).join(':')}
      </span>
    )
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {parts.map((p) => (
        <div
          key={p.label}
          className={cn(
            'flex min-w-[52px] flex-col items-center rounded-xl px-2 py-1.5',
            isGlass ? 'nb-szklo' : 'border border-border bg-card',
          )}
        >
          <span className={cn('font-mono text-lg font-bold tabular-nums text-foreground', isGlass && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.3)]')}>
            {String(p.v).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase tracking-wide text-foreground/40">{p.label}</span>
        </div>
      ))}
    </div>
  )
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000], ['month', 2592000], ['week', 604800],
  ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
]

/** Auto-odświeżający się względny czas („2 minuty temu"). */
export function GlassRelativeTime({
  date,
  className,
}: {
  date: Date
  className?: string
}) {
  const [, tick] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    // Odświeżanie co 30 s wystarcza — poniżej minuty i tak pokazujemy sekundy.
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  const text = React.useMemo(() => {
    const diff = (date.getTime() - Date.now()) / 1000
    const abs = Math.abs(diff)
    const rtf = new Intl.RelativeTimeFormat('pl', { numeric: 'auto' })
    for (const [unit, secs] of UNITS) {
      if (abs >= secs || unit === 'second') {
        return rtf.format(Math.round(diff / secs), unit)
      }
    }
    return ''
  }, [date])

  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString('pl-PL')} className={className}>
      {text}
    </time>
  )
}

// ── 50. BackToTop + TableOfContents ────────────────────────────────

export function GlassBackToTop({
  /** Po ilu pikselach przewinięcia przycisk się pojawia. */
  threshold = 320,
  target,
  className,
}: {
  threshold?: number
  /** Element przewijany — domyślnie okno. */
  target?: React.RefObject<HTMLElement>
  className?: string
}) {
  const { isGlass } = useGlass()
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const el = target?.current
    const read = () => setShow((el ? el.scrollTop : window.scrollY) > threshold)
    const node: HTMLElement | Window = el ?? window
    node.addEventListener('scroll', read, { passive: true })
    read()
    return () => node.removeEventListener('scroll', read)
  }, [threshold, target])

  if (!show) return null

  return (
    <button
      onClick={() => (target?.current ?? window).scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Wróć na górę"
      className={cn(
        'fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full transition-all animate-in fade-in-0 zoom-in-90',
        isGlass
          ? 'nb-szklo nb-szklo-plynne text-primary shadow-[0_0_14px_hsl(var(--primary)/0.25)]'
          : 'border border-border bg-card text-primary shadow-lg',
        'hover:-translate-y-0.5',
        className,
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}

export interface TocEntry {
  id: string
  label: string
  level?: 1 | 2
}

/** Spis treści z podświetleniem aktywnej sekcji przez IntersectionObserver. */
export function GlassToc({
  entries,
  title = 'Na tej stronie',
  className,
}: {
  entries: TocEntry[]
  title?: string
  className?: string
}) {
  const { isGlass } = useGlass()
  const [active, setActive] = React.useState<string | null>(entries[0]?.id ?? null)

  React.useEffect(() => {
    const els = entries.map((e) => document.getElementById(e.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (ents) => {
        const visible = ents.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      // Górny pas ekranu decyduje o „bieżącej" sekcji.
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [entries])

  return (
    <nav className={cn(
      'flex flex-col gap-1 rounded-2xl p-3',
      isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-card',
      className,
    )}>
      <p className="mb-1 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35">
        <List className="h-3 w-3" />{title}
      </p>
      {entries.map((e) => (
        <button
          key={e.id}
          onClick={() => document.getElementById(e.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={cn(
            'truncate rounded-lg px-2 py-1 text-left text-[11.5px] transition-colors',
            e.level === 2 && 'pl-5',
            active === e.id
              ? cn('font-semibold text-primary', isGlass ? 'bg-primary/[0.12]' : 'bg-primary/[0.08]')
              : 'text-foreground/55 hover:bg-foreground/[0.05] hover:text-foreground',
          )}
        >
          {e.label}
        </button>
      ))}
    </nav>
  )
}
