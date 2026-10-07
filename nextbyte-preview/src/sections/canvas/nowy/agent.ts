/**
 * Plan agenta — typy i walidacja odpowiedzi (wspólne dla serwera i klienta; bez importów Vite/DOM).
 * Odpowiedź modelu jest traktowana jak dane z zewnątrz: każde pole sprawdzamy, braki łatamy, a przy kompletnej bzdurze zwracamy `null`
 * (wtedy system schodzi do szablonu z `prompt.ts`, żeby użytkownik nie został z niczym).
 */

export type ZadanieAgenta = 'zamiana_osoby' | 'zamiana_obiektu' | 'przeniesienie' | 'wstawienie' | 'usuniecie' | 'perspektywa' | 'edycja'

/** [ymin, xmin, ymax, xmax] w skali 0–1000. */
export type Ramka = [number, number, number, number]

export interface ReferencjaAgenta {
  /** numer obrazu (jak go agent dostał: Image 1..N) */
  nr: number
  /** co bierzemy (po polsku, krótko) */
  wez: string
  osoba?: Ramka
  twarz?: Ramka
  obiekt?: Ramka
}

export interface PytanieAgenta {
  tresc: string
  zdjecia: { nr: number; opis: string }[]
  odpowiedzi: string[]
}

export interface PlanAgenta {
  pytanie?: PytanieAgenta
  zadanie: ZadanieAgenta
  /** numer obrazu-bazy (jak go agent dostał) */
  baza: number
  referencje: ReferencjaAgenta[]
  cel?: Ramka
  skala?: { box: Ramka; uzasadnienie: string }
  /** gotowy prompt dla modelu obrazu (EN) */
  prompt: string
  /** jedno zdanie po polsku: co zaraz zrobimy */
  plan: string
}

export interface ZapytanieDoAgenta {
  tekst: string
  obrazy: { nr: number; nazwa: string; dane: string }[]
  pineski: { numer: number; obraz: number; x: number; y: number; nazwa: string }[]
  historia: { pytanie: string; odpowiedz: string }[]
}

const ZADANIA: ZadanieAgenta[] = ['zamiana_osoby', 'zamiana_obiektu', 'przeniesienie', 'wstawienie', 'usuniecie', 'perspektywa', 'edycja']
/** Najdłuższy prompt, jaki przyjmujemy od agenta (znaki). Dłuższy znaczy, że agent „pisze esej” — wtedy szablon. */
export const MAKS_DLUGOSC_PROMPTU = 1600

const tekst = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export function odczytajRamke(v: unknown): Ramka | undefined {
  if (!Array.isArray(v) || v.length !== 4) return undefined
  const [a, b, c, d] = v.map(Number)
  if (![a, b, c, d].every(Number.isFinite)) return undefined
  const k = (x: number) => Math.min(1000, Math.max(0, x))
  const ymin = k(Math.min(a, c))
  const ymax = k(Math.max(a, c))
  const xmin = k(Math.min(b, d))
  const xmax = k(Math.max(b, d))
  // ramka musi coś obejmować (co najmniej 1,5% kadru w każdą stronę)
  if (ymax - ymin < 15 || xmax - xmin < 15) return undefined
  return [ymin, xmin, ymax, xmax]
}

/**
 * @param liczbaObrazow ile obrazów dostał agent (numery poza 1..N odrzucamy)
 */
export function odczytajPlanAgenta(json: Record<string, unknown> | null | undefined, liczbaObrazow: number): PlanAgenta | null {
  if (!json) return null
  const poprawnyNr = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= liczbaObrazow

  // Pytanie: wystarczy treść; opisy zdjęć i odpowiedzi czyścimy
  const p = json.pytanie as Record<string, unknown> | null | undefined
  if (p && typeof p === 'object' && tekst(p.tresc)) {
    const zdjecia = Array.isArray(p.zdjecia)
      ? p.zdjecia
          .map(z => z as { nr?: unknown; opis?: unknown })
          .filter(z => poprawnyNr(z.nr) && tekst(z.opis))
          .map(z => ({ nr: z.nr as number, opis: tekst(z.opis) }))
      : []
    const odpowiedzi = Array.isArray(p.odpowiedzi) ? p.odpowiedzi.map(tekst).filter(Boolean).slice(0, 3) : []
    return {
      pytanie: { tresc: tekst(p.tresc), zdjecia, odpowiedzi },
      zadanie: 'edycja',
      baza: 1,
      referencje: [],
      prompt: '',
      plan: '',
    }
  }

  const prompt = tekst(json.prompt)
  if (!prompt || prompt.length > MAKS_DLUGOSC_PROMPTU) return null
  // Prompt bez „Image 1” nie mówi modelowi, co jest bazą — to nie jest użyteczny prompt
  if (!/Image\s*1\b/.test(prompt)) return null

  const baza = poprawnyNr(json.baza) ? (json.baza as number) : 1
  const referencje: ReferencjaAgenta[] = []
  if (Array.isArray(json.referencje)) {
    for (const r of json.referencje as Record<string, unknown>[]) {
      if (!r || !poprawnyNr(r.nr) || r.nr === baza || referencje.some(x => x.nr === r.nr)) continue
      referencje.push({
        nr: r.nr as number,
        wez: tekst(r.wez),
        osoba: odczytajRamke(r.osoba),
        twarz: odczytajRamke(r.twarz),
        obiekt: odczytajRamke(r.obiekt),
      })
    }
  }

  const sk = json.skala as { box?: unknown; uzasadnienie?: unknown } | null | undefined
  const skalaBox = sk && typeof sk === 'object' ? odczytajRamke(sk.box) : undefined

  return {
    zadanie: ZADANIA.includes(json.zadanie as ZadanieAgenta) ? (json.zadanie as ZadanieAgenta) : 'edycja',
    baza,
    referencje,
    cel: odczytajRamke(json.cel),
    skala: skalaBox ? { box: skalaBox, uzasadnienie: tekst(sk?.uzasadnienie) } : undefined,
    prompt,
    plan: tekst(json.plan),
  }
}

/** Pytanie agenta jako tekst do czatu (po polsku): treść, ponumerowane opisy zdjęć, podpowiedzi odpowiedzi. */
export function tekstPytania(p: PytanieAgenta): string {
  const zdjecia = p.zdjecia.map(z => `• Zdjęcie ${z.nr} — ${z.opis}`).join('\n')
  const odp = p.odpowiedzi.length ? `\n\nOdpisz w czacie, np.: ${p.odpowiedzi.map(o => `„${o}”`).join(' albo ')}.` : '\n\nOdpisz w czacie.'
  return `${p.tresc}${zdjecia ? `\n\n${zdjecia}` : ''}${odp}`
}

/** Zdanie o rozmiarze z ramki skali: liczby z agenta zamienione na słowa dla modelu obrazu. */
export function zdanieOSkali(skala: { box: Ramka; uzasadnienie: string }): string {
  const [ymin, xmin, ymax, xmax] = skala.box
  const szer = Math.round((xmax - xmin) / 10)
  const wys = Math.round((ymax - ymin) / 10)
  const x = ((xmin + xmax) / 2000).toFixed(2)
  const y = (ymax / 1000).toFixed(2)
  return `SIZE: in Image 1 the finished subject spans about ${szer}% of the image width and ${wys}% of its height, its lowest point touching the ground at about x=${x} y=${y}. It is exactly that big because of its distance from the camera — never take its size from the reference photo.`
}
