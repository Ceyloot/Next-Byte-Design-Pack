# @nextbyte/ui — paczka systemu wyglądu NextByte

Zbudowana paczka (nie surowe pliki) — komponenty (`ui/*` + ~65 `Glass*`), `Tile`,
`AppBackground`, `cn()`, hooki i 14 motywów CSS z `nextbyte-preview`. Instalujesz
raz, importujesz w dowolnym projekcie Vite + React + TS + Tailwind, bez kopiowania
plików i bez ręcznego ustawiania aliasu `@`.

Źródło: `Next-Byte-Design-Pack/nextbyte-preview/src`. Ta paczka jest z niego budowana
(`npm run build`), nie edytuj plików w `dist/` ręcznie.

---

## Build paczki

```bash
npm install
npm run build
```

Powstaje `dist/index.js` (+ `.cjs`, `.d.ts`), `dist/styles.css`, `dist/tailwind-preset.js`.

## Instalacja w innym projekcie

```bash
npm install --install-links file:../Next-Byte-Design-Pack/packages/nextbyte-ui
```

(ścieżka względna do folderu paczki — dostosuj do lokalizacji Twojego projektu)

**`--install-links` jest obowiązkowe.** Bez niego npm robi sam symlink i **nie
instaluje zależności paczki** (Radix, lucide-react, ogl, sonner...) — dostaniesz
błędy "Cannot find module" przy imporcie. Z `--install-links` npm kopiuje paczkę
i poprawnie rozwiązuje jej `dependencies`.

Doinstaluj też peer dependency, jeśli Twój projekt jeszcze ich nie ma:

```bash
npm install react@^19 react-dom@^19
```

## Podłączenie

**1. `tailwind.config.ts`** — dorzuć preset i wskaż Tailwindowi, żeby skanował też
komponenty paczki (inaczej klasy użyte w nich zostaną wycięte z builda):

```ts
import type { Config } from 'tailwindcss'
import nextbytePreset from '@nextbyte/ui/tailwind-preset'

export default {
  presets: [nextbytePreset],
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextbyte/ui/dist/**/*.js',
  ],
} satisfies Config
```

**2. `src/index.css`** — import paczki MUSI być pierwszą regułą w pliku (zasada
CSS: `@import` musi poprzedzać wszystkie inne reguły, w tym `@tailwind`):

```css
@import '@nextbyte/ui/styles.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

`@nextbyte/ui/styles.css` niesie fonty (Google Fonts: DM Sans, Inter, Outfit,
Plus Jakarta Sans, Space Grotesk, Syne), wszystkie 14 motywów jako bloki
`[data-theme="..."]` i style glassmorphizmu (`.nb-tafla`, `.nb-glass`...). Dyrektyw
`@tailwind` w nim NIE MA — masz już swoje własne, wyżej w tym samym pliku.

**3. Użycie w kodzie:**

```tsx
import { Button, GlassCard, Tile, TileHeader, cn } from '@nextbyte/ui'

function Przyklad() {
  return (
    <Tile>
      <TileHeader tytul="Panel" />
      <Button variant="nextbyte">Kliknij</Button>
    </Tile>
  )
}
```

**4. Przełączanie motywu** (motyw domyślny to `dark-theme` — usuń atrybut, żeby do
niego wrócić):

```ts
document.documentElement.setAttribute('data-theme', 'light-apple')
```

Pełna lista 14 kluczy motywów i 22 zmiennych kontraktu — patrz `../../README.md`
w katalogu głównym repo (`../../motywy.css` ma pełne wartości źródłowe).

---

## Czego NIE ma w tej paczce

- `CodeExporterModal.tsx`, `ComponentInspector.tsx` — narzędzia deweloperskie samej
  aplikacji podglądu `nextbyte-preview`, nie komponenty do reużycia.
- `sections/*` — strony demonstracyjne design-systemu (Paleta, Cennik, Karty...),
  specyficzne dla `nextbyte-preview`, nie część biblioteki UI.

## Po zmianie komponentu w `nextbyte-preview`

Ta paczka to kopia builda, nie symlink na żywo. Po zmianie w
`nextbyte-preview/src/components/...` skopiuj zmieniony plik do
`packages/nextbyte-ui/src/...` i uruchom `npm run build` ponownie.
