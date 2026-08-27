import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichTextEditor } from "./RichTextEditor";

// Simulating real typing into a `contentEditable` in jsdom is a well-known
// pain point across the whole React rich-text ecosystem (jsdom has no real
// selection/caret rendering) — these tests cover what's reliably verifiable
// here: rendering, prop-driven toolbar visibility, and initial content
// parsing. The actual typing/formatting/undo behavior is covered by live
// browser verification instead, the same split used for ImageEditor's
// pointer-drag interactions.
describe("RichTextEditor", () => {
  it("renders every toolbar tool by default", () => {
    render(<RichTextEditor label="Body" />);
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "U" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "H1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "• List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1. List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Link" })).toBeInTheDocument();
  });

  it("hides tools per the features prop", () => {
    render(
      <RichTextEditor
        label="Body"
        features={{ heading: false, quote: false, link: false, numberedList: false }}
      />,
    );
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "H1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Quote" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Link" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "1. List" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "• List" })).toBeInTheDocument();
  });

  it("shows the placeholder when empty", () => {
    render(<RichTextEditor label="Body" placeholder="Write something…" />);
    expect(screen.getByText("Write something…")).toBeInTheDocument();
  });

  it("parses defaultValue HTML into initial content", async () => {
    render(<RichTextEditor label="Body" defaultValue="<p>Hello <strong>world</strong></p>" />);
    await waitFor(() => expect(screen.getByText("Hello", { exact: false })).toBeInTheDocument());
    expect(screen.queryByText("Write something…")).not.toBeInTheDocument();
  });

  it("disables the content area and toolbar buttons when disabled", async () => {
    const { container } = render(<RichTextEditor label="Body" defaultValue="<p>Hi</p>" disabled />);
    await waitFor(() =>
      expect(container.querySelector('[contenteditable="false"]')).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "B" })).toBeDisabled();
  });

  it("associates the label with the content area via the field id", () => {
    render(<RichTextEditor label="Body" />);
    const label = screen.getByText("Body");
    const contentEditable = screen.getByRole("textbox");
    expect(label.getAttribute("for")).toBe(contentEditable.id);
  });
});
