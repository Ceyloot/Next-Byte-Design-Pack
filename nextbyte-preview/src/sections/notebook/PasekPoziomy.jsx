import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical, BookOpen, Plus, FileStack, ChevronDown, ChevronLeft,
  Search, Sun, Moon, Trash2, CheckSquare, Square, Folder,
  Video as Youtube, Loader2, Sparkles, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import znak from '@/assets/nextbyte-mark.png';
import { getKindIcon } from './utils/sourceKinds';
import { odczytajAktualnyMotyw, przelaczNastepnyMotyw } from '@/sections/panel2/fundament/kolejka-motywow';

export function PasekPoziomyNotebook({
  onUchwyt,
  onMenu,
  projects = [],
  activeProjectId,
  onChangeProject,
  onCreateProject,
  sources = [],
  pendingSources = [],
  selectedSourceIds = [],
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
  projectName,
  notesSlot,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'projects' | 'sources' | null
  const [motyw, setMotyw] = useState(odczytajAktualnyMotyw);
  const containerRef = useRef(null);

  useEffect(() => {
    const odswiez = () => setMotyw(odczytajAktualnyMotyw());
    window.addEventListener('themeChanged', odswiez);
    window.addEventListener('nb-theme-change', odswiez);
    return () => {
      window.removeEventListener('themeChanged', odswiez);
      window.removeEventListener('nb-theme-change', odswiez);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const allSelected = sources.length > 0 && selectedSourceIds.length === sources.length;

  return (
    <div ref={containerRef} className="relative z-40 w-full select-none">
      <div className="flex h-12 w-full items-center justify-between gap-2.5 rounded-2xl border border-foreground/[0.12] bg-card/65 px-3 shadow-xl backdrop-blur-2xl">
        {/* Accent line on top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* ── LEFT GROUP: Uchwyt + Brand + Menu ── */}
        <div className="flex items-center gap-2 shrink-0">
          {onUchwyt && (
            <button
              type="button"
              onPointerDown={onUchwyt}
              title="Złap i przeciągnij, aby przypiąć nawigację (góra / dół / lewo / prawo)"
              className="flex h-7 w-6 cursor-grab items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 p-1 shadow-sm">
              <img src={znak} alt="NextByte" className="h-full w-full rounded-lg object-contain" />
            </div>
            <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider text-foreground">
              NEXTBYTE
            </span>
          </div>

          <div className="h-4 w-px bg-foreground/10 mx-0.5" />

          {onMenu && (
            <button
              type="button"
              onClick={onMenu}
              className="flex h-7 items-center gap-1.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] px-2.5 text-xs font-semibold text-foreground/75 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-primary" />
              <span>Next Scribe</span>
              <span className="rounded bg-foreground/[0.06] px-1 py-0.2 text-[9px] font-mono font-bold text-foreground/40">
                MENU
              </span>
            </button>
          )}
        </div>

        {/* ── CENTER GROUP: Notatnik + Źródła + Dodaj ── */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Projects Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(v => v === 'projects' ? null : 'projects')}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all',
                openDropdown === 'projects'
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_12px_rgba(112,190,250,0.2)]'
                  : 'border-foreground/[0.08] bg-foreground/[0.03] text-foreground/80 hover:border-foreground/20 hover:text-foreground'
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[130px] truncate">{projectName || 'Mój Notatnik'}</span>
              <ChevronDown className="h-3 w-3 text-foreground/40" />
            </button>

            {openDropdown === 'projects' && (
              <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-foreground/15 bg-card/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                  Notatniki ({projects.length})
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onChangeProject?.(p.id);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition-all',
                        p.id === activeProjectId
                          ? 'border border-primary/30 bg-primary/15 font-semibold text-primary'
                          : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                      )}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-[10px] text-foreground/40 tabular-nums">{p.sourceCount ?? 0}</span>
                    </button>
                  ))}
                </div>
                {onCreateProject && (
                  <>
                    <div className="my-1 border-t border-foreground/[0.08]" />
                    <button
                      type="button"
                      onClick={() => {
                        onCreateProject();
                        setOpenDropdown(null);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Nowy notatnik</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sources Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(v => v === 'sources' ? null : 'sources')}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all',
                openDropdown === 'sources'
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_12px_rgba(112,190,250,0.2)]'
                  : 'border-foreground/[0.08] bg-foreground/[0.03] text-foreground/80 hover:border-foreground/20 hover:text-foreground'
              )}
            >
              <FileStack className="h-3.5 w-3.5 text-primary" />
              <span>Źródła</span>
              <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary tabular-nums">
                {sources.length}
              </span>
              <ChevronDown className="h-3 w-3 text-foreground/40" />
            </button>

            {openDropdown === 'sources' && (
              <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-foreground/15 bg-card/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-1 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                    Źródła projektu ({sources.length})
                  </span>
                  <div className="flex items-center gap-1">
                    {sources.length > 0 && (
                      <button
                        type="button"
                        onClick={onToggleAllSources}
                        title={allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                        className="rounded-md p-1 text-foreground/50 hover:text-primary transition-colors"
                      >
                        {allSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    {selectedSourceIds.length > 0 && (
                      <button
                        type="button"
                        onClick={onRemoveSelectedSources}
                        title={`Usuń ${selectedSourceIds.length} zaznaczonych`}
                        className="flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[10px] font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{selectedSourceIds.length}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {pendingSources.map(src => (
                    <div key={src.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-foreground/60">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="truncate">{src.title}</span>
                    </div>
                  ))}
                  {sources.map(src => {
                    const isSelected = selectedSourceIds.includes(src.id);
                    const isActive = activeSourceId === src.id;
                    const KindIcon = src.type === 'youtube' ? Youtube : getKindIcon(src.fileKind);
                    return (
                      <div
                        key={src.id}
                        onClick={() => onActiveSourceChange?.(src.id)}
                        className={cn(
                          'group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer border',
                          isActive
                            ? 'border-primary/40 bg-primary/15 text-primary font-semibold'
                            : 'border-transparent text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <KindIcon className={cn('h-3.5 w-3.5 shrink-0', src.type === 'youtube' ? 'text-red-400' : 'text-primary/70')} />
                          <span className="truncate">{src.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onRemoveSource?.(src.id)}
                            className="rounded p-0.5 text-foreground/30 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectSource?.(src.id)}
                            className="rounded p-0.5 text-foreground/40 hover:text-primary transition-all"
                          >
                            {isSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {sources.length === 0 && pendingSources.length === 0 && (
                    <div className="py-3 text-center text-xs text-foreground/40">Brak źródeł</div>
                  )}
                </div>

                {onOpenAddModal && (
                  <>
                    <div className="my-1.5 border-t border-foreground/[0.08]" />
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAddModal();
                        setOpenDropdown(null);
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dodaj źródło</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              title="Dodaj źródło"
              className="flex h-7 items-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dodaj</span>
            </button>
          )}
        </div>

        {/* ── RIGHT GROUP: Notatki + Motyw + Profil ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {notesSlot && (
            <div className="shrink-0">{notesSlot}</div>
          )}

          <button
            type="button"
            onClick={() => setMotyw(przelaczNastepnyMotyw())}
            title={motyw?.jasny ? 'Ciemny motyw' : 'Jasny motyw'}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.03] text-foreground/60 transition-all hover:border-foreground/20 hover:text-foreground"
          >
            {motyw?.jasny ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/25 text-[11px] font-bold text-primary shrink-0">
            AB
          </div>
        </div>
      </div>
    </div>
  );
}
