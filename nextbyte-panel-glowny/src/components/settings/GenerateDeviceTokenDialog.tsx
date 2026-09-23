import React, { useState } from 'react';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, KeyRound, AlertTriangle, Monitor } from 'lucide-react';
import { useDesktopTokens } from '@/hooks/useDesktopTokens';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateDeviceTokenDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { generate } = useDesktopTokens();
  const [deviceName, setDeviceName] = useState('');
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setDeviceName('');
    setRawToken(null);
    setCopied(false);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSubmit = async () => {
    if (!deviceName.trim()) {
      toast.error('Podaj nazwę urządzenia');
      return;
    }
    const result = await generate.mutateAsync(deviceName.trim());
    setRawToken(result.raw_token);
  };

  const handleCopy = async () => {
    if (!rawToken) return;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(rawToken);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = rawToken;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      toast.success('Token skopiowany');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Nie udało się skopiować — zaznacz token i skopiuj ręcznie (Ctrl+C)');
    }
  };

  return (
    <NextByteModal
      open={open}
      onOpenChange={handleClose}
      title={rawToken ? 'Token wygenerowany' : 'Nowe urządzenie desktop'}
      description={
        rawToken
          ? 'Skopiuj token i wklej w aplikacji desktopowej — więcej go nie zobaczysz.'
          : 'Nadaj nazwę urządzeniu (np. „MacBook Pro Michała").'
      }
      icon={<Monitor className="w-5 h-5 text-primary-foreground" />}
      maxWidth="md"
    >
      <div className="p-4 space-y-3">
        {!rawToken ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="device_name">Nazwa urządzenia</Label>
              <Input
                id="device_name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="MacBook Pro Michała"
                maxLength={80}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deviceName.trim() && !generate.isPending) handleSubmit();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="cichy" onClick={() => handleClose(false)}>
                Anuluj
              </Button>
              <Button
                variant="glass" className="nb-glass-na-przezroczystym"
                onClick={handleSubmit}
                disabled={!deviceName.trim() || generate.isPending}
              >
                {generate.isPending ? 'Generowanie…' : 'Wygeneruj token'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-100/90">
                <strong className="block mb-1">To jedyny moment, w którym widzisz token.</strong>
                Skopiuj go teraz i wklej w aplikacji desktopowej. Po zamknięciu okna nie da się go
                odzyskać — jeśli zgubisz, wygeneruj nowy.
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Token urządzenia
              </Label>
              <div className="relative">
                <div className="rounded-xl border border-primary/25 nb-szklo nb-szklo-plynne p-4 pr-14 font-mono text-sm break-all select-all">
                  {rawToken}
                </div>
                <Button
                  size="icon"
                  variant="cichy"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label="Kopiuj token"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="obwodka" onClick={() => handleClose(false)}>
                Zamknij
              </Button>
            </div>
          </>
        )}
      </div>
    </NextByteModal>
  );
};
