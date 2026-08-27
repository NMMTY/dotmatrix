import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Stepper } from "./Stepper";

const STEPS = [
  { label: "Account", description: "Create your login" },
  { label: "Profile", description: "Tell us about you" },
  { label: "Confirm", description: "Review and finish" },
];

describe("Stepper", () => {
  it("renders every step's label", () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("marks the active step with aria-current", () => {
    render(<Stepper steps={STEPS} defaultStep={1} />);
    const markers = screen.getAllByRole("button");
    expect(markers[1]).toHaveAttribute("aria-current", "step");
    expect(markers[0]).not.toHaveAttribute("aria-current");
    expect(markers[2]).not.toHaveAttribute("aria-current");
  });

  it("shows a check icon on completed steps instead of a number", () => {
    render(<Stepper steps={STEPS} defaultStep={2} />);
    const markers = screen.getAllByRole("button");
    expect(markers[0]?.querySelector("svg")).toBeInTheDocument();
    expect(markers[1]?.querySelector("svg")).toBeInTheDocument();
    expect(markers[2]).toHaveTextContent("3");
  });

  it("gives every marker an accessible name even when its visible content is icon-only", () => {
    render(<Stepper steps={STEPS} defaultStep={2} />);
    expect(
      screen.getByRole("button", { name: "Step 1 of 3: Account (complete)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Step 3 of 3: Confirm (current)" }),
    ).toBeInTheDocument();
  });

  it("disables steps ahead of the current one", () => {
    render(<Stepper steps={STEPS} defaultStep={0} />);
    const markers = screen.getAllByRole("button");
    expect(markers[0]).not.toBeDisabled();
    expect(markers[1]).toBeDisabled();
    expect(markers[2]).toBeDisabled();
  });

  it("lets clicking a visited step jump back to it", () => {
    const onStepChange = vi.fn();
    render(<Stepper steps={STEPS} defaultStep={2} onStepChange={onStepChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it("ignores clicks when allowNavigation is false", () => {
    const onStepChange = vi.fn();
    render(
      <Stepper steps={STEPS} defaultStep={2} allowNavigation={false} onStepChange={onStepChange} />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("renders Back/Next controls and advances with Next", () => {
    const onStepChange = vi.fn();
    render(<Stepper steps={STEPS} defaultStep={0} showControls onStepChange={onStepChange} />);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("shows Finish on the last step and calls onFinish", () => {
    const onFinish = vi.fn();
    render(<Stepper steps={STEPS} defaultStep={2} showControls onFinish={onFinish} />);
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onFinish).toHaveBeenCalled();
  });

  it("manages its own step state when uncontrolled", () => {
    render(<Stepper steps={STEPS} defaultStep={0} showControls />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("button")[1]).toHaveAttribute("aria-current", "step");
  });
});
