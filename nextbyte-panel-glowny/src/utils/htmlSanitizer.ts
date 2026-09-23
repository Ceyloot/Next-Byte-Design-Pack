import DOMPurify from 'dompurify';

/**
 * Security utility for sanitizing HTML content to prevent XSS attacks
 * Uses DOMPurify library with strict configuration
 */

/*
  HAKI REJESTROWANE RAZ (naprawa 03.09.2026).

  `DOMPurify` jest singletonem, a `addHook` DOKŁADA kolejny hak do listy —
  nie zastępuje poprzedniego. Ta funkcja była wołana przy KAŻDYM wywołaniu
  `sanitizeHtml`, czyli przy każdym renderze każdej wiadomości czatu. Po
  godzinie rozmowy każdy węzeł HTML przechodził przez setki identycznych
  haków. Wynik był poprawny (haki są idempotentne), ale koszt rósł liniowo
  z liczbą renderów. Teraz instancja z hakami powstaje raz i jest
  zapamiętana.
*/
let purifyZHakami: typeof DOMPurify | null = null;

// Configure DOMPurify with strict security settings
const createDOMPurifyInstance = () => {
  if (purifyZHakami) return purifyZHakami;
  const purify = DOMPurify;
  
  // Add hooks for additional security
  purify.addHook('afterSanitizeAttributes', (node) => {
    // Remove any remaining javascript: protocols
    if (node.hasAttribute('href')) {
      const href = node.getAttribute('href');
      if (href && href.toLowerCase().startsWith('javascript:')) {
        node.removeAttribute('href');
      }
    }
    
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (href.startsWith('#')) {
        /* Kotwica W TEJ SAMEJ stronie — przypisy `[^1]` z formattera
           (`href="#fn-1"` ↔ `id="fnref-1"`). Wymuszone `target="_blank"`
           otwierało dla nich NOWĄ KARTĘ z tą samą rozmową zamiast
           przeskoczyć do przypisu. Zewnętrzne linki dalej idą w nową kartę. */
        node.removeAttribute('target');
        node.removeAttribute('rel');
      } else {
        // Ensure all links open in new tab for security
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }

    /* `<input>` przechodzi WYŁĄCZNIE jako wyłączona kratka listy zadań
       (`- [x]` z formattera). Cokolwiek innego — pole tekstowe, submit,
       file — zostaje sprowadzone do tej samej nieaktywnej kratki, więc
       z treści odpowiedzi nie da się zbudować formularza. */
    if (node.tagName === 'INPUT') {
      node.setAttribute('type', 'checkbox');
      node.setAttribute('disabled', '');
    }
  });
  
  purifyZHakami = purify;
  return purify;
};

/**
 * Sanitize HTML content with strict security settings
 * Use this for any user-generated HTML content
 */
export const sanitizeHtml = (dirty: string): string => {
  if (!dirty) return '';
  
  const purify = createDOMPurifyInstance();
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'pre', 'code', 'span', 'div', 'table', 'thead', 
      'tbody', 'tr', 'th', 'td', 'button', 'svg', 'path', 'rect',
      /*
        TAGI, KTÓRE EMITUJE `markdownFormatter` (audyt Chat AI 03.09.2026).

        Formatter renderował je poprawnie, a sanitizer wycinał w następnym
        kroku — użytkownik widział skutek, nie przyczynę: linia `---` znikała
        (`hr`), `~~tekst~~` tracił przekreślenie (`del`), `- [x]` nie miał
        kratki (`input`), przypis `[^1]` tracił indeks górny (`sup`), a blok
        przypisów gubił kontener (`section`). `polyline` i `line` to ikona
        „Pobierz" w stopce bloku kodu — bez nich przycisk był pusty.
        `input` ma osobnego strażnika w haku wyżej (tylko wyłączona kratka).
      */
      'hr', 'sup', 'sub', 'del', 'input', 'section', 'polyline', 'line'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 
      'id', 'style', 'width', 'height', 'data-lang', 'data-code',
      // kratka listy zadań (`- [x]`) i numer startowy listy (`3. …` → <ol start="3">)
      'type', 'checked', 'disabled', 'start',
      // SVG attributes
      'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 
      'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'rx', 'ry',
      'points', 'x1', 'y1', 'x2', 'y2'
    ],
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Sanitize HTML for email templates (more permissive for styling)
 */
export const sanitizeEmailHtml = (dirty: string): string => {
  if (!dirty) return '';
  
  const purify = createDOMPurifyInstance();
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'pre', 'code', 'span', 'div', 'table', 'thead', 
      'tbody', 'tr', 'th', 'td', 'style'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 
      'id', 'style', 'width', 'height', 'align', 'border', 
      'cellpadding', 'cellspacing', 'bgcolor'
    ],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize lesson content (allows more formatting)
 */
export const sanitizeLessonContent = (dirty: string): string => {
  if (!dirty) return '';
  
  const purify = createDOMPurifyInstance();
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'pre', 'code', 'span', 'div', 'table', 'thead', 
      'tbody', 'tr', 'th', 'td', 'iframe', 'video', 'mark',
      'hr', 'sub', 'sup', 'label', 'input'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 
      'id', 'style', 'width', 'height', 'frameborder', 'allowfullscreen',
      'data-color', 'data-type', 'data-checked', 'type', 'checked'
    ],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Strip all HTML tags (for plain text extraction)
 */
export const stripHtml = (dirty: string): string => {
  if (!dirty) return '';
  
  const purify = createDOMPurifyInstance();
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * React component helper to safely render HTML
 */
export const createSafeHtml = (dirty: string) => {
  return { __html: sanitizeHtml(dirty) };
};

export const createSafeEmailHtml = (dirty: string) => {
  return { __html: sanitizeEmailHtml(dirty) };
};

export const createSafeLessonHtml = (dirty: string) => {
  return { __html: sanitizeLessonContent(dirty) };
};
