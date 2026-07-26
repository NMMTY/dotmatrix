import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function Harness() {
    const { show } = useToast();
    return (
      <button type="button" onClick={() => show({ title: "Saved", duration: 1000 })}>
        Trigger
      </button>
    );
  }

  it("shows a toast, auto-dismisses after its duration, and can be dismissed early", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    act(() => fireEvent.click(screen.getByRole("button", { name: "Trigger" })));
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    await vi.waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
  });

  it("plays the exit animation before removing the toast on manual dismiss, not instantly", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    // Still present immediately after — it's mid exit-animation, not yet removed.
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(150));
    await vi.waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
  });

  it("throws when useToast is called outside a ToastProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Orphan() {
      useToast();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
