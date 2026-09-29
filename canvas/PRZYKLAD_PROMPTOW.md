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
- object_transfer: The SAME object is carried to another place: brought from a donor photo into the target photo (put this car / this cottage here), or moved inside the target photo (move it closer, put it there). The object keeps its identity and true proportions; nothing else changes. Polish triggers: przenieś / przesuń / wstaw ten obiekt z drugiego zdjęcia tutaj / daj to tam / ma być tu / przybliż / oddal.
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

## 3. Złożony prompt — `object_swap` (17 bricków, bricki ≈ 942 tokenów)

```text
ALWAYS: the generated object has the SAME GRAIN as the photograph (size, density, contrast, sharpness, colour) — no sticker look, never two kinds of grain or style in one image.

[TASK]
Replace the whole object at the magenta dot of Pin 1 ("lamp", Image 1) with the whole new object (from Image 2, or as described in the COMMAND), at its true size and as naturally as possible. The old object leaves completely; the new one stands exactly where it stood.

[IMAGES]
Image 1 = the SCENE: the result is this photograph (1200×800 px, same framing) with only the requested change.
Image 2 = REFERENCE: supplies only the identity of its pinned subject.
Last image = MASK of the work area (white = change, black = untouched); a guide only.

[PINS — small magenta dots on the images; x / y in % from the left / top edge]
- Pin 1 (target) · Image 1 "lamp" — magenta dot at x=40%, y=60% ← THE GENERATED OBJECT MUST STAND EXACTLY HERE — place: on the wooden side table next to the sofa
- Pin 2 (source) · Image 2 "vase" — magenta dot at x=50%, y=50% — size: height ≈ 35 cm

[SCALE]
The vase is about 35 cm tall, roughly a third of the visible door height, so at this distance it is a small element on the table.

[COMMAND]
zamień lampę na wazon z drugiego zdjęcia

[RULES — all hold at once]
LIGHT — lit exactly like Image 1: same direction, hardness, colour temperature and intensity as its neighbours; its cast and contact shadows fall the way the scene's shadows do (direction, length, softness); colour bounces both ways. Reference-photo light never carries over.
POSITION — the element stands EXACTLY ON THE MAGENTA DOT of Pin 1 ("lamp", Image 1) (x / y in PINS): a resting element with its base and footprint centred on the dot, an airborne one with its centre there. Neighbours never pull it aside. A replacement inherits the position, footprint and heading of what stood there; a moved element appears only there and its old spot is left empty.
SCALE — true real-world size, judged against known-size things near the spot (see SCALE). Distance changes the share of the frame, never the real size; never inflate to fill an area or shrink to fit. Show it complete, inside the frame.
PERSPECTIVE — drawn from the camera of Image 1: same height, tilt and focal length (a high camera looks down and shows top surfaces). Its base follows the ground perspective, its lines meet the scene's vanishing points, its heading follows the surface it stands on; farther means smaller and softer. Never the viewing angle of its source photo.
DEPTH — closer things overlap it and it overlaps what is behind; it takes the sharpness and haze of its depth plane; occlusion is natural and nothing clips through it.
CONTACT — it carries weight: footprint, slight sinking or pressed grass, a dark contact line. People or animals touching the old element stay intact and keep their pose. An airborne element has no ground contact.
REFLECTION — glossy, wet or glass surfaces reflect the environment of Image 1; mirrors and water nearby show the element; reflections of removed things disappear with them.
GRAIN & MEDIUM — ONE grain across the frame: the element has the same grain size, density, contrast, softness, tonal curve, colour cast, focus and blur as the photograph — never sharper, smoother or glossier than its surroundings, no halo or cut-out edge, no sticker look.
FIDELITY — an editor, not an enhancer: same resolution and aspect as Image 1; nothing is denoised, sharpened, brightened or colour-corrected; untouched areas keep their exact exposure, contrast and colour.
FRAMING — the result is Image 1 with only the requested change: same shot, angle and frame edges; everything else keeps its size and position.
OUTPUT — the result IS Image 1 with only the requested change; other images give identity only. Add and remove nothing else. Magenta dots, masks and boxes are guides: none appears in the result, and the pixels under a dot are natural surface.
CLEAN PLATE — the old element leaves at Pin 1 ("lamp", Image 1) with its shadow and reflection; rebuild what was behind it from the surroundings (patterns, perspective, brightness, grain).
SINGULARITY — the element appears exactly once, at the destination; no clone, ghost or leftover; every part in its right number.
OBJECT IDENTITY — the SAME object: type, shape, real 3D proportions, material, colour, markings and wear are kept; it is re-photographed for this scene (new view, light and shadow), never a look-alike or hybrid.
REFERENCE ISOLATION — from Image 2 only the identity of the pinned subject crosses over; its framing, viewing angle, background, light, shadows and grading stay there.
NO COPY-PASTE — re-shoot, never paste: render one photograph, one camera, one exposure. A silhouette that matches the reference although the camera or heading differs is a paste; shadows are cast anew by the scene light.
EDGES — fine edges stay clean at the scene lens's softness, with no halo or fringe; colour, brightness and grain cross the border of the change without a step.

[FINAL CHECK]
- POSITION: the generated object stands exactly on the magenta dot at x=40%, y=60% of Image 1 (base of a resting object, centre of an airborne one).
- ONE PHOTOGRAPH: grain, sharpness, light, shadow and viewing angle of the changed area belong to Image 1's camera — it does not look pasted or like a sticker.
- CLEAN: no magenta dots, marks or text anywhere in the frame.
```

