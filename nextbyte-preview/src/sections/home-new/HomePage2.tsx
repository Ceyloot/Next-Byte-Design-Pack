import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Zap, Shield, Cpu, WifiOff,
  Building2, Lock, LogOut, CircleCheck, X,
  Mic, Camera, NotebookPen, ArrowRight,
} from 'lucide-react'
import {
  Section, SectionHead, GlowButton, GhostButton,
  Panel, IconTile, StepNumber, Glow, PageAmbience,
  HairLine, akcentTlo, AnimStyles, FadeIn, Stars,
  TechDivider, TechCornerMarks, GridBackdrop,
} from './shared'
import {
  MODULY, TECH_PARTNERZY, STATY, WARTOSCI_FILARY, KROKI,
  POROWNANIE, OPINIE, FAQ,
} from './data'
import {
  HeroAppMockup, ModelEcosystemBridge, ChaosVsUnifiedCard,
  HemisphereArchSection, FaqRow, SecRule, CHIP_DATA,
  OpenAIIcon, AnthropicIcon, NextByteMarkIcon,
} from './HomePage'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════════════
   STRONA GŁÓWNA 2 — wariant „flow state" inspirowany alle-ai.com / ninjachat.ai

   To NIE jest kopia „Strony głównej NEW" w nowym opakowaniu — układ sekcji,
   pasek logo, panel „modele na żywo" i siatki kart są własną kompozycją.
   Ale KOMPLET treści jest zachowany: realne komponenty graficzne
   (HeroAppMockup, ModelEcosystemBridge, ChaosVsUnifiedCard,
   HemisphereArchSection — wyeksportowane z HomePage.tsx, użyte 1:1),
   tabela porównawcza, sekcja lokalnego AI, bezpieczeństwo danych, FAQ —
   ORAZ dwa zestawy danych z data.ts, które w oryginale nie są nigdzie
   renderowane (WARTOSCI_FILARY, KROKI) — tutaj dostają swoje miejsce.

   Zero komponentu `Eyebrow` (pigułka/badge) — wszędzie płaski `SecRule`.
   ═══════════════════════════════════════════════════════════════════════ */

/** Nieskończenie przewijający się pasek log — wzorowany na pasku modeli
 *  z alle-ai.com. Lista zduplikowana 2x, animacja przesuwa dokładnie o 50%
 *  szerokości, więc pętla jest bez szwu. */
