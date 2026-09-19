/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0 — bloki treści
   Każdy blok to sekcja na wspólnym tle, nie osobny kafelek.
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo, useState } from 'react'
import {
  Activity, Diamond, Plus, Receipt, MessageSquare, Image as ImageIcon, Video,
  FileText, LayoutGrid, Palette, ArrowRight, Check, CalendarPlus, ListPlus,
  ChevronLeft, ChevronRight, Calendar, Lock, Cloud, CloudCog, Pencil,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AKTYWNOSC, MIESIACE, OSTATNIE, SKROTY, type TypPozycji } from './dane'
import { Blok, Naglowek, Przycisk, Segmenty, Wejscie } from './podstawy'

/* ═══ AKTYWNOŚĆ + PORTFEL ══════════════════════════════════════ */

const POZIOM = ['0.05', '0.22', '0.5', '0.95'] as const

export function PasAktywnosci({ saldo }: { saldo: number }) {
  const [zakres, setZakres] = useState<'7d' | '30d' | '90d'>('7d')

  return (
    <Blok className="space-y-3">
      <Naglowek
        ikona={<Activity />}
        tytul="Aktywność"
        akcja={
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
            <span className="p2-puls h-1.5 w-1.5 rounded-full bg-primary" />
            ostatnie 6 mies.
          </span>
        }
      />

      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        {/* Mapa dni */}
        <div className="min-w-0">
          <div className="p2-scroll overflow-x-auto pb-1">
            <div className="inline-block min-w-full">
              <div
                className="mb-1.5 grid text-[10px] text-foreground/35"
                style={{ gridTemplateColumns: `repeat(${MIESIACE.length}, minmax(0,1fr))` }}
              >
                {MIESIACE.map((m) => <span key={m}>{m}</span>)}
              </div>
              <div className="flex gap-[3px]">
                {AKTYWNOSC.map((tydzien, t) => (
                  <div key={t} className="flex flex-col gap-[3px]">
                    {tydzien.map((poziom, d) => (
                      <span
                        key={d}
                        title={`Poziom ${poziom}`}
                        className="h-[11px] w-[11px] rounded-[3px] transition-[background-color,transform] duration-200 hover:scale-[1.45]"
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
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-foreground/35">
            mniej
            {POZIOM.map((p) => (
              <span
                key={p}
                className="h-[9px] w-[9px] rounded-[2px]"
                style={{ background: `hsl(var(--primary) / ${p})` }}
              />
            ))}
            więcej
          </div>
        </div>

        {/* Portfel */}
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-baseline gap-1.5 text-[34px] font-bold leading-none tabular-nums text-foreground">
                {saldo}
                <Diamond className="h-4 w-4 text-primary" />
              </p>
              <p className="mt-2 text-[11.5px] text-foreground/40">Saldo Byte</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <Przycisk wariant="akcent" ikona={<Plus />}>Doładuj</Przycisk>
              <Przycisk ikona={<Receipt />}>Wydatki</Przycisk>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 text-[11px] tabular-nums text-foreground/40">
              <span>13.09</span>
              <span className="hidden sm:inline">16.09</span>
              <span>dziś</span>
              <Segmenty
                pozycje={[{ id: '7d', etykieta: '7d' }, { id: '30d', etykieta: '30d' }, { id: '90d', etykieta: '90d' }]}
                wybrane={zakres}
                onWybor={setZakres}
              />
            </div>
            <div className="p2-smuga relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06] shadow-[inset_0_1px_2px_hsl(var(--background)/.6)]" />
            <p className="mt-2 text-[12px] text-foreground/45">
              Brak zużycia w ostatnich {zakres === '7d' ? '7' : zakres === '30d' ? '30' : '90'} dniach
            </p>
          </div>
        </div>
      </div>
    </Blok>
  )
}

/* ═══ KOMPOZYTOR ═══════════════════════════════════════════════ */

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

  return (
    <Blok zawszeBezKafelka className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Segmenty
          rozmiar="md"
          pozycje={TRYBY.map((t) => ({
            id: t.id,
            etykieta: <><t.ikona className="h-3.5 w-3.5" />{t.etykieta}</>,
          }))}
          wybrane={tryb}
          onWybor={setTryb}
        />
        <span className="hidden items-center gap-1.5 text-[11px] text-foreground/35 sm:flex">
          <kbd className="rounded border border-foreground/[0.09] px-1 py-px font-mono text-[9.5px]">⌘↵</kbd>
          wyślij
        </span>
      </div>

      {/* Pole: jedna linia u dołu zamiast pudełka — rośnie na focusie. */}
      <div className="group/pole relative">
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          rows={3}
          placeholder={
            tryb === 'czat' ? 'Napisz wiadomość...'
              : tryb === 'obraz' ? 'Opisz obraz, który mam wygenerować...'
                : tryb === 'wideo' ? 'Opisz scenę wideo...'
                  : 'Zacznij notatkę...'
          }
          className="w-full resize-none bg-transparent pb-3 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-foreground/30"
        />
        <span aria-hidden className="block h-px w-full bg-foreground/[0.08]" />
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-primary/70 transition-transform duration-500 group-focus-within/pole:scale-x-100"
          style={{ transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)' }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-foreground/75 transition-colors duration-200 hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <span className="grid h-5 w-5 place-items-center rounded-md bg-primary/12 text-primary">
              <Activity className="h-3 w-3" />
            </span>
            Pro
            <ChevronRight className="h-3 w-3 rotate-90 text-foreground/35" />
          </button>
          <span className="flex items-center gap-1.5 text-[11.5px] text-foreground/40">
            <span className="flex items-center gap-1 tabular-nums text-foreground/65">
              ≈{aktywny.koszt}<Diamond className="h-3 w-3 text-primary/70" />
            </span>
            · zostanie {zostanie}
          </span>
        </div>

        <button
          type="button"
          className="group/cta inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold text-foreground/80 transition-colors duration-200 hover:bg-primary/12 hover:text-primary"
        >
          Utwórz w {aktywny.cel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </button>
      </div>
    </Blok>
  )
}

/* ═══ OSTATNIE ═════════════════════════════════════════════════ */

const IKONY_TYPU: Record<TypPozycji, LucideIcon> = {
  notatka: FileText,
  rozmowa: MessageSquare,
  plik:    FileText,
  obraz:   ImageIcon,
  tablica: Palette,
}

const ETYKIETY_TYPU: Record<TypPozycji, string> = {
  notatka: 'Notatka',
  rozmowa: 'Rozmowa',
  plik:    'Plik',
  obraz:   'Obraz',
  tablica: 'Tablica',
}

const FILTRY = [
  { id: 'wszystko', etykieta: <><LayoutGrid className="h-3.5 w-3.5" />Wszystko</>, tytul: 'Wszystko' },
  { id: 'notatka',  etykieta: <FileText className="h-3.5 w-3.5" />,      tytul: 'Notatki' },
  { id: 'rozmowa',  etykieta: <MessageSquare className="h-3.5 w-3.5" />, tytul: 'Rozmowy' },
  { id: 'plik',     etykieta: <FileText className="h-3.5 w-3.5" />,      tytul: 'Pliki' },
  { id: 'obraz',    etykieta: <ImageIcon className="h-3.5 w-3.5" />,     tytul: 'Obrazy' },
  { id: 'tablica',  etykieta: <Palette className="h-3.5 w-3.5" />,       tytul: 'Tablice' },
] as const

export function Ostatnie() {
  const [filtr, setFiltr] = useState<(typeof FILTRY)[number]['id']>('wszystko')
  const widoczne = useMemo(
    () => (filtr === 'wszystko' ? OSTATNIE : OSTATNIE.filter((o) => o.typ === filtr)),
    [filtr],
  )

  return (
    <Blok className="space-y-2">
      <Naglowek
        tytul="Wcześniej"
        akcja={<Segmenty pozycje={FILTRY as unknown as { id: string; etykieta: React.ReactNode; tytul?: string }[]} wybrane={filtr} onWybor={(id) => setFiltr(id as typeof filtr)} />}
      />

      <div className="p2-scroll max-h-[260px] overflow-y-auto">
        {widoczne.length === 0 ? (
          <p className="py-8 text-center text-[12.5px] text-foreground/35">Nic w tej kategorii.</p>
        ) : widoczne.map((o, i) => {
          const Ikona = IKONY_TYPU[o.typ]
          return (
            <Wejscie
              key={o.id}
              opoznienie={i * 28}
              className="group/rz flex cursor-pointer items-center gap-3 border-b border-foreground/[0.05] py-2.5 last:border-b-0"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-foreground/[0.05] text-foreground/45 shadow-[var(--swiatlo-gorne),var(--cien-plaski)] transition-colors duration-200 group-hover/rz:bg-primary/12 group-hover/rz:text-primary">
                <Ikona className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground/85 transition-colors duration-200 group-hover/rz:text-foreground">
                  {o.tytul}
                </span>
                <span className="text-[11px] text-foreground/35">{ETYKIETY_TYPU[o.typ]}</span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-foreground/35">{o.data}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-foreground/0 transition-all duration-200 group-hover/rz:translate-x-0 group-hover/rz:text-foreground/40" />
            </Wejscie>
          )
        })}
      </div>
    </Blok>
  )
}

/* ═══ NIC NIE CZEKA ════════════════════════════════════════════ */

export function NicNieCzeka() {
  return (
    <Blok zawszeBezKafelka className="py-6 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-foreground/[0.08] bg-foreground/[0.03] text-foreground/45 shadow-[var(--swiatlo-gorne),var(--cien-plaski)]">
        <Check className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[15px] font-semibold text-foreground">Nic nie czeka</p>
      <div className="mt-3 flex items-center justify-center gap-1">
        <Przycisk ikona={<CalendarPlus />}>Zaplanuj wydarzenie</Przycisk>
        <Przycisk ikona={<ListPlus />}>Dodaj zadanie</Przycisk>
      </div>
    </Blok>
  )
}

/* ═══ KALENDARZ ════════════════════════════════════════════════ */

const DNI = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie']
const NAZWY_MIESIECY = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
]

/** Siatka 6×7 z dniami sąsiednich miesięcy — tydzień zaczyna poniedziałek. */
function siatka(rok: number, miesiac: number) {
  const pierwszy = new Date(rok, miesiac, 1)
  const przesuniecie = (pierwszy.getDay() + 6) % 7
  const start = new Date(rok, miesiac, 1 - przesuniecie)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { data: d, obcy: d.getMonth() !== miesiac }
  })
}

export function Kalendarz() {
  const dzis = new Date(2026, 8, 19)
  const [kursor, setKursor] = useState({ rok: 2026, miesiac: 8 })
  const [kierunek, setKierunek] = useState(1)
  const dni = useMemo(() => siatka(kursor.rok, kursor.miesiac), [kursor])

  const przesun = (krok: number) => {
    setKierunek(krok)
    setKursor(({ rok, miesiac }) => {
      const m = miesiac + krok
      if (m < 0) return { rok: rok - 1, miesiac: 11 }
      if (m > 11) return { rok: rok + 1, miesiac: 0 }
      return { rok, miesiac: m }
    })
  }

  return (
    <Blok className="space-y-3">
      <Naglowek
        ikona={<Calendar />}
        tytul="Kalendarz"
        akcja={
          <Przycisk wariant="tekst" className="gap-1 text-[11px]">
            Otwórz <ArrowRight className="h-3 w-3" />
          </Przycisk>
        }
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => przesun(-1)}
          aria-label="Poprzedni miesiąc"
          className="grid h-7 w-7 place-items-center rounded-lg text-foreground/40 transition-colors duration-200 hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-semibold text-foreground">
          {NAZWY_MIESIECY[kursor.miesiac]} {kursor.rok}
        </span>
        <button
          type="button"
          onClick={() => przesun(1)}
          aria-label="Następny miesiąc"
          className="grid h-7 w-7 place-items-center rounded-lg text-foreground/40 transition-colors duration-200 hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 pb-1">
          {DNI.map((d) => (
            <span key={d} className="text-center font-mono text-[9.5px] font-bold uppercase tracking-wide text-foreground/28">
              {d}
            </span>
          ))}
        </div>
        {/* Klucz na miesiącu wymusza ponowne wejście — stąd delikatny przesuw. */}
        <div
          key={`${kursor.rok}-${kursor.miesiac}`}
          className="p2-wejscie grid grid-cols-7 gap-y-0.5"
          style={{ ['--tw-enter-x' as string]: `${kierunek * 8}px` }}
        >
          {dni.map(({ data, obcy }, i) => {
            const dzisiaj = data.toDateString() === dzis.toDateString()
            return (
              <button
                key={i}
                type="button"
                className={cn(
                  'relative mx-auto grid h-8 w-8 place-items-center rounded-lg text-[12px] tabular-nums',
                  'transition-colors duration-200',
                  obcy ? 'text-foreground/20' : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground',
                  dzisiaj && 'font-bold text-primary',
                )}
              >
                {data.getDate()}
                {dzisiaj && (
                  <span aria-hidden className="absolute inset-0 rounded-lg bg-primary/10 shadow-[var(--swiatlo-gorne)] ring-1 ring-inset ring-primary/45" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-center text-[11.5px] text-foreground/35">Nic w tym miesiącu</p>
    </Blok>
  )
}

/* ═══ CHMURY ═══════════════════════════════════════════════════ */

const CHMURY = [
  {
    id: 'system',
    nazwa: 'SystemCloud',
    ikona: CloudCog,
    opis: 'Notatki, prompty, pamięć AI i studio zdjęć — spięte z platformą, w jednym drzewie.',
    stopka: 'Tylko do odczytu',
    stopkaIkona: Lock,
    postep: null as number | null,
  },
  {
    id: 'private',
    nazwa: 'PrivateCloud',
    ikona: Cloud,
    opis: 'Twoje pliki i foldery. Zasady ustalasz sam — nic tu nie jest z góry ustalone.',
    stopka: '0 GB z 1,0 GB',
    stopkaIkona: null,
    postep: 0,
  },
]

export function Chmury() {
  return (
    <Blok className="space-y-3">
      <Naglowek tytul="Twoje chmury" />
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {CHMURY.map((c, i) => (
          <Wejscie key={c.id} opoznienie={i * 70} className="group/ch min-w-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/[0.11] text-primary shadow-[var(--swiatlo-gorne),var(--cien-plaski)] ring-1 ring-inset ring-primary/15 transition-[background-color,transform] duration-300 group-hover/ch:scale-105 group-hover/ch:bg-primary/[0.18]">
              <c.ikona className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[17px] font-bold text-foreground">{c.nazwa}</p>
            <p className="mt-1.5 max-w-[42ch] text-[12.5px] leading-relaxed text-foreground/50">{c.opis}</p>

            {c.postep !== null && (
              <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06] shadow-[inset_0_1px_2px_hsl(var(--background)/.6)]">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${Math.max(c.postep, 2)}%` }}
                />
              </span>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[11.5px] text-foreground/40">
                {c.stopkaIkona && <c.stopkaIkona className="h-3 w-3" />}
                {c.stopka}
              </span>
              <button
                type="button"
                className="group/o inline-flex items-center gap-1.5 text-[12px] font-semibold text-foreground/70 transition-colors duration-200 hover:text-primary"
              >
                Otwórz
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/o:translate-x-1" />
              </button>
            </div>
          </Wejscie>
        ))}
      </div>
    </Blok>
  )
}

/* ═══ SZYBKA PODRÓŻ ════════════════════════════════════════════ */

export function SzybkaPodroz() {
  return (
    <Blok className="space-y-3">
      <Naglowek
        tytul="Szybka podróż"
        akcja={<Przycisk wariant="tekst" ikona={<Pencil />} className="text-[11px]">Edytuj</Przycisk>}
      />
      <div className="grid grid-cols-3 gap-2">
        {SKROTY.map((s, i) => s ? (
          <button
            key={s.id}
            type="button"
            className="group/s flex flex-col items-center gap-2 rounded-xl py-3 transition-colors duration-200 hover:bg-foreground/[0.04]"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-xl shadow-[var(--swiatlo-gorne),var(--cien-plaski)] transition-transform duration-300 group-hover/s:-translate-y-0.5"
              style={{ background: `hsl(${s.odcien} / 0.14)`, color: `hsl(${s.odcien})` }}
            >
              <s.ikona className="h-4 w-4" />
            </span>
            <span className="w-full truncate px-1 text-center text-[10.5px] text-foreground/55">{s.etykieta}</span>
          </button>
        ) : (
          <button
            key={`pusty-${i}`}
            type="button"
            title="Dodaj skrót"
            className="group/d flex flex-col items-center gap-2 rounded-xl border border-dashed border-foreground/[0.09] py-3 transition-colors duration-200 hover:border-primary/35"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg text-foreground/25 transition-colors duration-200 group-hover/d:text-primary">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-[10.5px] text-foreground/30">Dodaj</span>
          </button>
        ))}
      </div>
    </Blok>
  )
}
