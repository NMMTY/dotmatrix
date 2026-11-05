import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SegmentHeader } from "./SegmentHeader";

describe("SegmentHeader", () => {
  it("renders 14 segments by default, all lit", () => {
    const { container } = render(<SegmentHeader />);
    expect(container.querySelectorAll("[data-lit]")).toHaveLength(14);
  });

  it("lights only the requested number of segments", () => {
    const { container } = render(<SegmentHeader segments={10} filled={4} />);
    expect(container.querySelectorAll("[data-lit]")).toHaveLength(4);
  });

  it("clamps filled into 0..segments", () => {
    const { container } = render(<SegmentHeader segments={5} filled={99} />);
    expect(container.querySelectorAll("[data-lit]")).toHaveLength(5);
  });

  it("is a labelled meter when label is given", () => {
    render(<SegmentHeader label="Quota" segments={10} filled={3} />);
    const meter = screen.getByRole("meter", { name: "Quota" });
    expect(meter).toHaveAttribute("aria-valuenow", "3");
    expect(meter).toHaveAttribute("aria-valuemax", "10");
  });

  it("is hidden from assistive tech without a label", () => {
    const { container } = render(<SegmentHeader />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
