import React from 'react'
import { Check, CheckCheck, MoreHorizontal, Send, Paperclip, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

/* ═══════════════════════════════════════════════════════════════════
   Zestaw komponentów czatu. Rozbity na małe części zamiast jednego
   monolitu, żeby dało się złożyć zarówno wątek AI (bąbel + typing),
   jak i listę wiadomości z avatarami i statusem doręczenia.
   ═══════════════════════════════════════════════════════════════════ */

export type ChatRole = 'user' | 'assistant' | 'system'
export type ChatStatus = 'sending' | 'sent' | 'delivered' | 'read'

// ── Bąbel wiadomości ───────────────────────────────────────────────

export interface GlassChatBubbleProps {
  role?: ChatRole
  children: React.ReactNode
  /** Inicjały lub węzeł renderowany jako avatar obok bąbla. */
  avatar?: React.ReactNode
  author?: string
  time?: string
  status?: ChatStatus
  className?: string
}

function StatusTick({ status }: { status: ChatStatus }) {
  if (status === 'sending') {
    return <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40 animate-pulse" />
  }
  if (status === 'sent') return <Check className="h-3 w-3 opacity-50" />
  if (status === 'delivered') return <CheckCheck className="h-3 w-3 opacity-50" />
  return <CheckCheck className="h-3 w-3 text-primary" />
}

export function GlassChatBubble({
  role = 'assistant',
  children,
  avatar,
  author,
  time,
  status,
  className,
}: GlassChatBubbleProps) {
  const { isGlass } = useGlass()

  // Wiadomość systemowa to wyśrodkowana pigułka, nie bąbel — inny rytm
  // wizualny sygnalizuje, że to nie jest wypowiedź żadnej ze stron.
  if (role === 'system') {
    return (
      <div className={cn('flex justify-center py-1', className)}>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-foreground/50',
          isGlass ? 'nb-szklo' : 'bg-muted/60 border border-border',
        )}>
          {children}
        </span>
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div className={cn('flex w-full gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row', className)}>
      {avatar && (
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          isUser
            ? 'bg-primary/20 text-primary border border-primary/30'
            : isGlass ? 'nb-szklo text-foreground/70' : 'bg-muted text-foreground/70 border border-border',
        )}>
          {avatar}
        </div>
      )}

      <div className={cn('flex max-w-[78%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        {author && (
          <span className="px-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
            {author}
          </span>
        )}

        <div className={cn(
          'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? isGlass
              ? 'bg-primary/20 text-foreground border border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.18)] rounded-br-md'
              : 'bg-primary text-primary-foreground rounded-br-md'
            : isGlass
              ? 'nb-szklo nb-szklo-plynne text-foreground/90 rounded-bl-md'
              : 'bg-card border border-border text-foreground/90 rounded-bl-md',
        )}>
          {children}
        </div>

        {(time || status) && (
          <div className="flex items-center gap-1.5 px-1 text-[10px] text-foreground/40">
            {time && <span className="tabular-nums">{time}</span>}
            {status && isUser && <StatusTick status={status} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Wskaźnik pisania ───────────────────────────────────────────────

export function GlassChatTyping({ avatar, label, className }: { avatar?: React.ReactNode; label?: string; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div className={cn('flex items-end gap-2.5', className)}>
      {avatar && (
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          isGlass ? 'nb-szklo text-foreground/70' : 'bg-muted text-foreground/70 border border-border',
        )}>
          {avatar}
        </div>
      )}
      <div className={cn(
        'flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3',
        isGlass ? 'nb-szklo nb-szklo-plynne' : 'bg-card border border-border',
      )}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-foreground/45"
            style={{ animation: `nb-typing 1.2s ${i * 0.16}s infinite ease-in-out` }}
          />
        ))}
        {label && <span className="ml-1 text-[11px] text-foreground/45">{label}</span>}
      </div>
      <style>{`@keyframes nb-typing{0%,60%,100%{opacity:.28;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}`}</style>
    </div>
  )
}

// ── Nagłówek czatu ─────────────────────────────────────────────────

export interface GlassChatHeaderProps {
  title: string
  subtitle?: string
  avatar?: React.ReactNode
  /** Zielona kropka obecności przy avatarze. */
  online?: boolean
  actions?: React.ReactNode
  className?: string
}

export function GlassChatHeader({ title, subtitle, avatar, online, actions, className }: GlassChatHeaderProps) {
  const { isGlass } = useGlass()
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-t-2xl px-4 py-3',
      isGlass ? 'nb-szklo nb-szklo-plynne' : 'bg-card border-b border-border',
      className,
    )}>
      <div className="relative shrink-0">
        <div className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
          isGlass ? 'nb-szklo text-primary' : 'bg-primary/15 text-primary border border-primary/25',
        )}>
          {avatar ?? <Sparkles className="h-4 w-4" />}
        </div>
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="truncate text-[11px] text-foreground/45">{subtitle}</p>}
      </div>
      {actions ?? (
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ── Pasek wprowadzania ─────────────────────────────────────────────

export interface GlassChatInputProps {
  value?: string
  onChange?: (v: string) => void
  onSend?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  /** Rząd sugestii nad polem — klik wstawia treść i wysyła. */
  suggestions?: string[]
  className?: string
}

export function GlassChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Napisz wiadomość...',
  disabled,
  suggestions,
  className,
}: GlassChatInputProps) {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState('')
  const val = value !== undefined ? value : internal

  function set(v: string) {
    if (value === undefined) setInternal(v)
    onChange?.(v)
  }

  function send(text?: string) {
    const payload = (text ?? val).trim()
    if (!payload || disabled) return
    onSend?.(payload)
    set('')
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                isGlass
                  ? 'nb-szklo text-foreground/65 hover:text-foreground'
                  : 'border border-border bg-card text-foreground/65 hover:text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className={cn(
        'flex items-center gap-2 rounded-2xl px-3 py-2 transition-all',
        isGlass
          ? 'nb-szklo nb-szklo-plynne focus-within:shadow-[0_0_14px_hsl(var(--primary)/0.2)]'
          : 'border border-border bg-card focus-within:border-primary/50',
      )}>
        <button
          type="button"
          disabled={disabled}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-40"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </button>

        <input
          type="text"
          value={val}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/35 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => send()}
          disabled={disabled || !val.trim()}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
            val.trim() && !disabled
              ? isGlass
                ? 'bg-primary/25 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                : 'bg-primary text-primary-foreground'
              : 'text-foreground/25',
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Kontener wątku ─────────────────────────────────────────────────

export function GlassChatThread({
  children,
  maxHeight = 380,
  className,
}: {
  children: React.ReactNode
  maxHeight?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-col gap-3 overflow-y-auto px-4 py-4', className)}
      style={{ maxHeight }}
    >
      {children}
    </div>
  )
}
