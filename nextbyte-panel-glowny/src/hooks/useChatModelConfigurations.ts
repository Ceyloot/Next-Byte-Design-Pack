import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ReasoningLevel } from '@/lib/chat-ai/modelConfig';

export interface ChatModelConfiguration {
  id: string;
  speed_mode: string;
  reasoning: ReasoningLevel;
  fast_mode: boolean;
  byte_cost: number;
  max_input_tokens: number | null;
  max_output_tokens: number | null;
}

export type ConfigKey = `${string}::${ReasoningLevel}::${'0' | '1'}`;

/*
  Trzeci człon klucza to dawny Fast Mode, usunięty z Chat AI 08.09.2026.
  Zostaje w TYPIE, bo tabela dalej ma kolumnę i wiersze `::1`, ale odczyt
  zawsze pyta o `::0` — wariant szybki nie ma już jak zostać włączony.
*/
export function makeConfigKey(
  speedMode: string,
  reasoning: ReasoningLevel = 'medium',
): ConfigKey {
  return `${speedMode}::${reasoning}::0` as ConfigKey;
}

export type ChatModelConfigurationMap = Record<ConfigKey, ChatModelConfiguration>;

/**
 * Read-only hook zwracający pełną matrycę konfiguracji Chat AI (koszt Byte + limity
 * tokenów) per (speed_mode, reasoning, fast_mode). Karmi hover card i realny spend
 * — dzięki temu obie ścieżki widzą identyczny koszt.
 */
export function useChatModelConfigurations() {
  return useQuery({
    queryKey: ['chat-ai-model-configurations'],
    queryFn: async (): Promise<ChatModelConfigurationMap> => {
      const { data, error } = await supabase
        .from('chat_ai_model_configurations' as any)
        .select('*');
      if (error) throw error;
      const map: ChatModelConfigurationMap = {} as ChatModelConfigurationMap;
      for (const row of (data ?? []) as any[]) {
        /* Wiersze `fast_mode = true` pomijamy: funkcja „Szybkość odpowiedzi"
           zniknęła 08.09.2026, a wpuszczenie ich tutaj nadpisywałoby wiersz
           podstawowy tym samym kluczem `::0` — czyli po cichu podmieniało
           cennik na wariant, którego nie da się już włączyć. */
        if (row.fast_mode) continue;
        const key = makeConfigKey(row.speed_mode, row.reasoning as ReasoningLevel);
        map[key] = row as ChatModelConfiguration;
      }
      return map;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function findConfig(
  configs: ChatModelConfigurationMap | undefined,
  speedMode: string,
  reasoning: ReasoningLevel = 'medium',
): ChatModelConfiguration | undefined {
  if (!configs) return undefined;
  const exact = configs[makeConfigKey(speedMode, reasoning)];
  if (exact) return exact;
  // Fallback: wiersz `medium`, a gdy i jego brak — cokolwiek dla tego modelu.
  const med = configs[makeConfigKey(speedMode, 'medium')];
  if (med) return med;
  return Object.values(configs).find((c) => c.speed_mode === speedMode);
}
