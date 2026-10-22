# Panel 2.0 — jak budować kafelki reagujące na motyw

Ten dokument jest instrukcją dla każdego (człowieka lub AI), kto dokłada
kafelek do Panelu 2.0. Przeczytaj go w całości przed pierwszą linijką kodu.

---

## 1. Zasada, z której wynika reszta

**Poziom powierzchni = odsunięcie od tła strony w stronę `--foreground`.**

```
--p2-powierzchnia-1: color-mix(in srgb, hsl(var(--background)) 96%, hsl(var(--foreground)));
--p2-powierzchnia-2: color-mix(in srgb, hsl(var(--background)) 92%, hsl(var(--foreground)));
--p2-powierzchnia-3: color-mix(in srgb, hsl(var(--background)) 88%, hsl(var(--foreground)));
```

Jedna formuła obsługuje wszystkie motywy, bo `--foreground` jest z definicji
kolorem kontrastowym do tła:

| motyw   | tło        | foreground | poziomy        |
|---------|------------|------------|----------------|
| ciemny  | czarne     | białe      | **jaśnieją**   |
| jasny   | białe      | czarne     | **ciemnieją**  |

Nie ma tu wykrywania motywu — żadnego `[data-theme=...]`, żadnego
`prefers-color-scheme` (ten mówi o ustawieniu SYSTEMU, nie o motywie wybranym
w aplikacji), żadnego sprawdzania jasności w JavaScripcie.

**Sprawdzone wobec wartości wzorcowych, zanim formuła tu trafiła:**

| motyw  | formuła daje     | wzorzec           |
|--------|------------------|-------------------|
| ciemny | `rgb(15,15,15)`  | `rgb(18,20,23)`   |
| jasny  | `rgb(236,237,242)` | `rgb(239,240,245)` |

Zweryfikowane na żywo na czterech motywach: `dark-theme`, `nextbyte-light`,
`scandinavian` (ciepły jasny, akcent zielony) i `luxury` (ciemny, akcent
złoty). Żaden nie wymagał ani jednej reguły pod siebie.

---

## 2. Cztery poziomy — więcej nie będzie

| poziom | co to | komponent |
|---|---|---|
| 0 | strona | `<div className="p2">` |
| 1 | kafelek na stronie | `<Karta>` |
| 2 | sekcja w kafelku | `<Sekcja>` |
| 3 | wiersz, przycisk, pole | `<Kontrolka>` |

Jeśli potrzebujesz czwartego poziomu — **układ jest za głęboki, a nie paleta
za płytka**. Spłaszcz zagnieżdżenie.

---

## 3. Umowa — trzy zasady, których nie wolno złamać

### ① Nie wpisuj koloru powierzchni

```tsx
// ŹLE — wypadnie z motywów
<div className="bg-white border-gray-200 shadow-md">
<div className="bg-[#1a1a1a]">
<div className="bg-card/70 backdrop-blur">

// DOBRZE — poziom, kolor wynika z motywu
<Karta>
<Sekcja>
<Kontrolka>
```

### ② Kolor znaczący bierz z `--primary`

```tsx
// ŹLE
<span className="text-blue-500">
<span style={{ color: '#3b82f6' }}>

// DOBRZE
<span className="p2-akcent">
<span className="p2-akcent-tlo">
<div style={{ background: 'hsl(var(--primary) / 0.12)' }}>
```

W panelu 1.0 jeden firmowy fiolet był wpisany w **ponad 400 miejscach
w 24 plikach, w sześciu różnych składniach**. Zmiana koloru oznaczała
400 poprawek.

### ③ Tekst drugoplanowy to klasa, nie `opacity`

```tsx
// ŹLE — przygasza też ikony, obrazki i obramowania
<div className="opacity-60">

// DOBRZE
<p className="p2-cichy">
<p className="p2-etykieta">
```

---

## 4. Gotowe wzorce

