import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  container?: HTMLElement | null;
}

/**
 * Popover WEWNĄTRZ okna dialogowego — dwie poprawki zmierzone 13.09.2026 w trybie skupienia Doboru:
 *  1. `z-[250]` jak w `select.tsx`: okna stoją na z-[201], więc popover z z-50 otwierał się POD nimi
 *     (menu „…” istniało w DOM, ale nie było go widać);
 *  2. `pointer-events-auto`: modalne okno ustawia `body { pointer-events: none }`, a popover tego nie cofa,
 *     bo `react-dialog@1.1.14` i `react-popover@1.1.2` mają DWIE kopie `react-dismissable-layer` (1.1.10
 *     i 1.1.1 — `npm ls @radix-ui/react-dismissable-layer`) i nie widzą nawzajem swoich warstw. Klik trafiał
 *     w element pod popoverem. Docelowo: wyrównać wersje Radixa (decyzja właściciela), wtedy klasa jest zbędna.
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 4, container, ...props }, ref) => (
  <PopoverPrimitive.Portal container={container ?? undefined}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "pointer-events-auto z-[250] w-72 rounded-md border nb-szklo nb-szklo-plynne nb-szklo-tafla p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
