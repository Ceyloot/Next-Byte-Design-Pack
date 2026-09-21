/**
 * Wspólny format tabelaryczny używany przez CSV/XLSX/HTML: każdy wiersz źródła
 * zapisany jest jako linia "Wiersz N: kolumna1: wartość1 | kolumna2: wartość2 | ...".
 * Ten plik parsuje ten format z powrotem do {columns, rows} do renderowania
 * prawdziwej tabeli (DocumentViewer, ChatPanel, podgląd źródła na Canvasie).
 */

const ROW_LINE_RE = /^[Ww]iersz\s+(\d+):\s*(.*)/;

/** Parsuje jedną linię "Wiersz N: k: v | k: v" na {rowNum, fields}. */
export function parseTableRowLine(line) {
  const m = line.trim().match(ROW_LINE_RE);
  if (!m) return null;
  const fields = {};
  m[2].split('|').forEach(f => {
    const colonIdx = f.indexOf(':');
    if (colonIdx === -1) return;
    const col = f.slice(0, colonIdx).trim();
    const val = f.slice(colonIdx + 1).trim();
    if (col) fields[col] = val;
  });
  return { rowNum: m[1], fields };
}

/** Parsuje cały rawText źródła tabelarycznego na {columns, rows}. Zwraca null, jeśli nic nie znaleziono. */
export function parseTabularText(rawText) {
  const rows = [];
  const allColumns = new Set();
  for (const line of (rawText || '').split('\n')) {
    const parsed = parseTableRowLine(line);
    if (!parsed) continue;
    rows.push(parsed);
    Object.keys(parsed.fields).forEach(c => allColumns.add(c));
  }
  if (rows.length === 0) return null;
  return { columns: [...allColumns], rows };
}

/** Czy dany rodzaj pliku renderujemy jako tabelę zamiast surowego tekstu. */
export function isTabularKind(fileKind) {
  return fileKind === 'csv' || fileKind === 'xlsx' || fileKind === 'html';
}

/**
 * Wyszukuje w tekście fragmentu wskaźnik lokalizacji w źródle: numer wiersza
 * (tabele) albo numer strony (PDF) — cokolwiek pozwala precyzyjnie wrócić
 * do miejsca, z którego wzięto informację, zamiast pokazywać całe źródło od góry.
 */
export function extractLocator(text) {
  const rowMatch = (text || '').match(/[Ww]iersz\s+(\d+):/);
  if (rowMatch) return { type: 'row', value: Number(rowMatch[1]) };
  const pageMatch = (text || '').match(/\[Strona\s+(\d+)\]/);
  if (pageMatch) return { type: 'page', value: Number(pageMatch[1]) };
  return null;
}