function LogoMarquee() {
  const podwojone = [...TECH_PARTNERZY, ...TECH_PARTNERZY]
  return (
    <div aria-hidden className="relative w-full overflow-hidden py-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max items-center gap-10 nb-marquee">
        {podwojone.map((nazwa, i) => (
          <span
            key={`${nazwa}-${i}`}
            className="shrink-0 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-foreground/25"
          >
            {nazwa}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Panel „modele na żywo" — jeden duży, przeszklony blok z przełącznikiem
 *  modeli AI z pierwszego modułu (Chat), używa prawdziwych ikon marek
 *  z CHIP_DATA zamiast płaskich pigułek tekstowych. */
function LiveModelsPanel() {
  const chat = MODULY[0]
  const chipy = CHIP_DATA[chat.id]
  return (
    <Panel glow className="relative overflow-hidden p-7 sm:p-9">
      <Glow className="-right-24 -top-24" size={420} opacity={0.16} />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon={chat.icon} color={chat.color} size="lg" />
            <div>
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-primary/80">{chat.tag}</p>
              <h3 className="font-heading text-[19px] font-extrabold text-foreground">{chat.title}</h3>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-primary sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Na żywo
          </span>
        </div>

        <p className="text-[14.5px] leading-relaxed text-foreground/55">{chat.lead}</p>

        <div className="flex flex-wrap gap-2">
          {chipy.map((chip, idx) => {
            const ChipIcon = chip.icon
            return (
              <span
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-3 py-1.5"
              >
                <ChipIcon className="h-4 w-4 text-foreground/70 shrink-0" />
                <span className="font-mono text-[11.5px] font-semibold text-foreground/70">{chip.label}</span>
              </span>
            )
          })}
        </div>

        <HairLine />

        <ul className="space-y-2.5">
          {chat.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/60">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

/** Pasek telemetrii — te same 4 liczby co w STATY, w pionowym panelu
 *  towarzyszącym LiveModelsPanel (kompozycja 2-kolumnowa jak w alle-ai). */
function TelemetryPanel() {
  return (
    <Panel className="flex flex-col justify-between gap-6 p-7 sm:p-9">
      <div>
        <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/35">Telemetria platformy</p>
        <h3 className="mt-1.5 font-heading text-[17px] font-extrabold text-foreground">Liczby, nie obietnice</h3>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {STATY.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1">
              <Icon className="h-4 w-4 text-primary/70" />
              <p className="font-heading text-2xl font-extrabold leading-none tracking-tight text-foreground">{s.value}</p>
              <p className="text-[11px] font-medium leading-tight text-foreground/45">{s.label}</p>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export function HomePage2({ onNavigate = () => {} }: { onNavigate?: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nb-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .nb-marquee { animation: nb-marquee-scroll 32s linear infinite; }
      ` }} />
      <PageAmbience />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <GridBackdrop />
        <Glow className="left-1/2 top-[-160px] -translate-x-1/2" size={1000} opacity={0.14} />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground/40">
              <Zap className="h-3 w-3 text-primary" />
              Platforma AI po polsku
            </div>
          </FadeIn>

          <FadeIn delay={60}>
            <h1 className="mt-6 font-heading text-[clamp(38px,6vw,76px)] font-light leading-[1.03] tracking-[-2px]">
              <span className="block font-normal text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.45)]">NextByte.</span>
              <span className="block font-light text-foreground">Twoje AI w jednym miejscu.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={120}>
            <p className="mt-6 max-w-2xl font-sans text-[clamp(14.5px,1.15vw,16.5px)] font-light leading-[1.6] text-foreground/70">
              Dostęp do GPT-5, Claude, Gemini i Groka, generowanie grafik 4K oraz inteligentna baza wiedzy w jednym spójnym panelu — w 100% po polsku, na serwerach w UE i od 0 zł.
            </p>
          </FadeIn>

          <FadeIn delay={180}>
            <div className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row">
              <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
              <GhostButton onClick={() => onNavigate('cennik')}>Zobacz cennik i pakiety</GhostButton>
            </div>
          </FadeIn>
        </div>

        {/* ── Prawdziwy mockup aplikacji — ten sam komponent co „Strona główna NEW" ── */}
        <div className="relative z-10 mx-auto mt-8 w-full max-w-6xl px-2 sm:px-4">
          <HeroAppMockup />
        </div>

        {/* ── Pasek logo — pętla bez szwu, wzorowana na alle-ai.com ── */}
        <FadeIn delay={100}>
          <div className="relative z-10 mx-auto mt-12 w-full max-w-5xl">
            <p className="mb-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/30">
              Jedna pula Byte — wszystkie topowe silniki
            </p>
            <LogoMarquee />
          </div>
        </FadeIn>
      </section>

      {/* ══════════ MODELE NA ŻYWO + TELEMETRIA ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <LiveModelsPanel />
            <TelemetryPanel />
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ MOST EKOSYSTEMU MODELI (grafika) ══════════ */}
      <Section className="relative z-10 py-6">
        <FadeIn>
          <SecRule label="Ekosystem modeli" />
          <ModelEcosystemBridge />
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ MANIFEST: CHAOS VS NEXTBYTE (grafika) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5 space-y-5 lg:pt-2">
              <SecRule label="Dlaczego NextByte" />
              <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.12] tracking-[-1.5px] text-foreground">
                Jeden abonament zamiast <br />
                <span className="text-primary font-normal">pięciu osobnych.</span>
              </h2>
              <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-lg font-light">
                Koniec z przepłacaniem za osobne konta w USD. Korzystaj z topowych modeli AI, studia grafik i bazy wiedzy w ramach jednej elastycznej puli Byte.
              </p>
              <div className="pt-2">
                <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
              </div>
            </div>
            <div className="lg:col-span-7">
              <ChaosVsUnifiedCard />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ ŁUK HEMISPHERE (grafika) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <HemisphereArchSection />
        </FadeIn>
      </Section>

      {/* ══════════ SIATKA MODUŁÓW ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SectionHead
            eyebrow="Sześć modułów"
            title={<>Najlepsze modele <span className="font-normal text-primary">do każdego zadania.</span></>}
            lead="Pod każdym modułem kilka silników AI — dobranych pod to, co faktycznie robisz. Wszystkie z jednej puli Byte."
            className="mb-12"
          />
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULY.map((m, i) => (
            <FadeIn key={m.id} delay={i * 60}>
              <Panel hover className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <IconTile icon={m.icon} color={m.color} size="lg" />
                  <span
                    className="rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-widest"
                    style={{ color: m.color, borderColor: akcentTlo(m.color, 28), background: akcentTlo(m.color, 8) }}
                  >
                    {m.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading text-[16.5px] font-extrabold leading-snug text-foreground">{m.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/55">{m.lead}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {CHIP_DATA[m.id].map((chip, idx) => {
                    const ChipIcon = chip.icon
                    return (
                      <span key={idx} className="flex items-center gap-1.5 rounded-md bg-foreground/[0.05] px-2 py-1">
                        <ChipIcon className="h-3.5 w-3.5 text-foreground/60 shrink-0" />
                        <span className="font-mono text-[10.5px] font-semibold text-foreground/50">{chip.label}</span>
                      </span>
                    )
                  })}
                </div>
              </Panel>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ TRZY FILARY ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Trzy filary" />
        </FadeIn>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WARTOSCI_FILARY.map((f, i) => (
            <FadeIn key={f.tag} delay={i * 80}>
              <div
                className="h-full rounded-2xl border border-foreground/[0.07] bg-foreground/[0.02] p-6"
                style={{ borderLeftColor: f.accent, borderLeftWidth: 3 }}
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: f.accent }}>
                  {f.tag}
                </p>
                <h3 className="mt-3 font-heading text-[17px] font-extrabold leading-snug text-foreground">{f.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-foreground/55">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ LOKALNY AI ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Prywatność" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-3 max-w-2xl tracking-[-2px]">
            Prywatne AI na Twoim sprzęcie.
          </h2>
          <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-xl mb-8 font-light">
            Llama, Mistral i DeepSeek bezpośrednio na Twoim GPU przez Ollama i LM Studio. 100% prywatności, zero opłat i nielimitowane działanie offline.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Shield, title: '100% na Twoim dysku', desc: 'Przetwarzanie lokalne przez procesor i kartę graficzną bez wysyłania danych do chmury.' },
              { icon: Cpu, title: 'Działa z Llama i Ollama', desc: 'Natywna integracja z darmowymi programami Ollama i LM Studio jednym kliknięciem.' },
              { icon: WifiOff, title: 'Za 0 zł i bez limitów', desc: 'Nielimitowana praca w trybie offline bez zużywania jednostek Byte i abonamentów.' },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <FadeIn key={item.title} delay={i * 80}>
                  <Panel hover className="p-6">
                    <IconTile icon={ItemIcon} size="lg" />
                    <h3 className="mt-4 font-heading text-[16px] font-bold text-foreground leading-snug">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground/55">{item.desc}</p>
                  </Panel>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ JAK TO DZIAŁA ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SectionHead
            eyebrow="Start w 3 krokach"
            title="Od rejestracji do pierwszego wyniku"
            lead="Zero konfiguracji, zero kart kredytowych na start."
            className="mb-12"
          />
        </FadeIn>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {KROKI.map((k, i) => (
            <FadeIn key={k.krok} delay={i * 80}>
              <div className="flex flex-col gap-3">
                <StepNumber n={i + 1} />
                <h3 className="font-heading text-[15.5px] font-extrabold leading-snug text-foreground">{k.title}</h3>
                <p className="text-[13px] leading-relaxed text-foreground/55">{k.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ PORÓWNANIE ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Porównanie" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            NextByte zamiast <span className="text-primary font-normal">pięciu subskrypcji.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-10 font-light">
            Zestawienie funkcji, które w innych narzędziach wymagają osobnych planów w obcych walutach i generują chaos faktur.
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="relative">
            <TechCornerMarks />
            <Panel className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm font-sans">
                <thead>
                  <tr className="border-b border-foreground/[0.07]">
                    <th className="px-5 py-5 text-left text-[12px] font-medium text-foreground/40 font-mono">Funkcja</th>
                    {POROWNANIE.kolumny.map((k, i) => (
                      <th key={k} className="px-4 py-5 text-center">
                        {i === 0 ? (
                          <span className="font-heading text-[14px] font-semibold text-primary">{k}</span>
                        ) : (
                          <span className="font-heading text-[12.5px] font-medium text-foreground/40">{k}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POROWNANIE.wiersze.map((r, ri) => (
                    <tr
                      key={r.f}
                      className={cn(
                        'border-b border-foreground/[0.04] last:border-b-0 transition-colors hover:bg-foreground/[0.02]',
                        ri % 2 === 0 && 'bg-foreground/[0.008]',
                      )}
                    >
                      <td className="px-5 py-3.5 text-[13px] font-medium text-foreground/70 font-sans">{r.f}</td>
                      {r.v.map((v, vi) => (
                        <td key={vi} className={cn('px-4 py-3.5 text-center', vi === 0 && 'bg-primary/[0.035]')}>
                          {v === true ? (
                            <CircleCheck className="mx-auto h-[18px] w-[18px] text-primary" />
                          ) : v === false ? (
                            <X className="mx-auto h-5 w-5 text-foreground/25 font-bold" />
                          ) : (
                            <span className={cn('font-sans text-[12.5px] font-semibold', vi === 0 ? 'text-primary' : 'text-foreground/50')}>
                              {v}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-6 rounded-2xl border border-foreground/[0.08] bg-card/50 backdrop-blur-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 text-foreground/50">
                  <OpenAIIcon className="h-7 w-7" />
                  <AnthropicIcon className="h-7 w-7" />
                  <Camera className="h-7 w-7" />
                  <NotebookPen className="h-7 w-7" />
                  <Mic className="h-7 w-7" />
                </div>
                <span className="font-heading text-[17px] font-medium text-foreground/35 line-through decoration-destructive/60 ml-1">
                  ~450 zł/mc
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-primary/40 shrink-0 hidden sm:block" />
              <div className="flex items-center gap-3">
                <NextByteMarkIcon className="h-8 w-8 text-primary shrink-0" />
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-[26px] font-bold text-foreground leading-none">
                    od <span className="text-primary">0 zł</span>
                  </span>
                  <span className="text-[12.5px] text-foreground/50 font-light">
                    (lub 99 zł w pakiecie)
                  </span>
                </div>
              </div>
            </div>
            <GlowButton onClick={() => onNavigate('cennik')} className="shrink-0 md:self-center">
              Sprawdź cennik i pakiety
            </GlowButton>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ BEZPIECZEŃSTWO DANYCH ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Bezpieczeństwo" />
          <h2 className="font-heading text-[clamp(26px,3.8vw,40px)] font-light leading-[1.1] text-foreground mb-3 tracking-[-1.5px] max-w-2xl">
            Twoje dane są tylko <span className="text-primary font-normal">Twoje.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-10 font-light">
            Żaden gigant się nie szkoli na Twoich rozmowach. Nikt nie ma wglądu w Twoje dokumenty. To nie jest klauzula regulaminowa — to architektura platformy.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: 'Serwery w UE', sentence: 'Dane w Unii Europejskiej, pełna zgodność z RODO.' },
              { icon: Lock, title: 'Zero trenowania', sentence: 'Nikt nie szkoli modeli na Twoich danych.' },
              { icon: WifiOff, title: 'Zero wglądu z zewnątrz', sentence: 'Lokalny AI — dane nie opuszczają urządzenia.' },
              { icon: LogOut, title: 'Rezygnujesz kiedy chcesz', sentence: 'Jedno kliknięcie — dane usunięte w 30 dni.' },
            ].map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.title} className="group flex flex-col items-center text-center gap-3 rounded-xl border border-foreground/[0.07] bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/70">
                  <IconTile icon={ItemIcon} size="lg" />
                  <h3 className="font-heading text-[14.5px] font-semibold text-foreground leading-snug">{item.title}</h3>
                  <p className="font-sans text-[12px] text-foreground/50 font-light leading-snug">{item.sentence}</p>
                </div>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ OPINIE ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SectionHead
            eyebrow="Zaufanie użytkowników"
            title="Nie nasze słowa. Ich wyniki."
            className="mb-12"
          />
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {OPINIE.map((o, i) => (
            <FadeIn key={o.id} delay={i * 80}>
              <Panel hover className="flex h-full flex-col gap-4 p-6">
                <Stars n={5} size={13} />
                <p className="text-[13.5px] leading-relaxed text-foreground/70">„{o.tekst}"</p>
                <div className="mt-auto pt-2">
                  <HairLine className="mb-3" />
                  <p className="font-heading text-[13px] font-bold text-foreground">{o.kategoria}</p>
                  <p className="text-[11.5px] text-foreground/45">{o.rola}</p>
                  <p className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-primary">{o.metryka}</p>
                </div>
              </Panel>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SectionHead eyebrow="Pytania" title="Wszystko, co warto wiedzieć przed startem." className="mb-10 items-start text-left" align="left" />
        </FadeIn>
        <FadeIn delay={100} className="mx-auto max-w-3xl space-y-2.5">
          {FAQ.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
          ))}
        </FadeIn>
      </Section>

      {/* ══════════ CTA KOŃCOWE ══════════ */}
      <Section className="relative z-10 py-20 sm:py-28">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent px-6 py-16 text-center sm:px-12">
            <Glow className="left-1/2 top-0 -translate-x-1/2" size={700} opacity={0.18} />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <SecRule label="Gotowy?" />
              <h2 className="max-w-2xl font-heading text-[clamp(26px,4vw,40px)] font-light leading-[1.1] tracking-[-1.5px] text-foreground">
                Jeden abonament zamiast <span className="font-normal text-primary">pięciu osobnych.</span>
              </h2>
              <GlowButton size="lg" onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
