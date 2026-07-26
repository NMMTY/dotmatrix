import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineCode } from "./InlineCode";

describe("InlineCode", () => {
  it("renders a real <code>", () => {
    render(<InlineCode>pnpm build</InlineCode>);
    expect(screen.getByText("pnpm build").tagName).toBe("CODE");
  });
});
