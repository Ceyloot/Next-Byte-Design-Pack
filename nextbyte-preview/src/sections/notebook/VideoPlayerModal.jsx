import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExternalLink, PlayCircle, X } from 'lucide-react';
import { GlassButton } from '@/components/glass';
import { cn } from '@/lib/utils';

/**
 * Pływający odtwarzacz YouTube (picture-in-picture w rogu ekranu) — zamiennik
 * window.open w nowej karcie. User zostaje w appce: może dalej czytać transkrypcję,
 * mapę czy czat, a film gra obok. Zmiana videoId/start przeładowuje iframe (key).
 */
export default function VideoPlayerModal({ videoId, start = 0, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!videoId) return null;

  const startSec = Math.max(0, Math.floor(start || 0));
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?start=${startSec}&autoplay=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${startSec}s`;

  return ReactDOM.createPortal(
    <div className="fixed z-[95] bottom-4 right-4 w-[420px] max-md:inset-x-2 max-md:bottom-2 max-md:w-auto nb-szklo bg-card/95 backdrop-blur-2xl border-foreground/15 rounded-nb shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-10 border-b border-foreground/10">
        <PlayCircle size={13} className="text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-foreground truncate flex-1" title={title}>
          {title || 'Odtwarzacz'}
        </span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Otwórz na YouTube"
          className={cn(
            'inline-flex items-center justify-center h-7 w-7 rounded-nb-xs flex-shrink-0 transition-all duration-200',
            'bg-transparent text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
          )}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <GlassButton
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
        >
          <X size={14} />
        </GlassButton>
      </div>

      {/* Player 16:9 — key wymusza przeładowanie przy seeku do innego momentu/filmu */}
      <div className="aspect-video bg-black">
        <iframe
          key={`${videoId}:${startSec}`}
          src={embedUrl}
          title={title || 'YouTube player'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>,
    document.body
  );
}
