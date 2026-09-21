
/**
 * Extracts the YouTube Video ID from a given URL.
 * Supports various formats: watch URLs, shorts, embed, shared links, etc.
 */
export function extractPlaylistId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.searchParams.get('list') || null;
  } catch { return null; }
}

export async function fetchPlaylistVideoIds(playlistId, apiKey) {
  const ids = [];
  let playlistTitle = 'Playlista';

  if (apiKey) {
    try {
      const metaRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.items && metaData.items[0]) {
          playlistTitle = metaData.items[0].snippet.title;
        }
      }

      let pageToken = '';
      do {
        const params = new URLSearchParams({ part: 'contentDetails', playlistId, maxResults: '50', key: apiKey });
        if (pageToken) params.set('pageToken', pageToken);
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `YouTube API error: ${res.status}`);
        }
        const data = await res.json();
        for (const item of data.items || []) {
          const vid = item.contentDetails?.videoId;
          if (vid) ids.push(vid);
        }
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      return { ids, title: playlistTitle };
    } catch (err) {
      console.warn('YouTube API fetch failed, falling back to scraping', err);
    }
  }

  // Fallback: Scrape the playlist page via CORS proxies
  try {
    const targetUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const html = await fetchWithProxy(targetUrl);
    
    const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/) || html.match(/<title>(.*?)<\/title>/);
    if (titleMatch && titleMatch[1]) {
      const extractedTitle = titleMatch[1].trim();
      if (extractedTitle !== 'YouTube') {
        playlistTitle = extractedTitle;
      }
    }

    // Find ytInitialData
    const regex = /var\s+ytInitialData\s*=\s*({.+?});/s;
    let match = html.match(regex);
    if (!match) {
      // Try alternative regex
      const altRegex = /ytInitialData\s*=\s*({.+?});/s;
      match = html.match(altRegex);
    }

    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const videoIds = new Set();
      
      // Recursive extraction
      function findVideoIds(obj) {
        if (!obj) return;
        if (Array.isArray(obj)) {
          obj.forEach(findVideoIds);
        } else if (typeof obj === 'object') {
          if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.videoId) {
            videoIds.add(obj.playlistVideoRenderer.videoId);
          } else {
            for (let key in obj) {
              findVideoIds(obj[key]);
            }
          }
        }
      }
      
      findVideoIds(data);
      if (videoIds.size > 0) {
        return { ids: Array.from(videoIds), title: playlistTitle };
      }
    }
  } catch (scrapeErr) {
    console.error('Playlist scraping failed:', scrapeErr);
  }

  if (ids.length > 0) return { ids, title: playlistTitle };
  throw new Error('Nie udało się pobrać filmów z playlisty. Wprowadź klucz API YouTube w ustawieniach lub upewnij się, że playlista jest publiczna.');
}

export function extractVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Formats a duration in seconds into a readable string (e.g., "02:15" or "1:04:10").
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Removes adjacent duplicate word sequences (phrases) from text.
 */
function removeDuplicates(text) {
  if (!text) return '';
  const words = text.split(/\s+/);
  const result = [];
  
  let i = 0;
  while (i < words.length) {
    let matchedLength = 0;
    
    // Check lengths from 1 to 15 words
    for (let len = 1; len <= 15; len++) {
      if (i + len * 2 <= words.length) {
        let match = true;
        for (let k = 0; k < len; k++) {
          const wordA = words[i + k].toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
          const wordB = words[i + len + k].toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
          if (wordA !== wordB) {
            match = false;
            break;
          }
        }
        if (match) {
          matchedLength = len;
          break;
        }
      }
    }
    
    if (matchedLength > 0) {
      for (let k = 0; k < matchedLength; k++) {
        result.push(words[i + k]);
      }
      i += matchedLength * 2;
    } else {
      result.push(words[i]);
      i++;
    }
  }
  return result.join(' ');
}

/**
 * Clean nested duplicates via multiple passes.
 */
export function cleanRepeatingText(text) {
  let current = text;
  let prev = '';
  for (let pass = 0; pass < 3; pass++) {
    prev = current;
    current = removeDuplicates(current);
    if (current === prev) break;
  }
  return current;
}

/**
 * Fetches video metadata officially using YouTube Data API v3.
 */
