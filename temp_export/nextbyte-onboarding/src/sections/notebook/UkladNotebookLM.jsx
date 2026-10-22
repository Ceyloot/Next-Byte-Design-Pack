/* ═══════════════════════════════════════════════════════════════
   UKŁAD NEXT SCRIBE — 1:1 z NotebookLM, kolorystyka NextByte

   NotebookLM (2026):
     ┌ górny pasek: logo · tytuł notatnika ······ Utwórz notatnik · Udostępnij · ⚙ · awatar
     ├ Źródła (≈25%) │ Czat (≈50%) │ Studio (≈25%) — trzy karty z nagłówkami, odstęp 16 px
   Każdą kartę boczną da się zwinąć do szyny z ikonami.

   Kolory jak okno „Szukaj wszędzie": pełne, ciemne karty (`card` 97%),
   rant foreground/0.10, bez prześwitującego szkła — tekst zawsze czytelny.
   Pasek platformy NIE jest osobnym paskiem: znak N w górnym pasku to
   „‹ MENU" podglądu, więc na ekranie zostaje jedna nawigacja.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useRef, useState } from 'react';
import { Plus, ChevronDown, Search, Settings, Sun, Moon, Check, Pencil, Library, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import znak from '@/assets/nextbyte-mark.png';
import { odczytajAktualnyMotyw, przelaczNastepnyMotyw } from '@/sections/panel2/fundament/kolejka-motywow';

export const KARTA = 'rounded-2xl border border-foreground/[0.10] bg-[hsl(var(--card)/0.97)] shadow-[0_1px_0_0_hsl(0_0%_100%/0.04)_inset,0_12px_32px_-12px_hsl(0_0%_0%/0.5)]';

function WyborNotatnika({ projects, activeProjectId, onChangeProject, onCreateProject, onRename }) {
  const [otwarte, setOtwarte] = useState(false);
  const ref = useRef(null);
  const nazwa = projects.find((p) => p.id === activeProjectId)?.name || 'Notatnik';

  useEffect(() => {
    if (!otwarte) return undefined;
    const klik = (e) => { if (ref.current && !ref.current.contains(e.target)) setOtwarte(false); };
    window.addEventListener('pointerdown', klik);
    return () => window.removeEventListener('pointerdown', klik);
  }, [otwarte]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOtwarte((v) => !v)}
        className="flex min-w-0 max-w-[52vw] items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-foreground/[0.05]"
      >
        <span className="truncate text-[20px] font-normal tracking-tight text-foreground">{nazwa}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-foreground/50 transition-transform', otwarte && 'rotate-180')} />
      </button>
      {otwarte && (
        <div className={cn(KARTA, 'absolute left-0 top-11 z-50 w-80 p-1.5')}>
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">Notatniki</p>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onChangeProject(p.id); setOtwarte(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-foreground/[0.05]"
              >
                <Library size={15} className={p.id === activeProjectId ? 'text-primary' : 'text-foreground/45'} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground">{p.name}</span>
                <span className="text-[11.5px] tabular-nums text-foreground/40">{p.sourceCount ?? 0}</span>
                {p.id === activeProjectId && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
          <div className="my-1 h-px bg-foreground/[0.07]" />
          {onRename && (
            <button type="button" onClick={() => { onRename(activeProjectId, nazwa); setOtwarte(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-foreground/80 hover:bg-foreground/[0.05]">
              <Pencil size={14} className="text-foreground/45" /> Zmień nazwę
            </button>
          )}
          <button type="button" onClick={() => { onCreateProject(); setOtwarte(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-foreground/80 hover:bg-foreground/[0.05]">
            <Plus size={14} className="text-primary" /> Nowy notatnik
          </button>
        </div>
      )}
    </div>
  );
}

export default function UkladNotebookLM({
  projects, activeProjectId, onChangeProject, onCreateProject, onRename,
  onMenu, onUchwyt, onSzukaj, onUstawienia, akcjeDodatkowe,
  zrodla, zrodlaZwiniete, czat, studio, studioZwiniete,
}) {
  const [motyw, setMotyw] = useState(odczytajAktualnyMotyw);
  useEffect(() => {
    const odswiez = () => setMotyw(odczytajAktualnyMotyw());
    window.addEventListener('themeChanged', odswiez);
    window.addEventListener('nb-theme-change', odswiez);
    return () => { window.removeEventListener('themeChanged', odswiez); window.removeEventListener('nb-theme-change', odswiez); };
  }, []);

  const IkonaAkcji = ({ ikona: I, etykieta, onClick }) => (
    <button type="button" onClick={onClick} title={etykieta} aria-label={etykieta} className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
      <I size={18} />
    </button>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[hsl(var(--background))]">
      {/* GÓRNY PASEK */}
      <header className="flex h-16 shrink-0 items-center gap-3 px-4">
        {onUchwyt && (
          <button type="button" onPointerDown={onUchwyt} title="Przeciągnij, aby przypiąć nawigację" aria-label="Przeciągnij nawigację" className="flex h-8 w-5 cursor-grab items-center justify-center text-foreground/25 hover:text-primary active:cursor-grabbing">
            <GripVertical size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={onMenu}
          title="Menu NextByte"
          aria-label="Menu NextByte"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 p-1.5 transition-transform hover:scale-105"
        >
          <img src={znak} alt="" className="h-full w-full object-contain [[data-theme=future-theme]_&]:brightness-0 [[data-theme=future-theme]_&]:opacity-80" />
        </button>
        <WyborNotatnika projects={projects} activeProjectId={activeProjectId} onChangeProject={onChangeProject} onCreateProject={onCreateProject} onRename={onRename} />

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCreateProject}
            className="mr-1 flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[14px] font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus size={17} /> Utwórz notatnik
          </button>
          {onSzukaj && <IkonaAkcji ikona={Search} etykieta="Szukaj we wszystkich notatnikach (Ctrl+K)" onClick={onSzukaj} />}
          {akcjeDodatkowe}
          <IkonaAkcji ikona={motyw.jasny ? Moon : Sun} etykieta={motyw.jasny ? 'Ciemny motyw' : 'Jasny motyw'} onClick={() => setMotyw(przelaczNastepnyMotyw())} />
          {onUstawienia && <IkonaAkcji ikona={Settings} etykieta="Ustawienia notatnika" onClick={onUstawienia} />}
          <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-[12px] font-bold text-primary">AB</span>
        </div>
      </header>

      {/* TRZY KARTY */}
      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
        <section className={cn(KARTA, 'flex min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out', zrodlaZwiniete ? 'w-14' : 'w-[clamp(280px,25%,400px)]')} aria-label="Źródła">
          {zrodla}
        </section>
        <section className={cn(KARTA, 'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden')} aria-label="Czat">
          {czat}
        </section>
        <section className={cn(KARTA, 'flex min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out', studioZwiniete ? 'w-14' : 'w-[clamp(300px,26%,420px)]')} aria-label="Studio">
          {studio}
        </section>
      </div>
    </div>
  );
}
