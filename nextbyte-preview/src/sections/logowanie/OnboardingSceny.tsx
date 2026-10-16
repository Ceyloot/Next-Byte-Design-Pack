import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'

/* Lewy panel onboardingu — w miejscu wideo ze wzoru stoją animacje
   wektorowe (SVG), osobna dla każdego kroku. Każda scena żyje w pętli
   (pakiety danych płyną po ścieżkach, linie się rysują, liczniki rosną),
   a jednocześnie reaguje na wybór po prawej: zaznaczona opcja zapala
   swój element sceny. Bez wyboru scena sama przełącza warianty, żeby
   panel nigdy nie stał w miejscu. Kolory wyłącznie z tokenów motywu. */

export type IdSceny = 'przestrzen' | 'cele' | 'poziom' | 'moduly' | 'funkcje' | 'zrodla' | 'problem'

const P = 'hsl(var(--primary))'
const Pa = (a: number) => `hsl(var(--primary) / ${a})`
const Fa = (a: number) => `hsl(var(--foreground) / ${a})`
const KARTA = 'hsl(var(--card))'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

/** Znak Byte (romb z poprzeczką), wycentrowany w (0,0), wys. 200 */
const ROMB = 'M 55,0 L 0,-100 L -55,0 L 0,100 Z'

export function StyleScen() {
  return (
    <style>{`
      @keyframes nbSvgPlyn { to { stroke-dashoffset: -40 } }
      @keyframes nbSvgRysuj { from { stroke-dashoffset: var(--dl, 400) } to { stroke-dashoffset: 0 } }
      @keyframes nbSvgUnos { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
      @keyframes nbSvgPuls { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
      @keyframes nbSvgFala { 0% { transform: scale(.55); opacity: .7 } 100% { transform: scale(1.6); opacity: 0 } }
      @keyframes nbSvgObrot { to { transform: rotate(360deg) } }
      @keyframes nbSvgSpad { 0% { transform: translateY(-90px); opacity: 0 } 60% { transform: translateY(6px); opacity: 1 } 80% { transform: translateY(-3px) } 100% { transform: translateY(0) } }
      @keyframes nbSvgWejdz { from { opacity: 0; transform: scale(.6) } }
      @keyframes nbSvgSlupek { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
      @keyframes nbSvgTasma { to { transform: translateX(-120px) } }
      @keyframes nbSvgObrotRombu { 0%,100% { transform: scaleX(1) } 50% { transform: scaleX(.18) } }
      @keyframes nbScenaWejscie { from { opacity: 0; transform: translateY(16px) scale(.96) } }
      .nb-svg-plyn  { animation: nbSvgPlyn 1s linear infinite }
      .nb-svg-rysuj { animation: nbSvgRysuj 900ms cubic-bezier(.4,0,.2,1) both }
      .nb-svg-unos  { animation: nbSvgUnos 3s ease-in-out infinite; transform-box: fill-box }
      .nb-svg-puls  { animation: nbSvgPuls 1.4s ease-in-out infinite }
      .nb-svg-fala  { animation: nbSvgFala 2.2s cubic-bezier(.2,.6,.3,1) infinite; transform-box: fill-box; transform-origin: center }
      .nb-svg-obrot { animation: nbSvgObrot 18s linear infinite; transform-box: fill-box; transform-origin: center }
      .nb-svg-spad  { animation: nbSvgSpad 640ms cubic-bezier(.3,.7,.3,1) both }
      .nb-svg-wejdz { animation: nbSvgWejdz 420ms cubic-bezier(.2,.9,.25,1.2) both; transform-box: fill-box; transform-origin: center }
      .nb-svg-slupek { animation: nbSvgSlupek .9s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom }
      .nb-svg-tasma { animation: nbSvgTasma 2.4s linear infinite }
      .nb-svg-romb  { animation: nbSvgObrotRombu 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
      .nb-scena-wejscie { animation: nbScenaWejscie 480ms cubic-bezier(.2,.9,.25,1.1) backwards }
      @media (prefers-reduced-motion: reduce) {
        .nb-svg-plyn, .nb-svg-rysuj, .nb-svg-unos, .nb-svg-puls, .nb-svg-fala, .nb-svg-obrot, .nb-svg-spad,
        .nb-svg-wejdz, .nb-svg-slupek, .nb-svg-tasma, .nb-svg-romb, .nb-scena-wejscie { animation: none }
      }
    `}</style>
  )
}

/** Licznik taktów — scena bez wyboru sama przełącza warianty. */
function useTakt(ms: number) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setT(x => x + 1), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return t
}

/** Pakiet danych jadący po ścieżce (SMIL — działa na każdej ścieżce SVG). */
function Pakiet({ d, dur = 1.6, delay = 0, r = 3, kolor = P }: { d: string; dur?: number; delay?: number; r?: number; kolor?: string }) {
  return (
    <circle r={r} fill={kolor} style={{ filter: `drop-shadow(0 0 4px ${kolor})` }}>
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  )
}

function Napis({ x, y, children, size = 10, kolor = Fa(0.45), anchor = 'middle', waga = 500, odstep = 1.6 }: {
  x: number; y: number; children: React.ReactNode; size?: number; kolor?: string; anchor?: 'start' | 'middle' | 'end'; waga?: number; odstep?: number
}) {
  return (
    <text x={x} y={y} fill={kolor} fontSize={size} fontFamily={MONO} fontWeight={waga} textAnchor={anchor} letterSpacing={odstep}>
      {children}
    </text>
  )
}

function Glow({ id }: { id: string }) {
  return (
    <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  )
}

