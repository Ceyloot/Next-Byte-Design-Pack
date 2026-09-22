import { bazowyWezel, nowyId, type Klatka, type Wezel } from './typy'

/**
 * Biblioteka kafelków — to, co widać w lewym panelu edytora.
 *
 * Każda pozycja to fabryka węzła. Miniatura w panelu renderuje dokładnie
 * ten sam węzeł, który wstawi się na scenę, więc podgląd nie może skłamać.
 */

export type KluczKategorii =
  | 'kafelki'
  | 'przyciski'
  | 'glass'
  | 'liquid'
  | 'efekty'
  | 'ksztalty'
  | 'ikony'
  | 'tekst'

export interface Kategoria {
  klucz: KluczKategorii
  etykieta: string
  opis: string
}

export const KATEGORIE: Kategoria[] = [
  { klucz: 'kafelki',   etykieta: 'Kafelki',       opis: 'Karty cennika, feature, statystyki' },
  { klucz: 'przyciski', etykieta: 'Przyciski',     opis: 'CTA, pigułki, warianty szkła' },
  { klucz: 'glass',     etykieta: 'Glassmorphism', opis: 'Rozmycie tła i delikatna ramka' },
  { klucz: 'liquid',    etykieta: 'Liquid Glass',  opis: 'Soczewka z wewnętrznym rozświetleniem' },
  { klucz: 'efekty',    etykieta: 'Efekty',        opis: 'Neon, gradientowa obwódka, siatka' },
  { klucz: 'ksztalty',  etykieta: 'Kształty',      opis: 'Prostokąty, elipsy, krzywe' },
  { klucz: 'ikony',     etykieta: 'Ikony',         opis: 'Ścieżki gotowe do edycji punktów' },
  { klucz: 'tekst',     etykieta: 'Tekst',         opis: 'Nagłówki i etykiety' },
]

export interface PozycjaBiblioteki {
  id: string
  kategoria: KluczKategorii
  nazwa: string
  /** słowa do wyszukiwarki, po polsku i angielsku */
  tagi: string[]
  utworz: () => Wezel
}

const AKCENT = '#38bdf8'
const FIOLET = '#a78bfa'
const LIMONKA = '#84cc16'
const BURSZTYN = '#f59e0b'

/* ── Kafelki ─────────────────────────────────────────────────────── */

function kafelekCennika(nazwa: string, tresc: Wezel['tresc'], efekt: Wezel['efekt'], akcent: string): Wezel {
  return bazowyWezel({
    typ: 'kafelek',
    nazwa,
    w: 240,
    h: 300,
    promien: 18,
    efekt,
    akcent,
    tresc,
  })
}

/* ── Ikony jako ścieżki ──────────────────────────────────────────── */

function sciezka(nazwa: string, punkty: Wezel['punkty'], opcje: Partial<Wezel> = {}): Wezel {
  return bazowyWezel({
    typ: 'sciezka',
    nazwa,
    w: 120,
    h: 120,
    punkty,
    zamknieta: true,
    wypelnienie: 'none',
    obrys: AKCENT,
    grubosc: 8,
    ...opcje,
  })
}

/** Zaokrąglony prostokąt włącznika (toggle) jako edytowalna ścieżka. */
function punktyWlacznika(): Wezel['punkty'] {
  const r = 26
  const l = 14
  const p = 106
  const g = 34
  const d = 86
  return [
    { x: l + r, y: g, wx: l + r, wy: g, zx: p - r, zy: g },
    { x: p - r, y: g, wx: p - r, wy: g, zx: p, zy: g },
    { x: p, y: g + r, wx: p, wy: g, zx: p, zy: d },
    { x: p - r, y: d, wx: p, wy: d, zx: l + r, zy: d },
    { x: l + r, y: d, wx: l + r, wy: d, zx: l, zy: d },
    { x: l, y: g + r, wx: l, wy: d, zx: l, zy: g },
  ]
}

function punktyGwiazdy(ramiona = 5, rz = 52, rw = 22): Wezel['punkty'] {
  const sx = 60
  const sy = 60
  const punkty: NonNullable<Wezel['punkty']> = []
  for (let i = 0; i < ramiona * 2; i++) {
    const r = i % 2 === 0 ? rz : rw
    const kat = (Math.PI / ramiona) * i - Math.PI / 2
    punkty.push({ x: sx + Math.cos(kat) * r, y: sy + Math.sin(kat) * r })
  }
  return punkty
}

