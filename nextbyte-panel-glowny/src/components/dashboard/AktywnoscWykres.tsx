import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { Szkielet } from '@/components/ui/stany';
import { useAktywnoscDzienna, type DzienAktywnosci } from '@/hooks/useAktywnoscDzienna';

/**
 * WYKRES AKTYWNOŚCI — siatka dni w stylu GitHuba/Claude.
 *
 * Zastąpił „Aktywność Live" (dublowała „Wróć do roboty"): mówi o RYTMIE pracy
 * w czasie, nie jest kolejną listą zdarzeń.
 *
 * DWA WARIANTY OSADZENIA:
 *  • 'karta'  — własny `Tile` + `TileHeader`, do kolumny dashboardu.
 *  • 'pasek'  — BEZ własnego `Tile`, bo ląduje w środku `ByteStatusBar`, który
 *               sam jest szybą. Szyba w szybie = `backdrop-filter: none`
 *               (strażnik zagnieżdżenia), więc wariant paskowy oddaje materiał
 *               rodzicowi i niesie tylko mini-nagłówek + siatkę.
 *
 * DWA WYBORY MATERIAŁU (inaczej wygląd rozjeżdża się między motywami):
 *  1. Kolory komórek idą przez `style={{ backgroundColor:'hsl(var(--primary)/x)' }}`,
 *     nie przez klasy Tailwinda (`bg-primary/28` byłoby martwe — krycie generuje
 *     się tylko w wielokrotnościach 5). Inline czyta zmienną, więc podąża za
 *     `--primary` z motywu.
 *  2. Rozmiar komórki liczy się z realnej szerokości (ResizeObserver) — całe
 *     6 miesięcy ZAWSZE mieści się bez poziomego scrolla, i w wąskiej kolumnie,
 *     i na szerokość górnego paska.
 */

const DNI_TYGODNIA = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const MIESIACE = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

function kolorPoziomu(poziom: DzienAktywnosci['poziom']): string {
  // Poziom 0 (dzień bez aktywności) dostaje ledwie muśnięcie primary zamiast
  // szarości muted — u nowego użytkownika, gdzie WSZYSTKO jest zerem, siatka ma
  // być widoczna jako delikatny niebieski raster, a nie czarna pustka
  // (Michał: „coś tam jest, ale turbo mało widoczne"). Bez obwódki — Michał:
  // „bez obwódki lepiej", więc widoczność niesie samo wypełnienie.
  if (poziom === 0) return 'hsl(var(--primary) / 0.08)';
  const krycie = [0, 0.3, 0.5, 0.72, 1][poziom];
  return `hsl(var(--primary) / ${krycie})`;
}

/** Poniedziałek = 0 … niedziela = 6 (getDay() daje niedzielę = 0). */
const wierszDnia = (d: Date) => (d.getDay() + 6) % 7;

function odmianaZdarzen(n: number): string {
  if (n === 1) return '1 zdarzenie';
  const ost = n % 10;
  const setki = n % 100;
  if (ost >= 2 && ost <= 4 && !(setki >= 12 && setki <= 14)) return `${n} zdarzenia`;
  return `${n} zdarzeń`;
}

const formaterData = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' });

interface Props {
  wariant?: 'karta' | 'pasek';
}

