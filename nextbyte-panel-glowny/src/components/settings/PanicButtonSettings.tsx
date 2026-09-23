import React, { useState, useCallback, useRef } from 'react';
import { ShieldCheck, Keyboard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePanicMode, formatShortcut, type PanicShortcut, panicRecordingRef } from '@/contexts/PanicModeContext';
import { useToast } from '@/hooks/use-toast';

export function PanicButtonSettings() {
  const { shortcut, setShortcut, resetShortcut, togglePanic } = usePanicMode();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [pendingShortcut, setPendingShortcut] = useState<PanicShortcut | null>(null);
  const pendingRef = useRef<PanicShortcut | null>(null);

  const displayShortcut = pendingShortcut ?? shortcut;

  const handleRecord = useCallback(() => {
    setIsRecording(true);
    setPendingShortcut(null);
    pendingRef.current = null;
    panicRecordingRef.current = true;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    e.stopPropagation();

    // Ignore standalone modifier keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    // Require at least one modifier
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      toast({ title: 'Wymagany modyfikator', description: 'Użyj Ctrl, Shift lub Alt razem z klawiszem.', variant: 'destructive' });
      setIsRecording(false);
      panicRecordingRef.current = false;
      return;
    }

    const newShortcut: PanicShortcut = {
      ctrlKey: e.ctrlKey || e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: false,
      key: e.key.length === 1 ? e.key.toLowerCase() : e.key,
    };

    pendingRef.current = newShortcut;
    setPendingShortcut(newShortcut);
    setIsRecording(false);
    panicRecordingRef.current = false;
  }, [isRecording, toast]);

  const handleSave = useCallback(() => {
    const toSave = pendingRef.current;
    if (toSave) {
      setShortcut(toSave);
      setPendingShortcut(null);
      pendingRef.current = null;
      toast({ title: 'Skrót zapisany', description: `Nowy skrót: ${formatShortcut(toSave)}` });
    }
  }, [setShortcut, toast]);

  const handleReset = useCallback(() => {
    resetShortcut();
    setPendingShortcut(null);
    pendingRef.current = null;
    toast({ title: 'Przywrócono domyślny skrót', description: 'Ctrl + Shift + L' });
  }, [resetShortcut, toast]);

  return (
    <div className="glass-effect bg-background/45 border-brand-primary/30 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-primary mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-brand-text-primary mb-1">Przycisk Paniki</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Natychmiast ukrywa wszystkie wrażliwe dane na ekranie jednym skrótem klawiszowym. 
              Przydatne, gdy ktoś obcy podchodzi do Twojego komputera. Kliknięcie na ekran 
              zabezpieczony lub ponowne naciśnięcie skrótu przywraca widok.
            </p>
          </div>

          {/* Current shortcut display */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Aktualny skrót:</span>
            </div>
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onClick={isRecording ? undefined : handleRecord}
              className={`
                px-4 py-2 rounded-lg border font-mono text-sm cursor-pointer transition-all select-none outline-none
                ${isRecording 
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary animate-pulse' 
                  : 'border-border/50 bg-foreground/5 text-brand-text-primary hover:border-brand-primary/50'
                }
              `}
            >
              {isRecording ? 'Naciśnij skrót...' : formatShortcut(displayShortcut)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {pendingShortcut && (
              <Button
                size="sm"
                onClick={handleSave}
                variant="glass"
              >
                Zapisz skrót
              </Button>
            )}
            <Button
              size="sm"
              variant="obwodka"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Przywróć domyślny
            </Button>
            <Button
              size="sm"
              variant="obwodka"
              onClick={togglePanic}
              className="gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Testuj
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
