import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Eraser, Loader2, Paintbrush, X } from 'lucide-react'

/**
 * Pływający prompter nad zdjęciem: po zamalowaniu pędzlem („co zrobić w tym obszarze?”)
 * albo pod pustą ramką generatora („co mamy stworzyć?”). Szkło jak reszta chromu Canvasa.
 */
export function Prompter({
  etykieta,
  placeholder,
  trwa,
  blokada,
  bezTekstu,
  onWyslij,
  onAnuluj,
  srednica,
  onSrednica,
  gumka,
  onGumka,
  style,
}: {
  etykieta: string
  placeholder: string
  trwa: boolean
  /** blokuje wysyłanie (np. inpainting, dopóki nic nie zamalowano) */
  blokada?: boolean
  /** wysyłanie bez wpisanego tekstu (eraser: samo zamalowanie wystarczy) */
  bezTekstu?: boolean
  onWyslij: (tekst: string) => void
  onAnuluj: () => void
  srednica?: number
  onSrednica?: (v: number) => void
  /** pędzel / gumka (ścieranie zamalowanej maski) */
  gumka?: boolean
  onGumka?: (v: boolean) => void
  style: React.CSSProperties
}) {
  const [tekst, setTekst] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  // po zamalowaniu fokus wraca do pola — Enter od razu wysyła (eraser nie wymaga tekstu)
  useEffect(() => {
    if (!blokada) ref.current?.focus()
  }, [blokada])
  const wyslij = () => {
    if (trwa || blokada || (!bezTekstu && !tekst.trim())) return
    onWyslij(tekst.trim())
  }
  return (
    <div
      role="group" data-prompter
      aria-label={etykieta}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      className="nb-prompter absolute z-50 w-[min(560px,calc(100vw-120px))]"
      style={style}
    >
      <div className="nb-cozy-plyta flex items-center gap-2 rounded-2xl border p-2">
        <span className="shrink-0 rounded-xl bg-primary/[0.1] px-3 py-1.5 text-[11.5px] font-semibold text-primary">{etykieta}</span>
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
          className="min-w-0 flex-1 bg-transparent px-1.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {onGumka && (
          <div role="group" aria-label="Narzędzie maski" className="flex shrink-0 items-center gap-0.5 rounded-xl bg-foreground/[0.06] p-0.5">
            {([
              [false, 'Pędzel', Paintbrush, 'Zamalowuj miejsce zmiany'],
              [true, 'Gumka', Eraser, 'Gumka — ścieraj zamalowane miejsce'],
            ] as const).map(([wartosc, nazwa, Ik, tytul]) => (
              <button
                key={nazwa}
                type="button"
                title={tytul}
                aria-label={nazwa}
                aria-pressed={Boolean(gumka) === wartosc}
                onClick={() => onGumka(wartosc)}
                className={`grid h-7 w-7 place-items-center rounded-[9px] transition-all ${Boolean(gumka) === wartosc ? 'bg-card text-foreground shadow-[0_1px_4px_hsl(0_0%_0%/0.25),inset_0_0_0_1px_hsl(var(--primary)/0.45)]' : 'text-foreground/60 hover:bg-foreground/[0.08] hover:text-foreground'}`}
              >
                <Ik className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
        {onSrednica && srednica !== undefined && (
          <label className="flex shrink-0 items-center gap-1.5 text-[10.5px] text-muted-foreground" title="Rozmiar pędzla">
            {gumka ? 'Gumka' : 'Pędzel'}
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
        <button type="button" onClick={onAnuluj} aria-label="Anuluj" title="Anuluj (Esc)" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-foreground/55 transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={wyslij}
          disabled={trwa || blokada || (!bezTekstu && !tekst.trim())}
          aria-label="Generuj"
          title="Generuj (Enter)"
          className="nb-cta nb-refleks-krawedzi grid h-9 w-9 shrink-0 place-items-center rounded-xl disabled:cursor-not-allowed disabled:opacity-40"
        >
          {trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
