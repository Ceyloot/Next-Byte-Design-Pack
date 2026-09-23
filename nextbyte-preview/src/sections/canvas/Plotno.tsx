import React, { useCallback, useEffect, useRef, useState } from 'react'
import { etykietaPineski, pozycjaPineski, type Narzedzie, type Pineska, type Warstwa, type Widok } from './typy'

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
}

type Uchwyt = 'nw' | 'ne' | 'se' | 'sw'

interface Operacja {
  rodzaj: 'przesuwanie' | 'skalowanie' | 'panorama' | 'pineska'
  startX: number
  startY: number
  uchwyt?: Uchwyt
  migawka?: Warstwa
  idPineski?: string
  startWidok?: Widok
  /** czy wskaźnik w ogóle drgnął — odróżnia klik od przeciągnięcia */
  ruszony?: boolean
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
    onWybierzWarstwe(null)
    onWybierzPineske(null)
  }

  function naWarstwieWDol(e: React.PointerEvent, warstwa: Warstwa) {
    if (warstwa.locked) return
    e.stopPropagation()
    przechwyc(e.currentTarget as Element, e.pointerId)
    const p = doSceny(e)

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
      className="relative h-full w-full overflow-hidden"
      style={{
        cursor:
          narzedzie === 'reka' ? 'grab' : narzedzie === 'pineska' || ctrlWcisniety ? 'crosshair' : 'default',
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
                cursor: narzedzie === 'pineska' ? 'crosshair' : 'move',
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

        {/* Pineski */}
        {pineski.map((p, i) => {
          const warstwa = warstwy.find(w => w.id === p.layerId)
          if (!warstwa || !warstwa.visible) return null
          const poz = pozycjaPineski(p, warstwa)
          const aktywna = wybranaPineska === p.id
          const najechana = podKursorem === p.id
          const r = 13 * odwrotna

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
                  background: 'hsl(var(--primary))',
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
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div
            className={`rounded-2xl border-2 border-dashed px-10 py-8 text-center transition-colors ${
              nadPlotnem ? 'border-primary/70 bg-primary/5' : 'border-border/40'
            }`}
          >
            <p className="text-sm font-semibold text-foreground/70">Przeciągnij tu zdjęcia</p>
            <p className="mt-1.5 text-xs text-foreground/40">
              albo wklej ze schowka (Ctrl+V) lub dodaj przyciskiem na dolnym pasku
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
