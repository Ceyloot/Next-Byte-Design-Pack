import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

/** Jak daleko od krawędzi musi zacząć się przeciągnięcie palcem, żeby wysunąć pasek. */
const STREFA_KRAWEDZI = 24;
/** Ile trzeba przeciągnąć w głąb ekranu. */
const PROG_PRZECIAGNIECIA = 40;

/**
 * WYSUWANIE PASKA BOCZNEGO OD KRAWĘDZI (26.09.2026).
 *
 * Przeciągnięcie palcem od krawędzi, do której pasek jest przypięty, wysuwa
 * pełny pasek (`Sheet` z biblioteki). Domyślnie rysuje też szklaną zakładkę
 * przy krawędzi; `AppShell` używa wariantu `tylkoGest`, bo na telefonie
 * wrócił górny pasek (`MobileHeader`) z przyciskiem otwarcia.
 */
/** `tylkoGest` — sam gest przeciągnięcia od krawędzi, bez widocznej zakładki (gdy otwiera go już górny pasek). */
export function UchwytKrawedzi({ strona, tylkoGest = false }: { strona: 'lewo' | 'prawo'; tylkoGest?: boolean }) {
  const { openMobile, setOpenMobile } = useSidebar();
  const prawa = strona === 'prawo';

  useEffect(() => {
    let startX: number | null = null;
    let startY = 0;

    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      const odKrawedzi = prawa ? window.innerWidth - t.clientX : t.clientX;
      startX = odKrawedzi <= STREFA_KRAWEDZI ? t.clientX : null;
      startY = t.clientY;
    };
    const ruch = (e: TouchEvent) => {
      if (startX === null) return;
      const t = e.touches[0];
      const dx = prawa ? startX - t.clientX : t.clientX - startX;
      /* Tylko ruch w głąb ekranu, nie przewijanie w pionie. */
      if (dx > PROG_PRZECIAGNIECIA && dx > Math.abs(t.clientY - startY)) {
        startX = null;
        setOpenMobile(true);
      }
    };
    const koniec = () => { startX = null; };

    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', ruch, { passive: true });
    window.addEventListener('touchend', koniec);
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', ruch);
      window.removeEventListener('touchend', koniec);
    };
  }, [prawa, setOpenMobile]);

  if (openMobile || tylkoGest) return null;

  const Ikona = prawa ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label="Otwórz menu"
      data-tour="mobile-menu-trigger"
      data-tap-target="off"
      onClick={() => setOpenMobile(true)}
      className={cn(
        'fixed top-1/2 z-40 flex h-16 w-6 -translate-y-1/2 items-center justify-center border border-foreground/[0.13] text-foreground/70 nb-szklo nb-szklo-plynne transition-colors hover:text-primary active:text-primary',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16),0_8px_24px_-8px_hsl(0_0%_0%/0.25)]',
        prawa ? 'right-0 rounded-l-xl border-r-0' : 'left-0 rounded-r-xl border-l-0',
      )}
    >
      <Ikona className="h-4 w-4" />
    </button>
  );
}
