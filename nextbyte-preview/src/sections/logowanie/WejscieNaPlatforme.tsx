import React, { useEffect, useRef, useState } from 'react'
import {
  X, Check, Copy, MessageSquare, Image as ImageIcon, Video, Spline, NotebookPen, GraduationCap, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'
import { WorkspaceVisual } from '@/grafiki/wizualizacje'
import { GlowButton } from '@/sections/wspolne/shared'
import {
  PlanCard, OkresToggle, BYTE_PATH_D, BYTE_PATH_LEN, type Okres, type OfertaPlanu,
} from '@/sections/strona-glowna/CennikPage'
import { PLANY } from '@/sections/strona-glowna/data'
import zdjAnimal from '@/assets/studio/animal.jpg'
import zdjCar from '@/assets/studio/car.jpg'
import { zdjecieCanvas } from './zdjecia-onboardingu'
import zdjLandscape from '@/assets/studio/landscape.jpg'

/* Onboarding — faza C (spec: ./ONBOARDING.md). Po ostatnim pytaniu
   użytkownik ląduje na platformie (rozmytej w tle), a na niej po kolei:
   C1 wszystkie moduły (płytka PCB ze strony głównej) → C2 osobista zniżka
   z licznikiem → C3 plany z cennika z naliczoną zniżką → C4 nowa funkcja.
   Treść oferty będzie się zmieniać, więc jest w jednym obiekcie
   (KONFIG_OFERTY). Język wizualny 1:1 z cennikiem strony głównej:
   font-heading/font-light, etykiety mono, GlowButton, akcent --primary. */

export interface KonfiguracjaOferty {
  /** Największy rabat — pokazywany w nagłówkach */
  procent: number
  kod: string
  /** Czas ważności oferty liczony od wejścia na platformę */
  czasSekund: number
  /** Rabat per plan, dotyczy rozliczenia rocznego */
  rabatPremium: number
  rabatUltimate: number
}

export const KONFIG_OFERTY: KonfiguracjaOferty = {
  procent: 55,
  kod: 'NEXT-START-55',
  czasSekund: 3 * 3600 - 218,
  rabatPremium: 40,
  rabatUltimate: 45,
}

type Etap = 'moduly' | 'znizka' | 'plany' | 'funkcja' | 'koniec'

function StyleWejscia() {
  return (
    <style>{`
      @keyframes nbModalWchodzi { from { opacity: 0; transform: translateY(14px) scale(.97) } }
      @keyframes nbTloWchodzi { from { opacity: 0 } }
      @keyframes nbCyfra { from { opacity: 0; transform: translateY(-55%) } }
      @keyframes nbFala { 0% { transform: scale(.6); opacity: .55 } 100% { transform: scale(1.9); opacity: 0 } }
      .nb-modal-wchodzi { animation: nbModalWchodzi 420ms cubic-bezier(.2,.9,.25,1) backwards }
      .nb-tlo-wchodzi { animation: nbTloWchodzi 300ms ease-out backwards }
      .nb-cyfra { animation: nbCyfra 320ms cubic-bezier(.2,.9,.25,1) }
      .nb-fala { animation: nbFala 2.4s cubic-bezier(.2,.6,.3,1) infinite }
      @media (prefers-reduced-motion: reduce) {
        .nb-modal-wchodzi, .nb-tlo-wchodzi, .nb-cyfra, .nb-fala { animation: none }
      }
    `}</style>
  )
}

/* ── Hooki czasu ─────────────────────────────────────────────────────── */
function useOdliczanie(sekundy: number) {
  const koniec = useRef(Date.now() + sekundy * 1000)
  const [teraz, setTeraz] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setTeraz(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const zostalo = Math.max(0, Math.floor((koniec.current - teraz) / 1000))
  const dwa = (n: number) => String(n).padStart(2, '0')
  return {
    h: dwa(Math.floor(zostalo / 3600)),
    m: dwa(Math.floor((zostalo % 3600) / 60)),
    s: dwa(zostalo % 60),
  }
}

type Czas = ReturnType<typeof useOdliczanie>

/** Postęp 0→1 w czasie, z wygładzeniem — napędza animacje wejścia. */
function usePostepWCzasie(ms: number, opoznienie = 0) {
  const [p, setP] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let raf = 0
    const t0 = performance.now() + opoznienie
    const krok = (t: number) => {
      const x = Math.min(1, Math.max(0, (t - t0) / ms))
      setP(1 - Math.pow(1 - x, 3))
      if (x < 1) raf = requestAnimationFrame(krok)
    }
    raf = requestAnimationFrame(krok)
    // rAF stoi w karcie w tle — bez tego animacja zostałaby w połowie.
    const domkniecie = window.setTimeout(() => setP(1), ms + opoznienie + 120)
    return () => { cancelAnimationFrame(raf); window.clearTimeout(domkniecie) }
  }, [ms, opoznienie])
  return p
}

