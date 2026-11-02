/**
 * ════════════════════════════════════════════════════════════════════════
 *  STAŁE PRZEWINIĘCIE — przełączenie widoku nigdy nie przewija ekranu samo
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (06.10.2026): „zmiana zakładki gdziekolwiek nie może powodować przescrollowania ekranu na samą górę albo
 * na sam dół (…) żaden element rozwijany ani zwijany czy przełączanie widoku nie ma prawa przescrollowania
 * samoczynnego ekranu”.
 *
 * ZMIERZONE (pulpit Kalkulatora, 06.10.2026): to nie kod przewijał. Pigułka „Szkice” skracała listę z 1045 px do 928 px,
 * czyli poniżej miejsca, w którym stał użytkownik (110 px) — przeglądarka DOCINA wtedy przewinięcie do nowego końca
 * treści i ekran skacze. Po powrocie do „Wszystkie” lista rośnie, ale przewinięcie zostaje docięte, więc skok
 * na górę zostaje na stałe.
 *
 * Dwie warstwy, jedna zasada:
 *   • `pilnujKurczenia(kontener)` — treść kontenera NIE KURCZY SIĘ poniżej dolnej krawędzi tego, co widać
 *     (`min-height` = przewinięcie + wysokość okna, uaktualniane przy każdym przewinięciu). Przeglądarka nie ma czego
 *     docinać, więc rozwinięcie, zwinięcie, filtr ani zmiana zakładki nie przesuwa ekranu. Pusty obszar pod krótszą
 *     treścią znika sam, gdy użytkownik przewinie w górę — ruch zawsze robi człowiek, nie ekran.
 *   • `bezSkoku(zrodlo, zmiana)` — kliknięty przycisk (pigułka, zakładka) zostaje w tym samym miejscu ekranu, nawet
 *     gdy zmieniła się treść NAD nim. Woła ją biblioteka (`FilterPills`, `AnimatedTabs`), ekrany nic nie robią.
 */

/** Najbliższy przodek, który NAPRAWDĘ przewija się w pionie; gdy go nie ma — dokument.
    Sam `overflow-y: auto` nie wystarcza: pasek zakładek z `overflow-x-auto` dostaje go od przeglądarki z automatu. */
export const kontenerPrzewijania = (el: Element | null): HTMLElement => {
  let e = el?.parentElement ?? null;
  while (e) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1) return e;
    e = e.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
};

const trescKontenera = (k: HTMLElement): HTMLElement | null =>
  (k === document.scrollingElement || k === document.documentElement ? document.body : k.firstElementChild) as HTMLElement | null;


const jestDokumentem = (k: HTMLElement) => k === document.scrollingElement || k === document.documentElement;

/** Czy z prawdziwej treści cokolwiek jeszcze widać — gdy cała stoi nad oknem, zamek trzymałby PUSTY ekran
    (np. wejście z długiej listy w krótką kartę rekordu). Wtedy zwalniamy, a przeglądarka zachowuje się jak dawniej. */
const trescWidac = (k: HTMLElement, tresc: HTMLElement): boolean => {
  const ostatni = tresc.lastElementChild as HTMLElement | null;
  if (!ostatni) return false;
  const gora = jestDokumentem(k) ? 0 : k.getBoundingClientRect().top;
  return ostatni.getBoundingClientRect().bottom > gora + 48;
};

/** Ustawienie zamka: treść nie może być krótsza niż dolna krawędź tego, co widać. */
const zamknij = (k: HTMLElement) => {
  const tresc = trescKontenera(k);
  if (!tresc) return;
  if (!trescWidac(k, tresc)) { tresc.style.minHeight = ''; return; }
  tresc.style.minHeight = `${Math.ceil(k.scrollTop + k.clientHeight)}px`;
};

/** Po zmianie treści (bez przewinięcia) tylko sprawdzamy, czy zamek nie trzyma pustki. */
const sprawdz = (k: HTMLElement) => {
  const tresc = trescKontenera(k);
  if (tresc && tresc.style.minHeight && !trescWidac(k, tresc)) tresc.style.minHeight = '';
};

const STRAZE = new WeakMap<HTMLElement, () => void>();

/** Stała straż na kontenerze (np. główny kontener platformy firmowej). Zwraca funkcję, która ją zdejmuje. */
export const pilnujKurczenia = (k: HTMLElement | null): (() => void) => {
  if (!k) return () => {};
  const istniejaca = STRAZE.get(k);
  if (istniejaca) return istniejaca;
  let klatka = 0, klatkaZmian = 0;
  const naPrzewiniecie = () => {
    cancelAnimationFrame(klatka);
    klatka = requestAnimationFrame(() => zamknij(k));
  };
  const cel: HTMLElement | Window = jestDokumentem(k) ? window : k;
  cel.addEventListener('scroll', naPrzewiniecie, { passive: true });
  const tresc = trescKontenera(k);
  const obserwator = tresc && typeof MutationObserver !== 'undefined'
    ? new MutationObserver(() => { cancelAnimationFrame(klatkaZmian); klatkaZmian = requestAnimationFrame(() => sprawdz(k)); })
    : null;
  if (tresc) obserwator?.observe(tresc, { childList: true, subtree: true });
  zamknij(k);
  const zdejmij = () => {
    cel.removeEventListener('scroll', naPrzewiniecie);
    obserwator?.disconnect();
    cancelAnimationFrame(klatka); cancelAnimationFrame(klatkaZmian);
    STRAZE.delete(k);
  };
  STRAZE.set(k, zdejmij);
  return zdejmij;
};

