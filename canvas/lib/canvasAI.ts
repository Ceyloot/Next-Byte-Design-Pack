import { 
  getClient, 
  stripDataUrl, 
  imageUrlToBase64Part, 
  resizeImageForGemini,
  GEMINI_VISION_MODEL,
  GEMINI_MAIN_MODEL
} from "../../../lib/gemini";
import { Part, HarmCategory, HarmBlockThreshold } from "@google/genai";

export type CanvasIntent =
  | "character_transfer"
  | "object_transfer"
  | "character_swap"
  | "object_swap"
  | "background_edit"
  | "remove_object"
  | "add_text"
  | "fusion"
  | "style_change"
  | "edit"
  | "generate"
  | "remove_bg";

/**
 * TARGET OBJECT ANALYZER (v2.0 - RED DOT PROTOCOL)
 * Analyzes the specific object located under the Red marker.
 */
export async function geminiAnalyzeTargetObject(
  apiKey: string, 
  imageBase64: string, 
  pinCoords: { x: number, y: number }
): Promise<string> {
  try {
    const client = getClient(apiKey);
    const parts: Part[] = [];
    const { data, mimeType } = await resizeImageForGemini(imageBase64);
    parts.push(imageUrlToBase64Part(data, mimeType));
    
    parts.push({
      text: `Identify the object located at the RED DOT marker at coordinates X: ${Math.round(pinCoords.x * 100)}%, Y: ${Math.round(pinCoords.y * 100)}% on this image.
      
      TASK:
      1. Look at the specified location.
      2. Describe the object, person, or part of the scene found there in 3-5 words.
      3. Focus on identity: (e.g., "yellow thumbs-up emoji", "white duck's foot", "red car license plate").
      
      Response format: Just the description, nothing else.`
    });

    const response = await client.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: [{ role: "user", parts }],
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "object";
  } catch (error) {
    console.warn("geminiAnalyzeTargetObject failed:", error);
    return "object";
  }
}

/**
 * Detects an object at specific normalized coordinates.
 */
export async function geminiDetectPointObject(
  apiKey: string,
  imageBase64: string,
  x: number,
  y: number,
): Promise<string[]> {
  if (!apiKey) throw new Error("API key is required");

  try {
    const client = getClient(apiKey);
    const { data, mimeType } = stripDataUrl(imageBase64);
    
    const response = await client.models.generateContent({
      model: GEMINI_MAIN_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            imageUrlToBase64Part(data, mimeType), 
            { 
              text: `Detect the object at coordinates X: ${Math.round(x * 100)}%, Y: ${Math.round(y * 100)}%. 
              Return a JSON array of 3-5 short descriptions/suggestions for what this object could be.
              Example: ["blue car", "vintage vehicle", "sedan"]
              Return ONLY the raw JSON array.` 
            }
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.warn("geminiDetectPointObject failed:", error);
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
  prompt: string,
): Promise<string> {
  if (!apiKey) throw new Error("API key is required");

  try {
    const client = getClient(apiKey);
    const { data: imgData, mimeType: imgMime } = await resizeImageForGemini(imageBase64);
    const { data: mData, mimeType: mMime } = await resizeImageForGemini(maskBase64);

    const response = await client.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Original image for context:" },
            imageUrlToBase64Part(imgData, imgMime),
            { text: "Visual mask (White = Target area, Black = Ignore):" },
            imageUrlToBase64Part(mData, mMime),
            { text: prompt },
          ],
        },
      ],
      config: {
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH" as HarmCategory, threshold: "BLOCK_NONE" as HarmBlockThreshold },
          { category: "HARM_CATEGORY_HARASSMENT" as HarmCategory, threshold: "BLOCK_NONE" as HarmBlockThreshold },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as HarmCategory, threshold: "BLOCK_NONE" as HarmBlockThreshold },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as HarmCategory, threshold: "BLOCK_NONE" as HarmBlockThreshold },
        ],
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (error) {
    console.warn("geminiAnalyzeBrushMask failed:", error);
    throw error;
  }
}

