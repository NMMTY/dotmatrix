import * as Core from "@nmmty/dotmatrix";
import { CodeBlock, Heading, InlineCode, Line, Text } from "@nmmty/dotmatrix";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { isValidElement, type ReactNode } from "react";
import { IconGrid } from "../components/IconGrid";
import { PaletteSwitcherDemo } from "../components/PaletteSwitcherDemo";
import { Playground } from "../components/Playground";
import { PropsTable } from "../components/PropsTable";
import { PageList } from "./PageList";

// Every component `@nmmty/dotmatrix` exports (PascalCase), so any of them can
// be used directly in content MDX with no per-file import — hooks/consts
// (camelCase) and type-only exports (erased at runtime) are naturally
// excluded by the name check, not hand-maintained here.
const coreComponents = Object.fromEntries(
  Object.entries(Core).filter(([key]) => /^[A-Z]/.test(key)),
);

const KNOWN_LANGUAGES = ["tsx", "typescript", "jsx", "javascript", "bash", "scss", "css", "json"];

function normalizeLanguage(lang: string): Core.CodeLanguage {
  return (KNOWN_LANGUAGES.includes(lang) ? lang : "text") as Core.CodeLanguage;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
}

function headingText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (isValidElement(children)) {
    return headingText((children.props as { children?: ReactNode }).children);
  }
  return "";
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const size = { h1: "l", h2: "s", h3: "xs", h4: "xs", h5: "xs", h6: "xs" } as const;
  // Only marginTop: the article column's own `gap` already spaces every
  // child from the one below it — a matching marginBottom here would stack
  // on top of that gap instead of replacing it. marginTop still adds *extra*
  // room before a new section, on top of the baseline gap rhythm.
  const spaceBefore = { h1: "24", h2: "16", h3: "8", h4: "8", h5: "8", h6: "8" } as const;
  function MDXHeading({ children }: { children?: ReactNode }) {
    return (
      <Heading
        as={as}
        displaySize={size[as]}
        id={slugify(headingText(children))}
        marginTop={spaceBefore[as]}
      >
        {children}
      </Heading>
    );
  }
  MDXHeading.displayName = as;
  return MDXHeading;
}

/** A fenced ```lang block compiles to `<pre><code className="language-lang">`. */
function createCodeBlock({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const codeProps = children.props as { className?: string; children?: unknown };
    const language = (codeProps.className ?? "").replace("language-", "") || "text";
    const code = typeof codeProps.children === "string" ? codeProps.children.trimEnd() : "";
    return (
      <CodeBlock codes={[{ language: normalizeLanguage(language), code }]} syntaxTheme="mono" />
    );
  }
  return <pre>{children}</pre>;
}

const mdxComponents = {
  ...coreComponents,
  h1: createHeading("h1"),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  h4: createHeading("h4"),
  h5: createHeading("h5"),
  h6: createHeading("h6"),
  p: ({ children }: { children?: ReactNode }) => (
    <Text as="p" fontSize="m" color="medium" style={{ lineHeight: 1.6 }}>
      {children}
    </Text>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <Text as="a" href={href}>
      {children}
    </Text>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <Text as="li" fontSize="m" color="medium" style={{ lineHeight: 1.6 }}>
      {children}
    </Text>
  ),
  hr: () => <Line />,
  code: ({ children }: { children: ReactNode }) => <InlineCode>{children}</InlineCode>,
  pre: createCodeBlock,
  PropsTable,
  Playground,
  IconGrid,
  PaletteSwitcherDemo,
  PageList,
};

export function CustomMDX(props: MDXRemoteProps) {
  return <MDXRemote {...props} components={{ ...mdxComponents, ...(props.components ?? {}) }} />;
}
