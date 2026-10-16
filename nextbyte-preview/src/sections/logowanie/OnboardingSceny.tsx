import React from 'react'
import {
  MessageSquare, Image as ImageIcon, Video, Spline, NotebookPen, GraduationCap,
  User, Users, Sparkles, ArrowRight, Check, Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'

/* Lewy panel onboardingu. U Higgsfielda w tym miejscu leci wideo, które
   zmienia się z każdym krokiem — u nas zamiast wideo żywa kompozycja
   z interfejsu NextByte. Każda scena ma ruch w pętli (żeby „ciągle coś się
   działo”), a część z nich reaguje na to, co użytkownik zaznaczył obok.
   Całość rysowana tokenami motywu: działa w dark-theme i future-theme. */

export type IdSceny = 'przestrzen' | 'cele' | 'poziom' | 'moduly' | 'funkcje' | 'zrodla' | 'problem'

export function StyleScen() {
  return (
    <style>{`
      @keyframes nbScenaPlama { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(8%,-6%) scale(1.12) } }
      @keyframes nbScenaUnos  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      @keyframes nbScenaOrbita { to { transform: rotate(360deg) } }
      @keyframes nbScenaOrbitaWstecz { to { transform: rotate(-360deg) } }
      @keyframes nbScenaPuls  { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
      @keyframes nbScenaPisz  { 0% { width: 0 } 55%,100% { width: 100% } }
      @keyframes nbScenaPostep { 0% { width: 4% } 70%,100% { width: 100% } }
      @keyframes nbScenaBlysk { 0% { transform: translateX(-120%) } 60%,100% { transform: translateX(220%) } }
      @keyframes nbScenaTasma { to { transform: translateY(-50%) } }
      @keyframes nbScenaFala  { 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }
      .nb-scena-plama  { animation: nbScenaPlama 14s ease-in-out infinite }
      .nb-scena-unos   { animation: nbScenaUnos 6s ease-in-out infinite }
      .nb-scena-orbita { animation: nbScenaOrbita 36s linear infinite }
      .nb-scena-orbita-wstecz { animation: nbScenaOrbitaWstecz 36s linear infinite }
      .nb-scena-puls   { animation: nbScenaPuls 2.4s ease-in-out infinite }
      .nb-scena-pisz   { animation: nbScenaPisz 4.5s steps(28) infinite }
      .nb-scena-postep { animation: nbScenaPostep 4.5s cubic-bezier(.4,0,.2,1) infinite }
      .nb-scena-blysk  { animation: nbScenaBlysk 2.8s ease-in-out infinite }
      .nb-scena-tasma  { animation: nbScenaTasma 22s linear infinite }
      .nb-scena-fala   { animation: nbScenaFala 1.1s ease-in-out infinite; transform-origin: bottom }
      @media (prefers-reduced-motion: reduce) {
        .nb-scena-plama, .nb-scena-unos, .nb-scena-orbita, .nb-scena-orbita-wstecz, .nb-scena-puls,
        .nb-scena-pisz, .nb-scena-postep, .nb-scena-blysk, .nb-scena-tasma, .nb-scena-fala { animation: none }
      }
    `}</style>
  )
}

/** Szklana płytka wewnątrz sceny (poziom 1 szkła z manifestu). */
function Tafla({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-2xl bg-[color-mix(in_srgb,hsl(var(--card))_72%,transparent)] ring-1 ring-inset ring-[hsl(var(--foreground)/0.13)]',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16),0_2px_5px_-1px_hsl(0_0%_0%/0.04),0_12px_32px_-8px_hsl(0_0%_0%/0.08)] backdrop-blur-[18px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

const MODULY_SCENY = [
  { id: 'chat', nazwa: 'Chat AI', ikona: MessageSquare },
  { id: 'zdjecia', nazwa: 'Studio Zdjęć', ikona: ImageIcon },
  { id: 'wideo', nazwa: 'Studio Wideo', ikona: Video },
  { id: 'canvas', nazwa: 'Canvas', ikona: Spline },
  { id: 'notebook', nazwa: 'Notebook', ikona: NotebookPen },
  { id: 'akademia', nazwa: 'Akademia', ikona: GraduationCap },
]

/* ── Scena 1: osobiście czy zespołowo ─────────────────────────────────── */
function ScenaPrzestrzen({ wybrane }: { wybrane: string[] }) {
  const zespol = wybrane.includes('zespol')
  const prywatnie = wybrane.includes('prywatnie')
  return (
    <div className="relative h-[300px] w-[78%]">
      <Tafla
        className={cn(
          'nb-scena-unos absolute left-0 top-0 w-[72%] p-4 transition-[box-shadow] duration-300',
          prywatnie && 'ring-[hsl(var(--primary)/0.55)]',
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
            <User className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-foreground">Moja przestrzeń</p>
            <p className="text-[10.5px] text-muted-foreground">3 projekty · 1 osoba</p>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          {[82, 64, 48].map(w => (
            <div key={w} className="h-1.5 rounded-full bg-[hsl(var(--foreground)/0.08)]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </Tafla>

      <Tafla
        style={{ animationDelay: '-3s' }}
        className={cn(
          'nb-scena-unos absolute bottom-0 right-0 w-[78%] p-4 transition-[box-shadow] duration-300',
          zespol && 'ring-[hsl(var(--primary)/0.55)]',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="whitespace-nowrap text-[12px] font-semibold text-foreground">Mój zespół</p>
              <p className="text-[10.5px] text-muted-foreground">Wspólna pula Byte</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {['A', 'M', 'T', 'K'].map((l, i) => (
              <span
                key={l}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--card))] text-[9px] font-bold text-foreground ring-2 ring-[hsl(var(--card))]"
                style={{ background: `hsl(var(--primary) / ${0.12 + i * 0.08})` }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="nb-scena-puls h-10 rounded-[10px] bg-[hsl(var(--foreground)/0.06)]" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
      </Tafla>
    </div>
  )
}

/* ── Scena 2: moduły krążą wokół znaku NextByte ───────────────────────── */
function ScenaCele() {
  const R = 118
  return (
    <div className="relative h-[300px] w-[300px]">
      <div className="absolute inset-[30px] rounded-full ring-1 ring-[hsl(var(--foreground)/0.08)]" />
      <div className="absolute inset-[78px] rounded-full border border-dashed border-[hsl(var(--foreground)/0.08)]" />
      <div className="nb-scena-orbita absolute inset-0">
        {MODULY_SCENY.map((m, i) => {
          const kat = (i / MODULY_SCENY.length) * Math.PI * 2
          const x = 150 + Math.cos(kat) * R - 22
          const y = 150 + Math.sin(kat) * R - 22
          return (
            <div key={m.id} className="absolute" style={{ left: x, top: y }}>
              <div className="nb-scena-orbita-wstecz">
                <Tafla className="flex h-11 w-11 items-center justify-center !rounded-[14px] text-foreground/80">
                  <m.ikona className="h-[18px] w-[18px]" />
                </Tafla>
              </div>
            </div>
          )
        })}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Tafla className="flex h-[76px] w-[76px] items-center justify-center !rounded-[22px] shadow-[0_0_48px_-6px_hsl(var(--primary)/0.45)]">
          <NextByteMarkIcon className="h-8 w-8 text-foreground" />
        </Tafla>
      </div>
    </div>
  )
}

/* ── Scena 3: poziom doświadczenia jako rosnące słupki ────────────────── */
const POZIOMY = ['poczatkujacy', 'sredni', 'zaawansowany', 'ekspert']
function ScenaPoziom({ wybrane }: { wybrane: string[] }) {
  const poziom = POZIOMY.indexOf(wybrane[0] ?? '')
  return (
    <Tafla className="w-[78%] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-foreground">Złożoność interfejsu</p>
        <span className="rounded-full bg-[hsl(var(--primary)/0.14)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
          {poziom < 0 ? 'Automatycznie' : ['Prowadzony', 'Szybki', 'Pełny', 'Reżyser'][poziom]}
        </span>
      </div>
      <div className="mt-5 flex h-[150px] items-end gap-3">
        {[0, 1, 2, 3].map(i => {
          const aktywny = poziom < 0 ? true : i <= poziom
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="relative w-full overflow-hidden rounded-[10px] bg-[hsl(var(--foreground)/0.06)]" style={{ height: 34 + i * 30 }}>
                <div
                  className={cn(
                    'absolute inset-0 rounded-[10px] transition-opacity duration-500',
                    aktywny ? 'opacity-100' : 'opacity-0',
                    poziom < 0 && 'nb-scena-puls',
                  )}
                  style={{
                    background: 'linear-gradient(to top, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.15))',
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              </div>
              <span className="flex gap-0.5">
                {Array.from({ length: i + 1 }).map((_, k) => (
                  <span key={k} className={cn('h-1 w-1 rounded-full', aktywny ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.2)]')} />
                ))}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 space-y-2">
        {['Presety jednym kliknięciem', 'Własne ustawienia modeli', 'Narzędzia reżysera i API'].map((t, i) => {
          const wlaczone = poziom < 0 ? i === 0 : i < poziom || (i === 0)
          return (
            <div key={t} className="flex items-center justify-between text-[11px]">
              <span className={wlaczone ? 'text-foreground' : 'text-muted-foreground'}>{t}</span>
              <span className={cn('relative h-3.5 w-6 rounded-full transition-colors duration-300', wlaczone ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.12)]')}>
                <span className={cn('absolute top-0.5 h-2.5 w-2.5 rounded-full bg-[hsl(var(--background))] transition-[left] duration-300', wlaczone ? 'left-3' : 'left-0.5')} />
              </span>
            </div>
          )
        })}
      </div>
    </Tafla>
  )
}

/* ── Scena 4: siatka modułów zapala się wg wyboru ─────────────────────── */
function ScenaModuly({ wybrane }: { wybrane: string[] }) {
  return (
    <div className="grid w-[80%] grid-cols-2 gap-3">
      {MODULY_SCENY.map((m, i) => {
        const wlaczony = wybrane.includes(m.id)
        return (
          <Tafla
            key={m.id}
            className={cn(
              'relative overflow-hidden p-3.5 transition-[box-shadow,opacity] duration-300',
              wlaczony ? 'ring-[hsl(var(--primary)/0.55)]' : 'opacity-70',
            )}
          >
            {wlaczony && (
              <span
                aria-hidden
                className="nb-scena-blysk pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.14)] to-transparent"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            )}
            <span className={cn(
              'flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors duration-300',
              wlaczony ? 'bg-[hsl(var(--primary)/0.16)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.06)] text-muted-foreground',
            )}>
              <m.ikona className="h-4 w-4" />
            </span>
            <p className="mt-6 text-[12px] font-semibold text-foreground">{m.nazwa}</p>
            <p className="text-[10px] text-muted-foreground">{wlaczony ? 'Dodano do startu' : 'Moduł NextByte'}</p>
          </Tafla>
        )
      })}
    </div>
  )
}

/* ── Scena 5: generacja na żywo (prompt → obraz → dźwięk) ─────────────── */
function ScenaFunkcje() {
  return (
    <Tafla className="w-[80%] p-3.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[hsl(var(--foreground)/0.05)]">
        <div
          className="nb-scena-plama absolute -left-1/4 -top-1/4 h-[90%] w-[90%] rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)' }}
        />
        <div
          className="nb-scena-plama absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--foreground) / 0.12), transparent 70%)', animationDelay: '-7s' }}
        />
        <span className="nb-scena-blysk absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[hsl(var(--foreground)/0.08)] to-transparent" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--background)/0.6)] px-2 py-0.5 text-[9.5px] font-semibold text-foreground backdrop-blur-md">
          <Sparkles className="h-2.5 w-2.5 text-[hsl(var(--primary))]" /> Generuję · 4K
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-[color-mix(in_srgb,hsl(var(--background))_52%,transparent)] px-2.5 py-2 ring-1 ring-inset ring-[hsl(var(--foreground)/0.06)]">
        <Wand2 className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" />
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="nb-scena-pisz block overflow-hidden whitespace-nowrap font-mono text-[10.5px] text-foreground/80">
            neonowa ulica nocą, deszcz, kadr 35 mm
          </span>
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--foreground)/0.08)]">
          <div className="nb-scena-postep h-full rounded-full bg-[hsl(var(--primary))]" />
        </div>
        <div className="flex h-4 items-end gap-[2px]">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className="nb-scena-fala w-[3px] rounded-full bg-[hsl(var(--primary)/0.8)]" style={{ height: '100%', animationDelay: `${i * 0.13}s` }} />
          ))}
        </div>
      </div>
    </Tafla>
  )
}

/* ── Scena 6: taśmy kanałów płynące w górę ────────────────────────────── */
function ScenaZrodla({ wybrane, kanaly }: { wybrane: string[]; kanaly: { id: string; nazwa: string }[] }) {
  const zaznaczone = new Set(wybrane)
  const KANALY = kanaly.filter(k => k.id !== 'inne')
  const kolumny = [0, 1, 2].map(k => KANALY.filter((_, i) => i % 3 === k))
  return (
    <div
      className="flex h-full w-full justify-center gap-3 overflow-hidden px-6"
      style={{ maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)' }}
    >
      {kolumny.map((kol, k) => (
        <div key={k} className="nb-scena-tasma flex flex-col gap-3" style={{ animationDuration: `${20 + k * 6}s`, animationDirection: k === 1 ? 'reverse' : 'normal' }}>
          {Array.from({ length: 8 }, () => kol).flat().map(({ id, nazwa }, i) => {
            const wl = zaznaczone.has(id)
            return (
              <Tafla
                key={i}
                className={cn(
                  'flex w-[136px] items-center gap-2 !rounded-full px-3 py-2 transition-[box-shadow] duration-300',
                  wl && 'ring-[hsl(var(--primary)/0.6)]',
                )}
              >
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', wl ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.25)]')} />
                <span className="truncate text-[11px] font-medium text-foreground/85">{nazwa}</span>
              </Tafla>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ── Scena 7: problem → rozwiązanie ───────────────────────────────────── */
const ROZWIAZANIA: Record<string, { problem: string; rozwiazanie: string }> = {
  prompty: { problem: '„zrób ładne zdjęcie produktu”', rozwiazanie: 'Asystent dopisze prompt za Ciebie' },
  limity: { problem: 'Limit generacji wyczerpany', rozwiazanie: 'Jedna pula Byte na wszystkie modele' },
  workflow: { problem: '5 narzędzi, 5 kart w przeglądarce', rozwiazanie: 'Canvas: cały proces w jednym miejscu' },
  niespojne: { problem: 'Każda generacja wygląda inaczej', rozwiazanie: 'Stała postać, styl i scena' },
  nowy: { problem: 'Nie wiem, od czego zacząć', rozwiazanie: 'Akademia i gotowe presety' },
  koszt: { problem: 'Topowe modele są drogie', rozwiazanie: 'Najlepsze modele w jednym planie' },
}
function ScenaProblem({ wybrane }: { wybrane: string[] }) {
  const p = ROZWIAZANIA[wybrane[0] ?? ''] ?? ROZWIAZANIA.prompty
  return (
    <div className="flex w-[80%] flex-col gap-3">
      <Tafla className="self-start px-3.5 py-3 opacity-80">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dziś</p>
        <p key={p.problem} className="nb-krok-wchodzi mt-1 text-[12.5px] text-foreground/80 line-through decoration-[hsl(var(--destructive)/0.6)]">{p.problem}</p>
      </Tafla>
      <div className="flex justify-center">
        <span className="nb-scena-puls flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
          <ArrowRight className="h-4 w-4 rotate-90" />
        </span>
      </div>
      <Tafla className="self-end px-3.5 py-3 ring-[hsl(var(--primary)/0.45)] shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary))]">Z NextByte</p>
        <p key={p.rozwiazanie} className="nb-krok-wchodzi mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
          <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))]" strokeWidth={3} />
          {p.rozwiazanie}
        </p>
      </Tafla>
    </div>
  )
}

/** Rama lewego panelu: tło z dryfującą poświatą akcentu + scena + podpis. */
export function PanelSceny({
  scena, wybrane, podpis, kanaly,
}: {
  scena: IdSceny
  wybrane: string[]
  podpis: string
  /** Opcje kroku „Skąd o nas wiesz?” — scena źródeł pokazuje je na taśmach */
  kanaly: { id: string; nazwa: string }[]
}) {
  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)]">
      {/* Poświata — niska krycie akcentu, żeby w jasnym motywie nie robiła sinej plamy */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="nb-scena-plama absolute -left-[20%] top-[8%] h-[60%] w-[90%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.16), transparent 70%)' }}
        />
        <div
          className="nb-scena-plama absolute -right-[25%] bottom-[0%] h-[55%] w-[85%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 70%)', animationDelay: '-6s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground) / 0.035) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.035) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
      </div>

      <div key={scena} className="nb-krok-wchodzi flex min-h-0 flex-1 items-center justify-center">
        {scena === 'przestrzen' && <ScenaPrzestrzen wybrane={wybrane} />}
        {scena === 'cele' && <ScenaCele />}
        {scena === 'poziom' && <ScenaPoziom wybrane={wybrane} />}
        {scena === 'moduly' && <ScenaModuly wybrane={wybrane} />}
        {scena === 'funkcje' && <ScenaFunkcje />}
        {scena === 'zrodla' && <ScenaZrodla wybrane={wybrane} kanaly={kanaly} />}
        {scena === 'problem' && <ScenaProblem wybrane={wybrane} />}
      </div>

      <div className="flex items-center gap-2 px-5 pb-5">
        <NextByteMarkIcon className="h-3.5 w-3.5 text-foreground/60" />
        <p key={podpis} className="nb-krok-wchodzi text-[11.5px] text-muted-foreground">{podpis}</p>
      </div>
    </div>
  )
}
