/**
 * ════════════════════════════════════════════════════════════════════════════
 *  KOLEJKA 8 MOTYWÓW NEXTBYTE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Zdefiniowana kolejka cyklu przełączania motywów:
 * 1. Ciemny (dark-theme) — domyślny ciemny, głęboki kontrast, niebieski akcent
 * 2. NB Jasny (nextbyte-light) — flagowy jasny motyw platformy
 * 3. Scandi (scandinavian) — ciepły kremowy editorial, szałwiowy akcent
 * 4. Przyjazny (przyjazny) — ciepły dark navy, koralowy akcent (Revolut × Claude)
 * 5. Smoczy (dragon-red) — głęboka czerń z rubinową czerwienią
 * 6. Luxury (luxury) — głęboka czerń ze złotym akcentem (500 Byte)
 * 7. Śnieżny (snowy-white) — monochromatyczna chłodna biel/czerń
 * 8. Przyszły (future-theme) — minimalistyczny, futurystyczny jasny
 */

export interface PozycjaMotywu {
  id: string;
  nazwa: string;
  jasny: boolean;
}

export const KOLEJKA_MOTYWOW: PozycjaMotywu[] = [
  { id: 'dark-theme',     nazwa: 'Ciemny',    jasny: false },
  { id: 'nextbyte-light', nazwa: 'NB Jasny',  jasny: true  },
  { id: 'scandinavian',   nazwa: 'Scandi',    jasny: true  },
  { id: 'przyjazny',      nazwa: 'Przyjazny', jasny: false },
  { id: 'dragon-red',     nazwa: 'Smoczy',    jasny: false },
  { id: 'luxury',         nazwa: 'Luxury',    jasny: false },
  { id: 'snowy-white',    nazwa: 'Śnieżny',   jasny: false },
  { id: 'future-theme',   nazwa: 'Przyszły',  jasny: true  },
];

const KLUCZ_STORAGE = 'nb-aktywny-motyw';

export function odczytajAktualnyMotyw(): PozycjaMotywu {
  const wDokumencie = document.documentElement.getAttribute('data-theme');
  if (wDokumencie) {
    const znaleziony = KOLEJKA_MOTYWOW.find((m) => m.id === wDokumencie);
    if (znaleziony) return znaleziony;
  }
  try {
    const zapisany = localStorage.getItem(KLUCZ_STORAGE);
    if (zapisany) {
      const znaleziony = KOLEJKA_MOTYWOW.find((m) => m.id === zapisany);
      if (znaleziony) return znaleziony;
    }
  } catch {}
  return KOLEJKA_MOTYWOW[0]; // domyślnie Ciemny
}

export function ustawMotywKolejki(id: string): PozycjaMotywu {
  const pozycja = KOLEJKA_MOTYWOW.find((m) => m.id === id) || KOLEJKA_MOTYWOW[0];
  document.documentElement.setAttribute('data-theme', pozycja.id);
  try {
    localStorage.setItem(KLUCZ_STORAGE, pozycja.id);
  } catch {}
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: pozycja }));
  window.dispatchEvent(new CustomEvent('nb-theme-change', { detail: pozycja }));
  return pozycja;
}

export function przelaczNastepnyMotyw(): PozycjaMotywu {
  const obecny = odczytajAktualnyMotyw();
  const idx = KOLEJKA_MOTYWOW.findIndex((m) => m.id === obecny.id);
  const nastepnyIdx = (idx + 1) % KOLEJKA_MOTYWOW.length;
  const nastepny = KOLEJKA_MOTYWOW[nastepnyIdx];
  return ustawMotywKolejki(nastepny.id);
}
