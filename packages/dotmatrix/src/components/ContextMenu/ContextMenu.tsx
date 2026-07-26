"use client";

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClientPoint,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStyles,
  useTypeahead,
} from "@floating-ui/react";
import { cloneElement, type ReactElement, type ReactNode, useRef, useState } from "react";
import { useReducedMotion } from "../../system/useReducedMotion";
import dropdownStyles from "../Dropdown/Dropdown.module.scss";
import { DropdownContext } from "../Dropdown/DropdownContext";

export interface ContextMenuOwnProps {
  /** The element right-clicking on opens the menu. */
  children: ReactElement;
  /** `DropdownItem` elements — the same ones `Dropdown` uses. */
  menu: ReactNode;
}

/**
 * The same menu (and the same `DropdownItem`s) as `Dropdown`, opened by
 * right-click and positioned at the cursor instead of relative to a visible
 * trigger element. Shares `Dropdown`'s context/list-navigation wiring rather
 * than duplicating the menu-item rendering logic — the only real difference
 * between the two is how the menu opens and where it's anchored.
 */
export function ContextMenu({ children, menu }: ContextMenuOwnProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // The point the menu opens at, frozen at the moment of the right-click.
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "right-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  // Passing explicit x/y (rather than leaving them unset) is what matters
  // here: unset, useClientPoint keeps a window `mousemove` listener attached
  // for as long as the menu is open and the cursor is outside it, continuously
  // re-anchoring the floating element to follow the pointer — correct for a
  // hover-following tooltip, but it made this menu visibly drag along with
  // the mouse after opening. Fixed coordinates make it a one-time anchor.
  const clientPoint = useClientPoint(context, { enabled: open, x: point.x, y: point.y });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    // See Dropdown.tsx's identical option for why this can't be left at the
    // "auto" default.
    focusItemOnOpen: true,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: setActiveIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    clientPoint,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 120,
    initial: { opacity: 0, transform: "scale(0.96)" },
  });

  const handleSelect = (onSelect?: () => void) => {
    onSelect?.();
    setOpen(false);
  };

  const childProps = children.props as {
    ref?: React.Ref<Element>;
    onContextMenu?: (e: React.MouseEvent) => void;
  };

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({
          ...childProps,
          ref: refs.setReference,
          onContextMenu: (event: React.MouseEvent) => {
            event.preventDefault();
            childProps.onContextMenu?.(event);
            setPoint({ x: event.clientX, y: event.clientY });
            setOpen(true);
          },
        }) as Record<string, unknown>,
      )}
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            {/*
              Two layers, not one style merge: floatingStyles' positioning
              transform and transitionStyles' animation transform would
              overwrite each other on one element (confirmed live on
              Tooltip). Positioning stays on the outer element; the
              animation is scoped to an inner one.
            */}
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
              <div style={transitionStyles} className={dropdownStyles.menu}>
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                  <DropdownContext.Provider value={{ activeIndex, getItemProps, handleSelect }}>
                    {menu}
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
