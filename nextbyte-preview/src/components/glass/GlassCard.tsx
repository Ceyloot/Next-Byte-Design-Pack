import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'thin'
  radius?: string
  padding?: string
  interactive?: boolean
  /** 'auto' (domyślnie) podąża za globalnym trybem Glass/Normal.
   *  'solid' wymusza nb-tafla niezależnie od trybu — dla list z wieloma
   *  powtórzeniami (FAQ, opinie, siatki kart), gdzie dziesiątki elementów
   *  z drogim backdrop-filter SVG realnie zacinają scroll. Ma to sens
   *  tylko na elementach, które NIE są głównym punktem uwagi strony. */
  forceMode?: 'auto' | 'solid'
}

// Promień, cień i padding dopasowane 1:1 do @/components/Tile.tsx —
// oficjalnego systemu kafelków, na którym zbudowana jest zakładka Preview
// (klasyKafelka: PROMIEN.kafelek = 'rounded-2xl', ELEWACJA.uniesiona, p-5 lg:p-6).
// GlassCard i Tile muszą renderować identyczny kształt — inaczej reszta
// aplikacji (Karty, Akcje, Formularze...) wygląda inaczej niż Preview mimo
// współdzielenia tego samego mechanizmu glass/normal.
const ELEWACJA_UNIESIONA = 'shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]'

export function GlassCard({
  variant = 'default',
  radius = 'rounded-2xl',
  padding = 'p-5 lg:p-6',
  interactive = false,
  forceMode = 'auto',
  className,
  children,
  ...props
}: GlassCardProps) {
  const { isGlass: isGlassCtx } = useGlass()
  const isGlass = forceMode === 'solid' ? false : isGlassCtx

  return (
    <div
      className={cn(
        /* Soczewka na krawędzi. Zasięg steruje klasa na <html>:
           .nb-refrakcja-chrome  → tylko nav/panel/modal
           .nb-refrakcja-wszedzie → również karty i mniejsze elementy */
        isGlass
          ? 'nb-szklo nb-szklo-plynne'
          : cn('nb-tafla', interactive && 'nb-tafla-int'),
        ELEWACJA_UNIESIONA,
        radius,
        padding,
        interactive && 'cursor-pointer hover:border-primary/40',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
