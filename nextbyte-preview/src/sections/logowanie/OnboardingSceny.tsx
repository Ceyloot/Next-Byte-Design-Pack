import React, { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'

/* Lewy panel onboardingu — „industrialne mikrografiki” + ASCII.
   Każda scena to dwie warstwy w tym samym układzie 400×560:
   1) PoleAscii — canvas, na którym figura (osoba, pryzmat, kula, bloki…)
      jest złożona ze znaków; przy wejściu znaki się „rozsypują” i składają,
      a w trakcie pojedyncze komórki migoczą jak w terminalu,
   2) HUD w SVG — cienkie linie, celowniki, podziałki i mono-etykiety typu
      CORE_SYNC / REF_X.42, które reagują na wybór po prawej.
   Akcent motywu (--primary) tylko na tym, co użytkownik zaznaczył. */

export type IdSceny = 'przestrzen' | 'cele' | 'poziom' | 'moduly' | 'funkcje' | 'zrodla' | 'problem'

const W = 400
const H = 560
const P = 'hsl(var(--primary))'
const Pa = (a: number) => `hsl(var(--primary) / ${a})`
const Fa = (a: number) => `hsl(var(--foreground) / ${a})`
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
/** Kolor maski, który PoleAscii rysuje akcentem zamiast kolorem tekstu */
const AKCENT_MASKI = 'rgb(255,0,0)'

export function StyleScen() {
  return (
    <style>{`
      @keyframes nbSvgPlyn { to { stroke-dashoffset: -40 } }
      @keyframes nbSvgPuls { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
      @keyframes nbSvgObrot { to { transform: rotate(360deg) } }
      @keyframes nbSvgWejdz { from { opacity: 0; transform: translateY(4px) } }
      @keyframes nbSvgRysuj { from { stroke-dashoffset: var(--dl, 300) } to { stroke-dashoffset: 0 } }
      @keyframes nbScenaWejscie { from { opacity: 0 } }
      .nb-svg-plyn  { animation: nbSvgPlyn 1s linear infinite }
      .nb-svg-puls  { animation: nbSvgPuls 1.2s ease-in-out infinite }
      .nb-svg-obrot { animation: nbSvgObrot 20s linear infinite; transform-box: fill-box; transform-origin: center }
      .nb-svg-wejdz { animation: nbSvgWejdz 360ms cubic-bezier(.2,.9,.25,1) both }
      .nb-svg-rysuj { animation: nbSvgRysuj 700ms cubic-bezier(.4,0,.2,1) both }
      .nb-scena-wejscie { animation: nbScenaWejscie 300ms ease-out backwards }
      @media (prefers-reduced-motion: reduce) {
        .nb-svg-plyn, .nb-svg-puls, .nb-svg-obrot, .nb-svg-wejdz, .nb-svg-rysuj, .nb-scena-wejscie { animation: none }
      }
    `}</style>
  )
}

/* ══ Wspólne: czas, pole ASCII, klocki HUD ═════════════════════════════ */

function useTakt(ms: number) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setT(x => x + 1), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return t
}

/** Maska rysowana w układzie 400×560: biel = znaki w kolorze tekstu,
 *  AKCENT_MASKI = znaki w kolorze akcentu, krycie = gęstość znaku. */
type Maska = (ctx: CanvasRenderingContext2D, t: number) => void

const RAMPA = ' .:-~^!7?JY5PG#B&@'
const SZUM = '01#@&%$?!<>/|=+*'

