import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tile, TileHeader, klasyKafelka } from '@/components/ui/tile';
import { ChipyWyboru } from '@/components/ui/chipy-wyboru';
import { PrzewijanyRzad } from '@/components/ui/przewijany-rzad';
import { KLASA_ETYKIETY_POLA } from '@/components/ui/pola';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  USTAWIENIA — sekcja, wiersz i nawigacja jednego wzoru
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (20.10.2026, panel ustawień konta): „rozrzucone, nieintuicyjne i wyglądowo tragedia”. Każda zakładka
 * sklejała własną kartę (pięć przepisów na szkło, wypełnienia od `p-1` do `p-4`), formularz z etykietą NAD polem
 * na każdą drobnostkę i własny przycisk „Zapisz”. Wzór z galerii (Muzli „Settings pages”, Cosmos, Untitled UI,
 * Linear): USTAWIENIE TO JEDEN WIERSZ — po lewej co to jest (tytuł + najwyżej jedno zdanie), po prawej stan albo
 * kontrolka.
 *
 * DRUGA RUNDA (26.10.2026, Michał: „cały panel ustawień przebuduj… aby tak jak w kalendarzu… wszystko było
 * kafelkowe i się nie zlewało”). Wiersze oddzielone samą włosową kreską zlewały się na ciemnym motywie w jedną
 * płytę, a formularze (pola, przełącznik, przyciski) stały luzem między wierszami, z etykietą nad polem. Teraz,
 * jak w kalendarzu z 19.10:
 *  • każdy wiersz to WGŁĘBIENIE na kafelku (`nb-wglebienie-grupa`) — własna powierzchnia, odstęp od sąsiada;
 *    zasada zagnieżdżenia szkła: grupa leżąca NA szybie nie dostaje własnego rozmycia, tylko jest w nią wciśnięta,
 *  • rozwinięta treść wiersza (`pod`) zostaje W TYM SAMYM wgłębieniu, za włosową linią — to ta sama sprawa,
 *  • formularz w wierszu idzie rzędami `RzadUstawienia` (etykieta obok kontrolki, jak `RzadFormularza`),
 *  • krótkie wiersze stoją obok siebie w `SiatkaUstawien` — zamiast kafelka na całą szerokość z jednym
 *    przełącznikiem w środku,
 *  • `AkcjeUstawien` — jeden rząd przycisków formularza, zawsze tak samo wyrównany.
 *
 *  • `SekcjaUstawien` — kafelek biblioteki z nagłówkiem (tytuł, jedno zdanie, akcja/stan po prawej) i wierszami.
 *  • `WierszUstawienia` — tytuł/opis | kontrolka. Od `sm` obok siebie; na telefonie kontrolka schodzi pod spód,
 *    chyba że jest drobna (`zwarty`: przełącznik, pigułka) — wtedy zostaje w linii.
 *  • `NawigacjaUstawien` — na komputerze pionowa lista w kafelku (grupy z drobną etykietą), na telefonie
 *    przewijany rząd chipów. Ten sam stan, dwa układy.
 */

/* ── PODŚWIETLENIE SEKCJI — `?sekcja=` (26.10.2026) ─────────────────────────
   Stały adres sekcji (np. `/ustawienia?tab=ai&sekcja=instrukcje`): strona przewija do niej i na chwilę
   obrysowuje akcentem, żeby było widać, DOKĄD prowadził link. Kontekst zamiast propsa w każdej sekcji —
   o tym, która jest podświetlona, wie tylko strona. */
const KontekstPodswietlenia = React.createContext<string | null>(null);
export const PodswietlenieSekcji = KontekstPodswietlenia.Provider;

