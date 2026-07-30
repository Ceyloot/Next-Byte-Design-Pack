import React from 'react';

interface TechGridProps {
  oczko?: number;
  className?: string;
}

export const TechGrid: React.FC<TechGridProps> = ({ oczko = 44, className }) => {
  const linia = 'hsl(var(--foreground) / 0.028)';
  const maska = 'radial-gradient(ellipse 80% 44% at 50% 0%, #000 30%, transparent 100%)';

  return (
    <div
      aria-hidden
      className={className || 'pointer-events-none absolute inset-0 z-0'}
      style={{
        backgroundImage:
          `linear-gradient(${linia} 1px, transparent 1px),` +
          `linear-gradient(90deg, ${linia} 1px, transparent 1px)`,
        backgroundSize: `${oczko}px ${oczko}px`,
        WebkitMaskImage: maska,
        maskImage: maska,
      }}
    />
  );
};

export default TechGrid;
