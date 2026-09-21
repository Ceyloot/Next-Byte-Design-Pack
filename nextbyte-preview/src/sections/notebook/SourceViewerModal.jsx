import React from 'react';
import { X } from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import { GlassModal, GlassButton, GlassTooltip } from '@/components/glass';

/**
 * Duży podgląd źródła — otwierany kliknięciem w źródło na liście.
 * Zastąpił zakładkę "Transkrypcja": treść jest ta sama (DocumentViewer — wyszukiwarka
 * w transkrypcji, znaczniki czasu, skok do wideo), ale nie zajmuje stałego miejsca
 * w nawigacji, tylko wchodzi na wierzch i schodzi po Esc / kliknięciu w tło.
 *
 * Bez propa `title` do GlassModal: DocumentViewer ma własny nagłówek z tytułem
 * źródła, więc modalowy tytuł by go zdublował. GlassModal renderuje swój przycisk
 * zamknięcia tylko razem z tytułem, więc dokładamy własny X w rogu — inaczej
 * zostałby sam Esc, bez widocznej możliwości zamknięcia.
 */
export default function SourceViewerModal({ source, sources, onClose, onSourceSelect, onSeekToVideo }) {
  if (!source) return null;

  return (
    <GlassModal open onClose={onClose} width="max-w-5xl" className="[&>div:last-child]:p-0">
      <div className="relative h-[80vh] flex flex-col overflow-hidden">
        <GlassTooltip content="Zamknij podgląd (Esc)">
          <GlassButton
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Zamknij podgląd źródła"
            className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-card/70"
          >
            <X className="h-4 w-4" />
          </GlassButton>
        </GlassTooltip>

        {/* DocumentViewer jest zbudowany jako panel `h-full` — stała, duża wysokość
            wyżej sprawia, że jego wewnętrzne scrollowanie działa tak jak wtedy,
            gdy był osobną zakładką. */}
        <DocumentViewer
          source={source}
          sources={sources}
          onSourceSelect={onSourceSelect}
          onSeekToVideo={onSeekToVideo}
        />
      </div>
    </GlassModal>
  );
}