/* ══ 1. PRZESTRZEŃ — izometryczna platforma z pulą Byte ════════════════ */
const iso = (x: number, y: number, z = 0): [number, number] => [200 + (x - y) * 0.866, 300 + (x + y) * 0.5 - z]
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`

function Pryzma({ cx, cy, r, h, gora, lewa, prawa, rant }: { cx: number; cy: number; r: number; h: number; gora: string; lewa: string; prawa: string; rant: string }) {
  const A = iso(cx - r, cy - r, h), B = iso(cx + r, cy - r, h), C = iso(cx + r, cy + r, h), D = iso(cx - r, cy + r, h)
  const B0 = iso(cx + r, cy - r), C0 = iso(cx + r, cy + r), D0 = iso(cx - r, cy + r)
  return (
    <g strokeLinejoin="round">
      <polygon points={[D, C, C0, D0].map(pt).join(' ')} fill={lewa} stroke={rant} strokeWidth={1} />
      <polygon points={[B, C, C0, B0].map(pt).join(' ')} fill={prawa} stroke={rant} strokeWidth={1} />
      <polygon points={[A, B, C, D].map(pt).join(' ')} fill={gora} stroke={rant} strokeWidth={1.2} />
    </g>
  )
}

const BIURKA: [number, number][] = [[0, 150], [-150, 0], [0, -150], [150, 0]]

function ScenaPrzestrzen({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(2400)
  const tryb = wybrane.includes('zespol') ? 'zespol' : wybrane.includes('prywatnie') ? 'prywatnie' : (takt % 2 ? 'zespol' : 'prywatnie')
  const aktywne = tryb === 'zespol' ? [0, 1, 2, 3] : [0]
  const [rdzX, rdzY] = iso(0, 0, 18)
  const pula = tryb === 'zespol' ? '6 070' : '1 500'

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs><Glow id="nbG1" /></defs>
      <Napis x={200} y={46}>PRZESTRZEŃ ROBOCZA</Napis>
      <text key={tryb} x={200} y={78} textAnchor="middle" fill={Fa(0.95)} fontSize={22} fontWeight={300} letterSpacing={-0.6} className="nb-svg-wejdz">
        {tryb === 'zespol' ? 'Zespół · 4 osoby' : 'Tylko Ty'}
      </text>

      {/* siatka podłogi */}
      <g opacity={0.5}>
        {[-200, -150, -100, -50, 0, 50, 100, 150, 200].map(v => (
          <g key={v}>
            <line x1={iso(v, -200)[0]} y1={iso(v, -200)[1]} x2={iso(v, 200)[0]} y2={iso(v, 200)[1]} stroke={Fa(0.05)} />
            <line x1={iso(-200, v)[0]} y1={iso(-200, v)[1]} x2={iso(200, v)[0]} y2={iso(200, v)[1]} stroke={Fa(0.05)} />
          </g>
        ))}
      </g>

      {/* połączenia biurko → rdzeń */}
      {BIURKA.map(([x, y], i) => {
        const [sx, sy] = iso(x, y, 10)
        const d = `M ${sx} ${sy} L ${rdzX} ${rdzY}`
        const on = aktywne.includes(i)
        return (
          <g key={i}>
            <path d={d} stroke={on ? Pa(0.7) : Fa(0.08)} strokeWidth={on ? 1.6 : 1} strokeDasharray="4 6" className={on ? 'nb-svg-plyn' : undefined} />
            {on && <><Pakiet d={d} dur={1.4} delay={i * 0.3} /><Pakiet d={d} dur={1.4} delay={i * 0.3 + 0.7} r={2} /></>}
          </g>
        )
      })}

      {/* rdzeń z pulą Byte */}
      <ellipse cx={rdzX} cy={rdzY} rx={92} ry={52} stroke={Pa(0.5)} strokeWidth={1.2} className="nb-svg-fala" />
      <Pryzma cx={0} cy={0} r={52} h={18} gora={Pa(0.22)} lewa={Pa(0.12)} prawa={Pa(0.07)} rant={Pa(0.7)} />
      <g className="nb-svg-unos">
        <g transform={`translate(${rdzX} ${rdzY - 58}) scale(0.32)`} filter="url(#nbG1)">
          <g className="nb-svg-romb">
            <path d={ROMB} fill={Pa(0.25)} stroke={P} strokeWidth={5} strokeLinejoin="round" />
            <line x1={-55} y1={0} x2={55} y2={0} stroke={P} strokeWidth={5} />
          </g>
        </g>
      </g>
      <Napis x={rdzX} y={rdzY + 104} kolor={Pa(0.9)} size={11} waga={600}>PULA {pula} ⟠</Napis>

      {/* biurka z osobami */}
      {BIURKA.map(([x, y], i) => {
        const on = aktywne.includes(i)
        const [sx, sy] = iso(x, y, 10)
        return (
          <g key={`b${i}`} opacity={on ? 1 : 0.35} style={{ transition: 'opacity .4s' }}>
            <Pryzma cx={x} cy={y} r={30} h={10} gora={on ? Pa(0.18) : Fa(0.05)} lewa={on ? Pa(0.1) : Fa(0.03)} prawa={on ? Pa(0.06) : Fa(0.02)} rant={on ? Pa(0.6) : Fa(0.15)} />
            <g className={on ? 'nb-svg-unos' : undefined} style={{ animationDelay: `${-i * 0.7}s` }}>
              <circle cx={sx} cy={sy - 34} r={7} fill={on ? KARTA : 'none'} stroke={on ? P : Fa(0.3)} strokeWidth={1.5} />
              <path d={`M ${sx - 12} ${sy - 12} Q ${sx} ${sy - 30} ${sx + 12} ${sy - 12}`} stroke={on ? P : Fa(0.3)} strokeWidth={1.5} strokeLinecap="round" />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

/* ══ 2. CELE — prompt rozszczepiany przez pryzmat na rezultaty ═════════ */
const CELE_SCENY = [
  { id: 'automatyzacja', etyk: 'AUTOMAT' },
  { id: 'filmy', etyk: 'FILM' },
  { id: 'marketing', etyk: 'WYNIKI' },
  { id: 'rozgladam', etyk: 'ODKRYWAJ' },
  { id: 'produkty', etyk: 'PRODUKT' },
  { id: 'viral', etyk: 'VIRAL' },
]

function IkonaCelu({ id, x, y, on }: { id: string; x: number; y: number; on: boolean }) {
  const k = on ? P : Fa(0.45)
  const w = 1.6
  switch (id) {
    case 'automatyzacja':
      return (
        <g stroke={k} strokeWidth={w}>
          <path d={`M ${x - 14} ${y + 6} L ${x} ${y - 8} L ${x + 14} ${y + 6}`} className={on ? 'nb-svg-plyn' : undefined} strokeDasharray="3 3" />
          {[[-14, 6], [0, -8], [14, 6]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y + dy} r={4} fill={KARTA} />)}
        </g>
      )
    case 'filmy':
      return (
        <g stroke={k} strokeWidth={w}>
          <rect x={x - 16} y={y - 10} width={32} height={20} rx={3} />
          {[-10, -3, 4, 11].map(dx => <rect key={dx} x={x + dx - 2} y={y - 8} width={3} height={3} fill={k} stroke="none" />)}
          <path d={`M ${x - 3} ${y - 1} L ${x + 4} ${y + 3} L ${x - 3} ${y + 7} Z`} fill={k} stroke="none" />
        </g>
      )
    case 'marketing':
      return (
        <polyline points={`${x - 16},${y + 8} ${x - 6},${y} ${x + 2},${y + 4} ${x + 16},${y - 10}`} stroke={k} strokeWidth={w + 0.4} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="60" style={{ ['--dl' as string]: 60 } as React.CSSProperties} className={on ? 'nb-svg-rysuj' : undefined} />
      )
    case 'rozgladam':
      return (
        <g stroke={k} strokeWidth={w}>
          <circle cx={x} cy={y} r={11} />
          <g className={on ? 'nb-svg-obrot' : undefined} style={{ animationDuration: '4s' }}>
            <path d={`M ${x} ${y - 8} L ${x + 3} ${y} L ${x} ${y + 8} L ${x - 3} ${y} Z`} fill={k} stroke="none" />
          </g>
        </g>
      )
    case 'produkty':
      return (
        <g stroke={k} strokeWidth={w}>
          <rect x={x - 14} y={y - 9} width={28} height={20} rx={4} />
          <circle cx={x} cy={y + 1} r={5.5} />
          <path d={`M ${x - 6} ${y - 9} L ${x - 3} ${y - 13} L ${x + 3} ${y - 13} L ${x + 6} ${y - 9}`} />
        </g>
      )
    default:
      return (
        <g stroke={k} strokeWidth={w}>
          <rect x={x - 9} y={y - 14} width={18} height={28} rx={4} />
          <path d={`M ${x - 3} ${y - 5} L ${x + 5} ${y} L ${x - 3} ${y + 5} Z`} fill={k} stroke="none" />
        </g>
      )
  }
}

function ScenaCele({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1100)
  const aktywny = wybrane[0] ?? CELE_SCENY[takt % CELE_SCENY.length].id
  const prompt = 'zrób kampanię dla nowego produktu'
  const pozycje = CELE_SCENY.map((c, i) => {
    const kol = i % 3, rz = Math.floor(i / 3)
    return { ...c, x: 76 + kol * 124, y: 392 + rz * 92 }
  })

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs>
        <Glow id="nbG2" />
        <linearGradient id="nbWiazka" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P} stopOpacity="0" /><stop offset="1" stopColor={P} stopOpacity="0.9" />
        </linearGradient>
        <clipPath id="nbPisz"><rect x={60} y={50} height={40} width={0}><animate attributeName="width" values="0;262;262" keyTimes="0;.6;1" dur="3.2s" repeatCount="indefinite" /></rect></clipPath>
      </defs>

      {/* pole promptu z pisanym tekstem i kursorem */}
      <rect x={44} y={46} width={312} height={44} rx={12} fill={KARTA} stroke={Fa(0.14)} />
      <g clipPath="url(#nbPisz)">
        <text x={62} y={73} fill={Fa(0.85)} fontSize={12.5} fontFamily={MONO}>{prompt}</text>
      </g>
      <rect x={332} y={58} width={14} height={20} rx={5} fill={P} className="nb-svg-puls" />

      {/* wiązka do pryzmatu */}
      <line x1={200} y1={92} x2={200} y2={204} stroke="url(#nbWiazka)" strokeWidth={3} />
      <path d="M 200 92 L 200 204" stroke={P} strokeWidth={1.4} strokeDasharray="3 9" className="nb-svg-plyn" />
      <Pakiet d="M 200 92 L 200 204" dur={0.9} r={3.5} />

      {/* pryzmat — znak Byte obracający się w 3D */}
      <circle cx={200} cy={250} r={54} stroke={Pa(0.4)} className="nb-svg-fala" />
      <g transform="translate(200 250) scale(0.42)" filter="url(#nbG2)">
        <g className="nb-svg-romb">
          <path d={ROMB} fill={Pa(0.2)} stroke={P} strokeWidth={4} strokeLinejoin="round" />
          <line x1={-55} y1={0} x2={55} y2={0} stroke={P} strokeWidth={4} />
        </g>
      </g>

      {/* promienie do rezultatów */}
      {pozycje.map(c => {
        const on = c.id === aktywny
        const d = `M 200 292 C 200 ${330 + (c.y - 392) * 0.3}, ${c.x} ${c.y - 70}, ${c.x} ${c.y - 26}`
        return (
          <g key={`r-${c.id}`}>
            <path d={d} stroke={on ? P : Fa(0.1)} strokeWidth={on ? 2 : 1} style={{ transition: 'stroke .3s' }} filter={on ? 'url(#nbG2)' : undefined} />
            {on && <><Pakiet d={d} dur={0.8} /><Pakiet d={d} dur={0.8} delay={0.4} r={2} /></>}
          </g>
        )
      })}

      {/* karty rezultatów */}
      {pozycje.map(c => {
        const on = c.id === aktywny
        return (
          <g key={c.id}>
            <rect x={c.x - 50} y={c.y - 26} width={100} height={70} rx={14} fill={on ? Pa(0.12) : KARTA} stroke={on ? P : Fa(0.12)} strokeWidth={on ? 1.5 : 1}
              style={{ transition: 'all .3s' }} />
            <IkonaCelu id={c.id} x={c.x} y={c.y + 2} on={on} />
            <Napis x={c.x} y={c.y + 34} size={8.5} kolor={on ? P : Fa(0.4)}>{c.etyk}</Napis>
          </g>
        )
      })}
    </svg>
  )
}

/* ══ 3. POZIOM — zegar mocy + rosnący graf węzłów ══════════════════════ */
const POZIOMY = ['poczatkujacy', 'sredni', 'zaawansowany', 'ekspert']
const NAZWY_POZIOMOW = ['Prowadzony', 'Szybki', 'Pełna kontrola', 'Reżyser']
const WEZLY: [number, number][] = [
  [200, 400], [140, 440], [260, 440], [90, 400], [310, 400], [200, 480], [120, 500], [280, 500],
  [60, 460], [340, 460], [160, 380], [240, 380],
]
const KRAWEDZIE: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], [0, 10], [0, 11], [5, 6], [5, 7], [10, 3], [11, 4],
]
const WIDOCZNE_WEZLY = [3, 6, 9, 12]

function ScenaPoziom({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1500)
  const wybrany = POZIOMY.indexOf(wybrane[0] ?? '')
  const poziom = wybrany >= 0 ? wybrany : takt % 4
  const n = WIDOCZNE_WEZLY[poziom]
  const R = 120, cx = 200, cy = 250
  const kat = -180 + ((poziom + 1) / 4) * 180
  const luk = Math.PI * R
  const wypelnienie = ((poziom + 1) / 4) * luk

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs>
        <Glow id="nbG3" />
        <linearGradient id="nbLuk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P} stopOpacity="0.35" /><stop offset="1" stopColor={P} />
        </linearGradient>
      </defs>
      <Napis x={200} y={46}>MOC INTERFEJSU</Napis>

      {/* podziałka */}
      {Array.from({ length: 25 }, (_, i) => {
        const a = Math.PI + (i / 24) * Math.PI
        const dl = i % 6 === 0 ? 14 : 7
        const on = i / 24 <= (poziom + 1) / 4
        return (
          <line key={i} x1={cx + Math.cos(a) * (R + 14)} y1={cy + Math.sin(a) * (R + 14)} x2={cx + Math.cos(a) * (R + 14 + dl)} y2={cy + Math.sin(a) * (R + 14 + dl)}
            stroke={on ? P : Fa(0.18)} strokeWidth={i % 6 === 0 ? 2 : 1.2} style={{ transition: 'stroke .4s' }} />
        )
      })}
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} stroke={Fa(0.08)} strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} stroke="url(#nbLuk)" strokeWidth={14} strokeLinecap="round"
        strokeDasharray={luk} strokeDashoffset={luk - wypelnienie} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.3,1.3,.5,1)' }} filter="url(#nbG3)" />

      {/* wskazówka */}
      <g style={{ transform: `rotate(${kat + 90}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform .8s cubic-bezier(.3,1.5,.5,1)' }}>
        <path d={`M ${cx - 4} ${cy} L ${cx} ${cy - R + 22} L ${cx + 4} ${cy} Z`} fill={Fa(0.9)} />
      </g>
      <circle cx={cx} cy={cy} r={9} fill={KARTA} stroke={P} strokeWidth={2} />
      <text key={poziom} x={cx} y={cy + 44} textAnchor="middle" fill={Fa(0.95)} fontSize={22} fontWeight={300} letterSpacing={-0.6} className="nb-svg-wejdz">
        {NAZWY_POZIOMOW[poziom]}
      </text>
      <Napis x={cx} y={cy + 64} kolor={Pa(0.85)} size={9.5}>{`POZIOM ${poziom + 1} / 4 · ${n} NARZĘDZI`}</Napis>

      {/* graf narzędzi — rośnie z poziomem */}
      {KRAWEDZIE.filter(([a, b]) => a < n && b < n).map(([a, b]) => {
        const d = `M ${WEZLY[a][0]} ${WEZLY[a][1]} L ${WEZLY[b][0]} ${WEZLY[b][1]}`
        return (
          <g key={`${a}-${b}-${poziom}`}>
            <path d={d} stroke={Pa(0.45)} strokeWidth={1.3} strokeDasharray="200" style={{ ['--dl' as string]: 200 } as React.CSSProperties} className="nb-svg-rysuj" />
            <Pakiet d={d} dur={1.2 + ((a + b) % 3) * 0.3} delay={(a * 0.17) % 1} r={2.2} />
          </g>
        )
      })}
      {WEZLY.slice(0, n).map(([x, y], i) => (
        <g key={`${i}-${poziom}`} className="nb-svg-wejdz" style={{ animationDelay: `${i * 40}ms` }}>
          <circle cx={x} cy={y} r={i === 0 ? 11 : 7} fill={KARTA} stroke={i === 0 ? P : Pa(0.7)} strokeWidth={1.6} />
          {i === 0 && <circle cx={x} cy={y} r={4} fill={P} />}
        </g>
      ))}
    </svg>
  )
}

