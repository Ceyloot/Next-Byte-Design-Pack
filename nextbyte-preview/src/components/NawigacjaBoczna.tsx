/* ═══════════════════════════════════════════════════════════════
   NAWIGACJA BOCZNA — pasek boczny platformy 1:1

   Przepisany z `nextbyte-panel-glowny` co do klasy i piksela:
     • AppSidebar.tsx        — kolejność: nagłówek, szukajka, lista, stopka
     • ui/sidebar.tsx        — szerokość 15rem, wariant floating (+ spacing.6, p-3)
     • SidebarHeader.tsx     — znak 40 px z halo, NEXTBYTE text-lg, przyciski 28 px
     • SidebarSearchTrigger  — pole ikony 28 px, ⌘K w `nb-wiersz`
     • SidebarMenuSection    — wiersz `px-2 py-1.5 rounded-xl text-[13px]`,
                               pole ikony 28 px, ikona 17 px / stroke 1.75,
                               etykieta sekcji 10 px / 0.14em / foreground 0.38
     • PasekKart.tsx         — dok 48 px, szklany kafelek z kreską akcentu

   Platforma ciągnie dane z routera i Supabase — tutaj wszystko idzie
   z propsów, więc ten sam pasek niesie menu platformy albo treść modułu
   (np. notatniki w Next Scribe). Wyglądu NIE zmieniamy per moduł:
   moduł podaje tylko inne pozycje.
   ═══════════════════════════════════════════════════════════════ */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Search, Command, Sun, Moon, PanelLeftClose, PanelLeft, Activity, Bell, Diamond, User, ChevronDown, ChevronRight, ChevronLeft, FolderOpen, Plus, GripVertical, LayoutGrid } from 'lucide-react'
import { odczytajAktualnyMotyw, przelaczNastepnyMotyw, type PozycjaMotywu } from '@/sections/panel2/fundament/kolejka-motywow'
import { cn } from '@/lib/utils'
import znak from '@/assets/nextbyte-mark.png'
import './nawigacja-boczna.css'

type Ikona = React.ComponentType<{ className?: string; strokeWidth?: number }>

export interface PozycjaNawigacji {
  id: string
  etykieta: string
  ikona: Ikona
  /** Tekst stonowany jak pozycje `muted` w platformie. */
  cicha?: boolean
  /** Pozycja `tier: 'primary'` z platformy: pełny kolor tekstu i `font-medium`. */
  wyrozniona?: boolean
  /** Coś po prawej: licznik, znacznik, akcje wiersza. */
  koniec?: React.ReactNode
  /** Kolor ikony spoza akcentu (np. tożsamość modułu). */
  kolorIkony?: string
}

export interface SekcjaNawigacji {
  id: string
  /** Bez tytułu = sekcja bez nagłówka (jak „Panel Główny"). */
  tytul?: string
  /** Akcja po prawej stronie nagłówka sekcji. */
  akcja?: React.ReactNode
  pozycje: PozycjaNawigacji[]
}

/** Szyna: pasek zwinięty i nie rozwinięty najechaniem. Etykiety gasną, pola ikon zostają w miejscu. */
const SzynaKontekst = createContext(false)
const GASNIE = 'transition-opacity duration-150'
/** Dla treści modułu: czy pasek jest teraz szyną (np. żeby schować akapit). */
export const useSzyna = () => useContext(SzynaKontekst)

/** Lista wierszy: `SidebarMenu` (flex-col gap-1) + `space-y-0.5` z sekcji — oba działają naraz. */
export const LISTA_WIERSZY = 'flex w-full min-w-0 flex-col gap-1 space-y-0.5'

/* ── Wiersz ─────────────────────────────────────────────────────── */

