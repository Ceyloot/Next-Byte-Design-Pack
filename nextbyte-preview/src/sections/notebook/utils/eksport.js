/* ═══════════════════════════════════════════════════════════════
   EKSPORT — notatnik i pojedyncze teksty do Markdown z przypisami

   Skarga nr 1 na NotebookLM: „nie ma eksportu, a przy kopiowaniu
   cytaty nie przechodzą jako odnośniki". Tu cytat z odpowiedzi AI
   staje się przypisem Markdown ([^1]) z nazwą źródła, znacznikiem
   czasu i linkiem do filmu w odpowiedniej sekundzie — działa w
   Obsidianie, Notion, GitHubie, Typorze i przy wklejaniu do Worda
   przez konwerter.
   ═══════════════════════════════════════════════════════════════ */

import { bibliografia as zbudujBibliografie, STYLE } from './bibliografia';

const DATA = () => new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

function czasNaSekundy(t) {
  if (!t) return null;
  const cz = String(t).split(':').map(Number);
  if (cz.some(Number.isNaN)) return null;
  return cz.reduce((acc, x) => acc * 60 + x, 0);
}

/** Link do miejsca w źródle: YouTube z `&t=`, strona WWW wprost, plik — bez linku. */
export function linkDoZrodla(zrodlo, timeStr) {
  if (!zrodlo) return '';
  if (zrodlo.type === 'youtube' && zrodlo.videoId) {
    const s = czasNaSekundy(timeStr);
    return `https://www.youtube.com/watch?v=${zrodlo.videoId}${s ? `&t=${s}s` : ''}`;
  }
  return zrodlo.url || zrodlo.sourceUrl || '';
}

function znajdzZrodlo(zrodla, cytat) {
  return zrodla.find((s) => s.id === cytat.sourceId || s.videoId === cytat.sourceId)
    || (cytat.sourceTitle ? zrodla.find((s) => s.title?.toLowerCase().includes(cytat.sourceTitle.toLowerCase().slice(0, 18))) : null);
}

/**
 * Zamienia markery [N] w tekście odpowiedzi na przypisy [^p-N] i dopisuje ich treść.
 * `prefiks` pozwala mieć wiele odpowiedzi w jednym pliku bez kolizji numerów.
 */
export function tekstZPrzypisami(tekst, cytaty = [], zrodla = [], prefiks = '') {
  /* Drugi format cytatu, który model zapisuje wprost w tekście: [idŹródła, 1:23]
     albo [Tytuł, 1:23]. Też staje się przypisem — z linkiem w tę sekundę filmu. */
  const wTekscie = [];
  let tresc0 = String(tekst || '').replace(/\[([^\]\n]{2,80}?),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (m, kto, czas) => {
    const z = zrodla.find((s) => s.videoId === kto.trim() || s.id === kto.trim())
      || zrodla.find((s) => s.title?.toLowerCase().includes(kto.trim().toLowerCase().slice(0, 18)));
    if (!z) return m;
    wTekscie.push({ z, czas });
    return `[^${prefiks}t${wTekscie.length}]`;
  });
  const przypisyWTekscie = wTekscie.map(({ z, czas }, i) => {
    const link = linkDoZrodla(z, czas);
    return `[^${prefiks}t${i + 1}]: ${link ? `[${z.title}, ${czas}](${link})` : `${z.title}, ${czas}`}`;
  });
  if (!cytaty.length) return przypisyWTekscie.length ? `${tresc0}\n\n${przypisyWTekscie.join('\n')}` : tresc0;
  tekst = tresc0;
  const uzyte = new Set();
  const tresc = tekst.replace(/\[(\d+)\]/g, (m, n) => {
    const i = Number(n) - 1;
    if (!cytaty[i]) return m;
    uzyte.add(i);
    return `[^${prefiks}${n}]`;
  });
  const przypisy = [...uzyte].sort((a, b) => a - b).map((i) => {
    const c = cytaty[i];
    const z = znajdzZrodlo(zrodla, c);
    const tytul = z?.title || c.sourceTitle || 'Źródło';
    const link = linkDoZrodla(z, c.timeStr);
    const czas = c.timeStr ? `, ${c.timeStr}` : '';
    const cytat = c.quote ? ` — „${String(c.quote).trim()}”` : '';
    return `[^${prefiks}${i + 1}]: ${link ? `[${tytul}${czas}](${link})` : `${tytul}${czas}`}${cytat}`;
  });
  return `${tresc}\n\n${[...przypisy, ...przypisyWTekscie].join('\n')}`;
}

