import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUnifiedNotifications, type UnifiedNotification } from '@/hooks/useUnifiedNotifications';
import { NotificationRow } from './NotificationRow';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  variant?: 'header' | 'floating';
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ variant = 'header', className }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUnifiedNotifications();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [prevUnread, setPrevUnread] = useState(unreadCount);

  // Pulse badge when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnread) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, prevUnread]);

  const handleOpen = async (n: UnifiedNotification) => {
    await markAsRead(n);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nowych)` : ''}`}
      className={cn(
        'relative h-8 w-8 p-2 nb-szklo border border-primary/20 shadow-xl rounded-lg',
        'hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 hover:bg-card/60 transition-all duration-300',
        '[&_svg]:text-foreground',
        className
      )}
    >
      <Bell className="h-4 w-4 text-foreground" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground',
            'text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.6)]',
            pulse && 'animate-pulse'
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );

  const listContent = (
    <>
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/[0.03] to-transparent">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Powiadomienia</h3>
          <p className="text-[11px] text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystko przeczytane'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Oznacz wszystkie
          </Button>
        )}
      </div>

      <ScrollArea className={cn('w-full', isMobile ? 'h-[70vh]' : 'h-[480px]')}>
        <div className="p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-sm font-medium text-foreground">Brak powiadomień</p>
              <p className="text-xs text-muted-foreground mt-1">Nowe pojawią się tutaj na żywo</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onOpen={() => handleOpen(n)} onMarkRead={() => { markAsRead(n); }} />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );

  const glassClass =
    'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/25 shadow-[0_8px_40px_hsl(var(--primary)/0.18)]';

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className={cn('p-0 max-h-[85vh] rounded-t-2xl overflow-hidden', glassClass)}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Powiadomienia</SheetTitle>
          </SheetHeader>
          {listContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn('w-[380px] p-0 overflow-hidden rounded-2xl nb-szklo-nawigacja nb-szklo-lista', glassClass)}
      >
        {listContent}
      </PopoverContent>
    </Popover>
  );
};
