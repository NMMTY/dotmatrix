import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Consumer() {
  const { palette, setPalette, theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="palette">{palette}</span>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={() => setPalette("blue")}>
        set blue
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        set light
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-palette");
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults palette to mono and mirrors it onto <html data-palette>", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("palette")).toHaveTextContent("mono");
    expect(document.documentElement).toHaveAttribute("data-palette", "mono");
  });

  it("setPalette updates context state and the <html> attribute together", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    act(() => screen.getByRole("button", { name: "set blue" }).click());
    expect(screen.getByTestId("palette")).toHaveTextContent("blue");
    expect(document.documentElement).toHaveAttribute("data-palette", "blue");
  });

  it("accepts an initial palette other than the default", () => {
    render(
      <ThemeProvider palette="orange">
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("palette")).toHaveTextContent("orange");
  });

  it("throws when useTheme is called outside a ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Orphan() {
      useTheme();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
