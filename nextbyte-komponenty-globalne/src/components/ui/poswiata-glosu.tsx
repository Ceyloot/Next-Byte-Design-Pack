import React from 'react';
import { cn } from '@/lib/utils';
import '@/styles/poswiata-glosu.css';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POŚWIATA GŁOSU — światło od dołu karty, które oddycha mową
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (20.10.2026): „fajny efekt pod nagrywanie prompta przez mikrofon i rozmowę na żywo z AI — tylko
 * w odcieniach ustawionych na platformie, a nie tęczowy” (wzór: recent.design „Voice glow effect”).
 * Rozpracowane przez REA: źródło to `voice-glow` Jakuba Antalika (libraries.dev/voice, MIT) — bez WebGL,
 * same warstwy CSS + linia pasma na Canvas 2D. Tu własna rekonstrukcja (nie kopia kodu):
 *   • 7 eliptycznych plam w dwóch warstwach (poświata + światło przy krawędzi) i obrys 1 px — malowane RAZ,
 *     co klatkę zmienia się tylko `transform` i `opacity`;
 *   • linia pasma: krzywa dzwonowa, „aberracja” odcieniami motywu zamiast tęczy, halo szerokimi kreskami;
 *   • barwy: cztery odcienie liczone z `--primary` ELEMENTU (wyspy motywu mają własny), jasność tła też
 *     z elementu — jasny motyw dostaje nasycone plamy (jasne odcienie brudziły biel);
 *   • jedna wspólna pętla rAF dla wszystkich instancji; poza ekranem i w ukrytej karcie stoi, a w stanie
 *     `czeka` po wygaszeniu instancja wypisuje się z pętli (pole czatu bez nagrania nie kręci klatek);
 *     `prefers-reduced-motion` — bez ruchu, sama jasność, ≤10 odświeżeń/s.
 *
 * Rodzic: `relative isolate` i zaokrąglenie — warstwa leży POD treścią karty (z-index -1 w kontekście rodzica),
 * dziedziczy `border-radius` i sama się przycina (rodzic nie potrzebuje `overflow: hidden`, więc menu w karcie
 * nie są ucinane). Gdy tło jest osobnym rodzeństwem (szkło nakładki), klasa `nb-pg-nad-tlem` kładzie ją nad nim.
 */
export type StanPoswiaty = 'czeka' | 'slucha' | 'mowi' | 'mysli';

export interface PoswiataGlosuProps {
  stan: StanPoswiaty;
  /** poziom 0..1 albo getter (czytany co klatkę — bez re-renderów) */
  poziom?: number | (() => number);
  /** strumień mikrofonu — poziom i pasma liczy wtedy sama poświata */
  strumien?: MediaStream | null;
  /** `pole` — szeroka, niska karta (pole czatu); `ekran` — wysoka powierzchnia (rozmowa na żywo) */
  wariant?: 'pole' | 'ekran';
  className?: string;
}

const PLAMY = [ // x, półosie [px przy skali 1], pasmo, odcień
  { x: 0, w: 74, h: 46, p: 0, k: 'baza' },
  { x: -36, w: 54, h: 40, p: 1, k: 'jasny' }, { x: 36, w: 54, h: 40, p: 1, k: 'jasny' },
  { x: -72, w: 48, h: 32, p: 2, k: 'gleboki' }, { x: 72, w: 48, h: 32, p: 2, k: 'gleboki' },
  { x: -108, w: 42, h: 26, p: 1, k: 'jasny' }, { x: 108, w: 42, h: 26, p: 1, k: 'jasny' },
] as const;
/** Tło spinające plamy — szeroka elipsa, która nie wędruje (bez niej plamy czytały się jak osobne chmurki). */
const TLO = { w: 170, h: 50 };
const ODSTEP = 0.85;
const ROZPIETOSC = 36 * PLAMY.length * ODSTEP;
const SZEROKOSC_WZORCOWA = 380;

const zacisk = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wygladz = (x: number, cel: number, dt: number, atak: number, opad: number) =>
  x + (cel - x) * (1 - Math.exp(-dt / (cel > x ? atak : opad)));

