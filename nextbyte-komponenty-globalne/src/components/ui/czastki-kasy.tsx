import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * CZĄSTKI KASY — ta sama materia co tłum z historii i konstelacja Pamięci AI:
 * drobne punkty w kolorze akcentu, mieszane addytywnie (26.10.2026).
 *
 * Michał: „dodaj particle, jakieś elementy wyglądowe, animacje, aby to było
 * tooop” i „cząstki reagujące na stan”. Trzy klocki:
 *   PoleCzastek      tło kolumny zamówienia; spokój = oddech, przetwarzanie =
 *                    strumień przyspiesza ku przyciskowi, sukces = rozbłysk,
 *   RozblyskCzastek  krótki rozprysk przy wejściu i każdej zmianie kwoty,
 *   ZnakSukcesu      cząstki zlatują się w okrąg, potem kreska rysuje ptaszek.
 *
 * ZASADY, których pilnuje każdy z nich:
 *   · płótno NIGDY nie leży pod polami Stripe ani pod zgodami: przy ramce
 *     Stripe warstwy kompozytora potrafiły złapać rozmyte tło karty,
 *   · pętla `requestAnimationFrame` chodzi tylko, gdy płótno jest na ekranie
 *     i karta przeglądarki jest widoczna; sprzątana przy odmontowaniu,
 *   · ograniczony ruch = jedna nieruchoma klatka,
 *   · na telefonie mniej punktów, gęstość pikseli ucięta do 2.
 */

export type StanCzastek = 'spokoj' | 'przetwarza' | 'sukces';

type Hsl = [number, number, number];

function akcent(): Hsl {
  if (typeof document === 'undefined') return [204, 91, 70];
  const surowy = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const c = surowy.split(/[\s,/]+/).map((s) => parseFloat(s));
  return c.length >= 3 && !c.slice(0, 3).some(Number.isNaN) ? [c[0], c[1], c[2]] : [204, 91, 70];
}

const kolor = ([h, s, l]: Hsl, a: number) => `hsla(${h}, ${s}%, ${l}%, ${Math.max(0, Math.min(1, a))})`;

interface Plotno {
  ctx: CanvasRenderingContext2D;
  szer: number;
  wys: number;
}

/**
 * Wspólna pętla płótna: rozmiar z `ResizeObserver`, gęstość pikseli, widoczność
 * (`IntersectionObserver` + `visibilitychange`) i ograniczony ruch.
 * `rysuj` dostaje czas w ms od startu i krok klatki w s.
 */
function usePetlaPlotna(
  ref: React.RefObject<HTMLCanvasElement>,
  rysuj: (p: Plotno, t: number, dt: number) => void,
  { statyczna }: { statyczna: boolean },
) {
  const rysujRef = useRef(rysuj);
  rysujRef.current = rysuj;

  useEffect(() => {
    const plotno = ref.current;
    /* Bez `ResizeObserver` (stare silniki, jsdom w testach) płótno zostaje puste. */
    if (!plotno || typeof ResizeObserver === 'undefined') return;
    const ctx = plotno.getContext('2d');
    if (!ctx) return;
    const stan: Plotno = { ctx, szer: 0, wys: 0 };
    let ramka = 0;
    let widoczne = true;
    let start = performance.now();
    let poprzednia = start;

    const dopasuj = () => {
      const r = plotno.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      stan.szer = r.width;
      stan.wys = r.height;
      plotno.width = Math.max(1, Math.round(r.width * dpr));
      plotno.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (statyczna) rysujRef.current(stan, 1200, 0);
    };

    const klatka = (teraz: number) => {
      const dt = Math.min(0.05, (teraz - poprzednia) / 1000);
      poprzednia = teraz;
      rysujRef.current(stan, teraz - start, dt);
      ramka = requestAnimationFrame(klatka);
    };
    const wznow = () => {
      cancelAnimationFrame(ramka);
      if (statyczna || !widoczne || document.visibilityState !== 'visible') return;
      poprzednia = performance.now();
      ramka = requestAnimationFrame(klatka);
    };

    const ro = new ResizeObserver(dopasuj);
    ro.observe(plotno);
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([w]) => { widoczne = w.isIntersecting; wznow(); })
      : null;
    io?.observe(plotno);
    document.addEventListener('visibilitychange', wznow);
    dopasuj();
    start = performance.now();
    wznow();

    return () => {
      cancelAnimationFrame(ramka);
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', wznow);
    };
  }, [ref, statyczna]);
}

const czyTelefon = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches;

/* ══ POLE CZĄSTEK ══════════════════════════════════════════════════════ */

interface Punkt { x: number; y: number; r: number; faza: number; szybkosc: number; jasnosc: number }

