import { narysujMapeMiejsc } from '../mapa-miejsc'
import { etykietaPinezki } from './role'
import { konwertujNaDataUrl, zmniejszDoAnalizy, type Pineska, type Warstwa } from '../typy'
import { odczytajPlanAgenta, tekstPytania, zdanieOSkali, type PlanAgenta, type PytanieAgenta, type ZapytanieDoAgenta } from './agent'
import { przygotujNowySystem } from './szablon'
import { wytnijRamke } from './obrazy'

/**
 * NOWY SYSTEM — przygotowanie jednej generacji. Warstwy:
 *   1. AGENT (jedno wywołanie Gemini z obrazami): rozumie, dopytuje albo pisze krótki prompt + ramki + skalę   → `/api/canvas/agent`
 *   2. KOD: wycina referencje (osoba, twarz, rzecz), dopisuje liczby ze skali, numeruje zdjęcia                 → ten plik
 *   3. MODEL OBRAZU: generacja (poza tym plikiem)
 * Gdy agent zawiedzie, zadziała prosty szablon z `prompt.ts` (żeby nie zostać z niczym i nie płacić drugi raz za agenta).
 */

export type WynikPrzygotowania =
  | { typ: 'pytanie'; pytanie: PytanieAgenta; tekst: string }
  | { typ: 'gotowe'; baza: Warstwa; obrazy: string[]; prompt: string; opis: string; zrodlo: 'agent' | 'szablon' }
  | { typ: 'blad'; blad: string }

export interface WejscieAgenta {
  tekst: string
  pineski: Pineska[]
  /** wszystkie zdjęcia na płótnie (bez ramek generatora) */
  warstwy: Warstwa[]
  zaznaczone: string[]
  wybrana: string | null
  historia: { pytanie: string; odpowiedz: string }[]
}

const MAKS_ZDJEC_DLA_AGENTA = 4

/** Zdjęcia, które widzi agent: te z pinezkami, zaznaczone i wybrane — w kolejności z płótna. */
function zdjeciaDlaAgenta(w: WejscieAgenta): Warstwa[] {
  const ids = new Set<string>([...w.pineski.filter(p => !p.chroniona).map(p => p.layerId), ...w.zaznaczone, ...(w.wybrana ? [w.wybrana] : [])])
  let wybrane = w.warstwy.filter(l => ids.has(l.id))
  if (wybrane.length === 0 && w.warstwy[0]) wybrane = [w.warstwy[0]]
  return wybrane.slice(0, MAKS_ZDJEC_DLA_AGENTA)
}

