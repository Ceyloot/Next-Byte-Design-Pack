# NextByte — Onboarding 1 & Wejście na stronę (Gotowy pakiet)

Kompletny, w pełni działający moduł Onboardingu 1 (Faza B: 7 animowanych kroków wg Higgsfield w estetyce NextByte) oraz sekwencji Wejścia na platformę (Faza C: moduły płytki PCB, osobista zniżka z licznikiem live, plany cennika z rabatem, nowa funkcja).

---

## 🚀 Jak uruchomić natychmiast (od A do Z)

W folderze znajduje się już zainstalowany folder `node_modules`, więc **nie musisz nawet pobierać bibliotek przez internet!**

### Szybki start:
1. Otwórz terminal w tym folderze.
2. Uruchom serwer developerski:
   ```bash
   npm run dev
   ```
   *(lub `pnpm run dev` / `yarn dev`)*
3. Otwórz podany w terminalu adres lokalny (np. `http://localhost:5173`).

---

## 🛠️ Jak przenieść i zaimplementować w innym projekcie

### 1. Niezbędne zależności npm (`package.json`)
Jeżeli przenosisz komponenty do swojego istniejącego projektu Next.js / Vite / React, upewnij się, że masz zainstalowane:
```bash
npm install lucide-react clsx tailwind-merge
```
*(Większość komponentów opiera się o czysty React + Tailwind CSS + Lucide Icons)*.

### 2. Główne pliki komponentów:
- `src/sections/logowanie/Onboarding.tsx` — główny wrapper spajający pytania i wejście.
- `src/sections/logowanie/OnboardingFlow.tsx` — 7 pytań onboardingu (kafelki, pigułki, pasek postępu).
- `src/sections/logowanie/OnboardingSceny.tsx` — interaktywne animacje cząsteczkowe SVG / Canvas po lewej stronie.
- `src/sections/logowanie/WejscieNaPlatforme.tsx` — sekwencja C1-C4 (moduły, rabat 55%, licznik, oferta planów).
- `src/assets/onboarding/` oraz `src/assets/studio/` — grafiki i zdjęcia wykorzystywane w podglądach modułów.

### 3. Konfiguracja Tailwind CSS & motywu:
Komponenty używają zmiennych CSS opartych o `hsl(var(--primary))`, `hsl(var(--background))`, `hsl(var(--foreground))`. 
Wszystkie klasy pomocnicze oraz definicje stylów tafli szklanych i tokenów znajdują się w:
- `src/index.css`
- `tailwind.config.ts`

Gotowe do natychmiastowej integracji!
