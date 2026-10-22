/* ═══════════════════════════════════════════════════════════════
   NEXT SCRIBE — funkcje AI, których nie ma w NotebookLM

   1. zweryfikujAkapity — serce „Żywego szkicu": każdy akapit tekstu
      sprawdzany osobno ze źródłami. Wynik to status (potwierdzone /
      częściowo / brak w źródłach / sprzeczne) + dosłowny cytat i nazwa
      źródła. NotebookLM pokazuje cytat, ale nie mówi, czy zdanie, które
      SAM poprawiłeś, nadal ma pokrycie — tu to jest cała idea.

   2. zapytajWszystkieNotatniki — jedno pytanie do wielu notatników
      naraz. Najczęstsza skarga na NotebookLM: notatniki to „osobne
      wszechświaty", nie da się zadać pytania ponad nimi.

   Wywołania idą tym samym endpointem co reszta notatnika
   (generativelanguage v1beta, klucz z ustawień notatnika).
   ═══════════════════════════════════════════════════════════════ */

import { normalizeModelName } from './geminiApi';

const BAZA = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Twardy limit znaków kontekstu na jedno wywołanie — flash-lite zniesie więcej,
 *  ale krótszy kontekst to szybsza i tańsza odpowiedź przy każdym „Sprawdź". */
const LIMIT_KONTEKSTU = 600_000;

async function wywolaj(apiKey, model, systemInstruction, prompt, { szukaj = false } = {}) {
  const url = `${BAZA}/${normalizeModelName(model)}:generateContent?key=${(apiKey || '').trim()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // Gemini nie łączy narzędzia wyszukiwarki z wymuszonym JSON — przy
      // `szukaj` JSON wyciągamy z tekstu (parser niżej zdejmuje ```json).
      ...(szukaj ? { tools: [{ googleSearch: {} }] } : {}),
      generationConfig: szukaj
        ? { temperature: 0.2, maxOutputTokens: 8192 }
        : { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 8192 },
    }),
  });
  const dane = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    throw new Error('Klucz Gemini wygasł albo został unieważniony — wklej nowy w ustawieniach notatnika.');
  }
  if (res.status === 429) throw new Error('Limit zapytań Gemini wyczerpany — spróbuj za chwilę.');
  if (!res.ok) throw new Error(dane?.error?.message || `Gemini odpowiedziało ${res.status}`);
  const tekst = dane?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  try {
    const czysty = tekst.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    // Z wyszukiwarką model bywa gadatliwy przed/po JSON-ie — bierzemy sam obiekt.
    const obiekt = czysty.startsWith('{') ? czysty : (czysty.match(/\{[\s\S]*\}/) || [czysty])[0];
    return JSON.parse(obiekt);
  } catch {
    throw new Error('Model zwrócił nieczytelną odpowiedź — spróbuj jeszcze raz.');
  }
}

/** Źródła jako jeden blok tekstu z identyfikatorami, przycięty do limitu. */
export function kontekstZrodel(zrodla, limit = LIMIT_KONTEKSTU) {
  let wynik = '';
  for (const [i, z] of zrodla.entries()) {
    const id = z.videoId || z.id;
    const blok = `=== ŹRÓDŁO ${i + 1} | id: "${id}" | tytuł: "${z.title}" ===\n${z.rawText || ''}\n\n`;
    if (wynik.length + blok.length > limit) {
      wynik += blok.slice(0, Math.max(0, limit - wynik.length));
      break;
    }
    wynik += blok;
  }
  return wynik;
}

/* ── 1. Weryfikacja akapitów ──────────────────────────────────────── */

export const STATUSY = {
  potwierdzone: { etykieta: 'Potwierdzone', opis: 'Źródła mówią to samo.' },
  czesciowe: { etykieta: 'Częściowo', opis: 'Źródła potwierdzają tylko część — reszta to dopowiedzenie.' },
  brak: { etykieta: 'Brak w źródłach', opis: 'Żadne źródło tego nie mówi.' },
  sprzeczne: { etykieta: 'Sprzeczne', opis: 'Źródło mówi coś innego.' },
  niesprawdzone: { etykieta: 'Niesprawdzone', opis: 'Akapit zmienił się od ostatniego sprawdzenia.' },
};

