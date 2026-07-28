// Canvas-based effects (Dither, Halftone) can only read pixels back out of
// an image the server grants CORS on — most hotlinked images grant none, so
// an untouched external URL silently degrades to a plain <img>. Routing
// through our own /api/image-proxy makes this site the image's origin, which
// sidesteps that for the live Playground preview specifically.
const COMPONENTS_NEEDING_IMAGE_PROXY = new Set(["Dither", "Halftone"]);

export function componentNeedsImageProxy(componentName: string): boolean {
  return COMPONENTS_NEEDING_IMAGE_PROXY.has(componentName);
}

export function toProxiedImageSrc(src: string): string {
  if (!/^https?:\/\//i.test(src)) return src; // relative, data:, or blob: — already same-origin-safe

  if (typeof window !== "undefined") {
    try {
      if (new URL(src).origin === window.location.origin) return src;
    } catch {
      return src;
    }
  }

  return `/api/image-proxy?url=${encodeURIComponent(src)}`;
}
