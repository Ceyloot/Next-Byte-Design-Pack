/**
 * Import plików jako źródła wiedzy: PDF, CSV/TSV, obrazy (OCR+opis przez Gemini),
 * zwykłe pliki tekstowe. Każdy plik kończy jako { title, rawText, kind } —
 * rawText to tekst gotowy do chunkingu/embeddingów i czatu.
 */

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as XLSX from 'xlsx';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'json', 'log', 'xml', 'html', 'yml', 'yaml', 'ini', 'srt', 'vtt'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus'];
const MAX_RAW_CHARS = 400_000;
const MAX_CSV_ROWS = 2000;

function extOf(name) {
  const m = /\.([^.]+)$/.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

const XLSX_EXTENSIONS = ['xlsx', 'xls', 'xlsm', 'ods'];
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export function detectFileKind(file) {
  const ext = extOf(file.name);
  if (file.type === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (file.type.startsWith('image/')) return 'image';
  if (ext === 'docx' || file.type === DOCX_MIME) return 'docx';
  if (ext === 'pptx' || file.type === PPTX_MIME) return 'pptx';
  if (XLSX_EXTENSIONS.includes(ext)) return 'xlsx';
  if (ext === 'csv' || ext === 'tsv' || file.type === 'text/csv') return 'csv';
  if (ext === 'html' || ext === 'htm' || file.type === 'text/html') return 'html';
  if (file.type.startsWith('audio/') || AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (file.type.startsWith('text/') || TEXT_EXTENSIONS.includes(ext)) return 'text';
  return 'unsupported';
}

/**
 * Wiersze arkusza → tekst czytelny dla LLM w tym samym formacie co CSV
 * ("Wiersz N: kolumna: wartość | ...") — dzięki temu jeden parser (tableFormat.js)
 * i jeden komponent (DataTable) obsługują CSV, XLSX i HTML bez rozróżniania źródła.
 */
function rowsToReadableText(label, header, dataRows) {
  const truncated = dataRows.length > MAX_CSV_ROWS;
  const lines = dataRows.slice(0, MAX_CSV_ROWS).map((r, i) =>
    `Wiersz ${i + 1}: ` + header.map((h, c) => `${h || `kol${c + 1}`}: ${r[c] ?? ''}`).join(' | ')
  );
  return [
    `Tabela "${label}" — kolumny: ${header.join(', ')}. Wierszy danych: ${dataRows.length}${truncated ? ` (pokazano pierwsze ${MAX_CSV_ROWS})` : ''}.`,
    ...lines,
  ].join('\n');
}

/** XLSX/XLS/ODS → tekst. Wielostronicowe arkusze łączymy, każdy z nagłówkiem "Arkusz: nazwa". */
async function extractXlsx(file) {
  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: 'array' });
  const sheetTexts = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    if (rows.length === 0) continue;

    const header = rows[0].map(h => String(h ?? '').trim());
    const dataRows = rows.slice(1).filter(r => r.some(c => String(c ?? '').trim() !== ''));
    if (dataRows.length === 0) continue;

    const label = workbook.SheetNames.length > 1 ? `${file.name} — ${sheetName}` : file.name;
    sheetTexts.push(rowsToReadableText(label, header, dataRows));
  }

  if (sheetTexts.length === 0) {
    throw new Error(`Plik "${file.name}" nie zawiera żadnych danych w arkuszach.`);
  }
  return sheetTexts.join('\n\n');
}

/**
 * Konwertuje HTML na tekst czytelny dla LLM, parsując tabele do ustrukturyzowanej formy.
 */
