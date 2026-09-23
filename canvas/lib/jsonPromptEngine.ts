/**
 * Loomic-Inspired Structured JSON Prompt Engine
 * Strictly enforces clean-plate background healing and single-instance object relocation.
 * Eliminates object duplication (e.g. double houses, double hobbit holes).
 */

export interface PinCoordinate {
  id: string;
  role: 'source' | 'target';
  normalizedX: number;
  normalizedY: number;
  description?: string;
}

export interface PromptEngineInput {
  action: 'transfer' | 'addition' | 'removal' | 'swap' | 'general_edit';
  userInstruction: string;
  sourcePin?: PinCoordinate;
  targetPin?: PinCoordinate;
  sourceObjectName?: string;
  targetObjectName?: string;
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
      targetObjectName = 'obiekt docelowy'
    } = input;

    // A. OBJECT TRANSFER / RELOCATION (Solves the duplication bug!)
    if (action === 'transfer' && sourcePin && targetPin) {
      const srcCoord = `[X: ${Math.round(sourcePin.normalizedX * 100)}%, Y: ${Math.round(sourcePin.normalizedY * 100)}%]`;
      const tgtCoord = `[X: ${Math.round(targetPin.normalizedX * 100)}%, Y: ${Math.round(targetPin.normalizedY * 100)}%]`;

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
    "4_ENVIRONMENTAL_HARMONY": "Maintain 100% realistic lighting, cast shadows according to the existing sun position, and blend borders cleanly."
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

    // B. ADDITION
    if (action === 'addition' && targetPin) {
      const tgtCoord = `[X: ${Math.round(targetPin.normalizedX * 100)}%, Y: ${Math.round(targetPin.normalizedY * 100)}%]`;

      const prompt = `
[LOOMIC SURGICAL PROTOCOL - SINGLE OBJECT ADDITION]
{
  "operation": "ADDITION",
  "subject_to_add": "${userInstruction}",
  "target_coordinates": "${tgtCoord}",
  "rules": {
    "scale": "Physically realistic and proportional to nearby buildings and landscape features.",
    "perspective": "Accurately match camera elevation, horizon, and 3D vanishing points.",
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

    // C. REMOVAL (Clean Plate Infill)
    if (action === 'removal' && targetPin) {
      const tgtCoord = `[X: ${Math.round(targetPin.normalizedX * 100)}%, Y: ${Math.round(targetPin.normalizedY * 100)}%]`;

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

    // D. GENERAL EDIT / MODIFICATION
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
