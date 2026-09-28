# Przykłady złożonych promptów

Wygenerowane bezpośrednio z kodu (`skladajPrompt`, `zbudujPromptZdjeciaDocelowego`, `zbudujPromptOpisuSceny`), więc pokazują dokładnie to, co dostają modele. Kolejność i uzasadnienia: [README](./README.md).

## 1. Prompt Gemini nr 1 — zdjęcie docelowe, operacja, role pinesek

Scenariusz: dwa zdjęcia, pineska 1 na wazonie (zdjęcie 2), pineska 2 na lampie (zdjęcie 1), polecenie „zamień lampę na wazon z drugiego zdjęcia”. Gemini dostaje oba zdjęcia z magentowymi kropkami; ten tekst idzie po zdjęciach.

```text
You are the edit director of an image-editing pipeline. A downstream image model will generate the result; you only decide WHICH IMAGE IS THE TARGET, WHICH OPERATION APPLIES and WHAT ROLE EACH PIN PLAYS.

INPUT
- You receive 2 image(s), labelled Image 1 … Image 2 in the order sent.
- Pins are drawn as numbered magenta dots on the images. They are drawn only for you.
- Pin list:
- Pin 1: on Image 2, X 41%, Y 62% (0% = left / top edge, 100% = right / bottom edge)
- Pin 2: on Image 1, X 62%, Y 48% (0% = left / top edge, 100% = right / bottom edge)
- The user's command (usually colloquial Polish): "zamień lampę na wazon z drugiego zdjęcia"

DECISION 1 — TARGET IMAGE
The TARGET is the photograph in which the result appears: it keeps its scene, framing, format and quality. All other images are DONORS: they only supply an object, a person, a look or a background.
- One image only: it is the target.
- "Bring / move X from photo A into photo B": the target is B (where X ends up).
- "Put this face / outfit / object on that person / place": the target is the photo of that person / place.
- If the command names an image ("na zdjęciu 2", "w pierwszym"), obey it.
- If the command is ambiguous, prefer the image that carries the destination pin.

DECISION 2 — OPERATION (choose EXACTLY ONE id from this closed list; invent nothing)
- addition: A NEW object is added at the pin and NOTHING is removed from the photo; every existing object stays. Polish triggers: dodaj / wstaw / umieść / postaw / narysuj … tutaj / obok.
- background_change: The surroundings are replaced with a new environment while the foreground subjects stay exactly as they are. Polish triggers: zmień tło / inne tło / przenieś mnie na plażę / w tle ma być.
- character_swap: A whole person in the target photo is replaced by ANOTHER person (from a second photo or described): identity, body and clothing all change, position and pose of the scene stay. Polish triggers: zamień tę osobę / postać na / podmień osobę / wstaw tę osobę zamiast.
- character_transfer: The SAME person is moved to another place in the photo, or brought from another photo into the target photo; identity and clothing are kept, the pose adapts to the new ground. Polish triggers: przenieś tę osobę / postać / postaw tę osobę tutaj / dodaj tę osobę do zdjęcia.
- clothing_change: The outfit of a person changes (from a second photo or described); face, body, pose and scene stay. Polish triggers: zmień ubranie / ubierz w / załóż mu / inny strój / przymierz.
- effect_add: A visual or atmospheric effect is added: shadow, reflection, glow, fog, rain, snow, sparks, particles. Polish triggers: dodaj cień / odbicie / poświatę / mgłę / deszcz / śnieg / iskry.
- face_swap: Only the face and identity of a person change (face, hair, apparent age); their body, clothing, pose and the scene stay. Polish triggers: zamień twarz / daj mu twarz z drugiego zdjęcia / twarz tej osoby.
- general_fix: Any other small local change that fits none of the operations above (recolour something, open a door, change a sign, adjust a detail). Choose this ONLY when no other operation fits.
- object_swap: One object in the target photo is replaced by ANOTHER object — from a second photo or described in words. Polish triggers: zamień / podmień / zastąp / zamiast X daj Y / wstaw Y w miejsce X. The old object disappears, the new one takes its place.
- object_transfer: The SAME object changes position — inside the target photo, or it is brought from another photo. Examples: move the cottage closer, put this here, take this object from photo 2 and place it there. Polish triggers: przenieś / przesuń / daj tu / ma być tu / przybliż / oddal.
- removal: Something is deleted from the target photo and nothing takes its place; the background is rebuilt. Polish triggers: usuń / skasuj / wytnij / wymaż / pozbądź się / zrób bez.
- season_change: The whole scene changes season (spring, summer, autumn, winter). Polish triggers: zrób zimę / jesień / wiosnę / lato / pokryj śniegiem / niech liście będą żółte.
- style_change: The look of the whole image changes to an artistic style (cartoon, oil painting, watercolour, sketch, anime, noir, vintage, cyberpunk); composition and content stay. Polish triggers: zrób w stylu / kreskówka / obraz olejny / akwarela / szkic / anime / vintage.
- texture_change: The material or surface texture of an area changes while its shape stays. Polish triggers: zmień materiał / zrób z drewna / marmurowa podłoga / inna faktura / inny kolor elewacji.
- time_of_day_change: The whole scene changes time of day (dawn, day, sunset, dusk, night). Polish triggers: zrób noc / zachód słońca / świt / dzień / niech będzie wieczór.

Selection rules:
- Choose object_swap only when one object is replaced by another object. Choose object_transfer when the SAME object changes position. The two are never interchangeable.
- The operation acts on EXACTLY the pinned things the user named — never on a bigger, brighter or more central object that merely sits nearby. If a pin names a pillow and the user says "poduszkę", the target is that pillow, not the person in front of it.
- Use general_fix only when no other operation fits.

DECISION 3 — PIN ROLES
- "source": the pin on the thing that is brought, moved or copied (the donor object or person, or the object at its old position).
- "target": the pin at the destination or on the thing that is replaced, removed, changed or receives the addition.
- One pin only: it is "target". Two pins: normally pin 1 = source, pin 2 = target, unless the command clearly says otherwise.

OUTPUT — return ONLY this JSON, no commentary:
{
  "targetImage": <number of the target image, 1-based>,
  "donorImages": [<numbers of the donor images, may be empty>],
  "operation": "<one id from the list>",
  "pins": [{ "pin": <pin number>, "role": "source" | "target" }],
  "reason": "<one short sentence in English>"
}
```

