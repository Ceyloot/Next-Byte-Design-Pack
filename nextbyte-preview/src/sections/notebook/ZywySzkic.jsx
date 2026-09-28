/* ═══════════════════════════════════════════════════════════════
   ŻYWY SZKIC — autorska funkcja Next Scribe

   Problem (research: XDA, Android Police, Reddit): w NotebookLM tekst
   od AI jest „eksponatem w muzeum". Można go skopiować, ale nie da się
   go poprawić na miejscu, a po skopiowaniu cytaty przestają działać.
   Kto poprawi jedno zdanie, traci pewność, czy nadal ma ono pokrycie
   w źródłach.

   Tutaj odpowiedź (albo pusty dokument) staje się edytowalnym szkicem
   złożonym z akapitów. Każdy akapit ma własny status pokrycia:
     • zielony  — potwierdzone przez źródła,
     • bursztyn — potwierdzone częściowo,
     • szary    — brak w źródłach,
     • czerwony — źródło mówi coś innego,
     • kreska   — zmieniony od ostatniego sprawdzenia.
   Edycja akapitu natychmiast zdejmuje z niego status — nie da się
   niechcący zostawić zielonej kropki przy zdaniu, które już ktoś
   przepisał. „Sprawdź" wysyła do AI tylko akapity bez aktualnej oceny.

   Klawiatura jak w edytorze tekstu: Enter dzieli akapit w miejscu
   kursora, Backspace na początku skleja z poprzednim, strzałki
   góra/dół przechodzą między akapitami.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, ShieldCheck, Loader2, Copy, Download, FileText, Quote, ExternalLink, Sparkles, Plus, Trash2, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';
import { zweryfikujAkapity, STATUSY } from './utils/nextScribeAi';
import { linkDoZrodla, pobierzPlik } from './utils/eksport';

/* Kolory statusów — w podglądzie nie ma tokenów success/warning, więc
   zieleń i bursztyn są tu jawnie; czerwień idzie z `--destructive`. */
const WYGLAD = {
  potwierdzone: { kreska: 'bg-emerald-400', kropka: 'bg-emerald-400', tekst: 'text-emerald-400', tlo: 'bg-emerald-400/10 border-emerald-400/30' },
  czesciowe: { kreska: 'bg-amber-400', kropka: 'bg-amber-400', tekst: 'text-amber-400', tlo: 'bg-amber-400/10 border-amber-400/30' },
  brak: { kreska: 'bg-foreground/30', kropka: 'bg-foreground/40', tekst: 'text-foreground/60', tlo: 'bg-foreground/[0.05] border-foreground/15' },
  sprzeczne: { kreska: 'bg-destructive', kropka: 'bg-destructive', tekst: 'text-destructive', tlo: 'bg-destructive/10 border-destructive/30' },
  niesprawdzone: { kreska: 'bg-foreground/10', kropka: 'border border-dashed border-foreground/40', tekst: 'text-foreground/45', tlo: 'bg-foreground/[0.03] border-foreground/10' },
};

const nowyId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

/** Znaczniki cytatów z odpowiedzi AI: [3], [3, 5], [id, 1:23], [Tytuł, 0:18] — pokrycie liczy się od nowa. */
const ZNACZNIK_CYTATU = /\s*\[(?:\d+(?:\s*,\s*\d+)*|[^\]\n]{1,80}?,\s*\d{1,2}:\d{2}(?::\d{2})?)\]/g;

/**
 * Markdown z odpowiedzi AI → akapity do pisania.
 * Szkic to tekst, nie kod: nagłówki tracą `#`, pogrubienia gwiazdki, a każdy punkt
 * listy staje się osobnym akapitem („•", a wcięty „–"), bo to pojedyncze
 * twierdzenia, które trzeba móc sprawdzić osobno.
 */
