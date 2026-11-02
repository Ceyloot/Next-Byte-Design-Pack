import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Onboarding } from './sections/logowanie/Onboarding'

type Motyw = 'dark-theme' | 'future-theme'

function App() {
  const [motyw, setMotyw] = useState<Motyw>('dark-theme')
  const ustaw = (m: Motyw) => {
    setMotyw(m)
    const r = document.documentElement
    r.setAttribute('data-theme', m)
    r.classList.toggle('dark', m === 'dark-theme')
  }
  return (
    <div className="h-dvh w-full bg-background font-landing text-foreground">
      <button
        type="button"
        onClick={() => ustaw(motyw === 'dark-theme' ? 'future-theme' : 'dark-theme')}
        className="fixed bottom-3 left-3 z-50 rounded-full px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-inset ring-foreground/10 hover:text-foreground cursor-pointer"
      >
        {motyw === 'dark-theme' ? 'Jasny motyw' : 'Ciemny motyw'}
      </button>
      <Onboarding />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
