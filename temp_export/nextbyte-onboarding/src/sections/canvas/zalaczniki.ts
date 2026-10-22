import type { Warstwa } from './typy'

/**
 * Załączniki czatu: zdjęcie-referencja albo plik tekstowy z instrukcją. Nie trafiają na płótno —
 * idą do generacji jako dodatkowe obrazy (referencje) albo jako dopisek do polecenia.
 */
export interface Zalacznik {
  id: string
  nazwa: string
  rodzaj: 'obraz' | 'tekst'
  /** obraz: data URL */
  src?: string
  naturalWidth?: number
  naturalHeight?: number
  /** tekst: treść pliku (przycięta) */
  tekst?: string
}

const MAKS_ZNAKOW_TEKSTU = 6000

const czytajJakoDataUrl = (plik: File) =>
  new Promise<string>((ok, blad) => {
    const c = new FileReader()
    c.onload = () => ok(String(c.result))
    c.onerror = () => blad(c.error)
    c.readAsDataURL(plik)
  })

const wymiary = (src: string) =>
  new Promise<{ w: number; h: number }>(ok => {
    const o = new Image()
    o.onload = () => ok({ w: o.naturalWidth, h: o.naturalHeight })
    o.onerror = () => ok({ w: 1024, h: 1024 })
    o.src = src
  })

/** Pliki z dysku → załączniki; nieobsługiwane typy są pomijane. */
export async function wczytajZalaczniki(pliki: File[]): Promise<Zalacznik[]> {
  const wynik: Zalacznik[] = []
  for (const plik of pliki) {
    const id = `zal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const nazwa = plik.name || 'Załącznik'
    if (plik.type.startsWith('image/')) {
      const src = await czytajJakoDataUrl(plik)
      const { w, h } = await wymiary(src)
      wynik.push({ id, nazwa, rodzaj: 'obraz', src, naturalWidth: w, naturalHeight: h })
    } else if (plik.type.startsWith('text/') || /\.(txt|md|markdown)$/i.test(nazwa)) {
      const tekst = (await plik.text()).trim().slice(0, MAKS_ZNAKOW_TEKSTU)
      if (tekst) wynik.push({ id, nazwa, rodzaj: 'tekst', tekst })
    }
  }
  return wynik
}

/** Treść załączników tekstowych dopisana do polecenia jako instrukcja. */
export function tekstZZalacznikami(tekst: string, zalaczniki: Zalacznik[]): string {
  const dopiski = zalaczniki.filter(z => z.rodzaj === 'tekst' && z.tekst).map(z => `[Attached instructions: ${z.nazwa}]\n${z.tekst}`)
  return dopiski.length ? `${tekst}\n\n${dopiski.join('\n\n')}` : tekst
}

/** Załącznik-obraz jako tymczasowa „warstwa” (poza płótnem), którą rozumie agent i generator. */
export function zalacznikJakoWarstwa(z: Zalacznik, wzor?: Pick<Warstwa, 'x' | 'y' | 'height'>): Warstwa {
  const w = z.naturalWidth ?? 1024
  const h = z.naturalHeight ?? 1024
  const wysokosc = wzor?.height ?? 400
  return {
    id: z.id,
    type: 'image',
    src: z.src ?? '',
    x: wzor?.x ?? 0,
    y: wzor?.y ?? 60,
    width: Math.round((w / h) * wysokosc),
    height: wysokosc,
    naturalWidth: w,
    naturalHeight: h,
    rotation: 0,
    name: z.nazwa.replace(/\.[^.]+$/, '') || 'Referencja',
    visible: true,
    locked: false,
    zrodlo: 'dysk',
  }
}

/**
 * Format wyniku, gdy nie ma zdjęcia, od którego wziąć proporcje: z opisu (jawne „16:9”, „pionowy”, „baner”, „logo”…),
 * a bez wskazówek — z tematu (portret → pion, krajobraz → poziom), domyślnie kwadrat.
 */
export function formatZOpisu(tekst: string): { szerokosc: number; wysokosc: number; proporcje: string } {
  const t = tekst.toLowerCase()
  const F = (szerokosc: number, wysokosc: number, proporcje: string) => ({ szerokosc, wysokosc, proporcje })
  const jawne = t.match(/\b(21\s?:\s?9|16\s?:\s?9|9\s?:\s?16|4\s?:\s?3|3\s?:\s?4|3\s?:\s?2|2\s?:\s?3|1\s?:\s?1)\b/)
  switch (jawne?.[1].replace(/\s/g, '')) {
    case '21:9': return F(1536, 640, '21:9')
    case '16:9': return F(1344, 768, '16:9')
    case '9:16': return F(768, 1344, '9:16')
    case '4:3': return F(1152, 864, '4:3')
    case '3:4': return F(864, 1152, '3:4')
    case '3:2': return F(1248, 832, '3:2')
    case '2:3': return F(832, 1248, '2:3')
    case '1:1': return F(1024, 1024, '1:1')
  }
  if (/\b(story|stories|reels|rolka|tiktok|shorts|tapeta na telefon|tapetę na telefon)\b/.test(t)) return F(768, 1344, '9:16')
  if (/\b(baner|banner|youtube|miniatur|pulpit|tapet|panoram|kinow|nagłówek|naglowek)/.test(t)) return F(1344, 768, '16:9')
  if (/\b(plakat|okładk|okladk|pionow|portret|postać|postac|sylwet|model(ka)?\b|człowiek|czlowiek|kobiet|mężczyzn|mezczyzn)/.test(t)) return F(864, 1152, '3:4')
  if (/\b(poziom|krajobraz|pejzaż|pejzaz|widok|miasto|wnętrz|wnetrz|pokój|pokoj|dom\b|samochód|samochod|zachód słońca|gór[ay]\b)/.test(t)) return F(1248, 832, '3:2')
  if (/\b(logo|ikon|awatar|avatar|kwadrat|naklejk|sticker|emoji)/.test(t)) return F(1024, 1024, '1:1')
  return F(1024, 1024, '1:1')
}
