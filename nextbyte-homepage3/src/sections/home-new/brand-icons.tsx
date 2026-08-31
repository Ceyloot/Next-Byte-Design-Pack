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
