import React, { useState } from 'react';
import { Fingerprint, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Ripple } from '@/components/ui/ripple';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TwoFactorCardProps {
  enabled: boolean;
  method?: 'email' | 'totp';
  onToggle: (enabled: boolean) => Promise<void>;
  onChangeMethod?: () => void;
  loading?: boolean;
  enforced?: boolean;
}

export function TwoFactorCard({ enabled, method = 'email', onToggle, onChangeMethod, loading = false, enforced = false }: TwoFactorCardProps) {
  const [hovered, setHovered] = useState(false);
  const [pytamOWylaczenie, setPytamOWylaczenie] = useState(false);

  const handleClick = () => {
    if (loading) return;
    // If enforced and already enabled, don't allow disabling
    if (enforced && enabled) return;

    // WŁĄCZENIE idzie od razu — dodanie ochrony nie wymaga potwierdzenia.
    // WYŁĄCZENIE pytamy, bo cała karta to jeden wielki cel (~300×250 px),
    // a `SecurityTab` przy `false` natychmiast robi `mfa.unenroll()` dla
    // każdego czynnika. Przypadkowe kliknięcie rozbrajało 2FA nieodwracalnie
    // — TOTP trzeba potem konfigurować od zera, skanując nowy kod QR.
    if (enabled) {
      setPytamOWylaczenie(true);
      return;
    }
    onToggle(true);
  };

  const potwierdzWylaczenie = async () => {
    setPytamOWylaczenie(false);
    await onToggle(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow effect behind card */}
      <div 
        className={cn(
          "absolute -inset-2 rounded-3xl blur-xl transition-all duration-500",
          enabled 
            ? "bg-green-500/20" 
            : "bg-brand-primary/10"
        )}
      />
      
      {/* Main Card Container */}
      <div className="relative rounded-2xl border border-border/50 nb-szklo overflow-hidden">
        <Ripple
          color="text-foreground"
          opacity={0.15}
          disabled={loading}
          onClick={handleClick}
          className="w-full"
        >
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Uwierzytelnianie dwuskładnikowe
                </p>
                {enabled && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Metoda: {method === 'totp' ? 'Google Authenticator' : 'Kod email'}
                  </p>
                )}
                <p className={cn(
                  "text-lg font-bold transition-colors duration-300",
                  enabled ? "text-green-400" : "text-foreground"
                )}>
                  {enabled ? "2FA Włączone" : "2FA Wyłączone"}
                </p>
              </div>
              
              {/* Status Badge */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
                enabled 
                  ? "bg-green-500/20 border-green-500/50" 
                  : "bg-red-500/20 border-red-500/50"
              )}>
                {enforced && enabled && hovered ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="w-4 h-4 text-yellow-400 animate-pulse" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-background/95 border-yellow-500/30 text-yellow-200 text-xs max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                          <span>2FA jest wymagane dla Twojej roli (admin/zarząd)</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : enabled ? (
                  <Unlock className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            {/* Central Fingerprint Graphic */}
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                {/* Animated rings */}
                <div className={cn(
                  "absolute inset-0 -m-8 rounded-full border-2 transition-all duration-500",
                  enabled 
                    ? "border-green-500/30 animate-[fingerprint-pulse_2s_ease-in-out_infinite]" 
                    : "border-brand-primary/20"
                )} />
                <div className={cn(
                  "absolute inset-0 -m-4 rounded-full border-2 transition-all duration-500",
                  enabled 
                    ? "border-green-500/50 animate-[fingerprint-pulse_2s_ease-in-out_infinite_0.3s]" 
                    : "border-brand-primary/30"
                )} />
                
                {/* Fingerprint icon */}
                <div className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                  enabled 
                    ? "bg-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]" 
                    : "bg-brand-primary/20 shadow-[0_0_40px_rgba(var(--brand-primary),0.2)]"
                )}>
                  <Fingerprint className={cn(
                    "w-10 h-10 transition-colors duration-300",
                    enabled ? "text-green-400" : "text-brand-primary"
                  )} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Pulsing indicator */}
                <div className="relative">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-300",
                    enabled ? "bg-green-400" : "bg-red-400"
                  )} />
                  <div className={cn(
                    "absolute inset-0 w-2 h-2 rounded-full animate-ping",
                    enabled ? "bg-green-400" : "bg-red-400"
                  )} />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Weryfikacja tożsamości
                  </p>
                  <p className={cn(
                    "text-xs transition-colors duration-300",
                    enabled ? "text-green-400" : "text-muted-foreground"
                  )}>
                    {loading 
                      ? "Przetwarzanie..." 
                      : enabled 
                        ? "Konto chronione" 
                        : "Wymaga aktywacji"
                    }
                  </p>
                </div>
              </div>

              {/* Change method button — works even when enforced */}
              {enabled && onChangeMethod && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!loading) onChangeMethod();
                  }}
                  className="relative z-10 text-xs px-3 py-1.5 rounded-lg border border-border/50 bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-all duration-200"
                >
                  Zmień metodę
                </button>
              )}
            </div>
          </div>
        </Ripple>

        {/* Enforced overlay when trying to disable */}
        {enforced && enabled && hovered && (
          <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <Lock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Wymagane przez politykę bezpieczeństwa</span>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={pytamOWylaczenie} onOpenChange={setPytamOWylaczenie}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wyłączyć weryfikację dwuetapową?</AlertDialogTitle>
            <AlertDialogDescription>
              {method === 'totp'
                ? 'Twoja aplikacja uwierzytelniająca przestanie działać. Żeby wrócić do 2FA, trzeba będzie skonfigurować ją od zera i zeskanować nowy kod QR.'
                : 'Konto straci drugi stopień ochrony — od tej chwili do zalogowania wystarczy samo hasło.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zostaw włączone</AlertDialogCancel>
            <AlertDialogAction onClick={potwierdzWylaczenie}>
              Wyłącz 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
