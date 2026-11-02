/** Karta jednego planu cennika — wygląd Artura na materiale platformy; dane z `PlanCennika`, bez własnych kwot. */
import React, { useState } from 'react';
import { ChevronDown, Gift, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OkresRozliczenia, PlanCennika, StanKarty } from './typy';
import {
  AnimLiczba, DodatekZablokowanyWiersz, PanelZuzycia, Rozwijane, SuwakDodatku, SuwakPuli, WierszCechy, WierszPuli, kwotaPl, miejscaKwoty, tintaAkcentu,
} from './wiersze';

/*
  ════════════════════════════════════════════════════════════════════════
   KARTA PLANU — wygląd Artura (eksport z 23.09.2026), materiał platformy
  ════════════════════════════════════════════════════════════════════════

  Układ 1:1 z `PlanCard` z `CennikPage`: tytuł z plakietką rabatu, cena
  z przekreśloną ratą przy rozliczeniu rocznym, przycisk ZARAZ pod ceną,
  suwak progów puli, panel „Każdego miesiąca aż", lista cech z rozwijaniem.

  CO INNE NIŻ W EKSPORCIE — tylko to, co dotyczy reguł platformy:
  • powierzchnia to `Card` z biblioteki (`nb-szklo nb-szklo-plynne`), nie
    własne `bg-[hsl(var(--card)/0.94)]` — jedna szyba dla całej platformy,
    sterowana z „Zarządzania szkłem",
  • przyciski to `Button` (styl 1 `glass` dla głównego wezwania, styl 2
    `obwodka` dla reszty) zamiast `GlowButton`/`GhostButton` Artura,
  • zero bieli i czerni z palety: kłódka, cień i krawędź idą z `--foreground`
    i `--background`, więc karta czyta się na obu motywach,
  • bez specularnej białej kreski u góry — rant niesie materiał `.nb-szklo`.

  ŻADNEJ KWOTY TU NIE MA. Cena, rata, faktura i pula przychodzą w `progi`,
  rabat liczy się z tych liczb (1 − faktura / 12 rat), nigdy ze stałej.
*/

/** Ile cech karta pokazuje od razu; reszta czeka pod „+N więcej". */
const WIDOCZNE = { pelna: 20, kompaktowa: 3 } as const;

const AKCENT_MOTYWU = 'hsl(var(--primary))';

const PODPIS_DARMOWY: [string, string] = ['bez karty kredytowej', 'płatność tylko za zużyte Byte'];

/*
  WEJŚCIE TEKSTU PO ZMIANIE OKRESU (Michał, 12.10.2026: „brakuje mi smooth animacji
  wejścia tych tekstów przy zmianie z miesięcznej na roczną"). Liczby od początku
  przewijają się licznikiem, a podpisy pod ceną podmieniały się skokiem. Blok
  podpisów dostaje klucz z okresu, więc po przełączeniu montuje się od nowa
  i wchodzi tą animacją; druga linia startuje chwilę po pierwszej.

  Animuje się sam tekst, nie karta: ruch przodka z `backdrop-filter` gasi szkło.
*/
export const WEJSCIE_TEKSTU = 'motion-safe:animate-wejscie-tekstu motion-reduce:animate-wejscie-tekstu-lagodne';
const WEJSCIE_DRUGIE = 'motion-safe:animate-wejscie-tekstu-drugie motion-reduce:animate-wejscie-tekstu-lagodne';

const wartosc = <T,>(v: T | ((stan: StanKarty) => T) | undefined, stan: StanKarty, domyslna: T): T =>
  typeof v === 'function' ? (v as (s: StanKarty) => T)(stan) : (v ?? domyslna);

export interface KartaPlanuProps {
  plan: PlanCennika;
  okres: OkresRozliczenia;
  /** Ciaśniejsza karta do wnętrza aplikacji: mniejsze odstępy, trzy cechy. */
  kompaktowy?: boolean;
  className?: string;
}

