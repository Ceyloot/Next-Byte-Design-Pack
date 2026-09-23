import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

export default function ByteBalance() {
  const { balance, loading } = useWallet();
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const previousBalance = useRef(balance);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (loading || previousBalance.current === balance) return;
    previousBalance.current = balance;
    setIsUpdating(true);
    const timer = window.setTimeout(() => setIsUpdating(false), 900);
    return () => window.clearTimeout(timer);
  }, [balance, loading]);

  const handleClick = () => {
    // NextByte IA v1.3 — klik w saldo Bytes prowadzi do huba /plan z domyślną zakładką Bytes.
    // Popup quick-buy (openBytePurchase) zostaje wyłącznie jako fallback dla gated actions (ByteGuard).
    navigate('/plan?tab=bytes');
    if (isMobile) {
      requestAnimationFrame(() => setTimeout(() => setOpenMobile(false), 150));
    }
  };

  return (
    <SidebarMenuButton
      onClick={handleClick}
      className={cn(
        "w-full flex items-center px-2 py-1.5 rounded-lg text-sm transition-all duration-200 text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary-light hover:border-brand-primary/30 border border-brand-primary/10 bg-brand-primary/5 hover:shadow-lg hover:shadow-brand-primary/20",
        isUpdating && "border-primary/50 bg-primary/15 shadow-lg shadow-primary/25"
      )}
    >
      <div className="flex items-center w-full justify-center gap-1.5">
        <span className="text-base text-brand-primary">⟠</span>
        {loading ? (
          <div className="w-12 h-3.5 bg-brand-primary/20 rounded animate-pulse"></div>
        ) : (
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            Byte{' '}
            <span className={cn("font-bold text-brand-primary transition-all duration-300", isUpdating && "text-primary scale-110 inline-block")}>{balance.toFixed(0)}</span>
          </span>
        )}
      </div>
    </SidebarMenuButton>
  );
}