import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Drobne kontrolki inspektora. Wyciągnięte z `Inspektor.tsx`, gdy wygląd
 * dostał własny panel — inaczej powstałyby dwie rozjeżdżające się kopie
 * tych samych pól.
 */

export const KLASA_INPUT =
  'w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary/50'

export function Sekcja({ tytul, akcja, children }: { tytul: string; akcja?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{tytul}</div>
        {akcja && <div className="ml-auto flex items-center gap-1">{akcja}</div>}
      </div>
      {children}
    </div>
  )
}

export function Pole({ etykieta, children }: { etykieta: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-foreground/45">{etykieta}</span>
      {children}
    </label>
  )
}

export function Liczba({
  etykieta,
  wartosc,
  onZmiana,
  krok = 1,
}: {
  etykieta: string
  wartosc: number
  onZmiana: (v: number) => void
  krok?: number
}) {
  return (
    <Pole etykieta={etykieta}>
      <input
        type="number"
        step={krok}
        value={Math.round(wartosc * 100) / 100}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (!Number.isNaN(v)) onZmiana(v)
        }}
        className={KLASA_INPUT}
      />
    </Pole>
  )
}

export function Suwak({
  etykieta,
  wartosc,
  onZmiana,
  min = 0,
  max = 1,
  krok = 0.01,
  format,
}: {
  etykieta: string
  wartosc: number
  onZmiana: (v: number) => void
  min?: number
  max?: number
  krok?: number
  /** własny podpis wartości; domyślnie procenty (zakres 0–1) */
  format?: (v: number) => string
}) {
  const podpis = format ? format(wartosc) : `${Math.round(wartosc * 100)}%`
  return (
    <Pole etykieta={`${etykieta} — ${podpis}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={krok}
        value={wartosc}
        onChange={e => onZmiana(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </Pole>
  )
}

export function Kolor({ wartosc, onZmiana }: { wartosc: string; onZmiana: (v: string) => void }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(wartosc) ? wartosc : '#000000'
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={hex}
        onChange={e => onZmiana(e.target.value)}
        className="h-6 w-8 shrink-0 cursor-pointer rounded border border-border/60 bg-transparent"
      />
      <input value={wartosc} onChange={e => onZmiana(e.target.value)} className={KLASA_INPUT} />
    </div>
  )
}

export function IkonaPrzycisk({
  children,
  onClick,
  tytul,
}: {
  children: React.ReactNode
  onClick: () => void
  tytul: string
}) {
  return (
    <button
      title={tytul}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className="opacity-0 transition-opacity hover:text-primary group-hover:opacity-60"
    >
      {children}
    </button>
  )
}

export function MalyPrzycisk({
  children,
  onClick,
  ikona,
  tytul,
}: {
  children?: React.ReactNode
  onClick: () => void
  ikona?: React.ReactNode
  tytul?: string
}) {
  return (
    <button
      title={tytul}
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-md border border-border/60 bg-background/40 px-1.5 py-1 text-[10px] font-semibold text-foreground/65 transition-colors hover:border-primary/50 hover:text-foreground"
    >
      {ikona}
      {children}
    </button>
  )
}

/**
 * Rząd przełączników — jeden aktywny. Używane wszędzie, gdzie wybór jest
 * z 2–4 opcji i podpis tekstowy byłby dłuższy niż sama ikona.
 */
export function Segment<T extends string>({
  wartosc,
  opcje,
  onZmiana,
}: {
  wartosc: T
  opcje: { klucz: T; tytul: string; ikona?: React.ReactNode; etykieta?: string }[]
  onZmiana: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-background/40 p-0.5">
      {opcje.map(o => (
        <button
          key={o.klucz}
          title={o.tytul}
          onClick={() => onZmiana(o.klucz)}
          className={cn(
            'flex h-6 flex-1 items-center justify-center gap-1 rounded text-[10px] font-semibold transition-colors',
            wartosc === o.klucz
              ? 'bg-primary/15 text-primary'
              : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground/80',
          )}
        >
          {o.ikona}
          {o.etykieta}
        </button>
      ))}
    </div>
  )
}

/**
 * Tarcza kierunku. Kąt liczony tak jak w cieniach: 0° = w dół, rośnie
 * zgodnie z ruchem wskazówek. Ciągnięcie po tarczy ustawia kąt wprost —
 * to szybsze niż wpisywanie stopni i od razu pokazuje, skąd pada światło.
 */
export function TarczaKata({
  kat,
  onZmiana,
  rozmiar = 54,
}: {
  kat: number
  onZmiana: (v: number) => void
  rozmiar?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const promien = rozmiar / 2

  const ustaw = (e: { clientX: number; clientY: number }) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    // atan2 daje kąt od osi X; przesuwamy o 90°, żeby 0° wypadło w dół
    const stopnie = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    onZmiana(Math.round(((stopnie % 360) + 360) % 360))
  }

  const rad = ((kat - 90) * Math.PI) / 180
  const wskX = promien + Math.cos(rad) * (promien - 6)
  const wskY = promien + Math.sin(rad) * (promien - 6)

  return (
    <div className="flex items-center gap-2">
      <div
        ref={ref}
        onPointerDown={e => {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          ustaw(e)
        }}
        onPointerMove={e => {
          if (e.buttons === 1) ustaw(e)
        }}
        style={{ width: rozmiar, height: rozmiar }}
        className="relative shrink-0 cursor-crosshair rounded-full border border-border/60 bg-background/60"
      >
        <svg width={rozmiar} height={rozmiar} className="absolute inset-0">
          <line
            x1={promien}
            y1={promien}
            x2={wskX}
            y2={wskY}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-primary"
            strokeLinecap="round"
          />
          <circle cx={promien} cy={promien} r={1.5} className="fill-primary" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <Liczba etykieta="Kąt °" wartosc={kat} onZmiana={v => onZmiana(((v % 360) + 360) % 360)} />
      </div>
    </div>
  )
}
