import React from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Settings, Music,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

/* Odtwarzacze są sterowane stanem, nie realnym <video>/<audio> — pokazują
   pełny UI i zachowanie transportu (play/pauza, scrub, głośność), a
   podpięcie mediów sprowadza się do przekazania czasu i handlerów. */

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ── 33. Scrubber (wspólny pasek postępu) ───────────────────────────

function Scrubber({
  value, max, onChange, glow,
}: {
  value: number
  max: number
  onChange: (v: number) => void
  glow?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const pct = max > 0 ? (value / max) * 100 : 0

  const seek = React.useCallback((clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    onChange(Math.min(max, Math.max(0, ((clientX - r.left) / r.width) * max)))
  }, [max, onChange])

  React.useEffect(() => {
    function onMove(e: PointerEvent) { if (dragging.current) seek(e.clientX) }
    function onUp() { dragging.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [seek])

  return (
    <div
      ref={ref}
      onPointerDown={(e) => { dragging.current = true; seek(e.clientX) }}
      className="group/scrub relative h-4 cursor-pointer touch-none py-1.5"
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/15">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${pct}%`, boxShadow: glow ? '0 0 8px hsl(var(--primary)/0.6)' : undefined }}
        />
      </div>
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover/scrub:opacity-100"
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}

// ── 34. VideoPlayer ────────────────────────────────────────────────

export function GlassVideoPlayer({
  title,
  duration = 754,
  poster,
  className,
}: {
  title?: string
  /** Długość w sekundach. */
  duration?: number
  /** Węzeł tła — np. <img> albo gradient. */
  poster?: React.ReactNode
  className?: string
}) {
  const { isGlass } = useGlass()
  const [playing, setPlaying] = React.useState(false)
  const [t, setT] = React.useState(0)
  const [muted, setMuted] = React.useState(false)

  // Symulacja transportu — realny player podmieni to na timeupdate.
  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT((v) => (v >= duration ? (setPlaying(false), duration) : v + 1)), 1000)
    return () => clearInterval(id)
  }, [playing, duration])

  return (
    <div className={cn(
      'group relative aspect-video w-full overflow-hidden rounded-2xl',
      isGlass ? 'nb-szklo' : 'border border-border bg-card',
      className,
    )}>
      <div className="absolute inset-0">
        {poster ?? <div className="h-full w-full bg-gradient-to-br from-primary/25 via-sky-700/20 to-blue-800/20" />}
      </div>

      {/* Duży przycisk na środku — znika, gdy leci odtwarzanie. */}
      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Odtwórz"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/25 backdrop-blur-sm transition-transform hover:scale-105">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </span>
        </button>
      )}

      {title && (
        <p className="absolute inset-x-0 top-0 truncate bg-gradient-to-b from-black/60 to-transparent px-4 pb-6 pt-3 text-xs font-semibold text-white">
          {title}
        </p>
      )}

      <div className={cn(
        'absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity',
        playing && 'opacity-0 group-hover:opacity-100',
      )}>
        <Scrubber value={t} max={duration} onChange={setT} glow={isGlass} />
        <div className="flex items-center gap-2 text-white">
          <button onClick={() => setPlaying((v) => !v)} aria-label={playing ? 'Pauza' : 'Odtwórz'}>
            {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          </button>
          <button onClick={() => setT((v) => Math.max(0, v - 10))} aria-label="Cofnij 10 s">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setT((v) => Math.min(duration, v + 10))} aria-label="Do przodu 10 s">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Włącz dźwięk' : 'Wycisz'}>
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <span className="ml-1 font-mono text-[10px] tabular-nums text-white/80">
            {fmtTime(t)} / {fmtTime(duration)}
          </span>
          <button className="ml-auto" aria-label="Ustawienia"><Settings className="h-3.5 w-3.5" /></button>
          <button aria-label="Pełny ekran"><Maximize2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  )
}

// ── 35. AudioPlayer + Waveform ─────────────────────────────────────

/** Deterministyczny „waveform" — ten sam tytuł zawsze daje ten sam
 *  kształt, więc podgląd nie skacze przy każdym renderze. */
function bars(seed: string, n: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0
    return 0.25 + ((h >>> 16) % 100) / 100 * 0.75 * (0.6 + 0.4 * Math.sin(i / 4))
  })
}

export function GlassAudioPlayer({
  title,
  artist,
  duration = 214,
  showWaveform = true,
  className,
}: {
  title: string
  artist?: string
  duration?: number
  showWaveform?: boolean
  className?: string
}) {
  const { isGlass } = useGlass()
  const [playing, setPlaying] = React.useState(false)
  const [t, setT] = React.useState(0)
  const wave = React.useMemo(() => bars(title, 48), [title])

  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT((v) => (v >= duration ? (setPlaying(false), duration) : v + 1)), 1000)
    return () => clearInterval(id)
  }, [playing, duration])

  const progress = duration > 0 ? t / duration : 0

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl p-3',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      className,
    )}>
      <button
        onClick={() => setPlaying((v) => !v)}
        aria-label={playing ? 'Pauza' : 'Odtwórz'}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
          isGlass
            ? 'bg-primary/25 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Music className="h-3 w-3 shrink-0 text-primary/70" />
          <p className="truncate text-[12px] font-semibold text-foreground">{title}</p>
          {artist && <p className="truncate text-[10px] text-foreground/45">{artist}</p>}
          <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-foreground/40">
            {fmtTime(t)} / {fmtTime(duration)}
          </span>
        </div>

        {showWaveform ? (
          <div
            className="mt-1.5 flex h-7 cursor-pointer items-center gap-[2px]"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setT(((e.clientX - r.left) / r.width) * duration)
            }}
          >
            {wave.map((h, i) => (
              <span
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors',
                  i / wave.length <= progress ? 'bg-primary' : 'bg-foreground/15',
                )}
                style={{
                  height: `${h * 100}%`,
                  boxShadow: isGlass && i / wave.length <= progress ? '0 0 4px hsl(var(--primary)/0.5)' : undefined,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-1">
            <Scrubber value={t} max={duration} onChange={setT} glow={isGlass} />
          </div>
        )}
      </div>
    </div>
  )
}
