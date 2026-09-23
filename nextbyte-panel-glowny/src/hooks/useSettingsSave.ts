
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSettingsSaveProps {
  name: string;
  lastName: string;
  email: string;
  webhookUrl: string;
  useCustomWebhook: boolean;
  customWebhookUrl: string;
  includeChatHistory: boolean;
  agentName: string;
  agentAvatarFile: File | null;
  agentAvatarUrl: string;
  assistantPersonality: string;
  setIsSaving: (saving: boolean) => void;
}

export const useSettingsSave = ({
  name,
  lastName,
  email,
  webhookUrl,
  useCustomWebhook,
  customWebhookUrl,
  includeChatHistory,
  agentName,
  agentAvatarFile,
  agentAvatarUrl,
  assistantPersonality,
  setIsSaving
}: UseSettingsSaveProps) => {
  const { toast } = useToast();

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      console.log('Starting to save settings with data:', { name, lastName, email });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast({
          title: "Błąd",
          description: "Użytkownik nie jest zalogowany",
          variant: "destructive"
        });
        return false;
      }

      console.log('Saving settings for user:', user.id);

      // Ensure we have at least a name
      const finalName = name.trim() || 'Użytkownik';
      const finalLastName = lastName.trim() || '';
      const finalEmail = email.trim() || user.email || '';

      // Save user settings
      const settings = {
        id: user.id,
        first_name: finalName,
        last_name: finalLastName,
        email: finalEmail,
        updated_at: new Date().toISOString()
      };

      console.log('Final settings to save:', settings);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(settings, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error('Error saving settings:', error);
        
        let errorMessage = "Nie udało się zapisać ustawień";
        if (error.code === '23505') {
          errorMessage = "Wystąpił konflikt danych. Spróbuj ponownie.";
        } else if (error.code === '42501') {
          errorMessage = "Brak uprawnień do zapisania ustawień";
        } else if (error.message) {
          errorMessage = `Błąd: ${error.message}`;
        }
        
        toast({
          title: "Błąd zapisu",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }

      console.log('Settings saved successfully:', data);

      // Upload avatara jeśli został wybrany
      let finalAvatarUrl = agentAvatarUrl;
      if (agentAvatarFile) {
        console.log('Starting avatar upload:', { fileName: agentAvatarFile.name, fileSize: agentAvatarFile.size });
        const fileExt = agentAvatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
        
        // Plik jest już skompresowany w AssistantTab — wgrywamy bezpośrednio
        const { error: uploadError } = await supabase.storage
          .from('agent-avatars')
          .upload(fileName, agentAvatarFile, { upsert: false, cacheControl: '3600', contentType: agentAvatarFile.type });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast({
            title: "Błąd",
            description: uploadError.message || "Nie udało się przesłać avatara",
            variant: "destructive",
          });
          return false;
        }

        const { data: urlData } = supabase.storage
          .from('agent-avatars')
          .getPublicUrl(fileName);
        
        finalAvatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;
        console.log('Avatar uploaded successfully:', { finalAvatarUrl });

        // Usuń stary avatar dopiero po udanym wgraniu nowego, żeby nie stracić zdjęcia przy błędzie uploadu
        if (agentAvatarUrl) {
          const oldPath = agentAvatarUrl.split('/agent-avatars/')[1]?.split('?')[0];
          if (oldPath && oldPath !== fileName) {
            console.log('Removing old avatar:', oldPath);
            await supabase.storage.from('agent-avatars').remove([oldPath]);
          }
        }
      }

      // Save or update webhook settings
      // Always save webhook settings, storing whether to use default or custom
      console.log('Saving webhook settings:', {
        useCustomWebhook,
        customWebhookUrl: customWebhookUrl.trim(),
        webhookUrl: webhookUrl.trim(),
        agentName: agentName?.trim() || null,
        agentAvatarFile: agentAvatarFile ? agentAvatarFile.name : null,
        finalAvatarUrl
      });
      
      const { error: webhookError } = await supabase
        .from('webhook_settings')
        .upsert({
          user_id: user.id,
          webhook_url: useCustomWebhook ? customWebhookUrl.trim() : webhookUrl.trim(),
          use_default_webhook: !useCustomWebhook,
          include_chat_history: includeChatHistory,
          agent_name: agentName?.trim() || null,
          agent_avatar_url: finalAvatarUrl || null,
          assistant_personality: assistantPersonality || 'standard',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (webhookError) {
        console.error('Error saving webhook settings:', webhookError);
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać ustawień webhooka",
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Webhook settings saved successfully');

      // Dispatch custom event to notify other components with updated profile data
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: {
          first_name: finalName,
          last_name: finalLastName,
          email: finalEmail
        }
      }));

      toast({
        title: "Sukces",
        description: "Ustawienia zostały zapisane pomyślnie"
      });

      return true;
    } catch (error) {
      console.error('Unexpected error saving settings:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas zapisywania",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveSettings };
};