async function zapytajAgenta(z: ZapytanieDoAgenta): Promise<{ plan: PlanAgenta } | { blad: string }> {
  try {
    const odp = await fetch('/api/canvas/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(z) })
    const tresc = (await odp.json().catch(() => ({}))) as Record<string, unknown>
    if (!odp.ok) return { blad: String(tresc.blad ?? `błąd ${odp.status}`) }
    const plan = odczytajPlanAgenta(tresc, z.obrazy.length)
    return plan ? { plan } : { blad: 'Agent oddał nieczytelny plan' }
  } catch (e) {
    return { blad: e instanceof Error ? e.message : 'Agent nie odpowiada' }
  }
}

export async function przygotujZAgentem(w: WejscieAgenta): Promise<WynikPrzygotowania> {
  const zdjecia = zdjeciaDlaAgenta(w)
  if (zdjecia.length === 0) return { typ: 'blad', blad: 'Nie ma zdjęcia do edycji — wgraj zdjęcie albo zaznacz je na płótnie.' }

  // Agent widzi zdjęcia z narysowanymi, ponumerowanymi pinezkami
  const obrazyAgenta = await Promise.all(
    zdjecia.map(async (l, i) => ({
      nr: i + 1,
      nazwa: `${l.name} — ${l.naturalWidth}×${l.naturalHeight} px`,
      dane: (await narysujMapeMiejsc(l, w.pineski)) || (await zmniejszDoAnalizy(l.src)) || l.src,
    })),
  )
  const pinezkiAgenta = w.pineski
    .map((p, i) => ({ p, numer: i + 1, obraz: zdjecia.findIndex(l => l.id === p.layerId) + 1 }))
    .filter(x => !x.p.chroniona && x.obraz > 0)
    .map(x => ({ numer: x.numer, obraz: x.obraz, x: x.p.normalizedX, y: x.p.normalizedY, nazwa: etykietaPinezki(x.p, x.numer) }))

  const odpowiedz = await zapytajAgenta({ tekst: w.tekst, obrazy: obrazyAgenta, pineski: pinezkiAgenta, historia: w.historia })

  // Agent zawiódł → prosty szablon (bez dodatkowego kosztu)
  if ('blad' in odpowiedz) {
    console.warn('[canvas] agent zawiódł, szablon:', odpowiedz.blad)
    const s = przygotujNowySystem({ tekst: w.tekst, pineski: w.pineski, warstwy: w.warstwy, zaznaczone: w.zaznaczone, wybrana: w.wybrana, odpowiedzBazaId: null })
    if (!s.ok) return { typ: 'blad', blad: `Asystent nie przeanalizował zdjęć (${odpowiedz.blad}), a szablon nie umie rozstrzygnąć, o które zdjęcie chodzi. Spróbuj jeszcze raz.` }
    const kolejnosc = [s.zadanie.baza, ...s.zadanie.referencje]
    const obrazy = await Promise.all(kolejnosc.map(l => konwertujNaDataUrl(l.src)))
    return { typ: 'gotowe', baza: s.zadanie.baza, obrazy, prompt: s.zadanie.prompt, opis: `${s.zadanie.opis} (agent zawiódł — szablon)`, zrodlo: 'szablon' }
  }

  const plan = odpowiedz.plan
  if (plan.pytanie) return { typ: 'pytanie', pytanie: plan.pytanie, tekst: tekstPytania(plan.pytanie) }

  const baza = zdjecia[plan.baza - 1] ?? zdjecia[0]
  const referencje = plan.referencje.map(r => ({ r, warstwa: zdjecia[r.nr - 1] })).filter(x => x.warstwa && x.warstwa.id !== baza.id)

  // Zdjęcia dla modelu: [baza, referencje (wycięte do osoby / rzeczy), zbliżenia twarzy]
  const obrazy: string[] = [await konwertujNaDataUrl(baza.src)]
  const zbliz: { zdjecie: number; src: string }[] = []
  for (const [i, { r, warstwa }] of referencje.entries()) {
    const pelne = await konwertujNaDataUrl(warstwa.src)
    const ramka = r.osoba ?? r.obiekt
    const wycinek = ramka ? await wytnijRamke(pelne, ramka, r.osoba ? 0.08 : 0.1) : null
    obrazy.push(wycinek ?? pelne)
    if (r.twarz) {
      const twarz = await wytnijRamke(pelne, r.twarz, 0.35, 768)
      if (twarz) zbliz.push({ zdjecie: i + 2, src: twarz })
    }
  }
  for (const z of zbliz) obrazy.push(z.src)

  // Prompt agenta + to, co deterministyczne: liczby ze skali, opis zbliżeń, zabezpieczenie przed rozmyciem
  const dopiski: string[] = []
  if (plan.skala) dopiski.push(zdanieOSkali(plan.skala, baza.naturalWidth, baza.naturalHeight))
  zbliz.forEach((z, k) => dopiski.push(`Image ${referencje.length + 2 + k} is a close-up of the face of the person in Image ${z.zdjecie} — the identity reference: reproduce exactly this face, feature by feature.`))
  if (!/blur/i.test(plan.prompt)) dopiski.push('Keep everything sharp — no blur or softening.')
  // Numery obrazów nadaje kod, nie agent: [BASE] = Image 1, [REF1] = Image 2 … (kolejność jak w tablicy obrazów wysyłanej do modelu)
  const poNumerach = plan.prompt
    .replace(/\[BASE\]/g, 'Image 1')
    .replace(/\[REF(\d+)\]/g, (_m, n: string) => `Image ${Number(n) + 1}`)
  const prompt = [poNumerach, ...dopiski].join('\n\n')

  return { typ: 'gotowe', baza, obrazy, prompt, opis: plan.plan || `Zadanie: ${plan.zadanie}.`, zrodlo: 'agent' }
}
