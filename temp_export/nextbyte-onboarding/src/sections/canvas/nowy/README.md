# Nowy system promptowania

Domyślny system Canvasa (stary: `_schowane/prompty-v1`, tag git `prompty-v1`). Działa dla generacji ze zdjęcia; bez zdjęcia nadal działa generator z opisu.

## Jak to działa — po ludzku

1. Wpisujesz polecenie, wbijasz pinezki, klikasz „Wyślij”.
2. **Agent** (Gemini, jedno wywołanie, ogląda zdjęcia z ponumerowanymi pinezkami):
   - jeśli nie wie, o które zdjęcie lub którą osobę chodzi, **pyta Cię w czacie** i **opisuje każde zdjęcie konkretnie** („chłopak w lustrze windy, jeansowa kurtka”), żebyś je poznał. Odpisujesz zwykłym zdaniem, a agent działa dalej, nie pytając drugi raz;
   - jeśli wie, **pisze krótki prompt po swojemu** pod model obrazu i podaje ramki (osoba, twarz, rzecz) oraz — dla rzeczy wstawianych do sceny — **skalę**.
3. **Kod** robi tylko to, co pewne: wycina z referencji samą osobę (z jej akcesoriami), robi zbliżenie twarzy, numeruje zdjęcia, dopisuje liczby ze skali i wysyła.
4. **Model obrazu** (Runware) generuje. Jedno wywołanie.
5. Gdy agent zawiedzie, działa prosty szablon (`szablon.ts`), żeby nie zostać z niczym.

## Warstwy

| Warstwa | Kto | Co robi | Koszt |
|---|---|---|---|
| 1. Agent | Gemini Flash (`/api/canvas/agent`, instrukcja w `agent-instrukcja.ts`) | rozumie, dopytuje, pisze prompt, ramki, skala | 1 wywołanie (przy błędzie 1 ponowne) |
| 2. Przygotowanie | kod (`przygotuj.ts`, `obrazy.ts`) | wycinki, numeracja, liczby ze skali | 0 |
| 3. Generacja | model obrazu | obraz | jak dotąd |
| (4. Kontrola) | wyłączona | oceniałaby wynik po generacji | nie ma jej w tej wersji |

## Zasady agenta (najważniejsze)

- **Zamiana osoby = cała osoba z referencji**: twarz, brwi, zarost, włosy i wszystko, co ma na sobie i przy sobie (okulary, słuchawki, biżuteria, pasek, strój). Agent wymienia konkretne cechy, które widzi, **oraz to, co z oryginału ma zniknąć** (np. jego wąsy, brwi). Gdy twarz na referencji jest mała lub zasłonięta, mówi, co widać, a okulary i słuchawki zostają jak na referencji.
- **Skala** (rzeczy wstawiane lub przenoszone): agent szuka w scenie dwóch–trzech rzeczy o znanym rozmiarze na podobnej odległości, ocenia prawdziwy rozmiar rzeczy (nie z referencji), a potem rozmiar **w kadrze** na tej odległości i podaje ramkę (gdzie i jak duża). Kod zamienia ją na zdanie z procentami szerokości i wysokości oraz punktem, w którym rzecz dotyka ziemi. Daleko od kamery = mała w kadrze, choćby referencja była świetna.
- **Pytanie tylko wtedy, gdy to naprawdę ważne**, jedno, prostym językiem, z 2–3 gotowymi odpowiedziami.
- **Krótki prompt**: bez „8K”, bez eseju o świetle; zakazy tylko przy realnym ryzyku.

## Pliki

`agent-instrukcja.ts` (mózg agenta) · `agent.ts` (typy, sprawdzanie odpowiedzi, tekst pytania, zdanie o skali) · `przygotuj.ts` (przepływ) · `obrazy.ts` (wycinanie) · `szablon.ts`, `role.ts`, `prompt.ts`, `typy.ts` (prosty szablon-zapas) · trasa serwera w `../agent-proxy.ts`.

## Czego tu jeszcze nie ma (świadomie, budżet)

Kontroli wyniku po generacji (twarz, skala), profili modeli (GPT vs Nano Banana), parametrów jakości/rozdzielczości, naprawy regionalnej. Skalę agent tylko szacuje — jej trafność trzeba ocenić na testach.
