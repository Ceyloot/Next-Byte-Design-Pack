import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { nalozMotyw, motywZPamieci } from '@/eksport/motyw';

// Motyw przed pierwszym rysowaniem — bez mignięcia (jak `useGlobalTheme` z cache).
nalozMotyw(motywZPamieci());

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