export function WierszNawigacji({
  pozycja,
  aktywna,
  onClick,
  wciecie,
}: {
  pozycja: PozycjaNawigacji
  aktywna?: boolean
  onClick?: () => void
  /** Wiersz zagnieżdżony (np. źródło w playliście). */
  wciecie?: boolean
}) {
  const I = pozycja.ikona
  const szyna = useContext(SzynaKontekst)
  return (
    <li title={szyna ? pozycja.etykieta : undefined}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
        aria-current={aktywna ? 'page' : undefined}
        className={cn(
          /* Wysokość STAŁA 32 px: w platformie baza `h-9` przegrywa w twMerge
             z wariantem rozmiaru `h-8`, a `py-1.5` nie powiększa wiersza,
             bo `overflow-hidden` trzyma pole ikony 28 px w środku. */
          'group flex h-8 w-full cursor-pointer items-center overflow-hidden rounded-[0.75rem] text-[13px] outline-none transition-all duration-300',
          'px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-primary/45',
          wciecie && !szyna && 'ml-5 w-[calc(100%-1.25rem)]',
          aktywna
            ? 'nb-nav-pozycja-akt font-medium text-foreground'
            : cn(
              'nb-nav-pozycja hover:text-foreground',
              pozycja.wyrozniona ? 'font-medium text-foreground' : pozycja.cicha ? 'text-foreground/70' : 'text-foreground/[0.88]',
            ),
        )}
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.75rem]',
            aktywna ? 'nb-nav-ikona-akt text-primary' : cn('nb-nav-ikona', pozycja.kolorIkony ?? 'text-foreground/60 group-hover:text-foreground/90'),
          )}
        >
          <I strokeWidth={1.75} className="h-[17px] w-[17px]" />
        </span>
        <span className={cn('ml-2 min-w-0 flex-1 truncate whitespace-nowrap', GASNIE, szyna && 'opacity-0')}>{pozycja.etykieta}</span>
        {pozycja.koniec && <span className={cn('ml-2 flex shrink-0 items-center gap-1.5', GASNIE, szyna && 'pointer-events-none opacity-0')}>{pozycja.koniec}</span>}
      </div>
    </li>
  )
}

/* ── Nagłówek sekcji ───────────────────────────────────────────── */

export function NaglowekSekcjiNawigacji({ tytul, akcja }: { tytul: string; akcja?: React.ReactNode }) {
  const szyna = useContext(SzynaKontekst)
  return (
    <div className="relative mb-1 flex h-4 items-center justify-between px-2 pt-4 box-content">
      {szyna && <div aria-hidden className="absolute left-2 h-px w-7 bg-foreground/[0.12]" />}
      <span className={cn('h-4 whitespace-nowrap text-[10px] font-medium uppercase leading-4 tracking-[0.14em] text-foreground/[0.38]', GASNIE, szyna && 'opacity-0')}>{tytul}</span>
      <span className={cn(GASNIE, szyna && 'pointer-events-none opacity-0')}>{akcja}</span>
    </div>
  )
}


/* ═══ PANEL NARZĘDZIA — elementy 1:1 z Chat AI ════════════════════
   Menu platformy ma wiersze z polem ikony 28 px. Panel narzędzia (lista
   rozmów w Chat AI) jest gęstszy i lżejszy: wiersze bez pól ikon, tekst
   15 px, grupy z chevronem i folderem, aktywny wiersz w obwódce. */

