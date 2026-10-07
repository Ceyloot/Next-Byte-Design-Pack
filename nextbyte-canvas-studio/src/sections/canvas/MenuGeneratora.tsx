import { useState } from 'react'
import { cn } from '@/lib/utils'

const PROPORCJE: { id: string; w: number; h: number; etykieta: string }[] = [
  { id: '1:1', w: 1, h: 1, etykieta: '1:1' },
  { id: '3:2', w: 3, h: 2, etykieta: '3:2' },
  { id: '2:3', w: 2, h: 3, etykieta: '2:3' },
  { id: '4:3', w: 4, h: 3, etykieta: '4:3' },
  { id: '3:4', w: 3, h: 4, etykieta: '3:4' },
  { id: '9:16', w: 9, h: 16, etykieta: '9:16' },
  { id: '16:9', w: 16, h: 9, etykieta: '16:9' },
  { id: '21:9', w: 21, h: 9, etykieta: '21:9' },
]

const MIN = 256
const MAX = 4096

/** Panel „Generuj zdjęcie”: wymiary i proporcje (jak w Lovart), potem pusta ramka na płótnie z prompterem. */
export function MenuGeneratora({ onUtworz }: { onUtworz: (szer: number, wys: number) => void }) {
  const [szer, setSzer] = useState(1024)
  const [wys, setWys] = useState(1024)
  const [proporcja, setProporcja] = useState<string | null>('1:1')
  const klamp = (v: number) => Math.max(MIN, Math.min(MAX, Math.round(v) || MIN))
  const wybierz = (p: (typeof PROPORCJE)[number]) => {
    setProporcja(p.id)
    setWys(klamp((szer * p.h) / p.w))
  }
  return (
    <div
      role="dialog"
      aria-label="Generuj zdjęcie"
      onPointerDown={e => e.stopPropagation()}
      className="nb-szklo nb-szklo-plynne nb-powierzchnia w-[312px] rounded-[24px] border border-foreground/[0.08] p-4"
      style={{ backgroundColor: 'hsl(var(--card) / 0.9)' }}
    >
      <p className="text-[13px] font-semibold text-foreground">Generuj zdjęcie</p>
      <p className="mb-2 mt-3 text-[11px] font-medium text-muted-foreground">Wymiary</p>
      <div className="flex items-center gap-2">
        {([['W', szer, (v: number) => { setSzer(klamp(v)); setProporcja(null) }], ['H', wys, (v: number) => { setWys(klamp(v)); setProporcja(null) }]] as const).map(([et, wart, ustaw]) => (
          <label key={et} className="flex flex-1 items-center gap-1.5 rounded-xl border border-foreground/[0.07] bg-foreground/[0.045] px-3 py-2 text-[12px] text-muted-foreground">
            {et}
            <input
              type="number"
              min={MIN}
              max={MAX}
              value={wart}
              onChange={e => ustaw(Number(e.target.value))}
              className="w-full min-w-0 bg-transparent text-foreground outline-none"
              aria-label={et === 'W' ? 'Szerokość' : 'Wysokość'}
            />
          </label>
        ))}
      </div>
      <p className="mb-2 mt-3 text-[11px] font-medium text-muted-foreground">Proporcje</p>
      <div className="grid grid-cols-4 gap-1.5">
        {PROPORCJE.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => wybierz(p)}
            aria-pressed={proporcja === p.id}
            className={cn(
              'flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10.5px] transition-all duration-150 active:scale-95',
              proporcja === p.id ? 'border-primary/40 bg-primary/[0.12] text-primary' : 'border-foreground/[0.07] bg-foreground/[0.045] text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground',
            )}
          >
            <span
              className="rounded-[3px] border border-current"
              style={{ width: 18 * Math.min(1, p.w / Math.max(p.w, p.h)) + 4, height: 18 * Math.min(1, p.h / Math.max(p.w, p.h)) + 4 }}
            />
            {p.etykieta}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onUtworz(szer, wys)}
        className="nb-cta nb-refleks-krawedzi mt-4 flex h-11 w-full items-center justify-center rounded-[14px] text-[13px] font-semibold"
      >
        Utwórz ramkę {szer} × {wys}
      </button>
    </div>
  )
}
