import React, { useState, useEffect, useRef } from 'react'
import { RotateCw, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from './shared'

interface WeryfikacjaEmailModalProps {
  otwarty: boolean
  email: string
  onZamknij: () => void
  onZatwierdz: (kod: string) => void
  onZmienEmail?: () => void
}

export function WeryfikacjaEmailModal({
  otwarty,
  email,
  onZamknij,
  onZatwierdz,
  onZmienEmail,
}: WeryfikacjaEmailModalProps) {
  const [cyfry, setCyfry] = useState<string[]>(['', '', '', '', '', ''])
  const [sekundy, setSekundy] = useState(178) // 2:58 = 178 sekund
  const [wysylanie, setWysylanie] = useState(false)
  const [komunikatWyslano, setKomunikatWyslano] = useState(false)
  const [blad, setBlad] = useState<string | null>(null)
  const [weryfikuje, setWeryfikuje] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Odliczanie czasu
  useEffect(() => {
    if (!otwarty) return
    const timer = setInterval(() => {
      setSekundy(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [otwarty])

  // Auto-focus na pierwszą cyfrę po otwarciu
  useEffect(() => {
    if (otwarty) {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 150)
    }
  }, [otwarty])

  if (!otwarty) return null

  const minuty = Math.floor(sekundy / 60)
  const resztaSekund = sekundy % 60
  const formatowanyCzas = `${minuty}:${resztaSekund.toString().padStart(2, '0')}`

  const kodPelen = cyfry.every(c => c.length === 1)

  const obsluzZatwierdzenie = () => {
    const calyKod = cyfry.join('')
    /* Bez obejścia: wcześniej przy niepełnym kodzie pole samo uzupełniało się
       fikcyjnym „842109” i przepuszczało dalej. Teraz brak sześciu cyfr
       zatrzymuje weryfikację. */
    if (calyKod.length < 6) {
      setBlad('Wpisz pełny 6-cyfrowy kod')
      return
    }
    if (sekundy === 0) {
      setBlad('Kod wygasł — wyślij nowy')
      return
    }
    setBlad(null)
    setWeryfikuje(true)
    setTimeout(() => {
      setWeryfikuje(false)
      onZatwierdz(calyKod)
    }, 400)
  }

  const obsluzWprowadzanie = (indeks: number, wartosc: string) => {
    const oczyszczona = wartosc.replace(/\D/g, '')
    if (!oczyszczona) {
      const nowe = [...cyfry]
      nowe[indeks] = ''
      setCyfry(nowe)
      return
    }

    // Obsługa wklejenia wielu cyfr
    if (oczyszczona.length > 1) {
      const wklejone = oczyszczona.slice(0, 6).split('')
      const nowe = [...cyfry]
      wklejone.forEach((cyfra, i) => {
        if (indeks + i < 6) nowe[indeks + i] = cyfra
      })
      setCyfry(nowe)
      const nastepnyIndeks = Math.min(indeks + wklejone.length, 5)
      inputRefs.current[nastepnyIndeks]?.focus()
      if (nowe.every(c => c.length === 1)) {
        setTimeout(() => {
          onZatwierdz(nowe.join(''))
        }, 300)
      }
      return
    }

    const pojedyncza = oczyszczona.slice(-1)
    const nowe = [...cyfry]
    nowe[indeks] = pojedyncza
    setCyfry(nowe)
    setBlad(null)

    if (pojedyncza && indeks < 5) {
      inputRefs.current[indeks + 1]?.focus()
    }

    // Jeśli to ostatnia cyfra i kod jest pełny
    if (indeks === 5 && pojedyncza && nowe.slice(0, 5).every(c => c.length === 1)) {
      setTimeout(() => {
        onZatwierdz(nowe.join(''))
      }, 350)
    }
  }

  const obsluzKeyDown = (indeks: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cyfry[indeks] && indeks > 0) {
      inputRefs.current[indeks - 1]?.focus()
      const nowe = [...cyfry]
      nowe[indeks - 1] = ''
      setCyfry(nowe)
    } else if (e.key === 'ArrowLeft' && indeks > 0) {
      inputRefs.current[indeks - 1]?.focus()
    } else if (e.key === 'ArrowRight' && indeks < 5) {
      inputRefs.current[indeks + 1]?.focus()
    } else if (e.key === 'Enter') {
      obsluzZatwierdzenie()
    }
  }

  const obsluzWklej = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const wklejonyTekst = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!wklejonyTekst) return
    const nowe = [...cyfry]
    wklejonyTekst.split('').forEach((c, i) => {
      nowe[i] = c
    })
    setCyfry(nowe)
    inputRefs.current[Math.min(wklejonyTekst.length, 5)]?.focus()
    if (wklejonyTekst.length === 6) {
      setTimeout(() => {
        onZatwierdz(wklejonyTekst)
      }, 350)
    }
  }

  const obsluzWyslijPonownie = () => {
    if (wysylanie) return
    setWysylanie(true)
    setBlad(null)
    setTimeout(() => {
      setWysylanie(false)
      setSekundy(178)
      setKomunikatWyslano(true)
      setTimeout(() => setKomunikatWyslano(false), 4000)
    }, 700)
  }

  return (
    <div className="nb-modal-tlo fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Klasy `animate-in` / `zoom-in-95` w tym projekcie nic nie robiły —
          nie ma pluginu tailwindcss-animate. Własne keyframe'y, bez fill-mode,
          żeby brak animacji nie zostawił okna niewidocznego. */}
      <style>{`
        @keyframes nbModalTlo { from { opacity: 0 } }
        @keyframes nbModalOkno { from { opacity: 0; transform: scale(.96) translateY(8px) } }
        .nb-modal-tlo { animation: nbModalTlo .2s ease-out }
        .nb-modal-okno { animation: nbModalOkno .24s cubic-bezier(.16,1,.3,1) }
        @media (prefers-reduced-motion: reduce) {
          .nb-modal-tlo, .nb-modal-okno { animation: none }
        }
      `}</style>
      {/* Cały ekran za modalem idzie w rozmycie — bez tego okno nie czytało się
          jako popup, tylko jako kolejna karta na stronie. */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xl transition-opacity"
        onClick={onZamknij}
      />

      {/* Szyba modalu — glassmorphism: półprzezroczysta tafla z mocnym
          rozmyciem tła, podbiciem nasycenia, cienką jasną krawędzią
          i refleksem u góry. Tokeny foreground/background zamiast bieli,
          żeby działało też w jasnych motywach. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="weryfikacja-tytul"
        className={cn(
          'relative w-full max-w-[380px] overflow-hidden rounded-[26px] p-8',
          // Tafla musi być odrobinę jaśniejsza od przyciemnionego, rozmytego
          // tła — inaczej zlewa się z nim i przestaje czytać jako szyba.
          // Bez backdrop-saturate: podbijało nasycenie niebieskiej poświaty
          // zza szyby i cała tafla wychodziła niebieska. Neutralny tint
          // (foreground) jest teraz mocniejszy, żeby przykryć to, co prześwituje.
          'bg-gradient-to-b from-foreground/[0.10] to-foreground/[0.05]',
          'backdrop-blur-md',
          'ring-1 ring-inset ring-foreground/[0.18]',
          'nb-modal-okno',
        )}
        style={{
          boxShadow:
            '0 24px 70px -18px rgba(0,0,0,0.7),' +
            'inset 0 1px 0 0 hsl(var(--foreground)/0.14)',
        }}
      >
        {/* Refleks na górnej krawędzi — jedyna dekoracja, definiuje krawędź szkła */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
        />

        {/* Nagłówek — bez kafla z ikoną. Podtytuł niesie adres e-mail zamiast
            instrukcji, bo sześć pól poniżej i tak mówi, czego się oczekuje. */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="weryfikacja-tytul"
              className="font-sans text-[21px] font-bold tracking-tight text-foreground"
            >
              Weryfikacja email
            </h2>
            <p className="mt-1.5 truncate font-sans text-[13.5px] text-foreground/45">
              Kod wysłaliśmy na <span className="text-foreground/70">{email || 'Twój adres'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onZamknij}
            aria-label="Zamknij"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pola kodu — bez etykiety i licznika „6 cyfr”, sześć pól jest samo
            w sobie czytelne. Cienki ring zamiast neonu. */}
        <div className="relative mt-9 grid grid-cols-6 gap-2" onPaste={obsluzWklej}>
          {cyfry.map((cyfra, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={cyfra}
              onChange={e => obsluzWprowadzanie(i, e.target.value)}
              onKeyDown={e => obsluzKeyDown(i, e)}
              aria-label={`Cyfra ${i + 1} kodu`}
              className={cn(
                'h-[62px] w-full rounded-xl text-center font-mono text-[21px] font-semibold outline-none transition-all duration-150',
                'ring-1 ring-inset',
                cyfra
                  ? 'bg-primary/[0.07] text-primary ring-primary/35'
                  : 'bg-foreground/[0.05] text-foreground ring-foreground/[0.10] hover:ring-foreground/25',
                'focus:bg-primary/[0.09] focus:text-primary focus:ring-primary/60',
              )}
            />
          ))}
        </div>

        {/* Komunikat błędu */}
        {blad && (
          <p className="relative mt-3 flex items-center gap-1.5 font-sans text-[12.5px] text-destructive nb-modal-tlo">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {blad}
          </p>
        )}

        {/* Potwierdzenie ponownej wysyłki — bez ramki i tła */}
        {komunikatWyslano && (
          <p className="relative mt-3 flex items-center gap-1.5 font-sans text-[12.5px] text-primary nb-modal-tlo">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Wysłaliśmy nowy kod
          </p>
        )}

        {/* Licznik — bez ikony i pulsowania */}
        <p className="relative mt-6 text-center font-mono text-[12.5px] text-foreground/40">
          {sekundy > 0 ? (
            <>Kod wygasa za <span className="text-foreground/70">{formatowanyCzas}</span></>
          ) : (
            <span className="text-destructive">Kod wygasł — wyślij nowy</span>
          )}
        </p>

        {/* Jedno główne działanie */}
        <div className="relative mt-8">
          <GlowButton
            size="lg"
            onClick={obsluzZatwierdzenie}
            className={cn(
              'w-full justify-center h-[52px]',
              // Widoczny stan zamiast cichej blokady po kliknięciu
              !kodPelen && 'pointer-events-none opacity-45',
            )}
            icon={!weryfikuje}
          >
            {weryfikuje ? (
              <span className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 animate-spin text-primary" />
                Weryfikacja kodu…
              </span>
            ) : (
              'Zatwierdź i kontynuuj'
            )}
          </GlowButton>
        </div>

        {/* Akcje poboczne jako linki — dwa duże przyciski obok CTA robiły
            trzy równorzędne działania zamiast jednego głównego. */}
        <div className="relative mt-6 flex items-center justify-center gap-3 font-sans text-[13px]">
          <button
            type="button"
            onClick={onZamknij}
            className="text-foreground/40 transition-colors hover:text-foreground/75 cursor-pointer"
          >
            Anuluj
          </button>
          <span aria-hidden className="text-foreground/15">·</span>
          <button
            type="button"
            onClick={obsluzWyslijPonownie}
            className={cn(
              'text-foreground/40 transition-colors hover:text-primary cursor-pointer',
              wysylanie && 'pointer-events-none opacity-50',
            )}
          >
            {wysylanie ? 'Wysyłanie…' : 'Wyślij ponownie'}
          </button>
        </div>
      </div>
    </div>
  )
}
