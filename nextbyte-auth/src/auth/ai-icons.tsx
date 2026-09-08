import React from 'react'

/* ------------------------------------------------------------------
   LOGA MODELI AI — do rozpoznania marki jednym rzutem oka (bez tekstu)

   Wycięte 1:1 z HomePage.tsx strony głównej 3. W oryginale siedzą w pliku
   całej strony głównej, której ten eksport nie zawiera — to jedyne miejsce,
   w którym ścieżka importu różni się od źródła.
   ------------------------------------------------------------------ */
export type BrandIconProps = { className?: string; style?: React.CSSProperties }

export function OpenAIIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

export function AnthropicIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M13.827 3.52h3.603L24 20.521h-3.603zm-7.258 0h3.767L16.906 20.521H13.28l-1.435-3.899H5.588l-1.435 3.899H0Zm2.976 5.18-1.997 5.43h3.995z" />
    </svg>
  )
}

export function GeminiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M11.9968 0C11.1394 6.97318 6.97318 11.1394 0 11.9968C6.97318 12.8542 11.1394 17.0205 11.9968 24C12.8542 17.0205 17.0205 12.8542 24 11.9968C17.0205 11.1394 12.8542 6.97318 11.9968 0Z" />
    </svg>
  )
}
