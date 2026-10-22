/* ═══════════════════════════════════════════════════════════════
   SZUKAJ I PYTAJ WE WSZYSTKICH NOTATNIKACH

   Dwie skargi na NotebookLM naraz (XDA, Atlas, Substack):
     • „nie ma globalnego wyszukiwania — po kilku projektach nie da się
       odnaleźć, gdzie coś było",
     • „notatniki nie widzą się nawzajem — nie da się zadać pytania
       ponad nimi".
   Jedno okno robi obie rzeczy. Pisanie filtruje od razu (tytuły
   źródeł, treść, notatki) — bez AI, bez czekania. Enter albo
   „Zapytaj AI" wysyła pytanie do wybranych notatników i zwraca
   odpowiedź z cytatami, które mówią, z KTÓREGO notatnika pochodzą.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Library, FileText, StickyNote, Sparkles, Loader2, ArrowRight, Video as Youtube, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjects, getSources, getNotes } from './utils/api';
import { zapytajWszystkieNotatniki } from './utils/nextScribeAi';
import MarkdownRenderer from './MarkdownRenderer';

const LIMIT_WYNIKOW = 40;

function fragment(tekst, fraza, dl = 150) {
  const t = String(tekst || '');
  const i = t.toLowerCase().indexOf(fraza.toLowerCase());
  if (i < 0) return '';
  const start = Math.max(0, i - 50);
  return (start > 0 ? '…' : '') + t.slice(start, start + dl).replace(/\s+/g, ' ') + (start + dl < t.length ? '…' : '');
}

function Podswietl({ tekst, fraza }) {
  if (!fraza) return tekst;
  const i = tekst.toLowerCase().indexOf(fraza.toLowerCase());
  if (i < 0) return tekst;
  return (
    <>
      {tekst.slice(0, i)}
      <mark className="rounded-sm bg-primary/25 px-0.5 text-foreground">{tekst.slice(i, i + fraza.length)}</mark>
      {tekst.slice(i + fraza.length)}
    </>
  );
}

export default function SzukajWszedzie({ aktywnyProjektId, aktywneZrodla, aktywneNotatki, apiKeys, onPrzejdz, onZamknij }) {
  const [fraza, setFraza] = useState('');
  const [notatniki, setNotatniki] = useState(null); // null = ładuję
  const [wybrane, setWybrane] = useState(null); // Set id; null = wszystkie
  const [pytam, setPytam] = useState(false);
  const [odpowiedz, setOdpowiedz] = useState(null);
  const [blad, setBlad] = useState('');
  const pole = useRef(null);

  useEffect(() => { pole.current?.focus(); }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onZamknij?.(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onZamknij]);

  // Wszystkie notatniki z magazynu; bieżący bierzemy z żywego stanu (może mieć niezapisane zmiany).
  useEffect(() => {
    let zyje = true;
    (async () => {
      const rows = await getProjects().catch(() => []);
      const pelne = await Promise.all(rows.map(async (r) => {
        if (r.id === aktywnyProjektId) return { id: r.id, name: r.name, sources: aktywneZrodla, notes: aktywneNotatki };
        const [sources, notes] = await Promise.all([getSources(r.id).catch(() => []), getNotes(r.id).catch(() => [])]);
        return { id: r.id, name: r.name, sources: sources || [], notes: notes || [] };
      }));
      if (!pelne.some((n) => n.id === aktywnyProjektId)) pelne.unshift({ id: aktywnyProjektId, name: 'Bieżący notatnik', sources: aktywneZrodla, notes: aktywneNotatki });
      if (zyje) setNotatniki(pelne);
    })();
    return () => { zyje = false; };
  }, [aktywnyProjektId, aktywneZrodla, aktywneNotatki]);

  const zakres = useMemo(() => (notatniki || []).filter((n) => !wybrane || wybrane.has(n.id)), [notatniki, wybrane]);

  const wyniki = useMemo(() => {
    const f = fraza.trim();
    if (f.length < 2) return [];
    const out = [];
    for (const n of zakres) {
      if (n.name?.toLowerCase().includes(f.toLowerCase())) out.push({ rodzaj: 'notatnik', notatnik: n, tytul: n.name, opis: `${n.sources.length} źródeł` });
      for (const z of n.sources) {
        const wTytule = z.title?.toLowerCase().includes(f.toLowerCase());
        const frag = fragment(z.rawText, f);
        if (wTytule || frag) out.push({ rodzaj: 'zrodlo', notatnik: n, zrodlo: z, tytul: z.title, opis: frag || (z.author || '') });
      }
      for (const x of n.notes) {
        const frag = fragment(x.text, f);
        if (frag) out.push({ rodzaj: 'notatka', notatnik: n, tytul: 'Notatka', opis: frag });
      }
      if (out.length > LIMIT_WYNIKOW) break;
    }
    return out.slice(0, LIMIT_WYNIKOW);
  }, [fraza, zakres]);

  const zapytaj = async () => {
    const f = fraza.trim();
    if (!f || pytam) return;
    setPytam(true); setBlad(''); setOdpowiedz(null);
    try {
      setOdpowiedz(await zapytajWszystkieNotatniki(apiKeys?.gemini, apiKeys?.model, f, zakres));
    } catch (e) {
      setBlad(e.message || 'Nie udało się uzyskać odpowiedzi.');
    } finally {
      setPytam(false);
    }
  };

  const przelacz = (id) => setWybrane((w) => {
    const baza = new Set(w || (notatniki || []).map((n) => n.id));
    if (baza.has(id)) baza.delete(id); else baza.add(id);
    return baza.size === (notatniki || []).length ? null : baza;
  });

  const liczbaZrodel = zakres.reduce((s, n) => s + n.sources.length, 0);

  return (
    <div className="fixed inset-0 z-[80] flex justify-center bg-black/45 px-4 pt-[10vh] backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onZamknij?.(); }}>
      <div className="nbb nbb-tafla !bg-[hsl(var(--card)/0.97)] flex max-h-[78vh] w-full max-w-[760px] flex-col" role="dialog" aria-label="Szukaj we wszystkich notatnikach">
        {/* POLE */}
        <div className="relative flex shrink-0 items-center gap-3 px-4 py-3.5">
          <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <Search size={18} className="shrink-0 text-foreground/50" />
          <input
            ref={pole}
            value={fraza}
            onChange={(e) => { setFraza(e.target.value); setOdpowiedz(null); setBlad(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') zapytaj(); }}
            placeholder="Szukaj albo zapytaj wszystkie notatniki…"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-foreground/35"
          />
          <button
            type="button"
            onClick={zapytaj}
            disabled={!fraza.trim() || pytam || !notatniki}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-primary/25 disabled:opacity-40"
          >
            {pytam ? <Loader2 size={13} className="animate-spin text-primary" /> : <Sparkles size={13} className="text-primary" />}
            Zapytaj AI
            <CornerDownLeft size={12} className="text-foreground/40" />
          </button>
          <button type="button" onClick={onZamknij} aria-label="Zamknij" className="nb-ikona-kafel flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground">
            <X size={15} />
          </button>
        </div>

        {/* ZAKRES — które notatniki biorą udział */}
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-4 py-2.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">Zakres</span>
          {!notatniki ? (
            <span className="flex items-center gap-1.5 text-[12px] text-foreground/50"><Loader2 size={12} className="animate-spin" /> Wczytuję notatniki…</span>
          ) : notatniki.map((n) => {
            const wl = !wybrane || wybrane.has(n.id);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => przelacz(n.id)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors',
                  wl ? 'border-primary/35 bg-primary/10 text-foreground' : 'border-foreground/10 text-foreground/45 hover:text-foreground/75',
                )}
              >
                <Library size={12} className={wl ? 'text-primary' : ''} />
                {n.name}
                <span className="tabular-nums text-foreground/40">{n.sources.length}</span>
              </button>
            );
          })}
          {notatniki && <span className="ml-auto text-[11.5px] tabular-nums text-foreground/40">{liczbaZrodel} źródeł w zakresie</span>}
        </div>

        {/* WYNIKI */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 custom-scrollbar">
          {(pytam || odpowiedz || blad) && (
            <div className="mx-2 mb-3 mt-1 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                <Sparkles size={12} /> Odpowiedź z {zakres.length} {zakres.length === 1 ? 'notatnika' : 'notatników'}
              </div>
              {pytam && <p className="flex items-center gap-2 text-[13.5px] text-foreground/60"><Loader2 size={14} className="animate-spin" /> Czytam notatniki i szukam połączeń…</p>}
              {blad && <p className="text-[13.5px] text-destructive">{blad}</p>}
              {odpowiedz && (
                <>
                  <div className="text-[14px] leading-relaxed text-foreground/90">
                    <MarkdownRenderer content={odpowiedz.odpowiedz} />
                  </div>
                  {odpowiedz.cytaty.length > 0 && (
                    <ol className="mt-3 space-y-1.5 border-t border-foreground/[0.08] pt-3">
                      {odpowiedz.cytaty.map((c, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => onPrzejdz?.(c.notatnikId)}
                            className="group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-foreground/[0.05]"
                          >
                            <span className="mt-px shrink-0 rounded bg-primary/15 px-1.5 text-[10.5px] font-bold tabular-nums text-primary">{i + 1}</span>
                            <span className="min-w-0 flex-1">
                              <span className="font-medium text-foreground/85">{c.notatnik}</span>
                              <span className="text-foreground/45"> · {c.zrodlo}</span>
                              {c.cytat && <span className="mt-0.5 block italic text-foreground/60">„{c.cytat}”</span>}
                            </span>
                            <ArrowRight size={13} className="mt-0.5 shrink-0 text-foreground/25 group-hover:text-primary" />
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}
            </div>
          )}

          {fraza.trim().length >= 2 && wyniki.length === 0 && notatniki && !odpowiedz && !pytam && (
            <p className="px-4 py-6 text-center text-[13px] text-foreground/50">
              Nic nie pasuje dosłownie. Naciśnij Enter — AI poszuka po znaczeniu.
            </p>
          )}

          {wyniki.length > 0 && (
            <ul className="space-y-0.5">
              {wyniki.map((w, i) => {
                const Ik = w.rodzaj === 'notatnik' ? Library : w.rodzaj === 'notatka' ? StickyNote : w.zrodlo?.type === 'youtube' ? Youtube : FileText;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onPrzejdz?.(w.notatnik.id, w.zrodlo?.id)}
                      className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.05]"
                    >
                      <span className="nb-nav-ikona mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/60 group-hover:text-primary">
                        <Ik size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[14px] font-medium text-foreground"><Podswietl tekst={w.tytul || ''} fraza={fraza.trim()} /></span>
                          <span className="shrink-0 text-[11.5px] text-foreground/40">{w.notatnik.name}</span>
                        </span>
                        {w.opis && <span className="mt-0.5 block text-[12.5px] leading-snug text-foreground/55"><Podswietl tekst={w.opis} fraza={fraza.trim()} /></span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {fraza.trim().length < 2 && !odpowiedz && (
            <div className="px-4 py-6 text-[13px] leading-relaxed text-foreground/50">
              <p>Pisz, żeby przeszukać tytuły, treść źródeł i notatki we wszystkich notatnikach.</p>
              <p className="mt-1.5">Enter wysyła pytanie do AI — odpowie na podstawie zaznaczonych notatników i pokaże, gdzie się uzupełniają albo sobie przeczą.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
