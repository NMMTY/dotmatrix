"use client";

import { Button, type CommandItem, CommandPalette, Text } from "@nmmty/dotmatrix";
import { useRouter } from "next/navigation";

export interface SearchablePage {
  slug: string;
  title: string;
  summary?: string;
  keywords?: string;
}

/** A thin adapter over the library's own `CommandPalette` — maps this site's pages to commands that navigate on select. */
export function SearchPalette({ pages }: { pages: SearchablePage[] }) {
  const router = useRouter();

  const items: CommandItem[] = pages.map((page) => ({
    id: page.slug,
    label: page.title,
    description: page.summary,
    // Folds the slug in as a hidden search term — `CommandPalette` only
    // searches label/description/keywords, not `id`, so without this a
    // page whose URL path (e.g. "bitmap") doesn't appear in its title or
    // summary would stop being findable by that word.
    keywords: [page.keywords, page.slug].filter(Boolean).join(" "),
    onSelect: () => router.push(`/${page.slug}`),
  }));

  return (
    <CommandPalette
      items={items}
      title="Search docs"
      placeholder="Type to search…"
      trigger={
        <Button size="s" variant="ghost" icon="search" aria-label="Search docs">
          <Text as="span" s={{ hidden: true }}>
            Search docs…{" "}
            <Text as="span" color="weak">
              ⌘K
            </Text>
          </Text>
        </Button>
      }
    />
  );
}
