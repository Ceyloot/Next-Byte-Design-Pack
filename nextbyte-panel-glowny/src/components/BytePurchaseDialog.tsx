import React, { useState, useEffect, useMemo } from 'react';
import { Coins, Zap, Gift, Loader2, Star, Key, Sparkles, Clock, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';
import { FuturisticLoader } from '@/components/ui/futuristic-loader';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { cn } from '@/lib/utils';
import { formatBytesPerPln, formatGroszPerByte } from '@/lib/bytePricing';
import { useByteSpecialOffer, useOfferCountdown, useUserOfferPurchaseCount } from '@/hooks/useByteSpecialOffer';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import byteCoinIcon from '@/assets/byte-coin-icon.png.asset.json';

interface CurrencyPackage {
  id: string;
  name: string;
  byte_amount: number;
  price_pln: number;
  bonus_bytes: number;
  is_active: boolean;
  is_code_locked?: boolean;
  redeem_code?: string | null;
  code_description?: string | null;
}

interface BytePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredBytes: number;
  currentBalance: number;
  itemName?: string;
  onPurchaseSuccess?: () => void;
}

export const BytePurchaseDialog: React.FC<BytePurchaseDialogProps> = ({
  open,
  onOpenChange,
  requiredBytes,
  currentBalance,
  itemName,
  onPurchaseSuccess
}) => {
  const [packages, setPackages] = useState<CurrencyPackage[]>([]);
  const [unlockedPackages, setUnlockedPackages] = useState<CurrencyPackage[]>([]);
  const [unlockedCodes, setUnlockedCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const { purchaseCurrencyPackage } = useWallet();
  const { data: offer } = useByteSpecialOffer(open);
  const { remaining: offerRemaining } = useOfferCountdown(offer?.ends_at);
  const { data: offerPurchasedCount = 0 } = useUserOfferPurchaseCount(offer?.id ?? null, open);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        // Pobieramy wszystkie aktywne i odfiltrowujemy code-locked po stronie klienta
        // (kolumna is_code_locked może nie istnieć w starszych instalacjach).
        const { data, error } = await (supabase as any)
          .from('currency_packages')
          .select('*')
          .eq('is_active', true)
          .order('price_pln', { ascending: true });

        if (error) throw error;
        const all = ((data as any[]) || []) as CurrencyPackage[];
        setPackages(all.filter((p) => !p.is_code_locked));
      } catch (error) {
        console.error('Error fetching currency packages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPackages();
    }
  }, [open]);

  const handlePurchase = async (
    packageId: string,
    options?: { offerId?: string; redeemCode?: string }
  ) => {
    setLoadingPackageId(packageId);
    try {
      await purchaseCurrencyPackage(packageId, options);
      onPurchaseSuccess?.();
      onOpenChange(false);
    } finally {
      setLoadingPackageId(null);
    }
  };

  const handleRedeemCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const raw = codeInput.trim();
    if (!raw) return;
    setRedeeming(true);
    setCodeError(null);
    try {
      const { data, error } = await (supabase as any).rpc('redeem_byte_code', { p_code: raw });
      if (error) throw error;
      const pkg = data as any as CurrencyPackage;
      if (!pkg?.id) throw new Error('Nieprawidłowy kod');
      setUnlockedPackages((prev) => (prev.some((p) => p.id === pkg.id) ? prev : [...prev, pkg]));
      setUnlockedCodes((prev) => ({ ...prev, [pkg.id]: raw }));
      setCodeInput('');
      toast.success('Pakiet odblokowany', { description: pkg.name });
    } catch (err: any) {
      const raw: string = err?.message || '';
      let msg = 'Nie udało się aktywować kodu';
      if (raw.includes('Nieprawidłowy')) msg = 'Nieprawidłowy kod — sprawdź pisownię';
      else if (raw.includes('Podaj kod')) msg = 'Wpisz kod, aby odblokować pakiet';
      else if (raw.includes('schema cache') || raw.includes('redeem_byte_code')) msg = 'System kodów chwilowo niedostępny — spróbuj za chwilę';
      setCodeError(msg);
    } finally {
      setRedeeming(false);
    }
  };

  const missingBytes = Math.max(0, requiredBytes - currentBalance);
  const isGeneralPurchase = requiredBytes === 0;

  // Bestseller: 1) flaga is_bestseller z DB (ustawiana w admin panelu),
  // 2) fallback: paczka z "plus" w nazwie, 3) ostatecznie najlepszy bonus %.
  const bestValuePkgId = useMemo(() => {
    if (!packages.length) return null;

    const flagged = packages.find((p) => (p as any).is_bestseller === true);
    if (flagged) return flagged.id;

    const plusPackage = packages.find((p) => p.name.toLowerCase().includes('plus'));
    if (plusPackage) return plusPackage.id;

    let bestId: string | null = null;
    let bestRatio = 0;
    packages.forEach((p) => {
      if (p.byte_amount <= 0) return;
      const ratio = p.bonus_bytes / p.byte_amount;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = p.id;
      }
    });
    return bestRatio > 0 ? bestId : null;
  }, [packages]);

  const offerDiscount = offer
    ? Math.round((1 - Number(offer.promo_price_pln) / Number(offer.original_price_pln)) * 100)
    : 0;

  // Pakiet powiązany z ofertą — potrzebujemy do pokazania ilości Byte
  const offerPackage = useMemo(
    () => (offer ? [...packages, ...unlockedPackages].find((p) => p.id === offer.package_id) : null),
    [offer, packages, unlockedPackages],
  );
  const offerTotalBytes = offerPackage ? offerPackage.byte_amount + (offerPackage.bonus_bytes || 0) : 0;
  const offerSavings = offer
    ? Math.max(0, Number(offer.original_price_pln) - Number(offer.promo_price_pln))
    : 0;
  const offerMaxPerUser = offer?.max_per_user && offer.max_per_user > 0 ? Number(offer.max_per_user) : null;
  const offerLimitReached = offerMaxPerUser != null && offerPurchasedCount >= offerMaxPerUser;


  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title={isGeneralPurchase ? 'Doładuj Byte' : 'Niewystarczające środki'}
      description={
        isGeneralPurchase
          ? 'Wybierz pakiet — większe = więcej bonusów'
          : itemName ? `Doładuj, aby kupić "${itemName}"` : 'Doładuj, aby dokończyć zakup'
      }
      icon={<img src={byteCoinIcon.url} alt="Byte" className="h-10 w-10 rounded-xl object-cover -m-0" />}
      maxWidth="3xl"
    >
      <div className="space-y-3">
        {/* Balance summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Saldo</span>
            <span className="text-primary font-bold text-sm">{currentBalance}⟠</span>
          </div>
          {!isGeneralPurchase && (
            <>
              <div className="flex-1 min-w-[140px] px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                <span className="text-muted-foreground">Brakuje</span>
                <span className="text-red-400 font-bold">{missingBytes}⟠</span>
              </div>
              <div className="flex-1 min-w-[140px] px-3 py-2 rounded-md bg-foreground/5 border border-border/40 flex items-center justify-between">
                <span className="text-muted-foreground">Wymagane</span>
                <span className="text-foreground font-semibold">{requiredBytes}⟠</span>
              </div>
            </>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FuturisticLoader size="md" showReflection={false} />
              <span className="text-muted-foreground text-sm">Ładowanie pakietów...</span>
            </div>
          ) : (
            <>
              {/* Limited-time promo banner — full width across grid */}
              {offer && (
                <button
                  type="button"
                  onClick={() => !loadingPackageId && !offerLimitReached && handlePurchase(offer.package_id, { offerId: offer.id })}
                  disabled={!!loadingPackageId || offerLimitReached}
                  aria-label={offerLimitReached ? 'Oferta już zakupiona — limit osiągnięty' : `Kup ofertę ${offer.title}`}
                  className={cn(
                    "relative w-full mb-3 text-left rounded-2xl overflow-hidden",
                    "bg-gradient-to-br from-primary/15 to-primary/5",
                    "border border-primary/30 shadow-[0_8px_40px_hsl(var(--primary)/0.18)]",
                    "transition-all duration-300",
                    !offerLimitReached && "hover:border-primary/60 hover:shadow-[0_12px_50px_hsl(var(--primary)/0.28)]",
                    "after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent",
                    "disabled:cursor-not-allowed",
                    loadingPackageId && "opacity-60 cursor-wait",
                  )}
                >
                  <div className="relative w-full">
                  {/* Inner content opacity dims when reached so overlay/badge pop */}
                  <div className={cn(offerLimitReached && "opacity-40 saturate-50 grayscale")}>

                  {(offer.image_desktop_url || offer.image_mobile_url) && (
                    <div className="relative w-full overflow-hidden">
                      {offer.image_mobile_url && (
                        <img
                          src={offer.image_mobile_url}
                          alt={offer.image_alt || offer.title}
                          className="block sm:hidden w-full aspect-[4/5] object-cover"
                          loading="lazy"
                        />
                      )}
                      {offer.image_desktop_url && (
                        <img
                          src={offer.image_desktop_url}
                          alt={offer.image_alt || offer.title}
                          className={cn(
                            "w-full aspect-video object-cover",
                            offer.image_mobile_url ? "hidden sm:block" : "block",
                          )}
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/10 to-transparent pointer-events-none" />

                      {/* Naroża zdjęcia — discount % (top-left) + countdown (top-right) */}
                      {offerDiscount > 0 && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 group/badge">
                          <div className="nb-szklo nb-szklo-plynne relative flex flex-col items-center justify-center min-w-[3.75rem] sm:min-w-[5.5rem] px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 shadow-[0_8px_40px_hsl(var(--primary)/0.25)] overflow-hidden after:content-[''] after:absolute after:top-0 after:left-2 after:right-2 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-primary/80 leading-none">Taniej</span>
                            <span className="text-base sm:text-2xl font-black leading-none mt-0.5 sm:mt-1 tabular-nums whitespace-nowrap bg-gradient-to-b from-foreground to-primary bg-clip-text text-transparent drop-shadow-[0_2px_8px_hsl(var(--primary)/0.4)]">
                              -{offerDiscount}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col items-end gap-1 sm:gap-1.5">
                        <span className="relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full nb-szklo nb-szklo-plynne text-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden after:content-[''] after:absolute after:top-0 after:left-2 after:right-2 after:h-px after:bg-gradient-to-r after:from-transparent after:via-red-400/70 after:to-transparent">
                          <span className="relative flex w-1.5 h-1.5">
                            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                            <span className="relative w-1.5 h-1.5 rounded-full bg-red-400" />
                          </span>
                          Kończy się
                        </span>
                        <span className="relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl nb-szklo nb-szklo-plynne text-foreground text-[11px] sm:text-sm font-bold tabular-nums border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden after:content-[''] after:absolute after:top-0 after:left-2 after:right-2 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          {offerRemaining || '…'}
                        </span>
                      </div>

                      {/* Top-center — LIMITOWANA badge z licznikiem X/Y */}
                      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20">
                        <span className={cn(
                          "inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] whitespace-nowrap tabular-nums",
                          offerLimitReached
                            ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                            : "bg-primary/20 text-primary border border-primary/40 shadow-[0_4px_20px_hsl(var(--primary)/0.35)]"
                        )}>
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Limitowana
                          {offerMaxPerUser != null && (
                            <>
                              <span className="opacity-40">·</span>
                              <span>{Math.max(0, offerMaxPerUser - offerPurchasedCount)}/{offerMaxPerUser}</span>
                            </>
                          )}
                        </span>
                      </div>



                      {/* Bottom overlay — Glass info card (title + price) */}
                      <div className="absolute left-3 right-3 bottom-3">
                        <div className="relative rounded-2xl nb-szklo nb-szklo-plynne border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden after:content-[''] after:absolute after:top-0 after:left-4 after:right-4 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
                          <div className="relative p-3 sm:p-3.5">
                            {/* HEADER: title + opcjonalny opis */}
                            <div className="mb-2">
                              <span className="text-sm sm:text-base font-bold text-foreground truncate block">{offer.title}</span>
                              {offer.subtitle && (
                                <span className="text-[11px] sm:text-xs text-muted-foreground/90 leading-snug mt-0.5 line-clamp-2">
                                  {offer.subtitle}
                                </span>
                              )}
                            </div>

                            {/* Row: REWARD | PRICE */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2.5 sm:gap-4">
                              {offerTotalBytes > 0 && (
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] uppercase tracking-[0.18em] text-primary/90 font-bold">Otrzymujesz</span>
                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums leading-none drop-shadow-[0_2px_10px_hsl(var(--primary)/0.5)]">
                                      {offerTotalBytes.toLocaleString('pl-PL')}
                                    </span>
                                    <span className="text-lg sm:text-xl font-black text-primary leading-none">⟠</span>
                                  </div>
                                </div>
                              )}


                              <div className="flex flex-col items-start sm:items-end">
                                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Twoja cena</span>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[11px] text-muted-foreground/70 line-through tabular-nums">
                                    {Number(offer.original_price_pln).toLocaleString('pl-PL')} zł
                                  </span>
                                  <span className="text-xl sm:text-2xl font-black text-primary tabular-nums leading-none drop-shadow-[0_2px_10px_hsl(var(--primary)/0.5)]">
                                    {Number(offer.promo_price_pln).toLocaleString('pl-PL')} zł
                                  </span>
                                </div>
                                {offerSavings > 0 && (
                                  <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider tabular-nums">
                                    Oszczędzasz {offerSavings.toLocaleString('pl-PL')} zł
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Fallback (no image) — keep inline layout */}
                  {!offer.image_desktop_url && !offer.image_mobile_url && (
                    <div className="relative p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                            <Sparkles className="w-2.5 h-2.5" /> Limitowana oferta
                          </span>
                          {offerDiscount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tabular-nums">
                              -{offerDiscount}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/30 tabular-nums">
                            <Clock className="w-3 h-3" />
                            {offerRemaining || '…'}
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-bold text-foreground truncate">{offer.title}</div>
                        {offer.subtitle && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{offer.subtitle}</div>
                        )}
                        {offerTotalBytes > 0 && (
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Otrzymujesz</span>
                            <span className="text-2xl font-black text-foreground tabular-nums leading-none">
                              {offerTotalBytes.toLocaleString('pl-PL')}
                            </span>
                            <span className="text-lg font-black text-primary leading-none">⟠</span>
                            {offerPackage && offerPackage.bonus_bytes > 0 && (
                              <span className="text-[11px] text-emerald-300 font-semibold ml-1">
                                (+{offerPackage.bonus_bytes.toLocaleString('pl-PL')} bonus)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                        <div className="flex flex-col sm:items-end">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground line-through tabular-nums">
                              {Number(offer.original_price_pln).toLocaleString('pl-PL')} zł
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-primary tabular-nums leading-none">
                              {Number(offer.promo_price_pln).toLocaleString('pl-PL')} zł
                            </span>
                          </div>
                          {offerSavings > 0 && (
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5 tabular-nums">
                              Oszczędzasz {offerSavings.toLocaleString('pl-PL')} zł
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-[0_4px_20px_hsl(var(--primary)/0.4)]">
                          {loadingPackageId === offer.package_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>Kup teraz</>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  </div>


                  {/* POSIADASZ overlay when limit reached */}
                  {offerLimitReached && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
                      <span className="nb-szklo nb-szklo-plynne relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-[0.25em] bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 border border-emerald-400/50 text-emerald-100 shadow-[0_8px_40px_rgba(16,185,129,0.35)]">
                        <CheckCircle2 className="w-4 h-4" />
                        Posiadasz
                      </span>
                    </div>
                  )}
                  </div>
                </button>
              )}


              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {[...packages, ...unlockedPackages].map((pkg) => {
                  const totalBytes = pkg.byte_amount + pkg.bonus_bytes;
                  const hasBonus = pkg.bonus_bytes > 0;
                  const willCoverCost = !isGeneralPurchase && (totalBytes + currentBalance >= requiredBytes);
                  const isBestValue = pkg.id === bestValuePkgId;
                  const isUnlocked = !!unlockedCodes[pkg.id];
                  const pricePerByte = totalBytes > 0 ? formatGroszPerByte(totalBytes, pkg.price_pln) : '—';
                  const bonusPercent = pkg.byte_amount > 0 ? Math.round((pkg.bonus_bytes / pkg.byte_amount) * 100) : 0;
                  const isLoading = loadingPackageId === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() =>
                        !isLoading &&
                        handlePurchase(pkg.id, isUnlocked ? { redeemCode: unlockedCodes[pkg.id] } : undefined)
                      }
                      disabled={isLoading}
                      className={cn(
                        "relative text-left p-3 rounded-xl border transition-all duration-200",
                        "bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01]",
                        "border-border/40 hover:border-primary/50 hover:from-primary/10 hover:to-primary/[0.02]",
                        "hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5",
                        "focus:outline-none focus:ring-2 focus:ring-primary/60",
                        "disabled:opacity-60 disabled:cursor-wait",
                        willCoverCost && "ring-2 ring-primary/60 border-primary/60",
                        isBestValue && !willCoverCost && "ring-1 ring-primary/40 border-primary/40 bg-primary/[0.06]",
                        isUnlocked && "ring-2 ring-primary/70 border-primary/70 bg-primary/[0.08] shadow-[0_0_24px_hsl(var(--primary)/0.25)]"
                      )}
                    >
                      {/* Top badges row */}
                      <div className="flex items-center justify-between min-h-[18px] mb-1">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                            <Key className="w-2.5 h-2.5" /> Twój kod
                          </span>
                        ) : isBestValue ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/35 shadow-[0_0_18px_hsl(var(--primary)/0.18)]">
                            <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                          </span>
                        ) : willCoverCost ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/90 text-foreground">
                            ✓ Wystarczy
                          </span>
                        ) : (
                          <span />
                        )}
                        {hasBonus && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 text-primary border border-primary/30">
                            <Gift className="w-2.5 h-2.5" />
                            +{bonusPercent}%
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                        {pkg.name}
                      </div>

                      {/* Total bytes */}
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl md:text-[26px] font-extrabold text-foreground leading-none tabular-nums">
                          {totalBytes.toLocaleString('pl-PL')}
                        </span>
                        <span className="text-base text-brand-primary font-bold">⟠</span>
                      </div>

                      {/* Bonus breakdown */}
                      <div className="mt-1 text-[11px] text-muted-foreground leading-tight min-h-[14px]">
                        {hasBonus ? (
                          <>
                            {pkg.byte_amount.toLocaleString('pl-PL')} <span className="text-primary/80">+{pkg.bonus_bytes.toLocaleString('pl-PL')} bonus</span>
                          </>
                        ) : (
                          <span className="opacity-0">.</span>
                        )}
                      </div>

                      {/* Price + per-byte */}
                      <div className="mt-2.5 pt-2.5 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-primary" />
                          )}
                          {pkg.price_pln} zł
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums">
                          {pricePerByte}
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] text-foreground/35 tabular-nums">
                        {formatBytesPerPln(totalBytes, pkg.price_pln)} z bonusem
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Apple-style glassmorphism redeem code field */}
              <form onSubmit={handleRedeemCode} className="mt-4">
                <div
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-2xl",
                    "nb-szklo border transition-all duration-200",
                    codeError ? "border-red-500/40" : "border-foreground/10 focus-within:border-primary/50",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  )}
                >
                  <Tag className="w-4 h-4 text-primary/70 shrink-0" />
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value); if (codeError) setCodeError(null); }}
                    placeholder="Masz kod? Wpisz, aby odblokować pakiet"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none text-sm font-mono tracking-wide text-foreground placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    disabled={!codeInput.trim() || redeeming}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
                      "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {redeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    Odblokuj
                  </button>
                </div>
                {codeError && (
                  <p className="mt-1.5 text-[11px] text-red-400 pl-2">{codeError}</p>
                )}
              </form>

              {/* Compact info footer */}
              <div className="mt-3 px-3 py-2.5 rounded-lg bg-primary/[0.04] border border-primary/15 flex items-start gap-2">
                <span className="text-brand-primary text-sm leading-none mt-0.5">⟠</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground/80 font-medium">Przelicznik Byte/zł</span> liczymy od pełnej liczby Byte po bonusie. Dokupki są ważne 12 miesięcy.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </NextByteModal>
  );
};
