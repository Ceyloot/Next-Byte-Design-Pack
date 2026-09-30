/**
 * Mała magentowa kropka w miejscu pineski — na kopii zdjęcia wysyłanej do
 * modelu obrazu. Kropka + jej współrzędne w prompcie (`PIN MAP`) to jedno
 * wskazanie miejsca; kontrakt wyniku każe ją usunąć z obrazu.
 */
export interface PunktKropki {
  /** 0–1 od lewej krawędzi */
  x: number
  /** 0–1 od górnej krawędzi */
  y: number
}

/** Promień kropki: mały, ale widoczny w każdej rozdzielczości. */
export function promienKropki(szer: number, wys: number): number {
  return Math.max(4, Math.round(Math.min(szer, wys) * 0.007))
}

/** Zwraca kopię obrazu z kropkami (data URI, pełna rozdzielczość). Przy błędzie — obraz bez zmian. */
export function narysujKropki(src: string, punkty: PunktKropki[], pierscien = false): Promise<string> {
  if (!punkty.length) return Promise.resolve(src)
  return new Promise(resolve => {
    const obraz = new Image()
    obraz.crossOrigin = 'anonymous'
    obraz.onload = () => {
      try {
        const plotno = document.createElement('canvas')
        plotno.width = obraz.naturalWidth
        plotno.height = obraz.naturalHeight
        const g = plotno.getContext('2d')
        if (!g) return resolve(src)
        g.drawImage(obraz, 0, 0)
        const r = promienKropki(plotno.width, plotno.height)
        for (const p of punkty) {
          const cx = p.x * plotno.width
          const cy = p.y * plotno.height
          if (pierscien) {
            // wyraźne kółko + kropka — tylko na mapie pozycji, nie na scenie
            const R = r * 6
            g.lineWidth = Math.max(3, r * 0.9)
            g.strokeStyle = '#FF00FF'
            g.beginPath()
            g.arc(cx, cy, R, 0, Math.PI * 2)
            g.stroke()
          }
          g.beginPath()
          g.arc(cx, cy, r * (pierscien ? 1.5 : 1), 0, Math.PI * 2)
          g.fillStyle = '#FF00FF'
          g.fill()
        }
        resolve(plotno.toDataURL('image/jpeg', 0.95))
      } catch {
        resolve(src)
      }
    }
    obraz.onerror = () => resolve(src)
    obraz.src = src
  })
}
