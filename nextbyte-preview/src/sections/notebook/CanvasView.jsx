import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles, Plus, Trash2, Edit3, ChevronRight, ChevronDown, Check, X,
  RotateCcw, BookOpen, Layers, HelpCircle, Download, PlayCircle, StickyNote,
  MessageSquare, Brain, Lightbulb, CheckCircle2, XCircle, ArrowRight, CornerDownRight,
  Maximize2, Minimize2, RefreshCw, Loader2, ListFilter, FileText
} from 'lucide-react';
import { getCanvas, saveCanvas } from './utils/api';
import {
  generateMindMapFromSources,
  generateFlashcardsFromSources,
  generateQuizFromSources
} from './utils/mindMapGenerator';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './Toast';
import { GlassCard, GlassButton, GlassPanel, GlassBadge, GlassTooltip, GlassEmpty, GlassInput } from '@/components/glass'
import { NbTabs } from '@/components/ui/NbTabs'
import { Tile } from '@/components/Tile';
import { cn } from '@/lib/utils';

const DEFAULT_MIND_MAP = [
  {
    id: 'root_1',
    title: 'Wiedza ze Źródeł Notatnika',
    description: 'Naciśnij „✨ Generuj Mapę AI”, aby dokonać automatycznej analizy treści ze swoich materiałów.',
    parentId: null,
    type: 'root',
    collapsed: false
  }
];

const DEFAULT_FLASHCARDS = [];
const DEFAULT_QUIZ = [];

