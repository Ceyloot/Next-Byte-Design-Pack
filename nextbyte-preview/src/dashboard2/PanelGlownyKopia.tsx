import React from 'react';
import { ByteStatusBar } from '@d2/components/dashboard/ByteStatusBar';
import { SzybkiKreator } from '@d2/components/dashboard/SzybkiKreator';
import { WrocDoRoboty } from '@d2/components/dashboard/WrocDoRoboty';
import { SkrzynkaSpraw } from '@d2/components/dashboard/SkrzynkaSpraw';
import { KalendarzMiesiaca } from '@d2/components/dashboard/KalendarzMiesiaca';
import { KafelkiChmury } from '@d2/components/dashboard/KafelkiChmury';
import { QuickShortcutsPanel } from '@d2/components/dashboard/QuickShortcutsPanel';
import { UZYTKOWNIK } from '@d2/integrations/supabase/dane-atrapy';

/**
 * PANEL GŁÓWNY — KOPIA WYGLĄDOWA 1:1
 *
 * Po co istnieje: żywy Panel Główny da się zobaczyć tylko przez drugi serwer
 * (`localhost:8093`) i przejście całego logowania, bo to osobna aplikacja
 * z własnym routerem, kontekstami i Supabase. Preview osadzał go w `<iframe>`.
 * Do pracy nad wyglądem to jest droga okrężna: żeby poprawić odstęp
 * w kafelku, trzeba było wstać, odpalić drugą paczkę i się zalogować.
 *
 * Co jest tu prawdziwe: kafelki, ich logika, układ siatki i wymiary —
 * przeniesione z `nextbyte-panel-glowny/src/pages/Dashboard.tsx` i z plików
 * kafelków bez zmiany ani jednej klasy. Wartości układu nie są szacowane
 * z oka: kontener `max-w-[1600px]`, siatka `lg:grid-cols-3` z `col-span-2`
 * po lewej (a NIE `[2fr_1fr]` — przy trzech równych kolumnach z przerwą
 * lewa część to 2.038:1, nie 2.000:1), lista spraw `min-h-[15rem]`.
 *
 * Czego tu nie ma i celowo nie będzie:
 *  • Supabase — `integrations/supabase/client.ts` to atrapa bez sieci,
 *  • logowania i kont — jedno konto z `dane-atrapy.ts`,
 *  • onboardingu, wycieczki, lejka i okien nagród — to są zachowania
 *    produktu, nie wygląd panelu, a każde ciągnęło za sobą własny kontekst,
 *  • paska bocznego i nawigacji — tę warstwę preview ma swoją.
 *
 * Zmiana treści na ekranie idzie przez `dane-atrapy.ts`, nie przez kafelki.
 */

/** Granica błędu — jeden kafelek nie może zabrać całej strony. */
class GranicaKafelka extends React.Component<
  { children: React.ReactNode; nazwa: string },
  { blad: boolean }
> {
  state = { blad: false };
  static getDerivedStateFromError() { return { blad: true }; }
  componentDidCatch(error: Error) {
    console.error(`[Panel 2.0 — kopia] kafelek padł: ${this.props.nazwa}`, error.message);
  }
  render() {
    if (this.state.blad) {
      return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Kafelek „{this.props.nazwa}" się nie narysował. Szczegóły w konsoli.
        </div>
      );
    }
    return this.props.children;
  }
}

