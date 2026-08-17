import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGlass } from "@/lib/glass-context"

const SIZE = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-6 w-6",
} as const

const ICON_SIZE = {
  sm: "h-3 w-3",
  default: "h-3.5 w-3.5",
  lg: "h-4 w-4",
} as const

export type CheckboxSize = keyof typeof SIZE

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  checkboxSize?: CheckboxSize
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, checkboxSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass()
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-md border border-border bg-input",
        "transition-colors duration-200",
        "hover:border-border/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary",
        SIZE[checkboxSize],
        isGlass && "nb-szklo",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
        {props.checked === "indeterminate" ? (
          <Minus className={ICON_SIZE[checkboxSize]} />
        ) : (
          <Check className={ICON_SIZE[checkboxSize]} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

/* ── CheckboxField — label + description wrapper ─────────────────── */
export interface CheckboxFieldProps {
  label: React.ReactNode
  description?: React.ReactNode
  id?: string
  checkboxSize?: CheckboxSize
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean | "indeterminate") => void
  disabled?: boolean
  className?: string
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label, description, id, checkboxSize, checked, onCheckedChange, disabled, className,
}) => {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={fieldId}
        checkboxSize={checkboxSize}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
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

export { Checkbox }
