import React from 'react';
import { cn } from '@/lib/utils';

interface PatternBackgroundProps {
  patternColor?: string;
  patternSize?: number;
  patternOpacity?: number;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
  fade?: boolean;
}

const fadeStyle: React.CSSProperties = {
  maskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
  WebkitMaskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
};

// ── Plus Pattern ──────────────────────────────────────────
export const BackgroundPlus: React.FC<PatternBackgroundProps> = ({
  patternColor = '#70BEFA',
  backgroundColor = 'transparent',
  patternSize = 60,
  patternOpacity = 0.4,
  className,
  fade = true,
  style,
}) => {
  const encoded = encodeURIComponent(patternColor);

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encoded}' fill-opacity='${patternOpacity}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    ...(fade ? fadeStyle : {}),
    ...style,
  };

  return (
    <div
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={backgroundStyle}
    />
  );
};

// ── Dots Pattern ──────────────────────────────────────────
export const BackgroundDots: React.FC<PatternBackgroundProps> = ({
  patternColor = '#70BEFA',
  backgroundColor = 'transparent',
  patternSize = 20,
  patternOpacity = 0.5,
  className,
  fade = true,
  style,
}) => {
  const encoded = encodeURIComponent(patternColor);
  const dotRadius = Math.max(1, patternSize * 0.05);

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${patternSize / 2}' cy='${patternSize / 2}' r='${dotRadius}' fill='${encoded}' fill-opacity='${patternOpacity}'/%3E%3C/svg%3E")`,
    ...(fade ? fadeStyle : {}),
    ...style,
  };

  return (
    <div
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={backgroundStyle}
    />
  );
};

// ── Grid Pattern ──────────────────────────────────────────
export const BackgroundGrid: React.FC<PatternBackgroundProps> = ({
  patternColor = '#70BEFA',
  backgroundColor = 'transparent',
  patternSize = 40,
  patternOpacity = 0.3,
  className,
  fade = true,
  style,
}) => {
  const encoded = encodeURIComponent(patternColor);

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${patternSize} 0 L 0 0 0 ${patternSize}' fill='none' stroke='${encoded}' stroke-width='1' stroke-opacity='${patternOpacity}'/%3E%3C/svg%3E")`,
    ...(fade ? fadeStyle : {}),
    ...style,
  };

  return (
    <div
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={backgroundStyle}
    />
  );
};

// ── Universal renderer ────────────────────────────────────
export interface PatternConfig {
  pattern_type: 'plus' | 'dots' | 'grid';
  pattern_color: string;
  pattern_size: number;
  pattern_opacity: number;
  background_color: string;
  fade: boolean;
}

export const PatternBackground: React.FC<PatternConfig & { className?: string; style?: React.CSSProperties }> = ({
  pattern_type,
  pattern_color,
  pattern_size,
  pattern_opacity,
  background_color,
  fade,
  className,
  style,
}) => {
  const props = {
    patternColor: pattern_color,
    patternSize: pattern_size,
    patternOpacity: pattern_opacity,
    backgroundColor: background_color,
    fade,
    className,
    style,
  };

  switch (pattern_type) {
    case 'plus':
      return <BackgroundPlus {...props} />;
    case 'dots':
      return <BackgroundDots {...props} />;
    case 'grid':
      return <BackgroundGrid {...props} />;
    default:
      return null;
  }
};
