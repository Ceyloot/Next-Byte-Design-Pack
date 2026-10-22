# Logika Object Transfer / Wstawianie z drugiego zdjęcia (stan przed poprawkami)

Zapis aktualnej logiki, żeby można było do niej wrócić po poprawkach osadzania (skala, perspektywa, logiczne miejsce). Kod: `src/sections/canvas/prompty/skladaj.ts` (`studioCross`, `sekcjaStudio`), `polecenia.ts`, `role-z-polecenia.ts`, `rezyser.ts`, `zblizenia.ts`, `prompty/zablokowane/transfer-z-drugiego-zdjecia.ts`. Ostatni commit z tą logiką: `0dcb591` (kolejne zmiany tej logiki: patrz `git log`).

## Przepływ
1. `wykryjIntencje` → „wstaw / przenieś / zamień”; `role-z-polecenia.ts` ustala role pinesek (DONOR / SOURCE / DESTINATION). Pineska na innym zdjęciu niż cel = `studioCross` (addition / object_transfer / object_swap).
2. Reżyser (`rezyser.ts`, Gemini) mierzy: `obiekt` (opis do identity card), `miejsce` (opis miejsca docelowego), `skala`/`rozmiar` (rozmiar widoczny z kamery Image 1 liczony z kotwic znanych rozmiarów), `widok`, `ulozenie` (jak coś takiego stoi na tej powierzchni), `swiatlo`.
3. `skladajPrompt` składa jeden prompt (Studio, temp 0.35, system `SYSTEM_KOMPOZYTORA`, model Gemini 3.1 / wybrany w czacie).

## Układ promptu (studioCross)
1. Polecenie użytkownika bez współrzędnych („wstaw tę szklarnię tutaj”).
2. `Position in Image N: <nazwa>, <położenie słowami> (x=… y=…)` — środek podstawy obiektu dokładnie w punkcie; dla object_swap: stary obiekt usunięty całkowicie.
3. Blok osadzenia: brick skali; THE SIZE AT THE DESTINATION; THE SUBJECT TO BRING (identity card); THE DESTINATION SPOT; LOGICAL ARRANGEMENT (wszystkie punkty styku na powierzchni z marginesem, ułożenie jak normalnie, nigdy pod losowym kątem); HOW IT MUST APPEAR THERE.
4. GENERATE THE SUBJECT FROM ZERO inside Image N, w punkcie pinu, realne proporcje; pojawia się raz; addition = „ADD, never replace”; NEVER COPY THE REFERENCE PIXELS; subtelny colour cast tylko na obiekcie, powierzchnie wokół bez zmian; THE LIGHT OF IMAGE N (zmierzone).
5. `STUDIO_ZACHOWAJ_UKLAD`, `STUDIO_JEDNO_ZDJECIE` (re-light, re-shoot, cienie, ostrość, ziarno), FINAL CHECK, `STUDIO_DOPASUJ_FILM`, REFERENCE ROLES.

## Zamrożona wersja (tryb `zablokowane/transfer-z-drugiego-zdjecia.ts`)
Misja „Generate the object shown at {{PIN_SOURCE}} from zero inside Image 1…”, bricki: referencja (identity only, nie kopiuj pikseli), miejsce („THE POINT IS FIXED”, rozmiar wg odległości od kamery, siedzi na powierzchni), scena, jedno zdjęcie, kontrola. Linie skali: rozmiar w miejscu docelowym, prawdziwy rozmiar, widok, ułożenie.

## Znane problemy (Nano Banana 2 Lite / NB2)
- Szklarnia → ogród warzywny (test użytkownika): obiekt trafia w punkt, ale skala za duża względem tarasu i perspektywy; model „wyrównuje” teren pod obiektem (goła ziemia wokół) zamiast osadzić go w istniejących grządkach; niedopasowane ziarno/ostrość.
- Lite zwykle źle liczy skalę i miejsce; NB2/Pro lepiej. Weryfikator (`kontrola-wyniku.ts`) nie sprawdza skali ani zmienionego terenu wokół obiektu.
- Pomysły do wdrożenia: skala z kotwic (obiekt ≤ N% szerokości dla punktu o danej głębi), zakaz modyfikowania terenu poza śladem obiektu, wskazówka „dopasuj obiekt do istniejącej powierzchni (grządki/tarasy), nie równaj terenu”, test skali po generacji.
