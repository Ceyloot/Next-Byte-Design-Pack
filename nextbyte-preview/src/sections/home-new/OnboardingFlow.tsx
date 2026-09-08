import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  Image as ImageIcon,
  Rocket,
  MessageSquare,
  Video,
  GraduationCap,
  FileText,
  LayoutGrid,
  Cloud,
  Laptop,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from './shared'
import { OpenAIIcon, AnthropicIcon, GeminiIcon } from './HomePage'
import { MidjourneyIcon, CanvaIcon } from './brand-icons'

// ── Opcje Kroku 1 (Narzędzia AI) ─────────────────────────────────────────────
interface NarzedzieItem {
  id: string
  nazwa: string
  opis?: string
  ikona: React.ComponentType<{ className?: string }>
  badge?: string
}

const NARZEDZIA_AI: NarzedzieItem[] = [
  { id: 'chatgpt', nazwa: 'ChatGPT', opis: 'Najpopularniejszy model konwersacyjny OpenAI', ikona: OpenAIIcon, badge: 'OpenAI' },
  { id: 'claude', nazwa: 'Claude', opis: 'Zaawansowana analiza, kod i długie konteksty', ikona: AnthropicIcon, badge: 'Anthropic' },
  { id: 'gemini', nazwa: 'Gemini', opis: 'Multimodalna sztuczna inteligencja od Google', ikona: GeminiIcon, badge: 'Google' },
  { id: 'midjourney', nazwa: 'Midjourney / generatory grafik', opis: 'Fotorealistyczne obrazy i grafiki koncepcyjne', ikona: MidjourneyIcon, badge: 'Grafika' },
  { id: 'canva', nazwa: 'Canva', opis: 'Szablony, prezentacje i szybki design z AI', ikona: CanvaIcon, badge: 'Design' },
  {
    id: 'poczatkujacy',
    nazwa: 'Dopiero zaczynam z AI',
    opis: 'I bardzo dobrze, poprowadzimy Cię od zera',
    ikona: Rocket,
    badge: 'Nowy w AI',
  },
]

// ── Opcje Kroku 2 (Główne Cele) ──────────────────────────────────────────────
interface CelItem {
  id: string
  tytul: string
  podtytul: string
  ikona: React.ComponentType<{ className?: string }>
  tag: string
}

const CELE_UZYTKOWNIKA: CelItem[] = [
  {
    id: 'chat',
    tytul: 'Rozmowy i praca z Chat AI',
    podtytul: 'najlepsze modele w jednym miejscu',
    ikona: MessageSquare,
    tag: 'Modele LLM',
  },
  {
    id: 'zdjecia',
    tytul: 'Generowanie zdjęć i grafik',
    podtytul: 'Studio Zdjęć',
    ikona: ImageIcon,
    tag: 'Grafika',
  },
  {
    id: 'wideo',
    tytul: 'Tworzenie wideo',
    podtytul: 'Studio Video',
    ikona: Video,
    tag: 'Klip & Animacja',
  },
  {
    id: 'nauka',
    tytul: 'Nauka AI krok po kroku',
    podtytul: 'kursy i lekcje w Akademii',
    ikona: GraduationCap,
    tag: 'Edukacja',
  },
  {
    id: 'notatki',
    tytul: 'Notatki i dokumenty',
    podtytul: 'baza wiedzy z AI',
    ikona: FileText,
    tag: 'Baza Wiedzy',
  },
  {
    id: 'organizacja',
    tytul: 'Organizacja i produktywność',
    podtytul: 'zadania, kalendarz, CRM',
    ikona: LayoutGrid,
    tag: 'Produktywność',
  },
  {
    id: 'asystent_online',
    tytul: 'Personalny asystent online',
    podtytul: 'bez instalacji, bez zmartwień',
    ikona: Cloud,
    tag: 'Chmura',
  },
  {
    id: 'asystent_lokalnie',
    tytul: 'Personalny asystent lokalnie',
    podtytul: 'na Twoim komputerze, dane zostają u Ciebie',
    ikona: Laptop,
    tag: 'Prywatność 100%',
  },
]

/* Własne keyframe'y zamiast klas `animate-in` / `slide-in-from-*`:
   projekt nie ma pluginu tailwindcss-animate, więc te klasy nic nie robiły
   (getComputedStyle zwracał animationName: none). Bez fill-mode `both` —
   gdyby animacja z jakiegoś powodu nie wystartowała, treść i tak jest
   widoczna, zamiast zostać na opacity 0. */
