import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ekran startowy pustego płótna: jedna rzecz do zrobienia — wgraj zdjęcie.
 * Bez karty i popupu: sam przycisk i podpowiedź skrótu, wyśrodkowane w wolnym polu (między nawigacją a panelem czatu).
 */
export function EkranStartowy({ nadPlotnem, onOtworz }: { nadPlotnem: boolean; onOtworz?: () => void }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 py-16 transition-[padding] duration-300"
      style={{ paddingRight: 'calc(var(--nb-czat-szer, 0px) + var(--nb-nav-prawo, 0px) + 24px)', paddingLeft: 'calc(var(--nb-nav-lewo, 0px) + 24px)', paddingTop: 'calc(var(--nb-nav-gora, 0px) + 64px)', paddingBottom: 'calc(var(--nb-nav-dol, 0px) + 64px)' }}
    >
      <button
        type="button"
        onClick={onOtworz}
        disabled={!onOtworz}
        data-nad={nadPlotnem}
        aria-label="Wgraj zdjęcie"
        className="pointer-events-auto flex flex-col items-center gap-2.5"
      >
        <span className={cn('nb-cta flex h-10 items-center gap-2 rounded-xl px-5 text-[13.5px] font-semibold transition-shadow', nadPlotnem && 'ring-4 ring-primary/30')}>
          <Upload className="h-4 w-4" />
          Wgraj zdjęcie
        </span>
        <kbd className="font-mono text-[11px] text-muted-foreground/70">Ctrl + V</kbd>
      </button>
    </div>
  )
}
