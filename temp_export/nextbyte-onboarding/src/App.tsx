import React, { useState } from 'react'
import { Onboarding } from './sections/logowanie/Onboarding'
import { OnboardingFlow } from './sections/logowanie/OnboardingFlow'
import { WejscieNaPlatforme } from './sections/logowanie/WejscieNaPlatforme'
import { Sparkles, ArrowRight, Play, Eye } from 'lucide-react'

export default function App() {
  const [widok, setWidok] = useState<'onboarding-full' | 'onboarding-pytania' | 'wejscie-platforma'>('onboarding-full')
  const [resetKlucz, setResetKlucz] = useState(0)

  const zrestartuj = (nowyWidok?: typeof widok) => {
    if (nowyWidok) setWidok(nowyWidok)
    setResetKlucz(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-landing selection:bg-primary/20">
      {/* Pasek nawigacyjny u góry ułatwiający testowanie i podgląd każdego etapu */}
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">NextByte Onboarding 1 & Wejście</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 p-1 text-xs">
          <button
            onClick={() => zrestartuj('onboarding-full')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
              widok === 'onboarding-full'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Play className="h-3 w-3" />
            Cały proces (Onboarding 1 → Wejście)
          </button>

          <button
            onClick={() => zrestartuj('onboarding-pytania')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
              widok === 'onboarding-pytania'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3 w-3" />
            Tylko Onboarding 1 (Pytania)
          </button>

          <button
            onClick={() => zrestartuj('wejscie-platforma')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
              widok === 'wejscie-platforma'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowRight className="h-3 w-3" />
            Tylko Wejście na stronę (C1-C4)
          </button>
        </div>

        <div>
          <button
            onClick={() => zrestartuj()}
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Odśwież stan
          </button>
        </div>
      </header>

      {/* Główny obszar roboczy */}
      <main className="relative flex-1 flex flex-col" key={resetKlucz}>
        {widok === 'onboarding-full' && (
          <Onboarding
            poczatkowyEtap="pytania"
            onWrocDoFormularza={() => alert('Kliknięto powrót do formularza logowania / rejestracji')}
          />
        )}

        {widok === 'onboarding-pytania' && (
          <OnboardingFlow
            onWrocDoFormularza={() => alert('Powrót do formularza')}
            onZakoncz={() => setWidok('wejscie-platforma')}
          />
        )}

        {widok === 'wejscie-platforma' && (
          <WejscieNaPlatforme />
        )}
      </main>
    </div>
  )
}
