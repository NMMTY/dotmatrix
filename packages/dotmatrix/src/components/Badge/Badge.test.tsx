import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a status dot only for non-neutral variants", () => {
    const { container: neutral } = render(<Badge variant="neutral">OK</Badge>);
    expect(neutral.querySelector("[aria-hidden]")).toBeNull();

    const { container: error } = render(<Badge variant="error">Down</Badge>);
    expect(error.querySelector("[aria-hidden]")).not.toBeNull();
  });
});
