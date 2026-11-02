import { cn } from '@/lib/utils';
import React, { useRef, useCallback, useMemo } from 'react';

interface InfiniteSliderProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export function InfiniteSlider({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className,
}: InfiniteSliderProps) {
  const animationDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div
        className={cn(
          'flex w-max gap-12 md:gap-16',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `infinite-scroll ${speed}s linear infinite ${animationDirection}`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export default InfiniteSlider;
