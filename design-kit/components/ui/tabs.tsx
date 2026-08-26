import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"

const Tabs      = TabsPrimitive.Root
const TabsGroup = TabsPrimitive.List  // alias

/* ── Lista zakładek ──────────────────────────────────────────────── */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { isGlass } = useGlass()
  return (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-1",
      isGlass && 'nb-szklo',
      className,
    )}
    {...props}
  />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

/* ── Pojedyncza zakładka ─────────────────────────────────────────── */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5",
      "text-sm font-medium text-muted-foreground",
      "transition-all duration-150",
      // aktywna zakładka
      "data-[state=active]:bg-card data-[state=active]:text-card-foreground",
      "data-[state=active]:shadow-[0_1px_2px_0_rgb(0_0_0/0.06),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
      // hover na nieaktywnej
      "hover:text-foreground hover:bg-foreground/[0.04]",
      // focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/40",
      // disabled
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/* ── Zawartość zakładki ──────────────────────────────────────────── */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

/* ── Wariant liniowy (underline) ─────────────────────────────────── */
const TabsLine = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-end gap-0 border-b border-border",
      className,
    )}
    {...props}
  />
))
TabsLine.displayName = "TabsLine"

const TabsLineTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-4 pb-2.5 pt-1.5",
      "text-sm font-medium text-muted-foreground",
      "transition-colors duration-150",
      "data-[state=active]:border-primary data-[state=active]:text-foreground",
      "hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
))
TabsLineTrigger.displayName = "TabsLineTrigger"

export { Tabs, TabsGroup, TabsList, TabsTrigger, TabsContent, TabsLine, TabsLineTrigger }
