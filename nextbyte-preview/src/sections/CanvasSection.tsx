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
  Square,
  Trash2,
  Unlock,
  Upload,
  Wand2,
  ZoomIn,
  ZoomOut,
  Eraser,
  Loader2,
  Copy,
  ClipboardCopy,
  Download,
  ArrowUpToLine,
  ArrowDownToLine,
  Paintbrush,
  ArrowLeft,
  Scissors,
  X,
  ImagePlus,
  Type,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import '@/sections/canvas/przytulny.css'
import { useMotywCanvasa } from '@/sections/canvas/motyw-canvasa'
import { PasekAkcji, type AkcjaPaska } from '@/sections/canvas/PasekAkcji'
import { Prompter } from '@/sections/canvas/Prompter'
import { MenuGeneratora } from '@/sections/canvas/MenuGeneratora'
import { wykonajInpainting, promptErasera } from '@/sections/canvas/inpainting'
import { wykonajGenerowanie } from '@/sections/canvas/generowanie'
import { wykonajGeneracjeZReferencji } from '@/sections/canvas/referencje'
import { KartaPineski } from '@/sections/canvas/KartaPineski'
import { PRZESUNIECIE_LEBKA } from '@/sections/canvas/ZnacznikPineski'
import { CzatCanvas, type ModelObrazu } from '@/sections/canvas/CzatCanvas'
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
  opiszPozeOsoby,
} from '@/sections/canvas/dostawca'
import { Plotno } from '@/sections/canvas/Plotno'
import {
  INTENCJE,
  type Intencja,
  OPERACJE_POSTACI,
  idZrodelNaPlotnie,
  operacjaZIntencji,
  wykryjIntencje,
  zbudujPolecenie,
  zbudujZadanieModelu,
  dotyczyCalejOsoby,
  przepiszNaPrzesuniecie,
} from '@/sections/canvas/polecenia'
import { SYSTEM_POPRAWKI, promptPoprawki } from '@/sections/canvas/prompty/operacje/character-swap-studio'
import { trybPromptuPostaci } from '@/sections/canvas/prompty/postac-pdf'
import { przygotujZAgentem } from '@/sections/canvas/nowy'
import { narysujMapeMiejsc, narysujObszary, zlozWklejke } from '@/sections/canvas/mapa-miejsc'
import { narysujKropki } from './canvas/kropki'
import { wytnijZblizenieTwarzy } from './canvas/wytnij-twarz'
import { ramkaRzeczyPodPinem, referencjaWokolRzeczy, zbudujZblizenia, type Zblizenie } from './canvas/zblizenia'
import { wczytajZPamieci, zapiszWPamieci } from './canvas/pamiec'
import { porownanieZKotwica, rozmiarZPomiaru } from './canvas/rezyser'
import { policzWycinek, wytnijWycinek, zlozWycinek } from './canvas/zloz-wycinek'
import { dopasujZiarno } from '@/sections/canvas/dopasuj-ziarno'
import { SZKIC_SCENY_SWAP, rozmyjDoSzkicu } from '@/sections/canvas/szkic-sceny'
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
  wytnijPodgladPineski,
  zmniejszDoAnalizy,
  type Narzedzie,
  type Pociagniecie,
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
/** EKSPERYMENT: wstawianie z drugiego zdjęcia — na scenie cienka ramka (miejsce + rozmiar z pomiaru), „umieść obiekt w ramce, wynik bez ramki” (wzorzec Google / Finegrain) */
const TRANSFER_Z_RAMKA = false
/** EKSPERYMENT: zamiast pustej ramki — przeskalowany wycinek obiektu wklejony w ramkę jako szkic rozmiaru i miejsca (model go przerysowuje) */
const TRANSFER_Z_WKLEJKA = true
/** Inteligentne zbliżenia w pobliżu pinesek jako dodatkowe obrazy dla modelu (wszystkie tryby). false = szybkie cofnięcie. */
const ZBLIZENIA_W_POBLIZU_PINEZKI = true
/**
 * Skala: odpowiada MODEL (brick skali z PDF Studia w skladaj.ts), a reżyser (Gemini) podaje tylko co jest czym i gdzie —
 * bez rozmiaru w %, skali, widoku i ułożenia. Szybkie cofnięcie: false (wraca pomiar z kotwic i linie analizy).
 */
const SKALA_OD_MODELU = true
/** Referencja obiektu z drugiego zdjęcia = wycinek wokół rzeczy (szybkie cofnięcie: false). */
const REFERENCJA_WOKOL_RZECZY = true
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

