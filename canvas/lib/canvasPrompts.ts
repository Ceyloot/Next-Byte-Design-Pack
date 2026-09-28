/**
 * NextByte Loomic Canvas Protocols (v4.5 - Multidimensional Fidelity Specification)
 * Strictly enforces:
 * - Physical human interaction & contact preservation (NEVER cut or erase interacting people)
 * - Surface patina & dirt fidelity (dirty objects stay dirty unless requested clean)
 * - Depth plane optical bokeh & lens blur matching
 * - Precise directional light vectors (sun angle, neon rim-lights, diffuse vs specular response)
 * - Clean-plate background healing, single-instance relocation, and own real-world scale
 */

export const MASTER_PROMPT_ENGINEER = `
[MASTER PHOTOREALISM & GEOMETRY SPEC]
- ARCHITECTURAL SCALE & WIDE-SHOT PROPORTIONS (ZERO GIANT ARTIFACTS): A vehicle on a residential driveway MUST fit through the garage door (~2.1 m high, ~2.4 m wide) and comfortably occupy only ONE driveway lane. An ultra-low sports car (like a Ford GT40, height 102 cm / 40 inches) has a roofline lower than an adult's waist and lower than the garage door handle. In distant or high-elevation landscape shots showing an entire estate, the vehicle is a SMALL LOCALIZED ACCENT (~3–6% of image width). NEVER magnify a vehicle to dwarf the house, driveway, or patio.
- VEHICLE ROAD ALIGNMENT & DRIVEWAY HEADING: A vehicle placed on a road, street, or driveway MUST align naturally along the road's longitudinal axis (following the direction of travel or parked parallel to the curb). It must face along the road — pointing forward towards the camera or towards the garage/house. NEVER position a vehicle rotated diagonally or sideways across the road lanes blocking the driveway like a barricade or car crash. If the pin is on the left/right side of the road, the vehicle must sit neatly on that side, leaving the other lane clear.
- REFLECTIONS & AMBIENT INTEGRATION: Glossy paint, windshield, chrome, and windows MUST reflect the canvas environment (sky, clouds, trees, stone paving, house facade). STRICTLY FORBID indoor showroom banners, dealership text logos, studio lightboxes, or indoor reflections from the donor photo.
- HUMAN INTERACTION PRESERVATION: If any person is leaning on, holding, touching, or interacting with an object, that person's entire body, limbs, clothing, and posture MUST be preserved 100%. Never cut, truncate, or erase interacting humans.
- SURFACE PATINA & DIRT FIDELITY: Preserve the exact physical surface condition from the reference (thick barn dust, dirt, cobwebs, grime, matte weathered finish). Do not artificially wash or clean the object unless explicitly requested.
- DEPTH PLANE & OPTICAL BOKEH: Respect optical depth slicing. Objects in the background must inherit the exact lens blur (bokeh) and softness of that plane; foreground subjects remain sharply focused and naturally occlude background elements.
- LIGHT VECTORS & SHADOW FALLOFF: Match the scene's exact light vectors (e.g. low warm sunset rays at 15°, vertical neon LED tube rim-lights). Dusty/matte surfaces receive soft diffuse highlights without artificial glossy sheen.
- Vertical pitch alignment: adjust object angle to the camera's elevation relative to the scene horizon.
- Clearance boundary: ensure a natural spatial buffer around adjacent objects with zero geometry clipping.
- Seamless lighting integration: match ambient color temperature, directional rim lights, shadow angle, and falloff.
- Zero edge seams: smooth feathering and matching grain across inpainting boundaries.
- Zero artifacting: strictly prohibit duplicated geometry, phantom limbs, or residual artifacts.
- Return pure output photograph matching professional cinematic capture.
`.trim();

