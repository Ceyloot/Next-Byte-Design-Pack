import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, PlayCircle, FileText, Send, Loader2, MessageSquare, Sparkles, StickyNote } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';

function formatStart(sec) {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FocusMode({
  node,
  chatMessages = [],
  onSendChat,
  isChatLoading,
  onClose,
  sources,
  onSeekToVideo,
  onOpenPreview,
  onAskInChat,
  onAddToNote,
  apiKeys,
}) {
  const [chatInput, setChatInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading) return;
    onSendChat(text);
    setChatInput('');
  };

  const mdClasses = 'text-sm text-muted-foreground leading-relaxed [&_h2]:text-sm [&_h3]:text-[13.5px] [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_strong]:font-normal [&_b]:font-normal [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3.5 [&_h3]:mb-1.5 [&_h4]:mt-3 [&_h4]:mb-1 [&_li]:my-0.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1.5';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 flex w-full h-full p-4 md:p-8 gap-4 max-w-7xl mx-auto">

        {/* Left: node content */}
        <GlassCard padding="p-0" radius="rounded-2xl" className="flex-1 min-w-0 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 h-12 border-b border-foreground/10 flex-shrink-0">
            <h2 className="text-sm font-semibold text-foreground leading-snug truncate pr-4">{node.title}</h2>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {onAskInChat && (
                <GlassButton
                  onClick={() => { onAskInChat(`[Temat: ${node.title}] `, `Kontekst z mapy wiedzy:\nTemat: ${node.title}\n${node.keyPoints?.length ? `Kluczowe punkty:\n${node.keyPoints.map(p => `• ${p}`).join('\n')}` : ''}`); onClose(); }}
                  title="Zapytaj w głównym chacie"
                  variant="ghost"
                  size="icon"
                >
                  <MessageSquare size={14} />
                </GlassButton>
              )}
              {onAddToNote && (
                <GlassButton
                  onClick={() => { onAddToNote(node); onClose(); }}
                  title="Dodaj do notatek"
                  variant="ghost"
                  size="icon"
                >
                  <StickyNote size={14} />
                </GlassButton>
              )}
              <GlassButton onClick={onClose} variant="ghost" size="icon" className="ml-1">
                <X size={16} />
              </GlassButton>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {node.keyPoints?.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2.5">Kluczowe punkty</div>
                <ul className="space-y-2">
                  {node.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-foreground leading-relaxed">
                      <span className="text-primary flex-shrink-0 font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {node.detail && (
              <div className="pt-4 border-t border-foreground/5">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">Szczegóły</div>
                <div className={mdClasses}>
                  <MarkdownRenderer content={node.detail} pexelsKey={apiKeys?.pexels} />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-foreground/5">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2.5">
                Źródła ({node.sources.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {node.sources.map(src => {
                  const isVideo = !!src.videoId;
                  return (
                    <button
                      key={src.sourceId}
                      onClick={() => {
                        if (isVideo) { onSeekToVideo?.(src.videoId, src.start || 0); onClose(); }
                        else {
                          const full = sources.find(s => s.id === src.sourceId);
                          if (full) { onOpenPreview?.(full, src.locator || null); onClose(); }
                        }
                      }}
                      className="text-left px-3 py-2.5 rounded-xl bg-background/60 border border-foreground/[0.08] hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {isVideo
                          ? <PlayCircle size={13} className="text-primary flex-shrink-0 mt-0.5" />
                          : <FileText size={13} className="text-primary flex-shrink-0 mt-0.5" />}
                        <div>
                          <div className="text-xs text-foreground leading-snug line-clamp-2">{src.title}</div>
                          {formatStart(src.start) && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">od {formatStart(src.start)}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right: Chat */}
        <GlassCard padding="p-0" radius="rounded-2xl" className="w-80 max-md:hidden flex flex-col shadow-2xl">
          <div className="flex items-center gap-2 px-4 h-12 border-b border-foreground/10 flex-shrink-0">
            <MessageSquare size={13} className="text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-foreground">Zapytaj AI o ten temat</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {chatMessages.length === 0 && !isChatLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <Sparkles size={22} className="text-primary/30 mb-3" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zadaj pytanie o <span className="text-foreground font-medium">„{node.title}"</span> — AI odpowie w kontekście tego tematu i jego źródeł.
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/15 text-foreground border border-primary/20 rounded-xl rounded-br-sm'
                    : 'bg-background/60 text-muted-foreground border border-foreground/10 rounded-xl rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' ? <MarkdownRenderer content={msg.content} pexelsKey={apiKeys?.pexels} /> : msg.content}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2.5 rounded-xl bg-background/60 border border-foreground/10 rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-foreground/10">
            <form onSubmit={handleSend} className="flex gap-1.5">
              <GlassInput
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Wpisz pytanie..."
                className="flex-1 h-8"
                disabled={isChatLoading}
                autoFocus
              />
              <GlassButton
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                variant="primary"
                size="icon"
                className="w-8 h-8 flex-shrink-0"
              >
                {isChatLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              </GlassButton>
            </form>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}