Odpowiedź (JSON): `{"targetImage":1,"donorImages":[2],"operation":"object_swap","pins":[{"pin":1,"role":"source"},{"pin":2,"role":"target"}],"reason":"..."}`

## 2. Prompt Gemini nr 2 — miejsce, wygląd, wymiary

Zdjęcia idą już w nowej kolejności (Image 1 = docelowe). Pineski opisane po kolei.

```text
You are the scene analyst of an image-editing pipeline. You look at the images and write a SHORT factual description that a downstream image model will use. You do not edit anything.

INPUT
- 2 image(s), labelled Image 1 … Image 2 in the order sent. Pins are drawn as numbered magenta dots, only for you.
- Image 1 is the TARGET photo; other images are DONORS.
- Operation chosen for this edit: object_swap.
- Pin roles: pin 1 = source, pin 2 = target.
- Pin list (describe them in this order):
- Pin 1: on Image 2, X 41%, Y 62% (0% = left / top edge, 100% = right / bottom edge)
- Pin 2: on Image 1, X 62%, Y 48% (0% = left / top edge, 100% = right / bottom edge)
- The user's command (usually colloquial Polish): "zamień lampę na wazon z drugiego zdjęcia"

WHAT TO DESCRIBE
1. "place": where the scene of Image 1 is, in one sentence (e.g. "stone terrace of a country house, late afternoon").
2. "look": the look of Image 1 — photographic medium (colour / black-and-white / sepia), light direction and colour temperature, grain and sharpness, condition (old, degraded, clean), mood.
3. "anchors": objects of known size visible in Image 1 near the pins, with their real-world size (e.g. "door ≈ 2.0 m high, person ≈ 1.75 m, brick ≈ 6.5 cm").
4. "pins": for EACH pin, in order:
   - "name": the WHOLE object or person under the pin (not only the part under the crosshair), 2–5 words;
   - "place": where it is in its image and what surrounds it;
   - "look": colour, material, condition and distinguishing details;
   - "size": real-world dimensions (height × width or length) with a comparison to a visible anchor. For a pin on a donor image, give the true size of the donor object; for a pin on the target image, give the size of the thing there or of the free space.

RULES
- The pin's NAME and the user's word decide what the pinned thing is — even when the crosshair sits near a bigger, brighter or more central object. Never retarget to a more prominent object.
- Recogniser hints may be wrong; trust what you see.
- Facts only, no opinions. Each text field is at most 25 words. Write in English.

OUTPUT — return ONLY this JSON, no commentary:
{
  "place": "...",
  "look": "...",
  "anchors": "...",
  "pins": [{ "pin": <number>, "name": "...", "place": "...", "look": "...", "size": "..." }]
}
```

## 3. Złożony prompt — `object_swap` (17 bricków)

Zamiana lampy (zdjęcie 1) na wazon (zdjęcie 2). Do generatora idą: Image 1, Image 2 i maska.