/** Pigułka modułu pod szukajką: „‹ Chat AI · MENU" — 1:1 z panelem Chat AI (h-10, rounded-lg, 13 px). */
export function PigulkaModulu({ nazwa, onClick }: { nazwa: string; onClick?: () => void }) {
  const szyna = useContext(SzynaKontekst)
  return (
    <button
      type="button"
      onClick={onClick}
      title={szyna ? nazwa : undefined}
      className={cn(
        'group flex h-10 items-center gap-2 overflow-hidden rounded-lg border border-primary/25 bg-primary/[0.08] text-left text-[13px] font-semibold text-foreground transition-colors hover:border-primary/45 hover:bg-primary/[0.14]',
        szyna ? 'w-10 justify-center px-0' : 'w-full px-2.5',
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5" />
      {!szyna && <span className="min-w-0 truncate whitespace-nowrap">{nazwa}</span>}
      {!szyna && <span className="ml-auto whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Menu</span>}
    </button>
  )
}

/** Licznik z lupą: „31 ROZMÓW  (⌕)" — 10 px / 0.14em, lupa `h-8 w-8 rounded-lg`. */
export function LicznikPanelu({ tekst, onSzukaj }: { tekst: string; onSzukaj?: () => void }) {
  const szyna = useContext(SzynaKontekst)
  if (szyna) return null
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">{tekst}</span>
      <button type="button" onClick={onSzukaj} aria-label="Szukaj" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
        <Search className="h-4 w-4" />
      </button>
    </div>
  )
}

/** „+ Nowa Rozmowa": pigułka h-9, `text-xs font-medium`, rant i poświata akcentu. */
export function PigulkaNowy({ tekst, onClick }: { tekst: string; onClick?: () => void }) {
  const szyna = useContext(SzynaKontekst)
  return (
    <button
      type="button"
      onClick={onClick}
      title={szyna ? tekst : undefined}
      className={cn(
        'mt-3 flex h-9 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border border-primary/25 bg-primary/[0.07] text-foreground/90 transition-colors hover:border-primary/40 hover:bg-primary/[0.12] hover:text-foreground shadow-[0_0_12px_-6px_hsl(var(--primary)/0.4)]',
        szyna ? 'w-9' : 'w-full px-3',
      )}
    >
      <Plus className="h-4 w-4 shrink-0 text-primary" />
      <span className={cn('text-xs font-medium', GASNIE, szyna && 'hidden')}>{tekst}</span>
    </button>
  )
}

/** Nagłówek grupy panelu: ten sam nagłówek co sekcje menu (10 px / 0.14em / 0.38), z chevronem zwijania i akcją po prawej. */
export function GrupaPanelu({
  tytul, ikona: I = FolderOpen, otwarta = true, onPrzelacz, akcja, children,
}: {
  tytul: string
  ikona?: Ikona
  otwarta?: boolean
  onPrzelacz?: () => void
  akcja?: React.ReactNode
  children?: React.ReactNode
}) {
  const szyna = useContext(SzynaKontekst)
  return (
    <div className="mb-1.5">
      <div className="relative mb-1 box-content flex h-4 items-center justify-between px-2 pt-4">
        {szyna && <div aria-hidden className="absolute left-2 h-px w-7 bg-foreground/[0.12]" />}
        <button type="button" onClick={onPrzelacz} aria-expanded={otwarta} className={cn('flex min-w-0 items-center gap-1.5 text-left', GASNIE, szyna && 'pointer-events-none opacity-0')}>
          {otwarta ? <ChevronDown className="h-3 w-3 shrink-0 text-foreground/[0.38]" /> : <ChevronRight className="h-3 w-3 shrink-0 text-foreground/[0.38]" />}
          <I className="h-3 w-3 shrink-0 text-foreground/[0.38]" />
          <span className="h-4 truncate whitespace-nowrap text-[10px] font-medium uppercase leading-4 tracking-[0.14em] text-foreground/[0.38]">{tytul}</span>
        </button>
        <span className={cn('flex items-center', GASNIE, szyna && 'pointer-events-none opacity-0')}>{akcja}</span>
      </div>
      {otwarta && <ul className={LISTA_WIERSZY}>{children}</ul>}
    </div>
  )
}

/** Wiersz listy panelu = wiersz menu platformy (`WierszNawigacji`): pole ikony 28 px, tekst 13 px, pigułka aktywna. */
export function WierszPanelu({
  etykieta, ikona, kolorIkony, aktywny, koniec, wciecie, onClick,
}: {
  etykieta: string
  ikona?: Ikona
  kolorIkony?: string
  aktywny?: boolean
  koniec?: React.ReactNode
  wciecie?: boolean
  onClick?: () => void
}) {
  return (
    <WierszNawigacji
      wciecie={wciecie}
      aktywna={aktywny}
      onClick={onClick}
      pozycja={{ id: etykieta, etykieta, ikona: ikona ?? FolderOpen, koniec, kolorIkony }}
    />
  )
}

/* ── Pasek ─────────────────────────────────────────────────────── */

export function NawigacjaBoczna({
  sekcje = [],
  aktywna,
  onWybor,
  naGorze,
  children,
  stopka,
  onZwin,
  onMotyw,
  onSzukaj,
  szerokosc = 264,
  strona = 'lewo',
  onUchwyt,
  className,
}: {
  sekcje?: SekcjaNawigacji[]
  aktywna?: string
  onWybor?: (id: string) => void
  /** Wiersz pod szukajką (np. powrót do menu z modułu). */
  naGorze?: React.ReactNode
  /** Własna treść zamiast `sekcje` — i tak w tym samym przewijanym środku. */
  children?: React.ReactNode
  /** Coś nad dokiem (np. rozwijane notatki). */
  stopka?: React.ReactNode
  onZwin?: () => void
  onMotyw?: () => void
  onSzukaj?: () => void
  /** Szerokość tafli w px. Menu: 264 (`SZEROKOSC_KORZENIA`), panel narzędzia: do 340. */
  szerokosc?: number
  /** Do której krawędzi przypięty — tafla rozwija się od niej. */
  strona?: 'lewo' | 'prawo'
  /** Uchwyt przeciągania (dokowanie góra/dół/lewo/prawo). Bez niego uchwytu nie ma. */
  onUchwyt?: (e: React.PointerEvent) => void
  className?: string
}) {
  const [zwiniety, setZwiniety] = useState(false)
  const [najechany, setNajechany] = useState(false)
  const [motyw, setMotyw] = useState<PozycjaMotywu>(odczytajAktualnyMotyw)
  const szyna = zwiniety && !najechany

  useEffect(() => {
    const odswiez = () => setMotyw(odczytajAktualnyMotyw())
    window.addEventListener('themeChanged', odswiez)
    window.addEventListener('nb-theme-change', odswiez)
    return () => {
      window.removeEventListener('themeChanged', odswiez)
      window.removeEventListener('nb-theme-change', odswiez)
    }
  }, [])

  const zmienMotyw = () => { if (onMotyw) onMotyw(); else setMotyw(przelaczNastepnyMotyw()) }
  const przelaczZwiniecie = () => {
    if (zwiniety) { setZwiniety(false); setNajechany(false) } else setZwiniety(true)
    onZwin?.()
  }

  /* Szerokości 1:1 z platformy: tafla 264 px w menu (`SZEROKOSC_KORZENIA`,
     PanelPaskaContext.tsx — nie 15rem z ui/sidebar, które nadpisuje powłoka),
     szerzej w panelu narzędzia; szyna 4.25rem. Do tego 24 px na `p-3`.
     Miejsce w układzie trzyma zewnętrzny kontener; tafla leży nad nim, więc
     rozwinięcie najechaniem zasłania treść zamiast ją przesuwać — jak w platformie. */
  const szer = (waski: boolean) => (waski ? 'w-[calc(4.25rem+1.5rem)]' : '')
  const styl = (waski: boolean): React.CSSProperties | undefined => (waski ? undefined : { width: szerokosc + 24 })

  return (
    <SzynaKontekst.Provider value={szyna}>
    <div className={cn('nbb relative h-full shrink-0 transition-[width] duration-300 ease-out', szer(zwiniety), className)} style={styl(zwiniety)}>
      <div
        onMouseEnter={() => zwiniety && setNajechany(true)}
        onMouseLeave={() => setNajechany(false)}
        className={cn(
          'absolute inset-y-0 p-3 transition-[width] duration-300 ease-out will-change-[width]',
          strona === 'prawo' ? 'right-0' : 'left-0',
          szer(szyna),
          zwiniety && najechany && 'z-50',
        )}
        style={styl(szyna)}
      >
      <div className={cn('nbb-tafla relative flex h-full w-full flex-col', zwiniety && najechany && 'shadow-2xl shadow-black/30')}>
        {/* Kreska akcentu na górnej krawędzi (ui/sidebar.tsx) */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {onUchwyt && (
          <button
            type="button"
            onPointerDown={onUchwyt}
            title="Złap i przeciągnij, aby przypiąć pasek (góra / dół / lewo / prawo)"
            aria-label="Przeciągnij pasek"
            className="relative z-10 mx-auto mt-1.5 flex h-4 w-8 cursor-grab items-center justify-center rounded-md text-foreground/30 transition-colors hover:text-primary active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 rotate-90" />
          </button>
        )}

        {/* NAGŁÓWEK */}
        <div className={cn('relative z-10 px-3', onUchwyt ? 'pb-3 pt-1' : 'py-3')}>
          <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center space-x-2.5">
              <div className="relative h-10 w-10 flex-shrink-0">
                <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-2xl" />
                <div className="nbb-kafelek relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-1.5 !border-primary/30">
                  <img src={znak} alt="NextByte" className="nb-znak-marki h-full w-full rounded-xl object-contain" />
                </div>
              </div>
              <h2 className={cn('whitespace-nowrap text-lg font-bold leading-tight tracking-tight text-foreground', GASNIE, szyna && 'opacity-0')}>NEXTBYTE</h2>
            </div>
            <div className={cn('flex items-center gap-1', GASNIE, szyna && 'pointer-events-none opacity-0')}>
              <button
                type="button"
                onClick={zmienMotyw}
                title={motyw.jasny ? 'Ciemny motyw' : 'Jasny motyw'}
                aria-label={motyw.jasny ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw'}
                className="nb-ikona-kafel group flex h-7 w-7 items-center justify-center rounded-[0.75rem] border text-foreground/70 transition-all duration-300 hover:text-primary"
              >
                {motyw.jasny ? <Moon className="h-3.5 w-3.5" strokeWidth={2} /> : <Sun className="h-3.5 w-3.5" strokeWidth={2} />}
              </button>
              {zwiniety ? (
                <button
                  type="button"
                  onClick={przelaczZwiniecie}
                  title="Rozwiń menu"
                  aria-label="Rozwiń pasek boczny"
                  className="flex h-7 w-7 items-center justify-center rounded-[0.75rem] border border-primary/30 bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/15 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.06),0_0_12px_-2px_hsl(var(--primary)/0.45)]"
                >
                  <PanelLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={przelaczZwiniecie}
                  title="Zwiń menu"
                  aria-label="Zwiń pasek boczny"
                  className="nb-ikona-kafel group flex h-7 w-7 items-center justify-center rounded-[0.75rem] border text-foreground/70 transition-all duration-300 hover:text-primary"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SZUKAJKA */}
        <div className="relative z-10 px-3 pb-2 pt-3">
          <button
            type="button"
            onClick={onSzukaj}
            aria-label="Wyszukaj"
            className="nb-ikona-kafel group relative flex w-full items-center gap-2 rounded-[0.75rem] border px-2 py-1.5 text-[13px] text-foreground/65 transition-all duration-300 hover:text-foreground"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
              <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
            </span>
            <span className={cn('flex-1 truncate whitespace-nowrap text-left tracking-tight', GASNIE, szyna && 'opacity-0')}>Wyszukaj...</span>
            <kbd className={cn('nb-wiersz flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-foreground/55', GASNIE, szyna && 'opacity-0')}>
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
          {naGorze && <div className="mt-2">{naGorze}</div>}
        </div>

        {/* ŚRODEK — przewijany, z miękkim wygaszeniem góry i dołu */}
        <div
          className="nbb-lista relative z-10 min-h-0 flex-1 overflow-y-auto pb-3 pl-3 pr-2 pt-2"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
          }}
        >
          {children ?? sekcje.map((s) => (
            <div key={s.id} className={cn('py-2', s.tytul ? 'mb-1.5' : 'mb-0.5')}>
              {s.tytul && <NaglowekSekcjiNawigacji tytul={s.tytul} akcja={s.akcja} />}
              <ul className={LISTA_WIERSZY}>
                {s.pozycje.map((p) => (
                  <WierszNawigacji key={p.id} pozycja={p} aktywna={p.id === aktywna} onClick={() => onWybor?.(p.id)} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {stopka && <div className={cn('relative z-10 overflow-hidden px-3', GASNIE, szyna && 'pointer-events-none opacity-0')}>{stopka}</div>}

        {/* DOK — PasekKart: szklany kafelek 48 px z kreską akcentu */}
        <div className="relative z-10 px-3 py-2">
          <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          {szyna ? (
            <button type="button" aria-label="Aktywność, powiadomienia, saldo, profil" className="nb-ikona-kafel mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/70 transition-colors hover:text-primary">
              <LayoutGrid className="h-[18px] w-[18px]" />
            </button>
          ) : (
          <div className="nbb-kafelek relative overflow-hidden rounded-2xl p-1.5">
            <div className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="flex h-9 items-center justify-between gap-1">
              {[
                { I: Activity, l: 'Aktywność' },
                { I: Bell, l: 'Powiadomienia' },
                { I: Diamond, l: 'Saldo' },
                { I: User, l: 'Profil' },
              ].map(({ I, l }) => (
                <button
                  key={l}
                  type="button"
                  aria-label={l}
                  className="flex h-9 w-full flex-1 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <I className="h-[18px] w-[18px] shrink-0" />
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
      </div>
    </div>
    </SzynaKontekst.Provider>
  )
}
