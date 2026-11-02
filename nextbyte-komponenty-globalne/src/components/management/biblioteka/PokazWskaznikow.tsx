import React from 'react';
import { Tile, TileHeader, TileRow } from '@/components/ui/tile';
import { Button } from '@/components/ui/button';
import {
  Okno, OknoWyzwalacz, OknoTresc, OknoNaglowek, OknoCialo, OknoStopka,
} from '@/components/ui/okno';
import { Luk, Pierscien, PasekZasobu, PasekRozkladu, KartaMetryki, stanZProcentu } from '@/components/ui/wskazniki';
import {
  Users, CreditCard, Coins, TrendingUp, Database, HardDrive,
  Table2, MessageSquare, Activity, Trash2, Settings2, Sparkles,
} from 'lucide-react';
// Kurs z jednego źródła — patrz kursWalutyParytet.test.ts, który tego pilnuje.
import { kursUsdPln } from '@/lib/wartosc-byte';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POKAZ WSKAŹNIKÓW I OKIEN — sekcje Biblioteki komponentów
 * ════════════════════════════════════════════════════════════════════════
 *
 * WYCIĘTE ZE STRONY DEWELOPERSKIEJ, bo Michał zauważył brak w Zarządzie:
 * „w panelu zarządu nie ma komponentów Okna / Paski zasobu / Pierścienie /
 * Łuki / Rząd metryk". Sekcje siedziały bezpośrednio w `pages/dev/PodgladZarzad`
 * — do Biblioteki trafił tylko `PokazKomponentow`, więc Zarząd pokazywał
 * bibliotekę bez wskaźników. Ten plik jest teraz jedynym źródłem tych sekcji;
 * strona dev i Zarząd renderują to samo.
 *
 * Liczby są PRAWDZIWE (zmierzone w produkcyjnej bazie), ale STATYCZNE —
 * to pokaz komponentów, nie monitoring. Żywe dane ma Przegląd Zarządu.
 */

/** Wartości zmierzone w produkcyjnej bazie 31.07.2026 — żeby proporcje były prawdziwe. */
/* PACZKA: liczby PRZYKŁADOWE (fikcyjne), tylko do pokazu wyglądu wskaźników. */
const DANE = {
  uzytkownicy: 1200,
  nowi7: 40,
  subskrypcje: 120,
  zakupyStripe: 300,
  przychod: 10000,
  byteWObiegu: 100_000,
  kosztAI30dni: 50,
  ticketyOtwarte: 5,
  bazaBajty: 2 * 1024 ** 3,
  bazaLimit: 8 * 1024 ** 3,
  magazynBajty: 40 * 1024 ** 3,
  magazynLimit: 100 * 1024 ** 3,
  plikow: 10000,
  tabel: 300,
};

/** Podpisy osi X dla przebiegów w kartach metryk — osiem tygodni wstecz. */
const TYGODNIE = ['16 cze', '23 cze', '30 cze', '7 lip', '14 lip', '21 lip', '28 lip', '2 sie'];

