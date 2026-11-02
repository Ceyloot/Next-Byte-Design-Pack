import React, { createContext, useContext, useEffect, useRef } from 'react';

/**
 * TRYB „TYLKO DO ODCZYTU” DLA CAŁEGO FRAGMENTU EKRANU (07.10.2026, uprawnienia zespołu [firma klienta]).
 *
 * Wyłączona „Edycja” zakładki ma dać zakładkę do czytania, bez przepisywania każdego pola z osobna. Domyślnie blokuje
 * KAŻDĄ kontrolkę w środku — także tę dopisaną jutro przez kogoś, kto o trybie nie wie. Zwolnione są tylko kontrolki,
 * które pokazują, a niczego nie zmieniają: oznaczone `W_ODCZYCIE` (atrybut `data-w-odczycie` na kontrolce albo na jej
 * przodku). Biblioteka oznacza sama zakładki, pigułki, rozwijanie i filtry; przycisk podglądu dostaje `wOdczycie`
 * (`Button`), pole szukania — `wOdczycie` (`Input`).
 *
 * Dlaczego nie `fieldset disabled` (tak było do 08.10.2026): fieldset gasi każdy przycisk bez wyjątku — w zakładce
 * tylko do odczytu nie dało się pobrać faktury, rozwinąć sekcji ani przełączyć widoku (zmierzone w Panelu i Bazie).
 *
 * Kontekst czytają kontrolki, które edytuje się kliknięciem w tekst (`PoleWizytowki`). Granica: blokada działa na
 * drzewie DOM, więc nie sięga treści wyniesionej portalem (okna, pasek akcji zakładki) — taki portal owija się tym
 * komponentem jeszcze raz (`AkcjeZakladki`).
 */
const KontekstTylkoDoOdczytu = createContext(false);

export const useTylkoDoOdczytu = () => useContext(KontekstTylkoDoOdczytu);

/** Kontrolka, która tylko pokazuje — działa także w trybie tylko do odczytu. Na kontrolce albo na jej przodku. */
export const W_ODCZYCIE = { 'data-w-odczycie': '' } as const;

const KONTROLKI = 'button, input, select, textarea, [role="checkbox"], [role="switch"], [role="radio"], [role="combobox"], [role="slider"], [contenteditable="true"]';
/** Klawisze, które nic nie zmieniają: wyjście z okna i chodzenie po stronie. */
const KLAWISZE_WOLNE = new Set(['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta']);

/** Kontrolka, której zdarzenie trzeba zatrzymać — albo null. */
export function kontrolkaZablokowana(cel: EventTarget | null, granica: Element): Element | null {
  if (!(cel instanceof Element)) return null;
  const k = cel.closest(KONTROLKI);
  if (!k || !granica.contains(k)) return null;
  return k.closest('[data-w-odczycie]') ? null : k;
}

export const TylkoDoOdczytu: React.FC<{ wlaczone: boolean; children: React.ReactNode }> = ({ wlaczone, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!wlaczone || !el) return;
    const zatrzymaj = (e: Event) => {
      if (e instanceof KeyboardEvent && KLAWISZE_WOLNE.has(e.key)) return;
      if (!kontrolkaZablokowana(e.target, el)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const zdarzenia = ['click', 'dblclick', 'pointerdown', 'mousedown', 'keydown', 'beforeinput', 'paste', 'cut', 'drop'];
    zdarzenia.forEach((z) => el.addEventListener(z, zatrzymaj, true));
    return () => zdarzenia.forEach((z) => el.removeEventListener(z, zatrzymaj, true));
  }, [wlaczone]);
  return (
    <KontekstTylkoDoOdczytu.Provider value={wlaczone}>
      <div ref={ref} className="contents" data-tylko-odczyt={wlaczone ? '' : undefined}>{children}</div>
    </KontekstTylkoDoOdczytu.Provider>
  );
};
