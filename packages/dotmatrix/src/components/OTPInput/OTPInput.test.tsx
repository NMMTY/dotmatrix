import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OTPInput } from "./OTPInput";

function getBoxes() {
  return screen.getAllByRole("textbox") as HTMLInputElement[];
}

describe("OTPInput", () => {
  it("renders `length` single-character boxes", () => {
    render(<OTPInput length={4} />);
    expect(getBoxes()).toHaveLength(4);
  });

  it("typing a digit fills the box and advances focus to the next one", () => {
    render(<OTPInput length={4} />);
    const boxes = getBoxes();
    fireEvent.change(boxes[0]!, { target: { value: "1" } });
    expect(boxes[0]).toHaveValue("1");
    expect(boxes[1]).toHaveFocus();
  });

  it("Backspace on an empty box clears and focuses the previous one", () => {
    render(<OTPInput length={4} defaultValue="12" />);
    const boxes = getBoxes();
    boxes[2]!.focus();
    fireEvent.keyDown(boxes[2]!, { key: "Backspace" });
    expect(boxes[1]).toHaveValue("");
    expect(boxes[1]).toHaveFocus();
  });

  it("pasting a full code distributes it across every box", () => {
    render(<OTPInput length={4} />);
    const boxes = getBoxes();
    fireEvent.paste(boxes[0]!, { clipboardData: { getData: () => "5678" } });
    expect(boxes.map((b) => b.value)).toEqual(["5", "6", "7", "8"]);
  });

  it("calls onComplete once every box is filled, not before", () => {
    const onComplete = vi.fn();
    render(<OTPInput length={2} onComplete={onComplete} />);
    const boxes = getBoxes();
    fireEvent.change(boxes[0]!, { target: { value: "1" } });
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(boxes[1]!, { target: { value: "2" } });
    expect(onComplete).toHaveBeenCalledWith("12");
  });

  it("strips non-digit characters", () => {
    render(<OTPInput length={4} />);
    const boxes = getBoxes();
    fireEvent.change(boxes[0]!, { target: { value: "a" } });
    expect(boxes[0]).toHaveValue("");
  });
});
