/**
 * ════════════════════════════════════════════════════════════════════════
 *  ŁATKI JASNEGO MOTYWU NIE SIĘGAJĄ DO CIEMNEJ WYSPY (28.09.2026)
 * ════════════════════════════════════════════════════════════════════════
 *
 * `index.css` ma ~370 łatek jasnego motywu pisanych jako
 * `[data-theme="nextbyte-light"] .klasa { … !important }`. Atrybut siedzi na
 * `<html>`, więc łatka trafia w KAŻDY element strony — także w okno, które
 * ma być ciemne, choć platforma jest jasna (`WyspaMotywu`: okno Asystenta nad
 * ciemnym płótnem tablicy). Zmierzone w podglądzie: 30 różnic na 212 elementach
 * okna, m.in. ciemny tekst na ciemnym szkle i jasne pole wpisywania.
 *
 * CSS nie umie „najbliższego przodka z atrybutem", a przepisanie 370 reguł
 * ręcznie to ogromna zmiana w pliku, który edytuje kilka osób naraz. Ten
 * dodatek robi to przy budowaniu: do PODMIOTU każdej łatki dopisuje
 *
 *     :not(:where([data-nb-wyspa-motywu="ciemna"] *))
 *
 * `:where()` ma zerową specyficzność, więc waga żadnej łatki się nie zmienia
 * — a bez ciemnej wyspy na stronie warunek jest zawsze prawdziwy, czyli
 * platforma wygląda dokładnie tak jak przed zmianą.
 *
 * Pomijane: selektory, w których atrybut motywu stoi na samym podmiocie
 * (blok zmiennych `[data-theme="nextbyte-light"] { … }`, `html[data-theme=…]`),
 * bo trafiają w `<html>`, a nie w treść.
 */

export const ATRYBUT_JASNEGO = 'data-theme="nextbyte-light"';
export const WARUNEK = ':not(:where([data-nb-wyspa-motywu="ciemna"] *))';

/** Pseudoelementy — `:not()` musi stanąć PRZED nimi. */
const PSEUDOELEMENT = /^(::|:(before|after|first-line|first-letter)\b)/i;

/**
 * Indeks początku podmiotu (ostatniego złożonego selektora) w `sel`
 * i indeks jego pseudoelementu (albo długość, gdy go nie ma).
 * Nawiasy, klamry i cudzysłowy są pomijane — kombinator w `:is(a b)` nie liczy się.
 */
function podmiot(sel) {
  let glebokosc = 0;
  let cudzyslow = null;
  let poczatek = 0;
  for (let i = 0; i < sel.length; i++) {
    const z = sel[i];
    if (cudzyslow) { if (z === '\\') i++; else if (z === cudzyslow) cudzyslow = null; continue; }
    if (z === '"' || z === "'") { cudzyslow = z; continue; }
    if (z === '\\') { i++; continue; }
    if (z === '(' || z === '[') { glebokosc++; continue; }
    if (z === ')' || z === ']') { glebokosc--; continue; }
    if (glebokosc === 0 && (z === ' ' || z === '>' || z === '+' || z === '~')) poczatek = i + 1;
  }
  // pseudoelement w podmiocie (poza nawiasami)
  glebokosc = 0;
  cudzyslow = null;
  for (let i = poczatek; i < sel.length; i++) {
    const z = sel[i];
    if (cudzyslow) { if (z === '\\') i++; else if (z === cudzyslow) cudzyslow = null; continue; }
    if (z === '"' || z === "'") { cudzyslow = z; continue; }
    if (z === '\\') { i++; continue; }
    if (z === '(' || z === '[') { glebokosc++; continue; }
    if (z === ')' || z === ']') { glebokosc--; continue; }
    if (glebokosc === 0 && z === ':' && PSEUDOELEMENT.test(sel.slice(i))) return { poczatek, pseudo: i };
  }
  return { poczatek, pseudo: sel.length };
}

/** Przepisuje jeden selektor (bez przecinków na najwyższym poziomie). */
export function wylaczWyspe(selektor) {
  const sel = selektor.trim();
  if (!sel.includes(ATRYBUT_JASNEGO) || sel.includes('data-nb-wyspa-motywu')) return selektor;
  const { poczatek, pseudo } = podmiot(sel);
  if (poczatek === 0) return selektor; // brak kombinatora: reguła na samym elemencie z motywem
  const temat = sel.slice(poczatek, pseudo);
  if (!temat || temat.includes('data-theme')) return selektor;
  return sel.slice(0, pseudo) + WARUNEK + sel.slice(pseudo);
}

/** Dodatek PostCSS. */
export default function postcssWyspaMotywu() {
  return {
    postcssPlugin: 'nb-wyspa-motywu',
    Rule(regula) {
      if (!regula.selector.includes(ATRYBUT_JASNEGO)) return;
      // Reguły w @keyframes nie są selektorami.
      if (regula.parent?.type === 'atrule' && /keyframes$/i.test(regula.parent.name)) return;
      const nowe = regula.selectors.map(wylaczWyspe);
      if (nowe.some((s, i) => s !== regula.selectors[i])) regula.selectors = nowe;
    },
  };
}
postcssWyspaMotywu.postcss = true;
