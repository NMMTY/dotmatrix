import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("opens on trigger click and closes on Escape", async () => {
    render(
      <Popover trigger={<button type="button">Open</button>}>
        <p>Popover content</p>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(screen.getByText("Popover content")).toBeInTheDocument());

    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByText("Popover content")).not.toBeInTheDocument());
  });
});
