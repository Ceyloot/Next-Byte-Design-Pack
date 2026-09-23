/**
 * Sanitization utilities for handling Unicode escape sequences and large data URLs
 * to prevent database errors when saving chat messages.
 */

/**
 * Sanitizes a string to remove problematic Unicode sequences
 */
export const sanitizeUnicodeString = (str: string): string => {
  if (!str || typeof str !== 'string') return str;

  let sanitized = str;

  // Remove null bytes
  sanitized = sanitized.replace(/\u0000/g, '');

  // Convert \u{XXXX} sequences to actual characters
  sanitized = sanitized.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return '';
    }
  });

  // Double "bare" backslashes that aren't valid JSON escapes
  sanitized = sanitized.replace(/\\(?![\\/"bfnrtu])/g, '\\\\');

  // Double \u without 4 hex digits
  sanitized = sanitized.replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u');

  return sanitized;
};

/**
 * Recursively sanitizes all string values in an object
 */
export const sanitizeJsonValue = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeUnicodeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeJsonValue(item));
  }

  if (typeof value === 'object') {
    const sanitized: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeJsonValue(value[key]);
      }
    }
    return sanitized;
  }

  return value;
};

/**
 * Trims large base64 data URLs in metadata to prevent database payload size issues
 * Large images (>250KB) are replaced with metadata about the image
 */
export const trimLargeDataUrlsInMetadata = (metadata: any): any => {
  if (!metadata || typeof metadata !== 'object') {
    return metadata;
  }

  const trimmed = { ...metadata };
  const MAX_DATA_URL_SIZE = 250 * 1024; // 250 KB

  // Check if metadata.image.url exists and is a large data URL
  if (
    trimmed.image?.url &&
    typeof trimmed.image.url === 'string' &&
    trimmed.image.url.startsWith('data:')
  ) {
    const dataUrlLength = trimmed.image.url.length;

    if (dataUrlLength > MAX_DATA_URL_SIZE) {
      console.log(`🔧 Trimming large image data URL (${(dataUrlLength / 1024).toFixed(0)} KB)`);

      // Extract format from data URL (e.g., "image/png")
      const formatMatch = trimmed.image.url.match(/^data:(image\/[^;]+);/);
      const format = formatMatch ? formatMatch[1] : trimmed.image.format || 'image/png';

      // Get first 120 chars as preview (without full payload)
      const preview = trimmed.image.url.substring(0, 120) + '...';

      // Replace with metadata instead of full base64
      trimmed.image = {
        hasImage: true,
        stored: 'omitted_base64_for_db',
        approxSize: dataUrlLength,
        format: format,
        prompt: trimmed.image.prompt || undefined,
        preview: preview
      };

      console.log(`✅ Image data trimmed: ${format}, original size: ${(dataUrlLength / 1024).toFixed(0)} KB`);
    }
  }

  return trimmed;
};

/**
 * Full sanitization pipeline for message data before database insert
 */
export const sanitizeMessageData = (content: string, metadata: any) => {
  return {
    content: sanitizeUnicodeString(content),
    metadata: trimLargeDataUrlsInMetadata(sanitizeJsonValue(metadata || {}))
  };
};
