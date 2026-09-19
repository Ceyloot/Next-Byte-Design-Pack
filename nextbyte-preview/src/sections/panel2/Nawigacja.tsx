/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0 — nawigacja
   Jeden pasek, cztery krawędzie. Sam jest kafelkiem: obły, odklejony
   od brzegu, zwijany i rozwijany, a za uchwyt można go przeciągnąć
   na górę, dół, lewo albo prawo. Da się go też schować na całość —
   wraca uchwytem przy krawędzi albo z ustawień wyglądu.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Search, Activity, Bell, Diamond, User, ChevronRight, Wallet, ArrowUpCircle,
  Settings, LogOut, Check, Sparkles, Pin, Briefcase, Users, Shield, LayoutGrid,
  Zap, GripVertical, GripHorizontal, PanelLeftClose, PanelLeftOpen, DoorOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MENU, POWIADOMIENIA, type GrupaMenu } from './dane'
import { Przycisk, useZamknijNaZewnatrz } from './podstawy'

export type PozycjaNawigacji = 'lewo' | 'gora' | 'prawo' | 'dol'
export type StylNawigacji = 'panel' | 'szyna'

export const POZYCJE: { id: PozycjaNawigacji; etykieta: string }[] = [
  { id: 'gora',  etykieta: 'Góra' },
  { id: 'dol',   etykieta: 'Dół' },
  { id: 'lewo',  etykieta: 'Lewy' },
  { id: 'prawo', etykieta: 'Prawy' },
]

const IKONA_GRUPY: Record<string, React.ComponentType<{ className?: string }>> = {
  glowne: LayoutGrid, ai: Sparkles, przypiete: Pin,
  praca: Briefcase, spolecznosc: Users, zarzad: Shield,
}

const NAZWA_GRUPY: Record<string, string> = {
  glowne: 'Panel Główny', ai: 'AI', przypiete: 'Przypięte moduły',
  praca: 'Praca', spolecznosc: 'Społeczność', zarzad: 'Zarząd',
}

/* ═══ Panele doku ══════════════════════════════════════════════ */

function PanelWToku() {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[13px] font-semibold text-foreground">Nic się nie dzieje</p>
      <p className="mx-auto mt-2 max-w-[230px] text-[12px] leading-relaxed text-foreground/50">
        Gdy zaczniesz generować obraz, wideo albo puścisz zadanie w tle,
        zobaczysz tu jego postęp — nawet z innej zakładki.
      </p>
    </div>
  )
}

function PanelAktywnosc() {
  return (
    <div className="flex max-h-[320px] flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="text-[11px] font-medium text-foreground/45">Wszystko przeczytane</span>
        <Check className="h-3.5 w-3.5 text-primary/70" />
      </div>
      <div className="p2-scroll min-h-0 flex-1 overflow-y-auto">
        {POWIADOMIENIA.map((p) => (
          <button
            key={p.id}
            type="button"
            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-foreground/[0.04]"
          >
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-foreground/85">{p.tytul}</span>
              <span className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400/90">{p.status}</span>
                <span className="truncate text-[11.5px] text-foreground/55">{p.obiekt}</span>
              </span>
              <span className="mt-1 block text-[11px] text-foreground/35">{p.kiedy}</span>
            </span>
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/25" />
          </button>
        ))}
      </div>
    </div>
  )
}

function PanelSaldo({ saldo }: { saldo: number }) {
  const dni = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So']
  return (
    <div className="w-[268px] px-4 py-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-foreground/45">Saldo portfela</p>
          <p className="mt-0.5 flex items-baseline gap-1 text-2xl font-bold leading-none tabular-nums text-foreground">
            {saldo}
            <Diamond className="h-3.5 w-3.5 text-primary" />
          </p>
        </div>
        <Przycisk wariant="akcent" ikona={<Wallet />}>Doładuj</Przycisk>
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        {dni.map((d) => (
          <span key={d} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="h-px w-full bg-foreground/[0.12]" />
            <span className="text-[10px] text-foreground/40">{d}</span>
          </span>
        ))}
      </div>
      <dl className="mt-4 space-y-1.5 text-[12px]">
        <div className="flex items-center justify-between">
          <dt className="text-foreground/50">Zużyte przez 7 dni</dt>
          <dd className="flex items-center gap-1 font-semibold tabular-nums text-foreground/80">
            0 <Diamond className="h-3 w-3 text-foreground/40" />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-foreground/50">Średnio dziennie</dt>
          <dd className="flex items-center gap-1 font-semibold tabular-nums text-foreground/80">
            0 <Diamond className="h-3 w-3 text-foreground/40" />
          </dd>
        </div>
      </dl>
    </div>
  )
}