/**
 * @param {string[]} akapity — tekst każdego akapitu
 * @param {Array} zrodla — źródła notatnika ({ id, videoId?, title, rawText })
 * @returns {Promise<Array<{ status, zrodloId, zrodloTytul, cytat, uwaga }>>} — w tej samej kolejności
 */
export async function zweryfikujAkapity(apiKey, model, akapity, zrodla) {
  if (!apiKey) throw new Error('Brak klucza Gemini — dodaj go w ustawieniach notatnika.');
  if (!zrodla.length) throw new Error('Ten notatnik nie ma źródeł — nie ma z czym porównać tekstu.');

  const system = `Jesteś rygorystycznym weryfikatorem faktów. Dostajesz ŹRÓDŁA i ponumerowane AKAPITY tekstu.
Dla KAŻDEGO akapitu oceń, czy jego twierdzenia wynikają ze źródeł. Oceniaj wyłącznie na podstawie źródeł, nie własnej wiedzy.
Statusy:
- "potwierdzone": wszystkie istotne twierdzenia akapitu mają pokrycie w źródłach,
- "czesciowe": część twierdzeń ma pokrycie, część nie,
- "brak": źródła w ogóle tego nie poruszają,
- "sprzeczne": któreś źródło mówi coś przeciwnego (inne liczby, daty, wnioski).
Akapit bez twierdzeń faktycznych (np. nagłówek, zdanie przejściowe) oznacz "potwierdzone" z pustym cytatem.
Dla statusów innych niż "brak" podaj DOSŁOWNY, krótki (max 220 znaków) cytat ze źródła, który najlepiej uzasadnia ocenę, oraz id i tytuł tego źródła.
W polu "uwaga" napisz po polsku jedno zdanie: co dokładnie się nie zgadza albo czego brakuje (dla "potwierdzone" zostaw pusty).
Zwróć JSON: {"wyniki":[{"nr":1,"status":"...","zrodloId":"...","zrodloTytul":"...","cytat":"...","uwaga":"..."}]} — dokładnie jeden wynik na akapit, w tej samej kolejności.`;

  const prompt = `ŹRÓDŁA:\n${kontekstZrodel(zrodla)}\n\nAKAPITY DO SPRAWDZENIA:\n${akapity.map((a, i) => `[${i + 1}] ${a}`).join('\n\n')}`;
  const odp = await wywolaj(apiKey, model, system, prompt);
  const wyniki = Array.isArray(odp?.wyniki) ? odp.wyniki : [];
  return akapity.map((_, i) => {
    const w = wyniki.find((x) => Number(x.nr) === i + 1) || wyniki[i] || {};
    const status = STATUSY[w.status] ? w.status : 'brak';
    return {
      status,
      zrodloId: w.zrodloId || '',
      zrodloTytul: w.zrodloTytul || '',
      cytat: (w.cytat || '').trim(),
      uwaga: (w.uwaga || '').trim(),
    };
  });
}

/* ── 2. Pytanie do wielu notatników ───────────────────────────────── */

/**
 * @param {Array<{ id, name, sources: Array, notes?: Array }>} notatniki
 * @returns {Promise<{ odpowiedz: string, cytaty: Array<{ notatnikId, notatnik, zrodlo, cytat }> }>}
 */
