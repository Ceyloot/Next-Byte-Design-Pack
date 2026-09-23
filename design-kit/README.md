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

## NextGlass — szkło z Panelu Głównego

Materiał, który rozmazuje treść pod paskiem nawigacji w Panelu Głównym.
Przeniesiony **1:1** z platformy (`nextbyte-panel-glowny`), razem z komentarzami
— one niosą pomiary i decyzje, których z samego kodu nie da się odtworzyć.

| Plik | Co to |
|---|---|
| `styles/nextglass.css` | Materiał: rozmycie, nasycenie, odblask krawędzi, warianty (`nb-szklo`, `-plynne`, `-tafla`, `-pigulka`, `-foto`) |
| `components/glass/NextGlass.tsx` | 4. warstwa — załamanie światła (filtry SVG, tylko Chromium). `<NextGlassDefs />` raz, wysoko w drzewie |
| `components/glass/NextGlassBar.tsx` | Gotowy pasek nawigacji — `NextGlassBar`, `NextGlassBarSticky` |
| `lib/szklo-motywu.ts` | Liczy 4 zmienne zależne od motywu. **Bez tego jasny motyw wygląda źle** |
| `lib/szklo-mapa.ts` | Mapa zniekształcenia dla filtrów |

```tsx
import { NextGlassBarSticky, NextGlassDefs } from './components/glass'
import { zmienneSzklaDlaMotywu } from './lib/szklo-motywu'

<NextGlassDefs />
<NextGlassBarSticky>…</NextGlassBarSticky>
```

Przy każdej zmianie motywu nałóż wynik `zmienneSzklaDlaMotywu({ card, mutedForeground })`
na `<html>` — inaczej szkło stoi na wartościach zapasowych.

**Pasek musi leżeć NA przewijanej treści** (`sticky`/`fixed`). Szkło nad
jednolitym tłem to zwykła karta — cały koszt bez efektu.

Pułapki: nie animuj `scale`/`transform` na szkle i nie dawaj `filter` na jego
przodku (oba gaszą próbkowanie tła); `box-shadow` to jedna właściwość, własny
cień zje ranty i uniesienie.

## Panel 2.0 — drabina powierzchni (system reaktywny na motyw)

Komponenty, które **nie wpisują żadnego koloru**. Wybierają poziom, a kolor
wynika z motywu — jedna formuła obsługuje wszystkie 16 motywów, także te,
których jeszcze nie ma.

| Plik | Co to |
|---|---|
| `styles/powierzchnie.css` | Drabina powierzchni + klasy `p2-*`. **Fundament — zacznij tutaj.** |
| `panel2/README.md` | Przewodnik: zasady, wzorce, sprawdzian przed oddaniem kafelka |
| `panel2/Powierzchnia.tsx` | Prymitywy `Karta` / `Sekcja` / `Kontrolka` — jedyne, co dotyka powierzchni |
| `panel2/widgety/` | Sześć gotowych kafelków jako wzorce (lista, zakładki, siatka, stan pusty, dane liczbowe) |
| `panel2/PanelOdNowa.tsx` | Pełny panel złożony z powyższych |

```tsx
import '../styles/powierzchnie.css'
import { Karta, Sekcja, Kontrolka } from './panel2/Powierzchnia'

<div className="p2">
  <Karta>            {/* poziom 1 */}
    <Sekcja>         {/* poziom 2 */}
      <Kontrolka />  {/* poziom 3 */}
    </Sekcja>
  </Karta>
</div>
```

**Zasada:** poziom = odsunięcie od tła w stronę `--foreground`. Na motywach
ciemnych poziomy jaśnieją, na jasnych ciemnieją — bez wykrywania motywu.
Pełne uzasadnienie i pomiary w `panel2/README.md`.

## Czego tu nie ma

- `CodeExporterModal.tsx`, `ComponentInspector.tsx` — narzędzia dewelop.
  samej aplikacji `nextbyte-preview`, nie komponenty do reużycia.
- `sections/*` — strony demonstracyjne design-systemu, nie biblioteka UI.

## Aktualizacja po zmianie w `nextbyte-preview`

To zwykła kopia plików, nie link na żywo. Zmieniasz w `nextbyte-preview` →
ręcznie kopiujesz zmieniony plik tutaj (i do miejsca, gdzie go wkleiłeś).

Jeśli wolisz mechanizm, który się nie rozjeżdża (jedna paczka, `npm install`,
build) — jest `../packages/nextbyte-ui` (patrz jego README).