function htmlToReadableText(file, htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  // Usuwamy skrypty, style, nawigację, stopki itp.
  const toRemove = doc.querySelectorAll('script, style, nav, footer, header, iframe, noscript');
  toRemove.forEach(el => el.remove());

  // Szukamy tabel
  const tables = doc.querySelectorAll('table');
  if (tables.length > 0) {
    const tableTexts = [];
    tables.forEach((table, tableIdx) => {
      const rows = [];
      const trs = table.querySelectorAll('tr');
      if (trs.length === 0) return;

      // Szukamy nagłówków w pierwszym wierszu
      let headers = [];
      const firstRow = trs[0];
      if (firstRow) {
        const ths = firstRow.querySelectorAll('th, td');
        headers = Array.from(ths).map(th => th.textContent.trim().replace(/\s+/g, ' '));
      }

      // Parsujemy wiersze danych od drugiego wiersza (lub od pierwszego jeśli brak innych)
      const startIdx = trs.length > 1 ? 1 : 0;
      for (let i = startIdx; i < trs.length; i++) {
        // Jeśli pierwszy wiersz traktujemy jako dane, nie używamy go jako nagłówków
        if (i === 0 && startIdx === 0) {
          const tds = trs[0].querySelectorAll('td, th');
          const rowCells = Array.from(tds).map(td => td.textContent.trim().replace(/\s+/g, ' '));
          if (rowCells.every(c => c === '')) continue;
          const rowText = rowCells.map((val, colIdx) => `kol${colIdx + 1}: ${val}`).join(' | ');
          rows.push(`Wiersz 1: ${rowText}`);
          continue;
        }

        const tds = trs[i].querySelectorAll('td, th');
        if (tds.length === 0) continue;
        const rowCells = Array.from(tds).map(td => td.textContent.trim().replace(/\s+/g, ' '));
        if (rowCells.every(c => c === '')) continue;

        const rowText = rowCells.map((val, colIdx) => {
          const headerName = headers[colIdx] || `kol${colIdx + 1}`;
          return `${headerName}: ${val}`;
        }).join(' | ');

        rows.push(`Wiersz ${startIdx === 0 ? i + 1 : i}: ${rowText}`);
      }

      if (rows.length > 0) {
        tableTexts.push(
          `Tabela ${tableIdx + 1} z pliku "${file.name}":\n` + rows.join('\n')
        );
      }
    });

    if (tableTexts.length > 0) {
      return tableTexts.join('\n\n');
    }
  }

  // W przypadku braku tabel (lub ich pustki) pobieramy po prostu czysty tekst z body/dokumentu
  const bodyText = doc.body ? doc.body.textContent : doc.documentElement.textContent;
  return bodyText.replace(/\s+/g, ' ').trim();
}


function readAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error(`Nie udało się odczytać pliku "${file.name}".`));
    r.readAsText(file);
  });
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error(`Nie udało się odczytać pliku "${file.name}".`));
    r.readAsDataURL(file);
  });
}

async function extractPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await getDocument({ data: buf }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
    if (text) pages.push(`[Strona ${p}]\n${text}`);
  }
  if (pages.length === 0) {
    throw new Error(`PDF "${file.name}" nie zawiera warstwy tekstowej (to prawdopodobnie skan). Zaimportuj strony jako obrazy — wtedy AI odczyta je przez OCR.`);
  }
  return pages.join('\n\n');
}

/**
 * DOCX → tekst przez mammoth (parsuje word/document.xml zachowując akapity/nagłówki/listy).
 * Ładowany dynamicznie — spora biblioteka, niepotrzebna userom, którzy nigdy nie wgrywają Worda.
 */
async function extractDocx(file) {
  let mammoth;
  try {
    const mod = await import('mammoth/mammoth.browser.min.js');
    mammoth = mod.default || mod || window.mammoth;
  } catch (err) {
    console.error('Failed to import mammoth dynamically:', err);
    mammoth = window.mammoth;
  }
  
  if (!mammoth || typeof mammoth.extractRawText !== 'function') {
    throw new Error('Nie udało się załadować biblioteki mammoth do konwersji DOCX w przeglądarce.');
  }

  const buf = await file.arrayBuffer();
  const { value: text } = await mammoth.extractRawText({ arrayBuffer: buf });
  if (!text?.trim()) throw new Error(`Plik "${file.name}" nie zawiera odczytywalnego tekstu.`);
  return text;
}

/**
 * PPTX → tekst. Prezentacja to ZIP z jednym plikiem XML na slajd (ppt/slides/slideN.xml),
 * a cały widoczny tekst siedzi w węzłach DrawingML <a:t>. Notatki prelegenta i tekst
 * w SmartArt/wykresach żyją w innych częściach archiwum i nie są tu wyciągane (v1 scope).
 */
