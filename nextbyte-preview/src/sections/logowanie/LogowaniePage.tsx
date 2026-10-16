import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Mail, Lock, Eye, EyeOff, Check, User, AlertCircle, ArrowLeft, ArrowRight, Building2 } from 'lucide-react'
import { AnimStyles, GlowButton } from '@/sections/wspolne/shared'
import { WeryfikacjaEmailModal } from './WeryfikacjaEmailModal'
import { Onboarding } from './Onboarding'

/* ═══════════════════════════════════════════════════════════════════════
   LOGOWANIE / REJESTRACJA — maksymalny minimalizm
   Bez karty, bez ramek, bez szyny bocznej: jedna wyśrodkowana kolumna
   wprost na tle strony. Cała dekoracja zdjęta, zostaje sama ścieżka
   do założenia konta.
   ═══════════════════════════════════════════════════════════════════════ */

type Tryb = 'logowanie' | 'rejestracja'

/* Przełączanie trybów zmienia zestaw pól, a kolumna jest wyśrodkowana, więc
   każde skokowe pojawienie/zniknięcie podrzucało całą stronę. Zamiast mierzyć
   wysokość kolumny w JS (to animowało tylko wejście — pola znikały natychmiast,
   a przejście dojeżdżało już nad pustką) każdy blok zależny od trybu chowa się
   sam. Grid z `grid-template-rows: 0fr → 1fr` daje animowalną wysokość „auto"
   w obie strony, więc wysokość kolumny płynie za treścią do samego końca. */
function Rozwijane({
  otwarte, children, className,
}: {
  otwarte: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      aria-hidden={!otwarte}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        otwarte ? 'opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
      style={{ gridTemplateRows: otwarte ? '1fr' : '0fr' }}
    >
      {/* min-h-0 jest konieczne: element gridu ma domyślnie min-height:auto,
          co blokuje zjazd wiersza poniżej wysokości treści. */}
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

const DOKUMENTY = ['Regulamin', 'Polityka prywatności', 'Cookies'] as const
const OBRYS_OK = 'ring-primary/45'
const POPULARNE_WZORCE = ['123456', 'password', 'haslo', 'qwerty', 'admin', '111111', 'iloveyou']

/* `krotki` służy do sklejenia listy braków w jedno zdanie — pełna lista
   siedmiu reguł jako stały element była zbyt hałaśliwa. */
function wymaganiaHasla(h: string) {
  return [
    { krotki: '12 znaków',             ok: h.length >= 12 },
    { krotki: 'wielka litera',         ok: /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(h) },
    { krotki: 'mała litera',           ok: /[a-ząćęłńóśźż]/.test(h) },
    { krotki: 'cyfra',                 ok: /[0-9]/.test(h) },
    { krotki: 'znak specjalny',        ok: /[!@#$%^&*]/.test(h) },
    { krotki: 'bez popularnych wzorców',
      ok: h.length > 0 && !POPULARNE_WZORCE.some(w => h.toLowerCase().includes(w)) },
    { krotki: 'maks. 2 te same znaki pod rząd', ok: h.length > 0 && !/(.)\1{2,}/.test(h) },
  ]
}

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

function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

function MicrosoftMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  )
}

/** Przycisk metody rejestracji — ten sam obrys co „Kontynuuj z Google”. */
function PrzyciskMetody({ ikona, tekst, onClick }: { ikona: React.ReactNode; tekst: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex h-11 w-full items-center justify-center gap-2.5 rounded-xl',
        'border border-foreground/[0.12] bg-foreground/[0.03] font-sans text-[14px] font-semibold text-foreground/85',
        'transition-all duration-200 hover:border-foreground/25 hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.99] cursor-pointer',
      )}
    >
      {ikona}
      {tekst}
      <ArrowRight className="absolute right-4 h-3.5 w-3.5 text-foreground/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/50" />
    </button>
  )
}

