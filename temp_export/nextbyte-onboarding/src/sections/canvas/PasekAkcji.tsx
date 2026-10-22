import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AkcjaPaska {
  id: string
  etykieta: string
  ikona: ComponentType<{ className?: string }>
  skrot?: string
  tytul?: string
  /** pokazuje spinner i podświetlenie, gdy akcja trwa */
  trwa?: boolean
  /** tylko ikona (np. Pobierz) */
  tylkoIkona?: boolean
  /** cienka kreska przed tą akcją */
  separator?: boolean
  /** schowana pod przyciskiem „…” — pasek pokazuje tylko najważniejsze akcje */
  wMenu?: boolean
  onClick: () => void
}

/**
 * Pasek akcji nad zaznaczonym zdjęciem — układ jak w Lovarcie (jedna płaska belka: ikona + podpis, kreski między grupami,
 * skrót przy pierwszej akcji), ale w ciemnym stylu NextByte: lita karta motywu zamiast szkła, bez obwódek na każdym przycisku.
 */
export function PasekAkcji({
  akcje,
  zablokowane,
  etykieta,
  style,
}: {
  akcje: AkcjaPaska[]
  zablokowane: boolean
  etykieta: string
  style: CSSProperties
}) {
  const glowne = akcje.filter(a => !a.wMenu && !a.tylkoIkona)
  const schowane = akcje.filter(a => a.wMenu)
  const koniec = akcje.filter(a => !a.wMenu && a.tylkoIkona)
  const [otwarte, setOtwarte] = useState(false)
  const [wGore, setWGore] = useState(false)
  const korzen = useRef<HTMLDivElement>(null)
  const trwaSchowana = schowane.some(a => a.trwa)

  useEffect(() => {
    if (!otwarte) return
    const zamknij = (e: PointerEvent) => {
      if (!korzen.current?.contains(e.target as Node)) setOtwarte(false)
    }
    const klawisz = (e: KeyboardEvent) => e.key === 'Escape' && setOtwarte(false)
    document.addEventListener('pointerdown', zamknij)
    document.addEventListener('keydown', klawisz)
    return () => {
      document.removeEventListener('pointerdown', zamknij)
      document.removeEventListener('keydown', klawisz)
    }
  }, [otwarte])

  const przycisk = (a: AkcjaPaska) => (
    <div key={a.id} className="flex items-center">
      {a.separator && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-foreground/[0.1]" />}
      <button
        type="button"
        disabled={zablokowane && !a.trwa}
        onClick={a.onClick}
        title={a.tytul ?? a.etykieta}
        aria-label={a.etykieta}
        className={cn(
          'flex h-9 items-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] font-medium text-foreground/80 transition-all duration-200',
          a.tylkoIkona ? 'w-9 justify-center' : 'px-3 max-md:w-9 max-md:justify-center max-md:px-0',
          a.trwa ? 'bg-primary/15 text-primary' : 'hover:bg-foreground/[0.06] hover:text-foreground active:scale-95',
          zablokowane && !a.trwa && 'opacity-40',
        )}
      >
        {a.trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <a.ikona className="h-4 w-4" />}
        {!a.tylkoIkona && <span className="max-md:sr-only">{a.etykieta}</span>}
        {a.skrot && <span className="text-[12px] font-normal text-muted-foreground max-md:hidden">{a.skrot}</span>}
      </button>
    </div>
  )

  return (
    <div
      ref={korzen}
      role="toolbar"
      aria-label={etykieta}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      className="absolute z-50"
      style={style}
    >
      <div className="nb-cozy-plyta flex h-12 items-center gap-0.5 rounded-2xl border p-1.5">
        {glowne.map(przycisk)}
        {schowane.length > 0 && (
          <div className="flex items-center">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={otwarte}
              aria-label="Więcej akcji"
              title="Więcej akcji"
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                setWGore(r.bottom + 260 > window.innerHeight)
                setOtwarte(o => !o)
              }}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-[10px] text-foreground/80 transition-all duration-200 hover:bg-foreground/[0.06] hover:text-foreground active:scale-95',
                (otwarte || trwaSchowana) && 'bg-foreground/[0.08] text-foreground',
              )}
            >
              {trwaSchowana ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <MoreHorizontal className="h-4 w-4" />}
            </button>
          </div>
        )}
        {koniec.map(a => przycisk({ ...a, separator: true }))}
      </div>
      {otwarte && (
        <div
          role="menu"
          className={cn('nb-cozy-plyta absolute right-0 z-10 w-[190px] rounded-2xl border p-1.5', wGore ? 'bottom-full mb-2' : 'top-full mt-2')}
        >
          {schowane.map(a => (
            <button
              key={a.id}
              role="menuitem"
              type="button"
              disabled={zablokowane && !a.trwa}
              onClick={() => {
                setOtwarte(false)
                a.onClick()
              }}
              title={a.tytul ?? a.etykieta}
              className={cn(
                'flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] font-medium text-foreground/85 transition-colors hover:bg-foreground/[0.07] hover:text-foreground',
                zablokowane && !a.trwa && 'opacity-40',
              )}
            >
              {a.trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <a.ikona className="h-4 w-4" />}
              {a.etykieta}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
