import { stripDataUrl } from './maskUtils';
import { OPERATION_IDS } from '../prompts';
import type { OperationId } from '../prompts';

export type CanvasIntent =
  | 'character_transfer'
  | 'object_transfer'
  | 'character_swap'
  | 'object_swap'
  | 'background_edit'
  | 'remove_object'
  | 'add_text'
  | 'fusion'
  | 'style_change'
  | 'edit'
  | 'generate'
  | 'remove_bg';

const GEMINI_VISION_MODEL = 'gemini-2.5-flash';

async function callGeminiContent(
  apiKey: string,
  model: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  generationConfig?: Record<string, any>
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/**
 * TARGET OBJECT ANALYZER
 * Analyzes the specific object located under the Pin marker coordinates.
 */
export async function geminiAnalyzeTargetObject(
  apiKey: string,
  imageBase64: string,
  pinCoords: { x: number; y: number }
): Promise<string> {
  try {
    const stripped = stripDataUrl(imageBase64);
    const parts = [
      {
        inlineData: {
          mimeType: stripped.mimeType,
          data: stripped.base64,
        },
      },
      {
        text: `Identify the object located at the pin marker at coordinates X: ${Math.round(
          pinCoords.x * 100
        )}%, Y: ${Math.round(pinCoords.y * 100)}% on this image.
        
TASK:
1. Look at the specified location.
2. Describe the object, person, or element found there in 2-4 words in Polish (e.g., "drewniany domek", "kamienna studnia", "czerwony samochód", "ganek").
3. Focus on identity and object type.

Response format: ONLY the short Polish description, nothing else.`,
      },
    ];

    const result = await callGeminiContent(apiKey, GEMINI_VISION_MODEL, parts);
    return result || 'obiekt';
  } catch (error) {
    console.warn('geminiAnalyzeTargetObject failed:', error);
    return 'obiekt';
  }
}

/**
 * Detects an object at specific normalized coordinates.
 */
export async function geminiDetectPointObject(
  apiKey: string,
  imageBase64: string,
  x: number,
  y: number
): Promise<string[]> {
  if (!apiKey) throw new Error('API key is required');

  try {
    const stripped = stripDataUrl(imageBase64);
    const parts = [
      {
        inlineData: {
          mimeType: stripped.mimeType,
          data: stripped.base64,
        },
      },
      {
        text: `Detect the object at coordinates X: ${Math.round(x * 100)}%, Y: ${Math.round(
          y * 100
        )}%.
Return a JSON array of 3-5 short descriptions/suggestions in Polish for what this object is.
Example: ["drewniany dom", "altana ogrodowa", "budynek gospodarczy"]
Return ONLY the raw JSON array.`,
      },
    ];

    const text = await callGeminiContent(apiKey, GEMINI_VISION_MODEL, parts);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.warn('geminiDetectPointObject failed:', error);
    return [];
  }
}

/**
 * Standardized wrapper for analyzing a masked area with Gemini.
 */
export async function geminiAnalyzeBrushMask(
  apiKey: string,
  imageBase64: string,
  maskBase64: string,
  prompt: string
): Promise<string> {
  if (!apiKey) throw new Error('API key is required');

  try {
    const imgStripped = stripDataUrl(imageBase64);
    const maskStripped = stripDataUrl(maskBase64);

    const parts = [
      { text: 'Original image for context:' },
      {
        inlineData: {
          mimeType: imgStripped.mimeType,
          data: imgStripped.base64,
        },
      },
      { text: 'Visual mask (White = Target area, Black = Ignore):' },
      {
        inlineData: {
          mimeType: maskStripped.mimeType,
          data: maskStripped.base64,
        },
      },
      { text: prompt },
    ];

    return await callGeminiContent(apiKey, GEMINI_VISION_MODEL, parts);
  } catch (error) {
    console.warn('geminiAnalyzeBrushMask failed:', error);
    throw error;
  }
}

/**
 * Uses Gemini to analyze user intent on the canvas with Pin markers.
 */
export async function geminiAnalyzeCanvasIntent(
  apiKey: string,
  userPrompt: string,
  pinCount: number,
  pins: { description: string; normalizedX: number; normalizedY: number }[],
  imageBase64?: string,
  secondImageBase64?: string,
  sourceCrop?: string,
  targetCrop?: string
): Promise<{
  /** Operacja z zamkniętego słownika rejestru — steruje wyborem promptu sytuacyjnego. */
  operation: OperationId;
  intent: CanvasIntent;
  /** Opis od Gemini: co konkretnie ma powstać (trafia do [GENERATION BRIEF]). */
  generationBrief: string;
  enhancedPrompt: string;
  sourcePinIdx?: number;
  targetPinIdx?: number;
  swapType?: 'identity' | 'character' | 'object';
  objectName?: string;
  suggestedScale?: number;
  bBox?: [number, number, number, number];
}> {
  if (!apiKey) return { operation: 'general_edit', intent: 'edit', generationBrief: userPrompt, enhancedPrompt: userPrompt };

  const pinInfo = pins
    .map(
      (p, idx) =>
        `PIN ${idx + 1}: "${p.description || 'brak opisu'}" at [X: ${p.normalizedX.toFixed(
          2
        )}, Y: ${p.normalizedY.toFixed(2)}]`
    )
    .join(' | ');

  try {
    const parts: any[] = [];

    if (imageBase64) {
      const s = stripDataUrl(imageBase64);
      parts.push({
        inlineData: { mimeType: s.mimeType, data: s.base64 },
      });
    }
    if (secondImageBase64) {
      const s = stripDataUrl(secondImageBase64);
      parts.push({
        inlineData: { mimeType: s.mimeType, data: s.base64 },
      });
    }
    if (sourceCrop) {
      parts.push({ text: 'SOURCE CROP (Zoom in on Pin 1 / Obiekt źródłowy):' });
      const s = stripDataUrl(sourceCrop);
      parts.push({
        inlineData: { mimeType: s.mimeType, data: s.base64 },
      });
    }
    if (targetCrop) {
      parts.push({ text: 'TARGET CROP (Zoom in on Pin 2 / Miejsce docelowe):' });
      const s = stripDataUrl(targetCrop);
      parts.push({
        inlineData: { mimeType: s.mimeType, data: s.base64 },
      });
    }

    parts.push({
      text: `Jesteś ekspertem-klasyfikatorem intencji dla generatywnego Canvasu graficznego.
POLECENIE: "${userPrompt}"
LICZBA PINEZEK: ${pinCount}
PINEZKI: ${pinInfo}

TWOJE ZADANIE:
1. Wybierz DOKŁADNIE JEDNĄ operację z dozwolonej listy (nie wymyślaj innych):
   ${OPERATION_IDS.join(' | ')}
2. Nie sięgaj po object_swap/character_swap, jeśli sytuacja nim nie jest — dobierz operację najlepiej pasującą do polecenia i pinezek.
3. Jeśli użytkownik wskazał 2 pinezki, jest to zwykle relokacja obiektu (object_transfer): Pin 1 = Źródło, Pin 2 = Cel; źródło ma zostać wyczyszczone (clean plate).
4. W polu BRIEF opisz krótko po angielsku CO ma powstać (sam przedmiot/scena), bez zasad technicznych — te doda silnik.

FORMAT ODPOWIEDZI (dokładnie te klucze):
OPERATION: <jedna z: ${OPERATION_IDS.join(' | ')}>
OBJECT_NAME: <nazwa obiektu po polsku>
BRIEF: <krótki angielski opis tego, co ma zostać wygenerowane>`,
    });

    const result = await callGeminiContent(apiKey, GEMINI_VISION_MODEL, parts);

    const opMatch = result.match(/OPERATION:\s*([a-z_]+)/i);
    const objectNameMatch = result.match(/OBJECT_NAME:\s*(.+)/i);
    const briefMatch = result.match(/BRIEF:\s*(.+)/is);

    const rawOp = opMatch?.[1]?.toLowerCase() as OperationId | undefined;
    const operation: OperationId =
      rawOp && (OPERATION_IDS as string[]).includes(rawOp) ? rawOp : 'general_edit';
    const brief = briefMatch?.[1]?.trim() || userPrompt;

    return {
      operation,
      intent: operation as unknown as CanvasIntent,
      generationBrief: brief,
      objectName: objectNameMatch?.[1]?.trim(),
      enhancedPrompt: brief,
      sourcePinIdx: 0,
      targetPinIdx: 1,
      suggestedScale: 0.35,
    };
  } catch (error) {
    console.warn('geminiAnalyzeCanvasIntent failed:', error);
    return { operation: 'general_edit', intent: 'edit', generationBrief: userPrompt, enhancedPrompt: userPrompt };
  }
}
