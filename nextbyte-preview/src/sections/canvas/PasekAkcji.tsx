import type { ComponentType, CSSProperties } from 'react'
import { Loader2 } from 'lucide-react'
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
  return (
    <div
      role="toolbar"
      aria-label={etykieta}
      onPointerDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      className="absolute z-50"
      style={style}
    >
      <div className="flex items-center gap-0.5 overflow-x-auto rounded-xl border border-foreground/[0.1] bg-card p-1 shadow-[0_10px_32px_-8px_rgba(0,0,0,0.55)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {akcje.map(a => (
          <div key={a.id} className="flex items-center">
            {a.separator && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-foreground/[0.1]" />}
            <button
              type="button"
              disabled={zablokowane && !a.trwa}
              onClick={a.onClick}
              title={a.tytul ?? a.etykieta}
              aria-label={a.etykieta}
              className={cn(
                'flex h-9 items-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-medium text-foreground/80 transition-colors duration-150',
                a.tylkoIkona ? 'w-9 justify-center' : 'px-3',
                a.trwa ? 'bg-primary/15 text-primary' : 'hover:bg-foreground/[0.07] hover:text-foreground',
                zablokowane && !a.trwa && 'opacity-40',
              )}
            >
              {a.trwa ? <Loader2 className="h-4 w-4 animate-spin" /> : <a.ikona className="h-4 w-4" />}
              {!a.tylkoIkona && a.etykieta}
              {a.skrot && <span className="text-[12px] font-normal text-muted-foreground">{a.skrot}</span>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
