import { zmienneSzklaDlaMotywu } from '@/lib/szklo-motywu';
import { MOTYW_CIEMNY, MOTYW_JASNY, type MotywZBazy } from './motywy';

/**
 * Nakłada motyw na całą stronę — tak samo jak `useGlobalTheme` na platformie:
 *  1. zmienne kolorów z bazy (kopia w `motywy.ts`) na <html>,
 *  2. zmienne szkła liczone z jasności karty (`zmienneSzklaDlaMotywu`),
 *  3. atrybut `data-theme` (na nim wiszą reguły jasnego motywu w `index.css`).
 */
const KLUCZ = 'nb-paczka-motyw';

export type NazwaMotywu = MotywZBazy['name'];

export function nalozMotyw(nazwa: NazwaMotywu) {
  const motyw = nazwa === 'nextbyte-light' ? MOTYW_JASNY : MOTYW_CIEMNY;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(motyw.zmienne)) root.style.setProperty(k, v);
  const szklo = zmienneSzklaDlaMotywu({
    card: motyw.zmienne['--card'],
    mutedForeground: motyw.zmienne['--muted-foreground'],
  });
  for (const [k, v] of Object.entries(szklo)) root.style.setProperty(k, v);
  root.setAttribute('data-theme', motyw.name);
  root.style.colorScheme = motyw.name === 'nextbyte-light' ? 'light' : 'dark';
  try { localStorage.setItem(KLUCZ, nazwa); } catch { /* tryb prywatny */ }
}

export function motywZPamieci(): NazwaMotywu {
  try {
    return localStorage.getItem(KLUCZ) === 'nextbyte-light' ? 'nextbyte-light' : 'dark-theme';
  } catch {
    return 'dark-theme';
  }
}
