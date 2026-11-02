import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useDotyk, useTokenyKursora, zmierzKaretke } from './plynny-kursor';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KARETKA PLATFORMY DLA KAŻDEGO POLA — JEDEN KOMPONENT NA CAŁĄ APLIKACJĘ
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, 03.09.2026: „ogarnij kursor globalnie na całej platformie, bo
 * fatalnie to teraz jest, a tyle razy ogarniany był i dalej źle".
 *
 * Co było źle: płynna karetka montowała się WYŁĄCZNIE w polach z biblioteki
 * (`Input`, `Textarea`, trzy pola z `pola.tsx`, wyszukiwarka). Poza nimi
 * platforma ma 178 surowych `<input>` i `<textarea>` w 163 plikach —
 * [firma klienta], panel twórcy, administracja, notatki, tablice, kalkulatory.
 * Tam karetka była systemowa. Ten sam ekran potrafił pokazać obie: w polu
 * z biblioteki kreskę w kolorze akcentu, w polu obok mrugającą kreskę
 * systemu. To nie było „źle policzone" — tego po prostu nie było.
 *
 * Dlaczego nie przepisać 163 plików na komponenty biblioteki: każdy taki
 * plik ma własne klasy, walidacje i zachowania; podmiana 178 pól to setki
 * okazji do regresji w miejscach, których nikt dziś nie testuje. Karetka
 * jest WARSTWĄ WIZUALNĄ, więc należy jej się rozwiązanie warstwowe.
 *
 * Jak to działa: jeden komponent na korzeniu aplikacji nasłuchuje, które
 * pole ma fokus. Gdy jest to pole tekstowe bez własnej karetki, gasi jego
 * karetkę systemową i rysuje kreskę platformy na `position: fixed`,
 * pozycjonowaną prostokątem pola. Pomiar idzie przez `zmierzKaretke` —
 * TĘ SAMĄ funkcję, której używa karetka lokalna, więc obie drogi nie mogą
 * się rozjechać przy następnej poprawce.
 *
 * Czego NIE obsługuje (świadomie):
 *  • dotyk — telefon dostaje karetkę systemową razem z uchwytami zaznaczenia
 *    (powód opisany przy `useDotyk`);
 *  • pola `contenteditable` — nie mają `selectionStart`, potrzebują innego
 *    pomiaru; dziś nie ma ich w platformie poza edytorami, które rysują
 *    własny kursor;
 *  • typy z własną obsługą (`number`, `date`, `time`, `color`) — mają
 *    przyciski i maski, w których kreska platformy wprowadzałaby w błąd.
 */

/** Typy `input`, w których karetka zachowuje się jak w zwykłym tekście. */
const TYPY_TEKSTOWE = new Set(['text', 'search', 'email', 'url', 'tel', 'password', '']);

type PoleTekstowe = HTMLInputElement | HTMLTextAreaElement;

/** Eksport dla testów — które pole dostaje karetkę platformy. */
export function kwalifikujeSie(el: Element | null): el is PoleTekstowe {
  if (!el) return false;
  const pole = el as PoleTekstowe;
  /* Pola biblioteki rysują karetkę same — bez tego byłyby dwie naraz. */
  if ((pole as HTMLElement).dataset?.plynnyKursor === 'wlasny') return false;
  if (pole.disabled || pole.readOnly) return false;
  /*
    POLA NA PŁÓTNIE — natywna karetka (28.09.2026). Michał o Tablicach:
    „kursor … jest jak by o spację dalej mimo że nie ma spacji". Pole edycji
    tekstu Excalidraw jest skalowane `transform: scale(zoom)` i ma krój
    płótna; lustro pomiaru tego nie odtwarza, więc kreska stała obok tekstu.
    Każde pole z transformacją (i każde wewnątrz Excalidraw) dostaje karetkę
    systemową — ta stoi na znaku, bo liczy ją silnik przeglądarki.
  */
  if ((pole as HTMLElement).closest?.('.excalidraw')) return false;
  if (typeof getComputedStyle === 'function' && getComputedStyle(pole).transform !== 'none') return false;
  if (pole.tagName === 'TEXTAREA') return true;
  if (pole.tagName !== 'INPUT') return false;
  return TYPY_TEKSTOWE.has(((pole as HTMLInputElement).type || '').toLowerCase());
}

