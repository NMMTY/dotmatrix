"use client";

import { useEffect, useRef, useState } from "react";

export interface LoadedImageSize {
  w: number;
  h: number;
}

/**
 * Loads `src` into an offscreen `HTMLImageElement` and resolves its display
 * size (from `width`/`height`, else natural dimensions once loaded). Shared
 * by Dither and Halftone for a sequencing reason: `size` going non-null is
 * also the render that first mounts the caller's `<canvas>`, so a caller's
 * draw effect should depend on `size` rather than the load event directly —
 * otherwise it can race the canvas into existing.
 */
export function useLoadedImage(src: string, width?: number, height?: number) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [size, setSize] = useState<LoadedImageSize | null>(
    width && height ? { w: width, h: height } : null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    imageRef.current = null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      setSize({ w: width ?? img.naturalWidth, h: height ?? img.naturalHeight });
    };
    img.onerror = () => {
      if (!cancelled) setError(true);
    };

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, width, height]);

  return { imageRef, size, error };
}
