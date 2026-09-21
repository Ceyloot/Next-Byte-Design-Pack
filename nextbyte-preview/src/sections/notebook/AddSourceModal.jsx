import React, { useState, useRef } from 'react';
// PODGLĄD: lucide 1.x wycofał ikony marek — `Youtube` już nie istnieje.
// Alias trzyma resztę pliku bez zmian, żeby port wracał do `your-notebook` czysto.
import { Video as Youtube, Upload, FileText, Type, Link, X } from 'lucide-react';
import { extractVideoId, extractPlaylistId } from './utils/youtube';
import { detectFileKind } from './utils/fileImport';
import { getKindLabel } from './utils/sourceKinds';
import { GlassModal, GlassButton, GlassInput, GlassBadge } from '@/components/glass'
import { NbTabs } from '@/components/ui/NbTabs';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'url', label: 'YouTube / URL', icon: <Link /> },
  { key: 'file', label: 'Pliki', icon: <Upload /> },
  { key: 'text', label: 'Tekst', icon: <Type /> },
];

async function runWithConcurrency(items, fn, concurrency = 3) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

/* Jedna forma podpowiedzi na cały modal: ikona, włoskowa linia u góry, tekst.
   Wcześniej każda miała własne pudełko, a ostrzeżenie o playliście — bursztyn
   spoza palety. Uwaga różni się kolorem ikony, nie kształtem. */
function Wskazowka({ ikona: Ikona, uwaga = false, children }) {
  return (
    <div className="flex items-start gap-2 border-t border-foreground/[0.06] pt-2.5">
      <span className={cn('mt-px shrink-0', uwaga ? 'text-primary' : 'text-foreground/35')}>
        <Ikona size={13} />
      </span>
      <p className="text-[11px] leading-relaxed text-foreground/65">{children}</p>
    </div>
  );
}

