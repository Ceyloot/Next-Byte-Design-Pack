# ✅ PEŁNA CHECKLISTA PROMPTÓW CANVAS

Odhaczaj `[x]` w edytorze. Status wdrożenia: 🟢 zrobione · 🟡 częściowo (prompt jest, model bywa oporny / niepełne) · 🔴 do zrobienia.

---

## 0. WSPÓLNE — dotyczy KAŻDEJ operacji

- [ ] 0.1 OUTPUT CONTRACT: Image 1 = zawsze zdjęcie docelowe, Image 2..N = referencje. 🟢
- [ ] 0.2 FORMAT wyniku = dokładnie format Image 1 (twardy post-crop `dopasujFormatDoObrazu`). 🟢
- [ ] 0.3 FIDELITY: ta sama rozdzielczość, perspektywa kamery, światło; reszta kadru wierna. 🟡
- [ ] 0.4 APPEARANCE: medium sceny (B&W→B&W, sepia→sepia), ziarno/ostrość/starość z Image 1. 🟡
- [ ] 0.5 Zero enhancera / upscalera / restauracji. 🟡
- [ ] 0.6 Nie zmienia liczby istniejących obiektów (poza remove/replace). 🟢
- [ ] 0.7 Zero duplikacji obiektu/części (łapki, twarze, logo). 🟢
- [ ] 0.8 Jedno bezszwowe zdjęcie — nie maska, nie kolaż, nie wklejka. 🟢
- [ ] 0.9 Rusztowanie UNIWERSALNE — kod nie nazywa typu obiektu; specyfikę podaje reżyser. 🟡 (zamien+skala zrobione; wstaw/przenies/obszary do dokończenia)
- [ ] 0.10 QC (kontrola) sądzi DOSŁOWNIE wg zadania, z kontekstem intencji+pinesek. 🟢

## 1. BRAMKA SEMANTYCZNA — słowa + liczba zdjęć + pineski → operacja

- [ ] 1.1 „zamień/podmień/zamiast/zastąp X na Y" → REPLACE (`zamien`). 🟢
- [ ] 1.2 „wstaw/dodaj/umieść/postaw … tutaj" + pineska-miejsce → INSERT (`wstaw`). 🟢
- [ ] 1.3 „przenieś/przesuń", 1 zdjęcie, obiekt→miejsce → MOVE/TRANSFER (`przenies`) + Clean Plate. 🟢
- [ ] 1.4 obiekt z innego zdjęcia → miejsce na płótnie → BRING-IN (`przenies`/`wstaw`). 🟢
- [ ] 1.5 twarz/tożsamość → FACE SWAP (`postac`). 🟢
- [ ] 1.6 nazewnictwo object swap / object transfer potwierdzone z użytkownikiem. 🔴

---

## 2. OBJECT SWAP — zamień obiekt (`zamien`)
- [ ] 2.1 Cel = pineska na płótnie (znika); dawca = pineska ref / słowo (wchodzi). 🟢
- [ ] 2.2 Stary usunięty z cieniem/odbiciem + Clean Plate. 🟢
- [ ] 2.3 Osoba w kontakcie zostaje 100%; nowy dostaje własną część (nie graftujemy starej). 🟢
- [ ] 2.4 Nowy w swoich realnych wymiarach, nie w obrysie starego. 🟢
- [ ] 2.5 Nowy w medium/świetle sceny; reszta bez zmian. 🟡

## 3. OBJECT TRANSFER — przenieś obiekt (`przenies`)
- [ ] 3.1 Ten sam obiekt, dokładnie 1 instancja w wyniku. 🟢
- [ ] 3.2 1 zdjęcie → Clean Plate na starym miejscu. 🟢
- [ ] 3.3 Z innego zdjęcia → przynosi tylko obiekt. 🟢
- [ ] 3.4 Adaptacja skali/ostrości do nowego planu głębi. 🟡
- [ ] 3.5 Reguły uniwersalne (usunąć treści o pojazdach). 🔴

