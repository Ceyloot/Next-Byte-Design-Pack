/**
 * Silnik Auto-Canvas: zamienia surowe transkrypcje w mapę wiedzy.
 *
 * Pipeline: chunking → embeddingi → klastrowanie tematyczne → LLM generuje
 * węzły (tytuł/opis/typ) i krawędzie (relacje) dla każdego klastra.
 *
 * Działa w przeglądarce, na kluczu Gemini użytkownika — tak jak reszta appki.
 */

import { extractLocator } from './tableFormat';
import { sanitizeAnswerFormatting, normalizeModelName } from './geminiApi';
import { trackUsage } from './usageTracker';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Kolejność preferencji modeli embeddingowych. Google wycofuje starsze modele
// (text-embedding-004 zniknęło z v1beta), więc nie ufamy jednej nazwie na sztywno —
// pytamy API o listę i bierzemy pierwszy dostępny z tej listy.
const EMBED_CANDIDATES = ['gemini-embedding-001', 'text-embedding-004', 'embedding-001'];
const EMBED_DIMS = 768;

const CHUNK_CHARS = 2000;
const EMBED_BATCH = 100;
// Próg liczony na embeddingach PO wycentrowaniu (patrz clusterEmbeddings) — nie da się
// go porównywać z progami dla surowych wektorów, tam wszystko jest sztucznie podobne.
const CLUSTER_THRESHOLD = 0.5;
const MAX_CLUSTERS = 24;

let resolvedEmbedModel = null;

