import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Dymek } from '@/components/ui/naglowek-sekcji';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  EKRAN USTAWIEŃ MODUŁU — czysta czerń, jeden przycisk (§1c-2)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (19.09.2026): „ma prowadzić do czystego czarnego ekranu bez niczego w tle. Jedyny przycisk
 * na ekranie to przycisk wstecz”.
 *
 * ⚠️ CZARNY ZNACZY CZARNY, NIE „TŁO PANELU”. `fixed inset-0` wychodzi poza kontener modułu, więc nie
 * prześwituje ani siatka, ani warstwa W0 skóry firmy — inaczej „czysty czarny” byłby grafitem
 * w barwie marki.
 *
 * ⚠️ DLACZEGO W BIBLIOTECE, A NIE W PANELU. Czerń jest POZA skalą warstw, której pilnuje zapadka
 * spójności w plikach Panelu — i słusznie, bo w panelu firmowym każdy kolor ma przyjść ze skóry.
 * Ten ekran stoi poza skórą z założenia, więc jego miejsce jest w bibliotece: jeden komponent na całą
 * platformę zamiast wyjątku dopisanego do zapadki w każdym module, który będzie go potrzebował.
 *
 * Nagłówek NA ekranie jest już zwyczajnym paskiem modułu w skórze firmy (Kajetan 19.09.2026: „na tym
 * ekranie masz zrobić taki nagłówek jak w Panelu Klienta”) — czerń zostaje tłem, nie wchodzi w treść.
 */
export const EkranUstawienModulu: React.FC<{
  /** Treść ekranu — zwykle pasek modułu z tytułem i przyciskiem powrotu. */
  children?: React.ReactNode;
}> = ({ children }) => (
  <div className="fixed inset-0 z-50 overflow-auto p-4 sm:p-6" style={{ background: '#000' }}>
    {children}
  </div>
);

/**
 * PRZYCISK POWROTU — jedyny przycisk na ekranie ustawień („jedyny przycisk na ekranie to przycisk
 * wstecz”). Stoi tam, gdzie w module stała zębatka: zębatka wprowadza, strzałka wyprowadza.
 */
export const WsteczZUstawien: React.FC<{ nazwaModulu: string; onWstecz: () => void }> = ({ nazwaModulu, onWstecz }) => (
  <Dymek tytul={`Wróć do: ${nazwaModulu}`} opis="Zamyka ustawienia i wraca do modułu.">
    <button type="button" aria-label={`Wróć do: ${nazwaModulu}`} onClick={onWstecz}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-pole border border-ramka bg-w3 text-t2 transition-colors duration-szybko ease-system hover:bg-najazd hover:text-t1">
      <ArrowLeft className="h-4 w-4" />
    </button>
  </Dymek>
);

export default EkranUstawienModulu;
