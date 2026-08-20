import React from 'react'
import { cn } from '@/lib/utils'
import {
  Building2, Check, Shield, Mail, Phone, CalendarDays,
  ArrowRight, Quote, FileCheck2, Users2, Lock,
} from 'lucide-react'
import {
  Section, SectionHead, Eyebrow, GlowButton, GhostButton,
  Panel, IconTile, GridBackdrop, Glow, HairLine, AKCENT, akcentTlo, Stars,
} from './shared'
import { B2B_KORZYSCI, B2B_LICZBY, LOGOTYPY } from './data'
import type { HomePage as HomePageId } from './types'

const WDROZENIE = [
  { t: 'Rozmowa wstępna', d: 'Trzydzieści minut na poznanie procesów i wskazanie miejsc, gdzie AI realnie skraca pracę.', dni: 'dzień 1' },
  { t: 'Konfiguracja organizacji', d: 'Zakładamy konto firmowe, importujemy zespół, ustawiamy limity Byte i uprawnienia.', dni: 'dni 2–3' },
  { t: 'Warsztat dla zespołu', d: 'Dwie godziny praktyki na Waszych realnych zadaniach — nie na przykładach z prezentacji.', dni: 'dni 4–7' },
  { t: 'Gotowe przepływy', d: 'Budujemy automatyzacje pod Wasze procesy i przekazujemy je zespołowi do samodzielnej edycji.', dni: 'dni 8–14' },
]

const BEZPIECZENSTWO = [
  { i: Lock,       t: 'Szyfrowanie w tranzycie i spoczynku', d: 'TLS 1.3 oraz AES-256 dla danych zapisanych.' },
  { i: Shield,     t: 'Serwery w Unii Europejskiej',          d: 'Przetwarzanie wyłącznie na terenie EOG, zgodnie z RODO.' },
  { i: FileCheck2, t: 'Umowa powierzenia danych',             d: 'Standardowa umowa DPA podpisywana przed wdrożeniem.' },
  { i: Users2,     t: 'Kontrola dostępu i role',              d: 'Uprawnienia na poziomie zespołu, projektu i modułu.' },
]

