"use client";

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useFloating,
  useTransitionStyles,
} from "@floating-ui/react";
import { type ReactNode, useEffect, useState } from "react";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Button } from "../Button/Button";
import { Column } from "../Column/Column";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Tab, TabList, Tabs } from "../Tabs/Tabs";
import { Text } from "../Text/Text";
import styles from "./CodeBlock.module.scss";

export type CodeLanguage =
  | "tsx"
  | "typescript"
  | "jsx"
  | "javascript"
  | "bash"
  | "scss"
  | "css"
  | "json"
  | "text";

export interface CodeInstance {
  code: string;
  language: CodeLanguage;
  /** Tab label when there's more than one instance; falls back to `language`. */
  label?: string;
}

export interface CodeBlockOwnProps {
  codes: CodeInstance[];
  /** Rendered live above the code, in its own bordered panel. */
  preview?: ReactNode;
  /** @default true */
  copyButton?: boolean;
  /** @default false */
  fullscreenButton?: boolean;
  /** @default false */
  lineNumbers?: boolean;
  /** Collapses past this many lines when `isCollapsible` is set. */
  maxLines?: number;
  /** @default false */
  isCollapsible?: boolean;
  /** Condensed header — no tab labels/preview padding. @default false */
  compact?: boolean;
  /** `"mono"` tints tokens by weight only (this system's default identity); `"color"` gives each token kind its own hue, for contexts where syntax colors carry real information. @default "mono" */
  syntaxTheme?: "mono" | "color";
  className?: string;
}

// Loaded lazily and only client-side: prismjs is an optional peer dependency
// (see CodeBlock.tsx's fallback), so nothing here can be a static top-level
// import of it. Core Prism already ships markup/css/clike/javascript.
let Prism: typeof import("prismjs") | undefined;
const loadedLanguages = new Set(["markup", "css", "clike", "javascript"]);

async function loadPrism() {
  if (!Prism) {
    const mod = await import("prismjs");
    Prism = (mod as unknown as { default?: typeof import("prismjs") }).default ?? mod;
  }
  return Prism;
}

/** Sequential, not Promise.all — tsx depends on jsx+typescript both having registered with Prism's global registry first. */
async function ensureLanguage(lang: CodeLanguage): Promise<void> {
  await loadPrism();
  if (loadedLanguages.has(lang)) return;

  if (lang === "tsx") {
    await ensureLanguage("typescript");
    await ensureLanguage("jsx");
    await import("prismjs/components/prism-tsx");
  } else if (lang === "typescript") {
    await import("prismjs/components/prism-typescript");
  } else if (lang === "jsx") {
    await import("prismjs/components/prism-jsx");
  } else if (lang === "bash") {
    await import("prismjs/components/prism-bash");
  } else if (lang === "scss") {
    await import("prismjs/components/prism-scss");
  } else if (lang === "json") {
    await import("prismjs/components/prism-json");
  } else {
    return;
  }
  loadedLanguages.add(lang);
}

function CodeBlockImpl({
  codes,
  preview,
  copyButton = true,
  fullscreenButton = false,
  lineNumbers = false,
  maxLines,
  isCollapsible = false,
  compact = false,
  syntaxTheme = "mono",
  className,
}: CodeBlockOwnProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const current = codes[selectedIndex] ?? codes[0];

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setHighlighted(null);
    ensureLanguage(current.language)
      .then(() => {
        if (cancelled || !Prism) return;
        const grammar = Prism.languages[current.language];
        setHighlighted(grammar ? Prism.highlight(current.code, grammar, current.language) : null);
      })
      .catch(() => {
        // prismjs (optional peer dep) isn't installed, or a language chunk
        // failed to load — falls back to the plain-text <code> below.
      });
    return () => {
      cancelled = true;
    };
  }, [current]);

  const handleCopy = () => {
    if (!current) return;
    navigator.clipboard.writeText(current.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { refs, context } = useFloating({ open: isFullscreen, onOpenChange: setIsFullscreen });
  const { isMounted, styles: overlayTransition } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 150,
    initial: { opacity: 0 },
  });

  const lineCount = current ? current.code.split("\n").length : 0;
  const collapsed = isCollapsible && !!maxLines && lineCount > maxLines && !isExpanded;

  const body = (
    <Column
      background="surface"
      borderWidth="1"
      borderColor="weak"
      radius="surface"
      overflow="hidden"
      className={[styles.block, className].filter(Boolean).join(" ")}
    >
      {!compact && (
        <Row justifyContent="between" alignItems="center" className={styles.header}>
          {codes.length > 1 ? (
            <Tabs
              value={current?.label ?? String(selectedIndex)}
              onChange={(label) => {
                const index = codes.findIndex((c, i) => (c.label ?? String(i)) === label);
                if (index !== -1) setSelectedIndex(index);
              }}
            >
              <TabList aria-label="Code examples">
                {codes.map((instance, index) => (
                  <Tab key={instance.label ?? index} value={instance.label ?? String(index)}>
                    {instance.label ?? instance.language}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          ) : (
            <Text fontSize="xs" color="weak" uppercase tracking="wide" className={styles.label}>
              {current?.label ?? current?.language}
            </Text>
          )}
          <Row gap="4" className={styles.actions}>
            {fullscreenButton && (
              <IconButton
                size="s"
                variant="ghost"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                icon={isFullscreen ? "minimize" : "maximize"}
                onClick={() => setIsFullscreen((v) => !v)}
              />
            )}
            {copyButton && (
              <IconButton
                size="s"
                variant="ghost"
                aria-label={copied ? "Copied!" : "Copy code"}
                icon={copied ? "check" : "copy"}
                onClick={handleCopy}
              />
            )}
          </Row>
        </Row>
      )}
      {preview && (
        <Row
          padding="24"
          justifyContent="center"
          alignItems="center"
          background="page"
          borderWidth="1"
          borderColor="weak"
          className={styles.preview}
        >
          {preview}
        </Row>
      )}
      {current && (
        <div
          className={[styles.codeWrap, collapsed ? styles.collapsed : undefined]
            .filter(Boolean)
            .join(" ")}
          style={collapsed ? { maxHeight: `calc(1.6em * ${maxLines})` } : undefined}
        >
          <pre
            className={[
              styles.pre,
              lineNumbers ? styles.lineNumbers : undefined,
              syntaxTheme === "color" ? styles.colorSyntax : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {highlighted !== null ? (
              <code
                className={`language-${current.language}`}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: `highlighted` only ever comes from Prism.highlight()'s own output, which HTML-escapes the source itself — never raw user/network input.
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ) : (
              <code className={`language-${current.language}`}>{current.code}</code>
            )}
          </pre>
          {collapsed && (
            <Row justifyContent="center" className={styles.collapseBar}>
              <Button size="s" variant="outline" onClick={() => setIsExpanded(true)}>
                View code
              </Button>
            </Row>
          )}
        </div>
      )}
    </Column>
  );

  return (
    <>
      {!isFullscreen && body}
      {isMounted && (
        <FloatingPortal>
          <FloatingOverlay className={styles.overlay} style={overlayTransition} lockScroll>
            <FloatingFocusManager context={context}>
              <div ref={refs.setFloating} className={styles.fullscreen}>
                {body}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
}
CodeBlockImpl.displayName = "CodeBlock";

export default CodeBlockImpl;
