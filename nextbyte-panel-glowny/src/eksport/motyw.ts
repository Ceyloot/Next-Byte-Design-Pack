import { MOTYWY } from './motywy';
import { zmienneSzklaDlaMotywu, ZMIENNE_SZKLA } from '@/lib/szklo-motywu';

/**
 * Nakładanie motywu — ta sama kolejność co `useGlobalTheme` na platformie:
 * zmienne kolorów na `<html>`, potem zmienne szkła wyliczone z `--card`
 * i `--muted-foreground` (jedna funkcja, wspólna z platformą), na końcu
 * atrybut `data-theme`, do którego przypięte są reguły jasnego motywu
 * w `index.css`.
 */
export type NazwaMotywu = keyof typeof MOTYWY;

const KLUCZ = 'nb-eksport-motyw';

/**
 * Domyślny jasny motyw tej paczki: Przyszły (`future-theme`).
 */
export const JASNY: NazwaMotywu = 'przyszly';

export function odczytajMotyw(): NazwaMotywu {
  try {
    const zapisany = localStorage.getItem(KLUCZ);
    if (zapisany === 'przyszly') return 'przyszly';
    if (zapisany === 'ciemny') return 'ciemny';
    /* Domyślnie ciemny — tak startuje platforma. */
    return 'ciemny';
  } catch {
    return 'ciemny';
  }
}

/** Czy dany motyw jest jasny — po jasności `--card`, tak jak liczy to szkło. */
export function czyJasny(nazwa: NazwaMotywu): boolean {
  const l = parseFloat((MOTYWY[nazwa].kolory['--card'] ?? '').trim().split(/\s+/)[2] ?? '');
  return Number.isFinite(l) && l > 50;
}

export function zastosujMotyw(nazwa: NazwaMotywu): void {
  const motyw = MOTYWY[nazwa];
  const korzen = document.documentElement;

  /* Najpierw zdejmujemy zmienne OBU motywów — jasny ma zmienne, których ciemny
     nie ma (np. `--chart-*`), i zostałyby po przełączeniu. */
  for (const m of Object.values(MOTYWY)) {
    for (const zmienna of Object.keys(m.kolory)) korzen.style.removeProperty(zmienna);
  }
  for (const [zmienna, wartosc] of Object.entries(motyw.kolory)) {
    korzen.style.setProperty(zmienna, wartosc);
  }

  ZMIENNE_SZKLA.forEach((n) => korzen.style.removeProperty(n));
  const szklo = zmienneSzklaDlaMotywu({
    card: motyw.kolory['--card'],
    mutedForeground: motyw.kolory['--muted-foreground'],
  });
  Object.entries(szklo).forEach(([k, v]) => korzen.style.setProperty(k, v));

  korzen.setAttribute('data-theme', motyw.nazwa);
  try {
    localStorage.setItem(KLUCZ, nazwa);
  } catch {
    /* prywatny tryb — motyw i tak jest nałożony */
  }
}


/*
 * ════════════════════════════════════════════════════════════════════════
 *  PRZEŁĄCZANIE MOTYWU W TEJ PACZCE
 * ════════════════════════════════════════════════════════════════════════
 *
 * Przycisk słońca/księżyca przy logo (`components/sidebar/SidebarHeader.tsx`)
 * jest PLATFORMOWY: zapisuje wybór do `user_purchased_themes` i wysyła
 * zdarzenie `themeChanged`, licząc na to, że kolory nałoży `useGlobalTheme`.
 * W paczce `useGlobalTheme` nie ma — kolory idą z `eksport/motywy.ts` — więc
 * klikanie w przycisk zapisywało wybór do bazy i NIC nie zmieniało na ekranie.
 *
 * Zamiast dopisywać cokolwiek do pliku platformowego (wróciłby do repozytorium
 * z importem z `eksport/`, którego na platformie nie ma), paczka po prostu
 * SŁUCHA tego samego zdarzenia i nakłada swój motyw. Przycisk zostaje 1:1,
 * a mimo to działa.
 */
type Obserwator = (nazwa: NazwaMotywu) => void;
const obserwatorzy = new Set<Obserwator>();

/** Nakłada motyw i budzi wszystkich, którzy go pokazują (oba przełączniki). */
export function ustawMotyw(nazwa: NazwaMotywu): void {
  zastosujMotyw(nazwa);
  obserwatorzy.forEach((o) => o(nazwa));
}

export function obserwujMotyw(obserwator: Obserwator): () => void {
  obserwatorzy.add(obserwator);
  return () => { obserwatorzy.delete(obserwator); };
}

let nasluchPodpiety = false;

export const KOLEJKA_MOTYWOW: NazwaMotywu[] = [
  'ciemny',
  'przyszly',
];

export function nastepnyMotyw(): NazwaMotywu {
  const obecny = odczytajMotyw();
  const idx = KOLEJKA_MOTYWOW.indexOf(obecny);
  const nastepnyIdx = (idx + 1) % KOLEJKA_MOTYWOW.length;
  return KOLEJKA_MOTYWOW[nastepnyIdx >= 0 ? nastepnyIdx : 0];
}

/**
 * Podpina `themeChanged` z przycisku platformowego.
 * Przełącza pomiędzy dwoma motywami: Ciemny <-> Przyszły
 */
export function podepnijPrzelacznikPlatformy(): () => void {
  if (nasluchPodpiety) return () => {};
  nasluchPodpiety = true;

  const naZmiane = () => ustawMotyw(nastepnyMotyw());
  window.addEventListener('themeChanged', naZmiane);

  return () => {
    window.removeEventListener('themeChanged', naZmiane);
    nasluchPodpiety = false;
  };
}
