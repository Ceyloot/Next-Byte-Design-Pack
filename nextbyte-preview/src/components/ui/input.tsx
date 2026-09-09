import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    // Pole w języku ekranu logowania: wgłębienie z wewnętrznym pierścieniem
    // zamiast ramki dookoła (`.nb-pole` w index.css). Pierścień jest inset,
    // więc nie dokłada wysokości i pole równa się z przyciskiem obok.
    "nb-pole flex w-full rounded-xl",
    "text-foreground placeholder:text-foreground/30",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        // Błąd niesie pierścień, nie kolor tekstu — treść zostaje czytelna.
        error:   "nb-pole-blad",
        ghost:   "nb-pole-ghost",
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
    /* Pole nie dostaje soczewki nawet w trybie szkła. `.nb-szklo` ma
       wyższą specyficzność niż `.nb-pole` i zjadał wewnętrzny pierścień,
       przez co fokus i błąd przestawały być widoczne. Zgodnie zresztą z
       tym, co arkusz nazywa „tylko chrome": soczewka należy się nawigacji,
       panelom i modalom, nie kontrolkom formularza. */
    const bezIkon = !iconLeft && !iconRight

    /* Bez ikon polem jest sam <input> — nie ma sensu opakowywać go dla
       samego opakowania. */
    if (bezIkon) {
      return (
        <input
          type={type}
          className={cn(inputVariants({ variant, inputSize }), className)}
          ref={ref}
          {...props}
        />
      )
    }

    /* Z ikonami polem jest KONTENER, a <input> siedzi w nim przezroczysty —
       tak samo jak `PoleLogowania` na ekranie logowania. Inaczej ikona,
       będąc rodzeństwem inputa, nie miałaby jak zareagować na fokus:
       `:focus-within` musi siedzieć na wspólnym rodzicu. */
    return (
      <div className={cn(inputVariants({ variant, inputSize }), 'relative items-center p-0', className)}>
        {iconLeft && (
          <span className="nb-pole-ikona pointer-events-none absolute left-3.5 flex h-4 w-4 items-center">
            {iconLeft}
          </span>
        )}
        <input
          type={type}
          className={cn(
            'h-full w-full bg-transparent text-inherit outline-none placeholder:text-foreground/30',
            iconLeft ? 'pl-10' : 'pl-3',
            iconRight ? 'pr-10' : 'pr-3',
          )}
          ref={ref}
          {...props}
        />
        {iconRight && (
          <span className="nb-pole-ikona absolute right-3.5 flex h-4 w-4 items-center">
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
