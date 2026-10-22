/**
 * Eksport mapy wiedzy: PNG (rasteryzacja canvasu), JSON (pełna struktura grafu),
 * Markdown (hierarchia sekcja → temat → kluczowe punkty + szczegóły),
 * XLSX/CSV (tematy jako tabela) oraz IMPORT mapy z pliku JSON (round-trip).
 */

import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';

function slugify(str) {
  return (str || 'mapa-wiedzy')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'mapa-wiedzy';
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Buduje obiekt JSON z pełną strukturą mapy. Zawiera wszystkie pola węzła
 * (łącznie z sourceId/locator/chunkCount), żeby plik dało się wczytać z powrotem
 * przez parseGraphJson bez straty danych (round-trip).
 */
export function graphToJson(graph) {
  return JSON.stringify(
    {
      format: 'notebook-canvas',
      version: 2,
      generatedAt: graph.generatedAt || null,
      granularity: graph.granularity || null,
      sections: graph.sections || [],
      nodes: (graph.nodes || []).map(n => ({
        id: n.id,
        title: n.title,
        nodeType: n.nodeType,
        sectionId: n.parentId,
        keyPoints: n.keyPoints || [],
        detail: n.detail || '',
        chunkCount: n.chunkCount || 0,
        sources: (n.sources || []).map(s => ({
          sourceId: s.sourceId || null,
          title: s.title,
          videoId: s.videoId || null,
          start: s.start ?? null,
          locator: s.locator || null,
        })),
      })),
      edges: (graph.edges || []).map(e => ({ source: e.source, target: e.target, relation: e.relation || '' })),
    },
    null,
    2
  );
}

const VALID_NODE_TYPES = new Set(['concept', 'chapter', 'timeline-event']);

/**
 * Parsuje i waliduje plik JSON z mapą (odwrotność graphToJson).
 * Toleruje braki: nieznane typy węzłów spadają na 'concept', węzły bez sekcji
 * trafiają do pierwszej, krawędzie wskazujące nieistniejące węzły są odrzucane.
 * Rzuca Error z komunikatem po polsku, gdy plik nie jest mapą.
 */
export function parseGraphJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Plik nie jest poprawnym JSON-em.');
  }

  const rawNodes = Array.isArray(data.nodes) ? data.nodes : null;
  if (!rawNodes || rawNodes.length === 0) {
    throw new Error('Plik nie zawiera węzłów mapy (pole "nodes").');
  }

  const sections = (Array.isArray(data.sections) ? data.sections : [])
    .filter(s => s && s.id && s.name)
    .map(s => ({ id: String(s.id), name: String(s.name) }));
  if (sections.length === 0) sections.push({ id: 's_import', name: 'Import' });
  const sectionIds = new Set(sections.map(s => s.id));

  const nodes = rawNodes.map((n, i) => {
    const sectionId = n.sectionId || n.parentId;
    return {
      id: String(n.id || `n${i}`),
      title: String(n.title || `Temat ${i + 1}`),
      nodeType: VALID_NODE_TYPES.has(n.nodeType) ? n.nodeType : 'concept',
      keyPoints: Array.isArray(n.keyPoints) ? n.keyPoints.map(String) : [],
      detail: typeof n.detail === 'string' ? n.detail : '',
      chunkCount: Number(n.chunkCount) || 0,
      sources: Array.isArray(n.sources)
        ? n.sources.map(s => ({
            sourceId: s?.sourceId || null,
            title: String(s?.title || 'Źródło'),
            videoId: s?.videoId || null,
            start: s?.start ?? null,
            locator: s?.locator || null,
          }))
        : [],
      parentId: sectionIds.has(sectionId) ? sectionId : sections[0].id,
    };
  });

  const nodeIds = new Set(nodes.map(n => n.id));
  const seenPairs = new Set();
  const edges = (Array.isArray(data.edges) ? data.edges : [])
    .map(e => ({ source: String(e?.source ?? ''), target: String(e?.target ?? ''), relation: String(e?.relation || '') }))
    .filter(e => {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target) || e.source === e.target) return false;
      const pair = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
      if (seenPairs.has(pair)) return false;
      seenPairs.add(pair);
      return true;
    })
    .map((e, i) => ({ id: `imp_e${i}`, source: e.source, target: e.target, relation: e.relation }));

  return {
    nodes,
    edges,
    sections,
    granularity: data.granularity || null,
    generatedAt: data.generatedAt || new Date().toISOString(),
    imported: true,
  };
}

/**
 * Spłaszcza mapę do wierszy tabeli (jeden wiersz = jeden temat).
 */
function graphToRows(graph) {
  const sectionName = new Map((graph.sections || []).map(s => [s.id, s.name]));
  return (graph.nodes || []).map(n => ({
    'Sekcja': sectionName.get(n.parentId) || '',
    'Temat': n.title,
    'Typ': n.nodeType,
    'Kluczowe punkty': (n.keyPoints || []).join('\n'),
    'Szczegóły': n.detail || '',
    'Źródła': (n.sources || []).map(s => s.videoId
      ? `${s.title} (https://www.youtube.com/watch?v=${s.videoId}&t=${Math.floor(s.start || 0)}s)`
      : s.title
    ).join('\n'),
  }));
}

