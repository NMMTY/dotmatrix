"use client";

import {
  Children,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PaletteValue } from "../../system/props";
import type { CommonProps, StyleProps } from "../../system/types";
import { Flex } from "../Flex/Flex";
import {
  decodeText,
  defaultFrames,
  type FxEffect,
  type FxFrame,
  frameAt,
  gridMask,
  paletteAt,
  textEffects,
  typedLength,
} from "./effects";
import styles from "./Fx.module.scss";

export type FxTrigger = "mount" | "in-view" | "hover" | "focus" | "exit" | "loop" | "manual";

/** Mirrors `--dm-fx-frame` in tokens/motion.scss: 15 fps, four frames of a 60 Hz display. */
export const FX_FRAME_MS = 67;

/** What `ref` gives you on an `Fx` — the imperative half of `trigger="manual"`. */
export interface FxHandle {
  /** Start the effect (again, if it is running). */
  play: () => void;
  /** The wrapper element. */
  element: HTMLElement | null;
}

export interface FxOwnProps extends StyleProps, Omit<CommonProps, "palette"> {
  effect: FxEffect;
  /** When the effect plays. Defaults to `"mount"`. `"exit"` plays when the content scrolls out of view. */
  trigger?: FxTrigger;
  /**
   * Number of steps. Defaults to the effect's own length (`blinky` is 4,
   * `build-on` 14, …); another value resamples the sequence.
   */
  frames?: number;
  /** Steps per second. Defaults to 15, i.e. one step per 67 ms. */
  fps?: number;
  /** Milliseconds the content stays blank before the first step. */
  delay?: number;
  /** Milliseconds the finished content rests between repeats (and between `loop` plays). Defaults to 0. */
  interval?: number;
  /** `true` offsets each direct child by one step; a number sets the offset in ms. */
  stagger?: boolean | number;
  /** How many times to play (`loop` trigger implies `"infinite"`). */
  repeat?: number | "infinite";
  /** `color-flash` only: the palettes to flash through, one per step. Defaults to red, blue, green, purple. */
  palette?: PaletteValue[];
  /** `type` only: a block cursor after the text. */
  cursor?: boolean;
  /** Fired after the last step of the last repeat. */
  onDone?: () => void;
  /** Renders as an inline-block instead of a block. */
  inline?: boolean;
  children?: ReactNode;
}

type FxDisplay = "block" | "inline-block" | "flex" | "inline-flex" | "grid";

const FLEX_PROPS = ["direction", "gap", "gapX", "gapY", "wrap", "alignItems", "justifyContent"];

type FxProps = FxOwnProps & { ref?: Ref<FxHandle> } & Record<string, unknown>;

const DEFAULT_PALETTES: PaletteValue[] = ["red", "blue", "green", "purple"];

/** The blank state before the first step (and during `delay`). */
const BLANK: FxFrame = { hidden: true };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function frameStyle(f: FxFrame): CSSProperties {
  const out: CSSProperties = {};
  if (f.hidden) out.opacity = 0;
  else if (f.opacity !== undefined) out.opacity = f.opacity;

  // Translate percentages are of the element's own box, so offsets scale with
  // whatever the layer wraps. Listed outermost first: the translate is not
  // scaled by the scale that follows it.
  const transform: string[] = [];
  if (f.trail) {
    out.transformOrigin = "0 50%";
    transform.push(`translateX(${f.trail.left * 100}%)`, `scaleX(${f.trail.width})`);
  }
  if (f.x !== undefined || f.y !== undefined) {
    transform.push(`translate(${(f.x ?? 0) * 100}%, ${(f.y ?? 0) * 100}%)`);
  }
  if (f.scale !== undefined) transform.push(`scale(${f.scale})`);
  if (transform.length > 0) out.transform = transform.join(" ");

  if (f.outline !== undefined) {
    // Not `currentColor`: the layer's own text colour is made transparent
    // while its content is hidden.
    const ink = "var(--dm-on-background-strong)";
    out.outline = `1px solid color-mix(in srgb, ${ink} ${f.outline * 100}%, transparent)`;
    if (f.fill) {
      out.backgroundColor = `color-mix(in srgb, ${ink} ${f.fill * 100}%, transparent)`;
    }
  }
  if (f.grid) {
    const mask = gridMask(f.grid);
    out.maskImage = mask;
    out.WebkitMaskImage = mask;
    out.maskSize = "100% 100%";
    out.WebkitMaskSize = "100% 100%";
  }
  return out;
}

