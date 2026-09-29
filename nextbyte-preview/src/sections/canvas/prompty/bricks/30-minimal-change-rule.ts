import type { Brick } from '../types'

/** ㉚ Minimalna ingerencja. */
export const MINIMAL_CHANGE_RULE: Brick = {
  id: 'minimal-change-rule',
  numer: 30,
  nazwa: 'Minimalna zmiana',
  tekst: [
    `MINIMAL CHANGE — make only the change from the COMMAND, only in the marked area; the rest stays untouched. When ambiguous, choose the reading closest to what is already in the frame.`,
  ].join('\n'),
}
