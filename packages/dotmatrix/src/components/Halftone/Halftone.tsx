"use client";

import { useEffect, useRef, useState } from "react";
import { halftone } from "../../modules/dither/halftone";
import { useLoadedImage } from "../../modules/dither/useLoadedImage";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./Halftone.module.scss";

export interface HalftoneOwnProps {
  src: string;
  /** Required — the canvas this renders as has no text of its own. */
  alt: string;
  /** Defaults to the image's natural size once loaded. */
  width?: number;
  height?: number;
  /** Dot grid spacing in source pixels. @default 8 */
  cellSize?: number;
  /** Largest dot radius, as a fraction of `cellSize / 2`. @default 0.95 */
  maxRadius?: number;
  /** @default false */
  invert?: boolean;
  className?: string;
}

/**
 * A classic halftone screen — variable-radius dots instead of dither's
 * per-pixel on/off pattern. Ink color is read from the canvas's own
 * computed `color` at draw time (so it follows theme/scheme like any other
 * text), not hardcoded and not passed through canvas's `"currentColor"`
 * fillStyle keyword — that keyword has real support in modern engines, but
 * reading the resolved computed style directly doesn't depend on it working
 * the same way everywhere.
 */
export function Halftone({
  src,
  alt,
  width,
  height,
  cellSize = 8,
  maxRadius = 0.95,
  invert = false,
  className,
}: HalftoneOwnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imageRef, size, error } = useLoadedImage(src, width, height);
  const [drawError, setDrawError] = useState(false);

  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!size || !img || !canvas) return;

    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDrawError(true);
      return;
    }

    ctx.drawImage(img, 0, 0, size.w, size.h);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, size.w, size.h);
    } catch {
      // Tainted canvas — no/failed CORS on `src`.
      setDrawError(true);
      return;
    }

    const dots = halftone(
      { data: imageData.data, width: size.w, height: size.h },
      { cellSize, maxRadius, invert },
    );

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = getComputedStyle(canvas).color;
    for (const dot of dots) {
      if (dot.radius <= 0) continue;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, imageRef, cellSize, maxRadius, invert]);

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
