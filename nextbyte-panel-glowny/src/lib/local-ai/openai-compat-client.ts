/**
 * Minimal OpenAI-compatible client for local AI servers (LM Studio, Ollama, ...).
 * All calls are made directly from the browser to user's localhost — never via
 * our backend. API keys live only in localStorage on the user's device.
 */

export interface LocalAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
}

export interface LocalAIModelInfo {
  id: string;
  object?: string;
  owned_by?: string;
}

const normalizeBaseUrl = (raw: string): string => {
  if (!raw) return '';
  let url = raw.trim();
  url = url.replace(/\/+$/, '');
  // Auto-add /v1 suffix if user pasted only host:port
  if (!/\/v\d+$/.test(url)) {
    url = `${url}/v1`;
  }
  return url;
};

const authHeaders = (apiKey?: string): Record<string, string> => {
  if (!apiKey) return {};
  return { Authorization: `Bearer ${apiKey}` };
};

export const isSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // Chrome i Edge też mają „Safari" w User-Agent — odróżnia dopiero brak Chrome/Chromium.
  return /Safari/.test(ua) && !/Chrom(e|ium)|Edg|OPR/.test(ua);
};

export const isMixedContentBlocked = (raw: string): boolean => {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') return false;
  try {
    const u = new URL(normalizeBaseUrl(raw));
    if (u.protocol !== 'http:') return false;
    const h = u.hostname.replace(/^\[|\]$/g, '');
    const loopback = h === 'localhost' || h === '::1' || /^127\./.test(h) || h.endsWith('.localhost');
    // Chrome i Firefox robią wyjątek dla pętli zwrotnej („potentially trustworthy").
    // SAFARI TEGO WYJĄTKU NIE MA — blokuje http:// ze strony https:// także dla
    // 127.0.0.1. Bez tego rozróżnienia mówiliśmy użytkownikom Safari, żeby
    // sprawdzali CORS i zaporę, choć żądanie nigdy nie opuszczało przeglądarki.
    if (loopback) return isSafari();
    return true;
  } catch {
    return false;
  }
};

/**
 * Sonda „czy serwer w ogóle żyje" — z pominięciem CORS.
 *
 * Tryb `no-cors` nie pozwala odczytać odpowiedzi (dostajemy odpowiedź nieprzezroczystą),
 * ale samo jej OTRZYMANIE dowodzi, że serwer działa i odpowiedział. To jedyny sposób,
 * żeby z przeglądarki odróżnić „brak nagłówków CORS" od „nic tam nie nasłuchuje".
 */
const czySerwerZyje = async (url: string, timeoutMs = 4000): Promise<boolean> => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(`${url}/models`, { method: 'GET', mode: 'no-cors', signal: ctrl.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
};

/**
 * Stan uprawnienia Chrome „Dostęp do sieci lokalnej" (Local Network Access).
 * `'brak'` = przeglądarka nie zna tego uprawnienia (Firefox, starszy Chrome,
 * Safari) — wtedy nie wyciągamy z tego żadnych wniosków.
 */
const stanZgodyNaSiecLokalna = async (): Promise<PermissionState | 'brak'> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'brak';
  try {
    // Nazwa spoza typów TS (uprawnienie jest nowe), stąd rzutowanie.
    const p = await navigator.permissions.query({ name: 'local-network-access' as unknown as PermissionName });
    return p.state;
  } catch {
    return 'brak';
  }
};

const mixedContentHint = (): string =>
  isSafari()
    ? 'Safari blokuje to połączenie. Strona działa po HTTPS, a lokalny serwer po zwykłym http:// — ' +
      'i w odróżnieniu od Chrome i Firefoksa Safari NIE robi wyjątku dla adresów localhost / 127.0.0.1. ' +
      'Żądanie nie opuszcza przeglądarki, więc ustawienia serwera i CORS nie mają tu nic do rzeczy. ' +
      'Co działa: otwórz NextByte w Chrome lub Firefoksie, użyj aplikacji desktopowej NextByte Asystent ' +
      '(nie dotyczy jej to ograniczenie) albo wystaw swój serwer po HTTPS.'
    : 'Przeglądarka zablokowała połączenie: strona działa po HTTPS, a podany adres to zwykłe http:// ' +
      'spoza pętli zwrotnej. To nie jest problem z Twoim serwerem — żądanie nie zostało nawet wysłane. ' +
      'Użyj http://127.0.0.1:PORT (serwer na tym komputerze) albo wystaw serwer po HTTPS.';

