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
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KartaPineski } from '@/sections/canvas/KartaPineski'
import { PasekPolecenia } from '@/sections/canvas/PasekPolecenia'
import { KartaWyniku } from '@/sections/canvas/KartaWyniku'
import { generuj, nazwijWynik, opiszZmiane, rozpoznajObiekt, rozpoznajScene } from '@/sections/canvas/dostawca'
import { Plotno } from '@/sections/canvas/Plotno'
import { wykryjIntencje, zbudujPolecenie, type Intencja } from '@/sections/canvas/polecenia'
import { narysujMapeMiejsc, opiszMape } from '@/sections/canvas/mapa-miejsc'
import { sprawdzPolecenie } from '@/sections/canvas/kontrola-polecenia'
import {
  kolejnoscObrazow,
  nowyId,
  pozycjaPineski,
  wczytajProjekt,
  wytnijOkolice,
  type Narzedzie,
  type Pineska,
  type Warstwa,
  type Widok,
  type StanGeneracji,
  type ZrodloObrazu,
} from '@/sections/canvas/typy'

/**
 * Canvas — kanwa generatywna.
 *
 * Wrzucasz zdjęcia, wbijasz pineskę w konkretny obiekt i nazywasz go.
 * Nazwa staje się chipem w pasku polecenia, więc zamiast opisywać słowami,
 * o który z siedmiu przedmiotów na zdjęciu chodzi, po prostu się na niego
 * powołujesz.
 *
 * Generuje Runware (Nano Banana). Wynik wraca jako nowa warstwa obok
 * oryginału — źródło zostaje nietknięte, więc przed/po widać w jednym
 * kadrze, bez osobnego trybu porównania.
 */

const KLUCZ_ZAPISU = 'nb-canvas-projekt'

interface Projekt {
  warstwy: Warstwa[]
  pineski: Pineska[]
  tekst: string
}

const PUSTY: Projekt = { warstwy: [], pineski: [], tekst: '' }

