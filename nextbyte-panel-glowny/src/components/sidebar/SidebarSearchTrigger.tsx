import React from 'react';
import { Search, Command } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface Props {
  onOpen: () => void;
}

/**
 * Always-visible search button at the top of the sidebar.
 * Triggers the existing NextByte Spotlight (Cmd/Ctrl + K).
 */
export const SidebarSearchTrigger: React.FC<Props> = ({ onOpen }) => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

  /* JEDEN układ w obu stanach paska (mapowanie 1:1, 07.09.2026): pole ikony
     28 px na tej samej osi co ikony menu (12 + 8 + 28 → środek na 34 px),
     etykieta i skrót gasną w szynie zamiast osobnego, wyśrodkowanego
     przycisku 36 px, który przy zwijaniu skakał w bok. */
  return (
    <button
      onClick={onOpen}
      data-tour="spotlight-search"
      aria-label="Wyszukaj"
      className="nb-ikona-kafel relative w-full group flex items-center gap-2 px-2 py-1.5 rounded-xl border text-[13px] text-foreground/65 hover:text-foreground transition-all duration-300"
      title={isCollapsed ? 'Wyszukaj • Ctrl+K' : undefined}
    >
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
        <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
      </span>
      <span className={cn('flex-1 text-left truncate tracking-tight transition-opacity duration-150', isCollapsed && 'opacity-0')}>Wyszukaj...</span>
      <kbd className={cn('nb-wiersz hidden sm:flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md border text-foreground/55 transition-opacity duration-150', isCollapsed && 'opacity-0')}>
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  );
};
