/**
 * Loomic-Inspired Structured JSON Prompt Engine (v4.0)
 * Strictly enforces clean-plate background healing, single-instance object relocation,
 * independent real-world scaling, and photometric environmental integration.
 * Eliminates object duplication and unnatural force-fitting.
 */

export interface PinCoordinate {
  id: string;
  role: 'source' | 'target';
  normalizedX: number;
  normalizedY: number;
  description?: string;
}

export type CanvasEngineAction =
  | 'transfer'
  | 'addition'
  | 'removal'
  | 'swap'
  | 'character'
  | 'clothing'
  | 'texture'
  | 'season'
  | 'time_of_day'
  | 'effects'
  | 'background'
  | 'style'
  | 'general_edit';

export interface PromptEngineInput {
  action: CanvasEngineAction;
  userInstruction: string;
  sourcePin?: PinCoordinate;
  targetPin?: PinCoordinate;
  sourceObjectName?: string;
  targetObjectName?: string;
  extraDetails?: string;
}

export interface PromptEngineOutput {
  compiledPrompt: string;
  actionSummary: string;
  requiresDualMask: boolean;
  requiresCleanPlate: boolean;
  recommendedAspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '3:2';
}

export class JsonPromptEngine {
  /**
   * Compiles user intent and pins into a deterministic, surgical prompt.
   */
  static compile(input: PromptEngineInput): PromptEngineOutput {
    const {
      action,
      userInstruction,
      sourcePin,
      targetPin,
      sourceObjectName = 'wskazany obiekt',
      targetObjectName = 'obiekt docelowy',
      extraDetails
    } = input;

    // Helper coordinates
    const srcCoord = sourcePin ? `[X: ${Math.round(sourcePin.normalizedX * 100)}%, Y: ${Math.round(sourcePin.normalizedY * 100)}%]` : undefined;
    const tgtCoord = targetPin ? `[X: ${Math.round(targetPin.normalizedX * 100)}%, Y: ${Math.round(targetPin.normalizedY * 100)}%]` : undefined;

    // 1. OBJECT TRANSFER / RELOCATION (Solves the duplication bug!)
    if (action === 'transfer' && sourcePin && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - OBJECT RELOCATION]
{
  "operation": "OBJECT_RELOCATION",
  "target_element": "${sourcePin.description || sourceObjectName}",
  "source_coordinates": "${srcCoord}",
  "destination_coordinates": "${tgtCoord}",
  "execution_rules": {
    "1_SOURCE_CLEAN_PLATE": "TOTAL DESTRUCTION & INPAINTING. The original object at ${srcCoord} MUST BE COMPLETELY ERASED AND RECONSTRUCTED with matching natural terrain, foliage, trees, or stone. Under no circumstances should the original object remain at the source coordinates.",
    "2_DESTINATION_INJECTION": "Generate the relocated object specifically at ${tgtCoord}. The object must seamlessly align with the terrain slope, contact the ground naturally, and receive lighting consistent with the rest of the scene.",
    "3_SINGULARITY_ENFORCEMENT": "STRICT PROHIBITION OF DUPLICATION. The image must contain EXACTLY ONE instance of this object in total (at the destination coordinates). Any secondary or residual clone is a catastrophic failure.",
    "4_ENVIRONMENTAL_HARMONY": "Maintain 100% realistic lighting, cast shadows according to the existing sun position, and blend borders cleanly.",
    "5_ARCHITECTURAL_SCALE": "Strictly proportional to destination buildings, doors, and road lanes. In wide landscape or elevated hillside views, a vehicle must remain a small localized accent (~3-6% of image width), narrower than a driveway lane and lower than a garage door. NEVER blow up the object to dwarf the estate or courtyard.",
    "6_ROAD_HEADING_ALIGNMENT": "Vehicles on roads or driveways MUST be aligned along the road's longitudinal direction of travel (parallel to curb, heading towards camera or garage). Never rotate a car sideways or diagonally across the road lanes.",
    "7_ENVIRONMENT_REFLECTIONS": "Glossy paint and glass must reflect the canvas sky, clouds, and trees, with zero indoor showroom banners or donor reflections."
  },
  "user_modifier": "${userInstruction}"
}
Execute the above surgical relocation with photorealistic fidelity.
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Relokacja: ${sourcePin.description || 'obiektu'} z ${srcCoord} do ${tgtCoord} z wyczyszczeniem źródła`,
        requiresDualMask: true,
        requiresCleanPlate: true,
        recommendedAspectRatio: '3:2'
      };
    }

    // 2. ADDITION
    if (action === 'addition' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - SINGLE OBJECT ADDITION]
{
  "operation": "ADDITION",
  "subject_to_add": "${userInstruction}",
  "target_coordinates": "${tgtCoord}",
  "rules": {
    "scale": "Physically realistic and proportional to nearby buildings, doors, and road lanes. A vehicle must fit in one driveway lane and through a garage door; in distant or elevated shots it occupies only ~3-6% of the frame width, NEVER dwarfing the house.",
    "road_alignment": "A vehicle on a road/driveway MUST align naturally along the longitudinal axis of travel (parallel to curb/edges, heading forward or backward). NEVER place diagonally or sideways across driveway lanes.",
    "reflections": "Windshield and paint reflect the canvas outdoor sky and environment, completely eliminating any indoor showroom banners or studio lights from donor images.",
    "perspective": "Accurately match camera elevation, horizon, and 3D vanishing points.",
    "clearance": "Ensure safety buffer from adjacent objects; do not overlap or intersect neighboring geometry.",
    "lighting": "Match existing sun angle, shadow direction, and color temperature.",
    "isolation": "Generate ONLY this specific requested item. Do not alter any untouched areas of the scene."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Dodanie nowego elementu pod ${tgtCoord}`,
        requiresDualMask: false,
        requiresCleanPlate: false,
        recommendedAspectRatio: '3:2'
      };
    }

    // 3. REMOVAL (Clean Plate Infill)
    if (action === 'removal' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - OBJECT REMOVAL & INPAINTING]
{
  "operation": "REMOVE_AND_RECONSTRUCT",
  "target_coordinates": "${tgtCoord}",
  "object_to_remove": "${targetPin.description || targetObjectName}",
  "rules": {
    "destruction": "Completely remove 100% of the specified object and its cast shadows.",
    "reconstruction": "Rebuild the concealed background with seamless textures of matching ground, grass, trees, and landscape.",
    "integrity": "Zero digital artifacts, no smudges or visible seam lines."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Usunięcie obiektu pod ${tgtCoord} i rekonstrukcja tła`,
        requiresDualMask: false,
        requiresCleanPlate: true,
        recommendedAspectRatio: '3:2'
      };
    }

    // 4. SWAP / REPLACEMENT (Own Scale Enforcement)
    if (action === 'swap' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - OBJECT REPLACEMENT]
{
  "operation": "REPLACEMENT",
  "target_coordinates": "${tgtCoord}",
  "element_to_replace": "${targetPin.description || targetObjectName}",
  "replacement_element": "${userInstruction}",
  "rules": {
    "clean_plate": "Erase original element and its shadow completely before generating the replacement.",
    "own_scale_enforcement": "Give replacement element its OWN natural real-world dimensions. Do not distort or constrain it into the original element's outline.",
    "alignment": "Align ground contact point and 3D camera perspective with the master scene."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Podmiana obiektu pod ${tgtCoord} na ${userInstruction}`,
        requiresDualMask: false,
        requiresCleanPlate: true,
        recommendedAspectRatio: '3:2'
      };
    }

    // 5. CHARACTER IDENTITY TRANSFER
    if (action === 'character' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - CHARACTER IDENTITY]
{
  "operation": "CHARACTER_IDENTITY_TRANSFER",
  "target_person_coordinates": "${tgtCoord}",
  "directives": {
    "identity": "Extract and render facial structure, eye color, skin tone, and hair from reference.",
    "pose_preservation": "Keep 100% of body pose, posture, gestures, clothing, hands, and scene background.",
    "lighting": "Relight new face using scene key light and ambient color cast."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Przeniesienie tożsamości postaci pod ${tgtCoord}`,
        requiresDualMask: false,
        requiresCleanPlate: false,
        recommendedAspectRatio: '3:2'
      };
    }

    // 6. CLOTHING CHANGE
    if (action === 'clothing' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - CLOTHING REPLACEMENT]
{
  "operation": "CLOTHING_CHANGE",
  "target_person_coordinates": "${tgtCoord}",
  "new_outfit": "${userInstruction}",
  "rules": {
    "preservation": "Keep face, hair, body posture, hands, and background 100% intact.",
    "draping": "Natural fabric creases and folds conforming organically to limbs and body joints."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Zmiana stroju postaci pod ${tgtCoord}`,
        requiresDualMask: false,
        requiresCleanPlate: false,
        recommendedAspectRatio: '3:2'
      };
    }

    // 7. TEXTURE REPLACEMENT
    if (action === 'texture' && targetPin) {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - TEXTURE REPLACEMENT]
{
  "operation": "SURFACE_TEXTURE",
  "target_surface_coordinates": "${tgtCoord}",
  "new_texture": "${userInstruction}",
  "rules": {
    "geometry_lock": "Preserve 3D volume, contours, bevels, and perspective.",
    "material_response": "Physically accurate roughness, specularity, and reflections."
  }
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Zmiana faktury pod ${tgtCoord}`,
        requiresDualMask: false,
        requiresCleanPlate: false,
        recommendedAspectRatio: '3:2'
      };
    }

    // 8. SEASON / TIME OF DAY / GLOBAL MODIFICATION
    if (action === 'season' || action === 'time_of_day' || action === 'background' || action === 'style') {
      const prompt = `
[LOOMIC SURGICAL PROTOCOL - SCENE TRANSFORMATION]
{
  "operation": "${action.toUpperCase()}",
  "instruction": "${userInstruction}",
  "directives": [
    "Preserve architectural and geometric layout strictly.",
    "Apply global illumination, atmosphere, and material responses consistently across the frame."
  ]
}
      `.trim();

      return {
        compiledPrompt: prompt,
        actionSummary: `Globalna zmiana (${action}): ${userInstruction}`,
        requiresDualMask: false,
        requiresCleanPlate: false,
        recommendedAspectRatio: '3:2'
      };
    }

    // 9. GENERAL EDIT / MODIFICATION (Default)
    const prompt = `
[LOOMIC SURGICAL PROTOCOL - LOCAL EDIT]
{
  "operation": "LOCAL_MODIFICATION",
  "instruction": "${userInstruction}",
  "directives": [
    "Preserve overall scene composition, architecture, and lighting.",
    "Apply changes only where requested with realistic physics and seamless blending."
  ]
}
    `.trim();

    return {
      compiledPrompt: prompt,
      actionSummary: `Modyfikacja scenerii: ${userInstruction}`,
      requiresDualMask: false,
      requiresCleanPlate: false,
      recommendedAspectRatio: '3:2'
    };
  }
}
