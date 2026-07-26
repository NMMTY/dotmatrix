"use client";

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { cloneElement, type ReactElement, type ReactNode, useId, useRef } from "react";
import { useControllableState } from "../../system/useControllableState";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Column } from "../Column/Column";
import { Heading } from "../Heading/Heading";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Drawer.module.scss";

const OVERLAY_SIDE_CLASS = {
  left: styles.overlayLeft,
  right: styles.overlayRight,
  top: styles.overlayTop,
  bottom: styles.overlayBottom,
};

// The panel starts translated fully off-screen toward its own edge and
// slides in to translate(0) — i.e. it enters FROM the edge it's docked to.
const OFFSCREEN_TRANSFORM = {
  left: "translateX(-100%)",
  right: "translateX(100%)",
  top: "translateY(-100%)",
  bottom: "translateY(100%)",
};

export interface DrawerOwnProps {
  /** A single focusable element that opens the drawer on click. Omit for a fully controlled drawer. */
  trigger?: ReactElement;
  /** Which edge the drawer slides in from. @default "right" */
  side?: "left" | "right" | "top" | "bottom";
  title: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * `Dialog`'s edge-anchored sibling — same modal behavior (focus trap,
 * scroll lock, Escape/backdrop dismiss), but docked to a side of the
 * viewport instead of centered. Kept as its own component rather than a
 * `Dialog` prop: the two have different enough layout needs (a full-height
 * panel vs. a centered card) that sharing one component would mean
 * threading side-specific CSS through Dialog for every consumer, not just
 * the ones using it.
 */
export function Drawer({
  trigger,
  side = "right",
  title,
  description,
  children,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: DrawerOwnProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen ?? false, onOpenChange);
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });
  const reducedMotion = useReducedMotion();

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const { isMounted, styles: overlayTransition } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 200,
    initial: { opacity: 0 },
  });
  const { styles: panelTransition } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 200,
    initial: { transform: OFFSCREEN_TRANSFORM[side] },
    open: { transform: "translate(0)" },
  });

  const triggerProps = trigger?.props as { ref?: React.Ref<Element> } | undefined;
  const triggerRef = useMergeRefs([refs.setReference, triggerProps?.ref ?? null]);

  // The panel starts translated off-screen (OFFSCREEN_TRANSFORM above), so
  // auto-focusing the first tabbable child would call `.focus()` on an
  // off-screen element without `preventScroll`, fighting the slide-in with a
  // jittery scroll-into-view. Pointing `initialFocus` at the panel itself is
  // floating-ui's "focus the floating element" case, always `preventScroll: true`.
  const panelRef = useRef<HTMLDivElement>(null);
  const floatingRef = useMergeRefs([refs.setFloating, panelRef]);

  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;

  return (
    <>
      {trigger &&
        cloneElement(
          trigger,
          getReferenceProps({ ...triggerProps, ref: triggerRef }) as Record<string, unknown>,
        )}
      {isMounted && (
        <FloatingPortal>
          <FloatingOverlay
            className={[styles.overlay, OVERLAY_SIDE_CLASS[side]].join(" ")}
            style={overlayTransition}
            lockScroll
          >
            <FloatingFocusManager context={context} initialFocus={panelRef}>
              {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="dialog" is applied via the getFloatingProps() spread (useRole's default), which static analysis can't see. */}
              <div
                ref={floatingRef}
                tabIndex={-1}
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className={[styles.drawer, styles[side]].join(" ")}
                style={panelTransition}
                {...getFloatingProps()}
              >
                <Row justifyContent="between" alignItems="center" gap="16">
                  <Heading as="h2" id={titleId} displaySize="xs">
                    {title}
                  </Heading>
                  <IconButton aria-label="Close" variant="ghost" onClick={() => setOpen(false)}>
                    <Icon name="close" />
                  </IconButton>
                </Row>
                {description && (
                  <Text id={descriptionId} fontSize="s" color="weak">
                    {description}
                  </Text>
                )}
                {children && <Column gap="16">{children}</Column>}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
}
