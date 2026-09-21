import React, { useEffect, useMemo, useRef } from 'react';
import DataTable from './DataTable';
import { isTabularKind } from './utils/tableFormat';
import { getKindMeta } from './utils/sourceKinds';
import { GlassModal } from '@/components/glass';
import { cn } from '@/lib/utils';

/**
 * Dzieli rawText na sekcje wg znaczników "[Etykieta N]" dodanych przy imporcie
 * (np. "[Strona N]" dla PDF, "[Slajd N]" dla PPTX — patrz fileImport.js).
 */
function splitLabeledSections(rawText, label) {
  const re = new RegExp(`\\[${label} (\\d+)\\]\\n?`);
  const parts = rawText.split(re);
  // parts: ['', '1', 'tekst 1', '2', 'tekst 2', ...] — pierwszy element to tekst przed pierwszym markerem
  const sections = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ page: parts[i], text: parts[i + 1]?.trim() || '' });
  }
  return sections.length > 0 ? sections : null;
}

/**
 * Pełny podgląd źródła. Otwierany zawsze, gdy appka "odnosi się" do niedowideowego
 * źródła (np. lista "Sprawdź w źródle" na Canvasie) — zamiast martwego przycisku,
 * pokazuje rzeczywistą treść: prawdziwą tabelę dla CSV/XLSX/HTML, a nie tylko
 * listę nazw kolumn, i podjeżdża/podświetla dokładne miejsce, jeśli je znamy.
 */
export default function SourcePreviewModal({ source, locator, onClose }) {
  const pageRef = useRef(null);
  const meta = getKindMeta(source.fileKind);
  const Icon = meta.icon;

  const pdfPages = useMemo(
    () => (source.fileKind === 'pdf' ? splitLabeledSections(source.rawText || '', 'Strona') : null),
    [source.fileKind, source.rawText]
  );
  const pptxSlides = useMemo(
    () => (source.fileKind === 'pptx' ? splitLabeledSections(source.rawText || '', 'Slajd') : null),
    [source.fileKind, source.rawText]
  );
  const sections = pdfPages || pptxSlides;
  const sectionLabel = pdfPages ? 'Strona' : 'Slajd';

  // Oryginalny plik jest dostępny tylko dla obrazu/audio (patrz App.jsx handleAddSource) —
  // gdy jest, pokazujemy prawdziwą miniaturę / odtwarzacz zamiast samego wyekstrahowanego tekstu.
  const mediaUrl = useMemo(
    () => (source.mediaBlob ? URL.createObjectURL(source.mediaBlob) : null),
    [source.mediaBlob]
  );
  useEffect(() => () => { if (mediaUrl) URL.revokeObjectURL(mediaUrl); }, [mediaUrl]);

  useEffect(() => {
    if (locator?.type === 'page' && pageRef.current) {
      pageRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [locator, sections]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <GlassModal
      open
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5 min-w-0">
          <Icon size={16} className="text-primary flex-shrink-0" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground truncate">{source.title}</span>
            <span className="block text-[10px] uppercase tracking-wide text-foreground/50">{meta.label}</span>
          </span>
        </span>
      }
      width="max-w-2xl"
    >
      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar -mx-6 px-6 -my-2 py-2">
        {source.fileKind === 'image' ? (
          <div className="space-y-4">
            {mediaUrl && (
              <img src={mediaUrl} alt={source.title} className="w-full rounded-nb border border-foreground/10" />
            )}
            {source.rawText && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-foreground/50">Odczytany tekst i opis</div>
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap nb-szklo bg-card/30 p-5 rounded-nb border-foreground/10">
                  {source.rawText}
                </div>
              </div>
            )}
          </div>
        ) : source.fileKind === 'audio' ? (
          <div className="space-y-4">
            {mediaUrl && (
              <audio controls src={mediaUrl} className="w-full" />
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-foreground/50">Transkrypcja</div>
              <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap nb-szklo bg-card/30 p-5 rounded-nb border-foreground/10">
                {source.rawText || 'Brak transkrypcji.'}
              </div>
            </div>
          </div>
        ) : isTabularKind(source.fileKind) && source.rawText ? (
          <DataTable rawText={source.rawText} highlightRow={locator?.type === 'row' ? locator.value : undefined} />
        ) : sections ? (
          <div className="space-y-4">
            {sections.map(({ page, text }) => {
              const isTarget = locator?.type === 'page' && String(locator.value) === page;
              return (
                <div
                  key={page}
                  ref={isTarget ? pageRef : null}
                  className={cn(
                    'rounded-nb border p-4 transition-colors',
                    isTarget ? 'border-primary/50 bg-primary/5' : 'border-foreground/10 bg-card/30'
                  )}
                >
                  <div className={cn('text-[10px] font-bold uppercase tracking-wider mb-2', isTarget ? 'text-primary' : 'text-foreground/50')}>
                    {sectionLabel} {page}
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap nb-szklo bg-card/30 p-5 rounded-nb border-foreground/10">
            {source.rawText || 'Brak podglądu treści.'}
          </div>
        )}
      </div>
    </GlassModal>
  );
}
