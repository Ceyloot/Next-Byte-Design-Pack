import type { Brick } from '../types'

/** ㉗ Styl — zmienia się wygląd, nie treść. */
export const STYLE_RULE: Brick = {
  id: 'style-rule',
  numer: 27,
  nazwa: 'Styl',
  tekst: [
    `STYLE — change only the look (rendering, texture, palette, atmosphere) as the COMMAND says. Geometry, objects, positions, perspective and edges stay recognisable; apply the style evenly across the frame.`,
  ].join('\n'),
}
