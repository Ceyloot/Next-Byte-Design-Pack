/**
 * POSTACIE — prompty Studia Zdjęć WYMUSZANE 1:1 dla wszystkich zmian postaci (zamiana postaci, zamiana twarzy).
 * Źródło: „Studio Zdjęć — prompty systemowe” (PDF, origin/staging 14f7246d8, 28.09.2026): poz. 19–25 (zamiana postaci),
 * 28–32 (zamiana twarzy), 35 (realizm skóry i głowy), 49–50 (zamek tożsamości). Teksty są w `operacje/character-swap-studio.ts`
 * (zweryfikowane słowo w słowo z PDF) — tu tylko składanie w kolejności z poz. 24 / 31 i negatywy.
 *
 * Różnice względem Studia wynikają wyłącznie z numeracji obrazów w Canvasie (Image 1 = scena, w Studiu scena jest OSTATNIĄ referencją)
 * oraz z pinesek: Canvas musi wskazać, KTÓRA osoba na scenie jest zamieniana i KTÓRA na referencji jest źródłem tożsamości.
 * Nie ma tu żadnego rozmycia sceny ani dopisków spoza PDF poza krótką linią „IMAGE ROLES”.
 */
import {
  STUDIO_FACE_KONTROLA,
  STUDIO_FACE_SYSTEM,
  STUDIO_REALIZM_TWARZY,
  STUDIO_SWAP_KONTROLA,
  STUDIO_SWAP_SYSTEM,
  studioFaceBaza,
  studioSwapBaza,
  studioSwapBazaUbranieSceny,
} from './operacje/character-swap-studio'

/** poz. 25 — negatyw przebiegu głównego zamiany postaci (z dołączonym negatywem realizmu twarzy, poz. 37) */
export const PDF_NEGATYW_ZAMIANY_POSTACI =
  `pasted person, cut out person, sticker, collage, photomontage, cutout edge, halo outline, hard silhouette, floating person, studio lighting on location, flat even lighting, flash on ambient scene, mismatched lighting, mismatched light direction, mismatched color temperature, mismatched white balance, mismatched grade, mismatched grain, missing shadow, no contact shadow, subject sharper than background, all-in-focus subject in shallow-focus scene, no motion blur on moving subject, brighter subject than scene, plastic skin, waxy skin, airbrushed skin, altered identity, different person, changed clothing, changed pose, changed background, missing text, removed overlays, smooth skin, beauty filter, retouched skin, poreless skin, symmetrical perfect face, doll face, mannequin, CGI, 3d render, glowing skin, HDR skin, oversharpened eyes, plastic hair, painted look`

/** poz. 32 — negatyw przebiegu głównego zamiany twarzy (z dołączonym negatywem realizmu twarzy, poz. 37) */
export const PDF_NEGATYW_ZAMIANY_TWARZY =
  `pasted face, copy pasted face, face sticker, cut out face, face mask, oval face patch, rectangular crop edge, visible seam, hard boundary, mismatched skin tone, mismatched lighting, mismatched shadows, mismatched grain, floating face, warped face, plastic skin, waxy skin, airbrushed skin, uncanny valley, different head size, changed hairstyle, changed clothing, changed pose, changed background, source photo border, duplicate face, distorted eyes, distorted mouth, asymmetrical eyes, low quality face, smooth skin, beauty filter, retouched skin, poreless skin, symmetrical perfect face, doll face, mannequin, CGI, 3d render, glowing skin, HDR skin, oversharpened eyes, plastic hair, painted look`

/** poz. 19 / 28 — role modelu; temperatury ze Studia: swap 0.45, twarz 0.42 (topP 0.9 ustawia proxy). */
export const PDF_SYSTEM_ZAMIANY_POSTACI = STUDIO_SWAP_SYSTEM
export const PDF_SYSTEM_ZAMIANY_TWARZY = STUDIO_FACE_SYSTEM
export const PDF_TEMPERATURA_ZAMIANY_POSTACI = 0.45
export const PDF_TEMPERATURA_ZAMIANY_TWARZY = 0.42

