import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface TagChipProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  className?: string;
}

const sizes = {
  sm:      'text-[10px] px-2 py-0.5 gap-1',
  default: 'text-xs px-3 py-1 gap-1.5',
  lg:      'text-sm px-4 py-1.5 gap-2',
};

export function TagChip({
  label, icon, active = false, onClick, size = 'default', disabled, className,
}: TagChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all select-none',
        sizes[size],
        active
          ? 'border-primary/50 bg-primary/10 text-primary'
          : 'border-border/60 bg-transparent text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      {icon && <span className="shrink-0 opacity-70">{icon}</span>}
      {label}
    </button>
  );
}

export interface TagChipGroupProps {
  chips: Array<{ id: string; label: string; icon?: ReactNode }>;
  value?: string | string[];
  multi?: boolean;
  size?: TagChipProps['size'];
  onChange?: (value: string | string[]) => void;
  className?: string;
}

export function TagChipGroup({
  chips, value, multi = false, size, onChange, className,
}: TagChipGroupProps) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(id: string) {
    if (!onChange) return;
    if (multi) {
      onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    } else {
      onChange(selected[0] === id ? '' : id);
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map(c => (
        <TagChip
          key={c.id}
          label={c.label}
          icon={c.icon}
          size={size}
          active={selected.includes(c.id)}
          onClick={() => toggle(c.id)}
        />
      ))}
    </div>
  );
}
