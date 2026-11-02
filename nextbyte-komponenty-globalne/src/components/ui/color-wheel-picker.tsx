import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pipette } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ColorWheelPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#70BEFA', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981',
  '#ef4444', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
  '#a855f7', '#3b82f6', '#84cc16', '#e11d48', '#0ea5e9',
];

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  value,
  onChange,
  className,
  presets = DEFAULT_PRESETS,
}) => {
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(value || '#8b5cf6'));
  const [hexInput, setHexInput] = useState(value || '#8b5cf6');
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const isMobile = useIsMobile();

  const WHEEL_SIZE = isMobile ? 140 : 180;
  const RING_WIDTH = isMobile ? 22 : 28;
  const CENTER = WHEEL_SIZE / 2;
  const OUTER_R = CENTER - 2;
  const INNER_R = OUTER_R - RING_WIDTH;

  // Draw the color wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    // Draw color ring
    for (let angle = 0; angle < 360; angle += 0.5) {
      const startAngle = ((angle - 0.5) * Math.PI) / 180;
      const endAngle = ((angle + 0.5) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, OUTER_R, startAngle, endAngle);
      ctx.arc(CENTER, CENTER, INNER_R, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, ${hsl[1]}%, ${hsl[2]}%)`;
      ctx.fill();
    }

    // Inner circle preview
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, INNER_R - 8, 0, Math.PI * 2);
    ctx.fillStyle = hslToHex(hsl[0], hsl[1], hsl[2]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsl]);

  // Thumb position on the ring
  const getThumbPos = useCallback(() => {
    const midR = (OUTER_R + INNER_R) / 2;
    const rad = hsl[0] * (Math.PI / 180);
    return {
      x: CENTER + midR * Math.cos(rad),
      y: CENTER + midR * Math.sin(rad),
    };
  }, [hsl]);

  const updateFromPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;
    const dist = Math.sqrt(x * x + y * y);
    
    if (dist < INNER_R - 8 || dist > OUTER_R + 4) return;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const newHsl: [number, number, number] = [Math.round(angle), hsl[1], hsl[2]];
    setHsl(newHsl);
    const hex = hslToHex(newHsl[0], newHsl[1], newHsl[2]);
    setHexInput(hex);
    onChange(hex);
  }, [hsl, onChange, CENTER, INNER_R, OUTER_R]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    activePointerId.current = e.pointerId;
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateFromPoint(e.clientX, e.clientY);
  };

  const endPointerInteraction = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = false;
    activePointerId.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    const handlePointerUp = () => {
      isDragging.current = false;
      activePointerId.current = null;
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const updateSlider = (type: 's' | 'l', val: number) => {
    const newHsl: [number, number, number] = type === 's' ? [hsl[0], val, hsl[2]] : [hsl[0], hsl[1], val];
    setHsl(newHsl);
    const hex = hslToHex(newHsl[0], newHsl[1], newHsl[2]);
    setHexInput(hex);
    onChange(hex);
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      setHsl(hexToHsl(raw));
      onChange(raw);
    }
  };

  // Sync external value changes
  useEffect(() => {
    if (value && /^#[0-9a-fA-F]{6}$/.test(value)) {
      setHsl(hexToHsl(value));
      setHexInput(value);
    }
  }, [value]);

  const thumb = getThumbPos();

  return (
    <div className={cn('flex flex-col items-center gap-4 p-4 rounded-2xl nb-szklo nb-szklo-plynne border border-border/40 touch-auto select-none', className)}>
      {/* Wheel */}
      <div className="relative touch-none" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        <canvas
          ref={wheelRef}
          style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointerInteraction}
          onPointerCancel={endPointerInteraction}
        />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg shadow-black/40 pointer-events-none"
          style={{
            left: thumb.x - 10,
            top: thumb.y - 10,
            backgroundColor: hslToHex(hsl[0], hsl[1], hsl[2]),
          }}
        />
      </div>

      {/* Sliders */}
      <div className="w-full space-y-3">
        {/* Saturation */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Nasycenie</label>
          <div className="relative h-3 rounded-full overflow-hidden border border-border/30">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, hsl(${hsl[0]}, 0%, ${hsl[2]}%), hsl(${hsl[0]}, 100%, ${hsl[2]}%))`,
              }}
            />
            <input
              type="range"
              min={0} max={100} value={hsl[1]}
              onChange={e => updateSlider('s', Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
              style={{ left: `calc(${hsl[1]}% - 8px)`, backgroundColor: hslToHex(hsl[0], hsl[1], hsl[2]) }}
            />
          </div>
        </div>

        {/* Lightness */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Jasność</label>
          <div className="relative h-3 rounded-full overflow-hidden border border-border/30">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, hsl(${hsl[0]}, ${hsl[1]}%, 0%), hsl(${hsl[0]}, ${hsl[1]}%, 50%), hsl(${hsl[0]}, ${hsl[1]}%, 100%))`,
              }}
            />
            <input
              type="range"
              min={5} max={95} value={hsl[2]}
              onChange={e => updateSlider('l', Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
              style={{ left: `calc(${hsl[2]}% - 8px)`, backgroundColor: hslToHex(hsl[0], hsl[1], hsl[2]) }}
            />
          </div>
        </div>
      </div>

      {/* HEX input */}
      <div className="w-full flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg border border-border/40 flex-shrink-0"
          style={{ backgroundColor: hslToHex(hsl[0], hsl[1], hsl[2]) }}
        />
        <div className="flex-1 relative">
          <Pipette className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={hexInput}
            onChange={e => handleHexChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background/60 border border-border/40 text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="#8b5cf6"
            maxLength={7}
          />
        </div>
      </div>

      {/* Presets */}
      <div className="w-full">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 block">Szybki wybór</label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => { setHsl(hexToHsl(color)); setHexInput(color); onChange(color); }}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all duration-150 hover:scale-125',
                value.toLowerCase() === color.toLowerCase()
                  ? 'border-white shadow-lg scale-110'
                  : 'border-transparent hover:border-foreground/50'
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
