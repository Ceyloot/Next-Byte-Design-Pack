import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { klasyKafelka } from './tile';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PROFIL OSOBY — nagłówek jak w serwisie społecznościowym (zdjęcie w tle, zdjęcie profilowe, imię)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kajetan 08.10.2026: „żeby profil pracownika wyglądał jak prawdziwy profil osobowy (…) żeby mógł posłużyć potem też
 * do innych celów”. Wzór z karty w Pipeline CRM: zdjęcie u góry z przejściem w kartę, treść pod nim. Jeden klocek dla
 * pracownika, a potem klienta, partnera czy ekipy — ekran wie, CO pokazuje (imię, plakietki, fakty, akcje, zakładki),
 * klocek wie, JAK to narysować.
 *
 * Bez zdjęcia w tle rysuje tło z akcentu motywu (nie z zaszytych barw) — profil wygląda tak samo pełnie i bez zdjęcia.
 */

export interface FaktProfilu {
  ikona: LucideIcon;
  tekst: React.ReactNode;
}

export interface ProfilOsobyProps {
  nazwa: string;
  /** Zdjęcie profilowe; bez niego — inicjały. */
  zdjecie?: string | null;
  /** Zdjęcie w tle; bez niego — tło z akcentu motywu. */
  okladka?: string | null;
  /** Druga linijka pod imieniem, np. stanowisko · grupa. */
  podpis?: React.ReactNode;
  plakietki?: React.ReactNode;
  /** Krótkie fakty z ikoną: e-mail, telefon, „w firmie od”. */
  fakty?: FaktProfilu[];
  akcje?: React.ReactNode;
  /** Zakładki i treść pod nagłówkiem profilu. */
  children?: React.ReactNode;
  /** Kafelek osoby na liście — mniejsze zdjęcia, bez faktów; klik otwiera pełny profil. */
  zwarty?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Zdjęcie w tle; bez niego — rozmyte zdjęcie profilowe (każdy profil ma wtedy własne barwy), a bez obu — tło z akcentu. */
const Okladka: React.FC<{ okladka?: string | null; zdjecie?: string | null }> = ({ okladka, zdjecie }) =>
  okladka ? <img src={okladka} alt="" className="h-full w-full object-cover" loading="lazy" />
    : zdjecie ? <img src={zdjecie} alt="" aria-hidden className="h-full w-full scale-125 object-cover opacity-60 blur-2xl" loading="lazy" />
    : <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(90%_120%_at_100%_100%,hsl(var(--primary)/0.15),transparent_55%)]" />;

const inicjaly = (nazwa: string) =>
  nazwa.split(/\s+/).filter(Boolean).map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '?';

export const ProfilOsoby: React.FC<ProfilOsobyProps> = ({ nazwa, zdjecie, okladka, podpis, plakietki, fakty, akcje, children, zwarty, onClick, className }) => zwarty ? (
  <button type="button" onClick={onClick}
    className={cn(klasyKafelka({ interaktywny: !!onClick }), 'overflow-hidden p-0 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50', className)}>
    <div className="relative h-16 w-full shrink-0 overflow-hidden bg-muted">
      <Okladka okladka={okladka} zdjecie={zdjecie} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
    </div>
    <div className="flex flex-1 flex-col px-3 pb-3">
      <Avatar className="-mt-7 h-14 w-14 shrink-0 ring-4 ring-card">
        {zdjecie && <AvatarImage src={zdjecie} alt={nazwa} className="object-cover" />}
        <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{inicjaly(nazwa)}</AvatarFallback>
      </Avatar>
      <span className="mt-2 truncate text-sm font-semibold text-foreground">{nazwa}</span>
      {podpis && <span className="truncate text-xs text-muted-foreground">{podpis}</span>}
      {plakietki && <span className="mt-2 flex flex-wrap items-center gap-1">{plakietki}</span>}
    </div>
  </button>
) : (
  <div className={cn(klasyKafelka(), 'overflow-hidden p-0', className)}>
    <div className="relative h-32 w-full shrink-0 overflow-hidden bg-muted sm:h-44">
      <Okladka okladka={okladka} zdjecie={zdjecie} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-card/10 to-transparent" />
    </div>

    <div className="relative px-4 pb-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Avatar className="-mt-12 h-24 w-24 shrink-0 ring-4 ring-card sm:-mt-14 sm:h-28 sm:w-28">
          {zdjecie && <AvatarImage src={zdjecie} alt={nazwa} className="object-cover" />}
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">{inicjaly(nazwa)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 sm:pb-1">
          <h2 className="truncate text-xl font-semibold leading-tight text-foreground sm:text-2xl">{nazwa}</h2>
          {podpis && <p className="mt-0.5 text-sm text-muted-foreground">{podpis}</p>}
          {plakietki && <div className="mt-2 flex flex-wrap items-center gap-1.5">{plakietki}</div>}
        </div>
        {akcje && <div className="flex flex-wrap items-center gap-2 sm:pb-1">{akcje}</div>}
      </div>
      {fakty && fakty.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {fakty.map(({ ikona: Ikona, tekst }, i) => (
            <li key={i} className="flex min-w-0 items-center gap-2">
              <Ikona className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{tekst}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    {children && <div className="border-t border-border px-4 py-4 sm:px-6">{children}</div>}
  </div>
);
