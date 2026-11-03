/**
 * Local AI server presets (LM Studio, Ollama, Custom OpenAI-compatible).
 * All endpoints follow OpenAI-compatible REST schema (/v1/models, /v1/chat/completions).
 */
export type LocalAIPresetId = 'lmstudio' | 'ollama' | 'custom';

export interface LocalAIPreset {
  id: LocalAIPresetId;
  label: string;
  description: string;
  defaultBaseUrl: string;
  setupHint: string;
  docsUrl?: string;
}

export const LOCAL_AI_PRESETS: LocalAIPreset[] = [
  {
    id: 'lmstudio',
    label: 'LM Studio',
    description: 'Najpopularniejsze rozwiązanie z GUI dla macOS / Windows / Linux.',
    defaultBaseUrl: 'http://127.0.0.1:1234/v1',
    setupHint:
      'Otwórz LM Studio → zakładka „Developer" → „Local Server" → załaduj model → kliknij „Start Server".',
    docsUrl: 'https://lmstudio.ai/docs/local-server',
  },
  {
    id: 'ollama',
    label: 'Ollama',
    description: 'Lekki CLI runner dla modeli LLM (Llama, Mistral, Qwen, DeepSeek...).',
    defaultBaseUrl: 'http://127.0.0.1:11434/v1',
    setupHint:
      'Zainstaluj Ollama → `ollama pull llama3.2` → `ollama serve` (działa w tle automatycznie).',
    docsUrl: 'https://github.com/ollama/ollama/blob/main/docs/openai.md',
  },
  {
    id: 'custom',
    label: 'Inny (OpenAI-compatible)',
    description: 'Dowolny serwer obsługujący endpointy /v1/models i /v1/chat/completions.',
    defaultBaseUrl: '',
    // NIE podawaj tu adresu z sieci lokalnej jako przykładu: strona chodzi po HTTPS,
    // więc zwykłe http:// spoza pętli zwrotnej przeglądarka blokuje (mixed content)
    // i żądanie nie wychodzi w ogóle. Wcześniej sugerowane było http://192.168.1.20:8080/v1
    // — adres, który u nikogo nie mógł zadziałać.
    setupHint:
      'Podaj pełny URL endpointu, np. http://127.0.0.1:8080/v1. Wymagane: /v1/models i /v1/chat/completions. ' +
      'Serwer na innym komputerze musi być wystawiony po HTTPS — zwykłe http:// spoza tego komputera przeglądarka zablokuje.',
  },
];

export const getPreset = (id: LocalAIPresetId): LocalAIPreset =>
  LOCAL_AI_PRESETS.find((p) => p.id === id) ?? LOCAL_AI_PRESETS[0];
