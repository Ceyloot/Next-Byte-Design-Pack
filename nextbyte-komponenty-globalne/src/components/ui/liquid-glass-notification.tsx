import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type LiquidNotificationVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface LiquidGlassNotificationProps {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  expandedContent?: React.ReactNode;
  variant?: LiquidNotificationVariant;
  duration?: number;
  onClose: (id: string) => void;
  timestamp?: Date;
}

const variantStyles: Record<LiquidNotificationVariant, { border: string; glow: string }> = {
  default: {
    border: 'border-primary/20',
    glow: 'hsl(var(--primary) / 0.1)',
  },
  success: {
    border: 'border-primary/40',
    glow: 'hsl(var(--primary) / 0.2)',
  },
  error: {
    border: 'border-destructive/40',
    glow: 'hsl(var(--destructive) / 0.2)',
  },
  warning: {
    border: 'border-primary/30',
    glow: 'hsl(var(--primary) / 0.15)',
  },
  info: {
    border: 'border-primary/35',
    glow: 'hsl(var(--primary) / 0.18)',
  },
};

const containerVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.5, 1.5, 0.5, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.5, 1.5, 0.5, 1] as const,
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.5, 1.5, 0.5, 1] as const,
    },
  },
};

export const LiquidGlassNotification: React.FC<LiquidGlassNotificationProps> = ({
  id,
  icon,
  title,
  description,
  expandedContent,
  variant = 'default',
  duration = 3000,
  onClose,
  timestamp = new Date(),
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (isExpanded || isPaused) return;

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose, isExpanded, isPaused]);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (expandedContent) {
      setIsExpanded(!isExpanded);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'relative w-full md:w-[380px] overflow-hidden',
        expandedContent && 'cursor-pointer'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SVG Filter for liquid effect */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id={`liquid-glass-filter-${id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="glass"
            />
          </filter>
        </defs>
      </svg>

      {/* Bend Layer - Backdrop blur with distortion */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />

      {/* Face Layer - Main shadow and glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl border',
          styles.border
        )}
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
          boxShadow: `
            inset 2px 2px 4px rgba(255, 255, 255, 0.1),
            inset -2px -2px 4px rgba(255, 255, 255, 0.05),
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 40px ${styles.glow}
          `,
        }}
      />

      {/* Edge Layer - Inner highlights */}
      <div
        className="absolute inset-[1px] rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-xl nb-szklo flex items-center justify-center text-lg">
              {icon}
            </div>
          )}

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground truncate">{title}</h4>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatTime(timestamp)}
              </span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && expandedContent && (
            <motion.div
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-border/40">
                {expandedContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand indicator */}
        {expandedContent && !isExpanded && (
          <div className="flex justify-center mt-2">
            <div className="w-8 h-1 rounded-full bg-foreground/20" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