export const CANVAS_TEMPLATES = {

  // 1. OBJECT TRANSFER (SURGICAL RELOCATION & CLEAN PLATE)
  OBJECT_TRANSFER: (sourceDesc: string, targetDesc: string) => `
[DIRECTOR'S PROTOCOL - OBJECT TRANSFER & RELOCATION]
1. SINGULARITY MANDATE: The object "${sourceDesc}" must appear EXACTLY ONCE in the final image at the destination area "${targetDesc}".
2. SOURCE CLEAN PLATE: Completely erase "${sourceDesc}" from its original source position. Reconstruct the revealed terrain, ground, foliage, or wall seamlessly using contextual inpainting.
3. DESTINATION INJECTION: Place "${sourceDesc}" naturally at the destination area "${targetDesc}", resting solidly on the ground surface.
4. HUMAN INTERACTION: If any person is in contact with "${sourceDesc}", adapt their contact naturally; never erase or cut the person.
5. PATINA & DIRT: Preserve exact surface state of "${sourceDesc}" (dust, grime, matte finish); do not clean it.
6. DEPTH & BOKEH: If placed into the background, apply optical lens blur (bokeh) matching the destination depth plane.
7. SPATIAL & PERSPECTIVE FIT: Adjust the 3D orientation, camera pitch, and horizon lines of "${sourceDesc}" to match the perspective of the destination scene.
8. SCALE: Real-world scale proportional to nearby environmental landmarks; maintain a 30–50% safety breathing margin from frame borders.
9. CONTACT & LIGHT: Generate accurate contact shadows (ambient occlusion) and directional shadows matching the destination scene.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 2. CHARACTER IDENTITY TRANSFER (FACE & HAIR)
  CHARACTER_TRANSFER: (features: string[], pose: string = "naturalna") => `
[DIRECTOR'S PROTOCOL - CHARACTER IDENTITY TRANSFER]
1. IDENTITY SOURCE (Photo 1): Extract facial structure, eye color, skin tone, hair color, texture, and style.
2. POSE & SCENERY BASE (Photo 2): Maintain 100% of the body pose, stance, gestures, clothing, hands, lighting, and environment.
3. TASK: Render the identity from Photo 1 onto the person in Photo 2, turned to the exact head angle and gaze direction of Photo 2.
4. SEAMLESS BLENDING: Blend neck, jawline, and hairline continuously with matching skin tone and grain.
5. INTEGRATION: Illuminate the face using the key light, shadows, and color cast of Photo 2.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 3. OBJECT ADDITION
  ADDITION: (object: string, locationDesc: string = "wyznaczonym miejscu") => `
[DIRECTOR'S PROTOCOL - OBJECT ADDITION]
1. TASK: Generate a physically plausible, photorealistic "${object}" at the location "${locationDesc}".
2. FOREGROUND PROTECTION: If placing in the background, all foreground subjects (people, laptops, desks) remain 100% untouched and sharp, occluding "${object}".
3. DEPTH OF FIELD & BOKEH: Inherit the focal sharpness or optical lens blur of the target depth plane (e.g. blurred background bokeh if behind subjects).
4. SCALE & PROPORTIONS: True-to-life physical scale relative to surrounding objects (a 15 cm figurine must remain 15 cm, not human-sized).
5. CLEARANCE: Maintain realistic breathing room between "${object}" and nearby elements; zero geometric clipping.
6. GROUND CONTACT: Firmly anchor the object with appropriate contact shadows and directional cast shadows.
7. PHOTOMETRIC HARMONY: Match existing color temperature, highlight intensity, and rim lights.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 4. OBJECT REPLACEMENT (OWN SCALE & INTERACTION PRESERVATION)
  REPLACE: (oldObject: string, newObject: string, features: string[] = []) => `
[DIRECTOR'S PROTOCOL - OBJECT REPLACEMENT]
1. REMOVAL: Completely erase "${oldObject}", including its cast shadows, contact marks, and reflections.
2. CLEAN PLATE INFILL: Reconstruct the concealed background behind "${oldObject}" prior to placing the replacement.
3. HUMAN INTERACTION (NEVER CUT OR ERASE HUMANS): If any person was touching, holding, or leaning against "${oldObject}" (e.g. leaning against a car door with leg on sill, hands resting on open door), that person MUST REMAIN 100% INTACT in their exact pose, limb positions, and clothing. "${newObject}" must adapt its geometry (e.g. open door) to naturally sustain that exact physical contact.
4. SURFACE DIRT & PATINA: Preserve the exact surface condition of "${newObject}"${features.length > 0 ? ` (${features.join(', ')})` : ''} (e.g. thick barn dust, dirt, cobwebs, grime, matte finish). Do not wash or clean it unless explicitly commanded.
5. DEPTH OF FIELD & BOKEH: If "${newObject}" sits in the background, it receives matching lens blur/bokeh. If in foreground, it is rendered with crisp focal plane sharpness.
6. INDEPENDENT SCALE: Give "${newObject}" its OWN intrinsic real-world dimensions. Do not distort or force-fit it into the outline of "${oldObject}". If taller or wider, let it naturally cover more background.
7. ORIENTATION & LIGHT: Align 3D perspective and directional light vectors (sunset rays, rim lights) with the master scene.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 5. REMOVE & RESTORE (SURGICAL ERASER)
  REMOVE: (object: string = "wskazany obiekt") => `
[DIRECTOR'S PROTOCOL - CLEAN PLATE REMOVAL]
1. TASK: Completely remove "${object}" and every trace of its existence (cast shadows, ground contact occlusions, reflections).
2. RECONSTRUCTION: Rebuild whatever logically lies behind and beneath the object (paving, flooring, grass, walls, horizon).
3. PATTERN CONTINUITY: Continue geometric patterns, floorboards, tile lines, and textures with unbroken rhythm and perspective.
4. ZERO ARTIFACTS: Seamless boundary blending with matching grain, exposure, and color temperature.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 6. CLOTHING CHANGE
  CLOTHING_CHANGE: (newOutfitDesc: string) => `
[DIRECTOR'S PROTOCOL - CLOTHING & OUTFIT CHANGE]
1. TASK: Replace the clothing of the specified person with "${newOutfitDesc}".
2. ANATOMY PRESERVATION: Strictly preserve the person's face, identity, hair, body proportions, posture, hands, and stance.
3. ORGANIC DRAPING: Tailor the new fabric naturally over the body, forming realistic folds and creases at elbows, waist, and knees.
4. BOUNDARY TRANSITIONS: Seamless transitions at neck, wrists, ankles, and waistline; skin tone and details stay intact.
5. LIGHTING: Illuminate the new fabric with the scene's existing key and ambient light, matching sheen or matte properties.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 7. TEXTURE & MATERIAL REPLACEMENT
  TEXTURE_REPLACE: (targetSurface: string, newMaterialDesc: string) => `
[DIRECTOR'S PROTOCOL - SURFACE TEXTURE REPLACEMENT]
1. TASK: Replace the material of "${targetSurface}" with "${newMaterialDesc}".
2. GEOMETRY RETENTION: Strictly preserve 3D contours, surface curvature, edges, bevels, and perspective vanishing lines.
3. SCALE: Scale the texture pattern realistically relative to camera distance without stretching or tiling artifacts.
4. MATERIAL RESPONSE: Apply physically accurate specularity, roughness, reflectivity, and ambient occlusion for "${newMaterialDesc}" under scene lighting.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 8. SEASON TRANSFORMATION
  SEASON_CHANGE: (targetSeason: 'wiosna' | 'lato' | 'jesień' | 'zima' | string) => `
[DIRECTOR'S PROTOCOL - SEASONAL TRANSFORMATION]
1. TASK: Transform the environment and atmosphere to: "${targetSeason}".
2. ARCHITECTURE PRESERVATION: Preserve 100% of buildings, roads, objects, vehicles, and spatial composition.
3. VEGETATION & GROUND: Adapt foliage (spring blossoms, summer lush greens, autumn amber/reds, winter bare branches with frost/snow accumulation).
4. ATMOSPHERE & SKY: Adjust color palette, atmospheric haze, moisture, and sun elevation appropriate for "${targetSeason}".

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 9. TIME OF DAY TRANSFORMATION
  TIME_OF_DAY: (targetTime: 'świt' | 'dzień' | 'zachód' | 'noc' | string) => `
[DIRECTOR'S PROTOCOL - TIME OF DAY ILLUMINATION]
1. TASK: Transform the scene illumination and sky to: "${targetTime}".
2. GEOMETRY PRESERVATION: Keep all buildings, terrain, roads, and camera perspective strictly identical.
3. SUN & SHADOWS: Recalculate sun position and shadow vectors (long low shadows for dawn/dusk, sharp short shadows for midday).
4. ARTIFICIAL LIGHT SOURCES: For dusk or night, activate streetlights, illuminated window panes, and vehicle headlights with realistic light spill and bloom.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 10. ATMOSPHERIC & VISUAL EFFECTS
  ATMOSPHERIC_EFFECTS: (effectDesc: string) => `
[DIRECTOR'S PROTOCOL - VISUAL EFFECTS INTEGRATION]
1. TASK: Integrate "${effectDesc}" into the scene.
2. PHYSICAL ACCURACY: Ensure reflections match wet/glossy surfaces, shadows match primary light vectors, and luminous elements emit soft volumetric glow.
3. PARTICLE DEPTH: If particles (rain, snow, sparks, dust motes) are requested, distribute with foreground blur, midground crispness, and background falloff.
4. SCENE RETENTION: Keep all underlying geometry, structures, and subjects completely intact.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 11. BACKGROUND REPLACEMENT
  BACKGROUND_REPLACE: (newEnvironmentDesc: string) => `
[DIRECTOR'S PROTOCOL - BACKGROUND ENVIRONMENT REPLACEMENT]
1. FOREGROUND FREEZE: Keep all primary foreground subjects in identical position, scale, pose, crop, and camera angle.
2. NEW ENVIRONMENT: Replace surrounding background and horizon with "${newEnvironmentDesc}".
3. GROUND CONTINUITY: Extend the new ground plane seamlessly beneath the subjects' feet.
4. RELIGHTING: Apply subtle rim lighting and ambient color bounce from the new background onto the subjects' edges.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 12. STYLE TRANSFER
  STYLE_TRANSFER: (styleName: string, styleDirectives: string[] = []) => `
[DIRECTOR'S PROTOCOL - ARTISTIC STYLE TRANSFER]
1. COMPOSITION LOCK: Maintain 100% of the composition, subject silhouettes, and perspective.
2. RENDERING: Render the entire scene in the artistic style of "${styleName}".
${styleDirectives.length > 0 ? styleDirectives.map((d, i) => `   ${i + 1}. ${d}`).join('\n') : ''}
3. CONSISTENCY: Apply uniform stylistic technique, brushwork, and palette from edge to edge.

${MASTER_PROMPT_ENGINEER}
  `.trim(),

  // 13. POINT EDIT (SURGICAL LOCAL FIX)
  POINT_EDIT: (objectName: string, modification: string) => `
[DIRECTOR'S PROTOCOL - POINT SURGICAL EDIT]
1. TARGET: Identify "${objectName}" at the specified location.
2. OPERATION: Apply modification: "${modification}".
3. MINIMAL INTERVENTION: Modify only this specific element; treat the rest of the image as an immutable reference.
4. BLENDING: Match local lighting, texture, noise grain, and sharpness seamlessly with adjoining areas.

${MASTER_PROMPT_ENGINEER}
  `.trim(),
};
