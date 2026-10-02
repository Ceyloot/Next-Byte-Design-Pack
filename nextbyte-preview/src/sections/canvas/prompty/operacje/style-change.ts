import type { Operation } from '../types'

/** Zmiana stylu artystycznego całego kadru. */
export const STYLE_CHANGE: Operation = {
  id: 'style_change',
  nazwa: 'Zmień styl',
  kiedyUzyc:
    'The look of the whole image changes to an artistic style (cartoon, oil painting, watercolour, sketch, anime, noir, vintage, cyberpunk); composition and content stay. Polish triggers: zrób w stylu / kreskówka / obraz olejny / akwarela / szkic / anime / vintage.',
  bricks: [
    'studio-referencja',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Repaint {{IMAGE_TARGET}} as a real hand-made work in the style requested in the USER request (style reference: {{IMAGE_DONOR}} if present): the authentic marks of that medium — brush strokes, pigment, paper or canvas grain, line work — with simplified detail, clearly NOT a photograph with a filter. Keep the same subject, composition and the mood of the colours.`,
  kroki: [
    `Apply the style evenly across the whole frame.`,
  ],

}
