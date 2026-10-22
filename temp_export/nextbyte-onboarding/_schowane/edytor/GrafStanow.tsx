import { useRef, useState } from 'react'
import { ArrowRight, MousePointerClick, Play, Plus, Timer, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KRZYWE_CSS } from './animacja'
import { RenderWezla } from './RenderWezla'
import {
  ID_BAZY,
  nowePrzejscie,
  nowyStan,
  rozniceStanu,
  wezlyWStanie,
  WYZWALACZE,
  type Przejscie,
  type Stan,
  type Wyzwalacz,
} from './stany'
import type { Projekt, Wezel, Wygladzanie } from './typy'

/**
 * Graf stanów.
 *
 * Wcześniejsza wersja pokazywała puste prostokąty z nazwami i strzałki —
 * technicznie poprawne, praktycznie nieczytelne, bo nie dawało się
 * odpowiedzieć na trzy pytania: jak ten stan wygląda, czym się różni od
 * bazy i co go właściwie uruchamia. Teraz każda karta niesie miniaturę
 * sceny, panel przejścia mówi pełnym zdaniem, a różnice są wypisane.
 */

const SZER = 150
const WYS = 112

interface Props {
  projekt: Projekt
  stany: Stan[]
  przejscia: Przejscie[]
  /** null = scena bazowa */
  aktywny: string | null
  onAktywny: (id: string | null) => void
  onStany: (s: Stan[]) => void
  onPrzejscia: (p: Przejscie[]) => void
  onPodglad: () => void
  onKoniec: () => void
}

interface Karta {
  id: string
  nazwa: string
  x: number
  y: number
  baza: boolean
  stan?: Stan
}

