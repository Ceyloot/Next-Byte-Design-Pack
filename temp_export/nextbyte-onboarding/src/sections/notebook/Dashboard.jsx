/* ═══════════════════════════════════════════════════════════════
   DASHBOARD NOTATNIKA — styl „duch"

   Co było nie tak z poprzednią wersją:
     • hero jak z landing page'a zjadał jedną trzecią ekranu, żeby
       powiedzieć „1 notatnik, 0 materiałów",
     • kafelki w siatce: przy dwóch pozycjach to dwa pudełka i morze
       pustki, a każde pudełko niosło własną ramkę, cień i gradient,
     • emoji (🏎️🎨💻📚) jako ikony notatników — kolor spoza palety,
       inny rendering na każdym systemie, zero związku z marką,
     • dwa nieopisane guziki-ikony obok sortowania.

   Co jest teraz: notatniki to wiersze rozdzielone włoskową linią,
   nie karty. Nagłówek sekcji to mikroetykieta z linią wypełniającą
   resztę wiersza — ten sam znak rozpoznawczy, co w panelu 2.0.
   Kolor akcentu występuje w jednym miejscu: przy akcji głównej.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2, Layers, FileText, ArrowRight, Settings } from 'lucide-react';
import { GlassDropdown, GlassTooltip } from '@/components/glass';
import { Naglowek, Przycisk, Segmenty, Wejscie } from '@/components/duch';
import { cn } from '@/lib/utils';

const SORTOWANIE = [
  { id: 'recent', etykieta: 'Najnowsze' },
  { id: 'name',   etykieta: 'A–Z' },
];

const MIESIACE = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

function dataPl(iso) {
  if (!iso) return 'dziś';
  const d = new Date(iso);
  return `${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`;
}

/** Polska odmiana — liczebnik rządzi przypadkiem, więc bez tego brzmi jak automat. */
function odmiana(n, poj, mno2_4, mnoReszta) {
  if (n === 1) return poj;
  const dziesiatki = n % 100;
  const jednosci = n % 10;
  if (jednosci >= 2 && jednosci <= 4 && !(dziesiatki >= 12 && dziesiatki <= 14)) return mno2_4;
  return mnoReszta;
}

/* ── Wiersz notatnika ─────────────────────────────────────────── */