/** Bonus za firmowy e-mail — znak Byte rysuje się w pętli, kwota w mono. */
function BonusFirmowy() {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-primary/30 bg-primary/[0.07] px-3.5 py-3">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent" />
      <svg viewBox="-70 -110 140 220" className="h-7 w-5 shrink-0 overflow-visible" fill="none" aria-hidden>
        <path d="M 55,0 L 0,-100 L -55,0 L 0,100 L 55,0 L -55,0" stroke="hsl(var(--primary))" strokeWidth={12} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="570" style={{ animation: 'nbBonusRysuj 2.8s cubic-bezier(.4,0,.2,1) infinite' }} />
      </svg>
      <style>{`@keyframes nbBonusRysuj { 0% { stroke-dashoffset: 570 } 45%, 80% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: -570 } }
        @media (prefers-reduced-motion: reduce) { [style*="nbBonusRysuj"] { animation: none !important } }`}</style>
      <p className="flex-1 font-sans text-[13px] leading-snug text-foreground/80">
        Zarejestruj się <span className="font-semibold text-foreground">firmowym e-mailem</span>, a dostaniesz Byte na start.
      </p>
      <span className="shrink-0 font-mono text-[13px] font-bold text-primary">+50 ⟠</span>
    </div>
  )
}

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
    <div className="group relative flex items-center rounded-xl bg-foreground/[0.035] ring-1 ring-inset ring-foreground/[0.08] transition-all duration-200 focus-within:bg-foreground/[0.055] focus-within:ring-primary/45">
      <Icon className="pointer-events-none absolute left-3.5 h-4 w-4 text-foreground/30 transition-colors group-focus-within:text-primary" />
      <input
        type={typ}
        placeholder={placeholder}
        value={wartosc}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'h-11 w-full bg-transparent pl-10 font-sans text-[14px] text-foreground outline-none placeholder:text-foreground/30',
          prawy ? 'pr-10' : 'pr-3.5',
        )}
      />
      {prawy && <div className="absolute right-2.5 flex items-center">{prawy}</div>}
    </div>
  )
}

