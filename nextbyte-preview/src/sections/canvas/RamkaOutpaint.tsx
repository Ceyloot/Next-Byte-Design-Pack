import { useRef } from 'react'
import { MAKS_MARGINES, type Marginesy } from './rozszerzanie-kadru'

/**
 * Ramka outpaintu na płótnie: zdjęcie leży w środku, a użytkownik przeciąga boki i rogi, żeby samemu wybrać, o ile i w którą stronę
 * rośnie kadr (1:1 → 3:4, tylko w prawo, dowolnie). Margines to ułamek rozmiaru ORYGINAŁU, więc nie zależy od przybliżenia płótna.
 * Alt przy przeciąganiu = symetrycznie z obu stron. Po puszczeniu uchwytu rodzic dociąga kadr do formatu modelu (`onKoniec`).
 */
type Uchwyt = 'l' | 'r' | 't' | 'b' | 'lt' | 'rt' | 'lb' | 'rb'
const UCHWYTY: { id: Uchwyt; x: 0 | 0.5 | 1; y: 0 | 0.5 | 1; kursor: string }[] = [
  { id: 'lt', x: 0, y: 0, kursor: 'nwse-resize' },
  { id: 't', x: 0.5, y: 0, kursor: 'ns-resize' },
  { id: 'rt', x: 1, y: 0, kursor: 'nesw-resize' },
  { id: 'l', x: 0, y: 0.5, kursor: 'ew-resize' },
  { id: 'r', x: 1, y: 0.5, kursor: 'ew-resize' },
  { id: 'lb', x: 0, y: 1, kursor: 'nesw-resize' },
  { id: 'b', x: 0.5, y: 1, kursor: 'ns-resize' },
  { id: 'rb', x: 1, y: 1, kursor: 'nwse-resize' },
]

export function RamkaOutpaint({
  warstwa,
  widok,
  marginesy,
  onZmiana,
  onKoniec,
}: {
  warstwa: { x: number; y: number; width: number; height: number }
  widok: { x: number; y: number; zoom: number }
  marginesy: Marginesy
  onZmiana: (m: Marginesy) => void
  onKoniec: (m: Marginesy) => void
}) {
  const start = useRef<{ id: Uchwyt; px: number; py: number; m: Marginesy } | null>(null)
  const ostatnie = useRef(marginesy)
  ostatnie.current = marginesy

  // zdjęcie na ekranie
  const zx = widok.x + warstwa.x * widok.zoom
  const zy = widok.y + warstwa.y * widok.zoom
  const zw = warstwa.width * widok.zoom
  const zh = warstwa.height * widok.zoom
  // cała ramka na ekranie
  const L = zx - marginesy.l * zw
  const T = zy - marginesy.t * zh
  const R = zx + zw + marginesy.r * zw
  const B = zy + zh + marginesy.b * zh

  const ruch = (e: React.PointerEvent) => {
    const s = start.current
    if (!s) return
    const dx = (e.clientX - s.px) / zw // ułamek szerokości oryginału
    const dy = (e.clientY - s.py) / zh
    const sym = e.altKey
    const k = (v: number) => Math.min(MAKS_MARGINES, Math.max(0, v))
    const m = { ...s.m }
    if (s.id.includes('l')) { m.l = k(s.m.l - dx); if (sym) m.r = m.l }
    if (s.id.includes('r')) { m.r = k(s.m.r + dx); if (sym) m.l = m.r }
    if (s.id.includes('t')) { m.t = k(s.m.t - dy); if (sym) m.b = m.t }
    if (s.id.includes('b')) { m.b = k(s.m.b + dy); if (sym) m.t = m.b }
    onZmiana(m)
  }
  const koniec = (e: React.PointerEvent) => {
    if (!start.current) return
    start.current = null
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* już zwolniony */ }
    onKoniec(ostatnie.current)
  }

  // obszar do dorysowania = ramka bez zdjęcia (clip-path z dziurą), żeby oryginał był dalej widać w całości
  const dziura = `polygon(evenodd, 0 0, ${R - L}px 0, ${R - L}px ${B - T}px, 0 ${B - T}px, 0 0, ${zx - L}px ${zy - T}px, ${zx - L}px ${zy - T + zh}px, ${zx - L + zw}px ${zy - T + zh}px, ${zx - L + zw}px ${zy - T}px, ${zx - L}px ${zy - T}px)`

  return (
    <div className="pointer-events-none absolute inset-0 z-[45]" data-ramka-outpaint>
      <div className="absolute" style={{ left: L, top: T, width: R - L, height: B - T }}>
        <div className="absolute inset-0 bg-primary/[0.14]" style={{ clipPath: dziura }} />
        <div className="absolute inset-0 rounded-[2px] border-2 border-dashed border-primary/80" />
        {UCHWYTY.map(u => (
          <button
            key={u.id}
            type="button"
            aria-label={`Rozszerz kadr: ${u.id}`}
            onPointerDown={e => {
              e.stopPropagation()
              e.preventDefault()
              ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
              start.current = { id: u.id, px: e.clientX, py: e.clientY, m: marginesy }
            }}
            onPointerMove={ruch}
            onPointerUp={koniec}
            onPointerCancel={koniec}
            className="pointer-events-auto absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center"
            style={{ left: `${u.x * 100}%`, top: `${u.y * 100}%`, cursor: u.kursor }}
          >
            <span className="block h-3 w-3 rounded-[4px] border-2 border-primary bg-background shadow-[0_0_0_2px_hsl(var(--background)/0.6)]" />
          </button>
        ))}
        <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground/80 backdrop-blur">
          Przeciągnij brzegi · Alt = z obu stron
        </span>
      </div>
    </div>
  )
}
