import { etykietaPinezki } from './role'
import type { PinezkaZRola, RodzajZadania } from './typy'

/**
 * Składanie promptu — krótko, z danych:
 *   [ROLES]   który obraz jest bazą, które referencjami i co z nich wolno wziąć; gdzie leży każda pinezka i jaką pełni rolę
 *   [REQUEST] zdanie użytkownika BEZ ZMIAN (żadnego przepisywania ani wzbogacania)
 *   [KEEP]    co zostaje nietknięte
 *   [FORBID]  czego nie wolno (zakazy zamiast przymiotników: „bez rozmycia”, „bez dodatkowych rzeczy”)
 * Zasady: żadnych dopisków o jakości (8K, masterpiece), światle i kamerze, dopóki konkretny nieudany test tego nie wykaże.
 */

const wsp = (v: number) => v.toFixed(2)

function opisPinezki(p: PinezkaZRola): string {
  const nazwa = etykietaPinezki(p.pineska, p.numer)
  return `Pin ${p.numer} (Image ${p.obraz}, x=${wsp(p.pineska.normalizedX)} y=${wsp(p.pineska.normalizedY)}, "${nazwa}")`
}

function liniePinesek(rodzaj: RodzajZadania, pinezki: PinezkaZRola[]): string[] {
  const z = (r: PinezkaZRola['rola']) => pinezki.filter(p => p.rola === r)
  const cele = z('cel')
  const zrodla = z('zrodlo')
  const miejsca = z('miejsce')
  const obszary = z('obszar')
  const lista = (a: PinezkaZRola[]) => a.map(opisPinezki).join('; ')
  const linie: string[] = []
  if (rodzaj === 'zamien') {
    if (cele.length) linie.push(`${lista(cele)} is the subject to be REPLACED.`)
    if (zrodla.length) linie.push(`${lista(zrodla)} is the subject that takes its place.`)
  } else if (rodzaj === 'przenies') {
    if (zrodla.length) linie.push(`${lista(zrodla)} is the subject to MOVE — it exists exactly once afterwards.`)
    if (miejsca.length) linie.push(`${lista(miejsca)} is where it must end up: the middle of its footprint exactly on that x / y.`)
  } else if (rodzaj === 'wstaw') {
    if (zrodla.length) linie.push(`${lista(zrodla)} is the subject to bring in.`)
    if (miejsca.length) linie.push(`${lista(miejsca)} is where the subject is placed: the middle of its footprint exactly on that x / y. Nothing already in the photo is removed.`)
  } else if (rodzaj === 'usun') {
    if (cele.length) linie.push(`${lista(cele)} ${cele.length > 1 ? 'are' : 'is'} to be REMOVED completely, with shadow and reflection; rebuild what was behind.`)
  }
  if (obszary.length) linie.push(`${lista(obszary)} ${obszary.length > 1 ? 'mark' : 'marks'} the place${obszary.length > 1 ? 's' : ''} the request refers to.`)
  if (rodzaj === 'edycja' && zrodla.length) linie.push(`${lista(zrodla)} is the subject taken from the reference.`)
  return linie
}

export function zlozPrompt(opts: { rodzaj: RodzajZadania; tekst: string; pinezki: PinezkaZRola[]; liczbaReferencji: number }): string {
  const { rodzaj, tekst, pinezki, liczbaReferencji } = opts
  const role: string[] = ['Image 1 is the BASE photograph — the only image that is edited and returned.']
  for (let n = 2; n <= liczbaReferencji + 1; n++) {
    const pinyTu = pinezki.filter(p => p.obraz === n)
    role.push(
      pinyTu.length
        ? `Image ${n} is a REFERENCE: it supplies only the subject at ${pinyTu.map(p => `Pin ${p.numer}`).join(', ')} — never its background, framing or other people.`
        : `Image ${n} is a REFERENCE described in the request.`,
    )
  }

  const keep =
    rodzaj === 'usun'
      ? 'Everything else in Image 1 stays exactly as it is.'
      : rodzaj === 'zamien'
        ? "Keep from Image 1 everything the request does not change: the replaced subject's position, size and pose, the camera angle and framing, the lighting, the background, every other person and object, and all text and logos."
        : 'Keep from Image 1 everything the request does not change: camera angle and framing, lighting, background, every other person and object, and all text and logos.'
  const zakazy = 'No blur or softening, no extra objects or people, no pasted or cut-out look, no text artifacts, nothing carried over from a reference\'s background or framing. One realistic photograph.'

  return [
    `[ROLES]\n${[...role, ...liniePinesek(rodzaj, pinezki)].join('\n')}`,
    `[REQUEST]\n${tekst.trim()}`,
    `[KEEP]\n${keep}`,
    `[FORBID]\n${zakazy}`,
  ].join('\n\n')
}
