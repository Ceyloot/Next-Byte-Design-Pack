import React, { useMemo } from 'react';
import { Plus, Settings, FileText, Video, Globe } from 'lucide-react';
import { GlassCommandPalette } from '@/components/glass';

/**
 * Buduje listę CommandItem (kształt z paczki: {id, label, icon, group, hint, onRun})
 * i deleguje całe UI/klawiaturę/otwieranie do GlassCommandPalette — nie renderujemy
 * już własnego markupu ani nie łapiemy strzałek/Escape ręcznie.
 */
export default function CommandPalette({
  isOpen,
  onClose,
  sources = [],
  onOpenAddSource,
  onOpenSettings,
  onSelectSource,
}) {
  const items = useMemo(() => {
    // Bez pozycji "przejdź do widoku" — został sam czat, nie ma czego przełączać.
    const actions = [
      {
        id: 'action-add-source',
        group: 'Akcje',
        label: 'Dodaj Nowe Źródło',
        hint: 'YouTube, PDF, WWW, tekst',
        icon: Plus,
        onRun: () => onOpenAddSource(),
      },
      {
        id: 'action-settings',
        group: 'Akcje',
        label: 'Otwórz Ustawienia',
        hint: 'Klucze API, motyw',
        icon: Settings,
        onRun: () => onOpenSettings(),
      },
    ];

    const sourceItems = sources
      .filter((s) => s.title)
      .map((s) => ({
        id: `source-${s.id}`,
        group: 'Źródła',
        label: s.title || 'Bez tytułu',
        hint: s.type === 'youtube' ? 'YouTube' : s.type === 'pdf' ? 'PDF' : s.type === 'web' ? 'WWW' : 'Tekst',
        icon: s.type === 'youtube' ? Video : s.type === 'web' ? Globe : FileText,
        onRun: () => onSelectSource?.(s),
      }));

    return [...actions, ...sourceItems];
  }, [sources, onOpenAddSource, onOpenSettings, onSelectSource]);

  return (
    <GlassCommandPalette
      open={isOpen}
      onClose={onClose}
      items={items}
      placeholder="Szukaj źródeł lub komend..."
    />
  );
}
