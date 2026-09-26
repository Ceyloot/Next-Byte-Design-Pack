import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Move, PanelBottom, PanelLeft, PanelRight, PanelTop } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationMode, type PozycjaPaska } from '@/contexts/NavigationModeContext';
import { usePillNavbarAccess } from '@/hooks/usePillNavbarAccess';
import { cn } from '@/lib/utils';

/**
 * Przeciąganie paska do krawędzi (góra / dół = pigułka, lewo / prawo = pasek
 * boczny). Progi 22% jak w podglądzie Panelu 2.0 — ruch w stronę brzegu
 * dokuje wcześniej, niż kursor tam dojedzie.
 *
 * Pigułka jest dostępna tylko dla kont z dostępem (`usePillNavbarAccess`),
 * więc dla pozostałych góra i dół nie są celami: pasek zostaje po bokach.
 */
export function useDokowanie() {
  const { pozycja, setPozycja } = useNavigationMode();
  const { canUsePillNavbar } = usePillNavbarAccess();
  const [cel, setCel] = useState<PozycjaPaska | null>(null);
  const [aktywne, setAktywne] = useState(false);

  const start = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let ostatni: PozycjaPaska | null = null;
    setAktywne(true);

    const ruch = (ev: PointerEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const { clientX: x, clientY: y } = ev;
      let dok: PozycjaPaska;
      if (!canUsePillNavbar) dok = x < w / 2 ? 'lewo' : 'prawo';
      else if (x < w * 0.22) dok = 'lewo';
      else if (x > w * 0.78) dok = 'prawo';
      else if (y > h * 0.78) dok = 'dol';
      else if (y < h * 0.22) dok = 'gora';
      else {
        const dyst = [['lewo', x], ['prawo', w - x], ['gora', y], ['dol', h - y]] as const;
        dok = dyst.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
      }
      ostatni = dok;
      setCel(dok);
    };

    const koniec = () => {
      window.removeEventListener('pointermove', ruch);
      window.removeEventListener('pointerup', koniec);
      window.removeEventListener('pointercancel', koniec);
      if (ostatni && ostatni !== pozycja) setPozycja(ostatni);
      setCel(null);
      setAktywne(false);
    };

    window.addEventListener('pointermove', ruch);
    window.addEventListener('pointerup', koniec);
    window.addEventListener('pointercancel', koniec);
  }, [pozycja, setPozycja, canUsePillNavbar]);

  return { start, cel, aktywne, pozycja, canUsePillNavbar };
}

/*
 * POLA DOKOWANIA (26.09.2026, Artur: „lepsze te pola, gdzie wrzucić navbar").
 * Były cztery przerywane pasy 76 px wzdłuż krawędzi — nie mówiły, CZYM pasek
 * się stanie. Teraz każde pole ma kształt wyniku: pastylka po bokach, pigułka
 * u góry i na dole, z ikoną i podpisem. Pole, nad którym jest kursor, zapala
 * się akcentem; obecne miejsce ma znacznik „teraz".
 *
 * Szerokość pastylek = 22% ekranu (te same progi co w `useDokowanie`),
 * a pigułki stoją MIĘDZY nimi, więc pola nigdy na siebie nie nachodzą.
 */
const BOK = 'clamp(140px, 22vw, 240px)';

const POLA: Record<PozycjaPaska, { ikona: typeof PanelLeft; nazwa: string; styl: React.CSSProperties }> = {
  lewo: { ikona: PanelLeft, nazwa: 'Pasek boczny', styl: { left: 12, top: 12, bottom: 12, width: BOK } },
  prawo: { ikona: PanelRight, nazwa: 'Pasek boczny', styl: { right: 12, top: 12, bottom: 12, width: BOK } },
  gora: { ikona: PanelTop, nazwa: 'Pasek u góry', styl: { top: 12, height: 56, left: `calc(${BOK} + 24px)`, right: `calc(${BOK} + 24px)` } },
  dol: { ikona: PanelBottom, nazwa: 'Pasek na dole', styl: { bottom: 12, height: 56, left: `calc(${BOK} + 24px)`, right: `calc(${BOK} + 24px)` } },
};

function PodgladDokowania({ aktywne, cel, obecna, zPigulka }: {
  aktywne: boolean; cel: PozycjaPaska | null; obecna: PozycjaPaska; zPigulka: boolean;
}) {
  if (!aktywne) return null;
  const dostepne: PozycjaPaska[] = zPigulka ? ['lewo', 'prawo', 'gora', 'dol'] : ['lewo', 'prawo'];
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] animate-in fade-in duration-150">
      {/* Przyciemnienie — pola mają być jedyną rzeczą, na którą patrzy oko */}
      <div className="absolute inset-0 bg-background/45" />
      {dostepne.map((p) => {
        const { ikona: Ikona, nazwa, styl } = POLA[p];
        const trafione = cel === p;
        const poziome = p === 'gora' || p === 'dol';
        return (
          <div
            key={p}
            style={styl}
            className={cn(
              'absolute flex items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-150',
              poziome ? 'flex-row' : 'flex-col',
              trafione
                ? 'border-primary/70 bg-primary/15 text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12),0_12px_32px_-8px_hsl(var(--primary)/0.35)]'
                : 'border-dashed border-foreground/20 bg-foreground/[0.04] text-foreground/45',
            )}
          >
            <Ikona className={cn('h-5 w-5 transition-transform', trafione && 'scale-110')} />
            <span className="text-xs font-semibold">{nazwa}</span>
            {p === obecna && (
              <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-medium opacity-70">teraz</span>
            )}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

/**
 * Uchwyt do złapania paska — zwykły przycisk w rzędzie kontrolek paska,
 * z ikoną „przesuń". Wcześniej 6 kropek wisiało na górnej krawędzi tafli:
 * małe, bez znaczenia i przyklejone do rantu karty.
 * `touch-none`, bo inaczej na tablecie palec przewijał stronę zamiast ciągnąć.
 */
export function UchwytPaska({ className, kropki = false }: { className?: string; kropki?: boolean }) {
  const { start, cel, aktywne, pozycja, canUsePillNavbar } = useDokowanie();
  /* `kropki` — cichy uchwyt z sześcioma kropkami, 1:1 z górnym paskiem podglądu. */
  if (kropki) {
    return (
      <>
        <button
          type="button"
          onPointerDown={start}
          title="Złap i przeciągnij, aby przypiąć nawigację (góra / dół / lewo / prawo)"
          aria-label="Przeciągnij, aby przypiąć pasek do innej krawędzi"
          className={cn('-ml-1 flex h-6 w-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing', className)}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <PodgladDokowania aktywne={aktywne} cel={cel} obecna={pozycja} zPigulka={canUsePillNavbar} />
      </>
    );
  }
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onPointerDown={start}
            aria-label="Przeciągnij, aby przypiąć pasek do innej krawędzi"
            className={cn(
              'nb-ikona-kafel flex h-7 w-7 touch-none cursor-grab items-center justify-center rounded-lg border text-foreground/70 transition-colors hover:text-primary active:cursor-grabbing',
              className,
            )}
          >
            <Move className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="hidden md:block">Przeciągnij do krawędzi</TooltipContent>
      </Tooltip>
      <PodgladDokowania aktywne={aktywne} cel={cel} obecna={pozycja} zPigulka={canUsePillNavbar} />
    </>
  );
}
