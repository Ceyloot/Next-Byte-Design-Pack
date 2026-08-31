import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { useGlass } from "@/lib/glass-context"

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean
  formatValue?: (value: number) => string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue, formatValue, defaultValue, value, ...props }, ref) => {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState<number[]>(
    (value as number[]) ?? (defaultValue as number[]) ?? [0],
  )
  const current = (value as number[]) ?? internal

  return (
    <div className="w-full">
      <SliderPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={(v) => {
          setInternal(v)
          props.onValueChange?.(v)
        }}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted/60",
            isGlass && "nb-szklo",
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {current.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              "block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:pointer-events-none",
              "hover:scale-110 transition-transform",
            )}
          />
        ))}
      </SliderPrimitive.Root>
      {showValue && (
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatValue ? formatValue(current[0]) : current[0]}</span>
          {current.length > 1 && (
            <span>{formatValue ? formatValue(current[current.length - 1]) : current[current.length - 1]}</span>
          )}
        </div>
      )}
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
