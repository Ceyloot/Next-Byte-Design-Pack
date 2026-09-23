import React from 'react'

/**
 * NextGlassBar — pasek nawigacji z Panelu Głównego, jako gotowa powierzchnia.
 *
 * To jest ten efekt, o który chodzi: pasek rozmazuje to, co pod nim przewija
 * się w treści. Cały materiał robią trzy klasy z `styles/nextglass.css`,
 * ten plik dokłada tylko kształt i cień rzucany, skopiowane z `PillNavbar`
 * platformy (wiersz 390).
 *
 * WYMAGA:
 *  • `styles/nextglass.css` wpiętego w arkusz projektu,
 *  • `<NextGlassDefs />` gdzieś wyżej w drzewie (refrakcja — opcjonalna),
 *  • zmiennych motywu z `lib/szklo-motywu.ts` nałożonych na `<html>`.
 *
 * ŻEBY BYŁO CO ROZMAZYWAĆ, pasek musi LEŻEĆ NA treści — `sticky` albo
 * `fixed` nad przewijanym kontenerem. Szkło nad jednolitym tłem wygląda
 * jak zwykła karta i wtedy cały materiał idzie w koszt bez efektu.
 */
export function NextGlassBar({
  children,
  className = '',
  as: Element = 'nav',
}: {
  children: React.ReactNode
  className?: string
  as?: 'nav' | 'div' | 'header'
}) {
  return (
    <Element
      className={[
        'flex items-center justify-between rounded-2xl border border-border/40 px-5 py-2.5',
        'nb-szklo nb-szklo-plynne nb-szklo-tafla',
        /* Cień rzucony liczony od `--background`, więc idzie za motywem.
           Świadomie NIE przez `--nb-cien-uniesienie`: to cień kształtu paska,
           nie uniesienie materiału. */
        'shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)]',
        className,
      ].join(' ')}
    >
      {children}
    </Element>
  )
}

/**
 * Wariant przyklejony do góry — najczęstszy sposób użycia paska i jedyny,
 * w którym widać, po co to szkło.
 */
export function NextGlassBarSticky({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="sticky top-0 z-40 px-4 pt-4">
      <NextGlassBar className={`max-w-5xl mx-auto ${className}`}>{children}</NextGlassBar>
    </div>
  )
}