const bajty = (b: number) => {
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)} GB`;
  if (b >= 1024 ** 2) return `${Math.round(b / 1024 ** 2)} MB`;
  return `${Math.round(b / 1024)} KB`;
};

export const PokazWskaznikow: React.FC = () => {
  const procentBazy = (DANE.bazaBajty / DANE.bazaLimit) * 100;
  const procentMagazynu = (DANE.magazynBajty / DANE.magazynLimit) * 100;
  const procentMau = (DANE.uzytkownicy / 100_000) * 100;

  return (
    <div className="space-y-6">
          {/* ══ RZĄD METRYK ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Rząd metryk — każda liczba we własnej karcie, z deltą i przebiegiem
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {/* Podpisy punktów: bez nich najechanie mówi „punkt 5", z nimi
                  „16 cze · 61" — czyli dopiero wtedy ma sens. */}
              <KartaMetryki
                etykieta="Użytkownicy" wartosc={DANE.uzytkownicy}
                delta="+4,6%" kierunek="wzrost" wzrostToDobrze
                podpis={`+${DANE.nowi7} w tym tygodniu`}
                seria={[700, 780, 850, 910, 990, 1060, 1130, 1200]}
                etykietySerii={TYGODNIE}
                ikona={<Users className="h-3.5 w-3.5" />}
              />
              <KartaMetryki
                etykieta="Subskrypcje" wartosc={DANE.subskrypcje}
                delta="-20%" kierunek="spadek" wzrostToDobrze
                podpis="aktywne abonamenty"
                seria={[90, 95, 100, 104, 108, 112, 116, 120]}
                etykietySerii={TYGODNIE}
                ikona={<CreditCard className="h-3.5 w-3.5" />}
              />
              <KartaMetryki
                etykieta="Byte w obiegu" wartosc={DANE.byteWObiegu.toLocaleString('pl-PL')} jednostka="⟠"
                delta="+8,1%" kierunek="wzrost" wzrostToDobrze
                podpis="na kontach użytkowników"
                seria={[70000, 74000, 78000, 83000, 87000, 91000, 96000, 100000]}
                etykietySerii={TYGODNIE}
                formatujSerie={(v) => `${v.toLocaleString('pl-PL')} ⟠`}
                ikona={<Coins className="h-3.5 w-3.5" />}
              />
              <KartaMetryki
                etykieta="Koszt AI / 30 dni" wartosc={`$${DANE.kosztAI30dni.toFixed(2)}`}
                delta="+31%" kierunek="wzrost" wzrostToDobrze={false}
                podpis={`~${(DANE.kosztAI30dni * kursUsdPln()).toFixed(0)} zł`}
                seria={[20, 24, 27, 31, 36, 40, 45, 50]}
                etykietySerii={TYGODNIE}
                formatujSerie={(v) => `$${v.toFixed(2)}`}
                ikona={<TrendingUp className="h-3.5 w-3.5" />}
              />
            </div>
          </section>

          {/* ══ ŁUKI ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Łuki — jedna liczba w skali limitu
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={procentBazy} etykieta="Baza danych"
                       podpis={`${bajty(DANE.bazaBajty)} z ${bajty(DANE.bazaLimit)}`} />
                </div>
              </Tile>
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={procentMagazynu} etykieta="Magazyn plików"
                       podpis={`${bajty(DANE.magazynBajty)} z ${bajty(DANE.magazynLimit)}`} />
                </div>
              </Tile>
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={82} etykieta="Przykład: ostrzeżenie" podpis="próg 75%" />
                </div>
              </Tile>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={96} etykieta="Przykład: krytyczny" podpis="próg 90%" />
                </div>
              </Tile>
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={0} etykieta="Przykład: zero" podpis="pusty stan" />
                </div>
              </Tile>
              <Tile>
                <div className="flex justify-center py-2">
                  <Luk procent={100} etykieta="Przykład: pełny" podpis="limit wyczerpany" />
                </div>
              </Tile>
            </div>
          </section>

          {/* ══ PIERŚCIENIE ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pierścienie — liczba bezwzględna z udziałem
            </h2>
            <Tile>
              <TileHeader tytul="Stan platformy"
                          podtytul="liczby bezwzględne, pierścień pokazuje udział w limicie" />
              <div className="grid grid-cols-2 gap-6 py-2 sm:grid-cols-3 lg:grid-cols-5">
                <Pierscien wartosc={DANE.uzytkownicy} procent={procentMau} etykieta="Użytkownicy" />
                <Pierscien wartosc={DANE.subskrypcje} procent={(DANE.subskrypcje / DANE.uzytkownicy) * 100}
                           etykieta="Subskrypcje" stan="dobry" />
                <Pierscien wartosc={DANE.plikow.toLocaleString('pl-PL')} procent={procentMagazynu}
                           etykieta="Plików w magazynie" />
                <Pierscien wartosc={DANE.tabel} procent={62} etykieta="Tabel w bazie" />
                <Pierscien wartosc={DANE.ticketyOtwarte} procent={DANE.ticketyOtwarte > 0 ? 20 : 0}
                           etykieta="Otwarte tickety"
                           stan={DANE.ticketyOtwarte > 3 ? 'krytyczny' : 'dobry'} />
              </div>
            </Tile>
          </section>

          {/* ══ PASKI ZASOBU ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paski zasobu — wzorowane na Usage Summary
            </h2>
            <Tile>
              <TileHeader tytul="Wykorzystanie zasobów"
                          podtytul="mierzone we własnej bazie — bez zewnętrznego API" />
              <div className="divide-y divide-border">
                <PasekZasobu etykieta="Rozmiar bazy danych" uzyte={bajty(DANE.bazaBajty)}
                             limit={bajty(DANE.bazaLimit)} procent={procentBazy} />
                <PasekZasobu etykieta="Magazyn plików" uzyte={bajty(DANE.magazynBajty)}
                             limit={bajty(DANE.magazynLimit)} procent={procentMagazynu} />
                <PasekZasobu etykieta="Użytkownicy miesięcznie" uzyte={String(DANE.uzytkownicy)}
                             limit="100 000" procent={procentMau} />
                <PasekZasobu etykieta="Przykład: blisko limitu" uzyte="78 GB" limit="100 GB" procent={78} />
                <PasekZasobu etykieta="Przykład: przekroczony" uzyte="97 GB" limit="100 GB" procent={97} />
                <PasekZasobu etykieta="Transfer wychodzący" uzyte="—" limit={null} procent={null} />
                <PasekZasobu etykieta="Wywołania funkcji edge" uzyte="—" limit={null} procent={null} />
              </div>
              <TileRow className="mt-1 text-xs text-muted-foreground">
                Pozycje „niemierzalne" wymagałyby Management API Supabase — świadomie
                nie pokazujemy tam zmyślonej liczby.
              </TileRow>
            </Tile>

          </section>

          {/* ══ PASKI ROZKŁADU ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paski rozkładu — jedna całość podzielona na części
            </h2>
            <Tile>
              <TileHeader tytul="Lejek onboardingu"
                          podtytul="ten sam materiał co pasek zasobu, ale bez progów limitu — bo tu wysoki procent to dobra wiadomość" />
              <div className="divide-y divide-border">
                <PasekRozkladu
                  mocna etykieta="Rejestracja" calosc={147} procent={100}
                  opisWartosci={<>147 <span className="opacity-60">z 147</span></>}
                  czesci={[{ etykieta: 'poszli dalej', wartosc: 147 }]}
                />
                <PasekRozkladu
                  mocna etykieta="Ankieta: narzędzia" calosc={147} procent={22} procentAlarm
                  opisWartosci={<>33 <span className="opacity-60">z 147</span></>}
                  czesci={[
                    { etykieta: 'poszli dalej', wartosc: 33, ton: 'akcent' },
                    { etykieta: 'utknęli', wartosc: 114, ton: 'alarm' },
                  ]}
                />
                <PasekRozkladu
                  mocna etykieta="Chat AI" calosc={27} procent={33}
                  opisWartosci={<>9 <span className="opacity-60">z 27</span></>}
                  czesci={[
                    { etykieta: 'poszli dalej', wartosc: 9, ton: 'akcent' },
                    { etykieta: 'pominęli', wartosc: 15, ton: 'cichy' },
                    { etykieta: 'utknęli', wartosc: 3, ton: 'alarm' },
                  ]}
                />
                <PasekRozkladu
                  etykieta="Jedna część — rozkład odpowiedzi" calosc={33}
                  opisWartosci={30}
                  czesci={[{ etykieta: 'wybrało', wartosc: 30 }]}
                />
              </div>
              <TileRow className="mt-1 text-xs text-muted-foreground">
                Pasek zasobu mówi „ile zostało do limitu", ten mówi „na co rozeszła się
                całość". Dlatego nie ma znaczników 75/90 i nie czerwienieje od samej
                wysokości — czerwień niesie KATEGORIA, nie poziom.
              </TileRow>
            </Tile>
          </section>

          {/* ══ POPUPY ══ */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Okna — jeden schemat, treść z globalnych komponentów
            </h2>
            <Tile>
              <TileHeader
                tytul="Schemat okna dialogowego"
                podtytul="nakładka na istniejący Dialog — te same zachowania, nowy chrom"
              />
              <div className="flex flex-wrap gap-2.5">
                {/* zwykłe */}
                <Okno>
                  <OknoWyzwalacz asChild>
                    <Button variant="glass" size="sm">Okno zwykłe</Button>
                  </OknoWyzwalacz>
                  <OknoTresc intencja="akcent">
                    <OknoNaglowek
                      intencja="akcent"
                      etykieta="Aktualizacja"
                      ikona={<Sparkles />}
                      tytul="Nowa wersja platformy"
                      podtytul="Zmiany, które właśnie weszły na Twoje konto"
                    />
                    <OknoCialo>
                      {/* BEZ zagnieżdżonych obwódek. Okno ma już swoją ramkę —
                          kafelek w środku, a w nim wiersze z własnymi ramkami,
                          dawały trzy prostokąty jeden w drugim i to była główna
                          przyczyna „taniego" wrażenia. Wiersze rozdziela sama
                          włosowa linia. */}
                      {/* Ciało dziedziczy `text-card-foreground` z `OknoCialo`.
                          Trzy poziomy szarości pod rząd (podtytuł → akapit →
                          lista) zlewały się w jedną plamę; teraz akapit jest
                          treścią, a nie kolejnym podtytułem. */}
                      <p>Treść okna korzysta wyłącznie z globalnych komponentów.</p>
                      <ul className="mt-4 divide-y divide-border/60">
                        {[
                          ['Wskaźniki', 'łuki, pierścienie i paski zasobu'],
                          ['Plakietki', 'jeden wygląd zamiast 516'],
                          ['Lista wyboru', 'wybór modelu i każde inne menu'],
                        ].map(([co, opis]) => (
                          <li key={co} className="flex items-baseline justify-between gap-4 py-2.5">
                            <span className="font-medium text-card-foreground">{co}</span>
                            <span className="text-right text-xs text-muted-foreground">{opis}</span>
                          </li>
                        ))}
                      </ul>
                    </OknoCialo>
                    <OknoStopka>
                      <Button variant="cichy" size="sm">Później</Button>
                      <Button variant="glass" size="sm">Zobacz zmiany</Button>
                    </OknoStopka>
                  </OknoTresc>
                </Okno>

                {/* krytyczne */}
                <Okno>
                  <OknoWyzwalacz asChild>
                    <Button variant="usun" size="sm">Okno krytyczne</Button>
                  </OknoWyzwalacz>
                  <OknoTresc intencja="krytyczna" rozmiar="maly">
                    <OknoNaglowek
                      intencja="krytyczna"
                      etykieta="Operacja nieodwracalna"
                      ikona={<Trash2 />}
                      tytul="Usunąć bezpowrotnie?"
                      podtytul="Tej operacji nie da się cofnąć."
                    />
                    <OknoCialo>
                      <p className="text-sm text-muted-foreground">
                        Zostaną usunięte wszystkie powiązane dane. Upewnij się, że masz kopię.
                      </p>
                    </OknoCialo>
                    <OknoStopka>
                      <Button variant="cichy" size="sm">Anuluj</Button>
                      <Button variant="usun" size="sm">Usuń</Button>
                    </OknoStopka>
                  </OknoTresc>
                </Okno>

                {/* duże, z długą treścią */}
                <Okno>
                  <OknoWyzwalacz asChild>
                    <Button variant="obwodka" size="sm">Okno duże (długa treść)</Button>
                  </OknoWyzwalacz>
                  <OknoTresc rozmiar="duzy" intencja="akcent">
                    <OknoNaglowek
                      intencja="akcent"
                      etykieta="Infrastruktura · 31.07.2026"
                      ikona={<Database />}
                      tytul="Wykorzystanie zasobów"
                      podtytul="Ciało okna przewija się samo — nagłówek i stopka zostają"
                    />
                    <OknoCialo>
                      <div className="divide-y divide-border">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <PasekZasobu
                            key={i}
                            etykieta={`Zasób przykładowy ${i + 1}`}
                            uzyte={`${(i + 1) * 7} GB`}
                            limit="100 GB"
                            procent={(i + 1) * 9}
                          />
                        ))}
                      </div>
                    </OknoCialo>
                    <OknoStopka>
                      <Button variant="cichy" size="sm">Zamknij</Button>
                      <Button variant="glass" size="sm">Odśwież</Button>
                    </OknoStopka>
                  </OknoTresc>
                </Okno>
              </div>
            </Tile>
          </section>
    </div>
  );
};
