"use client";

import { Column, Icon, Row, Text } from "@nmmty/dotmatrix";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "../lib/content";
import { layout, routes, schema } from "../resources/config";

/** Exported so `Header`'s mobile drawer can render the exact same tree. */
export function NavTree({ items, depth }: { items: NavItem[]; depth: number }) {
  const pathname = usePathname();

  return (
    <Column gap="4" style={depth > 0 ? { paddingLeft: 12 } : undefined}>
      {items.map((item) =>
        item.children ? (
          <Column key={item.title} gap="4" marginTop={depth === 0 ? "16" : "4"}>
            <Text fontSize="xs" color="weak" uppercase tracking="wide">
              {item.title}
            </Text>
            <NavTree items={item.children} depth={depth + 1} />
          </Column>
        ) : (
          <Row key={item.slug} as={Link} href={`/${item.slug}`} gap="8" alignItems="center">
            {item.navIcon && <Icon name={item.navIcon} size="s" />}
            <Text
              fontSize="s"
              color={pathname === `/${item.slug}` ? "strong" : "medium"}
              weight={pathname === `/${item.slug}` ? "medium" : "regular"}
            >
              {item.title}
            </Text>
          </Row>
        ),
      )}
    </Column>
  );
}

export function Sidebar({ navigation }: { navigation: NavItem[] }) {
  return (
    <Column
      as="nav"
      gap="8"
      padding="24"
      borderWidth="1"
      borderColor="weak"
      style={{
        width: layout.sidebar.width,
        minWidth: layout.sidebar.width,
        position: "sticky",
        top: 0,
        maxHeight: "100vh",
        overflowY: "auto",
      }}
      // Below this width the fixed 220px rail leaves too little room for
      // content — Header's hamburger Drawer takes over navigation instead.
      s={{ hidden: true }}
      aria-label="Docs navigation"
    >
      <Text
        as={Link}
        href="/"
        fontSize="m"
        weight="bold"
        uppercase
        tracking="wide"
        marginBottom="16"
      >
        {schema.name}
      </Text>

      <NavTree items={navigation} depth={0} />

      {routes["/changelog"] && (
        <Column gap="4" marginTop="16">
          <Text fontSize="xs" color="weak" uppercase tracking="wide">
            Resources
          </Text>
          <Text as={Link} href="/changelog" fontSize="s" color="medium">
            Changelog
          </Text>
        </Column>
      )}
    </Column>
  );
}
