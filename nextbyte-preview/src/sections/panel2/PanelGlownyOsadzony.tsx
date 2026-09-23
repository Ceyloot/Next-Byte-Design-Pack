import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Panel Główny platformy 1:1 — eksport `nextbyte-panel-glowny` puszczony
 * na własnym serwerze (8093) i osadzony tutaj. Osobny serwer, bo paczka ma
 * swój router, swoje konteksty i proxy do funkcji edge Supabase; kopiowanie
 * jej do preview rozjechałoby ją z platformą.
 */
const ADRES = 'http://localhost:8093/panel-glowny'

export function PanelGlownyOsadzony({ onWyjscie }: { onWyjscie?: () => void }) {
  const ramka = useRef<HTMLIFrameElement>(null)
  const [klucz, setKlucz] = useState(0)
  const [wczytane, setWczytane] = useState(false)
  const [wolno, setWolno] = useState(false)

  useEffect(() => {
    setWczytane(false)
    setWolno(false)
    const t = setTimeout(() => setWolno(true), 4000)
    return () => clearTimeout(t)
  }, [klucz])

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {onWyjscie && (
          <PrzyciskRamki tytul="Wróć" onClick={onWyjscie}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </PrzyciskRamki>
        )}
        <PrzyciskRamki tytul="Przeładuj panel" onClick={() => setKlucz((k) => k + 1)}>
          <RotateCw className="h-3.5 w-3.5" />
        </PrzyciskRamki>
        <PrzyciskRamki tytul="Otwórz w nowej karcie" onClick={() => window.open(ADRES, '_blank')}>
          <ExternalLink className="h-3.5 w-3.5" />
        </PrzyciskRamki>
      </div>

      {wolno && !wczytane && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-[11px] text-foreground/40">
          Pusto? Odpal serwer paczki: <span className="font-mono">npm run dev --prefix nextbyte-panel-glowny</span>
        </p>
      )}

      <iframe
        key={klucz}
        ref={ramka}
        src={ADRES}
        title="Panel Główny NextByte"
        onLoad={() => setWczytane(true)}
        className="h-full w-full flex-1 border-0 bg-background"
      />
    </div>
  )
}

function PrzyciskRamki({
  tytul,
  onClick,
  children,
}: { tytul: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={tytul}
      aria-label={tytul}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full',
        'border border-foreground/10 bg-background/70 text-foreground/60 backdrop-blur',
        'transition-colors hover:text-foreground hover:border-foreground/25',
      )}
    >
      {children}
    </button>
  )
}
