import type { Brick } from '../types'

/** ㉚ Minimalna ingerencja. */
export const MINIMAL_CHANGE_RULE: Brick = {
  id: 'minimal-change-rule',
  numer: 30,
  nazwa: 'Minimalna zmiana',
  tekst: [
    `MINIMAL CHANGE RULE — the smallest possible intervention:`,
    `- Make only the change from the COMMAND.`,
    `- The marked area is the only place of work; the rest of the frame is reference material that stays untouched.`,
    `- When the task is ambiguous, choose the reading closest to what is already in the frame.`,
    `- Colour grading, weather, time of day and every object the task does not mention stay as they are.`,
  ].join('\n'),
}
