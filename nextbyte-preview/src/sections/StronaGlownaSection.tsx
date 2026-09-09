import { useEffect, useRef } from 'react'
import { StronaGlowna } from './strona-glowna/StronaGlowna'
import { CennikPage } from './strona-glowna/CennikPage'
import { DlaFirmPage } from './strona-glowna/DlaFirmPage'
import { HistoriaPage } from './strona-glowna/HistoriaPage'
import { Footer } from './strona-glowna/Footer'
import type { HomePage as HomePageId } from './strona-glowna/types'

export type { HomePageId }

export interface StronaGlownaSectionProps {
  /** Aktywna podstrona — sterowana z nawigacji w PreviewSection */
  page?: HomePageId
  /** Zmiana podstrony z wnętrza treści (przyciski CTA, stopka) */
  onPageChange?: (p: HomePageId) => void
}

export function StronaGlownaSection({
  page = 'home',
  onPageChange,
}: StronaGlownaSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  /** Po zmianie podstrony wracamy na górę kontenera przewijania */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const scroller = el.closest('main') ?? el.parentElement
    scroller?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const idz = (p: HomePageId) => onPageChange?.(p)

  return (
    <div ref={rootRef} className="w-full font-landing text-foreground">
      {page === 'home'     && <StronaGlowna onNavigate={idz} />}
      {page === 'cennik'   && <CennikPage   onNavigate={idz} />}
      {page === 'b2b'      && <DlaFirmPage  onNavigate={idz} />}
      {page === 'historia' && <HistoriaPage onNavigate={idz} />}

      {/* Strona główna ma własną stopkę w środku — tu domykamy podstrony. */}
      {page !== 'home' && <Footer onNavigate={idz} />}
    </div>
  )
}