/* ── Wspólne klocki ──────────────────────────────────────────────────── */
function Modal({ children, className, onZamknij }: { children: React.ReactNode; className?: string; onZamknij?: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'nb-modal-wchodzi relative isolate max-h-[calc(100dvh-16px)] w-full overflow-y-auto overflow-x-hidden rounded-3xl border border-foreground/[0.10]',
        'bg-[hsl(var(--card)/0.92)] backdrop-blur-xl',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.10),0_24px_80px_-20px_hsl(0_0%_0%/0.55)]',
        className,
      )}
    >
      {/* Specularna krawędź i poświata akcentu u góry — jak karty cennika */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56"
        style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 0%, hsl(var(--primary) / 0.10), transparent 75%)' }}
      />
      {onZamknij && (
        <button
          type="button"
          onClick={onZamknij}
          aria-label="Zamknij"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-foreground/[0.10] bg-foreground/[0.04] text-muted-foreground transition-colors hover:border-foreground/[0.2] hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  )
}

function Etykieta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-foreground/40', className)}>
      {children}
    </span>
  )
}

function Naglowek({ tytul, akcent, className }: { tytul: string; akcent: string; className?: string }) {
  return (
    <h2 className={cn('font-heading text-[clamp(28px,4vw,40px)] font-light leading-[1.08] tracking-[-1.5px] text-foreground', className)}>
      {tytul} <span className="font-normal text-primary">{akcent}</span>
    </h2>
  )
}

/** Cyfry licznika — każda zmiana wjeżdża od góry, sekundy „tykają”. */
function KomorkaCzasu({ wartosc, podpis, maly }: { wartosc: string; podpis: string; maly?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl border border-foreground/[0.10] bg-[hsl(var(--background)/0.5)] font-mono font-semibold tabular-nums text-foreground shadow-inner',
        maly ? 'h-9 w-11 text-[17px]' : 'h-14 w-16 text-[26px]',
      )}>
        <span key={wartosc} className="nb-cyfra">{wartosc}</span>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-foreground/[0.06]" />
      </div>
      {!maly && <Etykieta className="text-[9px] tracking-[0.18em]">{podpis}</Etykieta>}
    </div>
  )
}

function Licznik({ czas, maly }: { czas: Czas; maly?: boolean }) {
  return (
    <div className={cn('flex items-start', maly ? 'gap-1' : 'gap-2')} aria-label={`Oferta ważna jeszcze ${czas.h}:${czas.m}:${czas.s}`}>
      <KomorkaCzasu wartosc={czas.h} podpis="godz" maly={maly} />
      <span className={cn('font-mono text-foreground/30', maly ? 'pt-1.5 text-[17px]' : 'pt-3 text-[24px]')}>:</span>
      <KomorkaCzasu wartosc={czas.m} podpis="min" maly={maly} />
      <span className={cn('font-mono text-foreground/30', maly ? 'pt-1.5 text-[17px]' : 'pt-3 text-[24px]')}>:</span>
      <KomorkaCzasu wartosc={czas.s} podpis="sek" maly={maly} />
    </div>
  )
}

