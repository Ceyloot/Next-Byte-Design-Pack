import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Bell, Brain, Calendar,
  Camera, Check, ChevronLeft, ChevronRight, Cloud, Image, MessageSquare, Moon,
  Plus, Search, Sparkles, SquareCheckBig, StickyNote, Sun, Video, X,
} from 'lucide-react';
import { supabase } from '@d2/integrations/supabase/client';
import { MODULY, Naglowek, PrzyciskGlowny, WykresObszar, barwa } from './system';
import type { KluczModulu } from './system';
import { NIECKA_SZKLANA, SZKLO, Slupki, Szyba, TloSzkla, Waffle } from './szklo';
import { PasekBoczny } from './PasekBoczny';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PULPIT NEXTBYTE — siatka wg zaznaczenia
 * ════════════════════════════════════════════════════════════════════════
 *
 * UKŁAD (narysowany przez Artura na zrzucie):
 *
 *   ┌──────────────────────────────┬───────────────┐
 *   │  Od czego zaczynamy (szeroko)│               │
 *   ├───────────────┬──────────────┤  Dziś         │
 *   │ Byte          │ Wróć do      │  (pełna       │
 *   │ i aktywność   │ roboty       │   wysokość)   │
 *   └───────────────┴──────────────┴───────────────┘
 *
 * RZĄD CZTERECH STATYSTYK USUNIĘTY. Powielał to, co i tak jest w kartach
 * niżej: saldo, aktywność, liczbę spraw i fakty Pamięci AI. Cztery liczby
 * bez kontekstu na górze, a pod nimi te same liczby z kontekstem — czyli
 * dwa razy to samo, raz gorzej.
 *
 * PRAWA KOLUMNA NIE MOŻE BYĆ PUSTA. Przy jednym zadaniu karta „Dziś"
 * świeciła pustką na całą wysokość ekranu. Teraz niesie trzy rzeczy
 * naraz — co czeka, co AI o mnie wie, ile miejsca zostało — bo to są
 * wszystko odpowiedzi na jedno pytanie: „w jakim stanie zastaję swoją
 * pracę".
 *
 * DANE: statyczne poza zadaniami, które idą przez bramkę tylko-do-odczytu.
 */

/* ═══════════════════════ DANE ══════════════════════════════════════════ */
const DANE = {
  imie: 'Artur',
  byte: { saldo: 57, naDzien: 5, doKiedy: '14 listopada', wydane: 443, doladowane: 500 },
  aktywnosc: { dni: 69, zPolRoku: 182, seria: 4, tygodnie: [12, 18, 9, 22, 16, 25, 14, 28, 19, 31] },
  zuzycie: [38, 42, 35, 48, 41, 52, 45, 58, 49, 61, 54, 57],
  rozbicie: [
    { modul: 'obraz' as KluczModulu, ile: 186 },
    { modul: 'czat' as KluczModulu, ile: 152 },
    { modul: 'wideo' as KluczModulu, ile: 105 },
  ],
  pamiec: {
    faktow: 8, siegniec: 1, najczestszy: 'Zawód',
    kategorie: [{ nazwa: 'Praca', ile: 5 }, { nazwa: 'Zainteresowania', ile: 3 }],
  },
  zadaniaTygodniowo: [3, 5, 2, 6, 4, 7, 5],
  zadaniaZapas: [{ id: 'z1', title: 'zadanie', due_date: null, priority: 'high' }],
  chmura: { zajete: 0.4, limit: 1.0 },
  ostatnie: [
    { id: 'r1', tytul: 'Opisy do katalogu jesiennego', modul: 'czat' as KluczModulu, kiedy: 'dziś 16:00' },
    { id: 'r2', tytul: 'Packshot — seria biała', modul: 'obraz' as KluczModulu, kiedy: 'dziś 11:00' },
    { id: 'r3', tytul: 'Rolka: montaż w 15 minut', modul: 'wideo' as KluczModulu, kiedy: 'wczoraj' },
    { id: 'r4', tytul: 'Ustalenia ze spotkania', modul: 'notatka' as KluczModulu, kiedy: '1 lis' },
  ],
};

