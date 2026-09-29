import type { Brick } from '../types'

/** ㉗ Styl — zmienia się wygląd, nie treść. */
export const STYLE_RULE: Brick = {
  id: 'style-rule',
  numer: 27,
  nazwa: 'Styl',
  tekst: [
    `STYLE RULE — change only the look:`,
    `- Keep the geometry completely: the same objects, shapes, proportions, positions, perspective and edges. The result is recognisable: the same places and objects are visible after the change.`,
    `- Change only rendering, texture, palette, lighting and atmosphere, as described in the COMMAND.`,
    `- Apply the style evenly across the whole frame with the same intensity from edge to edge.`,
    `- Keep the number and placement of all subjects, and the readability of what the picture shows.`,
  ].join('\n'),
}
