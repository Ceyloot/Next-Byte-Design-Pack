import { useRef, useState } from 'react'
import { Pause, Play, Plus, Repeat, SkipBack, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { klatkiWlasciwosci, wartoscWCzasie } from './animacja'
import { nowyId, WLASCIWOSCI, type Klatka, type Projekt, type Wezel, type Wlasciwosc, type Wygladzanie } from './typy'

const WYGLADZANIA: Wygladzanie[] = ['liniowe', 'łagodne', 'wejście', 'wyjście', 'sprężyste', 'skok']

interface Props {
  projekt: Projekt
  wezel?: Wezel
  czas: number
  odtwarzanie: boolean
  petla: boolean
  onCzas: (t: number) => void
  onOdtwarzanie: (v: boolean) => void
  onPetla: (v: boolean) => void
  onAktualizuj: (id: string, zmiany: Partial<Wezel>) => void
  onZakonczOperacje: () => void
}

export function OsCzasu({
  projekt,
  wezel,
  czas,
  odtwarzanie,
  petla,
  onCzas,
  onOdtwarzanie,
  onPetla,
  onAktualizuj,
  onZakonczOperacje,
}: Props) {
  const [wybranaKlatka, setWybranaKlatka] = useState<string | null>(null)
  const refPrzeciagana = useRef<string | null>(null)

  const doCzasu = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const t = ((clientX - r.left) / r.width) * projekt.dlugosc
    return Math.round(Math.min(projekt.dlugosc, Math.max(0, t)))
  }

  const dodajKlatke = (wlasciwosc: Wlasciwosc) => {
    if (!wezel) return
    const istniejaca = wezel.klatki.find(k => k.wlasciwosc === wlasciwosc && Math.abs(k.czas - czas) < 1)
    const wartosc = wartoscWCzasie(wezel, wlasciwosc, czas)
    const klatki = istniejaca
      ? wezel.klatki.map(k => (k.id === istniejaca.id ? { ...k, wartosc } : k))
      : [...wezel.klatki, { id: nowyId('k'), wlasciwosc, czas, wartosc, wygladzanie: 'łagodne' as Wygladzanie }]
    onAktualizuj(wezel.id, { klatki })
    onZakonczOperacje()
  }

  const usunKlatke = (id: string) => {
    if (!wezel) return
    onAktualizuj(wezel.id, { klatki: wezel.klatki.filter(k => k.id !== id) })
    onZakonczOperacje()
    setWybranaKlatka(null)
  }

  const zmienKlatke = (id: string, zmiany: Partial<Klatka>) => {
    if (!wezel) return
    onAktualizuj(wezel.id, { klatki: wezel.klatki.map(k => (k.id === id ? { ...k, ...zmiany } : k)) })
  }

  const klatkaWybrana = wezel?.klatki.find(k => k.id === wybranaKlatka)

  return (
    <div className="flex h-56 shrink-0 flex-col border-t border-border/60 bg-card/50 backdrop-blur-xl">
      {/* Pasek transportu */}
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1.5">
        <button
          onClick={() => onOdtwarzanie(!odtwarzanie)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          title="Spacja"
        >
          {odtwarzanie ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => onCzas(0)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-foreground/60 transition-colors hover:text-foreground"
          title="Na początek"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPetla(!petla)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
            petla ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/60 text-foreground/40',
          )}
          title="Zapętl"
        >
          <Repeat className="h-3.5 w-3.5" />
        </button>

        <span className="ml-1 font-mono text-[11px] text-foreground/60">
          {(czas / 1000).toFixed(2)}s / {(projekt.dlugosc / 1000).toFixed(2)}s
        </span>

        <div className="ml-auto flex items-center gap-2">
          {klatkaWybrana ? (
            <>
              <span className="text-[10px] text-foreground/45">Klatka {Math.round(klatkaWybrana.czas)} ms</span>
              <select
                value={klatkaWybrana.wygladzanie}
                onChange={e => {
                  zmienKlatke(klatkaWybrana.id, { wygladzanie: e.target.value as Wygladzanie })
                  onZakonczOperacje()
                }}
                className="rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] outline-none"
              >
                {WYGLADZANIA.map(w => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step={0.01}
                value={Math.round(klatkaWybrana.wartosc * 100) / 100}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  if (!Number.isNaN(v)) zmienKlatke(klatkaWybrana.id, { wartosc: v })
                }}
                onBlur={onZakonczOperacje}
                className="w-20 rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] outline-none"
              />
              <button
                onClick={() => usunKlatke(klatkaWybrana.id)}
                className="text-foreground/45 transition-colors hover:text-red-400"
                title="Usuń klatkę"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-foreground/35">
              {wezel ? 'Kliknij ◆, żeby edytować klatkę' : 'Zaznacz warstwę, żeby animować'}
            </span>
          )}
        </div>
      </div>

      {/* Ścieżki */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {!wezel && (
          <div className="flex h-full items-center justify-center text-[11px] text-foreground/30">
            Oś czasu pokazuje zaznaczoną warstwę.
          </div>
        )}
        {wezel &&
          WLASCIWOSCI.map(w => {
            const klatki = klatkiWlasciwosci(wezel, w.klucz)
            return (
              <div key={w.klucz} className="flex items-center gap-2 border-b border-border/30 px-3 py-1">
                <button
                  onClick={() => dodajKlatke(w.klucz)}
                  title="Dodaj klatkę w pozycji kursora"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border/60 text-foreground/45 transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <span className="w-20 shrink-0 text-[10px] text-foreground/55">{w.etykieta}</span>
                <span className="w-14 shrink-0 font-mono text-[10px] text-foreground/35">
                  {(Math.round(wartoscWCzasie(wezel, w.klucz, czas) * 100) / 100).toString()}
                  {w.jednostka}
                </span>

                <div
                  className="relative h-6 flex-1 cursor-pointer rounded bg-background/50"
                  onPointerDown={e => {
                    if (refPrzeciagana.current) return
                    onCzas(doCzasu(e.clientX, e.currentTarget))
                  }}
                  onPointerMove={e => {
                    if (!refPrzeciagana.current || e.buttons === 0) return
                    zmienKlatke(refPrzeciagana.current, { czas: doCzasu(e.clientX, e.currentTarget) })
                  }}
                  onPointerUp={() => {
                    if (refPrzeciagana.current) {
                      refPrzeciagana.current = null
                      onZakonczOperacje()
                    }
                  }}
                >
                  {/* linia łącząca klatki — pokazuje zakres animacji */}
                  {klatki.length > 1 && (
                    <div
                      className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-primary/25"
                      style={{
                        left: `${(klatki[0].czas / projekt.dlugosc) * 100}%`,
                        right: `${100 - (klatki[klatki.length - 1].czas / projekt.dlugosc) * 100}%`,
                      }}
                    />
                  )}
                  {klatki.map(k => (
                    <div
                      key={k.id}
                      onPointerDown={e => {
                        e.stopPropagation()
                        ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
                        refPrzeciagana.current = k.id
                        setWybranaKlatka(k.id)
                      }}
                      title={`${Math.round(k.czas)} ms · ${k.wygladzanie}`}
                      className={cn(
                        'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-grab border',
                        wybranaKlatka === k.id ? 'border-amber-300 bg-amber-300' : 'border-primary bg-primary/70',
                      )}
                      style={{ left: `${(k.czas / projekt.dlugosc) * 100}%` }}
                    />
                  ))}
                  {/* kursor czasu */}
                  <div
                    className="pointer-events-none absolute top-0 h-full w-px bg-amber-300"
                    style={{ left: `${(czas / projekt.dlugosc) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