/**
 * Uses Gemini to analyze the user's intent on the canvas.
 * Optimized for RED DOT PROTOCOL.
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
  intent: CanvasIntent;
  enhancedPrompt: string;
  sourcePinIdx?: number;
  targetPinIdx?: number;
  swapType?: "identity" | "character" | "object";
  objectName?: string;
  suggestedScale?: number;
  bBox?: [number, number, number, number];
}> {
  if (!apiKey) return { intent: "edit", enhancedPrompt: userPrompt };

  const pinInfo = pins
    .map((p, idx) => `PIN ${idx + 1}: "${p.description || "no description"}" at [X: ${p.normalizedX.toFixed(2)}, Y: ${p.normalizedY.toFixed(2)}]`)
    .join(" | ");

  try {
    const client = getClient(apiKey);
    const parts: Part[] = [];

    if (imageBase64) {
      const { data, mimeType } = await resizeImageForGemini(imageBase64);
      parts.push(imageUrlToBase64Part(data, mimeType));
    }
    if (secondImageBase64) {
      const { data, mimeType } = await resizeImageForGemini(secondImageBase64);
      parts.push(imageUrlToBase64Part(data, mimeType));
    }
    
    // Add Surgical Crops for high-fidelity identification
    if (sourceCrop) {
      parts.push({ text: "SOURCE CROP (Zoom in on Pin 1):" });
      const { data, mimeType } = await resizeImageForGemini(sourceCrop);
      parts.push(imageUrlToBase64Part(data, mimeType));
    }
    if (targetCrop) {
      parts.push({ text: "TARGET CROP (Zoom in on Pin 2):" });
      const { data, mimeType } = await resizeImageForGemini(targetCrop);
      parts.push(imageUrlToBase64Part(data, mimeType));
    }

    const imagesCount = (imageBase64 ? 1 : 0) + (secondImageBase64 ? 1 : 0);

    parts.push({
      text: `Jesteś ekspertem-klasyfikatorem intencji dla edytora graficznego AI. Twoim celem jest chirurgiczne przeniesienie obiektu z zachowaniem fizyki i proporcji.
      
POLECENIE: "${userPrompt}"
LICZBA PINEZEK: ${pinCount}
PINEZKI I OPISY: ${pinInfo}
LICZBA OBRAZÓW: ${imagesCount}

### PROTOKÓŁ CZERWONEJ KROPKI (RED DOT PROTOCOL):
- Obrazy posiadają CZERWONE KROPKI (#FF0000) wskazujące na kluczowe obiekty lub miejsca.
- IMAGE 1 (Kadr źródłowy): Zawiera obiekt do pobrania pod CZERWONĄ KROPKĄ "1". To jest Twój wzorzec (BLUEPRINT).
- IMAGE 2 (Kadr docelowy): Zawiera tło/scenerię, gdzie należy wstawić obiekt pod CZERWONĄ KROPKĄ "2". To jest Twój ŚWIAT DOCELOWY.
- CROP: Dostarczono powiększenia okolic pinezek dla precyzyjnej identyfikacji.

### TWOJE ZADANIE:
1. IDENTYFIKACJA: Zidentyfikuj DOKŁADNIE jakie obiekty znajdują się pod CZERWONYMI KROPKAMI. Użyj CROPÓW dla detali.
2. ROLE: Szanuj etykiety użytkownika ("ŹRÓDŁO" / "CEL"). ZAWSZE generuj wynik na IMAGE 2.
3. SKALA I POZA: Nowy obiekt musi przejąć DOKŁADNIE taką samą pozę, kąt obrotu i orientację jak obiekt na IMAGE 2, który zastępuje.
4. PROTOKÓŁ: Wybierz odpowiedni protokół (A-F).

### FORMAT ODPOWIEDZI (6 linijek):
INTENT: <character_transfer | object_transfer | character_swap | object_swap | background_edit | remove_object | add_text | fusion | style_change | edit | generate | remove_bg>
SWAP_TYPE: <identity | character | object>
OBJECT_NAME: <nazwa obiektu po angielsku>
PROMPT: <Angielski prompt wg DIRECTOR'S PROTOCOL. Skup się na chirurgicznym dopasowaniu i zachowaniu tła.>
SOURCE_PIN: <1 lub 2>
TARGET_PIN: <1 lub 2>
SUGGESTED_BBOX: <[ymin, xmin, ymax, xmax] (0-1000 scale) na obrazie docelowym>`
    });

    const response = await client.models.generateContent({
      model: GEMINI_MAIN_MODEL,
      contents: [{ role: "user", parts }],
    });

    const result = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const intentMatch = result.match(/INTENT:\s*(\w+)/i);
    const swapTypeMatch = result.match(/SWAP_TYPE:\s*(\w+)/i);
    const objectNameMatch = result.match(/OBJECT_NAME:\s*(.+)/i);
    const promptMatch = result.match(/PROMPT:\s*(.+)/is);
    const sourceMatch = result.match(/SOURCE_PIN:\s*(\d+)/i);
    const targetMatch = result.match(/TARGET_PIN:\s*(\d+)/i);
    const bboxMatch = result.match(/SUGGESTED_BBOX:\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/i);

    let bBox: [number, number, number, number] | undefined = undefined;
    let suggestedScale = 0.35;
    if (bboxMatch) {
      const ymin = parseInt(bboxMatch[1], 10);
      const xmin = parseInt(bboxMatch[2], 10);
      const ymax = parseInt(bboxMatch[3], 10);
      const xmax = parseInt(bboxMatch[4], 10);
      bBox = [ymin, xmin, ymax, xmax];
      suggestedScale = (ymax - ymin) / 1000;
    }

    return {
      intent: (intentMatch?.[1]?.toLowerCase() || "edit") as CanvasIntent,
      swapType: swapTypeMatch?.[1]?.toLowerCase() as any,
      objectName: objectNameMatch?.[1]?.trim(),
      enhancedPrompt: promptMatch?.[1]?.trim(),
      sourcePinIdx: sourceMatch ? parseInt(sourceMatch[1], 10) : undefined,
      targetPinIdx: targetMatch ? parseInt(targetMatch[1], 10) : undefined,
      suggestedScale,
      bBox
    };
  } catch (error) {
    console.warn("geminiAnalyzeCanvasIntent failed:", error);
    return { intent: "edit", enhancedPrompt: userPrompt };
  }
}
