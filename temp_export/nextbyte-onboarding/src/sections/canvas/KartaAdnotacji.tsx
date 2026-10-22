import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import '../panel2/fundament/powierzchnie.css'

/**
 * Karta opisu adnotacji — pojawia się przy zaznaczonym miejscu tak samo jak karta pinezki:
 * od razu kursor w polu, Enter zatwierdza, kosz usuwa zaznaczenie razem z opisem.
 */
export function KartaAdnotacji({
  tekst,
  onTekst,
  onGotowe,
  onUsun,
  edycja,
}: {
  tekst: string
  onTekst: (t: string) => void
  onGotowe: () => void
  onUsun: () => void
  edycja: boolean
}) {
  const pole = useRef<HTMLInputElement>(null)
  useEffect(() => {
    pole.current?.focus({ preventScroll: true })
    const t = window.setTimeout(() => pole.current?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="p2 !bg-transparent">
      <div
        // klik w kartę nie zabiera polu fokusu — dzięki temu przyciski działają, a pole nie zatwierdza się samo
        onMouseDown={e => { if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault() }}
        className="w-[292px] overflow-hidden rounded-2xl border border-foreground/[0.1] bg-[hsl(var(--card))] p-3 shadow-[0_8px_24px_-8px_hsl(0_0%_0%/0.35)]"
      >
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {edycja ? 'Zmień opis' : 'Co tu zmienić?'}
        </p>
        <div className="flex items-center gap-1.5">
          <input
            ref={pole}
            value={tekst}
            onChange={e => onTekst(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation()
              if (e.key === 'Enter') { e.preventDefault(); onGotowe() }
              if (e.key === 'Escape') { e.preventDefault(); onGotowe() }
            }}
            placeholder="np. gęstsze chmury, złote światło"
            aria-label="Opis zmiany w tym miejscu"
            className="min-w-0 flex-1 rounded-[10px] border border-foreground/[0.07] bg-foreground/[0.045] px-3 py-1.5 text-[13px] font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)] focus:border-[hsl(var(--primary)/0.5)]"
          />
          <button
            type="button"
            title="Usuń to zaznaczenie"
            aria-label="Usuń to zaznaczenie"
            onClick={onUsun}
            className="shrink-0 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-foreground/[0.08] pt-2.5">
          <span className="text-[10.5px] text-muted-foreground/70">
            <kbd className="font-sans font-semibold">Enter</kbd> zatwierdza
          </span>
          <button type="button" onClick={onGotowe} className="rounded-xl bg-foreground/[0.07] px-4 py-1.5 text-[12px] font-semibold text-foreground/85 transition-colors hover:bg-foreground/[0.11] hover:text-foreground">
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}
