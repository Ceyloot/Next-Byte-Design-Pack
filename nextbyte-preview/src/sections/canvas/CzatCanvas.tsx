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
  Minimize2,
  Maximize2,
  Wand2,
  Check,
  Eye,
  Pin,
  RefreshCw,
  Info,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Copy,
  Cpu,
  Plus,
  Gem,
  ChevronRight,
  Upload,
  Link2,
  Clipboard,
  X,
  Search,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import '../panel2/fundament/powierzchnie.css'
import { etykietaPineski, wytnijPodgladPineski, type Pineska, type Warstwa, type StanGeneracji } from './typy'
import { LebekPinezki } from './ZnacznikPineski'
import { BYTE_ZA_OBRAZ } from './dostawca'
import { INTENCJE, type Intencja } from './tryby-edycji'
import type { Uwaga } from './kontrola-polecenia'
import type { OpcjaRol } from './role-z-polecenia'

const godzina = (d: Date) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
/** Wersja i czasy: po pullu zmienia się hash, po restarcie serwera — godzina serwera, po odświeżeniu — godzina strony. */
const WERSJA = typeof __CANVAS_WERSJA__ === 'string' ? __CANVAS_WERSJA__ : 'dev'
const SERWER_START = typeof __SERWER_START__ === 'string' ? godzina(new Date(__SERWER_START__)) : '?'
const ZALADOWANO = godzina(new Date())

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
  onWstawNaPlotno: (url: string, nazwa: string) => void
  /** odpowiedź na pytanie o role pinesek (poziom 4) — od razu uruchamia generację */
  onOdpowiedzRol: (opcja: OpcjaRol) => void
  modelObrazu: ModelObrazu
  onModelObrazu: (m: ModelObrazu) => void
  /** menu „+”: dodawanie zdjęć na płótno */
  onDodajPlik: () => void
  onWklejZeSchowka: () => void
  onDodajZAdresu: () => void
}

/** Wspólny styl wyskakujących menu paska: prawie kryjące szkło, żeby tekst z czatu nie przebijał. */
const STYL_MENU: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card) / 0.96)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  backdropFilter: 'blur(24px) saturate(160%)',
  boxShadow: '0 16px 40px -12px hsl(0 0% 0% / 0.45)',
}

/** Modele obrazu w panelu „Modele”. `dostepny: false` — model jest w cenniku, ale Canvas jeszcze go nie obsługuje. */
export type ModelObrazu = 'auto' | 'lite' | 'nb2' | 'pro'

const MODELE_OBRAZU = [
  { id: 'lite', nazwa: 'Nano Banana 2 Lite', krotko: 'Lite', ikona: Zap, opis: 'Szybszy i tańszy — dobry na co dzień.', dostepny: true },
  { id: 'nb2', nazwa: 'Nano Banana 2', krotko: 'NB 2', ikona: Sparkles, opis: 'Gemini 3.1 — lepsze detale, światło i skala.', dostepny: true },
  { id: 'pro', nazwa: 'Nano Banana Pro', krotko: 'Pro', ikona: Gem, opis: 'Najwyższa jakość, do 4K — do precyzyjnych edycji.', dostepny: true },
  { id: 'flux2pro', nazwa: 'FLUX.2 Pro', krotko: 'FLUX', ikona: Layers, opis: 'Black Forest Labs — wkrótce w Canvas.', dostepny: false },
  { id: 'ideogram4', nazwa: 'Ideogram 4.0', krotko: 'Ideogram', ikona: Layers, opis: 'Ideogram — wkrótce w Canvas.', dostepny: false },
  { id: 'seedream5', nazwa: 'Seedream 5.0 Pro', krotko: 'Seedream', ikona: Layers, opis: 'ByteDance — wkrótce w Canvas.', dostepny: false },
  { id: 'qwen3', nazwa: 'Qwen Image 3.0 Pro', krotko: 'Qwen', ikona: Layers, opis: 'Alibaba — wkrótce w Canvas.', dostepny: false },
  { id: 'klingo3', nazwa: 'Kling Image O3', krotko: 'Kling', ikona: Layers, opis: 'Kling AI — wkrótce w Canvas.', dostepny: false },
  { id: 'grok', nazwa: 'Grok Imagine', krotko: 'Grok', ikona: Layers, opis: 'xAI — wkrótce w Canvas.', dostepny: false },
  { id: 'gptimage2', nazwa: 'GPT Image 2', krotko: 'GPT', ikona: Layers, opis: 'OpenAI — wkrótce w Canvas.', dostepny: false },
  { id: 'zimage', nazwa: 'Z-Image Turbo', krotko: 'Z-Image', ikona: Layers, opis: 'Runware — wkrótce w Canvas.', dostepny: false },
] as const

