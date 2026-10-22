import React from 'react'

/* ═══════════════════════════════════════════════════════════════════════
   ZNAKI DOSTAWCÓW MODELI
   Wydzielone z HomePage3, bo używa ich zarówno karuzela modeli, jak
   i finalne CTA. Osobny plik zamiast eksportu z HomePage3 — dzięki temu
   sekcje nie importują się nawzajem w kółko.
   ═══════════════════════════════════════════════════════════════════════ */

export function ElevenLabsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 24" className={className} fill="currentColor">
      <rect x="0" y="0" width="4" height="24" rx="1" />
      <rect x="10" y="0" width="4" height="24" rx="1" />
    </svg>
  )
}

export function KlingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 3.5h3.8v7.2L14.2 3.5h4.6l-7.3 7.8 7.7 9.2h-4.8L8 13.2v7.3H4V3.5z" />
    </svg>
  )
}

export function RunwareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 3.2l6.8 3.7L12 12.6 5.2 8.9 12 5.2zm-7 5.1l6 3.3v6.7l-6-3.3v-6.7zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
    </svg>
  )
}

export function BananaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.8 3.5c-.8 1.4-1.9 3.2-3.1 5.3-2.1 3.7-4.4 7.6-7.2 9.8-1.4 1.1-2.9 1.9-4.5 1.9-.3 0-.6 0-.8-.1-.6-.2-1-.7-1.1-1.3-.1-.6.1-1.2.6-1.6 1.8-1.5 3.8-3.4 5.7-5.9 2-2.6 3.8-5.7 4.9-8.4.5-1.2 1.3-1.8 2.5-1.8.8 0 2 .7 3 2.1z" />
    </svg>
  )
}

export function PixVerseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 6l9-4 9 4v12l-9 4-9-4V6zm9 2.5L6.5 11l5.5 2.5 5.5-2.5L12 8.5z" />
    </svg>
  )
}

export function MiniMaxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 7h3v10H3V7zm5-4h3v18H8V3zm5 8h3v6h-3v-6zm5-5h3v16h-3V6z" />
    </svg>
  )
}

/* Znaki dorzucone dla kroku 1 samouczka — monochromatyczne (currentColor),
   żeby dziedziczyły kolor kafelka i nie łamały zasady trzech kolorów. */

export function MidjourneyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.8 20.3c-1.6.4-3.2.2-4.7-.5-2.7-1.2-4.8-3.4-6.6-5.6-2.2-2.7-4.4-5.6-7.6-7.3 2-.6 4.1-.5 6 .3 3.2 1.3 5.6 3.9 7.5 6.6 1.6 2.2 3.2 4.5 5.4 6.5z" />
      <path d="M2.2 20.3c1.3-3.7 3.6-7 6.7-9.5.9-.7 1.9-1.4 2.9-2-1.3 2.5-2.3 5.1-2.8 7.8-.2 1.2-.4 2.5-.4 3.7H2.2z" />
    </svg>
  )
}

export function CanvaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 1.4C6.2 1.4 1.4 6.2 1.4 12S6.2 22.6 12 22.6 22.6 17.8 22.6 12 17.8 1.4 12 1.4zm0 2.1c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5S3.5 16.7 3.5 12 7.3 3.5 12 3.5z" />
      <path d="M15.4 14.5c-.9 1.3-2.2 2.1-3.6 2.1-2 0-3.2-1.5-2.7-3.7.4-2.2 2.2-4 4.1-4 1.2 0 1.9.7 1.7 1.6-.1.5-.5.8-1 .7-.4-.1-.5-.4-.5-.8 0-.3-.2-.4-.5-.4-1 0-2 1.3-2.2 2.8-.2 1.3.3 2 1.3 2 .9 0 1.7-.6 2.3-1.4.3-.4.8-.5 1-.2.3.3.3.7.1 1.3z" />
    </svg>
  )
}

/* ── Znaki dostawców modeli (przeniesione z bloki-wspolne.tsx) ── */

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

export function XaiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z" />
    </svg>
  )
}

export function GoogleIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z" />
    </svg>
  )
}

export function NextByteMarkIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="278.5 45.5 642 775" className={className} style={style} fill="currentColor">
      <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" />
      <path d="M784,68 L900,68 L900,460 L784,460 Z" />
      <path d="M299,264 L416,377 L415,797 L298,797 Z" />
      <path d="M900,489 L784.5,490 L900,600.5 Z" />
    </svg>
  )
}
