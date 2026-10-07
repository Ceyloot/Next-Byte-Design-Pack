/**
 * ZABLOKOWANE — RUCH (PRZENIESIENIE / ZAMIANA) OBIEKTU W OBRĘBIE JEDNEGO ZDJĘCIA (obie pineski na Image 1).
 * Zatwierdzone przez użytkownika jako działające. NIE ZMIENIAĆ bez jego wyraźnej prośby o zmianę tej logiki.
 * Teksty są kopiami — zmiany we wspólnych brickach i w skladaj.ts NIE wpływają na ten tryb.
 *
 * Zablokowane: prosty prompt „MOVE — do not copy” (miejsce A → miejsce B, położenie słowami + x / y), zestaw bricków w [RULES]
 * (usunięcie starego, miejsce, jedno zdjęcie), linie światła / rozmiaru / analizy od reżysera, brak zbliżeń i opisów
 * szczegółowych obiektu (CanvasSection: `ruchWKadrze`), oraz rozpoznanie intencji „przesuń / przenieś … w miejsce …”
 * jako przeniesienia (polecenia.ts, krok 9b) i role z `role-z-polecenia.ts` („wstaw / przesuń … tutaj”).
 */
import type { PineskaSklejka } from '../skladaj'

const wsp = (v: number) => v.toFixed(2)

/** Położenie punktu w kadrze słowami + współrzędne x / y. */
export function zablokowanePolozenieSlowami(x: number, y: number): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  return `${pion} and ${poziom} of the frame, ${Math.round(x * 100)}% from the left edge and ${Math.round(y * 100)}% down from the top (x=${x.toFixed(2)}, y=${y.toFixed(2)})`
}

const opisPineski = (p: PineskaSklejka) => `Pin ${p.numer} (Image ${p.obraz}, x=${wsp(p.x)} y=${wsp(p.y)})`

/** Zadanie [TASK] wraz z mapą obrazów i pinesek. */
export function zablokowaneZadanieRuchu(
  zamiana: boolean,
  zrodlo: PineskaSklejka,
  cel: PineskaSklejka,
  pineski: { numer: number; obraz: number; x: number; y: number; nazwa?: string }[],
): string {
  const mapa = [
    'Image 1 = scene.',
    ...[...pineski].sort((a, b) => a.numer - b.numer).map((p) => `Pin ${p.numer} · Image ${p.obraz} · x=${wsp(p.x)} y=${wsp(p.y)}${p.nazwa ? ` — "${p.nazwa}"` : ''}`),
  ].join('\n')
  return [
    `[TASK]`,
    `Edit Image 1: MOVE one object — do not copy it. It leaves place A and lands at place B; afterwards it exists exactly once, at place B.`,
    `THE OBJECT${zrodlo.nazwa ? ` ("${zrodlo.nazwa}")` : ''} stands at PLACE A, ${zablokowanePolozenieSlowami(zrodlo.x, zrodlo.y)}.`,
    `PLACE B is ${zablokowanePolozenieSlowami(cel.x, cel.y)}: the middle of its footprint lands exactly on that x / y point, in that very part of the frame.${zamiana ? ' What stands there now is removed and the object takes exactly its place.' : ''}`,
    `PLACE A ends up empty: nothing of the object remains there — the spot is rebuilt with what would naturally be there without it. Everything else in the photo stays exactly as it is.`,
    mapa,
  ].join('\n')
}

