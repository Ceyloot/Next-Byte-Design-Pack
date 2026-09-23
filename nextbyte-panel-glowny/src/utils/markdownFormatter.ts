/**
 * NextByte Markdown Formatter — Premium-grade AI response rendering
 * 
 * Pipeline:
 *   1. Protect code blocks from transformation
 *   2. Pre-process: fix AI spacing quirks (stuck numbers, headers, bullets)
 *   3. Parse block elements: tables → headers → lists → paragraphs
 *   4. Parse inline elements: bold, italic, links, inline code
 *   5. Wrap in semantic HTML with clean spacing
 */

// ─── Helpers ──────────────────────────────────────────────

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, c => map[c] || c);
};

// ─── Code Blocks ──────────────────────────────────────────

import katex from 'katex';

const CODE_PLACEHOLDER_PREFIX = '\x00CODE_BLOCK_';
const INLINE_CODE_PREFIX = '\x00INLINE_CODE_';
const MATH_BLOCK_PREFIX = '\x00MATH_BLOCK_';
const MATH_INLINE_PREFIX = '\x00MATH_INLINE_';

interface CodeStore {
  blocks: Map<string, string>;
  inlines: Map<string, string>;
  math: Map<string, string>;
}

const renderMath = (src: string, displayMode: boolean): string => {
  try {
    return katex.renderToString(src, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
    });
  } catch {
    const tag = displayMode ? 'div' : 'span';
    return `<${tag} class="nextbyte-math-fallback">${escapeHtml(src)}</${tag}>`;
  }
};

/** Extract math ($$...$$ and $...$) into placeholders */
const extractMath = (text: string, store: CodeStore): string => {
  let idx = 0;
  let result = text;

  // Block math: $$...$$ (multi-line allowed) OR \[ ... \]
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    const key = `${MATH_BLOCK_PREFIX}${idx++}\x00`;
    store.math.set(key, `<div class="nextbyte-math-block">${renderMath(expr.trim(), true)}</div>`);
    return key;
  });
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_m, expr) => {
    const key = `${MATH_BLOCK_PREFIX}${idx++}\x00`;
    store.math.set(key, `<div class="nextbyte-math-block">${renderMath(expr.trim(), true)}</div>`);
    return key;
  });

  // Inline math: $...$  (avoid $$ and avoid currency like $5 or $5.99)
  // Requires non-space right after $ and non-space before closing $, and no digit-only content.
  result = result.replace(/(^|[^\\$])\$(?!\s)([^\n$]{1,200}?)(?<!\s)\$(?!\d)/g, (_m, pre, expr) => {
    // skip pure numbers (currency)
    if (/^[\d.,\s]+$/.test(expr)) return `${pre}$${expr}$`;
    const key = `${MATH_INLINE_PREFIX}${idx++}\x00`;
    store.math.set(key, renderMath(expr, false));
    return `${pre}${key}`;
  });

  // Inline math: \( ... \)
  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (_m, expr) => {
    const key = `${MATH_INLINE_PREFIX}${idx++}\x00`;
    store.math.set(key, renderMath(expr.trim(), false));
    return key;
  });

  return result;
};


