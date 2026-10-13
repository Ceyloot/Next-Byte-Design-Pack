import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Building2, Mail, MessageSquare, Phone, User } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════
   FORMULARZ KONTAKTOWY — „Umów bezpłatną rozmowę"
   Trzy kroki: dane kontaktowe → potrzeba → termin. Szklana karta na tle
   siatki i okręgów; po bokach rozmyte panele (czysta dekoracja).
   Kolory wyłącznie z tokenów motywu.
   ═══════════════════════════════════════════════════════════════════════ */

const KROKI = ['Dane', 'Potrzeba', 'Termin'] as const
const TEMATY = ['Automatyzacja procesów', 'Chat AI dla zespołu', 'Wdrożenie w firmie', 'Inne'] as const
const TERMINY = ['Jak najszybciej', 'W tym tygodniu', 'W przyszłym tygodniu'] as const

type Dane = {
  imie: string; nazwisko: string; firma: string; telefon: string; email: string
  temat: string; opis: string; termin: string
}
const PUSTE: Dane = { imie: '', nazwisko: '', firma: '', telefon: '', email: '', temat: '', opis: '', termin: '' }

function Pole({
  etykieta, wartosc, onChange, typ = 'text', placeholder, ikona: Ikona, blad, autoComplete,
}: {
  etykieta: string; wartosc: string; onChange: (v: string) => void
  typ?: string; placeholder?: string; ikona: React.ElementType; blad?: boolean; autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {etykieta} <span className="text-primary">*</span>
      </span>
      <span
        className={cn(
          'flex items-center gap-2.5 rounded-xl border bg-background/45 px-3.5 py-3 backdrop-blur-md',
          'shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.04)] transition-[border-color,box-shadow] duration-200',
          'focus-within:border-primary/50 focus-within:shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.04),0_0_0_3px_hsl(var(--primary)/0.14)]',
          blad ? 'border-destructive/60' : 'border-foreground/[0.1]',
        )}
      >
        <Ikona className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type={typ}
          value={wartosc}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </span>
    </label>
  )
}

/* Boczne panele: prawdziwe, ale rozmyte i wygaszone ku brzegowi okna mini-widoki
   produktu (czat, wykres, statystyki). Płyną powoli w górę i w dół, każdy
   w innym tempie, żeby tło żyło bez odciągania uwagi od formularza. */
function PanelDekor({ strona }: { strona: 'lewo' | 'prawo' }) {
  const lewo = strona === 'lewo'
  const slupki = lewo ? [38, 62, 45, 80, 58, 92, 70] : [55, 40, 75, 50, 88, 64, 96]
  return (
    <div
      aria-hidden
      className={cn(
        'fz-panel pointer-events-none absolute top-1/2 hidden h-[72%] w-[21%] -translate-y-1/2 flex-col gap-4 xl:flex',
        lewo ? 'left-[2.5%] [--fz-kat:14deg]' : 'right-[2.5%] [--fz-kat:-14deg]',
      )}
      style={{
        maskImage: `linear-gradient(${lewo ? '90deg' : '270deg'}, #000 25%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(${lewo ? '90deg' : '270deg'}, #000 25%, transparent 100%)`,
      }}
    >
      <div className="fz-plyn flex flex-1 flex-col justify-between rounded-2xl border border-foreground/[0.12] bg-card/55 p-4 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16)] backdrop-blur-xl" style={{ animationDelay: lewo ? '0s' : '-3s' }}>
        <div className="flex items-center justify-between">
          <span className="h-2.5 w-16 rounded-full bg-foreground/25" />
          <span className="h-5 w-5 rounded-full bg-primary/50 shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {slupki.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/15 to-primary/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="fz-plyn flex flex-1 flex-col justify-center gap-2.5 rounded-2xl border border-foreground/[0.12] bg-card/55 p-4 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16)] backdrop-blur-xl" style={{ animationDelay: lewo ? '-2s' : '-5s' }}>
        <span className="h-7 w-[72%] rounded-xl rounded-bl-sm bg-foreground/[0.12]" />
        <span className="ml-auto h-7 w-[58%] rounded-xl rounded-br-sm bg-primary/35" />
        <span className="h-7 w-[84%] rounded-xl rounded-bl-sm bg-foreground/[0.12]" />
      </div>
      <div className="fz-plyn grid flex-1 grid-cols-2 gap-3 rounded-2xl border border-foreground/[0.12] bg-card/55 p-4 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16)] backdrop-blur-xl" style={{ animationDelay: lewo ? '-4s' : '-1s' }}>
        {[0, 1].map(i => (
          <div key={i} className="flex flex-col justify-center gap-2">
            <span className="h-6 w-14 rounded-md bg-foreground/30" />
            <span className="h-2 w-full rounded-full bg-foreground/15" />
          </div>
        ))}
      </div>
    </div>
  )
}

