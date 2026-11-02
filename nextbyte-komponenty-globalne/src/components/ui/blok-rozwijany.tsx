import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { StrzalkaRozwijania } from '@/components/ui/strzalka-rozwijania';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  BLOK ROZWIJANY — jeden rekord, który po kliknięciu pokazuje zawartość
 * ════════════════════════════════════════════════════════════════════════
 *
 * Powstał w zakładce Dokumenty Panelu Klienta („Dokumenty — CRM Klienta"
 * i „Dokumenty — Panel Klienta"), a Kajetan wskazał go jako wzorzec dla
 * zadań: „rozwijany rekord zadań niech wygląda jak ten tutaj" (07.09.2026).
 *
 * Dlatego mieszka TUTAJ, a nie w jednym ekranie: dwa miejsca z tym samym
 * rekordem, złożone osobno, rozjeżdżają się przy pierwszej poprawce — a ta
 * platforma spłacała już dług dokładnie tego rodzaju.
 *
 * Materiał i typografia pochodzą z sekcji „Wygenerowane z szablonów"
 * (`ClientPanelGeneratedDocs`) — to najstarszy egzemplarz tego rekordu
 * i on wyznacza wygląd.
 *
 * ── CZEGO NIE ROBIĆ ─────────────────────────────────────────────────────
 * • Nie dokładać wiedzy o konkretnym ekranie. Blok zna tytuł, ikonę, licznik
 *   i stan otwarcia — nic więcej.
 * • Nie zamieniać na `<details>`. Stan otwarcia bywa sterowany z zewnątrz
 *   (zapamiętanie rozwinięcia, otwarcie z innego miejsca), a `<details>`
 *   trzyma go u siebie.
 */
export const BlokRozwijany: React.FC<{
  ikona: LucideIcon;
  tytul: string;
  /** Liczba w plakietce — mówi, czy w środku coś jest, bez rozwijania. */
  liczba: number;
  /** Drobny dopisek obok tytułu, np. czego dotyczy zakres. */
  dopisek?: string;
  otwarty: boolean;
  onPrzelacz: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ ikona: Ikona, tytul, liczba, dopisek, otwarty, onPrzelacz, children, className }) => (
  /* `cn` — żeby Panel Klienta mógł podać warstwę W1 z rozmyciem (STANDARD-WYGLADU §1a); CRM bez zmian */
  <div className={cn('overflow-hidden rounded-2xl border border-border bg-muted/10', className)}>
    <button data-w-odczycie=""
      type="button"
      onClick={onPrzelacz}
      aria-expanded={otwarty}
      className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5 px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[.15em] text-muted-foreground transition-colors hover:bg-muted/20"
    >
      <Ikona className="h-3.5 w-3.5 shrink-0 text-primary" />
      {tytul}
      <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">
        {liczba}
      </span>
      {/* Dopisek (np. tokeny i data zmiany w „Pamięci projektu"). Na 375 px w jednej
          linii z tytułem dostawał 43 z potrzebnych 112 px i ucinał datę, a `title`
          na dotyku nie istnieje. Poniżej `sm` schodzi więc do drugiej linii
          (`order-last basis-full`, wcięty pod tytuł: ikona 14 px + odstęp 8 px);
          od `sm` stoi obok tytułu i skraca się pierwszy. */}
      {dopisek && (
        <span
          className="order-last basis-full pl-[22px] text-[10px] font-semibold normal-case tracking-normal opacity-70 sm:order-none sm:min-w-0 sm:flex-1 sm:basis-0 sm:truncate sm:pl-0"
          title={dopisek}
        >
          {dopisek}
        </span>
      )}
      <span className="ml-auto shrink-0">
        <StrzalkaRozwijania otwarty={otwarty} />
      </span>
    </button>
    {otwarty && (
      <div className="space-y-3 border-t border-border p-3">
        {children}
      </div>
    )}
  </div>
);

export default BlokRozwijany;
