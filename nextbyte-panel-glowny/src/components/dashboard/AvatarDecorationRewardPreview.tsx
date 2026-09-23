import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

interface AvatarDecorationRewardPreviewProps {
  decorationUrl: string;
  decorationName: string;
  className?: string;
}

export const AvatarDecorationRewardPreview: React.FC<AvatarDecorationRewardPreviewProps> = ({
  decorationUrl,
  decorationName,
  className = ''
}) => {
  // Fetch current user's profile photo
  const { data: profile } = useQuery({
    queryKey: ['user-profile-avatar'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('profile_image_url, first_name, last_name')
        .eq('id', user.id)
        .single();

      return data;
    }
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: '100%', aspectRatio: '1 / 1' }}>
      {/* Container with fixed aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* User avatar - smaller, centered.
            `--brand-primary` wypadł — nie ustawia go każdy motyw; zaślepka
            awatara jedzie na akcencie motywu jak reszta Panelu. */}
        <div className="absolute inset-[12.5%] overflow-hidden rounded-full border-2 border-primary/30 bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.06)]">
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={profile.first_name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-primary/50" />
            </div>
          )}
        </div>
        
        {/* Decoration overlay - full container size */}
        <img 
          src={decorationUrl}
          alt={decorationName}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
