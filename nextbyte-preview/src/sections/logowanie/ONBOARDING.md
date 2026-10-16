# Onboarding NextByte — specyfikacja (wzór: Higgsfield, 12 zrzutów, 16.10.2026)

Cel: rejestracja → seria krótkich pytań → wejście na platformę z sekwencją
promocyjną. Wzorujemy się 1:1 na **przepływie i układzie** Higgsfield, ale
**bez wideo** i w stylu NextByte (Liquid Glass, tokeny HSL, `dark-theme` /
`future-theme`, zasady z `CLAUDE.md`).

Stan: **faza B gotowa** — `OnboardingFlow.tsx` (7 kroków) + `OnboardingSceny.tsx`
(sceny lewego panelu). Podgląd: Preview → Logowanie → zakładka „Onboarding”.
**Faza C gotowa** — `WejscieNaPlatforme.tsx` (C1–C4, treść oferty w
`KONFIG_OFERTY`), spięta z pytaniami w `Onboarding.tsx`. Podgląd: zakładka
„Wejście na platformę”. Plany biorą dane z `CennikSection.tsx` (Premium stała
pula, Ultimate suwak); rabat roczny 40% / 45%, w nagłówku „do 55%”.
Faza A (ekran rejestracji w stylu wzoru) — do zrobienia.

---

## Faza A — Wejście (rejestracja / logowanie)

**Ekran 1. Rejestracja** — celowo zwyczajny, nic dziwnego:
- znak NEXTBYTE u góry, tytuł „Witaj w NextByte”, podtytuł „Załóż konto i twórz za darmo”.
- wyróżniony pasek bonusu (akcent, ikona prezentu): „Zarejestruj się firmowym e-mailem i odbierz X Byte”.
- przyciski w pionie, pełna szerokość, równe: Google, Apple, Microsoft.
- separator „LUB”, potem „Kontynuuj z e-mailem”.
- checkbox zgody (Regulamin, Polityka prywatności, 18+); bez zaznaczenia — komunikat w kolorze akcentu „Zaakceptuj regulamin, aby kontynuować”.
- na dole cichy dopisek (np. „SSO dostępne w planach dla zespołów”).

Logowanie — ten sam układ, prostszy (bez bonusu / zgody).

## Faza B — Pytania onboardingu (kluczowa część)

**Układ każdego kroku (wspólny szablon):**
- Lewa kolumna (~1/3 szerokości): wysoki, zaokrąglony panel wizualny, który
  **zmienia się co krok** i „ciągle coś się dzieje”. U Higgsfielda to wideo —
  u nas zamiast wideo: animowana kompozycja w stylu NextByte (np. podgląd
  modułu powiązanego z pytaniem, żywe tło/gradienty, przewijające się
  przykładowe generacje). Na mobile panel znika lub zmienia się w pasek.
- Prawa kolumna: na górze **pasek postępu z kresek** (aktywna kreska dłuższa,
  w kolorze akcentu; ukończone też akcent), od kroku 2 strzałka „wstecz”
  w lewym górnym rogu.
- Tytuł dwuwierszowy, wyśrodkowany: 1. linia `foreground`, 2. linia `muted-foreground`
  (np. „Jak planujesz / korzystać z NextByte?”).
- Siatka opcji wyśrodkowana pod tytułem.
- Na dole strony cichy podpis wyjaśniający po co pytamy.

**Dwa typy opcji:**
1. **Kafelki** (siatka 2 kolumny): mała ikona liniowa w lewym górnym rogu,
   kółko/kwadrat zaznaczenia w prawym górnym, pogrubiony tytuł, opcjonalny
   opis drugoplanowy pod spodem. Kółko = jednokrotny wybór (klik od razu
   przechodzi dalej), kwadrat = wielokrotny (przycisk „Wybierz opcję” →
   „Dalej”, nieaktywny dopóki nic nie wybrano).
2. **Pigułki** (zawijany wiersz, wyśrodkowany): ikona + etykieta, wielokrotny
   wybór, przycisk dalej pod spodem.

