import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Plus, Type, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { wykryjTeksty, type WykrytyTekst } from './dostawca'

/**
 * Edit text: najpierw wykrywamy napisy na zdjęciu (OCR), potem użytkownik poprawia je w okienku i zatwierdza.
 * Czcionka: „zachowaj oryginalną” (domyślnie) albo wybór stylu liternictwa dla zmienionych napisów.
 */

export interface ZmianaTekstu {
  stary: string
  nowy: string
  box?: [number, number, number, number]
  styl?: string
}

export interface Czcionka {
  id: string
  nazwa: string
  /** opis dla modelu obrazu (EN) */
  opis: string
}

/** Style liternictwa — opisy dla modelu; „oryginalna” znaczy: dopasuj do istniejącego napisu. */
export const CZCIONKI: Czcionka[] = [
  { id: 'oryginalna', nazwa: 'Zachowaj oryginalną', opis: '' },
  { id: 'sans', nazwa: 'Sans-serif', opis: 'a clean modern sans-serif typeface (geometric, even stroke)' },
  { id: 'gruba', nazwa: 'Gruba / nagłówkowa', opis: 'a heavy, bold display sans-serif typeface suited to headlines' },
  { id: 'waska', nazwa: 'Wąska', opis: 'a tall condensed bold sans-serif typeface' },
  { id: 'szeryf', nazwa: 'Szeryfowa', opis: 'an elegant serif typeface with fine contrast between thick and thin strokes' },
  { id: 'pismo', nazwa: 'Pismo odręczne', opis: 'a flowing handwritten script typeface' },
  { id: 'mono', nazwa: 'Monospace', opis: 'a monospaced typewriter-style typeface' },
  { id: 'zaokraglona', nazwa: 'Zaokrąglona', opis: 'a friendly rounded sans-serif typeface with soft terminals' },
]

