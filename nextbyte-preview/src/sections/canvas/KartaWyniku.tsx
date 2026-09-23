import { Check, Loader2, TriangleAlert, X } from 'lucide-react'
import type { StanGeneracji } from './typy'

/**
 * Wynik generacji jako karta pływająca nad paskiem polecenia.
 *
 * Sam obraz na płótnie nie mówi, co się stało ani czym to powstało — więc
 * karta niesie trzy rzeczy, których z kadru nie widać: miniaturę, nazwę
 * modelu z realnym kosztem i opis po polsku. Znika kliknięciem, bo ma
 * towarzyszyć pracy, a nie zajmować miejsce na stałe.
 */
export function KartaWyniku({ stan, onZamknij }: { stan: StanGeneracji; onZamknij: () => void }) {
  if (stan.faza === 'bezczynny') return null

  return (
    <div className="nb-szklo nb-szklo-canvas pointer-events-auto mb-2 rounded-2xl border border-border/60 bg-card/70 p-2.5 shadow-2xl">
      {stan.faza === 'trwa' && (
        <div className="flex items-center gap-2.5 px-0.5 text-[12px] text-foreground/70">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Model pracuje nad zdjęciem…
        </div>
      )}

      {stan.faza === 'blad' && (
        <div className="flex items-start gap-2.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="flex-1 text-[11.5px] leading-relaxed text-foreground/70">{stan.tresc}</p>
          <Zamknij onClick={onZamknij} />
        </div>
      )}

      {stan.faza === 'gotowe' && (
        <div className="flex items-start gap-2.5">
          <img
            src={stan.wynik.obrazUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-border/20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="truncate text-[12px] font-bold text-foreground">{stan.wynik.nazwa}</span>
              <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-wide text-foreground/40">
                {stan.wynik.model}
              </span>
              <span className="shrink-0 text-[9.5px] text-foreground/30">${stan.wynik.kosztUSD.toFixed(4)}</span>
            </div>
            <p className="mt-0.5 line-clamp-3 text-[11px] leading-relaxed text-foreground/55">
              {stan.wynik.opis}
            </p>
          </div>
          <Zamknij onClick={onZamknij} />
        </div>
      )}
    </div>
  )
}

function Zamknij({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Zamknij"
      className="shrink-0 rounded p-1 text-foreground/25 transition-colors hover:bg-foreground/5 hover:text-foreground/70"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  )
}
