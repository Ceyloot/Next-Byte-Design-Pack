/**
 * ZAZNACZANIE — całość, grupa, pojedyncza pozycja (STANDARD-WYGLADU §22, Kajetan 11.10.2026: „jak jest
 * zaznaczanie, to zawsze chcę móc zaznaczyć całość albo kategorię albo jednostkę”).
 *
 * Jedna reguła stanu dla każdej listy z polami wyboru: grupa (kategoria, sekcja, cała lista) jest zaznaczona, gdy
 * zaznaczone są WSZYSTKIE jej pozycje, częściowo — gdy niektóre (`Checkbox` biblioteki rysuje wtedy stan pośredni),
 * i odznaczona — gdy żadna. Kliknięcie grupy zaznaczonej w całości odznacza ją, każdej innej — zaznacza w całości.
 * Dotąd kilka ekranów liczyło to po swojemu (Cechy, Zasoby zespołu, wybór typów, Rabaty), a okno wczytywania PDF
 * w Doborze nie miało ani całości, ani kategorii.
 */
export type StanZaznaczenia = boolean | 'indeterminate';

/** Stan grupy: `true` — wszystkie, `'indeterminate'` — część, `false` — żadna (pusta grupa też `false`). */
export const stanGrupy = (klucze: readonly string[], zaznaczone: ReadonlySet<string>): StanZaznaczenia => {
  const ile = klucze.filter(k => zaznaczone.has(k)).length;
  return ile === 0 ? false : ile === klucze.length ? true : 'indeterminate';
};

/** Nowy zbiór po kliknięciu grupy: zaznaczona w całości → odznacz jej pozycje; inaczej → zaznacz wszystkie. */
export const przelaczGrupe = (klucze: readonly string[], zaznaczone: ReadonlySet<string>): Set<string> => {
  const zaznacz = stanGrupy(klucze, zaznaczone) !== true;
  const wynik = new Set(zaznaczone);
  for (const k of klucze) { if (zaznacz) wynik.add(k); else wynik.delete(k); }
  return wynik;
};

/** Nowy zbiór po kliknięciu pojedynczej pozycji. */
export const przelaczJedna = (klucz: string, zaznaczone: ReadonlySet<string>): Set<string> => {
  const wynik = new Set(zaznaczone);
  if (wynik.has(klucz)) wynik.delete(klucz); else wynik.add(klucz);
  return wynik;
};