function WierszNotatnika({ projekt, onOtworz, onZmienNazwe, onUsun, opoznienie }) {
  const liczbaZrodel = projekt.sourceCount ?? 0;

  return (
    <Wejscie opoznienie={opoznienie}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOtworz(projekt.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOtworz(projekt.id); }
        }}
        className={cn(
          'group relative flex items-center gap-4 py-3.5 pl-3 pr-2 -mx-3 rounded-xl cursor-pointer',
          'outline-none transition-colors duration-200',
          'hover:bg-foreground/[0.035] focus-visible:bg-foreground/[0.035]',
          'focus-visible:ring-2 focus-visible:ring-primary/40',
        )}
      >
        {/* Znacznik aktywnego wiersza — cienka kreska akcentu przy krawędzi,
            zamiast obwódki dookoła całej karty. */}
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-full bg-primary/70 transition-all duration-200 group-hover:h-7"
        />

        <span className="shrink-0 text-foreground/25 transition-colors duration-200 group-hover:text-primary/70">
          <FileText className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground" title={projekt.name}>
            {projekt.name}
          </span>
          <span className="mt-0.5 block text-xs text-foreground/65">
            {liczbaZrodel} {odmiana(liczbaZrodel, 'źródło', 'źródła', 'źródeł')}
            <span className="px-1.5 text-foreground/20">·</span>
            {dataPl(projekt.createdAt)}
          </span>
        </span>

        {/* „Otwórz" dochodzi pod kursorem — w spoczynku wiersz jest czystym tekstem. */}
        <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
          Otwórz <ArrowRight className="h-3 w-3" />
        </span>

        <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <GlassDropdown
            align="right"
            trigger={
              <button
                type="button"
                aria-label={`Opcje notatnika ${projekt.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            items={[
              { key: 'rename', label: 'Zmień nazwę', icon: <Edit2 size={12} className="text-primary" />, onClick: () => onZmienNazwe(projekt.id, projekt.name) },
              { key: 'delete', label: 'Usuń', icon: <Trash2 size={12} />, danger: true, onClick: () => onUsun(projekt.id) },
            ]}
          />
        </span>
      </div>
    </Wejscie>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */

function Dashboard({
  projects = [],
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  onOpenSettings,
  onClearAll,
}) {
  const [szukaj, setSzukaj] = useState('');
  const [sortowanie, setSortowanie] = useState('recent');

  const widoczne = projects
    .filter((p) => p.name.toLowerCase().includes(szukaj.toLowerCase()))
    .sort((a, b) =>
      sortowanie === 'name'
        ? a.name.localeCompare(b.name, 'pl')
        : new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

  const materialy = projects.reduce((suma, p) => suma + (p.sourceCount ?? 0), 0);

  return (
    <div className="relative flex h-full flex-1 select-none flex-col overflow-y-auto bg-background text-foreground p2-scroll">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-9 px-6 pb-16 pt-10 md:px-8">

        {/* ── Tożsamość ──────────────────────────────────────────
            Cztery wiersze zamiast hero na pół ekranu. Liczby nie są
            wielkie: to metryka, nie osiągnięcie. */}
        <Wejscie>
          <header className="flex flex-col gap-2">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-foreground/65">
              AI Research Assistant
            </span>
            <h1 className="font-heading text-[27px] font-extrabold leading-none tracking-tight text-foreground">
              NextScribe
            </h1>
            <p className="max-w-md text-[13px] leading-relaxed text-foreground/65">
              Dodawaj filmy, dokumenty i strony — AI pomoże je zrozumieć,
              podsumować i przeszukać.
            </p>
            <p className="mt-1 text-xs text-foreground/65">
              <span className="font-semibold text-foreground">{projects.length}</span>{' '}
              {odmiana(projects.length, 'notatnik', 'notatniki', 'notatników')}
              <span className="px-1.5 text-foreground/20">·</span>
              <span className="font-semibold text-foreground">{materialy}</span>{' '}
              {odmiana(materialy, 'materiał', 'materiały', 'materiałów')}
            </p>
          </header>
        </Wejscie>

        {/* ── Pasek narzędzi ─────────────────────────────────────
            Mikroetykieta + włoskowa linia + akcja po prawej: ten sam
            nagłówek, co w panelu 2.0. Szukanie i sortowanie siedzą
            pod linią, żeby nie konkurowały z akcją główną. */}
        <div className="flex flex-col gap-4">
          <Naglowek
            ikona={<Layers />}
            tytul="Moje notatniki"
            akcja={
              <Przycisk wariant="akcent" ikona={<Plus />} onClick={onCreateProject}>
                Nowy notatnik
              </Przycisk>
            }
          />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Pole szukania bez obwódki — podkreślenie zamiast pudełka. */}
            <label className="group/sz relative flex min-w-0 flex-1 items-center gap-2 border-b border-foreground/[0.08] py-1.5 transition-colors focus-within:border-primary/40 sm:max-w-xs">
              <Search className="h-3.5 w-3.5 shrink-0 text-foreground/30" />
              <input
                value={szukaj}
                onChange={(e) => setSzukaj(e.target.value)}
                placeholder="Szukaj notatników…"
                aria-label="Szukaj notatników"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/55"
              />
            </label>

            <Segmenty
              pozycje={SORTOWANIE}
              wybrane={sortowanie}
              onWybor={setSortowanie}
            />

            <span className="flex-1" />

            {onOpenSettings && (
              <GlassTooltip content="Ustawienia i personalizacja">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  aria-label="Ustawienia"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </GlassTooltip>
            )}

            {/* Czyszczenie listy — cicha akcja tekstowa, nie czerwony guzik.
                Pojawia się tylko wtedy, gdy jest co usuwać. */}
            {onClearAll && projects.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Usuń wszystkie</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Lista ──────────────────────────────────────────────
            Wiersze rozdzielone włoskową linią. Przy jednym notatniku
            wygląda to jak lista z jedną pozycją, a nie jak pusty
            magazyn z dwoma pudełkami. */}
        <div className="flex flex-col">
          {widoczne.length === 0 ? (
            <Wejscie opoznienie={60}>
              <p className="py-10 text-center text-sm text-foreground/35">
                {szukaj
                  ? <>Nic nie pasuje do „{szukaj}".</>
                  : 'Nie masz jeszcze żadnego notatnika.'}
              </p>
            </Wejscie>
          ) : (
            <div className="divide-y divide-foreground/[0.06]">
              {widoczne.map((projekt, i) => (
                <WierszNotatnika
                  key={projekt.id}
                  projekt={projekt}
                  onOtworz={onSelectProject}
                  onZmienNazwe={onRenameProject}
                  onUsun={onDeleteProject}
                  opoznienie={60 + i * 45}
                />
              ))}
            </div>
          )}

          {/* Dodawanie jako ostatni wiersz listy, nie jako karta-bliźniak
              notatnika: to czynność, a nie rzecz tej samej rangi. */}
          <Wejscie opoznienie={60 + widoczne.length * 45}>
            <button
              type="button"
              onClick={onCreateProject}
              className={cn(
                'group -mx-3 mt-1 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-xl py-3.5 pl-3 pr-2',
                'border-t border-foreground/[0.06] text-left outline-none transition-colors duration-200',
                'hover:bg-foreground/[0.035] focus-visible:ring-2 focus-visible:ring-primary/40',
              )}
            >
              <span className="shrink-0 text-foreground/30 transition-colors duration-200 group-hover:text-primary">
                <Plus className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground/65 transition-colors duration-200 group-hover:text-foreground/80">
                Utwórz notatnik
              </span>
            </button>
          </Wejscie>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
