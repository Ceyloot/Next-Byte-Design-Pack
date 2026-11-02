import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OnboardingFlow } from './sections/logowanie/OnboardingFlow'

function App() {
  return (
    <div className="h-dvh w-full bg-background font-landing text-foreground">
      {/* Po ostatnim pytaniu wywoływane onZakoncz — podepnij tu własny ekran */}
      <OnboardingFlow onZakoncz={() => {}} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