export const PlynnyKursorGlobalny: React.FC = () => {
  const dotyk = useDotyk();
  const bezRuchu = useReducedMotion();

  const [pole, ustawPole] = React.useState<PoleTekstowe | null>(null);
  const poleRef = React.useRef<PoleTekstowe | null>(null);
  poleRef.current = pole;

  const miarkaRef = React.useRef<HTMLSpanElement | null>(null);
  /* Tokeny czytamy z SAMEGO POLA — podgląd w Zarządzie ustawia je na swoim
     kontenerze, więc wartość globalna nie zawsze jest tą właściwą. */
  const tokeny = useTokenyKursora(poleRef as React.RefObject<HTMLElement>);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const krycie = useMotionValue(0);
  const [wysokosc, ustawWysokosc] = React.useState(16);

  const ustawienia = bezRuchu
    ? { stiffness: 10000, damping: 100, mass: 0.1 }
    : { stiffness: tokeny.sprezystosc, damping: tokeny.tlumienie, mass: tokeny.masa };
  const xSprezyna = useSpring(x, ustawienia);
  const ySprezyna = useSpring(y, { ...ustawienia, stiffness: ustawienia.stiffness * 1.6 });

  /* Kreska nie przylatuje ze starego miejsca — gdy jest zgaszona, jej pozycja
     nie ma czego animować (ten sam powód co w karetce lokalnej). */
  const zapal = React.useCallback((docelowe: number) => {
    if (docelowe === 1 && krycie.get() === 0) {
      xSprezyna.jump(x.get());
      ySprezyna.jump(y.get());
    }
    krycie.set(docelowe);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Kto ma fokus ──────────────────────────────────────────────────── */
  React.useEffect(() => {
    if (dotyk) return;
    const naFokusie = () => {
      const akt = document.activeElement;
      ustawPole(kwalifikujeSie(akt) ? akt : null);
    };
    /* `focusin`/`focusout` bąbelkują (w przeciwieństwie do `focus`/`blur`),
       więc jeden nasłuch na dokumencie łapie każde pole w aplikacji. */
    document.addEventListener('focusin', naFokusie);
    document.addEventListener('focusout', naFokusie);
    /*
      DRUGA DROGA WYKRYCIA — bo `focusin` czasem NIE LECI (03.09.2026).

      Zmierzone: gdy okno przeglądarki nie ma fokusu systemowego,
      `element.focus()` ustawia `document.activeElement`, ale przeglądarka
      nie emituje ani `focus`, ani `focusin`. Pole jest wtedy aktywne,
      a karetki nie ma. Ten sam stan łapie użytkownik, który wraca do karty
      albo do okna przeglądarki po przełączeniu z innego programu.

      `selectionchange` leci przy każdym kliknięciu i każdym znaku, więc
      wystarczy jako druga droga: sprawdza, kto JEST aktywny, zamiast czekać
      na zdarzenie o tym, kto się nim STAŁ. Porównanie jest tanie, a React
      pomija przerysowanie, gdy pole się nie zmieniło.
    */
    document.addEventListener('selectionchange', naFokusie);
    window.addEventListener('focus', naFokusie);
    naFokusie(); // pole mogło dostać fokus przed zamontowaniem (autoFocus)
    return () => {
      document.removeEventListener('focusin', naFokusie);
      document.removeEventListener('focusout', naFokusie);
      document.removeEventListener('selectionchange', naFokusie);
      window.removeEventListener('focus', naFokusie);
    };
  }, [dotyk]);

  /* ── Gaszenie karetki systemowej TYLKO na czas obsługi ─────────────── */
  React.useEffect(() => {
    if (!pole || dotyk) return;
    /* Zapamiętujemy WŁASNY wpis pola, nie wartość wyliczoną — inaczej po
       oddaniu fokusu wpisalibyśmy mu na stałe kolor z arkusza. */
    const poprzedni = pole.style.caretColor;
    pole.style.caretColor = 'transparent';
    return () => { pole.style.caretColor = poprzedni; };
  }, [pole, dotyk]);

  /* ── Pomiar ───────────────────────────────────────────────────────── */
  const przelicz = React.useCallback(() => {
    const p = poleRef.current;
    const miarka = miarkaRef.current;
    if (!p || !miarka || dotyk) { krycie.set(0); return; }
    if (document.activeElement !== p) { krycie.set(0); return; }

    const pomiar = zmierzKaretke(p, miarka);
    if (!pomiar) { krycie.set(0); return; } // zaznaczenie zamiast karetki

    const r = p.getBoundingClientRect();
    /* Pole schowane (zwinięty panel, przewinięta lista) albo poza ekranem —
       kreska rysowana na `fixed` wisiałaby wtedy w powietrzu nad treścią. */
    const naEkranie = r.width > 0 && r.height > 0
      && r.bottom > 0 && r.top < window.innerHeight
      && r.right > 0 && r.left < window.innerWidth;

    x.set(r.left + pomiar.x);
    y.set(r.top + pomiar.y);
    ustawWysokosc(Math.max(8, pomiar.wysWiersza * 0.92));
    zapal(pomiar.widoczna && naEkranie ? 1 : 0);
  }, [dotyk, krycie, x, y, zapal]);

  const przeliczRef = React.useRef(przelicz);
  przeliczRef.current = przelicz;

  /* ── Kiedy przeliczać ─────────────────────────────────────────────── */
  React.useEffect(() => {
    if (!pole || dotyk) { krycie.set(0); return; }
    let klatka = 0;
    /* Zdarzeń bywa kilka na jedno naciśnięcie (`keyup` + `selectionchange`);
       zbieramy je do jednej klatki, żeby nie mierzyć układu wielokrotnie. */
    const odswiez = () => {
      if (klatka) return;
      klatka = requestAnimationFrame(() => { klatka = 0; przeliczRef.current(); });
    };

    document.addEventListener('selectionchange', odswiez);
    /* `true` = faza przechwytywania: przewijanie dowolnego przodka (panel,
       lista, okno modalne) przesuwa pole, a więc i karetkę. Zdarzenie
       `scroll` nie bąbelkuje, więc bez przechwytywania byśmy go nie widzieli. */
    document.addEventListener('scroll', odswiez, true);
    window.addEventListener('resize', odswiez);
    pole.addEventListener('input', odswiez);
    pole.addEventListener('keyup', odswiez);
    pole.addEventListener('click', odswiez);
    /* `select` leci, gdy zaznaczenie ustawia KOD (`setSelectionRange` po
       wstawieniu znacznika) — wtedy nie ma ani `keyup`, ani `click`. */
    pole.addEventListener('select', odswiez);
    pole.addEventListener('scroll', odswiez);

    /* Zmiana rozmiaru pola (rosnąca pastylka czatu, obrót telefonu)
       przesuwa karetkę razem z nim. */
    const obs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(odswiez) : undefined;
    obs?.observe(pole);
    /* Font wczytany po pierwszym renderze zmienia szerokości liter. */
    if ('fonts' in document) void (document as Document & { fonts: FontFaceSet }).fonts.ready.then(odswiez);

    /*
      STRAŻNIK ZMIAN BEZ ZDARZENIA (07.09.2026).

      Michał: „czasami kursor zostaje w ChatInput, to samo na logowaniu
      i rejestracji". Trzy miejsca, jedna przyczyna: wartość pola zmienia się
      BEZ żadnego zdarzenia, którego słuchamy wyżej.
       • autouzupełnianie przeglądarki (login, rejestracja, adres w oknie
         wystawiania karty) wpisuje tekst bez `input` i bez `selectionchange`
         — karetka zostaje na pozycji zero przy pełnym polu;
       • ChatInput po wysłaniu czyści pole programowo (`setState('')`) —
         React ustawia `value`, przeglądarka nie emituje `input`, karetka
         zostaje na końcu tekstu, którego już nie ma, aż do pierwszego
         naciśnięcia klawisza.
      Zdarzeń na te przypadki nie ma, więc zamiast czekać na sygnał —
      porównujemy stan pola w każdej klatce, PÓKI MA FOKUS. Koszt: jedno
      porównanie napisów na klatkę dla jednego pola; przy niezmienionej
      wartości React trzyma tę samą referencję, więc porównanie jest O(1).
    */
    let ostatniaWartosc = pole.value;
    let ostatniPoczatek = pole.selectionStart;
    let ostatniKoniec = pole.selectionEnd;
    let straznik = 0;
    const pilnuj = () => {
      if (pole.value !== ostatniaWartosc
        || pole.selectionStart !== ostatniPoczatek
        || pole.selectionEnd !== ostatniKoniec) {
        ostatniaWartosc = pole.value;
        ostatniPoczatek = pole.selectionStart;
        ostatniKoniec = pole.selectionEnd;
        odswiez();
      }
      straznik = requestAnimationFrame(pilnuj);
    };
    straznik = requestAnimationFrame(pilnuj);

    odswiez();
    return () => {
      if (klatka) cancelAnimationFrame(klatka);
      cancelAnimationFrame(straznik);
      document.removeEventListener('selectionchange', odswiez);
      document.removeEventListener('scroll', odswiez, true);
      window.removeEventListener('resize', odswiez);
      pole.removeEventListener('input', odswiez);
      pole.removeEventListener('keyup', odswiez);
      pole.removeEventListener('click', odswiez);
      pole.removeEventListener('select', odswiez);
      pole.removeEventListener('scroll', odswiez);
      obs?.disconnect();
      krycie.set(0);
    };
  }, [pole, dotyk, krycie]);

  if (dotyk || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Miarka: kopia typografii pola, w której mierzymy tekst sprzed
          karetki. Musi być w drzewie, ale nie może nic zasłaniać. */}
      <span
        ref={miarkaRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-0 top-0 z-[-1] whitespace-pre"
      />
      {/* Dwa elementy, nie jeden: kontener niesie POZYCJĘ (transform ze
          sprężyny), kreska własne cofnięcie o połowę wysokości. Gdyby oba
          siedziały na jednym elemencie, jeden `transform` zjadłby drugi —
          ta sama rodzina błędu co dwie klasy piszące do `box-shadow`. */}
      {/* `z-[300]`, NIE `z-[70]` (19.10.2026, Michał: „nie widać tu znacznika" w polu edytora presetu).
          Kreska idzie portalem do `<body>`, a okna (`Okno` z-[201]) i listy/dymki (z-[250]) leżą wyżej —
          systemowa karetka zgaszona, a nasza pod szybą okna: w KAŻDYM zwykłym polu w oknie pisało się na ślepo.
          Kreska rysuje się tylko przy polu z fokusem, więc nad oknami niczego nie zasłoni. */}
      <motion.span
        aria-hidden="true"
        style={{ x: xSprezyna, y: ySprezyna, opacity: krycie }}
        className="pointer-events-none fixed left-0 top-0 z-[300]"
      >
        <span
          /* `backgroundColor` tylko gdy `--nb-kursor-kolor` jest ustawiony —
             inaczej zostaje klasa i zachowanie bez zmian (patrz komentarz
             przy `tekstZTokenu`). */
          style={{ width: `${tokeny.szerokosc}px`, height: `${wysokosc}px`, backgroundColor: tokeny.kolor || undefined }}
          className="block -translate-y-1/2 rounded-full bg-primary"
        />
      </motion.span>
    </>,
    document.body,
  );
};
