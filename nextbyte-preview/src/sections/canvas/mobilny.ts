import { useSyncExternalStore } from 'react'

/** Telefon: węższe niż `md` (768 px). Jedno źródło prawdy dla układu Canvasa na małych ekranach. */
const ZAPYTANIE = '(max-width: 767px)'

const subskrybuj = (cb: () => void) => {
  const m = window.matchMedia(ZAPYTANIE)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

export const jestMobilny = () => typeof window !== 'undefined' && window.matchMedia(ZAPYTANIE).matches

export function useMobilny(): boolean {
  return useSyncExternalStore(subskrybuj, jestMobilny, () => false)
}
