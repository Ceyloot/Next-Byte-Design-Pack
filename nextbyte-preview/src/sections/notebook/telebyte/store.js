const KEY = 'telebyte_v1';
const MAX = 500;
let listeners = [];

function notify() { listeners.forEach(fn => fn()); }

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function getLog() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function addEntry(entry) {
  try {
    const log = getLog();
    log.push(entry);
    if (log.length > MAX) log.splice(0, log.length - MAX);
    localStorage.setItem(KEY, JSON.stringify(log));
    notify();
  } catch {}
}

export function mergeLastEntry(tool, delta, windowMs = 120_000) {
  try {
    const log = getLog();
    const now = Date.now();
    for (let i = log.length - 1; i >= 0; i--) {
      const e = log[i];
      if (e.tool === tool && !e.hasEl && now - e.ts < windowMs) {
        e.usd  += delta.usd  || 0;
        e.chars = (e.chars || 0) + (delta.chars || 0);
        e.hasEl = true;
        localStorage.setItem(KEY, JSON.stringify(log));
        notify();
        return true;
      }
    }
    return false;
  } catch { return false; }
}

export function clearLog() {
  try { localStorage.removeItem(KEY); notify(); } catch {}
}
