/**
 * Przeniesienie / zamiana obiektu w obrębie JEDNEGO zdjęcia (dwie pineski) — w dwóch zadaniach modelu:
 *   1) DODAJ kopię obiektu w nowym miejscu (oryginału nie ruszamy — model radzi sobie z samym dodawaniem),
 *   2) USUŃ oryginał ze starego miejsca (osobne, proste zadanie).
 * Prompty są czysto opisowe: bez numerów pinesek, za to z opisem rzeczy, położeniem słowami i współrzędnymi.
 * Używane tylko, gdy włączona jest flaga PRZENIESIENIE_DWA_ZADANIA w CanvasSection.
 */

export interface MiejsceOpis {
  x: number
  y: number
  /** krótka nazwa rzeczy / miejsca */
  nazwa: string
  /** szczegółowy opis (od reżysera / z wycinka), EN */
  opis?: string
}

export interface DwaKrokiWejscie {
  zrodlo: MiejsceOpis
  cel: MiejsceOpis
  /** zamiana: obiekt zajmuje miejsce tego, co stoi na celu */
  zamiana?: boolean
  swiatlo?: string
  rozmiar?: string
  zblizenia?: { numer: number; opis: string }[]
}

export function polozenieSlowami(x: number, y: number): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  return `${pion} and ${poziom} of the frame, ${Math.round(x * 100)}% from the left edge and ${Math.round(y * 100)}% down from the top (x=${x.toFixed(2)}, y=${y.toFixed(2)})`
}

const czysc = (t?: string) => (t ?? '').trim().replace(/\.+$/, '')
const zdanie = (...c: (string | undefined)[]) => c.map(czysc).filter(Boolean).join('. ')

const CALOSC =
  'Everything else stays exactly as it is in Image 1: the same colours, white balance, grade, grain, sharpness, light, crop, framing, every other object and all text.'

/** Zadanie 1: dodaj obiekt w nowym miejscu, oryginał zostaje. */
export function promptKrok1(w: DwaKrokiWejscie): string {
  const { zrodlo, cel } = w
  const zbl = w.zblizenia?.length
    ? `Enlarged crops of Image 1 are attached only to show exact detail: ${w.zblizenia.map((z) => `Image ${z.numer} = ${z.opis}`).join('; ')}. They are never extra things to put into the result.`
    : ''
  return [
    `[TASK]`,
    `Edit Image 1: ADD one more ${czysc(zrodlo.nazwa) || 'object'}, identical to the one that already stands ${polozenieSlowami(zrodlo.x, zrodlo.y)}, at another spot. In this step the original is left exactly where it is — do not remove, move or change it.`,
    `THE OBJECT TO REPRODUCE: ${zdanie(zrodlo.nazwa, zrodlo.opis)}. Copy it EXACTLY — every part, shape, proportion, material, colour and detail as it looks in Image 1; never turn it into a different object of the same kind. Only its size and angle of view adapt to the new spot.`,
    `WHERE THE COPY GOES: ${polozenieSlowami(cel.x, cel.y)}${cel.opis || cel.nazwa ? ` — ${zdanie(cel.nazwa, cel.opis)}` : ''}. ${w.zamiana ? 'It takes exactly the place of what stands there now, which is removed completely. ' : ''}The middle of its footprint lands exactly on that x / y spot, in that very part of the frame — never beside it, never nearer the centre; if there is too little room it is made smaller or the ground shaped. It stands logically on the real surface, upright, following the ground and the scene's lines, scaled for its distance from the camera and seen from Image 1's camera, never floating, sunk or passing through other things.`,
    w.rozmiar ? w.rozmiar : '',
    w.swiatlo ? `LIGHT OF IMAGE 1 (the copy is lit exactly like this, with a contact shadow and a cast shadow like the scene's): ${w.swiatlo}` : `The copy is lit exactly like the scene, with a contact shadow and a cast shadow like the scene's.`,
    zbl,
    CALOSC,
  ].filter(Boolean).join('\n')
}

/** Zadanie 2: usuń oryginał ze starego miejsca. */
export function promptKrok2(w: DwaKrokiWejscie): string {
  const { zrodlo, cel } = w
  return [
    `[TASK]`,
    `Edit Image 1: REMOVE the ${czysc(zrodlo.nazwa) || 'object'} that stands ${polozenieSlowami(zrodlo.x, zrodlo.y)}${zrodlo.opis ? ` — ${czysc(zrodlo.opis)}` : ''}.`,
    `Delete it completely: not a single part of it remains. Rebuild that spot with what would naturally be there without it (ground, grass, wall, trees, sky), continuing the surrounding texture and light, and smooth the background around it so nobody could tell anything ever stood there.`,
    `Only the one at that position is removed. An identical object now stands ${polozenieSlowami(cel.x, cel.y)} — it STAYS exactly as it is. If nothing of that kind stands at the first position any more, change nothing.`,
    CALOSC,
  ].join('\n')
}

/** Jeden przebieg (inny model): opisowo „usuń z miejsca A i postaw w miejscu B”, bez numerów pinesek. */
export function promptJedenPrzebieg(w: DwaKrokiWejscie): string {
  const { zrodlo, cel } = w
  const zbl = w.zblizenia?.length
    ? `Enlarged crops of Image 1 are attached only to show exact detail: ${w.zblizenia.map((z) => `Image ${z.numer} = ${z.opis}`).join('; ')}. They are never extra things to put into the result.`
    : ''
  return [
    `[TASK]`,
    `Edit Image 1: MOVE one object from one spot to another — the result shows it ONCE, at the new spot only.`,
    `1. TAKE IT AWAY: the ${czysc(zrodlo.nazwa) || 'object'} that stands ${polozenieSlowami(zrodlo.x, zrodlo.y)}${zrodlo.opis ? ` — ${czysc(zrodlo.opis)}` : ''}. Delete it completely from there: not a single part remains. Rebuild that spot with what would naturally be there without it (ground, grass, wall, trees, sky), continuing the surrounding texture and light, and smooth the background around it.`,
    `2. SET IT DOWN: exactly the same object — every part, shape, proportion, material, colour and detail as it looks in Image 1, never a different object of the same kind — ${polozenieSlowami(cel.x, cel.y)}${cel.opis || cel.nazwa ? ` (${zdanie(cel.nazwa, cel.opis)})` : ''}. ${w.zamiana ? 'It takes exactly the place of what stands there now, which is removed completely. ' : ''}The middle of its footprint lands exactly on that x / y spot, in that very part of the frame — never beside it, never nearer the centre; if there is too little room it is made smaller or the ground shaped. It stands logically on the real surface, upright, following the ground and the scene's lines, scaled for its distance from the camera and seen from Image 1's camera, never floating, sunk or passing through other things.`,
    w.rozmiar ? w.rozmiar : '',
    w.swiatlo ? `LIGHT OF IMAGE 1 (the object is lit exactly like this, with a contact shadow and a cast shadow like the scene's): ${w.swiatlo}` : `The object is lit exactly like the scene, with a contact shadow and a cast shadow like the scene's.`,
    zbl,
    CALOSC,
  ].filter(Boolean).join('\n')
}