const STYLE = `
@keyframes fz-dryf-a { 0%,100% { transform: translate3d(-6%,-4%,0) scale(1) } 50% { transform: translate3d(8%,6%,0) scale(1.15) } }
@keyframes fz-dryf-b { 0%,100% { transform: translate3d(7%,5%,0) scale(1.1) } 50% { transform: translate3d(-8%,-6%,0) scale(0.95) } }
@keyframes fz-obrot { to { transform: rotate(360deg) } }
@keyframes fz-plyn { 0%,100% { transform: perspective(900px) rotateY(var(--fz-kat)) translateY(-10px) } 50% { transform: perspective(900px) rotateY(var(--fz-kat)) translateY(10px) } }
@keyframes fz-wejscie { from { opacity: 0; transform: translateY(18px) scale(.985) } to { opacity: 1; transform: none } }
@keyframes fz-krok { from { opacity: 0; transform: translateX(14px) } to { opacity: 1; transform: none } }
@keyframes fz-blysk { 0% { transform: translateX(-130%) skewX(-18deg) } 60%,100% { transform: translateX(230%) skewX(-18deg) } }
.fz-plyn { animation: fz-plyn 11s ease-in-out infinite; }
.fz-orb-a { animation: fz-dryf-a 18s ease-in-out infinite; }
.fz-orb-b { animation: fz-dryf-b 22s ease-in-out infinite; }
.fz-pierscien { animation: fz-obrot 60s linear infinite; }
.fz-pierscien-wstecz { animation: fz-obrot 90s linear infinite reverse; }
.fz-karta { animation: fz-wejscie .7s cubic-bezier(.2,.7,.2,1) both; }
.fz-krok { animation: fz-krok .35s cubic-bezier(.2,.7,.2,1) both; }
.fz-przycisk::after { content:''; position:absolute; inset:0; width:40%; background:linear-gradient(90deg,transparent,hsl(0 0% 100%/.28),transparent); animation: fz-blysk 3.6s ease-in-out infinite; }
/* Ramka karty: świetlisty łuk okrąża szkło (conic-gradient w masce 1px) */
.fz-ramka { position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
  background: conic-gradient(from var(--fz-a,0deg), transparent 0 55%, hsl(var(--primary)/.85) 75%, transparent 92%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); animation: fz-ramka 7s linear infinite; }
@property --fz-a { syntax:'<angle>'; inherits:false; initial-value:0deg }
@keyframes fz-ramka { to { --fz-a: 360deg } }
/* Jasne motywy: poświata słabsza, żeby nasycony akcent nie robił sinej plamy (CLAUDE.md §1.3) */
.future-theme .fz-orb { opacity: .35 }
@media (prefers-reduced-motion: reduce) {
  .fz-plyn,.fz-orb-a,.fz-orb-b,.fz-pierscien,.fz-pierscien-wstecz,.fz-karta,.fz-krok,.fz-przycisk::after,.fz-ramka { animation: none }
}
`

