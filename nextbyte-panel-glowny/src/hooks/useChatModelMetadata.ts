import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SpeedMode } from '@/components/chat/ModelSelector';

export type ModelProvider = 'openai' | 'google' | 'anthropic' | 'xai' | 'nextbyte';

export interface ChatModelMetadata {
  speed_mode: SpeedMode;
  display_name: string;
  provider: ModelProvider;
  description: string;
  intelligence: number;
  speed: number;
  context: number;
  cost: number;
  context_window: string;
  supports_reasoning: boolean;
  sort_order: number;
}

/*
  ══════════════════════════════════════════════════════════════════════════
   OCENY MODELI — KAŻDA KOLUMNA Z REGUŁY, NIE Z OKA (04.08.2026)
  ══════════════════════════════════════════════════════════════════════════

  Michał: „nie zgadzają mi się statystyki, czemu inteligencja pro jest tak
  jak inteligencja ultra".

  Miał rację, a przy okazji wyszło, że rozjechane były wszystkie cztery
  kolumny. Stąd reguły — żeby następna zmiana nie była znowu zgadywaniem:

    KONTEKST   = f(realne okno):  1M → 10, 400K → 8, 200K → 7, zależne → 5
    KOSZT      = f(realna cena w Byte), „wyżej = taniej":
                 0 → 10, 1 → 9, 2 → 8, 3 → 7, 4 → 6, 23 → 1
    INTELIGENCJA — ten sam model MUSI mieć tę samą liczbę; większy budżet
                 myślenia podnosi
    SZYBKOŚĆ   — większy budżet myślenia obniża

  Co było nie tak (`pro`, `ultra` i `gemini31pro` to TEN SAM model
  `google/gemini-3.1-pro-preview`, patrz mapowanie w chat-ai/index.ts):
   • `gemini31pro` miał inteligencję 10, a `pro` 9 — przy identycznym modelu
     i identycznym budżecie myślenia 4 096. Jedna z tych liczb była fałszem.
   • `ultra` miał inteligencję 9, czyli tyle co `pro`, mimo 6× większego
     budżetu myślenia (24 576 vs 4 096). To jest uwaga Michała.
   • `ultra` miał SZYBKOŚĆ 9 przy `pro` 7 — odwrotnie niż w rzeczywistości
     i wbrew własnemu opisowi („najwyższa jakość kosztem czasu"). Sześć razy
     więcej myślenia nie może być szybsze.
   • KONTEKST nie miał związku z oknem: 1M dostawało raz 7 (`fast`), raz 10;
     200K i 400K dostawały tę samą ósemkę.
   • KOSZT nie miał związku z ceną: cztery tryby po 2 Byte (`pro`, `ultra`,
     `gemini31pro`, `grok43`) miały cztery różne oceny — 9, 8, 6 i 6.

  Zastosowane RÓWNIEŻ w tabeli `chat_ai_model_metadata`, która jest źródłem
  na produkcji; te wartości to tylko zapas, gdy zapytanie nie przejdzie.
*/
export const DEFAULT_CHAT_MODEL_METADATA: Record<SpeedMode, ChatModelMetadata> = {
  gemini31pro: {
    speed_mode: 'gemini31pro',
    display_name: 'Gemini 3.1 Pro',
    provider: 'google',
    description: 'Google Gemini 3.1 Pro Preview — SOTA multimodal reasoning, 1M kontekst, mocny w kodzie i długich dokumentach.',
    intelligence: 9,
    speed: 7,
    context: 10,
    cost: 8,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 10,
  },
  grok43: {
    speed_mode: 'grok43',
    display_name: 'Grok 4.3',
    provider: 'xai',
    description: 'xAI Grok 4.3 — agentic reasoning, low-hallucination, 1M kontekst, mocny w kodzie i analizie danych.',
    intelligence: 8,
    speed: 8,
    context: 10,
    cost: 8,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 20,
  },
  gpt54: {
    speed_mode: 'gpt54',
    display_name: 'GPT-5.6',
    provider: 'openai',
    description: 'OpenAI GPT-5.6 — poziom rozumowania wybiera wariant: Niski to Luna (tani, szybki), Średni to Terra (zbalansowany), Wysoki to Sol (flagowy). 1,05M kontekstu.',
    intelligence: 10,
    speed: 6,
    context: 8,
    cost: 6,
    context_window: '1,05M tokenów',
    supports_reasoning: true,
    sort_order: 30,
  },
  sonnet46: {
    speed_mode: 'sonnet46',
    display_name: 'Claude Sonnet 5',
    provider: 'anthropic',
    description: 'Anthropic Claude Sonnet 5 — najlepszy stosunek jakości do ceny, 1M kontekst, pamięć podręczna promptu i uruchamianie kodu.',
    intelligence: 9,
    speed: 8,
    context: 7,
    cost: 7,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 40,
  },
  opus47: {
    speed_mode: 'opus47',
    display_name: 'Claude Opus 5',
    provider: 'anthropic',
    description: 'Anthropic Claude Opus 5 — najwyższa inteligencja, 1M kontekst, pamięć podręczna promptu i uruchamianie kodu.',
    intelligence: 10,
    speed: 4,
    context: 10,
    cost: 1,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 50,
  },
  local: {
    speed_mode: 'local',
    display_name: 'Lokalny',
    provider: 'nextbyte',
    description: 'Twój lokalny serwer AI — prywatne przetwarzanie bez naliczania Byte (jakość zależy od Twojego modelu).',
    intelligence: 5,
    speed: 5,
    context: 5,
    cost: 10,
    context_window: 'zależne od modelu',
    supports_reasoning: false,
    sort_order: 60,
  },
  fast: {
    speed_mode: 'fast',
    display_name: 'Szybki',
    provider: 'nextbyte',
    description: 'Gemini 3.1 Flash Lite — błyskawiczne odpowiedzi do prostych zadań, najtańszy tier (1 Byte).',
    intelligence: 5,
    speed: 10,
    context: 10,
    cost: 9,
    context_window: '1M tokenów',
    supports_reasoning: false,
    sort_order: 70,
  },
  pro: {
    speed_mode: 'pro',
    display_name: 'Pro',
    provider: 'nextbyte',
    description: 'Gemini 3.1 Pro Preview — zaawansowane rozumowanie i analiza do bardziej złożonych zadań (2 Byte).',
    intelligence: 9,
    speed: 7,
    context: 10,
    cost: 8,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 80,
  },
  ultra: {
    speed_mode: 'ultra',
    display_name: 'Ultra',
    provider: 'nextbyte',
    // ⚠️ Lustro wiersza `ultra` w chat_ai_model_metadata — trzymać zgodne.
    // Mówiło „Gemini 3.5 Flash" jeszcze długo po PR #35, który przepiął ultra na
    // gemini-3.1-pro-preview. Cena też szła za starym modelem (naprawione w #39).
    description: 'Gemini 3.1 Pro z maksymalnym budżetem rozumowania — 24 576 tokenów myślenia (6× więcej niż Pro) i 65 536 tokenów odpowiedzi. Najwyższa jakość kosztem czasu.',
    intelligence: 10,
    speed: 4,
    context: 10,
    cost: 8,
    context_window: '1M tokenów',
    supports_reasoning: true,
    sort_order: 90,
  },
};

