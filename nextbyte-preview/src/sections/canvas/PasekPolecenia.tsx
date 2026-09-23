import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, Sparkles, Trash2, TriangleAlert, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { etykietaPineski, wytnijOkolice, type Pineska, type Warstwa } from './typy'
import { BYTE_ZA_OBRAZ } from './dostawca'
import { INTENCJE, type Intencja } from './polecenia'
import type { Uwaga } from './kontrola-polecenia'

/**
 * Pływający pasek polecenia.
 *
 * Zaznaczone obiekty są chipami, a nie listą w bocznym panelu — dzięki
 * temu pisząc „wstaw ten laptop na maskę” masz przed oczami, czym są
 * „laptop” i „maska”, i możesz je wstawić do zdania jednym kliknięciem
 * zamiast opisywać słowami.
 */

interface Props {
  pineski: Pineska[]
  warstwy: Warstwa[]
  tekst: string
  onTekst: (v: string) => void
  onWybierzPineske: (id: string) => void
  onUsunPineske: (id: string) => void
  podglad: string
  onGeneruj: () => void
  /** powód, dla którego nie da się generować — pokazany pod paskiem */
  powodBlokady: string | null
  /** trwa generacja — przycisk zamienia się w kręciołek */
  trwa: boolean
  /** tryb, w którym poleci zadanie — rozpoznany ze zdania albo wybrany */
  intencja: Intencja
  /** `null`, dopóki użytkownik nie nadpisał rozpoznania */
  trybReczny: Intencja | null
  onTryb: (t: Intencja | null) => void
  /** sprzeczności i braki wykryte przed wysyłką */
  uwagi: Uwaga[]
}

