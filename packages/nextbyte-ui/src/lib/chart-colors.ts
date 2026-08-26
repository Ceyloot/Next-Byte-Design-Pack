// Kategoryczna paleta do wykresów (ring/donut/gauge) — czyta z motywu.
// `--chart-1..5` istnieje tylko w 7 z 14 motywów, więc każdy wpis ma
// zapasowy (fallback) łańcuch do gwarantowanych 22 zmiennych kontraktu —
// nigdy stałego hexa/hsl. Patrz design-kit/README.md sekcja KONTRAKT.
export const CHART_1       = 'hsl(var(--chart-1, var(--primary)))'
export const CHART_2       = 'hsl(var(--chart-2, var(--brand-primary-light)))'
export const CHART_3       = 'hsl(var(--chart-3, var(--brand-primary-dark)))'
export const CHART_4       = 'hsl(var(--chart-4, var(--destructive)))'
export const CHART_NEUTRAL = 'hsl(var(--muted-foreground))'

// Rampa jednego koloru (odcienie --primary motywu) — do wykresów, gdzie
// kategorie mają wyglądać jak "ten sam kolor", ale wyraźnie od siebie
// odróżnialne. --primary w tym systemie jest zwykle już bardzo jasny
// (blisko bieli), więc dalsze rozjaśnianie prawie nic nie zmienia —
// zamiast tego rampa idzie w stronę czerni, gdzie jest dużo więcej
// widocznej przestrzeni, a odcienie wciąż czytelne na ciemnym tle karty.
export const TINT_1 = 'hsl(var(--primary))'
export const TINT_2 = 'color-mix(in oklch, hsl(var(--primary)) 74%, black 26%)'
export const TINT_3 = 'color-mix(in oklch, hsl(var(--primary)) 50%, black 50%)'
export const TINT_4 = 'color-mix(in oklch, hsl(var(--primary)) 30%, black 70%)'
export const TINT_5 = 'color-mix(in oklch, hsl(var(--primary)) 16%, black 84%)'

// Wersja o niskiej krycie tego samego koloru — do tła/obwódki pigułek
// legendy, żeby nie doklejać osobnych klas Tailwinda per segment.
export function tintFaded(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}
