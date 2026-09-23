/**
 * Mapowanie jakości (1K / 2K / 4K) → model Runware.
 *
 * Reguły (zgodnie z dokumentacją Runware i decyzją produktową):
 *  - Nano Banana (Flash, google:4@1) → tylko 1K natywnie.
 *  - Nano Banana Pro (google:4@2)    → 2K natywnie + 4K (model obsługuje
 *    rozdzielczości do ~4MP, np. 2752×1536).
 *  - Pozostałe modele (FLUX, SDXL, Ideogram itp.) → tylko 1K natywnie.
 *
 * Mnożnik kosztu Byte:
 *   1K = ×1, 2K = ×1.5, 4K = ×2 (round-up).
 *
 * Mnożnik wymiarów (skalowanie sweet-spotu modelu):
 *   1K = ×1, 2K = ×1.5, 4K = ×2.
 */

export type QualityTier = '1k' | '2k' | '4k';

interface ModelLike {
  model_id?: string | null;
  name?: string | null;
}

export interface QualityTierConfig {
  tier: QualityTier;
  label: string;
  description: string;
  byteMultiplier: number;
  dimensionMultiplier: number;
}

export const QUALITY_TIERS: Record<QualityTier, QualityTierConfig> = {
  '1k': {
    tier: '1k',
    label: '1K',
    description: 'Szybko · Standardowa rozdzielczość',
    byteMultiplier: 1,
    dimensionMultiplier: 1,
  },
  '2k': {
    tier: '2k',
    label: '2K',
    description: 'Zbalansowane · Wyższa jakość',
    byteMultiplier: 1.5,
    // ×2 (a nie ×1.5) — chcemy podwoić każdy bok względem bazy 1K, żeby
    // backend trafił w próg 2K w `googleProAllowedDimensions` (np. 2048²).
    dimensionMultiplier: 2,
  },
  '4k': {
    tier: '4k',
    label: '4K',
    description: 'Ultra · Maksymalna jakość',
    byteMultiplier: 2,
    // ×4 — czterokrotne zwiększenie boku względem bazy 1K (4096² zamiast
    // 2048², ×16 powierzchni). Backend ma w tabeli 4K wpisy 4096×3072 itd.
    dimensionMultiplier: 4,
  },
};

/**
 * Zwraca listę jakości obsługiwanych natywnie przez dany model.
 */
export function getQualityTiersForModel(model?: ModelLike | null): QualityTier[] {
  if (!model) return ['1k'];
  const id = (model.model_id || '').toLowerCase();
  const name = (model.name || '').toLowerCase();
  const blob = `${id} ${name}`;

  // Nano Banana Pro i Nano Banana 2 — natywnie 1K/2K/4K (docs Runware; do
  // 03.09.2026 NB2 miało tu tylko 1K, a edge i tak wysyłał je do tabeli Flash).
  if (
    id === 'google:4@2' ||
    id === 'google:4@3' ||
    blob.includes('nano banana pro') ||
    blob.includes('nano-banana-pro') ||
    blob.includes('gemini-3-pro-image') ||
    blob.includes('gemini 3 pro image') ||
    blob.includes('nano banana 2')
  ) {
    return ['1k', '2k', '4k'];
  }

  // xAI Grok Imagine — Runware oferuje tier 1K i 2K.
  if (id.startsWith('xai:') || blob.includes('grok-imagine') || blob.includes('grok imagine')) {
    return ['1k', '2k'];
  }

  /* Modele z profilu Runware (research 03.09.2026, `_shared/profile-modeli-runware.ts`):
     Kling O3 ma natywne 4K; Ideogram 4.0 TYLKO 2K; FLUX.2 Pro, Seedream 5.0 Pro,
     Qwen 3.0 Pro, FLUX.2 Klein i Z-Image — 1K i 2K. */
  if (id.startsWith('klingai:kling-image@o3')) return ['1k', '2k', '4k'];
  if (id === 'ideogram:4@0') return ['2k'];
  if (
    id === 'bfl:5@1' ||
    id.startsWith('bytedance:seedream@5') ||
    id.startsWith('alibaba:qwen-image@3') ||
    id === 'runware:400@2' ||
    id === 'runware:z-image@turbo'
  ) {
    return ['1k', '2k'];
  }

  // Nano Banana (Flash) i wszystkie pozostałe — tylko 1K natywnie
  return ['1k'];
}

/**
 * Skaluje wymiary (width/height) o mnożnik dla danej jakości.
 * Zaokrągla do najbliższej wielokrotności 8 (wymóg większości modeli Runware).
 */
export function scaleDimensionsForQuality(
  width: number,
  height: number,
  tier: QualityTier,
): { width: number; height: number } {
  const mult = QUALITY_TIERS[tier].dimensionMultiplier;
  const round8 = (n: number) => Math.round((n * mult) / 8) * 8;
  return { width: round8(width), height: round8(height) };
}

/**
 * Skaluje koszt Byte o mnożnik jakości. Round-up żeby nie tracić Byte na ułamkach.
 * Używane jako fallback gdy model nie ma ustawionych dedykowanych cen 1K/2K/4K.
 */
export function scaleByteCostForQuality(baseCost: number, tier: QualityTier): number {
  return Math.ceil(baseCost * QUALITY_TIERS[tier].byteMultiplier);
}

/**
 * Zwraca koszt Byte dla danej jakości — preferuje wartości ustawione w panelu
 * admina (`byte_cost_1k/2k/4k`), spada do skalowania bazowego `byte_cost`
 * jeśli admin nie ustawił dedykowanej ceny.
 */
export function getModelCostForQuality(
  model: {
    byte_cost?: number | null;
    byte_cost_1k?: number | null;
    byte_cost_2k?: number | null;
    byte_cost_4k?: number | null;
  } | null | undefined,
  tier: QualityTier,
): number {
  if (!model) return 0;
  const direct =
    tier === '1k'
      ? model.byte_cost_1k
      : tier === '2k'
        ? model.byte_cost_2k
        : model.byte_cost_4k;
  if (typeof direct === 'number' && direct > 0) return direct;
  return scaleByteCostForQuality(model.byte_cost ?? 0, tier);
}
