import { calcCost } from '../utils/usageTracker';
import { getConfig } from './config';
import { addEntry, mergeLastEntry } from './store';

export function trackGemini(model, tool, inputTk, outputTk, ctxTk = 0, webSearch = false) {
  try {
    const usd = calcCost(model, inputTk, outputTk);
    const entry = { ts: Date.now(), model, tool, source: 'gemini', inputTk, outputTk, ctxTk, usd };
    if (webSearch) entry.webSearch = true;
    addEntry(entry);
  } catch {}
}

export function trackElevenLabs(tool, chars) {
  try {
    const cfg = getConfig();
    const usd = (chars / 1000) * cfg.el_price_per_1k;
    const merged = mergeLastEntry(tool, { usd, chars });
    if (!merged) {
      addEntry({ ts: Date.now(), model: 'elevenlabs', tool, source: 'elevenlabs', chars, usd });
    }
  } catch {}
}
