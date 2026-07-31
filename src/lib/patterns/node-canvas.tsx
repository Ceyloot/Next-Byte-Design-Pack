import { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface NodeField {
  label: string;
  value?: string;
  type?: 'select' | 'text' | 'badge';
}

export interface WorkflowNode {
  id: string;
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  fields?: NodeField[];
  accentColor?: string;
  completed?: boolean;
  width?: number;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  fromSide?: 'right' | 'bottom' | 'top' | 'left';
  toSide?: 'left' | 'right' | 'top' | 'bottom';
  color?: string;
}

export interface CanvasCategory {
  icon?: ReactNode;
  label: string;
  description?: string;
}

export interface NodeCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  canvasHeight?: number;
  sidePanel?: boolean;
  categories?: CanvasCategory[];
  toolbar?: ReactNode;
  onNodeClick?: (nodeId: string) => void;
  glass?: boolean;
  className?: string;
}

// ── Layout helpers ─────────────────────────────────────────────────────────

const NODE_W = 180;
const HEADER_H = 50;
const FIELD_H = 36;
const PAD_B = 10;

function nodeH(n: WorkflowNode) {
  return HEADER_H + (n.fields?.length ?? 0) * FIELD_H + PAD_B;
}

function portXY(n: WorkflowNode, side: string) {
  const w = n.width ?? NODE_W;
  const h = nodeH(n);
  if (side === 'right')  return { x: n.x + w,    y: n.y + HEADER_H / 2 };
  if (side === 'left')   return { x: n.x,          y: n.y + HEADER_H / 2 };
  if (side === 'bottom') return { x: n.x + w / 2,  y: n.y + h };
  return                        { x: n.x + w / 2,  y: n.y };
}

