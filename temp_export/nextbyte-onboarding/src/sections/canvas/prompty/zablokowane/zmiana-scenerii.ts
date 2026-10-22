/**
 * ZABLOKOWANE — ZMIANA SCENERII / TŁA (SCENERY CHANGE): zostaje pierwszy plan, wymieniane całe otoczenie.
 * „Póki co” zamrożone na życzenie użytkownika. NIE ZMIENIAĆ bez jego wyraźnej prośby. Teksty są kopiami —
 * zmiany we wspólnych brickach ani w skladaj.ts nie wpływają na ten tryb. Zablokowane też: pole `pierwszy_plan`
 * od reżysera, brak światła sceny docelowej, mapy pinesek i bricków w [RULES], model Gemini 3.1 (`gemini31`).
 */
export const ZABLOKOWANA_TEMPERATURA_SCENERII = 0.35

/** Rola modelu (systemPrompt). */
export const ZABLOKOWANY_SYSTEM_SCENERII = `You are a high-end photographic compositor, not a copy-paste editor. You never cut out, paste, sticker or overlay a reference object into a plate. You RE-PHOTOGRAPH the object inside the target photograph: one exposure, one light set, one lens, one sensor, one color grade for the whole frame. Everything the edit does not touch stays as it was.`

/** Zadanie [TASK]; `dawca` = numer zdjęcia z nowym miejscem (brak = miejsce z opisu w poleceniu). */
export function zablokowaneZadanieScenerii(dawca: number | undefined): string {
  const zrodloMiejsca = dawca ? `Image ${dawca}` : 'the place described in the USER request'
  return [
      `SCENERY CHANGE: replace the WHOLE surroundings of Image 1 — its location, ground, buildings, vegetation, sky, weather and light — with the place ${dawca ? `shown in ${zrodloMiejsca}` : 'described in the USER request'}.`,
      dawca ? `Image 1 = the photograph whose subjects stay. Image ${dawca} = the new place.` : `Image 1 = the photograph whose subjects stay.`,
  ].join('\n')
}

/** Reguły [RULES]; `pierwszyPlan` = opis tego, co zostaje (od reżysera). */
export function zablokowaneRegulyScenerii(pierwszyPlan: string | undefined): string[] {
  const w = { pierwszyPlan }
  return [
        `THE NEW PLACE: take its location only — ground, buildings, vegetation, sky, weather, atmosphere and light — never the subjects standing in it, and never its pixels: build it anew, as one photograph, from Image 1's camera height, lens and framing.`,
        `THE SUBJECTS OF IMAGE 1 STAY EXACTLY: ${w.pierwszyPlan?.trim() || 'the main subjects of Image 1'} keep their position, size, pose, shape, colours and details, and any graphics or text laid over the picture stays exactly where and as it is.`,
        `Nothing of the old surroundings survives behind or around the subjects; their edges are clean and photographic, with no halo, outline or cut-out look.`,
        `RE-LIGHT the subjects for the new place: its light direction, colour temperature, weather and contrast; add contact shadows on the new ground and matching reflections; one grain, one depth of field, one colour grade across the whole frame.`,
        `FINAL CHECK: is the frame exactly the frame of Image 1 — same crop, same zoom, same field of view — with the subjects and any overlaid text untouched and the new place as the only change? Is everything lit and graded as ONE photograph? If not, redo.`,
  ]
}
