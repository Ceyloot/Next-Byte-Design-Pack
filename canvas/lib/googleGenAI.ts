/**
 * Google GenAI Native Client for Canvas
 * Direct implementation of Google Gemini Nano-Banana models family.
 * Supports:
 * - gemini-2.5-flash-image (Nano Banana)
 * - gemini-3.1-flash-image-preview (Nano Banana 2)
 * - gemini-3-pro-image-preview (Nano Banana Pro)
 * Includes direct browser-compatible REST fallback for zero-dependency execution.
 */

import { stripDataUrl } from './maskUtils';

export interface ModelInfo {
  id: string;
  displayName: string;
  description: string;
  tag: string;
}

export const NANO_BANANA_MODELS: ModelInfo[] = [
  {
    id: 'gemini-3.1-flash-image-preview',
    displayName: 'Nano Banana 2',
    description: 'Najnowszy, najszybszy model Google Gemini 3.1. Doskonała precyzja przestrzenna i kompozycja.',
    tag: 'ZALECANY'
  },
  {
    id: 'gemini-2.5-flash-image',
    displayName: 'Nano Banana',
    description: 'Stabilny model generowania i edycji obrazów Google Gemini 2.5 Flash Image.',
    tag: 'STABILNY'
  },
  {
    id: 'gemini-3-pro-image-preview',
    displayName: 'Nano Banana Pro',
    description: 'Najwyższa rozdzielczość (do 4K) i zaawansowane rozumowanie wizualne.',
    tag: 'ULTRA HD'
  }
];

export interface GenImageParams {
  apiKey: string;
  model?: string;
  prompt: string;
  inputImages?: string[]; // Array of Base64 or Data URLs
  maskImage?: string;     // Optional inpainting mask
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '3:2';
  quality?: 'standard' | 'hd' | 'ultra';
}

export interface GenImageResult {
  imageUrl: string;
  mimeType: string;
  modelUsed: string;
  durationMs: number;
}

/**
 * Execute native Google GenAI Image Generation / Editing
 */
export async function generateGoogleImage(params: GenImageParams): Promise<GenImageResult> {
  const {
    apiKey,
    model = 'gemini-3.1-flash-image-preview',
    prompt,
    inputImages = [],
    maskImage,
    aspectRatio = '1:1',
    quality = 'hd'
  } = params;

  if (!apiKey) {
    throw new Error('Wymagany jest klucz API Google Gemini. Wprowadź go w ustawieniach.');
  }

  const startTime = Date.now();
  const qualityMap = {
    standard: '1K',
    hd: '2K',
    ultra: '4K'
  };

  // Build multipart contents
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: prompt }
  ];

  // Attach input images
  for (const imgUrl of inputImages) {
    if (!imgUrl) continue;
    const { data, mimeType } = stripDataUrl(imgUrl);
    parts.push({
      inlineData: { mimeType, data }
    });
  }

  // Attach mask if provided
  if (maskImage) {
    const { data, mimeType } = stripDataUrl(maskImage);
    parts.push({
      text: 'Visual Inpainting Mask (White = Target area to modify/regenerate, Black = Strictly preserved pixels):'
    });
    parts.push({
      inlineData: { mimeType, data }
    });
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio,
        imageSize: qualityMap[quality] || '2K'
      }
    }
  };

  // Direct REST API Call to Google Generative Language
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Błąd serwera Google (${response.status})`;
    throw new Error(`Google GenAI Error: ${message}`);
  }

  const result = await response.json();
  const candidate = result.candidates?.[0];

  if (!candidate) {
    throw new Error('Google GenAI nie zwróciło żadnego rezultatu.');
  }

  // Extract generated image part
  const responseParts = candidate.content?.parts || [];
  let foundImage: { data: string; mimeType: string } | null = null;

  for (const part of responseParts) {
    if (part.inlineData) {
      foundImage = {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'image/png'
      };
      break;
    }
  }

  if (!foundImage) {
    // Check if model responded with text explaining a block or description
    const textPart = responseParts.find((p: any) => p.text)?.text;
    if (textPart) {
      throw new Error(`Model zwrócił odpowiedź tekstową zamiast obrazu: "${textPart.substring(0, 150)}..."`);
    }
    throw new Error('Nie odnaleziono wygenerowanego obrazu w odpowiedzi modelu.');
  }

  const imageUrl = `data:${foundImage.mimeType};base64,${foundImage.data}`;

  return {
    imageUrl,
    mimeType: foundImage.mimeType,
    modelUsed: model,
    durationMs: Date.now() - startTime
  };
}
