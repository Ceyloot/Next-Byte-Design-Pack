/* ═══════════════════════════════════════════════════════════════
   WIDOK STUDIO — układ Panelu Głównego

   TWOJE NARZĘDZIA   — trzy duże kafelki (jak „Szybka podróż"):
                       Żywy szkic · Powtórki · Tabela ekstrakcji
   GENERUJ ZE ŹRÓDEŁ — siatka narzędzi Studio (raport, fiszki, podcast…)
   SZKICE / DOKUMENTY — listy w kafelkach (jak „Wróć do roboty")
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import { FilePen, GraduationCap, Table2, ChevronRight, ShieldCheck, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STUDIO_TOOLS } from './utils/aiTools';
import TopicDialog from './TopicDialog';
import { StudioOutput } from './StudioPanel';
import { KAFEL, KAFEL_KLIK, Etykieta } from './kafelki';
import { ileTemu } from './utils/zywe';

function DuzyKafel({ ikona: I, tytul, opis, znacznik, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(KAFEL_KLIK, 'group relative flex h-[150px] flex-col justify-between overflow-hidden p-5 text-left disabled:cursor-not-allowed disabled:opacity-45')}
    >
      {/* Duży znak w tle w prawym górnym rogu — jak dekoracja kafelków Panelu Głównego. */}
      <I aria-hidden className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 text-foreground/[0.04] transition-colors group-hover:text-primary/[0.08]" strokeWidth={1} />
      <span className="flex items-center justify-between">
        <span className="nb-nav-ikona-akt flex h-10 w-10 items-center justify-center rounded-xl text-primary"><I size={19} /></span>
        {znacznik}
      </span>
      <span>
        <span className="block text-[17px] font-semibold text-foreground">{tytul}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-foreground/55">{opis}</span>
      </span>
    </button>
  );
}

export default function WidokStudio({
  outputs = [], onGenerate, onDelete, hasSources, isGenerating, apiKeys,
  szkice = [], onOtworzSzkic, onNowySzkic, ilePowtorek = 0, liczbaKart = 0, onPowtorki, onTabela,
}) {
  const [narzedzie, setNarzedzie] = useState(null);

  return (
    <div className="h-full min-h-0 overflow-y-auto px-6 pb-10 pt-2 custom-scrollbar">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <section>
          <Etykieta>Twoje narzędzia</Etykieta>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DuzyKafel ikona={FilePen} tytul="Żywy szkic" opis="Piszesz Ty — każdy akapit sprawdzany ze źródłami" onClick={onNowySzkic} />
            <DuzyKafel
              ikona={GraduationCap}
              tytul="Powtórki"
              opis={liczbaKart ? `${liczbaKart} fiszek w talii` : 'Wygeneruj fiszki poniżej, żeby zacząć'}
              znacznik={ilePowtorek > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground">{ilePowtorek} dziś</span>}
              onClick={onPowtorki}
            />
            <DuzyKafel ikona={Table2} tytul="Tabela ekstrakcji" opis="Te same pytania do każdego źródła, z dowodami" onClick={onTabela} disabled={!hasSources} />
          </div>
        </section>

        <section>
          <Etykieta>Generuj ze źródeł</Etykieta>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {STUDIO_TOOLS.map((t) => {
              const I = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNarzedzie(t)}
                  disabled={!hasSources || isGenerating}
                  title={hasSources ? t.description : 'Dodaj źródło, żeby użyć'}
                  className={cn(KAFEL_KLIK, 'group flex h-[108px] flex-col justify-between p-4 text-left disabled:cursor-not-allowed disabled:opacity-45')}
                >
                  <span className="flex items-center justify-between">
                    <span className="nb-nav-ikona flex h-8 w-8 items-center justify-center rounded-lg text-foreground/70 group-hover:text-primary"><I size={16} /></span>
                    <ChevronRight size={15} className="text-foreground/25 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-medium text-foreground">{t.label}</span>
                    <span className="block truncate text-[12px] text-foreground/50">{t.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr]">
          <section>
            <Etykieta prawa={<span className="text-[12px] text-foreground/45">{szkice.length}</span>}>Szkice</Etykieta>
            <div className={cn(KAFEL, 'p-2')}>
              {!szkice.length ? (
                <button type="button" onClick={onNowySzkic} className="flex w-full items-center gap-3 rounded-xl px-3 py-4 text-left text-[13.5px] text-foreground/55 hover:bg-foreground/[0.04] hover:text-foreground">
                  <FilePen size={17} className="text-primary/70" /> Zacznij pierwszy szkic — albo kliknij „Edytuj" pod odpowiedzią w czacie
                </button>
              ) : szkice.map((sz) => {
                const niepuste = sz.akapity.filter((a) => a.tekst.trim());
                const ok = niepuste.filter((a) => a.wynik?.status === 'potwierdzone').length;
                const zle = niepuste.filter((a) => ['sprzeczne', 'brak'].includes(a.wynik?.status)).length;
                const proc = niepuste.length ? Math.round((ok / niepuste.length) * 100) : 0;
                return (
                  <button key={sz.id} type="button" onClick={() => onOtworzSzkic(sz.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-foreground/[0.04]">
                    <span className="nb-nav-ikona flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary/80"><FilePen size={17} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-foreground">{sz.tytul || 'Bez tytułu'}</span>
                      <span className="mt-1 flex items-center gap-2 text-[12px] text-foreground/50">
                        <span className="h-1 w-20 overflow-hidden rounded-full bg-foreground/10"><span className="block h-full rounded-full bg-emerald-400" style={{ width: `${proc}%` }} /></span>
                        {proc}% pokrycia
                        {zle > 0 && <span className="font-semibold text-destructive">· {zle} do poprawy</span>}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] text-foreground/40">{ileTemu(sz.zmieniono)}</span>
                    {proc === 100 && <ShieldCheck size={15} className="shrink-0 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <Etykieta prawa={<span className="text-[12px] text-foreground/45">{outputs.length}</span>}>Dokumenty</Etykieta>
            {!outputs.length ? (
              <div className={cn(KAFEL, 'flex flex-col items-center px-6 py-10 text-center')}>
                <span className="nb-nav-ikona-akt flex h-11 w-11 items-center justify-center rounded-xl text-primary"><Wand2 size={19} /></span>
                <p className="mt-3 text-[14px] font-semibold text-foreground">Tu zapiszą się gotowe dokumenty</p>
                <p className="mt-1 text-[12.5px] text-foreground/50">{hasSources ? 'Wybierz narzędzie powyżej — raport, fiszki, podcast i więcej.' : 'Najpierw dodaj źródło w zakładce „Źródła".'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...outputs].reverse().map((o) => <StudioOutput key={o.id} output={o} onDelete={onDelete} apiKeys={apiKeys} />)}
              </div>
            )}
          </section>
        </div>
      </div>

      {narzedzie && (
        <TopicDialog tool={narzedzie} onConfirm={(topic) => { onGenerate(narzedzie, topic); setNarzedzie(null); }} onCancel={() => setNarzedzie(null)} />
      )}
    </div>
  );
}
