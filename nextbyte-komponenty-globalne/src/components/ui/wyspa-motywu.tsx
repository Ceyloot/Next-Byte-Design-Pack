import * as React from 'react';
import { useJasnyMotyw } from '@/hooks/useJasnyMotyw';
import type { PodlozeOkien } from '@/hooks/usePodlozeOkien';
import {
  MOTYW_DLA_PODLOZA, motywWyspy, zmienneWyspy,
  koloryMotywuZPamieci, pobierzKoloryMotywu, koloryPasujaDoPodloza,
} from '@/lib/motyw-wyspy';
import { KontenerPortali } from './kontener-portali';

/**
  WYSPA MOTYWU — okno w motywie podłoża, nie platformy (28.09.2026).

  Michał: „jak jest biały motyw tablicy to daj biały motyw asystenta okna,
  a ciemny motyw — ciemny motyw okna asystenta". Mechanizm i uzasadnienie
  wartości: `lib/motyw-wyspy.ts`; skąd okno wie, na czym leży:
  `hooks/usePodlozeOkien.ts`.

  DLACZEGO `display: contents`: zmienne CSS dziedziczą się po drzewie DOM,
  a pudełka wyspa nie potrzebuje. Bez pudełka nie powstaje też blok
  zawierający dla `position: fixed` — okno Asystenta i menu z portali liczą
  położenie od ekranu jak dotąd.

  DLACZEGO KONTENER PORTALI OBOK DZIECI, A NIE W OKNIE: okno to tafla
  z `overflow: hidden` i własnym `backdrop-filter`. Menu włożone do środka
  byłoby ucięte, a strażnik zagnieżdżenia szkła zdjąłby mu rozmycie. Kontener
  leży na wyspie (dziedziczy motyw), ale poza szybą.

  Struktura DOM jest ZAWSZE ta sama (wyspa aktywna czy nie): przełączenie
  motywu płótna nie może przemontować okna — zgubiłoby wpisany tekst,
  przewinięcie i odegrało animację wejścia jeszcze raz.
*/

/** Atrybut korzenia aktywnej wyspy — po nim arkusz rozpoznaje wyspę. */
export const ATRYBUT_WYSPY = 'data-nb-wyspa-motywu';

export interface MotywWyspy {
  /** Nazwa motywu z `color_themes` — trafia do `data-theme` korzenia wyspy. */
  nazwa: string;
  jasny: boolean;
  /** Pełen zestaw zmiennych: kolory z bazy + szkło. */
  zmienne: Record<string, string>;
}

/**
 * Motyw wyspy dla zadeklarowanego podłoża albo `null`, gdy wyspa jest zbędna
 * (brak podłoża, podłoże zgodne z motywem platformy, baza jeszcze nie odpowiedziała).
 */
export function useMotywWyspy(podloze: PodlozeOkien | null): MotywWyspy | null {
  const platformaJasna = useJasnyMotyw();
  const nazwa = motywWyspy(podloze, platformaJasna);
  /* Motyw, którego wyspa MOŻE potrzebować na tej stronie: przeciwny do
     platformy. Pobierany od razu po deklaracji podłoża, nawet gdy płótno
     zgadza się z platformą — przełączenie płótna nie czeka wtedy na bazę. */
  const potencjalny = podloze ? MOTYW_DLA_PODLOZA[platformaJasna ? 'ciemne' : 'jasne'] : null;
  const [pobrane, setPobrane] = React.useState<{ nazwa: string; kolory: Record<string, string> } | null>(null);

  React.useEffect(() => {
    if (!potencjalny) return;
    let aktualne = true;
    void pobierzKoloryMotywu(potencjalny).then((kolory) => {
      if (aktualne && kolory) setPobrane({ nazwa: potencjalny, kolory });
    });
    return () => { aktualne = false; };
  }, [potencjalny]);

  return React.useMemo(() => {
    if (!nazwa || !podloze) return null;
    const kolory = pobrane?.nazwa === nazwa ? pobrane.kolory : koloryMotywuZPamieci(nazwa);
    if (!kolory || !koloryPasujaDoPodloza(kolory, podloze)) return null;
    return { nazwa, jasny: podloze === 'jasne', zmienne: zmienneWyspy(kolory) };
  }, [nazwa, podloze, pobrane]);
}

/**
 * Styl i atrybuty korzenia wyspy — to, co `WyspaMotywu` kładzie na swój element.
 *
 * Osobno, bo nie każdy korzeń może być owijką w drzewie Reacta: okno modalne
 * idzie portalem do `<body>` i tam dostaje własny korzeń z tymi samymi
 * zmiennymi (`OknoTresc` z `podloze`, 28.09.2026). Jedno źródło — okno
 * i pływający panel nad tym samym płótnem mają ten sam motyw.
 */
export function useKorzenWyspy(podloze: PodlozeOkien | null): {
  motyw: MotywWyspy | null;
  styl: React.CSSProperties;
  atrybuty: Record<string, string>;
} {
  const motyw = useMotywWyspy(podloze);
  return React.useMemo(() => {
    if (!motyw) return { motyw, styl: {}, atrybuty: {} };
    const s: Record<string, string> = { ...motyw.zmienne };
    /* Kolor tekstu dziedziczy się jako GOTOWA WARTOŚĆ, nie jako zmienna:
       `body { color: hsl(var(--foreground)) }` liczy się na <body> z motywu
       platformy, a elementy bez własnej klasy koloru brały go stamtąd.
       Zmierzone w podglądzie: pod ciemną platformą jasna wyspa miała na
       taflach i w wiadomościach dziedziczony `rgb(245,245,245)` — biały
       tekst na białym szkle. Wyspa robi to samo co <body>, u siebie. */
    s.color = 'hsl(var(--foreground))';
    // Natywne kontrolki (paski przewijania, pola) w tym samym motywie co wyspa.
    s.colorScheme = motyw.jasny ? 'light' : 'dark';
    return {
      motyw,
      styl: s as React.CSSProperties,
      atrybuty: { 'data-theme': motyw.nazwa, [ATRYBUT_WYSPY]: motyw.jasny ? 'jasna' : 'ciemna' },
    };
  }, [motyw]);
}

/**
 * Nakłada na swoje poddrzewo motyw podłoża, gdy różni się od motywu platformy.
 * Bez podłoża (`null`) nie zmienia nic — dzieci mają motyw platformy.
 */
export const WyspaMotywu: React.FC<{
  podloze: PodlozeOkien | null;
  children: React.ReactNode;
}> = ({ podloze, children }) => {
  const { motyw, styl, atrybuty } = useKorzenWyspy(podloze);
  const [kontener, setKontener] = React.useState<HTMLDivElement | null>(null);
  const style = React.useMemo(() => ({ display: 'contents', ...styl }) as React.CSSProperties, [styl]);

  return (
    <div style={style} {...atrybuty}>
      <KontenerPortali value={motyw ? kontener : null}>{children}</KontenerPortali>
      <div ref={setKontener} style={{ display: 'contents' }} data-nb-kontener-portali="" />
    </div>
  );
};
