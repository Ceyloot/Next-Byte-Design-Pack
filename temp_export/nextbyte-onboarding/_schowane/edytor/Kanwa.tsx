import React, { useCallback, useEffect, useRef, useState } from 'react'
import { doAtrybutuD, stanWCzasie } from './animacja'
import { korzen, potomkowie, ramkaZbioru } from './grupy'
import { przyciagnijKrawedz, przyciagnijRamke, type Linia, type Ramka } from './przyciaganie'
import { RenderWezla } from './RenderWezla'
import { bazowyWezel, type Narzedzie, type Projekt, type Punkt, type Wezel } from './typy'

/**
 * Kanwa: scena + obsługa myszy.
 *
 * Węzły leżą w zwykłym DOM (transform/left/top), a nie w jednym <svg>,
 * bo kafelki muszą mieć prawdziwy backdrop-filter — inaczej podgląd
 * szkła kłamałby względem wygenerowanego kodu.
 */

export interface Widok {
  x: number
  y: number
  zoom: number
}

type UchwytId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface Operacja {
  rodzaj: 'przesuwanie' | 'skalowanie' | 'panorama' | 'rysowanie' | 'punkt' | 'uchwyt' | 'zaznaczanie'
  startX: number
  startY: number
  uchwyt?: UchwytId
  /** migawka węzłów w chwili rozpoczęcia — liczymy zawsze od niej */
  migawka?: Record<string, Wezel>
  /** id faktycznie zaznaczone (bez potomków) — one wyznaczają ramkę operacji */
  korzenie?: string[]
  indeksPunktu?: number
  ktoryUchwyt?: 'w' | 'z'
  startWidok?: Widok
}

/** Ile pikseli ekranu łapie przyciąganie. Dzielone przez zoom przy użyciu. */
const TOLERANCJA_PRZYCIAGANIA = 7

interface KanwaProps {
  projekt: Projekt
  wybrane: string[]
  narzedzie: Narzedzie
  czas: number
  siatka: number
  trybPunktow: boolean
  widok: Widok
  onWidok: (w: Widok) => void
  onWybierz: (ids: string[]) => void
  onAktualizuj: (id: string, zmiany: Partial<Wezel>) => void
  onDodaj: (wezel: Wezel) => void
  onNarzedzie: (n: Narzedzie) => void
  onZakonczOperacje: () => void
  /**
   * Tryb podglądu: kanwa przestaje być edytorem i zaczyna być komponentem.
   * Bez tego nie da się sprawdzić, czy przejścia w ogóle działają, inaczej
   * niż eksportując kod i wklejając go gdzie indziej.
   */
  podglad?: {
    przejscie: string
    onKlik: (idWezla: string) => void
    onNajazd: (idWezla: string) => void
  }
}

const MIN = 4

