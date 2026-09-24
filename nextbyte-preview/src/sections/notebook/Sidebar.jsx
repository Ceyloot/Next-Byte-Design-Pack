/* ═══════════════════════════════════════════════════════════════
   PASEK NEXT SCRIBE — ta sama NawigacjaBoczna co w platformie.
   Moduł podaje wyłącznie inne pozycje: notatniki i źródła.
   Wygląd wierszy, nagłówków sekcji, szukajki i doku idzie z biblioteki
   (`@/components/NawigacjaBoczna`) — tu nie ma ani jednej klasy powierzchni.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Plus, Video as Youtube, CheckSquare, Square, Trash2, Library, Loader2, Folder, FileStack, BookOpen } from 'lucide-react';
import { getKindIcon } from './utils/sourceKinds';
import { NawigacjaBoczna, useSzyna, PigulkaModulu, LicznikPanelu, PigulkaNowy, GrupaPanelu, WierszPanelu } from '@/components/NawigacjaBoczna';

function odmianaNotatnik(n) {
  const j = n % 10, d = n % 100;
  if (n === 1) return 'notatnik';
  return j >= 2 && j <= 4 && !(d >= 12 && d <= 14) ? 'notatniki' : 'notatników';
}

function Sidebar({
  onMenu,
  strona = 'lewo',
  onUchwyt,
  projects = [],
  activeProjectId,
  onChangeProject,
  onCreateProject,
  sources,
  pendingSources = [],
  selectedSourceIds,
  activeSourceId,
  onSelectSource,
  onToggleAllSources,
  onRemoveSelectedSources,
  onRemovePlaylist,
  onActiveSourceChange,
  onRemoveSource,
  onOpenAddModal,
  onToggleLeftOpen,
  notesSlot,
}) {
  const [otwartePlaylisty, setOtwartePlaylisty] = useState({});
  const allSelected = sources.length > 0 && selectedSourceIds.length === sources.length;

  const standalone = [];
  const playlists = {};
  sources.forEach(src => {
    if (src.playlistId) {
      playlists[src.playlistId] ??= { id: src.playlistId, title: src.playlistTitle || 'Playlista', sources: [] };
      playlists[src.playlistId].sources.push(src);
    } else standalone.push(src);
  });

  const [notatnikiOtwarte, setNotatnikiOtwarte] = useState(true);
  const [zrodlaOtwarte, setZrodlaOtwarte] = useState(true);

  const akcjeZrodla = (src, zaznaczone) => (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemoveSource(src.id); }}
        aria-label={`Usuń źródło ${src.title}`}
        className="rounded-md p-0.5 text-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelectSource(src.id); }}
        aria-label={zaznaczone ? 'Odznacz źródło' : 'Zaznacz źródło'}
        className="rounded-md p-0.5"
      >
        {zaznaczone
          ? <CheckSquare className="h-3.5 w-3.5 text-primary" />
          : <Square className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60" />}
      </button>
    </>
  );

  const wierszZrodla = (src, wciecie) => {
    const zaznaczone = selectedSourceIds.includes(src.id);
    return (
      <WierszPanelu
        key={src.id}
        wciecie={wciecie}
        etykieta={src.title}
        ikona={src.type === 'youtube' ? Youtube : getKindIcon(src.fileKind)}
        kolorIkony={src.type === 'youtube' ? 'text-red-400' : 'text-primary/70'}
        aktywny={activeSourceId === src.id}
        onClick={() => onActiveSourceChange(src.id)}
        koniec={akcjeZrodla(src, zaznaczone)}
      />
    );
  };

  return (
    /* Szerokość panelu narzędzia jak Chat AI (~300 px tafli), nie menu (264). */
    <NawigacjaBoczna
      szerokosc={300}
      strona={strona}
      onUchwyt={onUchwyt}
      naGorze={<PigulkaModulu nazwa="Next Scribe" onClick={onMenu} />}
      stopka={notesSlot}
    >
      <LicznikPanelu tekst={`${projects.length} ${odmianaNotatnik(projects.length)}`} />
      {onCreateProject && <PigulkaNowy tekst="Nowy notatnik" onClick={onCreateProject} />}

      <GrupaPanelu tytul="Notatniki" ikona={BookOpen} otwarta={notatnikiOtwarte} onPrzelacz={() => setNotatnikiOtwarte(v => !v)}>
        {projects.map(p => (
          <WierszPanelu
            key={p.id}
            etykieta={p.name}
            ikona={Library}
            kolorIkony={p.id === activeProjectId ? 'text-primary' : 'text-foreground/50'}
            aktywny={p.id === activeProjectId}
            onClick={() => onChangeProject?.(p.id)}
            koniec={<span className="text-[11px] tabular-nums text-foreground/40">{p.sourceCount ?? 0}</span>}
          />
        ))}
      </GrupaPanelu>

      <GrupaPanelu
        tytul={sources.length ? `Źródła · ${sources.length}` : 'Źródła'}
        ikona={FileStack}
        otwarta={zrodlaOtwarte}
        onPrzelacz={() => setZrodlaOtwarte(v => !v)}
        akcja={
          <span className="flex items-center gap-1">
            {selectedSourceIds.length > 0 && (
              <button
                type="button"
                onClick={onRemoveSelectedSources}
                aria-label={`Usuń ${selectedSourceIds.length} zaznaczonych`}
                className="flex items-center gap-1 rounded-md px-1 text-[10px] font-semibold text-destructive/80 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />{selectedSourceIds.length}
              </button>
            )}
            {sources.length > 0 && (
              <button
                type="button"
                onClick={onToggleAllSources}
                aria-label={allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                className="rounded-md p-0.5 text-foreground/40 hover:text-foreground"
              >
                {allSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
              </button>
            )}
            <button type="button" onClick={onOpenAddModal} aria-label="Dodaj źródło" className="rounded-md p-0.5 text-foreground/50 hover:text-primary">
              <Plus className="h-4 w-4" />
            </button>
          </span>
        }
      >
        {pendingSources.map(src => (
          <WierszPanelu key={src.id} etykieta={src.title} ikona={Loader2} kolorIkony="text-primary animate-spin" />
        ))}
        {Object.values(playlists).map(pl => (
          <React.Fragment key={pl.id}>
            <WierszPanelu
              etykieta={pl.title}
              ikona={Folder}
              kolorIkony="text-primary/70"
              onClick={() => setOtwartePlaylisty(o => ({ ...o, [pl.id]: !o[pl.id] }))}
              koniec={
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemovePlaylist(pl.id); }}
                    aria-label={`Usuń playlistę ${pl.title}`}
                    className="rounded-md p-0.5 text-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] tabular-nums text-foreground/40">{pl.sources.length}</span>
                </>
              }
            />
            {otwartePlaylisty[pl.id] && pl.sources.map(src => wierszZrodla(src, true))}
          </React.Fragment>
        ))}
        {standalone.map(src => wierszZrodla(src, false))}
        {sources.length === 0 && pendingSources.length === 0 && (
          <WierszPanelu etykieta="Dodaj pierwsze źródło" ikona={Plus} kolorIkony="text-primary" onClick={onOpenAddModal} />
        )}
      </GrupaPanelu>
    </NawigacjaBoczna>
  );
}

export default Sidebar;
