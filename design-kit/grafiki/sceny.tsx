/* ═══════════════════════════════════════════════════════════════════════
   SCENY TECHNICZNE
   ═══════════════════════════════════════════════════════════════════════
   Rysunki rozkładane przy przewijaniu: karta GPU w rzucie izometrycznym,
   scena szyfrowania, dokument zobowiązania i glify kroków. Przeniesione 1:1
   razem z prywatnymi stałymi — stałe są częścią rysunku.
   ═══════════════════════════════════════════════════════════════════════ */
import { useState, useEffect, useMemo } from 'react'

export const GPU_O = { x: 150, y: 290 }              // punkt (u=0, v=0, h=0)

export const ISO_X = 0.866, ISO_Y = 0.5

export type EkCell = {
  x: number      // docelowy srodek X
  y: number      // docelowy baseline Y
  ch: string     // znak po ulozeniu
  seed: number   // do scramblowania w locie
  d: number      // opoznienie startu (0..1 w skali scrolla)
  fs: number     // rozmiar czcionki
  o: number      // docelowa nieprzezroczystosc
}

export const AKCENT = 'hsl(var(--primary))'

export const TOK_NA_SEK = 62

/** Licznik tokenów — chodzi tylko wtedy, gdy sekcja jest w kadrze.
    Dziesięć kroków na sekundę wystarczy, żeby cyfry wyglądały na żywe,
    i jest dziesięć razy tańsze niż odświeżanie co klatkę. */
export function useTokenTicker(run: boolean) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(12480); return }
    const iv = setInterval(() => setN((v) => v + TOK_NA_SEK / 10), 100)
    return () => clearInterval(iv)
  }, [run])
  return Math.floor(n)
}

