"use client";

import { Button, Column, Drawer, IconButton, Row, Text, useTheme } from "@nmmty/dotmatrix";
import Link from "next/link";
import type { NavItem } from "../lib/content";
import { schema, social } from "../resources/config";
import { type SearchablePage, SearchPalette } from "./SearchPalette";
import { NavTree } from "./Sidebar";

export function Header({ pages, navigation }: { pages: SearchablePage[]; navigation: NavItem[] }) {
  const { theme, setTheme } = useTheme();

  return (
    <Row
      as="header"
      justifyContent="between"
      alignItems="center"
      padding="12"
      gap="12"
      borderWidth="1"
      borderColor="weak"
    >
      <Row gap="4" alignItems="center">
        {/* Sidebar (with the same nav tree) takes over above this width — this
            trigger only exists for the range where Sidebar hides itself. */}
        <Drawer
          side="left"
          title={schema.name}
          trigger={
            <IconButton
              icon="menu"
              aria-label="Open navigation"
              variant="ghost"
              size="s"
              display="none"
              s={{ display: "flex" }}
            />
          }
        >
          <Column gap="8">
            <NavTree items={navigation} depth={0} />
          </Column>
        </Drawer>
        <Text as={Link} href="/" fontSize="m" weight="bold" uppercase tracking="wide">
          {schema.name}
        </Text>
      </Row>
      <SearchPalette pages={pages} />
      <Row gap="8" alignItems="center">
        <Button
          size="s"
          variant="ghost"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "Dark" : "Light"}
        </Button>
        {social.map((link) => (
          <IconButton
            key={link.name}
            as="a"
            href={link.href}
            aria-label={link.name}
            variant="ghost"
            icon="external-link"
          />
        ))}
      </Row>
    </Row>
  );
}
