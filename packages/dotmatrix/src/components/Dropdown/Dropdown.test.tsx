import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown, DropdownItem } from "./Dropdown";

describe("Dropdown", () => {
  it("opens on click, navigates with ArrowDown, and closes on select", async () => {
    const onSelect = vi.fn();
    render(
      <Dropdown trigger={<button type="button">Actions</button>}>
        <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
        <DropdownItem>Delete</DropdownItem>
      </Dropdown>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    // The menu auto-focuses its first item as soon as it opens.
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus());

    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus());

    fireEvent.keyDown(menu, { key: "ArrowUp" });
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus());

    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
});
