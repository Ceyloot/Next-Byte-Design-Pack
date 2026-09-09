#!/usr/bin/env python3
"""Rozsyła bibliotekę z podglądu do dwóch pozostałych kopii.

Źródłem prawdy jest `nextbyte-preview/src` — tam pracujemy i tam widać
efekt na żywo. `design-kit/` i `packages/nextbyte-ui/src/` to te same
pliki, różniące się wyłącznie zapisem ścieżek importu: podgląd używa
aliasu `@/`, a kopie przeznaczone do przeklejenia i do paczki npm —
ścieżek względnych. Skrypt przenosi treść i przepisuje same importy.

    python skrypty/synchronizuj-biblioteke.py            # rozsyła
    python skrypty/synchronizuj-biblioteke.py --sprawdz  # tylko raport

`--sprawdz` niczego nie zapisuje; wypisuje, co by się zmieniło. Nadaje
się do haka przed commitem, żeby kopie nie rozjechały się niepostrzeżenie.
"""
from __future__ import annotations

import io
import os
import re
import sys

KORZEN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO = os.path.join(KORZEN, 'nextbyte-preview', 'src')

# Co wędruje do kopii: (podkatalog w źródle, podkatalog w celu)
ZESTAW = [
    ('components', 'components'),
    ('grafiki',    'grafiki'),
    ('hooks',      'hooks'),
    ('lib',        'lib'),
]

# Dla każdej kopii: dokąd trafia i czy przepisywać alias `@/` na ścieżki
# względne. Paczka npm ma alias skonfigurowany w swoim tsconfig.json, więc
# dostaje pliki jeden do jednego — przepisywanie tylko rozjechałoby diff.
# `design-kit` jest do przeklejania do obcych projektów, gdzie żadnego
# aliasu nie ma, więc tam ścieżki muszą być względne.
CELE = {
    'design-kit':           (os.path.join(KORZEN, 'design-kit'), True),
    'packages/nextbyte-ui': (os.path.join(KORZEN, 'packages', 'nextbyte-ui', 'src'), False),
}

# Arkusz stylów: w podglądzie leży w korzeniu `src`, w kopiach w `styles/`.
# Jedzie osobno, bo to jedyny plik, który zmienia nazwę katalogu po drodze.
ARKUSZ = ('index.css', 'styles/index.css')

# Pliki żyjące tylko w podglądzie — narzędzia warsztatowe, nie biblioteka.
POMIJANE = {
    'components/ui/CodeExporterModal.tsx',
    'components/ui/ComponentInspector.tsx',
}


def wzgledna(z_pliku: str, do_katalogu: str) -> str:
    """Ścieżka względna z katalogu pliku do katalogu docelowego, w zapisie
    POSIX i zawsze z wiodącym `./` lub `../`."""
    krok = os.path.relpath(do_katalogu, os.path.dirname(z_pliku)).replace(os.sep, '/')
    return krok if krok.startswith('.') else './' + krok


def przepisz_importy(tresc: str, sciezka_wzgledna: str, korzen_celu: str) -> str:
    """Zamienia alias `@/coś` na ścieżkę względną liczoną od miejsca, w
    którym plik wyląduje w kopii."""
    plik_w_celu = os.path.join(korzen_celu, sciezka_wzgledna)

    def zamien(m: re.Match) -> str:
        cel = m.group(1)                     # np. 'lib/utils'
        katalog = os.path.dirname(os.path.join(korzen_celu, cel))
        prefiks = wzgledna(plik_w_celu, katalog)
        return f"from '{prefiks}/{os.path.basename(cel)}'"

    return re.sub(r"from '@/([^']+)'", zamien, tresc)


def zbierz() -> list[tuple[str, str]]:
    """Lista (ścieżka bezwzględna w źródle, ścieżka względna) do rozesłania."""
    out = []
    for pod_zrodlo, pod_cel in ZESTAW:
        baza = os.path.join(ZRODLO, pod_zrodlo)
        if not os.path.isdir(baza):
            continue
        for d, _, pliki in os.walk(baza):
            for f in sorted(pliki):
                if not f.endswith(('.ts', '.tsx', '.css')):
                    continue
                pelna = os.path.join(d, f)
                rel = os.path.relpath(pelna, ZRODLO).replace(os.sep, '/')
                rel = rel.replace(pod_zrodlo + '/', pod_cel + '/', 1)
                if rel in POMIJANE:
                    continue
                out.append((pelna, rel))

    zrodlo_arkusza = os.path.join(ZRODLO, ARKUSZ[0])
    if os.path.isfile(zrodlo_arkusza):
        out.append((zrodlo_arkusza, ARKUSZ[1]))
    return out


def main() -> int:
    tylko_raport = '--sprawdz' in sys.argv
    pliki = zbierz()
    if not pliki:
        print(f'Nie znalazłem nic do rozesłania w {ZRODLO}')
        return 1

    lacznie_zmian = 0
    for nazwa, (korzen_celu, na_wzgledne) in CELE.items():
        zmienione, nowe, bez_zmian = [], [], 0
        for pelna, rel in pliki:
            tresc = io.open(pelna, encoding='utf-8').read()
            if na_wzgledne:
                tresc = przepisz_importy(tresc, rel, korzen_celu)
            cel = os.path.join(korzen_celu, rel)

            if os.path.exists(cel):
                if io.open(cel, encoding='utf-8').read() == tresc:
                    bez_zmian += 1
                    continue
                zmienione.append(rel)
            else:
                nowe.append(rel)

            if not tylko_raport:
                os.makedirs(os.path.dirname(cel), exist_ok=True)
                io.open(cel, 'w', encoding='utf-8', newline='\n').write(tresc)

        lacznie_zmian += len(zmienione) + len(nowe)
        czasownik = 'do zmiany' if tylko_raport else 'zaktualizowane'
        print(f'[{nazwa}] {czasownik}: {len(zmienione)} | nowe: {len(nowe)} | bez zmian: {bez_zmian}')
        for r in (zmienione + nowe)[:12]:
            print(f'    {r}')
        if len(zmienione) + len(nowe) > 12:
            print(f'    … i {len(zmienione) + len(nowe) - 12} więcej')

    if tylko_raport and lacznie_zmian:
        print('\nKopie rozjechały się ze źródłem. Uruchom bez --sprawdz, żeby wyrównać.')
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
