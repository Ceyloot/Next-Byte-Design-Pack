import React from 'react'
// Lucide w tej wersji nie dostarcza ikon marek (Github/Chrome) — używamy
// neutralnych odpowiedników, żeby nie dociągać drugiego pakietu ikon.
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle, Code2, Globe, Apple } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

// ── 36. AuthCard ───────────────────────────────────────────────────

export function GlassAuthCard({
  title,
  subtitle,
  logo,
  footer,
  className,
  children,
}: {
  title: string
  subtitle?: string
  logo?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn(
      'w-full max-w-sm rounded-2xl p-6',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card shadow-xl',
      className,
    )}>
      <div className="mb-5 flex flex-col items-center text-center">
        {logo && <div className="mb-3">{logo}</div>}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-foreground/50">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-5 text-center text-xs text-foreground/50">{footer}</div>}
    </div>
  )
}

// ── 37. PasswordField (z przełącznikiem widoczności) ───────────────

export function GlassPasswordField({
  value,
  onChange,
  placeholder = 'Hasło',
  showStrength = false,
  error,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  showStrength?: boolean
  error?: string
  className?: string
}) {
  const { isGlass } = useGlass()
  const [visible, setVisible] = React.useState(false)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className={cn(
        'flex h-10 items-center gap-2 rounded-xl px-3 transition-all',
        isGlass ? 'nb-szklo' : 'border border-border bg-input',
        error ? 'ring-2 ring-destructive/40' : 'focus-within:ring-2 focus-within:ring-primary/30',
      )}>
        <Lock className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          className="shrink-0 text-foreground/35 transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}

      {showStrength && value && <GlassPasswordStrength password={value} />}
    </div>
  )
}

// ── 38. PasswordStrength ───────────────────────────────────────────

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  checks: { label: string; ok: boolean }[]
}

/** Prosty, przewidywalny scoring — 5 kryteriów, wynik = liczba spełnionych.
 *  Świadomie bez zxcvbn: zero zależności, wystarczające jako sygnał w UI. */
export function scorePassword(pw: string): StrengthResult {
  const checks = [
    { label: 'Min. 8 znaków',        ok: pw.length >= 8 },
    { label: 'Wielka litera',        ok: /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(pw) },
    { label: 'Mała litera',          ok: /[a-ząćęłńóśźż]/.test(pw) },
    { label: 'Cyfra',                ok: /\d/.test(pw) },
    { label: 'Znak specjalny',       ok: /[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(pw) },
  ]
  const passed = checks.filter((c) => c.ok).length
  const score = Math.max(0, passed - 1) as 0 | 1 | 2 | 3 | 4
  const label = ['Bardzo słabe', 'Słabe', 'Średnie', 'Dobre', 'Bardzo mocne'][score]
  return { score, label, checks }
}

const STRENGTH_COLOR = [
  'hsl(0 72% 58%)', 'hsl(14 85% 58%)', 'hsl(38 92% 50%)', 'hsl(80 60% 45%)', 'hsl(160 60% 45%)',
]

export function GlassPasswordStrength({
  password,
  showChecks = true,
  className,
}: {
  password: string
  showChecks?: boolean
  className?: string
}) {
  const { score, label, checks } = React.useMemo(() => scorePassword(password), [password])
  const color = STRENGTH_COLOR[score]

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= score ? color : 'hsl(var(--foreground)/0.12)' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold" style={{ color }}>{label}</p>

      {showChecks && (
        <div className="mt-0.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span
              key={c.label}
              className={cn('flex items-center gap-1 text-[10px]', c.ok ? 'text-emerald-400' : 'text-foreground/30')}
            >
              <Check className={cn('h-2.5 w-2.5 shrink-0', !c.ok && 'opacity-30')} />
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 39. SocialButtons ──────────────────────────────────────────────

const PROVIDERS = {
  google: { label: 'Google', icon: Globe },
  github: { label: 'GitHub', icon: Code2 },
  apple:  { label: 'Apple',  icon: Apple },
} as const

export function GlassSocialButtons({
  providers = ['google', 'github', 'apple'],
  /** 'row' — same ikony obok siebie; 'stack' — pełne przyciski z tekstem. */
  layout = 'stack',
  onSelect,
  className,
}: {
  providers?: (keyof typeof PROVIDERS)[]
  layout?: 'row' | 'stack'
  onSelect?: (p: keyof typeof PROVIDERS) => void
  className?: string
}) {
  const { isGlass } = useGlass()
  const base = isGlass
    ? 'nb-szklo hover:bg-foreground/[0.06]'
    : 'border border-border bg-card hover:bg-foreground/[0.04]'

  return (
    <div className={cn(layout === 'row' ? 'flex gap-2' : 'flex flex-col gap-2', className)}>
      {providers.map((p) => {
        const { label, icon: Icon } = PROVIDERS[p]
        return (
          <button
            key={p}
            type="button"
            onClick={() => onSelect?.(p)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl text-[12px] font-medium text-foreground/80 transition-colors',
              base,
              layout === 'row' ? 'h-10 flex-1' : 'h-10 w-full',
            )}
          >
            <Icon className="h-4 w-4" />
            {layout === 'stack' && <span>Kontynuuj z {label}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ── 40. LoginForm ──────────────────────────────────────────────────

export function GlassLoginForm({
  onSubmit,
  error,
  loading,
  className,
}: {
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  error?: string
  loading?: boolean
  className?: string
}) {
  const { isGlass } = useGlass()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(true)

  return (
    <form
      className={cn('flex flex-col gap-3', className)}
      onSubmit={(e) => { e.preventDefault(); onSubmit?.({ email, password, remember }) }}
    >
      {error && (
        <p className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}

      <div className={cn(
        'flex h-10 items-center gap-2 rounded-xl px-3 transition-all focus-within:ring-2 focus-within:ring-primary/30',
        isGlass ? 'nb-szklo' : 'border border-border bg-input',
      )}>
        <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Adres e-mail" autoComplete="email"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        />
      </div>

      <GlassPasswordField value={password} onChange={setPassword} />

      <div className="flex items-center justify-between text-[11px]">
        <label className="flex cursor-pointer items-center gap-1.5 text-foreground/60">
          <input
            type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          Zapamiętaj mnie
        </label>
        <button type="button" className="font-medium text-primary hover:underline">Nie pamiętam hasła</button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'mt-1 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50',
          isGlass
            ? 'bg-primary/25 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.28)] hover:bg-primary/35'
            : 'bg-primary text-primary-foreground hover:brightness-110',
        )}
      >
        {loading ? 'Logowanie…' : <>Zaloguj się <ArrowRight className="h-3.5 w-3.5" /></>}
      </button>
    </form>
  )
}