export function DlaFirmPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <div className="flex w-full flex-col">

      {/* ══════════ NAGŁÓWEK ══════════ */}
      <section className="relative overflow-hidden px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <GridBackdrop />
        <Glow className="left-1/2 top-[-150px] -translate-x-1/2" size={800} opacity={0.13} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow icon={Building2} className="mb-6">Dla firm i zespołów</Eyebrow>
            <h1 className="font-heading text-[36px] font-extrabold leading-[1.07] tracking-tight text-foreground sm:text-[50px]">
              Jedna platforma AI<br />
              <span className="text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]">dla całego zespołu</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-foreground/50">
              Wspólna pula Byte, kontrola kosztów w podziale na projekty i osoby, faktura VAT w złotówkach.
              Zamiast kilkunastu subskrypcji rozproszonych po działach — jedno rozliczenie i jeden panel.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <GlowButton>Umów rozmowę</GlowButton>
              <GhostButton onClick={() => onNavigate('cennik')}>Zobacz cennik</GhostButton>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6">
              {B2B_LICZBY.map(l => (
                <div key={l.label}>
                  <p className="font-heading text-[26px] font-extrabold leading-none tracking-tight text-primary">{l.value}</p>
                  <p className="mt-2 text-[11px] leading-tight text-foreground/40">{l.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* formularz kontaktu */}
          <Panel glow className="p-7 sm:p-8">
            <h2 className="font-heading text-[19px] font-bold tracking-tight text-foreground">
              Porozmawiajmy o Waszym wdrożeniu
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/45">
              Zostaw kontakt — odpowiadamy w ciągu jednego dnia roboczego i proponujemy termin rozmowy.
            </p>

            <div className="mt-6 space-y-3.5">
              {[
                { l: 'Imię i nazwisko', p: 'Jan Kowalski' },
                { l: 'Firmowy adres e-mail', p: 'jan@firma.pl' },
                { l: 'Nazwa firmy', p: 'Firma sp. z o.o.' },
              ].map(f => (
                <label key={f.l} className="block">
                  <span className="mb-1.5 block text-[11.5px] font-medium text-foreground/50">{f.l}</span>
                  <div className="flex h-11 items-center rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-3.5">
                    <span className="text-[13px] text-foreground/25">{f.p}</span>
                  </div>
                </label>
              ))}

              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-medium text-foreground/50">Wielkość zespołu</span>
                <div className="flex gap-2">
                  {['1–10', '11–50', '51–200', '200+'].map((w, i) => (
                    <span
                      key={w}
                      className={cn(
                        'flex h-10 flex-1 items-center justify-center rounded-lg border text-[12px] font-semibold',
                        i === 1
                          ? 'border-primary/30 bg-primary/[0.08] text-primary'
                          : 'border-foreground/[0.08] bg-foreground/[0.02] text-foreground/40',
                      )}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </label>
            </div>

            <button
              type="button"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-bold uppercase tracking-[0.12em] text-background shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Wyślij zgłoszenie <ArrowRight className="h-4 w-4" />
            </button>

            <HairLine className="my-6" />

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { i: Mail, t: 'firmy@nextbyte.space' },
                { i: Phone, t: '+48 22 000 00 00' },
                { i: CalendarDays, t: 'pon.–pt. 9:00–17:00' },
              ].map(k => (
                <span key={k.t} className="flex items-center gap-2 text-[11.5px] text-foreground/45">
                  <k.i className="h-3.5 w-3.5 text-primary/60" />
                  {k.t}
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* ══════════ ZAUFALI NAM ══════════ */}
      <Section className="pb-20">
        <HairLine className="mb-9" />
        <p className="mb-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/25">
          Wdrożenia w firmach
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LOGOTYPY.map(l => (
            <span key={l} className="font-heading text-[15px] font-bold tracking-tight text-foreground/25">{l}</span>
          ))}
        </div>
      </Section>

      {/* ══════════ KORZYŚCI ══════════ */}
      <Section className="pb-24">
        <SectionHead
          eyebrow="Dlaczego zespoły wybierają NextByte"
          title="Sześć rzeczy, które robią różnicę przy skali"
          lead="Narzędzia AI kupione indywidualnie przez pracowników szybko stają się problemem: rozproszone koszty, brak kontroli nad danymi i zero wspólnej wiedzy."
          className="mb-14"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {B2B_KORZYSCI.map(k => (
            <Panel key={k.title} hover className="flex flex-col gap-4 p-6">
              <IconTile icon={k.icon} color={k.color} size="lg" />
              <h3 className="font-heading text-[16px] font-bold leading-snug tracking-tight text-foreground">{k.title}</h3>
              <p className="text-[13px] leading-relaxed text-foreground/50">{k.desc}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ══════════ WDROŻENIE ══════════ */}
      <Section className="pb-24">
        <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-14">
          <Glow className="right-[-90px] bottom-[-80px]" size={480} opacity={0.10} />
          <div className="relative z-10">
            <SectionHead
              eyebrow="Wdrożenie"
              title="Dwa tygodnie od rozmowy do pełnej pracy zespołu"
              align="left"
              className="mb-12 max-w-2xl"
            />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {WDROZENIE.map((w, i) => (
                <div key={w.t} className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.08] font-mono text-[12px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/30">
                      {w.dni}
                    </span>
                  </div>
                  <h3 className="font-heading text-[15px] font-bold tracking-tight text-foreground">{w.t}</h3>
                  <p className="text-[12.5px] leading-relaxed text-foreground/50">{w.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Section>

      {/* ══════════ BEZPIECZEŃSTWO ══════════ */}
      <Section className="pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <SectionHead
            eyebrow="Bezpieczeństwo"
            eyebrowIcon={Shield}
            eyebrowColor={AKCENT.notes}
            title="Dane zostają tam, gdzie mają zostać"
            lead="Materiały przetwarzane w NextByte nie są wykorzystywane do trenowania modeli. Dla dokumentów objętych tajemnicą zespół może pracować wyłącznie na modelach lokalnych."
            align="left"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {BEZPIECZENSTWO.map(b => (
              <Panel key={b.t} className="flex flex-col gap-3 p-5">
                <IconTile icon={b.i} color={AKCENT.notes} size="md" />
                <h3 className="text-[13.5px] font-bold leading-snug text-foreground">{b.t}</h3>
                <p className="text-[12px] leading-relaxed text-foreground/45">{b.d}</p>
              </Panel>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ STUDIUM PRZYPADKU ══════════ */}
      <Section className="pb-24">
        <Panel className="relative overflow-hidden p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 60% 70% at 15% 20%, ${akcentTlo(AKCENT.chat, 10)}, transparent)` }}
          />
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-5">
              <Quote className="h-8 w-8 text-primary/25" />
              <p className="font-heading text-[19px] font-medium leading-relaxed tracking-tight text-foreground/85 sm:text-[22px]">
                „Mieliśmy jedenaście indywidualnych subskrypcji rozsianych po trzech działach.
                Nikt nie wiedział, ile realnie wydajemy na AI. Po przejściu na NextByte mamy jedną fakturę,
                jeden panel i pierwszy raz konkretne dane o tym, kto i na co zużywa moc obliczeniową.”
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full font-heading text-[15px] font-bold text-primary"
                  style={{ background: akcentTlo(AKCENT.chat, 14) }}
                >
                  P
                </span>
                <span>
                  <span className="block text-[13.5px] font-bold text-foreground">Piotr Zawadzki</span>
                  <span className="block text-[11.5px] text-foreground/40">Dyrektor operacyjny · Grupa Atlas</span>
                </span>
                <Stars n={5} size={12} />
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-3 gap-5 lg:grid-cols-1 lg:gap-6 lg:border-l lg:border-foreground/[0.07] lg:pl-12">
              {[
                { v: '11 → 1', l: 'subskrypcji' },
                { v: '−43%', l: 'kosztu miesięcznego' },
                { v: '68', l: 'osób w organizacji' },
              ].map(s => (
                <div key={s.l}>
                  <p className="font-heading text-[24px] font-extrabold leading-none tracking-tight text-foreground">{s.v}</p>
                  <p className="mt-1.5 text-[11px] text-foreground/40">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <Section className="pb-24">
        <Panel glow className="relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <GridBackdrop className="opacity-[0.25]" />
          <Glow className="left-1/2 top-[-100px] -translate-x-1/2" size={640} opacity={0.18} />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="font-heading text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[42px]">
              Zacznijmy od rozmowy
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-foreground/55">
              Trzydzieści minut wystarczy, żeby ocenić, czy NextByte ma sens w Waszej organizacji.
              Bez prezentacji sprzedażowej — rozmawiamy o konkretnych procesach.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <GlowButton>Umów rozmowę</GlowButton>
              <GhostButton onClick={() => onNavigate('home')}>Wróć do strony głównej</GhostButton>
            </div>
          </div>
        </Panel>
      </Section>
    </div>
  )
}
