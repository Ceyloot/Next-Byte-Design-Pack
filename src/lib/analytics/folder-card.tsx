import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface FolderCardProps {
  name: string;
  count: number;
  color?: string;
  icon?: ReactNode;
  sharedBy?: string;
  onClick?: () => void;
  active?: boolean;
  glass?: boolean;
  className?: string;
}

const FOLDER_COLORS = [
  'linear-gradient(135deg, hsl(204 91% 60% / 0.8), hsl(240 80% 60% / 0.6))',
  'linear-gradient(135deg, hsl(0 72% 55% / 0.8), hsl(20 90% 55% / 0.6))',
  'linear-gradient(135deg, hsl(280 70% 55% / 0.8), hsl(220 80% 60% / 0.6))',
  'linear-gradient(135deg, hsl(150 60% 45% / 0.8), hsl(190 70% 50% / 0.6))',
  'linear-gradient(135deg, hsl(50 90% 55% / 0.8), hsl(30 80% 55% / 0.6))',
];

export { FOLDER_COLORS };

const FolderIconSVG = ({ gradient }: { gradient: string }) => (
  <div
    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-uniesiona"
    style={{ background: gradient }}
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25A2.25 2.25 0 004.5 16.5h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  </div>
);

export function FolderCard({
  name, count, color, icon, sharedBy, onClick, active, glass, className,
}: FolderCardProps) {
  const gradient = color ?? FOLDER_COLORS[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-2xl border p-4 transition-all duration-200',
        'flex items-center gap-4',
        active
          ? 'border-primary/40 bg-primary/5'
          : glass
            ? 'border-border/40 nb-glass-static hover:border-border hover:shadow-uniesiona'
            : 'border-border/60 bg-card hover:border-border hover:bg-card/80 hover:shadow-uniesiona',
        className,
      )}
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60"
        style={{ background: gradient }}
      />

      {icon ? (
        <div className="shrink-0">{icon}</div>
      ) : (
        <FolderIconSVG gradient={gradient} />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count} {count === 1 ? 'notatka' : count < 5 ? 'notatki' : 'notatek'}
          {sharedBy && <span className="ml-2 opacity-60">· {sharedBy}</span>}
        </p>
      </div>

      <span className="shrink-0 text-lg font-bold text-muted-foreground/30 tabular-nums">{count}</span>
    </button>
  );
}

export interface FolderGridProps {
  folders: Array<FolderCardProps & { id: string }>;
  columns?: 2 | 3 | 4;
  onSelect?: (id: string) => void;
  selected?: string;
  glass?: boolean;
  className?: string;
}

export function FolderGrid({ folders, columns = 3, onSelect, selected, glass, className }: FolderGridProps) {
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <div className={cn('grid gap-3', colClass, className)}>
      {folders.map((f, i) => (
        <FolderCard
          key={f.id}
          {...f}
          color={f.color ?? FOLDER_COLORS[i % FOLDER_COLORS.length]}
          active={selected === f.id}
          glass={glass}
          onClick={() => onSelect?.(f.id)}
        />
      ))}
    </div>
  );
}
