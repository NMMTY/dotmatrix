import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../Input/Input";
import { Fieldset } from "./Fieldset";

describe("Fieldset", () => {
  it("is a real <fieldset>/<legend>, and disables every descendant control at once", () => {
    render(
      <Fieldset legend="Contact" disabled>
        <Input label="Email" data-testid="email" />
      </Fieldset>,
    );
    expect(screen.getByText("Contact").tagName).toBe("LEGEND");
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});
