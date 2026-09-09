/* ═══════════════════════════════════════════════════════════════════════
   PODSTAWY GRAFIKI — rzut, tony i postęp przewijania
   ═══════════════════════════════════════════════════════════════════════
   Warstwa, na której stoją rysunki techniczne NextByte: rzut izometryczny
   (obrót bryły → współrzędne ekranu), rampa tonalna liczona z motywu oraz
   sprowadzenie przewijania do jednej liczby 0..1.

   Mieszkało w środku pliku strony głównej, choć ze stroną nie ma nic wspólnego.
   Przeniesione bez zmian — komentarze zostają, bo tłumaczą „dlaczego".
   ═══════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react'

/** Wysokość sticky paska nawigacyjnego strony — "wycentrowanie" grafik liczymy
    w obszarze POD nim, a nie w całym oknie przeglądarki. */
export function getNavbarOffset(): number {
  if (typeof document === 'undefined') return 0
  return document.querySelector<HTMLElement>('[data-navbar]')?.getBoundingClientRect().height ?? 0
}

/** Ton bryły: 0 = czyste tło, 100 = czysty kolor tekstu. */
export const ton = (n: number) =>
  `color-mix(in srgb, hsl(var(--foreground)) ${Math.round(n * 10) / 10}%, hsl(var(--background)))`

/** Ton bryły z domieszką akcentu — refleks przejmujący kolor motywu. */
export const tonAkc = (n: number, a: number) =>
  `color-mix(in srgb, hsl(var(--primary)) ${a}%, ${ton(n)})`

/* ═══════════════════════════════════════════════════════════════════════
   SILNIK AKSONOMETRYCZNY 3D → SVG (rozstrzelony aparat)

   Model aparatu żyje w prawdziwej przestrzeni (x, y, z):
     +Z = oś optyczna (kierunek patrzenia obiektywu)
     +Y = góra aparatu
     +X = prawy bok korpusu
   Całą scenę rzutuje JEDNA stała macierz ortogonalna (aksonometria), dzięki
   czemu: okrąg zawsze staje się poprawną elipsą o identycznym nachyleniu,
   rozsuwanie idzie DOKŁADNIE po osi optycznej, a perspektywa nie może się
   „złamać", bo nie jest liczona osobno dla każdego elementu — jest wspólna.
   Kolejność rysowania wynika z realnej głębi (algorytm malarza).
   ═══════════════════════════════════════════════════════════════════════ */
export type V3 = [number, number, number]

export const D2R = Math.PI / 180

export function rotX3(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
}

export function rotY3(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
}

/* Ustawienie sceny: aparat zadarty o 24°, obserwator 52° w bok i 30° w górę.
   Efekt: widać front, prawy bok i górną płytę, a oś optyczna biegnie w lewo
   delikatnie pod górę — klasyczne ujęcie rysunku rozstrzelonego. */
export const CAM = (() => {
  const t = (v: V3) => rotX3(rotY3(rotX3(v, -24 * D2R), -52 * D2R), 30 * D2R)
  const X = t([1, 0, 0]), Y = t([0, 1, 0]), Z = t([0, 0, 1])
  return {
    ux: X[0], uy: -X[1], ud: X[2],
    vx: Y[0], vy: -Y[1], vd: Y[2],
    wx: Z[0], wy: -Z[1], wd: Z[2],
  }
})()

/** SVD macierzy 2×2 → obraz okręgu jednostkowego jako elipsa (rx, ry, kąt). */
export function circleToEllipse(a: number, b: number, c: number, d: number) {
  const E = (a + d) / 2, F = (a - d) / 2, G = (b + c) / 2, H = (b - c) / 2
  const q = Math.hypot(E, H), r = Math.hypot(F, G)
  return { rx: q + r, ry: Math.abs(q - r), rot: ((Math.atan2(H, E) + Math.atan2(G, F)) / 2) / D2R }
}

/** Okrąg prostopadły do osi optycznej (soczewki, pierścienie tubusu). */
export const RING = circleToEllipse(CAM.ux, CAM.uy, CAM.vx, CAM.vy)

