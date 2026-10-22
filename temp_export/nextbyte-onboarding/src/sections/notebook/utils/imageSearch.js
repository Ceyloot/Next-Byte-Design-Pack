const cache = new Map();

export async function searchPexelsImage(apiKey, query) {
  if (!apiKey || !query) return null;

  const cacheKey = query.toLowerCase().trim();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const photo = data.photos?.[0];
    if (!photo) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = {
      url: photo.src.medium,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url,
    };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Pexels search failed:', err);
    return null;
  }
}
