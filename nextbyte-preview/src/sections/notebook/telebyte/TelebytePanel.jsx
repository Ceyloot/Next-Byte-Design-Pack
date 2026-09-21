import React, { useState, useCallback, useEffect } from 'react';
import { X, RefreshCw, Zap, BarChart2, Clock, TrendingUp, Sliders } from 'lucide-react';
import { fmtTokens, TOOL_LABELS, getUsageLog, calcCost } from '../utils/usageTracker';
import { getLog, clearLog, subscribe } from './store';

function legacyToNew(e) {
  return {
    ts: e.ts,
    model: e.model,
    tool: e.tool,
    source: 'gemini',
    inputTk: e.input || 0,
    outputTk: e.output || 0,
    ctxTk: e.ctx || 0,
    usd: calcCost(e.model, e.input || 0, e.output || 0),
  };
}

function getDisplayLog() {
  const tb = getLog();
  if (tb.length > 0) return tb;
  try { return getUsageLog().map(legacyToNew); } catch { return []; }
}
import { getConfig, saveConfig, resetConfig, DEFAULT_CONFIG } from './config';

const TABS = [
  { id: 'summary', label: 'Podsumowanie', icon: BarChart2 },
  { id: 'history', label: 'Historia',     icon: Clock },
  { id: 'tools',   label: 'Narzędzia',   icon: TrendingUp },
  { id: 'config',  label: 'Konfiguracja', icon: Sliders },
];

const LABELS = { ...TOOL_LABELS, report: 'Raport' };
const toolLabel = t => LABELS[t] || t;

function liveBytes(usd, cfg) {
  return Math.max(1, Math.ceil((usd / cfg.usd_per_byte) * cfg.markup));
}

function fmtUsd(n) {
  if (!n || n === 0) return '$0.00';
  if (n < 0.0001) return `$${n.toFixed(6)}`;
  if (n < 0.01)   return `$${n.toFixed(5)}`;
  return `$${n.toFixed(4)}`;
}

function fmtPln(usd, rate) {
  return `${(usd * rate).toFixed(4)} zł`;
}

function profitColor(v) {
  return v > 0 ? 'text-emerald-400' : v < 0 ? 'text-red-400' : 'text-muted-foreground';
}

function marginColor(p) {
  return p >= 30 ? 'text-emerald-400' : p >= 10 ? 'text-yellow-400' : 'text-red-400';
}

const PER_PAGE = 30;

