import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type CommandItem, CommandPalette } from "./CommandPalette";

function items(overrides: Partial<CommandItem>[] = []): CommandItem[] {
  const base: CommandItem[] = [
    { id: "new-file", label: "New file", keywords: "create", onSelect: vi.fn() },
    { id: "open-file", label: "Open file", onSelect: vi.fn() },
    { id: "settings", label: "Settings", description: "App preferences", onSelect: vi.fn() },
  ];
  return overrides.length ? overrides.map((o, i) => ({ ...base[i]!, ...o })) : base;
}

describe("CommandPalette", () => {
  it("opens on trigger click and lists every item", async () => {
    render(
      <CommandPalette
        items={items()}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByText("New file")).toBeInTheDocument();
    expect(screen.getByText("Open file")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("filters by label, description, and keywords", async () => {
    render(
      <CommandPalette
        items={items()}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const input = await screen.findByRole("textbox");

    fireEvent.change(input, { target: { value: "create" } });
    expect(screen.getByText("New file")).toBeInTheDocument();
    expect(screen.queryByText("Open file")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "preferences" } });
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("New file")).not.toBeInTheDocument();
  });

  it("shows the empty message when nothing matches", async () => {
    render(
      <CommandPalette
        items={items()}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "nothing matches this" } });
    expect(screen.getByText("No matches.")).toBeInTheDocument();
  });

  it("runs the active item's onSelect on Enter and closes", async () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        items={items([{}, { onSelect }, {}])}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const input = await screen.findByRole("textbox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("runs an item's onSelect on click", async () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        items={items([{}, {}, { onSelect }])}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByText("Settings");
    fireEvent.click(screen.getByText("Settings"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("clusters items under their group label, leaving ungrouped items flat", async () => {
    render(
      <CommandPalette
        items={[
          { id: "a", label: "Item A", group: "Actions", onSelect: vi.fn() },
          { id: "b", label: "Item B", group: "Actions", onSelect: vi.fn() },
          { id: "c", label: "Item C", onSelect: vi.fn() },
        ]}
        trigger={<button type="button">Open</button>}
        hotkey={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
  });

  it("opens on the Cmd/Ctrl+K hotkey by default", async () => {
    render(<CommandPalette items={items()} />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("does not open on the hotkey when hotkey is disabled", () => {
    render(<CommandPalette items={items()} hotkey={null} />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("matches the hotkey case-insensitively, however it's cased", async () => {
    render(<CommandPalette items={items()} hotkey="K" />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });
});
