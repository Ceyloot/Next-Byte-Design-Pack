import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Coins, Crown, Building2, Gift } from 'lucide-react';

export type ByteReceivedSource = 'subscription_bonus' | 'purchase' | 'admin_grant' | 'company_grant';

interface ByteReceivedCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  source: ByteReceivedSource;
  newBalance?: number;
}

const getSourceDetails = (source: ByteReceivedSource) => {
  switch (source) {
    case 'subscription_bonus':
      return {
        title: '🎉 Miesięczny Bonus Premium!',
        subtitle: 'Twój bonus został naliczony',
        icon: Crown,
        iconColor: 'text-yellow-400'
      };
    case 'purchase':
      return {
        title: '🎉 Zakup zakończony!',
        subtitle: 'Byte\'y zostały dodane do Twojego konta',
        icon: Coins,
        iconColor: 'text-primary'
      };
    case 'admin_grant':
      return {
        title: '🎁 Bonus od Administracji!',
        subtitle: 'Otrzymano specjalny bonus',
        icon: Gift,
        iconColor: 'text-accent'
      };
    case 'company_grant':
      return {
        title: '🏢 Bonus od Firmy!',
        subtitle: 'Twoja firma przyznała Ci Byte\'y',
        icon: Building2,
        iconColor: 'text-green-400'
      };
    default:
      return {
        title: '🎉 Otrzymano Byte\'y!',
        subtitle: 'Byte\'y zostały dodane do Twojego konta',
        icon: Coins,
        iconColor: 'text-primary'
      };
  }
};

export const ByteReceivedCelebration: React.FC<ByteReceivedCelebrationProps> = ({
  open,
  onOpenChange,
  amount,
  source,
  newBalance
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>([]);
  const [showContent, setShowContent] = useState(false);
  
  const { title, subtitle, icon: IconComponent, iconColor } = getSourceDetails(source);

  useEffect(() => {
    if (open) {
      // Generate confetti particles with byte-themed colors
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        delay: Math.random() * 0.5,
        color: ['#3b82f6', '#60a5fa', '#93c5fd', '#fbbf24', '#f59e0b', '#a855f7', '#8b5cf6'][Math.floor(Math.random() * 7)]
      }));
      setParticles(newParticles);
      
      // Show content after a short delay
      setTimeout(() => setShowContent(true), 200);
    } else {
      setShowContent(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none p-0 max-w-md w-[95vw] overflow-hidden [&>button]:hidden">
        <div className="rounded-2xl nb-szklo nb-szklo-plynne border border-primary/30 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.4)] overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full animate-[fall_3s_ease-in_forwards]"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  backgroundColor: particle.color,
                  animationDelay: `${particle.delay}s`,
                  boxShadow: `0 0 10px ${particle.color}`
                }}
              />
            ))}
          </div>

          {/* Glowing orbs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Content */}
          <div className={`relative z-10 p-6 md:p-8 transition-all duration-500 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Header with icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                <div className="nb-szklo nb-szklo-plynne relative bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/50 p-4 rounded-2xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]">
                  <IconComponent className={`w-10 h-10 md:w-12 md:h-12 ${iconColor} animate-bounce`} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <p className="text-sm">{subtitle}</p>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Byte amount display */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-xl blur-md" />
              <div className="relative nb-szklo border border-primary/40 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-primary animate-pulse">
                    +{amount.toLocaleString()}
                  </span>
                  <span className="text-3xl md:text-4xl text-primary/80">⟠</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Byte'ów</p>
                
                {newBalance !== undefined && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Nowy stan konta</p>
                    <p className="text-lg font-semibold text-foreground">
                      {newBalance.toLocaleString()} ⟠
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="w-full h-12 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 hover:border-primary font-semibold rounded-xl transition-all duration-300"
            >
              Zamknij
            </button>
          </div>
        </div>
      </DialogContent>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </Dialog>
  );
};
