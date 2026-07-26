import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows after the hover delay and hides once the pointer leaves", async () => {
    render(
      <Tooltip content="Save your work">
        <button type="button">Save</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Save" });
    fireEvent.mouseEnter(trigger);
    expect(screen.queryByText("Save your work")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(300));
    await vi.waitFor(() => expect(screen.getByText("Save your work")).toBeInTheDocument());
    // useTransitionStyles flips "initial" -> "open" on the next animation
    // frame via flushSync; letting fake time move further ensures that
    // frame has actually run before the next interaction.
    act(() => vi.advanceTimersByTime(0));

    fireEvent.mouseLeave(trigger);
    await vi.waitFor(() => expect(screen.queryByText("Save your work")).not.toBeInTheDocument());
  });
});
