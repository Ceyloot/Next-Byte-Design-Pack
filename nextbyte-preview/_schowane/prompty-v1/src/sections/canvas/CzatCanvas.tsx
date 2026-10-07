import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  ArrowRightLeft,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  CirclePlus,
  Paperclip,
  Mic,
  PanelRightClose,
  ArrowUp,
  Maximize2,
  Wand2,
  Check,
  Pin,
  RefreshCw,
  Info,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Plus,
  Gem,
  Upload,
  Link2,
  Clipboard,
  X,
  Zap,
  Paintbrush,
  ImagePlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassModelSearch, type Model } from '@/components/glass/GlassModelSearch'
import { GeminiIcon, KlingIcon, NextByteMarkIcon, OpenAIIcon, RunwareIcon, XaiIcon } from '@/grafiki/znaki-marek'
import '../panel2/fundament/powierzchnie.css'
import { etykietaPineski, wytnijPodgladPineski, type Pineska, type Warstwa, type StanGeneracji } from './typy'
import { BYTE_ZA_OBRAZ } from './dostawca'
import { KLUCZ_PROMPTU_POSTACI, trybPromptuPostaci, type TrybPromptuPostaci } from './prompty/postac-pdf'
import { INTENCJE, type Intencja } from './tryby-edycji'
import type { Uwaga } from './kontrola-polecenia'
import type { OpcjaRol } from './role-z-polecenia'

const godzina = (d: Date) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
/** Wersja i czasy: po pullu zmienia się hash, po restarcie serwera — godzina serwera, po odświeżeniu — godzina strony. */
const WERSJA = typeof __CANVAS_WERSJA__ === 'string' ? __CANVAS_WERSJA__ : 'dev'

export interface WiadomoscCzatu {
  id: string
  rola: 'uzytkownik' | 'asystent' | 'system'
  tresc: string
  czas: string
  pineskiSnap?: { id: string; label: string; numer: number }[]
  obrazUrl?: string
  nazwaWyniku?: string
  opisWyniku?: string
  czasGeneracjiMs?: number
  intencja?: Intencja
  /** nazwa modelu, którym powstał wynik — pokazywana nad obrazem */
  model?: string
  /** wynik kontroli po generacji — bez niego nie twierdzimy, że się udało */
  ocena?: { wykonane: boolean; znaczniki: boolean; tekst: string }
}

interface Props {
  pineski: Pineska[]
  warstwy: Warstwa[]
  /** zaznaczone zdjęcie na płótnie — pokazujemy je w kompozytorze jako „w odniesieniu do” */
  wybranaWarstwa: string | null
  /** wiele zaznaczonych zdjęć (≥2) = referencje generacji bez pinesek */
  zaznaczoneWarstwy: Warstwa[]
  onOdznaczWarstwe: () => void
  tekst: string
  onTekst: (t: string) => void
  onWybierzPineske: (id: string | null) => void
  wybranaPineska: string | null
  onUsunPineske: (id: string) => void
  onZmienNazwePineski: (id: string, label: string) => void
  onWlaczNarzędziePineska: () => void
  onGeneruj: () => void
  stanGeneracji: StanGeneracji
  powodBlokady: string | null
  trwa: boolean
  intencja: Intencja
  uwagi: Uwaga[]
  podgladPolecenia: string
  /** odpowiedź na pytanie o role pinesek (poziom 4) — od razu uruchamia generację */
  onOdpowiedzRol: (opcja: OpcjaRol) => void
  modelObrazu: ModelObrazu
  onModelObrazu: (m: ModelObrazu) => void
  /** wersja promptów: Studio (zdanie użytkownika + bloki Studia Zdjęć) albo Nasz */
  trybPromptow: 'studio' | 'hybryda' | 'nasz'
  onTrybPromptow: (t: 'studio' | 'hybryda' | 'nasz') => void
  /** menu „+”: dodawanie zdjęć na płótno */
  onDodajPlik: () => void
  onWklejZeSchowka: () => void
  onDodajZAdresu: () => void
}

/** Modele obrazu w panelu „Modele”. `dostepny: false` — model jest w cenniku, ale Canvas jeszcze go nie obsługuje. */
export type ModelObrazu = 'auto' | 'lite' | 'nb2' | 'pro' | 'gptimage2'

