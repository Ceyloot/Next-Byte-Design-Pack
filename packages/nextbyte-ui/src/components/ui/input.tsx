import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useGlass } from "@/lib/glass-context"

const inputVariants = cva(
  [
    "flex w-full rounded-xl border transition-colors duration-200",
    "bg-input text-foreground placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border hover:border-border/70",
        error:   "border-destructive/50 hover:border-destructive/70 focus-visible:ring-destructive/60",
        ghost:   "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.06] focus-visible:bg-input focus-visible:border-border",
      },
      inputSize: {
        sm:      "h-8 px-3 text-xs",
        default: "h-10 px-3 text-sm",
        lg:      "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, iconLeft, iconRight, ...props }, ref) => {
    const { isGlass } = useGlass()
    const glassClass = isGlass ? 'nb-szklo' : ''

    const inputEl = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          iconLeft && 'pl-9',
          iconRight && 'pr-9',
          glassClass,
          className,
        )}
        ref={ref}
        {...props}
      />
    )

    if (!iconLeft && !iconRight) return inputEl

    return (
      <div className="relative w-full">
        {iconLeft && (
          <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex items-center">
            {iconLeft}
          </span>
        )}
        {inputEl}
        {iconRight && (
          <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex items-center">
            {iconRight}
          </span>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

/* ── Sub-komponenty pola formularza ─────────────────────────────── */

export const InputLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
    {...props}
  />
))
InputLabel.displayName = "InputLabel"

export const InputHint: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className, ...props
}) => (
  <span
    className={cn("mt-1.5 block text-xs text-muted-foreground", className)}
    {...props}
  />
)

export const InputError: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className, ...props
}) => (
  <span
    className={cn("mt-1.5 flex items-center gap-1 text-xs text-destructive", className)}
    {...props}
  />
)

/* ── Field — wygodny wrapper label + input + hint/error ─────────── */
export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

export const Field: React.FC<FieldProps> = ({
  label, hint, error, htmlFor, className, children,
}) => (
  <div className={cn("flex flex-col", className)}>
    {label && <InputLabel htmlFor={htmlFor}>{label}</InputLabel>}
    {children}
    {error  ? <InputError>{error}</InputError>
            : hint && <InputHint>{hint}</InputHint>}
  </div>
)
