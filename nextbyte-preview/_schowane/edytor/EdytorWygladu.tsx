import React from 'react'
import { Ban, Circle, Copy, Droplet, Eye, EyeOff, MoveDiagonal, Plus, Square, Sun, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Kolor, Liczba, MalyPrzycisk, Pole, Sekcja, Segment, Suwak, TarczaKata } from './kontrolki'
import {
  cssTlo,
  nowyCien,
  nowyGlow,
  nowyObrys,
  nowyStopien,
  noweWypelnienie,
  wygladZWezla,
  type Cien,
  type Obrys,
  type PozycjaObrysu,
  type RodzajWypelnienia,
  type StopienGradientu,
  type Wypelnienie,
} from './wyglad'
import type { Wezel, Wyglad } from './typy'

/**
 * Parametryczny wygląd w inspektorze: wypełnienie, obrys, cienie, szkło.
 *
 * Panel nie trzyma własnego stanu — każda zmiana leci od razu w węzeł,
 * bo inaczej podgląd na kanwie rozjechałby się z kontrolkami i trzeba by
 * pilnować synchronizacji w dwóch miejscach.
 */

interface Props {
  wezel: Wezel
  onZmiana: (zmiany: Partial<Wezel>) => void
  /** wołane po puszczeniu kontrolki — wtedy wpis idzie do historii cofania */
  onKoniec: () => void
}

export function EdytorWygladu({ wezel, onZmiana, onKoniec }: Props) {
  // Pierwsze wejście w panel dziedziczy to, co węzeł ma dziś — użytkownik
  // ma zobaczyć swój kształt, a nie domyślny błękit.
  const wyglad: Wyglad = wezel.wyglad ?? wygladZWezla(wezel)

  const zmienWyglad = (zmiany: Partial<Wyglad>) => onZmiana({ wyglad: { ...wyglad, ...zmiany } })

  const wypelnienie = wyglad.wypelnienie ?? noweWypelnienie()
  const obrys = wyglad.obrys ?? nowyObrys()
  const cienie = wyglad.cienie ?? []

  return (
    <>
      <SekcjaWypelnienia
        wypelnienie={wypelnienie}
        onZmiana={w => zmienWyglad({ wypelnienie: w })}
        onKoniec={onKoniec}
      />

      <SekcjaObrysu obrys={obrys} onZmiana={o => zmienWyglad({ obrys: o })} onKoniec={onKoniec} />

      <SekcjaCieni
        cienie={cienie}
        akcent={wezel.akcent ?? '#38bdf8'}
        onZmiana={c => zmienWyglad({ cienie: c })}
        onKoniec={onKoniec}
      />

      <Sekcja tytul="Szkło">
        <Suwak
          etykieta="Rozmycie tła"
          wartosc={wyglad.rozmycieTla ?? 0}
          min={0}
          max={60}
          krok={1}
          format={v => `${Math.round(v)} px`}
          onZmiana={v => zmienWyglad({ rozmycieTla: v })}
        />
        {(wyglad.rozmycieTla ?? 0) > 0 && (
          <Suwak
            etykieta="Nasycenie tła"
            wartosc={wyglad.nasycenieTla ?? 140}
            min={100}
            max={260}
            krok={5}
            format={v => `${Math.round(v)}%`}
            onZmiana={v => zmienWyglad({ nasycenieTla: v })}
          />
        )}
      </Sekcja>
    </>
  )
}

/* ── Wypełnienie ─────────────────────────────────────────────────── */

const RODZAJE: { klucz: RodzajWypelnienia; tytul: string; ikona: React.ReactNode }[] = [
  { klucz: 'brak', tytul: 'Bez wypełnienia', ikona: <Ban className="h-3 w-3" /> },
  { klucz: 'jednolite', tytul: 'Kolor jednolity', ikona: <Square className="h-3 w-3 fill-current" /> },
  { klucz: 'liniowy', tytul: 'Gradient liniowy', ikona: <MoveDiagonal className="h-3 w-3" /> },
  { klucz: 'radialny', tytul: 'Gradient radialny', ikona: <Circle className="h-3 w-3" /> },
]

