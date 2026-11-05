"use client";

import type { CSSProperties, ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IconName } from "../../icons";
import type { StyleProps } from "../../system/types";
import { useControllableState } from "../../system/useControllableState";
import { Column } from "../Column/Column";
import { Dialog } from "../Dialog/Dialog";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input/Input";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  /** Extra terms matched against but never shown — aliases, synonyms, etc. */
  keywords?: string;
  icon?: IconName;
  /** A display-only hint, e.g. `"⌘S"` — this doesn't register the shortcut itself, it just shows one that's already bound elsewhere. */
  shortcut?: string;
  /** Items sharing a `group` cluster under one label; ungrouped items render as a flat list. */
  group?: string;
  onSelect: () => void;
}

/** Layout/style props forwarded to the panel primitive. */
type PanelExtras = StyleProps & { className?: string; style?: CSSProperties };

export interface CommandPaletteOwnProps {
  items: CommandItem[];
  /** A single focusable element that opens the palette on click, same as `Dialog`. Omit for a fully controlled or hotkey-only palette. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default "Command palette" */
  title?: string;
  /** @default "Type a command…" */
  placeholder?: string;
  /** @default "No matches." */
  emptyMessage?: string;
  /**
   * The key that, combined with Cmd/Ctrl, opens this from anywhere on the
   * page, in addition to `trigger`. Pass `null` to disable the global
   * listener — e.g. for a second palette on the same page.
   * @default "k"
   */
  hotkey?: string | null;
  /** @default 8 */
  maxResults?: number;
}

function matches(item: CommandItem, query: string): boolean {
  const haystack = `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/**
 * A searchable list of actions in a hotkey-triggered overlay — built on
 * `Dialog` (focus trap, Escape, backdrop dismiss come from it for free).
 * Generalized from this system's own docs-site search, which now uses this
 * component instead of a bespoke implementation. Items sharing a `group`
 * cluster under one label; omit `group` entirely for a flat list.
 */
export function CommandPalette({
  items,
  trigger,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  title = "Command palette",
  placeholder = "Type a command…",
  emptyMessage = "No matches.",
  hotkey = "k",
  maxResults = 8,
  ...rest
}: CommandPaletteOwnProps & PanelExtras) {
  const [open, setOpen] = useControllableState(controlledOpen, defaultOpen ?? false, onOpenChange);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () =>
      (query.trim() ? items.filter((item) => matches(item, query)) : items).slice(0, maxResults),
    [items, query, maxResults],
  );

  // A plain `groupBy`, not a sort — items keep their relative order within a
  // group, and a group's first appearance in `results` decides its section
  // order, so results stay predictable as the query changes.
  const groups = useMemo(() => {
    const map = new Map<string | undefined, CommandItem[]>();
    for (const item of results) {
      const bucket = map.get(item.group);
      if (bucket) bucket.push(item);
      else map.set(item.group, [item]);
    }
    return Array.from(map.entries());
  }, [results]);

  useEffect(() => {
    if (hotkey === null) return;
    const lowerHotkey = hotkey.toLowerCase();
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === lowerHotkey) {
        event.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkey, open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const runItem = (item: CommandItem) => {
    setOpen(false);
    item.onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) runItem(target);
    }
  };

  return (
    <Dialog {...rest} trigger={trigger} open={open} onOpenChange={setOpen} title={title}>
      <Column gap="12">
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={title}
        />
        <Column gap="12" role="listbox" aria-label="Results">
          {results.length === 0 && (
            <Text fontSize="s" color="weak">
              {emptyMessage}
            </Text>
          )}
          {groups.map(([group, groupItems]) => (
            <Column
              key={group ?? "__ungrouped"}
              gap="2"
              role={group ? "group" : undefined}
              aria-label={group}
            >
              {group && (
                <Text fontSize="xs" color="weak" uppercase tracking="wide">
                  {group}
                </Text>
              )}
              {groupItems.map((item) => {
                const index = results.indexOf(item);
                return (
                  <Row
                    key={item.id}
                    role="option"
                    aria-selected={index === activeIndex}
                    gap="8"
                    alignItems="center"
                    padding="8"
                    radius="control"
                    background={index === activeIndex ? "raised" : "transparent"}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runItem(item)}
                  >
                    {item.icon && <Icon name={item.icon} size="s" />}
                    <Column gap="0" flex="1" minWidth="0">
                      <Text fontSize="s" color={index === activeIndex ? "strong" : "medium"}>
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text fontSize="xs" color="weak">
                          {item.description}
                        </Text>
                      )}
                    </Column>
                    {item.shortcut && (
                      <Text fontSize="xs" color="weak">
                        {item.shortcut}
                      </Text>
                    )}
                  </Row>
                );
              })}
            </Column>
          ))}
        </Column>
      </Column>
    </Dialog>
  );
}
