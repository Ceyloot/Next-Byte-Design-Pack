/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0 — bloki treści
   Układ i proporcje odwzorowane 1:1 z panelu 1.0 (zapisany HTML):
   jeden kafelek u góry (aktywność + saldo + zużycie + akcje),
   siatka 3 kolumn (kompozytor i „Wcześniej" na 2/3, prawa kolumna
   z pustym stanem i kalendarzem), na dole chmury i szybka podróż.
   Nowe jest tylko to, co dało się poprawić bez ruszania układu:
   jedna krzywa ruchu i kafelki zdejmowane przełącznikiem.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react'
import {
  Activity, Plus, Receipt, MessageSquare, Image as ImageIcon, Video,
  FileText, LayoutGrid, Palette, ArrowRight, Check, CalendarPlus, ListPlus,
  ChevronLeft, ChevronRight, Lock, Cloud, CloudCog, Pencil,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AKTYWNOSC, MIESIACE, OSTATNIE, SKROTY, type TypPozycji } from './dane'
import { Blok, Przycisk, useKafelki, Wejscie } from './podstawy'

/** Znak Byte — w oryginale ⟠ obok salda i kosztu. */
const Byte = ({ className }: { className?: string }) => (
  <span className={cn('font-normal leading-none text-primary', className)}>⟠</span>
)

/* ═══ 1. AKTYWNOŚĆ + SALDO (górny kafelek) ═════════════════════ */

const POZIOM = ['0.06', '0.24', '0.52', '0.95'] as const
const DNI_OSI = ['', 'Wt', '', 'Cz', '', 'So', '']