export function CzatCanvas({
  pineski,
  warstwy,
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
  podgladPolecenia,
  onWstawNaPlotno,
  onOdpowiedzRol,
  modelObrazu,
  onModelObrazu,
  onDodajPlik,
  onWklejZeSchowka,
  onDodajZAdresu,
}: Props) {
  // Jedno menu naraz: plus (dodawanie), modele
  const [menu, setMenu] = useState<null | 'plus' | 'modele'>(null)
  const menuModelu = menu === 'modele'
  const refPasek = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    const naKlik = (e: MouseEvent) => {
      if (refPasek.current && !refPasek.current.contains(e.target as Node)) setMenu(null)
    }
    document.addEventListener('mousedown', naKlik)
    return () => document.removeEventListener('mousedown', naKlik)
  }, [menu])
  const [szukajModelu, setSzukajModelu] = useState('')
  const modeleWidoczne = MODELE_OBRAZU.filter(m => {
    const fraza = szukajModelu.trim().toLowerCase()
    return !fraza || `${m.nazwa} ${m.znacznik} ${m.opis}`.toLowerCase().includes(fraza)
  })
  const [zwiniety, setZwiniety] = useState(false)
  // Commit na dysku (z gita, przy każdym otwarciu) — inny niż załadowany = serwer wymaga restartu
  const [wersjaDysk, setWersjaDysk] = useState<string | null>(null)
  useEffect(() => {
    void fetch('/api/canvas/wersja', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { dysk?: string } | null) => setWersjaDysk(d?.dysk ?? null))
      .catch(() => setWersjaDysk(null))
  }, [])
  const [otwartyPodglad, setOtwartyPodglad] = useState(false)
  // Kopiowanie promptu wysłanego do modelu — do diagnozy (sekcje SCALE, LIGHT…)
  const [skopiowano, setSkopiowano] = useState(false)
  const kopiujPolecenie = async () => {
    if (!podgladPolecenia) return
    try {
      await navigator.clipboard.writeText(podgladPolecenia)
    } catch {
      // Schowek bywa zablokowany (brak uprawnień) — zapasowo przez zaznaczenie
      const pole = document.createElement('textarea')
      pole.value = podgladPolecenia
      document.body.appendChild(pole)
      pole.select()
      document.execCommand('copy')
      pole.remove()
    }
    setSkopiowano(true)
    window.setTimeout(() => setSkopiowano(false), 1600)
  }
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
    const pinySnap = pineski.map((p, idx) => ({
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
            'hover:border-primary/40 hover:scale-105 active:scale-95',
          )}
          title="Rozwiń Chat Canvas"
        >
          {/* Accent glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
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
  const wersjaRozjechana = Boolean(wersjaDysk && wersjaDysk !== WERSJA)
  return (
    <div className="p2 !bg-transparent pointer-events-none absolute bottom-[var(--nb-canvas-dol,16px)] right-4 top-[var(--nb-canvas-gora,16px)] z-30 flex w-[360px] max-w-[calc(100vw-32px)] flex-col">
      <div className="p2-szklo pointer-events-auto flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden p-3.5 animate-in slide-in-from-right-4 duration-300">
        {/* Nagłówek: nazwa, wersja (diagnostyka), zwiń */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 p2-akcent" />
            <span className="text-[14px] font-semibold tracking-tight text-[hsl(var(--foreground))]">Canvas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn('font-mono text-[10px] tabular-nums', wersjaRozjechana ? 'text-[hsl(var(--warning,var(--primary)))]' : 'p2-cichy')}
              title={`serwer wystartował ${SERWER_START} · strona załadowana ${ZALADOWANO}${wersjaRozjechana ? ` · na dysku v${wersjaDysk} — zrestartuj serwer (npm run dev)` : ''}`}
            >
              {wersjaRozjechana ? `⚠ v${WERSJA} → v${wersjaDysk}` : `v${WERSJA}`}
            </span>
            <button
              onClick={() => setZwiniety(true)}
              className="p2-kontrolka flex h-7 w-7 items-center justify-center p2-cichy hover:text-[hsl(var(--foreground))]"
              title="Zwiń"
              aria-label="Zwiń panel"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      {/* ── 3. PRZEWIJANA HISTORIA WIADOMOŚCI & WYNIKÓW ── */}
      <div className="relative z-10 min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-none">
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
              <div className="max-w-[88%] rounded-[20px] border border-foreground/20 bg-[hsl(var(--foreground)/0.05)] px-4 py-2.5 text-[13.5px] font-medium text-[hsl(var(--foreground))]">
                <p className="leading-relaxed">{msg.tresc}</p>
                {msg.pineskiSnap && msg.pineskiSnap.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.pineskiSnap.map(snap => (
                      <span
                        key={snap.id}
                        className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--background)/0.5)] px-1.5 py-0.5 text-[10.5px] font-medium text-[hsl(var(--foreground))]"
                      >
                        <LebekPinezki rozmiar={12} />
                        Pin {snap.numer}: {snap.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Odpowiedź asystenta */}
            {msg.rola === 'asystent' && (
              <div className="max-w-full space-y-2.5 rounded-2xl border border-foreground/10 bg-[hsl(var(--background)/0.35)] p-3.5 text-[13.5px] text-[hsl(var(--foreground))]">
                {msg.tresc && <p className="text-[13px] leading-[1.65] text-foreground/90">{msg.tresc}</p>}

                {/* Wygenerowany obraz z opcjami */}
                {msg.obrazUrl && (
                  <div className="mt-1 space-y-2">
                    {msg.model && (
                      <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
                        <Cpu className="h-3.5 w-3.5" />
                        {msg.model}
                      </p>
                    )}
                    <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-[hsl(var(--background)/0.6)]">
                      <img
                        src={msg.obrazUrl}
                        alt="Wynik generacji"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-semibold text-foreground truncate max-w-[150px]">
                        {msg.nazwaWyniku || 'Wygenerowany obraz'}
                      </span>
                      {msg.ocena && (
                        <span
                          className={cn(
                            'font-medium flex items-center gap-1',
                            msg.ocena.wykonane && !msg.ocena.znaczniki ? 'text-emerald-600' : 'nb-tekst-bledu',
                          )}
                        >
                          {msg.ocena.wykonane && !msg.ocena.znaczniki ? (
                            <>
                              <Check className="h-3 w-3" /> Zadanie wykonane
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" /> Do poprawy
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {msg.ocena && msg.ocena.tekst && (
                      <p className="text-[10.5px] leading-snug text-muted-foreground">{msg.ocena.tekst}</p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onWstawNaPlotno(msg.obrazUrl!, msg.nazwaWyniku || 'Wynik AI')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Layers className="h-3 w-3" />
                        Wstaw na płótno
                      </button>
                      <button
                        onClick={() => window.open(msg.obrazUrl, '_blank')}
                        className="p2-kontrolka flex items-center justify-center p-2 p2-cichy hover:text-[hsl(var(--foreground))]"
                        title="Otwórz pełny obraz"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Trwający proces generacji / stan */}
        {trwa && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-primary/10 border border-primary/25 p-3 text-[12px] text-primary">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[11.5px]">
                {stanGeneracji.faza === 'planuje' && 'Asystent analizuje scenę i mapę miejsc...'}
                {stanGeneracji.faza === 'trwa' && 'Runware generuje obraz z zachowaniem skali...'}
                {stanGeneracji.faza === 'sprawdza' && 'Weryfikacja spójności kadru i oświetlenia...'}
                {stanGeneracji.faza === 'poprawia' && 'Drugi przebieg: dopasowuję światło, cień i ziarno do oryginału...'}
                {stanGeneracji.faza === 'koryguje' && `Poprawiam rozmiar i miejsce: ${stanGeneracji.powod}`}
              </p>
              <p className="text-[10px] text-primary/75 mt-0.5">
                {stanGeneracji.faza === 'trwa' && stanGeneracji.role
                  ? stanGeneracji.role
                  : 'Nie ruszam nieoznaczonych elementów sceny.'}
              </p>
            </div>
          </div>
        )}

        {/* Pytanie o role pinesek — zamiast zgadywać, jedno kliknięcie */}
        {stanGeneracji.faza === 'pyta' && (
          <div className="rounded-2xl border border-primary/25 bg-primary/10 p-2.5 text-[11.5px] text-foreground">
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
                  className="rounded-xl border border-foreground/10 bg-background/40 px-2.5 py-1.5 text-left text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.98]"
                >
                  {opcja.etykieta}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Błąd generacji */}
        {stanGeneracji.faza === 'blad' && (
          <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 p-2.5 text-[11.5px] text-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 nb-tekst-bledu" />
            <div className="flex-1">
              <span className="font-semibold block">Błąd generacji:</span>
              <span className="text-[10.5px] text-muted-foreground leading-relaxed">
                {stanGeneracji.tresc}
              </span>
            </div>
          </div>
        )}

        <div ref={refKoniecWiadomosci} />
      </div>

      {/* Kompozytor: podgląd (na żądanie), uwagi, podpowiedzi, chipy pinesek, jedno pole i jeden przycisk */}
      <div className="shrink-0 space-y-2">
        {otwartyPodglad && podgladPolecenia && (
          <div className="p2-sekcja max-h-40 overflow-y-auto p-2.5 font-mono text-[10.5px] leading-relaxed p2-cichy scrollbar-none">
            <div className="mb-1 flex items-center justify-between gap-2 font-sans">
              <span className="p2-etykieta">Prompt wysłany do modelu</span>
              <button
                type="button"
                onClick={kopiujPolecenie}
                className="flex items-center gap-1 text-[11px] font-medium hover:text-[hsl(var(--foreground))]"
              >
                {skopiowano ? <Check className="h-3 w-3 p2-akcent" /> : <Copy className="h-3 w-3" />}
                {skopiowano ? 'Skopiowano' : 'Kopiuj'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{podgladPolecenia}</pre>
          </div>
        )}

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
                title={`Wstaw jako oznaczony obiekt (pineska ${idx + 1})`}
              >
                <LebekPinezki numer={idx + 1} chroniona={p.chroniona} rozmiar={14} />
                {etykietaPineski(p, idx + 1)}
              </button>
            ))}
          </div>
        )}


        <div className="rounded-[18px] border border-foreground/[0.07] bg-[hsl(var(--background)/0.5)] p-3 shadow-[inset_0_1px_2px_0_hsl(0_0%_0%/0.25)] transition-[border-color,background-color] duration-200 focus-within:border-primary/35 focus-within:bg-[hsl(var(--background)/0.62)]">
          {pineski.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1">
              {pineski.map((p, idx) => (
                <span
                  key={p.id}
                  className="p2-kontrolka group flex items-center overflow-hidden text-[11px] font-medium p2-cichy"
                >
                  <button
                    type="button"
                    onClick={() => wstawChip(p, idx + 1)}
                    className="flex items-center gap-1 py-0.5 pl-2 pr-1 transition-colors hover:text-[hsl(var(--foreground))]"
                    title="Wstaw nazwę obiektu do polecenia"
                  >
                    <LebekPinezki numer={idx + 1} chroniona={p.chroniona} rozmiar={14} />@{etykietaPineski(p, idx + 1)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUsunPineske(p.id)}
                    className="grid h-full place-items-center px-1.5 py-1 text-muted-foreground/70 transition-colors hover:bg-[hsl(var(--destructive)/0.15)] hover:text-[hsl(var(--destructive))]"
                    title="Usuń pineskę"
                    aria-label={`Usuń pineskę ${idx + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
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
              pineski.length === 0
                ? 'Wbij pinezkę i opisz zmianę…'
                : pineski.length === 1
                  ? `Co zrobić z: ${etykietaPineski(pineski[0], 1)}?`
                  : 'np. przenieś obiekt 1 na miejsce 2'
            }
            aria-label="Polecenie"
            className="max-h-[110px] min-h-[48px] w-full resize-none bg-transparent p-1 text-[14px] leading-relaxed text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)]"
          />
          <div ref={refPasek} className="relative mt-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-0.5">
              {/* + : dodawanie zdjęć na płótno */}
              <div>
                <button
                  type="button"
                  onClick={() => setMenu(m => (m === 'plus' ? null : 'plus'))}
                  aria-haspopup="menu"
                  aria-expanded={menu === 'plus'}
                  aria-label="Dodaj zdjęcie"
                  title="Dodaj zdjęcie na płótno"
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-foreground/[0.08] hover:text-foreground',
                    menu === 'plus' ? 'bg-foreground/[0.08] text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <Plus className="h-[18px] w-[18px]" />
                </button>
                {menu === 'plus' && (
                  <div className="absolute bottom-full left-0 z-40 mb-2 w-[230px]">
                    <div role="menu" className="overflow-hidden rounded-2xl border border-foreground/20 p-1.5" style={STYL_MENU}>
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
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-foreground/90 transition-colors hover:bg-foreground/[0.06]"
                        >
                          <Ik className="h-[18px] w-[18px] text-foreground/70" />
                          {nazwa}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Model obrazu — panel „Modele” (układ jak w Lovart: tytuł + Auto, zakładki, lista) */}
              <div>
                <button
                  type="button"
                  onClick={() => { setMenu(m => (m === 'modele' ? null : 'modele')); setSzukajModelu('') }}
                  aria-haspopup="menu"
                  aria-expanded={menuModelu}
                  title="Model obrazu"
                  className={cn(
                    'ml-0.5 flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-semibold transition-colors',
                    menuModelu ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary hover:bg-primary/15',
                  )}
                >
                  <Cpu className="h-4 w-4" />
                  {modelObrazu === 'auto' ? 'Auto' : MODELE_OBRAZU.find(m => m.id === modelObrazu)?.krotko}
                  <ChevronDown className={cn('h-3 w-3 transition-transform', menuModelu && 'rotate-180')} />
                </button>
                {menuModelu && (
                  <div className="absolute bottom-full left-[-12px] z-40 mb-3 w-[calc(100%+24px)]">
                    <div role="menu" className="overflow-hidden rounded-3xl border border-foreground/20" style={STYL_MENU}>
                      <div className="flex items-center justify-between px-5 pb-3 pt-5">
                        <p className="text-[20px] font-semibold tracking-tight text-foreground">Modele</p>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[14px] text-muted-foreground">Auto</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={modelObrazu === 'auto'}
                            aria-label="Automatyczny wybór modelu"
                            title="Auto — NextByte dobiera model do zadania"
                            onClick={() => onModelObrazu(modelObrazu === 'auto' ? 'lite' : 'auto')}
                            className={cn(
                              'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors',
                              modelObrazu === 'auto' ? 'bg-primary' : 'bg-foreground/20',
                            )}
                          >
                            <span
                              className="h-5 w-5 rounded-full bg-background shadow-sm transition-transform"
                              style={{ transform: modelObrazu === 'auto' ? 'translateX(20px)' : 'translateX(0)' }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Zakładki rodzaju modeli — wideo i 3D dojdą razem z generacją wideo i 3D */}
                      <div className="mx-5 mb-3 grid grid-cols-3 rounded-2xl bg-foreground/[0.06] p-1">
                        {['Obraz', 'Wideo', '3D'].map(z => (
                          <span
                            key={z}
                            title={z === 'Obraz' ? undefined : 'Wkrótce'}
                            className={cn(
                              'rounded-xl py-2 text-center text-[14px]',
                              z === 'Obraz' ? 'bg-background font-medium text-foreground shadow-sm' : 'cursor-not-allowed text-muted-foreground/60',
                            )}
                          >
                            {z}
                          </span>
                        ))}
                      </div>

                      <label className="mx-5 mb-2 flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2 focus-within:border-primary/40">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <input
                          autoFocus
                          value={szukajModelu}
                          onChange={e => setSzukajModelu(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(null) } }}
                          placeholder="Szukaj modelu…"
                          aria-label="Szukaj modelu"
                          className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60"
                        />
                      </label>

                      <p className="px-5 pb-1 pt-1 text-[13px] text-muted-foreground">Obraz</p>
                      <div className={cn('max-h-[300px] overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', modelObrazu === 'auto' && 'opacity-45')}>
                        {modeleWidoczne.length === 0 && (
                          <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">Brak pasującego modelu</p>
                        )}
                        {modeleWidoczne.map(m => {
                          const wybrany = m.id === modelObrazu
                          return (
                            <button
                              key={m.id}
                              role="menuitemradio"
                              aria-checked={wybrany}
                              aria-disabled={!m.dostepny}
                              disabled={!m.dostepny}
                              type="button"
                              onClick={() => { if (m.dostepny) { onModelObrazu(m.id as ModelObrazu); setMenu(null); setSzukajModelu('') } }}
                              className={cn(
                                'flex w-full items-start gap-3.5 rounded-2xl px-2.5 py-3 text-left transition-colors',
                                wybrany ? 'bg-primary/10' : m.dostepny ? 'hover:bg-foreground/[0.06]' : 'opacity-55',
                              )}
                            >
                              <m.ikona className={cn('mt-0.5 h-[22px] w-[22px] shrink-0', wybrany ? 'text-primary' : 'text-foreground/80')} />
                              <span className="min-w-0 flex-1">
                                <span className={cn('block text-[16.5px] leading-tight', wybrany ? 'font-medium text-primary' : 'text-foreground')}>{m.nazwa}</span>
                                <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">{m.opis}</span>
                              </span>
                              {m.dostepny ? (
                                wybrany ? <Check className="mt-1 h-[18px] w-[18px] shrink-0 text-primary" /> : <ChevronRight className="mt-1 h-[18px] w-[18px] shrink-0 text-muted-foreground/70" />
                              ) : (
                                <span className="mt-0.5 shrink-0 rounded-lg bg-foreground/[0.07] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Wkrótce</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOtwartyPodglad(v => !v)}
                aria-pressed={otwartyPodglad}
                aria-label={otwartyPodglad ? 'Ukryj prompt' : 'Pokaż prompt'}
                title={otwartyPodglad ? 'Ukryj prompt wysyłany do modelu' : 'Pokaż prompt wysyłany do modelu'}
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-foreground/[0.08] hover:text-foreground',
                  otwartyPodglad ? 'bg-foreground/[0.08] text-foreground' : 'text-muted-foreground',
                )}
              >
                <Eye className="h-[18px] w-[18px]" />
              </button>
            </div>
            <button
              onClick={wyslij}
              disabled={trwa || !tekst.trim() || !!powodBlokady}
              className="nb-cta nb-refleks-krawedzi flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold"
            >
              {trwa ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Pracuję…
                </>
              ) : (
                <>
                  Generuj
                  <span className="font-mono text-[11px] font-medium text-foreground/60">{BYTE_ZA_OBRAZ}⟠</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ten sam tekst bywa już w uwagach powyżej — drugi raz go nie piszemy */}
        {powodBlokady && !uwagi.some(u => u.tresc === powodBlokady) && (
          <p className="text-center text-[11px] p2-cichy">{powodBlokady}</p>
        )}
      </div>
    </div>
    </div>
  )
}
