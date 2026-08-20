/** Podstrony publicznej witryny NextByte */
export type HomePage = 'home' | 'cennik' | 'b2b'

export const STRONY: { id: HomePage; label: string }[] = [
  { id: 'home',   label: 'Strona główna' },
  { id: 'cennik', label: 'Cennik' },
  { id: 'b2b',    label: 'Dla firm' },
]
