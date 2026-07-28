"use client";

import { Button, Column, Dialog, Input, Row, Text } from "@nmmty/dotmatrix";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface SearchablePage {
  slug: string;
  title: string;
  summary?: string;
  keywords?: string;
}

function matches(page: SearchablePage, query: string): boolean {
  const haystack =
    `${page.title} ${page.summary ?? ""} ${page.keywords ?? ""} ${page.slug}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/** ⌘K / Ctrl+K anywhere on the site opens this; built on the existing `Dialog` (focus trap, Escape, backdrop dismiss already come from it). */
export function SearchPalette({ pages }: { pages: SearchablePage[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = (query.trim() ? pages.filter((page) => matches(page, query)) : pages).slice(0, 8);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const navigateTo = (slug: string) => {
    setOpen(false);
    router.push(`/${slug}`);
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
      if (target) navigateTo(target.slug);
    }
  };

  return (
    <>
      <Button
        size="s"
        variant="ghost"
        icon="search"
        aria-label="Search docs"
        onClick={() => setOpen(true)}
      >
        <Text as="span" s={{ hidden: true }}>
          Search docs…{" "}
          <Text as="span" color="weak">
            ⌘K
          </Text>
        </Text>
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Search docs">
        <Column gap="12">
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search…"
            aria-label="Search docs"
          />
          <Column gap="2" role="listbox" aria-label="Search results">
            {results.length === 0 && (
              <Text fontSize="s" color="weak">
                No matches.
              </Text>
            )}
            {results.map((page, index) => (
              <Row
                key={page.slug}
                role="option"
                aria-selected={index === activeIndex}
                padding="8"
                radius="control"
                background={index === activeIndex ? "raised" : "transparent"}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigateTo(page.slug)}
              >
                <Text fontSize="s" color={index === activeIndex ? "strong" : "medium"}>
                  {page.title}
                </Text>
              </Row>
            ))}
          </Column>
        </Column>
      </Dialog>
    </>
  );
}
