import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  Hand,
  Image as IkonaObrazu,
  Layers,
  Link2,
  Lock,
  Pin,
  Maximize,
  MousePointer2,
  Sparkles,
  Square,
  Trash2,
  Unlock,
  Upload,
  Wand2,
  ZoomIn,
  Sun,
  Aperture,
  Eraser,
  Film,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KartaPineski } from '@/sections/canvas/KartaPineski'
import { PRZESUNIECIE_LEBKA } from '@/sections/canvas/ZnacznikPineski'
import { CzatCanvas } from '@/sections/canvas/CzatCanvas'
import {
  generuj,
  nazwijWynik,
  opiszZmiane,
  rozpoznajObiekt,
  opiszObiektSzczegolowo,
  opiszOsobeSzczegolowo,
  rozpoznajScene,
  sprawdzWynik,
  zmierzObiekt,
  klasyfikujPineski,
  zaplanuj,
} from '@/sections/canvas/dostawca'
import { Plotno } from '@/sections/canvas/Plotno'
import {
  INTENCJE,
  OPERACJE_POSTACI,
  idZrodelNaPlotnie,
  operacjaZIntencji,
  wykryjIntencje,
  zbudujPolecenie,
  zbudujZadanieModelu,
} from '@/sections/canvas/polecenia'
import { SYSTEM_POPRAWKI, promptPoprawki } from '@/sections/canvas/prompty/operacje/character-swap-studio'
import { narysujMapeMiejsc, narysujObszary } from '@/sections/canvas/mapa-miejsc'
import { narysujKropki } from './canvas/kropki'
import { wytnijZblizenieTwarzy } from './canvas/wytnij-twarz'
import { zbudujZblizenia, type Zblizenie } from './canvas/zblizenia'
import { wczytajZPamieci, zapiszWPamieci } from './canvas/pamiec'
import { porownanieZKotwica, rozmiarZPomiaru } from './canvas/rezyser'
import { policzWycinek, wytnijWycinek, zlozWycinek } from './canvas/zloz-wycinek'
import { dopasujZiarno } from '@/sections/canvas/dopasuj-ziarno'
import { czyBezZmian, wykryjNakladke } from '@/sections/canvas/kontrola-wyniku'
import type { Prostokat } from '@/sections/canvas/rezyser'
import { ustalUklad, type Uklad } from '@/sections/canvas/uklad-pinesek'
import { odciskPinesek, roleZPolecenia, type OpcjaRol } from '@/sections/canvas/role-z-polecenia'
import { sprawdzPolecenie } from '@/sections/canvas/kontrola-polecenia'
import type { ObrazDlaAgenta } from '@/sections/canvas/agent-proxy'
import {
  etykietaPineski,
  kolejnoscObrazow,
  konwertujNaDataUrl,
  dopasujFormatDoObrazu,
  nowyId,
  pozycjaPineski,
  wczytajProjekt,
  wytnijOkolice,
  zmniejszDoAnalizy,
  type Narzedzie,
  type Pineska,
  type Warstwa,
  type Widok,
  type StanGeneracji,
  type ZrodloObrazu,
  type RamkaObszaru,
} from '@/sections/canvas/typy'


/**
 * Canvas — profesjonalna kanwa generatywna (Nano-Banana & Lovart Engine).
 *
 * Pasek narzędzi po lewym boku, pływający chat w stylu Liquid Glass (Dashboard 2.0)
 * po prawej stronie, do 10 precyzyjnych pinesek z automatycznym rozpoznawaniem obiektów,
 * obsługa natychmiastowego Object Transfer oraz Object Switch z Clean Plate.
 */

/**
 * WYŁĄCZONE: wynik ma być w całości wygenerowanym przez model zdjęciem (od zera),
 * a nie wycinkiem sklejonym z oryginałem maską. Kod wycinka zostaje uśpiony.
 */
const GENERUJ_NA_WYCINKU = false
/** WYŁĄCZONE: żadnej obróbki pikseli po generacji poza dopasowaniem formatu. */
const POSTPROCES_ZIARNA = false
/**
 * WYŁĄCZONE: automatyczny drugi strzał do modelu (korekta rozmiaru/pozycji i polish pass).
 * Jedno „Generuj” = jedna generacja; pomiar zostaje tylko w ocenie.
 */
const DRUGI_PRZEBIEG = false
/** Inteligentne zbliżenia w pobliżu pinesek jako dodatkowe obrazy dla modelu (wszystkie tryby). false = szybkie cofnięcie. */
const ZBLIZENIA_W_POBLIZU_PINEZKI = true
/** WYŁĄCZONE: magentowe kropki na zdjęciach — miejsce wskazują same współrzędne. */
const KROPKI_NA_ZDJECIACH = false

const KLUCZ_ZAPISU = 'nb-canvas-projekt-v2'

interface Projekt {
  warstwy: Warstwa[]
  pineski: Pineska[]
  tekst: string
  ramka?: RamkaObszaru | null
}

/**
 * Obszar kontrolny wokół pineski docelowej (do oceny wyniku). Rozmiar bierze ze zmierzonego przez reżysera
 * udziału obiektu w kadrze (kotwice o znanym rozmiarze + perspektywa) — nie z klas obiektów ani list słów.
 * Bez pomiaru: obszar zasugerowany przez reżysera, ograniczony ogólnym priorytetem perspektywy
 * (im wyżej w kadrze, tym mniejszy obiekt).
 */
function skalibrujObszarPineski(
  sugerowany: Prostokat | undefined,
  pinDocelowy: Pineska | undefined,
  rozmiar?: { szer: number; wys: number },
): Prostokat | undefined {
  if (!pinDocelowy) return sugerowany

  const px = pinDocelowy.normalizedX
  const py = pinDocelowy.normalizedY

  let w: number
  let h: number
  if (rozmiar) {
    // zmierzony rozmiar (% kadru) — wiarygodniejszy niż jakakolwiek stała
    w = rozmiar.szer / 100
    h = rozmiar.wys / 100
  } else {
    w = sugerowany ? sugerowany.x1 - sugerowany.x0 : 0.12
    h = sugerowany ? sugerowany.y1 - sugerowany.y0 : 0.06
    const wspGlebi = Math.max(0.4, Math.min(1.15, py * 1.25))
    w = Math.min(w, 0.18 * wspGlebi)
    h = Math.min(h, 0.12 * wspGlebi)
  }
  w = Math.max(0.015, Math.min(0.5, w))
  h = Math.max(0.015, Math.min(0.5, h))

  // ZAWSZE kotwiczymy horyzontalnie na px (środek obiektu)
  // i wertykalnie na py (styk z gruntem):
  const x0 = Math.max(0.005, Math.min(0.995 - w, px - w / 2))
  const y1 = Math.min(0.995, Math.max(0.005 + h, py + h * 0.08)) // lekki margines na cień pod spodem
  const y0 = Math.max(0.005, y1 - h)
  const x1 = Math.min(0.995, x0 + w)

  return { x0, y0, x1, y1 }
}

