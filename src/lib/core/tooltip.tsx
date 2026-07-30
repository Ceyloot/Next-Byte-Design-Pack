import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'glass';

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: TooltipVariant;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant = 'default', sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[200] max-w-xs rounded-lg px-2.5 py-1.5 text-xs font-medium leading-tight',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1',
        'data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        variant === 'glass'
          ? 'nb-glass-static border-foreground/[0.12] text-foreground'
          : 'bg-foreground text-background border border-foreground/10 shadow-md',
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow
        className={variant === 'glass' ? 'fill-foreground/10' : 'fill-foreground'}
        width={8} height={4}
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/* ── Convenience wrapper ─────────────────────────────────── */
export interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: TooltipSide;
  variant?: TooltipVariant;
  delayDuration?: number;
}

function SimpleTooltip({ content, children, side = 'top', variant, delayDuration = 300 }: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} variant={variant}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, SimpleTooltip };
