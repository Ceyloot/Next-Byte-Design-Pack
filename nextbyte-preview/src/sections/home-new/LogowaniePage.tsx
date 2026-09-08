import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import { Mail, Lock, Eye, EyeOff, Check, User, AlertCircle } from 'lucide-react'
import { AnimStyles, GlowButton } from './shared'
import { WeryfikacjaEmailModal } from './WeryfikacjaEmailModal'
import { OnboardingFlow } from './OnboardingFlow'

/* ═══════════════════════════════════════════════════════════════════════
   LOGOWANIE / REJESTRACJA — maksymalny minimalizm
   Bez karty, bez ramek, bez szyny bocznej: jedna wyśrodkowana kolumna
   wprost na tle strony. Cała dekoracja zdjęta, zostaje sama ścieżka
   do założenia konta.
   ═══════════════════════════════════════════════════════════════════════ */

type Tryb = 'logowanie' | 'rejestracja'

/* Własne keyframe'y — projekt nie ma pluginu tailwindcss-animate, więc klasy
   `animate-in` / `fade-in` nic tu nie robią. Bez fill-mode: gdyby animacja nie
   wystartowała, pola i tak są widoczne zamiast zostać na opacity 0.
   Krzywa 0.4,0,0.2,1 zamiast expo-out: tamta przy 60% czasu była już na 97%
   dystansu, więc ogon rozciągał się na ponad 100 ms i wyglądał jak zacięcie. */
