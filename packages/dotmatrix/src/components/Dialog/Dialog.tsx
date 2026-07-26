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
import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { useControllableState } from "../../system/useControllableState";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Column } from "../Column/Column";
import { Heading } from "../Heading/Heading";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Dialog.module.scss";

export interface DialogOwnProps {
  /** A single focusable element that opens the dialog on click. Omit for a fully controlled dialog. */
  trigger?: ReactElement;
  title: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A modal dialog: focus is trapped inside while open, the page behind it is
 * inert and scroll-locked, and Escape or a click on the backdrop closes it.
 * Not positioned relative to its trigger the way Popover/Dropdown are — it's
 * centered in the viewport via `FloatingOverlay`'s own flex layout, so
 * `useFloating` here is only for its dismiss/focus-management context, not
 * its placement math.
 */
export function Dialog({
  trigger,
  title,
  description,
  children,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: DialogOwnProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen ?? false, onOpenChange);
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });
  const reducedMotion = useReducedMotion();

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // Two independent transitions off the same context: the backdrop just
  // fades, while the dialog itself also scales up slightly — a "pop" that
  // reads as the dialog settling into place rather than merely fading in.
  const { isMounted, styles: overlayTransition } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 150,
    initial: { opacity: 0 },
  });
  const { styles: dialogTransition } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 150,
    initial: { opacity: 0, transform: "scale(0.96)" },
  });

  const triggerProps = trigger?.props as { ref?: React.Ref<Element> } | undefined;
  const triggerRef = useMergeRefs([refs.setReference, triggerProps?.ref ?? null]);

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
          <FloatingOverlay className={styles.overlay} style={overlayTransition} lockScroll>
            <FloatingFocusManager context={context}>
              {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="dialog" is applied via the getFloatingProps() spread (useRole's default), which static analysis can't see. */}
              <div
                ref={refs.setFloating}
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className={styles.dialog}
                style={dialogTransition}
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
