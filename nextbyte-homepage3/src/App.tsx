import React, { useState, useEffect } from 'react'
import { GlassProvider } from '@/lib/glass-context'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { AppBackground } from '@/components/AppBackground'
import { HomePage3 } from '@/sections/home-new/HomePage3'
import { CennikPage } from '@/sections/home-new/CennikPage'
import { DlaFirmPage } from '@/sections/home-new/DlaFirmPage'
import { HistoriaPage } from '@/sections/home-new/HistoriaPage'
import { Footer } from '@/sections/home-new/Footer'
import type { HomePage as HomePageId } from '@/sections/home-new/types'

export function App() {
  const [currentPage, setCurrentPage] = useState<HomePageId>('home')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const renderContent = () => {
    switch (currentPage) {
      case 'cennik':
        return <CennikPage onNavigate={(p) => setCurrentPage(p)} />
      case 'b2b':
        return <DlaFirmPage onNavigate={(p) => setCurrentPage(p)} />
      case 'historia':
        return <HistoriaPage onNavigate={(p) => setCurrentPage(p)} />
      case 'home':
      default:
        return <HomePage3 onNavigate={(page) => setCurrentPage(page)} />
    }
  }

  return (
    <GlassProvider>
      {/* Filtry refrakcji */}
      <NbGlassFilters />

      {/* Tło NextByte — identyczne 1:1 */}
      <AppBackground bgKey="nextbyte" />

      <div className="relative min-h-screen text-foreground font-sans flex flex-col" style={{ zIndex: 1 }}>
        <main className="flex-1 min-w-0 flex flex-col">
          {renderContent()}
          <Footer onNavigate={(p) => setCurrentPage(p)} />
        </main>
      </div>
    </GlassProvider>
  )
}

export default App