/** Bricki [RULES] w tym trybie — zamrożone kopie tekstów. */
const BRICK_USUNIECIE = `The original element at {{PIN_CLEAR}} must be COMPLETELY removed — none of it may survive; whatever part of that spot is not taken over by a new subject placed there is filled naturally with what would be there without it, continuing the surroundings so nobody could tell anything ever stood there.`
const BRICK_MIEJSCE = `Place the subject at {{PIN_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera. THE POINT IS FIXED: the middle of the subject's footprint — where it touches the surface — is exactly at the pin's x / y; never move it toward the centre of the frame, to an easier spot or to a better-looking one. If a surface or object already exists at the pin and is not being replaced, the subject rests on that very thing — it is never rebuilt or imitated elsewhere; whatever the request says is to be replaced or removed there is removed, and the subject takes exactly its place. Its arrangement there is logical, exactly as it would really stand: base resting on the real surface, upright, following the slope and the lines of the scene, an elongated subject aligned with the direction of the surface it rests on, turned the way such an object naturally faces, scaled like the neighbouring things at the same depth — never floating, sunk, tilted, oversized or undersized, and never passing through, covering or fusing with any other object. If the exact point cannot hold it as it is, the ground immediately under it is shaped to hold it — the point itself never changes. Near the frame edge it may be partly cut off by the edge.`
const BRICK_JEDNO_ZDJECIE = `ONE photograph captured in-camera, not a composite — RE-LIGHT AND RE-SHOOT the subject into the scene; the reference lighting is an identity document, not a look. Copy from the scene: key-light direction, height and color temperature, fill level, ambient bounce color, contrast ratio and shadow density. Add the shadows that lighting implies: a contact shadow where it meets the ground and a cast shadow pointing the same way as the scene's shadows, with the same edge sharpness. MATCH THE CAMERA AND THE FILM: same focus state and depth of field, same motion blur, white balance, grade, grain and haze — never sharper than the scene; photographic edges with no halo, outline or sticker look.`

export interface WejscieRegulRuchu {
  /** pineska do wyczyszczenia (przeniesienie: źródło; zamiana: miejsce docelowe); null = bez bricka usunięcia */
  pinCzyszczenia: PineskaSklejka | null
  swiatlo?: string
  rozmiar?: string
  skala?: string
  widok?: string
  ulozenie?: string
}

/** Sekcja [RULES]: światło, rozmiar, analiza reżysera i bricki. */
export function zablokowaneReguRuchu(w: WejscieRegulRuchu, cel: PineskaSklejka): string {
  const swiatlo = w.swiatlo?.trim() ? `THE LIGHT OF IMAGE 1 (measured — the subject must be lit exactly like this, not like its reference): ${w.swiatlo.trim()}` : ''
  const rozmiar = w.rozmiar?.trim() ? `THE SIZE AT THE DESTINATION (measured from objects of known size in Image 1 — follow it, never the size the object has in its reference): ${w.rozmiar.trim()}` : ''
  const analiza = [
    w.skala?.trim() ? `THE REAL SIZE OF THE SUBJECT (analysed against objects of known size in Image 1 — never take its size from how large it appears in its reference): ${w.skala.trim()}` : '',
    w.widok?.trim() ? `HOW IT MUST APPEAR AT THE DESTINATION (from Image 1's camera and the surface it stands on — a different view in the reference is turned to match): ${w.widok.trim()}` : '',
    w.ulozenie?.trim() ? `THE LOGICAL ARRANGEMENT AT THE DESTINATION (analysed from Image 1's scene — follow it): ${w.ulozenie.trim()}` : '',
    cel.miejsce || cel.szczegoly ? `THE DESTINATION SPOT (Pin ${cel.numer}): ${[cel.miejsce, cel.szczegoly].filter(Boolean).join(' ')}` : '',
  ]
  const usuniecie = w.pinCzyszczenia ? BRICK_USUNIECIE.replace('{{PIN_CLEAR}}', opisPineski(w.pinCzyszczenia)) : ''
  const miejsce = BRICK_MIEJSCE.replace('{{PIN_TARGET}}', opisPineski(cel)).replace('{{IMAGE_TARGET}}', 'Image 1')
  return ['[RULES]', swiatlo, rozmiar, ...analiza, usuniecie, miejsce, BRICK_JEDNO_ZDJECIE].filter(Boolean).join('\n')
}