const IKONA_MODULU: Record<KluczModulu, React.ComponentType<{ className?: string }>> = {
  czat: MessageSquare, obraz: Camera, wideo: Video, notatka: StickyNote, tablica: Image, kalendarz: Calendar,
};

/* ═══════════════════════ Granica ═══════════════════════════════════════ */
class Granica extends React.Component<{ children: React.ReactNode; nazwa: string }, { blad: boolean }> {
  state = { blad: false };
  static getDerivedStateFromError() { return { blad: true }; }
  componentDidCatch(e: Error) { console.error(`[Pulpit] ${this.props.nazwa}`, e.message); }
  render() {
    if (this.state.blad) return <Szyba className="text-[12px] text-destructive">„{this.props.nazwa}" padła.</Szyba>;
    return this.props.children;
  }
}

/* ═══════════════════════ Motyw ═════════════════════════════════════════ */
/**
 * Motyw trzymany LOKALNIE, na korzeniu kopii. Podgląd ma własny efekt
 * wpisujący atrybut motywu na element HTML przy każdym renderze, więc zapis
 * na dokumencie był natychmiast nadpisywany. Selektory motywów w index.css
 * są atrybutowe, więc ten sam atrybut na własnym kontenerze działa tylko
 * w jego obrębie.
 */
const KontekstMotywu = React.createContext<{ jasny: boolean; przelacz: () => void }>({ jasny: true, przelacz: () => {} });
const useMotyw = () => React.useContext(KontekstMotywu);

function useZamykanie(otwarte: boolean, zamknij: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!otwarte) return;
    const poza = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) zamknij(); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') zamknij(); };
    document.addEventListener('mousedown', poza); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', poza); document.removeEventListener('keydown', esc); };
  }, [otwarte, zamknij]);
  return ref;
}