/** setPointerCapture rzuca, gdy wskaźnik nie jest aktywny — nie wolno mu ubić handlera. */
function przechwyc(el: Element | null, pointerId: number) {
  try {
    ;(el as Element & { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(pointerId)
  } catch {
    /* brak przechwycenia to tylko gorszy UX przy wyjściu poza element */
  }
}

export function Kanwa({
  projekt,
  wybrane,
  narzedzie,
  czas,
  siatka,
  trybPunktow,
  widok,
  onWidok,
  onWybierz,
  onAktualizuj,
  onDodaj,
  onNarzedzie,
  onZakonczOperacje,
  podglad,
}: KanwaProps) {
  const refKontener = useRef<HTMLDivElement>(null)
  const refOperacja = useRef<Operacja | null>(null)
  const [szkic, setSzkic] = useState<Punkt[]>([])
  const [ramka, setRamka] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  // Ramka trzymana też w ref: przy bardzo szybkim przeciągnięciu pointerup
  // potrafi trafić przed przerysowaniem i stan byłby nieaktualny.
  const refRamka = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const [kursor, setKursor] = useState<{ x: number; y: number } | null>(null)
  const [linie, setLinie] = useState<Linia[]>([])

  /* ── Układ współrzędnych ─────────────────────────────────────── */

  const doSceny = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const r = refKontener.current?.getBoundingClientRect()
      if (!r) return { x: 0, y: 0 }
      return {
        x: (e.clientX - r.left - widok.x) / widok.zoom,
        y: (e.clientY - r.top - widok.y) / widok.zoom,
      }
    },
    [widok],
  )

  const przyciagnij = useCallback((n: number) => (siatka > 0 ? Math.round(n / siatka) * siatka : n), [siatka])

  /* ── Zoom i panorama kółkiem ─────────────────────────────────── */

  useEffect(() => {
    const el = refKontener.current
    if (!el) return
    const naKolko = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect()
        const mx = e.clientX - r.left
        const my = e.clientY - r.top
        const nowyZoom = Math.min(8, Math.max(0.08, widok.zoom * Math.exp(-e.deltaY * 0.0022)))
        // punkt pod kursorem ma zostać w miejscu
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

  /* ── Pióro ───────────────────────────────────────────────────── */

  const zakonczSzkic = useCallback(
    (zamknieta: boolean) => {
      if (szkic.length < 2) {
        setSzkic([])
        return
      }
      const minX = Math.min(...szkic.map(p => p.x))
      const minY = Math.min(...szkic.map(p => p.y))
      const maxX = Math.max(...szkic.map(p => p.x))
      const maxY = Math.max(...szkic.map(p => p.y))
      onDodaj(
        bazowyWezel({
          typ: 'sciezka',
          nazwa: 'Ścieżka',
          x: minX,
          y: minY,
          w: Math.max(maxX - minX, 1),
          h: Math.max(maxY - minY, 1),
          punkty: szkic.map(p => ({ x: p.x - minX, y: p.y - minY })),
          zamknieta,
          wypelnienie: zamknieta ? '#38bdf8' : 'none',
          obrys: zamknieta ? 'transparent' : '#38bdf8',
          grubosc: zamknieta ? 0 : 4,
        }),
      )
      setSzkic([])
      onNarzedzie('wybor')
    },
    [szkic, onDodaj, onNarzedzie],
  )

  useEffect(() => {
    const naKlawisz = (e: KeyboardEvent) => {
      if (narzedzie !== 'piora') return
      if (e.key === 'Enter') zakonczSzkic(false)
      if (e.key === 'Escape') setSzkic([])
    }
    window.addEventListener('keydown', naKlawisz)
    return () => window.removeEventListener('keydown', naKlawisz)
  }, [narzedzie, zakonczSzkic])

  /* ── Wskaźnik ────────────────────────────────────────────────── */

  /** Migawka zaznaczenia razem z potomkami grup — to się rusza razem. */
  const migawka = useCallback(
    (ids: string[]) => {
      const pelne = new Set(ids)
      for (const id of ids) for (const p of potomkowie(projekt.wezly, id)) pelne.add(p.id)
      const m: Record<string, Wezel> = {}
      for (const w of projekt.wezly) if (pelne.has(w.id)) m[w.id] = structuredClone(w)
      return m
    },
    [projekt.wezly],
  )

  /**
   * Do czego wolno się przyciągać: wszystko widoczne poza tym, co właśnie
   * ruszamy, plus ramka dokumentu i jej środek. Grupy pomijamy, bo ich
   * krawędzie pokrywają się z dziećmi i podwajałyby linie.
   */
  const celePrzyciagania = useCallback(
    (pomijane: Set<string>): Ramka[] => {
      const cele: Ramka[] = [{ x: 0, y: 0, w: projekt.szerokosc, h: projekt.wysokosc }]
      for (const w of projekt.wezly) {
        if (pomijane.has(w.id) || !w.widoczny || w.typ === 'grupa') continue
        cele.push({ x: w.x, y: w.y, w: w.w, h: w.h })
      }
      return cele
    },
    [projekt.wezly, projekt.szerokosc, projekt.wysokosc],
  )

  function naTleWDol(e: React.PointerEvent) {
    if (podglad) {
      // Klik w tło komponentu też bywa wyzwalaczem („dowolne miejsce”).
      podglad.onKlik('')
      return
    }
    const p = doSceny(e)
    przechwyc(e.target as Element, e.pointerId)

    if (narzedzie === 'reka' || e.button === 1 || e.altKey) {
      refOperacja.current = { rodzaj: 'panorama', startX: e.clientX, startY: e.clientY, startWidok: { ...widok } }
      return
    }
    if (narzedzie === 'piora') {
      const pierwszy = szkic[0]
      if (pierwszy && szkic.length > 2 && Math.hypot(pierwszy.x - p.x, pierwszy.y - p.y) < 10 / widok.zoom) {
        zakonczSzkic(true)
        return
      }
      setSzkic(s => [...s, { x: przyciagnij(p.x), y: przyciagnij(p.y) }])
      return
    }
    if (narzedzie === 'tekst') {
      onDodaj(
        bazowyWezel({
          typ: 'tekst',
          nazwa: 'Tekst',
          x: przyciagnij(p.x),
          y: przyciagnij(p.y),
          w: 220,
          h: 32,
          tekst: 'Nowy tekst',
          rozmiar: 22,
          waga: 700,
        }),
      )
      onNarzedzie('wybor')
      return
    }
    if (narzedzie === 'prostokat' || narzedzie === 'elipsa') {
      refOperacja.current = { rodzaj: 'rysowanie', startX: p.x, startY: p.y }
      refRamka.current = { x: p.x, y: p.y, w: 0, h: 0 }
      setRamka(refRamka.current)
      return
    }
    // Przeciągnięcie po pustym tle zaznacza ramką; samo kliknięcie czyści.
    refOperacja.current = { rodzaj: 'zaznaczanie', startX: p.x, startY: p.y }
    refRamka.current = { x: p.x, y: p.y, w: 0, h: 0 }
    if (!e.shiftKey) onWybierz([])
  }

  function naWezleWDol(e: React.PointerEvent, wezel: Wezel) {
    if (narzedzie !== 'wybor' || wezel.zablokowany) return
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)

    // Klik trafia w grupę, nie w kształt w środku. Alt wchodzi do wnętrza —
    // tak samo jak w narzędziach, które designer już zna.
    const cel = e.altKey ? wezel.id : korzen(projekt.wezly, wezel.id)
    const nowaSelekcja = e.shiftKey
      ? wybrane.includes(cel)
        ? wybrane.filter(id => id !== cel)
        : [...wybrane, cel]
      : wybrane.includes(cel)
        ? wybrane
        : [cel]
    onWybierz(nowaSelekcja)

    const p = doSceny(e)
    refOperacja.current = {
      rodzaj: 'przesuwanie',
      startX: p.x,
      startY: p.y,
      migawka: migawka(nowaSelekcja),
      korzenie: nowaSelekcja,
    }
  }

  function naUchwycieWDol(e: React.PointerEvent, uchwyt: UchwytId) {
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)
    refOperacja.current = {
      rodzaj: 'skalowanie',
      startX: p.x,
      startY: p.y,
      uchwyt,
      migawka: migawka(wybrane),
      korzenie: wybrane,
    }
  }

  function naPunkcieWDol(e: React.PointerEvent, indeks: number, ktory?: 'w' | 'z') {
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)
    refOperacja.current = {
      rodzaj: ktory ? 'uchwyt' : 'punkt',
      startX: p.x,
      startY: p.y,
      indeksPunktu: indeks,
      ktoryUchwyt: ktory,
      migawka: migawka(wybrane),
      korzenie: wybrane,
    }
  }

  function naRuchu(e: React.PointerEvent) {
    const p = doSceny(e)
    setKursor(p)
    const op = refOperacja.current
    if (!op) return

    if (op.rodzaj === 'panorama' && op.startWidok) {
      onWidok({ ...op.startWidok, x: op.startWidok.x + (e.clientX - op.startX), y: op.startWidok.y + (e.clientY - op.startY) })
      return
    }

    if (op.rodzaj === 'rysowanie' || op.rodzaj === 'zaznaczanie') {
      refRamka.current = {
        x: Math.min(op.startX, p.x),
        y: Math.min(op.startY, p.y),
        w: Math.abs(p.x - op.startX),
        h: Math.abs(p.y - op.startY),
      }
      setRamka(refRamka.current)
      return
    }

    const dx = p.x - op.startX
    const dy = p.y - op.startY

    if (op.rodzaj === 'przesuwanie' && op.migawka) {
      const korzenie = op.korzenie ?? Object.keys(op.migawka)
      const startowe = korzenie.map(id => op.migawka![id]).filter(Boolean)
      if (startowe.length === 0) return

      // Jedna wspólna delta dla całego zaznaczenia — przyciąganie liczone
      // raz, na wspólnej ramce. Gdyby każdy węzeł przyciągał się osobno,
      // zaznaczenie rozjeżdżałoby się przy każdym przesunięciu.
      const ramkaStartu = ramkaZbioru(startowe)
      let przesX = przyciagnij(ramkaStartu.x + dx) - ramkaStartu.x
      let przesY = przyciagnij(ramkaStartu.y + dy) - ramkaStartu.y

      if (!e.ctrlKey && !e.metaKey) {
        const pomijane = new Set(Object.keys(op.migawka))
        const wynik = przyciagnijRamke(
          { x: ramkaStartu.x + przesX, y: ramkaStartu.y + przesY, w: ramkaStartu.w, h: ramkaStartu.h },
          celePrzyciagania(pomijane),
          TOLERANCJA_PRZYCIAGANIA / widok.zoom,
        )
        przesX += wynik.dx
        przesY += wynik.dy
        setLinie(wynik.linie)
      } else {
        setLinie([])
      }

      for (const [id, start] of Object.entries(op.migawka)) {
        // Gdy pozycja jest animowana, przesuwamy też klatki — inaczej
        // węzeł „wracałby” do toru animacji i nie dało się go ułożyć.
        const klatki = start.klatki.map(k =>
          k.wlasciwosc === 'x'
            ? { ...k, wartosc: k.wartosc + przesX }
            : k.wlasciwosc === 'y'
              ? { ...k, wartosc: k.wartosc + przesY }
              : k,
        )
        onAktualizuj(id, { x: start.x + przesX, y: start.y + przesY, klatki })
      }
      return
    }

    if (op.rodzaj === 'skalowanie' && op.migawka && op.uchwyt) {
      const korzenie = op.korzenie ?? Object.keys(op.migawka)
      const pomijane = new Set(Object.keys(op.migawka))
      const cele = e.ctrlKey || e.metaKey ? [] : celePrzyciagania(pomijane)
      const tol = TOLERANCJA_PRZYCIAGANIA / widok.zoom
      const zebraneLinie: Linia[] = []

      for (const [id, s] of Object.entries(op.migawka)) {
        // Potomki grupy skalują się proporcjonalnie razem z nią, więc ich
        // nie liczymy z uchwytu — obsługuje je blok niżej.
        if (!korzenie.includes(id)) continue

        let { x, y, w, h } = s
        const u = op.uchwyt
        if (u.includes('w')) {
          const przyciagnieta = przyciagnijKrawedz(przyciagnij(s.x + dx), cele, tol, 'x', s.y, s.y + s.h)
          if (przyciagnieta.linia) zebraneLinie.push(przyciagnieta.linia)
          x = przyciagnieta.wartosc
          w = s.w + (s.x - x)
        }
        if (u.includes('n')) {
          const przyciagnieta = przyciagnijKrawedz(przyciagnij(s.y + dy), cele, tol, 'y', s.x, s.x + s.w)
          if (przyciagnieta.linia) zebraneLinie.push(przyciagnieta.linia)
          y = przyciagnieta.wartosc
          h = s.h + (s.y - y)
        }
        if (u.includes('e')) {
          const przyciagnieta = przyciagnijKrawedz(przyciagnij(s.x + s.w + dx), cele, tol, 'x', s.y, s.y + s.h)
          if (przyciagnieta.linia) zebraneLinie.push(przyciagnieta.linia)
          w = przyciagnieta.wartosc - s.x
        }
        if (u.includes('s')) {
          const przyciagnieta = przyciagnijKrawedz(przyciagnij(s.y + s.h + dy), cele, tol, 'y', s.x, s.x + s.w)
          if (przyciagnieta.linia) zebraneLinie.push(przyciagnieta.linia)
          h = przyciagnieta.wartosc - s.y
        }
        if (e.shiftKey) {
          const proporcja = s.w / s.h
          if (Math.abs(dx) > Math.abs(dy)) h = w / proporcja
          else w = h * proporcja
        }
        w = Math.max(MIN, w)
        h = Math.max(MIN, h)
        const zmiany: Partial<Wezel> = { x, y, w, h }

        // Grupa ciągnie dzieci: te same współczynniki, licząc od ramki
        // startowej grupy, żeby układ w środku został nietknięty.
        if (s.typ === 'grupa') {
          const sx = w / Math.max(s.w, 0.001)
          const sy = h / Math.max(s.h, 0.001)
          for (const [idDziecka, dziecko] of Object.entries(op.migawka)) {
            if (idDziecka === id || korzenie.includes(idDziecka)) continue
            onAktualizuj(idDziecka, {
              x: x + (dziecko.x - s.x) * sx,
              y: y + (dziecko.y - s.y) * sy,
              w: Math.max(MIN, dziecko.w * sx),
              h: Math.max(MIN, dziecko.h * sy),
            })
          }
        }
        // Ścieżkę skalujemy razem z punktami — przechowujemy je w układzie węzła.
        if (s.typ === 'sciezka' && s.punkty) {
          const sx = w / Math.max(s.w, 0.001)
          const sy = h / Math.max(s.h, 0.001)
          zmiany.punkty = s.punkty.map(pt => ({
            x: pt.x * sx,
            y: pt.y * sy,
            wx: pt.wx === undefined ? undefined : pt.wx * sx,
            wy: pt.wy === undefined ? undefined : pt.wy * sy,
            zx: pt.zx === undefined ? undefined : pt.zx * sx,
            zy: pt.zy === undefined ? undefined : pt.zy * sy,
          }))
        }
        onAktualizuj(id, zmiany)
      }
      setLinie(zebraneLinie)
      return
    }

    if ((op.rodzaj === 'punkt' || op.rodzaj === 'uchwyt') && op.migawka && op.indeksPunktu !== undefined) {
      const id = wybrane[0]
      const s = op.migawka[id]
      if (!s?.punkty) return
      const punkty = s.punkty.map((pt, i) => {
        if (i !== op.indeksPunktu) return pt
        if (op.rodzaj === 'uchwyt') {
          return op.ktoryUchwyt === 'w'
            ? { ...pt, wx: (pt.wx ?? pt.x) + dx, wy: (pt.wy ?? pt.y) + dy }
            : { ...pt, zx: (pt.zx ?? pt.x) + dx, zy: (pt.zy ?? pt.y) + dy }
        }
        return {
          ...pt,
          x: pt.x + dx,
          y: pt.y + dy,
          wx: pt.wx === undefined ? undefined : pt.wx + dx,
          wy: pt.wy === undefined ? undefined : pt.wy + dy,
          zx: pt.zx === undefined ? undefined : pt.zx + dx,
          zy: pt.zy === undefined ? undefined : pt.zy + dy,
        }
      })
      onAktualizuj(id, { punkty })
    }
  }

  function naGorze(e?: React.PointerEvent) {
    const op = refOperacja.current
    refOperacja.current = null
    setLinie([])

    const ramkaKoncowa = refRamka.current

    if (op?.rodzaj === 'zaznaczanie') {
      refRamka.current = null
      setRamka(null)
      // Ramka mniejsza od progu to zwykły klik w tło — selekcję wyczyścił
      // już handler wciśnięcia, więc tu nie ma co robić.
      if (!ramkaKoncowa || (ramkaKoncowa.w < MIN && ramkaKoncowa.h < MIN)) return
      const trafione = projekt.wezly
        .filter(w => w.widoczny && !w.zablokowany && !w.rodzic)
        .filter(
          w =>
            w.x < ramkaKoncowa.x + ramkaKoncowa.w &&
            w.x + w.w > ramkaKoncowa.x &&
            w.y < ramkaKoncowa.y + ramkaKoncowa.h &&
            w.y + w.h > ramkaKoncowa.y,
        )
        .map(w => w.id)
      onWybierz(e?.shiftKey ? [...new Set([...wybrane, ...trafione])] : trafione)
      return
    }

    if (op?.rodzaj === 'rysowanie' && ramkaKoncowa) {
      if (ramkaKoncowa.w > MIN && ramkaKoncowa.h > MIN) {
        onDodaj(
          bazowyWezel({
            typ: narzedzie === 'elipsa' ? 'elipsa' : 'prostokat',
            nazwa: narzedzie === 'elipsa' ? 'Elipsa' : 'Prostokąt',
            x: przyciagnij(ramkaKoncowa.x),
            y: przyciagnij(ramkaKoncowa.y),
            w: przyciagnij(ramkaKoncowa.w),
            h: przyciagnij(ramkaKoncowa.h),
            promien: narzedzie === 'elipsa' ? 0 : 12,
          }),
        )
        onNarzedzie('wybor')
      }
      refRamka.current = null
      setRamka(null)
      return
    }
    if (op) onZakonczOperacje()
  }

  /* ── Render ──────────────────────────────────────────────────── */

  const wybranyWezel = wybrane.length === 1 ? projekt.wezly.find(w => w.id === wybrane[0]) : undefined
  const edycjaPunktow = trybPunktow && wybranyWezel?.typ === 'sciezka' && wybranyWezel.punkty
  const skalaOdwrotna = 1 / widok.zoom

  return (
    <div
      ref={refKontener}
      onPointerDown={naTleWDol}
      onPointerMove={naRuchu}
      onPointerUp={naGorze}
      onPointerLeave={() => setKursor(null)}
      onDoubleClick={() => narzedzie === 'piora' && zakonczSzkic(false)}
      className="relative h-full w-full overflow-hidden"
      style={{
        cursor: narzedzie === 'reka' ? 'grab' : narzedzie === 'wybor' ? 'default' : 'crosshair',
        background:
          'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.06), transparent 60%), #07090d',
        touchAction: 'none',
      }}
    >
      {/* Warstwa sceny */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${widok.x}px, ${widok.y}px) scale(${widok.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Ramka dokumentu */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: projekt.szerokosc,
            height: projekt.wysokosc,
            background: projekt.tlo,
            borderRadius: 4,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.10), 0 40px 80px -40px rgba(0,0,0,0.9)',
            backgroundImage:
              siatka > 0
                ? `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`
                : undefined,
            backgroundSize: siatka > 0 ? `${siatka}px ${siatka}px` : undefined,
          }}
        />

        {/* Węzły */}
        {projekt.wezly.map(wezel => {
          if (!wezel.widoczny) return null
          const stan = stanWCzasie(wezel, czas)
          const zaznaczony = wybrane.includes(wezel.id)
          return (
            <div
              key={wezel.id}
              onPointerDown={e => !podglad && naWezleWDol(e, wezel)}
              onClick={() => podglad?.onKlik(wezel.id)}
              onMouseEnter={() => podglad?.onNajazd(wezel.id)}
              style={{
                position: 'absolute',
                left: stan.x,
                top: stan.y,
                width: wezel.w,
                height: wezel.h,
                opacity: stan.krycie,
                transform: `rotate(${stan.obrot}deg) scale(${stan.skala})`,
                transformOrigin: 'center',
                outline: zaznaczony && !podglad ? `${skalaOdwrotna}px solid #38bdf8` : undefined,
                outlineOffset: 0,
                transition: podglad?.przejscie,
                cursor: podglad ? 'pointer' : undefined,
                pointerEvents: podglad ? 'auto' : wezel.zablokowany || narzedzie !== 'wybor' ? 'none' : 'auto',
              }}
            >
              <RenderWezla wezel={wezel} />
            </div>
          )
        })}

        {/* Uchwyty skalowania */}
        {!podglad &&
          narzedzie === 'wybor' &&
          !edycjaPunktow &&
          wybrane.map(id => {
            const wezel = projekt.wezly.find(w => w.id === id)
            if (!wezel || wezel.zablokowany) return null
            const stan = stanWCzasie(wezel, czas)
            const uchwyty: { id: UchwytId; x: number; y: number; kursor: string }[] = [
              { id: 'nw', x: 0, y: 0, kursor: 'nwse-resize' },
              { id: 'n', x: wezel.w / 2, y: 0, kursor: 'ns-resize' },
              { id: 'ne', x: wezel.w, y: 0, kursor: 'nesw-resize' },
              { id: 'e', x: wezel.w, y: wezel.h / 2, kursor: 'ew-resize' },
              { id: 'se', x: wezel.w, y: wezel.h, kursor: 'nwse-resize' },
              { id: 's', x: wezel.w / 2, y: wezel.h, kursor: 'ns-resize' },
              { id: 'sw', x: 0, y: wezel.h, kursor: 'nesw-resize' },
              { id: 'w', x: 0, y: wezel.h / 2, kursor: 'ew-resize' },
            ]
            const bok = 8 * skalaOdwrotna
            return (
              <div
                key={'u' + id}
                style={{ position: 'absolute', left: stan.x, top: stan.y, width: wezel.w, height: wezel.h, pointerEvents: 'none' }}
              >
                {uchwyty.map(u => (
                  <div
                    key={u.id}
                    onPointerDown={e => naUchwycieWDol(e, u.id)}
                    style={{
                      position: 'absolute',
                      left: u.x - bok / 2,
                      top: u.y - bok / 2,
                      width: bok,
                      height: bok,
                      background: '#07090d',
                      border: `${skalaOdwrotna}px solid #38bdf8`,
                      borderRadius: 2 * skalaOdwrotna,
                      cursor: u.kursor,
                      pointerEvents: 'auto',
                    }}
                  />
                ))}
              </div>
            )
          })}

        {/* Edycja punktów ścieżki */}
        {edycjaPunktow && wybranyWezel?.punkty && (
          <div
            style={{
              position: 'absolute',
              left: stanWCzasie(wybranyWezel, czas).x,
              top: stanWCzasie(wybranyWezel, czas).y,
              width: wybranyWezel.w,
              height: wybranyWezel.h,
            }}
          >
            <svg width={wybranyWezel.w} height={wybranyWezel.h} style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none' }}>
              {wybranyWezel.punkty.map((p, i) => (
                <g key={'l' + i} stroke="#38bdf8" strokeWidth={skalaOdwrotna} opacity={0.6}>
                  {p.wx !== undefined && <line x1={p.x} y1={p.y} x2={p.wx} y2={p.wy} />}
                  {p.zx !== undefined && <line x1={p.x} y1={p.y} x2={p.zx} y2={p.zy} />}
                </g>
              ))}
            </svg>
            {wybranyWezel.punkty.map((p, i) => (
              <React.Fragment key={'p' + i}>
                <Uchwyt x={p.x} y={p.y} skala={skalaOdwrotna} kolor="#38bdf8" kolo={false} onDown={e => naPunkcieWDol(e, i)} />
                {p.wx !== undefined && (
                  <Uchwyt x={p.wx} y={p.wy!} skala={skalaOdwrotna} kolor="#a78bfa" kolo onDown={e => naPunkcieWDol(e, i, 'w')} />
                )}
                {p.zx !== undefined && (
                  <Uchwyt x={p.zx} y={p.zy!} skala={skalaOdwrotna} kolor="#a78bfa" kolo onDown={e => naPunkcieWDol(e, i, 'z')} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Linie pomocnicze przyciągania */}
        {linie.length > 0 && (
          <svg
            style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
            width={1}
            height={1}
          >
            {linie.map((l, i) =>
              l.kierunek === 'pion' ? (
                <line
                  key={i}
                  x1={l.pozycja}
                  y1={l.od}
                  x2={l.pozycja}
                  y2={l.do}
                  stroke="#f472b6"
                  strokeWidth={skalaOdwrotna}
                />
              ) : (
                <line
                  key={i}
                  x1={l.od}
                  y1={l.pozycja}
                  x2={l.do}
                  y2={l.pozycja}
                  stroke="#f472b6"
                  strokeWidth={skalaOdwrotna}
                />
              ),
            )}
          </svg>
        )}

        {/* Ramka: podgląd rysowanego kształtu albo zaznaczanie przeciągnięciem */}
        {ramka && (
          <div
            style={{
              position: 'absolute',
              left: ramka.x,
              top: ramka.y,
              width: ramka.w,
              height: ramka.h,
              border: `${skalaOdwrotna}px ${narzedzie === 'wybor' ? 'solid' : 'dashed'} #38bdf8`,
              borderRadius: narzedzie === 'elipsa' ? '50%' : narzedzie === 'wybor' ? 0 : 8,
              background: narzedzie === 'wybor' ? 'rgba(56,189,248,0.07)' : 'rgba(56,189,248,0.12)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Podgląd ścieżki pióra */}
        {narzedzie === 'piora' && szkic.length > 0 && (
          <svg
            style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
            width={projekt.szerokosc}
            height={projekt.wysokosc}
          >
            <path
              d={doAtrybutuD(kursor ? [...szkic, kursor] : szkic, false)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2 * skalaOdwrotna}
              strokeDasharray={`${6 * skalaOdwrotna} ${4 * skalaOdwrotna}`}
            />
            {szkic.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4 * skalaOdwrotna} fill={i === 0 ? '#f59e0b' : '#38bdf8'} />
            ))}
          </svg>
        )}
      </div>

      {/* Pasek stanu */}
      <div className="pointer-events-none absolute bottom-2 left-3 flex gap-3 text-[10px] font-mono text-foreground/35">
        <span>{Math.round(widok.zoom * 100)}%</span>
        {kursor && (
          <span>
            {Math.round(kursor.x)} · {Math.round(kursor.y)}
          </span>
        )}
        {narzedzie === 'piora' && <span>Enter — zakończ · klik w pierwszy punkt — zamknij</span>}
      </div>
    </div>
  )
}

function Uchwyt({
  x,
  y,
  skala,
  kolor,
  kolo,
  onDown,
}: {
  x: number
  y: number
  skala: number
  kolor: string
  kolo: boolean
  onDown: (e: React.PointerEvent) => void
}) {
  const bok = (kolo ? 7 : 9) * skala
  return (
    <div
      onPointerDown={onDown}
      style={{
        position: 'absolute',
        left: x - bok / 2,
        top: y - bok / 2,
        width: bok,
        height: bok,
        background: kolo ? kolor : '#07090d',
        border: `${skala * 1.5}px solid ${kolor}`,
        borderRadius: kolo ? '50%' : 2 * skala,
        cursor: 'move',
      }}
    />
  )
}