export function FormularzPage() {
  const [krok, setKrok] = useState(0)
  const [d, setD] = useState<Dane>(PUSTE)
  const [proba, setProba] = useState(false)
  const [wyslano, setWyslano] = useState(false)
  const ustaw = (k: keyof Dane) => (v: string) => setD(p => ({ ...p, [k]: v }))

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)
  const telOk = d.telefon.replace(/\D/g, '').length >= 9
  const bledy = {
    imie: !d.imie.trim(), nazwisko: !d.nazwisko.trim(), firma: !d.firma.trim(),
    telefon: !telOk, email: !emailOk,
  }
  const krok0Ok = !Object.values(bledy).some(Boolean)
  const krokOk = krok === 0 ? krok0Ok : krok === 1 ? !!d.temat : !!d.termin

  const dalej = () => {
    setProba(true)
    if (!krokOk) return
    setProba(false)
    if (krok < KROKI.length - 1) setKrok(krok + 1)
    else setWyslano(true)
  }

  return (
    <div className="relative isolate flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-background font-landing text-foreground">
      <style>{STYLE}</style>

      {/* Tło: poświaty, siatka, obracające się pierścienie, winieta i ziarno */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="fz-orb fz-orb-a absolute -left-[8%] top-[6%] h-[62%] w-[46%] rounded-full bg-primary/25 blur-[110px]" />
        <div className="fz-orb fz-orb-b absolute -right-[6%] bottom-[0%] h-[58%] w-[44%] rounded-full bg-[hsl(var(--primary)/0.16)] blur-[120px]" />
        <div className="fz-orb absolute left-1/2 top-[38%] h-[46%] w-[34%] -translate-x-1/2 rounded-full bg-primary/15 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)/0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 48%, #000 25%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 48%, #000 25%, transparent 100%)',
          }}
        />
        <svg className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 800 800" fill="none">
          <g stroke="hsl(var(--foreground))" strokeOpacity="0.1">
            <circle cx="400" cy="400" r="190" />
            <circle cx="400" cy="400" r="290" />
            <circle cx="400" cy="400" r="390" strokeDasharray="2 8" />
          </g>
          <g className="fz-pierscien" style={{ transformOrigin: '400px 400px' }}>
            <circle cx="400" cy="400" r="290" stroke="hsl(var(--primary))" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="90 1730" strokeLinecap="round" />
            <circle cx="400" cy="110" r="4" fill="hsl(var(--primary))" />
          </g>
          <g className="fz-pierscien-wstecz" style={{ transformOrigin: '400px 400px' }}>
            <circle cx="400" cy="400" r="390" stroke="hsl(var(--primary))" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="140 2310" strokeLinecap="round" />
            <circle cx="400" cy="10" r="3" fill="hsl(var(--primary))" fillOpacity="0.8" />
          </g>
        </svg>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, hsl(var(--background)) 100%)' }} />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
        />
      </div>

      <PanelDekor strona="lewo" />
      <PanelDekor strona="prawo" />

      {/* Nagłówek */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <span className="text-[15px] font-bold tracking-[0.18em]">NEXTBYTE</span>
        <nav aria-label="Nawigacja" className="hidden items-center gap-1 rounded-xl border border-foreground/[0.1] bg-card/45 p-1 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.14)] backdrop-blur-xl sm:flex">
          {[Building2, MessageSquare, Mail].map((I, i) => (
            <span key={i} className={cn('grid h-9 w-9 place-items-center rounded-lg text-muted-foreground', i === 2 && 'bg-foreground/[0.06] text-foreground')}>
              <I className="h-4 w-4" />
            </span>
          ))}
        </nav>
        <button
          type="button"
          className="rounded-lg border border-foreground/[0.14] bg-card/50 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition-colors hover:border-primary/50 hover:text-primary"
        >
          [ Zaloguj się ]
        </button>
      </header>

      {/* Karta */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className="fz-karta relative isolate w-full max-w-[520px] rounded-[20px] border border-foreground/[0.13] bg-[color-mix(in_srgb,hsl(var(--card))_72%,transparent)] p-6 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.16),0_2px_5px_-1px_hsl(0_0%_0%/0.04),0_24px_64px_-12px_hsl(var(--primary)/0.22),0_12px_32px_-8px_hsl(0_0%_0%/0.18)] backdrop-blur-[22px] backdrop-saturate-[150%] md:p-8">
          <span aria-hidden className="fz-ramka" />
          <span aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
          {wyslano ? (
            <div className="flex flex-col items-center py-8 text-center" role="status">
              <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/15 text-primary">
                <Check className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Dziękujemy, {d.imie}!</h2>
              <p className="mt-2 max-w-[360px] text-sm text-muted-foreground">
                Odezwiemy się na numer {d.telefon} w terminie: {d.termin.toLowerCase()}. Potwierdzenie wyślemy na {d.email}.
              </p>
              <button
                type="button"
                onClick={() => { setD(PUSTE); setKrok(0); setWyslano(false); setProba(false) }}
                className="mt-6 rounded-xl border border-foreground/[0.14] bg-card/50 px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
              >
                Wypełnij ponownie
              </button>
            </div>
          ) : (
            <>
              {/* Postęp */}
              <div
                className="mb-6 flex gap-2"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={KROKI.length}
                aria-valuenow={krok + 1}
                aria-label={`Krok ${krok + 1} z ${KROKI.length}: ${KROKI[krok]}`}
              >
                {KROKI.map((k, i) => (
                  <span
                    key={k}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      i <= krok ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]' : 'bg-foreground/[0.12]',
                    )}
                  />
                ))}
              </div>

              <h1 className="text-[26px] font-bold leading-tight tracking-tight md:text-[30px]">Umów bezpłatną rozmowę</h1>
              <p className="mb-6 mt-1.5 text-sm text-muted-foreground">
                {krok === 0 && 'Zostaw dane — oddzwonimy i dopasujemy rozwiązanie do Twojej firmy.'}
                {krok === 1 && 'W czym możemy pomóc? Wybierz temat i opisz krótko potrzebę.'}
                {krok === 2 && 'Kiedy najlepiej się odezwać?'}
              </p>

              <form key={krok} onSubmit={e => { e.preventDefault(); dalej() }} noValidate className="fz-krok space-y-4">
                {krok === 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Pole etykieta="Imię" ikona={User} wartosc={d.imie} onChange={ustaw('imie')} placeholder="Jan" blad={proba && bledy.imie} autoComplete="given-name" />
                      <Pole etykieta="Nazwisko" ikona={User} wartosc={d.nazwisko} onChange={ustaw('nazwisko')} placeholder="Kowalski" blad={proba && bledy.nazwisko} autoComplete="family-name" />
                    </div>
                    <Pole etykieta="Nazwa firmy" ikona={Building2} wartosc={d.firma} onChange={ustaw('firma')} placeholder="Twoja firma sp. z o.o." blad={proba && bledy.firma} autoComplete="organization" />
                    <Pole etykieta="Telefon" typ="tel" ikona={Phone} wartosc={d.telefon} onChange={ustaw('telefon')} placeholder="+48 600 000 000" blad={proba && bledy.telefon} autoComplete="tel" />
                    <Pole etykieta="E-mail" typ="email" ikona={Mail} wartosc={d.email} onChange={ustaw('email')} placeholder="jan@firma.pl" blad={proba && bledy.email} autoComplete="email" />
                  </>
                )}

                {krok === 1 && (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Temat">
                      {TEMATY.map(t => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={d.temat === t}
                          onClick={() => ustaw('temat')(t)}
                          className={cn(
                            'rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-all duration-150',
                            d.temat === t
                              ? 'border-primary/55 bg-primary/15 text-foreground shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.25)]'
                              : 'border-foreground/[0.1] bg-background/45 text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {proba && !d.temat && <p className="text-xs text-destructive">Wybierz temat rozmowy.</p>}
                    <label className="block">
                      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Opis (opcjonalnie)</span>
                      <textarea
                        value={d.opis}
                        onChange={e => ustaw('opis')(e.target.value)}
                        rows={4}
                        placeholder="Czym zajmuje się firma, co chcesz usprawnić?"
                        className="w-full resize-none rounded-xl border border-foreground/[0.1] bg-background/45 px-3.5 py-3 text-sm text-foreground shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.04)] outline-none backdrop-blur-md placeholder:text-muted-foreground/60 focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.14)]"
                      />
                    </label>
                  </>
                )}

                {krok === 2 && (
                  <>
                    <div className="space-y-2" role="radiogroup" aria-label="Termin">
                      {TERMINY.map(t => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={d.termin === t}
                          onClick={() => ustaw('termin')(t)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-all duration-150',
                            d.termin === t
                              ? 'border-primary/55 bg-primary/15 text-foreground shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.25)]'
                              : 'border-foreground/[0.1] bg-background/45 text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                          )}
                        >
                          {t}
                          {d.termin === t && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                    {proba && !d.termin && <p className="text-xs text-destructive">Wybierz preferowany termin.</p>}
                  </>
                )}

                <div className="flex items-center gap-2.5 pt-2">
                  {krok > 0 && (
                    <button
                      type="button"
                      onClick={() => { setProba(false); setKrok(krok - 1) }}
                      aria-label="Wstecz"
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-foreground/[0.14] bg-card/50 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="fz-przycisk group relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary/60 bg-primary/20 text-[14.5px] font-semibold shadow-[0_0_24px_-2px_hsl(var(--primary)/0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-xl transition-all duration-200 hover:border-primary hover:bg-primary/30 active:scale-[0.99]"
                  >
                    {krok < KROKI.length - 1 ? 'Dalej' : 'Wyślij zgłoszenie'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>

              <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
                Administratorem danych jest NextByte. Dane przetwarzamy w celu kontaktu w sprawie rozmowy — szczegóły w{' '}
                <span className="text-foreground/80 underline underline-offset-2">Polityce prywatności</span>.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
