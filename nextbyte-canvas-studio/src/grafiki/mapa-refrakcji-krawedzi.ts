/**
 * NextByte — All-Edge Liquid Glass Refraction Map
 * Center of the card is exact neutral gray (R=128, G=128) — 0.00px displacement.
 *
 * Displacement is split per axis so each edge bends perpendicular to itself:
 *   - R channel drives X displacement -> used by the LEFT/RIGHT rims.
 *   - G channel drives Y displacement -> used by the TOP/BOTTOM rims.
 *
 * IMPORTANT: feDisplacementMap's shift direction depends on the channel
 * value being above or below 128 — NOT on which edge it's near. Every rim
 * must push its sample INWARD, toward the tile's own center, because a
 * backdrop-filter can only sample content that actually exists behind the
 * element; pushing outward samples past the tile boundary and disappears.
 * So each edge uses the opposite-sign peak from its opposite edge:
 *   top    -> G > 128 (samples downward / inward)
 *   bottom -> G < 128 (samples upward   / inward)
 *   left   -> R > 128 (samples rightward/ inward)
 *   right  -> R < 128 (samples leftward / inward)
 */

const CANVAS = 400
// Rim thickness — how far the refraction band reaches in from each edge.
// This is a fraction of the tile's own box (CANVAS units = 100% of width/height),
// so ~10/400 = 2.5% of the edge -> roughly a 6px band on typical card sizes.
const RIM = 10
// Generous blur so the peak fades out gradually — too little blur here reads as a
// visible "step" (banding) once it's stretched across a large tile and pushed
// through blur()+saturate() in the CSS backdrop-filter chain. Full 0/255 channel
// extremes compensate for how much a blur this size dilutes a thin rect's peak.
const SOFTEN = RIM * 0.8
const PEAK_LOW = 0    // < 128 -> shifts sample toward -axis (up / left)
const PEAK_HIGH = 255 // > 128 -> shifts sample toward +axis (down / right)

function createFrameRefractionMap(): string {
  const inset = RIM / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
    <defs>
      <filter id="soften" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="${SOFTEN}"/>
      </filter>
    </defs>

    <!-- Base: neutral R=128 (no X shift), G=128 (no Y shift) across the whole body -->
    <rect width="${CANVAS}" height="${CANVAS}" fill="rgb(128,128,128)"/>

    <!-- TOP rim: G > 128 -> samples downward, inward from the top edge -->
    <rect x="0" y="${-inset}" width="${CANVAS}" height="${RIM}" fill="rgb(128,${PEAK_HIGH},128)" filter="url(#soften)"/>
    <!-- BOTTOM rim: G < 128 -> samples upward, inward from the bottom edge -->
    <rect x="0" y="${CANVAS - inset}" width="${CANVAS}" height="${RIM}" fill="rgb(128,${PEAK_LOW},128)" filter="url(#soften)"/>

    <!-- LEFT rim: R > 128 -> samples rightward, inward from the left edge -->
    <rect x="${-inset}" y="0" width="${RIM}" height="${CANVAS}" fill="rgb(${PEAK_HIGH},128,128)" filter="url(#soften)"/>
    <!-- RIGHT rim: R < 128 -> samples leftward, inward from the right edge -->
    <rect x="${CANVAS - inset}" y="0" width="${RIM}" height="${CANVAS}" fill="rgb(${PEAK_LOW},128,128)" filter="url(#soften)"/>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const EDGE_15_REFRACTION_MAP = createFrameRefractionMap()