export const testLocalAIConnection = async (
  baseUrl: string,
  apiKey?: string,
  timeoutMs = 6000,
): Promise<{ ok: true; models: LocalAIModelInfo[] } | { ok: false; error: string }> => {
  // Sprawdzamy PRZED wysłaniem — inaczej dostaniemy nieodróżnialne „Failed to fetch"
  // i powiemy użytkownikowi, żeby szukał usterki w działającym serwerze.
  if (isMixedContentBlocked(baseUrl)) return { ok: false, error: mixedContentHint() };

  const url = `${normalizeBaseUrl(baseUrl)}/models`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders(apiKey) },
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          error: `HTTP ${res.status} – serwer wymaga API Key. W LM Studio: Server Settings → wyłącz „Require API Key" lub skopiuj klucz i wklej go w polu „API Key" powyżej.`,
        };
      }
      // SFABRYKOWANE 503 — rozpoznanie po podpisie, nie zgadywanie.
      //
      // Zmierzone 21.08.2026 na produkcji: nasz własny service worker (public/sw.js
      // do v9) przechwytywał żądania do 127.0.0.1 i gdy jego wewnętrzny fetch padał,
      // odpowiadał `new Response('Offline', { status: 503 })`. Prawdziwy serwer HTTP
      // ZAWSZE niesie statusText („Service Unavailable"); odpowiedź zbudowana w kodzie
      // ma go PUSTY. Ten pusty statusText plus aktywny worker to jednoznaczny podpis.
      // Od v10 worker omija adresy lokalne, ale stara wersja może jeszcze siedzieć
      // w karcie do pierwszego przeładowania — wtedy mówimy wprost, co zrobić,
      // zamiast odsyłać człowieka do szukania usterki w działającym serwerze.
      const sfabrykowane =
        res.status === 503 &&
        !res.statusText &&
        typeof navigator !== 'undefined' &&
        Boolean(navigator.serviceWorker?.controller);
      if (sfabrykowane) {
        return {
          ok: false,
          error:
            'To nie Twój serwer — odpowiedź 503 pochodzi z warstwy offline NextByte w tej karcie ' +
            '(stara wersja, która wchodziła między przeglądarkę a localhost). ' +
            'Przeładuj stronę (⌘⇧R / Ctrl+Shift+R), żeby pobrać nową wersję, i przetestuj ponownie.',
        };
      }
      return { ok: false, error: `HTTP ${res.status} – ${res.statusText || 'błąd serwera'}` };
    }
    const data = await res.json();
    const models: LocalAIModelInfo[] = Array.isArray(data?.data)
      ? data.data.map((m: any) => ({ id: String(m.id), object: m.object, owned_by: m.owned_by }))
      : Array.isArray(data?.models)
        ? data.models.map((m: any) => ({ id: String(m.name ?? m.id), owned_by: m.owned_by }))
        : [];
    return { ok: true, models };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { ok: false, error: 'Brak odpowiedzi z serwera (timeout). Upewnij się, że serwer jest uruchomiony.' };
    }
    if (err?.message?.includes('Failed to fetch')) {
      // UPRAWNIENIE „SIEĆ LOKALNA" W CHROME — sprawdzane PRZED sondą no-cors,
      // bo sonda też mu podlega i przy odmowie kłamałaby „serwer nie żyje".
      //
      // Zmierzone 21.08.2026 (Chromium 148): strona https:// → http://127.0.0.1
      // wymaga zgody `local-network-access`. Chrome pyta o nią monitem przy
      // pierwszym żądaniu ZE STRONY; raz odrzucona zostaje zapisana dla witryny
      // i od tej pory każdy fetch pada z „Failed to fetch" bez żadnego znaku,
      // dlaczego. Stan da się odczytać przez Permissions API — i tylko to
      // pozwala powiedzieć człowiekowi, że problem jest w kłódce, nie w serwerze.
      const zgodaNaSiecLokalna = await stanZgodyNaSiecLokalna();
      if (zgodaNaSiecLokalna === 'denied') {
        return {
          ok: false,
          error:
            'Chrome zablokował tej stronie dostęp do sieci lokalnej (uprawnienie „Dostęp do sieci lokalnej" jest odrzucone). ' +
            'Serwer może działać poprawnie — żądanie nie wychodzi z przeglądarki. ' +
            'Kliknij kłódkę obok adresu → Ustawienia witryny → „Dostęp do sieci lokalnej" → Zezwól, ' +
            'a potem przetestuj ponownie.',
        };
      }
      // „Failed to fetch" jest nieodróżnialne dla trzech zupełnie różnych przyczyn:
      // serwer nie działa / CORS zablokował / przeglądarka ucięła żądanie do sieci
      // prywatnej. Wysyłanie wtedy „sprawdź czy serwer nasłuchuje" kosztowało ludzi
      // godziny szukania usterki w serwerze, który działał.
      //
      // Rozróżniamy sondą no-cors: ona ignoruje nagłówki CORS. Jeśli PRZEJDZIE,
      // serwer żyje i odpowiada — winne są nagłówki, nie serwer.
      const zywy = await czySerwerZyje(normalizeBaseUrl(baseUrl));
      return {
        ok: false,
        error: zywy
          ? `Serwer odpowiada, ale przeglądarka odrzuciła odpowiedź — brakuje zgody CORS. ` +
            `W ustawieniach serwera dopuść origin: ${typeof window !== 'undefined' ? window.location.origin : 'adres tej strony'} ` +
            `(w LM Studio: Developer → Settings → Enable CORS; w Ollamie: zmienna OLLAMA_ORIGINS). ` +
            `Uwaga: adres musi zgadzać się co do znaku — wersja z „www" to inny origin.`
          : 'Nie udało się nawiązać połączenia. Sprawdź, czy serwer działa i czy adres oraz port są poprawne. ' +
            'Jeśli serwer na pewno działa, przyczyną może być zapora albo blokada żądań do sieci lokalnej w przeglądarce.',
      };
    }
    return { ok: false, error: err?.message || 'Nieznany błąd połączenia' };
  } finally {
    clearTimeout(timer);
  }
};

