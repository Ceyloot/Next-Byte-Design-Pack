import type { Brick } from '../types'

/** ⑪ Kontrakt wyniku — który obraz jest czym, format, markery. */
export const OUTPUT_CONTRACT_RULE: Brick = {
  id: 'output-contract-rule',
  numer: 11,
  nazwa: 'Kontrakt wyniku',
  tekst: [
    `OUTPUT — the result IS {{IMAGE_TARGET}} with only the requested change; other images give identity only. Add and remove nothing else. Magenta dots, masks and boxes are guides: none appears in the result, and the pixels under a dot are natural surface.`,
  ].join('\n'),
}