**Kolejność kroków (Higgsfield → odpowiednik NextByte):**
| # | Pytanie | Typ | Opcje Higgsfield (do przełożenia na NextByte) |
|---|---|---|---|
| 1 | Jak planujesz korzystać? | kafelki 1×, z opisem | Prywatnie / Dla zespołu lub firmy |
| 2 | Co chcesz osiągnąć? | kafelki 1×, 6 opcji | automatyzacje, filmy/wizualizacje, marketing, „tylko się rozglądam”, awatary i produkty, viral/UGC |
| 3 | Jakie masz doświadczenie z AI? | kafelki 1×, 4, ikona z kropek rosnąca (1→4) | Początkujący / Średniozaawansowany / Zaawansowany / Ekspert (z opisem, co zmienia się w interfejsie) |
| 4 | Które studia chcesz wypróbować? | kafelki wielokrotne (kwadraty), 6 | u nas: moduły NextByte — Chat AI, Studio Zdjęć, Studio Wideo, Canvas, Notebook, Akademia/Asystent… |
| 5 | Które funkcje chcesz wypróbować? | pigułki wielokrotne | generowanie wideo/obrazów, upscale, lektor/muzyka, presety, edycja i inpaint, awatary… |
| 6 | Skąd o nas wiesz? | pigułki wielokrotne | TikTok, X, Google, artykuły, asystenci AI, YouTube, Discord, polecenie, Reddit, Instagram, LinkedIn, Facebook, Inne |
| 7 | Jaki problem z AI mamy rozwiązać? | kafelki, 6 | trudne promptowanie, limity generacji, trudne workflow, niespójne wyniki, „jestem nowy”, drogie topowe modele |

Pasek postępu: Higgsfield liczy kreski w obrębie grupy (5–6 kresek), nie 1:1
z krokami — u nas po prostu 7 kresek.

## Faza C — Wejście na platformę (sekwencja promocyjna)

Po ostatnim pytaniu przechodzimy na platformę (panel rozmyty w tle), na nim
kolejno modale:

**C1. „Twórz więcej z Unlimited”** — modal szklany: okrągła ikona ∞ u góry,
tytuł, podtytuł, biały przycisk „Kontynuuj”, pod spodem rozsypany kolaż
przechylonych kart (okładki modułów/modeli z napisami „UNLIMITED …”). U nas:
**pokazać wszystkie moduły NextByte** w takim kolażu.

**C2. „Gratulacje! Otrzymujesz osobistą zniżkę 55%”** — modal: ikona prezentu,
druga linia tytułu w akcencie, kupon ze stanem „✓ kod … zastosowany”, pod nim
bilet z perforacją (ząbki po bokach, przerywana linia) dzielony na „55% OFF”
(kolor promocyjny) i **licznik HH : MM : SS odliczający w czasie rzeczywistym**,
duży przycisk akcentowy „Odbierz zniżkę”, konfetti. Treść oferty będzie się
zmieniać w przyszłości — ekran ma być ładnym, konfigurowalnym szablonem
(procent, kod, czas).

**C3. „Przejdź na Premium z osobistą zniżką do 55%”** — pełny ekran planów:
plakietka „OFERTA SPECJALNA”, ten sam kupon + licznik, przełącznik
Miesięcznie / Rocznie (z plakietką rabatu), **plany z naszego cennika**
(`CennikSection.tsx`: Premium i Ultimate, suwak puli Byte w wyższym planie),
skreślona cena + nowa, „rozliczane rocznie”, „oszczędzasz X vs miesięcznie”,
przycisk „Wybierz ofertę”, pod spodem lista „bez limitu i za darmo”. Każdy
plan ma własny kolor karty (u Higgsfielda Plus = limonka, Ultra = róż) z
plakietką rabatu („40% OFF”, „45% OFF”, „NAJLEPSZA WARTOŚĆ”). Ważne: rabat
różni się per plan i dotyczy rozliczenia rocznego.

**C4. „Nowa funkcja: …”** — po zamknięciu oferty od razu modal zapowiedzi
funkcji: duży obraz u góry przechodzący gradientem w tło karty, plakietka
„Darmowa generacja”, tytuł dwuliniowy (2. linia w akcencie), opis, przycisk
„Odbierz darmową generację”.

---

## Zasady stylu (przekład na NextByte)
- Zero wideo; ruch zastępujemy animacją kompozycji / przejściami kroków.
- Kafelki = `p2-karta`/`p2-kontrolka`, rogi współśrodkowe, tokeny HSL; akcent
  Higgsfielda (limonka) → nasz `--primary`. Kolor promocji (róż) jako osobny
  token oferty.
- Musi działać w `dark-theme` i `future-theme`.
- Przejścia kroków: reuse animacji z `OnboardingFlow.tsx` (`nb-krok-wchodzi`/`znika`).
