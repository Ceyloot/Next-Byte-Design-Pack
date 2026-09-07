import React, { useState } from 'react'
import {
  Bot,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Palette,
  Rocket,
  MessageSquare,
  Video,
  GraduationCap,
  FileText,
  LayoutGrid,
  Cloud,
  Laptop,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton, GhostButton } from './shared'

// ── Opcje Kroku 1 (Narzędzia AI) ─────────────────────────────────────────────
interface NarzedzieItem {
  id: string
  nazwa: string
  opis?: string
  ikona: React.ComponentType<{ className?: string }>
  badge?: string
}

const NARZEDZIA_AI: NarzedzieItem[] = [
  { id: 'chatgpt', nazwa: 'ChatGPT', opis: 'Najpopularniejszy model konwersacyjny OpenAI', ikona: Bot, badge: 'OpenAI' },
  { id: 'claude', nazwa: 'Claude', opis: 'Zaawansowana analiza, kod i długie konteksty', ikona: Sparkles, badge: 'Anthropic' },
  { id: 'gemini', nazwa: 'Gemini', opis: 'Multimodalna sztuczna inteligencja od Google', ikona: Zap, badge: 'Google' },
  { id: 'midjourney', nazwa: 'Midjourney / generatory grafik', opis: 'Fotorealistyczne obrazy i grafiki koncepcyjne', ikona: ImageIcon, badge: 'Grafika' },
  { id: 'canva', nazwa: 'Canva', opis: 'Szablony, prezentacje i szybki design z AI', ikona: Palette, badge: 'Design' },
  {
    id: 'poczatkujacy',
    nazwa: 'Dopiero zaczynam z AI',
    opis: 'I bardzo dobrze, poprowadzimy Cię od zera',
    ikona: Rocket,
    badge: 'Nowy w AI',
  },
]

// ── Opcje Kroku 2 (Główne Cele) ──────────────────────────────────────────────
interface CelItem {
  id: string
  tytul: string
  podtytul: string
  ikona: React.ComponentType<{ className?: string }>
  tag: string
}

const CELE_UZYTKOWNIKA: CelItem[] = [
  {
    id: 'chat',
    tytul: 'Rozmowy i praca z Chat AI',
    podtytul: 'najlepsze modele w jednym miejscu',
    ikona: MessageSquare,
    tag: 'Modele LLM',
  },
  {
    id: 'zdjecia',
    tytul: 'Generowanie zdjęć i grafik',
    podtytul: 'Studio Zdjęć',
    ikona: ImageIcon,
    tag: 'Grafika',
  },
  {
    id: 'wideo',
    tytul: 'Tworzenie wideo',
    podtytul: 'Studio Video',
    ikona: Video,
    tag: 'Klip & Animacja',
  },
  {
    id: 'nauka',
    tytul: 'Nauka AI krok po kroku',
    podtytul: 'kursy i lekcje w Akademii',
    ikona: GraduationCap,
    tag: 'Edukacja',
  },
  {
    id: 'notatki',
    tytul: 'Notatki i dokumenty',
    podtytul: 'baza wiedzy z AI',
    ikona: FileText,
    tag: 'Baza Wiedzy',
  },
  {
    id: 'organizacja',
    tytul: 'Organizacja i produktywność',
    podtytul: 'zadania, kalendarz, CRM',
    ikona: LayoutGrid,
    tag: 'Produktywność',
  },
  {
    id: 'asystent_online',
    tytul: 'Personalny asystent online',
    podtytul: 'bez instalacji, bez zmartwień',
    ikona: Cloud,
    tag: 'Chmura',
  },
  {
    id: 'asystent_lokalnie',
    tytul: 'Personalny asystent lokalnie',
    podtytul: 'na Twoim komputerze, dane zostają u Ciebie',
    ikona: Laptop,
    tag: 'Prywatność 100%',
  },
]

interface OnboardingFlowProps {
  poczatkowyKrok?: 1 | 2
  onZakoncz?: () => void
  onWrocDoFormularza?: () => void
}

