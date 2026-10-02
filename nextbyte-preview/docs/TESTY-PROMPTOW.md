# Lista testów promptów Canvas (numerowana)

Pętla dla każdego numeru: **działa → test → lekki błąd → minimalna poprawka → działa → następny.**
Maks. 2 poprawki na numer, potem zamrażamy najlepszą wersję z oznaczeniem „do poprawek”.
Wynik wpisujemy w kolumnie: OK / LEKKI / BŁĄD. Oceniamy 4 rzeczy: **miejsce, skala, światło/ziarno, tożsamość**.

Skrót konfiguracji: `1z/1p` = 1 zdjęcie, 1 pinezka · `1z/2p` = 1 zdjęcie, 2 pinezki · `2z/2p` = 2 zdjęcia, 2 pinezki · `2z/1p` = 2 zdjęcia, pinezka tylko na celu.

## A. Do zrobienia (niezamrożone)

| Nr | Tryb | Konfig. | Polecenie do wpisania | Co ma wyjść | Wynik |
|---|---|---|---|---|---|
| T01 | Usuń | 1z/1p | `usuń to` | Obiekt znika, tło za nim dokończone, reszta bez zmian | |
| T02 | Usuń | 1z/1p (pin na osobie) | `usuń tę osobę` | Czyste tło, brak cienia i śladów | |
| T03 | Dodaj | 1z/1p | `dodaj tutaj drzewo` | Obiekt w punkcie pinezki, właściwa skala i cień | |
| T04 | Dodaj z referencji | 2z/2p | `dodaj tutaj ten obiekt` | Obiekt z Image 2 w punkcie na Image 1 | |
| T05 | Wstaw w miejsce X (W1) | 1z/2p | `wstaw ten obiekt w miejsce 2` | Wstawiony na 2, stare miejsce nietknięte | |
| T06 | Face swap | 2z/2p | `zamień twarz na twarz ze zdjęcia 2` | Tożsamość z Image 2, światło z Image 1, bez retuszu | |
| T07 | Character swap z 1 zdjęcia (K4) | 1z/2p | `zamień osobę 1 na osobę 2` | Dwie osoby zamienione, bez klonowania | |
| T08 | Ubranie | 1z/1p | `zmień na czarną marynarkę` | Zmienione tylko ubranie, poza i twarz bez zmian | |
| T09 | Ubranie z referencji | 2z/2p | `ubierz w ten strój` | Strój z Image 2 dopasowany do pozy | |
| T10 | Atrybut | 1z/1p | `zmień kolor na czerwony` | Zmieniona tylko cecha, reszta identyczna | |
| T11 | Tekstura | 1z/1p | `zmień na drewno` | Nowa tekstura z zachowaniem kształtu i światła | |
| T12 | Pora dnia | 1z/1p | `zmień na zachód słońca` | Spójne światło i cienie w całym kadrze (K1/K2) | |
| T13 | Pora roku | 1z/1p | `zmień na zimę` | Śnieg, spójne światło i kolory | |
| T14 | Styl | 1z/1p | `zrób w stylu akwareli` | Cały kadr w stylu, kompozycja bez zmian | |
| T15 | Efekt | 1z/1p | `dodaj mgłę` | Efekt wtopiony w scenę, nic nie zmienione poza nim | |
| T16 | Popraw | 1z/1p | `popraw to zdjęcie` | Lepsza jakość, ta sama kompozycja | |
| T17 | Przesuwanie osoby (K3) | 1z/2p | `przenieś osobę w miejsce 2` | Wymaga zgody (plik zamrożony) | |
| T18 | Skala transferu z 2. zdjęcia | 2z/2p | `wstaw tutaj ten obiekt` | Obiekt w skali punktu docelowego (do poprawek) | |

## B. Zamrożone — testy regresji (tylko sprawdzamy, nie zmieniamy)

| Nr | Tryb | Konfig. | Polecenie | Wynik |
|---|---|---|---|---|
| R01 | Ruch obiektu w kadrze | 1z/2p | `przesuń ten obiekt w miejsce 2` | |
| R02 | Character swap z 2 zdjęć | 2z/2p | `zamień osobę na tę ze zdjęcia 2` | |
| R03 | Object swap z 2 zdjęć | 2z/2p | `zamień ten obiekt na obiekt ze zdjęcia 2` | |
| R04 | Zmiana części obiektu | 1z/1p | `zmień tę część na ...` | |
| R05 | Zmiana scenerii | 1z/1p | `zmień tło na ...` | |
| R06 | Transfer z 2. zdjęcia (pozycja) | 2z/2p | `przenieś obiekt ze zdjęcia 2 tutaj` | |

