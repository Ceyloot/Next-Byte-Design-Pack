import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ── context ─────────────────────────────────────────────── */
type TabsVariant = 'underline' | 'pills' | 'card' | 'glass';
type TabsSize = 'sm' | 'default' | 'lg';

const TabsContext = React.createContext<{ variant: TabsVariant; size: TabsSize }>({
  variant: 'underline', size: 'default',
});

/* ── list variants ───────────────────────────────────────── */
const listVariants = cva('flex items-center', {
  variants: {
    variant: {
      underline: 'border-b border-border gap-0',
      pills:     'gap-1',
      card:      'bg-muted/40 rounded-xl p-1 gap-1',
      glass:     'nb-glass rounded-xl p-1 gap-1',
    },
  },
});

/* ── trigger variants ────────────────────────────────────── */
const triggerVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        underline:
          'border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none',
        pills:
          'rounded-lg border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary',
        card:
          'rounded-lg text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:border data-[state=active]:border-border data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.06)]',
        glass:
          'rounded-lg text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground data-[state=active]:bg-gradient-to-b data-[state=active]:from-primary/[0.20] data-[state=active]:to-primary/[0.08] data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:text-primary data-[state=active]:shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.30)]',
      },
      size: {
        sm:      'px-2.5 py-1 text-xs',
        default: 'px-3.5 py-2 text-sm',
        lg:      'px-5 py-2.5 text-base',
      },
    },
    defaultVariants: { variant: 'underline', size: 'default' },
  }
);

/* ── Tabs root ───────────────────────────────────────────── */
export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof triggerVariants> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ variant = 'underline', size = 'default', className, ...props }, ref) => (
  <TabsContext.Provider value={{ variant: variant as TabsVariant, size: size as TabsSize }}>
    <TabsPrimitive.Root ref={ref} className={cn('w-full', className)} {...props} />
  </TabsContext.Provider>
));
Tabs.displayName = 'Tabs';

/* ── TabsList ────────────────────────────────────────────── */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(listVariants({ variant }), 'overflow-x-auto scrollbar-none', className)}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

/* ── TabsTrigger ─────────────────────────────────────────── */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant, size } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(triggerVariants({ variant, size }), className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

/* ── TabsContent ─────────────────────────────────────────── */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent, triggerVariants };
