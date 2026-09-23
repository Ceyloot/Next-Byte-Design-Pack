import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  RDZEN_STYL_1,
  RDZEN_STYL_2,
  RDZEN_CICHY,
  RDZEN_USUN,
  PROMIEN_PRZYCISKU,
} from "@/components/ui/style-przyciskow"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-foreground",
        // Jezyk obwodek, tak jak `nextbyte` i TileAction. Pelne czerwone
        // wypelnienie bylo jedyna plama koloru w calym systemie i wylamywalo sie
        // z reszty — ostrzezenie niesie obwodka i kolor tekstu.
        destructive:
          "border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]",
        // `outline` i `ghost` czerpią z tych samych rdzeni co `TileAction`
        // (04.08.2026). Wcześniej miały własne klasy — a używa ich 61 miejsc
        // w samym czacie, więc „drugorzędny przycisk" wyglądał tam inaczej niż
        // „akcja wtórna" na kafelku, mimo że znaczą to samo. Teraz oba style
        // idą z `style-przyciskow.ts`, czyli z jednego miejsca dla całej
        // platformy: zmiana rdzenia rusza przyciski i kafelki razem.
        outline: cn(RDZEN_STYL_2, "transition-all duration-200"),
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: cn(RDZEN_CICHY, "transition-all duration-200"),
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
        // `backdrop-blur-2xl` + `bg-foreground/[0.02]` → materiał platformy
        // (04.08.2026). Ten wariant stoi w 87 miejscach, więc niósł własny
        // przepis szkła szerzej niż niejeden ekran — rozmycie 40 px zamiast
        // 7.2 i wypełnienie głuche na tokeny Zarządu.
        nextbyte: "relative nb-szklo border border-border text-primary hover:text-primary font-semibold rounded-xl hover:border-transparent transition-all duration-300 overflow-hidden group/nextbyte",
        // ══ STYL 1 ══ Główne wezwanie. DOKŁADNIE JEDNO na blok.
        // Definicja w `style-przyciskow.ts`, wygląd w `.nb-glass` w index.css.
        // Promień `rounded-xl`, a nie dawne `rounded-full`: pigułka wymuszała
        // dopisywanie `rounded-xl` w miejscu użycia, żeby pasowała do kafelków.
        glass: `${RDZEN_STYL_1} ${PROMIEN_PRZYCISKU} font-semibold tracking-tight`,
        // ══ STYL 2 ══ Wszystko pozostałe. Obwódka + 2%, zero wypełnienia kolorem.
        obwodka: `border ${RDZEN_STYL_2} ${PROMIEN_PRZYCISKU} font-semibold transition-colors duration-200`,
        // Sterowanie, które ma zniknąć, dopóki go nie szukasz.
        cichy: `border ${RDZEN_CICHY} ${PROMIEN_PRZYCISKU} font-medium transition-colors duration-200`,
        // Akcja w pasku nagłówka sekcji (AkcjaNaglowka) — kremowa w motywie Vidomontu, z tokenu `primary` jak pigułka
        // nagłówka (Kajetan, 17.09.2026: „kremowe przyciski pasujące do motywu”). Inny motyw = inna barwa, bez zaszytego kremu.
        /* `przycisk-akcji`: krycia i jasność napisu biorą się ze skóry (jasny rdzeń potrzebuje mocniejszego tła
           i ciemniejszego napisu — inaczej przycisk wygląda na wyłączony). Klasy Tailwinda zostają jako zapas. */
        akcent: `przycisk-akcji border border-primary/40 bg-primary/10 text-primary ${PROMIEN_PRZYCISKU} font-semibold transition-colors duration-200`,
        // Akcja niszcząca — STYL 2 przemalowany na --destructive.
        usun: `border ${RDZEN_USUN} ${PROMIEN_PRZYCISKU} font-semibold transition-colors duration-200`,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        // Przycisk funkcyjny Panelu Klienta — ta sama wysokość i krój co akcje paska nagłówka (Kajetan, 17.09.2026).
        akcja: "h-8 px-3 gap-1.5 text-przycisk rounded-rekord",
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
    const isNextbyte = variant === "nextbyte" || (!variant && true)

    if (isNextbyte && !asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {/* Animated gradient border glow */}
          <span className="absolute -inset-[1px] rounded-xl overflow-hidden opacity-0 group-hover/nextbyte:opacity-70 transition-opacity duration-500 pointer-events-none">
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
        className={cn(buttonVariants({ variant, size, className }))}
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