/* ══ 4. MODUŁY — izometryczne bloki spadające na płytę ═════════════════ */
const MODULY_SCENY = [
  { id: 'chat', etyk: 'CHAT AI' },
  { id: 'zdjecia', etyk: 'ZDJĘCIA' },
  { id: 'wideo', etyk: 'WIDEO' },
  { id: 'canvas', etyk: 'CANVAS' },
  { id: 'notebook', etyk: 'NOTEBOOK' },
  { id: 'akademia', etyk: 'AKADEMIA' },
]
const isoM = (x: number, y: number, z = 0): [number, number] => [200 + (x - y) * 0.866, 270 + (x + y) * 0.5 - z]

function Kostka({ x, y, s, h, on }: { x: number; y: number; s: number; h: number; on: boolean }) {
  const A = isoM(x - s, y - s, h), B = isoM(x + s, y - s, h), C = isoM(x + s, y + s, h), D = isoM(x - s, y + s, h)
  const B0 = isoM(x + s, y - s), C0 = isoM(x + s, y + s), D0 = isoM(x - s, y + s)
  if (!on) {
    return (
      <g stroke={Fa(0.22)} strokeWidth={1} strokeDasharray="3 4">
        <polygon points={[A, B, C, D].map(pt).join(' ')} />
        <polyline points={[D, D0, C0, B0, B].map(pt).join(' ')} />
        <line x1={C[0]} y1={C[1]} x2={C0[0]} y2={C0[1]} />
      </g>
    )
  }
  return (
    <g strokeLinejoin="round" stroke={P} strokeWidth={1.2}>
      <polygon points={[D, C, C0, D0].map(pt).join(' ')} fill={Pa(0.28)} />
      <polygon points={[B, C, C0, B0].map(pt).join(' ')} fill={Pa(0.16)} />
      <polygon points={[A, B, C, D].map(pt).join(' ')} fill={Pa(0.45)} />
      <polygon points={[A, B, C, D].map(pt).join(' ')} fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={0.8} />
    </g>
  )
}

