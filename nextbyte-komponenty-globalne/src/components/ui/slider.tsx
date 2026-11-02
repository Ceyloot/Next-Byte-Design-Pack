import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { wypelnieniePaska, TOR_PASKA } from "@/components/ui/material-paska"

/**
 * Suwak — ten sam materiał, co „Paski zasobu" w Przeglądzie Zarządu.
 *
 * DLACZEGO PRZEPISANY (03.08.2026, uwaga Michała o Konfiguracji modeli):
 * poprzednia wersja miała `via-blue-400` wpisane na sztywno — kolor spoza
 * palety, świecący tym samym błękitem w każdym z dziewięciu motywów,
 * niezależnie od akcentu. Do tego trzy neonowe poświaty
 * (`0_0_12px_2px`, `0_0_10px_2px`, a na najechaniu `0_0_16px_4px`),
 * przez które cztery suwaki obok siebie wyglądały jak pilot od telewizora.
 *
 * DRUGIE PODEJŚCIE (ten sam dzień): pierwsza poprawka dała wypełnieniu
 * `linear-gradient(90deg, primary/0.85, primary)` i w commicie napisałem
 * „ten sam materiał, co Paski zasobu". NIE SPRAWDZIŁEM tego przez zestawienie
 * obok siebie. Michał postawił oba na jednym ekranie i różnica była
 * natychmiastowa: pasek ma narastające krycie, refleks i poświatę, a suwak
 * miał płaską wypełniankę. Dlatego przepis mieszka teraz w
 * `material-paska.ts` i jest importowany przez OBA komponenty — nie da się
 * już „prawie" go powtórzyć.
 *
 * Zostaje tutaj tylko UCHWYT: szkło z rantem, światło u góry, cień u dołu.
 * Bez poświaty — ma się unosić, a nie świecić; poświatę niesie wypełnienie.
 *
 * ── NAZWA IDZIE NA UCHWYT, NIE NA KORZEŃ (09.09.2026) ──────────────────────
 * Zmierzone w przeglądarce na czterech suwakach kreatora planu: `aria-label`
 * podany przez wołającego lądował na `<span>` korzenia, a element z
 * `role="slider"` — czyli ten jedyny, który czytnik ekranu ogłasza i który
 * obsługuje strzałki — nie miał ŻADNEJ nazwy. W kreatorze dawało to cztery
 * bezimienne suwaki w kroku „Ile tego miesięcznie?", z których każdy zmienia
 * kwotę do zapłaty.
 *
 * Wołający nie ma jak tego obejść: Thumb jest wewnątrz tego komponentu.
 * Dlatego nazwa przechodzi na uchwyt TUTAJ, a nie łatką w każdym ekranie —
 * poprawka działa od razu na każdym suwaku platformy.
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  /* Radix NIE dziedziczy nazwy z korzenia na uchwyt — trzeba ją przełożyć. */
  const { 'aria-label': nazwa, 'aria-labelledby': nazwaZElementu, ...resztaProps } = props;

  return (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group/slider",
      className
    )}
    {...resztaProps}
  >
    <SliderPrimitive.Track
      className="relative h-2.5 w-full grow overflow-hidden rounded-full"
      style={TOR_PASKA}
    >
      <SliderPrimitive.Range
        className="absolute h-full rounded-full"
        style={wypelnieniePaska('hsl(var(--primary))')}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={nazwa}
      aria-labelledby={nazwaZElementu}
      className={cn(
        "block h-5 w-5 rounded-full border transition-transform duration-150",
        "hover:scale-110 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
      style={{
        borderColor: 'hsl(var(--foreground) / 0.14)',
        background: 'hsl(var(--card) / 0.92)',
        backgroundImage:
          'linear-gradient(180deg, hsl(var(--foreground) / 0.10) 0%, transparent 60%)',
        boxShadow:
          'inset 0 1px 0 0 hsl(0 0% 100% / 0.18), inset 0 -1px 0 0 hsl(0 0% 0% / 0.22), 0 2px 6px -2px hsl(0 0% 0% / 0.45)',
      }}
    />
  </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
