import React from 'react'
import { Play, Star, Heart } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

/* Warianty kart, które w bibliotece były opisane, ale nie istniały:
   z obrazkiem (pion/poziom), produktowa i profilowa. Wszystkie stoją
   na tej samej powłoce (glass ↔ tafla), różnią się tylko układem. */

function shell(isGlass: boolean) {
  return isGlass
    ? 'nb-szklo nb-szklo-plynne nb-powierzchnia'
    : 'border border-border bg-card'
}

/** Zastępuje <img> tam, gdzie nie ma realnego zasobu — gradient
 *  + ikona czytają się jak miniatura, bez sięgania po sieć. */
function Thumb({
  icon: Icon,
  gradient = 'from-primary/30 via-sky-600/20 to-blue-600/15',
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  gradient?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-gradient-to-br', gradient, className)}>
      {Icon && <Icon className="h-8 w-8 text-white/70" />}
      {children}
    </div>
  )
}

// ── Karta z obrazkiem u góry ───────────────────────────────────────

export interface GlassMediaCardProps {
  title: string
  description?: string
  meta?: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
  gradient?: string
  /** Miniatura po lewej zamiast nad treścią. */
  horizontal?: boolean
  /** Nakładka z przyciskiem play — wariant wideo. */
  video?: boolean
  duration?: string
  footer?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function GlassMediaCard({
  title,
  description,
  meta,
  badge,
  icon,
  gradient,
  horizontal = false,
  video = false,
  duration,
  footer,
  onClick,
  className,
}: GlassMediaCardProps) {
  const { isGlass } = useGlass()

  const thumb = (
    <Thumb
      icon={video ? undefined : icon}
      gradient={gradient}
      className={horizontal ? 'h-full w-28 shrink-0' : 'h-36 w-full'}
    >
      {video && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm ring-1 ring-white/25">
          <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
        </span>
      )}
      {badge && (
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {badge}
        </span>
      )}
      {duration && (
        <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white tabular-nums">
          {duration}
        </span>
      )}
    </Thumb>
  )

  return (
    <div
      onClick={onClick}
      className={cn(
        'group overflow-hidden rounded-2xl transition-all duration-200',
        shell(isGlass),
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
        horizontal && 'flex',
        className,
      )}
    >
      {thumb}
      <div className={cn('flex min-w-0 flex-col gap-1 p-3.5', horizontal && 'flex-1 justify-center')}>
        <h4 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
          {title}
        </h4>
        {description && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground/55">{description}</p>
        )}
        {meta && <p className="mt-0.5 text-[10px] text-foreground/35">{meta}</p>}
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </div>
  )
}

// ── Karta produktu ─────────────────────────────────────────────────

export interface GlassProductCardProps {
  name: string
  price: string
  oldPrice?: string
  badge?: string
  rating?: number
  reviews?: number
  icon?: React.ComponentType<{ className?: string }>
  gradient?: string
  /** Wyszarza kartę i blokuje CTA. */
  soldOut?: boolean
  onAdd?: () => void
  className?: string
}

export function GlassProductCard({
  name,
  price,
  oldPrice,
  badge,
  rating,
  reviews,
  icon,
  gradient,
  soldOut,
  onAdd,
  className,
}: GlassProductCardProps) {
  const { isGlass } = useGlass()
  const [liked, setLiked] = React.useState(false)

  return (
    <div className={cn('group overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5', shell(isGlass), className)}>
      <Thumb icon={icon} gradient={gradient} className={cn('h-32 w-full', soldOut && 'opacity-40 grayscale')}>
        {badge && (
          <span className={cn(
            'absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
            isGlass ? 'bg-primary/85 text-white' : 'bg-primary text-primary-foreground',
          )}>
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v) }}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label={liked ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart className={cn('h-3 w-3 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-white/75')} />
        </button>
      </Thumb>

      <div className="flex flex-col gap-1.5 p-3">
        <h4 className="truncate text-[13px] font-semibold text-foreground">{name}</h4>

        {rating !== undefined && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn('h-2.5 w-2.5', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-foreground/15')}
              />
            ))}
            {reviews !== undefined && <span className="ml-0.5 text-[10px] text-foreground/40">({reviews})</span>}
          </div>
        )}

        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground tabular-nums">{price}</span>
          {oldPrice && <span className="text-[11px] text-foreground/35 line-through tabular-nums">{oldPrice}</span>}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className={cn(
            'mt-1 h-8 w-full rounded-xl text-[11px] font-bold transition-all',
            soldOut
              ? 'cursor-not-allowed bg-foreground/[0.06] text-foreground/30'
              : isGlass
                ? 'bg-primary/25 text-primary hover:bg-primary/35 shadow-[0_0_10px_hsl(var(--primary)/0.25)]'
                : 'bg-primary text-primary-foreground hover:brightness-110',
          )}
        >
          {soldOut ? 'Niedostępny' : 'Dodaj do koszyka'}
        </button>
      </div>
    </div>
  )
}

// ── Karta profilu ──────────────────────────────────────────────────

export interface GlassProfileCardProps {
  name: string
  role?: string
  bio?: string
  initials?: string
  /** Pasek statystyk pod bio — np. obserwujący / projekty. */
  stats?: { label: string; value: string }[]
  online?: boolean
  /** Pełny wariant dokłada pasek okładki nad avatarem. */
  cover?: boolean
  gradient?: string
  actions?: React.ReactNode
  className?: string
}

export function GlassProfileCard({
  name,
  role,
  bio,
  initials,
  stats,
  online,
  cover = false,
  gradient = 'from-primary/35 via-sky-600/25 to-blue-600/20',
  actions,
  className,
}: GlassProfileCardProps) {
  const { isGlass } = useGlass()
  const fallback = initials ?? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className={cn('overflow-hidden rounded-2xl', shell(isGlass), className)}>
      {cover && <div className={cn('h-16 w-full bg-gradient-to-r', gradient)} />}

      <div className={cn('flex flex-col p-4', cover && '-mt-8')}>
        <div className={cn('flex items-center gap-3', cover && 'flex-col items-start')}>
          <div className="relative shrink-0">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold',
              cover && 'ring-4 ring-background',
              isGlass ? 'bg-primary/25 text-primary' : 'bg-primary/15 text-primary border border-primary/25',
            )}>
              {fallback}
            </div>
            {online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" />
            )}
          </div>

          <div className={cn('min-w-0', cover && 'mt-2')}>
            <p className="truncate text-sm font-bold text-foreground">{name}</p>
            {role && <p className="truncate text-[11px] text-foreground/50">{role}</p>}
          </div>

          {!cover && actions && <div className="ml-auto shrink-0">{actions}</div>}
        </div>

        {bio && <p className="mt-3 text-[11px] leading-relaxed text-foreground/55">{bio}</p>}

        {stats && stats.length > 0 && (
          <div className={cn(
            'mt-3 grid gap-2 border-t pt-3',
            isGlass ? 'border-foreground/[0.08]' : 'border-border',
          )} style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))` }}>
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wide text-foreground/40">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {cover && actions && <div className="mt-3">{actions}</div>}
      </div>
    </div>
  )
}
