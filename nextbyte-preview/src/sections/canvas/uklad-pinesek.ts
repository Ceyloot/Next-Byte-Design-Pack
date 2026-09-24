/**
 * Układ pinesek: które zdjęcie jest płótnem i jaką rolę ma każda pineska.
 *
 * Kolejność pinesek nic nie mówi o rolach. „Wstaw go tutaj” z pineską celu
 * wbitą jako pierwsza dało myśliwiec w lesie zamiast auta na lotnisku —
 * kod zakładał, że pierwsza pineska to obiekt, a ostatnia to miejsce.
 *
 * Model językowy też tego nie rozstrzygnął: Gemini Flash i Flash-Lite,
 * zapytane w jednym kroku o tryb, płótno i role, raz odwróciły role, raz
 * zajęły się sofą. Dlatego rozbijamy to na pytanie proste dla oka — czy
 * punkt leży NA RZECZY, czy NA MIEJSCU (ziemia, woda, podłoga) — i na
 * regułę w kodzie: przy wstawianiu i przenoszeniu płótnem jest zdjęcie
 * z pineską-miejscem, a obiekt przychodzi spod pineski-rzeczy.
 */
import type { Intencja } from './tryby-edycji'
import type { RolaPineski } from './rezyser'
import type { Pineska, Warstwa } from './typy'

export type RodzajPunktu = 'object' | 'location'

export interface Uklad {
  /** zdjęcie, w którego kadrze wróci wynik — `null`, gdy reguła nic nie rozstrzyga */
  plotno: Warstwa | null
  /** numer pineski (od 1) → rola */
  role: Record<number, RolaPineski>
}

export function ustalUklad(
  pineski: Pineska[],
  warstwy: Warstwa[],
  intencja: Intencja,
  rodzaje: Record<string, RodzajPunktu> | null,
): Uklad {
  const pusty: Uklad = { plotno: null, role: {} }
  if (!rodzaje || (intencja !== 'wstaw' && intencja !== 'przenies')) return pusty

  const uchwyty = pineski.filter(p => !p.chroniona)
  const miejsca = uchwyty.filter(p => rodzaje[p.id] === 'location')
  const rzeczy = uchwyty.filter(p => rodzaje[p.id] === 'object')
  if (miejsca.length === 0 || rzeczy.length === 0) return pusty

  const cel = miejsca[0]
  // Obiekt z innego zdjęcia ma pierwszeństwo — to jest „przynieś go tutaj”.
  const obiekt = rzeczy.find(p => p.layerId !== cel.layerId) ?? rzeczy[0]
  const plotno = warstwy.find(w => w.id === cel.layerId) ?? null

  return {
    plotno,
    role: {
      [pineski.indexOf(cel) + 1]: 'DESTINATION',
      [pineski.indexOf(obiekt) + 1]: 'SOURCE',
    },
  }
}
