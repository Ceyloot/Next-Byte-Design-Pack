import type { Brick } from '../types'

/** ㉚ Minimalna ingerencja. */
export const MINIMAL_CHANGE_RULE: Brick = {
  id: 'minimal-change-rule',
  numer: 30,
  nazwa: 'Minimalna zmiana',
  tekst: [
    `MINIMAL CHANGE — only the change from the COMMAND, only in the marked area; the rest stays untouched; when ambiguous, the reading closest to the frame.`,
  ].join('\n'),
}
