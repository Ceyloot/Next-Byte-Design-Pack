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
