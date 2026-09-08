import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
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
   (getComputedStyle zwracał animationName: none).

   Przejście to czyste przenikanie krycia — bez cienia przesunięcia treści.
   Wersja z translateY(10px) dawała efekt odbicia: blok jest wyśrodkowany w
   pionie, więc rosnąca wysokość i tak przesuwa całość w jedną stronę, a
   treść jechała wtedy w drugą. Dwa przeciwne ruchy naraz oko czyta jako
   odbicie, mimo że żadna krzywa nie ma przestrzelenia.

   Stary krok gaśnie do zera, zanim nowy zacznie się pojawiać — przy nakładce
   dwie siatki kafelków leżałyby na sobie półprzezroczyste. */
const CZAS_WYJSCIA = 140
const OPOZNIENIE_WEJSCIA = 120
const CZAS_WEJSCIA = 260
/* Wysokość kończy się dokładnie razem z krzywą krycia — gdy jedno kończy się
   po drugim, ten ogon czyta się jako osobny, drugi ruch. */
const CZAS_KROKU = OPOZNIENIE_WEJSCIA + CZAS_WEJSCIA
const KRZYWA_KROKU = 'cubic-bezier(0.4, 0, 0.2, 1)'

function StyleKrokow() {
  return (
    <style>{`
      @keyframes nbKrokWchodzi { from { opacity: 0 } }
      @keyframes nbKrokZnika   { to   { opacity: 0 } }
      @keyframes nbPojaw       { from { opacity: 0 } }
      /* Wypełnienie backwards trzyma krycie 0 przez czas opóźnienia — bez
         niego nowy krok mignąłby w pełni, zanim animacja go schowa. */
      .nb-krok-wchodzi { animation: nbKrokWchodzi ${CZAS_WEJSCIA}ms ${KRZYWA_KROKU} ${OPOZNIENIE_WEJSCIA}ms backwards }
      .nb-krok-znika   { animation: nbKrokZnika ${CZAS_WYJSCIA}ms ease-out forwards }
      .nb-pojaw        { animation: nbPojaw .3s ease-out }
      @media (prefers-reduced-motion: reduce) {
        .nb-krok-wchodzi, .nb-krok-znika, .nb-pojaw { animation: none }
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

  /* Przejście między krokami. W trakcie animacji absolutna jest TYLKO warstwa
     wychodząca — nowa zostaje w normalnym przepływie, więc naturalna wysokość
     pudełka zawsze równa się wysokości docelowej. To jest ważne dla końcówki:
     gdy wysokość zdejmujemy po animacji, pudełko wraca do „auto” i musi trafić
     w dokładnie tę samą wartość, do której dojechało. Przy obu warstwach
     absolutnych mierzyliśmy wysokość osobno i każda różnica (choćby przez
     pojawienie się paska przewijania) wracała na końcu jako skok.

     Pudełko nie ma też overflow-hidden: obie warstwy tylko zmieniają krycie,
     nic nie wyjeżdża w bok, a przycinanie było widoczne jako ostra krawędź
     ucinająca treść w trakcie zmiany wysokości. */
  const boxRef = useRef<HTMLDivElement>(null)
  const wysStartRef = useRef<number | null>(null)
  const [przejscie, setPrzejscie] = useState<{ z: 1 | 2 } | null>(null)

  /* Wysokość jedzie po style.height ustawianym ręcznie, nie przez stan Reacta.
     Przez stan nie działa: wartość startowa i docelowa trafiają do DOM w tym
     samym cyklu przeliczania stylu, więc przeglądarka widzi tylko „auto →
     docelowa”, a auto nie jest interpolowalne — wysokość przeskakiwała
     natychmiast, bez animacji. */
  const idzDo = (nowy: 1 | 2) => {
    if (nowy === krok) return
    const el = boxRef.current
    const bezRuchu =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || bezRuchu) { setKrok(nowy); return }
    wysStartRef.current = el.offsetHeight // wysokość sprzed podmiany treści
    setPrzejscie({ z: krok })
    setKrok(nowy)
  }

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!przejscie || !el) return
    const start = wysStartRef.current
    /* Cel czytamy z pudełka przy wysokości „auto”, czyli dokładnie tę wartość,
       którą przyjmie po sprzątnięciu — dzięki temu koniec przejścia nie ma
       czego doskakiwać. */
    el.style.height = ''
    const cel = el.offsetHeight
    if (start == null || start === cel) return
    /* Obie wartości muszą trafić do DOM tutaj, rozdzielone wymuszonym reflow.
       Bez niego przeglądarka widzi jedną zmianę i nie ma czego interpolować. */
    el.style.height = `${start}px`
    void el.offsetHeight
    el.style.height = `${cel}px`
  }, [przejscie, krok])

  /* Zdjęcie stałej wysokości dopiero po zakończeniu przejścia i zawsze w tym
     samym commicie, w którym znika warstwa wychodząca. */
  useLayoutEffect(() => {
    if (przejscie || !boxRef.current) return
    boxRef.current.style.height = ''
  }, [przejscie])

  useEffect(() => {
    if (!przejscie) return
    const id = window.setTimeout(() => setPrzejscie(null), CZAS_KROKU + 60)
    return () => window.clearTimeout(id)
  }, [przejscie])

  const pierwszyKrok = krok === 1

  /* Treść kroku jako funkcja numeru, a nie stanu — w trakcie przejścia
     trzeba wyrenderować jednocześnie krok stary i nowy. */
  const trescKroku = (k: 1 | 2) => {
    const pierwszy = k === 1
    const pozycje = pierwszy
      ? NARZEDZIA_AI.map(n => ({ id: n.id, tytul: n.nazwa, opis: n.opis, ikona: n.ikona }))
      : CELE_UZYTKOWNIKA.map(c => ({ id: c.id, tytul: c.tytul, opis: c.podtytul, ikona: c.ikona }))
    const wybrane = pierwszy ? wybraneNarzedzia : wybraneCele
    const przelaczK = pierwszy ? przelaczNarzedzie : przelaczCel
    return (
      <>
        {/* Nagłówek kroku */}
        <div className="mt-10 text-center">
          <h1 className="font-sans text-[24px] font-bold leading-tight tracking-[-0.8px] text-foreground">
            {pierwszy ? 'Z jakich narzędzi AI już korzystasz?' : 'Na czym zależy Ci najbardziej?'}
          </h1>
          <p className="mt-1.5 font-sans text-[13.5px] text-foreground/40">
            {pierwszy
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
              zaznaczony={wybrane.includes(poz.id)}
              onClick={() => przelaczK(poz.id)}
            />
          ))}
        </div>

        {/* Akcje — jedno główne działanie po prawej, reszta jako link */}
        <div className="mt-9 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => idzDo(pierwszy ? 2 : 1)}
            className="inline-flex items-center gap-1.5 font-sans text-[13px] text-foreground/40 transition-colors hover:text-foreground/75 cursor-pointer"
          >
            {pierwszy ? (
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
            onClick={() => (pierwszy ? idzDo(2) : obsluzKoniec())}
            className="h-[46px] px-7"
          >
            {pierwszy ? 'Dalej' : 'Przejdź do platformy'}
          </GlowButton>
        </div>
      </>
    )
  }

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

      {/* Zmienna część kroku — wysokość animowana jedną krzywą, treść
          przenika krycie. Bez overflow-hidden: nic nie wyjeżdża poza obrys,
          a przycinanie ucinałoby zarówno treść w trakcie zmiany wysokości,
          jak i poświatę przycisku CTA przy dolnej krawędzi. */}
      <div
        ref={boxRef}
        className="relative transition-[height]"
        style={{
          transitionDuration: `${CZAS_KROKU}ms`,
          transitionTimingFunction: KRZYWA_KROKU,
        }}
      >
        {przejscie && (
          <div
            key={`wychodzi-${przejscie.z}`}
            aria-hidden
            className="nb-krok-znika pointer-events-none absolute inset-x-0 top-0"
          >
            {trescKroku(przejscie.z)}
          </div>
        )}

        <div key={krok} className={cn(przejscie && 'nb-krok-wchodzi')}>
          {trescKroku(krok)}
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
