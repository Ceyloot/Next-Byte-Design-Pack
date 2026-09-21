const KEY = 'telebyte_cfg_v1';

export const DEFAULT_CONFIG = {
  usd_per_byte: 0.044,
  markup: 1.5,
  el_price_per_1k: 0.30,
  usd_to_pln: 3.85,
};

export function getConfig() {
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULT_CONFIG }; }
}

export function saveConfig(cfg) {
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}
}

export function resetConfig() {
  try { localStorage.removeItem(KEY); } catch {}
}
