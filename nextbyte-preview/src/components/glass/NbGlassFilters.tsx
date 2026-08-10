import React from 'react'
import { NB_MAPA_DELIKATNA, NB_MAPA_WYRAZNA } from './nb-displacement-map'

/**
 * Global SVG filters for the NextByte glass system.
 * Must be rendered once at app root — all nb-szklo elements reference
 * these filters via CSS backdrop-filter: url(#nb-refrakcja-delikatne).
 *
 * nb-refrakcja-delikatne — subtle, for cards/panels
 * nb-refrakcja-wyrazne   — prominent, for featured elements
 */
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
      {/* Mapa soczewki — rozciagana na caly element, pasmo trzyma sie obwodu */}
      <feImage
        href={mapa}
        x="0" y="0"
        width="100%" height="100%"
        preserveAspectRatio="none"
        result="MAPA"
      />

      {/* R channel — base displacement */}
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

      {/* G channel — slightly more displaced → chromatic aberration */}
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

      {/* B channel — most displaced */}
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

      {/* Merge RGB channels via screen blend — creates the refraction glow */}
      <feBlend in="KG" in2="KB" mode="screen" result="GB" />
      <feBlend in="KR" in2="GB" mode="screen" result="RGB" />

      {/* Slight softening to smooth the aberration edge */}
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
          {/* Delikatne — karty, panele */}
          <GlassFilter
            id="nb-refrakcja-delikatne"
            mapa={NB_MAPA_DELIKATNA}
            scaleR={58} scaleG={64} scaleB={70}
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
