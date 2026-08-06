# NextByte — paczka systemu wyglądu

**Wrzuć cały ten katalog do Claude Code i podaj mu polecenie z sekcji „ZADANIE" niżej.**
Dostaniesz działającą stronę podglądu na `localhost` ze wszystkimi komponentami
i przełącznikiem 14 motywów.

---

## MOTYW GŁÓWNY I KOLOR GŁÓWNY

To jest tożsamość NextByte — jeśli cokolwiek ma zostać nietknięte, to to:

```
Motyw domyślny:   „Ciemny motyw"  (klucz: dark-theme)
Kolor główny:     --primary: 204 91% 70%     → hsl(204 91% 70%)  — błękit
Tło:              --background: 0 0% 2%      → prawie czerń, ZEROWE nasycenie
Karta:            --card: 0 0% 3%
Obwódka:          --border: 0 0% 10%
Tekst:            --foreground: 0 0% 96%
Tekst drugorzędny:--muted-foreground: 0 0% 67%
```

**Tło ma zerowe nasycenie.** To nie jest granat ani grafit — to neutralna czerń.
Błękit występuje **wyłącznie w akcencie**, nigdy w tle. Podbarwianie ciemnych
płaszczyzn na niebiesko jest najczęstszym błędem przy tym systemie.

Wszystkie 14 motywów, z pełnymi wartościami, jest w `motywy.css`.

---

## CO JEST W PACZCE

| plik | co to | linii |
|---|---|---|
| `motywy.css` | **14 motywów** jako bloki `[data-theme="..."]` + `:root` domyślny | 592 |
| `tile.tsx` | **kafelek** — kontener, nagłówek, wiersz, pigułka, akcje, `klasyKafelka()` | 247 |
| `button.tsx` | **globalny przycisk** — 8 wariantów, domyślny to `nextbyte` | 106 |
| `szklo.css` | **glassmorphizm** — klasa `.nb-glass` dla wariantu `glass` | 62 |
| `background-patterns.tsx` | 3 typy wzorów tła (siatka, kropki, krzyżyki) | 141 |
| `TechGrid.tsx` | siatka techniczna w tle, ustępująca wzorowi użytkownika | 63 |
| `utils.ts` | `cn()` — `clsx` + `tailwind-merge` | 6 |

Wszystko jest **wycięte z działającego kodu produkcyjnego**, nie przepisane.

Pełny opis systemu (odstępy, skale, dostępność, dług do spłaty) jest
w `../SYSTEM-WYGLADU.md`.

---

## ZADANIE — wklej to Claude Code

> Masz katalog `design-kit` z systemem wyglądu platformy NextByte.
> Zbuduj projekt Vite + React + TypeScript + Tailwind, w którym te komponenty
> działają, i uruchom stronę podglądu na `localhost`.
>
> **Krok 1 — projekt.**
> Vite + React + TS. Zainstaluj: `tailwindcss`, `postcss`, `autoprefixer`,
> `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`,
> `@radix-ui/react-slot`.
>
> **Krok 2 — pliki na miejsca.**
> - `utils.ts` → `src/lib/utils.ts`
> - `tile.tsx`, `button.tsx`, `TechGrid.tsx`, `background-patterns.tsx` → `src/components/ui/`
> - zawartość `motywy.css` i `szklo.css` → `src/index.css` (razem z dyrektywami
>   `@tailwind base/components/utilities`)
> - skonfiguruj alias `@` → `./src` w `vite.config.ts` i `tsconfig.json`
>
> **Krok 3 — `tailwind.config.ts`.** Kolory MUSZĄ być mapowane na zmienne CSS
> przez `hsl(var(--...))`, inaczej motywy nie zadziałają:
>
> ```ts
> export default {
>   darkMode: ['class'],
>   content: ['./index.html', './src/**/*.{ts,tsx}'],
>   theme: {
>     screens: { xs: '475px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
>     extend: {
>       colors: {
>         background: 'hsl(var(--background))',
>         foreground: 'hsl(var(--foreground))',
>         card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
>         popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
>         primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
>         secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
>         muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
>         accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
>         destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
>         border: 'hsl(var(--border))',
>         input: 'hsl(var(--input))',
>         ring: 'hsl(var(--ring))',
>       },
>       borderRadius: {
>         lg: 'var(--radius)',
>         md: 'calc(var(--radius) - 2px)',
>         sm: 'calc(var(--radius) - 4px)',
>       },
>       fontFamily: {
>         sans: ['var(--font-body)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
>         heading: ['var(--font-heading)', 'Space Grotesk', 'ui-sans-serif', 'sans-serif'],
>       },
>       keyframes: {
>         'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
>       },
>       animation: { 'spin-slow': 'spin-slow 4s linear infinite' },
>     },
>   },
> } satisfies Config;
> ```
>
> Czcionki: Space Grotesk (nagłówki) + Inter (treść), podepnij z Google Fonts
> i ustaw `--font-heading` / `--font-body` w `:root`.
>
> **Krok 4 — strona podglądu.** Jedna strona, na niej:
>
> 1. **Pasek na górze z przełącznikiem motywu** — 14 przycisków, po jednym na
>    motyw, z nazwą i ceną w Byte. Kliknięcie ustawia
>    `document.documentElement.setAttribute('data-theme', klucz)`.
>    Motyw domyślny (`dark-theme`) uzyskujesz **usuwając** atrybut.
>    Zaznacz wyraźnie, który jest domyślny, a które są **jasne**
>    (`light-apple`, `nextbyte-light`, `future-theme`).
>
> 2. **Paleta aktywnego motywu** — próbki wszystkich 22 zmiennych kontraktu:
>    kwadrat koloru + nazwa zmiennej + wartość HSL odczytana na żywo przez
>    `getComputedStyle(document.documentElement).getPropertyValue('--primary')`.
>    Ma się aktualizować przy zmianie motywu.
>
> 3. **Przyciski** — wszystkie warianty z `button.tsx` w każdym rozmiarze
>    (`sm`, `default`, `lg`, `xl`, `icon`): `nextbyte` (domyślny), `glass`,
>    `outline`, `ghost`, `destructive`, `secondary`, `link`. Pokaż też stan
>    `disabled` i stan po najechaniu (opisz słownie, czego się spodziewać).
>
> 4. **Kafelki** — `Tile` we wszystkich trzech intencjach (`neutralna`,
>    `akcent`, `krytyczna`), obu elewacjach, w wersji zwartej i normalnej,
>    z `TileHeader`, `TileRow`, `TilePill`, `TileFooter` i wszystkimi czterema
>    rodzajami `TileAction` (`glowna`, `wtorna`, `cicha`, `usun`).
>
> 5. **Siatka kart 2×2** — cztery przykładowe kafelki z różną ilością treści,
>    żeby było widać, jak działa wyrównywanie wysokości (`h-full` + `stretch`).
>
> 6. **Wzory tła** — `BackgroundGrid`, `BackgroundDots`, `BackgroundPlus`
>    obok siebie, każdy w kilku rozmiarach i przezroczystościach.
>
> 7. **Skale** — próbki cieni (3 stopnie), promieni, odstępów i typografii
>    z podpisanymi klasami Tailwinda.
>
> **Krok 5 — uruchom `npm run dev` i sprawdź sam.** Otwórz stronę, przełącz
> na **Jasny motyw** i **Przyszły motyw**, i zweryfikuj, że nic nie znika.
> Popraw, jeśli coś jest nieczytelne, i pokaż zrzut.
>
> **ZASADY, których nie wolno złamać:**
>
> - **Wyłącznie 22 zmienne kontraktu** (patrz niżej). Żadnego `bg-black`,
>   `text-white`, `border-white`, `bg-zinc-900`, `text-blue-400` ani innych
>   kolorów z palety Tailwinda. Ani jednego.
> - **Cienie** tylko z trzech stopni w `tile.tsx`. Nie wymyślaj czwartego.
> - **Nie „poprawiaj" kolorów** komponentów na własne. Jeśli coś wygląda źle
>   na jakimś motywie, to jest **błąd do zgłoszenia**, a nie powód do zaszycia
>   koloru.
> - **Nie dodawaj drugiego przycisku ani drugiego kafelka.** Jeden komponent,
>   warianty w środku.

