/**
 * RAG (Retrieval-Augmented Generation) utilities
 * Embedding model: text-embedding-004 (768 dims, bezpłatny na Google AI Studio)
 * Vector store: Supabase + pgvector
 */

const EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';
const CHUNK_SIZE = 1500;   // znaki (~375 tokenów)
const CHUNK_OVERLAP = 200; // znaki

// ── Chunking ────────────────────────────────────────────────────────────────

export function chunkText(rawText, sourceId, sourceTitle) {
  const text = (rawText || '').trim();
  if (!text) return [];

  const chunks = [];
  let pos = 0;
  let idx = 0;

  while (pos < text.length) {
    let end = Math.min(pos + CHUNK_SIZE, text.length);
    let slice = text.slice(pos, end);

    // Przerwij na granicy zdania jeśli nie koniec tekstu
    if (end < text.length) {
      const last = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('.\n'),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('! '),
        slice.lastIndexOf('\n\n')
      );
      if (last > CHUNK_SIZE * 0.5) {
        slice = slice.slice(0, last + 1);
      }
    }

    const content = slice.trim();
    if (content.length > 50) {
      chunks.push({ source_id: sourceId, source_title: sourceTitle, chunk_index: idx++, content });
    }

    pos += slice.length - CHUNK_OVERLAP;
    if (pos <= 0) break;
  }

  return chunks;
}

// Dla YouTube — grupuj segmenty transkrypcji do chunków ze znacznikami czasu
export function chunkTranscript(transcript, sourceId, sourceTitle) {
  if (!Array.isArray(transcript) || transcript.length === 0) return [];

  const chunks = [];
  let buf = '';
  let bufStart = '';
  let idx = 0;

  for (const seg of transcript) {
    const line = `[${seg.timeStr}] ${seg.text}`;
    if (buf.length + line.length > CHUNK_SIZE && buf.length > 200) {
      chunks.push({
        source_id: sourceId,
        source_title: sourceTitle,
        chunk_index: idx++,
        content: buf.trim(),
        metadata: { timeStart: bufStart },
      });
      // Overlap: zachowaj ostatnie 3 segmenty
      const lines = buf.split('\n');
      buf = lines.slice(-3).join('\n') + '\n';
      bufStart = seg.timeStr;
    }
    buf += line + '\n';
    if (!bufStart) bufStart = seg.timeStr;
  }

  if (buf.trim().length > 50) {
    chunks.push({
      source_id: sourceId,
      source_title: sourceTitle,
      chunk_index: idx,
      content: buf.trim(),
      metadata: { timeStart: bufStart },
    });
  }

  return chunks;
}

// ── Embedding ────────────────────────────────────────────────────────────────

