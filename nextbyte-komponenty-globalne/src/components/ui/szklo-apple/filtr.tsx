/**
 * ════════════════════════════════════════════════════════════════════════
 *  FILTR SVG (aberracja na krawędzi) — kopia `rdev/liquid-glass-react` wewnątrz naszej biblioteki
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „zrób całkowicie osobny komponent, bazując lub kopiując 1:1 to".
 *
 * ── DLACZEGO KOPIA, A NIE ZALEŻNOŚĆ Z NPM ───────────────────────────────
 * Pakiet `liquid-glass-react@1.1.1` jest zainstalowany, ale ma trzy cechy,
 * które w tej platformie przeszkadzają:
 *   ① deklaruje `peer react >=19`, a stoimy na 18.3 — instalacja przechodzi
 *      tylko z `--legacy-peer-deps`, co przy każdym `npm ci` jest miną;
 *   ② nie da się go dostroić: parametry są propsami, ale materiał, warstwy
 *      i pozycjonowanie są zamknięte w środku;
 *   ③ zakłada, że element jest NAKŁADKĄ na tło (`transform: translate(-50%,
 *      -50%)`), więc w kontenerze flex rozpycha rodzica — zmierzone: pasek
 *      hero urósł z 96 do 340 px.
 * Kod u nas znaczy: własne tempo zmian, brak peer-dependency i możliwość
 * poprawienia punktu ③ bez czekania na wydanie biblioteki.
 *
 * ── SKĄD TO POCHODZI ────────────────────────────────────────────────────
 * `rdev/liquid-glass-react`, licencja MIT, Copyright 2025 MAX ROVENSKY.
 * Mapa przemieszczenia i funkcja SDF pochodzą z `shuding/liquid-glass`.
 * Kod skopiowany 1:1 z wersji 1.1.1; rozbity na pliki wyłącznie po to,
 * żeby żaden nie przekroczył 500 linii — logika nietknięta.
 *
 * ── UWAGA O WADZE ───────────────────────────────────────────────────────
 * `mapy.ts` to 41 KB base64 (trzy mapy JPEG). Tryb `shader` ich NIE POTRZEBUJE
 * — liczy mapę na canvasie w locie (`generator-mapy.ts`). Jeśli w platformie
 * zostanie tylko `mode="shader"`, `mapy.ts` da się usunąć razem z tymi 41 KB.
 */

import { type CSSProperties, forwardRef, useCallback, useEffect, useId, useRef, useState } from "react"
import { getMap } from "./pomocnicze"


/* ---------- SVG filter (edge-only displacement) ---------- */

export const GlassFilter: React.FC<{ id: string; displacementScale: number; aberrationIntensity: number; width: number; height: number; mode: "standard" | "polar" | "prominent" | "shader"; shaderMapUrl?: string }> = ({
  id,
  displacementScale,
  aberrationIntensity,
  width,
  height,
  mode,
  shaderMapUrl,
}) => (
  <svg style={{ position: "absolute", width, height }} aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-edge-mask`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="black" stopOpacity="0" />
        <stop offset={`${Math.max(30, 80 - aberrationIntensity * 2)}%`} stopColor="black" stopOpacity="0" />
        <stop offset="100%" stopColor="white" stopOpacity="1" />
      </radialGradient>
      <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
        <feImage id="feimage" x="0" y="0" width="100%" height="100%" result="DISPLACEMENT_MAP" href={getMap(mode, shaderMapUrl)} preserveAspectRatio="xMidYMid slice" />

        {/* Create edge mask using the displacement map itself */}
        <feColorMatrix
          in="DISPLACEMENT_MAP"
          type="matrix"
          values="0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0.3 0.3 0.3 0 0
                 0 0 0 1 0"
          result="EDGE_INTENSITY"
        />
        <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
          <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
        </feComponentTransfer>

        {/* Original undisplaced image for center */}
        <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

        {/* Red channel displacement with slight offset */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * (mode === "shader" ? 1 : -1)} xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
        <feColorMatrix
          in="RED_DISPLACED"
          type="matrix"
          values="1 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="RED_CHANNEL"
        />

        {/* Green channel displacement */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.05)} xChannelSelector="R" yChannelSelector="B" result="GREEN_DISPLACED" />
        <feColorMatrix
          in="GREEN_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 1 0 0 0
                 0 0 0 0 0
                 0 0 0 1 0"
          result="GREEN_CHANNEL"
        />

        {/* Blue channel displacement with slight offset */}
        <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * ((mode === "shader" ? 1 : -1) - aberrationIntensity * 0.1)} xChannelSelector="R" yChannelSelector="B" result="BLUE_DISPLACED" />
        <feColorMatrix
          in="BLUE_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 1 0 0
                 0 0 0 1 0"
          result="BLUE_CHANNEL"
        />

        {/* Combine all channels with screen blend mode for chromatic aberration */}
        <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
        <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

        {/* Add slight blur to soften the aberration effect */}
        <feGaussianBlur in="RGB_COMBINED" stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)} result="ABERRATED_BLURRED" />

        {/* Apply edge mask to aberration effect */}
        <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />

        {/* Create inverted mask for center */}
        <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />

        {/* Combine edge aberration with clean center */}
        <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
      </filter>
    </defs>
  </svg>
)

/* ---------- container ---------- */