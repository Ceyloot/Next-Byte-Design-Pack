import React from 'react'
import { Shield, Coins } from 'lucide-react'
import { Section, HairLine } from './shared'
import { STOPKA } from './data'
import { STRONY } from './types'
import type { HomePage as HomePageId } from './types'

export function Footer({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const mapaLinkow: Record<string, HomePageId> = {
    'Dla firm': 'b2b',
    'Cennik': 'cennik',
  }

  return (
    <footer className="relative mt-8">
      <HairLine />
      <Section className="py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          {/* marka */}
          <div className="space-y-5">
            <button type="button" onClick={() => onNavigate('home')} className="group inline-flex items-center gap-2.5">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)),0_0_16px_hsl(var(--primary)/0.6)]" />
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.28em] text-foreground/85 transition-colors group-hover:text-foreground">
                NextByte
              </span>
            </button>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-foreground/40">
              Polska platforma AI łącząca rozmowy z modelami, generowanie obrazów,
              bazę wiedzy i automatyzacje w jednym środowisku pracy.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-lg border border-foreground/[0.07] bg-foreground/[0.02] px-2.5 py-1.5 text-[10.5px] text-foreground/40">
                <Shield className="h-3 w-3 text-primary/70" /> Dane w UE
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-foreground/[0.07] bg-foreground/[0.02] px-2.5 py-1.5 text-[10.5px] text-foreground/40">
                <Coins className="h-3 w-3 text-primary/70" /> Faktura VAT w PLN
              </span>
            </div>
          </div>

          {/* kolumny linków */}
          {STOPKA.map(kol => (
            <div key={kol.tytul}>
              <p className="mb-4 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                {kol.tytul}
              </p>
              <ul className="space-y-2.5">
                {kol.linki.map(l => {
                  const cel = mapaLinkow[l]
                  return (
                    <li key={l}>
                      <button
                        type="button"
                        onClick={() => cel && onNavigate(cel)}
                        className="text-left text-[12.5px] text-foreground/45 transition-colors hover:text-foreground/80"
                      >
                        {l}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <HairLine className="my-9" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[11.5px] text-foreground/30">
            © 2026 NextByte sp. z o.o. · Wszelkie prawa zastrzeżone
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {STRONY.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => onNavigate(s.id)}
                className="text-[11.5px] text-foreground/35 transition-colors hover:text-foreground/70"
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </Section>
    </footer>
  )
}