export function GrafStanow({
  projekt,
  stany,
  przejscia,
  aktywny,
  onAktywny,
  onStany,
  onPrzejscia,
  onPodglad,
  onKoniec,
}: Props) {
  const refPlotno = useRef<HTMLDivElement>(null)
  const przeciaganie = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const [laczenie, setLaczenie] = useState<{ od: string; x: number; y: number } | null>(null)
  const [wybranePrzejscie, setWybranePrzejscie] = useState<string | null>(null)

  const karty: Karta[] = [
    { id: ID_BAZY, nazwa: 'Start', x: 20, y: 18, baza: true },
    ...stany.map(s => ({ id: s.id, nazwa: s.nazwa, x: s.gx, y: s.gy, baza: false, stan: s })),
  ]

  const naPlotnie = (e: { clientX: number; clientY: number }) => {
    const r = refPlotno.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 }
  }

  const dodajStan = () => {
    const kolejny = stany.length + 1
    const nowy = nowyStan(`Stan ${kolejny}`, 20 + kolejny * (SZER + 56), 18)
    onStany([...stany, nowy])
    // Od razu wchodzimy w nowy stan — sam kafelek nic nie znaczy, dopóki
    // się w nim czegoś nie zmieni, więc nie ma na co czekać.
    onAktywny(nowy.id)
    onKoniec()
  }

  const usunStan = (id: string) => {
    onStany(stany.filter(s => s.id !== id))
    onPrzejscia(przejscia.filter(p => p.od !== id && p.do !== id))
    if (aktywny === id) onAktywny(null)
    onKoniec()
  }

  const zakonczLaczenie = (doId: string) => {
    if (!laczenie || laczenie.od === doId) return
    if (!przejscia.some(p => p.od === laczenie.od && p.do === doId)) {
      const nowe = nowePrzejscie(laczenie.od, doId)
      onPrzejscia([...przejscia, nowe])
      setWybranePrzejscie(nowe.id)
      onKoniec()
    }
    setLaczenie(null)
  }

  const przejscie = przejscia.find(p => p.id === wybranePrzejscie)
  const stanAktywny = stany.find(s => s.id === aktywny)

  return (
    <div className="flex h-full min-h-0">
      {/* ══ Płótno grafu ══ */}
      <div
        ref={refPlotno}
        onPointerMove={e => {
          if (laczenie) {
            const p = naPlotnie(e)
            setLaczenie({ ...laczenie, x: p.x, y: p.y })
            return
          }
          const op = przeciaganie.current
          if (!op || e.buttons !== 1) return
          const p = naPlotnie(e)
          onStany(stany.map(s => (s.id === op.id ? { ...s, gx: p.x - op.dx, gy: p.y - op.dy } : s)))
        }}
        onPointerUp={() => {
          if (przeciaganie.current) onKoniec()
          przeciaganie.current = null
          setLaczenie(null)
        }}
        className="relative min-w-0 flex-1 overflow-auto scrollbar-none"
        style={{
          background: 'rgba(7,9,13,0.55)',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <marker id="grot" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 Z" fill="#a78bfa" />
            </marker>
          </defs>

          {przejscia.map(p => {
            const od = karty.find(k => k.id === p.od)
            const doK = karty.find(k => k.id === p.do)
            if (!od || !doK) return null
            const x1 = od.x + SZER
            const y1 = od.y + WYS / 2
            const x2 = doK.x
            const y2 = doK.y + WYS / 2
            const wygiecie = Math.max(34, Math.abs(x2 - x1) / 2)
            const d = `M ${x1} ${y1} C ${x1 + wygiecie} ${y1}, ${x2 - wygiecie} ${y2}, ${x2} ${y2}`
            const wybrane = p.id === wybranePrzejscie
            const element = projekt.wezly.find(w => w.id === p.element)
            const podpis =
              p.wyzwalacz === 'auto'
                ? `samo po ${p.opoznienie} ms`
                : `${p.wyzwalacz === 'klik' ? 'klik' : 'najazd'} w ${element ? element.nazwa : 'cokolwiek'}`
            return (
              <g key={p.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={wybrane ? '#f472b6' : '#a78bfa'}
                  strokeWidth={wybrane ? 2.2 : 1.5}
                  markerEnd="url(#grot)"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onPointerDown={() => setWybranePrzejscie(p.id)}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 7}
                  textAnchor="middle"
                  fontSize={9.5}
                  fill={wybrane ? '#f472b6' : 'rgba(232,238,246,0.6)'}
                  style={{ pointerEvents: 'none' }}
                >
                  {podpis}
                </text>
              </g>
            )
          })}

          {laczenie &&
            (() => {
              const od = karty.find(k => k.id === laczenie.od)
              if (!od) return null
              return (
                <line
                  x1={od.x + SZER}
                  y1={od.y + WYS / 2}
                  x2={laczenie.x}
                  y2={laczenie.y}
                  stroke="#f472b6"
                  strokeWidth={1.6}
                  strokeDasharray="5 4"
                />
              )
            })()}
        </svg>

        {karty.map(k => (
          <KartaStanu
            key={k.id}
            karta={k}
            projekt={projekt}
            czynny={k.baza ? aktywny === null : aktywny === k.id}
            laczymy={laczenie !== null}
            onWejdz={() => onAktywny(k.baza ? null : k.id)}
            onPrzeciagnij={e => {
              if (k.baza) return
              const p = naPlotnie(e)
              przeciaganie.current = { id: k.id, dx: p.x - k.x, dy: p.y - k.y }
            }}
            onZacznijLaczyc={e => {
              const p = naPlotnie(e)
              setLaczenie({ od: k.id, x: p.x, y: p.y })
            }}
            onUpusc={() => laczenie && zakonczLaczenie(k.id)}
            onUsun={() => usunStan(k.id)}
            onNazwa={nazwa => onStany(stany.map(s => (s.id === k.id ? { ...s, nazwa } : s)))}
            onKoniec={onKoniec}
          />
        ))}
      </div>

      {/* ══ Panel boczny ══ */}
      <div className="flex w-64 shrink-0 flex-col border-l border-border/50">
        <div className="flex shrink-0 items-center gap-1.5 border-b border-border/50 px-2.5 py-2">
          <button
            onClick={dodajStan}
            className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2 py-1 text-[10px] font-semibold text-foreground/70 transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Nowy stan
          </button>
          <button
            onClick={onPodglad}
            disabled={przejscia.length === 0}
            title={przejscia.length === 0 ? 'Najpierw połącz stany strzałką' : 'Sprawdź, jak to działa'}
            className="ml-auto flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary transition-opacity disabled:opacity-35"
          >
            <Play className="h-3 w-3" /> Podgląd
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5 scrollbar-none">
          {przejscie ? (
            <PanelPrzejscia
              przejscie={przejscie}
              karty={karty}
              wezly={projekt.wezly}
              onZmiana={z => onPrzejscia(przejscia.map(p => (p.id === przejscie.id ? { ...p, ...z } : p)))}
              onUsun={() => {
                onPrzejscia(przejscia.filter(p => p.id !== przejscie.id))
                setWybranePrzejscie(null)
                onKoniec()
              }}
              onKoniec={onKoniec}
            />
          ) : stanAktywny ? (
            <PanelStanu stan={stanAktywny} wezly={projekt.wezly} />
          ) : (
            <Instrukcja maStany={stany.length > 0} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Karta stanu ─────────────────────────────────────────────────── */

function KartaStanu({
  karta,
  projekt,
  czynny,
  laczymy,
  onWejdz,
  onPrzeciagnij,
  onZacznijLaczyc,
  onUpusc,
  onUsun,
  onNazwa,
  onKoniec,
}: {
  karta: Karta
  projekt: Projekt
  czynny: boolean
  laczymy: boolean
  onWejdz: () => void
  onPrzeciagnij: (e: React.PointerEvent) => void
  onZacznijLaczyc: (e: React.PointerEvent) => void
  onUpusc: () => void
  onUsun: () => void
  onNazwa: (v: string) => void
  onKoniec: () => void
}) {
  const liczbaZmian = karta.stan ? rozniceStanu(karta.stan, projekt.wezly).length : 0

  return (
    <div
      onPointerDown={onPrzeciagnij}
      onPointerUp={onUpusc}
      onClick={onWejdz}
      style={{ left: karta.x, top: karta.y, width: SZER }}
      className={cn(
        'group absolute overflow-hidden rounded-xl border transition-all',
        karta.baza ? 'cursor-pointer' : 'cursor-grab',
        czynny ? 'border-primary shadow-[0_0_0_3px_rgba(56,189,248,0.15)]' : 'border-border/60 hover:border-primary/50',
        laczymy && 'ring-1 ring-primary/40',
      )}
    >
      {/* Miniatura — od razu widać, co ten stan robi ze sceną */}
      <div className="relative h-[68px] w-full overflow-hidden bg-black/40">
        <MiniaturaSceny projekt={projekt} stan={karta.stan} szer={SZER} wys={68} />
        {czynny && (
          <span className="absolute left-1 top-1 rounded bg-primary px-1 py-px text-[8px] font-bold uppercase tracking-wide text-background">
            edytujesz
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-card/85 px-2 py-1">
        {karta.baza ? (
          <span className="flex-1 truncate text-[11px] font-semibold text-foreground/80">{karta.nazwa}</span>
        ) : (
          <input
            value={karta.nazwa}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            onChange={e => onNazwa(e.target.value)}
            onBlur={onKoniec}
            className="w-full min-w-0 flex-1 truncate border-none bg-transparent text-[11px] font-semibold text-foreground/85 outline-none"
          />
        )}
        {!karta.baza && (
          <button
            title="Usuń stan"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              onUsun()
            }}
            className="shrink-0 text-foreground/30 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="bg-card/85 px-2 pb-1.5 text-[9px] text-foreground/40">
        {karta.baza
          ? 'scena wyjściowa'
          : liczbaZmian === 0
            ? 'bez zmian — wejdź i coś przestaw'
            : `${liczbaZmian} ${liczbaZmian === 1 ? 'element inny' : 'elementy inne'} niż w Start`}
      </div>

      <button
        title="Przeciągnij na inny stan, żeby połączyć"
        onPointerDown={e => {
          e.stopPropagation()
          onZacznijLaczyc(e)
        }}
        onClick={e => e.stopPropagation()}
        style={{ right: -7, top: WYS / 2 - 7 }}
        className="absolute h-3.5 w-3.5 rounded-full border-2 border-primary bg-background transition-colors hover:bg-primary"
      />
    </div>
  )
}

/**
 * Miniatura całej sceny w danym stanie — ta sama ścieżka renderowania co
 * kanwa, tylko przeskalowana. Osobne „ładne obrazki” rozjechałyby się
 * z rzeczywistością przy pierwszej zmianie stylu.
 */
function MiniaturaSceny({
  projekt,
  stan,
  szer,
  wys,
}: {
  projekt: Projekt
  stan?: Stan
  szer: number
  wys: number
}) {
  const wezly = wezlyWStanie(projekt.wezly, stan).filter(w => w.widoczny && w.typ !== 'grupa')
  const skala = Math.min(szer / projekt.szerokosc, wys / projekt.wysokosc)

  return (
    <div
      style={{
        width: projekt.szerokosc,
        height: projekt.wysokosc,
        transform: `scale(${skala})`,
        transformOrigin: '0 0',
        background: projekt.tlo,
        position: 'absolute',
        left: (szer - projekt.szerokosc * skala) / 2,
        top: (wys - projekt.wysokosc * skala) / 2,
        pointerEvents: 'none',
      }}
    >
      {wezly.map(w => (
        <div
          key={w.id}
          style={{
            position: 'absolute',
            left: w.x,
            top: w.y,
            width: w.w,
            height: w.h,
            opacity: w.krycie,
            transform: `rotate(${w.obrot}deg) scale(${w.skala})`,
          }}
        >
          <RenderWezla wezel={w} />
        </div>
      ))}
    </div>
  )
}

/* ── Panel: co robi ten stan ─────────────────────────────────────── */

function PanelStanu({ stan, wezly }: { stan: Stan; wezly: Wezel[] }) {
  const roznice = rozniceStanu(stan, wezly)
  return (
    <>
      <Naglowek>Stan „{stan.nazwa}”</Naglowek>
      {roznice.length === 0 ? (
        <p className="text-[10px] leading-relaxed text-foreground/45">
          Ten stan jest na razie identyczny ze Startem. Przestaw coś na kanwie — zmiana zapisze się tylko tutaj,
          scena wyjściowa zostanie nietknięta.
        </p>
      ) : (
        <>
          <p className="mb-2 text-[10px] text-foreground/45">Różni się od Startu tym:</p>
          <div className="space-y-1.5">
            {roznice.map(r => (
              <div key={r.idWezla} className="rounded-lg border border-border/50 bg-background/30 p-1.5">
                <div className="text-[10px] font-semibold text-foreground/75">{r.nazwaWezla}</div>
                <ul className="mt-0.5 space-y-0.5">
                  {r.opisy.map((o, i) => (
                    <li key={i} className="text-[10px] text-foreground/50">
                      · {o}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

/* ── Panel: przejście ────────────────────────────────────────────── */

const KRZYWE: { klucz: Wygladzanie; opis: string }[] = [
  { klucz: 'liniowe', opis: 'równo, bez przyspieszania' },
  { klucz: 'łagodne', opis: 'rusza i hamuje miękko' },
  { klucz: 'wejście', opis: 'wolno rusza, szybko kończy' },
  { klucz: 'wyjście', opis: 'szybko rusza, wolno hamuje' },
  { klucz: 'sprężyste', opis: 'przestrzela i wraca — odbój' },
  { klucz: 'skok', opis: 'natychmiast, bez animacji' },
]

function PanelPrzejscia({
  przejscie,
  karty,
  wezly,
  onZmiana,
  onUsun,
  onKoniec,
}: {
  przejscie: Przejscie
  karty: Karta[]
  wezly: Wezel[]
  onZmiana: (z: Partial<Przejscie>) => void
  onUsun: () => void
  onKoniec: () => void
}) {
  const nazwaStanu = (id: string) => karty.find(k => k.id === id)?.nazwa ?? '?'
  const klasaInput =
    'w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary/50'
  const klikalne = wezly.filter(w => w.typ !== 'grupa')
  const krzywa = KRZYWE.find(k => k.klucz === przejscie.wygladzanie)

  return (
    <>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Przejście
        </span>
        <button title="Usuń przejście" onClick={onUsun} className="text-foreground/35 hover:text-foreground">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Zdanie, które mówi dokładnie, co się wydarzy */}
      <div className="mb-3 rounded-lg border border-primary/25 bg-primary/5 p-2 text-[10px] leading-relaxed text-foreground/75">
        {przejscie.wyzwalacz === 'auto' ? (
          <>
            Po <b>{przejscie.opoznienie} ms</b> w stanie <b>{nazwaStanu(przejscie.od)}</b> scena sama przechodzi do{' '}
            <b>{nazwaStanu(przejscie.do)}</b>.
          </>
        ) : (
          <>
            Gdy użytkownik <b>{przejscie.wyzwalacz === 'klik' ? 'kliknie' : 'najedzie'}</b> na{' '}
            <b>{wezly.find(w => w.id === przejscie.element)?.nazwa ?? 'dowolne miejsce'}</b>, scena przechodzi z{' '}
            <b>{nazwaStanu(przejscie.od)}</b> do <b>{nazwaStanu(przejscie.do)}</b> w {przejscie.czas} ms.
          </>
        )}
      </div>

      <Etykieta ikona={<MousePointerClick className="h-3 w-3" />}>Co to uruchamia</Etykieta>
      <div className="mb-2 flex gap-0.5 rounded-md border border-border/60 bg-background/40 p-0.5">
        {WYZWALACZE.map(w => (
          <button
            key={w.klucz}
            title={w.tytul}
            onClick={() => {
              onZmiana({ wyzwalacz: w.klucz as Wyzwalacz })
              onKoniec()
            }}
            className={cn(
              'h-6 flex-1 rounded text-[10px] font-semibold transition-colors',
              przejscie.wyzwalacz === w.klucz
                ? 'bg-primary/15 text-primary'
                : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground/80',
            )}
          >
            {w.etykieta}
          </button>
        ))}
      </div>

      {przejscie.wyzwalacz !== 'auto' && (
        <label className="mb-3 block space-y-1">
          <span className="text-[10px] text-foreground/45">Element, w który się klika</span>
          <select
            value={przejscie.element ?? ''}
            onChange={e => {
              onZmiana({ element: e.target.value || undefined })
              onKoniec()
            }}
            className={klasaInput}
          >
            <option value="">— dowolne miejsce w komponencie —</option>
            {klikalne.map(w => (
              <option key={w.id} value={w.id}>
                {w.nazwa}
              </option>
            ))}
          </select>
        </label>
      )}

      <Etykieta ikona={<Timer className="h-3 w-3" />}>Jak się animuje</Etykieta>
      <label className="mb-2 block space-y-1">
        <select
          value={przejscie.wygladzanie}
          onChange={e => {
            onZmiana({ wygladzanie: e.target.value as Wygladzanie })
            onKoniec()
          }}
          className={klasaInput}
        >
          {KRZYWE.map(k => (
            <option key={k.klucz} value={k.klucz}>
              {k.klucz} — {k.opis}
            </option>
          ))}
        </select>
        {krzywa && <span className="block text-[9px] text-foreground/35">{krzywa.opis}</span>}
        <span className="block font-mono text-[9px] text-foreground/25">{KRZYWE_CSS[przejscie.wygladzanie]}</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-[10px] text-foreground/45">Czas trwania</span>
          <input
            type="number"
            step={50}
            value={przejscie.czas}
            onChange={e => onZmiana({ czas: Math.max(0, parseInt(e.target.value) || 0) })}
            onBlur={onKoniec}
            className={klasaInput}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] text-foreground/45">Opóźnienie</span>
          <input
            type="number"
            step={50}
            value={przejscie.opoznienie}
            onChange={e => onZmiana({ opoznienie: Math.max(0, parseInt(e.target.value) || 0) })}
            onBlur={onKoniec}
            className={klasaInput}
          />
        </label>
      </div>
      <p className="mt-1 text-[9px] text-foreground/30">wartości w milisekundach — 1000 ms to sekunda</p>
    </>
  )
}

/* ── Drobiazgi ───────────────────────────────────────────────────── */

function Naglowek({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{children}</div>
  )
}

function Etykieta({ ikona, children }: { ikona: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-foreground/55">
      {ikona}
      {children}
    </div>
  )
}

function Instrukcja({ maStany }: { maStany: boolean }) {
  const kroki = [
    'Kliknij „Nowy stan” — dostaniesz kopię sceny do przestawienia.',
    'Przestaw na kanwie to, co ma się różnić. Start zostaje nietknięty.',
    'Przeciągnij kropkę z prawej krawędzi jednej karty na drugą — to strzałka przejścia.',
    'Kliknij strzałkę i wskaż, w co użytkownik ma kliknąć.',
    'Naciśnij „Podgląd” i sprawdź, czy działa.',
  ]
  return (
    <>
      <Naglowek>{maStany ? 'Jak to połączyć' : 'Jak zacząć'}</Naglowek>
      <ol className="space-y-2">
        {kroki.map((k, i) => (
          <li key={i} className="flex gap-2 text-[10px] leading-relaxed text-foreground/50">
            <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[9px] font-bold text-foreground/60">
              {i + 1}
            </span>
            {k}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-1 rounded-lg border border-border/50 bg-background/30 p-2 text-[9.5px] leading-relaxed text-foreground/40">
        <ArrowRight className="h-3 w-3 shrink-0" />
        Przykład: przełącznik to Start z kropką po lewej, Stan 1 z kropką po prawej i strzałka „klik w kropkę”.
      </div>
    </>
  )
}
