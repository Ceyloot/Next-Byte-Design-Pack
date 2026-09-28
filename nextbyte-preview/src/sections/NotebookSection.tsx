/* ═══════════════════════════════════════════════════════════════
   YOUR NOTEBOOK — makieta w podglądzie

   Po co tu jest: styl domykamy tam, gdzie widać go na 14 motywach
   naraz, a nie na ślepo w docelowym repo. Ten sam układ, który dla
   panelu 2.0 i strony głównej już się sprawdził.

   Co jest inne niż w `your-notebook`:
     • `glass/` i `ui/` NIE pojechały — komponenty biorą się z żywej
       biblioteki podglądu (`@/components/*`). Dzięki temu każda zmiana
       w bibliotece jest tu widoczna od razu, bez przeklejania.
     • `ThemeProvider` nie przejmuje <html> — motywem steruje przełącznik
       podglądu. W docelowym repo montuje się go z `przejmujMotyw`.
     • `GlassProvider` pomijamy — podgląd ma już swój, wyżej.
   ═══════════════════════════════════════════════════════════════ */

import React from 'react'
import { Panel2Anim } from '@/components/duch'
// @ts-expect-error — makieta przeniesiona z `your-notebook`, wciąż w JSX
import { NotebookPage } from '@/sections/notebook/NotebookPage'
// @ts-expect-error — j.w.
import { ToastProvider } from '@/sections/notebook/Toast'
// @ts-expect-error — j.w.
import ErrorBoundary from '@/sections/notebook/ErrorBoundary'
// @ts-expect-error — j.w.
import { ThemeProvider } from '@/sections/notebook/context/ThemeContext'

interface NotebookSectionProps {
  bezPaska?: boolean
  strona?: 'lewo' | 'prawo'
  pozycja?: 'gora' | 'dol' | 'lewo' | 'prawo'
  onUchwyt?: (e: React.PointerEvent) => void
  onMenu?: () => void
}

export function NotebookSection({ bezPaska, strona, pozycja, onUchwyt, onMenu }: NotebookSectionProps) {
  return (
    <ErrorBoundary scope="Your Notebook">
      <ThemeProvider>
        <ToastProvider>
          {/* Wstrzykuje klasy ruchu stylu „duch" (p2-wejscie, p2-scroll…). */}
          <Panel2Anim />
          <NotebookPage bezPaska={bezPaska} strona={strona} pozycja={pozycja} onUchwyt={onUchwyt} onMenu={onMenu} />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
