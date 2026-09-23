import { useModelConfig } from '@/lib/chat-ai/modelConfig';
import { computeByteCost, MODEL_CAPS } from '@/lib/chat-ai/byteCost';
import { useChatModelConfigurations } from './useChatModelConfigurations';
import type { SpeedMode } from '@/components/chat/ModelSelector';

/**
 * Shared hook — zwraca finalny koszt Byte dla aktualnie wybranego modelu
 * z uwzględnieniem reasoning effort, fast mode i nadpisań z DB.
 * Karmi wszystkie miejsca pokazujące koszt (pill w ModelSelector, Send button,
 * Home / Folder panele) — dzięki temu UI i realny spend zawsze się zgadzają.
 */
export function useEffectiveByteCost(speedMode: SpeedMode | string): number {
  const { config } = useModelConfig(speedMode as SpeedMode);
  const { data: configurations } = useChatModelConfigurations();
  return computeByteCost(speedMode, config, MODEL_CAPS[speedMode], configurations);
}
