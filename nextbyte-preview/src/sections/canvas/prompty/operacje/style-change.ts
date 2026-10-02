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
  misja: `Recreate the exact content and composition of {{IMAGE_TARGET}} in the style requested in the USER request (style reference: {{IMAGE_DONOR}} if present).`,
  kroki: [
    `Keep the content, composition and proportions, but replace the photographic rendering with the real look of the requested medium: its characteristic marks, edges, colour handling and surface texture, clearly visible — not a light filter over a photograph.`,
    `Apply the style evenly across the whole frame.`,
  ],
}
