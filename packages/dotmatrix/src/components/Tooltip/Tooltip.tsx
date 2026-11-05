"use client";

import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { type CSSProperties, cloneElement, type ReactElement, useState } from "react";
import type { StyleProps } from "../../system/types";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Column } from "../Column/Column";
import styles from "./Tooltip.module.scss";

/** Layout/style props forwarded to the panel primitive. */
type PanelExtras = StyleProps & { className?: string; style?: CSSProperties };

export interface TooltipOwnProps {
  content: string;
  /** A single focusable element — a Tooltip needs one thing to attach hover/focus to. */
  children: ReactElement;
  /** @default "top" */
  placement?: Placement;
  /** Hover delay before showing, in ms. Closes immediately. @default 300 */
  delay?: number;
}

/**
 * A hover/focus-triggered label for an element that doesn't have visible
 * text of its own (an icon button, say). Purely informational — nothing
 * inside a Tooltip can be interacted with (it closes as soon as the pointer
 * or focus leaves the trigger), so `content` is plain text, not arbitrary
 * `ReactNode`; anything needing real interaction belongs in a `Popover`.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  className,
  style,
  ...rest
}: TooltipOwnProps & PanelExtras) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { delay: { open: delay, close: 0 }, move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  // A quick fade + slight scale-in — fast enough (120ms) to still read as an
  // instant response to hover, not a lingering entrance.
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 120,
    initial: { opacity: 0, transform: "scale(0.94)" },
  });

  const childProps = children.props as { ref?: React.Ref<Element> };
  const referenceRef = useMergeRefs([refs.setReference, childProps.ref ?? null]);

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({ ...childProps, ref: referenceRef }) as Record<string, unknown>,
      )}
      {isMounted && (
        <FloatingPortal>
          {/*
            Two layers, not one style merge: floatingStyles' positioning
            transform and transitionStyles' animation transform would
            overwrite each other in one merged style object (confirmed live —
            it pinned the tooltip to the top-left corner). Positioning stays
            on the outer element; the animation is scoped to an inner one.
          */}
          <Column
            display="block"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <Column
              display="block"
              {...rest}
              style={{ ...transitionStyles, ...style }}
              className={[styles.tooltip, className].filter(Boolean).join(" ")}
            >
              {content}
            </Column>
          </Column>
        </FloatingPortal>
      )}
    </>
  );
}
