import React, { useState } from 'react';
import { Shield, Key, Palette, Check, Sliders, Sparkles, BookOpen, HelpCircle, Briefcase, PenTool, Download, Loader2, FileText } from 'lucide-react';
import { getUsageLog, clearUsageLog, computeStats, fmtCost, fmtTokens, TOOL_LABELS, PRICING, calcCost, exportCsv } from './utils/usageTracker';
import { useTheme, THEMES } from './context/ThemeContext';
import { useGlass } from '@/lib/glass-context';
import { GlassModal, GlassButton, GlassInput, GlassBadge } from '@/components/glass'
import { NbTabs } from '@/components/ui/NbTabs';
import { SwitchField } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const GOAL_OPTIONS = [
  {
    id: 'default',
    label: 'Domyślny (Default)',
    icon: Sparkles,
    desc: 'Najlepszy do ogólnych badań, analiz i burzy mózgów.',
    prompt: ''
  },
  {
    id: 'guide',
    label: 'Przewodnik Naukowy',
    icon: BookOpen,
    desc: 'Wyjaśnia skomplikowane pojęcia krok po kroku i ułatwia przyswajanie wiedzy.',
    prompt: 'Jesteś przewodnikiem naukowym. Wyjaśniaj pojęcia krok po kroku, stosuj analogie i pomagaj użytkownikowi w nauce.'
  },
  {
    id: 'socratic',
    label: 'Sokrates (Pytania)',
    icon: HelpCircle,
    desc: 'Zadaje pytania naprowadzające, skłania do myślenia i testuje Twoją wiedzę.',
    prompt: 'Odpowiadaj metodą sokratejską. Zadawaj pytania naprowadzające, skłaniaj użytkownika do samodzielnego wnioskowania.'
  },
  {
    id: 'executive',
    label: 'Streszczenie Biznesowe',
    icon: Briefcase,
    desc: 'Skupia się na najważniejszych wnioskach, liczbach i punktach kluczowych.',
    prompt: 'Bądź zwięzły i konkretny. Odpowiadaj w punktach, skupiaj się na kluczowych wnioskach i faktach.'
  },
  {
    id: 'custom',
    label: 'Własna Rola (Custom)',
    icon: PenTool,
    desc: 'Wpisz własne instrukcje systemowe dla sztucznej inteligencji.',
    prompt: ''
  }
];

const LENGTH_OPTIONS = [
  { id: 'default', label: 'Domyślna (Default)', desc: 'Zbalansowane odpowiedzi' },
  { id: 'longer', label: 'Dłuższa (Longer)', desc: 'Wyczerpujące analizy i szerszy kontekst' },
  { id: 'shorter', label: 'Krótsza (Shorter)', desc: 'Zwięzłe, szybkie odpowiedzi w punktach' },
];

