import { ArrowRight, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Karta, NaglowekKarty } from '../fundament/Powierzchnia'
import { cn } from '@/lib/utils'

/**
 * NIC NIE CZEKA - stan pusty skrzynki zadan.
 *
 * WZORZEC DLA STANU PUSTEGO: znak w kolku z poziomu 3, pod nim zdanie i dwie
 * akcje. Stan pusty NIE dostaje wlasnego koloru ani ilustracji - ma byc
 * spokojny, a nie swietowac pustke.
 */
export function NicNieCzeka() {
  return (
    <Karta className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span
        className="p2-pow-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ border: '1px solid var(--p2-rant)' }}
      >
        <Check className="h-5 w-5" />
      </span>
      <p className="text-base font-semibold">Nic nie czeka</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="p2-kontrolka px-3 py-1.5 text-sm">Zaplanuj wydarzenie</button>
        <button type="button" className="p2-kontrolka px-3 py-1.5 text-sm">Dodaj zadanie</button>
      </div>
    </Karta>
  )
}

/**
 * KALENDARZ MIESIACA.
 *
 * WZORZEC DLA SIATEK: dzien biezacy to `p2-akcent-tlo`, dni spoza miesiaca to
 * `p2-cichy`. Dzien NIE jest powierzchnia - 42 pudelka w karcie zjadlyby cala
 * drabine i zrobily szachownice.
 */
const DNI = ['Pon', 'Wto', 'Sro', 'Czw', 'Pia', 'Sob', 'Nie']

export function Kalendarz({ miesiac = 'Wrzesien 2026', dzisiaj = 23 }: { miesiac?: string; dzisiaj?: number }) {
  /* Wrzesien 2026 zaczyna sie we wtorek - 31 sierpnia domyka pierwszy tydzien. */
  const komorki: { d: number; obcy?: boolean }[] = [{ d: 31, obcy: true }]
  for (let d = 1; d <= 30; d++) komorki.push({ d })

  return (
    <Karta className="flex flex-col">
      <NaglowekKarty
        ikona={Calendar}
        tytul="Kalendarz"
        dodatek={
          <button type="button" className="flex items-center gap-1 text-xs p2-akcent">
            Otworz <ArrowRight className="h-3 w-3" />
          </button>
        }
      />
      <div className="px-3 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" aria-label="Poprzedni miesiac" className="p2-kontrolka flex h-7 w-7 items-center justify-center">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold">{miesiac}</p>
          <button type="button" aria-label="Nastepny miesiac" className="p2-kontrolka flex h-7 w-7 items-center justify-center">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DNI.map((d) => <span key={d} className="p2-etykieta py-1">{d}</span>)}
          {komorki.map(({ d, obcy }, i) => (
            <span
              key={i}
              aria-current={d === dzisiaj && !obcy ? 'date' : undefined}
              className={cn(
                'rounded-md py-1.5 text-sm tabular-nums',
                obcy && 'p2-cichy opacity-50',
                d === dzisiaj && !obcy && 'p2-akcent-tlo font-semibold',
              )}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </Karta>
  )
}
