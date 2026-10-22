import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { rysujTlo, nowyStanTla, type Tlo } from '../OnboardingSceny'

/* Pole odpowiedzi z cząsteczek — cały ekran to jedna animacja.
   Każda odpowiedź to symbol ułożony z cząsteczek:
   - spoczynek: luźny, przygaszony, cząsteczki dryfują,
   - najechanie: zagęszcza się i rozjaśnia (widać, że jest klikalny),
   - wybór: przechodzi w akcent; przy wyborze jednokrotnym reszta się
     rozsypuje, a wybrany rośnie; przy wielokrotnym z wybranych płyną
     strumienie do rdzenia NextByte w środku, który jaśnieje z każdym.
   Klikalność i dostępność zapewniają przezroczyste przyciski HTML nałożone
   na symbole (Tab / Enter / Spacja działają normalnie). */

export interface Odpowiedz {
  id: string
  etyk: string
  /** Ścieżka SVG symbolu */
  glif: string
  /** Bok pola, w którym narysowano glif (domyślnie 120) */
  pole?: number
  /** Wypełnij kształty zamiast rysować obrys (np. słupki sygnału) */
  wypelnij?: boolean
}

interface Uklad { x: number; y: number; r: number }

const ZNAK_NB = ['M299,65.5 L298,225 L900,800.5 L900,641 Z', 'M784,68 L900,68 L900,460 L784,460 Z', 'M299,264 L416,377 L415,797 L298,797 Z', 'M900,489 L784.5,490 L900,600.5 Z']
const BUDZET = 3200

/** Punkty glifu: rysujemy go grubą kreską na małym canvasie i losujemy piksele. */
function probkujGlif(rysuj: (ctx: CanvasRenderingContext2D) => void, ile: number): [number, number][] {
  const c = document.createElement('canvas')
  c.width = 120
  c.height = 120
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  rysuj(ctx)
  const d = ctx.getImageData(0, 0, 120, 120).data
  const pkt: [number, number][] = []
  for (let y = 0; y < 120; y++) for (let x = 0; x < 120; x++) if (d[(y * 120 + x) * 4 + 3] > 60) pkt.push([x, y])
  const wynik: [number, number][] = []
  for (let i = 0; i < ile && pkt.length; i++) {
    const [x, y] = pkt[(Math.random() * pkt.length) | 0]
    wynik.push([(x + Math.random() - 60) / 60, (y + Math.random() - 60) / 60])
  }
  return wynik
}

/** Rozmieszczenie odpowiedzi wokół rdzenia — inne dla każdego kroku z rdzeniem:
 *  orbita = elipsa wokół rdzenia, szyna = dwa rzędy z rdzeniem pośrodku,
 *  lejek = łuk u góry, rdzeń na dole (sygnały „spadają” do NextByte). */
export type TrybUkladu = 'orbita' | 'szyna' | 'lejek'

