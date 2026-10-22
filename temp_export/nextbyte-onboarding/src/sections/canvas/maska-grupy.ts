import type { Pociagniecie } from './typy'

/**
 * Dzieli maskę na osobne zamalowane miejsca (dla Erasera): pociągnięcia, które się stykają albo leżą blisko siebie,
 * to jedno miejsce; oddzielone plamy to osobne. Model usuwa wtedy jedną rzecz na przebieg — przy kilku odległych
 * zaznaczeniach naraz zwykle ruszał tylko jedno. Gumka trafia do miejsc, które przecina (kolejność pociągnięć zostaje).
 *
 * Współrzędne pociągnięć to ułamki zdjęcia; `proporcja` = szerokość / wysokość zdjęcia (grubość pędzla jest ułamkiem szerokości).
 */
export function podzielMaske(kreski: Pociagniecie[], proporcja: number): Pociagniecie[][] {
  const luz = 0.015
  const ramka = (k: Pociagniecie) => {
    const r = k.srednica / 2 + luz
    const rx = r
    const ry = r * proporcja
    const xs = k.punkty.map(q => q[0])
    const ys = k.punkty.map(q => q[1])
    return { x0: Math.min(...xs) - rx, x1: Math.max(...xs) + rx, y0: Math.min(...ys) - ry, y1: Math.max(...ys) + ry }
  }
  const zachodza = (a: ReturnType<typeof ramka>, b: ReturnType<typeof ramka>) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
  const farba = kreski.filter(k => !k.gumka)
  const grupy: { ramka: ReturnType<typeof ramka>; idx: number[] }[] = []
  farba.forEach((k, i) => {
    const r = ramka(k)
    const pasujace = grupy.filter(g => zachodza(g.ramka, r))
    const zlaczona = pasujace.reduce(
      (s, g) => ({ x0: Math.min(s.x0, g.ramka.x0), x1: Math.max(s.x1, g.ramka.x1), y0: Math.min(s.y0, g.ramka.y0), y1: Math.max(s.y1, g.ramka.y1) }),
      r,
    )
    for (const g of pasujace) grupy.splice(grupy.indexOf(g), 1)
    grupy.push({ ramka: zlaczona, idx: [...pasujace.flatMap(g => g.idx), i] })
  })
  if (grupy.length <= 1) return [kreski]
  const wynik = grupy.map(g => {
    const zFarba = new Set(g.idx.map(i => farba[i]))
    // wszystkie pociągnięcia tej grupy plus gumki, które ją dotykają, w oryginalnej kolejności
    return kreski.filter(k => (k.gumka ? zachodza(ramka(k), g.ramka) : zFarba.has(k)))
  })
  // kolejność: od góry do dołu, od lewej do prawej
  return wynik.sort((a, b) => {
    const pa = a.find(k => !k.gumka)!.punkty[0]
    const pb = b.find(k => !k.gumka)!.punkty[0]
    return pa[1] - pb[1] || pa[0] - pb[0]
  })
}
