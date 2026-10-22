import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  Circle,
  Clock,
  Code2,
  Copy,
  Download,
  Grid3x3,
  Group,
  Hand,
  Image as IkonaObrazu,
  Maximize,
  MousePointer2,
  PenTool,
  Play,
  Redo2,
  RotateCcw,
  Spline,
  Square,
  Trash2,
  Type,
  Undo2,
  Ungroup,
  Workflow,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GrafStanow } from '@/sections/edytor/GrafStanow'
import { potomkowie, rozgrupuj, rozloz, utworzGrupe, wyrownaj, type TrybWyrownania } from '@/sections/edytor/grupy'
import { Kanwa, type Widok } from '@/sections/edytor/Kanwa'
import { Inspektor } from '@/sections/edytor/Inspektor'
import { OsCzasu } from '@/sections/edytor/OsCzasu'
import { PanelBiblioteki } from '@/sections/edytor/PanelBiblioteki'
import type { PozycjaBiblioteki, PresetAnimacji } from '@/sections/edytor/biblioteka'
import { pobierzPlik, rozszerzenie, wygenerujKod, type FormatEksportu } from '@/sections/edytor/eksport'
import { ID_BAZY, wezlyWStanie, zapiszNadpisanie, type Przejscie, type Stan } from '@/sections/edytor/stany'
import { KRZYWE_CSS } from '@/sections/edytor/animacja'
import { bazowyWezel, nowyId, type Narzedzie, type Projekt, type Wezel } from '@/sections/edytor/typy'

/**
 * Edytor: kanwa wektorowa + kafelki z biblioteki + oś czasu + eksport kodu.
 * Stan projektu żyje tutaj; panele dostają go przez propsy, żeby historia
 * cofania miała jedno źródło prawdy.
 */

const KLUCZ_ZAPISU = 'nb-edytor-projekt'

function pustyProjekt(): Projekt {
  return {
    nazwa: 'Nowa scena',
    szerokosc: 960,
    wysokosc: 600,
    tlo: '#0b0f14',
    dlugosc: 2000,
    wezly: [
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Kafelek Premium',
        x: 120,
        y: 150,
        w: 240,
        h: 300,
        promien: 18,
        efekt: 'gradient',
        akcent: '#a78bfa',
        tresc: {
          znaczek: 'Popularny',
          tytul: 'Premium',
          podtytul: 'Pełny dostęp do funkcji AI',
          cena: '82',
          sufiks: 'zł/m',
          punkty: ['Wsparcie priorytetowe', 'Nielimitowane projekty'],
          cta: 'Wybierz Premium',
        },
      }),
      bazowyWezel({
        typ: 'sciezka',
        nazwa: 'Włącznik',
        x: 460,
        y: 200,
        w: 120,
        h: 120,
        obrys: '#38bdf8',
        wypelnienie: 'none',
        grubosc: 7,
        zamknieta: true,
        punkty: [
          { x: 40, y: 34, zx: 80, zy: 34 },
          { x: 80, y: 34, zx: 106, zy: 34 },
          { x: 106, y: 60, zx: 106, zy: 86 },
          { x: 80, y: 86, zx: 40, zy: 86 },
          { x: 40, y: 86, zx: 14, zy: 86 },
          { x: 14, y: 60, zx: 14, zy: 34 },
        ],
      }),
    ],
  }
}

