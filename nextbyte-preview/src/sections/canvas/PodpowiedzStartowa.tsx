import { useMobilny } from './mobilny'

/**
 * Pusty Canvas: jedna cicha linia zamiast karty czy przycisku — od czego zacząć.
 * Na telefonie nie ma klawiatury, więc zamiast skrótu mówi, gdzie pisać.
 */
export function PodpowiedzStartowa() {
  const mobilny = useMobilny()
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
      style={{
        paddingLeft: 'calc(var(--nb-nav-lewo, 0px) + 24px)',
        paddingRight: 'calc(var(--nb-czat-szer, 0px) + var(--nb-nav-prawo, 0px) + 24px)',
        paddingTop: 'var(--nb-nav-gora, 0px)',
        paddingBottom: 'calc(var(--nb-nav-dol, 0px) + 56px)',
      }}
    >
      <p className="text-center text-[15px] text-muted-foreground/70">
        {mobilny ? (
          'Zacznij od wpisania pomysłu poniżej albo dodaj zdjęcie.'
        ) : (
          <>
            Zacznij od wpisania pomysłu, wgraj zdjęcie (Ctrl+V) albo wciśnij{' '}
            <kbd className="mx-0.5 inline-grid h-6 min-w-6 place-items-center rounded-md border border-foreground/10 bg-foreground/[0.06] px-1.5 font-sans text-[12px] text-foreground/60">C</kbd>, aby pisać na czacie.
          </>
        )}
      </p>
    </div>
  )
}
