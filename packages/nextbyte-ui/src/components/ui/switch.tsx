import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { useGlass } from "@/lib/glass-context"

/* ── Rozmiary ────────────────────────────────────────────────────── */
const TRACK = {
  sm:      "h-4 w-7",
  default: "h-5 w-9",
  lg:      "h-6 w-11",
} as const

const THUMB = {
  sm:      "h-3 w-3 data-[state=checked]:translate-x-3",
  default: "h-3.5 w-3.5 data-[state=checked]:translate-x-4",
  lg:      "h-4.5 w-4.5 data-[state=checked]:translate-x-5",
} as const

export type SwitchSize = keyof typeof TRACK

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  switchSize?: SwitchSize
}

/* ── Switch root ─────────────────────────────────────────────────── */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, switchSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass()
  return (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      "transition-colors duration-200",
      "bg-muted/60 data-[state=checked]:bg-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      TRACK[switchSize],
      isGlass && 'nb-szklo',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-foreground/90 shadow-sm",
        "data-[state=checked]:bg-primary-foreground",
        "translate-x-0 transition-transform duration-200",
        THUMB[switchSize],
      )}
    />
  </SwitchPrimitive.Root>
  )
})
Switch.displayName = SwitchPrimitive.Root.displayName

/* ── SwitchField — wygodny wrapper z labelem ─────────────────────── */
export interface SwitchFieldProps {
  label: React.ReactNode
  description?: React.ReactNode
  id?: string
  switchSize?: SwitchSize
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label, description, id, switchSize, checked, onCheckedChange, disabled, className,
}) => {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Switch
        id={fieldId}
        switchSize={switchSize}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={fieldId}
          className={cn(
            "block cursor-pointer text-sm font-medium text-foreground leading-5",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {label}
        </label>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  )
}

export { Switch }
