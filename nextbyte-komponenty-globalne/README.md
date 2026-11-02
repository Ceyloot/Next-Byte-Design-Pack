# NextByte — komponenty globalne

Samodzielna paczka z globalnymi komponentami platformy NextByte (szkło płynne / liquid glass,
kafelki, okna, pola, listy wyboru, zakładki, przyciski, wskaźniki…). Pliki są skopiowane
1:1 z platformy; zmieniono tylko to, co wymagało backendu (opis niżej).

Działa **bez backendu i bez logowania** — nic nie łączy się z siecią, nie ma żadnych kluczy.

## Uruchomienie

Wymagany Node 20+.

```bash
npm install
npm run dev        # http://localhost:5191
npm run typecheck  # tsc --noEmit
npm run build      # vite build → dist/
```

Strona startowa to ta sama **Biblioteka komponentów NextByte**, którą widzimy w Panelu Zarządu
(zakładki: Biblioteka komponentów, Komponenty globalne, Płynny kursor, Kafelek, Test motywów,
Galeria, Kontrakt tokenów). Przycisk w prawym górnym rogu przełącza motyw jasny/ciemny.

## Gdzie co jest

| Ścieżka | Co to |
|---|---|
| `src/components/ui/` | wszystkie komponenty globalne (np. `tile.tsx`, `okno.tsx`, `plakietka.tsx`, `pola.tsx`, `lista-wyboru.tsx`, `zakladki.tsx`, `ustawienia.tsx`, `button.tsx`, `wskazniki.tsx`) — zasady w `src/components/ui/README.md` i `README-design-system.md` |
| `src/components/ui/szklo-plynne.tsx`, `szklo-apple/`, `szklo-pigulka.tsx`, `szklo-mapa.ts` | szkło płynne: `DefinicjeSzklaPlynnego` (filtry SVG refrakcji — montowane raz w korzeniu), `KLASA_SZKLA`, `LiquidGlass` |
| `src/lib/szklo-motywu.ts` | `zmienneSzklaDlaMotywu` — zmienne materiału szkła liczone z jasności motywu |
| `src/components/ui/tile.tsx` | `SZKLO_*` (np. `SZKLO_PRZEJRZYSTE`) i rodzina `Tile*` |
| `src/components/ui/typografia.ts`, `style-przyciskow.ts`, `material-paska.ts` | tokeny typografii, odstępów, stylów przycisków |
| `src/hooks/useKomponentyGlobalne.ts` | nakłada tokeny komponentów globalnych (`--nb-*`) na `<html>` |
| `src/index.css`, `src/styles/` | cała warstwa CSS platformy, w tym reguły pod `[data-theme="nextbyte-light"]` |
| `src/components/management/biblioteka/` | strona pokazowa (Biblioteka z Zarządu) |
| `src/eksport/` | **wszystko, co dodane na potrzeby paczki** (atrapy + kopia motywów) |
| `public/fonts/` | czcionki platformy (lokalnie, z licencjami) |
| `tailwind.config.ts`, `postcss.config.js`, `scripts/postcss-wyspa-motywu.mjs` | ta sama konfiguracja co na platformie |

### Motywy

Kolory na platformie żyją w bazie (`color_themes` + `color_settings`). Kopia dwóch motywów
podstawowych — `dark-theme` (Ciemny) i `nextbyte-light` (NextByte Jasny) — leży w
`src/eksport/motywy.ts`. `src/eksport/motyw.ts` nakłada je jak platformowy `useGlobalTheme`:
zmienne CSS na `<html>` + zmienne szkła z `zmienneSzklaDlaMotywu` + atrybut `data-theme`.

## Zasady (obowiązują jak na platformie)

1. **Kolory tylko z tokenów.** `bg-card`, `text-foreground`, `border-border`, `text-primary`,
   `hsl(var(--primary) / 0.2)` itd. Zero zaszytych `#hex`, `rgb()`, `bg-white`, `text-black`.
   Każdy zaszyty kolor psuje motywy, które użytkownicy kupują.
2. **Bezpieczne zmienne** — te, które ustawia każdy motyw: lista `BEZPIECZNE_ZMIENNE`
   w `src/components/management/biblioteka/useMotywyPodgladu.ts` (zakładka „Kontrakt tokenów").
3. **Wszystko na szkle płynnym.** Panel, okno, karta, menu = komponent z biblioteki
   (`Tile`, `Okno`, `ListaWyboru`…), nie własny `div` z tłem. Brakuje szkła → poprawka
   w komponencie biblioteki, nie łatka w miejscu użycia. Karta nad zdjęciem/wykresem = `SZKLO_PRZEJRZYSTE`.
4. **Sprawdzaj w obu motywach** (przełącznik u góry) — jasny ma własne reguły w `index.css`.
5. Nie używaj natywnych kontrolek (`<select>`, `<input type="checkbox">`) — są odpowiedniki w `ui/`.

## Co zastąpiono atrapą (bo wymagało backendu)

- `src/integrations/supabase/client.ts` → `src/eksport/supabase-atrapa.ts`: czyta motywy i tokeny
  z `motywy.ts`, zapisy (np. „Zapisz zmiany" / „Publikuj" w Komponentach globalnych) trzyma
  tylko w pamięci karty; reszta zapytań zwraca puste dane.
- `src/integrations/supabase/types.ts` → `Database = any`.
- `src/contexts/AuthContext.tsx` → `src/eksport/auth-atrapa.tsx` (zawsze gość).
- `src/lib/wartosc-byte.ts` → `src/eksport/wartosc-byte.ts` (stały kurs do przykładowej karty).
- `ui/pasek-stanu-wiersza.tsx` bierze typ z `src/eksport/stanWiersza.ts`.
- Liczby w pokazie wskaźników są przykładowe (fikcyjne).

Nie ma w paczce: `ui/nextbyte-spotlight.tsx` (wyszukiwarka całej platformy — wymaga serwera
i mapy tras), `ui/sekcja-archiwum.tsx` i `ui/pasek-komunikatu.tsx` (zależą od modułu firmowego).

## Jak zwrócić zmiany

**Plikami.** Odeślij zmienione/nowe pliki z zachowaniem ścieżek (np. spakowany katalog `src/`
albo same zmienione pliki) i krótką listę: co zmienione i dlaczego. Nie zmieniaj plików w
`src/eksport/` — to tylko atrapy pod paczkę, na platformie ich nie ma. Przed oddaniem:
`npm run typecheck` i `npm run build` bez błędów, sprawdzone w obu motywach.
