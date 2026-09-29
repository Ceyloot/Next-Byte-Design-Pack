import type { Operation } from '../types'

/** Zmiana ubrania osoby; twarz, poza i tło zostają. */
export const CLOTHING_CHANGE: Operation = {
  id: 'clothing_change',
  nazwa: 'Zmień ubranie',
  kiedyUzyc:
    'The outfit of a person changes (from a second photo or described); face, body, pose and scene stay. Polish triggers: zmień ubranie / ubierz w / załóż mu / inny strój / przymierz.',
  bricks: [
    'studio-ubranie',
    'studio-tozsamosc-osoby',
    'studio-scena-zostaje',
    'studio-przeoswietlenie',
    'studio-film',
    'studio-anatomia',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Change the clothing of the person at {{PIN_TARGET}} to the outfit from {{IMAGE_DONOR}} or as described in the COMMAND.`,
  kroki: [
    `Replace the clothing while keeping the exact body pose, stance, limb positions and gestures.`,
    `Tailor the new garments to the body shape with organic draping and folds that respond to posture.`,
    `Keep face, expression, hairstyle, hands, footwear (unless part of the outfit) and background untouched.`,
  ],
}
