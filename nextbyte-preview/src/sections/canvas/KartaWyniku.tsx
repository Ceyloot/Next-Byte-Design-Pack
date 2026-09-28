import { Check, Eye, Loader2, TriangleAlert, X } from 'lucide-react'
import type { StanGeneracji } from './typy'

/**
 * Karta generacji — od planu do oceny.
 *
 * Pokazuje cztery rzeczy, których z samego obrazu nie widać: co asystent
 * zamierza zrobić, że trwa, czym to powstało i ile kosztowało, oraz czy
 * zadanie faktycznie zostało wykonane. Ostatnie jest najważniejsze:
 * miniatura potrafi wyglądać dobrze, a dopiero powiększenie pokazuje
 * obiekt w złym miejscu albo wypalony znacznik.
 */
export function KartaWyniku({ stan, onZamknij }: { stan: StanGeneracji; onZamknij: () => void }) {
  if (stan.faza === 'bezczynny') return null

  return (
    <div className="nb-szklo nb-szklo-canvas pointer-events-auto mb-2 rounded-2xl border border-border/60 bg-card/70 p-2.5 shadow-2xl">
      {stan.faza === 'planuje' && <Praca tresc="Asystent ogląda zdjęcia…" />}

      {stan.faza === 'trwa' && (
        <Praca tresc={stan.plan ? stan.plan : 'Model pracuje nad zdjęciem…'} />
      )}

      {stan.faza === 'sprawdza' && <Praca tresc="Sprawdzam, czy wyszło zgodnie z zadaniem…" />}

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

            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-foreground/55">
              {stan.wynik.opis}
            </p>

            {/* Ocena kontrolna — osobno i z własną ikoną, żeby nie zlewała
                się z opisem tego, o co prosiliśmy. */}
            {stan.ocena && (
              <div
                className={`mt-1.5 flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] leading-snug ${
                  stan.ocena.wykonane && !stan.ocena.znaczniki
                    ? 'bg-emerald-400/10 text-emerald-200/80'
                    : 'bg-amber-400/10 text-amber-200/85'
                }`}
              >
                {stan.ocena.wykonane && !stan.ocena.znaczniki ? (
                  <Eye className="mt-px h-3 w-3 shrink-0" />
                ) : (
                  <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
                )}
                <span>
                  {stan.ocena.znaczniki && <b>Uwaga: w wyniku widać ślady zaznaczenia. </b>}
                  {stan.ocena.ocena}
                </span>
              </div>
            )}
          </div>
          <Zamknij onClick={onZamknij} />
        </div>
      )}
    </div>
  )
}

function Praca({ tresc }: { tresc: string }) {
  return (
    <div className="flex items-center gap-2.5 px-0.5 text-[12px] text-foreground/70">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
      {tresc}
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
