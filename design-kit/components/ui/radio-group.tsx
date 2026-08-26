import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"

const SIZE = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-6 w-6",
} as const

const DOT_SIZE = {
  sm: "h-1.5 w-1.5",
  default: "h-2 w-2",
  lg: "h-2.5 w-2.5",
} as const

export type RadioSize = keyof typeof SIZE

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-3", className)} {...props} />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  radioSize?: RadioSize
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, radioSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass()
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square shrink-0 rounded-full border border-border bg-input",
        "transition-colors duration-200 hover:border-border/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary",
        SIZE[radioSize],
        isGlass && "nb-szklo",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
        <Circle className={cn("fill-primary text-primary", DOT_SIZE[radioSize])} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

/* ── RadioCard — klikalny kafelek z radiem ───────────────────────── */
export interface RadioCardProps {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  id?: string
  disabled?: boolean
  className?: string
}

export const RadioCard: React.FC<RadioCardProps> = ({
  value, label, description, id, disabled, className,
}) => {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  return (
    <label
      htmlFor={fieldId}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer",
        "transition-colors duration-200 hover:border-border/70",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.06]",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <RadioGroupItem value={value} id={fieldId} disabled={disabled} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground leading-5">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </label>
  )
}

/* ── RadioField — label + description wrapper (poziomy/pionowy) ──── */
export interface RadioFieldProps {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  id?: string
  radioSize?: RadioSize
  disabled?: boolean
  className?: string
}

export const RadioField: React.FC<RadioFieldProps> = ({
  value, label, description, id, radioSize, disabled, className,
}) => {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <RadioGroupItem value={value} id={fieldId} radioSize={radioSize} disabled={disabled} className="mt-0.5" />
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

export { RadioGroup, RadioGroupItem }
