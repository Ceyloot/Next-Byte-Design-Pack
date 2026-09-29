/**
 * Klient Gemini dla dwóch analiz Canvasu. Nie zawiera żadnych promptów —
 * teksty i parsery są w `canvas/prompts/gemini/`. Tu jest tylko transport:
 * zdjęcia + tekst promptu → odpowiedź JSON → wynik z parsera.
 */
import { stripDataUrl } from './maskUtils';
import {
  KONFIG_ANALIZY,
  MODEL_ANALIZY,
  domyslnaAnalizaDocelowego,
  parsujOpisSceny,
  parsujZdjecieDocelowe,
  zbudujPromptOpisuSceny,
  zbudujPromptZdjeciaDocelowego,
} from '../prompts';
import type { AnalizaDocelowego, OpisSceny, PineskaWejscie } from '../prompts';

type Czesc = { text?: string; inlineData?: { mimeType: string; data: string } };

/** Zdjęcia jako "Image k:" + dane, potem tekst promptu — w kolejności Image 1..N. */
function czesciZObrazami(obrazy: string[], prompt: string): Czesc[] {
  const czesci: Czesc[] = [];
  obrazy.forEach((src, i) => {
    const s = stripDataUrl(src);
    czesci.push({ text: `Image ${i + 1}:` });
    czesci.push({ inlineData: { mimeType: s.mimeType, data: s.base64 } });
  });
  czesci.push({ text: prompt });
  return czesci;
}

async function wywolajGemini(apiKey: string, czesci: Czesc[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ANALIZY}:generateContent?key=${apiKey}`;
  const odpowiedz = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: czesci }],
      generationConfig: KONFIG_ANALIZY,
    }),
  });

  if (!odpowiedz.ok) {
    throw new Error(`Gemini API error (${odpowiedz.status}): ${await odpowiedz.text()}`);
  }

  const json = await odpowiedz.json();
  const parts: Array<{ text?: string; thought?: boolean }> = json?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? '')
    .join('')
    .trim();
}

/**
 * KROK 1 — prompt Gemini nr 1: które zdjęcie jest docelowe, jaka operacja,
 * jakie role pinesek. Przy błędzie zwraca analizę domyślną (bez Gemini).
 */
export async function analizujZdjecieDocelowe(
  apiKey: string,
  obrazyZMarkerami: string[],
  pineski: PineskaWejscie[],
  polecenie: string
): Promise<AnalizaDocelowego> {
  const wejscie = { liczbaZdjec: obrazyZMarkerami.length, pineski, polecenie };
  try {
    const odpowiedz = await wywolajGemini(
      apiKey,
      czesciZObrazami(obrazyZMarkerami, zbudujPromptZdjeciaDocelowego(wejscie))
    );
    return parsujZdjecieDocelowe(odpowiedz, wejscie);
  } catch (error) {
    console.warn('analizujZdjecieDocelowe failed:', error);
    return domyslnaAnalizaDocelowego(wejscie);
  }
}

/**
 * KROK 2 — prompt Gemini nr 2: miejsce, wygląd i wymiary, pineska po pineskce.
 * Zdjęcia muszą być już w kolejności wysyłki do generatora (Image 1 = docelowe).
 * Przy błędzie zwraca pusty opis (sklejka działa dalej bez SCALE).
 */
export async function opiszScene(
  apiKey: string,
  obrazyZMarkerami: string[],
  pineski: PineskaWejscie[],
  polecenie: string,
  analiza?: AnalizaDocelowego
): Promise<OpisSceny> {
  const wejscie = { liczbaZdjec: obrazyZMarkerami.length, pineski, polecenie, analiza };
  try {
    const odpowiedz = await wywolajGemini(
      apiKey,
      czesciZObrazami(obrazyZMarkerami, zbudujPromptOpisuSceny(wejscie))
    );
    return parsujOpisSceny(odpowiedz, wejscie);
  } catch (error) {
    console.warn('opiszScene failed:', error);
    return { miejsce: '', wyglad: '', kotwice: '', pineski: [] };
  }
}
