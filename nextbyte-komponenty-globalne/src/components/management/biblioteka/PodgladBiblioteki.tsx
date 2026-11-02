import React from 'react';
import { BibliotekaKomponentow } from './BibliotekaKomponentow';
import { PokazWskaznikow } from './PokazWskaznikow';
import { ThemeScope } from './ThemeScope';
import { PatternBackground } from '@/components/ui/background-patterns';
import type { MotywPodgladu } from './useMotywyPodgladu';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PODGLĄD BIBLIOTEKI — biblioteka komponentów wewnątrz Panelu Zarządu
 * ════════════════════════════════════════════════════════════════════════
 *
 * WSZYSTKO JEST ZAMKNIĘTE W KONTENERZE — i to jest cały sens tego pliku.
 *
 * Deweloperska strona `/dev/podglad-zarzad` może pisać zmienne motywu na
 * `<html>`, dokładać klasę stylu szkła do korzenia i kłaść tło jako
 * `fixed inset-0`, bo jest sama na ekranie. W Panelu Zarządu każda z tych
 * rzeczy przemalowałaby administratorowi CAŁĄ platformę: motyw, szkło i tło
 * pod jego własnym interfejsem. Biblioteka istnieje właśnie po to, żeby tak
 * NIE było — i ten podgląd musi tej zasady pilnować tak samo.
 *
 * Trzy przeniesienia:
 *   • motyw  → `ThemeScope` (zmienne na divie, nie na `<html>`),
 *   • szkło  → klasa `nb-styl-klasyczny` na kontenerze; selektor w `index.css`
 *              jest potomny (`.nb-styl-klasyczny .nb-szklo`), więc działa
 *              identycznie z korzenia i z diva,
 *   • tło    → `absolute inset-0` wewnątrz kontenera zamiast `fixed`.
 *
 * Zmienne szkła liczy `lib/szklo-motywu` — ta sama funkcja, z której korzysta
 * `useGlobalTheme` na produkcji. Gdyby podgląd miał własną kopię, pokazywałby
 * inne szkło niż platforma, czyli kłamałby w jedynej rzeczy, po którą się tu
 * przychodzi.
 */

/** Wzory ze sklepu — wartości przepisane z produkcyjnej `profile_patterns`. */
const WZORY = [
  { klucz: 'brak', nazwa: 'Bez wzoru' },
  { klucz: 'cyber', nazwa: 'Cyber Dots', typ: 'dots' as const, kolor: '#70BEFA', rozmiar: 20, krycie: 0.4 },
  { klucz: 'zielone', nazwa: 'Zielone Dots', typ: 'dots' as const, kolor: '#00FF88', rozmiar: 16, krycie: 0.4 },
  { klucz: 'zlote', nazwa: 'Złote Plus', typ: 'plus' as const, kolor: '#ffd900', rozmiar: 50, krycie: 0.3 },
];

const Przelacznik: React.FC<{
  aktywny: boolean;
  onClick: () => void;
  tytul?: string;
  children: React.ReactNode;
}> = ({ aktywny, onClick, tytul, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={tytul}
    aria-pressed={aktywny}
    className={`h-8 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      aktywny
        ? 'border-primary/50 bg-primary/15 text-primary'
        : 'border-border bg-card text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

export const PodgladBiblioteki: React.FC<{ motywy: MotywPodgladu[] }> = ({ motywy }) => {
  const [idMotywu, setIdMotywu] = React.useState<string | null>(null);
  const [stylKlasyczny, setStylKlasyczny] = React.useState(false);
  const [wzor, setWzor] = React.useState(0);

  const motyw = motywy.find((m) => m.id === idMotywu) ?? motywy[0];
  if (!motyw) return null;

  /*
    Zmienne szkła DOKŁADA JUŻ `ThemeScope` (05.08.2026). Wcześniej liczył je
    tutaj tylko ten jeden podgląd, a osiem pozostałych wywołań `ThemeScope`
    dziedziczyło je z motywu administratora — patrz komentarz w `ThemeScope`.
  */
  const zmienne = motyw.zmienne;

  return (
    <div className="space-y-4">
      {/* ── sterowanie podglądem ── */}
      <div className="nb-szklo nb-szklo-plynne flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Motyw podglądu
        </span>
        {motywy.map((m) => (
          <Przelacznik key={m.id} aktywny={m.id === motyw.id} onClick={() => setIdMotywu(m.id)}>
            {m.displayName ?? m.name}
          </Przelacznik>
        ))}

        <span className="mx-1 h-5 w-px bg-border" />

        <Przelacznik
          aktywny={wzor > 0}
          onClick={() => setWzor((w) => (w + 1) % WZORY.length)}
          tytul="Wzory kupowane w sklepie — wartości z produkcyjnej bazy"
        >
          {WZORY[wzor].nazwa}
        </Przelacznik>

        <Przelacznik
          aktywny={stylKlasyczny}
          onClick={() => setStylKlasyczny((v) => !v)}
          tytul="1 = szkło płynne (nasycenie, załamanie, adaptacja jasności); 2 = klasyczne (samo rozmycie)"
        >
          Styl szkła: {stylKlasyczny ? '2' : '1'}
        </Przelacznik>
      </div>

      {/* ── podgląd ── */}
      <ThemeScope
        motyw={{ ...motyw, zmienne }}
        className={`relative overflow-hidden rounded-2xl border border-border bg-background p-4 ${
          stylKlasyczny ? 'nb-styl-klasyczny' : ''
        }`}
      >
        {wzor > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <PatternBackground
              pattern_type={WZORY[wzor].typ!}
              pattern_color={WZORY[wzor].kolor!}
              pattern_size={WZORY[wzor].rozmiar!}
              pattern_opacity={WZORY[wzor].krycie!}
              background_color="transparent"
              fade
            />
          </div>
        )}

        <div className="relative z-10 space-y-6">
          {/* Wskaźniki i okna PRZED resztą — to od nich zaczyna się ocena
              stylu i to ich brak w Zarządzie wytknął Michał. */}
          <PokazWskaznikow />
          <BibliotekaKomponentow />
        </div>
      </ThemeScope>
    </div>
  );
};