function ulozenie(n: number, w: number, h: number, rdzen: boolean, mobilny: boolean, tryb: TrybUkladu = 'orbita'): { el: Uklad[]; rdzen: Uklad | null } {
  if (!mobilny && rdzen && tryb === 'szyna') {
    const naRzad = Math.ceil(n / 2)
    const r = Math.min(w / naRzad * 0.28, h * 0.12)
    return {
      el: Array.from({ length: n }, (_, i) => {
        const rz = i < naRzad ? 0 : 1
        const j = rz ? i - naRzad : i
        const ileWRz = rz ? n - naRzad : naRzad
        const krok = w / ileWRz
        return { x: krok * j + krok / 2, y: rz ? h * 0.78 : h * 0.16, r }
      }),
      rdzen: { x: w / 2, y: h * 0.5, r: Math.min(w, h) * 0.1 },
    }
  }
  if (!mobilny && rdzen && tryb === 'lejek') {
    const r = Math.min(w, h) * (n > 10 ? 0.06 : 0.08)
    return {
      el: Array.from({ length: n }, (_, i) => {
        // łuk od lewej do prawej, wysoko nad rdzeniem; co drugi lekko niżej, żeby się nie stykały
        const u = n === 1 ? 0.5 : i / (n - 1)
        // równe odstępy w poziomie, wysokość z łuku — końce się nie ściskają
        return { x: w * (0.06 + 0.88 * u), y: h * 0.66 - Math.sin(Math.PI * u) * h * 0.5 + (i % 2) * h * 0.1, r }
      }),
      rdzen: { x: w / 2, y: h * 0.82, r: Math.min(w, h) * 0.1 },
    }
  }
  if (mobilny) {
    const kol = n > 6 ? 3 : 2
    const gora = rdzen ? h * 0.2 : 0
    const wiersze = Math.ceil(n / kol)
    const cw = w / kol, ch = (h - gora) / wiersze
    const r = Math.min(cw, ch) * 0.3
    return {
      el: Array.from({ length: n }, (_, i) => ({ x: cw * (i % kol) + cw / 2, y: gora + ch * Math.floor(i / kol) + ch * 0.45, r })),
      rdzen: rdzen ? { x: w / 2, y: gora * 0.5, r: Math.min(gora * 0.38, w * 0.16) } : null,
    }
  }
  if (rdzen) {
    // elementy na elipsie wokół rdzenia
    const cx = w / 2, cy = h * 0.5
    const rx = w * 0.4, ry = h * 0.44
    const r = Math.min(w, h) * (n > 10 ? 0.07 : 0.095)
    return {
      el: Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2
        return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, r }
      }),
      rdzen: { x: cx, y: cy, r: Math.min(w, h) * 0.11 },
    }
  }
  const kol = n <= 4 ? n : Math.ceil(n / 2)
  const wiersze = Math.ceil(n / kol)
  const cw = w / kol, ch = h / wiersze
  const r = Math.min(cw * 0.3, ch * 0.3)
  return {
    el: Array.from({ length: n }, (_, i) => {
      const wiersz = Math.floor(i / kol)
      const wTymWierszu = Math.min(kol, n - wiersz * kol)
      const przes = (kol - wTymWierszu) * cw / 2
      return { x: przes + cw * (i % kol) + cw / 2, y: ch * wiersz + ch * 0.46, r }
    }),
    rdzen: null,
  }
}

