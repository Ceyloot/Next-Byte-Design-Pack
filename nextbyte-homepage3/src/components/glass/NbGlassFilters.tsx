import React from 'react'
import { NB_MAPA_DELIKATNA, NB_MAPA_WYRAZNA } from './nb-displacement-map'
import { EDGE_15_REFRACTION_MAP } from './edge-refraction-map'

/**
 * Global SVG filters for the NextByte glass system.
 * Must be rendered once at app root — all nb-szklo elements reference
 * these filters via CSS backdrop-filter: url(#nb-refrakcja-delikatne).
 *
 * nb-refrakcja-delikatne — 15% edge refraction for cards/panels
 * nb-refrakcja-wyrazne   — prominent, for featured elements
 */
/**
 * Fast 60FPS Liquid Glass Refraction Filter (Single-pass GPU displacement)
 */
function FastGlassFilter({ id, mapa, scale }: { id: string; mapa: string; scale: number }) {
  return (
    // primitiveUnits="objectBoundingBox" forces feImage's 0..1 x/y/width/height to mean
    // exactly the filtered element's own box (no ambiguity with percentage resolution
    // that used to leave only the bottom rim inside the visible sampled window).
    // The filter region is kept tight to the element (no -10%/120% margin) since every
    // rim samples inward only — a smaller render buffer is cheaper for the GPU to
    // recompute on every one of the many glass tiles on screen.
    <filter id={id} x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
      <feImage href={mapa} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="MAPA" />
      {/* R drives X shift (left/right rims), G drives Y shift (top/bottom rims) — each edge bends perpendicular to itself instead of diagonally */}
      <feDisplacementMap in="SourceGraphic" in2="MAPA" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  )
}

function GlassFilter({ id, mapa, scaleR, scaleG, scaleB }: {
  id: string
  mapa: string
  scaleR: number
  scaleG: number
  scaleB: number
}) {
  return (
    <filter
      id={id}
      x="-35%" y="-35%"
      width="170%" height="170%"
      colorInterpolationFilters="sRGB"
    >
      <feImage
        href={mapa}
        x="0" y="0"
        width="100%" height="100%"
        preserveAspectRatio="none"
        result="MAPA"
      />
      <feDisplacementMap
        in="SourceGraphic" in2="MAPA"
        scale={scaleR}
        xChannelSelector="R" yChannelSelector="B"
        result="KR_P"
      />
      <feColorMatrix
        in="KR_P" type="matrix"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
        result="KR"
      />
      <feDisplacementMap
        in="SourceGraphic" in2="MAPA"
        scale={scaleG}
        xChannelSelector="R" yChannelSelector="B"
        result="KG_P"
      />
      <feColorMatrix
        in="KG_P" type="matrix"
        values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
        result="KG"
      />
      <feDisplacementMap
        in="SourceGraphic" in2="MAPA"
        scale={scaleB}
        xChannelSelector="R" yChannelSelector="B"
        result="KB_P"
      />
      <feColorMatrix
        in="KB_P" type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
        result="KB"
      />
      <feBlend in="KG" in2="KB" mode="screen" result="GB" />
      <feBlend in="KR" in2="GB" mode="screen" result="RGB" />
      <feGaussianBlur in="RGB" stdDeviation="0.3" />
    </filter>
  )
}

export function NbGlassFilters() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          {/* Delikatne — karty, panele (Refrakcja 3px TYLKO na krawędziach — Zero przeskakiwania) */}
          {/* NOTE: with primitiveUnits="objectBoundingBox" on this filter, `scale` is no
              longer raw pixels — it's multiplied by the element's bounding-box diagonal.
              A tiny fraction here already means several real pixels of shift. */}
          <FastGlassFilter
            id="nb-refrakcja-delikatne"
            mapa={EDGE_15_REFRACTION_MAP}
            scale={0.065}
          />

          {/* Wyraźne — nav, modal, elementy wyróżnione */}
          <GlassFilter
            id="nb-refrakcja-wyrazne"
            mapa={NB_MAPA_WYRAZNA}
            scaleR={84} scaleG={92} scaleB={100}
          />
        </defs>
      </svg>
    </div>
  )
}
