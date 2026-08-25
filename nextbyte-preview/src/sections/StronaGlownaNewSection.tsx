import React, { useEffect, useRef } from 'react'
import { HomePage } from './home-new/HomePage'
import { CennikPage } from './home-new/CennikPage'
import { DlaFirmPage } from './home-new/DlaFirmPage'
import { HistoriaPage } from './home-new/HistoriaPage'
import { Footer } from './home-new/Footer'
import type { HomePage as HomePageId } from './home-new/types'

export type { HomePageId }

export interface StronaGlownaNewSectionProps {
  /** Aktywna podstrona — sterowana z nawigacji w PreviewSection */
  page?: HomePageId
  /** Zmiana podstrony z wnętrza treści (przyciski CTA, stopka) */
  onPageChange?: (p: HomePageId) => void
}

export function StronaGlownaNewSection({
  page = 'home',
  onPageChange,
}: StronaGlownaNewSectionProps) {
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
      {page === 'home'     && <HomePage     onNavigate={idz} />}
      {page === 'cennik'   && <CennikPage   onNavigate={idz} />}
      {page === 'b2b'      && <DlaFirmPage  onNavigate={idz} />}
      {page === 'historia' && <HistoriaPage onNavigate={idz} />}

      <Footer onNavigate={idz} />
    </div>
  )
}
