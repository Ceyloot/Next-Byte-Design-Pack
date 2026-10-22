import React, { useEffect, useRef, useState } from 'react'
import { KROKI2 as KROKI_ONBOARDING2 } from './onboarding2/kroki'
import { PoleOdpowiedzi } from './onboarding2/PoleOdpowiedzi'
import {
  UserPlus, Users, Bot, Clapperboard, TrendingUp, Compass, Camera, Smartphone,
  MessageSquare, Image as ImageIcon, Video, Spline, NotebookPen, GraduationCap,
  Maximize2, AudioLines, Flame, Mic, UserRound, Brush, ImagePlus, FileText,
  Music2, Sparkles, Play, Gamepad2, HeartHandshake, MessagesSquare,
  Aperture, Briefcase, ThumbsUp, Ellipsis,
  PenLine, Gauge, Workflow, Layers, Wallet, ChevronLeft, ArrowRight, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoogleIcon, XaiIcon } from '@/grafiki/znaki-marek'
import { PanelSceny, StyleScen, type IdSceny } from './OnboardingSceny'

/* Onboarding wg wzoru Higgsfield (spec: ./ONBOARDING.md, faza B).
   Układ każdego kroku jest ten sam: po lewej panel ze sceną zmieniającą się
   co krok, po prawej pasek postępu z kresek, dwuwierszowy tytuł, siatka
   opcji i cichy podpis na dole. Kroki jednokrotnego wyboru przechodzą dalej
   od razu po kliknięciu; wielokrotne mają przycisk, nieaktywny do pierwszego
   wyboru. */

type Ikona = React.ComponentType<{ className?: string }>

interface Opcja {
  id: string
  nazwa: string
  opis?: string
  ikona: Ikona
}

interface Krok {
  id: string
  scena: IdSceny
  tytul: [string, string]
  /** Cichy podpis pod stroną — po co pytamy */
  podpis: string
  /** Podpis pod sceną w lewym panelu */
  podpisSceny: string
  uklad: 'kafelki' | 'pigulki'
  wielokrotny: boolean
  opcje: Opcja[]
}

/* Ikona poziomu: konstelacja z 1–4 kropek, jak u Higgsfielda. */
const kropki = (n: number): Ikona =>
  function Kropki({ className }) {
    const uklady: number[][][] = [
      [[12, 12]],
      [[9, 14], [15, 10]],
      [[8, 15], [12, 9], [16, 15]],
      [[8, 8], [16, 8], [8, 16], [16, 16]],
    ]
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        {uklady[n - 1].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.9} />)}
      </svg>
    )
  }

const ZnakGoogle: Ikona = ({ className }) => <GoogleIcon className={className} />
const ZnakX: Ikona = ({ className }) => <XaiIcon className={className} />

