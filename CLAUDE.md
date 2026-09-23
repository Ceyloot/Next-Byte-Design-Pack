# MANIFEST ARCHITEKTURY LIQUID GLASS & RESPONSYWNEGO HSL — NEXTBYTE

Ten dokument stanowi **główną instrukcję techniczną i wzorzec architektoniczny** dla każdego agenta AI (w tym Claude) oraz programisty przebudowującego komponenty platformy NextByte (zarówno w paczce `nextbyte-panel-glowny` pobranej z Telegrama, jak i w nowych modułach).

---

## 1. Dlaczego poprzednie podejścia zawodziły?

1. **Błąd Panelu 1.0 (Plastikowy Neumorfizm i ~400 Łatek `!important`)**:
   - W kodzie panelu zaszyto na sztywno klasy Tailwinda: `bg-black`, `text-white`, `border-white/10`.
   - Żeby jasny motyw w ogóle cokolwiek wyświetlał, dopisano ponad 400 agresywnych reguł `!important` w CSS, a brak głębi łatano podwójnymi cieniami neumorficznymi (`3px 3px 6px ... -3px -3px 6px ...`). Rezultat wyglądał jak plastik z lat 2000. i rozjeżdżał się przy każdej nowej podstronie.
2. **Błąd naiwnej „Drabiny Powierzchni” (Płaski kloc, „mocno mid”)**:
   - Próba naprawy polegająca na zastąpieniu szkła w 100% nieprzezroczystymi kolorami `color-mix` zabiła glassmorphism.
   - W jasnym motywie kafelki stały się szarymi płytami gipsowo-kartonowymi, a wewnętrzne pola tekstowe — kredowo-białymi, płaskimi deskami.
3. **Błąd „Niebieskawej Mgły” w Tle**:
   - Warstwa tła (`TloAplikacji`) mieszała 19% nasyconego błękitu akcentu (`--primary`) w tło. Na ciemnym tle dawało to przyjemną poświatę, ale na jasnym tle (prawie biel) nasycony błękit tworzył brudną, siną plamę o wysokiej chromatyczności rozmywaną przez szkło.
4. **Błąd „Chamskich Odcięć” na Rogach**:
   - Zderzenie sztywnych promieni bez zachowania geometrii współśrodkowej ($R_{wewn} \neq R_{zewn} - padding$) oraz zbyt ciemne, twarde ramki wycinały ząbkowane kanty wokół kart.

---

## 2. Złote Zasady Architektury Liquid Glass

### ① Reguła Współśrodkowości Zaokrągleń (Concentric Radii)
Gdy element leży wewnątrz innego elementu, ich zaokrąglenia **muszą dzielić ten sam środek łuku**:
$$R_{wewn} = R_{zewn} - padding$$

- **Karta zewnętrzna**: promień `20px` (`var(--r-lg)`), padding `14px` (`p-3.5`).
- **Niecka wewnętrzna (np. pole textarea)**: promień `14px` (`calc(var(--p2-promien) - 6px)`).
- **Kontrolki / Przyciski wewnętrzne**: promień `10px` (`var(--r-md)`).
*Nigdy nie wpisuj losowych `rounded-md` czy `rounded-2xl` bez uwzględnienia paddingu rodzica!*

### ② Prawdziwe Szkło (Liquid Glass) zamiast Płaskiego Plastiku
Każdy kafelek to półprzezroczysta tafla szkła:
- **Poziom 1 (`p2-karta`)**:
  - Tło: `color-mix(in srgb, hsl(var(--card)) 72%, transparent)`
  - Rozmycie: `backdrop-filter: blur(18px) saturate(135%)`
  - Faza szkła: `box-shadow: inset 0 1px 0 0 hsl(0 0% 100% / 0.16)` (subtelne światło na górnej krawędzi)
  - Cień uniesienia: `0 2px 5px -1px hsl(0 0% 0% / 0.04), 0 12px 32px -8px hsl(0 0% 0% / 0.08)`
  - Rant: `1px solid hsl(var(--foreground) / 0.13)`
- **Poziom 2 (`p2-sekcja` — Inset Glass Well)**:
  - Zamiast kredowej bieli: matowa, półprzezroczysta niecka szklana:
    `color-mix(in srgb, hsl(var(--background)) 52%, transparent)`
  - Wewnętrzny mikro-cień: `box-shadow: inset 0 1px 2px 0 hsl(var(--foreground) / 0.03)`
  - Rozmycie: `backdrop-filter: blur(10px) saturate(120%)`
  - Rant: `1px solid hsl(var(--foreground) / 0.06)`
