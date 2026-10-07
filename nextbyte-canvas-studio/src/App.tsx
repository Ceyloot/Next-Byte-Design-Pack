import { useEffect, type CSSProperties } from 'react'
import { GlassProvider } from '@/lib/glass-context'
import { NbGlassFilters } from '@/grafiki/filtry-szkla'
import { CanvasSection } from '@/sections/CanvasSection'

/**
 * Powłoka samodzielnego Canvasa. W platformie NextByte tę rolę pełni `App.tsx` + `PreviewSection.tsx`:
 *  - Liquid Glass jest ZAWSZE włączony (klasy na <html> + filtry refrakcji SVG),
 *  - motyw (`data-theme`) ustawia sam Canvas (`motyw-canvasa.ts`: domyślnie jasny `future-theme`, przełącznik na ciemny `dark-theme`),
 *  - Canvas wypełnia cały ekran (jego korzeń to `absolute inset-0`), a odstępy od krawędzi biorą się ze zmiennych `--nb-canvas-gora/dol`.
 * Przy wdrożeniu do platformy podaj `onWyjdz` (przycisk „Wyjdź”) — bez niego przycisk się nie pokazuje.
 */
export default function App() {
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('is-glass', 'nb-glass-active', 'nb-refrakcja-chrome')
    if (!html.getAttribute('data-theme')) html.setAttribute('data-theme', 'future-theme')
  }, [])

  return (
    <GlassProvider>
      <NbGlassFilters />
      <main
        className="fixed inset-0 overflow-hidden bg-background font-sans text-foreground"
        style={{ '--nb-canvas-gora': '16px', '--nb-canvas-dol': '16px' } as CSSProperties}
      >
        <CanvasSection />
      </main>
    </GlassProvider>
  )
}
