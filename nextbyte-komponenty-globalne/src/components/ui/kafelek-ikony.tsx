import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zmiennaTonu, type TonStatusu } from '@/components/ui/status';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KAFELEK IKONY — jeden kafelek, trzy rodzaje (STANDARD-WYGLADU §17)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (06.10.2026): „musimy mieć coś, co pozwoli na zastosowanie niemal każdej kolorystyki motywu
 * i nic nie będzie się ze sobą zlewać”. Polityka ikon, zaakceptowana tego dnia:
 *   • NAGŁÓWEK (domyślnie) — `.kafelek-ikony`, barwy z polityki „Ikony” w Personalizacji (marka);
 *   • REKORD — `.kafelek-rekordu`, cichy: tło pola, obwódka pola, szary znak (motyw, nie marka);
 *   • STAN — `.kafelek-stanu` z `--ton`: barwa stanu 10 % tła, 45 % obwódki, znak w barwie stanu.
 * Zawsze 32 px ze znakiem 16 px — proporcję pilnuje klasa (`> svg`), nie klasa na ikonie.
 * Przed nim kafelki KPI ośmiu ekranów rysowały własne `bg-primary/10` z czerwonym albo żółtym znakiem.
 */
export interface KafelekIkonyProps {
  /** Komponent ikony (lucide) albo gotowy węzeł. */
  ikona: LucideIcon | React.ElementType | React.ReactNode;
  /** Ton stanu — kafelek stanu. `neutralny` albo brak = rodzaj z `rodzaj`. */
  ton?: TonStatusu | null;
  /** Bez tonu: nagłówek (marka, domyślnie) albo rekord (cichy kafelek wiersza). */
  rodzaj?: 'naglowek' | 'rekord';
  className?: string;
}

export const klasaKafelka = (ton: TonStatusu | null | undefined, rodzaj: 'naglowek' | 'rekord' = 'naglowek') =>
  ton && ton !== 'neutralny' ? 'kafelek-stanu' : rodzaj === 'rekord' ? 'kafelek-rekordu' : 'kafelek-ikony';

export const KafelekIkony: React.FC<KafelekIkonyProps> = ({ ikona, ton, rodzaj = 'naglowek', className }) => {
  const stan = ton && ton !== 'neutralny' ? ton : null;
  /* Komponent (funkcja albo `forwardRef` z lucide) rysujemy sami w 16 px; gotowy węzeł wstawiamy, jak jest. */
  const jestKomponentem = typeof ikona === 'function'
    || (typeof ikona === 'object' && ikona !== null && !Array.isArray(ikona) && !React.isValidElement(ikona));
  const Ikona = jestKomponentem ? (ikona as React.ElementType) : null;
  return (
    <span aria-hidden="true"
      className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-pole', klasaKafelka(ton, rodzaj), className)}
      style={stan ? ({ '--ton': zmiennaTonu(stan) } as React.CSSProperties) : undefined}>
      {Ikona ? <Ikona className="h-4 w-4" /> : (ikona as React.ReactNode)}
    </span>
  );
};

export default KafelekIkony;
