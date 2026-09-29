import type { Brick } from '../types'

/** ㉔ Zmiana tła — pierwszy plan zostaje, otoczenie się zmienia. */
export const BACKGROUND_RULE: Brick = {
  id: 'background-rule',
  numer: 24,
  nazwa: 'Tło',
  tekst: [
    `BACKGROUND — only the surroundings change: subjects keep position, scale, pose and camera angle; the horizon stays at its height; the ground continues under the subjects with contact shadows; relight them to the new environment and keep clean edges.`,
  ].join('\n'),
}