/** Karta jednego planu cennika — dane z `PlanCennika`, bez własnych kwot. */
export function KartaPlanu({ plan, okres, kompaktowy = false, className }: KartaPlanuProps) {
  const biezacyProg = plan.biezacyProg ?? 0;
  const [prog, setProg] = useState(Math.min(biezacyProg, Math.max(0, plan.progi.length - 1)));
  const [rozwiniete, setRozwiniete] = useState(false);

  const kolor = plan.kolor ?? AKCENT_MOTYWU;
  const aktualny = plan.progi[prog] ?? plan.progi[0];
  const darmowy = Boolean(plan.darmowy) || !aktualny || aktualny.miesiecznie <= 0;
  /* Dodatek ilościowy (miejsca Premium dla zespołu) dolicza się do każdej kwoty karty:
     raty miesięcznej, raty przy rozliczeniu rocznym i faktury rocznej. */
  const dodatek = plan.dodatek;
  const [ilosc, setIlosc] = useState(Math.min(dodatek?.poczatkowa ?? 0, dodatek?.max ?? 0));
  const grosze = (zl: number) => Math.round(zl * 100) / 100;
  const cenaBazowa = grosze((aktualny?.miesiecznie ?? 0) + ilosc * (dodatek?.miesiecznie ?? 0));
  const faktura = grosze((aktualny?.fakturaRoczna ?? 0) + ilosc * (dodatek?.fakturaRoczna ?? 0));
  const cena = okres === 'rocznie' ? grosze((aktualny?.rocznie ?? 0) + ilosc * (dodatek?.rocznie ?? 0)) : cenaBazowa;
  const rabat = cenaBazowa > 0 ? 1 - faktura / (cenaBazowa * 12) : 0;
  const oszczedzasz = Math.round((cenaBazowa * 12 - faktura) * 100) / 100;
  const rocznie = !darmowy && okres === 'rocznie';

  const zmianaProgu: StanKarty['zmianaProgu'] =
    plan.biezacy && prog !== biezacyProg ? (prog > biezacyProg ? 'wyzej' : 'nizej') : 'brak';
  const stan: StanKarty = { okres, prog, zmianaProgu, ilosc };

  const wyroznione = Boolean(plan.polecany || plan.podswietlony || plan.biezacy);
  const limit = kompaktowy ? WIDOCZNE.kompaktowa : WIDOCZNE.pelna;
  const ukryte = Math.max(0, plan.cechy.length - limit);
  const wiersze = plan.zuzycie && aktualny ? plan.zuzycie(aktualny) : [];

  const przycisk = plan.przycisk;
  const etykieta = wartosc(przycisk.etykieta, stan, '');
  const glowny = wartosc(przycisk.wyrozniony, stan, Boolean(plan.polecany));
  const wylaczony = Boolean(przycisk.ladowanie) || wartosc(przycisk.wylaczony, stan, false);
  const podpisDarmowy = plan.podpisDarmowy ?? PODPIS_DARMOWY;

  return (
    <Card
      data-plan={plan.id}
      data-biezacy={plan.biezacy ? 'true' : undefined}
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition-all duration-300',
        kompaktowy ? 'p-4 sm:p-5' : 'p-6 sm:p-7',
        wyroznione ? 'shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.3)]' : 'shadow-lg',
        className,
      )}
      /* Rant akcentu INLINE, nie klasą: `.nb-szklo` ustawia `border-color`
         poza warstwami Tailwinda, więc `border-primary/45` przegrywało
         (zmierzone na /cennik: każda karta miała `--foreground / 0.14`). */
      style={wyroznione ? { borderColor: 'hsl(var(--primary) / 0.45)' } : undefined}
    >
      {/* Subtelna poświata akcentu u góry — jak w eksporcie Artura */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 opacity-70"
        style={{ background: `radial-gradient(ellipse 90% 100% at 50% 0%, ${tintaAkcentu(kolor, 15)}, transparent 75%)` }}
      />

      <div>
        {/* Tytuł, plakietka bieżącego planu i rabat roczny */}
        <div className="mb-3">
          <div className="flex min-h-[32px] items-center justify-between gap-2">
            <h3 className={cn('font-heading font-bold tracking-tight text-foreground', kompaktowy ? 'text-lg' : 'text-xl sm:text-2xl')}>
              {plan.nazwa}
            </h3>
            <span className="flex shrink-0 items-center gap-1.5">
              {plan.biezacy && (
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-sans text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                  Twój plan
                </span>
              )}
              {rocznie && rabat > 0 && (
                <span className={cn('rounded-md bg-primary/15 px-2 py-0.5 font-sans text-[11.5px] font-bold text-primary', WEJSCIE_TEKSTU)}>
                  −{Math.round(rabat * 100)}%
                </span>
              )}
            </span>
          </div>
          <p className="mt-0.5 h-4 text-xs text-muted-foreground line-clamp-1">{plan.opis}</p>
        </div>

        {/* Cena — stała wysokość, żeby cztery karty trzymały jedną linię.
            Blok jest kontenerem zapytań: w wąskiej karcie (panel firmy, cztery
            w rzędzie) przekreślona cena bazowa znika, bo razem z ratą i „zł/m"
            wychodziła za krawędź. Rabat mówią wtedy plakietka i „Oszczędzasz". */}
        <div className="mb-4 [container-type:inline-size]">
          <div className="flex h-10 items-baseline gap-2 whitespace-nowrap">
            <span className={cn('font-heading font-bold text-foreground', kompaktowy ? 'text-3xl' : 'text-3xl sm:text-4xl')}>
              {darmowy ? 'Free' : <AnimLiczba wartosc={cena} miejsca={cena % 1 !== 0 ? 2 : 0} />}
            </span>
            {rocznie && cenaBazowa > cena && (
              <span className={cn('font-heading text-xl font-semibold text-foreground/25 line-through decoration-foreground/30 [@container(max-width:13rem)]:hidden', WEJSCIE_TEKSTU)}>
                {kwotaPl(cenaBazowa)}
              </span>
            )}
            {!darmowy && <span className="text-base font-normal text-muted-foreground">{plan.jednostkaCeny ?? 'zł/m'}</span>}
          </div>

          {/* `min-h`, nie `h`: w wąskiej karcie podpis łamie się na dwie linie i przy
              stałej wysokości nachodził na cenę. */}
          <div key={okres} data-podpis-ceny={okres} className="mt-1 flex min-h-[36px] flex-col justify-center space-y-0.5 text-[11.5px]">
            {rocznie ? (
              <>
                <p className={cn('font-light leading-tight text-muted-foreground', WEJSCIE_TEKSTU)}>
                  {/* Wariant brutto jest krótszy: w wąskiej karcie panelu firmy (176 px na tekst)
                      „Rozliczane rocznie — faktura … zł brutto" zostawiało samo „brutto" w drugiej linii. */}
                  {plan.brutto ? 'Rocznie ' : 'Rozliczane rocznie — faktura '}
                  <AnimLiczba wartosc={faktura} miejsca={miejscaKwoty(faktura)} /> {plan.brutto ? 'zł brutto' : 'PLN'}
                </p>
                <p className={cn('font-medium leading-tight text-primary', WEJSCIE_DRUGIE)}>
                  Oszczędzasz <AnimLiczba wartosc={oszczedzasz} miejsca={miejscaKwoty(oszczedzasz)} /> zł rocznie
                </p>
              </>
            ) : darmowy ? (
              <>
                <p className={cn('font-light leading-tight text-muted-foreground', WEJSCIE_TEKSTU)}>{podpisDarmowy[0]}</p>
                <p className={cn('font-light leading-tight text-muted-foreground/60', WEJSCIE_DRUGIE)}>{podpisDarmowy[1]}</p>
              </>
            ) : plan.brutto ? (
              /* Michał (12.10.2026) o cenniku firmowym: „rozliczane miesięcznie, anulujesz
                 w dowolnym momencie — nic nie wnosi"; pod ceną ma stać to, czy jest z podatkiem. */
              <p className={cn('font-light leading-tight text-muted-foreground', WEJSCIE_TEKSTU)}>cena brutto</p>
            ) : (
              <>
                <p className={cn('font-light leading-tight text-muted-foreground', WEJSCIE_TEKSTU)}>rozliczane miesięcznie</p>
                <p className={cn('font-light leading-tight text-muted-foreground/60', WEJSCIE_DRUGIE)}>anulujesz w dowolnym momencie</p>
              </>
            )}
          </div>
        </div>

        {/* Przycisk ZARAZ pod ceną — identyczna pozycja w pionie na każdej karcie */}
        <div className={kompaktowy ? 'mb-4' : 'mb-5'}>
          <Button
            type="button"
            variant={glowny ? 'glass' : 'obwodka'}
            size="lg"
            className="w-full px-4 text-[14.5px]"
            disabled={wylaczony}
            aria-busy={przycisk.ladowanie || undefined}
            data-akcja-planu={plan.id}
            onClick={() => przycisk.akcja(okres, prog, ilosc)}
          >
            {przycisk.ladowanie ? (
              <>
                <Loader2 className="animate-spin" />
                Ładowanie...
              </>
            ) : etykieta}
          </Button>
        </div>

        {/* Pula Byte + panel zużycia — wyrównane w pionie między kartami */}
        <div className={cn('space-y-3', kompaktowy ? 'mb-4' : 'mb-5')}>
          {plan.progi.length > 1 ? (
            <SuwakPuli progi={plan.progi} indeks={prog} onChange={setProg} kolor={kolor} etykieta={plan.etykietaPuli ?? 'Byte miesięcznie:'} />
          ) : aktualny ? (
            <WierszPuli prog={aktualny} kolor={kolor} etykieta={plan.etykietaPuli ?? 'Byte miesięcznie:'} bezPaska={plan.pulaBezPaska} />
          ) : null}

          {dodatek
            ? <SuwakDodatku dodatek={dodatek} ilosc={ilosc} onChange={setIlosc} kolor={kolor} rocznie={rocznie} jednostkaCeny={plan.jednostkaCeny} />
            : plan.dodatekZablokowany ? <DodatekZablokowanyWiersz dodatek={plan.dodatekZablokowany} kolor={kolor} /> : null}

          {wiersze.length > 0 && (
            <>
              {plan.naglowekZuzycia && (
                <p className="flex items-center gap-1.5 pt-1 text-[12px] font-semibold text-foreground">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  {plan.naglowekZuzycia}
                </p>
              )}
              <PanelZuzycia wiersze={wiersze} kolor={kolor} />
            </>
          )}
        </div>

        {/* Lista cech — nagłówek dziedziczenia („Wszystko z Lite, plus:") przychodzi z danych */}
        {plan.cechy.length > 0 && (
          <div className="space-y-2 border-t border-foreground/[0.08] pt-3">
            <p className="pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/50">
              {plan.naglowekCech ?? 'W pakiecie:'}
            </p>
            {plan.cechy.slice(0, limit).map((c) => <WierszCechy key={c.tekst} cecha={c} />)}
            {ukryte > 0 && (
              <Rozwijane otwarte={rozwiniete}>
                {plan.cechy.slice(limit).map((c) => <WierszCechy key={c.tekst} cecha={c} />)}
              </Rozwijane>
            )}
            {ukryte > 0 && (
              <button
                type="button"
                onClick={() => setRozwiniete((v) => !v)}
                aria-expanded={rozwiniete}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {rozwiniete ? 'Pokaż mniej' : `+${ukryte} więcej`}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', rozwiniete && 'rotate-180')} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