const formatLanguageName = (lang: string): string => {
  const map: Record<string, string> = {
    'js': 'JavaScript', 'javascript': 'JavaScript', 'ts': 'TypeScript', 'typescript': 'TypeScript',
    'tsx': 'TypeScript React', 'jsx': 'JavaScript React', 'py': 'Python', 'python': 'Python',
    'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'json': 'JSON', 'sql': 'SQL',
    'bash': 'Bash', 'sh': 'Shell', 'shell': 'Shell', 'yml': 'YAML', 'yaml': 'YAML',
    'md': 'Markdown', 'php': 'PHP', 'java': 'Java', 'c': 'C', 'cpp': 'C++',
    'csharp': 'C#', 'cs': 'C#', 'go': 'Go', 'rust': 'Rust', 'rb': 'Ruby', 'ruby': 'Ruby',
    'swift': 'Swift', 'kotlin': 'Kotlin', 'dart': 'Dart', 'r': 'R', 'xml': 'XML',
    'graphql': 'GraphQL', 'dockerfile': 'Dockerfile', 'vue': 'Vue', 'svelte': 'Svelte',
    'prisma': 'Prisma', 'toml': 'TOML', 'ini': 'INI', 'env': 'Environment',
    'txt': 'Text', 'text': 'Text', 'plaintext': 'Plain Text',
  };
  return map[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
};

/** Extract code blocks and inline code, replacing with placeholders */
const extractCode = (text: string): { text: string; store: CodeStore } => {
  const store: CodeStore = { blocks: new Map(), inlines: new Map(), math: new Map() };
  let result = text;
  let idx = 0;

  // Mermaid keywords used to auto-detect diagram blocks even without ```mermaid lang tag
  const MERMAID_KEYWORDS = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|journey|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|sankey-beta|xychart-beta|block-beta|architecture-beta|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b/i;

  // Multi-line code blocks
  result = result.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const key = `${CODE_PLACEHOLDER_PREFIX}${idx++}\x00`;
    const trimmedCode = code.trim();
    const isMermaid = lang?.toLowerCase() === 'mermaid' || (!lang && MERMAID_KEYWORDS.test(trimmedCode));
    if (isMermaid) {
      const escapedMermaidCode = escapeHtml(trimmedCode).replace(/"/g, '&quot;');
      const html = `<div class="nextbyte-mermaid-block" data-code="${escapedMermaidCode}"></div>`;
      store.blocks.set(key, html);
      return key;
    }
    const displayLang = lang ? formatLanguageName(lang) : '';
    const langLabel = displayLang ? `<span class="nextbyte-code-lang">${displayLang}</span>` : '';
    const langClass = lang ? ` data-lang="${lang}"` : '';
    const escapedCode = escapeHtml(trimmedCode).replace(/"/g, '&quot;');
    const downloadableLangs = ['csv', 'json', 'sql', 'xml', 'html', 'txt', 'text', 'plaintext', 'py', 'python', 'js', 'javascript', 'ts', 'typescript', 'css', 'yaml', 'yml', 'md', 'markdown'];
    const isDownloadable = lang && downloadableLangs.includes(lang.toLowerCase());
    const downloadButton = isDownloadable
      ? `<button class="nextbyte-code-download" data-lang="${lang.toLowerCase()}" title="Pobierz plik"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="download-text">Pobierz</span></button>`
      : '';
    const html = `<div class="nextbyte-code-block"${langClass}>${langLabel ? `<div class="nextbyte-code-header">${langLabel}</div>` : ''}<pre><code>${escapeHtml(trimmedCode)}</code></pre><div class="nextbyte-code-footer">${downloadButton}<button class="nextbyte-code-copy" data-code="${escapedCode}" title="Kopiuj kod"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span class="copy-text">Kopiuj kod</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon hidden"><path d="M20 6 9 17l-5-5"/></svg><span class="copied-text hidden">Skopiowano!</span></button></div></div>`;
    store.blocks.set(key, html);
    return key;
  });

  // Inline code
  result = result.replace(/`([^`\n]+)`/g, (_match, code) => {
    const key = `${INLINE_CODE_PREFIX}${idx++}\x00`;
    store.inlines.set(key, `<code class="nextbyte-inline-code">${escapeHtml(code)}</code>`);
    return key;
  });

  return { text: result, store };
};

/** Restore code + math placeholders */
const restoreCode = (html: string, store: CodeStore): string => {
  let result = html;
  for (const [key, val] of store.blocks) result = result.split(key).join(val);
  for (const [key, val] of store.inlines) result = result.split(key).join(val);
  for (const [key, val] of store.math) result = result.split(key).join(val);
  return result;
};

// ─── Table Parsing ────────────────────────────────────────

const isTableSeparator = (row: string): boolean => {
  const trimmed = row.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = trimmed.replace(/^\||\|$/g, '').split('|');
  return cells.every(cell => {
    const cleaned = cell.trim();
    return cleaned.length > 0 && /^[:\-]+$/.test(cleaned.replace(/\s/g, ''));
  });
};

const preprocessTableContent = (content: string): string => {
  const lines = content.split('\n');
  const fixedLines: string[] = [];
  let currentLine = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentLine) { fixedLines.push(currentLine); currentLine = ''; }
      continue;
    }
    const startsWithPipe = trimmed.startsWith('|');
    const currentEndsWithPipe = currentLine.endsWith('|');
    if (currentLine && !startsWithPipe && currentLine.includes('|')) {
      currentLine = currentLine + trimmed;
    } else if (currentLine && startsWithPipe) {
      fixedLines.push(currentLine);
      currentLine = trimmed;
    } else if (currentLine && !currentEndsWithPipe && trimmed.includes('|')) {
      const joined = currentLine + ' ' + trimmed;
      if ((joined.match(/\|/g) || []).length >= 2) { currentLine = joined; }
      else { fixedLines.push(currentLine); currentLine = trimmed; }
    } else {
      if (currentLine) fixedLines.push(currentLine);
      currentLine = trimmed;
    }
  }
  if (currentLine) fixedLines.push(currentLine);
  return fixedLines.join('\n');
};

const parseMarkdownTable = (tableContent: string): string => {
  if (/<\/?[a-z][\s\S]*>/i.test(tableContent)) return tableContent;
  const preprocessed = preprocessTableContent(tableContent);
  const lines = preprocessed.trim().split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return tableContent;

  let separatorIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isTableSeparator(lines[i])) { separatorIndex = i; break; }
  }

  const buildTable = (headers: string[], dataRows: string[][]): string => {
    const headerCells = headers.map(h => `<th class="nextbyte-table-header">${escapeHtml(h)}</th>`).join('');
    const bodyRows = dataRows.map((row, idx) => {
      const cells = row.map(cell => `<td class="nextbyte-table-cell">${escapeHtml(cell)}</td>`).join('');
      return `<tr class="nextbyte-table-row ${idx % 2 === 1 ? 'nextbyte-table-row-alt' : ''}">${cells}</tr>`;
    }).join('');
    return `<div class="nextbyte-table-wrapper"><table class="nextbyte-table"><thead><tr class="nextbyte-table-header-row">${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
  };

  if (separatorIndex === -1) {
    const allHavePipes = lines.every(l => l.includes('|'));
    if (!allHavePipes || lines.length < 2) return tableContent;
    const headers = lines[0].split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (!headers.length) return tableContent;
    const dataRows = lines.slice(1)
      .filter(r => r.includes('|') && !isTableSeparator(r))
      .map(r => r.split('|').map(c => c.trim()).filter(c => c.length > 0))
      .filter(r => r.length > 0);
    return dataRows.length ? buildTable(headers, dataRows) : tableContent;
  }

  if (separatorIndex === 0) return tableContent;
  const headers = lines[separatorIndex - 1].split('|').map(c => c.trim()).filter(c => c.length > 0);
  if (!headers.length) return tableContent;
  const dataRows = lines.slice(separatorIndex + 1)
    .filter(r => r.includes('|') && !isTableSeparator(r))
    .map(r => r.split('|').map(c => c.trim()).filter(c => c.length > 0))
    .filter(r => r.length > 0);
  return dataRows.length ? buildTable(headers, dataRows) : tableContent;
};