function ScenaModuly({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(900)
  // Bez wyboru bloki „ładują się” po kolei w pętli
  const demo = wybrane.length === 0
  const wlaczone = demo
    ? MODULY_SCENY.slice(0, (takt % (MODULY_SCENY.length + 2))).map(m => m.id)
    : wybrane
  const sloty = MODULY_SCENY.map((m, i) => {
    const kol = i % 3, rz = Math.floor(i / 3)
    return { ...m, x: -70 + kol * 70, y: -35 + rz * 70 }
  })
  // Rysowanie od tyłu do przodu, żeby bloki się poprawnie zasłaniały
  const kolejnosc = [...sloty].sort((a, b) => a.x + a.y - (b.x + b.y))
  const ile = wlaczone.length

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs><Glow id="nbG4" /></defs>
      <Napis x={200} y={46}>TWÓJ ZESTAW NA START</Napis>
      <text key={ile} x={200} y={80} textAnchor="middle" fill={Fa(0.95)} fontSize={24} fontWeight={300} className="nb-svg-wejdz">
        {ile} / {MODULY_SCENY.length} <tspan fill={P} fontSize={14}>modułów</tspan>
      </text>

      {/* płyta bazowa ze skanem przesuwającym się po niej, pod blokami */}
      <Pryzma3 />
      <rect x={90} y={200} width={220} height={1.5} fill={P}>
        <animate attributeName="y" values="160;380;160" dur="3.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;.5;0" dur="1.8s" repeatCount="indefinite" />
      </rect>
      {kolejnosc.map(s => {
        const on = wlaczone.includes(s.id)
        const [lx, ly] = isoM(s.x, s.y)
        return (
          <g key={`${s.id}-${on}`}>
            {on && <ellipse cx={lx} cy={ly} rx={42} ry={24} fill={Pa(0.18)} filter="url(#nbG4)" />}
            <g className={on ? 'nb-svg-spad' : undefined}>
              <Kostka x={s.x} y={s.y} s={26} h={on ? 46 : 30} on={on} />
            </g>
          </g>
        )
      })}
      {sloty.map(s => {
        const on = wlaczone.includes(s.id)
        // Etykiety pod płytą, w rzędzie — nad blokami zasłaniałyby je sąsiednie bloki
        const i = MODULY_SCENY.findIndex(m => m.id === s.id)
        const lx = 70 + (i % 3) * 130, ly = 458 + Math.floor(i / 3) * 22
        return (
          <g key={`t-${s.id}`}>
            <circle cx={lx - 34} cy={ly - 3} r={2.5} fill={on ? P : Fa(0.25)} />
            <Napis x={lx - 28} y={ly} anchor="start" size={8.5} kolor={on ? P : Fa(0.35)}>{s.etyk}</Napis>
          </g>
        )
      })}
    </svg>
  )
}

