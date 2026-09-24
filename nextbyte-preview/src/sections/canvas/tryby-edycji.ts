/**
 * Reguły dla poszczególnych trybów edycji.
 *
 * Treść dla modelu jest PO ANGIELSKU — to język, na którym trenowano
 * enkodery tekstu modeli edycyjnych (Nano Banana, Flux Kontext, Qwen-Image-Edit).
 * Nazwy i opisy w UI zostają po polsku.
 *
 * Wszystko jest sformułowane TWIERDZĄCO, także tam, gdzie chodzi o brak
 * czegoś. Google w wytycznych do Nano Banana pisze wprost, żeby opisywać
 * stan docelowy zamiast zakazów („empty street” zamiast „no cars”), bo
 * wymienienie rzeczy w prompcie kieruje na nią uwagę modelu — również
 * wtedy, gdy stoi przy niej „nie”. Nano Banana nie ma też osobnego pola
 * na negative prompt, więc lista zakazów trafiłaby do tego samego tekstu.
 *
 * Każdy tryb niesie cztery filary (wzorzec z higgsfield-prompt-template
 * i wytycznych BFL/Qwen do edycji instrukcyjnej):
 * - `material`  — o czym decyduje zdjęcie-dawca (REFERENCE AUTHORITY),
 * - `reguly`    — operacja i kotwice przestrzenne,
 * - `swiatlo`   — integracja fotometryczna,
 * - `zostaje`   — stan docelowy tego, czego zadanie nie dotyczy.
 */

export interface Tryb {
  misja: (tekst: string) => string
  /**
   * O czym decyduje zdjęcie-dawca w tym trybie. Zamiana auta i zamiana
   * twarzy biorą z dawcy zupełnie co innego — jedno wspólne zdanie
   * „materiał decyduje o obiekcie” psuło zamianę postaci.
   */
  material: { decyduje: string; nieDecyduje: string }
  /** kroki do wykonania — tryb rozkazujący, konkret zamiast ogólników */
  reguly: string[]
  /** światło, cienie, odbicia — osobno, bo to one zdradzają fotomontaż */
  swiatlo: string[]
  /** stan docelowy tego, czego zadanie nie dotyczy */
  zostaje: string[]
  /**
   * Czy światło sceny pochodzi ze Zdjęcia 1. Fałsz dla zmiany tła i stylu:
   * tam nowe otoczenie albo nowa pora dnia narzuca oświetlenie.
   */
  swiatloZPlotna: boolean
  /** czy wstawiamy/przesuwamy bryłę — wtedy potrzebna jest sekcja skali */
  zeSkala: boolean
}

export type Intencja =
  | 'wstaw'
  | 'przenies'
  | 'zamien'
  | 'postac'
  | 'ubranie'
  | 'usun'
  | 'tekstura'
  | 'pora_roku'
  | 'pora_dnia'
  | 'efekt'
  | 'tlo'
  | 'styl'
  | 'popraw'

export const INTENCJE: { id: Intencja; nazwa: string; opis: string }[] = [
  { id: 'wstaw', nazwa: 'Dodaj', opis: 'Wstaw nowy obiekt w scenę' },
  { id: 'przenies', nazwa: 'Przenieś', opis: 'Ten sam obiekt w innym miejscu' },
  { id: 'zamien', nazwa: 'Zamień', opis: 'Podmień jedną rzecz na drugą' },
  { id: 'postac', nazwa: 'Postać', opis: 'Twarz i tożsamość z drugiego zdjęcia' },
  { id: 'ubranie', nazwa: 'Ubranie', opis: 'Zmień strój lub kreację postaci' },
  { id: 'usun', nazwa: 'Usuń', opis: 'Skasuj obiekt i odtwórz tło' },
  { id: 'tekstura', nazwa: 'Tekstura', opis: 'Zmień materiał lub fakturę powierzchni' },
  { id: 'pora_roku', nazwa: 'Pora roku', opis: 'Zmień porę roku (wiosna, lato, jesień, zima)' },
  { id: 'pora_dnia', nazwa: 'Pora dnia', opis: 'Zmień porę dnia (świt, dzień, zachód, noc)' },
  { id: 'efekt', nazwa: 'Efekt', opis: 'Dodaj cień, odbicie, poświatę lub cząsteczki' },
  { id: 'tlo', nazwa: 'Tło', opis: 'Nowe otoczenie, te same postacie' },
  { id: 'styl', nazwa: 'Styl', opis: 'Styl artystyczny — kompozycja zostaje' },
  { id: 'popraw', nazwa: 'Popraw', opis: 'Inna zmiana w kadrze' },
]

