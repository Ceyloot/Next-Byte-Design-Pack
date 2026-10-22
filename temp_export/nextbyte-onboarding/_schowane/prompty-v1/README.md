# Prompty v1 — archiwum starego systemu promptowania Canvasa

Migawka z 7.10.2026, commit `907bae1`, tag git **`prompty-v1`**. Zachowana na wypadek, gdyby nowy system promptowania trzeba było porównać ze starym albo coś z niego odzyskać. Leży poza `src/`, więc Vite i TypeScript jej nie widzą.

Pełny, działający Canvas razem z tą logiką jest też w paczce `nextbyte-canvas-studio` (folder i `.zip`) oraz w tagu `prompty-v1` (`git checkout prompty-v1`).

## Jak działał stary system (w skrócie)

1. **Pinezki** (`typy.ts`, `ZnacznikPineski.tsx`, `KartaPineski.tsx`): do 10 punktów na zdjęciach; nazwa rzeczy pod punktem z Gemini (`runware-proxy.ts` tryb `obiekt`), ramka całej rzeczy, role (obiekt / miejsce / cel) z `role-z-polecenia.ts` i `uklad-pinesek.ts`.
2. **Intencja** (`polecenia.ts`, `tryby-edycji.ts`): rozpoznanie trybu ze zdania regexami (zamień, przenieś, wstaw, usuń, ubranie, styl, pora dnia, perspektywa…).
3. **Reżyser** (`rezyser.ts`, `agent-proxy.ts`): Gemini ogląda zdjęcia z pinezkami i zwraca plan: który obraz jest docelowy, opis pinesek, skalę, światło, miejsce, kotwice.
4. **Składarka** (`prompty/skladaj.ts`): z bricków (`prompty/bricks/`), operacji (`prompty/operacje/`) i zamrożonych trybów (`prompty/zablokowane/`) buduje prompt; postacie przez `prompty/postac-pdf.ts` (prompty Studia Zdjęć) i krótki wariant.
5. **Generacja** (`generowanie.ts`, `dostawca.ts`, `runware-proxy.ts`): Runware (Nano Banana, GPT Image 2).
6. **Kontrola** (`kontrola-polecenia.ts` przed, `kontrola-wyniku.ts` i `/api/canvas/sprawdz` po).
7. **Orkiestracja**: `uruchomGeneracje` w `CanvasSection.tsx` spina wszystkie kroki.

## Zawartość

| Ścieżka | Co |
|---|---|
| `src/sections/canvas/prompty/` | cały system promptów: składarka, bricki, operacje, zamrożone tryby, postacie wg PDF, perspektywa |
| `.../polecenia.ts`, `tryby-edycji.ts` | intencje i budowanie polecenia |
| `.../role-z-polecenia.ts`, `uklad-pinesek.ts`, `mapa-miejsc.ts`, `kropki.ts` | logika pinesek: role, układ, mapa miejsc dla reżysera |
| `.../rezyser.ts`, `agent-proxy.ts` | reżyser (prompt systemowy + serwer), kontrola wyniku, rozpoznawanie |
| `.../zblizenia.ts`, `referencje.ts`, `wytnij-twarz.ts`, `zloz-wycinek.ts`, `dopasuj-ziarno.ts`, `szkic-sceny.ts`, `inpainting.ts` | obróbka obrazów wokół promptu (wycinki, zbliżenia, referencje osób, inpainting) |
| `.../dostawca.ts`, `generowanie.ts`, `runware-proxy.ts`, `formaty-modelu.ts`, `typy.ts` | komunikacja z modelami i typy |
| `.../ZnacznikPineski.tsx`, `KartaPineski.tsx`, `PasekPolecenia.tsx`, `CzatCanvas.tsx` | interfejs pinesek i czatu |
| `src/sections/CanvasSection.tsx` | orkiestracja generacji |
| `referencje/` | `CLAUDE.md` (lista trybów zablokowanych), PDF „Studio Zdjęć — prompty systemowe” i jego tekst |

## Jak wrócić do starej wersji

- Pełny stan: `git checkout prompty-v1` (albo `git checkout prompty-v1 -- nextbyte-preview/src`).
- Pojedynczy plik: skopiuj z tego folderu do tej samej ścieżki pod `src/`.
- Nie zawiera: pozostałych plików UI Canvasa (`Plotno.tsx`, `Prompter.tsx` itd.) — te nadal są w `src/` i w paczce eksportu.