// ─── Pre-processing ───────────────────────────────────────

/**
 * Fix common AI spacing issues where block elements get glued to text.
 * Only targets clear structural boundaries — does NOT touch single newlines
 * inside normal paragraph flow.
 */
const preprocessMarkdownSpacing = (text: string): string => {
  let r = text;

  // 1. Numbered list glued after sentence end (with optional bold markers):
  //    "...sposób. **2. Perspektywa" → "...sposób.\n\n**2. Perspektywa"
  //    "...zdania.2. Punkt"         → "...zdania.\n\n2. Punkt"
  r = r.replace(/([a-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ)\]"']\.)\s*(\*{0,3})(\d+\.\s)/gi, '$1\n\n$2$3');

  // 2. Same for ! and ? endings
  r = r.replace(/([!?])\s*(\*{0,3})(\d+\.\s)/g, '$1\n\n$2$3');

  // 3. Header glued to previous text (must have \n before # but not \n\n)
  // Exclude # from preceding char to avoid splitting ## into # + #
  r = r.replace(/([^\n#])\n?(#{1,6}\s)/g, '$1\n\n$2');

  // 4. Collapse 3+ blank lines → 2
  r = r.replace(/\n{3,}/g, '\n\n');

  return r;
};

// ─── Block Parsing ────────────────────────────────────────

/** Parse markdown headers to styled HTML divs */
const parseHeaders = (text: string): string => {
  let r = text;
  r = r.replace(/^\s{0,3}####\s+(.+)$/gm, '<div class="nextbyte-header nextbyte-header-h4">$1</div>');
  r = r.replace(/^\s{0,3}###(?!#)\s+(.+)$/gm, '<div class="nextbyte-header nextbyte-header-h3">$1</div>');
  r = r.replace(/^\s{0,3}##(?!#)\s+(.+)$/gm, '<div class="nextbyte-header nextbyte-header-h2">$1</div>');
  r = r.replace(/^\s{0,3}#(?!#)\s+(.+)$/gm, '<div class="nextbyte-header nextbyte-header-h1">$1</div>');
  return r;
};

/** Parse horizontal rules */
const parseHorizontalRules = (text: string): string => {
  return text.replace(/^[ \t]*([*\-_])\1{2,}[ \t]*$/gm, '<hr class="nextbyte-hr">');
};

// ─── List Parsing ─────────────────────────────────────────

interface ListNode {
  text: string;
  children: ListNode[];
  ordered: boolean;
  startNum?: number;
}

const parseListBlocks = (html: string): string => {
  const lines = html.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    const ulMatch = !olMatch ? line.match(/^[-*+]\s+(.*)/) : null;

    if (olMatch || ulMatch) {
      const listLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const isListItem = /^\s*\d+\.\s+/.test(l) || /^\s*[-*+]\s+/.test(l);
        const isEmpty = l.trim() === '';
        if (isListItem) {
          listLines.push(l);
          i++;
        } else if (isEmpty && i + 1 < lines.length && (/^\s*\d+\.\s+/.test(lines[i + 1]) || /^\s*[-*+]\s+/.test(lines[i + 1]))) {
          i++;
        } else {
          break;
        }
      }
      result.push(buildNestedList(listLines));
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
};

const buildNestedList = (lines: string[]): string => {
  const root: ListNode[] = [];
  const stack: { nodes: ListNode[]; indent: number }[] = [{ nodes: root, indent: -1 }];

  for (const line of lines) {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
    const ulMatch = !olMatch ? line.match(/^\s*[-*+]\s+(.*)/) : null;
    if (!olMatch && !ulMatch) continue;

    const text = olMatch ? olMatch[2].trim() : ulMatch![1].trim();
    const ordered = !!olMatch;
    const startNum = olMatch ? parseInt(olMatch[1], 10) : undefined;
    const node: ListNode = { text, children: [], ordered, startNum };

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    stack[stack.length - 1].nodes.push(node);
    stack.push({ nodes: node.children, indent });
  }

  return renderListNodes(root);
};

const renderListNodes = (nodes: ListNode[]): string => {
  if (nodes.length === 0) return '';
  const isOrdered = nodes[0].ordered;
  const startAttr = isOrdered && nodes[0].startNum && nodes[0].startNum !== 1
    ? ` start="${nodes[0].startNum}"` : '';
  const tag = isOrdered ? 'ol' : 'ul';

  let hasTask = false;
  const items = nodes.map(node => {
    const childHtml = node.children.length > 0 ? renderListNodes(node.children) : '';
    // GFM task list: "[ ] rest" or "[x] rest"
    const taskMatch = node.text.match(/^\[( |x|X)\]\s+(.*)$/);
    if (taskMatch) {
      hasTask = true;
      const checked = taskMatch[1].toLowerCase() === 'x';
      return `<li class="nextbyte-task-item"><input type="checkbox" class="nextbyte-task-checkbox" disabled${checked ? ' checked' : ''}> <span class="${checked ? 'nextbyte-task-done' : ''}">${taskMatch[2]}</span>${childHtml}</li>`;
    }
    return `<li>${node.text}${childHtml}</li>`;
  }).join('');

  const listClass = hasTask ? ' class="nextbyte-task-list"' : '';
  return `\n<${tag}${isOrdered ? startAttr : ''}${listClass}>${items}</${tag}>\n`;
};

// ─── Inline Parsing ───────────────────────────────────────

const parseInlineFormatting = (html: string): string => {
  let r = html;

  // Text color: {color:hex}text{/color}
  r = r.replace(/\{color:([^}]+)\}(.+?)\{\/color\}/g, '<span style="color: $1">$2</span>');
  // Highlight
  r = r.replace(/\{highlight:([^}]+)\}(.+?)\{\/highlight\}/g, '<span style="background-color: $1; border-radius: 2px; padding: 0 2px;">$2</span>');

  // Bold+italic ***text***
  r = r.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold **text**
  r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Mismatched bold: **text* (2 open, 1 close)
  r = r.replace(/\*\*([^*]+)\*/g, '<strong>$1</strong>');

  // Unclosed bold: **text (to end of line)
  r = r.replace(/\*\*([^*\n]+)$/gm, '<strong>$1</strong>');

  // Italic *text* (not part of **)
  r = r.replace(/(?<!\*)(^|[\s(\[{])?\*(?!\*)([^*\n]+?)\*(?!\*)/gm, '$1<em>$2</em>');

  // Strikethrough ~~text~~ (GFM)
  r = r.replace(/~~([^~\n]+)~~/g, '<del class="nextbyte-strikethrough">$1</del>');

  /*
    OBRAZY ![alt](url) — MUSZĄ IŚĆ PRZED LINKAMI.

    Składnia obrazu ZAWIERA w sobie składnię linku, więc reguła linków zjadała
    `[alt](url)`, zostawiając samotny wykrzyknik. Objaw zgłoszony przez Michała
    31.08: pokaz wizualizacji w onboardingu wyświetlał „!Przykładowa wizualizacja"
    jako niebieski odnośnik zamiast obrazka — czyli cały pokaz nie pokazywał nic.

    Tylko http(s) i `data:` — inne schematy (`javascript:`, `vbscript:`) trafiłyby
    prosto do atrybutu `src` z treści, którą pisze model.
  */
  r = r.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+|data:image\/[^)\s]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="nextbyte-md-image my-2 max-w-full rounded-xl border border-border/60" />',
  );

  // Links [text](url)
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');

  // Autolinks: bare http(s) URLs not already inside href/text-of-anchor
  r = r.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;!?])/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$2</a>');

  return r;
};

// ─── Blockquotes ──────────────────────────────────────────

/**
 * Convert consecutive lines starting with `>` into a styled <blockquote>.
 * Empty `>` lines become paragraph breaks within the quote.
 */
const parseBlockquotes = (html: string): string => {
  const lines = html.split('\n');
  const out: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (buf.length === 0) return;
    const paragraphs: string[][] = [[]];
    for (const l of buf) {
      if (l.trim() === '') {
        if (paragraphs[paragraphs.length - 1].length > 0) paragraphs.push([]);
      } else {
        paragraphs[paragraphs.length - 1].push(l);
      }
    }
    const inner = paragraphs
      .filter(p => p.length > 0)
      .map(p => `<p>${p.join('<br>')}</p>`)
      .join('');
    out.push(`<blockquote class="nextbyte-blockquote">${inner}</blockquote>`);
    buf = [];
  };

  for (const line of lines) {
    const m = line.match(/^\s*>\s?(.*)$/);
    if (m) {
      buf.push(m[1]);
    } else {
      flush();
      out.push(line);
    }
  }
  flush();
  return out.join('\n');
};

// ─── Paragraph Wrapping ───────────────────────────────────

/**
 * Convert raw text blocks (separated by blank lines) into <p> tags.
 * Skip lines that are already block-level HTML (headers, lists, tables, code, hr).
 */
const wrapParagraphs = (html: string): string => {
  const blockPattern = /^<(div|ul|ol|li|table|thead|tbody|tr|td|th|hr|pre|blockquote|h[1-6])\b|^\x00CODE_BLOCK_/;
  const containsBlockPattern = /<(div|ul|ol|table|pre|hr|blockquote|h[1-6])\b/;

  // Split by double newlines (paragraph boundaries)
  const blocks = html.split(/\n{2,}/);

  return blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    // Already a block element at the start
    if (blockPattern.test(trimmed)) return trimmed;
    // If block contains a block-level element mixed with text,
    // split by newlines and handle each line individually to avoid nesting <div> inside <p>
    if (containsBlockPattern.test(trimmed)) {
      const lines = trimmed.split('\n');
      const result: string[] = [];
      let pendingText: string[] = [];
      const flushText = () => {
        if (pendingText.length > 0) {
          result.push(`<p>${pendingText.join('<br>')}</p>`);
          pendingText = [];
        }
      };
      for (const line of lines) {
        const l = line.trim();
        if (!l) continue;
        if (blockPattern.test(l)) {
          flushText();
          result.push(l);
        } else {
          pendingText.push(l);
        }
      }
      flushText();
      return result.join('\n');
    }
    // Wrap in paragraph, converting remaining single newlines to <br>
    const withBreaks = trimmed.replace(/\n/g, '<br>');
    return `<p>${withBreaks}</p>`;
  }).filter(Boolean).join('\n');
};

// ─── Footnotes (GFM) ──────────────────────────────────────

/**
 * Extract `[^id]: definition` blocks and convert `[^id]` references to sup links.
 * Appends a footnotes section at the end.
 */
const processFootnotes = (text: string): string => {
  const defs = new Map<string, string>();
  const stripped = text.replace(/^\[\^([^\]]+)\]:\s+([^\n]+(?:\n(?!\[\^|\S)[^\n]+)*)/gm, (_m, id: string, body: string) => {
    defs.set(id, body.trim());
    return '';
  });
  if (defs.size === 0) return text;

  const order: string[] = [];
  const withRefs = stripped.replace(/\[\^([^\]]+)\]/g, (_m, id: string) => {
    if (!defs.has(id)) return _m;
    let n = order.indexOf(id);
    if (n === -1) { order.push(id); n = order.length - 1; }
    const num = n + 1;
    return `<sup class="nextbyte-footnote-ref"><a href="#fn-${id}" id="fnref-${id}">${num}</a></sup>`;
  });

  if (order.length === 0) return withRefs;

  const items = order.map((id, i) => {
    return `<li id="fn-${id}"><span>${defs.get(id)}</span> <a href="#fnref-${id}" class="nextbyte-footnote-back" aria-label="Wróć">↩</a></li>`;
  }).join('');
  const section = `\n\n<section class="nextbyte-footnotes"><hr class="nextbyte-hr"><ol>${items}</ol></section>`;
  return withRefs + section;
};

// ─── Main Export ──────────────────────────────────────────

export const formatMarkdownToHtml = (text: string): string => {
  if (!text) return '';

  // Already processed?
  if (text.includes('class="nextbyte-table') ||
      text.includes('class="nextbyte-code') ||
      text.includes('class="nextbyte-header')) {
    return `<div class="rich-markdown-inner">${text}</div>`;
  }

  // Step 0a: Extract code blocks (protect from all transformations)
  const { text: withoutCode, store } = extractCode(text);

  // Step 0b: Extract math ($$...$$, $...$, \[...\], \(...\)) — after code so it doesn't touch code
  const withoutMath = extractMath(withoutCode, store);

  // Step 0c: Footnotes
  let html = processFootnotes(withoutMath);

  // Step 1: Pre-process AI spacing issues
  html = preprocessMarkdownSpacing(html);

  // Step 2: Tables
  const tableRegex = /(?:^|\n)((?:\|[^\n]+\|?\n?)+)/gm;
  html = html.replace(tableRegex, (match, tableContent) => {
    if (/<[^>]+>/.test(tableContent)) return match;
    const lines = tableContent.split('\n').map((l: string) => l.trim()).filter((l: string) => l && (l.startsWith('|') || (l.match(/\|/g) || []).length >= 2));
    if (lines.length < 2) return match;
    const hasSeparator = lines.some((line: string) => isTableSeparator(line));
    if (hasSeparator || lines.every((l: string) => l.includes('|'))) {
      const parsed = parseMarkdownTable(lines.join('\n'));
      if (parsed.includes('<table')) return '\n' + parsed + '\n';
    }
    return match;
  });

  // Step 3: Headers
  html = parseHeaders(html);

  // Step 4: Horizontal rules (before bold/italic to prevent --- conflicts)
  html = parseHorizontalRules(html);

  // Step 5: Inline formatting (bold, italic, links, strikethrough, autolinks)
  html = parseInlineFormatting(html);

  // Step 6: Lists (task-list aware)
  html = parseListBlocks(html);

  // Step 6.5: Blockquotes
  html = parseBlockquotes(html);

  // Step 7: Paragraphs — wrap remaining text in <p> tags
  html = wrapParagraphs(html);

  // Step 8: Restore code + math blocks
  html = restoreCode(html, store);

  // Wrap in container
  return `<div class="rich-markdown-inner">${html}</div>`;
};
