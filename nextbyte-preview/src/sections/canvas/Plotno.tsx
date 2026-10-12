import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PodpowiedzStartowa } from './PodpowiedzStartowa'
import { Lock } from 'lucide-react'
import { PRZESUNIECIE_LEBKA, STYL_PINEZKI, ZnacznikPineski } from './ZnacznikPineski'
import { etykietaPineski, pozycjaPineski, type Pociagniecie, type Narzedzie, type Pineska, type Warstwa, type Widok, type RamkaObszaru, type Rysunek } from './typy'

/**
 * Płótno: zdjęcia referencyjne i pineski.
 *
 * Bez biblioteki do kanwy — zwykły DOM z transformacją na warstwie sceny.
 * Zdjęcia są elementami `<img>`, więc przeglądarka zajmuje się dekodowaniem
 * i skalowaniem, a pineski da się kliknąć bez trafiania w piksel bitmapy.
 */

interface Props {
  warstwy: Warstwa[]
  pineski: Pineska[]
  wybranaWarstwa: string | null
  wybranaPineska: string | null
  narzedzie: Narzedzie
  widok: Widok
  onWidok: (w: Widok) => void
  onWybierzWarstwe: (id: string | null) => void
  /** zaznaczenie wielu zdjęć (Shift+klik, ramka, Ctrl+A) — pusta lista = zwykłe zaznaczenie pojedyncze */
  zaznaczone?: string[]
  onZaznaczone?: (ids: string[]) => void
  onWybierzPineske: (id: string | null) => void
  onZmienWarstwe: (id: string, zmiany: Partial<Warstwa>) => void
  onPrzesunPineske: (id: string, normalizedX: number, normalizedY: number) => void
  /** pineska została puszczona w nowym miejscu — pora odświeżyć jej opisy */
  onPineskaPrzesunieta?: (id: string) => void
  onWbijPineske: (layerId: string, normalizedX: number, normalizedY: number) => void
  onUpuscPliki: (pliki: File[]) => void
  ramka?: RamkaObszaru | null
  onZmienRamke?: (r: RamkaObszaru | null) => void
  intencja?: string | null
  onZaladujDemo?: () => void
  onOtworzDodawanie?: () => void
  /** prawy klik na zdjęciu — menu kontekstowe (pozycja w px okna) */
  onMenuWarstwy?: (id: string, x: number, y: number) => void
  /** inpainting: dotychczasowe pociągnięcia pędzla, rozmiar pędzla i zakończenie pociągnięcia */
  maska?: Pociagniecie[]
  srednicaPedzla?: number
  onPociagniecie?: (p: Pociagniecie) => void
  /** ołówek: pociągnięcia na płótnie, ich zaznaczenie i menu prawego przycisku */
  rysunki?: Rysunek[]
  zaznaczoneRysunki?: string[]
  kolorOlowka?: string
  /** pisak ołówka: cienka linia, gruby półprzezroczysty „zakres” albo napis z klawiatury */
  trybOlowka?: 'linia' | 'zakres' | 'tekst'
  /** kliknięcie w trybie napisu — miejsce w scenie, gdzie użytkownik chce dopisać tekst */
  /** tryb adnotacji: rysować wolno tylko po tym zdjęciu (punkty poza nim są przycinane do krawędzi) */
  ramkaRysowania?: { id: string; x: number; y: number; width: number; height: number } | null
  /** numery zadań (obszarów) pokazywane na zdjęciu w trybie adnotacji */
  znacznikiZadan?: { x: number; y: number; numer: number }[]
  /** grubości kresek liczone w pikselach ekranu (tryb adnotacji: widok bywa mocno przybliżony) */
  grubosciEkranowe?: boolean
  onNapis?: (x: number, y: number) => void
  /** przeciąganie zaznaczonych szkiców i napisów (przesunięcie względem poprzedniego ruchu, w jednostkach sceny) */
  onPrzesunRysunki?: (ids: string[], dx: number, dy: number) => void
  gruboscOlowka?: number
  onRysunek?: (r: Rysunek) => void
  onZaznaczRysunki?: (ids: string[]) => void
  onMenuRysunku?: (x: number, y: number) => void
}

type Uchwyt = 'nw' | 'ne' | 'se' | 'sw'

interface Operacja {
  rodzaj: 'przesuwanie' | 'skalowanie' | 'panorama' | 'pineska' | 'ramka' | 'pedzel' | 'zaznaczanie' | 'rysowanie' | 'przesuwanieRysunkow'
  /** przesuwanie szkiców / napisów: które */
  ids?: string[]
  punkty?: [number, number][]
  startX: number
  startY: number
  uchwyt?: Uchwyt
  migawka?: Warstwa
  /** przesuwanie grupy zaznaczonych zdjęć: pozycje wyjściowe */
  grupa?: { id: string; x: number; y: number }[]
  /** zaznaczanie ramką: zaznaczenie sprzed przeciągnięcia (dla Shift) */
  bazowe?: string[]
  idPineski?: string
  startWidok?: Widok
  /** czy wskaźnik w ogóle drgnął — odróżnia klik od przeciągnięcia */
  ruszony?: boolean
  startNormX?: number
  startNormY?: number
  /**
   * Odległość punktu chwytu od szpica pinezki (w układzie sceny). Chwyta się
   * łebek, a punktem pineski jest szpic — bez tej poprawki pinezka
   * odskakiwała na pierwszym ruchu, bo szpic lądował pod kursorem.
   */
  chwytX?: number
  chwytY?: number
}

const MIN = 24

/**
 * `setPointerCapture` rzuca, gdy wskaźnik nie jest już aktywny (szybkie
 * kliknięcie, zdarzenie syntetyczne, zgubiony pointerup). Rzut w handlerze
 * `pointerdown` przerywa go w połowie i operacja nigdy się nie zaczyna,
 * więc przechwycenie traktujemy jako miłe udogodnienie, nie warunek.
 */