function Zgoda({
  zaznaczona, onZmien, tekst, wymagana,
}: {
  zaznaczona: boolean
  onZmien: () => void
  tekst: React.ReactNode
  wymagana?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={zaznaczona}
      onClick={onZmien}
      className="group flex w-full items-center gap-2.5 py-0.5 text-left transition-colors cursor-pointer select-none"
    >
      <span className={cn(
        'flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] transition-all duration-200',
        zaznaczona
          ? 'bg-primary text-primary-foreground'
          : 'bg-foreground/[0.06] ring-1 ring-inset ring-foreground/20 group-hover:ring-foreground/40',
      )}>
        {zaznaczona && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      <span className="flex-1 font-sans text-[12.5px] leading-snug text-foreground/55">{tekst}</span>
      {wymagana && (
        <span className="shrink-0 font-sans text-[10.5px] text-foreground/30">wymagane</span>
      )}
    </button>
  )
}

/* Przełącznik trybu — 1:1 ze stylem przełącznika okresu z Cennika:
   obramowanie i tło karty na kontenerze, wskaźnik z poświatą primary
   i świetlną krawędzią u góry, aktywna etykieta biała (nie niebieska).
   Oba segmenty są równej szerokości, więc wskaźnik przesuwa się o własną
   szerokość — Cennik mierzy przyciski, bo tam etykiety mają różną długość. */
function PrzelacznikTrybu({ tryb, onZmien }: { tryb: Tryb; onZmien: (t: Tryb) => void }) {
  return (
    <div className="relative flex h-10 w-full items-center rounded-xl border border-foreground/[0.12] bg-[hsl(var(--card)/0.7)] p-1 shadow-inner backdrop-blur-md">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg border border-primary/45 bg-[hsl(var(--primary)/0.14)] shadow-[0_0_16px_-2px_hsl(var(--primary)/0.25)] backdrop-blur-sm"
        style={{
          transform: tryb === 'logowanie' ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent" />
      </span>

      {(['logowanie', 'rejestracja'] as Tryb[]).map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onZmien(t)}
          aria-pressed={tryb === t}
          className={cn(
            'relative z-10 flex h-full flex-1 basis-0 items-center justify-center rounded-lg font-heading text-[13px] transition-colors duration-200 cursor-pointer select-none',
            tryb === t
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground font-normal',
          )}
        >
          {t === 'logowanie' ? 'Logowanie' : 'Rejestracja'}
        </button>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   GŁÓWNY KOMPONENT
   ══════════════════════════════════════════════════════ */
export function LogowaniePage({ initialTryb = 'logowanie' }: { initialTryb?: Tryb }) {
  const [tryb, setTryb] = useState<Tryb>(initialTryb)
  const [email, setEmail] = useState('')
  const [haslo, setHaslo] = useState('')
  const [pokazHaslo, setPokazHaslo] = useState(false)
  const [zapamietaj, setZapamietaj] = useState(false)

  const [imie, setImie] = useState('')
  const [nazwisko, setNazwisko] = useState('')
  const [haslo2, setHaslo2] = useState('')
  const [pokazHaslo2, setPokazHaslo2] = useState(false)
  /* Zakres zaznaczenia w polu potwierdzenia — natywne zaznaczenie jest ukryte,
     więc rysujemy je sami na kropkach. */
  const [zakres, setZakres] = useState({ od: 0, do: 0 })
  /* Przy haśle dłuższym niż pole input przewija swoją treść. Nakładka z
     kropkami leży osobno, więc bez przepisania scrollLeft rozjeżdżałaby się
     z tekstem dokładnie o tyle, o ile pole jest przewinięte. */
  const [przesuniecie, setPrzesuniecie] = useState(0)
  const poleHaslo2 = useRef<HTMLInputElement>(null)
  const odczytajZakres = (el: HTMLInputElement) => {
    setZakres({ od: el.selectionStart ?? 0, do: el.selectionEnd ?? 0 })
    setPrzesuniecie(el.scrollLeft)
  }

  /* `selectionchange` na dokumencie to jedyne zdarzenie lecące w trakcie
     przeciągania myszą — onMouseUp/onSelect odpalają się dopiero po puszczeniu,
     więc podświetlenie doganiało kursor z opóźnieniem. */
  useEffect(() => {
    const wTrakcieZaznaczania = () => {
      const el = poleHaslo2.current
      if (!el || document.activeElement !== el) return
      odczytajZakres(el)
    }
    document.addEventListener('selectionchange', wTrakcieZaznaczania)
    return () => document.removeEventListener('selectionchange', wTrakcieZaznaczania)
  }, [])
  const [zgody, setZgody] = useState({ regulamin: false, prywatnosc: false, marketing: false })

  type WidokEkranu = 'formularz' | 'onboarding'
  const [aktywnyWidok, setAktywnyWidok] = useState<WidokEkranu>('formularz')
  const [pokazModalWeryfikacji, setPokazModalWeryfikacji] = useState(false)
  const [onboardingKrok, setOnboardingKrok] = useState<1 | 2 | 3>(1)
  const [pokazBladWalidacji, setPokazBladWalidacji] = useState(false)

  const logowanie = tryb === 'logowanie'
  const wymagania = wymaganiaHasla(haslo)
  const spelnioneWymogi = wymagania.filter(w => w.ok).length
  const braki = wymagania.filter(w => !w.ok)
  const hasloPoprawne = braki.length === 0
  const zgodneHasla = haslo2.length > 0 && haslo2 === haslo
  const emailPoprawny = email.trim().length > 0 && email.includes('@')
  const daneOsobowePoprawne = imie.trim().length > 0 && nazwisko.trim().length > 0

  const wszystkieWarunkiSpelnione =
    emailPoprawny && daneOsobowePoprawne && hasloPoprawne && zgodneHasla &&
    zgody.regulamin && zgody.prywatnosc

  /* Rejestracja zaczyna się od wyboru metody (Google / Apple / Microsoft /
     e-mail). Formularz z hasłem pokazujemy dopiero po „Kontynuuj z e-mailem”.
     Jedna zgoda nad metodami odblokowuje wszystkie — bez niej kliknięcie
     metody tylko podświetla zgodę. */
  const [krokRej, setKrokRej] = useState<'metody' | 'email'>('metody')
  const [zgodaStart, setZgodaStart] = useState(false)
  const [bladZgody, setBladZgody] = useState(false)
  const pokazFormularz = logowanie || krokRej === 'email'

  const wybierzMetode = (metoda: 'google' | 'apple' | 'microsoft' | 'email') => {
    if (!zgodaStart) { setBladZgody(true); return }
    setBladZgody(false)
    if (metoda === 'email') {
      setZgody(z => ({ ...z, regulamin: true, prywatnosc: true }))
      setKrokRej('email')
      return
    }
    // Konto od dostawcy ma już zweryfikowany e-mail — od razu personalizacja.
    setAktywnyWidok('onboarding')
    setOnboardingKrok(1)
  }

  useEffect(() => { setTryb(initialTryb) }, [initialTryb])

  const zmienTryb = (t: Tryb) => { setTryb(t); setPokazBladWalidacji(false); setKrokRej('metody'); setBladZgody(false) }

  const obsluzUtworzKonto = () => {
    if (!wszystkieWarunkiSpelnione) { setPokazBladWalidacji(true); return }
    setPokazBladWalidacji(false)
    setPokazModalWeryfikacji(true)
  }

  if (aktywnyWidok === 'onboarding') {
    return (
      <div key={onboardingKrok} className="relative h-full w-full font-landing text-foreground">
        <Onboarding onWrocDoFormularza={() => setAktywnyWidok('formularz')} />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-full w-full items-center justify-center px-5 py-5 font-landing text-foreground">
      <AnimStyles />

      {/* Jedna szeroka poświata pod treścią — bez siatki i bez dodatkowych
          plam po rogach, żeby było jedno źródło światła. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 45%, hsl(var(--primary)/0.05) 0%, hsl(var(--primary)/0.015) 45%, transparent 80%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">

        {/* Przełącznik trybu — jeden ekran obsługuje logowanie i rejestrację */}
        <PrzelacznikTrybu tryb={tryb} onZmien={zmienTryb} />

        {/* Nagłówek */}
        <div className="mt-6 text-center">
          <h1 className="font-heading text-[24px] font-bold leading-tight tracking-[-0.8px] text-foreground">
            {logowanie ? 'Zaloguj się' : 'Utwórz konto'}
          </h1>
          <p className="pt-1.5 font-sans text-[13px] text-foreground/40">
            {logowanie ? 'Wróć do swoich projektów w NextByte.' : krokRej === 'metody' ? 'Załóż konto i twórz za darmo.' : 'Ostatni krok: dane konta.'}
          </p>
        </div>

        {/* ══ REJESTRACJA, KROK 1: wybór metody ══ */}
        <Rozwijane otwarte={!pokazFormularz}>
          <div className="pt-5">
            <BonusFirmowy />

            <div className="mt-4 space-y-2">
              <PrzyciskMetody onClick={() => wybierzMetode('google')} ikona={<GoogleMark className="h-4 w-4" />} tekst="Kontynuuj z Google" />
              <PrzyciskMetody onClick={() => wybierzMetode('apple')} ikona={<AppleMark className="h-4 w-4" />} tekst="Kontynuuj z Apple" />
              <PrzyciskMetody onClick={() => wybierzMetode('microsoft')} ikona={<MicrosoftMark className="h-4 w-4" />} tekst="Kontynuuj z Microsoft" />
            </div>

            <div className="my-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-foreground/[0.08]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/30">lub</span>
              <span className="h-px flex-1 bg-foreground/[0.08]" />
            </div>

            <PrzyciskMetody onClick={() => wybierzMetode('email')} ikona={<Mail className="h-4 w-4 text-primary" />} tekst="Kontynuuj z e-mailem" />

            {/* Jedna zgoda odblokowuje wszystkie metody */}
            <div className={cn(
              'mt-4 rounded-xl px-3 py-2.5 transition-all duration-300',
              bladZgody && !zgodaStart ? 'bg-primary/[0.07] ring-1 ring-inset ring-primary/40' : 'ring-1 ring-inset ring-transparent',
            )}>
              <Zgoda
                zaznaczona={zgodaStart}
                onZmien={() => { setZgodaStart(v => !v); setBladZgody(false) }}
                tekst={<>Akceptuję <span className="text-foreground/80 underline underline-offset-2">Regulamin</span> i <span className="text-foreground/80 underline underline-offset-2">Politykę prywatności</span> oraz potwierdzam, że mam ukończone 18 lat.</>}
              />
              <Rozwijane otwarte={bladZgody && !zgodaStart}>
                <p className="flex items-center gap-1.5 pl-[26px] pt-1.5 font-sans text-[12px] text-primary">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Zaakceptuj regulamin, aby kontynuować.
                </p>
              </Rozwijane>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/30">
              <Building2 className="h-3.5 w-3.5" /> Logowanie SSO dla zespołów i firm
            </p>
          </div>
        </Rozwijane>

        {/* ══ REJESTRACJA, KROK 2 / LOGOWANIE: formularz ══ */}
        <Rozwijane otwarte={pokazFormularz}>
        <Rozwijane otwarte={!logowanie && krokRej === 'email'}>
          <button
            type="button"
            onClick={() => setKrokRej('metody')}
            className="mt-4 inline-flex items-center gap-1.5 font-sans text-[12.5px] text-foreground/45 transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Inne metody rejestracji
          </button>
        </Rozwijane>

        {/* Google — przy logowaniu; w rejestracji jest w kroku metod */}
        <Rozwijane otwarte={logowanie}>
          <button
            type="button"
            className={cn(
              'mt-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl',
              'border border-foreground/[0.12] bg-foreground/[0.03] font-sans text-[14px] font-semibold text-foreground/85',
              'transition-all duration-200 hover:border-foreground/25 hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.99] cursor-pointer',
            )}
          >
            <GoogleMark className="h-4 w-4" />
            Kontynuuj z Google
          </button>

          <div className="my-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-foreground/[0.08]" />
            <span className="font-sans text-[11px] text-foreground/25">lub e-mailem</span>
            <span className="h-px flex-1 bg-foreground/[0.08]" />
          </div>
        </Rozwijane>
        <Rozwijane otwarte={!logowanie}><div className="h-3" /></Rozwijane>

        {/* Pola */}
        {/* Odstępy siedzą wewnątrz zwijanych bloków (a nie w space-y na
            kontenerze), bo zwinięty element nadal dostawałby margines
            od space-y i zostawiał pustą szparę. */}
        <div>
          <Rozwijane otwarte={!logowanie}>
            <div className="grid grid-cols-2 gap-2.5 pb-2">
              <Pole icon={User} typ="text" placeholder="Imię" wartosc={imie} onChange={setImie} />
              <Pole icon={User} typ="text" placeholder="Nazwisko" wartosc={nazwisko} onChange={setNazwisko} />
            </div>
          </Rozwijane>

          <Pole icon={Mail} typ="email" placeholder="twoj@email.com" wartosc={email} onChange={setEmail} />

          <div className="mt-2" />
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/30 transition-colors hover:text-foreground/70 cursor-pointer"
              >
                {pokazHaslo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Rozwijane otwarte={!logowanie}>
            <div className="pt-2">
              <div className={cn(
                'group relative flex items-center rounded-xl bg-foreground/[0.035] ring-1 ring-inset transition-all duration-200',
                haslo2.length === 0
                  ? 'ring-foreground/[0.08] focus-within:ring-primary/45'
                  : zgodneHasla ? OBRYS_OK : 'ring-destructive/60',
              )}>
                <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-foreground/30 transition-colors group-focus-within:text-primary" />
                <input
                  ref={poleHaslo2}
                  type={pokazHaslo2 ? 'text' : 'password'}
                  placeholder="Potwierdź hasło"
                  value={haslo2}
                  onChange={e => { setHaslo2(e.target.value); odczytajZakres(e.target) }}
                  onScroll={e => setPrzesuniecie(e.currentTarget.scrollLeft)}
                  onBlur={() => setZakres({ od: 0, do: 0 })}
                  className={cn(
                    'h-11 w-full bg-transparent pl-10 pr-10 text-[14px] outline-none placeholder:text-foreground/30',
                    // Zamaskowane pole jedzie monospace, żeby każdy znak miał
                    // ten sam rozstaw co komórka kropki w nakładce. Inaczej
                    // przeglądarka liczy zaznaczenie na proporcjonalnym
                    // font-sans, a my rysujemy je na równych kratkach —
                    // podświetlenie lądowało kilka znaków od kursora.
                    pokazHaslo2 || haslo2.length === 0
                      ? 'font-sans text-foreground caret-primary'
                      // Natywne zaznaczenie całkiem ukryte: przeglądarka rysuje
                      // przy nim własny prostokąt i wymusza widoczność tekstu,
                      // więc spod przezroczystego tekstu wychodziły natywne
                      // kropki. Zaznaczenie rysujemy sami, na kropkach niżej.
                      : 'font-mono text-transparent caret-transparent selection:bg-transparent selection:text-transparent',
                  )}
                />
                {/* Kropki zgodności znak po znaku. Komórka nie ma sztywnej
                    szerokości — zawiera przezroczysty znak w tym samym
                    monospace co input, więc jej rozstaw jest dokładnie taki
                    jak rozstaw znaków, na których przeglądarka liczy
                    zaznaczenie. Kropka leży nad nią absolutnie, żeby jej
                    rozmiar nie wpływał na szerokość komórki. */}
                {!pokazHaslo2 && haslo2.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 left-10 right-10 flex items-center overflow-hidden">
                    <div className="flex" style={{ transform: `translateX(${-przesuniecie}px)` }}>
                      {haslo2.split('').map((z, i) => {
                        const wZaznaczeniu = i >= zakres.od && i < zakres.do
                        return (
                          <span
                            key={i}
                            className={cn(
                              'relative inline-flex h-5 shrink-0 items-center justify-center font-mono text-[14px] leading-5 text-transparent',
                              wZaznaczeniu && 'bg-primary/25',
                              wZaznaczeniu && i === zakres.od && 'rounded-l-[3px]',
                              wZaznaczeniu && i === zakres.do - 1 && 'rounded-r-[3px]',
                            )}
                          >
                            0
                            <span
                              className={cn(
                                'absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
                                z === haslo[i] ? 'bg-primary' : 'bg-destructive',
                              )}
                            />
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPokazHaslo2(v => !v)}
                  className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-lg text-foreground/30 hover:text-foreground/70 cursor-pointer"
                >
                  {pokazHaslo2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Slot stałej wysokości — komunikat nie przesuwa układu */}
              <div className="h-[18px] pt-1">
                {haslo2.length > 0 && !zgodneHasla && (
                  <p className="flex items-center gap-1.5 font-sans text-[11.5px] leading-none text-destructive">
                    <AlertCircle className="h-3 w-3 shrink-0" /> Hasła się nie zgadzają
                  </p>
                )}
              </div>
            </div>
          </Rozwijane>
        </div>

        {/* Siła hasła — bez ramki, zawsze widoczna w rejestracji, żeby
            pojawienie się po pierwszym znaku nie przesuwało układu */}
        <Rozwijane otwarte={!logowanie}>
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/[0.09]">
                <div
                  className={cn('h-full rounded-full transition-all duration-300',
                    hasloPoprawne ? 'bg-primary' : spelnioneWymogi >= 4 ? 'bg-primary/70' : 'bg-primary/45')}
                  style={{ width: haslo.length === 0 ? '0%' : `${Math.max((spelnioneWymogi / 7) * 100, 6)}%` }}
                />
              </div>
              <span className={cn('shrink-0 font-mono text-[10.5px]', hasloPoprawne ? 'text-primary' : 'text-foreground/35')}>
                {spelnioneWymogi}/7
              </span>
            </div>
            {/* Jedna linia o stałej wysokości zamiast listy siedmiu reguł.
                Zmienia treść, nie pojawia się — więc nic nie przesuwa układu,
                a przy niespełnionym haśle nazywa konkretne braki, żeby nie
                zostawiać użytkownika z samym licznikiem typu 6/7. */}
            <p className={cn(
              'mt-2 truncate h-[16px] font-sans text-[11.5px] leading-[16px]',
              hasloPoprawne ? 'text-primary/80' : 'text-foreground/35',
            )}>
              {haslo.length === 0
                ? 'Min. 12 znaków, wielka i mała litera, cyfra oraz znak specjalny.'
                : hasloPoprawne
                  ? 'Hasło spełnia wszystkie wymagania.'
                  : `Brakuje: ${braki.slice(0, 2).map(w => w.krotki).join(', ')}${braki.length > 2 ? ' i inne' : ''}.`}
            </p>
          </div>
        </Rozwijane>

        {/* Zapamiętaj / reset */}
        <Rozwijane otwarte={logowanie}>
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setZapamietaj(v => !v)}
              className="group flex items-center gap-2 font-sans text-[12.5px] text-foreground/45 hover:text-foreground/75 cursor-pointer transition-colors"
            >
              <span className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] transition-all',
                zapamietaj ? 'bg-primary text-primary-foreground' : 'bg-foreground/[0.06] ring-1 ring-inset ring-foreground/20 group-hover:ring-foreground/40',
              )}>
                {zapamietaj && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
              </span>
              Zapamiętaj na 30 dni
            </button>
            <button type="button" className="font-sans text-[12.5px] text-foreground/40 hover:text-primary cursor-pointer transition-colors">
              Nie pamiętasz hasła?
            </button>
          </div>
        </Rozwijane>

        {/* Zgody */}
        <Rozwijane otwarte={!logowanie}>
          <div className="pt-3">
            <Zgoda
              zaznaczona={zgody.regulamin}
              onZmien={() => setZgody(z => ({ ...z, regulamin: !z.regulamin }))}
              wymagana
              tekst={<>Akceptuję <span className="text-foreground/80 underline underline-offset-2">Regulamin</span></>}
            />
            <Zgoda
              zaznaczona={zgody.prywatnosc}
              onZmien={() => setZgody(z => ({ ...z, prywatnosc: !z.prywatnosc }))}
              wymagana
              tekst={<>Akceptuję <span className="text-foreground/80 underline underline-offset-2">Politykę prywatności</span></>}
            />
            <Zgoda
              zaznaczona={zgody.marketing}
              onZmien={() => setZgody(z => ({ ...z, marketing: !z.marketing }))}
              tekst="Chcę dostawać informacje o nowych funkcjach"
            />
          </div>
        </Rozwijane>

        {/* Błąd walidacji */}
        <Rozwijane otwarte={pokazBladWalidacji && !wszystkieWarunkiSpelnione}>
          <div className="flex items-center gap-2 pt-4 font-sans text-[12.5px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {!daneOsobowePoprawne ? 'Wpisz imię i nazwisko.' :
               !emailPoprawny ? 'Podaj poprawny adres e-mail.' :
               !hasloPoprawne ? 'Hasło nie spełnia wymagań.' :
               !zgodneHasla ? 'Hasła muszą być identyczne.' :
               !zgody.regulamin ? 'Zaakceptuj Regulamin.' :
               !zgody.prywatnosc ? 'Zaakceptuj Politykę prywatności.' : 'Uzupełnij wymagane pola.'}
            </span>
          </div>
        </Rozwijane>

        {/* CTA */}
        <div className="mt-3.5">
          <GlowButton
            size="lg"
            className="h-11 w-full justify-center"
            onClick={logowanie ? undefined : obsluzUtworzKonto}
          >
            {logowanie ? 'Zaloguj się' : 'Utwórz konto'}
          </GlowButton>
        </div>
        </Rozwijane>

        {/* Linki prawne tylko przy logowaniu — w rejestracji Regulamin
            i Polityka są już linkami w zgodach tuż nad przyciskiem. */}
        <Rozwijane otwarte={logowanie}>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-5">
            {DOKUMENTY.map(t => (
              <button key={t} type="button" className="font-sans text-[11px] text-foreground/25 hover:text-foreground/50 cursor-pointer transition-colors">
                {t}
              </button>
            ))}
          </div>
        </Rozwijane>
      </div>

      {/* Modal weryfikacji email */}
      <WeryfikacjaEmailModal
        otwarty={pokazModalWeryfikacji}
        email={email}
        onZamknij={() => setPokazModalWeryfikacji(false)}
        onZatwierdz={() => {
          setPokazModalWeryfikacji(false)
          setAktywnyWidok('onboarding')
          setOnboardingKrok(1)
        }}
      />
    </div>
  )
}
