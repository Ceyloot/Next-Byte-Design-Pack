import type { Operation } from '../types'

/** Przeniesienie TEGO SAMEGO obiektu w inne miejsce (to samo lub inne zdjęcie). */
export const OBJECT_TRANSFER: Operation = {
  id: 'object_transfer',
  nazwa: 'Przenieś obiekt',
  kiedyUzyc:
    'The SAME object is carried to another place: brought from a donor photo into the target photo (put this car / this cottage here), or moved inside the target photo (move it closer, put it there). The object keeps its identity and true proportions; nothing else changes. Polish triggers: przenieś / przesuń / wstaw ten obiekt z drugiego zdjęcia tutaj / daj to tam / ma być tu / przybliż / oddal.',
  bricks: [
    'studio-referencja',
    'studio-miejsce',
    'studio-scena',
    'studio-jedno-zdjecie',
    'studio-kontrola',
    'studio-usuniecie',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: true,
  misja: `Generate the object shown at {{PIN_SOURCE}} from zero inside Image 1, standing exactly at the x / y point of {{PIN_TARGET}} with its real proportions, as if it had been in this scene when the photo was taken — never a copy of the reference picture. It appears exactly once. ADD, never replace: every object already in Image 1 stays exactly where it is — including one that looks similar to the new object (another car, another chair); the new object is an extra one standing on the free spot at the x / y point (the middle of its footprint exactly there), not a substitute for anything. It keeps its exact design (same style, shape, roof or body, materials and colours) — never a different model of the same kind. If {{PIN_SOURCE}} lies in Image 1, the object LEAVES that spot: the old spot becomes empty, naturally rebuilt ground, and the object appears only at {{PIN_TARGET}}, a different place — it never stays, grows or is redrawn where it was.`,
  kroki: [
    `Take the object WHOLE (not only the part under its pin) and keep its identity: shape, real 3D proportions (length, width and height relate exactly as in reality), material, colour, markings and surface condition. Its 2D silhouette is NOT kept: it is re-rendered as the target camera sees it at its new heading, so the visible faces and outline differ from the donor photo whenever the camera or heading differs.`,
    `Set its size by the real world, not by the donor photo: judge it against neighbours of known size at the destination (see SCALE) — a framing that fills the donor photo says nothing about how large it is here. Farther from the camera means smaller along the same vanishing lines, closer means larger.`,
    `Turn it to the camera of {{IMAGE_TARGET}} and stand it on the destination spot: footprint centred there, on the same surface plane, heading along the lines of that surface — or, for an airborne object, with its centre there.`,
    `If the source pin lies in {{IMAGE_TARGET}}, restore a clean plate there, as if the object had never stood at the old spot; if it lies in another image, only the object comes across and that photo is left out of the result.`,
    `Everything else in {{IMAGE_TARGET}} stays exactly as it is.`,
  ],
}
