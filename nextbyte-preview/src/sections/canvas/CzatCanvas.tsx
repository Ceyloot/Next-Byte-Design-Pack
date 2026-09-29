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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { etykietaPineski, wytnijOkolice, type Pineska, type Warstwa, type StanGeneracji } from './typy'
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
}

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
}: Props) {
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
  const [wycinki, setWycinki] = useState<Record<string, string>>({})
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
      if (!wycinki[p.id]) {
        void wytnijOkolice(w.src, p.normalizedX, p.normalizedY, 180, 0.28).then(img => {
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
      <div className="pointer-events-auto absolute right-4 top-4 z-30">
        <button
          onClick={() => setZwiniety(false)}
          className={cn(
            'group relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5',
            'nb-szklo nb-szklo-plynne nb-szklo-canvas',
            'border border-foreground/[0.08] shadow-2xl backdrop-blur-2xl transition-all duration-200',
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

  /* ══ WARIANT ROZWINIĘTY: Elegancki Liquid Glass Panel (Styl Dashboard 2.0) ══ */
  return (
    <div className="pointer-events-none absolute right-4 top-4 bottom-4 z-30 flex flex-col w-[380px] max-w-[calc(100vw-32px)]">
      <div
        className={cn(
          'pointer-events-auto relative flex flex-col h-full w-full min-h-0',
          'rounded-2xl border border-foreground/[0.08] shadow-2xl',
          'nb-szklo nb-szklo-plynne nb-szklo-canvas overflow-hidden',
          'transition-all duration-300 ease-out animate-in slide-in-from-right-4',
        )}
        style={{
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 hsl(0 0% 100% / 0.16)',
        }}
      >
        {/* Accent hairline on top */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />

      {/* ── 1. NAGŁÓWEK CHATU ── */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-foreground/[0.06] px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.25)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-bold text-foreground">Canvas Studio AI</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="text-[9.5px] text-foreground/45 flex items-center gap-1.5">
              <span>Koszt: {BYTE_ZA_OBRAZ} Byte / generację</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Gotowy do pracy</span>
              <span>•</span>
              <span className="tabular-nums" title={`serwer wystartował ${SERWER_START} · strona załadowana ${ZALADOWANO}`}>
                v{WERSJA} · serwer {SERWER_START} · strona {ZALADOWANO}
              </span>
              {wersjaDysk && wersjaDysk !== WERSJA && (
                <span className="font-semibold text-amber-500">
                  ⚠ na dysku v{wersjaDysk} — zrestartuj serwer (npm run dev)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZwiniety(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
            title="Zminimalizuj chat"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. SEKCJA PINESEK (PIN DOCK - DO 10 PINESEK) ── */}
      <div className="relative z-10 shrink-0 border-b border-foreground/[0.06] bg-foreground/[0.02] p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
            Zaznaczone obiekty ({pineski.length}/10)
          </span>
          {pineski.length < 10 && (
            <button
              onClick={onWlaczNarzędziePineska}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Pin className="h-3 w-3" />
              Wbij pineskę (P)
            </button>
          )}
        </div>

        {pineski.length === 0 ? (
          <div className="rounded-xl border border-dashed border-foreground/15 p-2 text-center">
            <p className="text-[10.5px] text-foreground/60 font-medium">Brak wbitych pinesek</p>
            <p className="text-[9.5px] text-foreground/40 mt-0.5">
              Wybierz pineskę z lewego paska (lub trzymaj Ctrl i kliknij obiekt), aby wskazać cel. Możesz dodać do 10 pinesek!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-none">
            {pineski.map((p, idx) => {
              const wybrana = wybranaPineska === p.id
              const miniatura = wycinki[p.id]
              const warstwa = warstwy.find(w => w.id === p.layerId)

              return (
                <div
                  key={p.id}
                  onClick={() => onWybierzPineske(p.id)}
                  className={cn(
                    'group flex items-center gap-2 rounded-xl p-1.5 transition-all cursor-pointer border',
                    wybrana
                      ? 'border-primary/50 bg-primary/10 shadow-sm'
                      : 'border-foreground/[0.06] bg-card/40 hover:bg-foreground/[0.05]',
                  )}
                >
                  {/* Łebek pinezki — ten sam, co na płótnie */}
                  <LebekPinezki numer={idx + 1} chroniona={p.chroniona} rozmiar={24} />

                  {/* Thumbnail / Smart Crop */}
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-foreground/10 ring-1 ring-border/20">
                    {miniatura ? (
                      <img src={miniatura} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <Loader2 className="h-3 w-3 animate-spin text-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Editable input / label */}
                  <div className="min-w-0 flex-1">
                    <input
                      value={p.label ?? ''}
                      onChange={e => onZmienNazwePineski(p.id, e.target.value)}
                      placeholder={`obiekt ${idx + 1}`}
                      className="w-full bg-transparent text-[11.5px] font-medium text-foreground outline-none placeholder:text-foreground/35"
                    />
                    <div className="text-[9px] text-foreground/40 truncate">
                      {warstwa?.name || 'Zdjęcie'} · {Math.round(p.normalizedX * 100)}%, {Math.round(p.normalizedY * 100)}%
                    </div>
                  </div>

                  {/* Insert into prompt button */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      wstawChip(p, idx + 1)
                    }}
                    title="Wstaw do prompta"
                    className="shrink-0 rounded p-1 text-[10px] text-foreground/35 hover:bg-foreground/10 hover:text-foreground transition-colors"
                  >
                    + chip
                  </button>

                  {/* Delete pin */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onUsunPineske(p.id)
                    }}
                    title="Usuń pineskę"
                    className="shrink-0 text-foreground/25 opacity-40 hover:opacity-100 hover:[color:color-mix(in_srgb,hsl(var(--destructive))_62%,hsl(var(--foreground)))] transition-opacity p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ── 3. PRZEWIJANA HISTORIA WIADOMOŚCI & WYNIKÓW ── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 scrollbar-none">
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
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/20 border border-primary/30 px-3 py-2 text-[12px] text-foreground shadow-sm">
                <p className="leading-relaxed">{msg.tresc}</p>
                {msg.pineskiSnap && msg.pineskiSnap.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 border-t border-primary/20 pt-1">
                    {msg.pineskiSnap.map(snap => (
                      <span
                        key={snap.id}
                        className="inline-flex items-center gap-1 rounded bg-card/70 px-1.5 py-0.5 text-[9.5px] font-semibold text-foreground"
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
              <div className="max-w-[90%] space-y-2 rounded-2xl rounded-tl-sm bg-card/60 border border-foreground/[0.08] p-3 text-[12px] text-foreground/85 shadow-sm">
                {msg.tresc && <p className="leading-relaxed text-[11.5px]">{msg.tresc}</p>}

                {/* Wygenerowany obraz z opcjami */}
                {msg.obrazUrl && (
                  <div className="mt-2 space-y-2 overflow-hidden rounded-xl border border-foreground/15 bg-background/50 p-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40">
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
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Layers className="h-3 w-3" />
                        Wstaw na płótno
                      </button>
                      <button
                        onClick={() => window.open(msg.obrazUrl, '_blank')}
                        className="flex items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5 p-1.5 text-foreground/70 hover:text-foreground transition-colors"
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

      {/* ── 4. KOMPOZYTOR POLECENIA (PROMPT COMPOSER) ── */}
      <div className="relative z-10 shrink-0 border-t border-foreground/[0.06] bg-foreground/[0.02] p-2.5 space-y-2">
        {/* Podgląd skompilowanego prompta dla ciekawych */}
        {otwartyPodglad && podgladPolecenia && (
          <div className="max-h-28 overflow-y-auto rounded-xl border border-foreground/15 bg-background/90 p-2 text-[10px] text-foreground/70 font-mono scrollbar-none">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-bold uppercase text-foreground/40">Kontrakt z modelem:</p>
              <button
                type="button"
                onClick={kopiujPolecenie}
                title="Kopiuj cały prompt"
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-sans text-[10px] font-semibold text-foreground/55 transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
              >
                {skopiowano ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {skopiowano ? 'Skopiowano' : 'Kopiuj'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{podgladPolecenia}</pre>
          </div>
        )}

        {/* Ostrzeżenia i walidacja */}
        {uwagi.length > 0 && (
          <div className="space-y-1">
            {uwagi.map(u => (
              <div
                key={u.id}
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] leading-snug flex items-center gap-1.5',
                  u.waga === 'blokada'
                    ? 'bg-destructive/10 nb-tekst-bledu border border-destructive/25'
                    : 'bg-amber-500/10 text-foreground border border-amber-500/35',
                )}
              >
                <Info className="h-3 w-3 shrink-0" />
                <span>{u.tresc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Smart-chip: podpowiedź pineski dla pisanego fragmentu */}
        {podpowiedzi.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-primary/25 bg-primary/[0.06] px-2 py-1.5">
            <span className="text-[9.5px] font-semibold text-primary/80 mr-0.5">
              „{fragment}…" →
            </span>
            {podpowiedzi.map(({ p, idx }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => zastosujPodpowiedz(p, idx)}
                className="flex items-center gap-1 rounded-full border border-primary/40 bg-card/70 px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-primary/20 hover:text-primary transition-all"
                title={`Wstaw jako oznaczony obiekt (pineska ${idx + 1})`}
              >
                <LebekPinezki numer={idx + 1} chroniona={p.chroniona} rozmiar={13} />
                {etykietaPineski(p, idx + 1)}
              </button>
            ))}
          </div>
        )}

        {/* Chipy pinów jako szybkie wstawki */}
        {pineski.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[9.5px] text-foreground/40 font-semibold mr-0.5">Wstaw:</span>
            {pineski.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => wstawChip(p, idx + 1)}
                className="flex items-center gap-1 rounded-full border border-foreground/[0.08] bg-card/60 px-2 py-0.5 text-[10px] font-medium text-foreground/75 hover:border-primary/40 hover:text-primary transition-all"
              >
                <LebekPinezki chroniona={p.chroniona} rozmiar={13} />
                @{etykietaPineski(p, idx + 1)}
              </button>
            ))}
          </div>
        )}

        {/* Pole tekstowe z przyciskiem generuj */}
        <div className="relative rounded-xl border border-foreground/15 bg-card/50 p-1.5 focus-within:border-primary/60 transition-colors shadow-inner">
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
                ? 'Wbij pineskę na zdjęciu, a potem opisz zmianę...'
                : pineski.length === 1
                  ? `Napisz co zrobić z obiektem ${etykietaPineski(pineski[0], 1)}...`
                  : 'Napisz polecenie (np. przenieś obiekt 1 na miejsce 2)...'
            }
            className="w-full resize-none bg-transparent px-2 py-1 text-[11.5px] text-foreground outline-none placeholder:text-foreground/35 min-h-[38px] max-h-[80px]"
          />

          <div className="flex items-center justify-between border-t border-foreground/[0.06] pt-1.5 px-1">
            <div className="flex items-center gap-1.5">
              {/* Automatycznie rozpoznana intencja przez Gemini AI */}
              <div
                className="flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary"
                title="Automatycznie rozpoznana intencja zadania"
              >
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span>{INTENCJE.find(i => i.id === intencja)?.nazwa || 'Auto'}</span>
              </div>

              <button
                type="button"
                onClick={() => setOtwartyPodglad(v => !v)}
                className="text-[10px] text-foreground/40 hover:text-foreground transition-colors"
                title="Pokaż podgląd promptu wysyłanego do Runware"
              >
                {otwartyPodglad ? 'Ukryj kontrakt' : 'Podgląd'}
              </button>

              {podgladPolecenia && (
                <button
                  type="button"
                  onClick={kopiujPolecenie}
                  className="flex items-center gap-1 text-[10px] text-foreground/40 transition-colors hover:text-foreground"
                  title="Kopiuj prompt wysłany do modelu"
                  aria-label="Kopiuj prompt"
                >
                  {skopiowano ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                  {skopiowano ? 'Skopiowano' : 'Kopiuj'}
                </button>
              )}
            </div>

            {/* Przycisk Generuj */}
            <button
              onClick={wyslij}
              disabled={trwa || !tekst.trim() || !!powodBlokady}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all shadow-sm',
                trwa || !tekst.trim() || !!powodBlokady
                  ? 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-primary/20',
              )}
            >
              {trwa ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Pracuję...</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>Generuj</span>
                  <span className="opacity-80 text-[10px]">({BYTE_ZA_OBRAZ}⟠)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {powodBlokady && (
          <p className="text-[10px] text-muted-foreground text-center">{powodBlokady}</p>
        )}
      </div>
    </div>
    </div>
  )
}

