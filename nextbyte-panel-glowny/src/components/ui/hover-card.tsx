import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

/* Wspólny początek obu wariantów — warstwa i wyściółka, bez materiału i bez ani jednej klasy ruchu. */
const PODSTAWA =
  "z-50 w-64 rounded-md border p-4 text-popover-foreground shadow-md outline-none"

/**
 * MATERIAŁ SZKŁA — domyślny dla platformy.
 *
 * ⚠️ WYKLUCZA SIĘ Z RUCHEM, I TO NIE JEST NASZ WYBÓR. `index.css` gasi `animation` na każdej gałęzi
 * z `.nb-szklo` (`animation: none !important`), bo kompozytor Chromium przestaje liczyć
 * `backdrop-filter`, dopóki w gałęzi biegnie animacja — zmierzone zrzutami 07.09.2026 na pięciu
 * wariantach, w każdym tafla była przezroczysta przez pierwsze klatki. Dlatego wariant z ruchem
 * NIE dostaje tych klas: z nimi fade byłby martwą klasą w HTML-u, a nie efektem.
 */
const SZKLO = "nb-szklo nb-szklo-plynne nb-szklo-tafla"

/**
 * WEJŚCIE „pelne" — dzisiejsze zachowanie platformy: zanikanie + lekkie przybliżenie + wsunięcie
 * od strony wyzwalacza. Zostaje domyślne, żeby nic na NextByte się nie zmieniło.
 */
const RUCH_PELNY =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"

/**
 * WEJŚCIE „zanikanie" — samo fade in / fade out (Kajetan, 20.09.2026, o dymku powiadomień:
 * „te powiadomienia mają wchodzić i schodzić z ekranu przy pomocy fade in fade out”).
 *
 * ⚠️ PRZYBLIŻENIE I WSUNIĘCIE SĄ ZDJĘTE, NIE NADPISANE. Klas Tailwinda nie da się „odjąć” przez
 * `className`: `zoom-in-95` i `fade-in-0` nie są dla `tailwind-merge` konfliktem, więc obie by
 * zostały i dymek dalej by skakał. Dlatego to osobny wariant, a nie dopisek u wołającego.
 *
 * Czemu bez ruchu: dymek wiersza listy pokazuje się PO SEKUNDZIE nad rekordem, na który patrzy oko.
 * Zoom i wsuwanie przy takim opóźnieniu czyta się jak szarpnięcie tabeli — sama zmiana krycia daje
 * to samo „pojawiło się”, nie ruszając niczego, co człowiek właśnie czyta.
 */
const RUCH_ZANIKANIE =
  "bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"

export interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  /** `pelna` (domyślnie) — zanikanie z przybliżeniem i wsunięciem. `zanikanie` — samo fade. */
  ruch?: "pelna" | "zanikanie"
}

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, ruch = "pelna", ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        PODSTAWA,
        ruch === "zanikanie" ? RUCH_ZANIKANIE : cn(SZKLO, RUCH_PELNY),
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
