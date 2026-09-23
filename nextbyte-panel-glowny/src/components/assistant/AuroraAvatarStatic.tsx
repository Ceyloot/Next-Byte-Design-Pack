import React from 'react';

interface AuroraAvatarStaticProps {
  /** Rozmiar (px) — domyślnie 24. */
  size?: number;
  className?: string;
}

/**
 * AuroraAvatarStatic — lekki, statyczny SVG oddający twarz Aurory w stanie idle.
 *
 * Ciemna szklana kula z niebieskim gradientem (paleta #70BEFA / #5496D4 / #84C5EB),
 * miękki refleks u góry, dwa jasne pionowe „oczy" (zaokrąglone paski światła)
 * i delikatny uśmiech-linia. To mała wersja Aurory z nagłówka.
 *
 * Zero canvas, zero zależności — bardzo tani do renderu w wielu dymkach czatu.
 * Każda instancja ma unikatowe id gradientów (React.useId), więc wiele awatarów
 * na jednej stronie nie koliduje.
 */
export const AuroraAvatarStatic: React.FC<AuroraAvatarStaticProps> = ({ size = 24, className }) => {
  const uid = React.useId();
  const glassId = `aurora-glass-${uid}`;
  const glowId = `aurora-glow-${uid}`;
  const specId = `aurora-spec-${uid}`;
  const rimId = `aurora-rim-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Aurora"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Szklane wypełnienie kuli — ciemne z lekkim niebieskim rdzeniem */}
        <radialGradient id={glassId} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#1b2436" />
          <stop offset="55%" stopColor="#0f1626" />
          <stop offset="100%" stopColor="#080b16" />
        </radialGradient>
        {/* Wewnętrzna niebieska poświata (rdzeń) */}
        <radialGradient id={glowId} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#5496D4" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#70BEFA" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#70BEFA" stopOpacity="0" />
        </radialGradient>
        {/* Refleks szkła u góry */}
        <linearGradient id={specId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Obrys szkła — jasny u góry, niebieski w środku, ciemny u dołu */}
        <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="38%" stopColor="#84C5EB" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5496D4" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Kula szklana */}
      <circle cx="24" cy="24" r="22" fill={`url(#${glassId})`} />
      <circle cx="24" cy="24" r="22" fill={`url(#${glowId})`} />
      <circle cx="24" cy="24" r="22" fill="none" stroke={`url(#${rimId})`} strokeWidth="1.4" />

      {/* Miękki refleks u góry */}
      <ellipse cx="24" cy="13" rx="12" ry="6" fill={`url(#${specId})`} />

      {/* Poświata oczu — tani „glow" bez filtrów SVG (szersze, półprzezroczyste paski) */}
      <g fill="#84C5EB" opacity="0.5">
        <rect x="15.6" y="19.2" width="4.7" height="10.6" rx="2.35" />
        <rect x="27.7" y="19.2" width="4.7" height="10.6" rx="2.35" />
      </g>
      {/* Oczy — dwa jasne pionowe paski światła */}
      <g fill="#EAF4FE">
        <rect x="16.4" y="20" width="3.1" height="9" rx="1.55" />
        <rect x="28.5" y="20" width="3.1" height="9" rx="1.55" />
      </g>

      {/* Delikatny uśmiech-linia */}
      <path
        d="M18.5 33 Q24 36 29.5 33"
        fill="none"
        stroke="#EAF4FE"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AuroraAvatarStatic;
