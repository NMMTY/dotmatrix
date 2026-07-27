import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("shows the first instance's code by default and switches on tab click", async () => {
    render(
      <CodeBlock
        codes={[
          { code: "const a = 1;", language: "typescript", label: "TS" },
          { code: "echo hi", language: "bash", label: "Shell" },
        ]}
      />,
    );

    expect(await screen.findByText("const a = 1;")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Shell" }));
    expect(await screen.findByText("echo hi")).toBeInTheDocument();
    expect(screen.queryByText("const a = 1;")).not.toBeInTheDocument();
  });

  it("copies the current code to the clipboard and reflects it in the button's label", async () => {
    render(<CodeBlock codes={[{ code: "echo hi", language: "bash" }]} />);

    const button = await screen.findByRole("button", { name: "Copy code" });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("echo hi");
    expect(await screen.findByRole("button", { name: "Copied!" })).toBeInTheDocument();
  });

  it('collapses past maxLines and expands on "View code"', async () => {
    const code = "line1\nline2\nline3\nline4\nline5";
    render(<CodeBlock codes={[{ code, language: "text" }]} isCollapsible maxLines={2} />);

    expect(await screen.findByRole("button", { name: "View code" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View code" }));
    expect(screen.queryByRole("button", { name: "View code" })).not.toBeInTheDocument();
  });

  it("does not show a collapse bar when the code fits within maxLines", async () => {
    render(
      <CodeBlock codes={[{ code: "one line", language: "text" }]} isCollapsible maxLines={5} />,
    );

    await screen.findByText("one line");
    expect(screen.queryByRole("button", { name: "View code" })).not.toBeInTheDocument();
  });

  it("opens and closes fullscreen mode", async () => {
    render(<CodeBlock codes={[{ code: "echo hi", language: "bash" }]} fullscreenButton />);

    const openButton = await screen.findByRole("button", { name: "Fullscreen" });
    fireEvent.click(openButton);

    const closeButton = await screen.findByRole("button", { name: "Exit fullscreen" });
    fireEvent.click(closeButton);

    expect(await screen.findByRole("button", { name: "Fullscreen" })).toBeInTheDocument();
  });
});
