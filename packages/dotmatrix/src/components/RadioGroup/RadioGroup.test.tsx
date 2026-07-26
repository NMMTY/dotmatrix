import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Radio } from "../Radio/Radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("labels the group via aria-labelledby, not aria-label (so the text isn't announced twice)", () => {
    render(
      <RadioGroup label="Plan" defaultValue="pro">
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-labelledby");
    expect(group).not.toHaveAttribute("aria-label");
  });
});
