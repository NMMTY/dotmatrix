import { Card, Grid, Text } from "@nmmty/dotmatrix";
import Link from "next/link";
import { getPages } from "../lib/content";

export interface PageListProps {
  /** Only pages whose slug starts with this prefix, e.g. `"components/forms"`. */
  path?: string;
  description?: boolean;
  columns?: "1" | "2" | "3" | "4";
}

/** A card grid of every page under `path` — how a section's own overview page lists its children. */
export function PageList({ path = "", description = true, columns = "2" }: PageListProps) {
  const pages = getPages()
    .filter((page) => (path ? page.slug.startsWith(`${path}/`) : true))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));

  return (
    <Grid columns={columns} gap="16" s={{ columns: "1" }}>
      {pages.map((page) => (
        <Card key={page.slug} as={Link} href={`/${page.slug}`} gap="4" shadow="s">
          <Text weight="medium" color="strong">
            {page.frontmatter.title}
          </Text>
          {description && page.frontmatter.summary && (
            <Text fontSize="s" color="medium">
              {page.frontmatter.summary}
            </Text>
          )}
        </Card>
      ))}
    </Grid>
  );
}