/** „H S% L%” → odcienie poświaty. */
export const odcieniePoswiaty = (trojka: string, jasnyMotyw: boolean) => {
  const [h = 210, s = 80, l = 60] = trojka.trim().replace(/%/g, '').split(/[\s,]+/).map(parseFloat).filter((n) => !Number.isNaN(n));
  /* Odcień przesuwany najwyżej o ±8° — głębia jak w oryginale, ale wciąż jeden kolor motywu, nie tęcza. */
  const hsl = (S: number, L: number, dh = 0) => `hsl(${(h + dh + 360) % 360} ${zacisk(S, 0, 100)}% ${zacisk(L, 0, 100)}%)`;
  return jasnyMotyw
    ? { rdzen: hsl(s + 10, 97), jasny: hsl(Math.max(s, 85), zacisk(l + 12, 58, 72), -8), baza: hsl(Math.max(s, 80), zacisk(l - 4, 40, 55)),
        gleboki: hsl(100, zacisk(l, 45, 52), 8), ciemny: hsl(s + 15, zacisk(l - 22, 22, 40)), cien: 'rgba(0,0,0,.08)' }
    : { rdzen: hsl(s, 90), jasny: hsl(Math.max(s, 85), zacisk(l + 6, 58, 74), -8), baza: hsl(Math.max(s, 85), zacisk(l - 4, 48, 62)),
        gleboki: hsl(Math.min(100, s + 15), zacisk(l - 14, 38, 52), 8), ciemny: hsl(s, 90), cien: 'rgba(255,255,255,.1)' };
};

/** Jasność tła z trójki HSL `--background` (L > 60% = jasny motyw). */
const jasneTlo = (trojka: string) => {
  const l = parseFloat(trojka.trim().replace(/%/g, '').split(/[\s,]+/)[2] ?? '');
  return !Number.isNaN(l) && l > 60;
};

const dzwon = (u: number, wyk = 1.75, roz = 0.87, skos = 0.12) => {
  const sig = Math.max(0.05, roz * (u < 0 ? 1 - skos : 1 + skos));
  const r = Math.exp(-Math.pow(Math.abs(u) / sig, wyk));
  const e = Math.exp(-Math.pow(1 / sig, wyk));
  return Math.max(0, (r - e) / (1 - e));
};

/* ── WSPÓLNA PĘTLA ───────────────────────────────────────────────────────── */
type Krok = (dt: number, czas: number) => void;
const kroki = new Set<Krok>();
let rafId = 0;
let ostatni = 0;
let czasGlobalny = 0;
const petla = (ts: number) => {
  const dt = Math.min(0.05, ostatni ? (ts - ostatni) / 1000 : 1 / 60);
  ostatni = ts;
  czasGlobalny += dt;
  if (!document.hidden) kroki.forEach((k) => k(dt, czasGlobalny));
  rafId = kroki.size ? requestAnimationFrame(petla) : 0;
  if (!rafId) ostatni = 0;
};
const zapisz = (k: Krok) => {
  kroki.add(k);
  if (!rafId) rafId = requestAnimationFrame(petla);
  /* Ostatni wypisany gasi pętlę od razu — inaczej `rafId` czekałby na klatkę, która może nie przyjść
     (karta w tle), a następna instancja uznałaby pętlę za działającą. */
  return () => {
    kroki.delete(k);
    if (!kroki.size && rafId) { cancelAnimationFrame(rafId); rafId = 0; ostatni = 0; }
  };
};

/* ── ANALIZA MIKROFONU ───────────────────────────────────────────────────── */
const PASMA_HZ: [number, number][] = [[80, 300], [300, 2000], [2000, 6000]];

const useAnalizator = (strumien?: MediaStream | null) => {
  const ref = React.useRef<{ an: AnalyserNode; czas: Float32Array; czest: Uint8Array; rate: number } | null>(null);
  React.useEffect(() => {
    if (!strumien?.getAudioTracks?.().length) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    /* Przeglądarka potrafi odmówić (Firefox przy innej częstotliwości próbkowania, stary Safari z limitem
       kontekstów). Wtedy poświata gra bez mikrofonu — wyjątek z efektu położyłby pole w trakcie nagrywania
       (audyt 20.10.2026). */
    let ctx: AudioContext | null = null;
    try {
      ctx = new Ctx();
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      an.smoothingTimeConstant = 0.5;
      const zrodlo = ctx.createMediaStreamSource(strumien);
      zrodlo.connect(an);
      ref.current = { an, czas: new Float32Array(an.fftSize), czest: new Uint8Array(an.frequencyBinCount), rate: ctx.sampleRate };
      void ctx.resume?.().catch(() => undefined);
      const otwarty = ctx;
      return () => {
        ref.current = null;
        try { zrodlo.disconnect(); } catch { /* już odłączony */ }
        void otwarty.close().catch(() => undefined);
      };
    } catch {
      ref.current = null;
      void ctx?.close().catch(() => undefined);
      return;
    }
  }, [strumien]);
  return ref;
};

