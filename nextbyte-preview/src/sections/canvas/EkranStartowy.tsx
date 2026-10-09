import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ekran startowy pustego płótna: jedna rzecz do zrobienia — wgraj zdjęcie.
 * Szklana karta (rozmywa kropki tła), jeden akcent na przycisku. Centruje się między lewą krawędzią a panelem czatu.
 */
export function EkranStartowy({ nadPlotnem, onOtworz }: { nadPlotnem: boolean; onOtworz?: () => void }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 py-16 transition-[padding] duration-300"
      style={{ paddingRight: 'calc(var(--nb-czat-szer, 0px) + 24px)' }}
    >
      <button
        type="button"
        onClick={onOtworz}
        disabled={!onOtworz}
        data-nad={nadPlotnem}
        aria-label="Wgraj zdjęcie"
        className={cn(
          'nb-cozy-startowa pointer-events-auto flex w-full max-w-[380px] flex-col items-center gap-3.5 rounded-[24px] border border-dashed px-6 py-10 transition-[border-color,background-color]',
          nadPlotnem ? 'border-primary/70' : 'border-foreground/[0.2] hover:border-primary/50',
        )}
      >
        <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[hsl(var(--primary)/0.22)] bg-[hsl(var(--primary)/0.08)] text-primary">
          <Upload className="h-[18px] w-[18px]" />
        </span>
        <span className="nb-cta flex h-10 items-center gap-2 rounded-[12px] px-5 text-[13.5px] font-semibold">Wgraj zdjęcie</span>
        <kbd className="rounded-lg bg-foreground/[0.06] px-2 py-0.5 font-mono text-[11px] text-foreground/70">Ctrl + V</kbd>
      </button>
    </div>
  )
}
