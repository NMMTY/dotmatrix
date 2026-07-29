import { Card, Column, Heading, Icon, Row, Text } from "@nmmty/dotmatrix";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentPages, getPage, getPages } from "../../../lib/content";
import { CustomMDX } from "../../../product/mdx";
import { TableOfContents } from "../../../product/TableOfContents";
import { layout } from "../../../resources/config";

export function generateStaticParams() {
  return getPages().map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) return {};
  return { title: page.frontmatter.title, description: page.frontmatter.summary };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const page = getPage(slugPath);
  if (!page) notFound();

  const { prev, next } = getAdjacentPages(slugPath);
  const sectionTitle = slug.length > 1 ? slug[0] : undefined;

  return (
    <Row gap="40" maxWidth="full" minWidth="0" paddingY="8">
      <Column gap="24" flex="1" minWidth="0" style={{ maxWidth: layout.content.maxWidth }}>
        <Column gap="8">
          {sectionTitle && (
            <Text fontSize="xs" color="weak" uppercase tracking="wide">
              {sectionTitle}
            </Text>
          )}
          <Heading as="h1" displaySize="l">
            {page.frontmatter.title}
          </Heading>
          {page.frontmatter.updatedAt && (
            <Text fontSize="xs" color="weak">
              Last updated: {page.frontmatter.updatedAt}
            </Text>
          )}
        </Column>

        <Column as="article" gap="16">
          <CustomMDX source={page.content} />
        </Column>

        <Row justifyContent="between" gap="16" s={{ direction: "column" }}>
          {prev ? (
            <Card as={Link} href={`/${prev.slug}`} gap="4" shadow="s">
              <Row gap="4" alignItems="center">
                <Icon name="chevron-left" size="s" />
                <Text fontSize="xs" color="medium">
                  Previous
                </Text>
              </Row>
              <Text weight="medium" color="strong">
                {prev.title}
              </Text>
            </Card>
          ) : (
            <div />
          )}
          {next ? (
            <Card
              as={Link}
              href={`/${next.slug}`}
              gap="4"
              shadow="s"
              style={{ textAlign: "right" }}
            >
              <Row gap="4" alignItems="center" justifyContent="end">
                <Text fontSize="xs" color="medium">
                  Next
                </Text>
                <Icon name="chevron-right" size="s" />
              </Row>
              <Text weight="medium" color="strong">
                {next.title}
              </Text>
            </Card>
          ) : (
            <div />
          )}
        </Row>
      </Column>

      <Column style={{ width: layout.toc.width, minWidth: layout.toc.width }} s={{ hidden: true }}>
        <TableOfContents />
      </Column>
    </Row>
  );
}
