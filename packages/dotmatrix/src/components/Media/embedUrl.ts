export type MediaKind = "image" | "video" | "youtube" | "vimeo";

const YOUTUBE_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/;
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;
const VIDEO_EXTENSION = /\.(mp4|webm|ogg)(\?.*)?$/i;

/** Sniffs a `src` string to decide which element `Media` renders — never a prop the caller sets by hand, so a plain URL is always enough. */
export function detectMediaKind(src: string): MediaKind {
  if (YOUTUBE_PATTERN.test(src)) return "youtube";
  if (VIMEO_PATTERN.test(src)) return "vimeo";
  if (VIDEO_EXTENSION.test(src)) return "video";
  return "image";
}

/** YouTube/Vimeo watch-page URLs aren't embeddable as-is — this extracts the video ID and rebuilds the dedicated embed/no-cookie form. Falls back to `src` unchanged if the ID can't be found (e.g. an already-correct embed URL). */
export function toEmbedUrl(src: string, kind: MediaKind): string {
  if (kind === "youtube") {
    const id = src.match(YOUTUBE_PATTERN)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : src;
  }
  if (kind === "vimeo") {
    const id = src.match(VIMEO_PATTERN)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : src;
  }
  return src;
}
