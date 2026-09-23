import React, { createContext, useContext, useState, ReactNode } from 'react';

type SettingsTab = 'cookies' | 'privacy' | 'terms';

interface SettingsPopupContextType {
  isOpen: boolean;
  defaultTab: SettingsTab;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
}

const SettingsPopupContext = createContext<SettingsPopupContextType | undefined>(undefined);

export const SettingsPopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<SettingsTab>('cookies');

  const openSettings = (tab: SettingsTab = 'cookies') => {
    setDefaultTab(tab);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
  };

  return (
    <SettingsPopupContext.Provider value={{ isOpen, defaultTab, openSettings, closeSettings }}>
      {children}
    </SettingsPopupContext.Provider>
  );
};

export const useSettingsPopup = () => {
  const context = useContext(SettingsPopupContext);
  if (context === undefined) {
    throw new Error('useSettingsPopup must be used within a SettingsPopupProvider');
  }
  return context;
};
