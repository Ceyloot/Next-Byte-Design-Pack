import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Loader2, Lock, Pin, Trash2 } from 'lucide-react'
import '../panel2/fundament/powierzchnie.css'
import { cn } from '@/lib/utils'
import { wytnijOkolice, type Pineska, type Warstwa } from './typy'
import { LebekPinezki } from './ZnacznikPineski'

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
  /** przełącza pineskę między uchwytem a obszarem chronionym */
  onChron: () => void
  onZamknij: () => void
}

export function KartaPineski({ pineska, numer, warstwa, onNazwa, onUsun, onChron, onZamknij }: Props) {
  const [wycinek, setWycinek] = useState<string>('')
  const refPole = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let aktualne = true
    wytnijOkolice(warstwa.src, pineska.normalizedX, pineska.normalizedY).then(d => {
      if (aktualne) setWycinek(d)
    })
    return () => {
      aktualne = false
    }
  }, [warstwa.src, pineska.normalizedX, pineska.normalizedY])

  // Kursor od razu w polu nazwy — po wbiciu pineski następny ruch to
  // zawsze nazwanie obiektu, więc nie każemy w to jeszcze klikać.
  useEffect(() => {
    refPole.current?.focus()
    refPole.current?.select()
  }, [pineska.id])

  return (
    <div className="p2">
      <div className="p2-karta p2-pow-1 w-[292px] space-y-2.5 p-3.5">
        <div className="flex items-center gap-2.5">
          <LebekPinezki numer={numer} chroniona={pineska.chroniona} rozmiar={24} />
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] bg-[hsl(var(--foreground)/0.06)]">
            {wycinek ? (
              <img src={wycinek} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin p2-cichy" />
              </div>
            )}
          </div>
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
            className="p2-sekcja min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-[13px] text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)] focus:border-[hsl(var(--foreground)/0.3)]"
          />
          <button
            title="Usuń pineskę (Delete)"
            onClick={onUsun}
            className="shrink-0 rounded-md p-1 p2-cichy transition-colors hover:text-[hsl(var(--destructive))]"
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
                onClick={() => onNazwa(s)}
                className={cn(
                  'p2-kontrolka px-2 py-0.5 text-[11.5px]',
                  pineska.label === s ? 'bg-foreground/[0.09] text-foreground' : 'p2-cichy hover:text-[hsl(var(--foreground))]',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Uchwyt (o którym mówisz) albo obszar chroniony — plus zamknięcie */}
        <div className="flex items-center gap-1.5">
          <PrzyciskTrybu
            aktywny={!pineska.chroniona}
            onClick={() => pineska.chroniona && onChron()}
            ikona={<Pin className="h-3 w-3" />}
            etykieta="Obiekt"
            tytul="Nazwany obiekt, o którym mówisz w poleceniu"
          />
          <PrzyciskTrybu
            aktywny={pineska.chroniona === true}
            onClick={() => !pineska.chroniona && onChron()}
            ikona={<Lock className="h-3 w-3" />}
            etykieta="Nie ruszaj"
            tytul="Obszar chroniony — model ma go zostawić bez zmian"
          />
          <button
            onClick={onZamknij}
            className="shrink-0 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--foreground)/0.08)]"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}

function PrzyciskTrybu({
  aktywny,
  onClick,
  ikona,
  etykieta,
  tytul,
}: {
  aktywny: boolean
  onClick: () => void
  ikona: React.ReactNode
  etykieta: string
  tytul: string
}) {
  return (
    <button
      onClick={onClick}
      title={tytul}
      className={cn(
        'p2-kontrolka flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-2 py-1.5 text-[12px] font-medium',
        aktywny ? 'bg-foreground/[0.09] text-foreground font-semibold' : 'p2-cichy hover:text-[hsl(var(--foreground))]',
      )}
    >
      {ikona}
      {etykieta}
    </button>
  )
}