export interface StreamLocalAIChatOptions {
  baseUrl: string;
  apiKey?: string;
  model: string;
  messages: LocalAIChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  onToken: (deltaText: string) => void;
  /** Separate channel for reasoning/thinking deltas (DeepSeek-R1, QwQ, GPT-OSS, ...). */
  onReasoning?: (deltaText: string) => void;
}

export interface StreamLocalAIChatResult {
  text: string;
  reasoning?: string;
  finishReason?: string;
}

/**
 * Stream a chat completion from a local OpenAI-compatible server.
 * Parses SSE `data: {...}` lines and aggregates `choices[0].delta.content`.
 */
export const streamLocalAIChat = async (
  opts: StreamLocalAIChatOptions,
): Promise<StreamLocalAIChatResult> => {
  // Ta sama bariera co przy teście połączenia — bo użytkownik może zapisać adres
  // bez testowania i wtedy dostałby przy wysyłce nieczytelne „Failed to fetch".
  if (isMixedContentBlocked(opts.baseUrl)) throw new Error(mixedContentHint());

  const url = `${normalizeBaseUrl(opts.baseUrl)}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...authHeaders(opts.apiKey),
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Lokalny serwer zwrócił błąd ${res.status}. ${errText.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';
  let fullReasoning = '';
  let finishReason: string | undefined;

  // Reasoning models (DeepSeek-R1, QwQ, GPT-OSS, Qwen3-Thinking, ...) zwracają
  // myślenie w jednym z pól delta: reasoning_content / reasoning / thinking.
  // Streamujemy je osobnym kanałem (onReasoning) — UI renderuje je w zwijanym
  // bloku "Myślenie" tak samo jak modele API.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const choice = json?.choices?.[0];
        const delta = choice?.delta ?? {};
        const reasoningDelta: string =
          delta?.reasoning_content ?? delta?.reasoning ?? delta?.thinking ?? '';
        const contentDelta: string =
          delta?.content ?? choice?.message?.content ?? '';

        if (reasoningDelta) {
          fullReasoning += reasoningDelta;
          opts.onReasoning?.(reasoningDelta);
        }
        if (contentDelta) {
          fullText += contentDelta;
          opts.onToken(contentDelta);
        }
        if (choice?.finish_reason) finishReason = choice.finish_reason;
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return { text: fullText, reasoning: fullReasoning || undefined, finishReason };
};
