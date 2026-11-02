import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  TYTUŁ KARTY — znak firmy, kreska, nazwa karty z opisem (STANDARD-WYGLADU §3a)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (17.09.2026): „najpierw logo firmy i nazwa karty”. Dziewięć kart [firma klienta] miało dziewięć nagłówków
 * (kropka, ikona w kafelku, ikona w tytule, 20/22/24/26 px). Odrzucone: poziomy logotyp obok nazwy, logotyp jako
 * linijka nad nazwą, znak w kafelku („nie chcę żadnej ramki dookoła logotypu”). Obowiązuje: sam znak, dokładnie
 * na wysokość dwóch rzędów (nazwa + opis), pionowa kreska, nazwa i opis jednym blokiem.
 *
 * Wysokość znaku mierzy blok tekstu (ResizeObserver) — nie stała liczba, bo opis bywa dłuższy albo go nie ma.
 * CSS-owe `self-stretch` + `aspect-square` nie daje szerokości (zmierzone: 0 px), a sam obraz rozpychał rząd
 * do swoich 240 px. Szerokość znaku NIE jest ograniczana (18.09.2026): wysokość rządzi, proporcje bierze
 * plik, a miejsce ustępuje tekst, który ma `min-w-0` i `truncate`. `mix-blend-lighten` gasi czarne tło pliku
 * (znak z 17.09 ma nieprzezroczyste czarne tło), inaczej na panelu stoi ciemny kwadrat.
 */
export interface TytulKartyProps {
  nazwa: React.ReactNode;
  opis?: React.ReactNode;
  logoUrl?: string | null;
  /** plakietka / przycisk pomocy tuż za nazwą (np. poziom dostępu w CRM) */
  obokNazwy?: React.ReactNode;
  className?: string;
}

/**
 * CZY ZNAK ZNIKNIE NA TYM TLE — pomiar, nie przypuszczenie (18.09.2026).
 *
 * Kajetan wgrał logo z czarnymi literami na ciemny panel: „wgrałem logotyp, jest tragedia”. Do tego
 * `mix-blend-lighten`, który miał gasić czarne TŁO pliku, kasował też czarne LITERY — blend bierze
 * jaśniejszy z dwóch kolorów, więc czerń po prostu nie istnieje.
 *
 * Liczymy średnią jasność nieprzezroczystych pikseli znaku i porównujemy z jasnością tła, na którym
 * stoi. Gdy różnica jest za mała, znak dostaje odwrócenie jasności z obrotem barwy (`invert` +
 * `hue-rotate(180deg)`) — sztuczka z trybów ciemnych: czerń staje się bielą, a nasycony zielony
 * zostaje zielonym. Blend włączamy TYLKO dla znaku bez przezroczystości: tam faktycznie gasi tło.
 */
const zbadajZnak = (url: string): Promise<{ jasnosc: number; przezroczysty: boolean } | null> =>
  new Promise(ok => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onerror = () => ok(null);
    i.onload = () => {
      try {
        const bok = 64;
        const p = document.createElement('canvas');
        p.width = bok; p.height = bok;
        const ctx = p.getContext('2d', { willReadFrequently: true });
        if (!ctx) return ok(null);
        ctx.drawImage(i, 0, 0, bok, bok);
        const d = ctx.getImageData(0, 0, bok, bok).data;
        let suma = 0, ile = 0, przezroczyste = 0;
        for (let n = 0; n + 3 < d.length; n += 4) {
          if (d[n + 3] < 24) { przezroczyste++; continue; }
          suma += (0.2126 * d[n] + 0.7152 * d[n + 1] + 0.0722 * d[n + 2]) / 255;
          ile++;
        }
        ok(ile ? { jasnosc: suma / ile, przezroczysty: przezroczyste > bok * bok * 0.08 } : null);
      } catch { ok(null); }
    };
    i.src = url;
  });

