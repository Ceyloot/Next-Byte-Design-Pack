import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Clock, FileText, Search, Play, ExternalLink, LayoutDashboard, Maximize2, X } from 'lucide-react';
import DataTable from './DataTable';
import { isTabularKind } from './utils/tableFormat';
import { GlassCard, GlassBadge, GlassSearch, GlassButton } from '@/components/glass';
import { cn } from '@/lib/utils';

function DocumentViewer({ source, sources = [], onSourceSelect, onSeekToVideo }) {
  const [activeTab, setActiveTab] = useState('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenVideo, setFullscreenVideo] = useState(null);

  const filteredTranscript = useMemo(() => {
    if (!source || !source.transcript || source.transcript.length === 0) return [];
    if (!searchQuery.trim()) return source.transcript;
    const q = searchQuery.toLowerCase();
    return source.transcript.filter(t => t.text.toLowerCase().includes(q));
  }, [source, searchQuery]);

  const mediaUrl = useMemo(
    () => (source?.mediaBlob ? URL.createObjectURL(source.mediaBlob) : null),
    [source?.mediaBlob]
  );
  useEffect(() => () => { if (mediaUrl) URL.revokeObjectURL(mediaUrl); }, [mediaUrl]);

  if (!source) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card/30 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-nb-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-4 shadow-inner">
          <LayoutDashboard size={28} className="text-primary/60" />
        </div>
        <h2 className="text-base font-heading font-bold text-foreground mb-1">Wybierz źródło</h2>
        <p className="text-xs text-foreground/50 max-w-xs mb-4">Wybierz wideo lub plik z lewego panelu, aby zobaczyć transkrypcję.</p>
        {sources.length > 0 && (
          <div className="w-full max-w-xs space-y-2">
            {sources.map(s => (
              <button
                key={s.id}
                onClick={() => onSourceSelect?.(s.id)}
                className="w-full text-left px-3 py-2.5 rounded-nb-sm bg-card/60 border border-foreground/10 hover:border-primary/40 hover:bg-card/90 transition-all text-xs text-foreground truncate cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isYoutube = source.type === 'youtube';

  const tabs = [
    ...(isYoutube ? [{ id: 'transcript', label: 'Transkrypcja wideo', icon: Clock }] : []),
    { id: 'raw', label: 'Surowy tekst', icon: FileText },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0].id;
  const watchUrl = `https://www.youtube.com/watch?v=${source.videoId}`;

  return (
    <>
      {fullscreenVideo && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setFullscreenVideo(null)}
        >
          <GlassCard
            className="w-full max-w-5xl p-4 border border-foreground/20 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-foreground truncate flex-1 pr-4">{fullscreenVideo.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.youtube.com/watch?v=${fullscreenVideo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-nb-xs text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
                  title="Otwórz na YouTube"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setFullscreenVideo(null)}
                  className="p-1.5 rounded-nb-xs text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="aspect-video bg-black rounded-nb-sm overflow-hidden shadow-2xl">
              <iframe
                key={fullscreenVideo.videoId}
                src={`https://www.youtube-nocookie.com/embed/${fullscreenVideo.videoId}?autoplay=1&rel=0`}
                title={fullscreenVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </GlassCard>
        </div>,
        document.body
      )}

      <div className="flex flex-col h-full bg-card/40 backdrop-blur-xl border-x border-foreground/10 overflow-hidden">
        {/* Header */}
        <div className="border-b border-foreground/10 px-6 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-base font-heading font-bold text-foreground mb-3 leading-snug">
            {source.title}
          </h2>
          <div className="flex items-center gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none',
                    isActive
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_12px_rgba(112,190,250,0.3)]'
                      : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  )}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTab === 'transcript' && isYoutube && (
            <div className="p-6 flex flex-col gap-5">
              {/* YouTube Player / Thumbnail */}
              <GlassCard
                padding="p-0"
                interactive
                onClick={() => onSeekToVideo ? onSeekToVideo(source.videoId, 0) : window.open(watchUrl, '_blank')}
                className="rounded-nb overflow-hidden relative group aspect-video bg-black/90 border border-foreground/15"
              >
                <img
                  src={source.thumbnailUrl || `https://img.youtube.com/vi/${source.videoId}/maxresdefault.jpg`}
                  alt={source.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={e => { if (!e.target.src.includes('hqdefault')) e.target.src = `https://img.youtube.com/vi/${source.videoId}/hqdefault.jpg`; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setFullscreenVideo({ videoId: source.videoId, title: source.title }); }}
                  className="absolute top-3 right-3 p-1.5 rounded-nb-xs bg-black/70 text-foreground/80 hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Powiększ podgląd"
                >
                  <Maximize2 size={13} />
                </button>
              </GlassCard>

              {/* Search */}
              <GlassSearch
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Szukaj w transkrypcji..."
              />

              {/* Transcript Entries */}
              {filteredTranscript.length === 0 ? (
                <div className="text-center text-foreground/50 py-10 text-xs">
                  {searchQuery ? 'Brak wyników dla podanej frazy.' : 'Brak transkrypcji dla tego filmu.'}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {filteredTranscript.map((entry, i) => (
                    <div
                      key={i}
                      onClick={() => onSeekToVideo ? onSeekToVideo(source.videoId, entry.start) : window.open(`${watchUrl}&t=${Math.floor(entry.start)}`, '_blank')}
                      className="flex items-start gap-3.5 group py-2.5 px-3 rounded-nb-sm hover:bg-foreground/5 transition-colors cursor-pointer border border-transparent hover:border-foreground/10"
                    >
                      <GlassBadge size="sm" intent="neutral" className="shrink-0 font-mono gap-1">
                        <Play className="h-3 w-3" />
                        {entry.timeStr}
                      </GlassBadge>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {searchQuery ? highlightText(entry.text, searchQuery) : entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'raw' && (
            <div className="p-6 space-y-4">
              {source.fileKind === 'image' && mediaUrl && (
                <img src={mediaUrl} alt={source.title} className="w-full rounded-nb border border-foreground/15" />
              )}
              {source.fileKind === 'audio' && mediaUrl && (
                <audio controls src={mediaUrl} className="w-full" />
              )}
              {isTabularKind(source.fileKind) && source.rawText ? (
                <DataTable rawText={source.rawText} />
              ) : (
                <GlassCard className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap p-5 border border-foreground/15">
                  {source.rawText || 'Brak tekstu.'}
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function highlightText(text, query) {
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part}</mark>
      : part
  );
}

export default DocumentViewer;
