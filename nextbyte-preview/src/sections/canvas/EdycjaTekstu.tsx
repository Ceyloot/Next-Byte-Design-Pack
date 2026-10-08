import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
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
      className="absolute z-50 w-[min(320px,calc(100vw-120px))]"
      style={style}
    >
      <div className="rounded-2xl border border-foreground/[0.1] bg-[hsl(var(--card))] p-3.5 shadow-[0_8px_24px_-8px_hsl(0_0%_0%/0.35)]">
        <div className="mb-3 text-[14px] font-semibold text-foreground">Edit text</div>

        {stan === 'wykrywam' ? (
          <div className="flex items-center gap-2 rounded-[12px] bg-foreground/[0.05] px-3.5 py-3 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Wykrywam tekst…
          </div>
        ) : (
          <>
            <div className="max-h-[320px] space-y-2 overflow-y-auto">
              {wykryte.length === 0 && dodane.length === 0 && (
                <p className="rounded-[12px] bg-foreground/[0.05] px-3.5 py-3 text-[12.5px] text-muted-foreground">Nie wykryłem tekstu. Dodaj napis ręcznie.</p>
              )}
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
                    'w-full rounded-[12px] border bg-foreground/[0.05] px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-colors focus:border-primary/50',
                    (wartosci[t.id] ?? t.tekst).trim() !== t.tekst ? 'border-primary/40' : 'border-transparent',
                  )}
                />
              ))}
              {dodane.map(d => (
                <div key={d.id} className="space-y-1.5">
                  <input
                    value={d.stary}
                    placeholder="Napis na zdjęciu"
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, stary: e.target.value } : x)))}
                    className="w-full rounded-[12px] border border-transparent bg-foreground/[0.05] px-3.5 py-2.5 text-[13.5px] text-foreground outline-none focus:border-primary/50"
                  />
                  <input
                    value={d.nowy}
                    placeholder="Zmień na…"
                    onChange={e => setDodane(l => l.map(x => (x.id === d.id ? { ...x, nowy: e.target.value } : x)))}
                    className="w-full rounded-[12px] border border-primary/30 bg-foreground/[0.05] px-3.5 py-2.5 text-[13.5px] text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDodane(l => [...l, { id: `d${l.length}`, stary: '', nowy: '' }])}
              className="mt-2 flex items-center gap-1.5 rounded-[10px] px-1.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Dodaj napis
            </button>

            <label className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
              Czcionka
              <select
                value={czcionkaId}
                onChange={e => setCzcionkaId(e.target.value)}
                className="min-w-0 flex-1 rounded-[10px] border border-transparent bg-foreground/[0.05] px-2.5 py-1.5 text-[12.5px] text-foreground outline-none focus:border-primary/50"
              >
                {CZCIONKI.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nazwa}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAnuluj}
                className="rounded-[12px] border border-foreground/[0.14] px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={trwa || zmiany.length === 0}
                onClick={zatwierdz}
                className="flex items-center justify-center gap-1.5 rounded-[12px] bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-foreground/[0.08] disabled:text-muted-foreground disabled:opacity-100"
              >
                {trwa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Run <span className="text-[11.5px] opacity-70">· 4</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
