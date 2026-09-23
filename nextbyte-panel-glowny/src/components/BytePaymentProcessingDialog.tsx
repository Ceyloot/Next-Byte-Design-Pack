import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, ArrowLeft, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type Phase = 'processing' | 'success' | 'failed' | 'timeout';

/*
  JAK OKNO DOWIADUJE SIĘ, ŻE BYTE DOSZŁY.

  Do 23.09.2026 polegało WYŁĄCZNIE na tym, że lista transakcji w `useWallet`
  odświeży się sama (realtime). Realtime portfela gasł przy zmianie strony
  (współdzielony kanał — patrz `useWallet`), więc okno stało 20 s i kończyło
  na „Płatność w trakcie", choć webhook zaksięgował Byte sekundę po zapłacie.
  Michał zobaczył ten ekran i uznał, że Byte nie doszły — a doszły.

  Teraz okno SAMO pyta bazę co 2 s o wpłatę z TEGO PaymentIntentu
  (`stripe_session_id` w `wallet_transactions`; Stripe dokleja `payment_intent`
  do adresu powrotu po 3DS, a kasa dokleja go przy powrocie bez przekierowania).
  Realtime zostaje jako przyspieszacz, nie jako jedyna droga.

  45 s, nie 20: BLIK potwierdzany w aplikacji banku potrafi tyle trwać, a po
  timeoucie jest przycisk „Sprawdź ponownie" — nikt nie musi odświeżać strony.
*/
const PROCESSING_TIMEOUT_MS = 45_000;
const ODSTEP_ODPYTANIA_MS = 2_000;
const SUCCESS_AUTOCLOSE_MS = 1_400;

/**
 * Enterprise-style post-payment loader.
 * Triggered by URL params after Stripe checkout:
 *   - ?byte_purchase=success[&payment_intent=pi_…] → processing → success/timeout
 *   - ?byte_purchase=failed[&error=…]              → failed (with friendly message)
 *   - ?redirect_status=succeeded&payment_intent=…  → processing (Stripe 3DS return)
 *   - ?redirect_status=failed                      → failed
 *
 * Non-breaking: if the modal never opens, the underlying
 * ByteReceivedDetector still shows the celebration popup as before.
 */
