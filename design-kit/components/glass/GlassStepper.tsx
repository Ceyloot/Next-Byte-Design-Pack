import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface StepItem {
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface GlassStepperProps {
  steps: StepItem[]
  /** Indeks kroku bieżącego — wcześniejsze renderują się jako ukończone. */
  current: number
  orientation?: 'horizontal' | 'vertical'
  /** Oznacza krok bieżący jako nieudany (czerwony X zamiast numeru). */
  error?: boolean
  onStepClick?: (index: number) => void
  className?: string
}

export function GlassStepper({
  steps,
  current,
  orientation = 'horizontal',
  error = false,
  onStepClick,
  className,
}: GlassStepperProps) {
  const { isGlass } = useGlass()
  const isH = orientation === 'horizontal'

  return (
    <div className={cn(isH ? 'flex w-full items-start' : 'flex flex-col', className)}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const failed = active && error
        const last = i === steps.length - 1
        const Icon = step.icon

        const marker = (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all',
              failed
                ? 'bg-destructive text-destructive-foreground'
                : done
                  ? isGlass
                    ? 'bg-primary/30 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                    : 'bg-primary text-primary-foreground'
                  : active
                    ? isGlass
                      ? 'bg-primary/20 text-primary ring-2 ring-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                      : 'bg-primary/15 text-primary ring-2 ring-primary/40'
                    : isGlass
                      ? 'nb-szklo text-foreground/40'
                      : 'bg-muted text-foreground/40 border border-border',
            )}
          >
            {failed ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : i + 1}
          </div>
        )

        // Łącznik jest elementem rodzeństwa markera, nie jego dzieckiem —
        // dzięki temu w poziomie rozciąga się przez flex-1 na całą wolną
        // przestrzeń między kropkami, niezależnie od długości etykiet.
        const connector = !last && (
          <div className={cn(
            isH ? 'mt-4 h-0.5 flex-1' : 'ml-4 min-h-[28px] w-0.5 flex-1',
            done ? 'bg-primary/50' : isGlass ? 'bg-foreground/12' : 'bg-border',
          )} />
        )

        const labels = (
          <div className={cn(isH ? 'mt-2 text-center' : 'pb-6 pt-0.5')}>
            <p className={cn(
              'text-xs font-semibold leading-tight transition-colors',
              failed ? 'text-destructive' : active ? 'text-primary' : done ? 'text-foreground/75' : 'text-foreground/40',
            )}>
              {step.label}
            </p>
            {step.description && (
              <p className="mt-0.5 text-[10px] leading-snug text-foreground/40">{step.description}</p>
            )}
          </div>
        )

        if (isH) {
          return (
            <React.Fragment key={i}>
              <div
                className={cn('flex min-w-0 flex-col items-center', onStepClick && 'cursor-pointer')}
                onClick={() => onStepClick?.(i)}
              >
                {marker}
                {labels}
              </div>
              {connector}
            </React.Fragment>
          )
        }

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              {marker}
              {connector}
            </div>
            <div
              className={cn('min-w-0 flex-1', onStepClick && 'cursor-pointer')}
              onClick={() => onStepClick?.(i)}
            >
              {labels}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Wariant paskowy — postęp bez opisów, do nagłówków kreatorów ─────

export function GlassProgressSteps({
  total,
  current,
  labels,
  className,
}: {
  total: number
  current: number
  labels?: string[]
  className?: string
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-primary">
          Krok {Math.min(current + 1, total)} z {total}
        </span>
        {labels?.[current] && <span className="text-foreground/50">{labels[current]}</span>}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= current
                ? isGlass
                  ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.45)]'
                  : 'bg-primary'
                : isGlass ? 'bg-foreground/12' : 'bg-muted',
            )}
          />
        ))}
      </div>
    </div>
  )
}
