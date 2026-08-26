import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-foreground",
        // Jezyk obwodek, tak jak `nextbyte` i TileAction. Pelne czerwone
        // wypelnienie bylo jedyna plama koloru w calym systemie i wylamywalo sie
        // z reszty — ostrzezenie niesie obwodka i kolor tekstu.
        destructive:
          "border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]",
        outline:
          "border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border/70 transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted/40 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-transparent",
        // DOMYŚLNY przycisk platformy — używa go 717 plików. Zmiana tutaj zmienia
        // wygląd wszędzie, i o to chodzi.
        //
        // Język: obwódka + ~2% wypełnienia, ZERO wypełnienia kolorem. Akcent
        // niesie tekst, nie tło.
        //
        // Dlaczego `border-border` i `bg-foreground/[0.02]`, a nie biel:
        // wcześniej było `border-white/[0.10]` i `bg-white/[0.05]`. Warstwa łatek
        // `!important` dla `[data-theme="nextbyte-light"]` w index.css obsługuje
        // klasę `.border-white\/10`, ale NIE `border-white/[0.10]` — składnia z
        // nawiasami generuje inną nazwę klasy i w index.css nie ma jej wcale.
        // Efekt: na jasnym motywie 10% białej obwódki i 5% białego wypełnienia na
        // prawie białym tle były NIEWIDOCZNE — zostawał sam tekst wiszący w
        // powietrzu, w każdym z tych 717 plików.
        // `--foreground` odwraca się razem z motywem: w ciemnych daje 2% bieli
        // (czyli to samo co dotąd), w jasnych 2% czerni. Widoczne w obu.
        nextbyte: "relative border border-border text-primary hover:text-primary font-semibold rounded-xl hover:border-transparent transition-all duration-300 bg-foreground/[0.02] backdrop-blur-2xl overflow-hidden group/nextbyte",
        // Mocniejszy rejestr TEGO SAMEGO przycisku — nie osobny komponent.
        // Do wezwań na stronie wejściowej i miejsc pokazowych. Cały wygląd
        // siedzi w `.nb-glass` w index.css i liczy się od zmiennych motywu,
        // więc poświata idzie za kolorem wybranym przez użytkownika.
        glass: "nb-glass rounded-full font-semibold tracking-tight text-foreground hover:text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "nextbyte",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { isGlass } = useGlass()
    const isNextbyte = variant === "nextbyte" || (!variant && true)

    // Tylko nextbyte dostaje glass — pozostałe warianty zachowują własny styl.
    // Szkło należy do kontenerów (Card, Panel), nie do samych przycisków.
    const glassClass = isGlass && isNextbyte ? 'nb-szklo' : ''

    if (isNextbyte && !asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), glassClass)}
          ref={ref}
          {...props}
        >
          {/* Animated gradient border — zawsze lekko widoczny, pełna siła na hover */}
          <span className="absolute -inset-[1px] rounded-xl overflow-hidden opacity-20 group-hover/nextbyte:opacity-80 transition-opacity duration-500 pointer-events-none">
            <span className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,hsl(var(--primary)/0.3)_0deg,hsl(var(--primary)/0.6)_60deg,hsl(var(--primary))_120deg,hsl(var(--primary)/0.6)_180deg,hsl(var(--primary)/0.3)_240deg,hsl(var(--primary)/0.1)_300deg,hsl(var(--primary)/0.1)_360deg)] animate-spin-slow" />
            <span className="absolute inset-[1px] rounded-[10px] bg-card" />
          </span>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {children}
          </span>
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), glassClass)}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
