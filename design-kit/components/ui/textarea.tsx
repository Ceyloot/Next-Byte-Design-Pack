import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"

const textareaVariants = cva(
  [
    "flex w-full rounded-xl border transition-colors duration-200",
    "bg-input text-foreground placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "px-3 py-2 text-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border hover:border-border/70",
        error:   "border-destructive/50 hover:border-destructive/70 focus-visible:ring-destructive/60",
        ghost:   "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.06] focus-visible:bg-input focus-visible:border-border",
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
    const { isGlass } = useGlass()
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
            isGlass && "nb-szklo",
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
