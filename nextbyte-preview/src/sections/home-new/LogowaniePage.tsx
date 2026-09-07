import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Mail, Lock, Eye, EyeOff, Check, X, User, AlertCircle, ShieldCheck } from 'lucide-react'
import { AnimStyles, FadeIn, GlowButton } from './shared'
import { WeryfikacjaEmailModal } from './WeryfikacjaEmailModal'
import { OnboardingFlow } from './OnboardingFlow'

/* ═══════════════════════════════════════════════════════════════════════
   PANEL LOGOWANIA / REJESTRACJI

   Makieta do design systemu — formularz jest CELOWO bezczynny: pola trzymają
   stan tylko lokalnie, a „Kontynuuj" i logowanie Google nic nie wysyłają.
   To podgląd wyglądu, nie działający mechanizm uwierzytelniania.

   Płynne animacje rozsuwania i zsuwania (FLUID ACCORDION & MORPH):
   - Płynne rozszerzanie i zwężanie karty (452px <-> 880px) z krzywą cubic-bezier
   - Ślizgająca się pigułka przełącznika Logowanie / Rejestracja
   - Płynne przejście pionowe nagłówka ("Witaj ponownie" <-> "Dołącz do ekosystemu...")
   - Płynne rozsuwanie/zsuwanie prawej kolumny (zgody + akcje) bez łamania tekstu
   - Płynne rozsuwanie pól rejestracji (Imię, Nazwisko, Potwierdź hasło)
   - Płynne rozwijanie checklisty wymagań hasła przy wpisywaniu
   - Płynne rozwijanie komunikatu błędu niezgodności haseł
   ═══════════════════════════════════════════════════════════════════════ */

type Tryb = 'logowanie' | 'rejestracja'

const DOKUMENTY = ['Regulamin', 'Polityka prywatności', 'Cookies'] as const

/* Wzorce, które same w sobie przekreślają hasło niezależnie od reszty reguł. */
/* Rozstaw kropek zgodności: kropka 8px (w-2) + odstęp 6px (gap-1.5).
   Własna karetka pozycjonuje się z tej samej liczby, więc zawsze stoi
   dokładnie tam, gdzie jest kursor w polu. */
const KROPKA_SKOK = 14

const KOLOR_OK = 'text-emerald-500'
const TLO_OK = 'bg-emerald-500'
const OBRYS_OK = 'ring-emerald-500/50'

const POPULARNE_WZORCE = ['123456', 'password', 'haslo', 'qwerty', 'admin', '111111', 'iloveyou']

/** Lista wymagań hasła wraz z informacją, które są już spełnione. */
function wymaganiaHasla(h: string) {
  return [
    { t: 'Co najmniej 12 znaków',                        ok: h.length >= 12 },
    { t: 'Co najmniej jedna wielka litera (A-Z)',        ok: /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(h) },
    { t: 'Co najmniej jedna mała litera (a-z)',          ok: /[a-ząćęłńóśźż]/.test(h) },
    { t: 'Co najmniej jedna cyfra (0-9)',                ok: /[0-9]/.test(h) },
    { t: 'Co najmniej jeden znak specjalny (!@#$%^&*)',  ok: /[!@#$%^&*]/.test(h) },
    { t: 'Brak popularnych wzorców (123456, password, itp.)',
      ok: h.length > 0 && !POPULARNE_WZORCE.some(w => h.toLowerCase().includes(w)) },
    { t: 'Maksymalnie 2 identyczne znaki pod rząd',      ok: h.length > 0 && !/(.)\1{2,}/.test(h) },
  ]
}

/** Logo Google — jedyne miejsce ze stałymi barwami, bo to cudzy znak firmowy. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.6 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.2-10.1 7.2-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

/** Pole tekstowe z ikoną wiodącą i opcjonalnym slotem po prawej. */
function Pole({
  icon: Icon, typ, placeholder, wartosc, onChange, prawy,
}: {
  icon: React.ElementType
  typ: string
  placeholder: string
  wartosc: string
  onChange: (v: string) => void
  prawy?: React.ReactNode
}) {
  return (
    <div className="group relative flex items-center rounded-2xl bg-foreground/[0.04] ring-1 ring-inset ring-foreground/[0.07] transition-all duration-200 focus-within:bg-foreground/[0.06] focus-within:ring-primary/45">
      <Icon className="pointer-events-none absolute left-4 h-[17px] w-[17px] text-foreground/30 transition-colors group-focus-within:text-primary" />
      <input
        type={typ}
        placeholder={placeholder}
        value={wartosc}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'h-[52px] w-full bg-transparent pl-12 font-sans text-[14.5px] text-foreground outline-none',
          'placeholder:text-foreground/30',
          prawy ? 'pr-12' : 'pr-4',
        )}
      />
      {prawy && <div className="absolute right-3 flex items-center">{prawy}</div>}
    </div>
  )
}

