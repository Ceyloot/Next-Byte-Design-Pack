import React from 'react'
import { cn } from '../../lib/utils'
import { promien } from '../../grafiki/krzywizna'
import { useGlass } from '../../lib/glass-context'

export type GlassButtonVariant = 'primary' | 'hero' | 'solid' | 'ghost' | 'outline' | 'danger' | 'success'
export type GlassButtonSize    = 'sm' | 'default' | 'lg' | 'icon'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant
  size?:    GlassButtonSize
}

/* Promień KAŻDEGO rozmiaru wynika z prawa napięcia (`grafiki/krzywizna.ts`),
   nie z wpisanej ręcznie klasy Tailwinda. Wcześniej `sm` (32 px) i `icon`
   (40 px) miały ten sam `rounded-xl` — czyli napięcie 75% kontra 60%, dwa
   wyraźnie różne kształty stojące obok siebie. */
const sizeMap: Record<GlassButtonSize, string> = {
  sm:      'h-8  px-3   text-xs  gap-1.5',
  default: 'h-10 px-4   text-sm  gap-2',
  lg:      'h-12 px-6   text-base gap-2',
  icon:    'h-10 w-10   text-sm',
}

/** Krótszy bok kontrolki — z niego prawo napięcia liczy promień. */
const bokMap: Record<GlassButtonSize, number> = {
  sm: 32, default: 40, lg: 48, icon: 40,
}

/* --- Klasy w trybie NORMAL (język strony głównej) --------------------
   Traktowanie przyniesione z landingu (`GlowButton`/`GhostButton`):
   wezwanie to świecąca tafla koloru marki, nie płaskie wypełnienie;
   reszta to ta sama bryła, tylko neutralna. Same reguły siedzą w
   index.css jako `.nb-cta` / `.nb-cta-drugi` — tutaj zostaje wybór
   roli i to, co odróżnia warianty semantyczne. */
const normalBase = 'font-semibold'
const normalMap: Record<GlassButtonVariant, string> = {
  /* CTA — kolor marki jako świecąca powierzchnia. Domyślny wybór dla
     wezwań; to jedyne miejsce, gdzie primary ma prawo świecić. */
  primary: 'nb-cta nb-refleks-krawedzi',
  /* CTA-gwiazda strony: ta sama tafla, mocniejsza waga i poświata —
     dla „wybierz to" momentów (plan Ultimate, finałowe zaproszenie). */
  hero:    'nb-cta nb-refleks-krawedzi font-bold shadow-[var(--nb-poblask-mocny),var(--nb-refleks-mocny)]',
  solid:   'nb-cta-drugi nb-refleks-krawedzi-slaby',
  ghost:   'border border-transparent text-foreground/70 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:border-border/40',
  outline: 'nb-cta-drugi nb-refleks-krawedzi-slaby bg-transparent',
  danger:  'nb-cta-drugi nb-refleks-krawedzi-slaby border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/16 hover:border-destructive/60',
  success: 'nb-cta-drugi nb-refleks-krawedzi-slaby border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/16 hover:border-emerald-500/60',
}

/* --- Klasy w trybie GLASS (nb-szklo jako baza) ------------------------
   Wezwanie wygląda tak samo w obu trybach: `.nb-cta` to już świecąca
   tafla z rozmyciem, więc nie ma czego dokładać szkłem — a dwie warstwy
   refrakcji na sobie zjadały poświatę. Reszta wariantów bierze `nb-szklo`
   i dokłada tylko kolor treści. */
const glassOverlay: Record<GlassButtonVariant, string> = {
  primary: 'nb-cta nb-refleks-krawedzi',
  hero:    'nb-cta nb-refleks-krawedzi font-bold shadow-[var(--nb-poblask-mocny),var(--nb-refleks-mocny)]',
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
      style={{ borderRadius: promien(bokMap[size]) }}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeMap[size],
        isGlass
          // CTA prowadzi własna tafla `.nb-cta` — nakładanie na nią
          // `nb-szklo` dawało dwie warstwy refrakcji i gasiło poświatę.
          ? (variant === 'primary' || variant === 'hero')
            ? glassOverlay[variant]
            : cn('nb-szklo border', glassOverlay[variant])
          : cn(normalBase, normalMap[variant]),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
