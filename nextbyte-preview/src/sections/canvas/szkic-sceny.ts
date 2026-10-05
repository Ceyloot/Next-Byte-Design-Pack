/**
 * Character swap „od zera”: model dostaje scenę wyłącznie jako mocno rozmyty SZKIC
 * kompozycji (układ, poza, rozkład barw i tonów), więc nie ma czego kopiować —
 * każdy szczegół (twarz, ciało, strój, tło) musi wygenerować sam.
 */
export const SZKIC_SCENY_SWAP = true

/** Rozmywa obraz do poziomu, w którym zostają tylko duże plamy i sylwetki. */
export async function rozmyjDoSzkicu(src: string, udzial = 0.012): Promise<string> {
  const img = await new Promise<HTMLImageElement>((ok, err) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => ok(i)
    i.onerror = () => err(new Error('szkic: nie wczytano obrazu'))
    i.src = src
  })
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d')
  if (!ctx) return src
  ctx.filter = `blur(${Math.max(6, Math.round(img.naturalWidth * udzial))}px)`
  ctx.drawImage(img, 0, 0)
  return c.toDataURL('image/jpeg', 0.9)
}
