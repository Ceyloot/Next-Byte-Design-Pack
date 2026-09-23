import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Fingerprint, ScanFace, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isNativePlatform } from '@/lib/native';
import {
  checkBiometricAvailability,
  storeBiometricCredentials,
  removeBiometricCredentials,
  isBiometricEnabled,
  getBiometricLabel,
  type BiometricAvailability,
} from '@/lib/biometric';

interface BiometricSettingsProps {
  userEmail: string;
}

export const BiometricSettings: React.FC<BiometricSettingsProps> = ({ userEmail }) => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<BiometricAvailability | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  /**
   * Hasło zbieramy WŁASNYM oknem, nigdy przez `prompt()`.
   *
   * Systemowy `prompt()` pokazuje wpisywane hasło JAWNYM TEKSTEM (nie da się
   * go zamaskować), na iOS wyświetla samą domenę bez kontekstu, i uczy
   * użytkownika wpisywać hasło do okienka, które każda strona może podrobić.
   * Ten sam wzorzec jest już zrobiony poprawnie w SecurityTab.
   */
  const [oknoHaslaOtwarte, setOknoHaslaOtwarte] = useState(false);
  const [haslo, setHaslo] = useState('');

  useEffect(() => {
    const check = async () => {
      const avail = await checkBiometricAvailability();
      setAvailability(avail);
      setEnabled(isBiometricEnabled());
    };
    check();
  }, []);

  if (!isNativePlatform() || !availability?.isAvailable) return null;

  /** Włączenie biometrii — po podaniu hasła we własnym oknie. */
  const wlaczBiometrie = async () => {
    if (!haslo) return;
    setLoading(true);
    try {
      const success = await storeBiometricCredentials(userEmail, haslo);
      if (success) {
        setEnabled(true);
        toast({
          title: '✅ Biometria włączona',
          description: `Możesz teraz logować się przez ${getBiometricLabel(availability?.biometryType)}`,
        });
      } else {
        toast({
          title: 'Błąd',
          description: 'Nie udało się zapisać danych biometrycznych',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error?.message || 'Nie udało się włączyć biometrii',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setHaslo('');                 // hasło nie zostaje w pamięci komponentu
      setOknoHaslaOtwarte(false);
    }
  };

  const handleToggle = async (newState: boolean) => {
    if (newState) {
      setOknoHaslaOtwarte(true);    // hasło zbiera osobne okno, nie prompt()
      return;
    }
    setLoading(true);
    try {
      {
        await removeBiometricCredentials();
        setEnabled(false);
        toast({
          title: 'Biometria wyłączona',
          description: 'Dane logowania biometrycznego zostały usunięte',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Błąd',
        description: e.message || 'Wystąpił problem z biometrią',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const Icon = availability.biometryType === 'face' ? ScanFace : Fingerprint;

  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Label htmlFor="biometria-przelacznik" className="text-sm font-medium text-foreground">
              Szybkie logowanie — {getBiometricLabel(availability.biometryType)}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Loguj się bez wpisywania hasła
            </p>
          </div>
        </div>
        <Switch
          id="biometria-przelacznik"
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={loading}
        />
      </div>

      <AlertDialog
        open={oknoHaslaOtwarte}
        onOpenChange={(o) => { if (!o) { setHaslo(''); setOknoHaslaOtwarte(false); } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź hasło</AlertDialogTitle>
            <AlertDialogDescription>
              Hasło zostaje na tym urządzeniu, w bezpiecznym magazynie systemowym —
              nie wysyłamy go nigdzie. Jest potrzebne, żeby odcisk palca lub skan twarzy
              mógł Cię zalogować bez wpisywania go za każdym razem.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            onSubmit={(e) => { e.preventDefault(); wlaczBiometrie(); }}
            className="space-y-3"
          >
            <Input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={haslo}
              onChange={(e) => setHaslo(e.target.value)}
              placeholder="Hasło do konta"
              aria-label="Hasło do konta"
            />
            <AlertDialogFooter>
              <Button
                type="button"
                variant="obwodka"
                onClick={() => { setHaslo(''); setOknoHaslaOtwarte(false); }}
              >
                Anuluj
              </Button>
              <Button type="submit" variant="glass" disabled={!haslo || loading}>
                {loading ? 'Włączam…' : 'Włącz biometrię'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
