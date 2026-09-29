import type { Brick } from '../types'

/** ㉑ Ubranie. */
export const CLOTHING_RULE: Brick = {
  id: 'clothing-rule',
  numer: 21,
  nazwa: 'Ubranie',
  tekst: [
    `CLOTHING RULE — the exact outfit, worn naturally:`,
    `- Every garment keeps its type, cut, colour, fabric, pattern, print, logo, buttons, zips, seams and trims. Accessories (glasses, jewellery, hat, watch, bag, scarf, belt) and footwear stay exactly as they are.`,
    `- When the outfit changes, the old clothing disappears completely — no sleeve, collar or print of it remains.`,
    `- The garments drape on the body and the pose of the scene: natural folds and creases at elbows, waist and knees, fabric tension where the body pushes against it, correct layering.`,
    `- Seamless transitions at the neck, wrists, ankles and waistline; skin tone and skin details stay intact.`,
    `- Fabric responds to the scene light: matte cotton stays diffuse, satin and leather keep their sheen.`,
  ].join('\n'),
}