function PoleAscii({ maska, kolumny = 62 }: { maska: Maska; kolumny?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const maskaRef = useRef(maska)
  maskaRef.current = maska

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const off = document.createElement('canvas')
    const oc = off.getContext('2d', { willReadFrequently: true })
    if (!ctx || !oc) return
    const kw = W / kolumny
    const kh = kw * 1.32
    const wiersze = Math.floor(H / kh)
    off.width = kolumny
    off.height = wiersze
    const bezRuchu = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let raf = 0
    let ostatnia = 0

    const klatka = (teraz: number) => {
      if (!bezRuchu) raf = requestAnimationFrame(klatka)
      if (teraz - ostatnia < 40) return
      ostatnia = teraz
      const t = (teraz - t0) / 1000

      // Rozmiar canvasu za kontenerem, układ 400×560 wpisany i wyśrodkowany
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.max(1, Math.round(r.height * dpr))
      if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch }
      const s = Math.min(r.width / W, r.height / H)
      const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2

      oc.setTransform(1, 0, 0, 1, 0, 0)
      oc.clearRect(0, 0, kolumny, wiersze)
      oc.setTransform(kolumny / W, 0, 0, wiersze / H, 0, 0)
      oc.fillStyle = '#fff'
      oc.strokeStyle = '#fff'
      maskaRef.current(oc, t)
      const d = oc.getImageData(0, 0, kolumny, wiersze).data

      const styl = getComputedStyle(c)
      const fg = styl.getPropertyValue('--foreground').trim()
      const pr = styl.getPropertyValue('--primary').trim()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr)
      ctx.font = `600 ${kh * 0.92}px ${MONO}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const wejscie = bezRuchu ? 1 : Math.min(1, t / 0.9)

      for (const akcent of [false, true]) {
        ctx.fillStyle = `hsl(${akcent ? pr : fg})`
        for (let y = 0; y < wiersze; y++) {
          for (let x = 0; x < kolumny; x++) {
            const i = (y * kolumny + x) * 4
            const a = d[i + 3] / 255
            if (a < 0.05) continue
            const jestAkcent = d[i] > 200 && d[i + 1] < 90
            if (jestAkcent !== akcent) continue
            const losowy = Math.random() > wejscie || (!bezRuchu && Math.random() < 0.012)
            const z = losowy
              ? SZUM[(Math.random() * SZUM.length) | 0]
              : RAMPA[Math.min(RAMPA.length - 1, 1 + Math.floor(a * (RAMPA.length - 1)))]
            ctx.globalAlpha = 0.28 + a * 0.72
            ctx.fillText(z, x * kw + kw / 2, y * kh + kh / 2)
          }
        }
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(klatka)
    return () => cancelAnimationFrame(raf)
  }, [kolumny])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />
}

/** Warstwa sceny: pole ASCII pod spodem, HUD SVG na wierzchu. */
function Scena({ maska, children, kolumny }: { maska: Maska; children: React.ReactNode; kolumny?: number }) {
  return (
    <div className="relative h-full w-full">
      <PoleAscii maska={maska} kolumny={kolumny} />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none">
        {children}
      </svg>
    </div>
  )
}

function Etyk({ x, y, children, kolor = Fa(0.55), anchor = 'start', size = 8, waga = 500 }: {
  x: number; y: number; children: React.ReactNode; kolor?: string; anchor?: 'start' | 'middle' | 'end'; size?: number; waga?: number
}) {
  return (
    <text x={x} y={y} fill={kolor} fontSize={size} fontFamily={MONO} fontWeight={waga} textAnchor={anchor} letterSpacing={1.1}>
      {children}
    </text>
  )
}

/** Narożniki ramki — jak znaczniki kadru w mikrografikach. */
function Ramka({ x, y, w, h, d = 10, kolor = Fa(0.45) }: { x: number; y: number; w: number; h: number; d?: number; kolor?: string }) {
  return (
    <g stroke={kolor} strokeWidth={1}>
      <path d={`M ${x} ${y + d} V ${y} H ${x + d}`} />
      <path d={`M ${x + w - d} ${y} H ${x + w} V ${y + d}`} />
      <path d={`M ${x} ${y + h - d} V ${y + h} H ${x + d}`} />
      <path d={`M ${x + w - d} ${y + h} H ${x + w} V ${y + h - d}`} />
    </g>
  )
}

function Celownik({ x, y, r = 10, kolor = Fa(0.6), obrot = false }: { x: number; y: number; r?: number; kolor?: string; obrot?: boolean }) {
  return (
    <g stroke={kolor} strokeWidth={1}>
      <circle cx={x} cy={y} r={r} strokeDasharray={obrot ? '3 3' : undefined} className={obrot ? 'nb-svg-obrot' : undefined} />
      <line x1={x - r - 6} y1={y} x2={x - r + 3} y2={y} />
      <line x1={x + r - 3} y1={y} x2={x + r + 6} y2={y} />
      <line x1={x} y1={y - r - 6} x2={x} y2={y - r + 3} />
      <line x1={x} y1={y + r - 3} x2={x} y2={y + r + 6} />
    </g>
  )
}

/** Łuk podziałki z drobnymi kreskami (styl ENERGY_VAL / ISO_PURITY). */
function Podzialka({ cx, cy, r, od, do: doK, n, kolor = Fa(0.35), dl = 5 }: {
  cx: number; cy: number; r: number; od: number; do: number; n: number; kolor?: string; dl?: number
}) {
  return (
    <g stroke={kolor} strokeWidth={1}>
      {Array.from({ length: n + 1 }, (_, i) => {
        const a = ((od + (doK - od) * (i / n)) * Math.PI) / 180
        const L = i % 5 === 0 ? dl * 1.8 : dl
        return <line key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r} x2={cx + Math.cos(a) * (r + L)} y2={cy + Math.sin(a) * (r + L)} />
      })}
    </g>
  )
}

function Pakiet({ d, dur = 1.4, delay = 0, r = 2.2, kolor = P }: { d: string; dur?: number; delay?: number; r?: number; kolor?: string }) {
  return (
    <circle r={r} fill={kolor}>
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={d} />
    </circle>
  )
}

/** Nagłówek sceny: kod mono + jedna linia stanu. */
function Naglowek({ kod, stan }: { kod: string; stan: string }) {
  return (
    <g>
      <Etyk x={24} y={40} kolor={Fa(0.4)}>{kod}</Etyk>
      <line x1={24} y1={48} x2={376} y2={48} stroke={Fa(0.12)} />
      <text key={stan} x={24} y={76} fill={Fa(0.95)} fontSize={20} fontWeight={300} letterSpacing={-0.4} className="nb-svg-wejdz">{stan}</text>
    </g>
  )
}

/* ══ 1. PRZESTRZEŃ — sylwetka (solo) albo zespół, złożone ze znaków ═══════ */
function osoba(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, akcent: boolean, t: number) {
  const odd = 1 + Math.sin(t * 2 + x) * 0.012
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s * odd, s * odd)
  const g = ctx.createRadialGradient(-10, -150, 4, 0, -120, 70)
  const kol = akcent ? '255,0,0' : '255,255,255'
  g.addColorStop(0, `rgba(${kol},1)`); g.addColorStop(1, `rgba(${kol},0.35)`)
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, -150, 44, 0, Math.PI * 2); ctx.fill()
  const b = ctx.createLinearGradient(0, -90, 0, 60)
  b.addColorStop(0, `rgba(${kol},0.95)`); b.addColorStop(1, `rgba(${kol},0.1)`)
  ctx.fillStyle = b
  ctx.beginPath(); ctx.ellipse(0, 40, 110, 125, 0, Math.PI, 0); ctx.fill()
  ctx.restore()
}

const MIEJSCA_ZESPOLU: [number, number, number][] = [[200, 330, 0.62], [104, 400, 0.5], [296, 400, 0.5], [200, 470, 0.46]]

function ScenaPrzestrzen({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(2600)
  const wybrany = wybrane.includes('zespol') ? 'zespol' : wybrane.includes('prywatnie') ? 'prywatnie' : null
  const tryb = wybrany ?? (takt % 2 ? 'zespol' : 'prywatnie')
  const maska: Maska = (ctx, t) => {
    if (tryb === 'prywatnie') osoba(ctx, 200, 400, 1, !!wybrany, t)
    else MIEJSCA_ZESPOLU.forEach(([x, y, s]) => osoba(ctx, x, y, s, !!wybrany, t))
  }
  const glowy: [number, number][] = tryb === 'prywatnie' ? [[200, 250]] : MIEJSCA_ZESPOLU.map(([x, y, s]) => [x, y - 150 * s])

  return (
    <Scena maska={maska}>
      <Naglowek kod="WORKSPACE_ID.01" stan={tryb === 'zespol' ? 'Zespół · wspólna pula' : 'Tylko Ty · prywatnie'} />
      <Ramka x={44} y={110} w={312} h={380} />
      {glowy.map(([x, y], i) => (
        <g key={`${tryb}-${i}`} className="nb-svg-wejdz" style={{ animationDelay: `${i * 80}ms` }}>
          <Celownik x={x} y={y} r={tryb === 'prywatnie' ? 56 : 30} kolor={wybrany ? Pa(0.8) : Fa(0.45)} obrot />
          <Etyk x={x + (tryb === 'prywatnie' ? 66 : 36)} y={y - 4} kolor={wybrany ? P : Fa(0.5)} size={7}>{`SEAT_0${i + 1}`}</Etyk>
        </g>
      ))}
      {/* linijka po prawej z jeżdżącym znacznikiem */}
      <g stroke={Fa(0.3)}>
        <line x1={372} y1={130} x2={372} y2={470} />
        {Array.from({ length: 18 }, (_, i) => <line key={i} x1={372} y1={130 + i * 20} x2={i % 5 === 0 ? 362 : 367} y2={130 + i * 20} />)}
      </g>
      <path d="M 378 0 l 6 -4 v 8 z" fill={P}>
        <animateMotion dur="3s" repeatCount="indefinite" path="M 0 130 L 0 470 L 0 130" />
      </path>
      {/* stopka z miejscami */}
      <Etyk x={44} y={516}>{`SEATS ${tryb === 'zespol' ? '04' : '01'}/04`}</Etyk>
      {[0, 1, 2, 3].map(i => {
        const on = tryb === 'zespol' || i === 0
        return <rect key={i} x={150 + i * 16} y={508} width={10} height={10} fill={on ? (wybrany ? P : Fa(0.7)) : 'none'} stroke={Fa(0.4)} />
      })}
      <Etyk x={356} y={516} anchor="end" kolor={wybrany ? P : Fa(0.4)}>{wybrany ? 'LOCKED' : 'SCANNING…'}</Etyk>
    </Scena>
  )
}

/* ══ 2. CELE — pryzmat z promptu rozszczepia się na rezultaty ═════════════ */
const WYJSCIA = [
  { id: 'automatyzacja', kod: 'OUT_AUTO', x: 80, y: 430 },
  { id: 'filmy', kod: 'OUT_FILM', x: 200, y: 430 },
  { id: 'marketing', kod: 'OUT_GROWTH', x: 320, y: 430 },
  { id: 'rozgladam', kod: 'OUT_EXPLORE', x: 80, y: 500 },
  { id: 'produkty', kod: 'OUT_PRODUCT', x: 200, y: 500 },
  { id: 'viral', kod: 'OUT_VIRAL', x: 320, y: 500 },
]

function ScenaCele({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1000)
  const aktywny = wybrane[0] ?? WYJSCIA[takt % WYJSCIA.length].id
  const maska: Maska = (ctx, t) => {
    // Romb Byte obracający się w 3D — szerokość z cosinusa, cieniowanie z kąta
    const k = Math.cos(t * 1.4)
    const sx = Math.max(0.1, Math.abs(k))
    ctx.save()
    ctx.translate(200, 255)
    ctx.scale(sx, 1)
    const g = ctx.createLinearGradient(-60, 0, 60, 0)
    g.addColorStop(0, `rgba(255,255,255,${k > 0 ? 1 : 0.35})`)
    g.addColorStop(1, `rgba(255,255,255,${k > 0 ? 0.35 : 1})`)
    ctx.fillStyle = g
    ctx.beginPath(); ctx.moveTo(0, -112); ctx.lineTo(64, 0); ctx.lineTo(0, 112); ctx.lineTo(-64, 0); ctx.closePath(); ctx.fill()
    ctx.restore()
    // wiązka z promptu
    const w = ctx.createLinearGradient(0, 100, 0, 150)
    w.addColorStop(0, 'rgba(255,255,255,0.2)'); w.addColorStop(1, 'rgba(255,255,255,0.9)')
    ctx.fillStyle = w
    ctx.fillRect(196, 100, 8, 46)
  }

  return (
    <Scena maska={maska}>
      <Etyk x={24} y={40} kolor={Fa(0.4)}>PROMPT_IN / SPLIT_CORE</Etyk>
      <line x1={24} y1={48} x2={376} y2={48} stroke={Fa(0.12)} />
      {/* pole promptu */}
      <rect x={44} y={62} width={312} height={34} stroke={Fa(0.35)} />
      <defs><clipPath id="nbPisz2"><rect x={52} y={64} height={30} width={0}><animate attributeName="width" values="0;290;290" keyTimes="0;.6;1" dur="3s" repeatCount="indefinite" /></rect></clipPath></defs>
      <g clipPath="url(#nbPisz2)"><Etyk x={56} y={83} kolor={Fa(0.85)} size={10}>&gt; zrób kampanię dla nowego produktu</Etyk></g>
      <rect x={338} y={72} width={6} height={14} fill={P} className="nb-svg-puls" />
      <Podzialka cx={200} cy={255} r={128} od={200} do={340} n={28} />
      <Etyk x={334} y={160} kolor={Fa(0.4)} size={7}>REF_X.42</Etyk>

      {WYJSCIA.map(w => {
        const on = w.id === aktywny
        const d = `M 200 370 C 200 ${w.y - 50}, ${w.x} ${w.y - 60}, ${w.x} ${w.y - 16}`
        return (
          <g key={w.id}>
            <path d={d} stroke={on ? P : Fa(0.18)} strokeWidth={on ? 1.4 : 1} strokeDasharray={on ? undefined : '2 4'} />
            {on && <><Pakiet d={d} dur={0.7} /><Pakiet d={d} dur={0.7} delay={0.35} r={1.6} /></>}
            <Celownik x={w.x} y={w.y} r={12} kolor={on ? P : Fa(0.4)} obrot={on} />
            {on && <circle cx={w.x} cy={w.y} r={3} fill={P} />}
            <Etyk x={w.x} y={w.y + 30} anchor="middle" size={7.5} kolor={on ? P : Fa(0.45)}>{w.kod}</Etyk>
          </g>
        )
      })}
      <line x1={200} y1={368} x2={200} y2={372} stroke={Fa(0.6)} />
      <Etyk x={376} y={540} anchor="end" kolor={Fa(0.4)} size={7}>{`MATCH ${String(86 + (takt % 13)).padStart(2, '0')}%`}</Etyk>
    </Scena>
  )
}

/* ══ 3. POZIOM — rdzeń rośnie, łuk energii i lista odblokowanych narzędzi ═══ */
const POZIOMY = ['poczatkujacy', 'sredni', 'zaawansowany', 'ekspert']
const NAZWY_POZIOMOW = ['Prowadzony', 'Szybki', 'Pełna kontrola', 'Reżyser']
const NARZEDZIA = ['PRESETS', 'MODEL_SELECT', 'DIRECTOR', 'API_ACCESS']

function ScenaPoziom({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1400)
  const wybrany = POZIOMY.indexOf(wybrane[0] ?? '')
  const poziom = wybrany >= 0 ? wybrany : takt % 4
  const cel = 46 + poziom * 20
  const promien = useRef(cel)
  const maska: Maska = (ctx, t) => {
    promien.current += (cel - promien.current) * 0.12
    const r = promien.current * (1 + Math.sin(t * 3) * 0.02)
    const g = ctx.createRadialGradient(200 - r * 0.35, 250 - r * 0.35, r * 0.1, 200, 250, r)
    const kol = wybrany >= 0 ? '255,0,0' : '255,255,255'
    g.addColorStop(0, `rgba(${kol},1)`); g.addColorStop(0.7, `rgba(${kol},0.55)`); g.addColorStop(1, `rgba(${kol},0.12)`)
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(200, 250, r, 0, Math.PI * 2); ctx.fill()
    // satelity — jest ich tyle, ile poziomów
    for (let i = 0; i <= poziom; i++) {
      const a = t * (0.9 + i * 0.25) + i * 1.7
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.arc(200 + Math.cos(a) * 150, 250 + Math.sin(a) * 52, 9, 0, Math.PI * 2); ctx.fill()
    }
  }
  const kat = 135 + ((poziom + 1) / 4) * 270

  return (
    <Scena maska={maska}>
      <Naglowek kod={`LVL_0${poziom + 1} / COMPLEXITY_IDX`} stan={NAZWY_POZIOMOW[poziom]} />
      <Podzialka cx={200} cy={250} r={132} od={135} do={405} n={45} />
      <circle cx={200} cy={250} r={124} stroke={Fa(0.12)} />
      <path
        d={`M ${200 + Math.cos((135 * Math.PI) / 180) * 124} ${250 + Math.sin((135 * Math.PI) / 180) * 124} A 124 124 0 ${kat - 135 > 180 ? 1 : 0} 1 ${200 + Math.cos((kat * Math.PI) / 180) * 124} ${250 + Math.sin((kat * Math.PI) / 180) * 124}`}
        stroke={P} strokeWidth={2} style={{ transition: 'd .6s' }}
      />
      <ellipse cx={200} cy={250} rx={150} ry={52} stroke={Fa(0.15)} strokeDasharray="2 4" />
      <Etyk x={200 + Math.cos((kat * Math.PI) / 180) * 150} y={250 + Math.sin((kat * Math.PI) / 180) * 150} anchor="middle" kolor={P} size={8}>
        {`${(((poziom + 1) / 4) * 100).toFixed(0)}%`}
      </Etyk>
      <Etyk x={82} y={404} kolor={Fa(0.4)} size={7}>ENERGY_VAL</Etyk>

      <Ramka x={44} y={420} w={312} h={110} />
      {NARZEDZIA.map((n, i) => {
        const on = i <= poziom
        return (
          <g key={n}>
            <rect x={60} y={436 + i * 22} width={10} height={10} fill={on ? P : 'none'} stroke={on ? P : Fa(0.35)} />
            <Etyk x={80} y={445 + i * 22} kolor={on ? Fa(0.9) : Fa(0.35)}>{n}</Etyk>
            <line x1={190} y1={441 + i * 22} x2={300} y2={441 + i * 22} stroke={Fa(0.12)} strokeDasharray="1 3" />
            <Etyk x={340} y={445 + i * 22} anchor="end" kolor={on ? P : Fa(0.3)}>{on ? 'ON' : 'OFF'}</Etyk>
          </g>
        )
      })}
    </Scena>
  )
}

/* ══ 4. MODUŁY — siatka sześcianów, wybrane zapełniają się znakami ════════ */
const MODULY_SCENY = [
  { id: 'chat', kod: 'MOD_CHAT' },
  { id: 'zdjecia', kod: 'MOD_IMAGE' },
  { id: 'wideo', kod: 'MOD_VIDEO' },
  { id: 'canvas', kod: 'MOD_CANVAS' },
  { id: 'notebook', kod: 'MOD_NOTES' },
  { id: 'akademia', kod: 'MOD_ACADEMY' },
]
const isoM = (x: number, y: number, z = 0): [number, number] => [200 + (x - y) * 0.866, 300 + (x + y) * 0.5 - z]
const SLOTY = MODULY_SCENY.map((m, i) => ({ ...m, x: -84 + (i % 3) * 84, y: -42 + Math.floor(i / 3) * 84 }))
const S = 30, HK = 52

function sciany(x: number, y: number, z0: number) {
  const A = isoM(x - S, y - S, z0 + HK), B = isoM(x + S, y - S, z0 + HK), C = isoM(x + S, y + S, z0 + HK), D = isoM(x - S, y + S, z0 + HK)
  const B0 = isoM(x + S, y - S, z0), C0 = isoM(x + S, y + S, z0), D0 = isoM(x - S, y + S, z0)
  return { gora: [A, B, C, D], lewa: [D, C, C0, D0], prawa: [B, C, C0, B0] }
}

function ScenaModuly({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(800)
  const demo = wybrane.length === 0
  const wlaczone = demo ? MODULY_SCENY.slice(0, takt % (MODULY_SCENY.length + 2)).map(m => m.id) : wybrane
  // Moment włączenia każdego bloku — na nim liczony jest zrzut z góry
  const czasy = useRef<Record<string, number>>({})
  wlaczone.forEach(id => { if (!czasy.current[id]) czasy.current[id] = performance.now() })
  Object.keys(czasy.current).forEach(id => { if (!wlaczone.includes(id)) delete czasy.current[id] })

  const maska: Maska = ctx => {
    const kolejnosc = [...SLOTY].sort((a, b) => a.x + a.y - (b.x + b.y))
    for (const s of kolejnosc) {
      const t0 = czasy.current[s.id]
      if (!t0) continue
      const p = Math.min(1, (performance.now() - t0) / 550)
      const z = (1 - (1 - Math.pow(1 - p, 3))) * 120
      const f = sciany(s.x, s.y, z)
      const kol = demo ? '255,255,255' : '255,0,0'
      for (const [pts, a] of [[f.lewa, 0.62], [f.prawa, 0.34], [f.gora, 1]] as const) {
        ctx.fillStyle = `rgba(${kol},${a})`
        ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill()
      }
    }
  }
  const ile = wlaczone.length

  return (
    <Scena maska={maska} kolumny={70}>
      <Naglowek kod="CORE_LINK / MODULE_GRID" stan={`${String(ile).padStart(2, '0')} / 06 modułów`} />
      {/* druciane sześciany wszystkich slotów */}
      {[...SLOTY].sort((a, b) => a.x + a.y - (b.x + b.y)).map(s => {
        const on = wlaczone.includes(s.id)
        const f = sciany(s.x, s.y, 0)
        const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
        const [A, B, C, D] = f.gora
        return (
          <g key={s.id} stroke={on ? Pa(0.7) : Fa(0.3)} strokeWidth={1}>
            <polygon points={pts(f.gora)} />
            <polygon points={pts(f.lewa)} />
            <polygon points={pts(f.prawa)} />
            {/* siatka na górnej ścianie (CORE_LINK) */}
            {[1 / 3, 2 / 3].map(u => (
              <g key={u} strokeOpacity={0.5}>
                <line x1={A[0] + (D[0] - A[0]) * u} y1={A[1] + (D[1] - A[1]) * u} x2={B[0] + (C[0] - B[0]) * u} y2={B[1] + (C[1] - B[1]) * u} />
                <line x1={A[0] + (B[0] - A[0]) * u} y1={A[1] + (B[1] - A[1]) * u} x2={D[0] + (C[0] - D[0]) * u} y2={D[1] + (C[1] - D[1]) * u} />
              </g>
            ))}
          </g>
        )
      })}
      {SLOTY.map((s, i) => {
        const on = wlaczone.includes(s.id)
        const x = 44 + (i % 3) * 112, y = 470 + Math.floor(i / 3) * 22
        return (
          <g key={`e-${s.id}`}>
            <rect x={x} y={y - 8} width={8} height={8} fill={on ? (demo ? Fa(0.7) : P) : 'none'} stroke={on ? 'none' : Fa(0.35)} />
            <Etyk x={x + 14} y={y} kolor={on ? (demo ? Fa(0.85) : P) : Fa(0.4)} size={7.5}>{s.kod}</Etyk>
          </g>
        )
      })}
      <line x1={24} y1={520} x2={376} y2={520} stroke={Fa(0.12)} />
      <Etyk x={24} y={538} kolor={ile ? P : Fa(0.4)} size={7.5}>{ile ? 'CHECKSUM: OK' : 'AWAITING_INPUT'}</Etyk>
      <Etyk x={376} y={538} anchor="end" kolor={Fa(0.4)} size={7.5}>{`BUS-0${(takt % 6) + 1}`}</Etyk>
    </Scena>
  )
}

/* ══ 5. FUNKCJE — cztery kanały sygnału jak na oscyloskopie ══════════════ */
const KANALY_FUNKCJI = [
  { kod: 'CH_01 VIDEO', ids: ['gen-wideo', 'presety'], f: 1.4 },
  { kod: 'CH_02 AUDIO', ids: ['lektor', 'lipsync', 'awatary'], f: 3.2 },
  { kod: 'CH_03 UPSCALE', ids: ['upscale', 'dokumenty'], f: 0.8 },
  { kod: 'CH_04 IMAGE', ids: ['gen-zdjec', 'inpaint', 'asystent'], f: 2.2 },
]

function ScenaFunkcje({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1200)
  const aktywne = KANALY_FUNKCJI.map((k, i) => (wybrane.length ? k.ids.some(id => wybrane.includes(id)) : takt % 4 === i))
  const maska: Maska = (ctx, t) => {
    KANALY_FUNKCJI.forEach((k, i) => {
      const y0 = 150 + i * 92
      const on = aktywne[i]
      const amp = on ? 30 : 8
      ctx.strokeStyle = on && wybrane.length ? AKCENT_MASKI : on ? '#fff' : 'rgba(255,255,255,0.45)'
      ctx.lineWidth = on ? 14 : 7
      ctx.beginPath()
      for (let x = 40; x <= 360; x += 4) {
        const y = y0 + Math.sin(x * 0.03 * k.f - t * (2 + i)) * amp * Math.sin((x - 40) / 320 * Math.PI)
        if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    })
  }
  const ile = wybrane.length

  return (
    <Scena maska={maska} kolumny={70}>
      <Naglowek kod="WAVE_PROP / 4CH" stan={ile ? `${ile} ${ile === 1 ? 'funkcja' : ile < 5 ? 'funkcje' : 'funkcji'} w torze` : 'Wszystkie kanały'} />
      {KANALY_FUNKCJI.map((k, i) => {
        const y0 = 150 + i * 92
        const on = aktywne[i]
        return (
          <g key={k.kod}>
            <line x1={40} y1={y0} x2={360} y2={y0} stroke={Fa(0.12)} strokeDasharray="2 4" />
            <Etyk x={40} y={y0 - 40} kolor={on ? P : Fa(0.45)} size={7.5}>{k.kod}</Etyk>
            <Etyk x={360} y={y0 - 40} anchor="end" kolor={Fa(0.35)} size={7}>{`${(k.f * 1.7).toFixed(1)}Hz`}</Etyk>
            {on && <circle cx={34} cy={y0} r={3} fill={P} className="nb-svg-puls" />}
          </g>
        )
      })}
      {/* głowica odtwarzania */}
      <g>
        <line x1={0} y1={100} x2={0} y2={500} stroke={Pa(0.6)}>
          <animate attributeName="x1" values="40;360;40" dur="4s" repeatCount="indefinite" />
          <animate attributeName="x2" values="40;360;40" dur="4s" repeatCount="indefinite" />
        </line>
      </g>
      <Ramka x={24} y={96} w={352} h={410} d={12} />
      <Etyk x={24} y={530} kolor={Fa(0.4)} size={7.5}>{`T+00:${String(12 + (takt % 40)).padStart(2, '0')}`}</Etyk>
      <Etyk x={376} y={530} anchor="end" kolor={Fa(0.4)} size={7.5}>R_SUM_057</Etyk>
    </Scena>
  )
}

/* ══ 6. ŹRÓDŁA — kula ze znaków, sygnały z kanałów płyną do środka ═══════ */
function ScenaZrodla({ wybrane, kanaly }: { wybrane: string[]; kanaly: { id: string; nazwa: string }[] }) {
  const lista = kanaly.filter(k => k.id !== 'inne')
  const cx = 200, cy = 300, R = 88, Rz = 136
  const wezly = lista.map((k, i) => {
    const a = -Math.PI / 2 + (i / lista.length) * Math.PI * 2
    return { ...k, x: cx + Math.cos(a) * Rz, y: cy + Math.sin(a) * Rz, a }
  })
  const maska: Maska = (ctx, t) => {
    const g = ctx.createRadialGradient(cx - 30, cy - 34, 8, cx, cy, R)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0.3)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
    // Obracające się południki — wycinane z kuli
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,0.9)'
    ctx.lineWidth = 6
    for (let k = 0; k < 6; k++) {
      const rx = Math.abs(Math.cos(t * 0.6 + (k * Math.PI) / 6)) * R
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx), R, 0, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }
  const ile = wybrane.filter(id => id !== 'inne').length

  return (
    <Scena maska={maska}>
      <Naglowek kod="SRC_MAP / ISO_PURITY" stan={ile ? `${ile} ${ile === 1 ? 'źródło' : ile < 5 ? 'źródła' : 'źródeł'} na mapie` : '12 kanałów na żywo'} />
      <Podzialka cx={cx} cy={cy} r={R + 10} od={0} do={360} n={72} kolor={Fa(0.25)} dl={4} />
      {wezly.map((w, i) => {
        const on = wybrane.includes(w.id)
        const kx = cx + Math.cos(w.a) * (R + 12), ky = cy + Math.sin(w.a) * (R + 12)
        const d = `M ${w.x} ${w.y} L ${kx} ${ky}`
        const lewa = Math.cos(w.a) < -0.25, prawa = Math.cos(w.a) > 0.25
        return (
          <g key={w.id}>
            <path d={d} stroke={on ? P : Fa(0.15)} strokeDasharray={on ? undefined : '1 3'} />
            {on && <Pakiet d={d} dur={0.8} delay={(i * 0.13) % 0.8} />}
            <Celownik x={w.x} y={w.y} r={on ? 6 : 4} kolor={on ? P : Fa(0.45)} />
            <Etyk
              x={w.x + (lewa ? -12 : prawa ? 12 : 0)} y={w.y + (lewa || prawa ? 3 : Math.sin(w.a) > 0 ? 22 : -14)}
              anchor={lewa ? 'end' : prawa ? 'start' : 'middle'} size={7} kolor={on ? P : Fa(0.45)}
            >
              {w.id.toUpperCase().slice(0, 7)}
            </Etyk>
          </g>
        )
      })}
      <Etyk x={24} y={540} kolor={Fa(0.4)} size={7.5}>{`LINK ${String(ile).padStart(2, '0')}/12 · SYNC`}</Etyk>
      <Etyk x={376} y={540} anchor="end" kolor={Fa(0.4)} size={7.5}>MAGNETIC_FIELD</Etyk>
    </Scena>
  )
}

/* ══ 7. PROBLEM — szum na wejściu, filtr, uporządkowany sygnał na wyjściu ═ */
const ROZWIAZANIA: Record<string, { problem: string; rozwiazanie: string }> = {
  prompty: { problem: 'Pisanie promptów', rozwiazanie: 'Asystent pisze prompt za Ciebie' },
  limity: { problem: 'Limit generacji', rozwiazanie: 'Jedna pula Byte na wszystko' },
  workflow: { problem: '5 narzędzi, 5 kart', rozwiazanie: 'Cały proces w Canvas' },
  niespojne: { problem: 'Każdy wynik inny', rozwiazanie: 'Stała postać, styl i scena' },
  nowy: { problem: 'Nie wiem, od czego zacząć', rozwiazanie: 'Akademia i gotowe presety' },
  koszt: { problem: 'Drogie topowe modele', rozwiazanie: 'Najlepsze modele w jednym planie' },
}

function ScenaProblem({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1800)
  const klucze = Object.keys(ROZWIAZANIA)
  const p = ROZWIAZANIA[wybrane[0] ?? klucze[takt % klucze.length]]
  const maska: Maska = (ctx, t) => {
    // wejście: losowy szum w lejku
    for (let i = 0; i < 160; i++) {
      const y = 120 + Math.random() * 130
      const szer = 150 - (y - 120) * 0.9
      ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.75})`
      ctx.fillRect(200 + (Math.random() * 2 - 1) * szer, y, 6, 6)
    }
    // filtr: romb
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath(); ctx.moveTo(200, 262); ctx.lineTo(228, 300); ctx.lineTo(200, 338); ctx.lineTo(172, 300); ctx.closePath(); ctx.fill()
    // wyjście: równe kolumny z płynącymi impulsami
    for (let k = 0; k < 5; k++) {
      const x = 128 + k * 36
      for (let y = 350; y < 470; y += 7) {
        const faza = ((y - t * 120 - k * 20) % 60 + 60) % 60
        const a = faza < 18 ? 1 : 0.22
        ctx.fillStyle = faza < 18 ? `rgba(255,0,0,${a})` : `rgba(255,255,255,${a})`
        ctx.fillRect(x - 4, y, 8, 6)
      }
    }
  }

  return (
    <Scena maska={maska} kolumny={66}>
      <Etyk x={24} y={40} kolor={Fa(0.4)}>INPUT: NOISE → FILTER_CORE → OUTPUT: SYNC</Etyk>
      <line x1={24} y1={48} x2={376} y2={48} stroke={Fa(0.12)} />
      <g key={`p-${p.problem}`} className="nb-svg-wejdz">
        <Ramka x={60} y={64} w={280} h={36} d={8} />
        <text x={200} y={87} textAnchor="middle" fill={Fa(0.6)} fontSize={12.5}>{p.problem}</text>
        <line x1={100} y1={83} x2={300} y2={83} stroke="hsl(var(--destructive))" strokeWidth={1.4} strokeDasharray="200"
          style={{ ['--dl' as string]: 200, animationDelay: '250ms' } as React.CSSProperties} className="nb-svg-rysuj" />
      </g>
      <path d="M 50 118 L 186 262 M 350 118 L 214 262" stroke={Fa(0.25)} strokeDasharray="2 4" />
      <Celownik x={200} y={300} r={46} kolor={Fa(0.45)} obrot />
      <Etyk x={252} y={304} kolor={Fa(0.5)} size={7.5}>FILTER_CORE</Etyk>
      <Etyk x={60} y={140} kolor={Fa(0.4)} size={7}>NOISE_IN</Etyk>
      <Etyk x={340} y={470} anchor="end" kolor={P} size={7}>SYNC_OUT</Etyk>
      <g key={`r-${p.rozwiazanie}`} className="nb-svg-wejdz" style={{ animationDelay: '200ms' }}>
        <rect x={44} y={488} width={312} height={42} fill={Pa(0.1)} stroke={P} />
        <Ramka x={40} y={484} w={320} h={50} d={8} kolor={P} />
        <text x={200} y={514} textAnchor="middle" fill={Fa(0.95)} fontSize={13} fontWeight={600}>{p.rozwiazanie}</text>
      </g>
    </Scena>
  )
}

