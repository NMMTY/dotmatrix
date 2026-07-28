"use client";

import { Column, Text } from "@nmmty/dotmatrix";
import { useEffect, useState } from "react";

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Reads h2/h3 out of the rendered article after mount — headings only get their `id` once the MDX heading mapper renders them, so this can't be computed ahead of time from the raw source. */
export function TableOfContents() {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("article h2[id], article h3[id]"));
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H3" ? 3 : 2,
      })),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <Column gap="8" style={{ position: "sticky", top: 24 }} aria-label="On this page">
      <Text fontSize="xs" color="weak" uppercase tracking="wide">
        On this page
      </Text>
      {headings.map((heading) => (
        <Text
          key={heading.id}
          as="a"
          href={`#${heading.id}`}
          fontSize="s"
          color={activeId === heading.id ? "strong" : "weak"}
          style={{ paddingLeft: heading.level === 3 ? 12 : 0 }}
        >
          {heading.text}
        </Text>
      ))}
    </Column>
  );
}
