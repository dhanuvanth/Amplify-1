/** YouTube watch / short / embed URLs → iframe embed src, or null. */
export function parseYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

/** Treat URL as an image demo when it is not YouTube and the path ends with a common raster/vector extension. */
export function isLikelyImageDemoUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || parseYoutubeEmbedUrl(trimmed)) return false;
  try {
    const u = new URL(trimmed);
    const last = u.pathname.split('/').pop() ?? '';
    const base = last.split(/[?#]/)[0];
    return /\.(jpe?g|png|gif|webp|avif|svg|bmp|heic|heif)$/i.test(base);
  } catch {
    return false;
  }
}

export type DemoMediaPresentationKind = 'youtube' | 'image' | 'video';

export function getDemoMediaPresentationKind(url: string): DemoMediaPresentationKind {
  if (parseYoutubeEmbedUrl(url)) return 'youtube';
  if (isLikelyImageDemoUrl(url)) return 'image';
  return 'video';
}
