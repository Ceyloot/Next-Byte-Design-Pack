import React, { useState } from 'react';
import { AlertTriangle, Bell, Check, Clock, Loader2, Palette, ShieldCheck, Trash2 } from 'lucide-react';
import { useMotywyPodgladu, BEZPIECZNE_ZMIENNE, RYZYKOWNE_ZMIENNE, type MotywPodgladu } from './useMotywyPodgladu';
import { ThemeScope } from './ThemeScope';
import { EdytorKomponentow } from './EdytorKomponentow';
import { SterowanieKursorem } from './SterowanieKursorem';
import { PodgladBiblioteki } from './PodgladBiblioteki';
import { Tile, TileHeader, TileRow, TilePill, TileAction, TileFooter } from '@/components/ui/tile';
import { Button } from '@/components/ui/button';

/**
 * BIBLIOTEKA KOMPONENTÓW NextByte — jedyne źródło prawdy o wyglądzie platformy.
 *
 * Po co: platforma ma 14 aktywnych motywów (6 płatnych, Luxury 500 Byte),
 * 9 wzorów i tła użytkownika. Każdy zaszyty na sztywno kolor w komponencie
 * cicho psuje PŁATNY produkt — ktoś kupuje motyw, który stosuje się w połowie
 * interfejsu. Dotąd nie było gdzie tego zobaczyć, więc każda zmiana wyglądu
 * była ruletką.
 *
 * Zasady tego pliku:
 *   • BAZA TYLKO DO ODCZYTU — zero zapisów, zero mutacji stanu globalnego.
 *   • Podgląd motywu scope'owany do kontenera (patrz ThemeScope), więc
 *     Panel Zarządu zachowuje motyw administratora.
 *   • Próbki komponentów używają WYŁĄCZNIE 22 zmiennych, które ustawia
 *     każdy z 14 motywów. Gdyby użyły czegokolwiek innego, piaskownica
 *     łamałaby zasadę, której ma pilnować.
 */

type Sekcja = 'biblioteka' | 'globalne' | 'kursor' | 'kontrakt' | 'komponenty' | 'motywy' | 'kafelek';

/* ─────────────────────────────────────────────────────────────
   PRÓBKA — kanoniczny zestaw: karta, wiersz, chipy, przyciski.
   Wszystko na tokenach shadcn, które mapują się na bezpieczne zmienne.
   ───────────────────────────────────────────────────────────── */
