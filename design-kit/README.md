# NextByte design-kit — zwykły folder, kopiuj-wklej

Bez npm-paczki, bez `file:` linka, bez builda. Surowe pliki `.tsx`/`.ts` z
**relatywnymi importami** (nie `@/...`) — działają od razu po wklejeniu do
`src/` dowolnego projektu Vite + React + TS + Tailwind, bez konfigurowania
żadnego aliasu.

Źródło: `nextbyte-preview/src` (przez `packages/nextbyte-ui`, ta sama treść).

---

## Jak wkleić

1. Skopiuj **zawartość** trzech folderów do odpowiadających im folderów w
   `src/` Twojego projektu (scal, nie nadpisuj, jeśli już coś tam masz):

   ```
   design-kit/components/  →  src/components/
   design-kit/lib/         →  src/lib/
   design-kit/hooks/       →  src/hooks/
   ```

2. `design-kit/styles/index.css` — wklej jego zawartość do swojego
   `src/index.css` (albo podmień cały plik, jeśli projekt jest nowy). Zawiera
   `@tailwind base/components/utilities`, import fontów z Google Fonts i
   wszystkie 14 motywów jako bloki `[data-theme="..."]`.

3. Doinstaluj zależności, których używają te komponenty:

   ```bash
   npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs class-variance-authority clsx lucide-react ogl sonner tailwind-merge
   ```

4. `tailwind.config.ts` — scal zawartość `tailwind.config.snippet.ts` (w tym
   folderze) ze swoim configiem. Kolory muszą zostać zmapowane przez
   `hsl(var(--...))`, inaczej motywy z `styles/index.css` nie zadziałają.

5. Używasz normalnie:

   ```tsx
   import { Button } from './components/ui/button'
   import { GlassCard } from './components/glass'
   import { Tile, TileHeader } from './components/Tile'
   ```

   (ścieżki dopasuj do tego, gdzie faktycznie wylądowały pliki w Twoim `src/`)

6. Przełączanie motywu (domyślny to `dark-theme` — usuń atrybut, by do niego
   wrócić):

   ```ts
   document.documentElement.setAttribute('data-theme', 'light-apple')
   ```

---

## Czego tu nie ma

- `CodeExporterModal.tsx`, `ComponentInspector.tsx` — narzędzia dewelop.
  samej aplikacji `nextbyte-preview`, nie komponenty do reużycia.
- `sections/*` — strony demonstracyjne design-systemu, nie biblioteka UI.

## Aktualizacja po zmianie w `nextbyte-preview`

To zwykła kopia plików, nie link na żywo. Zmieniasz w `nextbyte-preview` →
ręcznie kopiujesz zmieniony plik tutaj (i do miejsca, gdzie go wkleiłeś).

Jeśli wolisz mechanizm, który się nie rozjeżdża (jedna paczka, `npm install`,
build) — jest `../packages/nextbyte-ui` (patrz jego README).
