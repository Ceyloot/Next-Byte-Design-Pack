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
