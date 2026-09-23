import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  generateMEK,
  wrapMEK,
  unwrapMEK,
  storeMEKInSession,
  getMEKFromSession,
  clearMEKFromSession,
  hashRecoveryKey,
  fromBase64,
} from '@/utils/masterKeyManager';
import { generateRecoveryKey } from '@/utils/recoveryKeyGenerator';

export type EncryptionStatus = 'loading' | 'ready' | 'needs_setup' | 'needs_unlock' | 'none';

interface PendingSetup {
  mek: CryptoKey;
  recovery: string;
  recoveryWrap: { wrappedKey: string; salt: string; iv: string };
  recoveryHash: string;
  passwordWrap: { wrappedKey: string; salt: string; iv: string } | null;
}

interface UseEncryptionReturn {
  status: EncryptionStatus;
  recoveryKey: string | null;
  showRecoveryModal: boolean;
  showUnlockModal: boolean;
  setupEncryption: (password?: string) => Promise<void>;
  disableEncryption: (onProgress?: (done: number, total: number) => void) => Promise<void>;
  confirmRecoveryKey: () => Promise<void>;
  cancelRecoveryKey: () => void;
  onUnlocked: () => void;
  skipUnlock: () => void;
}

export function useEncryption(userId: string | undefined): UseEncryptionReturn {
  const [status, setStatus] = useState<EncryptionStatus>('loading');
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const pendingSetupRef = useRef<PendingSetup | null>(null);

  // Check encryption state on mount / user change
  useEffect(() => {
    if (!userId) {
      setStatus('none');
      return;
    }
    checkEncryptionState(userId);
  }, [userId]);

  const checkEncryptionState = async (uid: string) => {
    try {
      // 1. Is MEK already in session?
      const sessionMEK = await getMEKFromSession();
      if (sessionMEK) {
        setStatus('ready');
        return;
      }

      // 2. Does user have MEK in DB?
      const { data } = await supabase
        .from('message_encryption_keys')
        .select('encrypted_mek_password, encrypted_mek_recovery')
        .eq('user_id', uid)
        .maybeSingle();

      if (!data || (!data.encrypted_mek_password && !data.encrypted_mek_recovery)) {
        setStatus('needs_setup');
      } else {
        setStatus('needs_unlock');
        setShowUnlockModal(true);
      }
    } catch (error) {
      console.error('Error checking encryption state:', error);
      setStatus('none');
    }
  };

  const setupEncryption = useCallback(async (password?: string) => {
    if (!userId) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('NO_SESSION');

      const mek = await generateMEK();
      const recovery = generateRecoveryKey();
      const recoveryHash = await hashRecoveryKey(recovery);
      const recoveryWrap = await wrapMEK(mek, recovery);

      let passwordWrap: { wrappedKey: string; salt: string; iv: string } | null = null;
      if (password) {
        // Reuse the same salt so the single mek_salt column works for both
        const saltBytes = new Uint8Array(fromBase64(recoveryWrap.salt));
        passwordWrap = await wrapMEK(mek, password, saltBytes);
      }

      // Store pending — nothing persisted to DB/localStorage yet
      pendingSetupRef.current = { mek, recovery, recoveryWrap, recoveryHash, passwordWrap };

      setRecoveryKey(recovery);
      setShowRecoveryModal(true);
    } catch (error: any) {
      console.error('[Encryption] Setup failed:', error?.message || error);
      throw error;
    }
  }, [userId]);

  const disableEncryption = useCallback(async (onProgress?: (done: number, total: number) => void) => {
    if (!userId) return;

    try {
      const mek = await getMEKFromSession();
      if (!mek) throw new Error('MEK not available – unlock encryption first.');

      // Gather all encrypted messages from all tables
      const tables = [
        { table: 'user_chat_history' as const, contentCol: 'message_content' },
        { table: 'chat_messages' as const, contentCol: 'content' },
        { table: 'agent_chat_messages' as const, contentCol: 'content' },
      ];

      type EncMsg = { id: string; encrypted_content: string; encryption_iv: string; table: string; contentCol: string };
      const allMessages: EncMsg[] = [];

      for (const t of tables) {
        const { data } = await supabase
          .from(t.table)
          .select('id, encrypted_content, encryption_iv')
          .eq('user_id', userId)
          .eq('is_encrypted', true);
        if (data) {
          for (const row of data) {
            if (row.encrypted_content && row.encryption_iv) {
              allMessages.push({ ...row, table: t.table, contentCol: t.contentCol });
            }
          }
        }
      }

      const total = allMessages.length;
      let done = 0;
      onProgress?.(0, total);

      // Decrypt in batches of 10
      const BATCH = 10;
      for (let i = 0; i < allMessages.length; i += BATCH) {
        const batch = allMessages.slice(i, i + BATCH);
        await Promise.all(batch.map(async (msg) => {
          const { decryptWithMEK } = await import('@/utils/masterKeyManager');
          const plaintext = await decryptWithMEK(msg.encrypted_content, msg.encryption_iv, mek);

          const updatePayload: Record<string, any> = {
            [msg.contentCol]: plaintext,
            is_encrypted: false,
            encrypted_content: null,
            encryption_iv: null,
          };
          // user_chat_history has content_hash field
          if (msg.table === 'user_chat_history') {
            updatePayload.content_hash = null;
          }

          await supabase
            .from(msg.table as any)
            .update(updatePayload)
            .eq('id', msg.id);
        }));
        done += batch.length;
        onProgress?.(done, total);
      }

      // Delete encryption keys record
      await supabase
        .from('message_encryption_keys')
        .delete()
        .eq('user_id', userId);

      // Clear MEK
      clearMEKFromSession();
      setStatus('needs_setup');
    } catch (error) {
      console.error('[Encryption] Disable failed:', error);
      throw error;
    }
  }, [userId]);

  /** User confirmed recovery key — now persist to DB + localStorage */
  const confirmRecoveryKey = useCallback(async () => {
    const pending = pendingSetupRef.current;
    if (!pending || !userId) {
      setShowRecoveryModal(false);
      setRecoveryKey(null);
      return;
    }

    try {
      const { mek, recoveryWrap, recoveryHash, passwordWrap } = pending;

      const { data: existing } = await supabase
        .from('message_encryption_keys')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const payload: any = {
        user_id: userId,
        encrypted_mek_recovery: recoveryWrap.wrappedKey,
        mek_iv_recovery: recoveryWrap.iv,
        mek_salt: recoveryWrap.salt,
        recovery_key_hash: recoveryHash,
        encrypted_mek_password: passwordWrap?.wrappedKey ?? null,
        mek_iv_password: passwordWrap?.iv ?? null,
        key_version: 1,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('message_encryption_keys')
          .update(payload)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('message_encryption_keys')
          .insert({ ...payload, key_hash: 'mek_v1' });
        if (error) throw error;
      }

      await storeMEKInSession(mek);

      pendingSetupRef.current = null;
      setShowRecoveryModal(false);
      setRecoveryKey(null);
      setStatus('ready');
    } catch (error: any) {
      console.error('[Encryption] Confirm failed:', error);
      throw error;
    }
  }, [userId]);

  /** User cancelled — discard everything */
  const cancelRecoveryKey = useCallback(() => {
    pendingSetupRef.current = null;
    setShowRecoveryModal(false);
    setRecoveryKey(null);
  }, []);

  const onUnlocked = useCallback(() => {
    setShowUnlockModal(false);
    setStatus('ready');
  }, []);

  const skipUnlock = useCallback(() => {
    setShowUnlockModal(false);
    setStatus('none');
  }, []);

  return {
    status,
    recoveryKey,
    showRecoveryModal,
    showUnlockModal,
    setupEncryption,
    disableEncryption,
    confirmRecoveryKey,
    cancelRecoveryKey,
    onUnlocked,
    skipUnlock,
  };
}
