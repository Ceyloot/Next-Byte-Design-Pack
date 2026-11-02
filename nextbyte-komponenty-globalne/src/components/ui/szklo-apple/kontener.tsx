/**
 * ════════════════════════════════════════════════════════════════════════
 *  KONTENER SZKŁA — kopia `rdev/liquid-glass-react` wewnątrz naszej biblioteki
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

import { type CSSProperties, forwardRef, useId, type ReactNode, type RefObject, useState, useEffect } from "react"
import { GlassFilter } from "./filtr"
import { generateShaderDisplacementMap } from "./pomocnicze"

export const GlassContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
    displacementScale?: number
    blurAmount?: number
    saturation?: number
    aberrationIntensity?: number
    mouseOffset?: { x: number; y: number }
    onMouseLeave?: () => void
    onMouseEnter?: () => void
    onMouseDown?: () => void
    onMouseUp?: () => void
    active?: boolean
    overLight?: boolean
    cornerRadius?: number
    padding?: string
    glassSize?: { width: number; height: number }
    onClick?: () => void
    mode?: "standard" | "polar" | "prominent" | "shader"
  }>
>(
  (
    {
      children,
      className = "",
      style,
      displacementScale = 25,
      blurAmount = 12,
      saturation = 180,
      aberrationIntensity = 2,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      active = false,
      overLight = false,
      cornerRadius = 999,
      padding = "24px 32px",
      glassSize = { width: 270, height: 69 },
      onClick,
      mode = "standard",
    },
    ref,
  ) => {
    const filterId = useId()
    const [shaderMapUrl, setShaderMapUrl] = useState<string>("")

    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox")

    // Generate shader displacement map when in shader mode
    useEffect(() => {
      if (mode === "shader") {
        const url = generateShaderDisplacementMap(glassSize.width, glassSize.height)
        setShaderMapUrl(url)
      }
    }, [mode, glassSize.width, glassSize.height])

    const backdropStyle = {
      filter: isFirefox ? null : `url(#${filterId})`,
      backdropFilter: `blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%)`,
    }

    return (
      <div ref={ref} className={`relative ${className} ${active ? "active" : ""} ${Boolean(onClick) ? "cursor-pointer" : ""}`} style={style} onClick={onClick}>
        <GlassFilter mode={mode} id={filterId} displacementScale={displacementScale} aberrationIntensity={aberrationIntensity} width={glassSize.width} height={glassSize.height} shaderMapUrl={shaderMapUrl} />

        <div
          className="glass"
          style={{
            borderRadius: `${cornerRadius}px`,
            position: "relative",
            /* DRUGA ZMIANA WOBEC ORYGINAŁU: `inline-flex` przy zadanej szerokości.
               Oryginał trzyma `inline-flex` zawsze, więc szyba ma szerokość
               SWOJEJ TREŚCI — a filtr liczy się z wymiarów elementu zewnętrznego,
               na którym siedzi `ref`. Gdy ktoś nada szerokość z zewnątrz
               (`style={{ width: '100%' }}`), oba rozjeżdżają się i szkło urywa
               się w połowie. Zmierzone w podglądzie biblioteki: wrapper 563 px,
               szyba 339 px, filtr wygenerowany dla 563.
               Przy zadanej szerokości przechodzimy na `flex`, żeby szyba
               wypełniła to, co dostała. */
            display: (style as { width?: string | number } | undefined)?.width ? "flex" : "inline-flex",
            alignItems: "center",
            gap: "24px",
            padding,
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            boxShadow: overLight ? "0px 16px 70px rgba(0, 0, 0, 0.75)" : "0px 12px 40px rgba(0, 0, 0, 0.25)",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {/* backdrop layer that gets wiggly */}
          <span
            className="glass__warp"
            style={
              {
                ...backdropStyle,
                position: "absolute",
                inset: "0",
                /* TRZECIA ZMIANA WOBEC ORYGINAŁU. Oryginał zostawia tę warstwę
                   bez promienia i liczy, że przytnie ją rodzic (`overflow:
                   hidden` + `borderRadius` wyżej). Chromium tego nie robi, gdy
                   element ma naraz `filter: url(…)` i `backdrop-filter` —
                   prostokąt rozmycia wystaje poza zaokrąglenie. Zmierzone
                   u nas testem trafienia: punkt (3,3) od narożnika, daleko
                   poza łukiem 50 px, wciąż trafiał w `.glass__warp`.
                   Własny promień zamyka region rozmycia w tym samym kształcie,
                   który rodzic i tak wymusza — niczego nie zmienia tam, gdzie
                   przycinanie działa. */
                borderRadius: `${cornerRadius}px`,
              } as CSSProperties
            }
          />

          {/* user content stays sharp */}
          <div
            className="transition-all duration-150 ease-in-out text-white"
            style={{
              position: "relative",
              zIndex: 1,
              font: "500 20px/1 system-ui",
              textShadow: overLight ? "0px 2px 12px rgba(0, 0, 0, 0)" : "0px 2px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  },
)

GlassContainer.displayName = "GlassContainer"

export interface LiquidGlassProps {
  children: React.ReactNode
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  elasticity?: number
  cornerRadius?: number
  globalMousePos?: { x: number; y: number }
  mouseOffset?: { x: number; y: number }
  mouseContainer?: React.RefObject<HTMLElement | null> | null
  className?: string
  padding?: string
  style?: React.CSSProperties
  overLight?: boolean
  mode?: "standard" | "polar" | "prominent" | "shader"
  onClick?: () => void
}
