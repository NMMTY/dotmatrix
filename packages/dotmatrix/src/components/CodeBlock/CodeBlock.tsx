"use client";

import type { CodeBlockOwnProps } from "./CodeBlock.impl";
import CodeBlockImpl from "./CodeBlock.impl";

// `prismjs` itself is loaded lazily inside `CodeBlockImpl` (see its
// `loadPrism()`), which is what actually keeps it an optional peer
// dependency — a bundler still has to statically resolve this module's own
// imports, so wrapping *this* re-export in `lazy()`/`Suspense` bought no
// real protection and, in Next.js App Router, never hydrated at all (the
// Suspense boundary stayed dehydrated client-side — no highlighting, no
// working copy/fullscreen/tab buttons).
/**
 * A tabbed code snippet display with an optional live preview panel, built
 * to sit under every example in the docs site. Modeled on Once UI's
 * `CodeBlock` (tabs/copy/fullscreen/collapsible), adapted to this system's
 * own overlay primitives and a monochrome Prism theme instead of a color one.
 */
export function CodeBlock(props: CodeBlockOwnProps) {
  return <CodeBlockImpl {...props} />;
}
CodeBlock.displayName = "CodeBlock";

export type { CodeBlockOwnProps, CodeInstance, CodeLanguage } from "./CodeBlock.impl";