function Pryzma3() {
  const s = 125, h = 14, cx = 0, cy = 0
  const A = isoM(cx - s, cy - s), B = isoM(cx + s, cy - s), C = isoM(cx + s, cy + s), D = isoM(cx - s, cy + s)
  const C1 = isoM(cx + s, cy + s, -h), D1 = isoM(cx - s, cy + s, -h), B1 = isoM(cx + s, cy - s, -h)
  return (
    <g strokeLinejoin="round">
      <polygon points={[D, C, C1, D1].map(pt).join(' ')} fill={Fa(0.05)} stroke={Fa(0.14)} />
      <polygon points={[B, C, C1, B1].map(pt).join(' ')} fill={Fa(0.03)} stroke={Fa(0.14)} />
      <polygon points={[A, B, C, D].map(pt).join(' ')} fill={Fa(0.035)} stroke={Pa(0.35)} />
      {[-62, 0, 62].map(v => (
        <g key={v} stroke={Fa(0.07)}>
          <line x1={isoM(v, -s)[0]} y1={isoM(v, -s)[1]} x2={isoM(v, s)[0]} y2={isoM(v, s)[1]} />
          <line x1={isoM(-s, v)[0]} y1={isoM(-s, v)[1]} x2={isoM(s, v)[0]} y2={isoM(s, v)[1]} />
        </g>
      ))}
    </g>
  )
}

