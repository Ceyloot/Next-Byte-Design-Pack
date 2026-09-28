import React, { useEffect, useRef, useState } from 'react';
import { Edit2 } from 'lucide-react';
import { GlassModal, GlassButton, GlassInput } from '@/components/glass';

/**
 * Stylowany zamiennik natywnego window.prompt() — pojedyncze pole tekstowe
 * z tytułem, treścią, Anuluj/Zapisz. Enter zatwierdza, Escape anuluje.
 */
export default function PromptDialog({
  open,
  title,
  message,
  initialValue = '',
  placeholder = '',
  confirmLabel = 'Zapisz',
  cancelLabel = 'Anuluj',
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed) onConfirm(trimmed);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm, value]);

  const trimmed = value.trim();
  const canConfirm = trimmed.length > 0;

  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      width="max-w-sm"
      title={
        <span className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Edit2 size={15} />
          </span>
          <span>{title}</span>
        </span>
      }
    >
      {message && <p className="text-xs text-foreground/60 leading-relaxed">{message}</p>}
      <div className={message ? 'mt-4' : ''}>
        <GlassInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-auto py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <GlassButton variant="ghost" size="sm" onClick={onCancel}>
          {cancelLabel}
        </GlassButton>
        <GlassButton variant="solid" size="sm" onClick={() => canConfirm && onConfirm(trimmed)} disabled={!canConfirm}>
          {confirmLabel}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
