import React from 'react';
import { cn } from '@/lib/utils';
import { SlowoAkcentu } from '@/components/ui/slowo-akcentu';

/**
 * NextByte Glassmorphism panel system.
 *
 * Use these primitives inside <DialogContent>, <PopoverContent>, <SheetContent>
 * etc. to give every overlay the same look. Changing the styles here updates
 * every dialog/popover that uses these wrappers.
 *
 *   <DialogContent className={glassDialogClass}>
 *     <GlassOrbs />
 *     <GlassHeader icon={<Settings />} title="..." subtitle="..." />
 *     <GlassBody>...</GlassBody>
 *     <GlassFooter>...</GlassFooter>
 *   </DialogContent>
 */

/** Drop into className of a DialogContent / PopoverContent / SheetContent. */
export const glassDialogClass =
  'p-0 overflow-hidden border border-primary/25 nb-szklo nb-szklo-plynne shadow-[0_8px_40px_rgba(105,179,240,0.18)]';

/** Decorative blur orbs — render once at the top of the panel content. */
export const GlassOrbs: React.FC<{ className?: string }> = ({ className }) => (
  <>
    <div
      className={cn(
        'pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl',
        className,
      )}
    />
    <div
      className={cn(
        'pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl',
        className,
      )}
    />
  </>
);

interface GlassHeaderProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  icon,
  title,
  subtitle,
  right,
  className,
}) => (
  <div
    className={cn(
      'relative px-5 pt-5 pb-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10',
      className,
    )}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_18px_rgba(105,179,240,0.35)] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-primary">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-start min-w-0 flex-1">
        <SlowoAkcentu wariant="odTekstu" className="block text-base font-semibold truncate max-w-full">
          {title}
        </SlowoAkcentu>
        {subtitle && (
          <span className="text-[11px] font-normal text-muted-foreground truncate max-w-full">
            {subtitle}
          </span>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </div>
);

export const GlassBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div className={cn('relative px-5 py-5 space-y-5', className)} {...rest}>
    {children}
  </div>
);

export const GlassFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div
    className={cn(
      'relative px-5 py-4 border-t border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);
