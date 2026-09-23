/**
 * Dynamiczna kalkulacja kosztu Byte per wiadomość w Chat AI.
 * Uwzględnia bazowy koszt modelu + narzuty za reasoning i fast mode.
 *
 * Rules:
 *  - base: koszt bazowy modelu (zależny od speed_mode)
 *  - reasoning='high' & supports_reasoning: +1 Byte
 *  - Free tier (base=0, np. Gemini Flash / Lokalny) zostaje bezpłatny bez względu na konfigurację.
 */
import type { SpeedMode } from '@/components/chat/ModelSelector';
import type { ModelRuntimeConfig } from './modelConfig';

/**
 * Stawki bazowe skalibrowane 20.07.2026 na realnym zużyciu z produkcji.
 *
 * DOCELOWA MARŻA: 1.5× kosztu API (decyzja właściciela 20.07.2026).
 * Zmierzone marże przy tych stawkach (1 Byte = 0,15 PLN, kurs 4,0 PLN/USD):
 *   ultra 6,52×  ·  gpt54 4,23×  ·  sonnet46 2,05×  ·  pro 1,69×  ·  opus47 1,50×
 * Cztery pierwsze przekraczają cel — celowo NIE obniżane, bo to modele tańsze
 * w obsłudze i marża jest tam premią, nie nadużyciem.
 * (próbka 1 059 wiadomości / 30 dni). Wcześniej dwa tryby sprzedawały poniżej
 * kosztu API — przy 1 Byte = 0,15 PLN i kursie 4,0 PLN/USD:
 *
 *   opus47  koszt ~2,248 PLN/wiadomość (15/75 $ za 1M tok) — pobierano 5 Byte
 *           = 0,75 PLN, czyli odzyskiwane było 33% kosztu (−1,50 PLN/wiadomość).
 *   pro     koszt ~0,178 PLN/wiadomość — pobierano 1 Byte = 0,15 PLN (−16%).
 *           Do kosztu nie wliczano tokenów "thinking", a przy tym modelu jest
 *           ich ~2,6× więcej niż samej odpowiedzi.
 *
 * Nowe wartości pokrywają koszt z niewielką marżą. Przy zmianie cennika modeli
 * u dostawcy TE LICZBY TRZEBA PRZELICZYĆ PONOWNIE — nie są uniwersalne.
 */
export const BASE_BYTE_COST: Record<string, number> = {
  fast: 1,          // 0 -> 1 (decyzja wlasciciela 20.07.2026)
  local: 0,
  pro: 2,          // było 1 — sprzedaż poniżej kosztu
  ultra: 2,
  gemini31pro: 2,
  grok43: 2,
  sonnet46: 3,
  gpt54: 4,
  opus47: 23,      // 5 -> 16 (pokrycie kosztu) -> 23 (marza 1.5x)
};

export interface ModelCapabilities {
  supports_reasoning?: boolean;

}

/**
 * Fallback capability map — używany kiedy nie mamy metadata z DB (np. w useChatAI).
 * Synchronizowany z seed'em w chat_ai_model_metadata (migration 20260706161131).
 */
export const MODEL_CAPS: Record<string, ModelCapabilities> = {
  fast:        { supports_reasoning: false },
  local:       { supports_reasoning: false },
  // Native Gemini path — reasoning steruje thinkingBudget w edge function.
  pro:         { supports_reasoning: true },
  ultra:       { supports_reasoning: true },
  // Runware / OpenRouter path — reasoning_effort mapowany bezpośrednio.
  gemini31pro: { supports_reasoning: true },
  /* Fast Mode ZDJĘTY 08.09.2026 wraz z przejściem na rodzinę GPT-5.6.
     Był to `service_tier: 'priority'` z czasów GPT-5.4; rodzina 5.6 dzieli się
     na trzy warianty, a szybkość wybiera się właśnie wariantem (Luna), nie
     osobnym przełącznikiem obok. Dwa przełączniki na jedną oś to obietnica,
     której model nie spełnia. */
  gpt54:       { supports_reasoning: true },
  sonnet46:    { supports_reasoning: true },
  opus47:      { supports_reasoning: true },
  grok43:      { supports_reasoning: true },
};

export function getBaseByteCost(speedMode: SpeedMode | string): number {
  return BASE_BYTE_COST[speedMode] ?? 1;
}

/**
 * Zwraca finalny koszt Byte dla danego modelu z uwzględnieniem runtime config.
 */
export function computeByteCost(
  speedMode: SpeedMode | string,
  config?: Partial<ModelRuntimeConfig>,
  caps?: ModelCapabilities,
  /**
   * Opcjonalna mapa nadpisań kosztu z DB (chat_ai_model_configurations).
   * Klucz: `${speedMode}::${reasoning}::${'0'|'1'}`.
   * Gdy istnieje wpis dla aktualnej kombinacji — używany bezpośrednio jako pełny
   * koszt (nie delta). Fallback do formuły base + reguły reasoning/fast.
   */
  configurations?: Record<string, { byte_cost: number }> | null,
): number {
  const reasoning = (config?.reasoning ?? 'medium') as string;

  if (configurations) {
    /* Trzeci człon klucza to dawny Fast Mode — usunięty 08.09.2026. Wiersze
       `::1` zostają w bazie, ale nikt ich już nie szuka. */
    const key = `${speedMode}::${reasoning}::0`;
    const override = configurations[key];
    if (override && Number.isFinite(override.byte_cost)) {
      return Math.max(0, Math.round(override.byte_cost));
    }
  }

  const base = getBaseByteCost(speedMode);
  if (base <= 0) return 0; // free tier — no surcharges

  let extra = 0;
  if (caps?.supports_reasoning && reasoning === 'high') extra += 1;

  return base + extra;
}
