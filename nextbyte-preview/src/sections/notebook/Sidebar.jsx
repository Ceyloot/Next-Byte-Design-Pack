import React, { useState } from 'react';
import { Plus, Video as Youtube, CheckSquare, Square, Trash2, Library, Loader2, ChevronDown, ChevronRight, ChevronLeft, Folder, PanelLeftClose, Sparkles } from 'lucide-react';
import { getKindIcon } from './utils/sourceKinds';
import { GlassButton, GlassTooltip } from '@/components/glass';
import { cn } from '@/lib/utils';

function Sidebar({
  sources,
  pendingSources = [],
  selectedSourceIds,
  activeSourceId,
  onSelectSource,
  onToggleAllSources,
  onRemoveSelectedSources,
  onRemovePlaylist,
  onTogglePlaylistSelection,
  onActiveSourceChange,
  onRemoveSource,
  isLoading,
  onOpenAddModal,
  onToggleLeftOpen,
  projectName,
  onBackToDashboard,
  notesSlot,
}) {
  const [expandedPlaylists, setExpandedPlaylists] = useState({});
  const allSelected = sources.length > 0 && selectedSourceIds.length === sources.length;

  const togglePlaylist = (pid) => {
    setExpandedPlaylists(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card/75 backdrop-blur-2xl select-none border-r border-foreground/[0.09] transition-colors duration-300">
      {/* Powrót do listy notatników. Pasek u góry to ATRAPA navbara platformy —
          nic z appki tam nie trafia — więc nawigacja appki żyje tutaj. */}
      {onBackToDashboard && (
        <div className="border-b border-foreground/[0.09] px-3.5 py-2 flex-shrink-0">
          <button
            onClick={onBackToDashboard}
            title="Powrót do listy notatników"
            className="group/back flex items-center gap-1.5 -ml-1 pl-1 pr-2 py-1 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer max-w-full"
          >
            <ChevronLeft size={14} className="text-primary flex-shrink-0 group-hover/back:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold truncate" title={projectName}>
              {projectName || 'Notatniki'}
            </span>
          </button>
        </div>
      )}

      {/* Źródła. Chrome panelu (zwijanie) oddzielone od akcji na zaznaczeniu —
          wcześniej trzy różne ikony tłoczyły się w jednym rzędzie i nie było widać,
          co dotyczy panelu, a co zaznaczonych źródeł. */}
      <div className="border-b border-foreground/[0.09] px-3.5 pt-3 pb-3 flex-shrink-0">
        {/* Ten sam nagłówek, co wszędzie: mikroetykieta, wloskowa linia
            wypełniająca resztę wiersza, akcja na końcu. Zniknął chip z obwódką
            i pigułka licznika — obie były własnym językiem tego panelu. */}
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="shrink-0 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/65">
            Źródła
          </span>
          {sources.length > 0 && (
            <span className="shrink-0 text-[11px] font-semibold text-foreground/45">{sources.length}</span>
          )}
          <span aria-hidden className="h-px flex-1 bg-foreground/[0.07]" />
          {onToggleLeftOpen && (
            <button
              type="button"
              onClick={onToggleLeftOpen}
              title="Zwiń panel źródeł"
              aria-label="Zwiń panel źródeł"
              className="shrink-0 rounded-lg p-1 text-foreground/35 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <PanelLeftClose size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenAddModal}
          className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 hover:bg-primary/[0.08] active:scale-[0.99]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary transition-transform duration-200 group-hover:scale-110">
            <Plus size={14} />
          </span>
          <span className="text-[13px] font-semibold text-primary">Dodaj źródło</span>
        </button>

        {/* Pasek zaznaczenia — osobny wiersz, pojawia się dopiero gdy jest co
            zaznaczać. "Usuń" wchodzi dopiero przy niepustym zaznaczeniu, więc
            destrukcyjna akcja nie siedzi na stałe obok neutralnych ikon. */}
        {sources.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            <button
              onClick={onToggleAllSources}
              className="flex items-center gap-1.5 h-7 px-2 -ml-1 rounded-lg text-[11px] font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare size={13} className="text-primary shrink-0" />
              ) : (
                <Square size={13} className="shrink-0" />
              )}
              <span>{allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}</span>
            </button>

            {selectedSourceIds.length > 0 && (
              <GlassTooltip content={`Usuń ${selectedSourceIds.length} zaznaczonych`}>
                <button
                  onClick={onRemoveSelectedSources}
                  aria-label={`Usuń ${selectedSourceIds.length} zaznaczonych`}
                  className="ml-auto flex items-center gap-1 h-7 px-2 rounded-lg text-[11px] font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                  <span className="tabular-nums">{selectedSourceIds.length}</span>
                </button>
              </GlassTooltip>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2 custom-scrollbar">
        {/* Loading pending */}
        {pendingSources.map(src => (
          <div key={src.id} className="nb-wglobienie p-3 flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-primary/15 border border-primary/30">
              <Loader2 size={14} className="animate-spin text-primary" />
            </div>
            <span className="flex-1 text-xs text-foreground/80 truncate">{src.title}</span>
          </div>
        ))}

        {/* Empty state */}
        {sources.length === 0 && pendingSources.length === 0 ? (
          <div className="px-3 py-2" />
        ) : (
          (() => {
            const standalone = [];
            const playlists = {};

            sources.forEach(src => {
              if (src.playlistId) {
                if (!playlists[src.playlistId]) {
                  playlists[src.playlistId] = {
                    id: src.playlistId,
                    title: src.playlistTitle || 'Playlista',
                    sources: []
                  };
                }
                playlists[src.playlistId].sources.push(src);
              } else {
                standalone.push(src);
              }
            });

            const renderSource = (src) => {
              const isSelected = selectedSourceIds.includes(src.id);
              const isActive = activeSourceId === src.id;
              const isYoutube = src.type === 'youtube';
              const KindIcon = getKindIcon(src.fileKind);

              return (
                <div
                  key={src.id}
                  onClick={() => onActiveSourceChange(src.id)}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border select-none',
                    isActive
                      ? 'bg-primary/20 border-primary/50 text-foreground shadow-[0_0_16px_rgba(112,190,250,0.25)]'
                      : isSelected
                      ? 'bg-foreground/[0.08] border-foreground/[0.16] hover:bg-foreground/[0.1]'
                      : 'nb-wglobienie'
                  )}
                >
                  {/* Icon Socket */}
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner',
                    isYoutube
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-primary/15 border-primary/25 text-primary'
                  )}>
                    {isYoutube
                      ? <Youtube size={15} />
                      : <KindIcon size={15} />}
                  </div>

                  {/* Title */}
                  <span className="flex-1 text-[12.5px] font-semibold text-foreground/85 truncate leading-snug min-w-0 group-hover:text-foreground" title={src.title}>
                    {src.title}
                  </span>

                  {/* Actions */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveSource(src.id); }}
                    aria-label={`Usuń źródło ${src.title}`}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-foreground/50 hover:text-destructive transition-all p-1 rounded-md hover:bg-destructive/15"
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectSource(src.id); }}
                    className="flex-shrink-0 transition-colors p-1 rounded-md hover:bg-foreground/[0.08]"
                  >
                    {isSelected
                      ? <CheckSquare size={15} className="text-primary" />
                      : <Square size={15} className="text-foreground/30 group-hover:text-foreground/60" />}
                  </button>
                </div>
              );
            };

            return (
              <>
                {Object.values(playlists).map(pl => {
                  const isExpanded = expandedPlaylists[pl.id];

                  return (
                    <div key={pl.id} className="mb-2">
                      <div
                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-foreground/[0.08] rounded-xl text-xs transition-all border border-foreground/[0.08] bg-foreground/[0.03] group shadow-sm"
                        onClick={() => togglePlaylist(pl.id)}
                      >
                        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-primary/15 border border-primary/30 text-primary">
                          <Folder size={13} />
                        </div>
                        <span className="flex-1 font-bold truncate text-[12px] text-foreground/90">{pl.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-foreground/[0.06] border border-foreground/[0.1] text-[10px] font-mono font-bold text-foreground/70">
                          {pl.sources.length}
                        </span>
                        {isExpanded ? <ChevronDown size={13} className="text-foreground/50" /> : <ChevronRight size={13} className="text-foreground/50" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemovePlaylist(pl.id); }}
                          aria-label={`Usuń playlistę ${pl.title}`}
                          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1 flex-shrink-0 rounded-md hover:bg-destructive/15"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="pl-3.5 border-l border-foreground/[0.09] ml-3.5 mt-1.5 space-y-1.5">
                          {pl.sources.map(src => renderSource(src))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="space-y-1.5">{standalone.map(src => renderSource(src))}</div>
              </>
            );
          })()
        )}
      </div>

      {/* Notatki — na dole kolumny, rozwijają się w górę. Wcześniej siedziały między
          nagłówkiem źródeł a listą i robiły z kolumny trzy osobne bloki nagłówkowe;
          tutaj lista źródeł płynie bez przerwy, a notatki są tym, czym są — dodatkiem
          obok ustawień, zwiniętym do jednego wiersza dopóki nie są potrzebne. */}
      {notesSlot}

      {/* Stopki z Ustawieniami tu nie ma: w praktyce rządzą ustawienia
          nadrzędne platformy, więc własne wejście z notatnika było drugim
          miejscem na tę samą rzecz — i tym, które nic nie zmienia. */}
    </div>
  );
}

export default Sidebar;
