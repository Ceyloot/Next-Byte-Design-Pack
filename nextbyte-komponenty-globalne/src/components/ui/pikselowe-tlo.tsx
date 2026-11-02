import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PIKSELOWE TŁO — migoczące piksele, które wypełniają powierzchnię przy aktywacji
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (27.10.2026, okno „Dodaj wiedzę”): obracająca się poświata strefy
 * upuszczania prześwitywała przez szkło jako radialny klin. Ma być „normalne
 * podświetlenie, jak w każdej aplikacji przy przeciąganiu czy najechaniu”,
 * w duchu pixel-canvas z 21st.dev.
 *
 * Sterowane z zewnątrz propem `aktywny` (najechanie, przeciąganie pliku, fokus),
 * a nie zdarzeniami rodzica: przeciąganie pliku nie wywołuje `mouseenter`.
 * Piksele narastają falą od środka (`wariant="srodek"`) albo od lewego dolnego
 * rogu (`"rog"`), potem migoczą; po zgaszeniu maleją do zera i pętla staje.
 * Kolor domyślnie z tokenu `--primary`, więc działa w obu motywach.
 * Przy reduced-motion piksele pojawiają się od razu i nie migoczą.
 */

interface Piksel {
  x: number; y: number; kolor: string;
  rozmiar: number; maks: number; krok: number; predkosc: number;
  opoznienie: number; licznik: number; krokLicznika: number;
  migocze: boolean; wstecz: boolean;
}

const MIN = 0.5;
const MAKS_CALK = 2;

function kolorZTokenu(el: Element, token: string, alfa: number): string | null {
  const v = getComputedStyle(el).getPropertyValue(token).trim();
  return v ? `hsl(${v} / ${alfa})` : null;
}

export interface PikseloweTloProps {
  aktywny: boolean;
  /** Odstęp siatki w px (4–50). */
  odstep?: number;
  /** Szybkość migotania 0–100. */
  predkosc?: number;
  /** Kolory CSS; domyślnie trzy odcienie `--primary`. */
  kolory?: string[];
  wariant?: 'srodek' | 'rog';
  className?: string;
}

export const PikseloweTlo: React.FC<PikseloweTloProps> = ({ aktywny, odstep = 8, predkosc = 30, kolory, wariant = 'srodek', className }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const piksele = React.useRef<Piksel[]>([]);
  const klatka = React.useRef<number | null>(null);
  const rozmiar = React.useRef({ w: 0, h: 0 });
  const aktywnyRef = React.useRef(aktywny);
  const spokojnie = React.useRef(false);

  const zbuduj = React.useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const { width: w, height: h } = c.getBoundingClientRect();
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
    rozmiar.current = { w, h };
    const paleta = kolory?.length ? kolory : [
      kolorZTokenu(c, '--primary', 0.25), kolorZTokenu(c, '--primary', 0.5), kolorZTokenu(c, '--primary', 0.85),
    ].filter((k): k is string => !!k);
    if (!paleta.length) paleta.push('rgba(124,196,255,.6)');
    const gap = Math.max(4, Math.min(50, odstep));
    const v = Math.max(0, Math.min(100, predkosc)) * 0.001;
    const lista: Piksel[] = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const dx = wariant === 'srodek' ? x - w / 2 : x;
        const dy = wariant === 'srodek' ? y - h / 2 : h - y;
        lista.push({
          x, y, kolor: paleta[Math.floor(Math.random() * paleta.length)],
          rozmiar: 0, maks: MIN + Math.random() * (MAKS_CALK - MIN), krok: Math.random() * 0.4,
          predkosc: (0.1 + Math.random() * 0.8) * v,
          opoznienie: spokojnie.current ? 0 : Math.sqrt(dx * dx + dy * dy),
          licznik: 0, krokLicznika: Math.random() * 4 + (w + h) * 0.01,
          migocze: false, wstecz: false,
        });
      }
    }
    piksele.current = lista;
  }, [kolory, odstep, predkosc, wariant]);

  const animuj = React.useCallback(() => {
    if (klatka.current) cancelAnimationFrame(klatka.current);
    const krok = () => {
      const ctx = ref.current?.getContext('2d');
      if (!ctx) { klatka.current = null; return; }
      const { w, h } = rozmiar.current;
      ctx.clearRect(0, 0, w, h);
      const wlacz = aktywnyRef.current;
      let bezczynne = true;
      for (const p of piksele.current) {
        if (wlacz) {
          bezczynne = false;
          if (p.licznik <= p.opoznienie) { p.licznik += p.krokLicznika; continue; }
          if (spokojnie.current) p.rozmiar = p.maks;
          else if (p.rozmiar >= p.maks) p.migocze = true;
          if (p.migocze && !spokojnie.current) {
            if (p.rozmiar >= p.maks) p.wstecz = true; else if (p.rozmiar <= MIN) p.wstecz = false;
            p.rozmiar += p.wstecz ? -p.predkosc : p.predkosc;
          } else if (!spokojnie.current) p.rozmiar += p.krok;
        } else {
          p.migocze = false; p.licznik = 0;
          if (p.rozmiar <= 0) continue;
          p.rozmiar = spokojnie.current ? 0 : p.rozmiar - 0.1;
          bezczynne = false;
        }
        if (p.rozmiar <= 0) continue;
        const o = MAKS_CALK * 0.5 - p.rozmiar * 0.5;
        ctx.fillStyle = p.kolor;
        ctx.fillRect(p.x + o, p.y + o, p.rozmiar, p.rozmiar);
      }
      /* Statyczny stan (reduced-motion, wszystko wyrysowane) nie potrzebuje kolejnych klatek. */
      if (bezczynne || (wlacz && spokojnie.current && piksele.current.every((p) => p.licznik > p.opoznienie))) { klatka.current = null; return; }
      klatka.current = requestAnimationFrame(krok);
    };
    klatka.current = requestAnimationFrame(krok);
  }, []);

  React.useEffect(() => {
    spokojnie.current = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    zbuduj();
    const c = ref.current;
    if (!c) return;
    /* Bez ResizeObservera (stare przeglądarki, jsdom w testach) siatka zostaje z pierwszego pomiaru. */
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { zbuduj(); if (aktywnyRef.current) animuj(); });
    ro?.observe(c);
    return () => { ro?.disconnect(); if (klatka.current) cancelAnimationFrame(klatka.current); };
  }, [zbuduj, animuj]);

  React.useEffect(() => {
    aktywnyRef.current = aktywny;
    animuj();
  }, [aktywny, animuj]);

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
};