function StyleTrybu() {
  return (
    <style>{`
      @keyframes nbPoleWjazd { from { opacity: 0; transform: translateY(-6px) } }
      .nb-pole { animation: nbPoleWjazd .26s cubic-bezier(0.4, 0, 0.2, 1) }
      @media (prefers-reduced-motion: reduce) { .nb-pole { animation: none } }
    `}</style>
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
  const poleHaslo2 = useRef<HTMLInputElement>(null)
  const odczytajZakres = (el: HTMLInputElement) =>
    setZakres({ od: el.selectionStart ?? 0, do: el.selectionEnd ?? 0 })

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

  useEffect(() => { setTryb(initialTryb) }, [initialTryb])

  const zmienTryb = (t: Tryb) => { setTryb(t); setPokazBladWalidacji(false) }

  /* Rejestracja dokłada pięć pól, więc kolumna zmienia wysokość skokowo,
     a że jest wyśrodkowana — całość podskakuje. Wysokości nie da się animować
     z „auto”: mierzymy docelową, cofamy do poprzedniej i puszczamy przejście.
     overflow-hidden włączamy tylko na czas animacji, bo na stałe przycinałby
     poświatę przycisku CTA. */
  const kolumnaRef = useRef<HTMLDivElement>(null)
  const poprzedniaWys = useRef<number | null>(null)
  const [animujeWysokosc, setAnimujeWysokosc] = useState(false)

  useLayoutEffect(() => {
    const el = kolumnaRef.current
    if (!el) return
    const start = poprzedniaWys.current
    el.style.height = ''
    const cel = el.offsetHeight
    poprzedniaWys.current = cel
    if (start == null || start === cel) return
    setAnimujeWysokosc(true)
    el.style.height = `${start}px`
    void el.offsetHeight // wymuś reflow, inaczej przeglądarka zobaczy tylko stan końcowy
    el.style.height = `${cel}px`
  }, [tryb])

  const obsluzUtworzKonto = () => {
    if (!wszystkieWarunkiSpelnione) { setPokazBladWalidacji(true); return }
    setPokazBladWalidacji(false)
    setPokazModalWeryfikacji(true)
  }

  if (aktywnyWidok === 'onboarding') {
    return (
      <div className="relative flex min-h-full w-full items-center justify-center px-5 py-5 font-landing text-foreground">
        <AnimStyles />
        {/* Jedna szeroka poświata pod całą treścią — bez plam po rogach ani
            halo na poszczególnych kafelkach, żeby czytała się jako jedno
            źródło światła, a nie kilka osobnych. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 80% at 50% 45%, hsl(var(--primary)/0.05) 0%, hsl(var(--primary)/0.015) 45%, transparent 80%)',
          }}
        />
        <OnboardingFlow
          key={onboardingKrok}
          poczatkowyKrok={onboardingKrok}
          onWrocDoFormularza={() => setAktywnyWidok('formularz')}
          onZakoncz={() => setAktywnyWidok('formularz')}
        />
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

      <StyleTrybu />

      <div
        ref={kolumnaRef}
        onTransitionEnd={e => {
          if (e.propertyName === 'height' && e.target === e.currentTarget) {
            e.currentTarget.style.height = ''
            setAnimujeWysokosc(false)
          }
        }}
        className={cn(
          'relative z-10 w-full max-w-[400px] transition-[height] duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          animujeWysokosc && 'overflow-hidden',
        )}
      >

        {/* Przełącznik trybu — jeden ekran obsługuje logowanie i rejestrację */}
        <PrzelacznikTrybu tryb={tryb} onZmien={zmienTryb} />

        {/* Nagłówek */}
        <div className="mt-6 text-center">
          <h1 className="font-heading text-[24px] font-bold leading-tight tracking-[-0.8px] text-foreground">
            {logowanie ? 'Zaloguj się' : 'Utwórz konto'}
          </h1>
          {logowanie && (
            <p className="mt-1.5 font-sans text-[13px] text-foreground/40">
              Wróć do swoich projektów w NextByte.
            </p>
          )}
        </div>

        {/* Google */}
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

        {/* Separator */}
        <div className="my-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-foreground/[0.08]" />
          <span className="font-sans text-[11px] text-foreground/25">lub e-mailem</span>
          <span className="h-px flex-1 bg-foreground/[0.08]" />
        </div>

        {/* Pola */}
        <div className="space-y-2">
          {!logowanie && (
            <div className="nb-pole grid grid-cols-2 gap-2.5">
              <Pole icon={User} typ="text" placeholder="Imię" wartosc={imie} onChange={setImie} />
              <Pole icon={User} typ="text" placeholder="Nazwisko" wartosc={nazwisko} onChange={setNazwisko} />
            </div>
          )}

          <Pole icon={Mail} typ="email" placeholder="twoj@email.com" wartosc={email} onChange={setEmail} />

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

          {!logowanie && (
            <div className="nb-pole">
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
                  onBlur={() => setZakres({ od: 0, do: 0 })}
                  className={cn(
                    'h-11 w-full bg-transparent pl-10 pr-10 font-sans text-[14px] outline-none placeholder:text-foreground/30',
                    pokazHaslo2 || haslo2.length === 0
                      ? 'text-foreground caret-primary'
                      // Natywne zaznaczenie całkiem ukryte: przeglądarka rysuje
                      // przy nim własny prostokąt i wymusza widoczność tekstu,
                      // więc spod przezroczystego tekstu wychodziły natywne
                      // kropki. Zaznaczenie rysujemy sami, na kropkach niżej.
                      : 'text-transparent caret-transparent selection:bg-transparent selection:text-transparent',
                  )}
                />
                {/* Kropki zgodności znak po znaku. Kontener musi mieć prawą
                    krawędź i overflow-hidden — bez tego przy dłuższym haśle
                    kropki wylewały się poza pole przez pół ekranu. shrink-0
                    trzyma je okrągłe: mają być przycięte, nie ściśnięte.
                    Każda kropka siedzi w komórce bez odstępu — dzięki temu
                    podświetlenie zaznaczenia układa się w ciągły pasek. */}
                {!pokazHaslo2 && haslo2.length > 0 && (
                  <div className="pointer-events-none absolute inset-y-0 left-10 right-10 flex items-center overflow-hidden">
                    {haslo2.split('').map((z, i) => {
                      const wZaznaczeniu = i >= zakres.od && i < zakres.do
                      return (
                        <span
                          key={i}
                          className={cn(
                            'flex h-5 w-2.5 shrink-0 items-center justify-center',
                            wZaznaczeniu && 'bg-primary/25',
                            wZaznaczeniu && i === zakres.od && 'rounded-l-[3px]',
                            wZaznaczeniu && i === zakres.do - 1 && 'rounded-r-[3px]',
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              z === haslo[i] ? 'bg-primary' : 'bg-destructive',
                            )}
                          />
                        </span>
                      )
                    })}
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
          )}
        </div>

        {/* Siła hasła — bez ramki, zawsze widoczna w rejestracji, żeby
            pojawienie się po pierwszym znaku nie przesuwało układu */}
        {!logowanie && (
          <div className="nb-pole mt-1">
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
        )}

        {/* Zapamiętaj / reset */}
        {logowanie && (
          <div className="nb-pole mt-4 flex items-center justify-between">
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
        )}

        {/* Zgody */}
        {!logowanie && (
          <div className="nb-pole mt-3">
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
        )}

        {/* Błąd walidacji */}
        {pokazBladWalidacji && !wszystkieWarunkiSpelnione && (
          <div className="mt-4 flex items-center gap-2 font-sans text-[12.5px] text-destructive">
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
        )}

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

        {/* Linki prawne tylko przy logowaniu — w rejestracji Regulamin
            i Polityka są już linkami w zgodach tuż nad przyciskiem. */}
        {logowanie && (
          <div className="nb-pole mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {DOKUMENTY.map(t => (
              <button key={t} type="button" className="font-sans text-[11px] text-foreground/25 hover:text-foreground/50 cursor-pointer transition-colors">
                {t}
              </button>
            ))}
          </div>
        )}
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
