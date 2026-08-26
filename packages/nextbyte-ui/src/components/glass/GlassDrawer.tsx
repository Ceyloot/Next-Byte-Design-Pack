import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export type DrawerSide = 'right' | 'left' | 'bottom' | 'top'

const PANEL: Record<DrawerSide, string> = {
  right:  'inset-y-0 right-0 h-full w-full max-w-md border-l',
  left:   'inset-y-0 left-0  h-full w-full max-w-md border-r',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[85vh] border-t rounded-t-3xl',
  top:    'inset-x-0 top-0    w-full max-h-[85vh] border-b rounded-b-3xl',
}

/* Stan zamknięty — panel zsunięty poza krawędź */
const HIDDEN: Record<DrawerSide, string> = {
  right:  'translate-x-full',
  left:   '-translate-x-full',
  bottom: 'translate-y-full',
  top:    '-translate-y-full',
}

interface GlassDrawerProps {
  open:       boolean
  onClose:    () => void
  side?:      DrawerSide
  title?:     React.ReactNode
  desc?:      React.ReactNode
  footer?:    React.ReactNode
  /** Uchwyt do przeciągania — naturalny dla wariantu dolnego */
  handle?:    boolean
  className?: string
  children:   React.ReactNode
}

export function GlassDrawer({
  open,
  onClose,
  side = 'right',
  title,
  desc,
  footer,
  handle,
  className,
  children,
}: GlassDrawerProps) {
  const { isGlass } = useGlass()
  const showHandle = handle ?? side === 'bottom'

  /* Escape zamyka, tło pod spodem nie scrolluje */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <>
      {/* Tło */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          'fixed z-[141] flex flex-col',
          'transition-transform duration-300 ease-out',
          PANEL[side],
          !open && HIDDEN[side],
          isGlass
            ? 'nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12'
            : 'border-border bg-card',
          className,
        )}
      >
        {showHandle && (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1 w-10 rounded-full bg-foreground/20" />
          </div>
        )}

        {(title || desc) && (
          <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-4">
            <div className="flex-1 space-y-0.5">
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {desc  && <p className="text-xs text-foreground/55">{desc}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Zamknij"
              className="shrink-0 rounded-lg p-1 text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">{children}</div>

        {footer && (
          <div
            className={cn(
              'shrink-0 px-5 py-3.5',
              isGlass ? 'border-t border-foreground/[0.08]' : 'border-t border-border',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