export interface PostacPdfWejscie {
  /** zdanie użytkownika (z wplecionymi pineskami) */
  polecenie: string
  /** numer obrazu-sceny (zawsze 1) */
  scena: number
  /** numery obrazów, które pokazują OSOBĘ-źródło (ujęcia postaci / twarzy) */
  ujeciaPostaci: number[]
  /** pozostałe obrazy-referencje (miejsce, przedmiot, tło…) — nie są osobami */
  inneReferencje: number[]
  /** pineska osoby zamienianej na scenie i osoby-źródła na referencji (współrzędne 0–1) */
  pinCelu: { numer: number; x: number; y: number; ramka?: { x0: number; y0: number; x1: number; y1: number } }
  pinZrodla: { numer: number; obraz: number; x: number; y: number }
  /** karta tożsamości osoby-źródła od Gemini (EN) — wchodzi w zamek tożsamości (poz. 49) */
  karta?: string
  /** poza i sylwetka zamienianej osoby (EN) — od Gemini */
  poza?: string
  /** numer obrazu ze zbliżeniem twarzy osoby-źródła */
  twarzObraz?: number
  /** zamiana postaci: ubranie zostaje ze sceny (poz. 21 zamiast 20) */
  ubranieZeSceny?: boolean
}

const wsp = (v: number) => v.toFixed(2)
const obrazy = (n: number[]) => (n.length > 1 ? `Images ${n.join(', ')}` : `Image ${n[0]}`)

