import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { odczytajMotyw, zastosujMotyw } from '@/eksport/motyw';

/* Motyw PRZED pierwszym rysowaniem — inaczej strona mignie domyślnymi
   kolorami z `index.css`, zanim przełącznik zdąży je podmienić. */
zastosujMotyw(odczytajMotyw());

createRoot(document.getElementById('root')!).render(<App />);
