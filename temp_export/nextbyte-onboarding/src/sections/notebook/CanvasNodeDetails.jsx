import React, { useState, useRef, useEffect } from 'react';
import { X, PlayCircle, FileText, Maximize2, Send, Loader2, MessageSquare, StickyNote } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { GlassCard, GlassButton, GlassBadge, GlassTooltip, GlassInput } from '@/components/glass';

const NODE_STYLES = {
  concept: { label: 'Pojęcie' },
  chapter: { label: 'Rozdział' },
  'timeline-event': { label: 'Oś czasu' },
};

function formatStart(sec) {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-0.5">
      {[0, 150, 300].map(d => (
        <span
          key={d}
          className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg, pexelsKey }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] px-3 py-2 text-[11.5px] leading-relaxed ${
          isUser
            ? 'bg-gradient-to-b from-primary/[0.16] to-primary/[0.04] text-foreground border border-primary/30 rounded-xl rounded-br-sm shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.3)]'
            : 'bg-muted/50 border border-foreground/[0.06] text-muted-foreground rounded-xl rounded-bl-sm'
        }`}
      >
        {isUser ? msg.content : <MarkdownRenderer content={msg.content} pexelsKey={pexelsKey} />}
      </div>
    </div>
  );
}

function NodeSources({ node, sources, onSeekToVideo, onOpenPreview }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
        Sprawdź w źródle ({node.sources.length})
      </div>
      <div className="space-y-1.5">
        {node.sources.map(src => {
          const isVideo = !!src.videoId;
          return (
            <GlassCard
              key={src.sourceId}
              interactive
              padding="px-3 py-2"
              radius="rounded-xl"
              className="text-left w-full hover:border-primary/40 group"
              onClick={() => {
                if (isVideo) {
                  onSeekToVideo?.(src.videoId, src.start || 0);
                } else {
                  const full = sources.find(s => s.id === src.sourceId);
                  if (full) onOpenPreview?.(full, src.locator || null);
                }
              }}
            >
              <div className="flex items-start gap-2.5">
                {isVideo
                  ? <PlayCircle size={13} className="text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  : <FileText size={13} className="text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />}
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-medium text-muted-foreground leading-snug line-clamp-2 group-hover:text-foreground">{src.title}</div>
                  {formatStart(src.start) && (
                    <div className="text-[10px] text-primary/80 font-mono mt-0.5">od {formatStart(src.start)}</div>
                  )}
                  {!isVideo && src.locator?.type === 'row' && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">wiersz {src.locator.value}</div>
                  )}
                  {!isVideo && src.locator?.type === 'page' && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">strona {src.locator.value}</div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

export default function CanvasNodeDetails({
  selectedNode,
  onClose,
  onSeekToVideo,
  sources,
  onOpenPreview,
  onFocus,
  chatMessages = [],
  onSendChat,
  isChatLoading,
  onAskInChat,
  onAddToNote,
  apiKeys,
}) {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  if (!selectedNode) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading) return;
    onSendChat(text);
    setChatInput('');
  };

  const mdClasses = 'text-xs text-muted-foreground leading-relaxed [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-[13.5px] [&_h4]:text-[13px] [&_h5]:text-xs [&_h6]:text-[11px] [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_h5]:text-foreground [&_strong]:text-foreground [&_strong]:font-normal [&_b]:font-normal [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3.5 [&_h3]:mb-1.5 [&_h4]:mt-3 [&_h4]:mb-1 [&_li]:my-0.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1.5';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-foreground/5 bg-background/80 backdrop-blur-xl flex-shrink-0">
        <GlassBadge size="sm" intent="neutral" className="uppercase tracking-wider">
          {(NODE_STYLES[selectedNode.nodeType] || NODE_STYLES.concept).label}
        </GlassBadge>
        <div className="flex items-center gap-0.5">
          {onAskInChat && (
            <GlassTooltip content="Zapytaj w głównym chacie">
              <GlassButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-primary"
                onClick={() => onAskInChat(
                  `[Temat: ${selectedNode.title}] `,
                  `Kontekst z mapy wiedzy:\nTemat: ${selectedNode.title}\n${selectedNode.keyPoints?.length ? `Kluczowe punkty:\n${selectedNode.keyPoints.map(p => `• ${p}`).join('\n')}` : ''}`
                )}
              >
                <MessageSquare size={13} />
              </GlassButton>
            </GlassTooltip>
          )}
          {onAddToNote && (
            <GlassTooltip content="Dodaj do notatek">
              <GlassButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-primary"
                onClick={() => onAddToNote(selectedNode)}
              >
                <StickyNote size={13} />
              </GlassButton>
            </GlassTooltip>
          )}
          <GlassTooltip content="Pełny widok">
            <GlassButton variant="ghost" size="icon" className="h-7 w-7" onClick={onFocus}>
              <Maximize2 size={13} />
            </GlassButton>
          </GlassTooltip>
          <GlassButton variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={14} />
          </GlassButton>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground leading-snug">{selectedNode.title}</h3>

        {selectedNode.keyPoints?.length > 0 && (
          <ul className="space-y-1.5">
            {selectedNode.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground leading-relaxed">
                <span className="text-primary flex-shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {selectedNode.detail && (
          <div className={`pt-3 border-t border-foreground/5 ${mdClasses}`}>
            <MarkdownRenderer content={selectedNode.detail} pexelsKey={apiKeys?.pexels} />
          </div>
        )}

        <NodeSources
          node={selectedNode}
          sources={sources}
          onSeekToVideo={onSeekToVideo}
          onOpenPreview={onOpenPreview}
        />

        {/* Chat messages */}
        <div className="pt-3 border-t border-foreground/5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            <MessageSquare size={10} />
            Zapytaj o ten temat
          </div>
          {chatMessages.length > 0 && (
            <div className="space-y-2 mb-2 max-h-56 overflow-y-auto">
              {chatMessages.map((msg, i) => <ChatBubble key={i} msg={msg} pexelsKey={apiKeys?.pexels} />)}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="px-2.5 py-2 rounded-xl bg-card border border-foreground/5 rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          {chatMessages.length === 0 && isChatLoading && (
            <div className="flex justify-start mb-2">
              <div className="px-2.5 py-2 rounded-xl bg-card border border-foreground/5 rounded-bl-sm">
                <TypingDots />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat input — fixed at bottom */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-foreground/5 bg-background/60">
        <form onSubmit={handleSend} className="flex gap-1.5">
          <GlassInput
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Zadaj pytanie o ten temat..."
            className="h-8"
            disabled={isChatLoading}
          />
          <GlassButton
            type="submit"
            variant="primary"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            disabled={!chatInput.trim() || isChatLoading}
          >
            {isChatLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
          </GlassButton>
        </form>
      </div>
    </div>
  );
}
