import { useState } from 'react'
import { Button, GlassCard, Tile, TileHeader, TileRow, TilePill } from '@nextbyte/ui'
import { Sparkles } from 'lucide-react'

const MOTYWY = [
  { klucz: null, nazwa: 'Ciemny (domyślny)' },
  { klucz: 'light-apple', nazwa: 'Jasny' },
  { klucz: 'future-theme', nazwa: 'Przyszły' },
  { klucz: 'luxury', nazwa: 'Luxury' },
] as const

function App() {
  const [motyw, setMotyw] = useState<string | null>(null)

  const ustawMotyw = (klucz: string | null) => {
    setMotyw(klucz)
    if (klucz) document.documentElement.setAttribute('data-theme', klucz)
    else document.documentElement.removeAttribute('data-theme')
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
      <header className="flex flex-wrap items-center gap-2">
        {MOTYWY.map((m) => (
          <Button
            key={m.nazwa}
            variant={motyw === m.klucz ? 'nextbyte' : 'outline'}
            size="sm"
            onClick={() => ustawMotyw(m.klucz)}
          >
            {m.nazwa}
          </Button>
        ))}
      </header>

      <section className="flex flex-wrap gap-3">
        <Button variant="nextbyte">nextbyte</Button>
        <Button variant="glass">glass</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="link">link</Button>
        <Button variant="nextbyte" disabled>
          disabled
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="font-heading text-lg mb-2">GlassCard</h2>
          <p className="text-sm text-foreground/70">
            Smoke-test paczki @nextbyte/ui zainstalowanej z zewnętrznego folderu.
          </p>
        </GlassCard>

        <Tile intencja="akcent">
          <TileHeader ikona={Sparkles} tytul="Tile" podtytul="z @nextbyte/ui" />
          <TileRow>
            Wiersz kafelka
            <TilePill intencja="akcent">aktywny</TilePill>
          </TileRow>
        </Tile>
      </section>
    </div>
  )
}

export default App
