
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSettingsState = () => {
  const [name, setName] = useState('Użytkowniku');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [defaultWebhookUrl, setDefaultWebhookUrl] = useState('');
  const [useCustomWebhook, setUseCustomWebhook] = useState(false);
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [includeChatHistory, setIncludeChatHistory] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [agentAvatarUrl, setAgentAvatarUrl] = useState('');
  const [agentAvatarFile, setAgentAvatarFile] = useState<File | null>(null);
  const [assistantPersonality, setAssistantPersonality] = useState<string>('standard');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      console.log('Loading settings for user:', user.id);

      // Load user profile (replaces user_settings)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się wczytać profilu",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        setName(data.first_name || 'Użytkowniku');
        setLastName(data.last_name || '');
        setEmail(data.email || user.email || '');
      } else {
        console.log('No profile found, using defaults');
        // Set email from auth user if no profile exists
        setEmail(user.email || '');
      }

      // Load default webhook from system_settings
      const { data: systemSettings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'webhooks')
        .eq('key', 'default_agent_webhook_url')
        .single();

      const defaultWebhook = systemSettings 
        ? (typeof (systemSettings as any).value === 'string'
          ? ((systemSettings as any).value as string)
          : String((systemSettings as any).value))
        : 'https://nextbyteai.app.n8n.cloud/webhook/NextByteInterface';

      setDefaultWebhookUrl(defaultWebhook);

      // Load webhook settings
      const { data: webhookData, error: webhookError } = await supabase
        .from('webhook_settings')
        .select('webhook_url, include_chat_history, agent_name, agent_avatar_url, use_default_webhook, assistant_personality')
        .eq('user_id', user.id)
        .maybeSingle();

      if (webhookError && webhookError.code !== 'PGRST116') {
        console.error('Error loading webhook settings:', webhookError);
      } else if (webhookData) {
        console.log('Webhook settings loaded:', webhookData);
        const isUsingDefault = webhookData.use_default_webhook ?? true;
        setUseCustomWebhook(!isUsingDefault);
        setCustomWebhookUrl(webhookData.webhook_url || '');
        setWebhookUrl(isUsingDefault ? defaultWebhook : (webhookData.webhook_url || ''));
        setIncludeChatHistory(webhookData.include_chat_history ?? true);
        setAgentName(webhookData.agent_name || '');
        setAgentAvatarUrl(webhookData.agent_avatar_url || '');
        setAssistantPersonality((webhookData as any).assistant_personality || 'standard');
      } else {
        // New user - use default
        setWebhookUrl(defaultWebhook);
        setUseCustomWebhook(false);
      }

    } catch (error) {
      console.error('Unexpected error loading settings:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas wczytywania ustawień",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    lastName,
    setLastName,
    email,
    setEmail,
    webhookUrl,
    setWebhookUrl,
    defaultWebhookUrl,
    setDefaultWebhookUrl,
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
    newPassword,
    setNewPassword,
    currentPassword,
    setCurrentPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isChangingPassword,
    setIsChangingPassword,
    loadSettings,
    toast
  };
};