const Probka: React.FC<{ zwarta?: boolean }> = ({ zwarta }) => (
  <div className={`rounded-2xl border border-border bg-card ${zwarta ? 'p-3' : 'p-5'}`}>
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
        <Bell className="h-4 w-4 text-primary" />
      </span>
      <span className={`font-semibold text-card-foreground ${zwarta ? 'text-xs' : 'text-sm'}`}>
        Powiadomienia
      </span>
      <span className="ml-auto rounded-full border border-border bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
        2
      </span>
    </div>

    <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2.5">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className={`text-card-foreground ${zwarta ? 'text-[11px]' : 'text-xs'}`}>Włącz 2FA</span>
      <span className="ml-auto text-[10px] text-muted-foreground">nowe</span>
    </div>

    <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-2.5">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
      <span className={`text-card-foreground ${zwarta ? 'text-[11px]' : 'text-xs'}`}>Termin minął</span>
      <span className="ml-auto text-[10px] text-destructive">pilne</span>
    </div>

    {!zwarta && (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground">
          <Check className="h-3.5 w-3.5" />Zatwierdź
        </button>
        <button className="inline-flex h-9 items-center rounded-xl border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground">
          Anuluj
        </button>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-destructive px-3 text-xs font-semibold text-destructive-foreground">
          <Trash2 className="h-3.5 w-3.5" />Usuń
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />za 2 dni
        </span>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PRZED / PO — sedno „kafelkowości".
   Problemem nie jest, że jeden kafelek jest brzydki. Problemem jest, że TRZY
   kafelki na jednym ekranie mają trzy różne obwódki, cienie, promienie
   i trzy różne przyciski „Usuń". Klasy w `Przed` są przepisane 1:1 z produkcji
   (Dashboard.tsx i components/dashboard/) — nie są przesadzone dla efektu.
   ───────────────────────────────────────────────────────────── */
const Przed: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {/* wariant A — gradient + cień występujący w produkcji 7× */}
    <div
      className="nb-szklo nb-szklo-plynne nb-kafelek rounded-2xl border border-primary/20 p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Powiadomienia</span>
      </div>
      <div className="mb-2 rounded-lg border border-foreground/10 bg-muted/30 p-2.5 text-xs text-foreground">Włącz 2FA</div>
      <button className="h-8 rounded-lg border border-destructive/30 bg-destructive/15 px-3 text-[11px] font-medium text-destructive">
        Usuń
      </button>
    </div>

    {/* wariant B — inna obwódka, inny cień, inny promień, inny „Usuń" */}
    <div className="rounded-xl border border-primary/30 bg-card/60 p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-foreground">Bezpieczeństwo</span>
      </div>
      <div className="mb-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">Sesje aktywne: 3</div>
      <button className="h-9 rounded-full bg-destructive px-4 text-xs font-semibold text-destructive-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)]">
        <Trash2 className="mr-1 inline h-3 w-3" />Usuń
      </button>
    </div>

    {/* wariant C — jeszcze inaczej */}
    <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/[0.08] p-3.5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <span className="text-[13px] font-semibold text-foreground">Terminy</span>
      </div>
      <div className="mb-2 rounded-xl border border-border p-2.5 text-[11px] text-foreground">Umowa — wczoraj</div>
      <button className="h-7 rounded px-2 text-[11px] text-destructive underline">Usuń</button>
    </div>
  </div>
);

const Po: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Tile intencja="akcent">
      <TileHeader ikona={Bell} tytul="Powiadomienia" poPrawej={<TilePill>2</TilePill>} />
      <TileRow ikona={ShieldCheck} intencja="akcent" poPrawej="nowe">Włącz 2FA</TileRow>
      <TileFooter>
        <TileAction rodzaj="glowna" ikona={Check}>Zatwierdź</TileAction>
        <TileAction rodzaj="usun" ikona={Trash2}>Usuń</TileAction>
      </TileFooter>
    </Tile>

    <Tile>
      <TileHeader ikona={ShieldCheck} tytul="Bezpieczeństwo" podtytul="3 aktywne sesje" intencja="neutralna" />
      <TileRow poPrawej="Mac">Safari — Kraków</TileRow>
      <TileFooter>
        <TileAction rodzaj="wtorna">Szczegóły</TileAction>
        <TileAction rodzaj="usun" ikona={Trash2}>Usuń</TileAction>
      </TileFooter>
    </Tile>

    <Tile intencja="krytyczna" interaktywny>
      <TileHeader
        ikona={AlertTriangle}
        tytul="Terminy"
        intencja="krytyczna"
        poPrawej={<TilePill intencja="krytyczna">pilne</TilePill>}
      />
      <TileRow ikona={Clock} intencja="krytyczna" poPrawej="wczoraj">Umowa ramowa</TileRow>
      <TileFooter>
        <TileAction rodzaj="cicha">Odłóż</TileAction>
        <TileAction rodzaj="usun" ikona={Trash2}>Usuń</TileAction>
      </TileFooter>
    </Tile>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   GLOBALNY PRZYCISK — jeden komponent, 717 plików.
   Tu widać, czy zmiana wariantu trzyma się w KAŻDYM motywie. Wariant
   `nextbyte` jest domyślny: wpisanie <Button> bez `variant` daje właśnie to.
   ───────────────────────────────────────────────────────────── */
const Przyciski: React.FC = () => (
  <div className="flex flex-wrap items-center gap-2.5">
    <Button size="sm">Domyślny (nextbyte)</Button>
    <Button size="sm" variant="glass">Szkło</Button>
    <Button size="sm" variant="outline">Obwódka</Button>
    <Button size="sm" variant="ghost">Cichy</Button>
    <Button size="sm" variant="destructive">Usuń</Button>
    <span className="mx-1 h-6 w-px bg-border" aria-hidden />
    <TileAction rodzaj="glowna" ikona={Check}>Zatwierdź</TileAction>
    <TileAction rodzaj="wtorna">Szczegóły</TileAction>
    <TileAction rodzaj="cicha">Odłóż</TileAction>
    <TileAction rodzaj="usun" ikona={Trash2}>Usuń</TileAction>
  </div>
);

/* ─────────────────────────────────────────────────────────── */
const Etykieta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
    {children}
  </div>
);

const Probnik: React.FC<{ zmienna: string; wartosc?: string; ostrzezenie?: number }> = ({
  zmienna, wartosc, ostrzezenie,
}) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
    <span
      className="h-7 w-7 shrink-0 rounded-lg border border-border"
      style={{ background: wartosc ? `hsl(${wartosc})` : 'transparent' }}
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate font-mono text-[11px] text-card-foreground">{zmienna}</span>
      <span className="block truncate font-mono text-[10px] text-muted-foreground">
        {wartosc || 'brak w tym motywie'}
      </span>
    </span>
    {ostrzezenie !== undefined && (
      <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] text-destructive">
        {ostrzezenie}/14
      </span>
    )}
  </div>
);

