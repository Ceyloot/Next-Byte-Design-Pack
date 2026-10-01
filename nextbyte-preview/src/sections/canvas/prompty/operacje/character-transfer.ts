import type { Operation } from '../types'

/** Przeniesienie TEJ SAMEJ osoby w inne miejsce / na inne zdjęcie. */
export const CHARACTER_TRANSFER: Operation = {
  id: 'character_transfer',
  nazwa: 'Przenieś postać',
  kiedyUzyc:
    'The SAME person is moved to another place in the photo, or brought from another photo into the target photo; identity and clothing are kept, the pose adapts to the new ground. Polish triggers: przenieś tę osobę / postać / postaw tę osobę tutaj / dodaj tę osobę do zdjęcia.',
  bricks: [
    'studio-referencja',
    'studio-miejsce',
    'studio-scena',
    'studio-jedno-zdjecie',
    'studio-kontrola',
    'studio-usuniecie',
    'studio-czlowiek',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: true,
  misja: `Bring the person shown at {{PIN_SOURCE}} into {{IMAGE_TARGET}} and put them at {{PIN_TARGET}}, keeping their identity and clothing. Their face is exactly the face from the reference — same features, proportions and expression lines, never a similar-looking person. They appear exactly once, at the destination, as a COMPLETE person: if the reference shows only part of their body, build the rest (torso, legs, feet, hands) naturally, in the same outfit and body proportions, standing on the ground of {{IMAGE_TARGET}} with their feet touching it; whatever an object in front of them hides stays hidden by that object, and nothing of the person is cut off by an invisible edge. Their pose adapts to the place: natural, balanced, weight carried by the legs. If the USER request relates them to an object (leans on, sits on, stands next to, holds, touches), they do exactly that, with real contact — the body touches the object and is supported by it — and the object itself stays unchanged with all its parts (glass, window, frame, handle). Their size follows the perspective of {{IMAGE_TARGET}}: farther from the camera means smaller along the same vanishing lines. They belong to the photograph's focus and light: the same sharpness or blur as the things at their distance, the same grain, colour and light direction, a contact shadow under their feet and a cast shadow where the scene's shadows fall — never crisper, brighter or cleaner than their surroundings.`,
  kroki: [
    `Keep identity, hair, body and the exact outfit of the person; only place, pose adaptation, size and light change.`,
    `Adapt the pose to the new ground: standing on level ground, sitting on the seat that is there, stepping on the stairs that are there — natural, balanced, weight on the right leg.`,
    `If the source pin lies in {{IMAGE_TARGET}}, rebuild a clean plate at the old spot; if it lies in another image, only the person comes across.`,
    `Fit their size to the destination: farther from the camera means smaller along the same vanishing lines.`,
    `Follow how the USER request relates them to their surroundings (leans on, sits on, stands next to, holds): they do exactly that, with real contact — feet on the ground or seat, weight carried — and the neighbouring object is not changed.`,
    `Give them a contact shadow and a cast shadow in the light of the scene.`,
  ],
}
