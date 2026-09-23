import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePinnedAgents } from '@/hooks/usePinnedAgents';

const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    purple: 'text-purple-400',
    blue: 'text-primary',
    green: 'text-green-400',
    red: 'text-red-400',
  };
  return colorMap[color] || 'text-primary';
};

export const PinnedAgentsSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pinnedAgents, isLoading } = usePinnedAgents();
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  // Don't render if no pinned agents
  if (isLoading || pinnedAgents.length === 0) {
    return null;
  }

  const renderAgentItem = (pinned: typeof pinnedAgents[0]) => {
    const agent = pinned.agent;
    if (!agent) return null;
    
    const isActive = location.pathname === `/agent/${agent.slug}`;
    const colorClass = getColorClass(agent.color);

    const menuItem = (
      <SidebarMenuItem key={pinned.id}>
        {/* MAPOWANIE 1:1 (07.09.2026): ten sam wiersz co w menu — wyściółka
            px-2 py-1.5, pole ikony 28 px, etykieta gaśnie w szynie. Zwykły
            `button`, nie `SidebarMenuButton`: ten w szynie wymusza `!w-8 !p-2`,
            czyli dokładnie skok, którego się pozbywamy. */}
        <button
          type="button"
          data-sidebar="menu-button"
          data-active={isActive}
          onClick={() => navigate(`/agent/${agent.slug}`)}
          title={isCollapsed ? agent.name : undefined}
          className={`
            w-full flex items-center rounded-xl px-2 py-1.5 text-[13px]
            transition-all duration-300 group/menu-item
            ${isActive
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
            }
          `}
        >
          <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${isActive ? 'nb-nav-ikona-akt' : 'nb-nav-ikona'}`}>
            {agent.icon_url ? (
              <img src={agent.icon_url} alt={agent.name} className="w-4 h-4 object-contain rounded" />
            ) : (
              <Bot className={`w-4 h-4 ${isActive ? 'text-primary' : colorClass}`} />
            )}
          </span>
          <span className={`truncate ml-2 font-medium transition-opacity duration-150 ${isCollapsed ? 'opacity-0' : ''}`}>{agent.name}</span>
        </button>
      </SidebarMenuItem>
    );

    // Wrap with tooltip when collapsed
    if (isCollapsed) {
      return (
        <Tooltip key={pinned.id}>
          <TooltipTrigger asChild>
            {menuItem}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {agent.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return menuItem;
  };

  return (
    <SidebarGroup className="px-0 mb-1.5">
      <div className="mb-1 px-2 pt-4">
        {isCollapsed ? (
          <div className="flex h-4 items-center" aria-hidden>
            <div className="h-px w-7 bg-foreground/[0.12]" />
          </div>
        ) : (
          <SidebarGroupLabel className="text-foreground/[0.38] text-[10px] font-medium uppercase tracking-[0.14em] px-0 h-4 leading-4">
            PRZYPIĘTE MODUŁY
          </SidebarGroupLabel>
        )}
      </div>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {pinnedAgents.map(renderAgentItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
