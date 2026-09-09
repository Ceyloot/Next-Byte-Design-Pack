import { useEffect, useRef } from 'react'
import { LogowaniePage } from './logowanie/LogowaniePage'
import type { EkranAuth } from './strona-glowna/types'

export type { EkranAuth }

export interface LogowanieSectionProps {
  /** Który ekran auth pokazujemy — sterowane z nawigacji w PreviewSection */
  ekran?: EkranAuth
}

/** Podgląd ekranów wejścia do aplikacji: logowanie, rejestracja oraz
 *  wywoływane z nich przepływy (weryfikacja e-mail, onboarding).
 *  Bez publicznej stopki — pełna stopka serwisu rozbijałaby skupienie
 *  na formularzu. */
export function LogowanieSection({ ekran = 'logowanie' }: LogowanieSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const scroller = el.closest('main') ?? el.parentElement
    scroller?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [ekran])

  /* h-full, żeby LogowaniePage wyśrodkowała się względem realnej wysokości
     kontenera podglądu — min-h-screen (100vh) nie odejmuje pasków nad nim. */
  return (
    <div ref={rootRef} className="w-full h-full font-landing text-foreground">
      <LogowaniePage key={ekran} initialTryb={ekran} />
    </div>
  )
}