export function EdycjaTekstu({
  zdjecie,
  trwa,
  onZastosuj,
  onAnuluj,
  style,
}: {
  /** dane obrazu do analizy (data URL) */
  zdjecie: string
  trwa: boolean
  onZastosuj: (zmiany: ZmianaTekstu[], czcionka: Czcionka) => void
  onAnuluj: () => void
  style: React.CSSProperties
}) {
  const [stan, setStan] = useState<'wykrywam' | 'gotowe'>('wykrywam')
  const [wykryte, setWykryte] = useState<WykrytyTekst[]>([])
  const [wartosci, setWartosci] = useState<Record<string, string>>({})
  const [dodane, setDodane] = useState<{ id: string; stary: string; nowy: string }[]>([])
  const [czcionkaId, setCzcionkaId] = useState('oryginalna')

  useEffect(() => {
    let aktualne = true
    void wykryjTeksty(zdjecie).then(t => {
      if (!aktualne) return
      setWykryte(t)
      setWartosci(Object.fromEntries(t.map(x => [x.id, x.tekst])))
      setStan('gotowe')
    })
    return () => {
      aktualne = false
    }
  }, [zdjecie])

  const zmiany = useMemo<ZmianaTekstu[]>(() => {
    const z: ZmianaTekstu[] = []
    for (const t of wykryte) {
      const nowy = (wartosci[t.id] ?? t.tekst).trim()
      if (nowy && nowy !== t.tekst) z.push({ stary: t.tekst, nowy, box: t.box, styl: t.styl })
    }
    for (const d of dodane) if (d.stary.trim() && d.nowy.trim() && d.stary.trim() !== d.nowy.trim()) z.push({ stary: d.stary.trim(), nowy: d.nowy.trim() })
    return z
  }, [wykryte, wartosci, dodane])

  const czcionka = CZCIONKI.find(c => c.id === czcionkaId) ?? CZCIONKI[0]
  const zatwierdz = () => {
    if (!trwa && zmiany.length) onZastosuj(zmiany, czcionka)
  }

  return (
    <div
      role="dialog"
      aria-label="Edit text"
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Escape') onAnuluj()
      }}
      className="absolute z-50 w-[min(420px,calc(100vw-120px))]"
      style={style}
    >
      <div className="rounded-2xl border border-foreground/[0.1] bg-[hsl(var(--card))] p-3 shadow-[0_8px_24px_-8px_hsl(0_0%_0%/0.35)]">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-primary/[0.1] text-primary">
            <Type className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1 text-[13px] font-semibold text-foreground">Edit text</div>
          <button type="button" onClick={onAnuluj} aria-label="Zamknij" className="rounded-[10px] p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {stan === 'wykrywam' ? (
          <div className="flex items-center gap-2 rounded-[10px] bg-foreground/[0.04] px-3 py-3 text-[12.5px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Wykrywam tekst na zdjęciu…
          </div>
        ) : (
          <>
            <div className="max-h-[260px] space-y-1.5 overflow-y-auto pr-0.5">
              {wykryte.length === 0 && dodane.length === 0 && (
                <p className="rounded-[10px] bg-foreground/[0.04] px-3 py-2.5 text-[12px] text-muted-foreground">Nie wykryłem tekstu. Dodaj napis ręcznie: wpisz, co jest na zdjęciu, i na co zmienić.</p>
              )}
              {wykryte.map(t => {
                const zmieniony = (wartosci[t.id] ?? t.tekst).trim() !== t.tekst
                return (
                  <label key={t.id} className="block">
                    <span className="mb-0.5 block truncate px-1 text-[10.5px] text-muted-foreground/80" title={t.styl}>
                      {t.styl ? t.styl : 'napis'}
                    </span>
                    <input
                      value={wartosci[t.id] ?? t.tekst}
                      onChange={e => setWartosci(v => ({ ...v, [t.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          zatwierdz()
                        }
                      }}
                      className={cn(
                        'w-full rounded-[10px] border bg-foreground/[0.045] px-3 py-2 text-[13px] text-foreground outline-none transition-colors focus:border-primary/50',
                        zmieniony ? 'border-primary/40' : 'border-foreground/[0.07]',
                      )}
                    />
                  </label>
                )
              })}
              {dodane.map(d => (
                <div key={d.id} className="grid grid-cols-2 gap-1.5">
                  <input
                    value={d.stary}
                    placeholder="Co jest na zdjęciu"
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, stary: e.target.value } : x)))}
                    className="rounded-[10px] border border-foreground/[0.07] bg-foreground/[0.045] px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary/50"
                  />
                  <input
                    value={d.nowy}
                    placeholder="Zmień na"
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, nowy: e.target.value } : x)))}
                    className="rounded-[10px] border border-foreground/[0.07] bg-foreground/[0.045] px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDodane(l => [...l, { id: `d${l.length}`, stary: '', nowy: '' }])}
              className="mt-1.5 flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Dodaj napis ręcznie
            </button>

            <div className="mt-2.5 border-t border-foreground/[0.08] pt-2.5">
              <div className="mb-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/80">Czcionka</div>
              <div className="flex flex-wrap gap-1">
                {CZCIONKI.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCzcionkaId(c.id)}
                    className={cn(
                      'rounded-[10px] border px-2.5 py-1 text-[11.5px] transition-colors',
                      czcionkaId === c.id ? 'border-primary/40 bg-primary/10 font-medium text-primary' : 'border-foreground/[0.09] bg-foreground/[0.04] text-foreground/75 hover:text-foreground',
                    )}
                  >
                    {c.nazwa}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="px-1 text-[11px] text-muted-foreground/80">{zmiany.length ? `Zmian: ${zmiany.length}` : 'Edytuj napis, żeby zatwierdzić'}</span>
              <button
                type="button"
                disabled={trwa || zmiany.length === 0}
                onClick={zatwierdz}
                className="flex items-center gap-1.5 rounded-[10px] border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[12px] font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {trwa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Zatwierdź
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
