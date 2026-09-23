import { useState } from 'react'
import { FileText, Image, LayoutGrid, MessageSquare, Palette, ScrollText } from 'lucide-react'
import { Karta, Kontrolka } from '../Powierzchnia'
import { cn } from '../../lib/utils'

/**
 * SKRZYNKA SPRAW — ostatnie rzeczy ze wszystkich modułów.
 *
 * WZORZEC DLA LIST: wiersz to `Kontrolka` (poziom 3). Nagłówek grupy nie jest
 * powierzchnią, tylko `p2-etykieta` — grupowanie robi typografia, nie kolejne
 * pudełko. Każde pudełko w pudełku kosztuje poziom drabiny, a mamy trzy.
 */
const FILTRY = [
  { id: 'wszystko', nazwa: 'Wszystko', ikona: LayoutGrid },
  { id: 'notatki', nazwa: 'Notatki', ikona: FileText },
  { id: 'obrazy', nazwa: 'Obrazy', ikona: Image },
  { id: 'rozmowy', nazwa: 'Rozmowy', ikona: MessageSquare },
  { id: 'dokumenty', nazwa: 'Dokumenty', ikona: ScrollText },
  { id: 'studio', nazwa: 'Studio', ikona: Palette },
] as const

export interface Sprawa {
  id: string
  tytul: string
  zrodlo: string
  kiedy: string
  grupa: string
  ikona: React.ComponentType<{ className?: string }>
}

export function Skrzynka({ sprawy, className }: { sprawy: Sprawa[]; className?: string }) {
  const [filtr, setFiltr] = useState<string>('wszystko')
  const grupy = [...new Set(sprawy.map((s) => s.grupa))]

  return (
    <Karta className={cn('flex min-h-0 flex-col p-3', className)}>
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {FILTRY.map(({ id, nazwa, ikona: Ikona }) => {
          const aktywny = filtr === id
          const pierwszy = id === 'wszystko'
          return (
            <button
              key={id}
              onClick={() => setFiltr(id)}
              aria-pressed={aktywny}
              title={nazwa}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                aktywny ? 'p2-akcent-tlo' : 'p2-cichy hover:bg-[var(--p2-powierzchnia-2)]',
              )}
            >
              <Ikona className="h-3.5 w-3.5" />
              {pierwszy && nazwa}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {grupy.map((grupa) => (
          <div key={grupa}>
            <p className="p2-etykieta mb-1.5 px-1">{grupa}</p>
            <ul className="space-y-1">
              {sprawy.filter((s) => s.grupa === grupa).map((s) => (
                <Kontrolka as="li" key={s.id} className="flex items-center gap-3 px-2.5 py-2">
                  <span className="p2-pow-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <s.ikona className="h-4 w-4 p2-cichy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.tytul}</span>
                    <span className="block truncate text-xs p2-cichy">{s.zrodlo}</span>
                  </span>
                  <span className="shrink-0 text-xs p2-cichy">{s.kiedy}</span>
                </Kontrolka>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Karta>
  )
}
