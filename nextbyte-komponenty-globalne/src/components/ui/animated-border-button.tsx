import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface AnimatedBorderButtonProps extends ButtonProps {
  children: React.ReactNode
}

const AnimatedBorderButton = React.forwardRef<HTMLButtonElement, AnimatedBorderButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative group/btn">
        {/* Animated gradient border - visible on hover */}
        <div className="animated-gradient-border opacity-0 group-hover/btn:opacity-70 rounded-xl">
          <div className="animated-gradient-border-glow"></div>
          <div className="animated-gradient-border-mask rounded-[14px]"></div>
        </div>
        
        <Button
          ref={ref}
          className={cn(
            "relative w-full border-transparent hover:border-transparent",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </div>
    )
  }
)
AnimatedBorderButton.displayName = "AnimatedBorderButton"

export { AnimatedBorderButton }