/** Zamek tożsamości (poz. 49): rdzeń z karty od Gemini + zbliżenie twarzy. */
function zamekTozsamosci(w: PostacPdfWejscie): string {
  return [
    w.karta?.trim()
      ? `IDENTITY LOCK — preserve EXACTLY the same person across all character reference images. Key identity markers: ${w.karta.trim().replace(/[.\s]+$/, '')}.`
      : '',
    w.twarzObraz
      ? `Image ${w.twarzObraz} is a close-up of the same person's face — the identity reference: reproduce exactly this face, feature by feature, rendered anew in the scene.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Miara miejsca i rozmiaru zamienianej osoby: model sam „zmniejszał” nową osobę względem oryginału (węższe ramiona, niższa ręka).
 * Ramka osoby pod pineską (od Gemini) mówi dokładnie, ile kadru zajmuje — nowa osoba wypełnia ten sam obszar.
 * Pomijana, gdy ramki brak albo obejmuje niemal cały kadr (wtedy nie niesie informacji).
 */
function liniaObszaru(w: PostacPdfWejscie): string {
  const r = w.pinCelu.ramka
  const poza = w.poza?.trim() ? ` POSE TO KEEP (the person to be replaced, as seen in Image ${w.scena}): ${w.poza.trim()}` : ''
  if (!r) return poza.trim()
  const szer = r.x1 - r.x0
  const wys = r.y1 - r.y0
  if (szer * wys > 0.85 || szer < 0.03 || wys < 0.03) return poza.trim()
  const p = (v: number) => `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`
  return `SIZE AND PLACE OF THE PERSON TO REPLACE: in Image ${w.scena} they fill the area from ${p(r.x0)} to ${p(r.x1)} of the width and from ${p(r.y0)} to ${p(r.y1)} of the height. The new person takes exactly that place: the same head position, shoulder line, torso width and overall size, with arms and hands (and whatever they hold) in the same places — never smaller, never narrower, never shifted or leaning differently.${poza}`
}

/** Linia ról obrazów i pinesek — jedyny dopisek Canvasa (w Studiu zastępuje go kolejność referencji). */
function liniaRol(w: PostacPdfWejscie, cel: string, zrodlo: string): string {
  return [
    `IMAGE ROLES: Image ${w.scena} is the scene (the only photograph that is edited and returned); ${cel} at Pin ${w.pinCelu.numer} (x=${wsp(w.pinCelu.x)} y=${wsp(w.pinCelu.y)}) of Image ${w.scena}; ${zrodlo} at Pin ${w.pinZrodla.numer} (x=${wsp(w.pinZrodla.x)} y=${wsp(w.pinZrodla.y)}) of Image ${w.pinZrodla.obraz}.`,
    w.inneReferencje.length
      ? `${obrazy(w.inneReferencje)} ${w.inneReferencje.length > 1 ? 'give' : 'gives'} only what the instruction says (a place, an object, a background) — never faces or people to copy.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Zamiana postaci: kolejność z poz. 24 — baza, instrukcja (poz. 22), kotwica (poz. 23), zamek (poz. 49), realizm (poz. 35). */
export function zlozZamianePostaciPdf(w: PostacPdfWejscie): string {
  const refs =
    w.ujeciaPostaci.length > 1
      ? `the character reference images (${obrazy(w.ujeciaPostaci)}, all showing the SAME person from different angles)`
      : `the character reference image (Image ${w.ujeciaPostaci[0]})`
  const baza = (w.ubranieZeSceny ? studioSwapBazaUbranieSceny : studioSwapBaza)(refs, `Image ${w.scena}`)
  return [
    baza,
    liniaRol(w, 'the person to be replaced is the one', 'the character reference person is the one'),
    liniaObszaru(w),
    `Additional instruction: ${w.polecenie.trim().replace(/[.\s]+$/, '')}.`,
    STUDIO_SWAP_KONTROLA,
    zamekTozsamosci(w),
    STUDIO_REALIZM_TWARZY,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Zamiana twarzy: kolejność z poz. 31 — baza (poz. 29), kotwica (poz. 30), zamek (poz. 49), realizm (poz. 35). Bez instrukcji użytkownika (jak w Studiu). */
export function zlozZamianeTwarzyPdf(w: PostacPdfWejscie): string {
  const zrodla = w.ujeciaPostaci.length > 1 ? `the identity images ${obrazy(w.ujeciaPostaci)}` : `Image ${w.ujeciaPostaci[0]}`
  return [
    studioFaceBaza(`Image ${w.scena}`, zrodla, w.ujeciaPostaci.length),
    liniaRol(w, 'the face to be replaced belongs to the person', 'the identity source is the person'),
    STUDIO_FACE_KONTROLA,
    zamekTozsamosci(w),
    STUDIO_REALIZM_TWARZY,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/* ── TEST: wariant krótki (jak na Lovarcie) ─────────────────────────────────
 * Lovart wysyła do GPT Image 2 ok. 150 znaków: role zdjęć + „zamień X na Y, zachowaj pozycję, światło i styl”. Nasz prompt z PDF to ok. 5–6 tys.
 * znaków (baza + role + rozmiar + poza + kotwica + zamek tożsamości + realizm + negatyw + rola modelu). Przełącznik w czacie wybiera, który idzie
 * do modelu; wybór zapisuje się w przeglądarce. Cofnięcie testu: ustaw domyślnie 'pdf'.
 */
export const KLUCZ_PROMPTU_POSTACI = 'canvas-prompt-postaci'
export type TrybPromptuPostaci = 'krotki' | 'pdf'

export function trybPromptuPostaci(): TrybPromptuPostaci {
  try {
    return localStorage.getItem(KLUCZ_PROMPTU_POSTACI) === 'pdf' ? 'pdf' : 'krotki'
  } catch {
    return 'krotki'
  }
}

/** Zamiana postaci, wariant krótki: role, zadanie, co zostaje, instrukcja użytkownika. Bez systemu, negatywu, karty tożsamości i opisu pozy. */
export function zlozZamianePostaciKrotko(w: PostacPdfWejscie): string {
  const zrodlo = w.pinZrodla
  const co = w.ubranieZeSceny
    ? `The new person has that person's face, hair and body, and keeps the clothes of the person in Image ${w.scena}.`
    : `The new person is that person: the same face, hair, body and clothes as in Image ${zrodlo.obraz}.`
  return [
    `Image ${w.scena} is the BASE photograph. Image ${zrodlo.obraz} is the IDENTITY reference.`,
    `Replace the person at Pin ${w.pinCelu.numer} (x=${wsp(w.pinCelu.x)} y=${wsp(w.pinCelu.y)}) of Image ${w.scena} with the person at Pin ${zrodlo.numer} (x=${wsp(zrodlo.x)} y=${wsp(zrodlo.y)}) of Image ${zrodlo.obraz}. ${co} Keep from Image ${w.scena}: their position, size and pose, the lighting, the background and all text. One realistic photograph, sharp, no pasted look.`,
    w.inneReferencje.length ? `${obrazy(w.inneReferencje)} ${w.inneReferencje.length > 1 ? 'give' : 'gives'} only what the instruction says — never people to copy.` : '',
    `Additional instruction: ${w.polecenie.trim().replace(/[.\s]+$/, '')}.`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Zamiana twarzy, wariant krótki. */
export function zlozZamianeTwarzyKrotko(w: PostacPdfWejscie): string {
  const zrodlo = w.pinZrodla
  return [
    `Image ${w.scena} is the BASE photograph. Image ${zrodlo.obraz} is the IDENTITY reference.`,
    `Give the person at Pin ${w.pinCelu.numer} (x=${wsp(w.pinCelu.x)} y=${wsp(w.pinCelu.y)}) of Image ${w.scena} the face of the person at Pin ${zrodlo.numer} (x=${wsp(zrodlo.x)} y=${wsp(zrodlo.y)}) of Image ${zrodlo.obraz}. Change only the face; keep from Image ${w.scena} the body, clothes, hair style, pose, head angle, lighting, background and all text. One realistic photograph, sharp, no pasted look.`,
  ].join('\n\n')
}
