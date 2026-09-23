
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Bell, BellOff, Lock, Key, ShieldOff, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TwoFactorCard } from './TwoFactorCard';
import { PanicButtonSettings } from './PanicButtonSettings';
import { TwoFactorMethodDialog } from './TwoFactorMethodDialog';
import { TOTPSetupDialog } from './TOTPSetupDialog';

import { useEncryptionContext } from '@/contexts/EncryptionContext';
import { useHasManagementRole } from '@/hooks/useUserRoles';
import { RecoveryKeyModal } from '@/components/security/RecoveryKeyModal';
import { BiometricSettings } from '@/components/settings/BiometricSettings';
import { useAuthContext } from '@/contexts/AuthContext';
import { generateRecoveryKey } from '@/utils/recoveryKeyGenerator';
import { getMEKFromSession, wrapMEK, hashRecoveryKey } from '@/utils/masterKeyManager';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay,
} from '@/components/ui/alert-dialog';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'totp';
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}
function EncryptionSection() {
  const { encryptionStatus, setupEncryption, disableEncryption } = useEncryptionContext();
  const [setupLoading, setSetupLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableProgress, setDisableProgress] = useState<{ done: number; total: number } | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [activationPassword, setActivationPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();

  const handleActivateClick = () => {
    setActivationPassword('');
    setPasswordError('');
    setShowPasswordPrompt(true);
  };

  const handleActivateWithPassword = async () => {
    if (!activationPassword.trim()) {
      setPasswordError('Wpisz hasło.');
      return;
    }

    setSetupLoading(true);
    setPasswordError('');
    try {
      // Verify password by attempting sign-in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('NO_EMAIL');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: activationPassword,
      });
      if (signInError) {
        setPasswordError('Nieprawidłowe hasło.');
        setSetupLoading(false);
        return;
      }

      setShowPasswordPrompt(false);
      await setupEncryption(activationPassword);
    } catch (err: any) {
      console.error('Encryption activation failed:', err);
      const msg = err?.message === 'NO_SESSION'
        ? 'Sesja wygasła — zaloguj się ponownie.'
        : 'Nie udało się aktywować szyfrowania.';
      toast({ title: 'Błąd', description: msg, variant: 'destructive' });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleShowRecoveryKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // We can't show the original recovery key (it's not stored).
      // Generate a NEW one and re-wrap MEK.
      const mek = await getMEKFromSession();
      if (!mek) {
        toast({ title: 'Błąd', description: 'Szyfrowanie nie jest odblokowane.', variant: 'destructive' });
        return;
      }
      const newRecovery = generateRecoveryKey();
      const wrapped = await wrapMEK(mek, newRecovery);
      const recoveryHash = await hashRecoveryKey(newRecovery);
      
      await supabase
        .from('message_encryption_keys')
        .update({
          encrypted_mek_recovery: wrapped.wrappedKey,
          mek_iv_recovery: wrapped.iv,
          mek_salt: wrapped.salt,
          recovery_key_hash: recoveryHash,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      setRecoveryKey(newRecovery);
      setShowRecovery(true);
    } catch {
      toast({ title: 'Błąd', description: 'Nie udało się wygenerować nowego klucza.', variant: 'destructive' });
    }
  };

  const handleDisable = async () => {
    setDisableLoading(true);
    setDisableProgress({ done: 0, total: 0 });
    try {
      await disableEncryption((done, total) => {
        setDisableProgress({ done, total });
      });
      toast({ title: 'Szyfrowanie wyłączone', description: 'Wszystkie wiadomości zostały odszyfrowane.' });
    } catch (err: any) {
      console.error('Disable encryption failed:', err);
      toast({ title: 'Błąd', description: 'Nie udało się wyłączyć szyfrowania.', variant: 'destructive' });
    } finally {
      setDisableLoading(false);
      setDisableProgress(null);
    }
  };

  const isActive = encryptionStatus === 'ready';

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span className="font-medium text-foreground text-sm md:text-base">Szyfrowanie wiadomości AES-256</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground pr-2">
            {isActive
              ? 'Twoje nowe wiadomości są szyfrowane. Stare wiadomości pozostają w formacie tekstowym.'
              : 'Aktywuj szyfrowanie end-to-end dla swoich wiadomości czatu.'}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {isActive && (
            <Button
              variant="obwodka"
              size="sm"
              className="text-xs"
              onClick={handleShowRecoveryKey}
            >
              <Key className="w-3 h-3 mr-1" />
              Nowy klucz odzyskiwania
            </Button>
          )}
          {isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="usun" size="sm" className="text-xs" disabled={disableLoading}>
                  <ShieldOff className="w-3 h-3 mr-1" />
                  {disableLoading ? 'Wyłączanie...' : 'Wyłącz'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogPortal>
                <AlertDialogOverlay className="z-[300]" />
                <AlertDialogContent className="z-[300]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Wyłączyć szyfrowanie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Wszystkie zaszyfrowane wiadomości zostaną odszyfrowane i zapisane jako zwykły tekst.
                    Ta operacja jest nieodwracalna. Klucz szyfrowania zostanie usunięty.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {disableLoading && disableProgress && (
                  <div className="space-y-2 py-2">
                    <Progress value={disableProgress.total > 0 ? (disableProgress.done / disableProgress.total) * 100 : 0} />
                    <p className="text-xs text-muted-foreground text-center">
                      Odszyfrowywanie: {disableProgress.done} / {disableProgress.total}
                    </p>
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={disableLoading}>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisable}
                    disabled={disableLoading}
                    className="border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]"
                  >
                    Tak, wyłącz szyfrowanie
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialogPortal>
            </AlertDialog>
          )}
          {!isActive && encryptionStatus === 'needs_setup' && (
            <Button variant="glass"
              size="sm"
              onClick={handleActivateClick}
              disabled={setupLoading}
            >
              <Lock className="w-3 h-3 mr-1" />
              {setupLoading ? 'Aktywowanie...' : 'Aktywuj'}
            </Button>
          )}
          {isActive && (
            <span className="text-xs text-green-400 font-medium">● Aktywne</span>
          )}
        </div>
      </div>

      {disableLoading && disableProgress && (
        <div className="space-y-2 pt-2">
          <Progress value={disableProgress.total > 0 ? (disableProgress.done / disableProgress.total) * 100 : 0} />
          <p className="text-xs text-muted-foreground text-center">
            Odszyfrowywanie wiadomości: {disableProgress.done} / {disableProgress.total}
          </p>
        </div>
      )}

      {showRecovery && recoveryKey && (
        <RecoveryKeyModal
          open={showRecovery}
          recoveryKey={recoveryKey}
          onConfirmed={() => { setShowRecovery(false); setRecoveryKey(''); }}
        />
      )}

      {/* Password prompt for activation */}
      <AlertDialog open={showPasswordPrompt} onOpenChange={(open) => { if (!open) { setShowPasswordPrompt(false); setActivationPassword(''); } }}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[300]" />
          <AlertDialogContent className="z-[300]">
            <AlertDialogHeader>
              <AlertDialogTitle>Potwierdź hasło</AlertDialogTitle>
              <AlertDialogDescription>
                Wpisz hasło logowania, aby aktywować szyfrowanie. Będzie ono używane do odblokowywania zaszyfrowanych wiadomości.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="encryption-password" className="text-sm">Hasło konta</Label>
              <Input
                id="encryption-password"
                type="password"
                value={activationPassword}
                onChange={(e) => { setActivationPassword(e.target.value); setPasswordError(''); }}
                placeholder="Wpisz hasło logowania..."
                onKeyDown={(e) => e.key === 'Enter' && handleActivateWithPassword()}
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={setupLoading} onClick={() => setShowPasswordPrompt(false)}>
                Anuluj
              </AlertDialogCancel>
            <Button variant="glass" className="nb-glass-na-przezroczystym" onClick={handleActivateWithPassword} disabled={setupLoading || !activationPassword.trim()}>
              {setupLoading ? 'Weryfikacja...' : 'Aktywuj szyfrowanie'}
            </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}

export function SecurityTab() {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    twoFactorMethod: 'email',
    loginNotifications: false,
    suspiciousActivityAlerts: true
  });
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enforced2FA, setEnforced2FA] = useState(false);
  const { toast } = useToast();
  const { value: isManagementOrAdmin, isLoading: rolesLoading } = useHasManagementRole();
  const { user } = useAuthContext();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  // Auto-enable 2FA for admin/management roles
  useEffect(() => {
    if (rolesLoading || loading) return;
    if (isManagementOrAdmin) {
      setEnforced2FA(true);
      if (!securitySettings.twoFactorEnabled) {
        // Force-enable 2FA
        updateSecuritySettings({ twoFactorEnabled: true });
        toast({
          title: "2FA automatycznie włączone",
          description: "Uwierzytelnianie dwuskładnikowe jest wymagane dla Twojej roli."
        });
      }
    }
  }, [isManagementOrAdmin, rolesLoading, loading, securitySettings.twoFactorEnabled]);

  const loadSecuritySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('security_settings')
        .select('two_factor_enabled, two_factor_method, login_notifications, suspicious_activity_alerts')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSecuritySettings({
          twoFactorEnabled: data.two_factor_enabled,
          twoFactorMethod: (data as any).two_factor_method || 'email',
          loginNotifications: data.login_notifications,
          suspiciousActivityAlerts: data.suspicious_activity_alerts
        });
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać ustawień bezpieczeństwa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newSettings = {
        ...securitySettings,
        ...settings
      };

      // Check if record exists first
      const { data: existingSettings } = await supabase
        .from('security_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingSettings) {
        // Update existing record
        const result = await supabase
          .from('security_settings')
          .update({
            two_factor_enabled: newSettings.twoFactorEnabled,
            two_factor_method: newSettings.twoFactorMethod as any,
            login_notifications: newSettings.loginNotifications,
            suspicious_activity_alerts: newSettings.suspiciousActivityAlerts,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('security_settings')
          .insert({
            user_id: user.id,
            two_factor_enabled: newSettings.twoFactorEnabled,
            two_factor_method: newSettings.twoFactorMethod as any,
            login_notifications: newSettings.loginNotifications,
            suspicious_activity_alerts: newSettings.suspiciousActivityAlerts
          });
        error = result.error;
      }

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setSecuritySettings(newSettings);
      
      toast({
        title: "Sukces",
        description: "Ustawienia bezpieczeństwa zostały zaktualizowane."
      });

    } catch (error: any) {
      console.error('Failed to update security settings:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ustawień bezpieczeństwa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      // Show method selection dialog
      setShowMethodDialog(true);
    } else {
      // Wyłączamy 2FA - also unenroll TOTP if active
      if (securitySettings.twoFactorMethod === 'totp') {
        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (factors?.totp?.length) {
            for (const factor of factors.totp) {
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
          }
        } catch (err) {
          console.error('Failed to unenroll TOTP:', err);
        }
      }
      await updateSecuritySettings({ twoFactorEnabled: false, twoFactorMethod: 'email' });
      toast({
        title: "2FA wyłączone",
        description: "Uwierzytelnianie dwuskładnikowe zostało wyłączone."
      });
    }
  };

  const handleMethodSelected = async (method: 'email' | 'totp') => {
    setShowMethodDialog(false);
    if (method === 'totp') {
      // If switching from email to TOTP
      setShowTOTPSetup(true);
    } else {
      // If switching from TOTP to email, unenroll TOTP factors
      if (securitySettings.twoFactorMethod === 'totp') {
        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (factors?.totp?.length) {
            for (const factor of factors.totp) {
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
          }
        } catch (err) {
          console.error('Failed to unenroll TOTP:', err);
        }
      }
      await updateSecuritySettings({ twoFactorEnabled: true, twoFactorMethod: 'email' });
      toast({
        title: "Metoda zmieniona",
        description: "Przy następnym logowaniu otrzymasz kod na email."
      });
    }
  };

  const handleTOTPSetupComplete = () => {
    setShowTOTPSetup(false);
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true, twoFactorMethod: 'totp' }));
    toast({
      title: "TOTP aktywowane!",
      description: "Google Authenticator został skonfigurowany pomyślnie."
    });
  };

  return (
    <div className="space-y-3 md:space-y-3 p-4 md:p-0">
      {/* PRZYCISK PANIKI WROCIL NA SWOJE MIEJSCE (06.08.2026).
          Stal w zakladce „Ogolne" obok imienia, e-maila i samouczka — czyli
          funkcja bezpieczenstwa lezala w zakladce o danych osobowych.
          Michal: „poprzenosic i poukladac wszystko". */}
      <PanicButtonSettings />

      {/* Security Settings */}
      <Card className="bg-background/60 border border-border/50">
        <CardHeader className="p-4 md:p-4">
          <CardTitle className="text-lg md:text-xl text-foreground">Opcje bezpieczeństwa</CardTitle>
          <CardDescription className="text-sm md:text-base text-muted-foreground">
            Skonfiguruj dodatkowe zabezpieczenia swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-3 p-4 md:p-4">
          {/* 2-column layout: 2FA left, options right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-3">
            {/* Left column: 2FA Card */}
            <div className="flex flex-col">
              <TwoFactorCard
                enabled={securitySettings.twoFactorEnabled}
                method={securitySettings.twoFactorMethod}
                onToggle={async (enabled) => {
                  await handle2FAToggle(enabled);
                }}
                onChangeMethod={() => setShowMethodDialog(true)}
                loading={loading}
                enforced={enforced2FA}
              />
            </div>

            {/* Right column: Notification options */}
            <div className="flex flex-col gap-4 md:gap-3 justify-center">
              {/* Login Notifications */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl border border-border/40 bg-foreground/5">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    <span className="font-medium text-foreground text-sm md:text-base">Powiadomienia o logowaniu</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground pr-2">
                    Otrzymuj powiadomienia o logowaniach z nowych urządzeń
                  </p>
                </div>
                <div className="flex justify-end sm:justify-center">
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => updateSecuritySettings({ loginNotifications: checked })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Suspicious Activity Alerts */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl border border-border/40 bg-foreground/5">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <BellOff className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    <span className="font-medium text-foreground text-sm md:text-base">Alerty o podejrzanej aktywności</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground pr-2">
                    Automatyczne powiadomienia o wykrytych zagrożeniach
                  </p>
                </div>
                <div className="flex justify-end sm:justify-center">
                  <Switch
                    checked={securitySettings.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => updateSecuritySettings({ suspiciousActivityAlerts: checked })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Login */}
          {user?.email && <BiometricSettings userEmail={user.email} />}

          {/* Dialogs */}
          <TwoFactorMethodDialog
            open={showMethodDialog}
            onOpenChange={setShowMethodDialog}
            onSelectMethod={handleMethodSelected}
          />
          <TOTPSetupDialog
            open={showTOTPSetup}
            onOpenChange={setShowTOTPSetup}
            onSetupComplete={handleTOTPSetupComplete}
          />

          {/* Advanced - Collapsible */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground/80 transition-colors group w-full pt-2 border-t border-border/40">
              <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
              <span>Zaawansowane</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <EncryptionSection />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
