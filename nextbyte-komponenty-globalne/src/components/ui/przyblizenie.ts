import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PRZYBLIŻANIE I PRZESUWANIE OBRAZU — kółko, gładzik, palce
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Michał (07.09.2026): „w studio zdjęć by można było przybliżać, oddalać
 * i przesuwać na boki po przybliżeniu myszką i tachpadem oraz na telefonie".
 * Podgląd miał tylko klik = 2× — bez wyboru powiększenia, bez przesuwania.
 *
 * Jeden hook, trzy urządzenia:
 *  • kółko myszy / szczypanie na gładziku (`wheel` z ctrlKey) — powiększenie
 *    WOKÓŁ WSKAŹNIKA: punkt pod kursorem zostaje w miejscu;
 *  • przeciąganie (mysz, palec) — przesuwanie, gdy obraz jest większy niż ramka;
 *  • dwa palce — szczypanie (odległość między palcami) + przesuwanie środkiem;
 *  • podwójne kliknięcie / dwukrotne tapnięcie — 1× ↔ 2,5×.
 *
 * Transformacja to jedno `translate(tx, ty) scale(s)` z początkiem w środku
 * ramki. Przesunięcie jest ograniczane, żeby obraz nie uciekł całkiem poza
 * ramkę, a przy 1× wraca na środek.
 */
export const SKALA_MIN = 1;
export const SKALA_MAX = 5;
const SKALA_PODWOJNE = 2.5;

interface Stan { s: number; tx: number; ty: number }

