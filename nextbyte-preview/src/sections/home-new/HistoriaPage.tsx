import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { History, Check, GitBranch, Rss, ArrowRight } from 'lucide-react'
import {
  Section, SectionHead, Eyebrow, GlowButton, GhostButton,
  Panel, IconTile, GridBackdrop, Glow, HairLine, AKCENT, akcentTlo,
} from './shared'
import { HISTORIA } from './data'
import type { HomePage as HomePageId } from './types'

type Filtr = 'wszystko' | 'major' | 'feature'

const FILTRY: { id: Filtr; label: string }[] = [
  { id: 'wszystko', label: 'Wszystkie' },
  { id: 'major',    label: 'Duże wydania' },
  { id: 'feature',  label: 'Nowe funkcje' },
]

export function HistoriaPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [filtr, setFiltr] = useState<Filtr>('wszystko')
  const wpisy = HISTORIA.filter(h => filtr === 'wszystko' || h.typ === filtr)

  return (
    <div className="flex w-full flex-col">

      {/* ══════════ NAGŁÓWEK ══════════ */}
      <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 lg:px-8">
        <GridBackdrop />
        <Glow className="left-1/2 top-[-150px] -translate-x-1/2" size={760} opacity={0.12} />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={History} className="mb-6">Historia zmian</Eyebrow>
          <h1 className="font-heading text-[36px] font-extrabold leading-[1.07] tracking-tight text-foreground sm:text-[50px]">
            Co zbudowaliśmy<br />
            <span className="text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]">i co dopiero powstaje</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-foreground/50">
            Pełen zapis wydań platformy. Każda wersja z listą zmian, datą i opisem tego,
            co faktycznie zmieniło się w codziennej pracy użytkowników.
          </p>

          {/* filtry */}
          <div className="mt-8 inline-flex gap-1 rounded-full border border-foreground/[0.08] bg-foreground/[0.03] p-1">
            {FILTRY.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltr(f.id)}
                className={cn(
                  'h-9 rounded-full px-4 text-[12.5px] font-semibold transition-all duration-200',
                  filtr === f.id
                    ? 'bg-primary text-background shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.6)]'
                    : 'text-foreground/45 hover:text-foreground/75',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OŚ CZASU ══════════ */}
      <Section className="pb-24">
        <div className="relative mx-auto max-w-3xl">
          {/* pionowa linia */}
          <div
            aria-hidden
            className="absolute bottom-8 left-[19px] top-4 w-px"
            style={{ background: 'linear-gradient(180deg, hsl(var(--primary)/0.45), hsl(var(--foreground)/0.08) 40%, transparent)' }}
          />

          <div className="space-y-6">
            {wpisy.map((w, i) => {
              const Icon = w.icon
              const najnowszy = i === 0 && filtr === 'wszystko'
              return (
                <div key={w.wersja} className="relative pl-14">
                  {/* węzeł */}
                  <span
                    className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2"
                    style={{
                      background: 'hsl(var(--card))',
                      borderColor: akcentTlo(w.color, 35),
                      boxShadow: najnowszy ? `0 0 22px ${akcentTlo(w.color, 55)}` : 'none',
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: w.color }} />
                  </span>

                  <Panel hover className="p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                      <span
                        className="rounded-lg border px-2.5 py-1 font-mono text-[11px] font-extrabold"
                        style={{ color: w.color, borderColor: akcentTlo(w.color, 30), background: akcentTlo(w.color, 10) }}
                      >
                        {w.wersja}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground/30">
                        {w.data}
                      </span>
                      {w.typ === 'major' && (
                        <span className="rounded-full bg-primary/12 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                          Duże wydanie
                        </span>
                      )}
                      {najnowszy && (
                        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                            Aktualna
                          </span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-[19px] font-extrabold leading-snug tracking-tight text-foreground">
                      {w.tytul}
                    </h2>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground/50">{w.opis}</p>

                    <HairLine className="my-5" />

                    <ul className="space-y-2.5">
                      {w.punkty.map(p => (
                        <li key={p} className="flex items-start gap-2.5 text-[12.5px] text-foreground/60">
                          <span
                            className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                            style={{ background: akcentTlo(w.color, 15) }}
                          >
                            <Check className="h-2.5 w-2.5" style={{ color: w.color }} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              )
            })}
          </div>

          {/* zakończenie osi */}
          <div className="relative mt-6 pl-14">
            <span className="absolute left-[13px] top-2 h-3.5 w-3.5 rounded-full border-2 border-foreground/15 bg-[hsl(var(--card))]" />
            <p className="text-[12.5px] text-foreground/30">
              Pierwsza publiczna wersja platformy — październik 2025
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════ W PRZYGOTOWANIU ══════════ */}
      <Section className="pb-24">
        <Panel className="relative overflow-hidden p-8 sm:p-12">
          <Glow className="right-[-80px] top-[-70px]" size={460} opacity={0.10} />
          <div className="relative z-10">
            <SectionHead
              eyebrow="W przygotowaniu"
              eyebrowIcon={GitBranch}
              eyebrowColor={AKCENT.auto}
              title="Nad czym pracujemy teraz"
              lead="Kolejność może się zmienić — priorytety ustawiamy na podstawie tego, o co najczęściej prosicie."
              align="left"
              className="mb-11 max-w-2xl"
            />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { t: 'Aplikacja mobilna', d: 'Pełny dostęp do Chat AI i Notatek z telefonu, z synchronizacją sesji.', s: 'testy wewnętrzne', p: 75 },
                { t: 'Współdzielone przestrzenie', d: 'Wspólne projekty zespołowe z historią i uprawnieniami na poziomie folderu.', s: 'w budowie', p: 45 },
                { t: 'Wtyczka do przeglądarki', d: 'Wywołanie modelu na dowolnej stronie bez przełączania karty.', s: 'projektowanie', p: 20 },
              ].map(k => (
                <div key={k.t} className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/30">
                      {k.s}
                    </span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: AKCENT.auto }}>{k.p}%</span>
                  </div>
                  <h3 className="mb-2 font-heading text-[15px] font-bold tracking-tight text-foreground">{k.t}</h3>
                  <p className="mb-4 text-[12.5px] leading-relaxed text-foreground/45">{k.d}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${k.p}%`, background: AKCENT.auto, boxShadow: `0 0 12px ${akcentTlo(AKCENT.auto, 60)}` }}
                    />
                  </div>
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
            <Eyebrow icon={Rss} className="mb-5">Aktualizacje co dwa tygodnie</Eyebrow>
            <h2 className="font-heading text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[42px]">
              Rozwijamy platformę razem z Wami
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-foreground/55">
              Większość funkcji na tej liście powstała z konkretnych próśb użytkowników.
              Jeśli czegoś Ci brakuje — napisz, trafi to prosto do planu prac.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <GlowButton>Zacznij za darmo</GlowButton>
              <GhostButton onClick={() => onNavigate('home')}>Wróć do strony głównej</GhostButton>
            </div>
          </div>
        </Panel>
      </Section>
    </div>
  )
}
