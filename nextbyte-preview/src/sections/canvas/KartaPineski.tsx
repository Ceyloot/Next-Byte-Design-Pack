import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Lock, MapPin, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { opiszPolozenie, wytnijOkolice, type Pineska, type Warstwa } from './typy'

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
    <div className="w-[268px] overflow-hidden rounded-2xl nb-szklo nb-szklo-canvas border border-border/60 bg-card/70 shadow-2xl">
      <div className="flex items-center gap-2 px-3 pb-1.5 pt-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-foreground">
          {numer}
        </span>
        <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-foreground/45">Zaznaczono obiekt</span>
        <button title="Usuń pineskę" onClick={onUsun} className="text-foreground/30 transition-colors hover:text-foreground">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 px-3 pb-2.5">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5 ring-1 ring-border/10">
          {wycinek ? (
            <img src={wycinek} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Loader2 className="h-4 w-4 animate-spin text-foreground/25" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
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
            placeholder="Nazwij ten obiekt…"
            className="w-full rounded-lg border border-border/10 bg-foreground/5 px-2.5 py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/70"
          />
          <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] text-foreground/30">
            {pineska.analizowana && <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />}
            {pineska.analizowana
              ? 'Rozpoznaję obiekt…'
              : (pineska.sugestie?.length ?? 0) === 0
                ? 'Nie rozpoznałem tego miejsca — nazwij je sam'
                : `${warstwa.name} · ${opiszPolozenie(pineska.normalizedX, pineska.normalizedY)}`}
          </p>
        </div>
      </div>

      {/* Propozycje z rozpoznawania obrazu — puste, dopóki model nie działa */}
      {pineska.sugestie && pineska.sugestie.length > 0 && (
        <div className="border-t border-border/8 px-3 py-2">
          <p className="mb-1.5 text-[10px] text-foreground/35">Rozpoznane:</p>
          <div className="flex flex-wrap gap-1">
            {pineska.sugestie.map(s => (
              <button
                key={s}
                onClick={() => onNazwa(s)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors',
                  pineska.label === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-foreground/5 text-foreground/65 hover:bg-foreground/10 hover:text-foreground',
                )}
              >
                {pineska.label === s && <Check className="h-3 w-3" />}
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dwa znaczenia tej samej pineski: uchwyt, o którym mówisz, albo
          obszar, którego model ma nie ruszać. */}
      <div className="border-t border-border/8 px-3 py-2">
        <div className="flex gap-1">
          <PrzyciskTrybu
            aktywny={!pineska.chroniona}
            onClick={() => pineska.chroniona && onChron()}
            ikona={<MapPin className="h-3 w-3" />}
            etykieta="Uchwyt"
            tytul="Nazwany obiekt, o którym mówisz w poleceniu"
          />
          <PrzyciskTrybu
            aktywny={pineska.chroniona === true}
            onClick={() => !pineska.chroniona && onChron()}
            ikona={<Lock className="h-3 w-3" />}
            etykieta="Nie ruszaj"
            tytul="Obszar chroniony — model ma go zostawić bez zmian"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/8 bg-foreground/[0.02] px-3 py-2">
        <p className="flex-1 text-[10px] leading-snug text-foreground/30">
          {pineska.chroniona
            ? 'Ten fragment ma wyjść z edycji nietknięty.'
            : pineska.label.trim()
              ? 'Powołaj się na ten obiekt w poleceniu — chip jest na dolnym pasku.'
              : 'Nazwa trafia do polecenia jako chip, więc warto ją nadać.'}
        </p>
        <button
          onClick={onZamknij}
          className="shrink-0 rounded-lg bg-foreground/10 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-foreground/20"
        >
          Gotowe
        </button>
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
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] font-semibold transition-colors',
        aktywny
          ? 'bg-primary text-primary-foreground'
          : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/80',
      )}
    >
      {ikona}
      {etykieta}
    </button>
  )
}