const KROKI: Krok[] = [
  {
    id: 'uzycie',
    scena: 'przestrzen',
    tytul: ['Jak planujesz', 'korzystać z NextByte?'],
    podpis: 'Pomoże nam przygotować odpowiednią przestrzeń roboczą',
    podpisSceny: 'Prywatna przestrzeń albo wspólna pula zespołu',
    uklad: 'kafelki',
    wielokrotny: false,
    opcje: [
      { id: 'prywatnie', nazwa: 'Na własny użytek', opis: 'Własne projekty, we własnym tempie', ikona: UserPlus },
      { id: 'zespol', nazwa: 'Dla zespołu lub firmy', opis: 'Dla zespołów, które tworzą i dowożą razem', ikona: Users },
    ],
  },
  {
    id: 'cel',
    scena: 'cele',
    tytul: ['Co chcesz osiągnąć', 'z NextByte?'],
    podpis: 'Zaznacz wszystko, co Cię interesuje, dopasujemy start do Twoich celów',
    podpisSceny: 'Jeden prompt, każdy rodzaj rezultatu',
    uklad: 'kafelki',
    wielokrotny: true,
    opcje: [
      { id: 'automatyzacja', nazwa: 'Automatyzacja pracy z asystentem AI', ikona: Bot },
      { id: 'filmy', nazwa: 'Filmowe wizualizacje i filmy AI', ikona: Clapperboard },
      { id: 'marketing', nazwa: 'Marketing, który sprzedaje', ikona: TrendingUp },
      { id: 'rozgladam', nazwa: 'Na razie się rozglądam', ikona: Compass },
      { id: 'produkty', nazwa: 'Awatary i zdjęcia produktów', ikona: Camera },
      { id: 'viral', nazwa: 'Treści viralowe i wideo UGC', ikona: Smartphone },
    ],
  },
  {
    id: 'poziom',
    scena: 'poziom',
    tytul: ['Jakie masz', 'doświadczenie z AI?'],
    podpis: 'Dostosujemy złożoność interfejsu do Twojego poziomu',
    podpisSceny: 'Interfejs rośnie razem z Tobą',
    uklad: 'kafelki',
    wielokrotny: false,
    opcje: [
      { id: 'poczatkujacy', nazwa: 'Początkujący', opis: 'Proste kroki i presety jednym kliknięciem', ikona: kropki(1) },
      { id: 'sredni', nazwa: 'Średniozaawansowany', opis: 'Szybka praca z miejscem na poprawki', ikona: kropki(2) },
      { id: 'zaawansowany', nazwa: 'Zaawansowany', opis: 'Pełna kontrola nad ustawieniami i modelami', ikona: kropki(3) },
      { id: 'ekspert', nazwa: 'Ekspert', opis: 'Ręczne sterowanie, narzędzia reżysera, API', ikona: kropki(4) },
    ],
  },
  {
    id: 'moduly',
    scena: 'moduly',
    tytul: ['Które moduły NextByte', 'chcesz wypróbować?'],
    podpis: 'Wybierz dowolną liczbę opcji',
    podpisSceny: 'Zaznaczone moduły pojawią się na starcie',
    uklad: 'kafelki',
    wielokrotny: true,
    opcje: [
      { id: 'chat', nazwa: 'Chat AI', opis: 'Najlepsze modele w jednym czacie', ikona: MessageSquare },
      { id: 'zdjecia', nazwa: 'Studio Zdjęć', opis: 'Generowanie i edycja zdjęć', ikona: ImageIcon },
      { id: 'wideo', nazwa: 'Studio Wideo', opis: 'Klipy i filmowe sceny z AI', ikona: Video },
      { id: 'canvas', nazwa: 'Canvas', opis: 'Wizualna przestrzeń edycji', ikona: Spline },
      { id: 'notebook', nazwa: 'Notebook', opis: 'Notatki i baza wiedzy z AI', ikona: NotebookPen },
      { id: 'akademia', nazwa: 'Akademia', opis: 'Nauka AI krok po kroku', ikona: GraduationCap },
    ],
  },
  {
    id: 'funkcje',
    scena: 'funkcje',
    tytul: ['Które funkcje', 'chcesz wypróbować?'],
    podpis: 'Wybierz dowolną liczbę opcji',
    podpisSceny: 'Od promptu do gotowego materiału',
    uklad: 'pigulki',
    wielokrotny: true,
    opcje: [
      { id: 'gen-wideo', nazwa: 'Wideo AI', ikona: Video },
      { id: 'lektor', nazwa: 'Głosy AI', ikona: AudioLines },
      { id: 'awatary', nazwa: 'Awatary AI', ikona: UserRound },
      { id: 'inpaint', nazwa: 'Inpainting', ikona: Brush },
      { id: 'gen-zdjec', nazwa: 'Generowanie zdjęć', ikona: ImagePlus },
      { id: 'dokumenty', nazwa: 'Notatki i dokumenty', ikona: FileText },
      { id: 'asystent', nazwa: 'Asystent AI', ikona: Bot },
    ],
  },
  {
    id: 'zrodlo',
    scena: 'zrodla',
    tytul: ['Skąd', 'o nas wiesz?'],
    podpis: 'To pomaga nam ulepszać produkt',
    podpisSceny: 'Twórcy trafiają do nas z całego świata',
    uklad: 'pigulki',
    wielokrotny: true,
    opcje: [
      { id: 'tiktok', nazwa: 'TikTok', ikona: Music2 },
      { id: 'x', nazwa: 'X / Twitter', ikona: ZnakX },
      { id: 'google', nazwa: 'Wyszukiwarka Google', ikona: ZnakGoogle },
      { id: 'asystenci', nazwa: 'Asystenci AI', ikona: Sparkles },
      { id: 'youtube', nazwa: 'YouTube', ikona: Play },
      { id: 'discord', nazwa: 'Discord', ikona: Gamepad2 },
      { id: 'polecenie', nazwa: 'Polecenie znajomego', ikona: HeartHandshake },
      { id: 'reddit', nazwa: 'Reddit', ikona: MessagesSquare },
      { id: 'instagram', nazwa: 'Instagram', ikona: Aperture },
      { id: 'linkedin', nazwa: 'LinkedIn', ikona: Briefcase },
      { id: 'facebook', nazwa: 'Facebook', ikona: ThumbsUp },
      { id: 'inne', nazwa: 'Inne', ikona: Ellipsis },
    ],
  },
  {
    id: 'problem',
    scena: 'problem',
    tytul: ['Który problem z AI', 'mamy dla Ciebie rozwiązać?'],
    podpis: 'Skupimy się na tym, co dla Ciebie najważniejsze',
    podpisSceny: 'Mniej walki z narzędziami, więcej tworzenia',
    uklad: 'kafelki',
    wielokrotny: true,
    opcje: [
      { id: 'prompty', nazwa: 'Pisanie promptów jest trudne', ikona: PenLine },
      { id: 'limity', nazwa: 'Za mało generacji', ikona: Gauge },
      { id: 'workflow', nazwa: 'Trudno zbudować sprawny workflow', ikona: Workflow },
      { id: 'niespojne', nazwa: 'Niespójne wyniki', ikona: Layers },
      { id: 'nowy', nazwa: 'Dopiero zaczynam', ikona: Sparkles },
      { id: 'koszt', nazwa: 'Wysoki koszt topowych modeli', ikona: Wallet },
    ],
  },
]