export function PasekPolecenia({
  pineski,
  warstwy,
  tekst,
  onTekst,
  onWybierzPineske,
  onUsunPineske,
  podglad,
  onGeneruj,
  powodBlokady,
  trwa,
  intencja,
  trybReczny,
  onTryb,
  uwagi,
}: Props) {
  const [menuTrybu, setMenuTrybu] = useState(false)
  const refPole = useRef<HTMLTextAreaElement>(null)
  const [otwartyPodglad, setOtwartyPodglad] = useState(false)

  // Pole rośnie z treścią — pasek ma nie mieć własnego paska przewijania.
  useEffect(() => {
    const el = refPole.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(140, el.scrollHeight)}px`
  }, [tekst])

  const wstawChip = (p: Pineska, numer: number) => {
    const nazwa = etykietaPineski(p, numer)
    const el = refPole.current
    if (!el) return onTekst(`${tekst} ${nazwa}`.trim())
    const start = el.selectionStart ?? tekst.length
    const koniec = el.selectionEnd ?? tekst.length
    const przed = tekst.slice(0, start)
    const po = tekst.slice(koniec)
    const spacja = przed && !przed.endsWith(' ') ? ' ' : ''
    const nowy = `${przed}${spacja}${nazwa} ${po}`
    onTekst(nowy)
    requestAnimationFrame(() => {
      el.focus()
      const pozycja = (przed + spacja + nazwa + ' ').length
      el.setSelectionRange(pozycja, pozycja)
    })
  }

  return (
    <div className="pointer-events-auto w-[min(620px,calc(100vw-96px))]">
      {/* Podgląd tego, co poleci do modelu */}
      {otwartyPodglad && podglad && (
        <div className="mb-2 max-h-40 overflow-y-auto nb-szklo nb-szklo-canvas rounded-2xl border border-border/60 bg-card/70 p-3 shadow-2xl scrollbar-none">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/40">Co poleci do modelu</p>
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/60">{podglad}</pre>
        </div>
      )}

      <div className="nb-szklo nb-szklo-canvas rounded-2xl border border-border/60 bg-card/70 p-2 shadow-2xl">
        {/* Chipy zaznaczonych obiektów */}
        {pineski.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 px-1 pt-0.5">
            {pineski.map((p, i) => (
              <Chip
                key={p.id}
                pineska={p}
                numer={i + 1}
                warstwa={warstwy.find(w => w.id === p.layerId)}
                onWstaw={() => wstawChip(p, i + 1)}
                onPokaz={() => onWybierzPineske(p.id)}
                onUsun={() => onUsunPineske(p.id)}
              />
            ))}
          </div>
        )}

        <textarea
          ref={refPole}
          value={tekst}
          onChange={e => onTekst(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              if (!powodBlokady) onGeneruj()
            }
          }}
          rows={1}
          placeholder={
            pineski.length > 0
              ? 'Co ma powstać? Np. „wstaw ten laptop na maskę samochodu”'
              : 'Wbij pineskę w obiekt, a potem opisz, co z nim zrobić'
          }
          className="w-full resize-none bg-transparent px-2 py-1.5 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        <div className="flex items-center gap-1.5 px-1 pb-0.5">
          {/* Tryb decyduje o regułach w poleceniu, więc musi być widoczny
              zanim klikniesz Generuj — i odkręcalny, gdy rozpoznanie
              ze zdania trafi obok. */}
          <div className="relative">
            <button
              onClick={() => setMenuTrybu(v => !v)}
              title="Tryb edycji — decyduje o regułach wysyłanych do modelu"
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-semibold transition-colors',
                trybReczny
                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                  : 'text-foreground/45 hover:bg-foreground/5 hover:text-foreground/80',
              )}
            >
              {INTENCJE.find(i => i.id === intencja)?.nazwa ?? 'Tryb'}
              <ChevronDown className={cn('h-3 w-3 transition-transform', menuTrybu && 'rotate-180')} />
            </button>

            {menuTrybu && (
              <div className="nb-szklo nb-szklo-canvas absolute bottom-full left-0 mb-1.5 w-56 overflow-hidden rounded-xl border border-border/60 bg-card/70 p-1 shadow-2xl">
                {INTENCJE.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onTryb(i.id)
                      setMenuTrybu(false)
                    }}
                    className={cn(
                      'flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left transition-colors',
                      intencja === i.id ? 'bg-primary/15' : 'hover:bg-foreground/5',
                    )}
                  >
                    <span className="text-[11.5px] font-semibold text-foreground/85">{i.nazwa}</span>
                    <span className="text-[10px] text-foreground/40">{i.opis}</span>
                  </button>
                ))}
                {trybReczny && (
                  <button
                    onClick={() => {
                      onTryb(null)
                      setMenuTrybu(false)
                    }}
                    className="mt-0.5 w-full rounded-lg border-t border-border/10 px-2 py-1.5 text-left text-[10.5px] text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground/80"
                  >
                    Wróć do rozpoznawania ze zdania
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setOtwartyPodglad(v => !v)}
            disabled={!podglad}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-semibold text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className={cn('h-3 w-3 transition-transform', otwartyPodglad && 'rotate-180')} />
            Podgląd polecenia
          </button>

          <span className="ml-auto text-[10px] text-foreground/25">Ctrl+Enter</span>

          <button
            onClick={onGeneruj}
            disabled={powodBlokady !== null}
            title={powodBlokady ?? 'Wyślij do modelu'}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-[12px] font-bold text-primary-foreground shadow-[0_2px_14px_-2px_hsl(var(--primary)/0.65)] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            {trwa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {trwa ? 'Generuję…' : 'Generuj'}
            <span className="flex items-center gap-0.5 rounded bg-black/10 px-1 py-0.5 text-[9.5px] font-bold">
              <Zap className="h-2.5 w-2.5" />
              {BYTE_ZA_OBRAZ}
            </span>
          </button>
        </div>
      </div>

      {/* Uwagi z kontroli polecenia. Blokująca jest już w `powodBlokady`,
          więc tutaj pokazujemy tylko te, które nie wstrzymują generacji —
          inaczej ten sam tekst wisiałby dwa razy. */}
      {uwagi.filter(u => u.waga === 'ostrzezenie').slice(0, 2).map(u => (
        <p key={u.id} className="mt-1.5 flex items-start gap-1.5 px-1 text-[10.5px] leading-snug text-amber-300/70">
          <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
          {u.tresc}
        </p>
      ))}

      {powodBlokady && (
        <p className="mt-1.5 text-center text-[10.5px] text-foreground/30">{powodBlokady}</p>
      )}
    </div>
  )
}

/* ── Chip zaznaczonego obiektu ───────────────────────────────────── */

function Chip({
  pineska,
  numer,
  warstwa,
  onWstaw,
  onPokaz,
  onUsun,
}: {
  pineska: Pineska
  numer: number
  warstwa?: Warstwa
  onWstaw: () => void
  onPokaz: () => void
  onUsun: () => void
}) {
  const [wycinek, setWycinek] = useState('')

  useEffect(() => {
    if (!warstwa) return
    let aktualne = true
    wytnijOkolice(warstwa.src, pineska.normalizedX, pineska.normalizedY, 48).then(d => {
      if (aktualne) setWycinek(d)
    })
    return () => {
      aktualne = false
    }
  }, [warstwa, pineska.normalizedX, pineska.normalizedY])

  return (
    <span className="group flex items-center gap-1.5 rounded-lg bg-foreground/[0.07] py-1 pl-1 pr-1.5 ring-1 ring-border/10">
      <button onClick={onPokaz} title="Pokaż na płótnie" className="flex items-center gap-1.5">
        {wycinek ? (
          <img src={wycinek} alt="" className="h-5 w-5 rounded object-cover" />
        ) : (
          <span className="h-5 w-5 rounded bg-foreground/10" />
        )}
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-foreground">
          {numer}
        </span>
      </button>

      <button
        onClick={onWstaw}
        title="Wstaw nazwę do polecenia"
        className="max-w-[130px] truncate text-[11.5px] font-medium text-foreground/80 hover:text-foreground"
      >
        {etykietaPineski(pineska, numer)}
      </button>

      <button
        onClick={onUsun}
        title="Usuń pineskę"
        className="text-foreground/20 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </span>
  )
}
