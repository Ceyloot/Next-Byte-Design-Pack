import { useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PANELE, type KontekstDoku } from './dok-panele'

/**
 * Dok po prawej — miejsce na wszystko, co nie mieści się przy obiekcie.
 *
 * Sam nie wie, co pokazuje: pyta panele z rejestru, które z nich pasują do
 * bieżącego zaznaczenia. Dzięki temu dołożenie biblioteki komponentów albo
 * osi czasu animacji nie dotyka tego pliku.
 */
export function Dok({ k }: { k: KontekstDoku }) {
  const [zwiniety, setZwiniety] = useState(false)
  const widoczne = PANELE.filter(p => p.pasuje(k))

  if (widoczne.length === 0) return null

  return (
    <div
      className={cn(
        // Pozycja żyje na opakowaniu, a szkło w środku: reguła
        // `.is-glass .nb-szklo` ustawia `position: relative` i ma wyższą
        // wagę niż klasa `absolute`, więc panel ze szkłem nie może sam
        // być kotwiczony.
        'pointer-events-auto absolute right-3 top-3 bottom-3 z-30 transition-[width] duration-200',
        zwiniety ? 'w-11' : 'w-[264px]',
      )}
    >
      <div className="nb-szklo nb-szklo-canvas flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-2xl">
      <button
        onClick={() => setZwiniety(v => !v)}
        title={zwiniety ? 'Rozwiń panel' : 'Zwiń panel'}
        className="flex h-9 shrink-0 items-center justify-end px-3 text-foreground/30 transition-colors hover:text-foreground/70"
      >
        {zwiniety ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
      </button>

      {!zwiniety && (
        <div className="flex-1 overflow-y-auto scrollbar-none px-3 pb-3">
          {widoczne.map(({ id, tytul, ikona: Ikona, Tresc }) => (
            <section key={id} className="border-t border-border/[0.06] py-2.5 first:border-t-0 first:pt-0">
              <h3 className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-foreground/35">
                <Ikona className="h-3 w-3" />
                {tytul}
              </h3>
              <Tresc k={k} />
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