async function fetchMetadataFromApi(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error (Status: ${response.status})`);
  }
  const data = await response.json();
  const item = data.items?.[0];
  if (!item) {
    throw new Error('Nie znaleziono filmu o podanym ID w YouTube API.');
  }

  // Parse ISO 8601 duration (e.g. PT15M33S or PT1H2M10S)
  const durationStr = item.contentDetails?.duration || '';
  let durationSeconds = 0;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);
    durationSeconds = hours * 3600 + minutes * 60 + seconds;
  }

  return {
    title: item.snippet?.title || 'Nieznany tytuł',
    author: item.snippet?.channelTitle || 'Nieznany autor',
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
    duration: durationSeconds
  };
}

/**
 * Helper to fetch content via multiple CORS proxies as fallbacks.
 */
export async function fetchWithProxy(targetUrl) {
  const proxies = [
    // 1. corsproxy.io
    async (url) => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`Corsproxy status: ${res.status}`);
      return await res.text();
    },
    // 2. Codetabs proxy
    async (url) => {
      const res = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`Codetabs status: ${res.status}`);
      return await res.text();
    },
    // 3. AllOrigins RAW
    async (url) => {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`AllOrigins status: ${res.status}`);
      return await res.text();
    },
  ];

  let lastError = null;
  for (const fetchFn of proxies) {
    try {
      const text = await fetchFn(targetUrl);
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err) {
      console.warn("Proxy attempt failed:", err);
      lastError = err;
    }
  }
  throw lastError || new Error("Wszystkie serwery proxy CORS zawiodły.");
}

/**
 * Fetches the YouTube transcript using the public youtube-transcript.ai API.
 * This is very stable and CORS-friendly.
 */
async function fetchTranscriptFromApi(videoId) {
  const targetUrl = `https://youtube-transcript.ai/transcript/${videoId}.txt`;
  let text = '';
  
  // Try fetching directly first
  try {
    const res = await fetch(targetUrl);
    if (res.ok) {
      text = await res.text();
      console.log("🟢 [SUKCES] Transkrypcja pobrana BEZPOŚREDNIO z API youtube-transcript.ai!");
    }
  } catch (err) {
    console.warn("⚠️ Bezpośrednie pobranie z API zablokowane przez CORS, próba użycia zewnętrznego proxy...", err);
  }
  
  // Fallback to fetching via proxy if direct fetch fails
  if (!text) {
    text = await fetchWithProxy(targetUrl);
    console.log("🟡 [SUKCES] Transkrypcja pobrana z API youtube-transcript.ai za pomocą zewnętrznego proxy CORS!");
  }

  if (!text || !text.includes('Transcript:')) {
    throw new Error('Nieprawidłowa odpowiedź z API transkrypcji.');
  }

  // Parse Title
  let title = 'Nieznany tytuł';
  const titleMatch = text.match(/# Transcript:\s*(.+)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Parse duration
  let duration = 0;
  const durationMatch = text.match(/Duration:\s*(\d+):(\d+)/);
  if (durationMatch) {
    duration = parseInt(durationMatch[1], 10) * 60 + parseInt(durationMatch[2], 10);
  }

  // Parse lines into transcript blocks
  const transcript = [];
  const lines = text.split('\n');
  
  // Matches timestamps like [0:47] or [12:34] or [1:02:15] followed by text
  const timestampRegex = /^\[([\d:]+)\]\s*(.+)/;
  
  for (const line of lines) {
    const match = line.trim().match(timestampRegex);
    if (match) {
      const timeParts = match[1].split(':').map(Number);
      let start = 0;
      
      if (timeParts.length === 2) {
        start = timeParts[0] * 60 + timeParts[1]; // mm:ss
      } else if (timeParts.length === 3) {
        start = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]; // hh:mm:ss
      }
      
      const content = match[2].trim();

      // Clean up text (replace HTML entities like &gt; or &lt;)
      const cleanedText = content
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
      };

      const deduplicated = cleanRepeatingText(cleanedText);
      transcript.push({
        text: deduplicated,
        start,
        duration: 4, // average guess duration
        timeStr: formatTime(start)
      });
    }
  }

  const rawText = transcript.map(t => `[${t.timeStr}] ${t.text}`).join('\n');

  return {
    videoId,
    title,
    author: 'YouTube Video',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration,
    transcript,
    rawText,
    hasTranscript: transcript.length > 0
  };
}

/**
 * Fetches the YouTube transcript and video metadata via the backend server.
 * Backend tries youtube-transcript.ai first, then YouTube timedtext API directly.
 */
export async function fetchYoutubeTranscript(videoUrl, youtubeApiKey = '') {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Nieprawidłowy adres URL filmu YouTube.');
  }

  const params = new URLSearchParams({ videoUrl });
  if (youtubeApiKey) params.set('youtubeApiKey', youtubeApiKey);
  const res = await fetch(`/api/transcript?${params}`);
  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.rawText || data.hasTranscript)) return data;
  throw new Error(data.error || `Błąd serwera ${res.status}`);
}
