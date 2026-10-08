import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ekran startowy pustego płótna: jedna rzecz do zrobienia — wgraj zdjęcie.
 * Płasko (bez szkła i poświaty karty), jeden akcent na przycisku. Centruje się między lewą krawędzią a panelem czatu.
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
          'pointer-events-auto flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[24px] border border-dashed bg-card px-6 py-12 transition-colors',
          nadPlotnem ? 'border-primary/70 bg-primary/[0.06]' : 'border-foreground/[0.18] hover:border-primary/50',
        )}
      >
        <span className="grid h-12 w-12 place-items-center rounded-[14px] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-primary">
          <Upload className="h-5 w-5" />
        </span>
        <span className="nb-cta flex h-11 items-center gap-2 rounded-[12px] px-6 text-[14px] font-semibold">Wgraj zdjęcie</span>
        <kbd className="rounded-lg bg-foreground/[0.06] px-2 py-0.5 font-mono text-[11px] text-foreground/70">Ctrl + V</kbd>
      </button>
    </div>
  )
}
