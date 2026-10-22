/**
 * NextByte Liquid Glass Displacement Maps
 * Exports SVG data URIs for feDisplacementMap SVG glass refraction filters.
 */

const CANVAS = 400
const RIM = 12
const SOFTEN = RIM * 0.8
const PEAK_LOW = 0
const PEAK_HIGH = 255

function createDelicateMap(): string {
  const inset = RIM / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
    <defs>
      <filter id="soften" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="${SOFTEN}"/>
      </filter>
    </defs>
    <rect width="${CANVAS}" height="${CANVAS}" fill="rgb(128,128,128)"/>
    <rect x="0" y="${-inset}" width="${CANVAS}" height="${RIM}" fill="rgb(128,${PEAK_HIGH},128)" filter="url(#soften)"/>
    <rect x="0" y="${CANVAS - inset}" width="${CANVAS}" height="${RIM}" fill="rgb(128,${PEAK_LOW},128)" filter="url(#soften)"/>
    <rect x="${-inset}" y="0" width="${RIM}" height="${CANVAS}" fill="rgb(${PEAK_HIGH},128,128)" filter="url(#soften)"/>
    <rect x="${CANVAS - inset}" y="0" width="${RIM}" height="${CANVAS}" fill="rgb(${PEAK_LOW},128,128)" filter="url(#soften)"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createWyraznaMap(): string {
  const inset = RIM / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
    <defs>
      <filter id="soften" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="${SOFTEN * 1.2}"/>
      </filter>
    </defs>
    <rect width="${CANVAS}" height="${CANVAS}" fill="rgb(128,128,128)"/>
    <rect x="0" y="${-inset}" width="${CANVAS}" height="${RIM * 1.5}" fill="rgb(128,${PEAK_HIGH},255)" filter="url(#soften)"/>
    <rect x="0" y="${CANVAS - inset}" width="${CANVAS}" height="${RIM * 1.5}" fill="rgb(128,${PEAK_LOW},0)" filter="url(#soften)"/>
    <rect x="${-inset}" y="0" width="${RIM * 1.5}" height="${CANVAS}" fill="rgb(${PEAK_HIGH},128,255)" filter="url(#soften)"/>
    <rect x="${CANVAS - inset}" y="0" width="${RIM * 1.5}" height="${CANVAS}" fill="rgb(${PEAK_LOW},128,0)" filter="url(#soften)"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const NB_MAPA_DELIKATNA = createDelicateMap()
export const NB_MAPA_WYRAZNA = createWyraznaMap()
