import { fetchWithProxy } from './youtube';

/**
 * Konwertuje strukturę elementu HTML na czytelny tekst z zachowaniem nagłówków, list i tabel (Markdown).
 */
function htmlToMarkdown(element) {
  let text = '';
  
  function walk(node) {
    if (node.nodeType === 3) { // Node.TEXT_NODE
      text += node.nodeValue;
      return;
    }
    if (node.nodeType !== 1) return; // Node.ELEMENT_NODE
    
    const tagName = node.tagName.toLowerCase();
    
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'tr', 'div', 'section', 'article'].includes(tagName)) {
      text += '\n';
    }
    
    if (['h1', 'h2', 'h3'].includes(tagName)) {
      text += '\n### ';
    } else if (['h4', 'h5', 'h6'].includes(tagName)) {
      text += '\n#### ';
    } else if (tagName === 'li') {
      text += '- ';
    }
    
    for (let child = node.firstChild; child; child = child.nextSibling) {
      walk(child);
    }
    
    if (tagName === 'td' || tagName === 'th') {
      text += ' | ';
    }
    
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'article'].includes(tagName)) {
      text += '\n';
    }
  }
  
  walk(element);
  
  // Oczyszczanie z nadmiarowych pustych linii
  return text
    .split('\n')
    .map(line => line.trim())
    .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .trim();
}

/**
 * Pobiera i oczyszcza treść strony internetowej bezpośrednio w przeglądarce.
 * Używa zewnętrznych CORS proxy jako fallbacków oraz natywnego DOMParser.
 */
export async function scrapeWebUrl(url) {
  // 1. Próba pobrania i oczyszczenia przez lokalny backend scraper (brak limitów CORS)
  try {
    console.log("Próba pobrania treści strony przez lokalny backend...");
    const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.rawText && data.rawText.trim().length > 0) {
        console.log("Pomyślnie zaimportowano treść strony przez backend scraper!");
        return { title: data.title || 'Strona WWW', rawText: data.rawText };
      }
    }
  } catch (backendErr) {
    console.warn("Lokalny backend scraper nie odpowiedział, próba bezpośredniego pobrania przez proxy CORS...", backendErr);
  }

  // 2. Fallback: pobieranie bezpośrednio w przeglądarce przy użyciu proxy CORS
  try {
    const html = await fetchWithProxy(url);
    if (!html) throw new Error('Otrzymano pustą odpowiedź ze strony.');

    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Usuń tagi generujące szum informacyjny
    doc.querySelectorAll('script, style, nav, footer, header, iframe, noscript, svg, symbol, ad').forEach(el => el.remove());

    // Pobierz tytuł
    const title = doc.querySelector('title')?.textContent?.trim() || 'Strona WWW';

    // Próba znalezienia głównej treści (article, main, lub po klasach/id)
    const mainContent = doc.querySelector('main, article, #content, .content, .main');
    const contentElement = mainContent || doc.body;

    // Przekształć strukturę HTML na Markdown
    let rawText = htmlToMarkdown(contentElement);

    if (!rawText || rawText.length < 50) {
      rawText = htmlToMarkdown(doc.body);
    }

    // Dodatkowy fallback na zwykły tekst, jeśli markdown parser zwrócił pusty wynik (np. nietypowa struktura tagów)
    if (!rawText || rawText.trim().length === 0) {
      const textFallback = contentElement.innerText || contentElement.textContent || '';
      rawText = textFallback.replace(/\s+/g, ' ').trim();
    }

    if (!rawText || rawText.trim().length === 0) {
      const bodyFallback = doc.body?.innerText || doc.body?.textContent || '';
      rawText = bodyFallback.replace(/\s+/g, ' ').trim();
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Strona nie zawiera czytelnego tekstu. Upewnij się, że nie jest to aplikacja SPA wymagająca JavaScriptu, lub spróbuj wkleić tekst ręcznie.');
    }

    return { title, rawText };
  } catch (err) {
    console.error("Web scraping failed:", err);
    throw new Error(`Nie udało się pobrać treści strony: ${err.message}`);
  }
}
