import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, X } from 'lucide-react'

/**
 * Pływający prompter nad zdjęciem: po zamalowaniu pędzlem („co zrobić w tym obszarze?”)
 * albo pod pustą ramką generatora („co mamy stworzyć?”). Szkło jak reszta chromu Canvasa.
 */
export function Prompter({
  etykieta,
  placeholder,
  trwa,
  onWyslij,
  onAnuluj,
  srednica,
  onSrednica,
  style,
}: {
  etykieta: string
  placeholder: string
  trwa: boolean
  onWyslij: (tekst: string) => void
  onAnuluj: () => void
  srednica?: number
  onSrednica?: (v: number) => void
  style: React.CSSProperties
}) {
  const [tekst, setTekst] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const wyslij = () => {
    if (trwa || !tekst.trim()) return
    onWyslij(tekst.trim())
  }
  return (
    <div
      role="group"
      aria-label={etykieta}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      className="absolute z-50 w-[min(560px,calc(100vw-120px))]"
      style={style}
    >
      <div className="nb-szklo nb-szklo-plynne nb-powierzchnia flex items-center gap-2 rounded-2xl border border-foreground/[0.12] p-1.5 shadow-2xl" style={{ backgroundColor: 'hsl(var(--card) / 0.86)' }}>
        <span className="shrink-0 rounded-lg border border-foreground/[0.12] bg-foreground/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-foreground/70">{etykieta}</span>
        <input
          ref={ref}
          value={tekst}
          onChange={e => setTekst(e.target.value)}
          onKeyDown={e => {
            e.stopPropagation()
            if (e.key === 'Enter') {
              e.preventDefault()
              wyslij()
            }
            if (e.key === 'Escape') onAnuluj()
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent px-1 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {onSrednica && srednica !== undefined && (
          <label className="flex shrink-0 items-center gap-1.5 text-[10.5px] text-muted-foreground" title="Rozmiar pędzla">
            Pędzel
            <input
              type="range"
              min={1}
              max={20}
              value={Math.round(srednica * 100)}
              onChange={e => onSrednica(Number(e.target.value) / 100)}
              className="h-1 w-16 accent-[hsl(var(--primary))]"
            />
          </label>
        )}
        <button type="button" onClick={onAnuluj} aria-label="Anuluj" title="Anuluj (Esc)" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-foreground/[0.12] bg-foreground/[0.05] text-foreground/60 transition-colors hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={wyslij}
          disabled={trwa || !tekst.trim()}
          aria-label="Generuj"
          title="Generuj (Enter)"
          className="nb-cta nb-refleks-krawedzi grid h-8 w-8 shrink-0 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4 text-primary" />}
        </button>
      </div>
    </div>
  )
}
