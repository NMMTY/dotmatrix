import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./Kbd";

describe("Kbd", () => {
  it("renders a real <kbd>", () => {
    render(<Kbd>⌘</Kbd>);
    expect(screen.getByText("⌘").tagName).toBe("KBD");
  });
});
