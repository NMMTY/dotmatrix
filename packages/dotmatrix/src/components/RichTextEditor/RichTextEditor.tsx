"use client";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { type InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  type HeadingTagType,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  type ElementNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type TextFormatType,
} from "lexical";
import { useEffect, useId, useState } from "react";
import { type LayoutProps, pickLayoutProps } from "../../system/layoutProps";
import { useFormField } from "../../system/useFormField";
import { Button } from "../Button/Button";
import { Column } from "../Column/Column";
import { FieldShell } from "../FieldShell/FieldShell";
import { Flex } from "../Flex/Flex";
import { Row } from "../Row/Row";
import styles from "./RichTextEditor.module.scss";

export interface RichTextEditorFeatures {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  heading?: boolean;
  quote?: boolean;
  bulletList?: boolean;
  numberedList?: boolean;
  link?: boolean;
}

export interface RichTextEditorOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /**
   * Initial content, as an HTML string. Uncontrolled only, by design — a
   * `contentEditable`-based editor can't be safely re-synced from an
   * external `value` on every render without fighting the browser's own
   * selection/undo state, which is why every major React rich-text wrapper
   * (Lexical, Tiptap, Slate) recommends against it too.
   */
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Which toolbar tools show. @default all enabled */
  features?: RichTextEditorFeatures;
  disabled?: boolean;
  className?: string;
}

const ALL_FEATURES: Required<RichTextEditorFeatures> = {
  bold: true,
  italic: true,
  underline: true,
  heading: true,
  quote: true,
  bulletList: true,
  numberedList: true,
  link: true,
};

const HEADING_TAGS: HeadingTagType[] = ["h1", "h2", "h3"];

type BlockType = "paragraph" | "quote" | "bullet" | "number" | HeadingTagType;

/**
 * The bitmap-styled toolbar plus the state that decides which buttons read
 * as active — tracked via `SELECTION_CHANGE_COMMAND` rather than local
 * click state, so it reflects wherever the cursor actually is (including
 * after an undo, a paste, or an arrow-key move), not just the last button
 * pressed.
 */
function Toolbar({
  features,
  disabled,
}: {
  features: Required<RichTextEditorFeatures>;
  disabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<TextFormatType>>(new Set());
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const formats = new Set<TextFormatType>();
        for (const format of ["bold", "italic", "underline"] as const) {
          if (selection.hasFormat(format)) formats.add(format);
        }
        setActiveFormats(formats);

        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
        if ($isListNode(element)) {
          setBlockType(element.getListType() === "bullet" ? "bullet" : "number");
        } else if ($isHeadingNode(element)) {
          setBlockType(element.getTag());
        } else if ($isQuoteNode(element)) {
          setBlockType("quote");
        } else {
          setBlockType("paragraph");
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  const setBlock = <T extends ElementNode>(create: () => T) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) $setBlocksType(selection, create);
    });
  };

  // Toggles a block type on/off: clicking an already-active heading/quote
  // reverts to a plain paragraph instead of creating a duplicate of itself.
  const toggleBlock = <T extends ElementNode>(isActive: boolean, create: () => T) => {
    setBlock<ElementNode>(isActive ? $createParagraphNode : create);
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  return (
    <Row gap="4" wrap="wrap" paddingBottom="8" className={styles.toolbar}>
      {features.bold && (
        <Button
          type="button"
          size="s"
          variant={activeFormats.has("bold") ? "solid" : "outline"}
          aria-pressed={activeFormats.has("bold")}
          disabled={disabled}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        >
          <strong>B</strong>
        </Button>
      )}
      {features.italic && (
        <Button
          type="button"
          size="s"
          variant={activeFormats.has("italic") ? "solid" : "outline"}
          aria-pressed={activeFormats.has("italic")}
          disabled={disabled}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        >
          <em>I</em>
        </Button>
      )}
      {features.underline && (
        <Button
          type="button"
          size="s"
          variant={activeFormats.has("underline") ? "solid" : "outline"}
          aria-pressed={activeFormats.has("underline")}
          disabled={disabled}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        >
          <u>U</u>
        </Button>
      )}
      {features.heading &&
        HEADING_TAGS.map((tag) => (
          <Button
            key={tag}
            type="button"
            size="s"
            variant={blockType === tag ? "solid" : "outline"}
            aria-pressed={blockType === tag}
            disabled={disabled}
            onClick={() => toggleBlock(blockType === tag, () => $createHeadingNode(tag))}
          >
            {tag.toUpperCase()}
          </Button>
        ))}
      {features.quote && (
        <Button
          type="button"
          size="s"
          variant={blockType === "quote" ? "solid" : "outline"}
          aria-pressed={blockType === "quote"}
          disabled={disabled}
          onClick={() => toggleBlock(blockType === "quote", () => $createQuoteNode())}
        >
          Quote
        </Button>
      )}
      {features.bulletList && (
        <Button
          type="button"
          size="s"
          variant={blockType === "bullet" ? "solid" : "outline"}
          aria-pressed={blockType === "bullet"}
          disabled={disabled}
          onClick={() =>
            editor.dispatchCommand(
              blockType === "bullet" ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
              undefined,
            )
          }
        >
          • List
        </Button>
      )}
      {features.numberedList && (
        <Button
          type="button"
          size="s"
          variant={blockType === "number" ? "solid" : "outline"}
          aria-pressed={blockType === "number"}
          disabled={disabled}
          onClick={() =>
            editor.dispatchCommand(
              blockType === "number" ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
              undefined,
            )
          }
        >
          1. List
        </Button>
      )}
      {features.link && (
        <Button type="button" size="s" variant="outline" disabled={disabled} onClick={insertLink}>
          Link
        </Button>
      )}
    </Row>
  );
}

