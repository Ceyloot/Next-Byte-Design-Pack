/**
 * Grupy, wyrównywanie i rozkładanie.
 *
 * Scena zostaje płaską listą — grupa to zwykły węzeł typu `grupa`, a
 * przynależność zapisuje `rodzic` na dziecku. Drzewo obiektów byłoby
 * czystsze teoretycznie, ale płaska lista daje darmową kolejność warstw
 * i nie wymaga przepisywania renderera ani eksportu.
 */

import { bazowyWezel, nowyId, type Wezel } from './typy'
import type { Ramka } from './przyciaganie'

/* ── Hierarchia ──────────────────────────────────────────────────── */

export function dzieci(wezly: Wezel[], id: string): Wezel[] {
  return wezly.filter(w => w.rodzic === id)
}

/** Wszystkie węzły pod danym, na dowolnej głębokości. */
export function potomkowie(wezly: Wezel[], id: string): Wezel[] {
  const wynik: Wezel[] = []
  const kolejka = [id]
  while (kolejka.length) {
    const biezacy = kolejka.pop() as string
    for (const w of wezly) {
      if (w.rodzic === biezacy) {
        wynik.push(w)
        kolejka.push(w.id)
      }
    }
  }
  return wynik
}

/**
 * Najwyższy przodek węzła. Klik na kanwie zaznacza właśnie jego — inaczej
 * grupa nie byłaby grupą, bo każdy klik wyciągałby pojedynczy kształt.
 */
export function korzen(wezly: Wezel[], id: string): string {
  let biezacy = wezly.find(w => w.id === id)
  const odwiedzone = new Set<string>()
  while (biezacy?.rodzic && !odwiedzone.has(biezacy.rodzic)) {
    odwiedzone.add(biezacy.rodzic)
    const rodzic = wezly.find(w => w.id === biezacy?.rodzic)
    if (!rodzic) break
    biezacy = rodzic
  }
  return biezacy?.id ?? id
}

/** Selekcja rozszerzona o potomków — to się faktycznie przesuwa. */
export function zPotomkami(wezly: Wezel[], ids: string[]): string[] {
  const zbior = new Set(ids)
  for (const id of ids) for (const p of potomkowie(wezly, id)) zbior.add(p.id)
  return [...zbior]
}

/* ── Ramki ───────────────────────────────────────────────────────── */

export function ramkaWezla(w: Wezel): Ramka {
  return { x: w.x, y: w.y, w: w.w, h: w.h }
}