export function PoleOdpowiedzi({
  odpowiedzi, wybrane, onWybierz, wielokrotny, rdzen = false, tlo, mobilny, odstep = { gora: 0, dol: 0 }, tryb = 'orbita',
}: {
  odpowiedzi: Odpowiedz[]
  wybrane: string[]
  onWybierz: (id: string) => void
  wielokrotny: boolean
  rdzen?: boolean
  tlo: Tlo
  mobilny: boolean
  tryb?: TrybUkladu
  /** Pasy u góry i u dołu zajęte przez tekst i nawigację — symbole ich omijają */
  odstep?: { gora: number; dol: number }
}) {
  const kontener = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [rozmiar, setRozmiar] = useState({ w: 0, h: 0 })
  const najechany = useRef<string | null>(null)
  const wybraneRef = useRef(wybrane)
  wybraneRef.current = wybrane

  useLayoutEffect(() => {
    const el = kontener.current
    if (!el) return
    const ro = new ResizeObserver(() => setRozmiar({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setRozmiar({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const surowy = ulozenie(odpowiedzi.length, rozmiar.w, Math.max(0, rozmiar.h - odstep.gora - odstep.dol), rdzen, mobilny, tryb)
  const uklad = {
    el: surowy.el.map(u => ({ ...u, y: u.y + odstep.gora })),
    rdzen: surowy.rdzen ? { ...surowy.rdzen, y: surowy.rdzen.y + odstep.gora } : null,
  }
  const ukladRef = useRef(uklad)
  ukladRef.current = uklad

  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const bezRuchu = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const naElement = Math.min(520, Math.floor(BUDZET / (odpowiedzi.length + (rdzen ? 2.5 : 0))))
    const glify = odpowiedzi.map(o => probkujGlif(k => {
      const s = 120 / (o.pole ?? 120)
      k.scale(s, s)
      k.lineWidth = 7 / s
      k.stroke(new Path2D(o.glif))
    }, naElement))
    const rdzenPkt = rdzen
      ? probkujGlif(k => {
        k.save(); k.translate(60, 60); k.scale(0.13, 0.13); k.translate(-599.5, -433)
        ZNAK_NB.forEach(d => k.fill(new Path2D(d)))
        k.restore()
      }, Math.floor(naElement * 2.5))
      : []

    // cząsteczki: [element, indeks punktu] + pozycja i prędkość
    type Cz = { e: number; p: number; x: number; y: number; vx: number; vy: number; s: number; a: number; akc: boolean }
    const cz: Cz[] = []
    // Wejście zależy od układu: spirala do środka, wjazd z boku albo opadanie z góry
    const { width: sw, height: sh } = c.getBoundingClientRect()
    const start = (): [number, number, number, number] => {
      const los = Math.random()
      if (rdzen && tryb === 'orbita') {
        const a = los * Math.PI * 12, rr = Math.max(sw, sh) * (0.6 + los * 0.4)
        return [sw / 2 + Math.cos(a) * rr, sh / 2 + Math.sin(a) * rr, -Math.sin(a) * 9, Math.cos(a) * 9]
      }
      if (rdzen && tryb === 'szyna') return [-80 - Math.random() * sw, Math.random() * sh, 14, 0]
      if (rdzen && tryb === 'lejek') return [Math.random() * sw, -60 - Math.random() * sh, 0, 6]
      return [Math.random() * (sw + 600) - 300, Math.random() * (sh + 600) - 300, 0, 0]
    }
    const dodaj = (e: number, p: number) => {
      const [x, y, vx, vy] = start()
      cz.push({ e, p, x, y, vx, vy, s: Math.random(), a: 0, akc: false })
    }
    glify.forEach((g, e) => g.forEach((_, p) => dodaj(e, p)))
    rdzenPkt.forEach((_, p) => dodaj(-1, p))
    const stan = nowyStanTla()
    const t0 = performance.now()
    let raf = 0
    let kolory = { fg: '0 0% 96%', pr: '204 91% 70%' }
    let ostKolory = -1

    const klatka = (teraz: number) => {
      if (!bezRuchu) raf = requestAnimationFrame(klatka)
      const t = (teraz - t0) / 1000
      if (t - ostKolory > 0.5) {
        const st = getComputedStyle(c)
        kolory = { fg: st.getPropertyValue('--foreground').trim() || kolory.fg, pr: st.getPropertyValue('--primary').trim() || kolory.pr }
        ostKolory = t
      }
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.max(1, Math.round(r.height * dpr))
      if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, cw, ch)

      // tło sceny — skalowane tak, by pokryło cały ekran
      const sTla = Math.max(r.width / 400, r.height / 560)
      ctx.setTransform(sTla * dpr, 0, 0, sTla * dpr, ((r.width - 400 * sTla) / 2) * dpr, ((r.height - 560 * sTla) / 2) * dpr)
      rysujTlo(ctx, tlo, t, Math.min(1, t / 0.8) * 0.5, `hsl(${kolory.fg})`, `hsl(${kolory.pr})`, stan)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const { el, rdzen: rz } = ukladRef.current
      const wyb = wybraneRef.current
      const jestWybor = wyb.length > 0
      const ileWyb = odpowiedzi.filter(o => wyb.includes(o.id)).length
      const k = Math.min(0.09, 0.02 + t * 0.05)

      for (const q of cz) {
        let tx: number, ty: number, a: number, akc = false
        if (q.e === -1 && rz) {
          const [ox, oy] = rdzenPkt[q.p]
          const puls = 1 + Math.sin(t * 2) * 0.02 + ileWyb * 0.02
          tx = rz.x + ox * rz.r * puls; ty = rz.y + oy * rz.r * puls
          a = 0.35 + Math.min(0.6, ileWyb * 0.12); akc = ileWyb > 0
        } else {
          const o = odpowiedzi[q.e], u = el[q.e]
          if (!u) continue
          const [ox, oy] = glify[q.e][q.p]
          const on = wyb.includes(o.id)
          const hov = najechany.current === o.id
          const odpada = !wielokrotny && jestWybor && !on
          const skala = on && !wielokrotny ? 1.35 : hov ? 1.08 : 1
          const luz = on || hov ? 0.6 : 1.8
          tx = u.x + ox * u.r * skala + Math.sin(t * 1.3 + q.s * 40) * luz
          ty = u.y + oy * u.r * skala + Math.cos(t * 1.1 + q.s * 30) * luz
          a = on ? 1 : hov ? 0.95 : 0.55
          akc = on
          if (odpada) {
            // pozostałe odpowiedzi rozsypują się i opadają
            tx = u.x + ox * u.r * 2.2 + Math.sin(q.s * 50) * 80
            ty = u.y + oy * u.r * 2.2 + 120 + q.s * 80
            a = 0.12
          }
          // strumień do rdzenia z wybranych (co trzecia cząsteczka)
          if (on && rz && q.p % 3 === 0) {
            const f = (t * 0.55 + q.s) % 1
            const mx = (u.x + rz.x) / 2 + (rz.y - u.y) * 0.15, my = (u.y + rz.y) / 2 + (u.x - rz.x) * 0.15
            tx = (1 - f) * (1 - f) * u.x + 2 * (1 - f) * f * mx + f * f * rz.x
            ty = (1 - f) * (1 - f) * u.y + 2 * (1 - f) * f * my + f * f * rz.y
            a = 0.3 + 0.7 * Math.sin(Math.PI * f)
            q.x = tx; q.y = ty
          }
        }
        q.vx = (q.vx + (tx - q.x) * k) * 0.84
        q.vy = (q.vy + (ty - q.y) * k) * 0.84
        q.x += q.vx; q.y += q.vy
        if (bezRuchu) { q.x = tx; q.y = ty }
        q.a = a
        q.akc = akc
      }

      for (const akcent of [false, true]) {
        ctx.fillStyle = `hsl(${akcent ? kolory.pr : kolory.fg})`
        for (const q of cz) {
          if (q.akc !== akcent || !q.a) continue
          ctx.globalAlpha = Math.min(1, q.a * (0.7 + 0.3 * Math.sin(t * 3 + q.s * 20)))
          const sz = akcent ? 2 : 1.6
          ctx.fillRect(q.x, q.y, sz, sz)
        }
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(klatka)
    return () => cancelAnimationFrame(raf)
    // Pole montowane od nowa dla każdego kroku — odpowiedzi się nie zmieniają w trakcie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={kontener} className="relative h-full w-full">
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      {odpowiedzi.map((o, i) => {
        const u = uklad.el[i]
        if (!u) return null
        const on = wybrane.includes(o.id)
        return (
          <button
            key={o.id}
            type="button"
            role={wielokrotny ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onWybierz(o.id)}
            onMouseEnter={() => { najechany.current = o.id }}
            onMouseLeave={() => { if (najechany.current === o.id) najechany.current = null }}
            onFocus={() => { najechany.current = o.id }}
            onBlur={() => { if (najechany.current === o.id) najechany.current = null }}
            className="group absolute flex flex-col items-center justify-end rounded-full outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{ left: u.x - u.r * 1.25, top: u.y - u.r * 1.25, width: u.r * 2.5, height: u.r * 2.5 + 34 }}
          >
            <span
              className={cn(
                'pointer-events-none translate-y-1 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.16em] transition-all duration-300',
                on ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground',
              )}
            >
              {on ? '✓ ' : ''}{o.etyk}
            </span>
          </button>
        )
      })}
    </div>
  )
}
