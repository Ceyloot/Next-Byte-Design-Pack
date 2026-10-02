import { useEffect, useRef, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import '../panel2/fundament/powierzchnie.css'
import { cn } from '@/lib/utils'
import { wytnijPodgladPineski, type Pineska, type Warstwa } from './typy'

/**
 * Karta „Zaznaczono obiekt”.
 *
 * Pojawia się zaraz po wbiciu pineski i odpowiada na jedno pytanie: co
 * właściwie zaznaczyłeś. Dlatego jest w niej wycinek zdjęcia — bez niego
 * przy kilku pineskach nie da się stwierdzić, która jest która, a sama
 * nazwa w polu tekstowym niczego nie potwierdza.
 */

interface Props {
  pineska: Pineska
  numer: number
  warstwa: Warstwa
  onNazwa: (label: string) => void
  onUsun: () => void
  onZamknij: () => void
}

export function KartaPineski({ pineska, numer, warstwa, onNazwa, onUsun, onZamknij }: Props) {
  const [wycinek, setWycinek] = useState<string>('')
  const refPole = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let aktualne = true
    wytnijPodgladPineski(warstwa.src, pineska, 120).then(d => {
      if (aktualne) setWycinek(d)
    })
    return () => {
      aktualne = false
    }
  }, [warstwa.src, pineska.normalizedX, pineska.normalizedY, pineska.ramka])

  // Kursor od razu w polu nazwy — po wbiciu pineski następny ruch to
  // zawsze nazwanie obiektu, więc nie każemy w to jeszcze klikać.
  useEffect(() => {
    refPole.current?.focus()
    refPole.current?.select()
  }, [pineska.id])

  return (
    <div className="p2 !bg-transparent">
      <div
        onKeyDown={e => {
          // Enter / Escape zatwierdza z dowolnego miejsca karty — także gdy fokus został na propozycji
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            onZamknij()
          }
        }}
        className="nb-szklo nb-szklo-plynne nb-powierzchnia w-[316px] overflow-hidden rounded-2xl border border-foreground/12 p-3"
        style={{ backgroundColor: 'hsl(var(--card) / 0.58)', WebkitBackdropFilter: 'blur(18px) saturate(170%)', backdropFilter: 'blur(18px) saturate(170%)' }}
      >
        <div className="flex gap-3">
          {/* Wycinek zdjęcia — większy, żeby od razu było widać, co zaznaczono */}
          <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--foreground)/0.06)] ring-1 ring-foreground/10">
            {wycinek ? (
              <img src={wycinek} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <Loader2 className="h-4 w-4 animate-spin p2-cichy" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <input
                ref={refPole}
                value={pineska.label}
                onChange={e => onNazwa(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault()
                    onZamknij()
                  }
                }}
                placeholder={pineska.analizowana ? 'Rozpoznaję…' : 'Nazwij obiekt'}
                aria-label="Nazwa obiektu"
                className="min-w-0 flex-1 rounded-xl border border-foreground/[0.08] bg-[hsl(var(--background)/0.45)] px-2.5 py-1.5 text-[13px] font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)] focus:border-[hsl(var(--primary)/0.5)]"
              />
              <button
                title="Usuń pineskę (Delete)"
                onClick={onUsun}
                className="shrink-0 rounded-lg p-1.5 p2-cichy transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Propozycje z rozpoznawania obrazu — tylko, gdy są */}
            {pineska.sugestie && pineska.sugestie.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(pineska.sugestie)).map((s, sIdx) => (
                  <button
                    key={`${s}-${sIdx}`}
                    onClick={() => {
                      onNazwa(s)
                      refPole.current?.focus()
                    }}
                    className={cn(
                      'rounded-xl border px-2.5 py-1 text-[11.5px] transition-colors',
                      pineska.label === s
                        ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                        : 'border-foreground/[0.09] bg-[hsl(var(--foreground)/0.04)] text-foreground/75 hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-foreground/[0.08] pt-2.5">
          <span className="text-[10.5px] text-muted-foreground/70">
            Pineska {numer} · <kbd className="font-sans font-semibold">Enter</kbd> zatwierdza
          </span>
          <button
            onClick={onZamknij}
            className="rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-[12px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}