interface LayerProps {
  effect: FxEffect;
  /** 0 = never played; every increment (re)starts the timeline. */
  run: number;
  frames: number | undefined;
  fps: number;
  delay: number;
  interval: number;
  repeat: number | "infinite";
  palettes: PaletteValue[];
  cursor: boolean;
  inline: boolean;
  onDone?: () => void;
  children?: ReactNode;
}

/** One animated layer: owns the step counter for its slice of the content. */
function FxLayer({
  effect,
  run,
  frames,
  fps,
  delay,
  interval,
  repeat,
  palettes,
  cursor,
  inline,
  onDone,
  children,
    ...rest
}: LayerProps) {
  // `null` = idle, i.e. the content's natural state; -1 = waiting out `delay`, blank.
  const [frame, setFrame] = useState<number | null>(null);
  const total = Math.max(1, Math.floor(frames ?? defaultFrames(effect)));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (run === 0) return;
    if (prefersReducedMotion()) {
      setFrame(null);
      onDoneRef.current?.();
      return;
    }
    const step = 1000 / fps;
    const limit = repeat === "infinite" ? Number.POSITIVE_INFINITY : Math.max(1, repeat);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let iteration = 0;

    // Times are relative to "now". The first pass starts blank and, after
    // `delay`, plays step 0; later passes chain straight off the previous
    // pass's end with no lead-in.
    const schedule = () => {
      const lead = iteration === 0 ? delay : 0;
      for (let f = iteration === 0 && lead === 0 ? 1 : 0; f < total; f++) {
        timers.push(setTimeout(() => setFrame(f), lead + f * step));
      }
      timers.push(
        setTimeout(
          () => {
            iteration += 1;
            if (iteration < limit) {
              if (interval > 0) {
                // Rest on the finished content, then play the next pass.
                setFrame(null);
                timers.push(setTimeout(schedule, interval));
              } else {
                schedule();
              }
            } else {
              setFrame(null);
              onDoneRef.current?.();
            }
          },
          lead + total * step,
        ),
      );
    };

    setFrame(delay > 0 ? -1 : 0);
    schedule();
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [run, total, fps, delay, interval, repeat]);

  const f = frame ?? total - 1;
  const common = {
    "data-fx-effect": effect,
    "data-fx-frame": frame === null ? undefined : frame,
    display: inline ? ("inline-block" as const) : ("block" as const),
    className: styles.layer,
  };

  if (textEffects.has(effect) && typeof children === "string") {
    const visible =
      frame === null
        ? children
        : frame < 0
          ? ""
          : effect === "type"
            ? children.slice(0, typedLength(children.length, f, total))
            : decodeText(children, f, total);
    return (
      <Flex as="span" {...common} {...rest}>
        <span className={styles.sr}>{children}</span>
        <span aria-hidden>
          {visible}
          {effect === "type" && frame !== null && (
            <span className={styles.ghost}>{children.slice(visible.length)}</span>
          )}
          {effect === "type" && cursor && <span className={styles.cursor}>▌</span>}
        </span>
      </Flex>
    );
  }

  const current: FxFrame | null =
    frame === null ? null : frame < 0 ? BLANK : frameAt(effect, frame, total);
  const hideContent = current?.outline !== undefined || current?.overlay !== undefined;
  return (
    <Flex
      {...common}
      {...rest}
      className={[
        common.className,
        hideContent ? styles.hideContent : "",
        current?.tint !== undefined ? styles.tinted : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={current ? frameStyle(current) : undefined}
    >
      {current?.bands ? (
        <>
          {/* The original stays in the flow, unseen, so the layer keeps its size. */}
          <Flex display="block" className={styles.ghost}>
            {children}
          </Flex>
          {current.bands.map((band, i) => (
            <Flex
              display="block"
              // biome-ignore lint/suspicious/noArrayIndexKey: bands are positional and fixed per frame.
              key={i}
              aria-hidden
              inert
              className={styles.band}
              style={{
                clipPath: `inset(${band.top * 100}% 0 ${(1 - band.bottom) * 100}% 0)`,
                transform: `translateX(${band.left * 100}%) scaleX(${band.right - band.left})`,
              }}
            >
              {children}
            </Flex>
          ))}
        </>
      ) : (
        children
      )}
      {current?.overlay && (
        <Flex as="span" aria-hidden className={styles.overlay} data-kind={current.overlay} />
      )}
      {current?.tint !== undefined && (
        <Flex
          as="span"
          aria-hidden
          className={styles.tint}
          data-palette={paletteAt(palettes, current.tint)}
        />
      )}
    </Flex>
  );
}

/**
 * Stepped, frame-based effects: no easing, every state is a hard flip like
 * the dither grid. Children render untouched; only a wrapper layer is
 * restyled (opacity, offset, scale, slices, a cell mask, an outline), or —
 * for `type` and `decode` — a plain string child is rewritten step by step.
 * Under `prefers-reduced-motion` the effect is skipped and the content stays
 * as it is.
 */
function FxImpl({
  ref,
  effect,
  trigger = "mount",
  frames,
  fps = 15,
  delay = 0,
  interval = 0,
  stagger,
  repeat = 1,
  palette,
  cursor = false,
  onDone,
  inline = false,
  children,
  ...props
}: FxProps) {
  // Any flex prop turns the root into a flex container (so `direction`, `gap`,
  // `alignItems`… lay the children out); otherwise it stays a plain block.
  const isFlexRoot = FLEX_PROPS.some((k) => props[k] !== undefined);
  const rootDisplay =
    (props.display as FxDisplay | undefined) ??
    (isFlexRoot ? (inline ? "inline-flex" : "flex") : inline ? "inline-block" : "block");
  const rootRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const play = useCallback(() => setRun((r) => r + 1), []);
  useImperativeHandle(ref, () => ({ play, element: rootRef.current }), [play]);

  // useLayoutEffect: the first step lands before the browser paints, so a
  // mount effect never flashes the finished content first.
  useLayoutEffect(() => {
    if (trigger === "mount" || trigger === "loop") play();
  }, [trigger, play]);

  useEffect(() => {
    if (trigger !== "in-view" && trigger !== "exit") return;
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      if (trigger === "in-view") play();
      return;
    }
    let seen = false;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (trigger === "in-view" && entry.isIntersecting) {
          play();
          io.disconnect();
        } else if (trigger === "exit") {
          if (entry.isIntersecting) seen = true;
          else if (seen) {
            seen = false;
            play();
          }
        }
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, play]);

  const staggerMs =
    stagger === true ? FX_FRAME_MS : typeof stagger === "number" ? Math.max(0, stagger) : 0;
  const layerProps = {
    effect,
    run,
    frames,
    fps,
    interval: Math.max(0, interval),
    repeat: trigger === "loop" ? ("infinite" as const) : repeat,
    palettes: palette && palette.length > 0 ? palette : DEFAULT_PALETTES,
    cursor,
    inline,
  };

  const events = {
    onMouseEnter: trigger === "hover" ? play : undefined,
    onFocus: trigger === "focus" ? play : undefined,
  };

  return (
    <Flex
      ref={rootRef}
      display={rootDisplay}
      {...props}
      data-fx-trigger={trigger}
      className={["dm-fx", props.className].filter(Boolean).join(" ")}
      {...events}
    >
      {staggerMs > 0 ? (
        Children.toArray(children).map((child, i) => (
          <FxLayer
            // biome-ignore lint/suspicious/noArrayIndexKey: Children.toArray already assigns stable keys; index only offsets the delay.
            key={i}
            {...layerProps}
            delay={delay + i * staggerMs}
            onDone={i === Children.count(children) - 1 ? onDone : undefined}
          >
            {child}
          </FxLayer>
        ))
      ) : (
        <FxLayer {...layerProps} delay={delay} onDone={onDone}>
          {children}
        </FxLayer>
      )}
    </Flex>
  );
}
FxImpl.displayName = "Fx";

export const Fx = FxImpl;
