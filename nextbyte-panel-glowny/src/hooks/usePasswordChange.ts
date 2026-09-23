
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuthContext } from '@/contexts/AuthContext';
import { sanitizeInput } from '@/utils/encryption';
import { validatePasswordStrength } from '@/hooks/usePasswordValidation';

interface UsePasswordChangeProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setIsChangingPassword: (changing: boolean) => void;
  setCurrentPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
}

export const usePasswordChange = ({
  currentPassword,
  newPassword,
  confirmPassword,
  setIsChangingPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword
}: UsePasswordChangeProps) => {
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityMonitoring();
  const { signOut } = useAuthContext();

  const passwordValidation = validatePasswordStrength(newPassword);

  const changePassword = async () => {
    /* 08.09.2026: hasła NIE przechodzą przez `sanitizeInput` — ono wycina „<", „>",
       „data:" i podobne, więc hasło z takim znakiem zapisywało się okrojone, a użytkownik
       logował się później pełnym i nie wchodził. Supabase nigdy nie renderuje hasła,
       więc nie ma czego sanityzować. Nazwy zmiennych zostają dla czytelności diffu. */
    const sanitizedCurrentPassword = currentPassword;
    const sanitizedNewPassword = newPassword;
    const sanitizedConfirmPassword = confirmPassword;

    if (!sanitizedCurrentPassword) {
      toast({
        title: "Błąd",
        description: "Wprowadź aktualne hasło",
        variant: "destructive"
      });
      return;
    }

    if (!sanitizedNewPassword || !sanitizedConfirmPassword) {
      await logSecurityEvent({
        type: 'invalid_input',
        severity: 'low',
        details: 'Empty password fields submitted'
      });
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie pola",
        variant: "destructive"
      });
      return;
    }

    if (sanitizedNewPassword !== sanitizedConfirmPassword) {
      await logSecurityEvent({
        type: 'invalid_input',
        severity: 'low',
        details: 'Password confirmation mismatch'
      });
      toast({
        title: "Błąd",
        description: "Nowe hasła nie są identyczne",
        variant: "destructive"
      });
      return;
    }

    // Enhanced password validation
    const validation = validatePasswordStrength(sanitizedNewPassword);
    if (!validation.valid) {
      await logSecurityEvent({
        type: 'invalid_input',
        severity: 'low',
        details: 'Weak password submitted',
        metadata: { errorCount: validation.errors.length, score: validation.score }
      });
      toast({
        title: "Hasło zbyt słabe",
        description: validation.errors.join(". "),
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      // Step 1: Verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych użytkownika",
          variant: "destructive"
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: sanitizedCurrentPassword,
      });

      if (signInError) {
        await logSecurityEvent({
          type: 'auth_failure',
          severity: 'medium',
          details: 'Incorrect current password during password change attempt'
        });
        toast({
          title: "Błąd",
          description: "Aktualne hasło jest nieprawidłowe",
          variant: "destructive"
        });
        return;
      }

      // Step 2: Update to new password
      const { error } = await supabase.auth.updateUser({
        password: sanitizedNewPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        await logSecurityEvent({
          type: 'auth_failure',
          severity: 'medium',
          details: `Password change failed: ${error.message}`,
          metadata: { errorCode: error.status }
        });
        toast({
          title: "Błąd",
          description: error.message || "Nie udało się zmienić hasła",
          variant: "destructive"
        });
        return;
      }

      await logSecurityEvent({
        type: 'password_change',
        severity: 'low',
        details: 'Password successfully changed'
      });

      toast({
        title: "Sukces",
        description: "Hasło zostało zmienione. Ze względów bezpieczeństwa zostaniesz wylogowany."
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // For security, sign out using centralized method (clears device trust, caches, etc.)
      setTimeout(async () => {
        await signOut();
      }, 2000);

    } catch (error) {
      console.error('Unexpected error changing password:', error);
      await logSecurityEvent({
        type: 'auth_failure',
        severity: 'high',
        details: `Unexpected error during password change: ${error}`,
        metadata: { error: String(error) }
      });
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas zmiany hasła",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return { changePassword };
};