function PanelProfil({ onWyjdz }: { onWyjdz: () => void }) {
  const pozycje = [
    { id: 'konto',      etykieta: 'Konto',      ikona: User },
    { id: 'premium',    etykieta: 'Premium',    ikona: ArrowUpCircle },
    { id: 'ustawienia', etykieta: 'Ustawienia', ikona: Settings },
  ]
  return (
    <div className="w-[196px] p-1.5">
      {pozycje.map((p) => (
        <button
          key={p.id}
          type="button"
          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-foreground/75 transition-colors duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <p.ikona className="h-4 w-4 text-foreground/45" />
          <span className="flex-1 text-left">{p.etykieta}</span>
          <ChevronRight className="h-3.5 w-3.5 text-foreground/25" />
        </button>
      ))}
      <span aria-hidden className="my-1 block h-px bg-foreground/[0.07]" />
      <button
        type="button"
        onClick={onWyjdz}
        className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-destructive/85 transition-colors duration-200 hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Wyloguj się
      </button>
    </div>
  )
}

type KluczDoku = 'toki' | 'aktywnosc' | 'saldo' | 'profil'

const DOK: { id: KluczDoku; etykieta: string; ikona: React.ComponentType<{ className?: string }> }[] = [
  { id: 'toki',      etykieta: 'W toku',    ikona: Activity },
  { id: 'aktywnosc', etykieta: 'Aktywność', ikona: Bell },
  { id: 'saldo',     etykieta: 'Saldo',     ikona: Diamond },
  { id: 'profil',    etykieta: 'Profil',    ikona: User },
]

function ZawartoscDoku({ id, saldo, onWyjdz }: { id: KluczDoku; saldo: number; onWyjdz: () => void }) {
  if (id === 'toki')      return <PanelWToku />
  if (id === 'aktywnosc') return <PanelAktywnosc />
  if (id === 'saldo')     return <PanelSaldo saldo={saldo} />
  return <PanelProfil onWyjdz={onWyjdz} />
}

/* ═══ Przeciąganie do krawędzi ═════════════════════════════════ */

/**
 * Uchwyt zwraca krawędź najbliższą kursorowi. Progi 22% jak w panelu
 * 1.0 — dzięki nim ruch w stronę brzegu dokuje wcześniej, niż kursor
 * tam dojedzie, więc nie trzeba celować w samą krawędź.
 */
function useDokowanie(onPozycja: (p: PozycjaNawigacji) => void) {
  const [cel, setCel] = useState<PozycjaNawigacji | null>(null)

  const start = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    let ostatni: PozycjaNawigacji | null = null

    const ruch = (ev: PointerEvent) => {
      const { innerWidth: w, innerHeight: h } = window
      const { clientX: x, clientY: y } = ev
      let dok: PozycjaNawigacji
      if (x < w * 0.22) dok = 'lewo'
      else if (x > w * 0.78) dok = 'prawo'
      else if (y > h * 0.78) dok = 'dol'
      else if (y < h * 0.22) dok = 'gora'
      else {
        const dyst = [['lewo', x], ['prawo', w - x], ['gora', y], ['dol', h - y]] as const
        dok = dyst.reduce((a, b) => (b[1] < a[1] ? b : a))[0]
      }
      ostatni = dok
      setCel(dok)
    }

    const koniec = () => {
      window.removeEventListener('pointermove', ruch)
      window.removeEventListener('pointerup', koniec)
      if (ostatni) onPozycja(ostatni)
      setCel(null)
    }

    window.addEventListener('pointermove', ruch)
    window.addEventListener('pointerup', koniec)
  }, [onPozycja])

  return { start, cel }
}

