import * as React from "react"
import { cn } from "@/lib/utils"

export interface OtpInputProps {
  length?: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  error?: boolean
  disabled?: boolean
  className?: string
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6, value, defaultValue, onChange, onComplete, error, disabled, className,
}) => {
  const [internal, setInternal] = React.useState<string[]>(
    () => (value ?? defaultValue ?? "").padEnd(length, " ").slice(0, length).split(""),
  )
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  const digits = value !== undefined
    ? value.padEnd(length, " ").slice(0, length).split("")
    : internal

  const setDigit = (i: number, char: string) => {
    const next = [...digits]
    next[i] = char
    const joined = next.join("").trimEnd()
    if (value === undefined) setInternal(next)
    onChange?.(joined)
    if (joined.length === length) onComplete?.(joined)
  }

  const handleChange = (i: number, raw: string) => {
    const char = raw.replace(/[^0-9a-zA-Z]/g, "").slice(-1)
    setDigit(i, char || " ")
    if (char && i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) {
      refs.current[i - 1]?.focus()
      setDigit(i - 1, " ")
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus()
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/[^0-9a-zA-Z]/g, "").slice(0, length)
    const next = text.padEnd(length, " ").split("")
    if (value === undefined) setInternal(next)
    onChange?.(text)
    if (text.length === length) onComplete?.(text)
    refs.current[Math.min(text.length, length - 1)]?.focus()
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digits[i]?.trim() ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "nb-pole h-11 w-9 rounded-xl text-center text-lg font-semibold text-foreground",
            "focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
            error && "nb-pole-blad",
          )}
        />
      ))}
    </div>
  )
}
