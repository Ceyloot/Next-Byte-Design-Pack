/**
 * PIPELINE CANVASU — cały przepływ od pinesek do gotowego promptu
 * ================================================================
 * Kolejność kroków (opis i uzasadnienia: `canvas/README.md`):
 *
 *   1. kolejność zdjęć   — zdjęcia w kolejności pojawiania się pinesek
 *   2. kopie z markerami — ponumerowane magentowe kropki, tylko dla Gemini
 *   3. Gemini nr 1       — zdjęcie docelowe + operacja + role pinesek
 *   4. przestawienie     — Image 1 = docelowe, dalej dawcy
 *   5. Gemini nr 2       — miejsce, wygląd i wymiary (pineska po pineskce)
 *   6. składanie         — bricks + operacja + opis + polecenie → prompt
 *   7. materiały         — czyste zdjęcia, maska, proporcje
 *
 * Wynik jest gotowy do `generateGoogleImage`.
 */
import { createBlobMaskAtPoint, createDualTransferMask, drawGenerationDots, drawPinMarkers } from './maskUtils';
import { analizujZdjecieDocelowe, opiszScene } from './geminiClient';
import { skladajPrompt } from '../prompts';
import type {
  AnalizaDocelowego,
  ObrazWejscia,
  OpisSceny,
  OperationId,
  PineskaSklejka,
  PineskaWejscie,
  SkladajWynik,
} from '../prompts';

export type Proporcje = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '3:2';