async function extractPptx(file) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideEntries = Object.keys(zip.files)
    .map(name => {
      const m = name.match(/^ppt\/slides\/slide(\d+)\.xml$/);
      return m ? { name, num: Number(m[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.num - b.num);

  if (slideEntries.length === 0) {
    throw new Error(`Plik "${file.name}" nie zawiera slajdów w rozpoznawalnym formacie.`);
  }

  const A_T_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const parser = new DOMParser();
  const slideTexts = [];

  for (const { name, num } of slideEntries) {
    const xml = await zip.files[name].async('string');
    const doc = parser.parseFromString(xml, 'application/xml');
    const runs = doc.getElementsByTagNameNS(A_T_NS, 't');
    const text = Array.from(runs).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    if (text) slideTexts.push(`[Slajd ${num}]\n${text}`);
  }

  if (slideTexts.length === 0) {
    throw new Error(`Prezentacja "${file.name}" nie zawiera odczytywalnego tekstu na slajdach.`);
  }
  return slideTexts.join('\n\n');
}

/** Prosty parser CSV honorujący cudzysłowy; wykrywa separator z nagłówka. */
function parseCsv(text) {
  const firstLine = text.slice(0, text.indexOf('\n') === -1 ? text.length : text.indexOf('\n'));
  const delimiter = [',', ';', '\t'].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best, ',');

  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some(f => f.trim() !== '')) rows.push(row);
  return rows;
}

/**
 * CSV → tekst zrozumiały dla LLM. Każdy wiersz niesie nazwy kolumn
 * ("A: 1 | B: 2"), więc po pocięciu na chunki kontekst tabeli nie ginie.
 */
function csvToReadableText(file, text) {
  const rows = parseCsv(text);
  if (rows.length === 0) throw new Error(`Plik "${file.name}" jest pusty.`);
  const [header, ...data] = rows;
  return rowsToReadableText(file.name, header.map(h => h.trim()), data);
}

/** Obraz → tekst przez Gemini: pełny OCR + rzeczowy opis zawartości. */
async function extractImage(file, apiKeys) {
  if (!apiKeys?.gemini) {
    throw new Error('Import obrazów wymaga klucza Gemini API (ustawienia) — AI odczytuje z nich tekst i opisuje zawartość.');
  }
  const cleanKey = (apiKeys.gemini || '').trim();
  const res = await fetch(`${GEMINI_BASE}/${apiKeys.model || 'gemini-2.5-flash'}:generateContent?key=${cleanKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: file.type, data } },
          { text: 'Przetwórz ten obraz na tekst źródłowy do bazy wiedzy:\n1. Jeśli zawiera tekst (dokument, slajd, zrzut ekranu, tabela) — przepisz go W CAŁOŚCI, wiernie, z zachowaniem struktury (tabele jako wiersze "kolumna: wartość").\n2. Opisz rzeczowo, co obraz przedstawia (wykresy: co pokazują osie i jaki jest trend/wniosek; diagramy: jakie elementy i połączenia).\nPisz po polsku, bez wstępów i komentarzy od siebie.' },
        ],
      }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Błąd analizy obrazu (HTTP ${res.status})`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n');
  if (!text?.trim()) throw new Error(`AI nie zwróciło treści dla obrazu "${file.name}".`);
  return text;
}

/**
 * Główne wejście: File → { title, rawText, kind }.
 * apiKeys potrzebne tylko dla obrazów (analiza przez Gemini).
 */
export async function extractFileContent(file, apiKeys) {
  const kind = detectFileKind(file);
  let rawText;

  if (kind === 'pdf') rawText = await extractPdf(file);
  else if (kind === 'docx') rawText = await extractDocx(file);
  else if (kind === 'pptx') rawText = await extractPptx(file);
  else if (kind === 'xlsx') rawText = await extractXlsx(file);
  else if (kind === 'csv') rawText = csvToReadableText(file, await readAsText(file));
  else if (kind === 'html') rawText = htmlToReadableText(file, await readAsText(file));
  else if (kind === 'image') rawText = await extractImage(file, apiKeys);
  else if (kind === 'audio') {
    // detectFileKind rozpoznaje audio, ale App.jsx przechwytuje ten kind wcześniej
    // (wywołuje transcribeAudio bezpośrednio) — ta gałąź nie powinna być osiągana.
    throw new Error(`Pliki audio są transkrybowane bezpośrednio — ta ścieżka nie powinna być wywołana.`);
  } else if (kind === 'text') {
    rawText = await readAsText(file);
    if (rawText.includes('\0')) throw new Error(`Plik "${file.name}" wygląda na binarny — nie da się go odczytać jako tekst.`);
  } else {
    throw new Error(`Nieobsługiwany typ pliku: "${file.name}". Obsługiwane: PDF, Word (DOCX), PowerPoint (PPTX), Excel (XLSX/XLS), CSV/TSV, HTML, obrazy, audio, pliki tekstowe.`);
  }

  rawText = (rawText || '').trim();
  if (!rawText) throw new Error(`Plik "${file.name}" nie zawiera treści.`);
  if (rawText.length > MAX_RAW_CHARS) {
    rawText = rawText.slice(0, MAX_RAW_CHARS) + `\n\n[Uwaga: plik ucięty do ${MAX_RAW_CHARS.toLocaleString('pl')} znaków]`;
  }

  return { title: file.name, rawText, kind };
}
