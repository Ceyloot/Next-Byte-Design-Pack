import { MessageSquareText, Pin, Upload } from 'lucide-react'
import '../panel2/fundament/powierzchnie.css'
import { Karta, Kontrolka, Sekcja } from '../panel2/fundament/Powierzchnia'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'
import { cn } from '@/lib/utils'

const KROKI = [
  { ikona: Upload, nazwa: 'Wgraj', klawisz: 'Ctrl V' },
  { ikona: Pin, nazwa: 'Wskaż', klawisz: 'P' },
  { ikona: MessageSquareText, nazwa: 'Opisz', klawisz: 'Enter' },
] as const

/**
 * Ekran startowy pustego płótna — w języku Panelu Głównego i ekranów logowania:
 * jedna karta (poziom 1) z zagłębioną strefą upuszczania (poziom 2), pod nią trzy kafelki kroków
 * w stylu „Szybkiej podróży” (poziom 3). Etykiety małą, rozstrzeloną czcionką; jeden akcent z poświatą.
 */
export function EkranStartowy({ nadPlotnem, onOtworz }: { nadPlotnem: boolean; onOtworz?: () => void }) {
  return (
    <div
      className="p2 !bg-transparent pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-6 py-16 transition-[padding] duration-300 [scrollbar-width:none]"
      style={{ paddingRight: 'calc(var(--nb-czat-szer, 0px) + 24px)' }}
    >
      <div className="pointer-events-auto flex w-full max-w-[520px] flex-col gap-3">
        <Karta className="nb-cozy-unos p-3.5">
          <div className="mb-3 flex items-center gap-3">
            <span className="nb-cozy-znak grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[hsl(var(--primary)/0.28)] bg-[hsl(var(--primary)/0.08)] text-foreground shadow-[0_0_24px_-8px_hsl(var(--primary)/0.55)]">
              <NextByteMarkIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="p2-etykieta text-[10.5px] font-semibold uppercase tracking-[0.18em]">Canvas</p>
              <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">Co dziś tworzymy?</h1>
            </div>
          </div>

          <Sekcja className="p-2">
            <button
              type="button"
              onClick={onOtworz}
              disabled={!onOtworz}
              data-nad={nadPlotnem}
              aria-label="Wgraj zdjęcie z dysku"
              className={cn(
                'nb-cozy-strefa group flex w-full flex-col items-center gap-3.5 rounded-[14px] border border-dashed px-6 py-9 transition-colors',
                nadPlotnem ? 'border-primary/70 bg-primary/[0.06]' : 'border-foreground/[0.16] hover:border-primary/50',
              )}
            >
              <span className="grid h-12 w-12 place-items-center rounded-[14px] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-primary">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-[14px] font-medium text-foreground">{nadPlotnem ? 'Puść' : 'Przeciągnij tu zdjęcie'}</span>
              <span className="nb-cta flex h-10 items-center gap-2 rounded-[12px] px-5 text-[13px] font-semibold">
                <Upload className="h-4 w-4" />
                Wgraj z dysku
              </span>
              <kbd className="rounded-lg bg-foreground/[0.06] px-2 py-0.5 font-mono text-[11px] text-foreground/70">Ctrl + V</kbd>
            </button>
          </Sekcja>
        </Karta>

        <ol className="nb-cozy-unos grid grid-cols-3 gap-2.5 [@media(max-height:620px)]:hidden" style={{ ['--nb-cozy-opoznienie' as string]: '0.12s' }} aria-label="Kroki">
          {KROKI.map(({ ikona: Ikona, nazwa, klawisz }) => (
            <li key={nazwa}>
              <Kontrolka className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-[hsl(var(--primary)/0.22)] bg-[hsl(var(--primary)/0.08)] text-primary">
                  <Ikona className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-medium leading-tight text-foreground">{nazwa}</span>
                  <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">{klawisz}</span>
                </span>
              </Kontrolka>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
