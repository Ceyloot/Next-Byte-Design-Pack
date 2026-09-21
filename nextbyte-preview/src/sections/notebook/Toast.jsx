import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { GlassAlert } from '@/components/glass';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast musi być użyty wewnątrz ToastProvider');
  return ctx;
}

const VARIANT_TO_INTENT = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = {
      id,
      variant: toast.variant || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration ?? 4500,
    };
    setToasts(prev => [...prev, item]);
    if (item.duration > 0) {
      setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    show: push,
    success: (message, opts = {}) => push({ ...opts, variant: 'success', message }),
    error:   (message, opts = {}) => push({ ...opts, variant: 'error',   message, duration: opts.duration ?? 6500 }),
    warning: (message, opts = {}) => push({ ...opts, variant: 'warning', message }),
    info:    (message, opts = {}) => push({ ...opts, variant: 'info',    message }),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {ReactDOM.createPortal(
        <div className="fixed top-4 right-4 z-[120] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)] w-80">
          {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const intent = VARIANT_TO_INTENT[toast.variant] || 'info';
  return (
    <div className="pointer-events-auto animate-in fade-in slide-in-from-right-3 duration-200 shadow-xl shadow-black/50">
      <GlassAlert intent={intent} title={toast.title || undefined} onClose={onDismiss} className="bg-card/95 backdrop-blur-md">
        {toast.message}
      </GlassAlert>
    </div>
  );
}
