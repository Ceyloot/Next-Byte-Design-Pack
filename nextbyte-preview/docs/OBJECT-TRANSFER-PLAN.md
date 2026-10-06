# Object transfer — diagnoza i plan (na podstawie PDF „Studio Zdjęć — prompty systemowe”)

## Co PDF mówi o wstawianiu obiektu
W Studiu **nie ma osobnego promptu „object transfer”**. Wstawianie obiektu z referencji to zwykły Generator z referencjami:
1. poz. 4 — booster „ONE photograph captured in-camera, not a composite…” (światło, perspektywa, cienie kontaktowe, ziarno),
2. poz. 7 — `REFERENCE ROLES` (rola „produkt”: *exact shape, colors, materials, labels and proportions; do not redesign it*),
3. poz. 14 — negatyw (tylko dla modeli, które go przyjmują; Nano Banana go nie dostaje),
4. opcjonalnie poz. 52 — Gemini „Ulepsz opis AI”: model obrazu **nie widzi referencji**, więc Gemini ma opisać słowami konkretne światło (Kelvin, kierunek, miękkość), odbicia koloru, cienie, kamerę, punkty styku i skalę. Zakaz: ogólników typu „match the lighting”.
Zamiana postaci (poz. 19–27) jest inna: „RE-PHOTOGRAPH”, a potem osobny **polish pass** (poz. 26): wynik + oryginalna scena jako wzorzec, bez ostrzenia.
PDF nie podaje żadnej reguły skali poza zdaniem „resolve scale and perspective so the subject fits the environment's geometry”.

## Co widać na naszych testach (samochód → brama, jacuzzi → taras, szklarnia → ogród)
- Obiekt jest ładny i w dobrym miejscu, ale **za duży**. Własny pomiar wyniku mówi to wprost: samochód 27% szerokości kadru przy celu 18%, jacuzzi 25% przy celu 14% — za każdym razem ok. 1,5–1,8×.
- Cel (18% / 14%) był w prompcie („THE SIZE AT THE DESTINATION”), model go zignorował. **Kolejne zdania o skali w prompcie nie pomogą** — to już sprawdziliśmy kilka razy.
- Korekta po pomiarze (`DRUGI_PRZEBIEG`) jest wyłączona, więc zmierzony błąd nie jest nigdzie naprawiany.
- Model edytuje zdjęcie, w którym scena jest ostrym obrazem, więc obiekt dokleja zamiast renderować razem ze sceną (to samo zadziałało dopiero w character swapie po rozmyciu sceny).

## Plan (od najtańszego)
**A. Geometria zamiast słów (rekomendacja nr 1).** Kod zna cel (rozmiar % i punkt pinu). Wstawiamy do Image 1 *szkic pomocniczy*: obiekt z referencji (wycięty prostokątem z Gemini `box`) przeskalowany do zmierzonego rozmiaru i położony w pinie. Prompt: „szkic pokazuje DOKŁADNY rozmiar i miejsce; wygeneruj obiekt od zera w scenie w tym miejscu i tym rozmiarze, usuń tło szkicu”. Ryzyko: efekt wklejki (wcześniejsze magentowe boxy dawały wklejkę) — dlatego test A/B.
**B. Polish pass jak w poz. 26.** Wynik + oryginał jako wzorzec; naprawia światło, ziarno, szwy. Nie naprawia skali. Kosztuje drugą generację (dziś wyłączony na życzenie).
**C. Twarda korekta skali po generacji.** Pomiar już jest. Gdy obiekt >1,25× celu: jedna regeneracja z liczbową korektą („smaller: 18%, you drew 27%”) — kod istnieje, jest wyłączony (`DRUGI_PRZEBIEG`).
**D. Prompt wyłącznie w stylu Studia** (booster + role + krótki opis od Gemini), bez zbędnych zasad. Działa jako baza do porównań, nie jako rozwiązanie skali.

## Co Gemini (reżyser) MA pisać, a czego NIE
MA: światło (Kelvin, kierunek, miękkość), odbicia koloru z otoczenia, kierunek i miękkość cieni, kamerę (ogniskowa, głębia ostrości, ziarno), punkty styku, opis obiektu (kształt, kolor, materiał), miejsce słowami, **liczby** rozmiaru wyliczone z kotwic.
NIE: ogólników („dopasuj światło”), rozmiaru w opisie obiektu (rozmiar tylko w jednej linii), sprzecznych instrukcji (np. „zachowaj widok z referencji” przy przenoszeniu w tym samym zdjęciu), opisów pinezek i współrzędnych w treści opisu, kilku różnych rozmiarów w różnych liniach, zakazów drzew i roślin jako kotwic i jednocześnie wyboru drzewa.

## Kolejność prac
1) A na samochodzie i jacuzzi (dwa przypadki, ten sam kod). 2) Jeśli A daje wklejkę — C (korekta po pomiarze) zamiast A. 3) B tylko jako opcja, gdy po A/C nadal widać różnice światła/ziarna.

---
## Research z internetu (06.10) i eksperyment „ramka”
Źródła: [Google — Nano Banana image generation](https://ai.google.dev/gemini-api/docs/image-generation), [Nano Banana Pro prompting guide (Google AI, dev.to)](https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n), [Precise Local Editing (red box)](https://nanoprompts.org/advanced-techniques/precise-local-editing), [Nano Banana Pro reference images](https://www.aifreeapi.com/en/posts/nano-banana-pro-reference-images), [Finegrain Product Placement LoRA](https://huggingface.co/spaces/finegrain/finegrain-product-placement-lora/blob/main/src/app.py), [Leonardo — Nano Banana prompt guide](https://leonardo.ai/news/nano-banana-prompt-guide).
Wnioski:
- Nikt nie rozwiązuje skali samym tekstem. Techniki branżowe: **wskazanie miejsca i rozmiaru obrazem** — czerwone pudełko/maska na scenie („place the X from the first image at the red box location in the second image, and generate the image without the red box markings”), a w Finegrain Product Placement użytkownik rysuje pudełko ustalające miejsce i rozmiar, a prompt to tylko „Add this in the box”.
- Obrazy: jedno zdanie na obraz mówiące, co kontroluje (zgodne z poz. 7 PDF); najważniejsze obrazy na pierwszych miejscach; „must keep / can adapt / should avoid”.
- Prompt: pełne zdania, konkretne światło i materiały, relacje przestrzenne słowami — ale rozmiar nie jest egzekwowany słowami.
Eksperyment `TRANSFER_Z_RAMKA` (CanvasSection.tsx): przy wstawianiu/przenoszeniu z drugiego zdjęcia (Studio) na Image 1 rysowana jest CIENKA magentowa ramka (sam obrys, bez wypełnienia — wypełnienie dawało „efekt wklejki”) o położeniu i rozmiarze z pomiaru reżysera; prompt: obiekt z Image 2 ma wypełnić ramkę, wynik bez ramki; linie rozmiaru/ułożenia są pominięte (rozmiar niesie ramka). Wyłączenie: `TRANSFER_Z_RAMKA = false`. Gdy brak pomiaru — zachowanie jak dotąd.
