# Przykłady złożonych promptów

Wygenerowane z kodu (`skrypty/generuj-przyklady-canvas.ts`), więc pokazują dokładnie to, co dostają modele. Kolejność i uzasadnienia: [README](./README.md).

## 1. Prompt Gemini nr 1 — zdjęcie docelowe, operacja, role pinesek

Scenariusz: pineska 1 na wazonie (zdjęcie 2), pineska 2 na lampie (zdjęcie 1).

```text
You are the edit director of an image-editing pipeline. A downstream image model will generate the result; you only decide WHICH IMAGE IS THE TARGET, WHICH OPERATION APPLIES and WHAT ROLE EACH PIN PLAYS.

INPUT
- You receive 2 image(s), labelled Image 1 … Image 2 in the order sent.
- Pins are drawn as numbered magenta dots on the images. They are drawn only for you.
- Pin list:
- Pin 1: on Image 2, drawn as the numbered magenta dot 1 — recogniser hint: "vase" (may be wrong or name only a part)
- Pin 2: on Image 1, drawn as the numbered magenta dot 2 — recogniser hint: "lamp" (may be wrong or name only a part)
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

## 2. Prompt Gemini nr 2 — tylko skala (kotwice i wymiary)

```text
You are the scale analyst of an image-editing pipeline. You look at the images and report ONLY real-world sizes, so that an inserted or moved object is rendered at a realistic scale. You do not describe looks, light or mood, and you do not edit anything.

INPUT
- 2 image(s), labelled Image 1 … Image 2 in the order sent. Pins are drawn as numbered magenta dots, only for you.
- Describe what the pin points at.
- Pin list (report them in this order):
- Pin 1: on Image 1, drawn as the numbered magenta dot 1 — recogniser hint: "lamp" (may be wrong or name only a part)
- Pin 2: on Image 2, drawn as the numbered magenta dot 2 — recogniser hint: "vase" (may be wrong or name only a part)
- The user's command (usually colloquial Polish): "zamień lampę na wazon z drugiego zdjęcia"

REPORT
1. "anchors": objects of known size visible in Image 1 near the pins, with their real-world size (e.g. "door ≈ 2.0 m high, person ≈ 1.75 m, paving stone ≈ 30 cm").
2. "pins": for EACH pin, in order:
   - "name": the WHOLE object or person under the pin, 2–5 words (the pin's name and the user's word decide it, never a more prominent neighbour);
   - "size": true real-world dimensions (height × width or length) compared with a visible anchor. For a pin on a donor image give the true size of the donor object; for a pin on Image 1 give the size of the thing there or of the free space.

Facts only, at most 25 words per field, English.

