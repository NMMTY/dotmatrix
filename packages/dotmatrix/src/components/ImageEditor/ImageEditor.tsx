"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLoadedImage } from "../../modules/dither/useLoadedImage";
import type { StyleProps } from "../../system/types";
import { Button } from "../Button/Button";
import { Column } from "../Column/Column";
import { Flex } from "../Flex/Flex";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import { type Corner, centeredRect, moveRect, type Rect, resizeFromCorner } from "./cropMath";
import styles from "./ImageEditor.module.scss";

export interface ImageEditorAspectRatio {
  label: string;
  /** width / height. Omit for free-form (no ratio lock). */
  ratio?: number;
}

export interface ImageEditorFeatures {
  crop?: boolean;
  rotate?: boolean;
  flip?: boolean;
}

export interface ImageEditorResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ImageEditorOwnProps extends StyleProps {
  src: string;
  /** @default `{ crop: true, rotate: true, flip: true }` */
  features?: ImageEditorFeatures;
  /** @default Free, 1:1, 4:3, 16:9 */
  aspectRatios?: ImageEditorAspectRatio[];
  /** The saved result's MIME type. @default "image/png" */
  outputType?: string;
  onSave?: (result: ImageEditorResult) => void;
  onCancel?: () => void;
  /** Accessible label for the crop region. @default "Crop area" */
  label?: string;
  className?: string;
}

const DEFAULT_ASPECT_RATIOS: ImageEditorAspectRatio[] = [
  { label: "Free" },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "16:9", ratio: 16 / 9 },
];

const MIN_CROP_SIZE = 24;
const KEYBOARD_STEP = 4;
const KEYBOARD_STEP_LARGE = 20;

type DragState = { mode: "move" } | { mode: "resize"; corner: Corner };

/**
 * Crop/rotate/flip for a single image, rendered onto a canvas rather than
 * transformed with CSS — rotate and flip are baked into that canvas
 * immediately, so the crop box always operates on a plain upright image in
 * one consistent coordinate space, regardless of the current rotation. The
 * cost is that changing rotation or flip resets the crop box (there's no
 * sane way to carry a crop rect across a coordinate space it wasn't drawn
 * in) — rotate/flip first, then crop, same order most simple editors expect.
 */
