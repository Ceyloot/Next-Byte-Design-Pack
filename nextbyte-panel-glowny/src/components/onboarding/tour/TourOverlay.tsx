import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourOverlayProps {
  isActive: boolean;
  targetRect: { top: number; left: number; width: number; height: number } | null;
  onClickOverlay: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ isActive, targetRect, onClickOverlay }) => {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[9990]"
        onClick={onClickOverlay}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <motion.rect
                  initial={{ opacity: 0 }}
                  animate={{
                    x: targetRect.left - 4,
                    y: targetRect.top - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                    opacity: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              )}
            </mask>
            {targetRect && (
              <filter id="spotlight-glow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#tour-spotlight-mask)"
          />
          {/* Animated glow ring */}
          {targetRect && (
            <>
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{
                  x: targetRect.left - 4,
                  y: targetRect.top - 4,
                  width: targetRect.width + 8,
                  height: targetRect.height + 8,
                  opacity: 0.6,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                rx="14"
                ry="14"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                filter="url(#spotlight-glow)"
              />
              {/* Subtle inner ring */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{
                  x: targetRect.left - 2,
                  y: targetRect.top - 2,
                  width: targetRect.width + 4,
                  height: targetRect.height + 4,
                  opacity: 0.3,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                rx="13"
                ry="13"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
            </>
          )}
        </svg>
      </motion.div>
    </AnimatePresence>
  );
};