import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogClose, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { SZKLO } from '@/components/ui/tile';
import { useDefinicjeSzkla } from '@/components/ui/szklo-plynne';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  OKNO — jeden schemat wszystkich okien dialogowych platformy
 * ════════════════════════════════════════════════════════════════════════
 *
 * DLACZEGO NAKŁADKA, A NIE PIĄTY SYSTEM OKIEN
 * W platformie żyją dziś CZTERY równoległe rozwiązania: `dialog` (248 plików),
 * `alert-dialog` (75), `NextByteModal` (75) i `sheet` (19). Dołożenie piątego
 * pogłębiłoby dokładnie ten problem, który mamy zamknąć. Dlatego `Okno` NIE
 * jest nowym prymitywem — to warstwa wyglądu nałożona na `DialogPrimitive`
 * (Radix). Zachowanie, dostępność, blokada przewijania i pułapka fokusu
 * zostają te, które już działają; zmienia się wyłącznie chrom.
 *
 * ── PRZEBUDOWA 31.07.2026 ───────────────────────────────────────────────
 * Poprzednia wersja miała trzy wady widoczne na pierwszy rzut oka:
 *
 * ① BYŁA PŁASKA. Powierzchnia `bg-card` jest NIEPRZEZROCZYSTA, więc rozmycie
 *    nakładki nie miało czego prześwietlić — „szkło" było nazwą dla zwykłego
 *    ciemnego prostokąta. Teraz powierzchnia jest półprzezroczysta i ma własne
 *    rozmycie, a nakładka rozmywa mocniej, żeby było co przepuszczać.
 *
 * ② IKONA W PUDEŁKU OBOK TYTUŁU. Dwa drobne elementy walczyły o uwagę, a całość
 *    czytała się jak naklejka doklejona do okna. To ten sam błąd, który wcześniej
 *    wyleciał z nagłówka kafelka — i naprawiamy go tak samo: PASKIEM ETYKIETY
 *    u góry (sztabka akcentu + mała ikona + wersaliki), a tytuł dostaje całą
 *    szerokość i prowadzi sam.
 *
 * ③ ZNAK WODNY BYŁ PRZYCINANY. Duża ikona w rogu wychodziła poza obrys okna
 *    i czytała się jako jasny prostokąt, nie jako tekstura. Zastąpiona miękką
 *    poświatą w kolorze akcentu — daje głębię i nie ma krawędzi do przycięcia.
 *
 * ZAPASOWE KRYCIE JEST PEŁNE (`bg-card/95` bez `backdrop-filter`). Bez tego
 * w przeglądarce bez obsługi rozmycia treść strony przebijałaby przez okno.
 */

export type IntencjaOkna = 'neutralna' | 'akcent' | 'krytyczna';
export type RozmiarOkna = 'maly' | 'sredni' | 'duzy' | 'pelny';

const SZEROKOSC: Record<RozmiarOkna, string> = {
  maly: 'max-w-md',
  sredni: 'max-w-lg',
  duzy: 'max-w-3xl',
  /* podgląd dokumentu z kartką A4 i tabele pozycji (Panel Klienta, 17.09.2026 — STANDARD-WYGLADU §13 p. 48) */
  pelny: 'max-w-4xl',
};

/** Kolor akcentu okna. `krytyczna` istnieje dla operacji nieodwracalnych. */
const AKCENT: Record<IntencjaOkna, string> = {
  neutralna: 'var(--primary)',
  akcent: 'var(--primary)',
  krytyczna: 'var(--destructive)',
};

/** Szkło powierzchni — definicja mieszka w `tile.tsx` (moduł powierzchni),
 *  bo korzysta z niej też `ListaWyboru`. Tu tylko używamy. */

export const Okno = Dialog;
export const OknoWyzwalacz = DialogTrigger;
export const OknoZamknij = DialogClose;

export interface OknoTrescProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  intencja?: IntencjaOkna;
  rozmiar?: RozmiarOkna;
}

