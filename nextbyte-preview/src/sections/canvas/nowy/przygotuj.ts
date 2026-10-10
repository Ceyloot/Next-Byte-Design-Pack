import { narysujMapeMiejsc } from '../mapa-miejsc'
import { etykietaPinezki } from './role'
import { konwertujNaDataUrl, wytnijOkolice, zmniejszDoAnalizy, type Pineska, type Warstwa } from '../typy'
import { odczytajPlanAgenta, srednicaZeSkali, tekstPytania, zdanieOSkali, type PlanAgenta, type PytanieAgenta, type ZapytanieDoAgenta } from './agent'
import { przygotujNowySystem } from './szablon'
import { narysujMaskeUkladu, wytnijRamke } from './obrazy'

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

const PRZEWODNIK_MIEJSCA = true

/** Najdłuższy bok ramki `cel` ([ymin, xmin, ymax, xmax], 0–1000) w pikselach bazy. */
const bokCeluPx = (cel: [number, number, number, number], baza: Warstwa) =>
  Math.max(((cel[3] - cel[1]) / 1000) * baza.naturalWidth, ((cel[2] - cel[0]) / 1000) * baza.naturalHeight)

/** Zamiana obiektu: nowa rzecz zajmuje to samo miejsce w kadrze i ma tę samą widoczną wielkość i masę co zastępowana (liczby z ramki agenta). */
function zdanieOZastapieniu(cel: [number, number, number, number]): string {
  const szer = Math.round(((cel[3] - cel[1]) / 1000) * 100)
  const wys = Math.round(((cel[2] - cel[0]) / 1000) * 100)
  const cx = ((cel[1] + cel[3]) / 2000).toFixed(2)
  const cy = ((cel[0] + cel[2]) / 2000).toFixed(2)
  return `SIZE AND MASS: the object that is replaced fills about ${szer}% of the width and ${wys}% of the height of Image 1, centred near x=${cx}, y=${cy}. The new object takes over exactly that footprint — the same visible width, height, bulk and mass, in the same place; it is NOT shrunk to its real-world size and NOT scaled to its reference photo. Keep the transparency, softness and haze of the replaced object as stated above. THE OLD OBJECT IS REPLACED, NOT OVERLAID: delete it completely first and rebuild the clean background where it stood — nothing of it (outline, eyes, mouth, skin pattern, texture, ghost) may remain visible anywhere, not even through the new object's transparency; whatever shows through the new object is only the rebuilt background.`
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

  // Zbliżenie wokół każdej pinezki: pinowana rzecz leży w centrum (okno ~22% krótszego boku); bez tego mały obiekt przy sąsiedzie bywa mylony
  const zblizenia = (
    await Promise.all(
      pinezkiAgenta.map(async p => {
        const l = zdjecia[p.obraz - 1]
        if (!l) return null
        const dane = await wytnijOkolice(l.src, p.x, p.y, 512, 0.22).catch(() => '')
        return dane ? { numer: p.numer, nazwa: p.nazwa, dane } : null
      }),
    )
  ).filter((z): z is { numer: number; nazwa: string; dane: string } => Boolean(z))
  const odpowiedz = await zapytajAgenta({ tekst: w.tekst, obrazy: obrazyAgenta, pineski: pinezkiAgenta, zblizenia, historia: w.historia })

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

  // Przewodnik przesunięcia (jedno zdjęcie): czerwony pierścień = skąd znika, zielony = dokąd trafia
  let przesuniecieNr = 0
  if (PRZEWODNIK_MIEJSCA && plan.ruch && referencje.length === 0) {
    const z = pinezkiAgenta.find(p => p.numer === plan.ruch!.zrodlo && p.obraz === plan.baza)
    const d = pinezkiAgenta.find(p => p.numer === plan.ruch!.cel && p.obraz === plan.baza)
    if (z && d) {
      const bokCelu = plan.cel ? Math.max(((plan.cel[3] - plan.cel[1]) / 1000) * baza.naturalWidth, ((plan.cel[2] - plan.cel[0]) / 1000) * baza.naturalHeight) : 0
      const srZrodlo = bokCelu > 8 ? bokCelu : 0.06 * baza.naturalWidth
      const srCel = plan.skala ? srednicaZeSkali(plan.skala, baza.naturalWidth, baza.naturalHeight) : srZrodlo
      const przewodnik = await narysujMaskeUkladu(baza.src, { x: d.x, y: d.y, srednicaPx: srCel }, { x: z.x, y: z.y, srednicaPx: srZrodlo })
      if (przewodnik) {
        obrazy.push(przewodnik)
        przesuniecieNr = obrazy.length
      }
    }
  }

  // Przewodnik miejsca: wstawianie / zamiana rzeczy z referencji w jedno miejsce bazy — pierścień o średnicy = najdłuższy bok obiektu
  let przewodnikNr = 0
  const pinyNaBazie = pinezkiAgenta.filter(p => p.obraz === plan.baza)
  // Zamiana obiektu: rozmiar bierzemy z ZASTĘPOWANEJ rzeczy (ramka `cel`), nie z jej „prawdziwych” wymiarów — nowa rzecz ma tę samą masę i miejsce w kadrze
  const zamianaObiektu = plan.zadanie === 'zamiana_obiektu' && Boolean(plan.cel)
  if (PRZEWODNIK_MIEJSCA && (plan.skala || zamianaObiektu) && referencje.length > 0 && pinyNaBazie.length === 1 && plan.zadanie !== 'zamiana_osoby') {
    const sred = zamianaObiektu && plan.cel ? bokCeluPx(plan.cel, baza) : srednicaZeSkali(plan.skala, baza.naturalWidth, baza.naturalHeight)
    const przewodnik = await narysujMaskeUkladu(baza.src, { x: pinyNaBazie[0].x, y: pinyNaBazie[0].y, srednicaPx: sred })
    if (przewodnik) {
      obrazy.push(przewodnik)
      przewodnikNr = obrazy.length
    }
  }

  // Prompt agenta + to, co deterministyczne: liczby ze skali, opis zbliżeń, zabezpieczenie przed rozmyciem
  const dopiski: string[] = []
  if (zamianaObiektu && plan.cel) dopiski.push(zdanieOZastapieniu(plan.cel))
  else if (plan.skala) dopiski.push(zdanieOSkali(plan.skala))
  zbliz.forEach((z, k) => dopiski.push(`Image ${referencje.length + 2 + k} is a close-up of the face of the person in Image ${z.zdjecie} — the identity reference: reproduce exactly this face, feature by feature.`))
  if (przesuniecieNr) dopiski.push(`Image ${przesuniecieNr} is a LAYOUT MASK, not a photograph: a black image of the same format as Image 1. The WHITE disc marks where the object must end up — centre it on the disc's centre, its longest side about the disc's diameter. The GREY disc marks where the object is now — after the move that spot must show only the rebuilt background. Exactly one instance of the object must exist in the result. Use the mask only for position and size: nothing from it (no disc, no black, no grey) may appear in the result, which is Image 1 edited.`)
  if (przewodnikNr) dopiski.push(`Image ${przewodnikNr} is a LAYOUT MASK, not a photograph: a black image of the same format as Image 1. The WHITE disc marks the exact spot where the new object touches the ground / surface (the disc's centre) and its diameter is the length of the object's longest side as it appears in Image 1. Place the object centred on that disc, filling about that size — not larger, not smaller. Use the mask only for position and size: nothing from it (no disc, no black) may appear in the result, which is Image 1 edited.`)
  if (!/no blur|sharp/i.test(plan.prompt)) dopiski.push('Keep everything sharp — no blur or softening.')
  // Numery obrazów nadaje kod, nie agent: [BASE] = Image 1, [REF1] = Image 2 … (kolejność jak w tablicy obrazów wysyłanej do modelu)
  // Model obrazu nie widzi pinesek — gdyby agent mimo zakazu napisał „pin N”, podmieniamy to na współrzędne
  const zastapPiny = (tekst: string) => tekst.replace(/\b(?:the\s+)?(?:location|position|spot|point|place)?\s*(?:of|at)?\s*pin\s*(\d+)\b/gi, (_m, n: string) => {
    const pin = pinezkiAgenta.find(x => x.numer === Number(n))
    return pin && pin.obraz === plan.baza ? ` the spot at x=${pin.x.toFixed(2)}, y=${pin.y.toFixed(2)} of [BASE]` : ' the marked subject'
  })
  const poNumerach = zastapPiny(plan.prompt)
    .replace(/\[BASE\]/g, 'Image 1')
    .replace(/\[REF(\d+)\]/g, (_m, n: string) => `Image ${Number(n) + 1}`)
  const prompt = [poNumerach, ...dopiski.map(zastapPiny)].join('\n\n')

  return { typ: 'gotowe', baza, obrazy, prompt, opis: plan.plan || `Zadanie: ${plan.zadanie}.`, zrodlo: 'agent' }
}
