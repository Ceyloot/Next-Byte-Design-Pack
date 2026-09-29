/**
 * Tryb PSD — do porównań: do modelu idzie WYŁĄCZNIE prompt użytkownika i na końcu
 * blok RULES (światło, skala, perspektywa, zachowanie tożsamości). Bez reżysera,
 * bez klasyfikacji, bez opisów sceny i pinesek, bez kontroli po generacji.
 */
import { BRICKS } from './prompty/bricks'

const BRICKI_PSD = ['light-rule', 'scale-rule', 'perspective-rule', 'object-identity-rule'] as const

export function zasadyPsd(): string {
  const bricki = BRICKI_PSD.map(id =>
    BRICKS[id].tekst
      .replace(/\{\{\s*IMAGE_TARGET\s*\}\}/g, 'Image 1')
      .replace('Use the size given in SCALE; distance', 'Distance'),
  )
  return [
    '[RULES — always follow]',
    'Image 1 is the scene that stays; further images are references. The small magenta dots on the images only mark the places the user pinned; the result contains no dots.',
    ...bricki,
  ].join('\n')
}

export function zbudujPoleceniePsd(tekst: string): string {
  const zadanie = tekst.trim()
  return zadanie ? `${zadanie}\n\n${zasadyPsd()}` : ''
}