/** Wiersz zgody: interaktywny kafelek z oznaczeniem tylko dla wymaganych */
function Zgoda({
  zaznaczona,
  onZmien,
  tytul,
  status,
  opis,
}: {
  zaznaczona: boolean
  onZmien: () => void
  tytul: React.ReactNode
  status?: 'wymagana' | 'opcjonalna'
  opis: React.ReactNode
}) {
  const jestWymagana = status === 'wymagana'

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={zaznaczona}
      onClick={onZmien}
      className={cn(
        'group flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all duration-150 cursor-pointer select-none',
        'border',
        zaznaczona
          ? 'border-primary/30 bg-primary/[0.04]'
          : 'border-foreground/[0.07] bg-foreground/[0.015] hover:border-foreground/[0.16] hover:bg-foreground/[0.03]',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] transition-all duration-200',
          zaznaczona
            ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.8)]'
            : 'bg-foreground/[0.06] ring-1 ring-inset ring-foreground/15 group-hover:ring-foreground/30',
        )}
      >
        {zaznaczona && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans text-[13px] font-semibold text-foreground tracking-tight">
            {tytul}
          </span>
          {jestWymagana && (
            <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider bg-foreground/[0.06] text-foreground/50 border border-foreground/[0.09]">
              Wymagane
            </span>
          )}
        </div>
        <div className="mt-1 font-sans text-[12px] leading-relaxed text-foreground/50">
          {opis}
        </div>
      </div>
    </button>
  )
}

