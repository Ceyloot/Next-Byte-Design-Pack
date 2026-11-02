import React from 'react';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyDialogActionsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryIcon?: React.ReactNode;
  dirty?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
  dirtyMessage?: string;
  helperText?: string;
  align?: 'between' | 'end';
  className?: string;
}

export const StickyDialogActions = ({
  primaryLabel,
  secondaryLabel = 'Anuluj',
  onPrimary,
  onSecondary,
  primaryIcon,
  dirty = false,
  isSaving = false,
  disabled = false,
  dirtyMessage = 'Masz niezapisane zmiany',
  helperText,
  align = 'between',
  className,
}: StickyDialogActionsProps) => {
  const message = dirty ? dirtyMessage : helperText;

  return (
    <div className={cn('sticky bottom-0 z-30 -mx-4 sm:-mx-6 mt-6 border-t border-border/50 bg-card/80 px-4 py-3 sm:px-6', className)}>
      <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', align === 'between' ? 'sm:justify-between' : 'sm:justify-end')}>
        {message && (
          <div className={cn('flex items-center gap-2 text-xs sm:text-sm', dirty ? 'text-primary' : 'text-muted-foreground')}>
            {dirty && <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{message}</span>
          </div>
        )}
        <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
          {onSecondary && (
            <Button type="button" variant="outline" onClick={onSecondary} className="h-11 flex-1 rounded-xl border-border/60 bg-card/40 px-5 sm:flex-none">
              {secondaryLabel}
            </Button>
          )}
          {onPrimary && (
            <Button
              type="button"
              variant="nextbyte"
              onClick={onPrimary}
              disabled={disabled || isSaving}
              className="h-11 flex-1 gap-2 border-primary/60 bg-primary/10 px-5 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.45)] hover:border-primary hover:bg-primary/15 hover:shadow-[0_0_30px_-6px_hsl(var(--primary)/0.65)] sm:flex-none"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : primaryIcon || <Save className="h-4 w-4" />}
              {primaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};