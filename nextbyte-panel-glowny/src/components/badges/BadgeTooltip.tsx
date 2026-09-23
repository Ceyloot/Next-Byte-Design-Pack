import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Badge } from '@/components/ui/badge';
import { useBadgeStats, UserBadge } from '@/hooks/useUserBadges';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BadgeTooltipProps {
  badge: UserBadge;
  earnedAt?: string;
  isEarned?: boolean;
  children: React.ReactNode;
}

const getRarityText = (rarity: string) => {
  const rarityMap = {
    common: 'Popularna',
    rare: 'Rzadka',
    epic: 'Epicka',
    legendary: 'Legendarna'
  };
  return rarityMap[rarity as keyof typeof rarityMap] || rarity;
};

const getRarityColor = (rarity: string) => {
  const colorMap = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500'
  };
  return colorMap[rarity as keyof typeof colorMap] || 'bg-gray-500';
};

export const BadgeTooltip: React.FC<BadgeTooltipProps> = ({
  badge,
  earnedAt,
  isEarned = false,
  children
}) => {
  const { data: stats } = useBadgeStats(badge.id);

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content 
            className={cn(
              "w-80 p-0 rounded-xl shadow-2xl",
              "nb-szklo nb-szklo-plynne",
              "border border-border/50",
              "z-[9999]",
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            )}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.5)'
            }}
            side="bottom" 
            align="center" 
            sideOffset={12}
            avoidCollisions={true}
            collisionPadding={20}
          >
            <div className="p-4 space-y-3">
              {/* Header with icon and name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-border/40 flex items-center justify-center">
                  <span className="text-2xl">{badge.icon_url}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-base">{badge.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs text-foreground mt-1 ${getRarityColor(badge.rarity)}`}
                  >
                    {getRarityText(badge.rarity)}
                  </Badge>
                </div>
              </div>
              
              {/* Description */}
              <div className="border-t border-border/40 pt-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>
                
                {!isEarned && (
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-2.5 mt-3">
                    <p className="text-xs text-foreground/85">
                      <span className="font-medium text-brand-primary">Jak zdobyć:</span>{' '}
                      <span className="text-muted-foreground">{badge.how_to_earn}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Earned date */}
              {isEarned && earnedAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="font-medium text-muted-foreground">Zdobyta:</span>
                  <span>{format(new Date(earnedAt), 'd MMMM yyyy', { locale: pl })}</span>
                </div>
              )}

              {/* Stats */}
              {stats && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span className="font-medium text-muted-foreground pt-2">Posiada:</span>
                  <span className="pt-2">{stats.percentage}% użytkowników</span>
                </div>
              )}
            </div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};