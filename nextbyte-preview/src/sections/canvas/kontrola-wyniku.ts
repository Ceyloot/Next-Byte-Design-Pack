/**
 * Czy nakładka z zaznaczeniem przeszła do wyniku — liczone na pikselach,
 * bez modelu językowego (wzorzec kontroli jakości z pipeline'u Lovart).
 *
 * Model obrazu dostaje płótno z magentowym prostokątem i ma go zastąpić
 * treścią sceny. Kiedy tego nie zrobi, różowa plama zostaje w wyniku —
 * a to widać w liczbach szybciej i pewniej niż w ocenie modelu.
 *
 * Liczymy tylko wewnątrz zaznaczonych obszarów i odejmujemy to, co było
 * tam w oryginale: zachód słońca czy różowe kwiaty same z siebie mają
 * piksele bliskie magenty i bez tego porównania dawałyby fałszywy alarm.
 */
import type { Prostokat } from './rezyser'

/** Magenta i czerwień nakładki, także po zmieszaniu 55% ze sceną. */
function czyNakladka(r: number, g: number, b: number): boolean {
  const magenta = r > 180 && b > 150 && g < 110 && Math.abs(r - b) < 90
  const czerwien = r > 200 && g < 70 && b < 70
  return magenta || czerwien
}

function wczytaj(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const obrazek = new Image()
    obrazek.crossOrigin = 'anonymous'
    obrazek.onload = () => resolve(obrazek)
    obrazek.onerror = () => resolve(null)
    obrazek.src = src
  })
}

/** Udział pikseli „nakładkowych” w obszarach, 0–1. `null`, gdy obrazu nie da się odczytać. */
async function udzialNakladki(src: string, obszary: Prostokat[]): Promise<number | null> {
  const obrazek = await wczytaj(src)
  if (!obrazek) return null

  const bok = 512
  const skala = Math.min(1, bok / Math.max(obrazek.width, obrazek.height))
  const szer = Math.max(1, Math.round(obrazek.width * skala))
  const wys = Math.max(1, Math.round(obrazek.height * skala))
  const plotno = document.createElement('canvas')
  plotno.width = szer
  plotno.height = wys
  const g = plotno.getContext('2d', { willReadFrequently: true })
  if (!g) return null
  g.drawImage(obrazek, 0, 0, szer, wys)

  let trafione = 0
  let wszystkie = 0
  try {
    for (const r of obszary) {
      const x = Math.floor(r.x0 * szer)
      const y = Math.floor(r.y0 * wys)
      const w = Math.max(1, Math.ceil((r.x1 - r.x0) * szer))
      const h = Math.max(1, Math.ceil((r.y1 - r.y0) * wys))
      const { data } = g.getImageData(x, y, w, h)
      for (let i = 0; i < data.length; i += 4) {
        wszystkie++
        if (czyNakladka(data[i], data[i + 1], data[i + 2])) trafione++
      }
    }
  } catch {
    // Obraz z innej domeny bez CORS — nie da się odczytać pikseli.
    return null
  }
  return wszystkie > 0 ? trafione / wszystkie : 0
}

/**
 * Czy w wyniku zostały ślady nakładki. Próg 3% ponad oryginał — pojedyncze
 * różowe piksele na krawędzi to jeszcze nie „wypalona ramka”.
 */
export async function wykryjNakladke(
  wynikSrc: string,
  oryginalSrc: string,
  obszary: Prostokat[],
): Promise<{ wykryto: boolean; udzial: number } | null> {
  if (obszary.length === 0) return null
  const [wynik, oryginal] = await Promise.all([
    udzialNakladki(wynikSrc, obszary),
    udzialNakladki(oryginalSrc, obszary),
  ])
  if (wynik === null || oryginal === null) return null
  const nadmiar = Math.max(0, wynik - oryginal)
  return { wykryto: nadmiar > 0.03, udzial: nadmiar }
}
