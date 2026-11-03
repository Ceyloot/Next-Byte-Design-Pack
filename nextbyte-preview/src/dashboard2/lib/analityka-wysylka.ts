/**
 * Podmiana `@vercel/analytics` — kopia Panelu Głównego nic nie raportuje.
 *
 * Oryginalna `analityka.ts` zostaje nietknięta co do reguł (co wolno wysłać,
 * co jest daną osobową), bo to część jej zachowania. Zmienia się tylko
 * ujście: zamiast Vercela zdarzenie ginie.
 */
export function track(_nazwa: string, _wlasciwosci?: Record<string, unknown>): void {
  /* celowo puste */
}
