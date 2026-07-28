import "@nmmty/dotmatrix/tokens.css";
import "@nmmty/dotmatrix/styles.css";

import { Column, Row, ThemeInitScript, ThemeProvider } from "@nmmty/dotmatrix";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getNavigation, getPages } from "../lib/content";
import { Footer } from "../product/Footer";
import { Header } from "../product/Header";
import { Sidebar } from "../product/Sidebar";
import { schema } from "../resources/config";

export const metadata: Metadata = {
  title: {
    default: schema.name,
    template: `%s — ${schema.name}`,
  },
  description: schema.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const navigation = getNavigation();
  const pages = getPages().map((page) => ({
    slug: page.slug,
    title: page.frontmatter.title,
    summary: page.frontmatter.summary,
    keywords: page.frontmatter.keywords,
  }));

  return (
    <html
      lang="en"
      data-theme="dark"
      data-palette="mono"
      data-border="rounded"
      data-density="normal"
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript palette="mono" />
      </head>
      <body>
        <ThemeProvider palette="mono">
          <Column minHeight="screen">
            <Header pages={pages} navigation={navigation} />
            <Row alignItems="stretch" flex="1">
              <Sidebar navigation={navigation} />
              <Column
                as="main"
                paddingX="40"
                s={{ paddingX: "16" }}
                flex="1"
                minWidth="0"
                alignItems="center"
              >
                {children}
              </Column>
            </Row>
            <Footer />
          </Column>
        </ThemeProvider>
      </body>
    </html>
  );
}