```text
[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1200×800 px).
Image 2 = DONOR (reference). It supplies only the identity or appearance of its pinned subject.
Last image = MASK of the work area (white = where the change happens, black = untouched). It is a guide only — not a reference and not part of the result.

[RULE BRICKS — 17 non-negotiable rules; the result must satisfy all of them at once]

[BRICK 01 · LIGHT RULE]
LIGHT RULE — the element is lit exactly like the scene it lives in:
- Every generated, replaced or moved element receives the light that already exists in Image 1: the same direction, elevation, hardness, colour temperature and intensity as its neighbours.
- Sun rays, window light, lamp light, rim lights and dappled light strike the element on the same side and with the same colour as they strike the objects around it.
- Shadows: the cast shadow falls in the same direction, with the same length and softness as the other shadows in the scene; a soft contact shadow and ambient occlusion sit where the element touches a surface; the shadow bends over the shape of the surface beneath it (grass, steps, folds, uneven ground).
- Bounce and colour spill: nearby coloured surfaces tint the element, and the element tints its surroundings the same way.
- Highlights: specular highlights on glossy parts sit exactly where the scene light sources would place them; matte and dusty surfaces stay diffuse.
- Mirrors, glass, windows, water and polished metal in the scene show the element wherever the geometry says it must be visible, and stop showing anything that was removed.
- A light-emitting element (lamp, screen, fire, neon) illuminates its surroundings physically, with correct falloff.
- Light from a donor photo is never carried over; only the scene light of Image 1 counts.

[BRICK 02 · POSITION RULE]
POSITION RULE — the element lands exactly where the pin says:
- The element takes EXACTLY the position of Pin 2 [Image 1 · "lampa" · X 62%, Y 48%]. The pin marks the point where its base or point of contact meets the ground or supporting surface; its footprint is centred on that point — not drifted sideways, not floating, not pushed to another part of the frame. Landing at the marked location is a top priority.
- When it replaces something, it inherits the position, footprint, orientation, rotation and facing direction of what stood there.
- When it is moved, it appears at the destination pin (Pin 2 [Image 1 · "lampa" · X 62%, Y 48%]) and nowhere else; the old spot (Pin 2 [Image 1 · "lampa" · X 62%, Y 48%]) is left empty.
- It aligns to the natural lines and flow of the surface it rests on and stands on a stable, natural footprint.
- The pin number, the X/Y percentages and the described place in the PIN MAP all describe the same point (0% = left / top edge of the image, 100% = right / bottom edge).

[BRICK 03 · SCALE RULE]
SCALE RULE — true real-world size, judged from the scene:
- Render the element at its TRUE real-world size (see the dimensions in SCENE DETAILS). Judge it against a known-size reference that is actually visible near the spot: a hand, a person, a door, a cup, a tile, a window, a car. State the comparison with a number to yourself before drawing.
- The marked area is a boundary, not a quota: never inflate the element to fill it, never shrink it to fit.
- A replacement element has its OWN size, never the outline of the element it replaces. A larger element rises higher or reaches further and hides more of what is behind it; a smaller one reveals more of the rebuilt background.
- When no anchor of known size is near, choose the smaller plausible size and set the element deeper in the scene.
- Show the element complete. If at its real size it would cross the frame edge, set it slightly deeper in the scene — never cut it off and never shrink it below its real size.
- Keep a comfortable margin from the frame edges so no part is clipped.

[BRICK 04 · PERSPECTIVE RULE]
PERSPECTIVE RULE — one camera, one viewpoint:
- The element is drawn from the camera position, height, focal length and angle of Image 1. It is turned to that camera angle, never shown from the angle of its own source photo.
- Horizontal edges converge to the same vanishing points as the surrounding ground, walls and objects; verticals stay parallel to the verticals of the scene.
- The horizon line stays where it is; the element sits on the ground plane of the scene at the right distance from the camera, with correct foreshortening and lens distortion.
- Further from the camera means smaller and slightly softer, along the same vanishing lines.

[BRICK 05 · DEPTH OCCLUSION RULE]
DEPTH & OCCLUSION RULE — the element lives in the depth of the scene:
- Respect depth order: whatever is closer to the camera overlaps the element; the element overlaps whatever is behind it. Foreground subjects stay sharp and seal it out.
- An element on a background plane inherits that plane of the optical softness, lens blur (bokeh) and atmospheric haze; an element in the foreground is as sharp as the other foreground objects.
- Partial occlusion by grass, railings, furniture, people or leaves is natural and physically correct — no part is cut by a straight line and nothing clips through another object.
- Keep the spacing to neighbours: the element stands beside what is already there, each object on its own footprint.

[BRICK 06 · CONTACT RULE]
CONTACT RULE — physical contact stays physically correct:
- If a person or animal touches the old element (holds it, leans on it, sits on it, rests a hand on it), they stay 100% intact in their exact pose, limbs, clothing and posture. Nobody is cut, erased or reshaped.
- The new element supplies its OWN equivalent contacting part (its own handle, edge, seat, surface) adapted to sustain that exact contact. No part of the old element is kept, reused, recoloured or grafted onto the new one.
- Ground contact: the element carries weight — a stable footprint, slight sinking into soft ground, grass or snow pressed around it, a dark contact line, dust or ripples where it meets the surface.
- Nothing floats and nothing clips into other objects.

[BRICK 07 · REFLECTION RULE]
REFLECTION RULE — reflections work both ways:
- Glossy, wet, metallic or glass surfaces of the element reflect the environment of Image 1, never the surroundings of a donor photo.
- Mirrors, shop windows, water, polished floors, car paint and screens near the element show its reflection with the correct angle, distortion, brightness and blur; reflections of anything removed disappear together with it.
- Transparent parts (glass, plastic, liquid) refract and show the real background behind them, with the right tint and distortion.
- Water ripples, wet asphalt and rain puddles break the reflection naturally.

[BRICK 08 · GRAIN MEDIUM RULE]
GRAIN & MEDIUM RULE — the element is re-photographed in the medium of the scene:
- Adopt the exact photographic medium of Image 1. If it is black-and-white, monochrome, sepia, cross-processed or heavily desaturated, the element is rendered in that SAME treatment with no full modern colour left on it. Match the tonal curve, contrast, dynamic range, black point and overall colour cast.
- Cover the element with the SAME film grain, sensor noise and analog texture: the same grain size, density and contrast, running continuously across the element and the background with no clean patch around it.
- Match sharpness, depth of field, motion blur, lens softness, vignetting and compression artifacts of the scene.
- The element is never smooth, glossy, over-sharp, denoised or over-rendered: no digital smoothness, no CGI sheen, no 3D-render or AI-generated look.
- The result reads as one photograph from one camera, one exposure, one film stock.

[BRICK 09 · FIDELITY RULE]
FIDELITY RULE — this is an EDITOR, not an enhancer, upscaler or restorer:
- Output the SAME resolution and aspect ratio as Image 1. No upscaling, stretching, added detail or extra sharpness anywhere.
- Keep the original quality everywhere the task does not touch: exact grain, noise, softness, compression, low resolution, colour degradation, scratches and old-photo artifacts. Nothing is denoised, sharpened, cleaned, brightened, colour-corrected or "improved" — a degraded old photo stays a degraded old photo.
- Camera lock: identical camera position, focal length, field of view and angle; no zoom, no re-crop, no lens change.
- Lighting lock: the exposure, contrast and colour balance of the untouched areas stay exactly as they are.
- Only the marked change area may differ; every other pixel is the original photograph at its original quality.

[BRICK 10 · FRAMING RULE]
FRAMING RULE — the result is Image 1 with only the requested change:
- The same shot, the same camera spot, the same field of view, the same angle and the same frame edges.
- Everything the task does not concern stays in place at the same size, in the same position.
- Work like a retoucher on a finished photograph: no re-composition, no rotation, no crop, no extension of the canvas.

[BRICK 11 · OUTPUT CONTRACT RULE]
OUTPUT CONTRACT (fixed, non-negotiable):
- Image 1 is the TARGET photo (the destination). The result IS Image 1 with only the change the task asks for.
- The result keeps the exact aspect ratio, resolution, framing, camera position and grain level of Image 1. Aspect ratio, resolution, quality, framing and crop are never taken from any other image.
- Further images are REFERENCES. They contribute only the identity or appearance of their pinned object — nothing about frame, format, resolution, quality, background or lighting.
- Add nothing the task did not ask for and remove nothing it did not ask for: every existing subject that the task does not change stays, with the same count and positions.
- Pins, numbered dots, crosshairs, masks and boxes are guides for you only. The result is one clean photograph in which none of these markers, labels or outlines are visible.

[BRICK 12 · CLEAN PLATE RULE]
CLEAN PLATE RULE — what leaves the frame leaves without a trace:
- Remove the old element completely: the object itself, its shadow, its reflection, its dents, contact marks, cables and any part of it that others touched. Not one pixel of it remains at Pin 2 [Image 1 · "lampa" · X 62%, Y 48%].
- Rebuild whatever logically lies behind and beneath it, inferred from the neighbourhood: ground, grass, paving, boards, tiles, wall courses, sky, vegetation.
- Continue patterns and structures with the same direction, scale and rhythm; run the perspective lines of ground and walls through the rebuilt area as if nothing had interrupted them.
- The rebuilt area matches the brightness, colour, grain and blur of its neighbourhood, so its edge is invisible.
- The light that the removed element used to block now falls on the ground there like everywhere else.

[BRICK 13 · SINGULARITY RULE]
SINGULARITY RULE — exactly once:
- The moved, replaced or added element appears EXACTLY ONCE in the final image, at the destination pin.
- No clone, mirror image, ghost, half-transparent copy or leftover of it remains anywhere else — least of all at the source location.
- Each element has the exact number of its own parts: two eyes, one nose, five fingers per hand, four wheels, one roof. No part is duplicated, mirrored or added.

[BRICK 14 · OBJECT IDENTITY RULE]
OBJECT IDENTITY RULE — it is unmistakably the SAME object:
- The incoming object keeps its own identity: type, model, shape, proportions, material, colour, markings, text, logos, wear and fine details (see the appearance in SCENE DETAILS).
- Its surface condition is preserved — dust, dirt, grime, patina, scratches, matte or weathered finish — unless the task explicitly asks to clean or change it.
- It is only re-photographed inside this scene: never a generic stand-in, never a similar-looking substitute, never a hybrid that wears parts of the object it replaces.
- A moved object is the same object as before, with the same form, colour and details, only in a different place.

[BRICK 15 · DONOR ISOLATION RULE]
DONOR ISOLATION RULE — only the pinned subject crosses over:
- When the object, person or look comes from Image 2, only the identity and appearance of the pinned subject is used.
- The framing, background, surroundings, lighting, time of day, colour grading, resolution and quality of the donor photo stay in the donor photo.
- The subject is redrawn from the camera angle and in the light of Image 1; reflections and shadows of the donor environment are not carried over.
- If no donor image is present, the subject follows the description in SCENE DETAILS and the COMMAND.

[BRICK 16 · NO COPY PASTE RULE]
NO COPY-PASTE RULE — generate from scratch:
- The element is drawn anew, pixel by pixel, as a native part of this photograph. It is forbidden to copy, cut, lift, warp or paste the pixels of the element from a reference and merely recolour or resize them.
- A recoloured cut-out is always wrong: no pasted look, no hard edges, no seams, no halo, no mismatched sharpness.
- The edit must be impossible to spot.

[BRICK 17 · EDGE BLEND RULE]
EDGE & BLEND RULE — clean, natural transitions:
- Edges of the changed area are natural: hair strands, fingers, fur, foliage, lace and glass edges stay fine and clean, with the edge softness of the scene lens.
- No halo, fringe, outline, cut-out edge or colour bleed around the changed area.
- Colour, brightness, grain and sharpness cross the border of the changed area without any visible step.
- Where the element meets the background, a natural transition zone (soft shadow, slight colour spill, matching blur) ties it to the scene.

[OPERATION — OBJECT SWAP]
Replace the object at Pin 2 [Image 1 · "lampa" · X 62%, Y 48%] with the new object (taken from Image 2, or as described in the COMMAND). The old object leaves the photograph completely; the new object takes its place.
STEPS:
1. Identify the old object at Pin 2 [Image 1 · "lampa" · X 62%, Y 48%] as a whole (see the PIN MAP), not only the part under the pin.
2. Remove it entirely together with its shadow and reflection and rebuild what was behind it (clean plate).
3. Generate the new object from its reference or description at its OWN real size, turned to the camera angle of Image 1.
4. Stand the new object where the old one stood: the same contact point, on the same surface plane, facing the same direction.
5. If a person or animal touched the old object, they stay intact and the new object gets its own equivalent contacting part.
6. Recompute light, shadows and reflections for the shape and material of the new object.

[PIN MAP]
Coordinates: 0% = left / top edge, 100% = right / bottom edge of that image.
- Pin 1 · SOURCE · Image 2 · X 41%, Y 62% — "ceramic vase" — place: on a shelf in Image 2; appearance: white glazed, blue rim; size: 30 cm high, 15 cm wide
- Pin 2 · TARGET · Image 1 · X 62%, Y 48% — "table lamp" — place: on the wooden table, left of the window; appearance: brass base, linen shade; size: 45 cm high

[SCENE DETAILS — from visual analysis of Image 1]
Place: stone terrace of a country house, late afternoon
Look: colour photo, warm low sun from the left, fine grain, slightly soft
Scale anchors: door ≈ 2.0 m high, chair seat ≈ 45 cm

[COMMAND — the user's words]
zamień lampę na wazon z drugiego zdjęcia

[FINAL QUALITY]
- One seamless, photorealistic photograph that is indistinguishable from an unedited capture of the same moment.
- Every detail is as sharp where the scene is sharp and as soft where the scene is soft; the edit is impossible to spot.
- Physically plausible everywhere: light, shadow, reflection, scale, anatomy and perspective all agree.
- Return only the final image.
```