export function tekstNaAkapity(tekst) {
  const wyniki = [];
  let bufor = [];
  const zamknij = () => {
    const t = bufor.join(' ').replace(/\s+/g, ' ').trim();
    if (t) wyniki.push(t);
    bufor = [];
  };
  String(tekst || '')
    .replace(ZNACZNIK_CYTATU, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .split('\n')
    .forEach((wiersz) => {
      if (!wiersz.trim()) { zamknij(); return; }
      const naglowek = wiersz.match(/^\s*#{1,6}\s+(.*)$/);
      if (naglowek) { zamknij(); wyniki.push(naglowek[1].trim()); return; }
      if (/^\s*(---|\*\*\*|___)\s*$/.test(wiersz)) { zamknij(); return; }
      const punkt = wiersz.match(/^(\s*)(?:[-*+•]|\d+[.)])\s+(.*)$/);
      if (punkt) {
        zamknij();
        const wciety = punkt[1].replace(/\t/g, '  ').length >= 2;
        bufor.push(`${wciety ? '– ' : '• '}${punkt[2].trim()}`);
        return;
      }
      bufor.push(wiersz.trim());
    });
  zamknij();
  return wyniki.map((t) => ({ id: nowyId(), tekst: t, wynik: null }));
}

export function nowySzkic(tytul = 'Nowy szkic', tekst = '') {
  const akapity = tekstNaAkapity(tekst);
  return {
    id: nowyId(),
    tytul,
    akapity: akapity.length ? akapity : [{ id: nowyId(), tekst: '', wynik: null }],
    utworzono: new Date().toISOString(),
    zmieniono: new Date().toISOString(),
  };
}

/* ── Pole akapitu: textarea, która rośnie z tekstem ─────────────── */
function PoleAkapitu({ akapit, aktywny, onFocus, onZmiana, onKlawisz, rejestruj }) {
  const ref = useRef(null);
  useEffect(() => { rejestruj(akapit.id, ref.current); }, [akapit.id, rejestruj]);
  useEffect(() => {
    const el = ref.current;
    // Nowe przeglądarki rosną same (`field-sizing: content`). Pomiar to rezerwa —
    // i nie wolno mu wpisać zera: w ukrytej karcie scrollHeight = 0 i akapity znikały.
    if (!el) return;
    if (typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')) { el.style.height = ''; return; }
    el.style.height = 'auto';
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
  }, [akapit.tekst]);

  const status = akapit.wynik?.status || 'niesprawdzone';
  const w = WYGLAD[status];

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-xl py-1.5 pl-4 pr-3 transition-colors duration-200',
        aktywny ? 'bg-foreground/[0.04]' : 'hover:bg-foreground/[0.025]',
      )}
    >
      {/* Kreska pokrycia przy lewej krawędzi — czyta się bez czytania tekstu. */}
      <span aria-hidden className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-colors', w.kreska)} />
      <textarea
        ref={ref}
        value={akapit.tekst}
        onFocus={onFocus}
        onChange={(e) => onZmiana(e.target.value)}
        onKeyDown={onKlawisz}
        rows={1}
        style={{ fieldSizing: 'content' }}
        placeholder="Pisz albo wklej tekst…"
        aria-label={`Akapit — ${STATUSY[status].etykieta}`}
        className="min-h-[28px] w-full resize-none overflow-hidden bg-transparent text-[15.5px] leading-[1.7] text-foreground outline-none placeholder:text-foreground/30"
      />
      <span
        title={STATUSY[status].etykieta}
        className={cn('mt-[11px] h-2 w-2 shrink-0 rounded-full', w.kropka)}
      />
    </div>
  );
}