- **Poziom 3 (`p2-kontrolka` — Przyciski, Pigułki, Pola)**:
  - Szklana pigułka: `color-mix(in srgb, hsl(var(--card)) 48%, transparent)`
  - Hover: `color-mix(in srgb, hsl(var(--foreground)) 9%, transparent)`

### ③ Czyste Tokeny Responsywnego HSL (Zero `bg-black`, Zero `text-white`)
Każdy element interfejsu czerpie kolor wyłącznie ze zmiennych motywu:
- Tło strony: `hsl(var(--background))`
- Karta: `hsl(var(--card))`
- Tekst główny: `hsl(var(--foreground))`
- Tekst drugoplanowy / etykiety: `hsl(var(--muted-foreground))`
- Kolor wiodący / interakcja: `hsl(var(--primary))`
- Błędy / brakujące środki: `hsl(var(--destructive))`

---

## 3. Motywy i Przełącznik (Ciemny <-> Przyszły)

Zgodnie z decyzją projektową, aktywny przełącznik operuje na parze docelowych motywów:
1. **`dark-theme` (Ciemny)** — domyślny ciemny, głęboka czerń (`0 0% 2%`), cyjanowy błękit.
2. **`future-theme` (Przyszły)** — domyślny jasny, czysta neutralna biel (`0 0% 98%`), szafirowy akcent, zero przekłamań HSL.

Przełączanie motywu odbywa się funkcją `nastepnyMotyw()` w paczce panelu oraz `przelaczNastepnyMotyw()` w `nextbyte-preview` bezpośrednio między tą parą. Baza motywów zawiera również pozostałe motywy jako alternatywne zestawy kolorystyczne.

---

## 3.1. Standardy Kafelków i Detale Wizualne

1. **Ujednolicony promień kafelków (`rounded-2xl` / 16px)**:
   - Wszystkie główne kafelki (`ByteStatusBar`, `SzybkiKreator`, `WrocDoRoboty`, `SkrzynkaSpraw`, `KalendarzMiesiaca`, `KafelekChmury`) muszą dzielić ten sam promień: `rounded-2xl` (16px).
   - Żaden kafelek nie może mieć arbitralnego `rounded-[1.75rem]` (28px).
2. **Brak brudzących cieni wewnętrznych w motywach jasnych**:
   - W motywach jasnych usuwamy `inset 0 -1px 0 0 hsl(0 0% 0% / 0.22)`. Stosujemy wyłącznie miękkie górne światło `inset 0 1px 0 0 hsl(0 0% 100% / 0.40)` i dyfuzyjny cień zewnętrzny `0 1px 3px ... / 0 8px 24px ...`.
   - Każdy `.nb-kafelek` posiada `isolation: isolate`, co uniemożliwia wyciekanie pseudo-elementu `::before` poza zaokrąglone narożniki.
3. **Automatyczna inwersja logo NEXTBYTE**:
   - W motywie ciemnym logo jest białe/jasne na ciemnym szkle.
   - W motywach jasnych znak logo automatycznie przyjmuje `brightness-0 opacity-85`, stając się kontrastowym, ciemnym znakiem o idealnej czytelności.
4. **Spójność chmur (SystemCloud i PrivateCloud)**:
   - Kafelki chmur używają komponentu `<Tile zwarty>` z paddingiem `p-4`, a ikony `SystemCloudMark` i `PrivateCloudMark` używają `stroke="currentColor"`, dynamicznie adaptując się do akcentu motywu.

---

## 4. Wzorcowy Plik Implementacyjny (Master Reference)

Oto wzorcowy kafelek `Kreator.tsx` reprezentujący poprawną architekturę:

