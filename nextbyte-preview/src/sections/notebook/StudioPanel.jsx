import React, { useState } from 'react';
import { FileText, Search, X, Trash2, Download, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { STUDIO_TOOLS } from './utils/aiTools';

/* Po co sięgasz po narzędzie, a nie jak się nazywa. Kolejność grup idzie
   od najczęstszego użycia do najrzadszego. */
const GRUPY_NARZEDZI = [
  { klucz: 'czytaj', etykieta: 'Streszcz',  ids: ['report', 'faq', 'glossary', 'table'] },
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
          <div className={`w-7 h-7 rounded-nb flex-shrink-0 flex items-center justify-center ${tool?.bg || 'bg-primary/15'}`}>
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
                className="p-1.5 rounded-nb-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors cursor-pointer"
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
                className="p-1.5 rounded-nb-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
      {/* Pasek nagłówka — ta sama struktura co CanvasNodeDetails (h-10, badge + akcje ghost),
          żeby oba widoki prawego doku od razu dawały się rozróżnić po treści, nie po layoucie. */}
      {/* Nagłówek jak w panelu źródeł i na liście notatników — mikroetykieta,
          linia, akcje jako gołe ikony. Wcześniej była tu pigułka GlassBadge i
          guziki w obwódkach, czyli trzeci język na jednym ekranie. */}
      <div className="flex flex-shrink-0 items-center gap-2.5 px-4 pt-3.5">
        <span className="shrink-0 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/65">
          Dokumenty
        </span>
        <span aria-hidden className="h-px flex-1 bg-foreground/[0.07]" />
        <button
          type="button"
          onClick={() => setIsSearchOpen(v => !v)}
          title="Szukaj w plikach"
          aria-label="Szukaj w plikach"
          className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-foreground/[0.06] ${isSearchOpen ? 'text-primary' : 'text-foreground/35 hover:text-foreground'}`}
        >
          <Search size={14} />
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Zamknij panel"
            aria-label="Zamknij panel"
            className="shrink-0 rounded-lg p-1 text-foreground/35 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="px-4 pt-3 pb-3 border-b border-foreground/[0.08] flex-shrink-0">
        {/* Bez akapitu-instrukcji: prawy przycisk i tak się sprawdza odruchowo,
            a dwa zdania na górze panelu czyta się raz i nigdy więcej. */}

        {isSearchOpen && (
          <div className="mt-3 animate-in fade-in duration-150">
            <GlassInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filtruj dokumenty..."
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* NARZĘDZIA W TRZECH GRUPACH, NIE W PŁASKIEJ SIATCE.
            Dziesięć identycznych kafelków obok siebie niczego nie tłumaczyło —
            trzeba było przeczytać wszystkie, żeby wybrać jeden. Podział na
            „czytaj / ucz się / pokaż" mówi od razu, po co się tu sięga. */}
        <div className="p-3 border-b border-foreground/[0.06]">
          {GRUPY_NARZEDZI.map((grupa, gi) => {
            const wGrupie = STUDIO_TOOLS.filter(x => grupa.ids.includes(x.id));
            if (wGrupie.length === 0) return null;
            return (
              <div key={grupa.klucz} className={gi > 0 ? 'mt-3' : ''}>
                <span className="mb-1.5 block px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/40">
                  {grupa.etykieta}
                </span>
                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                  {wGrupie.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool)}
                        disabled={!hasSources || isGenerating}
                        title={hasSources ? tool.description : 'Dodaj źródło, żeby użyć: ' + tool.description}
                        className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-primary/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground/45 transition-colors duration-200 group-hover:text-primary">
                          <Icon size={12} />
                        </span>
                        <span className="truncate text-[11px] font-semibold text-foreground/80 transition-colors group-hover:text-foreground">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Generated Documents List or Empty State */}
        {filteredOutputs.length > 0 ? (
          <div className="p-3 space-y-2">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="shrink-0 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/65">
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
          <p className="px-3 py-4 text-[11px] text-foreground/45">
            Tu wylądują gotowe dokumenty.
          </p>
        )}
      </div>

      {pendingTool && (
        <TopicDialog tool={pendingTool} onConfirm={handleConfirm} onCancel={() => setPendingTool(null)} />
      )}
    </div>
  );
}

export default StudioPanel;


