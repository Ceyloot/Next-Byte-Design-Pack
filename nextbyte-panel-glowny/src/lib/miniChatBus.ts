/**
 * Lightweight global event bus for toggling the floating mini-chat
 * from the mobile header without prop-drilling or heavy context.
 */

type Listener = (open: boolean) => void;

let _isOpen = false;
const _listeners = new Set<Listener>();

export const miniChatBus = {
  get isOpen() { return _isOpen; },

  toggle() {
    _isOpen = !_isOpen;
    _listeners.forEach(fn => fn(_isOpen));
  },

  open() {
    if (_isOpen) return;
    _isOpen = true;
    _listeners.forEach(fn => fn(true));
  },

  close() {
    if (!_isOpen) return;
    _isOpen = false;
    _listeners.forEach(fn => fn(false));
  },

  /** Sync external state (e.g. FloatingAssistantChat) back into the bus */
  syncState(open: boolean) {
    _isOpen = open;
    // Don't notify — this is a sync call from the source of truth
  },

  subscribe(fn: Listener) {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};
