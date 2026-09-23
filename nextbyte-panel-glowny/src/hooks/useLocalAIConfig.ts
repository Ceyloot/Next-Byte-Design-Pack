import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { LOCAL_AI_PRESETS, type LocalAIPresetId, getPreset } from '@/lib/local-ai/presets';
import {
  testLocalAIConnection,
  type LocalAIModelInfo,
} from '@/lib/local-ai/openai-compat-client';

const STORAGE_KEY = 'nextbyte_local_ai_config_v1';

export type LocalAIPrivacyMode = 'sync' | 'private';

export interface LocalAIConfig {
  enabled: boolean;
  preset: LocalAIPresetId;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  privacyMode: LocalAIPrivacyMode;
  lastTestOk: boolean;
  lastTestAt: number | null;
  availableModels: string[];
  /** Ile ostatnich wiadomości wysyłać do modelu jako kontekst. 0 = bez limitu (cała historia). */
  historyLimit: number;
  /**
   * Czy klucz API ma iść na konto razem z resztą ustawień.
   * Rozdzielone od reszty świadomie: adres i model to preferencje, klucz to sekret.
   * Wyłączenie tej zgody KASUJE klucz z bazy, nie tylko przestaje go wysyłać.
   */
  syncApiKey: boolean;
}

const DEFAULT_CONFIG: LocalAIConfig = {
  enabled: false,
  preset: 'lmstudio',
  baseUrl: getPreset('lmstudio').defaultBaseUrl,
  apiKey: '',
  defaultModel: '',
  privacyMode: 'sync',
  lastTestOk: false,
  lastTestAt: null,
  availableModels: [],
  historyLimit: 0,
  syncApiKey: true,
};

/* ---------- synchronizacja z kontem ----------
 * localStorage zostaje jako pamięć podręczna: dzięki niej ustawienia są od razu
 * po otwarciu strony, bez mignięcia „nieskonfigurowane" w oczekiwaniu na bazę.
 * Baza jest źródłem prawdy przy wejściu na nowym urządzeniu. */
type RowLocalAI = {
  preset: string; base_url: string; default_model: string; privacy_mode: string;
  history_limit: number; enabled: boolean; sync_api_key: boolean; api_key: string | null;
};

const rowToConfig = (r: RowLocalAI, poprzedni: LocalAIConfig): LocalAIConfig => ({
  ...poprzedni,
  preset: (r.preset as LocalAIPresetId) || poprzedni.preset,
  baseUrl: r.base_url ?? poprzedni.baseUrl,
  defaultModel: r.default_model ?? poprzedni.defaultModel,
  privacyMode: (r.privacy_mode as LocalAIPrivacyMode) || poprzedni.privacyMode,
  historyLimit: typeof r.history_limit === 'number' ? r.history_limit : poprzedni.historyLimit,
  enabled: !!r.enabled,
  syncApiKey: !!r.sync_api_key,
  // Gdy zgody nie ma, baza nie przechowuje klucza — zostaje ten z tego urządzenia.
  apiKey: r.sync_api_key ? (r.api_key ?? '') : poprzedni.apiKey,
});

const readStored = (): LocalAIConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

const writeStored = (cfg: LocalAIConfig) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent('nextbyte:local-ai-config-changed'));
  } catch (err) {
    console.warn('[LocalAI] Failed to persist config', err);
  }
};

export const getLocalAIConfig = (): LocalAIConfig => readStored();

/**
 * React hook for local AI server configuration.
 * - Bez bramki planu: lokalny AI jest darmowy dla wszystkich (patrz `hasAccess` niżej).
 * - Ustawienia trzymane NA KONCIE (tabela user_local_ai_config, RLS = tylko właściciel),
 *   a localStorage służy jako pamięć podręczna urządzenia.
 * - Klucz API idzie na konto tylko przy zgodzie (syncApiKey).
 */