## 4. Złożony prompt — `object_transfer` w obrębie jednego zdjęcia

Polecenie „przenieś chatkę bliżej”: ta sama chatka, stare miejsce jest czyszczone (`clean-plate-rule` włączony, `PIN_CLEAR` = pineska źródłowa), nowe miejsce jest bliżej kamery, więc obiekt rośnie zgodnie z perspektywą. Operacja i bricki są **inne** niż w `object_swap` — to samo polecenie nie użyje promptu zamiany.

```text
[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1600×1067 px).
Last image = MASK of the work area (white = where the change happens, black = untouched). It is a guide only — not a reference and not part of the result.

[RULE BRICKS — 17 non-negotiable rules; the result must satisfy all of them at once]

[BRICK 01 · LIGHT RULE]
LIGHT RULE — the element is lit exactly like the scene it lives in:
- Every generated, replaced or moved element receives the light that already exists in Image 1: the same direction, elevation, hardness, colour temperature and intensity as its neighbours.
- Sun rays, window light, lamp light, rim lights and dappled light strike the element on the same side and with the same colour as they strike the objects around it.
- Shadows: the cast shadow falls in the same direction, with the same length and softness as the other shadows in the scene; a soft contact shadow and ambient occlusion sit where the element touches a surface; the shadow bends over the shape of the surface beneath it (grass, steps, folds, uneven ground).
- Bounce and colour spill: nearby coloured surfaces tint the element, and the element tints its surroundings the same way.
- Highlights: specular highlights on glossy parts sit exactly where the scene light sources would place them; matte and dusty surfaces stay diffuse.
- Mirrors, glass, windows, water and polished metal in the scene show the element wherever the geometry says it must be visible, and stop showing anything that was removed.
- A light-emitting element (lamp, screen, fire, neon) illuminates its surroundings physically, with correct falloff.
- Light from a donor photo is never carried over; only the scene light of Image 1 counts.

[BRICK 02 · POSITION RULE]
POSITION RULE — the element lands exactly where the pin says:
- The element takes EXACTLY the position of Pin 2 [Image 1 · X 55%, Y 80%]. The pin marks the point where its base or point of contact meets the ground or supporting surface; its footprint is centred on that point — not drifted sideways, not floating, not pushed to another part of the frame. Landing at the marked location is a top priority.
- When it replaces something, it inherits the position, footprint, orientation, rotation and facing direction of what stood there.
- When it is moved, it appears at the destination pin (Pin 2 [Image 1 · X 55%, Y 80%]) and nowhere else; the old spot (Pin 1 [Image 1 · "chatka" · X 30%, Y 35%]) is left empty.
- It aligns to the natural lines and flow of the surface it rests on and stands on a stable, natural footprint.
- The pin number, the X/Y percentages and the described place in the PIN MAP all describe the same point (0% = left / top edge of the image, 100% = right / bottom edge).

[BRICK 03 · SCALE RULE]
SCALE RULE — true real-world size, judged from the scene:
- Render the element at its TRUE real-world size (see the dimensions in SCENE DETAILS). Judge it against a known-size reference that is actually visible near the spot: a hand, a person, a door, a cup, a tile, a window, a car. State the comparison with a number to yourself before drawing.
- The marked area is a boundary, not a quota: never inflate the element to fill it, never shrink it to fit.
- A replacement element has its OWN size, never the outline of the element it replaces. A larger element rises higher or reaches further and hides more of what is behind it; a smaller one reveals more of the rebuilt background.
- When no anchor of known size is near, choose the smaller plausible size and set the element deeper in the scene.
- Show the element complete. If at its real size it would cross the frame edge, set it slightly deeper in the scene — never cut it off and never shrink it below its real size.
- Keep a comfortable margin from the frame edges so no part is clipped.

[BRICK 04 · PERSPECTIVE RULE]
PERSPECTIVE RULE — one camera, one viewpoint:
- The element is drawn from the camera position, height, focal length and angle of Image 1. It is turned to that camera angle, never shown from the angle of its own source photo.
- Horizontal edges converge to the same vanishing points as the surrounding ground, walls and objects; verticals stay parallel to the verticals of the scene.
- The horizon line stays where it is; the element sits on the ground plane of the scene at the right distance from the camera, with correct foreshortening and lens distortion.
- Further from the camera means smaller and slightly softer, along the same vanishing lines.

[BRICK 05 · DEPTH OCCLUSION RULE]
DEPTH & OCCLUSION RULE — the element lives in the depth of the scene:
- Respect depth order: whatever is closer to the camera overlaps the element; the element overlaps whatever is behind it. Foreground subjects stay sharp and seal it out.
- An element on a background plane inherits that plane of the optical softness, lens blur (bokeh) and atmospheric haze; an element in the foreground is as sharp as the other foreground objects.
- Partial occlusion by grass, railings, furniture, people or leaves is natural and physically correct — no part is cut by a straight line and nothing clips through another object.
- Keep the spacing to neighbours: the element stands beside what is already there, each object on its own footprint.

[BRICK 06 · CONTACT RULE]
CONTACT RULE — physical contact stays physically correct:
- If a person or animal touches the old element (holds it, leans on it, sits on it, rests a hand on it), they stay 100% intact in their exact pose, limbs, clothing and posture. Nobody is cut, erased or reshaped.
- The new element supplies its OWN equivalent contacting part (its own handle, edge, seat, surface) adapted to sustain that exact contact. No part of the old element is kept, reused, recoloured or grafted onto the new one.
- Ground contact: the element carries weight — a stable footprint, slight sinking into soft ground, grass or snow pressed around it, a dark contact line, dust or ripples where it meets the surface.
- Nothing floats and nothing clips into other objects.

[BRICK 07 · REFLECTION RULE]
REFLECTION RULE — reflections work both ways:
- Glossy, wet, metallic or glass surfaces of the element reflect the environment of Image 1, never the surroundings of a donor photo.
- Mirrors, shop windows, water, polished floors, car paint and screens near the element show its reflection with the correct angle, distortion, brightness and blur; reflections of anything removed disappear together with it.
- Transparent parts (glass, plastic, liquid) refract and show the real background behind them, with the right tint and distortion.
- Water ripples, wet asphalt and rain puddles break the reflection naturally.

[BRICK 08 · GRAIN MEDIUM RULE]
GRAIN & MEDIUM RULE — the element is re-photographed in the medium of the scene:
- Adopt the exact photographic medium of Image 1. If it is black-and-white, monochrome, sepia, cross-processed or heavily desaturated, the element is rendered in that SAME treatment with no full modern colour left on it. Match the tonal curve, contrast, dynamic range, black point and overall colour cast.
- Cover the element with the SAME film grain, sensor noise and analog texture: the same grain size, density and contrast, running continuously across the element and the background with no clean patch around it.
- Match sharpness, depth of field, motion blur, lens softness, vignetting and compression artifacts of the scene.
- The element is never smooth, glossy, over-sharp, denoised or over-rendered: no digital smoothness, no CGI sheen, no 3D-render or AI-generated look.
- The result reads as one photograph from one camera, one exposure, one film stock.

[BRICK 09 · FIDELITY RULE]
FIDELITY RULE — this is an EDITOR, not an enhancer, upscaler or restorer:
- Output the SAME resolution and aspect ratio as Image 1. No upscaling, stretching, added detail or extra sharpness anywhere.
- Keep the original quality everywhere the task does not touch: exact grain, noise, softness, compression, low resolution, colour degradation, scratches and old-photo artifacts. Nothing is denoised, sharpened, cleaned, brightened, colour-corrected or "improved" — a degraded old photo stays a degraded old photo.
- Camera lock: identical camera position, focal length, field of view and angle; no zoom, no re-crop, no lens change.
- Lighting lock: the exposure, contrast and colour balance of the untouched areas stay exactly as they are.
- Only the marked change area may differ; every other pixel is the original photograph at its original quality.

[BRICK 10 · FRAMING RULE]
FRAMING RULE — the result is Image 1 with only the requested change:
- The same shot, the same camera spot, the same field of view, the same angle and the same frame edges.
- Everything the task does not concern stays in place at the same size, in the same position.
- Work like a retoucher on a finished photograph: no re-composition, no rotation, no crop, no extension of the canvas.

[BRICK 11 · OUTPUT CONTRACT RULE]
OUTPUT CONTRACT (fixed, non-negotiable):
- Image 1 is the TARGET photo (the destination). The result IS Image 1 with only the change the task asks for.
- The result keeps the exact aspect ratio, resolution, framing, camera position and grain level of Image 1. Aspect ratio, resolution, quality, framing and crop are never taken from any other image.
- Further images are REFERENCES. They contribute only the identity or appearance of their pinned object — nothing about frame, format, resolution, quality, background or lighting.
- Add nothing the task did not ask for and remove nothing it did not ask for: every existing subject that the task does not change stays, with the same count and positions.
- Pins, numbered dots, crosshairs, masks and boxes are guides for you only. The result is one clean photograph in which none of these markers, labels or outlines are visible.

[BRICK 12 · CLEAN PLATE RULE]
CLEAN PLATE RULE — what leaves the frame leaves without a trace:
- Remove the old element completely: the object itself, its shadow, its reflection, its dents, contact marks, cables and any part of it that others touched. Not one pixel of it remains at Pin 1 [Image 1 · "chatka" · X 30%, Y 35%].
- Rebuild whatever logically lies behind and beneath it, inferred from the neighbourhood: ground, grass, paving, boards, tiles, wall courses, sky, vegetation.
- Continue patterns and structures with the same direction, scale and rhythm; run the perspective lines of ground and walls through the rebuilt area as if nothing had interrupted them.
- The rebuilt area matches the brightness, colour, grain and blur of its neighbourhood, so its edge is invisible.
- The light that the removed element used to block now falls on the ground there like everywhere else.

[BRICK 13 · SINGULARITY RULE]
SINGULARITY RULE — exactly once:
- The moved, replaced or added element appears EXACTLY ONCE in the final image, at the destination pin.
- No clone, mirror image, ghost, half-transparent copy or leftover of it remains anywhere else — least of all at the source location.
- Each element has the exact number of its own parts: two eyes, one nose, five fingers per hand, four wheels, one roof. No part is duplicated, mirrored or added.

[BRICK 14 · OBJECT IDENTITY RULE]
OBJECT IDENTITY RULE — it is unmistakably the SAME object:
- The incoming object keeps its own identity: type, model, shape, proportions, material, colour, markings, text, logos, wear and fine details (see the appearance in SCENE DETAILS).
- Its surface condition is preserved — dust, dirt, grime, patina, scratches, matte or weathered finish — unless the task explicitly asks to clean or change it.
- It is only re-photographed inside this scene: never a generic stand-in, never a similar-looking substitute, never a hybrid that wears parts of the object it replaces.
- A moved object is the same object as before, with the same form, colour and details, only in a different place.

[BRICK 15 · DONOR ISOLATION RULE]
DONOR ISOLATION RULE — only the pinned subject crosses over:
- When the object, person or look comes from the reference described in the COMMAND, only the identity and appearance of the pinned subject is used.
- The framing, background, surroundings, lighting, time of day, colour grading, resolution and quality of the donor photo stay in the donor photo.
- The subject is redrawn from the camera angle and in the light of Image 1; reflections and shadows of the donor environment are not carried over.
- If no donor image is present, the subject follows the description in SCENE DETAILS and the COMMAND.

[BRICK 16 · NO COPY PASTE RULE]
NO COPY-PASTE RULE — generate from scratch:
- The element is drawn anew, pixel by pixel, as a native part of this photograph. It is forbidden to copy, cut, lift, warp or paste the pixels of the element from a reference and merely recolour or resize them.
- A recoloured cut-out is always wrong: no pasted look, no hard edges, no seams, no halo, no mismatched sharpness.
- The edit must be impossible to spot.

[BRICK 17 · EDGE BLEND RULE]
EDGE & BLEND RULE — clean, natural transitions:
- Edges of the changed area are natural: hair strands, fingers, fur, foliage, lace and glass edges stay fine and clean, with the edge softness of the scene lens.
- No halo, fringe, outline, cut-out edge or colour bleed around the changed area.
- Colour, brightness, grain and sharpness cross the border of the changed area without any visible step.
- Where the element meets the background, a natural transition zone (soft shadow, slight colour spill, matching blur) ties it to the scene.

[OPERATION — OBJECT TRANSFER]
Move the object at Pin 1 [Image 1 · "chatka" · X 30%, Y 35%] to the destination Pin 2 [Image 1 · X 55%, Y 80%]. This is a relocation, not a copy: the same object changes position and appears exactly once, at the destination.
STEPS:
1. The object keeps its identity and surface condition: the same form, material, colour, dust, patina and details.
2. If the source pin lies in Image 1, restore a clean plate there: rebuild ground, vegetation and patterns as if the object had never stood there. If it lies in another image, only the object comes across from it.
3. Adapt the object to the new position: perspective, angle and scale follow the destination — farther from the camera means smaller along the same vanishing lines, closer means larger and sharper (an object moved from the distance to the foreground grows accordingly).
4. Set it on the ground at the destination pin with a stable natural footprint and its own new contact shadow.
5. Its old cast shadow and reflection leave together with it.
6. People in contact with the object are never cut or erased: their contact adapts naturally.

[PIN MAP]
Coordinates: 0% = left / top edge, 100% = right / bottom edge of that image.
- Pin 1 · SOURCE · Image 1 · X 30%, Y 35% — "stone cottage" — place: on the far slope, above the fence line; appearance: grey stone walls, dark slate roof, one chimney; size: ≈ 8 m wide, 5 m high
- Pin 2 · TARGET · Image 1 · X 55%, Y 80% — "grass" — place: foreground meadow, lower centre; appearance: short grass, flat ground; size: free space ≈ 15 m wide

[SCENE DETAILS — from visual analysis of Image 1]
Place: hillside meadow with a stone cottage on the slope, overcast afternoon
Look: black-and-white photo, heavy film grain, soft focus, low contrast
Scale anchors: cottage door ≈ 1.9 m high, fence post ≈ 1.2 m, sheep ≈ 0.7 m at the shoulder

[COMMAND — the user's words]
przenieś chatkę bliżej

[FINAL QUALITY]
- One seamless, photorealistic photograph that is indistinguishable from an unedited capture of the same moment.
- Every detail is as sharp where the scene is sharp and as soft where the scene is soft; the edit is impossible to spot.
- Physically plausible everywhere: light, shadow, reflection, scale, anatomy and perspective all agree.
- Return only the final image.
```