## 4. INSERT — wstaw obiekt (`wstaw`)
- [ ] 4.1 Dodaje obiekt, NIC nie usuwa (ta sama liczba istniejących). 🟢
- [ ] 4.2 „obok" = tuż przy grupie, wspólna linia gruntu. 🟢
- [ ] 4.3 Trafia w pineskę-miejsce (styk z gruntem). 🟢
- [ ] 4.4 Skala realna, nie wypełnia kadru. 🟢
- [ ] 4.5 Reguły uniwersalne (usunąć treści o pojazdach). 🔴

## 5. CHARACTER SWAP — zamień postać, pełna (nowy tryb)
- [ ] 5.1 Cała postać dawcy (tożsamość+ciało+ubiór) w pozę/skalę/światło sceny. 🔴
- [ ] 5.2 Inne osoby nietknięte. 🔴
- [ ] 5.3 Osobny `Intencja` (np. `postac_pelna`) + wykrywanie z promptu. 🔴

## 6. CHARACTER TRANSFER — przenieś postać (`przenies` osoby)
- [ ] 6.1 Ta sama osoba, tożsamość+ubiór zachowane. 🟡
- [ ] 6.2 Poza dostosowana do podłoża; 1 instancja; Clean Plate. 🟡

## 7. FACE SWAP — zamień twarz (`postac`)
- [ ] 7.1 Tylko twarz/włosy/tożsamość z referencji. 🟢
- [ ] 7.2 Poza, ciało, ubiór, kadr z płótna zostają. 🟢
- [ ] 7.3 Twarz pod kątem i światłem głowy z płótna; ciągłość szyi/karnacji. 🟢
- [ ] 7.4 Inne osoby ze swoimi twarzami. 🟢

## 8. CLOTHING SWAP — zmień ubranie (`ubranie`)
- [ ] 8.1 Wymiana stroju; twarz/poza/sylwetka/dłonie/tło nietknięte. 🟢
- [ ] 8.2 Ubranie dopasowane do anatomii, organiczne fałdy, w świetle sceny. 🟢

## 9. REMOVE — usuń obiekt (`usun`)
- [ ] 9.1 Usuwa obiekt + cień/odbicie/ślady. 🟢
- [ ] 9.2 Odbudowa tła (kontynuacja wzorów, perspektywy). 🟢
- [ ] 9.3 Sąsiedzi nietknięci. 🟢

## 10. BACKGROUND SWAP — zmień tło (`tlo`)
- [ ] 10.1 Pierwszy plan zamrożony (pozycja, skala, kadr). 🟢
- [ ] 10.2 Doświetlenie pod nowe tło; horyzont na tej samej wysokości. 🟢

## 11. TEXTURE — zmień fakturę (`tekstura`)
- [ ] 11.1 Nowy materiał na tej samej geometrii 3D. 🟢
- [ ] 11.2 Skala wzoru realistyczna; okucia/detale nietknięte. 🟢

## 12. GLOBALNE: PORA DNIA / PORA ROKU / EFEKT / STYL
- [ ] 12.1 Geometria i układ obiektów bez zmian. 🟢
- [ ] 12.2 Zmienia się tylko światło/paleta/roślinność/technika. 🟢
- [ ] 12.3 APPEARANCE nie narzuca medium płótna (bo medium się zmienia). 🟡

## 13. FIX — popraw (`popraw`)
- [ ] 13.1 Mikro-zmiana tylko w zaznaczonym miejscu; reszta bez zmian. 🟢

---

## 14. DŁUG DO SPŁATY (🔴/🟡 zbiorczo)
- [ ] 14.1 Uniwersalizacja `wstaw.reguly`, `przenies.reguly`, `sekcjaObszarow` (usunąć auta/garaże/jezdnie). 🔴
- [ ] 14.2 Uogólnić car-only bloki w `SYSTEM_REZYSERA` STEP 4. 🔴
- [ ] 14.3 Nowy tryb `postac_pelna` (Character swap). 🔴
- [ ] 14.4 Wzmocnić ziarno/anti-enhancer, jeśli model dalej oporny (opcja: trzymanie nietkniętych pikseli). 🟡
- [ ] 14.5 Potwierdzić nazewnictwo object swap/transfer i zsynchronizować kod+UI. 🔴
