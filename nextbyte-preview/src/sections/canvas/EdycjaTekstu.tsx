import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Loader2, Plus, ScanText, Type, X } from 'lucide-react'
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
      className="absolute z-50 w-[min(300px,calc(100vw-120px))]"
      style={style}
    >
      <div className="rounded-2xl border border-[hsl(var(--primary)/0.22)] bg-[hsl(var(--card))] p-3 shadow-[0_0_32px_-10px_hsl(var(--primary)/0.4),0_10px_28px_-10px_hsl(0_0%_0%/0.5)]">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-primary">
            <Type className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-semibold text-foreground">Edit text</span>
          <button type="button" onClick={onAnuluj} aria-label="Zamknij" className="grid h-7 w-7 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {stan === 'wykrywam' ? (
          <div className="grid place-items-center rounded-[12px] bg-foreground/[0.04] py-5 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="max-h-[300px] space-y-1.5 overflow-y-auto">
              {wykryte.length === 0 && dodane.length === 0 && <div className="grid place-items-center rounded-[12px] bg-foreground/[0.04] py-4 text-muted-foreground"><ScanText className="h-5 w-5" /></div>}
              {wykryte.map(t => (
                <input
                  key={t.id}
                  value={wartosci[t.id] ?? t.tekst}
                  title={t.styl}
                  onChange={e => setWartosci(v => ({ ...v, [t.id]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      zatwierdz()
                    }
                  }}
                  className={cn(
                    'w-full rounded-[12px] border bg-foreground/[0.05] px-3 py-2 text-[13px] text-foreground outline-none transition-colors focus:border-primary/50',
                    (wartosci[t.id] ?? t.tekst).trim() !== t.tekst ? 'border-primary/40 bg-primary/[0.06]' : 'border-transparent',
                  )}
                />
              ))}
              {dodane.map(d => (
                <div key={d.id} className="flex items-center gap-1.5">
                  <input
                    value={d.stary}
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, stary: e.target.value } : x)))}
                    className="min-w-0 flex-1 rounded-[12px] border border-transparent bg-foreground/[0.05] px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary/50"
                  />
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    value={d.nowy}
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, nowy: e.target.value } : x)))}
                    className="min-w-0 flex-1 rounded-[12px] border border-primary/30 bg-primary/[0.06] px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                title="Dodaj napis"
                aria-label="Dodaj napis"
                onClick={() => setDodane(l => [...l, { id: `d${l.length}`, stary: '', nowy: '' }])}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-foreground/[0.09] bg-foreground/[0.04] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <select
                aria-label="Czcionka"
                title="Czcionka"
                value={czcionkaId}
                onChange={e => setCzcionkaId(e.target.value)}
                className="h-8 min-w-0 flex-1 rounded-[10px] border border-foreground/[0.09] bg-foreground/[0.04] px-2.5 text-[12.5px] text-foreground outline-none focus:border-primary/50"
              >
                {CZCIONKI.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nazwa}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={trwa || zmiany.length === 0}
                onClick={zatwierdz}
                aria-label="Uruchom"
                title="Uruchom (Enter)"
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] border border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary)/0.14)] px-3 text-[12.5px] font-semibold text-foreground shadow-[0_0_18px_-6px_hsl(var(--primary)/0.6)] transition-colors hover:bg-[hsl(var(--primary)/0.22)] disabled:cursor-not-allowed disabled:border-foreground/[0.09] disabled:bg-foreground/[0.04] disabled:text-muted-foreground disabled:shadow-none"
              >
                {trwa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span className="text-[11.5px] opacity-70">4</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
