import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Aperture, Bot, Briefcase, Camera, Clapperboard, Compass, Gauge, GraduationCap, FileText, Image as ImageIcon,
  Mic, Maximize2, Music2, MessageSquare, MessageSquareText, NotebookPen, PenTool, Paintbrush, PlayCircle, ThumbsUp,
  Search, Shuffle, Smartphone, Sparkles, Sprout, TrendingUp, UserCircle, UserRound, Users, Video, Wallet, Workflow,
  X, ChevronLeft, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WejscieNaPlatforme } from '../WejscieNaPlatforme'
import { PanelSceny, ogniskoSceny, type IdSceny } from '../OnboardingSceny'
import { Onboarding } from '../Onboarding'
import { KROKI2 } from './kroki'

/* Onboarding 3 — na telefonie nowy układ: góra to animowana scena SVG z
   Onboardingu 1 (zmienia się co krok), która na dole przechodzi w tło dzięki
   gradientowej masce; dół to pytanie, odpowiedzi i przycisk „Dalej” zawsze
   w tym samym miejscu. Na komputerze to dokładnie ekran z Onboardingu 1. */

/** Scena SVG dla każdego kroku (te same sceny co w Onboardingu 1) */
const SCENA_NA_KROK: Record<string, IdSceny> = {
  uzycie: 'przestrzen', cel: 'cele', poziom: 'poziom', moduly: 'moduly',
  funkcje: 'funkcje', zrodlo: 'zrodla', problem: 'problem',
}

/** Ikona każdej odpowiedzi — od razu czytelna. Poziom doświadczenia zostaje przy słupkach. */
const IKONY: Record<string, LucideIcon> = {
  prywatnie: UserRound, zespol: Users,
  automatyzacja: Bot, filmy: Clapperboard, marketing: TrendingUp, rozgladam: Compass, produkty: Camera, viral: Smartphone,
  chat: MessageSquare, zdjecia: ImageIcon, wideo: Video, canvas: PenTool, notebook: NotebookPen, akademia: GraduationCap,
  'gen-zdjec': ImageIcon, 'gen-wideo': Video, upscale: Maximize2, inpaint: Paintbrush, lektor: Mic, awatary: UserCircle,
  dokumenty: FileText, asystent: Bot,
  tiktok: Music2, youtube: PlayCircle, instagram: Aperture, x: X, google: Search, facebook: ThumbsUp, linkedin: Briefcase,
  asystenci: Sparkles,
  prompty: MessageSquareText, limity: Gauge, workflow: Workflow, niespojne: Shuffle, nowy: Sprout, koszt: Wallet,
}

/** Scena jest projektowana w proporcji 400×560. Skalujemy ją jednolicie, żeby
 *  wypełniła obszar bez rozciągania. Kółko ogniskowe sceny ustawiamy na środku
 *  obszaru, nadmiar przycinają krawędzie. */
const SCENA_W = 400
const SCENA_H = 560

