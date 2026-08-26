import React from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

/* Media bez zewnętrznych zasobów: „obraz" to gradient + ikona, żeby
   demo działało offline i pod CSP. W realnym użyciu podmieniasz
   `render` na <img>. */

export interface GalleryItem {
  id: string
  title?: string
  caption?: string
  gradient?: string
  icon?: React.ComponentType<{ className?: string }>
  /** Własny węzeł zamiast placeholdera — tu wstawiasz <img>. */
  render?: React.ReactNode
}

function Frame({ item, className }: { item: GalleryItem; className?: string }) {
  const Icon = item.icon
  if (item.render) return <div className={cn('h-full w-full', className)}>{item.render}</div>
  return (
    <div className={cn(
      'flex h-full w-full items-center justify-center bg-gradient-to-br',
      item.gradient ?? 'from-primary/30 via-sky-600/20 to-blue-600/15',
      className,
    )}>
      {Icon && <Icon className="h-7 w-7 text-white/60" />}
    </div>
  )
}

// ── 29. Gallery ────────────────────────────────────────────────────

export function GlassGallery({
  items,
  cols = 3,
  masonry = false,
  onOpen,
  className,
}: {
  items: GalleryItem[]
  cols?: 2 | 3 | 4
  /** Nierówne wysokości w układzie kolumnowym. */
  masonry?: boolean
  onOpen?: (index: number) => void
  className?: string
}) {
  const colCls = cols === 2 ? 'sm:grid-cols-2' : cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-3'
  const colMasonry = cols === 2 ? 'sm:columns-2' : cols === 4 ? 'columns-2 sm:columns-4' : 'sm:columns-3'

  const tile = (it: GalleryItem, i: number) => (
    <button
      key={it.id}
      onClick={() => onOpen?.(i)}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl',
        !masonry && 'aspect-square',
        masonry && 'mb-2 break-inside-avoid',
      )}
      style={masonry ? { height: 110 + (i % 3) * 55 } : undefined}
    >
      <Frame item={it} />
      <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-5 w-5 text-white" />
      </span>
      {it.title && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] font-medium text-white">
          {it.title}
        </span>
      )}
    </button>
  )

  return masonry
    ? <div className={cn('columns-1 gap-2', colMasonry, className)}>{items.map(tile)}</div>
    : <div className={cn('grid grid-cols-2 gap-2', colCls, className)}>{items.map(tile)}</div>
}

// ── 30. Lightbox ───────────────────────────────────────────────────

export function GlassLightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: GalleryItem[]
  /** null zamyka nakładkę. */
  index: number | null
  onClose: () => void
  onIndexChange: (i: number) => void
}) {
  const open = index !== null

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndexChange((index! + 1) % items.length)
      if (e.key === 'ArrowLeft')  onIndexChange((index! - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, items.length, onClose, onIndexChange])

  if (!open) return null
  const it = items[index!]

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md animate-in fade-in-0 duration-150" onClick={onClose} />

      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground"
        aria-label="Zamknij"
      >
        <X className="h-4 w-4" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={() => onIndexChange((index! - 1 + items.length) % items.length)}
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground"
            aria-label="Poprzedni"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onIndexChange((index! + 1) % items.length)}
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground"
            aria-label="Następny"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <figure className="relative z-[1] flex max-h-full w-full max-w-3xl flex-col gap-3 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="aspect-video w-full overflow-hidden rounded-2xl">
          <Frame item={it} />
        </div>
        <figcaption className="text-center">
          {it.title && <p className="text-sm font-semibold text-foreground">{it.title}</p>}
          {it.caption && <p className="mt-0.5 text-xs text-foreground/50">{it.caption}</p>}
          <p className="mt-1.5 font-mono text-[10px] text-foreground/30 tabular-nums">
            {index! + 1} / {items.length}
          </p>
        </figcaption>
      </figure>
    </div>
  )
}

// ── 31. Carousel ───────────────────────────────────────────────────

export function GlassCarousel({
  items,
  autoPlay = false,
  interval = 4000,
  className,
}: {
  items: GalleryItem[]
  autoPlay?: boolean
  interval?: number
  className?: string
}) {
  const { isGlass } = useGlass()
  const [i, setI] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (!autoPlay || paused || items.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % items.length), interval)
    return () => clearInterval(t)
  }, [autoPlay, paused, interval, items.length])

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={cn(
        'relative aspect-[16/7] w-full overflow-hidden rounded-2xl',
        isGlass ? 'nb-szklo' : 'border border-border',
      )}>
        {/* Tor przesuwa się o -100% na slajd — jedna warstwa, brak
            przeładowywania zawartości przy zmianie indeksu. */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {items.map((it) => (
            <div key={it.id} className="relative h-full w-full shrink-0">
              <Frame item={it} />
              {(it.title || it.caption) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10">
                  {it.title && <p className="text-sm font-bold text-white">{it.title}</p>}
                  {it.caption && <p className="mt-0.5 text-[11px] text-white/70">{it.caption}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={() => setI((v) => (v - 1 + items.length) % items.length)}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
              aria-label="Poprzedni slajd"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((v) => (v + 1) % items.length)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
              aria-label="Następny slajd"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slajd ${idx + 1}`}
            className={cn(
              'rounded-full transition-all duration-300',
              idx === i
                ? cn('h-1.5 w-5 bg-primary', isGlass && 'shadow-[0_0_8px_hsl(var(--primary)/0.5)]')
                : 'h-1.5 w-1.5 bg-foreground/20 hover:bg-foreground/40',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── 32. ImageCompare ───────────────────────────────────────────────

export function GlassImageCompare({
  before,
  after,
  labelBefore = 'Przed',
  labelAfter = 'Po',
  className,
}: {
  before: GalleryItem
  after: GalleryItem
  labelBefore?: string
  labelAfter?: string
  className?: string
}) {
  const [pct, setPct] = React.useState(50)
  const ref = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  // Wspólna ścieżka dla myszy i dotyku — liczy pozycję z clientX
  // względem kontenera i przycina do 0–100.
  const move = React.useCallback((clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPct(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  React.useEffect(() => {
    function onMove(e: PointerEvent) { if (dragging.current) move(e.clientX) }
    function onUp() { dragging.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [move])

  return (
    <div
      ref={ref}
      onPointerDown={(e) => { dragging.current = true; move(e.clientX) }}
      className={cn('relative aspect-video w-full cursor-ew-resize select-none overflow-hidden rounded-2xl', className)}
    >
      <Frame item={after} />
      <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {labelAfter}
      </span>

      {/* Warstwa „przed" przycięta do pozycji suwaka. */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Frame item={before} />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {labelBefore}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${pct}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <ChevronLeft className="h-3 w-3 text-black" />
          <ChevronRight className="h-3 w-3 text-black" />
        </span>
      </div>
    </div>
  )
}
