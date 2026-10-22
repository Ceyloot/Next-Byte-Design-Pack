import { Activity, Plus, Receipt } from 'lucide-react'
import { Karta, Pigulka } from '../fundament/Powierzchnia'
import { cn } from '@/lib/utils'

/**
 * PAS AKTYWNOŚCI — pierwszy kafelek panelu.
 * Mapa 6 miesięcy po lewej, saldo Byte i przebieg zużycia po prawej.
 *
 * WZORZEC DLA DANYCH LICZBOWYCH: intensywność mapy i linia wykresu liczą się
 * z `--primary` przez `color-mix`/alfę, więc mapa przebarwia się razem
 * z motywem i NIE trzeba dla niej osobnej palety.
 */

/* Ziarno stałe — makieta ma wyglądać tak samo przy każdym renderze. */
function mapaAktywnosci(tygodni = 26, dni = 7) {
  const out: number[][] = []
  let n = 7
  const losuj = () => ((n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  for (let t = 0; t < tygodni; t++) {
    const kol: number[] = []
    for (let d = 0; d < dni; d++) {
      const r = losuj()
      kol.push(r > 0.78 ? 3 : r > 0.58 ? 2 : r > 0.34 ? 1 : 0)
    }
    out.push(kol)
  }
  return out
}

const MIESIACE = ['Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz']
const SIATKA = mapaAktywnosci()

/* Intensywność 0–3 → krycie akcentu. Poziom 0 idzie z drabiny powierzchni,
   żeby puste dni były „dziurą w karcie”, a nie szarym kwadratem wpisanym
   z ręki (taki kwadrat znika na motywie jasnym). */
const KRYCIE = ['0', '0.32', '0.62', '1']

export function PasAktywnosci({ saldo = 0, dni = 0 }: { saldo?: number; dni?: number }) {
  /* WYMIARY 1:1 Z ORYGINALEM (`dashboard/ByteStatusBar.tsx`):
     TRZY bloki, nie dwa — mapa (ograniczona do 440px), srodek (rosnie)
     i kolumna przyciskow (staly 128px). Mapa ma `max-w-[440px]`, a NIE
     procent: przy szerokim oknie procent rozciagalby kwadraty mapy
     i rozjezdzal ja z oryginalem. */
  return (
    <Karta className="flex flex-col gap-4 p-4 md:flex-row md:items-stretch">
      {/* ── Mapa aktywności ── */}
      <div className="min-w-0 flex-1 md:max-w-[440px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 p2-akcent" />
            <h2 className="text-sm font-semibold">Aktywność</h2>
          </div>
          <Pigulka>● Ostatnie 6 mies.</Pigulka>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-[3px] text-[10px] p2-cichy">
            <span>Wt</span><span>Cz</span><span>So</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between pr-1 text-[10px] p2-cichy">
              {MIESIACE.map((m) => <span key={m}>{m}</span>)}
            </div>
            <div className="flex gap-[3px]" role="img" aria-label="Mapa aktywności z ostatnich sześciu miesięcy">
              {SIATKA.map((kol, i) => (
                <div key={i} className="flex flex-1 flex-col gap-[3px]">
                  {kol.map((v, j) => (
                    <div
                      key={j}
                      className={cn('aspect-square w-full rounded-[2px]', v === 0 && 'p2-pow-3')}
                      style={v === 0 ? undefined : { background: `hsl(var(--primary) / ${KRYCIE[v]})` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rozdzielacz — z rantu drabiny, nie z `--border`. */}
      <div className="hidden w-px shrink-0 self-stretch md:block" style={{ background: 'var(--p2-rant)' }} aria-hidden />

      {/* ── Srodek: saldo + przebieg zuzycia. `flex-1` — to ON rosnie. ── */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start gap-3">
          <div>
            <p className="flex items-baseline gap-1 text-3xl font-bold leading-none tabular-nums">
              {saldo}
              <span className="p2-akcent text-base font-normal">⟠</span>
            </p>
            <Pigulka ton="akcent" className="mt-2">Beta 5.0.0</Pigulka>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] p2-cichy">
            <span>17.09</span><span>20.09</span>
            <span className="flex items-center gap-1">
              dziś
              <span className="p2-akcent-tlo rounded px-1 font-semibold">7d</span>
              <span>30d</span><span>90d</span>
            </span>
          </div>
          {/* Przebieg zużycia — kolor z `--destructive`, bo to ostrzeżenie. */}
          <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
            <defs>
              <linearGradient id="p2-zuzycie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive) / 0.28)" />
                <stop offset="100%" stopColor="hsl(var(--destructive) / 0)" />
              </linearGradient>
            </defs>
            <path d="M0,6 L90,6 C120,6 130,30 160,31 L300,31 L300,40 L0,40 Z" fill="url(#p2-zuzycie)" />
            <path d="M0,6 L90,6 C120,6 130,30 160,31 L300,31" fill="none" stroke="hsl(var(--destructive))" strokeWidth="1.5" />
          </svg>
          <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>
            Wystarczy na ~{dni} dni przy 1 ⟠ dziennie
          </p>
        </div>
      </div>

      {/* ── Przyciski: staly 128px, kolumna. `grid-cols-2` na telefonie,
             bo w oryginale przy `flex-1` wychodzily 138 vs 164 px. ── */}
      <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col">
        <button
          type="button"
          className="p2-kontrolka flex h-9 items-center justify-center gap-1.5 text-xs font-medium sm:w-[128px]"
          style={{ borderColor: 'hsl(var(--destructive) / 0.45)', color: 'hsl(var(--destructive))' }}
        >
          <Plus className="h-3 w-3" /> Doładuj
        </button>
        <button type="button" className="p2-kontrolka flex h-9 items-center justify-center gap-1.5 text-xs font-medium sm:w-[128px]">
          <Receipt className="h-3 w-3" /> Wydatki
        </button>
      </div>
    </Karta>
  )
}