function KodRabatowy({ kod }: { kod: string }) {
  const [skopiowany, setSkopiowany] = useState(false)
  const kopiuj = () => {
    void navigator.clipboard?.writeText(kod).catch(() => {})
    setSkopiowany(true)
    window.setTimeout(() => setSkopiowany(false), 1600)
  }
  return (
    <button
      type="button"
      onClick={kopiuj}
      className="group inline-flex h-10 items-center gap-2.5 rounded-xl border border-dashed border-primary/45 bg-primary/[0.08] px-3.5 font-mono text-[13px] font-semibold tracking-[0.08em] text-primary transition-colors hover:bg-primary/[0.14] cursor-pointer"
    >
      {kod}
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
        {skopiowany ? <Check className="h-3 w-3" strokeWidth={3} /> : <Copy className="h-3 w-3" />}
      </span>
    </button>
  )
}

/* ── Platforma w tle (rozmyta pod modalami) ──────────────────────────── */
function PlatformaWTle() {
  return (
    <div aria-hidden className="absolute inset-0 flex gap-3 p-3">
      <div className="hidden w-[200px] shrink-0 flex-col gap-2 rounded-2xl bg-[hsl(var(--card))] p-3 ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)] md:flex">
        <NextByteMarkIcon className="mb-3 h-5 w-5 text-foreground" />
        {[MessageSquare, ImageIcon, Video, Spline, NotebookPen, GraduationCap].map((Ik, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[10px] px-2 py-2 text-muted-foreground">
            <Ik className="h-4 w-4" />
            <span className="h-2 flex-1 rounded-full bg-[hsl(var(--foreground)/0.08)]" />
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 lg:grid-cols-3">
        {[zdjLandscape, null, zdjCar, null, zdjecieCanvas, zdjAnimal].map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)]">
            {src
              ? <img src={src} alt="" className="h-full w-full object-cover opacity-70" />
              : <div className="space-y-2 p-4">{[70, 50, 85].map(w => <div key={w} className="h-2 rounded-full bg-[hsl(var(--foreground)/0.08)]" style={{ width: `${w}%` }} />)}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── C1: wszystkie moduły podłączone do jednego konta ────────────────── */
function ModalModuly({ onDalej, kompaktowy = false }: { onDalej: () => void; kompaktowy?: boolean }) {
  // Płytka składa się sama: ścieżki rosną, układy zapalają się po kolei.
  const p = usePostepWCzasie(2600, 250)
  return (
    <Modal className="max-w-[780px]" onZamknij={onDalej}>
      <div className={cn('px-6 text-center sm:px-10', kompaktowy ? 'pt-6 sm:pt-9' : 'pt-9')}>
        <Etykieta>Twoje konto jest gotowe</Etykieta>
        <Naglowek tytul="Wszystkie moduły." akcent="Jedna pula Byte." className="mt-3" />
        <p className={cn('mx-auto mt-3 max-w-[460px] font-sans text-[15px] font-light leading-relaxed text-foreground/60', kompaktowy && 'text-[13.5px] leading-snug sm:text-[15px] sm:leading-relaxed')}>
          Chat AI, notatki i kalendarz działają w planie bez limitu. Generacje liczysz w Byte i dobierasz je, kiedy potrzebujesz więcej.
        </p>
      </div>
      <div className={cn('relative mx-auto -mt-1 flex max-w-[560px] justify-center px-2 sm:px-6', kompaktowy && 'max-sm:overflow-hidden')}>
        <div className={cn('w-full', kompaktowy && 'max-sm:origin-top max-sm:scale-[0.9]')}>
          <WorkspaceVisual postep={p} />
        </div>
      </div>
      <div className={cn('flex justify-center px-6 pb-8', kompaktowy && 'pb-5 sm:pb-8')}>
        <GlowButton onClick={onDalej} className="min-w-[200px]">Kontynuuj</GlowButton>
      </div>
    </Modal>
  )
}

/* ── C2: osobista zniżka ─────────────────────────────────────────────── */
function ModalZnizka({ konfig, czas, onDalej, onZamknij, kompaktowy = false }: { konfig: KonfiguracjaOferty; czas: Czas; onDalej: () => void; onZamknij: () => void; kompaktowy?: boolean }) {
  // Znak Byte rysuje się jednym ruchem pióra, a procent nabija się od zera.
  const rys = usePostepWCzasie(1400, 150)
  const licz = usePostepWCzasie(1500, 500)
  const procent = Math.round(konfig.procent * licz)

  // Znak Byte (animacja) — w wariancie kompaktowym na telefonie stoi obok procentu
  const znak = (rozmiar: string) => (
    <div className={cn('relative flex items-center justify-center', rozmiar)}>
      {[0, 0.8, 1.6].map(d => (
        <span key={d} aria-hidden className="nb-fala absolute inset-6 rounded-full border border-primary/40" style={{ animationDelay: `${d}s` }} />
      ))}
      <svg viewBox="-80 -120 160 240" className="relative h-[78px] w-[52px] overflow-visible sm:h-[150px] sm:w-[100px]" fill="none">
        <defs>
          <filter id="nbZnizkaGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={BYTE_PATH_D} stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={BYTE_PATH_LEN} strokeDashoffset={BYTE_PATH_LEN * (1 - rys)} filter="url(#nbZnizkaGlow)" />
        <path d={BYTE_PATH_D} stroke="hsl(var(--foreground))" strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={BYTE_PATH_LEN} strokeDashoffset={BYTE_PATH_LEN * (1 - rys)} />
      </svg>
    </div>
  )
  const liczba = (
    <>
      <p className="relative font-heading text-[52px] font-light leading-none tracking-[-3px] text-primary tabular-nums sm:mt-2 sm:text-[64px]">
        −{procent}%
      </p>
      <Etykieta className="relative mt-3">Na plany roczne</Etykieta>
    </>
  )

  return (
    <Modal className="max-w-[760px]" onZamknij={onZamknij}>
      <div className="grid md:grid-cols-[280px_1fr]">
        {/* Telefon w wariancie kompaktowym: procent po lewej, animacja po prawej */}
        {kompaktowy && (
          <div className="relative flex items-center justify-between overflow-hidden border-b border-foreground/[0.08] px-6 py-5 sm:hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.16), transparent 65%)' }} />
            <div className="relative flex flex-col items-start">{liczba}</div>
            {znak('h-[124px] w-[124px] shrink-0')}
          </div>
        )}
        {/* Lewa kolumna (komputer; na telefonie w kompaktowym wariancie ukryta): znak Byte + nabijany procent */}
        <div className={cn('relative flex-col items-center justify-center overflow-hidden border-b border-foreground/[0.08] px-6 py-5 sm:py-9 md:border-b-0 md:border-r', kompaktowy ? 'hidden sm:flex' : 'flex')}>
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 42%, hsl(var(--primary) / 0.16), transparent 65%)' }} />
          {znak('h-[92px] w-[92px] sm:h-[168px] sm:w-[168px]')}
          <div className="relative mt-1 flex flex-col items-center sm:mt-2">{liczba}</div>
        </div>

        {/* Prawa kolumna: treść, kod, licznik, CTA */}
        <div className="flex flex-col px-6 py-5 sm:px-9 sm:py-9">
          <Etykieta>Osobista oferta powitalna</Etykieta>
          <Naglowek tytul="Zaczynasz taniej." akcent={`Do ${konfig.procent}% mniej.`} className="mt-3 text-[clamp(26px,3.4vw,34px)]" />
          <p className="mt-3 font-sans text-[14.5px] font-light leading-relaxed text-foreground/60">
            Zniżka jest przypisana do Twojego konta i działa tylko przez pierwsze godziny po rejestracji.
          </p>

          <div className="mt-4 flex flex-col gap-1.5 sm:mt-6">
            <Etykieta className="text-[9.5px]">Twój kod</Etykieta>
            <div><KodRabatowy kod={konfig.kod} /></div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:mt-5">
            <Etykieta className="text-[9.5px]">Ważna jeszcze</Etykieta>
            <Licznik czas={czas} />
          </div>

          <GlowButton onClick={onDalej} className="mt-5 w-full justify-center sm:mt-8">Odbierz zniżkę</GlowButton>
          <p className="mt-3 hidden text-center font-sans text-[12px] font-light text-muted-foreground sm:block">
            Kod dodamy automatycznie przy płatności.
          </p>
        </div>
      </div>
    </Modal>
  )
}

/* ── C3: plany z cennika z naliczoną zniżką ──────────────────────────── */
function EkranPlanow({ konfig, czas, onZamknij }: { konfig: KonfiguracjaOferty; czas: Czas; onZamknij: () => void }) {
  const [okres, setOkres] = useState<Okres>('rocznie')
  const plan = (id: string) => PLANY.find(p => p.id === id)!
  const premium = plan('premium')
  const ultimate = plan('ultimate')
  // Telefon: jedna karta naraz (przełącznik), żeby cały ekran mieścił się bez przewijania
  const [mobilnyPlan, setMobilnyPlan] = useState<'premium' | 'ultimate'>('premium')

  /* Bez Lite na ekranie oferty — Premium zbiera więc cechy Lite i swoje
     („wszystko z Bezpłatnego, a w pakiecie…”), Ultimate dziedziczy z Premium,
     który stoi obok. Listy skrócone, reszta pod „+N więcej”. */
  const ofertaPremium: OfertaPlanu = {
    rabat: konfig.rabatPremium,
    naglowekCech: 'Wszystko z Bezpłatnego, a w pakiecie:',
    cechy: [...premium.cechy, ...plan('lite').cechy],
    widoczne: 6,
  }
  const ofertaUltimate: OfertaPlanu = {
    rabat: konfig.rabatUltimate,
    naglowekCech: 'Wszystko z Premium, plus:',
    cechy: ultimate.cechy,
    widoczne: 6,
  }

  return (
    <Modal className="max-w-[920px]" onZamknij={onZamknij}>
      <div className="px-4 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10">
        <div className="text-center">
          <Etykieta>Osobista oferta · kod {konfig.kod}</Etykieta>
          <Naglowek tytul="Plany z Twoją" akcent={`zniżką do ${konfig.procent}%.`} className="mt-3" />
          <div className="mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <OkresToggle okres={okres} onChange={setOkres} etykietaRabatu={`do −${Math.max(konfig.rabatPremium, konfig.rabatUltimate)}%`} />
            <div className="hidden items-center gap-2.5 sm:flex">
              <Etykieta className="text-[9.5px]">Ważna</Etykieta>
              <Licznik czas={czas} maly />
            </div>
          </div>
        </div>

        <div className="mt-5 hidden items-stretch gap-5 md:grid md:grid-cols-2 sm:mt-8">
          <PlanCard plan={premium} okres={okres} oferta={ofertaPremium} />
          <PlanCard plan={ultimate} okres={okres} oferta={ofertaUltimate} />
        </div>

        <div className="mt-4 md:hidden">
          <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-xl bg-foreground/[0.05] p-1">
            {(['premium', 'ultimate'] as const).map(id => (
              <button
                key={id}
                type="button"
                onClick={() => setMobilnyPlan(id)}
                aria-pressed={mobilnyPlan === id}
                className={cn('h-9 rounded-lg text-[13px] font-semibold transition-colors', mobilnyPlan === id ? 'bg-primary/[0.14] text-primary' : 'text-muted-foreground')}
              >
                {id === 'premium' ? 'Premium' : 'Ultimate'}
              </button>
            ))}
          </div>
          {mobilnyPlan === 'premium'
            ? <PlanCard plan={premium} okres={okres} kompakt oferta={{ ...ofertaPremium, widoczne: 2 }} />
            : <PlanCard plan={ultimate} okres={okres} kompakt oferta={{ ...ofertaUltimate, widoczne: 2 }} />}
        </div>
        <p className="mt-4 hidden text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/85 sm:mt-6 sm:block">
          Anulujesz w dowolnym momencie · Bez ukrytych opłat · Zniżka tylko na plan roczny
        </p>

        {/* Decyzja na dole — po przewinięciu kart nikt nie musi wracać na górę do krzyżyka */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-foreground/[0.08] pt-5 sm:mt-7 sm:flex-row sm:gap-5 sm:pt-7">
          <GlowButton onClick={onZamknij} className="min-w-[240px]">Kontynuuj ze zniżką</GlowButton>
          <button
            type="button"
            onClick={onZamknij}
            className="h-11 px-4 font-sans text-[13.5px] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            Nie, dziękuję
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── C4: nowa funkcja ────────────────────────────────────────────────── */
function ModalFunkcja({ onDalej }: { onDalej: () => void }) {
  return (
    <Modal className="max-w-[620px]" onZamknij={onDalej}>
      {/* Wnętrze z nakładką Canvas: zaznaczenie miejsca, pinezka i polecenie
          dla agenta — od razu widać, co ta funkcja robi */}
      <div className="relative aspect-[3/2] overflow-hidden">
        <img src={zdjecieCanvas} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
        <span aria-hidden className="nb-skan-przelatuje pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <span className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--card)/0.15)] to-[hsl(var(--card))]" />
        <div className="nb-zaznaczenie-pulsuje absolute left-[60%] top-[50%] h-[24%] w-[18%] rounded-lg border-2 border-dashed border-primary bg-primary/10">
          <span className="absolute -left-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground">1</span>
        </div>
      </div>
      <div className="relative -mt-10 px-6 pb-7 text-center sm:-mt-12 sm:px-12 sm:pb-9">
        <Etykieta>Nowość w NextByte</Etykieta>
        <h2 className="mt-3 text-[30px] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-foreground sm:text-[38px]">
          Nowa funkcja
          <span className="block text-primary">Agent w Canvas</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] font-sans text-[14.5px] font-light leading-relaxed text-foreground/60">
          Wstaw, przenieś albo zamień obiekt na zdjęciu jednym poleceniem. Agent sam dobierze skalę, światło i perspektywę.
        </p>
        <GlowButton onClick={onDalej} className="mt-7 min-w-[220px]">Wypróbuj w Canvas</GlowButton>
      </div>
    </Modal>
  )
}

/* ── Przepływ fazy C ─────────────────────────────────────────────────── */
export function WejscieNaPlatforme({
  konfig = KONFIG_OFERTY,
  onZakoncz,
  kompaktowy = false,
}: {
  konfig?: KonfiguracjaOferty
  /** Po zamknięciu ostatniego modala — użytkownik jest na platformie */
  onZakoncz?: () => void
  /** Ciaśniejszy pierwszy modal, żeby mieścił się na telefonie bez przewijania (Onboarding 3) */
  kompaktowy?: boolean
}) {
  const [etap, setEtap] = useState<Etap>('moduly')
  const czas = useOdliczanie(konfig.czasSekund)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [etap])
  useEffect(() => { if (etap === 'koniec') onZakoncz?.() }, [etap, onZakoncz])

  return (
    <div className="relative h-full min-h-[680px] w-full overflow-hidden font-landing text-foreground">
      <StyleWejscia />
      <PlatformaWTle />

      {etap !== 'koniec' ? (
        <div
          ref={scrollRef}
          key={etap}
          className="nb-tlo-wchodzi absolute inset-0 overflow-y-auto bg-[hsl(var(--background)/0.55)] backdrop-blur-md"
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            {etap === 'moduly' && <ModalModuly onDalej={() => setEtap('znizka')} kompaktowy={kompaktowy} />}
            {etap === 'znizka' && (
              <ModalZnizka konfig={konfig} czas={czas} onDalej={() => setEtap('plany')} onZamknij={() => setEtap('funkcja')} kompaktowy={kompaktowy} />
            )}
            {etap === 'plany' && <EkranPlanow konfig={konfig} czas={czas} onZamknij={() => setEtap('funkcja')} />}
            {etap === 'funkcja' && <ModalFunkcja onDalej={() => setEtap('koniec')} />}
          </div>
        </div>
      ) : (
        /* Podgląd: platforma odsłonięta, z możliwością powtórki sekwencji */
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setEtap('moduly')}
            className="nb-modal-wchodzi inline-flex items-center gap-2 rounded-xl border border-foreground/[0.14] bg-[hsl(var(--card)/0.85)] px-4 py-2 text-[13px] font-medium text-foreground backdrop-blur-xl cursor-pointer"
          >
            Powtórz sekwencję wejścia <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