---

## KONTRAKT — 22 zmienne, których używa KAŻDY z 14 motywów

Tylko na tych wolno budować. Wszystko poza tą listą działa u części
użytkowników, a u reszty dziedziczy wartość z motywu domyślnego.

```
--background        --foreground
--card              --card-foreground
--popover           --popover-foreground
--primary           --primary-foreground
--secondary         --secondary-foreground
--accent            --accent-foreground
--muted             --muted-foreground
--border            --input               --ring
--destructive       --destructive-foreground
--brand-primary     --brand-primary-light  --brand-primary-dark
```

### Zmienne, których NIE ma w każdym motywie — nie używać bez zapasu

| zmienna | jest w |
|---|---|
| `--brand-bg`, `--brand-gray-50`, `--brand-gray-100` | **1 z 14** |
| `--sidebar` | 5 z 14 |
| `--brand-primary-glow`, `--chart-1..5`, `--brand-text-muted` | 7 z 14 |
| `--sidebar-background`, `--brand-text-tertiary` | 8 z 14 |
| `--brand-text-primary`, `--brand-text-secondary` | 9 z 14 |
| `--sidebar-*` (reszta) | 13 z 14 |

`--brand-primary-glow` to szczególna pułapka — jest w 7 z 14 motywów, a właśnie
po glow sięga się odruchowo przy glassmorphizmie.

---

## MOTYWY DO TESTOWANIA — nie testuj na domyślnym

Na ciemnym domyślnym wszystko wygląda dobrze i nic się nie wykrywa.

| motyw | klucz | dlaczego skrajny |
|---|---|---|
| **Jasny motyw** ☀ | `light-apple` | karta `0 0% 100%` — czysta biel |
| **Przyszły motyw** ☀ | `future-theme` | tylko **26** zmiennych, najuboższy, i jasny |
| **NextByte Jasny** ☀ | `nextbyte-light` | trzeci jasny |
| **Śnieżny** | `snowy-white` | akcent `0 0% 95%` — prawie biały |
| **Luxury** | `luxury` | akcent złoty, niskie nasycenie, najsłabszy kontrast |
| **Tęczowy RGB** | `teczowy` | akcent `280 100% 60%` — 100% nasycenia |
| **RefSpace** | `refspace` | tło czysta czerń `0 0% 0%` |

**Minimalny przebieg przed każdą zmianą wyglądu:**
Ciemny → Jasny motyw → Przyszły motyw → Śnieżny → Luxury.

---

## DLACZEGO TO POWSTAŁO

Pomiar na jednym ekranie platformy (21 plików, 4658 linii): **35 różnych cieni,
31 obramowań, 51 teł**. Z 35 cieni **27 pisanych ręcznie**, a **25 użytych
dokładnie raz**. 18 z 21 plików sklejało sobie własny kafelek.

W całym kodzie: **6918 kolorów z palety Tailwinda w 594 plikach** (31% plików),
**325 unikalnych ręcznych cieni**, i **1177 linii łatek `!important`**, które
ratują jeden jasny motyw z trzech.

Ta paczka istnieje po to, żeby nie zacząć tego od nowa.