function Heatmapa() {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 pt-1">
      <div
        className="grid pl-6 text-[10px] leading-none text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${MIESIACE.length}, minmax(0,1fr))` }}
      >
        {MIESIACE.map((m) => <span key={m}>{m}</span>)}
      </div>

      <div className="flex">
        <div className="flex shrink-0 flex-col gap-[3px] pr-1 text-[9px] leading-none text-muted-foreground">
          {DNI_OSI.map((d, i) => (
            <span key={i} className="flex h-[11px] items-center justify-end">{d}</span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {AKTYWNOSC.map((tydzien, t) => (
            <div key={t} className="flex flex-col gap-[3px]">
              {tydzien.map((poziom, d) => (
                <span
                  key={d}
                  className="h-[11px] w-[11px] rounded-[3px] transition-transform duration-150 hover:scale-125"
                  style={{
                    background: poziom === 0
                      ? 'hsl(var(--foreground) / 0.05)'
                      : `hsl(var(--primary) / ${POZIOM[poziom]})`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Przebieg zużycia — płaski, bo w ostatnich dniach nie było wydatków. */
function Przebieg() {
  return (
    <div className="relative h-9 w-full cursor-crosshair sm:h-11">
      <svg viewBox="0 0 300 44" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="p2-zuzycie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 38 L300 38 L300 44 L0 44 Z" fill="url(#p2-zuzycie)" />
        <path d="M0 38 L300 38" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function Zakresy({
  zakres, onZakres, className,
}: { zakres: string; onZakres: (z: '7d' | '30d' | '90d') => void; className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center gap-0.5', className)}>
      {(['7d', '30d', '90d'] as const).map((z) => (
        <button
          key={z}
          type="button"
          onClick={() => onZakres(z)}
          className={cn(
            'rounded-md px-2 py-1 text-[10px] tabular-nums transition-colors',
            zakres === z ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {z}
        </button>
      ))}
    </span>
  )
}

export function PasAktywnosci({ saldo }: { saldo: number }) {
  const [zakres, setZakres] = useState<'7d' | '30d' | '90d'>('7d')
  const dni = zakres === '7d' ? '7' : zakres === '30d' ? '30' : '90'

  return (
    <Blok wypelnienie="p-3.5" akcent>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
        {/* Aktywność */}
        <div className="min-w-0 flex-1 md:max-w-[440px]">
          <div className="flex h-full min-w-0 flex-col">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-card-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Aktywność
              </span>
              <span className="inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-muted/50 px-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="p2-puls h-1.5 w-1.5 rounded-full bg-current" />
                Ostatnie 6 mies.
              </span>
            </div>
            <Heatmapa />
          </div>
        </div>

        <span aria-hidden className="hidden w-px self-stretch bg-border md:block" />

        {/* Saldo */}
        <div className="min-w-0 shrink-0">
          <p className="mt-0.5 flex items-baseline text-[2rem] font-semibold leading-none tabular-nums text-card-foreground">
            {saldo}
            <Byte className="ml-1.5 text-[1.25rem]" />
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Saldo Byte</p>
        </div>

        {/* Zużycie */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex justify-end sm:hidden">
            <Zakresy zakres={zakres} onZakres={setZakres} />
          </div>
          <Przebieg />
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="flex flex-1 items-center justify-between tabular-nums">
              <span>13.09</span>
              <span className="hidden sm:inline">16.09</span>
              <span>dziś</span>
            </span>
            <span className="hidden sm:flex">
              <Zakresy zakres={zakres} onZakres={setZakres} />
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            Brak zużycia w ostatnich {dni} dniach
          </p>
        </div>

        {/* Akcje */}
        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col">
          <Przycisk wariant="akcent" ikona={<Plus />} className="h-9 rounded-xl text-[13px]">Doładuj</Przycisk>
          <Przycisk ikona={<Receipt />} className="h-9 rounded-xl border border-border text-[13px]">Wydatki</Przycisk>
        </div>
      </div>
    </Blok>
  )
}

/* ═══ 2. KOMPOZYTOR ════════════════════════════════════════════ */

const TRYBY = [
  { id: 'czat',    etykieta: 'Czat',    ikona: MessageSquare, koszt: 2,  cel: 'Chat AI' },
  { id: 'obraz',   etykieta: 'Obraz',   ikona: ImageIcon,     koszt: 12, cel: 'Studia Zdjęć' },
  { id: 'wideo',   etykieta: 'Wideo',   ikona: Video,         koszt: 45, cel: 'Studia Video' },
  { id: 'notatka', etykieta: 'Notatka', ikona: FileText,      koszt: 0,  cel: 'Notatek' },
] as const

type TrybId = (typeof TRYBY)[number]['id']

export function Kompozytor({ saldo }: { saldo: number }) {
  const [tryb, setTryb] = useState<TrybId>('czat')
  const [tekst, setTekst] = useState('')
  const aktywny = TRYBY.find((t) => t.id === tryb)!
  const zostanie = Math.max(0, saldo - aktywny.koszt)
  const kafelki = useKafelki()

  return (
    <Blok wypelnienie="" promien="rounded-[1.75rem]" className="relative flex flex-col overflow-hidden">
      {kafelki && (
        <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}

      <div className="flex items-center gap-1 px-3 pt-3">
        {TRYBY.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTryb(t.id)}
            className={cn(
              'relative flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
              tryb === t.id
                ? 'bg-primary/[0.13] text-primary'
                : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
            )}
          >
            <t.ikona className="h-3.5 w-3.5" />
            {t.etykieta}
          </button>
        ))}
      </div>

      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        rows={4}
        placeholder={
          tryb === 'czat' ? 'Napisz wiadomość...'
            : tryb === 'obraz' ? 'Opisz obraz, który mam wygenerować...'
              : tryb === 'wideo' ? 'Opisz scenę wideo...'
                : 'Zacznij notatkę...'
        }
        className="w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
      />

      <div className="flex min-h-9 items-center gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          className="group inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background/40 px-2.5 text-[14px] text-card-foreground transition-[border-color,box-shadow] duration-200 hover:border-primary/40"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-[11px] font-semibold tracking-tight text-primary">
            <Activity className="h-[70%] w-[70%]" />
          </span>
          <span className="min-w-0 flex-1 truncate text-left">Pro</span>
          <ChevronRight className="h-3 w-3 shrink-0 rotate-90 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex flex-wrap items-center gap-x-1.5 tabular-nums">
            <span className="flex items-center gap-1 text-foreground">≈{aktywny.koszt}<Byte className="text-[11px]" /></span>
            <span>· zostanie {zostanie}</span>
          </span>
        </div>
        <button
          type="button"
          className="group/cta inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-semibold text-foreground/80 transition-colors duration-200 hover:bg-primary/[0.12] hover:text-primary"
        >
          <span className="hidden sm:inline">Utwórz w {aktywny.cel}</span>
          <span className="sm:hidden">Utwórz</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </button>
      </div>
    </Blok>
  )
}

/* ═══ 3. WCZEŚNIEJ ═════════════════════════════════════════════ */

const IKONY_TYPU: Record<TypPozycji, LucideIcon> = {
  notatka: FileText, rozmowa: MessageSquare, plik: FileText, obraz: ImageIcon, tablica: Palette,
}

const ETYKIETY_TYPU: Record<TypPozycji, string> = {
  notatka: 'Notatka', rozmowa: 'Rozmowa', plik: 'Dokument', obraz: 'Obraz', tablica: 'Tablica',
}

const FILTRY = [
  { id: 'wszystko', etykieta: 'Wszystko', ikona: LayoutGrid },
  { id: 'notatka',  etykieta: 'Notatka',  ikona: FileText },
  { id: 'rozmowa',  etykieta: 'Rozmowa',  ikona: MessageSquare },
  { id: 'plik',     etykieta: 'Dokument', ikona: FileText },
  { id: 'obraz',    etykieta: 'Obraz',    ikona: ImageIcon },
  { id: 'tablica',  etykieta: 'Tablica',  ikona: Palette },
] as const

export function Ostatnie() {
  const [filtr, setFiltr] = useState<(typeof FILTRY)[number]['id']>('wszystko')
  const widoczne = useMemo(
    () => (filtr === 'wszystko' ? OSTATNIE : OSTATNIE.filter((o) => o.typ === filtr)),
    [filtr],
  )

  return (
    <Blok wypelnienie="p-5" className="flex h-full max-h-[60dvh] flex-col">
      {/* Filtr: sama ikona, nazwa rozwija się dopiero na wybranym. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {FILTRY.map((f) => {
          const akt = filtr === f.id
          return (
            <button
              key={f.id}
              type="button"
              title={f.etykieta}
              onClick={() => setFiltr(f.id)}
              className={cn(
                'flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border transition-all duration-200',
                akt
                  ? 'border-transparent bg-foreground/[0.06] px-3 text-foreground/70'
                  : 'w-8 justify-center border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              <f.ikona className="h-3.5 w-3.5 shrink-0" />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap text-[12px] font-medium leading-none transition-all duration-200',
                  akt ? 'max-w-[90px] opacity-100' : 'max-w-0 opacity-0',
                )}
              >
                {f.etykieta}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p2-scroll -mr-1 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <h4 className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/45">
          Wcześniej
        </h4>
        {widoczne.length === 0 ? (
          <p className="py-8 text-center text-[12.5px] text-muted-foreground">Nic w tej kategorii.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {widoczne.map((o) => {
              const Ikona = IKONY_TYPU[o.typ]
              return (
                <li key={o.id}>
                  <a className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.04]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent bg-foreground/[0.06] text-foreground/70 transition-colors group-hover:text-primary">
                      <Ikona className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-card-foreground">{o.tytul}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{ETYKIETY_TYPU[o.typ]}</span>
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{o.data}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Blok>
  )
}

/* ═══ 4. NIC NIE CZEKA ═════════════════════════════════════════ */

export function NicNieCzeka() {
  return (
    <Blok wypelnienie="px-4 py-7" className="flex flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/40 text-muted-foreground shadow-[var(--swiatlo-gorne)]">
        <Check className="h-5 w-5" />
      </span>
      <p className="text-[15px] font-semibold tracking-tight text-foreground">Nic nie czeka</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Przycisk ikona={<CalendarPlus />} className="text-[13px]">Zaplanuj wydarzenie</Przycisk>
        <Przycisk ikona={<ListPlus />} className="text-[13px]">Dodaj zadanie</Przycisk>
      </div>
    </Blok>
  )
}

/* ═══ 5. KALENDARZ ═════════════════════════════════════════════ */

const DNI = ['pon', 'wto', 'śro', 'czw', 'pią', 'sob', 'nie']
const NAZWY_MIESIECY = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
]

/** Siatka 6×7 z dniami sąsiednich miesięcy — tydzień zaczyna poniedziałek. */
function siatka(rok: number, miesiac: number) {
  const przesuniecie = (new Date(rok, miesiac, 1).getDay() + 6) % 7
  const start = new Date(rok, miesiac, 1 - przesuniecie)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { data: d, obcy: d.getMonth() !== miesiac }
  })
}

export function Kalendarz() {
  const dzis = new Date(2026, 8, 19)
  const [kursor, setKursor] = useState({ rok: 2026, miesiac: 8 })
  const dni = useMemo(() => siatka(kursor.rok, kursor.miesiac), [kursor])
  const kafelki = useKafelki()

  const przesun = (krok: number) => setKursor(({ rok, miesiac }) => {
    const m = miesiac + krok
    if (m < 0) return { rok: rok - 1, miesiac: 11 }
    if (m > 11) return { rok: rok + 1, miesiac: 0 }
    return { rok, miesiac: m }
  })

  return (
    <Blok wypelnienie="p-3.5" className="flex h-full flex-col">
      {/* Pasek tytułu wychodzi na krawędzie kafelka, jak w oryginale. */}
      <div className={cn(
        'relative mb-3.5 border-b border-border py-2.5',
        kafelki ? '-mx-3.5 -mt-3.5 rounded-t-2xl px-3.5' : 'px-0',
      )}>
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate font-heading text-[16px] font-semibold tracking-tight text-foreground">
            Kalendarz
          </span>
          <button
            type="button"
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Otwórz <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="relative mb-3 flex w-full items-center justify-center px-8 pt-1">
        <div className="text-sm font-semibold capitalize text-foreground">
          {NAZWY_MIESIECY[kursor.miesiac]} {kursor.rok}
        </div>
        <div className="absolute inset-x-0 flex items-center justify-between">
          <button
            type="button"
            onClick={() => przesun(-1)}
            aria-label="Poprzedni miesiąc"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-background/45 text-foreground transition-colors hover:border-primary/50 hover:bg-primary/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => przesun(1)}
            aria-label="Następny miesiąc"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-background/45 text-foreground transition-colors hover:border-primary/50 hover:bg-primary/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid w-full grid-cols-7 gap-1">
        {DNI.map((d) => (
          <span key={d} className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      <div key={`${kursor.rok}-${kursor.miesiac}`} className="p2-wejscie grid w-full grid-cols-7 gap-1">
        {dni.map(({ data, obcy }, i) => {
          const dzisiaj = data.toDateString() === dzis.toDateString()
          return (
            <button
              key={i}
              type="button"
              className={cn(
                'inline-flex aspect-square w-full items-center justify-center rounded-md text-[11px] font-medium transition-colors',
                obcy ? 'text-muted-foreground/40' : 'text-foreground hover:bg-primary/15 hover:text-primary',
                dzisiaj && 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/45',
              )}
            >
              {data.getDate()}
            </button>
          )
        })}
      </div>

      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground">
        <span>Nic w tym miesiącu</span>
        <button
          type="button"
          onClick={() => przesun(-2)}
          className="inline-flex items-center gap-1 capitalize text-primary/80 transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-3 w-3" />
          {NAZWY_MIESIECY[(kursor.miesiac + 10) % 12]}
        </button>
      </p>
    </Blok>
  )
}

/* ═══ 6. TWOJE CHMURY ══════════════════════════════════════════ */

const CHMURY = [
  {
    id: 'system',
    przedrostek: 'System',
    ikona: CloudCog,
    opis: 'Notatki, prompty, pamięć AI i studio zdjęć — spięte z platformą, w jednym drzewie.',
    stopka: (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" />Tylko do odczytu
      </span>
    ),
    postep: null as number | null,
  },
  {
    id: 'private',
    przedrostek: 'Private',
    ikona: Cloud,
    opis: 'Twoje pliki i foldery. Zasady ustalasz sam — nic tu nie jest z góry ustalone.',
    stopka: (
      <span className="flex items-baseline gap-1 text-[11px] text-muted-foreground">
        <b className="font-semibold tabular-nums text-foreground">0 GB</b> z 1,0 GB
      </span>
    ),
    postep: 0,
  },
]

export function Chmury() {
  const kafelki = useKafelki()
  return (
    <div className="space-y-3">
      <div className="flex h-7 items-center justify-between px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Twoje chmury</h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CHMURY.map((c, i) => (
          <Wejscie
            key={c.id}
            opoznienie={i * 70}
            className={cn(
              'group flex cursor-pointer flex-col p-5 transition-[border-color,background-color,transform] duration-200',
              kafelki
                ? 'rounded-2xl border border-border bg-card/50 shadow-[var(--cien-uniesiony),var(--swiatlo-gorne)] hover:-translate-y-0.5 hover:border-primary/40'
                : 'px-0 py-1',
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_4px_18px_-6px_hsl(var(--primary)/0.5)] transition-transform duration-200 group-hover:-translate-y-0.5">
              <c.ikona className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-lg font-bold leading-tight text-foreground">
              {c.przedrostek}<span className="text-primary">Cloud</span>
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.opis}</p>

            <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-3">
              <span className="min-w-0 flex-1">
                {c.stopka}
                {c.postep !== null && (
                  <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-muted/30 shadow-[inset_0_1px_2px_hsl(var(--background)/.6)]">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${Math.max(c.postep, 2)}%` }}
                    />
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                Otwórz <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Wejscie>
        ))}
      </div>
    </div>
  )
}

/* ═══ 7. SZYBKA PODRÓŻ ═════════════════════════════════════════ */

export function SzybkaPodroz() {
  const kafelki = useKafelki()
  const kafelek = kafelki
    ? 'rounded-2xl border border-border bg-card/50 shadow-[var(--cien-uniesiony),var(--swiatlo-gorne)] hover:border-primary/40'
    : 'rounded-2xl border border-transparent hover:bg-foreground/[0.04]'

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="flex h-7 items-center justify-between px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Szybka Podróż</h2>
        <Przycisk wariant="tekst" ikona={<Pencil />} className="h-7 text-[11px]">Edytuj</Przycisk>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2.5">
        {SKROTY.map((s, i) => s ? (
          <button
            key={s.id}
            type="button"
            className={cn('group flex h-full min-h-[74px] cursor-pointer flex-col items-center justify-center gap-2 p-2 transition-[border-color,background-color,transform] duration-200', kafelek)}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:-translate-y-0.5"
              style={{
                background: `hsl(${s.odcien} / 0.14)`,
                color: `hsl(${s.odcien})`,
                borderColor: `hsl(${s.odcien} / 0.3)`,
              }}
            >
              <s.ikona className="h-4 w-4" />
            </span>
            <span className="w-full truncate px-1 text-center text-[9.5px] font-medium leading-none text-muted-foreground group-hover:text-foreground">
              {s.etykieta}
            </span>
          </button>
        ) : (
          <button
            key={`pusty-${i}`}
            type="button"
            title="Dodaj skrót"
            className={cn('group flex h-full min-h-[74px] cursor-pointer flex-col items-center justify-center gap-2 p-2 transition-[border-color,background-color,transform] duration-200', kafelek)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-[9.5px] leading-none text-muted-foreground/70">Dodaj</span>
          </button>
        ))}
      </div>
    </div>
  )
}
