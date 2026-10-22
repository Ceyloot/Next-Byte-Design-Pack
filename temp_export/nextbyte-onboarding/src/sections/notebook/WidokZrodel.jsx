/* ═══════════════════════════════════════════════════════════════
   WIDOK ŹRÓDŁA — galeria kafelków jak Studio Zdjęć

   „▣ Wszystkie źródła · 4" + filtry (Wszystkie / Filmy / Strony /
   Pliki / Zaznaczone) + szukaj w opisach. Kafelek: miniatura filmu
   (albo znak rodzaju), tytuł, rodzaj i data; zaznaczenie w rogu,
   odśwież / usuń po najechaniu. Pierwszy kafelek to „+ Dodaj źródło".
   Na dole pływające pole jak generator w Studio Video: temat →
   AI znajduje źródła w sieci, a „+" przy wyniku dodaje je od razu.
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo, useState } from 'react';
import {
  Library, Plus, Search, Video as Youtube, Globe, FileText, CheckSquare, Square, RefreshCw, Trash2,
  Loader2, ArrowUp, Check, X, ExternalLink, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getKindIcon, getKindLabel } from './utils/sourceKinds';
import { znajdzZrodla } from './utils/nextScribeAi';
import { odswiezalne, ileTemu } from './utils/zywe';
import { KAFEL, KAFEL_DODAJ, NaglowekSekcji, Filtr } from './kafelki';

const FILTRY = [
  { id: 'wszystkie', etykieta: 'Wszystkie' },
  { id: 'filmy', etykieta: 'Filmy', ikona: Youtube, test: (s) => s.type === 'youtube' },
  { id: 'strony', etykieta: 'Strony', ikona: Globe, test: (s) => s.fileKind === 'web' },
  { id: 'pliki', etykieta: 'Pliki', ikona: FileText, test: (s) => s.type !== 'youtube' && s.fileKind !== 'web' },
];

function Miniatura({ s }) {
  if (s.type === 'youtube' && s.videoId) {
    return <img src={s.thumbnailUrl || `https://img.youtube.com/vi/${s.videoId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />;
  }
  const Ik = getKindIcon(s.fileKind);
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/[0.12] to-transparent">
      <span className="nb-nav-ikona-akt flex h-14 w-14 items-center justify-center rounded-2xl text-primary"><Ik size={26} strokeWidth={1.6} /></span>
    </div>
  );
}

function PoleOdkrywania({ apiKeys, juzSa, onDodajLink }) {
  const [temat, setTemat] = useState('');
  const [szukam, setSzukam] = useState(false);
  const [wyniki, setWyniki] = useState(null);
  const [dodane, setDodane] = useState(new Set());
  const [blad, setBlad] = useState('');

  const szukaj = async () => {
    if (!temat.trim() || szukam) return;
    setSzukam(true); setBlad(''); setWyniki(null); setDodane(new Set());
    try {
      const l = await znajdzZrodla(apiKeys?.gemini, apiKeys?.model, temat.trim(), { juzSa });
      setWyniki(l);
      if (!l.length) setBlad('Nic pewnego — spróbuj inaczej sformułować temat.');
    } catch (e) { setBlad(e.message); } finally { setSzukam(false); }
  };

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-[860px]">
      {(wyniki?.length > 0 || blad) && (
        <div className={cn(KAFEL, 'mb-2 max-h-[40vh] overflow-y-auto bg-[hsl(var(--card)/0.92)] p-2 custom-scrollbar')}>
          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <span className="text-[12px] text-foreground/55">{blad || `${wyniki.length} propozycji z sieci`}</span>
            <button type="button" onClick={() => { setWyniki(null); setBlad(''); }} aria-label="Zamknij" className="rounded p-1 text-foreground/45 hover:text-foreground"><X size={14} /></button>
          </div>
          {wyniki?.map((w) => {
            const jest = dodane.has(w.url);
            return (
              <div key={w.url} className="flex items-start gap-3 rounded-xl px-2.5 py-2 hover:bg-foreground/[0.04]">
                {/youtu/.test(w.url) ? <Youtube size={17} className="mt-0.5 shrink-0 text-red-500" /> : <Globe size={17} className="mt-0.5 shrink-0 text-foreground/50" />}
                <div className="min-w-0 flex-1">
                  <a href={w.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[14px] font-medium text-foreground hover:underline">
                    <span className="truncate">{w.tytul}</span><ExternalLink size={11} className="shrink-0 opacity-40" />
                  </a>
                  <p className="text-[12.5px] leading-snug text-foreground/55">{w.dlaczego}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { if (!jest) { onDodajLink(w.url); setDodane((s) => new Set(s).add(w.url)); } }}
                  className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium', jest ? 'border-emerald-400/40 text-emerald-400' : 'border-primary/35 bg-primary/10 text-foreground hover:bg-primary/20')}
                >
                  {jest ? <><Check size={13} /> Dodano</> : <><Plus size={13} className="text-primary" /> Dodaj</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className={cn(KAFEL, 'flex items-center gap-3 bg-[hsl(var(--card)/0.85)] p-3 pl-5')}>
        <Sparkles size={18} className="shrink-0 text-primary" />
        <input
          value={temat}
          onChange={(e) => setTemat(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') szukaj(); }}
          placeholder="Opisz temat — znajdę źródła w sieci (filmy, artykuły, badania)…"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground/40"
        />
        <button
          type="button"
          onClick={szukaj}
          disabled={!temat.trim() || szukam}
          className="flex h-10 items-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-4 text-[14px] font-semibold text-foreground hover:bg-primary/20 disabled:opacity-40"
        >
          {szukam ? <Loader2 size={15} className="animate-spin text-primary" /> : <ArrowUp size={15} className="text-primary" />}
          Znajdź
        </button>
      </div>
    </div>
  );
}

export default function WidokZrodel({
  sources = [], pendingSources = [], selectedSourceIds = [], onSelectSource, onToggleAllSources,
  onRemoveSource, onOpenSource, onOpenAddModal, onOdswiezZrodlo, odswiezamId, apiKeys, onDodajLink,
}) {
  const [filtr, setFiltr] = useState('wszystkie');
  const [fraza, setFraza] = useState('');
  const wszystkie = sources.length > 0 && selectedSourceIds.length === sources.length;

  const widoczne = useMemo(() => {
    const f = FILTRY.find((x) => x.id === filtr);
    const q = fraza.trim().toLowerCase();
    return sources.filter((s) => (!f?.test || f.test(s)) && (!q || s.title?.toLowerCase().includes(q) || s.rawText?.toLowerCase().includes(q)));
  }, [sources, filtr, fraza]);

  const juzSa = sources.map((s) => s.url || (s.videoId ? `https://www.youtube.com/watch?v=${s.videoId}` : s.title)).filter(Boolean);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-40 pt-2 custom-scrollbar">
        <NaglowekSekcji ikona={Library} tytul="Wszystkie źródła" licznik={sources.length}>
          {FILTRY.map((f) => (
            <Filtr key={f.id} aktywny={filtr === f.id} ikona={f.ikona} onClick={() => setFiltr(f.id)}>{f.etykieta}</Filtr>
          ))}
          <label className="flex h-9 w-56 items-center gap-2 rounded-xl border border-foreground/[0.10] bg-[hsl(var(--card)/0.4)] px-3 focus-within:border-primary/40">
            <Search size={14} className="shrink-0 text-foreground/45" />
            <input value={fraza} onChange={(e) => setFraza(e.target.value)} placeholder="Szukaj w treści…" className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/40" />
          </label>
          {sources.length > 0 && (
            <Filtr aktywny={wszystkie} ikona={wszystkie ? CheckSquare : Square} onClick={onToggleAllSources}>
              {selectedSourceIds.length ? `Zaznaczone ${selectedSourceIds.length}` : 'Zaznacz'}
            </Filtr>
          )}
        </NaglowekSekcji>

        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          <button type="button" onClick={onOpenAddModal} className={cn(KAFEL_DODAJ, 'flex aspect-[4/3.3] flex-col items-center justify-center gap-2')}>
            <Plus size={22} />
            <span className="text-[14px] font-medium">Dodaj źródło</span>
            <span className="text-[12px] text-foreground/40">PDF · film · strona · tekst</span>
          </button>

          {pendingSources.map((s) => (
            <div key={s.id} className={cn(KAFEL, 'flex aspect-[4/3.3] flex-col items-center justify-center gap-3 p-4 text-center')}>
              <Loader2 size={22} className="animate-spin text-primary" />
              <span className="line-clamp-2 text-[13px] text-foreground/65">{s.title}</span>
            </div>
          ))}

          {widoczne.map((s) => {
            const zazn = selectedSourceIds.includes(s.id);
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenSource(s.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') onOpenSource(s.id); }}
                className={cn(KAFEL, 'group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:border-primary/35', zazn && 'border-primary/40')}
              >
                <div className="relative aspect-video overflow-hidden bg-foreground/[0.04]">
                  <Miniatura s={s} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelectSource(s.id); }}
                    aria-label={zazn ? 'Odznacz źródło' : 'Zaznacz źródło'}
                    className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 backdrop-blur"
                  >
                    {zazn ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-white/80" />}
                  </button>
                  <div className="absolute right-2.5 top-2.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onOdswiezZrodlo && odswiezalne(s) && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); onOdswiezZrodlo(s.id); }} aria-label="Odśwież źródło" title="Odśwież i pokaż zmiany" className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/85 backdrop-blur hover:text-white">
                        <RefreshCw size={14} className={odswiezamId === s.id ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveSource(s.id); }} aria-label="Usuń źródło" title="Usuń" className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/85 backdrop-blur hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {s.zmiany && !s.zmiany.bezZmian && (
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10.5px] font-semibold text-black">zmieniono</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3.5">
                  <span className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground" title={s.title}>{s.title}</span>
                  <span className="mt-auto flex items-center gap-1.5 text-[12px] text-foreground/50">
                    {s.type === 'youtube' ? <Youtube size={12} className="text-red-500" /> : <FileText size={12} />}
                    {s.type === 'youtube' ? (s.author && s.author !== 'YouTube Video' ? s.author : 'Film') : getKindLabel(s.fileKind) || 'Dokument'}
                    <span className="text-foreground/30">·</span>
                    {ileTemu(s.sprawdzono || s.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {sources.length > 0 && !widoczne.length && (
          <p className="mt-10 text-center text-[13.5px] text-foreground/50">Nic nie pasuje do filtra.</p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-5 pt-10 [background:linear-gradient(to_top,hsl(var(--background))_40%,transparent)]">
        <PoleOdkrywania apiKeys={apiKeys} juzSa={juzSa} onDodajLink={onDodajLink} />
      </div>
    </div>
  );
}