/** Rama lewego panelu: siatka w tle + scena + podpis. */
export function PanelSceny({
  scena, wybrane, podpis, kanaly,
}: {
  scena: IdSceny
  wybrane: string[]
  podpis: string
  /** Opcje kroku „Skąd o nas wiesz?” — scena źródeł pokazuje je na mapie */
  kanaly: { id: string; nazwa: string }[]
}) {
  const numer = ['przestrzen', 'cele', 'poziom', 'moduly', 'funkcje', 'zrodla', 'problem'].indexOf(scena) + 1
  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.07) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">
          SEQ_{String(numer).padStart(2, '0')} / 07
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> live
        </span>
      </div>

      <div key={scena} className="nb-scena-wejscie relative min-h-0 flex-1">
        {scena === 'przestrzen' && <ScenaPrzestrzen wybrane={wybrane} />}
        {scena === 'cele' && <ScenaCele wybrane={wybrane} />}
        {scena === 'poziom' && <ScenaPoziom wybrane={wybrane} />}
        {scena === 'moduly' && <ScenaModuly wybrane={wybrane} />}
        {scena === 'funkcje' && <ScenaFunkcje wybrane={wybrane} />}
        {scena === 'zrodla' && <ScenaZrodla wybrane={wybrane} kanaly={kanaly} />}
        {scena === 'problem' && <ScenaProblem wybrane={wybrane} />}
      </div>

      <div className="flex items-center gap-2 px-5 pb-5">
        <NextByteMarkIcon className="h-3.5 w-3.5 text-foreground/60" />
        <p key={podpis} className="nb-krok-wchodzi text-[11.5px] text-muted-foreground">{podpis}</p>
        {wybrane.length > 0 && <Check className="ml-auto h-3.5 w-3.5 text-primary" strokeWidth={3} />}
      </div>
    </div>
  )
}