/* ── Główny komponent ───────────────────────────────────────────── */
export default function ZywySzkic({ szkic: wejscie, zrodla = [], apiKeys, onZapisz, onZamknij, onUsun, onOtworzZrodlo }) {
  const toast = useToast();
  const [szkic, setSzkic] = useState(wejscie);
  const [aktywnyId, setAktywnyId] = useState(wejscie.akapity[0]?.id);
  const [sprawdzam, setSprawdzam] = useState(false);
  const [postep, setPostep] = useState(null);
  const pola = useRef({});
  const rejestruj = useMemo(() => (id, el) => { if (el) pola.current[id] = el; else delete pola.current[id]; }, []);
  const doFokusu = useRef(null);

  // Zapis w tle przy każdej zmianie — szkic nigdy nie „ginie" po zamknięciu okna.
  useEffect(() => {
    const t = setTimeout(() => onZapisz?.({ ...szkic, zmieniono: new Date().toISOString() }), 400);
    return () => clearTimeout(t);
  }, [szkic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fokus po podziale / sklejeniu akapitów.
  useEffect(() => {
    const cel = doFokusu.current;
    if (!cel) return;
    const el = pola.current[cel.id];
    if (el) { el.focus(); el.setSelectionRange(cel.pozycja, cel.pozycja); }
    doFokusu.current = null;
  });

  // Escape zamyka.
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onZamknij?.(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onZamknij]);

  const ustawAkapity = (fn) => setSzkic((s) => ({ ...s, akapity: fn(s.akapity) }));

  const zmienTekst = (id, tekst) => ustawAkapity((as) => as.map((a) => (
    // Każda zmiana treści zdejmuje ocenę: status dotyczył INNEGO tekstu.
    a.id === id ? { ...a, tekst, wynik: a.wynik ? { ...a.wynik, status: 'niesprawdzone' } : null } : a
  )));

  const klawisz = (e, idx) => {
    const el = e.currentTarget;
    const a = szkic.akapity[idx];
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const przed = a.tekst.slice(0, el.selectionStart);
      const po = a.tekst.slice(el.selectionEnd);
      const nowy = { id: nowyId(), tekst: po, wynik: null };
      ustawAkapity((as) => {
        const kopia = [...as];
        kopia.splice(idx, 1, { ...a, tekst: przed, wynik: a.wynik && przed !== a.tekst ? { ...a.wynik, status: 'niesprawdzone' } : a.wynik }, nowy);
        return kopia;
      });
      doFokusu.current = { id: nowy.id, pozycja: 0 };
      setAktywnyId(nowy.id);
      return;
    }
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && idx > 0) {
      e.preventDefault();
      const poprzedni = szkic.akapity[idx - 1];
      const pozycja = poprzedni.tekst.length;
      ustawAkapity((as) => {
        const kopia = [...as];
        kopia.splice(idx - 1, 2, { ...poprzedni, tekst: poprzedni.tekst + a.tekst, wynik: poprzedni.wynik ? { ...poprzedni.wynik, status: 'niesprawdzone' } : null });
        return kopia;
      });
      doFokusu.current = { id: poprzedni.id, pozycja };
      setAktywnyId(poprzedni.id);
      return;
    }
    if (e.key === 'ArrowUp' && el.selectionStart === 0 && idx > 0) {
      e.preventDefault();
      const cel = szkic.akapity[idx - 1];
      doFokusu.current = { id: cel.id, pozycja: cel.tekst.length };
      setAktywnyId(cel.id);
    }
    if (e.key === 'ArrowDown' && el.selectionEnd === a.tekst.length && idx < szkic.akapity.length - 1) {
      e.preventDefault();
      const cel = szkic.akapity[idx + 1];
      doFokusu.current = { id: cel.id, pozycja: 0 };
      setAktywnyId(cel.id);
    }
  };

  const doSprawdzenia = szkic.akapity.filter((a) => a.tekst.trim() && (!a.wynik || a.wynik.status === 'niesprawdzone'));

  const sprawdz = async () => {
    if (!doSprawdzenia.length) { toast.success('Wszystkie akapity są już sprawdzone.'); return; }
    setSprawdzam(true);
    /* Paczki po 25 akapitów: długa odpowiedź (100+ punktów listy) w jednym
       wywołaniu przekroczyłaby limit odpowiedzi modelu. Wyniki spływają na
       żywo — widać postęp, a przerwanie w połowie nie kasuje już sprawdzonych. */
    const PACZKA = 25;
    const wszystkie = [];
    try {
      for (let i = 0; i < doSprawdzenia.length; i += PACZKA) {
        const czesc = doSprawdzenia.slice(i, i + PACZKA);
        setPostep({ zrobione: i, razem: doSprawdzenia.length });
        const wyniki = await zweryfikujAkapity(apiKeys?.gemini, apiKeys?.model, czesc.map((a) => a.tekst), zrodla);
        const mapa = Object.fromEntries(czesc.map((a, j) => [a.id, { ...wyniki[j], tekstSprawdzony: a.tekst }]));
        // Akapit poprawiony w trakcie sprawdzania nie dostaje starej oceny.
        ustawAkapity((as) => as.map((a) => (mapa[a.id] && mapa[a.id].tekstSprawdzony === a.tekst ? { ...a, wynik: mapa[a.id] } : a)));
        wszystkie.push(...wyniki);
      }
      const zle = wszystkie.filter((w) => w.status === 'sprzeczne' || w.status === 'brak').length;
      toast.success(zle ? `Sprawdzono ${wszystkie.length} akapitów — ${zle} wymaga uwagi.` : `Sprawdzono ${wszystkie.length} akapitów — wszystko ma pokrycie.`);
    } catch (err) {
      toast.error(err.message || 'Nie udało się sprawdzić szkicu.');
    } finally {
      setSprawdzam(false);
      setPostep(null);
    }
  };

  const liczniki = useMemo(() => {
    const l = { potwierdzone: 0, czesciowe: 0, brak: 0, sprzeczne: 0, niesprawdzone: 0 };
    szkic.akapity.forEach((a) => { if (a.tekst.trim()) l[a.wynik?.status || 'niesprawdzone'] += 1; });
    return l;
  }, [szkic.akapity]);
  const niepuste = szkic.akapity.filter((a) => a.tekst.trim()).length;
  const pokrycie = niepuste ? Math.round(((liczniki.potwierdzone + liczniki.czesciowe * 0.5) / niepuste) * 100) : 0;

  const aktywny = szkic.akapity.find((a) => a.id === aktywnyId);
  const zrodloAktywnego = aktywny?.wynik?.zrodloId
    ? zrodla.find((z) => z.id === aktywny.wynik.zrodloId || z.videoId === aktywny.wynik.zrodloId)
    : null;

  const markdown = () => {
    const tresc = szkic.akapity.map((a) => a.tekst.trim()).filter(Boolean).join('\n\n');
    const cyt = szkic.akapity
      .filter((a) => a.wynik?.cytat && a.wynik.status !== 'niesprawdzone')
      .map((a, i) => {
        const z = zrodla.find((x) => x.id === a.wynik.zrodloId || x.videoId === a.wynik.zrodloId);
        const link = linkDoZrodla(z);
        const nazwa = a.wynik.zrodloTytul || z?.title || 'Źródło';
        return `${i + 1}. ${link ? `[${nazwa}](${link})` : nazwa} — „${a.wynik.cytat}”`;
      });
    return `# ${szkic.tytul}\n\n${tresc}${cyt.length ? `\n\n## Źródła\n\n${cyt.join('\n')}` : ''}\n`;
  };

  const przejdzDo = (status) => {
    const cel = szkic.akapity.find((a) => a.tekst.trim() && (a.wynik?.status || 'niesprawdzone') === status);
    if (!cel) return;
    setAktywnyId(cel.id);
    pola.current[cel.id]?.focus();
    pola.current[cel.id]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onZamknij?.(); }}>
      <div className="nbb nbb-tafla !bg-[hsl(var(--card)/0.97)] flex h-full max-h-[920px] w-full max-w-[1180px] flex-col" role="dialog" aria-label="Żywy szkic">
        {/* NAGŁÓWEK */}
        <div className="relative flex shrink-0 flex-wrap items-center gap-3 px-5 py-3.5">
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <span className="nb-nav-ikona-akt flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary">
            <FileText size={16} strokeWidth={1.75} />
          </span>
          <input
            value={szkic.tytul}
            onChange={(e) => setSzkic((s) => ({ ...s, tytul: e.target.value }))}
            aria-label="Tytuł szkicu"
            className="min-w-0 flex-1 bg-transparent text-[17px] font-semibold tracking-tight text-foreground outline-none placeholder:text-foreground/30"
            placeholder="Tytuł szkicu"
          />
          <button
            type="button"
            onClick={sprawdz}
            disabled={sprawdzam || !niepuste}
            className="flex h-9 items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 text-[13px] font-semibold text-foreground transition-colors hover:bg-primary/25 disabled:opacity-50"
          >
            {sprawdzam ? <Loader2 size={15} className="animate-spin text-primary" /> : <ShieldCheck size={15} className="text-primary" />}
            {sprawdzam ? (postep && postep.razem > 25 ? `Sprawdzam ${postep.zrobione}/${postep.razem}…` : 'Sprawdzam…') : doSprawdzenia.length ? `Sprawdź ze źródłami · ${doSprawdzenia.length}` : 'Sprawdzone'}
          </button>
          <button type="button" title="Kopiuj jako Markdown" aria-label="Kopiuj jako Markdown" onClick={() => { navigator.clipboard.writeText(markdown()); toast.success('Skopiowano szkic ze źródłami.'); }} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-primary">
            <Copy size={15} />
          </button>
          <button type="button" title="Pobierz .md" aria-label="Pobierz jako plik Markdown" onClick={() => pobierzPlik(szkic.tytul, markdown())} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-primary">
            <Download size={15} />
          </button>
          {onUsun && (
            <button type="button" title="Usuń szkic" aria-label="Usuń szkic" onClick={() => onUsun(szkic.id)} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-destructive">
              <Trash2 size={15} />
            </button>
          )}
          <button type="button" title="Zamknij (Esc)" aria-label="Zamknij" onClick={onZamknij} className="nb-ikona-kafel flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* PASEK POKRYCIA — liczby klikalne: skaczą do pierwszego akapitu z danym statusem */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 py-2.5">
          <div className="mr-2 flex items-center gap-2.5">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-500" style={{ width: `${pokrycie}%` }} />
            </div>
            <span className="text-[12px] font-semibold tabular-nums text-foreground/80">{pokrycie}% pokrycia</span>
          </div>
          {Object.keys(STATUSY).map((k) => liczniki[k] > 0 && (
            <button
              key={k}
              type="button"
              onClick={() => przejdzDo(k)}
              title={STATUSY[k].opis}
              className={cn('flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium transition-colors hover:brightness-125', WYGLAD[k].tlo, WYGLAD[k].tekst)}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', WYGLAD[k].kropka)} />
              {STATUSY[k].etykieta} · {liczniki[k]}
            </button>
          ))}
        </div>

        {/* TREŚĆ: edytor | panel dowodu */}
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-2 custom-scrollbar sm:px-8">
            <div className="mx-auto max-w-[720px] space-y-1">
              {szkic.akapity.map((a, idx) => (
                <PoleAkapitu
                  key={a.id}
                  akapit={a}
                  aktywny={a.id === aktywnyId}
                  onFocus={() => setAktywnyId(a.id)}
                  onZmiana={(t) => zmienTekst(a.id, t)}
                  onKlawisz={(e) => klawisz(e, idx)}
                  rejestruj={rejestruj}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  const nowy = { id: nowyId(), tekst: '', wynik: null };
                  ustawAkapity((as) => [...as, nowy]);
                  doFokusu.current = { id: nowy.id, pozycja: 0 };
                  setAktywnyId(nowy.id);
                }}
                className="ml-4 mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] text-foreground/45 transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <Plus size={13} /> Akapit
              </button>
            </div>
          </div>

          {/* DOWÓD: cytat, który uzasadnia ocenę aktywnego akapitu */}
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-foreground/[0.08] lg:flex">
            <div className="px-5 pb-2 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Dowód w źródłach</div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
              {!aktywny?.tekst?.trim() ? (
                <p className="text-[13px] leading-relaxed text-foreground/50">Kliknij akapit, żeby zobaczyć, na czym opiera się jego ocena.</p>
              ) : !aktywny.wynik || aktywny.wynik.status === 'niesprawdzone' ? (
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-foreground/60">
                    {aktywny.wynik ? 'Ten akapit zmienił się od ostatniego sprawdzenia.' : 'Ten akapit nie był jeszcze sprawdzany.'}
                  </p>
                  <button type="button" onClick={sprawdz} disabled={sprawdzam} className="flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline disabled:opacity-50">
                    <Sparkles size={13} /> Sprawdź teraz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold', WYGLAD[aktywny.wynik.status].tlo, WYGLAD[aktywny.wynik.status].tekst)}>
                    {aktywny.wynik.status === 'potwierdzone' ? <Check size={12} /> : <span className={cn('h-1.5 w-1.5 rounded-full', WYGLAD[aktywny.wynik.status].kropka)} />}
                    {STATUSY[aktywny.wynik.status].etykieta}
                  </div>
                  {aktywny.wynik.uwaga && <p className="text-[13px] leading-relaxed text-foreground/80">{aktywny.wynik.uwaga}</p>}
                  {aktywny.wynik.cytat && (
                    <figure className="nb-ikona-kafel rounded-xl p-3.5">
                      <Quote size={14} className="mb-1.5 text-primary/70" />
                      <blockquote className="text-[13px] italic leading-relaxed text-foreground/85">„{aktywny.wynik.cytat}”</blockquote>
                      <figcaption className="mt-2.5 flex items-center justify-between gap-2 text-[11.5px] text-foreground/55">
                        <span className="min-w-0 truncate">{aktywny.wynik.zrodloTytul || zrodloAktywnego?.title || 'Źródło'}</span>
                        {zrodloAktywnego && onOtworzZrodlo && (
                          <button type="button" onClick={() => onOtworzZrodlo(zrodloAktywnego.id)} className="flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
                            Otwórz <ExternalLink size={11} />
                          </button>
                        )}
                      </figcaption>
                    </figure>
                  )}
                </div>
              )}
            </div>
            <p className="border-t border-foreground/[0.08] px-5 py-3 text-[11px] leading-relaxed text-foreground/40">
              Enter — nowy akapit · Backspace na początku — sklej · edycja zdejmuje ocenę
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