function bezier(x1: number, y1: number, x2: number, y2: number, fs: string, ts: string) {
  const d = Math.max(60, Math.abs(x2 - x1) * 0.45);
  const cx1 = fs === 'right' ? x1 + d : fs === 'left' ? x1 - d : x1;
  const cy1 = fs === 'bottom' ? y1 + d : fs === 'top' ? y1 - d : y1;
  const cx2 = ts === 'left' ? x2 - d : ts === 'right' ? x2 + d : x2;
  const cy2 = ts === 'top' ? y2 - d : ts === 'bottom' ? y2 + d : y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

// ── Node card ──────────────────────────────────────────────────────────────

function NodeCard({ node, active, glass, onClick }: {
  node: WorkflowNode;
  active: boolean;
  glass?: boolean;
  onClick?: () => void;
}) {
  const w = node.width ?? NODE_W;

  return (
    <div
      onClick={onClick}
      className={cn(
        'absolute rounded-xl border overflow-hidden cursor-pointer select-none',
        'transition-all duration-200',
        glass ? 'nb-glass-static' : 'bg-card',
        active
          ? 'ring-1 ring-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
          : 'hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
      )}
      style={{
        left: node.x,
        top: node.y,
        width: w,
        borderColor: node.accentColor
          ? node.accentColor + '66'
          : active ? 'hsl(var(--primary)/0.4)' : 'hsl(var(--border)/0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border/25">
        {node.icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[13px]"
            style={{
              background: node.accentColor ?? 'hsl(var(--primary)/0.15)',
              color: node.accentColor ? '#fff' : 'hsl(var(--primary))',
            }}
          >
            {node.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate leading-tight">{node.title}</p>
          {node.subtitle && (
            <p className="text-[9px] text-muted-foreground/60 truncate">{node.subtitle}</p>
          )}
        </div>
        {node.completed && (
          <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
            <span className="text-[7px] text-primary font-bold">✓</span>
          </div>
        )}
      </div>

      {/* Fields */}
      {node.fields?.map((f, i) => (
        <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/10 last:border-0">
          <span className="text-[9px] text-muted-foreground/60 shrink-0">{f.label}</span>
          {f.value && (
            f.type === 'select' ? (
              <div className="flex items-center gap-1 bg-muted/40 border border-border/20 rounded-md px-1.5 py-0.5 max-w-[106px]">
                <span className="text-[9px] text-foreground/80 truncate">{f.value}</span>
                <span className="text-[7px] text-muted-foreground shrink-0">▾</span>
              </div>
            ) : (
              <span className="text-[9px] text-foreground/60 truncate max-w-[106px]">{f.value}</span>
            )
          )}
        </div>
      ))}
    </div>
  );
}

// ── Dot-grid background ────────────────────────────────────────────────────

function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }}>
      <defs>
        <pattern id="nc-dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="hsl(var(--muted-foreground))" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nc-dotgrid)" />
    </svg>
  );
}

// ── Animated edge ──────────────────────────────────────────────────────────

function AnimatedEdge({ d, color, label, fp, tp }: {
  d: string;
  color: string;
  label?: string;
  fp: { x: number; y: number };
  tp: { x: number; y: number };
}) {
  const edgeId = `edge-${Math.abs(fp.x + fp.y + tp.x + tp.y) | 0}`;
  return (
    <g>
      {/* Outer glow — pulsing */}
      <path d={d} fill="none" stroke={color} strokeWidth={8} strokeOpacity={0.07}
        style={{ filter: 'blur(4px)' }}>
        <animate attributeName="stroke-opacity" values="0.04;0.14;0.04" dur="2.4s" repeatCount="indefinite" />
      </path>
      {/* Glow ring */}
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeOpacity={0.18}
        style={{ filter: 'blur(2px)' }} />
      {/* Main static line */}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.55} />
      {/* Animated flow — dashes marching */}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.9}
        strokeDasharray="6 8">
        <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
      {/* Port circles */}
      <circle cx={fp.x} cy={fp.y} r={4} fill="transparent" stroke={color} strokeWidth={1.5} opacity={0.7} />
      <circle cx={tp.x} cy={tp.y} r={4} fill="transparent" stroke={color} strokeWidth={1.5} opacity={0.7} />
      {/* Travelling dot */}
      <circle r="3" fill={color} opacity={0.9}>
        <animateMotion dur="1.8s" repeatCount="indefinite" path={d} />
      </circle>
      {/* Label */}
      {label && (
        <text
          x={(fp.x + tp.x) / 2}
          y={(fp.y + tp.y) / 2 - 7}
          textAnchor="middle"
          fontSize="8"
          fill="hsl(var(--muted-foreground))"
          opacity={0.6}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function NodeCanvas({
  nodes,
  edges,
  canvasHeight = 420,
  sidePanel = false,
  categories = [],
  toolbar,
  onNodeClick,
  glass,
  className,
}: NodeCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const svgW = Math.max(...nodes.map(n => n.x + (n.width ?? NODE_W))) + 80;
  const svgH = Math.max(...nodes.map(n => n.y + nodeH(n))) + 80;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.nc-node')) return;
    dragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPan({
      x: dragOrigin.current.px + e.clientX - dragOrigin.current.mx,
      y: dragOrigin.current.py + e.clientY - dragOrigin.current.my,
    });
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const handleNodeClick = (id: string) => {
    setActiveId(p => p === id ? null : id);
    onNodeClick?.(id);
  };

  return (
    <div
      className={cn('flex rounded-2xl border border-border/40 overflow-hidden', className)}
      style={{ height: canvasHeight }}
    >
      {/* Canvas */}
      <div
        className={cn(
          'relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing',
          glass ? 'bg-background/30' : 'bg-background/70',
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <DotGrid />

        {/* Panning container */}
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* SVG edges */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgW} height={svgH}
            style={{ minWidth: svgW, minHeight: svgH, overflow: 'visible' }}
          >
            <defs>
              <filter id="nc-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            {edges.map(edge => {
              const src = nodeMap[edge.from];
              const tgt = nodeMap[edge.to];
              if (!src || !tgt) return null;
              const fs = edge.fromSide ?? 'right';
              const ts = edge.toSide ?? 'left';
              const fp = portXY(src, fs);
              const tp = portXY(tgt, ts);
              const path = bezier(fp.x, fp.y, tp.x, tp.y, fs, ts);
              const col = edge.color ?? 'hsl(var(--primary))';
              return (
                <AnimatedEdge key={edge.id} d={path} color={col} label={edge.label} fp={fp} tp={tp} />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="relative" style={{ width: svgW, height: svgH }}>
            {nodes.map(node => (
              <div key={node.id} className="nc-node">
                <NodeCard
                  node={node}
                  glass={glass}
                  active={activeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        {toolbar && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            {toolbar}
          </div>
        )}

        {/* Drag hint */}
        <div className="absolute bottom-2 right-3 text-[9px] text-muted-foreground/30 select-none pointer-events-none">
          przeciągnij aby przesunąć
        </div>
      </div>

      {/* Side panel */}
      {sidePanel && (
        <div className={cn(
          'w-44 border-l border-border/40 flex flex-col shrink-0',
          glass ? 'bg-background/20 backdrop-blur-xl' : 'bg-card/90',
        )}>
          <div className="p-3 border-b border-border/30">
            <p className="text-[10px] font-bold text-foreground mb-2">Co dalej?</p>
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2 py-1.5',
              glass ? 'border-white/10 bg-white/5' : 'border-border/40 bg-background/40',
            )}>
              <Search className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              <span className="text-[9px] text-muted-foreground/40">Szukaj nodów...</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2.5 border-b border-border/15 hover:bg-primary/5 cursor-pointer transition-colors last:border-0"
              >
                {cat.icon && (
                  <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-muted/40 mt-0.5 text-[11px]">
                    {cat.icon}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-foreground leading-tight">{cat.label}</p>
                  {cat.description && (
                    <p className="text-[8px] text-muted-foreground/55 leading-snug mt-0.5 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