const theme = {
  paragraph: styles.paragraph,
  heading: { h1: styles.h1, h2: styles.h2, h3: styles.h3 },
  quote: styles.quote,
  link: styles.link,
  list: { ul: styles.listUl, ol: styles.listOl, listitem: styles.listItem },
  text: { bold: styles.bold, italic: styles.italic, underline: styles.underline },
};

// Logged, not rethrown: this fires for Lexical's own internal update/command
// errors (a malformed `defaultValue` HTML string included — see
// `InitialHtmlPlugin` below), which `LexicalErrorBoundary` doesn't catch
// (it only wraps decorator-node rendering) — rethrowing here would crash
// the whole app over content, not a programming error.
function onError(error: Error) {
  console.error(error);
}

/**
 * Seeds `defaultValue` HTML into the editor once, via `useEffect` rather
 * than `LexicalComposer`'s own `initialConfig.editorState` initializer —
 * that option runs during the editor's first render, which under Next.js
 * SSR/SSG happens on the server too (a "use client" boundary still executes
 * server-side for the initial HTML), where `DOMParser` doesn't exist.
 * `useEffect` only ever runs on the client, after mount.
 */
function InitialHtmlPlugin({ html }: { html: string | undefined }) {
  const [editor] = useLexicalComposerContext();
  // Seeds initial content once on mount only — `html` is deliberately not a
  // live sync source (see `RichTextEditorOwnProps.defaultValue`), so
  // re-running this when it changes would be wrong, not just unnecessary.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear();
      $getRoot().select();
      $insertNodes(nodes);
    });
  }, [editor]);
  return null;
}

/**
 * A rich text editor — the one component in this system that depends on a
 * real editing engine (Lexical) rather than hand-rolling, since hand-rolling
 * `contentEditable` behavior correctly (selection, undo, paste, IME
 * composition) is a well-known trap. The toolbar stays in this system's
 * bitmap style; the content area intentionally does not — plain system
 * typography, since readability matters more than aesthetic consistency
 * once there's a paragraph of real prose to read.
 */
function RichTextEditorImpl({
  label,
  description,
  error,
  success,
  defaultValue,
  onChange,
  placeholder = "Start writing…",
  features,
  disabled,
  className,
  ...rest
}: RichTextEditorOwnProps & LayoutProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const resolvedFeatures = { ...ALL_FEATURES, ...features };
  const namespaceId = useId();

  const initialConfig: InitialConfigType = {
    namespace: `rich-text-editor-${namespaceId}`,
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    editable: !disabled,
    onError,
  };

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      description={description}
      error={error}
      success={success}
      hintKind={hintKind}
      hintId={hintId}
      disabled={disabled}
      layout={pickLayoutProps(rest)}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <Column
          gap="8"
          padding="8"
          className={[styles.editor, className].filter(Boolean).join(" ")}
        >
          <Toolbar features={resolvedFeatures} disabled={disabled} />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id={fieldId}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                aria-placeholder={placeholder}
                placeholder={
                  <Flex
                    display="block"
                    position="absolute"
                    top="8"
                    left="8"
                    className={styles.placeholder}
                  >
                    {placeholder}
                  </Flex>
                }
                className={styles.contentEditable}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialHtmlPlugin html={defaultValue} />
          {onChange && (
            <OnChangePlugin
              onChange={(_editorState, editor) => {
                editor.read(() => {
                  onChange($generateHtmlFromNodes(editor, null));
                });
              }}
            />
          )}
        </Column>
      </LexicalComposer>
    </FieldShell>
  );
}
RichTextEditorImpl.displayName = "RichTextEditor";

export const RichTextEditor = RichTextEditorImpl;
