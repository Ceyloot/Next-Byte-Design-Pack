import React, { useState } from 'react';
import { StickyNote, ChevronUp } from 'lucide-react';
import NotesPanel from './NotesPanel';
import { cn } from '@/lib/utils';

/**
 * Notatki jako rozwijana sekcja na DOLE panelu bocznego (nad Ustawieniami) —
 * zamiast osobnej zakładki w nawigacji. Zwinięte to jeden wiersz z licznikiem;
 * rozwinięte pokazują pełny NotesPanel w ograniczonej wysokości (ma własne
 * scrollowanie). Rozwijają się w GÓRĘ, więc przycisk nie ucieka spod kursora.
 */
export default function NotesDropdown({
  notes = [],
  onSaveNote,
  onUpdateNote,
  onTogglePinNote,
  onDeleteNote,
  apiKeys,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex-shrink-0 border-t border-foreground/[0.09]">
      {/* Treść nad przyciskiem: sekcja siedzi na dole kolumny, więc rozwija się
          w górę — przycisk zostaje na miejscu, nie ucieka spod kursora. */}
      {isOpen && (
        <div className="h-[45vh] min-h-[200px] border-b border-foreground/[0.06] overflow-hidden">
          <NotesPanel
            notes={notes}
            onSaveNote={onSaveNote}
            onUpdateNote={onUpdateNote}
            onTogglePinNote={onTogglePinNote}
            onDeleteNote={onDeleteNote}
            apiKeys={apiKeys}
          />
        </div>
      )}

      <button
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center gap-2 px-2.5 h-9 text-[12px] font-medium transition-colors cursor-pointer',
          isOpen ? 'text-primary' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]',
        )}
      >
        <StickyNote size={14} className="shrink-0" />
        <span>Notatki</span>
        {notes.length > 0 && (
          <span className="px-1.5 rounded-full bg-foreground/[0.08] text-[10px] font-mono font-bold tabular-nums text-foreground/70">
            {notes.length}
          </span>
        )}
        <ChevronUp
          size={14}
          className={cn('ml-auto shrink-0 text-foreground/40 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
    </div>
  );
}