const MATERIAL_OBIEKTU = {
  decyduje:
    'the identity of the object being brought in: its type, model, shape, proportions, material, colour, markings and fine details',
  nieDecyduje:
    'framing, camera angle, background, surroundings, lighting, time of day and colour grading of the result — the object is redrawn from the camera angle and in the light of Image 1',
}

export const TRYBY: Record<Intencja, Tryb> = {
  wstaw: {
    misja: t => `Add to the scene exactly what the task asks for: ${t}`,
    material: MATERIAL_OBIEKTU,
    reguly: [
      'Place the new object at the marked point or rectangle — that point is where it touches the ground or the surface it rests on.',
      'MANDATORY MARGIN: The object should occupy 50–70% of the available workspace or target area, leaving 30–50% safety breathing room from boundaries. Never clip against edges.',
      'COMPLETENESS MANDATE: The object must be 100% complete with all parts visible (wheels, limbs, wings, roof). If space is tight, scale down and position deeper in perspective rather than truncating any part.',
      'Respect depth order: whatever is closer to the camera overlaps the object; the object overlaps whatever is behind it.',
      'Give it the same breathing room from its neighbours as the other objects have — it stands beside things, resting on its own footprint.',
      'Align it with the scene perspective: its horizontal edges converge towards the same vanishing points as nearby walls, paving and furniture.',
    ],
    swiatlo: [
      'A soft contact shadow and ambient occlusion where the object meets the ground.',
      'A cast shadow with the same direction, length and softness as the existing shadows in the scene.',
      'Reflections on nearby glossy, wet or glass surfaces, consistent with the rest of the scene.',
    ],
    zostaje: [
      'every other object in exactly the same place and at the same size',
      'background, sky, vegetation, ground surfaces and colour palette',
      'the framing and composition of the original shot',
    ],
    swiatloZPlotna: true,
    zeSkala: true,
  },

  przenies: {
    misja: t => `Move the marked object to a new position in the same scene: ${t}`,
    material: MATERIAL_OBIEKTU,
    reguly: [
      'This is a relocation, not a copy: the same object changes position.',
      'In the result the object appears EXACTLY ONCE — at the destination point.',
      'When the source point lies in Image 1, restore a clean plate there: rebuild the ground, vegetation and patterns as if the object had never stood there. When it lies in another image, only the object comes across from it.',
      'Keep its identity: the same form, material, colour and details.',
      'Adapt it to the new position: perspective and scale follow the destination — further from the camera means smaller, along the same vanishing lines.',
      'Set it on the ground at the destination point with a stable, natural footprint.',
      'MANDATORY MARGIN: Keep 30–50% safety breathing room from frame and workspace boundaries. The relocated object must be 100% complete without clipped edges. If tight, scale down and set deeper into the scene.',
    ],
    swiatlo: [
      'Its old cast shadow and reflection leave together with it; the ground there receives the same light as its surroundings.',
      'A new contact shadow and cast shadow at the destination, pointing the same way as the other shadows in the scene.',
      'If the destination lies in shade, the object is lit as shaded; in sunlight, as sunlit.',
    ],
    zostaje: [
      'the object itself — the same thing, only in a different place',
      'the rest of the scene: other buildings, vegetation, ground surfaces and sky',
      'light, time of day and colour grading',
    ],
    swiatloZPlotna: true,
    zeSkala: true,
  },

  zamien: {
    misja: t => `Replace the marked element with the new one, as the task says: ${t}`,
    material: MATERIAL_OBIEKTU,
    reguly: [
      'Measure the old element first: its width, height and footprint on the ground. That is the size budget for the new one.',
      'Clear the old element completely together with its shadow and reflection, and rebuild the ground beneath it.',
      'Stand the new element exactly where the old one stood, on the same ground plane, at the same scale relative to the surroundings.',
      'Turn the new element to match the camera angle of Image 1 — it is seen from the same viewpoint as the rest of the scene.',
      'MANDATORY MARGIN & COMPLETENESS: The new element must be 100% complete and fit with 30–50% safety breathing margin in the space. If the new object is naturally larger, scale it down proportionally to fit rather than cutting off any part.',
      'Keep the spacing to neighbours — the new element stands beside what surrounded the old one, each object on its own footprint.',
    ],
    swiatlo: [
      'The new element takes over the lighting of the old one: the same light sources, the same shadow side, the same colour temperature.',
      'New contact shadows, cast shadows and reflections that follow from the new shape.',
      'The lighting and background of the reference photo stay in the reference photo; only the object comes across.',
    ],
    zostaje: [
      'the rest of the frame looks the same as before: the same objects in the same places and sizes',
      'background, sky, ground surfaces, vegetation and other buildings',
      'shadows and reflections cast by other objects',
    ],
    swiatloZPlotna: true,
    zeSkala: true,
  },

  postac: {
    misja: t => `Give the marked person in Image 1 the face and identity of the person from the reference photo: ${t}`,
    material: {
      decyduje:
        'the identity of the person: facial structure and features, skin tone, eye colour, hair colour, hair texture and hairstyle, facial hair, apparent age',
      nieDecyduje:
        'pose, body, clothing, accessories, head angle, gaze direction, framing, background and lighting — all of these come from Image 1',
    },
    reguly: [
      'Keep everything about the person in Image 1 except the identity: the same pose, body proportions, clothing, accessories, hands and head tilt.',
      'Keep the head angle and gaze direction of Image 1; redraw the reference face turned to that exact angle.',
      'Carry over the identity from the reference photo so the person is clearly recognisable as the reference person.',
      'Keep the expression of Image 1, natural and subtle.',
      'Blend the neck, jawline and hairline continuously into the body; skin tone on the neck and hands matches the new face.',
      'Keep the face at the same size in the frame as the original face.',
    ],
    swiatlo: [
      'The face is lit by the light of Image 1: the same key-light direction, the same shadow side, the same colour cast.',
      'Skin texture, sharpness and grain on the face match the rest of the body in Image 1.',
      'The lighting and background of the reference photo stay in the reference photo; only the identity comes across.',
    ],
    zostaje: [
      'every other person in the frame, with their own faces',
      'clothing, pose and body of the marked person',
      'background, framing and colour grading',
    ],
    swiatloZPlotna: true,
    zeSkala: false,
  },

  ubranie: {
    misja: t => `Change the clothing of the marked person as requested: ${t}`,
    material: {
      decyduje: 'the new outfit: clothing type, cut, colour, fabric texture, style, drapery and details',
      nieDecyduje: 'body proportions, pose, face, skin tone, hair, hands, background and lighting — these come from Image 1',
    },
    reguly: [
      'Replace the clothing of the marked person with the new outfit while keeping their exact body pose, stance, limb positions and gestures.',
      'Tailor the new garments to fit the person\'s body shape and proportions naturally, with organic draping and folds that respond to body posture (creases at elbows, waist, knees).',
      'Seamless boundary transitions at neck, wrists, ankles and waistline; skin tone and skin details remain completely intact.',
      'Keep face, expression, hairstyle, hands, footwear and background untouched.',
    ],
    swiatlo: [
      'The new clothing is illuminated by the scene light of Image 1: matching key-light direction, specular fabric sheen or matte response, and shadow falloff.',
    ],
    zostaje: [
      'face, expression, hair and identity of the person',
      'body pose, gestures and proportions',
      'background, surrounding objects and framing',
    ],
    swiatloZPlotna: true,
    zeSkala: false,
  },

  usun: {
    misja: t => `Remove what the task asks for and restore the background behind it: ${t}`,
    material: MATERIAL_OBIEKTU,
    reguly: [
      'Clear the object together with every trace of it: shadow, reflection, dents, ground contact marks.',
      'Rebuild whatever logically lies behind and beneath it, inferred from the neighbourhood.',
      'Continue patterns and structures (paving, boards, tiles, rows of plants, wall courses) with the same direction, scale and rhythm.',
      'Run the perspective lines of the ground and walls through the rebuilt area as if nothing interrupted them.',
      'The freed space shows only the background — a continuation of the scene.',
    ],
    swiatlo: [
      'The light the object used to block now falls on the ground there, matching its surroundings.',
      'A shadow of another object passing through this area continues unbroken.',
      'Brightness, colour and grain of the rebuilt area match the neighbourhood so its edge is invisible.',
    ],
    zostaje: [
      'the rest of the frame unchanged',
      'objects adjacent to the removed one, in the same places and sizes',
      'light, time of day and colour grading of the scene',
    ],
    swiatloZPlotna: true,
    zeSkala: false,
  },

  tekstura: {
    misja: t => `Replace the surface texture and material inside the marked area: ${t}`,
    material: {
      decyduje: 'the new surface material: material type, pattern, surface roughness, grain and tactile properties',
      nieDecyduje: 'geometry, shape, volume, perspective and lighting direction — these come from Image 1',
    },
    reguly: [
      'Apply the new texture over the exact surface geometry, preserving all 3D contours, curvature, bevels and perspective.',
      'Scale the texture grain and pattern realistically relative to the scene dimensions and camera distance without stretching.',
      'Blend texture boundaries smoothly into adjoining surfaces without hard seam lines.',
      'Keep all hardware, seams, fixtures, buttons and structural details intact.',
    ],
    swiatlo: [
      'Match reflectivity, specularity and ambient occlusion to the new material properties under the existing scene lighting.',
    ],
    zostaje: [
      '3D shape, volume and geometry of the surface',
      'adjacent objects, ground contact and perspective',
      'lighting direction and overall scene composition',
    ],
    swiatloZPlotna: true,
    zeSkala: false,
  },

  pora_roku: {
    misja: t => `Transform the scene to the requested season: ${t}`,
    material: {
      decyduje: 'the seasonal characteristics: vegetation state, foliage colours, ground cover, sky and atmosphere',
      nieDecyduje: 'architecture, building geometry, roads, objects and composition',
    },
    reguly: [
      'For Spring: fresh green sprouts, blossoming trees and flowers, moist ground, fresh atmospheric light.',
      'For Summer: lush full green foliage, vibrant sunlight, dry earth and full active vegetation.',
      'For Autumn: golden, amber and crimson leaves, thinning canopies, fallen leaves on ground and water, crisp atmosphere.',
      'For Winter: bare branches, snow accumulation on horizontal surfaces, roofs and branches, frost, frozen water, cold diffused light.',
      'Maintain exact architectural structures, buildings, roads, vehicles and spatial layout — only seasonal organic elements and surface coverings transform.',
      'Smooth natural transitions across boundaries with consistent seasonal intensity.',
    ],
    swiatlo: [
      'Recalculate lighting temperature, sky gradient and sun elevation to match the target season.',
    ],
    zostaje: [
      'building structures, layout and positions of non-vegetation objects',
      'framing, perspective and viewpoint of Image 1',
    ],
    swiatloZPlotna: false,
    zeSkala: false,
  },

  pora_dnia: {
    misja: t => `Transform the scene time of day to the requested time: ${t}`,
    material: {
      decyduje: 'the illumination and sky of the target time: sun position, sky colour gradient, shadow length and artificial light sources',
      nieDecyduje: 'geometry, architecture, positions of objects and scene layout',
    },
    reguly: [
      'Adjust sun angle and elevation: long low shadows for dawn/sunset; high short shadows for midday; nocturnal moonlight/starlight for night.',
      'Rebuild sky appearance: warm pinks/golds for dawn; clear/rich azure for day; dramatic amber/purple for sunset; deep indigo/navy for night.',
      'For night or dusk: illuminate artificial light sources (streetlights, illuminated window panes, neon signs, vehicle headlights) with realistic light glow and atmospheric spill.',
      'Maintain 100% of the scene architecture, objects, terrain and camera perspective.',
    ],
    swiatlo: [
      'All cast shadows and specular highlights follow the new sun/light direction consistently across the frame.',
    ],
    zostaje: [
      'geometry, buildings, objects, road paths',
      'framing, perspective and viewpoint of Image 1',
    ],
    swiatloZPlotna: false,
    zeSkala: false,
  },

  efekt: {
    misja: t => `Add the requested visual or atmospheric effect to the scene: ${t}`,
    material: {
      decyduje: 'the visual effect: particle physics, lighting emission, reflection geometry or shadow casting',
      nieDecyduje: 'underlying scene objects, architecture and composition',
    },
    reguly: [
      'For Shadows: cast realistic shadows from objects matching primary light source angle, with contact shadows (ambient occlusion) grounding the object firmly on the surface.',
      'For Reflections: render physically accurate mirrored reflections on glossy, wet or glass surfaces, distorted naturally by water ripples or surface texture.',
      'For Glow / Luminescence: emit soft volumetric light bleed and atmospheric scattering from luminous elements, with subtle rim lighting on nearby surfaces.',
      'For Particles (snow, rain, dust motes, sparks, fireflies): distribute particles with natural depth variation (foreground blur, midground sharpness, background density) and physical motion.',
    ],
    swiatlo: [
      'Effect light interacts organically with existing materials and scene illumination.',
    ],
    zostaje: [
      'scene layout, architecture, object identities',
      'framing, perspective and composition of Image 1',
    ],
    swiatloZPlotna: true,
    zeSkala: false,
  },

  tlo: {
    misja: t => `Replace the surroundings while keeping the foreground subjects exactly as they are: ${t}`,
    material: {
      decyduje: 'the new environment: location, architecture, landscape, weather and time of day',
      nieDecyduje:
        'the foreground subjects, their pose, position and scale, and the framing — all of these come from Image 1',
    },
    reguly: [
      'Keep the foreground subjects in exactly the same position, scale, pose and crop, with identical camera angle, framing and perspective. Only the environment around them changes.',
      'Keep the camera height: the horizon of the new environment sits at the same height as in Image 1.',
      'The ground of the new environment continues under the subjects so their feet rest on it naturally.',
      'Keep clean edges around hair, fingers and fine detail, with a natural transition to the new background.',
      'Match the depth of field of the lens: a background that was soft in Image 1 is equally soft in the new environment.',
    ],
    swiatlo: [
      'Relight the subjects for the new environment: key-light direction and colour temperature come from the new background.',
      'A rim light on edges that face a bright background, and subtle colour bounce from the environment on skin and clothing.',
      'Contact shadows of the subjects on the new ground, in the direction of the new light.',
    ],
    zostaje: [
      'identity, faces, clothing and pose of the foreground subjects',
      'framing and aspect ratio of Image 1',
    ],
    swiatloZPlotna: false,
    zeSkala: false,
  },

  styl: {
    misja: t => `Change how the scene looks — style, time of day, weather or lighting — as the task asks: ${t}`,
    material: {
      decyduje: 'the look only: palette, brushwork or texture, lighting mood and atmosphere',
      nieDecyduje: 'content, objects, composition and framing — all of these come from Image 1',
    },
    reguly: [
      'Keep the geometry completely: the same objects, shapes, proportions, positions, perspective and edges.',
      'Change only the look: rendering, texture, palette, lighting and atmosphere.',
      'Apply the change evenly across the whole frame, with the same intensity from edge to edge.',
      'For time of day or weather, rebuild the light physically: the sky, the light sources (street lamps and windows lit at night), wet reflective surfaces in rain, a soft haze in fog.',
      'Keep it recognisable: after the change the same places and the same objects are visible.',
    ],
    swiatlo: [
      'Every shadow follows the one new light direction.',
      'One consistent colour temperature across the frame: warm for golden hour, cool blue for dusk, neutral for overcast.',
    ],
    zostaje: [
      'number and placement of objects',
      'framing, perspective and layout of the scene',
      'readability of what the picture shows',
    ],
    swiatloZPlotna: false,
    zeSkala: false,
  },

  popraw: {
    misja: t => `Make exactly this change to the scene: ${t}`,
    material: MATERIAL_OBIEKTU,
    reguly: [
      'Make only the change from the task, with the smallest possible intervention.',
      'Treat the marked area as the only place of work — the rest of the frame is reference material.',
      'When the task is ambiguous, choose the reading closest to what is already in the frame.',
    ],
    swiatlo: ['The changed area follows the existing light: the same direction, colour and shadow softness.'],
    zostaje: ['colour grading, weather, time of day and framing', 'every object the task does not mention'],
    swiatloZPlotna: true,
    zeSkala: false,
  },
}