/* ══ 5. FUNKCJE — mini-studio: wideo, dźwięk, upscale, inpaint ═════════ */
const FUNKCJE_PANELI: Record<string, number> = {
  'gen-wideo': 0, presety: 0, lektor: 1, lipsync: 1, awatary: 1, upscale: 2, 'gen-zdjec': 3, inpaint: 3, dokumenty: 2, asystent: 1,
}

function odmianaFunkcji(n: number) {
  if (n === 0) return 'funkcje w jednym miejscu'
  if (n === 1) return 'wybrana funkcja'
  const d = n % 10, s = n % 100
  return d >= 2 && d <= 4 && (s < 12 || s > 14) ? 'wybrane funkcje' : 'wybranych funkcji'
}

function ScenaFunkcje({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1300)
  const wl = new Set(wybrane.map(id => FUNKCJE_PANELI[id]).filter(v => v !== undefined))
  const aktywny = (i: number) => (wybrane.length ? wl.has(i) : takt % 4 === i)
  const panele = [
    { x: 30, y: 110, t: 'WIDEO' }, { x: 210, y: 110, t: 'DŹWIĘK' },
    { x: 30, y: 320, t: 'UPSCALE 4K' }, { x: 210, y: 320, t: 'INPAINT' },
  ]
  const W = 160, H = 180

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs>
        <Glow id="nbG5" />
        {panele.map((p, i) => <clipPath key={i} id={`nbKad${i}`}><rect x={p.x + 10} y={p.y + 30} width={W - 20} height={H - 60} rx={8} /></clipPath>)}
      </defs>
      <Napis x={200} y={46}>STUDIO · 4 TRYBY NARAZ</Napis>
      <text x={200} y={80} textAnchor="middle" fill={Fa(0.95)} fontSize={22} fontWeight={300}>
        {wybrane.length || 'Wszystkie'} <tspan fill={P} fontSize={14}>{odmianaFunkcji(wybrane.length)}</tspan>
      </text>

      {panele.map((p, i) => {
        const on = aktywny(i)
        return (
          <g key={i}>
            <rect x={p.x} y={p.y} width={W} height={H} rx={16} fill={on ? Pa(0.08) : KARTA} stroke={on ? P : Fa(0.12)} strokeWidth={on ? 1.5 : 1} style={{ transition: 'all .3s' }} />
            <circle cx={p.x + 16} cy={p.y + 16} r={3} fill={on ? P : Fa(0.25)} className={on ? 'nb-svg-puls' : undefined} />
            <Napis x={p.x + 26} y={p.y + 19.5} anchor="start" size={8.5} kolor={on ? P : Fa(0.45)}>{p.t}</Napis>
            <rect x={p.x + 10} y={p.y + 30} width={W - 20} height={H - 60} rx={8} fill={Fa(0.04)} />
            <g clipPath={`url(#nbKad${i})`} opacity={on ? 1 : 0.55}>
              {i === 0 && (
                <g className="nb-svg-tasma">
                  {Array.from({ length: 6 }, (_, k) => {
                    const fx = p.x + 14 + k * 60
                    return (
                      <g key={k}>
                        <rect x={fx} y={p.y + 44} width={54} height={92} rx={4} fill={Pa(0.08 + (k % 3) * 0.05)} stroke={Pa(0.4)} />
                        <path d={`M ${fx + 4} ${p.y + 124} L ${fx + 20} ${p.y + 96} L ${fx + 32} ${p.y + 112} L ${fx + 42} ${p.y + 100} L ${fx + 52} ${p.y + 124} Z`} fill={Pa(0.35)} />
                        <circle cx={fx + 40} cy={p.y + 64} r={6} fill={Fa(0.5)} />
                      </g>
                    )
                  })}
                </g>
              )}
              {i === 1 && Array.from({ length: 22 }, (_, k) => (
                <rect key={k} x={p.x + 18 + k * 6} y={p.y + 50} width={3.5} height={70} rx={1.75} fill={P}
                  className="nb-svg-slupek" style={{ animationDelay: `${-((k * 137) % 900)}ms`, opacity: 0.4 + ((k * 7) % 6) / 10 }} />
              ))}
              {i === 2 && (
                <g>
                  {Array.from({ length: 48 }, (_, k) => {
                    const c = k % 8, r = Math.floor(k / 8)
                    const d = Math.hypot(c - 3.5, r - 2.5)
                    return (
                      <rect key={k} x={p.x + 10 + c * 17.5} y={p.y + 30 + r * 20} width={17.5} height={20} fill={Pa(Math.max(0.05, 0.6 - d * 0.12))}>
                        <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.35;.5;.9;1" dur="3s" repeatCount="indefinite" />
                      </rect>
                    )
                  })}
                  <circle cx={p.x + W / 2} cy={p.y + 90} r={42} fill={Pa(0.45)} filter="url(#nbG5)">
                    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.35;.5;.9;1" dur="3s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}
              {i === 3 && (
                <g>
                  <path d={`M ${p.x + 30} ${p.y + 110} C ${p.x + 50} ${p.y + 50}, ${p.x + 110} ${p.y + 130}, ${p.x + 130} ${p.y + 60}`} stroke={Pa(0.5)} strokeWidth={18} strokeLinecap="round"
                    strokeDasharray="200" style={{ ['--dl' as string]: 200, animationDuration: '2.6s', animationIterationCount: 'infinite' } as React.CSSProperties} className="nb-svg-rysuj" />
                  <path d={`M ${p.x + 80} ${p.y + 62} L ${p.x + 88} ${p.y + 80} L ${p.x + 106} ${p.y + 82} L ${p.x + 92} ${p.y + 94} L ${p.x + 96} ${p.y + 112} L ${p.x + 80} ${p.y + 102} L ${p.x + 64} ${p.y + 112} L ${p.x + 68} ${p.y + 94} L ${p.x + 54} ${p.y + 82} L ${p.x + 72} ${p.y + 80} Z`}
                    fill={P} filter="url(#nbG5)">
                    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.55;.7;.95;1" dur="2.6s" repeatCount="indefinite" />
                  </path>
                </g>
              )}
            </g>
            {/* pasek postępu panelu */}
            <rect x={p.x + 14} y={p.y + H - 18} width={W - 28} height={3} rx={1.5} fill={Fa(0.08)} />
            {on && (
              <rect x={p.x + 14} y={p.y + H - 18} height={3} rx={1.5} fill={P}>
                <animate attributeName="width" values={`0;${W - 28}`} dur={`${1.6 + i * 0.3}s`} repeatCount="indefinite" />
              </rect>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ══ 6. ŹRÓDŁA — glob z sygnałami płynącymi do NextByte ════════════════ */
function ScenaZrodla({ wybrane, kanaly }: { wybrane: string[]; kanaly: { id: string; nazwa: string }[] }) {
  const lista = kanaly.filter(k => k.id !== 'inne')
  const cx = 200, cy = 290, R = 98, Rz = 146
  const wezly = lista.map((k, i) => {
    const a = -Math.PI / 2 + (i / lista.length) * Math.PI * 2
    return { ...k, x: cx + Math.cos(a) * Rz, y: cy + Math.sin(a) * Rz, a }
  })
  const ile = wybrane.filter(id => id !== 'inne').length

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs>
        <Glow id="nbG6" />
        <radialGradient id="nbGlob" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={P} stopOpacity="0.22" /><stop offset="1" stopColor={P} stopOpacity="0.02" />
        </radialGradient>
      </defs>
      <Napis x={200} y={46}>SKĄD PRZYCHODZĄ TWÓRCY</Napis>
      <text key={ile} x={200} y={80} textAnchor="middle" fill={Fa(0.95)} fontSize={22} fontWeight={300} className="nb-svg-wejdz">
        {ile ? `${ile} ${ile === 1 ? 'źródło' : ile < 5 ? 'źródła' : 'źródeł'}` : '12 kanałów'} <tspan fill={P} fontSize={14}>na żywo</tspan>
      </text>

      {/* glob: południki „obracają się” przez animację promienia */}
      <circle cx={cx} cy={cy} r={R} fill="url(#nbGlob)" stroke={Pa(0.5)} strokeWidth={1.2} />
      {[-0.6, -0.3, 0, 0.3, 0.6].map(v => (
        <ellipse key={v} cx={cx} cy={cy + v * R} rx={Math.sqrt(1 - v * v) * R} ry={Math.sqrt(1 - v * v) * R * 0.18} stroke={Fa(0.1)} />
      ))}
      {[0, 1, 2, 3, 4, 5].map(k => (
        <ellipse key={k} cx={cx} cy={cy} rx={R} ry={R} stroke={Pa(0.28)}>
          <animate attributeName="rx" values={`${R};0;${R}`} dur="6s" begin={`${-k}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* kanały i sygnały */}
      {wezly.map((w, i) => {
        const on = wybrane.includes(w.id)
        const kx = cx + Math.cos(w.a) * (R + 4), ky = cy + Math.sin(w.a) * (R + 4)
        const d = `M ${w.x} ${w.y} Q ${(w.x + kx) / 2 + Math.sin(w.a) * 20} ${(w.y + ky) / 2 - Math.cos(w.a) * 20} ${kx} ${ky}`
        const lewa = Math.cos(w.a) < -0.2, prawa = Math.cos(w.a) > 0.2
        return (
          <g key={w.id}>
            <path d={d} stroke={on ? P : Fa(0.12)} strokeWidth={on ? 1.6 : 1} strokeDasharray={on ? undefined : '2 4'} />
            <Pakiet d={d} dur={on ? 0.9 : 2.6} delay={(i * 0.37) % 2.6} r={on ? 3 : 1.8} kolor={on ? P : Fa(0.4)} />
            {on && <circle cx={w.x} cy={w.y} r={12} stroke={P} className="nb-svg-fala" />}
            <circle cx={w.x} cy={w.y} r={on ? 6 : 4} fill={on ? P : KARTA} stroke={on ? P : Fa(0.3)} strokeWidth={1.4} filter={on ? 'url(#nbG6)' : undefined} />
            <Napis x={w.x + (lewa ? -10 : prawa ? 10 : 0)} y={w.y + (lewa || prawa ? 3 : Math.sin(w.a) > 0 ? 20 : -12)}
              anchor={lewa ? 'end' : prawa ? 'start' : 'middle'} size={8} odstep={0.8} kolor={on ? P : Fa(0.45)}>
              {w.nazwa.replace('Wyszukiwarka ', '').replace(' i media', '').replace(' znajomego', '').toUpperCase()}
            </Napis>
          </g>
        )
      })}

      {/* NextByte w środku */}
      <circle cx={cx} cy={cy} r={30} fill={KARTA} stroke={P} strokeWidth={1.5} filter="url(#nbG6)" />
      <g transform={`translate(${cx} ${cy}) scale(0.052) translate(-599.5 -433)`} fill={Fa(0.95)}>
        <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" /><path d="M784,68 L900,68 L900,460 L784,460 Z" />
        <path d="M299,264 L416,377 L415,797 L298,797 Z" /><path d="M900,489 L784.5,490 L900,600.5 Z" />
      </g>
    </svg>
  )
}

/* ══ 7. PROBLEM — chaos przechodzi przez NextByte i wychodzi jako porządek ═ */
const ROZWIAZANIA: Record<string, { problem: string; rozwiazanie: string }> = {
  prompty: { problem: 'Pisanie promptów', rozwiazanie: 'Asystent pisze prompt za Ciebie' },
  limity: { problem: 'Limit generacji', rozwiazanie: 'Jedna pula Byte na wszystko' },
  workflow: { problem: '5 narzędzi, 5 kart', rozwiazanie: 'Cały proces w Canvas' },
  niespojne: { problem: 'Każdy wynik inny', rozwiazanie: 'Stała postać, styl i scena' },
  nowy: { problem: 'Nie wiem, od czego zacząć', rozwiazanie: 'Akademia i gotowe presety' },
  koszt: { problem: 'Drogie topowe modele', rozwiazanie: 'Najlepsze modele w jednym planie' },
}
const CHAOS = [
  'M 40 120 C 120 60, 90 200, 170 150 S 160 230, 186 252',
  'M 360 110 C 260 90, 330 200, 250 170 S 240 240, 214 252',
  'M 80 210 C 40 150, 200 120, 140 190 S 200 210, 194 254',
  'M 320 220 C 380 160, 200 130, 270 200 S 210 220, 206 254',
  'M 200 100 C 260 140, 120 160, 210 200 S 190 230, 200 250',
]

function ScenaProblem({ wybrane }: { wybrane: string[] }) {
  const takt = useTakt(1800)
  const klucze = Object.keys(ROZWIAZANIA)
  const p = ROZWIAZANIA[wybrane[0] ?? klucze[takt % klucze.length]]
  const wyjscia = [120, 160, 200, 240, 280]

  return (
    <svg viewBox="0 0 400 560" className="h-full w-full" fill="none">
      <defs>
        <Glow id="nbG7" />
        <linearGradient id="nbBramaW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P} stopOpacity="0.9" /><stop offset="1" stopColor={P} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* problem — przekreślany */}
      <g key={`p-${p.problem}`} className="nb-svg-wejdz">
        <rect x={70} y={36} width={260} height={36} rx={10} fill={KARTA} stroke={Fa(0.14)} />
        <text x={200} y={59} textAnchor="middle" fill={Fa(0.6)} fontSize={12.5}>{p.problem}</text>
        <line x1={110} y1={55} x2={290} y2={55} stroke="hsl(var(--destructive))" strokeWidth={1.6} strokeDasharray="180"
          style={{ ['--dl' as string]: 180, animationDelay: '300ms' } as React.CSSProperties} className="nb-svg-rysuj" />
      </g>

      {/* chaos */}
      {CHAOS.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={Fa(0.22)} strokeWidth={1.4} strokeDasharray="5 5" className="nb-svg-plyn" style={{ animationDuration: `${0.8 + i * 0.2}s` }} />
          <Pakiet d={d} dur={1.8 + i * 0.25} delay={i * 0.3} r={2.4} kolor={Fa(0.55)} />
        </g>
      ))}

      {/* brama — znak Byte */}
      <circle cx={200} cy={290} r={46} stroke={Pa(0.45)} className="nb-svg-fala" />
      <g transform="translate(200 290) scale(0.36)" filter="url(#nbG7)">
        <path d={ROMB} fill={Pa(0.22)} stroke={P} strokeWidth={4.5} strokeLinejoin="round" />
        <line x1={-55} y1={0} x2={55} y2={0} stroke={P} strokeWidth={4.5} />
      </g>

      {/* porządek — równe tory z pakietami */}
      {wyjscia.map((x, i) => {
        const d = `M 200 328 C 200 360, ${x} 360, ${x} 400 L ${x} 470`
        return (
          <g key={x}>
            <path d={d} stroke="url(#nbBramaW)" strokeWidth={1.6} />
            <Pakiet d={d} dur={1.1} delay={i * 0.18} r={3} />
          </g>
        )
      })}

      {/* rozwiązanie */}
      <g key={`r-${p.rozwiazanie}`} className="nb-svg-wejdz" style={{ animationDelay: '250ms' }}>
        <rect x={50} y={486} width={300} height={42} rx={12} fill={Pa(0.12)} stroke={P} strokeWidth={1.4} filter="url(#nbG7)" />
        <text x={200} y={512} textAnchor="middle" fill={Fa(0.95)} fontSize={13} fontWeight={600}>{p.rozwiazanie}</text>
      </g>
    </svg>
  )
}

/** Rama lewego panelu: tło z siatką i poświatą + scena SVG + podpis. */
export function PanelSceny({
  scena, wybrane, podpis, kanaly,
}: {
  scena: IdSceny
  wybrane: string[]
  podpis: string
  /** Opcje kroku „Skąd o nas wiesz?” — scena źródeł pokazuje je na globie */
  kanaly: { id: string; nazwa: string }[]
}) {
  const numer = ['przestrzen', 'cele', 'poziom', 'moduly', 'funkcje', 'zrodla', 'problem'].indexOf(scena) + 1
  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 45%, hsl(var(--primary) / 0.10), transparent 70%)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground) / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
          }}
        />
      </div>

      <div className="flex items-center justify-between px-5 pt-4">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">
          {String(numer).padStart(2, '0')} / 07
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> live
        </span>
      </div>

      <div key={scena} className="nb-scena-wejscie flex min-h-0 flex-1 items-center justify-center px-2">
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