/** Wspólna ramka zbioru węzłów. Pusty zbiór daje ramkę zerową. */
export function ramkaZbioru(wezly: Wezel[]): Ramka {
  if (wezly.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
  const x1 = Math.min(...wezly.map(w => w.x))
  const y1 = Math.min(...wezly.map(w => w.y))
  const x2 = Math.max(...wezly.map(w => w.x + w.w))
  const y2 = Math.max(...wezly.map(w => w.y + w.h))
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

/* ── Grupowanie ──────────────────────────────────────────────────── */

export interface WynikGrupowania {
  wezly: Wezel[]
  /** co zaznaczyć po operacji */
  zaznacz: string[]
}

/**
 * Tworzy grupę z zaznaczonych węzłów. Grupa ląduje na wierzchu warstw
 * (na pozycji najwyższego ze swoich dzieci), żeby nie przeskakiwała nagle
 * pod inne obiekty.
 */
export function utworzGrupe(wezly: Wezel[], ids: string[]): WynikGrupowania {
  const doGrupy = wezly.filter(w => ids.includes(w.id))
  if (doGrupy.length < 2) return { wezly, zaznacz: ids }

  const ramka = ramkaZbioru(doGrupy)
  const grupa = bazowyWezel({
    typ: 'grupa',
    nazwa: 'Grupa',
    x: ramka.x,
    y: ramka.y,
    w: ramka.w,
    h: ramka.h,
    wypelnienie: 'none',
    obrys: 'transparent',
    grubosc: 0,
    promien: 0,
  })
  // Grupa dziedziczy rodzica po dzieciach — grupowanie wewnątrz grupy
  // nie wyrzuca obiektów na korzeń sceny.
  grupa.rodzic = doGrupy[0].rodzic
  grupa.id = nowyId('g')

  const najwyzszy = Math.max(...doGrupy.map(w => wezly.findIndex(x => x.id === w.id)))
  const zPrzypisaniem = wezly.map(w => (ids.includes(w.id) ? { ...w, rodzic: grupa.id } : w))
  const wynik = [...zPrzypisaniem]
  wynik.splice(najwyzszy + 1, 0, grupa)

  return { wezly: wynik, zaznacz: [grupa.id] }
}

/** Rozbija grupy z zaznaczenia; dzieci wracają do rodzica grupy. */
export function rozgrupuj(wezly: Wezel[], ids: string[]): WynikGrupowania {
  const grupy = wezly.filter(w => ids.includes(w.id) && w.typ === 'grupa')
  if (grupy.length === 0) return { wezly, zaznacz: ids }

  const idGrup = new Set(grupy.map(g => g.id))
  const uwolnione: string[] = []
  const wynik = wezly
    .filter(w => !idGrup.has(w.id))
    .map(w => {
      if (w.rodzic && idGrup.has(w.rodzic)) {
        uwolnione.push(w.id)
        const grupa = grupy.find(g => g.id === w.rodzic)
        return { ...w, rodzic: grupa?.rodzic }
      }
      return w
    })

  return { wezly: wynik, zaznacz: uwolnione }
}

/**
 * Przesunięcie węzła razem z potomkami. Zwraca mapę id → nowa pozycja,
 * bo wołający i tak aktualizuje węzły pojedynczo.
 */
export function przesunZPotomkami(
  wezly: Wezel[],
  id: string,
  dx: number,
  dy: number,
): Record<string, { x: number; y: number }> {
  const mapa: Record<string, { x: number; y: number }> = {}
  const wezel = wezly.find(w => w.id === id)
  if (!wezel) return mapa
  mapa[id] = { x: wezel.x + dx, y: wezel.y + dy }
  for (const p of potomkowie(wezly, id)) mapa[p.id] = { x: p.x + dx, y: p.y + dy }
  return mapa
}

/* ── Wyrównywanie ────────────────────────────────────────────────── */

export type TrybWyrownania = 'lewo' | 'srodekX' | 'prawo' | 'gora' | 'srodekY' | 'dol'

/**
 * Wyrównuje zaznaczone węzły do wspólnej ramki. Przy jednym zaznaczonym
 * węźle celem jest ramka dokumentu — „wyśrodkuj na stronie” to najczęstsza
 * operacja i nie ma sensu wymagać do niej drugiego obiektu.
 */
export function wyrownaj(wezly: Wezel[], ids: string[], tryb: TrybWyrownania, dokument: Ramka): Wezel[] {
  const zaznaczone = wezly.filter(w => ids.includes(w.id))
  if (zaznaczone.length === 0) return wezly
  const cel = zaznaczone.length === 1 ? dokument : ramkaZbioru(zaznaczone)

  const przesuniecia: Record<string, { x: number; y: number }> = {}
  for (const w of zaznaczone) {
    let dx = 0
    let dy = 0
    switch (tryb) {
      case 'lewo':    dx = cel.x - w.x; break
      case 'srodekX': dx = cel.x + cel.w / 2 - (w.x + w.w / 2); break
      case 'prawo':   dx = cel.x + cel.w - (w.x + w.w); break
      case 'gora':    dy = cel.y - w.y; break
      case 'srodekY': dy = cel.y + cel.h / 2 - (w.y + w.h / 2); break
      case 'dol':     dy = cel.y + cel.h - (w.y + w.h); break
    }
    if (dx === 0 && dy === 0) continue
    Object.assign(przesuniecia, przesunZPotomkami(wezly, w.id, dx, dy))
  }

  return zastosujPozycje(wezly, przesuniecia)
}

/**
 * Równe odstępy między zaznaczonymi. Skrajne zostają na miejscu, środkowe
 * rozjeżdżają się tak, żeby przerwy były identyczne — liczone od krawędzi,
 * nie od środków, bo wizualnie liczy się światło między obiektami.
 */
export function rozloz(wezly: Wezel[], ids: string[], os: 'x' | 'y'): Wezel[] {
  const zaznaczone = wezly.filter(w => ids.includes(w.id))
  if (zaznaczone.length < 3) return wezly

  const rozmiar = os === 'x' ? 'w' : 'h'
  const posortowane = [...zaznaczone].sort((a, b) => a[os] - b[os])
  const pierwszy = posortowane[0]
  const ostatni = posortowane[posortowane.length - 1]

  const zajete = posortowane.reduce((suma, w) => suma + w[rozmiar], 0)
  const rozpietosc = ostatni[os] + ostatni[rozmiar] - pierwszy[os]
  const przerwa = (rozpietosc - zajete) / (posortowane.length - 1)

  const przesuniecia: Record<string, { x: number; y: number }> = {}
  let kursor = pierwszy[os] + pierwszy[rozmiar] + przerwa

  for (let i = 1; i < posortowane.length - 1; i++) {
    const w = posortowane[i]
    const delta = kursor - w[os]
    if (delta !== 0) {
      Object.assign(przesuniecia, przesunZPotomkami(wezly, w.id, os === 'x' ? delta : 0, os === 'y' ? delta : 0))
    }
    kursor += w[rozmiar] + przerwa
  }

  return zastosujPozycje(wezly, przesuniecia)
}

function zastosujPozycje(wezly: Wezel[], pozycje: Record<string, { x: number; y: number }>): Wezel[] {
  return wezly.map(w => {
    const nowa = pozycje[w.id]
    if (!nowa) return w
    // Klatki pozycji jadą razem z węzłem, inaczej animacja odciągnęłaby
    // obiekt z powrotem na stary tor.
    const przesX = nowa.x - w.x
    const przesY = nowa.y - w.y
    const klatki = w.klatki.map(k =>
      k.wlasciwosc === 'x'
        ? { ...k, wartosc: k.wartosc + przesX }
        : k.wlasciwosc === 'y'
          ? { ...k, wartosc: k.wartosc + przesY }
          : k,
    )
    return { ...w, x: nowa.x, y: nowa.y, klatki }
  })
}
