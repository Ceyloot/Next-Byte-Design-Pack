import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Crown, User, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useOptionalGlobalDialogs } from '@/contexts/GlobalDialogsContext';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Footer user menu — replaces the 4 separate buttons (Konto/Premium/Settings/Logout)
 * with a single avatar that opens a popover. Standard pattern: Linear, Notion, Figma.
 */
export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthContext();
  const { isSubscribed } = useSubscriptionContext();
  const dialogs = useOptionalGlobalDialogs();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const isCollapsed = state === 'collapsed' && !isMobile;

  // Profile (display name + avatar)
  const { data: profile } = useQuery({
    queryKey: ['userMenu-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, profile_image_url')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Friend requests count for badge on Konto
  const { data: friendRequests } = useFriendRequests(user?.id);
  const pendingCount = friendRequests?.incoming.length || 0;

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Użytkownik';

  const closeAll = () => {
    setOpen(false);
    if (isMobile) setOpenMobile(false);
  };

  const go = (path: string) => {
    closeAll();
    navigate(path);
  };

  const handleSettings = () => {
    // IA v1.3 — Settings hub jest pełnoekranową stroną; SettingsDialog zostaje jako fallback.
    closeAll();
    navigate('/ustawienia');
  };

  const handleLogout = async () => {
    closeAll();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/');
    }
  };

  const items = [
    {
      icon: User,
      label: 'Konto',
      onClick: () => go('/konto'),
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      icon: Crown,
      label: isSubscribed ? 'Premium ✓' : 'Premium',
      onClick: () => go('/premium'),
      badge: null,
      premium: true,
    },
    { icon: Settings, label: 'Ustawienia', onClick: handleSettings, badge: null },
    { icon: LogOut, label: 'Wyloguj się', onClick: handleLogout, badge: null, danger: true },
  ];

  // Trigger button (collapsed = just avatar, expanded = avatar + name + chevron)
  const trigger = (
    <button
      type="button"
      className={cn(
        'group w-full flex items-center rounded-lg transition-colors border',
        isCollapsed
          ? 'justify-center p-1 border-transparent hover:bg-muted/40'
          : 'gap-2.5 px-2 py-1.5 border-transparent hover:bg-muted/40 hover:border-border/40'
      )}
      aria-label="Menu konta"
    >
      <div className="relative flex-shrink-0">
        <UserAvatar
          src={profile?.profile_image_url}
          name={fullName}
          size="sm"
          userId={user?.id}
        />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
        )}
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {isSubscribed ? 'Premium ✓' : 'Konto Free'}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </>
      )}
    </button>
  );

  // On mobile (inside Sheet), use inline expansion instead of Popover
  // to avoid pointer-events issues with the Sheet overlay
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:bg-muted/40 hover:border-border/40"
          aria-label="Menu konta"
          aria-expanded={open}
        >
          <div className="relative flex-shrink-0">
            <UserAvatar
              src={profile?.profile_image_url}
              name={fullName}
              size="sm"
              userId={user?.id}
            />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {isSubscribed ? 'Premium ✓' : 'Konto Free'}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-all duration-200',
              open && 'rotate-180 text-foreground'
            )}
          />
        </button>

        {open && (
          <div className="relative mt-2 mx-1 rounded-2xl border border-primary/25 nb-szklo bg-gradient-to-br from-primary/10 via-transparent to-primary/5 shadow-[0_8px_40px_hsl(var(--primary)/0.18)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
            <div className="px-3 py-2.5 border-b border-primary/15">
              <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="p-1.5">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm transition-colors',
                    item.danger
                      ? 'text-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15'
                      : item.premium && isSubscribed
                      ? 'text-success hover:bg-success/10 active:bg-success/15'
                      : item.premium
                      ? 'text-warning hover:bg-warning/10 active:bg-warning/15'
                      : 'text-foreground hover:bg-primary/10 active:bg-primary/15'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent side="right">{fullName}</TooltipContent>
          </Tooltip>
        ) : (
          trigger
        )}
      </PopoverTrigger>
      <PopoverContent
        side={isCollapsed ? 'right' : 'top'}
        align={isCollapsed ? 'end' : 'start'}
        sideOffset={8}
        collisionPadding={12}
        avoidCollisions
        className="relative w-64 p-2 rounded-2xl border border-primary/25 nb-szklo bg-gradient-to-br from-primary/10 via-transparent to-primary/5 shadow-[0_8px_40px_hsl(var(--primary)/0.18)] z-[100] after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent overflow-hidden"
      >
        <div className="px-2 py-2 mb-1 border-b border-primary/15">
          <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <div className="space-y-0.5 pt-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                item.danger
                  ? 'text-foreground hover:bg-destructive/10 hover:text-destructive'
                  : item.premium && isSubscribed
                  ? 'text-success hover:bg-success/10'
                  : item.premium
                  ? 'text-warning hover:bg-warning/10'
                  : 'text-foreground hover:bg-primary/10'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