const MODELE_OBRAZU = [
  { id: 'lite', nazwa: 'Nano Banana 2 Lite', krotko: 'Lite', ikona: Zap, opis: 'Szybki szkic, dobra jakość na co dzień', dostepny: true },
  { id: 'nb2', nazwa: 'Nano Banana 2', krotko: 'NB 2', ikona: Sparkles, opis: 'Dokładne detale, światło i skala', dostepny: true },
  { id: 'pro', nazwa: 'Nano Banana Pro', krotko: 'Pro', ikona: Gem, opis: 'Najwyższa jakość do 4K, wolniej', dostepny: true },
  { id: 'flux2pro', nazwa: 'FLUX.2 Pro', krotko: 'FLUX', ikona: Layers, opis: 'Black Forest Labs — wkrótce w Canvas.', dostepny: false },
  { id: 'ideogram4', nazwa: 'Ideogram 4.0', krotko: 'Ideogram', ikona: Layers, opis: 'Ideogram — wkrótce w Canvas.', dostepny: false },
  { id: 'seedream5', nazwa: 'Seedream 5.0 Pro', krotko: 'Seedream', ikona: Layers, opis: 'ByteDance — wkrótce w Canvas.', dostepny: false },
  { id: 'qwen3', nazwa: 'Qwen Image 3.0 Pro', krotko: 'Qwen', ikona: Layers, opis: 'Alibaba — wkrótce w Canvas.', dostepny: false },
  { id: 'klingo3', nazwa: 'Kling Image O3', krotko: 'Kling', ikona: Layers, opis: 'Kling AI — wkrótce w Canvas.', dostepny: false },
  { id: 'grok', nazwa: 'Grok Imagine', krotko: 'Grok', ikona: Layers, opis: 'xAI — wkrótce w Canvas.', dostepny: false },
  { id: 'gptimage2', nazwa: 'GPT Image 2', krotko: 'GPT', ikona: Layers, opis: 'Dokładne polecenia i napisy, najwolniejszy', dostepny: true },
  { id: 'zimage', nazwa: 'Z-Image Turbo', krotko: 'Z-Image', ikona: Layers, opis: 'Runware — wkrótce w Canvas.', dostepny: false },
] as const

/** Mały przycisk narzędzia — kształt i obwódka jak przyciski „Ustawienia” / „Aa” w górnym pasku nawigacji. */
/** Mała miniatura zdjęcia w chipie odniesienia (promień 4px = 8px chipa − 4px). */
function Miniatura({ src }: { src: string }) {
  return src ? (
    <img src={src} alt="" className="h-5 w-5 shrink-0 rounded-[4px] object-cover ring-1 ring-foreground/15" />
  ) : (
    <span className="h-5 w-5 shrink-0 rounded-[4px] bg-foreground/10" />
  )
}

const NARZEDZIE =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0 text-foreground/55 transition-all duration-200 hover:bg-foreground/[0.07] hover:text-foreground active:scale-95'

/** Znak dostawcy modelu — z biblioteki znaków marek; brak znaku = neutralna ikona. */
const ZNAK_MODELU: Record<string, React.ComponentType<{ className?: string }>> = {
  auto: NextByteMarkIcon,
  lite: GeminiIcon,
  nb2: GeminiIcon,
  pro: GeminiIcon,
  klingo3: KlingIcon,
  grok: XaiIcon,
  gptimage2: OpenAIIcon,
  zimage: RunwareIcon,
}
const znakModelu = (id: string) => ZNAK_MODELU[id] ?? Layers

/** Mały numerek pinezki do chipów — czytelny na jasnym i ciemnym szkle (kropla ze zdjęcia ginęła na jasnym). */
function NumerPinezki({ n }: { n: number }) {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-md border border-foreground/[0.12] bg-foreground/[0.08] text-[10px] font-semibold leading-none text-foreground">
      {n}
    </span>
  )
}

/** Model w formacie wyszukiwarki z biblioteki (GlassModelSearch); znak dostawcy z biblioteki znaków marek. */
const metryki = (jakosc: number, szybkosc: number) => [
  { label: 'Jakość', value: jakosc },
  { label: 'Szybkość', value: szybkosc },
]
const MODELE_DO_WYSZUKIWARKI: Model[] = [...MODELE_OBRAZU]
  .filter(m => m.dostepny) // w wyszukiwarce tylko modele, które Canvas naprawdę obsługuje
  .sort((x, y) => (x.id === 'nb2' ? -1 : y.id === 'nb2' ? 1 : 0))
  .map((m): Model => {
    const Z = znakModelu(m.id)
    return {
      id: m.id, name: m.nazwa, provider: m.id === 'gptimage2' ? 'OpenAI' : m.dostepny ? 'Google Gemini' : 'Wkrótce', badge: m.id === 'gptimage2' ? 'OPENAI' : m.dostepny ? 'GEMINI' : 'WKRÓTCE',
      group: m.dostepny ? 'NEXTBYTE' : 'INNE MODELE', description: m.opis, tags: ['obraz', m.krotko.toLowerCase()],
      cost: m.dostepny ? BYTE_ZA_OBRAZ : undefined, speed: 'balanced', icon: <Z className="h-4 w-4" />,
      metrics: metryki(m.id === 'pro' ? 10 : m.id === 'gptimage2' ? 9 : m.id === 'nb2' ? 8 : 6, m.id === 'lite' ? 9 : m.id === 'nb2' ? 6 : m.id === 'gptimage2' ? 3 : 4),
      messageCost: BYTE_ZA_OBRAZ, reasoningLevels: [],
    }
  })

