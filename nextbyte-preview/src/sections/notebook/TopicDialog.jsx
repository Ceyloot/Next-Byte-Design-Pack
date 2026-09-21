import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { GlassModal, GlassButton, GlassInput } from '@/components/glass';

export default function TopicDialog({ tool, onConfirm, onCancel }) {
  const [topic, setTopic] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (tool) {
      setTopic('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [tool]);

  const Icon = tool?.icon;

  const handleConfirm = () => {
    onConfirm(topic.trim());
  };

  return (
    <GlassModal
      open={!!tool}
      onClose={onCancel}
      width="max-w-sm"
      title={
        tool && (
          <span className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-nb-sm flex items-center justify-center flex-shrink-0 ${tool.bg || 'bg-primary/15'}`}>
              {Icon && <Icon size={16} className={tool.color || 'text-primary'} />}
            </span>
            <span className="truncate">{tool.label}</span>
          </span>
        )
      }
      subtitle={tool?.description}
    >
      {tool && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-foreground/60 uppercase tracking-wide block mb-1.5">
              Temat / Instrukcja (opcjonalnie)
            </label>
            <GlassInput
              ref={inputRef}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') onCancel();
              }}
              placeholder={`np. "Kluczowe pojęcia", "Rozdział 3"...`}
              className="h-auto py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <GlassButton variant="ghost" onClick={onCancel} className="flex-1">
              Anuluj
            </GlassButton>
            <GlassButton variant="solid" onClick={handleConfirm} className="flex-1">
              <Send size={14} />
              Generuj
            </GlassButton>
          </div>
        </div>
      )}
    </GlassModal>
  );
}