export async function zapytajWszystkieNotatniki(apiKey, model, pytanie, notatniki) {
  if (!apiKey) throw new Error('Brak klucza Gemini — dodaj go w ustawieniach notatnika.');
  const zZrodlami = notatniki.filter((n) => n.sources?.length || n.notes?.length);
  if (!zZrodlami.length) throw new Error('Żaden notatnik nie ma jeszcze źródeł ani notatek.');

  // Limit dzielony po równo między notatniki — jeden wielki nie zagłuszy reszty.
  const naNotatnik = Math.floor(LIMIT_KONTEKSTU / zZrodlami.length);
  const kontekst = zZrodlami.map((n) => {
    const notatki = (n.notes || []).map((x) => `- ${x.text}`).join('\n');
    return `######## NOTATNIK "${n.name}" | notatnikId: "${n.id}" ########\n${kontekstZrodel(n.sources || [], naNotatnik)}${notatki ? `\nNOTATKI UŻYTKOWNIKA:\n${notatki}\n` : ''}`;
  }).join('\n\n');

  const system = `Jesteś asystentem badawczym Next Scribe. Odpowiadasz na pytanie na podstawie WIELU notatników użytkownika naraz.
Zasady:
- Korzystaj wyłącznie z podanych notatników. Jeśli czegoś w nich nie ma, powiedz to wprost.
- Szukaj połączeń MIĘDZY notatnikami: gdzie się uzupełniają, gdzie sobie przeczą. To jest najcenniejsza część odpowiedzi.
- Pisz po polsku, zwięźle, w Markdown. Bez pogrubień (**).
- Po każdym twierdzeniu wstaw marker [N]. Tablica "cytaty" ma DOKŁADNIE tyle elementów, ile markerów; [1] = cytaty[0].
Zwróć JSON: {"odpowiedz":"...","cytaty":[{"notatnikId":"...","notatnik":"...","zrodlo":"tytuł źródła albo 'Notatka'","cytat":"dosłowny fragment, max 200 znaków"}]}`;

  const odp = await wywolaj(apiKey, model, system, `${kontekst}\n\nPYTANIE: ${pytanie}`);
  return {
    odpowiedz: String(odp?.odpowiedz || '').trim() || 'Brak odpowiedzi.',
    cytaty: Array.isArray(odp?.cytaty) ? odp.cytaty : [],
  };
}

/* ── 3. Zadania z rozmowy ─────────────────────────────────────────── */

/**
 * Skarga (XDA): „rozmowa wyciąga luki i kolejne kroki, ale nie ma gdzie ich
 * zapisać — trzymam osobną listę zadań". Tu AI proponuje 2–5 konkretnych
 * kroków z odpowiedzi; użytkownik wybiera, które zapisać.
 * @returns {Promise<string[]>}
 */
export async function zaproponujZadania(apiKey, model, pytanie, odpowiedz) {
  if (!apiKey) throw new Error('Brak klucza Gemini — dodaj go w ustawieniach notatnika.');
  const system = `Z rozmowy badawczej wyciągasz KONKRETNE kolejne kroki dla użytkownika.
Zasady: 2–5 zadań, każde zaczyna się czasownikiem w trybie rozkazującym (np. „Sprawdź…", „Porównaj…", „Przetestuj…"), max 90 znaków, po polsku, bez numeracji.
Uwzględniaj: rzeczy do sprawdzenia w praktyce, luki w wiedzy, które warto uzupełnić nowym źródłem, decyzje do podjęcia.
Zwróć JSON: {"zadania":["...","..."]}`;
  const odp = await wywolaj(apiKey, model, system, `PYTANIE UŻYTKOWNIKA:\n${pytanie || '(brak)'}\n\nODPOWIEDŹ:\n${String(odpowiedz || '').slice(0, 20000)}`);
  return (Array.isArray(odp?.zadania) ? odp.zadania : []).map((z) => String(z).trim()).filter(Boolean).slice(0, 5);
}

/* ── 4. Odkrywanie źródeł w sieci ─────────────────────────────────── */

/**
 * „Pusty notatnik" to największa bariera na starcie (Jeff Su). Model z Google
 * Search proponuje źródła do tematu; użytkownik zaznacza i dodaje je zwykłą
 * ścieżką linków (transkrypcja YouTube / czytanie strony po stronie serwera).
 * @returns {Promise<Array<{ tytul, url, rodzaj, dlaczego }>>}
 */
