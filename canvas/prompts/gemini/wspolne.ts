/**
 * Wspólne pomocniki promptów Gemini: format pinesek i bezpieczny parser JSON.
 */
import type { PineskaWejscie } from '../types'

/** Model Gemini używany do obu analiz (widzi zdjęcia, zwraca JSON). */
export const MODEL_ANALIZY = 'gemini-2.5-flash'

/** Konfiguracja wspólna dla obu analiz: niska temperatura, wynik jako JSON. */
export const KONFIG_ANALIZY = {
  temperature: 0.1,
  maxOutputTokens: 4000,
  responseMimeType: 'application/json',
  thinkingConfig: { thinkingBudget: 512 },
}

const proc = (v: number) => `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`

/** Jedna linia opisu pineski dla Gemini (numer, zdjęcie, współrzędne, nazwa jeśli znana). */
export function liniaPineski(p: PineskaWejscie): string {
  const nazwa = p.nazwa ? ` — recogniser hint: "${p.nazwa}" (may be wrong or name only a part)` : ''
  return `- Pin ${p.numer}: on Image ${p.zdjecie}, X ${proc(p.x)}, Y ${proc(p.y)} (0% = left / top edge, 100% = right / bottom edge)${nazwa}`
}

/** Lista wszystkich pinesek w kolejności numerów. */
export function listaPinesek(pineski: PineskaWejscie[]): string {
  if (pineski.length === 0) return '- (no pins placed)'
  return [...pineski].sort((a, b) => a.numer - b.numer).map(liniaPineski).join('\n')
}

/**
 * Wyciąga obiekt JSON z odpowiedzi modelu (także gdy owinięty w ```json … ```
 * lub poprzedzony tekstem). Zwraca null, gdy nie da się sparsować.
 */
export function wyciagnijJson(tekst: string): Record<string, unknown> | null {
  const bez = tekst.replace(/```(?:json)?/gi, '').trim()
  const start = bez.indexOf('{')
  const koniec = bez.lastIndexOf('}')
  if (start === -1 || koniec <= start) return null
  try {
    const wynik = JSON.parse(bez.slice(start, koniec + 1))
    return wynik && typeof wynik === 'object' ? (wynik as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export const tekst = (v: unknown, domyslny = ''): string =>
  typeof v === 'string' && v.trim() ? v.trim() : domyslny
