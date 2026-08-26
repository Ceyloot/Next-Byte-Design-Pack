/**
 * LiquidGlass — iOS 26-style WebGL overlay.
 *
 * Architektura (kluczowa zmiana):
 *  • WebGL canvas = WYŁĄCZNIE efekty na krawędzi (rim) + top specular
 *  • Wewnątrz karty alpha = 0 → brak widocznego kwadratu
 *  • Specular siedzi przy górze szkła (jak odbicie światła sufitowego),
 *    przesuwa się tylko w osi X za myszą — to jest iOS 26
 *  • CSS nb-szklo obsługuje blur + przezroczystość ciała szkła
 *
 * Lazy init: WebGL tworzony przy pierwszym hover.
 */

import React, { useEffect, useRef, useCallback } from 'react'
import { Renderer, Program, Mesh, Geometry, type OGLRenderingContext } from 'ogl'
import { cn } from '@/lib/utils'

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uResolution;
uniform vec2  uMouse;     /* 0-1, y-flipped */
uniform float uTime;
uniform float uRadius;
uniform float uAlpha;

varying vec2 vUv;

/* Rounded-rect SDF, centred, aspect-corrected */
float sdRR(vec2 p, vec2 h, float r) {
  vec2 d = abs(p) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

void main() {
  float ar  = uResolution.x / uResolution.y;
  float px  = 1.0 / uResolution.y;
  vec2  uv  = vUv;

  vec2  p   = (uv - 0.5) * vec2(ar, 1.0);
  vec2  ph  = (vec2(0.5) - vec2(uRadius * px)) * vec2(ar, 1.0);
  float r   = uRadius * px;

  float dist   = sdRR(p, ph, r);
  float inside = 1.0 - smoothstep(-px, px, dist);
  if (inside < 0.001) { gl_FragColor = vec4(0.0); return; }

  /* ── STREFA KRAWĘDZI — jak daleko od bordera (w pikselach, ujemne = wewnątrz) ─ */
  float pxFromEdge = -dist / px;   /* >0 = wewnątrz, 0 = na krawędzi, <0 = poza */

  /* Efekty aktywne tylko przy krawędzi (do ~16 px wewnątrz) */
  float edgeZone = smoothstep(16.0, 0.0, pxFromEdge) * inside;
  float rimZone  = smoothstep( 3.0, 0.0, pxFromEdge) * inside;

  /* ── 1. RIM — trójwarstwowy grubi brzeg szkła ─────────────────────── */
  /* Zewnętrzna poświata (~4-5 px) */
  float outerGlow = smoothstep(5.0*px, 0.0, abs(dist + 2.5*px)) * inside;

  /* Główna linia bordera (≈1.5 px) */
  float solidRim  = smoothstep(1.8*px, 0.0, abs(dist)) * inside;

  /* Wewnętrzna jasna linia (1 px za borderem) */
  float innerLine = smoothstep(2.2*px, 0.0, abs(dist + 1.8*px))
                  * smoothstep(-4.0*px, 0.0, dist + 1.8*px) * inside;

  /* Chromatic aberration — RGB split tylko na krawędzi, nie tęcza */
  float dR = sdRR(p + vec2( 0.8*px, 0.0), ph, r);
  float dB = sdRR(p - vec2( 0.8*px, 0.0), ph, r);
  float rR = smoothstep(1.8*px, 0.0, abs(dR)) * inside;
  float rB = smoothstep(1.8*px, 0.0, abs(dB)) * inside;

  /* Ciepło/chłód zależnie od pozycji na obwodzie (góra=ciepłe, dół=zimne) */
  float wc = sin(atan(p.y, p.x) + 1.5707) * 0.5 + 0.5;
  vec3  chroma = vec3(mix(rB, rR, wc), solidRim, mix(rR, rB, wc));

  /* ── 2. TOP HIGHLIGHT — jasna linia u góry szkła ──────────────────── */
  /* Pozioma maska: pełna w centrum, zanika ku bokom */
  float topFade = 1.0 - smoothstep(0.0, 0.42, abs(uv.x - 0.5) * 2.0);
  /* 1-2px linia */
  float topLine = smoothstep(0.0, 1.8*px, uv.y)
                * smoothstep(3.5*px, 1.5*px, uv.y)
                * topFade * inside;
  /* Miękka poświata pod linią */
  float topGlow = smoothstep(0.0, 0.055, uv.y)
                * smoothstep(0.13, 0.04, uv.y)
                * topFade * inside;

  /* ── 3. SPECULAR — odbicie światła sufitowego, tylko GÓRA karty ──── */
  /* Środek speculara: górna część karty, X podąża za myszą */
  float specCX = (uMouse.x - 0.5) * ar * 0.4;          /* przesuń X ±20% za myszą */
  float specCY = ph.y * 0.55;                            /* zafixowany przy górze */
  vec2  specC  = vec2(specCX, specCY);

  float sDist  = length(p - specC);

  /* Dwa loby: wąski jasny + szeroki miękki */
  float sNarrow = exp(-sDist * sDist / 0.008) * 0.60;
  float sWide   = exp(-sDist * sDist / 0.09)  * 0.22;

  /* Specular aktywny TYLKO w górnej połowie karty i blisko krawędzi */
  float specTopMask = smoothstep(-ph.y * 0.1, ph.y * 0.6, p.y);  /* 0=dół 1=góra */
  float specEdgeFade = smoothstep(0.0, 0.25, edgeZone);            /* zanika przy krawędzi */
  float specMask = specTopMask * (1.0 - specEdgeFade) * inside;
  /* Dodaj też wąski specular na rimie */
  float rimSpec = (sNarrow * 0.4) * rimZone;

  /* ── COMPOSE — premultiplied alpha ───────────────────────────────── */
  vec3  col   = vec3(0.0);
  float alpha = 0.0;

  /* Outer glow */
  col   += vec3(1.0) * outerGlow * 0.10;   alpha += outerGlow * 0.07;
  /* Chroma rim */
  col   += chroma    * 0.85;                alpha += (rR + solidRim + rB)/3.0 * 0.65;
  /* Inner line */
  col   += vec3(1.0) * innerLine * 0.78;   alpha += innerLine * 0.48;
  /* Top line */
  col   += vec3(1.0) * topLine   * 0.95;   alpha += topLine   * 0.82;
  /* Top glow */
  col   += vec3(1.0) * topGlow   * 0.45;   alpha += topGlow   * 0.24;
  /* Specular (góra) */
  col   += vec3(1.0) * (sNarrow + sWide) * specMask;
  alpha += (sNarrow * 0.58 + sWide * 0.20) * specMask;
  /* Rim specular */
  col   += vec3(1.0) * rimSpec;             alpha += rimSpec * 0.55;

  alpha *= uAlpha;
  col    = min(col, vec3(1.0));
  gl_FragColor = vec4(col * alpha, alpha);
}
`

/* Odczyt --primary HSL → linear RGB */
function readPrimaryRGB(el: HTMLElement): [number, number, number] {
  const raw   = getComputedStyle(el).getPropertyValue('--primary').trim()
  const parts = raw.split(/\s+/).map(parseFloat)
  if (parts.length === 3) {
    const [h, s, l] = [parts[0]/360, parts[1]/100, parts[2]/100]
    const q  = l < 0.5 ? l*(1+s) : l+s-l*s
    const p2 = 2*l-q
    const hue = (pp: number, qq: number, t: number) => {
      if (t<0) t+=1; if (t>1) t-=1
      if (t<1/6) return pp+(qq-pp)*6*t
      if (t<1/2) return qq
      if (t<2/3) return pp+(qq-pp)*(2/3-t)*6
      return pp
    }
    return [hue(p2,q,h+1/3), hue(p2,q,h), hue(p2,q,h-1/3)]
  }
  return [0.8, 0.9, 1.0]
}

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?:    number
  intensity?: number
  children?:  React.ReactNode
}

export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  function LiquidGlass({ radius = 16, intensity = 1, className, children, ...rest }, ref) {
    const wrapRef    = useRef<HTMLDivElement>(null)
    const canvasRef  = useRef<HTMLCanvasElement>(null)
    const glRef      = useRef<OGLRenderingContext | null>(null)
    const programRef = useRef<InstanceType<typeof Program> | null>(null)
    const meshRef    = useRef<InstanceType<typeof Mesh> | null>(null)
    const rendRef    = useRef<InstanceType<typeof Renderer> | null>(null)
    const rafRef     = useRef<number>(0)
    const mouseRef   = useRef({ x: 0.5, y: 0.5 })
    const tRef       = useRef(0)
    const alphaRef   = useRef(0)
    const activeRef  = useRef(false)

    const setWrapRef = useCallback((el: HTMLDivElement | null) => {
      ;(wrapRef as React.MutableRefObject<typeof el>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<typeof el>).current = el
    }, [ref])

    useEffect(() => {
      const wrap   = wrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return

      const initGL = () => {
        if (rendRef.current) return
        const renderer = new Renderer({
          canvas, alpha: true, premultipliedAlpha: false,
          antialias: false, dpr: Math.min(window.devicePixelRatio, 2),
        })
        rendRef.current = renderer
        const gl = renderer.gl
        glRef.current   = gl
        gl.clearColor(0, 0, 0, 0)

        const geo = new Geometry(gl, {
          position: { size: 2, data: new Float32Array([-1,-1,3,-1,-1,3]) },
          uv:       { size: 2, data: new Float32Array([0,0,2,0,0,2])    },
        })
        const prog = new Program(gl, {
          vertex: VERT, fragment: FRAG,
          uniforms: {
            uResolution: { value: [canvas.offsetWidth, canvas.offsetHeight] },
            uMouse:      { value: [0.5, 0.5] },
            uTime:       { value: 0 },
            uRadius:     { value: radius },
            uAlpha:      { value: 0 },
          },
          transparent: true, depthTest: false, depthWrite: false,
        })
        programRef.current = prog
        meshRef.current    = new Mesh(gl, { geometry: geo, program: prog })
      }

      const ro = new ResizeObserver(() => {
        const w = wrap.offsetWidth, h = wrap.offsetHeight
        if (rendRef.current) {
          rendRef.current.setSize(w, h)
          programRef.current!.uniforms.uResolution.value = [w, h]
        }
      })
      ro.observe(wrap)

      const animate = () => {
        if (!rendRef.current || !programRef.current || !meshRef.current) return
        rafRef.current = requestAnimationFrame(animate)

        const target = activeRef.current ? intensity : 0
        alphaRef.current += (target - alphaRef.current) * 0.12
        if (!activeRef.current && alphaRef.current < 0.004) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
          programRef.current.uniforms.uAlpha.value = 0
          rendRef.current.gl.clear(rendRef.current.gl.COLOR_BUFFER_BIT)
          return
        }

        tRef.current += 0.016
        const u = programRef.current.uniforms
        u.uTime.value   = tRef.current
        u.uMouse.value  = [mouseRef.current.x, mouseRef.current.y]
        u.uAlpha.value  = alphaRef.current
        rendRef.current.gl.clear(rendRef.current.gl.COLOR_BUFFER_BIT)
        rendRef.current.render({ scene: meshRef.current })
      }

      const onEnter = () => {
        initGL()
        if (rendRef.current) {
          rendRef.current.setSize(wrap.offsetWidth, wrap.offsetHeight)
          programRef.current!.uniforms.uResolution.value = [wrap.offsetWidth, wrap.offsetHeight]
        }
        activeRef.current = true
        if (!rafRef.current) animate()
      }
      const onMove  = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect()
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: 1 - (e.clientY - rect.top) / rect.height,
        }
      }
      const onLeave = () => {
        activeRef.current = false
        mouseRef.current  = { x: 0.5, y: 0.8 }
      }

      wrap.addEventListener('mouseenter', onEnter)
      wrap.addEventListener('mousemove',  onMove)
      wrap.addEventListener('mouseleave', onLeave)

      return () => {
        cancelAnimationFrame(rafRef.current)
        ro.disconnect()
        wrap.removeEventListener('mouseenter', onEnter)
        wrap.removeEventListener('mousemove',  onMove)
        wrap.removeEventListener('mouseleave', onLeave)
        glRef.current?.getExtension('WEBGL_lose_context')?.loseContext()
        rendRef.current    = null
        programRef.current = null
        meshRef.current    = null
        glRef.current      = null
      }
    }, [radius, intensity])

    return (
      <div ref={setWrapRef} className={cn('relative', className)} {...rest}>
        {children}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 10, borderRadius: radius }}
        />
      </div>
    )
  },
)