async function resolveEmbedModel(apiKey) {
  if (resolvedEmbedModel) return resolvedEmbedModel;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Nie udało się pobrać listy modeli (HTTP ${res.status})`);
  }
  const data = await res.json();
  // ListModels wypisuje dla modeli embeddingowych metodę "embedContent" i NIE wymienia
  // "batchEmbedContents", choć ten endpoint działa — dlatego filtrujemy po embedContent.
  const usable = new Set(
    (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).some(x => x === 'embedContent' || x === 'batchEmbedContents'))
      .map(m => m.name.replace(/^models\//, ''))
  );

  const picked = EMBED_CANDIDATES.find(c => usable.has(c)) || [...usable][0];
  if (!picked) {
    const names = (data.models || []).map(m => m.name).join(', ') || 'brak';
    throw new Error(`Twój klucz API nie ma dostępu do żadnego modelu embeddingowego. Dostępne modele: ${names}`);
  }
  resolvedEmbedModel = picked;
  return picked;
}

/**
 * Tnie źródło na fragmenty ~CHUNK_CHARS znaków.
 * Gdy źródło ma transkrypcję, granice chunków respektują segmenty i zachowują
 * znacznik czasu startu — dzięki temu węzeł da się odtworzyć od właściwego miejsca.
 */
export function chunkSource(source, targetChars = CHUNK_CHARS) {
  const base = { sourceId: source.id, sourceTitle: source.title, videoId: source.videoId };
  const chunks = [];
  const segments = Array.isArray(source.transcript) ? source.transcript.filter(s => s.text?.trim()) : [];

  if (segments.length > 0) {
    let buf = [];
    let bufLen = 0;
    let start = segments[0].start;

    for (const seg of segments) {
      if (bufLen > 0 && bufLen + seg.text.length > targetChars) {
        chunks.push({ ...base, text: buf.join(' '), start });
        buf = [];
        bufLen = 0;
        start = seg.start;
      }
      buf.push(seg.text);
      bufLen += seg.text.length + 1;
    }
    if (bufLen > 0) chunks.push({ ...base, text: buf.join(' '), start });
    return chunks;
  }

  const text = (source.rawText || '').trim();
  for (let i = 0; i < text.length; i += targetChars) {
    const chunkText = text.slice(i, i + targetChars);
    // Dla tabel (CSV/XLSX/HTML) i PDF-ów rawText niesie znaczniki "Wiersz N:"/"[Strona N]" —
    // wyłuskujemy je, żeby podgląd źródła mógł podjechać dokładnie tam, skąd wzięto informację.
    chunks.push({ ...base, text: chunkText, start: null, locator: extractLocator(chunkText) });
  }
  return chunks;
}

// --- Cache embeddingów per źródło (IndexedDB) ---
// Embeddingi są najdroższym i najwolniejszym etapem, a treść źródła się nie zmienia.
// Dzięki cache'owi dodanie nowego źródła przelicza tylko to jedno źródło,
// a nie całą bibliotekę od zera. localStorage odpada: wektory są za duże.

const IDB_NAME = 'notebook_canvas_cache';
const IDB_STORE = 'source_embeddings';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  try {
    const db = await idbOpen();
    return await new Promise((resolve) => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

async function idbPut(key, value) {
  try {
    const db = await idbOpen();
    await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch {
    // Cache to optymalizacja — jego awaria nie może zablokować budowy mapy.
  }
}

function hashText(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

async function embedTexts(apiKey, model, texts, onProgress) {
  const out = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH);
    const res = await fetch(`${GEMINI_BASE}/${model}:batchEmbedContents?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: batch.map(text => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          // CLUSTERING optymalizuje wektory dokładnie pod to, do czego ich używamy.
          taskType: 'CLUSTERING',
          outputDimensionality: EMBED_DIMS,
        })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Błąd embeddingów (HTTP ${res.status})`);
    }
    const data = await res.json();
    out.push(...(data.embeddings || []).map(e => e.values));
    // estimate ~1 token per 4 chars for embedding usage tracking
    const estTokens = batch.reduce((s, t) => s + Math.ceil(t.length / 4), 0);
    trackUsage(model, 'embedding', estTokens, 0);
    onProgress?.(Math.min(i + EMBED_BATCH, texts.length), texts.length);
  }
  return out;
}

/**
 * Mapuje poziom granulacji (wybierany w UI) na parametry klastrowania.
 *
 * Klucz problemu jednorodnych źródeł: przy jednym filmie wszystkie fragmenty są do siebie
 * podobne, więc bez wystarczająco wysokiej dolnej granicy mapa zlewa się do 3-4 węzłów.
 * Dolną granicę wiążemy więc z LICZBĄ FRAGMENTÓW (n/dzielnik), a nie tylko ze √n —
 * dłuższy materiał = więcej tematów, nawet gdy tematycznie jest spójny.
 *
 * - fine  (drobno): dużo tematów, próg wysoki (scalanie zatrzymuje się wcześnie)
 * - medium (średnio): wartości domyślne, sprawdzone w praktyce
 * - coarse (grubo): mało, szerokich tematów
 */
export function granularityParams(n, granularity = 'medium') {
  const root = Math.ceil(Math.sqrt(n));
  if (granularity === 'fine') {
    return { threshold: 0.62, minClusters: Math.min(n, Math.max(6, Math.ceil(n / 6))), maxClusters: Math.min(n, 40) };
  }
  if (granularity === 'coarse') {
    return { threshold: 0.4, minClusters: Math.max(3, Math.ceil(root / 2)), maxClusters: 12 };
  }
  // medium — dolna granica podbita względem czystego √n, żeby jeden film nie zwinął mapy
  return { threshold: CLUSTER_THRESHOLD, minClusters: Math.min(n, Math.max(5, Math.ceil(n / 10))), maxClusters: MAX_CLUSTERS };
}

/**
 * Klastrowanie aglomeracyjne (average linkage) po podobieństwie kosinusowym.
 *
 * Liczba tematów mieści się między dolną granicą (minClusters — chroni mapę przed zwinięciem
 * do jednego węzła, szczególnie przy jednorodnych źródłach) a maxClusters (żeby pozostała
 * czytelna); w tym zakresie decyduje próg podobieństwa. Parametry pochodzą z granularityParams.
 */
export function clusterEmbeddings(embeddings, { threshold = CLUSTER_THRESHOLD, maxClusters = MAX_CLUSTERS, minClusters: minOverride = null } = {}) {
  const n = embeddings.length;
  if (n === 0) return [];
  if (n <= 2) return embeddings.map((_, i) => [i]);

  // Centrowanie. Gdy wszystkie fragmenty są z jednej dziedziny (np. same setupy w LMU),
  // ich embeddingi mają dużą wspólną składową "o czym jest cały zbiór" — przez nią każda
  // para jest podobna do każdej i klastrowanie zlewa całość w jeden węzeł. Odjęcie średniego
  // wektora usuwa tę składową i zostawia to, czym fragmenty faktycznie się różnią.
  const dim = embeddings[0].length;
  const mean = new Array(dim).fill(0);
  for (const v of embeddings) for (let i = 0; i < dim; i++) mean[i] += v[i] / n;
  const centered = embeddings.map(v => v.map((x, i) => x - mean[i]));

  const normed = centered.map(v => {
    let sum = 0;
    for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
    const mag = Math.sqrt(sum) || 1;
    return v.map(x => x / mag);
  });

  // Dolna granica liczby tematów — twarda ochrona przed zwinięciem mapy do jednego węzła.
  // Gdy granularityParams poda minOverride, respektujemy go (ale nigdy powyżej n ani maxClusters).
  const baseFloor = Math.max(3, Math.min(maxClusters, Math.ceil(Math.sqrt(n))));
  const minClusters = Math.min(n, maxClusters, minOverride != null ? Math.max(baseFloor, minOverride) : baseFloor);

  const dot = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  };

  const sim = [];
  for (let i = 0; i < n; i++) {
    sim[i] = [];
    for (let j = 0; j < n; j++) sim[i][j] = i === j ? -Infinity : dot(normed[i], normed[j]);
  }

  const members = normed.map((_, i) => [i]);
  const active = new Set(members.map((_, i) => i));

  while (active.size > minClusters) {
    let best = -Infinity;
    let bi = -1;
    let bj = -1;
    for (const i of active) {
      for (const j of active) {
        if (j <= i) continue;
        if (sim[i][j] > best) {
          best = sim[i][j];
          bi = i;
          bj = j;
        }
      }
    }
    if (bi < 0) break;
    // Poniżej progu przestajemy scalać — chyba że klastrów wciąż jest za dużo,
    // wtedy dociskamy do maxClusters, żeby canvas pozostał czytelny.
    if (best < threshold && active.size <= maxClusters) break;

    const ni = members[bi].length;
    const nj = members[bj].length;
    for (const k of active) {
      if (k === bi || k === bj) continue;
      const merged = (sim[bi][k] * ni + sim[bj][k] * nj) / (ni + nj);
      sim[bi][k] = merged;
      sim[k][bi] = merged;
    }
    members[bi] = members[bi].concat(members[bj]);
    active.delete(bj);
  }

  return [...active].map(i => members[i]);
}

function stripFences(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function robustParseDetails(text) {
  let cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("Standard JSON parse failed for cluster details, attempting sanitization", err);
    try {
      let sanitized = cleaned.replace(/"detail"\s*:\s*"([\s\S]*?)"\s*}/, (match, p1) => {
        const escaped = p1.replace(/\r?\n/g, '\\n').replace(/"/g, '\\"');
        return `"detail": "${escaped}"}`;
      });
      return JSON.parse(sanitized);
    } catch (err2) {
      console.error("Sanitized JSON parse also failed", err2);
      const keyPoints = [];
      const kpMatch = cleaned.match(/"keyPoints"\s*:\s*\[([\s\S]*?)\]/);
      if (kpMatch && kpMatch[1]) {
        const lines = kpMatch[1].split(',');
        for (let line of lines) {
          line = line.trim().replace(/^["']|["']$/g, '').trim();
          if (line && line !== '...') keyPoints.push(line);
        }
      }
      let detail = 'Nie udało się poprawnie sparsować odpowiedzi od AI.';
      const dMatch = cleaned.match(/"detail"\s*:\s*"([\s\S]*?)"\s*$/) || cleaned.match(/"detail"\s*:\s*"([\s\S]*?)"\s*,/);
      if (dMatch && dMatch[1]) {
        detail = dMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      return { keyPoints, detail };
    }
  }
}

async function extractClusterDetails(apiKey, model, clusterIdx, idxs, chunks) {
  const excerpts = idxs.slice(0, 8).map(ix => chunks[ix].text.slice(0, 900));
  const titles = [...new Set(idxs.map(ix => chunks[ix].sourceTitle))];
  const digest = `Źródła: ${titles.join('; ')}\nFragmenty:\n${excerpts.join('\n...\n')}`;

  const systemInstruction = `Jesteś ekspertem, który wyciąga z transkrypcji i tekstów KONKRETNĄ, GOTOWĄ DO UŻYCIA WIEDZĘ.
