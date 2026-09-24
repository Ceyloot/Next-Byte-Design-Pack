import React, { useState, useRef } from 'react';
// PODGLĄD: lucide 1.x wycofał ikony marek — `Youtube` już nie istnieje.
// Alias trzyma resztę pliku bez zmian, żeby port wracał do `your-notebook` czysto.
import { Video as Youtube, Upload, FileText, Type, Link, X, ChevronDown } from 'lucide-react';
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
  const [tekstOtwarty, setTekstOtwarty] = useState(false);
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

  /* JEDEN EKRAN, NIE TRZY ZAKŁADKI — jak w NotebookLM.
     Zakładki kazały najpierw wybrać rodzaj źródła, a na wąskim oknie łamały
     się w dwa rzędy. Teraz trzy drogi leżą jedna pod drugą, od najczęstszej:
     plik (upuść), link (wklej), tekst (rozwiń). Wszystko dodaje jeden przycisk.
     Materiał z paska bocznego (`nb-nav-*`, `nb-ikona-kafel`) — stąd `.nbb`. */
  return (
    <GlassModal open={isOpen} onClose={onClose} title="Dodaj źródła" width="max-w-xl">
      <div className="nbb -mt-2">
        <p className="mb-4 text-[13px] leading-relaxed text-foreground/60">
          Next Scribe odpowiada wyłącznie na podstawie Twoich źródeł — i przy każdej odpowiedzi pokazuje, skąd ją wziął.
        </p>

        <form onSubmit={handleSubmit} className="max-h-[60vh] space-y-3 overflow-y-auto custom-scrollbar pr-1">
          {/* PLIKI — największy cel, bo to najczęstsza droga */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }}
            className={cn(
              'group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition-all duration-200',
              isDragOver
                ? 'border-primary/60 bg-primary/[0.10]'
                : 'border-foreground/[0.14] bg-foreground/[0.025] hover:border-primary/40 hover:bg-primary/[0.05]',
            )}
          >
            <span className="nb-nav-ikona-akt flex h-11 w-11 items-center justify-center rounded-xl text-primary transition-transform duration-200 group-hover:scale-105">
              <Upload size={20} strokeWidth={1.75} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-foreground">
                {isDragOver ? 'Upuść tutaj' : 'Upuść pliki albo kliknij, żeby wybrać'}
              </span>
              <span className="text-[11.5px] text-foreground/55">
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
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={`${f.name}_${f.size}`} className="nb-nav-pozycja group flex h-9 items-center gap-2 rounded-xl px-2">
                  <span className="nb-nav-ikona flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-foreground/60">
                    <FileText size={13} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{f.name}</span>
                  <span className="shrink-0 text-[11px] text-foreground/45">{getKindLabel(detectFileKind(f))}</span>
                  <button
                    type="button"
                    aria-label={`Usuń ${f.name}`}
                    onClick={() => setFiles(prev => prev.filter((_, ix) => ix !== i))}
                    className="shrink-0 rounded-md p-1 text-foreground/35 transition-colors hover:text-destructive"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* LINKI — pole jak szukajka paska: `nb-ikona-kafel`, ikona w polu 28 px */}
          <div className="nb-ikona-kafel flex items-start gap-2 rounded-xl px-2 py-1.5 focus-within:!border-primary/40">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-foreground/55">
              <Link size={15} />
            </span>
            <textarea
              rows={Math.min(5, Math.max(1, ytUrl.split('\n').length))}
              className="min-h-7 flex-1 resize-none bg-transparent py-1 text-[13px] leading-5 text-foreground outline-none placeholder:text-foreground/40"
              placeholder="Wklej link do strony albo filmu YouTube"
              value={ytUrl}
              onChange={e => { setYtUrl(e.target.value); setError(''); }}
              autoFocus
            />
            {urlCount > 0 && ytUrl.trim() && (
              <span className="mt-1.5 shrink-0 px-1.5 text-[10px] font-semibold text-primary">{urlCount}</span>
            )}
          </div>
          <p className="flex items-center gap-1.5 px-1 text-[11px] text-foreground/45">
            <Youtube size={12} className="shrink-0" />
            Kilka linków? Każdy w nowej linii. Filmy muszą mieć napisy.
          </p>
          {singleUrl && extractPlaylistId(singleUrl) && !extractVideoId(singleUrl) && (
            <Wskazowka ikona={Youtube} uwaga>
              To playlista — każdy film wejdzie osobno. Wymaga klucza YouTube Data API.
            </Wskazowka>
          )}

          {/* TEKST — zwinięty, bo najrzadszy */}
          <div>
            <button
              type="button"
              onClick={() => setTekstOtwarty(v => !v)}
              aria-expanded={tekstOtwarty || !!pasteText}
              className="nb-nav-pozycja group flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-[13px] text-foreground/[0.88] hover:text-foreground"
            >
              <span className="nb-nav-ikona flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/60">
                <Type size={15} />
              </span>
              <span className="flex-1">Wklej tekst</span>
              {pasteText.trim() && <span className="text-[10px] font-semibold text-primary">1</span>}
              <ChevronDown size={14} className={cn('text-foreground/40 transition-transform', (tekstOtwarty || pasteText) && 'rotate-180')} />
            </button>
            {(tekstOtwarty || pasteText) && (
              <div className="nb-ikona-kafel mt-1.5 space-y-1 rounded-xl p-2 focus-within:!border-primary/40">
                <input
                  className="w-full bg-transparent px-1 py-1 text-[13px] font-medium text-foreground outline-none placeholder:text-foreground/40"
                  placeholder="Tytuł (opcjonalnie)"
                  value={pasteTitle}
                  onChange={e => setPasteTitle(e.target.value)}
                />
                <textarea
                  className="h-36 w-full resize-none bg-transparent px-1 py-1 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-foreground/40"
                  placeholder="Wklej treść…"
                  value={pasteText}
                  onChange={e => { setPasteText(e.target.value); setError(''); }}
                />
                {pasteText.length > 0 && (
                  <p className="px-1 text-right text-[10px] text-foreground/45">{pasteText.length.toLocaleString('pl')} znaków</p>
                )}
              </div>
            )}
          </div>

          {error && <Wskazowka ikona={X} uwaga>{error}</Wskazowka>}
        </form>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-foreground/10 pt-4">
          <span className="text-[11.5px] text-foreground/45">
            {totalCount > 0
              ? [
                  ytUrl.trim() && `${urlCount} ${urlCount === 1 ? 'link' : 'linki'}`,
                  files.length > 0 && `${files.length} ${files.length === 1 ? 'plik' : 'pliki'}`,
                  pasteText.trim() && '1 tekst',
                ].filter(Boolean).join(' + ')
              : 'Nic jeszcze nie dodano'}
          </span>
          <div className="flex gap-2">
            <GlassButton type="button" variant="ghost" onClick={onClose}>Anuluj</GlassButton>
            <GlassButton type="button" variant="solid" onClick={handleSubmit} disabled={!canSubmit}>
              {totalCount > 1 ? `Dodaj ${totalCount} źródła` : 'Dodaj źródło'}
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
}

export default AddSourceModal;