function punktyStrzalki(): Wezel['punkty'] {
  return [
    { x: 20, y: 60 },
    { x: 92, y: 60 },
    { x: 66, y: 32 },
    { x: 92, y: 60 },
    { x: 66, y: 88 },
  ]
}

function punktyFali(): Wezel['punkty'] {
  return [
    { x: 8,   y: 60, zx: 28, zy: 18 },
    { x: 46,  y: 60, wx: 26, wy: 102, zx: 66, zy: 18 },
    { x: 84,  y: 60, wx: 64, wy: 102, zx: 104, zy: 18 },
    { x: 116, y: 60, wx: 100, wy: 92 },
  ]
}

/* ── Rejestr ─────────────────────────────────────────────────────── */

export const BIBLIOTEKA: PozycjaBiblioteki[] = [
  /* Kafelki */
  {
    id: 'kafelek-free',
    kategoria: 'kafelki',
    nazwa: 'Cennik — Free',
    tagi: ['cennik', 'plan', 'karta', 'pricing'],
    utworz: () =>
      kafelekCennika(
        'Kafelek Free',
        { tytul: 'Bezpłatny', podtytul: 'Start z podstawową funkcjonalnością', cena: 'Free', cta: 'Zacznij za darmo' },
        'brak',
        AKCENT,
      ),
  },
  {
    id: 'kafelek-lite',
    kategoria: 'kafelki',
    nazwa: 'Cennik — Lite',
    tagi: ['cennik', 'plan', 'karta', 'pricing'],
    utworz: () =>
      kafelekCennika(
        'Kafelek Lite',
        {
          znaczek: '−9%',
          tytul: 'Lite',
          podtytul: 'Miejsce w cyklu pracy',
          cena: '23',
          sufiks: 'zł/m',
          punkty: ['Rozliczenie roczne', 'Oszczędzasz 36 zł'],
          cta: 'Wybierz Lite',
        },
        'glass',
        AKCENT,
      ),
  },
  {
    id: 'kafelek-premium',
    kategoria: 'kafelki',
    nazwa: 'Cennik — Premium',
    tagi: ['cennik', 'plan', 'wyróżniony', 'pricing'],
    utworz: () =>
      kafelekCennika(
        'Kafelek Premium',
        {
          znaczek: 'Popularny',
          tytul: 'Premium',
          podtytul: 'Pełny dostęp do funkcji AI',
          cena: '82',
          sufiks: 'zł/m',
          punkty: ['Wsparcie priorytetowe', 'Nielimitowane projekty'],
          cta: 'Wybierz Premium',
        },
        'gradient',
        FIOLET,
      ),
  },
  {
    id: 'kafelek-ultimate',
    kategoria: 'kafelki',
    nazwa: 'Cennik — Ultimate',
    tagi: ['cennik', 'plan', 'max', 'pricing'],
    utworz: () =>
      kafelekCennika(
        'Kafelek Ultimate',
        {
          znaczek: 'Max',
          tytul: 'Ultimate',
          podtytul: 'Maksymalne możliwości AI',
          cena: '290',
          sufiks: 'zł/m',
          punkty: ['Dedykowany opiekun', 'SLA 99,9%'],
          cta: 'Wybierz Ultimate',
        },
        'liquid',
        AKCENT,
      ),
  },
  {
    id: 'kafelek-statystyka',
    kategoria: 'kafelki',
    nazwa: 'Kafelek statystyki',
    tagi: ['stat', 'kpi', 'liczba', 'dashboard'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Statystyka',
        w: 220,
        h: 120,
        promien: 16,
        efekt: 'brak',
        akcent: LIMONKA,
        tresc: { podtytul: 'Aktywni użytkownicy', cena: '2 847', sufiks: '+12%' },
      }),
  },
  {
    id: 'kafelek-funkcja',
    kategoria: 'kafelki',
    nazwa: 'Kafelek funkcji',
    tagi: ['feature', 'opis', 'karta'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Funkcja',
        w: 250,
        h: 160,
        promien: 16,
        efekt: 'siatka',
        akcent: AKCENT,
        tresc: {
          znaczek: 'Nowość',
          tytul: 'Edytor wektorowy',
          podtytul: 'Rysuj kształty, animuj je i wyślij prosto do kodu.',
        },
      }),
  },

  /* Przyciski */
  {
    id: 'przycisk-primary',
    kategoria: 'przyciski',
    nazwa: 'Primary',
    tagi: ['button', 'cta', 'akcja'],
    utworz: () =>
      bazowyWezel({ typ: 'przycisk', nazwa: 'Przycisk primary', w: 150, h: 42, promien: 12, efekt: 'brak', akcent: AKCENT, tekst: 'Zaczynamy' }),
  },
  {
    id: 'przycisk-glass',
    kategoria: 'przyciski',
    nazwa: 'Glass',
    tagi: ['button', 'szkło', 'ghost'],
    utworz: () =>
      bazowyWezel({ typ: 'przycisk', nazwa: 'Przycisk glass', w: 150, h: 42, promien: 12, efekt: 'glass', akcent: AKCENT, tekst: 'Dowiedz się więcej' }),
  },
  {
    id: 'przycisk-liquid',
    kategoria: 'przyciski',
    nazwa: 'Liquid',
    tagi: ['button', 'liquid glass', 'apple'],
    utworz: () =>
      bazowyWezel({ typ: 'przycisk', nazwa: 'Przycisk liquid', w: 160, h: 46, promien: 999, efekt: 'liquid', akcent: AKCENT, tekst: 'Otwórz panel' }),
  },
  {
    id: 'przycisk-neon',
    kategoria: 'przyciski',
    nazwa: 'Neon',
    tagi: ['button', 'neon', 'glow'],
    utworz: () =>
      bazowyWezel({ typ: 'przycisk', nazwa: 'Przycisk neon', w: 150, h: 42, promien: 12, efekt: 'neon', akcent: LIMONKA, tekst: 'Uruchom' }),
  },
  {
    id: 'przycisk-pigulka',
    kategoria: 'przyciski',
    nazwa: 'Pigułka',
    tagi: ['badge', 'pill', 'tag'],
    utworz: () =>
      bazowyWezel({ typ: 'przycisk', nazwa: 'Pigułka', w: 104, h: 30, promien: 999, efekt: 'gradient', akcent: BURSZTYN, tekst: 'Beta', rozmiar: 11 }),
  },

  /* Glassmorphism */
  {
    id: 'glass-panel',
    kategoria: 'glass',
    nazwa: 'Panel szklany',
    tagi: ['glassmorphism', 'panel', 'blur'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Panel szklany',
        w: 260,
        h: 170,
        promien: 20,
        efekt: 'glass',
        akcent: AKCENT,
        tresc: { tytul: 'Panel szklany', podtytul: 'backdrop-filter: blur(18px) saturate(140%)' },
      }),
  },
  {
    id: 'glass-powiadomienie',
    kategoria: 'glass',
    nazwa: 'Powiadomienie',
    tagi: ['toast', 'notification', 'alert'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Powiadomienie',
        w: 280,
        h: 88,
        promien: 14,
        efekt: 'glass',
        akcent: LIMONKA,
        tresc: { tytul: 'Zapisano projekt', podtytul: 'Wersja 12 · przed chwilą' },
      }),
  },
  {
    id: 'glass-kolo',
    kategoria: 'glass',
    nazwa: 'Szklane koło',
    tagi: ['avatar', 'okrąg', 'blur'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Szklane koło',
        w: 96,
        h: 96,
        promien: 999,
        efekt: 'glass',
        akcent: AKCENT,
        tresc: {},
      }),
  },

  /* Liquid Glass */
  {
    id: 'liquid-pasek',
    kategoria: 'liquid',
    nazwa: 'Pasek sterowania',
    tagi: ['liquid glass', 'dock', 'toolbar'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Pasek liquid',
        w: 320,
        h: 62,
        promien: 999,
        efekt: 'liquid',
        akcent: AKCENT,
        tresc: { tytul: 'Liquid Glass', podtytul: 'soczewka + wewnętrzne rozświetlenie' },
      }),
  },
  {
    id: 'liquid-karta',
    kategoria: 'liquid',
    nazwa: 'Karta soczewkowa',
    tagi: ['liquid glass', 'karta', 'lens'],
    utworz: () =>
      bazowyWezel({
        typ: 'kafelek',
        nazwa: 'Karta liquid',
        w: 250,
        h: 180,
        promien: 24,
        efekt: 'liquid',
        akcent: FIOLET,
        tresc: { znaczek: 'Liquid', tytul: 'Soczewka', podtytul: 'Rozświetlenie inset + saturacja 180%' },
      }),
  },

  /* Efekty */
  {
    id: 'efekt-neon',
    kategoria: 'efekty',
    nazwa: 'Ramka neon',
    tagi: ['neon', 'glow', 'poświata'],
    utworz: () =>
      bazowyWezel({ typ: 'kafelek', nazwa: 'Neon', w: 220, h: 130, promien: 16, efekt: 'neon', akcent: LIMONKA, tresc: { tytul: 'Neon' } }),
  },
  {
    id: 'efekt-gradient',
    kategoria: 'efekty',
    nazwa: 'Obwódka gradientowa',
    tagi: ['gradient', 'border', 'ramka'],
    utworz: () =>
      bazowyWezel({ typ: 'kafelek', nazwa: 'Gradient', w: 220, h: 130, promien: 16, efekt: 'gradient', akcent: FIOLET, tresc: { tytul: 'Gradient' } }),
  },
  {
    id: 'efekt-siatka',
    kategoria: 'efekty',
    nazwa: 'Siatka techniczna',
    tagi: ['grid', 'siatka', 'tło'],
    utworz: () =>
      bazowyWezel({ typ: 'kafelek', nazwa: 'Siatka', w: 240, h: 150, promien: 16, efekt: 'siatka', akcent: AKCENT, tresc: { tytul: 'Siatka' } }),
  },

  /* Kształty */
  {
    id: 'ksztalt-prostokat',
    kategoria: 'ksztalty',
    nazwa: 'Prostokąt',
    tagi: ['rect', 'prostokąt', 'box'],
    utworz: () => bazowyWezel({ typ: 'prostokat', nazwa: 'Prostokąt', w: 160, h: 110, promien: 16, wypelnienie: AKCENT }),
  },
  {
    id: 'ksztalt-elipsa',
    kategoria: 'ksztalty',
    nazwa: 'Elipsa',
    tagi: ['koło', 'circle', 'ellipse'],
    utworz: () => bazowyWezel({ typ: 'elipsa', nazwa: 'Elipsa', w: 120, h: 120, wypelnienie: FIOLET }),
  },
  {
    id: 'ksztalt-obrys',
    kategoria: 'ksztalty',
    nazwa: 'Ramka (obrys)',
    tagi: ['stroke', 'outline', 'obrys'],
    utworz: () =>
      bazowyWezel({ typ: 'prostokat', nazwa: 'Ramka', w: 160, h: 110, promien: 20, wypelnienie: 'none', obrys: AKCENT, grubosc: 3 }),
  },
  {
    id: 'ksztalt-gwiazda',
    kategoria: 'ksztalty',
    nazwa: 'Gwiazda',
    tagi: ['star', 'gwiazda', 'ocena'],
    utworz: () => sciezka('Gwiazda', punktyGwiazdy(), { wypelnienie: BURSZTYN, obrys: 'transparent', grubosc: 0 }),
  },
  {
    id: 'ksztalt-fala',
    kategoria: 'ksztalty',
    nazwa: 'Fala',
    tagi: ['wave', 'krzywa', 'bezier'],
    utworz: () => sciezka('Fala', punktyFali(), { zamknieta: false, obrys: FIOLET, grubosc: 6 }),
  },

  /* Ikony */
  {
    id: 'ikona-wlacznik',
    kategoria: 'ikony',
    nazwa: 'Włącznik',
    tagi: ['toggle', 'switch', 'włącznik'],
    utworz: () => sciezka('Włącznik', punktyWlacznika(), { grubosc: 7 }),
  },
  {
    id: 'ikona-strzalka',
    kategoria: 'ikony',
    nazwa: 'Strzałka',
    tagi: ['arrow', 'strzałka', 'dalej'],
    utworz: () => sciezka('Strzałka', punktyStrzalki(), { zamknieta: false, grubosc: 9 }),
  },
  {
    id: 'ikona-ptaszek',
    kategoria: 'ikony',
    nazwa: 'Ptaszek',
    tagi: ['check', 'ok', 'zatwierdź'],
    utworz: () =>
      sciezka(
        'Ptaszek',
        [
          { x: 24, y: 62 },
          { x: 50, y: 86 },
          { x: 96, y: 34 },
        ],
        { zamknieta: false, obrys: LIMONKA, grubosc: 10 },
      ),
  },
  {
    id: 'ikona-krzyzyk',
    kategoria: 'ikony',
    nazwa: 'Krzyżyk',
    tagi: ['close', 'zamknij', 'x'],
    utworz: () =>
      sciezka(
        'Krzyżyk',
        [
          { x: 30, y: 30 },
          { x: 90, y: 90 },
          { x: 60, y: 60 },
          { x: 90, y: 30 },
          { x: 30, y: 90 },
        ],
        { zamknieta: false, obrys: '#f87171', grubosc: 9 },
      ),
  },

  /* Tekst */
  {
    id: 'tekst-naglowek',
    kategoria: 'tekst',
    nazwa: 'Nagłówek',
    tagi: ['heading', 'tytuł', 'h1'],
    utworz: () => bazowyWezel({ typ: 'tekst', nazwa: 'Nagłówek', w: 280, h: 44, tekst: 'Projektuj szybciej', rozmiar: 30, waga: 800 }),
  },
  {
    id: 'tekst-etykieta',
    kategoria: 'tekst',
    nazwa: 'Etykieta',
    tagi: ['label', 'podpis', 'caption'],
    utworz: () =>
      bazowyWezel({ typ: 'tekst', nazwa: 'Etykieta', w: 200, h: 20, tekst: 'Wersja 2.0 · beta', rozmiar: 12, waga: 500, kolorTekstu: '#94a3b8' }),
  },
]

