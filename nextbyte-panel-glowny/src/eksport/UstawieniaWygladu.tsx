import { useEffect } from 'react';
import { useKomponentyGlobalne } from '@/hooks/useKomponentyGlobalne';
import { applyFontPreset, fetchGlobalFontPreset } from '@/components/admin/settings/FontSettings';
import { odczytajMotyw, podepnijPrzelacznikPlatformy, zastosujMotyw } from './motyw';

/**
 * Wszystko, co na platformie ustawia wygląd przy starcie (`App.tsx`), bez
 * reszty aplikacji: tokeny komponentów z bazy, zestaw fontów i motyw.
 *
 * NIC NIE RYSUJE. Stał tu pływający przełącznik motywu w lewym dolnym rogu —
 * był potrzebny, dopóki przycisk słońca/księżyca przy logo nie zmieniał
 * wyglądu (zapisywał wybór do bazy i liczył na `useGlobalTheme`, którego
 * w paczce nie ma). Od kiedy `podepnijPrzelacznikPlatformy` łapie jego
 * zdarzenie, przełączniki były dwa i pływający tylko zasłaniał róg ekranu.
 */
export function UstawieniaWygladu() {
  useKomponentyGlobalne();

  useEffect(() => {
    try {
      applyFontPreset(localStorage.getItem('nextbyte_font_preset') || 'nextbyte');
    } catch {
      /* nic */
    }
    fetchGlobalFontPreset().then((preset) => applyFontPreset(preset));
  }, []);

  /* Motyw zapamiętany z poprzedniej wizyty; dalsze zmiany robi przycisk
     przy logo przez zdarzenie `themeChanged`. */
  useEffect(() => { zastosujMotyw(odczytajMotyw()); }, []);
  useEffect(() => podepnijPrzelacznikPlatformy(), []);

  return null;
}
