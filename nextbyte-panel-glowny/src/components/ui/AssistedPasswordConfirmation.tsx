import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

interface AssistedPasswordConfirmationProps {
  password: string
  confirmPassword: string
  onConfirmPasswordChange: (value: string) => void
  disabled?: boolean
}

/**
 * Pole potwierdzenia hasła.
 *
 * WAŻNE: pole NIGDY nie blokuje wpisywania ani wklejania znaków — wcześniejsza
 * wersja odrzucała znaki, gdy potwierdzenie było dłuższe/równe hasłu, przez co
 * użytkownik mógł utknąć z niewidocznym, niepoprawnym potwierdzeniem i nie mógł
 * przejść dalej mimo "zielonych" kropek.
 */
export function AssistedPasswordConfirmation({
  password,
  confirmPassword,
  onConfirmPasswordChange,
  disabled = false,
}: AssistedPasswordConfirmationProps) {
  const [reveal, setReveal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const dots = useMemo(() => {
    const total = Math.max(password.length, confirmPassword.length)
    return Array.from({ length: Math.min(total, 40) }, (_, index) => {
      if (index >= confirmPassword.length) return 'bg-brand-text-tertiary/30'
      if (index >= password.length) return 'bg-destructive'
      return confirmPassword[index] === password[index] ? 'bg-success' : 'bg-destructive'
    })
  }, [password, confirmPassword])

  const passwordsMatch = password.length > 0 && password === confirmPassword
  const tooLong = confirmPassword.length > password.length
  const mismatch = confirmPassword.length > 0 && !passwordsMatch

  const status = passwordsMatch
    ? { text: 'Hasła są identyczne', tone: 'text-success', icon: Check }
    : tooLong
      ? { text: 'Potwierdzenie jest dłuższe niż hasło — usuń nadmiarowe znaki', tone: 'text-destructive', icon: AlertCircle }
      : mismatch
        ? { text: 'Hasła jeszcze się nie zgadzają', tone: 'text-destructive', icon: AlertCircle }
        : null

  return (
    <div className="space-y-1.5">
      <motion.div
        animate={{
          borderColor: passwordsMatch
            ? '#10B981'
            : mismatch
              ? 'rgba(239,68,68,0.6)'
              : 'hsl(var(--primary) / 0.2)',
        }}
        transition={{ duration: 0.2 }}
        className="relative h-14 bg-background/65 border border-primary/20 rounded-xl cursor-text flex items-center"
        onClick={() => inputRef.current?.focus()}
      >
        <Lock className="absolute left-4 w-5 h-5 text-brand-text-secondary z-10 pointer-events-none" />

        {reveal ? (
          <input
            ref={inputRef}
            id="confirmPassword"
            name="confirmPassword"
            type="text"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            disabled={disabled}
            placeholder="Potwierdź hasło"
            className="w-full h-full bg-transparent outline-none pl-12 pr-12 text-sm text-foreground placeholder:text-brand-text-tertiary"
            aria-label="Potwierdź hasło"
          />
        ) : (
          <>
            <div className="flex items-center gap-1.5 pl-12 pr-12 w-full overflow-hidden pointer-events-none">
              {confirmPassword.length === 0 && password.length === 0 ? (
                <span className="text-brand-text-tertiary text-sm">Potwierdź hasło</span>
              ) : (
                dots.map((color, index) => (
                  <div key={index} className={`w-3 h-3 rounded-full shrink-0 transition-colors duration-200 ${color}`} />
                ))
              )}
            </div>
            <input
              ref={inputRef}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              aria-label="Potwierdź hasło"
            />
          </>
        )}

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            setReveal((v) => !v)
          }}
          className="absolute right-3 z-20 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
          aria-label={reveal ? 'Ukryj potwierdzenie hasła' : 'Pokaż potwierdzenie hasła'}
        >
          {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </motion.div>

      {status && (
        <p className={`text-xs flex items-center gap-1.5 ${status.tone}`}>
          <status.icon className="w-3 h-3 shrink-0" />
          {status.text}
        </p>
      )}
    </div>
  )
}
