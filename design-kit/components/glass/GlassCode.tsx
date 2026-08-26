import React from 'react'
import { Copy, Check, ChevronRight, Terminal as TermIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

// ── 25. CodeBlock ──────────────────────────────────────────────────

export interface GlassCodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  /** Numery linii do podświetlenia (1-indeksowane). */
  highlight?: number[]
  /** Zwija blok powyżej N linii z przyciskiem rozwijania. */
  maxLines?: number
  className?: string
}

export function GlassCodeBlock({
  code, language, filename, showLineNumbers = true, highlight = [], maxLines, className,
}: GlassCodeBlockProps) {
  const { isGlass } = useGlass()
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  const lines = code.replace(/\n$/, '').split('\n')
  const clipped = maxLines !== undefined && lines.length > maxLines && !expanded
  const shown = clipped ? lines.slice(0, maxLines) : lines

  function copy() {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      className,
    )}>
      {(filename || language) && (
        <div className={cn(
          'flex items-center gap-2 px-3.5 py-2',
          isGlass ? 'border-b border-foreground/[0.08]' : 'border-b border-border',
        )}>
          <TermIcon className="h-3 w-3 shrink-0 text-primary" />
          {filename && <span className="font-mono text-[11px] text-foreground/70">{filename}</span>}
          {language && (
            <span className="rounded bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-foreground/40">
              {language}
            </span>
          )}
          <button
            onClick={copy}
            className="ml-auto flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-medium text-foreground/40 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
          >
            {copied ? <><Check className="h-3 w-3 text-emerald-400" />Skopiowano</> : <><Copy className="h-3 w-3" />Kopiuj</>}
          </button>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <pre className="py-2.5 font-mono text-[11.5px] leading-relaxed">
          {shown.map((line, i) => {
            const n = i + 1
            const hl = highlight.includes(n)
            return (
              <div
                key={i}
                className={cn('flex px-3.5', hl && (isGlass ? 'bg-primary/[0.10]' : 'bg-primary/[0.07]'))}
              >
                {showLineNumbers && (
                  <span className={cn(
                    'mr-3.5 w-6 shrink-0 select-none text-right tabular-nums',
                    hl ? 'text-primary' : 'text-foreground/20',
                  )}>
                    {n}
                  </span>
                )}
                <code className={cn('whitespace-pre', hl ? 'text-foreground' : 'text-foreground/75')}>
                  {line || ' '}
                </code>
              </div>
            )
          })}
        </pre>

        {clipped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>

      {maxLines !== undefined && lines.length > maxLines && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'flex w-full items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-foreground/45 transition-colors hover:text-primary',
            isGlass ? 'border-t border-foreground/[0.08]' : 'border-t border-border',
          )}
        >
          <ChevronRight className={cn('h-3 w-3 transition-transform', expanded ? '-rotate-90' : 'rotate-90')} />
          {expanded ? 'Zwiń' : `Pokaż wszystkie ${lines.length} linii`}
        </button>
      )}
    </div>
  )
}

// ── 26. InlineCode ─────────────────────────────────────────────────

export function GlassInlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn(
      'rounded-md border border-foreground/[0.08] bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-primary',
      className,
    )}>
      {children}
    </code>
  )
}

// ── 27. JsonViewer ─────────────────────────────────────────────────

const JSON_COLOR = {
  key:     'text-primary',
  string:  'text-emerald-400',
  number:  'text-amber-400',
  boolean: 'text-purple-400',
  null:    'text-foreground/35',
}

function JsonNode({ name, value, depth, last }: { name?: string; value: unknown; depth: number; last: boolean }) {
  const [open, setOpen] = React.useState(depth < 2)
  const pad = { paddingLeft: depth * 14 }

  const isObj = value !== null && typeof value === 'object'
  const isArr = Array.isArray(value)

  if (!isObj) {
    const type = value === null ? 'null' : (typeof value as keyof typeof JSON_COLOR)
    const text = value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value)
    return (
      <div style={pad} className="flex gap-1.5 whitespace-nowrap">
        {name !== undefined && <span className={JSON_COLOR.key}>&quot;{name}&quot;:</span>}
        <span className={JSON_COLOR[type] ?? 'text-foreground'}>{text}</span>
        {!last && <span className="text-foreground/25">,</span>}
      </div>
    )
  }

  const entries = isArr
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>)
  const [openB, closeB] = isArr ? ['[', ']'] : ['{', '}']

  return (
    <div>
      <div style={pad} className="flex cursor-pointer items-center gap-1 whitespace-nowrap" onClick={() => setOpen((v) => !v)}>
        <ChevronRight className={cn('h-2.5 w-2.5 shrink-0 text-foreground/30 transition-transform', open && 'rotate-90')} />
        {name !== undefined && <span className={JSON_COLOR.key}>&quot;{name}&quot;:</span>}
        <span className="text-foreground/45">{openB}</span>
        {!open && <span className="text-foreground/25">… {entries.length} {closeB}</span>}
      </div>
      {open && (
        <>
          {entries.map(([k, v], i) => (
            <JsonNode key={k} name={isArr ? undefined : k} value={v} depth={depth + 1} last={i === entries.length - 1} />
          ))}
          <div style={pad} className="flex gap-1 whitespace-nowrap pl-[14px]">
            <span className="text-foreground/45">{closeB}</span>
            {!last && <span className="text-foreground/25">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

export function GlassJsonViewer({ data, className }: { data: unknown; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div className={cn(
      'overflow-x-auto rounded-2xl p-3.5 font-mono text-[11.5px] leading-relaxed',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      className,
    )}>
      <JsonNode value={data} depth={0} last />
    </div>
  )
}

// ── 28. LogView ────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

export interface LogLine {
  time: string
  level: LogLevel
  message: string
  source?: string
}

const LEVEL = {
  info:    { cls: 'text-sky-400',     tag: 'INFO'  },
  warn:    { cls: 'text-amber-400',   tag: 'WARN'  },
  error:   { cls: 'text-red-400',     tag: 'ERROR' },
  debug:   { cls: 'text-foreground/40', tag: 'DEBUG' },
  success: { cls: 'text-emerald-400', tag: 'OK'    },
}

export function GlassLogView({
  lines,
  maxHeight = 260,
  /** Filtr poziomów — puste pokazuje wszystko. */
  levels,
  className,
}: {
  lines: LogLine[]
  maxHeight?: number
  levels?: LogLevel[]
  className?: string
}) {
  const { isGlass } = useGlass()
  const shown = levels?.length ? lines.filter((l) => levels.includes(l.level)) : lines

  return (
    <div
      className={cn(
        'overflow-auto rounded-2xl p-3 font-mono text-[11px] leading-relaxed',
        isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
        className,
      )}
      style={{ maxHeight }}
    >
      {shown.length === 0 ? (
        <p className="py-6 text-center text-foreground/30">Brak wpisów</p>
      ) : shown.map((l, i) => {
        const lv = LEVEL[l.level]
        return (
          <div key={i} className="flex gap-2 whitespace-nowrap py-0.5 hover:bg-foreground/[0.03]">
            <span className="shrink-0 text-foreground/25 tabular-nums">{l.time}</span>
            <span className={cn('w-11 shrink-0 font-bold', lv.cls)}>{lv.tag}</span>
            {l.source && <span className="shrink-0 text-foreground/35">[{l.source}]</span>}
            <span className="text-foreground/70">{l.message}</span>
          </div>
        )
      })}
    </div>
  )
}
