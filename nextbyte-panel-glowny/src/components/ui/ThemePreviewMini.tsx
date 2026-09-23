import React from 'react';

interface ThemePreviewMiniProps {
  bg: string;
  primary: string;
  card: string;
  accent: string;
  isLight?: boolean;
  className?: string;
}

/**
 * Enterprise-quality mini dashboard preview for theme cards.
 * Shows sidebar + stat cards + bar chart using theme colors.
 */
export const ThemePreviewMini: React.FC<ThemePreviewMiniProps> = ({
  bg,
  primary,
  card,
  accent,
  isLight = false,
  className = '',
}) => {
  const textColor = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.5)';
  const textDim = isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)';
  const borderCol = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

  return (
    <div
      className={`aspect-[4/3] rounded-md overflow-hidden flex ${className}`}
      style={{ background: bg, border: `1px solid ${borderCol}` }}
    >
      {/* Mini sidebar */}
      <div
        className="w-[22%] h-full flex flex-col gap-[2px] p-[3px]"
        style={{ borderRight: `1px solid ${borderCol}` }}
      >
        <div className="w-full h-[4px] rounded-sm" style={{ background: primary, opacity: 0.9 }} />
        <div className="w-[70%] h-[2px] rounded-sm mt-[2px]" style={{ background: textDim }} />
        <div className="w-[85%] h-[2px] rounded-sm" style={{ background: textDim }} />
        <div className="w-[60%] h-[2px] rounded-sm" style={{ background: textDim }} />
        <div className="flex-1" />
        <div className="w-[50%] h-[2px] rounded-sm" style={{ background: textDim }} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-[4px] gap-[3px]">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="w-[40%] h-[3px] rounded-sm" style={{ background: textColor }} />
          <div className="w-[10px] h-[3px] rounded-full" style={{ background: primary }} />
        </div>

        {/* Stat cards row */}
        <div className="flex gap-[2px]">
          {[primary, accent, textColor].map((color, i) => (
            <div
              key={i}
              className="flex-1 rounded-[2px] p-[2px] flex flex-col justify-between"
              style={{ background: card, border: `0.5px solid ${borderCol}` }}
            >
              <div className="w-[60%] h-[1.5px] rounded-sm" style={{ background: textDim }} />
              <div className="w-[45%] h-[3px] rounded-sm mt-[1px]" style={{ background: color, opacity: 0.8 }} />
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div
          className="flex-1 rounded-[2px] p-[3px] flex items-end gap-[1.5px]"
          style={{ background: card, border: `0.5px solid ${borderCol}` }}
        >
          {[35, 55, 40, 70, 50, 85, 60, 45, 75, 55].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[1px]"
              style={{
                height: `${h}%`,
                background: i % 3 === 0 ? primary : accent,
                opacity: i % 3 === 0 ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
