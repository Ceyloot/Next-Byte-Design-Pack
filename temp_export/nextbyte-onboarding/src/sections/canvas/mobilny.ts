import { useEffect, useState, useSyncExternalStore } from 'react'

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

/** Wysokość klawiatury ekranowej (px): o tyle przesuwamy dolne elementy, żeby pole pisania nie chowało się pod nią (iOS nie zmniejsza układu). */
export function useKlawiatura(): number {
  const [h, setH] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const odswiez = () => setH(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)))
    vv.addEventListener('resize', odswiez)
    vv.addEventListener('scroll', odswiez)
    odswiez()
    return () => {
      vv.removeEventListener('resize', odswiez)
      vv.removeEventListener('scroll', odswiez)
    }
  }, [])
  return h
}
