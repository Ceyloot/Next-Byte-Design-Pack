/**
 * Mask & Image Processing Utilities for Canvas
 * Inspired by Loomic & NextByteArt surgical protocols.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function stripDataUrl(dataUrl: string): { data: string; base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2], base64: match[2] };
  }
  return { mimeType: 'image/png', data: dataUrl, base64: dataUrl };
}

export async function toBase64(src: string): Promise<string> {
  if (src.startsWith('data:')) return src;
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Crops a square area around a normalized coordinate (normX, normY)
 * to provide a high-res surgical zoom for vision models and UI thumbnails.
 */
export async function cropImageAtPoint(
  imageSrc: string,
  normX: number,
  normY: number,
  cropSize = 512
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

      const centerX = normX * img.naturalWidth;
      const centerY = normY * img.naturalHeight;

      // Desired sample window on source image (~25% of image width)
      const windowSize = Math.max(128, Math.min(img.naturalWidth, img.naturalHeight) * 0.28);
      const halfWin = windowSize / 2;

      let srcX = centerX - halfWin;
      let srcY = centerY - halfWin;

      // Clamp within source bounds
      srcX = Math.max(0, Math.min(img.naturalWidth - windowSize, srcX));
      srcY = Math.max(0, Math.min(img.naturalHeight - windowSize, srcY));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, srcX, srcY, windowSize, windowSize, 0, 0, cropSize, cropSize);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

/**
 * Creates an inpainting mask at a specific local pixel coordinate.
 * White (#FFFFFF) = area to inpaint/regenerate.
 * Black (#000000) = preserved area.
 */
export function createBlobMaskAtPoint(
  width: number,
  height: number,
  localX: number,
  localY: number,
  radiusX: number,
  radiusY: number,
  feather = 15
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background is solid black (preserve)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Soft feathered gradient for target area
  const rad = Math.max(radiusX, radiusY);
  const grad = ctx.createRadialGradient(localX, localY, Math.max(0, rad - feather), localX, localY, rad);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.85, '#FFFFFF');
  grad.addColorStop(1, '#000000');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(localX, localY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

/**
 * Dual-Mask Generator for Object Relocation / Transfer:
 * Zone 1 (Source): White mask with background healing instruction
 * Zone 2 (Target): White mask with object injection instruction
 */
export function createDualTransferMask(
  width: number,
  height: number,
  sourceNorm: { x: number; y: number },
  targetNorm: { x: number; y: number },
  scaleFactor = 0.22
): { combinedMask: string; sourceMask: string; targetMask: string } {
  const srcX = sourceNorm.x * width;
  const srcY = sourceNorm.y * height;
  const tgtX = targetNorm.x * width;
  const tgtY = targetNorm.y * height;

  const radX = width * scaleFactor;
  const radY = height * scaleFactor;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Combined mask
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Draw Source Blob
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(srcX, srcY, radX, radY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Target Blob
  ctx.beginPath();
  ctx.ellipse(tgtX, tgtY, radX, radY, 0, 0, Math.PI * 2);
  ctx.fill();

  const combinedMask = canvas.toDataURL('image/png');

  // 2. Source only
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(srcX, srcY, radX, radY, 0, 0, Math.PI * 2);
  ctx.fill();
  const sourceMask = canvas.toDataURL('image/png');

  // 3. Target only
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(tgtX, tgtY, radX, radY, 0, 0, Math.PI * 2);
  ctx.fill();
  const targetMask = canvas.toDataURL('image/png');

  return { combinedMask, sourceMask, targetMask };
}