Przeanalizuj poniższe fragmenty tekstu dla danego tematu i wygeneruj jego szczegółowe opracowanie.
Zwróć wyłącznie poprawny obiekt JSON o strukturze:
{
  "keyPoints": [
    "Konkretna zasada, wartość liczbowa albo krok (max 20 słów)",
    "..."
  ],
  "detail": "Rozwinięcie w formacie Markdown: praktyczna instrukcja, kolejne kroki, wartości, kiedy i dlaczego stosować, na co uważać. Zachowaj wszystkie liczby, nazwy ustawień i kolejność czynności."
}
Zasady:
- Pisz po polsku.
- keyPoints: 3-6 punktów. Każdy punkt to samodzielna, konkretna informacja (nie pisz ogólników).
- detail: Pełne opracowanie. Nie streszczaj do ogólników.
- KRYTYCZNE DLA JSON: Wartość pola "detail" musi być poprawnym stringiem JSON. Wszystkie wewnętrzne cudzysłowy w tekście Markdown muszą być zastąpione pojedynczymi apostrofami (') lub ucieczkowe jako \\\". Wszystkie nowe linie muszą być zapisane jako \\n. Nie dodawaj żadnych niedozwolonych znaków kontrolnych.`;

  try {
    const cleanKey = (apiKey || '').trim();
    const effectiveModel = normalizeModelName(model);
    const res = await fetch(`${GEMINI_BASE}/${effectiveModel}:generateContent?key=${cleanKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Oto fragmenty tekstu dla tematu:\n\n${digest}` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { keyPoints: [], detail: 'Brak szczegółów.' };
    
    const parsed = robustParseDetails(text);
    return {
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      detail: parsed.detail ? sanitizeAnswerFormatting(parsed.detail) : 'Brak szczegółów.'
    };
  } catch (err) {
    console.warn(`Błąd pobierania szczegółów dla klastra ${clusterIdx}:`, err);
    return { keyPoints: [], detail: `Nie udało się załadować szczegółów: ${err.message}` };
  }
}

async function describeClustersMetadata(apiKey, model, clusters, chunks, distributionPrompt) {
  const digest = clusters
    .map((idxs, i) => {
      const excerpts = idxs.slice(0, 3).map(ix => chunks[ix].text.slice(0, 300));
      const titles = [...new Set(idxs.map(ix => chunks[ix].sourceTitle))];
      return `--- TEMAT ${i} ---\nŹródła: ${titles.join('; ')}\nFragmenty:\n${excerpts.join('\n...\n')}`;
    })
    .join('\n\n');

  const systemInstruction = `Jesteś wybitnym ekspertem ds. wizualizacji wiedzy, architektury informacji i tworzenia map pojęciowych.
Dostajesz listę tematów automatycznie wyodrębnionych z materiałów źródłowych użytkownika.
Twoim zadaniem jest zorganizować te tematy w spójną, czytelną i logiczną mapę wiedzy.

Kluczowe cele projektowe mapy:
1. SPÓJNOŚĆ I LOGIKA: Pogrupuj tematy w 3-5 głównych sekcji (kategorii) i ułóż sekcje chronologicznie lub procesowo (od podstaw, przez konfigurację, po zaawansowane tematy).
   Wytyczne podziału od użytkownika: ${distributionPrompt ? `"${distributionPrompt}"` : 'Samodzielnie stwórz intuicyjny, logiczny podział dopasowany do treści (np. "Baza i Konfiguracja", "Optymalizacja", "Zaawansowane Techniki").'}.
2. ZROZUMIAŁOŚĆ KART: Każdy węzeł musi mieć konkretny, unikalny tytuł ("title"), który jednoznacznie opisuje jego treść lub działanie (max 7 słów). Unikaj ogólników. Patrząc na sam tytuł karty, użytkownik musi natychmiast wiedzieć, o co w niej chodzi.
3. PORZĄDEK POŁĄCZEŃ (CZYTELNOŚĆ LINII):
   - Twórz połączenia ("edges") TYLKO tam, gdzie istnieje wyraźny związek przyczynowo-skutkowy lub logiczna zależność (np. "skrzydło tylne" wpływa na "balans aerodynamiki").
   - Unikaj tworzenia losowych połączeń przechodzących przez całą mapę (z początku do końca). Jeśli dany temat jest luźną uwagą lub nie zależy bezpośrednio od innych, pozostaw go bez połączeń (jako samodzielny węzeł w sekcji).
   - Relacje powinny płynąć w logicznym kierunku (od zagadnień wcześniejszych do późniejszych).

Zwróć WYŁĄCZNIE czysty, poprawny syntaktycznie obiekt JSON o strukturze:
{
  "sections": [
    {
      "id": "s0",
      "name": "Krótka, konkretna nazwa sekcji (max 3 słowa)"
    }
  ],
  "nodes": [
    {
      "clusterIndex": 0,
      "sectionId": "s0",
      "title": "Konkretny tytuł mówiący CO robić/jakie pojęcie opisuje (max 7 słów)",
      "nodeType": "concept"
    }
  ],
  "edges": [
    { "source": 0, "target": 1, "relation": "wpływa" }
  ]
}

Zasady:
- Każda zdefiniowana sekcja w "sections" musi mieć unikalne id (np. "s0", "s1").
- Każdy węzeł w "nodes" musi mieć przypisany "sectionId" pasujący do jednego z id z tablicy "sections".
- Każdy temat musi dostać dokładnie jeden węzeł (clusterIndex = numer tematu).
- Krawędzie: source/target to LICZBY (numery klastrów/tematów), nie napisy.
- Pisz po polsku.`;

  const cleanKey = (apiKey || '').trim();
  const effectiveModel = normalizeModelName(model);
  const res = await fetch(`${GEMINI_BASE}/${effectiveModel}:generateContent?key=${cleanKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `Oto tematy:\n\n${digest}\n\nStwórz strukturę sekcji, węzłów i relacji.` }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Błąd generowania struktury grafu (HTTP ${res.status})`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Model nie zwrócił treści dla mapy wiedzy.');

  const parsed = JSON.parse(stripFences(text));
  return {
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
  };
}

/**
 * Zbiera źródła stojące za klastrem: po jednym wpisie na źródło,
 * ze wskazaniem najwcześniejszego znacznika czasu (punkt wejścia w film).
 */
function clusterSources(idxs, chunks) {
  const perSource = new Map();
  for (const ix of idxs) {
    const c = chunks[ix];
    const existing = perSource.get(c.sourceId);
    if (!existing) {
      perSource.set(c.sourceId, { sourceId: c.sourceId, title: c.sourceTitle, videoId: c.videoId, start: c.start, locator: c.locator || null });
    } else {
      if (c.start != null && (existing.start == null || c.start < existing.start)) existing.start = c.start;
      if (!existing.locator && c.locator) existing.locator = c.locator;
    }
  }
  return [...perSource.values()];
}

/**
 * Buduje pełną mapę wiedzy ze źródeł. onProgress dostaje krótki opis etapu.
 */
export async function buildKnowledgeGraph({ apiKey, model, sources, distributionPrompt, granularity = 'medium', onProgress }) {
  const usable = sources.filter(s => (s.rawText || '').trim().length > 200);
  if (usable.length === 0) {
    throw new Error('Brak źródeł z treścią wystarczającą do zbudowania mapy.');
  }

  onProgress?.('Dzielę materiały na fragmenty...');
  const embedModel = await resolveEmbedModel(apiKey);

  // Embeddingi liczone per źródło, z cache — nowe źródło nie przelicza starych.
  const chunks = [];
  const embeddings = [];
  for (let si = 0; si < usable.length; si++) {
    const s = usable[si];
    const sChunks = chunkSource(s);
    if (sChunks.length === 0) continue;

    const cacheKey = `${s.id}::${embedModel}::${CHUNK_CHARS}`;
    const textHash = hashText(sChunks.map(c => c.text).join(' '));
    const cached = await idbGet(cacheKey);

    let sEmb;
    if (cached && cached.hash === textHash && Array.isArray(cached.embeddings) && cached.embeddings.length === sChunks.length) {
      sEmb = cached.embeddings;
      onProgress?.(`Embeddingi z cache: źródło ${si + 1}/${usable.length}`);
    } else {
      sEmb = await embedTexts(apiKey, embedModel, sChunks.map(c => c.text), (done, total) =>
        onProgress?.(`Liczę embeddingi (źródło ${si + 1}/${usable.length})... ${done}/${total}`)
      );
      await idbPut(cacheKey, { hash: textHash, embeddings: sEmb });
    }
    chunks.push(...sChunks);
    embeddings.push(...sEmb);
  }
  if (chunks.length === 0) throw new Error('Nie udało się podzielić źródeł na fragmenty.');

  onProgress?.('Grupuję fragmenty w tematy...');
  const clusters = clusterEmbeddings(embeddings, granularityParams(embeddings.length, granularity));

  onProgress?.(`Wyciągam strukturę sekcji i tematów...`);
  const { sections: rawSections, nodes: described, edges: rawEdges } = await describeClustersMetadata(apiKey, model, clusters, chunks, distributionPrompt);

  onProgress?.(`Wyciągam szczegóły tematów (0/${clusters.length})...`);
  let completed = 0;
  const detailJobs = clusters.map(async (idxs, i) => {
    const details = await extractClusterDetails(apiKey, model, i, idxs, chunks);
    completed++;
    onProgress?.(`Wyciągam szczegóły tematów (${completed}/${clusters.length})...`);
    return { clusterIndex: i, ...details };
  });
  const allDetails = await Promise.all(detailJobs);
  const detailsMap = new Map(allDetails.map(d => [d.clusterIndex, d]));

  const sections = rawSections.length > 0 ? rawSections : [{ id: 's_other', name: 'Ogólne' }];
  const validSectionIds = new Set(sections.map(s => s.id));

  // Filtr szumu: extractClusterDetails sam sygnalizuje pusty klaster (brak keyPoints
  // i "Brak szczegółów.") gdy fragmenty nie niosą żadnej realnej wiedzy — np. wstęp/outro
  // filmu ("dziękuję za oglądanie, subskrybuj"). Bez tego takie klastry i tak dostawały
  // pełnoprawny, pusty węzeł na mapie. Odróżniamy to od BŁĘDU pobierania szczegółów
  // (inny, dłuższy komunikat z treścią wyjątku) — błąd nie jest szumem i węzeł zostaje,
  // żeby awaria sieci nie kasowała po cichu realnej treści.
  const isNoiseCluster = (i) => {
    const d = detailsMap.get(i);
    return !!d && d.keyPoints.length === 0 && d.detail.trim() === 'Brak szczegółów.';
  };
  const keptIndices = clusters.map((_, i) => i).filter(i => !isNoiseCluster(i));
  // Nigdy nie czyść całej mapy do zera — lepsza mapa z szumem niż pusta mapa.
  const finalIndices = keptIndices.length > 0 ? keptIndices : clusters.map((_, i) => i);

  const byCluster = new Map(described.map(n => [n.clusterIndex, n]));
  const nodes = finalIndices.map(i => {
    const idxs = clusters[i];
    const info = byCluster.get(i) || {};
    const details = detailsMap.get(i) || { keyPoints: [], detail: '' };
    return {
      id: `n${i}`,
      title: info.title || `Temat ${i + 1}`,
      keyPoints: details.keyPoints,
      detail: details.detail,
      nodeType: info.nodeType || 'concept',
      chunkCount: idxs.length,
      sources: clusterSources(idxs, chunks),
      parentId: validSectionIds.has(info.sectionId) ? info.sectionId : sections[0].id,
    };
  });

  // Indeksy trzeba rzutować na liczby: model bywa, że zwraca je jako napisy ("0"),
  // a wtedy porównanie ze zbiorem liczb cicho kasowało wszystkie krawędzie.
  // Krawędzie do węzłów odrzuconych jako szum też muszą zniknąć — stąd valid liczony
  // z finalIndices, nie ze wszystkich klastrów.
  const valid = new Set(finalIndices);
  const seenPairs = new Set();
  const edges = rawEdges
    .map(e => ({ ...e, source: Number(e.source), target: Number(e.target) }))
    .filter(e => {
      if (!valid.has(e.source) || !valid.has(e.target) || e.source === e.target) return false;
      const pair = `${Math.min(e.source, e.target)}-${Math.max(e.source, e.target)}`;
      if (seenPairs.has(pair)) return false;
      seenPairs.add(pair);
      return true;
    })
    .map(e => ({
      id: `e${e.source}-${e.target}`,
      source: `n${e.source}`,
      target: `n${e.target}`,
      relation: e.relation || '',
    }));

  onProgress?.('Szukam sprzeczności między węzłami...');
  const rawContradictions = await detectContradictions(apiKey, model, nodes);
  const nodeIdSet = new Set(nodes.map(n => n.id));
  const contradictions = rawContradictions
    .filter(c => nodeIdSet.has(c.nodeA) && nodeIdSet.has(c.nodeB) && c.nodeA !== c.nodeB)
    .map((c, i) => ({
      id: `contradiction-${i}`,
      source: c.nodeA,
      target: c.nodeB,
      summary: c.summary || 'Sprzeczność',
    }));

  return { nodes, edges, sections, granularity, contradictions, sourceIds: usable.map(s => s.id), generatedAt: new Date().toISOString() };
}

async function detectContradictions(apiKey, model, nodes) {
  if (nodes.length < 2) return [];

  const digest = nodes
    .map(n => `[${n.id}] ${n.title}\nTwierdzenia: ${n.keyPoints.slice(0, 4).join(' | ')}`)
    .join('\n\n');

  const systemInstruction = `Jesteś analitykiem treści. Znajdź RZECZYWISTE SPRZECZNOŚCI między węzłami mapy wiedzy.
Sprzeczność = dwa węzły zawierają wzajemnie wykluczające się twierdzenia (np. "X rośnie" vs "X maleje", "stosuj A" vs "unikaj A", "dozwolone" vs "zabronione").
NIE zgłaszaj: różnych perspektyw, różnych kontekstów, uzupełnień, różnych poziomów szczegółowości tego samego tematu.
Zgłaszaj TYLKO twarde, logiczne wykluczenia.
Zwróć JSON: { "contradictions": [ { "nodeA": "n0", "nodeB": "n3", "summary": "Co dokładnie sobie przeczy (max 12 słów)" } ] }
Jeśli brak sprzeczności: { "contradictions": [] }`;

  try {
    const cleanKey = (apiKey || '').trim();
    const effectiveModel = normalizeModelName(model);
    const res = await fetch(`${GEMINI_BASE}/${effectiveModel}:generateContent?key=${cleanKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Węzły mapy wiedzy:\n\n${digest}\n\nWykryj sprzeczności.` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];
    const parsed = JSON.parse(stripFences(text));
    return Array.isArray(parsed.contradictions) ? parsed.contradictions : [];
  } catch {
    return [];
  }
}

/**
 * Stabilny klucz cache'u per projekt — nie zmienia się gdy dodajesz/usuwasz źródła.
 * Przebudowa jest tylko na wyraźne żądanie użytkownika ("Przebuduj mapę").
 */
export function graphCacheKey(projectId) {
  return `notebook_canvas_v3_${projectId}`;
}

/**
 * Regeneruje TYLKO krawędzie dla podanych węzłów — bez embeddingów i klastrowania.
 * Używane po usunięciu przestarzałych węzłów, żeby mapa miała spójne relacje.
 */
export async function recomputeEdges(apiKey, model, nodes, sections) {
  if (nodes.length < 2) return [];

  const digest = nodes.map(n => {
    const sec = sections.find(s => s.id === n.parentId);
    return `[${n.id}] ${n.title} (sekcja: ${sec?.name || '?'})\n${n.keyPoints.slice(0, 3).join(' | ')}`;
  }).join('\n\n');

  const systemInstruction = `Masz mapę wiedzy. Wygeneruj relacje (krawędzie) między węzłami, które mają logiczne powiązania przyczynowo-skutkowe lub zależności.
Zwróć TYLKO JSON: { "edges": [ { "source": "n0", "target": "n3", "relation": "wpływa na" } ] }
Zasady: tylko wyraźne związki, unikaj losowych połączeń, max ~1.5 krawędzi na węzeł. Pisz po polsku.`;

  try {
    const cleanKey = (apiKey || '').trim();
    const effectiveModel = normalizeModelName(model);
    const res = await fetch(`${GEMINI_BASE}/${effectiveModel}:generateContent?key=${cleanKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Węzły:\n\n${digest}\n\nWygeneruj krawędzie.` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];
    const parsed = JSON.parse(stripFences(text));
    return Array.isArray(parsed.edges) ? parsed.edges : [];
  } catch {
    return [];
  }
}
