import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextByteModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  contentClassName?: string;
  /** @deprecated X is always shown. Use hideCloseButton to hide it. */
  showCloseButton?: boolean;
  hideCloseButton?: boolean;
  /** Klasa zasłony pod oknem — patrz `DialogContent.overlayClassName`. */
  zaslonaClassName?: string;
  headerGradient?: boolean;
  headerColor?: string; // CSS color value for icon bg and header gradient
  /**
   * Nagłówek WYŚRODKOWANY, ikona nad tytułem — dla okien, które są momentem,
   * a nie komunikatem: jednorazowa oferta, powitanie, gratulacje.
   *
   * Domyślny układ (ikona po lewej, tekst obok) jest właściwy dla okien
   * roboczych, gdzie nagłówek ma tylko nazwać zawartość i zejść z drogi.
   * Tutaj nagłówek JEST treścią — dostaje więc oś symetrii, poświatę pod ikoną
   * i tytuł w gradiencie marki.
   */
  naglowekWysrodkowany?: boolean;
  /** Optional sticky footer area for action buttons. */
  footer?: React.ReactNode;
}

export const NextByteModal: React.FC<NextByteModalProps> = ({
  children,
  open,
  onOpenChange,
  title,
  description,
  icon,
  maxWidth = '3xl',
  hideCloseButton = false,
  zaslonaClassName,
  headerGradient = true,
  headerColor,
  naglowekWysrodkowany = false,
  contentClassName,
  footer,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlayClassName={zaslonaClassName}
        hideCloseButton
        className={cn(
          maxWidthClasses[maxWidth],
          'h-auto max-h-[85dvh] overflow-hidden p-0 gap-0 flex flex-col touch-pan-y',
          /*
            BEZ `DesignSystemClasses.futuristicComponent` (08.09.2026).
            Michał, ze zrzutu okna Odkryj: „światło jest inaczej niż biała
            ramka". Ta klasa niosła `rounded-lg` i `shadow-xl`, a okno bazowe
            z `dialog.tsx` ma `rounded-3xl` i cień z pierścieniem akcentu.
            twMerge brał ostatnią klasę: pudełko dostawało promień 8 px,
            podczas gdy połysk szkła w środku (span `rounded-3xl`) zostawał
            na 24 px — jasny róg wystawał poza obwódkę. `shadow-xl` zjadał
            też pierścień (box-shadow to jedna właściwość). Materiał okno ma
            już z wariantu bazowego; tu zostaje tylko obwódka akcentu.
          */
          'border-primary/20',
          contentClassName
        )}
      >
        {/* Sticky Header — title bar with X like macOS/Windows */}
        <DialogHeader
          className={cn(
            'shrink-0 border-b border-foreground/[0.08]',
            naglowekWysrodkowany ? 'relative px-5 pt-7 pb-6 overflow-hidden' : 'px-5 py-4',
            /* Poświata z góry zamiast paska z lewej — przy osi symetrii gradient
               poziomy przeciągałby wzrok w bok i psuł wyśrodkowanie. */
            naglowekWysrodkowany && !headerColor &&
              'before:absolute before:left-1/2 before:top-0 before:h-32 before:w-72 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-primary/20 before:blur-3xl',
            !naglowekWysrodkowany && headerGradient && !headerColor && 'bg-gradient-to-r from-primary/10 via-primary/[0.03] to-transparent'
          )}
          style={
            headerColor && headerGradient
              ? {
                  background: `linear-gradient(to right, ${headerColor}18, transparent)`,
                  borderColor: `${headerColor}33`,
                }
              : undefined
          }
        >
          <div className={cn(
            'flex gap-3',
            naglowekWysrodkowany
              ? 'flex-col items-center text-center'
              : 'items-center justify-between',
          )}>
            <div className={cn(
              'min-w-0 flex-1 gap-3',
              naglowekWysrodkowany ? 'flex flex-col items-center' : 'flex items-center',
            )}>
              {icon && (
                <div
                  className={cn(
                    'shrink-0 flex items-center justify-center shadow-lg',
                    naglowekWysrodkowany
                      /* Większa i okrągła, z poświatą — ikona jest tu pierwszą
                         rzeczą, na którą pada wzrok, a nie znacznikiem obok tekstu. */
                      ? 'w-14 h-14 rounded-2xl shadow-[0_8px_32px_hsl(var(--primary)/0.35)]'
                      : 'w-10 h-10 rounded-xl',
                    !headerColor && 'bg-gradient-to-br from-primary to-primary/70'
                  )}
                  style={
                    headerColor
                      ? { background: `linear-gradient(135deg, ${headerColor}, ${headerColor}cc)` }
                      : undefined
                  }
                >
                  {icon}
                </div>
              )}
              <div className={cn('min-w-0 flex-1', naglowekWysrodkowany ? 'text-center' : 'text-left')}>
                <DialogTitle className={cn(
                  'font-semibold',
                  naglowekWysrodkowany
                    /* Gradient marki na tytule i BEZ `truncate` — wyśrodkowany
                       nagłówek zawija się w dwie linie zamiast gubić koniec zdania. */
                    ? 'text-xl sm:text-2xl bg-gradient-to-b from-foreground to-primary bg-clip-text text-transparent text-balance'
                    : 'text-lg sm:text-xl text-foreground truncate',
                )}>
                  {title}
                </DialogTitle>
                {description && (
                  // `truncate` ucinało opis do JEDNEJ linii z wielokropkiem, więc
                  // ostrzeżenia w rodzaju „Tego nie da się cofnąć" nigdy nie docierały
                  // do końca — a to zwykle najważniejsza część zdania. Tytuł zostaje
                  // jednoliniowy (jest krótki z definicji), opis zawija się do trzech
                  // linii: układ nadal jest chroniony, treść już nie ginie.
                  <DialogDescription className={cn(
                    'text-muted-foreground line-clamp-3',
                    naglowekWysrodkowany ? 'text-sm mt-1.5 max-w-sm mx-auto' : 'text-xs sm:text-sm mt-0.5',
                  )}>
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Zamknij"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>

        {/* Sticky Footer (optional) */}
        {footer && (
          <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-foreground/[0.08] nb-szklo nb-szklo-plynne flex items-center justify-end gap-2 flex-wrap">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper component for status cards within NextByteModal
export const NextByteStatusCard: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div
    className="nb-szklo nb-szklo-plynne nb-kafelek p-4 rounded-2xl border border-primary/20"
  >
    <div className="flex items-center gap-2 mb-4">
      {icon && <div className="text-primary">{icon}</div>}
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
    </div>
    {children}
  </div>
);

// Helper component for info sections within NextByteModal
export const NextByteInfoSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div
    className="nb-szklo nb-szklo-plynne nb-kafelek p-4 rounded-2xl border border-primary/20"
  >
    <div className="flex items-center gap-2 mb-2">
      {icon && <div className="text-lg text-primary">{icon}</div>}
      <span className="font-medium text-foreground">{title}</span>
    </div>
    <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

// Helper component for NextByte styled cards within modal
export const NextByteCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}> = ({ children, className = '', highlighted = false }) => (
  <div
    className={cn(
      'rounded-2xl border border-primary/20 shadow-[0_2px_8px_0_hsl(var(--background)/0.55),inset_0_0_0_1px_hsl(var(--foreground)/0.03)] hover:border-primary/40 transition-all duration-300 group',
      highlighted && 'ring-2 ring-green-500/50',
      className
    )}
    style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%)' }}
  >
    {children}
  </div>
);