export function CanvasSection() {
  const [projekt, setProjekt] = useState<Projekt>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      if (zapisany) {
        const wczytany = wczytajProjekt(JSON.parse(zapisany))
        if (wczytany.warstwy.length > 0) return wczytany
      }
    } catch {
      /* uszkodzony zapis — startujemy od pustego płótna */
    }
    return { warstwy: [], pineski: [], tekst: '', ramka: null }
  })

  const [narzedzie, setNarzedzie] = useState<Narzedzie>('wybor')
  const [wybranaWarstwa, setWybranaWarstwa] = useState<string | null>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      if (zapisany) {
        const wczytany = wczytajProjekt(JSON.parse(zapisany))
        if (wczytany.warstwy.length > 0) return wczytany.warstwy[0].id
      }
    } catch {}
    return null
  })
  const [wybranaPineska, setWybranaPineska] = useState<string | null>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      if (zapisany) {
        const wczytany = wczytajProjekt(JSON.parse(zapisany))
        if (wczytany.pineski.length > 0) return wczytany.pineski[0].id
      }
    } catch {}
    return null
  })
  const [widok, setWidok] = useState<Widok>({ x: 50, y: 60, zoom: 0.72 })
  const [menuDodawania, setMenuDodawania] = useState(false)
  const [stanGeneracji, setStanGeneracji] = useState<StanGeneracji>({ faza: 'bezczynny' })
  const [ostatniPrompt, setOstatniPrompt] = useState<string | null>(null)
  const [panelWarstw, setPanelWarstw] = useState(false)
  const refPlik = useRef<HTMLInputElement>(null)
  const refRoot = useRef<HTMLDivElement>(null)
  const [rozmiar, setRozmiar] = useState({ szer: 0, wys: 0 })

  useEffect(() => {
    const el = refRoot.current
    if (!el) return
    const obserwator = new ResizeObserver(([wpis]) => {
      setRozmiar({ szer: wpis.contentRect.width, wys: wpis.contentRect.height })
    })
    obserwator.observe(el)
    return () => obserwator.disconnect()
  }, [])

  // Zdjęcia zapisujemy w IndexedDB (localStorage mieści ~5 MB i gubił projekt).
  // Do zakończenia odczytu nic nie zapisujemy — pusty stan startowy nie może
  // nadpisać zapisanego projektu.
  const [odczytano, setOdczytano] = useState(false)
  useEffect(() => {
    let aktywny = true
    void wczytajZPamieci(KLUCZ_ZAPISU).then(zapisany => {
      if (!aktywny) return
      try {
        if (zapisany) {
          const wczytany = wczytajProjekt(zapisany)
          if (wczytany.warstwy.length > 0) {
            setProjekt({ ...wczytany, ramka: wczytany.ramka ?? null })
            setWybranaWarstwa(wczytany.warstwy[0].id)
            setWybranaPineska(wczytany.pineski[0]?.id ?? null)
          }
        }
      } catch {
        /* uszkodzony zapis — zostaje to, co jest */
      }
      setOdczytano(true)
    })
    return () => {
      aktywny = false
    }
  }, [])

  useEffect(() => {
    if (!odczytano) return
    const id = setTimeout(() => {
      void zapiszWPamieci(KLUCZ_ZAPISU, projekt)
      try {
        localStorage.setItem(KLUCZ_ZAPISU, JSON.stringify(projekt))
      } catch {
        /* zdjęcia jako dataURL przepełniają localStorage — pełny zapis jest w IndexedDB */
      }
    }, 500)
    return () => clearTimeout(id)
  }, [projekt, odczytano])

  /* ── Wczytywanie zdjęć ─────────────────────────────────────────── */

  const dodajZeZrodla = useCallback(
    (src: string, nazwa: string, zrodlo: ZrodloObrazu, wzorzec?: Warstwa) => {
      const obrazek = new Image()
      obrazek.crossOrigin = 'anonymous'
      obrazek.onload = () => {
        setProjekt(p => {
          const skala = Math.min(1, 460 / obrazek.width)
          const prawaKrawedz = p.warstwy.reduce((maks, w) => Math.max(maks, w.x + w.width), 0)
          const x = p.warstwy.length === 0 ? 60 : prawaKrawedz + 48
          const wysokosc = wzorzec ? wzorzec.height : Math.round(obrazek.height * skala)
          const szerokosc = wzorzec
            ? Math.round((obrazek.width / obrazek.height) * wzorzec.height)
            : Math.round(obrazek.width * skala)
          return {
            ...p,
            warstwy: [
              ...p.warstwy,
              {
                id: nowyId('w'),
                type: 'image' as const,
                src,
                x,
                y: wzorzec ? wzorzec.y : 60,
                width: szerokosc,
                height: wysokosc,
                naturalWidth: obrazek.width,
                naturalHeight: obrazek.height,
                rotation: 0,
                name: nazwa,
                visible: true,
                locked: false,
                zrodlo,
              },
            ],
          }
        })

        if (zrodlo !== 'wynik') {
          void rozpoznajScene(src).then(obiekty => {
            if (obiekty.length === 0) return
            setProjekt(p => ({
              ...p,
              warstwy: p.warstwy.map(w => (w.src === src ? { ...w, obiekty } : w)),
            }))
          })
        }
      }
      obrazek.src = src
    },
    [],
  )

  const wstawPliki = useCallback(
    (pliki: File[], zrodlo: ZrodloObrazu) => {
      for (const plik of pliki) {
        if (!plik.type.startsWith('image/')) continue
        const czytnik = new FileReader()
        czytnik.onload = () =>
          dodajZeZrodla(String(czytnik.result), plik.name.replace(/\.[^.]+$/, '') || 'Zdjęcie', zrodlo)
        czytnik.readAsDataURL(plik)
      }
    },
    [dodajZeZrodla],
  )

  const wstawZAdresu = useCallback(() => {
    const adres = window.prompt('Adres zdjęcia (http lub data:)')
    if (!adres?.trim()) return
    const nazwa = adres.split('/').pop()?.split('?')[0]?.replace(/\.[^.]+$/, '') || 'Z adresu'
    dodajZeZrodla(adres.trim(), nazwa, 'adres')
    setMenuDodawania(false)
  }, [dodajZeZrodla])

  const wstawZeSchowka = useCallback(async () => {
    setMenuDodawania(false)
    try {
      const wpisy = await navigator.clipboard.read()
      for (const wpis of wpisy) {
        const typ = wpis.types.find(t => t.startsWith('image/'))
        if (!typ) continue
        const blob = await wpis.getType(typ)
        wstawPliki([new File([blob], 'Ze schowka', { type: typ })], 'schowek')
      }
    } catch {
      window.alert('Przeglądarka nie dała dostępu do schowka. Wklej zdjęcie skrótem Ctrl+V.')
    }
  }, [wstawPliki])

  useEffect(() => {
    const naWklejenie = (e: ClipboardEvent) => {
      const pliki = [...(e.clipboardData?.items ?? [])]
        .filter(i => i.kind === 'file' && i.type.startsWith('image/'))
        .map(i => i.getAsFile())
        .filter((f): f is File => f !== null)
      if (pliki.length === 0) return
      e.preventDefault()
      wstawPliki(pliki, 'schowek')
    }
    window.addEventListener('paste', naWklejenie)
    return () => window.removeEventListener('paste', naWklejenie)
  }, [wstawPliki])

  /* ── Warstwy ───────────────────────────────────────────────────── */

  const zmienWarstwe = useCallback((id: string, zmiany: Partial<Warstwa>) => {
    setProjekt(p => ({ ...p, warstwy: p.warstwy.map(w => (w.id === id ? { ...w, ...zmiany } : w)) }))
  }, [])

  const usunWarstwe = useCallback((id: string) => {
    setProjekt(p => ({
      ...p,
      warstwy: p.warstwy.filter(w => w.id !== id),
      pineski: p.pineski.filter(x => x.layerId !== id),
    }))
    setWybranaWarstwa(s => (s === id ? null : s))
  }, [])

  /* ── Menu kontekstowe zdjęcia (prawy klik) ─────────────────────── */

  const [menuWarstwy, setMenuWarstwy] = useState<{ id: string; x: number; y: number } | null>(null)
  useEffect(() => {
    if (!menuWarstwy) return
    const zamknij = () => setMenuWarstwy(null)
    const naKlawisz = (e: KeyboardEvent) => e.key === 'Escape' && zamknij()
    window.addEventListener('pointerdown', zamknij)
    window.addEventListener('keydown', naKlawisz)
    window.addEventListener('resize', zamknij)
    return () => {
      window.removeEventListener('pointerdown', zamknij)
      window.removeEventListener('keydown', naKlawisz)
      window.removeEventListener('resize', zamknij)
    }
  }, [menuWarstwy])

  /* ── Szybkie akcje AI na zdjęciu (pływający pasek nad zdjęciem) ── */
  const [akcjaAI, setAkcjaAI] = useState<string | null>(null)
  const AKCJE_AI = useMemo(
    () => [
      { id: 'enhance', etykieta: 'Enhance', ikona: Wand2, skala: 1, prompt: 'Enhance this photograph: improve clarity, fine detail, dynamic range, contrast and colour so it looks like a higher-end camera took it. Keep every object, person, position, framing and the lighting direction exactly the same. Natural, photographic — no over-sharpening, no HDR look, no plastic skin.' },
      { id: 'upscale', etykieta: 'Upscale 2×', ikona: ZoomIn, skala: 2, prompt: 'Upscale this photograph to twice its resolution. Reconstruct crisp, natural fine detail (textures, edges, text) while keeping the content, composition, colours and lighting identical. No new objects, no style change.' },
      { id: 'swiatlo', etykieta: 'Złota godzina', ikona: Sun, skala: 1, prompt: 'Relight this photograph to warm golden-hour sunlight: low sun, long soft shadows, warm highlights and gentle haze. Keep every object, person, position and the framing exactly the same.' },
      { id: 'bokeh', etykieta: 'Rozmyj tło', ikona: Aperture, skala: 1, prompt: 'Give this photograph a shallow depth of field like an f/1.8 portrait lens: keep the main subject in the foreground perfectly sharp and blur the background with natural optical bokeh. Keep composition, colours and lighting the same.' },
      { id: 'czysc', etykieta: 'Usuń zakłócenia', ikona: Eraser, skala: 1, prompt: 'Clean up this photograph: remove small distractions — litter, stray cables, dust spots, sensor spots, watermarks and small unwanted passers-by in the background — and rebuild what was behind them naturally. Keep the main subjects, composition and lighting exactly the same.' },
      { id: 'film', etykieta: 'Film analog', ikona: Film, skala: 1, prompt: 'Give this photograph the look of 35mm analog film (Kodak Portra 400): soft film grain, gentle highlight roll-off, natural film colour. Keep every object, person, position and the framing exactly the same.' },
    ],
    [],
  )
  const uruchomAkcjeAI = useCallback(
    async (warstwaId: string, akcjaId: string) => {
      const w = projekt.warstwy.find(x => x.id === warstwaId)
      const a = AKCJE_AI.find(x => x.id === akcjaId)
      if (!w || !a || akcjaAI) return
      setMenuWarstwy(null)
      setAkcjaAI(akcjaId)
      try {
        const maks = 2048
        const k = Math.min(a.skala, maks / Math.max(w.naturalWidth, w.naturalHeight))
        const szer = Math.round(w.naturalWidth * Math.max(1, k))
        const wys = Math.round(w.naturalHeight * Math.max(1, k))
        const wynik = await generuj({ polecenie: a.prompt, obrazy: [await konwertujNaDataUrl(w.src)], szerokosc: szer, wysokosc: wys })
        const src = await dopasujFormatDoObrazu(wynik.obrazUrl, szer, wys)
        dodajZeZrodla(src, `${w.name}_${a.id}`, 'wynik', w)
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Nie udało się wykonać akcji.')
      } finally {
        setAkcjaAI(null)
      }
    },
    [projekt.warstwy, AKCJE_AI, akcjaAI, dodajZeZrodla],
  )

  const akcjaWarstwy = useCallback(
    (id: string, akcja: 'duplikuj' | 'pobierz' | 'wierzch' | 'spod' | 'blokada' | 'ukryj' | 'usun') => {
      const w = projekt.warstwy.find(x => x.id === id)
      setMenuWarstwy(null)
      if (!w) return
      if (akcja === 'usun') return usunWarstwe(id)
      if (akcja === 'pobierz') {
        const a = document.createElement('a')
        a.href = w.src
        a.download = `${w.name || 'zdjecie'}.jpg`
        document.body.appendChild(a)
        a.click()
        a.remove()
        return
      }
      setProjekt(p => {
        const reszta = p.warstwy.filter(x => x.id !== id)
        switch (akcja) {
          case 'duplikuj': {
            const kopia = { ...w, id: nowyId('w'), x: w.x + 32, y: w.y + 32, name: `${w.name} (kopia)`, locked: false }
            return { ...p, warstwy: [...p.warstwy, kopia] }
          }
          case 'wierzch':
            return { ...p, warstwy: [...reszta, w] }
          case 'spod':
            return { ...p, warstwy: [w, ...reszta] }
          case 'blokada':
            return { ...p, warstwy: p.warstwy.map(x => (x.id === id ? { ...x, locked: !x.locked } : x)) }
          case 'ukryj':
            return { ...p, warstwy: p.warstwy.map(x => (x.id === id ? { ...x, visible: false } : x)) }
        }
        return p
      })
    },
    [projekt.warstwy, usunWarstwe],
  )

  /* ── Pineski (Obsługa od 1 do 10 pinesek) ────────────────────────── */

  const wbijPineske = useCallback(
    (layerId: string, normalizedX: number, normalizedY: number) => {
      if (projekt.pineski.length >= 10) {
        window.alert('Osiągnięto limit 10 pinesek na płótnie.')
        return
      }

      const pineska: Pineska = {
        id: nowyId('p'),
        layerId,
        normalizedX,
        normalizedY,
        label: '',
        analizowana: true,
      }

      setProjekt(p => {
        const nowePineski = [...p.pineski, pineska]
        // Jeśli właśnie wbito drugą pineskę i nie wybrano trybu ręcznego, sugerujemy Object Transfer
        return {
          ...p,
          pineski: nowePineski,
        }
      })
      setWybranaPineska(pineska.id)

      // Rozpoznanie obiektu pod pineską
      const warstwa = projekt.warstwy.find(w => w.id === layerId)
      if (!warstwa) return
      void (async () => {
        // Jak w Lovart: pineska to tylko punkt + nazwa. Bez „analizy” wymiarów
        // (zgadywała rozmiar widocznego kawałka); skalę mierzy reżyser przy generacji.
        const wycinek = await wytnijOkolice(warstwa.src, normalizedX, normalizedY, 384, 0.3)
        const zWycinka = wycinek ? await rozpoznajObiekt(wycinek) : []
        const zeSceny = projekt.warstwy.find(w => w.id === layerId)?.obiekty ?? []
        const nazwy = zWycinka.length > 0 ? [...zWycinka, ...zeSceny].slice(0, 6) : zeSceny.slice(0, 6)
        setProjekt(p => ({
          ...p,
          pineski: p.pineski.map(x =>
            x.id === pineska.id
              ? {
                  ...x,
                  analizowana: false,
                  sugestie: nazwy,
                  label: (x.label ?? '').trim() || nazwy[0] || `obiekt ${p.pineski.indexOf(x) + 1}`,
                }
              : x,
          ),
        }))
      })()
    },
    [projekt.warstwy, projekt.pineski.length],
  )

  const zmienPineske = useCallback((id: string, zmiany: Partial<Pineska>) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === id ? { ...x, ...zmiany } : x)) }))
  }, [])

  const usunPineske = useCallback((id: string) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.filter(x => x.id !== id) }))
    setWybranaPineska(s => (s === id ? null : s))
  }, [])

  /* ── Skróty klawiszowe ─────────────────────────────────────────── */

  useEffect(() => {
    const naKlawisz = (e: KeyboardEvent) => {
      const cel = e.target as HTMLElement
      if (cel && ['INPUT', 'TEXTAREA', 'SELECT'].includes(cel.tagName)) return
      if (e.ctrlKey || e.metaKey) return
      if (e.key === 'Escape') {
        setWybranaPineska(null)
        setMenuDodawania(false)
        return
      }
      const skroty: Record<string, Narzedzie> = { v: 'wybor', p: 'pineska', h: 'reka', r: 'ramka' }
      const n = skroty[e.key.toLowerCase()]
      if (n) {
        setNarzedzie(n)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (wybranaPineska) usunPineske(wybranaPineska)
        else if (wybranaWarstwa) usunWarstwe(wybranaWarstwa)
      }
    }
    window.addEventListener('keydown', naKlawisz)
    return () => window.removeEventListener('keydown', naKlawisz)
  }, [wybranaPineska, wybranaWarstwa, usunPineske, usunWarstwe])

  /* ── Przygotowanie generacji ───────────────────────────────────── */

  const intencja = useMemo(
    () => wykryjIntencje(projekt.tekst, projekt.pineski),
    [projekt.tekst, projekt.pineski],
  )

  // Płótno = zdjęcie, w którego kadrze wróci wynik. Zwykle to zdjęcie
  // pierwszej pineski („zamień TO auto na tamto”), ale przy przeniesieniu
  // między zdjęciami wynik ma kadr miejsca docelowego, czyli ostatniej
  // pineski — „przenieś fotel z salonu na taras” daje taras z fotelem.
  const warstwaZrodlowa = useMemo(() => {
    const uchwyty = projekt.pineski.filter(p => !p.chroniona)
    const kluczowa =
      intencja === 'przenies' && uchwyty.length >= 2 ? uchwyty[uchwyty.length - 1] : projekt.pineski[0]
    const zPineski = kluczowa ? projekt.warstwy.find(w => w.id === kluczowa.layerId) : null
    return (
      zPineski ??
      (wybranaWarstwa ? projekt.warstwy.find(w => w.id === wybranaWarstwa) : null) ??
      projekt.warstwy[0] ??
      null
    )
  }, [projekt.pineski, projekt.warstwy, wybranaWarstwa, intencja])

  const obrazyWejsciowe = useMemo(
    () => (warstwaZrodlowa ? kolejnoscObrazow(warstwaZrodlowa, projekt.pineski, projekt.warstwy) : []),
    [warstwaZrodlowa, projekt.pineski, projekt.warstwy],
  )

  // Bez legendy mapy: do modelu idą same czyste zdjęcia, więc polecenie
  // nie może opisywać obrazu z celownikami, którego model nie dostaje.
  const polecenie = useMemo(
    () => zbudujPolecenie(projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja),
    [projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja],
  )

  const uwagi = useMemo(
    () => sprawdzPolecenie(projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja),
    [projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja],
  )

  const powodBlokady = useMemo(() => {
    if (!warstwaZrodlowa) return 'Dodaj przynajmniej jedno zdjęcie'
    const blokada = uwagi.find(u => u.waga === 'blokada')
    if (blokada) return blokada.tresc
    if (!projekt.tekst.trim()) return 'Wpisz polecenie w chacie po prawej stronie'
    return null
  }, [warstwaZrodlowa, uwagi, projekt.tekst])

  /** Odpowiedź użytkownika na pytanie o role (poziom 4) — ważna, dopóki pineski się nie zmienią. */
  const odpowiedzRol = useRef<{ odcisk: string; opcja: OpcjaRol } | null>(null)

  /* Uruchomienie generacji z Nano-Banana */
  // Blokada: drugi klik / Enter w trakcie generacji nie odpala kolejnej
  const refGeneruje = useRef(false)
  const uruchomGeneracje = useCallback(async () => {
    if (!warstwaZrodlowa || refGeneruje.current) return
    refGeneruje.current = true
    setStanGeneracji({ faza: 'planuje' })

    try {
      // Kto jest obiektem, a kto miejscem — cztery poziomy od najpewniejszego
      // (patrz `role-z-polecenia.ts`): odpowiedź użytkownika > jawne słowa i
      // gramatyka zdania > wzrok (rzecz czy miejsce) > pytanie zamiast zgadywania.
      const odcisk = odciskPinesek(projekt.pineski)
      const odpowiedz = odpowiedzRol.current?.odcisk === odcisk ? odpowiedzRol.current.opcja : null
      const zeZdania = odpowiedz ? null : roleZPolecenia(projekt.tekst, projekt.pineski, projekt.warstwy, intencja)
      let uklad: Uklad
      let rolePewne = false
      let powodRol = ''
      if (odpowiedz) {
        uklad = { plotno: projekt.warstwy.find(w => w.id === odpowiedz.bazaId) ?? null, role: odpowiedz.role }
        rolePewne = true
        powodRol = 'Role ustalone przez Ciebie.'
      } else if (zeZdania && Object.keys(zeZdania.role).length) {
        uklad = { plotno: zeZdania.baza, role: zeZdania.role }
        rolePewne = true
        powodRol = zeZdania.powod
      } else {
        const rodzaje =
          intencja === 'wstaw' || intencja === 'przenies'
            ? await klasyfikujPineski(projekt.pineski, projekt.warstwy)
            : null
        uklad = ustalUklad(projekt.pineski, projekt.warstwy, intencja, rodzaje)
        // Bez pytania do użytkownika: gdy role są niejasne, rozstrzyga reżyser (widzi zdjęcia).
        if (Object.keys(uklad.role).length) powodRol = 'Po wyglądzie pinesek: jedna leży na rzeczy, druga na miejscu.'
      }
      // Zdjęcie-baza wskazane słowami („edytuj zdjęcie 1”) wygrywa z każdym domysłem.
      const bazaPewna = rolePewne || Boolean(zeZdania?.baza)
      if (zeZdania?.baza) {
        uklad = { ...uklad, plotno: zeZdania.baza }
        powodRol ||= zeZdania.powod
      }
      if (powodRol) console.info('[canvas] role pinesek:', powodRol, uklad.role)
      let obrazy = uklad.plotno
        ? kolejnoscObrazow(uklad.plotno, projekt.pineski, projekt.warstwy)
        : obrazyWejsciowe
      let zrodlo = obrazy[0]

      // Agent dostaje zdjęcia z narysowanymi pineskami — ma zobaczyć, na
      // czym leży każdy punkt. Model obrazu dostaje później czyste zdjęcia.
      const obrazyDlaAgenta: ObrazDlaAgenta[] = await Promise.all(
        obrazy.map(async (w, i) => {
          const zPineskami = await narysujMapeMiejsc(w, projekt.pineski)
          const rola: ObrazDlaAgenta['rola'] = i === 0 ? 'plotno' : 'material'
          return { rola, nazwa: w.name, dane: zPineskami || (await zmniejszDoAnalizy(w.src)) || w.src }
        }),
      )

      const uchwytyTekst = projekt.pineski
        .map((p, i) => {
          const nrObrazu = obrazy.findIndex(w => w.id === p.layerId) + 1 || 1
          const rola = uklad.role[i + 1] ? ` — role: ${uklad.role[i + 1]}${rolePewne ? ' (FIXED by the user — do not change)' : ''}` : ''
          const ochrona = p.chroniona ? ' — PROTECTED, must stay unchanged' : ''
          // Miejsce wskazuje numerowany celownik na zdjęciu — bez współrzędnych i pasm w tekście.
          return `Pin ${i + 1} "${etykietaPineski(p, i + 1)}" on Image ${nrObrazu}, marked by the numbered magenta crosshair ${i + 1}${rola}${ochrona}`
        })
        .join('\n')

      const plan = await zaplanuj({
        zadanie: projekt.tekst,
        rusztowanie: polecenie,
        obrazy: obrazyDlaAgenta,
        uchwyty: uchwytyTekst,
      })

      setStanGeneracji({ faza: 'trwa', plan: plan?.plan, role: powodRol || undefined })

      // Agent widział zdjęcia, więc jego tryb wygrywa z rozpoznaniem ze słów.
      // Jego opis obiektów i instrukcja wchodzą W rusztowanie — reguły kadru,
      // ochrony i czystego wyniku idą do modelu zawsze.
      let trybAgenta = INTENCJE.find(i => i.id === plan?.intencja)?.id ?? intencja
      // „wstaw X tutaj” na JEDNYM zdjęciu, gdy jedna pineska jest obiektem (SOURCE), a druga miejscem (DESTINATION):
      // obiekt się przenosi — „wstaw” (kopia, nic nie znika) tylko na wyraźne życzenie kopii.
      if (trybAgenta === 'wstaw' && !plan?.osoba) {
        const nrZr = Object.entries(uklad.role).find(([, r]) => r === 'SOURCE')?.[0]
        const nrCel = Object.entries(uklad.role).find(([, r]) => r === 'DESTINATION')?.[0]
        const pZr = nrZr ? projekt.pineski[Number(nrZr) - 1] : undefined
        const pCel = nrCel ? projekt.pineski[Number(nrCel) - 1] : undefined
        const chceKopie = /kopi|duplik|klon|jeszcze|drugi|kolejn|następn|nastepn|również|rowniez|też|tez\b/i.test(projekt.tekst)
        if (pZr && pCel && pZr.layerId === pCel.layerId && pZr.layerId === uklad.plotno?.id && !chceKopie) trybAgenta = 'przenies'
      }

      // Reżyser (widzi wszystkie zdjęcia) wskazuje, które jest DOCELOWE — tam
      // ląduje obiekt. Promujemy je na Image 1: z niego idą wymiary do Runware
      // i do twardej blokady formatu, nigdy format zdjęcia-dawcy. Gdy trzeba
      // było przestawić, pomijamy box reżysera (jego współrzędne dotyczyły
      // wcześniejszego Image 1) i zdajemy się na kotwiczenie do pineski.
      let przestawiono = false
      if (!bazaPewna && plan?.zdjecieDocelowe && plan.zdjecieDocelowe >= 1 && plan.zdjecieDocelowe <= obrazy.length) {
        const wybrane = obrazy[plan.zdjecieDocelowe - 1]
        if (wybrane && wybrane.id !== zrodlo.id) {
          obrazy = [wybrane, ...obrazy.filter(w => w.id !== wybrane.id)]
          zrodlo = obrazy[0]
          przestawiono = true
        }
      }

      // Obszary od reżysera i użytkownika:
      // Jeśli użytkownik narysował ramkę na warstwie płótna, ma ona pierwszeństwo (Lovart inpainting mask).
      // W przeciwnym razie bierzemy obszar wyznaczony przez reżysera/agenta.
      const ramkaCelu: Prostokat | undefined =
        projekt.ramka && projekt.ramka.layerId === zrodlo.id
          ? {
              x0: Math.min(projekt.ramka.x0, projekt.ramka.x1),
              y0: Math.min(projekt.ramka.y0, projekt.ramka.y1),
              x1: Math.max(projekt.ramka.x0, projekt.ramka.x1),
              y1: Math.max(projekt.ramka.y0, projekt.ramka.y1),
            }
          : undefined

      // Pineski-źródła leżące na płótnie (obiekt do przeniesienia / zamiany) — te same role co w prompcie.
      const zrodlaNaCelu = idZrodelNaPlotnie(projekt.pineski, obrazy, trybAgenta, uklad.role)

      // Znajdź pineskę docelową na płótnie (nie źródło: bez tego przy rolach z kolejności brana była pierwsza pineska,
      // czyli obiekt — skala i kontrola liczyły się dla złego miejsca):
      const pinDocelowy =
        projekt.pineski.find(
          p =>
            p.layerId === zrodlo.id &&
            !p.chroniona &&
            uklad.role[projekt.pineski.indexOf(p) + 1] === 'DESTINATION',
        ) ??
        projekt.pineski.find(p => p.layerId === zrodlo.id && !p.chroniona && !zrodlaNaCelu.has(p.id)) ??
        projekt.pineski.find(p => p.layerId === zrodlo.id && !p.chroniona)

      // Znajdź pineskę źródłową (dawcę obiektu):
      const pinZrodlowy =
        projekt.pineski.find(
          p =>
            !p.chroniona &&
            uklad.role[projekt.pineski.indexOf(p) + 1] === 'SOURCE',
        ) ??
        projekt.pineski.find(p => p !== pinDocelowy && !p.chroniona)

      const rozmiarSurowy = plan?.pomiar ? rozmiarZPomiaru(plan.pomiar, zrodlo.naturalWidth, zrodlo.naturalHeight, pinDocelowy?.normalizedY) : undefined
      // Bezpiecznik: obiekt przenoszony na zdjęcie rzadko zajmuje ponad 40% szerokości kadru — taki pomiar to prawie na pewno
      // błąd kotwic reżysera (w teście samochód → miasteczko wyszło 48% przy faktycznych 18%). Nie wysyłamy go modelowi ani do kontroli.
      if (rozmiarSurowy && rozmiarSurowy.szer > 40) console.warn('[canvas] pomiar rozmiaru odrzucony jako nieprawdopodobny', { rozmiarSurowy, pomiar: plan?.pomiar })
      const rozmiarPlanu = rozmiarSurowy && rozmiarSurowy.szer <= 40 ? rozmiarSurowy : undefined
      const surowyObszar =
        trybAgenta === 'tlo' || trybAgenta === 'styl'
          ? undefined
          : ramkaCelu ?? (przestawiono ? undefined : plan?.obszar)

      // Jeśli użytkownik nie narysował ręcznie ramki, deterministycznie kotwiczymy i kalibrujemy obszar do pineski:
      const obszarCelu = ramkaCelu
        ? ramkaCelu
        : skalibrujObszarPineski(surowyObszar, pinDocelowy, rozmiarPlanu)

      const obszarZrodla = trybAgenta === 'przenies' && !przestawiono ? plan?.obszarZrodla : undefined
      // Magentowe boxy WYŁĄCZONE: dawały 3. obraz (clean canvas), blok „MARKED
      // AREAS" i sygnał „wypełnij prostokąt" → efekt wklejki. Kotwiczymy zmianę
      // wyłącznie opisem + współrzędnymi pineski (prompt-first).
      const plotnoZObszarami: string | null = null

      // Generacja na wycinku wokół miejsca zmiany: błąd pozycji modelu jest
      // procentem WYCINKA, a nie całego kadru. Przy niepewności — pełny kadr.
      const punktyZmiany = projekt.pineski
        .filter(p => p.layerId === zrodlo.id && !p.chroniona)
        .map(p => ({ x: p.normalizedX, y: p.normalizedY }))
      const wycinek =
        GENERUJ_NA_WYCINKU && pinDocelowy && ['wstaw', 'przenies', 'zamien'].includes(trybAgenta)
          ? policzWycinek(zrodlo.naturalWidth, zrodlo.naturalHeight, punktyZmiany)
          : null
      const srcWycinka = wycinek ? await wytnijWycinek(await konwertujNaDataUrl(zrodlo.src), wycinek) : null
      const trybWycinka = Boolean(wycinek && srcWycinka)

      const warstwaWycinka: Warstwa | null =
        trybWycinka && wycinek && srcWycinka
          ? { ...zrodlo, id: `${zrodlo.id}-wycinek`, src: srcWycinka, naturalWidth: wycinek.w, naturalHeight: wycinek.h }
          : null
      const obrazyPolecenia = warstwaWycinka ? [warstwaWycinka, ...obrazy.slice(1)] : obrazy
      const pineskiPolecenia =
        warstwaWycinka && wycinek
          ? projekt.pineski.map(p =>
              p.layerId === zrodlo.id
                ? {
                    ...p,
                    layerId: warstwaWycinka.id,
                    normalizedX: (p.normalizedX * zrodlo.naturalWidth - wycinek.x) / wycinek.w,
                    normalizedY: (p.normalizedY * zrodlo.naturalHeight - wycinek.y) / wycinek.h,
                  }
                : p,
            )
          : projekt.pineski

      // Skala liczona z kotwicy o znanym rozmiarze (nie z oka): % kadru docelowego.
      const porownanie = plan?.pomiar ? porownanieZKotwica(plan.pomiar, pinDocelowy?.normalizedY) : ''
      if (plan?.pomiar) console.info('[canvas] pomiar skali', { pomiar: plan.pomiar, rozmiarPlanu })

      // Operacja na człowieku idzie modelem postaci (RUNWARE_MODEL_POSTAC, jeśli ustawiony).
      const operacjaAgenta = operacjaZIntencji(trybAgenta, plan?.osoba)
      const postac = OPERACJE_POSTACI.has(operacjaAgenta)
      // Prompt: [TASK] operacji + pineski z odznakami od Gemini, [USER], [RULES] z PDF Studia.
      // Światło zdjęcia docelowego (zmierzone przez reżysera) idzie do [RULES]; rozmiar i kierunek — tylko do pomiaru.
      // Przeniesienie / zamiana w kadrze: wyczerpujący opis KONKRETNEGO obiektu spod pineski źródłowej z jego wycinka
      // (opis reżysera z całego zdjęcia bywał zbyt ogólny — model rysował inny obiekt tego samego rodzaju).
      // ZABLOKOWANE (prompty/zablokowane/ruch-w-kadrze.ts) — nie zmieniać bez prośby użytkownika.
      // Ruch / zamiana obiektu w obrębie jednego zdjęcia (dwie pineski na Image 1): prosty prompt „przesuwasz, nie kopiujesz”
      // (skladaj.ts) — bez zbliżeń i opisów szczegółowych obiektu.
      const ruchWKadrze =
        ['przenies', 'zamien'].includes(trybAgenta) &&
        ['object_transfer', 'object_swap', 'character_transfer'].includes(operacjaAgenta) &&
        !plan?.czesc &&
        !plan?.cecha &&
        Boolean(pinZrodlowy && pinDocelowy && pinZrodlowy.layerId === zrodlo.id && pinDocelowy.layerId === zrodlo.id)
      let szczegolyPlanu = plan?.szczegoly
      const pinObiektuWKadrze = projekt.pineski.find(p => zrodlaNaCelu.has(p.id))
      if (
        !ruchWKadrze &&
        pinObiektuWKadrze &&
        ['przenies', 'zamien'].includes(trybAgenta) &&
        projekt.pineski.every(p => p.chroniona || p.layerId === zrodlo.id)
      ) {
        const wyc = await wytnijOkolice(zrodlo.src, pinObiektuWKadrze.normalizedX, pinObiektuWKadrze.normalizedY, 768, 0.22)
        const opisObiektu = wyc ? await opiszObiektSzczegolowo(wyc) : ''
        if (opisObiektu) szczegolyPlanu = { ...(plan?.szczegoly ?? {}), [projekt.pineski.indexOf(pinObiektuWKadrze) + 1]: opisObiektu }
      }
      // Transfer postaci z drugiego zdjęcia: karta tożsamości osoby (twarz cecha po cesze, włosy, budowa, ubiór) z wycinka wokół
      // pinu źródłowego + zbliżenie twarzy jako dodatkowy obraz referencyjny — wszystko w JEDNEJ generacji.
      let zblizenieTwarzy: string | null = null
      const pinOsoby = operacjaAgenta === 'character_transfer' && pinZrodlowy && pinZrodlowy.layerId !== zrodlo.id ? pinZrodlowy : undefined
      if (pinOsoby) {
        const warstwaOsoby = projekt.warstwy.find(w => w.id === pinOsoby.layerId)
        const wycOsoby = warstwaOsoby ? await wytnijOkolice(warstwaOsoby.src, pinOsoby.normalizedX, pinOsoby.normalizedY, 1024, 0.6) : ''
        if (wycOsoby) {
          const karta = await opiszOsobeSzczegolowo(wycOsoby)
          if (karta.opis) szczegolyPlanu = { ...(szczegolyPlanu ?? {}), [projekt.pineski.indexOf(pinOsoby) + 1]: karta.opis }
          if (karta.twarz) zblizenieTwarzy = await wytnijZblizenieTwarzy(wycOsoby, karta.twarz)
        }
      }
      // Zbliżenia w pobliżu pinesek (inteligentne: ramka rzeczy od Gemini, wycinek z oryginału, margines proporcjonalny).
      let zblizenia: Zblizenie[] = []
      // ZABLOKOWANE (prompty/zablokowane/transfer-z-drugiego-zdjecia.ts): w tym trybie do modelu nie idą późniejsze dodatki, w tym zbliżenia.
      const transferZDrugiegoZdjecia =
        operacjaAgenta === 'object_transfer' && Boolean(pinZrodlowy && pinDocelowy && pinZrodlowy.layerId !== zrodlo.id && pinDocelowy.layerId === zrodlo.id)
      // Usuwanie: zbliżenie obiektu „do usunięcia” kazałoby modelowi zachować jego stan (T01/T02) — tu nic nie jest wstawiane ani oglądane.
      if (ZBLIZENIA_W_POBLIZU_PINEZKI && !ruchWKadrze && !transferZDrugiegoZdjecia && operacjaAgenta !== 'removal' && operacjaAgenta !== 'addition') {
        try {
          zblizenia = await zbudujZblizenia({
            operacja: operacjaAgenta,
            czesc: plan?.czesc,
            cecha: plan?.cecha,
            pinZrodlowy,
            pinDocelowy,
            warstwaCelu: zrodlo,
            warstwaZrodla: pinZrodlowy ? projekt.warstwy.find(w => w.id === pinZrodlowy.layerId) : undefined,
            szerokoscObiektu: rozmiarPlanu ? rozmiarPlanu.szer / 100 : undefined,
          })
        } catch (e) {
          console.warn('[canvas] zbliżenia nieudane', e)
        }
      }
      // numeracja: po zdjęciach wejściowych najpierw zbliżenie twarzy (jeśli jest), potem pozostałe zbliżenia
      const pierwszyDodatkowy = obrazyPolecenia.length + 1 + (zblizenieTwarzy ? 1 : 0)
      const zadanieModelu = zbudujZadanieModelu(projekt.tekst, pineskiPolecenia, obrazyPolecenia, trybAgenta, {
        twarzObraz: zblizenieTwarzy ? obrazyPolecenia.length + 1 : undefined,
        zblizenia: zblizenia.map((z, i) => ({ numer: pierwszyDodatkowy + i, opis: z.opis })),
        role: uklad.role,
        osoba: plan?.osoba,
        odznaki: plan?.odznaki,
        szczegoly: szczegolyPlanu,
        skala: plan?.skala,
        widok: plan?.widok,
        ulozenie: plan?.ulozenie,
        czesc: plan?.czesc,
        cecha: plan?.cecha,
        czescZakres: plan?.czescZakres,
        pierwszyPlan: plan?.pierwszyPlan,
        miejsca: plan?.miejsca,
        swiatlo: plan?.swiatlo,
        // Rozmiar z kotwic reżysera — bez niego model brał wielkość obiektu z referencji.
        rozmiar:
          rozmiarPlanu
            ? `at the destination pin the whole object spans about ${Math.round(rozmiarPlanu.szer)}% of Image 1's width and ${Math.round(rozmiarPlanu.wys)}% of its height.${porownanie ? ` ${porownanie}` : ''}`
            : undefined,
      })
      const pelnePolecenie = zadanieModelu?.prompt ?? ''
      const ustawieniaModelu = {
        system: zadanieModelu?.system,
        temperatura: zadanieModelu?.temperatura,
        klasa: postac
          ? ('postac' as const)
          : zadanieModelu?.gemini31
            ? ('gemini31' as const)
            : undefined,
      }

      setOstatniPrompt(
        ustawieniaModelu.system ? `[SYSTEM]\n${ustawieniaModelu.system}\n\n${pelnePolecenie}` : pelnePolecenie,
      )

      // Mała magentowa kropka w miejscu każdej wskazującej pineski (współrzędne
      // kropki idą też do PIN MAP). Chronione pineski zostają bez kropki.
      // Źródło na obrazie docelowym nie dostaje kropki: model zostawiał ją na oryginalnym obiekcie.
      const zrodloNaCelu = (p: Pineska) => zrodlaNaCelu.has(p.id)
      // Bez kropek na zdjęciach: miejsce wskazują wyłącznie współrzędne x/y w prompcie
      // (kropka zostawała w wyniku). Zmienna KROPKI_NA_ZDJECIACH przywraca kropki.
      const zKropkami = (w: Warstwa, pineski: Pineska[]) =>
        konwertujNaDataUrl(w.src).then(src =>
          KROPKI_NA_ZDJECIACH
            ? narysujKropki(
                src,
                pineski
                  .filter(p => p.layerId === w.id && !p.chroniona && !zrodloNaCelu(p))
                  .map(p => ({ x: p.normalizedX, y: p.normalizedY, kolor: undefined })),
                undefined,
                1,
              )
            : src,
        )
      const czyste = await Promise.all(obrazyPolecenia.map(w => zKropkami(w, pineskiPolecenia)))
      // Przeniesienie w obrębie jednego zdjęcia: to samo zdjęcie drugi raz, z kropką na obiekcie
      // (Image 1 ma kropkę w miejscu docelowym) — model wie dokładnie, KTÓRY obiekt i DOKĄD.
      const pinZr = pineskiPolecenia.find(p => zrodloNaCelu(p))
      const zblizenie =
        null // przeniesienie w kadrze bez kropek i bez drugiego zdjęcia — samo szczegółowe słowne wskazanie
      const obrazyDoModelu = [
        ...(plotnoZObszarami ? [plotnoZObszarami, ...czyste.slice(1), czyste[0]] : czyste),
        ...(zblizenie ? [zblizenie] : []),
        ...(zblizenieTwarzy ? [zblizenieTwarzy] : []),
        ...zblizenia.map(z => z.src),
      ]
      const polecenieModelu = pelnePolecenie
      let wynik = await generuj({
        ...ustawieniaModelu,
        polecenie: polecenieModelu,
        obrazy: obrazyDoModelu,
        szerokosc: warstwaWycinka?.naturalWidth ?? zrodlo.naturalWidth,
        wysokosc: warstwaWycinka?.naturalHeight ?? zrodlo.naturalHeight,
      })

      if (warstwaWycinka && wycinek) {
        // rozmiar od reżysera (ułamek zdjęcia docelowego) → ułamek wycinka
        // Przy zamianie zmieniony obszar obejmuje też stary obiekt — pomiar byłby zawyżony.
        const cel = rozmiarPlanu && trybAgenta !== 'zamien'
          ? {
              szer: Math.min(0.95, rozmiarPlanu.szer / 100 / (wycinek.w / zrodlo.naturalWidth)),
              wys: Math.min(0.95, rozmiarPlanu.wys / 100 / (wycinek.h / zrodlo.naturalHeight)),
            }
          : undefined
        const zlozony = await zlozWycinek(await konwertujNaDataUrl(zrodlo.src), wynik.obrazUrl, wycinek, cel)
        if (zlozony) {
          wynik = { ...wynik, obrazUrl: zlozony.src }
        } else {
          console.info('[canvas] wycinek: nie da się pewnie złożyć — generuję na pełnym kadrze')
          const pelnyPrompt = zbudujPolecenie(projekt.tekst, projekt.pineski, obrazy, trybAgenta, {
            role: uklad.role,
            osoba: plan?.osoba,
            odznaki: plan?.odznaki,
          })
          setOstatniPrompt(pelnyPrompt)
          const pelne = await generuj({
            ...ustawieniaModelu,
            polecenie: pelnyPrompt,
            obrazy: [await zKropkami(zrodlo, projekt.pineski), ...czyste.slice(1)],
            szerokosc: zrodlo.naturalWidth,
            wysokosc: zrodlo.naturalHeight,
          })
          wynik = { ...pelne, kosztUSD: (wynik.kosztUSD ?? 0) + (pelne.kosztUSD ?? 0) }
        }
      }

      // TWARDA BLOKADA FORMATU: Nano-Banana ignoruje żądane wymiary i potrafi
      // oddać wynik w proporcjach zdjęcia referencyjnego. Deterministycznie
      // dopasowujemy wynik do dokładnego formatu Image 1 (zdjęcie docelowe).
      wynik.obrazUrl = await dopasujFormatDoObrazu(wynik.obrazUrl, zrodlo.naturalWidth, zrodlo.naturalHeight)

      // Ziarno obiektu dosypujemy deterministycznie: prompt prosi o nie kilka razy,
      // a model i tak potrafi oddać wstawiony obiekt gładszy od reszty zdjęcia.
      // Zmienia tylko obszar zmiany i tylko wtedy, gdy obiekt jest mierzalnie gładszy.
      if (POSTPROCES_ZIARNA && ['wstaw', 'przenies', 'zamien', 'postac', 'ubranie'].includes(trybAgenta)) {
        wynik.obrazUrl = await dopasujZiarno(wynik.obrazUrl, zrodlo.src)
      }

      const nazwa = nazwijWynik(projekt.tekst, projekt.pineski)

      // POMIAR: model obrazu potrafi zignorować rozmiar i miejsce z promptu (auto 2× za
      // duże, pół metra obok pineski). Mierzymy obiekt na wyniku i przy wyraźnym błędzie
      // generujemy JEDEN raz ponownie z liczbową korektą na początku promptu.
      const pinObiektu = pinZrodlowy ?? pinDocelowy
      const nazwaObiektu = pinObiektu ? pinObiektu.analiza?.obiektEn || etykietaPineski(pinObiektu, projekt.pineski.indexOf(pinObiektu) + 1) : ''
      const mierzalne =
        ['wstaw', 'przenies', 'zamien'].includes(trybAgenta) &&
        Boolean(pinDocelowy && pinDocelowy.layerId === zrodlo.id && nazwaObiektu)
      const ocenPomiar = async (src: string) => {
        if (!mierzalne || !pinDocelowy) return null
        const box = await zmierzObiekt((await zmniejszDoAnalizy(src)) || src, nazwaObiektu)
        if (!box) return null
        const szer = (box.x1 - box.x0) * 100
        const cx = (box.x0 + box.x1) / 2
        const cy = (box.y0 + box.y1) / 2
        const odX = cx - pinDocelowy.normalizedX
        const odY = cy - pinDocelowy.normalizedY
        const cel = rozmiarPlanu?.szer
        const skala = cel ? szer / cel : 1
        const bledy: string[] = []
        const korekta: string[] = []
        if (cel && (skala > 1.35 || skala < 0.65)) {
          bledy.push(`${skala > 1 ? 'za duży' : 'za mały'} (${Math.round(szer)}% szerokości zamiast ok. ${Math.round(cel)}%)`)
          korekta.push(
            `SIZE: the object came out ${Math.round(szer)}% of the image width — ${skala > 1 ? 'far too large' : 'far too small'}. It must span about ${Math.round(cel)}% of the width of Image 1${porownanie ? ` (${porownanie})` : ''}. Draw it ${skala > 1 ? `${(skala).toFixed(1)}× smaller` : `${(1 / skala).toFixed(1)}× larger`} than before.`,
          )
        }
        if (Math.abs(odX) > 0.08 || Math.abs(odY) > 0.09) {
          bledy.push(`obok pineski (środek na ${Math.round(cx * 100)}%, ${Math.round(cy * 100)}% zamiast ${Math.round(pinDocelowy.normalizedX * 100)}%, ${Math.round(pinDocelowy.normalizedY * 100)}%)`)
          korekta.push(
            `POSITION: its centre came out at x=${Math.round(cx * 100)}%, y=${Math.round(cy * 100)}% — it must be at the destination point, x=${Math.round(pinDocelowy.normalizedX * 100)}%, y=${Math.round(pinDocelowy.normalizedY * 100)}% (move it ${odY > 0 ? 'up' : 'down'}${Math.abs(odX) > 0.08 ? ` and ${odX > 0 ? 'left' : 'right'}` : ''}).`,
          )
        }
        return { szer, cel, bledy, korekta }
      }

      let pomiar = await ocenPomiar(wynik.obrazUrl)
      if (pomiar?.bledy.length) console.info('[canvas] pomiar wyniku:', pomiar)
      if (DRUGI_PRZEBIEG && pomiar?.bledy.length) {
        dodajZeZrodla(wynik.obrazUrl, `${nazwa}_proba1`, 'wynik', zrodlo)
        setStanGeneracji({ faza: 'koryguje', wynik: { ...wynik, nazwa, opis: '' }, powod: pomiar.bledy.join('; ') })
        try {
          const korekta = await generuj({
            ...ustawieniaModelu,
            polecenie: `[CORRECTION — the previous attempt failed this, fix it first]\n${pomiar.korekta.join('\n')}\n\n${pelnePolecenie}`,
            obrazy: obrazyDoModelu,
            szerokosc: zrodlo.naturalWidth,
            wysokosc: zrodlo.naturalHeight,
          })
          const src = await dopasujFormatDoObrazu(korekta.obrazUrl, zrodlo.naturalWidth, zrodlo.naturalHeight)
          wynik = { ...korekta, obrazUrl: src, kosztUSD: (wynik.kosztUSD ?? 0) + (korekta.kosztUSD ?? 0) }
          pomiar = await ocenPomiar(src)
        } catch (e) {
          console.warn('[canvas] korekta rozmiaru nieudana', e)
        }
      }
      dodajZeZrodla(wynik.obrazUrl, nazwa, 'wynik', zrodlo)

      let gotowy = {
        ...wynik,
        nazwa,
        opis: plan?.plan || opiszZmiane(projekt.tekst, projekt.pineski, zrodlo),
      }
      setStanGeneracji({ faza: 'sprawdza', wynik: gotowy })

      // Kontroler widzi tylko zdjęcie docelowe przed i po. Pineska leżąca na zdjęciu
      // referencyjnym ma współrzędne względem TEGO zdjęcia — podane kontrolerowi bez
      // tej informacji kazały mu szukać obiektu w środku kadru docelowego.
      const uchwytyKontroli = projekt.pineski
        .map((p, i) => {
          const nrObrazu = obrazy.findIndex(w => w.id === p.layerId) + 1 || 1
          const nazwaPineski = etykietaPineski(p, i + 1)
          if (nrObrazu !== 1) {
            return `Pin ${i + 1} "${nazwaPineski}" — on a REFERENCE photo that is not shown here (the object that was brought in); its coordinates say nothing about where it should appear in the result`
          }
          const rola = uklad.role[i + 1]
          const znaczenie =
            rola === 'DESTINATION'
              ? 'the object should stand HERE in the result'
              : rola === 'SOURCE'
                ? 'the object stood here before'
                : 'a point on this photo'
          const miejsce = plan?.miejsca?.[i + 1]
          return `Pin ${i + 1} "${nazwaPineski}" — on this photo${miejsce ? `, ${miejsce}` : ''}: ${znaczenie}`
        })
        .join('\n')

      const obszaryKontroli = [obszarCelu, obszarZrodla].filter((o): o is Prostokat => Boolean(o))
      const [ocena, nakladka, bezZmian] = await Promise.all([
        sprawdzWynik({
          zadanie: projekt.tekst,
          przed: (await zmniejszDoAnalizy(zrodlo.src)) || zrodlo.src,
          wynik: wynik.obrazUrl,
          intencja: trybAgenta,
          plan: plan?.plan,
          uchwyty: uchwytyKontroli,
        }),
        plotnoZObszarami ? wykryjNakladke(wynik.obrazUrl, zrodlo.src, obszaryKontroli) : Promise.resolve(null),
        czyBezZmian(wynik.obrazUrl, zrodlo.src),
      ])

      // Piksele rozstrzygają pewniej niż ocena modelu: różowa plama w obszarze
      // to ślad nakładki, niezależnie od tego, co zobaczył kontroler.
      const ocenaKoncowa = bezZmian
        ? {
            wykonane: false,
            znaczniki: false,
            wklejone: false,
            kosztTokenow: ocena?.kosztTokenow ?? 0,
            ocena:
              'Model oddał zdjęcie praktycznie bez zmian. Nazwij obiekty w pineskach i opisz zmianę konkretniej, np. „przenieś domek spod pineski 1 na ścieżkę pod pineską 2”.',
          }
        : nakladka?.wykryto
        ? {
            wykonane: ocena?.wykonane ?? true,
            znaczniki: true,
            wklejone: ocena?.wklejone ?? false,
            kosztTokenow: ocena?.kosztTokenow ?? 0,
            ocena:
              `W zaznaczonym obszarze zostało ok. ${Math.round(nakladka.udzial * 100)}% różowej nakładki — ` +
              `warto wygenerować ponownie. ${ocena?.ocena ?? ''}`.trim(),
          }
        : ocena

      // Drugi przebieg (polish pass Studia Zdjęć, poz. 26) — tylko gdy kontrola
      // widzi wklejkę: szew, obwódkę, inne światło albo ziarno, brak cienia.
      // Model dostaje wynik i czysty oryginał jako wzorzec; generuje cały kadr, bez masek.
      let ocenaPoPoprawce = ocenaKoncowa
      const warto = ['wstaw', 'przenies', 'zamien', 'postac', 'ubranie'].includes(trybAgenta)
      if (DRUGI_PRZEBIEG && ocenaKoncowa?.wklejone && !bezZmian && warto) {
        setStanGeneracji({ faza: 'poprawia', wynik: gotowy })
        try {
          const pinElementu = pinZrodlowy ?? pinDocelowy
          const element =
            operacjaAgenta === 'face_swap'
              ? 'the replaced face'
              : pinElementu
                ? `the edited element ("${etykietaPineski(pinElementu, projekt.pineski.indexOf(pinElementu) + 1)}")`
                : 'the edited element'
          const poprawka = await generuj({
            polecenie: promptPoprawki(element),
            system: SYSTEM_POPRAWKI,
            temperatura: 0.2,
            klasa: ustawieniaModelu.klasa,
            obrazy: [wynik.obrazUrl, await konwertujNaDataUrl(zrodlo.src)],
            szerokosc: zrodlo.naturalWidth,
            wysokosc: zrodlo.naturalHeight,
          })
          const src = await dopasujFormatDoObrazu(poprawka.obrazUrl, zrodlo.naturalWidth, zrodlo.naturalHeight)
          dodajZeZrodla(src, `${nazwa}_poprawka`, 'wynik', zrodlo)
          gotowy = {
            ...gotowy,
            obrazUrl: src,
            nazwa: `${nazwa}_poprawka`,
            kosztUSD: (gotowy.kosztUSD ?? 0) + (poprawka.kosztUSD ?? 0),
          }
          ocenaPoPoprawce = {
            ...ocenaKoncowa,
            wklejone: false,
            ocena: `${ocenaKoncowa.ocena} Wyglądało na wklejone, więc drugi przebieg dopasował światło, cień i ziarno — obie wersje leżą na płótnie.`.trim(),
          }
        } catch (e) {
          console.warn('[canvas] drugi przebieg nieudany', e)
        }
      }

      if (ocenaPoPoprawce && pomiar?.cel) {
        const zmierzone = `Pomiar: obiekt ma ${Math.round(pomiar.szer)}% szerokości kadru (cel ok. ${Math.round(pomiar.cel)}%)${pomiar.bledy.length ? ` — nadal ${pomiar.bledy.join('; ')}` : ''}.`
        ocenaPoPoprawce = {
          ...ocenaPoPoprawce,
          wykonane: ocenaPoPoprawce.wykonane && !pomiar.bledy.length,
          ocena: `${ocenaPoPoprawce.ocena} ${zmierzone}`.trim(),
        }
      }

      setStanGeneracji({ faza: 'gotowe', wynik: gotowy, ocena: ocenaPoPoprawce ?? undefined })
    } catch (e) {
      setStanGeneracji({
        faza: 'blad',
        tresc: e instanceof Error ? e.message : 'Wystąpił błąd podczas generacji obrazu.',
      })
    } finally {
      refGeneruje.current = false
    }
  }, [
    warstwaZrodlowa,
    obrazyWejsciowe,
    polecenie,
    intencja,
    projekt.tekst,
    projekt.pineski,
    projekt.warstwy,
    dodajZeZrodla,
  ])

  /**
   * Wybór pineski z listy w czacie — z dojazdem widoku.
   *
   * Pineska wybrana z listy potrafi leżeć pod panelem czatu albo poza
   * ekranem; karta wskazywała wtedy coś, czego nie widać. Jeśli pinezka
   * nie mieści się w wolnym polu między dockiem a czatem, widok płynnie
   * dojeżdża tak, żeby stanęła na środku tego pola.
   */
  const refDojazd = useRef<number | null>(null)

  // I w drugą stronę: otwarta karta pineski zamyka menu i panel warstw
  useEffect(() => {
    if (!wybranaPineska) return
    setMenuDodawania(false)
    setPanelWarstw(false)
  }, [wybranaPineska])
  const pokazPineske = useCallback(
    (id: string | null) => {
      setWybranaPineska(id)
      const p = projekt.pineski.find(x => x.id === id)
      const w = projekt.warstwy.find(x => x.id === p?.layerId)
      if (!p || !w || !rozmiar.szer) return

      const poz = pozycjaPineski(p, w)
      const ekranX = widok.x + poz.x * widok.zoom
      const ekranY = widok.y + poz.y * widok.zoom
      const lewo = 72
      const prawo = rozmiar.szer - 412
      // Pinezka ma być widoczna ORAZ mieć obok miejsce na kartę (268 px + odstęp)
      const KARTA = 268 + 24
      const lebekX = ekranX + PRZESUNIECIE_LEBKA.x
      const widoczna = ekranX > lewo + 40 && ekranX < prawo - 40 && ekranY > 70 && ekranY < rozmiar.wys - 40
      const kartaSieMiesci = prawo - lebekX >= KARTA || lebekX - KARTA >= lewo
      if ((widoczna && kartaSieMiesci) || prawo - lewo < 200) return

      // Cel: pinezka z kartą po prawej wyśrodkowane razem w wolnym polu;
      // przy wąskim polu — sama pinezka na środku.
      const celX = prawo - lewo > KARTA + 80 ? lewo + (prawo - lewo - KARTA) / 2 : (lewo + prawo) / 2
      const start = { ...widok }
      const dx = celX - ekranX
      const dy = rozmiar.wys / 2 - ekranY
      const t0 = performance.now()
      const CZAS = 260
      if (refDojazd.current) cancelAnimationFrame(refDojazd.current)
      const krok = (t: number) => {
        const u = Math.min(1, (t - t0) / CZAS)
        const e = 1 - Math.pow(1 - u, 3)
        setWidok({ ...start, x: start.x + dx * e, y: start.y + dy * e })
        refDojazd.current = u < 1 ? requestAnimationFrame(krok) : null
      }
      refDojazd.current = requestAnimationFrame(krok)
    },
    [projekt.pineski, projekt.warstwy, rozmiar, widok],
  )

  /**
   * Karta pineski — pływa obok łebka pinezki, nie obok szpica.
   *
   * Domyślnie po prawej; gdy z prawej nie ma miejsca (krawędź albo czat),
   * przeskakuje na lewo. W pionie trzyma się ekranu, a ogonek zawsze
   * celuje w łebek — nawet gdy karta musiała się przesunąć.
   */
  const kartaPozycja = useMemo(() => {
    const p = projekt.pineski.find(x => x.id === wybranaPineska)
    const w = projekt.warstwy.find(x => x.id === p?.layerId)
    if (!p || !w) return null
    const poz = pozycjaPineski(p, w)
    const numer = projekt.pineski.indexOf(p) + 1

    const lebekX = widok.x + poz.x * widok.zoom + PRZESUNIECIE_LEBKA.x
    const lebekY = widok.y + poz.y * widok.zoom + PRZESUNIECIE_LEBKA.y
    const SZER_KARTY = 268
    const WYS_KARTY = 280
    const ODSTEP = 24
    // Pas zajęty przez rozwinięty czat po prawej (380 px + margines) i dock po lewej
    const PRAWY_PAS = 412
    const LEWY_PAS = 72

    const miejsceZPrawej = rozmiar.szer - PRAWY_PAS - (lebekX + ODSTEP)
    const naLewo = miejsceZPrawej < SZER_KARTY && lebekX - ODSTEP - SZER_KARTY > LEWY_PAS
    const left = naLewo ? lebekX - ODSTEP - SZER_KARTY : lebekX + ODSTEP
    const maksTop = Math.max(12, (rozmiar.wys || 800) - WYS_KARTY - 12)
    const top = Math.min(maksTop, Math.max(12, lebekY - 34))
    const ogonY = Math.min(WYS_KARTY - 20, Math.max(18, lebekY - top))

    return {
      pineska: p,
      warstwa: w,
      numer,
      left,
      top,
      naLewo,
      ogonY,
    }
  }, [wybranaPineska, projekt, widok, rozmiar])

  return (
    <div ref={refRoot} className="absolute inset-0 w-full h-full min-h-0 max-h-full overflow-hidden select-none">
      <input
        ref={refPlik}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          wstawPliki([...(e.target.files ?? [])], 'dysk')
          e.target.value = ''
          setMenuDodawania(false)
        }}
      />

      {/* ══ PŁÓTNO ══ */}
      <Plotno
        warstwy={projekt.warstwy}
        pineski={projekt.pineski}
        wybranaWarstwa={wybranaWarstwa}
        wybranaPineska={wybranaPineska}
        narzedzie={narzedzie}
        widok={widok}
        onWidok={setWidok}
        onWybierzWarstwe={setWybranaWarstwa}
        onWybierzPineske={setWybranaPineska}
        onZmienWarstwe={zmienWarstwe}
        onPrzesunPineske={(id, x, y) => zmienPineske(id, { normalizedX: x, normalizedY: y, analiza: undefined })}
        onWbijPineske={wbijPineske}
        onUpuscPliki={pliki => wstawPliki(pliki, 'upuszczenie')}
        ramka={projekt.ramka}
        onZmienRamke={ramka => setProjekt(p => ({ ...p, ramka }))}
        intencja={intencja}
        onOtworzDodawanie={() => refPlik.current?.click()}
        onMenuWarstwy={(id, x, y) => setMenuWarstwy({ id, x, y })}
      />

      {/* ══ Menu kontekstowe zdjęcia (prawy klik) ══ */}
      {/* ══ Pływający pasek akcji AI nad zdjęciem (prawy klik) ══ */}
      {(menuWarstwy || akcjaAI) &&
        (() => {
          const id = menuWarstwy?.id ?? wybranaWarstwa
          const w = projekt.warstwy.find(x => x.id === id)
          if (!w) return null
          const lewo = widok.x + w.x * widok.zoom
          const gora = widok.y + w.y * widok.zoom
          return (
            <div
              role="toolbar"
              aria-label="Szybkie akcje AI"
              onPointerDown={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
              className="absolute z-50 flex items-center gap-1 rounded-2xl border border-foreground/10 bg-card/85 p-1 shadow-[0_12px_32px_-8px_hsl(0_0%_0%/0.35)] backdrop-blur-xl"
              style={{ left: Math.max(8, lewo), top: Math.max(8, gora - 52) }}
            >
              {AKCJE_AI.map(({ id: aid, etykieta, ikona: Ikona }) => (
                <button
                  key={aid}
                  type="button"
                  disabled={Boolean(akcjaAI)}
                  onClick={() => uruchomAkcjeAI(w.id, aid)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
                    akcjaAI === aid ? 'bg-foreground/[0.08] text-foreground' : 'text-foreground hover:bg-foreground/[0.07]',
                    akcjaAI && akcjaAI !== aid && 'opacity-40',
                  )}
                >
                  {akcjaAI === aid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ikona className="h-3.5 w-3.5 text-muted-foreground" />}
                  {etykieta}
                </button>
              ))}
            </div>
          )
        })()}

      {menuWarstwy &&
        (() => {
          const w = projekt.warstwy.find(x => x.id === menuWarstwy.id)
          if (!w) return null
          const pozycje: { akcja: Parameters<typeof akcjaWarstwy>[1]; etykieta: string; niebezpieczna?: boolean }[] = [
            { akcja: 'duplikuj', etykieta: 'Duplikuj' },
            { akcja: 'pobierz', etykieta: 'Pobierz' },
            { akcja: 'wierzch', etykieta: 'Na wierzch' },
            { akcja: 'spod', etykieta: 'Na spód' },
            { akcja: 'blokada', etykieta: w.locked ? 'Odblokuj' : 'Zablokuj' },
            { akcja: 'ukryj', etykieta: 'Ukryj' },
            { akcja: 'usun', etykieta: 'Usuń zdjęcie', niebezpieczna: true },
          ]
          return (
            <div
              role="menu"
              aria-label={`Opcje zdjęcia ${w.name}`}
              onPointerDown={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
              className="fixed z-50 min-w-[170px] rounded-xl border border-foreground/10 bg-card/90 p-1 shadow-[0_12px_32px_-8px_hsl(0_0%_0%/0.35)] backdrop-blur-xl"
              style={{
                left: Math.min(menuWarstwy.x, window.innerWidth - 190),
                top: Math.min(menuWarstwy.y, window.innerHeight - 290),
              }}
            >
              <p className="truncate px-2.5 pb-1 pt-1.5 text-[10px] font-medium text-muted-foreground">{w.name}</p>
              {pozycje.map(({ akcja, etykieta, niebezpieczna }) => (
                <button
                  key={akcja}
                  role="menuitem"
                  type="button"
                  onClick={() => akcjaWarstwy(w.id, akcja)}
                  className={cn(
                    'flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors',
                    niebezpieczna
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground hover:bg-foreground/[0.07]',
                  )}
                >
                  {etykieta}
                </button>
              ))}
            </div>
          )
        })()}

      {/* ══ Karta zaznaczonego obiektu na płótnie ══ */}
      {kartaPozycja && (
        <div
          key={kartaPozycja.pineska.id}
          className="absolute z-30 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: kartaPozycja.left,
            top: kartaPozycja.top,
            transformOrigin: kartaPozycja.naLewo ? 'right top' : 'left top',
          }}
          onPointerDown={e => e.stopPropagation()}
        >
          {/* Ogonek wskazujący łebek pinezki — poza szkłem, bo szkło przycina
              wszystko, co wystaje poza jego obrys (contain: paint). */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-3 w-3 rotate-45 rounded-[2px] border border-foreground/[0.08]"
            style={{
              top: kartaPozycja.ogonY - 6,
              [kartaPozycja.naLewo ? 'right' : 'left']: -6,
              background: 'hsl(var(--card) / 0.92)',
            }}
          />
          <KartaPineski
            pineska={kartaPozycja.pineska}
            numer={kartaPozycja.numer}
            warstwa={kartaPozycja.warstwa}
            onNazwa={label => zmienPineske(kartaPozycja.pineska.id, { label })}
            onUsun={() => usunPineske(kartaPozycja.pineska.id)}
            onChron={() =>
              zmienPineske(kartaPozycja.pineska.id, { chroniona: !kartaPozycja.pineska.chroniona })
            }
            onZamknij={() => setWybranaPineska(null)}
          />
        </div>
      )}

      {/* ══ DOCK NARZĘDZI PO LEWYM BOKU (Nextbyte Liquid Glass) ══ */}
      <div className="p2 pointer-events-none absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2">
        <div className="p2-karta p2-pow-1 pointer-events-auto relative flex flex-col items-center gap-1 p-1.5">
          {/* Wybór i przesuwanie (V) */}
          <Narzedzie
            tytul="Wybór i przesuwanie (V)"
            aktywne={narzedzie === 'wybor'}
            onClick={() => setNarzedzie('wybor')}
          >
            <MousePointer2 className="h-4 w-4" />
          </Narzedzie>

          {/* Ramka obszaru roboczego (R) */}
          <Narzedzie
            tytul="Obszar roboczy (R) — zaznacz pole ramką (Lovart mask)"
            aktywne={narzedzie === 'ramka'}
            onClick={() => setNarzedzie('ramka')}
            odznaka={projekt.ramka ? 1 : undefined}
          >
            <Square className="h-4 w-4" />
          </Narzedzie>

          {/* Pineska (P) — zaznacz obiekt (do 10 pinesek) */}
          <Narzedzie
            tytul="Pineska — wskaż obiekt (P)"
            aktywne={narzedzie === 'pineska'}
            onClick={() => setNarzedzie('pineska')}
            odznaka={projekt.pineski.length || undefined}
          >
            <Pin className="h-4 w-4" />
          </Narzedzie>

          {/* Przesuwanie widoku (H) */}
          <Narzedzie
            tytul="Przesuwanie widoku (H)"
            aktywne={narzedzie === 'reka'}
            onClick={() => setNarzedzie('reka')}
          >
            <Hand className="h-4 w-4" />
          </Narzedzie>

          <span className="my-0.5 h-px w-5 bg-[hsl(var(--foreground)/0.1)]" />

          {/* Dodaj zdjęcie & Sceny demo */}
          <Narzedzie
            tytul="Dodaj zdjęcie lub załaduj demo"
            aktywne={menuDodawania}
            onClick={() => {
              // Jedno pływające okno naraz — karta pineski ustępuje menu
              setWybranaPineska(null)
              setMenuDodawania(v => !v)
            }}
          >
            <IkonaObrazu className="h-4 w-4" />
          </Narzedzie>

          {/* Lista zdjęć / warstw */}
          <Narzedzie
            tytul="Lista zdjęć na płótnie"
            aktywne={panelWarstw}
            onClick={() => {
              setWybranaPineska(null)
              setPanelWarstw(v => !v)
            }}
            odznaka={projekt.warstwy.length || undefined}
          >
            <Layers className="h-4 w-4" />
          </Narzedzie>

          {/* Reset / Dopasuj widok */}
          <Narzedzie
            tytul="Dopasuj widok (Reset zoom)"
            onClick={() => setWidok({ x: 90, y: 70, zoom: 0.7 })}
          >
            <Maximize className="h-4 w-4" />
          </Narzedzie>
        </div>

        {/* Menu dodawania źródeł — obok docka, nie w nim: szkło docka przycina
            wszystko, co wystaje poza jego obrys (contain: paint). Pozycję
            trzyma zewnętrzny div, bo `.is-glass .nb-szklo` wymusza
            position: relative i zdjęłoby `absolute` ze szklanego elementu. */}
        {menuDodawania && (
          <div className="pointer-events-auto absolute left-full top-1/2 z-40 ml-2.5 w-64 -translate-y-1/2">
          <div className="p2-karta p2-pow-1 overflow-hidden p-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
              Własne zdjęcia
            </div>
            <PozycjaMenu
              ikona={<Upload className="h-3.5 w-3.5" />}
              tytul="Z komputera"
              opis="wybierz pliki graficzne"
              onClick={() => refPlik.current?.click()}
            />
            <PozycjaMenu
              ikona={<IkonaObrazu className="h-3.5 w-3.5" />}
              tytul="Ze schowka (Ctrl+V)"
              opis="wklej bezpośrednio"
              onClick={wstawZeSchowka}
            />
            <PozycjaMenu
              ikona={<Link2 className="h-3.5 w-3.5" />}
              tytul="Z adresu URL"
              opis="wklej link do grafiki"
              onClick={wstawZAdresu}
            />
          </div>
          </div>
        )}
      </div>

      {/* ══ PŁYWAJĄCY CHAT W STYLU LIQUID GLASS (PO PRAWEJ STRONIE) ══ */}
      <CzatCanvas
        pineski={projekt.pineski}
        warstwy={projekt.warstwy}
        tekst={projekt.tekst}
        onTekst={tekst => setProjekt(p => ({ ...p, tekst }))}
        onWybierzPineske={pokazPineske}
        wybranaPineska={wybranaPineska}
        onUsunPineske={usunPineske}
        onZmienNazwePineski={(id, label) => zmienPineske(id, { label })}
        onWlaczNarzędziePineska={() => setNarzedzie('pineska')}
        onGeneruj={uruchomGeneracje}
        onOdpowiedzRol={opcja => {
          odpowiedzRol.current = { odcisk: odciskPinesek(projekt.pineski), opcja }
          uruchomGeneracje()
        }}
        stanGeneracji={stanGeneracji}
        powodBlokady={powodBlokady}
        trwa={['planuje', 'trwa', 'sprawdza', 'poprawia', 'koryguje'].includes(stanGeneracji.faza)}
        intencja={intencja}
        uwagi={uwagi}
        podgladPolecenia={ostatniPrompt || `[PODGLĄD WSTĘPNY — bez danych reżysera (światło, rozmiar, zbliżenia) i bez trybu dwóch zadań. Prawdziwy prompt pojawi się tu po „Generuj”.]\n\n${polecenie}`}
        onWstawNaPlotno={(url, nazwa) => dodajZeZrodla(url, nazwa, 'wynik', warstwaZrodlowa || undefined)}
      />

      {/* ══ Panel warstw (wysuwany) ══ */}
      {panelWarstw && (
        <div className="p2 absolute left-20 top-4 z-20 w-64">
          <div className="p2-karta p2-pow-1 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="px-3 pb-1.5 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground/45 flex items-center justify-between">
              <span>Zdjęcia na płótnie ({projekt.warstwy.length})</span>
              <button
                onClick={() => setPanelWarstw(false)}
                className="text-foreground/30 hover:text-foreground text-[10px]"
              >
                Zamknij
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-2 scrollbar-none space-y-1">
              {projekt.warstwy.length === 0 && (
                <p className="px-2 py-3 text-[11px] leading-relaxed text-foreground/30 text-center">
                  Pusto. Dodaj zdjęcie przyciskiem na pasku narzędzi.
                </p>
              )}
              {[...projekt.warstwy].reverse().map(w => (
                <div
                  key={w.id}
                  onClick={() => setWybranaWarstwa(w.id)}
                  className={cn(
                    'group flex cursor-default items-center gap-2 rounded-xl p-1.5 transition-colors border',
                    wybranaWarstwa === w.id
                      ? 'border-foreground/15 bg-foreground/[0.06]'
                      : 'border-transparent hover:bg-foreground/5',
                  )}
                >
                  <img src={w.src} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-border/10" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-foreground/80">{w.name}</div>
                    <div className="text-[9px] text-foreground/35">
                      {w.naturalWidth} × {w.naturalHeight} px
                    </div>
                  </div>
                  <IkonaWarstwy
                    tytul={w.visible ? 'Ukryj' : 'Pokaż'}
                    onClick={() => zmienWarstwe(w.id, { visible: !w.visible })}
                  >
                    {w.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </IkonaWarstwy>
                  <IkonaWarstwy
                    tytul={w.locked ? 'Odblokuj' : 'Zablokuj'}
                    onClick={() => zmienWarstwe(w.id, { locked: !w.locked })}
                  >
                    {w.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  </IkonaWarstwy>
                  <IkonaWarstwy tytul="Usuń zdjęcie" onClick={() => usunWarstwe(w.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IkonaWarstwy>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Zoom Indicator ══ */}
      <div className="p2 pointer-events-none absolute bottom-4 left-4 z-20"><div className="p2-kontrolka px-2 py-0.5 font-mono text-[11px] p2-cichy">
        {Math.round(widok.zoom * 100)}%
      </div></div>
    </div>
  )
}

/* ── Drobiazgi narzędziowe ───────────────────────────────────────── */

function Narzedzie({
  children,
  tytul,
  aktywne,
  odznaka,
  onClick,
}: {
  children: React.ReactNode
  tytul: string
  aktywne?: boolean
  odznaka?: number
  onClick: () => void
}) {
  return (
    <button
      title={tytul}
      onClick={onClick}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-[10px] transition-all duration-150 active:scale-95',
        aktywne
          ? 'bg-foreground/[0.09] text-foreground'
          : 'p2-cichy hover:bg-[hsl(var(--foreground)/0.08)] hover:text-[hsl(var(--foreground))]',
      )}
    >
      {children}
      {odznaka !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
          {odznaka}
        </span>
      )}
    </button>
  )
}

function PozycjaMenu({
  ikona,
  tytul,
  opis,
  onClick,
}: {
  ikona: React.ReactNode
  tytul: string
  opis: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-foreground/10"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/8 text-foreground/75">
        {ikona}
      </span>
      <span className="min-w-0">
        <span className="block text-[11.5px] font-semibold text-foreground/90">{tytul}</span>
        <span className="block truncate text-[9.5px] text-foreground/40">{opis}</span>
      </span>
    </button>
  )
}

function IkonaWarstwy({
  children,
  onClick,
  tytul,
}: {
  children: React.ReactNode
  onClick: () => void
  tytul: string
}) {
  return (
    <button
      title={tytul}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className="shrink-0 text-foreground/35 opacity-60 transition-opacity hover:text-foreground group-hover:opacity-100 p-0.5"
    >
      {children}
    </button>
  )
}
