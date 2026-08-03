import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { LiquidGlass } from './liquid-glass'
import { useUIStyle } from './ui-style-context'

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
          "relative overflow-hidden border border-primary/50 bg-[#07070a]/60 text-primary font-semibold rounded-xl shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-primary hover:bg-[#07070a]/80 hover:text-primary hover:shadow-[0_0_18px_-1px_hsl(var(--primary)/0.45),0_0_0_2px_hsl(var(--primary)/0.12)] active:scale-[0.97] active:shadow-none",
        glass:
          "rounded-xl font-semibold tracking-tight text-foreground bg-white/10 border border-white/20 backdrop-blur-xl hover:text-foreground hover:border-white/40 hover:bg-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-4px_rgba(0,0,0,0.4)] active:scale-[0.98]",
        glassmorphism:
          "rounded-xl font-semibold tracking-tight text-foreground bg-white/10 border border-white/20 backdrop-blur-xl hover:text-foreground hover:border-white/40 hover:bg-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-4px_rgba(0,0,0,0.4)] active:scale-[0.98]",
        liquid:
          "rounded-xl font-semibold tracking-tight text-white bg-gradient-to-b from-white/20 via-white/5 to-white/10 border border-white/35 backdrop-blur-2xl shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_1px_rgba(0,0,0,0.2),0_12px_28px_-6px_rgba(0,0,0,0.5)] hover:border-white/60 hover:from-white/30 hover:to-white/15 active:scale-[0.98]",
        "liquid-glass":
          "rounded-xl font-semibold tracking-tight text-white bg-gradient-to-b from-white/20 via-white/5 to-white/10 border border-white/35 backdrop-blur-2xl shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_1px_rgba(0,0,0,0.2),0_12px_28px_-6px_rgba(0,0,0,0.5)] hover:border-white/60 hover:from-white/30 hover:to-white/15 active:scale-[0.98]",
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
    const Comp = asChild ? Slot : "button";
    const { styleMode } = useUIStyle();

    const isDefault = !variant || variant === 'default';
    const activeVariant = isDefault && styleMode === 'liquid' ? 'liquid-glass'
                        : isDefault && styleMode === 'glass' ? 'glassmorphism'
                        : variant;

    if (activeVariant === 'liquid' || activeVariant === 'liquid-glass') {
      return (
        <LiquidGlass inline button mode="svg" depth={10} chromaticAberration={0} className="rounded-xl shadow-xl">
          <Comp
            className={cn(buttonVariants({ variant: 'nextbyte', size, className }), 'bg-transparent border-0 text-white shadow-none')}
            ref={ref}
            {...props}
          >
            {children}
          </Comp>
        </LiquidGlass>
      );
    }

    if (activeVariant === 'glass' || activeVariant === 'glassmorphism') {
      return (
        <LiquidGlass inline button mode="native" className="rounded-xl shadow-xl">
          <Comp
            className={cn(buttonVariants({ variant: 'nextbyte', size, className }), 'bg-transparent border-0 text-white shadow-none')}
            ref={ref}
            {...props}
          >
            {children}
          </Comp>
        </LiquidGlass>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant: activeVariant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