/* ═══════════════════════ Pasek górny ═══════════════════════════════════ */
function PasekGorny() {
  const { jasny, przelacz } = useMotyw();
  const [dzwonek, setDzwonek] = useState(false);
  const [kalendarz, setKalendarz] = useState(false);
  const [nowe, setNowe] = useState(false);
  const refD = useZamykanie(dzwonek, () => setDzwonek(false));
  const refK = useZamykanie(kalendarz, () => setKalendarz(false));
  const refN = useZamykanie(nowe, () => setNowe(false));

  const etykietaDaty = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="flex shrink-0 items-center gap-2.5">
      <div className="flex h-10 max-w-[380px] flex-1 items-center gap-2.5 rounded-full px-4" style={SZKLO}>
        <Search className="h-4 w-4 shrink-0 text-[hsl(var(--foreground)/0.4)]" />
        <span className="text-[12.5px] text-[hsl(var(--foreground)/0.42)]">Szukaj w całej platformie…</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Okragly tytul={jasny ? 'Motyw ciemny' : 'Motyw jasny'} onClick={przelacz}>
          {jasny ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Okragly>

        <div className="relative" ref={refD}>
          <Okragly tytul="Powiadomienia" onClick={() => setDzwonek((v) => !v)} kropka>
            <Bell className="h-4 w-4" />
          </Okragly>
          {dzwonek && (
            <Nakladka>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold text-foreground">Powiadomienia</p>
                <button type="button" onClick={() => setDzwonek(false)} aria-label="Zamknij"
                  className="text-[hsl(var(--foreground)/0.4)] hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="rounded-[16px] p-3"
                style={{
                  background: 'linear-gradient(150deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.06))',
                  border: '1px solid hsl(var(--primary) / 0.24)',
                }}>
                <p className="text-[12.5px] font-bold text-foreground">Dzienne Byte</p>
                <p className="mt-1 text-[11.5px] leading-snug text-[hsl(var(--foreground)/0.62)]">
                  5 ⟠ codziennie w planach od Premium.
                </p>
                <button type="button" className="mt-2 h-8 w-full rounded-full text-[12px] font-semibold"
                  style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>
                  Zobacz plany
                </button>
              </div>
              <ul className="mt-2 flex flex-col">
                {[
                  ['Packshot — seria biała gotowy', 'dziś 11:00'],
                  ['Zadanie bez terminu czeka od 3 dni', 'dziś 09:12'],
                  ['Rolka: montaż w 15 minut przetworzona', 'wczoraj'],
                ].map(([t, k]) => (
                  <li key={t} className="flex items-start gap-2.5 rounded-[12px] p-2.5 hover:bg-[hsl(var(--foreground)/0.05)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                    <span className="min-w-0">
                      <span className="block text-[12.5px] leading-snug text-foreground">{t}</span>
                      <span className="text-[11px] text-[hsl(var(--foreground)/0.45)]">{k}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Nakladka>
          )}
        </div>

        <div className="relative hidden lg:block" ref={refK}>
          <button type="button" onClick={() => setKalendarz((v) => !v)}
            className="flex h-10 items-center gap-2 rounded-full px-4 text-[12.5px] text-[hsl(var(--foreground)/0.65)] transition-colors hover:text-foreground"
            style={SZKLO}>
            <Calendar className="h-4 w-4 text-[hsl(var(--foreground)/0.45)]" />
            {etykietaDaty}
          </button>
          {kalendarz && <Nakladka><MiniKalendarz /></Nakladka>}
        </div>

        <div className="relative" ref={refN}>
          <PrzyciskGlowny ikona={Plus} onClick={() => setNowe((v) => !v)}>Utwórz</PrzyciskGlowny>
          {nowe && (
            <Nakladka waska>
              {([
                ['czat', 'Rozmowa w Chat AI', MessageSquare],
                ['obraz', 'Nowe zdjęcie', Camera],
                ['wideo', 'Nowe wideo', Video],
                ['notatka', 'Notatka', StickyNote],
                ['kalendarz', 'Wydarzenie', Calendar],
              ] as [KluczModulu, string, React.ComponentType<{ className?: string }>][]).map(([m, t, Ik]) => (
                <button key={t} type="button"
                  className="flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-[12.5px] text-foreground hover:bg-[hsl(var(--foreground)/0.05)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[9px]"
                    style={{ background: barwa(m, 0.15), color: barwa(m, 1) }}>
                    <Ik className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </button>
              ))}
            </Nakladka>
          )}
        </div>
      </div>
    </header>
  );
}

function Okragly({
  children, tytul, onClick, kropka,
}: { children: React.ReactNode; tytul: string; onClick?: () => void; kropka?: boolean }) {
  return (
    <button type="button" title={tytul} aria-label={tytul} onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.6)] transition-colors hover:text-foreground"
      style={SZKLO}>
      {children}
      {kropka && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
        style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 0 2px hsl(var(--card))' }} />}
    </button>
  );
}

function Nakladka({ children, waska }: { children: React.ReactNode; waska?: boolean }) {
  return (
    <div className={cn('absolute right-0 top-12 z-50 rounded-[20px] p-2.5', waska ? 'w-[236px]' : 'w-[318px]')}
      style={{ ...SZKLO, background: 'color-mix(in srgb, hsl(var(--card)) 88%, transparent)' }}>
      {children}
    </div>
  );
}

function MiniKalendarz() {
  const dzis = new Date();
  const [miesiac, setMiesiac] = useState(new Date(dzis.getFullYear(), dzis.getMonth(), 1));
  const dni = useMemo(() => {
    const pierwszy = new Date(miesiac.getFullYear(), miesiac.getMonth(), 1);
    const ile = new Date(miesiac.getFullYear(), miesiac.getMonth() + 1, 0).getDate();
    const przesuniecie = (pierwszy.getDay() + 6) % 7;
    return [...Array(przesuniecie).fill(null), ...Array.from({ length: ile }, (_, i) => i + 1)];
  }, [miesiac]);
  const przesun = (o: number) => setMiesiac(new Date(miesiac.getFullYear(), miesiac.getMonth() + o, 1));
  const tenMiesiac = miesiac.getMonth() === dzis.getMonth() && miesiac.getFullYear() === dzis.getFullYear();

  return (
    <div className="p-1">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => przesun(-1)} aria-label="Poprzedni miesiąc"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.5)] hover:text-foreground"
          style={{ background: 'hsl(var(--foreground) / 0.06)' }}><ChevronLeft className="h-3.5 w-3.5" /></button>
        <span className="text-[13px] font-bold capitalize text-foreground">
          {miesiac.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => przesun(1)} aria-label="Następny miesiąc"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.5)] hover:text-foreground"
          style={{ background: 'hsl(var(--foreground) / 0.06)' }}><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
          <span key={d} className="text-[10px] font-semibold text-[hsl(var(--foreground)/0.38)]">{d}</span>
        ))}
        {dni.map((d, i) => {
          if (d === null) return <span key={`p${i}`} />;
          const biezacy = tenMiesiac && d === dzis.getDate();
          return (
            <button key={d} type="button"
              className={cn('flex h-8 items-center justify-center rounded-[10px] text-[12px] tabular-nums transition-colors',
                biezacy ? 'font-bold text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--foreground)/0.07)]')}
              style={biezacy ? {
                background: 'linear-gradient(150deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 72%, hsl(var(--foreground))))',
                boxShadow: '0 5px 12px -5px hsl(var(--primary) / 0.65)',
              } : undefined}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════ Od czego zaczynamy ════════════════════════════ */
const AKCJE: { tytul: string; opis: string; modul: KluczModulu; ikona: React.ComponentType<{ className?: string }> }[] = [
  { tytul: 'Wygeneruj zdjęcie', opis: 'Packshot, tło, wizualizacja', modul: 'obraz', ikona: Camera },
  { tytul: 'Napisz tekst', opis: 'Opis, mail, scenariusz', modul: 'czat', ikona: MessageSquare },
  { tytul: 'Nagraj wideo', opis: 'Rolka, spot, prezentacja', modul: 'wideo', ikona: Video },
  { tytul: 'Wróć do notatek', opis: '1 notatka czeka', modul: 'notatka', ikona: StickyNote },
];

function OdCzegoZaczynamy() {
  const [tresc, setTresc] = useState('');
  return (
    <Szyba className="flex min-h-0 flex-col">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[hsl(var(--primary-foreground))]"
          style={{
            background: 'linear-gradient(140deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 70%, hsl(var(--foreground))))',
            boxShadow: '0 6px 14px -6px hsl(var(--primary) / 0.65)',
          }}>
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-bold tracking-[-0.01em] text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Cześć, {DANE.imie}. Od czego zaczynamy?
          </p>
          <p className="text-[11.5px] text-[hsl(var(--foreground)/0.5)]">Napisz zdanie albo wybierz jedną z czynności.</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input value={tresc} onChange={(e) => setTresc(e.target.value)}
          placeholder="Np. opisz produkt do katalogu jesiennego…" aria-label="Co chcesz zrobić"
          className="h-11 min-w-0 flex-1 rounded-full px-4 text-[13.5px] text-foreground outline-none placeholder:text-[hsl(var(--foreground)/0.33)]"
          style={NIECKA_SZKLANA} />
        <button type="button" disabled={!tresc.trim()} aria-label="Zaczynamy"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[hsl(var(--primary-foreground))] transition-all active:scale-95 disabled:opacity-30"
          style={{
            background: 'linear-gradient(140deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 72%, hsl(var(--foreground))))',
            boxShadow: '0 8px 18px -8px hsl(var(--primary) / 0.7)',
          }}>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2.5 xl:grid-cols-4">
        {AKCJE.map(({ tytul, opis, modul, ikona: Ik }) => (
          <button key={tytul} type="button"
            className="group flex flex-col justify-between rounded-[18px] p-3 text-left transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(150deg, ${barwa(modul, 0.2)}, ${barwa(modul, 0.06)})`,
              border: `1px solid ${barwa(modul, 0.26)}`,
              boxShadow: 'inset 0 1px 0 0 hsl(0 0% 100% / 0.25), 0 4px 12px -6px hsl(var(--foreground) / 0.2)',
            }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px]"
              style={{ background: barwa(modul, 0.22), color: barwa(modul, 1) }}>
              <Ik className="h-4 w-4" />
            </span>
            <span className="mt-3 block">
              <span className="block text-[13px] font-bold text-foreground">{tytul}</span>
              <span className="mt-0.5 block truncate text-[11px] text-[hsl(var(--foreground)/0.5)]">{opis}</span>
            </span>
          </button>
        ))}
      </div>
    </Szyba>
  );
}

/* ═══════════════════════ Byte i aktywność (wąska) ══════════════════════ */
/**
 * Scalone saldo, tempo i rozbicie wydatków — w wąskiej kolumnie układają
 * się pionowo, więc wafle są krótsze, a wykres niższy. Ta sama treść,
 * inna geometria.
 */
function ByteIAktywnosc() {
  const { byte, aktywnosc, zuzycie, rozbicie } = DANE;

  return (
    <Szyba className="flex min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[12px] text-[hsl(var(--foreground)/0.55)]">Twoje Byte</span>
          <p className="mt-0.5 flex items-baseline gap-1 text-[38px] font-extrabold leading-none tracking-[-0.035em] text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}>
            {byte.saldo}<span className="text-[19px] font-normal text-[hsl(var(--primary))]">⟠</span>
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-[hsl(var(--foreground)/0.6)]">
            Starczy do <strong className="font-semibold text-foreground">{byte.doKiedy}</strong> przy {byte.naDzien} ⟠ dziennie.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[11px] text-[hsl(var(--foreground)/0.5)]">Aktywność</span>
          <p className="flex items-baseline justify-end gap-1 text-[22px] font-bold leading-none tracking-[-0.03em] text-foreground">
            {aktywnosc.dni}<span className="text-[11px] font-medium text-[hsl(var(--foreground)/0.45)]">dni</span>
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-[hsl(var(--foreground)/0.5)]">
            <Activity className="h-3 w-3 text-[hsl(var(--primary))]" />{aktywnosc.seria} dzień z rzędu
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <div>
          <span className="flex items-baseline justify-between text-[10.5px] text-[hsl(var(--foreground)/0.5)]">
            <span>Wydane {byte.wydane} ⟠</span><span>z {byte.doladowane} ⟠</span>
          </span>
          <span className="mt-1 block"><Waffle udzial={byte.wydane / byte.doladowane} kolumny={22} wiersze={2} rozmiar={7} /></span>
        </div>
        <div>
          <span className="flex items-baseline justify-between text-[10.5px] text-[hsl(var(--foreground)/0.5)]">
            <span>Dni aktywne {aktywnosc.dni}</span><span>z {aktywnosc.zPolRoku}</span>
          </span>
          <span className="mt-1 block">
            <Waffle udzial={aktywnosc.dni / aktywnosc.zPolRoku} kolumny={22} wiersze={2} rozmiar={7} barwa="hsl(168 62% 46%)" />
          </span>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 rounded-[16px] p-2.5" style={NIECKA_SZKLANA}>
        <span className="text-[11.5px] font-semibold text-foreground">Na co idą Byte</span>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {rozbicie.map((r) => (
            <span key={r.modul} className="flex items-center gap-1.5 text-[10.5px] text-[hsl(var(--foreground)/0.6)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: barwa(r.modul, 1) }} />
              {MODULY[r.modul].nazwa} · {r.ile} ⟠
            </span>
          ))}
        </div>
        <WykresObszar id="zuzycie" dane={zuzycie} dymek={`${byte.naDzien} ⟠ / dzień`} wysokosc={84} />
      </div>
    </Szyba>
  );
}

/* ═══════════════════════ Wróć do roboty ════════════════════════════════ */
function WrocDoRoboty() {
  const [filtr, setFiltr] = useState<KluczModulu | null>(null);
  const widoczne = filtr ? DANE.ostatnie.filter((r) => r.modul === filtr) : DANE.ostatnie;
  const moduly = Array.from(new Set(DANE.ostatnie.map((r) => r.modul)));

  return (
    <Szyba className="flex min-h-0 flex-col">
      <Naglowek akcja={
        <span className="flex flex-wrap justify-end gap-1">
          <Chip aktywny={filtr === null} onClick={() => setFiltr(null)}>Wszystko</Chip>
          {moduly.map((m) => (
            <Chip key={m} aktywny={filtr === m} onClick={() => setFiltr(m)} barwaChipa={barwa(m, 0.2)}>
              {MODULY[m].nazwa}
            </Chip>
          ))}
        </span>
      }>
        Wróć do roboty
      </Naglowek>

      {/* Pionowe kafelki z polem podglądu — docelowo wejdzie tam miniatura
          ze Studia; dziś trzyma kształt znak modułu. */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 xl:grid-cols-4">
        {widoczne.map((r) => {
          const Ik = IKONA_MODULU[r.modul];
          return (
            <button key={r.id} type="button"
              className="group flex min-h-0 flex-col rounded-[18px] p-2.5 text-left transition-all hover:-translate-y-0.5"
              style={NIECKA_SZKLANA}>
              <span className="flex min-h-0 flex-1 items-center justify-center rounded-[13px]"
                style={{ background: `linear-gradient(155deg, ${barwa(r.modul, 0.24)}, ${barwa(r.modul, 0.07)})` }}>
                <Ik className="h-6 w-6" style={{ color: barwa(r.modul, 0.8) }} />
              </span>
              <span className="mt-2 block line-clamp-2 text-[12px] font-semibold leading-snug text-foreground">{r.tytul}</span>
              <span className="mt-1 flex items-center gap-1.5">
                <span className="rounded-full px-1.5 py-0.5 text-[9.5px] font-medium"
                  style={{ background: barwa(r.modul, 0.18), color: barwa(r.modul, 1) }}>
                  {MODULY[r.modul].nazwa}
                </span>
                <span className="text-[9.5px] text-[hsl(var(--foreground)/0.45)]">{r.kiedy}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Szyba>
  );
}

function Chip({
  children, aktywny, onClick, barwaChipa,
}: { children: React.ReactNode; aktywny?: boolean; onClick?: () => void; barwaChipa?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={aktywny}
      className={cn('flex h-[26px] items-center rounded-full px-2.5 text-[11px] transition-colors',
        aktywny ? 'font-semibold text-foreground' : 'text-[hsl(var(--foreground)/0.55)] hover:text-foreground')}
      style={{ background: aktywny ? (barwaChipa ?? 'hsl(var(--foreground) / 0.13)') : 'hsl(var(--foreground) / 0.05)' }}>
      {children}
    </button>
  );
}

/* ═══════════════════════ Dziś (prawa kolumna) ══════════════════════════ */
type Zadanie = { id: string; title: string; due_date: string | null; priority?: string | null; status?: string | null };

/**
 * Trzy rzeczy w jednej kolumnie, bo wszystkie odpowiadają na jedno pytanie:
 * w jakim stanie zastaję swoją pracę. Co czeka, co AI o mnie wie, ile
 * miejsca zostało. Rozbite na osobne karty zostawiały pustkę przy jednym
 * zadaniu; razem wypełniają wysokość treścią, a nie powietrzem.
 *
 * Zadania idą przez bramkę tylko-do-odczytu. Bez sesji RLS nie odda nic —
 * wtedy wchodzi zestaw pokazowy i karta mówi o tym wprost.
 */
function Dzis() {
  const { data, isLoading } = useQuery({
    queryKey: ['zadania-pulpit'],
    retry: false,
    queryFn: async (): Promise<{ lista: Zadanie[]; zBazy: boolean }> => {
      try {
        const { data: wiersze } = await supabase
          .from('user_tasks').select('id, title, due_date, priority, status').limit(20);
        const lista = ((wiersze ?? []) as Zadanie[]).filter((z) => z.status !== 'done');
        if (lista.length > 0) return { lista, zBazy: true };
      } catch { /* brak sesji — schodzimy na zestaw pokazowy */ }
      return { lista: DANE.zadaniaZapas as Zadanie[], zBazy: false };
    },
  });

  const lista = data?.lista ?? [];
  const poTerminie = lista.filter((z) => z.due_date && Date.parse(z.due_date) < Date.now()).length;
  const { pamiec, chmura, zadaniaTygodniowo } = DANE;
  const sumaKat = pamiec.kategorie.reduce((s, k) => s + k.ile, 0) || 1;

  return (
    <Szyba className="flex min-h-0 flex-col">
      <Naglowek akcja={
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.45)]"
          style={{ background: 'hsl(var(--foreground) / 0.06)' }}>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      }>
        Dziś
      </Naglowek>

      {/* ── Czeka na Ciebie ── */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="flex items-baseline gap-1.5 text-[34px] font-extrabold leading-none tracking-[-0.035em] text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}>
            {isLoading ? '—' : lista.length}
            <span className="text-[12.5px] font-medium text-[hsl(var(--foreground)/0.45)]">{odmien(lista.length)}</span>
          </p>
          <p className="mt-1.5 text-[11.5px] text-[hsl(var(--foreground)/0.55)]">
            {poTerminie > 0
              ? <>W tym <strong className="font-semibold text-destructive">{poTerminie}</strong> po terminie.</>
              : <>Nic nie jest spóźnione. Spokojnie.</>}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-[hsl(var(--foreground)/0.45)]">Domknięte w tygodniach</span>
          <span className="w-[120px]"><Slupki dane={zadaniaTygodniowo} wysokosc={36} barwa="hsl(168 62% 46%)" /></span>
        </div>
      </div>

      <ul className="mt-2.5 flex max-h-[170px] shrink-0 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {lista.length === 0 && !isLoading && (
          <li className="flex flex-col items-center gap-2 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.4)]"
              style={{ background: 'hsl(var(--foreground) / 0.07)' }}><Check className="h-4 w-4" /></span>
            <span className="text-[12px] text-[hsl(var(--foreground)/0.5)]">Nic nie czeka. Masz wolne.</span>
          </li>
        )}
        {lista.map((z) => {
          const sp = !!z.due_date && Date.parse(z.due_date) < Date.now();
          return (
            <li key={z.id} className="flex shrink-0 items-center gap-2.5 rounded-[14px] p-2.5" style={NIECKA_SZKLANA}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                style={{
                  background: sp ? 'hsl(var(--destructive) / 0.15)' : 'hsl(var(--primary) / 0.14)',
                  color: sp ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                }}>
                {sp ? <AlertTriangle className="h-3.5 w-3.5" /> : <SquareCheckBig className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-foreground">{z.title}</span>
                <span className="text-[10.5px] text-[hsl(var(--foreground)/0.45)]">{termin(z.due_date)}</span>
              </span>
              {z.priority === 'high' && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>pilne</span>
              )}
            </li>
          );
        })}
      </ul>

      {data && !data.zBazy && (
        <p className="mt-1.5 shrink-0 text-[10px] leading-snug text-[hsl(var(--foreground)/0.4)]">
          Zadania pokazowe — baza nie oddała nic bez zalogowanej sesji.
        </p>
      )}

      {/* ── Pamięć AI ── */}
      <div className="mt-3 shrink-0 border-t pt-3" style={{ borderColor: 'hsl(var(--foreground) / 0.08)' }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-[11px] text-[hsl(var(--foreground)/0.5)]">Pamięć AI</span>
            <p className="flex items-baseline gap-1.5 text-[24px] font-bold leading-none tracking-[-0.03em] text-foreground">
              {pamiec.faktow}<span className="text-[11px] font-medium text-[hsl(var(--foreground)/0.45)]">faktów o Tobie</span>
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[hsl(var(--primary))]"
            style={{ background: 'hsl(var(--primary) / 0.13)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
            <Brain className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {pamiec.kategorie.map((k, i) => (
            <div key={k.nazwa}>
              <span className="flex items-baseline justify-between text-[10.5px] text-[hsl(var(--foreground)/0.5)]">
                <span>{k.nazwa}</span><span className="font-semibold text-foreground">{k.ile}</span>
              </span>
              <span className="mt-1 block">
                <Waffle udzial={k.ile / sumaKat} kolumny={10} wiersze={2} rozmiar={6}
                  barwa={i === 0 ? 'hsl(var(--primary))' : 'hsl(272 72% 56%)'} />
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-start gap-2.5 rounded-[14px] p-2.5" style={NIECKA_SZKLANA}>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] text-[hsl(var(--primary))]"
            style={{ background: 'hsl(var(--primary) / 0.15)' }}><Sparkles className="h-3.5 w-3.5" /></span>
          <span className="min-w-0">
            <span className="block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary))]">Pomysł na dziś</span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-[hsl(var(--foreground)/0.68)]">
              Najczęściej sięga po „{pamiec.najczestszy}". Dopisz, czym się teraz zajmujesz.
            </span>
          </span>
        </div>
      </div>

      {/* ── Chmura ── */}
      <div className="mt-auto shrink-0 border-t pt-2.5" style={{ borderColor: 'hsl(var(--foreground) / 0.08)' }}>
        <span className="flex items-baseline justify-between text-[11px] text-[hsl(var(--foreground)/0.5)]">
          <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" /> PrivateCloud</span>
          <span className="tabular-nums">{chmura.zajete} GB z {chmura.limit} GB</span>
        </span>
        <span className="mt-1.5 block"><Waffle udzial={chmura.zajete / chmura.limit} kolumny={24} wiersze={2} rozmiar={6} /></span>
      </div>
    </Szyba>
  );
}

function termin(due: string | null): string {
  if (!due) return 'bez terminu';
  const dzis = new Date(); dzis.setHours(0, 0, 0, 0);
  const cel = new Date(due); cel.setHours(0, 0, 0, 0);
  const r = Math.round((cel.getTime() - dzis.getTime()) / 86_400_000);
  if (r < 0) return `${Math.abs(r)} dni po terminie`;
  if (r === 0) return 'dzisiaj';
  if (r === 1) return 'jutro';
  if (r < 7) return `za ${r} dni`;
  return new Date(due).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

function odmien(i: number): string {
  if (i === 1) return 'sprawa';
  const d = i % 100, j = i % 10;
  if (d >= 12 && d <= 14) return 'spraw';
  return j >= 2 && j <= 4 ? 'sprawy' : 'spraw';
}

/* ═══════════════════════ Złożenie ══════════════════════════════════════ */
export function PanelGlowny5() {
  const [jasny, setJasny] = useState(true);
  const motyw = useMemo(() => ({ jasny, przelacz: () => setJasny((v) => !v) }), [jasny]);

  return (
    <KontekstMotywu.Provider value={motyw}>
      <div
        data-theme={jasny ? 'future-theme' : 'dark-theme'}
        className="relative flex h-full min-h-0 w-full overflow-hidden"
        style={{ background: 'hsl(var(--background))' }}
      >
        <TloSzkla />
        <PasekBoczny />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-3 md:px-5">
            <PasekGorny />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1.95fr_1fr]">
              {/* Lewa: start u góry, pod spodem Byte (wąsko) i Wróć do roboty. */}
              <div className="grid min-h-0 grid-rows-[auto_1fr] gap-3">
                <Granica nazwa="od czego zaczynamy"><OdCzegoZaczynamy /></Granica>
                <div className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-[0.85fr_1.15fr]">
                  <Granica nazwa="Byte i aktywność"><ByteIAktywnosc /></Granica>
                  <Granica nazwa="wróć do roboty"><WrocDoRoboty /></Granica>
                </div>
              </div>

              {/* Prawa: jedna kolumna na pełną wysokość. */}
              <Granica nazwa="dziś"><Dzis /></Granica>
            </div>
          </div>
        </main>
      </div>
    </KontekstMotywu.Provider>
  );
}

export default PanelGlowny5;