export const useLocalAIConfig = () => {
  const [config, setConfig] = useState<LocalAIConfig>(readStored);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const { subscriptionStatus } = useSubscriptionContext();
  const { user } = useAuthContext();
  const tier = subscriptionStatus?.subscription_tier ?? null;
  /**
   * Lokalny AI jest DARMOWY dla wszystkich (decyzja 29.07.2026).
   *
   * Model chodzi na sprzęcie i prądzie użytkownika, więc zapytanie nie kosztuje nas nic
   * (`local: 0` w byteCost.ts) — nie ma marży do obrony. Wymóg 16–48 GB RAM sam ogranicza
   * grupę do osób technicznych, czyli tych, które później płacą za modele w chmurze.
   * Bramka blokowała najlepszy hak akwizycyjny, nie chroniąc żadnego przychodu.
   *
   * Płatne zostają: modele w chmurze, Studio Video, One Man Army, limity kontekstu, pliki.
   *
   * Pole zostaje w API hooka (zamiast kasować je u konsumentów), żeby ewentualny powrót
   * do bramki był zmianą jednej linii.
   */
  const hasAccess = true;

  const zapisT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wczytano = useRef(false);

  useEffect(() => {
    const handler = () => setConfig(readStored());
    window.addEventListener('nextbyte:local-ai-config-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('nextbyte:local-ai-config-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Wczytanie z konta — raz po zalogowaniu. Brak wiersza = użytkownik jeszcze
  // niczego nie zapisał; zostawiamy wtedy to, co jest na urządzeniu.
  useEffect(() => {
    if (!user?.id || wczytano.current) return;
    wczytano.current = true;
    let anulowane = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_local_ai_config')
        .select('preset, base_url, default_model, privacy_mode, history_limit, enabled, sync_api_key, api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      if (anulowane || error || !data) {
        if (error) console.warn('[LocalAI] Nie udało się wczytać konfiguracji z konta', error.message);
        return;
      }
      setConfig((prev) => {
        const next = rowToConfig(data as RowLocalAI, prev);
        writeStored(next);
        return next;
      });
    })();
    return () => { anulowane = true; };
  }, [user?.id]);

  /** Zapis na konto — z opóźnieniem, żeby pisanie w polu nie generowało zapytania na znak. */
  const zapiszNaKoncie = useCallback((cfg: LocalAIConfig) => {
    if (!user?.id) return;
    if (zapisT.current) clearTimeout(zapisT.current);
    zapisT.current = setTimeout(async () => {
      const { error } = await supabase.from('user_local_ai_config').upsert({
        user_id: user.id,
        preset: cfg.preset,
        base_url: cfg.baseUrl,
        default_model: cfg.defaultModel,
        privacy_mode: cfg.privacyMode,
        history_limit: cfg.historyLimit,
        enabled: cfg.enabled,
        sync_api_key: cfg.syncApiKey,
        // Bez zgody wysyłamy null — to KASUJE ewentualny wcześniejszy klucz,
        // zamiast zostawiać go w bazie po cichu.
        api_key: cfg.syncApiKey ? (cfg.apiKey || null) : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) console.warn('[LocalAI] Nie udało się zapisać konfiguracji na koncie', error.message);
    }, 600);
  }, [user?.id]);

  const update = useCallback((patch: Partial<LocalAIConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      writeStored(next);
      zapiszNaKoncie(next);
      return next;
    });
  }, [zapiszNaKoncie]);

  const setPreset = useCallback(
    (presetId: LocalAIPresetId) => {
      const preset = getPreset(presetId);
      update({
        preset: presetId,
        baseUrl: preset.defaultBaseUrl || config.baseUrl,
        lastTestOk: false,
        lastTestAt: null,
        availableModels: [],
      });
    },
    [config.baseUrl, update],
  );

  const testConnection = useCallback(async (): Promise<{ ok: boolean; models: LocalAIModelInfo[]; error?: string }> => {
    setIsTesting(true);
    setTestError(null);
    const res = await testLocalAIConnection(config.baseUrl, config.apiKey || undefined);
    setIsTesting(false);
    if (res.ok) {
      const modelIds = res.models.map((m) => m.id);
      update({
        lastTestOk: true,
        lastTestAt: Date.now(),
        availableModels: modelIds,
        defaultModel: config.defaultModel && modelIds.includes(config.defaultModel)
          ? config.defaultModel
          : modelIds[0] ?? '',
        enabled: true,
      });
      return { ok: true, models: res.models };
    }
    update({ lastTestOk: false, lastTestAt: Date.now() });
    const errMsg = 'error' in res ? res.error : 'Nieznany błąd';
    setTestError(errMsg);
    return { ok: false, models: [], error: errMsg };
  }, [config.baseUrl, config.apiKey, config.defaultModel, update]);

  const reset = useCallback(() => {
    writeStored(DEFAULT_CONFIG);
    setConfig(DEFAULT_CONFIG);
    // Reset musi czyścić też konto — inaczej po przeładowaniu wróciłaby stara
    // konfiguracja (razem z kluczem), a użytkownik był przekonany, że ją usunął.
    if (user?.id) {
      if (zapisT.current) clearTimeout(zapisT.current);
      supabase.from('user_local_ai_config').delete().eq('user_id', user.id)
        .then(({ error }) => { if (error) console.warn('[LocalAI] Nie udało się wyczyścić konfiguracji na koncie', error.message); });
    }
  }, [user?.id]);

  return {
    config,
    update,
    setPreset,
    testConnection,
    isTesting,
    testError,
    reset,
    hasAccess,
    tier,
    presets: LOCAL_AI_PRESETS,
  };
};
