import React from 'react';
import { ACCENT_NEXTCLOUD } from '../accent';

// ─────────────────────────────────────────────────────────────────────────────
// ZNAKI PRZESTRZENI — dwie chmury, dwa charaktery.
//
// Ta sama gramatyka, co w znaku NextCloud (patrz CloudMark): bryła chmury rysowana
// obrysem w akcencie, a to, co ją odróżnia, siedzi w środku i jest białe. Dzięki temu
// oba znaki czytają się jak rodzeństwo, a nie jak ikony z dwóch różnych zestawów.
//
//   • SystemCloud  — kłódka: zawartość spięta z platformą, struktura narzucona;
//   • PrivateCloud — iskra/gwiazdka: miejsce użytkownika, pełna dowolność.
// ─────────────────────────────────────────────────────────────────────────────

interface ZnakProps {
  size?: number;
  className?: string;
}

const Chmura: React.FC<{ children: React.ReactNode; size: number; className?: string }> = ({
  children, size, className,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
    <path
      d="M35 38H18a14 14 0 1 1 13.42-18h3.58a9 9 0 1 1 0 18Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {children}
  </svg>
);

/** SystemCloud — kłódka w środku chmury. */
export const SystemCloudMark: React.FC<ZnakProps> = ({ size = 44, className }) => (
  <Chmura size={size} className={className}>
    <rect x="18.5" y="24.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="2.6" opacity="0.85" />
    <path d="M21.5 24.5v-2.2a3 3 0 0 1 6 0v2.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
  </Chmura>
);

/** PrivateCloud — iskra: miejsce, w którym wszystko wolno. */
export const PrivateCloudMark: React.FC<ZnakProps> = ({ size = 44, className }) => (
  <Chmura size={size} className={className}>
    <path
      d="M24.5 20.5l1.9 4.1 4.1 1.9-4.1 1.9-1.9 4.1-1.9-4.1-4.1-1.9 4.1-1.9 1.9-4.1Z"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
      opacity="0.85"
    />
  </Chmura>
);
