import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassModal, GlassButton } from '@/components/glass';

/**
 * Własny dialog potwierdzenia w stylu appki — zamiennik natywnego confirm(),
 * który na mobile wygląda jak błąd systemowy i wybija z UI.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Usuń', cancelLabel = 'Anuluj', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onConfirm, onCancel]);

  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      width="max-w-sm"
      title={
        <span className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-nb-sm bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive flex-shrink-0">
            <AlertTriangle size={16} />
          </span>
          <span>{title}</span>
        </span>
      }
    >
      {message && <p className="text-xs text-foreground/60 leading-relaxed">{message}</p>}
      <div className="flex justify-end gap-2 mt-5">
        <GlassButton variant="ghost" size="sm" onClick={onCancel}>
          {cancelLabel}
        </GlassButton>
        <GlassButton variant="danger" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
