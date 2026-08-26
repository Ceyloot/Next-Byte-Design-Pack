import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export type GlassButtonVariant = 'primary' | 'hero' | 'solid' | 'ghost' | 'outline' | 'danger' | 'success'
export type GlassButtonSize    = 'sm' | 'default' | 'lg' | 'icon'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant
  size?:    GlassButtonSize
}

// rounded-xl = promień TileAction/TileRow z @/components/Tile.tsx (kontrolki),
// nie rounded-nb (8px) — ta sama konwencja co reszta aplikacji.
const sizeMap: Record<GlassButtonSize, string> = {
  sm:      'h-8  px-3   text-xs  gap-1.5 rounded-xl',
  default: 'h-10 px-4   text-sm  gap-2   rounded-xl',
  lg:      'h-12 px-6   text-base gap-2   rounded-2xl',
  icon:    'h-10 w-10   text-sm          rounded-xl',
}

/* --- Klasy w trybie NORMAL (bez glass) --- */
const normalBase = 'border font-medium transition-all duration-200'
const normalMap: Record<GlassButtonVariant, string> = {
  /* CTA — pełny kolor marki. To jest to jedno miejsce, gdzie primary działa
     jako powierzchnia, nie jako szept. Domyślny wybór dla wezwań. */
  primary: 'border-transparent bg-primary text-primary-foreground shadow-[0_1px_0_0_hsl(210_40%_100%/.15)_inset,0_8px_18px_-8px_hsl(var(--primary)/.5)] hover:brightness-110',
  /* CTA-gwiazda strony — jedyne miejsce z mocnym poświatowym cieniem.
     Dla "wybierz to" momentów (plan Ultimate, finałowe zaproszenie). */
  hero:    'border-primary/60 bg-primary text-primary-foreground font-bold shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)] hover:brightness-110 active:scale-[0.98]',
  solid:   'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60 hover:border-border/80',
  ghost:   'border-transparent text-foreground/70 hover:bg-muted/40 hover:text-foreground hover:border-border/40',
  outline: 'border-border/70 bg-transparent text-foreground hover:bg-muted/30',
  danger:  'border-destructive/40 bg-destructive/8 text-destructive hover:bg-destructive/14 hover:border-destructive/60',
  success: 'border-emerald-500/40 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/14 hover:border-emerald-500/60',
}

/* --- Klasy w trybie GLASS (nb-szklo jako baza) --- */
const glassOverlay: Record<GlassButtonVariant, string> = {
  /* Nawet w glass, primary CTA ma realne wypełnienie — glass to podkład
     scenerii, primary to element interakcji. Nie mieszamy. */
  primary: 'bg-primary text-primary-foreground border-transparent hover:brightness-110',
  hero:    'bg-primary text-primary-foreground font-bold border-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)] hover:brightness-110 active:scale-[0.98]',
  solid:   'text-foreground',
  ghost:   'text-foreground/80 hover:text-foreground',
  outline: 'text-foreground border-foreground/25 hover:border-foreground/45',
  danger:  'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/16',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/28 hover:bg-emerald-500/16',
}

export function GlassButton({
  variant  = 'solid',
  size     = 'default',
  className,
  children,
  disabled,
  ...props
}: GlassButtonProps) {
  const { isGlass } = useGlass()

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeMap[size],
        isGlass
          ? (variant === 'primary' || variant === 'hero')
            // `.is-glass .nb-szklo` ma wyższą specyficzność niż `bg-primary`
            // (2 klasy vs 1) i nadpisuje wypełnienie kolorem — dlatego CTA
            // z pełnym kolorem NIE dostaje bazy nb-szklo, tylko realną
            // krawędź + wypełnienie wprost (patrz komentarz przy primary
            // w glassOverlay: "nie mieszamy").
            ? cn('border', glassOverlay[variant])
            : cn('nb-szklo', glassOverlay[variant])
          : cn(normalBase, normalMap[variant]),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