/** Odpowiedzi z onboardingu: id kroku → id wybranych opcji */
export type OdpowiedziOnboardingu = Record<string, string[]>


function StyleKrokow() {
  return (
    <style>{`
      @keyframes nbKrokWchodzi { from { opacity: 0 } }
      .nb-krok-wchodzi { animation: nbKrokWchodzi 320ms cubic-bezier(0.4, 0, 0.2, 1) backwards }
      @media (prefers-reduced-motion: reduce) { .nb-krok-wchodzi { animation: none } }
    `}</style>
  )
}

interface OnboardingFlowProps {
  /** Numer kroku startowego, liczony od 1 */
  poczatkowyKrok?: number
  onZakoncz?: (odpowiedzi: OdpowiedziOnboardingu) => void
  onWrocDoFormularza?: () => void
  /** trzy: typografia z Onboardingu 3 (lekki nagłówek, akcent w kolorze primary) */
  wariant?: 'domyslny' | 'trzy'
}

export function OnboardingFlow({ poczatkowyKrok = 1, onZakoncz, onWrocDoFormularza, wariant = 'domyslny' }: OnboardingFlowProps) {
  const trzy = wariant === 'trzy'
  // Pole z symbolami (z Onboardingu 2) układa się inaczej na telefonie i na komputerze
  const [mobilny, setMobilny] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)
  useEffect(() => {
    const zmiana = () => setMobilny(window.innerWidth < 1024)
    window.addEventListener('resize', zmiana)
    return () => window.removeEventListener('resize', zmiana)
  }, [])
  const [indeks, setIndeks] = useState(() => Math.min(Math.max(poczatkowyKrok - 1, 0), KROKI.length - 1))
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedziOnboardingu>({})
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  const krok = KROKI[indeks]
  const wybrane = odpowiedzi[krok.id] ?? []
  const ostatni = indeks === KROKI.length - 1

  const dalej = (stan: OdpowiedziOnboardingu = odpowiedzi) => {
    if (ostatni) onZakoncz?.(stan)
    else setIndeks(i => i + 1)
  }

  const wstecz = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (indeks === 0) onWrocDoFormularza?.()
    else setIndeks(i => i - 1)
  }

  const wybierz = (id: string) => {
    if (krok.wielokrotny) {
      setOdpowiedzi(p => {
        const obecne = p[krok.id] ?? []
        return { ...p, [krok.id]: obecne.includes(id) ? obecne.filter(x => x !== id) : [...obecne, id] }
      })
      return
    }
    // Jednokrotny wybór zostaje zaznaczony; przejście dalej robi przycisk „Dalej”, żeby nic nie kliknęło się przypadkiem
    setOdpowiedzi({ ...odpowiedzi, [krok.id]: [id] })
  }

  const mozeDalej = wybrane.length > 0
  const kanaly = KROKI.find(k => k.id === 'zrodlo')!.opcje

  return (
    <div className="relative flex h-full min-h-[620px] w-full gap-4 p-3 font-sans text-foreground sm:p-4">
      <StyleKrokow />
      <StyleScen />

      {/* Lewy panel — scena zamiast wideo; na węższych ekranach znika */}
      <aside className="hidden w-[34%] max-w-[460px] shrink-0 lg:block">
        <PanelSceny scena={krok.scena} wybrane={wybrane} podpis={krok.podpisSceny} kanaly={kanaly} />
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col items-center px-2 sm:px-6">
        {/* Telefon: górna połowa to animacja SVG, która płynnie przechodzi w tło (maska gradientowa) */}
        {krok.id !== 'zrodlo' && (
        <div className={cn('relative -mx-3 -mt-3 mb-2 w-[calc(100%+1.5rem)] shrink-0 overflow-hidden lg:hidden', krok.id === 'funkcje' ? 'h-[26dvh]' : krok.id === 'problem' ? 'h-[30dvh]' : 'h-[36dvh]')}>
          <ScenaTelefon scena={krok.id === 'funkcje' ? 'poziom' : krok.scena} mnoznik={krok.id === 'problem' ? 0.6 : 1} srodek={krok.id === 'problem' ? 62 : 50} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[hsl(var(--background))]" />
        </div>
        )}

        {/* Górny pasek: wstecz + postęp */}
        <div className="relative flex h-10 w-full items-center justify-center max-lg:absolute max-lg:left-0 max-lg:top-2 max-lg:z-10 max-lg:w-full max-lg:px-3">
          {(indeks > 0 || onWrocDoFormularza) && (
            <button
              type="button"
              onClick={wstecz}
              aria-label="Wstecz"
              className="absolute left-0 top-12 flex h-9 items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 text-[13px] font-medium text-foreground/80 backdrop-blur-xl transition-colors hover:border-foreground/25 hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Wstecz
            </button>
          )}
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={KROKI.length}
            aria-valuenow={indeks + 1}
            aria-label={`Krok ${indeks + 1} z ${KROKI.length}`}
            className="flex items-center gap-1.5"
          >
            {KROKI.map((k, i) => (
              <span
                key={k.id}
                className={cn(
                  'h-[3px] rounded-full transition-all duration-300',
                  i === indeks ? 'w-6 bg-[hsl(var(--primary))]'
                    : i < indeks ? 'w-3 bg-[hsl(var(--primary)/0.7)]'
                    : 'w-3 bg-[hsl(var(--foreground)/0.14)]',
                )}
              />
            ))}
          </div>
        </div>

        {/* Treść kroku — zakotwiczona u góry, żeby tytuł nie skakał między krokami */}
        <div key={krok.id} className={cn('nb-krok-wchodzi flex w-full max-w-[560px] flex-1 flex-col items-center pt-[2vh] sm:pt-[13vh]', krok.id === 'zrodlo' && 'max-lg:pt-[9dvh]')}>
          <h1 className={cn(
            'text-center',
            trzy
              ? 'font-heading text-[30px] font-light leading-[1.1] tracking-[-0.7px] sm:text-[34px]'
              : 'text-[26px] font-semibold leading-[1.15] tracking-[-0.6px] sm:text-[30px]',
          )}>
            <span className="block text-foreground">{krok.tytul[0]}</span>
            <span className="block text-primary">{krok.tytul[1]}</span>
          </h1>

          {!trzy ? (
            <div className="relative -mt-2 min-h-[220px] w-full max-w-[560px] flex-1 lg:mt-0 lg:h-[62vh] lg:flex-none">
              <PoleOdpowiedzi
                trzymajWszystkie
                podpisyMale={mobilny}
                odpowiedzi={krok.opcje.map(o => ({ id: o.id, etyk: o.nazwa, glif: SYMBOLE_OB2.get(o.id)?.glif ?? '', pole: SYMBOLE_OB2.get(o.id)?.pole }))}
                wybrane={wybrane}
                onWybierz={wybierz}
                wielokrotny={krok.wielokrotny}
                tlo={KROKI_ONBOARDING2.find(k => k.id === krok.id)?.tlo ?? 'wydmy'}
                rdzen={false}
                tryb={KROKI_ONBOARDING2.find(k => k.id === krok.id)?.tryb}
                mobilny={mobilny}
                bezTla
                skalaSymboli={mobilny ? 1.15 : 0.8}
                pozycje={krok.id === 'funkcje'
                  ? POZYCJE_FUNKCJE_TELEFON
                  : krok.id === 'zrodlo'
                    ? (mobilny ? undefined : siatka(krok.opcje.length, 3))
                    : krok.opcje.length <= 6 ? siatka(krok.opcje.length, 2) : undefined}
              />
            </div>
          ) : krok.uklad === 'kafelki' ? (
            <>
            {trzy ? (
              <div className="mt-5 grid w-full grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
                {krok.opcje.map(o => (
                  <KafelekOpcji
                    key={o.id}
                    opcja={o}
                    wielokrotny={krok.wielokrotny}
                    zaznaczony={wybrane.includes(o.id)}
                    onClick={() => wybierz(o.id)}
                    trzy={trzy}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Telefon (Onboarding 1): symbole z Onboardingu 2 w gęstym układzie */}
                <div className="mt-5 grid w-full grid-cols-2 gap-x-2 gap-y-3 sm:mt-8 lg:hidden">
                  {krok.opcje.map(o => (
                    <KafelekIkona key={o.id} opcja={o} zaznaczona={wybrane.includes(o.id)} onClick={() => wybierz(o.id)} rozmiar="h-16 w-16" />
                  ))}
                </div>
                {/* Komputer (Onboarding 1): te same symbole po prawej stronie */}
                <div className="mt-8 hidden w-full max-w-[520px] grid-cols-2 gap-x-3 gap-y-5 lg:grid">
                  {krok.opcje.map(o => (
                    <KafelekIkona key={o.id} opcja={o} zaznaczona={wybrane.includes(o.id)} onClick={() => wybierz(o.id)} />
                  ))}
                </div>
              </>
            )}
            </>
          ) : (
            trzy ? (
              <div className="mt-5 grid w-full grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center">
                {krok.opcje.map(o => (
                  <PigulkaOpcji key={o.id} opcja={o} zaznaczona={wybrane.includes(o.id)} onClick={() => wybierz(o.id)} />
                ))}
              </div>
            ) : (
              <div className="mt-5 grid w-full grid-cols-2 gap-x-2 gap-y-3 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-4">
                {krok.opcje.map(o => (
                  <KafelekIkona key={o.id} opcja={o} zaznaczona={wybrane.includes(o.id)} onClick={() => wybierz(o.id)} rozmiar="h-16 w-16" />
                ))}
              </div>
            )
          )}

          {(
            <button
              type="button"
              disabled={!mozeDalej}
              onClick={() => dalej()}
              className={cn(
                'group mt-5 inline-flex h-12 w-full max-w-[360px] items-center justify-center gap-2 rounded-xl px-5 text-[14.5px] font-semibold backdrop-blur-xl transition-all duration-200 ease-out select-none sm:mt-8 sm:h-10 sm:w-auto sm:max-w-none sm:text-[13.5px]',
                mozeDalej
                  ? 'border border-primary/60 bg-primary/20 text-foreground shadow-[0_0_24px_-2px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-primary/30 hover:border-primary hover:scale-[1.02] hover:shadow-[0_0_36px_0px_hsl(var(--primary)/0.6),inset_0_1px_0_0_rgba(255,255,255,0.4)] active:scale-[0.98] cursor-pointer'
                  : 'border border-foreground/[0.10] bg-foreground/[0.04] text-muted-foreground cursor-not-allowed',
              )}
            >
              {mozeDalej ? (ostatni ? 'Wejdź na platformę' : 'Dalej') : 'Wybierz opcję'}
              {mozeDalej && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          )}
        </div>

        <p key={`p-${krok.id}`} className="nb-krok-wchodzi hidden pb-2 pt-3 text-center text-[12px] sm:block sm:pb-4 sm:pt-8 sm:text-[12.5px] text-muted-foreground">
          {krok.podpis}
        </p>
      </section>
    </div>
  )
}

/* Kafelek: ikona w lewym górnym rogu, znacznik wyboru w prawym, tytuł na
   dole. Kółko = wybór jednokrotny, kwadrat = wielokrotny. */
/** Układ 3-2-2 dla kroku „Które funkcje” na telefonie (ułamki pola: góra 3, środek 2, dół 2) */
const POZYCJE_FUNKCJE_TELEFON: [number, number][] = [
  [0.17, 0.14], [0.5, 0.14], [0.83, 0.14],
  [0.33, 0.5], [0.67, 0.5],
  [0.33, 0.86], [0.67, 0.86],
]

/** Siatka opcji w ułamkach pola: 2 lub 3 kolumny, równe odstępy między rzędami.
    Rozstaw rzędów nie większy niż 0.36 pola, żeby mało opcji nie rozjeżdżało się po całej wysokości. */
function siatka(n: number, kolumny: number): [number, number][] {
  const wiersze = Math.max(1, Math.ceil(n / kolumny))
  const rozstaw = wiersze === 1 ? 0 : Math.min(0.68 / (wiersze - 1), 0.36)
  const start = wiersze === 1 ? 0.45 : 0.1 + (0.68 - rozstaw * (wiersze - 1)) / 2
  const xs = kolumny === 2 ? [0.25, 0.75] : [0.17, 0.5, 0.83]
  return Array.from({ length: n }, (_, i) =>
    [xs[i % kolumny], start + Math.floor(i / kolumny) * rozstaw] as [number, number])
}

/** Scena z Onboardingu 1 na telefonie: wypełnia górę bez rozciągania, jak w Onboardingu 3 */
const SCENA_W = 400
const SCENA_H = 560
function ScenaTelefon({ scena, mnoznik = 1, srodek = 50 }: { scena: IdSceny; mnoznik?: number; srodek?: number }) {
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
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 shrink-0"
        style={{ top: `${srodek}%`, width: SCENA_W, height: SCENA_H, transform: `translate(-50%, -50%) scale(${skala * mnoznik})` }}
      >
        <PanelSceny scena={scena} wybrane={[]} podpis="" kanaly={[]} sama bezNapisow />
      </div>
    </div>
  )
}

/** Symbole z Onboardingu 2 (ten sam kształt co cząsteczki) — dla każdej opcji po jej id */
const SYMBOLE_OB2 = new Map(KROKI_ONBOARDING2.flatMap(k => k.odpowiedzi.map(o => [o.id, o] as const)))

/** Symbol opcji z Onboardingu 2; gdy go brak, zostaje dotychczasowa ikona */
function SymbolOpcji({ opcja, className }: { opcja: Opcja; className?: string }) {
  const s = SYMBOLE_OB2.get(opcja.id)
  if (!s) {
    const Ik = opcja.ikona
    return <Ik className={className} />
  }
  return (
    <svg
      viewBox={`0 0 ${s.pole ?? 120} ${s.pole ?? 120}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={s.pole ? 5 : 4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={s.glif} />
    </svg>
  )
}

/** Wybór jako nieruchomy symbol z Onboardingu 2 — bez kafelka i ramki, z podpisem pod spodem */
function KafelekIkona({ opcja, zaznaczona, onClick, rozmiar = 'h-20 w-20' }: { opcja: Opcja; zaznaczona: boolean; onClick: () => void; rozmiar?: string }) {
  const s = SYMBOLE_OB2.get(opcja.id)
  if (!s) return null
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={zaznaczona}
      onClick={onClick}
      className="group flex cursor-pointer select-none flex-col items-center gap-2 rounded-xl p-1 outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
    >
      <svg
        viewBox={`0 0 ${s.pole ?? 120} ${s.pole ?? 120}`}
        className={cn(rozmiar, 'transition-colors duration-200', zaznaczona ? 'text-primary' : 'text-foreground/65 group-hover:text-foreground')}
        fill="none"
        stroke="currentColor"
        strokeWidth={s.pole ? 5 : 4}
        strokeDasharray="0.1 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={s.glif} />
      </svg>
      <span className={cn(
        'text-center font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] transition-colors',
        zaznaczona ? 'text-primary' : 'text-foreground/55',
      )}>
        {opcja.nazwa}
      </span>
    </button>
  )
}

function KafelekOpcji({
  opcja, wielokrotny, zaznaczony, onClick, trzy = false,
}: { opcja: Opcja; wielokrotny: boolean; zaznaczony: boolean; onClick: () => void; trzy?: boolean }) {
  return (
    <button
      type="button"
      role={wielokrotny ? 'checkbox' : 'radio'}
      aria-checked={zaznaczony}
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[80px] flex-col justify-between rounded-2xl p-3 text-left sm:min-h-[104px] sm:p-4 transition-all duration-150 cursor-pointer select-none',
        'bg-[color-mix(in_srgb,hsl(var(--card))_55%,transparent)] backdrop-blur-[24px] ring-1 ring-inset',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.10),0_2px_5px_-1px_hsl(0_0%_0%/0.04),0_12px_32px_-8px_hsl(0_0%_0%/0.08)]',
        zaznaczony
          ? 'ring-[hsl(var(--primary)/0.7)] bg-[color-mix(in_srgb,hsl(var(--primary))_10%,hsl(var(--card))_55%)]'
          : 'ring-[hsl(var(--foreground)/0.11)] hover:ring-[hsl(var(--foreground)/0.22)] hover:bg-[color-mix(in_srgb,hsl(var(--foreground))_5%,hsl(var(--card))_72%)]',
      )}
    >
      <span className="flex items-start justify-between">
        <SymbolOpcji opcja={opcja} className={cn('h-4 w-4 transition-colors', zaznaczony ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground group-hover:text-foreground')} />
        <span
          aria-hidden
          className={cn(
            'flex h-[18px] w-[18px] items-center justify-center transition-all duration-150',
            wielokrotny ? 'rounded-[5px]' : 'rounded-full',
            zaznaczony
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'ring-1 ring-inset ring-[hsl(var(--foreground)/0.18)]',
          )}
        >
          {zaznaczony && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
        </span>
      </span>
      <span className="mt-4 block">
        <span className={cn('block leading-snug text-foreground', trzy ? 'font-heading text-[15.5px] font-light tracking-[-0.3px]' : 'text-[13.5px] font-semibold')}>{opcja.nazwa}</span>
        {opcja.opis && <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{opcja.opis}</span>}
      </span>
    </button>
  )
}

function PigulkaOpcji({ opcja, zaznaczona, onClick }: { opcja: Opcja; zaznaczona: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={zaznaczona}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-all duration-150 cursor-pointer select-none ring-1 ring-inset',
        zaznaczona
          ? 'bg-[hsl(var(--primary)/0.14)] text-foreground ring-[hsl(var(--primary)/0.55)]'
          : 'bg-[color-mix(in_srgb,hsl(var(--card))_48%,transparent)] text-foreground/85 ring-[hsl(var(--foreground)/0.10)] hover:bg-[color-mix(in_srgb,hsl(var(--foreground))_9%,transparent)] hover:text-foreground',
      )}
    >
      <SymbolOpcji opcja={opcja} className={cn('h-3.5 w-3.5', zaznaczona ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground')} />
      {opcja.nazwa}
    </button>
  )
}
