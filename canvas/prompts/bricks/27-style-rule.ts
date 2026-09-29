import type { Brick } from '../types'

/** ㉗ Styl — zmienia się wygląd, nie treść. */
export const STYLE_RULE: Brick = {
  id: 'style-rule',
  numer: 27,
  nazwa: 'Styl',
  tekst: [
    `STYLE — change only the look (rendering, texture, palette, atmosphere) as the COMMAND says; geometry, objects, positions and perspective stay recognisable; apply it evenly.`,
  ].join('\n'),
}
