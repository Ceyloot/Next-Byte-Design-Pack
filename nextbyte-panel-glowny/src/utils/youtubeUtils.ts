// YouTube utility functions

export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // If it's already a video ID (11 characters), return it
  if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const createYouTubeEmbedUrl = (videoId: string, isUnlisted: boolean = false): string => {
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    showinfo: '0',
  });
  
  if (isUnlisted) {
    params.set('origin', window.location.origin);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

export const createYouTubeWatchUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null;
};

export const isYouTubeVideoId = (str: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(str);
};