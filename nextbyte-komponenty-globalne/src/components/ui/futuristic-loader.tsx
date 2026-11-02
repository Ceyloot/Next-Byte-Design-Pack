import React from 'react';
import { cn } from '@/lib/utils';

interface FuturisticLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showReflection?: boolean;
}

export const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({ 
  size = 'md',
  className,
  showReflection = true
}) => {
  const sizeMap = {
    xs: { width: 40, radius: 14, pinOrbit: 14, strokeWidth: 1.5 },
    sm: { width: 64, radius: 24, pinOrbit: 24, strokeWidth: 2 },
    md: { width: 96, radius: 36, pinOrbit: 36, strokeWidth: 2.5 },
    lg: { width: 128, radius: 48, pinOrbit: 48, strokeWidth: 3 }
  };
  
  // Mobile scaling - reduce by 1/3 (multiply by 2/3 = 0.67)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mobileScale = isMobile && size === 'xs' ? 0.67 : 1;

  const { width, radius, pinOrbit, strokeWidth } = sizeMap[size];
  const center = width / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Main Loader */}
      <svg 
        width={width} 
        height={width} 
        viewBox={`0 0 ${width} ${width}`}
          className="motion-safe:will-change-transform"
        style={{ 
          filter: 'drop-shadow(0 0 8px hsl(var(--brand-primary) / 0.6))',
          transform: `scale(${mobileScale})`
        }}
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="hsl(var(--brand-primary))" floodOpacity="0.8"/>
            <feComposite in2="blur" operator="in" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gradient for ring */}
          <linearGradient id={`ring-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-primary))" stopOpacity="1"/>
            <stop offset="50%" stopColor="hsl(var(--brand-primary-light))" stopOpacity="1"/>
            <stop offset="100%" stopColor="hsl(var(--brand-primary))" stopOpacity="0.8"/>
          </linearGradient>
        </defs>

        {/* Animated Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#glow-${size})`}
          className="origin-center motion-safe:animate-loader-ring"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: 0,
          }}
        />

        {/* Animated Pin (orbiting) */}
        <g 
          className="origin-center motion-safe:animate-loader-pin"
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          <g transform={`translate(${center}, ${center - pinOrbit})`}>
            {/* Pin head (circle) */}
            <circle
              cx="0"
              cy="0"
              r={strokeWidth * 1.2}
              fill="hsl(var(--foreground))"
              className="drop-shadow-lg"
            />
            {/* Pin body (teardrop shape) */}
            <path
              d={`M -${strokeWidth * 0.6} ${strokeWidth * 1.2} 
                  L 0 ${strokeWidth * 3} 
                  L ${strokeWidth * 0.6} ${strokeWidth * 1.2} 
                  Z`}
              fill="hsl(var(--foreground))"
              className="drop-shadow-lg"
            />
          </g>
        </g>
      </svg>

      {/* Reflection Effect */}
      {showReflection && (
        <svg 
          width={width} 
          height={width * 0.3} 
          viewBox={`0 0 ${width} ${width * 0.3}`}
          className="absolute left-0 opacity-20 blur-sm"
          style={{ top: `${width}px` }}
        >
          <circle
            cx={center}
            cy={0}
            r={radius}
            fill="none"
            stroke={`url(#ring-gradient-${size})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="origin-center motion-safe:animate-loader-ring"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: 0,
              transform: 'scaleY(-1)',
              transformOrigin: `${center}px 0px`,
            }}
          />
        </svg>
      )}
    </div>
  );
};
