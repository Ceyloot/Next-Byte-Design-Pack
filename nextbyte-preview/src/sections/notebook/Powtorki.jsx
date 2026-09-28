/* ═══════════════════════════════════════════════════════════════
   POWTÓRKI — fiszki z powtórkami rozłożonymi w czasie

   NotebookLM generuje fiszki, ale to jednorazowa kartka: przeglądasz
   i koniec. Nauka działa dopiero, gdy wracasz do karty tuż przed tym,
   jak ją zapomnisz. Tu każda fiszka z Studio trafia do talii, a ocena
   („Nie wiem / Trudne / Dobrze / Łatwe") ustawia, kiedy wróci.

   Harmonogram — Leitner z przedziałami rosnącymi jak w SM-2 (dni):
     pudełko 0 → dziś, 1 → 1, 2 → 3, 3 → 7, 4 → 16, 5 → 35, 6 → 90.
   „Nie wiem" cofa do 0 (karta wraca jeszcze w tej sesji), „Trudne"
   zostawia w pudełku, „Dobrze" +1, „Łatwe" +2.

   Klawiatura: Spacja — odkryj, 1–4 — ocena, Esc — zamknij.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, GraduationCap, RotateCcw, MessageSquare, Check, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRZEDZIALY_DNI = [0, 1, 3, 7, 16, 35, 90];
const NOWYCH_NA_SESJE = 20;
const DZIEN = 24 * 60 * 60 * 1000;

/** Prosty, stabilny hash — id karty z treści pytania (ta sama fiszka = ta sama karta). */
function hash(t) {
  let h = 5381;
  for (let i = 0; i < t.length; i += 1) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return `k${(h >>> 0).toString(36)}`;
}

