"use client";

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { useControllableState } from "../../system/useControllableState";
import { useReducedMotion } from "../../system/useReducedMotion";
import styles from "./Popover.module.scss";

export interface PopoverOwnProps {
  /** A single focusable element that opens the popover on click. */
  trigger: ReactElement;
  children: ReactNode;
  /** @default "bottom-start" */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Click-triggered floating content that can hold real interactive
 * elements — unlike `Tooltip`, focus can move into it, and it stays open
 * until dismissed (Escape, or a click outside). For a list of choices with
 * roving keyboard navigation, use `Dropdown` instead; this is for
 * arbitrary content (a mini form, a settings panel, ...).
 */
export function Popover({
  trigger,
  children,
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: PopoverOwnProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen ?? false, onOpenChange);
  const reducedMotion = useReducedMotion();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 150,
    initial: { opacity: 0, transform: "scale(0.96)" },
  });

  const triggerProps = trigger.props as { ref?: React.Ref<Element> };
  const triggerRef = useMergeRefs([refs.setReference, triggerProps.ref ?? null]);

  return (
    <>
      {cloneElement(
        trigger,
        getReferenceProps({ ...triggerProps, ref: triggerRef }) as Record<string, unknown>,
      )}
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            {/*
              Two layers, not one style merge: floatingStyles' positioning
              transform and transitionStyles' animation transform would
              overwrite each other on one element (confirmed live on
              Tooltip). Positioning stays on the outer element; the
              animation is scoped to an inner one.
            */}
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
              <div style={transitionStyles} className={styles.popover}>
                {children}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