export function CanvasSection() {
  const [projekt, setProjekt] = useState<Projekt>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      // Przez `wczytajProjekt`, nie przez samo rozpakowanie JSON-a: zapis
      // sprzed zmiany modelu ma pineski bez `label` i wywracał cały widok.
      if (zapisany) return wczytajProjekt(JSON.parse(zapisany))
    } catch {
      /* uszkodzony zapis — startujemy od zera */
    }
    return PUSTY
  })
  const [narzedzie, setNarzedzie] = useState<Narzedzie>('wybor')
  const [wybranaWarstwa, setWybranaWarstwa] = useState<string | null>(null)
  const [wybranaPineska, setWybranaPineska] = useState<string | null>(null)
  const [widok, setWidok] = useState<Widok>({ x: 90, y: 70, zoom: 0.7 })
  const [menuDodawania, setMenuDodawania] = useState(false)
  const [stanGeneracji, setStanGeneracji] = useState<StanGeneracji>({ faza: 'bezczynny' })
  /** Ręcznie wybrany tryb edycji. `null` = rozpoznany ze zdania. */
  const [trybReczny, setTrybReczny] = useState<Intencja | null>(null)
  const [panelWarstw, setPanelWarstw] = useState(false)
  const refPlik = useRef<HTMLInputElement>(null)
  const refRoot = useRef<HTMLDivElement>(null)
  const [rozmiar, setRozmiar] = useState({ szer: 0, wys: 0 })

  /* Pasek polecenia kotwiczy się przy obiekcie, więc musi wiedzieć, gdzie
     kończy się płótno — inaczej przy zdjęciu na skraju wyjeżdża poza ekran. */
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
        /* zdjęcia jako dataURL potrafią przepełnić localStorage — trudno */
      }
    }, 500)
    return () => clearTimeout(id)
  }, [projekt])

  /* ── Wczytywanie zdjęć ─────────────────────────────────────────── */

  /**
   * `wzorzec` to warstwa, obok której ma stanąć nowa i w której rozmiarze
   * ma się wyświetlić. Używane przy wynikach generacji: model oddaje obraz
   * w mniejszej rozdzielczości niż wejście (np. 848×1264 z 1453×2182), więc
   * bez tego wynik lądował na płótnie w innej skali niż oryginał i porównanie
   * „na oko” pokazywało różnicę, której w rzeczywistości nie ma.
   */
  const dodajZeZrodla = useCallback(
    (src: string, nazwa: string, zrodlo: ZrodloObrazu, wzorzec?: Warstwa) => {
    const obrazek = new Image()
    obrazek.crossOrigin = 'anonymous'
    obrazek.onload = () => {
      setProjekt(p => {
        // Nowe zdjęcia dokładamy w rzędzie, po prawej od dotychczasowych.
        // Układanie na stosie albo schodkowo sprawiało, że pineski z jednego
        // zdjęcia wyświetlały się na tle drugiego i nie dało się ich rozdzielić.
        const skala = Math.min(1, 460 / obrazek.width)
        const prawaKrawedz = p.warstwy.reduce((maks, w) => Math.max(maks, w.x + w.width), 0)
        const x = p.warstwy.length === 0 ? 60 : prawaKrawedz + 48
        // Wynik dostaje dokładnie tę samą wysokość co edytowany oryginał,
        // a szerokość z własnych proporcji — różnica w kadrze jest wtedy
        // różnicą kadru, a nie artefaktem skalowania na płótnie.
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

      // Rozpoznanie sceny leci w tle — użytkownik w tym czasie już pracuje.
      // Wyników generacji nie inwentaryzujemy: wiemy o nich z polecenia.
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
  }, [])

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
      // Odczyt schowka wymaga zgody i nie działa w każdej przeglądarce —
      // Ctrl+V zawsze zadziała, więc na to kierujemy.
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
    // Pineski są przyczepione do warstwy, więc znikają razem z nią —
    // osierocona pineska nie ma do czego się odnieść.
    setProjekt(p => ({
      ...p,
      warstwy: p.warstwy.filter(w => w.id !== id),
      pineski: p.pineski.filter(x => x.layerId !== id),
    }))
    setWybranaWarstwa(s => (s === id ? null : s))
  }, [])

  /* ── Pineski ───────────────────────────────────────────────────── */

  const wbijPineske = useCallback(
    (layerId: string, normalizedX: number, normalizedY: number) => {
      const pineska: Pineska = {
        id: nowyId('p'),
        layerId,
        normalizedX,
        normalizedY,
        label: '',
        analizowana: true,
      }
      setProjekt(p => ({ ...p, pineski: [...p.pineski, pineska] }))
      setWybranaPineska(pineska.id)
      // Po wbiciu wracamy do wyboru — seria pinesek pod rząd zdarza się
      // rzadziej niż jedna i od razu jej nazwanie.
      setNarzedzie('wybor')

      // Mikro-AI nazywa obiekt za użytkownika. Wysyłamy sam wycinek wokół
      // pineski, nie całe zdjęcie: taniej, szybciej i bez podpowiadania
      // modelowi rzeczy z drugiego końca kadru.
      const warstwa = projekt.warstwy.find(w => w.id === layerId)
      if (!warstwa) return
      void (async () => {
        const wycinek = await wytnijOkolice(warstwa.src, normalizedX, normalizedY, 384, 0.3)
        const zWycinka = wycinek ? await rozpoznajObiekt(wycinek) : []

        // Gdy wycinek nic nie mówi (kawałek trawy, fragment nieba), sięgamy
        // po inwentarz całej sceny — lepsza jakakolwiek sensowna nazwa niż
        // bezużyteczne „obiekt 1”.
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
                  // Pierwszą propozycję wstawiamy od razu, ale tylko gdy
                  // użytkownik nie zdążył wpisać swojej.
                  label: (x.label ?? '').trim() || nazwy[0] || '',
                }
              : x,
          ),
        }))
      })()
    },
    [projekt.warstwy],
  )

  const zmienPineske = useCallback((id: string, zmiany: Partial<Pineska>) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.map(x => (x.id === id ? { ...x, ...zmiany } : x)) }))
  }, [])

  const usunPineske = useCallback((id: string) => {
    setProjekt(p => ({ ...p, pineski: p.pineski.filter(x => x.id !== id) }))
    setWybranaPineska(s => (s === id ? null : s))
  }, [])

  /* ── Skróty ────────────────────────────────────────────────────── */

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
      const skroty: Record<string, Narzedzie> = { v: 'wybor', p: 'pineska', h: 'reka' }
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

  /* ── Pochodne ──────────────────────────────────────────────────── */

  /** Warstwa, którą model edytuje: ta z pineskami, inaczej zaznaczona, inaczej pierwsza. */
  const warstwaZrodlowa = useMemo(() => {
    const zPineski = projekt.pineski[0]
      ? projekt.warstwy.find(w => w.id === projekt.pineski[0].layerId)
      : undefined
    return zPineski ?? projekt.warstwy.find(w => w.id === wybranaWarstwa) ?? projekt.warstwy[0] ?? null
  }, [projekt.pineski, projekt.warstwy, wybranaWarstwa])

  /** Zdjęcia lecące na wejście modelu — pierwsze jest to edytowane. */
  const obrazyWejsciowe = useMemo(
    () => kolejnoscObrazow(warstwaZrodlowa, projekt.pineski, projekt.warstwy),
    [warstwaZrodlowa, projekt.pineski, projekt.warstwy],
  )

  /** Tryb edycji: ręczny wybór wygrywa z rozpoznaniem ze zdania. */
  const intencja = useMemo(
    () => trybReczny ?? wykryjIntencje(projekt.tekst),
    [trybReczny, projekt.tekst],
  )

  /** Legenda mapy miejsc — pusta, gdy na edytowanym zdjęciu nie ma pinesek. */
  const legendaMapy = useMemo(
    () => (warstwaZrodlowa ? opiszMape(warstwaZrodlowa, projekt.pineski) : ''),
    [warstwaZrodlowa, projekt.pineski],
  )

  const polecenie = useMemo(
    () => zbudujPolecenie(projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja, legendaMapy),
    [projekt.tekst, projekt.pineski, obrazyWejsciowe, intencja, legendaMapy],
  )

  /**
   * Kontrola polecenia przed wysyłką — generacja kosztuje i trwa, więc
   * sprzeczności i braki lepiej pokazać przed kliknięciem niż po.
   */
  const uwagi = useMemo(
    () => sprawdzPolecenie(projekt.tekst, projekt.pineski, projekt.warstwy, intencja),
    [projekt.tekst, projekt.pineski, projekt.warstwy, intencja],
  )

  const powodBlokady = useMemo(() => {
    if (projekt.warstwy.length === 0) return 'Najpierw wrzuć zdjęcie na płótno'
    if (!projekt.tekst.trim()) return 'Napisz, co ma powstać'
    if (stanGeneracji.faza === 'trwa') return 'Model właśnie pracuje'
    const blokujaca = uwagi.find(u => u.waga === 'blokada')
    if (blokujaca) return blokujaca.tresc
    return null
  }, [projekt, stanGeneracji, uwagi])

  /* ── Generowanie ───────────────────────────────────────────────── */

  const uruchomGeneracje = useCallback(async () => {
    if (!warstwaZrodlowa) return
    setStanGeneracji({ faza: 'trwa' })

    try {
      // Mapa miejsc: kopia edytowanego zdjęcia z celownikami w punktach
      // pinesek. Bez niej model dostaje tylko słowny opis położenia i trafia
      // w inne miejsce — a pineska istnieje po to, żeby wskazać punkt.
      const mapa = await narysujMapeMiejsc(warstwaZrodlowa, projekt.pineski)

      const wynik = await generuj({
        polecenie,
        // Wszystkie zdjęcia z pineskami, nie tylko edytowane: obiekt, który
        // ma się „tu pojawić”, często leży na zupełnie innym zdjęciu.
        // Mapa idzie na końcu, bo jest instrukcją, a nie materiałem.
        obrazy: [...obrazyWejsciowe.map(w => w.src), ...(mapa ? [mapa] : [])],
        szerokosc: warstwaZrodlowa.naturalWidth,
        wysokosc: warstwaZrodlowa.naturalHeight,
      })

      const nazwa = nazwijWynik(projekt.tekst, projekt.pineski)
      dodajZeZrodla(wynik.obrazUrl, nazwa, 'wynik', warstwaZrodlowa)
      setStanGeneracji({
        faza: 'gotowe',
        wynik: {
          ...wynik,
          nazwa,
          opis: opiszZmiane(projekt.tekst, projekt.pineski, warstwaZrodlowa),
        },
      })
    } catch (e) {
      setStanGeneracji({ faza: 'blad', tresc: e instanceof Error ? e.message : 'Nieznany błąd' })
    }
  }, [warstwaZrodlowa, obrazyWejsciowe, polecenie, projekt.tekst, projekt.pineski, dodajZeZrodla])

  /** Karta pineski chodzi za pineską, więc liczymy jej pozycję na ekranie. */
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

  /**
   * Pasek polecenia chodzi za zaznaczeniem, a nie stoi na środku dołu.
   * Kotwiczymy go pod dolną krawędzią zdjęcia, którego dotyczy, żeby
   * polecenie było przy obiekcie, o którym mówi.
   */
  const kotwicaPaska = useMemo(() => {
    if (!warstwaZrodlowa) return null
    const czyCokolwiekZaznaczone = wybranaWarstwa !== null || wybranaPineska !== null
    if (!czyCokolwiekZaznaczone) return null
    const polowaPaska = 310 // połowa szerokości paska polecenia
    const marginesDoku = 16 // bez doku zostaje sam margines
    const dolnyPasek = 96 // wysokość paska narzędzi z zapasem

    const najmniej = polowaPaska + 16
    const najwiecej = rozmiar.szer - marginesDoku - polowaPaska
    const surowyLeft = widok.x + (warstwaZrodlowa.x + warstwaZrodlowa.width / 2) * widok.zoom
    const surowyTop = widok.y + (warstwaZrodlowa.y + warstwaZrodlowa.height) * widok.zoom + 14

    return {
      // Gdy okno jest węższe niż pasek + dok, środkujemy w wolnej przestrzeni
      // zamiast wpychać pasek pod dok.
      left: najwiecej < najmniej ? (rozmiar.szer - marginesDoku) / 2 : Math.min(Math.max(surowyLeft, najmniej), najwiecej),
      top: Math.max(16, Math.min(surowyTop, rozmiar.wys - dolnyPasek - 132)),
    }
  }, [warstwaZrodlowa, wybranaWarstwa, wybranaPineska, widok, rozmiar])

  return (
    <div ref={refRoot} className="relative h-full min-h-0 w-full overflow-hidden">
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
      />

      {/* ══ Karta zaznaczonego obiektu ══ */}
      {kartaPozycja && (
        <div
          // Karta otwiera się w górę od pineski: w dół wchodziłaby na pasek
          // polecenia, który kotwiczy się pod dolną krawędzią zdjęcia.
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

      {/* ══ Zoom ══ */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 font-mono text-[11px] text-foreground/35">
        {Math.round(widok.zoom * 100)}%
      </div>

      {/* ══ Panel warstw ══ */}
      {panelWarstw && (
        <div className="absolute left-4 top-4 z-20 w-64">
          <div className="nb-szklo nb-szklo-canvas overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-2xl">
          <div className="px-3 pb-1.5 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground/45">
            Zdjęcia ({projekt.warstwy.length})
          </div>
          <div className="max-h-72 overflow-y-auto px-2 pb-2 scrollbar-none">
            {projekt.warstwy.length === 0 && (
              <p className="px-2 py-3 text-[11px] leading-relaxed text-foreground/30">
                Pusto. Dodaj zdjęcie przyciskiem na dolnym pasku.
              </p>
            )}
            {[...projekt.warstwy].reverse().map(w => (
              <div
                key={w.id}
                onClick={() => setWybranaWarstwa(w.id)}
                className={cn(
                  'group flex cursor-default items-center gap-2 rounded-lg p-1.5 transition-colors',
                  wybranaWarstwa === w.id ? 'bg-primary/25' : 'hover:bg-foreground/5',
                )}
              >
                <img src={w.src} alt="" className="h-8 w-8 shrink-0 rounded object-cover ring-1 ring-border/10" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium text-foreground/80">{w.name}</div>
                  <div className="text-[9px] text-foreground/30">
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
                <IkonaWarstwy tytul="Usuń zdjęcie i jego pineski" onClick={() => usunWarstwe(w.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </IkonaWarstwy>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* ══ Pasek polecenia — przy zaznaczonym obiekcie ══ */}
      {kotwicaPaska && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2"
          style={{ left: kotwicaPaska.left, top: kotwicaPaska.top }}
        >
          <KartaWyniku stan={stanGeneracji} onZamknij={() => setStanGeneracji({ faza: 'bezczynny' })} />

          <PasekPolecenia
            pineski={projekt.pineski}
            warstwy={projekt.warstwy}
            tekst={projekt.tekst}
            onTekst={tekst => setProjekt(p => ({ ...p, tekst }))}
            onWybierzPineske={setWybranaPineska}
            onUsunPineske={usunPineske}
            podglad={polecenie}
            onGeneruj={uruchomGeneracje}
            powodBlokady={powodBlokady}
            trwa={stanGeneracji.faza === 'trwa'}
            intencja={intencja}
            trybReczny={trybReczny}
            onTryb={setTrybReczny}
            uwagi={uwagi}
          />
        </div>
      )}

      {/* ══ Narzędzia ══ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2.5">
        <div className="pointer-events-auto relative flex items-center gap-1 rounded-2xl border border-border/10 bg-[#11151c]/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <Narzedzie
            tytul="Wybór i przesuwanie (V)"
            aktywne={narzedzie === 'wybor'}
            onClick={() => setNarzedzie('wybor')}
          >
            <MousePointer2 className="h-4 w-4" />
          </Narzedzie>
          <Narzedzie
            tytul="Pineska — zaznacz obiekt (P)"
            aktywne={narzedzie === 'pineska'}
            onClick={() => setNarzedzie('pineska')}
          >
            <MapPin className="h-4 w-4" />
          </Narzedzie>
          <Narzedzie tytul="Przesuwanie widoku (H)" aktywne={narzedzie === 'reka'} onClick={() => setNarzedzie('reka')}>
            <Hand className="h-4 w-4" />
          </Narzedzie>

          <span className="mx-1 h-6 w-px bg-foreground/10" />

          <Narzedzie tytul="Dodaj zdjęcie" aktywne={menuDodawania} onClick={() => setMenuDodawania(v => !v)}>
            <IkonaObrazu className="h-4 w-4" />
          </Narzedzie>
          <Narzedzie
            tytul="Lista zdjęć"
            aktywne={panelWarstw}
            onClick={() => setPanelWarstw(v => !v)}
            odznaka={projekt.warstwy.length || undefined}
          >
            <Layers className="h-4 w-4" />
          </Narzedzie>
          <Narzedzie tytul="Dopasuj widok" onClick={() => setWidok({ x: 90, y: 70, zoom: 0.7 })}>
            <Maximize className="h-4 w-4" />
          </Narzedzie>

          {/* Menu źródeł — „z dysku i jeszcze inne” */}
          {menuDodawania && (
            <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-border/10 bg-[#11151c]/97 p-1 shadow-2xl backdrop-blur-xl">
              <PozycjaMenu
                ikona={<Upload className="h-3.5 w-3.5" />}
                tytul="Z dysku"
                opis="wybierz pliki z komputera"
                onClick={() => refPlik.current?.click()}
              />
              <PozycjaMenu
                ikona={<IkonaObrazu className="h-3.5 w-3.5" />}
                tytul="Ze schowka"
                opis="albo po prostu Ctrl+V"
                onClick={wstawZeSchowka}
              />
              <PozycjaMenu
                ikona={<Link2 className="h-3.5 w-3.5" />}
                tytul="Z adresu"
                opis="wklej link do zdjęcia"
                onClick={wstawZAdresu}
              />
              <p className="px-2.5 py-1.5 text-[10px] leading-snug text-foreground/25">
                Zdjęcia możesz też po prostu przeciągnąć na płótno.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Drobiazgi ───────────────────────────────────────────────────── */

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
        'relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
        aktywne ? 'bg-white text-[#11151c]' : 'text-foreground/55 hover:bg-foreground/10 hover:text-foreground',
      )}
    >
      {children}
      {odznaka !== undefined && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-foreground">
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
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-foreground/8"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/8 text-foreground/70">
        {ikona}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-foreground/85">{tytul}</span>
        <span className="block truncate text-[10px] text-foreground/35">{opis}</span>
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
      className="shrink-0 text-foreground/25 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
    >
      {children}
    </button>
  )
}
