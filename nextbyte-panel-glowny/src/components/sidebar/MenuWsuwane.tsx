import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePanelPaska } from '@/contexts/PanelPaskaContext';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  WSUWANIE PASKA BOCZNEGO W MENU NARZĘDZIA
 * ════════════════════════════════════════════════════════════════════════
 *
 * Wzorzec zadany przez Michała: „Motion Slide Menu" z ui.unlumen.com.
 * Wzięty MECHANIZM — dwa poziomy przesuwające się w przeciwnych kierunkach
 * i wiersz powrotu u góry. NIE kod referencji: tamten buduje własne drzewo
 * pozycji z propsów, a u nas poziom korzenia to istniejące sekcje paska,
 * a poziom narzędzia to PORTAL z gotowym panelem strony.
 *
 * ── CO SIĘ NIE RUSZA ────────────────────────────────────────────────────
 * Michał wprost: „na górze zawsze jest to, a na dole to". Nagłówek z logo
 * i szukajką oraz pasek kart w stopce stoją nieruchomo — ten komponent
 * obejmuje WYŁĄCZNIE środek paska.
 *
 * ── DLACZEGO OBIE WARSTWY ŻYJĄ CAŁY CZAS ────────────────────────────────
 * Pierwsza wersja przełączała poziomy przez `AnimatePresence`. Gniazdo portalu
 * znikało wtedy z DOM razem z poziomem — a strona portalem celuje w KONKRETNY
 * węzeł. Gdy węzła nie ma w chwili renderu strony, panel się nie pojawia
 * i wsunięcie kończy się pustą kolumną.
 *
 * Dlatego obie warstwy są zamontowane zawsze i tylko przesuwane. Kosztuje to
 * jeden nieaktywny poddrzewo w DOM, a daje pewność, że cel portalu istnieje
 * niezależnie od tego, w którą stronę idzie animacja.
 *
 * ── POZIOM WYNIKA Z TRASY, ALE DA SIĘ GO COFNĄĆ RĘCZNIE ─────────────────
 * Gdyby zależał tylko od kliknięcia, odświeżenie strony wyrzucałoby do
 * korzenia mimo otwartego narzędzia. Gdyby tylko od trasy — przycisk powrotu
 * nie miałby jak zadziałać bez opuszczenia narzędzia. Stąd: obecność panelu
 * USTAWIA poziom, a ręczny powrót nadpisuje go do najbliższej zmiany
 * narzędzia.
 */

const sprezyna = { type: 'spring' as const, duration: 0.3, bounce: 0 };