export default function CanvasView({
  sources = [],
  selectedSourceIds = [],
  apiKeys = {},
  projectId,
  onSeekToVideo,
  onOpenPreview,
  onAddToNote,
  onAskInChat
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('mindmap'); // 'mindmap' | 'flashcards' | 'quiz'

  // Canvas Data
  const [mindMap, setMindMap] = useState(DEFAULT_MIND_MAP);
  const [flashcards, setFlashcards] = useState(DEFAULT_FLASHCARDS);
  const [quiz, setQuiz] = useState(DEFAULT_QUIZ);

  // Active sources for processing
  const activeSources = useMemo(() => {
    if (Array.isArray(selectedSourceIds) && selectedSourceIds.length > 0) {
      const filtered = sources.filter(s => selectedSourceIds.includes(s.id));
      return filtered.length > 0 ? filtered : sources;
    }
    return sources;
  }, [sources, selectedSourceIds]);

  // Selection & Editing
  const [selectedNodeId, setSelectedNodeId] = useState('root_1');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // AI Loaders
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({}); // questionId -> selectedIndex
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Load saved canvas state on project change
  useEffect(() => {
    if (!projectId) return;
    getCanvas(projectId)
      .then(data => {
        if (data && typeof data === 'object') {
          if (Array.isArray(data.mindMap) && data.mindMap.length > 0) setMindMap(data.mindMap);
          if (Array.isArray(data.flashcards) && data.flashcards.length > 0) setFlashcards(data.flashcards);
          if (Array.isArray(data.quiz) && data.quiz.length > 0) setQuiz(data.quiz);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // Auto-save changes
  const saveCurrentCanvas = useCallback((newMap, newCards, newQuiz) => {
    if (!projectId) return;
    const payload = {
      version: 2,
      mindMap: newMap || mindMap,
      flashcards: newCards || flashcards,
      quiz: newQuiz || quiz,
      updatedAt: new Date().toISOString()
    };
    saveCanvas(projectId, payload).catch(console.error);
  }, [projectId, mindMap, flashcards, quiz]);

  // Update mindmap helper
  const updateMindMap = (updater) => {
    setMindMap(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCurrentCanvas(next, null, null);
      return next;
    });
  };

  // Update flashcards helper
  const updateFlashcards = (updater) => {
    setFlashcards(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCurrentCanvas(null, next, null);
      return next;
    });
  };

  // Update quiz helper
  const updateQuiz = (updater) => {
    setQuiz(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCurrentCanvas(null, null, next);
      return next;
    });
  };

  // Mind Map Node Operations
  const handleToggleCollapse = (nodeId, e) => {
    if (e) e.stopPropagation();
    updateMindMap(nodes => nodes.map(n => n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n));
  };

  const handleAddChildNode = (parentId) => {
    const pNode = mindMap.find(n => n.id === parentId) || mindMap[0];
    const newId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNode = {
      id: newId,
      title: 'Nowe pojęcie',
      description: 'Wpisz opis pojęcia z materiałów...',
      parentId: pNode ? pNode.id : null,
      type: 'concept',
      collapsed: false
    };
    updateMindMap(nodes => [...nodes, newNode]);
    setSelectedNodeId(newId);
    setEditingNodeId(newId);
    setEditTitle('Nowe pojęcie');
    setEditDesc('');
  };

  const handleAddSiblingNode = (targetId) => {
    const target = mindMap.find(n => n.id === targetId);
    const parentId = target ? target.parentId : null;
    const newId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNode = {
      id: newId,
      title: 'Nowe pojęcie',
      description: '',
      parentId,
      type: 'concept',
      collapsed: false
    };
    updateMindMap(nodes => [...nodes, newNode]);
    setSelectedNodeId(newId);
    setEditingNodeId(newId);
    setEditTitle('Nowe pojęcie');
    setEditDesc('');
  };

  const handleDeleteNode = (nodeId) => {
    if (mindMap.length <= 1) return;
    const toDelete = new Set([nodeId]);
    let changed = true;
    while (changed) {
      changed = false;
      mindMap.forEach(n => {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          changed = true;
        }
      });
    }
    updateMindMap(nodes => nodes.filter(n => !toDelete.has(n.id)));
    if (toDelete.has(selectedNodeId)) {
      setSelectedNodeId(mindMap.find(n => !toDelete.has(n.id))?.id || null);
    }
    toast.success('Usunięto pojęcie z mapy.');
  };

  const handleSaveNodeEdit = () => {
    if (!editingNodeId) return;
    updateMindMap(nodes => nodes.map(n => n.id === editingNodeId ? {
      ...n,
      title: editTitle.trim() || 'Bez tytułu',
      description: editDesc.trim()
    } : n));
    setEditingNodeId(null);
  };

  // Keyboard Navigation in Mind Map
  useEffect(() => {
    if (activeTab !== 'mindmap' || editingNodeId) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) handleAddChildNode(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedNodeId) handleAddSiblingNode(selectedNodeId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && selectedNodeId !== 'root_1') {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedNodeId, editingNodeId, mindMap]);

  // AI Generation Handlers analyzing real source text
  const handleGenerateAiMap = async () => {
    if (!apiKeys.gemini) {
      toast.error('Wprowadź klucz Gemini API w Ustawieniach.');
      return;
    }
    if (!activeSources || activeSources.length === 0) {
      toast.error('Dodaj lub zaznacz najpierw źródła do notatnika.');
      return;
    }
    setIsGeneratingMap(true);
    toast.info(`Analizowanie treści ${activeSources.length} źródeł...`);
    try {
      const data = await generateMindMapFromSources(apiKeys.gemini, apiKeys.model, activeSources);
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        updateMindMap(data.nodes);
        setSelectedNodeId(data.nodes[0].id);
        toast.success(`Wygenerowano realistyczną mapę myśli ze źródeł (${data.nodes.length} pojęć)!`);
      }
    } catch (err) {
      toast.error(err.message || 'Nie udało się wygenerować mapy myśli z treści.');
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const handleGenerateAiFlashcards = async (topic = null) => {
    if (!apiKeys.gemini) {
      toast.error('Wprowadź klucz Gemini API w Ustawieniach.');
      return;
    }
    if (!activeSources || activeSources.length === 0) {
      toast.error('Dodaj lub zaznacz źródła do notatnika.');
      return;
    }
    setIsGeneratingFlashcards(true);
    toast.info(`Tworzenie fiszek z treści ${activeSources.length} źródeł...`);
    try {
      const cards = await generateFlashcardsFromSources(apiKeys.gemini, apiKeys.model, activeSources, topic);
      if (cards && cards.length > 0) {
        updateFlashcards(prev => [...cards, ...prev]);
        setActiveTab('flashcards');
        setCardIndex(0);
        setIsFlipped(false);
        toast.success(`Wygenerowano ${cards.length} fiszek z materiałów!`);
      }
    } catch (err) {
      toast.error(err.message || 'Nie udało się wygenerować fiszek z treści.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateAiQuiz = async (topic = null) => {
    if (!apiKeys.gemini) {
      toast.error('Wprowadź klucz Gemini API w Ustawieniach.');
      return;
    }
    if (!activeSources || activeSources.length === 0) {
      toast.error('Dodaj lub zaznacz źródła do notatnika.');
      return;
    }
    setIsGeneratingQuiz(true);
    toast.info(`Generowanie testu z treści ${activeSources.length} źródeł...`);
    try {
      const questions = await generateQuizFromSources(apiKeys.gemini, apiKeys.model, activeSources, topic);
      if (questions && questions.length > 0) {
        updateQuiz(questions);
        setActiveTab('quiz');
        setQuizAnswers({});
        setQuizSubmitted(false);
        toast.success(`Wygenerowano test z ${questions.length} pytań z materiałów!`);
      }
    } catch (err) {
      toast.error(err.message || 'Nie udało się wygenerować quizu z treści.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Helper to seek video timestamp
  const handleSeek = (sourceId, timeStr, startSeconds) => {
    if (!onSeekToVideo) return;
    let targetSec = startSeconds;
    if (targetSec === null || targetSec === undefined) {
      if (timeStr) {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) targetSec = parts[0] * 60 + parts[1];
      }
    }
    const matchingSource = sources.find(s => s.id === sourceId || s.videoId === sourceId) || activeSources[0];
    if (matchingSource && matchingSource.videoId) {
      onSeekToVideo(matchingSource.videoId, targetSec || 0);
    }
  };

  // Build recursive tree representation for Mind Map
  const treeNodes = useMemo(() => {
    const map = new Map();
    const roots = [];
    mindMap.forEach(n => map.set(n.id, { ...n, children: [] }));
    mindMap.forEach(n => {
      if (n.parentId && map.has(n.parentId)) {
        map.get(n.parentId).children.push(map.get(n.id));
      } else {
        roots.push(map.get(n.id));
      }
    });
    return roots;
  }, [mindMap]);

  const selectedNode = useMemo(() => mindMap.find(n => n.id === selectedNodeId) || mindMap[0], [mindMap, selectedNodeId]);

  // Flashcards helpers
  const currentCard = flashcards[cardIndex] || flashcards[0];
  const masteredCount = flashcards.filter(c => c.mastered).length;

  const handleToggleCardMastered = (id) => {
    updateFlashcards(cards => cards.map(c => c.id === id ? { ...c, mastered: !c.mastered } : c));
  };

  // Quiz score
  const quizScore = useMemo(() => {
    let correct = 0;
    quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  }, [quiz, quizAnswers]);

  // Export Mindmap to Markdown
  const handleExportMarkdown = () => {
    let md = `# ${mindMap[0]?.title || 'Mapa Myśli'}\n\n`;
    mindMap.forEach(n => {
      const indent = n.parentId ? '  ' : '';
      md += `${indent}- **${n.title}**${n.description ? `: ${n.description}` : ''}\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mapa_Mysli_${projectId || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Pobrano mapę myśli w formacie Markdown.');
  };

  return (
    <div className="h-full flex flex-col bg-background/50 text-foreground overflow-hidden">
      {/* TOP BAR / NAVIGATION TOOLBAR */}
      <div className="px-4 py-3 border-b border-foreground/[0.08] bg-background/80 backdrop-blur flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-20">
        {/* Mode Switcher Tabs */}
        <NbTabs
          key={activeTab}
          tabs={[
            { key: 'mindmap', label: `Mapa Myśli (${mindMap.length})`, icon: <Brain /> },
            { key: 'flashcards', label: `Fiszki (${flashcards.length})`, icon: <Layers /> },
            { key: 'quiz', label: `Test Wiedzy (${quiz.length})`, icon: <HelpCircle /> },
          ]}
          defaultTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Source info pill & AI Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSources.length > 0 && (
            <GlassBadge intent="neutral" className="hidden sm:inline-flex gap-1">
              <FileText className="h-3 w-3" />
              Źródła ({activeSources.length})
            </GlassBadge>
          )}

          {activeTab === 'mindmap' && (
            <>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleGenerateAiMap}
                disabled={isGeneratingMap}
                className="!bg-primary/15 hover:!bg-primary/25 !border-primary/35 !text-primary"
              >
                {isGeneratingMap ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Generuj Mapę ze Źródeł</span>
              </GlassButton>
              <GlassTooltip content="Pobierz Mapę Myśli (.md)">
                <GlassButton
                  variant="solid"
                  size="icon"
                  onClick={handleExportMarkdown}
                >
                  <Download size={14} />
                </GlassButton>
              </GlassTooltip>
            </>
          )}

          {activeTab === 'flashcards' && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => handleGenerateAiFlashcards()}
              disabled={isGeneratingFlashcards}
              className="!bg-primary/15 hover:!bg-primary/25 !border-primary/35 !text-primary"
            >
              {isGeneratingFlashcards ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Generuj Fiszki ze Źródeł</span>
            </GlassButton>
          )}

          {activeTab === 'quiz' && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => handleGenerateAiQuiz()}
              disabled={isGeneratingQuiz}
              className="!bg-primary/15 hover:!bg-primary/25 !border-primary/35 !text-primary"
            >
              {isGeneratingQuiz ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Generuj Test ze Źródeł</span>
            </GlassButton>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex">
        {/* TAB 1: MIND MAP VIEW */}
        {activeTab === 'mindmap' && (
          <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden">
            {/* TREE / CANVAS AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col">
              {/* Keyboard & Source Notice Banner */}
              <GlassPanel className="mb-4 flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground/70">
                <div className="flex items-center gap-3">
                  <span>Skróty:</span>
                  <span className="bg-foreground/[0.06] px-1.5 py-0.5 rounded text-[10px] text-foreground font-mono">Tab</span>
                  <span>Podpojęcie</span>
                  <span className="bg-foreground/[0.06] px-1.5 py-0.5 rounded text-[10px] text-foreground font-mono">Enter</span>
                  <span>Równorzędny</span>
                  <span className="bg-foreground/[0.06] px-1.5 py-0.5 rounded text-[10px] text-foreground font-mono">Del</span>
                  <span>Usuń</span>
                </div>

                <div className="flex items-center gap-2">
                  {activeSources.length > 0 && (
                    <button
                      onClick={handleGenerateAiMap}
                      disabled={isGeneratingMap}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      {isGeneratingMap ? 'Przetwarzanie treści...' : `Przeanalizuj ${activeSources.length} źródeł przez AI`}
                    </button>
                  )}
                  <button
                    onClick={() => handleAddChildNode(selectedNodeId || 'root_1')}
                    className="flex items-center gap-1 text-primary hover:underline cursor-pointer ml-2"
                  >
                    <Plus size={12} />
                    <span>Dodaj pojęcie</span>
                  </button>
                </div>
              </GlassPanel>

              {/* Recursive Tree Container */}
              <div className="space-y-3 pb-20">
                {treeNodes.map(node => (
                  <MindMapTreeNode
                    key={node.id}
                    node={node}
                    selectedId={selectedNodeId}
                    onSelect={setSelectedNodeId}
                    onToggle={handleToggleCollapse}
                    onAddChild={handleAddChildNode}
                    onAddSibling={handleAddSiblingNode}
                    onDelete={handleDeleteNode}
                    onSeek={handleSeek}
                    editingId={editingNodeId}
                    setEditingId={setEditingNodeId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDesc={editDesc}
                    setEditDesc={setEditDesc}
                    onSaveEdit={handleSaveNodeEdit}
                  />
                ))}
              </div>
            </div>

            {/* NODE DETAILS DRAWER / SIDEBAR */}
            {selectedNode && (
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-foreground/[0.08] bg-background/70 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar flex-shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                      <Lightbulb size={13} />
                      Szczegóły pojęcia
                    </span>
                    <div className="flex items-center gap-1">
                      <GlassTooltip content="Edytuj pojęcie">
                        <GlassButton
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingNodeId(selectedNode.id);
                            setEditTitle(selectedNode.title);
                            setEditDesc(selectedNode.description || '');
                          }}
                        >
                          <Edit3 size={14} />
                        </GlassButton>
                      </GlassTooltip>
                      {selectedNode.id !== 'root_1' && (
                        <GlassTooltip content="Usuń pojęcie">
                          <GlassButton
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteNode(selectedNode.id)}
                          >
                            <Trash2 size={14} />
                          </GlassButton>
                        </GlassTooltip>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">{selectedNode.title}</h3>
                    {selectedNode.description && (
                      <GlassCard padding="p-2.5" radius="rounded-xl" className="mt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {selectedNode.description}
                        </p>
                      </GlassCard>
                    )}
                  </div>

                  {/* Source Citations & Timestamps */}
                  {(selectedNode.sourceTitle || selectedNode.timeStr) && (
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">Odnośnik do materiałów</span>
                      {selectedNode.sourceTitle && (
                        <div className="text-xs text-foreground/90 font-medium truncate">
                          📄 {selectedNode.sourceTitle}
                        </div>
                      )}
                      {selectedNode.timeStr && (
                        <GlassButton
                          variant="solid"
                          size="sm"
                          className="shadow-glow-primary-weak"
                          onClick={() => handleSeek(selectedNode.sourceId, selectedNode.timeStr, selectedNode.startSeconds)}
                        >
                          <PlayCircle size={14} />
                          <span>Odtwórz od wideo [{selectedNode.timeStr}]</span>
                        </GlassButton>
                      )}
                    </div>
                  )}

                  {/* Node Quick AI Actions */}
                  <div className="space-y-2 pt-2 border-t border-foreground/[0.06]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">Szybkie Akcje AI</span>
                    <button
                      onClick={() => handleGenerateAiFlashcards(selectedNode.title)}
                      disabled={isGeneratingFlashcards}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] text-xs text-left transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Layers size={14} />
                        <span>Stwórz fiszki z tego pojęcia</span>
                      </span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={() => handleGenerateAiQuiz(selectedNode.title)}
                      disabled={isGeneratingQuiz}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] text-xs text-left transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle size={14} />
                        <span>Zrób test z tego pojęcia</span>
                      </span>
                      <ArrowRight size={12} />
                    </button>

                    {onAddToNote && (
                      <button
                        onClick={() => onAddToNote(`### ${selectedNode.title}\n${selectedNode.description || ''}`)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] text-xs text-left transition-all cursor-pointer"
                      >
                        <StickyNote size={14} />
                        <span>Dodaj do Moich Notatek</span>
                      </button>
                    )}

                    {onAskInChat && (
                      <button
                        onClick={() => onAskInChat(`Wyjaśnij mi szczegółowo pojęcie "${selectedNode.title}" w kontekście moich źródeł.`)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] text-xs text-left transition-all cursor-pointer"
                      >
                        <MessageSquare size={14} />
                        <span>Zapytaj o to w Czacie AI</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-node Adders */}
                <div className="pt-4 mt-4 border-t border-foreground/[0.06] flex items-center gap-2">
                  <GlassButton
                    variant="solid"
                    className="flex-1 shadow-glow-primary"
                    onClick={() => handleAddChildNode(selectedNode.id)}
                  >
                    <Plus size={14} />
                    <span>Dodaj Podpojęcie</span>
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FLASHCARDS PLAYER */}
        {activeTab === 'flashcards' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0 overflow-y-auto">
            {flashcards.length === 0 ? (
              <GlassEmpty
                className="m-auto"
                icon={<Layers size={28} />}
                title="Brak Fiszek w Tym Notatniku"
                desc="Wygeneruj zestaw fiszek oparty bezpośrednio na treści Twoich dodanych materiałów."
                action={
                  <GlassButton variant="solid" className="shadow-glow-primary" onClick={() => handleGenerateAiFlashcards()} disabled={isGeneratingFlashcards}>
                    {isGeneratingFlashcards ? 'Analizowanie treści...' : 'Wygeneruj Fiszki ze Źródeł'}
                  </GlassButton>
                }
              />
            ) : (
              <div className="w-full max-w-md space-y-6 flex flex-col items-center">
                {/* Progress bar */}
                <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                  <span>Karta {cardIndex + 1} z {flashcards.length}</span>
                  <span className="text-emerald-400 font-semibold">{masteredCount} / {flashcards.length} Opanowane</span>
                </div>
                <div className="w-full h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${((cardIndex + 1) / flashcards.length) * 100}%` }}
                  />
                </div>

                {/* 3D Flip Card Component */}
                <div
                  onClick={() => setIsFlipped(v => !v)}
                  className="w-full h-72 cursor-pointer perspective-1000 relative group"
                >
                  <div
                    className={`w-full h-full rounded-3xl border border-foreground/[0.12] bg-gradient-to-b from-background/90 to-card/80 p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 transform-style-3d group-hover:border-primary/40 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front View */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                          {currentCard.category || 'Pytanie z materiałów'}
                        </span>
                        {currentCard.timeStr && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeek(currentCard.sourceId, currentCard.timeStr, currentCard.startSeconds);
                            }}
                            className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                          >
                            <PlayCircle size={11} />
                            <span>[{currentCard.timeStr}]</span>
                          </button>
                        )}
                      </div>
                      <h3 className="font-semibold text-base md:text-lg leading-relaxed text-foreground mt-4">
                        {currentCard.question}
                      </h3>
                    </div>

                    {/* Back View (When Flipped) */}
                    <div className="space-y-3 border-t border-foreground/[0.06] pt-4">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">Odpowiedź ze źródła</span>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {currentCard.answer}
                      </p>
                      {currentCard.sourceTitle && (
                        <div className="text-[10px] text-muted-foreground/60 block truncate">
                          📄 Źródło: {currentCard.sourceTitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full gap-3">
                  <GlassButton
                    variant="solid"
                    onClick={() => {
                      setCardIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      setIsFlipped(false);
                    }}
                  >
                    Poprzednia
                  </GlassButton>

                  <GlassButton
                    variant={currentCard.mastered ? 'success' : 'solid'}
                    onClick={() => handleToggleCardMastered(currentCard.id)}
                  >
                    <CheckCircle2 size={14} />
                    <span>{currentCard.mastered ? 'Opanowana!' : 'Zaznacz jako opanowaną'}</span>
                  </GlassButton>

                  <GlassButton
                    variant="solid"
                    className="shadow-glow-primary"
                    onClick={() => {
                      setCardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      setIsFlipped(false);
                    }}
                  >
                    Następna
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUIZ PLAYER */}
        {activeTab === 'quiz' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {quiz.length === 0 ? (
              <GlassEmpty
                className="m-auto"
                icon={<HelpCircle size={28} />}
                title="Brak Testu Wiedzy"
                desc="Wygeneruj interaktywny quiz sprawdzający faktyczną wiedzę z dodanych źródeł."
                action={
                  <GlassButton variant="solid" className="shadow-glow-primary" onClick={() => handleGenerateAiQuiz()} disabled={isGeneratingQuiz}>
                    {isGeneratingQuiz ? 'Analizowanie treści...' : 'Wygeneruj Test ze Źródeł'}
                  </GlassButton>
                }
              />
            ) : (
              <div className="max-w-2xl mx-auto w-full space-y-6 pb-20">
                {/* Quiz Header & Result Card */}
                {quizSubmitted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400">Wynik Testu: {quizScore} / {quiz.length} Poprawnych</h4>
                      <p className="text-xs text-muted-foreground">Przejrzyj poniższe opisy z uzasadnieniem ze źródeł.</p>
                    </div>
                    <GlassButton
                      variant="solid"
                      size="sm"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Rozwiąż ponownie</span>
                    </GlassButton>
                  </div>
                )}

                {/* Questions List */}
                {quiz.map((q, qIndex) => {
                  const selectedOpt = quizAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <GlassCard key={q.id} padding="p-5" radius="rounded-2xl" className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-sm text-foreground leading-relaxed">
                          <span className="text-primary font-bold mr-2">{qIndex + 1}.</span>
                          {q.question}
                        </h4>
                        {q.timeStr && (
                          <GlassBadge
                            onClick={() => handleSeek(q.sourceId, q.timeStr, q.startSeconds)}
                            size="sm"
                            className="cursor-pointer flex-shrink-0 rounded-full gap-1"
                          >
                            <PlayCircle className="h-3 w-3" />
                            <span>[{q.timeStr}]</span>
                          </GlassBadge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          let optStyle = 'border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.06] text-foreground';
                          if (selectedOpt === optIndex) {
                            if (quizSubmitted) {
                              optStyle = optIndex === q.correctIndex
                                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                                : 'border-rose-500/50 bg-rose-500/15 text-rose-300';
                            } else {
                              optStyle = 'border-primary/50 bg-primary/15 text-primary-foreground';
                            }
                          } else if (quizSubmitted && optIndex === q.correctIndex) {
                            optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => {
                                if (quizSubmitted) return;
                                setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }));
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIndex === q.correctIndex && (
                                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                              )}
                              {quizSubmitted && selectedOpt === optIndex && optIndex !== q.correctIndex && (
                                <XCircle size={16} className="text-rose-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after submit */}
                      {quizSubmitted && q.explanation && (
                        <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-xs text-muted-foreground space-y-1">
                          <span className="font-semibold text-primary block">Uzasadnienie ze źródeł:</span>
                          <p className="leading-relaxed">{q.explanation}</p>
                          {q.sourceTitle && (
                            <span className="text-[10px] text-muted-foreground/60 block pt-1">
                              📄 Źródło: {q.sourceTitle}
                            </span>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  );
                })}

                {!quizSubmitted && (
                  <GlassButton
                    variant="solid"
                    size="lg"
                    className="w-full shadow-glow-primary"
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length === 0}
                  >
                    Sprawdź Odpowiedzi i Zakończ Test
                  </GlassButton>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Tree Node Sub-component for Recursive Mind Map
function MindMapTreeNode({
  node,
  selectedId,
  onSelect,
  onToggle,
  onAddChild,
  onAddSibling,
  onDelete,
  onSeek,
  editingId,
  setEditingId,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  onSaveEdit
}) {
  const isSelected = selectedId === node.id;
  const isEditing = editingId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      {/* Node Card Row — Tile z paczki: jedna skala cienia/obwódki, sens niesie "intencja" nie kolor */}
      <Tile
        interaktywny
        zwarty
        intencja={isSelected || node.type === 'root' ? 'akcent' : 'neutralna'}
        elewacja={isSelected ? 'wyzej' : 'uniesiona'}
        onClick={() => onSelect(node.id)}
        className={cn(
          'group relative flex-row items-center justify-between gap-3',
          isSelected && 'shadow-glow-primary',
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={(e) => onToggle(node.id, e)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
            >
              {node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <div className="w-5 flex justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>
          )}

          {isEditing ? (
            <div className="flex-1 space-y-2" onClick={e => e.stopPropagation()}>
              <GlassInput
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="font-semibold"
                autoFocus
              />
              <GlassInput
                type="text"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Krótki opis (opcjonalnie)"
              />
              <div className="flex items-center gap-2">
                <GlassButton variant="solid" size="sm" className="h-6 px-2.5 text-[10px]" onClick={onSaveEdit}>
                  Zapisz
                </GlassButton>
                <GlassButton variant="ghost" size="sm" className="h-6 px-2.5 text-[10px]" onClick={() => setEditingId(null)}>
                  Anuluj
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-xs text-foreground truncate">{node.title}</h4>
                {node.timeStr && (
                  <GlassTooltip content={`Odtwórz wideo [${node.timeStr}]`}>
                    <GlassBadge
                      size="sm"
                      className="cursor-pointer flex-shrink-0 hover:bg-primary/30 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(node.sourceId, node.timeStr, node.startSeconds);
                      }}
                    >
                      <PlayCircle className="h-3 w-3" />
                      <span>{node.timeStr}</span>
                    </GlassBadge>
                  </GlassTooltip>
                )}
              </div>
              {node.description && (
                <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{node.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Row Buttons */}
        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
            <GlassTooltip content="Dodaj podpojęcie (Tab)">
              <GlassButton
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
              >
                <Plus size={13} />
              </GlassButton>
            </GlassTooltip>
            {node.id !== 'root_1' && (
              <GlassTooltip content="Usuń (Del)">
                <GlassButton
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                >
                  <Trash2 size={13} />
                </GlassButton>
              </GlassTooltip>
            )}
          </div>
        )}
      </Tile>

      {/* Children Indented Sub-tree */}
      {hasChildren && !node.collapsed && (
        <div className="pl-5 md:pl-7 border-l-2 border-primary/20 space-y-2 ml-2">
          {node.children.map(child => (
            <MindMapTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onAddSibling={onAddSibling}
              onDelete={onDelete}
              onSeek={onSeek}
              editingId={editingId}
              setEditingId={setEditingId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editDesc={editDesc}
              setEditDesc={setEditDesc}
              onSaveEdit={onSaveEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
