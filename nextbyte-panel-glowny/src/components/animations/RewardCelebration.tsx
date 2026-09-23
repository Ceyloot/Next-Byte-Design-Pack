import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Gift } from 'lucide-react';
import { AvatarDecorationRewardPreview } from '@/components/dashboard/AvatarDecorationRewardPreview';
import { PatternBackground } from '@/components/ui/background-patterns';

interface RewardItem {
  type: 'badge' | 'avatar_decoration' | 'profile_background' | 'level' | 'template' | 'course' | 'pattern';
  name: string;
  imageUrl?: string;
  rarity?: string;
  description?: string;
  patternData?: {
    pattern_type: string;
    pattern_color: string;
    pattern_size: number;
    pattern_opacity: number;
    background_color: string;
    fade: boolean;
  };
}

interface RewardCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rewards: RewardItem[];
  title?: string;
  subtitle?: string;
}

export const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  open,
  onOpenChange,
  rewards,
  title = "🎉 Gratulacje!",
  subtitle
}) => {
  // Determine default subtitle based on reward type
  const defaultSubtitle = rewards.length > 0 && (rewards[0].type === 'template' || rewards[0].type === 'course')
    ? "Twój zakup jest gotowy do użycia!"
    : "Otrzymano nowe nagrody!";
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        delay: Math.random() * 0.5,
        color: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#8b5cf6'][Math.floor(Math.random() * 7)]
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
      <DialogContent className="bg-transparent border-0 shadow-none p-0 max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden [&>button]:hidden">
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
                  <Gift className="w-10 h-10 md:w-12 md:h-12 text-primary animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <p className="text-sm">{subtitle || defaultSubtitle}</p>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Rewards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-[40vh] overflow-y-auto">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl nb-szklo border border-primary/30 hover:border-primary/60 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]"
                  style={{
                    animation: `scale-in 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Rarity badge */}
                  {reward.rarity && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-2 py-1 text-xs font-bold bg-primary/20 text-primary border border-primary/50 rounded-full">
                        {reward.rarity}
                      </span>
                    </div>
                  )}

                  {/* Image container */}
                  <div className="aspect-square relative bg-gradient-to-br from-card/40 to-card/20 flex items-center justify-center p-4">
                    {reward.type === 'badge' || reward.type === 'level' ? (
                      <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                        {reward.imageUrl}
                      </span>
                    ) : reward.type === 'avatar_decoration' ? (
                      <AvatarDecorationRewardPreview
                        decorationUrl={reward.imageUrl || ''}
                        decorationName={reward.name}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : reward.type === 'pattern' && reward.patternData ? (
                      <div className="w-full h-full relative rounded-lg overflow-hidden">
                        <PatternBackground
                          pattern_type={reward.patternData.pattern_type as any}
                          pattern_color={reward.patternData.pattern_color}
                          pattern_size={reward.patternData.pattern_size}
                          pattern_opacity={reward.patternData.pattern_opacity}
                          background_color={reward.patternData.background_color}
                          fade={reward.patternData.fade}
                        />
                      </div>
                    ) : reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Gift className="w-12 h-12 text-primary" />
                    )}
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Name and type */}
                  <div className="px-3 py-3 text-center border-t border-primary/20 nb-szklo">
                    <p className="font-semibold text-foreground text-sm line-clamp-1">
                      {reward.name}
                    </p>
                    {reward.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {reward.description}
                      </p>
                    )}
                    {!reward.description && (
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {reward.type === 'badge' && '🏆 Przypinka'}
                        {reward.type === 'avatar_decoration' && '✨ Dekoracja'}
                        {reward.type === 'profile_background' && '🎨 Tło'}
                        {reward.type === 'level' && '⭐ Nowy poziom'}
                        {reward.type === 'template' && '📄 Szablon'}
                        {reward.type === 'course' && '🎓 Kurs'}
                        {reward.type === 'pattern' && '🔲 Wzór'}
                      </p>
                    )}
                  </div>

                  {/* Corner sparkles */}
                  <div className="absolute top-2 left-2">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  </div>
                </div>
              ))}
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
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }
      `}</style>
    </Dialog>
  );
};