| potrzeba | wzorzec | plik |
|---|---|---|
| kafelek z nagłówkiem | `<Karta>` + `<NaglowekKarty>` | `Prawa.tsx` |
| lista pozycji | `<Kontrolka as="li">`, grupy przez `p2-etykieta` | `Skrzynka.tsx` |
| zakładki | aktywna `p2-akcent-tlo`, reszta przezroczysta | `Kreator.tsx` |
| stan pusty | znak w kółku z poziomu 3 + dwie akcje | `Prawa.tsx` |
| siatka dni | dzień NIE jest powierzchnią, bieżący `p2-akcent-tlo` | `Prawa.tsx` |
| dane liczbowe | krycie `--primary`, poziom 0 z drabiny | `Aktywnosc.tsx` |
| pusty slot | ten sam kształt, rant `dashed` | `Dol.tsx` |
| pozycja menu | spoczynek przezroczysty, aktywna = poziom 2 + kreska | `PasekBoczny.tsx` |

---

## 4b. Wymiary — brane z oryginalu, nie z oka

Uklad jest 1:1 z `nextbyte-panel-glowny/src/pages/Dashboard.tsx`. Wartosci
NIE sa szacowane ze zrzutow ekranu, tylko przepisane z kodu zrodlowego:

| co | wartosc | zrodlo |
|---|---|---|
| kontener tresci | `max-w-[1600px]`, `gap-4`, `px-4 py-4 md:px-6 md:py-5` | `Dashboard.tsx:250` |
| siatka glowna | `grid-cols-1 gap-4 lg:grid-cols-3`, lewa `lg:col-span-2` | `Dashboard.tsx:337` |
| siatka dolna | to samo | `Dashboard.tsx:457` |
| lista spraw | `min-h-[15rem]` | `Dashboard.tsx` |
| pasek boczny | tafla `15rem` (240px) w szynie `264px` z `p-3` | `ui/sidebar.tsx:31` |
| mapa aktywnosci | `flex-1 md:max-w-[440px]` | `ByteStatusBar.tsx:107` |
| przyciski paska | `sm:w-[128px]`, `h-9`, na telefonie `grid-cols-2` | `ByteStatusBar.tsx:273` |

**`lg:grid-cols-3` + `col-span-2`, a NIE `grid-cols-[2fr_1fr]`.** To nie to samo:
przy trzech rownych kolumnach z przerwa lewa czesc to dwie kolumny PLUS jedna
przerwa, czyli zmierzone 2.038:1. Zapis `[2fr_1fr]` daje 2.000:1 i kolumny
rozjezdzaja sie z oryginalem o kilkanascie pikseli.

**Mapa aktywnosci ma limit w pikselach, nie w procentach.** Przy procencie
szerokie okno rozciaga kwadraty mapy i widget przestaje byc soba.

Zmierzone po poprawce przy oknie 1528px: szyna 264, tafla 240 (x=12),
kolumny 795 / 390 (stosunek 2.038), mapa 440, srodek 550, przyciski 128.

---

## 5. Czego ten system celowo NIE robi

**Nie używa `--tafla-1/2/3`.** Te tokeny istnieją w `index.css`, ale definiują
je **tylko 4 z 16 motywów**. Komponent na nich oparty rozpada się na pozostałych
dwunastu. Drabina używa wyłącznie `--background`, `--foreground`, `--primary`,
`--muted-foreground` i `--destructive` — tokenów, które ma **każdy** motyw.

**Nie ma neumorfizmu.** Panel 1.0 dokładał pozycjom paska bocznego
`box-shadow: 3px 3px 6px …, -3px -3px 6px …`, czyli wytłoczenie z dwoma
źródłami światła naraz. Tutaj nie ma tego czym włączyć.

**Cień jest czarny, światło białe — w każdym motywie.** Cień to brak światła,
nie kolor interfejsu. Czarny cień na czarnym tle jest niewidoczny (nieszkodliwy
na ciemnych motywach), a na jasnym daje pełne uniesienie. Odwracanie ich razem
z motywem odwracałoby kierunek padania światła.

---

## 6. Sprawdzian przed oddaniem kafelka

1. Przełącz na `dark-theme`, `nextbyte-light`, `scandinavian` i `luxury`.
2. Czy wszystkie cztery wyglądają poprawnie **bez ani jednej reguły pod motyw**?
3. Czy w kodzie kafelka nie ma `bg-*`, `border-*`, `shadow-*` na powierzchni,
   żadnej wartości `#hex`/`rgb()` i żadnego `opacity` na tekście?

Jeśli którykolwiek punkt nie przechodzi — kafelek jest zbudowany źle.
Nie poprawiaj go regułą pod motyw; popraw poziom.

```js
// szybkie przełączanie w konsoli przeglądarki
document.documentElement.setAttribute('data-theme','scandinavian')
```
