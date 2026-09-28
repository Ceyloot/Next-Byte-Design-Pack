/* ═══════════════════════════════════════════════════════════════
   TABELA EKSTRAKCJI — te same pytania do każdego źródła osobno

   Wzór: Elicit („pulls the same facts from each one"). NotebookLM ma
   „Tabelę danych", ale to jedna odpowiedź z całego notatnika — nie da
   się jej zadać własnych kolumn ani sprawdzić, skąd jest każda komórka.

   Tu: wpisujesz kolumny („Główna teza", „Liczby", „Zalecenie"…),
   każde źródło dostaje własny wiersz, a każda komórka ma cytat-dowód
   (najedź albo kliknij). Wynik: CSV do arkusza, Markdown albo zapis
   jako dokument Studio.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useMemo, useState } from 'react';
import { X, Table2, Plus, Loader2, Play, Download, Copy, Quote, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';
import { wyciagnijTabele } from './utils/nextScribeAi';
import { pobierzPlik } from './utils/eksport';

const PROPOZYCJE = ['Główna teza', 'Kluczowe liczby', 'Zalecenie', 'Metoda / podejście', 'Ograniczenia', 'Dla kogo'];

function csv(kolumny, wiersze) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [['Źródło', ...kolumny], ...wiersze.map((w) => [w.zrodlo, ...w.komorki.map((c) => c.wartosc)])]
    .map((r) => r.map(esc).join(';')).join('\n');
}

function md(kolumny, wiersze) {
  const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| Źródło | ${kolumny.map(esc).join(' | ')} |`,
    `|${' --- |'.repeat(kolumny.length + 1)}`,
    ...wiersze.map((w) => `| ${esc(w.zrodlo)} | ${w.komorki.map((c) => esc(c.wartosc)).join(' | ')} |`),
  ].join('\n');
}

export default function TabelaEkstrakcji({ projektId, zrodla, apiKeys, onZapiszDoStudio, onZamknij }) {
  const toast = useToast();
  const klucz = `nextscribe_tabela_${projektId}`;
  const zapisana = useMemo(() => { try { return JSON.parse(localStorage.getItem(klucz)) || null; } catch { return null; } }, [klucz]);

  const [kolumny, setKolumny] = useState(zapisana?.kolumny || ['Główna teza', 'Kluczowe liczby']);
  const [nowa, setNowa] = useState('');
  const [wiersze, setWiersze] = useState(zapisana?.wiersze || []);
  const [postep, setPostep] = useState(null);
  const [wybranaKomorka, setWybranaKomorka] = useState(null);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onZamknij(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onZamknij]);

  useEffect(() => {
    try { localStorage.setItem(klucz, JSON.stringify({ kolumny, wiersze })); } catch { /* prywatne okno */ }
  }, [klucz, kolumny, wiersze]);

  const dodajKolumne = (t) => {
    const n = String(t).trim();
    if (!n || kolumny.some((k) => k.toLowerCase() === n.toLowerCase()) || kolumny.length >= 8) return;
    setKolumny((k) => [...k, n]);
    setNowa('');
  };

  const uruchom = async () => {
    setPostep({ zrobione: 0, razem: zrodla.length });
    setWiersze([]);
    try {
      const w = await wyciagnijTabele(apiKeys?.gemini, apiKeys?.model, kolumny, zrodla, (zrobione, razem, czesc) => {
        setPostep({ zrobione, razem });
        setWiersze(czesc);
      });
      setWiersze(w.filter(Boolean));
      toast.success(`Tabela gotowa — ${w.length} źródeł × ${kolumny.length} kolumn.`);
    } catch (e) {
      toast.error(e.message || 'Nie udało się zbudować tabeli.');
    } finally {
      setPostep(null);
    }
  };

  const nieaktualna = wiersze.length > 0 && wiersze[0]?.komorki?.length !== kolumny.length;
  const komorka = wybranaKomorka && wiersze[wybranaKomorka.w]?.komorki[wybranaKomorka.k];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onZamknij(); }}>
      <div className="nbb nbb-tafla !bg-[hsl(var(--card)/0.97)] flex h-full max-h-[860px] w-full max-w-[1240px] flex-col" role="dialog" aria-label="Tabela ekstrakcji">
        <div className="relative flex shrink-0 flex-wrap items-center gap-3 px-5 py-3.5">
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <span className="nb-nav-ikona-akt flex h-8 w-8 items-center justify-center rounded-lg text-primary"><Table2 size={16} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-foreground">Tabela ekstrakcji</h2>
            <p className="text-[11.5px] text-foreground/50">Te same pytania do każdego z {zrodla.length} źródeł — każda komórka z cytatem-dowodem</p>
          </div>
          {wiersze.length > 0 && !postep && (
            <>
              <button type="button" title="Kopiuj jako Markdown" aria-label="Kopiuj jako Markdown" onClick={() => { navigator.clipboard.writeText(md(kolumny, wiersze)); toast.success('Skopiowano tabelę.'); }} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-primary"><Copy size={15} /></button>
              <button type="button" title="Pobierz CSV (Excel, Arkusze)" aria-label="Pobierz CSV" onClick={() => pobierzPlik('tabela-ekstrakcji.csv', `﻿${csv(kolumny, wiersze)}`, 'text/csv;charset=utf-8')} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-primary"><Download size={15} /></button>
              {onZapiszDoStudio && (
                <button type="button" title="Zapisz jako dokument Studio" aria-label="Zapisz w Studio" onClick={() => { onZapiszDoStudio(`Tabela: ${kolumny.join(', ')}`, md(kolumny, wiersze)); toast.success('Zapisano w Studio.'); }} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-primary"><Save size={15} /></button>
              )}
            </>
          )}
          <button type="button" onClick={onZamknij} aria-label="Zamknij" className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground"><X size={16} /></button>
        </div>

        {/* KOLUMNY */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">Kolumny</span>
          {kolumny.map((k) => (
            <span key={k} className="flex h-7 items-center gap-1 rounded-full border border-primary/35 bg-primary/10 pl-3 pr-1 text-[12.5px] text-foreground">
              {k}
              <button type="button" onClick={() => setKolumny((ks) => ks.filter((x) => x !== k))} aria-label={`Usuń kolumnę ${k}`} className="rounded-full p-0.5 text-foreground/45 hover:text-destructive"><X size={12} /></button>
            </span>
          ))}
          <span className="nb-ikona-kafel flex h-7 items-center gap-1 rounded-full pl-2.5 pr-1 focus-within:!border-primary/40">
            <input
              value={nowa}
              onChange={(e) => setNowa(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') dodajKolumne(nowa); }}
              placeholder="Własna kolumna…"
              className="w-32 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-foreground/40"
            />
            <button type="button" onClick={() => dodajKolumne(nowa)} aria-label="Dodaj kolumnę" className="rounded-full p-0.5 text-primary"><Plus size={13} /></button>
          </span>
          {PROPOZYCJE.filter((p) => !kolumny.includes(p)).slice(0, 4).map((p) => (
            <button key={p} type="button" onClick={() => dodajKolumne(p)} className="h-7 rounded-full border border-dashed border-foreground/20 px-2.5 text-[12px] text-foreground/55 hover:border-primary/40 hover:text-foreground">+ {p}</button>
          ))}
          <button
            type="button"
            onClick={uruchom}
            disabled={!!postep || !kolumny.length || !zrodla.length}
            className="ml-auto flex h-8 items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 text-[13px] font-semibold text-foreground hover:bg-primary/25 disabled:opacity-40"
          >
            {postep ? <Loader2 size={14} className="animate-spin text-primary" /> : <Play size={14} className="text-primary" />}
            {postep ? `Czytam ${postep.zrobione}/${postep.razem}…` : wiersze.length ? 'Zbuduj od nowa' : 'Zbuduj tabelę'}
          </button>
        </div>
        {nieaktualna && !postep && <p className="px-5 pb-2 text-[12px] text-amber-400">Kolumny zmieniły się od ostatniego przebiegu — kliknij „Zbuduj od nowa".</p>}

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-auto px-5 pb-5 custom-scrollbar">
            {!wiersze.length && !postep ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Table2 size={28} className="text-foreground/25" />
                <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-foreground/55">
                  Dodaj kolumny i kliknij „Zbuduj tabelę". Każde źródło odpowie na te same pytania osobno — zobaczysz, gdzie się zgadzają, a gdzie różnią.
                </p>
              </div>
            ) : (
              <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {['Źródło', ...kolumny].map((k, i) => (
                      <th key={k} className={cn('border-b border-foreground/10 bg-card/95 px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-foreground/55 backdrop-blur', i === 0 && 'sticky left-0 z-10 w-[220px]')}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wiersze.map((w, wi) => (
                    <tr key={w.zrodloId || wi} className="align-top">
                      <td className="sticky left-0 border-b border-foreground/[0.06] bg-card/90 px-3 py-3 font-medium text-foreground/90 backdrop-blur">{w.zrodlo}</td>
                      {w.komorki.map((c, ki) => {
                        const akt = wybranaKomorka?.w === wi && wybranaKomorka?.k === ki;
                        return (
                          <td key={ki} className="border-b border-foreground/[0.06] p-1">
                            <button
                              type="button"
                              onClick={() => setWybranaKomorka(akt ? null : { w: wi, k: ki })}
                              className={cn('w-full rounded-lg px-2 py-2 text-left leading-snug transition-colors', akt ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-foreground/[0.04]', c.wartosc === '—' ? 'text-foreground/30' : 'text-foreground/85')}
                            >
                              {c.wartosc}
                              {c.cytat && <Quote size={10} className="ml-1 inline text-primary/50" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {postep && wiersze.length < postep.razem && (
                    <tr><td colSpan={kolumny.length + 1} className="px-3 py-3 text-[12.5px] text-foreground/45"><Loader2 size={13} className="mr-2 inline animate-spin" />Czytam kolejne źródła…</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <aside className="hidden w-[300px] shrink-0 border-l border-foreground/[0.08] px-5 py-4 xl:block">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Dowód</p>
            {komorka ? (
              <div className="mt-3 space-y-3">
                <p className="text-[12px] text-foreground/50">{wiersze[wybranaKomorka.w].zrodlo} · {kolumny[wybranaKomorka.k]}</p>
                <p className="text-[14px] font-medium text-foreground">{komorka.wartosc}</p>
                {komorka.cytat ? (
                  <blockquote className="nb-ikona-kafel rounded-xl p-3 text-[13px] italic leading-relaxed text-foreground/80">„{komorka.cytat}”</blockquote>
                ) : (
                  <p className="text-[12.5px] text-foreground/45">Źródło nie zawiera tej informacji.</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/50">Kliknij komórkę, żeby zobaczyć cytat, na którym się opiera.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