function ImageEditorImpl({
  src,
  features,
  aspectRatios = DEFAULT_ASPECT_RATIOS,
  outputType = "image/png",
  onSave,
  onCancel,
  label = "Crop area",
  className,
  ...rest
}: ImageEditorOwnProps) {
  const showCrop = features?.crop ?? true;
  const showRotate = features?.rotate ?? true;
  const showFlip = features?.flip ?? true;

  const { imageRef, size } = useLoadedImage(src);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ state: DragState; startX: number; startY: number; rect: Rect } | null>(
    null,
  );

  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [ratioIndex, setRatioIndex] = useState(0);
  const [cropRect, setCropRect] = useState<Rect | null>(null);

  // Memoized so the pointermove/pointerup subscription effect below doesn't
  // tear down and resubscribe on every drag-driven re-render — only when the
  // image or rotation actually changes.
  const transformedSize = useMemo(
    () =>
      size && (rotation === 90 || rotation === 270)
        ? { width: size.h, height: size.w }
        : size
          ? { width: size.w, height: size.h }
          : null,
    [size, rotation],
  );

  // Bakes rotation/flip into `canvasRef` whenever the image loads or either
  // changes, then resets the crop box to the current aspect ratio.
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !transformedSize) return;
    canvas.width = transformedSize.width;
    canvas.height = transformedSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
    setCropRect(centeredRect(transformedSize, aspectRatios[ratioIndex]?.ratio));
  }, [rotation, flipH, transformedSize, imageRef.current, aspectRatios, ratioIndex]);

  const displayScale =
    canvasRef.current && transformedSize
      ? canvasRef.current.clientWidth / transformedSize.width || 1
      : 1;

  const applyDelta = useCallback(
    (dxCanvas: number, dyCanvas: number) => {
      const drag = dragRef.current;
      if (!drag || !transformedSize) return;
      const ratio = aspectRatios[ratioIndex]?.ratio;
      const next =
        drag.state.mode === "move"
          ? moveRect(drag.rect, dxCanvas, dyCanvas, transformedSize)
          : resizeFromCorner(
              drag.rect,
              drag.state.corner,
              dxCanvas,
              dyCanvas,
              transformedSize,
              MIN_CROP_SIZE,
              ratio,
            );
      setCropRect(next);
    },
    [transformedSize, ratioIndex, aspectRatios],
  );

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      applyDelta(
        (event.clientX - drag.startX) / displayScale,
        (event.clientY - drag.startY) / displayScale,
      );
    };
    const handleUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [applyDelta, displayScale]);

  const startDrag = (event: ReactPointerEvent, state: DragState) => {
    if (!cropRect) return;
    dragRef.current = { state, startX: event.clientX, startY: event.clientY, rect: cropRect };
  };

  const nudge = (event: ReactKeyboardEvent) => {
    if (!cropRect || !transformedSize) return;
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    setCropRect(moveRect(cropRect, delta[0], delta[1], transformedSize));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !cropRect) return;
    const output = document.createElement("canvas");
    output.width = Math.round(cropRect.width);
    output.height = Math.round(cropRect.height);
    const ctx = output.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      canvas,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      output.width,
      output.height,
    );
    // Encoded once, via `toBlob` — `dataUrl` is then read back off that same
    // blob rather than a separate `toDataURL` call, which would encode these
    // same pixels a second time (real cost on a multi-megapixel crop).
    output.toBlob((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = () => {
        onSave?.({
          blob,
          dataUrl: reader.result as string,
          width: output.width,
          height: output.height,
        });
      };
      reader.readAsDataURL(blob);
    }, outputType);
  };

  return (
    <Column gap="12" {...rest} className={className}>
      {showRotate || showFlip || (showCrop && aspectRatios.length > 1) ? (
        <Row gap="8" wrap="wrap">
          {showRotate && (
            <Button
              variant="outline"
              size="s"
              onClick={() => setRotation(((rotation + 90) % 360) as typeof rotation)}
            >
              Rotate
            </Button>
          )}
          {showFlip && (
            <Button variant="outline" size="s" onClick={() => setFlipH((v) => !v)}>
              Flip
            </Button>
          )}
          {showCrop &&
            aspectRatios.map((ar, index) => (
              <Button
                key={ar.label}
                variant={index === ratioIndex ? "solid" : "outline"}
                size="s"
                onClick={() => {
                  setRatioIndex(index);
                  if (transformedSize) setCropRect(centeredRect(transformedSize, ar.ratio));
                }}
              >
                {ar.label}
              </Button>
            ))}
        </Row>
      ) : null}

      <Flex
        display="inline-block"
        position="relative"
        maxWidth="full"
        overflow="hidden"
        className={styles.stage}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
        {showCrop && cropRect && transformedSize && (
          <Flex
            display="block"
            position="absolute"
            ref={overlayRef}
            role="group"
            aria-label={label}
            tabIndex={0}
            onKeyDown={nudge}
            onPointerDown={(event) => startDrag(event, { mode: "move" })}
            className={styles.overlay}
            style={{
              left: cropRect.x * displayScale,
              top: cropRect.y * displayScale,
              width: cropRect.width * displayScale,
              height: cropRect.height * displayScale,
            }}
          >
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <Flex
                as="span"
                position="absolute"
                key={corner}
                data-corner={corner}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startDrag(event, { mode: "resize", corner });
                }}
                className={[styles.handle, styles[corner]].join(" ")}
              />
            ))}
          </Flex>
        )}
      </Flex>

      {(onSave || onCancel) && (
        <Row gap="8" justifyContent="end">
          {onCancel && (
            <Button variant="ghost" size="s" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button variant="solid" size="s" onClick={handleSave} disabled={!cropRect}>
              Save
            </Button>
          )}
        </Row>
      )}
      {!size && (
        <Text fontSize="s" color="weak">
          Loading image…
        </Text>
      )}
    </Column>
  );
}
ImageEditorImpl.displayName = "ImageEditor";

export const ImageEditor = ImageEditorImpl;