export async function embedText(geminiApiKey, text, taskType = 'RETRIEVAL_DOCUMENT') {
  const res = await fetch(`${EMBED_URL}?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text: text.slice(0, 8000) }] }, // limit modelu
      taskType,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Embed HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.embedding?.values || [];
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

function sbHeaders(supabaseKey) {
  return {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'resolution=merge-duplicates',
  };
}

// ── Indexing ─────────────────────────────────────────────────────────────────

/**
 * Podziel źródło na chunki, osadź je i zapisz do Supabase.
 * onProgress(done, total) — opcjonalny callback
 */
export async function indexSource(supabaseUrl, supabaseKey, geminiApiKey, projectId, source, onProgress) {
  const sourceId = source.id || source.videoId;

  // Pobierz chunki
  let chunks;
  if (source.type === 'youtube' && Array.isArray(source.transcript) && source.transcript.length > 0) {
    chunks = chunkTranscript(source.transcript, sourceId, source.title);
  } else {
    chunks = chunkText(source.rawText || '', sourceId, source.title);
  }

  if (chunks.length === 0) return { indexed: 0, total: 0 };

  // Usuń stare chunki dla tego źródła
  await fetch(
    `${supabaseUrl}/rest/v1/chunks?source_id=eq.${encodeURIComponent(sourceId)}`,
    { method: 'DELETE', headers: sbHeaders(supabaseKey) }
  );

  // Embed + insert partiami po 10
  const BATCH = 10;
  let indexed = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);

    const embeddings = await Promise.all(
      batch.map(c => embedText(geminiApiKey, c.content, 'RETRIEVAL_DOCUMENT'))
    );

    const rows = batch.map((c, j) => ({
      project_id: projectId,
      source_id: c.source_id,
      source_title: c.source_title,
      chunk_index: c.chunk_index,
      content: c.content,
      embedding: JSON.stringify(embeddings[j]),
      metadata: c.metadata || {},
    }));

    const res = await fetch(`${supabaseUrl}/rest/v1/chunks`, {
      method: 'POST',
      headers: sbHeaders(supabaseKey),
      body: JSON.stringify(rows),
    });

    if (res.ok) {
      indexed += batch.length;
      onProgress?.(indexed, chunks.length);
    }
  }

  return { indexed, total: chunks.length };
}

// ── Retrieval ─────────────────────────────────────────────────────────────────

/**
 * Wyszukaj top-K chunków do pytania użytkownika.
 * Zwraca [{source_id, source_title, chunk_index, content, similarity}]
 */
export async function retrieveChunks(supabaseUrl, supabaseKey, geminiApiKey, projectId, sourceIds, query, k = 6) {
  const queryEmbedding = await embedText(geminiApiKey, query, 'RETRIEVAL_QUERY');

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/match_chunks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_project_id: projectId,
      match_source_ids: sourceIds.length > 0 ? sourceIds : null,
      match_count: k,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `RAG search HTTP ${res.status}`);
  }

  return await res.json();
}

// ── Utils ─────────────────────────────────────────────────────────────────────

export function isRagEnabled(apiKeys) {
  return !!(apiKeys?.supabaseUrl && apiKeys?.supabaseKey);
}

// ── Lokalny RAG (BM25, in-memory, bez Supabase) ───────────────────────────────

const localIndex = new Map(); // sourceId → [{...chunk, tf:{term:count}, len:number}]

const BM25_K1 = 1.5;
const BM25_B  = 0.75;

function tokenize(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1);
}

export function indexSourceLocal(source) {
  const sourceId = String(source.id || source.videoId || '');
  if (!sourceId) return 0;
  let chunks;
  if (source.type === 'youtube' && Array.isArray(source.transcript) && source.transcript.length > 0) {
    chunks = chunkTranscript(source.transcript, sourceId, source.title);
  } else {
    chunks = chunkText(source.rawText || source.content || '', sourceId, source.title);
  }
  const indexed = chunks.map(chunk => {
    const tokens = tokenize(chunk.content);
    const tf = {};
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    return { ...chunk, tf, len: tokens.length };
  });
  localIndex.set(sourceId, indexed);
  return indexed.length;
}

export function isLocalRagIndexed(sourceId) {
  return localIndex.has(String(sourceId));
}

export function retrieveChunksLocal(sourceIds, query, k = 6) {
  const allChunks = [];
  for (const id of sourceIds) {
    allChunks.push(...(localIndex.get(String(id)) || []));
  }
  if (allChunks.length === 0) return [];

  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0) return allChunks.slice(0, k);

  const avgLen = allChunks.reduce((s, c) => s + c.len, 0) / allChunks.length;
  const N = allChunks.length;

  const df = {};
  for (const term of queryTerms) {
    df[term] = allChunks.filter(c => c.tf[term] > 0).length;
  }

  const scored = allChunks.map(chunk => {
    let score = 0;
    for (const term of queryTerms) {
      if (!df[term]) continue;
      const idf = Math.log((N - df[term] + 0.5) / (df[term] + 0.5) + 1);
      const termTf = chunk.tf[term] || 0;
      score += idf * (termTf * (BM25_K1 + 1)) / (termTf + BM25_K1 * (1 - BM25_B + BM25_B * chunk.len / avgLen));
    }
    return { ...chunk, similarity: score };
  });

  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
    .filter(c => c.similarity > 0);
}

/** Zbuduj blok kontekstu z chunków RAG do systemu */
export function buildRagContext(chunks, selectedSources) {
  if (!chunks || chunks.length === 0) return '';

  const sourceIndex = selectedSources.map((s, i) =>
    `  Źródło ${i + 1}: "${s.title}" | sourceId: "${s.videoId || s.id}"`
  ).join('\n');

  let ctx = `Poniżej znajdują się NAJWAŻNIEJSZE fragmenty materiałów źródłowych dopasowane do pytania użytkownika (RAG retrieval). Użyj ich jako wiedzy bazowej.\n\nSPIS ŹRÓDEŁ:\n${sourceIndex}\n\n`;
  ctx += `=== POBRANE FRAGMENTY (${chunks.length}) ===\n\n`;

  for (const chunk of chunks) {
    const src = selectedSources.find(s => (s.id || s.videoId) === chunk.source_id);
    const sourceId = src ? (src.videoId || src.id) : chunk.source_id;
    ctx += `--- Fragment ze źródła: "${chunk.source_title}" | sourceId: "${sourceId}" | podobieństwo: ${(chunk.similarity * 100).toFixed(0)}% ---\n`;
    ctx += chunk.content + '\n\n';
  }

  return ctx;
}