export function PoleCzastek({ stan = 'spokoj', className }: { stan?: StanCzastek; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ograniczony = useReducedMotion() ?? false;
  const punkty = useRef<Punkt[] | null>(null);
  const stanRef = useRef(stan);
  stanRef.current = stan;
  /* Pęd płynnie goni stan, więc przejście spokój → przetwarzanie → sukces to jedna sekwencja, nie przeskok. */
  const ped = useRef(0);
  const blysk = useRef(0);
  const barwa = useRef<Hsl>(akcent());

  useEffect(() => {
    barwa.current = akcent();
    if (stan === 'sukces') blysk.current = 1;
  }, [stan]);

  usePetlaPlotna(ref, ({ ctx, szer, wys }, t, dt) => {
    if (!szer || !wys) return;
    if (!punkty.current) {
      const ile = czyTelefon() ? 12 : 22;
      punkty.current = Array.from({ length: ile }, () => ({
        x: Math.random() * szer,
        y: Math.random() * wys,
        r: 0.6 + Math.random() * 0.8,
        faza: Math.random() * Math.PI * 2,
        szybkosc: 0.5 + Math.random(),
        jasnosc: 0.2 + Math.random() * 0.4,
      }));
    }
    const cel = stanRef.current === 'przetwarza' ? 1 : 0;
    ped.current += (cel - ped.current) * Math.min(1, dt * 2.5);
    blysk.current = Math.max(0, blysk.current - dt * 0.8);

    ctx.clearRect(0, 0, szer, wys);
    ctx.globalCompositeOperation = 'lighter';
    const b = barwa.current;
    for (const p of punkty.current) {
      /* Spokój: dryf w górę z falowaniem. Przetwarzanie: strumień w dół i w lewo,
         ku przyciskowi zapłaty (na telefonie przycisk też jest niżej). */
      const wolno = 6 * p.szybkosc;
      const szybko = 70 * p.szybkosc;
      const vx = Math.sin(t / 2400 + p.faza) * 4 * (1 - ped.current) - szybko * 0.45 * ped.current;
      const vy = -wolno * (1 - ped.current) + szybko * ped.current;
      p.x += vx * dt;
      p.y += vy * dt;
      if (p.y < -4) p.y = wys + 4;
      if (p.y > wys + 4) { p.y = -4; p.x = Math.random() * szer * 1.3; }
      if (p.x < -4) p.x = szer + 4;
      if (p.x > szer + 4) p.x = -4;

      const oddech = 0.55 + 0.45 * Math.sin(t / 1600 + p.faza);
      const a = p.jasnosc * oddech * (0.55 + 0.45 * ped.current) + blysk.current * 0.6;
      ctx.fillStyle = kolor(b, a);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (ped.current > 0.15) {
        /* Ogon w kierunku ruchu: widać, że strumień płynie, nie tylko przyspiesza. */
        ctx.strokeStyle = kolor(b, a * 0.4 * ped.current);
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * 0.08, p.y - vy * 0.08);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }, { statyczna: ograniczony });

  return <canvas ref={ref} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}

/* ══ ROZBŁYSK ══════════════════════════════════════════════════════════ */

interface Iskra { x: number; y: number; vx: number; vy: number; zycie: number; r: number }

/** Rozprysk cząstek przy każdej zmianie `klucz` (np. kwoty). Płótno wypełnia rodzica. */
export function RozblyskCzastek({ klucz, className }: { klucz: string | number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ograniczony = useReducedMotion() ?? false;
  const iskry = useRef<Iskra[]>([]);
  const nowe = useRef(true);

  useEffect(() => { nowe.current = true; }, [klucz]);

  usePetlaPlotna(ref, ({ ctx, szer, wys }, _t, dt) => {
    if (!szer || !wys) return;
    if (nowe.current) {
      nowe.current = false;
      const ile = czyTelefon() ? 8 : 12;
      /* Źródło przy prawym brzegu, tam gdzie stoi liczba. */
      const sx = szer * 0.78;
      const sy = wys * 0.55;
      for (let i = 0; i < ile; i++) {
        const kat = Math.random() * Math.PI * 2;
        const v = 30 + Math.random() * 70;
        iskry.current.push({ x: sx, y: sy, vx: Math.cos(kat) * v, vy: Math.sin(kat) * v * 0.6, zycie: 1, r: 0.6 + Math.random() * 1.2 });
      }
    }
    ctx.clearRect(0, 0, szer, wys);
    if (!iskry.current.length) return;
    const b = akcent();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of iskry.current) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 1 - dt * 2.2;
      s.vy *= 1 - dt * 2.2;
      s.zycie -= dt * 1.4;
      if (s.zycie <= 0) continue;
      ctx.fillStyle = kolor(b, s.zycie * 0.55);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    iskry.current = iskry.current.filter((s) => s.zycie > 0);
  }, { statyczna: ograniczony });

  if (ograniczony) return null;
  return <canvas ref={ref} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}

/* ══ ZNAK SUKCESU ══════════════════════════════════════════════════════ */

const KRZYWA = [0.23, 1, 0.32, 1] as const;

/**
 * Okrąg z ptaszkiem rysowanym kreską (jak Apple Pay), poprzedzony cząstkami,
 * które zlatują się na obwód. `aktywny = false` trzyma znak ukryty.
 * Czas: cząstki ~550 ms, okrąg 400 ms, ptaszek 300 ms; potem `onKoniec`.
 */
export function ZnakSukcesu({ aktywny, onKoniec, rozmiar = 72, className }: {
  aktywny: boolean;
  onKoniec?: () => void;
  rozmiar?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ograniczony = useReducedMotion() ?? false;
  const start = useRef<number | null>(null);
  const czastki = useRef<{ x0: number; y0: number; kat: number; opoznienie: number }[]>([]);
  const naKoniec = useRef(onKoniec);
  naKoniec.current = onKoniec;

  useEffect(() => {
    if (!aktywny) { start.current = null; return; }
    const zegar = setTimeout(() => naKoniec.current?.(), ograniczony ? 150 : 1300);
    return () => clearTimeout(zegar);
  }, [aktywny, ograniczony]);

  usePetlaPlotna(ref, ({ ctx, szer, wys }, t) => {
    ctx.clearRect(0, 0, szer, wys);
    if (!aktywny || !szer) return;
    if (start.current === null) {
      start.current = t;
      czastki.current = Array.from({ length: czyTelefon() ? 26 : 40 }, (_, i) => {
        const kat = (i / 40) * Math.PI * 2;
        const odl = szer * (0.45 + Math.random() * 0.35);
        return { x0: Math.cos(kat + Math.random()) * odl, y0: Math.sin(kat + Math.random()) * odl, kat, opoznienie: Math.random() * 120 };
      });
    }
    const uplyw = t - start.current;
    const b = akcent();
    const cx = szer / 2;
    const cy = wys / 2;
    const promien = rozmiar / 2 - 2;
    ctx.globalCompositeOperation = 'lighter';
    for (const c of czastki.current) {
      const p = Math.max(0, Math.min(1, (uplyw - c.opoznienie) / 550));
      const e = 1 - Math.pow(1 - p, 3);
      const x = cx + c.x0 * (1 - e) + Math.cos(c.kat) * promien * e;
      const y = cy + c.y0 * (1 - e) + Math.sin(c.kat) * promien * e;
      /* Po dotarciu na obwód gasną, oddając miejsce kresce okręgu. */
      const a = p < 1 ? 0.25 + 0.75 * e : Math.max(0, 1 - (uplyw - 550 - c.opoznienie) / 400);
      ctx.fillStyle = kolor(b, a);
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, { statyczna: ograniczony });

  const pokaz = aktywny;
  return (
    <div className={cn('relative mx-auto grid place-items-center', className)} style={{ width: rozmiar * 2.2, height: rozmiar * 2.2 }} aria-hidden="true">
      {!ograniczony && <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />}
      <svg width={rozmiar} height={rozmiar} viewBox="0 0 72 72" className="relative text-primary">
        <motion.circle
          cx="36" cy="36" r="33" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          initial={false}
          animate={{ pathLength: pokaz ? 1 : 0, opacity: pokaz ? 1 : 0 }}
          transition={{ duration: ograniczony ? 0 : 0.4, delay: ograniczony ? 0 : 0.5, ease: KRZYWA }}
          style={{ rotate: -90, transformOrigin: '50% 50%' }}
        />
        <motion.path
          d="M23 37.5 L32 46 L49.5 27"
          fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: pokaz ? 1 : 0, opacity: pokaz ? 1 : 0 }}
          transition={{ duration: ograniczony ? 0 : 0.3, delay: ograniczony ? 0 : 0.85, ease: KRZYWA }}
        />
      </svg>
    </div>
  );
}

/* ══ ZNAK PRODUKTU Z CZĄSTEK ═════════════════════════════════════════════ */

/**
 * Znak tego, co się kupuje, ułożony z cząstek (Michał 26.10.2026: zamiast ikony
 * w kwadracie, „w stylu /historia”). Obrys rysowany na niewidocznym płótnie
 * ścieżkami ikon (te same co Lucide) i próbkowany w punkty; punkty zlatują się
 * przy wejściu, potem oddychają i co chwilę któryś rozbłyska.
 */
export type WariantZnaku = 'byte' | 'korona' | 'czapka' | 'ksiazka' | 'pakiet' | 'budynek';

const SCIEZKI: Record<WariantZnaku, string[]> = {
  /* ⟠ — romb przecięty poziomą kreską: znak Byte. */
  byte: ['M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z', 'M2.5 12 H21.5'],
  korona: [
    'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z',
    'M5 21h14',
  ],
  czapka: [
    'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
    'M22 10v6',
    'M6 12.5V16a6 3 0 0 0 12 0v-3.5',
  ],
  ksiazka: [
    'M12 7v14',
    'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  ],
  pakiet: [
    'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
    'M12 22V12',
    'm3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7',
    'm7.5 4.27 9 5.15',
  ],
  budynek: [
    'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z',
    'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2',
    'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2',
    'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4',
  ],
};

interface PunktZnaku { x: number; y: number; x0: number; y0: number; faza: number; jasnosc: number; opoznienie: number }

/** Punkty obrysu w jednostkach 0–1 (z próbkowania ścieżek na niewidocznym płótnie). */
function punktyZnaku(wariant: WariantZnaku, gestosc: number): Array<[number, number]> {
  if (typeof document === 'undefined' || typeof Path2D === 'undefined') return [];
  const S = 6; // płótno 144 × 144 dla ikony 24 × 24
  const c = document.createElement('canvas');
  c.width = 24 * S;
  c.height = 24 * S;
  const ctx = c.getContext('2d');
  if (!ctx) return [];
  ctx.scale(S, S);
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff';
  for (const d of SCIEZKI[wariant]) ctx.stroke(new Path2D(d));
  const dane = ctx.getImageData(0, 0, c.width, c.height).data;
  const wynik: Array<[number, number]> = [];
  const krok = Math.max(2, Math.round(c.width / gestosc));
  for (let y = 0; y < c.height; y += krok) {
    for (let x = 0; x < c.width; x += krok) {
      if (dane[(y * c.width + x) * 4 + 3] > 128) wynik.push([x / c.width, y / c.height]);
    }
  }
  return wynik;
}

export function ZnakProduktuZCzastek({ wariant, rozmiar = 60, className }: { wariant: WariantZnaku; rozmiar?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ograniczony = useReducedMotion() ?? false;
  const punkty = useRef<PunktZnaku[] | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => { punkty.current = null; start.current = null; }, [wariant]);

  usePetlaPlotna(ref, ({ ctx, szer, wys }, t) => {
    if (!szer || !wys) return;
    if (!punkty.current) {
      /* Rzadko: ok. 18 kroków na bok, więc widać pojedyncze cząstki, a nie świecącą kreskę (Michał 26.10.2026). */
      const surowe = punktyZnaku(wariant, 18);
      punkty.current = surowe.map(([x, y]) => {
        const kat = Math.random() * Math.PI * 2;
        const odl = 0.4 + Math.random() * 0.5;
        return { x, y, x0: 0.5 + Math.cos(kat) * odl * 0.6, y0: 0.5 + Math.sin(kat) * odl * 0.6, faza: Math.random() * Math.PI * 2, jasnosc: 0.45 + Math.random() * 0.4, opoznienie: Math.random() * 300 };
      });
      start.current = t;
    }
    const uplyw = t - (start.current ?? t);
    const b = akcent();
    const margines = szer * 0.1;
    const bok = szer - margines * 2;
    ctx.clearRect(0, 0, szer, wys);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of punkty.current) {
      const postep = Math.max(0, Math.min(1, (uplyw - p.opoznienie) / 900));
      const e = ograniczony ? 1 : 1 - Math.pow(1 - postep, 3);
      /* Oddech: punkty lekko falują wokół swojego miejsca. */
      const fx = Math.sin(t / 1300 + p.faza) * 0.006;
      const fy = Math.cos(t / 1500 + p.faza) * 0.006;
      const x = margines + (p.x0 + (p.x - p.x0) * e + fx * e) * bok;
      const y = margines + (p.y0 + (p.y - p.y0) * e + fy * e) * bok;
      /* Migotanie: co kilka sekund każdy punkt na chwilę rozbłyska. */
      const migot = Math.max(0, Math.sin(t / 1100 + p.faza * 7)) ** 30;
      const a = (0.3 + 0.7 * e) * p.jasnosc * (0.8 + 0.2 * Math.sin(t / 1600 + p.faza)) + migot * 0.35;
      /* Bez poświaty: sam drobny punkt, jak w tłumie z /historia. */
      ctx.fillStyle = kolor(b, a);
      ctx.beginPath();
      ctx.arc(x, y, 1.1 + migot * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, { statyczna: ograniczony });

  return (
    <div className={cn('pointer-events-none relative shrink-0 overflow-hidden', className)} style={{ width: rozmiar, height: rozmiar }} aria-hidden="true">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
