/* ═══════════════════════════════════════════════════════════════
   BIBLIOGRAFIA — źródła notatnika w stylu APA 7 / MLA 9 / Chicago 17

   Skarga (XDA): „cytaty nie mają niczego, co da się wpisać do pracy
   naukowej". Tu z metadanych, które notatnik i tak ma (tytuł, autor,
   kanał YouTube, adres strony, data dodania), powstaje gotowa lista
   źródeł. Bez AI — deterministycznie, więc wynik jest zawsze ten sam.

   Czego NIE zgadujemy: roku wydania dokumentu, wydawcy, DOI. Jeśli
   metadanych brak, wpis ma „b.d." (bez daty) zamiast zmyślonej liczby.
   ═══════════════════════════════════════════════════════════════ */

export const STYLE = [
  { id: 'apa', nazwa: 'APA 7' },
  { id: 'mla', nazwa: 'MLA 9' },
  { id: 'chicago', nazwa: 'Chicago' },
];

const MIES_PL = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

const AUTORZY_TECHNICZNI = new Set(['YouTube Video', 'User', 'Plik', 'Notatka', 'Strona WWW', 'Nagranie audio', 'Nieznany']);

function autor(z) {
  const a = String(z.author || '').trim();
  return a && !AUTORZY_TECHNICZNI.has(a) ? a : '';
}

function adres(z) {
  if (z.type === 'youtube' && z.videoId) return `https://www.youtube.com/watch?v=${z.videoId}`;
  return z.url || z.sourceUrl || '';
}

function witryna(z) {
  if (z.type === 'youtube') return 'YouTube';
  const u = adres(z);
  try { return u ? new URL(u).hostname.replace(/^www\./, '') : ''; } catch { return ''; }
}

function rodzaj(z) {
  if (z.type === 'youtube') return 'film';
  if (z.fileKind === 'web') return 'strona';
  return 'dokument';
}

/** Tytuł strony bez dopisku „| Nazwa witryny" z <title>. Tytułów filmów NIE ruszamy —
 *  tam „| …" to część tytułu nadanego przez autora. */
function czystyTytul(z) {
  const t = String(z.title || 'Bez tytułu').trim();
  return z.type === 'youtube' ? t : t.replace(/\s+[|–—]\s+[^|–—]{2,40}$/, '').trim();
}

/** Data dostępu po polsku we wszystkich stylach — cała bibliografia w jednym języku. */
function dataDostepu(z) {
  const d = z.sprawdzono ? new Date(z.sprawdzono) : z.createdAt ? new Date(z.createdAt) : new Date();
  return `${d.getDate()} ${MIES_PL[d.getMonth()]} ${d.getFullYear()}`;
}

/** Jeden wpis bibliografii. Zwraca tekst z kursywą w Markdown (*…*). */
export function wpis(z, styl = 'apa') {
  const a = autor(z);
  const t = czystyTytul(z);
  const u = adres(z);
  const w = witryna(z);
  const r = rodzaj(z);

  if (styl === 'apa') {
    // APA 7: Autor. (Rok). *Tytuł* [Film]. Witryna. URL
    const kto = a || w || 'Autor nieznany';
    const opis = r === 'film' ? ' [Film]' : '';
    return `${kto}. (b.d.). *${t}*${opis}.${w && a ? ` ${w}.` : ''}${u ? ` ${u}` : ''}`;
  }
  if (styl === 'mla') {
    // MLA 9: Autor. „Tytuł”. *Witryna*, URL. Dostęp: data.
    return `${a ? `${a}. ` : ''}„${t}”. ${w ? `*${w}*, ` : ''}${u ? `${u.replace(/^https?:\/\//, '')}. ` : ''}Dostęp ${dataDostepu(z)}.`;
  }
  // Chicago 17 (notes-bibliography): Autor. „Tytuł”. Witryna. Dostęp data. URL.
  return `${a ? `${a}. ` : ''}„${t}”. ${w ? `${w}. ` : ''}Dostęp ${dataDostepu(z)}.${u ? ` ${u}.` : ''}`;
}

/** Cała lista, posortowana alfabetycznie jak wymagają wszystkie trzy style. */
export function bibliografia(zrodla, styl = 'apa') {
  return [...zrodla]
    .map((z) => wpis(z, styl))
    .sort((x, y) => x.localeCompare(y, 'pl'))
    .join('\n\n');
}

/** Bez znaczników Markdown — do wklejenia w zwykłe pole tekstowe. */
export function bezMarkdown(tekst) {
  return String(tekst).replace(/\*(.+?)\*/g, '$1');
}