OUTPUT — return ONLY this JSON:
{
  "anchors": "...",
  "pins": [{ "pin": <number>, "name": "...", "size": "..." }]
}
```

## 3. Złożony prompt — `object_swap` (17 bricków, bricki ≈ 1810 tokenów)

```text
[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.

[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1200×800 px).
Image 2 = DONOR (reference). It supplies only the identity or appearance of its pinned subject.
Last image = MASK of the work area (white = where the change happens, black = untouched). It is a guide only — not a reference and not part of the result.

[RULES — 17 rules; all hold at once]
LIGHT — the element is lit exactly like Image 1: same direction, hardness, colour temperature and intensity as its neighbours.
- Its cast shadow falls the same way, with the same length and softness as the other shadows, and bends over the surface beneath; a soft contact shadow sits where it touches a surface.
- Nearby coloured surfaces tint it and it tints them; highlights sit where the scene light puts them.
- Light from a donor photo is never carried over.
POSITION — the element lands exactly at Pin 1 ("lamp", Image 1): on the magenta dot drawn there, at the x / y given in the PIN MAP.
- A resting element meets its supporting surface exactly there, footprint centred on the spot. An airborne or floating one has its CENTRE there and no invented ground contact.
- Nearby subjects never pull it aside: they stay put and the element stands on the free surface at the spot itself. Near a frame edge shift it inward only as far as needed to keep it whole.
- A replacement inherits the position, footprint, orientation and facing of what stood there. A moved element appears only at the destination; Pin 1 ("lamp", Image 1) is left empty.
SCALE — true real-world size, judged against something of known size that is visible near the spot (a person, door, window, tile, car).
- Use the size given in SCALE; distance changes how much of the frame it covers, never how big it is. The marked area is a boundary, not a quota: never inflate to fill it or shrink to fit.
- A replacement has its OWN size, never the outline of what it replaces.
- With no anchor nearby choose the smaller plausible size and set it deeper. Show it complete, clear of the frame edge.
PERSPECTIVE — ALWAYS maximally realistic relative to the camera of Image 1: one camera, one viewpoint, one horizon.
- Re-draw the element as that camera sees it: the same camera height, tilt (a high or aerial camera looks DOWN at it and shows its top surfaces; a low camera looks up), focal length and lens distortion. Never keep the viewing angle of its source photo — a front-on or eye-level donor is fully rotated to the target view.
- The element sits on the ground plane at the right distance: its base follows the ground's perspective, its horizontal lines converge to the same vanishing points as the road, walls and ground around it, and its verticals lean exactly like the verticals of the scene.
- Its heading follows the lines of the surface it stands on (along the road, parallel to the wall or shelf), foreshortened correctly for that heading; parts nearer the camera are larger than parts farther away.
- Farther from the camera means smaller and slightly softer, along the same vanishing lines; the horizon line stays where it is.
DEPTH & OCCLUSION — whatever is closer to the camera overlaps the element; it overlaps what is behind it.
- It takes the sharpness, blur and haze of its own depth plane. Partial occlusion by grass, people, railings or leaves is natural; nothing clips through another object or is cut by a straight line.
CONTACT — physical contact stays correct.
- People or animals touching the old element stay 100% intact in their exact pose; the new element supplies its own matching contact part.
- A resting element carries weight: stable footprint, slight sinking or pressed grass, a dark contact line. Nothing floats above its surface or clips into others.
- An airborne or hanging element has no ground contact and stays clear of every other object.
REFLECTION — glossy, wet, metal or glass surfaces of the element reflect the environment of Image 1, never the donor's.
- Mirrors, windows, water and polished surfaces nearby show the element with correct angle and blur; reflections of anything removed disappear with it.
GRAIN & MEDIUM — ALWAYS: the generated object has the SAME GRAIN as the photograph. No sticker look. Never two types of grain or style in one image.
- Match the medium of Image 1 (colour, black-and-white, sepia, faded): the same tonal curve, black point and colour cast.
- ONE grain across the whole frame: the same grain size, density, contrast and softness on the element as on the ground and sky beside it, running continuously across the outline with no seam.
- Match the camera: focus state, lens softness, depth of field, blur, halation and compression. The element is never sharper, smoother, glossier or more contrasty than its surroundings.
- No crisp cut-out edge, halo or CGI sheen. It reads as one photograph, one camera, one exposure.
FIDELITY — this is an editor, not an enhancer.
- Same resolution and aspect ratio as Image 1; no upscaling, denoising, sharpening, brightening or colour correction anywhere. A degraded old photo stays degraded.
- Same camera, focal length and angle. Untouched areas keep their exact exposure, contrast and colour; only the change area may differ.
FRAMING — the result is Image 1 with only the requested change: same shot, field of view, angle and frame edges; everything else stays at the same size and position. No re-composition, rotation, crop or canvas extension.
OUTPUT — the result IS Image 1 with only the requested change, keeping its aspect ratio, resolution, framing and grain. Other images are references for identity or appearance only — never for frame, format, background or light.
- Add nothing and remove nothing the task did not ask for; every other subject keeps its count and position.
- The small magenta pin dots, masks and boxes are guides only: the result shows NO magenta dot, marker, numeral, letter or outline anywhere — the pixels under each dot are rebuilt as the natural surface.
CLEAN PLATE — what leaves the frame leaves without a trace.
- Remove the old element fully at Pin 1 ("lamp", Image 1): the object, its shadow, reflection and contact marks.
- Rebuild what lies behind it (ground, grass, paving, wall, sky) from the neighbourhood, continuing patterns and perspective, matching its brightness, colour and grain so the edge is invisible.
SINGULARITY — the moved, replaced or added element appears EXACTLY ONCE, at the destination. No clone, ghost or leftover anywhere else. Each element has the right number of parts (two eyes, four wheels, five fingers).
OBJECT IDENTITY — it is unmistakably the SAME object: its type, shape, proportions, material, colour, markings and wear are kept, including dust, patina and scratches.
- It is only re-photographed inside this scene: no look-alike substitute, no hybrid. A moved object keeps its form and details.
DONOR ISOLATION — from Image 2 only the identity and appearance of the pinned subject crosses over; its framing, background, light, grading and resolution stay there. The subject is redrawn from the camera angle and in the light of Image 1.
NO COPY-PASTE — re-shoot, do not paste: render the frame as if one camera photographed the scene with the element standing in it from the start.
- Never lift, warp or recolour reference pixels. No seams, hard edges, halo or mismatched sharpness; the edit is impossible to spot.
EDGE & BLEND — fine edges (hair, fur, foliage, glass) stay clean with the scene lens's softness; no halo, fringe or outline. Colour, brightness, grain and sharpness cross the border of the changed area with no visible step.

[OPERATION — OBJECT SWAP]
Replace the object at Pin 1 ("lamp", Image 1) with the new object (taken from Image 2, or as described in the COMMAND). The old object leaves the photograph completely; the new object takes its place.
STEPS:
1. Identify the old object at Pin 1 ("lamp", Image 1) as a whole (see the PIN MAP), not only the part under the pin.
2. Remove it entirely together with its shadow and reflection and rebuild what was behind it (clean plate).
3. Generate the new object from its reference or description at its OWN real size, turned to the camera angle of Image 1.
4. Stand the new object where the old one stood: the same contact point, on the same surface plane, facing the same direction.
5. If a person or animal touched the old object, they stay intact and the new object gets its own equivalent contacting part.
6. Recompute light, shadows and reflections for the shape and material of the new object.

[PIN MAP — each pin is a small magenta dot drawn on its image; x / y = the dot's position in % from the left / top edge of that image]
- Pin 1 · TARGET · Image 1 — "lamp" — dot at x=40%, y=60% — place: on the wooden side table next to the sofa
- Pin 2 · SOURCE · Image 2 — "vase" — dot at x=50%, y=50% — size: height ≈ 35 cm

[SCALE — real-world size]
The vase is about 35 cm tall, roughly a third of the visible door height, so at this distance it is a small element on the table.

[COMMAND — the user's words]
zamień lampę na wazon z drugiego zdjęcia

[FINAL CHECK — verify before returning the image]
- POSITION: the element stands exactly on the destination pin's magenta dot (base of a resting element, centre of an airborne one); no nearby subject has pulled it aside.
- GRAIN: look closely at the changed area — its grain has the same size, density, contrast and sharpness as the ground and sky right beside it; it is not smoother, cleaner, sharper or differently grained, and it does not look like a sticker.
- PERSPECTIVE: the element is seen from exactly the camera height and angle of Image 1, its base follows the ground perspective and its heading follows the surface it stands on — no front-on donor view left over.
- CLEAN: the frame holds only the photographed scene from edge to edge — no magenta dots, numerals, letters, marks or outlines anywhere, including the ground next to the changed area.

[FINAL QUALITY]
- One seamless photograph, indistinguishable from an unedited capture; the edit is impossible to spot. Return only the image.

[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.
```

## 4. Złożony prompt — `object_transfer` w obrębie jednego zdjęcia (17 bricków)

```text
[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.

[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1600×1067 px).

[RULES — 17 rules; all hold at once]
LIGHT — the element is lit exactly like Image 1: same direction, hardness, colour temperature and intensity as its neighbours.
- Its cast shadow falls the same way, with the same length and softness as the other shadows, and bends over the surface beneath; a soft contact shadow sits where it touches a surface.
- Nearby coloured surfaces tint it and it tints them; highlights sit where the scene light puts them.
- Light from a donor photo is never carried over.
POSITION — the element lands exactly at Pin 2 ("path", Image 1): on the magenta dot drawn there, at the x / y given in the PIN MAP.
- A resting element meets its supporting surface exactly there, footprint centred on the spot. An airborne or floating one has its CENTRE there and no invented ground contact.
- Nearby subjects never pull it aside: they stay put and the element stands on the free surface at the spot itself. Near a frame edge shift it inward only as far as needed to keep it whole.
- A replacement inherits the position, footprint, orientation and facing of what stood there. A moved element appears only at the destination; Pin 1 ("cottage", Image 1) is left empty.
SCALE — true real-world size, judged against something of known size that is visible near the spot (a person, door, window, tile, car).
- Use the size given in SCALE; distance changes how much of the frame it covers, never how big it is. The marked area is a boundary, not a quota: never inflate to fill it or shrink to fit.
- A replacement has its OWN size, never the outline of what it replaces.
- With no anchor nearby choose the smaller plausible size and set it deeper. Show it complete, clear of the frame edge.
PERSPECTIVE — ALWAYS maximally realistic relative to the camera of Image 1: one camera, one viewpoint, one horizon.
- Re-draw the element as that camera sees it: the same camera height, tilt (a high or aerial camera looks DOWN at it and shows its top surfaces; a low camera looks up), focal length and lens distortion. Never keep the viewing angle of its source photo — a front-on or eye-level donor is fully rotated to the target view.
- The element sits on the ground plane at the right distance: its base follows the ground's perspective, its horizontal lines converge to the same vanishing points as the road, walls and ground around it, and its verticals lean exactly like the verticals of the scene.
- Its heading follows the lines of the surface it stands on (along the road, parallel to the wall or shelf), foreshortened correctly for that heading; parts nearer the camera are larger than parts farther away.
- Farther from the camera means smaller and slightly softer, along the same vanishing lines; the horizon line stays where it is.
DEPTH & OCCLUSION — whatever is closer to the camera overlaps the element; it overlaps what is behind it.
- It takes the sharpness, blur and haze of its own depth plane. Partial occlusion by grass, people, railings or leaves is natural; nothing clips through another object or is cut by a straight line.
CONTACT — physical contact stays correct.
- People or animals touching the old element stay 100% intact in their exact pose; the new element supplies its own matching contact part.
- A resting element carries weight: stable footprint, slight sinking or pressed grass, a dark contact line. Nothing floats above its surface or clips into others.
- An airborne or hanging element has no ground contact and stays clear of every other object.
REFLECTION — glossy, wet, metal or glass surfaces of the element reflect the environment of Image 1, never the donor's.
- Mirrors, windows, water and polished surfaces nearby show the element with correct angle and blur; reflections of anything removed disappear with it.
GRAIN & MEDIUM — ALWAYS: the generated object has the SAME GRAIN as the photograph. No sticker look. Never two types of grain or style in one image.
- Match the medium of Image 1 (colour, black-and-white, sepia, faded): the same tonal curve, black point and colour cast.
- ONE grain across the whole frame: the same grain size, density, contrast and softness on the element as on the ground and sky beside it, running continuously across the outline with no seam.
- Match the camera: focus state, lens softness, depth of field, blur, halation and compression. The element is never sharper, smoother, glossier or more contrasty than its surroundings.
- No crisp cut-out edge, halo or CGI sheen. It reads as one photograph, one camera, one exposure.
FIDELITY — this is an editor, not an enhancer.
- Same resolution and aspect ratio as Image 1; no upscaling, denoising, sharpening, brightening or colour correction anywhere. A degraded old photo stays degraded.
- Same camera, focal length and angle. Untouched areas keep their exact exposure, contrast and colour; only the change area may differ.
FRAMING — the result is Image 1 with only the requested change: same shot, field of view, angle and frame edges; everything else stays at the same size and position. No re-composition, rotation, crop or canvas extension.
OUTPUT — the result IS Image 1 with only the requested change, keeping its aspect ratio, resolution, framing and grain. Other images are references for identity or appearance only — never for frame, format, background or light.
- Add nothing and remove nothing the task did not ask for; every other subject keeps its count and position.
- The small magenta pin dots, masks and boxes are guides only: the result shows NO magenta dot, marker, numeral, letter or outline anywhere — the pixels under each dot are rebuilt as the natural surface.
CLEAN PLATE — what leaves the frame leaves without a trace.
- Remove the old element fully at Pin 1 ("cottage", Image 1): the object, its shadow, reflection and contact marks.
- Rebuild what lies behind it (ground, grass, paving, wall, sky) from the neighbourhood, continuing patterns and perspective, matching its brightness, colour and grain so the edge is invisible.
SINGULARITY — the moved, replaced or added element appears EXACTLY ONCE, at the destination. No clone, ghost or leftover anywhere else. Each element has the right number of parts (two eyes, four wheels, five fingers).
OBJECT IDENTITY — it is unmistakably the SAME object: its type, shape, proportions, material, colour, markings and wear are kept, including dust, patina and scratches.
- It is only re-photographed inside this scene: no look-alike substitute, no hybrid. A moved object keeps its form and details.
DONOR ISOLATION — from the reference described in the COMMAND only the identity and appearance of the pinned subject crosses over; its framing, background, light, grading and resolution stay there. The subject is redrawn from the camera angle and in the light of Image 1.
NO COPY-PASTE — re-shoot, do not paste: render the frame as if one camera photographed the scene with the element standing in it from the start.
- Never lift, warp or recolour reference pixels. No seams, hard edges, halo or mismatched sharpness; the edit is impossible to spot.
EDGE & BLEND — fine edges (hair, fur, foliage, glass) stay clean with the scene lens's softness; no halo, fringe or outline. Colour, brightness, grain and sharpness cross the border of the changed area with no visible step.

[OPERATION — OBJECT TRANSFER]
Move the object at Pin 1 ("cottage", Image 1) to the destination Pin 2 ("path", Image 1). This is a relocation, not a copy: the same object changes position and appears exactly once, at the destination.
STEPS:
1. The object keeps its identity and surface condition: the same form, material, colour, dust, patina and details.
2. If the source pin lies in Image 1, restore a clean plate there: rebuild ground, vegetation and patterns as if the object had never stood there. If it lies in another image, only the object comes across from it.
3. Adapt the object to the new position: perspective, angle and scale follow the destination — farther from the camera means smaller along the same vanishing lines, closer means larger and sharper (an object moved from the distance to the foreground grows accordingly).
4. Set it at the destination pin: on the ground with a stable natural footprint and its own new contact shadow — or, for an airborne or floating object, with its centre at the marked spot and no invented ground contact.
5. Its old cast shadow and reflection leave together with it.
6. People in contact with the object are never cut or erased: their contact adapts naturally.

[PIN MAP — each pin is a small magenta dot drawn on its image; x / y = the dot's position in % from the left / top edge of that image]
- Pin 1 · SOURCE · Image 1 — "cottage" — dot at x=50%, y=30% — place: on the far meadow below the tree line
- Pin 2 · TARGET · Image 1 — "path" — dot at x=50%, y=80% — place: on the dirt path in the foreground

[SCALE — real-world size]
The cottage is about 6 m wide; moved into the foreground it covers a larger share of the frame but keeps its real size.

[COMMAND — the user's words]
przenieś chatkę bliżej

[FINAL CHECK — verify before returning the image]
- POSITION: the element stands exactly on the destination pin's magenta dot (base of a resting element, centre of an airborne one); no nearby subject has pulled it aside.
- GRAIN: look closely at the changed area — its grain has the same size, density, contrast and sharpness as the ground and sky right beside it; it is not smoother, cleaner, sharper or differently grained, and it does not look like a sticker.
- PERSPECTIVE: the element is seen from exactly the camera height and angle of Image 1, its base follows the ground perspective and its heading follows the surface it stands on — no front-on donor view left over.
- CLEAN: the frame holds only the photographed scene from edge to edge — no magenta dots, numerals, letters, marks or outlines anywhere, including the ground next to the changed area.

[FINAL QUALITY]
- One seamless photograph, indistinguishable from an unedited capture; the edit is impossible to spot. Return only the image.

[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.
```
