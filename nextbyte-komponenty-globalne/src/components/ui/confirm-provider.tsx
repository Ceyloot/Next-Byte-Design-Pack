import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmDeleteDialog, type WariantPotwierdzenia } from '@/components/ui/confirm-delete-dialog';
import { PoleFormularza } from '@/components/ui/pole-formularza';
import { Input } from '@/components/ui/input';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  itemName?: string;
  itemIcon?: string | React.ReactNode;
  /** `decyzja` = pytanie bez kasowania: akcent marki, „Dalej”, bez zdania „nie można cofnąć”. */
  wariant?: WariantPotwierdzenia;
  /** Treść pod opisem — akapity pytania (łamanie wierszy zachowane). */
  tresc?: React.ReactNode;
}

/** Pytanie o JEDEN tekst — zamiennik `window.prompt` w tej samej skorupie co potwierdzenia. */
export interface PytanieOTekst {
  title: string;
  description?: string;
  /** Etykieta nad polem. */
  etykieta: string;
  /** Wartość startowa (podpowiedź do poprawienia). */
  wartosc?: string;
  placeholder?: string;
  /** Zdanie pod polem — po co ta nazwa, jak ją dobrać. */
  podpowiedz?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmFn = (opts: ConfirmOptions | string) => Promise<boolean>;
type PromptFn = (opts: PytanieOTekst) => Promise<string | null>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface State extends ConfirmOptions {
  open: boolean;
}

const DEFAULT_DESCRIPTION = 'Tej operacji nie można cofnąć.';

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // (registration of imperative API happens below via useEffect)
  const [state, setState] = useState<State>({ open: false, title: '' });
  const resolverRef = useRef<((v: boolean) => void) | null>(null);
  // Okno pytające o tekst — osobny stan, żeby potwierdzenie i pytanie nie nadpisywały się nawzajem.
  const [pytanie, setPytanie] = useState<(PytanieOTekst & { open: boolean }) | null>(null);
  const [wartosc, setWartosc] = useState('');
  const resolverTekstRef = useRef<((v: string | null) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    const normalized: ConfirmOptions =
      typeof opts === 'string' ? { title: opts } : opts;
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: normalized.title,
        // Decyzja bez zapasu „nie można cofnąć” — to zdanie jest prawdą o kasowaniu, nie o pytaniu.
        description: normalized.description ?? (normalized.wariant === 'decyzja' ? '' : DEFAULT_DESCRIPTION),
        confirmLabel: normalized.confirmLabel,
        cancelLabel: normalized.cancelLabel,
        itemName: normalized.itemName,
        itemIcon: normalized.itemIcon,
        wariant: normalized.wariant,
        tresc: normalized.tresc,
      });
    });
  }, []);

  const prompt = useCallback<PromptFn>((opts) => new Promise<string | null>((resolve) => {
    resolverTekstRef.current = resolve;
    setWartosc(opts.wartosc ?? '');
    setPytanie({ ...opts, open: true });
  }), []);

  React.useEffect(() => {
    _registerImperativeConfirm(confirm);
    _registerImperativePrompt(prompt);
    return () => { _registerImperativeConfirm(null); _registerImperativePrompt(null); };
  }, [confirm, prompt]);

  const finish = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
  };

  const finishTekst = (value: string | null) => {
    resolverTekstRef.current?.(value);
    resolverTekstRef.current = null;
    setPytanie((p) => (p ? { ...p, open: false } : p));
  };

  const decyzja = state.wariant === 'decyzja';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDeleteDialog
        open={state.open}
        onOpenChange={(o) => { if (!o) finish(false); }}
        onConfirm={() => finish(true)}
        title={state.title || 'Potwierdź'}
        description={decyzja ? (state.description || '') : (state.description || DEFAULT_DESCRIPTION)}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        itemName={state.itemName}
        itemIcon={state.itemIcon}
        wariant={state.wariant}
        tresc={state.tresc}
      />
      {pytanie && (
        <ConfirmDeleteDialog
          open={pytanie.open}
          onOpenChange={(o) => { if (!o) finishTekst(null); }}
          onConfirm={() => finishTekst(wartosc)}
          title={pytanie.title}
          description={pytanie.description ?? ''}
          confirmLabel={pytanie.confirmLabel ?? 'Zapisz'}
          cancelLabel={pytanie.cancelLabel}
          wariant="decyzja"
          confirmDisabled={!wartosc.trim()}
          tresc={
            <PoleFormularza etykieta={pytanie.etykieta} htmlFor="pytanie-o-tekst" podpowiedz={pytanie.podpowiedz}>
              <Input
                id="pytanie-o-tekst"
                autoFocus
                value={wartosc}
                placeholder={pytanie.placeholder}
                onChange={(e) => setWartosc(e.target.value)}
                // Enter zatwierdza jak w `window.prompt`; pusty tekst nie przechodzi (przycisk i tak jest wyłączony).
                onKeyDown={(e) => { if (e.key === 'Enter' && wartosc.trim()) { e.preventDefault(); finishTekst(wartosc); } }}
              />
            </PoleFormularza>
          }
        />
      )}
    </ConfirmContext.Provider>
  );
};

/** React hook — preferowane użycie wewnątrz komponentów. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Bezpieczny fallback dla niezamontowanego providera (np. testy / wczesny render).
    return async (opts) => {
      const msg = typeof opts === 'string' ? opts : opts.title;
      // eslint-disable-next-line no-alert
      return window.confirm(msg);
    };
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Imperative API — używaj poza komponentami React (utils, helpers).    */
/* ------------------------------------------------------------------ */

let imperativeConfirm: ConfirmFn | null = null;
let imperativePrompt: PromptFn | null = null;

/** Wewnętrzny rejestrator wywoływany przez provider. */
export function _registerImperativeConfirm(fn: ConfirmFn | null) {
  imperativeConfirm = fn;
}

/** Wewnętrzny rejestrator okna pytającego o tekst. */
export function _registerImperativePrompt(fn: PromptFn | null) {
  imperativePrompt = fn;
}

/** Imperatywne API: `await confirmDelete('Usunąć?')` poza komponentem. */
export async function confirmDelete(opts: ConfirmOptions | string): Promise<boolean> {
  if (imperativeConfirm) return imperativeConfirm(opts);
  const msg = typeof opts === 'string' ? opts : opts.title;
  // eslint-disable-next-line no-alert
  return window.confirm(msg);
}

/** Pytanie bez kasowania: `await potwierdzDecyzje({ title: 'Wystawić z pustymi polami?', confirmLabel: 'Wystaw' })`. */
export async function potwierdzDecyzje(opts: ConfirmOptions | string): Promise<boolean> {
  const normalized: ConfirmOptions = typeof opts === 'string' ? { title: opts } : opts;
  return confirmDelete({ ...normalized, wariant: 'decyzja' });
}

/** Pytanie o tekst — `null`, gdy anulowano; zamiennik `window.prompt`. */
export async function zapytajOTekst(opts: PytanieOTekst): Promise<string | null> {
  if (imperativePrompt) return imperativePrompt(opts);
  // eslint-disable-next-line no-alert
  return window.prompt(opts.title, opts.wartosc ?? '');
}
