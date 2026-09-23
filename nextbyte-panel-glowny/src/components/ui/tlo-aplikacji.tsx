import React from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  TŁO APLIKACJI — to, co szkło ma przepuszczać
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „czemu te kafelki dalej są szare, a nie jest to liquid glass".
 *
 * ── ODPOWIEDŹ ZMIERZONA, NIE ZGADNIĘTA (03.08.2026) ─────────────────────
 * Materiał szkła DZIAŁA. Zmierzone na karcie Panelu Głównego:
 *   backdrop-filter: url(#nb-refrakcja-delikatne) saturate(1.8) blur(14px) …
 * czyli refrakcja krawędzi, nasycenie i rozmycie są nałożone poprawnie.
 *
 * Tyle że `AppShell` miał pod spodem `bg-background`, a `--background` to
 * `0 0% 2%` — JEDNOLITA PŁASZCZYZNA. Rozmycie jednolitej płaszczyzny daje
 * tę samą jednolitą płaszczyznę. Szkło bez niczego pod spodem nie jest szkłem,
 * tylko szarą płytą — i dokładnie tak to wyglądało.
 *
 * Nie było więc czego naprawiać w szkle. Brakowało ŚWIATŁA POD NIM.
 *
 * ── DLACZEGO TAK, A NIE ZDJĘCIE W TLE ───────────────────────────────────
 * Zdjęcie walczyłoby z treścią i z ustawionym przez użytkownika wzorem,
 * a przy 14 motywach nie da się dobrać jednego, które pasuje do wszystkich.
 * Tutaj są trzy miękkie plamy światła liczone WYŁĄCZNIE z `--primary`
 * i `--background`, czyli z tokenów, które ustawia każdy motyw. Zmiana motywu
 * przemalowuje tło razem z resztą platformy i nie trzeba niczego dopisywać.
 *
 * Krycie jest niskie z premedytacją: to ma być gradient, który widać dopiero
 * PRZEZ szkło i przy krawędziach kart. Gdy zaczyna być widoczny sam z siebie,
 * robi się tapetą i zabiera uwagę treści.
 *
 * ── DLACZEGO NIE ANIMUJEMY ──────────────────────────────────────────────
 * Kuszące, ale to warstwa pod KAŻDYM ekranem aplikacji. Ruch pod półprzezroczystą
 * kartą zmusza przeglądarkę do przeliczania `backdrop-filter` w każdej klatce —
 * na każdej karcie naraz. Statyczne tło kosztuje tyle, co malowanie gradientu raz.
 */
/**
 * PLAMA ŚWIATŁA: barwa z akcentu + stałe rozjaśnienie neutralne.
 *
 * Najpierw było `hsl(var(--primary) / 0.55)`, czyli akcent nałożony z alfą.
 * Efekt zależał wtedy od tego, jak jasny i nasycony jest akcent motywu:
 * na Ciemnym wyglądał dobrze, na Lime zalewał górę ekranu limonką — karty
 * robiły się żółtozielone i całość czytała się jak filtr nałożony na aplikację,
 * a nie jak światło pod nią.
 *
 * `color-mix` z tłem usuwa tę zależność od alfy, ale sam nie wystarcza:
 * miesza percepcyjnie (oklab), a nie po luminancji.
 *
 * Sama barwa nie wystarcza, bo `color-mix` w oklab miesza percepcyjnie, a nie
 * po luminancji. Zmierzone na wszystkich dziewięciu motywach: przy 18% czystego
 * akcentu odstęp jasności plamy od tła wynosił od **4,2** (Smoczy — czerwień
 * `0 91% 60%` na czystej czerni) do **29,7** (Lime). Na Smoczym poświaty
 * praktycznie nie było widać, bo czerwień ma niską luminancję (kanał czerwony
 * waży 0,21, zielony 0,72).
 *
 * Domieszka `--foreground` daje podłogę niezależną od barwy akcentu: na ciemnych
 * motywach to biel, na jasnych czerń, więc zawsze pcha plamę W STRONĘ kontrastu
 * z tłem. Po zmianie zakres to 9,3–35,2 — Smoczy wychodzi z niewidoczności,
 * a reszta trzyma się przedziału, w którym poświatę widać, ale nie dominuje.
 *
 * Wartości dobrane pomiarem na canvasie (rasteryzacja `color-mix` i odczyt
 * piksela), nie na oko — `color-mix` zwraca `oklab(…)`, którego nie da się
 * porównać z tłem bez rasteryzacji.
 */
const plama = (barwa: number, neutral: number) =>
  'radial-gradient(circle, color-mix(in oklab, hsl(var(--foreground)) '
  + `calc(${neutral}% * var(--nb-plama-nasycenie, 1)), color-mix(in oklab, hsl(var(--primary)) calc(${barwa}% * var(--nb-plama-nasycenie, 1)), hsl(var(--background)))), transparent 70%)`;

export const TloAplikacji: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Najjaśniejszy punkt sceny — góra-lewo. */}
    <div
      className="absolute -left-[15%] -top-[25%] h-[70%] w-[65%] rounded-full blur-[90px]"
      style={{ background: plama(19, 7) }}
    />
    {/* Przeciwwaga po prawej, niżej — żeby światło miało kierunek, a nie środek. */}
    <div
      className="absolute -right-[10%] top-[10%] h-[60%] w-[50%] rounded-full blur-[100px]"
      style={{ background: plama(13, 5) }}
    />
    {/* Dół: NEUTRALNE rozjaśnienie z `--foreground`, nie kolejny akcent.
        Trzecia plama w tym samym kolorze robiła z tła jednolitą poświatę;
        biel (na ciemnych) i czerń (na jasnych) dokłada zmienność JASNOŚCI,
        a to ona sprawia, że szkło ma co załamywać. */}
    <div
      className="absolute -bottom-[30%] left-[20%] h-[60%] w-[70%] rounded-full blur-[110px]"
      style={{
        background:
          'radial-gradient(circle, color-mix(in oklab, hsl(var(--foreground)) 6%, hsl(var(--background))), transparent 70%)',
      }}
    />
    {/* Winieta wraca do koloru tła na brzegach — bez niej plamy urywają się
        na krawędzi okna i widać, że to trzy koła, a nie oświetlenie sceny. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 40%, transparent 40%, hsl(var(--background) / 0.6) 100%)',
      }}
    />
  </div>
);