export default function TelebytePanel() {
  const [open, setOpen]     = useState(false);
  const [tab, setTab]       = useState('summary');
  const [log, setLog]       = useState(() => getDisplayLog());
  const [cfg, setCfg]       = useState(() => getConfig());
  const [draft, setDraft]   = useState(() => getConfig());
  const [dirty, setDirty]   = useState(false);
  const [page, setPage]     = useState(0);

  const reload = useCallback(() => {
    setLog(getDisplayLog());
    const c = getConfig();
    setCfg(c); setDraft(c); setDirty(false);
  }, []);

  useEffect(() => subscribe(() => setLog(getDisplayLog())), []);

  // ── Aggregates ────────────────────────────────────────────────
  const totalUsd    = log.reduce((s, e) => s + (e.usd || 0), 0);
  const totalBytes  = log.reduce((s, e) => s + liveBytes(e.usd || 0, cfg), 0);
  const totalRev    = totalBytes * cfg.usd_per_byte;
  const totalProfit = totalRev - totalUsd;
  const margin      = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

  // ── By tool ───────────────────────────────────────────────────
  const byTool = {};
  for (const e of log) {
    if (!byTool[e.tool]) byTool[e.tool] = { count: 0, usd: 0, inputTk: 0, outputTk: 0, ctxTk: 0, chars: 0 };
    const t = byTool[e.tool];
    t.count++;
    t.usd    += e.usd || 0;
    t.inputTk += e.inputTk || 0;
    t.outputTk += e.outputTk || 0;
    t.ctxTk   += e.ctxTk || 0;
    t.chars   += e.chars || 0;
  }

  // ── Config ────────────────────────────────────────────────────
  function setField(k, v) { setDraft(d => ({ ...d, [k]: v })); setDirty(true); }
  function handleSave()   { saveConfig(draft); setCfg(draft); setDirty(false); }
  function handleReset()  { resetConfig(); setDraft({ ...DEFAULT_CONFIG }); setCfg({ ...DEFAULT_CONFIG }); setDirty(false); }

  // ── CSV export ────────────────────────────────────────────────
  function exportCsv() {
    const header = ['Data', 'Narzędzie', 'Bajty', 'Koszt USD', 'Zarobek USD', 'input_tk', 'output_tk', 'ctx_tk', 'znaki'];
    const rows = [...log].reverse().map(e => {
      const bytes  = liveBytes(e.usd || 0, cfg);
      const rev    = bytes * cfg.usd_per_byte;
      const profit = rev - (e.usd || 0);
      return [
        new Date(e.ts).toLocaleString('pl-PL'),
        toolLabel(e.tool), bytes,
        (e.usd || 0).toFixed(8), profit.toFixed(8),
        e.inputTk || 0, e.outputTk || 0, e.ctxTk || 0, e.chars || 0,
      ];
    });
    const csv  = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `telebyte-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  // ── History pagination ────────────────────────────────────────
  const histRev   = [...log].reverse();
  const histSlice = histRev.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pages     = Math.ceil(log.length / PER_PAGE);

  // ── Table styles ──────────────────────────────────────────────
  const th  = 'text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2 text-right whitespace-nowrap font-medium';
  const thL = th + ' text-left';
  const td  = 'px-3 py-2 text-[11px] tabular-nums text-right text-foreground';
  const tdL = td + ' text-left';

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-3 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold hover:bg-yellow-400/30 transition-colors shadow-lg"
      >
        <Zap size={11} /><span>Telebyte</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed right-0 top-0 bottom-0 w-[520px] z-50 flex flex-col bg-[#0d0d10] border-l border-white/8 shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-[12px] font-bold text-foreground">Telebyte</span>
              <span className="text-[9px] bg-yellow-400/15 text-yellow-300 rounded px-1.5 py-0.5 font-semibold">DEV</span>
              <span className="text-[10px] text-muted-foreground">{log.length} wywołań</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={exportCsv} className="text-[10px] text-emerald-400 hover:underline font-semibold">CSV</button>
              <button onClick={reload} className="text-muted-foreground hover:text-foreground"><RefreshCw size={11} /></button>
              <button onClick={() => { clearLog(); setLog([]); }} className="text-[10px] text-red-400 hover:underline font-semibold">Wyczyść</button>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground ml-1"><X size={14} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/8 shrink-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${tab === t.id ? 'text-foreground border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
                  <Icon size={11} />{t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── PODSUMOWANIE ── */}
            {tab === 'summary' && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <KpiCard label="Bajty" value={totalBytes.toLocaleString('pl-PL')} unit="B"
                    sub={`${log.length} wywołań`} color="text-yellow-300" />
                  <KpiCard label="Koszt API" value={fmtUsd(totalUsd)}
                    sub={fmtPln(totalUsd, cfg.usd_to_pln)} color="text-red-400" />
                  <KpiCard label="Zarobek (zysk)"
                    value={fmtUsd(totalProfit)}
                    sub={`${fmtPln(totalProfit, cfg.usd_to_pln)} · marża ${margin.toFixed(1)}%`}
                    color={profitColor(totalProfit)} />
                  <KpiCard label="Przychód z bajtów" value={fmtUsd(totalRev)}
                    sub={`${fmtPln(totalRev, cfg.usd_to_pln)} · 1B = $${cfg.usd_per_byte}`}
                    color="text-sky-300" />
                </div>

                <div className="rounded-xl bg-white/[0.025] border border-white/6 p-3 space-y-1.5">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Aktywna stawka</div>
                  <SumRow k="1 bajt =" v={`$${cfg.usd_per_byte}  ·  ${(cfg.usd_per_byte * cfg.usd_to_pln * 100).toFixed(2)} gr`} />
                  <SumRow k="Markup"   v={`×${cfg.markup}  →  marża docelowa ${((1 - 1 / cfg.markup) * 100).toFixed(0)}%`} />
                  <SumRow k="ElevenLabs" v={`$${cfg.el_price_per_1k}/1k znaków`} />
                  <SumRow k="Kurs USD/PLN" v={`${cfg.usd_to_pln} zł`} />
                </div>

                {log.length === 0 && (
                  <p className="text-center text-muted-foreground text-[12px] py-6">Brak danych — wyślij wiadomość do AI.</p>
                )}
                {log.length > 0 && totalProfit < 0 && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-[11px] text-red-300">
                    Zysk ujemny — koszty API przewyższają przychód z bajtów. Zwiększ markup lub cenę bajta.
                  </div>
                )}
              </div>
            )}

            {/* ── HISTORIA ── */}
            {tab === 'history' && (
              <div className="p-4">
                {log.length === 0
                  ? <p className="text-center text-muted-foreground text-[12px] py-8">Brak historii.</p>
                  : (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-white/8">
                        <table className="w-full border-collapse min-w-[560px]">
                          <thead>
                            <tr className="border-b border-white/8 bg-white/[0.02]">
                              <th className={thL}>Czas</th>
                              <th className={thL}>Narzędzie</th>
                              <th className={th}>Bajty</th>
                              <th className={th}>Koszt API</th>
                              <th className={th}>Zarobek</th>
                              <th className={th}>Tokeny / znaki</th>
                            </tr>
                          </thead>
                          <tbody>
                            {histSlice.map((e, i) => {
                              const bytes  = liveBytes(e.usd || 0, cfg);
                              const rev    = bytes * cfg.usd_per_byte;
                              const profit = rev - (e.usd || 0);
                              const isEl   = e.source === 'elevenlabs';
                              const tkStr  = isEl
                                ? `${(e.chars || 0).toLocaleString()} zn.`
                                : e.hasEl
                                  ? `${fmtTokens(e.inputTk||0)}↑ ${fmtTokens(e.outputTk||0)}↓ · ${(e.chars||0).toLocaleString()} zn.`
                                  : `${fmtTokens(e.inputTk||0)}↑ ${fmtTokens(e.outputTk||0)}↓`;
                              return (
                                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                                  <td className={tdL + ' text-muted-foreground text-[10px]'}>
                                    {new Date(e.ts).toLocaleTimeString('pl-PL')}
                                  </td>
                                  <td className={tdL}>
                                    <span className="flex items-center gap-1">
                                      {toolLabel(e.tool)}
                                      {e.webSearch && <span className="text-[9px] bg-blue-500/20 text-blue-300 rounded px-1">🌐 Web</span>}
                                      {isEl   && <span className="text-[9px] bg-purple-500/20 text-purple-300 rounded px-1">11L</span>}
                                      {e.hasEl && <span className="text-[9px] bg-purple-500/20 text-purple-300 rounded px-1">+11L</span>}
                                    </span>
                                  </td>
                                  <td className={td + ' text-yellow-300 font-medium'}>{bytes.toLocaleString()} B</td>
                                  <td className={td + ' text-red-400'}>
                                    <div>{fmtUsd(e.usd)}</div>
                                    <div className="text-[9px] text-red-400/50">{fmtPln(e.usd || 0, cfg.usd_to_pln)}</div>
                                  </td>
                                  <td className={td + ' ' + profitColor(profit) + ' font-medium'}>
                                    <div>{fmtUsd(profit)}</div>
                                    <div className="text-[9px] opacity-50 font-normal">{fmtPln(profit, cfg.usd_to_pln)}</div>
                                  </td>
                                  <td className={td + ' text-muted-foreground text-[10px]'}>{tkStr}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {pages > 1 && (
                        <div className="flex items-center justify-between mt-3">
                          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-[11px] text-primary disabled:opacity-30">← Nowsze</button>
                          <span className="text-[10px] text-muted-foreground">str. {page + 1} / {pages}</span>
                          <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="text-[11px] text-primary disabled:opacity-30">Starsze →</button>
                        </div>
                      )}
                    </>
                  )
                }
              </div>
            )}

            {/* ── NARZĘDZIA ── */}
            {tab === 'tools' && (
              <div className="p-4">
                {Object.keys(byTool).length === 0
                  ? <p className="text-center text-muted-foreground text-[12px] py-8">Brak danych.</p>
                  : (
                    <div className="overflow-x-auto rounded-xl border border-white/8">
                      <table className="w-full border-collapse min-w-[480px]">
                        <thead>
                          <tr className="border-b border-white/8 bg-white/[0.02]">
                            <th className={thL}>Narzędzie</th>
                            <th className={th}>Wywołania</th>
                            <th className={th}>Bajty</th>
                            <th className={th}>Koszt API</th>
                            <th className={th}>Zarobek</th>
                            <th className={th}>Marża</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(byTool)
                            .sort((a, b) => b[1].usd - a[1].usd)
                            .map(([tool, t]) => {
                              const bytes  = liveBytes(t.usd, cfg);
                              const rev    = bytes * cfg.usd_per_byte;
                              const profit = rev - t.usd;
                              const m      = rev > 0 ? (profit / rev) * 100 : 0;
                              return (
                                <tr key={tool} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                                  <td className={tdL + ' font-medium'}>{toolLabel(tool)}</td>
                                  <td className={td}>{t.count}</td>
                                  <td className={td + ' text-yellow-300'}>{bytes.toLocaleString()} B</td>
                                  <td className={td + ' text-red-400'}>{fmtUsd(t.usd)}</td>
                                  <td className={td + ' ' + profitColor(profit)}>{fmtUsd(profit)}</td>
                                  <td className={td + ' ' + marginColor(m)}>{m.toFixed(1)}%</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            )}

            {/* ── KONFIGURACJA ── */}
            {tab === 'config' && (
              <div className="p-4 space-y-4">
                <section className="rounded-xl bg-white/[0.025] border border-white/6 p-4 space-y-4">
                  <h3 className="text-[11px] font-semibold text-foreground">Przelicznik bajtów</h3>

                  <CfgRow label="Cena 1 bajta (USD)"
                    help={`= ${(draft.usd_per_byte * draft.usd_to_pln * 100).toFixed(2)} gr przy kursie ${draft.usd_to_pln} zł`}>
                    <input type="number" step="0.001" min="0.001" value={draft.usd_per_byte}
                      onChange={e => setField('usd_per_byte', parseFloat(e.target.value) || 0.044)}
                      className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-right text-foreground" />
                  </CfgRow>

                  <CfgRow label="Markup (narzut)"
                    help={`Marża docelowa: ${((1 - 1 / draft.markup) * 100).toFixed(0)}%`}>
                    <div className="flex items-center gap-2">
                      <input type="range" min="1" max="10" step="0.1" value={draft.markup}
                        onChange={e => setField('markup', parseFloat(e.target.value))}
                        className="w-24 accent-primary" />
                      <span className="text-[12px] font-bold text-foreground w-10 text-right">×{draft.markup.toFixed(1)}</span>
                    </div>
                  </CfgRow>

                  <CfgRow label="ElevenLabs (USD / 1k znaków)"
                    help="eleven_multilingual_v2 · Creator ~$0.30, Scale ~$0.24">
                    <input type="number" step="0.01" min="0" value={draft.el_price_per_1k}
                      onChange={e => setField('el_price_per_1k', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-right text-foreground" />
                  </CfgRow>

                  <CfgRow label="Kurs USD → PLN">
                    <input type="number" step="0.01" min="1" value={draft.usd_to_pln}
                      onChange={e => setField('usd_to_pln', parseFloat(e.target.value) || 3.85)}
                      className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-right text-foreground" />
                  </CfgRow>
                </section>

                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={!dirty}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold disabled:opacity-40">
                    Zapisz
                  </button>
                  <button onClick={handleReset}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-muted-foreground hover:text-foreground">
                    Przywróć domyślne
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

function KpiCard({ label, value, unit, sub, color }) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/6 p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`text-[22px] font-bold leading-none ${color}`}>
        {value}{unit && <span className="text-[14px] ml-0.5 opacity-70">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{sub}</div>}
    </div>
  );
}

function SumRow({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{k}</span>
      <span className="text-[11px] text-foreground font-medium tabular-nums">{v}</span>
    </div>
  );
}

function CfgRow({ label, help, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-foreground">{label}</div>
        {help && <div className="text-[10px] text-muted-foreground mt-0.5">{help}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