export const OknoTresc = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  OknoTrescProps
>(function OknoTresc(
  { className, children, intencja = 'neutralna', rozmiar = 'sredni', style, ...props },
  ref,
) {
  const akcent = `hsl(${AKCENT[intencja]})`;
  // Filtry załamania muszą być w drzewie, zanim powierzchnia się pokaże.
  useDefinicjeSzkla();

  return (
    <DialogPrimitive.Portal>
      {/*
        WŁASNA NAKŁADKA, nie współdzielona `DialogOverlay`.
        Tamta ma `nb-szklo` i służy 248 plikom platformy — podniesienie
        jej rozmycia zmieniłoby wygląd wszystkich okien naraz, a mamy niczego
        w platformie nie ruszać. Tutaj rozmycie jest mocniejsze, bo dopiero na
        takim tle półprzezroczysta powierzchnia okna czyta się jako szkło.
      */}
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-[200] nb-zaslona',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      />

      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
          /* ⚠️ OKNO NIE MOŻE ROSNĄĆ BEZ KOŃCA. Do tej pory nie miało żadnego
             ograniczenia wysokości — brało tyle, ile chciała zawartość, i przy
             dłuższej wychodziło poza ekran. Zmierzone w Studiu Zdjęć: podgląd
             obrazu ma w nagłówku CAŁY opis (na telefonie kilka linii), ciało
             do 72vh i stopkę z przyciskami — razem grubo ponad wysokość
             ekranu, więc dół okna był nieosiągalny.

             `100dvh`, nie `100vh`: na telefonie pasek adresu chowa się
             i pokazuje, a `vh` liczy się od WIĘKSZEJ wysokości, więc okno
             i tak wystawałoby o wysokość paska.

             `flex flex-col` + `min-h-0` na ciele sprawiają, że przy braku
             miejsca kurczy się CIAŁO (ma własne przewijanie), a nagłówek
             i stopka zostają widoczne. Bez `min-h-0` dziecko kolumny flex nie
             zejdzie poniżej swojej treści i cała konstrukcja jest bez znaczenia. */
          'flex max-h-[calc(100dvh-2rem)] flex-col',
          'overflow-hidden rounded-2xl border border-border outline-none',
          SZKLO,
          'nb-szklo-tafla',
          'nb-centered-anim notranslate',
          SZEROKOSC[rozmiar],
          className,
        )}
        style={{
          /*
            CIEŃ BEZ KOLORU — i to jest największa zmiana w wyglądzie okna.

            Poprzednio okno miało `0 0 48px -24px <akcent>`, czyli rozmytą,
            kolorową poświatę dookoła całego prostokąta. Taka poświata nie ma
            kierunku (światło niby pada ze wszystkich stron naraz), więc mózg
            nie czyta jej jako cienia tylko jako ŚWIECENIE — i całość wygląda
            jak podświetlane pudełko, a nie jak kartka leżąca nad stroną.

            Teraz jest tak, jak zachowuje się prawdziwe światło:
              ① włosowa obwódka — ostra krawędź, po niej poznaje się jakość,
              ② wewnętrzny refleks u góry — krawędź zwrócona do światła,
              ③ dwa cienie CZARNE, przesunięte W DÓŁ (światło jest nad nami):
                 jeden ciasny pod krawędzią, drugi szeroki i miękki.
            Zero koloru. Kolor niesie listwa etykiety, nie mgiełka wokół okna.
          */
          boxShadow: [
            `0 0 0 1px hsl(var(--border))`,
            `inset 0 1px 0 0 hsl(var(--foreground) / 0.07)`,
            `0 2px 4px -2px hsl(0 0% 0% / 0.4)`,
            `0 12px 24px -8px hsl(0 0% 0% / 0.45)`,
            `0 40px 80px -24px hsl(0 0% 0% / 0.55)`,
          ].join(', '),
          /* `style` z zewnątrz DOKŁADA się do cienia, nie zastępuje go: okna
             Studiów przekazują tu zmienne akcentu (`--primary` dla portalu),
             a przy `{...props}` po `style` traciły cały cień (03.09.2026). */
          ...style,
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export interface OknoNaglowekProps {
  /** pasek u góry — nazywa RODZAJ operacji: „Operacja nieodwracalna" */
  etykieta?: React.ReactNode;
  tytul: React.ReactNode;
  podtytul?: React.ReactNode;
  ikona?: React.ReactNode;
  intencja?: IntencjaOkna;
  /** pokazać krzyżyk zamknięcia */
  zZamknieciem?: boolean;
  className?: string;
}

/**
 * NAGŁÓWEK OKNA — pasek etykiety, potem tytuł.
 *
 * Pasek etykiety mówi, CO TO ZA OKNO (rodzaj operacji), tytuł mówi, CZEGO
 * dotyczy. Rozdzielenie tych dwóch rzeczy jest sednem przebudowy: wcześniej
 * musiał je unieść sam tytuł, wspierany ikoną w pudełku, i żadne z nich nie
 * robiło tego dobrze.
 */
export const OknoNaglowek: React.FC<OknoNaglowekProps> = ({
  etykieta, tytul, podtytul, ikona, intencja = 'neutralna', zZamknieciem = true, className,
}) => {
  const akcent = `hsl(${AKCENT[intencja]})`;

  return (
    <div className={cn('relative', className)}>
      {/* ── LISTWA ETYKIETY ──
          BEZ pionowej sztabki, którą miała pierwsza wersja. Powód jest
          konkretny: mały, zaokrąglony pasek pionowy przy lewej krawędzi listwy,
          wygaszany ku dołowi, to DOKŁADNIE kształt uchwytu paska przewijania.
          Czytał się więc jako „tu się przewija", a nie „to jest rodzaj operacji".
          W kafelku ta sztabka działa, bo stoi przy wielowierszowym nagłówku
          w środku karty; w wąskiej listwie u góry okna — myli.

          Zastąpiona BARWIONĄ LISTWĄ na pełną szerokość. Czerwony pasek nad
          treścią mówi „uwaga, to jest groźne" zanim ktokolwiek przeczyta słowa —
          i to jest ten test dwóch sekund. */}
      {(etykieta || zZamknieciem) && (
        <div
          className="relative flex items-center gap-2 px-5 py-3 md:px-6"
          style={{
            /*
              DWA ZACHOWANIA, ŚWIADOMIE RÓŻNE.

              • Okna zwykłe i akcentowe: listwa jest NEUTRALNA — lekko jaśniejsza
                płaszczyzna liczona od `--foreground`, czyli pasek tytułowy taki
                jak w oknach systemowych. Poprzednia wersja lała tu 11% akcentu
                i na prawie czarnej karcie nie było tego widać w ogóle: pasek
                istniał w kodzie, a nie na ekranie. Akcent niesie tekst, ikona
                i lewy odcinek krawędzi — i to wystarcza.

              • Okna krytyczne: TU zalewka koloru ma sens, bo ostrzeżenie ma
                krzyczeć zanim ktoś przeczyta słowa. Dlatego czerwień zostaje,
                mocniejsza niż wcześniej, z kierunkiem od lewej.
            */
            background:
              intencja === 'krytyczna'
                ? `linear-gradient(90deg,
                     color-mix(in srgb, ${akcent} 20%, transparent) 0%,
                     color-mix(in srgb, ${akcent} 6%, transparent) 60%,
                     transparent 100%)`
                : 'hsl(var(--foreground) / 0.045)',
          }}
        >
          {/* Krawędź pod listwą — pełny akcent po lewej, wygaszany w prawo,
              żeby domknąć ten sam kierunek co wypełnienie. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{
              background: `linear-gradient(90deg,
                color-mix(in srgb, ${akcent} 55%, transparent) 0%,
                hsl(var(--border)) 60%,
                hsl(var(--border)) 100%)`,
            }}
          />
          {etykieta && (
            <>
              {ikona && (
                <span
                  aria-hidden="true"
                  className="relative shrink-0 [&>svg]:h-4 [&>svg]:w-4"
                  style={{ color: akcent }}
                >
                  {ikona}
                </span>
              )}
              <span
                className="relative min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.13em]"
                style={{ color: akcent }}
              >
                {etykieta}
              </span>
            </>
          )}

          {zZamknieciem && (
            <DialogClose
              className="relative -mr-1.5 ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Zamknij okno"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          )}
        </div>
      )}

      {/* ── TYTUŁ ── */}
      <div className="px-5 pb-1 pt-5 md:px-6">
        <DialogTitle className="font-heading text-[16px] font-semibold leading-tight text-foreground md:text-[16px]">
          {tytul}
        </DialogTitle>
        {podtytul && (
          <DialogDescription className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            {podtytul}
          </DialogDescription>
        )}
      </div>
    </div>
  );
};

/**
 * Ciało okna. Przewija się SAMO, a nie razem ze stroną — dzięki temu nagłówek
 * i stopka zostają widoczne przy długiej treści, także na telefonie.
 */
export const OknoCialo: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className,
}) => (
  <div
    className={cn(
      /* `min-h-0` jest tu obowiązkowe — patrz komentarz przy `OknoTresc`:
         to ono pozwala ciału oddać miejsce nagłówkowi i stopce, gdy okno
         dobija do wysokości ekranu. */
      'nb-pasek min-h-0 max-h-[55vh] overflow-y-auto px-5 py-4 text-[14px] leading-relaxed text-card-foreground md:px-6',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Stopka z akcjami — na własnej, lekko przyciemnionej płaszczyźnie, żeby
 * oddzielała decyzję od treści.
 *
 * Na telefonie akcje idą w słupku i na PEŁNĄ szerokość: dwa przyciski obok
 * siebie na 375 px dają cele poniżej progu dotyku. Kolejność odwrócona
 * (`flex-col-reverse`), żeby akcja główna była na dole, czyli najbliżej kciuka.
 */
export const OknoStopka: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className,
}) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 border-t border-border/70 bg-foreground/[0.02] px-5 py-4',
      'md:flex-row md:justify-end md:px-6',
      '[&>button]:w-full md:[&>button]:w-auto',
      className,
    )}
  >
    {children}
  </div>
);
