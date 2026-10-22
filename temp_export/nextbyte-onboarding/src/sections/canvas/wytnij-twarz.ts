/**
 * Zbliżenie twarzy: wycina z obrazu prostokąt [ymin, xmin, ymax, xmax] (0–1000) z marginesem
 * i skaluje go tak, by dłuższy bok miał `bok` px. Zwraca data URI albo null.
 */
export function wytnijZblizenieTwarzy(src: string, box: [number, number, number, number], margines = 0.35, bok = 768): Promise<string | null> {
  return new Promise(resolve => {
    const obraz = new Image()
    obraz.onload = () => {
      try {
        const W = obraz.naturalWidth
        const H = obraz.naturalHeight
        let [y0, x0, y1, x1] = box.map(v => Math.min(1000, Math.max(0, v)) / 1000)
        const dw = (x1 - x0) * margines
        const dh = (y1 - y0) * margines
        x0 = Math.max(0, x0 - dw)
        x1 = Math.min(1, x1 + dw)
        y0 = Math.max(0, y0 - dh)
        y1 = Math.min(1, y1 + dh)
        const sw = Math.round((x1 - x0) * W)
        const sh = Math.round((y1 - y0) * H)
        if (sw < 24 || sh < 24) return resolve(null)
        const skala = bok / Math.max(sw, sh)
        const c = document.createElement('canvas')
        c.width = Math.round(sw * skala)
        c.height = Math.round(sh * skala)
        const g = c.getContext('2d')
        if (!g) return resolve(null)
        g.drawImage(obraz, Math.round(x0 * W), Math.round(y0 * H), sw, sh, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.95))
      } catch {
        resolve(null)
      }
    }
    obraz.onerror = () => resolve(null)
    obraz.src = src
  })
}