export function OnboardingFlow({
  poczatkowyKrok = 1,
  onZakoncz,
  onWrocDoFormularza,
}: OnboardingFlowProps) {
  const [krok, setKrok] = useState<1 | 2>(poczatkowyKrok === 2 ? 2 : 1)
  const [wybraneNarzedzia, setWybraneNarzedzia] = useState<string[]>(['chatgpt'])
  const [wybraneCele, setWybraneCele] = useState<string[]>(['chat', 'zdjecia'])

  // Przełączanie narzędzi (Krok 1)
  const przelaczNarzedzie = (id: string) => {
    if (id === 'poczatkujacy') {
      setWybraneNarzedzia(prev => (prev.includes('poczatkujacy') ? [] : ['poczatkujacy']))
      return
    }
    setWybraneNarzedzia(prev => {
      const bezPoczatkujacego = prev.filter(x => x !== 'poczatkujacy')
      if (bezPoczatkujacego.includes(id)) {
        return bezPoczatkujacego.filter(x => x !== id)
      } else {
        return [...bezPoczatkujacego, id]
      }
    })
  }

  // Przełączanie celów (Krok 2 - bez limitu, dowolna liczba)
  const przelaczCel = (id: string) => {
    setWybraneCele(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      return [...prev, id]
    })
  }

  const obsluzKoniec = () => {
    if (onZakoncz) {
      onZakoncz()
    } else if (onWrocDoFormularza) {
      onWrocDoFormularza()
    }
  }

  return (
    <div className="relative z-10 flex w-full flex-col items-center animate-in fade-in duration-300">
      {/* Główna Karta Onboardingu o identycznej stylistyce co karta logowania */}
      <div className="relative w-full max-w-[880px] transition-all duration-300">
        <div
          className="relative rounded-[26px] p-px shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.45)]"
          style={{
            background:
              'linear-gradient(180deg, hsl(var(--primary)/0.5), hsl(var(--foreground)/0.08) 38%, hsl(var(--foreground)/0.03))',
          }}
        >
          <div
            className="relative overflow-hidden rounded-[25px] px-6 py-8 backdrop-blur-xl sm:px-9 sm:py-10"
            style={{
              background:
                'radial-gradient(ellipse 130% 90% at 50% -20%, hsl(var(--foreground)/0.08) 0%, transparent 65%),' +
                'linear-gradient(180deg, hsl(var(--card)/0.92) 0%, hsl(var(--background)/0.95) 100%)',
            }}
          >
            {/* ── GÓRNY PASEK: Tytuł sekcji + Szybkie pominięcie w prawym rogu ── */}
            <div className="flex items-center justify-between pb-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
                Personalizacja konta
              </span>
              <button
                type="button"
                onClick={obsluzKoniec}
                className="group inline-flex items-center gap-1.5 font-sans text-[12.5px] font-medium text-foreground/45 transition-colors hover:text-foreground cursor-pointer"
              >
                <span>Pomiń personalizację</span>
                <ArrowRight className="h-3.5 w-3.5 text-foreground/35 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            </div>

            {/* ── PASEK POSTĘPU (2 segmenty) ────────────────────────── */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                {[1, 2].map(indeks => {
                  const czyWypelniony = indeks <= krok
                  const czyBiezacy = indeks === krok
                  return (
                    <div
                      key={indeks}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-all duration-300',
                        czyBiezacy
                          ? 'bg-primary shadow-[0_0_12px_hsl(var(--primary))]'
                          : czyWypelniony
                            ? 'bg-primary/60'
                            : 'bg-foreground/[0.08]',
                      )}
                    />
                  )
                })}
              </div>

              <div className="flex items-center justify-between font-sans text-xs">
                <span className="font-semibold text-foreground/85 tracking-wide">
                  {krok === 1 ? 'Narzędzia AI' : 'Twoje cele'}
                </span>
                <span className="font-mono text-foreground/45">
                  Krok {krok} z 2
                </span>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                KROK 1: Z jakich narzędzi AI już korzystasz?
                ════════════════════════════════════════════════════════════ */}
            {krok === 1 && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-250">
                {/* Tytuł i Podtytuł */}
                <div className="text-center">
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Z jakich narzędzi AI już korzystasz?
                  </h1>
                  <p className="mt-2 font-sans text-sm sm:text-[15px] text-foreground/55">
                    Dzięki temu dopasujemy start do Twojego poziomu
                  </p>
                </div>

                {/* Siatka 6 kafelków (2 kolumny x 3 wiersze) */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {NARZEDZIA_AI.map(narzedzie => {
                    const Icon = narzedzie.ikona
                    const zaznaczone = wybraneNarzedzia.includes(narzedzie.id)

                    return (
                      <button
                        key={narzedzie.id}
                        type="button"
                        onClick={() => przelaczNarzedzie(narzedzie.id)}
                        className={cn(
                          'group relative flex items-start gap-4 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer select-none',
                          'border backdrop-blur-sm',
                          zaznaczone
                            ? 'border-primary/60 bg-primary/[0.08] shadow-[0_0_24px_-4px_hsl(var(--primary)/0.3)] scale-[1.01]'
                            : 'border-foreground/[0.08] bg-foreground/[0.025] hover:border-foreground/[0.22] hover:bg-foreground/[0.05] hover:scale-[1.008]',
                        )}
                      >
                        {/* Wskaźnik zaznaczenia w prawym górnym rogu */}
                        <div
                          className={cn(
                            'absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200',
                            zaznaczone
                              ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.8)]'
                              : 'border border-foreground/20 bg-foreground/[0.04] opacity-0 group-hover:opacity-100',
                          )}
                        >
                          {zaznaczone && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>

                        {/* Ikona w zaokrąglonym kafelku */}
                        <div
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                            zaznaczone
                              ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_14px_-2px_hsl(var(--primary)/0.5)]'
                              : 'bg-foreground/[0.06] text-foreground/60 border border-foreground/[0.08] group-hover:text-foreground group-hover:border-foreground/20',
                          )}
                        >
                          <Icon className="h-5 w-5 stroke-[2]" />
                        </div>

                        {/* Teksty */}
                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans text-[15.5px] font-semibold text-foreground tracking-tight">
                              {narzedzie.nazwa}
                            </h3>
                          </div>
                          {narzedzie.opis && (
                            <p className="mt-1 font-sans text-[12.5px] leading-relaxed text-foreground/50">
                              {narzedzie.opis}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Dolny pasek akcji */}
                <div className="mt-10 flex items-center justify-between border-t border-foreground/[0.08] pt-6">
                  <GhostButton
                    size="md"
                    onClick={() => setKrok(2)}
                    className="h-[46px] px-6 text-[13px] text-foreground/60 hover:text-foreground"
                  >
                    Pomiń ten krok
                  </GhostButton>

                  <GlowButton size="lg" onClick={() => setKrok(2)} className="h-[48px] px-8">
                    Dalej
                  </GlowButton>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                KROK 2: Na czym zależy Ci najbardziej?
                ════════════════════════════════════════════════════════════ */}
            {krok === 2 && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-250">
                {/* Tytuł i Podtytuł */}
                <div className="text-center">
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Na czym zależy Ci najbardziej?
                  </h1>
                  <p className="mt-2 font-sans text-sm sm:text-[15px] text-foreground/55">
                    Od tego zaczniemy Twój pierwszy dzień
                  </p>
                </div>

                {/* Siatka 8 kafelków (2 kolumny x 4 wiersze) */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {CELE_UZYTKOWNIKA.map(cel => {
                    const Icon = cel.ikona
                    const zaznaczony = wybraneCele.includes(cel.id)

                    return (
                      <button
                        key={cel.id}
                        type="button"
                        onClick={() => przelaczCel(cel.id)}
                        className={cn(
                          'group relative flex items-start gap-4 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer select-none',
                          'border backdrop-blur-sm',
                          zaznaczony
                            ? 'border-primary/60 bg-primary/[0.08] shadow-[0_0_24px_-4px_hsl(var(--primary)/0.3)] scale-[1.01]'
                            : 'border-foreground/[0.08] bg-foreground/[0.025] hover:border-foreground/[0.22] hover:bg-foreground/[0.05] hover:scale-[1.008]',
                        )}
                      >
                        {/* Wskaźnik zaznaczenia w prawym górnym rogu */}
                        <div
                          className={cn(
                            'absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200',
                            zaznaczony
                              ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.8)]'
                              : 'border border-foreground/20 bg-foreground/[0.04] opacity-0 group-hover:opacity-100',
                          )}
                        >
                          {zaznaczony && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>

                        {/* Ikona */}
                        <div
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                            zaznaczony
                              ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_14px_-2px_hsl(var(--primary)/0.5)]'
                              : 'bg-foreground/[0.06] text-foreground/60 border border-foreground/[0.08] group-hover:text-foreground group-hover:border-foreground/20',
                          )}
                        >
                          <Icon className="h-5 w-5 stroke-[2]" />
                        </div>

                        {/* Treść */}
                        <div className="min-w-0 flex-1 pr-6">
                          <h3 className="font-sans text-[15px] font-semibold text-foreground tracking-tight leading-snug">
                            {cel.tytul}
                          </h3>
                          <p className="mt-1 font-sans text-[12.5px] leading-relaxed text-foreground/50">
                            {cel.podtytul}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Dolny pasek akcji */}
                <div className="mt-10 flex items-center justify-between border-t border-foreground/[0.08] pt-6">
                  <GhostButton
                    size="md"
                    onClick={() => setKrok(1)}
                    icon={ArrowLeft}
                    className="h-[46px] px-6 text-[13px]"
                  >
                    Wstecz
                  </GhostButton>

                  <div className="flex items-center gap-3">
                    <GhostButton
                      size="md"
                      onClick={obsluzKoniec}
                      className="h-[46px] px-6 text-[13px] text-foreground/60 hover:text-foreground"
                    >
                      Pomiń
                    </GhostButton>

                    <GlowButton
                      size="lg"
                      onClick={obsluzKoniec}
                      className="h-[48px] px-8"
                    >
                      Przejdź do platformy
                    </GlowButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
