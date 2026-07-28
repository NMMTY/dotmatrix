import type { Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { detectMediaKind, toEmbedUrl } from "./embedUrl";
import styles from "./Media.module.scss";

export interface MediaOwnProps extends StyleProps, CommonProps {
  /** An image URL, a video file URL, or a YouTube/Vimeo link — the element rendered is auto-detected from this. */
  src: string;
  /** Accessible description (image `alt`) or accessible name (video/embed `title`) — required either way. */
  alt: string;
  /** @default "16 / 9" */
  aspectRatio?: string;
  /** Poster frame shown before playback. Native `<video>` only. */
  poster?: string;
  /** @default true */
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

type MediaProps = MediaOwnProps & { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;

/**
 * One component for any embeddable media — a plain image, a native `<video>`,
 * or a YouTube/Vimeo URL (swapped for its embed/no-cookie iframe form
 * automatically). Always renders into a fixed-aspect-ratio box, so
 * surrounding content never reflows once the media itself loads in.
 *
 * Deliberately not run through `Dither`/`Halftone`: this is for content that
 * wants to look like an ordinary photo or video (a screenshot, a demo
 * recording), not this system's own bitmap aesthetic — reach for those
 * instead when the point is the dithered look itself.
 */
function MediaImpl({
  ref,
  src,
  alt,
  aspectRatio = "16 / 9",
  poster,
  controls = true,
  autoPlay,
  loop,
  muted,
  ...props
}: MediaProps) {
  const { className, style, rest } = resolveStyleProps(props);
  const kind = detectMediaKind(src);

  return (
    <div
      ref={ref}
      className={["dm-media", styles.wrapper, className].filter(Boolean).join(" ")}
      style={{ aspectRatio, ...style }}
      {...rest}
    >
      {/* Plain <img>, not next/image: this component is meant to be portable outside Next.js too. */}
      {kind === "image" && <img src={src} alt={alt} className={styles.fill} loading="lazy" />}
      {kind === "video" && (
        <video
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          className={styles.fill}
        />
      )}
      {(kind === "youtube" || kind === "vimeo") && (
        <iframe
          src={toEmbedUrl(src, kind)}
          title={alt}
          className={styles.fill}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
MediaImpl.displayName = "Media";

export const Media = MediaImpl;
