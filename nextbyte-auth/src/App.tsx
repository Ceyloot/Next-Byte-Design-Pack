import { useEffect, useState } from 'react'
import { LogowaniePage } from './auth/LogowaniePage'

type Tryb = 'logowanie' | 'rejestracja'

const trybZAdresu = (): Tryb =>
  window.location.hash.replace(/^#\/?/, '') === 'rejestracja' ? 'rejestracja' : 'logowanie'

/* Dwa wejścia bez dokładania własnej nawigacji nad ekranem: `#/logowanie`
   i `#/rejestracja`. W docelowej aplikacji to są osobne trasy — tutaj hash
   robi za router, żeby nic nie zasłaniało eksportowanego ekranu.
   Przełącznik trybów wewnątrz formularza działa niezależnie od adresu. */
export default function App() {
  const [tryb, setTryb] = useState<Tryb>(trybZAdresu)

  useEffect(() => {
    const przyZmianie = () => setTryb(trybZAdresu())
    window.addEventListener('hashchange', przyZmianie)
    return () => window.removeEventListener('hashchange', przyZmianie)
  }, [])

  /* Struktura opakowania 1:1 ze StronaGlownaNewSection: ekrany auth dostają
     h-full, żeby LogowaniePage mogła wyśrodkować się względem realnej
     wysokości kontenera przewijania, a nie 100vh. */
  return (
    <main className="h-screen w-full overflow-y-auto bg-background">
      <div className="h-full w-full font-landing text-foreground">
        <LogowaniePage initialTryb={tryb} />
      </div>
    </main>
  )
}
