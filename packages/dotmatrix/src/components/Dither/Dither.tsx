"use client";

import { useEffect, useRef, useState } from "react";
import type { DitherAlgorithm } from "../../modules/dither/dither";
import { runDither } from "../../modules/dither/runDither";
import { useLoadedImage } from "../../modules/dither/useLoadedImage";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./Dither.module.scss";

export interface DitherOwnProps {
  src: string;
  /** Required — the canvas this renders as has no text of its own. */
  alt: string;
  /** Defaults to the image's natural size once loaded. */
  width?: number;
  height?: number;
  /** @default "floyd-steinberg" */
  algorithm?: DitherAlgorithm;
  /** @default 2 */
  levels?: number;
  /** @default false */
  invert?: boolean;
  /** Downsample factor before dithering — bigger is chunkier. @default 2 */
  pixelSize?: number;
  className?: string;
}

/**
 * Runs an image through {@link runDither} and paints it to a canvas at a
 * deliberately reduced resolution (`pixelSize`), stretched back up via CSS
 * with `image-rendering: pixelated` — that stretch, not a second manual
 * redraw, is what turns the dithered result blocky.
 *
 * Doubles as its own SSR-safe placeholder: server-rendered output is either
 * an empty sized `<canvas>` (when `width`/`height` are given) or a
 * `Skeleton` (when they're not, since the size isn't known yet) — the real
 * draw only happens client-side, after mount.
 */
export function Dither({
  src,
  alt,
  width,
  height,
  algorithm = "floyd-steinberg",
  levels = 2,
  invert = false,
  pixelSize = 2,
  className,
}: DitherOwnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imageRef, size, error } = useLoadedImage(src, width, height);
  const [drawError, setDrawError] = useState(false);

  // Runs once `size` is set (also the render that mounts <canvas>), so
  // canvasRef.current is guaranteed non-null — see useLoadedImage's docstring.
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!size || !img || !canvas) return;

    let cancelled = false;

    (async () => {
      const bufferWidth = Math.max(1, Math.round(size.w / pixelSize));
      const bufferHeight = Math.max(1, Math.round(size.h / pixelSize));

      const sampling = document.createElement("canvas");
      sampling.width = bufferWidth;
      sampling.height = bufferHeight;
      const samplingCtx = sampling.getContext("2d");
      if (!samplingCtx) {
        setDrawError(true);
        return;
      }
      // Smoothed downsample so each output pixel averages its source region
      // rather than sampling one point — an aliased downsample would
      // amplify noise the source never had.
      samplingCtx.imageSmoothingEnabled = true;
      samplingCtx.drawImage(img, 0, 0, bufferWidth, bufferHeight);

      let imageData: ImageData;
      try {
        imageData = samplingCtx.getImageData(0, 0, bufferWidth, bufferHeight);
      } catch {
        // Tainted canvas — no/failed CORS on `src`. Degrade to the plain
        // image rather than a permanently blank canvas.
        if (!cancelled) setDrawError(true);
        return;
      }

      const result = await runDither(
        { data: imageData.data, width: bufferWidth, height: bufferHeight },
        { algorithm, levels, invert },
      );
      if (cancelled) return;

      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setDrawError(true);
        return;
      }
      // Copies into a fresh `Uint8ClampedArray` rather than passing
      // `result.data` directly: TS types ImageData's constructor as
      // ArrayBuffer-only vs. the array's ArrayBufferLike, a type-only
      // mismatch (dither() never produces SharedArrayBuffer) this avoids
      // without a cast that could paper over a real one.
      ctx.putImageData(
        new ImageData(new Uint8ClampedArray(result.data), result.width, result.height),
        0,
        0,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [size, imageRef, algorithm, levels, invert, pixelSize]);

  if (error || drawError) {
    return (
      <img
        src={src}
        alt={alt}
        width={size?.w}
        height={size?.h}
        className={[styles.fallback, className].filter(Boolean).join(" ")}
      />
    );
  }

  if (!size) {
    return <Skeleton width="full" height="160" className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={[styles.canvas, className].filter(Boolean).join(" ")}
      style={{ width: size.w, height: size.h }}
    />
  );
}
