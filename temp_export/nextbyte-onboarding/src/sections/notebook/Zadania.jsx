/* ═══════════════════════════════════════════════════════════════
   ZADANIA Z ROZMOWY

   Skarga (XDA, „NotebookLM feels powerful until…"): rozmowa ujawnia
   luki i kolejne kroki, ale nie ma ich gdzie zapisać — ludzie trzymają
   równoległą listę w innej aplikacji.

   Dwa elementy:
     • DodajZadanie — pod odpowiedzią AI: własne zadanie jednym Enterem
       albo „Zaproponuj" (AI wyciąga 2–5 kroków z tej odpowiedzi),
     • PanelZadan — lista zadań notatnika: odhaczanie, edycja w miejscu,
       usuwanie, skok do odpowiedzi, z której zadanie powstało.
   Każde zadanie pamięta id wiadomości, więc zawsze wiadomo, SKĄD jest.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useRef, useState } from 'react';
import { Check, Plus, Sparkles, Loader2, Trash2, CornerDownRight, X, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zaproponujZadania } from './utils/nextScribeAi';

export const noweZadanie = (tekst, zrodloWiadomosci = null) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
  tekst: String(tekst).trim(),
  zrobione: false,
  zrodloWiadomosci,
  utworzono: new Date().toISOString(),
});

/* ── Pod odpowiedzią ─────────────────────────────────────────────── */
export function DodajZadanie({ pytanie, odpowiedz, idWiadomosci, apiKeys, onDodaj, onZamknij }) {
  const [tekst, setTekst] = useState('');
  const [propozycje, setPropozycje] = useState(null);
  const [wybrane, setWybrane] = useState(new Set());
  const [laduje, setLaduje] = useState(false);
  const [blad, setBlad] = useState('');
  const pole = useRef(null);
  useEffect(() => { pole.current?.focus(); }, []);

  const zapisz = () => {
    const z = [];
    if (tekst.trim()) z.push(tekst.trim());
    if (propozycje) wybrane.forEach((i) => z.push(propozycje[i]));
    if (!z.length) return;
    onDodaj(z.map((t) => noweZadanie(t, idWiadomosci)));
    onZamknij();
  };

  const zaproponuj = async () => {
    setLaduje(true); setBlad('');
    try {
      const lista = await zaproponujZadania(apiKeys?.gemini, apiKeys?.model, pytanie, odpowiedz);
      setPropozycje(lista);
      setWybrane(new Set(lista.map((_, i) => i)));
    } catch (e) {
      setBlad(e.message);
    } finally {
      setLaduje(false);
    }
  };

  const ile = (tekst.trim() ? 1 : 0) + wybrane.size;

  return (
    <div className="nbb mt-2 w-full max-w-xl rounded-2xl border border-primary/25 bg-card/60 p-3 backdrop-blur-md">
      <div className="nb-ikona-kafel flex items-center gap-2 rounded-xl px-2.5 py-1.5 focus-within:!border-primary/40">
        <ListChecks size={15} className="shrink-0 text-primary/70" />
        <input
          ref={pole}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') zapisz(); if (e.key === 'Escape') onZamknij(); }}
          placeholder="Co z tego wynika do zrobienia?"
          className="min-w-0 flex-1 bg-transparent py-1 text-[13.5px] text-foreground outline-none placeholder:text-foreground/40"
        />
      </div>

      {propozycje && (
        <ul className="mt-2 space-y-0.5">
          {propozycje.map((p, i) => {
            const zazn = wybrane.has(i);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setWybrane((w) => { const n = new Set(w); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-foreground/[0.05]"
                >
                  <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border', zazn ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/30')}>
                    {zazn && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className={cn('text-[13px] leading-snug', zazn ? 'text-foreground' : 'text-foreground/55')}>{p}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {blad && <p className="mt-2 px-1 text-[12px] text-destructive">{blad}</p>}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={zaproponuj}
          disabled={laduje}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {laduje ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {propozycje ? 'Zaproponuj inne' : 'Zaproponuj z odpowiedzi'}
        </button>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onZamknij} className="rounded-lg px-2.5 py-1 text-[12.5px] text-foreground/55 hover:text-foreground">Anuluj</button>
          <button
            type="button"
            onClick={zapisz}
            disabled={!ile}
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[12.5px] font-semibold text-foreground hover:bg-primary/25 disabled:opacity-40"
          >
            <Plus size={13} className="text-primary" />
            {ile > 1 ? `Dodaj ${ile}` : 'Dodaj'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Lista zadań notatnika ───────────────────────────────────────── */
function WierszZadania({ z, onZmien, onUsun, onPrzejdz }) {
  const [edycja, setEdycja] = useState(false);
  const [tekst, setTekst] = useState(z.tekst);
  const zapisz = () => { setEdycja(false); if (tekst.trim() && tekst !== z.tekst) onZmien({ ...z, tekst: tekst.trim() }); else setTekst(z.tekst); };

  return (
    <li className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-foreground/[0.04]">
      <button
        type="button"
        onClick={() => onZmien({ ...z, zrobione: !z.zrobione })}
        aria-label={z.zrobione ? 'Oznacz jako niezrobione' : 'Oznacz jako zrobione'}
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors',
          z.zrobione ? 'border-emerald-400/70 bg-emerald-400/20 text-emerald-400' : 'border-foreground/30 hover:border-primary/60',
        )}
      >
        {z.zrobione && <Check size={12} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        {edycja ? (
          <input
            autoFocus
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            onBlur={zapisz}
            onKeyDown={(e) => { if (e.key === 'Enter') zapisz(); if (e.key === 'Escape') { setTekst(z.tekst); setEdycja(false); } }}
            className="w-full rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[13.5px] text-foreground outline-none ring-1 ring-primary/40"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setEdycja(true)}
            title="Kliknij dwukrotnie, żeby edytować"
            className={cn('block w-full text-left text-[13.5px] leading-snug', z.zrobione ? 'text-foreground/40 line-through' : 'text-foreground/90')}
          >
            {z.tekst}
          </button>
        )}
        {z.zrodloWiadomosci && onPrzejdz && (
          <button type="button" onClick={() => onPrzejdz(z.zrodloWiadomosci)} className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground/40 hover:text-primary">
            <CornerDownRight size={11} /> z odpowiedzi
          </button>
        )}
      </div>
      <button type="button" onClick={() => onUsun(z.id)} aria-label="Usuń zadanie" className="shrink-0 rounded-md p-0.5 text-foreground/30 opacity-0 transition-all hover:text-destructive group-hover:opacity-100">
        <Trash2 size={13} />
      </button>
    </li>
  );
}

export function PanelZadan({ zadania, onZmien, onUsun, onDodaj, onPrzejdz, onZamknij }) {
  const [nowe, setNowe] = useState('');
  const [pokazZrobione, setPokazZrobione] = useState(false);
  const otwarte = zadania.filter((z) => !z.zrobione);
  const zrobione = zadania.filter((z) => z.zrobione);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onZamknij(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onZamknij]);

  return (
    <div className="nbb nbb-tafla !absolute !bg-[hsl(var(--card)/0.96)] right-3 top-14 z-50 flex max-h-[70vh] w-[380px] flex-col shadow-2xl shadow-black/40" role="dialog" aria-label="Zadania">
      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3.5">
        <ListChecks size={16} className="text-primary" />
        <h3 className="flex-1 text-[14px] font-semibold text-foreground">Zadania</h3>
        <span className="text-[11.5px] tabular-nums text-foreground/45">{otwarte.length} do zrobienia</span>
        <button type="button" onClick={onZamknij} aria-label="Zamknij" className="rounded-md p-1 text-foreground/50 hover:text-foreground"><X size={14} /></button>
      </div>

      <div className="shrink-0 px-3 pb-2">
        <div className="nb-ikona-kafel flex items-center gap-2 rounded-xl px-2.5 py-1.5 focus-within:!border-primary/40">
          <Plus size={14} className="shrink-0 text-primary/70" />
          <input
            value={nowe}
            onChange={(e) => setNowe(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && nowe.trim()) { onDodaj([noweZadanie(nowe)]); setNowe(''); } }}
            placeholder="Nowe zadanie — Enter"
            className="min-w-0 flex-1 bg-transparent py-1 text-[13.5px] text-foreground outline-none placeholder:text-foreground/40"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3 custom-scrollbar">
        {!zadania.length ? (
          <p className="px-3 py-6 text-center text-[12.5px] leading-relaxed text-foreground/50">
            Pod każdą odpowiedzią jest „Zadanie" — zapisz kolejny krok, zanim ucieknie.
          </p>
        ) : (
          <>
            <ul>{otwarte.map((z) => <WierszZadania key={z.id} z={z} onZmien={onZmien} onUsun={onUsun} onPrzejdz={onPrzejdz} />)}</ul>
            {zrobione.length > 0 && (
              <div className="mt-2 border-t border-foreground/[0.07] pt-2">
                <button type="button" onClick={() => setPokazZrobione((v) => !v)} className="px-3 py-1 text-[11.5px] font-medium text-foreground/45 hover:text-foreground">
                  {pokazZrobione ? 'Ukryj' : 'Pokaż'} zrobione · {zrobione.length}
                </button>
                {pokazZrobione && (
                  <>
                    <ul>{zrobione.map((z) => <WierszZadania key={z.id} z={z} onZmien={onZmien} onUsun={onUsun} onPrzejdz={onPrzejdz} />)}</ul>
                    <button type="button" onClick={() => zrobione.forEach((z) => onUsun(z.id))} className="px-3 py-1 text-[11.5px] text-destructive/80 hover:text-destructive">
                      Usuń zrobione
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
