import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { IconName } from "@nmmty/dotmatrix";
import matter from "gray-matter";

const CONTENT_ROOT = resolve(process.cwd(), "src/content");

export interface PageFrontmatter {
  title: string;
  summary?: string;
  updatedAt?: string;
  navLabel?: string;
  navIcon?: IconName;
  navTag?: string;
  order?: number;
  keywords?: string;
  github?: string;
}

export interface Page {
  /** Path relative to `src/content`, no extension — e.g. `"components/forms/button"`. */
  slug: string;
  frontmatter: PageFrontmatter;
  /** MDX body, frontmatter already stripped. */
  content: string;
}

export interface NavItem {
  /** Present only for a leaf (an actual page); absent for a pure category directory. */
  slug?: string;
  title: string;
  navIcon?: IconName;
  navTag?: string;
  order?: number;
  children?: NavItem[];
}

interface DirMeta {
  title?: string;
  order?: number;
  pages?: Record<string, number>;
}

function readDirMeta(dir: string): DirMeta {
  const metaPath = resolve(dir, "meta.json");
  try {
    return JSON.parse(readFileSync(metaPath, "utf8"));
  } catch {
    return {};
  }
}

/** Files before directories, then explicit `order`, then alphabetical — same shape magic-docs uses. */
function sortNavItems(items: NavItem[]): NavItem[] {
  return [...items].sort((a, b) => {
    const aIsCategory = !!a.children;
    const bIsCategory = !!b.children;
    if (aIsCategory !== bIsCategory) return aIsCategory ? 1 : -1;

    const aHasOrder = typeof a.order === "number";
    const bHasOrder = typeof b.order === "number";
    if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;
    if (aHasOrder && bHasOrder && a.order !== b.order) return a.order! - b.order!;

    return a.title.localeCompare(b.title);
  });
}

function walkNav(dir: string): NavItem[] {
  const meta = readDirMeta(dir);
  const entries = readdirSync(dir, { withFileTypes: true });

  const items: NavItem[] = [];
  for (const entry of entries) {
    if (entry.name === "meta.json") continue;
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      const dirMeta = readDirMeta(fullPath);
      items.push({
        title: dirMeta.title ?? entry.name,
        order: dirMeta.order,
        children: sortNavItems(walkNav(fullPath)),
      });
    } else if (entry.name.endsWith(".mdx")) {
      const raw = readFileSync(fullPath, "utf8");
      const { data } = matter(raw);
      const fileName = entry.name.replace(/\.mdx$/, "");
      const slug = fullPath
        .slice(CONTENT_ROOT.length + 1)
        .replace(/\.mdx$/, "")
        .replace(/\\/g, "/");

      items.push({
        slug,
        title: (data.title as string | undefined) ?? fileName,
        navIcon: data.navIcon,
        navTag: data.navTag,
        order: meta.pages?.[fileName] ?? data.order,
      });
    }
  }

  return items;
}

/** The full sidebar tree, sorted at every level. */
export function getNavigation(): NavItem[] {
  return sortNavItems(walkNav(CONTENT_ROOT));
}

function walkFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else if (entry.name.endsWith(".mdx")) files.push(fullPath);
  }
  return files;
}

/** Every page, unordered — use `getOrderedPages()` when order matters. */
export function getPages(): Page[] {
  return walkFiles(CONTENT_ROOT).map((fullPath) => {
    const raw = readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const slug = fullPath
      .slice(CONTENT_ROOT.length + 1)
      .replace(/\.mdx$/, "")
      .replace(/\\/g, "/");
    return { slug, frontmatter: data as PageFrontmatter, content };
  });
}

export function getPage(slug: string): Page | undefined {
  return getPages().find((page) => page.slug === slug);
}

/** Leaf pages, flattened depth-first from the nav tree — this *is* sidebar order. */
export function getOrderedPages(): NavItem[] {
  const flat: NavItem[] = [];
  const visit = (items: NavItem[]) => {
    for (const item of items) {
      if (item.slug) flat.push(item);
      if (item.children) visit(item.children);
    }
  };
  visit(getNavigation());
  return flat;
}

export function getAdjacentPages(slug: string): { prev?: NavItem; next?: NavItem } {
  const ordered = getOrderedPages();
  const index = ordered.findIndex((item) => item.slug === slug);
  if (index === -1) return {};
  return { prev: ordered[index - 1], next: ordered[index + 1] };
}
