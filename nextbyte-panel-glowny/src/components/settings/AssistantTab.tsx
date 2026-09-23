
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedBorderInput } from '@/components/ui/animated-border-input';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedChatHistory } from '@/hooks/useUnifiedChatHistory';
import { Trash2, AlertTriangle, Bot, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuroraAvatarStatic } from '@/components/assistant/AuroraAvatarStatic';
import { AssistantQuickActionsSection } from './AssistantQuickActionsSection';
import { DEFAULT_AGENT_NAME } from '@/lib/assistant-defaults';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export type AssistantPersonality = 'standard' | 'savage';

interface AssistantTabProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  defaultWebhookUrl: string;
  useCustomWebhook: boolean;
  setUseCustomWebhook: (use: boolean) => void;
  customWebhookUrl: string;
  setCustomWebhookUrl: (url: string) => void;
  includeChatHistory: boolean;
  setIncludeChatHistory: (include: boolean) => void;
  agentName: string;
  setAgentName: (name: string) => void;
  agentAvatarUrl: string;
  setAgentAvatarUrl: (url: string) => void;
  agentAvatarFile: File | null;
  setAgentAvatarFile: (file: File | null) => void;
  assistantPersonality: AssistantPersonality;
  setAssistantPersonality: (personality: AssistantPersonality) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const PERSONALITIES: { id: AssistantPersonality; label: string; description: string; icon: React.ElementType; color: string }[] = [
  {
    id: 'standard',
    label: 'Profesjonalny',
    description: 'Rzeczowy, pomocny i uprzejmy. Klasyczny styl asystenta AI.',
    icon: MessageSquare,
    color: 'border-brand-primary/40 bg-brand-primary/10 text-brand-primary',
  },
  {
    id: 'savage',
    label: 'Zuchwały',
    description: 'Bezpośredni, dowcipny i bez filtra. Mówi jak jest.',
    icon: Zap,
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  },
];

export function AssistantTab({
  webhookUrl,
  setWebhookUrl,
  defaultWebhookUrl,
  useCustomWebhook,
  setUseCustomWebhook,
  customWebhookUrl,
  setCustomWebhookUrl,
  includeChatHistory,
  setIncludeChatHistory,
  agentName,
  setAgentName,
  agentAvatarUrl,
  setAgentAvatarUrl,
  agentAvatarFile,
  setAgentAvatarFile,
  assistantPersonality,
  setAssistantPersonality,
  onSave,
  onCancel,
  isSaving
}: AssistantTabProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  const { clearChatHistory } = useUnifiedChatHistory('agent_ai');

  // Awatar asystenta jest teraz stały (Aurora) — upload/zmiana zdjęcia usunięte z UI.
  // Propsy agentAvatarUrl/setAgentAvatarUrl/agentAvatarFile/setAgentAvatarFile
  // pozostają w interfejsie, by nie zepsuć rodzica (SettingsDialog); nie są tu używane.

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      const success = await clearChatHistory();
      if (success) {
        window.dispatchEvent(new CustomEvent('chatHistoryCleared'));
        toast({
          title: "Historia wyczyszczona",
          description: "Historia rozmów z Personalnym Asystentem została pomyślnie wyczyszczona.",
        });
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wyczyścić historii czatu.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-3 p-2">
      {/* KARTA WSTĘPNA SKASOWANA (06.08.2026). Zmierzone: 110 px wysokości
          na zdanie „Twój osobisty asystent AI z pełnym kontekstem…", czyli
          opis tego, na co user właśnie kliknął. Zero akcji, zero informacji,
          której nie ma w nazwie zakładki. Michał: „ile miejsca to zajmuje". */}

      {/* Personalization — avatar + name w jednej linii */}
      <div className="glass-effect bg-background/45 border-brand-primary/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-brand-text-primary">Wygląd Asystenta</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Awatar asystenta — stały (Aurora). Brak zmiany/uploadu zdjęcia. */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-14 h-14 rounded-full bg-background/40 border border-brand-primary/30 flex items-center justify-center overflow-hidden">
              <AuroraAvatarStatic size={40} />
            </div>
            <div className="text-sm">
              <p className="font-medium text-brand-text-primary">Awatar asystenta: Aurora</p>
              <p className="text-xs text-brand-text-tertiary">(stały)</p>
            </div>
          </div>

          {/* Nazwa po prawej */}
          <div className="flex-1 w-full space-y-2">
            <AnimatedBorderInput
              id="agentName"
              label="Nazwa Asystenta"
              icon={Bot}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder={DEFAULT_AGENT_NAME}
              autoComplete="off"
            />
            <p className="text-xs text-brand-text-tertiary">
              Nazwa wyświetlana w czacie. Zostaw puste, żeby używać domyślnej
              („{DEFAULT_AGENT_NAME}"). Po zmianach kliknij „Zapisz konfigurację".
            </p>
          </div>
        </div>
      </div>



      {/* Quick actions management */}
      <AssistantQuickActionsSection />

      {/* Chat history management */}
      <div className="glass-effect bg-red-500/5 border-red-500/30 rounded-2xl p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-400 mb-2">Zarządzanie historią czatu</h4>
              <p className="text-sm text-brand-text-secondary mb-4">
                Usuń całą historię rozmów z Personalnym Asystentem. Ta operacja jest nieodwracalna i usunie wszystkie zapisane wiadomości.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="usun" 
                    size="sm"
                    disabled={isClearing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isClearing ? 'Usuwam...' : 'Usuń historię Asystenta'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-effect border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Usuń historię Personalnego Asystenta
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-brand-text-secondary">
                      Czy na pewno chcesz usunąć całą historię rozmów z Personalnym Asystentem? 
                      Ta operacja jest nieodwracalna i usunie wszystkie zapisane wiadomości.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border/50 text-brand-text-secondary hover:bg-foreground/10">
                      Anuluj
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearHistory}
                      className="border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]"
                      disabled={isClearing}
                    >
                      {isClearing ? 'Usuwam...' : 'Usuń historię'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-border/40">
        <Button
          variant="obwodka"
          onClick={onCancel}
          disabled={isSaving}
        >
          Anuluj
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="glass"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Zapisuję...
            </>
          ) : (
            'Zapisz konfigurację'
          )}
        </Button>
      </div>
    </div>
  );
}