/* ── SEKCJA ──────────────────────────────────────────────────────────────── */
export interface SekcjaUstawienProps {
  /** kotwica — `?tab=…&sekcja=id` / `#id` i przewijanie z oceny bezpieczeństwa */
  id?: string;
  tytul: React.ReactNode;
  /** JEDNO zdanie: po co ta sekcja, nie co w niej widać */
  opis?: React.ReactNode;
  ikona?: LucideIcon;
  /** stan albo akcja całej sekcji (pigułka „Włączone”, przycisk „Dodaj”) */
  poPrawej?: React.ReactNode;
  /** własny znak przed tytułem (awatar asystenta) — zamiast ikony z biblioteki */
  przedTytulem?: React.ReactNode;
  /** `krytyczna` — strefa zagrożenia (usunięcie konta, historii) */
  krytyczna?: boolean;
  /** treść, która nie jest listą wierszy (siatka motywów, dokument) — bez odstępów wierszy */
  bezWierszy?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SekcjaUstawien: React.FC<SekcjaUstawienProps> = ({
  id, tytul, opis, ikona, poPrawej, przedTytulem, krytyczna, bezWierszy, children, className,
}) => {
  const podswietlona = React.useContext(KontekstPodswietlenia);
  const swieci = !!id && podswietlona === id;
  return (
    <Tile
      id={id} zwarty intencja={krytyczna ? 'krytyczna' : 'neutralna'}
      data-podswietlona={swieci ? 'true' : undefined}
      className={cn(
        'scroll-mt-24 transition-[box-shadow,border-color] duration-500',
        swieci && 'border-primary/60 ring-2 ring-primary/40',
        className,
      )}
    >
      <TileHeader tytul={tytul} podtytul={opis} ikona={ikona} intencja={krytyczna ? 'krytyczna' : 'akcent'} poPrawej={poPrawej} przedTytulem={przedTytulem} />
      {/* Wiersze to osobne wgłębienia — odstęp zamiast kreski, żeby grupy nie zlewały się w jedną płytę. */}
      <div className={cn(bezWierszy ? 'space-y-3' : 'space-y-2')}>{children}</div>
    </Tile>
  );
};

/* ── WIERSZ ──────────────────────────────────────────────────────────────── */
export interface WierszUstawieniaProps {
  tytul: React.ReactNode;
  opis?: React.ReactNode;
  /** stan obok tytułu: pigułka „Włączone”, „Bieżąca sesja” */
  stan?: React.ReactNode;
  ikona?: LucideIcon;
  /** kontrolka albo wartość po prawej */
  children?: React.ReactNode;
  /** drobna kontrolka (przełącznik, pigułka) — zostaje w linii także na telefonie */
  zwarty?: boolean;
  /** rozwinięta treść POD wierszem (edycja w miejscu, lista urządzeń) — w tym samym wgłębieniu */
  pod?: React.ReactNode;
  krytyczny?: boolean;
  className?: string;
  /** `label` dla przełącznika: klik w cały tytuł przełącza (większy cel na telefonie) */
  htmlFor?: string;
  /** kotwica pojedynczego wiersza */
  id?: string;
}

/** Materiał wiersza — wgłębienie na kafelku; krytyczny niesie czerwień w obwódce i tincie, nie w cieniu. */
const KLASA_WIERSZA = 'rounded-xl border px-3 py-2.5';
const materialWiersza = (krytyczny?: boolean) =>
  krytyczny ? 'border-destructive/30 bg-destructive/[0.05]' : 'nb-wglebienie-grupa border-border/60';

/** Grupa bez rzędu tytułu (formularz kilku pól, lista do odczytu) — ta sama powierzchnia co wiersz. */
export const GrupaUstawien: React.FC<{ children: React.ReactNode; krytyczna?: boolean; className?: string; 'aria-label'?: string }> = ({
  children, krytyczna, className, ...a11y
}) => (
  <div {...a11y} role={a11y['aria-label'] ? 'group' : undefined} className={cn(KLASA_WIERSZA, materialWiersza(krytyczna), className)}>
    {children}
  </div>
);

export const WierszUstawienia: React.FC<WierszUstawieniaProps> = ({
  tytul, opis, stan, ikona: Ikona, children, zwarty, pod, krytyczny, className, htmlFor, id,
}) => {
  const Etykieta = htmlFor ? 'label' : 'div';
  return (
    <div
      id={id}
      className={cn(
        KLASA_WIERSZA,
        materialWiersza(krytyczny),
        id && 'scroll-mt-24',
        className,
      )}
    >
      <div className={cn('flex gap-x-4 gap-y-2.5', zwarty ? 'items-center' : 'flex-col sm:flex-row sm:items-center')}>
        <Etykieta {...(htmlFor ? { htmlFor } : {})} className={cn('flex min-w-0 flex-1 items-start gap-3', htmlFor && 'cursor-pointer')}>
          {Ikona && (
            /* Ikona bez własnej obwódki: wiersz ma już ramkę, trzecia (kafelek → wiersz → ikona) to „2013”. */
            <span className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              krytyczny ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
            )}>
              <Ikona className="h-4 w-4" aria-hidden />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={cn('text-[14px] font-medium leading-snug', krytyczny ? 'text-destructive' : 'text-foreground')}>{tytul}</span>
              {stan}
            </span>
            {opis && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{opis}</span>}
          </span>
        </Etykieta>
        {children !== undefined && children !== null && children !== false && (
          <div className={cn('flex shrink-0 items-center gap-2', !zwarty && (Ikona ? 'pl-11 sm:pl-0' : ''), !zwarty && 'flex-wrap')}>
            {children}
          </div>
        )}
      </div>
      {pod && <div className="mt-2.5 border-t border-border/50 pt-2.5">{pod}</div>}
    </div>
  );
};

/* ── SIATKA — krótkie wiersze obok siebie ─────────────────────────────────
   Dwa przełączniki („Push”, „Nowości e-mailem”) jeden pod drugim na całą szerokość to dwie trzecie pustki
   w każdym rzędzie. Od `sm` stoją parami; na telefonie i tak jeden pod drugim. */
export const SiatkaUstawien: React.FC<{ children: React.ReactNode; kolumny?: 2 | 3; className?: string }> = ({
  children, kolumny = 2, className,
}) => (
  <div className={cn('grid gap-2', kolumny === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2', '[&>*]:min-w-0', className)}>
    {children}
  </div>
);

/* ── SIATKA SEKCJI — dwie małe sekcje obok siebie na szerokim ekranie ─────
   „Czcionka” (dwa kafelki wyboru) i „Nawigacja” (dwa) jedna pod drugą to dwa kafelki na całą szerokość
   z połową pustki w każdym. Od `lg` stoją obok siebie, z równą wysokością (siatka rozciąga kafelki). */
export const SiatkaSekcji: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('grid gap-3 lg:grid-cols-2 [&>*]:min-w-0', className)}>{children}</div>
);

/* ── RZĄD FORMULARZA W WIERSZU — etykieta obok kontrolki ───────────────────
   Ten sam układ co `RzadFormularza` z okna wydarzenia (19.10): kolumna etykiet po lewej od `sm`, treść obok;
   na telefonie etykieta nad treścią. Etykieta w stylu `OpisPola`, żeby formularz miał jeden styl etykiet. */
export const RzadUstawienia: React.FC<{
  etykieta: React.ReactNode;
  /** `id` kontrolki — klik w etykietę ustawia fokus */
  htmlFor?: string;
  /** krótka podpowiedź pod kontrolką (najwyżej jedno zdanie) */
  podpowiedz?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ etykieta, htmlFor, podpowiedz, children, className }) => {
  const Etykieta = htmlFor ? 'label' : 'span';
  return (
    <div className={cn('grid gap-x-3 gap-y-1.5 py-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start', className)}>
      <Etykieta {...(htmlFor ? { htmlFor } : {})} className={cn('flex min-h-0 items-center sm:min-h-9', KLASA_ETYKIETY_POLA)}>
        {etykieta}
      </Etykieta>
      <div className="min-w-0">
        {children}
        {podpowiedz && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{podpowiedz}</p>}
      </div>
    </div>
  );
};

