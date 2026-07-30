import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)] hover:bg-primary/90 hover:text-foreground hover:shadow-[0_0_22px_-2px_hsl(var(--primary)/0.5)] active:scale-[0.98]",
        destructive:
          "border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12] hover:shadow-[0_0_0_2px_hsl(var(--destructive)/0.1)] active:scale-[0.98]",
        outline:
          "border border-border/60 bg-card/20 text-foreground hover:bg-muted/40 hover:border-border/90 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "text-foreground/80 hover:bg-muted/40 hover:text-foreground active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
        gradient:
          "relative overflow-hidden bg-gradient-to-r from-primary to-primary/65 text-primary-foreground font-semibold border-0 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_-2px_hsl(var(--primary)/0.6)] hover:brightness-110 active:scale-[0.98]",
        nextbyte:
          "relative overflow-hidden border border-primary/30 bg-gradient-to-b from-primary/[0.14] to-primary/[0.04] text-primary font-semibold rounded-xl shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.30),0_1px_3px_0_rgb(0_0_0/0.06)] hover:border-primary/55 hover:from-primary/[0.22] hover:to-primary/[0.10] hover:text-primary hover:shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.40),0_0_0_2.5px_hsl(var(--primary)/0.14),0_4px_18px_-4px_hsl(var(--primary)/0.30)] active:scale-[0.98] active:shadow-none",
        glass:
          "rounded-full font-semibold tracking-tight text-foreground [background:linear-gradient(180deg,hsl(var(--foreground)/0.10)_0%,hsl(var(--foreground)/0.03)_100%)] border border-foreground/[0.14] backdrop-blur-xl hover:text-foreground hover:border-foreground/[0.26] hover:[background:linear-gradient(180deg,hsl(var(--foreground)/0.16)_0%,hsl(var(--primary)/0.10)_100%)] shadow-[var(--shadow-glass)] active:scale-[0.98]",
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
