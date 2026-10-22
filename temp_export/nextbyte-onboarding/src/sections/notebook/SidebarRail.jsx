import React from 'react';
import { Video as Youtube, Folder, PanelLeftOpen, Plus, ChevronLeft } from 'lucide-react';
import { getKindIcon } from './utils/sourceKinds';
import { GlassButton, GlassTooltip } from '@/components/glass';
import { cn } from '@/lib/utils';

/**
 * Wąski pasek-zastępca pełnego Sidebara (wariant B z porównania kafelków/paska —
 * user wybrał "kompaktowy"): zamiast całkowicie chować panel źródeł, zostawia
 * rząd miniaturek — widać co jest, jeden klik wraca do pełnego widoku.
 */
function SidebarRail({
  sources,
  activeSourceId,
  onActiveSourceChange,
  onOpenAddModal,
  onExpand,
  onBackToDashboard,
}) {
  const playlists = {};
  const standalone = [];
  sources.forEach(src => {
    if (src.playlistId) {
      if (!playlists[src.playlistId]) {
        playlists[src.playlistId] = { id: src.playlistId, title: src.playlistTitle || 'Playlista', count: 0 };
      }
      playlists[src.playlistId].count++;
    } else {
      standalone.push(src);
    }
  });

  return (
    <div className="w-14 flex-shrink-0 flex flex-col items-center gap-1.5 py-3 border-r border-foreground/[0.09] bg-card/85 backdrop-blur-lg overflow-hidden">
      {onBackToDashboard && (
        <GlassTooltip content="Powrót do listy notatników">
          <GlassButton variant="ghost" size="icon" className="h-9 w-9" onClick={onBackToDashboard}>
            <ChevronLeft size={15} className="text-primary" />
          </GlassButton>
        </GlassTooltip>
      )}

      <GlassTooltip content="Rozwiń panel źródeł">
        <GlassButton variant="ghost" size="icon" className="h-9 w-9" onClick={onExpand}>
          <PanelLeftOpen size={15} />
        </GlassButton>
      </GlassTooltip>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-1.5 px-1.5">
        {Object.values(playlists).map(pl => (
          <GlassTooltip key={pl.id} content={`${pl.title} (${pl.count})`}>
            <button
              onClick={onExpand}
              className="relative w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center bg-primary/15 border border-primary/30 text-primary cursor-pointer hover:bg-primary/25 transition-colors"
            >
              <Folder size={14} />
              <span className="absolute -bottom-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-card border border-primary/40 text-[8px] font-bold text-primary flex items-center justify-center">
                {pl.count}
              </span>
            </button>
          </GlassTooltip>
        ))}

        {standalone.map(src => {
          const isActive = activeSourceId === src.id;
          const isYoutube = src.type === 'youtube';
          const KindIcon = getKindIcon(src.fileKind);
          return (
            <GlassTooltip key={src.id} content={src.title}>
              <button
                onClick={() => onActiveSourceChange(src.id)}
                className={cn(
                  'w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border cursor-pointer transition-all',
                  isActive
                    ? 'bg-primary/25 border-primary/60 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                    : isYoutube
                      ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:border-red-500/50'
                      : 'bg-primary/15 border-primary/25 text-primary hover:border-primary/45',
                )}
              >
                {isYoutube ? <Youtube size={14} /> : <KindIcon size={14} />}
              </button>
            </GlassTooltip>
          );
        })}
      </div>

      <div className="w-full flex flex-col items-center gap-1 px-1.5 pt-2 mt-1 border-t border-foreground/[0.08]">
        <GlassTooltip content="Dodaj źródło">
          <GlassButton variant="ghost" size="icon" className="h-9 w-9 text-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
          </GlassButton>
        </GlassTooltip>

        {/* Bez Ustawień — rządzą nadrzędne ustawienia platformy. */}
      </div>
    </div>
  );
}

export default SidebarRail;