function SekcjaWypelnienia({
  wypelnienie,
  onZmiana,
  onKoniec,
}: {
  wypelnienie: Wypelnienie
  onZmiana: (w: Wypelnienie) => void
  onKoniec: () => void
}) {
  const gradient = wypelnienie.rodzaj === 'liniowy' || wypelnienie.rodzaj === 'radialny'
  const [wybranyStopien, setWybranyStopien] = React.useState<string | null>(null)
  const stopnie = [...wypelnienie.stopnie].sort((a, b) => a.pozycja - b.pozycja)
  const aktywny = stopnie.find(s => s.id === wybranyStopien) ?? stopnie[0]

  const zmienStopien = (id: string, zmiany: Partial<StopienGradientu>) =>
    onZmiana({ ...wypelnienie, stopnie: wypelnienie.stopnie.map(s => (s.id === id ? { ...s, ...zmiany } : s)) })

  return (
    <Sekcja tytul="Wypełnienie">
      <Segment
        wartosc={wypelnienie.rodzaj}
        opcje={RODZAJE}
        onZmiana={r => {
          onZmiana({ ...wypelnienie, rodzaj: r })
          onKoniec()
        }}
      />

      {wypelnienie.rodzaj === 'jednolite' && (
        <Pole etykieta="Kolor">
          <Kolor wartosc={wypelnienie.kolor} onZmiana={v => onZmiana({ ...wypelnienie, kolor: v })} />
        </Pole>
      )}

      {gradient && (
        <>
          <PasekStopni
            wypelnienie={wypelnienie}
            wybrany={aktywny?.id ?? null}
            onWybierz={setWybranyStopien}
            onZmiana={onZmiana}
            onKoniec={onKoniec}
          />
          {aktywny && (
            <div className="space-y-2 rounded-lg border border-border/50 bg-background/30 p-2">
              <Pole etykieta="Kolor punktu">
                <Kolor wartosc={aktywny.kolor} onZmiana={v => zmienStopien(aktywny.id, { kolor: v })} />
              </Pole>
              <div className="grid grid-cols-2 gap-2">
                <Liczba
                  etykieta="Pozycja %"
                  wartosc={aktywny.pozycja}
                  onZmiana={v => zmienStopien(aktywny.id, { pozycja: Math.min(100, Math.max(0, v)) })}
                />
                <div className="flex items-end gap-1">
                  <MalyPrzycisk
                    tytul="Dodaj punkt"
                    ikona={<Plus className="h-3 w-3" />}
                    onClick={() => {
                      const nowy = nowyStopien(aktywny.kolor, Math.min(100, aktywny.pozycja + 10))
                      onZmiana({ ...wypelnienie, stopnie: [...wypelnienie.stopnie, nowy] })
                      setWybranyStopien(nowy.id)
                      onKoniec()
                    }}
                  />
                  <MalyPrzycisk
                    tytul="Usuń punkt"
                    ikona={<Trash2 className="h-3 w-3" />}
                    onClick={() => {
                      if (wypelnienie.stopnie.length <= 2) return
                      onZmiana({ ...wypelnienie, stopnie: wypelnienie.stopnie.filter(s => s.id !== aktywny.id) })
                      setWybranyStopien(null)
                      onKoniec()
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {wypelnienie.rodzaj === 'liniowy' && (
            <TarczaKata kat={wypelnienie.kat} onZmiana={v => onZmiana({ ...wypelnienie, kat: v })} />
          )}
        </>
      )}

      {wypelnienie.rodzaj !== 'brak' && (
        <Suwak etykieta="Krycie" wartosc={wypelnienie.krycie} onZmiana={v => onZmiana({ ...wypelnienie, krycie: v })} />
      )}
    </Sekcja>
  )
}

/**
 * Pasek gradientu z uchwytami. Klik w tło paska dokłada punkt tam, gdzie
 * kliknięto — to najkrótsza droga do „chcę tu jeszcze jeden kolor”.
 */
function PasekStopni({
  wypelnienie,
  wybrany,
  onWybierz,
  onZmiana,
  onKoniec,
}: {
  wypelnienie: Wypelnienie
  wybrany: string | null
  onWybierz: (id: string) => void
  onZmiana: (w: Wypelnienie) => void
  onKoniec: () => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const ciagniety = React.useRef<string | null>(null)

  const pozycjaZe = (e: { clientX: number }) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return 0
    return Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  const podglad = cssTlo({ ...wypelnienie, rodzaj: wypelnienie.rodzaj === 'radialny' ? 'radialny' : 'liniowy', kat: 90 })

  return (
    <div
      ref={ref}
      onPointerDown={e => {
        // Kliknięcie w sam pasek (nie w uchwyt) dodaje nowy punkt.
        if (ciagniety.current) return
        const poz = pozycjaZe(e)
        const nowy = nowyStopien('#ffffff', poz)
        onZmiana({ ...wypelnienie, stopnie: [...wypelnienie.stopnie, nowy] })
        onWybierz(nowy.id)
        onKoniec()
      }}
      onPointerMove={e => {
        if (!ciagniety.current || e.buttons !== 1) return
        const poz = pozycjaZe(e)
        onZmiana({
          ...wypelnienie,
          stopnie: wypelnienie.stopnie.map(s => (s.id === ciagniety.current ? { ...s, pozycja: poz } : s)),
        })
      }}
      onPointerUp={() => {
        if (ciagniety.current) onKoniec()
        ciagniety.current = null
      }}
      className="relative h-7 cursor-copy rounded-md border border-border/60"
      style={{ background: podglad }}
      title="Klik — dodaj punkt · przeciągnij uchwyt — przesuń"
    >
      {wypelnienie.stopnie.map(s => (
        <button
          key={s.id}
          onPointerDown={e => {
            e.stopPropagation()
            ciagniety.current = s.id
            ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
            onWybierz(s.id)
          }}
          style={{ left: `${s.pozycja}%`, background: s.kolor }}
          className={cn(
            '-translate-x-1/2 absolute top-1/2 h-4 w-4 -translate-y-1/2 cursor-grab rounded-full border-2 shadow',
            wybrany === s.id ? 'border-primary' : 'border-white/70',
          )}
        />
      ))}
    </div>
  )
}

/* ── Obrys ───────────────────────────────────────────────────────── */

const POZYCJE: { klucz: PozycjaObrysu; tytul: string; etykieta: string }[] = [
  { klucz: 'wewnatrz', tytul: 'Obrys wewnątrz kształtu', etykieta: 'Wewn.' },
  { klucz: 'srodek', tytul: 'Obrys na krawędzi', etykieta: 'Środek' },
  { klucz: 'zewnatrz', tytul: 'Obrys poza kształtem', etykieta: 'Zewn.' },
]

const STRONY: { klucz: keyof Obrys['strony']; tytul: string; etykieta: string }[] = [
  { klucz: 'gora', tytul: 'Krawędź górna', etykieta: '↑' },
  { klucz: 'prawo', tytul: 'Krawędź prawa', etykieta: '→' },
  { klucz: 'dol', tytul: 'Krawędź dolna', etykieta: '↓' },
  { klucz: 'lewo', tytul: 'Krawędź lewa', etykieta: '←' },
]

function SekcjaObrysu({
  obrys,
  onZmiana,
  onKoniec,
}: {
  obrys: Obrys
  onZmiana: (o: Obrys) => void
  onKoniec: () => void
}) {
  return (
    <Sekcja
      tytul="Obrys"
      akcja={
        <MalyPrzycisk
          tytul={obrys.wlaczony ? 'Wyłącz obrys' : 'Włącz obrys'}
          ikona={obrys.wlaczony ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          onClick={() => {
            onZmiana({ ...obrys, wlaczony: !obrys.wlaczony })
            onKoniec()
          }}
        />
      }
    >
      {obrys.wlaczony && (
        <>
          <Pole etykieta="Kolor">
            <Kolor wartosc={obrys.kolor} onZmiana={v => onZmiana({ ...obrys, kolor: v })} />
          </Pole>
          <div className="grid grid-cols-2 gap-2">
            <Liczba
              etykieta="Grubość"
              wartosc={obrys.grubosc}
              krok={0.5}
              onZmiana={v => onZmiana({ ...obrys, grubosc: Math.max(0, v) })}
            />
            <Liczba
              etykieta="Krycie %"
              wartosc={Math.round(obrys.krycie * 100)}
              onZmiana={v => onZmiana({ ...obrys, krycie: Math.min(1, Math.max(0, v / 100)) })}
            />
          </div>
          <Pole etykieta="Pozycja">
            <Segment
              wartosc={obrys.pozycja}
              opcje={POZYCJE}
              onZmiana={p => {
                onZmiana({ ...obrys, pozycja: p })
                onKoniec()
              }}
            />
          </Pole>
          <Pole etykieta="Krawędzie">
            <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-background/40 p-0.5">
              {STRONY.map(s => (
                <button
                  key={s.klucz}
                  title={s.tytul}
                  onClick={() => {
                    onZmiana({ ...obrys, strony: { ...obrys.strony, [s.klucz]: !obrys.strony[s.klucz] } })
                    onKoniec()
                  }}
                  className={cn(
                    'h-6 flex-1 rounded text-[11px] font-bold transition-colors',
                    obrys.strony[s.klucz]
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground/35 hover:bg-foreground/5 hover:text-foreground/70',
                  )}
                >
                  {s.etykieta}
                </button>
              ))}
            </div>
          </Pole>
        </>
      )}
    </Sekcja>
  )
}

/* ── Cienie ──────────────────────────────────────────────────────── */

function SekcjaCieni({
  cienie,
  akcent,
  onZmiana,
  onKoniec,
}: {
  cienie: Cien[]
  akcent: string
  onZmiana: (c: Cien[]) => void
  onKoniec: () => void
}) {
  const dodaj = (c: Cien) => {
    onZmiana([...cienie, c])
    onKoniec()
  }
  const zmien = (id: string, zmiany: Partial<Cien>) =>
    onZmiana(cienie.map(c => (c.id === id ? { ...c, ...zmiany } : c)))

  return (
    <Sekcja
      tytul="Cień i podświetlenie"
      akcja={
        <>
          <MalyPrzycisk tytul="Dodaj cień" ikona={<Droplet className="h-3 w-3" />} onClick={() => dodaj(nowyCien())} />
          <MalyPrzycisk
            tytul="Dodaj podświetlenie"
            ikona={<Sun className="h-3 w-3" />}
            onClick={() => dodaj(nowyGlow(akcent))}
          />
        </>
      }
    >
      {cienie.length === 0 && (
        <p className="text-[10px] leading-relaxed text-foreground/35">
          Brak. Kropla dokłada cień, słońce — podświetlenie wokół kształtu.
        </p>
      )}

      {cienie.map((c, i) => (
        <div key={c.id} className="space-y-2 rounded-lg border border-border/50 bg-background/30 p-2">
          <div className="flex items-center gap-1">
            <span className="flex-1 text-[10px] font-semibold text-foreground/60">
              {c.rodzaj === 'wewnetrzny' ? 'Wewnętrzny' : 'Zewnętrzny'} #{i + 1}
            </span>
            <MalyPrzycisk
              tytul={c.wlaczony ? 'Wyłącz' : 'Włącz'}
              ikona={c.wlaczony ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              onClick={() => {
                zmien(c.id, { wlaczony: !c.wlaczony })
                onKoniec()
              }}
            />
            <MalyPrzycisk
              tytul="Duplikuj"
              ikona={<Copy className="h-3 w-3" />}
              onClick={() => dodaj({ ...c, id: `${c.id}-${cienie.length}` })}
            />
            <MalyPrzycisk
              tytul="Usuń"
              ikona={<Trash2 className="h-3 w-3" />}
              onClick={() => {
                onZmiana(cienie.filter(x => x.id !== c.id))
                onKoniec()
              }}
            />
          </div>

          <Segment
            wartosc={c.rodzaj}
            opcje={[
              { klucz: 'zewnetrzny' as const, tytul: 'Cień na zewnątrz', etykieta: 'Zewn.' },
              { klucz: 'wewnetrzny' as const, tytul: 'Cień wewnątrz (inset)', etykieta: 'Wewn.' },
            ]}
            onZmiana={r => {
              zmien(c.id, { rodzaj: r })
              onKoniec()
            }}
          />

          <TarczaKata kat={c.kat} onZmiana={v => zmien(c.id, { kat: v })} />

          <div className="grid grid-cols-2 gap-2">
            <Liczba etykieta="Odległość" wartosc={c.odleglosc} onZmiana={v => zmien(c.id, { odleglosc: v })} />
            <Liczba
              etykieta="Rozmycie"
              wartosc={c.rozmycie}
              onZmiana={v => zmien(c.id, { rozmycie: Math.max(0, v) })}
            />
            <Liczba etykieta="Rozlanie" wartosc={c.rozlanie} onZmiana={v => zmien(c.id, { rozlanie: v })} />
            <Liczba
              etykieta="Siła %"
              wartosc={Math.round(c.sila * 100)}
              onZmiana={v => zmien(c.id, { sila: Math.min(1, Math.max(0, v / 100)) })}
            />
          </div>

          <Pole etykieta="Kolor">
            <Kolor wartosc={c.kolor} onZmiana={v => zmien(c.id, { kolor: v })} />
          </Pole>
        </div>
      ))}
    </Sekcja>
  )
}