interface Props {
  /** Poziom korzenia — dotychczasowe sekcje paska. */
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MenuWsuwane: React.FC<Props> = ({ children, className, style }) => {
  const { tytul, ustawGniazdo, wymuszonyKorzen, wrocDoMenu, wrocDoNarzedzia } = usePanelPaska();
  const { state, isMobile } = useSidebar();
  const mniejRuchu = useReducedMotion();

  /*
    ── SZYNA NIE JEST MIEJSCEM NA PANEL NARZĘDZIA ────────────────────────
    Przeoczyłem to przy pierwszym podejściu i Michał od razu zobaczył skutek:
    po zwinięciu paska panel Notatek wciskał się w 56-pikselową szynę i robił
    się z tego bałagan — wiszące liczniki, ucięte etykiety, poszatkowane
    wiersze. Panel narzędzia zakłada kolumnę, nie szynę ikon.

    W stanie zwiniętym pokazujemy więc ZAWSZE korzeń: szyna ma być tym, czym
    jest — skrótami do sekcji. Panel wraca w tej samej chwili, w której pasek
    się rozwinie, bo warstwa i tak żyje w DOM.
  */
  const zwiniety = state === 'collapsed' && !isMobile;

  /*
    ── RĘCZNY POWRÓT DO KORZENIA ─────────────────────────────────────────
    Po kliknięciu „‹ Chat AI" pasek wraca do menu, a użytkownik zostaje na
    stronie narzędzia. Ten stan trzeba kiedyś skasować — inaczej pasek
    zostałby zwinięty na stałe.

    BŁĄD PIERWSZEJ WERSJI (zgłosił Michał): kasowałem go WYŁĄCZNIE przy zmianie
    `tytul`. Gdy stoisz na /chat-ai, cofniesz pasek i klikniesz „Chat AI"
    jeszcze raz, to ani tytuł, ani trasa się NIE ZMIENIAJĄ — React Router nie
    przeładowuje tej samej ścieżki. Blokada zostawała i pasek nie chciał
    wsunąć się z powrotem.

    Dlatego kasuje ją także KAŻDE kliknięcie w link menu. Celowo `a[href]`,
    a nie dowolny klik: rozwinięcie podmenu strzałką to `<button>` i nie ma
    znaczyć „wejdź w narzędzie".
  */
  const naKlikWMenu = (e: React.MouseEvent) => {
    if ((e.target as Element | null)?.closest?.('a[href]')) wrocDoNarzedzia();
  };

  const wNarzedziu = !!tytul && !wymuszonyKorzen && !zwiniety;
  const przejscie = mniejRuchu ? { duration: 0 } : sprezyna;

  const warstwa = (aktywna: boolean, przesuniecieGdyNieaktywna: string) => ({
    animate: { x: aktywna ? '0%' : przesuniecieGdyNieaktywna, opacity: aktywna ? 1 : 0 },
    transition: przejscie,
    /* Nieaktywna warstwa wypada z kolejności czytania i z tabulacji — inaczej
       Tab wędrowałby po niewidocznym menu, a czytnik ekranu czytałby oba. */
    'aria-hidden': !aktywna,
    className: cn(
      'absolute inset-0 flex flex-col',
      aktywna ? 'pointer-events-auto' : 'pointer-events-none'
    ),
  });

  return (
    <div className={cn('relative min-h-0 flex-1 overflow-hidden', className)} style={style}>
      {/* WARSTWA 1 — korzeń: sekcje paska */}
      <motion.div initial={false} {...warstwa(!wNarzedziu, '-22%')}>
        <div className="min-h-0 flex-1 overflow-y-auto" onClickCapture={naKlikWMenu}>
          {children}
        </div>
      </motion.div>

      {/* WARSTWA 2 — narzędzie: wiersz powrotu + gniazdo portalu */}
      <motion.div initial={false} {...warstwa(wNarzedziu, '22%')}>
        {/*
          WIERSZ POWROTU MA WYGLĄDAĆ NA PRZYCISK.
          Michał: „przycisk powrotu u góry w ogóle się nie wyróżnia i zlewa się
          gdzieś i znika w oku". Był zwykłym tekstem ze strzałką — na tle listy
          pozycji menu czytał się jak nagłówek, a nie jak coś do kliknięcia.
          Dostaje więc własną powierzchnię, akcentową strzałkę i kreskę
          oddzielającą go od treści narzędzia: to jest granica dwóch poziomów,
          więc ma być widoczna.
        */}
        <button
          type="button"
          onClick={wrocDoMenu}
          tabIndex={wNarzedziu ? 0 : -1}
          aria-label={`Wróć do menu — opuść ${tytul ?? ''}`}
          className="group mx-2 mb-2 mt-1 flex h-10 shrink-0 items-center gap-2 rounded-lg border border-primary/25 bg-primary/[0.08] px-2.5 text-left text-[13px] font-semibold text-foreground transition-colors hover:border-primary/45 hover:bg-primary/[0.14]"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5" />
          <span className="truncate">{tytul ?? ''}</span>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Menu
          </span>
        </button>

        {/* Cel portalu strony. Istnieje niezależnie od animacji — patrz nagłówek. */}
        <div ref={ustawGniazdo} className="min-h-0 flex-1 overflow-hidden" />
      </motion.div>
    </div>
  );
};

export default MenuWsuwane;
