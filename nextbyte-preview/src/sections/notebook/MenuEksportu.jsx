/* Menu eksportu w nagłówku czatu: cały notatnik (.md) albo sama bibliografia
   w APA / MLA / Chicago — do skopiowania albo pobrania. Wybór stylu pamiętamy. */

import React, { useEffect, useRef, useState } from 'react';
import { Download, BookMarked, Copy, FileDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STYLE, bibliografia, bezMarkdown } from './utils/bibliografia';

const pozycje = (n) => {
  const j = n % 10, d = n % 100;
  if (n === 1) return 'pozycja';
  return j >= 2 && j <= 4 && !(d >= 12 && d <= 14) ? 'pozycje' : 'pozycji';
};

export default function MenuEksportu({ zrodla, onEksportNotatnika, onPobierzPlik, onKomunikat }) {
  const [otwarte, setOtwarte] = useState(false);
  const [styl, setStyl] = useState(() => { try { return localStorage.getItem('nextscribe_styl_bibliografii') || 'apa'; } catch { return 'apa'; } });
  const ref = useRef(null);

  useEffect(() => { try { localStorage.setItem('nextscribe_styl_bibliografii', styl); } catch { /* prywatne okno */ } }, [styl]);
  useEffect(() => {
    if (!otwarte) return undefined;
    const klik = (e) => { if (ref.current && !ref.current.contains(e.target)) setOtwarte(false); };
    const esc = (e) => { if (e.key === 'Escape') setOtwarte(false); };
    window.addEventListener('pointerdown', klik);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', klik); window.removeEventListener('keydown', esc); };
  }, [otwarte]);

  const bib = () => bibliografia(zrodla, styl);
  const nazwaStylu = STYLE.find((x) => x.id === styl)?.nazwa;

  const Pozycja = ({ ikona: I, tytul, opis, onClick, disabled }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { onClick(); setOtwarte(false); }}
      className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-foreground/[0.05] disabled:opacity-40"
    >
      <span className="nb-nav-ikona mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/65"><I size={14} /></span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-foreground">{tytul}</span>
        <span className="block text-[11.5px] leading-snug text-foreground/50">{opis}</span>
      </span>
    </button>
  );

  return (
    <div ref={ref} className="nbb relative">
      <button
        type="button"
        onClick={() => setOtwarte((v) => !v)}
        title="Eksport i bibliografia"
        aria-label="Eksport i bibliografia"
        aria-expanded={otwarte}
        className={cn('nb-ikona-kafel group flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 hover:text-primary', otwarte ? 'text-primary' : 'text-foreground/70')}
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      {otwarte && (
        <div className="nbb-tafla !absolute !bg-[hsl(var(--card)/0.96)] right-0 top-9 z-50 w-[300px] p-1.5 shadow-2xl shadow-black/40">
          <Pozycja ikona={FileDown} tytul="Cały notatnik (.md)" opis={`Źródła, notatki, szkice, zadania, Studio, rozmowa z przypisami + bibliografia ${nazwaStylu}`} onClick={() => onEksportNotatnika(styl)} />
          <div className="my-1 h-px bg-foreground/[0.07]" />
          <div className="flex items-center gap-1 px-2.5 pb-1 pt-1.5">
            <BookMarked size={13} className="text-foreground/45" />
            <span className="mr-auto text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">Bibliografia</span>
            {STYLE.map((s) => (
              <button key={s.id} type="button" onClick={() => setStyl(s.id)} className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors', styl === s.id ? 'border-primary/40 bg-primary/15 text-foreground' : 'border-transparent text-foreground/50 hover:text-foreground')}>
                {styl === s.id && <Check size={10} className="text-primary" />}{s.nazwa}
              </button>
            ))}
          </div>
          <Pozycja ikona={Copy} tytul="Kopiuj bibliografię" opis={`${zrodla.length} ${pozycje(zrodla.length)}, alfabetycznie, bez formatowania`} disabled={!zrodla.length} onClick={() => { navigator.clipboard.writeText(bezMarkdown(bib())); onKomunikat?.(`Skopiowano bibliografię (${nazwaStylu}).`); }} />
          <Pozycja ikona={Download} tytul="Pobierz bibliografię (.md)" opis="Z kursywą tytułów — gotowa do Worda po konwersji" disabled={!zrodla.length} onClick={() => onPobierzPlik(`Bibliografia ${nazwaStylu}`, `# Bibliografia (${nazwaStylu})\n\n${bib()}\n`)} />
        </div>
      )}
    </div>
  );
}