/** Okrąg poziomy (pokrętła na górnej płycie). */
export const DIAL = circleToEllipse(CAM.ux, CAM.uy, CAM.wx, CAM.wy)

/** Styczna sylwetka walca — liczona analitycznie, więc pas boczny tubusu
    zawsze idealnie schodzi się z czaszami elips (zero „załamań"). */
export function silhouette(ax: number, ay: number, bx: number, by: number, dx: number, dy: number) {
  const det = ax * by - bx * ay
  const n0 = (by * dx - bx * dy) / det
  const n1 = (-ay * dx + ax * dy) / det
  const L = Math.hypot(n0, n1)
  return { x: (ax * n1 - bx * n0) / L, y: (ay * n1 - by * n0) / L }
}

/* Własne ustawienie sceny: obserwator 30° w bok i 20° nad poziomem.
   Łagodniej niż przy aparacie — popiersie ma być zwrócone do widza. */
export const ASSIST_CAM = (() => {
  const t = (v: V3) => rotX3(rotY3(v, -30 * D2R), 20 * D2R)
  const X = t([1, 0, 0]), Y = t([0, 1, 0]), Z = t([0, 0, 1])
  return {
    ux: X[0], uy: -X[1], ud: X[2],
    vx: Y[0], vy: -Y[1], vd: Y[2],
    wx: Z[0], wy: -Z[1], wd: Z[2],
  }
})()


/** Fabryka rzutu dla sceny: własna skala i środek, wspólna kamera. */
export function makeScene(S: number, OX: number, OY: number) {
  const C = ASSIST_CAM
  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * C.ux + y * C.vx + z * C.wx) * S,
    y: OY + (x * C.uy + y * C.vy + z * C.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * C.ud + y * C.vd + z * C.wd
  const poly = (pts: V3[]) =>
    pts.map((q) => { const s = P3(q[0], q[1], q[2]); return `${s.x.toFixed(1)},${s.y.toFixed(1)}` }).join(' ')
  /** Układ lokalny leżący NA ścianie — detale rysujemy w milimetrach modelu. */
  const plane = (px: number, py: number, pz: number, right: V3, down: V3) => {
    const c = P3(px, py, pz)
    const rx = (right[0] * C.ux + right[1] * C.vx + right[2] * C.wx) * S
    const ry = (right[0] * C.uy + right[1] * C.vy + right[2] * C.wy) * S
    const dx = (down[0] * C.ux + down[1] * C.vx + down[2] * C.wx) * S
    const dy = (down[0] * C.uy + down[1] * C.vy + down[2] * C.wy) * S
    return `matrix(${rx.toFixed(4)} ${ry.toFixed(4)} ${dx.toFixed(4)} ${dy.toFixed(4)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`
  }
  const Box = (
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
    fSide: string, fTop: string, fFront: string, stroke: string, sw = 1.2,
  ) => (
    <>
      <polygon points={poly([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]])} fill={fSide} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]])} fill={fTop} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={fFront} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </>
  )
  /** Okrąg leżący poziomo (monety, tarcze) — rzut daje spłaszczoną elipsę. */
  const discE = circleToEllipse(C.ux * S, C.uy * S, C.wx * S, C.wy * S)
  const Disc = (x: number, y: number, z: number, r: number, props: Record<string, unknown>, key?: string) => {
    const c = P3(x, y, z)
    return (
      <ellipse
        key={key} cx={0} cy={0} rx={r * discE.rx} ry={r * discE.ry}
        transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${discE.rot.toFixed(2)})`}
        {...props}
      />
    )
  }
  return { C, P3, dep, poly, plane, Box, Disc, discE }
}

/** Wspólny hook postępu scrolla dla scen. */
export function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>, startRatio = 0.82) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let rafId = 0
    let last = -1
    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const start = vh * startRatio
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const end = (vh + getNavbarOffset()) / 2 - rect.height / 2
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 400) / 400
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '260px 0px' })
    io.observe(el)
    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [ref, startRatio])
  return p
}
