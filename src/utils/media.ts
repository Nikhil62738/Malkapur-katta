/** Reliable image CDN — deterministic seed = same image every time */
export function imageUrl(seed: string, width = 800, height = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

export const FALLBACK_IMAGE = imageUrl('malkapur-fallback', 800, 600);

/** Original hero — city skyline (Unsplash) */
export const HERO_BACKGROUND =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80&auto=format&fit=crop';
