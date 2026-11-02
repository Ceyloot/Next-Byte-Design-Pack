import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  isActive?: boolean;
  rightContent?: React.ReactNode;
  dragHandle?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Grid-based sidebar row: title always gets remaining space,
 * right actions never steal from it.
 *
 * Layout: [leftContent (icon+title) 1fr] [rightContent auto]
 */
const SidebarListItem = React.forwardRef<HTMLDivElement, SidebarListItemProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>>(
  ({ icon, title, isActive, rightContent, dragHandle, onClick, className, style, children, onKeyDown, ...rest }, ref) => {
    /*
      KLAWIATURA I CZYTNIK EKRANU (audyt 03.09.2026).

      Wiersz był `div onClick` bez roli i bez `tabIndex` — Tab go omijał,
      Enter nic nie robił, a czytnik ekranu czytał sam tekst, nie „przycisk".
      Rola `button` + `tabIndex=0` + Enter/Spacja robią z niego to, czym
      naprawdę jest; `aria-current` mówi, który wiersz jest otwarty.

      Reagujemy tylko, gdy klawisz padł na SAMYM wierszu: Enter w polu zmiany
      nazwy i Spacja na przycisku „…" (oba stoją w środku) mają zostać przy
      swoich elementach.
    */
    const obsluzKlawisz = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !onClick || e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent);
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'true' : undefined}
        className={cn(
          /*
            MATERIAŁ WIERSZA Z BIBLIOTEKI (04.08.2026).
            Michał: „przerób pasek z konwersacjami na nasze komponenty globalne".

            Było: dwa komplety klas wpisanych z ręki — aktywny wiersz miał
            własny gradient akcentu, własny cień i pasek świetlny na `after`,
            a hover drugi gradient. Każda rozmowa w pasku, każdy folder i każda
            pozycja przypięta jechały tym, zamiast materiałem platformy.

            Jest: `.nb-wiersz-int` / `.nb-wiersz-akt` — te same klasy, które
            niosą pozycje menu w pasku bocznym, liczone od `--nb-wrs-wypelnienie`
            z Panelu Zarządu. Jeden suwak rusza teraz nawigację i listę rozmów
            razem. Akcent zostaje tylko na wierszu aktywnym, bo to stan, nie
            powierzchnia.
          */
          "grid grid-cols-[1fr_auto] items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none overflow-hidden group relative border",
          /* Pierścień fokusu do wewnątrz — wiersz ma `overflow-hidden`,
             a lista przewijana przycięłaby pierścień na zewnątrz. */
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
          isActive
            ? "nb-wiersz-akt border-primary/25 text-foreground"
            : "nb-wiersz-int hover:border-primary/20",
          className
        )}
        onClick={onClick}
        onKeyDown={obsluzKlawisz}
        {...rest}
      >
        {/* Left zone: icon + title — min-w-0 is critical for truncation */}
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {dragHandle}
          {icon}
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <p className={cn(
                "text-[13px] leading-tight truncate",
                isActive ? "text-foreground font-medium" : "text-foreground/80"
              )}>
                {title}
              </p>
            ) : title}
          </div>
        </div>

        {/* Right zone: badges + actions — never shrinks */}
        {rightContent && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {rightContent}
          </div>
        )}

        {children}
      </div>
    );
  }
);


SidebarListItem.displayName = 'SidebarListItem';

export { SidebarListItem };