/** Fiszki z dokumentów Studio w formacie „PYTANIE: … ODPOWIEDŹ: …". */
export function kartyZeStudio(outputs = []) {
  const karty = new Map();
  outputs.filter((o) => o.toolId === 'flashcards' && o.content).forEach((o) => {
    const re = /PYTANIE:\s*([\s\S]*?)\s*ODPOWIED[ŹZ]:\s*([\s\S]*?)(?=\n\s*#{1,6}\s|\n\s*PYTANIE:|$)/gi;
    let m;
    while ((m = re.exec(o.content))) {
      const pytanie = m[1].replace(/\*\*/g, '').trim();
      const odpowiedz = m[2].replace(/\*\*/g, '').trim();
      if (pytanie && odpowiedz) karty.set(hash(pytanie), { id: hash(pytanie), pytanie, odpowiedz, zestaw: o.title });
    }
  });
  return [...karty.values()];
}

export function wczytajPostep(pid) {
  try { return JSON.parse(localStorage.getItem(`nextscribe_powtorki_${pid}`)) || {}; } catch { return {}; }
}
function zapiszPostep(pid, postep) {
  try { localStorage.setItem(`nextscribe_powtorki_${pid}`, JSON.stringify(postep)); } catch { /* prywatne okno */ }
}

/** Ile kart czeka dziś (zaległe + nowe do limitu sesji) — do licznika w Studio. */
export function ileDoPowtorki(karty, postep, teraz = Date.now()) {
  const zalegle = karty.filter((k) => postep[k.id] && postep[k.id].nastepna <= teraz).length;
  const nowe = karty.filter((k) => !postep[k.id]).length;
  return zalegle + Math.min(nowe, NOWYCH_NA_SESJE);
}

const OCENY = [
  { id: 'nie', etykieta: 'Nie wiem', klawisz: '1', kolor: 'border-destructive/40 text-destructive hover:bg-destructive/10' },
  { id: 'trudne', etykieta: 'Trudne', klawisz: '2', kolor: 'border-amber-400/40 text-amber-400 hover:bg-amber-400/10' },
  { id: 'dobrze', etykieta: 'Dobrze', klawisz: '3', kolor: 'border-primary/40 text-primary hover:bg-primary/10' },
  { id: 'latwe', etykieta: 'Łatwe', klawisz: '4', kolor: 'border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10' },
];

function nastepnyStan(stary, ocena, teraz) {
  const pudelko = stary?.pudelko ?? 0;
  const nowe = ocena === 'nie' ? 0 : ocena === 'trudne' ? Math.max(1, pudelko) : ocena === 'dobrze' ? pudelko + 1 : pudelko + 2;
  const p = Math.min(nowe, PRZEDZIALY_DNI.length - 1);
  return {
    pudelko: p,
    nastepna: ocena === 'nie' ? teraz : teraz + PRZEDZIALY_DNI[p] * DZIEN,
    ostatnia: teraz,
    powtorzen: (stary?.powtorzen ?? 0) + 1,
    pomylek: (stary?.pomylek ?? 0) + (ocena === 'nie' ? 1 : 0),
  };
}

function kiedy(ms) {
  const dni = Math.round((ms - Date.now()) / DZIEN);
  if (dni <= 0) return 'dziś';
  if (dni === 1) return 'jutro';
  return `za ${dni} dni`;
}

export default function Powtorki({ projektId, karty, onZapytaj, onZamknij }) {
  const [postep, setPostep] = useState(() => wczytajPostep(projektId));
  const [odkryta, setOdkryta] = useState(false);
  const [wynikiSesji, setWynikiSesji] = useState({ nie: 0, trudne: 0, dobrze: 0, latwe: 0 });

  // Kolejka sesji ustalana RAZ przy otwarciu: zaległe najpierw (najdłużej czekające), potem nowe.
  const [kolejka, setKolejka] = useState(() => {
    const teraz = Date.now();
    const p = wczytajPostep(projektId);
    const zalegle = karty.filter((k) => p[k.id] && p[k.id].nastepna <= teraz).sort((a, b) => p[a.id].nastepna - p[b.id].nastepna);
    const nowe = karty.filter((k) => !p[k.id]).slice(0, NOWYCH_NA_SESJE);
    return [...zalegle, ...nowe].map((k) => k.id);
  });
  const [poczatkowo] = useState(() => kolejka.length);
  const aktualna = karty.find((k) => k.id === kolejka[0]);

  const ocen = useCallback((ocena) => {
    if (!aktualna || !odkryta) return;
    const teraz = Date.now();
    const nowy = { ...postep, [aktualna.id]: nastepnyStan(postep[aktualna.id], ocena, teraz) };
    setPostep(nowy);
    zapiszPostep(projektId, nowy);
    setWynikiSesji((w) => ({ ...w, [ocena]: w[ocena] + 1 }));
    // „Nie wiem" — karta wraca na koniec tej sesji, reszta wypada z kolejki.
    setKolejka((q) => (ocena === 'nie' ? [...q.slice(1), q[0]] : q.slice(1)));
    setOdkryta(false);
  }, [aktualna, odkryta, postep, projektId]);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onZamknij();
      if (e.key === ' ' && !odkryta) { e.preventDefault(); setOdkryta(true); }
      const o = OCENY.find((x) => x.klawisz === e.key);
      if (o) ocen(o.id);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [odkryta, ocen, onZamknij]);

  const statystyki = useMemo(() => {
    const opanowane = karty.filter((k) => (postep[k.id]?.pudelko ?? 0) >= 4).length;
    const w_nauce = karty.filter((k) => postep[k.id] && postep[k.id].pudelko < 4).length;
    const najblizsza = karty.map((k) => postep[k.id]?.nastepna).filter((t) => t && t > Date.now()).sort((a, b) => a - b)[0];
    return { opanowane, w_nauce, nowe: karty.length - opanowane - w_nauce, najblizsza };
  }, [karty, postep]);

  const zrobione = poczatkowo - kolejka.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onZamknij(); }}>
      <div className="nbb nbb-tafla !bg-[hsl(var(--card)/0.97)] flex w-full max-w-[720px] flex-col" role="dialog" aria-label="Powtórki">
        <div className="relative flex items-center gap-3 px-5 py-3.5">
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <span className="nb-nav-ikona-akt flex h-8 w-8 items-center justify-center rounded-lg text-primary"><GraduationCap size={16} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-foreground">Powtórki</h2>
            <p className="text-[11.5px] text-foreground/50">{statystyki.opanowane} opanowane · {statystyki.w_nauce} w nauce · {statystyki.nowe} nowe</p>
          </div>
          {poczatkowo > 0 && kolejka.length > 0 && (
            <span className="text-[12px] tabular-nums text-foreground/55">{zrobione}/{poczatkowo}</span>
          )}
          <button type="button" onClick={onZamknij} aria-label="Zamknij" className="nb-ikona-kafel flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:text-foreground"><X size={15} /></button>
        </div>
        {poczatkowo > 0 && (
          <div className="h-0.5 w-full bg-foreground/[0.06]">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(zrobione / poczatkowo) * 100}%` }} />
          </div>
        )}

        {!karty.length ? (
          <div className="px-8 py-14 text-center">
            <p className="text-[14px] font-medium text-foreground">Nie masz jeszcze fiszek</p>
            <p className="mt-1.5 text-[13px] text-foreground/55">Wygeneruj „Fiszki" w Studio — trafią tu automatycznie.</p>
          </div>
        ) : !aktualna ? (
          <div className="px-8 py-12 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400"><Check size={22} /></span>
            <p className="mt-4 text-[16px] font-semibold text-foreground">{poczatkowo ? 'Sesja zakończona' : 'Na dziś wszystko powtórzone'}</p>
            {poczatkowo > 0 && (
              <p className="mt-1.5 text-[13px] text-foreground/60">
                Dobrze lub łatwo: {wynikiSesji.dobrze + wynikiSesji.latwe} · trudne: {wynikiSesji.trudne} · do powtórki: {wynikiSesji.nie}
              </p>
            )}
            {statystyki.najblizsza && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-foreground/50">
                <CalendarClock size={13} /> Kolejne karty {kiedy(statystyki.najblizsza)}
              </p>
            )}
          </div>
        ) : (
          <div className="px-6 pb-6 pt-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/40">
              {aktualna.zestaw}{postep[aktualna.id] ? ` · powtórka nr ${postep[aktualna.id].powtorzen + 1}` : ' · nowa karta'}
            </p>
            <div className="nb-ikona-kafel min-h-[220px] rounded-2xl p-6">
              <p className="text-[19px] font-medium leading-snug text-foreground">{aktualna.pytanie}</p>
              {odkryta ? (
                <div className="mt-5 border-t border-foreground/[0.08] pt-5">
                  <p className="text-[15px] leading-relaxed text-foreground/85">{aktualna.odpowiedz}</p>
                  {onZapytaj && (
                    <button type="button" onClick={() => onZapytaj(`Wyjaśnij mi dokładniej na podstawie źródeł: ${aktualna.pytanie}`)} className="mt-3 flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline">
                      <MessageSquare size={13} /> Nie rozumiem — wyjaśnij w czacie
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => setOdkryta(true)} className="mt-8 flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-[13px] font-medium text-foreground/75 transition-colors hover:border-primary/40 hover:text-foreground">
                  <RotateCcw size={14} /> Pokaż odpowiedź <kbd className="ml-1 rounded border border-foreground/15 px-1 font-mono text-[10px] text-foreground/45">Spacja</kbd>
                </button>
              )}
            </div>

            <div className={cn('mt-4 grid grid-cols-4 gap-2 transition-opacity', odkryta ? 'opacity-100' : 'pointer-events-none opacity-30')}>
              {OCENY.map((o) => {
                const podglad = nastepnyStan(postep[aktualna.id], o.id, Date.now());
                return (
                  <button key={o.id} type="button" onClick={() => ocen(o.id)} className={cn('flex flex-col items-center gap-0.5 rounded-xl border py-2.5 transition-colors', o.kolor)}>
                    <span className="text-[13px] font-semibold">{o.etykieta}</span>
                    <span className="text-[10.5px] text-foreground/45">{o.id === 'nie' ? 'za chwilę' : kiedy(podglad.nastepna)} · {o.klawisz}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
