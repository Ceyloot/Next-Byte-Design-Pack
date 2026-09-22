import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  Code2,
  Copy,
  Download,
  Grid3x3,
  Hand,
  Maximize,
  MousePointer2,
  PenTool,
  Redo2,
  Spline,
  Square,
  Trash2,
  Type,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Kanwa, type Widok } from '@/sections/edytor/Kanwa'
import { Inspektor } from '@/sections/edytor/Inspektor'
import { OsCzasu } from '@/sections/edytor/OsCzasu'
import { PanelBiblioteki } from '@/sections/edytor/PanelBiblioteki'
import type { PozycjaBiblioteki, PresetAnimacji } from '@/sections/edytor/biblioteka'
import { pobierzPlik, rozszerzenie, wygenerujKod, type FormatEksportu } from '@/sections/edytor/eksport'
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

  /* ── Historia ────────────────────────────────────────────────── */

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

  const aktualizuj = useCallback((id: string, zmiany: Partial<Wezel>) => {
    setProjekt(p => ({ ...p, wezly: p.wezly.map(w => (w.id === id ? { ...w, ...zmiany } : w)) }))
  }, [])

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
      setProjekt(p => ({ ...p, wezly: p.wezly.filter(w => w.id !== id) }))
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
  }, [wybrane, cofnij, ponow, duplikuj, usun, aktualizuj, zatwierdz])

  /* ── Widok ───────────────────────────────────────────────────── */

  const dopasuj = () => setWidok({ x: 40, y: 30, zoom: 0.8 })

  const wybranyWezel = useMemo(
    () => (wybrane.length === 1 ? projekt.wezly.find(w => w.id === wybrane[0]) : undefined),
    [wybrane, projekt.wezly],
  )

  const kod = eksport ? wygenerujKod(projekt, eksport) : ''

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ══ Pasek narzędzi ══ */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border/60 bg-card/50 px-3 py-1.5 backdrop-blur-xl">
        <Narzedzia narzedzie={narzedzie} onNarzedzie={setNarzedzie} />

        <div className="mx-2 h-5 w-px bg-border/60" />

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
          <div className="min-h-0 flex-1">
            <Kanwa
              projekt={projekt}
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
            />
          </div>
          <OsCzasu
            projekt={projekt}
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
        </div>

        <Inspektor
          projekt={projekt}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/75">
                Eksport — {eksport}
              </span>
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
                <button onClick={() => setEksport(null)} className="p-1 text-foreground/50 hover:text-foreground">
                  <X className="h-4 w-4" />
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