/** Podświetlenie krawędzi, do której paskiem się celuje. */
export function PodgladDokowania({ cel }: { cel: PozycjaNawigacji | null }) {
  if (!cel) return null
  const bok = {
    lewo:  'left-0 top-0 h-full w-[76px]',
    prawo: 'right-0 top-0 h-full w-[76px]',
    gora:  'left-0 top-0 h-[76px] w-full',
    dol:   'left-0 bottom-0 h-[76px] w-full',
  }[cel]
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed z-[90] rounded-2xl border-2 border-dashed border-primary/50 bg-primary/[0.07]', bok)}
    />
  )
}

/* ═══ Elementy wspólne ═════════════════════════════════════════ */

function Uchwyt({ pionowo, onPointerDown }: { pionowo: boolean; onPointerDown: (e: React.PointerEvent) => void }) {
  const I = pionowo ? GripHorizontal : GripVertical
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      title="Złap i przeciągnij, aby przypiąć nawigację (góra / dół / lewo / prawo)"
      className="grid h-6 w-6 shrink-0 cursor-grab place-items-center rounded-lg text-foreground/35 transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing"
    >
      <I className="h-3.5 w-3.5" />
    </button>
  )
}

function PrzyciskIkony({
  ikona: I, tytul, aktywny, kropka, onClick, onPointerEnter,
}: {
  ikona: React.ComponentType<{ className?: string }>
  tytul: string
  aktywny?: boolean
  kropka?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onPointerEnter?: (e: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      title={tytul}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={cn(
        'relative grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-all duration-150',
        aktywny
          ? 'border-primary/40 bg-primary/20 text-primary shadow-sm shadow-primary/10'
          : 'border-transparent text-foreground/50 hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground',
      )}
    >
      <I className="h-3.5 w-3.5" />
      {kropka && !aktywny && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-1 ring-background" />
      )}
    </button>
  )
}

/** Wysuwana lista — grupa menu albo panel doku, zawsze ta sama forma. */
function Wysuwka({
  styl, children, onPointerEnter, onPointerLeave,
}: {
  styl: React.CSSProperties
  children: React.ReactNode
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}) {
  return (
    <div
      className="p2-rozwin fixed z-[95]"
      style={styl}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-foreground/[0.08] bg-popover/95 shadow-[0_18px_44px_-14px_hsl(var(--background))] backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}

function PozycjeGrupy({
  grupa, aktywna, onWybor,
}: { grupa: GrupaMenu; aktywna: string; onWybor: (id: string) => void }) {
  return (
    <div className="flex min-w-[196px] flex-col gap-0.5 p-2">
      <span className="px-2.5 pb-1 pt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/40">
        {NAZWA_GRUPY[grupa.id] ?? grupa.etykieta}
      </span>
      <span aria-hidden className="mb-1 w-full border-t border-foreground/[0.06]" />
      {grupa.pozycje.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onWybor(p.id)}
          className={cn(
            'flex w-full items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-[12px] font-medium transition-all duration-150',
            aktywna === p.id
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-transparent text-foreground/60 hover:border-foreground/[0.08] hover:bg-foreground/[0.06] hover:text-foreground',
          )}
        >
          <p.ikona className="h-3.5 w-3.5 shrink-0" />
          {p.etykieta}
          {p.znacznik && <p.znacznik className="ml-auto h-3 w-3 text-foreground/25" />}
        </button>
      ))}
    </div>
  )
}

/* ═══ Nawigacja ════════════════════════════════════════════════ */

