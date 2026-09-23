import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUserActiveBadge } from '@/hooks/useUserBadges';
import { useAvatarDecorations } from '@/hooks/useAvatarDecorations';
import { BadgeTooltip } from '@/components/badges/BadgeTooltip';
import { getRarityGlow, getRarityAnimation } from '@/utils/badgeRarity';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  userId?: string;
  showBadge?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl'
};

type AvatarDecorationData = {
  avatar_decorations?: {
    decoration_url?: string | null;
    name?: string | null;
    adjustments?: {
      scale?: number;
      offsetX?: number;
      offsetY?: number;
      rotation?: number;
    } | null;
  } | null;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className,
  userId,
  showBadge = false
}) => {
  const { data: activeBadge } = useUserActiveBadge(userId);
  const { activeDecoration } = useAvatarDecorations(userId);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const decorationData = (activeDecoration as AvatarDecorationData | null)?.avatar_decorations;
  const adjustments = decorationData?.adjustments as { 
    scale?: number; 
    offsetX?: number; 
    offsetY?: number; 
    rotation?: number; 
  } | null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarImage 
            src={src || undefined} 
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold flex items-center justify-center">
            <User className={cn(
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-6 h-6',
              size === 'xl' && 'w-10 h-10'
            )} />
          </AvatarFallback>
        </Avatar>
        
        {/* Avatar decoration overlay */}
        {decorationData?.decoration_url && (
          <div 
            className={cn(
              "absolute inset-0 pointer-events-none flex items-center justify-center",
              sizeClasses[size]
            )}
            style={{
              transform: `translate(${adjustments?.offsetX || 0}%, ${adjustments?.offsetY || 0}%)`
            }}
          >
            <img 
              src={decorationData.decoration_url}
              alt={decorationData.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${adjustments?.scale || 1}) rotate(${adjustments?.rotation || 0}deg)`,
                mixBlendMode: 'normal'
              }}
            />
          </div>
        )}
      </div>
      
      {showBadge && activeBadge && (
        <BadgeTooltip badge={activeBadge} isEarned={true}>
          <div className="w-8 h-8 flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 cursor-pointer">
            {activeBadge.icon_url}
          </div>
        </BadgeTooltip>
      )}
    </div>
  );
};