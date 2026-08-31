import React from 'react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Warstwa dostępności. Bez tego modal/drawer wypuszczają fokus poza
   siebie, a czytniki ekranu nie dostają komunikatów o zmianach stanu.
   ═══════════════════════════════════════════════════════════════════ */

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Zamyka Tab w obrębie kontenera i przywraca fokus tam, skąd przyszedł.
 * Podpiąć do modala/drawera: `const ref = useFocusTrap(open)`.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (!active || !ref.current) return
    const root = ref.current
    const previous = document.activeElement as HTMLElement | null

    const first = root.querySelectorAll<HTMLElement>(FOCUSABLE)[0]
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((n) => n.offsetParent !== null)
      if (nodes.length === 0) return

      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]

      // Zawijamy na krańcach zamiast pozwolić fokusowi wyjść na stronę.
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [active])

  return ref
}

/** True, gdy system prosi o ograniczenie ruchu — użyj do wyłączenia animacji. */
export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Treść wyłącznie dla czytników ekranu — niewidoczna, ale odczytywana. */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

/**
 * Region ogłoszeń dla czytnika. `polite` czeka na przerwę w mowie,
 * `assertive` przerywa — rezerwuj drugi dla błędów.
 */
export function LiveRegion({
  message,
  politeness = 'polite',
}: {
  message: string
  politeness?: 'polite' | 'assertive'
}) {
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}

/** Link pomijający nawigację — pierwszy w tab orderze, widoczny po fokusie. */
export function SkipLink({ href = '#main', children = 'Przejdź do treści' }: { href?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-[999]',
        'focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2',
        'focus:text-sm focus:font-semibold focus:text-primary-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
      )}
    >
      {children}
    </a>
  )
}

/** Wizualna legenda skrótów klawiszowych. */
export function GlassKbd({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-[9px] text-foreground/25">+</span>}
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md border border-foreground/12 bg-foreground/[0.05] px-1.5 font-mono text-[10px] font-semibold text-foreground/60">
            {k}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}
