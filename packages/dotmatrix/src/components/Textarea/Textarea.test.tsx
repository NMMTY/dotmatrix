import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("connects label and error the same way as Input", () => {
    render(<Textarea label="Bio" error="Too long" />);
    const textarea = screen.getByLabelText("Bio");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Too long");
  });
});
