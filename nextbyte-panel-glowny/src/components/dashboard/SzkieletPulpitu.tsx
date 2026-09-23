import React from 'react';
import { Szkielet } from '@/components/ui/stany';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZKIELET PANELU GŁÓWNEGO — kształt zamiast kółka
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „czy zamiast ekranu ładowania możemy pokazywać animacje ładowania
 * komponentów — jest schemat komponentu, ale bez treści".
 *
 * Kręcące się kółko mówi tylko „czekaj". Szkielet mówi „za chwilę będzie tu
 * pasek Byte, wyszukiwarka i trzy kolumny" — i to jest różnica mierzalna,
 * nie estetyczna: układ jest już zbudowany, więc gdy dane dojdą, NIC NIE
 * PRZESKAKUJE. Przy kółku cała strona powstaje w jednej klatce i wypycha to,
 * na co człowiek akurat patrzył.
 *
 * ── PROPORCJE POCHODZĄ Z POMIARU, NIE Z OKA ─────────────────────────────
 * Pierwsza wersja tego pliku była zmyślona: dwie kolumny u góry i dwie
 * w środku. Pomiar żywego pulpitu (1416 px szerokości) pokazał co innego —
 * pas górny to JEDNA karta wysokości 180 px, wyszukiwarka ma 48 px, a środek
 * to siatka `lg:grid-cols-3`, w której pierwsze dziecko zajmuje jedną
 * kolumnę, a drugie dwie. Szkielet o innych proporcjach jest gorszy niż jego
 * brak: obiecuje jeden układ, podstawia drugi i zamiast usunąć przeskok,
 * dokłada jeszcze jeden.
 *
 * Klasy układu są przepisane z `Dashboard.tsx` celowo. Gdy tamten układ się
 * zmieni, ten ma zmienić się razem z nim — dlatego stoi w tym samym katalogu,
 * a nie w bibliotece komponentów.
 *
 * ── CZEGO TU NIE MA ──────────────────────────────────────────────────────
 * Żadnych napisów „Ładowanie…". Szkielet, który sam siebie opisuje słowem,
 * przestaje być szkieletem i staje się ekranem ładowania w przebraniu.
 * Dla czytnika ekranu wystarcza `role="status"` wewnątrz `Szkielet`.
 */
export const SzkieletPulpitu: React.FC = () => (
  <div className="h-full w-full overflow-hidden">
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
      {/* ── Pas Byte: jedna karta na pełną szerokość, 180 px ── */}
      <Szkielet ksztalt="blok" wierszy={1} className="shrink-0 [&>span]:h-[180px] [&>span]:rounded-2xl" />

      {/* ── Wyszukiwarka: 48 px ── */}
      <Szkielet ksztalt="blok" wierszy={1} className="shrink-0 [&>span]:h-12 [&>span]:rounded-xl" />

      {/* ── Środek: 1 kolumna + 2 kolumny ──
          Zawartość obu kolumn zmierzona na żywym pulpicie (1416 px):
          lewa  → pasek stanu 46 px, lista 928 px, nowości 178 px
          prawa → pole rozmowy 237 px, reszta 931 px
          Trzymamy te proporcje, bo o to w szkielecie chodzi: gdy dane dojdą,
          bloki mają już stać tam, gdzie staną. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex h-full min-h-0 flex-col gap-4">
          {/* Pasek „nic Cię dziś nie czeka" */}
          <Szkielet ksztalt="blok" wierszy={1} className="shrink-0 [&>span]:h-[46px] [&>span]:rounded-xl" />

          {/* „Wróć do roboty" — nagłówek i lista ostatnich rzeczy.
              Czternaście wierszy z `overflow-hidden`: na wysokim ekranie
              wypełniają kartę, na niskim nadmiar zostaje przycięty. Liczba
              sztywna byłaby dobra dokładnie dla jednej wysokości okna. */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-border/40 p-4">
            <Szkielet wierszy={2} className="shrink-0" />
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="flex shrink-0 items-center gap-3">
                  {/* Kwadrat z zaokrągleniem, nie koło — ikony pozycji są
                      kwadratowe, a koło obiecywałoby awatary ludzi. */}
                  <Szkielet
                    ksztalt="blok"
                    wierszy={1}
                    className="shrink-0 [&>span]:h-8 [&>span]:w-8 [&>span]:rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <Szkielet wierszy={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Pole rozmowy, kafelki szybkiej podróży i reszta kolumny. */}
        <div className="flex min-h-0 flex-col gap-4 lg:col-span-2">
          <Szkielet ksztalt="blok" wierszy={1} className="shrink-0 [&>span]:h-[237px] [&>span]:rounded-2xl" />
          <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Szkielet key={i} ksztalt="blok" wierszy={1} className="[&>span]:h-[84px] [&>span]:rounded-xl" />
            ))}
          </div>
          <Szkielet ksztalt="blok" wierszy={1} className="min-h-0 flex-1 [&>span]:h-full [&>span]:rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);
