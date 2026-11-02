import { LogIn } from 'lucide-react'
import { AnimStyles, GlowButton } from '@/sections/wspolne/shared'
import { cn } from '@/lib/utils'
import {
  AnthropicIcon, GeminiIcon, GoogleIcon, KlingIcon, NextByteMarkIcon, OpenAIIcon, XaiIcon,
} from '@/grafiki/znaki-marek'

/* START — pierwsze wejście. Ten sam język co panel logowania: jedna kolumna
   400 px wprost na tle, jedna poświata, przycisk Google + GlowButton. */

const MODELE = [
  { nazwa: 'GPT', ikona: OpenAIIcon },
  { nazwa: 'Claude', ikona: AnthropicIcon },
  { nazwa: 'Gemini', ikona: GeminiIcon },
  { nazwa: 'Grok', ikona: XaiIcon },
  { nazwa: 'Kling', ikona: KlingIcon },
] as const

const KROKI = ['Konto w 30 sekund', 'Dwa szybkie pytania', 'AI rusza do pracy'] as const

export interface StartProps {
  onGoogle?: () => void
  onEmail?: () => void
  onLogowanie?: () => void
}

export function Start({ onGoogle, onEmail, onLogowanie }: StartProps) {
  return (
    <div className="relative flex min-h-full w-full items-center justify-center px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] font-landing text-foreground">
      <AnimStyles />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 45%, hsl(var(--primary)/0.05) 0%, hsl(var(--primary)/0.015) 45%, transparent 80%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center">
          <NextByteMarkIcon className="h-9 w-auto text-foreground sm:h-11" />
          <h1 className="mt-5 text-center font-heading text-[clamp(28px,9.2vw,44px)] font-normal leading-[1.06] tracking-[-0.035em] text-foreground [text-wrap:balance] sm:mt-7">
            Twoje AI
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.55)] bg-clip-text text-transparent">
              w jednym miejscu.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-center font-sans text-[14px] [text-wrap:pretty] leading-relaxed text-foreground/50">
            Rozmowy, zdjęcia, wideo i nauka po polsku. Dwa pytania i pokażemy Ci, od czego zacząć.
          </p>

          <ul
            className="mt-4 flex items-center justify-center gap-5 text-foreground/35"
            aria-label="W środku: GPT, Claude, Gemini, Grok, Kling, Seedance"
          >
            {MODELE.map(({ nazwa, ikona: Ikona }) => (
              <li key={nazwa} title={nazwa}>
                <Ikona className="h-4 w-4" />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onGoogle}
          className={cn(
            'mt-5 flex h-12 w-full sm:h-11 items-center justify-center gap-2.5 rounded-xl',
            'border border-foreground/[0.12] bg-foreground/[0.03] font-sans text-[14px] font-semibold text-foreground/85',
            'transition-all duration-200 hover:border-foreground/25 hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.99] cursor-pointer',
          )}
        >
          <GoogleIcon className="h-4 w-4" />
          Kontynuuj z Google
        </button>

        <div className="my-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-foreground/[0.08]" />
          <span className="font-sans text-[11px] text-foreground/25">lub e-mailem</span>
          <span className="h-px flex-1 bg-foreground/[0.08]" />
        </div>

        <GlowButton size="lg" className="h-12 w-full justify-center sm:h-11" onClick={onEmail}>
          Załóż konto e-mailem
        </GlowButton>

        <button
          type="button"
          onClick={onLogowanie}
          className="mx-auto mt-3 flex min-h-11 items-center gap-1.5 font-sans text-[12px] text-foreground/40 transition-colors hover:text-foreground cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5" />
          Mam już konto — zaloguj się
        </button>

        <ol className="mt-4 grid grid-cols-3 gap-3 sm:mt-6 border-t border-foreground/[0.08] pt-4">
          {KROKI.map((k, i) => (
            <li key={k}>
              <span className="block font-mono text-[11px] tabular-nums text-primary">0{i + 1}</span>
              <span className="mt-1 block font-sans text-[11px] leading-snug text-foreground/40">{k}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