/**
 * Metadane modeli Chat AI (opis, metryki 1-10, capability flagi) —
 * karmi hover preview przy chipie modelu. Publiczny read, edycja tylko admin.
 */
export function useChatModelMetadata() {
  return useQuery({
    queryKey: ['chat-ai-model-metadata'],
    queryFn: async (): Promise<Record<SpeedMode, ChatModelMetadata>> => {
      const { data, error } = await supabase
        .from('chat_ai_model_metadata' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const map = { ...DEFAULT_CHAT_MODEL_METADATA };
      for (const row of (data ?? []) as any[]) {
        map[row.speed_mode as SpeedMode] = row as ChatModelMetadata;
      }
      return map;
    },
    initialData: DEFAULT_CHAT_MODEL_METADATA,
    /*
      ── DLACZEGO `initialDataUpdatedAt: 0` ─────────────────────────────────
      Bez tego React Query uznaje `initialData` za ŚWIEŻE w chwili montowania
      i przy `staleTime` 5 minut NIE WYSYŁA zapytania do bazy. A że licznik
      startuje od nowa przy każdym wejściu na stronę, zapytanie praktycznie
      nigdy nie leci — front zostaje na stałych z kodu NA ZAWSZE.

      Zmierzone 17.08.2026: baza miała już „Claude Sonnet 5" i „1M tokenów",
      a karta modelu uparcie pokazywała „Claude Sonnet 4.6" i „200K tokenów"
      mimo wielokrotnego odświeżania. Michał: „dalej nic nie ma po odświeżeniu".

      Zero znaczy „te dane są z zamierzchłych czasów" — stałe posłużą jako
      natychmiastowa treść przy pierwszym renderze (bez pustej karty), ale
      zapytanie poleci od razu i podmieni je prawdą z bazy.
    */
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
