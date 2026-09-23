import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEncryption, EncryptionStatus } from '@/hooks/useEncryption';
import { RecoveryKeyModal } from '@/components/security/RecoveryKeyModal';
import { UnlockEncryptionModal } from '@/components/security/UnlockEncryptionModal';
import { clearMEKFromSession } from '@/utils/masterKeyManager';
import { useQueryClient } from '@tanstack/react-query';

interface EncryptionContextType {
  encryptionStatus: EncryptionStatus;
  setupEncryption: (password?: string) => Promise<void>;
  disableEncryption: (onProgress?: (done: number, total: number) => void) => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const EncryptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const {
    status,
    recoveryKey,
    showRecoveryModal,
    showUnlockModal,
    setupEncryption,
    disableEncryption,
    confirmRecoveryKey,
    cancelRecoveryKey,
    onUnlocked: baseOnUnlocked,
    skipUnlock,
  } = useEncryption(user?.id);

  const handleUnlocked = useCallback(() => {
    baseOnUnlocked();
    // Refetch all chat history so encrypted messages get decrypted
    queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
  }, [baseOnUnlocked, queryClient]);

  // Clear MEK on logout
  useEffect(() => {
    if (!user) {
      clearMEKFromSession();
    }
  }, [user]);

  // Auto-setup for new users after login (trigger from SecurityTab or auth flow)
  const value: EncryptionContextType = {
    encryptionStatus: status,
    setupEncryption,
    disableEncryption,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}

      {showRecoveryModal && recoveryKey && (
        <RecoveryKeyModal
          open={showRecoveryModal}
          recoveryKey={recoveryKey}
          onConfirmed={confirmRecoveryKey}
          onCancel={cancelRecoveryKey}
        />
      )}

      {showUnlockModal && (
        <UnlockEncryptionModal
          open={showUnlockModal}
          onUnlocked={handleUnlocked}
          onSkip={skipUnlock}
        />
      )}
    </EncryptionContext.Provider>
  );
};

export const useEncryptionContext = () => {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryptionContext must be used within an EncryptionProvider');
  }
  return context;
};
