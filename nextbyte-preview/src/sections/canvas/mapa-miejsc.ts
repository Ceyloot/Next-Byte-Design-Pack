/**
 * Mapa miejsc — kopia zdjęcia z naniesionymi numerami pinesek.
 *
 * Powód istnienia: słowny opis położenia („na dole po lewej”) nie wystarcza.
 * Model potrafi wykonać zadanie i umieścić obiekt zupełnie gdzie indziej, bo
 * z opisu nie da się odczytać punktu — a pineska istnieje właśnie po to, żeby
 * wskazać punkt.
 *
 * Dlatego obok czystego zdjęcia idzie jego kopia z wypalonymi znacznikami.
 * To ta sama metoda, którą stosuje Lovart: obraz roboczy z nakładką plus
 * czysty oryginał. Mapa jest instrukcją, nie materiałem — prompt mówi wprost,
 * że nie wchodzi do wyniku.
 */
import { etykietaPineski, type Pineska, type Warstwa } from './typy'
import type { Prostokat } from './rezyser'

/** Ile pikseli ma dłuższy bok mapy. Mniejsza niż oryginał — to tylko wskazówka. */
const BOK = 1024

/**
 * Rysuje kopię warstwy z numerowanymi znacznikami w miejscach pinesek.
 *
 * Znacznik to celownik, nie wypełnione koło: pełna plama zasłoniłaby to, na
 * co wskazuje, a model musi widzieć, co jest pod spodem. Kontrastowa obwódka
 * trzyma czytelność zarówno na jasnym niebie, jak i na ciemnej zieleni.
 */
export function narysujMapeMiejsc(warstwa: Warstwa, pineski: Pineska[]): Promise<string> {
  const moje = pineski.filter(p => p.layerId === warstwa.id)
  if (moje.length === 0) return Promise.resolve('')

  return new Promise(resolve => {
    const obrazek = new Image()
    obrazek.crossOrigin = 'anonymous'

    obrazek.onload = () => {
      const skala = BOK / Math.max(obrazek.width, obrazek.height)
      const szer = Math.round(obrazek.width * skala)
      const wys = Math.round(obrazek.height * skala)

      const plotno = document.createElement('canvas')
      plotno.width = szer
      plotno.height = wys
      const g = plotno.getContext('2d')
      if (!g) return resolve('')

      g.drawImage(obrazek, 0, 0, szer, wys)

      // Promień zależny od kadru, nie stały — na dużym zdjęciu stały znacznik
      // byłby plamką, na małym zakryłby pół sceny.
      const promien = Math.max(14, Math.round(Math.min(szer, wys) * 0.035))

      for (const p of moje) {
        const x = p.normalizedX * szer
        const y = p.normalizedY * wys
        const numer = pineski.indexOf(p) + 1

        // Celownik: krzyż wskazujący dokładny punkt, okrąg wokół niego.
        //
        // Kolor jest magenta, a nie biały, z jednego powodu: pierwsza wersja
        // rysowała biało-czarny celownik i model wypalał go w wynik jako
        // element sceny (sprawdzone generacją — ławka stanęła w dobrym
        // miejscu, ale z celownikiem na oparciu). Magenta nie występuje
        // w fotografii naturalnej, więc czyta się jako nakładka, a prompt
        // może kazać zastąpić „wszystkie różowe piksele” treścią sceny.
        g.lineWidth = Math.max(4, promien * 0.2)
        g.strokeStyle = 'rgba(0,0,0,0.75)'
        const krzyz = () => {
          g.beginPath()
          g.arc(x, y, promien, 0, Math.PI * 2)
          g.moveTo(x - promien * 1.5, y)
          g.lineTo(x - promien * 0.4, y)
          g.moveTo(x + promien * 0.4, y)
          g.lineTo(x + promien * 1.5, y)
          g.moveTo(x, y - promien * 1.5)
          g.lineTo(x, y - promien * 0.4)
          g.moveTo(x, y + promien * 0.4)
          g.lineTo(x, y + promien * 1.5)
          g.stroke()
        }
        krzyz()
        g.lineWidth = Math.max(2, promien * 0.12)
        g.strokeStyle = '#ff00ff'
        krzyz()

        // Numer w tarczy obok celownika, żeby nie zasłaniał wskazanego punktu.
        const etykietaX = x + promien * 1.9
        const etykietaY = y - promien * 1.2
        const r = promien * 0.85
        g.beginPath()
        g.arc(etykietaX, etykietaY, r, 0, Math.PI * 2)
        g.fillStyle = '#ff00ff'
        g.fill()
        g.lineWidth = Math.max(2, r * 0.16)
        g.strokeStyle = 'rgba(0,0,0,0.75)'
        g.stroke()

        g.fillStyle = '#ffffff'
        g.font = `bold ${Math.round(r * 1.25)}px sans-serif`
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.fillText(String(numer), etykietaX, etykietaY)
      }

      resolve(plotno.toDataURL('image/jpeg', 0.92))
    }

    obrazek.onerror = () => resolve('')
    obrazek.src = warstwa.src
  })
}