/** Zwalnia zamek — np. przy zmianie strony, żeby nowy, krótszy ekran nie stał w pustym miejscu po poprzednim. */
export const zwolnijKurczenie = (k: HTMLElement | null) => {
  const tresc = k ? trescKontenera(k) : null;
  if (tresc) tresc.style.minHeight = '';
};

/**
 * Przełączenie widoku bez skoku: zamek na kontenerze kliknięcia + kliknięty element zostaje w tym samym miejscu ekranu.
 * `zmiana` to właściwa akcja (np. `onChange(klucz)`); wynik pomiaru stosujemy po dwóch klatkach, gdy React już narysował.
 */
export const bezSkoku = (zrodlo: Element | null, zmiana: () => void): void => {
  if (!zrodlo || typeof window === 'undefined') { zmiana(); return; }
  const k = kontenerPrzewijania(zrodlo);
  pilnujKurczenia(k);
  zamknij(k);
  const y0 = zrodlo.getBoundingClientRect().top;
  zmiana();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!zrodlo.isConnected) return;
    const dy = zrodlo.getBoundingClientRect().top - y0;
    if (Math.abs(dy) > 0.5) k.scrollTop += dy;
  }));
};

/* ════════════════════════════════════════════════════════════════════════
   POWRÓT WRACA NA TO SAMO MIEJSCE
   ════════════════════════════════════════════════════════════════════════
   Kajetan (09.10.2026): „korzystanie ze strzałki powrotu nie może restartować strony i kazać znowu scrollować na dół —
   wchodzę w podmiot, robię coś, chcę wrócić do listy i ląduję na samej górze”. Lista i karta rekordu to dwa adresy
   (`?item_id=`), a kontener platformy jest jeden — przeglądarka przywraca przewinięcie tylko oknu, nie kontenerowi.
   ZMIERZONE (Podmioty): lista na 900 px → karta → „Powrót do listy” → lista na 0.

   Pamięć: adres (ścieżka + parametry) → przewinięcie. Przywracamy przy POWROCIE — krok wstecz w historii platformy:
   strzałka przeglądarki albo przycisk „Powrót” na adres sprzed bieżącego. Ponowne wejście w ten sam rekord z listy to
   NIE powrót (karta otwiera się od góry). Inne przejścia — bez zmian. */

export type TypNawigacji = 'POP' | 'PUSH' | 'REPLACE';

/** Krok historii adresów: czy wejście na `adres` jest powrotem i jak wygląda stos po nim. */
export const krokHistorii = (stos: readonly string[], adres: string, typ: TypNawigacji): { wraca: boolean; stos: string[] } => {
  if (stos[stos.length - 1] === adres) return { wraca: false, stos: [...stos] };
  if (stos[stos.length - 2] === adres) return { wraca: true, stos: stos.slice(0, -1) };
  if (typ === 'POP') return { wraca: true, stos: [...stos, adres].slice(-50) };          // „dalej” albo skok w historii
  if (typ === 'REPLACE') return { wraca: false, stos: [...stos.slice(0, -1), adres] };
  return { wraca: false, stos: [...stos, adres].slice(-50) };
};

/**
 * Ustawia przewinięcie, gdy treść urośnie na tyle, by je zmieścić (lista dorysowuje się po powrocie) — najdłużej `ms`.
 * Ruch użytkownika (kółko, dotyk, klawisz) przerywa: ekran nie walczy z człowiekiem. Zwraca funkcję przerywającą.
 */
export const przywrocPrzewiniecie = (k: HTMLElement, y: number, ms = 2000): (() => void) => {
  const start = performance.now();
  let klatka = 0, koniec = false;
  const stop = () => {
    koniec = true; cancelAnimationFrame(klatka);
    for (const z of ['wheel', 'touchstart', 'keydown'] as const) k.removeEventListener(z, stop);
  };
  for (const z of ['wheel', 'touchstart', 'keydown'] as const) k.addEventListener(z, stop, { passive: true });
  const krok = () => {
    if (koniec) return;
    if (k.scrollHeight - k.clientHeight >= y) {
      const tresc = trescKontenera(k);
      if (tresc) tresc.style.minHeight = `${Math.ceil(y + k.clientHeight)}px`;   // zamek z `pilnujKurczenia` — od razu na miejscu
      k.scrollTop = y;
      stop();
      return;
    }
    if (performance.now() - start > ms) { stop(); return; }
    klatka = requestAnimationFrame(krok);
  };
  krok();
  return stop;
};