export function CzatCanvas({
  pineski,
  warstwy,
  wybranaWarstwa,
  zaznaczoneWarstwy,
  onOdznaczWarstwe,
  tekst,
  onTekst,
  onWybierzPineske,
  wybranaPineska,
  onUsunPineske,
  onZmienNazwePineski,
  onWlaczNarzędziePineska,
  onGeneruj,
  stanGeneracji,
  powodBlokady,
  trwa,
  intencja,
  uwagi,
  onOdpowiedzRol,
  modelObrazu,
  onModelObrazu,
  trybPromptow,
  onTrybPromptow,
  onDodajPlik,
  onWklejZeSchowka,
  onDodajZAdresu,
}: Props) {
  const zaznaczona = warstwy.find(w => w.id === wybranaWarstwa && w.type === 'image' && !w.generator && w.src) ?? null
  // Jedno menu naraz: plus (dodawanie), modele
  const [menu, setMenu] = useState<null | 'plus' | 'modele'>(null)
  const [odswiez, setOdswiez] = useState(0)
  // TEST: długość promptu przy zmianach postaci — krótki (jak Lovart) albo pełny z PDF Studia; czytany przy generacji z localStorage
  const [promptPostaci, setPromptPostaci] = useState<TrybPromptuPostaci>(() => trybPromptuPostaci())
  const zmienPromptPostaci = (t: TrybPromptuPostaci) => {
    setPromptPostaci(t)
    try { localStorage.setItem(KLUCZ_PROMPTU_POSTACI, t) } catch { /* bez pamięci wybór działa do odświeżenia */ }
  }
  const [nagrywa, setNagrywa] = useState(false)
  const rozpoznawanie = useRef<{ stop: () => void } | null>(null)
  const przelaczNagrywanie = () => {
    if (nagrywa) { rozpoznawanie.current?.stop(); return }
    const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'pl-PL'
    r.interimResults = false
    r.onresult = (e: any) => { const t = Array.from(e.results as ArrayLike<any>).map(x => x[0].transcript).join(' '); onTekst(`${tekst} ${t}`.trim()) }
    r.onend = () => setNagrywa(false)
    r.onerror = () => setNagrywa(false)
    rozpoznawanie.current = r
    setNagrywa(true)
    r.start()
  }
  const refPasek = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    const naKlik = (e: MouseEvent) => {
      if (refPasek.current && !refPasek.current.contains(e.target as Node)) setMenu(null)
    }
    const naEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null) }
    document.addEventListener('mousedown', naKlik)
    document.addEventListener('keydown', naEsc)
    return () => {
      document.removeEventListener('mousedown', naKlik)
      document.removeEventListener('keydown', naEsc)
    }
  }, [menu])
  const [zwiniety, setZwiniety] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  // Commit na dysku (z gita, przy każdym otwarciu) — inny niż załadowany = serwer wymaga restartu
  const [wersjaDysk, setWersjaDysk] = useState<string | null>(null)
  useEffect(() => {
    void fetch('/api/canvas/wersja', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { dysk?: string } | null) => setWersjaDysk(d?.dysk ?? null))
      .catch(() => setWersjaDysk(null))
  }, [])
  const [, setWycinki] = useState<Record<string, string>>({})
  const wycinkiKlucze = useRef<Record<string, string>>({})
  const [historiaWiadomosci, setHistoriaWiadomosci] = useState<WiadomoscCzatu[]>([])

  const refKoniecWiadomosci = useRef<HTMLDivElement>(null)
  const refTextarea = useRef<HTMLTextAreaElement>(null)
  // Pozycja kursora w polu — do rozpoznania fragmentu słowa, który user pisze.
  const [pozKursora, setPozKursora] = useState(0)

  /**
   * Fragment słowa tuż przed kursorem — podstawa smart-chipa.
   *
   * User pisze „podusz", a system ma zrozumieć, że chodzi o oznaczoną
   * „poduszkę". Bierzemy ostatni wyraz przed kursorem (min. 2 znaki) i
   * szukamy pinesek, których nazwa go zawiera. Reżyser i tak dopisuje resztę
   * opisu — tu chodzi tylko o szybkie związanie słowa z konkretną pineską.
   */
  const fragment = (() => {
    const przed = tekst.slice(0, pozKursora || tekst.length)
    const m = przed.match(/([\p{L}]{2,})$/u)
    return m ? m[1].toLowerCase() : ''
  })()

  const podpowiedzi =
    fragment.length >= 2
      ? pineski
          .map((p, idx) => ({ p, idx, nazwa: etykietaPineski(p, idx + 1) }))
          .filter(({ nazwa }) => {
            const n = nazwa.toLowerCase()
            return n !== fragment && (n.startsWith(fragment) || n.includes(fragment))
          })
          .slice(0, 4)
      : []

  // Wycinanie podglądów okolic pinesek dla miniatur (smart crop)
  useEffect(() => {
    let aktywne = true
    pineski.forEach(p => {
      const w = warstwy.find(l => l.id === p.layerId)
      if (!w) return
      // Klucz zawiera obecność ramki: po rozpoznaniu obiektu podgląd przelicza się na cały obiekt
      const klucz = `${p.id}:${p.ramka ? 'r' : '-'}`
      if (wycinkiKlucze.current[p.id] !== klucz) {
        wycinkiKlucze.current[p.id] = klucz
        void wytnijPodgladPineski(w.src, p, 180).then(img => {
          if (aktywne && img) {
            setWycinki(prev => ({ ...prev, [p.id]: img }))
          }
        })
      }
    })
    return () => {
      aktywne = false
    }
  }, [pineski, warstwy])

  // Gdy generacja zakończy się sukcesem, dopisz do historii czatu
  useEffect(() => {
    if (stanGeneracji.faza === 'gotowe' && stanGeneracji.wynik) {
      const istnieje = historiaWiadomosci.some(w => w.obrazUrl === stanGeneracji.wynik.obrazUrl)
      if (!istnieje) {
        setHistoriaWiadomosci(prev => [
          ...prev,
          {
            id: `gen-${Date.now()}`,
            rola: 'asystent',
            tresc: '',
            czas: 'Przed chwilą',
            obrazUrl: stanGeneracji.wynik.obrazUrl,
            nazwaWyniku: stanGeneracji.wynik.nazwa,
            model: modelObrazu === 'auto' ? 'Auto' : MODELE_OBRAZU.find(m => m.id === modelObrazu)?.nazwa,
            opisWyniku: stanGeneracji.wynik.opis,
            intencja,
            ocena: stanGeneracji.ocena
              ? {
                  wykonane: stanGeneracji.ocena.wykonane,
                  znaczniki: stanGeneracji.ocena.znaczniki,
                  tekst: stanGeneracji.ocena.ocena,
                }
              : undefined,
          },
        ])
      }
    }
  }, [stanGeneracji])

  // Przewijanie do dołu przy nowej wiadomości
  useEffect(() => {
    refKoniecWiadomosci.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historiaWiadomosci, stanGeneracji.faza])

  // Automatyczny rozmiar pola textarea
  useEffect(() => {
    const el = refTextarea.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(130, Math.max(42, el.scrollHeight))}px`
  }, [tekst])

  // Obsługa wysyłki
  const wyslij = () => {
    if (trwa || !tekst.trim() || powodBlokady) return
    const aktualnyTekst = tekst.trim()
    const pinySnap =
      pineski.length === 0 && zaznaczoneWarstwy.length >= 2
        ? zaznaczoneWarstwy.map((w, idx) => ({ id: w.id, label: w.name, numer: idx + 1 }))
        : pineski.map((p, idx) => ({
            id: p.id,
            label: etykietaPineski(p, idx + 1),
            numer: idx + 1,
          }))

    setHistoriaWiadomosci(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        rola: 'uzytkownik',
        tresc: aktualnyTekst,
        czas: 'Teraz',
        pineskiSnap: pinySnap,
        intencja,
      },
    ])

    onGeneruj()
  }

  // Wstawianie chipa pineski do tekstu
  const wstawChip = (p: Pineska, numer: number) => {
    const nazwa = etykietaPineski(p, numer)
    const el = refTextarea.current
    if (!el) return onTekst(`${tekst} ${nazwa}`.trim())
    const start = el.selectionStart ?? tekst.length
    const koniec = el.selectionEnd ?? tekst.length
    const przed = tekst.slice(0, start)
    const po = tekst.slice(koniec)
    const spacja = przed && !przed.endsWith(' ') ? ' ' : ''
    const nowy = `${przed}${spacja}${nazwa} ${po}`
    onTekst(nowy)
    requestAnimationFrame(() => {
      el.focus()
      const pozycja = (przed + spacja + nazwa + ' ').length
      el.setSelectionRange(pozycja, pozycja)
    })
  }

  // Smart-chip: zamień pisany fragment na pełną nazwę oznaczonej pineski.
  const zastosujPodpowiedz = (p: Pineska, idx: number) => {
    const nazwa = etykietaPineski(p, idx + 1)
    const el = refTextarea.current
    const kursor = el?.selectionStart ?? pozKursora ?? tekst.length
    const przed = tekst.slice(0, kursor)
    const po = tekst.slice(kursor)
    const przedBezFragmentu = przed.replace(/[\p{L}]{2,}$/u, '')
    const nowy = `${przedBezFragmentu}${nazwa} ${po}`
    onTekst(nowy)
    const pozycja = (przedBezFragmentu + nazwa + ' ').length
    setPozKursora(pozycja)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(pozycja, pozycja)
    })
  }

  /* ══ WARIANT ZWINIĘTY: Szklana pływająca pastylka ══ */
  if (zwiniety) {
    return (
      <div className="pointer-events-auto absolute right-4 top-[var(--nb-canvas-gora,16px)] z-30">
        <button
          onClick={() => setZwiniety(false)}
          className={cn(
            'group relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5',
            'nb-szklo nb-szklo-plynne nb-powierzchnia',
            'border border-foreground/[0.08] backdrop-blur-2xl transition-all duration-200',
            'hover:border-primary/40 active:scale-95',
          )}
          style={{ backgroundColor: 'hsl(var(--card) / 0.8)' }}
          title="Rozwiń Chat Canvas"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
              Canvas AI
              {pineski.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[9px] font-extrabold text-primary">
                  {pineski.length}
                </span>
              )}
            </span>
            <span className="text-[10px] text-foreground/45">Kliknij, aby otworzyć chat</span>
          </div>
          <ChevronRight className="h-4 w-4 text-foreground/40 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    )
  }

  /* ══ WARIANT ROZWINIĘTY: jedna szklana karta NextByte — nagłówek, pinezki, historia, kompozytor ══ */
  return (
    <div className="p2 !bg-transparent pointer-events-none absolute bottom-[var(--nb-canvas-dol,16px)] right-4 top-[var(--nb-canvas-gora,16px)] z-30 flex w-[380px] max-w-[calc(100vw-32px)] flex-col">
      <div className="p2-szklo pointer-events-auto flex h-full min-h-0 w-full flex-col gap-3 !rounded-[28px] p-3 animate-in slide-in-from-right-4 duration-300">
        {/* Nagłówek: nazwa, wersja (diagnostyka), zwiń */}
        <div className="flex shrink-0 items-center justify-between">
          <span className="flex items-center gap-2.5 pl-1 text-[15px] font-semibold tracking-tight text-[hsl(var(--foreground))]">
            <span className="grid h-8 w-8 place-items-center rounded-[11px] bg-foreground/[0.06] text-foreground">
              <NextByteMarkIcon className="h-[15px] w-[15px]" />
            </span>
            Canvas
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { setHistoriaWiadomosci([]); onTekst('') }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/60 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
              title="Nowy czat"
              aria-label="Nowy czat"
            >
              <CirclePlus className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setZwiniety(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/60 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
              title="Zwiń"
              aria-label="Zwiń panel"
            >
              <PanelRightClose className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

      {/* ── 3. PRZEWIJANA HISTORIA WIADOMOŚCI & WYNIKÓW ── */}
      <div className="relative z-10 min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {historiaWiadomosci.length === 0 && !trwa && stanGeneracji.faza === 'bezczynny' && (
          <div className="flex h-full flex-col justify-center gap-4 px-1 pb-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/[0.12] text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-[16px] font-semibold text-foreground">Cześć! Zacznijmy od zdjęcia</p>
              <p className="max-w-[270px] text-[13px] leading-relaxed text-muted-foreground">
                Wgraj je na płótno, wbij pinezkę i opisz zmianę. Resztą zajmę się ja.
              </p>
            </div>
            <ul className="space-y-1.5">
              {[
                { ikona: ImagePlus, tytul: 'Wgraj lub wklej zdjęcie', opis: 'Przeciągnij plik albo Ctrl+V' },
                { ikona: Paintbrush, tytul: 'Inpaint i Eraser', opis: 'Zaznacz zdjęcie → pasek akcji nad nim' },
                { ikona: Pin, tytul: 'Pinezka', opis: 'Ctrl+klik wskazuje obiekt lub miejsce' },
              ].map(({ ikona: Ik, tytul, opis }) => (
                <li key={tytul} className="flex items-center gap-3 rounded-2xl bg-foreground/[0.04] px-3 py-2.5 transition-colors hover:bg-foreground/[0.065]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card text-foreground/75">
                    <Ik className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium text-foreground/90">{tytul}</span>
                    <span className="block text-[11px] text-muted-foreground">{opis}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {historiaWiadomosci.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col',
              msg.rola === 'uzytkownik' ? 'items-end' : 'items-start',
            )}
          >
            {/* Wiadomość użytkownika */}
            {msg.rola === 'uzytkownik' && (
              <div className="max-w-[88%] rounded-[20px] rounded-br-md bg-[hsl(var(--primary)/0.12)] px-4 py-2.5 text-[13.5px] font-medium text-[hsl(var(--foreground))]">
                <p className="leading-relaxed">{msg.tresc}</p>
                {msg.pineskiSnap && msg.pineskiSnap.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.pineskiSnap.map(snap => (
                      <span
                        key={snap.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/[0.12] bg-foreground/[0.05] py-0.5 pl-1 pr-2 text-[10.5px] font-medium text-[hsl(var(--foreground))]"
                      >
                        <NumerPinezki n={snap.numer} />
                        {snap.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Odpowiedź asystenta: sam obraz (wynik sam ląduje na płótnie) + zapis po najechaniu */}
            {msg.rola === 'asystent' && (
              <div className="w-full space-y-2">
                {msg.tresc && <p className="px-1 text-[13px] leading-[1.65] text-foreground/90">{msg.tresc}</p>}
                {msg.obrazUrl && (
                  <div className="group relative overflow-hidden rounded-2xl border border-foreground/[0.10] bg-foreground/[0.04] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.10),0_8px_24px_-12px_hsl(0_0%_0%/0.35)]">
                    <img src={msg.obrazUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
                    <img src={msg.obrazUrl} alt="Wynik generacji" className="nb-obraz-wejscie relative mx-auto max-h-[300px] w-full object-contain" />
                    <a
                      href={msg.obrazUrl}
                      download={`${(msg.nazwaWyniku || 'nextbyte').replace(/[^\w.-]+/g, '_')}.jpg`}
                      title="Zapisz obraz"
                      aria-label="Zapisz obraz"
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[10px] border border-foreground/[0.12] bg-[hsl(var(--background)/0.62)] text-foreground/80 opacity-0 backdrop-blur-md transition-all duration-150 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Trwający proces generacji / stan */}
        {trwa && (
          <div role="status" aria-live="polite" className="flex items-start gap-2.5 rounded-2xl bg-primary/[0.07] p-3.5 text-[12px] text-foreground">
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[11.5px]">
                {stanGeneracji.faza === 'planuje' && 'Asystent analizuje scenę i mapę miejsc...'}
                {stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'inpainting' && 'Maluję zaznaczony obszar…'}
                {stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'generator' && 'Generuję obraz z opisu…'}
                {stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'referencje' && (stanGeneracji.plan ?? 'Generuję z referencji…')}
                {stanGeneracji.faza === 'trwa' && !stanGeneracji.tryb && 'Runware generuje obraz z zachowaniem skali...'}
                {stanGeneracji.faza === 'sprawdza' && 'Weryfikacja spójności kadru i oświetlenia...'}
                {stanGeneracji.faza === 'poprawia' && 'Drugi przebieg: dopasowuję światło, cień i ziarno do oryginału...'}
                {stanGeneracji.faza === 'koryguje' && `Poprawiam rozmiar i miejsce: ${stanGeneracji.powod}`}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
                {stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'inpainting'
                  ? 'Model pracuje na fragmencie wokół zaznaczenia — reszta zdjęcia zostaje bez zmian.'
                  : stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'referencje'
                    ? 'Wszystkie zaznaczone zdjęcia idą do modelu jako referencje.'
                    : stanGeneracji.faza === 'trwa' && stanGeneracji.tryb === 'generator'
                    ? 'Tworzę nowe zdjęcie od zera, wyłącznie z Twojego opisu.'
                    : stanGeneracji.faza === 'trwa' && stanGeneracji.role
                      ? stanGeneracji.role
                      : 'Nie ruszam nieoznaczonych elementów sceny.'}
              </p>
              <div className="nb-pasek-pracy mt-2.5" aria-hidden />
            </div>
          </div>
        )}

        {/* Pytanie o role pinesek — zamiast zgadywać, jedno kliknięcie */}
        {stanGeneracji.faza === 'pyta' && (
          <div className="rounded-xl border border-foreground/[0.12] bg-foreground/[0.04] p-3 text-[11.5px] text-foreground">
            <div className="mb-2 flex items-start gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="font-semibold leading-snug">{stanGeneracji.pytanie.tresc}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {stanGeneracji.pytanie.opcje.map(opcja => (
                <button
                  key={opcja.etykieta}
                  type="button"
                  onClick={() => onOdpowiedzRol(opcja)}
                  className="rounded-lg border border-foreground/[0.12] bg-foreground/[0.05] px-3 py-2 text-left text-[11.5px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/[0.08] hover:text-foreground active:scale-[0.98]"
                >
                  {opcja.etykieta}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Błąd generacji */}
        {stanGeneracji.faza === 'blad' && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[11.5px] text-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 nb-tekst-bledu" />
            <div className="min-w-0 flex-1">
              <span className="block font-semibold">Błąd generacji</span>
              <span className="mt-0.5 block break-words text-[10.5px] leading-relaxed text-muted-foreground">
                {stanGeneracji.tresc}
              </span>
            </div>
          </div>
        )}

        <div ref={refKoniecWiadomosci} />
      </div>

      {/* Kompozytor: podgląd (na żądanie), uwagi, podpowiedzi, chipy pinesek, jedno pole i jeden przycisk */}
      <div className="relative z-20 shrink-0 space-y-2">
        {uwagi.length > 0 && (
          <div className="space-y-1">
            {uwagi.map(u => (
              <div
                key={u.id}
                className={cn(
                  'flex items-start gap-2 rounded-xl border px-3 py-2 text-[11.5px] leading-snug',
                  u.waga === 'blokada'
                    ? 'border-[hsl(var(--destructive)/0.22)] bg-[hsl(var(--destructive)/0.07)] text-[hsl(var(--foreground)/0.85)]'
                    : 'border-foreground/[0.08] bg-[hsl(var(--foreground)/0.04)] text-[hsl(var(--foreground)/0.8)]',
                )}
              >
                <Info className={cn('mt-px h-3 w-3 shrink-0', u.waga === 'blokada' && 'text-[hsl(var(--destructive)/0.8)]')} />
                <span>{u.tresc}</span>
              </div>
            ))}
          </div>
        )}

        {podpowiedzi.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-0.5 text-[11px] p2-cichy">„{fragment}…" →</span>
            {podpowiedzi.map(({ p, idx }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => zastosujPodpowiedz(p, idx)}
                className="p2-kontrolka p2-akcent-rant flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--foreground))]"
                title={`Wstaw jako oznaczony obiekt (pinezka ${idx + 1})`}
              >
                <NumerPinezki n={idx + 1} />
                {etykietaPineski(p, idx + 1)}
              </button>
            ))}
          </div>
        )}


        <div ref={refPasek} className="nb-cozy-niecka p-3">
          <div className="mb-2">
            <GlassModelSearch
              key={`${modelObrazu}-${odswiez}`}
              models={MODELE_DO_WYSZUKIWARKI}
              selectedId={modelObrazu}
              placement="top"
              align="left"
              compact
              onSelect={mo => {
                const model = MODELE_OBRAZU.find(x => x.id === mo.id)
                if (model?.dostepny) onModelObrazu(mo.id as ModelObrazu)
                else setOdswiez(n => n + 1)
              }}
            />
          </div>
          {/* TEST: długość promptu przy zamianie postaci i twarzy — krótki (jak Lovart) albo pełny z PDF Studia */}
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground" title="Test: jak długi prompt idzie do modelu przy zamianie postaci i twarzy">
            <span>Prompt postaci</span>
            {([['krotki', 'Krótki'], ['pdf', 'Pełny (PDF)']] as const).map(([id, et]) => (
              <button
                key={id}
                type="button"
                onClick={() => zmienPromptPostaci(id)}
                aria-pressed={promptPostaci === id}
                className={cn('rounded-lg px-2 py-0.5 font-medium transition-colors', promptPostaci === id ? 'bg-primary/[0.12] text-primary' : 'hover:bg-foreground/[0.07] hover:text-foreground')}
              >
                {et}
              </button>
            ))}
          </div>
          {/* W odniesieniu do czego jest polecenie: zaznaczone zdjęcie i pinezki — każda z miniaturą swojego zdjęcia */}
          {(zaznaczona || pineski.length > 0 || zaznaczoneWarstwy.length >= 2) && (
            <div className="mb-2 flex flex-wrap items-center gap-1" aria-label="Polecenie dotyczy">
              {pineski.length === 0 &&
                zaznaczoneWarstwy.map((w, idx) => (
                  <span key={w.id} className="p2-kontrolka flex items-center gap-1.5 py-0.5 pl-1 pr-2 text-[11px] font-medium text-foreground/85" title={`Referencja ${idx + 1}: ${w.name}`}>
                    <Miniatura src={w.src} />
                    <NumerPinezki n={idx + 1} />
                    <span className="max-w-[110px] truncate">{w.name}</span>
                  </span>
                ))}
              {pineski.length === 0 && zaznaczoneWarstwy.length >= 2 && (
                <button type="button" onClick={onOdznaczWarstwe} className="grid h-6 w-6 place-items-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-foreground/[0.08] hover:text-foreground" title="Odznacz wszystkie" aria-label="Odznacz wszystkie">
                  <X className="h-3 w-3" />
                </button>
              )}
              {zaznaczona && zaznaczoneWarstwy.length < 2 && !pineski.some(p => p.layerId === zaznaczona.id) && (
                <span className="p2-kontrolka flex items-center overflow-hidden text-[11px] font-medium text-foreground/85">
                  <span className="flex items-center gap-1.5 py-0.5 pl-1 pr-2">
                    <Miniatura src={zaznaczona.src} />
                    <span className="max-w-[150px] truncate">{zaznaczona.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={onOdznaczWarstwe}
                    className="grid h-full place-items-center px-1.5 py-1 text-muted-foreground/70 transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
                    title="Odznacz zdjęcie"
                    aria-label="Odznacz zdjęcie"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {pineski.map((p, idx) => {
                const wz = warstwy.find(w => w.id === p.layerId)
                return (
                  <span key={p.id} className="p2-kontrolka group flex items-center overflow-hidden text-[11px] font-medium p2-cichy">
                    <button
                      type="button"
                      onClick={() => wstawChip(p, idx + 1)}
                      className="flex items-center gap-1.5 py-0.5 pl-1 pr-1 transition-colors hover:text-[hsl(var(--foreground))]"
                      title={`Wstaw nazwę obiektu do polecenia${wz ? ` — zdjęcie: ${wz.name}` : ''}`}
                    >
                      {wz && <Miniatura src={wz.src} />}
                      <NumerPinezki n={idx + 1} />@{etykietaPineski(p, idx + 1)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUsunPineske(p.id)}
                      className="grid h-full place-items-center px-1.5 py-1 text-muted-foreground/70 transition-colors hover:bg-[hsl(var(--destructive)/0.15)] hover:text-[hsl(var(--destructive))]"
                      title="Usuń pinezkę"
                      aria-label={`Usuń pinezkę ${idx + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
          <textarea
            ref={refTextarea}
            value={tekst}
            onChange={e => {
              onTekst(e.target.value)
              setPozKursora(e.target.selectionStart ?? e.target.value.length)
            }}
            onKeyUp={e => setPozKursora(e.currentTarget.selectionStart ?? 0)}
            onClick={e => setPozKursora(e.currentTarget.selectionStart ?? 0)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                wyslij()
              }
            }}
            placeholder={
              pineski.length === 0 && zaznaczoneWarstwy.length >= 2
                ? `${zaznaczoneWarstwy.length} referencji — opisz wynik, np. „postać ze zdjęcia 1 w scenie ze zdjęcia 2”`
                : pineski.length === 0
                ? 'Zacznij od pomysłu — wbij pinezkę i opisz zmianę'
                : pineski.length === 1
                  ? `Co zrobić z: ${etykietaPineski(pineski[0], 1)}?`
                  : 'np. przenieś obiekt 1 na miejsce 2'
            }
            aria-label="Polecenie"
            className="max-h-[110px] min-h-[48px] w-full resize-none bg-transparent p-1 text-[14px] leading-relaxed text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)]"
          />
          <div className="mx-0.5 my-2 h-px bg-foreground/[0.08]" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {/* Załącz plik — plik, schowek albo adres */}
              <div>
                <button
                  type="button"
                  onClick={() => setMenu(m => (m === 'plus' ? null : 'plus'))}
                  aria-haspopup="menu"
                  aria-expanded={menu === 'plus'}
                  aria-label="Załącz plik"
                  title="Załącz plik"
                  className={cn(NARZEDZIE, menu === 'plus' && 'border-primary/40 bg-primary/[0.15] text-primary')}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                {menu === 'plus' && (
                  <div className="absolute bottom-full left-0 z-40 mb-2 w-[230px]">
                    <div role="menu" className="nb-szklo nb-szklo-plynne nb-powierzchnia overflow-hidden rounded-2xl border border-foreground/[0.12] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                      {[
                        { ikona: Upload, nazwa: 'Dodaj plik', akcja: onDodajPlik },
                        { ikona: Clipboard, nazwa: 'Wklej ze schowka', akcja: onWklejZeSchowka },
                        { ikona: Link2, nazwa: 'Z adresu URL', akcja: onDodajZAdresu },
                      ].map(({ ikona: Ik, nazwa, akcja }) => (
                        <button
                          key={nazwa}
                          role="menuitem"
                          type="button"
                          onClick={() => { setMenu(null); akcja() }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-medium text-foreground/75 transition-all duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
                        >
                          <Ik className="h-3.5 w-3.5" />
                          {nazwa}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={przelaczNagrywanie}
                aria-pressed={nagrywa}
                aria-label="Nagraj"
                title={nagrywa ? 'Zatrzymaj nagrywanie' : 'Nagraj głosem'}
                className={cn(NARZEDZIE, nagrywa && 'border-destructive/40 bg-destructive/15 text-destructive')}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={wyslij}
              disabled={trwa || !tekst.trim() || !!powodBlokady}
              title={powodBlokady ?? undefined}
              className="nb-cta nb-refleks-krawedzi flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {trwa ? 'Pracuję…' : 'Wyślij'}
              {!trwa && <span className="font-mono text-[11px] tabular-nums opacity-75">· {BYTE_ZA_OBRAZ} ⟠</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
    </div>
  )
}