/** Rząd przycisków formularza w wierszu — zawsze do prawej, z tym samym odstępem od pól. */
export const AkcjeUstawien: React.FC<{ children: React.ReactNode; className?: string; poLewej?: React.ReactNode }> = ({
  children, className, poLewej,
}) => (
  <div className={cn('flex flex-wrap items-center gap-2 pt-1.5', className)}>
    {poLewej && <div className="min-w-0 flex-1">{poLewej}</div>}
    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">{children}</div>
  </div>
);

/* ── PIGUŁKA STANU — „Włączone”, „Bieżąca”, „Wymagane” ───────────────────── */
export const StanUstawienia: React.FC<{ rodzaj?: 'dobry' | 'uwaga' | 'neutralny' | 'akcent'; children: React.ReactNode; kropka?: boolean }> = ({
  rodzaj = 'neutralny', children, kropka = true,
}) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none',
    rodzaj === 'dobry' && 'border-success/35 bg-success/10 text-success',
    rodzaj === 'uwaga' && 'border-warning/40 bg-warning/10 text-warning',
    rodzaj === 'akcent' && 'border-primary/30 bg-primary/10 text-primary',
    rodzaj === 'neutralny' && 'border-border bg-foreground/[0.04] text-muted-foreground',
  )}>
    {kropka && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
    {children}
  </span>
);

/* ── NAWIGACJA ───────────────────────────────────────────────────────────── */
export interface PozycjaNawigacjiUstawien {
  id: string;
  etykieta: string;
  ikona: LucideIcon;
  /** kropka uwagi przy pozycji (np. Bezpieczeństwo bez 2FA) — z opisem dla czytników i dymka */
  uwaga?: string;
}
export interface GrupaNawigacjiUstawien { etykieta: string; pozycje: PozycjaNawigacjiUstawien[] }

