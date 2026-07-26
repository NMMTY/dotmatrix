import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("opens on trigger click and closes on the close button", async () => {
    render(
      <Drawer trigger={<button type="button">Open drawer</button>} title="Settings" side="left" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