/** Wentylator: obrys, piasta i siedem łopatek kręcących się w kółko. */
export function Fan({ cx, cy, r, dur }: { cx: number; cy: number; r: number; dur: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={AKCENT} strokeOpacity={0.28} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke="hsl(var(--foreground)/0.07)" strokeWidth={1} />
      <g className="nb3-fan" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${dur}s` }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M ${cx} ${cy} Q ${cx + r * 0.42} ${cy - r * 0.5} ${cx + r * 0.86} ${cy - r * 0.2} Q ${cx + r * 0.44} ${cy - r * 0.06} ${cx} ${cy} Z`}
            fill={AKCENT} fillOpacity={0.09} stroke={AKCENT} strokeOpacity={0.3} strokeWidth={1}
            transform={`rotate(${(i * 360) / 7} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={9} fill="hsl(var(--background))" stroke={AKCENT} strokeOpacity={0.4} strokeWidth={1.2} />
    </g>
  )
}

export const GPU_L = 360, GPU_D = 150, GPU_T = 28    // dlugosc, glebokosc, grubosc

export const gpuPt = (u: number, v: number, h: number) => ({
  x: GPU_O.x + (u + v) * ISO_X,
  y: GPU_O.y + (v - u) * ISO_Y - h,
})

export const gpuPoly = (...pts: { x: number; y: number }[]) =>
  pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

/** macierz plaszczyzny na wysokosci h - rysujemy w niej w lokalnych (u,v) */
export const gpuPlane = (h: number) =>
  `matrix(${ISO_X} ${-ISO_Y} ${ISO_X} ${ISO_Y} ${GPU_O.x} ${GPU_O.y - h})`

/** Wentylator w rzucie izometrycznym - rysowany w lokalnych (u,v) plaszczyzny. */
export function IsoFan({ cx, cy, r, dur }: { cx: number; cy: number; r: number; dur: number }) {
  const BLADES = 9
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={AKCENT} strokeOpacity={0.5} strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke={AKCENT} strokeOpacity={0.18} strokeWidth={1} />
      <g className="nb3-fan" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${dur}s` }}>
        {Array.from({ length: BLADES }).map((_, i) => (
          <path
            key={i}
            d={`M ${cx + r * 0.2} ${cy}
                Q ${cx + r * 0.62} ${cy - r * 0.46} ${cx + r * 0.9} ${cy - r * 0.12}
                Q ${cx + r * 0.56} ${cy + r * 0.06} ${cx + r * 0.2} ${cy} Z`}
            fill={AKCENT} fillOpacity={0.07}
            stroke={AKCENT} strokeOpacity={0.42} strokeWidth={1}
            transform={`rotate(${(i * 360) / BLADES} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.2} fill="hsl(var(--background))"
        stroke={AKCENT} strokeOpacity={0.5} strokeWidth={1.2} />
    </g>
  )
}

/** Karta graficzna w rzucie izometrycznym - wentylator kreci sie.
    Bez tabeli specyfikacji: kazdy jej wiersz dublowal tresc, ktora sekcja
    podaje juz w kolumnie po lewej i w licznikach pod spodem. */
export function LocalGpuScene() {
  const b00 = gpuPt(0, 0, 0), b0D = gpuPt(0, GPU_D, 0)
  const bLD = gpuPt(GPU_L, GPU_D, 0)
  const t00 = gpuPt(0, 0, GPU_T), t0D = gpuPt(0, GPU_D, GPU_T)
  const tLD = gpuPt(GPU_L, GPU_D, GPU_T)

  return (
    <svg viewBox="0 0 660 400" className="w-full h-auto" role="img"
      aria-label="Karta graficzna w rzucie izometrycznym z krecacym sie wentylatorem - model dziala lokalnie">
      <defs>
        <filter id="nb3GpuGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── JEDYNY OPIS: przepustowosc i co siedzi w pamieci ── */}
      <g fill="none" stroke="hsl(var(--foreground)/0.22)" strokeWidth={1}>
        <rect x={24} y={18} width={8} height={8} />
        <rect x={36} y={18} width={8} height={8} fill="hsl(var(--foreground)/0.14)" />
      </g>

      <text x={22} y={92} className="font-heading" fontSize="62" fontWeight={300}
        fill={AKCENT} letterSpacing="-2px">{TOK_NA_SEK}</text>
      <text x={116} y={92} fontSize="11" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.5)" letterSpacing="0.18em">TOK/S</text>
      <text x={24} y={112} fontSize="9.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.35)" letterSpacing="0.2em">NA TWOJEJ KARCIE</text>

      <line x1={24} y1={128} x2={196} y2={128} stroke="hsl(var(--foreground)/0.1)" strokeWidth={1} />
      <text x={24} y={146} fontSize="9.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.42)" letterSpacing="0.04em">W VRAM</text>
      <text x={196} y={146} textAnchor="end" fontSize="9.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.75)" letterSpacing="0.04em">4,7 / 8 GB</text>

      {/* ══════════ KARTA ══════════ */}

      {/* sledz PCIe: plyta w plaszczyznie (v,h) na koncu u=0 */}
      <polygon
        points={gpuPoly(
          gpuPt(0, -6, GPU_T + 62), gpuPt(0, GPU_D + 4, GPU_T + 62),
          gpuPt(0, GPU_D + 4, -18), gpuPt(0, -6, -18),
        )}
        fill="hsl(var(--foreground)/0.05)" stroke="hsl(var(--foreground)/0.34)" strokeWidth={1.2} />
      {[0, 1, 2].map((i) => {
        const v0 = 22 + i * 44, v1 = v0 + 26
        return (
          <polygon key={i}
            points={gpuPoly(
              gpuPt(0, v0, GPU_T + 50), gpuPt(0, v1, GPU_T + 50),
              gpuPt(0, v1, GPU_T + 30), gpuPt(0, v0, GPU_T + 30),
            )}
            fill="hsl(var(--background))" stroke="hsl(var(--foreground)/0.3)" strokeWidth={1} />
        )
      })}

      {/* sciana boczna (v = D) i czolo (u = 0) */}
      <polygon points={gpuPoly(t0D, tLD, bLD, b0D)}
        fill={AKCENT} fillOpacity={0.05} stroke={AKCENT} strokeOpacity={0.4} strokeWidth={1.2} />
      <polygon points={gpuPoly(t00, t0D, b0D, b00)}
        fill={AKCENT} fillOpacity={0.1} stroke={AKCENT} strokeOpacity={0.4} strokeWidth={1.2} />

      {/* zebra radiatora */}
      {Array.from({ length: 36 }).map((_, i) => {
        const u = 115 + i * 4.9
        const a = gpuPt(u, GPU_D, GPU_T), b = gpuPt(u, GPU_D, 0)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={AKCENT} strokeOpacity={0.3} strokeWidth={1} />
      })}

      {/* styki krawedziowe PCIe */}
      {Array.from({ length: 28 }).map((_, i) => {
        const u = 34 + i * 6.5
        const a = gpuPt(u, GPU_D, 0), b = gpuPt(u, GPU_D, -13)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="hsl(var(--foreground)/0.28)" strokeWidth={1} />
      })}

      {/* GORNA SCIANKA - dalej w lokalnych (u,v) */}
      <g transform={gpuPlane(GPU_T)}>
        <rect x={0} y={0} width={GPU_L} height={GPU_D} rx={17}
          fill={AKCENT} fillOpacity={0.03} stroke={AKCENT} strokeOpacity={0.5} strokeWidth={1.4}
          filter="url(#nb3GpuGlow)" />

        {/* druga komora chlodzenia */}
        <rect x={38} y={20} width={137} height={110} rx={11}
          fill="none" stroke={AKCENT} strokeOpacity={0.32} strokeWidth={1.1} />
        <line x1={106.5} y1={20} x2={106.5} y2={130} stroke={AKCENT} strokeOpacity={0.22} strokeWidth={1} />
        <line x1={38} y1={75} x2={175} y2={75} stroke={AKCENT} strokeOpacity={0.22} strokeWidth={1} />

        <IsoFan cx={259} cy={75} r={62} dur={6} />

        {/* gniazdo zasilania */}
        <rect x={140} y={4} width={44} height={12} rx={2}
          fill={AKCENT} fillOpacity={0.14} stroke={AKCENT} strokeOpacity={0.4} strokeWidth={1} />
      </g>

      {/* podpis obiektu */}
      <text x={646} y={388} textAnchor="end" fontSize="9" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.3)" letterSpacing="0.2em">TWÓJ KOMPUTER</text>
    </svg>
  )
}

/* 5x7 bitmapy znakow - napis AES-256 tez jest zbudowany z szyfrogramu */
export const EK_GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
}

/* szyfrogram czytamy heksadecymalnie - tak wyglada realny zrzut AES */
export const EK_HEX = '0123456789ABCDEF'

export function EncryptionScene({ p }: { p: number }) {
  const locked = Math.min(1, Math.max(0, p * 1.22))

  const rnd = (n: number) => {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
  }

  // ── Geometria klodki ──
  const CXm = 350
  const BX = 235, BY = 250, BW = 230, BH = 196, R = 28   // korpus 250..446
  const ARC_CY = 218, RO = 88, RI = 54                    // kablak, gora = 130

  // ── Komorki: znaki istnieja WYLACZNIE wewnatrz klodki i napisu ──
  const cells = useMemo<EkCell[]>(() => {
    const out: EkCell[] = []

    const inBody = (x: number, y: number) => {
      if (x < BX || x > BX + BW || y < BY || y > BY + BH) return false
      const rx = Math.max(BX + R - x, x - (BX + BW - R), 0)
      const ry = Math.max(BY + R - y, y - (BY + BH - R), 0)
      return rx * rx + ry * ry <= R * R
    }
    const inShackle = (x: number, y: number) => {
      const dx = x - CXm
      if (y <= ARC_CY) {
        const d = Math.hypot(dx, y - ARC_CY)
        return d >= RI && d <= RO
      }
      const ax = Math.abs(dx)
      return ax >= RI && ax <= RO && y <= BY + 18
    }

    // gesta siatka klodki
    const CW = 13, CH = 15, COLS = 18, ROWS = 22
    const SX = CXm - (COLS * CW) / 2, SY = 128
    let k = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = SX + c * CW + CW / 2
        const y = SY + r * CH + CH / 2
        if (!inBody(x, y) && !inShackle(x, y)) continue
        out.push({
          x, y: y + 4,
          ch: EK_HEX[Math.floor(rnd(k * 97 + 13) * 16) % 16],
          seed: k,
          // klodka buduje sie z gory na dol (ostatnia komorka laduje ~0.81)
          d: (r / ROWS) * 0.42 + rnd(k * 31) * 0.05,
          fs: 11,
          o: 0.5 + rnd(k * 57 + 5) * 0.5,
        })
        k++
      }
    }

    // napis AES-256 z tego samego szyfrogramu
    const TXT = 'AES-256'
    const LC = 7                                  // komorka mniejsza od czcionki -> kreski sa zbite, nie kropkowane
    const LW = (TXT.length * 5 + (TXT.length - 1)) * LC
    const LX = CXm - LW / 2, LY = 472
    TXT.split('').forEach((glyph, gi) => {
      const rowsG = EK_GLYPHS[glyph]
      rowsG.forEach((row, ry) => {
        row.split('').forEach((bit, rx) => {
          if (bit !== '1') return
          out.push({
            x: LX + (gi * 6 + rx) * LC + LC / 2,
            y: LY + ry * LC + LC - 1,
            ch: EK_HEX[Math.floor(rnd(k * 89 + 41) * 16) % 16],
            seed: k,
            // napis skleja sie po klodce (ostatnia komorka laduje ~0.99)
            d: 0.52 + (ry / 7) * 0.10 + rnd(k * 17) * 0.03,
            fs: 9.5,
            o: 0.68 + rnd(k * 23 + 9) * 0.32,
          })
          k++
        })
      })
    })

    return out
  }, [])

  const FALL = 320          // dystans opadania
  const SPAN = 0.34         // ile scrolla zajmuje lot jednej komorki

  return (
    <svg viewBox="84 73 532 518" className="w-full h-auto" role="img"
      aria-label="Opadajacy szyfrogram formujacy sie w klodke z napisem AES-256">
      <defs>
        <filter id="ekGlow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g filter="url(#ekGlow)" fill="hsl(var(--primary))"
        fontFamily="ui-monospace, monospace" textAnchor="middle">
        {cells.map((cell, i) => {
          const t = Math.min(1, Math.max(0, (locked - cell.d) / SPAN))
          if (t <= 0) return null

          const ease = 1 - Math.pow(1 - t, 3)         // wytracanie predkosci przy ladowaniu
          const y = cell.y - (1 - ease) * FALL
          const set = t >= 1                          // ulozona na miejscu

          // w locie szyfrogram sie przemiela, po wyladowaniu zastyga
          const ch = set
            ? cell.ch
            : EK_HEX[Math.floor(rnd(cell.seed * 131 + Math.floor(t * 16) * 977) * 16) % 16]

          // smuga: w locie jasniejsza i lekko przezroczysta
          const op = set ? cell.o : Math.min(1, t * 2.6) * 0.85

          return (
            <text key={i} x={cell.x} y={y} fontSize={cell.fs}
              fillOpacity={op}
              fontWeight={set ? 400 : 700}>
              {ch}
            </text>
          )
        })}
      </g>
    </svg>
  )
}

/* Grafiki krokow - liniowe, abstrakcyjne, kazda z wlasna petla animacji.
   Swiadomie NIE sa makietami UI: makieta obok tekstu opisujacego to samo
   dubluje przekaz, a przy jednej wspolnej makiecie trzeba ja bylo zgrywac ze
   scrollem, co przy kazdej zmianie wysokosci sie rozjezdzalo. */
export function StepGlyph({ i }: { i: number }) {
  const S = 'hsl(var(--primary)/0.42)'      // obrys
  const F = 'hsl(var(--primary)/0.04)'      // wypelnienie

  if (i === 0) {
    // konto: koperta + odznaka z ptaszkiem
    return (
      <svg viewBox="0 0 128 100" className="h-[86px] w-[110px]" aria-hidden>
        <rect x="12" y="24" width="78" height="52" rx="7" fill={F} stroke={S} strokeWidth="1.3" />
        <path d="M 12 31 L 51 57 L 90 31" fill="none" stroke={S} strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="98" cy="66" r="16" fill="hsl(var(--background))" stroke="hsl(var(--primary)/0.5)" strokeWidth="1.3" />
        <path d="M 91 66 l 4.6 4.8 L 105 60" fill="none" stroke="hsl(var(--primary))"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="nb3s-pulse" />
      </svg>
    )
  }

  if (i === 1) {
    // prompt: tokeny wplywajace do pola + migajacy kursor
    return (
      <svg viewBox="0 0 128 100" className="h-[86px] w-[110px]" aria-hidden>
        <g className="nb3s-flow">
          <rect x="8" y="24" width="18" height="6" rx="3" fill="hsl(var(--primary)/0.5)" />
          <rect x="32" y="24" width="28" height="6" rx="3" fill="hsl(var(--primary)/0.3)" />
          <rect x="66" y="24" width="14" height="6" rx="3" fill="hsl(var(--primary)/0.16)" />
        </g>
        <rect x="10" y="44" width="106" height="30" rx="8" fill={F} stroke={S} strokeWidth="1.3" />
        <rect x="21" y="56" width="48" height="4" rx="2" fill="hsl(var(--foreground)/0.22)" />
        <rect x="75" y="52" width="2" height="14" rx="1" fill="hsl(var(--primary))" className="nb3s-caret" />
        <text x="10" y="92" fontSize="8" fontFamily="ui-monospace, monospace"
          fill="hsl(var(--primary)/0.6)" letterSpacing="0.12em">~0.002 BYTE</text>
      </svg>
    )
  }

  // wynik: dokument z dopisujacymi sie liniami
  return (
    <svg viewBox="0 0 128 100" className="h-[86px] w-[110px]" aria-hidden>
      <path d="M 22 12 h 46 l 20 20 v 50 a 6 6 0 0 1 -6 6 H 22 a 6 6 0 0 1 -6 -6 V 18 a 6 6 0 0 1 6 -6 z"
        fill={F} stroke={S} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M 68 12 v 20 h 20" fill="none" stroke={S} strokeWidth="1.3" strokeLinejoin="round" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x="27" y={44 + k * 11} width="50" height="4" rx="2"
          fill="hsl(var(--foreground)/0.22)" className="nb3s-fill"
          style={{ animationDelay: `${k * 0.28}s` }} />
      ))}
      <text x="27" y="92" fontSize="8" fontFamily="ui-monospace, monospace"
        fill="hsl(var(--primary)/0.6)" letterSpacing="0.12em">49.982</text>
      <circle cx="103" cy="72" r="13" fill="hsl(var(--background))" stroke="hsl(var(--primary)/0.5)" strokeWidth="1.3" />
      <path d="M 103 66 v 12 M 98 73 l 5 5 5 -5" fill="none" stroke="hsl(var(--primary))"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="nb3s-pulse" />
    </svg>
  )
}

/** Rysunek: PODPISANY DOKUMENT.

    Zamiast kolejnego okręgu — arkusz zobowiązania. Cztery klauzule na
    arkuszu zapalają się w tym samym rytmie, co cztery zasady po bokach,
    a przy przewijaniu dorysowuje się podpis i przybija pieczęć. „Zasada,
    od której nie ma odstępstwa" wygląda wtedy na to, czym jest: na
    zobowiązanie złożone na piśmie, a nie na hasło. */
export function CommitmentDoc({ p }: { p: number }) {
  const sign = Math.max(0, Math.min(1, (p - 0.42) / 0.34))
  const stamp = Math.max(0, Math.min(1, (p - 0.72) / 0.2))
  const SIGN_LEN = 268

  return (
    <svg viewBox="0 0 260 324" className="w-full h-auto" role="img"
      aria-label="Dokument gwarancji z czterema punktami, podpisem i pieczęcią RODO">
      <defs>
        <linearGradient id="nb3DocFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.065" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.012" />
        </linearGradient>
        <filter id="nb3DocShadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <filter id="nb3DocGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* arkusz — miękki cień zamiast przesuniętej kopii pod spodem */}
      <g filter="url(#nb3DocShadow)">
        <rect x={26} y={16} width={208} height={296} rx={8}
          fill="url(#nb3DocFill)" stroke="hsl(var(--foreground)/0.15)" strokeWidth={1.2} />
      </g>
      {/* światło na górnej krawędzi kartki */}
      <path d="M 34 16.6 H 226" stroke="hsl(var(--foreground)/0.16)" strokeWidth={1} />
      {/* margines jak w formularzu */}
      <line x1={54} y1={30} x2={54} y2={298} stroke="hsl(var(--primary)/0.14)" strokeWidth={1} />

      {/* główka */}
      <g transform="translate(66 36)">
        <rect x={0} y={0} width={16} height={16} rx={4.5} fill="hsl(var(--primary)/0.14)" stroke="hsl(var(--primary)/0.5)" strokeWidth={1} />
        <path d="M 4.2 12.2 V 3.8 L 11.8 12.2 V 3.8" fill="none" stroke="hsl(var(--primary))" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        <text x={25} y={6.5} fontSize="8.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.55)" letterSpacing="0.2em">NASZA GWARANCJA</text>
        <text x={25} y={17} fontSize="8.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.3)" letterSpacing="0.2em">SERWERY W UE</text>
      </g>
      <line x1={66} y1={68} x2={214} y2={68} stroke="hsl(var(--foreground)/0.12)" strokeWidth={1} />

      {/* cztery klauzule — zapalają się razem z zasadami po bokach */}
      {[0, 1, 2, 3].map((i) => {
        const lit = Math.max(0, Math.min(1, (p - 0.04 - i * 0.1) / 0.28))
        const y = 92 + i * 40
        return (
          <g key={i}>
            <text x={34} y={y + 4} fontSize="8.5" fontFamily="ui-monospace,monospace"
              fill="hsl(var(--primary))" fillOpacity={0.22 + lit * 0.6} letterSpacing="0.1em">
              {`0${i + 1}`}
            </text>
            <rect x={66} y={y - 4} width={116} height={3} rx={1.5}
              fill="hsl(var(--primary))" fillOpacity={0.1 + lit * 0.45} />
            <rect x={66} y={y + 5} width={84} height={3} rx={1.5}
              fill="hsl(var(--foreground))" fillOpacity={0.05 + lit * 0.14} />
            {/* ptaszek dostaje własne pole po prawej, nie dotyka linii */}
            <g transform={`translate(198 ${y + 1})`} opacity={0.25 + lit * 0.75}>
              <circle r={8.5} fill="hsl(var(--primary))" fillOpacity={0.06 + lit * 0.1}
                stroke="hsl(var(--primary))" strokeOpacity={0.2 + lit * 0.4} strokeWidth={1} />
              <path d="M -3.6 0.2 l 2.6 2.8 L 4 -2.6" fill="none"
                stroke="hsl(var(--primary))" strokeOpacity={lit} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )
      })}

      <line x1={66} y1={244} x2={214} y2={244} stroke="hsl(var(--foreground)/0.09)" strokeWidth={1} />

      {/* podpis dorysowywany przewijaniem */}
      <path
        d="M 68 282 c 2 -14 6 -25 12 -24 c 5 1 5 13 1 22 c -4 9 -8 11 -6 3 c 3 -13 12 -21 20 -18 c 6 3 3 13 -1 19 c -3 4 -1 6 3 3 c 6 -5 11 -16 17 -14 c 5 2 2 11 -2 16 c -3 4 -1 6 3 3 l 12 -10"
        fill="none" stroke="hsl(var(--primary))" strokeOpacity={0.85} strokeWidth={1.8}
        strokeLinecap="round" filter="url(#nb3DocGlow)"
        strokeDasharray={SIGN_LEN} strokeDashoffset={SIGN_LEN * (1 - sign)}
      />
      <line x1={66} y1={290} x2={148} y2={290} stroke="hsl(var(--foreground)/0.18)" strokeWidth={1} />
      <text x={66} y={302} fontSize="7.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.3)" letterSpacing="0.18em">PODPISANO</text>

      {/* pieczęć przybijana na końcu */}
      <g
        transform={`translate(186 274) rotate(-8) scale(${0.86 + stamp * 0.14})`}
        opacity={0.12 + stamp * 0.88}
      >
        <rect x={-40} y={-17} width={80} height={34} rx={3} fill="hsl(var(--background)/0.6)"
          stroke="hsl(var(--primary))" strokeOpacity={0.75} strokeWidth={1.6} />
        <rect x={-35} y={-12.5} width={70} height={25} rx={1.5} fill="none"
          stroke="hsl(var(--primary))" strokeOpacity={0.3} strokeWidth={1} />
        {/* x przesuniete o pol letterSpacing - textAnchor middle liczy tez odstep po ostatnie znaku */}
        <text x={1} y={-1.5} textAnchor="middle" fontSize="11" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--primary))" fillOpacity={0.9} letterSpacing="0.18em">RODO</text>
        <text x={0.2} y={8} textAnchor="middle" fontSize="5.4" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--primary))" fillOpacity={0.6} letterSpacing="0.05em">UNIA EUROPEJSKA</text>
      </g>

    </svg>
  )
}