export interface StylDefinicja {
  klucz: string
  nazwa: string
  slowaKluczowe: RegExp
  reguly: string[]
}

export const TABELA_STYLOW: StylDefinicja[] = [
  {
    klucz: 'cartoon',
    nazwa: 'Kreskówka / Komiks',
    slowaKluczowe: /\b(kresk[oó]wk|cartoon|komiks|illustration|ilustracj)\b/i,
    reguly: [
      'Clean, bold line art outlines defining all primary forms and silhouettes.',
      'Flat, vibrant color fields with simplified cel-shading (2–3 tone steps per object maximum).',
      'Simplified textures and stylized highlights, avoiding photographic gradients.',
      'Expressive visual charm while preserving exact character identity and spatial layout.',
    ],
  },
  {
    klucz: 'oil_painting',
    nazwa: 'Malarstwo olejne',
    slowaKluczowe: /\b(olejn|oil painting|malarstw|farb\w* olejn|p[eę]dzel|obraz olejny)\b/i,
    reguly: [
      'Visible, textured impasto brushstrokes with physical paint thickness variation.',
      'Rich, warm color blending and deep chiaroscuro lighting contrast.',
      'Subtle canvas weave texture and painterly edge transitions (lost and found edges).',
      'Artistic painterly rendering while keeping recognizable subjects and scene geometry.',
    ],
  },
  {
    klucz: 'watercolor',
    nazwa: 'Akwarela',
    slowaKluczowe: /\b(akwarel|watercolor|wodn\w* farb|farby wodne)\b/i,
    reguly: [
      'Layered transparent color washes allowing luminous white paper reserve to shine through.',
      'Soft feathered, bleeding wet-on-wet edges and organic pigment flow.',
      'Natural paper granulation texture, delicate water blooms and edge backruns.',
      'Airy, atmospheric lightness preserving underlying composition and silhouettes.',
    ],
  },
  {
    klucz: 'sketch',
    nazwa: 'Szkic ołówkiem / węglem',
    slowaKluczowe: /\b(szkic|sketch|o[łl][oó]w\w*|w[eę]gl\w*|charcoal|pencil)\b/i,
    reguly: [
      'Expressive pencil/charcoal line work with varied stroke weights and energetic hatching/cross-hatching.',
      'Monochromatic tonal shading with paper-grain texture and soft smudged shadows.',
      'Spontaneous drawing character with subtle searching lines while maintaining tight structural accuracy.',
    ],
  },
  {
    klucz: 'anime',
    nazwa: 'Anime / Manga',
    slowaKluczowe: /\b(anime|manga|japo[ńn]sk\w* animacj)\b/i,
    reguly: [
      'Crisp, fine line art and vibrant, saturated colors with clean 2-step cel shading.',
      'Expressive stylized eyes, dynamic hair highlights, and white specular eye catchlights.',
      'Atmospheric anime aesthetic while preserving scene proportions and perspective.',
    ],
  },
  {
    klucz: 'photorealistic',
    nazwa: 'Fotorealistyczny',
    slowaKluczowe: /\b(fotoreal|photoreal|realistyczn|jak z aparatu|cinematic photo)\b/i,
    reguly: [
      'Physically accurate global illumination, subsurface scattering on skin, and micro-surface details.',
      'True-to-life camera optics: authentic depth of field, subtle chromatic aberration, and sensor noise.',
      'Natural material specularity, ambient occlusion and realistic shadow falloff.',
    ],
  },
  {
    klucz: 'vintage',
    nazwa: 'Vintage / Retro',
    slowaKluczowe: /\b(vintage|retro|stare zdj[eę]cie|analog|klisz|film grain|sepia|polaroid)\b/i,
    reguly: [
      'Authentic vintage film stock color shift: warm sepia/amber cast, lifted shadows, and gentle vignetting.',
      'Organic 35mm film grain texture, subtle lens blooming and reduced modern digital sharpness.',
      'Nostalgic analog atmosphere preserving all original subjects and structural elements.',
    ],
  },
  {
    klucz: 'cyberpunk',
    nazwa: 'Cyberpunk',
    slowaKluczowe: /\b(cyberpunk|neon|sci-?fi|futurystyczn|dystopi)\b/i,
    reguly: [
      'High contrast lighting with vibrant neon accents (magenta #FF00FF, electric cyan, purple, acid green).',
      'Wet reflective ground and glass surfaces catching luminous neon light spill and puddles.',
      'Dense atmospheric haze, futuristic technological details, and moody night atmosphere.',
    ],
  },
  {
    klucz: 'noir',
    nazwa: 'Film Noir',
    slowaKluczowe: /\b(noir|film noir|czarno-?bia[łl]|black and white|monochrom)\b/i,
    reguly: [
      'Classic high-contrast black and white with deep crushed blacks and selective dramatic highlights.',
      'Harsh directional lighting with venetian blind shadow patterns and dramatic silhouettes.',
      'Moody atmospheric mist, wet asphalt reflections, and vintage cinematic grain.',
    ],
  },
]

export function wykryjStyl(tekst: string): StylDefinicja | undefined {
  return TABELA_STYLOW.find(s => s.slowaKluczowe.test(tekst))
}
