# NextByte — Panel Główny (eksport, motyw jasny i ciemny)

Samodzielna kopia **Panelu Głównego** platformy NextByte (`nextbyte.space/panel-glowny`)
razem z powłoką — paskiem bocznym, nawigacją, tłem i materiałem liquid glass —
w **obu motywach**: ciemnym i jasnym.

## Uruchomienie

```
npm install
npm run dev        # http://localhost:8093/panel-glowny
```

Zaloguj się **swoim kontem NextByte** — panel pokazuje Twoje prawdziwe dane
(saldo Byte, kalendarz, zadania). Paczka pracuje na prawdziwej bazie.

## Przełącznik motywu

Lewy dolny róg: **Ciemny / Jasny**. Wybór zostaje po odświeżeniu.

## Gdzie są kolory

| Miejsce | Co steruje |
|---|---|
| `src/eksport/motywy.ts` | **Wszystkie kolory obu motywów** — kopia wartości z bazy platformy (`color_settings`). Zmieniasz wartość, strona od razu się przeładowuje. Format `H S% L%`, np. `213 60% 50%` |
| `src/index.css` | Reguły przypięte do `[data-theme="nextbyte-light"]` (≈390) — poprawki powierzchni, tekstów i szkła w jasnym motywie |
| `src/styles/design-system.css` | Kolejne reguły motywu jasnego (≈67) |
| `src/lib/szklo-motywu.ts` | Zmienne szkła wyliczane z `--card` i `--muted-foreground` (zasłona, tafla, krawędź) — wspólne dla całej platformy |

Na platformie kolory **nie** żyją w kodzie, tylko w bazie. Dlatego oddając pracę
nad kolorami, oddajesz `src/eksport/motywy.ts` — zamieniamy go na wpisy w bazie.

## Co jest w środku

| Miejsce | Co to |
|---|---|
| `src/pages/Dashboard.tsx` | Panel Główny |
| `src/components/dashboard/` | Kafelki i sekcje panelu |
| `src/components/AppShell.tsx`, `AppSidebar.tsx`, `PillNavbar.tsx`, `src/components/sidebar/` | Powłoka: pasek boczny, nawigacja w pigułce |
| `src/components/ui/` | Biblioteka komponentów (szkło, karty, przyciski, okna) |
| `src/components/ui/tlo-aplikacji.tsx`, `szklo-plynne.tsx` | Światło pod szkłem i filtry refrakcji |
| `src/eksport/` | **Tylko ta paczka** — logowanie, przełącznik motywu, zaślepka dla menu. Na platformie tego nie ma |

Pozycje menu inne niż Panel prowadzą do modułów spoza paczki — pokazują zaślepkę.

## Zasady, których pilnujemy na platformie

- **Kolory tylko z tokenów** (`hsl(var(--card))`, `bg-card`, `text-foreground`…),
  nigdy wpisane z ręki — jeden zaszyty kolor psuje któryś z motywów.
- **Zawsze sprawdzaj oba motywy** — reguła poprawiona pod jasny potrafi zepsuć ciemny.
- **Tło z `--card` / `--background` / `--primary`**, nie z `--foreground` —
  `--foreground` jako tło daje tę samą szarość we wszystkich motywach.
- **Szkło:** klasy `nb-szklo` / komponenty z `ui/`. Nie animuj `scale`/`transform`
  na elemencie ze szkłem, a na przodku szkła nie dawaj `filter` — oba wyłączają rozmycie tła.
- **`box-shadow` to jedna właściwość** — dwie klasy piszące cień nie sumują się,
  jedna zjada drugą.
- **Tailwind:** krycie działa tylko w wielokrotnościach 5 (`/10`, `/15`…);
  `bg-card/98` po cichu nie robi nic.

## Jak oddać pracę

Najprościej od razu na starcie:

```
git init && git add -A && git commit -m "start"
```

Potem odsyłasz spakowaną paczkę **bez `node_modules`** albo różnicę
(`git diff start > zmiany.patch`). Wpinamy ją z powrotem do platformy.

`src/integrations/supabase/types.ts` jest w paczce okrojony (bez schematu całej
bazy) — przy wpinaniu wraca oryginał.
