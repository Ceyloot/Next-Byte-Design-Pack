import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type AlertIntent = 'info' | 'success' | 'warning' | 'danger'

interface GlassAlertProps {
  intent?:    AlertIntent
  title?:     React.ReactNode
  children?:  React.ReactNode
  onClose?:   () => void
  className?: string
  icon?:      React.ReactNode
}

const intentConfig: Record<AlertIntent, {
  icon:        React.ReactNode
  glass:       string
  normal:      string
  iconColor:   string
  titleColor:  string
}> = {
  info: {
    icon:       <Info className="h-4 w-4" />,
    glass:      'border-primary/30 bg-primary/8',
    normal:     'border-primary/30 bg-primary/6',
    iconColor:  'text-primary',
    titleColor: 'text-primary',
  },
  success: {
    icon:       <CheckCircle2 className="h-4 w-4" />,
    glass:      'border-emerald-500/30 bg-emerald-500/8',
    normal:     'border-emerald-500/30 bg-emerald-500/6',
    iconColor:  'text-emerald-400',
    titleColor: 'text-emerald-400',
  },
  warning: {
    icon:       <AlertTriangle className="h-4 w-4" />,
    glass:      'border-amber-400/35 bg-amber-400/8',
    normal:     'border-amber-400/35 bg-amber-400/6',
    iconColor:  'text-amber-400',
    titleColor: 'text-amber-400',
  },
  danger: {
    icon:       <XCircle className="h-4 w-4" />,
    glass:      'border-destructive/35 bg-destructive/8',
    normal:     'border-destructive/35 bg-destructive/6',
    iconColor:  'text-destructive',
    titleColor: 'text-destructive',
  },
}

export function GlassAlert({
  intent    = 'info',
  title,
  children,
  onClose,
  className,
  icon,
}: GlassAlertProps) {
  const { isGlass } = useGlass()
  const cfg = intentConfig[intent]

  return (
    <div
      className={cn(
        'relative flex gap-3 rounded-2xl border px-4 py-3',
        isGlass
          ? cn('nb-szklo', cfg.glass)
          : cn('border', cfg.normal),
        className,
      )}
      role="alert"
    >
      <span className={cn('mt-0.5 shrink-0', cfg.iconColor)}>
        {icon ?? cfg.icon}
      </span>

      <div className="min-w-0 flex-1 space-y-0.5">
        {title && (
          <p className={cn('text-sm font-semibold', cfg.titleColor)}>{title}</p>
        )}
        {children && (
          <p className="text-xs text-foreground/65 leading-relaxed">{children}</p>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-foreground/40 hover:text-foreground/70 transition-colors mt-0.5"
          aria-label="Zamknij"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
