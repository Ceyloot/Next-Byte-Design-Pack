/* ═══════════════════════════════════════════════════════════════
   PANEL ŹRÓDŁA — układ 1:1 z NotebookLM, materiał NextByte

   Kolejność od góry, jak w NotebookLM:
     1. nagłówek „Źródła" + zwiń panel,
     2. „+ Dodaj źródła" — pigułka na całą szerokość,
     3. „Szukaj nowych źródeł w sieci" — pole z trybem (Szybkie / Dokładne)
        i strzałką; wyniki pod spodem, każdy z „+" do dodania jednym kliknięciem,
     4. rząd: odśwież wszystkie · „Zaznacz wszystkie" + pole wyboru,
     5. lista: ikona rodzaju, tytuł, pole wyboru po prawej; akcje po najechaniu.
   Zwinięty panel to wąska szyna z ikonami źródeł.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import {
  Plus, PanelLeftClose, PanelLeftOpen, Globe, ArrowRight, Loader2, Check, Square, CheckSquare,
  RefreshCw, Trash2, Video as Youtube, ChevronDown, X, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getKindIcon } from './utils/sourceKinds';
import { znajdzZrodla } from './utils/nextScribeAi';
import { odswiezalne } from './utils/zywe';

function IkonaZrodla({ src, className }) {
  const Ik = src.type === 'youtube' ? Youtube : getKindIcon(src.fileKind);
  return <Ik className={cn('h-[18px] w-[18px] shrink-0', src.type === 'youtube' ? 'text-red-500' : 'text-primary/80', className)} />;
}

function SzukajWSieci({ apiKeys, juzSa, onDodaj }) {
  const [temat, setTemat] = useState('');
  const [tryb, setTryb] = useState('szybkie');
  const [wyniki, setWyniki] = useState(null);
  const [dodane, setDodane] = useState(new Set());
  const [szukam, setSzukam] = useState(false);
  const [blad, setBlad] = useState('');
  const [menuTrybu, setMenuTrybu] = useState(false);

  const szukaj = async () => {
    if (!temat.trim() || szukam) return;
    setSzukam(true); setBlad(''); setWyniki(null); setDodane(new Set());
    try {
      const zapytanie = tryb === 'dokladne' ? `${temat.trim()} — szukaj głębiej: badania, dokumentacje, eksperci` : temat.trim();
      const lista = await znajdzZrodla(apiKeys?.gemini, apiKeys?.model, zapytanie, { juzSa });
      setWyniki(lista);
      if (!lista.length) setBlad('Nic pewnego — spróbuj sformułować temat inaczej.');
    } catch (e) {
      setBlad(e.message);
    } finally {
      setSzukam(false);
    }
  };

  const dodaj = (w) => {
    onDodaj(w.url);
    setDodane((s) => new Set(s).add(w.url));
  };

  return (
    <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] p-2.5">
      <input
        value={temat}
        onChange={(e) => setTemat(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') szukaj(); }}
        placeholder="Szukaj nowych źródeł w sieci"
        className="w-full bg-transparent px-1.5 py-1 text-[14px] text-foreground outline-none placeholder:text-foreground/45"
      />
      <div className="mt-2 flex items-center gap-1.5">
        <span className="flex h-8 items-center gap-1.5 rounded-full border border-foreground/10 px-3 text-[12.5px] text-foreground/80">
          <Globe size={14} /> Sieć
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuTrybu((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-full border border-foreground/10 px-3 text-[12.5px] text-foreground/80 hover:border-foreground/20"
          >
            {tryb === 'szybkie' ? 'Szybkie' : 'Dokładne'}
            <ChevronDown size={13} />
          </button>
          {menuTrybu && (
            <div className="absolute left-0 top-9 z-30 w-56 rounded-xl border border-foreground/10 bg-[hsl(var(--card))] p-1 shadow-2xl">
              {[
                { id: 'szybkie', t: 'Szybkie', o: '6–10 źródeł w kilka sekund' },
                { id: 'dokladne', t: 'Dokładne', o: 'Badania, dokumentacje, eksperci' },
              ].map((x) => (
                <button key={x.id} type="button" onClick={() => { setTryb(x.id); setMenuTrybu(false); }} className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-foreground/[0.05]">
                  <Check size={14} className={cn('mt-0.5 shrink-0', tryb === x.id ? 'text-primary' : 'opacity-0')} />
                  <span>
                    <span className="block text-[13px] text-foreground">{x.t}</span>
                    <span className="block text-[11.5px] text-foreground/50">{x.o}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={szukaj}
          disabled={!temat.trim() || szukam}
          aria-label="Szukaj źródeł"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/[0.08] hover:text-foreground disabled:opacity-40"
        >
          {szukam ? <Loader2 size={16} className="animate-spin text-primary" /> : <ArrowRight size={16} />}
        </button>
      </div>

      {blad && <p className="mt-2 px-1 text-[12px] text-destructive">{blad}</p>}
      {wyniki?.length > 0 && (
        <div className="mt-2 border-t border-foreground/[0.07] pt-2">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[11.5px] text-foreground/50">{wyniki.length} propozycji</span>
            <button type="button" onClick={() => setWyniki(null)} aria-label="Zamknij wyniki" className="rounded p-0.5 text-foreground/40 hover:text-foreground"><X size={13} /></button>
          </div>
          <ul className="max-h-60 space-y-0.5 overflow-y-auto custom-scrollbar">
            {wyniki.map((w) => {
              const jest = dodane.has(w.url);
              return (
                <li key={w.url} className="group flex items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-foreground/[0.04]">
                  {/youtu/.test(w.url) ? <Youtube size={15} className="mt-0.5 shrink-0 text-red-500" /> : <Globe size={15} className="mt-0.5 shrink-0 text-foreground/50" />}
                  <span className="min-w-0 flex-1">
                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] text-foreground hover:underline">
                      <span className="truncate">{w.tytul}</span><ExternalLink size={10} className="shrink-0 opacity-40" />
                    </a>
                    <span className="line-clamp-2 text-[11.5px] leading-snug text-foreground/50">{w.dlaczego}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => !jest && dodaj(w)}
                    aria-label={jest ? 'Dodano' : 'Dodaj źródło'}
                    className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors', jest ? 'border-emerald-400/40 text-emerald-400' : 'border-foreground/15 text-foreground/70 hover:border-primary/50 hover:text-primary')}
                  >
                    {jest ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PanelZrodel({
  sources = [], pendingSources = [], selectedSourceIds = [], activeSourceId,
  onSelectSource, onToggleAllSources, onRemoveSource, onOpenSource, onOpenAddModal,
  onOdswiezZrodlo, odswiezamId, onOdswiezWszystkie, apiKeys, onDodajLink,
  zwiniety, onPrzelacz,
}) {
  const wszystkie = sources.length > 0 && selectedSourceIds.length === sources.length;
  const juzSa = sources.map((s) => s.url || (s.videoId ? `https://www.youtube.com/watch?v=${s.videoId}` : s.title)).filter(Boolean);

  if (zwiniety) {
    return (
      <div className="flex h-full flex-col items-center gap-2 py-3">
        <button type="button" onClick={onPrzelacz} title="Rozwiń źródła" aria-label="Rozwiń źródła" className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground">
          <PanelLeftOpen size={18} />
        </button>
        <button type="button" onClick={onOpenAddModal} title="Dodaj źródła" aria-label="Dodaj źródła" className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/80 hover:border-primary/40 hover:text-primary">
          <Plus size={17} />
        </button>
        <div className="my-1 h-px w-6 bg-foreground/10" />
        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto custom-scrollbar">
          {sources.map((s) => (
            <button key={s.id} type="button" onClick={() => onOpenSource(s.id)} title={s.title} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-foreground/[0.06]">
              <IkonaZrodla src={s} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-foreground/[0.08] px-5">
        <h2 className="text-[16px] font-medium text-foreground">Źródła</h2>
        <button type="button" onClick={onPrzelacz} title="Zwiń źródła" aria-label="Zwiń źródła" className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="shrink-0 space-y-3 px-4 pt-4">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-foreground/[0.12] text-[14px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
        >
          <Plus size={17} /> Dodaj źródła
        </button>
        <SzukajWSieci apiKeys={apiKeys} juzSa={juzSa} onDodaj={onDodajLink} />
      </div>

      {sources.length > 0 && (
        <div className="flex shrink-0 items-center gap-1 px-4 pb-1 pt-4">
          {onOdswiezWszystkie && (
            <button type="button" onClick={onOdswiezWszystkie} title="Odśwież wszystkie źródła z adresem" aria-label="Odśwież wszystkie źródła" className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground">
              <RefreshCw size={16} className={odswiezamId ? 'animate-spin text-primary' : ''} />
            </button>
          )}
          <button type="button" onClick={onToggleAllSources} className="ml-auto flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13.5px] text-foreground/85 hover:bg-foreground/[0.05]">
            Zaznacz wszystkie
            {wszystkie ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-foreground/50" />}
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 custom-scrollbar">
        {pendingSources.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-foreground/55">
            <Loader2 size={17} className="shrink-0 animate-spin text-primary" />
            <span className="truncate">{s.title}</span>
          </div>
        ))}
        {sources.map((s) => {
          const zazn = selectedSourceIds.includes(s.id);
          const akt = activeSourceId === s.id;
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenSource(s.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') onOpenSource(s.id); }}
              className={cn('group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors', akt ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.04]')}
            >
              <IkonaZrodla src={s} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-foreground/90" title={s.title}>{s.title}</span>
              {s.zmiany && !s.zmiany.bezZmian && <span title="Zmieniło się przy ostatnim odświeżeniu" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {onOdswiezZrodlo && odswiezalne(s) && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onOdswiezZrodlo(s.id); }} aria-label="Odśwież źródło" title="Odśwież i pokaż zmiany" className="rounded-md p-1 text-foreground/50 hover:text-primary">
                    <RefreshCw size={14} className={odswiezamId === s.id ? 'animate-spin text-primary' : ''} />
                  </button>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveSource(s.id); }} aria-label="Usuń źródło" title="Usuń źródło" className="rounded-md p-1 text-foreground/50 hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </span>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelectSource(s.id); }} aria-label={zazn ? 'Odznacz źródło' : 'Zaznacz źródło'} className="shrink-0 rounded p-0.5">
                {zazn ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-foreground/40 group-hover:text-foreground/70" />}
              </button>
            </div>
          );
        })}
        {!sources.length && !pendingSources.length && (
          <div className="px-6 py-10 text-center">
            <p className="text-[13.5px] font-medium text-foreground/70">Tu pojawią się źródła</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/45">Dodaj PDF, stronę, film z YouTube albo wklejony tekst — albo znajdź źródła w sieci powyżej.</p>
          </div>
        )}
      </div>
    </div>
  );
}
