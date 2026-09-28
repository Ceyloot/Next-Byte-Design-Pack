/* ═══════════════════════════════════════════════════════════════
   ODKRYJ ŹRÓDŁA W SIECI — sekcja okna „Dodaj źródła"

   Pusty notatnik to największa bariera na starcie (Jeff Su: od
   listopada 2025 NotebookLM sam buduje listę źródeł z sieci i to
   „usuwa problem pustego notatnika"). Tu: temat → AI z wyszukiwarką
   Google proponuje 6–10 źródeł z uzasadnieniem → zaznaczasz →
   adresy trafiają do pola linków i dodają się zwykłą ścieżką
   (transkrypcja YouTube / czytanie strony po stronie serwera).
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Globe, Search, Loader2, Check, ChevronDown, Video as Youtube, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { znajdzZrodla } from './utils/nextScribeAi';

export default function OdkryjZrodla({ apiKeys, juzSa = [], onDodajLinki }) {
  const [otwarte, setOtwarte] = useState(false);
  const [temat, setTemat] = useState('');
  const [wyniki, setWyniki] = useState(null);
  const [wybrane, setWybrane] = useState(new Set());
  const [szukam, setSzukam] = useState(false);
  const [blad, setBlad] = useState('');

  const szukaj = async () => {
    if (!temat.trim() || szukam) return;
    setSzukam(true); setBlad(''); setWyniki(null);
    try {
      const lista = await znajdzZrodla(apiKeys?.gemini, apiKeys?.model, temat.trim(), { juzSa });
      setWyniki(lista);
      setWybrane(new Set(lista.map((_, i) => i)));
      if (!lista.length) setBlad('Nie znalazłem pewnych źródeł — spróbuj sformułować temat inaczej.');
    } catch (e) {
      setBlad(e.message);
    } finally {
      setSzukam(false);
    }
  };

  const dodaj = () => {
    const linki = [...wybrane].map((i) => wyniki[i].url);
    if (!linki.length) return;
    onDodajLinki(linki);
    setWyniki(null);
    setTemat('');
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOtwarte((v) => !v)}
        aria-expanded={otwarte}
        className="nb-nav-pozycja group flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-[13px] text-foreground/[0.88] hover:text-foreground"
      >
        <span className="nb-nav-ikona flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/60">
          <Globe size={15} />
        </span>
        <span className="flex-1">Znajdź źródła w sieci</span>
        <span className="text-[10.5px] font-medium text-primary/80">AI</span>
        <ChevronDown size={14} className={cn('text-foreground/40 transition-transform', otwarte && 'rotate-180')} />
      </button>

      {otwarte && (
        <div className="nb-ikona-kafel mt-1.5 rounded-xl p-2">
          <div className="flex items-center gap-2">
            <Search size={14} className="ml-1 shrink-0 text-foreground/45" />
            <input
              autoFocus
              value={temat}
              onChange={(e) => setTemat(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); szukaj(); } }}
              placeholder="Temat, np. „technika hamowania w wyścigach GT3”"
              className="min-w-0 flex-1 bg-transparent py-1 text-[13px] text-foreground outline-none placeholder:text-foreground/40"
            />
            <button
              type="button"
              onClick={szukaj}
              disabled={!temat.trim() || szukam}
              className="flex h-7 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 text-[12px] font-semibold text-foreground hover:bg-primary/25 disabled:opacity-40"
            >
              {szukam ? <Loader2 size={12} className="animate-spin text-primary" /> : <Globe size={12} className="text-primary" />}
              {szukam ? 'Szukam…' : 'Szukaj'}
            </button>
          </div>

          {blad && <p className="mt-2 px-1 text-[12px] text-destructive">{blad}</p>}

          {wyniki?.length > 0 && (
            <>
              <ul className="mt-2 max-h-64 space-y-0.5 overflow-y-auto pr-1 custom-scrollbar">
                {wyniki.map((w, i) => {
                  const zazn = wybrane.has(i);
                  const Ik = /youtu/.test(w.url) ? Youtube : FileText;
                  let host = '';
                  try { host = new URL(w.url).hostname.replace(/^www\./, ''); } catch { /* zły adres */ }
                  return (
                    <li key={w.url}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setWybrane((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                        onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.05]"
                      >
                        <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border', zazn ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/30')}>
                          {zazn && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <Ik size={12} className={/youtu/.test(w.url) ? 'shrink-0 text-red-400' : 'shrink-0 text-foreground/45'} />
                            <span className="truncate text-[13px] font-medium text-foreground">{w.tytul}</span>
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-foreground/60">{w.dlaczego}</span>
                          <a href={w.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground/40 hover:text-primary">
                            {host} <ExternalLink size={10} />
                          </a>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-foreground/[0.07] px-1 pt-2">
                <span className="text-[11.5px] text-foreground/45">Zaznaczone trafią do pola linków powyżej</span>
                <button type="button" onClick={dodaj} disabled={!wybrane.size} className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[12px] font-semibold text-foreground hover:bg-primary/25 disabled:opacity-40">
                  Przenieś {wybrane.size}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
