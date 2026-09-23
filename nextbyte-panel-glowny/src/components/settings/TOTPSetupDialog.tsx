import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Smartphone, Check, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

interface TOTPSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: () => void;
}

type SetupStep = 'qr' | 'verify' | 'success';

export const TOTPSetupDialog = ({ open, onOpenChange, onSetupComplete }: TOTPSetupDialogProps) => {
  const [step, setStep] = useState<SetupStep>('qr');
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [factorId, setFactorId] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEnroll = useCallback(async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Google Authenticator',
      });

      if (error) {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zainicjować TOTP',
          variant: 'destructive',
        });
        return;
      }

      if (data?.totp?.qr_code) {
        setQrCodeSvg(data.totp.qr_code);
        setFactorId(data.id);
        setSecret(data.totp.secret || '');
        setStep('qr');
      }
    } catch (err: any) {
      toast({
        title: 'Błąd',
        description: 'Wystąpił nieoczekiwany błąd',
        variant: 'destructive',
      });
    } finally {
      setEnrolling(false);
    }
  }, [toast]);

  // Auto-enroll when dialog opens
  React.useEffect(() => {
    if (open && !qrCodeSvg && !enrolling) {
      handleEnroll();
    }
    if (!open) {
      // Reset state on close
      setStep('qr');
      setQrCodeSvg('');
      setFactorId('');
      setSecret('');
      setVerificationCode('');
      setCopied(false);
    }
  }, [open]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    setLoading(true);

    try {
      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        toast({
          title: 'Błąd',
          description: challengeError.message || 'Nie udało się zweryfikować',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verify with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) {
        toast({
          title: 'Nieprawidłowy kod',
          description: 'Sprawdź kod w aplikacji i spróbuj ponownie.',
          variant: 'destructive',
        });
        setVerificationCode('');
        setLoading(false);
        return;
      }

      // Save method to security_settings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('security_settings')
          .upsert({
            user_id: user.id,
            two_factor_enabled: true,
            two_factor_method: 'totp' as any,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }

      setStep('success');
      setTimeout(() => {
        onSetupComplete();
        onOpenChange(false);
      }, 1500);
    } catch {
      toast({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas weryfikacji',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-effect border-brand-primary/30 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-4 border-b border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground font-bold">
                Konfiguracja Google Authenticator
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {step === 'qr' && 'Zeskanuj kod QR w aplikacji'}
                {step === 'verify' && 'Wprowadź kod z aplikacji'}
                {step === 'success' && 'Konfiguracja zakończona!'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <AnimatePresence mode="wait">
            {step === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Instructions */}
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>1. Otwórz aplikację <strong className="text-foreground">Google Authenticator</strong></p>
                  <p>2. Naciśnij <strong className="text-foreground">+</strong> i wybierz "Zeskanuj kod QR"</p>
                  <p>3. Zeskanuj poniższy kod</p>
                </div>

                {/* QR Code */}
                {qrCodeSvg ? (
                  <div className="flex justify-center">
                    <div
                      className="bg-white rounded-xl p-4 w-fit"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(qrCodeSvg, { USE_PROFILES: { svg: true } }) }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="w-48 h-48 bg-foreground/5 rounded-xl animate-pulse" />
                  </div>
                )}

                {/* Manual secret */}
                {secret && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Nie możesz zeskanować? Wpisz klucz ręcznie:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-foreground/5 border border-border/40 rounded-lg px-3 py-2 text-brand-primary font-mono break-all">
                        {secret}
                      </code>
                      <Button
                        variant="cichy"
                        size="sm"
                        onClick={copySecret}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="relative w-full group">
                  <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary bg-[length:200%_100%] ${!qrCodeSvg ? 'opacity-30' : 'opacity-100 group-hover:animate-gradient-x'} transition-opacity duration-300`} />
                  <Button variant="glass"
                    onClick={() => setStep('verify')}
                    className="w-full h-12"
                    disabled={!qrCodeSvg}
                  >
                    Dalej — Wpisz kod
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground text-center">
                  Wpisz 6-cyfrowy kod z aplikacji Google Authenticator
                </p>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    disabled={loading}
                  >
                    <InputOTPGroup className="gap-2">
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-11 h-12 border-border/50 bg-foreground/5 text-foreground text-lg rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="obwodka"
                    onClick={() => { setStep('qr'); setVerificationCode(''); }}
                    disabled={loading}
                    className="flex-1 h-12"
                  >
                    Wstecz
                  </Button>
                  <div className="flex-1 relative group">
                    <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary bg-[length:200%_100%] ${verificationCode.length === 6 && !loading ? 'animate-gradient-x opacity-100' : 'opacity-30'} transition-opacity duration-300`} />
                    <Button variant="glass"
                      onClick={handleVerify}
                      disabled={loading || verificationCode.length !== 6}
                      className="relative w-full h-12 rounded-xl bg-background/90 hover:bg-background/80 text-foreground font-medium shadow-lg border-0 disabled:opacity-50"
                    >
                      {loading ? 'Weryfikacja...' : 'Aktywuj TOTP'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-lg font-bold text-foreground">TOTP aktywowane!</p>
                <p className="text-sm text-muted-foreground text-center">
                  Google Authenticator został skonfigurowany pomyślnie.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
