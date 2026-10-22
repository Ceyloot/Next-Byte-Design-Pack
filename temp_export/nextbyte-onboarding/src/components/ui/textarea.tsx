import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    // Ten sam wzorzec co `Input`: wgłębienie z wewnętrznym pierścieniem
    // (`.nb-pole`), bez zewnętrznego ringu rozpychającego rząd kontrolek.
    "nb-pole flex w-full rounded-xl",
    "text-foreground placeholder:text-foreground/30",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "px-3 py-2 text-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        error:   "nb-pole-blad",
        ghost:   "nb-pole-ghost",
      },
      resize: {
        none: "resize-none",
        auto: "resize-y",
      },
    },
    defaultVariants: {
      variant: "default",
      resize: "auto",
    },
  },
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  showCount?: boolean
  maxLength?: number
  autoGrow?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, resize, showCount, maxLength, autoGrow, onChange, value, defaultValue, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement)

    const [count, setCount] = React.useState(
      String(value ?? defaultValue ?? "").length,
    )

    const grow = React.useCallback(() => {
      const el = innerRef.current
      if (!el || !autoGrow) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }, [autoGrow])

    React.useEffect(() => { grow() }, [grow, value])

    return (
      <div className="w-full">
        <textarea
          ref={innerRef}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className={cn(
            textareaVariants({ variant, resize: autoGrow ? "none" : resize }),
            className,
          )}
          onChange={(e) => {
            setCount(e.target.value.length)
            grow()
            onChange?.(e)
          }}
          {...props}
        />
        {showCount && (
          <div className="mt-1 text-right text-[11px] text-muted-foreground">
            {count}{maxLength ? ` / ${maxLength}` : ""}
          </div>
        )}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"
