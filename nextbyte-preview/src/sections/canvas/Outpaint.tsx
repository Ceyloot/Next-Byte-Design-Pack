import { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Expand, Loader2, Maximize2, X } from 'lucide-react'
import '../panel2/fundament/powierzchnie.css'
import { cn } from '@/lib/utils'
import { BYTE_ZA_OBRAZ } from './dostawca'
import { PROPORCJE_OUTPAINT, typWymiarow, ukladRozszerzenia, type Kotwica, type ZadanieRozszerzenia } from './rozszerzanie-kadru'

/**
 * Outpaint: rozszerzenie kadru poza zdjęcie. Wybór proporcji, strony, z której przybywa treść, i (opcjonalnie) opisu nowych miejsc.
 * Podgląd pokazuje, gdzie stanie oryginał w nowym kadrze — dokładnie tak, jak złoży go `outpaint.ts`.
 */

const KIERUNKI: { id: Kotwica; ikona: typeof ArrowLeft; podpis: string }[] = [
  { id: 'srodek', ikona: Maximize2, podpis: 'Wokół' },
  { id: 'lewo', ikona: ArrowLeft, podpis: 'W lewo' },
  { id: 'prawo', ikona: ArrowRight, podpis: 'W prawo' },
  { id: 'gora', ikona: ArrowUp, podpis: 'W górę' },
  { id: 'dol', ikona: ArrowDown, podpis: 'W dół' },
]

export function Outpaint({
  szerokosc,
  wysokosc,
  src,
  model,
  trwa,
  onRozszerz,
  onAnuluj,
  style,
}: {
  szerokosc: number
  wysokosc: number
  src: string
  model: string | undefined
  trwa: boolean
  onRozszerz: (z: ZadanieRozszerzenia) => void
  onAnuluj: () => void
  style: React.CSSProperties
}) {
  // domyślnie proporcje najbardziej różne od obecnych w sensownym kierunku: poziome → 1:1/ pion; pionowe → 16:9
  const [propId, setPropId] = useState(szerokosc / wysokosc >= 1 ? '1:1' : '16:9')
  const [kotwica, setKotwica] = useState<Kotwica>('srodek')
  const [opis, setOpis] = useState('')

  const prop = PROPORCJE_OUTPAINT.find(p => p.id === propId) ?? PROPORCJE_OUTPAINT[0]
  const zadanie: ZadanieRozszerzenia = { proporcja: prop.w / prop.h, kotwica, opis }
  const uklad = useMemo(
    () => ukladRozszerzenia(szerokosc, wysokosc, { proporcja: prop.w / prop.h, kotwica }, typWymiarow(model)),
    [szerokosc, wysokosc, prop.w, prop.h, kotwica, model],
  )

  // podgląd: kadr po rozszerzeniu mieści się w polu 168×104
  const pole = { w: 168, h: 104 }
  const kadrW = uklad?.W ?? szerokosc
  const kadrH = uklad?.H ?? wysokosc
  const k = Math.min(pole.w / kadrW, pole.h / kadrH)

  return (
    <div
      role="dialog"
      aria-label="Outpaint"
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Escape') onAnuluj()
      }}
      className="p2 !bg-transparent absolute z-50 w-[min(292px,calc(100vw-120px))]"
      style={style}
    >
      <div className="p2-szklo p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-primary">
            <Expand className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-semibold text-foreground">Outpaint</span>
          <button type="button" onClick={onAnuluj} aria-label="Zamknij" className="grid h-7 w-7 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Podgląd nowego kadru: oryginał na swoim miejscu, reszta to treść do dorysowania */}
        <div className="mb-2.5 grid h-[116px] place-items-center rounded-[12px] border border-foreground/[0.07] bg-foreground/[0.04]">
          <div className="relative overflow-hidden rounded-[4px] border border-dashed border-primary/50 bg-primary/[0.1]" style={{ width: kadrW * k, height: kadrH * k }}>
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute rounded-[2px] object-cover"
              style={{ left: (uklad?.x ?? 0) * k, top: (uklad?.y ?? 0) * k, width: (uklad?.ow ?? szerokosc) * k, height: (uklad?.oh ?? wysokosc) * k }}
            />
          </div>
        </div>

        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Proporcje</p>
        <div className="mb-2.5 grid grid-cols-4 gap-1">
          {PROPORCJE_OUTPAINT.map(p => (
            <button
              key={p.id}
              type="button"
              aria-pressed={propId === p.id}
              onClick={() => setPropId(p.id)}
              className={cn(
                'flex h-8 items-center justify-center rounded-[10px] border text-[11.5px] font-medium transition-colors',
                propId === p.id ? 'border-primary/40 bg-primary/[0.12] text-primary' : 'border-foreground/[0.07] bg-foreground/[0.045] text-foreground/70 hover:border-primary/30 hover:text-foreground',
              )}
            >
              {p.etykieta}
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Dorysuj</p>
        <div className="mb-2.5 grid grid-cols-5 gap-1">
          {KIERUNKI.map(({ id, ikona: Ik, podpis }) => (
            <button
              key={id}
              type="button"
              title={podpis}
              aria-label={podpis}
              aria-pressed={kotwica === id}
              onClick={() => setKotwica(id)}
              className={cn(
                'grid h-8 place-items-center rounded-[10px] border transition-colors',
                kotwica === id ? 'border-primary/40 bg-primary/[0.12] text-primary' : 'border-foreground/[0.07] bg-foreground/[0.045] text-foreground/70 hover:border-primary/30 hover:text-foreground',
              )}
            >
              <Ik className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <textarea
          value={opis}
          onChange={e => setOpis(e.target.value)}
          rows={2}
          placeholder="Co ma być w nowych miejscach? (opcjonalnie)"
          aria-label="Opis nowych miejsc"
          className="mb-2.5 w-full resize-none rounded-[12px] border border-foreground/[0.07] bg-foreground/[0.045] px-2.5 py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/40"
        />

        <button
          type="button"
          disabled={trwa || !uklad}
          onClick={() => onRozszerz(zadanie)}
          title={!uklad ? 'Zdjęcie ma już te proporcje — wybierz inne' : undefined}
          className="nb-cta flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Expand className="h-4 w-4" />}
          {trwa ? 'Rozszerzam…' : 'Rozszerz'}
          {!trwa && <span className="font-mono text-[11px] tabular-nums opacity-75">· {BYTE_ZA_OBRAZ} ⟠</span>}
        </button>
      </div>
    </div>
  )
}
