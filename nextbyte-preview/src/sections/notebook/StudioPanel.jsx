import React, { useState } from 'react';
import { Plus, FileText, Search, X, Trash2, Download, Loader2, ChevronDown, ChevronUp, ChevronRight, PanelRightClose, Wand2 } from 'lucide-react';
import { NaglowekPanelu, PrzyciskPanelu } from './NaglowekPanelu';
import { STUDIO_TOOLS } from './utils/aiTools';

/* Po co sięgasz po narzędzie, a nie jak się nazywa. Kolejność grup idzie
   od najczęstszego użycia do najrzadszego. */
const GRUPY_NARZEDZI = [
  { klucz: 'czytaj', etykieta: 'Streść',  ids: ['report', 'faq', 'glossary', 'table'] },
  { klucz: 'ucz',    etykieta: 'Naucz się', ids: ['flashcards', 'quiz'] },
  { klucz: 'pokaz',  etykieta: 'Pokaż',     ids: ['slides', 'infographic', 'chart', 'audio'] },
];
import TopicDialog from './TopicDialog';
import { ToolContentRenderer } from './ToolRenderers';
import MarkdownRenderer from './MarkdownRenderer';
import { GlassCard, GlassButton, GlassInput, GlassEmpty, GlassSpinner, GlassTooltip, GlassBadge } from '@/components/glass';
import { cn } from '@/lib/utils';

function StudioOutput({ output, onDelete, apiKeys }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const tool = STUDIO_TOOLS.find(t => t.id === output.toolId);
  const Icon = tool?.icon || FileText;

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!output.content) return;
    const blob = new Blob([output.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (output.title || 'dokument').replace(/[/\\?%*:|"<>]/g, '-');
    link.setAttribute('download', `${cleanTitle}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formattedTime = output.createdAt
    ? new Date(output.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <GlassCard padding="p-0" radius="rounded-2xl" className="hover:border-foreground/15">
      {/* Output Header */}
      <div
        onClick={() => setIsExpanded(v => !v)}
        className="px-3.5 py-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-foreground/[0.03] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${tool?.bg || 'bg-primary/15'}`}>
            <Icon size={14} className={tool?.color || 'text-primary'} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-foreground/90 truncate">{output.title}</h4>
            {formattedTime && (
              <span className="text-[10px] text-muted-foreground/60 block">{formattedTime}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {output.content && (
            <GlassTooltip content="Pobierz jako Markdown (.md)">
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors cursor-pointer"
              >
                <Download size={14} />
              </button>
            </GlassTooltip>
          )}
          {onDelete && (
            <GlassTooltip content="Usuń dokument">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(output.id);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </GlassTooltip>
          )}
          <div className="p-1 text-muted-foreground/60">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Output Content */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-foreground/[0.04]">
          {output.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs">
              <GlassSpinner size="sm" label="Generowanie dokumentu..." />
            </div>
          ) : output.content ? (
            <div className="text-xs leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
              <ToolContentRenderer
                toolId={output.toolId}
                content={output.content}
                fallback={<MarkdownRenderer content={output.content} />}
                extras={{ elevenlabsKey: apiKeys?.elevenlabs }}
              />
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Brak treści.
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function StudioPanel({ outputs = [], onGenerate, onDelete, hasSources, isGenerating, apiKeys, onClose }) {
  const [pendingTool, setPendingTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleToolClick = (tool) => {
    setPendingTool(tool);
  };

  const handleConfirm = (topic) => {
    onGenerate(pendingTool, topic);
    setPendingTool(null);
  };

  const filteredOutputs = outputs.filter(o =>
    o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      <NaglowekPanelu
        tytul="Studio"
        akcje={
          <>
            <PrzyciskPanelu ikona={Search} etykieta="Szukaj w dokumentach" onClick={() => setIsSearchOpen(v => !v)} />
            {onClose && <PrzyciskPanelu ikona={PanelRightClose} etykieta="Zwiń Studio" onClick={onClose} />}
          </>
        }
      />
      {isSearchOpen && (
        <div className="shrink-0 px-3 pt-3">
          <GlassInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filtruj dokumenty..." />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* NARZĘDZIA W TRZECH GRUPACH, NIE W PŁASKIEJ SIATCE.
            Dziesięć identycznych kafelków obok siebie niczego nie tłumaczyło —
            trzeba było przeczytać wszystkie, żeby wybrać jeden. Podział na
            „czytaj / ucz się / pokaż" mówi od razu, po co się tu sięga. */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {STUDIO_TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                disabled={!hasSources || isGenerating}
                title={hasSources ? tool.description : 'Dodaj źródło, żeby użyć: ' + tool.description}
                className="nb-ikona-kafel group relative flex h-[68px] cursor-pointer flex-col justify-between rounded-xl p-2.5 text-left transition-all duration-300 hover:!border-primary/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="nb-nav-ikona flex h-6 w-6 items-center justify-center rounded-md text-foreground/65 transition-colors group-hover:text-primary">
                  <Icon size={13} strokeWidth={1.75} />
                </span>
                <span className="truncate pr-4 text-[12.5px] font-medium text-foreground/90">{tool.label}</span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            );
          })}
        </div>
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        {/* Generated Documents List or Empty State */}
        {filteredOutputs.length > 0 ? (
          <div className="p-3 space-y-2">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/[0.38]">
                Dokumenty
              </span>
              <span aria-hidden className="h-px flex-1 bg-foreground/[0.07]" />
              <span className="shrink-0 text-[11px] font-semibold text-foreground/45">{filteredOutputs.length}</span>
            </div>
            {[...filteredOutputs].reverse().map(output => (
              <StudioOutput key={output.id} output={output} onDelete={onDelete} apiKeys={apiKeys} />
            ))}
          </div>
        ) : (
          /* Empty state matching Screenshot 3 */
          /* Zwarty wiersz zamiast pustego stanu na pół panelu: dokumenty
             pojawiają się tu same, więc to tylko przypis, nie wydarzenie. */
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="nb-nav-ikona-akt flex h-9 w-9 items-center justify-center rounded-xl text-primary">
              <Wand2 size={16} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-[13px] font-semibold text-foreground">Tu zapiszą się gotowe dokumenty</p>
            <p className="mt-1 max-w-[240px] text-[12px] leading-relaxed text-foreground/50">
              {hasSources ? 'Wybierz narzędzie powyżej — raport, fiszki, podcast i więcej.' : 'Najpierw dodaj źródło, potem wybierz narzędzie powyżej.'}
            </p>
          </div>
        )}
      </div>

      {pendingTool && (
        <TopicDialog tool={pendingTool} onConfirm={handleConfirm} onCancel={() => setPendingTool(null)} />
      )}
    </div>
  );
}

export default StudioPanel;