export async function znajdzZrodla(apiKey, model, temat, { juzSa = [] } = {}) {
  if (!apiKey) throw new Error('Brak klucza Gemini — dodaj go w ustawieniach notatnika.');
  const system = `Jesteś bibliotekarzem badawczym. Znajdź w sieci 6–10 NAJLEPSZYCH źródeł do tematu użytkownika.
Mieszaj rodzaje: artykuły eksperckie, dokumentacje, badania, rzetelne filmy YouTube (z napisami).
Pomijaj agregatory SEO, fora bez merytoryki i strony za paywallem. Podawaj WYŁĄCZNIE adresy, które naprawdę znalazłeś w wynikach wyszukiwania.
Dla każdego źródła jedno zdanie po polsku: czego się z niego dowiem i czemu jest wiarygodne.
Zwróć WYŁĄCZNIE JSON: {"zrodla":[{"tytul":"...","url":"https://...","rodzaj":"artykuł|film|badanie|dokumentacja","dlaczego":"..."}]}`;
  const pomin = juzSa.length ? `\nNie proponuj tych, które już są w notatniku:\n${juzSa.slice(0, 40).join('\n')}` : '';
  const odp = await wywolaj(apiKey, model, system, `TEMAT: ${temat}${pomin}`, { szukaj: true });
  const lista = Array.isArray(odp?.zrodla) ? odp.zrodla : [];
  return lista
    .filter((z) => /^https?:\/\//.test(String(z.url || '')))
    .map((z) => ({ tytul: String(z.tytul || z.url), url: String(z.url), rodzaj: String(z.rodzaj || 'artykuł'), dlaczego: String(z.dlaczego || '') }));
}

/* ── 5. Tabela ekstrakcji ─────────────────────────────────────────── */

/**
 * Jak Elicit: te same kolumny wyciągnięte z KAŻDEGO źródła osobno — porównanie
 * 10 filmów/artykułów w jednej tabeli. Każda komórka ma dosłowny cytat-dowód.
 * Źródła idą pojedynczo (równolegle po 3), więc duże notatniki nie wypadają z kontekstu.
 * @returns {Promise<Array<{ zrodloId, zrodlo, komorki: Array<{ wartosc, cytat }> }>>}
 */
export async function wyciagnijTabele(apiKey, model, kolumny, zrodla, onPostep) {
  if (!apiKey) throw new Error('Brak klucza Gemini — dodaj go w ustawieniach notatnika.');
  if (!kolumny.length) throw new Error('Dodaj przynajmniej jedną kolumnę.');
  const system = `Wyciągasz dane z JEDNEGO źródła do tabeli porównawczej.
Dla każdej kolumny podaj krótką wartość (max 160 znaków, po polsku) i dosłowny cytat-dowód ze źródła (max 160 znaków).
Jeśli źródło nie zawiera informacji dla kolumny, wartość = "—" i pusty cytat. Nie zgaduj.
Zwróć JSON: {"komorki":[{"kolumna":"...","wartosc":"...","cytat":"..."}]} — w kolejności kolumn.`;
  const wiersze = new Array(zrodla.length);
  let zrobione = 0;
  const jedno = async (z, i) => {
    const prompt = `KOLUMNY: ${kolumny.map((k, j) => `${j + 1}. ${k}`).join(' | ')}\n\nŹRÓDŁO "${z.title}":\n${String(z.rawText || '').slice(0, 180000)}`;
    let komorki;
    try {
      const odp = await wywolaj(apiKey, model, system, prompt);
      const lista = Array.isArray(odp?.komorki) ? odp.komorki : [];
      komorki = kolumny.map((k, j) => {
        const c = lista.find((x) => String(x.kolumna || '').toLowerCase() === k.toLowerCase()) || lista[j] || {};
        return { wartosc: String(c.wartosc || '—'), cytat: String(c.cytat || '') };
      });
    } catch (e) {
      if (/Klucz Gemini/.test(e.message)) throw e;
      komorki = kolumny.map(() => ({ wartosc: '⚠ błąd odczytu', cytat: '' }));
    }
    wiersze[i] = { zrodloId: z.id, zrodlo: z.title, komorki };
    zrobione += 1;
    onPostep?.(zrobione, zrodla.length, wiersze.filter(Boolean));
  };
  for (let i = 0; i < zrodla.length; i += 3) {
    await Promise.all(zrodla.slice(i, i + 3).map((z, j) => jedno(z, i + j)));
  }
  return wiersze;
}
