import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import ByteBalance from '../ByteBalance';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { PasekKart } from './PasekKart';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const GlassIconButton: React.FC<{
  active?: boolean;
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, ariaLabel, onClick, children }) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    className={cn(
      'relative h-9 w-9 rounded-xl flex items-center justify-center overflow-hidden',
      'border transition-all duration-300',
      /* Zaszyta BIEL zamieniona na materiał (04.08.2026). `bg-white/[0.03]`
         i `border-foreground/[0.08]` to jedyne miejsce w pasku, gdzie kolor był
         wpisany na sztywno zamiast liczony od motywu — na motywach jasnych
         biel na bieli znaczy „nic", a materiał `--foreground` odwraca się
         razem z motywem. Wariant aktywny zostaje akcentowy: to stan
         wyróżniony, a nie powierzchnia. */
      active
        ? 'border-primary/40 bg-primary/[0.13] text-primary'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]'
    )}
  >
    {active && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1.5 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
    )}
    {children}
  </button>
);

export function AppSidebarFooter() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isSettingsActive = pathname.startsWith('/ustawienia');

  return (
    <SidebarFooter
      className="px-3 py-2 relative z-10"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)' }}
    >
      {/* Apple-glass separator */}
      <div className="pointer-events-none absolute top-0 inset-x-3 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      {/*
        ── DWA UKŁADY, BO DWIE RÓŻNE SZEROKOŚCI ──────────────────────────
        Rozwinięty pasek dostaje `PasekKart` — trzy karty (Aktywność, Profil,
        Postęp) rozwijające się w górę, wzorzec „Motion Tabs Menu" wskazany
        przez Michała. Zwinięty pasek to szyna 56 px: nie zmieści etykiet ani
        wykresu, więc zostaje przy sprawdzonych kontrolkach, które SAME
        obsługują stan zwinięty (UserMenu i NotificationBell mają własne
        gałęzie dla szyny). Lepszy jeden działający układ na wąsko niż
        wciskanie panelu tam, gdzie nie ma dla niego miejsca.
      */}
      {/* Kafelek `ByteBalance` USUNIĘTY z rozwiniętego paska (19.08, decyzja
          Michała): saldo stoi teraz w karcie „Saldo" wraz z wykresem zużycia
          i przyciskiem doładowania, a ikoną tej karty jest sam znak waluty.
          Dwa miejsca z tą samą liczbą jedno nad drugim to szum, nie
          potwierdzenie. W stanie ZWINIĘTYM kafelek zostaje — tam nie ma karty,
          która by go zastąpiła. */}
      {!isCollapsed ? (
        <PasekKart />
      ) : (
        /* Szyna: ten sam pasek kart, tylko pionowo. Wczesniej stala tu stara
           stopka (saldo, awatar, dzwonek, ustawienia) i po zwinieciu paska
           wygladalo to jak inna aplikacja. */
        <PasekKart zwiniety />
      )}
    </SidebarFooter>
  );
}
