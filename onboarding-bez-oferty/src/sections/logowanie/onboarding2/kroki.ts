import type { Tlo } from '../OnboardingSceny'
import type { Odpowiedz, TrybUkladu } from './PoleOdpowiedzi'

/* Onboarding 2 — pytania i symbole odpowiedzi. Symbole to ścieżki SVG
   (pole 120×120, albo 80×80 przy `pole: 80`), z których pole odpowiedzi
   układa cząsteczki. Identyfikatory 1:1 z pierwszym onboardingiem. */

export interface Krok2 {
  id: string
  tytul: [string, string]
  podpowiedz: string
  wielokrotny: boolean
  /** Rdzeń NextByte, do którego płyną wybrane odpowiedzi */
  rdzen: boolean
  /** Rozmieszczenie wokół rdzenia — różne dla kroków 4, 5 i 6 */
  tryb?: TrybUkladu
  tlo: Tlo
  odpowiedzi: Odpowiedz[]
}

const slupki = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const h = 20 + i * 18
    const x = 22 + i * 21
    return `M${x} ${98 - h} h12 v${h} h-12 z`
  }).join(' ')

export const KROKI2: Krok2[] = [
  {
    id: 'uzycie', tytul: ['Jak planujesz', 'korzystać z NextByte?'], podpowiedz: 'Kliknij jeden z symboli',
    wielokrotny: false, rdzen: false, tlo: 'wydmy',
    odpowiedzi: [
      { id: 'prywatnie', etyk: 'Na własny użytek', glif: 'M60 38 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 M28 102 q4 -38 32 -38 q28 0 32 38' },
      { id: 'zespol', etyk: 'Dla zespołu lub firmy', glif: 'M60 36 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M36 96 q2 -30 24 -30 q22 0 24 30 M26 48 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M8 92 q2 -22 18 -22 q8 0 12 4 M94 48 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M112 92 q-2 -22 -18 -22 q-8 0 -12 4' },
    ],
  },
  {
    id: 'cel', tytul: ['Co chcesz', 'osiągnąć?'], podpowiedz: 'Zaznacz wszystko, co Cię interesuje',
    wielokrotny: true, rdzen: false, tlo: 'deszcz',
    odpowiedzi: [
      { id: 'automatyzacja', etyk: 'Automatyzacja', glif: 'M60 60 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M60 60 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M60 30 v-10 M60 90 v10 M30 60 h-10 M90 60 h10 M39 39 l-7 -7 M81 81 l7 7 M81 39 l7 -7 M39 81 l-7 7' },
      { id: 'filmy', etyk: 'Filmy AI', glif: 'M22 52 h76 v44 h-76 z M22 52 l72 -18 l3 10 M38 47 l8 -11 M58 42 l8 -11 M78 37 l8 -11' },
      { id: 'marketing', etyk: 'Marketing', glif: 'M22 98 h76 M26 84 l20 -20 l14 10 l32 -38 M80 36 h12 v12' },
      { id: 'rozgladam', etyk: 'Rozglądam się', glif: 'M60 60 m-36 0 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 M60 34 l9 26 l-9 26 l-9 -26 z' },
      { id: 'produkty', etyk: 'Produkty', glif: 'M22 44 h76 v50 h-76 z M42 44 l6 -10 h24 l6 10 M60 69 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0' },
      { id: 'viral', etyk: 'Viral i UGC', glif: 'M40 18 h40 v84 h-40 z M54 26 h12 M60 72 c-6 -9 -19 -2 -11 7 l11 11 l11 -11 c8 -9 -5 -16 -11 -7 z' },
    ],
  },
  {
    id: 'poziom', tytul: ['Jakie masz', 'doświadczenie z AI?'], podpowiedz: 'Im więcej słupków, tym więcej kontroli',
    wielokrotny: false, rdzen: false, tlo: 'podloga',
    odpowiedzi: [
      { id: 'poczatkujacy', etyk: 'Początkujący', glif: slupki(1) },
      { id: 'sredni', etyk: 'Średniozaawansowany', glif: slupki(2) },
      { id: 'zaawansowany', etyk: 'Zaawansowany', glif: slupki(3) },
      { id: 'ekspert', etyk: 'Ekspert', glif: slupki(4) },
    ],
  },
  {
    id: 'moduly', tytul: ['Które moduły', 'chcesz podłączyć?'], podpowiedz: 'Wybrane podłączą się do rdzenia NextByte',
    wielokrotny: true, rdzen: true, tlo: 'warp', tryb: 'orbita',
    odpowiedzi: [
      { id: 'chat', etyk: 'Chat AI', glif: 'M38 46 h44 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-26 l-12 10 v-10 h-6 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 z' },
      { id: 'zdjecia', etyk: 'Studio Zdjęć', glif: 'M34 82 L52 58 L64 72 L74 62 L88 82 Z M74 46 a6 6 0 1 0 0.1 0' },
      { id: 'wideo', etyk: 'Studio Wideo', glif: 'M48 44 L84 64 L48 84 Z' },
      { id: 'canvas', etyk: 'Canvas', glif: 'M34 40 h52 v40 h-52 z M60 52 a6 6 0 1 0 0.1 0 M60 58 v10' },
      { id: 'notebook', etyk: 'Notatki', glif: 'M40 38 h36 l8 8 v42 h-44 z M48 56 h28 M48 66 h28 M48 76 h18' },
      { id: 'akademia', etyk: 'Akademia', glif: 'M28 56 L60 42 L92 56 L60 70 Z M42 62 v14 q18 10 36 0 v-14' },
    ],
  },
  {
    id: 'funkcje', tytul: ['Które funkcje', 'chcesz wypróbować?'], podpowiedz: 'Zaznacz dowolne, każda wpina się w NextByte',
    wielokrotny: true, rdzen: true, tlo: 'skan', tryb: 'szyna',
    odpowiedzi: [
      { id: 'gen-zdjec', etyk: 'Zdjęcia AI', pole: 80, glif: 'M14 54 L30 34 L40 46 L48 38 L66 54 Z M52 26 a5 5 0 1 0 0.1 0' },
      { id: 'gen-wideo', etyk: 'Wideo AI', pole: 80, glif: 'M14 26 h36 v28 h-36 z M50 34 l16 -8 v28 l-16 -8' },
      { id: 'upscale', etyk: 'Upscale', pole: 80, glif: 'M18 18 h14 M18 18 v14 M62 62 h-14 M62 62 v-14 M22 22 L58 58' },
      { id: 'inpaint', etyk: 'Inpainting', pole: 80, glif: 'M20 60 L50 30 l8 8 L28 68 Z M50 30 l6 -6 l8 8 l-6 6' },
      { id: 'presety', etyk: 'Presety', pole: 80, glif: 'M18 22 h44 M18 40 h44 M18 58 h44 M30 16 v12 M50 34 v12 M36 52 v12' },
      { id: 'lektor', etyk: 'Lektor', pole: 80, glif: 'M16 40 v4 M26 30 v24 M36 22 v40 M46 32 v20 M56 26 v32 M66 38 v8' },
      { id: 'lipsync', etyk: 'Lipsync', pole: 80, glif: 'M16 40 q24 -18 48 0 q-24 18 -48 0 z M16 40 h48' },
      { id: 'awatary', etyk: 'Awatary', pole: 80, glif: 'M40 22 a10 10 0 1 0 0.1 0 M20 64 q4 -20 20 -20 q16 0 20 20' },
      { id: 'dokumenty', etyk: 'Dokumenty', pole: 80, glif: 'M22 14 h28 l10 10 v42 h-38 z M30 34 h22 M30 44 h22 M30 54 h14' },
      { id: 'asystent', etyk: 'Asystent AI', pole: 80, glif: 'M20 26 h40 v28 h-40 z M30 54 v8 M50 54 v8 M32 38 h0.1 M48 38 h0.1 M40 18 v8' },
    ],
  },
  {
    id: 'zrodlo', tytul: ['Skąd', 'o nas wiesz?'], podpowiedz: 'Zaznacz wszystko, co pasuje',
    wielokrotny: true, rdzen: true, tlo: 'przeplyw', tryb: 'lejek',
    odpowiedzi: [
      { id: 'tiktok', etyk: 'TikTok', pole: 80, glif: 'M44 20 v30 a10 10 0 1 1 -8 -10 M44 20 q4 10 14 10' },
      { id: 'youtube', etyk: 'YouTube', pole: 80, glif: 'M16 26 h48 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-48 a6 6 0 0 1 -6 -6 v-16 a6 6 0 0 1 6 -6 z M34 32 l14 8 l-14 8 z' },
      { id: 'instagram', etyk: 'Instagram', pole: 80, glif: 'M22 20 h36 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-36 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 z M40 30 a10 10 0 1 0 0.1 0' },
      { id: 'x', etyk: 'X', pole: 80, glif: 'M22 20 L58 60 M58 20 L22 60' },
      { id: 'google', etyk: 'Google', pole: 80, glif: 'M12 30 h56 a10 10 0 0 1 0 20 h-56 a10 10 0 0 1 0 -20 z M26 40 a5 5 0 1 0 0.1 0 M30 44 l5 5' },
      { id: 'facebook', etyk: 'Facebook', pole: 80, glif: 'M46 64 v-26 h10 M46 38 v-6 a8 8 0 0 1 8 -8 h4 M38 42 h18' },
      { id: 'reddit', etyk: 'Reddit', pole: 80, glif: 'M40 30 a18 12 0 1 0 0.1 0 M40 30 l4 -12 l10 4' },
      { id: 'linkedin', etyk: 'LinkedIn', pole: 80, glif: 'M24 34 v26 M24 24 h0.1 M36 60 v-26 M36 42 q0 -8 10 -8 q10 0 10 8 v18' },
      { id: 'discord', etyk: 'Discord', pole: 80, glif: 'M20 30 q20 -12 40 0 l4 24 q-24 10 -48 0 z' },
      { id: 'artykuly', etyk: 'Artykuły', pole: 80, glif: 'M14 18 h46 v44 h-46 z M60 28 h8 v34 h-8 M22 28 h30 M22 38 h30 M22 48 h20' },
      { id: 'asystenci', etyk: 'Asystenci AI', pole: 80, glif: 'M16 22 h48 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-30 l-12 10 v-10 h-6 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 z' },
      { id: 'polecenie', etyk: 'Polecenie', pole: 80, glif: 'M24 34 a8 8 0 1 0 0.1 0 M56 34 a8 8 0 1 0 0.1 0 M12 64 q2 -14 12 -14 q10 0 12 14 M44 64 q2 -14 12 -14 q10 0 12 14 M30 20 q10 -10 20 0' },
      { id: 'inne', etyk: 'Inne', pole: 80, glif: 'M22 40 h2 M39 40 h2 M56 40 h2' },
    ],
  },
  {
    id: 'problem', tytul: ['Co mamy', 'naprawić?'], podpowiedz: 'Wybierz jeden problem',
    wielokrotny: false, rdzen: false, tlo: 'wydmy',
    odpowiedzi: [
      { id: 'prompty', etyk: 'Pisanie promptów', glif: 'M30 22 h60 v76 h-60 z M40 44 q10 -8 20 2 t20 -4 M40 62 q14 10 26 -2 M40 80 h20' },
      { id: 'limity', etyk: 'Za mało generacji', glif: 'M20 44 h70 v32 h-70 z M90 54 h8 v12 h-8 M28 52 h10 v16 h-10 z' },
      { id: 'workflow', etyk: 'Trudny workflow', glif: 'M16 60 C30 20 50 100 60 60 S90 20 70 50 S40 90 60 70 S100 40 104 60' },
      { id: 'niespojne', etyk: 'Niespójne wyniki', glif: 'M30 60 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M48 46 h26 v28 h-26 z M92 46 l14 28 h-28 z' },
      { id: 'nowy', etyk: 'Dopiero zaczynam', glif: 'M16 30 L44 22 L74 30 L104 22 V92 L74 100 L44 92 L16 100 Z M44 22 V92 M74 30 V100' },
      { id: 'koszt', etyk: 'Drogie modele', glif: 'M20 28 h58 v30 h-58 z M30 44 h58 v30 h-58 z M40 60 h58 v30 h-58 z' },
    ],
  },
]