export function Nawigacja({
  pozycja, onPozycja, styl, aktywna, onWybor, saldo, onWyjdz, onUstawienia,
}: {
  pozycja: PozycjaNawigacji
  onPozycja: (p: PozycjaNawigacji) => void
  styl: StylNawigacji
  aktywna: string
  onWybor: (id: string) => void
  saldo: number
  onWyjdz: () => void
  onUstawienia: () => void
}) {
  const pionowo = pozycja === 'lewo' || pozycja === 'prawo'
  /** Pełna lista ma sens tylko na boku — na górze i dole zawsze szyna. */
  const pelna = pionowo && styl === 'panel'

  const [zwiniety, setZwiniety] = useState(false)
  const [otwarta, setOtwarta] = useState<{ rodzaj: 'grupa' | 'dok'; id: string; prostokat: DOMRect } | null>(null)
  const czasomierz = useRef<number | null>(null)
  const { start, cel } = useDokowanie(onPozycja)

  const zamknij = useCallback(() => setOtwarta(null), [])
  const ref = useZamknijNaZewnatrz<HTMLElement>(otwarta !== null, zamknij)

  // Zmiana krawędzi zmienia geometrię — otwarta wysuwka wisiałaby w złym
  // miejscu, więc znika razem z przepięciem.
  useEffect(() => { setOtwarta(null) }, [pozycja, styl, zwiniety])

  const anuluj = () => { if (czasomierz.current) { window.clearTimeout(czasomierz.current); czasomierz.current = null } }
  const zaplanuj = () => { anuluj(); czasomierz.current = window.setTimeout(() => setOtwarta(null), 220) }

  const otworz = (rodzaj: 'grupa' | 'dok', id: string, el: HTMLElement) => {
    anuluj()
    setOtwarta((o) => (o?.id === id && o.rodzaj === rodzaj ? null : { rodzaj, id, prostokat: el.getBoundingClientRect() }))
  }

  /** Wysuwka wychodzi prostopadle do krawędzi, przy swoim przycisku. */
  const stylWysuwki = (): React.CSSProperties => {
    if (!otwarta) return {}
    const r = otwarta.prostokat
    const m = 8
    if (pozycja === 'lewo')  return { left: r.right + m, top: Math.min(r.top, window.innerHeight - 360) }
    if (pozycja === 'prawo') return { right: window.innerWidth - r.left + m, top: Math.min(r.top, window.innerHeight - 360) }
    if (pozycja === 'gora')  return { top: r.bottom + m, left: Math.min(r.left, window.innerWidth - 300) }
    return { bottom: window.innerHeight - r.top + m, left: Math.min(r.left, window.innerWidth - 300) }
  }

  const grupaOtwarta = otwarta?.rodzaj === 'grupa' ? MENU.find((g) => g.id === otwarta.id) : undefined
  const dokOtwarty = otwarta?.rodzaj === 'dok' ? (otwarta.id as KluczDoku) : undefined

  /* Wygląd i wyjście mieszkają na dnie listy — jak w oryginale. Na
     pasku poziomym listy nie ma, więc tam dostają swoje dwie ikony. */
  const ogon = (
    <>
      <PrzyciskIkony ikona={Settings} tytul="Wygląd panelu" onClick={onUstawienia} />
      <PrzyciskIkony ikona={DoorOpen} tytul="Wyjdź z panelu" onClick={onWyjdz} />
    </>
  )

  const przyciskiDoku = DOK.map((d) => (
    <PrzyciskIkony
      key={d.id}
      ikona={d.ikona}
      tytul={d.etykieta}
      aktywny={otwarta?.rodzaj === 'dok' && otwarta.id === d.id}
      kropka={d.id === 'aktywnosc'}
      onClick={(e) => otworz('dok', d.id, e.currentTarget)}
    />
  ))

  const przyciskiGrup = MENU.map((grupa) => {
    const I = IKONA_GRUPY[grupa.id] ?? LayoutGrid
    const zawiera = grupa.pozycje.some((p) => p.id === aktywna)
    return (
      <PrzyciskIkony
        key={grupa.id}
        ikona={I}
        tytul={NAZWA_GRUPY[grupa.id] ?? grupa.id}
        aktywny={zawiera || (otwarta?.rodzaj === 'grupa' && otwarta.id === grupa.id)}
        onPointerEnter={(e) => { if (grupa.pozycje.length > 1) otworz('grupa', grupa.id, e.currentTarget) }}
        onClick={(e) => {
          if (grupa.pozycje.length === 1) { onWybor(grupa.pozycje[0].id); setOtwarta(null) }
          else otworz('grupa', grupa.id, e.currentTarget)
        }}
      />
    )
  })

  const marka = (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-primary shadow-md shadow-primary/30">
      <Zap className="h-3.5 w-3.5 text-primary-foreground" />
    </span>
  )

  /* ── Pełna lista (bok + styl „panel") ── */
  const listaPelna = (
    <nav className="p2-scroll min-h-0 flex-1 overflow-y-auto px-2 py-2">
      {MENU.map((grupa, i) => (
        <div key={grupa.id} className={cn(i > 0 && 'mt-4')}>
          {grupa.etykieta && !zwiniety && (
            <p className="px-3 pb-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-foreground/28">
              {grupa.etykieta}
            </p>
          )}
          {grupa.etykieta && zwiniety && (
            <span aria-hidden className="mx-auto mb-2 block h-px w-6 bg-foreground/[0.09]" />
          )}
          <div className="space-y-0.5">
            {grupa.pozycje.map((p) => {
              const akt = aktywna === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onWybor(p.id)}
                  title={zwiniety ? p.etykieta : undefined}
                  aria-current={akt ? 'page' : undefined}
                  className={cn(
                    'group flex w-full items-center rounded-xl border text-[13px] transition-all duration-200',
                    'outline-none focus-visible:ring-2 focus-visible:ring-primary/45',
                    zwiniety ? 'h-9 justify-center px-0' : 'h-9 gap-2.5 pl-2 pr-2.5',
                    akt
                      ? 'border-primary/30 bg-primary/10 font-semibold text-primary shadow-sm shadow-primary/10'
                      : 'border-transparent font-medium text-foreground/55 hover:border-foreground/[0.08] hover:bg-foreground/[0.05] hover:text-foreground/90',
                  )}
                >
                  <span className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-lg transition-colors duration-200',
                    akt ? 'bg-primary/15 text-primary' : 'text-foreground/45 group-hover:text-foreground/80',
                  )}>
                    <p.ikona className="h-[15px] w-[15px]" />
                  </span>
                  {!zwiniety && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-left">{p.etykieta}</span>
                      {p.znacznik && <p.znacznik className="h-3 w-3 shrink-0 text-foreground/25" />}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Pod Zarządem — ustawienia panelu i wyjście. */}
      <span aria-hidden className="my-3 block h-px bg-foreground/[0.08]" />
      <div className="space-y-0.5 pb-1">
        {[
          { id: 'wyglad', etykieta: 'Wygląd panelu',  ikona: Settings, akcja: onUstawienia, groza: false },
          { id: 'wyjdz',  etykieta: 'Wyjdź z panelu', ikona: DoorOpen, akcja: onWyjdz,      groza: true  },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={p.akcja}
            title={zwiniety ? p.etykieta : undefined}
            className={cn(
              'group flex w-full items-center rounded-xl border border-transparent text-[13px] font-medium transition-all duration-200',
              zwiniety ? 'h-9 justify-center px-0' : 'h-9 gap-2.5 pl-2 pr-2.5',
              p.groza
                ? 'text-destructive/80 hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive'
                : 'text-foreground/55 hover:border-foreground/[0.08] hover:bg-foreground/[0.05] hover:text-foreground/90',
            )}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg">
              <p.ikona className="h-[15px] w-[15px]" />
            </span>
            {!zwiniety && <span className="min-w-0 flex-1 truncate text-left">{p.etykieta}</span>}
          </button>
        ))}
      </div>
    </nav>
  )

  /* ── Obudowa: sam pasek jest kafelkiem ── */
  const obudowa = cn(
    'flex overflow-hidden rounded-2xl border border-foreground/[0.08] backdrop-blur-md',
    // Głębia jak w systemie: schodek jasności + hairline światła u góry
    // + cień uniesienia. Płaska plama tła nie odkleiłaby paska od treści.
    'bg-card/60 bg-gradient-to-b from-foreground/[0.05] to-transparent',
    'shadow-[var(--cien-uniesiony),var(--swiatlo-gorne)]',
    pionowo ? 'h-full flex-col' : 'w-full flex-row items-center',
  )

  return (
    <>
      <aside
        ref={ref as React.RefObject<HTMLElement>}
        className={cn(
          'relative z-[60] shrink-0 transition-[width,height] duration-300',
          pionowo ? 'h-full py-3' : 'w-full px-3',
          pozycja === 'lewo'  && 'pl-3 pr-1.5',
          pozycja === 'prawo' && 'pr-3 pl-1.5',
          pozycja === 'gora'  && 'pt-3 pb-1.5',
          pozycja === 'dol'   && 'pb-3 pt-1.5',
        )}
        style={{
          width:  pionowo ? (pelna ? (zwiniety ? 76 : 256) : 68) : undefined,
          height: pionowo ? undefined : 68,
          transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div className={obudowa}>
          {/* Uchwyt + marka */}
          <div className={cn(
            'flex shrink-0 items-center gap-2',
            // Kolumna tylko na wąskiej szynie — w pełnym menu marka
            // stoi w rządku z uchwytem, jak w panelu 1.0.
            pionowo && !pelna ? 'flex-col px-2 pt-2.5' : 'px-2.5 py-2.5',
          )}>
            <Uchwyt pionowo={pionowo} onPointerDown={start} />
            {marka}
            {pelna && !zwiniety && (
              <>
                <span className="min-w-0 flex-1 truncate text-[13px] font-black uppercase tracking-[0.12em] text-foreground">
                  Nextbyte
                </span>
                <PrzyciskIkony ikona={PanelLeftClose} tytul="Zwiń pasek" onClick={() => setZwiniety(true)} />
              </>
            )}
            {pelna && zwiniety && (
              <PrzyciskIkony ikona={PanelLeftOpen} tytul="Rozwiń pasek" onClick={() => setZwiniety(false)} />
            )}
          </div>

          {pelna && (
            <div className="shrink-0 px-2 pb-1">
              {zwiniety ? (
                <PrzyciskIkony ikona={Search} tytul="Wyszukaj (⌘K)" />
              ) : (
                <label className="flex h-9 items-center gap-2.5 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] px-3 shadow-[inset_0_1px_2px_hsl(var(--background)/.45)] transition-colors duration-200 focus-within:border-primary/40">
                  <Search className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
                  <input
                    placeholder="Wyszukaj..."
                    className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-foreground/35"
                  />
                  <kbd className="shrink-0 rounded border border-foreground/[0.09] px-1 py-px font-mono text-[9.5px] text-foreground/35">⌘K</kbd>
                </label>
              )}
            </div>
          )}

          <span
            aria-hidden
            className={cn('shrink-0 bg-foreground/[0.08]', pionowo ? 'mx-3 my-2 h-px w-auto self-stretch' : 'mx-1.5 my-3 w-px self-stretch')}
          />

          {/* Pozycje */}
          {pelna ? listaPelna : (
            <div className={cn(
              'p2-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-auto p-2',
              pionowo ? 'flex-col justify-start' : 'flex-row',
            )}>
              {przyciskiGrup}
            </div>
          )}

          {/* Dok */}
          <div className={cn(
            'flex shrink-0 items-center gap-1.5 p-2',
            // Pełna lista jest szeroka — narzędzia układają się w rządek
            // i zawijają, zamiast ciągnąć się kolumną przez pół ekranu.
            pionowo
              ? cn('border-t border-foreground/[0.08]', pelna ? 'flex-row flex-wrap justify-center' : 'flex-col')
              : 'flex-row border-l border-foreground/[0.08]',
          )}>
            {przyciskiDoku}
            {!pionowo && (
              <>
                <span aria-hidden className="mx-0.5 h-6 w-px bg-foreground/[0.08]" />
                {ogon}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Wysuwki */}
      {grupaOtwarta && (
        <Wysuwka styl={stylWysuwki()} onPointerEnter={anuluj} onPointerLeave={zaplanuj}>
          <PozycjeGrupy
            grupa={grupaOtwarta}
            aktywna={aktywna}
            onWybor={(id) => { onWybor(id); setOtwarta(null) }}
          />
        </Wysuwka>
      )}
      {dokOtwarty && (
        <Wysuwka styl={stylWysuwki()}>
          <ZawartoscDoku id={dokOtwarty} saldo={saldo} onWyjdz={onWyjdz} />
        </Wysuwka>
      )}

      <PodgladDokowania cel={cel} />
    </>
  )
}

/* ═══ Uchwyt przywracający schowaną nawigację ══════════════════ */

export function UchwytPowrotu({ pozycja, onPokaz }: { pozycja: PozycjaNawigacji; onPokaz: () => void }) {
  const bok = {
    lewo:  'left-0 top-1/2 -translate-y-1/2 h-16 w-2.5 rounded-r-xl',
    prawo: 'right-0 top-1/2 -translate-y-1/2 h-16 w-2.5 rounded-l-xl',
    gora:  'top-0 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-b-xl',
    dol:   'bottom-0 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-t-xl',
  }[pozycja]
  return (
    <button
      type="button"
      onClick={onPokaz}
      title="Pokaż nawigację"
      className={cn(
        'fixed z-[80] border border-primary/25 bg-primary/20 transition-all duration-200 hover:bg-primary/40',
        bok,
      )}
    />
  )
}