```tsx
import { useState } from 'react'
import { ArrowRight, ChevronDown, FileText, Image, MessageSquare, Video, BarChart3 } from 'lucide-react'
import { Karta, Sekcja } from '../fundament/Powierzchnia'
import { cn } from '@/lib/utils'

const TRYBY = [
  { id: 'czat', nazwa: 'Czat', ikona: MessageSquare },
  { id: 'obraz', nazwa: 'Obraz', ikona: Image },
  { id: 'wideo', nazwa: 'Wideo', ikona: Video },
  { id: 'notatka', nazwa: 'Notatka', ikona: FileText },
] as const

export function Kreator({ koszt = 2, posiadane = 0 }: { koszt?: number; posiadane?: number }) {
  const [tryb, setTryb] = useState<string>('czat')
  const brakuje = Math.max(0, koszt - posiadane)

  return (
    <Karta className="flex flex-col p-3.5">
      {/* Zakładki: akcent na wybranym, płynny hover na nieaktywnym */}
      <div role="tablist" aria-label="Rodzaj treści" className="mb-3 flex flex-wrap gap-1.5">
        {TRYBY.map(({ id, nazwa, ikona: Ikona }) => {
          const aktywny = tryb === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={aktywny}
              onClick={() => setTryb(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
                aktywny
                  ? 'p2-akcent-tlo shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.25)] font-semibold'
                  : 'p2-cichy hover:bg-[hsl(var(--foreground)/0.06)] hover:text-[hsl(var(--foreground))]',
              )}
            >
              <Ikona className="h-3.5 w-3.5" />
              {nazwa}
            </button>
          )
        })}
      </div>

      {/* Zagłębiona niecka szklana (inset glass well) zamiast kredowej bieli */}
      <Sekcja className="flex min-h-[140px] flex-col p-2.5 transition-[border-color,box-shadow] duration-200 focus-within:border-[hsl(var(--primary)/0.4)] focus-within:shadow-[inset_0_1px_3px_0_hsl(var(--foreground)/0.04),0_0_0_1px_hsl(var(--primary)/0.2)]">
        <textarea
          placeholder="Napisz wiadomość..."
          aria-label="Treść do utworzenia"
          className="min-h-[110px] flex-1 resize-none bg-transparent p-1.5 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)]"
        />
      </Sekcja>

      {/* Dolny pasek akcji */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          className="p2-kontrolka flex items-center gap-2 px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow active:scale-[0.98]"
        >
          <BarChart3 className="h-3.5 w-3.5 p2-akcent" />
          <span className="font-semibold text-[hsl(var(--foreground))]">Pro</span>
          <ChevronDown className="h-3.5 w-3.5 p2-cichy" />
        </button>

        <div className="flex items-center gap-3">
          <p className="text-xs p2-cichy font-mono">
            <span className="font-sans font-medium text-[hsl(var(--foreground)/0.8)]">≈{koszt} ⟠</span>
            {brakuje > 0 && (
              <span className="ml-1 text-[hsl(var(--destructive))]">
                · masz {posiadane}, brakuje {brakuje}
              </span>
            )}
          </p>
          <button
            type="button"
            className="p2-kontrolka flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))] active:scale-[0.98]"
          >
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /> Utwórz w Chat AI
          </button>
        </div>
      </div>
    </Karta>
  )
}
```

---

## 5. Przewodnik Masowego Refaktoru Komponentów z Zipa

Gdy przystępujesz do czyszczenia pozostałych plików platformy (np. Chat AI, Ustawienia, Moduły Studio):

### Tabela Bezpiecznych Zamian Klas:

| Stara klasa w kodzie | Nowa klasa tokenowa | Dlaczego |
|---|---|---|
| `text-white` | `text-foreground` | Zapewnia automatyczny ciemny tekst na jasnym i biały na ciemnym |
| `text-white/60`, `text-gray-400` | `text-muted-foreground` | Czytelny tekst pomocniczy z zachowaniem kontrastu WCAG AA |
| `bg-black`, `bg-[#0a0a0c]` | `bg-card` lub `p2-pow-1` | Pozwala karcie przyjąć prawidłową barwę i przezroczystość motywu |
| `bg-black/40`, `bg-zinc-900/60` | `p2-pow-2` (Sekcja) | Tworzy zagłębioną taflę szklaną bez kredowych plam |
| `border-white/10`, `border-white/20` | `border-border` lub `p2-rant` | Subtelna, adaptacyjna ramka bez czarnych obwódek w jasnym trybie |
| `text-green-400`, `text-emerald-400` | `text-success` | Standaryzacja statusu sukcesu we wszystkich 8 motywach |
| `text-red-500`, `bg-red-500` | `text-destructive` / `bg-destructive` | Bezpieczny semantyczny stan błędu |
| `text-amber-400`, `text-orange-400` | `text-warning` | Semantyczny stan ostrzeżenia |

> [!CAUTION]
> **Nie dotykaj kolorów tożsamości!**
> Kolory modułów (firmowy fiolet Studia Zdjęć, szmaragd zadań w wyszukiwarce) są danymi tożsamościowymi, a nie motywem interfejsu. Nie zamieniaj ich na tokeny motywu, chyba że użytkownik wprost o to poprosi.