function UsageMonitor() {
  const [tab, setTab] = React.useState('total');
  const [log, setLog] = React.useState(() => getUsageLog());

  const stats = React.useMemo(() => computeStats(log), [log]);
  const last = log[log.length - 1];

  const handleReset = () => {
    clearUsageLog();
    setLog([]);
  };

  const TAB = [
    { key: 'total',   label: 'Razem' },
    { key: 'tools',   label: 'Narzędzia' },
    { key: 'models',  label: 'Modele' },
    { key: 'history', label: 'Historia' },
  ];

  const modelLabel = (m) => {
    if (m.includes('2.0-flash')) return 'Gemini 2.0 Flash';
    if (m.includes('2.5-flash')) return 'Gemini 2.5 Flash';
    if (m.includes('3-flash') || m.includes('3.0-flash')) return 'Gemini 3 Flash';
    if (m.includes('embedding')) return 'Embeddingi';
    return m;
  };

  const modelPrice = (m) => {
    const p = PRICING[m] || PRICING['gemini-3.1-flash-lite'];
    if (p.input === 0 && p.output === 0) return 'bezpłatny';
    return `$${p.input}/$${p.output}/1M`;
  };

  return (
    <div className="rounded-nb nb-szklo bg-card/30 border-foreground/10 text-xs mt-4 select-none overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-semibold text-foreground/50 text-[10px] uppercase tracking-wider">Raport kosztów API</span>
        <div className="flex gap-3">
          {log.length > 0 && (
            <button type="button" onClick={() => exportCsv(log)} className="text-[10px] text-emerald-400 hover:underline font-semibold">
              Pobierz CSV
            </button>
          )}
          <button type="button" onClick={handleReset} className="text-[10px] text-primary hover:underline font-semibold">
            Resetuj
          </button>
        </div>
      </div>

      {/* total cost banner */}
      <div className="px-4 pb-3 flex items-end gap-3 border-b border-foreground/10">
        <div>
          <div className="text-[22px] font-bold text-foreground leading-none">{fmtCost(stats.totalCost)}</div>
          <div className="text-[10px] text-foreground/50 mt-0.5">koszt całkowity · {log.length} zapytań</div>
        </div>
        <div className="ml-auto text-right space-y-0.5">
          <div className="text-[11px] text-foreground/60">
            <span className="text-foreground/70 font-semibold">{fmtTokens(stats.totalInput)}</span> input
            {stats.totalCtx > 0 && (
              <span className="text-amber-400/70 ml-1">({Math.round(stats.totalCtx / stats.totalInput * 100)}% kontekst)</span>
            )}
          </div>
          <div className="text-[11px] text-foreground/60">
            <span className="text-foreground/70 font-semibold">{fmtTokens(stats.totalOutput)}</span> output
          </div>
          {stats.totalCtx > 0 && (
            <div className="text-[11px] text-foreground/60">
              <span className="text-amber-400/80 font-semibold">{fmtTokens(stats.totalCtx)}</span> <span className="text-amber-400/60">kontekst</span>
            </div>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="px-3 pt-2.5">
        <NbTabs key={tab} tabs={TAB} defaultTab={tab} onChange={setTab} className="w-full" />
      </div>

      {/* tab content */}
      <div className="px-3 py-2.5 space-y-1 min-h-[80px]">
        {tab === 'total' && (
          <>
            {last ? (
              <div className="flex justify-between items-center py-1 border-b border-foreground/10 mb-2">
                <span className="text-foreground/60">Ostatnie: <span className="text-foreground/80">{TOOL_LABELS[last.tool] || last.tool}</span></span>
                <span className="font-semibold text-foreground">
                  {fmtTokens(last.input)}↑ {fmtTokens(last.output)}↓ · {fmtCost(calcCost(last.model, last.input, last.output))}
                </span>
              </div>
            ) : (
              <div className="text-foreground/40 text-center py-4 text-[10px]">Brak danych — zacznij korzystać z AI</div>
            )}
            {Object.entries(stats.byTool).sort((a,b) => b[1].cost - a[1].cost).slice(0, 5).map(([tool, s]) => (
              <div key={tool} className="flex justify-between items-center py-0.5">
                <span className="text-foreground/60">{TOOL_LABELS[tool] || tool} <span className="opacity-50">×{s.count}</span></span>
                <span className="font-semibold text-foreground">{fmtCost(s.cost)}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'tools' && (
          Object.keys(stats.byTool).length === 0
            ? <div className="text-foreground/40 text-center py-4 text-[10px]">Brak danych</div>
            : Object.entries(stats.byTool).sort((a,b) => b[1].cost - a[1].cost).map(([tool, s]) => {
                const avgTok = s.count ? Math.round((s.input + s.output) / s.count) : 0;
                const avgCtx = s.count && s.ctx ? Math.round(s.ctx / s.count) : 0;
                const ctxPct = s.input > 0 && s.ctx > 0 ? Math.round(s.ctx / s.input * 100) : 0;
                return (
                  <div key={tool} className="py-1 border-b border-foreground/[0.06] last:border-0">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground/80">{TOOL_LABELS[tool] || tool}</span>
                      <span className="font-bold text-foreground">{fmtCost(s.cost)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-foreground/60 mt-0.5">
                      <span>{s.count} req · śr. {fmtTokens(avgTok)} tk</span>
                      <span>{fmtTokens(s.input)}↑ {fmtTokens(s.output)}↓</span>
                    </div>
                    {avgCtx > 0 && (
                      <div className="flex justify-between text-[9px] text-amber-400/60 mt-0.5">
                        <span>śr. kontekst: {fmtTokens(avgCtx)} tk/req ({ctxPct}% inputu)</span>
                        <span>{fmtCost(s.input > 0 ? s.cost * s.ctx / s.input : 0)} overhead</span>
                      </div>
                    )}
                  </div>
                );
              })
        )}

        {tab === 'models' && (
          Object.keys(stats.byModel).length === 0
            ? <div className="text-foreground/40 text-center py-4 text-[10px]">Brak danych</div>
            : Object.entries(stats.byModel).sort((a,b) => b[1].cost - a[1].cost).map(([model, s]) => (
                <div key={model} className="py-1 border-b border-foreground/[0.06] last:border-0">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground/80">{modelLabel(model)}</span>
                    <span className="font-bold text-foreground">{fmtCost(s.cost)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-foreground/60 mt-0.5">
                    <span>{s.count} req · {modelPrice(model)}</span>
                    <span>{fmtTokens(s.input)}↑ {fmtTokens(s.output)}↓</span>
                  </div>
                </div>
              ))
        )}

        {tab === 'history' && (
          log.length === 0
            ? <div className="text-foreground/40 text-center py-4 text-[10px]">Brak historii</div>
            : <div className="space-y-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-[9px] text-foreground/40 uppercase tracking-wider pb-1 border-b border-foreground/10">
                  <span>Narzędzie</span><span className="text-right">Input</span><span className="text-right">Output</span><span className="text-right">Koszt</span>
                </div>
                {[...log].reverse().slice(0, 30).map((e, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 py-0.5 border-b border-foreground/[0.03] last:border-0 items-center">
                    <div>
                      <span className="text-foreground/80 text-[10px]">{TOOL_LABELS[e.tool] || e.tool}</span>
                      <span className="text-foreground/30 text-[9px] ml-1">{new Date(e.ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-[10px] text-foreground/60 text-right">{fmtTokens(e.input)}</span>
                    <span className="text-[10px] text-foreground/60 text-right">{fmtTokens(e.output)}</span>
                    <span className="text-[10px] font-semibold text-foreground text-right">{fmtCost(calcCost(e.model, e.input, e.output))}</span>
                  </div>
                ))}
                {log.length > 30 && (
                  <div className="text-center text-[9px] text-foreground/30 pt-1">+{log.length - 30} starszych (pobierz CSV po pełną listę)</div>
                )}
              </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-foreground/10 text-[9px] text-foreground/30 italic">
        Gemini 2.5 Flash: $0.15/$0.60 · 2.0 Flash: $0.10/$0.40 · Embeddingi: bezpłatne (plan darmowy)
      </div>
    </div>
  );
}

function ThemePreviewCard({ themeId, label, preview }) {
  const previewPanels = [
    { w: '60%', h: 28, x: 0, y: 0 },
    { w: '35%', h: 20, x: '65%', y: 0 },
    { w: '100%', h: 14, x: 0, y: 36 },
  ];
  return (
    <div
      className="relative rounded-nb-sm overflow-hidden flex-shrink-0"
      style={{
        background: preview.bg,
        width: 90,
        height: 60,
        border: `1px solid ${preview.border}`,
      }}
    >
      {/* mini ambient blob */}
      <div style={{
        position: 'absolute', top: -10, left: -10, width: 50, height: 50,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${preview.accent}55, transparent 70%)`,
        filter: 'blur(12px)',
        pointerEvents: 'none',
      }} />
      {previewPanels.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.x,
          top: p.y + 6,
          width: p.w,
          height: p.h,
          background: preview.card,
          border: `1px solid ${preview.border}`,
          borderRadius: themeId === 'liquid-glass' ? 8 : themeId === 'glassmorphism' ? 6 : 5,
          backdropFilter: 'blur(4px)',
        }} />
      ))}
      {/* accent dot */}
      <div style={{
        position: 'absolute', bottom: 5, right: 6,
        width: 6, height: 6, borderRadius: '50%',
        background: preview.accent,
        boxShadow: `0 0 6px ${preview.accent}`,
      }} />
    </div>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme, bgPattern, setPattern, themes } = useTheme();
  const { isGlass, setIsGlass } = useGlass();

  const PATTERNS = [
    { id: 'grid', label: 'Siatka Tech (Grid)', desc: 'Precyzyjna siatka 3D w tle' },
    { id: 'ambient', label: 'Ambient Latarnia', desc: 'Rozmyty promień światła' },
    { id: 'pure', label: 'Czysty Ciemny', desc: 'Minimalistyczne gładkie tło' },
  ];

  return (
    <div className="space-y-4 select-none">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-3 flex items-center gap-2">
          <Palette size={14} className="text-primary" /> Motyw Kolorystyczny NextByte
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {themes.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                'relative flex items-center gap-3 p-2.5 rounded-nb-sm border text-left transition-all cursor-pointer',
                theme === t.id
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(112,190,250,0.15)]'
                  : 'nb-szklo bg-card/30 border-foreground/[0.09] hover:bg-card/60 hover:border-foreground/15'
              )}
            >
              <div
                className="w-10 h-10 rounded-nb-xs flex-shrink-0 border flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: t.preview.bg, borderColor: t.preview.border }}
              >
                <div
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: t.preview.accent }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-xs font-bold truncate', theme === t.id ? 'text-primary' : 'text-foreground/90')}>
                  {t.label}
                </div>
                <div className="text-[10px] text-foreground/50 truncate mt-0.5">{t.desc}</div>
              </div>
              {theme === t.id && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check size={10} className="text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-foreground/10 flex items-center justify-between gap-3">
        <SwitchField
          label="Efekty Liquid Glass (Szkło NextByte)"
          description="Rozmycia, refleksy i podświetlenia. Wyłącz dla matowych kart bez przeźroczystości."
          checked={isGlass}
          onCheckedChange={setIsGlass}
        />
      </div>

      <div className="pt-3 border-t border-foreground/10">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2.5 block">
          Wzór Tła Interfejsu
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PATTERNS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPattern(p.id)}
              className={cn(
                'px-3 py-2 rounded-nb-sm border text-left transition-all cursor-pointer',
                bgPattern === p.id
                  ? 'border-primary/60 bg-primary/10 text-primary font-bold'
                  : 'nb-szklo bg-card/30 border-foreground/[0.09] text-foreground/70 hover:bg-card/60'
              )}
            >
              <div className="text-xs">{p.label}</div>
              <div className="text-[9px] text-foreground/40 mt-0.5 truncate">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  isOpen,
  onClose,
  apiKeys = {},
  onSave,
  chatConfig = { goal: 'default', length: 'default', customPrompt: '' },
  onSaveConfig,
  onExportDocx,
  isExporting = false,
  initialTab = 'api'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form state API Keys
  const [geminiKey, setGeminiKey] = useState(apiKeys.gemini || '');
  const [youtubeKey, setYoutubeKey] = useState(apiKeys.youtube || '');
  const [pexelsKey, setPexelsKey] = useState(apiKeys.pexels || '');
  const [elevenlabsKey, setElevenlabsKey] = useState(apiKeys.elevenlabs || '');
  const [modelSelect, setModelSelect] = useState(apiKeys.model || 'gemini-2.5-flash');
  const [supabaseUrl, setSupabaseUrl] = useState(apiKeys.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(apiKeys.supabaseKey || '');

  // Form state Chat Config
  const [goal, setGoal] = useState(() => chatConfig?.goal || 'default');
  const [length, setLength] = useState(() => chatConfig?.length || 'default');
  const [customPrompt, setCustomPrompt] = useState(() => chatConfig?.customPrompt || '');

  React.useEffect(() => {
    if (isOpen) {
      setGeminiKey(apiKeys.gemini || '');
      setYoutubeKey(apiKeys.youtube || '');
      setPexelsKey(apiKeys.pexels || '');
      setElevenlabsKey(apiKeys.elevenlabs || '');
      setModelSelect(apiKeys.model || 'gemini-2.5-flash');
      setSupabaseUrl(apiKeys.supabaseUrl || '');
      setSupabaseKey(apiKeys.supabaseKey || '');

      setGoal(chatConfig?.goal || 'default');
      setLength(chatConfig?.length || 'default');
      setCustomPrompt(chatConfig?.customPrompt || '');
    }
  }, [isOpen, apiKeys, chatConfig]);

  if (!isOpen) return null;

  const currentGoalObj = GOAL_OPTIONS.find(g => g.id === goal) || GOAL_OPTIONS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        gemini: geminiKey.trim(),
        youtube: youtubeKey.trim(),
        pexels: pexelsKey.trim(),
        elevenlabs: elevenlabsKey.trim(),
        model: modelSelect,
        supabaseUrl: supabaseUrl.trim(),
        supabaseKey: supabaseKey.trim(),
      });
    }
    if (onSaveConfig) {
      onSaveConfig({
        goal,
        length,
        customPrompt: goal === 'custom' ? customPrompt : currentGoalObj.prompt,
      });
    }
    onClose();
  };

  const MAIN_TABS = [
    { key: 'api', label: 'Wygląd & API', icon: <Key /> },
    { key: 'customization', label: 'Dostosuj czat', icon: <Sliders /> },
    { key: 'export', label: 'Eksport', icon: <Download /> },
  ];

  return (
    <GlassModal
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <span className="p-2 bg-primary/20 rounded-nb-sm text-primary border border-primary/30">
            <Shield size={20} />
          </span>
          <span>
            <span className="block text-lg font-heading font-bold tracking-tight">Ustawienia i Personalizacja</span>
            <span className="block text-[11px] text-foreground/60 font-normal">Klucze API, styl wypowiedzi AI oraz opcje eksportu</span>
          </span>
        </span>
      }
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="-mt-2">
        {/* Modal Navigation Tabs */}
        <NbTabs key={activeTab} tabs={MAIN_TABS} defaultTab={activeTab} onChange={setActiveTab} className="w-full mb-5" />

        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar -mx-6 px-6 space-y-5">

          {/* TAB 1: API & LOOK */}
          {activeTab === 'api' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ThemeSwitcher />

              <div className="border-t border-foreground/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key size={14} className="text-primary" />
                  <span className="text-sm font-semibold">Klucze API</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 flex items-center gap-2">
                  <Key size={13} className="text-primary" /> Klucz Gemini API
                </label>
                <GlassInput
                  type="password"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                />
                <p className="text-[10px] text-foreground/50 mt-1">Wymagany do chatu i generowania podsumowań.</p>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 flex items-center gap-2">
                  <Key size={13} className="text-destructive" /> Klucz YouTube API
                </label>
                <GlassInput
                  type="password"
                  value={youtubeKey}
                  onChange={e => setYoutubeKey(e.target.value)}
                  placeholder="Opcjonalny..."
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 flex items-center gap-2">
                  <Key size={13} className="text-emerald-400" /> Klucz Pexels API
                </label>
                <GlassInput
                  type="password"
                  value={pexelsKey}
                  onChange={e => setPexelsKey(e.target.value)}
                  placeholder="Opcjonalny — do obrazów w czacie"
                />
                <p className="text-[10px] text-foreground/50 mt-1">Darmowy — <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pexels.com/api</a>. Włącza obrazy w odpowiedziach AI.</p>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 flex items-center gap-2">
                  <Key size={13} className="text-purple-400" /> Klucz ElevenLabs API
                </label>
                <GlassInput
                  type="password"
                  value={elevenlabsKey}
                  onChange={e => setElevenlabsKey(e.target.value)}
                  placeholder="Opcjonalny — do Audio Overview"
                />
                <p className="text-[10px] text-foreground/50 mt-1">Do generowania podkastów głosowych. <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">elevenlabs.io</a></p>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Model AI</label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Domyślny · Najnowszy i superszybki' },
                    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Szybki · Niezawodny' },
                    { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro',   desc: 'Głęboka analiza · ≤2M ctx' },
                    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Ekonomiczny' },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setModelSelect(m.value)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2 rounded-nb-sm border text-left transition-all cursor-pointer',
                        modelSelect === m.value
                          ? 'border-primary/50 bg-primary/10 text-foreground'
                          : 'nb-szklo bg-card/30 border-foreground/[0.09] text-foreground/60 hover:text-foreground hover:bg-card/60'
                      )}
                    >
                      <span className="text-xs font-semibold">{m.label}</span>
                      <span className={cn('text-[10px]', modelSelect === m.value ? 'text-primary/80' : 'text-foreground/50')}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RAG / Supabase */}
              <div className="pt-4 border-t border-foreground/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
                  <span className="text-xs font-semibold text-foreground/80">RAG — Supabase Vector Store</span>
                  {supabaseUrl && supabaseKey ? (
                    <GlassBadge size="sm" intent="success">aktywny</GlassBadge>
                  ) : (
                    <GlassBadge size="sm" intent="neutral">nieaktywny</GlassBadge>
                  )}
                </div>
                <p className="text-[10px] text-foreground/50 mb-2">
                  Gdy aktywny: zamiast całych źródeł do każdego pytania trafia tylko top-6 trafnych fragmentów — koszt inputu spada 20-50×.
                </p>
                <div className="space-y-2">
                  <GlassInput
                    type="text"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                  />
                  <GlassInput
                    type="password"
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                    placeholder="anon key (eyJ...)"
                  />
                </div>
              </div>

              <UsageMonitor />
            </div>
          )}

          {/* TAB 2: DOSTOSUJ CZAT */}
          {activeTab === 'customization' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-nb-sm bg-primary/10 border border-primary/25 flex items-start gap-3">
                <Sliders size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <h4 className="font-bold text-foreground">Personalizacja Asystenta AI</h4>
                  <p className="text-foreground/60 text-[11px] mt-0.5">
                    Dostosuj cel odpowiedzi, metodę prowadzenia dyskusji oraz oczekiwaną szczegółowość wyjaśnień.
                  </p>
                </div>
              </div>

              {/* Goal selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Zdefiniuj cel konwersacji, styl lub rolę
                </label>

                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map(opt => {
                    const isSelected = goal === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGoal(opt.id)}
                        className={cn(
                          'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary/60 shadow-[0_0_12px_rgba(112,190,250,0.3)]'
                            : 'nb-szklo bg-card/40 text-foreground/60 border-foreground/15 hover:text-foreground hover:bg-card/70'
                        )}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                        <Icon size={13} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-primary/90 italic pt-1">
                  {currentGoalObj.desc}
                </p>

                {goal === 'custom' && (
                  <div className="pt-2">
                    <textarea
                      rows={3}
                      value={customPrompt}
                      onChange={e => setCustomPrompt(e.target.value)}
                      placeholder="Wpisz swoje szczegółowe instrukcje dla AI (np. Odpowiadaj po angielsku, używaj terminologii medycznej...)"
                      className="w-full p-3 rounded-nb-sm nb-szklo bg-card/40 border-foreground/15 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-primary/50 resize-none font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Response length selection */}
              <div className="space-y-3 pt-4 border-t border-foreground/10">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Wybierz długość odpowiedzi
                </label>

                <div className="flex flex-wrap gap-2">
                  {LENGTH_OPTIONS.map(opt => {
                    const isSelected = length === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLength(opt.id)}
                        className={cn(
                          'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary/60 shadow-[0_0_12px_rgba(112,190,250,0.3)]'
                            : 'nb-szklo bg-card/40 text-foreground/60 border-foreground/15 hover:text-foreground hover:bg-card/70'
                        )}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EKSPORT */}
          {activeTab === 'export' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-nb-sm nb-szklo bg-card/30 border-foreground/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-nb-sm bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Eksport Notatnika do DOCX</h4>
                    <p className="text-xs text-foreground/60">Pobierz zgromadzone źródła, czat oraz notatki w jednym pliku</p>
                  </div>
                </div>

                <p className="text-xs text-foreground/60 leading-relaxed pt-1">
                  Generuje kompletny dokument programu Word (.docx) zawierający strukturę Twojego projektu, wygenerowane opracowania i zgromadzoną wiedzę.
                </p>

                <div className="pt-2">
                  <GlassButton
                    type="button"
                    variant="solid"
                    onClick={() => { if (onExportDocx) onExportDocx(); }}
                    disabled={isExporting}
                    className={cn('w-full', isExporting && '[&>svg]:animate-spin')}
                  >
                    {isExporting ? <Loader2 size={14} /> : <Download size={14} />}
                    {isExporting ? 'Generowanie DOCX...' : 'Eksportuj notatnik (.docx)'}
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex justify-end gap-3 pt-5 mt-1 border-t border-foreground/10">
          <GlassButton type="button" variant="ghost" onClick={onClose}>Anuluj</GlassButton>
          <GlassButton type="submit" variant="solid">Zapisz ustawienia</GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}

export default SettingsModal;