function StyleKrokow() {
  return (
    <style>{`
      @keyframes nbKrokZPrawej { from { opacity: 0; transform: translateX(28px) } }
      @keyframes nbKrokZLewej  { from { opacity: 0; transform: translateX(-28px) } }
      @keyframes nbPojaw       { from { opacity: 0 } }
      .nb-krok-prawo { animation: nbKrokZPrawej .34s cubic-bezier(.16,1,.3,1) }
      .nb-krok-lewo  { animation: nbKrokZLewej  .34s cubic-bezier(.16,1,.3,1) }
      .nb-pojaw      { animation: nbPojaw .3s ease-out }
      @media (prefers-reduced-motion: reduce) {
        .nb-krok-prawo, .nb-krok-lewo, .nb-pojaw { animation: none }
      }
    `}</style>
  )
}

interface OnboardingFlowProps {
  poczatkowyKrok?: 1 | 2
  onZakoncz?: () => void
  onWrocDoFormularza?: () => void
}

export function OnboardingFlow({
  poczatkowyKrok = 1,
  onZakoncz,
  onWrocDoFormularza,
}: OnboardingFlowProps) {
  const [krok, setKrok] = useState<1 | 2>(poczatkowyKrok === 2 ? 2 : 1)
  const [wybraneNarzedzia, setWybraneNarzedzia] = useState<string[]>(['chatgpt'])
  const [wybraneCele, setWybraneCele] = useState<string[]>(['chat', 'zdjecia'])

  // Przełączanie narzędzi (Krok 1)
  const przelaczNarzedzie = (id: string) => {
    if (id === 'poczatkujacy') {
      setWybraneNarzedzia(prev => (prev.includes('poczatkujacy') ? [] : ['poczatkujacy']))
      return
    }
    setWybraneNarzedzia(prev => {
      const bezPoczatkujacego = prev.filter(x => x !== 'poczatkujacy')
      if (bezPoczatkujacego.includes(id)) {
        return bezPoczatkujacego.filter(x => x !== id)
      } else {
        return [...bezPoczatkujacego, id]
      }
    })
  }

  // Przełączanie celów (Krok 2 - bez limitu, dowolna liczba)
  const przelaczCel = (id: string) => {
    setWybraneCele(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      return [...prev, id]
    })
  }

  const obsluzKoniec = () => {
    if (onZakoncz) {
      onZakoncz()
    } else if (onWrocDoFormularza) {
      onWrocDoFormularza()
    }
  }

  /* Kierunek przejścia: 1 = w przód (treść wjeżdża z prawej), -1 = wstecz */
  const [kierunek, setKierunek] = useState<1 | -1>(1)
  const idzDo = (nowy: 1 | 2) => {
    setKierunek(nowy > krok ? 1 : -1)
    setKrok(nowy)
  }

  /* Kroki różnią się wysokością (6 vs 8 kafelków), a blok jest wyśrodkowany,
     więc bez animowania wysokości całość podskakiwałaby przy zmianie kroku.
     Wysokości nie da się animować z „auto”: mierzymy docelową, cofamy do
     poprzedniej i puszczamy przejście. */
  const trescRef = useRef<HTMLDivElement>(null)
  const poprzedniaWys = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = trescRef.current
    if (!el) return
    const start = poprzedniaWys.current
    el.style.height = ''
    const cel = el.offsetHeight
    poprzedniaWys.current = cel
    if (start == null || start === cel) return
    el.style.height = `${start}px`
    void el.offsetHeight // wymuś reflow, inaczej przeglądarka zobaczy tylko stan końcowy
    el.style.height = `${cel}px`
  }, [krok])

  const pierwszyKrok = krok === 1
  const pozycje = pierwszyKrok
    ? NARZEDZIA_AI.map(n => ({ id: n.id, tytul: n.nazwa, opis: n.opis, ikona: n.ikona }))
    : CELE_UZYTKOWNIKA.map(c => ({ id: c.id, tytul: c.tytul, opis: c.podtytul, ikona: c.ikona }))
  const zaznaczone = pierwszyKrok ? wybraneNarzedzia : wybraneCele
  const przelacz = pierwszyKrok ? przelaczNarzedzie : przelaczCel

  return (
    <div className="nb-pojaw relative z-10 w-full max-w-[760px]">
      <StyleKrokow />
      {/* Górny pasek: etykieta kroku + wyjście */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/35">
          Personalizacja konta
        </span>
        <button
          type="button"
          onClick={obsluzKoniec}
          className="group inline-flex items-center gap-1.5 font-sans text-[12.5px] text-foreground/40 transition-colors hover:text-foreground/75 cursor-pointer"
        >
          Pomiń personalizację
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Postęp — cienki pasek zamiast grubych segmentów z neonem */}
      <div className="mt-3 flex items-center gap-1.5">
        {[1, 2].map(indeks => (
          <span
            key={indeks}
            className={cn(
              'h-[3px] flex-1 rounded-full transition-colors duration-300',
              indeks <= krok ? 'bg-primary' : 'bg-foreground/[0.10]',
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-sans text-[12px]">
        <span className="font-medium text-foreground/70">
          {pierwszyKrok ? 'Narzędzia AI' : 'Twoje cele'}
        </span>
        <span className="font-mono text-foreground/35">Krok {krok} z 2</span>
      </div>

      {/* Zmienna część kroku — wysokość animowana, zawartość wjeżdża z boku.
          overflow-hidden przycina wsuwający się blok do krawędzi, przez co
          czyta się jak przesuwanie kart, a nie skok. */}
      <div
        ref={trescRef}
        onTransitionEnd={e => {
          if (e.propertyName === 'height' && e.target === e.currentTarget) {
            e.currentTarget.style.height = ''
          }
        }}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
      >
        <div
          key={krok}
          className={kierunek === 1 ? 'nb-krok-prawo' : 'nb-krok-lewo'}
        >
          {/* Nagłówek kroku */}
          <div className="mt-10 text-center">
            <h1 className="font-sans text-[24px] font-bold leading-tight tracking-[-0.8px] text-foreground">
              {pierwszyKrok ? 'Z jakich narzędzi AI już korzystasz?' : 'Na czym zależy Ci najbardziej?'}
            </h1>
            <p className="mt-1.5 font-sans text-[13.5px] text-foreground/40">
              {pierwszyKrok
                ? 'Dzięki temu dopasujemy start do Twojego poziomu'
                : 'Od tego zaczniemy Twój pierwszy dzień'}
            </p>
          </div>

          {/* Siatka wyboru — jeden komponent kafelka dla obu kroków */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pozycje.map(poz => (
              <Kafelek
                key={poz.id}
                ikona={poz.ikona}
                tytul={poz.tytul}
                opis={poz.opis}
                zaznaczony={zaznaczone.includes(poz.id)}
                onClick={() => przelacz(poz.id)}
              />
            ))}
          </div>

          {/* Akcje — jedno główne działanie po prawej, reszta jako link */}
          <div className="mt-9 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => idzDo(pierwszyKrok ? 2 : 1)}
              className="inline-flex items-center gap-1.5 font-sans text-[13px] text-foreground/40 transition-colors hover:text-foreground/75 cursor-pointer"
            >
              {pierwszyKrok ? (
                'Pomiń ten krok'
              ) : (
                <>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Wstecz
                </>
              )}
            </button>

            <GlowButton
              size="lg"
              onClick={() => (pierwszyKrok ? idzDo(2) : obsluzKoniec())}
              className="h-[46px] px-7"
            >
              {pierwszyKrok ? 'Dalej' : 'Przejdź do platformy'}
            </GlowButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Kafelek wyboru — wspólny dla obu kroków. Wcześniej ten sam markup był
   zduplikowany w kroku 1 i 2, przez co każda poprawka wymagała dwóch edycji. */
function Kafelek({
  ikona: Icon, tytul, opis, zaznaczony, onClick,
}: {
  ikona: React.ElementType
  tytul: string
  opis?: string
  zaznaczony: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={zaznaczony}
      className={cn(
        'group relative flex items-start gap-3.5 rounded-xl p-4 text-left transition-all duration-150 cursor-pointer select-none',
        'ring-1 ring-inset',
        zaznaczony
          ? 'bg-primary/[0.08] ring-primary/45'
          : 'bg-foreground/[0.03] ring-foreground/[0.08] hover:bg-foreground/[0.055] hover:ring-foreground/20',
      )}
    >
      <span className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
        zaznaczony
          ? 'bg-primary/15 text-primary'
          : 'bg-foreground/[0.05] text-foreground/45 group-hover:text-foreground/75',
      )}>
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1 pr-5">
        <span className="block font-sans text-[13.5px] font-semibold leading-snug text-foreground">
          {tytul}
        </span>
        {opis && (
          <span className="mt-0.5 block font-sans text-[12px] leading-snug text-foreground/40">
            {opis}
          </span>
        )}
      </span>

      <span className={cn(
        'absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-150',
        zaznaczony ? 'opacity-100' : 'opacity-0',
      )}>
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
    </button>
  )
}