export function EdytorSection() {
  const [projekt, setProjekt] = useState<Projekt>(() => {
    try {
      const zapisany = localStorage.getItem(KLUCZ_ZAPISU)
      if (zapisany) return JSON.parse(zapisany) as Projekt
    } catch {
      /* uszkodzony zapis — startujemy od nowa */
    }
    return pustyProjekt()
  })
  const [wybrane, setWybrane] = useState<string[]>([])
  const [narzedzie, setNarzedzie] = useState<Narzedzie>('wybor')
  const [widok, setWidok] = useState<Widok>({ x: 40, y: 30, zoom: 0.8 })
  const [czas, setCzas] = useState(0)
  const [odtwarzanie, setOdtwarzanie] = useState(false)
  const [petla, setPetla] = useState(true)
  const [siatka, setSiatka] = useState(8)
  const [trybPunktow, setTrybPunktow] = useState(false)
  const [eksport, setEksport] = useState<FormatEksportu | null>(null)
  /** null = scena bazowa; inaczej id edytowanego stanu */
  const [aktywnyStan, setAktywnyStan] = useState<string | null>(null)
  const [dolnyPanel, setDolnyPanel] = useState<'os' | 'stany'>('os')
  /** tryb podglądu: który stan jest pokazywany i z jaką animacją */
  const [podglad, setPodglad] = useState<{ stan: string; przejscie: string } | null>(null)

  /* ── Historia ────────────────────────────────────────────────── */

  const refPlik = useRef<HTMLInputElement>(null)

  const stos = useRef<Projekt[]>([structuredClone(projekt)])
  const indeks = useRef(0)
  const refProjekt = useRef(projekt)
  refProjekt.current = projekt

  const zatwierdz = useCallback(() => {
    stos.current = stos.current.slice(0, indeks.current + 1)
    stos.current.push(structuredClone(refProjekt.current))
    if (stos.current.length > 80) stos.current.shift()
    indeks.current = stos.current.length - 1
  }, [])

  const cofnij = useCallback(() => {
    if (indeks.current === 0) return
    indeks.current -= 1
    setProjekt(structuredClone(stos.current[indeks.current]))
  }, [])

  const ponow = useCallback(() => {
    if (indeks.current >= stos.current.length - 1) return
    indeks.current += 1
    setProjekt(structuredClone(stos.current[indeks.current]))
  }, [])

  /* ── Zapis ───────────────────────────────────────────────────── */

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(KLUCZ_ZAPISU, JSON.stringify(projekt))
      } catch {
        /* brak miejsca — nie blokujemy pracy */
      }
    }, 400)
    return () => clearTimeout(id)
  }, [projekt])

  /* ── Operacje na węzłach ─────────────────────────────────────── */

  /**
   * Jedyny punkt zapisu zmian węzła. Gdy aktywny jest stan, zmiana nie
   * rusza sceny bazowej, tylko ląduje jako nadpisanie tego stanu — dzięki
   * temu „przesuń kropkę w prawo” w stanie WŁĄCZONY nie psuje stanu
   * WYŁĄCZONY i nie trzeba pamiętać, na czym się właśnie pracuje.
   */
  const aktualizuj = useCallback(
    (id: string, zmiany: Partial<Wezel>) => {
      setProjekt(p => {
        if (!aktywnyStan) {
          return { ...p, wezly: p.wezly.map(w => (w.id === id ? { ...w, ...zmiany } : w)) }
        }
        const bazowy = p.wezly.find(w => w.id === id)
        const stan = (p.stany ?? []).find(s => s.id === aktywnyStan)
        if (!bazowy || !stan) return p
        return {
          ...p,
          stany: (p.stany ?? []).map(s => (s.id === aktywnyStan ? zapiszNadpisanie(s, bazowy, zmiany) : s)),
        }
      })
    },
    [aktywnyStan],
  )

  const dodaj = useCallback(
    (wezel: Wezel) => {
      setProjekt(p => ({ ...p, wezly: [...p.wezly, wezel] }))
      setWybrane([wezel.id])
      setTimeout(zatwierdz, 0)
    },
    [zatwierdz],
  )

  const usun = useCallback(
    (id: string) => {
      setProjekt(p => {
        // Usunięcie grupy zabiera jej zawartość — inaczej dzieci zostałyby
        // na scenie z `rodzic` wskazującym na nieistniejący węzeł.
        const doUsuniecia = new Set([id, ...potomkowie(p.wezly, id).map(w => w.id)])
        return { ...p, wezly: p.wezly.filter(w => !doUsuniecia.has(w.id)) }
      })
      setWybrane(s => s.filter(x => x !== id))
      setTimeout(zatwierdz, 0)
    },
    [zatwierdz],
  )

  const duplikuj = useCallback(
    (id: string) => {
      const zrodlo = refProjekt.current.wezly.find(w => w.id === id)
      if (!zrodlo) return
      const kopia: Wezel = {
        ...structuredClone(zrodlo),
        id: nowyId(),
        nazwa: zrodlo.nazwa + ' kopia',
        x: zrodlo.x + 24,
        y: zrodlo.y + 24,
        klatki: zrodlo.klatki.map(k => ({ ...k, id: nowyId('k') })),
      }
      dodaj(kopia)
    },
    [dodaj],
  )

  const przesunWarstwe = useCallback(
    (id: string, kierunek: -1 | 1) => {
      setProjekt(p => {
        const i = p.wezly.findIndex(w => w.id === id)
        const j = i + kierunek
        if (i < 0 || j < 0 || j >= p.wezly.length) return p
        const wezly = [...p.wezly]
        ;[wezly[i], wezly[j]] = [wezly[j], wezly[i]]
        return { ...p, wezly }
      })
      setTimeout(zatwierdz, 0)
    },
    [zatwierdz],
  )

  /* ── Grupy ─────────────────────────────────────────────────────── */

  const grupuj = useCallback(() => {
    if (wybrane.length < 2) return
    const wynik = utworzGrupe(refProjekt.current.wezly, wybrane)
    setProjekt(p => ({ ...p, wezly: wynik.wezly }))
    setWybrane(wynik.zaznacz)
    setTimeout(zatwierdz, 0)
  }, [wybrane, zatwierdz])

  const rozbijGrupe = useCallback(() => {
    const wynik = rozgrupuj(refProjekt.current.wezly, wybrane)
    setProjekt(p => ({ ...p, wezly: wynik.wezly }))
    setWybrane(wynik.zaznacz)
    setTimeout(zatwierdz, 0)
  }, [wybrane, zatwierdz])

  /* ── Wyrównywanie ──────────────────────────────────────────────── */

  const wyrownajSelekcje = useCallback(
    (tryb: TrybWyrownania) => {
      const p = refProjekt.current
      const wezly = wyrownaj(p.wezly, wybrane, tryb, { x: 0, y: 0, w: p.szerokosc, h: p.wysokosc })
      setProjekt(stary => ({ ...stary, wezly }))
      setTimeout(zatwierdz, 0)
    },
    [wybrane, zatwierdz],
  )

  const rozlozSelekcje = useCallback(
    (os: 'x' | 'y') => {
      const wezly = rozloz(refProjekt.current.wezly, wybrane, os)
      setProjekt(stary => ({ ...stary, wezly }))
      setTimeout(zatwierdz, 0)
    },
    [wybrane, zatwierdz],
  )

  /* ── Obrazy ────────────────────────────────────────────────────── */

  /**
   * Obraz wchodzi jako dataURL, nie jako adres bloba — projekt musi
   * przeżyć odświeżenie strony, a blob: umiera razem z sesją.
   */
  const wstawObraz = useCallback(
    (plik: File) => {
      if (!plik.type.startsWith('image/')) return
      const czytnik = new FileReader()
      czytnik.onload = () => {
        const zrodlo = String(czytnik.result)
        const obrazek = new Image()
        obrazek.onload = () => {
          // Wchodzi w oryginalnych proporcjach, zmieszczony w dokumencie.
          const maks = Math.min(refProjekt.current.szerokosc * 0.6, 520)
          const skala = Math.min(1, maks / obrazek.width)
          dodaj(
            bazowyWezel({
              typ: 'obraz',
              nazwa: plik.name.replace(/\.[^.]+$/, '') || 'Obraz',
              x: Math.round(refProjekt.current.szerokosc / 2 - (obrazek.width * skala) / 2),
              y: Math.round(refProjekt.current.wysokosc / 2 - (obrazek.height * skala) / 2),
              w: Math.round(obrazek.width * skala),
              h: Math.round(obrazek.height * skala),
              promien: 0,
              zrodlo,
              dopasowanie: 'wypelnij',
            }),
          )
        }
        obrazek.src = zrodlo
      }
      czytnik.readAsDataURL(plik)
    },
    [dodaj],
  )

  // Wklejanie i upuszczanie plików — bez tego wrzucenie zdjęcia wymagałoby
  // przejścia przez okno wyboru pliku za każdym razem.
  useEffect(() => {
    const naWklejenie = (e: ClipboardEvent) => {
      const pliki = [...(e.clipboardData?.items ?? [])]
        .filter(i => i.kind === 'file' && i.type.startsWith('image/'))
        .map(i => i.getAsFile())
        .filter((f): f is File => f !== null)
      if (pliki.length === 0) return
      e.preventDefault()
      pliki.forEach(wstawObraz)
    }
    window.addEventListener('paste', naWklejenie)
    return () => window.removeEventListener('paste', naWklejenie)
  }, [wstawObraz])

  /** Wstawianie z biblioteki — na środek aktualnego widoku. */
  const wstaw = useCallback(
    (pozycja: PozycjaBiblioteki) => {
      const wezel = pozycja.utworz()
      wezel.x = Math.round(refProjekt.current.szerokosc / 2 - wezel.w / 2)
      wezel.y = Math.round(refProjekt.current.wysokosc / 2 - wezel.h / 2)
      dodaj(wezel)
    },
    [dodaj],
  )

  const zastosujAnimacje = useCallback(
    (preset: PresetAnimacji) => {
      const id = wybrane[0]
      const wezel = refProjekt.current.wezly.find(w => w.id === id)
      if (!wezel) return
      aktualizuj(id, { klatki: preset.klatki(wezel, refProjekt.current.dlugosc) })
      setCzas(0)
      setOdtwarzanie(true)
      setTimeout(zatwierdz, 0)
    },
    [wybrane, aktualizuj, zatwierdz],
  )

  /* ── Odtwarzanie ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!odtwarzanie) return
    let klatka = 0
    let poprzedni = performance.now()
    const krok = (teraz: number) => {
      const delta = teraz - poprzedni
      poprzedni = teraz
      setCzas(t => {
        const nowy = t + delta
        if (nowy >= refProjekt.current.dlugosc) {
          if (petla) return nowy % refProjekt.current.dlugosc
          setOdtwarzanie(false)
          return refProjekt.current.dlugosc
        }
        return nowy
      })
      klatka = requestAnimationFrame(krok)
    }
    klatka = requestAnimationFrame(krok)
    return () => cancelAnimationFrame(klatka)
  }, [odtwarzanie, petla])

  /* ── Skróty klawiszowe ───────────────────────────────────────── */

  useEffect(() => {
    const naKlawisz = (e: KeyboardEvent) => {
      const cel = e.target as HTMLElement
      if (cel && ['INPUT', 'TEXTAREA', 'SELECT'].includes(cel.tagName)) return

      if (e.key === 'Escape') {
        setEksport(null)
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? ponow() : cofnij()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (wybrane[0]) duplikuj(wybrane[0])
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        e.shiftKey ? rozbijGrupe() : grupuj()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setWybrane(refProjekt.current.wezly.filter(w => !w.rodzic).map(w => w.id))
        return
      }
      if (e.ctrlKey || e.metaKey) return

      const skroty: Record<string, Narzedzie> = { v: 'wybor', r: 'prostokat', o: 'elipsa', p: 'piora', t: 'tekst', h: 'reka' }
      const n = skroty[e.key.toLowerCase()]
      if (n) {
        setNarzedzie(n)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        wybrane.forEach(usun)
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        setOdtwarzanie(v => !v)
        return
      }
      if (e.key.startsWith('Arrow') && wybrane.length) {
        e.preventDefault()
        const krok = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -krok : e.key === 'ArrowRight' ? krok : 0
        const dy = e.key === 'ArrowUp' ? -krok : e.key === 'ArrowDown' ? krok : 0
        for (const id of wybrane) {
          const w = refProjekt.current.wezly.find(x => x.id === id)
          if (w) aktualizuj(id, { x: w.x + dx, y: w.y + dy })
        }
        zatwierdz()
      }
    }
    window.addEventListener('keydown', naKlawisz)
    return () => window.removeEventListener('keydown', naKlawisz)
  }, [wybrane, cofnij, ponow, duplikuj, usun, aktualizuj, zatwierdz, grupuj, rozbijGrupe])

  /* ── Widok ───────────────────────────────────────────────────── */

  const dopasuj = () => setWidok({ x: 40, y: 30, zoom: 0.8 })

  /* ── Podgląd ───────────────────────────────────────────────────
   * Ta sama maszyna stanów, którą generuje eksport, tylko uruchomiona
   * na żywo w edytorze. Dzięki temu „czy to działa” sprawdza się jednym
   * kliknięciem, a nie kopiowaniem kodu do innego projektu.
   */

  const wyzwol = useCallback(
    (idWezla: string, rodzaj: 'klik' | 'najechanie') => {
      setPodglad(biezacy => {
        if (!biezacy) return biezacy
        const p = (refProjekt.current.przejscia ?? []).find(
          x => x.od === biezacy.stan && x.wyzwalacz === rodzaj && (!x.element || x.element === idWezla),
        )
        if (!p) return biezacy
        return { stan: p.do, przejscie: `all ${p.czas}ms ${KRZYWE_CSS[p.wygladzanie]} ${p.opoznienie}ms` }
      })
    },
    [],
  )

  // Przejścia automatyczne — odpalają się same po wejściu w stan.
  useEffect(() => {
    if (!podglad) return
    const p = (projekt.przejscia ?? []).find(x => x.od === podglad.stan && x.wyzwalacz === 'auto')
    if (!p) return
    const id = setTimeout(
      () => setPodglad({ stan: p.do, przejscie: `all ${p.czas}ms ${KRZYWE_CSS[p.wygladzanie]}` }),
      p.opoznienie,
    )
    return () => clearTimeout(id)
  }, [podglad, projekt.przejscia])

  // Kanwa i inspektor pracują na scenie złożonej z bazy i aktywnego stanu.
  // Operacje strukturalne (dodawanie, warstwy, grupy) dalej idą na bazę.
  const projektWidoczny = useMemo(() => {
    const idStanu = podglad ? podglad.stan : aktywnyStan
    const stan = (projekt.stany ?? []).find(s => s.id === idStanu)
    if (!stan) return projekt
    return { ...projekt, wezly: wezlyWStanie(projekt.wezly, stan) }
  }, [projekt, aktywnyStan, podglad])

  const wybranyWezel = useMemo(
    () => (wybrane.length === 1 ? projektWidoczny.wezly.find(w => w.id === wybrane[0]) : undefined),
    [wybrane, projektWidoczny.wezly],
  )

  const kod = eksport ? wygenerujKod(projekt, eksport) : ''

  return (
    <div className="flex h-full min-h-0 flex-col">
      <input
        ref={refPlik}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          ;[...(e.target.files ?? [])].forEach(wstawObraz)
          e.target.value = ''
        }}
      />
      {/* ══ Pasek narzędzi ══ */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card/50 px-3 py-1.5 backdrop-blur-xl">
        <Grupa etykieta="Rysuj">
          <Narzedzia narzedzie={narzedzie} onNarzedzie={setNarzedzie} />
        </Grupa>

        <Grupa etykieta="Scena">

        <PrzyciskPaska tytul="Cofnij (Ctrl+Z)" onClick={cofnij}>
          <Undo2 className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska tytul="Ponów (Ctrl+Shift+Z)" onClick={ponow}>
          <Redo2 className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska tytul="Siatka i przyciąganie" aktywny={siatka > 0} onClick={() => setSiatka(s => (s > 0 ? 0 : 8))}>
          <Grid3x3 className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska
          tytul="Edycja punktów ścieżki"
          aktywny={trybPunktow}
          onClick={() => setTrybPunktow(v => !v)}
        >
          <Spline className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska tytul="Dopasuj widok" onClick={dopasuj}>
          <Maximize className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        </Grupa>

        <Grupa etykieta="Obiekty">
        <PrzyciskPaska tytul="Wstaw obraz — albo po prostu wklej (Ctrl+V)" onClick={() => refPlik.current?.click()}>
          <IkonaObrazu className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska tytul="Grupuj (Ctrl+G)" onClick={grupuj}>
          <Group className="h-3.5 w-3.5" />
        </PrzyciskPaska>
        <PrzyciskPaska tytul="Rozgrupuj (Ctrl+Shift+G)" onClick={rozbijGrupe}>
          <Ungroup className="h-3.5 w-3.5" />
        </PrzyciskPaska>

        </Grupa>

        {wybrane.length > 0 && (
          <Grupa etykieta="Wyrównaj">
            {WYROWNANIA.map(({ klucz, tytul, Ikona }) => (
              <PrzyciskPaska key={klucz} tytul={tytul} onClick={() => wyrownajSelekcje(klucz)}>
                <Ikona className="h-3.5 w-3.5" />
              </PrzyciskPaska>
            ))}
            {wybrane.length > 2 && (
              <>
                <PrzyciskPaska tytul="Równe odstępy w poziomie" onClick={() => rozlozSelekcje('x')}>
                  <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
                </PrzyciskPaska>
                <PrzyciskPaska tytul="Równe odstępy w pionie" onClick={() => rozlozSelekcje('y')}>
                  <AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
                </PrzyciskPaska>
              </>
            )}
          </Grupa>
        )}
        <PrzyciskPaska
          tytul="Wyczyść scenę"
          onClick={() => {
            setProjekt(p => ({ ...p, wezly: [] }))
            setWybrane([])
            setTimeout(zatwierdz, 0)
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </PrzyciskPaska>

        <div className="ml-auto flex items-center gap-1">
          <span className="mr-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground/30">Eksport</span>
          {(['svg', 'react', 'css', 'json'] as FormatEksportu[]).map(f => (
            <button
              key={f}
              onClick={() => setEksport(f)}
              className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 px-2 py-1 text-[10px] font-semibold uppercase text-foreground/65 transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Code2 className="h-3 w-3" />
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ══ Obszar roboczy ══ */}
      <div className="flex min-h-0 flex-1">
        <PanelBiblioteki maZaznaczenie={wybrane.length > 0} onWstaw={wstaw} onAnimacja={zastosujAnimacje} />

        <div className="flex min-w-0 flex-1 flex-col">
          <PasekKontekstu
            podglad={podglad}
            nazwaStanuPodgladu={
              podglad?.stan === ID_BAZY
                ? 'Start'
                : (projekt.stany?.find(s => s.id === podglad?.stan)?.nazwa ?? 'Stan')
            }
            nazwaEdytowanegoStanu={projekt.stany?.find(s => s.id === aktywnyStan)?.nazwa}
            onOdNowa={() => setPodglad({ stan: ID_BAZY, przejscie: 'none' })}
            onZamknijPodglad={() => setPodglad(null)}
            onWrocDoBazy={() => setAktywnyStan(null)}
          />

          <div
            className="min-h-0 flex-1"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              ;[...e.dataTransfer.files].forEach(wstawObraz)
            }}
          >
            <Kanwa
              projekt={projektWidoczny}
              wybrane={wybrane}
              narzedzie={narzedzie}
              czas={czas}
              siatka={siatka}
              trybPunktow={trybPunktow}
              widok={widok}
              onWidok={setWidok}
              onWybierz={setWybrane}
              onAktualizuj={aktualizuj}
              onDodaj={dodaj}
              onNarzedzie={setNarzedzie}
              onZakonczOperacje={zatwierdz}
              podglad={
                podglad
                  ? {
                      przejscie: podglad.przejscie,
                      onKlik: id => wyzwol(id, 'klik'),
                      onNajazd: id => wyzwol(id, 'najechanie'),
                    }
                  : undefined
              }
            />
          </div>
          {/* Dolny panel: oś czasu albo graf stanów */}
          <div className="flex h-56 shrink-0 flex-col border-t border-border/60 bg-card/40 backdrop-blur-xl">
            <div className="flex shrink-0 items-center gap-1 border-b border-border/50 px-2 py-1">
              {(
                [
                  { klucz: 'os' as const, etykieta: 'Oś czasu', Ikona: Clock },
                  { klucz: 'stany' as const, etykieta: 'Stany', Ikona: Workflow },
                ]
              ).map(({ klucz, etykieta, Ikona }) => (
                <button
                  key={klucz}
                  onClick={() => setDolnyPanel(klucz)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors',
                    dolnyPanel === klucz
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/45 hover:bg-foreground/5 hover:text-foreground/70',
                  )}
                >
                  <Ikona className="h-3 w-3" />
                  {etykieta}
                  {klucz === 'stany' && (projekt.stany?.length ?? 0) > 0 && (
                    <span className="rounded bg-foreground/10 px-1 text-[9px]">{projekt.stany?.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1">
              {dolnyPanel === 'os' ? (
                <OsCzasu
                  projekt={projektWidoczny}
                  wezel={wybranyWezel}
                  czas={czas}
                  odtwarzanie={odtwarzanie}
                  petla={petla}
                  onCzas={setCzas}
                  onOdtwarzanie={setOdtwarzanie}
                  onPetla={setPetla}
                  onAktualizuj={aktualizuj}
                  onZakonczOperacje={zatwierdz}
                />
              ) : (
                <GrafStanow
                  projekt={projekt}
                  stany={projekt.stany ?? []}
                  przejscia={projekt.przejscia ?? []}
                  aktywny={aktywnyStan}
                  onAktywny={setAktywnyStan}
                  onStany={(stany: Stan[]) => setProjekt(p => ({ ...p, stany }))}
                  onPrzejscia={(przejscia: Przejscie[]) => setProjekt(p => ({ ...p, przejscia }))}
                  onPodglad={() => {
                    setAktywnyStan(null)
                    setWybrane([])
                    setPodglad({ stan: ID_BAZY, przejscie: 'none' })
                  }}
                  onKoniec={zatwierdz}
                />
              )}
            </div>
          </div>
        </div>

        <Inspektor
          projekt={projektWidoczny}
          wybrane={wybrane}
          onWybierz={setWybrane}
          onAktualizuj={aktualizuj}
          onProjekt={zmiany => {
            setProjekt(p => ({ ...p, ...zmiany }))
          }}
          onUsun={usun}
          onDuplikuj={duplikuj}
          onPrzesunWarstwe={przesunWarstwe}
          onZakonczOperacje={zatwierdz}
        />
      </div>

      {/* ══ Eksport ══ */}
      {eksport && (
        <div
          onClick={() => setEksport(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/75">
                Eksport — {eksport}
              </span>
              <span className="text-[10px] text-foreground/35">Esc albo klik obok zamyka</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => navigator.clipboard?.writeText(kod)}
                  className="flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:border-primary/50 hover:text-foreground"
                >
                  <Copy className="h-3 w-3" /> Kopiuj
                </button>
                <button
                  onClick={() =>
                    pobierzPlik(
                      `${projekt.nazwa.replace(/\s+/g, '-').toLowerCase()}.${rozszerzenie(eksport)}`,
                      kod,
                      'text/plain;charset=utf-8',
                    )
                  }
                  className="flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:border-primary/50 hover:text-foreground"
                >
                  <Download className="h-3 w-3" /> Pobierz
                </button>
                <button
                  onClick={() => setEksport(null)}
                  className="ml-1 flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-semibold text-foreground/75 transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Zamknij
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-background/60 p-4 text-[11px] leading-relaxed text-foreground/80 scrollbar-none">
              <code>{kod}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Pasek narzędzi ─────────────────────────────────────────────── */

const WYROWNANIA: { klucz: TrybWyrownania; tytul: string; Ikona: React.ComponentType<{ className?: string }> }[] = [
  { klucz: 'lewo', tytul: 'Wyrównaj do lewej', Ikona: AlignStartVertical },
  { klucz: 'srodekX', tytul: 'Wyśrodkuj w poziomie', Ikona: AlignCenterVertical },
  { klucz: 'prawo', tytul: 'Wyrównaj do prawej', Ikona: AlignEndVertical },
  { klucz: 'gora', tytul: 'Wyrównaj do góry', Ikona: AlignStartHorizontal },
  { klucz: 'srodekY', tytul: 'Wyśrodkuj w pionie', Ikona: AlignCenterHorizontal },
  { klucz: 'dol', tytul: 'Wyrównaj do dołu', Ikona: AlignEndHorizontal },
]

const NARZEDZIA: { klucz: Narzedzie; tytul: string; Ikona: React.ComponentType<{ className?: string }> }[] = [
  { klucz: 'wybor', tytul: 'Wybór (V)', Ikona: MousePointer2 },
  { klucz: 'prostokat', tytul: 'Prostokąt (R)', Ikona: Square },
  { klucz: 'elipsa', tytul: 'Elipsa (O)', Ikona: Circle },
  { klucz: 'piora', tytul: 'Pióro (P)', Ikona: PenTool },
  { klucz: 'tekst', tytul: 'Tekst (T)', Ikona: Type },
  { klucz: 'reka', tytul: 'Ręka (H)', Ikona: Hand },
]

function Narzedzia({ narzedzie, onNarzedzie }: { narzedzie: Narzedzie; onNarzedzie: (n: Narzedzie) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {NARZEDZIA.map(({ klucz, tytul, Ikona }) => (
        <PrzyciskPaska key={klucz} tytul={tytul} aktywny={narzedzie === klucz} onClick={() => onNarzedzie(klucz)}>
          <Ikona className="h-3.5 w-3.5" />
        </PrzyciskPaska>
      ))}
    </div>
  )
}

/**
 * Pasek nad kanwą. Odpowiada na jedno pytanie: „co ja w tej chwili
 * edytuję?”. Wcześniej informacja o aktywnym stanie siedziała w małej
 * plakietce na pasku narzędzi i dało się jej nie zauważyć — a od niej
 * zależy, czy zmiana trafi do sceny wyjściowej, czy do wariantu.
 */
function PasekKontekstu({
  podglad,
  nazwaStanuPodgladu,
  nazwaEdytowanegoStanu,
  onOdNowa,
  onZamknijPodglad,
  onWrocDoBazy,
}: {
  podglad: { stan: string; przejscie: string } | null
  nazwaStanuPodgladu: string
  nazwaEdytowanegoStanu?: string
  onOdNowa: () => void
  onZamknijPodglad: () => void
  onWrocDoBazy: () => void
}) {
  if (podglad) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
        <Play className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span className="text-[11px] font-semibold text-emerald-300">Podgląd</span>
        <span className="text-[11px] text-foreground/55">
          klikaj w komponent — teraz widzisz stan <b className="text-foreground/80">{nazwaStanuPodgladu}</b>
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={onOdNowa}
            className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Od nowa
          </button>
          <button
            onClick={onZamknijPodglad}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-300"
          >
            <X className="h-3 w-3" /> Zakończ podgląd
          </button>
        </div>
      </div>
    )
  }

  if (nazwaEdytowanegoStanu) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-primary/30 bg-primary/10 px-3 py-1.5">
        <Workflow className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="text-[11px] text-foreground/65">
          Edytujesz stan <b className="text-primary">{nazwaEdytowanegoStanu}</b> — zmiany zapisują się tylko tutaj,
          scena wyjściowa zostaje nietknięta
        </span>
        <button
          onClick={onWrocDoBazy}
          className="ml-auto flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2 py-1 text-[10px] font-semibold text-foreground/70 hover:text-foreground"
        >
          <X className="h-3 w-3" /> Wróć do sceny wyjściowej
        </button>
      </div>
    )
  }

  return null
}

/**
 * Wizualna grupa na pasku narzędzi. Sam separator nie wystarczał —
 * dwadzieścia ikon w jednym rzędzie zlewało się w jedno i nie dało się
 * zgadnąć, które z czym sąsiaduje znaczeniowo.
 */
function Grupa({ etykieta, children }: { etykieta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-background/30 px-1.5 py-1">
      <span className="select-none pr-0.5 text-[8.5px] font-bold uppercase tracking-wider text-foreground/25">
        {etykieta}
      </span>
      {children}
    </div>
  )
}

function PrzyciskPaska({
  children,
  tytul,
  aktywny,
  onClick,
}: {
  children: React.ReactNode
  tytul: string
  aktywny?: boolean
  onClick: () => void
}) {
  return (
    <button
      title={tytul}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
        aktywny
          ? 'border-primary/60 bg-primary/10 text-primary'
          : 'border-transparent text-foreground/55 hover:border-border/60 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