/* ── Gotowe animacje ─────────────────────────────────────────────── */

export interface PresetAnimacji {
  id: string
  nazwa: string
  opis: string
  /** `w` i `h` pozwalają liczyć przesunięcia względem rozmiaru węzła */
  klatki: (wezel: Wezel, dlugosc: number) => Klatka[]
}

const k = (
  wlasciwosc: Klatka['wlasciwosc'],
  czas: number,
  wartosc: number,
  wygladzanie: Klatka['wygladzanie'] = 'łagodne',
): Klatka => ({ id: nowyId('k'), wlasciwosc, czas, wartosc, wygladzanie })

export const PRESETY_ANIMACJI: PresetAnimacji[] = [
  {
    id: 'pojawienie',
    nazwa: 'Pojawienie',
    opis: 'Krycie 0 → 1 z lekkim podjazdem',
    klatki: (w, d) => [
      k('krycie', 0, 0, 'wyjście'),
      k('krycie', d * 0.5, 1),
      k('y', 0, w.y + 24, 'wyjście'),
      k('y', d * 0.5, w.y),
    ],
  },
  {
    id: 'puls',
    nazwa: 'Puls',
    opis: 'Skala 1 → 1.06 → 1',
    klatki: (w, d) => [k('skala', 0, w.skala), k('skala', d * 0.5, w.skala * 1.06), k('skala', d, w.skala)],
  },
  {
    id: 'obrot',
    nazwa: 'Obrót',
    opis: 'Pełny obrót w czasie osi',
    klatki: (w, d) => [k('obrot', 0, w.obrot, 'liniowe'), k('obrot', d, w.obrot + 360, 'liniowe')],
  },
  {
    id: 'wjazd-z-lewej',
    nazwa: 'Wjazd z lewej',
    opis: 'Przesunięcie X z wygaszeniem',
    klatki: (w, d) => [
      k('x', 0, w.x - 80, 'wyjście'),
      k('x', d * 0.6, w.x),
      k('krycie', 0, 0, 'wyjście'),
      k('krycie', d * 0.4, 1),
    ],
  },
  {
    id: 'odbicie',
    nazwa: 'Odbicie',
    opis: 'Sprężysty skok w pionie',
    klatki: (w, d) => [
      k('y', 0, w.y, 'sprężyste'),
      k('y', d * 0.4, w.y - 34, 'sprężyste'),
      k('y', d * 0.8, w.y, 'łagodne'),
    ],
  },
  {
    id: 'mrugniecie',
    nazwa: 'Mrugnięcie',
    opis: 'Skokowe krycie — dobre pod kursor/status',
    klatki: (_w, d) => [
      k('krycie', 0, 1, 'skok'),
      k('krycie', d * 0.5, 0.25, 'skok'),
      k('krycie', d, 1, 'skok'),
    ],
  },
]
