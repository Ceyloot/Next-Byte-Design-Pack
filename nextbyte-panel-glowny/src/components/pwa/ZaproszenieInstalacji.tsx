import React from 'react';
import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { klasyKafelka, TileAction } from '@/components/ui/tile';
import { cn } from '@/lib/utils';
import { usePwaInstalacja } from '@/hooks/usePwaInstalacja';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ZAPROSZENIE DO INSTALACJI
 * ════════════════════════════════════════════════════════════════════════
 *
 * Pokazuje się TYLKO na telefonie i tylko wtedy, gdy jest co zaproponować.
 * Na komputerze instalacja PWA istnieje, ale nikt jej tam nie chce —
 * a niechciany pasek uczy ludzi nie patrzeć w to miejsce.
 *
 * KIEDY GO WOŁAĆ (decyzja rodzica, nie tego komponentu):
 * najlepszy moment to koniec onboardingu — człowiek właśnie zobaczył, co
 * platforma potrafi, i wie, po co miałby mieć ją na ekranie. Zaproszenie
 * przy pierwszym wejściu, zanim cokolwiek zobaczył, to prośba o zaufanie
 * w kredyt.
 *
 * DWA WARIANTY, BO DWIE PLATFORMY:
 *   Android — jeden przycisk, przeglądarka pokazuje swoje okienko,
 *   iOS     — instrukcja z ikonami, bo Safari nie daje żadnego zdarzenia
 *             i instalacja jest wyłącznie ręczna.
 *
 * ANIMUJEMY WYSOKOŚĆ I KRYCIE, nie `transform` — animowany transform
 * unieważnia `backdrop-filter`, czyli zdjąłby szkło z kafelka na czas
 * całego ruchu.
 */
export const ZaproszenieInstalacji: React.FC<{ className?: string }> = ({ className }) => {
  const { mozeZainstalowac, pokazInstrukcjeIOS, zainstaluj, odrzuc } = usePwaInstalacja();
  const naTelefonie = useIsMobile();

  const widoczne = naTelefonie && (mozeZainstalowac || pokazInstrukcjeIOS);

  return (
    <AnimatePresence initial={false}>
      {widoczne && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
          className="overflow-hidden"
        >
          <div className={cn(klasyKafelka({ intencja: 'akcent', zwarty: true }), className)}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Smartphone className="h-4 w-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Miej NextByte pod ręką</p>

                {mozeZainstalowac ? (
                  <>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Ikona na ekranie, pełny obraz bez paska przeglądarki. Nic nie waży.
                    </p>
                    <TileAction rodzaj="glowna" ikona={Download} onClick={() => void zainstaluj()} className="mt-2">
                      Dodaj do ekranu
                    </TileAction>
                  </>
                ) : (
                  /* iOS — instrukcja zamiast przycisku. Ikony w tekście, bo
                     „dotknij Udostępnij" bez pokazania KTÓREJ ikony to dla
                     większości ludzi zagadka. */
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs leading-relaxed text-muted-foreground">
                    Dotknij
                    <Share className="inline h-3.5 w-3.5 text-primary" aria-label="Udostępnij" />
                    na dole ekranu, potem
                    <Plus className="inline h-3.5 w-3.5 text-primary" aria-label="Dodaj" />
                    <span className="font-medium text-foreground">Do ekranu początkowego</span>.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={odrzuc}
                aria-label="Nie teraz"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
