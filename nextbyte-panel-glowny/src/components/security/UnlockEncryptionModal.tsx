import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Key } from 'lucide-react';
import { unwrapMEK, storeMEKInSession } from '@/utils/masterKeyManager';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnlockEncryptionModalProps {
  open: boolean;
  onUnlocked: () => void;
  onSkip?: () => void;
}

export function UnlockEncryptionModal({ open, onUnlocked, onSkip }: UnlockEncryptionModalProps) {
  const [mode, setMode] = useState<'password' | 'recovery'>('recovery');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if password unlock is available
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('message_encryption_keys')
        .select('encrypted_mek_password')
        .eq('user_id', user.id)
        .maybeSingle();
      const pw = !!(data?.encrypted_mek_password);
      setHasPassword(pw);
      setMode(pw ? 'password' : 'recovery');
    })();
  }, [open]);

  const handleUnlock = async () => {
    if (!value.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nie zalogowano');

      const { data: keyData } = await supabase
        .from('message_encryption_keys')
        .select('encrypted_mek_password, encrypted_mek_recovery, mek_salt, mek_iv_password, mek_iv_recovery')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!keyData) throw new Error('Brak klucza szyfrowania');

      let mek;
      if (mode === 'password') {
        if (!keyData.encrypted_mek_password || !keyData.mek_iv_password || !keyData.mek_salt) {
          throw new Error('Konto nie ma hasła do odszyfrowania. Użyj klucza odzyskiwania.');
        }
        mek = await unwrapMEK(keyData.encrypted_mek_password, value, keyData.mek_salt, keyData.mek_iv_password);
      } else {
        if (!keyData.encrypted_mek_recovery || !keyData.mek_iv_recovery || !keyData.mek_salt) {
          throw new Error('Brak klucza odzyskiwania w systemie.');
        }
        mek = await unwrapMEK(keyData.encrypted_mek_recovery, value.trim().toLowerCase(), keyData.mek_salt, keyData.mek_iv_recovery);
      }

      await storeMEKInSession(mek);
      setValue('');
      toast({ title: 'Odblokowano', description: 'Szyfrowanie zostało odblokowane.' });
      onUnlocked();
    } catch (error: any) {
      console.error('Unlock failed:', error);
      toast({
        title: 'Błąd',
        description: mode === 'password'
          ? 'Nieprawidłowe hasło. Spróbuj ponownie lub użyj klucza odzyskiwania.'
          : 'Nieprawidłowy klucz odzyskiwania.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="border border-border/50 text-foreground max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-primary" />
            <DialogTitle className="text-foreground">Odblokuj szyfrowanie</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Podaj hasło lub klucz odzyskiwania, aby odszyfrować wiadomości.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            {hasPassword && (
              <Button
                variant={mode === 'password' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setMode('password'); setValue(''); }}
                className={mode !== 'password' ? 'border-border/50 text-foreground hover:bg-foreground/10' : ''}
              >
                <Lock className="w-3 h-3 mr-1" /> Hasło
              </Button>
            )}
            <Button
              variant={mode === 'recovery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setMode('recovery'); setValue(''); }}
              className={mode !== 'recovery' ? 'border-border/50 text-foreground hover:bg-foreground/10' : ''}
            >
              <Key className="w-3 h-3 mr-1" /> Klucz odzyskiwania
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80">
              {mode === 'password' ? 'Hasło konta' : 'Klucz odzyskiwania (24 słowa)'}
            </Label>
            {mode === 'password' ? (
              <Input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Wpisz hasło..."
                className="bg-foreground/5 border-border/50 text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Wpisz 24 słowa oddzielone spacjami..."
                className="w-full h-24 bg-foreground/5 border border-border/50 rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleUnlock}
            disabled={loading || !value.trim()}
          >
            {loading ? 'Odblokowywanie...' : 'Odblokuj'}
          </Button>

          {onSkip && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-muted-foreground"
              onClick={onSkip}
            >
              Pomiń (zaszyfrowane wiadomości będą ukryte)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
