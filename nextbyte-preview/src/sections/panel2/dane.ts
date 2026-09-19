/* ═══════════════════════════════════════════════════════════════
   PANEL 2.0 — dane demonstracyjne
   Jedno miejsce na treść, żeby widoki zostały czystym układem.
   ═══════════════════════════════════════════════════════════════ */

import {
  Sparkles, MessageSquare, Terminal, Brain, ShieldAlert, TrendingUp,
  Camera, Video, Calendar, CheckSquare, FileText, PenTool, Cloud,
  Building2, ShoppingBag, GraduationCap, Shield, LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

export type PozycjaMenu = {
  id: string
  etykieta: string
  ikona: LucideIcon
  /** Znacznik po prawej — np. kłódka Red Zone / Zarządu */
  znacznik?: LucideIcon
}

export type GrupaMenu = {
  id: string
  etykieta?: string
  pozycje: PozycjaMenu[]
}

export const MENU: GrupaMenu[] = [
  {
    id: 'glowne',
    pozycje: [{ id: 'panel', etykieta: 'Panel Główny', ikona: LayoutGrid }],
  },
  {
    id: 'ai',
    etykieta: 'AI',
    pozycje: [
      { id: 'asystent', etykieta: 'Personalny Asystent', ikona: Sparkles },
      { id: 'chat',     etykieta: 'Chat AI',             ikona: MessageSquare },
      { id: 'promptex', etykieta: 'PromptEx',            ikona: Terminal },
      { id: 'pamiec',   etykieta: 'Pamięć AI',           ikona: Brain },
      { id: 'redzone',  etykieta: 'Red Zone',            ikona: ShieldAlert, znacznik: Shield },
    ],
  },
  {
    id: 'przypiete',
    etykieta: 'Przypięte moduły',
    pozycje: [
      { id: 'trend',  etykieta: 'Trend',        ikona: TrendingUp },
      { id: 'zdjecia', etykieta: 'Studio Zdjęć', ikona: Camera },
      { id: 'video',  etykieta: 'Studio Video',  ikona: Video },
    ],
  },
  {
    id: 'praca',
    etykieta: 'Praca',
    pozycje: [
      { id: 'kalendarz', etykieta: 'Kalendarz', ikona: Calendar },
      { id: 'zadania',   etykieta: 'Zadania',   ikona: CheckSquare },
      { id: 'notatki',   etykieta: 'Notatki',   ikona: FileText },
      { id: 'tablice',   etykieta: 'Tablice',   ikona: PenTool },
      { id: 'nextcloud', etykieta: 'NextCloud', ikona: Cloud },
      { id: 'firma',     etykieta: 'Firma',     ikona: Building2 },
    ],
  },
  {
    id: 'spolecznosc',
    etykieta: 'Społeczność',
    pozycje: [
      { id: 'tworca',   etykieta: 'Panel Twórcy', ikona: Sparkles },
      { id: 'sklep',    etykieta: 'Sklep',        ikona: ShoppingBag },
      { id: 'akademia', etykieta: 'Akademia',     ikona: GraduationCap },
    ],
  },
  {
    id: 'zarzad',
    pozycje: [{ id: 'zarzad', etykieta: 'Zarząd', ikona: Shield, znacznik: Shield }],
  },
]

/* ── Aktywność: 6 miesięcy × 7 dni ────────────────────────────── */

export const MIESIACE = ['Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz'] as const

/** Deterministyczny szum — ten sam obraz przy każdym renderze. */
function ziarno(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** 26 tygodni × 7 dni, poziom 0–3. */
export const AKTYWNOSC: number[][] = Array.from({ length: 26 }, (_, t) =>
  Array.from({ length: 7 }, (_, d) => {
    const v = ziarno(t * 7 + d)
    if (v > 0.93) return 3
    if (v > 0.78) return 2
    if (v > 0.55) return 1
    return 0
  }),
)

/* ── Ostatnie pozycje ─────────────────────────────────────────── */

export type TypPozycji = 'notatka' | 'rozmowa' | 'plik' | 'obraz' | 'tablica'

export type Ostatnie = {
  id: string
  tytul: string
  typ: TypPozycji
  data: string
}

export const OSTATNIE: Ostatnie[] = [
  { id: 'o1', tytul: '🔬 Deep Research: nowy algorytm tik toka i zasada przesyłania filmów', typ: 'notatka', data: '10 wrz' },
  { id: 'o2', tytul: 'Weryfikacja danych z licznika',                                        typ: 'rozmowa', data: '10 wrz' },
  { id: 'o3', tytul: 'Zrzut ekranu 2026-09-10 120527.png',                                   typ: 'obraz',   data: '10 wrz' },
  { id: 'o4', tytul: '🔬 Deep Research: nowe rozwiązania AI na rynku',                        typ: 'notatka', data: '24 sie' },
  { id: 'o5', tytul: 'Nowa notatka',                                                          typ: 'notatka', data: '24 sie' },
  { id: 'o6', tytul: 'Plan kampanii Q4 — szkic',                                              typ: 'tablica', data: '22 sie' },
  { id: 'o7', tytul: 'Umowa ramowa v3.pdf',                                                   typ: 'plik',    data: '19 sie' },
  { id: 'o8', tytul: 'Brief do sesji produktowej',                                            typ: 'rozmowa', data: '18 sie' },
]

/* ── Powiadomienia (dok: Aktywność) ───────────────────────────── */

export const POWIADOMIENIA = [
  { id: 'p1', tytul: 'Udostępniono notatkę', obiekt: 'Reklama Główna',   status: 'ZAAKCEPTOWANO', kiedy: '26 dni temu' },
  { id: 'p2', tytul: 'Udostępniono notatkę', obiekt: 'Nb krys ar mic plan', status: 'ZAAKCEPTOWANO', kiedy: '2 miesiące temu' },
  { id: 'p3', tytul: 'Udostępniono notatkę', obiekt: 'Moodboard — jesień', status: 'ZAAKCEPTOWANO', kiedy: '2 miesiące temu' },
]

/* ── Szybka podróż ────────────────────────────────────────────── */

export type Skrot = { id: string; etykieta: string; ikona: LucideIcon; odcien: string } | null

export const SKROTY: Skrot[] = [
  { id: 's1', etykieta: 'Co trzeba w kambipo…', ikona: MessageSquare, odcien: '204 91% 70%' },
  { id: 's2', etykieta: 'Kalendarz',            ikona: Calendar,      odcien: '14 90% 62%' },
  null, null, null, null,
]