export function LogowaniePage() {
  const [tryb, setTryb] = useState<Tryb>('logowanie')
  const [animuje, setAnimuje] = useState(false)
  const [email, setEmail] = useState('')
  const [haslo, setHaslo] = useState('')
  const [pokazHaslo, setPokazHaslo] = useState(false)
  const [zapamietaj, setZapamietaj] = useState(false)

  // Pola wyłącznie rejestracyjne
  const [imie, setImie] = useState('')
  const [nazwisko, setNazwisko] = useState('')
  const [haslo2, setHaslo2] = useState('')
  const [pokazHaslo2, setPokazHaslo2] = useState(false)
  const [zakres, setZakres] = useState({ od: 0, do: 0 })
  const [skupione, setSkupione] = useState(false)
  const [zgody, setZgody] = useState({ regulamin: false, marketing: false, ciasteczka: false })

  // Ekrany po rejestracji (Weryfikacja kodem OTP + Onboarding)
  type WidokEkranu = 'formularz' | 'onboarding'
  const [aktywnyWidok, setAktywnyWidok] = useState<WidokEkranu>('formularz')
  const [pokazModalWeryfikacji, setPokazModalWeryfikacji] = useState(false)
  const [onboardingKrok, setOnboardingKrok] = useState<1 | 2 | 3>(1)

  const logowanie = tryb === 'logowanie'
  const wymagania = wymaganiaHasla(haslo)
  const spelnioneWymogi = wymagania.filter(w => w.ok).length
  const hasloPoprawne = wymagania.every(w => w.ok)
  const zgodneHasla = haslo2.length > 0 && haslo2 === haslo
  const emailPoprawny = email.trim().length > 0 && email.includes('@')
  const daneOsobowePoprawne = imie.trim().length > 0 && nazwisko.trim().length > 0

  const wszystkieWarunkiSpelnione =
    emailPoprawny &&
    daneOsobowePoprawne &&
    hasloPoprawne &&
    zgodneHasla &&
    zgody.regulamin

  const [pokazBladWalidacji, setPokazBladWalidacji] = useState(false)

  const obsluzUtworzKonto = () => {
    if (!wszystkieWarunkiSpelnione) {
      setPokazBladWalidacji(true)
      return
    }
    setPokazBladWalidacji(false)
    setPokazModalWeryfikacji(true)
  }

  const zmienTryb = (nowy: Tryb) => {
    if (nowy === tryb) return
    setTryb(nowy)
    setAnimuje(true)
  }

  useEffect(() => {
    if (!animuje) return
    const t = setTimeout(() => setAnimuje(false), 100)
    return () => clearTimeout(t)
  }, [animuje, tryb])

  /** Przepisuje zaznaczenie z pola do stanu — stąd rysujemy karetkę i podświetlenie. */
  const czytajZakres = (el: HTMLInputElement) =>
    setZakres({ od: el.selectionStart ?? 0, do: el.selectionEnd ?? 0 })

  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-16 font-landing text-foreground sm:px-6 sm:py-20">
      <AnimStyles />

      {/* Siatka techniczna — ten sam skok 60px co siatka tła aplikacji */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)/0.055) 1px, transparent 1px),' +
            'linear-gradient(90deg, hsl(var(--foreground)/0.055) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 15%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 15%, transparent 80%)',
        }}
      />

      {/* Poziom światła za kartą */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[26%] h-[420px] w-[900px] max-w-[100vw] -translate-x-1/2 blur-3xl"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary)/0.18) 0%, transparent 72%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[6%] h-[280px] w-[520px] max-w-[92vw] -translate-x-1/2 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, hsl(var(--primary)/0.08) 0%, transparent 70%)' }}
      />

      {/* Widok Onboardingu */}
      {aktywnyWidok === 'onboarding' ? (
        <OnboardingFlow
          key={onboardingKrok}
          poczatkowyKrok={onboardingKrok}
          onWrocDoFormularza={() => setAktywnyWidok('formularz')}
          onZakoncz={() => setAktywnyWidok('formularz')}
        />
      ) : (
        /* Kontener wejścia na scroll (Formularz) */
        <FadeIn className="relative z-10 flex w-full flex-col items-center">
        {/* Główna karta — dynamicznie rozsuwa się horyzontalnie z 452px do 880px bez teleportacji */}
        <div
          className={cn(
            'relative w-full transition-[max-width] duration-[100ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            logowanie ? 'max-w-[452px]' : 'max-w-[880px]',
          )}
        >
          {/* Gradientowa obwódka */}
          <div
            className="relative rounded-[26px] p-px shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.45)]"
            style={{
              background:
                'linear-gradient(180deg, hsl(var(--primary)/0.5), hsl(var(--foreground)/0.08) 38%, hsl(var(--foreground)/0.03))',
            }}
          >
            <div
              className="relative overflow-hidden rounded-[25px] px-7 py-8 backdrop-blur-xl sm:px-9 sm:py-10"
              style={{
                background:
                  'radial-gradient(130% 70% at 50% -8%, hsl(var(--primary)/0.14), transparent 60%),' +
                  'linear-gradient(180deg, hsl(var(--card)/0.96), hsl(var(--card)/0.9))',
              }}
            >
              {/* Nagłówek ze zgrabnym pionowym przejściem */}
              <div className="relative h-8 sm:h-9 overflow-hidden">
                <h1
                  className={cn(
                    'font-heading text-[24px] sm:text-[27px] font-bold leading-[1.14] tracking-[-1px] text-foreground transition-all duration-[80ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                    logowanie
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0 pointer-events-none absolute inset-x-0 top-0',
                  )}
                >
                  Witaj ponownie
                </h1>
                <h1
                  className={cn(
                    'font-heading text-[24px] sm:text-[27px] font-bold leading-[1.14] tracking-[-1px] text-foreground transition-all duration-[80ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                    !logowanie
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-full opacity-0 pointer-events-none absolute inset-x-0 top-0',
                  )}
                >
                  Dołącz do ekosystemu NextByte
                </h1>
              </div>

              {/* Przełącznik trybu — dynamicznie ślizgająca się sprężysta pigułka */}
              <div
                className={cn(
                  'relative mt-6 grid grid-cols-2 gap-1 rounded-xl border border-foreground/[0.12] bg-[hsl(var(--card)/0.7)] p-1 shadow-inner backdrop-blur-md transition-all duration-[80ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                  logowanie ? 'max-w-[380px]' : 'max-w-[340px]',
                )}
              >
                {/* Dynamiczna pigułka stanu aktywnego */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-1 bottom-1 rounded-lg border border-primary/45 bg-[hsl(var(--primary)/0.14)] shadow-[0_0_16px_-2px_hsl(var(--primary)/0.25)] backdrop-blur-sm transition-all duration-[70ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    left: tryb === 'logowanie' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)',
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent"
                  />
                </div>

              {(['logowanie', 'rejestracja'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => zmienTryb(t)}
                  aria-pressed={tryb === t}
                  className={cn(
                    'relative z-10 overflow-hidden rounded-lg py-2.5 font-heading text-[13.5px] capitalize transition-colors duration-200 cursor-pointer text-center',
                    tryb === t
                      ? 'font-semibold text-foreground'
                      : 'font-normal text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Układ kolumn: na desktopie/tablecie rozsuwa się horyzontalnie, na mobile pionowo */}
            <div className="mt-5 flex flex-col items-start md:flex-row">
              {/* ── LEWA KOLUMNA: podstawowe pola + rozwijane pola rejestracji + akcje logowania ── */}
              <div className="w-full shrink-0 md:w-[380px]">
                {/* Stałe pola: Email i Hasło */}
                <div className="space-y-3">
                  <Pole
                    icon={Mail}
                    typ="email"
                    placeholder="twoj@email.com"
                    wartosc={email}
                    onChange={setEmail}
                  />
                  <Pole
                    icon={Lock}
                    typ={pokazHaslo ? 'text' : 'password'}
                    placeholder={logowanie ? 'Twoje hasło' : 'Ustaw hasło'}
                    wartosc={haslo}
                    onChange={setHaslo}
                    prawy={
                      <button
                        type="button"
                        onClick={() => setPokazHaslo(v => !v)}
                        aria-label={pokazHaslo ? 'Ukryj hasło' : 'Pokaż hasło'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:text-foreground/80 cursor-pointer"
                      >
                        {pokazHaslo ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                      </button>
                    }
                  />
                </div>

                {/* Rozsuwane pola wyłącznie rejestracyjne (Imię, Nazwisko, Potwierdź hasło, Wymagania) */}
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-[90ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    gridTemplateRows: !logowanie ? '1fr' : '0fr',
                    opacity: !logowanie ? 1 : 0,
                  }}
                  inert={logowanie ? true : undefined}
                >
                  <div className={cn("min-h-0 pt-3", !logowanie && !animuje ? "overflow-visible" : "overflow-hidden")}>
                    <div className="grid grid-cols-2 gap-3">
                      <Pole icon={User} typ="text" placeholder="Imię" wartosc={imie} onChange={setImie} />
                      <Pole icon={User} typ="text" placeholder="Nazwisko" wartosc={nazwisko} onChange={setNazwisko} />
                    </div>

                    {/* Potwierdzenie hasła z kropkami zgodności */}
                    <div className="mt-3">
                      <div
                        className={cn(
                          'group relative flex items-center rounded-2xl bg-foreground/[0.04] ring-1 ring-inset transition-all duration-200',
                          haslo2.length === 0
                            ? 'ring-foreground/[0.07] focus-within:ring-primary/45'
                            : zgodneHasla
                              ? OBRYS_OK
                              : 'ring-destructive/60',
                        )}
                      >
                        <Lock className="pointer-events-none absolute left-4 h-[17px] w-[17px] text-foreground/30 transition-colors group-focus-within:text-primary" />
                        <input
                          type={pokazHaslo2 ? 'text' : 'password'}
                          placeholder="Potwierdź hasło"
                          value={haslo2}
                          onChange={e => { setHaslo2(e.target.value); czytajZakres(e.target) }}
                          onSelect={e => czytajZakres(e.target as HTMLInputElement)}
                          onKeyUp={e => czytajZakres(e.target as HTMLInputElement)}
                          onClick={e => czytajZakres(e.target as HTMLInputElement)}
                          onMouseUp={e => czytajZakres(e.target as HTMLInputElement)}
                          onFocus={e => { setSkupione(true); czytajZakres(e.target) }}
                          onBlur={() => setSkupione(false)}
                          className={cn(
                            'h-[52px] w-full bg-transparent pl-12 pr-12 font-sans text-[14.5px] outline-none placeholder:text-foreground/30',
                            pokazHaslo2 || haslo2.length === 0 ? 'caret-primary' : 'caret-transparent',
                            pokazHaslo2 || haslo2.length === 0
                              ? 'text-foreground'
                              : 'text-transparent selection:bg-transparent selection:text-transparent',
                          )}
                        />

                        {!pokazHaslo2 && haslo2.length > 0 && (
                          <div className="pointer-events-none absolute left-12 flex items-center gap-1.5">
                            {haslo2.split('').map((z, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'h-2 w-2 rounded-full transition-transform duration-150',
                                  z === haslo[i] ? TLO_OK : 'bg-destructive',
                                )}
                              />
                            ))}
                            {skupione && zakres.do > zakres.od && (
                              <span
                                aria-hidden
                                className="absolute top-1/2 h-[22px] -translate-y-1/2 rounded-[3px] bg-primary/25 transition-all duration-150 ease-out"
                                style={{
                                  left: zakres.od * KROPKA_SKOK - 3,
                                  width: (zakres.do - zakres.od) * KROPKA_SKOK,
                                }}
                              />
                            )}
                            {skupione && zakres.do === zakres.od && (
                              <span
                                aria-hidden
                                className="nb-blink absolute top-1/2 h-[18px] w-px -translate-y-1/2 bg-primary transition-[left] duration-150 ease-out"
                                style={{ left: zakres.od * KROPKA_SKOK - 3 }}
                              />
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setPokazHaslo2(v => !v)}
                          aria-label={pokazHaslo2 ? 'Ukryj hasło' : 'Pokaż hasło'}
                          className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:text-foreground/80 cursor-pointer"
                        >
                          {pokazHaslo2 ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                        </button>
                      </div>

                      {/* Płynnie rozsuwany błąd niezgodności haseł — idealnie symetryczny w obie strony */}
                      <div
                        className="grid transition-[grid-template-rows,opacity] duration-[70ms] ease-[cubic-bezier(0.35,0,0.65,1)]"
                        style={{
                          gridTemplateRows: haslo2.length > 0 && !zgodneHasla ? '1fr' : '0fr',
                          opacity: haslo2.length > 0 && !zgodneHasla ? 1 : 0,
                        }}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <p className="pt-2 flex items-center gap-1.5 font-sans text-[12.5px] text-destructive">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Hasła jeszcze się nie zgadzają
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zgody rejestracyjne (pod powtórz hasło) */}
                    <div className="mt-4 space-y-2.5">
                      <Zgoda
                        zaznaczona={zgody.regulamin}
                        onZmien={() => setZgody(z => ({ ...z, regulamin: !z.regulamin }))}
                        tytul="Regulamin i prywatność"
                        status="wymagana"
                        opis={
                          <>
                            Akceptuję{' '}
                            <span
                              onClick={e => e.stopPropagation()}
                              className="text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer font-medium"
                            >
                              Regulamin
                            </span>{' '}
                            oraz{' '}
                            <span
                              onClick={e => e.stopPropagation()}
                              className="text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer font-medium"
                            >
                              Politykę prywatności
                            </span>
                            .
                          </>
                        }
                      />

                      <Zgoda
                        zaznaczona={zgody.marketing}
                        onZmien={() => setZgody(z => ({ ...z, marketing: !z.marketing }))}
                        tytul="Komunikacja i nowości"
                        status="opcjonalna"
                        opis="Informacje o aktualizacjach modeli i poradach. Zgodę cofniesz w każdej chwili."
                      />

                      <Zgoda
                        zaznaczona={zgody.ciasteczka}
                        onZmien={() => setZgody(z => ({ ...z, ciasteczka: !z.ciasteczka }))}
                        tytul="Ciasteczka analityczne"
                        status="opcjonalna"
                        opis="Optymalizacja serwisu i personalizacja. Bez nich platforma działa tak samo."
                      />
                    </div>
                  </div>
                </div>

                {/* Rozsuwana / zsuwana sekcja akcji wyłącznie dla Logowania (w lewej kolumnie) */}
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-[90ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    gridTemplateRows: logowanie ? '1fr' : '0fr',
                    opacity: logowanie ? 1 : 0,
                  }}
                  inert={!logowanie ? true : undefined}
                >
                  <div className={cn("min-h-0 px-2 -mx-2 py-2 -my-2", logowanie && !animuje ? "overflow-visible" : "overflow-hidden")}>
                    {/* Zapamiętaj + reset hasła */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={zapamietaj}
                        onClick={() => setZapamietaj(v => !v)}
                        className="group flex items-center gap-2.5 font-sans text-[13px] text-foreground/55 transition-colors hover:text-foreground/85 cursor-pointer"
                      >
                        <span
                          className={cn(
                            'flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[6px] transition-all duration-200',
                            zapamietaj
                              ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-2px_hsl(var(--primary)/0.8)]'
                              : 'bg-foreground/[0.06] ring-1 ring-inset ring-foreground/15 group-hover:ring-foreground/30',
                          )}
                        >
                          {zapamietaj && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        Zapamiętaj na 30 dni
                      </button>

                      <button
                        type="button"
                        className="font-sans text-[13px] text-foreground/50 transition-colors hover:text-primary cursor-pointer"
                      >
                        Nie pamiętasz hasła?
                      </button>
                    </div>

                    {/* CTA Logowania */}
                    <div className="relative z-10 mt-6">
                      <GlowButton size="lg" className="h-[52px] w-full justify-center">
                        Zaloguj się
                      </GlowButton>
                    </div>

                    {/* Separator */}
                    <div className="my-5 flex items-center gap-4">
                      <span className="h-px flex-1 bg-foreground/[0.07]" />
                      <span className="font-sans text-[11.5px] text-foreground/30">lub</span>
                      <span className="h-px flex-1 bg-foreground/[0.07]" />
                    </div>

                    {/* Google button */}
                    <button
                      type="button"
                      className={cn(
                        'group relative flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-xl',
                        'border border-foreground/[0.14] bg-card/75 font-sans text-[14.5px] font-semibold text-foreground/90 backdrop-blur-xl',
                        'shadow-[0_2px_12px_-2px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                        'transition-all duration-200 ease-out hover:border-foreground/[0.28] hover:bg-card hover:text-foreground hover:scale-[1.015] active:scale-[0.98] cursor-pointer',
                      )}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent transition-all duration-200 group-hover:via-foreground/30"
                      />
                      <GoogleMark className="h-[18px] w-[18px]" />
                      Kontynuuj z Google
                    </button>
                  </div>
                </div>
              </div>

              {/* ── PRAWA KOLUMNA (REJESTRACJA): Płynnie rozsuwana na desktopie i mobile ── */}
              <div
                className={cn(
                  'transition-all duration-[100ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                  logowanie
                    ? 'overflow-hidden md:w-0 md:pl-0 md:opacity-0 md:pointer-events-none md:translate-x-6 max-md:grid max-md:grid-rows-[0fr] max-md:opacity-0 max-md:pointer-events-none'
                    : cn(
                        'md:w-[412px] md:pl-8 md:opacity-100 md:translate-x-0 md:pointer-events-auto max-md:grid max-md:grid-rows-[1fr] max-md:opacity-100 max-md:pt-5',
                        !animuje ? 'overflow-visible' : 'overflow-hidden',
                      ),
                )}
                inert={logowanie ? true : undefined}
              >
                <div className={cn("min-h-0 w-full md:w-[380px] px-2 -mx-2 py-2 -my-2 flex flex-col", !logowanie && !animuje ? "overflow-visible" : "overflow-hidden")}>
                  {/* Sekcja wymagań hasła i bezpieczeństwa — wariant ghost (bez ramki i tła kafelka) */}
                  <div className="px-1 py-0.5">
                    <div className="flex items-center justify-between pb-3 border-b border-foreground/[0.08]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={cn("h-4 w-4 shrink-0 transition-colors duration-200", spelnioneWymogi === 7 ? "text-emerald-500" : "text-primary")} />
                        <span className="font-sans text-[13.5px] font-semibold text-foreground tracking-tight">Wymagania hasła</span>
                      </div>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold transition-colors duration-200",
                        spelnioneWymogi === 7
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-foreground/[0.06] text-foreground/50 border border-foreground/[0.08]"
                      )}>
                        {spelnioneWymogi} / 7
                      </span>
                    </div>

                    {/* Dynamiczny pasek postępu siły hasła */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                      <div
                        className={cn(
                          "h-full transition-all duration-300 ease-out",
                          spelnioneWymogi === 7
                            ? "bg-emerald-500 shadow-[0_0_10px_hsl(142_70%_45%/0.7)]"
                            : spelnioneWymogi >= 4
                            ? "bg-sky-400 shadow-[0_0_8px_hsl(199_89%_48%/0.5)]"
                            : "bg-primary/80",
                        )}
                        style={{ width: `${Math.max((spelnioneWymogi / 7) * 100, haslo.length > 0 ? 8 : 0)}%` }}
                      />
                    </div>

                    {/* Lista kryteriów */}
                    <ul className="mt-3.5 space-y-2">
                      {wymagania.map(w => (
                        <li
                          key={w.t}
                          className={cn(
                            'flex items-center gap-2.5 font-sans text-[12.5px] transition-colors duration-200',
                            w.ok ? 'text-emerald-400 font-medium' : 'text-foreground/45',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-200',
                              w.ok
                                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_-1px_hsl(142_70%_45%/0.6)] ring-1 ring-emerald-500/40'
                                : 'bg-foreground/[0.06] text-foreground/30',
                            )}
                          >
                            {w.ok ? (
                              <Check className="h-2.5 w-2.5 stroke-[3.5]" />
                            ) : (
                              <span className="h-1 w-1 rounded-full bg-current" />
                            )}
                          </span>
                          <span className="leading-tight">{w.t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Rejestracji */}
                  <div className="relative z-10 mt-6">
                    {pokazBladWalidacji && !wszystkieWarunkiSpelnione && (
                      <div className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-[12.5px] text-destructive border border-destructive/20 font-sans animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>
                          {!daneOsobowePoprawne
                            ? 'Wpisz imię i nazwisko.'
                            : !emailPoprawny
                            ? 'Podaj poprawny adres e-mail.'
                            : !hasloPoprawne
                            ? 'Spełnij wszystkie wymagania dotyczące hasła.'
                            : !zgodneHasla
                            ? 'Hasła w obu polach muszą być identyczne.'
                            : !zgody.regulamin
                            ? 'Zaakceptuj Regulamin oraz Politykę prywatności.'
                            : 'Uzupełnij wymagane pola.'}
                        </span>
                      </div>
                    )}
                    <GlowButton
                      size="lg"
                      className="h-[52px] w-full justify-center"
                      onClick={obsluzUtworzKonto}
                    >
                      Utwórz konto
                    </GlowButton>
                  </div>

                  {/* Separator */}
                  <div className="my-3.5 flex items-center gap-4">
                    <span className="h-px flex-1 bg-foreground/[0.07]" />
                    <span className="font-sans text-[11.5px] text-foreground/30">lub</span>
                    <span className="h-px flex-1 bg-foreground/[0.07]" />
                  </div>

                  {/* Google button */}
                  <button
                    type="button"
                    className={cn(
                      'group relative flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-xl',
                      'border border-foreground/[0.14] bg-card/75 font-sans text-[14.5px] font-semibold text-foreground/90 backdrop-blur-xl',
                      'shadow-[0_2px_12px_-2px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                      'transition-all duration-200 ease-out hover:border-foreground/[0.28] hover:bg-card hover:text-foreground hover:scale-[1.015] active:scale-[0.98] cursor-pointer',
                    )}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent transition-all duration-200 group-hover:via-foreground/30"
                    />
                    <GoogleMark className="h-[18px] w-[18px]" />
                    Kontynuuj z Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Pod kartą: zapewnienie o bezpieczeństwie, dokumenty, prawa autorskie */}
        <p className="mt-6 text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-foreground/30">
          Szyfrowanie AES-256 · Serwery w UE
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {DOKUMENTY.map(t => (
            <button
              key={t}
              type="button"
              className="font-sans text-[12px] text-foreground/35 transition-colors duration-200 hover:text-foreground/70 cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>

        <p className="mt-5 text-center font-sans text-[11.5px] text-foreground/25">
          © 2025 – 2026 NextByte
        </p>
      </FadeIn>
      )}

      {/* Modal Weryfikacji Email z kodem OTP */}
      <WeryfikacjaEmailModal
        otwarty={pokazModalWeryfikacji}
        email={email}
        onZamknij={() => setPokazModalWeryfikacji(false)}
        onZatwierdz={(kod) => {
          setPokazModalWeryfikacji(false)
          setAktywnyWidok('onboarding')
          setOnboardingKrok(1)
        }}
      />
    </div>
  )
}
