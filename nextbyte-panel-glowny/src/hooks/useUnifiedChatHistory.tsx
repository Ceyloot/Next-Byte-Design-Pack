import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeMessageData } from '@/utils/sanitize';
import { getMEKFromSession, encryptWithMEK, decryptWithMEK } from '@/utils/masterKeyManager';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'voice' | 'file';
  fileName?: string;
  metadata?: any;
  attachments?: Array<{
    id?: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    storage_path?: string;
  }>;
}

interface ClearChatResult {
  success: boolean;
  deleted_count?: number;
  chat_type?: string;
  error?: string;
  message?: string;
}

type ChatType = 'agent_ai' | 'agents_ai' | 'personalized_ai';

export const useUnifiedChatHistory = (
  chatType: ChatType, 
  conversationId: string | null = null,
  agentId: string | null = null,
  conversationMode?: string // Isolates cache between different conversation modes
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Query hook for chat history
  const { 
    data: messages = [], 
    isLoading: isLoadingHistory,
    refetch: refetchHistory 
  } = useQuery({
    // Include conversationMode in queryKey to prevent cache sharing between Chat AI and NextByte Assistant
    queryKey: ['chatHistory', chatType, conversationId, conversationMode || 'default'],
    // For agent_ai and agents_ai, we don't require conversationId (legacy behavior)
    // For personalized_ai, we need conversationId
    enabled: chatType === 'agent_ai' || chatType === 'agents_ai' || !!conversationId,
    queryFn: async (): Promise<Message[]> => {
      // 🔒 Preserve Local AI private-session messages across any refetch/invalidate.
      // Private-mode messages never hit the DB, so they would be wiped here otherwise.
      const previousCache = queryClient.getQueryData<Message[]>([
        'chatHistory', chatType, conversationId, conversationMode || 'default',
      ]) ?? [];
      const privateSessionMessages = previousCache.filter(
        (m) => (m.metadata as any)?.localAI?.privacyMode === 'private'
      );
      // 🔧 Preserve in-flight optimistic messages (temp_ id) across a refetch that
      // races the save. Without this, a refetch triggered inside saveChatMessage's
      // write window would wipe the just-sent message before its temp→real swap
      // completes (the "znikająca wiadomość" bug). Private-mode messages are handled
      // separately above, so exclude them here to avoid double re-injection.
      const optimisticTempMessages = previousCache.filter(
        (m) =>
          typeof m.id === 'string' &&
          m.id.startsWith('temp_') &&
          (m.metadata as any)?.localAI?.privacyMode !== 'private'
      );
      // Verify and refresh session if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        console.log('Attempting to refresh session...');
        await supabase.auth.refreshSession();
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log(`Loading chat history for user ${user.id}, chat_type: ${chatType}`);

      let query = supabase
        .from('user_chat_history')
        .select(`
          *,
          user_chat_attachments (
            id,
            file_name,
            file_type,
            file_size,
            file_url,
            storage_path
          )
        `)
        .eq('user_id', user.id)
        .eq('chat_type', chatType)
        .neq('message_type', 'deep_research') // Exclude deep research reports - they're shown in ResearchPanel
        .not('metadata', 'cs', '{"is_streaming_partial":true}') // Exclude incomplete partial saves
        .not('metadata', 'cs', '{"is_generating":true}'); // Hide backend in-progress rows from normal history render
      
      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      // Filter by agent_id if provided (custom agents panel)
      if (agentId) {
        query = query.contains('metadata', { customAgentId: agentId });
      }
      // BUG 1 fix: cap initial history load. Prevents fetching thousands of rows
      // (which locked up the UI on old conversations). Newest 300 messages is more
      // than enough context; older ones can be loaded on demand later.
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) {
        console.error('Error loading chat history:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        toast({
          title: "Błąd ładowania historii",
          description: `${error.message} (${error.code || 'unknown'})`,
          variant: "destructive"
        });
        return [];
      }

      console.log(`Loaded ${data?.length || 0} messages for ${chatType}`);

      // Decrypt encrypted messages if MEK is available
      const mek = await getMEKFromSession();

      const messagesData: Message[] = await Promise.all(data.map(async (msg: any) => {
        let content = msg.message_content;

        // Decrypt if message is encrypted and MEK is available
        if (msg.is_encrypted && msg.encrypted_content && msg.encryption_iv && mek) {
          try {
            content = await decryptWithMEK(msg.encrypted_content, msg.encryption_iv, mek);
          } catch (e) {
            console.warn('Failed to decrypt message:', msg.id);
            content = '[🔒 Zaszyfrowana wiadomość — odblokuj szyfrowanie]';
          }
        } else if (msg.is_encrypted && !mek) {
          content = '[🔒 Zaszyfrowana wiadomość — odblokuj szyfrowanie]';
        }

        return {
          id: msg.id,
          content,
          sender: msg.sender as 'user' | 'bot',
          timestamp: new Date(msg.created_at),
          type: msg.message_type as 'text' | 'voice' | 'file',
          fileName: msg.file_name || undefined,
          metadata: msg.metadata || {},
          attachments: msg.user_chat_attachments && msg.user_chat_attachments.length > 0
            ? msg.user_chat_attachments.map((att: any) => ({
                id: att.id,
                file_name: att.file_name,
                file_type: att.file_type,
                file_size: att.file_size,
                file_url: att.file_url,
                storage_path: att.storage_path
              }))
            : undefined
        };
      }));
      
      // Regenerate signed URLs for attachments (fixes expired signed URLs)
      for (const msg of messagesData) {
        if (msg.attachments) {
          for (const att of msg.attachments) {
            // Determine storage path: use saved one, or extract from signed URL for legacy records
            let storagePath = att.storage_path;
            if (!storagePath && att.file_url?.includes('/object/sign/chat-attachments/')) {
              // Extract path from signed URL: .../object/sign/chat-attachments/{path}?token=...
              const match = att.file_url.match(/\/object\/sign\/chat-attachments\/([^?]+)/);
              if (match) storagePath = decodeURIComponent(match[1]);
            }
            
            // Only regenerate for signed URLs (skip public URLs)
            if (storagePath && att.file_url?.includes('/object/sign/')) {
              try {
                const { data: signedUrlData } = await supabase.storage
                  .from('chat-attachments')
                  .createSignedUrl(storagePath, 3600);
                if (signedUrlData?.signedUrl) {
                  att.file_url = signedUrlData.signedUrl;
                }
              } catch (e) {
                console.warn('Failed to regenerate signed URL for attachment:', att.file_name);
              }
            }
          }
        }
      }

      // Regenerate signed URLs for generated images in metadata
      for (const msg of messagesData) {
        const imageMeta = (msg.metadata as any)?.image;
        if (imageMeta?.storage_path) {
          try {
            const { data: signedUrlData } = await supabase.storage
              .from('chat-attachments')
              .createSignedUrl(imageMeta.storage_path, 3600);
            if (signedUrlData?.signedUrl) {
              imageMeta.url = signedUrlData.signedUrl;
            }
          } catch (e) {
            console.warn('Failed to regenerate signed URL for generated image');
          }
        } else if (imageMeta?.url && imageMeta.url.includes('/object/sign/chat-attachments/')) {
          // Extract storage_path from expired signed URL
          const match = imageMeta.url.match(/\/object\/sign\/chat-attachments\/([^?]+)/);
          if (match) {
            const storagePath = decodeURIComponent(match[1]);
            try {
              const { data: signedUrlData } = await supabase.storage
                .from('chat-attachments')
                .createSignedUrl(storagePath, 3600);
              if (signedUrlData?.signedUrl) {
                imageMeta.url = signedUrlData.signedUrl;
                imageMeta.storage_path = storagePath;
              }
            } catch (e) {
              console.warn('Failed to regenerate signed URL for generated image (legacy)');
            }
          }
        }
      }

      // Reverse to get chronological order
      messagesData.reverse();

      // Safety net: if any stale generating rows still slip through, hide them locally
      const visibleMessages = messagesData.filter(msg => msg.metadata?.is_generating !== true);

      // ✅ FIX: Deduplicate messages (prioritize real IDs over temp IDs, catch partial saves)
      const dedupedMessages = visibleMessages.reduce((acc, msg) => {
        const duplicate = acc.find(m => {
          if (m.sender !== msg.sender) return false;
          const timeDiff = Math.abs(m.timestamp.getTime() - msg.timestamp.getTime());
          if (timeDiff > 5000) return false; // 5s window for partial saves
          
          // Exact content match
          if (m.content === msg.content) return true;
          
          // Partial content match (one is substring of the other — catches partial saves)
          if (timeDiff < 5000 && m.sender === 'bot' && msg.sender === 'bot') {
            const shorter = m.content.length < msg.content.length ? m.content : msg.content;
            const longer = m.content.length < msg.content.length ? msg.content : m.content;
            if (shorter.length > 20 && longer.startsWith(shorter.slice(0, 100))) return true;
          }
          
          return false;
        });
        
        if (duplicate) {
          // If current message has real ID and duplicate has temp ID, replace it
          if (!msg.id.startsWith('temp_') && duplicate.id.startsWith('temp_')) {
            return acc.map(m => m === duplicate ? msg : m);
          }
          // If current message has temp ID and duplicate has real ID, skip it
          if (msg.id.startsWith('temp_')) {
            return acc;
          }
          // For duplicates with real IDs, keep the longer (more complete) message
          if (msg.content.length > duplicate.content.length) {
            return acc.map(m => m === duplicate ? msg : m);
          }
          return acc;
        }
        
        return [...acc, msg];
      }, [] as Message[]);

      // Ensure chronological order after deduplication
      const sortedMessages = dedupedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // 🔧 Re-inject in-flight optimistic (temp_) messages missing from this fetch.
      // Only keep temps the DB fetch did NOT already surface — check by id AND by
      // content+sender so a message that reached the DB under a real id is not
      // duplicated (idempotent, no double-render).
      const missingOptimistic = optimisticTempMessages.filter((tm) => {
        if (sortedMessages.some((m) => m.id === tm.id)) return false;
        if (sortedMessages.some((m) => m.sender === tm.sender && m.content === tm.content)) return false;
        return true;
      });

      // 🔒 Re-inject Local AI private-session messages (never persisted to DB)
      const reinjected = [...missingOptimistic, ...privateSessionMessages];
      const finalMessages = reinjected.length > 0
        ? [...sortedMessages, ...reinjected].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          )
        : sortedMessages;

      console.log(`📊 Załadowano ${visibleMessages.length} widocznych, po dedup: ${sortedMessages.length}, + optimistic: ${missingOptimistic.length}, + private session: ${privateSessionMessages.length}`);
      return finalMessages;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch too often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false, // CRITICAL: Don't refetch on tab switch!
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchOnMount: false, // Don't refetch on component mount if cache exists
  });

  const saveChatMessage = async (message: Omit<Message, 'id'>, convId?: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Generate temporary ID for optimistic update
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      // ✅ Optymistic update FIRST - add message to UI immediately
      const optimisticMessage: Message = {
        id: tempId,
        content: message.content,
        sender: message.sender,
        timestamp: timestamp,
        type: message.type || 'text',
        fileName: message.fileName,
        metadata: message.metadata || {},
        attachments: message.attachments
      };

      // 🔧 Cancel any in-flight refetch for THIS conversation before the optimistic
      // write, so a concurrent queryFn cannot overwrite the cache and drop the temp_
      // message we are about to add (root cause of the disappearing-message race).
      await queryClient.cancelQueries({
        queryKey: ['chatHistory', chatType, conversationId, conversationMode || 'default'],
      });

      queryClient.setQueryData<Message[]>(['chatHistory', chatType, conversationId, conversationMode || 'default'], (oldMessages = []) => {
        const updated = [...oldMessages, optimisticMessage];
        // Sort by timestamp to ensure chronological order
        return updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });

      // Sanitize message data before database insert
      const sanitized = sanitizeMessageData(message.content, message.metadata);

      // Try to encrypt with MEK if available
      const mek = await getMEKFromSession();
      let encryptionFields: { encrypted_content?: string; encryption_iv?: string; content_hash?: string; is_encrypted: boolean } = { is_encrypted: false };
      let storedContent = sanitized.content;

      if (mek) {
        try {
          const encrypted = await encryptWithMEK(sanitized.content, mek);
          encryptionFields = {
            encrypted_content: encrypted.encryptedContent,
            encryption_iv: encrypted.iv,
            content_hash: encrypted.contentHash,
            is_encrypted: true,
          };
          storedContent = '[ENCRYPTED]';
        } catch (e) {
          console.warn('Encryption failed, saving as plain text:', e);
        }
      }

      // Insert message first
      // ✅ For agents_ai chat, don't use conversation_id to avoid FK constraint issues
      const insertData: any = {
        user_id: user.id,
        chat_type: chatType,
        message_content: storedContent,
        sender: message.sender,
        message_type: message.type || 'text',
        file_name: message.fileName || null,
        metadata: sanitized.metadata,
        ...encryptionFields,
      };
      
      // Only add conversation_id for non-agents_ai chats
      if (chatType !== 'agents_ai') {
        insertData.conversation_id = convId || conversationId;
      }
      
      const { data: insertedMessage, error } = await supabase
        .from('user_chat_history')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving message to user_chat_history:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          chat_type: chatType,
          user_id: user.id,
          table: 'user_chat_history'
        });
        
        // Check for Unicode escape sequence errors
        if (
          error.message?.includes('Unicode escape') ||
          error.message?.includes('invalid input syntax for type json') ||
          error.code === '22P02'
        ) {
          console.warn('🔧 Unicode escape error detected, message NOT removed from UI');
          
          // Mark message as unsaved in UI (keep it visible)
          queryClient.setQueryData<Message[]>(['chatHistory', chatType, conversationId, conversationMode || 'default'], (oldMessages = []) => {
            return oldMessages.map(msg => 
              msg.id === tempId 
                ? { ...msg, metadata: { ...msg.metadata, unsaved: true } }
                : msg
            );
          });
          
          toast({
            title: "Ostrzeżenie",
            description: "Wiadomość wyświetlona, ale nie zapisana w bazie (problem z formatowaniem)",
            variant: "destructive"
          });
        } else {
          // For other errors, remove optimistic message
          queryClient.setQueryData<Message[]>(['chatHistory', chatType, conversationId, conversationMode || 'default'], (oldMessages = []) => {
            return oldMessages.filter(msg => msg.id !== tempId);
          });
          
          toast({
            title: "Błąd",
            description: `Nie udało się zapisać wiadomości: ${error.message}`,
            variant: "destructive"
          });
        }
        return null;
      }

      // ✅ FIX: Reconcile temporary ID with real ID from database (idempotent, no dupes).
      // Three cases, because a racing refetch may have mutated the cache in between:
      //   1) real id already present  → drop any lingering temp twin (dedupe)
      //   2) temp still present        → swap temp id → real id (normal path)
      //   3) neither present           → refetch wiped the temp; re-add with real id + sort
      if (insertedMessage?.id) {
        const realId = insertedMessage.id;
        queryClient.setQueryData<Message[]>(['chatHistory', chatType, conversationId, conversationMode || 'default'], (oldMessages = []) => {
          if (oldMessages.some(m => m.id === realId)) {
            return oldMessages.filter(m => m.id !== tempId);
          }
          if (oldMessages.some(m => m.id === tempId)) {
            return oldMessages.map(m => m.id === tempId ? { ...m, id: realId } : m);
          }
          const restored: Message = { ...optimisticMessage, id: realId };
          return [...oldMessages, restored].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
        console.log(`✅ Zaktualizowano ID wiadomości: ${tempId} → ${realId}`);
      }

      // Save attachments if present
      if (message.attachments && message.attachments.length > 0 && insertedMessage) {
        const attachmentsToInsert = message.attachments.map(att => ({
          user_id: user.id,
          chat_message_id: insertedMessage.id,
          file_name: att.file_name,
          file_type: att.file_type,
          file_size: att.file_size,
          file_url: att.file_url,
          storage_path: (att as any).storage_path || null
        }));

        const { error: attachError } = await supabase
          .from('user_chat_attachments')
          .insert(attachmentsToInsert);

        if (attachError) {
          console.error('Error saving attachments:', attachError);
        }
      }

      // Success - optimistic message stays in cache
      // Real data will be fetched on next history load
      return insertedMessage?.id ?? null;
    } catch (error) {
      console.error('Unexpected error saving message:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive"
      });
      return null;
    }
  };

  /**
   * Usuwa POJEDYNCZĄ wiadomość (wiersz `user_chat_history`) — po realnym ID.
   * Używane przez regenerację odpowiedzi: stara odpowiedź musi zniknąć z bazy
   * ZANIM poleci nowe zapytanie, bo edge function `chat-ai` odtwarza historię
   * rozmowy z bazy (`include_chat_history: true`) i inaczej model zobaczyłby
   * własną nieudaną odpowiedź.
   *
   * Dyscyplina identyczna jak w `saveChatMessage` (fix wyścigu optymistycznego):
   *  1) `await cancelQueries` PRZED zapisem — żeby refetch w locie, który
   *     wystartował jeszcze przed usunięciem, nie nadpisał cache starą listą,
   *  2) usunięcie w bazie,
   *  3) drugi `cancelQueries` + filtr po ID — idempotentny (dwukrotne wywołanie
   *     to no-op), nigdy po indeksie/„ostatnim elemencie".
   *
   * Wiadomości optymistyczne (`temp_`) są świadomie odrzucane: ich swap
   * temp→real może być w locie, a usunięcie temp-a wpadłoby w gałąź 3
   * reconcilera w `saveChatMessage` i wiadomość zostałaby przywrócona.
   */
  const deleteChatMessage = async (messageId: string): Promise<boolean> => {
    if (!messageId) return false;

    if (messageId.startsWith('temp_') || messageId === 'streaming-live') {
      console.warn('[CHAT-HISTORY] Pomijam usuwanie wiadomości bez realnego ID:', messageId);
      return false;
    }

    const queryKey = ['chatHistory', chatType, conversationId, conversationMode || 'default'];

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        console.error('[CHAT-HISTORY] Brak autoryzacji przy usuwaniu wiadomości:', userError);
        return false;
      }

      await queryClient.cancelQueries({ queryKey });

      const { error: deleteError } = await supabase
        .from('user_chat_history')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('[CHAT-HISTORY] Błąd usuwania wiadomości:', deleteError);
        return false;
      }

      // Ponowny cancel: między awaitem a zapisem mógł wystartować nowy refetch
      // z migawką bazy sprzed usunięcia.
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<Message[]>(queryKey, (oldMessages = []) =>
        oldMessages.filter((m) => m.id !== messageId)
      );

      console.log(`🗑️ Usunięto wiadomość ${messageId}`);
      return true;
    } catch (error) {
      console.error('[CHAT-HISTORY] Nieoczekiwany błąd usuwania wiadomości:', error);
      return false;
    }
  };

  const clearChatHistory = async (): Promise<boolean> => {
    console.log(`🧹 Rozpoczynam usuwanie wiadomości czatu ${chatType}...`);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.id) {
        console.error('❌ Brak autoryzacji lub user ID:', userError);
        toast({
          title: "Błąd autoryzacji",
          description: "Musisz być zalogowany aby wyczyścić historię",
          variant: "destructive"
        });
        return false;
      }

      console.log('👤 Wywołuję funkcję usuwania dla użytkownika:', user.id);

      // Handle personalized_ai differently - delete from user_chat_history by conversation
      if (chatType === 'personalized_ai' && conversationId) {
        console.log(`🧹 Czyszczenie historii konwersacji: ${conversationId}`);
        
        const { error: deleteError, count } = await supabase
          .from('user_chat_history')
          .delete({ count: 'exact' })
          .eq('user_id', user.id)
          .eq('conversation_id', conversationId);
        
        if (deleteError) {
          console.error('❌ Błąd usuwania:', deleteError);
          return false;
        }
        
        console.log(`✅ Usunięto ${count || 0} wiadomości z konwersacji`);

        /*
          ══════════════════════════════════════════════════════════════════
           KASOWANIE HISTORII ZOSTAWIAŁO STRESZCZENIE (10.09.2026)
          ══════════════════════════════════════════════════════════════════

          Usuwaliśmy wyłącznie `user_chat_history`, a wiersz
          w `conversation_summaries` zostawał — razem z pełnym streszczeniem
          skasowanej rozmowy. Backend czyta go z powrotem, gdy rozmowa znów
          urośnie ponad próg, więc Asystent po „Wyczyść historię" potrafił
          zacytować to, co użytkownik właśnie kazał usunąć.

          Zmierzone na produkcji: rozmowa e0d84d7f… (Asystent) ma
          `message_count = 50`, a w historii zostały DWIE wiadomości.

          Kasujemy więc jedno i drugie. Błąd tego zapytania nie przewraca
          operacji — wiadomości już zniknęły i to jest to, o co człowiek
          prosił; zostaje ślad w konsoli.
        */
        const { error: bladStreszczenia } = await supabase
          .from('conversation_summaries')
          .delete()
          .eq('user_id', user.id)
          .eq('conversation_id', conversationId);
        if (bladStreszczenia) {
          console.error('❌ Historia skasowana, ale streszczenie zostało:', bladStreszczenia);
        } else {
          /* Kafelek kontekstu trzyma streszczenie w stanie — bez tego
             sygnału pokazywałby tokeny nieistniejącego już tekstu. */
          window.dispatchEvent(new CustomEvent('nb-streszczenie-zmienione', { detail: { conversationId } }));
        }

        queryClient.setQueryData(['chatHistory', chatType, conversationId, conversationMode || 'default'], []);
        return true;
      }

      // Wybierz odpowiednią funkcję w zależności od typu czatu i obecności agent_id
      let functionName: string;
      let params: { p_user_id: string; p_agent_id?: string };
      
      if (agentId) {
        // Jeśli mamy agent_id, używamy funkcji per-agent
        functionName = chatType === 'agent_ai' 
          ? 'clear_user_agent_chat_history' 
          : 'clear_user_agents_chat_history';
        params = {
          p_user_id: user.id,
          p_agent_id: agentId
        };
        console.log(`🎯 Czyszczenie historii dla agenta: ${agentId}`);
      } else {
        // Bez agent_id - czyszczenie całej historii typu czatu
        functionName = chatType === 'agent_ai' 
          ? 'clear_agent_chat_history' 
          : 'clear_agents_chat_history';
        params = {
          p_user_id: user.id
        };
        console.log(`🧹 Czyszczenie całej historii typu: ${chatType}`);
      }

      const { data, error } = await supabase.rpc(functionName as any, params);

      if (error) {
        console.error('❌ Błąd funkcji bazy danych:', error);
        return false;
      }

      console.log('📊 Wynik funkcji:', data);

      const result = data as unknown as ClearChatResult;
      
      if (result?.success) {
        console.log('✅ Historia czatu wyczyszczona pomyślnie');
        console.log(`📈 Usunięto wiadomości: ${result.deleted_count || 0}`);
        
        // Clear React Query cache
        queryClient.setQueryData(['chatHistory', chatType, conversationId, conversationMode || 'default'], []);
        
        return true;
      } else {
        console.error('❌ Funkcja zwróciła błąd:', result?.error || 'Nieznany błąd');
        return false;
      }
    } catch (error) {
      console.error('❌ Nieoczekiwany błąd:', error);
      
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania historii",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const getChatStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_chat_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading chat stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading chat stats:', error);
      return null;
    }
  };

  return {
    messages,
    saveChatMessage,
    deleteChatMessage,
    clearChatHistory,
    getChatStats,
    isLoadingHistory,
    refetchHistory
  };
};