export const PoswiataGlosu: React.FC<PoswiataGlosuProps> = ({ stan, poziom, strumien, wariant = 'pole', className }) => {
  const korzen = React.useRef<HTMLDivElement>(null);
  const krawedz = React.useRef<(HTMLElement | null)[]>([]);
  const poswiata = React.useRef<(HTMLElement | null)[]>([]);
  const tlo = React.useRef<(HTMLElement | null)[]>([]);
  const obrys = React.useRef<HTMLElement>(null);
  const plotno = React.useRef<HTMLCanvasElement>(null);
  const analizator = useAnalizator(strumien);
  const wejscie = React.useRef({ stan, poziom });
  wejscie.current = { stan, poziom };
  const budzik = React.useRef<() => void>(() => undefined);

  React.useEffect(() => {
    const el = korzen.current;
    const cv = plotno.current;
    if (!el || !cv) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = cv.getContext('2d'); } catch { /* środowisko bez płótna — zostają same warstwy CSS */ }
    const ograniczRuch = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let barwy = odcieniePoswiaty('210 80% 60%', false);
    let jasny = false;
    let skala = 1;
    let skalaY = 1;
    let widoczny = true;
    let poz = 0, obecnosc = 0, faza = 0, odOstatniego = 0;
    const pasma = [0, 0, 0];

    /* Barwy z --primary i --background ELEMENTU: zmiana motywu na <html> to obserwator, a wyspy motywu
       (zmienne ustawione niżej w drzewie) łapie odczyt co pół sekundy, gdy poświata świeci. */
    let klucz = '';
    let odPrzeliczenia = 0;
    const przelicz = () => {
      const st = getComputedStyle(el);
      const tlo = st.getPropertyValue('--background'), primary = st.getPropertyValue('--primary') || '210 80% 60%';
      if (tlo + '|' + primary === klucz) return;
      klucz = tlo + '|' + primary;
      jasny = jasneTlo(tlo);
      barwy = odcieniePoswiaty(primary, jasny);
      (Object.entries(barwy) as [string, string][]).forEach(([k, v]) => el.style.setProperty(`--pg-${k}`, v));
      el.style.setProperty('--pg-sila-poswiaty', jasny ? '0.6' : '1');
      el.dataset.jasny = jasny ? 'tak' : 'nie';
    };
    const rozmiar = () => {
      const w = el.clientWidth || SZEROKOSC_WZORCOWA;
      const ekran = wariant === 'ekran';
      /* Pole czatu jest szerokie i niskie: poświata rośnie wszerz, wysokość trzyma się karty. */
      skala = zacisk(w / SZEROKOSC_WZORCOWA, 0.75, ekran ? 3.2 : 2.4);
      skalaY = ekran ? skala : Math.min(skala, 1.35);
      el.style.setProperty('--pg-skala', skala.toFixed(3));
      el.style.setProperty('--pg-skala-y', skalaY.toFixed(3));
      tlo.current.forEach((e, n) => {
        if (!e) return;
        e.style.setProperty('--w', String(Math.round(TLO.w * 0.75 * skala * (n ? 1.15 : 1))));
        e.style.setProperty('--h', String(Math.round(TLO.h * (n ? 1.875 : 1.125) * skalaY)));
      });
      PLAMY.forEach((p, n) => {
        const ustaw = (e: HTMLElement | null, mw: number, mh: number) => {
          if (!e) return;
          e.style.setProperty('--w', String(Math.round(p.w * mw * skala)));
          e.style.setProperty('--h', String(Math.round(p.h * mh * skalaY)));
        };
        ustaw(krawedz.current[n], 0.9 * 0.65, 0.9 * 1.25);
        ustaw(poswiata.current[n], 1.15 * 0.65, 1.5 * 1.25);
      });
    };
    przelicz();
    rozmiar();

    const obserwatorMotywu = new MutationObserver(przelicz);
    obserwatorMotywu.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
    const obserwatorRozmiaru = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(rozmiar) : null;
    obserwatorRozmiaru?.observe(el);
    const obserwatorWidocznosci = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([w]) => { widoczny = w.isIntersecting; }, { rootMargin: '256px' })
      : null;
    obserwatorWidocznosci?.observe(el);

    const czytajPoziom = (): number => {
      const a = analizator.current;
      if (a) {
        a.an.getFloatTimeDomainData(a.czas);
        let suma = 0;
        for (let i = 0; i < a.czas.length; i++) suma += a.czas[i] * a.czas[i];
        const rms = Math.sqrt(suma / a.czas.length);
        a.an.getByteFrequencyData(a.czest);
        const naBin = a.rate / 2 / a.czest.length;
        PASMA_HZ.forEach(([od, doHz], k) => {
          let s = 0, n = 0;
          for (let i = Math.floor(od / naBin); i <= Math.min(a.czest.length - 1, Math.ceil(doHz / naBin)); i++) { s += a.czest[i]; n++; }
          pasma[k] = n ? s / n / 255 : 0;
        });
        const surowy = rms * 5 * 3.1;
        return zacisk(surowy < 0.015 ? surowy * 0.4 : surowy, 0, 1);
      }
      const p = wejscie.current.poziom;
      return zacisk(typeof p === 'function' ? p() : p ?? 0, 0, 1);
    };

    const rysujPasmo = (z: number, w: number, unies: number) => {
      if (!ctx) return;
      const W = cv.clientWidth, H = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (z < 0.01) return;
      const cx = W / 2, zasieg = 170 * 0.75 * skala * w, dol = H + 27 * skalaY;
      const pkt: [number, number][] = [];
      for (let n = 0; n <= 48; n++) { const x = cx - zasieg + (2 * zasieg * n) / 48; pkt.push([x, dol - unies * dzwon((x - cx) / zasieg)]); }
      const kreska = (kolor: string, a: number, szer: number, dy: number) => {
        const g = ctx.createLinearGradient(pkt[0][0], 0, pkt[48][0], 0);
        g.addColorStop(0, 'transparent'); g.addColorStop(0.18, kolor); g.addColorStop(0.82, kolor); g.addColorStop(1, 'transparent');
        ctx.globalAlpha = a; ctx.strokeStyle = g; ctx.lineWidth = szer;
        ctx.beginPath(); ctx.moveTo(pkt[0][0], pkt[0][1] + dy);
        for (const [x, y] of pkt) ctx.lineTo(x, y + dy);
        ctx.stroke();
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      /* Na ciemnym tle światło się sumuje (jak w oryginale); na jasnym zwykłe nakładanie, inaczej biel gasi barwę. */
      ctx.globalCompositeOperation = jasny ? 'source-over' : 'lighter';
      /* Grubość rośnie wolniej niż karta (pierwiastek) — na dużej powierzchni gruba kreska czytała się jak sznurek. */
      const s = 2.15 * Math.sqrt(skalaY) * (1 + 0.35 * z), r = (4 + 10 * z) * Math.sqrt(skalaY) * 0.5;
      const mowi = wejscie.current.stan === 'mowi';
      kreska(barwy.baza, 0.16, 14 * s, 0);
      kreska(barwy.baza, 0.22, 7 * s, 0);
      kreska(barwy.jasny, 0.55, 2.4 * s, -r);
      kreska(barwy.gleboki, 0.55, 2.4 * s, r);
      kreska(jasny ? barwy.baza : barwy.jasny, mowi ? 0.8 : 0.65, 1.4 * s, 0);
      kreska(jasny ? barwy.ciemny : barwy.rdzen, mowi ? 0.9 : 0.7, 0.55 * s, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const krok: Krok = (dt, czas) => {
      const { stan: st } = wejscie.current;
      const cel = st === 'czeka' ? 0 : 1;
      obecnosc = wygladz(obecnosc, cel, dt, 0.22, 0.18);
      if (cel === 0 && obecnosc < 0.005) {
        if (obecnosc !== 0) { obecnosc = 0; el.style.setProperty('--pg-obecnosc', '0'); ctx?.clearRect(0, 0, cv.width, cv.height); }
        uspij();
        return;
      }
      if (!widoczny) return;
      odPrzeliczenia += dt;
      if (odPrzeliczenia > 0.5) { odPrzeliczenia = 0; przelicz(); }
      if (ograniczRuch) {
        odOstatniego += dt;
        if (odOstatniego < 0.1) return;
        odOstatniego = 0;
      }

      const surowy = st === 'mysli' ? 0.3 + 0.1 * Math.sin(czas * 2.6) : czytajPoziom();
      poz = wygladz(poz, surowy, dt, 0.325, 0.86);
      const pasmaCel = analizator.current ? pasma.slice() : [surowy, surowy * (0.72 + 0.28 * Math.sin(czas * 9.1)), surowy * (0.6 + 0.4 * Math.sin(czas * 13.7 + 2))];
      for (let k = 0; k < 3; k++) pasma[k] = wygladz(pasma[k], pasmaCel[k], dt, 0.325, 0.99);

      const oddech = ograniczRuch ? 0.5 : 0.5 + 0.5 * Math.sin((2 * Math.PI * czas) / 5.2);
      const z = poz + (1 - poz) * 0.18 * oddech;
      const ekran = wariant === 'ekran';
      const w = 0.85 + (ekran ? 0.45 : 1.05) * z;
      const h = 0.5 + (ekran ? 3 : 1.2) * z;
      const ruch = ograniczRuch ? 0 : 1;
      faza = (faza + 48 * skala * z * dt * ruch) % (ROZPIETOSC * skala);
      const scisk = st === 'mysli' ? 0.4 : 1;
      const dryf = st === 'mysli' && ruch ? Math.sin((2 * Math.PI * czas) / 2.4) * 24 * skala : 0;

      /* Głos zmienia głównie WIELKOŚĆ światła; jasność tylko trochę — przy cichym mówieniu efekt nie może zgasnąć. */
      el.style.setProperty('--pg-obecnosc', ((ograniczRuch ? 0.45 + 0.4 * poz : 0.55 + 0.45 * z) * obecnosc).toFixed(3));
      if (obrys.current) obrys.current.style.transform = `translateX(${dryf.toFixed(1)}px) scale(${(0.75 * w * scisk).toFixed(3)}, ${h.toFixed(3)})`;
      const tloT = `translateX(${dryf.toFixed(1)}px) scale(${(w * scisk).toFixed(3)}, ${(h * (0.75 + 0.25 * pasma[0])).toFixed(3)})`;
      tlo.current.forEach((e) => { if (e) e.style.transform = tloT; });
      const span = ROZPIETOSC * skala;
      /* Zawijanie liczone BEZ ściśnięcia, ściśnięcie dopiero na pozycji: inaczej w stanie „myśli” plamy
         wędrowały po całej szerokości i przy brzegach wyskakiwały jako wąskie pionowe kolce. */
      const sciskSzer = Math.sqrt(scisk);
      PLAMY.forEach((p, n) => {
        let x = (p.x * ODSTEP * skala + faza) % span;
        x = ((x + span / 2) % span + span) % span - span / 2;
        const okno = Math.max(0, 1 - (x / (span / 2 + 4)) ** 2);
        const wys = (0.6 + 0.7 * pasma[p.p]) * okno;
        const t = `translateX(${(x * w * scisk + dryf).toFixed(1)}px) scale(${(w * sciskSzer).toFixed(3)}, ${(h * wys).toFixed(3)})`;
        const a = krawedz.current[n], b = poswiata.current[n];
        if (a) a.style.transform = t;
        if (b) b.style.transform = t;
      });
      rysujPasmo(z, w * scisk, (64 * h + 60 * z) * 0.35 * skalaY * (st === 'mowi' ? 1.4 : 1));
    };

    let odpisz: (() => void) | null = null;
    const uspij = () => { odpisz?.(); odpisz = null; };
    budzik.current = () => { if (!odpisz) odpisz = zapisz(krok); };
    budzik.current();
    return () => {
      uspij();
      budzik.current = () => undefined;
      obserwatorMotywu.disconnect();
      obserwatorRozmiaru?.disconnect();
      obserwatorWidocznosci?.disconnect();
    };
  }, [analizator, wariant]);

  React.useEffect(() => { if (stan !== 'czeka') budzik.current(); }, [stan]);

  return (
    <div ref={korzen} aria-hidden className={cn('nb-pg', className)} data-stan={stan}>
      <div className="nb-pg-krawedz">
        <i ref={(e) => { tlo.current[0] = e; }} style={{ ['--k' as string]: 'var(--pg-baza)' }} />
        {PLAMY.map((p, n) => <i key={`k${n}`} ref={(e) => { krawedz.current[n] = e; }} style={{ ['--k' as string]: `var(--pg-${p.k})` }} />)}
      </div>
      <div className="nb-pg-obrys"><b ref={obrys} /></div>
      <div className="nb-pg-poswiata">
        <i ref={(e) => { tlo.current[1] = e; }} style={{ ['--k' as string]: 'var(--pg-baza)' }} />
        {PLAMY.map((p, n) => <i key={`p${n}`} ref={(e) => { poswiata.current[n] = e; }} style={{ ['--k' as string]: `var(--pg-${p.k})` }} />)}
      </div>
      <canvas ref={plotno} />
    </div>
  );
};

export default PoswiataGlosu;