export function CanvasSection({ onWyjdz }: { onWyjdz?: () => void } = {}) {
  const { jasny: jasnyMotyw, przelacz: przelaczMotyw } = useMotywCanvasa()
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
  // Model zwykłych edycji — pamiętany między sesjami. Tryby zablokowane (postać, Gemini 3.1) mają własny.
  const [modelObrazu, setModelObrazu] = useState<ModelObrazu>(() => {
    try {
      const zapisany = localStorage.getItem('canvas-model-obrazu')
      return zapisany === 'lite' || zapisany === 'nb2' || zapisany === 'pro' || zapisany === 'gptimage2' ? zapisany : 'nb2'
    } catch { return 'nb2' }
  })
  // Wersja promptów: 'studio' (zdanie użytkownika + bloki z PDF Studia Zdjęć) albo 'nasz' (prompty z pinezkami, rozmiarami i regułami). Domyślnie Studio — do porównania.
  // Zawsze logika Studia (opcja „Stara” usunięta).
  const trybPromptow = 'studio' as const
  const zmienTrybPromptow = () => undefined
  const studio = true
  const hybryda = studio // pomiar skali i osadzenia od Gemini działa w Studiu przy wstawianiu z drugiego zdjęcia
  const zmienModelObrazu = (m: ModelObrazu) => {
    setModelObrazu(m)
    try { localStorage.setItem('canvas-model-obrazu', m) } catch { /* brak dostępu do pamięci — wybór działa do końca sesji */ }
  }
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
  /** zaznaczenie wielu zdjęć (Shift+klik, ramka, Ctrl+A); pusta lista = zwykłe zaznaczenie jednego zdjęcia */
  const [zaznaczone, setZaznaczone] = useState<string[]>([])
  const wielu = useMemo(
    () => projekt.warstwy.filter(w => zaznaczone.includes(w.id) && !w.generator && w.src),
    [projekt.warstwy, zaznaczone],
  )
  const wieluAktywne = wielu.length >= 2
  useEffect(() => {
    if (zaznaczone.length && (!wybranaWarstwa || !zaznaczone.includes(wybranaWarstwa))) setZaznaczone([])
  }, [wybranaWarstwa, zaznaczone])
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
  /** Zoom wokół środka płótna (okno minus prawy panel czatu), żeby widok „nie uciekał". */
  const zmienZoom = (czynnik: number) => {
    setWidok(w => {
      const zoom = Math.min(6, Math.max(0.05, w.zoom * czynnik))
      const cx = (window.innerWidth - 380) / 2
      const cy = window.innerHeight / 2
      const k = zoom / w.zoom
      return { x: cx - (cx - w.x) * k, y: cy - (cy - w.y) * k, zoom }
    })
  }

  /** Dopasuj widok: obejmij wszystkie widoczne zdjęcia z marginesem, bez nachodzenia na panele. */
  const dopasujWidok = () => {
    const widoczne = projekt.warstwy.filter(w => w.visible)
    if (widoczne.length === 0) return setWidok({ x: 90, y: 70, zoom: 0.7 })
    const x0 = Math.min(...widoczne.map(w => w.x))
    const y0 = Math.min(...widoczne.map(w => w.y))
    const x1 = Math.max(...widoczne.map(w => w.x + w.width))
    const y1 = Math.max(...widoczne.map(w => w.y + w.height))
    const dostepnaSzer = window.innerWidth - 380 - 120
    const dostepnaWys = window.innerHeight - 180
    const zoom = Math.min(1, Math.max(0.05, Math.min(dostepnaSzer / (x1 - x0), dostepnaWys / (y1 - y0))))
    setWidok({
      x: 80 + (dostepnaSzer - (x1 - x0) * zoom) / 2 - x0 * zoom,
      y: 90 + (dostepnaWys - (y1 - y0) * zoom) / 2 - y0 * zoom,
      zoom,
    })
  }

  const [stanGeneracji, setStanGeneracji] = useState<StanGeneracji>({ faza: 'bezczynny' })
  // Inpainting pędzlem i generator (pusta ramka „Image Generator”)
  const [maska, setMaska] = useState<Pociagniecie[]>([])
  const [srednicaPedzla, setSrednicaPedzla] = useState(0.05)
  const [menuGeneratora, setMenuGeneratora] = useState(false)
  const [trwaPrompter, setTrwaPrompter] = useState(false)
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
            setProjekt({ ...wczytany, warstwy: wczytany.warstwy.filter(w => !w.duch).map(w => (w.generuje ? { ...w, generuje: false } : w)), ramka: wczytany.ramka ?? null })
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

  /**
   * Placeholder generowania: format wyniku jest znany z góry, więc obok zdjęcia od razu pojawia się ramka z animacją,
   * a gotowy wynik wypełnia ją w tym samym miejscu (zamiast dopiero wtedy wskakiwać nowa warstwa).
   */
  const duchId = useRef<string | null>(null)
  const startDucha = useCallback((rozmiar: { width: number; height: number; y: number; naturalWidth: number; naturalHeight: number }, nazwa = 'Generuję…') => {
    const id = nowyId('w')
    duchId.current = id
    setProjekt(p => {
      const prawa = p.warstwy.reduce((m, x) => Math.max(m, x.x + x.width), 0)
      return {
        ...p,
        warstwy: [
          ...p.warstwy,
          {
            id,
            type: 'image' as const,
            src: '',
            x: p.warstwy.length === 0 ? 60 : prawa + 48,
            y: rozmiar.y,
            width: rozmiar.width,
            height: rozmiar.height,
            naturalWidth: rozmiar.naturalWidth,
            naturalHeight: rozmiar.naturalHeight,
            rotation: 0,
            name: nazwa,
            visible: true,
            locked: true,
            zrodlo: 'wynik' as const,
            generator: true,
            generuje: true,
            duch: true,
          },
        ],
      }
    })
  }, [])
  const usunDucha = useCallback(() => {
    const id = duchId.current
    duchId.current = null
    if (id) setProjekt(p => ({ ...p, warstwy: p.warstwy.filter(w => w.id !== id) }))
  }, [])

  const dodajZeZrodla = useCallback(
    (src: string, nazwa: string, zrodlo: ZrodloObrazu, wzorzec?: Warstwa) => {
      const obrazek = new Image()
      obrazek.crossOrigin = 'anonymous'
      // pierwszy wynik po starcie generacji wypełnia placeholder (i tylko on)
      const duch = zrodlo === 'wynik' ? duchId.current : null
      if (duch) duchId.current = null
      obrazek.onload = () => {
        setProjekt(p => {
          // jedna atomowa aktualizacja: placeholder istnieje → wypełniamy go w miejscu, w przeciwnym razie dodajemy nową warstwę
          if (duch && p.warstwy.some(w => w.id === duch)) {
            return {
              ...p,
              warstwy: p.warstwy.map(w =>
                w.id === duch
                  ? {
                      ...w,
                      src,
                      name: nazwa,
                      naturalWidth: obrazek.width,
                      naturalHeight: obrazek.height,
                      width: Math.round((obrazek.width / obrazek.height) * w.height),
                      generator: false,
                      generuje: false,
                      duch: false,
                      locked: false,
                    }
                  : w,
              ),
            }
          }
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
      // wyniku nie da się wczytać → placeholder nie może zostać z animacją na zawsze
      obrazek.onerror = () => {
        if (duch) setProjekt(p => ({ ...p, warstwy: p.warstwy.filter(w => w.id !== duch) }))
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

  const usunWarstwy = useCallback((ids: string[]) => {
    setProjekt(p => ({
      ...p,
      warstwy: p.warstwy.filter(w => !ids.includes(w.id)),
      pineski: p.pineski.filter(x => !ids.includes(x.layerId)),
    }))
    setWybranaWarstwa(s => (s && ids.includes(s) ? null : s))
    setZaznaczone([])
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
  // Edit text: prompter nad zdjęciem („co zmienić w napisie?”)
  const [edycjaTekstu, setEdycjaTekstu] = useState<string | null>(null)
  /** Quick edit: id zdjęcia, nad którym otwarty jest prompter (opis zmiany bez zamalowywania) */
  const [quickEdit, setQuickEdit] = useState<string | null>(null)
  const AKCJE_AI = useMemo(
    () => [
      { id: 'enhance', etykieta: 'Enhance', ikona: Wand2, skala: 1, prompt: 'Enhance this photograph: improve clarity, fine detail, dynamic range, contrast and colour so it looks like a higher-end camera took it. Keep every object, person, position, framing and the lighting direction exactly the same. Natural, photographic — no over-sharpening, no HDR look, no plastic skin.' },
      { id: 'upscale', etykieta: 'Upscale 2×', ikona: ZoomIn, skala: 2, prompt: 'Upscale this photograph to twice its resolution. Reconstruct crisp, natural fine detail (textures, edges, text) while keeping the content, composition, colours and lighting identical. No new objects, no style change.' },
      { id: 'beztla', etykieta: 'Usuń tło', ikona: Scissors, skala: 1, prompt: 'Remove the background of this photograph: keep the main subject(s) exactly as they are — same shape, colours, detail and sharpness — with clean, precise cut-out edges (fine hair, glass, thin parts included, no halo or fringe) and place them on a plain pure white background with a soft natural contact shadow. Change nothing about the subject itself.' },
    ],
    [],
  )
  const uruchomEdycjeTekstu = useCallback(
    async (warstwaId: string, instrukcja: string) => {
      const w = projekt.warstwy.find(x => x.id === warstwaId)
      if (!w || !instrukcja.trim() || akcjaAI) return
      setEdycjaTekstu(null)
      setAkcjaAI('tekst')
      startDucha(w, 'Edit text…')
      try {
        const polecenie = `Edit the text in this image as instructed: ${instrukcja.trim()}. Change ONLY that text. Match the original lettering exactly — same font style, weight, size, colour, kerning, perspective, surface, lighting, blur and grain — and keep every other pixel of the picture identical: same objects, people, layout, framing and colours. If the request is ambiguous, change the most prominent text. Spell the new text exactly as written, with correct letters and diacritics.`
        const wynik = await generuj({ polecenie, obrazy: [await konwertujNaDataUrl(w.src)], szerokosc: w.naturalWidth, wysokosc: w.naturalHeight })
        const src = await dopasujFormatDoObrazu(wynik.obrazUrl, w.naturalWidth, w.naturalHeight)
        dodajZeZrodla(src, `${w.name}_tekst`, 'wynik', w)
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Nie udało się zmienić tekstu.')
      } finally {
        usunDucha()
        setAkcjaAI(null)
      }
    },
    [projekt.warstwy, akcjaAI, dodajZeZrodla, startDucha, usunDucha],
  )
  /**
   * Quick edit: sam opis zmiany + zdjęcie jako referencja — bez maski i bez zamalowywania (do tego służy osobny „Inpaint”).
   * Zdjęcie idzie do modelu w całości, polecenie to zdanie użytkownika w ramie „zmień tylko to, reszta zostaje”.
   */
  const uruchomQuickEdit = useCallback(
    async (warstwaId: string, opis: string) => {
      const w = projekt.warstwy.find(x => x.id === warstwaId)
      if (!w || !opis.trim() || akcjaAI) return
      setQuickEdit(null)
      setAkcjaAI('quick')
      startDucha(w, 'Quick edit…')
      try {
        const polecenie = `Edit this photograph exactly as the request says: ${opis.trim()}. Change only what the request asks for; everything else stays exactly as it is — the same people with the same identity, the same objects, layout, camera angle, framing, colours, light and any text. The result is one real photograph with the same light, sharpness, grain and colour grade as the original, with no seams, halos or sticker look.`
        const wynik = await generuj({
          polecenie,
          obrazy: [await konwertujNaDataUrl(w.src)],
          szerokosc: w.naturalWidth,
          wysokosc: w.naturalHeight,
          model: modelObrazu === 'auto' ? undefined : modelObrazu,
        })
        const src = await dopasujFormatDoObrazu(wynik.obrazUrl, w.naturalWidth, w.naturalHeight)
        dodajZeZrodla(src, `${w.name}_edit`, 'wynik', w)
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Nie udało się wykonać Quick edit.')
      } finally {
        usunDucha()
        setAkcjaAI(null)
      }
    },
    [projekt.warstwy, akcjaAI, modelObrazu, dodajZeZrodla, startDucha, usunDucha],
  )
  const uruchomAkcjeAI = useCallback(
    async (warstwaId: string, akcjaId: string) => {
      const w = projekt.warstwy.find(x => x.id === warstwaId)
      const a = AKCJE_AI.find(x => x.id === akcjaId)
      if (!w || !a || akcjaAI) return
      setMenuWarstwy(null)
      setAkcjaAI(akcjaId)
      startDucha(w, `${a.etykieta}…`)
      try {
        const maks = 2048
        const k = Math.min(a.skala, maks / Math.max(w.naturalWidth, w.naturalHeight))
        const szer = Math.round(w.naturalWidth * Math.max(1, k))
        const wys = Math.round(w.naturalHeight * Math.max(1, k))
        const wynik = await generuj({ polecenie: a.prompt, obrazy: [await konwertujNaDataUrl(w.src)], szerokosc: szer, wysokosc: wys })
        const src = await dopasujFormatDoObrazu(wynik.obrazUrl, szer, wys, { skaluj: true })
        dodajZeZrodla(src, `${w.name}_${a.id}`, 'wynik', w)
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Nie udało się wykonać akcji.')
      } finally {
        usunDucha()
        setAkcjaAI(null)
      }
    },
    [projekt.warstwy, AKCJE_AI, akcjaAI, dodajZeZrodla, startDucha, usunDucha],
  )

  /** Akcja AI na każdym zaznaczonym zdjęciu po kolei (każde dostaje własny placeholder i własny wynik). */
  const [masowo, setMasowo] = useState(false)
  const uruchomAkcjeMasowo = useCallback(
    async (akcjaId: string) => {
      if (masowo) return
      setMasowo(true)
      try {
        for (const w of wielu) await uruchomAkcjeAI(w.id, akcjaId)
      } finally {
        setMasowo(false)
      }
    },
    [masowo, wielu, uruchomAkcjeAI],
  )

  const akcjaWarstwy = useCallback(
    (id: string, akcja: 'duplikuj' | 'kopiuj' | 'pobierz' | 'wierzch' | 'spod' | 'blokada' | 'ukryj' | 'usun') => {
      const w = projekt.warstwy.find(x => x.id === id)
      setMenuWarstwy(null)
      if (!w) return
      if (akcja === 'usun') return usunWarstwe(id)
      if (akcja === 'kopiuj') {
        // Kopia obrazu do schowka systemowego (PNG), do wklejenia w innej aplikacji lub z powrotem przez Ctrl+V
        const obraz = new Image()
        obraz.crossOrigin = 'anonymous'
        obraz.onload = () => {
          const c = document.createElement('canvas')
          c.width = obraz.naturalWidth
          c.height = obraz.naturalHeight
          c.getContext('2d')?.drawImage(obraz, 0, 0)
          c.toBlob(b => {
            if (b) void navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).catch(() => undefined)
          }, 'image/png')
        }
        obraz.src = w.src
        return
      }
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
        // Ramka całego obiektu — tylko do podglądu przy pineskach (pineska bywa wbita w skrawek, np. maskę auta).
        // Nie blokuje nazwy: nazwa pojawia się od razu, ramka dochodzi chwilę później.
        void ramkaRzeczyPodPinem(warstwa.src, normalizedX, normalizedY)
          .then(ramka => {
            if (!ramka) return
            setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === pineska.id ? { ...x, ramka } : x)) }))
          })
          .catch(() => undefined)
        const zWycinka = wycinek ? await rozpoznajObiekt(wycinek) : []
        // Jedna nazwa rzeczy dokładnie pod punktem; inwentarz całej sceny to inne rzeczy niż ta pod pinezką, więc nie jest podpowiedzią.
        const nazwy = zWycinka.slice(0, 4)
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

  /* Po przesunięciu pineski opisy przestają pasować do nowego miejsca — rozpoznajemy je od nowa.
     Nazwę zamieniamy tylko wtedy, gdy była automatyczna (pusta albo jedna z propozycji):
     nazwa wpisana ręcznie zostaje. Numer przebiegu odrzuca spóźnione odpowiedzi po kolejnym ruchu. */
  const projektRef = useRef(projekt)
  projektRef.current = projekt
  const przebiegRozpoznania = useRef<Record<string, number>>({})
  const rozpoznajPineskePonownie = useCallback((id: string) => {
    const pin = projektRef.current.pineski.find(x => x.id === id)
    const warstwa = pin && projektRef.current.warstwy.find(w => w.id === pin.layerId)
    if (!pin || !warstwa) return
    const przebieg = (przebiegRozpoznania.current[id] = (przebiegRozpoznania.current[id] ?? 0) + 1)
    const etykietaAutomatyczna = !pin.label.trim() || (pin.sugestie ?? []).includes(pin.label)
    const { normalizedX, normalizedY } = pin
    setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === id ? { ...x, analizowana: true, ramka: undefined } : x)) }))
    void (async () => {
      const aktualny = () => przebiegRozpoznania.current[id] === przebieg
      void ramkaRzeczyPodPinem(warstwa.src, normalizedX, normalizedY)
        .then(ramka => {
          if (!ramka || !aktualny()) return
          setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === id ? { ...x, ramka } : x)) }))
        })
        .catch(() => undefined)
      const wycinek = await wytnijOkolice(warstwa.src, normalizedX, normalizedY, 384, 0.3)
      const zWycinka = wycinek ? await rozpoznajObiekt(wycinek) : []
      if (!aktualny()) return
      // Jedna nazwa rzeczy dokładnie pod punktem; inwentarz całej sceny to inne rzeczy niż ta pod pinezką, więc nie jest podpowiedzią.
        const nazwy = zWycinka.slice(0, 4)
      setProjekt(p => ({
        ...p,
        pineski: p.pineski.map(x =>
          x.id === id
            ? {
                ...x,
                analizowana: false,
                sugestie: nazwy,
                label: etykietaAutomatyczna ? nazwy[0] || x.label : x.label,
              }
            : x,
        ),
      }))
    })()
  }, [])

  const zmienPineske = useCallback((id: string, zmiany: Partial<Pineska>) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === id ? { ...x, ...zmiany } : x)) }))
  }, [])

  const usunPineske = useCallback((id: string) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.filter(x => x.id !== id) }))
    setWybranaPineska(s => (s === id ? null : s))
  }, [])

  /* ── Inpainting pędzlem i generator ────────────────────────────── */

  const warstwaMaski = useMemo(
    () => (maska.length ? projekt.warstwy.find(w => w.id === maska[0].layerId) ?? null : null),
    [maska, projekt.warstwy],
  )
  // Sesja inpaintingu: po kliknięciu „Inpaint” w górnym pasku (albo skrótem B) prompter jest od razu, pędzel działa na zaznaczonym zdjęciu.
  const warstwaInpaint = useMemo(
    () =>
      warstwaMaski ??
      (narzedzie === 'pedzel'
        ? projekt.warstwy.find(w => w.id === wybranaWarstwa && w.type === 'image' && !w.generator && w.src) ?? null
        : null),
    [warstwaMaski, narzedzie, projekt.warstwy, wybranaWarstwa],
  )
  // tryb sesji pędzla: zwykły inpaint (z poleceniem) albo eraser (zamaluj, co usunąć — polecenie niepotrzebne)
  const [trybPedzla, setTrybPedzla] = useState<'inpaint' | 'eraser'>('inpaint')
  const zakonczInpaint = useCallback(() => {
    setTrybPedzla('inpaint')
    setMaska([])
    setNarzedzie('wybor')
  }, [])
  const warstwaGeneratora = useMemo(
    () => projekt.warstwy.find(w => w.generator && !w.duch && w.id === wybranaWarstwa) ?? projekt.warstwy.find(w => w.generator && !w.duch) ?? null,
    [projekt.warstwy, wybranaWarstwa],
  )


  const uruchomInpainting = useCallback(
    async (tekst: string) => {
      const w = warstwaMaski
      if (!w || trwaPrompter) return
      setTrwaPrompter(true)
      setStanGeneracji({ faza: 'trwa', plan: 'Maluję zaznaczony obszar…', tryb: 'inpainting' })
      startDucha(w, 'Inpaint…')
      try {
        // Osobny moduł (canvas/inpainting.ts): wycinek wokół zaznaczenia → model → wynik tylko w masce.
        const eraser = trybPedzla === 'eraser'
        const polecenie = eraser ? promptErasera(tekst) : tekst
        const wynik = await wykonajInpainting({ src: w.src, kreski: maska, tekst: polecenie, model: modelObrazu === 'auto' ? 'nb2' : modelObrazu })
        const koncowy = wynik.obrazUrl
        const nazwa = eraser ? `${w.name}_bez_obiektu` : nazwijWynik(tekst, [])
        dodajZeZrodla(koncowy, nazwa, 'wynik', w)
        setStanGeneracji({ faza: 'gotowe', wynik: { obrazUrl: koncowy, kosztUSD: wynik.kosztUSD, model: wynik.model, nazwa, opis: eraser ? 'Eraser: usunięto zamalowany obiekt.' : `Inpainting: „${tekst}”.` } })
        zakonczInpaint()
      } catch (e) {
        setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nie udało się namalować zaznaczonego obszaru.' })
      } finally {
        usunDucha()
        setTrwaPrompter(false)
      }
    },
    [warstwaMaski, maska, modelObrazu, trwaPrompter, dodajZeZrodla, zakonczInpaint, trybPedzla, startDucha, usunDucha],
  )

  const utworzRamkeGeneratora = useCallback((szer: number, wys: number) => {
    setMenuGeneratora(false)
    setProjekt(p => {
      const skala = Math.min(1, 460 / Math.max(szer, wys))
      const prawa = p.warstwy.reduce((m, x) => Math.max(m, x.x + x.width), 0)
      const id = nowyId('w')
      setWybranaWarstwa(id)
      return {
        ...p,
        warstwy: [
          ...p.warstwy,
          {
            id,
            type: 'image' as const,
            src: '',
            x: p.warstwy.length === 0 ? 60 : prawa + 48,
            y: 60,
            width: Math.round(szer * skala),
            height: Math.round(wys * skala),
            naturalWidth: szer,
            naturalHeight: wys,
            rotation: 0,
            name: 'Image Generator',
            visible: true,
            locked: false,
            zrodlo: 'wynik' as const,
            generator: true,
          },
        ],
      }
    })
  }, [])

  const uruchomGenerator = useCallback(
    async (tekst: string) => {
      const ramka = warstwaGeneratora
      if (!ramka || trwaPrompter) return
      setTrwaPrompter(true)
      setStanGeneracji({ faza: 'trwa', plan: 'Generuję obraz z opisu…', tryb: 'generator' })
      setProjekt(p => ({ ...p, warstwy: p.warstwy.map(x => (x.id === ramka.id ? { ...x, generuje: true } : x)) }))
      try {
        // Osobny moduł (canvas/generowanie.ts): sam opis, bez zdjęć wejściowych i reguł.
        const w = await wykonajGenerowanie(tekst, ramka.naturalWidth, ramka.naturalHeight, modelObrazu === 'auto' ? 'nb2' : modelObrazu)
        const nazwa = nazwijWynik(tekst, [])
        setProjekt(p => ({
          ...p,
          warstwy: p.warstwy.map(x =>
            x.id === ramka.id
              ? { ...x, src: w.obrazUrl, generator: false, generuje: false, name: nazwa, naturalWidth: w.szerokosc, naturalHeight: w.wysokosc, height: Math.round((x.width * w.wysokosc) / w.szerokosc) }
              : x,
          ),
        }))
        setStanGeneracji({ faza: 'gotowe', wynik: { obrazUrl: w.obrazUrl, kosztUSD: w.kosztUSD, model: w.model, nazwa, opis: `Polecenie: „${tekst}”.` } })
      } catch (e) {
        setProjekt(p => ({ ...p, warstwy: p.warstwy.map(x => (x.id === ramka.id ? { ...x, generuje: false } : x)) }))
        setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nie udało się wygenerować obrazu.' })
      } finally {
        setTrwaPrompter(false)
      }
    },
    [warstwaGeneratora, modelObrazu, trwaPrompter],
  )

  /* ── Skróty klawiszowe ─────────────────────────────────────────── */

  useEffect(() => {
    const naKlawisz = (e: KeyboardEvent) => {
      const cel = e.target as HTMLElement
      if (cel && ['INPUT', 'TEXTAREA', 'SELECT'].includes(cel.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        // Ctrl+A: zaznacz wszystkie zdjęcia
        e.preventDefault()
        const ids = projekt.warstwy.filter(w => w.visible && !w.generator && w.src).map(w => w.id)
        if (ids.length >= 2) {
          setZaznaczone(ids)
          setWybranaWarstwa(ids[0])
        } else if (ids.length === 1) setWybranaWarstwa(ids[0])
        return
      }
      if (e.ctrlKey || e.metaKey) return
      if (e.key === 'Escape') {
        setZaznaczone([])
        setWybranaPineska(null)
        setMenuDodawania(false)
        setMenuGeneratora(false)
        setEdycjaTekstu(null)
        setQuickEdit(null)
        zakonczInpaint()
        return
      }
      // Tab = Quick edit (sam opis zmiany, bez zamalowywania) na zaznaczonym zdjęciu, jak w pasku akcji
      if (e.key === 'Tab' && wybranaWarstwa && !wieluAktywne) {
        const w = projekt.warstwy.find(x => x.id === wybranaWarstwa)
        if (w && w.type === 'image' && !w.generator) {
          e.preventDefault()
          setQuickEdit(w.id)
          return
        }
      }
      const skroty: Record<string, Narzedzie> = { v: 'wybor', p: 'pineska', h: 'reka', b: 'pedzel' }
      const n = skroty[e.key.toLowerCase()]
      if (n) {
        setNarzedzie(n)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (wybranaPineska) usunPineske(wybranaPineska)
        else if (wieluAktywne) usunWarstwy(wielu.map(w => w.id))
        else if (wybranaWarstwa) usunWarstwe(wybranaWarstwa)
      }
    }
    window.addEventListener('keydown', naKlawisz)
    return () => window.removeEventListener('keydown', naKlawisz)
  }, [wybranaPineska, wybranaWarstwa, usunPineske, usunWarstwe, zakonczInpaint, projekt.warstwy, wieluAktywne, wielu, usunWarstwy])

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
      (wybranaWarstwa ? projekt.warstwy.find(w => w.id === wybranaWarstwa && !w.generator) : null) ??
      projekt.warstwy.find(w => !w.generator) ??
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
    () => zbudujPolecenie(projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja, { studio, hybryda }),
    [projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja, studio, hybryda],
  )

  // Wiele zaznaczonych zdjęć bez pinesek = generacja z referencjami: uwagi i blokady dotyczące pinesek nie mają zastosowania.
  const trybReferencji = wieluAktywne && projekt.pineski.length === 0
  const uwagi = useMemo(
    () => (trybReferencji ? [] : sprawdzPolecenie(projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja)),
    [trybReferencji, projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja],
  )

  const powodBlokady = useMemo(() => {
    if (trybReferencji) return projekt.tekst.trim() ? null : `Opisz, co zrobić z ${wielu.length} zaznaczonymi zdjęciami`
    if (!warstwaZrodlowa) return projekt.tekst.trim() ? null : 'Opisz obraz, który mam wygenerować'
    const blokada = uwagi.find(u => u.waga === 'blokada')
    if (blokada) return blokada.tresc
    if (!projekt.tekst.trim()) return 'Wbij pinezkę i wpisz polecenie'
    return null
  }, [trybReferencji, wielu.length, warstwaZrodlowa, uwagi, projekt.tekst])

  /** Odpowiedź użytkownika na pytanie o role (poziom 4) — ważna, dopóki pineski się nie zmienią. */
  const odpowiedzRol = useRef<{ odcisk: string; opcja: OpcjaRol } | null>(null)

  /* Uruchomienie generacji z Nano-Banana */
  // Blokada: drugi klik / Enter w trakcie generacji nie odpala kolejnej
  const refGeneruje = useRef(false)

  /** Generacja z wieloma referencjami (zaznaczone zdjęcia, bez pinesek): osobny moduł canvas/referencje.ts. */
  const uruchomZReferencjami = useCallback(async () => {
    const tekst = projekt.tekst.trim()
    const pierwsze = wielu[0]
    if (!tekst || !pierwsze || refGeneruje.current) return
    refGeneruje.current = true
    setStanGeneracji({ faza: 'trwa', plan: `Generuję z ${wielu.length} referencji…`, tryb: 'referencje' })
    startDucha(pierwsze, 'Generuję…')
    try {
      const obrazy = await Promise.all(wielu.map(w => konwertujNaDataUrl(w.src)))
      const wynik = await wykonajGeneracjeZReferencji({
        obrazy,
        tekst,
        szerokosc: pierwsze.naturalWidth,
        wysokosc: pierwsze.naturalHeight,
        model: modelObrazu === 'auto' ? 'nb2' : modelObrazu,
      })
      const src = await dopasujFormatDoObrazu(wynik.obrazUrl, pierwsze.naturalWidth, pierwsze.naturalHeight)
      const nazwa = nazwijWynik(tekst, [])
      dodajZeZrodla(src, nazwa, 'wynik', pierwsze)
      setStanGeneracji({ faza: 'gotowe', wynik: { obrazUrl: src, kosztUSD: wynik.kosztUSD, model: wynik.model, nazwa, opis: `Referencje: ${wielu.length} zdjęć. Polecenie: „${tekst}”.` } })
    } catch (e) {
      setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nie udało się wygenerować obrazu z referencji.' })
    } finally {
      usunDucha()
      refGeneruje.current = false
    }
  }, [projekt.tekst, wielu, modelObrazu, dodajZeZrodla, startDucha, usunDucha])

  /**
   * NOWY SYSTEM PROMPTOWANIA (domyślny): agent z oczami (jedno wywołanie Gemini) rozumie polecenie i pinezki, dopytuje ludzkim językiem
   * albo pisze krótki prompt pod model obrazu; kod wycina referencje (osoba, twarz, rzecz), dopisuje liczby ze skali i wysyła.
   * Odpowiedź na pytanie agenta wpisujesz w czacie — następne „Wyślij” jest wtedy odpowiedzią (póki pinezki się nie zmienią).
   * Warstwy i zasady: `canvas/nowy/README.md`. Stary system: `_schowane/prompty-v1`, tag git `prompty-v1`.
   */
  const rozmowaAgenta = useRef<{ zadanie: string; pytanie: string; historia: { pytanie: string; odpowiedz: string }[]; odcisk: string; pineski: Pineska[] } | null>(null)
  const uruchomNowySystem = useCallback(async () => {
    if (refGeneruje.current) return
    const tekst = projekt.tekst.trim()
    if (!tekst) return
    const obrazyNaPlotnie = projekt.warstwy.filter(w => w.type === 'image' && !w.generator && w.src)
    const odcisk = odciskPinesek(projekt.pineski)
    // Odpowiedź na pytanie agenta należy do rozmowy także wtedy, gdy pinesek już nie ma na płótnie (po wysłaniu bywają zużyte) —
    // wtedy używamy ich zapisanej kopii, a odpowiedź nie zostaje potraktowana jako nowe, samotne polecenie.
    const rozmowa = rozmowaAgenta.current && (rozmowaAgenta.current.odcisk === odcisk || projekt.pineski.length === 0) ? rozmowaAgenta.current : null
    const pineskiZadania = rozmowa ? rozmowa.pineski : projekt.pineski
    const tekstZadania = rozmowa ? rozmowa.zadanie : tekst
    const historia = rozmowa ? [...rozmowa.historia, { pytanie: rozmowa.pytanie, odpowiedz: tekst }] : []
    refGeneruje.current = true
    setStanGeneracji({ faza: 'planuje' })
    try {
      const p = await przygotujZAgentem({
        tekst: tekstZadania,
        pineski: pineskiZadania,
        warstwy: obrazyNaPlotnie,
        zaznaczone: wielu.map(w => w.id),
        wybrana: wybranaWarstwa,
        historia,
      })
      if (p.typ === 'pytanie') {
        rozmowaAgenta.current = { zadanie: tekstZadania, pytanie: p.pytanie.tresc, historia, odcisk, pineski: pineskiZadania }
        setStanGeneracji({ faza: 'pyta', pytanie: { tresc: p.tekst, opcje: [], odcisk } })
        return
      }
      if (p.typ === 'blad') {
        setStanGeneracji({ faza: 'blad', tresc: p.blad })
        return
      }
      rozmowaAgenta.current = null
      setStanGeneracji({ faza: 'trwa', plan: p.opis, tryb: 'referencje' })
      startDucha(p.baza, 'Generuję…')
      setOstatniPrompt(p.prompt)
      const wynik = await generuj({
        polecenie: p.prompt,
        obrazy: p.obrazy,
        szerokosc: p.baza.naturalWidth,
        wysokosc: p.baza.naturalHeight,
        model: modelObrazu === 'auto' ? 'nb2' : modelObrazu,
        studio: true,
      })
      const src = await dopasujFormatDoObrazu(wynik.obrazUrl, p.baza.naturalWidth, p.baza.naturalHeight)
      const nazwa = nazwijWynik(tekstZadania, projekt.pineski)
      dodajZeZrodla(src, nazwa, 'wynik', p.baza)
      setStanGeneracji({ faza: 'gotowe', wynik: { obrazUrl: src, kosztUSD: wynik.kosztUSD, model: wynik.model, nazwa, opis: `${p.opis} (${p.zrodlo === 'agent' ? 'prompt od agenta' : 'szablon'})` } })
    } catch (e) {
      setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nie udało się wygenerować obrazu.' })
    } finally {
      usunDucha()
      refGeneruje.current = false
    }
  }, [projekt.tekst, projekt.warstwy, projekt.pineski, wielu, wybranaWarstwa, modelObrazu, dodajZeZrodla, startDucha, usunDucha])

  const uruchomGeneracje = useCallback(async () => {
    if (refGeneruje.current) return
    if (trybReferencji) return uruchomZReferencjami()
    // domyślnie nowy system promptowania (gdy jest zdjęcie do edycji); stary kod poniżej zostaje nieużywany do czasu usunięcia
    if (warstwaZrodlowa) return uruchomNowySystem()
    if (!warstwaZrodlowa) {
      // Brak zdjęcia: czysta generacja z opisu (text-to-image)
      const opis = projekt.tekst.trim()
      if (!opis) return
      refGeneruje.current = true
      setStanGeneracji({ faza: 'trwa', plan: 'Generuję obraz z opisu…', tryb: 'generator' })
      startDucha({ width: 460, height: 460, y: 60, naturalWidth: 1024, naturalHeight: 1024 }, 'Generuję…')
      try {
        const w = await generuj({ polecenie: opis, obrazy: [], szerokosc: 1024, wysokosc: 1024, model: modelObrazu === 'auto' ? 'nb2' : modelObrazu })
        const nazwa = nazwijWynik(opis, [])
        dodajZeZrodla(w.obrazUrl, nazwa, 'wynik')
        setStanGeneracji({ faza: 'gotowe', wynik: { obrazUrl: w.obrazUrl, kosztUSD: w.kosztUSD, model: w.model, nazwa, opis: `Polecenie: „${opis}”.` } })
      } catch (e) {
        setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nie udało się wygenerować obrazu.' })
      } finally {
        usunDucha()
        refGeneruje.current = false
      }
      return
    }
    refGeneruje.current = true
    setStanGeneracji({ faza: 'planuje' })
    startDucha(warstwaZrodlowa)

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

      // Zbliżenia wokół pinesek: na pełnym kadrze mała rzecz pod pinem (szklarnia przy garażu) ginie, a reżyser opisywał „trawę” albo „podjazd”.
      const zblizeniaPinow = (
        await Promise.all(
          projekt.pineski.map(async (p, i) => {
            const w = obrazy.find(x => x.id === p.layerId)
            if (!w) return null
            const zrodloPinu = (await konwertujNaDataUrl(w.src)) || w.src
            const dane = await (p.ramka ? wytnijPodgladPineski(zrodloPinu, p, 384) : wytnijOkolice(zrodloPinu, p.normalizedX, p.normalizedY, 384, 0.16)).catch(() => '')
            return dane ? { numer: i + 1, nazwa: etykietaPineski(p, i + 1), dane } : null
          }),
        )
      ).filter((z): z is { numer: number; nazwa: string; dane: string } => Boolean(z))

      const plan = await zaplanuj({
        zadanie: projekt.tekst,
        rusztowanie: polecenie,
        obrazy: obrazyDlaAgenta,
        uchwyty: uchwytyTekst,
        zblizenia: zblizeniaPinow,
      })

      setStanGeneracji({ faza: 'trwa', plan: plan?.plan, role: powodRol || undefined })

      // Agent widział zdjęcia, więc jego tryb wygrywa z rozpoznaniem ze słów.
      // Jego opis obiektów i instrukcja wchodzą W rusztowanie — reguły kadru,
      // ochrony i czystego wyniku idą do modelu zawsze.
      // Prośba o zmianę kamery („zrób perspektywę z…”) idzie własnym promptem — reżyser jej nie zna i zrobiłby z niej zwykłe „wstaw”.
      let trybAgenta: Intencja = intencja === 'perspektywa' ? 'perspektywa' : INTENCJE.find(i => i.id === plan?.intencja)?.id ?? intencja
      // Zamiana CAŁEJ osoby (bez słowa „twarz”) to character swap, nawet gdy reżyser lub rozpoznanie wskazały samą twarz (screen: rycerz zostawał w zbroi).
      const calaOsoba = dotyczyCalejOsoby(projekt.tekst) && (trybAgenta === 'postac' || trybAgenta === 'zamien')
      if (calaOsoba) trybAgenta = 'zamien'
      const dotyczyOsoby = calaOsoba || plan?.osoba
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
      const rozmiarPlanu = (!SKALA_OD_MODELU || studio) && rozmiarSurowy && rozmiarSurowy.szer <= 40 ? rozmiarSurowy : undefined
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
      let obrazyPolecenia = warstwaWycinka ? [warstwaWycinka, ...obrazy.slice(1)] : obrazy
      let pineskiPolecenia =
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
      const porownanie = (!SKALA_OD_MODELU || studio) && plan?.pomiar ? porownanieZKotwica(plan.pomiar, pinDocelowy?.normalizedY) : ''
      if (plan?.pomiar) console.info('[canvas] pomiar skali', { pomiar: plan.pomiar, rozmiarPlanu })

      // Operacja na człowieku idzie modelem postaci (RUNWARE_MODEL_POSTAC, jeśli ustawiony).
      const operacjaAgenta = operacjaZIntencji(trybAgenta, dotyczyOsoby)
      const postac = OPERACJE_POSTACI.has(operacjaAgenta)
      // Obiekt z drugiego zdjęcia (transfer / zamiana): referencja = ciasny wycinek wokół rzeczy pod pinem źródłowym, nie cały kadr
      // — inaczej model bierze rozmiar z referencji (F3: auto ok. 2× za duże). Pin źródłowy przeliczony na wycinek.
      if (
        REFERENCJA_WOKOL_RZECZY &&
        // osoby też: referencja = wycinek z samą osobą (bez tła i kadru zdjęcia-źródła), więcej pikseli tożsamości i nic do skopiowania poza nią
        ['object_transfer', 'object_swap', 'character_swap', 'character_transfer', 'face_swap'].includes(operacjaAgenta) &&
        pinZrodlowy &&
        pinDocelowy &&
        pinZrodlowy.layerId !== pinDocelowy.layerId
      ) {
        const dawca = obrazyPolecenia.find(w => w.id === pinZrodlowy.layerId)
        const wycinekDawcy = dawca
          ? await referencjaWokolRzeczy((await konwertujNaDataUrl(dawca.src)) || dawca.src, pinZrodlowy.normalizedX, pinZrodlowy.normalizedY).catch(() => null)
          : null
        if (dawca && wycinekDawcy) {
          const nowa: Warstwa = { ...dawca, src: wycinekDawcy.src, naturalWidth: Math.round(wycinekDawcy.w), naturalHeight: Math.round(wycinekDawcy.h) }
          obrazyPolecenia = obrazyPolecenia.map(w => (w.id === dawca.id ? nowa : w))
          pineskiPolecenia = pineskiPolecenia.map(p =>
            p.layerId === dawca.id
              ? {
                  ...p,
                  normalizedX: Math.min(1, Math.max(0, (p.normalizedX * dawca.naturalWidth - wycinekDawcy.x0) / wycinekDawcy.w)),
                  normalizedY: Math.min(1, Math.max(0, (p.normalizedY * dawca.naturalHeight - wycinekDawcy.y0) / wycinekDawcy.h)),
                }
              : p,
          )
        }
      }
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
      // Tryb krótki (test, przełącznik w czacie) zamiany postaci jest bez karty tożsamości, zbliżenia twarzy i opisu pozy — tylko zdjęcia i krótki prompt.
      const pelnyPromptPostaci = trybPromptuPostaci() === 'pdf'
      const pinOsoby = ['character_transfer', 'character_swap'].includes(operacjaAgenta) && (pelnyPromptPostaci || operacjaAgenta !== 'character_swap') && pinZrodlowy && pinZrodlowy.layerId !== zrodlo.id ? pinZrodlowy : undefined
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
      // Poza i sylwetka zamienianej osoby (Gemini): nowa osoba ma wejść w ten sam obrys, a nie „po swojemu”
      // (test youtuber → mężczyzna: nowa osoba mniejsza, węższe ramiona, ręka z bananem niżej).
      let pozaOsoby: string | undefined
      if (operacjaAgenta === 'character_swap' && pelnyPromptPostaci && pinDocelowy) {
        const r = pinDocelowy.ramka
        const szerZ = zrodlo.naturalWidth
        const wysZ = zrodlo.naturalHeight
        const cx = r ? (r.x0 + r.x1) / 2 : pinDocelowy.normalizedX
        const cy = r ? (r.y0 + r.y1) / 2 : pinDocelowy.normalizedY
        const udzial = r ? Math.min(1, (1.25 * Math.max((r.x1 - r.x0) * szerZ, (r.y1 - r.y0) * wysZ)) / Math.min(szerZ, wysZ)) : 0.5
        const wycOsoby = await wytnijOkolice((await konwertujNaDataUrl(zrodlo.src)) || zrodlo.src, cx, cy, 768, udzial)
        if (wycOsoby) pozaOsoby = (await opiszPozeOsoby(wycOsoby)) || undefined
      }
      let zblizenia: Zblizenie[] = []
      // ZABLOKOWANE (prompty/zablokowane/transfer-z-drugiego-zdjecia.ts): w tym trybie do modelu nie idą późniejsze dodatki, w tym zbliżenia.
      const transferZDrugiegoZdjecia =
        operacjaAgenta === 'object_transfer' && Boolean(pinZrodlowy && pinDocelowy && pinZrodlowy.layerId !== zrodlo.id && pinDocelowy.layerId === zrodlo.id)
      // Usuwanie: zbliżenie obiektu „do usunięcia” kazałoby modelowi zachować jego stan (T01/T02) — tu nic nie jest wstawiane ani oglądane.
      if (ZBLIZENIA_W_POBLIZU_PINEZKI && !studio && !ruchWKadrze && !transferZDrugiegoZdjecia && operacjaAgenta !== 'removal' && operacjaAgenta !== 'addition' && operacjaAgenta !== 'face_swap' && operacjaAgenta !== 'character_swap' && operacjaAgenta !== 'object_swap' && operacjaAgenta !== 'object_transfer') {
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
      let wklejkaNaPlotnie = false
      const zRamkaSrc =
        TRANSFER_Z_RAMKA &&
        studio &&
        ['wstaw', 'przenies'].includes(trybAgenta) &&
        Boolean(pinZrodlowy && pinZrodlowy.layerId !== zrodlo.id) &&
        Boolean(obszarCelu) &&
        !ramkaCelu
          ? await (async () => {
              if (TRANSFER_Z_WKLEJKA && pinZrodlowy) {
                const dawcaW = obrazyPolecenia.find(w => w.id === pinZrodlowy.layerId)
                const wyc = dawcaW
                  ? await referencjaWokolRzeczy((await konwertujNaDataUrl(dawcaW.src)) || dawcaW.src, pinZrodlowy.normalizedX, pinZrodlowy.normalizedY).catch(() => null)
                  : null
                const wkl = wyc ? await zlozWklejke(zrodlo, wyc.src, obszarCelu as Prostokat) : ''
                if (wkl) {
                  wklejkaNaPlotnie = true
                  return wkl
                }
              }
              return await narysujObszary(zrodlo, obszarCelu as Prostokat, undefined, true)
            })()
          : ''
      const ramkaNaPlotnie = Boolean(zRamkaSrc)
      if (plan?.dyrektywa) console.info('[canvas] dyrektywa reżysera:', plan.dyrektywa, '| pineski:', projekt.pineski.map((p, i) => `${i + 1}=${etykietaPineski(p, i + 1)}@${p.normalizedX.toFixed(2)},${p.normalizedY.toFixed(2)}`).join(' '))
      const zadanieModelu = zbudujZadanieModelu(projekt.tekst, pineskiPolecenia, obrazyPolecenia, trybAgenta, {
        studio,
        hybryda,
        twarzObraz: zblizenieTwarzy ? obrazyPolecenia.length + 1 : undefined,
        zblizenia: zblizenia.map((z, i) => ({ numer: pierwszyDodatkowy + i, opis: z.opis })),
        role: uklad.role,
        osoba: dotyczyOsoby,
        odznaki: plan?.odznaki,
        szczegoly: szczegolyPlanu,
        skala: SKALA_OD_MODELU ? undefined : plan?.skala,
        widok: SKALA_OD_MODELU && !studio ? undefined : plan?.widok,
        ulozenie: SKALA_OD_MODELU && !studio ? undefined : plan?.ulozenie,
        umiejscowienie: plan?.umiejscowienie,
        dyrektywa: plan?.dyrektywa,
        ramkaCelu: ramkaNaPlotnie,
        wklejka: wklejkaNaPlotnie,
        czesc: plan?.czesc,
        cecha: plan?.cecha,
        czescZakres: plan?.czescZakres,
        pierwszyPlan: plan?.pierwszyPlan,
        pozaOsoby,
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
        studio: zadanieModelu?.studio,
        negatyw: zadanieModelu?.negatyw,
        // 'auto' = bez wyboru: serwer sam dobiera model do zadania (zwykłe edycje Lite, tryby postaci i Gemini 3.1 — własny)
        model: modelObrazu === 'auto' ? undefined : modelObrazu,
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
      if (ramkaNaPlotnie) czyste[0] = zRamkaSrc
      if (SZKIC_SCENY_SWAP && operacjaAgenta === 'character_swap' && studio && czyste.length > 1) {
        try { czyste[0] = await rozmyjDoSzkicu(czyste[0]) } catch (e) { console.warn('[canvas] szkic sceny nieudany', e) }
      }
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
            studio,
            role: uklad.role,
            osoba: dotyczyOsoby,
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
          zadanie: pinZrodlowy && pinDocelowy && pinZrodlowy.layerId === pinDocelowy.layerId && trybAgenta === 'wstaw' ? przepiszNaPrzesuniecie(projekt.tekst) : projekt.tekst,
          przed: (await zmniejszDoAnalizy(zrodlo.src)) || zrodlo.src,
          wynik: wynik.obrazUrl,
          intencja: trybAgenta,
          plan: plan?.plan,
          uchwyty: uchwytyKontroli,
          // zamiana osoby: kontrola dostaje też referencję osoby i sprawdza tożsamość, miejsce, rozmiar i pozę
          referencjaOsoby: await (async () => {
            if (!['character_swap', 'character_transfer', 'face_swap'].includes(operacjaAgenta) || !pinZrodlowy) return undefined
            const ref = obrazyPolecenia.find(w => w.id === pinZrodlowy.layerId && w.id !== zrodlo.id)?.src
            return ref ? (await zmniejszDoAnalizy(ref)) || ref : undefined
          })(),
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
              'Model oddał zdjęcie praktycznie bez zmian. Nazwij obiekty w pinezkach i opisz zmianę konkretniej, np. „przenieś domek spod pinezki 1 na ścieżkę pod pinezką 2”.',
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

      // Pomiar >30% szerokości kadru to w praktyce błąd pomiaru (bezpiecznik), nie wynik: nie wolno z niego robić „Do poprawy” (T03).
      if (ocenaPoPoprawce && pomiar?.cel && pomiar.szer <= 30) {
        const zmierzone = `Pomiar: obiekt ma ${Math.round(pomiar.szer)}% szerokości kadru (cel ok. ${Math.round(pomiar.cel)}%)${pomiar.bledy.length ? ` — nadal ${pomiar.bledy.join('; ')}` : ''}.`
        ocenaPoPoprawce = {
          ...ocenaPoPoprawce,
          wykonane: ocenaPoPoprawce.wykonane && !pomiar.bledy.length,
          // Własny pomiar wygrywa z opisem kontrolera: gdy wynik stoi poza pinezką albo ma zły rozmiar, nie piszemy „zgodnie z poleceniem”.
          ocena: pomiar.bledy.length ? `Obiekt jest na zdjęciu, ale nie tam ani nie takiej wielkości, jak trzeba. ${zmierzone}` : `${ocenaPoPoprawce.ocena} ${zmierzone}`.trim(),
        }
      }

      setStanGeneracji({ faza: 'gotowe', wynik: gotowy, ocena: ocenaPoPoprawce ?? undefined })
    } catch (e) {
      setStanGeneracji({
        faza: 'blad',
        tresc: e instanceof Error ? e.message : 'Wystąpił błąd podczas generacji obrazu.',
      })
    } finally {
      usunDucha()
      refGeneruje.current = false
    }
  }, [
    trybReferencji,
    uruchomNowySystem,
    uruchomZReferencjami,
    startDucha,
    usunDucha,
    warstwaZrodlowa,
    obrazyWejsciowe,
    polecenie,
    intencja,
    projekt.tekst,
    projekt.pineski,
    projekt.warstwy,
    dodajZeZrodla,
    studio,
    hybryda,
    modelObrazu,
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
    <div ref={refRoot} className="nb-cozy absolute inset-0 w-full h-full min-h-0 max-h-full overflow-hidden select-none text-foreground">
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
        zaznaczone={zaznaczone}
        onZaznaczone={setZaznaczone}
        onWybierzPineske={setWybranaPineska}
        onZmienWarstwe={zmienWarstwe}
        onPrzesunPineske={(id, x, y) => zmienPineske(id, { normalizedX: x, normalizedY: y, analiza: undefined })}
        onPineskaPrzesunieta={rozpoznajPineskePonownie}
        onWbijPineske={wbijPineske}
        onUpuscPliki={pliki => wstawPliki(pliki, 'upuszczenie')}
        ramka={projekt.ramka}
        onZmienRamke={ramka => setProjekt(p => ({ ...p, ramka }))}
        intencja={intencja}
        onOtworzDodawanie={() => refPlik.current?.click()}
        onMenuWarstwy={(id, x, y) => setMenuWarstwy({ id, x, y })}
        maska={maska}
        srednicaPedzla={srednicaPedzla}
        onPociagniecie={k => setMaska(m => [...m, k])}
      />

      {/* ══ Menu kontekstowe zdjęcia (prawy klik) ══ */}
      {/* ══ Pływający pasek akcji AI nad zdjęciem (prawy klik) ══ */}
      {/* ══ Pasek akcji dla zaznaczonej grupy zdjęć: usuń, odznacz, akcje AI na każdym ══ */}
      {wieluAktywne && !warstwaInpaint &&
        (() => {
          const x0 = Math.min(...wielu.map(w => w.x))
          const x1 = Math.max(...wielu.map(w => w.x + w.width))
          const y0 = Math.min(...wielu.map(w => w.y))
          const y1 = Math.max(...wielu.map(w => w.y + w.height))
          const srodek = widok.x + ((x0 + x1) / 2) * widok.zoom
          const gora = widok.y + y0 * widok.zoom
          const dol = widok.y + y1 * widok.zoom
          const przycisk =
            'flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-transparent px-3 py-1.5 text-[12px] font-medium text-foreground/70 transition-all duration-150 hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-40'
          return (
            <div
              role="toolbar"
              aria-label="Akcje na zaznaczonych zdjęciach"
              onPointerDown={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
              className="absolute z-50"
              style={{
                left: Math.max(16 + 270, Math.min(srodek, window.innerWidth - 440 - 270)),
                transform: 'translateX(-50%)',
                top: gora - 56 >= 68 ? gora - 56 : Math.min(dol + 10, window.innerHeight - 64),
              }}
            >
              <div className="nb-szklo nb-szklo-plynne nb-nav-nocontain flex items-center gap-1 overflow-x-auto rounded-2xl border border-foreground/[0.12] p-1.5 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'hsl(var(--card) / 0.82)' }}>
                <span className="px-2.5 text-[12px] font-semibold text-foreground" title="Opisz w czacie, co z nimi zrobić — wszystkie trafią do modelu jako referencje">
                  {wielu.length} zdjęć
                </span>
                <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-foreground/[0.12]" />
                {AKCJE_AI.filter(a => ['enhance', 'upscale', 'beztla'].includes(a.id)).map(({ id: aid, etykieta, ikona: Ikona }) => (
                  <button key={aid} type="button" disabled={masowo || Boolean(akcjaAI)} onClick={() => uruchomAkcjeMasowo(aid)} title={`${etykieta} — dla każdego zaznaczonego zdjęcia`} className={przycisk}>
                    {masowo && akcjaAI === aid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ikona className="h-3.5 w-3.5" />}
                    {etykieta}
                  </button>
                ))}
                <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-foreground/[0.12]" />
                <button type="button" disabled={masowo} onClick={() => usunWarstwy(wielu.map(w => w.id))} title="Usuń zaznaczone zdjęcia (Delete)" className={cn(przycisk, 'hover:!text-destructive')}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Usuń
                </button>
                <button type="button" onClick={() => { setZaznaczone([]); setWybranaWarstwa(null) }} title="Odznacz (Esc)" aria-label="Odznacz" className="grid h-8 w-8 place-items-center rounded-xl text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })()}

      {(menuWarstwy || akcjaAI || wybranaWarstwa) && !warstwaInpaint && !wieluAktywne && !edycjaTekstu && !quickEdit &&
        (() => {
          const id = menuWarstwy?.id ?? wybranaWarstwa
          const w = projekt.warstwy.find(x => x.id === id)
          if (!w || w.type !== 'image' || w.generator || warstwaInpaint || wieluAktywne) return null
          const lewo = widok.x + w.x * widok.zoom
          const gora = widok.y + w.y * widok.zoom
          const wybierz = () => {
            setMenuWarstwy(null)
            setWybranaWarstwa(w.id)
            setWybranaPineska(null)
          }
          const akcjeAI = Object.fromEntries(AKCJE_AI.map(a => [a.id, a]))
          const zAI = (aid: string, extra: Partial<AkcjaPaska> = {}): AkcjaPaska => ({
            id: aid,
            etykieta: akcjeAI[aid].etykieta,
            ikona: akcjeAI[aid].ikona,
            trwa: akcjaAI === aid,
            onClick: () => uruchomAkcjeAI(w.id, aid),
            ...extra,
          })
          return (
            <PasekAkcji
              etykieta="Szybkie akcje AI"
              zablokowane={Boolean(akcjaAI)}
              style={{
                // wyśrodkowany nad zdjęciem, w całości na ekranie i przed panelem czatu
                left: Math.max(16 + 385, Math.min(lewo + (w.width * widok.zoom) / 2, window.innerWidth - 440 - 385)),
                transform: 'translateX(-50%)',
                maxWidth: 'calc(100vw - 440px)',
                top: gora - 56 >= 68 ? gora - 56 : Math.min(gora + w.height * widok.zoom + 10, window.innerHeight - 64),
              }}
              akcje={[
                {
                  id: 'quick',
                  etykieta: 'Quick edit',
                  ikona: Sparkles,
                  skrot: 'Tab',
                  tytul: 'Quick edit — opisz zmianę, zdjęcie idzie do modelu jako referencja',
                  onClick: () => {
                    wybierz()
                    setQuickEdit(w.id)
                  },
                },
                {
                  id: 'inpaint',
                  etykieta: 'Inpaint',
                  ikona: Paintbrush,
                  tytul: 'Inpaint — zamaluj miejsce na zdjęciu i opisz zmianę',
                  onClick: () => {
                    wybierz()
                    setTrybPedzla('inpaint')
                    setNarzedzie('pedzel')
                  },
                },
                zAI('upscale', { separator: true }),
                zAI('beztla', { etykieta: 'Remove BG' }),
                {
                  id: 'eraser',
                  etykieta: 'Eraser',
                  ikona: Eraser,
                  tytul: 'Eraser — zamaluj obiekt do usunięcia',
                  onClick: () => {
                    wybierz()
                    setTrybPedzla('eraser')
                    setNarzedzie('pedzel')
                  },
                },
                zAI('enhance'),
                {
                  id: 'tekst',
                  etykieta: 'Edit text',
                  ikona: Type,
                  tytul: 'Edit text — zmień napis na zdjęciu',
                  onClick: () => {
                    wybierz()
                    setEdycjaTekstu(w.id)
                  },
                },
                {
                  id: 'pobierz',
                  etykieta: 'Pobierz',
                  ikona: Download,
                  tylkoIkona: true,
                  separator: true,
                  onClick: () => akcjaWarstwy(w.id, 'pobierz'),
                },
              ]}
            />
          )
        })()}

      {menuWarstwy &&
        (() => {
          const w = projekt.warstwy.find(x => x.id === menuWarstwy.id)
          if (!w) return null
          const pozycje: { akcja: Parameters<typeof akcjaWarstwy>[1]; etykieta: string; niebezpieczna?: boolean; ikona: typeof Eye }[] = [
            { akcja: 'kopiuj', etykieta: 'Kopiuj', ikona: ClipboardCopy },
            { akcja: 'duplikuj', etykieta: 'Duplikuj', ikona: Copy },
            { akcja: 'pobierz', etykieta: 'Pobierz', ikona: Download },
            { akcja: 'wierzch', etykieta: 'Na wierzch', ikona: ArrowUpToLine },
            { akcja: 'spod', etykieta: 'Na spód', ikona: ArrowDownToLine },
            { akcja: 'blokada', etykieta: w.locked ? 'Odblokuj' : 'Zablokuj', ikona: w.locked ? Unlock : Lock },
            { akcja: 'ukryj', etykieta: 'Ukryj', ikona: EyeOff },
            { akcja: 'usun', etykieta: 'Usuń zdjęcie', niebezpieczna: true, ikona: Trash2 },
          ]
          return (
            <div
              role="menu"
              aria-label={`Opcje zdjęcia ${w.name}`}
              onPointerDown={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
              className="fixed z-50 min-w-[190px]"
              style={{
                left: Math.min(menuWarstwy.x, window.innerWidth - 190),
                top: Math.min(menuWarstwy.y, window.innerHeight - 370),
              }}
            >
            <div className="nb-szklo nb-szklo-plynne nb-powierzchnia rounded-2xl border border-foreground/[0.12] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]" style={{ backgroundColor: 'hsl(var(--card) / 0.9)' }}>
              <p className="truncate px-2.5 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{w.name}</p>
              {pozycje.map(({ akcja, etykieta, niebezpieczna, ikona: Ik }) => (
                <button
                  key={akcja}
                  role="menuitem"
                  type="button"
                  onClick={() => akcjaWarstwy(w.id, akcja)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-medium transition-all duration-150',
                    niebezpieczna
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground/75 hover:bg-foreground/[0.08] hover:text-foreground',
                  )}
                >
                  <Ik className="h-3.5 w-3.5" />
                  {etykieta}
                </button>
              ))}
            </div>
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
            className="pointer-events-none absolute h-3.5 w-3.5 rotate-45 rounded-[4px] border border-border/60"
            style={{
              top: kartaPozycja.ogonY - 7,
              [kartaPozycja.naLewo ? 'right' : 'left']: -7,
              background: 'hsl(var(--card) / 0.9)',
              clipPath: kartaPozycja.naLewo ? 'polygon(0 0, 100% 0, 100% 100%)' : 'polygon(0 0, 100% 100%, 0 100%)',
            }}
          />
          <KartaPineski
            pineska={kartaPozycja.pineska}
            numer={kartaPozycja.numer}
            warstwa={kartaPozycja.warstwa}
            onNazwa={label => zmienPineske(kartaPozycja.pineska.id, { label })}
            onUsun={() => usunPineske(kartaPozycja.pineska.id)}
            onRamka={ramka => zmienPineske(kartaPozycja.pineska.id, { ramka })}
            onZamknij={() => setWybranaPineska(null)}
          />
        </div>
      )}

      {/* ══ Licznik Bajtów (lewy górny róg) — saldo demonstracyjne do czasu podpięcia portfela ══ */}
      <div className="pointer-events-none absolute left-4 top-[var(--nb-canvas-gora,16px)] z-20 flex items-center gap-2">
        {onWyjdz && (
          <button
            type="button"
            onClick={onWyjdz}
            title="Wyjdź z Canvasa — projekt zapisuje się automatycznie"
            aria-label="Wyjdź z Canvasa"
            className="p2-szklo pointer-events-auto flex h-11 items-center gap-1.5 !rounded-[16px] px-3.5 text-[13px] font-semibold text-foreground/80 transition-[color,transform] duration-200 hover:-translate-y-px hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Wyjdź
          </button>
        )}
        <div className="p2-szklo pointer-events-auto flex h-11 items-center gap-2 !rounded-[16px] px-4" title="Saldo Bajtów">
          <span className="text-[15px] font-bold tabular-nums text-foreground">7</span>
          <span className="text-[15px] font-semibold text-primary">⟠</span>
        </div>
        <button
          type="button"
          onClick={przelaczMotyw}
          data-podpowiedz={jasnyMotyw ? 'Ciemny motyw' : 'Jasny motyw'}
          data-pozycja="dol"
          aria-label={jasnyMotyw ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw'}
          className="p2-szklo pointer-events-auto grid h-11 w-11 place-items-center !rounded-[16px] text-foreground/70 transition-[color,transform] duration-200 hover:-translate-y-px hover:text-foreground"
        >
          {jasnyMotyw ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {/* ══ Prompter: inpainting (po zamalowaniu) i generator (pod pustą ramką) ══ */}
      {warstwaInpaint && (
        <Prompter
          key={`inpaint-${warstwaInpaint.id}`}
          etykieta={trybPedzla === 'eraser' ? 'Eraser' : 'Inpaint'}
          placeholder={
            trybPedzla === 'eraser'
              ? maska.length ? 'Enter — usuń zamalowane' : 'Zamaluj, co usunąć'
              : maska.length ? 'Co zrobić w tym miejscu?' : 'Zamaluj miejsce i opisz zmianę'
          }
          bezTekstu={trybPedzla === 'eraser'}
          trwa={trwaPrompter}
          blokada={!warstwaMaski}
          onWyslij={uruchomInpainting}
          onAnuluj={zakonczInpaint}
          srednica={srednicaPedzla}
          onSrednica={setSrednicaPedzla}
          // dokładnie w slocie paska szybkich akcji (ten sam wzór pozycji) — pasek „zamienia się” w prompter
          style={{
            left: Math.max(16, Math.min(widok.x + (warstwaInpaint.x + warstwaInpaint.width / 2) * widok.zoom - 280, window.innerWidth - 440 - 560)),
            top:
              widok.y + warstwaInpaint.y * widok.zoom - 56 >= 68
                ? widok.y + warstwaInpaint.y * widok.zoom - 56
                : Math.min(window.innerHeight - 64, widok.y + (warstwaInpaint.y + warstwaInpaint.height) * widok.zoom + 10),
          }}
        />
      )}
      {quickEdit &&
        (() => {
          const w = projekt.warstwy.find(x => x.id === quickEdit)
          if (!w) return null
          return (
            <Prompter
              key={`quick-${w.id}`}
              etykieta="Quick edit"
              placeholder="Opisz, co zmienić na zdjęciu"
              trwa={Boolean(akcjaAI)}
              onWyslij={t => uruchomQuickEdit(w.id, t)}
              onAnuluj={() => setQuickEdit(null)}
              style={{
                left: Math.max(16, Math.min(widok.x + (w.x + w.width / 2) * widok.zoom - 280, window.innerWidth - 640)),
                top: Math.max(72, widok.y + w.y * widok.zoom - 62),
              }}
            />
          )
        })()}
      {edycjaTekstu &&
        (() => {
          const w = projekt.warstwy.find(x => x.id === edycjaTekstu)
          if (!w) return null
          return (
            <Prompter
              key={`tekst-${w.id}`}
              etykieta="Edit text"
              placeholder="Co zmienić w napisie? np. „SALE” → „-50%”"
              trwa={Boolean(akcjaAI)}
              onWyslij={t => uruchomEdycjeTekstu(w.id, t)}
              onAnuluj={() => setEdycjaTekstu(null)}
              style={{
                left: Math.max(16, Math.min(widok.x + (w.x + w.width / 2) * widok.zoom - 280, window.innerWidth - 640)),
                top: Math.max(72, widok.y + w.y * widok.zoom - 62),
              }}
            />
          )
        })()}
      {!warstwaInpaint && warstwaGeneratora && (
        <Prompter
          key={`gen-${warstwaGeneratora.id}`}
          etykieta={`${warstwaGeneratora.naturalWidth} × ${warstwaGeneratora.naturalHeight}`}
          placeholder="Co mamy dzisiaj stworzyć?"
          trwa={trwaPrompter}
          onWyslij={uruchomGenerator}
          onAnuluj={() => setProjekt(p => ({ ...p, warstwy: p.warstwy.filter(x => x.id !== warstwaGeneratora.id) }))}
          style={{
            left: Math.max(16, Math.min(widok.x + (warstwaGeneratora.x + warstwaGeneratora.width / 2) * widok.zoom - 280, window.innerWidth - 640)),
            top: Math.min(window.innerHeight - 90, widok.y + (warstwaGeneratora.y + warstwaGeneratora.height) * widok.zoom + 14),
          }}
        />
      )}
      {menuGeneratora && (
        <div className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2">
          <MenuGeneratora onUtworz={utworzRamkeGeneratora} />
        </div>
      )}

      {/* ══ DOCK NARZĘDZI PO LEWYM BOKU (Nextbyte Liquid Glass) ══ */}
      <div className="p2 !bg-transparent pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="p2-szklo pointer-events-auto relative flex flex-row items-center gap-1 !rounded-[22px] p-2">
          {/* Wybór i przesuwanie (V) */}
          <Narzedzie
            tytul="Wybór (V)"
            aktywne={narzedzie === 'wybor'}
            onClick={() => setNarzedzie('wybor')}
          >
            <MousePointer2 className="h-4 w-4" />
          </Narzedzie>

          {/* Pineska (P) — zaznacz obiekt (do 10 pinesek) */}
          <Narzedzie
            tytul="Pinezka (P)"
            aktywne={narzedzie === 'pineska'}
            onClick={() => setNarzedzie('pineska')}
            odznaka={projekt.pineski.length || undefined}
          >
            <Pin className="h-4 w-4" />
          </Narzedzie>

          {/* Przesuwanie widoku (H) */}
          <Narzedzie
            tytul="Ręka (H)"
            aktywne={narzedzie === 'reka'}
            onClick={() => setNarzedzie('reka')}
          >
            <Hand className="h-4 w-4" />
          </Narzedzie>

          <span aria-hidden className="mx-1 h-5 w-px bg-foreground/[0.1]" />

          {/* Dodaj zdjęcie & Sceny demo */}
          <Narzedzie
            tytul="Dodaj zdjęcie"
            aktywne={menuDodawania}
            onClick={() => {
              // Jedno pływające okno naraz — karta pineski ustępuje menu
              setWybranaPineska(null)
              setMenuDodawania(v => !v)
            }}
          >
            <IkonaObrazu className="h-4 w-4" />
          </Narzedzie>

          {/* Generuj zdjęcie — pusta ramka z prompterem */}
          <Narzedzie
            tytul="Nowe zdjęcie z opisu"
            aktywne={menuGeneratora}
            onClick={() => {
              setWybranaPineska(null)
              setMenuDodawania(false)
              setMenuGeneratora(v => !v)
            }}
          >
            <ImagePlus className="h-4 w-4" />
          </Narzedzie>

          {/* Lista zdjęć / warstw */}
          <Narzedzie
            tytul="Zdjęcia na płótnie"
            aktywne={panelWarstw}
            onClick={() => {
              setWybranaPineska(null)
              setPanelWarstw(v => !v)
            }}
            odznaka={projekt.warstwy.length || undefined}
          >
            <Layers className="h-4 w-4" />
          </Narzedzie>

        </div>

        {/* Menu dodawania źródeł — obok docka, nie w nim: szkło docka przycina
            wszystko, co wystaje poza jego obrys (contain: paint). Pozycję
            trzyma zewnętrzny div, bo `.is-glass .nb-szklo` wymusza
            position: relative i zdjęłoby `absolute` ze szklanego elementu. */}
        {menuDodawania && (
          <div className="pointer-events-auto absolute bottom-full left-1/2 z-40 mb-2.5 w-64 -translate-x-1/2">
          <div className="p2-karta p2-pow-1 overflow-hidden p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
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
        wybranaWarstwa={wybranaWarstwa}
        zaznaczoneWarstwy={wieluAktywne ? wielu : []}
        onOdznaczWarstwe={() => {
          setWybranaWarstwa(null)
          setZaznaczone([])
        }}
        onGeneruj={uruchomGeneracje}
        modelObrazu={modelObrazu}
        onModelObrazu={zmienModelObrazu}
        trybPromptow={trybPromptow}
        onTrybPromptow={zmienTrybPromptow}
        onDodajPlik={() => refPlik.current?.click()}
        onWklejZeSchowka={wstawZeSchowka}
        onDodajZAdresu={wstawZAdresu}
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
      />

      {/* ══ Panel warstw (wysuwany) ══ */}
      {panelWarstw && (
        <div className="p2 !bg-transparent absolute left-20 top-[var(--nb-canvas-gora,16px)] z-20 w-64">
          <div className="p2-szklo overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150">
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

      {/* ══ Zoom (lewy dolny róg, jak w Lovart) ══ */}
      <div className="p2 !bg-transparent pointer-events-none absolute bottom-4 left-4 z-20">
        <div className="p2-szklo pointer-events-auto flex h-11 items-center gap-0.5 !rounded-[16px] px-2">
          <button type="button" title="Oddal (−)" aria-label="Oddal" onClick={() => zmienZoom(0.8)} className="grid h-8 w-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/[0.08] hover:text-foreground"><ZoomOut className="h-4 w-4" /></button>
          <span className="w-10 text-center font-mono text-[11px] tabular-nums text-foreground/70">{Math.round(widok.zoom * 100)}%</span>
          <button type="button" title="Przybliż (+)" aria-label="Przybliż" onClick={() => zmienZoom(1.25)} className="grid h-8 w-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/[0.08] hover:text-foreground"><ZoomIn className="h-4 w-4" /></button>
          <span className="mx-0.5 h-5 w-px bg-[hsl(var(--foreground)/0.12)]" />
          <button type="button" title="Dopasuj widok do zdjęć" aria-label="Dopasuj widok" onClick={dopasujWidok} className="grid h-8 w-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/[0.08] hover:text-foreground"><Maximize className="h-4 w-4" /></button>
        </div>
      </div>
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
      data-podpowiedz={tytul}
      aria-label={tytul}
      aria-pressed={aktywne}
      onClick={onClick}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-[14px] transition-all duration-200 active:scale-95',
        aktywne
          ? 'bg-primary/[0.13] text-primary shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.18)]'
          : 'p2-cichy hover:-translate-y-px hover:bg-[hsl(var(--foreground)/0.07)] hover:text-[hsl(var(--foreground))]',
      )}
    >
      {children}
      {odznaka !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
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
