/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0
   Cały panel na jednym ekranie, na pełnym oknie — bez chrome'u
   podglądu. Kolory bierze motyw platformy (ten z ustawień ogólnych),
   panel nie trzyma własnej palety. Kafelki można zdjąć jednym
   przełącznikiem, nawigację przypiąć do dowolnej krawędzi albo
   schować. Stary panel zostaje nietknięty.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react'
import {
  Palette, X, PanelTop, PanelBottom, PanelLeft, PanelRight,
  LayoutGrid, Menu, Eye, EyeOff, Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Panel2Anim, Wejscie, KafelkiProvider, useZamknijNaZewnatrz } from './podstawy'
import {
  Nawigacja, UchwytPowrotu, POZYCJE,
  type PozycjaNawigacji, type StylNawigacji,
} from './Nawigacja'
import {
  PasAktywnosci, Kompozytor, Ostatnie, NicNieCzeka, Kalendarz, Chmury, SzybkaPodroz,
} from './Widgety'

/* ── Elementy ustawień ────────────────────────────────────────── */

/** Wiersz ustawienia: etykieta po lewej, pigułka stanu po prawej. */
function Wiersz({
  etykieta, wlaczone, tekst, ikona: I, onClick,
}: {
  etykieta: string
  wlaczone: boolean
  tekst: string
  ikona: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-foreground/85">{etykieta}</span>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold',
          'transition-all duration-200 active:scale-[.97]',
          wlaczone
            ? 'border-primary/40 bg-primary/15 text-primary shadow-[var(--swiatlo-gorne)]'
            : 'border-foreground/[0.09] text-foreground/50 hover:border-foreground/20 hover:text-foreground/80',
        )}
      >
        <I className="h-3.5 w-3.5" />
        {tekst}
      </button>
    </div>
  )
}

function Etykieta({ children }: { children: React.ReactNode }) {
  return (
    <p className="pb-2 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/35">
      {children}
    </p>
  )
}

/* ── Ustawienia wyglądu ───────────────────────────────────────── */

type Ustawienia = {
  kafelki: boolean
  nawigacja: boolean
  pozycja: PozycjaNawigacji
  styl: StylNawigacji
}

const IKONA_POZYCJI: Record<PozycjaNawigacji, React.ComponentType<{ className?: string }>> = {
  gora: PanelTop, dol: PanelBottom, lewo: PanelLeft, prawo: PanelRight,
}

function PanelUstawien({
  u, zmien, onZamknij,
}: {
  u: Ustawienia
  zmien: (cz: Partial<Ustawienia>) => void
  onZamknij: () => void
}) {
  const ref = useZamknijNaZewnatrz<HTMLDivElement>(true, onZamknij)

  return (
    <div
      ref={ref}
      className={cn(
        'p2-rozwin p2-scroll fixed right-4 top-4 z-[100] max-h-[calc(100vh-2rem)] w-[332px] overflow-y-auto',
        'rounded-2xl border border-foreground/[0.08] bg-popover/95 p-4 backdrop-blur-xl',
        'shadow-[0_28px_70px_-20px_hsl(var(--background)),var(--swiatlo-gorne)]',
      )}
      role="dialog"
      aria-label="Ustawienia wyglądu"
    >
      <div className="flex items-center justify-between gap-3 pb-2">
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/85">
            Ustawienia wyglądu
          </span>
        </span>
        <button
          type="button"
          onClick={onZamknij}
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11.5px] font-semibold text-foreground/45 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
        >
          Zamknij <X className="h-3 w-3" />
        </button>
      </div>

      <span aria-hidden className="block h-px bg-foreground/[0.08]" />

      <Wiersz
        etykieta="Kafelki"
        wlaczone={u.kafelki}
        tekst={u.kafelki ? 'Widoczne' : 'Bez obudowy'}
        ikona={u.kafelki ? LayoutGrid : Square}
        onClick={() => zmien({ kafelki: !u.kafelki })}
      />
      <Wiersz
        etykieta="Nawigacja"
        wlaczone={u.nawigacja}
        tekst={u.nawigacja ? 'Widoczna' : 'Schowana'}
        ikona={u.nawigacja ? Eye : EyeOff}
        onClick={() => zmien({ nawigacja: !u.nawigacja })}
      />
      <Wiersz
        etykieta="Menu boczne"
        wlaczone={u.styl === 'panel'}
        tekst={u.styl === 'panel' ? 'Pełne' : 'Szyna ikon'}
        ikona={u.styl === 'panel' ? Menu : PanelLeft}
        onClick={() => zmien({ styl: u.styl === 'panel' ? 'szyna' : 'panel' })}
      />

      <Etykieta>Pozycja nawigacji</Etykieta>
      <div className="grid grid-cols-4 gap-1.5">
        {POZYCJE.map((p) => {
          const I = IKONA_POZYCJI[p.id]
          const wybrana = u.pozycja === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => zmien({ pozycja: p.id, nawigacja: true })}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[11px] font-medium transition-all duration-200',
                wybrana
                  ? 'border-primary/40 bg-primary/10 text-primary shadow-[var(--swiatlo-gorne)]'
                  : 'border-foreground/[0.08] text-foreground/45 hover:border-foreground/20 hover:text-foreground/80',
              )}
            >
              <I className="h-4 w-4" />
              {p.etykieta}
            </button>
          )
        })}
      </div>
      <p className="pt-2 text-[11px] leading-relaxed text-foreground/35">
        Pasek można też złapać za uchwyt i przeciągnąć do dowolnej krawędzi.
      </p>

      <p className="mt-3 border-t border-foreground/[0.07] pt-2.5 text-[11px] leading-relaxed text-foreground/35">
        Kolory bierze motyw platformy z ustawień ogólnych — panel tylko za nim
        idzie, własnej palety nie trzyma.
      </p>
    </div>
  )
}