/** Opis mapy dla promptu — numery uchwytów, które są na niej zaznaczone. */
export function opiszMape(warstwa: Warstwa | null | undefined, pineski: Pineska[] = []): string {
  if (!warstwa || !Array.isArray(pineski) || pineski.length === 0) return ''
  const moje = pineski.filter(p => p && p.layerId === warstwa.id)
  return moje
    .map(p => `${pineski.indexOf(p) + 1} = „${etykietaPineski(p, pineski.indexOf(p) + 1)}”`)
    .join(', ')
}

/** Dłuższy bok kopii z obszarami — model obrazu i tak skaluje wejście. */
const BOK_OBSZAROW = 1536

/**
 * Kopia płótna z zaznaczonymi obszarami — wejście dla modelu obrazu
 * (wzorzec Lovart: płótno z półprzezroczystą nakładką + czyste płótno obok).
 *
 * Obszar mówi modelowi nie tylko GDZIE, ale też JAK DUŻE — pineska tego nie
 * umiała i stąd auto wielkości foki. Magenta = miejsce zmiany, czerwień =
 * miejsce, z którego obiekt odchodzi (przeniesienie w kadrze).
 *
 * Wypełnienie 55%, nie 80% jak u Lovarta: przy usuwaniu i podmianie model
 * musi widzieć przez nakładkę, co jest pod spodem. Pełna ramka na brzegu
 * trzyma granicę obszaru czytelną mimo słabszego wypełnienia.
 */
export function narysujObszary(warstwa: Warstwa, cel?: Prostokat, zrodlo?: Prostokat): Promise<string> {
  if (!cel && !zrodlo) return Promise.resolve('')

  return new Promise(resolve => {
    const obrazek = new Image()
    obrazek.crossOrigin = 'anonymous'
    obrazek.onload = () => {
      const skala = Math.min(1, BOK_OBSZAROW / Math.max(obrazek.width, obrazek.height))
      const szer = Math.round(obrazek.width * skala)
      const wys = Math.round(obrazek.height * skala)

      const plotno = document.createElement('canvas')
      plotno.width = szer
      plotno.height = wys
      const g = plotno.getContext('2d')
      if (!g) return resolve('')
      g.drawImage(obrazek, 0, 0, szer, wys)

      const obszar = (r: Prostokat, rgb: string) => {
        const x = r.x0 * szer
        const y = r.y0 * wys
        const w = (r.x1 - r.x0) * szer
        const h = (r.y1 - r.y0) * wys
        g.fillStyle = `rgba(${rgb}, 0.55)`
        g.fillRect(x, y, w, h)
        g.lineWidth = Math.max(3, Math.round(Math.min(szer, wys) * 0.004))
        g.strokeStyle = `rgb(${rgb})`
        g.strokeRect(x, y, w, h)
      }
      if (zrodlo) obszar(zrodlo, '255, 0, 0')
      if (cel) obszar(cel, '255, 0, 255')

      resolve(plotno.toDataURL('image/jpeg', 0.92))
    }
    obrazek.onerror = () => resolve('')
    obrazek.src = warstwa.src
  })
}
