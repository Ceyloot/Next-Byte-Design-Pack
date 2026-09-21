import React, { useState, useMemo } from 'react';
import { BookOpen, Trash2, Plus, Pin, Copy, Check, Edit2, Download, Search, Sparkles, X, Save } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './Toast';
import { GlassCard, GlassButton, GlassSearch, GlassEmpty, GlassTooltip } from '@/components/glass';
import { cn } from '@/lib/utils';

export default function NotesPanel({
  notes = [],
  onSaveNote,
  onUpdateNote,
  onTogglePinNote,
  onDeleteNote,
  apiKeys,
}) {
  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const toast = useToast();

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onSaveNote({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
      isPinned: false,
    });
    setNewNote('');
    toast.success('Dodano nową notatkę.');
  };

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    if (onUpdateNote) {
      onUpdateNote(id, editingText.trim());
    }
    setEditingId(null);
    setEditingText('');
    toast.success('Zapisano zmiany w notatce.');
  };

  const handleCopyNote = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Skopiowano treść notatki do schowka.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportNotes = () => {
    if (notes.length === 0) return;
    const content = notes
      .map((n, i) => `### Notatka ${i + 1} (${new Date(n.createdAt).toLocaleString('pl-PL')})\n\n${n.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notatki_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Pobrano plik z notatkami.');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text && text.trim()) {
      onSaveNote({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
        isPinned: false,
      });
      toast.success('Dodano notatkę z przeciągniętego tekstu.');
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(n => (n.text || '').toLowerCase().includes(q));
  }, [notes, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes]);

  const renderNoteCard = (note) => {
    const isEditing = editingId === note.id;

    return (
      <GlassCard
        key={note.id}
        padding="p-4"
        className={cn(
          'group relative',
          note.isPinned
            ? 'bg-primary/[0.04] border-primary/30 hover:border-primary/50 shadow-[0_0_16px_rgba(112,190,250,0.12)]'
            : 'hover:border-foreground/[0.16]'
        )}
      >
        <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-2xl', note.isPinned ? 'bg-primary' : 'bg-foreground/10 group-hover:bg-primary/40')} />

        {isEditing ? (
          <div className="space-y-3 pl-2">
            <textarea
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit(note.id); }}
              className="w-full min-h-[90px] p-3 text-xs bg-background/80 border border-primary/40 rounded-nb text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <GlassButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                <X size={14} />
                Anuluj
              </GlassButton>
              <GlassButton variant="solid" size="sm" onClick={() => handleSaveEdit(note.id)}>
                <Save size={14} />
                Zapisz
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="pl-2 space-y-2">
            {/* Top action bar */}
            <div className="flex items-center justify-between text-muted-foreground/60 text-[10px]">
              <span className="font-mono text-muted-foreground/40">
                {new Date(note.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} · {new Date(note.createdAt).toLocaleDateString('pl-PL')}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onTogglePinNote && (
                  <GlassTooltip content={note.isPinned ? 'Odepnij' : 'Przypnij do góry'}>
                    <button
                      onClick={() => onTogglePinNote(note.id)}
                      className={`p-1 rounded-nb-xs transition-colors cursor-pointer ${note.isPinned ? 'text-primary bg-primary/10' : 'hover:text-foreground hover:bg-foreground/5'}`}
                    >
                      <Pin size={12} className={note.isPinned ? 'fill-primary' : ''} />
                    </button>
                  </GlassTooltip>
                )}
                <GlassTooltip content="Kopiuj treść">
                  <button
                    onClick={() => handleCopyNote(note.id, note.text)}
                    className="p-1 rounded-nb-xs hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
                  >
                    {copiedId === note.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </GlassTooltip>
                <GlassTooltip content="Edytuj">
                  <button
                    onClick={() => handleStartEdit(note)}
                    className="p-1 rounded-nb-xs hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                </GlassTooltip>
                {onDeleteNote && (
                  <GlassTooltip content="Usuń">
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 rounded-nb-xs hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </GlassTooltip>
                )}
              </div>
            </div>

            {/* Note text rendered as markdown */}
            <div className="text-xs text-foreground/90 leading-relaxed overflow-x-auto">
              <MarkdownRenderer content={note.text} pexelsKey={apiKeys?.pexels} />
            </div>
          </div>
        )}
      </GlassCard>
    );
  };

  return (
    <div
      className={`flex flex-col h-full overflow-hidden relative transition-colors ${isDragOver ? 'bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md border-2 border-dashed border-primary/50 flex flex-col items-center justify-center pointer-events-none p-6 text-center animate-in fade-in duration-150">
          <Plus size={36} className="text-primary mb-2 animate-bounce" />
          <p className="text-primary font-bold tracking-wide text-sm">Upuść tekst tutaj, aby utworzyć notatkę</p>
        </div>
      )}

      {/* Header bar */}
      <div className="px-4 py-3 border-b border-foreground/[0.08] flex items-center justify-between flex-shrink-0 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-nb-sm bg-primary/10 text-primary">
            <BookOpen size={15} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Moje Notatki</h3>
            <p className="text-[10px] text-muted-foreground/60">{notes.length} {notes.length === 1 ? 'notatka' : 'notatek'}</p>
          </div>
        </div>

        {notes.length > 0 && (
          <GlassButton variant="ghost" size="sm" onClick={handleExportNotes} className="border border-foreground/10 hover:border-foreground/20 text-[11px] px-2.5 py-1 h-auto">
            <Download size={14} />
            <span>Pobierz .md</span>
          </GlassButton>
        )}
      </div>

      {/* Main content body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Add new note editor */}
        <GlassCard padding="p-3" radius="rounded-2xl" className="space-y-2 focus-within:border-primary/40">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddNote(); }}
            placeholder="Dodaj notatkę... (wspiera Markdown, Ctrl+Enter zapisuje)"
            className="w-full text-xs py-2 px-3 min-h-[64px] resize-none bg-background/40 border border-foreground/[0.06] rounded-nb text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors custom-scrollbar"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground/40 italic">Naciśnij Ctrl+Enter, aby zapisać</span>
            <GlassButton variant="solid" size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              <Plus size={14} />
              <span>Dodaj notatkę</span>
            </GlassButton>
          </div>
        </GlassCard>

        {/* Search bar */}
        {notes.length > 3 && (
          <GlassSearch
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Szukaj w notatkach..."
          />
        )}

        {/* Pinned section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Pin size={11} className="fill-primary" />
              <span>Przypięte</span>
              <span className="ml-1 text-muted-foreground/40">({pinnedNotes.length})</span>
            </div>
            <div className="space-y-2.5">
              {pinnedNotes.map(renderNoteCard)}
            </div>
          </div>
        )}

        {/* Other notes section */}
        {unpinnedNotes.length > 0 && (
          <div className="space-y-2.5">
            {pinnedNotes.length > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 pt-2 border-t border-foreground/5">
                Pozostałe notatki ({unpinnedNotes.length})
              </div>
            )}
            <div className="space-y-2.5">
              {unpinnedNotes.map(renderNoteCard)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredNotes.length === 0 && (
          <GlassEmpty
            variant={searchQuery ? 'brak-wynikow' : 'ogolny'}
            icon={<Sparkles className="h-6 w-6" />}
            title={searchQuery ? 'Brak notatek pasujących do wyszukiwania' : 'Brak notatek w tym notatniku'}
            desc={searchQuery
              ? 'Zmień frazę wyszukiwania lub zresetuj filtr.'
              : 'Wprowadź tekst powyżej, przeciągnij wybrany fragment z transkrypcji/czatu lub użyj przycisku „Dodaj do notatek" w kafelku mapy wiedzy.'}
            compact
          />
        )}
      </div>
    </div>
  );
}
