import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, Upload, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { etykietaPineski, pozycjaPineski, KOLORY_PINESEK, type Narzedzie, type Pineska, type Warstwa, type Widok, type RamkaObszaru } from './typy'

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
  onWybierzPineske: (id: string | null) => void
  onZmienWarstwe: (id: string, zmiany: Partial<Warstwa>) => void
  onPrzesunPineske: (id: string, normalizedX: number, normalizedY: number) => void
  onWbijPineske: (layerId: string, normalizedX: number, normalizedY: number) => void
  onUpuscPliki: (pliki: File[]) => void
  ramka?: RamkaObszaru | null
  onZmienRamke?: (r: RamkaObszaru | null) => void
  intencja?: string | null
  onZaladujDemo?: () => void
  onOtworzDodawanie?: () => void
}

type Uchwyt = 'nw' | 'ne' | 'se' | 'sw'

interface Operacja {
  rodzaj: 'przesuwanie' | 'skalowanie' | 'panorama' | 'pineska' | 'ramka'
  startX: number
  startY: number
  uchwyt?: Uchwyt
  migawka?: Warstwa
  idPineski?: string
  startWidok?: Widok
  /** czy wskaźnik w ogóle drgnął — odróżnia klik od przeciągnięcia */
  ruszony?: boolean
  startNormX?: number
  startNormY?: number
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
  onWybierzPineske,
  onZmienWarstwe,
  onPrzesunPineske,
  onWbijPineske,
  onUpuscPliki,
  ramka,
  onZmienRamke,
  intencja,
  onZaladujDemo,
  onOtworzDodawanie,
}: Props) {
  const refKontener = useRef<HTMLDivElement>(null)
  const refOperacja = useRef<Operacja | null>(null)
  const [nadPlotnem, setNadPlotnem] = useState(false)
  const [podKursorem, setPodKursorem] = useState<string | null>(null)

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

  /* Krok kropek w pikselach ekranu. Przy oddaleniu mnożymy odstęp w scenie,
     żeby kropki nie zlały się w szarą mgłę; przy zbliżeniu — odwrotnie. */
  const krokSiatki = (() => {
    let krok = 28 * widok.zoom
    while (krok < 14) krok *= 2
    while (krok > 56) krok /= 2
    return krok
  })()

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

  function naTleWDol(e: React.PointerEvent) {
    przechwyc(e.target as Element, e.pointerId)
    if (narzedzie === 'reka' || e.button === 1 || e.altKey) {
      refOperacja.current = { rodzaj: 'panorama', startX: e.clientX, startY: e.clientY, startWidok: { ...widok } }
      return
    }
    if (narzedzie === 'ramka') {
      onZmienRamke?.(null)
    }
    onWybierzWarstwe(null)
    onWybierzPineske(null)
  }

  function naWarstwieWDol(e: React.PointerEvent, warstwa: Warstwa) {
    if (warstwa.locked) return
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)

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

    onWybierzWarstwe(warstwa.id)
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
    refOperacja.current = { rodzaj: 'pineska', startX: p.x, startY: p.y, idPineski: pineska.id }
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
      onPrzesunPineske(
        pineska.id,
        Math.min(1, Math.max(0, (p.x - warstwa.x) / warstwa.width)),
        Math.min(1, Math.max(0, (p.y - warstwa.y) / warstwa.height)),
      )
      return
    }

    if (!op.migawka) return
    const dx = p.x - op.startX
    const dy = p.y - op.startY
    const s = op.migawka

    if (op.rodzaj === 'przesuwanie') {
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

  function naGorze() {
    const op = refOperacja.current
    refOperacja.current = null
    // Kliknięcie pineski bez przeciągnięcia = otwarcie jej karty. Rozdzielamy
    // to dopiero tutaj, bo w chwili wciśnięcia nie wiadomo, co się stanie.
    if (op?.rodzaj === 'pineska' && !op.ruszony && op.idPineski) onWybierzPineske(op.idPineski)

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
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{
        cursor:
          narzedzie === 'reka'
            ? 'grab'
            : narzedzie === 'pineska' || ctrlWcisniety || narzedzie === 'ramka'
            ? 'crosshair'
            : 'default',
        background: 'hsl(var(--background))',
        touchAction: 'none',
      }}
    >
      {/* Kropki tła — dają poczucie skali przy zoomie i nie rysują ramek
          wokół niczego, w przeciwieństwie do siatki liniowej. Poniżej
          pewnego zoomu robią się kaszą, więc wtedy gęstnieją co drugi raz. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground) / 0.13) 1px, transparent 1px)',
          backgroundSize: `${krokSiatki}px ${krokSiatki}px`,
          backgroundPosition: `${widok.x}px ${widok.y}px`,
        }}
      />

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
          const zaznaczona = wybranaWarstwa === warstwa.id
          return (
            <div
              key={warstwa.id}
              onPointerDown={e => naWarstwieWDol(e, warstwa)}
              style={{
                position: 'absolute',
                left: warstwa.x,
                top: warstwa.y,
                width: warstwa.width,
                height: warstwa.height,
                transform: `rotate(${warstwa.rotation}deg)`,
                outline: zaznaczona ? `${2 * odwrotna}px solid #38bdf8` : undefined,
                boxShadow: '0 24px 60px -30px rgba(0,0,0,0.9)',
                cursor: narzedzie === 'pineska' || narzedzie === 'ramka' ? 'crosshair' : 'move',
              }}
            >
              <img
                src={warstwa.src}
                alt={warstwa.name}
                draggable={false}
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', userSelect: 'none' }}
              />
            </div>
          )
        })}

        {/* Uchwyty skalowania — tylko rogi, bo proporcja jest zablokowana */}
        {wybranaWarstwa &&
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
              <div style={{ position: 'absolute', left: w.x, top: w.y, width: w.width, height: w.height }}>
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
                    }}
                  />
                ))}
              </div>
            )
          })()}

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



        {/* Pineski */}
        {pineski.map((p, i) => {
          const warstwa = warstwy.find(w => w.id === p.layerId)
          if (!warstwa || !warstwa.visible) return null
          const poz = pozycjaPineski(p, warstwa)
          const aktywna = wybranaPineska === p.id
          const najechana = podKursorem === p.id
          const r = 13 * odwrotna
          const kolorPineski = KOLORY_PINESEK[i % KOLORY_PINESEK.length]

          return (
            <div key={p.id}>
              <div
                onPointerDown={e => naPinesceWDol(e, p)}
                onMouseEnter={() => setPodKursorem(p.id)}
                onMouseLeave={() => setPodKursorem(s => (s === p.id ? null : s))}
                style={{
                  position: 'absolute',
                  left: poz.x - r,
                  top: poz.y - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: '50%',
                  background: kolorPineski,
                  border: `${2.5 * odwrotna}px solid #ffffff`,
                  boxShadow: `0 ${3 * odwrotna}px ${10 * odwrotna}px rgba(0,0,0,0.5)${
                    aktywna ? `, 0 0 0 ${5 * odwrotna}px rgba(37,99,235,0.28)` : ''
                  }`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12 * odwrotna,
                  fontWeight: 800,
                  color: '#ffffff',
                  cursor: 'grab',
                  zIndex: 5,
                  animation: p.analizowana ? 'pulse 1.2s ease-in-out infinite' : undefined,
                }}
              >
                {i + 1}
              </div>

              {/* Dymek przy najechaniu — nazwa obiektu i podpowiedź edycji */}
              {najechana && !aktywna && (
                <div
                  style={{
                    position: 'absolute',
                    left: poz.x + r + 6 * odwrotna,
                    top: poz.y - 13 * odwrotna,
                    transform: `scale(${odwrotna})`,
                    transformOrigin: '0 50%',
                    pointerEvents: 'none',
                    zIndex: 6,
                  }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#11151c] px-2.5 py-1.5 text-[11px] font-medium text-foreground shadow-xl ring-1 ring-border/10">
                    {etykietaPineski(p, i + 1)}
                    <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold text-foreground/60">
                      klik — edytuj
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Podpowiedź na pustym płótnie */}
      {warstwy.length === 0 && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4 z-10">
          <div
            className={cn(
              'relative flex flex-col items-center max-w-md w-full p-8 rounded-3xl text-center',
              'nb-szklo nb-szklo-plynne nb-szklo-canvas border border-foreground/[0.08] shadow-2xl backdrop-blur-2xl',
              nadPlotnem ? 'border-primary/70 bg-primary/10' : 'bg-card/60',
            )}
            style={{
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 hsl(0 0% 100% / 0.16)',
            }}
          >
            {/* Accent hairline */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-4 border border-primary/25 shadow-[0_0_24px_hsl(var(--primary)/0.25)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Canvas Studio AI</h2>
            <p className="mt-2 text-xs leading-relaxed text-foreground/60 max-w-sm">
              Generatywne studio Lovart oparte na modelu <strong className="text-foreground">Nano-Banana</strong> i analizie wizualnej <strong className="text-foreground">Gemini 2.5 Flash</strong>.
              Przenieś obiekt, zamień miejscami lub modyfikuj kadry pineskami.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
              {onZaladujDemo && (
                <button
                  type="button"
                  onClick={onZaladujDemo}
                  className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  Załaduj demo (Transfer)
                </button>
              )}
              {onOtworzDodawanie && (
                <button
                  type="button"
                  onClick={onOtworzDodawanie}
                  className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.12] bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold text-xs transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  Wgraj z dysku
                </button>
              )}
            </div>

            <p className="mt-4 text-[10px] text-foreground/40">
              Możesz też upuścić zdjęcia na ten ekran lub wkleić bezpośrednio ze schowka (<kbd className="font-mono bg-foreground/10 px-1 py-0.5 rounded text-[9px]">Ctrl+V</kbd>)
            </p>
          </div>
        </div>
      )}

      {nadPlotnem && warstwy.length > 0 && (
        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-primary/60 bg-primary/5" />
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>
    </div>
  )
}