export const BytePaymentProcessingDialog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { transactions = [], invalidateWallet } = useWallet();
  const { user } = useAuthContext();
  const userId = user?.id;

  const [phase, setPhase] = useState<Phase | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const openedAtRef = useRef<number>(0);
  const initialTxIdsRef = useRef<Set<string>>(new Set());
  const intentRef = useRef<string | null>(null);

  // ─── Detect URL trigger on mount / param change ───
  useEffect(() => {
    const bp = searchParams.get('byte_purchase');
    const rs = searchParams.get('redirect_status'); // Stripe appends on return_url after 3DS
    const err = searchParams.get('error');

    if (bp === 'failed' || rs === 'failed') {
      setPhase('failed');
      setErrorMsg(err || null);
      // Strip params so reload doesn't re-trigger
      cleanParams();
      return;
    }
    if (bp === 'success' || rs === 'succeeded') {
      intentRef.current = searchParams.get('payment_intent');
      // Snapshot current tx ids so we only react to NEW ones
      initialTxIdsRef.current = new Set(transactions.map((t) => t.id));
      openedAtRef.current = Date.now();
      setPhase('processing');
      cleanParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ─── Realtime path: watch wallet transactions for the new credit ───
  useEffect(() => {
    if (phase !== 'processing') return;
    const fresh = transactions.find(
      (t) =>
        t.amount > 0 &&
        (t.transaction_type === 'purchase' || t.transaction_type === 'deposit') &&
        !initialTxIdsRef.current.has(t.id) &&
        new Date(t.created_at).getTime() >= openedAtRef.current - 5_000
    );
    if (fresh) {
      setPhase('success');
    }
  }, [transactions, phase]);

  // ─── Polling path: ask the database directly about THIS payment ───
  useEffect(() => {
    if (phase !== 'processing' || !userId) return;
    let zywy = true;

    const sprawdz = async () => {
      const pi = intentRef.current;
      let zapytanie = supabase
        .from('wallet_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('transaction_type', 'deposit');
      zapytanie = pi
        ? zapytanie.eq('stripe_session_id', pi)
        /* Bez identyfikatora płatności (stare adresy powrotu) zostaje okno
           czasowe: wpłata nie starsza niż otwarcie okna minus 5 s. */
        : zapytanie.gte('created_at', new Date(openedAtRef.current - 5_000).toISOString());
      const { data, error } = await zapytanie.limit(1);
      if (!zywy || error) return;
      if (data && data.length > 0) {
        setPhase('success');
      }
    };

    void sprawdz();
    const zegar = window.setInterval(() => { void sprawdz(); }, ODSTEP_ODPYTANIA_MS);
    return () => {
      zywy = false;
      window.clearInterval(zegar);
    };
  }, [phase, userId]);

  // ─── Timeout for processing phase ───
  useEffect(() => {
    if (phase !== 'processing') return;
    const t = window.setTimeout(() => {
      setPhase((p) => (p === 'processing' ? 'timeout' : p));
    }, PROCESSING_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // ─── Success: refresh balance + transactions (celebration popup reads them), then auto-close ───
  useEffect(() => {
    if (phase !== 'success') return;
    invalidateWallet();
    const t = window.setTimeout(() => setPhase(null), SUCCESS_AUTOCLOSE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const cleanParams = () => {
    try {
      const url = new URL(window.location.href);
      ['byte_purchase', 'redirect_status', 'payment_intent', 'payment_intent_client_secret', 'error'].forEach((k) =>
        url.searchParams.delete(k)
      );
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
    } catch {
      /* noop */
    }
  };

  const open = phase !== null;
  const allowClose = phase !== 'processing' && phase !== 'success';

  const handleOpenChange = (next: boolean) => {
    if (!next && allowClose) setPhase(null);
  };

  const handleRetry = () => {
    setPhase(null);
    navigate('/sklep');
  };

  /* Ponowne sprawdzenie po timeoucie: ten sam PaymentIntent, nowy zegar. */
  const sprawdzPonownie = () => {
    openedAtRef.current = Date.now();
    setPhase('processing');
  };

  return (
    <NextByteModal
      open={open}
      onOpenChange={handleOpenChange}
      title={
        phase === 'success'
          ? 'Płatność zaksięgowana'
          : phase === 'failed'
          ? 'Płatność nieudana'
          : phase === 'timeout'
          ? 'Płatność w trakcie'
          : 'Potwierdzamy płatność'
      }
      description={
        phase === 'processing'
          ? 'Łączymy się ze Stripe, by potwierdzić Twoją transakcję…'
          : phase === 'success'
          ? 'Byte zostały dodane do Twojego portfela.'
          : phase === 'failed'
          ? 'Transakcja nie została przetworzona.'
          : phase === 'timeout'
          ? 'Byte pojawią się na koncie zaraz po potwierdzeniu przez bank.'
          : undefined
      }
      icon={
        phase === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : phase === 'failed' ? (
          <AlertTriangle className="w-5 h-5 text-white" />
        ) : phase === 'timeout' ? (
          <ShieldCheck className="w-5 h-5 text-white" />
        ) : (
          <Coins className="w-5 h-5 text-white" />
        )
      }
      headerColor={
        phase === 'success'
          ? '#10b981'
          : phase === 'failed'
          ? '#ef4444'
          : phase === 'timeout'
          ? '#f59e0b'
          : undefined
      }
      maxWidth="lg"
      hideCloseButton={!allowClose}
      footer={
        phase === 'failed' ? (
          <>
            <Button variant="outline" onClick={() => setPhase(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zamknij
            </Button>
            <Button variant="nextbyte" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" /> Spróbuj ponownie
            </Button>
          </>
        ) : phase === 'timeout' ? (
          <>
            <Button variant="outline" onClick={() => setPhase(null)}>
              Rozumiem
            </Button>
            <Button variant="nextbyte" onClick={sprawdzPonownie}>
              <RefreshCw className="w-4 h-4 mr-2" /> Sprawdź ponownie
            </Button>
          </>
        ) : null
      }
    >
      <div className="min-h-[220px] flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <div
                  className={cn(
                    'relative w-20 h-20 rounded-full flex items-center justify-center',
                    'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30',
                    'shadow-[0_8px_40px_hsl(var(--primary)/0.25)]'
                  )}
                >
                  <Loader2 className="w-9 h-9 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="text-sm font-medium text-foreground">Potwierdzamy płatność u Stripe</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To zwykle trwa kilka sekund. Przy BLIK-u potwierdź płatność w aplikacji banku.
                </p>
              </div>
              <ProcessingDots />
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-3xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_8px_40px_rgba(16,185,129,0.45)]">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 16 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </div>
              <p className="text-base font-semibold text-foreground">Wszystko gotowe!</p>
              <p className="text-xs text-muted-foreground">Za chwilę pojawi się Twój bonus 🎉</p>
            </motion.div>
          )}

          {phase === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/25 blur-3xl" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-[0_8px_40px_rgba(239,68,68,0.45)]">
                  <AlertTriangle className="w-10 h-10 text-white" strokeWidth={2.2} />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="text-sm font-medium text-foreground">Nie udało się dokończyć płatności</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorMsg
                    ? errorMsg
                    : 'Twoja karta nie została obciążona. Możesz spróbować ponownie lub wybrać inną metodę płatności.'}
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'timeout' && (
            <motion.div
              key="timeout"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-3xl" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_8px_40px_rgba(245,158,11,0.45)]">
                  <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2.2} />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="text-sm font-medium text-foreground">Bank jeszcze nie potwierdził płatności</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Karta nie zostanie obciążona dwa razy. Gdy potwierdzenie dotrze, Byte wpadną na konto
                  automatycznie — możesz to sprawdzić przyciskiem poniżej albo w zakładce Faktury.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NextByteModal>
  );
};

const ProcessingDots: React.FC = () => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);
