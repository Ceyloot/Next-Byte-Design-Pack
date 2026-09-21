import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { searchPexelsImage } from './utils/imageSearch';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlassCard, GlassButton } from '@/components/glass';

const CHART_COLORS = ['#70BEFA', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#38bdf8', '#c084fc'];

function ChartBlock({ raw }) {
  let spec;
  try { spec = JSON.parse(raw); } catch { return <pre className="text-xs text-destructive p-3">{raw}</pre>; }

  const { type = 'bar', title, labels = [], datasets = [] } = spec;

  // Normalise to recharts format
  const data = labels.map((label, i) => {
    const point = { name: label };
    datasets.forEach(ds => { point[ds.label || 'Wartość'] = ds.data?.[i] ?? 0; });
    return point;
  });

  const keys = datasets.map(ds => ds.label || 'Wartość');

  const commonProps = {
    data,
    margin: { top: 8, right: 16, left: 0, bottom: 8 },
  };

  const tooltipStyle = {
    contentStyle: { background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 20%)', borderRadius: '8px', fontSize: '11px' },
    labelStyle: { color: '#aaa' },
  };

  const renderChart = () => {
    if (type === 'pie' && data.length > 0) {
      const pieData = data.map((d, i) => ({ name: d.name, value: d[keys[0]] ?? 0, fill: CHART_COLORS[i % CHART_COLORS.length] }));
      return (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip {...tooltipStyle} />
            {keys.length > 1 && <Legend wrapperStyle={{ fontSize: '10px' }} />}
            {keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip {...tooltipStyle} />
          {keys.length > 1 && <Legend wrapperStyle={{ fontSize: '10px' }} />}
          {keys.map((k, i) => <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={48} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <GlassCard padding="p-0" radius="rounded-2xl" className="my-5">
      {title && <div className="px-4 pt-3 pb-1 text-xs font-semibold text-foreground/70">{title}</div>}
      <div className="px-2 pb-3 pt-1">{renderChart()}</div>
    </GlassCard>
  );
}

function RevealBlock({ label, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => setIsOpen(v => !v)}
      className={`my-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all select-none ${
        isOpen
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card/40 border-border/30 hover:border-primary/20 hover:bg-card/60'
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className={`transition-transform duration-200 text-primary ${isOpen ? 'rotate-90' : ''}`}>▶</span>
        <span>{label}</span>
      </div>
      {isOpen && (
        <div className="mt-2 text-sm text-foreground/85 leading-relaxed pl-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function InlineImage({ query, alt, pexelsKey }) {
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pexelsKey || !query) { setLoading(false); return; }
    let cancelled = false;
    searchPexelsImage(pexelsKey, query).then(result => {
      if (!cancelled) { setImg(result); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [query, pexelsKey]);

  if (!pexelsKey || (!loading && !img)) return null;

  if (loading) {
    return (
      <div className="my-4 rounded-xl bg-card/30 border border-border/30 h-48 flex items-center justify-center animate-pulse">
        <span className="text-xs text-muted-foreground">Szukam obrazu...</span>
      </div>
    );
  }

  return (
    <figure className="my-4">
      <GlassCard padding="p-0" radius="rounded-xl">
        <img
          src={img.url}
          alt={img.alt || alt}
          className="w-full max-h-72 object-cover"
          loading="lazy"
        />
        <figcaption className="px-3 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{alt}</span>
          <a href={img.pexelsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
            Foto: {img.photographer}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </figcaption>
      </GlassCard>
    </figure>
  );
}

export default function MarkdownRenderer({ content, citations, onCitationClick, sources = [], pexelsKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('mermaid-script')) {
      const script = document.createElement('script');
      script.id = 'mermaid-script';
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      };
      document.body.appendChild(script);
    }
  }, []);

  if (!content) return null;

  // AI sometimes returns literal \n sequences instead of actual newlines
  const src = content.replace(/\\n/g, '\n');

  const blockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(src)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: src.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || '', content: match[2] });
    lastIndex = blockRegex.lastIndex;
  }
  if (lastIndex < src.length) {
    parts.push({ type: 'text', content: src.slice(lastIndex) });
  }

  const counter = { current: 1 };

  return (
    <div ref={containerRef} className="markdown-body space-y-4">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          if (part.lang === 'chart') {
            return <ChartBlock key={`chart-${i}`} raw={part.content} />;
          }
          if (part.lang === 'mermaid') {
            let safeMermaidCode = part.content.replace(/\[[^\]]+,\s*\d+:\d+\]/g, '');
            safeMermaidCode = safeMermaidCode.replace(/\[\d+\]/g, '');
            return <MermaidViewer key={`mermaid-${i}`} code={safeMermaidCode} />;
          }
          if (part.lang === 'steps') {
            return <div key={`steps-${i}`}>{renderSteps(part.content, citations, onCitationClick, sources, counter)}</div>;
          }
          return (
            <GlassCard key={`code-${i}`} padding="p-4" radius="rounded-xl" className="my-4 overflow-x-auto">
              <pre className="text-xs text-primary/80 font-mono whitespace-pre-wrap">{part.content}</pre>
            </GlassCard>
          );
        } else {
          return <TextRenderer key={`text-${i}`} content={part.content} citations={citations} onCitationClick={onCitationClick} sources={sources} counter={counter} pexelsKey={pexelsKey} />;
        }
      })}
    </div>
  );
}

function MermaidViewer({ code }) {
  const [svgContent, setSvgContent] = React.useState('');
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [error, setError] = React.useState(false);
  const transformRef = React.useRef({ x: 0, y: 0, scale: 1 });
  const [transformTick, setTransformTick] = React.useState(0);
  const dragRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Helper to mutate transformRef and trigger re-render
  const applyTransform = React.useCallback((updater) => {
    transformRef.current = updater(transformRef.current);
    setTransformTick(n => n + 1);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      try {
        if (!window.mermaid) return;
        const { svg } = await window.mermaid.render(id, code);
        if (isMounted) { setSvgContent(svg); setError(false); }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (isMounted) setError(true);
      } finally {
        const tempElement = document.getElementById(id);
        if (tempElement) tempElement.remove();
      }
    };
    const checkMermaid = () => {
      if (window.mermaid) renderChart();
      else setTimeout(checkMermaid, 100);
    };
    checkMermaid();
    return () => { isMounted = false; };
  }, [code]);

  React.useEffect(() => {
    if (isZoomed) {
      transformRef.current = { x: 0, y: 0, scale: 1 };
      setTransformTick(n => n + 1);
    }
  }, [isZoomed]);

  // Wheel zoom — must be added imperatively to bypass React's passive listener
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !isZoomed) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      applyTransform(t => {
        const newScale = Math.min(5, Math.max(0.2, t.scale * delta));
        return { scale: newScale, x: t.x - cx * (delta - 1), y: t.y - cy * (delta - 1) };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isZoomed, applyTransform]);

  const handlePointerDown = React.useCallback((e) => {
    if (e.target.closest('button')) return; // let button clicks through
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = transformRef.current;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: t.x, origY: t.y };
  }, []);

  const handlePointerMove = React.useCallback((e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    applyTransform(t => ({ ...t, x: drag.origX + dx, y: drag.origY + dy }));
  }, [applyTransform]);

  const handlePointerUp = React.useCallback(() => { dragRef.current = null; }, []);

  const t = transformRef.current;

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs flex flex-col items-center justify-center w-full">
        <span className="font-bold mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Błąd składni Mermaid
        </span>
        <div className="bg-black/50 p-3 rounded text-left w-full overflow-x-auto font-mono text-[10px] text-foreground/70">
          <pre>{code}</pre>
        </div>
      </div>
    );
  }

  // Inline preview (not zoomed)
  const inlinePreview = (
    <GlassCard padding="p-0" radius="rounded-2xl" className="my-6 border-primary/20 min-h-[150px] overflow-x-auto">
      <div className="flex items-center justify-between px-3 pt-2 pb-0">
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Diagram</span>
        <GlassButton
          onClick={() => setIsZoomed(true)}
          variant="ghost"
          size="sm"
          title="Powiększ"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          Powiększ
        </GlassButton>
      </div>
      <div className="p-3">
        {!svgContent ? (
          <div className="flex flex-col items-center justify-center text-primary/50 text-sm animate-pulse gap-2 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Renderowanie wykresu...
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="flex items-center justify-center w-full [&>svg]:max-h-[360px] [&>svg]:w-full [&>svg]:h-auto"
          />
        )}
      </div>
    </GlassCard>
  );

  // Fullscreen portal (zoomed) — rendered into document.body to escape overflow:hidden parents
  const zoomedPortal = isZoomed ? ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm" onClick={() => setIsZoomed(false)} />
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="fixed inset-4 md:inset-12 z-[70] bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        {/* toolbar */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <GlassButton onClick={() => applyTransform(t => ({ ...t, scale: Math.min(5, t.scale * 1.3) }))} variant="primary" size="icon" className="w-7 h-7" title="Przybliż">+</GlassButton>
          <GlassButton onClick={() => applyTransform(t => ({ ...t, scale: Math.max(0.2, t.scale / 1.3) }))} variant="primary" size="icon" className="w-7 h-7" title="Oddal">−</GlassButton>
          <GlassButton onClick={() => applyTransform(() => ({ x: 0, y: 0, scale: 1 }))} variant="primary" size="icon" className="w-7 h-7 text-[10px]" title="Resetuj">1:1</GlassButton>
          <GlassButton onClick={() => setIsZoomed(false)} variant="primary" size="icon" title="Zamknij">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </GlassButton>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/40 pointer-events-none">
          Scroll = zoom · Przeciągnij = przesuń
        </div>
        {svgContent && (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`, transformOrigin: 'center center', transition: dragRef.current ? 'none' : 'transform 0.1s ease-out' }}
            className="flex items-center justify-center w-full h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:max-w-none [&>svg]:max-h-none"
          />
        )}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      {inlinePreview}
      {zoomedPortal}
    </>
  );
}

function renderSteps(content, citations, onCitationClick, sources, counter) {
  const stepRegex = /(?:^|\n)(\d+)\.\s+([^\n]+)([\s\S]*?)(?=(?:\n\d+\.\s+)|$)/g;
  let match;
  const steps = [];
  while ((match = stepRegex.exec(content)) !== null) {
    steps.push({ num: match[1], title: match[2].trim(), desc: match[3].trim() });
  }

  if (steps.length === 0) return <pre className="text-xs text-primary">{content}</pre>;

  return (
    <div className="relative border-l border-border/40 border-dotted ml-4 md:ml-6 my-8 space-y-8">
      {steps.map((step, i) => (
        <div key={i} className="relative pl-8">
          <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full border border-border/60 bg-background flex items-center justify-center text-[11px] font-bold text-muted-foreground shadow-inner">
            {step.num}
          </div>
          <h4 className="text-sm font-bold text-foreground mb-1.5 mt-0.5">{parseInline(step.title, citations, onCitationClick, sources, counter)}</h4>
          <div className="text-sm text-muted-foreground/90 leading-relaxed">
            <TextRenderer content={step.desc} citations={citations} onCitationClick={onCitationClick} sources={sources} counter={counter} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grouped step list — numbered cards with shared dotted connector line
function StepGroup({ steps, citations, onCitationClick, sources, counter }) {
  return (
    <div className="my-5 space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 group">
          {/* Left column: circle + connector */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
            <div className="w-8 h-8 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center text-[13px] font-bold text-primary z-10 flex-shrink-0">
              {step.num}
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 w-px border-l-2 border-dashed border-border/40 my-1" style={{ minHeight: '24px' }} />
            )}
          </div>
          {/* Right column: content card */}
          <div className={`flex-1 min-w-0 ${i < steps.length - 1 ? 'mb-3' : 'mb-1'}`}>
            <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 hover:border-primary/30 hover:bg-card/80 transition-colors">
              <h4 className="text-[13.5px] font-semibold text-foreground leading-snug break-words">
                {parseInline(step.title, citations, onCitationClick, sources, counter)}
              </h4>
              {step.subtitle && (
                <p className="text-[11px] text-primary/70 italic mt-0.5 font-medium break-words">
                  {parseInline(step.subtitle, citations, onCitationClick, sources, counter)}
                </p>
              )}
              {step.body && (
                <div className="text-[12.5px] text-foreground/70 leading-relaxed mt-2 break-words">
                  <InlineTextRenderer content={step.body} citations={citations} onCitationClick={onCitationClick} sources={sources} counter={counter} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Lightweight text renderer for step body — avoids globalCitationCount reset
function InlineTextRenderer({ content, citations, onCitationClick, sources, counter }) {
  if (!content.trim()) return null;
  // Render bullet lists and plain paragraphs inside step bodies
  const lines = content.split('\n').filter(l => l.trim());
  const isList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || !l.trim());
  if (isList && lines.length > 1) {
    return (
      <ul className="list-disc pl-4 space-y-1 mt-1">
        {lines.map((l, i) => {
          const text = l.replace(/^[\-\*]\s+/, '').trim();
          return text ? <li key={i} className="leading-relaxed">{parseInline(text, citations, onCitationClick, sources, counter)}</li> : null;
        })}
      </ul>
    );
  }
  return <p className="leading-relaxed">{parseInline(content.replace(/\n/g, ' ').trim(), citations, onCitationClick, sources, counter)}</p>;
}

// Parse a block that starts with ## N. into a step object, or return null
function parseStepBlock(block) {
  const lines = block.split('\n');
  const firstLine = lines[0].trim();
  // Match "## 1. Title" on the first line only
  const m = firstLine.match(/^##\s+(\d+)\.\s+(.+)$/);
  if (!m) return null;
  const num = m[1];
  const title = m[2].trim();
  // Second line may be *Subtitle in italics*
  let subtitle = null;
  let bodyStart = 1;
  if (lines.length > 1) {
    const second = lines[1].trim();
    const subMatch = second.match(/^\*([^*]+)\*$|^_([^_]+)_$/);
    if (subMatch) { subtitle = (subMatch[1] || subMatch[2]).trim(); bodyStart = 2; }
  }
  // Remaining lines become the body
  const bodyLines = lines.slice(bodyStart).join('\n').trim();
  return { num, title, subtitle, body: bodyLines };
}

function CalloutBox({ type, content, citations, onCitationClick, sources, counter }) {
  const styles = {
    warning:   { border: 'border-l-amber-400/60',   bg: 'bg-amber-400/[0.04]',   label: 'Uwaga',        labelColor: 'text-amber-400',   icon: 'M12 9v4M12 17h.01M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' },
    important: { border: 'border-l-red-400/60',      bg: 'bg-red-400/[0.04]',     label: 'Ważne',        labelColor: 'text-red-400',     icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 8v5M12 16h.01' },
    tip:       { border: 'border-l-emerald-400/60',  bg: 'bg-emerald-400/[0.04]', label: 'Wskazówka',    labelColor: 'text-emerald-400', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z' },
    example:   { border: 'border-l-violet-400/60',   bg: 'bg-violet-400/[0.04]',  label: 'Przykład',     labelColor: 'text-violet-400',  icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M16 13H8M16 17H8M10 9H8' },
    summary:   { border: 'border-l-primary/60',      bg: 'bg-primary/[0.04]',     label: 'Podsumowanie', labelColor: 'text-primary',     icon: 'M4 6h16M4 12h10M4 18h14' },
    remember:  { border: 'border-l-cyan-400/60',     bg: 'bg-cyan-400/[0.04]',    label: 'Pamiętaj',     labelColor: 'text-cyan-400',    icon: 'm15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-1 1M3 21l9-9M12.984 6.016a5.5 5.5 0 0 0-5.846 1.248 5.5 5.5 0 0 0 6.592 8.584' },
  };
  const s = styles[type] || styles.tip;
  return (
    <div className={`my-4.5 rounded-xl border-l-4 ${s.border} ${s.bg} px-5 py-4 shadow-sm`}>
      <div className={`flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-widest ${s.labelColor} mb-2`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
        {s.label}:
      </div>
      <div className="text-[13.5px] text-muted-foreground leading-relaxed">
        {parseInline(content, citations, onCitationClick, sources, counter)}
      </div>
    </div>
  );
}

function renderEnhancedList(items, key, citations, onCitationClick, sources, counter) {
  const parsed = items.map(item => {
    let text = item.replace(/^[\-\*]\s+/, '').trim();
    if (!text) return null;

    let isSubItem = false;
    if (/^[\*\-]\s+/.test(text)) {
      isSubItem = true;
      text = text.replace(/^[\*\-]\s+/, '').trim();
    }

    const clean = text.replace(/\*\*/g, '');
    const isHeader = clean.endsWith(':') && !isSubItem && clean.length > 2 && clean.length < 120;

    return { text, isSubItem, isHeader };
  }).filter(Boolean);

  const hasGroups = parsed.some(p => p.isHeader);
  const hasSubItems = parsed.some(p => p.isSubItem);

  if (!hasGroups && !hasSubItems) {
    return (
      <ul key={key} className="list-disc pl-5 space-y-2 my-4">
        {parsed.map((item, j) => (
          <li key={j} className="text-foreground/90 pl-1 leading-relaxed">
            {parseInline(item.text, citations, onCitationClick, sources, counter)}
          </li>
        ))}
      </ul>
    );
  }

  const sections = [];
  let current = { header: null, items: [] };
  parsed.forEach(item => {
    if (item.isHeader) {
      if (current.header !== null || current.items.length > 0) sections.push(current);
      current = { header: item.text, items: [] };
    } else {
      current.items.push(item);
    }
  });
  if (current.header !== null || current.items.length > 0) sections.push(current);

  return (
    <div key={key} className="my-4 space-y-3">
      {sections.map((section, si) => {
        if (section.header === null) {
          return (
            <div key={si} className="space-y-1.5 ml-1">
              {section.items.map((item, j) => (
                <div key={j} className={`flex items-start gap-2.5 py-0.5 ${item.isSubItem ? 'ml-4 pl-3 border-l-2 border-primary/10' : ''}`}>
                  <span className="w-[5px] h-[5px] rounded-full bg-muted-foreground/40 mt-[8px] flex-shrink-0" />
                  <span className="text-foreground/85 leading-relaxed text-sm">
                    {parseInline(item.text, citations, onCitationClick, sources, counter)}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div key={si} className="rounded-xl border border-border/30 bg-card/30 overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/15 bg-primary/[0.03]">
              <span className="w-1 h-4 rounded-full bg-primary/40 flex-shrink-0" />
              <span className="font-semibold text-foreground text-[13.5px] leading-snug">
                {parseInline(section.header, citations, onCitationClick, sources, counter)}
              </span>
            </div>
            {section.items.length > 0 && (
              <div className="px-4 py-2.5 space-y-1">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2.5 py-1 group/item">
                    <span className="w-[5px] h-[5px] rounded-full bg-primary/20 mt-[7px] flex-shrink-0 group-hover/item:bg-primary/40 transition-colors" />
                    <span className="text-foreground/75 leading-relaxed text-[13px]">
                      {parseInline(item.text, citations, onCitationClick, sources, counter)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Grupuje surowe linie listy numerowanej: linia zaczynająca się od "N. " otwiera nową
// pozycję, kolejne linie (opis w następnym wierszu, bez pustej linii między nimi — AI
// często tak pisze) doklejane są do poprzedniej pozycji zamiast stać się osobnym,
// nierozpoznanym "elementem" listy. Bez tego dwuliniowa pozycja rozpadała się na
// pojedynczy, jednoelementowy <ol> (natywnie zawsze pokazujący "1.", bo licznik HTML-a
// liczy pozycję w DOM, nie cyfrę z tekstu) i traciła treść opisu.
function groupNumberedLines(lines) {
  const items = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d+\.\s/.test(line)) {
      items.push(line);
    } else if (items.length > 0) {
      items[items.length - 1] += ' ' + line;
    } else {
      items.push(line);
    }
  }
  return items;
}

function renderEnhancedNumberedList(items, key, citations, onCitationClick, sources, counter) {
  const parsed = items.map(item => {
    const m = item.match(/^(\d+)\.\s+(.*)/);
    if (!m) return null;
    const num = m[1];
    let text = m[2].trim();
    const clean = text.replace(/\*\*/g, '');
    const colonIdx = clean.indexOf(':');
    const dashIdx = clean.indexOf(' – ');
    const splitIdx = colonIdx > 2 && colonIdx < 60 ? colonIdx : (dashIdx > 2 && dashIdx < 60 ? dashIdx : -1);
    let title = null;
    let desc = null;
    if (splitIdx > 0) {
      title = text.slice(0, splitIdx).trim();
      desc = text.slice(splitIdx + (text[splitIdx] === ':' ? 1 : 3)).trim();
    }
    return { num, text, title, desc };
  }).filter(Boolean);

  const hasTitles = parsed.filter(p => p.title).length >= Math.ceil(parsed.length * 0.6);

  if (!hasTitles || parsed.length < 3) {
    return (
      <ol key={key} className="list-decimal pl-5 space-y-2.5 my-4 text-primary/70 font-medium marker:text-primary">
        {parsed.map((item, j) => (
          <li key={j} className="text-foreground/90 pl-1 font-normal leading-relaxed">
            {parseInline(item.text, citations, onCitationClick, sources, counter)}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div key={key} className="my-4 space-y-2">
      {parsed.map((item, j) => (
        <div key={j} className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-card/40 border border-border/20 hover:border-primary/15 transition-colors">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5 border border-primary/20">
            {item.num}
          </span>
          <div className="min-w-0 flex-1">
            {item.title ? (
              <>
                <span className="text-[13px] font-medium text-foreground leading-snug">
                  {parseInline(item.title, citations, onCitationClick, sources, counter)}
                </span>
                {item.desc && (
                  <p className="text-[12.5px] text-foreground/60 leading-relaxed mt-0.5">
                    {parseInline(item.desc, citations, onCitationClick, sources, counter)}
                  </p>
                )}
              </>
            ) : (
              <span className="text-[13px] text-foreground/85 leading-relaxed">
                {parseInline(item.text, citations, onCitationClick, sources, counter)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TextRenderer({ content, citations, onCitationClick, sources, counter, pexelsKey }) {
  if (!content.trim()) return null;

  // Merge consecutive list items separated by blank lines into a single block.
  // AI often emits "- item\n\n- item\n\n- item" which otherwise renders as 3 separate 1-item lists.
  const splitBlocks = content.split('\n\n');

  // Merge blocks that have unclosed [ brackets — AI sometimes splits citations across paragraphs.
  const rawBlocks = [];
  for (const b of splitBlocks) {
    if (rawBlocks.length > 0) {
      const prev = rawBlocks[rawBlocks.length - 1];
      const opens = (prev.match(/\[/g) || []).length;
      const closes = (prev.match(/\]/g) || []).length;
      if (opens > closes) {
        rawBlocks[rawBlocks.length - 1] = prev + ' ' + b.trim();
        continue;
      }
    }
    rawBlocks.push(b);
  }

  const blocks = [];
  let listAcc = null; // 'ul' | 'ol' | null
  for (const b of rawBlocks) {
    const t = b.trim();
    // Sprawdzamy tylko pierwszą linię: gdy pozycja listy ma opis w kolejnej linii
    // (bez pustej linii między nimi, np. "1. Tytuł\n   Opis..."), reszta bloku to
    // kontynuacja tej samej pozycji, nie osobne linie do walidacji jako markery listy.
    const firstLine = t.split('\n')[0].trim();
    const isUl = /^[\-\*]\s+/.test(firstLine);
    const isOl = /^\d+\.\s/.test(firstLine);
    const kind = isUl ? 'ul' : isOl ? 'ol' : null;
    if (kind && listAcc === kind) {
      blocks[blocks.length - 1] = blocks[blocks.length - 1] + '\n' + t;
    } else {
      if (kind) listAcc = kind; else listAcc = null;
      blocks.push(b);
    }
  }

  const localCounter = counter || { current: 1 };

  const renderedBlocks = [];
  let i = 0;

  const flushStepGroup = (steps, key) => {
    if (steps.length === 0) return;
    renderedBlocks.push(
      <StepGroup key={`steps-${key}`} steps={steps} citations={citations} onCitationClick={onCitationClick} sources={sources} counter={localCounter} />
    );
  };

  let pendingSteps = [];

  while (i < blocks.length) {
    const trimmed = blocks[i].trim();
    if (!trimmed) { i++; continue; }

    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(search:([^)]+)\)$/);
    if (imgMatch) {
      if (pendingSteps.length > 0) { flushStepGroup(pendingSteps, i); pendingSteps = []; }
      renderedBlocks.push(<InlineImage key={`img-${i}`} alt={imgMatch[1]} query={imgMatch[2]} pexelsKey={pexelsKey} />);
      i++; continue;
    }

    // Try to parse as a step heading
    const step = parseStepBlock(trimmed);
    if (step) {
      // If body is empty, check if the NEXT block is a body paragraph (not another step / heading)
      if (!step.body && i + 1 < blocks.length) {
        const next = blocks[i + 1].trim();
        const nextStep = parseStepBlock(next);
        if (!nextStep && !next.startsWith('#')) {
          step.body = next;
          i++;
        }
      }
      pendingSteps.push(step);
      i++;
      continue;
    }

    // Non-step block — flush any accumulated steps first
    if (pendingSteps.length > 0) {
      flushStepGroup(pendingSteps, i);
      pendingSteps = [];
    }

    {
      const headingMatch = trimmed.match(/^(#{1,6})\s+/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const hLines = trimmed.split('\n');
        const headingText = hLines[0].slice(headingMatch[0].length);
        const rest = hLines.length > 1 ? hLines.slice(1).join('\n').trim() : '';
        const hClasses = [
          '', '',
          'text-lg font-bold text-foreground mt-2 mb-4 font-heading',
          'text-base font-bold text-foreground mt-6 mb-3 font-heading',
          'text-[15px] font-bold text-foreground mt-5 mb-2 font-heading',
          'text-[14px] font-bold text-foreground mt-4 mb-1.5 font-heading',
          'text-[13px] font-bold text-foreground/90 mt-3 mb-1.5 font-heading',
          'text-xs font-bold text-foreground/80 mt-3 mb-1 font-heading',
        ];
        const Tag = `h${Math.min(level + 1, 6)}`;
        renderedBlocks.push(<Tag key={`h-${i}`} className={hClasses[level] || hClasses[4]}>{parseInline(headingText, citations, onCitationClick, sources, localCounter)}</Tag>);
        if (rest) blocks.splice(i + 1, 0, rest);
        i++; continue;
      }
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n');
      renderedBlocks.push(renderEnhancedList(items, i, citations, onCitationClick, sources, localCounter));
      i++; continue;
    }

    {
      const lines = trimmed.split('\n');
      const firstListIdx = lines.findIndex(l => /^[\-\*]\s+/.test(l.trim()));
      if (firstListIdx > 0 && lines.slice(firstListIdx).every(l => /^[\-\*]\s+/.test(l.trim()) || !l.trim())) {
        const introText = lines.slice(0, firstListIdx).join(' ').trim();
        const listItems = lines.slice(firstListIdx);
        if (introText) {
          renderedBlocks.push(<p key={`${i}-intro`} className="text-foreground/85 leading-relaxed my-3">{parseInline(introText, citations, onCitationClick, sources, localCounter)}</p>);
        }
        renderedBlocks.push(renderEnhancedList(listItems, i, citations, onCitationClick, sources, localCounter));
        i++; continue;
      }
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = groupNumberedLines(trimmed.split('\n'));
      renderedBlocks.push(renderEnhancedNumberedList(items, i, citations, onCitationClick, sources, localCounter));
      i++; continue;
    }

    {
      const lines = trimmed.split('\n');
      const firstNumIdx = lines.findIndex(l => /^\d+\.\s/.test(l.trim()));
      if (firstNumIdx > 0) {
        const introText = lines.slice(0, firstNumIdx).join(' ').trim();
        const listItems = groupNumberedLines(lines.slice(firstNumIdx));
        if (introText) {
          renderedBlocks.push(<p key={`${i}-intro`} className="text-foreground/85 leading-relaxed my-3">{parseInline(introText, citations, onCitationClick, sources, localCounter)}</p>);
        }
        renderedBlocks.push(renderEnhancedNumberedList(listItems, i, citations, onCitationClick, sources, localCounter));
        i++; continue;
      }
    }

    if (trimmed.startsWith('> ')) {
      renderedBlocks.push(
        <div key={i} className="border-l-2 border-primary/50 pl-4 py-1 my-4 bg-primary/5 rounded-r-lg italic text-muted-foreground">
          {parseInline(trimmed.replace(/^>\s+/gm, ''), citations, onCitationClick, sources, localCounter)}
        </div>
      );
      i++; continue;
    }

    // Markdown table
    if (trimmed.includes('|') && trimmed.split('\n')[0].includes('|')) {
      const rawRows = trimmed.split('\n').filter(r => r.trim());

      // Scal wiersze z niezamkniętym '[' — AI czasem rozbija cytaty na kolejne linie
      const mergedRows = [];
      for (const row of rawRows) {
        if (mergedRows.length > 0) {
          const prev = mergedRows[mergedRows.length - 1];
          const opens  = (prev.match(/\[/g) || []).length;
          const closes = (prev.match(/\]/g) || []).length;
          if (opens > closes) { mergedRows[mergedRows.length - 1] = prev + ' ' + row.trim(); continue; }
        }
        mergedRows.push(row);
      }

      // Parsuj komórki zachowując puste (nie filter(Boolean))
      const parseCells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

      const headers  = parseCells(mergedRows[0]).filter(Boolean); // header nigdy nie ma pustych
      const dataRows = mergedRows.slice(2).map(r => {
        const cells = parseCells(r);
        // Wyrównaj do liczby kolumn headera
        while (cells.length < headers.length) cells.push('');
        return cells.slice(0, headers.length);
      });

      if (headers.length > 0 && dataRows.length > 0) {
        renderedBlocks.push(
          <div key={i} className="my-4 overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {headers.map((h, j) => <th key={j} className="text-left px-3 py-2 font-semibold text-foreground/70">{parseInline(h, citations, onCitationClick, sources, localCounter)}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, j) => (
                  <tr key={j} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    {row.map((cell, k) => <td key={k} className="px-3 py-2 text-foreground/85 align-top">{parseInline(cell, citations, onCitationClick, sources, localCounter)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        i++; continue;
      }
    }

    if (/^(Poprawna odpowiedź|ODPOWIEDŹ)\s*:/i.test(trimmed)) {
      const label = /^Poprawna/i.test(trimmed) ? 'Pokaż poprawną odpowiedź' : 'Pokaż odpowiedź';
      renderedBlocks.push(
        <RevealBlock key={`reveal-${i}`} label={label}>
          {parseInline(trimmed, citations, onCitationClick, sources, localCounter)}
        </RevealBlock>
      );
      i++; continue;
    }

    {
      const lines = trimmed.split('\n');
      const hasInlineImg = lines.some(l => /^!\[([^\]]*)\]\(search:([^)]+)\)$/.test(l.trim()));
      if (hasInlineImg) {
        let textAcc = [];
        const flushText = (key) => {
          if (textAcc.length === 0) return;
          const joined = textAcc.join(' ').trim();
          if (joined) renderedBlocks.push(<p key={key} className="text-foreground/85 leading-relaxed my-3">{parseInline(joined, citations, onCitationClick, sources, localCounter)}</p>);
          textAcc = [];
        };
        lines.forEach((line, li) => {
          const m = line.trim().match(/^!\[([^\]]*)\]\(search:([^)]+)\)$/);
          if (m) {
            flushText(`${i}-p-${li}`);
            renderedBlocks.push(<InlineImage key={`${i}-img-${li}`} alt={m[1]} query={m[2]} pexelsKey={pexelsKey} />);
          } else {
            textAcc.push(line);
          }
        });
        flushText(`${i}-p-end`);
        i++; continue;
      }
    }
    if (/^[-*_]{3,}\s*$/.test(trimmed)) {
      renderedBlocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-border/30" />);
      i++; continue;
    }

    {
      const calloutMatch = trimmed.match(/^(UWAGA|Uwaga|WAŻNE|Ważne|Wskazówka|WSKAZÓWKA|Przykład|PRZYKŁAD|Podsumowanie|PODSUMOWANIE|Pamiętaj|PAMIĘTAJ|Zasada|ZASADA|Pro tip|PRO TIP|Nota|NOTA)\s*[:\-–—]\s*([\s\S]*)/i);
      if (calloutMatch) {
        const keyword = calloutMatch[1].toLowerCase();
        const calloutContent = calloutMatch[2].trim();
        let type = 'tip';
        if (/uwag|nota/.test(keyword)) type = 'warning';
        else if (/waż/.test(keyword)) type = 'important';
        else if (/wskaz|pro tip/.test(keyword)) type = 'tip';
        else if (/przykł/.test(keyword)) type = 'example';
        else if (/podsum/.test(keyword)) type = 'summary';
        else if (/pamięt|zasad/.test(keyword)) type = 'remember';
        renderedBlocks.push(
          <CalloutBox key={`callout-${i}`} type={type} content={calloutContent} citations={citations} onCitationClick={onCitationClick} sources={sources} counter={localCounter} />
        );
        i++; continue;
      }
    }

    renderedBlocks.push(<p key={i} className="text-foreground/85 leading-relaxed my-3">{parseInline(trimmed, citations, onCitationClick, sources, localCounter)}</p>);
    i++;
  }

  // Flush any remaining steps at end of content
  if (pendingSteps.length > 0) flushStepGroup(pendingSteps, 'end');

  return <>{renderedBlocks}</>;
}

function parseInline(text, citations = [], onCitationClick, sources = [], counter) {
  const localCounter = counter || { current: 1 };

  // Split on markdown links [text](url) first so they don't get mangled by other passes
  const linkSegments = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let lm; let lLast = 0;
  while ((lm = linkRegex.exec(text)) !== null) {
    if (lm.index > lLast) linkSegments.push({ type: 'text', value: text.slice(lLast, lm.index) });
    linkSegments.push({ type: 'link', label: lm[1], href: lm[2] });
    lLast = linkRegex.lastIndex;
  }
  if (lLast < text.length) linkSegments.push({ type: 'text', value: text.slice(lLast) });

  const renderSegment = (seg, idx) => {
    if (seg.type === 'link') {
      return (
        <a key={`link-${idx}`} href={seg.href} target="_blank" rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
          {seg.label}
        </a>
      );
    }
    return renderInlineText(seg.value, idx, citations, onCitationClick, sources, localCounter);
  };

  if (linkSegments.length === 1 && linkSegments[0].type === 'text') {
    return renderInlineText(text, 0, citations, onCitationClick, sources, localCounter);
  }
  return linkSegments.map(renderSegment);
}

function renderInlineText(text, keyPrefix, citations = [], onCitationClick, sources = [], localCounter) {
  let parts = text.split(/(\*\*.*?\*\*)/g);
  let elements = parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });

  let newElements = [];
  elements.forEach((el, index) => {
    if (typeof el === 'string') {
      const subParts = el.split(/(\*.*?\*)/g);
      subParts.forEach((sp, j) => {
        if (sp.startsWith('*') && sp.endsWith('*') && sp.length > 2) {
          newElements.push(<em key={`${index}-${j}`} className="italic opacity-80">{sp.slice(1, -1)}</em>);
        } else {
          newElements.push(sp);
        }
      });
    } else {
      newElements.push(el);
    }
  });

  let finalElements = [];
  newElements.forEach((el, index) => {
    if (typeof el === 'string') {
      const subParts = el.split(/(`.*?`)/g);
      subParts.forEach((sp, j) => {
        if (sp.startsWith('`') && sp.endsWith('`') && sp.length > 2) {
          finalElements.push(<code key={`code-${index}-${j}`} className="bg-muted/50 text-primary px-1.5 py-0.5 rounded text-[11px] font-mono">{sp.slice(1, -1)}</code>);
        } else {
          finalElements.push(sp);
        }
      });
    } else {
      finalElements.push(el);
    }
  });

  let citedElements = [];
  finalElements.forEach((el, index) => {
    if (typeof el === 'string') {
      // Strip citation fragments: unclosed [ at end, orphaned ] at start (no matching [)
      const cleanEl = el
        .replace(/\s*\[(?![^\]]*\])[^\[]*$/, '')
        .replace(/^([^\[]*)\]/, '$1');
      const citationRegex = /(\[[^\]]+\])/g;
      const subParts = cleanEl.split(citationRegex);
      subParts.forEach((sp, j) => {
        if (sp.startsWith('[') && sp.endsWith(']')) {
          const inner = sp.slice(1, -1).trim();
          if (!inner.includes('http')) {
            const isPureNumber = /^\d+$/.test(inner);
            let num = isPureNumber ? parseInt(inner, 10) : localCounter.current++;
            let matchedCitation = null;

            if (isPureNumber && num > 0) {
              // 1. Try citations array at index num - 1
              if (Array.isArray(citations) && num <= citations.length) {
                matchedCitation = citations[num - 1];
              }
              // 2. Fallback to sources array at index num - 1 if citation is missing or uninformative
              if (!matchedCitation || (matchedCitation.quote?.includes('Brak dokładnych danych') && !matchedCitation.timeStr)) {
                if (Array.isArray(sources) && num <= sources.length) {
                  const s = sources[num - 1];
                  if (s) {
                    matchedCitation = {
                      quote: (s.rawText || s.title || '').slice(0, 150),
                      sourceTitle: s.title,
                      sourceId: s.videoId || s.id,
                      timeStr: ''
                    };
                  }
                }
              }
            } else {
              // Non-numeric citation tag (e.g. [Nazwa źródła, 02:15] or [sheet.html, Wiersz 118])
              if (Array.isArray(citations) && citations.length > 0) {
                matchedCitation = citations.find(c =>
                  (c.timeStr && inner.includes(c.timeStr)) ||
                  (c.sourceTitle && inner.toLowerCase().includes(c.sourceTitle.toLowerCase())) ||
                  (c.sourceId && inner.includes(c.sourceId))
                );
                if (!matchedCitation) {
                  matchedCitation = citations.find(c => inner.includes(c.timeSeconds?.toString()));
                }
              }
            }

            if (!matchedCitation) {
              const parts = inner.split(',');
              if (parts.length >= 2) {
                const title = parts[0].trim();
                const time = parts.slice(1).join(',').trim();
                let timeSeconds;
                const timeMatch = time.match(/(\d+):(\d+)/);
                if (timeMatch) timeSeconds = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);

                let sourceId = null;
                let recoveredQuote = "AI nie przekazało dokładnego cytatu, ale odwołuje się do tego momentu w materiale.";
                const cleanTitle = title.replace(/\.\.\.$/, '').trim().toLowerCase();
                
                let matchedSource = null;
                const indexMatch = cleanTitle.match(/^(?:źródło|zródło|source)?\s*(\d+)$/i);
                if (indexMatch) {
                  const idx = parseInt(indexMatch[1], 10) - 1;
                  if (idx >= 0 && Array.isArray(sources) && idx < sources.length) {
                    matchedSource = sources[idx];
                  }
                }
                
                if (!matchedSource && Array.isArray(sources)) {
                  matchedSource = sources.find(s => s.title && s.title.toLowerCase().includes(cleanTitle));
                }
                if (!matchedSource && Array.isArray(sources) && sources.length === 1) matchedSource = sources[0];

                if (matchedSource) {
                  sourceId = matchedSource.videoId || matchedSource.id;
                  if (timeSeconds !== undefined && matchedSource.transcript) {
                    let bestIdx = -1, minDiff = Infinity;
                    for (let k = 0; k < matchedSource.transcript.length; k++) {
                      const diff = Math.abs(matchedSource.transcript[k].start - timeSeconds);
                      if (diff < minDiff) { minDiff = diff; bestIdx = k; }
                    }
                    if (bestIdx !== -1 && minDiff <= 30) {
                      const endIdx = Math.min(matchedSource.transcript.length, bestIdx + 2);
                      let combinedText = matchedSource.transcript.slice(bestIdx, endIdx).map(s => s.text).join(' ').trim();
                      if (combinedText.length > 200) combinedText = combinedText.substring(0, 197).trim() + "...";
                      recoveredQuote = `"${combinedText}"`;
                    }
                  }
                }
                matchedCitation = { quote: recoveredQuote, sourceTitle: matchedSource ? matchedSource.title : title, timeStr: time, timeSeconds, sourceId };
              } else {
                matchedCitation = { quote: "Brak dokładnych danych o cytacie z API.", sourceTitle: inner || 'Zewnętrzna wiedza', timeStr: '' };
              }
            }

            const isUseless = matchedCitation.quote?.includes('Brak dokładnych danych') && !matchedCitation.timeStr && !matchedCitation.timeSeconds;
            if (!isUseless) {
              // Deskryptor, nie gotowy JSX — pozwala grupowaniu niżej (scalanie sąsiednich
              // cytatów typu "[172], [173], [174]" w jedną zwartą pigułkę) zajrzeć w numer
              // i źródło, zanim zdecydujemy jak to wyrenderować.
              citedElements.push({ __citation: true, num, matchedCitation, keyBase: `cite-${index}-${j}` });
            }
          } else {
            citedElements.push(sp);
          }
        } else {
          citedElements.push(sp);
        }
      });
    } else {
      citedElements.push(el);
    }
  });

  // Scala sąsiednie cytaty ("[172], [173], [174]" albo "[172][173]") w jedną zwartą
  // pigułkę zamiast trzech osobnych obok siebie — to one zaśmiecały zdania przy gęstym
  // cytowaniu. Kliknięcie w grupę otwiera podgląd pierwszego źródła z niej.
  const isSeparator = (el) => typeof el === 'string' && /^\s*,\s*$/.test(el);
  const groupedElements = [];
  for (let k = 0; k < citedElements.length; k++) {
    const el = citedElements[k];
    if (el && el.__citation) {
      const run = [el];
      let n = k + 1;
      while (
        n < citedElements.length &&
        ((citedElements[n] && citedElements[n].__citation) ||
          (isSeparator(citedElements[n]) && citedElements[n + 1] && citedElements[n + 1].__citation))
      ) {
        if (citedElements[n].__citation) run.push(citedElements[n]);
        n++;
      }
      k = n - 1;
      if (run.length === 1) {
        const { num, matchedCitation, keyBase } = run[0];
        groupedElements.push(
          <button
            key={keyBase}
            onClick={(e) => {
              if (onCitationClick) {
                const r = e.currentTarget.getBoundingClientRect();
                onCitationClick(matchedCitation, { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom, num });
              }
            }}
            className="inline-flex items-center justify-center min-w-[16px] px-1 h-4 mx-0.5 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold transition-colors cursor-pointer align-super"
            title={`Źródło: ${matchedCitation.sourceTitle}`}
          >
            {num}
          </button>
        );
      } else {
        const label = run.length > 3 ? `${run[0].num}+${run.length - 1}` : run.map(r => r.num).join(',');
        groupedElements.push(
          <button
            key={`${run[0].keyBase}-group`}
            onClick={(e) => {
              if (onCitationClick) {
                const r = e.currentTarget.getBoundingClientRect();
                onCitationClick(run[0].matchedCitation, { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom, num: run[0].num });
              }
            }}
            className="inline-flex items-center justify-center min-w-[16px] px-1.5 h-4 mx-0.5 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold transition-colors cursor-pointer align-super"
            title={`${run.length} źródła: ${run.map(r => r.matchedCitation.sourceTitle).join(', ')}`}
          >
            {label}
          </button>
        );
      }
    } else {
      groupedElements.push(el);
    }
  }
  citedElements = groupedElements;

  let brElements = [];
  citedElements.forEach((el, index) => {
    if (typeof el === 'string' && /<br\s*\/?>/i.test(el)) {
      const segs = el.split(/<br\s*\/?>/i);
      segs.forEach((seg, j) => {
        if (seg) brElements.push(seg);
        if (j < segs.length - 1) brElements.push(<br key={`br-${index}-${j}`} />);
      });
    } else {
      brElements.push(el);
    }
  });

  return brElements;
}
