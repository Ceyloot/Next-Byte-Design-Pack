import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export type AvatarSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'busy' | 'away' | 'offline'

interface GlassAvatarProps {
  src?:       string
  initials?:  string
  name?:      string
  size?:      AvatarSize
  status?:    AvatarStatus
  color?:     string
  className?: string
}

const sizeMap: Record<AvatarSize, { avatar: string; text: string; ring: string; dot: string }> = {
  xs: { avatar: 'h-6  w-6',  text: 'text-[10px]', ring: 'ring-1',  dot: 'h-1.5 w-1.5 -right-px -bottom-px' },
  sm: { avatar: 'h-8  w-8',  text: 'text-xs',     ring: 'ring-1',  dot: 'h-2   w-2   -right-px -bottom-px' },
  md: { avatar: 'h-10 w-10', text: 'text-sm',     ring: 'ring-2',  dot: 'h-2.5 w-2.5 right-0 bottom-0'    },
  lg: { avatar: 'h-12 w-12', text: 'text-base',   ring: 'ring-2',  dot: 'h-3   w-3   right-0 bottom-0'    },
  xl: { avatar: 'h-16 w-16', text: 'text-xl',     ring: 'ring-2',  dot: 'h-3.5 w-3.5 right-0 bottom-0'   },
}

const statusColor: Record<AvatarStatus, string> = {
  online:  'bg-emerald-400',
  busy:    'bg-destructive',
  away:    'bg-amber-400',
  offline: 'bg-foreground/30',
}

/* Generates a deterministic hsl color from initials */
function initialsColor(str = '') {
  const h = str.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xfff, 0)
  return `hsl(${(h * 137) % 360} 55% 50%)`
}

export function GlassAvatar({
  src,
  initials,
  name,
  size      = 'md',
  status,
  color,
  className,
}: GlassAvatarProps) {
  const { isGlass } = useGlass()
  const sz  = sizeMap[size]
  const bg  = color ?? initialsColor(initials ?? name)
  const abbr = initials ?? (name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?')

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white',
          sz.avatar,
          isGlass ? cn('nb-szklo', 'ring-foreground/10', sz.ring) : cn('ring-foreground/10', sz.ring),
        )}
        style={!src ? { backgroundColor: bg } : undefined}
        title={name}
        aria-label={name}
      >
        {src
          ? <img src={src} alt={name} className="h-full w-full object-cover" />
          : <span className={sz.text}>{abbr}</span>
        }
      </div>

      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-background',
            sz.dot,
            statusColor[status],
          )}
        />
      )}
    </div>
  )
}

/* ── Avatar Group — stos awatarów ze zliczaniem nadmiaru ── */
interface GlassAvatarGroupProps {
  avatars:    Omit<GlassAvatarProps, 'size'>[]
  max?:       number
  size?:      AvatarSize
  className?: string
}

export function GlassAvatarGroup({
  avatars,
  max       = 4,
  size      = 'sm',
  className,
}: GlassAvatarGroupProps) {
  const { isGlass } = useGlass()
  const sz      = sizeMap[size]
  const visible = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((av, i) => (
        <div key={i} className="-ml-2 first:ml-0" style={{ zIndex: visible.length - i }}>
          <GlassAvatar {...av} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            '-ml-2 rounded-full flex items-center justify-center font-semibold text-foreground/70',
            sz.avatar, sz.text,
            isGlass ? 'nb-szklo' : 'border border-border bg-muted/50',
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
