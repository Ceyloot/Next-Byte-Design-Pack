import { useEffect, useState } from 'react';

/*
  CZY PLATFORMA MA TERAZ JASNY MOTYW — jedno źródło zamiast kopii.

  Motywy NextByte żyją w bazie (`color_themes` + `color_settings`) i wchodzą
  jako zmienne inline na `<html>` z `useGlobalTheme`. `next-themes` NIE ma tu
  dostawcy, więc jego `resolvedTheme` jest zawsze `undefined` — kto o motyw
  pyta `useTheme()`, dostaje odpowiedź „nie wiem”, czytaną potem jako jasny.

  Jedyne wiarygodne źródło to sama zmienna `--background`: motyw jest jasny,
  gdy jej jasność przekracza 50%. Tę samą regułę stosuje `zmienneSzklaDlaMotywu`
  (tam na `--card`), więc hook i materiał szkła zawsze zgadzają się co do tego,
  jaki motyw wszedł.

  Do 23.09.2026 ta funkcja żyła w dwóch identycznych kopiach
  (`SidebarHeader`, `PhotoGenerationAnimation`); trzecim użytkownikiem jest
  tablica, która musi wiedzieć, czy pod ciemnym motywem leży jasne płótno.
*/

function czyJasnyTeraz(): boolean {
  if (typeof document === 'undefined') return false;
  const tlo = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  // Format motywu: "H S% L%" — liczy się ostatnia wartość, jasność.
  const dopasowanie = tlo.match(/(\d+(?:\.\d+)?)%\s*$/);
  return dopasowanie ? Number(dopasowanie[1]) > 50 : false;
}

export function useJasnyMotyw(): boolean {
  const [jasny, setJasny] = useState(czyJasnyTeraz);

  useEffect(() => {
    const sprawdz = () => setJasny(czyJasnyTeraz());
    sprawdz();
    // Motyw podmienia zmienne w `style` na `<html>` i przestawia `data-theme`.
    const obserwator = new MutationObserver(sprawdz);
    obserwator.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    window.addEventListener('themeChanged', sprawdz);
    return () => {
      obserwator.disconnect();
      window.removeEventListener('themeChanged', sprawdz);
    };
  }, []);

  return jasny;
}
