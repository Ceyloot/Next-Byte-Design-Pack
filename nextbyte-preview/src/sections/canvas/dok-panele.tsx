import type { ComponentType, ReactNode } from 'react'
import { Image as IkonaObrazu, Layers, MapPin, Sparkles } from 'lucide-react'
import { type Pineska, type StanGeneracji, type Warstwa, type Widok } from './typy'

/**
 * Rejestr paneli doku.
 *
 * Dok nie wie nic o tym, co pokazuje — pyta tylko każdy panel, czy pasuje
 * do bieżącego zaznaczenia. Dodanie biblioteki komponentów albo osi czasu
 * animacji to dopisanie jednego wpisu do `PANELE`, bez dotykania płótna,
 * paska polecenia i samego doku.
 */
export interface KontekstDoku {
  warstwy: Warstwa[]
  pineski: Pineska[]
  wybranaWarstwa: Warstwa | null
  wybranaPineska: Pineska | null
  widok: Widok
  stanGeneracji: StanGeneracji
  zmienWarstwe: (id: string, zmiana: Partial<Warstwa>) => void
  zmienPineske: (id: string, zmiana: Partial<Pineska>) => void
  wybierzWarstwe: (id: string | null) => void
  usunWarstwe: (id: string) => void
}

export interface PanelDoku {
  id: string
  tytul: string
  ikona: ComponentType<{ className?: string }>
  /** Panel pokazuje się tylko wtedy, gdy ma co powiedzieć o zaznaczeniu. */
  pasuje: (k: KontekstDoku) => boolean
  Tresc: (props: { k: KontekstDoku }) => ReactNode
}

/* ── Wspólne drobiazgi ───────────────────────────────────────────── */

function Wiersz({ etykieta, wartosc }: { etykieta: string; wartosc: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[11px] text-foreground/35">{etykieta}</span>
      <span className="truncate text-[11.5px] font-medium text-foreground/75">{wartosc}</span>
    </div>
  )
}

/* ── Panele ──────────────────────────────────────────────────────── */

const panelObiektu: PanelDoku = {
  id: 'obiekt',
  tytul: 'Zaznaczony obiekt',
  ikona: MapPin,
  pasuje: k => k.wybranaPineska !== null,
  Tresc: ({ k }) => {
    const p = k.wybranaPineska!
    const numer = k.pineski.indexOf(p) + 1
    return (
      <>
        <input
          value={p.label ?? ''}
          onChange={e => k.zmienPineske(p.id, { label: e.target.value })}
          placeholder={`obiekt ${numer}`}
          className="w-full rounded-lg border border-border/10 bg-foreground/5 px-2.5 py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/70"
        />
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-foreground/30">
          Ta nazwa jest uchwytem: powołujesz się na nią w poleceniu zamiast opisywać, o który
          obiekt chodzi.
        </p>
        <div className="mt-2 border-t border-border/[0.06] pt-1.5">
          <Wiersz
            etykieta="Położenie"
            wartosc={`${Math.round(p.normalizedX * 100)}%, ${Math.round(p.normalizedY * 100)}%`}
          />
          <Wiersz etykieta="Na zdjęciu" wartosc={k.warstwy.find(w => w.id === p.layerId)?.name ?? '—'} />
        </div>
      </>
    )
  },
}

const panelWarstwy: PanelDoku = {
  id: 'warstwa',
  tytul: 'Zdjęcie',
  ikona: IkonaObrazu,
  pasuje: k => k.wybranaWarstwa !== null,
  Tresc: ({ k }) => {
    const w = k.wybranaWarstwa!
    return (
      <>
        <input
          value={w.name}
          onChange={e => k.zmienWarstwe(w.id, { name: e.target.value })}
          className="w-full rounded-lg border border-border/10 bg-foreground/5 px-2.5 py-1.5 text-[12px] text-foreground outline-none focus:border-primary/70"
        />
        <div className="mt-2 border-t border-border/[0.06] pt-1.5">
          <Wiersz etykieta="Rozdzielczość" wartosc={`${w.naturalWidth}×${w.naturalHeight}`} />
          <Wiersz etykieta="Na płótnie" wartosc={`${Math.round(w.width)}×${Math.round(w.height)}`} />
          <Wiersz etykieta="Pineski" wartosc={k.pineski.filter(p => p.layerId === w.id).length} />
        </div>
      </>
    )
  },
}

const panelWyniku: PanelDoku = {
  id: 'wynik',
  tytul: 'Ostatnia generacja',
  ikona: Sparkles,
  pasuje: k => k.stanGeneracji.faza === 'gotowe' || k.stanGeneracji.faza === 'blad',
  Tresc: ({ k }) => {
    const s = k.stanGeneracji
    if (s.faza === 'blad') return <p className="text-[11.5px] leading-relaxed text-amber-300/80">{s.tresc}</p>
    if (s.faza !== 'gotowe') return null
    return (
      <>
        <div className="flex items-start gap-2.5">
          <img src={s.wynik.obrazUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-border/10" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-foreground">{s.wynik.nazwa}</p>
            <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-foreground/40">
              {s.wynik.model}
            </p>
            <p className="text-[9.5px] text-foreground/30">${s.wynik.kosztUSD.toFixed(4)}</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-foreground/50">{s.wynik.opis}</p>
      </>
    )
  },
}

const panelWarstw: PanelDoku = {
  id: 'warstwy',
  tytul: 'Warstwy',
  ikona: Layers,
  // Zawsze, gdy jest co pokazać — to jedyny panel, który ma sens także
  // wtedy, gdy nic nie jest zaznaczone.
  pasuje: k => k.warstwy.length > 0,
  Tresc: ({ k }) => (
    <div className="flex flex-col gap-0.5">
      {[...k.warstwy].reverse().map(w => (
        <button
          key={w.id}
          onClick={() => k.wybierzWarstwe(w.id)}
          className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors ${
            k.wybranaWarstwa?.id === w.id ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-foreground/5'
          }`}
        >
          <img src={w.src} alt="" className="h-7 w-7 shrink-0 rounded object-cover ring-1 ring-border/10" />
          <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground/70">{w.name}</span>
          {k.pineski.some(p => p.layerId === w.id) && (
            <MapPin className="h-3 w-3 shrink-0 text-primary" />
          )}
        </button>
      ))}
    </div>
  ),
}

/**
 * Kolejność ma znaczenie: od najbardziej szczegółowego zaznaczenia do
 * kontekstu całego projektu. Nowe narzędzia (komponenty, animacje, tablica)
 * dopisujemy tutaj.
 */
export const PANELE: PanelDoku[] = [panelObiektu, panelWarstwy, panelWyniku, panelWarstw]
