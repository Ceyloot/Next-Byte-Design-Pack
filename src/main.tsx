import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { UIStyleProvider } from './lib/core/ui-style-context.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIStyleProvider>
      <App />
    </UIStyleProvider>
  </StrictMode>,
)
