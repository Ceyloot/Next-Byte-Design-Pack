
import React, { useState, useEffect } from 'react';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Settings } from 'lucide-react';
import { useSettingsState } from '@/hooks/useSettingsState';
import { useSettingsSave } from '@/hooks/useSettingsSave';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { GeneralTab } from './settings/GeneralTab';

import { AssistantTab } from './settings/AssistantTab';
import { PasswordTab } from './settings/PasswordTab';
import { SecurityTab } from './settings/SecurityTab';
import { FuturisticLoader } from '@/components/ui/futuristic-loader';
import LegalTab from './settings/LegalTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { ApplicationsTab } from './settings/ApplicationsTab';
import { useScreenSize } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}

export function SettingsDialog({ open, onOpenChange, initialTab }: SettingsDialogProps) {
  const { isMobile, isTablet } = useScreenSize();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab || 'general');

  useEffect(() => {
    if (open && initialTab) setActiveTab(initialTab);
  }, [open, initialTab]);

  const handleRestartOnboarding = () => {
    onOpenChange(false);
    navigate('/panel-glowny?restartOnboarding=true');
  };
  
  const {
    name,
    setName,
    lastName,
    setLastName,
    email,
    setEmail,
    webhookUrl,
    setWebhookUrl,
    defaultWebhookUrl,
    useCustomWebhook,
    setUseCustomWebhook,
    customWebhookUrl,
    setCustomWebhookUrl,
    includeChatHistory,
    setIncludeChatHistory,
    newPassword,
    setNewPassword,
    currentPassword,
    setCurrentPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isSaving,
    isChangingPassword,
    setIsSaving,
    setIsChangingPassword,
    loadSettings,
    agentName,
    setAgentName,
    agentAvatarUrl,
    setAgentAvatarUrl,
    agentAvatarFile,
    setAgentAvatarFile,
    assistantPersonality,
    setAssistantPersonality,
  } = useSettingsState();

  const { saveSettings } = useSettingsSave({
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
  });

  const { changePassword } = usePasswordChange({
    currentPassword,
    newPassword,
    confirmPassword,
    setIsChangingPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword
  });

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const handleSaveSettings = async () => {
    const success = await saveSettings();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Ustawienia"
      description="Zarządzaj swoim kontem i preferencjami"
      icon={<Settings className="w-5 h-5 text-primary-foreground" />}
      maxWidth="5xl"
      contentClassName="!h-[88dvh] !max-h-[88dvh]"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <FuturisticLoader size="md" showReflection={false} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 -m-1">
          <div className="glass-effect bg-card/40 border border-border/30 rounded-xl overflow-hidden sticky top-0 z-10">
            <AnimatedTabs
              layoutId="settingsdialog-tabs"
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { value: 'general', label: 'Ogólne' },
                { value: 'assistant', label: 'Asystent' },
                { value: 'applications', label: 'Aplikacje' },
                { value: 'password', label: 'Hasło' },
                { value: 'security', label: 'Bezpieczeństwo' },
                { value: 'legal', label: 'Regulaminy' },
                { value: 'appearance', label: 'Wygląd' },
              ]}
            />
          </div>

          <div className="pb-2">
            {activeTab === 'general' && (
              <GeneralTab
                onRestartOnboarding={handleRestartOnboarding}
                name={name}
                setName={setName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                onSave={handleSaveSettings}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'assistant' && (
              <AssistantTab
                webhookUrl={webhookUrl}
                setWebhookUrl={setWebhookUrl}
                defaultWebhookUrl={defaultWebhookUrl}
                useCustomWebhook={useCustomWebhook}
                setUseCustomWebhook={setUseCustomWebhook}
                customWebhookUrl={customWebhookUrl}
                setCustomWebhookUrl={setCustomWebhookUrl}
                includeChatHistory={includeChatHistory}
                setIncludeChatHistory={setIncludeChatHistory}
                agentName={agentName}
                setAgentName={setAgentName}
                agentAvatarUrl={agentAvatarUrl}
                setAgentAvatarUrl={setAgentAvatarUrl}
                agentAvatarFile={agentAvatarFile}
                setAgentAvatarFile={setAgentAvatarFile}
                assistantPersonality={assistantPersonality as any}
                setAssistantPersonality={setAssistantPersonality}
                onSave={handleSaveSettings}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'password' && (
              <PasswordTab
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                onChangePassword={changePassword}
                onCancel={handleCancel}
                isChangingPassword={isChangingPassword}
              />
            )}

            {activeTab === 'applications' && <ApplicationsTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'legal' && <LegalTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
          </div>
        </div>
      )}
    </NextByteModal>
  );
}
