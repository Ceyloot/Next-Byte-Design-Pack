import type { Operation } from '../types'

/** Zmiana pory dnia. */
export const TIME_OF_DAY_CHANGE: Operation = {
  id: 'time_of_day_change',
  nazwa: 'Zmień porę dnia',
  kiedyUzyc:
    'The whole scene changes time of day (dawn, day, sunset, dusk, night). Polish triggers: zrób noc / zachód słońca / świt / dzień / niech będzie wieczór.',
  bricks: [],
  dawca: 'brak',
  czystaPlyta: false,
  misja: `Transform the time of day of the scene as the COMMAND requests.`,
  kroki: [
    `Rebuild the sky, sun or moon position, shadows and colour temperature for the target time.`,
    `Switch on artificial light sources where the time of day calls for it.`,
    `Geometry, objects and viewpoint of {{IMAGE_TARGET}} stay 100% the same.`,
  ],
}
