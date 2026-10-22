/* Pasek nad podglądem źródła: kiedy sprawdzono, „Odśwież teraz" i lista
   zmian od poprzedniej wersji (zob. utils/zywe.js). Tylko źródła z adresem. */

import React, { useState } from 'react';
import { RefreshCw, Loader2, ChevronDown, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { odswiezalne, ileTemu } from './utils/zywe';

export default function PasekZywegoZrodla({ zrodlo, odswiezam, onOdswiez }) {
  const [pokaz, setPokaz] = useState(false);
  if (!odswiezalne(zrodlo)) return null;
  const z = zrodlo.zmiany;
  const sa = z && !z.bezZmian;

  return (
    <div className="nbb shrink-0 border-b border-foreground/[0.08] px-5 py-2.5 pr-14">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[12px] text-foreground/55">
          <span className={cn('h-1.5 w-1.5 rounded-full', sa ? 'bg-amber-400' : 'bg-emerald-400')} />
          Sprawdzono {ileTemu(zrodlo.sprawdzono || zrodlo.createdAt)}
        </span>
        {z && (z.bezZmian ? (
          <span className="flex items-center gap-1 text-[12px] text-emerald-400"><CheckCircle2 size={12} /> bez zmian od poprzedniej wersji</span>
        ) : (
          <button type="button" onClick={() => setPokaz((v) => !v)} className="flex items-center gap-1.5 text-[12px] font-medium text-amber-400 hover:underline">
            {z.dodane.length > 0 && <span>+{z.dodane.length} nowych</span>}
            {z.usuniete.length > 0 && <span>−{z.usuniete.length} usuniętych</span>}
            <span className="text-foreground/40">fragmentów</span>
            <ChevronDown size={12} className={cn('transition-transform', pokaz && 'rotate-180')} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOdswiez(zrodlo.id)}
          disabled={odswiezam}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 text-[12px] font-medium text-foreground hover:bg-primary/20 disabled:opacity-50"
        >
          {odswiezam ? <Loader2 size={12} className="animate-spin text-primary" /> : <RefreshCw size={12} className="text-primary" />}
          {odswiezam ? 'Pobieram…' : 'Odśwież teraz'}
        </button>
      </div>
      {pokaz && sa && (
        <div className="mt-2.5 max-h-48 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
          {z.dodane.slice(0, 30).map((t, i) => (
            <p key={`d${i}`} className="flex gap-2 rounded-md bg-emerald-400/[0.07] px-2 py-1 text-[12.5px] leading-snug text-foreground/85"><Plus size={12} className="mt-0.5 shrink-0 text-emerald-400" />{t}</p>
          ))}
          {z.usuniete.slice(0, 30).map((t, i) => (
            <p key={`u${i}`} className="flex gap-2 rounded-md bg-destructive/[0.07] px-2 py-1 text-[12.5px] leading-snug text-foreground/55 line-through decoration-destructive/50"><Minus size={12} className="mt-0.5 shrink-0 text-destructive" />{t}</p>
          ))}
          {(z.dodane.length > 30 || z.usuniete.length > 30) && <p className="px-2 text-[11.5px] text-foreground/45">…i więcej. Pełna nowa treść jest w podglądzie poniżej.</p>}
        </div>
      )}
    </div>
  );
}
