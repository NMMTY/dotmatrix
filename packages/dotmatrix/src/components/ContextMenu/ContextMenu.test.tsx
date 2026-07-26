import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropdownItem } from "../Dropdown/Dropdown";
import { ContextMenu } from "./ContextMenu";

describe("ContextMenu", () => {
  it("opens on right-click and its items use the same DropdownItem wiring", async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu menu={<DropdownItem onSelect={onSelect}>Copy</DropdownItem>}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Right-click me"));
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Copy" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
