"use client";

import { CodeBlock, Column, Input, NumberInput, Row, Select, Switch, Text } from "@nmmty/dotmatrix";
import { useState } from "react";
import { componentNeedsImageProxy, toProxiedImageSrc } from "../lib/imageProxy";
import { getComponentDoc, type PropDoc } from "../lib/manifest";
import { getRegistryEntry, type RegistryEntry } from "../lib/registry";

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  return `"${value}"`;
}

/** Renders the current control state as the JSX the preview above is actually running. */
function formatPropsAsJsx(
  entry: RegistryEntry,
  controllableProps: PropDoc[],
  values: Record<string, unknown>,
): string {
  const parts: string[] = [];
  for (const prop of controllableProps) {
    const value = values[prop.name];
    if (typeof value === "boolean") {
      if (String(value) === prop.defaultValue) continue;
      if (value) parts.push(prop.name);
      continue;
    }
    if (formatValue(value) === prop.defaultValue) continue;
    parts.push(`${prop.name}=${typeof value === "number" ? `{${value}}` : formatValue(value)}`);
  }
  const propsStr = parts.length ? ` ${parts.join(" ")}` : "";
  return entry.children !== undefined
    ? `<${entry.name}${propsStr}>\n  ...\n</${entry.name}>`
    : `<${entry.name}${propsStr} />`;
}

/**
 * Looks up its own registry entry client-side rather than receiving it as a
 * prop: a registry entry carries live component/function references
 * (`Component`, `wrapper`), which can't cross the server→client boundary as
 * props — only `name` (serializable) comes from the server page.
 */
export function Playground({ name }: { name: string }) {
  const entry = getRegistryEntry(name);
  const doc = getComponentDoc(name);
  const controllableProps: PropDoc[] =
    entry && doc
      ? doc.props.filter(
          (prop) =>
            prop.kind !== "readonly" && entry.props && Object.hasOwn(entry.props, prop.name),
        )
      : [];

  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...entry?.props }));

  if (!entry) return null;

  const Component = entry.Component;
  const previewProps = { ...entry.props, ...values };
  if (componentNeedsImageProxy(entry.name) && typeof previewProps.src === "string") {
    previewProps.src = toProxiedImageSrc(previewProps.src);
  }
  const rendered = (
    <Component {...previewProps}>
      {entry.children}
    </Component>
  );
  const code = formatPropsAsJsx(entry, controllableProps, values);

  const setValue = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <Column gap="16">
      <CodeBlock
        codes={[{ language: "tsx", code }]}
        preview={entry.wrapper ? entry.wrapper(rendered) : rendered}
      />
      {controllableProps.length > 0 && (
        <Row gap="16" wrap="wrap" alignItems="end">
          {controllableProps.map((prop) => (
            <Column key={prop.name} gap="4" style={{ minWidth: 160 }}>
              {prop.kind !== "boolean" && (
                <Text fontSize="xs" color="weak" uppercase tracking="wide">
                  {prop.name}
                </Text>
              )}
              {prop.kind === "boolean" && (
                <Switch
                  label={prop.name}
                  checked={!!values[prop.name]}
                  onChange={(e) => setValue(prop.name, e.target.checked)}
                />
              )}
              {prop.kind === "number" && (
                <NumberInput
                  value={Number(values[prop.name] ?? 0)}
                  onChange={(e) => setValue(prop.name, Number(e.target.value))}
                />
              )}
              {prop.kind === "select" && (
                <Select
                  value={String(values[prop.name] ?? "")}
                  onChange={(next) => setValue(prop.name, next)}
                  options={(prop.options ?? []).map((option) => ({
                    value: option,
                    label: option,
                  }))}
                />
              )}
              {prop.kind === "text" && (
                <Input
                  value={String(values[prop.name] ?? "")}
                  onChange={(e) => setValue(prop.name, e.target.value)}
                />
              )}
            </Column>
          ))}
        </Row>
      )}
    </Column>
  );
}
