/**
 * Dwie funkcje wspólne dla filtra i kontenera — wyjęte tutaj, bo po podziale
 * oryginalnego `index.tsx` na pliki obie strony ich potrzebują. Kod bez zmian,
 * dodane tylko `export`. Skąd pochodzi: patrz nagłówek `szklo-apple/index.tsx`.
 */
import { ShaderDisplacementGenerator, fragmentShaders } from "./generator-mapy"
import { displacementMap, polarDisplacementMap, prominentDisplacementMap } from "./mapy"

export // Generate shader-based displacement map using shaderUtils
const generateShaderDisplacementMap = (width: number, height: number): string => {
  const generator = new ShaderDisplacementGenerator({
    width,
    height,
    fragment: fragmentShaders.liquidGlass,
  })

  const dataUrl = generator.updateShader()
  generator.destroy()

  return dataUrl
}

export const getMap = (mode: "standard" | "polar" | "prominent" | "shader", shaderMapUrl?: string) => {
  switch (mode) {
    case "standard":
      return displacementMap
    case "polar":
      return polarDisplacementMap
    case "prominent":
      return prominentDisplacementMap
    case "shader":
      return shaderMapUrl || displacementMap
    default:
      throw new Error(`Invalid mode: ${mode}`)
  }
}
