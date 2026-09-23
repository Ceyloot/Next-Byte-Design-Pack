import React from 'react';
import { Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { CookieCategory } from '@/types/cookies';

interface DetailsTabProps {
  categories: CookieCategory[];
  wybor: Record<string, boolean>;
  onZmiana: (wybor: Record<string, boolean>) => void;
  disabled?: boolean;
}

/**
 * Zakładka „Szczegóły": jedna lista kategorii z przełącznikiem biblioteki.
 * Stan trzyma okno (`CookieConsentPopup`), bo przyciski „Zapisz wybór" /
 * „Tylko niezbędne" stoją w jego stopce. Kategoria wymagana ma przełącznik
 * włączony i zablokowany — bez niej platforma nie działa.
 */
export const DetailsTab: React.FC<DetailsTabProps> = ({ categories, wybor, onZmiana, disabled }) => (
  <div className="flex flex-col gap-2">
    {categories.map((kategoria) => {
      const id = `cookie-${kategoria.id}`;
      const wlaczona = kategoria.is_required || !!wybor[kategoria.id];
      return (
        <label
          key={kategoria.id}
          htmlFor={id}
          className={cn(
            'flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-3.5 py-3 transition-colors',
            wlaczona ? 'border-primary/25 bg-primary/[0.05]' : 'border-border bg-foreground/[0.02] hover:bg-foreground/[0.04]',
            kategoria.is_required && 'cursor-default',
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-medium text-card-foreground">{kategoria.name}</span>
              {kategoria.is_required && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  <Lock className="h-2.5 w-2.5" />
                  Wymagane
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{kategoria.description}</span>
          </span>
          <Switch
            id={id}
            checked={wlaczona}
            disabled={kategoria.is_required || disabled}
            onCheckedChange={(v) => onZmiana({ ...wybor, [kategoria.id]: v })}
            className="mt-0.5 shrink-0"
          />
        </label>
      );
    })}
  </div>
);