export interface WarstwaWejscia {
  id: string;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface PineskaCanvas {
  id: string;
  layerId: string;
  normalizedX: number;
  normalizedY: number;
  description?: string;
}

export interface WejscieGeneracji {
  apiKey: string;
  warstwy: WarstwaWejscia[];
  pineski: PineskaCanvas[];
  polecenie: string;
  /** zaznaczona warstwa — używana, gdy nie ma pinesek albo dokłada kandydata na cel */
  warstwaWybranaId?: string;
  naStatus?: (tekst: string) => void;
}

export interface WynikPrzygotowania {
  prompt: string;
  /** zdjęcia (z małymi kropkami pinesek) w kolejności wysyłki do generatora: docelowe, potem dawcy */
  obrazy: string[];
  maska?: string;
  proporcje: Proporcje;
  skladanie: SkladajWynik;
  analiza: AnalizaDocelowego;
  opis: OpisSceny;
  idWarstwyDocelowej: string;
}

const MAKS_ZDJEC = 4;

/** Operacje działające na całym kadrze — bez maski obszaru pracy. */
const BEZ_MASKI: OperationId[] = ['background_change', 'season_change', 'time_of_day_change', 'style_change'];

const PROPORCJE: { nazwa: Proporcje; wartosc: number }[] = [
  { nazwa: '1:1', wartosc: 1 },
  { nazwa: '16:9', wartosc: 16 / 9 },
  { nazwa: '9:16', wartosc: 9 / 16 },
  { nazwa: '4:3', wartosc: 4 / 3 },
  { nazwa: '3:4', wartosc: 3 / 4 },
  { nazwa: '3:2', wartosc: 3 / 2 },
  { nazwa: '2:3', wartosc: 2 / 3 },
];

/** Najbliższe obsługiwane proporcje dla obrazu docelowego. */
export function dopasujProporcje(szerokosc: number, wysokosc: number): Proporcje {
  const r = szerokosc / Math.max(1, wysokosc);
  return PROPORCJE.reduce((najlepsza, p) =>
    Math.abs(p.wartosc - r) < Math.abs(najlepsza.wartosc - r) ? p : najlepsza
  ).nazwa;
}

/**
 * Szybkie nazwanie obiektu pod świeżo postawioną pineską — ten sam prompt
 * opisu sceny, ale dla jednej pineski i bez analizy operacji.
 */
export async function nazwijPineske(apiKey: string, src: string, x: number, y: number): Promise<string> {
  const oznaczone = await drawPinMarkers(src, [{ x, y, numer: 1 }], 1024);
  const opis = await opiszScene(apiKey, [oznaczone], [{ numer: 1, zdjecie: 1, x, y }], '');
  return opis.pineski[0]?.nazwa || 'obiekt';
}

export async function przygotujGeneracje(w: WejscieGeneracji): Promise<WynikPrzygotowania> {
  const status = w.naStatus ?? (() => undefined);
  const warstwaPoId = new Map(w.warstwy.map((l) => [l.id, l]));

  // 1. Kolejność zdjęć: w kolejności pierwszej pineski na danym zdjęciu,
  //    zaznaczona warstwa dołączona na końcu, jeśli nie ma na niej pinesek.
  const kolejnosc: WarstwaWejscia[] = [];
  const dodaj = (id?: string) => {
    const l = id ? warstwaPoId.get(id) : undefined;
    if (l && !kolejnosc.includes(l)) kolejnosc.push(l);
  };
  w.pineski.forEach((p) => dodaj(p.layerId));
  dodaj(w.warstwaWybranaId);
  if (kolejnosc.length === 0) dodaj(w.warstwy[0]?.id);
  if (kolejnosc.length === 0) throw new Error('Brak obrazu na płótnie.');
  kolejnosc.splice(MAKS_ZDJEC);

  const pineskiWejscie: PineskaWejscie[] = w.pineski
    .filter((p) => kolejnosc.some((l) => l.id === p.layerId))
    .map((p, i) => ({
      numer: i + 1,
      zdjecie: kolejnosc.findIndex((l) => l.id === p.layerId) + 1,
      x: p.normalizedX,
      y: p.normalizedY,
      nazwa: p.description && !/Identyfikacja/i.test(p.description) ? p.description : undefined,
    }));

  // 2. Kopie z ponumerowanymi magentowymi kropkami — tylko dla Gemini.
  status('Zaznaczam pineski na kopiach zdjęć...');
  const oznaczone = await Promise.all(
    kolejnosc.map((l, i) =>
      drawPinMarkers(
        l.src,
        pineskiWejscie.filter((p) => p.zdjecie === i + 1).map((p) => ({ x: p.x, y: p.y, numer: p.numer }))
      )
    )
  );

  // 3. Gemini nr 1: zdjęcie docelowe, operacja, role pinesek.
  status('Gemini: które zdjęcie jest docelowe i jaka to operacja...');
  const analiza = await analizujZdjecieDocelowe(w.apiKey, oznaczone, pineskiWejscie, w.polecenie);

  // 4. Przestawienie: Image 1 = docelowe, dalej dawcy.
  const idxDocelowy = analiza.zdjecieDocelowe - 1;
  const idxDawcow = analiza.zdjeciaDawcow.map((n) => n - 1).filter((i) => i !== idxDocelowy);
  const stareIndeksy = [idxDocelowy, ...idxDawcow];
  const nowyNumer = new Map(stareIndeksy.map((stary, i) => [stary + 1, i + 1]));

  const warstwyWysylki = stareIndeksy.map((i) => kolejnosc[i]);
  const oznaczoneWysylki = stareIndeksy.map((i) => oznaczone[i]);
  const pineskiWysylki: PineskaWejscie[] = pineskiWejscie
    .filter((p) => nowyNumer.has(p.zdjecie))
    .map((p) => ({ ...p, zdjecie: nowyNumer.get(p.zdjecie) as number }));

  // 5. Gemini nr 2: miejsce, wygląd i wymiary — pineska po pineskce.
  status('Gemini: opisuję miejsce, wygląd i wymiary...');
  const opis = await opiszScene(w.apiKey, oznaczoneWysylki, pineskiWysylki, w.polecenie, analiza);

  // 6. Składanie promptu.
  status('Składam bricki w prompt...');
  const docelowa = warstwyWysylki[0];
  const obrazyWejscia: ObrazWejscia[] = warstwyWysylki.map((_, i) => ({
    numer: i + 1,
    rola: i === 0 ? 'target' : 'donor',
  }));
  const pineskiSklejka: PineskaSklejka[] = pineskiWysylki.map((p) => ({
    numer: p.numer,
    rola: analiza.role.find((r) => r.pineska === p.numer)?.rola ?? 'target',
    obraz: p.zdjecie,
    x: p.x,
    y: p.y,
    nazwa: p.nazwa,
  }));

  // 7. Maska obszaru pracy (tylko na obrazie docelowym).
  const nadocelowym = pineskiSklejka.filter((p) => p.obraz === 1);
  const cel = nadocelowym.find((p) => p.rola === 'target');
  const zrodlo = nadocelowym.find((p) => p.rola === 'source');
  const w0 = docelowa.naturalWidth;
  const h0 = docelowa.naturalHeight;
  let maska: string | undefined;
  if (!BEZ_MASKI.includes(analiza.operacja)) {
    if ((analiza.operacja === 'object_transfer' || analiza.operacja === 'character_transfer') && zrodlo && cel) {
      maska = createDualTransferMask(w0, h0, { x: zrodlo.x, y: zrodlo.y }, { x: cel.x, y: cel.y }, 0.2).combinedMask;
    } else if (cel) {
      maska = createBlobMaskAtPoint(w0, h0, cel.x * w0, cel.y * h0, w0 * 0.18, h0 * 0.18);
    }
  }

  const skladanie = skladajPrompt({
    polecenie: w.polecenie,
    operacja: analiza.operacja,
    pineski: pineskiSklejka,
    obrazy: obrazyWejscia,
    opis,
    format: { szerokosc: w0, wysokosc: h0 },
    maska: !!maska,
  });

  // Model obrazu: zdjęcia z małą magentową kropką w miejscu każdej pineski (bez numerów).
  const obrazy = await Promise.all(
    warstwyWysylki.map((l, i) =>
      drawGenerationDots(
        l.src,
        pineskiSklejka.filter((p) => p.obraz === i + 1).map((p) => ({ x: p.x, y: p.y }))
      )
    )
  );

  return {
    prompt: skladanie.prompt,
    obrazy,
    maska,
    proporcje: dopasujProporcje(w0, h0),
    skladanie,
    analiza,
    opis,
    idWarstwyDocelowej: docelowa.id,
  };
}
