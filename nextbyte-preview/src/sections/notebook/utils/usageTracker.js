const KEY = 'nb_usage_v2';
const MAX_LOG = 1000;

// Ceny per 1M tokenów (Google AI Studio, oficjalne — lipiec 2026)
export const PRICING = {
  'gemini-2.5-flash':       { input: 0.15,  output: 0.60,  note: 'domyślny' },
  'gemini-2.0-flash':       { input: 0.10,  output: 0.40,  note: 'szybki' },
  'gemini-1.5-pro':         { input: 1.25,  output: 5.00,  note: 'głęboka analiza' },
  'gemini-1.5-flash':       { input: 0.075, output: 0.30,  note: 'ekonomiczny' },
  'gemini-embedding-001':   { input: 0.025, output: 0,     note: null },
  'text-embedding-004':     { input: 0,     output: 0,     note: 'bezpłatne' },
};

export const TOOL_LABELS = {
  chat:       'Czat AI',
  summary:    'Streszczenie',
  quiz:       'Quiz / Fiszki',
  slides:     'Prezentacja',
  audio:      'Podcast',
  flashcards: 'Fiszki',
  canvas:     'Mapa wiedzy',
  embedding:  'Embeddingi',
  questions:  'Sugestie pytań',
  homework:   'Praca domowa',
  tool:       'Narzędzie AI',
};

// PLN/USD — aktualizuj ręcznie lub pobieraj z API
export const USD_TO_PLN = 3.85;

function getPrice(model) {
  if (PRICING[model]) return PRICING[model];
  for (const [k, v] of Object.entries(PRICING)) {
    if (model.startsWith(k)) return v;
  }
  return { input: 0.25, output: 1.17 };
}

export function calcCost(model, input, output) {
  const p = getPrice(model);
  return (input * p.input + output * p.output) / 1_000_000;
}

export function calcCostPLN(model, input, output) {
  return calcCost(model, input, output) * USD_TO_PLN;
}

// Szacunkowa liczba tokenów z tekstu (Gemini: ~4 znaki/token dla PL/EN mix)
export function estimateTokens(text = '') {
  return Math.round(text.length / 4);
}

// Szacunkowy koszt kontekstu (tylko input) w PLN i USD
export function estimateContextCost(model, tokens) {
  const p = getPrice(model);
  const usd = (tokens * p.input) / 1_000_000;
  return { usd, pln: usd * USD_TO_PLN };
}

export function trackUsage(model, tool, input, output, ctx = 0) {
  try {
    const raw = localStorage.getItem(KEY);
    const log = raw ? JSON.parse(raw) : [];
    log.push({ ts: Date.now(), model, tool, input: input | 0, output: output | 0, ctx: ctx | 0 });
    if (log.length > MAX_LOG) log.splice(0, log.length - MAX_LOG);
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch {}
}

export function getUsageLog() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearUsageLog() {
  localStorage.removeItem(KEY);
  localStorage.removeItem('notebook_total_tokens');
  localStorage.removeItem('notebook_last_tokens');
}

export function computeStats(log) {
  let totalCost = 0, totalInput = 0, totalOutput = 0, totalCtx = 0;
  const byTool = {};
  const byModel = {};

  for (const e of log) {
    const cost = calcCost(e.model, e.input, e.output);
    totalCost += cost;
    totalInput += e.input;
    totalOutput += e.output;
    totalCtx += e.ctx || 0;

    if (!byTool[e.tool]) byTool[e.tool] = { count: 0, input: 0, output: 0, cost: 0, ctx: 0 };
    byTool[e.tool].count++;
    byTool[e.tool].input += e.input;
    byTool[e.tool].output += e.output;
    byTool[e.tool].cost += cost;
    byTool[e.tool].ctx += e.ctx || 0;

    if (!byModel[e.model]) byModel[e.model] = { count: 0, input: 0, output: 0, cost: 0 };
    byModel[e.model].count++;
    byModel[e.model].input += e.input;
    byModel[e.model].output += e.output;
    byModel[e.model].cost += cost;
  }

  return { totalCost, totalInput, totalOutput, totalCtx, byTool, byModel };
}

export function fmtCost(usd) {
  if (usd === 0) return '$0.00';
  if (usd < 0.000001) return '<$0.000001';
  if (usd < 0.01) return `$${usd.toFixed(6)}`;
  return `$${usd.toFixed(4)}`;
}

export function fmtTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}


export function exportCsv(log) {
  const header = ['Data', 'Model', 'Narzędzie', 'Input (tk)', 'Output (tk)', 'Razem (tk)', 'Koszt (USD)'];
  const rows = log.map(e => {
    const d = new Date(e.ts).toLocaleString('pl-PL');
    const cost = calcCost(e.model, e.input, e.output).toFixed(8);
    return [d, e.model, TOOL_LABELS[e.tool] || e.tool, e.input, e.output, e.input + e.output, cost];
  });
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nextscribe-usage-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
