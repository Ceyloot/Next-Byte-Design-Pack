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

## 3. Złożony prompt — `object_swap` (0 bricków, bricki ≈ 639 tokenów)

```text
[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.

[TASK]
Replace the object at Pin 1 ("lamp", Image 1) with the object from Pin 2 ("vase", Image 2), keeping perfect proportions and making it look as natural as possible. The old object leaves completely (with its shadow and reflection); the new one takes its place, orientation and footing.

[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1200×800 px).
Image 2 = DONOR (reference). It supplies only the identity or appearance of its pinned subject.
Last image = MASK of the work area (white = where the change happens, black = untouched). It is a guide only — not a reference and not part of the result.

[PIN MAP — each pin is a small magenta dot drawn on its image; x / y = the dot's position in % from the left / top edge of that image]
- Pin 1 · TARGET · Image 1 — "lamp" — dot at x=40%, y=60% — place: on the wooden side table next to the sofa
- Pin 2 · SOURCE · Image 2 — "vase" — dot at x=50%, y=50% — size: height ≈ 35 cm

[SCALE — real-world size]
The vase is about 35 cm tall, roughly a third of the visible door height, so at this distance it is a small element on the table.

[COMMAND — the user's words]
zamień lampę na wazon z drugiego zdjęcia

[ABSOLUTE RULES — FOLLOW ALWAYS]
- ONE photograph captured in-camera, not a composite: subject(s) from the references and the new environment photographed together, same camera, same moment. Relight and color-grade the subject(s) to the destination scene: same light direction, color temperature, softness, white balance, exposure and contrast. Match focal length, eye level, horizon and lens distortion; render true contact shadows, ambient occlusion and ground reflections where the subject touches surfaces. Unified film grain, sensor noise and depth of field — no halos, cut-out edges, sticker look or double lighting.
- RE-LIGHT AND RE-SHOOT THE ELEMENT INTO THE SCENE — this decides the shot. Discard the reference lighting completely; it is an identity document, not a look. Copy from the scene onto the element: key-light direction, height and color temperature, fill level, ambient bounce color, rim light, contrast ratio and shadow density, and every warm or cool cast that falls on the objects elsewhere in the frame. Add the shadows that lighting implies: modelling shadows on the element, contact shadow where it meets the ground, and a cast shadow of correct direction, length, softness and opacity. MATCH THE CAMERA: same distance from the lens, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on the element. If the scene has motion blur, camera shake or panning streaks, the element MUST carry the same blur, same direction, same amount. NEVER render the element sharper than the scene. MATCH THE FILM: same white balance, grade, black level, highlight rolloff, saturation, grain size and strength, vignetting, chromatic aberration, flare, glow and atmospheric haze over the element as over the background. Edges must be photographic: no halo, no outline, no crisp silhouette against a soft background, no brightness step between the element and the scene.
- PHOTOGRAPHIC QUALITY: magazine-cover quality photograph with crisp micro-detail on the main subject. Background depth-of-field, bokeh, motion blur, atmospheric haze and any intentionally out-of-focus areas MUST be preserved — never force sharpness across the whole frame.
- The result is Image 1 with only the requested change: same framing, format and resolution, every untouched pixel unchanged, and ALL text, watermarks, logos and signs reproduced exactly. The small magenta pin dots are guides only — no magenta dot, numeral or marker appears in the result. Render the element at its TRUE real-world scale, in perfect proportion to the scene.

[FINAL CHECK]
FINAL CHECK: is the element lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? Is it exactly at the marked spot? If not, redo. ONE photograph — one light, one lens, one grade.
- CLEAN: the frame holds only the photographed scene from edge to edge — no magenta dots, numerals, letters, marks or outlines anywhere, including the ground next to the changed area.

[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.
```

## 4. Złożony prompt — `object_transfer` w obrębie jednego zdjęcia (0 bricków)

```text
[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.

[TASK]
Move the object from Pin 1 ("cottage", Image 1) to Pin 2 ("path", Image 1), keeping perfect proportions and making it look as natural as possible. It is the same object, it appears exactly once at the destination, and the old spot is rebuilt as if it had never stood there.

[IMAGES — sent in this order]
Image 1 = TARGET (destination). The result is this photograph with only the requested change. Output format: exactly the aspect ratio and framing of this image (1600×1067 px).

[PIN MAP — each pin is a small magenta dot drawn on its image; x / y = the dot's position in % from the left / top edge of that image]
- Pin 1 · SOURCE · Image 1 — "cottage" — dot at x=50%, y=30% — place: on the far meadow below the tree line
- Pin 2 · TARGET · Image 1 — "path" — dot at x=50%, y=80% — place: on the dirt path in the foreground

[SCALE — real-world size]
The cottage is about 6 m wide; moved into the foreground it covers a larger share of the frame but keeps its real size.

[COMMAND — the user's words]
przenieś chatkę bliżej

[ABSOLUTE RULES — FOLLOW ALWAYS]
- ONE photograph captured in-camera, not a composite: subject(s) from the references and the new environment photographed together, same camera, same moment. Relight and color-grade the subject(s) to the destination scene: same light direction, color temperature, softness, white balance, exposure and contrast. Match focal length, eye level, horizon and lens distortion; render true contact shadows, ambient occlusion and ground reflections where the subject touches surfaces. Unified film grain, sensor noise and depth of field — no halos, cut-out edges, sticker look or double lighting.
- RE-LIGHT AND RE-SHOOT THE ELEMENT INTO THE SCENE — this decides the shot. Discard the reference lighting completely; it is an identity document, not a look. Copy from the scene onto the element: key-light direction, height and color temperature, fill level, ambient bounce color, rim light, contrast ratio and shadow density, and every warm or cool cast that falls on the objects elsewhere in the frame. Add the shadows that lighting implies: modelling shadows on the element, contact shadow where it meets the ground, and a cast shadow of correct direction, length, softness and opacity. MATCH THE CAMERA: same distance from the lens, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on the element. If the scene has motion blur, camera shake or panning streaks, the element MUST carry the same blur, same direction, same amount. NEVER render the element sharper than the scene. MATCH THE FILM: same white balance, grade, black level, highlight rolloff, saturation, grain size and strength, vignetting, chromatic aberration, flare, glow and atmospheric haze over the element as over the background. Edges must be photographic: no halo, no outline, no crisp silhouette against a soft background, no brightness step between the element and the scene.
- PHOTOGRAPHIC QUALITY: magazine-cover quality photograph with crisp micro-detail on the main subject. Background depth-of-field, bokeh, motion blur, atmospheric haze and any intentionally out-of-focus areas MUST be preserved — never force sharpness across the whole frame.
- The result is Image 1 with only the requested change: same framing, format and resolution, every untouched pixel unchanged, and ALL text, watermarks, logos and signs reproduced exactly. The small magenta pin dots are guides only — no magenta dot, numeral or marker appears in the result. Render the element at its TRUE real-world scale, in perfect proportion to the scene.

[FINAL CHECK]
FINAL CHECK: is the element lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? Is it exactly at the marked spot? If not, redo. ONE photograph — one light, one lens, one grade.
- CLEAN: the frame holds only the photographed scene from edge to edge — no magenta dots, numerals, letters, marks or outlines anywhere, including the ground next to the changed area.

[ALWAYS — NON-NEGOTIABLE]
ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.
```
