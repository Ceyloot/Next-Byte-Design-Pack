import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * ════════════════════════════════════════════════════════════════════════
 *  CHECKBOX — materiał NextByte zamiast gołego kwadratu
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „przebuduj każdy checkbox na platformie, bo zobacz jak na telefonie
 * to wygląda — na liquid glass kwadracik widoczny".
 *
 * Miał rację: to był `rounded-sm border border-primary` prosto z shadcn,
 * czyli ostry niebieski kwadrat wklejony w platformę, która całą resztą mówi
 * szkłem. Na ciemnym tle logowania wyglądał jak element z innej aplikacji.
 *
 * ── DLACZEGO NIE `backdrop-filter` ───────────────────────────────────────
 * Nasuwa się dać tu `nb-szklo` i skończyć. Dwa powody, żeby tego nie robić:
 *
 *   · przy 18 px nie ma czego rozmywać — rozmycie tła w takim polu daje
 *     jednolitą plamę, nie szkło,
 *   · checkbox prawie zawsze stoi WEWNĄTRZ szklanej karty, a szyba w szybie
 *     się nie sumuje: dziecko nie ma czego rozmywać poza treścią rodzica.
 *
 * Zamiast tego materiał malowany: półprzezroczyste wypełnienie, krawędź
 * o dwóch jasnościach (jaśniejsza u góry — tak wygląda światło padające na
 * szkło) i miękkie zaokrąglenie. Wygląda jak szkło i działa na każdym tle,
 * także wewnątrz innej szyby.
 *
 * ── CO JESZCZE SIĘ ZMIENIŁO ──────────────────────────────────────────────
 * 16 → 18 px: na telefonie 16 px to poniżej progu wygodnego dotknięcia,
 * a checkbox stoi zwykle przy zdaniu, w które łatwo trafić obok.
 * Ptaszek dostał grubszą kreskę (`stroke-[2.75]`) — przy tym rozmiarze
 * domyślna ginie. Doszedł stan pośredni (`indeterminate`), bo Radix go
 * obsługuje, a lista z częściowym zaznaczeniem nie miała czym go pokazać.
 *
 * Bez animacji `scale` — na szklanych powierzchniach animowany transform
 * unieważnia rozmycie rodzica. Przejście idzie po kolorze i krawędzi.
 */
/**
 * Materiał pola wyboru — JEDNO ŹRÓDŁO dla obu wariantów.
 *
 * Istnieje drugi checkbox (`animate-checkbox.tsx`, z rysowanym ptaszkiem),
 * używany w logowaniu i rejestracji. Do 27.08 miał własne klasy prosto
 * z shadcn i po przebudowie tego pliku zostawał jedynym miejscem
 * w platformie z ostrym niebieskim kwadratem — Michał zgłosił to od razu:
 * „ikona zaznaczania zgody w logowaniu i rejestracji, ten checkbox jest
 * w ogóle przebudowany".
 *
 * Wspólna stała zamyka tę drogę: zmiana materiału zmienia oba naraz,
 * a rozjazd nie ma jak wrócić.
 */
export const KLASY_POLA_WYBORU = [
  /* Sztywne wymiary ze wszystkich stron — bez tego flex potrafi ścisnąć
     pole do elipsy przy długiej etykiecie obok. */
  "peer relative h-[18px] w-[18px] min-h-[18px] min-w-[18px] max-h-[18px] max-w-[18px] shrink-0",
  "rounded-[6px] border transition-colors duration-150",
  /* Stan spoczynku: materiał, nie obrys. Krawędź jaśniejsza od wypełnienia,
     żeby pole czytało się jako wgłębienie w powierzchni. */
  "border-foreground/25 bg-foreground/[0.06]",
  "hover:border-foreground/40 hover:bg-foreground/[0.09]",
  /* Górna krawędź o ton jaśniejsza — światło pada z góry, tak jak
     na wszystkich szklanych powierzchniach platformy. */
  "shadow-[inset_0_1px_0_hsl(var(--foreground)/0.10)]",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-40",
  /* Zaznaczony: pełny akcent z poświatą dookoła. Poświata odróżnia
     „włączone" od „obramowane na niebiesko" — bez niej zaznaczenie ginie
     na ciemnym tle przy pobieżnym spojrzeniu. */
  "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  "data-[state=checked]:shadow-[0_0_0_3px_hsl(var(--primary)/0.16)]",
  "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary/25 data-[state=indeterminate]:text-primary",
].join(" ");

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(KLASY_POLA_WYBORU, className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex h-full w-full items-center justify-center text-current">
      {props.checked === "indeterminate"
        ? <Minus className="h-3 w-3" strokeWidth={3} />
        : <Check className="h-3.5 w-3.5" strokeWidth={2.75} />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
