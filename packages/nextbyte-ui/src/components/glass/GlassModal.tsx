import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'
import { GlassCard } from './GlassCard'
import { GlassButton } from './GlassButton'

interface GlassModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: string
  width?: string
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function GlassModal({
  open,
  onClose,
  title,
  description,
  width = 'max-w-md',
  className,
  children,
  footer,
}: GlassModalProps) {
  const { isGlass } = useGlass()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0',
          isGlass
            ? 'nb-szklo nb-szklo-plynne nb-powierzchnia rounded-none border-0'
            : 'bg-background/80 backdrop-blur-sm',
        )}
        style={isGlass ? { backdropFilter: 'blur(16px) saturate(1.4)', background: 'hsl(var(--card) / 0.25)' } : {}}
        onClick={onClose}
      />
      {/* Okno modala — GlassCard jest już context-aware */}
      <GlassCard
        role="dialog"
        aria-modal="true"
        className={cn('relative z-10 w-full', width, 'rounded-2xl p-0 overflow-hidden', className)}
        padding="p-0"
        radius="rounded-2xl"
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-foreground/10 px-6 py-5">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
              {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
            </div>
            <GlassButton size="icon" variant="ghost" onClick={onClose} className="shrink-0 h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </GlassButton>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-foreground/10 px-6 py-4">
            {footer}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