export function PanelGlownyKopia() {
  return (
    /* Dwa pasy stałe i siatka między nimi, która zabiera resztę wysokości.
       `min-h-0` na każdym poziomie — bez niego element siatki nie potrafi
       być NIŻSZY od swojej treści i wypycha układ w przewijanie strony,
       czyli dokładnie to, co ten układ likwiduje. */
    <div className="flex flex-col ekran1:h-full ekran1:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5 ekran1:h-full ekran1:overflow-hidden">


        {/* ─── Pasek stanu Byte ───
            Na miejscu dawnego hero. Saldo, przebieg z 7/30/90 dni i prognoza
            „na ile wystarczy" — wszystko w jednym rzędzie, bez nagłówka
            kafelka. Nagłówek podnosił pasek ze 114 na 196 px, a przy
            1280×800 kolumny spadały wtedy do 356 px i skrzynka spraw
            pokazywała jedną pozycję z trzech. */}
        <div className="shrink-0">
          <GranicaKafelka nazwa="pasek stanu Byte">
            <ByteStatusBar
              userId={UZYTKOWNIK.id}
              userName={UZYTKOWNIK.imie}
              platformVersion="Beta 1.0.0"
            />
          </GranicaKafelka>
        </div>

        {/* ═══ SIATKA GŁÓWNA ═══
            LEWA  (2/3) = robota:   zacznij → wróć
            PRAWA (1/3) = kontekst: co czeka → kiedy

            Kreator stoi po lewej, bo oko ląduje najpierw tam, a to jedyny
            element panelu, który coś ROBI. Reszta pokazuje stan. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 ekran1:min-h-0 ekran1:flex-1">

          {/* ── LEWA: stąd zaczynam robotę ──
              `overflow-y-auto`, NIE `hidden`: tryb jednego ekranu dotyczy
              STRONY i nie zakazuje przewijania wewnątrz kolumny. */}
          <div className="flex flex-col gap-4 ekran1:min-h-0 ekran1:overflow-y-auto lg:col-span-2">
            <div className="shrink-0">
              <GranicaKafelka nazwa="szybki kreator">
                <SzybkiKreator />
              </GranicaKafelka>
            </div>

            {/* `basis-0` przy `flex-1`, nie samo `flex-1`: procent liczony od
                nieokreślonej wysokości kolumny zachowuje się jak „auto",
                więc lista znów dyktowałaby wysokość rzędu (zmierzone: 432 px
                zamiast 324). Minimum `15rem` gwarantuje cztery pozycje. */}
            <div className="flex min-h-[15rem] flex-1 basis-0 flex-col ekran1:min-h-[15rem]">
              <GranicaKafelka nazwa="wróć do roboty">
                <WrocDoRoboty />
              </GranicaKafelka>
            </div>
          </div>

          {/* ── PRAWA: co czeka i kiedy ── */}
          <div className="flex flex-col ekran1:min-h-0 ekran1:overflow-y-auto">
            {/* `shrink-0` — wysokość z treści, bez rozciągania. W wąskiej
                kolumnie normalnym stanem skrzynki bywa pustka, a z `flex-1`
                karta „Nic nie czeka" rozciągała się na 850 px. Terminy stoją
                NAD kalendarzem: termin, który minął, nie może być schowany
                pod siatką dni. */}
            <div className="shrink-0">
              <GranicaKafelka nazwa="skrzynka spraw">
                <SkrzynkaSpraw />
              </GranicaKafelka>
            </div>

            {/* `flex-1` bez `min-h-0`: kalendarz ROŚNIE, gdy jest miejsce,
                ale nie kurczy się poniżej siatki dni. Równe dno kolumn było
                ozdobą, ucięty ostatni tydzień miesiąca jest usterką — przy
                sprzeczności wygrywa siatka. */}
            <div className="mt-4 flex flex-1 flex-col">
              <GranicaKafelka nazwa="kalendarz miesiąca">
                <KalendarzMiesiaca />
              </GranicaKafelka>
            </div>
          </div>
        </div>

        {/* ── DOLNY PAS: chmury po lewej, skróty po prawej ──
            Podział 2/1 ten sam, co w siatce nad nim, więc krawędzie kolumn
            stoją w jednej linii przez całą stronę. Chmury dostają dwie
            trzecie, bo niosą STAN (ile miejsca zostało); skróty schodzą do
            jednej trzeciej w postaci samych ikon — tego, co w tej szerokości
            jest czytelne. */}
        <section className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GranicaKafelka nazwa="kafelki chmury">
              <KafelkiChmury />
            </GranicaKafelka>
          </div>
          <GranicaKafelka nazwa="szybkie skróty">
            <QuickShortcutsPanel wariant="ikony" />
          </GranicaKafelka>
        </section>

      </div>
    </div>
  );
}

export default PanelGlownyKopia;