## 4. Złożony prompt — `object_transfer` w obrębie jednego zdjęcia (17 bricków)

```text
ALWAYS: the generated object has the SAME GRAIN as the photograph (size, density, contrast, sharpness, colour) — no sticker look, never two kinds of grain or style in one image.

[TASK]
Move the whole object from Pin 1 ("cottage", Image 1) so that it stands exactly on the magenta dot of Pin 2 ("path", Image 1), keeping its real proportions and looking as natural as possible. It is the same object, re-photographed in this scene, and it appears exactly once.

[IMAGES]
Image 1 = the SCENE: the result is this photograph (1600×1067 px, same framing) with only the requested change.

[PINS — small magenta dots on the images; x / y in % from the left / top edge]
- Pin 1 (source) · Image 1 "cottage" — no dot — the object is at x=50%, y=30% — place: on the far meadow below the tree line
- Pin 2 (target) · Image 1 "path" — magenta dot at x=50%, y=80% ← THE GENERATED OBJECT MUST STAND EXACTLY HERE — place: on the dirt path in the foreground

[SCALE]
The cottage is about 6 m wide; moved into the foreground it covers a larger share of the frame but keeps its real size.

[COMMAND]
przenieś chatkę bliżej

[RULES — all hold at once]
LIGHT — lit exactly like Image 1: same direction, hardness, colour temperature and intensity as its neighbours; its cast and contact shadows fall the way the scene's shadows do (direction, length, softness); colour bounces both ways. Reference-photo light never carries over.
POSITION — the element stands EXACTLY ON THE MAGENTA DOT of Pin 2 ("path", Image 1) (x / y in PINS): a resting element with its base and footprint centred on the dot, an airborne one with its centre there. Neighbours never pull it aside. A replacement inherits the position, footprint and heading of what stood there; a moved element appears only there and its old spot is left empty.
SCALE — true real-world size, judged against known-size things near the spot (see SCALE). Distance changes the share of the frame, never the real size; never inflate to fill an area or shrink to fit. Show it complete, inside the frame.
PERSPECTIVE — drawn from the camera of Image 1: same height, tilt and focal length (a high camera looks down and shows top surfaces). Its base follows the ground perspective, its lines meet the scene's vanishing points, its heading follows the surface it stands on; farther means smaller and softer. Never the viewing angle of its source photo.
DEPTH — closer things overlap it and it overlaps what is behind; it takes the sharpness and haze of its depth plane; occlusion is natural and nothing clips through it.
CONTACT — it carries weight: footprint, slight sinking or pressed grass, a dark contact line. People or animals touching the old element stay intact and keep their pose. An airborne element has no ground contact.
REFLECTION — glossy, wet or glass surfaces reflect the environment of Image 1; mirrors and water nearby show the element; reflections of removed things disappear with them.
GRAIN & MEDIUM — ONE grain across the frame: the element has the same grain size, density, contrast, softness, tonal curve, colour cast, focus and blur as the photograph — never sharper, smoother or glossier than its surroundings, no halo or cut-out edge, no sticker look.
FIDELITY — an editor, not an enhancer: same resolution and aspect as Image 1; nothing is denoised, sharpened, brightened or colour-corrected; untouched areas keep their exact exposure, contrast and colour.
FRAMING — the result is Image 1 with only the requested change: same shot, angle and frame edges; everything else keeps its size and position.
OUTPUT — the result IS Image 1 with only the requested change; other images give identity only. Add and remove nothing else. Magenta dots, masks and boxes are guides: none appears in the result, and the pixels under a dot are natural surface.
CLEAN PLATE — the old element leaves at Pin 1 ("cottage", Image 1) with its shadow and reflection; rebuild what was behind it from the surroundings (patterns, perspective, brightness, grain).
SINGULARITY — the element appears exactly once, at the destination; no clone, ghost or leftover; every part in its right number.
OBJECT IDENTITY — the SAME object: type, shape, real 3D proportions, material, colour, markings and wear are kept; it is re-photographed for this scene (new view, light and shadow), never a look-alike or hybrid.
REFERENCE ISOLATION — from the reference described in the COMMAND only the identity of the pinned subject crosses over; its framing, viewing angle, background, light, shadows and grading stay there.
NO COPY-PASTE — re-shoot, never paste: render one photograph, one camera, one exposure. A silhouette that matches the reference although the camera or heading differs is a paste; shadows are cast anew by the scene light.
EDGES — fine edges stay clean at the scene lens's softness, with no halo or fringe; colour, brightness and grain cross the border of the change without a step.

[FINAL CHECK]
- POSITION: the generated object stands exactly on the magenta dot at x=50%, y=80% of Image 1 (base of a resting object, centre of an airborne one).
- ONE PHOTOGRAPH: grain, sharpness, light, shadow and viewing angle of the changed area belong to Image 1's camera — it does not look pasted or like a sticker.
- CLEAN: no magenta dots, marks or text anywhere in the frame.
```