function przechwyc(el: Element | null, pointerId: number) {
  try {
    ;(el as Element & { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(pointerId)
  } catch {
    /* brak przechwycenia to tylko gorszy UX przy wyjściu poza element */
  }
}

export function Plotno({
  warstwy,
  pineski,
  wybranaWarstwa,
  wybranaPineska,
  narzedzie,
  widok,
  onWidok,
  onWybierzWarstwe,
  zaznaczone = [],
  onZaznaczone,
  onWybierzPineske,
  onZmienWarstwe,
  onPrzesunPineske,
  onPineskaPrzesunieta,
  onWbijPineske,
  onUpuscPliki,
  ramka,
  onZmienRamke,
  intencja,
  onZaladujDemo,
  onOtworzDodawanie,
  maska = [],
  srednicaPedzla = 0.05,
  onPociagniecie,
  onMenuWarstwy,
  rysunki = [],
  zaznaczoneRysunki = [],
  kolorOlowka = 'auto',
  trybOlowka = 'linia',
  onNapis,
  grubosciEkranowe = false,
  ramkaRysowania = null,
  znacznikiZadan = [],
  onPrzesunRysunki,
  gruboscOlowka = 5,
  onRysunek,
  onZaznaczRysunki,
  onMenuRysunku,
}: Props) {
  const refKontener = useRef<HTMLDivElement>(null)
  const refOperacja = useRef<Operacja | null>(null)
  const [nadPlotnem, setNadPlotnem] = useState(false)
  const [podKursorem, setPodKursorem] = useState<string | null>(null)
  /** pineska w ręce — łebek się unosi, cień odsuwa */
  const [przeciagana, setPrzeciagana] = useState<string | null>(null)
  /** ramka zaznaczania w układzie sceny (do narysowania) */
  const [ramkaZaznaczania, setRamkaZaznaczania] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)

  const doSceny = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const r = refKontener.current?.getBoundingClientRect()
      if (!r) return { x: 0, y: 0 }
      return { x: (e.clientX - r.left - widok.x) / widok.zoom, y: (e.clientY - r.top - widok.y) / widok.zoom }
    },
    [widok],
  )

  /* ── Zoom kółkiem ─────────────────────────────────────────────── */

  useEffect(() => {
    const el = refKontener.current
    if (!el) return
    const naKolko = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect()
        const mx = e.clientX - r.left
        const my = e.clientY - r.top
        const nowyZoom = Math.min(6, Math.max(0.05, widok.zoom * Math.exp(-e.deltaY * 0.0022)))
        onWidok({
          zoom: nowyZoom,
          x: mx - ((mx - widok.x) / widok.zoom) * nowyZoom,
          y: my - ((my - widok.y) / widok.zoom) * nowyZoom,
        })
      } else {
        onWidok({ ...widok, x: widok.x - e.deltaX, y: widok.y - e.deltaY })
      }
    }
    el.addEventListener('wheel', naKolko, { passive: false })
    return () => el.removeEventListener('wheel', naKolko)
  }, [widok, onWidok])

  /* Dotyk: dwa palce = przybliżanie i przesuwanie (pinch), jeden palec na pustym tle = przesuwanie widoku. */
  const dotyki = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; zoom: number; wx: number; wy: number } | null>(null)
  const srodekDotykow = () => {
    const pts = [...dotyki.current.values()]
    const r = refKontener.current?.getBoundingClientRect()
    const cx = (pts[0].x + pts[1].x) / 2 - (r?.left ?? 0)
    const cy = (pts[0].y + pts[1].y) / 2 - (r?.top ?? 0)
    return { cx, cy, dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) }
  }
  function dotykWDol(e: React.PointerEvent) {
    if (e.pointerType !== 'touch') return
    dotyki.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (dotyki.current.size === 2) {
      refOperacja.current = null
      const { cx, cy, dist } = srodekDotykow()
      pinch.current = { dist: Math.max(1, dist), zoom: widok.zoom, wx: (cx - widok.x) / widok.zoom, wy: (cy - widok.y) / widok.zoom }
    }
  }
  function dotykRuch(e: React.PointerEvent) {
    if (e.pointerType !== 'touch' || !dotyki.current.has(e.pointerId)) return
    dotyki.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinch.current && dotyki.current.size >= 2) {
      e.stopPropagation()
      const { cx, cy, dist } = srodekDotykow()
      const zoom = Math.min(6, Math.max(0.05, pinch.current.zoom * (dist / pinch.current.dist)))
      onWidok({ x: cx - pinch.current.wx * zoom, y: cy - pinch.current.wy * zoom, zoom })
    }
  }
  function dotykGora(e: React.PointerEvent) {
    if (e.pointerType !== 'touch') return
    dotyki.current.delete(e.pointerId)
    if (dotyki.current.size < 2) pinch.current = null
  }

  /* Trzymany Ctrl zmienia kursor na krzyżyk, żeby tryb pineski był widoczny
     zanim użytkownik kliknie — inaczej skrót jest niewidzialny. */
  const [ctrlWcisniety, setCtrlWcisniety] = useState(false)
  useEffect(() => {
    const sprawdz = (e: KeyboardEvent) => setCtrlWcisniety(e.ctrlKey || e.metaKey)
    const wyczysc = () => setCtrlWcisniety(false)
    window.addEventListener('keydown', sprawdz)
    window.addEventListener('keyup', sprawdz)
    window.addEventListener('blur', wyczysc)
    return () => {
      window.removeEventListener('keydown', sprawdz)
      window.removeEventListener('keyup', sprawdz)
      window.removeEventListener('blur', wyczysc)
    }
  }, [])

  /* ── Wskaźnik ─────────────────────────────────────────────────── */

  const [zywe, setZywe] = useState<Pociagniecie | null>(null)
  /** pociągnięcie ołówka w trakcie rysowania */
  /** grubość kreski w jednostkach sceny; w trybie adnotacji stała na ekranie, niezależnie od przybliżenia */
  const grubosc = (grubosciEkranowe ? (gruboscOlowka * 0.72) / Math.max(0.05, widok.zoom) : gruboscOlowka) * (trybOlowka === 'zakres' ? 5 : 1)
  const wRamce = (x: number, y: number) => !ramkaRysowania || (x >= ramkaRysowania.x && x <= ramkaRysowania.x + ramkaRysowania.width && y >= ramkaRysowania.y && y <= ramkaRysowania.y + ramkaRysowania.height)
  const doRamki = (p: { x: number; y: number }) =>
    ramkaRysowania ? { x: Math.min(ramkaRysowania.x + ramkaRysowania.width, Math.max(ramkaRysowania.x, p.x)), y: Math.min(ramkaRysowania.y + ramkaRysowania.height, Math.max(ramkaRysowania.y, p.y)) } : p
  const [zywyRysunek, setZywyRysunek] = useState<[number, number][] | null>(null)

  function naTleWDol(e: React.PointerEvent) {
    przechwyc(e.target as Element, e.pointerId)
    if (narzedzie === 'reka' || e.button === 1 || e.altKey || (e.pointerType === 'touch' && narzedzie === 'wybor')) {
      refOperacja.current = { rodzaj: 'panorama', startX: e.clientX, startY: e.clientY, startWidok: { ...widok } }
      return
    }
    if (narzedzie === 'olowek' && e.button === 0) {
      const p = doSceny(e)
      if (!wRamce(p.x, p.y)) return // tryb adnotacji: poza zdjęciem nie rysujemy
      if (trybOlowka === 'tekst') {
        onNapis?.(p.x, p.y)
        return
      }
      refOperacja.current = { rodzaj: 'rysowanie', startX: p.x, startY: p.y, punkty: [[p.x, p.y]] }
      setZywyRysunek([[p.x, p.y]])
      return
    }
    if (narzedzie === 'ramka') {
      onZmienRamke?.(null)
    }
    if (narzedzie === 'wybor' && e.button === 0 && !e.ctrlKey && !e.metaKey) {
      // zaznaczanie ramką; z Shiftem dokładamy do dotychczasowego zaznaczenia
      const p = doSceny(e)
      const bazowe = e.shiftKey ? (zaznaczone.length ? zaznaczone : wybranaWarstwa ? [wybranaWarstwa] : []) : []
      refOperacja.current = { rodzaj: 'zaznaczanie', startX: p.x, startY: p.y, bazowe }
      if (!e.shiftKey) {
        onWybierzWarstwe(null)
        onZaznaczone?.([])
        onZaznaczRysunki?.([])
      }
      onWybierzPineske(null)
      return
    }
    onWybierzWarstwe(null)
    onZaznaczone?.([])
    onWybierzPineske(null)
    if (!e.shiftKey && e.button !== 2) onZaznaczRysunki?.([])
  }

  function naWarstwieWDol(e: React.PointerEvent, warstwa: Warstwa) {
    if (warstwa.locked) return
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)

    if (narzedzie === 'olowek') {
      if (ramkaRysowania && warstwa.id !== ramkaRysowania.id) return // adnotacje tylko na zdjęciu, nad którym pracujemy
      if (!wRamce(p.x, p.y)) return
      if (trybOlowka === 'tekst') {
        onNapis?.(p.x, p.y)
        return
      }
      refOperacja.current = { rodzaj: 'rysowanie', startX: p.x, startY: p.y, punkty: [[p.x, p.y]] }
      setZywyRysunek([[p.x, p.y]])
      return
    }

    if (narzedzie === 'pedzel' && !warstwa.generator) {
      const punkt: [number, number] = [
        Math.min(1, Math.max(0, (p.x - warstwa.x) / warstwa.width)),
        Math.min(1, Math.max(0, (p.y - warstwa.y) / warstwa.height)),
      ]
      refOperacja.current = { rodzaj: 'pedzel', startX: p.x, startY: p.y, migawka: warstwa, punkty: [punkt, punkt] }
      onWybierzWarstwe(warstwa.id)
      onWybierzPineske(null)
      setZywe({ layerId: warstwa.id, punkty: [punkt, punkt], srednica: srednicaPedzla })
      return
    }

    if (narzedzie === 'ramka') {
      const normX = Math.min(1, Math.max(0, (p.x - warstwa.x) / warstwa.width))
      const normY = Math.min(1, Math.max(0, (p.y - warstwa.y) / warstwa.height))
      refOperacja.current = {
        rodzaj: 'ramka',
        startX: p.x,
        startY: p.y,
        startNormX: normX,
        startNormY: normY,
        migawka: warstwa,
        ruszony: false,
      }
      onWybierzWarstwe(warstwa.id)
      onWybierzPineske(null)
      onZmienRamke?.({
        layerId: warstwa.id,
        x0: normX,
        y0: normY,
        x1: normX,
        y1: normY,
        etykieta: 'Obszar roboczy',
      })
      return
    }

    // Ctrl (Cmd) + klik wbija pineskę bez przełączania narzędzia. To jest
    // główna droga: sięganie do paska narzędzi za każdym razem, gdy chce się
    // wskazać obiekt, rozbija pracę na dwa ruchy zamiast jednego.
    // Kursor z krzyżykiem pokazuje ten tryb już przy samym trzymaniu Ctrl.
    if (narzedzie === 'pineska' || e.ctrlKey || e.metaKey) {
      onWbijPineske(
        warstwa.id,
        Math.min(1, Math.max(0, (p.x - warstwa.x) / warstwa.width)),
        Math.min(1, Math.max(0, (p.y - warstwa.y) / warstwa.height)),
      )
      return
    }

    // Shift+klik: dodaj / zdejmij zdjęcie z zaznaczenia
    if (e.shiftKey && narzedzie === 'wybor') {
      const baza = zaznaczone.length ? zaznaczone : wybranaWarstwa ? [wybranaWarstwa] : []
      const wynik = baza.includes(warstwa.id) ? baza.filter(id => id !== warstwa.id) : [...baza, warstwa.id]
      onZaznaczone?.(wynik.length >= 2 ? wynik : [])
      onWybierzWarstwe(wynik.length ? (wynik.includes(warstwa.id) ? warstwa.id : wynik[0]) : null)
      onWybierzPineske(null)
      return
    }

    // klik w zdjęcie należące do zaznaczonej grupy: przeciągnięcie przesuwa całą grupę, sam klik zawęża do jednego
    if (zaznaczone.length >= 2 && zaznaczone.includes(warstwa.id)) {
      onWybierzPineske(null)
      refOperacja.current = {
        rodzaj: 'przesuwanie',
        startX: p.x,
        startY: p.y,
        migawka: { ...warstwa },
        grupa: warstwy.filter(w => zaznaczone.includes(w.id)).map(w => ({ id: w.id, x: w.x, y: w.y })),
      }
      return
    }

    onWybierzWarstwe(warstwa.id)
    onZaznaczone?.([])
    onWybierzPineske(null)
    refOperacja.current = { rodzaj: 'przesuwanie', startX: p.x, startY: p.y, migawka: { ...warstwa } }
  }

  function naUchwycieWDol(e: React.PointerEvent, warstwa: Warstwa, uchwyt: Uchwyt) {
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)
    refOperacja.current = { rodzaj: 'skalowanie', startX: p.x, startY: p.y, uchwyt, migawka: { ...warstwa } }
  }

  function naPinesceWDol(e: React.PointerEvent, pineska: Pineska) {
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)
    const warstwa = warstwy.find(w => w.id === pineska.layerId)
    const szpic = warstwa ? pozycjaPineski(pineska, warstwa) : p
    refOperacja.current = {
      rodzaj: 'pineska',
      startX: p.x,
      startY: p.y,
      idPineski: pineska.id,
      chwytX: p.x - szpic.x,
      chwytY: p.y - szpic.y,
    }
  }

  function naRuchu(e: React.PointerEvent) {
    const op = refOperacja.current
    if (!op) return
    op.ruszony = true
    const p = doSceny(e)

    if (op.rodzaj === 'panorama' && op.startWidok) {
      onWidok({
        ...op.startWidok,
        x: op.startWidok.x + (e.clientX - op.startX),
        y: op.startWidok.y + (e.clientY - op.startY),
      })
      return
    }

    if (op.rodzaj === 'rysowanie' && op.punkty) {
      const ost = op.punkty[op.punkty.length - 1]
      const pk = doRamki(p)
      // pomijamy punkty bliżej niż ~1,5 px ekranu — gładsza i lżejsza linia
      if (Math.hypot(pk.x - ost[0], pk.y - ost[1]) * widok.zoom < 1.5) return
      op.punkty.push([pk.x, pk.y])
      setZywyRysunek([...op.punkty])
      return
    }

    if (op.rodzaj === 'przesuwanieRysunkow' && op.ids) {
      onPrzesunRysunki?.(op.ids, p.x - op.startX, p.y - op.startY)
      op.startX = p.x
      op.startY = p.y
      return
    }

    if (op.rodzaj === 'zaznaczanie') {
      setRamkaZaznaczania({ x0: op.startX, y0: op.startY, x1: p.x, y1: p.y })
      return
    }

    if (op.rodzaj === 'pedzel' && op.migawka && op.punkty) {
      op.punkty.push([
        Math.min(1, Math.max(0, (p.x - op.migawka.x) / op.migawka.width)),
        Math.min(1, Math.max(0, (p.y - op.migawka.y) / op.migawka.height)),
      ])
      setZywe({ layerId: op.migawka.id, punkty: [...op.punkty], srednica: srednicaPedzla })
      return
    }

    if (op.rodzaj === 'ramka' && op.migawka && op.startNormX !== undefined && op.startNormY !== undefined) {
      const currNormX = Math.min(1, Math.max(0, (p.x - op.migawka.x) / op.migawka.width))
      const currNormY = Math.min(1, Math.max(0, (p.y - op.migawka.y) / op.migawka.height))
      onZmienRamke?.({
        layerId: op.migawka.id,
        x0: Math.min(op.startNormX, currNormX),
        y0: Math.min(op.startNormY, currNormY),
        x1: Math.max(op.startNormX, currNormX),
        y1: Math.max(op.startNormY, currNormY),
        etykieta: 'Obszar roboczy',
      })
      return
    }

    if (op.rodzaj === 'pineska' && op.idPineski) {
      const pineska = pineski.find(x => x.id === op.idPineski)
      const warstwa = warstwy.find(w => w.id === pineska?.layerId)
      if (!pineska || !warstwa) return
      if (przeciagana !== pineska.id) setPrzeciagana(pineska.id)
      const x = p.x - (op.chwytX ?? 0)
      const y = p.y - (op.chwytY ?? 0)
      onPrzesunPineske(
        pineska.id,
        Math.min(1, Math.max(0, (x - warstwa.x) / warstwa.width)),
        Math.min(1, Math.max(0, (y - warstwa.y) / warstwa.height)),
      )
      return
    }

    if (!op.migawka) return
    const dx = p.x - op.startX
    const dy = p.y - op.startY
    const s = op.migawka

    if (op.rodzaj === 'przesuwanie') {
      if (op.grupa) {
        for (const g of op.grupa) onZmienWarstwe(g.id, { x: Math.round(g.x + dx), y: Math.round(g.y + dy) })
        return
      }
      onZmienWarstwe(s.id, { x: Math.round(s.x + dx), y: Math.round(s.y + dy) })
      return
    }

    if (op.rodzaj === 'skalowanie' && op.uchwyt) {
      // Zdjęcie skalujemy zawsze w proporcji — rozciągnięta referencja
      // wprowadza model w błąd, więc nie dajemy takiej możliwości.
      const proporcja = s.width / s.height
      const u = op.uchwyt
      const kierunekX = u === 'ne' || u === 'se' ? 1 : -1
      const nowaSzer = Math.max(MIN, s.width + dx * kierunekX)
      const nowaWys = Math.max(MIN, nowaSzer / proporcja)
      onZmienWarstwe(s.id, {
        width: Math.round(nowaSzer),
        height: Math.round(nowaWys),
        x: Math.round(u === 'nw' || u === 'sw' ? s.x + (s.width - nowaSzer) : s.x),
        y: Math.round(u === 'nw' || u === 'ne' ? s.y + (s.height - nowaWys) : s.y),
      })
    }
  }

  function naGorze(e?: React.PointerEvent) {
    const op = refOperacja.current
    refOperacja.current = null
    setPrzeciagana(null)
    // Dotyk: krótkie dotknięcie pustego tła odznacza (zdjęcia, pinezkę, szkice), przeciągnięcie przesunęło widok
    if (op?.rodzaj === 'panorama' && e?.pointerType === 'touch' && Math.hypot(e.clientX - op.startX, e.clientY - op.startY) < 8) {
      onWybierzWarstwe(null)
      onZaznaczone?.([])
      onWybierzPineske(null)
      onZaznaczRysunki?.([])
      return
    }
    if (op?.rodzaj === 'rysowanie' && op.punkty) {
      setZywyRysunek(null)
      const pkt = op.punkty.length === 1 ? [op.punkty[0], [op.punkty[0][0] + 0.01, op.punkty[0][1]] as [number, number]] : op.punkty
      onRysunek?.({ id: `ry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, punkty: pkt, kolor: kolorOlowka, grubosc, ...(trybOlowka === 'zakres' ? { zakres: true } : {}) })
      return
    }
    if (op?.rodzaj === 'zaznaczanie') {
      const r = ramkaZaznaczania
      setRamkaZaznaczania(null)
      // za mała ramka = zwykłe kliknięcie w tło (zaznaczenie już wyczyszczone)
      if (r && Math.abs(r.x1 - r.x0) * widok.zoom > 4 && Math.abs(r.y1 - r.y0) * widok.zoom > 4) {
        const x0 = Math.min(r.x0, r.x1)
        const x1 = Math.max(r.x0, r.x1)
        const y0 = Math.min(r.y0, r.y1)
        const y1 = Math.max(r.y0, r.y1)
        const trafione = warstwy
          .filter(w => w.visible && !w.locked && !w.generator && w.x < x1 && w.x + w.width > x0 && w.y < y1 && w.y + w.height > y0)
          .map(w => w.id)
        const wynik = [...new Set([...(op.bazowe ?? []), ...trafione])]
        onZaznaczone?.(wynik.length >= 2 ? wynik : [])
        onWybierzWarstwe(wynik[0] ?? null)
        const trafioneRys = rysunki
          .filter(ry => {
            const xs = ry.punkty.map(q => q[0])
            const ys = ry.punkty.map(q => q[1])
            return Math.min(...xs) < x1 && Math.max(...xs) > x0 && Math.min(...ys) < y1 && Math.max(...ys) > y0
          })
          .map(ry => ry.id)
        onZaznaczRysunki?.(op.bazowe && op.bazowe.length ? [...new Set([...zaznaczoneRysunki, ...trafioneRys])] : trafioneRys)
      }
      return
    }
    if (op?.rodzaj === 'przesuwanie' && op.grupa && !op.ruszony && op.migawka) {
      // klik bez przeciągnięcia w zdjęcie z grupy: zawężamy zaznaczenie do niego
      onZaznaczone?.([])
      onWybierzWarstwe(op.migawka.id)
      return
    }
    if (op?.rodzaj === 'pedzel' && op.migawka && op.punkty) {
      onPociagniecie?.({ layerId: op.migawka.id, punkty: op.punkty, srednica: srednicaPedzla })
      setZywe(null)
    }
    // Kliknięcie pineski bez przeciągnięcia = otwarcie jej karty. Rozdzielamy
    // to dopiero tutaj, bo w chwili wciśnięcia nie wiadomo, co się stanie.
    if (op?.rodzaj === 'pineska' && !op.ruszony && op.idPineski) onWybierzPineske(op.idPineski)
    if (op?.rodzaj === 'pineska' && op.ruszony && op.idPineski) onPineskaPrzesunieta?.(op.idPineski)

    // Kliknięcie narzędziem ramka bez przeciągnięcia = domyślny obszar roboczy 40% wokół wskazanego punktu
    if (op?.rodzaj === 'ramka' && op.migawka && op.startNormX !== undefined && op.startNormY !== undefined) {
      const sx = op.startNormX
      const sy = op.startNormY
      if (!op.ruszony || (ramka && Math.abs(ramka.x1 - ramka.x0) < 0.03 && Math.abs(ramka.y1 - ramka.y0) < 0.03)) {
        const pol = 0.2
        onZmienRamke?.({
          layerId: op.migawka.id,
          x0: Math.max(0, sx - pol),
          y0: Math.max(0, sy - pol),
          x1: Math.min(1, sx + pol),
          y1: Math.min(1, sy + pol),
          etykieta: 'Obszar roboczy',
        })
      }
    }
  }

  const odwrotna = 1 / widok.zoom

  return (
    <div
      ref={refKontener}
      onContextMenu={e => {
        // prawy przycisk wewnątrz ramki zaznaczonych szkiców → menu „Zamień w obraz” (a nie menu inspekcji platformy)
        const wyb = rysunki.filter(ry => zaznaczoneRysunki.includes(ry.id))
        if (wyb.length === 0 || !onMenuRysunku) return
        const p = doSceny(e)
        const xs = wyb.flatMap(ry => ry.punkty.map(q => q[0]))
        const ys = wyb.flatMap(ry => ry.punkty.map(q => q[1]))
        const pad = 10 / widok.zoom
        if (p.x >= Math.min(...xs) - pad && p.x <= Math.max(...xs) + pad && p.y >= Math.min(...ys) - pad && p.y <= Math.max(...ys) + pad) {
          e.preventDefault()
          e.stopPropagation()
          onMenuRysunku(e.clientX, e.clientY)
        }
      }}
      onPointerDownCapture={dotykWDol}
      onPointerMoveCapture={dotykRuch}
      onPointerUpCapture={dotykGora}
      onPointerCancelCapture={dotykGora}
      onPointerDown={naTleWDol}
      onPointerMove={naRuchu}
      onPointerUp={naGorze}
      onDragOver={e => {
        e.preventDefault()
        setNadPlotnem(true)
      }}
      onDragLeave={() => setNadPlotnem(false)}
      onDrop={e => {
        e.preventDefault()
        setNadPlotnem(false)
        onUpuscPliki([...e.dataTransfer.files])
      }}
      className="nb-cozy-tlo absolute inset-0 h-full w-full overflow-hidden"
      style={{
        cursor:
          narzedzie === 'reka'
            ? 'grab'
            : narzedzie === 'pineska' || ctrlWcisniety || narzedzie === 'ramka' || narzedzie === 'olowek'
            ? 'crosshair'
            : 'default',
        touchAction: 'none',
        // siatka tła podąża za widokiem (przesuwanie i zoom)
        ['--nb-wx' as string]: `${widok.x}px`,
        ['--nb-wy' as string]: `${widok.y}px`,
        ['--nb-wk' as string]: `${Math.max(48, Math.min(160, 96 * widok.zoom))}px`,
      }}
    >
      {/* Tło płaskie, bez kropek i siatki — jak na pustym płótnie w narzędziach projektowych */}
      {warstwy.length === 0 && rysunki.length === 0 && narzedzie !== 'olowek' && <PodpowiedzStartowa />}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${widok.x}px, ${widok.y}px) scale(${widok.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {warstwy.map(warstwa => {
          if (!warstwa.visible) return null
          const zaznaczona = wybranaWarstwa === warstwa.id || zaznaczone.includes(warstwa.id)
          return (
            <div
              key={warstwa.id}
              className="nb-warstwa-wejscie"
              onPointerDown={e => {
                if (e.button === 2) return
                naWarstwieWDol(e, warstwa)
              }}
              onContextMenu={e => {
                if (!onMenuWarstwy) return
                e.preventDefault()
                e.stopPropagation()
                onWybierzWarstwe(warstwa.id)
                onMenuWarstwy(warstwa.id, e.clientX, e.clientY)
              }}
              style={{
                position: 'absolute',
                left: warstwa.x,
                top: warstwa.y,
                width: warstwa.width,
                height: warstwa.height,
                transform: `rotate(${warstwa.rotation}deg)`,
                outline: zaznaczona ? `${2 * odwrotna}px solid hsl(var(--primary))` : undefined,
                boxShadow: `0 ${6 * odwrotna}px ${24 * odwrotna}px ${-8 * odwrotna}px hsl(var(--cozy-cien) / 0.3)`,
                cursor: narzedzie === 'pineska' || narzedzie === 'ramka' || narzedzie === 'pedzel' ? 'crosshair' : 'move',
              }}
            >
              {warstwa.generuje ? (
                <div className="nb-generuje" role="status" aria-label="Generowanie obrazu">
                  <div className="nb-generuje-znak">
                    <svg viewBox="0 0 24 24" width={34 * odwrotna} height={34 * odwrotna} fill="currentColor" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5zM18.5 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" /></svg>
                    <span style={{ fontSize: 12 * odwrotna, fontWeight: 600, letterSpacing: '0.02em' }}>Generuję…</span>
                  </div>
                </div>
              ) : warstwa.generator ? (
                <div style={{ width: '100%', height: '100%', background: 'hsl(var(--foreground) / 0.1)', display: 'grid', placeItems: 'center' }}>
                  <svg viewBox="0 0 24 24" width="22%" height="22%" fill="hsl(var(--foreground) / 0.18)" aria-hidden="true"><path d="M3 19 9.5 8l4 6.5 2.5-3.5L21 19H3Z" /><circle cx="17" cy="6.5" r="2" /></svg>
                </div>
              ) : (
                <img
                  src={warstwa.src}
                  alt={warstwa.name}
                  key={warstwa.src.length + warstwa.src.slice(-24)}
                  className="nb-obraz-wejscie"
                  draggable={false}
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', userSelect: 'none' }}
                />
              )}
              {warstwa.generator && !warstwa.generuje && (
                <>
                  <span style={{ position: 'absolute', left: 0, top: -22 * odwrotna, fontSize: 12 * odwrotna, color: '#38bdf8', whiteSpace: 'nowrap' }}>Image Generator</span>
                  <span style={{ position: 'absolute', right: 0, top: -22 * odwrotna, fontSize: 12 * odwrotna, color: '#38bdf8', whiteSpace: 'nowrap' }}>{warstwa.naturalWidth} × {warstwa.naturalHeight}</span>
                </>
              )}
              {[...maska, ...(zywe ? [zywe] : [])].filter(m => m.layerId === warstwa.id).length > 0 && (
                <svg
                  viewBox={`0 0 ${warstwa.width} ${warstwa.height}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  <g opacity={0.5} stroke="#38bdf8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {[...maska, ...(zywe ? [zywe] : [])]
                      .filter(m => m.layerId === warstwa.id)
                      .map((m, i) => (
                        <polyline
                          key={i}
                          points={m.punkty.map(([x, y]) => `${x * warstwa.width},${y * warstwa.height}`).join(' ')}
                          strokeWidth={m.srednica * warstwa.width}
                        />
                      ))}
                  </g>
                </svg>
              )}
            </div>
          )
        })}

        {/* Uchwyty skalowania — tylko rogi, bo proporcja jest zablokowana */}
        {wybranaWarstwa && zaznaczone.length < 2 &&
          (() => {
            const w = warstwy.find(x => x.id === wybranaWarstwa)
            if (!w || !w.visible || w.locked) return null
            const bok = 11 * odwrotna
            const rogi: { id: Uchwyt; x: number; y: number; kursor: string }[] = [
              { id: 'nw', x: 0, y: 0, kursor: 'nwse-resize' },
              { id: 'ne', x: w.width, y: 0, kursor: 'nesw-resize' },
              { id: 'se', x: w.width, y: w.height, kursor: 'nwse-resize' },
              { id: 'sw', x: 0, y: w.height, kursor: 'nesw-resize' },
            ]
            return (
              <div style={{ position: 'absolute', left: w.x, top: w.y, width: w.width, height: w.height, pointerEvents: 'none' }}>
                {rogi.map(r => (
                  <div
                    key={r.id}
                    onPointerDown={e => naUchwycieWDol(e, w, r.id)}
                    style={{
                      position: 'absolute',
                      left: r.x - bok / 2,
                      top: r.y - bok / 2,
                      width: bok,
                      height: bok,
                      background: 'hsl(var(--background))',
                      border: `${2 * odwrotna}px solid #38bdf8`,
                      borderRadius: 3 * odwrotna,
                      cursor: r.kursor,
                      pointerEvents: 'auto',
                    }}
                  />
                ))}
              </div>
            )
          })()}

        {/* Ołówek: szkice na płótnie (nad zdjęciami). Tylko ścieżki łapią kliknięcia i tylko w trybie wyboru. */}
        {(rysunki.length > 0 || zywyRysunek) && (
          <svg aria-hidden={false} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, overflow: 'visible', pointerEvents: 'none' }}>
            {rysunki.map(ry => {
              const d = 'M' + ry.punkty.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L')
              const wybrany = zaznaczoneRysunki.includes(ry.id)
              return (
                <g
                  key={ry.id}
                  style={{ pointerEvents: narzedzie === 'wybor' || (narzedzie === 'olowek' && trybOlowka === 'tekst' && ry.tekst) ? 'visibleStroke' : 'none', cursor: 'grab' }}
                  onPointerDown={e => {
                    const mozna = narzedzie === 'wybor' || (narzedzie === 'olowek' && trybOlowka === 'tekst' && ry.tekst)
                    if (!mozna || e.button === 2) return
                    e.stopPropagation()
                    onWybierzWarstwe(null)
                    onZaznaczone?.([])
                    onWybierzPineske(null)
                    const nowe = e.shiftKey ? (wybrany ? zaznaczoneRysunki.filter(i => i !== ry.id) : [...zaznaczoneRysunki, ry.id]) : wybrany ? zaznaczoneRysunki : [ry.id]
                    onZaznaczRysunki?.(nowe)
                    // przeciągnięcie przesuwa zaznaczone szkice i napisy
                    if (nowe.includes(ry.id)) {
                      przechwyc(e.currentTarget as Element, e.pointerId)
                      const p = doSceny(e)
                      refOperacja.current = { rodzaj: 'przesuwanieRysunkow', startX: p.x, startY: p.y, ids: nowe }
                    }
                  }}
                  onContextMenu={e => {
                    if (narzedzie !== 'wybor') return
                    e.preventDefault()
                    e.stopPropagation()
                    if (!wybrany) onZaznaczRysunki?.([ry.id])
                    onMenuRysunku?.(e.clientX, e.clientY)
                  }}
                >
                  {ry.kolor === '#111111' && !ry.tekst && !ry.zakres && <path d={d} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={ry.grubosc + 3 * odwrotna} strokeLinecap="round" strokeLinejoin="round" />}
                  {ry.tekst ? (
                    (() => {
                      const w = Math.max(ry.grubosc, ry.tekst.length * ry.grubosc * 0.58)
                      const pad = ry.grubosc * 0.55
                      const h = ry.grubosc * 1.7
                      const kolor = ry.kolor === 'auto' ? 'hsl(var(--foreground))' : ry.kolor
                      return (
                        <>
                          <rect
                            x={ry.punkty[0][0] - pad}
                            y={ry.punkty[0][1] - h / 2}
                            width={w + pad * 2}
                            height={h}
                            rx={h / 2}
                            fill="hsl(var(--card) / 0.94)"
                            stroke={kolor}
                            strokeWidth={Math.max(1, ry.grubosc / 9)}
                            style={{ filter: 'drop-shadow(0 2px 6px hsl(0 0% 0% / 0.35))' }}
                          />
                          <text
                            x={ry.punkty[0][0]}
                            y={ry.punkty[0][1]}
                            dominantBaseline="central"
                            fontSize={ry.grubosc}
                            fontWeight={600}
                            fontFamily="Inter, system-ui, sans-serif"
                            fill="hsl(var(--foreground))"
                            style={{ userSelect: 'none' }}
                          >
                            {ry.tekst}
                          </text>
                        </>
                      )
                    })()
                  ) : (
                    <path d={d} fill="none" stroke={ry.kolor === 'auto' ? undefined : ry.kolor} style={ry.kolor === 'auto' ? { stroke: 'hsl(var(--foreground))' } : undefined} strokeOpacity={ry.zakres ? 0.45 : 1} strokeWidth={ry.grubosc} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* szersza, niewidoczna ścieżka — łatwiej trafić palcem */}
                  <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(ry.grubosc, 14 * odwrotna)} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )
            })}
            {znacznikiZadan.map(z => (
              <g key={`zn-${z.numer}`} style={{ pointerEvents: 'none' }}>
                <circle cx={z.x} cy={z.y} r={12 * odwrotna} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2 * odwrotna} />
                <text x={z.x} y={z.y} textAnchor="middle" dominantBaseline="central" fontSize={12 * odwrotna} fontWeight={700} fontFamily="Inter, system-ui, sans-serif" fill="hsl(var(--primary-foreground))">
                  {z.numer}
                </text>
              </g>
            ))}
            {zywyRysunek && (
              <path d={'M' + zywyRysunek.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L')} fill="none" stroke={kolorOlowka === 'auto' ? undefined : kolorOlowka} style={kolorOlowka === 'auto' ? { stroke: 'hsl(var(--foreground))' } : undefined} strokeOpacity={trybOlowka === 'zakres' ? 0.45 : 1} strokeWidth={grubosc} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {(() => {
              const wyb = rysunki.filter(ry => zaznaczoneRysunki.includes(ry.id))
              if (wyb.length === 0 || (ramkaRysowania && narzedzie !== 'wybor')) return null
              const xs = wyb.flatMap(ry => ry.punkty.map(q => q[0]))
              const ys = wyb.flatMap(ry => ry.punkty.map(q => q[1]))
              const pad = 8 * odwrotna + Math.max(...wyb.map(ry => ry.grubosc)) / 2
              return (
                <rect
                  x={Math.min(...xs) - pad}
                  y={Math.min(...ys) - pad}
                  width={Math.max(...xs) - Math.min(...xs) + pad * 2}
                  height={Math.max(...ys) - Math.min(...ys) + pad * 2}
                  fill="rgba(56,189,248,0.06)"
                  stroke="#38bdf8"
                  strokeWidth={1.5 * odwrotna}
                  strokeDasharray={`${6 * odwrotna} ${4 * odwrotna}`}
                  rx={3 * odwrotna}
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()}
          </svg>
        )}

        {/* Ramka zaznaczania wielu zdjęć */}
        {ramkaZaznaczania && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: Math.min(ramkaZaznaczania.x0, ramkaZaznaczania.x1),
              top: Math.min(ramkaZaznaczania.y0, ramkaZaznaczania.y1),
              width: Math.abs(ramkaZaznaczania.x1 - ramkaZaznaczania.x0),
              height: Math.abs(ramkaZaznaczania.y1 - ramkaZaznaczania.y0),
              border: `${1.5 * odwrotna}px solid #38bdf8`,
              background: 'rgba(56,189,248,0.10)',
              borderRadius: 3 * odwrotna,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Obszar roboczy ramki (Lovart Semi-transparent Magenta Inpainting Area) */}
        {ramka && (() => {
          const w = warstwy.find(x => x.id === ramka.layerId)
          if (!w || !w.visible) return null
          const x0 = Math.min(ramka.x0, ramka.x1)
          const x1 = Math.max(ramka.x0, ramka.x1)
          const y0 = Math.min(ramka.y0, ramka.y1)
          const y1 = Math.max(ramka.y0, ramka.y1)
          const rx = w.x + x0 * w.width
          const ry = w.y + y0 * w.height
          const rw = Math.max(4, (x1 - x0) * w.width)
          const rh = Math.max(4, (y1 - y0) * w.height)

          return (
            <div
              key="obszar-roboczy-ramka"
              style={{
                position: 'absolute',
                left: rx,
                top: ry,
                width: rw,
                height: rh,
                backgroundColor: 'rgba(255, 0, 255, 0.28)',
                border: `${2.5 * odwrotna}px solid #ff00ff`,
                boxShadow: `0 0 ${12 * odwrotna}px rgba(255, 0, 255, 0.45)`,
                pointerEvents: 'none',
                zIndex: 4,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -24 * odwrotna,
                  transform: `scale(${odwrotna})`,
                  transformOrigin: '0 100%',
                  pointerEvents: 'auto',
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-t-md bg-[#ff00ff] px-2 py-0.5 text-[10.5px] font-bold text-white shadow-lg"
              >
                <span>{ramka.etykieta || 'Obszar roboczy (Magenta Mask)'}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    onZmienRamke?.(null)
                  }}
                  className="ml-1 rounded px-1 text-[11px] font-black hover:bg-black/25 transition-colors cursor-pointer"
                  title="Usuń zaznaczony obszar"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })()}



        {/* Pineski — pinezki wbite w zdjęcie; szpic igły to punkt pineski */}
        {pineski.map((p, i) => {
          const warstwa = warstwy.find(w => w.id === p.layerId)
          if (!warstwa || !warstwa.visible) return null
          const poz = pozycjaPineski(p, warstwa)
          const aktywna = wybranaPineska === p.id
          const najechana = podKursorem === p.id
          const wReku = przeciagana === p.id

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: poz.x,
                top: poz.y,
                width: 0,
                height: 0,
                transform: `scale(${odwrotna})`,
                transformOrigin: '0 0',
                // Wybrana i trzymana w ręce idą nad pozostałe
                zIndex: wReku ? 8 : aktywna ? 7 : 5,
              }}
            >
              <ZnacznikPineski
                numer={i + 1}
                chroniona={p.chroniona}
                aktywna={aktywna}
                najechana={najechana}
                przeciagana={wReku}
                analizowana={p.analizowana}
                onPointerDown={e => naPinesceWDol(e, p)}
                onMouseEnter={() => setPodKursorem(p.id)}
                onMouseLeave={() => setPodKursorem(s => (s === p.id ? null : s))}
              />

              {/* Lupa przy przeciąganiu — mały podgląd tego, co jest pod szpicem pineski */}
              {wReku && (() => {
                const LUPA = 124
                const POWIEKSZENIE = 1.6
                const szer = warstwa.width * widok.zoom * POWIEKSZENIE
                const wys = warstwa.height * widok.zoom * POWIEKSZENIE
                return (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute overflow-hidden rounded-2xl border border-white/40 shadow-[0_14px_40px_-8px_rgba(0,0,0,0.65)]"
                    style={{
                      left: 30,
                      top: -LUPA - 34,
                      width: LUPA,
                      height: LUPA,
                      backgroundColor: 'hsl(var(--background))',
                      backgroundImage: `url("${warstwa.src}")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${szer}px ${wys}px`,
                      backgroundPosition: `${LUPA / 2 - p.normalizedX * szer}px ${LUPA / 2 - p.normalizedY * wys}px`,
                    }}
                  >
                    {/* Celownik w punkcie pineski */}
                    <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
                    <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
                    <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/20" />
                  </div>
                )
              })()}

              {/* Dymek przy najechaniu — nazwa obiektu obok łebka */}
              {najechana && !aktywna && !wReku && (
                <div
                  style={{
                    position: 'absolute',
                    left: PRZESUNIECIE_LEBKA.x + 20,
                    top: PRZESUNIECIE_LEBKA.y,
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    className="nb-szklo nb-szklo-plynne nb-powierzchnia flex items-center gap-2 whitespace-nowrap rounded-xl border border-foreground/[0.12] px-3 py-1.5 text-[11px] font-medium text-foreground"
                    style={{ backgroundColor: 'hsl(var(--card) / 0.5)', WebkitBackdropFilter: 'blur(18px) saturate(170%)', backdropFilter: 'blur(18px) saturate(170%)' }}
                  >
                    {p.chroniona && <Lock className="h-3 w-3 text-muted-foreground" />}
                    {etykietaPineski(p, i + 1)}
                    <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      klik — edytuj
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ekran startowy: przyjazne powitanie i jedna strefa upuszczenia */}

      {nadPlotnem && warstwy.length > 0 && (
        <div className="pointer-events-none absolute inset-3 rounded-[28px] border-2 border-dashed border-primary/50 bg-primary/[0.05]" />
      )}

      <style>{STYL_PINEZKI}</style>
    </div>
  )
}
