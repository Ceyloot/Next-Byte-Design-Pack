import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WejscieNaPlatforme } from '../WejscieNaPlatforme'
import { PoleOdpowiedzi } from './PoleOdpowiedzi'
import { KROKI2 } from './kroki'

/* Onboarding 2 — te same 7 pytań co w pierwszej wersji, ale cały ekran to
   animacja z cząsteczek: na niej tylko tekst pytania, a odpowiedzi to
   symbole ułożone z cząsteczek, które się klika (PoleOdpowiedzi).
   Jednokrotny wybór przechodzi dalej sam po chwili (żeby animacja wyboru
   zdążyła się odegrać), wielokrotny ma przycisk „Dalej”. */

/** Przy wyborze jednokrotnym — czas na odegranie animacji przed przejściem */
const PAUZA = 1300
/** Ostatni krok przechodzi dalej szybciej — tam nie ma już kolejnego pytania do pokazania */
const PAUZA_OSTATNI = 600

function useMobilny() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const f = () => setM(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  return m
}

function Pytania({ onZakoncz }: { onZakoncz: () => void }) {
  const [indeks, setIndeks] = useState(0)
  const [odp, setOdp] = useState<Record<string, string[]>>({})
  const timer = useRef<number | null>(null)
  const mobilny = useMobilny()
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const krok = KROKI2[indeks]
  const wybrane = odp[krok.id] ?? []
  const ostatni = indeks === KROKI2.length - 1

  const dalej = () => { if (ostatni) onZakoncz(); else setIndeks(i => i + 1) }
  const wstecz = () => { if (timer.current) window.clearTimeout(timer.current); setIndeks(i => Math.max(0, i - 1)) }

  const przelacz = (id: string) => {
    if (krok.wielokrotny) {
      setOdp(p => {
        const o = p[krok.id] ?? []
        return { ...p, [krok.id]: o.includes(id) ? o.filter(x => x !== id) : [...o, id] }
      })
      return
    }
    setOdp(p => ({ ...p, [krok.id]: [id] }))
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(dalej, ostatni ? PAUZA_OSTATNI : PAUZA)
  }

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col overflow-hidden font-sans text-foreground">
      <style>{`
        @keyframes o2Wejdz { from { opacity: 0; transform: translateY(10px) } }
        .o2-wejdz { animation: o2Wejdz 480ms cubic-bezier(.2,.9,.25,1) both }
        @media (prefers-reduced-motion: reduce) { .o2-wejdz { animation: none } }
      `}</style>

      {/* animacja na cały ekran — pod tekstem i paskiem; nowa dla każdego kroku */}
      <div key={`s-${krok.id}`} className="absolute inset-0">
        <PoleOdpowiedzi
          odpowiedzi={krok.odpowiedzi}
          wybrane={wybrane}
          onWybierz={przelacz}
          wielokrotny={krok.wielokrotny}
          rdzen={krok.rdzen}
          tryb={krok.tryb}
          tlo={krok.tlo}
          mobilny={mobilny}
          odstep={mobilny ? { gora: 170, dol: 84 } : { gora: 200, dol: 86 }}
        />
      </div>

      {/* pytanie — jedyny tekst na ekranie */}
      <div key={krok.id} className="o2-wejdz pointer-events-none relative z-10 px-5 pt-5 sm:px-10 sm:pt-8 [&_button]:pointer-events-auto">
        <div className="flex items-center gap-3">
          {indeks > 0 && (
            <button type="button" onClick={wstecz} aria-label="Wstecz"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground ring-1 ring-inset ring-foreground/10 transition-colors hover:text-foreground cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground/40">
            {String(indeks + 1).padStart(2, '0')} / 07 · {krok.wielokrotny ? 'wybierz dowolne' : 'wybierz jedno'}
          </span>
        </div>
        <h1 className="mt-3 font-heading text-[clamp(28px,4.2vw,52px)] font-light leading-[1.05] tracking-[-1.5px]">
          {krok.tytul[0]} <span className="text-primary">{krok.tytul[1]}</span>
        </h1>
        <p className="mt-2 text-[13.5px] font-light text-foreground/55">{krok.podpowiedz}</p>
      </div>

      <div className="pointer-events-none flex-1" />

      {/* dół: postęp i dalej */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 sm:px-10">
        <div className="flex items-center gap-1.5" aria-label={`Krok ${indeks + 1} z 7`}>
          {KROKI2.map((k, i) => (
            <span key={k.id} className={cn('h-[3px] rounded-full transition-all duration-300',
              i === indeks ? 'w-7 bg-primary' : i < indeks ? 'w-3 bg-primary/60' : 'w-3 bg-foreground/15')} />
          ))}
        </div>
        <button
          type="button"
          disabled={wybrane.length === 0}
          onClick={() => { if (timer.current) window.clearTimeout(timer.current); dalej() }}
          className={cn(
            'group inline-flex h-10 items-center gap-2 rounded-xl px-5 text-[13.5px] font-semibold transition-all duration-200',
            wybrane.length
              ? 'border border-primary/60 bg-primary/20 text-foreground shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)] hover:bg-primary/30 cursor-pointer'
              : 'border border-foreground/10 text-muted-foreground cursor-not-allowed',
          )}
        >
          {ostatni ? 'Wejdź na platformę' : 'Dalej'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

/** Onboarding 2: pytania w scenach, potem ta sama sekwencja wejścia (faza C). */
export function Onboarding2() {
  const [etap, setEtap] = useState<'pytania' | 'platforma'>('pytania')
  return etap === 'pytania' ? <Pytania onZakoncz={() => setEtap('platforma')} /> : <WejscieNaPlatforme />
}
