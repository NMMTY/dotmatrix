"use client";

import { useEffect, useRef, useState } from "react";
import { crossHatch } from "../../modules/dither/crosshatch";
import { useLoadedImage } from "../../modules/dither/useLoadedImage";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./CrossHatch.module.scss";

export interface CrossHatchOwnProps {
  src: string;
  /** Required — the canvas this renders as has no text of its own. */
  alt: string;
  /** Defaults to the image's natural size once loaded. */
  width?: number;
  height?: number;
  /** Grid spacing in source pixels. @default 8 */
  cellSize?: number;
  /** Stroke width in canvas pixels. @default 1 */
  lineWidth?: number;
  /** @default false */
  invert?: boolean;
  className?: string;
}

/**
 * A classic engraving cross-hatch: runs an image through {@link crossHatch}
 * and strokes the resulting line segments to a canvas — light cells get a
 * single diagonal, the darkest cells get all four directions woven
 * together. Ink color is read from the canvas's own computed `color` at
 * draw time, same as `Halftone`.
 */
export function CrossHatch({
  src,
  alt,
  width,
  height,
  cellSize = 8,
  lineWidth = 1,
  invert = false,
  className,
}: CrossHatchOwnProps) {
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

    const lines = crossHatch(
      { data: imageData.data, width: size.w, height: size.h },
      { cellSize, invert },
    );

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.lineWidth = lineWidth;
    for (const line of lines) {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }
  }, [size, imageRef, cellSize, lineWidth, invert]);

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
