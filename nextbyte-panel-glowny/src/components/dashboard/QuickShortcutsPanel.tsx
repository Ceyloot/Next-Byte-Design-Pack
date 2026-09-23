import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserQuickShortcuts } from '@/hooks/useUserQuickShortcuts';
import { useUserCompanies } from '@/hooks/useUserCompanies';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';
import { ShortcutIcon } from './ShortcutIcon';
import { QuickShortcutsEditor } from './QuickShortcutsEditor';
import { KafelekPodrozy, IkonaPodrozy } from './KafelekPodrozy';

/**
 * `wariant`:
 *   • `kafelki` — sześć kafelków z grafiką (dwa rzędy po trzy),
 *   • `ikony`   — sześć ikon w wąskiej kolumnie (10.09.2026, Michał: „po prawej
 *                 daj 6 ikon szybkich akcji").
 *
 * Panel jest JEDEN, bo dane, edytor i obsługa pustych slotów są te same —
 * różni się wyłącznie tym, ile ma miejsca na ekranie.
 */
export function QuickShortcutsPanel({ wariant = 'kafelki' }: { wariant?: 'kafelki' | 'ikony' } = {}) {
  const ikonowy = wariant === 'ikony';
  const navigate = useNavigate();
  const { shortcuts } = useUserQuickShortcuts();
  const { data: companies } = useUserCompanies();
  const companyNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    (companies || []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [companies]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [initialSlot, setInitialSlot] = useState(0);

  const openEditor = (slot = 0) => {
    setInitialSlot(slot);
    setEditorOpen(true);
  };

  return (
    /*
      ── RÓWNE DNO Z KAFELKAMI CHMUR (10.09.2026) ────────────────────────────
      Michał: „wyrównać na wielkość do chmur, bo chcę zadbać o to, by równo to
      było ułożone w Panelu Głównym".

      ZMIERZONE przy 1440 px: oba bloki kończyły się na 1144 px, więc pudełka
      BYŁY równe — ale siatka ikon kończyła się na 1094 px i pod nią zostawało
      50 px pustki. Wyrównana była ramka, nie treść, a oko widzi treść.

      W wariancie ikonowym panel jest więc kolumną na pełną wysokość, a siatka
      bierze jej resztę i rozdziela na dwa równe rzędy. Ikona nie ma już własnej
      wysokości — rośnie do rzędu, więc dolna krawędź ostatniego rzędu siada
      dokładnie na dolnej krawędzi kafelka chmury, cokolwiek by się działo
      z długością opisu obok.
    */
    <div className={cn('space-y-3', ikonowy && 'flex h-full flex-col')}>
      <div className="flex h-7 items-center justify-between px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Szybka Podróż
        </h2>
        <Button
          variant="cichy"
          size="sm"
          onClick={() => openEditor(0)}
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
          Edytuj
        </Button>
      </div>

      {/* DWIE KOLUMNY, NIE SZEŚĆ. Kafelki zeszły pod „Nowości", czyli do
          węższej kolumny — sześć w rzędzie miałoby tam po 60 px i wróciłby
          problem, od którego zaczęliśmy: same ikony bez miejsca na scenę. */}
      <div className={cn(
        'grid gap-2.5',
        ikonowy ? 'min-h-0 flex-1 grid-cols-3 grid-rows-2' : 'grid-cols-2 md:grid-cols-3',
      )}>
        {shortcuts.map((slot, index) => {
          if (!slot) {
            return (
              <motion.button
                key={`empty-${index}`}
                type="button"
                onClick={() => openEditor(index)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 * index }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  klasyKafelka({ interaktywny: true }),
                  'group flex flex-col items-center justify-center border-dashed text-center',
                  ikonowy ? 'h-full min-h-[74px] gap-1.5 px-1.5 py-2' : 'h-[104px] gap-2 p-3',
                )}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-xl bg-muted/20 text-muted-foreground/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary',
                  ikonowy ? 'h-8 w-8 rounded-lg' : 'h-9 w-9',
                )}>
                  <Plus className={ikonowy ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </div>
                <span className={cn('text-muted-foreground/70', ikonowy ? 'text-[9.5px] leading-none' : 'text-[11px]')}>
                  {ikonowy ? 'Dodaj' : 'Dodaj skrót'}
                </span>
              </motion.button>
            );
          }

          /* PODPIS TYLKO DLA SKRÓTÓW FIRMOWYCH.

             Dla skrótów platformy stało tu na sztywno „Platforma" — czyli
             pod sześcioma kafelkami sześć razy to samo słowo. Podpis, który
             jest identyczny wszędzie, nie odróżnia niczego od niczego,
             a zabiera wiersz w każdym kafelku i wysokość w całej kolumnie.
             Przy skrócie firmowym niesie nazwę firmy — i wtedy zostaje,
             bo tego z tytułu nie widać. */
          const label = slot.source === 'company'
            ? (slot.company_id && companyNameById.get(slot.company_id)) || 'Panel firmowy'
            : null;

          const wspolne = {
            key: `slot-${index}-${slot.url}`,
            tytul: slot.title,
            ikona: slot.icon,
            url: slot.url,
            indeks: index,
            onClick: () => navigate(slot.url),
          };

          /* Podpis firmowy odpada w wariancie ikonowym — przy 60 px nazwa firmy
             i tak byłaby trzema literami z wielokropkiem. Zostaje w `title`. */
          return ikonowy
            ? <IkonaPodrozy {...wspolne} />
            : <KafelekPodrozy {...wspolne} podpis={label} />;
        })}
      </div>

      <QuickShortcutsEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialSlot={initialSlot}
      />
    </div>
  );
}
