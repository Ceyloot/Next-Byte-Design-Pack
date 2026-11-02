import React from 'react';
import { Trash2, Loader2, X, CircleHelp, Check } from 'lucide-react';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Dwa charaktery jednego okna: kasowanie (czerwone, kosz) i zwykła decyzja (akcent marki, pytajnik). */
export type WariantPotwierdzenia = 'usun' | 'decyzja';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  itemName?: string;
  itemIcon?: string | React.ReactNode;
  /**
   * `decyzja` — pytanie bez kasowania („wystawić mimo luk?”, „drukować roboczy?”, „dodać drugą sekcję kwot?”).
   * Do 24.09.2026 jedyny wariant był czerwony z koszem i zdaniem „nie można cofnąć”, więc ekrany
   * silnika dokumentów wracały przy zwykłym pytaniu do `window.confirm` — jedynej natywnej kontrolki modułu.
   */
  wariant?: WariantPotwierdzenia;
  /** Treść pod opisem — dłuższe wyjaśnienie (zachowuje łamanie wierszy) albo pole do wypełnienia. */
  tresc?: React.ReactNode;
  /** Wyłącza przycisk zgody — np. gdy pole tekstowe jest jeszcze puste. */
  confirmDisabled?: boolean;
}

/**
 * Globalny popup potwierdzenia usuwania w stylu menu folderu z notatek.
 * - NextByteModal (glass header z kolorową ikoną + tytuł + podtytuł)
 * - Pasek akcji w pigułce (glass pill row): Anuluj | Usuń (czerwony)
 * - wariant `decyzja`: ta sama skorupa, akcent marki zamiast czerwieni, „Dalej” zamiast „Usuń”
 */
export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Anuluj',
  isLoading = false,
  itemName,
  itemIcon,
  wariant = 'usun',
  tresc,
  confirmDisabled = false,
}) => {
  const decyzja = wariant === 'decyzja';
  // Czerwony akcent w nagłówku — spójnie z destrukcyjnym charakterem akcji; decyzja idzie w akcencie marki.
  const headerColor = decyzja ? 'hsl(var(--primary))' : 'hsl(0 84% 60%)';
  const etykietaZgody = confirmLabel ?? (decyzja ? 'Dalej' : 'Usuń');
  const IkonaZgody = decyzja ? Check : Trash2;

  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={decyzja ? <CircleHelp className="w-6 h-6 text-foreground" /> : <Trash2 className="w-6 h-6 text-foreground" />}
      maxWidth="md"
      headerColor={headerColor}
      contentClassName="data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!slide-out-to-left-0 data-[state=closed]:!slide-out-to-top-0"
    >
      {/* Element do usunięcia (opcjonalnie) */}
      {itemName && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded-2xl border border-primary/15 nb-szklo nb-szklo-plynne">
          {itemIcon && (
            <div className="text-xl shrink-0">
              {typeof itemIcon === 'string' ? itemIcon : itemIcon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm text-foreground">{itemName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {decyzja ? 'Dotyczy' : 'Element do usunięcia'}
            </p>
          </div>
        </div>
      )}

      {/* Treść dłuższa niż podtytuł — `whitespace-pre-line`, bo pytania z silnika dokumentów niosą akapity. */}
      {tresc && (
        <div className="mb-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{tresc}</div>
      )}

      {/* Pasek akcji — glass pill row jak w menu folderu */}
      <div
        className={cn(
          'grid gap-1.5 sm:gap-2 rounded-2xl border border-primary/15 nb-szklo nb-szklo-plynne p-1.5',
          'grid-cols-2'
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
          className="w-full justify-center gap-1.5 px-2 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <X className="w-4 h-4 shrink-0" />
          <span className="text-[11px] sm:text-xs truncate">{cancelLabel}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading || confirmDisabled}
          onClick={(e) => {
            e.preventDefault();
            onConfirm();
          }}
          className={cn(
            'w-full justify-center gap-1.5 px-2 h-9 rounded-xl',
            decyzja
              ? 'text-primary hover:text-primary hover:bg-primary/10'
              : 'text-destructive hover:text-destructive hover:bg-destructive/10',
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <IkonaZgody className="w-4 h-4 shrink-0" />
          )}
          <span className="text-[11px] sm:text-xs truncate">{etykietaZgody}</span>
        </Button>
      </div>
    </NextByteModal>
  );
};