export const NawigacjaUstawien: React.FC<{
  grupy: GrupaNawigacjiUstawien[];
  aktywna: string;
  onZmiana: (id: string) => void;
  /** nad listą na komputerze (karta profilu) */
  naglowek?: React.ReactNode;
  className?: string;
}> = ({ grupy, aktywna, onZmiana, naglowek, className }) => {
  const wszystkie = grupy.flatMap((g) => g.pozycje);
  return (
    <>
      {/* TELEFON / TABLET: przewijany rząd — pionowa lista zjadłaby pół ekranu nad treścią. */}
      <PrzewijanyRzad className={cn('lg:hidden', className)} klasaRzedu="gap-1.5 pb-1" aria-label="Sekcje ustawień">
        <ChipyWyboru
          styl="pelny" odznaczalne={false} wartosc={aktywna} onZmiana={(v) => v && onZmiana(v)}
          opcje={wszystkie.map((p) => ({
            key: p.id,
            label: (
              <span className="inline-flex items-center gap-1.5">
                <p.ikona className="h-3.5 w-3.5" aria-hidden />{p.etykieta}
                {p.uwaga && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-label={p.uwaga} />}
              </span>
            ),
          }))}
        />
      </PrzewijanyRzad>

      {/* KOMPUTER: pionowa lista w kafelku, przyklejona przy przewijaniu treści. */}
      <nav aria-label="Sekcje ustawień" className={cn(klasyKafelka({ zwarty: true }), 'sticky top-4 hidden lg:block', className)}>
        {naglowek && <div className="-mx-3.5 -mt-3.5 mb-3 border-b border-border/60 p-3.5">{naglowek}</div>}
        <div className="space-y-4">
          {grupy.map((g) => (
            <div key={g.etykieta}>
              <p className="mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">{g.etykieta}</p>
              <ul className="space-y-0.5">
                {g.pozycje.map((p) => {
                  const wybrana = p.id === aktywna;
                  return (
                    <li key={p.id}>
                      <button
                        type="button" onClick={() => onZmiana(p.id)} aria-current={wybrana ? 'page' : undefined} title={p.uwaga}
                        className={cn(
                          'flex h-9 w-full items-center gap-2.5 rounded-xl border px-2.5 text-left text-[14px] transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          wybrana
                            ? 'border-primary/25 bg-primary/10 font-medium text-foreground'
                            : 'border-transparent text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground',
                        )}
                      >
                        <p.ikona className={cn('h-4 w-4 shrink-0', wybrana ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{p.etykieta}</span>
                        {p.uwaga && <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-label={p.uwaga} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

/* ── KAFELEK WYBORU — motyw, nawigacja, czcionka, wzór, dekoracja ──────────
   Przed 20.10.2026 każdy z pięciu wyborów w Wyglądzie miał własny przycisk z inną ramką, inną kropką „✓”
   i `hover:scale-105` (skalowanie unieważnia szkło rodzica). Jeden kafelek: podgląd na górze, nazwa pod nim,
   znacznik w rogu, stan zablokowany z powodem w dymku. */
export interface KafelekWyboruProps {
  wybrany: boolean;
  onWybierz: () => void;
  nazwa: React.ReactNode;
  /** podgląd (miniatura motywu, wzór, próbka czcionki) */
  podglad?: React.ReactNode;
  opis?: React.ReactNode;
  /** powód blokady — kafelek przygaszony, dymek z powodem */
  blokada?: string;
  disabled?: boolean;
  /** `radio` w grupie z `role="radiogroup"`; domyślnie przycisk przełączający */
  rola?: 'radio';
  className?: string;
}

export const KafelekWyboru: React.FC<KafelekWyboruProps> = ({
  wybrany, onWybierz, nazwa, podglad, opis, blokada, disabled, rola, className,
}) => (
  <button
    type="button"
    role={rola}
    aria-checked={rola === 'radio' ? wybrany : undefined}
    aria-pressed={rola ? undefined : wybrany}
    disabled={disabled || !!blokada}
    title={blokada}
    onClick={onWybierz}
    className={cn(
      'relative flex min-h-[44px] flex-col gap-1.5 rounded-xl border p-2 text-left transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      wybrany ? 'border-primary/50 bg-primary/[0.07] ring-1 ring-primary/40' : 'nb-wglebienie-grupa border-border/60 hover:border-primary/30',
      blokada && 'cursor-not-allowed opacity-50',
      'disabled:cursor-not-allowed',
      className,
    )}
  >
    {podglad && <span className="block overflow-hidden rounded-lg">{podglad}</span>}
    <span className="flex min-w-0 items-center gap-1 px-0.5 text-[12px] font-medium leading-tight text-foreground">
      <span className="min-w-0 truncate">{nazwa}</span>
    </span>
    {opis && <span className="px-0.5 text-[11px] leading-snug text-muted-foreground">{opis}</span>}
    {wybrany && (
      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm" aria-hidden>
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    )}
  </button>
);