export const TytulKarty: React.FC<TytulKartyProps> = ({ nazwa, opis, logoUrl, obokNazwy, className }) => {
  const blokRef = React.useRef<HTMLDivElement>(null);
  const [znak, setZnak] = React.useState<{ jasnosc: number; przezroczysty: boolean } | null>(null);
  const [jasneTlo, setJasneTlo] = React.useState(false);

  React.useEffect(() => {
    let zyje = true;
    if (!logoUrl) { setZnak(null); return; }
    void zbadajZnak(logoUrl).then(w => { if (zyje) setZnak(w); });
    return () => { zyje = false; };
  }, [logoUrl]);

  /* Jasność tła czytamy z żywego elementu — skóra zmienia je w locie, a token `--w1` bywa nadpisany
     przez powierzchnię, na której akurat stoi nagłówek. */
  React.useLayoutEffect(() => {
    const el = blokRef.current;
    if (!el || !logoUrl) return;
    const zmierz = () => {
      const tlo = getComputedStyle(el).getPropertyValue('--w1').trim() || getComputedStyle(el).backgroundColor;
      const l = Number(tlo.replace(/%/g, '').split(' ')[2]);
      setJasneTlo(Number.isFinite(l) ? l > 50 : false);
    };
    zmierz();
  }, [logoUrl]);

  /*
    ⚠️ WYSOKOŚĆ ZNAKU NIE MOŻE POCHODZIĆ Z POMIARU — INACZEJ WALCZY SAMA ZE SOBĄ.

    Zmierzone na produkcji 23.09.2026 (Baza Danych [firma klienta]): znak miał 4055 × 692 px
    i zasłaniał ekran, choć plik ma 1248 × 213, a nagłówek dwa rzędy tekstu.

    Sprzężenie biegło przez SZEROKOŚĆ, choć objaw widać w pionie:

      znak `width: auto, maxWidth: none` zabiera całą szerokość rzędu
        → blok tekstu (`min-w-0`) ściska się do kilku znaków
        → opis zawija się w wąski słupek i rośnie w pion (zmierzone: 660 px)
        → ResizeObserver oddaje tę wysokość znakowi
        → znak rośnie i zabiera jeszcze więcej szerokości.

    Sufity zatrzymywały eksplozję, ale nie samo sprzężenie — Kajetan (23.09):
    „logo skacze, jakby coś ze sobą walczyło”. I słusznie: pomiar zmieniał rozmiar,
    a rozmiar zmieniał pomiar, więc układ oscylował między dwoma stanami zamiast
    ustalić się na jednym.

    Dlatego wysokość NIE JEST MIERZONA. Bierze się wprost ze skali pisma: dwa rzędy
    nagłówka to tytuł (14 px × 1,3) plus opis (11 px × 1,4), czyli ~34 px — z zapasem
    na oddech bloku przyjmujemy 44 px, przemnożone przez `--skala-pisma`, żeby
    powiększenie pisma powiększało też znak. Nic tu niczego nie obserwuje, więc nie ma
    czym oscylować.

    Sufit szerokości zostaje jako osobna granica: nawet gdyby plik miał skrajne
    proporcje (bardzo szeroki pas), tekstowi ma zostać ponad połowa rzędu.

    Zamierzenie z 18.09 zostaje w mocy: wysokość rządzi, szerokość wynika z proporcji
    pliku, znak nie jest obcinany.
  */
  const WYSOKOSC_ZNAKU = 'calc(44px * var(--skala-pisma, 1))';
  const UDZIAL_SZEROKOSCI_ZNAKU = '38%';

  return (
    <div className={cn('flex min-w-0 items-center gap-4', className)}>
      {logoUrl && (
        <>
          {/* WYSOKOŚĆ RZĄDZI, SZEROKOŚĆ WYNIKA. Wcześniej znak dostawał kwadrat o boku równym wysokości
              bloku tekstu, więc każde logo szersze niż wysokie `object-contain` zmniejszał — panoramiczny
              znak wychodził o połowę niższy niż dwa rzędy (Kajetan 18.09.2026: „ma być dostosowany na
              wysokość 2 rzędów znaków, ale nie obcinany na szerokości ani skalowany przez ograniczoną
              szerokość”). Teraz stoi tylko wysokość, `width: auto` bierze proporcje pliku, a `shrink-0`
              pilnuje, żeby to tekst się skracał (ma `min-w-0` i `truncate`), nie znak. */}
          <img src={logoUrl} alt="" aria-hidden="true"
            style={{
              height: WYSOKOSC_ZNAKU, width: 'auto',
              /* Sufit szerokości przecina pętlę: tekstowi zostaje ponad połowa rzędu,
                 więc opis nie ma jak zawinąć się w słupek. */
              maxWidth: UDZIAL_SZEROKOSCI_ZNAKU,
              /* Znak ciemny na ciemnym (albo jasny na jasnym) znika — wtedy i tylko wtedy odwracamy jasność. */
              filter: znak && Math.abs(znak.jasnosc - (jasneTlo ? 1 : 0)) < 0.45
                ? 'invert(1) hue-rotate(180deg)' : undefined,
            }}
            className={cn('shrink-0 object-contain',
              /* Blend gasi czarne tło pliku, ale kasuje też czarne litery — włączamy go wyłącznie
                 dla znaku BEZ przezroczystości, czyli tam, gdzie naprawdę jest co gasić. */
              znak && !znak.przezroczysty && !jasneTlo && 'mix-blend-lighten')} />
          <span aria-hidden="true" style={{ height: WYSOKOSC_ZNAKU }} className="w-px shrink-0 bg-ramka-pole" />
        </>
      )}
      <div ref={blokRef} className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          {!logoUrl && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          <h1 className="truncate text-liczba text-t1">{nazwa}</h1>
          {obokNazwy}
        </div>
        {opis && <p className="mt-1 text-tresc text-t3">{opis}</p>}
      </div>
    </div>
  );
};

export default TytulKarty;
