import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BIBLIOTEKA, KATEGORIE, PRESETY_ANIMACJI, type KluczKategorii, type PozycjaBiblioteki, type PresetAnimacji } from './biblioteka'
import { Miniatura } from './RenderWezla'

interface Props {
  /** czy jest co animować — presety animacji wymagają zaznaczenia */
  maZaznaczenie: boolean
  onWstaw: (pozycja: PozycjaBiblioteki) => void
  onAnimacja: (preset: PresetAnimacji) => void
}

export function PanelBiblioteki({ maZaznaczenie, onWstaw, onAnimacja }: Props) {
  const [kategoria, setKategoria] = useState<KluczKategorii | 'wszystko'>('wszystko')
  const [szukaj, setSzukaj] = useState('')

  const pozycje = useMemo(() => {
    const fraza = szukaj.trim().toLowerCase()
    return BIBLIOTEKA.filter(p => {
      if (kategoria !== 'wszystko' && p.kategoria !== kategoria) return false
      if (!fraza) return true
      return p.nazwa.toLowerCase().includes(fraza) || p.tagi.some(t => t.toLowerCase().includes(fraza))
    })
  }, [kategoria, szukaj])

  // Fabryki wołamy raz na render listy — miniatura pokazuje realny węzeł.
  const podglady = useMemo(() => pozycje.map(p => ({ pozycja: p, wezel: p.utworz() })), [pozycje])

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl">
      <div className="border-b border-border/50 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          <Sparkles className="h-3 w-3 text-primary" /> Biblioteka
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/30" />
          <input
            value={szukaj}
            onChange={e => setSzukaj(e.target.value)}
            placeholder="Szukaj kafelków…"
            className="w-full rounded-lg border border-border/60 bg-background/60 py-1.5 pl-7 pr-2 text-xs outline-none placeholder:text-foreground/30 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Kategorie */}
      <div className="flex flex-wrap gap-1 border-b border-border/50 p-2">
        <Chip aktywny={kategoria === 'wszystko'} onClick={() => setKategoria('wszystko')}>
          Wszystko
        </Chip>
        {KATEGORIE.map(k => (
          <Chip key={k.klucz} aktywny={kategoria === k.klucz} onClick={() => setKategoria(k.klucz)} tytul={k.opis}>
            {k.etykieta}
          </Chip>
        ))}
      </div>

      {/* Kafelki */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
        {podglady.length === 0 && (
          <p className="px-1 py-6 text-center text-[11px] text-foreground/35">Nic nie pasuje do „{szukaj}”.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {podglady.map(({ pozycja, wezel }) => (
            <button
              key={pozycja.id}
              onClick={() => onWstaw(pozycja)}
              title={`${pozycja.nazwa} — kliknij, żeby wstawić`}
              className="group flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 p-1.5 text-left transition-all hover:border-primary/50 hover:bg-background/70"
            >
              <div className="grid h-[86px] w-full place-items-center overflow-hidden rounded-lg bg-[#0a0e14]">
                <Miniatura wezel={wezel} szer={108} wys={80} />
              </div>
              <span className="truncate text-[10px] font-medium text-foreground/70 group-hover:text-foreground">
                {pozycja.nazwa}
              </span>
            </button>
          ))}
        </div>

        {/* Presety animacji */}
        <div className="mt-4 border-t border-border/50 pt-3">
          <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Animacje
          </div>
          {!maZaznaczenie && (
            <p className="px-1 pb-2 text-[10px] text-foreground/35">Zaznacz warstwę, żeby zastosować preset.</p>
          )}
          <div className="grid gap-1">
            {PRESETY_ANIMACJI.map(p => (
              <button
                key={p.id}
                disabled={!maZaznaczenie}
                onClick={() => onAnimacja(p)}
                className={cn(
                  'rounded-lg border border-border/50 bg-background/40 px-2 py-1.5 text-left transition-colors',
                  maZaznaczenie ? 'hover:border-primary/50 hover:bg-background/70' : 'opacity-40',
                )}
              >
                <div className="text-[11px] font-semibold text-foreground/80">{p.nazwa}</div>
                <div className="text-[9px] text-foreground/40">{p.opis}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({
  aktywny,
  onClick,
  children,
  tytul,
}: {
  aktywny: boolean
  onClick: () => void
  children: React.ReactNode
  tytul?: string
}) {
  return (
    <button
      onClick={onClick}
      title={tytul}
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors',
        aktywny
          ? 'border-primary/60 bg-primary/10 text-primary'
          : 'border-border/60 bg-background/40 text-foreground/55 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
