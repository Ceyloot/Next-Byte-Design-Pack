import type { Brick } from '../types'

/** ㉔ Zmiana tła — pierwszy plan zostaje, otoczenie się zmienia. */
export const BACKGROUND_RULE: Brick = {
  id: 'background-rule',
  numer: 24,
  nazwa: 'Tło',
  tekst: [
    `BACKGROUND — only the surroundings change: foreground subjects keep position, scale, pose, crop, camera angle and perspective. The new horizon sits at the old height; the ground continues under the subjects with contact shadows. Relight the subjects to the new environment, keep the lens's depth of field, and keep edges clean.`,
  ].join('\n'),
}
