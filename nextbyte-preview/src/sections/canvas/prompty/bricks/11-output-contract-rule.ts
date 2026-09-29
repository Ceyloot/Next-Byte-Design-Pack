import type { Brick } from '../types'

/** ⑪ Kontrakt wyniku — który obraz jest czym, format, markery. */
export const OUTPUT_CONTRACT_RULE: Brick = {
  id: 'output-contract-rule',
  numer: 11,
  nazwa: 'Kontrakt wyniku',
  tekst: [
    `OUTPUT CONTRACT (fixed, non-negotiable):`,
    `- {{IMAGE_TARGET}} is the TARGET photo (the destination). The result IS {{IMAGE_TARGET}} with only the change the task asks for.`,
    `- The result keeps the exact aspect ratio, resolution, framing, camera position and grain level of {{IMAGE_TARGET}}. Aspect ratio, resolution, quality, framing and crop are never taken from any other image.`,
    `- Further images are REFERENCES. They contribute only the identity or appearance of their pinned object — nothing about frame, format, resolution, quality, background or lighting.`,
    `- Add nothing the task did not ask for and remove nothing it did not ask for: every existing subject that the task does not change stays, with the same count and positions.`,
    `- Pins, numbered dots, crosshairs, masks and boxes are guides for you only. The result is one clean photograph in which none of these markers, labels or outlines are visible. Every pixel around the changed area shows only the photographed scene itself, with no typography of any kind beside or on the element.`,
  ].join('\n'),
}
