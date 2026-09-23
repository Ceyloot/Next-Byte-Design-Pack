import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Check, X, Eye, EyeOff } from 'lucide-react';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { AssistedPasswordConfirmation } from '@/components/ui/AssistedPasswordConfirmation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { odczytajUtm, zapomnijUtm } from '@/lib/utmRejestracji';

interface MandatoryAccountSetupStepProps {
  onSuccess: () => void;
}

/**
 * Pierwsza, OBOWIĄZKOWA karta wizarda dla użytkowników "pure Google"
 * bez ustawionego hasła. Zbiera imię, nazwisko i hasło, blokując dalsze
 * kroki samouczka dopóki nie zostaną zapisane.
 */
export const MandatoryAccountSetupStep: React.FC<MandatoryAccountSetupStepProps> = ({ onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validation = usePasswordValidation(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const canSubmit =
    validation.valid &&
    passwordsMatch &&
    trimmedFirstName.length > 0 &&
    trimmedLastName.length > 0 &&
    !isLoading;

  useEffect(() => {
    let cancelled = false;

    const prefillUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const metadata = user.user_metadata ?? {};
        const fullName = String(metadata.full_name || metadata.name || '').trim();
        const [metadataFirstName = '', ...metadataLastNameParts] = fullName.split(/\s+/).filter(Boolean);
        const metadataLastName = metadataLastNameParts.join(' ');

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name,last_name')
          .eq('id', user.id)
          .maybeSingle();

        if (cancelled) return;

        const nextFirstName = String(profile?.first_name || metadata.first_name || metadata.given_name || metadataFirstName || '').trim();
        const nextLastName = String(profile?.last_name || metadata.last_name || metadata.family_name || metadataLastName || '').trim();

        if (nextFirstName) setFirstName(current => current || nextFirstName);
        if (nextLastName) setLastName(current => current || nextLastName);
      } catch (error) {
        console.warn('[MandatorySetup] User data prefill skipped:', error);
      }
    };

    prefillUserData();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Client-side fallback if edge function is unreachable */
  const clientSideFallback = async () => {
    console.log('[MandatorySetup] Edge function failed, using client-side profile fallback');

    // Update profile only after password was accepted by Supabase Auth.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesja wygasła. Zaloguj się ponownie.');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        password_set: true,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    await supabase.auth.refreshSession();

    return { passwordSet: true, warning: null };
  };

  const handleSubmit = async () => {
    console.log('[MandatorySetup] Submit clicked', { canSubmit, validationValid: validation.valid, passwordsMatch });
    if (!canSubmit) {
      if (!trimmedFirstName) {
        toast({ title: 'Uzupełnij imię', variant: 'destructive' });
      } else if (!trimmedLastName) {
        toast({ title: 'Uzupełnij nazwisko', variant: 'destructive' });
      } else if (!validation.valid) {
        toast({ title: 'Hasło nie spełnia wymagań', description: validation.errors?.join(', '), variant: 'destructive' });
      } else if (!passwordsMatch) {
        toast({ title: 'Hasła nie są identyczne', variant: 'destructive' });
      }
      return;
    }
    setIsLoading(true);
    try {
      // 1) Set password client-side first — this preserves the current session and
      // prevents unblocking the account if Supabase rejects the password.
      let result: { passwordSet?: boolean; warning?: string | null } | null = null;

      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      try {
        // 2) Save metadata + profile server-side after password succeeds.
        const { data: setupData, error: setupError } = await supabase.functions.invoke('complete-google-account-setup', {
          body: {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            password,
            /*
              Źródło wejścia — zapamiętane na stronie logowania, bo droga przez
              Google (popup → /auth/callback → ten dialog) gubi parametry
              z adresu. Bez tego 24 konta z Google miały puste
              `registration_source`, a zakładka „Rejestracje" pokazywała
              wykres bez połowy ruchu.
            */
            utmData: odczytajUtm(),
          },
        });

        if (setupError) throw setupError;
        if (setupData?.success === false) throw new Error(setupData.error || 'Nie udało się zapisać konta');

        result = { passwordSet: true, warning: null };
      } catch (edgeFnError: any) {
        console.warn('[MandatorySetup] Profile edge function error, falling back to client-side:', edgeFnError?.message);
        result = await clientSideFallback();
      }


      // Extra safety: ensure we still have a valid session after password change
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.warn('[MandatorySetup] Session lost after password set, attempting recovery');
        await supabase.auth.refreshSession();
      }

      // Źródło wejścia zużyte — kolejne konto z tej samej karty ma go nie odziedziczyć.
      zapomnijUtm();

      toast({
        title: result?.passwordSet === false ? 'Konto aktywowane' : 'Konto zabezpieczone',
        description: result?.warning || 'Hasło ustawione. Możesz teraz korzystać z platformy.',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error in mandatory account setup:', error);
      const raw = String(error?.message || '');
      const lower = raw.toLowerCase();
      let description = raw || 'Spróbuj ponownie.';

      if (lower.includes('same') && lower.includes('password')) {
        description = 'To hasło było już używane na tym koncie. Wybierz inne.';
      } else if (lower.includes('weak') || lower.includes('pwned') || lower.includes('known') || lower.includes('easy to guess')) {
        description = 'To hasło wyciekło w publicznych bazach danych i zostało odrzucone. Użyj innego, unikalnego hasła.';
      } else if (lower.includes('reauth') || lower.includes('session') || lower.includes('jwt') || lower.includes('expired')) {
        description = 'Sesja wygasła. Zaloguj się ponownie i powtórz ten krok.';
      } else if (lower.includes('rate') || lower.includes('too many')) {
        description = 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.';
      } else if (lower.includes('fetch') || lower.includes('network')) {
        description = 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';
      }

      toast({
        title: 'Błąd zapisu',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      key="mandatory-setup"
      className="flex flex-col py-4 px-4 h-full overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 text-left">
          <h2 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
            Dokończ zakładanie konta
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Krok jednorazowy — chroni Twoje konto
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed text-left">
        Zalogowałeś się przez Google. Aby móc korzystać z resetu hasła, weryfikacji 2FA email
        i pełnego bezpieczeństwa konta — uzupełnij imię, nazwisko i ustaw hasło.
        Po tym kroku możesz logować się oboma metodami.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="mas-firstName" className="text-xs font-medium">Imię</Label>
            <Input
              id="mas-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jan"
              disabled={isLoading}
              autoComplete="given-name"
              autoFocus
              className="h-11"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label htmlFor="mas-lastName" className="text-xs font-medium">Nazwisko</Label>
            <Input
              id="mas-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kowalski"
              disabled={isLoading}
              autoComplete="family-name"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="mas-password" className="text-xs font-medium">Nowe hasło</Label>
          <div className="relative">
            <Input
              id="mas-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 12 znaków"
              disabled={isLoading}
              autoComplete="new-password"
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AssistedPasswordConfirmation
          password={password}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          disabled={isLoading}
        />

        {password.length > 0 && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg border border-border/50 text-left">
            <p className="text-xs font-medium text-foreground">Wymagania:</p>
            <div className="space-y-1">
              {validation.requirements.map((req) => (
                <div
                  key={req.id}
                  className={`text-xs flex items-center gap-2 transition-colors ${
                    req.met ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  {req.met ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          aria-disabled={!canSubmit}
          className="w-full h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/10 text-sm font-semibold disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              Zapisywanie...
            </>
          ) : (
            'Zapisz i kontynuuj'
          )}
        </Button>
      </div>
    </motion.div>
  );
};
