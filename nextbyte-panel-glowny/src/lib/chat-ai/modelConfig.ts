/**
 * Per-model konfiguracja w Chat AI: reasoning effort + fast mode.
 * Trzymana w localStorage (globalnie + per-konwersacja), przekazywana do edge
 * function przy każdym wysłaniu wiadomości.
 *
 * Priorytet odczytu: per-konwersacja -> globalne domyślne.
 * Zapis: jeśli aktywna konwersacja (window.__currentChatConversationId),
 * zapisujemy pod key per-konwersacja; w innym wypadku globalnie.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SpeedMode } from '@/components/chat/ModelSelector';

export type ReasoningLevel = 'low' | 'medium' | 'high';

/*
  ── FAST MODE USUNIĘTY (08.09.2026) ──────────────────────────────────────
  „Szybkość odpowiedzi: Standardowa / Szybka" była w karcie modelu drugim
  przełącznikiem obok poziomu rozumowania, a pod spodem wysyłała
  `service_tier: 'priority'` do jednego dostawcy — OpenAI. Po przejściu tego
  trybu na rodzinę GPT-5.6 nie miała już czego dotyczyć: szybkość wybiera się
  wariantem (Luna), więc dwa przełączniki sterowały tą samą osią, a jeden
  z nich niczego nie zmieniał dla pozostałych modeli.
*/
export interface ModelRuntimeConfig {
  reasoning: ReasoningLevel;
}

const GLOBAL_KEY = 'chat-ai:model-config';
const CONV_KEY_PREFIX = 'chat-ai:model-config:';
const EVENT = 'chat-ai:model-config:change';
export const CONV_CHANGE_EVENT = 'chat-ai:conv-change';

export const DEFAULT_MODEL_CONFIG: ModelRuntimeConfig = {
  reasoning: 'medium',
};

type ConfigMap = Partial<Record<SpeedMode, ModelRuntimeConfig>>;

function currentConvId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const id = (window as any).__currentChatConversationId as string | undefined;
  return id || undefined;
}

function keyFor(convId?: string) {
  return convId ? `${CONV_KEY_PREFIX}${convId}` : GLOBAL_KEY;
}

function readMap(key: string): ConfigMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ConfigMap) : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, map: ConfigMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* quota / private mode — ignore */
  }
}

/**
 * WARIANT MUSI PRZEŻYĆ ZMIANĘ URZĄDZENIA (15.09.2026).
 *
 * Do dziś wybór wariantu (Luna/Terra/Sol dla GPT-5.6, Sonnet/Opus dla Claude 5)
 * żył wyłącznie w `localStorage`, więc ta sama rozmowa otwarta na telefonie
 * wracała do domyślnego `medium` — czyli do Terry. Użytkownik dostawał w jednym
 * wątku odpowiedzi z dwóch różnych modeli, o innej sile i innej stawce
 * (Luna $0,20/$1,20 · Terra $2,00/$12,00 · Sol $4,00/$20,00), i nic mu tego nie
 * mówiło, bo Terra jest domyślna, więc odznaka wariantu milczy.
 *
 * Te dwie funkcje są mostem do `conversation.settings` — trwałego, wspólnego dla
 * urządzeń miejsca, w którym `speed_mode` mieszka od dawna. Sam moduł nie sięga
 * do bazy (nie ma tu klienta Supabase); robi to `PersonalizedChatInterface`.
 */
export const MODEL_CONFIG_EVENT = EVENT;

/** Mapa konfiguracji zapisana dla danej rozmowy (bez scalania z globalną). */
export function czytajMapeRozmowy(convId: string): ConfigMap {
  return readMap(keyFor(convId));
}

/** Wgrywa mapę z bazy do pamięci przeglądarki — bez zdarzenia, żeby nie zapętlić zapisu zwrotnego. */
export function wgrajMapeRozmowy(convId: string, map: ConfigMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(convId), JSON.stringify(map));
  } catch {
    /* quota / tryb prywatny — trudno, zostaje wartość domyślna */
  }
}

export function getModelConfig(mode: SpeedMode): ModelRuntimeConfig {
  const convId = currentConvId();
  const convMap = convId ? readMap(keyFor(convId)) : {};
  const globalMap = readMap(GLOBAL_KEY);
  return {
    ...DEFAULT_MODEL_CONFIG,
    ...(globalMap[mode] ?? {}),
    ...(convMap[mode] ?? {}),
  };
}

export function setModelConfig(mode: SpeedMode, patch: Partial<ModelRuntimeConfig>) {
  const convId = currentConvId();
  const key = keyFor(convId);
  const all = readMap(key);
  const base = getModelConfig(mode); // include current effective values
  all[mode] = { ...base, ...patch };
  writeMap(key, all);
}

/**
 * Hook z automatyczną synchronizacją między kartami/komponentami
 * (nasłuchuje customEventu + storage z innego okna + zmiany konwersacji).
 */
export function useModelConfig(mode: SpeedMode) {
  const [config, setConfig] = useState<ModelRuntimeConfig>(() => getModelConfig(mode));

  useEffect(() => {
    setConfig(getModelConfig(mode));
    const refresh = () => setConfig(getModelConfig(mode));
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener(CONV_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(CONV_CHANGE_EVENT, refresh);
    };
  }, [mode]);

  const setReasoning = useCallback(
    (reasoning: ReasoningLevel) => setModelConfig(mode, { reasoning }),
    [mode],
  );
  return { config, setReasoning };
}
