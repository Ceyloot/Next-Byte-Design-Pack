/**
 * PROMPT GEMINI 1 — ZDJĘCIE DOCELOWE, OPERACJA I ROLE PINESEK
 * ============================================================
 * Gemini widzi wszystkie zdjęcia (z ponumerowanymi magentowymi kropkami w
 * miejscach pinesek) i decyduje o trzech rzeczach:
 *   1. które zdjęcie jest DOCELOWE (na nim powstaje wynik), a które to dawcy,
 *   2. która operacja obowiązuje (jedna z zamkniętej listy w `operacje/`),
 *   3. jaką rolę pełni każda pineska (source / target).
 * Nie opisuje sceny — to robi prompt 2 (`02-opis-sceny.ts`).
 */
import type { AnalizaDocelowego, OperationId, PineskaWejscie, RolaPineski } from '../types'
import { OPERATION_IDS, OPERATION_LIST } from '../operacje'
import { listaPinesek, tekst, wyciagnijJson } from './wspolne'

export interface WejscieZdjeciaDocelowego {
  /** ile zdjęć wysyłamy (Image 1..N) */
  liczbaZdjec: number
  pineski: PineskaWejscie[]
  /** polecenie użytkownika, zwykle po polsku */
  polecenie: string
}

/** Buduje tekst promptu 1. Zdjęcia dołącza wywołujący, w kolejności Image 1..N. */
export function zbudujPromptZdjeciaDocelowego(w: WejscieZdjeciaDocelowego): string {
  const operacje = OPERATION_LIST.map((o) => `- ${o.id}: ${o.kiedyUzyc}`).join('\n')

  return `You are the edit director of an image-editing pipeline. A downstream image model will generate the result; you only decide WHICH IMAGE IS THE TARGET, WHICH OPERATION APPLIES and WHAT ROLE EACH PIN PLAYS.

INPUT
- You receive ${w.liczbaZdjec} image(s), labelled Image 1 … Image ${w.liczbaZdjec} in the order sent.
- Pins are drawn as numbered magenta dots on the images. They are drawn only for you.
- Pin list:
${listaPinesek(w.pineski)}
- The user's command (usually colloquial Polish): "${w.polecenie.trim() || '(empty — infer the intent from the pins)'}"

DECISION 1 — TARGET IMAGE
The TARGET is the photograph in which the result appears: it keeps its scene, framing, format and quality. All other images are DONORS: they only supply an object, a person, a look or a background.
- One image only: it is the target.
- "Bring / move X from photo A into photo B": the target is B (where X ends up).
- "Put this face / outfit / object on that person / place": the target is the photo of that person / place.
- If the command names an image ("na zdjęciu 2", "w pierwszym"), obey it.
- If the command is ambiguous, prefer the image that carries the destination pin.

DECISION 2 — OPERATION (choose EXACTLY ONE id from this closed list; invent nothing)
${operacje}

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
}`
}

const ROLE: RolaPineski[] = ['source', 'target']

/**
 * Domyślna analiza bez Gemini (brak klucza, błąd sieci, uszkodzony JSON):
 * zdjęcie z ostatnią pineską jest docelowe, 1 pineska → target, 2 → source+target.
 */
export function domyslnaAnalizaDocelowego(w: WejscieZdjeciaDocelowego): AnalizaDocelowego {
  const posortowane = [...w.pineski].sort((a, b) => a.numer - b.numer)
  const ostatnia = posortowane[posortowane.length - 1]
  const docelowe = ostatnia?.zdjecie ?? 1
  const dawcy = [...new Set(posortowane.map((p) => p.zdjecie))].filter((z) => z !== docelowe)
  const role = posortowane.map((p, i) => ({
    pineska: p.numer,
    rola: (posortowane.length > 1 && i < posortowane.length - 1 ? 'source' : 'target') as RolaPineski,
  }))
  const operacja: OperationId =
    posortowane.length > 1 ? (dawcy.length > 0 ? 'object_swap' : 'object_transfer') : 'general_fix'
  return { zdjecieDocelowe: docelowe, zdjeciaDawcow: dawcy, operacja, role, powod: 'fallback (no Gemini result)' }
}

/** Parsuje i waliduje odpowiedź Gemini; braki i błędy uzupełnia wartościami domyślnymi. */
export function parsujZdjecieDocelowe(odpowiedz: string, w: WejscieZdjeciaDocelowego): AnalizaDocelowego {
  const domyslna = domyslnaAnalizaDocelowego(w)
  const json = wyciagnijJson(odpowiedz)
  if (!json) return domyslna

  const numerZdjecia = (v: unknown): number | undefined => {
    const n = Number(v)
    return Number.isInteger(n) && n >= 1 && n <= w.liczbaZdjec ? n : undefined
  }

  const docelowe = numerZdjecia(json.targetImage) ?? domyslna.zdjecieDocelowe
  const dawcyGemini = Array.isArray(json.donorImages)
    ? json.donorImages.map(numerZdjecia).filter((n): n is number => n !== undefined && n !== docelowe)
    : []
  const dawcyZPinesek = w.pineski.map((p) => p.zdjecie).filter((z) => z !== docelowe)
  const dawcy = [...new Set([...dawcyGemini, ...dawcyZPinesek])]

  const op = tekst(json.operation)
  const operacja = (OPERATION_IDS as string[]).includes(op) ? (op as OperationId) : domyslna.operacja

  const rolePinesek = Array.isArray(json.pins) ? json.pins : []
  const role = w.pineski.map((p) => {
    const wpis = rolePinesek.find((r) => Number((r as { pin?: unknown }).pin) === p.numer) as
      | { role?: unknown }
      | undefined
    const rola = ROLE.find((r) => r === wpis?.role)
    return { pineska: p.numer, rola: rola ?? domyslna.role.find((d) => d.pineska === p.numer)?.rola ?? 'target' }
  })

  return {
    zdjecieDocelowe: docelowe,
    zdjeciaDawcow: dawcy,
    operacja,
    role,
    powod: tekst(json.reason, 'no reason given'),
  }
}
