import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import SidebarRail from './SidebarRail';
import ChatPanel from './ChatPanel';
import NotesDropdown from './NotesDropdown';
import StudioPanel from './StudioPanel';
import SettingsModal from './SettingsModal';
import AddSourceModal from './AddSourceModal';
import Dashboard from './Dashboard';
import SourcePreviewModal from './SourcePreviewModal';
import SourceViewerModal from './SourceViewerModal';
import VideoPlayerModal from './VideoPlayerModal';
import ConfirmDialog from './ConfirmDialog';
import PromptDialog from './PromptDialog';
import ConfigureChatModal from './ConfigureChatModal';
import { useToast } from './Toast';
import { fetchYoutubeTranscript, extractVideoId, extractPlaylistId, fetchPlaylistVideoIds } from './utils/youtube';
import { extractFileContent, detectFileKind } from './utils/fileImport';
import { scrapeWebUrl } from './utils/webScraper';
import { sendChatMessage, generatePresetQuestions, transcribeAudio } from './utils/geminiApi';
import { indexSource, retrieveChunks, buildRagContext, isRagEnabled } from './utils/rag';
import {
  getProjects, createProject, renameProject, deleteProject,
  getSources, createSource, updateSource, deleteSource,
  getSelected, setSelected,
  getChat, saveChat, clearChat,
  getNotes, saveNotes,
  getStudio, saveStudio,
} from './utils/api';
import {
  FileText, Library, Plus, Settings,
  // Tylko dla atrapy navbara platformy (PLATFORM_NAV_MOCK) — nie dla funkcji appki.
  Zap, MonitorPlay, LayoutGrid, Sparkles, Layers, Navigation, PanelTop, BarChart2, Loader, Palette, Tag,
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import { TechGrid } from '@/grafiki/siatka-techniczna'
import { NbGlassFilters, GlassNav, GlassNavItem, GlassNavBrand, GlassNavSpacer, GlassButton, GlassDrawer } from '@/components/glass';
import { cn } from '@/lib/utils';

const MAX_MEDIA_BLOB_BYTES = 25 * 1024 * 1024;

// Zakładki widoków zostały wycięte: został sam Czat AI, więc nie ma czego
// przełączać. Transkrypcja → duży modal po kliknięciu w źródło
// (SourceViewerModal), Notatki → rozwijana sekcja nad listą źródeł
// (NotesDropdown), Mapa Myśli & Nauka → usunięta całkowicie.

// Pozycje przepisane z navbara preview kitu (nextbyte-preview/src/App.tsx → TABS).
// To ATRAPA paska platformy — czysta dekoracja, żeby było widać jak notatnik siada
// pod nim po osadzeniu. Nic tu nie klika i nic stąd nie steruje aplikacją.
/* Nazwa, ktora notatnik nosi, zanim AI przeczyta zrodla i nada wlasciwa. */
export const NAZWA_ROBOCZA = 'Nowy notatnik';

const PLATFORM_NAV_MOCK = [
  { key: 'preview', label: 'Preview', icon: MonitorPlay },
  { key: 'karty', label: 'Karty', icon: LayoutGrid },
  { key: 'akcje', label: 'Akcje', icon: Sparkles },
  { key: 'formularze', label: 'Formularze', icon: Layers },
  { key: 'nawigacja', label: 'Nawigacja', icon: Navigation },
  { key: 'nakladki', label: 'Nakładki', icon: PanelTop },
  { key: 'dane', label: 'Dane', icon: BarChart2 },
  { key: 'stany', label: 'Stany', icon: Loader },
  { key: 'paleta', label: 'Paleta', icon: Palette },
  { key: 'cennik', label: 'Cennik', icon: Tag },
];

// Pointer events zamiast mouse events — działają tak samo na myszy i na dotyku.
function useDragResize(initialPx, min, max, invert = false) {
  const [width, setWidth] = useState(initialPx);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const effectiveDelta = invert ? -delta : delta;
      setWidth(Math.min(max, Math.max(min, startW.current + effectiveDelta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [min, max, invert]);

  return [width, onPointerDown];
}

// Jeden breakpoint dla całej appki: poniżej md (768px) przechodzimy na layout jednopanelowy.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

function ResizeHandle({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{ touchAction: 'none' }}
      className="w-1.5 flex-shrink-0 cursor-col-resize group relative z-10 flex items-center justify-center"
    >
      <div className="w-px h-full bg-border/30 group-hover:bg-primary/40 group-active:bg-primary/60 transition-colors" />
      <div className="absolute w-4 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex flex-col gap-0.5">
          <div className="w-0.5 h-3 bg-primary/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Usuwa duplikaty źródeł YouTube po videoId, zachowując pierwsze wystąpienie.
// Sprząta dane, które mogły się zdublować przed naprawą deduplikacji w handleAddSource.
function dedupeSources(list) {
  const seen = new Set();
  return list.filter((s) => {
    if (!s.videoId) return true;
    if (seen.has(s.videoId)) return false;
    seen.add(s.videoId);
    return true;
  });
}

// Naprawia źródła zapisane przed migracją na crypto.randomUUID() — te mogły dostać
// kolidujące id (Date.now() w tej samej milisekundzie przy równoległym imporcie),
// przez co np. na Canvasie znikały jako "nadpisane" węzły o tym samym id.
function fixDuplicateIds(list) {
  const seen = new Set();
  return list.map((s) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      return s;
    }
    const newId = crypto.randomUUID();
    seen.add(newId);
    return { ...s, id: newId };
  });
}

function NotebookPage({ otworzUstawieniaBezKlucza = false, pokazAtrapePaska = false }) {
  const [leftWidth, onLeftDrag] = useDragResize(280, 220, 480);
  const [rightWidth, onRightDrag] = useDragResize(340, 260, 600, true);

  const [projects, setProjects] = useState([
    { id: 'default_project', name: 'Mój Notatnik', createdAt: new Date().toISOString() }
  ]);
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('notebook_active_project_id') || 'default_project'
  );

  const [sources, setSources] = useState([]);
  const [pendingSources, setPendingSources] = useState([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [studioOutputs, setStudioOutputs] = useState([]);
  const [isStudioGenerating, setIsStudioGenerating] = useState(false);
  const [isConfigureChatOpen, setIsConfigureChatOpen] = useState(false);
  const [chatConfig, setChatConfig] = useState({ goal: 'default', length: 'default', customPrompt: '' });

  // Blokada auto-save podczas przełączania projektu
  const lastLoadedProjectIdRef = useRef(null);

  // Ładuj projekty z API przy starcie
  useEffect(() => {
    getProjects().then(rows => {
      if (rows.length > 0) setProjects(rows.map(r => ({ id: r.id, name: r.name, createdAt: r.created_at, sourceCount: r.source_count ?? 0 })));
    }).catch(() => { });
  }, []);

  // Synchronizuj licznik źródeł aktywnego projektu z aktualnym stanem
  useEffect(() => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, sourceCount: sources.length } : p));
  }, [sources.length, activeProjectId]);

  // Ładuj dane projektu z SQLite przy przełączeniu
  useEffect(() => {
    if (!activeProjectId) return;
    lastLoadedProjectIdRef.current = null;
    setActiveSourceId(null);

    Promise.all([
      getSources(activeProjectId).catch(() => []),
      getSelected(activeProjectId).catch(() => []),
      getChat(activeProjectId).catch(() => []),
      getNotes(activeProjectId).catch(() => []),
      getStudio(activeProjectId).catch(() => []),
    ]).then(([srcs, sel, chat, notes, studio]) => {
      // mediaBlob wraca jako base64 string — konwertujemy na Blob dla podglądu
      const hydrated = srcs.map(src => {
        if (src.mediaBlob && src.mediaMime) {
          try {
            const bytes = atob(src.mediaBlob);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            return { ...src, mediaBlob: new Blob([arr], { type: src.mediaMime }) };
          } catch { return src; }
        }
        return src;
      });
      setSources(fixDuplicateIds(dedupeSources(hydrated)));
      setSelectedSourceIds(sel);
      setChatMessages(chat);
      setUserNotes(notes);
      setStudioOutputs(studio);

      const timer = setTimeout(() => { lastLoadedProjectIdRef.current = activeProjectId; }, 50);
      return () => clearTimeout(timer);
    }).catch(console.error);
  }, [activeProjectId]);

  useEffect(() => { localStorage.setItem('notebook_active_project_id', activeProjectId); }, [activeProjectId]);

  // Auto-save czat do SQLite (debounced via useEffect)
  useEffect(() => {
    if (!activeProjectId || activeProjectId !== lastLoadedProjectIdRef.current) return;
    const persistable = chatMessages.map(m => {
      if (!Array.isArray(m.attachments) || m.attachments.length === 0) return m;
      return {
        ...m,
        attachments: m.attachments.map(a => ({ id: a.id, name: a.name, mimeType: a.mimeType, size: a.size })),
      };
    });
    saveChat(activeProjectId, persistable).catch(() => { });
  }, [chatMessages, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || activeProjectId !== lastLoadedProjectIdRef.current) return;
    saveNotes(activeProjectId, userNotes).catch(() => { });
  }, [userNotes, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || activeProjectId !== lastLoadedProjectIdRef.current) return;
    saveStudio(activeProjectId, studioOutputs).catch(() => { });
  }, [studioOutputs, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || activeProjectId !== lastLoadedProjectIdRef.current) return;
    setSelected(activeProjectId, selectedSourceIds).catch(() => { });
  }, [selectedSourceIds, activeProjectId]);

  const [apiKeys, setApiKeys] = useState(() => {
    const envKeys = {
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
      youtube: import.meta.env.VITE_YOUTUBE_API_KEY || '',
      pexels: import.meta.env.VITE_PEXELS_API_KEY || '',
      elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseKey: import.meta.env.VITE_SUPABASE_KEY || '',
    };
    try {
      const saved = JSON.parse(localStorage.getItem('notebook_api_keys'));
      if (saved && typeof saved === 'object') {
        return {
          gemini: saved.gemini || envKeys.gemini,
          youtube: saved.youtube || envKeys.youtube,
          pexels: saved.pexels || envKeys.pexels,
          elevenlabs: saved.elevenlabs || envKeys.elevenlabs,
          model: saved.model || envKeys.model,
          supabaseUrl: saved.supabaseUrl || envKeys.supabaseUrl,
          supabaseKey: saved.supabaseKey || envKeys.supabaseKey,
        };
      }
      return envKeys;
    } catch {
      return envKeys;
    }
  });

  // RAG: indeksowanie źródeł w tle (uruchom po dodaniu nowego źródła)
  const indexSourceInBackground = useCallback((source) => {
    if (!isRagEnabled(apiKeys) || !apiKeys.gemini || !activeProjectId) return;
    indexSource(apiKeys.supabaseUrl, apiKeys.supabaseKey, apiKeys.gemini, activeProjectId, source)
      .then(({ indexed, total }) => console.log(`RAG: zindeksowano ${indexed}/${total} chunków dla "${source.title}"`))
      .catch(err => console.warn('RAG index failed:', err.message));
  }, [apiKeys, activeProjectId]);

  useEffect(() => {
    localStorage.setItem('notebook_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const presetDebounceRef = useRef(null);

  const [viewMode, setViewMode] = useState('dashboard');
  /* PODGLĄD: bez klucza Gemini aplikacja otwierała Ustawienia od razu, na pełny
     ekran, zasłaniając cały układ — a tu przyszliśmy oglądać układ, nie je.
     W docelowym repo to zachowanie ma sens, więc zostaje pod flagą. */
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    otworzUstawieniaBezKlucza ? !apiKeys.gemini : false,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  // Mobile: panel źródeł jako szuflada (na telefonie nie ma stałych kolumn).
  const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);
  // Desktop: domyślnie otwarty — appka ma się czytać jako stały układ 3-kolumnowy
  // (źródła | czat | dokumenty), nie jako 2 kolumny z wysuwanym panelem.
  // Mobile: domyślnie zamknięty, bo tam to szuflada — otwarta na starcie zasłoniłaby czat.
  const [isObjectsOpen, setIsObjectsOpen] = useState(
    () => !window.matchMedia('(max-width: 767px)').matches
  );
  const [previewTarget, setPreviewTarget] = useState(null);
  // Źródło otwarte w dużym podglądzie (dawna zakładka "Transkrypcja").
  const [viewerSourceId, setViewerSourceId] = useState(null);
  const [chatPrefill, setChatPrefill] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [presetData, setPresetData] = useState({ title: '', summary: '', questions: [] });
  const [isGeneratingPresets, setIsGeneratingPresets] = useState(false);

  // Pływający odtwarzacz YouTube — wspólna logika seeka dla czatu i podglądu źródła.
  // Zamiast window.open (nowa karta wybija z appki, zwłaszcza na mobile) otwieramy
  // player w rogu ekranu; user zostaje w kontekście tego, co czyta.
  const [playerTarget, setPlayerTarget] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [sourcesToDelete, setSourcesToDelete] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [projectToRename, setProjectToRename] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  // Skrót klawiszowy Ctrl+K / Cmd+K dla Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportDocx = async () => {
    if (!activeProjectId || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/export/docx`);
      if (!res.ok) throw new Error(`Błąd ${res.status}`);
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const nameMatch = disposition.match(/filename\*=UTF-8''(.+)/);
      const filename = nameMatch ? decodeURIComponent(nameMatch[1]) : 'notatnik.docx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('Eksport gotowy — plik DOCX pobrany.');
    } catch (err) {
      toast.error(`Nie udało się wyeksportować: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSeekToVideo = useCallback((videoId, timeSeconds) => {
    if (!videoId) return;
    // Podświetl właściwe źródło (activeSourceId to id źródła, nie videoId)
    const src = sources.find(s => s.videoId === videoId);
    if (src) setActiveSourceId(src.id);
    setPlayerTarget({ videoId, start: Math.floor(timeSeconds || 0), title: src?.title });
  }, [sources]);

  // Kliknięcie w źródło otwiera duży podgląd (dawna zakładka "Transkrypcja").
  const handleOpenSourceViewer = useCallback((id) => {
    setActiveSourceId(id);
    setViewerSourceId(id);
  }, []);

  const handleAskInChat = useCallback((text, hiddenContext = null) => {
    setChatPrefill({ text, hiddenContext, ts: Date.now() });
  }, []);

  // Floating text selection popup state & event listener
  const [selectionPopup, setSelectionPopup] = useState(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionPopup(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setSelectionPopup(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) {
          setSelectionPopup(null);
          return;
        }

        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          setSelectionPopup(null);
          return;
        }

        setSelectionPopup({
          text,
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8
        });
      } catch (err) {
        setSelectionPopup(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleAddSelectionToNotes = (e) => {
    e.preventDefault();
    if (!selectionPopup) return;

    const newNote = {
      id: Date.now().toString(),
      text: selectionPopup.text,
      createdAt: new Date().toISOString()
    };
    setUserNotes(prev => [newNote, ...prev]);
    toast.success('Dodano zaznaczony tekst do notatek.');

    window.getSelection()?.removeAllRanges();
    setSelectionPopup(null);
  };

  // Resize state
  const isMobile = useIsMobile();

  // Zbiór videoId aktualnie dodawanych lub już dodanych — chroni przed duplikatami
  // przy równoległych requestach (np. wklejenie tego samego linku 2x, dubel kliknięcia).
  const addedVideoIdsRef = useRef(new Set());
  useEffect(() => {
    addedVideoIdsRef.current = new Set(sources.filter(s => s.type === 'youtube').map(s => s.videoId));
  }, [sources]);

  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    setViewMode('workspace');
  };

  /* Jeden klik i notatnik istnieje. Nazwy nie pytamy, bo na tym etapie
     uzytkownik jej nie zna — nada ja AI z pierwszych dodanych zrodel.
     Do tego czasu notatnik nosi nazwe roboczą i da sie ja zmienic recznie. */
  const handleCreateProject = () => {
    confirmCreateProject(NAZWA_ROBOCZA);
  };

  const confirmCreateProject = (name) => {
    if (!name) return;
    const newId = crypto.randomUUID();
    const newProj = { id: newId, name, createdAt: new Date().toISOString() };
    createProject(newId, name).catch(() => { });
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newId);
    setViewMode('workspace');
    setIsAddModalOpen(true);
    toast.success(name === NAZWA_ROBOCZA
      ? 'Nowy notatnik gotowy.'
      : `Utworzono notatnik „${name}".`);
  };

  const handleRenameProject = (id, currentName) => {
    setProjectToRename({ id, name: currentName || '' });
  };

  const confirmRenameProject = (newName) => {
    const target = projectToRename;
    setProjectToRename(null);
    if (!target || !newName || newName === target.name) return;
    renameProject(target.id, newName).catch(() => { });
    setProjects(prev => prev.map(p => p.id === target.id ? { ...p, name: newName } : p));
    toast.success('Nazwa notatnika zaktualizowana.');
  };

  /* Czyszczenie calej listy — jedna akcja zamiast usuwania po jednym.
     Potwierdzenie jest obowiazkowe: to operacja nieodwracalna. */
  const [czyscWszystkie, setCzyscWszystkie] = useState(false);

  const confirmCzyscWszystkie = () => {
    setCzyscWszystkie(false);
    projects.forEach((p) => { deleteProject(p.id).catch(() => {}); });
    setProjects([]);
    setActiveProjectId(null);
    setSources([]);
    setPendingSources([]);
    setSelectedSourceIds([]);
    setViewMode('dashboard');
    toast.success('Usunieto wszystkie notatniki.');
  };

  const handleDeleteProject = (id) => {
    const proj = projects.find(p => p.id === id);
    // Własny dialog zamiast natywnego confirm() — spójny styl, działa dobrze na mobile.
    setProjectToDelete({ id, name: proj?.name || '' });
  };

  const confirmDeleteProject = () => {
    const target = projectToDelete;
    setProjectToDelete(null);
    if (!target) return;
    const { id } = target;

    deleteProject(id).catch(() => { });

    const remaining = projects.filter(p => p.id !== id);

    setProjects(remaining);
    if (activeProjectId === id && remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    } else if (remaining.length === 0) {
      setActiveProjectId(null);
      setSources([]);
      setPendingSources([]);
      setSelectedSourceIds([]);
      setActiveSourceId(null);
      setChatMessages([]);
      setUserNotes([]);
    }
    setViewMode('dashboard');
    toast.success(`Usunięto notatnik „${target.name}".`);
  };

  const isLoading = pendingSources.length > 0;
  const selectedSources = sources.filter(s => selectedSourceIds.includes(s.id));

  // Generate preset questions when sources change (use all sources if none selected)
  const sourcesForPresets = selectedSources.length > 0 ? selectedSources : sources;
  const presetKey = sourcesForPresets.map(s => s.id).join(',');

  useEffect(() => {
    clearTimeout(presetDebounceRef.current);

    if (!apiKeys.gemini || sourcesForPresets.length === 0) {
      setPresetData({ title: '', summary: '', questions: [] });
      return;
    }

    // Generuj tylko na początku czatu — jeśli są już wiadomości, nie rób tego ponownie.
    if (chatMessages.length > 0) return;

    // Czekamy aż wszystkie źródła się załadują. Gdy pendingSources > 0 odkładamy
    // generowanie — każde zakończone źródło i tak odpali ten efekt ponownie.
    if (pendingSources.length > 0) return;

    // Debounce 1.5s: gdy kilka źródeł kończy się jedno po drugim, generujemy
    // tylko raz — po ostatnim zakończeniu.
    presetDebounceRef.current = setTimeout(() => {
      setIsGeneratingPresets(true);
      generatePresetQuestions(apiKeys.gemini, apiKeys.model, sourcesForPresets)
        .then(data => setPresetData(data))
        .catch(() => setPresetData({ title: '', summary: '', questions: [] }))
        .finally(() => setIsGeneratingPresets(false));
    }, 1500);

    return () => clearTimeout(presetDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey, apiKeys.gemini, apiKeys.model, pendingSources.length]);

  const handleAddSource = async (sourceData) => {
    let videoId = null;
    let isWebUrl = false;

    if (sourceData.type === 'web') {
      isWebUrl = true;
    } else if (sourceData.type === 'playlist') {
      // Playlist expansion — fetch video IDs then import each individually
      const pendingId = `pending_${Date.now()}_${Math.random()}`;
      setPendingSources(prev => [...prev, { id: pendingId, type: 'youtube', title: 'Pobieranie playlisty…', isPending: true }]);
      try {
        const { ids, title } = await fetchPlaylistVideoIds(sourceData.playlistId, apiKeys.youtube);
        setPendingSources(prev => prev.filter(p => p.id !== pendingId));
        for (let i = 0; i < ids.length; i++) {
          const vid = ids[i];
          if (i > 0) {
            // Czekaj 2 sekundy między filmami z playlisty
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          await handleAddSource({ type: 'youtube', url: `https://www.youtube.com/watch?v=${vid}`, playlistId: sourceData.playlistId, playlistTitle: title });
        }
        return true;
      } catch (err) {
        setPendingSources(prev => prev.filter(p => p.id !== pendingId));
        throw err;
      }
    } else if (sourceData.type === 'youtube' || !sourceData.type) {
      videoId = extractVideoId(sourceData.url);
      if (!videoId && sourceData.url && sourceData.url.startsWith('http')) {
        isWebUrl = true;
      }
      if (videoId && addedVideoIdsRef.current.has(videoId)) {
        return true; // już mamy to źródło, cicho pomijamy
      }
      if (videoId) addedVideoIdsRef.current.add(videoId);
    }

    const pendingId = `pending_${Date.now()}_${Math.random()}`;
    const urlLabel = sourceData.url
      ? sourceData.url.replace(/^https?:\/\/(www\.)?/, '')
      : (sourceData.file?.name || sourceData.title || 'Ładowanie...');
    setPendingSources(prev => [...prev, { id: pendingId, type: isWebUrl ? 'text' : (sourceData.type || 'youtube'), title: urlLabel, isPending: true }]);

    try {
      // crypto.randomUUID zamiast Date.now(): przy równoległym imporcie kilku źródeł
      // naraz (Promise.all) kilka z nich potrafiło trafić w tę samą milisekundę i dostać
      // to samo id, przez co nadpisywały się nawzajem (np. znikały węzły na Canvasie).
      let newSource = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      if (isWebUrl) {
        const data = await scrapeWebUrl(sourceData.url);
        newSource = { ...newSource, type: 'text', fileKind: 'web', title: data.title, rawText: data.rawText, author: 'Strona WWW', url: sourceData.url };
      } else if (sourceData.type === 'youtube') {
        const ytData = await fetchYoutubeTranscript(sourceData.url, apiKeys.youtube);
        newSource = { ...newSource, type: 'youtube', playlistId: sourceData.playlistId, playlistTitle: sourceData.playlistTitle, ...ytData };
      } else if (sourceData.type === 'file') {
        const kind = detectFileKind(sourceData.file);
        // Oryginalny plik trzymamy tylko dla obrazu/audio (podgląd/odtwarzacz) i tylko
        // do MAX_MEDIA_BLOB_BYTES — audio potrafi ważyć dziesiątki MB, a IndexedDB nie
        // ma tu żadnego innego capa. Powyżej limitu źródło działa dalej (tekst jest),
        // po prostu bez miniatury/odtwarzacza.
        const media = (kind === 'image' || kind === 'audio') && sourceData.file.size <= MAX_MEDIA_BLOB_BYTES
          ? { mediaBlob: sourceData.file, mediaMime: sourceData.file.type }
          : {};
        if (kind === 'audio') {
          const rawText = await transcribeAudio(apiKeys.gemini, sourceData.file, apiKeys.model || 'gemini-3.1-flash-lite');
          const title = sourceData.file.name.replace(/\.[^/.]+$/, '');
          newSource = { ...newSource, type: 'text', fileKind: 'audio', title, rawText, author: 'Nagranie audio', ...media };
        } else {
          const extracted = await extractFileContent(sourceData.file, apiKeys);
          newSource = { ...newSource, type: 'text', fileKind: extracted.kind, title: extracted.title, rawText: extracted.rawText, author: 'Plik', ...media };
        }
      } else if (sourceData.type === 'paste') {
        newSource = { ...newSource, type: 'text', fileKind: 'text', title: sourceData.title || 'Wklejony tekst', rawText: sourceData.text, author: 'Notatka' };
      } else {
        newSource = { ...newSource, type: 'text', title: sourceData.title, rawText: sourceData.content || sourceData.text, author: 'User' };
      }
      let wasAdded = true;
      setSources(prev => {
        if (newSource.videoId && prev.some(s => s.videoId === newSource.videoId)) {
          wasAdded = false;
          return prev;
        }
        return [newSource, ...prev];
      });
      if (wasAdded) {
        // Zapisz do SQLite — mediaBlob jako base64 jeśli istnieje
        const toSave = { ...newSource };
        if (toSave.mediaBlob instanceof Blob) {
          const buf = await toSave.mediaBlob.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          toSave.mediaBlob = b64;
        }
        createSource(activeProjectId, toSave).catch(console.error);
        setSelectedSourceIds(prev => [...prev, newSource.id]);
        setActiveSourceId(newSource.id);
        // RAG: zindeksuj w tle
        indexSourceInBackground(newSource);
      }
      setPendingSources(prev => prev.filter(p => p.id !== pendingId));
      return true;
    } catch (err) {
      console.error(err);
      if (videoId) addedVideoIdsRef.current.delete(videoId);
      setPendingSources(prev => prev.filter(p => p.id !== pendingId));
      toast.error(err?.message || 'Sprawdź adres URL i spróbuj ponownie.', { title: 'Nie udało się dodać źródła' });
      return false;
    }
  };

  const handleRemoveSource = (id) => {
    const src = sources.find(s => s.id === id);
    if (!src) return;
    setSourcesToDelete([src]);
  };

  const handleRemoveSelectedSources = () => {
    if (selectedSourceIds.length === 0) return;
    setSourcesToDelete(sources.filter(s => selectedSourceIds.includes(s.id)));
  };

  const handleRemovePlaylist = (playlistId) => {
    const targets = sources.filter(s => s.playlistId === playlistId);
    if (targets.length === 0) return;
    setSourcesToDelete(targets);
  };

  const handleTogglePlaylistSelection = (playlistId) => {
    const playlistSources = sources.filter(s => s.playlistId === playlistId);
    const allSelected = playlistSources.every(s => selectedSourceIds.includes(s.id));
    if (allSelected) {
      setSelectedSourceIds(prev => prev.filter(id => !playlistSources.some(s => s.id === id)));
    } else {
      const idsToAdd = playlistSources.map(s => s.id).filter(id => !selectedSourceIds.includes(id));
      setSelectedSourceIds(prev => [...prev, ...idsToAdd]);
    }
  };

  const confirmRemoveSource = () => {
    const targets = sourcesToDelete;
    setSourcesToDelete(null);
    if (!targets || targets.length === 0) return;

    const targetIds = new Set(targets.map(t => t.id));
    setSources(prev => {
      targets.forEach(t => {
        if (t.videoId) addedVideoIdsRef.current.delete(t.videoId);
      });
      return prev.filter(s => !targetIds.has(s.id));
    });
    targets.forEach(t => deleteSource(activeProjectId, t.id).catch(console.error));
    setSelectedSourceIds(prev => prev.filter(sId => !targetIds.has(sId)));
    if (targetIds.has(activeSourceId)) setActiveSourceId(null);

    toast.success(targets.length === 1 ? `Usunięto źródło „${targets[0].title}".` : `Usunięto ${targets.length} źródeł.`);
  };

  const handleRemoveNote = (id) => {
    const note = userNotes.find(n => n.id === id);
    if (!note) return;
    setNoteToDelete({ id, preview: (note.text || '').slice(0, 60) });
  };

  const confirmRemoveNote = () => {
    const target = noteToDelete;
    setNoteToDelete(null);
    if (!target) return;
    setUserNotes(prev => prev.filter(n => n.id !== target.id));
    toast.success('Notatka usunięta.');
  };

  const handleStudioGenerate = async (tool, topic) => {
    if (!apiKeys.gemini) { setIsSettingsOpen(true); return; }
    const activeSrcs = selectedSources.length > 0 ? selectedSources : sources;
    if (activeSrcs.length === 0) return;

    let prompt = tool.prompt;
    const label = topic ? `${tool.label}: ${topic}` : tool.label;
    if (topic) prompt += `\n\nSKUP SIĘ NA TEMACIE: "${topic}". Generuj treść głównie związaną z tym zagadnieniem.`;

    const outputId = Date.now().toString();
    setStudioOutputs(prev => [...prev, { id: outputId, toolId: tool.id, title: label, content: null, createdAt: new Date().toISOString(), isLoading: true }]);
    setIsStudioGenerating(true);
    setSelectedCanvasNode(null); // dokument generowany właśnie teraz ma priorytet nad szczegółami węzła w prawym doku
    setIsObjectsOpen(true);

    try {
      const msgs = [{ role: 'user', content: label, hiddenPrompt: prompt }];
      const result = await sendChatMessage(apiKeys.gemini, apiKeys.model, msgs, activeSrcs, false, tool.id, null);
      const content = typeof result === 'string' ? result : (result.answer || '');
      setStudioOutputs(prev => prev.map(o => o.id === outputId ? { ...o, content, isLoading: false } : o));
    } catch (err) {
      setStudioOutputs(prev => prev.map(o => o.id === outputId ? { ...o, content: `Błąd: ${err.message}`, isLoading: false } : o));
    } finally {
      setIsStudioGenerating(false);
    }
  };

  const handleDeleteStudioOutput = (id) => {
    setStudioOutputs(prev => prev.filter(o => o.id !== id));
  };

  const handleSendMessage = async (text, hiddenPrompt, attachments, toolMeta) => {
    if (!apiKeys.gemini) { setIsSettingsOpen(true); return; }

    let newChat;
    const isReplace = toolMeta?.replaceLastModelResponse;

    if (isReplace) {
      newChat = [...chatMessages];
      if (newChat.length > 0 && newChat[newChat.length - 1].role === 'model') {
        newChat.pop();
      }
      const lastUserIdx = newChat.map(m => m.role).lastIndexOf('user');
      if (lastUserIdx >= 0) {
        newChat[lastUserIdx] = {
          ...newChat[lastUserIdx],
          toolMeta: { ...newChat[lastUserIdx].toolMeta, enableSearch: true }
        };
      }
    } else {
      const userMsg = {
        role: 'user',
        content: text,
        hiddenPrompt: hiddenPrompt,
        attachments: Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined,
        toolMeta: toolMeta || undefined,
        id: Date.now().toString(),
      };
      newChat = [...chatMessages, userMsg];
    }

    setChatMessages(newChat);
    setIsAiLoading(true);

    const activeSrcs = selectedSources.length > 0 ? selectedSources : sources;
    const hasAttachments = newChat.length > 0 && Array.isArray(newChat[newChat.length - 1].attachments) && newChat[newChat.length - 1].attachments.length > 0;

    if (activeSrcs.length === 0 && !hasAttachments) {
      setChatMessages([...newChat, { role: 'model', content: 'Dodaj materiały źródłowe albo załącz plik/obraz do wiadomości.', id: Date.now().toString() }]);
      setIsAiLoading(false);
      return;
    }

    try {
      const lastUserMsg = newChat.slice().reverse().find(m => m.role === 'user');
      const enableSearch = lastUserMsg?.toolMeta?.enableSearch || false;
      const toolType = (() => {
        if (!lastUserMsg?.hiddenPrompt) return 'chat';
        const c = (lastUserMsg.content || '').toLowerCase();
        if (c.includes('quiz') || c.includes('fiszki')) return 'quiz';
        if (c.includes('audio') || c.includes('podcast')) return 'audio';
        if (c.includes('slide') || c.includes('deck') || c.includes('prezentacja')) return 'slides';
        if (c.includes('streszczenie') || c.includes('raport') || c.includes('summary')) return 'summary';
        if (c.includes('praca domowa') || c.includes('plan nauki')) return 'homework';
        return 'tool';
      })();
      // RAG: jeśli Supabase skonfigurowany i to zwykły czat (nie tool call), użyj retrieval
      let ragContext = null;
      const userQuery = (lastUserMsg?.content || '').trim();
      if (isRagEnabled(apiKeys) && !enableSearch && toolType === 'chat' && userQuery && activeSrcs.length > 0) {
        try {
          const sourceIds = activeSrcs.map(s => s.id || s.videoId);
          const chunks = await retrieveChunks(
            apiKeys.supabaseUrl, apiKeys.supabaseKey, apiKeys.gemini,
            activeProjectId, sourceIds, userQuery, 6
          );
          if (chunks.length > 0) ragContext = buildRagContext(chunks, activeSrcs);
        } catch (ragErr) {
          console.warn('RAG retrieval failed, falling back to full context:', ragErr.message);
        }
      }

      const result = await sendChatMessage(apiKeys.gemini, apiKeys.model, newChat, activeSrcs, enableSearch, toolType, ragContext, chatConfig);
      const answer = typeof result === 'string' ? result : result.answer;
      const citations = Array.isArray(result?.citations) ? result.citations : [];
      setChatMessages([...newChat, { role: 'model', content: answer, citations: citations, id: Date.now().toString() }]);
    } catch (err) {
      setChatMessages([...newChat, { role: 'model', content: `Błąd: ${err.message}`, id: Date.now().toString() }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const viewerSource = sources.find(s => s.id === viewerSourceId);

  return (
    <div className="flex h-screen text-foreground overflow-hidden font-sans bg-background relative">
      <NbGlassFilters />
      <TechGrid />
      {/* Background ambient mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />

      {/* BEZ paska nawigacji — ta appka osadza się na platformie NextByte, która ma
          własny górny navbar; drugi pasek nad nim czytałby się jak podwójna nawigacja.
          Sterowanie rozeszło się do paneli: powrót do listy + nazwa notatnika w nagłówku
          panelu źródeł, zakładki i narzędzia w slim-rzędzie wewnątrz kolumny środkowej. */}

      {viewMode === 'dashboard' ? (
        <Dashboard
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onClearAll={() => setCzyscWszystkie(true)}
          onRenameProject={handleRenameProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="flex flex-col w-full h-full relative z-10 overflow-hidden">

        {/* GÓRNY PASEK — ATRAPA navbara platformy, NIE część tej aplikacji.
            Stoi tu wyłącznie po to, żeby było widać, jak notatnik siada pod paskiem
            NextByte po osadzeniu. Pozycje są przepisane 1:1 z preview kitu i są
            CELOWO niefunkcjonalne (disabled, aria-hidden, zero handlerów).
            ŻADNA funkcja notatnika (widoki, dokumenty, ustawienia, powrót) nie może
            tu trafić — te żyją w panelu bocznym. Przy realnej integracji ten blok
            znika w całości, bo pasek dostarczy platforma. */}
        {pokazAtrapePaska && !isMobile && (
          <div className="flex-shrink-0 px-3 pt-3 pb-1" aria-hidden="true">
            <GlassNav position="free" className="gap-1 py-1.5 opacity-60 pointer-events-none select-none">
              <GlassNavBrand className="shrink-0">
                <span className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Zap size={12} className="text-primary" />
                </span>
                NextByte
              </GlassNavBrand>

              {PLATFORM_NAV_MOCK.map((item, i) => (
                <GlassNavItem key={item.key} active={i === 0} disabled className="shrink-0">
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                </GlassNavItem>
              ))}

              <GlassNavSpacer />

              <GlassNavItem disabled className="shrink-0 px-2">
                <Settings size={14} />
                <span className="hidden 2xl:inline">Ustawienia</span>
              </GlassNavItem>
            </GlassNav>
          </div>
        )}

        {/* TRZY KOLUMNY ROZDZIELONE ŚWIATŁEM, NIE KRESKĄ.
            Wcześniej ekran był pokrojony dwiema twardymi liniami na trzy płyty
            tej samej czerni — stąd wrażenie suchości: nic nie prowadzi oka.
            Teraz środek jest o stopień jaśniejszy i uniesiony (scena), a boki
            cofają się w tło. Podział czyta się jako głębia, nie jako ramka. */}
        <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 z-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,hsl(var(--primary)/0.07),transparent_70%)]"
          />

          {/* LEFT — Sources: pełny panel gdy otwarty, wąski pasek z miniaturkami gdy
              zwinięty (zamiast całkowitego znikania — wariant "kompaktowy" wybrany
              przez użytkownika przy porównaniu wariantów paska bocznego). */}
          {!isMobile && isLeftOpen && (
            <div style={{ width: leftWidth }} className="theme-sidebar relative z-10 flex-shrink-0 flex flex-col overflow-hidden bg-transparent">
              <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onChangeProject={setActiveProjectId}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                sources={sources}
                pendingSources={pendingSources}
                selectedSourceIds={selectedSourceIds}
                activeSourceId={activeSourceId}
                onSelectSource={(id) => setSelectedSourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onToggleAllSources={() => setSelectedSourceIds(selectedSourceIds.length === sources.length && sources.length > 0 ? [] : sources.map(s => s.id))}
                onRemoveSelectedSources={handleRemoveSelectedSources}
                onRemovePlaylist={handleRemovePlaylist}
                onTogglePlaylistSelection={handleTogglePlaylistSelection}
                onActiveSourceChange={handleOpenSourceViewer}
                onRemoveSource={handleRemoveSource}
                isLoading={isLoading}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onToggleLeftOpen={() => setIsLeftOpen(v => !v)}
                model={apiKeys.model}
                projectName={projects.find(p => p.id === activeProjectId)?.name}
                onBackToDashboard={() => setViewMode('dashboard')}
                notesSlot={
                  <NotesDropdown
                    notes={userNotes}
                    onSaveNote={(note) => setUserNotes(prev => [note, ...prev])}
                    onUpdateNote={(id, newText) => setUserNotes(prev => prev.map(n => n.id === id ? { ...n, text: newText, updatedAt: new Date().toISOString() } : n))}
                    onTogglePinNote={(id) => setUserNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n))}
                    onDeleteNote={handleRemoveNote}
                    apiKeys={apiKeys}
                  />
                }
              />
            </div>
          )}
          {!isMobile && !isLeftOpen && (
            <SidebarRail
              sources={sources}
              activeSourceId={activeSourceId}
              onActiveSourceChange={handleOpenSourceViewer}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onExpand={() => setIsLeftOpen(true)}
              onBackToDashboard={() => setViewMode('dashboard')}
            />
          )}

          {!isMobile && isLeftOpen && <ResizeHandle onPointerDown={onLeftDrag} />}

          {/* CENTER — wyłącznie Czat AI. Notatki zjechały do rozwijanej sekcji nad
              listą źródeł, transkrypcja do modala po kliknięciu w źródło, a Mapa
              Myśli została usunięta — nie ma już czego przełączać. */}
          <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden bg-card/55 shadow-[0_0_70px_-24px_rgb(0_0_0/0.95)] transition-all duration-300">
            <div className="flex-1 overflow-hidden">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClearChat={() => setChatMessages([])}
                sources={sources}
                hasSources={sources.length > 0}
                presetData={presetData}
                isGeneratingPresets={isGeneratingPresets}
                isAiLoading={isAiLoading}
                apiKeys={apiKeys}
                onSeekToVideo={handleSeekToVideo}
                prefillInput={chatPrefill}
                onToggleObjectsOpen={() => setIsObjectsOpen(v => !v)}
                isObjectsOpen={isObjectsOpen}
                onOpenAddSource={() => setIsAddModalOpen(true)}
                onStudioGenerate={handleStudioGenerate}
                onModelSelectChange={(newModelId) => setApiKeys(prev => ({ ...prev, model: newModelId }))}
              />
            </div>
          </div>

          {/* RIGHT — Documents & Files / Canvas node details drawer (Flex Re-flow + Resizable) */}
          {!isMobile && isObjectsOpen && (
            <ResizeHandle onPointerDown={onRightDrag} />
          )}
          {!isMobile && (
            <div
              style={{ width: isObjectsOpen ? rightWidth : 0 }}
              className={`relative z-10 h-full flex-shrink-0 bg-transparent theme-panel-right transition-[width,opacity] duration-300 ease-in-out overflow-hidden
                ${isObjectsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div style={{ width: rightWidth }} className="h-full">
                <StudioPanel
                  outputs={studioOutputs}
                  onGenerate={handleStudioGenerate}
                  onDelete={handleDeleteStudioOutput}
                  hasSources={sources.length > 0}
                  isGenerating={isStudioGenerating}
                  apiKeys={apiKeys}
                  onClose={() => setIsObjectsOpen(false)}
                />
              </div>
            </div>
          )}

          {/* MOBILE — na telefonie nie ma stałych kolumn bocznych, więc źródła
              (z notatkami i ustawieniami) wjeżdżają szufladą z lewej, a dokumenty
              z prawej. Bez tego po wycięciu zakładek nie byłoby do nich dojścia. */}
          {isMobile && (
            <>
              <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
                <GlassButton
                  variant="primary"
                  size="icon"
                  className="h-11 w-11 rounded-full shadow-lg"
                  onClick={() => setIsMobileSourcesOpen(true)}
                  aria-label="Źródła i notatki"
                >
                  <Library size={18} />
                </GlassButton>
                <GlassButton
                  variant="solid"
                  size="icon"
                  className="h-11 w-11 rounded-full shadow-lg"
                  onClick={() => setIsObjectsOpen(true)}
                  aria-label="Pliki i dokumenty"
                >
                  <FileText size={18} />
                </GlassButton>
              </div>

              <GlassDrawer
                open={isMobileSourcesOpen}
                onClose={() => setIsMobileSourcesOpen(false)}
                side="left"
                className="max-w-[88vw] p-0 [&>div:last-child]:p-0 [&>div:last-child]:overflow-hidden"
              >
                <Sidebar
                  sources={sources}
                  pendingSources={pendingSources}
                  selectedSourceIds={selectedSourceIds}
                  activeSourceId={activeSourceId}
                  onSelectSource={(id) => setSelectedSourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                  onToggleAllSources={() => setSelectedSourceIds(selectedSourceIds.length === sources.length && sources.length > 0 ? [] : sources.map(s => s.id))}
                  onRemoveSelectedSources={handleRemoveSelectedSources}
                  onRemovePlaylist={handleRemovePlaylist}
                  onTogglePlaylistSelection={handleTogglePlaylistSelection}
                  onActiveSourceChange={(id) => { handleOpenSourceViewer(id); setIsMobileSourcesOpen(false); }}
                  onRemoveSource={handleRemoveSource}
                  isLoading={isLoading}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  projectName={projects.find(p => p.id === activeProjectId)?.name}
                  onBackToDashboard={() => setViewMode('dashboard')}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  notesSlot={
                    <NotesDropdown
                      notes={userNotes}
                      onSaveNote={(note) => setUserNotes(prev => [note, ...prev])}
                      onUpdateNote={(id, newText) => setUserNotes(prev => prev.map(n => n.id === id ? { ...n, text: newText, updatedAt: new Date().toISOString() } : n))}
                      onTogglePinNote={(id) => setUserNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n))}
                      onDeleteNote={handleRemoveNote}
                      apiKeys={apiKeys}
                    />
                  }
                />
              </GlassDrawer>

              <GlassDrawer
                open={isObjectsOpen}
                onClose={() => setIsObjectsOpen(false)}
                side="right"
                className="max-w-[88vw] p-0 [&>div:last-child]:p-0 [&>div:last-child]:overflow-hidden"
              >
                <StudioPanel
                  outputs={studioOutputs}
                  onGenerate={handleStudioGenerate}
                  onDelete={handleDeleteStudioOutput}
                  hasSources={sources.length > 0}
                  isGenerating={isStudioGenerating}
                  apiKeys={apiKeys}
                  onClose={() => setIsObjectsOpen(false)}
                />
              </GlassDrawer>
            </>
          )}

        </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSave={setApiKeys}
        chatConfig={chatConfig}
        onSaveConfig={setChatConfig}
        onExportDocx={handleExportDocx}
        isExporting={isExporting}
      />
      <AddSourceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddSource={handleAddSource} />
      {previewTarget && (
        <SourcePreviewModal
          source={previewTarget.source}
          locator={previewTarget.locator}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {/* Duży podgląd źródła — zastąpił zakładkę "Transkrypcja". */}
      {viewerSource && (
        <SourceViewerModal
          source={viewerSource}
          sources={sources}
          onClose={() => setViewerSourceId(null)}
          onSourceSelect={(id) => { setActiveSourceId(id); setViewerSourceId(id); }}
          onSeekToVideo={handleSeekToVideo}
        />
      )}

      {playerTarget && (
        <VideoPlayerModal
          videoId={playerTarget.videoId}
          start={playerTarget.start}
          title={playerTarget.title}
          onClose={() => setPlayerTarget(null)}
        />
      )}

      <ConfirmDialog
        open={czyscWszystkie}
        title={`Usunąć wszystkie notatniki (${projects.length})?`}
        message="Wszystkie źródła, czaty, notatki i mapy ze wszystkich notatników zostaną trwale usunięte. Tego nie da się cofnąć."
        confirmLabel="Usuń wszystkie"
        onConfirm={confirmCzyscWszystkie}
        onCancel={() => setCzyscWszystkie(false)}
      />

      <ConfirmDialog
        open={!!projectToDelete}
        title={`Usunąć notatnik „${projectToDelete?.name || ''}"?`}
        message="Wszystkie źródła, czaty, notatki i mapy tego notatnika zostaną trwale usunięte."
        confirmLabel="Usuń notatnik"
        onConfirm={confirmDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />

      <ConfirmDialog
        open={sourcesToDelete && sourcesToDelete.length > 0}
        title={sourcesToDelete?.length === 1 ? `Usunąć źródło „${sourcesToDelete[0].title || ''}"?` : `Usunąć ${sourcesToDelete?.length} zaznaczonych źródeł?`}
        message={sourcesToDelete?.length === 1 ? "Treść i transkrypcja tego źródła zostaną trwale usunięte z tego notatnika." : "Treść i transkrypcje wszystkich zaznaczonych źródeł zostaną trwale usunięte z tego notatnika."}
        confirmLabel={sourcesToDelete?.length === 1 ? "Usuń źródło" : "Usuń wybrane"}
        onConfirm={confirmRemoveSource}
        onCancel={() => setSourcesToDelete(null)}
      />

      <ConfirmDialog
        open={!!noteToDelete}
        title="Usunąć notatkę?"
        message={noteToDelete?.preview ? `„${noteToDelete.preview}${noteToDelete.preview.length >= 60 ? '…' : ''}"` : 'Notatka zostanie trwale usunięta.'}
        confirmLabel="Usuń notatkę"
        onConfirm={confirmRemoveNote}
        onCancel={() => setNoteToDelete(null)}
      />

      <PromptDialog
        open={!!projectToRename}
        title="Zmień nazwę notatnika"
        message="Wpisz nową nazwę, którą chcesz nadać temu notatnikowi."
        initialValue={projectToRename?.name || ''}
        placeholder="Nazwa notatnika"
        confirmLabel="Zapisz nazwę"
        onConfirm={confirmRenameProject}
        onCancel={() => setProjectToRename(null)}
      />

      {selectionPopup && (
        <div
          style={{
            position: 'fixed',
            top: selectionPopup.y,
            left: selectionPopup.x,
            transform: 'translateX(-50%)',
            zIndex: 9999
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-background/90 backdrop-blur shadow-glow-primary-weak animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        >
          <button
            onMouseDown={handleAddSelectionToNotes}
            className="flex items-center gap-1 text-[10px] font-bold text-foreground uppercase tracking-wider hover:text-primary transition-colors"
          >
            <Plus size={10} className="text-primary" />
            <span>Dodaj do notatki</span>
          </button>
        </div>
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        sources={sources}
        notes={userNotes}
        onOpenAddSource={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectSource={(source) => {
          setViewMode('workspace');
          handleOpenSourceViewer(source.id);
        }}
      />

      <ConfigureChatModal
        isOpen={isConfigureChatOpen}
        onClose={() => setIsConfigureChatOpen(false)}
        chatConfig={chatConfig}
        onSaveConfig={setChatConfig}
      />
    </div>
  );
}

export { NotebookPage }
export default NotebookPage

