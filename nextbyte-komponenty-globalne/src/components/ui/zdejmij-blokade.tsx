import * as React from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  STRAŻNIK BLOKADY KLIKNIĘĆ PO ZAMKNIĘCIU OKNA (28.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Michał: „po usunięciu tablicy zacina się cała strona". Zmierzone w Tablicach
 * (menu kropek → „Usuń" → okno potwierdzenia → „Anuluj"): `body` zostaje na
 * stałe z `pointer-events: none`. Strona wygląda normalnie, a nic nie klika.
 *
 * Mechanizm: każda warstwa Radix zapamiętuje przy otwarciu ówczesne
 * `pointer-events` body i przywraca je przy zamknięciu. Menu i okno używają
 * RÓŻNYCH kopii tego mechanizmu (osobne pakiety), więc okno otwarte z pozycji
 * menu zapamiętuje blokadę menu jako „stan wyjściowy" i po zamknięciu ją
 * przywraca — już po tym, jak menu swoją zdjęło.
 *
 * Wcześniejsze czyszczenie siedziało w efekcie komponentu-owijki okna
 * (`DialogContent`, `AlertDialogContent`) i nie działało: owijka przy
 * zamknięciu NIE znika, znika tylko zawartość Radix wewnątrz portalu.
 * Ten strażnik stoi WEWNĄTRZ zawartości, więc odmontowuje się dokładnie
 * z zamknięciem okna. Czyści po chwili (Radix przywraca synchronicznie przy
 * odmontowaniu) i tylko wtedy, gdy nie stoi już inne otwarte okno ani menu.
 */
export const ZdejmijBlokadePoZamknieciu: React.FC = () => {
  React.useEffect(() => () => {
    setTimeout(() => {
      // Timer potrafi przeżyć zburzenie jsdom w testach.
      if (typeof document === 'undefined') return;
      const inneOtwarte = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"]',
      );
      if (inneOtwarte) return;
      document.body.style.pointerEvents = '';
      document.body.classList.remove('pointer-events-none');
    }, 120);
  }, []);
  return null;
};
