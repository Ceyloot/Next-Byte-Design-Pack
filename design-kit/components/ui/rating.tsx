import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "../../lib/utils"

export interface RatingProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  max?: number
  size?: "sm" | "default" | "lg"
  readOnly?: boolean
  className?: string
}

const ICON_SIZE = { sm: "h-4 w-4", default: "h-5 w-5", lg: "h-6 w-6" } as const

export const Rating: React.FC<RatingProps> = ({
  value, defaultValue = 0, onChange, max = 5, size = "default", readOnly, className,
}) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const [hover, setHover] = React.useState<number | null>(null)
  const current = value ?? internal
  const shown = hover ?? current

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} role="radiogroup">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          aria-label={`${n} z ${max}`}
          className={cn(
            "transition-transform disabled:cursor-default",
            !readOnly && "hover:scale-110 cursor-pointer",
          )}
          onClick={() => {
            setInternal(n)
            onChange?.(n)
          }}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
        >
          <Star
            className={cn(
              ICON_SIZE[size],
              n <= shown ? "fill-primary text-primary" : "fill-transparent text-muted-foreground",
              "transition-colors",
            )}
          />
        </button>
      ))}
    </div>
  )
}

const EMOJIS = ["😡", "😕", "😐", "🙂", "😍"]

export interface EmojiRatingProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  size?: "sm" | "default" | "lg"
  className?: string
}

const EMOJI_SIZE = { sm: "text-lg", default: "text-2xl", lg: "text-3xl" } as const

export const EmojiRating: React.FC<EmojiRatingProps> = ({
  value, defaultValue = 0, onChange, size = "default", className,
}) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} role="radiogroup">
      {EMOJIS.map((emoji, i) => {
        const n = i + 1
        const active = n === current
        return (
          <button
            key={n}
            type="button"
            aria-label={emoji}
            onClick={() => { setInternal(n); onChange?.(n) }}
            className={cn(
              EMOJI_SIZE[size],
              "rounded-full p-1.5 transition-all grayscale opacity-50 hover:opacity-100 hover:grayscale-0 hover:scale-110",
              active && "opacity-100 grayscale-0 bg-primary/10 scale-110",
            )}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
