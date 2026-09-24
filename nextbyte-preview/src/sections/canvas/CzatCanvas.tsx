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
  Plus,
  RefreshCw,
  Info,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { etykietaPineski, wytnijOkolice, KOLORY_PINESEK, type Pineska, type Warstwa, type StanGeneracji } from './typy'
import { BYTE_ZA_OBRAZ } from './dostawca'
import { INTENCJE, type Intencja } from './tryby-edycji'
import type { Uwaga } from './kontrola-polecenia'

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
}: Props) {
  const [zwiniety, setZwiniety] = useState(false)
  const [otwartyPodglad, setOtwartyPodglad] = useState(false)
  const [wycinki, setWycinki] = useState<Record<string, string>>({})
  const [historiaWiadomosci, setHistoriaWiadomosci] = useState<WiadomoscCzatu[]>([
    {
      id: 'init-1',
      rola: 'asystent',
      tresc:
        'Cześć! Jestem asystentem edycji Canvas (Gemini 2.5 Flash-Lite & Nano-Banana). Wbij pineskę na obiekcie (P lub Ctrl+Klik) i napisz prompt. Jeśli zaznaczysz 2 pineski, możesz wykonać natychmiastowy Object Transfer (przeniesienie) lub Object Switch (zamianę miejscami) z rekonstrukcją tła (Clean Plate). Obsługuję do 10 precyzyjnych pinesek.',
      czas: 'Teraz',
    },
  ])

  const refKoniecWiadomosci = useRef<HTMLDivElement>(null)
  const refTextarea = useRef<HTMLTextAreaElement>(null)

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
            tresc: stanGeneracji.wynik.opis || 'Obraz został pomyślnie wygenerowany z zachowaniem proporcji i struktury sceny.',
            czas: 'Przed chwilą',
            obrazUrl: stanGeneracji.wynik.obrazUrl,
            nazwaWyniku: stanGeneracji.wynik.nazwa,
            opisWyniku: stanGeneracji.wynik.opis,
            intencja,
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

  // Szybkie akcje w zależności od liczby pinesek
  const ustawSzablon = (
    typ:
      | 'transfer'
      | 'switch'
      | 'zamien'
      | 'usun'
      | 'styl'
      | 'ubranie'
      | 'tekstura'
      | 'pora_dnia'
      | 'pora_roku'
      | 'efekt',
  ) => {
    if (typ === 'transfer' && pineski.length >= 2) {
      const zrodlo = etykietaPineski(pineski[0], 1)
      const cel = etykietaPineski(pineski[1], 2)
      onTekst(`Przenieś obiekt ${zrodlo} w miejsce ${cel}, odtwórz tło pod ${zrodlo} i zachowaj perspektywę`)
    } else if (typ === 'switch' && pineski.length >= 2) {
      const a = etykietaPineski(pineski[0], 1)
      const b = etykietaPineski(pineski[1], 2)
      onTekst(`Zamień miejscami ${a} i ${b}, dopasowując skale i oświetlenie`)
    } else if (typ === 'zamien' && pineski.length >= 1) {
      const a = etykietaPineski(pineski[0], 1)
      onTekst(`Zamień ${a} na `)
    } else if (typ === 'usun' && pineski.length >= 1) {
      const a = etykietaPineski(pineski[0], 1)
      onTekst(`Usuń ${a} i precyzyjnie odtwórz tło pod spodem bez zmiany reszty kadru`)
    } else if (typ === 'ubranie') {
      const a = pineski.length >= 1 ? etykietaPineski(pineski[0], 1) : 'postaci'
      onTekst(`Zmień ubranie ${a} na elegancki grafitowy garnitur, zachowując pozę, twarz i tożsamość`)
    } else if (typ === 'tekstura') {
      const a = pineski.length >= 1 ? etykietaPineski(pineski[0], 1) : 'obiektu'
      onTekst(`Zmień materiał ${a} na szczotkowane ciemne drewno dębowe z matowym wykończeniem`)
    } else if (typ === 'pora_dnia') {
      onTekst(`Zmień porę dnia na złotą godzinę: ciepłe, miękkie światło zachodzącego słońca, długie cienie i złocista poświata`)
    } else if (typ === 'pora_roku') {
      onTekst(`Zmień porę roku na zimę: pokryj teren świeżym, puszystym śniegiem, zachowaj geometrię budynków i obiektów`)
    } else if (typ === 'efekt') {
      onTekst(`Dodaj nastrojową, gęstą mgłę w tle oraz mokry asfalt z odbiciami świateł po deszczu`)
    } else if (typ === 'styl') {
      const a = pineski.length >= 1 ? etykietaPineski(pineski[0], 1) : 'sceny'
      onTekst(`Przekształć styl ${a} w malarstwo akwarelowe: miękkie przejścia tonalne i faktura papieru czerpanego`)
    }
    refTextarea.current?.focus()
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
                Gemini 2.5 Flash-Lite
              </span>
            </div>
            <div className="text-[9.5px] text-foreground/45 flex items-center gap-1.5">
              <span>Koszt: {BYTE_ZA_OBRAZ} Byte / generację</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Gotowy do pracy</span>
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
              <Plus className="h-3 w-3" />
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
              const kolor = KOLORY_PINESEK[idx % KOLORY_PINESEK.length]
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
                  {/* Pin badge number with dedicated color */}
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: kolor }}
                  >
                    {idx + 1}
                  </span>

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
                    className="shrink-0 text-foreground/25 opacity-40 hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── INTELIGENTNE AKCJE I TRYBY (Lovart Schema) ── */}
        <div className="mt-2.5 pt-2 border-t border-foreground/[0.06]">
          <span className="text-[9.5px] uppercase font-bold tracking-wider text-foreground/40 block mb-1">
            Szybkie akcje i tryby:
          </span>
          <div className="flex flex-wrap gap-1">
            {pineski.length >= 2 && (
              <>
                <button
                  onClick={() => ustawSzablon('transfer')}
                  className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-all shadow-sm"
                >
                  <ArrowRight className="h-3 w-3" />
                  Transfer (1 ➔ 2)
                </button>
                <button
                  onClick={() => ustawSzablon('switch')}
                  className="flex items-center gap-1 rounded-lg border border-purple-400/40 bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-all shadow-sm"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  Switch (1 ⇄ 2)
                </button>
              </>
            )}
            {pineski.length >= 1 && (
              <>
                <button
                  onClick={() => ustawSzablon('zamien')}
                  className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-2 py-1 text-[10px] font-medium text-foreground/75 hover:bg-foreground/[0.08] transition-all"
                >
                  Podmień
                </button>
                <button
                  onClick={() => ustawSzablon('ubranie')}
                  className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-300 hover:bg-sky-500/20 transition-all"
                >
                  Ubranie
                </button>
                <button
                  onClick={() => ustawSzablon('tekstura')}
                  className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
                >
                  Tekstura
                </button>
                <button
                  onClick={() => ustawSzablon('usun')}
                  className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-2 py-1 text-[10px] font-medium text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  Usuń obiekt
                </button>
              </>
            )}
            <button
              onClick={() => ustawSzablon('pora_dnia')}
              className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              Pora dnia
            </button>
            <button
              onClick={() => ustawSzablon('pora_roku')}
              className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              Pora roku
            </button>
            <button
              onClick={() => ustawSzablon('efekt')}
              className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-2 py-1 text-[10px] font-medium text-purple-300 hover:bg-purple-500/20 transition-all"
            >
              Efekt
            </button>
            <button
              onClick={() => ustawSzablon('styl')}
              className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-medium text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all"
            >
              Styl
            </button>
          </div>
        </div>
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
                        className="inline-flex items-center gap-1 rounded bg-primary/30 px-1.5 py-0.5 text-[9.5px] font-semibold text-primary-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
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
                <p className="leading-relaxed text-[11.5px]">{msg.tresc}</p>

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
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Zachowano strukturę
                      </span>
                    </div>

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
              </p>
              <p className="text-[10px] text-primary/75 mt-0.5">
                Nie ruszam nieoznaczonych elementów sceny.
              </p>
            </div>
          </div>
        )}

        {/* Błąd generacji */}
        {stanGeneracji.faza === 'blad' && (
          <div className="flex items-start gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11.5px] text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Błąd generacji:</span>
              <span className="text-[10.5px] text-amber-200/80 leading-relaxed">
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
            <p className="font-bold uppercase text-foreground/40 mb-1">Kontrakt z modelem:</p>
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
                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
                )}
              >
                <Info className="h-3 w-3 shrink-0" />
                <span>{u.tresc}</span>
              </div>
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
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: KOLORY_PINESEK[idx % KOLORY_PINESEK.length] }}
                />
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
            onChange={e => onTekst(e.target.value)}
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
          <p className="text-[10px] text-amber-400/90 text-center">{powodBlokady}</p>
        )}
      </div>
    </div>
    </div>
  )
}

