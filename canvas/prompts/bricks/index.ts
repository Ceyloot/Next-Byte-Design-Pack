/**
 * SEKCJA 3 — BRICKS (cegiełki-zasady)
 * ====================================
 * Każdy brick to osobny plik z jedną nienegocjowalną zasadą. Numer bricka
 * wyznacza jego miejsce w złożonym prompcie (rosnąco). Operacje (`../operacje`)
 * wskazują tylko, które bricki włączyć.
 */
import type { Brick, BrickId } from '../types'
import { LIGHT_RULE } from './01-light-rule'
import { POSITION_RULE } from './02-position-rule'
import { SCALE_RULE } from './03-scale-rule'
import { PERSPECTIVE_RULE } from './04-perspective-rule'
import { DEPTH_OCCLUSION_RULE } from './05-depth-occlusion-rule'
import { CONTACT_RULE } from './06-contact-rule'
import { REFLECTION_RULE } from './07-reflection-rule'
import { GRAIN_MEDIUM_RULE } from './08-grain-medium-rule'
import { FIDELITY_RULE } from './09-fidelity-rule'
import { FRAMING_RULE } from './10-framing-rule'
import { OUTPUT_CONTRACT_RULE } from './11-output-contract-rule'
import { CLEAN_PLATE_RULE } from './12-clean-plate-rule'
import { SINGULARITY_RULE } from './13-singularity-rule'
import { OBJECT_IDENTITY_RULE } from './14-object-identity-rule'
import { DONOR_ISOLATION_RULE } from './15-donor-isolation-rule'
import { NO_COPY_PASTE_RULE } from './16-no-copy-paste-rule'
import { EDGE_BLEND_RULE } from './17-edge-blend-rule'
import { CHARACTER_IDENTITY_RULE } from './18-character-identity-rule'
import { HAIR_RULE } from './19-hair-rule'
import { SKIN_BODY_RULE } from './20-skin-body-rule'
import { CLOTHING_RULE } from './21-clothing-rule'
import { POSE_EXPRESSION_RULE } from './22-pose-expression-rule'
import { HANDS_LIMBS_RULE } from './23-hands-limbs-rule'
import { BACKGROUND_RULE } from './24-background-rule'
import { TIME_OF_DAY_RULE } from './25-time-of-day-rule'
import { SEASON_RULE } from './26-season-rule'
import { STYLE_RULE } from './27-style-rule'
import { TEXTURE_RULE } from './28-texture-rule'
import { EFFECT_RULE } from './29-effect-rule'
import { MINIMAL_CHANGE_RULE } from './30-minimal-change-rule'

export const BRICKS: Record<BrickId, Brick> = {
  'light-rule': LIGHT_RULE,
  'position-rule': POSITION_RULE,
  'scale-rule': SCALE_RULE,
  'perspective-rule': PERSPECTIVE_RULE,
  'depth-occlusion-rule': DEPTH_OCCLUSION_RULE,
  'contact-rule': CONTACT_RULE,
  'reflection-rule': REFLECTION_RULE,
  'grain-medium-rule': GRAIN_MEDIUM_RULE,
  'fidelity-rule': FIDELITY_RULE,
  'framing-rule': FRAMING_RULE,
  'output-contract-rule': OUTPUT_CONTRACT_RULE,
  'clean-plate-rule': CLEAN_PLATE_RULE,
  'singularity-rule': SINGULARITY_RULE,
  'object-identity-rule': OBJECT_IDENTITY_RULE,
  'donor-isolation-rule': DONOR_ISOLATION_RULE,
  'no-copy-paste-rule': NO_COPY_PASTE_RULE,
  'edge-blend-rule': EDGE_BLEND_RULE,
  'character-identity-rule': CHARACTER_IDENTITY_RULE,
  'hair-rule': HAIR_RULE,
  'skin-body-rule': SKIN_BODY_RULE,
  'clothing-rule': CLOTHING_RULE,
  'pose-expression-rule': POSE_EXPRESSION_RULE,
  'hands-limbs-rule': HANDS_LIMBS_RULE,
  'background-rule': BACKGROUND_RULE,
  'time-of-day-rule': TIME_OF_DAY_RULE,
  'season-rule': SEASON_RULE,
  'style-rule': STYLE_RULE,
  'texture-rule': TEXTURE_RULE,
  'effect-rule': EFFECT_RULE,
  'minimal-change-rule': MINIMAL_CHANGE_RULE,
}

/** Wszystkie bricki w kolejności numerów. */
export const BRICK_LIST: Brick[] = Object.values(BRICKS).sort((a, b) => a.numer - b.numer)

export function getBrick(id: BrickId): Brick {
  return BRICKS[id]
}

export { LIGHT_RULE, POSITION_RULE, SCALE_RULE, PERSPECTIVE_RULE, DEPTH_OCCLUSION_RULE, CONTACT_RULE, REFLECTION_RULE, GRAIN_MEDIUM_RULE, FIDELITY_RULE, FRAMING_RULE, OUTPUT_CONTRACT_RULE, CLEAN_PLATE_RULE, SINGULARITY_RULE, OBJECT_IDENTITY_RULE, DONOR_ISOLATION_RULE, NO_COPY_PASTE_RULE, EDGE_BLEND_RULE, CHARACTER_IDENTITY_RULE, HAIR_RULE, SKIN_BODY_RULE, CLOTHING_RULE, POSE_EXPRESSION_RULE, HANDS_LIMBS_RULE, BACKGROUND_RULE, TIME_OF_DAY_RULE, SEASON_RULE, STYLE_RULE, TEXTURE_RULE, EFFECT_RULE, MINIMAL_CHANGE_RULE }
