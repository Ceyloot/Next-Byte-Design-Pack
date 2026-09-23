import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Smartphone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { NextByteModal } from '@/components/ui/nextbyte-modal';

interface TwoFactorMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: 'email' | 'totp') => void;
}

export const TwoFactorMethodDialog = ({ open, onOpenChange, onSelectMethod }: TwoFactorMethodDialogProps) => {
  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Wybierz metodę 2FA"
      description="Jak chcesz weryfikować swoją tożsamość?"
      icon={<Shield className="w-5 h-5 text-foreground" />}
      maxWidth="md"
      footer={
        <Button variant="cichy" onClick={() => onOpenChange(false)}>
          Anuluj
        </Button>
      }
    >
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectMethod('email')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/30 transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Kod na email</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Otrzymaj 6-cyfrowy kod na swoją skrzynkę pocztową
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectMethod('totp')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/30 transition-all duration-200 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
            <Smartphone className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Google Authenticator</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Użyj aplikacji TOTP do generowania kodów offline
            </p>
          </div>
        </motion.button>
      </div>
    </NextByteModal>
  );
};
