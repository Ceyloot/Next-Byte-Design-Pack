import React, { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassSearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  size?: 'sm' | 'default' | 'lg'
  className?: string
  autoFocus?: boolean
}

const sizeMap = {
  sm:      { wrap: 'h-8',  icon: 'h-3.5 w-3.5', input: 'text-xs  pl-8  pr-7',  iconLeft: 'left-2.5', iconRight: 'right-2' },
  default: { wrap: 'h-10', icon: 'h-4 w-4',     input: 'text-sm  pl-10 pr-8',  iconLeft: 'left-3',   iconRight: 'right-2.5' },
  lg:      { wrap: 'h-12', icon: 'h-5 w-5',     input: 'text-base pl-12 pr-10', iconLeft: 'left-3.5', iconRight: 'right-3' },
}

export function GlassSearch({
  placeholder = 'Szukaj...',
  value,
  onChange,
  onSearch,
  size = 'default',
  className,
  autoFocus,
}: GlassSearchProps) {
  const { isGlass } = useGlass()
  const inputRef = useRef<HTMLInputElement>(null)
  const sz = sizeMap[size]

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch?.(e.currentTarget.value)
    if (e.key === 'Escape') { onChange?.(''); inputRef.current?.blur() }
  }

  return (
    <div className={cn(
      isGlass ? 'nb-szklo' : 'border border-border bg-input',
      'relative flex items-center rounded-full',
      sz.wrap,
      className,
    )}>
      <Search className={cn('pointer-events-none absolute text-foreground/45', sz.icon, sz.iconLeft)} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'h-full w-full bg-transparent outline-none',
          'text-foreground placeholder:text-foreground/40',
          '[&::-webkit-search-cancel-button]:hidden',
          sz.input,
        )}
      />
      {value && (
        <button
          onClick={() => { onChange?.(''); inputRef.current?.focus() }}
          className={cn('absolute flex items-center justify-center rounded-full p-0.5 text-foreground/50 hover:text-foreground', sz.iconRight)}
        >
          <X className={sz.icon} />
        </button>
      )}
    </div>
  )
}