export function AktywnoscWykres({ wariant = 'karta' }: Props) {
  const { dni, aktywneDni, aktualnaSeria, ladowanie, blad } = useAktywnoscDzienna(182);

  const { tygodnie, etykietyMiesiecy } = useMemo(() => {
    const kol: (DzienAktywnosci | null)[][] = [];
    let biezacy: (DzienAktywnosci | null)[] = [];

    dni.forEach((d, i) => {
      const w = wierszDnia(d.data);
      if (i === 0 && w > 0) biezacy = new Array(w).fill(null);
      biezacy.push(d);
      if (w === 6) { kol.push(biezacy); biezacy = []; }
    });
    if (biezacy.length) { while (biezacy.length < 7) biezacy.push(null); kol.push(biezacy); }

    const etyk: { kolumna: number; tekst: string }[] = [];
    let ostatniMiesiac = -1;
    kol.forEach((tydzien, idx) => {
      const pierwszy = tydzien.find((x): x is DzienAktywnosci => x !== null);
      if (!pierwszy) return;
      const m = pierwszy.data.getMonth();
      if (m !== ostatniMiesiac) { etyk.push({ kolumna: idx, tekst: MIESIACE[m] }); ostatniMiesiac = m; }
    });

    return { tygodnie: kol, etykietyMiesiecy: etyk };
  }, [dni]);

  /** AUTO-FIT: cell = (dostępne − odstępy) / liczba_tygodni, mierzone z DOM. */
  const kontenerRef = useRef<HTMLDivElement>(null);
  const [komorka, setKomorka] = useState(11);
  /* 08.09.2026, zrzut Michała: przy 26 tygodniach i komórce min. 7 px siatka miała
     ~300 px, a kontener w pasku 199 px — mapa wystawała pod saldo „1774 ⟠".
     Gdy nie mieści się nawet z komórką 7 px, obcinamy NAJSTARSZE tygodnie
     (ostatnie zawsze widoczne), zamiast wychodzić poza kontener. */
  const [widoczneTygodni, setWidoczneTygodni] = useState<number>(Infinity);
  const ODSTEP = 3;
  const SZER_ETYKIET = 22;
  const MIN_KOMORKA = 7;

  useEffect(() => {
    const el = kontenerRef.current;
    if (!el || tygodnie.length === 0) return;
    const policz = () => {
      const dostepne = el.clientWidth - SZER_ETYKIET;
      const miesciSie = Math.max(1, Math.floor((dostepne + ODSTEP) / (MIN_KOMORKA + ODSTEP)));
      const n = Math.min(tygodnie.length, miesciSie);
      const cell = Math.floor((dostepne - (n - 1) * ODSTEP) / n);
      setWidoczneTygodni(n);
      setKomorka(Math.max(MIN_KOMORKA, Math.min(18, cell)));
    };
    policz();
    const ro = new ResizeObserver(policz);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tygodnie.length]);

  const krok = komorka + ODSTEP;
  const [tygodnieWidoczne, etykietyWidoczne] = useMemo(() => {
    const pomin = Number.isFinite(widoczneTygodni) ? Math.max(0, tygodnie.length - widoczneTygodni) : 0;
    if (pomin === 0) return [tygodnie, etykietyMiesiecy] as const;
    const wyc = tygodnie.slice(pomin);
    const etyk = etykietyMiesiecy.filter((e) => e.kolumna >= pomin).map((e) => ({ ...e, kolumna: e.kolumna - pomin }));
    return [wyc, etyk] as const;
  }, [tygodnie, etykietyMiesiecy, widoczneTygodni]);
  const wPasku = wariant === 'pasek';

  const plakietka = (
    <Plakietka intencja={aktualnaSeria > 0 ? 'akcent' : 'neutralna'} kropka zywa={aktualnaSeria > 0}>
      {aktualnaSeria > 0 ? `Seria ${aktualnaSeria} dni` : 'Ostatnie 6 mies.'}
    </Plakietka>
  );

  /** Siatka + (w karcie) stopka z legendą. Wspólna dla obu wariantów. */
  const cialo = (
    <div ref={kontenerRef} className="flex min-h-0 flex-1 flex-col justify-center gap-2 pt-1">
      {/* pasek miesięcy — pozycje liczone krokiem komórki, trzymają się kolumn */}
      <div className="text-[10px] leading-none text-muted-foreground" style={{ paddingLeft: SZER_ETYKIET }}>
        <div className="relative h-3" style={{ width: tygodnieWidoczne.length * krok }}>
          {etykietyWidoczne.map((e) => (
            <span key={`${e.tekst}-${e.kolumna}`} className="absolute top-0" style={{ left: e.kolumna * krok }}>
              {e.tekst}
            </span>
          ))}
        </div>
      </div>

      <div className="flex" style={{ gap: ODSTEP }}>
        <div className="flex shrink-0 flex-col text-[9px] leading-none text-muted-foreground" style={{ width: SZER_ETYKIET, gap: ODSTEP }}>
          {DNI_TYGODNIA.map((d, i) => (
            <span key={d} className="flex items-center justify-end pr-1" style={{ height: komorka }}>
              {i % 2 === 1 ? d : ''}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap: ODSTEP }}>
          {tygodnieWidoczne.map((tydzien, ti) => (
            <div key={ti} className="flex flex-col" style={{ gap: ODSTEP }}>
              {tydzien.map((dzien, di) =>
                dzien === null ? (
                  <div key={di} style={{ width: komorka, height: komorka }} />
                ) : (
                  <div
                    key={di}
                    className="rounded-[3px] transition-transform hover:scale-125 motion-safe:animate-[nb-akt-pop_0.35s_ease-out_backwards]"
                    style={{
                      width: komorka,
                      height: komorka,
                      backgroundColor: kolorPoziomu(dzien.poziom),
                      animationDelay: `${Math.min(ti * 12, 600)}ms`,
                    }}
                    title={`${formaterData.format(dzien.data)} — ${odmianaZdarzen(dzien.liczba)}`}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* stopka: podsumowanie + legenda. W pasku pomijamy — miejsce na wysokość. */}
      {!wPasku && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground" style={{ paddingLeft: SZER_ETYKIET }}>
          <span className="tabular-nums">
            <span className="font-semibold text-foreground">{aktywneDni}</span> dni aktywnych w pół roku
          </span>
          <span className="flex items-center gap-1">
            Mniej
            {[0, 1, 2, 3, 4].map((p) => (
              <span
                key={p}
                className="rounded-[3px]"
                style={{ width: Math.min(komorka, 12), height: Math.min(komorka, 12), backgroundColor: kolorPoziomu(p as DzienAktywnosci['poziom']) }}
              />
            ))}
            Więcej
          </span>
        </div>
      )}

      <style>{`@keyframes nb-akt-pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  // ── WARIANT 'PASEK' — bez Tile, mini-nagłówek w jednym rzędzie ──────────────
  if (wPasku) {
    return (
      <div className="flex h-full min-w-0 flex-col">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-card-foreground">
            <Activity className="h-4 w-4 text-primary" aria-hidden />
            Aktywność
          </span>
          {!ladowanie && !blad && plakietka}
        </div>
        {ladowanie ? <Szkielet wierszy={4} className="w-full" /> : blad ? null : cialo}
      </div>
    );
  }

  // ── WARIANT 'KARTA' — pełny Tile z nagłówkiem ───────────────────────────────
  const naglowek = <TileHeader ikona={Activity} tytul="Aktywność" poPrawej={plakietka} />;

  if (ladowanie) {
    return (
      <Tile intencja="akcent" className="flex h-full flex-col">
        {naglowek}
        <div className="flex flex-1 items-center px-1 py-4"><Szkielet wierszy={5} className="w-full" /></div>
      </Tile>
    );
  }
  if (blad) {
    return (
      <Tile intencja="akcent" className="flex h-full flex-col">
        {naglowek}
        <p className="px-1 py-6 text-sm text-muted-foreground">Nie udało się wczytać aktywności. Odśwież stronę za chwilę.</p>
      </Tile>
    );
  }
  return (
    <Tile intencja="akcent" className="flex h-full flex-col">
      {naglowek}
      {cialo}
    </Tile>
  );
}
