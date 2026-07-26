import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("opens on trigger click, traps focus, and closes on the close button", async () => {
    render(
      <Dialog trigger={<button type="button">Open dialog</button>} title="Confirm">
        <button type="button">Confirm</button>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Confirm");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes on Escape", async () => {
    render(<Dialog trigger={<button type="button">Open dialog</button>} title="Confirm" />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
