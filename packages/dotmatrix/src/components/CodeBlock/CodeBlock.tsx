"use client";

import { type ComponentType, type LazyExoticComponent, lazy, Suspense } from "react";
import { Column } from "../Column/Column";
import { Text } from "../Text/Text";
import type { CodeBlockOwnProps } from "./CodeBlock.impl";

function MissingPrismNotice() {
  return (
    <Column
      padding="16"
      gap="4"
      background="surface"
      borderWidth="1"
      borderColor="weak"
      radius="surface"
    >
      <Text fontSize="s" color="weak">
        {'<CodeBlock> requires the "prismjs" package. Install it with: npm install prismjs'}
      </Text>
    </Column>
  );
}

// `prismjs` is an optional peer dependency (see package.json) — if it isn't
// installed, this dynamic import rejects and the component degrades to the
// notice above instead of a broken tree. Kept in its own module (not inlined
// here) so the fallback path never itself references prismjs.
const CodeBlockImpl: LazyExoticComponent<ComponentType<CodeBlockOwnProps>> = lazy(() =>
  import("./CodeBlock.impl")
    .then((mod) => ({ default: mod.default as ComponentType<CodeBlockOwnProps> }))
    .catch(() => ({ default: MissingPrismNotice as ComponentType<CodeBlockOwnProps> })),
);

/**
 * A tabbed code snippet display with an optional live preview panel, built
 * to sit under every example in the docs site. Modeled on Once UI's
 * `CodeBlock` (tabs/copy/fullscreen/collapsible), adapted to this system's
 * own overlay primitives and a monochrome Prism theme instead of a color one.
 */
export function CodeBlock(props: CodeBlockOwnProps) {
  return (
    <Suspense fallback={null}>
      <CodeBlockImpl {...props} />
    </Suspense>
  );
}
CodeBlock.displayName = "CodeBlock";

export type { CodeBlockOwnProps, CodeInstance, CodeLanguage } from "./CodeBlock.impl";
