import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  Hand,
  Image as IkonaObrazu,
  Layers,
  Link2,
  Lock,
  MapPin,
  Maximize,
  MousePointer2,
  Sparkles,
  Square,
  Trash2,
  Unlock,
  Upload,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KartaPineski } from '@/sections/canvas/KartaPineski'
import { CzatCanvas } from '@/sections/canvas/CzatCanvas'
import {
  generuj,
  nazwijWynik,
  opiszZmiane,
  rozpoznajObiekt,
  rozpoznajScene,
  sprawdzWynik,
  klasyfikujPineski,
  zaplanuj,
} from '@/sections/canvas/dostawca'
import { Plotno } from '@/sections/canvas/Plotno'
import { INTENCJE, polozenie, wykryjIntencje, zbudujPolecenie } from '@/sections/canvas/polecenia'
import { narysujMapeMiejsc, narysujObszary } from '@/sections/canvas/mapa-miejsc'
import { wykryjNakladke } from '@/sections/canvas/kontrola-wyniku'
import type { Prostokat } from '@/sections/canvas/rezyser'
import { ustalUklad } from '@/sections/canvas/uklad-pinesek'
import { sprawdzPolecenie } from '@/sections/canvas/kontrola-polecenia'
import type { ObrazDlaAgenta } from '@/sections/canvas/agent-proxy'
import {
  etykietaPineski,
  kolejnoscObrazow,
  konwertujNaDataUrl,
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

import interiorImg from '@/assets/studio/interior.jpg'
import carImg from '@/assets/studio/car.jpg'
import landscapeImg from '@/assets/studio/landscape.jpg'

/**
 * Canvas — profesjonalna kanwa generatywna (Nano-Banana & Lovart Engine).
 *
 * Pasek narzędzi po lewym boku, pływający chat w stylu Liquid Glass (Dashboard 2.0)
 * po prawej stronie, do 10 precyzyjnych pinesek z automatycznym rozpoznawaniem obiektów,
 * obsługa natychmiastowego Object Transfer oraz Object Switch z Clean Plate.
 */

const KLUCZ_ZAPISU = 'nb-canvas-projekt-v2'

interface Projekt {
  warstwy: Warstwa[]
  pineski: Pineska[]
  tekst: string
  ramka?: RamkaObszaru | null
}

function stworzDemoLovart(): {
  projekt: Projekt
  widok: Widok
  wybranaWarstwa: string
  wybranaPineska: string
} {
  const w1Id = 'w_demo_salon'
  const w2Id = 'w_demo_krajobraz'
  const p1Id = 'p_demo_1'
  const p2Id = 'p_demo_2'

  return {
    projekt: {
      warstwy: [
        {
          id: w1Id,
          type: 'image',
          src: interiorImg,
          x: 60,
          y: 70,
          width: 480,
          height: 340,
          naturalWidth: 1024,
          naturalHeight: 768,
          rotation: 0,
          name: 'Salon (Interior)',
          visible: true,
          locked: false,
          zrodlo: 'dysk',
          obiekty: ['fotel wypoczynkowy', 'stolik kawowy', 'okno panoramiczne', 'lampa'],
        },
        {
          id: w2Id,
          type: 'image',
          src: landscapeImg,
          x: 580,
          y: 70,
          width: 480,
          height: 340,
          naturalWidth: 1024,
          naturalHeight: 768,
          rotation: 0,
          name: 'Krajobraz (Landscape)',
          visible: true,
          locked: false,
          zrodlo: 'dysk',
          obiekty: ['skały', 'taras widokowy', 'zbocze góry', 'niebo'],
        },
      ],
      pineski: [
        {
          id: p1Id,
          layerId: w1Id,
          normalizedX: 0.38,
          normalizedY: 0.62,
          label: 'fotel wypoczynkowy',
          sugestie: ['fotel', 'siedzisko', 'mebel'],
          analizowana: false,
        },
        {
          id: p2Id,
          layerId: w2Id,
          normalizedX: 0.48,
          normalizedY: 0.64,
          label: 'taras widokowy',
          sugestie: ['taras', 'punkt widokowy', 'skały'],
          analizowana: false,
        },
      ],
      tekst: 'Przenieś fotel wypoczynkowy w miejsce taras widokowy, zachowaj kadr i zrekonstruuj tło pod fotelem (Clean Plate)',
    },
    widok: { x: 50, y: 60, zoom: 0.72 },
    wybranaWarstwa: w1Id,
    wybranaPineska: p1Id,
  }
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
      /* uszkodzony zapis — startujemy od sceny demo */
    }
    return stworzDemoLovart().projekt
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
    return 'w_demo_salon'
  })
  const [wybranaPineska, setWybranaPineska] = useState<string | null>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      if (zapisany) {
        const wczytany = wczytajProjekt(JSON.parse(zapisany))
        if (wczytany.pineski.length > 0) return wczytany.pineski[0].id
      }
    } catch {}
    return 'p_demo_1'
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

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(KLUCZ_ZAPISU, JSON.stringify(projekt))
      } catch {
        /* zdjęcia jako dataURL potrafią przepełnić localStorage */
      }
    }, 500)
    return () => clearTimeout(id)
  }, [projekt])

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

  /* Załaduj gotowe sceny demonstracyjne Lovart z obsługą Object Transfer / Switch */
  const zaladujDemoLovart = useCallback(() => {
    const d = stworzDemoLovart()
    setProjekt(d.projekt)
    setWybranaWarstwa(d.wybranaWarstwa)
    setWybranaPineska(d.wybranaPineska)
    setWidok(d.widok)
    setMenuDodawania(false)
  }, [])

  const zaladujDemoPoraDnia = useCallback(() => {
    const wId = 'w_demo_car'
    setProjekt({
      warstwy: [
        {
          id: wId,
          type: 'image',
          src: carImg,
          x: 70,
          y: 60,
          width: 520,
          height: 350,
          naturalWidth: 1024,
          naturalHeight: 680,
          rotation: 0,
          name: 'Sport Car (Pora dnia / noc)',
          visible: true,
          locked: false,
          zrodlo: 'dysk',
          obiekty: ['samochód sportowy', 'droga asfaltowa', 'drzewa', 'niebo'],
        },
      ],
      pineski: [
        {
          id: 'p_car_1',
          layerId: wId,
          normalizedX: 0.5,
          normalizedY: 0.55,
          label: 'samochód sportowy',
          sugestie: ['auto', 'samochód', 'pojazd'],
          analizowana: false,
        },
      ],
      tekst: 'Zmień porę dnia na głęboką noc: włącz przednie reflektory rzucające snop światła na mokry asfalt, dodaj neonowe refleksy i gwiazdy na niebie',
      ramka: null,
    })
    setWybranaWarstwa(wId)
    setWybranaPineska('p_car_1')
    setWidok({ x: 60, y: 60, zoom: 0.85 })
    setMenuDodawania(false)
  }, [])

  const zaladujDemoStyl = useCallback(() => {
    const wId = 'w_demo_salon_styl'
    setProjekt({
      warstwy: [
        {
          id: wId,
          type: 'image',
          src: interiorImg,
          x: 70,
          y: 60,
          width: 520,
          height: 360,
          naturalWidth: 1024,
          naturalHeight: 768,
          rotation: 0,
          name: 'Salon (Styl Akwarela)',
          visible: true,
          locked: false,
          zrodlo: 'dysk',
          obiekty: ['salon', 'fotel wypoczynkowy', 'okno', 'stolik'],
        },
      ],
      pineski: [],
      tekst: 'Przekształć scenę w styl akwarela: miękkie przejścia kolorystyczne, delikatne zacieki pigmentu na fakturowanym papierze czerpanym',
      ramka: null,
    })
    setWybranaWarstwa(wId)
    setWybranaPineska(null)
    setWidok({ x: 60, y: 60, zoom: 0.85 })
    setMenuDodawania(false)
  }, [])

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

  /* Uruchomienie generacji z Nano-Banana */
  const uruchomGeneracje = useCallback(async () => {
    if (!warstwaZrodlowa) return
    setStanGeneracji({ faza: 'planuje' })

    try {
      // Kto jest obiektem, a kto miejscem — pytamy oko, nie kolejność pinesek.
      // Z tego kod wylicza płótno i role (patrz `uklad-pinesek.ts`).
      const rodzaje =
        intencja === 'wstaw' || intencja === 'przenies'
          ? await klasyfikujPineski(projekt.pineski, projekt.warstwy)
          : null
      const uklad = ustalUklad(projekt.pineski, projekt.warstwy, intencja, rodzaje)
      const obrazy = uklad.plotno
        ? kolejnoscObrazow(uklad.plotno, projekt.pineski, projekt.warstwy)
        : obrazyWejsciowe
      const zrodlo = obrazy[0]

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
          const rola = uklad.role[i + 1] ? ` — role: ${uklad.role[i + 1]}` : ''
          const ochrona = p.chroniona ? ' — PROTECTED, must stay unchanged' : ''
          return `Pin ${i + 1} "${etykietaPineski(p, i + 1)}" on Image ${nrObrazu}, ${polozenie(p.normalizedX, p.normalizedY)}${rola}${ochrona}`
        })
        .join('\n')

      const plan = await zaplanuj({
        zadanie: projekt.tekst,
        rusztowanie: polecenie,
        obrazy: obrazyDlaAgenta,
        uchwyty: uchwytyTekst,
      })

      setStanGeneracji({ faza: 'trwa', plan: plan?.plan })

      // Agent widział zdjęcia, więc jego tryb wygrywa z rozpoznaniem ze słów.
      // Jego opis obiektów i instrukcja wchodzą W rusztowanie — reguły kadru,
      // ochrony i czystego wyniku idą do modelu zawsze.
      const trybAgenta = INTENCJE.find(i => i.id === plan?.intencja)?.id ?? intencja

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

      const obszarCelu =
        trybAgenta === 'tlo' || trybAgenta === 'styl'
          ? undefined
          : ramkaCelu ?? plan?.obszar
      const obszarZrodla = trybAgenta === 'przenies' ? plan?.obszarZrodla : undefined
      const plotnoZObszarami = await narysujObszary(zrodlo, obszarCelu, obszarZrodla)

      const pelnePolecenie = zbudujPolecenie(projekt.tekst, projekt.pineski, obrazy, trybAgenta, {
        szczegoly: plan?.promptDlaModelu,
        instrukcja: plan?.instrukcja,
        role: uklad.role,
        obszary: plotnoZObszarami ? { cel: Boolean(obszarCelu), zrodlo: Boolean(obszarZrodla) } : undefined,
      })

      setOstatniPrompt(pelnePolecenie)

      const czyste = await Promise.all(obrazy.map(w => konwertujNaDataUrl(w.src)))
      const obrazyDoModelu = plotnoZObszarami ? [plotnoZObszarami, ...czyste.slice(1), czyste[0]] : czyste

      const wynik = await generuj({
        polecenie: pelnePolecenie,
        obrazy: obrazyDoModelu,
        szerokosc: zrodlo.naturalWidth,
        wysokosc: zrodlo.naturalHeight,
      })

      const nazwa = nazwijWynik(projekt.tekst, projekt.pineski)
      dodajZeZrodla(wynik.obrazUrl, nazwa, 'wynik', zrodlo)

      const gotowy = {
        ...wynik,
        nazwa,
        opis: plan?.plan || opiszZmiane(projekt.tekst, projekt.pineski, zrodlo),
      }
      setStanGeneracji({ faza: 'sprawdza', wynik: gotowy })

      const obszaryKontroli = [obszarCelu, obszarZrodla].filter((o): o is Prostokat => Boolean(o))
      const [ocena, nakladka] = await Promise.all([
        sprawdzWynik({
          zadanie: projekt.tekst,
          przed: (await zmniejszDoAnalizy(zrodlo.src)) || zrodlo.src,
          wynik: wynik.obrazUrl,
        }),
        plotnoZObszarami ? wykryjNakladke(wynik.obrazUrl, zrodlo.src, obszaryKontroli) : Promise.resolve(null),
      ])

      // Piksele rozstrzygają pewniej niż ocena modelu: różowa plama w obszarze
      // to ślad nakładki, niezależnie od tego, co zobaczył kontroler.
      const ocenaKoncowa = nakladka?.wykryto
        ? {
            wykonane: ocena?.wykonane ?? true,
            znaczniki: true,
            kosztTokenow: ocena?.kosztTokenow ?? 0,
            ocena:
              `W zaznaczonym obszarze zostało ok. ${Math.round(nakladka.udzial * 100)}% różowej nakładki — ` +
              `warto wygenerować ponownie. ${ocena?.ocena ?? ''}`.trim(),
          }
        : ocena

      setStanGeneracji({ faza: 'gotowe', wynik: gotowy, ocena: ocenaKoncowa ?? undefined })
    } catch (e) {
      setStanGeneracji({
        faza: 'blad',
        tresc: e instanceof Error ? e.message : 'Wystąpił błąd podczas generacji obrazu.',
      })
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

  /** Karta pineski przy kliknięciu na płótnie */
  const kartaPozycja = useMemo(() => {
    const p = projekt.pineski.find(x => x.id === wybranaPineska)
    const w = projekt.warstwy.find(x => x.id === p?.layerId)
    if (!p || !w) return null
    const poz = pozycjaPineski(p, w)
    return {
      pineska: p,
      warstwa: w,
      numer: projekt.pineski.indexOf(p) + 1,
      left: widok.x + poz.x * widok.zoom + 22,
      top: widok.y + poz.y * widok.zoom - 20,
    }
  }, [wybranaPineska, projekt, widok])

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
        onPrzesunPineske={(id, x, y) => zmienPineske(id, { normalizedX: x, normalizedY: y })}
        onWbijPineske={wbijPineske}
        onUpuscPliki={pliki => wstawPliki(pliki, 'upuszczenie')}
        ramka={projekt.ramka}
        onZmienRamke={ramka => setProjekt(p => ({ ...p, ramka }))}
        intencja={intencja}
        onZaladujDemo={zaladujDemoLovart}
        onOtworzDodawanie={() => refPlik.current?.click()}
      />

      {/* ══ Karta zaznaczonego obiektu na płótnie ══ */}
      {kartaPozycja && (
        <div
          className="absolute z-30 -translate-y-full"
          style={{ left: kartaPozycja.left, top: kartaPozycja.top }}
          onPointerDown={e => e.stopPropagation()}
        >
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
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        <div className="pointer-events-auto relative flex flex-col items-center gap-1.5 rounded-2xl border border-foreground/[0.08] p-1.5 shadow-2xl backdrop-blur-2xl nb-szklo nb-szklo-plynne nb-szklo-canvas">
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
            <MapPin className="h-4 w-4" />
          </Narzedzie>

          {/* Przesuwanie widoku (H) */}
          <Narzedzie
            tytul="Przesuwanie widoku (H)"
            aktywne={narzedzie === 'reka'}
            onClick={() => setNarzedzie('reka')}
          >
            <Hand className="h-4 w-4" />
          </Narzedzie>

          <span className="my-0.5 h-px w-6 bg-foreground/10" />

          {/* Dodaj zdjęcie & Sceny demo */}
          <Narzedzie
            tytul="Dodaj zdjęcie lub załaduj demo"
            aktywne={menuDodawania}
            onClick={() => setMenuDodawania(v => !v)}
          >
            <IkonaObrazu className="h-4 w-4" />
          </Narzedzie>

          {/* Lista zdjęć / warstw */}
          <Narzedzie
            tytul="Lista zdjęć na płótnie"
            aktywne={panelWarstw}
            onClick={() => setPanelWarstw(v => !v)}
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

          {/* Menu dodawania źródeł (wysuwane w prawo od paska po lewym boku) */}
          {menuDodawania && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 w-64 overflow-hidden rounded-2xl border border-foreground/[0.08] bg-[#11151c]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-40">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Gotowe szablony Lovart
              </div>
              <PozycjaMenu
                ikona={<Zap className="h-3.5 w-3.5 text-cyan-400" />}
                tytul="Demo Object Transfer"
                opis="Salon + krajobraz z 2 pineskami"
                onClick={zaladujDemoLovart}
              />
              <PozycjaMenu
                ikona={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}
                tytul="Demo Pora dnia (Auto nocą)"
                opis="Zmiana pory dnia z reflektorami"
                onClick={zaladujDemoPoraDnia}
              />
              <PozycjaMenu
                ikona={<Sparkles className="h-3.5 w-3.5 text-purple-400" />}
                tytul="Demo Styl Akwarela"
                opis="Salon w malarstwie akwarelowym"
                onClick={zaladujDemoStyl}
              />
              <div className="my-1 h-px bg-foreground/10" />
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
          )}
        </div>
      </div>

      {/* ══ PŁYWAJĄCY CHAT W STYLU LIQUID GLASS (PO PRAWEJ STRONIE) ══ */}
      <CzatCanvas
        pineski={projekt.pineski}
        warstwy={projekt.warstwy}
        tekst={projekt.tekst}
        onTekst={tekst => setProjekt(p => ({ ...p, tekst }))}
        onWybierzPineske={setWybranaPineska}
        wybranaPineska={wybranaPineska}
        onUsunPineske={usunPineske}
        onZmienNazwePineski={(id, label) => zmienPineske(id, { label })}
        onWlaczNarzędziePineska={() => setNarzedzie('pineska')}
        onGeneruj={uruchomGeneracje}
        stanGeneracji={stanGeneracji}
        powodBlokady={powodBlokady}
        trwa={['planuje', 'trwa', 'sprawdza'].includes(stanGeneracji.faza)}
        intencja={intencja}
        uwagi={uwagi}
        podgladPolecenia={ostatniPrompt || polecenie}
        onWstawNaPlotno={(url, nazwa) => dodajZeZrodla(url, nazwa, 'wynik', warstwaZrodlowa || undefined)}
      />

      {/* ══ Panel warstw (wysuwany) ══ */}
      {panelWarstw && (
        <div className="absolute left-20 top-4 z-20 w-64">
          <div className="nb-szklo nb-szklo-canvas overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/75 shadow-2xl backdrop-blur-2xl">
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
                      ? 'border-primary/40 bg-primary/15'
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
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 font-mono text-[11px] text-foreground/50 bg-card/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-foreground/[0.08] shadow-sm">
        {Math.round(widok.zoom * 100)}%
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
      title={tytul}
      onClick={onClick}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150',
        aktywne
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
          : 'text-foreground/60 hover:bg-foreground/10 hover:text-foreground active:scale-95',
      )}
    >
      {children}
      {odznaka !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-extrabold text-black shadow-sm">
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
