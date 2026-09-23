import React from 'react'
import { cn } from '../lib/utils'

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PRYMITYWY PANELU 2.0 — jedyne miejsce, które dotyka powierzchni
 * ════════════════════════════════════════════════════════════════════════════
 *
 * UMOWA (dla ludzi i dla AI dobudowujących kafelki):
 *
 *   1. Żaden widget NIE pisze `bg-*`, `border-*` ani `shadow-*` na powierzchni.
 *      Wybiera POZIOM (`<Karta>`, `<Sekcja>`, `<Kontrolka>`), a kolor wynika
 *      z motywu. Widget, który wpisze własne tło, wypadnie z motywów.
 *
 *   2. Kolor znaczący bierze się z `--primary` (klasy `p2-akcent*`).
 *      Nigdy z wpisanej wartości.
 *
 *   3. Tekst drugoplanowy to `p2-cichy` / `p2-etykieta`, nie `opacity`.
 *
 * Dlaczego to jest komponent, a nie „pamiętaj, żeby dodać trzy klasy”:
 * bo o klasach się zapomina, a o komponencie nie. W panelu 1.0 dokładnie tak
 * powstały trzy różne wyglądy tej samej karty.
 */

type Element = 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'li'

interface BazaProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  className?: string
  /** Element HTML do wyrenderowania — domyślny bywa zły dla semantyki. */
  as?: Element
}

/**
 * POZIOM 1 — kafelek leżący na stronie.
 * Ma rant, promień, światło górnej krawędzi i cień rzucony.
 */
export function Karta({ as: E = 'section', className, children, klikalna, ...reszta }: BazaProps & { klikalna?: boolean }) {
  return (
    <E className={cn('p2-pow-1 p2-karta', klikalna && 'p2-klik', className)} {...reszta}>
      {children}
    </E>
  )
}

/**
 * POZIOM 2 — sekcja wewnątrz kafelka.
 * Bez cienia: cień wewnątrz karty robi z układu stos kartek.
 */
export function Sekcja({ as: E = 'div', className, children, ...reszta }: BazaProps) {
  return (
    <E className={cn('p2-pow-2 p2-sekcja', className)} {...reszta}>
      {children}
    </E>
  )
}

/**
 * POZIOM 3 — wiersz listy, przycisk wtórny, pole.
 * To jest poziom, na którym panel 1.0 dokładał wytłoczenie 3px/-3px
 * („neumorfizm”). Tutaj go nie ma i nie ma go czym włączyć.
 */
export function Kontrolka({ as: E = 'div', className, children, ...reszta }: BazaProps) {
  return (
    <E className={cn('p2-pow-3 p2-kontrolka', className)} {...reszta}>
      {children}
    </E>
  )
}

/** Nagłówek kafelka — tytuł z ikoną po lewej, dodatek po prawej. */
export function NaglowekKarty({
  ikona: Ikona,
  tytul,
  dodatek,
  className,
}: {
  ikona?: React.ComponentType<{ className?: string }>
  tytul: string
  dodatek?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Ikona && <Ikona className="h-3.5 w-3.5 shrink-0 p2-akcent" />}
        <h2 className="p2-etykieta truncate">{tytul}</h2>
      </div>
      {dodatek}
    </header>
  )
}

/**
 * Pigułka — licznik przy nagłówku, znacznik stanu.
 * `ton="akcent"` używa `--primary`; `ton="cichy"` idzie z drabiny powierzchni.
 */
export function Pigulka({
  children,
  ton = 'cichy',
  className,
}: {
  children: React.ReactNode
  ton?: 'akcent' | 'cichy'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        ton === 'akcent' ? 'p2-akcent-tlo' : 'p2-pow-3 p2-cichy',
        className,
      )}
    >
      {children}
    </span>
  )
}