export const BibliotekaTab: React.FC = () => {
  const { motywy, ladowanie, blad } = useMotywyPodgladu();
  const [sekcja, setSekcja] = useState<Sekcja>('biblioteka');
  const [wybrany, setWybrany] = useState<string | null>(null);

  if (ladowanie) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (blad) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        {blad}
      </div>
    );
  }

  const aktywny: MotywPodgladu | undefined =
    motywy.find((m) => m.id === wybrany) ?? motywy[0];

  const SEKCJE: { id: Sekcja; label: string }[] = [
    // Biblioteka jest PIERWSZA i domyślna: to ona pokazuje, co się dzieje
    // z każdym komponentem, a reszta sekcji to narzędzia do jej strojenia.
    { id: 'biblioteka', label: 'Biblioteka komponentów' },
    { id: 'globalne', label: 'Komponenty globalne' },
    { id: 'kursor', label: 'Płynny kursor' },
    { id: 'kafelek', label: 'Kafelek — przed / po' },
    { id: 'motywy', label: `Test motywów (${motywy.length})` },
    { id: 'komponenty', label: 'Galeria komponentów' },
    { id: 'kontrakt', label: 'Kontrakt tokenów' },
  ];

  return (
    <div className="space-y-5">
      {/* nagłówek */}
      <div className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">Biblioteka komponentów NextByte</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Każdy komponent globalny platformy w jednym miejscu, renderowany z tych
              samych plików co produkcja — więc to, co tu widać, dostaje użytkownik.
              Podgląd motywu działa <strong className="text-card-foreground">w obrębie kontenera</strong>,
              więc Twój motyw pozostaje nietknięty i widać komponent we wszystkich {motywy.length} motywach.
              Sekcja <strong className="text-card-foreground">Komponenty globalne</strong> jako jedyna
              ZAPISUJE do bazy: kręcisz tokenami u siebie, a dopiero „Publikuj" wypuszcza je
              na całą platformę.
            </p>
          </div>
        </div>
      </div>

      {/* przełącznik sekcji */}
      <div className="flex flex-wrap gap-2">
        {SEKCJE.map((s) => (
          <button
            key={s.id}
            onClick={() => setSekcja(s.id)}
            className={`h-9 rounded-xl border px-3.5 text-xs font-medium transition-colors ${
              sekcja === s.id
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-card-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── KOMPONENTY GLOBALNE — jedyna sekcja, ktora zapisuje do bazy ── */}
      {sekcja === 'biblioteka' && <PodgladBiblioteki motywy={motywy} />}

      {sekcja === 'globalne' && <EdytorKomponentow motywy={motywy} />}

      {sekcja === 'kursor' && <SterowanieKursorem />}

      {/* ── KAFELEK: PRZED / PO ── */}
      {sekcja === 'kafelek' && aktywny && (
        <div className="space-y-5">
          <div className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-card p-5">
            <p className="max-w-3xl text-sm text-muted-foreground">
              Zmierzone 30.07.2026 na Panelu Głównym i jego komponentach (21 plików, 4658 linii):
              <strong className="text-card-foreground"> 35 różnych cieni, 31 obramowań, 51 tł</strong>.
              27 cieni pisanych ręcznie, 25 użytych dokładnie raz.
              <strong className="text-card-foreground"> 18 z 21 plików skleja sobie własny kafelek,
              0 z 21 sięga po wspólny system.</strong> Poniżej po lewej trzy kafelki w dzisiejszym
              stylu — klasy przepisane 1:1 z produkcji. Po prawej te same treści na jednym kafelku.
            </p>
          </div>

          {/* wybór motywu — bo cała rzecz stoi na tym, czy działa w każdym */}
          <div className="flex flex-wrap gap-2">
            {motywy.map((m) => (
              <button
                key={m.id}
                onClick={() => setWybrany(m.id)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] transition-colors ${
                  aktywny.id === m.id
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {m.displayName}
              </button>
            ))}
          </div>

          <div>
            <Etykieta>Przed — trzy kafelki, trzy różne „Usuń"</Etykieta>
            <ThemeScope motyw={aktywny} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-background p-5">
              <Przed />
            </ThemeScope>
          </div>

          <div>
            <Etykieta>Po — jeden kafelek, zmienia się tylko treść</Etykieta>
            <ThemeScope motyw={aktywny} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-background p-5">
              <Po />
            </ThemeScope>
          </div>

          <div>
            <Etykieta>Globalny przycisk — jeden komponent, 717 plików</Etykieta>
            <p className="mb-3 max-w-3xl text-xs text-muted-foreground">
              Wariant <code className="rounded bg-muted px-1 font-mono text-[11px]">nextbyte</code> jest
              domyślny — <code className="rounded bg-muted px-1 font-mono text-[11px]">&lt;Button&gt;</code> bez
              podanego wariantu daje właśnie ten wygląd. Dlatego zmiana tutaj zmienia przycisk
              w całej platformie. Przełącz motywy powyżej i sprawdź, czy obwódka i wypełnienie
              są widoczne w każdym — zwłaszcza w jasnych.
            </p>
            <ThemeScope motyw={aktywny} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-background p-5">
              <Przyciski />
            </ThemeScope>
          </div>

          <div>
            <Etykieta>Po — ten sam zestaw we wszystkich {motywy.length} motywach</Etykieta>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {motywy.map((m) => (
                <div key={m.id} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-card p-3">
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-card-foreground">{m.displayName}</span>
                    {m.isPurchasable && (
                      <span className="shrink-0 rounded-full bg-primary/[0.12] px-2 py-0.5 font-mono text-[10px] text-primary">
                        {m.bytePrice} ⟠
                      </span>
                    )}
                  </div>
                  <ThemeScope motyw={m} className="rounded-xl bg-background p-3">
                    <Tile intencja="akcent" zwarty>
                      <TileHeader ikona={Bell} tytul="Powiadomienia" poPrawej={<TilePill>2</TilePill>} />
                      <TileRow ikona={ShieldCheck} intencja="akcent" poPrawej="nowe">Włącz 2FA</TileRow>
                      <TileFooter>
                        <TileAction rodzaj="glowna" ikona={Check}>Zatwierdź</TileAction>
                        <TileAction rodzaj="usun" ikona={Trash2}>Usuń</TileAction>
                      </TileFooter>
                    </Tile>
                  </ThemeScope>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TEST MOTYWÓW ── */}
      {sekcja === 'motywy' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {motywy.map((m) => (
            <div key={m.id} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-card p-3">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="truncate text-xs font-semibold text-card-foreground">{m.displayName}</span>
                {m.isPurchasable && (
                  <span className="shrink-0 rounded-full bg-primary/[0.12] px-2 py-0.5 font-mono text-[10px] text-primary">
                    {m.bytePrice} ⟠
                  </span>
                )}
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  {Object.keys(m.zmienne).length} zm.
                </span>
              </div>
              {/* podgląd żyje TU, w swoim kontenerze */}
              <ThemeScope motyw={m} className="rounded-xl bg-background p-3">
                <Probka zwarta />
              </ThemeScope>
            </div>
          ))}
        </div>
      )}

      {/* ── GALERIA KOMPONENTÓW ── */}
      {sekcja === 'komponenty' && aktywny && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {motywy.map((m) => (
              <button
                key={m.id}
                onClick={() => setWybrany(m.id)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] transition-colors ${
                  aktywny.id === m.id
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {m.displayName}
              </button>
            ))}
          </div>
          <ThemeScope motyw={aktywny} className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-background p-6">
            <Probka />
          </ThemeScope>
        </div>
      )}

      {/* ── KONTRAKT TOKENÓW ── */}
      {sekcja === 'kontrakt' && aktywny && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {motywy.map((m) => (
              <button
                key={m.id}
                onClick={() => setWybrany(m.id)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] transition-colors ${
                  aktywny.id === m.id
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {m.displayName}
              </button>
            ))}
          </div>

          <div>
            <Etykieta>Bezpieczne — ustawia je każdy z {motywy.length} motywów</Etykieta>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {BEZPIECZNE_ZMIENNE.map((z) => (
                <Probnik key={z} zmienna={z} wartosc={aktywny.zmienne[z]} />
              ))}
            </div>
          </div>

          <div>
            <Etykieta>Ryzykowne — ilu motywów faktycznie je definiuje</Etykieta>
            <p className="mb-3 max-w-3xl text-xs text-muted-foreground">
              Komponent oparty na tych zmiennych zadziała u części użytkowników, a u reszty
              odziedziczy wartość z motywu domyślnego. Efekt: wygląd zależy od tego, jaki
              motyw ktoś kupił. Używać wyłącznie z jawnym fallbackiem.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(RYZYKOWNE_ZMIENNE)
                .sort((a, b) => a[1] - b[1])
                .map(([z, ile]) => (
                  <Probnik key={z} zmienna={z} wartosc={aktywny.zmienne[z]} ostrzezenie={ile} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibliotekaTab;
