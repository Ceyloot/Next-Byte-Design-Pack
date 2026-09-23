import React, { useState, useEffect } from 'react'
import { Activity, Bell, PanelLeft, Moon, Sun, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { odczytajAktualnyMotyw, przelaczNastepnyMotyw, type PozycjaMotywu } from '../fundament/kolejka-motywow'

/**
 * PASEK BOCZNY.
 *
 * TU BYL NEUMORFIZM. W panelu 1.0 pozycje paska lapaly regule motywu jasnego:
 *   box-shadow: 3px 3px 6px hsl(220 25% 82% / .35),
 *              -3px -3px 6px hsl(0 0% 100% / .7);
 * czyli wytloczenie z dwoma zrodlami swiatla naraz. Wygladalo to jak plastik
 * i nie dalo sie tego wylaczyc tokenem, bo to nie byl token.
 *
 * TUTAJ POZYCJA MENU NIE JEST POWIERZCHNIA. Spoczynek jest przezroczysty,
 * `hover` bierze poziom 2, a pozycja aktywna poziom 2 plus kreska akcentu.
 * Lista ma czytac sie jako LISTA, a nie jako stos kafelkow - stad ani cienia,
 * ani rantu na kazdej pozycji.
 */

export interface PozycjaMenu {
  id: string
  nazwa: string
  ikona: React.ComponentType<{ className?: string }>
  grupa: string
}

export function PasekBoczny({
  pozycje,
  aktywna,
  onWybor,
}: {
  pozycje: PozycjaMenu[]
  aktywna: string
  onWybor: (id: string) => void
}) {
  const grupy = [...new Set(pozycje.map((p) => p.grupa))]
  const [aktualnyMotyw, setAktualnyMotyw] = useState<PozycjaMotywu>(odczytajAktualnyMotyw)

  useEffect(() => {
    const onZdarzenie = () => setAktualnyMotyw(odczytajAktualnyMotyw())
    window.addEventListener('themeChanged', onZdarzenie)
    window.addEventListener('nb-theme-change', onZdarzenie)
    return () => {
      window.removeEventListener('themeChanged', onZdarzenie)
      window.removeEventListener('nb-theme-change', onZdarzenie)
    }
  }, [])

  return (
    /* WYMIARY 1:1 Z ORYGINALEM (`ui/sidebar.tsx:31` + powloka AppShell):
       tafla ma 15rem = 240px, a jej kontener 240 + spacing.6 = 264px,
       bo pasek jest PLYWAJACY — ma 12px marginesu dookola (`p-3`),
       nie jest przyklejony do krawedzi okna. */
    <div className="w-[264px] shrink-0 p-3">
      <aside className="p2-pow-1 p2-karta flex h-full flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-3 py-3">
        <span className="p2-akcent-tlo flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold">
          N
        </span>
        <h1 className="flex-1 truncate text-base font-bold tracking-tight">NEXTBYTE</h1>
        <button
          type="button"
          title={`Motyw: ${aktualnyMotyw.nazwa} (kliknij, aby zmienić na kolejny)`}
          aria-label={`Przełącz motyw (obecnie: ${aktualnyMotyw.nazwa})`}
          onClick={() => {
            const nast = przelaczNastepnyMotyw()
            setAktualnyMotyw(nast)
          }}
          className="p2-kontrolka flex h-7 items-center gap-1 px-1.5 text-xs font-medium cursor-pointer active:scale-95 transition-all"
        >
          {aktualnyMotyw.jasny ? (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-cyan-400" />
          )}
          <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline">
            {aktualnyMotyw.nazwa}
          </span>
        </button>
        <button type="button" aria-label="Zwin pasek" className="p2-kontrolka flex h-7 w-7 items-center justify-center">
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {grupy.map((grupa) => (
          <div key={grupa} className="mb-3">
            <p className="p2-etykieta px-2 py-1.5">{grupa}</p>
            <ul className="space-y-0.5">
              {pozycje.filter((p) => p.grupa === grupa).map((p) => {
                const wybrana = p.id === aktywna
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onWybor(p.id)}
                      aria-current={wybrana ? 'page' : undefined}
                      className={cn(
                        'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        wybrana
                          ? 'p2-pow-2 font-semibold'
                          : 'p2-cichy hover:bg-[var(--p2-powierzchnia-2)] hover:text-[hsl(var(--foreground))]',
                      )}
                    >
                      {/* Kreska aktywnosci - jedyny akcent na liscie. */}
                      {wybrana && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      )}
                      <p.ikona className={cn('h-4 w-4 shrink-0', wybrana && 'p2-akcent')} />
                      <span className="truncate">{p.nazwa}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Dok - cztery akcje globalne. Jedyna powierzchnia w pasku, bo
          faktycznie unosi sie nad lista. */}
      <footer className="p-2">
        <div
          className="p2-pow-2 flex items-center justify-around rounded-xl p-1"
          style={{ border: '1px solid var(--p2-rant)' }}
        >
          {[
            { i: Activity, l: 'Aktywnosc' },
            { i: Bell, l: 'Powiadomienia' },
            { i: null, l: 'Byte' },
            { i: User, l: 'Konto' },
          ].map(({ i: Ikona, l }) => (
            <button
              key={l}
              type="button"
              aria-label={l}
              className="flex h-9 w-9 items-center justify-center rounded-lg p2-cichy transition-colors hover:bg-[var(--p2-powierzchnia-3)] hover:text-[hsl(var(--foreground))]"
            >
              {Ikona ? <Ikona className="h-4 w-4" /> : <span className="text-base leading-none">&#10208;</span>}
            </button>
          ))}
        </div>
      </footer>
      </aside>
    </div>
  )
}
