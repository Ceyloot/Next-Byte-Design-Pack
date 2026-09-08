# nextbyte-auth

Samodzielny eksport ekranów autoryzacji ze **strony głównej 3** (`nextbyte-homepage3`):

- **Logowanie / Rejestracja** — jeden ekran z przełącznikiem trybu
- **Weryfikacja e-mail** — modal z kodem 6-cyfrowym
- **Samouczek** — dwukrokowa personalizacja konta (onboarding)

Nic poza tym: bez strony głównej, cennika, nawigacji, stopki i chrome'u podglądu.

## Uruchomienie

```bash
npm install
npm run dev
```

Dev server: <http://localhost:5210>

| skrypt | co robi |
|---|---|
| `npm run dev` | serwer deweloperski (port 5210, `host: true` — widoczny w sieci lokalnej) |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej wersji |
| `npm run typecheck` | `tsc -b` — patrz „Znane błędy typów" niżej |

## Dwa wejścia

Ekran ma dwa punkty startowe przez hash w adresie, żeby nie dokładać własnej
nawigacji nad eksportowanym widokiem:

- `http://localhost:5210/` → logowanie
- `http://localhost:5210/#/rejestracja` → rejestracja

W docelowej aplikacji to są osobne trasy (`/logowanie`, `/rejestracja`) —
komponent przyjmuje je propsem `initialTryb`. Przełącznik wewnątrz formularza
działa niezależnie od adresu.

## Co jest w środku

```
src/
  main.tsx                     punkt wejścia
  App.tsx                      opakowanie 1:1 ze StronaGlownaNewSection + routing po hashu
  index.css                    skopiowany 1:1 — motywy, tokeny, typografia
  lib/utils.ts                 skopiowany 1:1 — cn()
  auth/
    LogowaniePage.tsx          skopiowany 1:1
    WeryfikacjaEmailModal.tsx  skopiowany 1:1
    OnboardingFlow.tsx         skopiowany 1:1 poza jedną linią importu (niżej)
    shared.tsx                 skopiowany 1:1 — stąd GlowButton i AnimStyles
    brand-icons.tsx            skopiowany 1:1 — MidjourneyIcon, CanvaIcon
    ai-icons.tsx               OpenAIIcon, AnthropicIcon, GeminiIcon wycięte z HomePage.tsx
```

`tailwind.config.ts`, `postcss.config.js` i pliki `tsconfig.*` też są kopiami
ze źródła, więc skala odstępów, kolory i czcionki są identyczne.

### Jedyne odstępstwa od źródła

1. **Import trzech ikon.** W oryginale `OnboardingFlow.tsx` bierze
   `OpenAIIcon`, `AnthropicIcon` i `GeminiIcon` z `./HomePage` — pliku całej
   strony głównej, którego ten eksport nie zawiera (ciągnąłby za sobą zdjęcia
   ze `src/assets` i pół sekcji marketingowych). Ikony są przeklejone bez
   zmian do `auth/ai-icons.tsx`, zmienia się tylko ścieżka importu.
2. **`baseUrl` w `tsconfig.app.json`.** Usunięte, bo w TypeScripcie 6 jest
   przestarzałe i przerywa `tsc -b` błędem, zanim ten w ogóle sprawdzi kod.
   `paths` bez `baseUrl` rozwiązuje się względem pliku konfiguracji, czyli tak
   samo. Nie dotyka kodu komponentów.

Poza tym pliki komponentów są bajt w bajt takie same jak w
`nextbyte-homepage3/src/sections/home-new/`, więc aktualizacja to zwykłe
skopiowanie plików.

## Zależności

Tylko to, czego te ekrany faktycznie używają:

`react`, `react-dom`, `lucide-react` (ikony), `clsx` + `tailwind-merge`
(funkcja `cn`), a po stronie budowania `vite`, `@vitejs/plugin-react`,
`tailwindcss`, `postcss`, `autoprefixer`, `typescript`.

Wersje są przepisane ze strony głównej 3 co do znaku. Reszta zależności
tamtego projektu (Radix, `ogl`, `sonner`, `class-variance-authority`) nie jest
tutaj potrzebna — te ekrany ich nie importują.

Czcionki (Plus Jakarta Sans i reszta) lecą z Google Fonts przez `index.html`
i `@import` na górze `index.css` — dokładnie jak w źródle.

## Motyw

Domyślny jest ciemny motyw z `:root` w `index.css`. Ten sam plik zawiera
wszystkie pozostałe motywy strony głównej — włącza się je atrybutem na
`<html>`, np. `document.documentElement.setAttribute('data-theme', 'luxury')`.

## Znane błędy typów (są też w źródle)

`npm run build` przechodzi, bo Vite tylko usuwa typy, nie sprawdza ich.
`npm run typecheck` pokaże pięć błędów, które istnieją tak samo w
`nextbyte-homepage3` — nie zostały wprowadzone przez eksport. W źródle nie
były widoczne, bo `tsc -b` przerywał się wcześniej na przestarzałym `baseUrl`:

| plik | błąd |
|---|---|
| `LogowaniePage.tsx:263` | `onboardingKrok` jest typu `1 \| 2 \| 3`, a `OnboardingFlow` przyjmuje `1 \| 2` |
| `shared.tsx:124` | `Cannot find namespace 'JSX'` — React 19 zdjął globalny namespace `JSX` |
| `shared.tsx:128` | `Tag` nie daje się użyć jako komponent JSX (skutek powyższego) |
| `WeryfikacjaEmailModal.tsx:19` | prop `onZmienEmail` zadeklarowany, nigdzie nieużywany |

Poprawiać je warto w `nextbyte-homepage3`, a tutaj tylko przekopiować pliki —
inaczej eksport przestanie być kopią 1:1.
