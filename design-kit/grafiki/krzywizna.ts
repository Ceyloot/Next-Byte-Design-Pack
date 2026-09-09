/* ═══════════════════════════════════════════════════════════════════════
   KRZYWIZNA NAROŻNIKA — prawo promienia
   ═══════════════════════════════════════════════════════════════════════
   Źródło prawdy dla zaokrągleń kontrolek. Zamiast wpisywać promień ręcznie
   przy każdym rozmiarze, liczymy go z rozmiaru.

   ── Skąd to się wzięło ──────────────────────────────────────────────
   Przycisk o wysokości 32 px i przycisk o wysokości 40 px dostawały ten sam
   promień 12 px. To NIE jest ten sam kształt: przy 32 px promień zjada 75%
   połowy wysokości, przy 40 px — 60%. Oko czyta to jako dwa różne języki
   narożnika stojące obok siebie.

   Stały promień przy zmiennym rozmiarze daje zmienne napięcie. Żeby napięcie
   było stałe — a o to chodzi, gdy mówimy „ten sam typ zaokrąglenia" —
   zmienny musi być promień.

   ── Prawo napięcia ──────────────────────────────────────────────────

       r(s) = min(R_MAX, max(R_MIN, k · s))          gdzie s = min(w, h)

   Ograniczenia są konieczne z obu stron: bez dolnego drobne elementy
   traciłyby róg zupełnie, bez górnego duże powierzchnie zmieniałyby się
   w stadiony. Poniżej progu s* = R_MAX / k prawo jest proporcjonalne,
   powyżej — stałe.

   ── Prawo współśrodkowości ──────────────────────────────────────────

       r_wewn = max(R_MIN, r_zewn − p)

   To nie konwencja, tylko geometria: krzywe równoległe w odległości p mają
   współśrodkowe łuki wtedy i tylko wtedy, gdy ich promienie różnią się o p.
   Bez tego narożniki „pływają" jeden w drugim.

   ── Czego tu NIE ma ─────────────────────────────────────────────────
   Narożnik jest ćwiartką okręgu, bo tyle potrafi `border-radius` w CSS.
   Superelipsa (krzywa Lamégo, |x/r|ⁿ + |y/r|ⁿ = 1 dla n > 2) dałaby ciągłą
   krzywiznę i niewidoczny szew na styku łuku z prostą — ale wymaga rysowania
   ścieżki SVG zamiast zaokrąglania pudełka. System używa jednego wykładnika,
   n = 2, i nie udaje, że jest inaczej.
   ═══════════════════════════════════════════════════════════════════════ */

/** Napięcie narożnika — jedyna stała estetyczna. Udział promienia w krótszym
 *  boku w zakresie proporcjonalnym. 0,28 dobrane tak, by kontrolka 40 px
 *  wypadła na 11,2 px, czyli w miejscu, w którym system już był. */
export const K_NAPIECIE = 0.28

/** Dolne ograniczenie — poniżej tego róg przestaje być czytelny. */
export const R_MIN = 4

/** Górne ograniczenie — „miękki prostokąt". Powyżej kształt czyta się jako
 *  pigułka, a to osobne znaczenie, nie mocniejszy stopień tego samego. */
export const R_MAX = 16

/** Próg nasycenia: od tego krótszego boku promień przestaje rosnąć. */
export const S_NASYCENIA = R_MAX / K_NAPIECIE

/** Promień dla elementu o podanych bokach. */
export function promien(szerokosc: number, wysokosc = szerokosc): number {
  const krotszyBok = Math.min(szerokosc, wysokosc)
  return Math.min(R_MAX, Math.max(R_MIN, K_NAPIECIE * krotszyBok))
}

/** Promień elementu zagnieżdżonego w odstępie `odstep` od rodzica. */
export function promienWewnetrzny(promienRodzica: number, odstep: number): number {
  return Math.max(R_MIN, promienRodzica - odstep)
}

/**
 * Napięcie: jaką część połowy krótszego boku zajmuje promień.
 * 0 = kant, 1 = pigułka. To jest miara zgodności — dwa elementy mają „ten sam
 * typ zaokrąglenia" wtedy, gdy mają równe napięcie, a nie równy promień.
 */
export function napiecie(promienPx: number, szerokosc: number, wysokosc = szerokosc): number {
  const polowaKrotszego = Math.min(szerokosc, wysokosc) / 2
  if (polowaKrotszego <= 0) return 0
  return Math.min(1, promienPx / polowaKrotszego)
}
