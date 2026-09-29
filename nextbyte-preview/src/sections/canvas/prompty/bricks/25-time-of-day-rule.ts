import type { Brick } from '../types'

/** ㉕ Pora dnia. */
export const TIME_OF_DAY_RULE: Brick = {
  id: 'time-of-day-rule',
  numer: 25,
  nazwa: 'Pora dnia',
  tekst: [
    `TIME OF DAY RULE — rebuild the light physically, keep the geometry:`,
    `- Sun angle and elevation: long low shadows for dawn and sunset, short high shadows for midday, soft moonlight and starlight for night.`,
    `- Sky: warm pink and gold for dawn, clear azure for day, amber and purple for sunset, deep indigo for night.`,
    `- Colour temperature is consistent across the whole frame; every cast shadow and highlight follows the one new light direction.`,
    `- For dusk and night, artificial light sources (street lamps, lit windows, neon signs, headlights) switch on with a realistic glow and atmospheric spill, and wet surfaces reflect them.`,
    `- Buildings, objects, terrain and camera perspective stay 100% as they were.`,
  ].join('\n'),
}
