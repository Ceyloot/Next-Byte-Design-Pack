import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
