import React from 'react'
import { ArrowRight, Cloud, Lock, Pencil, Plus, Zap } from 'lucide-react'
import { Karta, Kontrolka } from '../Powierzchnia'
import { cn } from '../../lib/utils'

/**
 * TWOJE CHMURY - dwie karty produktowe.
 *
 * WZORZEC DLA KART PRODUKTOWYCH: ikona w kwadracie z akcentem, tytul
 * dwukolorowy (druga czesc `p2-akcent`), opis `p2-cichy`, stopka z metryka
 * i wejsciem. Cala roznica miedzy kartami to TRESC, nie styl - dlatego jest
 * jeden komponent i tablica danych, a nie dwa podobne komponenty.
 */
export interface Chmura {
  id: string
  nazwa: string
  akcent: string
  opis: string
  stopka: React.ReactNode
}

export function TwojeChmury({ chmury }: { chmury: Chmura[] }) {
  return (
    <section>
      <h2 className="p2-etykieta mb-2">Twoje chmury</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {chmury.map((c) => (
          <Karta key={c.id} klikalna className="flex flex-col gap-3 p-4">
            <span className="p2-akcent-tlo flex h-11 w-11 items-center justify-center rounded-xl">
              <Cloud className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold">
                {c.nazwa}<span className="p2-akcent">{c.akcent}</span>
              </p>
              <p className="mt-1 text-sm p2-cichy">{c.opis}</p>
            </div>
            <div
              className="mt-auto flex items-center justify-between gap-2 pt-2"
              style={{ borderTop: '1px solid var(--p2-rant)' }}
            >
              {c.stopka}
              <button type="button" className="flex shrink-0 items-center gap-1 text-sm p2-akcent">
                Otworz <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Karta>
        ))}
      </div>
    </section>
  )
}

export function StopkaTylkoOdczyt() {
  return (
    <span className="flex items-center gap-1.5 text-xs p2-cichy">
      <Lock className="h-3 w-3" /> Tylko do odczytu
    </span>
  )
}

export function StopkaMiejsce({ uzyte, cale, plikow }: { uzyte: string; cale: string; plikow: number }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-xs">
        <b>{uzyte}</b> <span className="p2-cichy">z {cale} - {plikow}</span>
      </span>
      {/* Pasek postepu: tor z drabiny, wypelnienie z akcentu motywu. */}
      <span className="p2-pow-3 mt-1 block h-1 w-full overflow-hidden rounded-full">
        <span className="block h-full w-[2%] rounded-full" style={{ background: 'hsl(var(--primary))' }} />
      </span>
    </span>
  )
}

/**
 * SZYBKA PODROZ - siatka skrotow z miejscami na dodanie.
 *
 * WZORZEC DLA SLOTU PUSTEGO: ten sam ksztalt co zajety, ale rant PRZERYWANY
 * i tresc `p2-cichy`. Pusty slot ma zapraszac, nie udawac zajetego.
 */
export interface Skrot {
  id: string
  nazwa: string
  ikona: React.ComponentType<{ className?: string }>
  odcien?: 'akcent' | 'ostrzezenie'
}

export function SzybkaPodroz({ skroty, slotow = 9 }: { skroty: Skrot[]; slotow?: number }) {
  const puste = Math.max(0, slotow - skroty.length)
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="p2-etykieta flex items-center gap-1.5"><Zap className="h-3 w-3" /> Szybka podroz</h2>
        <button type="button" className="flex items-center gap-1 text-xs p2-cichy hover:text-[hsl(var(--foreground))]">
          <Pencil className="h-3 w-3" /> Edytuj
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {skroty.map((s) => (
          <Kontrolka key={s.id} className="flex cursor-pointer flex-col items-center gap-2 p-3 text-center">
            <span
              className={cn('flex h-9 w-9 items-center justify-center rounded-lg', s.odcien !== 'ostrzezenie' && 'p2-akcent-tlo')}
              style={
                s.odcien === 'ostrzezenie'
                  ? { background: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))' }
                  : undefined
              }
            >
              <s.ikona className="h-4 w-4" />
            </span>
            <span className="line-clamp-1 w-full text-[11px]">{s.nazwa}</span>
          </Kontrolka>
        ))}
        {Array.from({ length: puste }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="flex flex-col items-center gap-2 rounded-[var(--p2-promien-maly)] p-3 text-center transition-colors hover:bg-[var(--p2-powierzchnia-2)]"
            style={{ border: '1px dashed var(--p2-rant)' }}
          >
            <span className="p2-pow-2 flex h-9 w-9 items-center justify-center rounded-lg">
              <Plus className="h-4 w-4 p2-cichy" />
            </span>
            <span className="text-[11px] p2-cichy">Dodaj</span>
          </button>
        ))}
      </div>
    </section>
  )
}
