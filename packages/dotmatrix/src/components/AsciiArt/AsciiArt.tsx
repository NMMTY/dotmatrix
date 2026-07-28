"use client";

import { useEffect, useRef, useState } from "react";
import { asciiArt } from "../../modules/dither/ascii";
import { useLoadedImage } from "../../modules/dither/useLoadedImage";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./AsciiArt.module.scss";

export interface AsciiArtOwnProps {
  src: string;
  /** Required — the canvas this renders as has no text of its own. */
  alt: string;
  /** Defaults to the image's natural size once loaded. */
  width?: number;
  height?: number;
  /** Densest → sparsest character ramp; the first character renders for the darkest cells. @default "@%#*+=-:. " */
  charset?: string;
  /** Sampling cell size in source pixels — one character per cell. @default 8 */
  cellSize?: number;
  /** @default false */
  invert?: boolean;
  className?: string;
}

/**
 * The most literal reading of this system's "bitmap" identity: runs an
 * image through {@link asciiArt} and paints the resulting character grid to
 * a canvas, one glyph per sampling cell. Ink color is read from the canvas's
 * own computed `color` at draw time, same as `Halftone`.
 */
export function AsciiArt({
  src,
  alt,
  width,
  height,
  charset = "@%#*+=-:. ",
  cellSize = 8,
  invert = false,
  className,
}: AsciiArtOwnProps) {
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

    const cells = asciiArt(
      { data: imageData.data, width: size.w, height: size.h },
      { charset, cellSize, invert },
    );

    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = getComputedStyle(canvas).color;
    ctx.font = `${cellSize}px ${getComputedStyle(canvas).fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const cell of cells) {
      ctx.fillText(cell.char, cell.x, cell.y);
    }
  }, [size, imageRef, charset, cellSize, invert]);

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
