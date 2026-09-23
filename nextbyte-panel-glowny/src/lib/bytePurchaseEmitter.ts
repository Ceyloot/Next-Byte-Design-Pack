/**
 * Global event emitter for opening the Byte purchase dialog from anywhere
 * (including hooks outside React context tree).
 */

type BytePurchasePayload = { requiredBytes?: number; itemName?: string };
type Listener = (payload: BytePurchasePayload) => void;

const listeners = new Set<Listener>();

export const bytePurchaseEmitter = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  emit(payload: BytePurchasePayload = {}) {
    listeners.forEach(fn => fn(payload));
  },
};
