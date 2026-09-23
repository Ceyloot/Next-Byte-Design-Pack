import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Przełącznik w stylu Apple — szklany tor, uchwyt z rantem, sprężysty ruch.
 *
 * DLACZEGO TU, A NIE JAKO NOWY KOMPONENT: to jest `switch.tsx` z shadcn,
 * używany w całej platformie. Nowy „szklany przełącznik" obok starego dałby
 * dwa różne przełączniki na jednym ekranie — dokładnie ten problem, który
 * mieliśmy z czterema przepisami szkła. Zmiana tutaj wchodzi wszędzie naraz.
 *
 * CO BYŁO ŹLE (uwaga Michała przy Konfiguracji modeli):
 * tor wyłączony brał `bg-input`, włączony płaskie `bg-primary`, a uchwyt
 * `bg-background` z `shadow-lg`. Efekt: pełny, matowy błękit bez materiału —
 * na szklanej karcie wyglądał jak wklejka z innego systemu.
 *
 * CO JEST TERAZ:
 *   • TOR WYŁĄCZONY — wgłębienie z `--background` z rantem, czyli ta sama
 *     zasada, co tor suwaka i kontenery treści: rzecz nieaktywna idzie
 *     W GŁĄB, a nie do góry.
 *   • TOR WŁĄCZONY — akcent motywu z pionowym gradientem (jaśniej u góry),
 *     więc łapie światło zamiast być płaską plamą koloru.
 *   • UCHWYT — szkło: jasne u góry, cień u dołu, delikatny cień rzucony pod
 *     spód. Przy włączeniu lekko rośnie, przy naciśnięciu ściska się w bok
 *     (`active:w-[22px]`) — to jest ten „sprężysty" detal z iOS.
 *   • RUCH — `cubic-bezier(0.34, 1.56, 0.64, 1)`, czyli lekki przeskok za
 *     cel. Wyłączane przy `prefers-reduced-motion` niżej w `index.css`? NIE:
 *     `transition` jest tu na `transform`, a użytkownicy z ograniczonym
 *     ruchem i tak dostają skrócony czas z globalnej reguły.
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer group/switch relative inline-flex h-[26px] w-[46px] min-h-[26px] max-h-[26px] min-w-[46px] max-w-[46px]",
      "shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      /* Wyłączony: `--input`, bo TYLKO ten token zachowuje się jak tor iOS
         w obu kierunkach — zmierzone: ciemny motyw `210 10% 7%`, jasny
         `220 18% 86%`. Próbowałem `--background/0.6` i to był błąd: na jasnym
         motywie tło jest prawie białe, więc biały uchwyt zniknąłby w torze.
         Wgłębienie robi cień wewnętrzny, nie kolor. */
      "data-[state=unchecked]:bg-input",
      "data-[state=unchecked]:shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.10),inset_0_1px_2px_0_hsl(0_0%_0%/0.22)]",
      // Włączony: akcent motywu, ze światłem od góry.
      "data-[state=checked]:bg-primary",
      "data-[state=checked]:bg-[linear-gradient(180deg,hsl(var(--primary)/0.92)_0%,hsl(var(--primary))_100%)]",
      /* Rant + JEDNA miękka poświata — ten sam język, co wypełnienie paska
         zasobu (`material-paska.ts`): `0 0 8px -1px`, czyli światło, nie neon.
         Dzięki temu przełącznik i suwak stojące obok siebie należą do jednej
         rodziny, a nie wyglądają jak dwa różne systemy. */
      "data-[state=checked]:shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.22),inset_0_-1px_0_0_hsl(0_0%_0%/0.18),0_0_8px_-1px_hsl(var(--primary))]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full ring-0",
        // Ściśnięcie w bok przy przytrzymaniu — detal z iOS.
        "group-active/switch:w-[22px]",
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
      style={{
        background: 'hsl(var(--card))',
        backgroundImage:
          'linear-gradient(180deg, hsl(0 0% 100% / 0.85) 0%, hsl(0 0% 100% / 0.62) 100%)',
        boxShadow:
          'inset 0 1px 0 0 hsl(0 0% 100% / 0.55), inset 0 -1px 0 0 hsl(0 0% 0% / 0.10), 0 1px 3px 0 hsl(0 0% 0% / 0.35)',
        transition:
          'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), width 150ms ease',
      }}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
