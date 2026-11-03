import { useState } from 'react';
import {
  Bot, Brain, Building2, Calendar, Camera, Cloud, GraduationCap,
  LayoutDashboard, MessageSquare, PenTool, Search, Shield, ShoppingBag,
  Sparkles, SquareCheckBig, StickyNote, Video, WandSparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CIEN_KARTY, TAFLA } from './system';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PASEK BOCZNY — traktowany jak treść, nie jak margines
 * ════════════════════════════════════════════════════════════════════════
 *
 * Wzór: DocuVerse. Jasna tafla w jednym kawałku, pozycja aktywna jako
 * pigułka z delikatnym gradientem i cieniem, u dołu wizytówka konta.
 *
 * Karta zachęty, która stała tu wcześniej, przeniosła się do dzwonka
 * powiadomień. Dzienne Byte to komunikat o planie, a nie element nawigacji —
 * w pasku konkurowało z listą modułów, w powiadomieniach jest tam, gdzie
 * człowiek i tak zagląda po nowe rzeczy.
 *
 * Pozycje spisane z zapisanej strony platformy — bez Panelu Handlowca,
 * Red Zone i Firmy, zgodnie z ustaleniem.
 */

type Pozycja = { etykieta: string; ikona: LucideIcon };
type Grupa = { tytul?: string; pozycje: Pozycja[] };

const GRUPY: Grupa[] = [
  { pozycje: [{ etykieta: 'Panel Główny', ikona: LayoutDashboard }] },
  {
    tytul: 'AI',
    pozycje: [
      { etykieta: 'Personalny Asystent', ikona: Sparkles },
      { etykieta: 'Chat AI', ikona: MessageSquare },
      { etykieta: 'PromptEx', ikona: WandSparkles },
      { etykieta: 'Pamięć AI', ikona: Brain },
    ],
  },
  {
    tytul: 'Przypięte moduły',
    pozycje: [
      { etykieta: 'Trend', ikona: Bot },
      { etykieta: 'Studio Zdjęć', ikona: Camera },
      { etykieta: 'Studio Video', ikona: Video },
    ],
  },
  {
    tytul: 'Praca',
    pozycje: [
      { etykieta: 'Kalendarz', ikona: Calendar },
      { etykieta: 'Zadania', ikona: SquareCheckBig },
      { etykieta: 'Notatki', ikona: StickyNote },
      { etykieta: 'Tablice', ikona: PenTool },
      { etykieta: 'NextCloud', ikona: Cloud },
    ],
  },
  {
    tytul: 'Panel',
    pozycje: [
      { etykieta: 'Przestrzeń Twórcy', ikona: Sparkles },
      { etykieta: 'Przestrzeń firmowa', ikona: Building2 },
    ],
  },
  {
    tytul: 'Społeczność',
    pozycje: [
      { etykieta: 'Sklep', ikona: ShoppingBag },
      { etykieta: 'Akademia', ikona: GraduationCap },
    ],
  },
  { pozycje: [{ etykieta: 'Zarząd', ikona: Shield }] },
];

export function PasekBoczny() {
  const [aktywna, setAktywna] = useState('Panel Główny');

  return (
    <aside className="hidden w-[248px] shrink-0 p-3 md:block">
      <div
        className="flex h-full flex-col gap-3 rounded-[24px] p-3"
        style={{ background: TAFLA, border: '1px solid hsl(var(--foreground) / 0.07)', boxShadow: CIEN_KARTY }}
      >
        {/* Znak */}
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold text-[hsl(var(--primary-foreground))]"
            style={{
              background: 'linear-gradient(140deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 70%, hsl(var(--foreground))))',
              boxShadow: '0 6px 14px -6px hsl(var(--primary) / 0.6)',
            }}
          >
            N
          </span>
          <span className="text-[15px] font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            NextByte
          </span>
        </div>

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-[13px] px-2.5 text-left transition-colors hover:brightness-[0.98]"
          style={{ background: 'hsl(var(--foreground) / 0.05)', border: '1px solid hsl(var(--foreground) / 0.06)' }}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--foreground)/0.4)]" />
          <span className="flex-1 text-[12.5px] text-[hsl(var(--foreground)/0.42)]">Szukaj…</span>
          <span className="rounded-md px-1.5 py-0.5 text-[10px] text-[hsl(var(--foreground)/0.4)]"
            style={{ background: 'hsl(var(--foreground) / 0.06)' }}>⌘K</span>
        </button>

        <nav className="-mr-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
          {GRUPY.map((g, gi) => (
            <div key={g.tytul ?? gi} className="flex flex-col gap-0.5">
              {g.tytul && (
                <p className="px-2.5 pb-1 pt-2.5 text-[9.5px] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--foreground)/0.35)]">
                  {g.tytul}
                </p>
              )}
              {g.pozycje.map(({ etykieta, ikona: Ik }) => {
                const w = aktywna === etykieta;
                return (
                  <button
                    key={etykieta}
                    type="button"
                    onClick={() => setAktywna(etykieta)}
                    aria-current={w ? 'page' : undefined}
                    className={cn(
                      'flex h-[34px] w-full items-center gap-2.5 rounded-[12px] px-2.5 text-[12.5px] transition-all',
                      w ? 'font-semibold text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground)/0.6)] hover:bg-[hsl(var(--foreground)/0.045)] hover:text-foreground',
                    )}
                    style={w ? {
                      background: 'linear-gradient(100deg, hsl(var(--primary) / 0.16), hsl(var(--primary) / 0.06))',
                      border: '1px solid hsl(var(--primary) / 0.22)',
                      boxShadow: 'inset 0 1px 0 0 hsl(0 0% 100% / 0.1)',
                    } : undefined}
                  >
                    <Ik className="h-[15px] w-[15px] shrink-0" />
                    <span className="truncate">{etykieta}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Wizytówka konta */}
        <div className="flex shrink-0 items-center gap-2.5 px-1">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[hsl(var(--primary))]"
            style={{ background: 'hsl(var(--primary) / 0.13)', border: '1px solid hsl(var(--primary) / 0.2)' }}
          >
            A
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-semibold text-foreground">Artur</span>
            <span className="block truncate text-[10.5px] text-[hsl(var(--foreground)/0.45)]">Plan Start · 57 ⟠</span>
          </span>
        </div>

      </div>
    </aside>
  );
}
