import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* TEKST PLAKIETKI STATUSU: token z domieszką 18 % `--foreground`.
   Zmierzone 25.09.2026 na jasnym motywie: `text-success` (152 62% 32%) na
   tincie 10 % daje 4,08:1 przy literze 10 px — poniżej 4,5. Domieszka
   pierwszego planu idzie W STRONĘ czytelności na obu motywach: na jasnym
   przyciemnia (foreground ciemny), na ciemnym rozjaśnia (foreground jasny).
   Podpowiedź `color:` jest konieczna — bez niej Tailwind bierze nawias
   za rozmiar pisma. Klasy są wypisane DOSŁOWNIE trzy razy, nie z szablonu:
   Tailwind skanuje źródła po napisach i klasy sklejonej w czasie działania
   nie wygeneruje (sprawdzone: plakietka dostawała kolor dziedziczony). */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        active:
          "bg-success/10 border-success/30 text-success shadow-lg shadow-success/20 hover:shadow-success/30 hover:border-success/50",
        inactive:
          "bg-muted/60 border-border text-muted-foreground shadow-lg shadow-foreground/5",
        bonus:
          "bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 hover:border-brand-primary/60",
        sufficient:
          "nb-szklo border-success/40 text-success shadow-lg shadow-success/20 hover:shadow-success/30 hover:border-success/50",
        /* PLAKIETKI STATUSU (25.09.2026) — wynik decyzji, nie stan konta.
           Wiersz powiadomienia miał własne <span> z `emerald-400` i `text-[9px]`,
           czyli kolor spoza tokenów i typografię spoza biblioteki. Trzy
           warianty czytane z motywu: zgoda, czekanie, odmowa — plus cichy
           dla informacji bez wyroku. Bez cienia: plakietka w wierszu listy
           ma być etykietą, nie przyciskiem. */
        sukces:
          "border-success/30 bg-success/10 text-[color:color-mix(in_oklab,hsl(var(--success))_82%,hsl(var(--foreground)))]",
        ostrzezenie:
          "border-warning/30 bg-warning/10 text-[color:color-mix(in_oklab,hsl(var(--warning))_82%,hsl(var(--foreground)))]",
        blad:
          "border-destructive/30 bg-destructive/10 text-[color:color-mix(in_oklab,hsl(var(--destructive))_82%,hsl(var(--foreground)))]",
        cichy: "border-border bg-foreground/[0.04] text-muted-foreground",
      },
      rozmiar: {
        domyslny: "",
        /* Do linii meta w wierszu listy: kapitaliki z rozstrzeleniem zamiast
           zmniejszania litery poniżej 10 px (poniżej tego czytelność siada). */
        maly: "px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.08em] leading-4",
      },
    },
    defaultVariants: {
      variant: "default",
      rozmiar: "domyslny",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, rozmiar, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, rozmiar }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