function sekcja(tytul, tresc) {
  return tresc && tresc.trim() ? `\n## ${tytul}\n\n${tresc.trim()}\n` : '';
}

/**
 * Cały notatnik w jednym pliku .md — źródła, notatki, szkice, dokumenty Studio, rozmowa.
 * Kolejność: od tego, co użytkownik zrobił sam (notatki, szkice), do tego, co wygenerowało AI.
 */
export function notatnikDoMarkdown({ nazwa, zrodla = [], notatki = [], szkice = [], studio = [], czat = [], zadania = [], stylBibliografii = 'apa' }) {
  const glowka = `# ${nazwa || 'Notatnik'}\n\n_Wyeksportowano z Next Scribe · ${DATA()} · ${zrodla.length} źródeł_\n`;

  const listaZrodel = zrodla.map((z, i) => {
    const link = linkDoZrodla(z);
    const typ = z.type === 'youtube' ? 'film' : (z.fileKind || 'tekst');
    return `${i + 1}. ${link ? `[${z.title}](${link})` : z.title} · ${typ}`;
  }).join('\n');

  const listaNotatek = [...notatki]
    .sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned))
    .map((n) => `- ${n.isPinned ? '📌 ' : ''}${String(n.text || '').replace(/\n+/g, ' ')}`)
    .join('\n');

  const listaSzkicow = szkice.map((s, i) => {
    const akapity = s.akapity.map((a) => a.tekst).join('\n\n');
    const zweryfikowane = s.akapity.filter((a) => a.wynik && a.wynik.status !== 'niesprawdzone');
    const potwierdzone = zweryfikowane.filter((a) => a.wynik.status === 'potwierdzone').length;
    const stopka = zweryfikowane.length
      ? `\n\n_Pokrycie w źródłach: ${potwierdzone}/${s.akapity.length} akapitów potwierdzonych._`
      : '';
    return `### ${s.tytul || `Szkic ${i + 1}`}\n\n${akapity}${stopka}`;
  }).join('\n\n');

  const listaStudio = studio.filter((o) => o.content).map((o) => `### ${o.title}\n\n${o.content}`).join('\n\n');

  let nrOdp = 0;
  const rozmowa = czat.filter((m) => !m.hiddenPrompt || m.role === 'model').map((m) => {
    if (m.role === 'user') return `**Ty:** ${m.content}`;
    nrOdp += 1;
    return `**Next Scribe:** ${tekstZPrzypisami(m.content || '', m.citations || [], zrodla, `o${nrOdp}-`)}`;
  }).join('\n\n');

  return [
    glowka,
    sekcja('Źródła', listaZrodel),
    sekcja('Notatki', listaNotatek),
    sekcja('Szkice', listaSzkicow),
    sekcja('Dokumenty Studio', listaStudio),
    sekcja('Zadania', zadania.map((t) => `- [${t.zrobione ? 'x' : ' '}] ${t.tekst}`).join('\n')),
    sekcja('Rozmowa', rozmowa),
    sekcja(`Bibliografia (${STYLE.find((x) => x.id === stylBibliografii)?.nazwa || 'APA 7'})`, zbudujBibliografie(zrodla, stylBibliografii)),
  ].join('');
}

/** Pobranie pliku bez serwera. */
export function pobierzPlik(nazwa, tresc, typ = 'text/markdown;charset=utf-8') {
  const bezpieczna = String(nazwa || 'notatnik').replace(/[/\\?%*:|"<>]/g, '-').trim() || 'notatnik';
  const blob = new Blob([tresc], { type: typ });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Rozszerzenie tylko gdy go brak — CSV ma zostać CSV, nie „.csv.md".
  a.download = /\.[a-z0-9]{2,4}$/i.test(bezpieczna) ? bezpieczna : `${bezpieczna}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
