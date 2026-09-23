import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pin, Star } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRecentRoutes } from '@/hooks/useRecentRoutes';
import { getRouteMeta } from './menuMeta';
import { cn } from '@/lib/utils';

/**
 * Manually pinned favorite routes. No auto-tracking of recents.
 * Hidden when collapsed (icons only would create chaos with no titles).
 */
export const FavoritesSection: React.FC = () => {
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { pinned, togglePin } = useRecentRoutes();

  const isCollapsed = state === 'collapsed' && !isMobile;

  const handleClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  if (pinned.length === 0) return null;

  /* MAPOWANIE 1:1 (07.09.2026): sekcja żyje też w szynie — kiedyś znikała
     całkiem i wszystko niżej podjeżdżało o jej wysokość przy zwijaniu.
     Nagłówek ma ten sam blok co sekcje menu (pt-4 + h-4 + mb-1), wiersz tę
     samą wyściółkę i pole ikony 28 px; gaśnie tylko etykieta. */
  return (
    <SidebarGroup className="px-0 mb-1.5">
      <div className="mb-1 px-2 pt-4">
        {isCollapsed ? (
          <div className="flex h-4 items-center" aria-hidden>
            <div className="h-px w-7 bg-foreground/[0.12]" />
          </div>
        ) : (
          <SidebarGroupLabel className="text-foreground/[0.38] text-[10px] font-medium uppercase tracking-[0.14em] px-0 h-4 leading-4 flex items-center gap-1.5">
            <Star className="w-3 h-3" />
            Ulubione
          </SidebarGroupLabel>
        )}
      </div>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {pinned.map((path) => {
            const meta = getRouteMeta(path);
            const Icon = meta.icon;
            const itemActive = location.pathname === path || location.pathname.startsWith(path + '/');

            return (
              <SidebarMenuItem key={path}>
                <div
                  className={cn(
                    'group/fav w-full flex items-center rounded-xl text-[13px] transition-colors px-2 py-1.5 border',
                    itemActive
                      ? 'bg-primary/15 text-foreground border-primary/30'
                      : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <Link
                    to={path}
                    onClick={handleClick}
                    className="flex items-center flex-1 min-w-0"
                    title={isCollapsed ? meta.title : undefined}
                  >
                    <span className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', itemActive ? 'nb-nav-ikona-akt text-primary' : 'nb-nav-ikona')}>
                      <Icon strokeWidth={1.75} className="w-[17px] h-[17px]" />
                    </span>
                    <span className={cn('truncate ml-2 transition-opacity duration-150', isCollapsed && 'opacity-0')}>{meta.title}</span>
                  </Link>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(path);
                        }}
                        aria-label="Odepnij"
                        className={cn('opacity-0 group-hover/fav:opacity-100 transition-opacity p-1 rounded hover:bg-background/60 flex-shrink-0', isCollapsed && 'hidden')}
                      >
                        <Pin className="w-3 h-3 text-primary fill-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Odepnij</TooltipContent>
                  </Tooltip>
                </div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
