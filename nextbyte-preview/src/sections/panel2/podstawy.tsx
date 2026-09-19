/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0 — prymitywy układu
   Styl „duch": zero kafelków, zero ramek dookoła wszystkiego.
   Sekcje rozdziela oddech i włoskowa linia, nie pudełko.
   ═══════════════════════════════════════════════════════════════ */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/* ── Animacje ─────────────────────────────────────────────────── */

/** Krzywa „miękkiego dojścia" — używana wszędzie, jeden rytm ruchu. */
export const EASE = 'cubic-bezier(.22,1,.36,1)'

export function Panel2Anim() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes p2-wejscie {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes p2-rozwin {
        from { opacity: 0; transform: translateY(6px) scale(.97); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes p2-puls {
        0%, 100% { opacity: .35; }
        50%      { opacity: 1; }
      }
      @keyframes p2-przesuw {
        from { transform: translateX(-100%); }
        to   { transform: translateX(300%); }
      }
      .p2-wejscie { animation: p2-wejscie .5s ${EASE} both; }
      .p2-rozwin  { animation: p2-rozwin .18s ${EASE} both; }
      .p2-puls    { animation: p2-puls 2.4s ease-in-out infinite; }

      /* Pasek zużycia: smuga światła przebiega raz na jakiś czas. */
      .p2-smuga::after {
        content: '';
        position: absolute; inset: 0;
        width: 34%;
        background: linear-gradient(90deg, transparent, hsl(var(--primary) / .55), transparent);
        animation: p2-przesuw 3.6s ${EASE} infinite;
      }

      /* Podkreślenie aktywnej zakładki — przesuwa się, nie przeskakuje. */
      .p2-wskaznik { transition: transform .32s ${EASE}, width .32s ${EASE}; }

      .p2-scroll { scrollbar-width: thin; scrollbar-color: hsl(var(--foreground) / .14) transparent; }
      .p2-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .p2-scroll::-webkit-scrollbar-thumb {
        background: hsl(var(--foreground) / .14);
        border-radius: 999px;
      }
      .p2-scroll::-webkit-scrollbar-track { background: transparent; }

      @media (prefers-reduced-motion: reduce) {
        .p2-wejscie, .p2-rozwin, .p2-puls { animation: none !important; }
        .p2-smuga::after { animation: none; opacity: 0; }
        .p2-wskaznik { transition: none; }
      }
    ` }} />
  )
}

/** Wejście z opóźnieniem — kolejne bloki dochodzą kaskadą. */
export function Wejscie({
  children, opoznienie = 0, className, ...reszta
}: React.HTMLAttributes<HTMLDivElement> & { opoznienie?: number }) {
  return (
    <div
      {...reszta}
      className={cn('p2-wejscie', className)}
      style={{ animationDelay: `${opoznienie}ms`, ...reszta.style }}
    >
      {children}
    </div>
  )
}

/* ── Kafelki ──────────────────────────────────────────────────── */

/**
 * Cały panel ma jeden przełącznik kształtu. Włączony — sekcje dostają
 * obudowę kafelka jak w panelu 1.0; wyłączony — zostaje sama treść na
 * wspólnym tle. Kontekst, bo blok siedzi głęboko w widgetach.
 */
const KontekstKafelkow = createContext(true)

export const KafelkiProvider = KontekstKafelkow.Provider
export const useKafelki = () => useContext(KontekstKafelkow)

/** Sekcja panelu — z obudową albo bez, zależnie od trybu. */
export function Blok({
  children, className, zawszeBezKafelka = false, wypelnienie = 'p-4',
}: {
  children: React.ReactNode
  className?: string
  /** Elementy, które mają zostać „gołe" niezależnie od trybu. */
  zawszeBezKafelka?: boolean
  wypelnienie?: string
}) {
  const kafelki = useKafelki()
  const zKafelkiem = kafelki && !zawszeBezKafelka
  return (
    <section
      className={cn(
        'transition-[background-color,border-color,padding,box-shadow] duration-300',
        zKafelkiem
          // Głębia bez cieniowanych obramowań: powierzchnia o stopień
          // jaśniejsza od tła, hairline światła u górnej krawędzi (światło
          // pada z góry) i miękki cień pod spodem.
          ? cn(
            'rounded-2xl border border-foreground/[0.07] bg-card/50',
            'bg-gradient-to-b from-foreground/[0.035] to-transparent',
            'shadow-[var(--cien-uniesiony),var(--swiatlo-gorne)]',
            wypelnienie,
          )
          : 'border border-transparent',
        className,
      )}
      style={{ transitionTimingFunction: EASE }}
    >
      {children}
    </section>
  )
}

/* ── Nagłówek sekcji ──────────────────────────────────────────── */

/**
 * Etykieta sekcji zamiast nagłówka kafelka: mikrotypografia po lewej,
 * włoskowa linia wypełniająca resztę, akcja po prawej.
 */
export function Naglowek({
  ikona, tytul, akcja, className,
}: {
  ikona?: React.ReactNode
  tytul: string
  akcja?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex items-center gap-2 shrink-0">
        {ikona && <span className="text-primary/70 [&>svg]:h-3.5 [&>svg]:w-3.5">{ikona}</span>}
        <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/55">
          {tytul}
        </span>
      </span>
      <span aria-hidden className="h-px flex-1 bg-foreground/[0.07]" />
      {akcja && <span className="shrink-0">{akcja}</span>}
    </div>
  )
}

/* ── Przyciski ────────────────────────────────────────────────── */

export function Przycisk({
  wariant = 'cichy', ikona, children, className, ...reszta
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  wariant?: 'akcent' | 'cichy' | 'tekst'
  ikona?: React.ReactNode
}) {
  return (
    <button
      type="button"
      {...reszta}
      className={cn(
        'group/btn inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold',
        'transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[.97]',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        wariant === 'akcent' && 'bg-primary/12 text-primary hover:bg-primary/20',
        wariant === 'cichy'  && 'text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground',
        wariant === 'tekst'  && 'px-0 text-foreground/55 hover:text-foreground',
        className,
      )}
    >
      {ikona && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 shrink-0">{ikona}</span>}
      {children}
    </button>
  )
}

/* ── Zamykanie po kliknięciu poza / Escape ────────────────────── */

export function useZamknijNaZewnatrz<T extends HTMLElement>(otwarte: boolean, zamknij: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!otwarte) return
    const klik = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) zamknij()
    }
    const klawisz = (e: KeyboardEvent) => { if (e.key === 'Escape') zamknij() }
    document.addEventListener('mousedown', klik)
    document.addEventListener('keydown', klawisz)
    return () => {
      document.removeEventListener('mousedown', klik)
      document.removeEventListener('keydown', klawisz)
    }
  }, [otwarte, zamknij])
  return ref
}

/* ── Przełącznik segmentowy z przesuwnym wskaźnikiem ──────────── */

export function Segmenty<T extends string>({
  pozycje, wybrane, onWybor, rozmiar = 'sm', className,
}: {
  pozycje: { id: T; etykieta: React.ReactNode; tytul?: string }[]
  wybrane: T
  onWybor: (id: T) => void
  rozmiar?: 'sm' | 'md'
  className?: string
}) {
  const kontener = useRef<HTMLDivElement>(null)
  const [ramka, setRamka] = useState<{ x: number; w: number } | null>(null)

  useEffect(() => {
    const el = kontener.current?.querySelector<HTMLElement>(`[data-seg="${wybrane}"]`)
    if (!el) return
    setRamka({ x: el.offsetLeft, w: el.offsetWidth })
  }, [wybrane, pozycje])

  return (
    <div ref={kontener} className={cn('relative flex items-center gap-0.5', className)}>
      {/* Wskaźnik jedzie pod aktywną pozycją — stąd wrażenie ciągłości. */}
      {ramka && (
        <span
          aria-hidden
          className="p2-wskaznik pointer-events-none absolute inset-y-0 rounded-lg bg-foreground/[0.07]"
          style={{ transform: `translateX(${ramka.x}px)`, width: ramka.w }}
        />
      )}
      {pozycje.map((p) => (
        <button
          key={p.id}
          type="button"
          data-seg={p.id}
          title={p.tytul}
          onClick={() => onWybor(p.id)}
          className={cn(
            'relative z-10 inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors duration-200',
            rozmiar === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs',
            wybrane === p.id ? 'text-foreground' : 'text-foreground/45 hover:text-foreground/75',
          )}
        >
          {p.etykieta}
        </button>
      ))}
    </div>
  )
}
