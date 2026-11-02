import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  MENU AKCJI — przyciski schowane pod jednym wyzwalaczem
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (08.10.2026), na zrzucie transz z rzędem „Dodaj fakturę · ⇪ · Przelew · 🗑”: „chciałbym te przyciski ukryć pod
 * trzema kropkami” (jak menu ⋮ na liście wycen), a o pasku zakładki: „ten rząd przycisków chciałbym w każdej zakładce
 * ukryć pod jednym przyciskiem, który wszędzie będzie wyglądał tak samo”. Powód: przyciski o różnej szerokości
 * przesuwały kolumny stanu i kwot — „nie pozwalaj na takie przesunięcia”.
 *
 * Ekran podaje TE SAME przyciski co dotąd (`PrzyciskFunkcyjny` / `AkcjaNaglowka`) — w środku menu rysują się same jako
 * pozycje listy: ikona + podpis (przycisk z samą ikoną bierze podpis z dymka), klik zamyka menu. Ekran nie zna wyglądu
 * menu, a menu nie zna akcji.
 *
 *   • `MenuAkcjiRekordu` — ⋮ przy rekordzie (32 px, stałe miejsce w wierszu); lista otwiera się w okienku.
 *   • `MenuAkcji` — przycisk z podpisem w pasku zakładki; lista jest STALE w stronie i tylko się pokazuje, bo przyciski
 *     zakładek trafiają do niej portalem i bywają wyzwalaczami okien (zamknięcie listy nie może ich odmontować).
 *     Bez żadnej akcji w środku przycisk się nie pokazuje.
 */

export interface KontekstMenu { zamknij: () => void }
const KontekstMenuAkcji = createContext<KontekstMenu | null>(null);

/**
 * Przyciski, które trafiają do menu PORTALEM (pasek zakładki Panelu), nie widzą kontekstu menu — kontekst Reacta idzie
 * drzewem komponentów, nie drzewem strony. Gniazdo owija je tym dostawcą (zmierzone 08.10.2026: „Umów montaż” rysował się
 * w menu jako zwykły szary przycisk).
 */
export const DostawcaMenuAkcji = KontekstMenuAkcji.Provider;

/** Kreska między grupami pozycji. */
export const SeparatorMenu: React.FC = () => <div role="separator" className="my-1 h-px bg-podzial" />;

/** Czy przycisk stoi w menu akcji — `AkcjaNaglowka` rysuje się wtedy jako pozycja listy. */
export const useWMenuAkcji = () => useContext(KontekstMenuAkcji);

/** Wygląd pozycji listy — wspólny dla przycisków, które same rysują się w menu. */
export const KLASY_POZYCJI_MENU = 'h-8 w-full justify-start gap-2 border-transparent bg-transparent px-2 text-przycisk shadow-none hover:bg-najazd';

const LISTA = 'flex min-w-52 flex-col gap-0.5 p-1';

/** Klik w pozycję zamyka menu — chyba że pozycja sama otwiera okienko (wyzwalacz Radixa), wtedy zostaje jego kotwicą. */
export const zamknijPoKliku = (menu: KontekstMenu | null, e: React.MouseEvent<HTMLElement>) => {
  if (menu && !e.currentTarget.hasAttribute('aria-haspopup')) menu.zamknij();
};

export const MenuAkcjiRekordu: React.FC<{ children: React.ReactNode; etykieta?: string }> = ({ children, etykieta = 'Akcje' }) => {
  const [otwarte, setOtwarte] = useState(false);
  return (
    <Popover open={otwarte} onOpenChange={setOtwarte} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="akcja" className="w-8 px-0" aria-label={etykieta} onClick={e => e.stopPropagation()}>
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      {/* Klik w środku nie dochodzi do wiersza (zdarzenia Reacta przechodzą przez portal). */}
      {/* Bez fokusu na pierwszej pozycji przy otwarciu myszą — dostawała ramkę i dymek, jakby była wybrana (08.10.2026). */}
      <PopoverContent align="end" className="w-auto p-0" onClick={e => e.stopPropagation()} onOpenAutoFocus={e => e.preventDefault()}>
        <KontekstMenuAkcji.Provider value={{ zamknij: () => setOtwarte(false) }}>
          <div className={LISTA}>{children}</div>
        </KontekstMenuAkcji.Provider>
      </PopoverContent>
    </Popover>
  );
};

export const MenuAkcji: React.FC<{
  children: React.ReactNode; etykieta?: string; className?: string;
  /** sterowanie z zewnątrz — gdy ten sam stan musi znać gniazdo z przyciskami przychodzącymi portalem */
  otwarte?: boolean; onOtwarte?: (o: boolean) => void;
}> = ({ children, etykieta = 'Akcje', className, otwarte: otwarteZ, onOtwarte }) => {
  const [otwarteW, setOtwarteW] = useState(false);
  const otwarte = otwarteZ ?? otwarteW;
  const setOtwarte = (o: boolean | ((p: boolean) => boolean)) => {
    const n = typeof o === 'function' ? o(otwarte) : o;
    if (onOtwarte) onOtwarte(n); else setOtwarteW(n);
  };
  const [puste, setPuste] = useState(true);
  const korzen = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  /* Przyciski przychodzą portalem i znikają przy zmianie zakładki — liczymy je na żywo. */
  useLayoutEffect(() => {
    const el = lista.current;
    if (!el) return undefined;
    const licz = () => setPuste(!el.querySelector('button, a[href]'));
    licz();
    const obserwator = new MutationObserver(licz);
    obserwator.observe(el, { childList: true, subtree: true });
    return () => obserwator.disconnect();
  }, []);

  useEffect(() => {
    if (!otwarte) return undefined;
    /* Okienka i listy otwarte Z MENU leżą w portalach — klik w nie nie zamyka menu. */
    const poza = (e: PointerEvent) => {
      const cel = e.target as Element | null;
      if (korzen.current?.contains(cel) || cel?.closest?.('[data-radix-popper-content-wrapper], [role="dialog"]')) return;
      setOtwarte(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOtwarte(false); };
    document.addEventListener('pointerdown', poza);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', poza); document.removeEventListener('keydown', esc); };
  }, [otwarte]);

  return (
    <div ref={korzen} className={cn('relative', puste && 'hidden', className)}>
      <Button variant="akcent" size="akcja" aria-haspopup="menu" aria-expanded={otwarte} onClick={() => setOtwarte(o => !o)}>
        {etykieta}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-szybko ease-system', otwarte && 'rotate-180')} />
      </Button>
      <div className={cn('absolute right-0 top-full z-50 mt-1 rounded-xl border nb-szklo nb-szklo-plynne nb-szklo-tafla shadow-okno', !otwarte && 'hidden')}>
        <KontekstMenuAkcji.Provider value={{ zamknij: () => setOtwarte(false) }}>
          <div ref={lista} role="menu" className={LISTA}>{children}</div>
        </KontekstMenuAkcji.Provider>
      </div>
    </div>
  );
};

export default MenuAkcji;
