import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { formatRecoveryKey } from '@/utils/recoveryKeyGenerator';
import { useToast } from '@/hooks/use-toast';

interface RecoveryKeyModalProps {
  open: boolean;
  recoveryKey: string;
  onConfirmed: () => void;
  onCancel?: () => void;
}

export function RecoveryKeyModal({ open, recoveryKey, onConfirmed, onCancel }: RecoveryKeyModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();
  const groups = formatRecoveryKey(recoveryKey);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      toast({ title: 'Skopiowano', description: 'Klucz odzyskiwania został skopiowany do schowka.' });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: 'Błąd', description: 'Nie udało się skopiować.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) {
        if (confirmed) { onConfirmed(); } 
        else if (onCancel) { onCancel(); }
      }
    }}>
      <DialogContent
        className="border border-border/50 text-foreground max-w-lg"
        onPointerDownOutside={(e) => { if (!confirmed) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (!confirmed) e.preventDefault(); }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-primary" />
            <DialogTitle className="text-foreground">Klucz odzyskiwania</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Zapisz te 24 słowa w bezpiecznym miejscu. To jedyny sposób na odzyskanie dostępu do zaszyfrowanych wiadomości.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-foreground/5 border border-border/40 rounded-lg p-4 space-y-2">
            {groups.map((group, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs w-4 text-right">{i * 4 + 1}.</span>
                <span className="font-mono text-sm text-foreground tracking-wide">{group}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full border-border/50 text-foreground hover:bg-foreground/10"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Skopiowano!' : 'Kopiuj klucz odzyskiwania'}
          </Button>

          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-200/90">
              <strong>Uwaga:</strong> Jeśli zgubisz ten klucz i zapomnisz hasła, nie będzie możliwości odzyskania zaszyfrowanych wiadomości. Nikt — nawet zespół NextByte — nie ma do nich dostępu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm-saved"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="border-border/60"
            />
            <label htmlFor="confirm-saved" className="text-sm text-foreground/80 cursor-pointer">
              Potwierdzam, że zapisałem klucz odzyskiwania w bezpiecznym miejscu
            </label>
          </div>

          <Button
            className="w-full"
            disabled={!confirmed}
            onClick={onConfirmed}
          >
            Kontynuuj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
