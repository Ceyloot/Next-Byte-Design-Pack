import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    {/*
      ── `max-h-*` NA SCROLLAREA NIC NIE ROBIŁO (10.09.2026) ───────────────────
      Michał: „przewijanie kosza nie działa". ZMIERZONE na otwartym koszu:
      pojemnik ma 300 px wysokości, a jego treść 1511 px — czyli 1211 px listy
      było nieosiągalne, bez paska przewijania i bez reakcji na kółko.

      Przyczyna jest w tej jednej linii. Korzeń Radiksa dostaje `overflow: hidden`
      i (od wołającego) `max-height`, ale NIE wysokość. Kadr miał `h-full`, czyli
      `height: 100%` — a sto procent liczone od rodzica o wysokości `auto`
      rozwiązuje się jako `auto`. Kadr rósł więc do pełnych 1511 px zamiast stać
      się oknem 300 px, nie miał czego przewijać, a korzeń po prostu ucinał
      nadmiar.

      `max-h-[inherit]` przenosi ograniczenie z korzenia na kadr — dopiero tam
      robi ono okno, w którym jest co przewijać. Jedna linia, bo ta sama pułapka
      siedzi w TRZYDZIESTU miejscach platformy: kosz i historia notatki, listy
      w panelu firmy, taksonomia Vidomontu, historia wersji kreatora, zaproszenia,
      grafik pracy. Wszystkie ucinały listy po cichu.
    */}
    <ScrollAreaPrimitive.Viewport className="h-full max-h-[inherit] w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