/* ── Strona ───────────────────────────────────────────────────── */

export function Panel2Page({ onWyjscie }: { onWyjscie?: () => void }) {
  const [u, setU] = useState<Ustawienia>({
    kafelki: true,
    nawigacja: true,
    pozycja: 'lewo',
    styl: 'panel',
  })
  const [ustawieniaOtwarte, setUstawieniaOtwarte] = useState(false)
  const [sekcja, setSekcja] = useState('panel')
  const saldo = 2

  const zmien = (cz: Partial<Ustawienia>) => setU((p) => ({ ...p, ...cz }))
  const pionowo = u.pozycja === 'lewo' || u.pozycja === 'prawo'

  return (
    <KafelkiProvider value={u.kafelki}>
      <div
        className={cn(
          'flex h-full min-h-0 w-full overflow-hidden bg-background text-foreground',
          pionowo ? 'flex-row' : 'flex-col',
          u.pozycja === 'prawo' && 'flex-row-reverse',
          u.pozycja === 'dol'   && 'flex-col-reverse',
        )}
      >
        <Panel2Anim />

        {u.nawigacja ? (
          <Nawigacja
            pozycja={u.pozycja}
            onPozycja={(p) => zmien({ pozycja: p })}
            styl={u.styl}
            aktywna={sekcja}
            onWybor={setSekcja}
            saldo={saldo}
            onWyjdz={() => onWyjscie?.()}
            onUstawienia={() => setUstawieniaOtwarte(true)}
          />
        ) : (
          <UchwytPowrotu pozycja={u.pozycja} onPokaz={() => zmien({ nawigacja: true })} />
        )}

        <main className="p2-scroll relative min-w-0 flex-1 overflow-y-auto">
          {/* Jedyna dekoracja tła — poświata w kolorze motywu. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[320px] opacity-[0.55]"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, hsl(var(--primary) / 0.07), transparent 70%)' }}
          />

          {/* Układ 1:1 z panelu 1.0: jedna kolumna treści, siatka 3/3. */}
          <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
            <Wejscie opoznienie={0} className="shrink-0">
              <PasAktywnosci saldo={saldo} />
            </Wejscie>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <Wejscie opoznienie={70} className="shrink-0">
                  <Kompozytor saldo={saldo} />
                </Wejscie>
                <Wejscie opoznienie={140} className="flex min-h-[15rem] flex-1 basis-0 flex-col">
                  <Ostatnie />
                </Wejscie>
              </div>

              <div className="flex flex-col">
                <Wejscie opoznienie={100} className="shrink-0">
                  <NicNieCzeka />
                </Wejscie>
                <Wejscie opoznienie={170} className="mt-4 flex min-h-0 flex-1 flex-col">
                  <Kalendarz />
                </Wejscie>
              </div>
            </div>

            <section className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-3">
              <Wejscie opoznienie={210} className="lg:col-span-2">
                <Chmury />
              </Wejscie>
              <Wejscie opoznienie={240}>
                <SzybkaPodroz />
              </Wejscie>
            </section>
          </div>
        </main>

        {ustawieniaOtwarte && (
          <PanelUstawien u={u} zmien={zmien} onZamknij={() => setUstawieniaOtwarte(false)} />
        )}
      </div>
    </KafelkiProvider>
  )
}
