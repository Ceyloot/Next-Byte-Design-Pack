import * as React from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ───────────────────────────────────────────────── */
export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

/* ── Store ───────────────────────────────────────────────── */
type Listener = (toasts: ToastData[]) => void;
let toasts: ToastData[] = [];
const listeners: Set<Listener> = new Set();

function notify() { listeners.forEach(l => l([...toasts])); }

function addToast(data: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  const toast: ToastData = { id, variant: 'default', duration: 4000, ...data };
  toasts = [toast, ...toasts].slice(0, 5);
  notify();
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => removeToast(id), toast.duration);
  }
  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

/* ── Hook ────────────────────────────────────────────────── */
export function useToast() {
  const [state, setState] = React.useState<ToastData[]>([]);
  React.useEffect(() => {
    setState([...toasts]);
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);

  return {
    toasts: state,
    toast: (data: Omit<ToastData, 'id'>) => addToast(data),
    dismiss: (id: string) => removeToast(id),
    success: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'title' | 'variant'>>) =>
      addToast({ title, variant: 'success', ...opts }),
    error: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'title' | 'variant'>>) =>
      addToast({ title, variant: 'destructive', ...opts }),
    warning: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'title' | 'variant'>>) =>
      addToast({ title, variant: 'warning', ...opts }),
    info: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'title' | 'variant'>>) =>
      addToast({ title, variant: 'default', ...opts }),
  };
}

/* ── Ikona ───────────────────────────────────────────────── */
const ICONS: Record<ToastVariant, React.ReactNode> = {
  default:     <Info className="h-4 w-4 text-foreground" />,
  success:     <CheckCircle className="h-4 w-4 text-primary" />,
  warning:     <AlertTriangle className="h-4 w-4 text-accent-foreground" />,
  destructive: <XCircle className="h-4 w-4 text-destructive" />,
};

const BORDER: Record<ToastVariant, string> = {
  default:     'border-border',
  success:     'border-primary/40',
  warning:     'border-accent/40',
  destructive: 'border-destructive/40',
};

/* ── Toast item ──────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const variant = toast.variant ?? 'default';
  return (
    <div
      className={cn(
        'relative flex w-full items-start gap-3 rounded-xl border bg-card p-4',
        'shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.06)]',
        'animate-in slide-in-from-right-full fade-in duration-200',
        BORDER[variant],
      )}
    >
      <span className="mt-0.5 shrink-0">{ICONS[variant]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-card-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => { toast.action!.onClick(); onDismiss(); }}
            className="mt-2 text-xs font-semibold text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Zamknij"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Toaster ─────────────────────────────────────────────── */
const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-right':     'top-4 right-4 items-end',
  'top-center':    'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right':  'bottom-4 right-4 items-end',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

export interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position = 'bottom-right' }: ToasterProps) {
  const { toasts, dismiss } = useToast();
  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none',
        POSITION_CLASSES[position],
      )}
      aria-live="polite"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full">
          <ToastItem toast={t} onDismiss={() => { t.onDismiss?.(); dismiss(t.id); }} />
        </div>
      ))}
    </div>
  );
}
