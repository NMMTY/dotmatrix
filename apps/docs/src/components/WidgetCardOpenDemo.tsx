"use client";

import { WidgetCard } from "@nmmty/dotmatrix";

/** `onOpen` is a function, so it can't be written inline in the (server-rendered) mdx. */
export function WidgetCardOpenDemo() {
  return (
    <WidgetCard
      title="Toronto"
      value="5°"
      caption="overcast clouds"
      footer="Feels like 1°."
      onOpen={() => {}}
      openLabel="Open Toronto forecast"
    />
  );
}
