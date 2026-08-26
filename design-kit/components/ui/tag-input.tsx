import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { useGlass } from "../../lib/glass-context"

export interface TagInputProps {
  value?: string[]
  defaultValue?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  value, defaultValue = [], onChange, placeholder = "Dodaj i naciśnij Enter...",
  maxTags, disabled, className,
}) => {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState<string[]>(defaultValue)
  const [draft, setDraft] = React.useState("")
  const tags = value ?? internal

  const commit = (next: string[]) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) return
    if (maxTags && tags.length >= maxTags) return
    commit([...tags, tag])
  }

  const removeTag = (i: number) => {
    commit(tags.filter((_, idx) => idx !== i))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(draft)
      setDraft("")
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-input px-2.5 py-2",
        "transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        disabled && "pointer-events-none opacity-50",
        isGlass && "nb-szklo",
        className,
      )}
    >
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 pl-2.5 pr-1 py-0.5 text-xs font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (draft) { addTag(draft); setDraft("") } }}
        placeholder={tags.length === 0 ? placeholder : ""}
        disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
        className="min-w-[80px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  )
}
