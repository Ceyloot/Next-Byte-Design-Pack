import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { usePanicMode, formatShortcut } from '@/contexts/PanicModeContext';
import { Glitchy404 } from '@/components/Glitchy404';

const PanicOverlay: React.FC = () => {
  const { isPanic, togglePanic, shortcut } = usePanicMode();
  const [tapCount, setTapCount] = React.useState(0);
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Triple-tap to unlock on mobile
  const handleTap = React.useCallback(() => {
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        togglePanic();
        return 0;
      }
      return next;
    });

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 800);
  }, [togglePanic]);

  React.useEffect(() => {
    if (!isPanic) setTapCount(0);
  }, [isPanic]);

  if (!isPanic) return null;

  return (
    <div
      className="absolute inset-0 z-[99] flex flex-col items-center justify-center bg-background select-none overflow-hidden cursor-pointer"
      onClick={handleTap}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary)), transparent 70%)" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl pointer-events-none">
        {/* Shield icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        {/* Glitchy visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-6"
        >
          <Glitchy404 width={400} height={116} />
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-muted-foreground mb-2"
        >
          Ekran zabezpieczony
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-sm text-muted-foreground/50 font-mono"
        >
          <span className="hidden sm:inline">
            Naciśnij <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">{formatShortcut(shortcut)}</kbd> aby odblokować
          </span>
          <span className="sm:hidden">
            Stuknij 3× aby odblokować {tapCount > 0 && <span className="text-primary">({tapCount}/3)</span>}
          </span>
        </motion.p>
      </div>
    </div>
  );
};

export default PanicOverlay;
