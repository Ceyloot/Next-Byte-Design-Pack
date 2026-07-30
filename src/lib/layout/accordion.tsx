import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccordionVariant = 'default' | 'bordered' | 'ghost' | 'glass';

const AccordionContext = React.createContext<{ variant: AccordionVariant }>({ variant: 'default' });

/* ── Root ────────────────────────────────────────────────── */
export interface AccordionProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {
  variant?: AccordionVariant;
}

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ variant = 'default', className, ...props }, ref) => (
  <AccordionContext.Provider value={{ variant }}>
    <AccordionPrimitive.Root
      ref={ref}
      className={cn('w-full', className)}
      {...props}
    />
  </AccordionContext.Provider>
));
Accordion.displayName = 'Accordion';

/* ── Item ─────────────────────────────────────────────────── */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        variant === 'default'  && 'border-b border-border last:border-0',
        variant === 'bordered' && 'border border-border rounded-xl mb-2 overflow-hidden last:mb-0',
        variant === 'ghost'    && 'mb-1 last:mb-0',
        variant === 'glass'    && 'nb-glass-static rounded-xl mb-2 border border-foreground/[0.10] overflow-hidden last:mb-0',
        className
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = 'AccordionItem';

/* ── Trigger ──────────────────────────────────────────────── */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { variant } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between gap-3 text-sm font-medium text-foreground transition-all outline-none',
          'hover:text-foreground/80',
          '[&[data-state=open]>svg]:rotate-180',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg',
          variant === 'default'  && 'py-4',
          variant === 'bordered' && 'px-4 py-3 hover:bg-muted/20',
          variant === 'ghost'    && 'px-3 py-2.5 rounded-lg hover:bg-muted/30',
          variant === 'glass'    && 'px-4 py-3 hover:bg-foreground/[0.04]',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

/* ── Content ──────────────────────────────────────────────── */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { variant } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn(
        'text-muted-foreground leading-relaxed',
        variant === 'default'  && 'pb-4 pt-0',
        variant === 'bordered' && 'px-4 pb-4 pt-0',
        variant === 'ghost'    && 'px-3 pb-3',
        variant === 'glass'    && 'px-4 pb-4 pt-0',
        className
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
