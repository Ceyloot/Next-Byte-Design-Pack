import React, { useEffect, useRef, useState } from 'react'
import {
  UserPlus, Users, Bot, Clapperboard, TrendingUp, Compass, Camera, Smartphone,
  MessageSquare, Image as ImageIcon, Video, Spline, NotebookPen, GraduationCap,
  Maximize2, AudioLines, Flame, Mic, UserRound, Brush, ImagePlus, FileText,
  Music2, Newspaper, Sparkles, Play, Gamepad2, HeartHandshake, MessagesSquare,
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
      { id: 'gen-wideo', nazwa: 'Generowanie wideo', ikona: Video },
      { id: 'upscale', nazwa: 'Upscale', ikona: Maximize2 },
      { id: 'lektor', nazwa: 'Lektor, muzyka i dubbing', ikona: AudioLines },
      { id: 'presety', nazwa: 'Popularne presety', ikona: Flame },
      { id: 'lipsync', nazwa: 'Lipsync i mówiące awatary', ikona: Mic },
      { id: 'awatary', nazwa: 'Realistyczne awatary AI', ikona: UserRound },
      { id: 'inpaint', nazwa: 'Edycja i inpainting', ikona: Brush },
      { id: 'gen-zdjec', nazwa: 'Generowanie zdjęć', ikona: ImagePlus },
      { id: 'dokumenty', nazwa: 'Notatki i dokumenty', ikona: FileText },
      { id: 'asystent', nazwa: 'Osobisty asystent AI', ikona: Bot },
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
      { id: 'artykuly', nazwa: 'Artykuły i media', ikona: Newspaper },
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
    wielokrotny: false,
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

/* Krótka pauza przed przejściem po wyborze jednokrotnym — żeby zaznaczenie
   zdążyło mignąć, zanim krok zniknie. */
const PAUZA_WYBORU = 280

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
}

export function OnboardingFlow({ poczatkowyKrok = 1, onZakoncz, onWrocDoFormularza }: OnboardingFlowProps) {
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
    const nowe = { ...odpowiedzi, [krok.id]: [id] }
    setOdpowiedzi(nowe)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => dalej(nowe), PAUZA_WYBORU)
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
        {/* Górny pasek: wstecz + postęp */}
        <div className="relative flex h-10 w-full items-center justify-center">
          {(indeks > 0 || onWrocDoFormularza) && (
            <button
              type="button"
              onClick={wstecz}
              aria-label="Wstecz"
              className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)] transition-colors hover:bg-[hsl(var(--foreground)/0.06)] hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
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
        <div key={krok.id} className="nb-krok-wchodzi flex w-full max-w-[560px] flex-1 flex-col items-center pt-[9vh] sm:pt-[13vh]">
          <h1 className="text-center text-[26px] font-semibold leading-[1.15] tracking-[-0.6px] sm:text-[30px]">
            <span className="block text-foreground">{krok.tytul[0]}</span>
            <span className="block text-muted-foreground">{krok.tytul[1]}</span>
          </h1>

          {krok.uklad === 'kafelki' ? (
            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {krok.opcje.map(o => (
                <KafelekOpcji
                  key={o.id}
                  opcja={o}
                  wielokrotny={krok.wielokrotny}
                  zaznaczony={wybrane.includes(o.id)}
                  onClick={() => wybierz(o.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {krok.opcje.map(o => (
                <PigulkaOpcji key={o.id} opcja={o} zaznaczona={wybrane.includes(o.id)} onClick={() => wybierz(o.id)} />
              ))}
            </div>
          )}

          {krok.wielokrotny && (
            <button
              type="button"
              disabled={!mozeDalej}
              onClick={() => dalej()}
              className={cn(
                'group mt-8 inline-flex h-10 items-center gap-2 rounded-[10px] px-5 text-[13.5px] font-semibold transition-all duration-200 select-none',
                mozeDalej
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.25),0_8px_24px_-8px_hsl(var(--primary)/0.6)] hover:brightness-110 active:scale-[0.98] cursor-pointer'
                  : 'bg-[hsl(var(--foreground)/0.07)] text-muted-foreground cursor-not-allowed',
              )}
            >
              {mozeDalej ? (ostatni ? 'Wejdź na platformę' : 'Dalej') : 'Wybierz opcję'}
              {mozeDalej && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          )}
        </div>

        <p key={`p-${krok.id}`} className="nb-krok-wchodzi pb-4 pt-8 text-center text-[12.5px] text-muted-foreground">
          {krok.podpis}
        </p>
      </section>
    </div>
  )
}

/* Kafelek: ikona w lewym górnym rogu, znacznik wyboru w prawym, tytuł na
   dole. Kółko = wybór jednokrotny, kwadrat = wielokrotny. */
function KafelekOpcji({
  opcja, wielokrotny, zaznaczony, onClick,
}: { opcja: Opcja; wielokrotny: boolean; zaznaczony: boolean; onClick: () => void }) {
  const Ik = opcja.ikona
  return (
    <button
      type="button"
      role={wielokrotny ? 'checkbox' : 'radio'}
      aria-checked={zaznaczony}
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[104px] flex-col justify-between rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer select-none',
        'bg-[color-mix(in_srgb,hsl(var(--card))_72%,transparent)] backdrop-blur-[18px] ring-1 ring-inset',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.10),0_2px_5px_-1px_hsl(0_0%_0%/0.04),0_12px_32px_-8px_hsl(0_0%_0%/0.08)]',
        zaznaczony
          ? 'ring-[hsl(var(--primary)/0.55)] bg-[color-mix(in_srgb,hsl(var(--primary))_8%,hsl(var(--card))_72%)]'
          : 'ring-[hsl(var(--foreground)/0.11)] hover:ring-[hsl(var(--foreground)/0.22)] hover:bg-[color-mix(in_srgb,hsl(var(--foreground))_5%,hsl(var(--card))_72%)]',
      )}
    >
      <span className="flex items-start justify-between">
        <Ik className={cn('h-4 w-4 transition-colors', zaznaczony ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground group-hover:text-foreground')} />
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
        <span className="block text-[13.5px] font-semibold leading-snug text-foreground">{opcja.nazwa}</span>
        {opcja.opis && <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{opcja.opis}</span>}
      </span>
    </button>
  )
}

function PigulkaOpcji({ opcja, zaznaczona, onClick }: { opcja: Opcja; zaznaczona: boolean; onClick: () => void }) {
  const Ik = opcja.ikona
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
      <Ik className={cn('h-3.5 w-3.5', zaznaczona ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground')} />
      {opcja.nazwa}
    </button>
  )
}
