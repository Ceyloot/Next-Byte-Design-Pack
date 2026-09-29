import type { Brick } from '../types'

/** ⑪ Kontrakt wyniku — który obraz jest czym, format, markery. */
export const OUTPUT_CONTRACT_RULE: Brick = {
  id: 'output-contract-rule',
  numer: 11,
  nazwa: 'Kontrakt wyniku',
  tekst: [
    `OUTPUT — the result IS {{IMAGE_TARGET}} with only the requested change, keeping its aspect ratio, resolution, framing and grain. Other images are references for identity or appearance only — never for frame, format, background or light.`,
    `- Add nothing and remove nothing the task did not ask for; every other subject keeps its count and position.`,
    `- The small magenta pin dots, masks and boxes are guides only: the result shows NO magenta dot, marker, numeral, letter or outline anywhere — the pixels under each dot are rebuilt as the natural surface.`,
  ].join('\n'),
}
