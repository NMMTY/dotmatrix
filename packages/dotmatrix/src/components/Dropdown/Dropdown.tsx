"use client";

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTransitionStyles,
  useTypeahead,
} from "@floating-ui/react";
import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import { useControllableState } from "../../system/useControllableState";
import { useReducedMotion } from "../../system/useReducedMotion";
import styles from "./Dropdown.module.scss";
import { DropdownContext } from "./DropdownContext";

export interface DropdownOwnProps {
  /** A single focusable element that opens the menu on click. */
  trigger: ReactElement;
  /** `DropdownItem` elements. */
  children: ReactNode;
  /** @default "bottom-start" */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Matches the menu's width to the trigger's own width — for a Select-style combobox where the menu should align with the field, rather than sizing to its longest option. @default false */
  matchTriggerWidth?: boolean;
}

/**
 * A menu of choices with roving keyboard navigation (arrow keys, typeahead,
 * Home/End) — for arbitrary interactive content instead, use `Popover`; for
 * the same menu triggered by right-click instead of a visible trigger, see
 * `ContextMenu`, which shares this file's list-navigation wiring.
 */
export function Dropdown({
  trigger,
  children,
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  matchTriggerWidth = false,
}: DropdownOwnProps) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen ?? false, onOpenChange);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Driven by the `size` middleware's `apply`, not read from
  // `middlewareData` directly: `apply` is the only place floating-ui hands
  // back both the trigger's own rect (for width-matching) and the space
  // actually left in the viewport (for the scroll cap) in one pass.
  const [menuSize, setMenuSize] = useState<{ maxHeight?: number; width?: number }>({});
  const reducedMotion = useReducedMotion();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, rects }) {
          setMenuSize({
            maxHeight: availableHeight,
            width: matchTriggerWidth ? rects.reference.width : undefined,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    // Default is "auto" (focus the first item only when the menu was opened
    // via keyboard, not a mouse click) — that left activeIndex silently at 0
    // (visually "active", correct roving tabIndex) with real DOM focus still
    // on the trigger button after a mouse-opened menu. The very next arrow
    // key then advanced from that already-active-but-unfocused index 0,
    // landing on index 1 and reading as though the first item had been
    // skipped. Forcing it to always focus keeps visual state and real focus
    // in sync regardless of how the menu was opened.
    focusItemOnOpen: true,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: setActiveIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  const triggerProps = trigger.props as { ref?: React.Ref<Element> };
  const triggerRef = useMergeRefs([refs.setReference, triggerProps.ref ?? null]);

  // A small pop from the anchor edge, not a generic fade — reads as the menu
  // "opening out of" the trigger rather than just materializing.
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 120,
    initial: { opacity: 0, transform: "scale(0.96)" },
  });

  const handleSelect = (onSelect?: () => void) => {
    onSelect?.();
    setOpen(false);
  };

  return (
    <>
      {cloneElement(
        trigger,
        getReferenceProps({ ...triggerProps, ref: triggerRef }) as Record<string, unknown>,
      )}
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={0}>
            {/*
              Two layers, not one style merge: floatingStyles' positioning
              transform and transitionStyles' animation transform would
              overwrite each other on one element (confirmed live on
              Tooltip). Positioning stays on the outer element; the
              animation is scoped to an inner one.
            */}
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
              <div
                style={{
                  ...transitionStyles,
                  maxHeight: menuSize.maxHeight,
                  width: menuSize.width,
                }}
                className={styles.menu}
              >
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                  <DropdownContext.Provider value={{ activeIndex, getItemProps, handleSelect }}>
                    {children}
                  </DropdownContext.Provider>
                </FloatingList>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

export interface DropdownItemOwnProps {
  onSelect?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function DropdownItem({ onSelect, disabled, children }: DropdownItemOwnProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("<DropdownItem> must be rendered inside <Dropdown> or <ContextMenu>.");
  const { activeIndex, getItemProps, handleSelect } = ctx;
  const { ref, index } = useListItem();
  const isActive = activeIndex === index;

  return (
    <button
      ref={ref}
      role="menuitem"
      type="button"
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      className={[styles.item, isActive ? styles.active : undefined].filter(Boolean).join(" ")}
      {...getItemProps({ onClick: () => handleSelect(onSelect) })}
    >
      {children}
    </button>
  );
}