/**
 * Eksport do XLSX: arkusz "Tematy" + arkusz "Powiązania".
 */
export function downloadXlsx(graph, title) {
  const wb = XLSX.utils.book_new();

  const topicSheet = XLSX.utils.json_to_sheet(graphToRows(graph));
  topicSheet['!cols'] = [{ wch: 20 }, { wch: 34 }, { wch: 14 }, { wch: 50 }, { wch: 70 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, topicSheet, 'Tematy');

  const nodeTitle = new Map((graph.nodes || []).map(n => [n.id, n.title]));
  const edgeRows = (graph.edges || []).map(e => ({
    'Od': nodeTitle.get(e.source) || e.source,
    'Relacja': e.relation || '',
    'Do': nodeTitle.get(e.target) || e.target,
  }));
  if (edgeRows.length > 0) {
    const edgeSheet = XLSX.utils.json_to_sheet(edgeRows);
    edgeSheet['!cols'] = [{ wch: 34 }, { wch: 18 }, { wch: 34 }];
    XLSX.utils.book_append_sheet(wb, edgeSheet, 'Powiązania');
  }

  XLSX.writeFile(wb, `${slugify(title)}.xlsx`);
}

/**
 * Eksport do CSV (średniki + BOM — polski Excel otwiera poprawnie bez importu).
 */
export function downloadCsv(graph, title) {
  const rows = graphToRows(graph);
  const headers = Object.keys(rows[0] || { 'Temat': '' });
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.map(esc).join(';'),
    ...rows.map(r => headers.map(h => esc(r[h])).join(';')),
  ];
  // "\uFEFF" = BOM — bez niego polski Excel otwiera CSV z krzakami zamiast ogonków.
  const blob = new Blob(["\uFEFF" + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}.csv`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Buduje dokument Markdown: sekcje jako nagłówki H2, tematy jako H3,
 * pod każdym kluczowe punkty (lista) i szczegóły. Na końcu wykaz relacji.
 */
export function graphToMarkdown(graph, title = 'Mapa wiedzy') {
  const sections = graph.sections || [];
  const nodes = graph.nodes || [];
  const lines = [`# ${title}`, ''];

  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const bySection = new Map(sections.map(s => [s.id, []]));
  const orphans = [];
  for (const n of nodes) {
    if (n.parentId && bySection.has(n.parentId)) bySection.get(n.parentId).push(n);
    else orphans.push(n);
  }

  const writeNode = (n) => {
    lines.push(`### ${n.title}`);
    if (n.keyPoints?.length) {
      lines.push('');
      for (const p of n.keyPoints) lines.push(`- ${p}`);
    }
    if (n.detail) {
      lines.push('');
      lines.push(n.detail);
    }
    if (n.sources?.length) {
      lines.push('');
      const refs = n.sources.map(s => {
        if (s.videoId) {
          const t = Math.floor(s.start || 0);
          return `[${s.title}](https://www.youtube.com/watch?v=${s.videoId}&t=${t}s)`;
        }
        return s.title;
      });
      lines.push(`_Źródła: ${refs.join(' · ')}_`);
    }
    lines.push('');
  };

  for (const s of sections) {
    const secNodes = bySection.get(s.id) || [];
    if (secNodes.length === 0) continue;
    lines.push(`## ${s.name}`, '');
    secNodes.forEach(writeNode);
  }
  if (orphans.length) {
    lines.push('## Pozostałe', '');
    orphans.forEach(writeNode);
  }

  const edges = graph.edges || [];
  if (edges.length) {
    lines.push('## Powiązania', '');
    for (const e of edges) {
      const a = nodeById.get(e.source)?.title || e.source;
      const b = nodeById.get(e.target)?.title || e.target;
      lines.push(`- **${a}** → *${e.relation || 'relacja'}* → **${b}**`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadJson(graph, title) {
  const blob = new Blob([graphToJson(graph)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadMarkdown(graph, title) {
  const blob = new Blob([graphToMarkdown(graph, title)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}.md`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Rasteryzuje CAŁĄ mapę (nie tylko widoczny wycinek) do PNG.
 *
 * `.react-flow__viewport` jest transformowany (translate+scale bieżącego widoku), więc nie da
 * się go zrzucić „jak leci" — dostalibyśmy ucięty kadr. Zamiast tego wołający wylicza docelowy
 * rozmiar obrazu i transform mieszczący wszystkie węzły (getNodesBounds + getViewportForBounds),
 * a my narzucamy je na czas zrzutu.
 */
export async function downloadPng(viewportEl, { width, height, transform, title }) {
  if (!viewportEl) throw new Error('Brak warstwy canvasu do eksportu.');

  const dataUrl = await toPng(viewportEl, {
    backgroundColor: '#0a0b0f',
    pixelRatio: 2,
    cacheBust: true,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform,
    },
  });
  triggerDownload(dataUrl, `${slugify(title)}.png`);
}
