import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  STANY — co widać, gdy NIE MA jeszcze danych
 * ════════════════════════════════════════════════════════════════════════
 *
 * Te dwa stany są w platformie najbardziej zaniedbane, a paradoksalnie
 * najczęściej oglądane: szkielet widzi KAŻDY użytkownik przy każdym wejściu
 * na ekran, a pusty stan widzi każdy nowy użytkownik przy pierwszym.
 * Czyli pierwsze wrażenie z platformy to dokładnie te dwa widoki — i one
 * dziś nie są zaprojektowane, tylko doklejone tam, gdzie ktoś pamiętał.
 *
 * ── SZKIELET ────────────────────────────────────────────────────────────
 * Zasada jedna: szkielet ma mieć KSZTAŁT DOCELOWEJ TREŚCI. Kręcące się kółko
 * mówi „czekaj", szkielet mówi „za chwilę będzie tu tabela z pięcioma wierszami"
 * — i dzięki temu nic nie skacze w chwili, gdy dane dojdą.
 *
 * ── PUSTY STAN ──────────────────────────────────────────────────────────
 * Pusty stan NIE jest komunikatem o błędzie. „Brak danych" to zdanie, które
 * niczego nie załatwia. Dobry pusty stan mówi trzy rzeczy: co tu będzie,
 * dlaczego jeszcze tego nie ma i CO ZROBIĆ, żeby się pojawiło. Stąd `akcja`
 * jest częścią komponentu, a nie czymś doklejanym z zewnątrz.
 */

/* ── SZKIELET ─────────────────────────────────────────────────────────── */

export interface SzkieletProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ile udawanych wierszy — dobierz tyle, ile realnie pokaże się po załadowaniu */
  wierszy?: number;
  /** kształt: pasek tekstu, koło (awatar), prostokąt (obraz, karta) */
  ksztalt?: 'tekst' | 'kolo' | 'blok';
}

export const Szkielet: React.FC<SzkieletProps> = ({
  wierszy = 3, ksztalt = 'tekst', className, ...rest
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="Ładowanie"
    className={cn('space-y-2', className)}
    {...rest}
  >
    {Array.from({ length: wierszy }, (_, i) => (
      <span
        key={i}
        aria-hidden="true"
        className={cn(
          /*
            PRZESUWANE PASMO ŚWIATŁA, nie pulsowanie krycia.
            `animate-pulse` przygasza i rozjaśnia całą belkę naraz — to czyta się
            jak migający element, nie jak ładowanie. Pasmo przesuwające się w bok
            ma KIERUNEK, więc mózg widzi ruch „coś tu leci", a nie awarię.
            To ten sam gest, co przesuwane światło na przycisku szklanym.
          */
          'relative block overflow-hidden rounded-md bg-foreground/[0.06]',
          'before:absolute before:inset-0 before:-translate-x-full before:animate-[nb-polysk_1.6s_ease-in-out_infinite]',
          'before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.09] before:to-transparent',
          'motion-reduce:before:hidden',
          ksztalt === 'kolo' && 'h-10 w-10 rounded-full',
          ksztalt === 'blok' && 'h-24 w-full rounded-xl',
          // Ostatni pasek jest KRÓTSZY — tak wygląda prawdziwy akapit i dzięki
          // temu szkielet czyta się jako tekst, a nie jako tabela pustych belek.
          ksztalt === 'tekst' && (i === wierszy - 1 ? 'h-3 w-2/3' : 'h-3 w-full'),
        )}
      />
    ))}
    {/* Czytnik ekranu dostaje jedno zdanie zamiast opisu każdej belki z osobna. */}
    <span className="sr-only">Trwa ładowanie danych…</span>
  </div>
);

/* ── PUSTY STAN ───────────────────────────────────────────────────────── */

export interface PustyStanProps {
  ikona?: LucideIcon;
  /** CO tu będzie — rzeczownik, nie zdanie: „Brak notatek" */
  tytul: React.ReactNode;
  /** DLACZEGO jeszcze tego nie ma i co z tym zrobić */
  opis?: React.ReactNode;
  /** przycisk, który to naprawia — pusty stan bez wyjścia jest ślepą uliczką */
  akcja?: React.ReactNode;
  className?: string;
}

export const PustyStan: React.FC<PustyStanProps> = ({
  ikona: Ikona, tytul, opis, akcja, className,
}) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-10 text-center', className)}>
    {Ikona && (
      <span
        aria-hidden="true"
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/40 text-muted-foreground"
      >
        <Ikona className="h-5 w-5" />
      </span>
    )}

    <p className="text-[16px] font-semibold tracking-tight text-foreground">{tytul}</p>

    {opis && (
      // `max-w-sm` — linia dłuższa niż ~60 znaków przestaje się wygodnie czytać,
      // a pusty stan trafia często na całą szerokość ekranu.
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted-foreground">{opis}</p>
    )}

    {akcja && <div className="mt-4">{akcja}</div>}
  </div>
);
