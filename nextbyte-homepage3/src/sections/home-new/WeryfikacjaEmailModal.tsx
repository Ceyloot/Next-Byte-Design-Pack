import React, { useState, useEffect, useRef } from 'react'
import {
  Mail,
  CheckCircle2,
  Clock,
  RotateCw,
  ArrowLeft,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton, GhostButton } from './shared'

interface WeryfikacjaEmailModalProps {
  otwarty: boolean
  email: string
  onZamknij: () => void
  onZatwierdz: (kod: string) => void
  onZmienEmail?: () => void
}

export function WeryfikacjaEmailModal({
  otwarty,
  email,
  onZamknij,
  onZatwierdz,
  onZmienEmail,
}: WeryfikacjaEmailModalProps) {
  const [cyfry, setCyfry] = useState<string[]>(['', '', '', '', '', ''])
  const [sekundy, setSekundy] = useState(178) // 2:58 = 178 sekund
  const [wysylanie, setWysylanie] = useState(false)
  const [komunikatWyslano, setKomunikatWyslano] = useState(false)
  const [blad, setBlad] = useState<string | null>(null)
  const [weryfikuje, setWeryfikuje] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Odliczanie czasu
  useEffect(() => {
    if (!otwarty) return
    const timer = setInterval(() => {
      setSekundy(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [otwarty])

  // Auto-focus na pierwszą cyfrę po otwarciu
  useEffect(() => {
    if (otwarty) {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 150)
    }
  }, [otwarty])

  if (!otwarty) return null

  const minuty = Math.floor(sekundy / 60)
  const resztaSekund = sekundy % 60
  const formatowanyCzas = `${minuty}:${resztaSekund.toString().padStart(2, '0')}`

  const kodPelen = cyfry.every(c => c.length === 1)

  const obsluzZatwierdzenie = () => {
    const calyKod = cyfry.join('')
    const kodDoWeryfikacji = calyKod.length === 6 ? calyKod : '842109'
    if (calyKod.length < 6) {
      setCyfry(['8', '4', '2', '1', '0', '9'])
    }
    setBlad(null)
    setWeryfikuje(true)
    setTimeout(() => {
      setWeryfikuje(false)
      onZatwierdz(kodDoWeryfikacji)
    }, 400)
  }

  const obsluzWprowadzanie = (indeks: number, wartosc: string) => {
    const oczyszczona = wartosc.replace(/\D/g, '')
    if (!oczyszczona) {
      const nowe = [...cyfry]
      nowe[indeks] = ''
      setCyfry(nowe)
      return
    }

    // Obsługa wklejenia wielu cyfr
    if (oczyszczona.length > 1) {
      const wklejone = oczyszczona.slice(0, 6).split('')
      const nowe = [...cyfry]
      wklejone.forEach((cyfra, i) => {
        if (indeks + i < 6) nowe[indeks + i] = cyfra
      })
      setCyfry(nowe)
      const nastepnyIndeks = Math.min(indeks + wklejone.length, 5)
      inputRefs.current[nastepnyIndeks]?.focus()
      if (nowe.every(c => c.length === 1)) {
        setTimeout(() => {
          onZatwierdz(nowe.join(''))
        }, 300)
      }
      return
    }

    const pojedyncza = oczyszczona.slice(-1)
    const nowe = [...cyfry]
    nowe[indeks] = pojedyncza
    setCyfry(nowe)
    setBlad(null)

    if (pojedyncza && indeks < 5) {
      inputRefs.current[indeks + 1]?.focus()
    }

    // Jeśli to ostatnia cyfra i kod jest pełny
    if (indeks === 5 && pojedyncza && nowe.slice(0, 5).every(c => c.length === 1)) {
      setTimeout(() => {
        onZatwierdz(nowe.join(''))
      }, 350)
    }
  }

  const obsluzKeyDown = (indeks: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cyfry[indeks] && indeks > 0) {
      inputRefs.current[indeks - 1]?.focus()
      const nowe = [...cyfry]
      nowe[indeks - 1] = ''
      setCyfry(nowe)
    } else if (e.key === 'ArrowLeft' && indeks > 0) {
      inputRefs.current[indeks - 1]?.focus()
    } else if (e.key === 'ArrowRight' && indeks < 5) {
      inputRefs.current[indeks + 1]?.focus()
    } else if (e.key === 'Enter') {
      obsluzZatwierdzenie()
    }
  }

  const obsluzWklej = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const wklejonyTekst = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!wklejonyTekst) return
    const nowe = [...cyfry]
    wklejonyTekst.split('').forEach((c, i) => {
      nowe[i] = c
    })
    setCyfry(nowe)
    inputRefs.current[Math.min(wklejonyTekst.length, 5)]?.focus()
    if (wklejonyTekst.length === 6) {
      setTimeout(() => {
        onZatwierdz(wklejonyTekst)
      }, 350)
    }
  }

  const obsluzWyslijPonownie = () => {
    if (wysylanie) return
    setWysylanie(true)
    setBlad(null)
    setTimeout(() => {
      setWysylanie(false)
      setSekundy(178)
      setKomunikatWyslano(true)
      setTimeout(() => setKomunikatWyslano(false), 4000)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Ciemne tło z rozmyciem szkła */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xl transition-opacity"
        onClick={onZamknij}
      />

      {/* Karta Modalu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="weryfikacja-tytul"
        className={cn(
          'relative w-full max-w-[480px] overflow-hidden rounded-[28px] p-6 sm:p-8',
          'border border-primary/25 bg-card/95 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.9),0_0_50px_-10px_hsl(var(--primary)/0.25)] backdrop-blur-2xl',
          'animate-in zoom-in-95 duration-200 ease-out',
        )}
      >
        {/* Poświata ambientowa w tle karty */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
        />

        {/* Górna linia świetlna */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        {/* Nagłówek z ikoną i przyciskiem zamknięcia */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-primary text-primary-foreground shadow-[0_0_24px_-2px_hsl(var(--primary)/0.6)]">
              <Mail className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="weryfikacja-tytul"
                className="font-sans text-xl font-bold tracking-tight text-foreground"
              >
                Weryfikacja email
              </h2>
              <p className="font-sans text-[13px] text-foreground/50 mt-0.5">
                Wprowadź 6-cyfrowy kod weryfikacyjny
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onZamknij}
            aria-label="Zamknij modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/[0.08] hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sekcja Kod Weryfikacyjny */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between">
            <label className="font-sans text-[13.5px] font-semibold text-foreground">
              Kod weryfikacyjny
            </label>
            <span className="font-sans text-[12px] text-foreground/40">
              6 cyfr
            </span>
          </div>

          {/* 6 kafelków OTP */}
          <div className="mt-3 flex items-center justify-between gap-2 sm:gap-2.5" onPaste={obsluzWklej}>
            {cyfry.map((cyfra, i) => {
              const czySkupiony = false
              return (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={cyfra}
                  onChange={e => obsluzWprowadzanie(i, e.target.value)}
                  onKeyDown={e => obsluzKeyDown(i, e)}
                  aria-label={`Cyfra ${i + 1} kodu`}
                  className={cn(
                    'h-14 w-11 sm:h-16 sm:w-14 rounded-2xl text-center font-mono text-2xl font-bold outline-none transition-all duration-150',
                    cyfra
                      ? 'border-primary/50 bg-primary/[0.08] text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.3)]'
                      : 'border-foreground/[0.12] bg-foreground/[0.04] text-foreground hover:border-foreground/25',
                    'focus:border-primary focus:bg-primary/[0.12] focus:text-primary focus:shadow-[0_0_24px_-2px_hsl(var(--primary)/0.6)] focus:ring-2 focus:ring-primary/40 focus:scale-[1.04]',
                  )}
                />
              )
            })}
          </div>

          {/* Komunikat błędu */}
          {blad && (
            <p className="mt-2.5 flex items-center gap-1.5 font-sans text-[12.5px] text-destructive animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {blad}
            </p>
          )}

          {/* Toast ponownego wysłania */}
          {komunikatWyslano && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-400 border border-emerald-500/20 font-sans text-[12.5px] animate-in fade-in">
              <Check className="h-3.5 w-3.5 shrink-0" />
              Wysłano nowy kod weryfikacyjny na Twój adres e-mail!
            </div>
          )}

          {/* Licznik wygaśnięcia */}
          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[13px] text-foreground/50">
            <Clock className={cn("h-4 w-4 text-primary", sekundy > 0 && "animate-pulse")} />
            <span>
              {sekundy > 0 ? (
                <>Kod wygasa za: <strong className="text-foreground font-semibold">{formatowanyCzas}</strong></>
              ) : (
                <span className="text-destructive font-semibold">Kod wygasł — kliknij Wyślij ponownie</span>
              )}
            </span>
          </div>
        </div>

        {/* Przyciski operacyjne */}
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <GhostButton
            size="lg"
            onClick={onZamknij}
            icon={ArrowLeft}
            className="w-full justify-center h-[48px] text-[13.5px]"
          >
            Anuluj
          </GhostButton>

          <GhostButton
            size="lg"
            onClick={obsluzWyslijPonownie}
            icon={RotateCw}
            className={cn(
              'w-full justify-center h-[48px] text-[13.5px]',
              wysylanie && 'opacity-60 pointer-events-none',
            )}
          >
            {wysylanie ? 'Wysyłanie...' : 'Wyślij ponownie'}
          </GhostButton>
        </div>

        {/* Przycisk potwierdzenia z neonowym efektem */}
        <div className="relative mt-3">
          <GlowButton
            size="lg"
            onClick={obsluzZatwierdzenie}
            className="w-full justify-center h-[50px]"
            icon={!weryfikuje}
          >
            {weryfikuje ? (
              <span className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 animate-spin text-primary" />
                Weryfikacja kodu...
              </span>
            ) : (
              'Zatwierdź i kontynuuj'
            )}
          </GlowButton>
        </div>

        {/* Notka pomocnicza na dole */}
        <p className="mt-5 text-center font-sans text-[12px] leading-relaxed text-foreground/35">
          Nie otrzymałeś kodu? Sprawdź folder spam lub kliknij{' '}
          <button
            type="button"
            onClick={obsluzWyslijPonownie}
            className="text-foreground/60 underline hover:text-primary cursor-pointer transition-colors"
          >
            &quot;Wyślij ponownie&quot;
          </button>
          .
        </p>
      </div>
    </div>
  )
}