export function usePrzyblizenie(kluczResetu?: unknown) {
  const [stan, setStan] = useState<Stan>({ s: 1, tx: 0, ty: 0 });
  const [przeciaganie, setPrzeciaganie] = useState(false);
  /* Ramka jako STAN, nie `useRef`: podgląd montuje ramkę dopiero, gdy jest
     obraz (okno otwarte), a efekt z nasłuchem `wheel` odpalał się raz, przy
     pustym refie — kółko nie działało nigdy. Callback ref + stan uruchamia
     nasłuch dokładnie wtedy, gdy ramka pojawia się w DOM. */
  const [ramka, setRamka] = useState<HTMLDivElement | null>(null);
  const ramkaRef = useRef<HTMLDivElement | null>(null);
  const ustawRamke = useCallback((el: HTMLDivElement | null) => { ramkaRef.current = el; setRamka(el); }, []);
  const wskazniki = useRef<Map<number, { x: number; y: number }>>(new Map());
  const startSzczypania = useRef<{ dystans: number; s: number; srodek: { x: number; y: number }; tx: number; ty: number } | null>(null);
  const startPrzeciagania = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const ostatnieTapniecie = useRef(0);

  useEffect(() => { setStan({ s: 1, tx: 0, ty: 0 }); }, [kluczResetu]);

  /* Ogranicza przesunięcie: przy skali s obraz wystaje o (s−1)/2 ramki z każdej
     strony — dalej nie ma czego pokazać. */
  const ogranicz = useCallback((n: Stan): Stan => {
    const r = ramkaRef.current?.getBoundingClientRect();
    if (!r || n.s <= 1) return { s: Math.max(SKALA_MIN, n.s), tx: 0, ty: 0 };
    const maxX = (r.width * (n.s - 1)) / 2;
    const maxY = (r.height * (n.s - 1)) / 2;
    return { s: n.s, tx: Math.min(maxX, Math.max(-maxX, n.tx)), ty: Math.min(maxY, Math.max(-maxY, n.ty)) };
  }, []);

  /* Powiększenie wokół punktu (px, py) w układzie ramki, środek = (0,0). */
  const powiekszWokol = useCallback((nowaS: number, px: number, py: number) => {
    setStan((p) => {
      const s = Math.min(SKALA_MAX, Math.max(SKALA_MIN, nowaS));
      const k = s / p.s;
      return ogranicz({ s, tx: px - (px - p.tx) * k, ty: py - (py - p.ty) * k });
    });
  }, [ogranicz]);

  const punktRamki = useCallback((clientX: number, clientY: number) => {
    const r = ramkaRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  }, []);

  /* `wheel` nie jest pasywny — musimy zatrzymać przewijanie strony pod oknem. */
  useEffect(() => {
    const el = ramka;
    if (!el) return;
    const naKolko = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y } = punktRamki(e.clientX, e.clientY);
      /* Gładzik zgłasza szczypanie jako wheel z ctrlKey i małymi deltami;
         kółko myszy daje duże skoki — stąd różna czułość. */
      const czulosc = e.ctrlKey || e.metaKey ? 0.01 : 0.0025;
      setStan((p) => {
        const s = Math.min(SKALA_MAX, Math.max(SKALA_MIN, p.s * Math.exp(-e.deltaY * czulosc)));
        const k = s / p.s;
        return ogranicz({ s, tx: x - (x - p.tx) * k, ty: y - (y - p.ty) * k });
      });
    };
    el.addEventListener('wheel', naKolko, { passive: false });
    return () => el.removeEventListener('wheel', naKolko);
  }, [ramka, ogranicz, punktRamki]);

  const naPointerDown = useCallback((e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* zdarzenie syntetyczne / brak aktywnego wskaźnika */ }
    wskazniki.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (wskazniki.current.size === 2) {
      const [a, b] = [...wskazniki.current.values()];
      const srodek = punktRamki((a.x + b.x) / 2, (a.y + b.y) / 2);
      startSzczypania.current = { dystans: Math.hypot(a.x - b.x, a.y - b.y), s: stan.s, srodek, tx: stan.tx, ty: stan.ty };
      startPrzeciagania.current = null;
    } else if (wskazniki.current.size === 1) {
      /* Dwukrotne tapnięcie palcem = przełącznik 1× ↔ 2,5× (mysz ma dblclick). */
      if (e.pointerType === 'touch') {
        const teraz = Date.now();
        if (teraz - ostatnieTapniecie.current < 300) {
          const { x, y } = punktRamki(e.clientX, e.clientY);
          powiekszWokol(stan.s > 1 ? 1 : SKALA_PODWOJNE, x, y);
          ostatnieTapniecie.current = 0;
          return;
        }
        ostatnieTapniecie.current = teraz;
      }
      if (stan.s > 1) {
        startPrzeciagania.current = { x: e.clientX, y: e.clientY, tx: stan.tx, ty: stan.ty };
        setPrzeciaganie(true);
      }
    }
  }, [powiekszWokol, punktRamki, stan]);

  const naPointerMove = useCallback((e: React.PointerEvent) => {
    if (!wskazniki.current.has(e.pointerId)) return;
    wskazniki.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (wskazniki.current.size >= 2 && startSzczypania.current) {
      const [a, b] = [...wskazniki.current.values()];
      const st = startSzczypania.current;
      const dystans = Math.hypot(a.x - b.x, a.y - b.y);
      const s = Math.min(SKALA_MAX, Math.max(SKALA_MIN, st.s * (dystans / Math.max(1, st.dystans))));
      const srodek = punktRamki((a.x + b.x) / 2, (a.y + b.y) / 2);
      const k = s / st.s;
      setStan(ogranicz({ s, tx: srodek.x - (st.srodek.x - st.tx) * k, ty: srodek.y - (st.srodek.y - st.ty) * k }));
      return;
    }
    const sp = startPrzeciagania.current;
    if (sp) {
      setStan((p) => ogranicz({ s: p.s, tx: sp.tx + (e.clientX - sp.x), ty: sp.ty + (e.clientY - sp.y) }));
    }
  }, [ogranicz, punktRamki]);

  const naPointerUp = useCallback((e: React.PointerEvent) => {
    wskazniki.current.delete(e.pointerId);
    if (wskazniki.current.size < 2) startSzczypania.current = null;
    if (wskazniki.current.size === 0) { startPrzeciagania.current = null; setPrzeciaganie(false); }
  }, []);

  const naDwuklik = useCallback((e: React.MouseEvent) => {
    const { x, y } = punktRamki(e.clientX, e.clientY);
    powiekszWokol(stan.s > 1 ? 1 : SKALA_PODWOJNE, x, y);
  }, [powiekszWokol, punktRamki, stan.s]);

  const resetuj = useCallback(() => setStan({ s: 1, tx: 0, ty: 0 }), []);
  const ustawSkale = useCallback((s: number) => powiekszWokol(s, 0, 0), [powiekszWokol]);

  return {
    /** Podaj jako `ref` ramki. */
    ramkaRef: ustawRamke,
    skala: stan.s,
    przeciaganie,
    /** Styl na element obrazu. */
    stylObrazu: {
      transform: `translate(${stan.tx}px, ${stan.ty}px) scale(${stan.s})`,
      transformOrigin: 'center',
      transition: przeciaganie ? 'none' : 'transform 120ms ease-out',
      willChange: 'transform',
    } as React.CSSProperties,
    /** Zdarzenia na RAMKĘ (kontener). */
    zdarzeniaRamki: {
      onPointerDown: naPointerDown,
      onPointerMove: naPointerMove,
      onPointerUp: naPointerUp,
      onPointerCancel: naPointerUp,
      onDoubleClick: naDwuklik,
    },
    resetuj,
    ustawSkale,
  };
}
