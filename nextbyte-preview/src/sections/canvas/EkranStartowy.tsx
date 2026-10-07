import { MessageSquareText, Pin, Sparkles, Upload } from 'lucide-react'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'
import { cn } from '@/lib/utils'

/** Powitanie zależne od pory dnia — drobiazg, który robi z narzędzia miejsce. */
function powitanie(godzina: number) {
  if (godzina < 5) return 'Nocna zmiana? Miło Cię widzieć'
  if (godzina < 12) return 'Dzień dobry'
  if (godzina < 18) return 'Miłego popołudnia'
  return 'Dobry wieczór'
}

const KROKI = [
  { ikona: Upload, nazwa: 'Wgraj' },
  { ikona: Pin, nazwa: 'Wskaż' },
  { ikona: MessageSquareText, nazwa: 'Opisz' },
] as const

/**
 * Ekran startowy pustego płótna. Jedna duża, przyjazna rzecz do zrobienia
 * (wrzuć zdjęcie), trzy ikony z kolejnością działań i dużo powietrza.
 * Płasko i jednolicie: jedna ramka, jedno wypełnienie, jeden kolor akcentu.
 */
export function EkranStartowy({ nadPlotnem, onOtworz }: { nadPlotnem: boolean; onOtworz?: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-6 pb-24 pt-20 [scrollbar-width:none]">
      <div className="pointer-events-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <span
          className="nb-cozy-unos nb-cozy-znak grid h-16 w-16 place-items-center rounded-[22px] border border-foreground/[0.08] bg-card text-foreground"
        >
          <NextByteMarkIcon className="h-7 w-7" />
        </span>

        <p className="nb-cozy-unos mt-6 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground" style={{ ['--nb-cozy-opoznienie' as string]: '0.06s' }}>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {powitanie(new Date().getHours())}
        </p>
        <h1 className="nb-cozy-unos mt-1.5 text-[36px] font-semibold leading-[1.1] tracking-tight text-foreground" style={{ ['--nb-cozy-opoznienie' as string]: '0.1s' }}>
          Co dziś tworzymy?
        </h1>
        <p className="nb-cozy-unos mt-3 max-w-[400px] text-[15px] leading-relaxed text-muted-foreground" style={{ ['--nb-cozy-opoznienie' as string]: '0.14s' }}>
          Wrzuć zdjęcie, wskaż pinezką, co ma się zmienić. Resztą zajmę się ja.
        </p>

        <button
          type="button"
          onClick={onOtworz}
          disabled={!onOtworz}
          data-nad={nadPlotnem}
          aria-label="Wgraj zdjęcie z dysku"
          className={cn(
            'nb-cozy-strefa nb-cozy-unos group mt-9 flex w-full flex-col items-center gap-4 rounded-[24px] border-2 border-dashed bg-card px-6 py-10',
            nadPlotnem ? 'border-primary/60' : 'border-foreground/[0.14] hover:border-primary/45',
          )}
          style={{ ['--nb-cozy-opoznienie' as string]: '0.2s' }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/[0.1] text-primary">
            <Upload className="h-6 w-6" />
          </span>
          <span className="text-[16px] font-semibold text-foreground">
            {nadPlotnem ? 'Puść, a ułożę zdjęcie na płótnie' : 'Przeciągnij tu zdjęcie'}
          </span>
          <span className="nb-cta flex h-11 items-center gap-2 rounded-[14px] px-6 text-[14px] font-semibold">
            <Upload className="h-4 w-4" />
            Wgraj z dysku
          </span>
          <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            albo wklej ze schowka
            <kbd className="rounded-lg bg-foreground/[0.06] px-2 py-0.5 font-mono text-[11px] text-foreground/80">Ctrl + V</kbd>
          </span>
        </button>

        <ol className="nb-cozy-unos mt-7 hidden items-center gap-2 text-[13px] text-muted-foreground [@media(min-height:780px)]:flex items-center gap-2 text-[13px] text-muted-foreground" style={{ ['--nb-cozy-opoznienie' as string]: '0.28s' }} aria-label="Jak to działa">
          {KROKI.map(({ ikona: Ikona, nazwa }, i) => (
            <li key={nazwa} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="h-px w-5 bg-foreground/[0.14]" />}
              <span className="flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-card py-1.5 pl-2 pr-3.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground/[0.07] text-foreground/80">
                  <Ikona className="h-3.5 w-3.5" />
                </span>
                {nazwa}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
