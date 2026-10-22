import pptxgen from 'pptxgenjs';

// Parse AI slide deck markdown:
// ## Slajd N: Title
// - bullet
// *Notatki prelegenta: ...*
export function parseSlideDeck(markdown) {
  const slides = [];
  // Split on "## Slajd" boundaries
  const sections = markdown.split(/(?=^## Slajd\s*\d+\s*[:\-])/m);

  for (const section of sections) {
    const lines = section.split('\n');
    const titleLine = lines[0].trim();
    const m = titleLine.match(/^##\s+Slajd\s*\d+\s*[:\-]\s*(.+)$/i);
    if (!m) continue;
    const title = m[1].trim();

    const bullets = [];
    let notes = '';
    let inNotes = false;
    let notesAcc = '';

    for (let i = 1; i < lines.length; i++) {
      const l = lines[i];
      const lt = l.trim();
      if (!lt) continue;

      // Notes line: *Notatki prelegenta: ...*  or  *Notes: ...*
      const notesMatch = lt.match(/^\*(?:Notatki prelegenta|Speaker notes|Notes)\s*[:\-]\s*(.+)\*?$/i);
      if (notesMatch) { notes = notesMatch[1].replace(/\*$/, '').trim(); inNotes = false; continue; }

      // Italic-only line that could be notes continuation
      if (lt.startsWith('*') && lt.endsWith('*') && lt.length > 2) {
        const inner = lt.slice(1, -1).trim();
        if (!bullets.length || inner.length > 30) { notes = inner; continue; }
      }

      const bullet = lt.replace(/^[\-\*•]\s+/, '').trim();
      if (bullet) bullets.push(bullet);
    }

    slides.push({ title, bullets, notes });
  }
  return slides;
}

export function exportToPptx(slides, deckTitle = 'Prezentacja') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9

  // Theme colors
  const C = {
    bg: '0B0C12',
    card: '13141C',
    primary: '70BEFA',
    text: 'E8EAF0',
    muted: '7A7F96',
    border: '2A2D3E',
    titleSlide: '070809',
  };

  // ── Slide master: dark background ──
  pptx.defineSlideMaster({
    title: 'MASTER',
    background: { color: C.bg },
  });

  // ── Title slide (first slide) ──
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: C.titleSlide };

  // Accent bar top
  titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: C.primary } });

  titleSlide.addText(deckTitle, {
    x: 0.7, y: 2.4, w: 8.6, h: 1.4,
    fontSize: 36, bold: true, color: C.text,
    fontFace: 'Calibri', align: 'left', valign: 'middle',
  });
  titleSlide.addShape(pptx.ShapeType.rect, { x: 0.7, y: 3.9, w: 1.2, h: 0.04, fill: { color: C.primary } });

  // ── Content slides ──
  slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    s.background = { color: C.bg };

    // Top accent line
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.04, fill: { color: C.primary } });

    // Slide number badge
    s.addText(`${idx + 1}`, {
      x: 8.9, y: 0.18, w: 0.4, h: 0.3,
      fontSize: 8, color: C.muted, fontFace: 'Calibri', align: 'right',
    });

    // Title
    s.addText(slide.title, {
      x: 0.5, y: 0.22, w: 8.5, h: 0.8,
      fontSize: 22, bold: true, color: C.text, fontFace: 'Calibri',
    });

    // Divider
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.05, w: 8.5, h: 0.015, fill: { color: C.border } });

    // Bullets
    if (slide.bullets.length > 0) {
      const bulletObjs = slide.bullets.map(b => ({
        text: b,
        options: { bullet: { type: 'bullet', characterCode: '25CF', fontSize: 6 }, indentLevel: 0 },
      }));
      s.addText(bulletObjs, {
        x: 0.6, y: 1.25, w: 8.3, h: 3.8,
        fontSize: 14, color: C.text, fontFace: 'Calibri',
        valign: 'top', paraSpaceAfter: 10, lineSpacingMultiple: 1.3,
      });
    }

    // Speaker notes
    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  });

  // ── Final summary slide ──
  const last = pptx.addSlide();
  last.background = { color: C.titleSlide };
  last.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: C.primary } });
  last.addText('Dziękuję', {
    x: 0.7, y: 2.6, w: 8.6, h: 1.0,
    fontSize: 32, bold: true, color: C.text, fontFace: 'Calibri',
  });

  return pptx.writeFile({ fileName: `${deckTitle.replace(/[^a-z0-9]/gi, '_')}.pptx` });
}

// Detect if content looks like a slide deck
export function isSlideDeck(content) {
  return /## Slajd\s*\d+/i.test(content) && (content.match(/## Slajd/gi) || []).length >= 2;
}
