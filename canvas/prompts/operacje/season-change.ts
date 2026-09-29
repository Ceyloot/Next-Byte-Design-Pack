import type { Operation } from '../types'

/** Zmiana pory roku. */
export const SEASON_CHANGE: Operation = {
  id: 'season_change',
  nazwa: 'Zmień porę roku',
  kiedyUzyc:
    'The whole scene changes season (spring, summer, autumn, winter). Polish triggers: zrób zimę / jesień / wiosnę / lato / pokryj śniegiem / niech liście będą żółte.',
  bricks: [],
  dawca: 'brak',
  czystaPlyta: false,
  misja: `Transform the scene to the season requested in the COMMAND.`,
  kroki: [
    `Change vegetation, ground cover, water state, sky and atmosphere for the target season.`,
    `Keep buildings, roads, vehicles, people, layout and viewpoint of {{IMAGE_TARGET}} exactly as they are.`,
  ],
}
