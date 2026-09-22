import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Spline, Trash2, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { wygladzPunkty, zaostrzPunkty } from './animacja'
import type { Efekt, Projekt, Wezel } from './typy'

interface Props {
  projekt: Projekt
  wybrane: string[]
  onWybierz: (ids: string[]) => void
  onAktualizuj: (id: string, zmiany: Partial<Wezel>) => void
  onProjekt: (zmiany: Partial<Projekt>) => void
  onUsun: (id: string) => void
  onDuplikuj: (id: string) => void
  onPrzesunWarstwe: (id: string, kierunek: -1 | 1) => void
  onZakonczOperacje: () => void
}

const EFEKTY: { klucz: Efekt; etykieta: string }[] = [
  { klucz: 'brak', etykieta: 'Brak' },
  { klucz: 'glass', etykieta: 'Glass' },
  { klucz: 'liquid', etykieta: 'Liquid' },
  { klucz: 'neon', etykieta: 'Neon' },
  { klucz: 'gradient', etykieta: 'Gradient' },
  { klucz: 'siatka', etykieta: 'Siatka' },
]

export function Inspektor({
  projekt,
  wybrane,
  onWybierz,
  onAktualizuj,
  onProjekt,
  onUsun,
  onDuplikuj,
  onPrzesunWarstwe,
  onZakonczOperacje,
}: Props) {
  const wezel = wybrane.length === 1 ? projekt.wezly.find(w => w.id === wybrane[0]) : undefined
  const zmien = (zmiany: Partial<Wezel>) => {
    if (!wezel) return
    onAktualizuj(wezel.id, zmiany)
    onZakonczOperacje()
  }

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-border/60 bg-card/40 backdrop-blur-xl">
      {/* Warstwy */}
      <div className="flex max-h-[38%] flex-col border-b border-border/50">
        <div className="px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Warstwy ({projekt.wezly.length})
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
          {[...projekt.wezly].reverse().map(w => {
            const aktywna = wybrane.includes(w.id)
            return (
              <div
                key={w.id}
                onClick={e => onWybierz(e.shiftKey ? [...new Set([...wybrane, w.id])] : [w.id])}
                className={cn(
                  'group flex cursor-default items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] transition-colors',
                  aktywna ? 'bg-primary/15 text-primary' : 'text-foreground/60 hover:bg-foreground/5',
                )}
              >
                <span className="flex-1 truncate">{w.nazwa}</span>
                {w.klatki.length > 0 && (
                  <span className="rounded bg-amber-400/15 px-1 text-[8px] font-bold text-amber-300">
                    {w.klatki.length}
                  </span>
                )}
                <IkonaPrzycisk
                  tytul={w.widoczny ? 'Ukryj' : 'Pokaż'}
                  onClick={() => {
                    onAktualizuj(w.id, { widoczny: !w.widoczny })
                    onZakonczOperacje()
                  }}
                >
                  {w.widoczny ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </IkonaPrzycisk>
                <IkonaPrzycisk
                  tytul={w.zablokowany ? 'Odblokuj' : 'Zablokuj'}
                  onClick={() => {
                    onAktualizuj(w.id, { zablokowany: !w.zablokowany })
                    onZakonczOperacje()
                  }}
                >
                  {w.zablokowany ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </IkonaPrzycisk>
                <IkonaPrzycisk tytul="W górę" onClick={() => onPrzesunWarstwe(w.id, 1)}>
                  <ArrowUp className="h-3 w-3" />
                </IkonaPrzycisk>
                <IkonaPrzycisk tytul="W dół" onClick={() => onPrzesunWarstwe(w.id, -1)}>
                  <ArrowDown className="h-3 w-3" />
                </IkonaPrzycisk>
                <IkonaPrzycisk tytul="Duplikuj" onClick={() => onDuplikuj(w.id)}>
                  <Copy className="h-3 w-3" />
                </IkonaPrzycisk>
                <IkonaPrzycisk tytul="Usuń" onClick={() => onUsun(w.id)}>
                  <Trash2 className="h-3 w-3" />
                </IkonaPrzycisk>
              </div>
            )
          })}
          {projekt.wezly.length === 0 && (
            <p className="px-2 py-4 text-[11px] text-foreground/35">Pusto. Wstaw kafelek z biblioteki albo narysuj kształt.</p>
          )}
        </div>
      </div>

      {/* Właściwości */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
        {!wezel && (
          <Sekcja tytul="Dokument">
            <Pole etykieta="Nazwa">
              <input
                value={projekt.nazwa}
                onChange={e => onProjekt({ nazwa: e.target.value })}
                className={KLASA_INPUT}
              />
            </Pole>
            <div className="grid grid-cols-2 gap-2">
              <Liczba etykieta="Szerokość" wartosc={projekt.szerokosc} onZmiana={v => onProjekt({ szerokosc: v })} />
              <Liczba etykieta="Wysokość" wartosc={projekt.wysokosc} onZmiana={v => onProjekt({ wysokosc: v })} />
            </div>
            <Pole etykieta="Tło">
              <Kolor wartosc={projekt.tlo} onZmiana={v => onProjekt({ tlo: v })} />
            </Pole>
            <Liczba
              etykieta="Długość osi (ms)"
              wartosc={projekt.dlugosc}
              krok={100}
              onZmiana={v => onProjekt({ dlugosc: Math.max(200, v) })}
            />
          </Sekcja>
        )}

        {wybrane.length > 1 && (
          <p className="text-[11px] text-foreground/45">Zaznaczono {wybrane.length} warstw — edytuj pojedynczo.</p>
        )}

        {wezel && (
          <>
            <Sekcja tytul="Warstwa">
              <Pole etykieta="Nazwa">
                <input value={wezel.nazwa} onChange={e => zmien({ nazwa: e.target.value })} className={KLASA_INPUT} />
              </Pole>
              <div className="grid grid-cols-2 gap-2">
                <Liczba etykieta="X" wartosc={wezel.x} onZmiana={v => zmien({ x: v })} />
                <Liczba etykieta="Y" wartosc={wezel.y} onZmiana={v => zmien({ y: v })} />
                <Liczba etykieta="Szer." wartosc={wezel.w} onZmiana={v => zmien({ w: Math.max(1, v) })} />
                <Liczba etykieta="Wys." wartosc={wezel.h} onZmiana={v => zmien({ h: Math.max(1, v) })} />
                <Liczba etykieta="Obrót °" wartosc={wezel.obrot} onZmiana={v => zmien({ obrot: v })} />
                <Liczba etykieta="Skala" wartosc={wezel.skala} krok={0.05} onZmiana={v => zmien({ skala: Math.max(0.01, v) })} />
              </div>
              <Suwak etykieta="Krycie" wartosc={wezel.krycie} onZmiana={v => zmien({ krycie: v })} />
            </Sekcja>

            {(wezel.typ === 'prostokat' || wezel.typ === 'elipsa' || wezel.typ === 'sciezka') && (
              <Sekcja tytul="Wektor">
                <Pole etykieta="Wypełnienie">
                  <Kolor wartosc={wezel.wypelnienie ?? 'none'} onZmiana={v => zmien({ wypelnienie: v })} />
                </Pole>
                <Pole etykieta="Obrys">
                  <Kolor wartosc={wezel.obrys ?? 'transparent'} onZmiana={v => zmien({ obrys: v })} />
                </Pole>
                <div className="grid grid-cols-2 gap-2">
                  <Liczba etykieta="Grubość" wartosc={wezel.grubosc ?? 0} onZmiana={v => zmien({ grubosc: Math.max(0, v) })} />
                  {wezel.typ === 'prostokat' && (
                    <Liczba etykieta="Promień" wartosc={wezel.promien ?? 0} onZmiana={v => zmien({ promien: Math.max(0, v) })} />
                  )}
                </div>
              </Sekcja>
            )}

            {wezel.typ === 'sciezka' && (
              <Sekcja tytul="Ścieżka">
                <div className="grid grid-cols-2 gap-1.5">
                  <MalyPrzycisk
                    onClick={() => zmien({ punkty: wygladzPunkty(wezel.punkty ?? [], !!wezel.zamknieta) })}
                    ikona={<Spline className="h-3 w-3" />}
                  >
                    Zamień w krzywe
                  </MalyPrzycisk>
                  <MalyPrzycisk onClick={() => zmien({ punkty: zaostrzPunkty(wezel.punkty ?? []) })}>Zaostrz</MalyPrzycisk>
                  <MalyPrzycisk onClick={() => zmien({ zamknieta: !wezel.zamknieta })}>
                    {wezel.zamknieta ? 'Otwórz' : 'Zamknij'}
                  </MalyPrzycisk>
                </div>
                <p className="text-[10px] text-foreground/35">Punktów: {wezel.punkty?.length ?? 0}</p>
              </Sekcja>
            )}

            {(wezel.typ === 'kafelek' || wezel.typ === 'przycisk') && (
              <Sekcja tytul="Styl kafelka">
                <Pole etykieta="Efekt">
                  <div className="grid grid-cols-3 gap-1">
                    {EFEKTY.map(e => (
                      <button
                        key={e.klucz}
                        onClick={() => zmien({ efekt: e.klucz })}
                        className={cn(
                          'rounded-md border px-1 py-1 text-[10px] font-semibold transition-colors',
                          (wezel.efekt ?? 'brak') === e.klucz
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-border/60 bg-background/40 text-foreground/55 hover:text-foreground',
                        )}
                      >
                        {e.etykieta}
                      </button>
                    ))}
                  </div>
                </Pole>
                <Pole etykieta="Akcent">
                  <Kolor wartosc={wezel.akcent ?? '#38bdf8'} onZmiana={v => zmien({ akcent: v })} />
                </Pole>
                <Liczba etykieta="Promień" wartosc={wezel.promien ?? 16} onZmiana={v => zmien({ promien: Math.max(0, v) })} />
              </Sekcja>
            )}

            {(wezel.typ === 'tekst' || wezel.typ === 'przycisk') && (
              <Sekcja tytul="Tekst">
                <Pole etykieta="Treść">
                  <input value={wezel.tekst ?? ''} onChange={e => zmien({ tekst: e.target.value })} className={KLASA_INPUT} />
                </Pole>
                <div className="grid grid-cols-2 gap-2">
                  <Liczba etykieta="Rozmiar" wartosc={wezel.rozmiar ?? 16} onZmiana={v => zmien({ rozmiar: Math.max(6, v) })} />
                  <Liczba etykieta="Grubość" wartosc={wezel.waga ?? 600} krok={100} onZmiana={v => zmien({ waga: v })} />
                </div>
                <Pole etykieta="Kolor">
                  <Kolor wartosc={wezel.kolorTekstu ?? '#e8eef6'} onZmiana={v => zmien({ kolorTekstu: v })} />
                </Pole>
              </Sekcja>
            )}

            {wezel.typ === 'kafelek' && (
              <Sekcja tytul="Treść">
                {(
                  [
                    ['znaczek', 'Znaczek'],
                    ['tytul', 'Tytuł'],
                    ['podtytul', 'Podtytuł'],
                    ['cena', 'Cena'],
                    ['sufiks', 'Sufiks'],
                    ['cta', 'Przycisk'],
                  ] as const
                ).map(([klucz, etykieta]) => (
                  <Pole key={klucz} etykieta={etykieta}>
                    <input
                      value={wezel.tresc?.[klucz] ?? ''}
                      onChange={e => zmien({ tresc: { ...wezel.tresc, [klucz]: e.target.value } })}
                      className={KLASA_INPUT}
                    />
                  </Pole>
                ))}
                <Pole etykieta="Punkty (jeden na linię)">
                  <textarea
                    rows={3}
                    value={(wezel.tresc?.punkty ?? []).join('\n')}
                    onChange={e =>
                      zmien({
                        tresc: { ...wezel.tresc, punkty: e.target.value.split('\n').filter(s => s.trim() !== '') },
                      })
                    }
                    className={KLASA_INPUT + ' resize-none'}
                  />
                </Pole>
              </Sekcja>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Drobne kontrolki ───────────────────────────────────────────── */

const KLASA_INPUT =
  'w-full rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary/50'

function Sekcja({ tytul, children }: { tytul: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{tytul}</div>
      {children}
    </div>
  )
}

function Pole({ etykieta, children }: { etykieta: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-foreground/45">{etykieta}</span>
      {children}
    </label>
  )
}

function Liczba({
  etykieta,
  wartosc,
  onZmiana,
  krok = 1,
}: {
  etykieta: string
  wartosc: number
  onZmiana: (v: number) => void
  krok?: number
}) {
  return (
    <Pole etykieta={etykieta}>
      <input
        type="number"
        step={krok}
        value={Math.round(wartosc * 100) / 100}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (!Number.isNaN(v)) onZmiana(v)
        }}
        className={KLASA_INPUT}
      />
    </Pole>
  )
}

function Suwak({ etykieta, wartosc, onZmiana }: { etykieta: string; wartosc: number; onZmiana: (v: number) => void }) {
  return (
    <Pole etykieta={`${etykieta} — ${Math.round(wartosc * 100)}%`}>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={wartosc}
        onChange={e => onZmiana(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </Pole>
  )
}

function Kolor({ wartosc, onZmiana }: { wartosc: string; onZmiana: (v: string) => void }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(wartosc) ? wartosc : '#000000'
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={hex}
        onChange={e => onZmiana(e.target.value)}
        className="h-6 w-8 shrink-0 cursor-pointer rounded border border-border/60 bg-transparent"
      />
      <input value={wartosc} onChange={e => onZmiana(e.target.value)} className={KLASA_INPUT} />
    </div>
  )
}

function IkonaPrzycisk({
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
      className="opacity-0 transition-opacity hover:text-primary group-hover:opacity-60"
    >
      {children}
    </button>
  )
}

function MalyPrzycisk({
  children,
  onClick,
  ikona,
}: {
  children: React.ReactNode
  onClick: () => void
  ikona?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-md border border-border/60 bg-background/40 px-1.5 py-1 text-[10px] font-semibold text-foreground/65 transition-colors hover:border-primary/50 hover:text-foreground"
    >
      {ikona}
      {children}
    </button>
  )
}