function ScenaGora({ scena }: { scena: IdSceny }) {
  const ref = useRef<HTMLDivElement>(null)
  const [skala, setSkala] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const licz = () => {
      const r = el.getBoundingClientRect()
      setSkala(Math.max(r.width / SCENA_W, r.height / SCENA_H))
    }
    licz()
    const ro = new ResizeObserver(licz)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Przesuwamy scenę tak, żeby jej ognisko (kółko z linią) wypadło dokładnie na środku
  // Scena „poziom” jest centrowana po ognisku. Sceny „problem” i „zrodla” mają treść
  // zbyt wysoko w kadrze, więc przesuwamy je w dół; reszta zostaje w środku.
  const [fx, fy] = scena === 'poziom' ? ogniskoSceny(scena)
    : scena === 'problem' || scena === 'zrodla' ? [SCENA_W / 2, SCENA_H / 2 - 40]
    : [SCENA_W / 2, SCENA_H / 2]
  const dx = (SCENA_W / 2 - fx) * skala
  const dy = (SCENA_H / 2 - fy) * skala

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 shrink-0 transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          width: SCENA_W,
          height: SCENA_H,
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${skala})`,
        }}
      >
        <PanelSceny scena={scena} wybrane={[]} podpis="" kanaly={[]} sama bezNapisow />
      </div>
    </div>
  )
}

/** Próg jak `lg` w Tailwindzie — od niego układ jest komputerowy */
const ZAPYTANIE_KOMPUTER = '(min-width: 1024px)'

function useCzyKomputer() {
  const [komputer, setKomputer] = useState(() => window.matchMedia(ZAPYTANIE_KOMPUTER).matches)
  useEffect(() => {
    const m = window.matchMedia(ZAPYTANIE_KOMPUTER)
    const zmiana = () => setKomputer(m.matches)
    m.addEventListener('change', zmiana)
    return () => m.removeEventListener('change', zmiana)
  }, [])
  return komputer
}

export function Onboarding3() {
  const komputer = useCzyKomputer()
  return komputer ? <Onboarding wariant="trzy" /> : <OnboardingTelefon />
}

function OnboardingTelefon() {
  const [etap, setEtap] = useState<'pytania' | 'platforma'>('pytania')
  return etap === 'pytania'
    ? <Pytania onZakoncz={() => setEtap('platforma')} />
    : <WejscieNaPlatforme kompaktowy />
}

function Pytania({ onZakoncz }: { onZakoncz: () => void }) {
  const [indeks, setIndeks] = useState(0)
  const [odp, setOdp] = useState<Record<string, string[]>>({})

  const krok = KROKI2[indeks]
  const wybrane = odp[krok.id] ?? []
  const ostatni = indeks === KROKI2.length - 1

  const dalej = () => { if (ostatni) onZakoncz(); else setIndeks(i => i + 1) }
  const wstecz = () => setIndeks(i => Math.max(0, i - 1))

  const przelacz = (id: string) => {
    if (krok.wielokrotny) {
      setOdp(p => {
        const o = p[krok.id] ?? []
        return { ...p, [krok.id]: o.includes(id) ? o.filter(x => x !== id) : [...o, id] }
      })
      return
    }
    setOdp(p => ({ ...p, [krok.id]: [id] }))
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-y-auto lg:h-full lg:flex-row lg:overflow-hidden bg-background font-sans text-foreground">
      {/* GÓRA (telefon): scena SVG z gradientową maską */}
      <div className="relative h-[47dvh] w-full shrink-0 overflow-hidden lg:h-auto lg:w-1/3">
        <ScenaGora scena={SCENA_NA_KROK[krok.id] ?? 'przestrzen'} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[hsl(var(--background))] lg:bg-gradient-to-r" />
        {/* wstecz + postęp nad sceną */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-3 px-5 pt-5">
          {indeks > 0 ? (
            <button type="button" onClick={wstecz}
              className="flex items-center gap-1 text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
              Wstecz
            </button>
          ) : <span className="w-16" />}
          <div className="flex flex-1 items-center justify-center gap-1.5" aria-label={`Krok ${indeks + 1} z 7`}>
            {KROKI2.map((k, i) => (
              <span key={k.id} className={cn('h-[3px] rounded-full transition-all duration-300',
                i === indeks ? 'w-7 bg-primary' : i < indeks ? 'w-3 bg-primary/60' : 'w-3 bg-foreground/25')} />
            ))}
          </div>
          <span className="h-9 w-9" />
        </div>
      </div>

      {/* DÓŁ (telefon): pytanie i odpowiedzi zaczynają się pod gradientem, „Dalej” stoi nisko, ale nie przy samym brzegu */}
      <div className="relative z-10 flex flex-1 flex-col px-5 pb-4 pt-3 lg:px-12 lg:py-10">
        <div className="flex flex-1 flex-col items-center justify-start">
          <div key={krok.id} className="nb-krok-wchodzi flex w-full max-w-[520px] flex-col items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              {String(indeks + 1).padStart(2, '0')} / 07 · {krok.wielokrotny ? 'wybierz dowolne' : 'wybierz jedno'}
            </span>
            <h1 className="mt-2 text-center font-heading text-[26px] font-light leading-[1.1] tracking-[-0.7px] sm:text-[34px]">
              {krok.tytul[0]} <span className="text-primary">{krok.tytul[1]}</span>
            </h1>
            <p className="mt-2 text-center text-[13.5px] font-light text-foreground/55 sm:text-[13px]">{krok.podpowiedz}</p>

            <div className="mt-3.5 grid w-full grid-cols-2 gap-1.5">
              {krok.odpowiedzi.map(o => {
                const zaznaczona = wybrane.includes(o.id)
                const Ik = o.wypelnij ? undefined : IKONY[o.id]
                return (
                  <button
                    key={o.id}
                    type="button"
                    role={krok.wielokrotny ? 'checkbox' : 'radio'}
                    aria-checked={zaznaczona}
                    onClick={() => przelacz(o.id)}
                    className={cn(
                      'group flex h-[50px] items-center gap-2.5 rounded-xl border px-3.5 text-left font-mono text-[14.5px] leading-snug outline-none backdrop-blur-xl transition-all duration-150 cursor-pointer select-none focus-visible:ring-1 focus-visible:ring-primary/60',
                      zaznaczona
                        ? 'border-primary/60 bg-primary/15 text-foreground shadow-[0_0_24px_-2px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.25)]'
                        : 'border-foreground/10 bg-foreground/[0.04] text-foreground/85 hover:border-foreground/25',
                    )}
                  >
                    {Ik ? <Ik className={cn('h-5 w-5 shrink-0 transition-colors', zaznaczona ? 'text-primary' : 'text-foreground/55 group-hover:text-foreground/80')} strokeWidth={1.75} /> : <svg
                      viewBox={o.wypelnij ? '16 4 96 96' : `0 0 ${o.pole ?? 120} ${o.pole ?? 120}`}
                      className={cn('h-5 w-5 shrink-0 transition-colors', zaznaczona ? 'text-primary' : 'text-foreground/55')}
                      fill={o.wypelnij ? 'currentColor' : 'none'}
                      stroke={o.wypelnij ? 'none' : 'currentColor'}
                      strokeWidth={o.pole ? 6 : 5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d={o.glif} />
                    </svg>}
                    <span className="min-w-0 flex-1">{o.etyk}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={wybrane.length === 0}
          onClick={dalej}
          className={cn(
            'group mt-3 inline-flex h-10 w-full max-w-[300px] self-center items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold backdrop-blur-xl transition-all duration-200 ease-out select-none sm:h-11',
            wybrane.length
              ? 'border border-primary/60 bg-primary/20 text-foreground shadow-[0_0_24px_-2px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-primary/30 hover:border-primary hover:scale-[1.02] hover:shadow-[0_0_36px_0px_hsl(var(--primary)/0.6),inset_0_1px_0_0_rgba(255,255,255,0.4)] active:scale-[0.98] cursor-pointer'
              : 'border border-foreground/[0.10] bg-foreground/[0.04] text-muted-foreground cursor-not-allowed',
          )}
        >
          {wybrane.length ? (ostatni ? 'Wejdź na platformę' : 'Dalej') : 'Wybierz opcję'}
          {wybrane.length > 0 && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </div>
    </div>
  )
}