function AddSourceModal({ isOpen, onClose, onAddSource }) {
  const [activeTab, setActiveTab] = useState('url');
  const [ytUrl, setYtUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const rejected = incoming.filter(f => detectFileKind(f) === 'unsupported');
    if (rejected.length > 0) {
      setError(`Nieobsługiwane: ${rejected.map(f => f.name).join(', ')}`);
    } else {
      setError('');
    }
    const ok = incoming.filter(f => detectFileKind(f) !== 'unsupported');
    setFiles(prev => {
      const seen = new Set(prev.map(f => `${f.name}_${f.size}`));
      return [...prev, ...ok.filter(f => !seen.has(`${f.name}_${f.size}`))];
    });
  };

  // liczba źródeł ze wszystkich zakładek
  const urlCount = ytUrl.trim().split(/[\t\n, ]+/).filter(u => u.trim()).length;
  const totalCount = (ytUrl.trim() ? urlCount : 0) + files.length + (pasteText.trim() ? 1 : 0);
  const canSubmit = totalCount > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Dodaj przynajmniej jedno źródło.');
      return;
    }

    // Zbierz zadania ze WSZYSTKICH zakładek
    const tasks = [];

    // URL-e / YouTube
    const rawUrls = ytUrl.split(/[\t\n, ]+/).map(u => u.trim()).filter(Boolean);
    const seenIds = new Set();
    rawUrls.forEach(url => {
      const id = extractVideoId(url) || extractPlaylistId(url) || url;
      if (seenIds.has(id)) return;
      seenIds.add(id);
      const pid = extractPlaylistId(url);
      const vid = extractVideoId(url);
      const type = pid ? 'playlist' : vid ? 'youtube' : 'web';
      tasks.push({ type, url, playlistId: pid || undefined });
    });

    // Pliki — kopiujemy referencje, zanim wyczyścimy stan
    files.forEach(file => tasks.push({ type: 'file', file }));

    // Wklejony tekst
    if (pasteText.trim()) {
      tasks.push({ type: 'paste', title: pasteTitle.trim() || 'Wklejony tekst', text: pasteText.trim() });
    }

    // Zamknij modal natychmiast, importuj w tle
    setYtUrl('');
    setFiles([]);
    setPasteTitle('');
    setPasteText('');
    onClose();

    runWithConcurrency(tasks, (task) => onAddSource(task), 3);
  };

  const singleUrl = ytUrl.trim().split(/[\t\n, ]+/)[0] || '';

  const tabsWithBadges = TABS.map(tab => {
    const badge = tab.key === 'url' && ytUrl.trim() ? urlCount
      : tab.key === 'file' && files.length ? files.length
      : tab.key === 'text' && pasteText.trim() ? 1
      : 0;
    return { ...tab, label: badge > 0 ? `${tab.label} · ${badge}` : tab.label };
  });

  return (
    <GlassModal open={isOpen} onClose={onClose} title="Dodaj źródła wiedzy" width="max-w-lg">
      <div className="-mt-2">
        <NbTabs key={activeTab} tabs={tabsWithBadges} defaultTab={activeTab} onChange={(id) => { setActiveTab(id); setError(''); }} className="mb-4 w-full" />

        <form onSubmit={handleSubmit} className="space-y-3 max-h-[52vh] overflow-y-auto custom-scrollbar pr-1">
          {activeTab === 'url' && (
            <>
              {/* Pole bez pudełka: podkreślenie zamiast obwódki, zapala się przy fokusie
                  — tak samo jak szukanie na liście notatników. */}
              <textarea
                className="w-full h-32 resize-none border-b border-foreground/[0.12] bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-primary/45"
                placeholder="https://youtube.com/watch?v=…&#10;https://artykul.pl&#10;każdy link w nowej linii"
                value={ytUrl}
                onChange={e => { setYtUrl(e.target.value); setError(''); }}
                autoFocus
              />
              <Wskazowka ikona={Youtube}>
                Filmy z YouTube muszą mieć napisy. Strony WWW czytamy automatycznie.
              </Wskazowka>
              {singleUrl && (() => {
                const pid = extractPlaylistId(singleUrl);
                const vid = extractVideoId(singleUrl);
                if (pid && !vid) return (
                  <Wskazowka ikona={Youtube} uwaga>
                    To playlista — każdy film wejdzie osobno. Wymaga klucza YouTube Data API.
                  </Wskazowka>
                );
                return null;
              })()}
            </>
          )}

          {activeTab === 'file' && (
            <>
              {/* Cel upuszczania: duża ikona i dwa słowa. Bez kreskowanej ramki —
                  cała powierzchnia reaguje, więc widać, że można w nią celować. */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }}
                className={cn(
                  'group flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center transition-all duration-200',
                  isDragOver
                    ? 'bg-primary/[0.10] ring-2 ring-primary/40'
                    : 'bg-foreground/[0.025] hover:bg-primary/[0.06]',
                )}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                  <Upload size={24} strokeWidth={1.75} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-foreground">
                    {isDragOver ? 'Upuść tutaj' : 'Wybierz pliki albo upuść'}
                  </span>
                  <span className="text-[11px] text-foreground/65">
                    PDF · Word · PowerPoint · Excel · obrazy · audio
                  </span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.csv,.tsv,.json,.log,.xml,.html,.htm,.yml,.yaml,.srt,.vtt,.xlsx,.xls,.xlsm,.ods,image/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.opus,audio/*"
                  className="hidden"
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
              </div>

              {files.length > 0 && (
                <div className="divide-y divide-foreground/[0.06]">
                  {files.map((f, i) => (
                    <div key={`${f.name}_${f.size}`} className="group flex items-center gap-2.5 py-2">
                      <span className="shrink-0 text-foreground/40">
                        <FileText size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-foreground">{f.name}</span>
                        <span className="block text-[11px] text-foreground/50">{getKindLabel(detectFileKind(f))}</span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Usuń ${f.name}`}
                        onClick={() => setFiles(prev => prev.filter((_, ix) => ix !== i))}
                        className="shrink-0 rounded-lg p-1.5 text-foreground/30 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'text' && (
            <>
              <input
                className="w-full border-b border-foreground/[0.12] bg-transparent px-1 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-primary/45"
                placeholder="Tytuł (opcjonalnie)"
                value={pasteTitle}
                onChange={e => setPasteTitle(e.target.value)}
              />
              <textarea
                className="w-full h-48 resize-none border-b border-foreground/[0.12] bg-transparent px-1 py-2 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-primary/45"
                placeholder="Wklej treść…"
                value={pasteText}
                onChange={e => { setPasteText(e.target.value); setError(''); }}
                autoFocus={activeTab === 'text'}
              />
              {pasteText.length > 0 && (
                <p className="text-right text-[10px] text-foreground/45">
                  {pasteText.length.toLocaleString('pl')} znaków
                </p>
              )}
            </>
          )}

          {error && (
            <Wskazowka ikona={X} uwaga>{error}</Wskazowka>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-foreground/10">
          <div className="text-[11px] text-foreground/40">
            {totalCount > 0 ? (
              <span>
                {[
                  ytUrl.trim() && `${urlCount} link${urlCount !== 1 ? 'ów' : ''}`,
                  files.length > 0 && `${files.length} plik${files.length !== 1 ? 'ów' : ''}`,
                  pasteText.trim() && '1 tekst',
                ].filter(Boolean).join(' + ')}
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <GlassButton type="button" variant="ghost" onClick={onClose}>
              Anuluj
            </GlassButton>
            <GlassButton
              type="submit"
              form=""
              variant="solid"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {totalCount > 1 ? `Dodaj ${totalCount} źródła` : 'Dodaj do bazy wiedzy'}
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
}

export default AddSourceModal;