## Dla każdego numeru zapisujemy

1. Numer testu i wersję aplikacji (`vXXXXXXX` z nagłówka czatu).
2. Przycisk „Prompt” w czacie: pełny prompt wysłany do modelu.
3. Ocenę 4 kryteriów i jedno zdanie o błędzie, jeśli jest.

## Wyniki (aplikacja na żywo, Runware + Gemini; po poprawkach)

OK: T01–T02 usuń · T03 dodaj (skala; położenie ±) · T04 · T06 zamiana twarzy · T08 ubranie · T09 ubranie z referencji · T10 atrybut · T11 tekstura · T12 pora dnia · T13 pora roku · T14 styl (Gemini 3.1) · T15 efekt · T18 · R01 · R04 · R05.
Bez widocznej zmiany: T16 (popraw).
Zablokowane przez aplikację: T07 (zamiana postaci z 1 zdjęcia, K4).
Do decyzji (tryby zamrożone — nie ruszane): R03 (object swap: obiekt w złym miejscu), R02 (character swap zostawia ubiór sceny), T05 (zniknął drugi obiekt w kadrze).
Nie testowane: T17 (K3, przesuwanie osoby — wymaga zgody).

Wnioski: krótkie prompty (zadanie + role zdjęć + rozmiar z porównaniem do rzeczy na zdjęciu) dają lepsze wyniki niż prompty ~4–6 tys. znaków; zbliżenia obiektu „do usunięcia” szkodzą; sama liczba % rozmiaru bywa ignorowana, porównanie do znanego obiektu działa.

## Tryby zamrożone — tylko test (bez zmian w kodzie) i tymczasowo zamrożone

| Tryb | Wynik |
|---|---|
| Ruch w kadrze (F1, R01) | OK 2/2 (łódź przeniesiona, stara usunięta) |
| Character swap 2 zdjęcia (F2, R02) | OK z zastrzeżeniem: tożsamość z referencji, ubiór bywa ze sceny |
| Object swap 2 zdjęcia (F3 ×3, R03) | BŁĄD 4/4: obiekt ok. 25–30% szerokości zamiast ok. 7% i przesunięty w prawo od pinezki |
| Object swap w pokoju (F4) | pozycja OK, skala duża |
| Transfer z 2. zdjęcia (T04, T18) | OK 2/2 |
| Zmiana części (R04, P1–P3) | OK 4/4 |
| Zmiana scenerii (R05, S1–S3) | OK 4/4 |

## Po naprawach (transfer/zamiana z 2. zdjęcia, zadania bez pinezek)

- Zadania globalne bez pinezek (G12: pora dnia): OK (plan reżysera przyjmuje samą intencję).
- Transfer z 2. zdjęcia (G4, G18): pozycja OK; lampart w dobrej skali, auto nadal duże (ok. 2× za duże).
- Object swap z 2 zdjęć (G3 → G3b): położenie poprawione z x≈0,54 do ≈0,32 (pinezka 0,22), skala nadal ok. 2× za duża (ok. 30% szerokości zamiast ok. 13%). Dalszy krok do sprawdzenia: wycięcie referencji wokół obiektu (żeby model nie widział auta „na pełnym kadrze”).

## Ostatnia tura (referencja wycinana wokół obiektu, T07, Gemini 3.1 dla osób)

- Object swap łódź → auto (H3 ×2): 1/2 dobre (auto ok. 8,5% szerokości, x≈0,26 przy pinezce 0,22), 1/2 za duże (33%) — rozmiar zmierzony przez reżysera waha się 13–19% między przebiegami, model skaluje w przybliżeniu proporcjonalnie.
- T07 zamiana dwóch osób na jednym zdjęciu: OK 2/2 (twarze i włosy zamienione, ciała na miejscu).
- Ubranie na Gemini 3.1 (V8): OK. Transfer osoby z drugiego zdjęcia (V9): OK.
- Regresja zamrożonych: ruch w kadrze, character swap, zmiana części, scenerie — prompt bez zmian względem 731b258.
